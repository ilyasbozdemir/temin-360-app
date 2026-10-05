import AdmZip from 'adm-zip'
import Database from 'better-sqlite3'
import { app, BrowserWindow } from 'electron'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { initializeDatabase } from '../index'
import { runMigrations, CURRENT_SCHEMA_VERSION, getPendingMigrations } from '@dt/database'
import tasinirKodlariSeed from '../seed/tasinir_kodlari.json'
import { allExtensions, defaultFormat } from '../../config/fileFormats'
import {
  WorkspaceMeta,
  MutationSummaryItem,
  calculateIntegrityHash,
  normalizeMeta,
  extractDbInfo,
  TABLE_FRIENDLY_NAMES
} from './types'
import { ensureSchemaIntegrity } from './schemaIntegrity'
import { seedTemplates } from './templateSeeder'

export class DtmWorkspace {
  private tempDir: string
  private db: Database.Database | null = null
  private currentFilePath: string | null = null
  private meta: WorkspaceMeta | null = null
  private initialHash: string = ''
  private initialDataVersion: number = 0
  private userMutationCount: number = 0
  private isDirty: boolean = false
  private mutationMap: Map<string, MutationSummaryItem> = new Map()
  private lastMutationTime: string | null = null

  constructor() {
    this.tempDir = path.join(app.getPath('userData'), 'dtm_temp', Date.now().toString())
  }

  public openWorkspace(filePath: string, allowMigration: boolean = false): WorkspaceMeta {
    filePath = filePath.replace(/^"+|"+$/g, '').trim()
    if (!fs.existsSync(filePath)) {
      throw new Error(`Dosya bulunamadı: ${filePath}`)
    }

    const lockPath = filePath + '.lock'
    if (fs.existsSync(lockPath)) {
      try {
        const pidStr = fs.readFileSync(lockPath, 'utf-8')
        const pid = parseInt(pidStr, 10)
        if (!isNaN(pid) && pid !== process.pid) {
          let isRunning = false
          try {
            process.kill(pid, 0)
            isRunning = true
          } catch {
            isRunning = false
          }
          if (!isRunning) {
            fs.unlinkSync(lockPath)
          } else {
            throw new Error(
              'LOCKED|Bu dosya şu anda başka bir pencerede veya programda açık durumda. Çakışmayı önlemek için önce diğer taraftan kapatmalısınız.'
            )
          }
        }
      } catch (err: any) {
        if (err.message?.startsWith('LOCKED|')) throw err
      }
    }

    try {
      fs.writeFileSync(lockPath, process.pid.toString(), { encoding: 'utf-8' })
    } catch (err: any) {
      throw new Error(`Kilit dosyası oluşturulamadı: ${err.message}`)
    }

    this.currentFilePath = filePath
    this.ensureTempDir()

    const zipBuffer = fs.readFileSync(filePath)
    if (zipBuffer.length === 0) {
      if (fs.existsSync(lockPath)) fs.unlinkSync(lockPath)
      return this.createWorkspace(filePath, 'Yeni Kurum')
    }

    const metaPath = path.join(this.tempDir, 'meta.json')
    let rawMeta: any = {}
    const headerPrefix = zipBuffer.subarray(0, Math.min(zipBuffer.length, 512)).toString('latin1')
    const isRawSqlite = headerPrefix.includes('SQLite format 3')

    if (isRawSqlite) {
      const targetDb = path.join(this.tempDir, 'database.sqlite')
      fs.copyFileSync(filePath, targetDb)
      const dbInfo = extractDbInfo(targetDb, path.basename(filePath, path.extname(filePath)))
      rawMeta = {
        dtal_version: '1.0',
        schema_version: dbInfo.schemaVersion,
        institution_name: dbInfo.institutionName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        active_db_file: 'database.sqlite'
      }
      fs.writeFileSync(metaPath, JSON.stringify(rawMeta, null, 2))
    } else {
      try {
        const zip = new AdmZip(zipBuffer)
        zip.extractAllTo(this.tempDir, true)
      } catch {
        const targetDb = path.join(this.tempDir, 'database.sqlite')
        fs.copyFileSync(filePath, targetDb)
        const dbInfo = extractDbInfo(targetDb, path.basename(filePath, path.extname(filePath)))
        rawMeta = {
          dtal_version: '1.0',
          schema_version: dbInfo.schemaVersion,
          institution_name: dbInfo.institutionName,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          active_db_file: 'database.sqlite'
        }
        fs.writeFileSync(metaPath, JSON.stringify(rawMeta, null, 2))
      }

      if (fs.existsSync(metaPath)) {
        rawMeta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'))
      }
    }

    const attachmentsDir = path.join(this.tempDir, 'attachments')
    if (!fs.existsSync(attachmentsDir)) {
      fs.mkdirSync(attachmentsDir, { recursive: true })
    }

    const meta = normalizeMeta(rawMeta)
    const fromVersion = meta.schema_version || 1

    if (fromVersion < CURRENT_SCHEMA_VERSION) {
      if (!allowMigration) {
        const pendingUpdates = getPendingMigrations(fromVersion)
        if (pendingUpdates.length > 0) {
          const payload = JSON.stringify({
            requiresMigration: true,
            pendingUpdates,
            last_user_mutation_at: meta.last_user_mutation_at
          })
          throw new Error(`MIGRATION_REQUIRED|${payload}`)
        }
      }
      const dbFileName = meta.active_db_file || 'database.sqlite'
      const dbPath = path.join(this.tempDir, dbFileName)
      this.db = new Database(dbPath)
      const previousUserMutationAt = meta.last_user_mutation_at
      runMigrations(this.db, fromVersion, null as any)
      ensureSchemaIntegrity(this.db)
      meta.schema_version = CURRENT_SCHEMA_VERSION
      meta.updated_at = new Date().toISOString()
      // Schema migration does NOT alter user mutation timestamp!
      meta.last_user_mutation_at = previousUserMutationAt
      meta.integrity_hash = calculateIntegrityHash(meta)
      fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2))
      this.saveWorkspace()
    } else {
      const dbFileName = meta.active_db_file || 'database.sqlite'
      const dbPath = path.join(this.tempDir, dbFileName)
      this.db = new Database(dbPath)
    }

    if (this.db) {
      ensureSchemaIntegrity(this.db)
      seedTemplates(this.db)
    }

    this.meta = meta
    this.initialHash = this.calculateCurrentHash()
    this.initialDataVersion = this.getDataVersion()
    this.userMutationCount = 0
    this.mutationMap.clear()
    this.lastMutationTime = null
    this.isDirty = false
    this.notifyDirtyChange(false)
    return meta
  }

  public createWorkspace(filePath: string, institutionName: string): WorkspaceMeta {
    const ext = path.extname(filePath).toLowerCase().replace(/^\./, '')
    if (!ext || !allExtensions.includes(ext)) {
      const base = ext ? filePath.substring(0, filePath.length - (ext.length + 1)) : filePath
      filePath = `${base}.${defaultFormat.ext}`
    }
    const lockPath = filePath + '.lock'
    try {
      fs.writeFileSync(lockPath, process.pid.toString(), { encoding: 'utf-8' })
    } catch {}

    try {
      this.currentFilePath = filePath
      this.ensureTempDir()
      const dbPath = path.join(this.tempDir, 'database.sqlite')
      this.db = new Database(dbPath)
      initializeDatabase(this.db, institutionName)

      try {
        const insertStmt = this.db.prepare(`
          INSERT OR IGNORE INTO TANIM_TasinirKod (tam_kod, hesap_kodu, duzey_1, duzey_2, duzey_3, duzey_4, duzey_5, aciklama)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `)
        const seedTx = this.db.transaction((rows: any[]) => {
          for (const row of rows) {
            insertStmt.run(row.tam_kod, row.hesap_kodu, row.duzey_1, row.duzey_2, row.duzey_3, row.duzey_4, row.duzey_5, row.aciklama)
          }
        })
        seedTx(tasinirKodlariSeed)
      } catch {}

      const meta: WorkspaceMeta = {
        dtal_version: '1.0',
        app_version: app.getVersion(),
        created_at: new Date().toISOString().split('T')[0],
        institution: institutionName,
        schema_version: CURRENT_SCHEMA_VERSION,
        platform: process.platform,
        file_version: 1,
        active_db_file: 'database.sqlite',
        updated_at: new Date().toISOString(),
        warnings: []
      }
      meta.integrity_hash = calculateIntegrityHash(meta)
      const metaPath = path.join(this.tempDir, 'meta.json')
      fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2))
      fs.mkdirSync(path.join(this.tempDir, 'attachments'))
      seedTemplates(this.db)
      this.saveWorkspace()
      this.meta = meta
      this.initialHash = this.calculateCurrentHash()
      this.initialDataVersion = this.getDataVersion()
      this.resetDirty()
      return meta
    } catch (createErr) {
      if (fs.existsSync(lockPath)) try { fs.unlinkSync(lockPath) } catch {}
      this.currentFilePath = null
      throw createErr
    }
  }

  public saveWorkspace(force: boolean = false): void {
    if (!this.currentFilePath || !this.db) throw new Error('Hiçbir veri dosyası açık değil.')
    if (!force && !this.isDirtyState()) return

    try { this.db.pragma('wal_checkpoint(TRUNCATE)') } catch {}
    const metaPath = path.join(this.tempDir, 'meta.json')
    if (fs.existsSync(metaPath)) {
      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8')) as WorkspaceMeta
      meta.updated_at = new Date().toISOString()
      meta.app_version = app.getVersion()
      meta.platform = process.platform
      meta.integrity_hash = calculateIntegrityHash(meta)
      fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2))
      this.meta = meta
    }

    const zip = new AdmZip()
    zip.addLocalFolder(this.tempDir)
    zip.writeZip(this.currentFilePath)
    this.initialHash = this.calculateCurrentHash()
    this.resetDirty()
  }

  public convertToTemin(): { success: boolean; newPath?: string; error?: string } {
    if (!this.currentFilePath || !this.db) return { success: false, error: 'Açık bir çalışma alanı yok.' }
    if (this.currentFilePath.toLowerCase().endsWith('.temin')) {
      this.saveWorkspace()
      return { success: true, newPath: this.currentFilePath }
    }
    const dir = path.dirname(this.currentFilePath)
    const baseName = path.basename(this.currentFilePath, path.extname(this.currentFilePath))
    const newPath = path.join(dir, `${baseName}.temin`)
    this.currentFilePath = newPath
    this.saveWorkspace()
    return { success: true, newPath }
  }

  public saveAs(targetFilePath: string): { success: boolean; newPath?: string; error?: string } {
    if (!this.currentFilePath || !this.db) return { success: false, error: 'Açık bir çalışma alanı yok.' }
    const newPath = targetFilePath.toLowerCase().endsWith('.temin') ? targetFilePath : `${targetFilePath}.temin`
    this.currentFilePath = newPath
    this.saveWorkspace()
    return { success: true, newPath }
  }

  public closeWorkspace(): void {
    if (this.db) { this.db.close(); this.db = null }
    if (this.currentFilePath) {
      const lockPath = this.currentFilePath + '.lock'
      if (fs.existsSync(lockPath)) try { fs.unlinkSync(lockPath) } catch {}
    }
    this.currentFilePath = null
    this.meta = null
    if (fs.existsSync(this.tempDir)) fs.rmSync(this.tempDir, { recursive: true, force: true })
  }

  public replaceDatabase(sourceSqlitePath: string): void {
    if (!this.currentFilePath || !this.db || !this.meta) throw new Error('Açık bir çalışma alanı yok.')
    this.db.close()
    const newDbName = `database_${Date.now()}.sqlite`
    const dbPath = path.join(this.tempDir, newDbName)
    fs.copyFileSync(sourceSqlitePath, dbPath)
    this.meta.active_db_file = newDbName
    this.db = new Database(dbPath)
    this.db.pragma('journal_mode = WAL')
    this.db.pragma('foreign_keys = ON')
    ensureSchemaIntegrity(this.db)
    this.saveWorkspace()
  }

  public getDb(): Database.Database {
    if (!this.db) throw new Error('Veritabanı bağlı değil.')
    return this.db
  }
  public getDbPath(): string {
    if (!this.tempDir) throw new Error('Geçici dizin yok.')
    return path.join(this.tempDir, this.meta?.active_db_file || 'database.sqlite')
  }
  public getMeta(): WorkspaceMeta | null { return this.meta }
  public getCurrentFilePath(): string | null { return this.currentFilePath }

  public calculateCurrentHash(): string {
    if (!this.db || !this.tempDir) return ''
    try {
      try { this.db.pragma('wal_checkpoint(TRUNCATE)') } catch {}
      const dbPath = path.join(this.tempDir, this.meta?.active_db_file || 'database.sqlite')
      if (!fs.existsSync(dbPath)) return ''
      const content = fs.readFileSync(dbPath)
      const hash = crypto.createHash('sha256').update(content)
      const attachDir = path.join(this.tempDir, 'attachments')
      if (fs.existsSync(attachDir)) {
        for (const f of fs.readdirSync(attachDir).sort()) {
          try {
            const stat = fs.statSync(path.join(attachDir, f))
            hash.update(`${f}:${stat.size}:${stat.mtimeMs}`)
          } catch {}
        }
      }
      return hash.digest('hex')
    } catch { return '' }
  }

  public getDataVersion(): number {
    if (!this.db) return 0
    try {
      const row = this.db.prepare('PRAGMA data_version').get() as { data_version?: number }
      return row?.data_version ?? 0
    } catch { return 0 }
  }

  public recordMutation(tableName?: string, action?: string, count: number = 1): void {
    const table = tableName || 'Veritabanı'
    const tableUpper = table.toUpperCase()
    if (
      ['LOG_SYSTEMLOG', 'SETTINGS', 'SCHEMA_MIGRATIONS', 'SQLITE_SEQUENCE', 'TANIM_SABLON', 'TANIM_DETSISCACHE', 'TANIM_TASINIRKOD', 'TANIM_KIKLIMITLERI'].includes(tableUpper) ||
      tableUpper.startsWith('SYS_') || tableUpper.startsWith('TEMP_')
    ) {
      return
    }
    this.userMutationCount += count
    this.isDirty = true
    const nowIso = new Date().toISOString()
    if (this.meta) {
      this.meta.last_user_mutation_at = nowIso
    }
    this.lastMutationTime = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    const act = (action as 'insert' | 'update' | 'delete' | 'other') || 'other'
    const key = `${table}_${act}`
    const existing = this.mutationMap.get(key)
    if (existing) {
      existing.count += count
      existing.lastTime = this.lastMutationTime
    } else {
      this.mutationMap.set(key, {
        tableName: table,
        title: TABLE_FRIENDLY_NAMES[table] || table,
        action: act,
        actionLabel: act === 'insert' ? 'Yeni Kayıt Eklendi' : act === 'update' ? 'Bilgiler Güncellendi' : act === 'delete' ? 'Kayıt Silindi' : 'Veri Düzenlendi',
        count,
        lastTime: this.lastMutationTime
      })
    }
    this.notifyDirtyChange(true)
  }

  public isDirtyState(): boolean { return !!(this.db && this.currentFilePath && this.isDirty && this.userMutationCount > 0) }

  public resetDirty(): void {
    this.isDirty = false
    this.userMutationCount = 0
    this.mutationMap.clear()
    this.lastMutationTime = null
    this.initialDataVersion = this.getDataVersion()
    this.initialHash = this.calculateCurrentHash()
    this.notifyDirtyChange(false)
  }

  public getDirtySummary() {
    const isDirty = this.isDirtyState()
    const items = Array.from(this.mutationMap.values())
    if (isDirty && items.length === 0) {
      items.push({
        tableName: 'Veritabanı',
        title: 'Çalışma Dosyası Değişiklikleri',
        action: 'other',
        actionLabel: 'Düzenlendi',
        count: Math.max(this.userMutationCount, 1),
        lastTime: this.lastMutationTime || 'Az önce'
      })
    }
    return {
      isDirty,
      totalChanges: isDirty ? Math.max(this.userMutationCount, items.reduce((acc, it) => acc + (it.count || 1), 0), 1) : 0,
      lastModifiedAt: this.lastMutationTime,
      items: isDirty ? items : []
    }
  }

  public notifyDirtyChange(dirty: boolean): void {
    try {
      for (const win of BrowserWindow.getAllWindows()) {
        if (!win.isDestroyed()) {
          win.webContents.send('workspace:dirty-changed', dirty)
          if (this.currentFilePath) {
            win.setTitle(`${dirty ? '● ' : ''}${path.basename(this.currentFilePath)} - TEMİN 360`)
          }
        }
      }
    } catch {}
  }

  public hasChanges(target: 'gdrive' | 'email' | 'any' = 'any'): boolean {
    if (!this.db || !this.currentFilePath) return false
    const current = this.calculateCurrentHash()
    if (!current) return false
    if (target === 'gdrive' || target === 'email') {
      try {
        const key = target === 'gdrive' ? 'lastGdriveSyncHash' : 'lastEmailSyncHash'
        const row = this.db.prepare(`SELECT value FROM settings WHERE key = ?`).get(key) as { value?: string }
        if (row?.value) return row.value !== current
      } catch {}
      return true
    }
    if (this.isDirtyState()) return true
    return current !== this.initialHash
  }

  public markSynced(target: 'gdrive' | 'email'): void {
    if (!this.db) return
    const current = this.calculateCurrentHash()
    if (!current) return
    try {
      const key = target === 'gdrive' ? 'lastGdriveSyncHash' : 'lastEmailSyncHash'
      this.db.prepare(`INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`).run(key, current)
    } catch {}
  }

  public isOpen(): boolean { return !!this.db }

  private ensureTempDir() {
    if (fs.existsSync(this.tempDir)) fs.rmSync(this.tempDir, { recursive: true, force: true })
    fs.mkdirSync(this.tempDir, { recursive: true })
  }
}

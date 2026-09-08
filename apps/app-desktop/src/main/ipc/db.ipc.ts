import { ipcMain, dialog } from 'electron'
import fs from 'fs'
import * as XLSX from 'xlsx'
import { workspaceManager, ensureSchemaIntegrity } from '../database/workspace'
import { validateSqlQuery } from './utils/sqlGuard'
import { withSchemaRetry } from './utils/schemaRetry'

export function registerDbIpcHandlers(): void {
  // 1. SELECT query handler
  ipcMain.handle('db:query', async (_, sql: string, params: any[] = []) => {
    try {
      validateSqlQuery(sql, params)
      const executeQuery = async () => {
        const db = workspaceManager.getDb()
        const stmt = db.prepare(sql)
        const rows = stmt.all(...params)
        return { success: true, data: rows }
      }

      return await withSchemaRetry(executeQuery, async () => {
        const db = workspaceManager.getDb()
        ensureSchemaIntegrity(db)
      })
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // 2. INSERT, UPDATE, DELETE run handler
  ipcMain.handle('db:run', async (_, sql: string, params: any[] = []) => {
    try {
      validateSqlQuery(sql, params)
      const executeRun = async () => {
        const db = workspaceManager.getDb()
        const stmt = db.prepare(sql)
        const info = stmt.run(...params)
        workspaceManager.save()
        return { success: true, lastInsertRowid: info.lastInsertRowid, changes: info.changes }
      }

      return await withSchemaRetry(executeRun, async () => {
        const db = workspaceManager.getDb()
        ensureSchemaIntegrity(db)
      })
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // 3. Alternative statement execution handler
  ipcMain.handle('db:execute', async (_, sql: string, ...params: any[]) => {
    try {
      const actualParams = params.length === 1 && Array.isArray(params[0]) ? params[0] : params
      validateSqlQuery(sql, actualParams)
      const executeStmt = async () => {
        const db = workspaceManager.getDb()
        const stmt = db.prepare(sql)
        const info = stmt.run(...actualParams)
        workspaceManager.save()
        return { success: true, lastInsertRowid: info.lastInsertRowid, changes: info.changes }
      }

      return await withSchemaRetry(executeStmt, async () => {
        const db = workspaceManager.getDb()
        ensureSchemaIntegrity(db)
      })
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // 4. Multi-query Transaction Handler
  ipcMain.handle('db:transaction', async (_, queries: { sql: string; params: any[] }[]) => {
    try {
      const db = workspaceManager.getDb()
      for (const q of queries) {
        validateSqlQuery(q.sql, q.params)
      }

      let lastInsertRowid: number | bigint = 0
      let totalChanges = 0

      const transaction = db.transaction((stmts: { sql: string; params: any[] }[]) => {
        for (const q of stmts) {
          const stmt = db.prepare(q.sql)
          const info = stmt.run(...q.params)
          lastInsertRowid = info.lastInsertRowid
          totalChanges += info.changes
        }
      })

      transaction(queries)
      workspaceManager.save()

      return { success: true, lastInsertRowid, changes: totalChanges }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // 5. Settings Handler (Sanitized Public Settings Retrieval - Option 1)
  ipcMain.handle('db:get-settings', async () => {
    try {
      const db = workspaceManager.getDb()
      const rows = db.prepare('SELECT key, value FROM settings').all() as {
        key: string
        value: string
      }[]
      const settingsObj: Record<string, string> = {}
      for (const row of rows) {
        // Do not leak raw password hashes/secrets in default settings query if not authenticated
        if (row.key !== 'adminPassword') {
          settingsObj[row.key] = row.value
        }
      }

      return {
        activeKurumId: settingsObj.activeKurumId || '1',
        institutionName: settingsObj.institutionName || 'Bilinmeyen Kurum',
        institutionLogo: settingsObj.institutionLogo || null,
        logoLeft: settingsObj.logoLeft || null,
        logoRight: settingsObj.logoRight || null,
        adminName: settingsObj.adminName || 'Sistem Yöneticisi',
        adminTitle: settingsObj.adminTitle || 'Destek Sorumlusu',
        adminUsername: settingsObj.adminUsername || 'admin',
        eButceKodu: settingsObj.eButceKodu || '',
        say2000iKodu: settingsObj.say2000iKodu || '',
        themeLightVars: settingsObj.themeLightVars || '',
        themeDarkVars: settingsObj.themeDarkVars || '',
        ...settingsObj
      }
    } catch {
      return {
        activeKurumId: '1',
        institutionName: null,
        institutionLogo: null,
        logoLeft: null,
        logoRight: null,
        adminName: 'Sistem Yöneticisi',
        adminTitle: 'Destek Sorumlusu',
        adminUsername: 'admin',
        eButceKodu: '',
        say2000iKodu: '',
        themeLightVars: '',
        themeDarkVars: ''
      }
    }
  })

  // 6. Check Auth Setup Handler
  ipcMain.handle('db:check-auth-setup', async () => {
    try {
      const db = workspaceManager.getDb()
      const userRow = db
        .prepare("SELECT value FROM settings WHERE key = 'adminUsername'")
        .get() as { value: string } | undefined
      const passRow = db
        .prepare("SELECT value FROM settings WHERE key = 'adminPassword'")
        .get() as { value: string } | undefined

      const hasUser = !!userRow?.value
      const hasPass = !!passRow?.value

      return { hasCredentials: hasUser && hasPass }
    } catch (error: any) {
      console.error('Check auth setup error:', error)
      return { hasCredentials: false, error: error.message }
    }
  })

  // 7. Setup Auth Handler
  ipcMain.handle('db:setup-auth', async (_, code: string, user: string, pass: string) => {
    try {
      const db = workspaceManager.getDb()
      const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)')
      stmt.run('eButceKodu', code)
      stmt.run('adminUsername', user)
      stmt.run('adminPassword', pass)
      workspaceManager.save()
      return { success: true }
    } catch (error: any) {
      console.error('Setup auth error:', error)
      return { success: false, error: error.message }
    }
  })

  // 8. Login Handler
  ipcMain.handle('db:login', async (_, _code: string, user: string, pass: string) => {
    try {
      const db = workspaceManager.getDb()
      const userRow = db
        .prepare("SELECT value FROM settings WHERE key = 'adminUsername'")
        .get() as { value: string } | undefined
      const passRow = db
        .prepare("SELECT value FROM settings WHERE key = 'adminPassword'")
        .get() as { value: string } | undefined

      const expectedUser = userRow?.value || ''
      const expectedPass = passRow?.value || ''

      if (user === expectedUser && pass === expectedPass) {
        return { success: true }
      }
      return { success: false, error: 'Kullanıcı adı veya şifre hatalı!' }
    } catch (error: any) {
      console.error('Login error:', error)
      return { success: false, error: error.message }
    }
  })

  // 9. Save Settings Handler
  ipcMain.handle('db:save-settings', async (_, settingsMap: Record<string, string>) => {
    try {
      const db = workspaceManager.getDb()
      const insertStmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)')
      const transaction = db.transaction((settings: Record<string, string>) => {
        for (const [key, value] of Object.entries(settings)) {
          insertStmt.run(key, value)
        }
      })
      transaction(settingsMap)
      workspaceManager.save()
      return { success: true }
    } catch (error: any) {
      console.error('Save settings error:', error)
      return { success: false, error: error.message }
    }
  })

  // 10. Malzeme Listesi (TANIM_Kalem) Excel Dışa Aktar
  ipcMain.handle('db:export-kalem-excel', async () => {
    try {
      const db = workspaceManager.getDb()
      const rows = db
        .prepare(
          'SELECT barkod_id, tasinir_kodu, okas_kodu, kalem_adi, tipi, birim, kategori, ozelligi, kdv_orani, mensei, notlar FROM TANIM_Kalem WHERE aktif_mi = 1 OR aktif_mi IS NULL ORDER BY id ASC'
        )
        .all() as any[]

      const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'Malzeme Listesi (Excel)',
        defaultPath: 'Malzeme_Listesi.xlsx',
        filters: [{ name: 'Excel Dosyası', extensions: ['xlsx'] }]
      })
      if (canceled || !filePath) return { success: false, error: 'İptal edildi' }

      const exportData = rows.map((r) => ({
        'Barkod / ID': r.barkod_id || '',
        'Taşınır Kodu': r.tasinir_kodu || '',
        'OKAS Kodu': r.okas_kodu || '',
        'Kalem / Malzeme Adı': r.kalem_adi || '',
        'Tipi': r.tipi || 'Mal',
        'Birimi': r.birim || 'Adet',
        'Kategori': r.kategori || '',
        'Açıklama / Özellik': r.ozelligi || '',
        'KDV Oranı (%)': r.kdv_orani ?? 20,
        'Menşei': r.mensei || '',
        'Notlar': r.notlar || ''
      }))

      const ws = XLSX.utils.json_to_sheet(exportData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Malzemeler')
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
      fs.writeFileSync(filePath, buffer)

      return { success: true, filePath, count: rows.length }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  // 11. Malzeme Listesi (TANIM_Kalem) Excel İçe Aktar
  ipcMain.handle('db:import-kalem-excel', async () => {
    try {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        title: 'Excel Dosyası Seç',
        filters: [{ name: 'Excel Dosyası', extensions: ['xlsx', 'xls', 'csv'] }],
        properties: ['openFile']
      })
      if (canceled || !filePaths || filePaths.length === 0) {
        return { success: false, error: 'İptal edildi' }
      }

      const workbook = XLSX.readFile(filePaths[0])
      const sheetName = workbook.SheetNames[0]
      const rawRows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]) as any[]

      if (!rawRows || rawRows.length === 0) {
        return { success: false, error: 'Excel dosyasında veri bulunamadı.' }
      }

      const db = workspaceManager.getDb()
      let count = 0

      const stmtCheck = db.prepare('SELECT id FROM TANIM_Kalem WHERE barkod_id = ?')
      const stmtUpdate = db.prepare(`
        UPDATE TANIM_Kalem 
        SET tasinir_kodu = ?, okas_kodu = ?, kalem_adi = ?, tipi = ?, birim = ?, kategori = ?, ozelligi = ?, kdv_orani = ?, mensei = ?, notlar = ?, aktif_mi = 1
        WHERE barkod_id = ?
      `)
      const stmtInsert = db.prepare(`
        INSERT INTO TANIM_Kalem (barkod_id, tasinir_kodu, okas_kodu, kalem_adi, tipi, birim, kategori, ozelligi, kdv_orani, mensei, notlar, aktif_mi)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
      `)

      const transaction = db.transaction((rows: any[]) => {
        for (const row of rows) {
          const keys = Object.keys(row)
          const findVal = (...names: string[]) => {
            for (const n of names) {
              const matchedKey = keys.find(
                (k) => k.trim().toLowerCase() === n.trim().toLowerCase()
              )
              if (matchedKey && row[matchedKey] !== undefined && row[matchedKey] !== null) {
                return String(row[matchedKey]).trim()
              }
            }
            return ''
          }

          const kalemAdi = findVal(
            'Kalem / Malzeme Adı',
            'Kalem Adı',
            'Kalem_Adi',
            'Malzeme Adı',
            'Malzeme_Adi',
            'Ad',
            'Adi',
            'kalem_adi',
            'malzeme_adi'
          )
          if (!kalemAdi) continue

          let barkodId = findVal(
            'Barkod / ID',
            'Barkod_ID',
            'Barkod ID',
            'Barkod',
            'barkod_id',
            'barkod',
            'ID',
            'id'
          )
          if (!barkodId) {
            barkodId = `M-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`
          }

          const tasinirKodu = findVal('Taşınır Kodu', 'Tasinir_Kodu', 'tasinir_kodu', 'tasinir')
          const okasKodu = findVal('OKAS Kodu', 'Okas_Kodu', 'okas_kodu', 'okas')
          const tipi = findVal('Tipi', 'tipi', 'Tür', 'tur') || 'Mal'
          const birim = findVal('Birimi', 'Birim', 'birim') || 'Adet'
          const kategori = findVal('Kategori', 'kategori')
          const ozelligi = findVal(
            'Açıklama / Özellik',
            'Açıklama',
            'Özelliği',
            'ozelligi',
            'aciklama'
          )
          const kdvRaw = findVal('KDV Oranı (%)', 'KDV Oranı', 'KDV', 'kdv_orani', 'kdv')
          const kdvOrani = kdvRaw !== '' ? Number(kdvRaw) : 20
          const mensei = findVal('Menşei', 'mensei')
          const notlar = findVal('Notlar', 'notlar')

          const existing = stmtCheck.get(barkodId)
          if (existing) {
            stmtUpdate.run(
              tasinirKodu,
              okasKodu,
              kalemAdi,
              tipi,
              birim,
              kategori,
              ozelligi,
              isNaN(kdvOrani) ? 20 : kdvOrani,
              mensei,
              notlar,
              barkodId
            )
          } else {
            stmtInsert.run(
              barkodId,
              tasinirKodu,
              okasKodu,
              kalemAdi,
              tipi,
              birim,
              kategori,
              ozelligi,
              isNaN(kdvOrani) ? 20 : kdvOrani,
              mensei,
              notlar
            )
          }
          count++
        }
      })

      transaction(rawRows)
      workspaceManager.save()

      return { success: true, count }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  // 12. Taşınır Kodları Şablonu İndir
  ipcMain.handle('db:export-tasinir-template', async () => {
    try {
      const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'Taşınır Kodları Şablonu İndir',
        defaultPath: 'Tasinir_Kodlari_Sablonu.xlsx',
        filters: [{ name: 'Excel Dosyası', extensions: ['xlsx'] }]
      })
      if (canceled || !filePath) return { success: false, error: 'İptal edildi' }

      const sampleData = [
        {
          'Hesap Kodu': '150',
          'I. Düzey': '01',
          'II. Düzey': '01',
          'III. Düzey': '01',
          'IV. Düzey': '',
          'V. Düzey': '',
          'Açıklama': 'Yazı Araçları',
          'Tam Kod': '150.01.01.01'
        },
        {
          'Hesap Kodu': '150',
          'I. Düzey': '01',
          'II. Düzey': '01',
          'III. Düzey': '02',
          'IV. Düzey': '',
          'V. Düzey': '',
          'Açıklama': 'Yazım, Çizim ve Ölçüm Materyalleri',
          'Tam Kod': '150.01.01.02'
        }
      ]

      const ws = XLSX.utils.json_to_sheet(sampleData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Taşınır Kodları')
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
      fs.writeFileSync(filePath, buffer)

      return { success: true, filePath }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  // 13. Taşınır Kodları Excel İçe Aktar
  ipcMain.handle('db:import-tasinir-excel', async () => {
    try {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        title: 'Taşınır Kodları Excel Dosyası Seç',
        filters: [{ name: 'Excel Dosyası', extensions: ['xlsx', 'xls', 'csv'] }],
        properties: ['openFile']
      })
      if (canceled || !filePaths || filePaths.length === 0)
        return { success: false, error: 'İptal edildi' }

      const workbook = XLSX.readFile(filePaths[0])
      const sheetName = workbook.SheetNames[0]
      const rawRows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]) as any[]

      if (!rawRows || rawRows.length === 0) {
        return { success: false, error: 'Excel dosyasında veri bulunamadı.' }
      }

      const db = workspaceManager.getDb()
      let count = 0

      const stmtInsert = db.prepare(`
        INSERT OR REPLACE INTO TANIM_TasinirKod (tam_kod, hesap_kodu, duzey_1, duzey_2, duzey_3, duzey_4, duzey_5, aciklama)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)

      const transaction = db.transaction((rows: any[]) => {
        for (const row of rows) {
          const keys = Object.keys(row)
          const findVal = (...names: string[]) => {
            for (const n of names) {
              const matchedKey = keys.find(
                (k) => k.trim().toLowerCase() === n.trim().toLowerCase()
              )
              if (matchedKey && row[matchedKey] !== undefined && row[matchedKey] !== null) {
                return String(row[matchedKey]).trim()
              }
            }
            return ''
          }

          let tamKod = findVal('Tam Kod', 'tam_kod', 'Kod', 'kod')
          let hesapKodu = findVal('Hesap Kodu', 'hesap_kodu', 'hesap')
          let d1 = findVal('I. Düzey', '1. Düzey', 'duzey_1', 'd1') || null
          let d2 = findVal('II. Düzey', '2. Düzey', 'duzey_2', 'd2') || null
          let d3 = findVal('III. Düzey', '3. Düzey', 'duzey_3', 'd3') || null
          let d4 = findVal('IV. Düzey', '4. Düzey', 'duzey_4', 'd4') || null
          let d5 = findVal('V. Düzey', '5. Düzey', 'duzey_5', 'd5') || null
          const aciklama = findVal('Açıklama', 'aciklama', 'Tanım', 'tanim', 'Ad', 'adi')

          if (!aciklama) continue

          if (tamKod && !hesapKodu) {
            const parts = tamKod.split('.')
            hesapKodu = parts[0] || ''
            d1 = parts[1] || d1
            d2 = parts[2] || d2
            d3 = parts[3] || d3
            d4 = parts[4] || d4
            d5 = parts[5] || d5
          } else if (hesapKodu && !tamKod) {
            tamKod = [hesapKodu, d1, d2, d3, d4, d5].filter(Boolean).join('.')
          }

          if (!hesapKodu && !tamKod) continue

          stmtInsert.run(tamKod, hesapKodu, d1, d2, d3, d4, d5, aciklama)
          count++
        }
      })

      transaction(rawRows)
      workspaceManager.save()

      return { success: true, count }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  // 14. OKAS Kodları Şablonu İndir
  ipcMain.handle('db:export-okas-template', async () => {
    try {
      const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'OKAS Kodları Şablonu İndir',
        defaultPath: 'OKAS_Kodlari_Sablonu.xlsx',
        filters: [{ name: 'Excel Dosyası', extensions: ['xlsx'] }]
      })
      if (canceled || !filePath) return { success: false, error: 'İptal edildi' }

      const sampleData = [
        {
          'OKAS Kodu': '30192700',
          'Bölüm': '30',
          'Grup': '301',
          'Sınıf': '3019',
          'Açıklama': 'Yazıcılar ve faks cihazları'
        },
        {
          'OKAS Kodu': '30200000',
          'Bölüm': '30',
          'Grup': '302',
          'Sınıf': '3020',
          'Açıklama': 'Bilgisayar donanımları ve malzemeleri'
        }
      ]

      const ws = XLSX.utils.json_to_sheet(sampleData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'OKAS Kodları')
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
      fs.writeFileSync(filePath, buffer)

      return { success: true, filePath }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  // 15. OKAS Kodları Excel İçe Aktar
  ipcMain.handle('db:import-okas-excel', async () => {
    try {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        title: 'OKAS Kodları Excel Dosyası Seç',
        filters: [{ name: 'Excel Dosyası', extensions: ['xlsx', 'xls', 'csv'] }],
        properties: ['openFile']
      })
      if (canceled || !filePaths || filePaths.length === 0)
        return { success: false, error: 'İptal edildi' }

      const workbook = XLSX.readFile(filePaths[0])
      const sheetName = workbook.SheetNames[0]
      const rawRows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]) as any[]

      if (!rawRows || rawRows.length === 0) {
        return { success: false, error: 'Excel dosyasında veri bulunamadı.' }
      }

      const db = workspaceManager.getDb()
      let count = 0

      const stmtInsert = db.prepare(`
        INSERT OR REPLACE INTO TANIM_OkasKod (kod, bolum, grup, sinif, aciklama)
        VALUES (?, ?, ?, ?, ?)
      `)

      const transaction = db.transaction((rows: any[]) => {
        for (const row of rows) {
          const keys = Object.keys(row)
          const findVal = (...names: string[]) => {
            for (const n of names) {
              const matchedKey = keys.find(
                (k) => k.trim().toLowerCase() === n.trim().toLowerCase()
              )
              if (matchedKey && row[matchedKey] !== undefined && row[matchedKey] !== null) {
                return String(row[matchedKey]).trim()
              }
            }
            return ''
          }

          const rawKod = findVal('OKAS Kodu', 'OKAS Kod', 'okas_kodu', 'kod', 'Kod')
          const cleanKod = rawKod.replace(/\D/g, '').slice(0, 8)
          const aciklama = findVal('Açıklama', 'aciklama', 'Tanım', 'tanim', 'Ad', 'adi')

          if (!cleanKod || cleanKod.length < 2 || !aciklama) continue

          const bolum =
            findVal('Bölüm', 'bolum') || (cleanKod.length >= 2 ? cleanKod.slice(0, 2) : '')
          const grup =
            findVal('Grup', 'grup') || (cleanKod.length >= 3 ? cleanKod.slice(0, 3) : '')
          const sinif =
            findVal('Sınıf', 'sinif') || (cleanKod.length >= 4 ? cleanKod.slice(0, 4) : '')

          stmtInsert.run(cleanKod, bolum, grup, sinif, aciklama)
          count++
        }
      })

      transaction(rawRows)
      workspaceManager.save()

      return { success: true, count }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  // 16. Generic Table Excel Export
  ipcMain.handle('db:export-table-excel', async (_, tableName: string, customFileName?: string) => {
    try {
      const db = workspaceManager.getDb()
      const rows = db.prepare(`SELECT * FROM ${tableName}`).all() as any[]

      const defaultName = customFileName || `${tableName.replace('TANIM_', '')}_Listesi.xlsx`
      const { canceled, filePath } = await dialog.showSaveDialog({
        title: `${tableName} Dışa Aktar (Excel)`,
        defaultPath: defaultName,
        filters: [{ name: 'Excel Dosyası', extensions: ['xlsx'] }]
      })
      if (canceled || !filePath) return { success: false, error: 'İptal edildi' }

      const ws = XLSX.utils.json_to_sheet(rows)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, tableName.replace('TANIM_', '').slice(0, 31))
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
      fs.writeFileSync(filePath, buffer)

      return { success: true, filePath, count: rows.length }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  // 17. Generic Table Excel Template Download
  ipcMain.handle('db:export-table-template', async (_, tableName: string, customFileName?: string) => {
    try {
      const db = workspaceManager.getDb()
      const tableInfo = db.prepare(`PRAGMA table_info(${tableName})`).all() as { name: string; type: string; pk: number }[]
      
      const columns = tableInfo.filter(c => c.name !== 'created_at' && c.name !== 'updated_at')
      
      const sampleRow = db.prepare(`SELECT * FROM ${tableName} LIMIT 1`).get() as any
      const templateData: any[] = []
      
      if (sampleRow) {
        const rowData: Record<string, any> = {}
        for (const col of columns) {
          rowData[col.name] = sampleRow[col.name] ?? ''
        }
        templateData.push(rowData)
      } else {
        const rowData: Record<string, any> = {}
        for (const col of columns) {
          rowData[col.name] = col.pk ? 1 : (col.type === 'INTEGER' || col.type === 'REAL' ? 0 : 'Örnek Veri')
        }
        templateData.push(rowData)
      }

      const defaultName = customFileName || `${tableName.replace('TANIM_', '')}_Sablonu.xlsx`
      const { canceled, filePath } = await dialog.showSaveDialog({
        title: `${tableName} Şablon İndir (Excel)`,
        defaultPath: defaultName,
        filters: [{ name: 'Excel Dosyası', extensions: ['xlsx'] }]
      })
      if (canceled || !filePath) return { success: false, error: 'İptal edildi' }

      const ws = XLSX.utils.json_to_sheet(templateData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Sablon')
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
      fs.writeFileSync(filePath, buffer)

      return { success: true, filePath }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  // 18. Generic Table Excel Import with Override / Upsert support
  ipcMain.handle('db:import-table-excel', async (_, tableName: string, options: { uniqueCol?: string } = {}) => {
    try {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        title: `${tableName} Excel Dosyası Seç`,
        filters: [{ name: 'Excel Dosyası', extensions: ['xlsx', 'xls', 'csv'] }],
        properties: ['openFile']
      })
      if (canceled || !filePaths || filePaths.length === 0) {
        return { success: false, error: 'İptal edildi' }
      }

      const workbook = XLSX.readFile(filePaths[0])
      const sheetName = workbook.SheetNames[0]
      const rawRows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]) as any[]

      if (!rawRows || rawRows.length === 0) {
        return { success: false, error: 'Excel dosyasında veri bulunamadı.' }
      }

      const db = workspaceManager.getDb()
      const tableInfo = db.prepare(`PRAGMA table_info(${tableName})`).all() as { name: string; type: string; pk: number }[]
      const validColNames = tableInfo.map(c => c.name)
      const pkCol = tableInfo.find(c => c.pk === 1)?.name || 'id'
      const uniqueCol = options.uniqueCol || pkCol

      let insertedCount = 0
      let updatedCount = 0

      const transaction = db.transaction((rows: any[]) => {
        for (const row of rows) {
          const rowKeys = Object.keys(row)
          const matchedData: Record<string, any> = {}

          for (const col of validColNames) {
            if (col === 'created_at' || col === 'updated_at') continue
            const foundKey = rowKeys.find(k => {
              const cleanK = k.trim().toLowerCase().replace(/[\s_-]/g, '')
              const cleanCol = col.toLowerCase().replace(/[\s_-]/g, '')
              return cleanK === cleanCol || cleanK.includes(cleanCol) || cleanCol.includes(cleanK)
            })
            if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null) {
              matchedData[col] = row[foundKey]
            }
          }

          if (Object.keys(matchedData).length === 0) continue

          let existing = null
          if (matchedData[uniqueCol] !== undefined && matchedData[uniqueCol] !== null && String(matchedData[uniqueCol]).trim() !== '') {
            existing = db.prepare(`SELECT * FROM ${tableName} WHERE "${uniqueCol}" = ?`).get(matchedData[uniqueCol])
          }

          if (existing) {
            // Update / Override
            const updateCols = Object.keys(matchedData).filter(c => c !== pkCol)
            if (updateCols.length > 0) {
              const setClause = updateCols.map(c => `"${c}" = ?`).join(', ')
              const params = updateCols.map(c => matchedData[c])
              params.push((existing as any)[pkCol])
              db.prepare(`UPDATE ${tableName} SET ${setClause} WHERE "${pkCol}" = ?`).run(...params)
              updatedCount++
            }
          } else {
            // Insert
            const insertCols = Object.keys(matchedData)
            const placeholders = insertCols.map(() => '?').join(', ')
            const params = insertCols.map(c => matchedData[c])
            db.prepare(`INSERT INTO ${tableName} (${insertCols.map(c => `"${c}"`).join(', ')}) VALUES (${placeholders})`).run(...params)
            insertedCount++
          }
        }
      })

      transaction(rawRows)
      workspaceManager.save()

      return {
        success: true,
        count: insertedCount + updatedCount,
        inserted: insertedCount,
        updated: updatedCount
      }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  // 16. JSON Toplu Veri İçe Aktarma (ImportScreen)
  ipcMain.handle(
    'db:bulk-import',
    async (
      _,
      payload: { target: string; mappings: Record<string, string>; data: any[] }
    ) => {
      try {
        const { target, mappings, data } = payload
        if (!target || !mappings || !Array.isArray(data) || data.length === 0) {
          return { success: false, error: 'Geçersiz parametreler' }
        }

        const db = workspaceManager.getDb()
        const allowedTargetTables = [
          'TANIM_Firma',
          'TANIM_Personel',
          'TANIM_Birim',
          'TANIM_Kalem',
          'TANIM_Ambar',
          'TANIM_Kurum',
          'DATA_TeminDosyasi'
        ]

        if (!allowedTargetTables.includes(target)) {
          return { success: false, error: `İzin verilmeyen hedef tablo: ${target}` }
        }

        const targetCols = Object.values(mappings).filter(Boolean)
        if (targetCols.length === 0) {
          return { success: false, error: 'Eşleşen sütun bulunamadı.' }
        }

        const placeholders = targetCols.map(() => '?').join(', ')
        const insertSql = `INSERT INTO ${target} (${targetCols.join(', ')}) VALUES (${placeholders})`
        const stmt = db.prepare(insertSql)

        let insertedCount = 0
        const skipReasons: string[] = []

        const transaction = db.transaction((rows: any[]) => {
          for (let i = 0; i < rows.length; i++) {
            const row = rows[i]
            const values: any[] = []
            for (const [, dbCol] of Object.entries(mappings)) {
              if (!dbCol) continue
              // Find matching row key
              const jsonKey = Object.keys(mappings).find((k) => mappings[k] === dbCol)
              values.push(jsonKey && row[jsonKey] !== undefined ? row[jsonKey] : null)
            }

            try {
              stmt.run(...values)
              insertedCount++
            } catch (rowErr: any) {
              if (skipReasons.length < 10) {
                skipReasons.push(`Satır ${i + 1}: ${rowErr.message}`)
              }
            }
          }
        })

        transaction(data)
        workspaceManager.save()

        return {
          success: true,
          count: insertedCount,
          total: data.length,
          skipReasons: skipReasons.length > 0 ? skipReasons : undefined
        }
      } catch (err: any) {
        return { success: false, error: err.message }
      }
    }
  )

  // 17. Veritabanı Şema Sözlüğü (Şablon Editörü Placeholder Sözlüğü)
  ipcMain.handle('db:get-schema-dict', async () => {
    try {
      const schemaDict = {
        DATA_TeminDosyasi: {
          label: 'Doğrudan Temin Dosyası',
          columns: {
            temin_no: 'Doğrudan Temin / Dosya No',
            konu: 'İşin Adı / Konu',
            isin_aciklamasi: 'İşin Açıklaması / Tanımı',
            butce_yili: 'Bütçe Yılı',
            tarih: 'Dosya Tarihi',
            karar_no: 'Karar No',
            fatura_no: 'Fatura No',
            fatura_tarihi: 'Fatura Tarihi',
            yaklasik_maliyet: 'Yaklaşık Maliyet Tutarı',
            teslim_gun: 'Teslim Süresi (Gün)',
            teslim_tarihi: 'Teslim Tarihi',
            harcama_birimi: 'Harcama Birimi'
          }
        },
        TANIM_Kurum: {
          label: 'Kurum Bilgileri',
          columns: {
            kurum_adi: 'Kurum Adı',
            ust_kurum_adi: 'Üst Kurum Adı',
            makam_adi: 'Sunum / Makam Adı',
            adres: 'Kurum Adresi',
            il: 'İl',
            ilce: 'İlçe',
            telefon: 'Telefon',
            eposta: 'E-posta',
            vergi_dairesi: 'Vergi Dairesi',
            vergi_no: 'Vergi No'
          }
        },
        TANIM_Firma: {
          label: 'Yüklenici / İstekli Firma',
          columns: {
            unvan: 'Firma Unvanı',
            yetkili_ad_soyad: 'Yetkili Adı Soyadı',
            adres: 'Firma Adresi',
            ilce: 'İlçe',
            il: 'İl',
            telefon: 'Telefon',
            vergi_dairesi: 'Vergi Dairesi',
            vergi_no: 'Vergi / TC No',
            banka_adi: 'Banka Adı',
            iban: 'IBAN Numarası'
          }
        },
        TANIM_Personel: {
          label: 'Personel',
          columns: {
            ad_soyad: 'Personel Adı Soyadı',
            unvan: 'Unvanı',
            birim: 'Birimi / Görevi',
            sicil_no: 'Sicil No',
            telefon: 'Telefon',
            eposta: 'E-posta'
          }
        }
      }
      return { success: true, data: schemaDict }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  // 18. Placeholder Listesini Sıfırla & Güncelle
  ipcMain.handle('db:resetPlaceholders', async () => {
    try {
      const db = workspaceManager.getDb()
      ensureSchemaIntegrity(db)
      workspaceManager.save()
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })
}

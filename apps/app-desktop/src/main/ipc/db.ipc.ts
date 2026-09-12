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

      return await withSchemaRetry(
        executeQuery,
        async () => {
          const db = workspaceManager.getDb()
          ensureSchemaIntegrity(db)
        },
        sql
      )
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

      return await withSchemaRetry(
        executeRun,
        async () => {
          const db = workspaceManager.getDb()
          ensureSchemaIntegrity(db)
        },
        sql
      )
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

      return await withSchemaRetry(
        executeStmt,
        async () => {
          const db = workspaceManager.getDb()
          ensureSchemaIntegrity(db)
        },
        sql
      )
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
      const tableInfo = db.prepare(`PRAGMA table_info(${tableName})`).all() as { name: string; type: string; pk: number; notnull: number; dflt_value: any }[]
      
      const excludedCols = ['created_at', 'updated_at', 'eski_id', 'gorseller']
      const columns = tableInfo.filter(c => !excludedCols.includes(c.name))
      
      const sampleRow = db.prepare(`SELECT * FROM ${tableName} LIMIT 1`).get() as any
      const templateData: any[] = []
      
      if (sampleRow) {
        const rowData: Record<string, any> = {}
        for (const col of columns) {
          // Leave ID empty in template so user knows it's optional
          if (col.pk === 1 || col.name === 'id') {
            rowData[col.name] = ''
          } else {
            rowData[col.name] = sampleRow[col.name] ?? ''
          }
        }
        templateData.push(rowData)
      } else {
        const rowData: Record<string, any> = {}
        for (const col of columns) {
          if (col.pk === 1 || col.name === 'id') {
            rowData[col.name] = '' // ID empty (optional)
          } else if (col.name.endsWith('_mi')) {
            rowData[col.name] = 'Evet'
          } else if (col.name === 'kdv_orani') {
            rowData[col.name] = 20
          } else if (col.name === 'birim_fiyat') {
            rowData[col.name] = 100.00
          } else if (col.name === 'tipi') {
            rowData[col.name] = 'Mal'
          } else if (col.name === 'olcu_birimi' || col.name === 'birim') {
            rowData[col.name] = 'Adet'
          } else if (col.type === 'INTEGER' || col.type === 'REAL') {
            rowData[col.name] = 1
          } else {
            rowData[col.name] = `Örnek ${col.name.replace(/_/g, ' ')}`
          }
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

  // 18. Generic Table Excel Import with Override / Upsert support & Optional ID
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
      const rawRows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' }) as any[]

      if (!rawRows || rawRows.length === 0) {
        return { success: false, error: 'Excel dosyasında veri bulunamadı.' }
      }

      const db = workspaceManager.getDb()
      const tableInfo = db.prepare(`PRAGMA table_info(${tableName})`).all() as {
        name: string
        type: string
        pk: number
        notnull: number
        dflt_value: any
      }[]
      const validColNames = tableInfo.map((c) => c.name)
      const pkCol = tableInfo.find((c) => c.pk === 1)?.name || 'id'
      const uniqueCol = options.uniqueCol || pkCol

      // Normalization and synonym mapping
      const normalizeKey = (str: string): string => {
        return str
          .toLowerCase()
          .replace(/ğ/g, 'g')
          .replace(/ü/g, 'u')
          .replace(/ş/g, 's')
          .replace(/ı/g, 'i')
          .replace(/i̇/g, 'i')
          .replace(/ö/g, 'o')
          .replace(/ç/g, 'c')
          .replace(/[^a-z0-9]/g, '')
      }

      const SYNONYMS: Record<string, string[]> = {
        id: ['id', 'sirano', 'no', 'kayitno', 'sira'],
        birim_adi: ['birimadi', 'birim', 'tamadi', 'tanim', 'ad'],
        kisa_ad: ['kisaad', 'kisaltma', 'sembol', 'kod', 'simge'],
        kategori: ['kategori', 'kategorisi', 'grup', 'kategoriadi', 'tur'],
        sembol: ['sembol', 'simge', 'symbol'],
        donusum_faktoru: ['donusumfaktoru', 'faktor', 'carpan', 'katsayi', 'donusum'],
        temel_birim_mi: ['temelbirim', 'temelbirimmi', 'referansbirim', 'anabirim', 'basetype'],
        donusum_tipi: ['donusumtipi', 'tip', 'tur'],
        ondalik_basamak: ['ondalikbasamak', 'basamaksayisi', 'ondalik', 'precision'],
        iliskili_birimler: ['iliskilibirimler', 'baglibirimler'],
        aciklama: ['aciklama', 'not', 'notlar', 'aciklamalar', 'detay', 'tanim', 'bilgi'],
        aktif_mi: ['durum', 'durumu', 'aktif', 'aktifmi', 'status', 'isactive'],
        ad_soyad: ['adsoyad', 'adivesoyadi', 'isim', 'personeladi', 'tamisim', 'personel'],
        unvan: ['unvan', 'unvani', 'meslek', 'title'],
        gorev: ['gorev', 'gorevi', 'pozisyon'],
        tc_kimlik: ['tckimlik', 'tckimlikno', 'tc', 'tckn', 'kimlikno'],
        telefon: ['telefon', 'tel', 'gsm', 'cep', 'telefonno', 'iletisim'],
        eposta: ['eposta', 'email', 'mail', 'epostasi'],
        yetkili: ['yetkili', 'yetkiliad', 'yetkiliadsoyad', 'ilgili'],
        vergi_no: ['vergino', 'verginumarasi', 'vkn', 'taxno'],
        vergi_dairesi: ['vergidairesi', 'vergidairesiadi', 'vd'],
        adres: ['adres', 'acikadres', 'firmaadresi'],
        iban: ['iban', 'ibanno', 'bankahesapno', 'hesapno'],
        banka_adi: ['bankaadi', 'banka', 'bankasi'],
        ambar_adi: ['ambaradi', 'ambar', 'depoadi', 'depo'],
        semt: ['semt', 'ilce'],
        posta_kodu: ['postakodu', 'pk'],
        sehir: ['sehir', 'il'],
        faks: ['faks', 'fax'],
        web_adresi: ['webadresi', 'web', 'website', 'internet'],
        tasinir_kodu: ['tasinirkodu', 'tasinirkod', 'tasinir'],
        tasinir_adi: ['tasiniradi', 'tasinirtanim'],
        tam_kod: ['tamkod', 'kod', 'tasinirkodu', 'hesapkodu'],
        hesap_kodu: ['hesapkodu', 'anahesap', 'hesap'],
        duzey_1: ['duzey1', 'd1'],
        duzey_2: ['duzey2', 'd2'],
        duzey_3: ['duzey3', 'd3'],
        duzey_4: ['duzey4', 'd4'],
        duzey_5: ['duzey5', 'd5'],
        kod: ['kod', 'okaskodu', 'okaskod', 'cpv'],
        bolum: ['bolum'],
        grup: ['grup'],
        sinif: ['sinif'],
        barkod_id: ['barkodid', 'barkod', 'barkodu', 'barcode', 'stokkodu'],
        kalem_adi: ['kalemadi', 'malzemeadi', 'urunadi', 'hizmetadi', 'isadi', 'malzeme', 'urun'],
        tipi: ['tipi', 'tur', 'turu', 'kalemturu'],
        birim_fiyat: ['birimfiyat', 'fiyat', 'fiyati', 'tutar', 'tahminifiyat'],
        kdv_orani: ['kdvorani', 'kdv', 'kdvlifiyat'],
        varsayilan_miktar: ['varsayilanmiktar', 'miktar', 'adet'],
        olcu_birimi: ['olcubirimi', 'birim', 'birimi'],
        kaynak_birim_id: ['kaynakbirimid', 'kaynakbirim', 'kaynak'],
        hedef_birim_id: ['hedefbirimid', 'hedefbirim', 'hedef'],
        formul: ['formul', 'formula'],
        ters_formul: ['tersformul', 'inverseformula'],
        ad: ['ad', 'gorevadi', 'gorev', 'unvan']
      }

      const findMatchingDbCol = (excelHeader: string): string | null => {
        const normKey = normalizeKey(excelHeader)
        if (!normKey) return null

        for (const col of validColNames) {
          if (normalizeKey(col) === normKey) {
            return col
          }
        }

        for (const col of validColNames) {
          const synList = SYNONYMS[col]
          if (synList && synList.includes(normKey)) {
            return col
          }
        }

        return null
      }

      const parseBooleanValue = (val: any, defaultVal: number = 1): number => {
        if (val === undefined || val === null || String(val).trim() === '') return defaultVal
        if (typeof val === 'boolean') return val ? 1 : 0
        if (typeof val === 'number') return val > 0 ? 1 : 0
        const s = String(val).trim().toUpperCase()
        if (['1', 'EVET', 'E', 'TRUE', 'T', 'AKTIF', 'AKTİF', 'VAR', 'YES', 'Y'].includes(s)) return 1
        if (['0', 'HAYIR', 'H', 'FALSE', 'F', 'PASIF', 'PASİF', 'YOK', 'NO', 'N'].includes(s)) return 0
        return defaultVal
      }

      const parseNumberValue = (val: any, isInteger: boolean = false): number | null => {
        if (val === undefined || val === null || String(val).trim() === '') return null
        if (typeof val === 'number') return isInteger ? Math.round(val) : val
        let s = String(val).trim()
        if (s.includes(',') && s.includes('.')) {
          s = s.replace(/\./g, '').replace(',', '.')
        } else if (s.includes(',')) {
          s = s.replace(',', '.')
        }
        const n = isInteger ? parseInt(s, 10) : parseFloat(s)
        return isNaN(n) ? null : n
      }

      let insertedCount = 0
      let updatedCount = 0

      const transaction = db.transaction((rows: any[]) => {
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i]
          const rowKeys = Object.keys(row)
          const matchedData: Record<string, any> = {}

          for (const rawKey of rowKeys) {
            const rawVal = row[rawKey]
            const targetDbCol = findMatchingDbCol(rawKey)
            if (!targetDbCol) continue
            if (targetDbCol === 'created_at' || targetDbCol === 'updated_at') continue

            const colMeta = tableInfo.find((c) => c.name === targetDbCol)
            if (!colMeta) continue

            // Type conversion
            if (targetDbCol.endsWith('_mi') || colMeta.type === 'BOOLEAN') {
              matchedData[targetDbCol] = parseBooleanValue(
                rawVal,
                colMeta.dflt_value !== null ? Number(colMeta.dflt_value) : 1
              )
            } else if (colMeta.type === 'INTEGER') {
              const num = parseNumberValue(rawVal, true)
              if (num !== null) {
                matchedData[targetDbCol] = num
              } else if (targetDbCol !== pkCol && colMeta.notnull === 1 && colMeta.dflt_value !== null) {
                matchedData[targetDbCol] = Number(colMeta.dflt_value)
              } else if (targetDbCol !== pkCol) {
                matchedData[targetDbCol] = null
              }
            } else if (colMeta.type === 'REAL' || colMeta.type === 'NUMERIC' || colMeta.type === 'DECIMAL') {
              const num = parseNumberValue(rawVal, false)
              if (num !== null) {
                matchedData[targetDbCol] = num
              } else if (colMeta.notnull === 1 && colMeta.dflt_value !== null) {
                matchedData[targetDbCol] = Number(colMeta.dflt_value)
              } else {
                matchedData[targetDbCol] = null
              }
            } else {
              matchedData[targetDbCol] = rawVal !== undefined && rawVal !== null ? String(rawVal).trim() : ''
            }
          }

          // Check if explicit positive ID is provided
          let explicitId: number | null = null
          if (
            matchedData[pkCol] !== undefined &&
            matchedData[pkCol] !== null &&
            String(matchedData[pkCol]).trim() !== ''
          ) {
            const parsedId = parseInt(String(matchedData[pkCol]).replace(/\D/g, ''), 10)
            if (!isNaN(parsedId) && parsedId > 0) {
              explicitId = parsedId
            }
          }

          // If ID is blank, empty string, or <= 0, remove it so SQLite auto-increments
          if (!explicitId) {
            delete matchedData[pkCol]
          } else {
            matchedData[pkCol] = explicitId
          }

          // Smart Table-Specific Augmentations
          if (tableName === 'TANIM_Kalem') {
            if (!matchedData.kalem_adi && !matchedData.barkod_id) continue
            if (!matchedData.barkod_id || String(matchedData.barkod_id).trim() === '') {
              matchedData.barkod_id = `KLM-${Date.now()}-${Math.floor(Math.random() * 90000 + 10000)}`
            }
            if (!matchedData.tipi) matchedData.tipi = 'Mal'
            if (matchedData.kdv_orani === undefined || matchedData.kdv_orani === null) matchedData.kdv_orani = 20
            if (matchedData.aktif_mi === undefined || matchedData.aktif_mi === null) matchedData.aktif_mi = 1
          } else if (tableName === 'TANIM_TasinirKod') {
            if (!matchedData.tam_kod && !matchedData.aciklama) continue
            if (matchedData.tam_kod) {
              const parts = String(matchedData.tam_kod).trim().split('.')
              if (!matchedData.hesap_kodu) matchedData.hesap_kodu = parts[0] || '150'
              if (!matchedData.duzey_1 && parts[1]) matchedData.duzey_1 = parts[1]
              if (!matchedData.duzey_2 && parts[2]) matchedData.duzey_2 = parts[2]
              if (!matchedData.duzey_3 && parts[3]) matchedData.duzey_3 = parts[3]
              if (!matchedData.duzey_4 && parts[4]) matchedData.duzey_4 = parts[4]
              if (!matchedData.duzey_5 && parts[5]) matchedData.duzey_5 = parts[5]
            }
          } else if (tableName === 'TANIM_OkasKod') {
            if (!matchedData.kod && !matchedData.aciklama) continue
            if (matchedData.kod) {
              const clean = String(matchedData.kod).replace(/\D/g, '').slice(0, 8)
              matchedData.kod = clean
              if (!matchedData.bolum && clean.length >= 2) matchedData.bolum = clean.slice(0, 2)
              if (!matchedData.grup && clean.length >= 3) matchedData.grup = clean.slice(0, 3)
              if (!matchedData.sinif && clean.length >= 4) matchedData.sinif = clean.slice(0, 4)
            }
          } else if (tableName === 'TANIM_BirimDonusum') {
            if (matchedData.kaynak_birim_id && isNaN(Number(matchedData.kaynak_birim_id))) {
              const u = db
                .prepare(
                  `SELECT id FROM TANIM_OlcuBirimi WHERE kisa_ad = ? OR birim_adi = ? COLLATE NOCASE`
                )
                .get(matchedData.kaynak_birim_id, matchedData.kaynak_birim_id) as any
              if (u) matchedData.kaynak_birim_id = u.id
            }
            if (matchedData.hedef_birim_id && isNaN(Number(matchedData.hedef_birim_id))) {
              const u = db
                .prepare(
                  `SELECT id FROM TANIM_OlcuBirimi WHERE kisa_ad = ? OR birim_adi = ? COLLATE NOCASE`
                )
                .get(matchedData.hedef_birim_id, matchedData.hedef_birim_id) as any
              if (u) matchedData.hedef_birim_id = u.id
            }
          }

          if (Object.keys(matchedData).length === 0) continue

          // Find existing record for override/update
          let existing: any = null

          // 1. By explicit ID
          if (explicitId) {
            existing = db.prepare(`SELECT * FROM ${tableName} WHERE "${pkCol}" = ?`).get(explicitId)
          }

          // 2. By uniqueCol if given
          if (
            !existing &&
            uniqueCol &&
            uniqueCol !== pkCol &&
            matchedData[uniqueCol] !== undefined &&
            matchedData[uniqueCol] !== null &&
            String(matchedData[uniqueCol]).trim() !== ''
          ) {
            existing = db
              .prepare(`SELECT * FROM ${tableName} WHERE "${uniqueCol}" = ?`)
              .get(matchedData[uniqueCol])
          }

          // 3. Fallback table-specific unique lookups
          if (!existing) {
            if (tableName === 'TANIM_Kalem' && matchedData.barkod_id) {
              existing = db
                .prepare(`SELECT * FROM TANIM_Kalem WHERE barkod_id = ?`)
                .get(matchedData.barkod_id)
            } else if (tableName === 'TANIM_TasinirKod' && matchedData.tam_kod) {
              existing = db
                .prepare(`SELECT * FROM TANIM_TasinirKod WHERE tam_kod = ?`)
                .get(matchedData.tam_kod)
            } else if (tableName === 'TANIM_OkasKod' && matchedData.kod) {
              existing = db
                .prepare(`SELECT * FROM TANIM_OkasKod WHERE kod = ?`)
                .get(matchedData.kod)
            } else if (
              tableName === 'TANIM_OlcuBirimi' &&
              (matchedData.kisa_ad || matchedData.birim_adi)
            ) {
              if (matchedData.kisa_ad) {
                existing = db
                  .prepare(`SELECT * FROM TANIM_OlcuBirimi WHERE kisa_ad = ? COLLATE NOCASE`)
                  .get(matchedData.kisa_ad)
              }
              if (!existing && matchedData.birim_adi) {
                existing = db
                  .prepare(`SELECT * FROM TANIM_OlcuBirimi WHERE birim_adi = ? COLLATE NOCASE`)
                  .get(matchedData.birim_adi)
              }
            } else if (
              tableName === 'TANIM_BirimDonusum' &&
              matchedData.kaynak_birim_id &&
              matchedData.hedef_birim_id
            ) {
              existing = db
                .prepare(
                  `SELECT * FROM TANIM_BirimDonusum WHERE kaynak_birim_id = ? AND hedef_birim_id = ?`
                )
                .get(matchedData.kaynak_birim_id, matchedData.hedef_birim_id)
            } else if (tableName === 'TANIM_Birim' && matchedData.birim_adi) {
              existing = db
                .prepare(`SELECT * FROM TANIM_Birim WHERE birim_adi = ? COLLATE NOCASE`)
                .get(matchedData.birim_adi)
            } else if (
              tableName === 'TANIM_Personel' &&
              (matchedData.tc_kimlik || matchedData.ad_soyad)
            ) {
              if (matchedData.tc_kimlik && String(matchedData.tc_kimlik).trim() !== '') {
                existing = db
                  .prepare(`SELECT * FROM TANIM_Personel WHERE tc_kimlik = ?`)
                  .get(matchedData.tc_kimlik)
              }
              if (!existing && matchedData.ad_soyad) {
                existing = db
                  .prepare(`SELECT * FROM TANIM_Personel WHERE ad_soyad = ? COLLATE NOCASE`)
                  .get(matchedData.ad_soyad)
              }
            } else if (
              tableName === 'TANIM_Firma' &&
              (matchedData.vergi_no || matchedData.unvan)
            ) {
              if (matchedData.vergi_no && String(matchedData.vergi_no).trim() !== '') {
                existing = db
                  .prepare(`SELECT * FROM TANIM_Firma WHERE vergi_no = ?`)
                  .get(matchedData.vergi_no)
              }
              if (!existing && matchedData.unvan) {
                existing = db
                  .prepare(`SELECT * FROM TANIM_Firma WHERE unvan = ? COLLATE NOCASE`)
                  .get(matchedData.unvan)
              }
            } else if (tableName === 'TANIM_Ambar' && matchedData.ambar_adi) {
              existing = db
                .prepare(`SELECT * FROM TANIM_Ambar WHERE ambar_adi = ? COLLATE NOCASE`)
                .get(matchedData.ambar_adi)
            } else if (tableName === 'TANIM_KomisyonGorevi' && matchedData.ad) {
              existing = db
                .prepare(`SELECT * FROM TANIM_KomisyonGorevi WHERE ad = ? COLLATE NOCASE`)
                .get(matchedData.ad)
            }
          }

          if (existing) {
            // Update / Override
            const existingPkValue = (existing as any)[pkCol]
            const updateCols = Object.keys(matchedData).filter((c) => c !== pkCol)
            if (updateCols.length > 0) {
              const setClause = updateCols.map((c) => `"${c}" = ?`).join(', ')
              const params = updateCols.map((c) => matchedData[c])
              params.push(existingPkValue)
              db.prepare(`UPDATE ${tableName} SET ${setClause} WHERE "${pkCol}" = ?`).run(...params)
              updatedCount++
            }
          } else {
            // Insert (if id was not provided, it's omitted so SQLite autoincrements it)
            const insertCols = Object.keys(matchedData)
            if (insertCols.length > 0) {
              const placeholders = insertCols.map(() => '?').join(', ')
              const params = insertCols.map((c) => matchedData[c])
              db.prepare(
                `INSERT INTO ${tableName} (${insertCols.map((c) => `"${c}"`).join(', ')}) VALUES (${placeholders})`
              ).run(...params)
              insertedCount++
            }
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

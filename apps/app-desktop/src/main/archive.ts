import { ipcMain, dialog, app } from 'electron'
import { workspaceManager } from './database/workspace'
import { initializeDatabase } from './database/index'
import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import AdmZip from 'adm-zip'

export function registerArchiveHandlers() {
  // 1. Yıl Bazlı Dosya ve Harcama Özeti
  ipcMain.handle('db:get-year-summary', async (_, year: number) => {
    try {
      const db = workspaceManager.getDb()
      if (!db) return { success: false, message: 'Açık bir çalışma alanı yok.' }

      const allYearsRows = db
        .prepare(
          'SELECT DISTINCT COALESCE(butce_yili, CAST(strftime("%Y", dosya_acilis_tarihi) AS INTEGER)) as yr FROM DATA_TeminDosyasi WHERE is_deleted = 0 ORDER BY yr DESC'
        )
        .all() as { yr: number }[]

      const distinctYears = allYearsRows.map((r) => r.yr).filter(Boolean)

      const targetYear = year || new Date().getFullYear()

      const stats = db
        .prepare(
          `SELECT 
            COUNT(*) as totalCount,
            SUM(CASE WHEN durum IN ('TAMAMLANDI', 'KAPANDI', 'ÖDENDİ', 'ODENDI', 'ARŞİVLENDİ') THEN 1 ELSE 0 END) as completedCount,
            SUM(CASE WHEN durum NOT IN ('TAMAMLANDI', 'KAPANDI', 'ÖDENDİ', 'ODENDI', 'ARŞİVLENDİ') OR durum IS NULL THEN 1 ELSE 0 END) as activeCount,
            SUM(COALESCE(yaklasik_maliyet, 0)) as totalYaklasikMaliyet,
            SUM(COALESCE(sozlesme_bedeli, 0)) as totalSozlesmeBedeli
          FROM DATA_TeminDosyasi 
          WHERE is_deleted = 0 AND (butce_yili = ? OR (butce_yili IS NULL AND CAST(strftime("%Y", dosya_acilis_tarihi) AS INTEGER) = ?))`
        )
        .get(targetYear, targetYear) as any

      return {
        success: true,
        distinctYears,
        summary: {
          year: targetYear,
          totalCount: stats?.totalCount || 0,
          completedCount: stats?.completedCount || 0,
          activeCount: stats?.activeCount || 0,
          totalYaklasikMaliyet: stats?.totalYaklasikMaliyet || 0,
          totalSozlesmeBedeli: stats?.totalSozlesmeBedeli || 0
        }
      }
    } catch (e: any) {
      return { success: false, message: e.message }
    }
  })

  // 2. Yıl Sonu Dosyalarını Kapatma & Kilitleme
  ipcMain.handle('db:close-year-records', async (_, year: number) => {
    try {
      const db = workspaceManager.getDb()
      if (!db) return { success: false, message: 'Açık bir çalışma alanı yok.' }

      const res = db
        .prepare(
          `UPDATE DATA_TeminDosyasi 
           SET durum = 'KAPANDI', updated_at = CURRENT_TIMESTAMP 
           WHERE is_deleted = 0 
             AND (butce_yili = ? OR (butce_yili IS NULL AND CAST(strftime("%Y", dosya_acilis_tarihi) AS INTEGER) = ?))`
        )
        .run(year, year)

      workspaceManager.recordMutation()
      workspaceManager.save()
      return { success: true, count: res.changes }
    } catch (e: any) {
      return { success: false, message: e.message }
    }
  })

  // 3. Arşivleme & Dışa Aktarma
  ipcMain.handle(
    'db:archive-old-records',
    async (
      _,
      params:
        | number
        | {
            year: number
            deleteFromMain?: boolean
            onlyCompleted?: boolean
          }
    ) => {
      try {
        const db = workspaceManager.getDb()
        const currentFilePath = workspaceManager.getCurrentFilePath()
        if (!db || !currentFilePath) throw new Error('Açık bir çalışma alanı yok.')

        const year = typeof params === 'number' ? params : params.year
        const deleteFromMain = typeof params === 'object' && params.deleteFromMain !== undefined ? params.deleteFromMain : true
        const onlyCompleted = typeof params === 'object' && params.onlyCompleted ? true : false

        let query =
          'SELECT id, temin_no FROM DATA_TeminDosyasi WHERE is_deleted = 0 AND (butce_yili <= ? OR (butce_yili IS NULL AND CAST(strftime("%Y", dosya_acilis_tarihi) AS INTEGER) <= ?))'
        if (onlyCompleted) {
          query += " AND durum IN ('TAMAMLANDI', 'KAPANDI', 'ÖDENDİ', 'ODENDI', 'ARŞİVLENDİ')"
        }

        const rows = db.prepare(query).all(year, year) as { id: number; temin_no: string }[]

        if (rows.length === 0) {
          return { success: false, message: 'Belirtilen kriterlere uygun arşivlenecek dosya bulunamadı.' }
        }

        const dosyaIds = rows.map((r) => r.id)
        const inClause = dosyaIds.map(() => '?').join(',')

        // Ask user where to save the .tmn360 / .dtz file
        const { canceled, filePath } = await dialog.showSaveDialog({
          title: 'Temin 360 - Yıl Sonu Arşivi Oluştur',
          defaultPath: `Temin360_Arsiv_${year}_Yili.tmn360`,
          filters: [
            { name: 'Temin 360 Arşiv Paketi (*.tmn360)', extensions: ['tmn360'] },
            { name: 'Sıkıştırılmış Arşiv (*.dtz)', extensions: ['dtz'] }
          ]
        })

        if (canceled || !filePath) return { success: false, message: 'İşlem iptal edildi.' }

        // Create temporary archive DB
        const tempArchiveDir = path.join(app.getPath('temp'), `temin360_archive_${Date.now()}`)
        fs.mkdirSync(tempArchiveDir, { recursive: true })
        const archiveDbPath = path.join(tempArchiveDir, 'database.sqlite')
        const archiveDb = new Database(archiveDbPath)

        // Get institution name from current DB
        const instRow = db
          .prepare("SELECT value FROM settings WHERE key = 'institutionName'")
          .get() as { value: string } | undefined
        const instName = instRow ? instRow.value : 'Bilinmeyen Kurum'

        // Initialize schema
        initializeDatabase(archiveDb, instName)

        // Begin copying tables
        archiveDb.transaction(() => {
          // Copy DATA_TeminDosyasi
          const dosyaRows = db
            .prepare(`SELECT * FROM DATA_TeminDosyasi WHERE id IN (${inClause})`)
            .all(...dosyaIds)
          const insertDosya = archiveDb.prepare(
            `INSERT INTO DATA_TeminDosyasi (${Object.keys(dosyaRows[0]).join(
              ', '
            )}) VALUES (${Object.keys(dosyaRows[0])
              .map(() => '?')
              .join(', ')})`
          )
          dosyaRows.forEach((row: any) => insertDosya.run(Object.values(row)))

          // Copy related tables
          const relatedTables = [
            'DATA_TeminBelge',
            'DATA_TeminFirma',
            'DATA_TeminKalem',
            'DATA_TeminKalemTeklif',
            'DATA_TeminKomisyon',
            'DATA_DosyaSablonVeri'
          ]

          for (const table of relatedTables) {
            try {
              const tableRows = db
                .prepare(`SELECT * FROM ${table} WHERE temin_dosya_id IN (${inClause})`)
                .all(...dosyaIds)
              if (tableRows.length > 0) {
                const keys = Object.keys(tableRows[0])
                const insertTable = archiveDb.prepare(
                  `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`
                )
                tableRows.forEach((row: any) => insertTable.run(Object.values(row)))
              }
            } catch (err) {
              // Ignore if table does not exist in schema
            }
          }
        })()

        archiveDb.close()

        // Create meta.json for archive
        const currentMeta = workspaceManager.getMeta()
        const metaPath = path.join(tempArchiveDir, 'meta.json')
        fs.writeFileSync(
          metaPath,
          JSON.stringify(
            {
              ...(currentMeta || {}),
              app: 'Temin 360',
              is_archive: true,
              archive_year: year,
              file_count: dosyaIds.length,
              archived_at: new Date().toISOString()
            },
            null,
            2
          )
        )

        fs.mkdirSync(path.join(tempArchiveDir, 'attachments'), { recursive: true })

        // Compress to .tmn360 / .dtz
        const zip = new AdmZip()
        zip.addLocalFolder(tempArchiveDir)
        zip.writeZip(filePath)

        // Cleanup temp
        fs.rmSync(tempArchiveDir, { recursive: true, force: true })

        // If user chose to purge archived records from active workspace:
        if (deleteFromMain) {
          db.pragma('foreign_keys = ON')
          db.transaction(() => {
            db.prepare(`DELETE FROM DATA_TeminDosyasi WHERE id IN (${inClause})`).run(...dosyaIds)
          })()
          workspaceManager.recordMutation()
          workspaceManager.save()
        }

        return { success: true, count: dosyaIds.length, filePath, purged: deleteFromMain }
      } catch (error: any) {
        console.error('Archiving error:', error)
        return { success: false, message: error.message || 'Bilinmeyen bir hata oluştu.' }
      }
    }
  )
}


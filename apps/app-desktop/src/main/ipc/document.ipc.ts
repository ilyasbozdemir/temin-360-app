import { ipcMain, dialog, BrowserWindow, shell, app } from 'electron'
import { join } from 'path'
import fs from 'fs'
import Mustache from 'mustache'
import AdmZip from 'adm-zip'
import { renderDocxBuffer } from '../docxService'
import { renderPdfBuffer } from '../pdfService'

function readSystemTemplate(fileName: string): string | null {
  const templatesDirDev = join(app.getAppPath(), 'resources', 'templates')
  const templatesDirProd = join(process.resourcesPath, 'templates')
  const targetDir = fs.existsSync(templatesDirProd) ? templatesDirProd : templatesDirDev

  const findFile = (dir: string): string | null => {
    try {
      if (!fs.existsSync(dir)) return null
      const list = fs.readdirSync(dir)
      for (const file of list) {
        const filePath = join(dir, file)
        const stat = fs.statSync(filePath)
        if (stat.isDirectory()) {
          const found = findFile(filePath)
          if (found) return found
        } else if (file === fileName) {
          return filePath
        }
      }
    } catch {}
    return null
  }

  const foundPath = findFile(targetDir)
  if (foundPath && fs.existsSync(foundPath)) {
    try {
      return fs.readFileSync(foundPath, 'utf-8')
    } catch {}
  }
  return null
}

function numberToTurkishWords(num: number): string {
  if (isNaN(num) || num === 0) return 'Sıfır TL'
  const birler = ['', 'Bir', 'İki', 'Üç', 'Dört', 'Beş', 'Altı', 'Yedi', 'Sekiz', 'Dokuz']
  const onlar = ['', 'On', 'Yirmi', 'Otuz', 'Kırk', 'Elli', 'Altmış', 'Yetmiş', 'Seksen', 'Doksan']
  const basamaklar = ['', 'Bin', 'Milyon', 'Milyar', 'Trilyon']

  const convertGroup = (n: number): string => {
    let res = ''
    const yuzler = Math.floor(n / 100)
    const on = Math.floor((n % 100) / 10)
    const bir = n % 10

    if (yuzler > 1) res += birler[yuzler] + 'Yüz'
    else if (yuzler === 1) res += 'Yüz'

    if (on > 0) res += onlar[on]
    if (bir > 0) res += birler[bir]

    return res
  }

  const tamKisim = Math.floor(num)
  const kurusKisim = Math.round((num - tamKisim) * 100)

  let tamStr = ''
  let temp = tamKisim
  let basamakIdx = 0

  while (temp > 0) {
    const group = temp % 1000
    if (group > 0) {
      const groupText = convertGroup(group)
      if (basamakIdx === 1 && group === 1) {
        tamStr = 'Bin' + tamStr
      } else {
        tamStr = groupText + basamaklar[basamakIdx] + tamStr
      }
    }
    temp = Math.floor(temp / 1000)
    basamakIdx++
  }

  let result = (tamStr || 'Sıfır') + ' TL'
  if (kurusKisim > 0) {
    result += ' ' + convertGroup(kurusKisim) + ' Kr.'
  }
  return result
}


export function registerDocumentIpcHandlers(): void {
  // Helper to register both namespaced channel and legacy alias
  const handleDoc = (
    channel: string,
    alias: string,
    handler: (event: any, ...args: any[]) => Promise<any>
  ) => {
    ipcMain.handle(channel, handler)
    if (alias) {
      ipcMain.handle(alias, handler)
    }
  }

  // 1. DOCX Export (supports direct params and object payload)
  handleDoc('belge:export-docx', 'export-docx', async (_, payload: any, legacyFileName?: string) => {
    try {
      const htmlContent =
        typeof payload === 'string'
          ? payload
          : payload?.html || payload?.htmlContent || ''
      const rawFileName =
        (typeof payload === 'object' && (payload?.defaultFilename || payload?.fileName || payload?.filename)) ||
        legacyFileName ||
        'Belge.docx'
      const fileName = rawFileName.endsWith('.docx') ? rawFileName : `${rawFileName}.docx`

      const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'Word (DOCX) Olarak Kaydet',
        defaultPath: fileName,
        filters: [{ name: 'Word Dosyası', extensions: ['docx'] }]
      })
      if (canceled || !filePath) return { success: false, error: 'İptal edildi' }

      const buffer = await renderDocxBuffer(htmlContent)
      fs.writeFileSync(filePath, buffer)

      return { success: true, filePath }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })
  ipcMain.handle('app:export-docx', async (e, ...args) => {
    const handler = (ipcMain as any)._events?.['belge:export-docx']
    if (typeof handler === 'function') return handler(e, ...args)
    return { success: false, error: 'Handler not found' }
  })
  ipcMain.handle('app:save-docx-as', async (e, ...args) => {
    const handler = (ipcMain as any)._events?.['belge:export-docx']
    if (typeof handler === 'function') return handler(e, ...args)
    return { success: false, error: 'Handler not found' }
  })
  ipcMain.handle('save-docx-as', async (e, ...args) => {
    const handler = (ipcMain as any)._events?.['belge:export-docx']
    if (typeof handler === 'function') return handler(e, ...args)
    return { success: false, error: 'Handler not found' }
  })

  // 2. UDF Export
  handleDoc('belge:export-udf', 'export-udf', async (_, payload: any, legacyFileName?: string) => {
    try {
      const htmlContent =
        typeof payload === 'string'
          ? payload
          : payload?.html || payload?.htmlContent || ''
      const rawFileName =
        (typeof payload === 'object' && (payload?.defaultFilename || payload?.fileName || payload?.filename)) ||
        legacyFileName ||
        'Belge.udf'
      const fileName = rawFileName.endsWith('.udf') ? rawFileName : `${rawFileName}.udf`

      const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'UDF Olarak Kaydet',
        defaultPath: fileName,
        filters: [{ name: 'UYAP Dokümanı', extensions: ['udf'] }]
      })
      if (canceled || !filePath) return { success: false, error: 'İptal edildi' }

      const stripHtml = htmlContent.replace(/<[^>]+>/g, ' ')
      const udfContent = `<?xml version="1.0" encoding="utf-8"?>\n<Document>\n<content>\n<![CDATA[\n${stripHtml}\n]]>\n</content>\n</Document>`
      fs.writeFileSync(filePath, udfContent, 'utf-8')

      return { success: true, filePath }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })
  ipcMain.handle('app:export-udf', async (e, ...args) => {
    const handler = (ipcMain as any)._events?.['belge:export-udf']
    if (typeof handler === 'function') return handler(e, ...args)
    return { success: false, error: 'Handler not found' }
  })

  // 3. Print HTML
  handleDoc('belge:print-html', 'print-html', async (_, payload: any, legacyOptions?: any) => {
    try {
      const htmlContent =
        typeof payload === 'string'
          ? payload
          : payload?.html || payload?.htmlContent || ''
      const printOptions =
        (typeof payload === 'object' && (payload?.options || payload?.printOptions)) ||
        legacyOptions ||
        (typeof payload === 'object' ? payload : {})

      const win = new BrowserWindow({ show: false })
      await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`)

      await new Promise((resolve) => setTimeout(resolve, 500))

      return await new Promise((resolve) => {
        win.webContents.print(
          { printBackground: true, ...printOptions },
          (success, failureReason) => {
            if (!win.isDestroyed()) {
              win.destroy()
            }
            if (success) {
              resolve({ success: true })
            } else {
              resolve({
                success: false,
                error: failureReason || 'Yazdırma işlemi iptal edildi veya başarısız oldu'
              })
            }
          }
        )
      })
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })
  ipcMain.handle('app:print-html', async (e, ...args) => {
    const handler = (ipcMain as any)._events?.['belge:print-html']
    if (typeof handler === 'function') return handler(e, ...args)
    return { success: false, error: 'Handler not found' }
  })

  // 4. Preview PDF
  handleDoc('belge:preview-pdf', 'preview-pdf', async (_, htmlContent: string) => {
    try {
      const pdfBuffer = await renderPdfBuffer(htmlContent)
      return { success: true, data: pdfBuffer.toString('base64') }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  // 5. Open PDF External
  handleDoc('belge:open-pdf-external', 'open-pdf-external', async (_, payload: any) => {
    try {
      const html = typeof payload === 'string' ? payload : (payload?.html || payload?.htmlContent || '')
      const pdfBuffer = await renderPdfBuffer(html)
      const tempPath = join(app.getPath('temp'), `hakim-pro_preview_${Date.now()}.pdf`)
      fs.writeFileSync(tempPath, pdfBuffer)
      await shell.openPath(tempPath)
      return { success: true, tempPath }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  // 5.1 Save PDF As (and export-pdf)
  handleDoc('belge:export-pdf', 'export-pdf', async (_, payload: any, legacyOptions?: any, legacyFileName?: string) => {
    try {
      const html = typeof payload === 'string' ? payload : (payload?.html || payload?.htmlContent || '')
      const defaultFilename =
        (typeof payload === 'object' && (payload?.defaultFilename || payload?.fileName || payload?.filename)) ||
        legacyFileName ||
        'Belge.pdf'

      const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'PDF Olarak Kaydet',
        defaultPath: defaultFilename.endsWith('.pdf') ? defaultFilename : `${defaultFilename}.pdf`,
        filters: [{ name: 'PDF Dosyası', extensions: ['pdf'] }]
      })
      if (canceled || !filePath) return { success: false, error: 'İptal edildi' }

      const pdfBuffer = await renderPdfBuffer(html)
      fs.writeFileSync(filePath, pdfBuffer)
      return { success: true, filePath }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })
  handleDoc('app:save-pdf-as', 'save-pdf-as', async (_, payload: any, legacyOptions?: any, legacyFileName?: string) => {
    try {
      const html = typeof payload === 'string' ? payload : (payload?.html || payload?.htmlContent || '')
      const defaultFilename =
        (typeof payload === 'object' && (payload?.defaultFilename || payload?.fileName || payload?.filename)) ||
        legacyFileName ||
        'Belge.pdf'

      const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'PDF Olarak Kaydet',
        defaultPath: defaultFilename.endsWith('.pdf') ? defaultFilename : `${defaultFilename}.pdf`,
        filters: [{ name: 'PDF Dosyası', extensions: ['pdf'] }]
      })
      if (canceled || !filePath) return { success: false, error: 'İptal edildi' }

      const pdfBuffer = await renderPdfBuffer(html)
      fs.writeFileSync(filePath, pdfBuffer)
      return { success: true, filePath }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })
  ipcMain.handle('app:export-pdf', async (e, ...args) => {
    const handler = (ipcMain as any)._events?.['belge:export-pdf']
    if (typeof handler === 'function') return handler(e, ...args)
    return { success: false, error: 'Handler not found' }
  })

  // 5.2 Open PDF Preview in New Tab / Window
  handleDoc('app:open-pdf-preview', 'open-pdf-preview', async (_, payload: any) => {
    try {
      const html = typeof payload === 'string' ? payload : (payload?.html || payload?.htmlContent || '')
      const pdfBuffer = await renderPdfBuffer(html)
      const tempPath = join(app.getPath('temp'), `temin360_preview_${Date.now()}.pdf`)
      fs.writeFileSync(tempPath, pdfBuffer)
      await shell.openPath(tempPath)
      return { success: true, tempPath }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  // 5.3 Batch Export as ZIP (Toplu İndirme Desteği)
  handleDoc('belge:export-zip', 'export-zip', async (_, payload: any, legacyZipName?: string) => {
    try {
      let items: Array<{ name: string; html?: string; content?: string | Buffer; format?: 'pdf' | 'docx' | 'udf' | 'html' }> = []
      let defaultZipName = legacyZipName || 'Toplu_Belgeler.zip'

      if (Array.isArray(payload)) {
        items = payload
      } else if (payload && typeof payload === 'object') {
        items = payload.items || payload.files || []
        defaultZipName = payload.zipName || payload.defaultFilename || defaultZipName
      }

      if (!defaultZipName.endsWith('.zip')) {
        defaultZipName = `${defaultZipName}.zip`
      }

      if (items.length === 0) {
        return { success: false, error: 'Arşivlenecek belge bulunamadı' }
      }

      const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'Toplu Belgeleri ZIP Olarak Kaydet',
        defaultPath: defaultZipName,
        filters: [{ name: 'ZIP Arşivi', extensions: ['zip'] }]
      })
      if (canceled || !filePath) return { success: false, error: 'İptal edildi' }

      const zip = new AdmZip()

      for (const item of items) {
        const format = (item.format || 'pdf').toLowerCase()
        const rawName = item.name || 'Belge'
        const cleanName = rawName.replace(/[/\\:*?"<>|]/g, '_').replace(/\.(pdf|docx|udf|html)$/i, '')

        if (Buffer.isBuffer(item.content)) {
          zip.addFile(`${cleanName}.${format}`, item.content)
        } else {
          const html = item.html || (typeof item.content === 'string' ? item.content : '')
          if (format === 'docx') {
            const docxBuf = await renderDocxBuffer(html)
            zip.addFile(`${cleanName}.docx`, docxBuf)
          } else if (format === 'udf') {
            const stripHtml = html.replace(/<[^>]+>/g, ' ')
            const udfContent = `<?xml version="1.0" encoding="utf-8"?>\n<Document>\n<content>\n<![CDATA[\n${stripHtml}\n]]>\n</content>\n</Document>`
            zip.addFile(`${cleanName}.udf`, Buffer.from(udfContent, 'utf-8'))
          } else if (format === 'html') {
            zip.addFile(`${cleanName}.html`, Buffer.from(html, 'utf-8'))
          } else {
            // Default PDF
            const pdfBuf = await renderPdfBuffer(html)
            zip.addFile(`${cleanName}.pdf`, pdfBuf)
          }
        }
      }

      const zipBuffer = zip.toBuffer()
      fs.writeFileSync(filePath, zipBuffer)

      return { success: true, filePath, count: items.length }
    } catch (err: any) {
      console.error('ZIP export hatası:', err)
      return { success: false, error: err.message }
    }
  })
  ipcMain.handle('app:export-zip', async (e, ...args) => {
    const handler = (ipcMain as any)._events?.['belge:export-zip']
    if (typeof handler === 'function') return handler(e, ...args)
    return { success: false, error: 'Handler not found' }
  })

  // 6. Export HTML
  handleDoc('belge:export-html', 'export-html', async (_, htmlContent: string, options?: { paperSize?: string }, fileName?: string) => {
    try {
      const paperSize = options?.paperSize || 'A4'
      const isA4 = paperSize === 'A4'
      const width = isA4 ? '210mm' : 'auto'

      const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'HTML Olarak Kaydet',
        defaultPath: fileName ? `${fileName}.html` : 'Cikti.html',
        filters: [{ name: 'HTML Dosyası', extensions: ['html'] }]
      })
      if (canceled || !filePath) return { success: false, error: 'İptal edildi' }

      const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Belge</title>
  <style>
    @page { size: ${paperSize}; margin: 20mm; }
    body { 
      width: ${width}; 
      margin: 0 auto; 
      font-family: 'Times New Roman', Times, serif; 
      font-size: 12pt;
      line-height: 1.5;
      background: white;
      padding: 0;
      box-sizing: border-box;
    }
    table { border-collapse: collapse; width: 100%; margin-bottom: 1em; table-layout: fixed; }
    td, th { border: 1px solid #000; padding: 6px; }
    th { font-weight: bold; background-color: #f1f5f9; text-align: left; }
    p { margin-bottom: 1em; margin-top: 0; }
    ul { list-style-type: disc; padding-left: 20px; margin-bottom: 1em; }
    ol { list-style-type: decimal; padding-left: 20px; margin-bottom: 1em; }
    h1 { font-size: 16pt; font-weight: bold; margin-bottom: 0.5em; }
    h2 { font-size: 14pt; font-weight: bold; margin-bottom: 0.5em; }
    h3 { font-size: 12pt; font-weight: bold; margin-bottom: 0.5em; }
    @media print {
      body { margin: 0; width: 100%; }
      @page { margin: 20mm; }
    }
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>`

      fs.writeFileSync(filePath, fullHtml, 'utf8')
      return { success: true, filePath }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  // 7. XLSX Export
  handleDoc('belge:export-xlsx', 'export-xlsx', async (_, bufferData: Uint8Array | ArrayBuffer) => {
    try {
      const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'XLSX Olarak Kaydet',
        defaultPath: 'Tablo.xlsx',
        filters: [{ name: 'Excel Dosyası', extensions: ['xlsx'] }]
      })
      if (canceled || !filePath) return { success: false, error: 'İptal edildi' }

      fs.writeFileSync(filePath, Buffer.from(bufferData as ArrayBuffer))
      return { success: true, filePath }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  // 8. DOCX Import
  handleDoc('belge:import-docx', 'import-docx', async () => {
    try {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        title: 'DOCX Seç',
        filters: [{ name: 'Word Document', extensions: ['docx'] }],
        properties: ['openFile']
      })
      if (canceled || !filePaths || filePaths.length === 0)
        return { success: false, error: 'İptal edildi' }

      const mammoth = require('mammoth')
      const result = await mammoth.convertToHtml({ path: filePaths[0] })
      return { success: true, html: result.value, messages: result.messages }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  // 9. XLSX Import
  handleDoc('belge:import-xlsx', 'import-xlsx', async () => {
    try {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        title: 'XLSX Seç',
        filters: [{ name: 'Excel Dosyası', extensions: ['xlsx', 'xls'] }],
        properties: ['openFile']
      })
      if (canceled || !filePaths || filePaths.length === 0)
        return { success: false, error: 'İptal edildi' }

      const buffer = fs.readFileSync(filePaths[0])
      return { success: true, buffer: buffer.buffer }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  // 10. Open Excel External
  handleDoc('belge:open-excel', 'open-excel', async () => {
    try {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        title: 'Excel Dosyası Aç',
        filters: [{ name: 'Excel Dosyası', extensions: ['xlsx', 'xls', 'csv'] }],
        properties: ['openFile']
      })
      if (canceled || !filePaths || filePaths.length === 0)
        return { success: false, error: 'İptal edildi' }

      await shell.openPath(filePaths[0])
      return { success: true, filePath: filePaths[0] }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  // 11. Complete Document & Stage Data Resolver (Direct Fast Electron SQLite Query)
  handleDoc('belge:get-document-payload', 'get-document-payload', async (_, payload: { dosyaId?: number; documentId?: string }) => {
    try {
      const { workspaceManager } = require('../database/workspace')
      const db = workspaceManager.getDb()
      const dosyaId = Number(payload?.dosyaId || 0)
      const documentId = payload?.documentId || ''

      // 1. Fetch active personnel list
      const personelListesi = db.prepare(
        'SELECT id, ad_soyad, unvan, telefon, eposta, birim, sicil_no FROM TANIM_Personel WHERE COALESCE(aktif_mi, 1) = 1 OR aktif_mi = "1" OR aktif_mi = "true" OR aktif_mi IS NULL ORDER BY ad_soyad ASC'
      ).all()

      // 2. Fetch institution and app settings
      const kurum = db.prepare('SELECT * FROM TANIM_Kurum LIMIT 1').get() || {}
      let settingsMap: Record<string, string> = {}
      try {
        const settingsRows = db.prepare('SELECT key, value FROM settings').all()
        settingsRows.forEach((r: any) => {
          if (r.key) settingsMap[r.key] = r.value
        })
      } catch {}

      const solLogo = (kurum as any)?.logo_sol || (kurum as any)?.logo_url || settingsMap.logoLeft || settingsMap.institutionLogo || null
      const sagLogo = (kurum as any)?.logo_sag || settingsMap.logoRight || null

      // 3. Fetch file details with Purchasing Unit (TANIM_Birim) antet data
      const dosya = dosyaId
        ? db
            .prepare(
              `SELECT d.*, 
                      b.antet_ek_satir as birim_antet_ek_satir, 
                      b.birim_adi as birim_tablo_adi,
                      b.harcama_kodu as harcama_birim_kodu,
                      b.muhasebe_kodu,
                      b.detsis_kodu
               FROM DATA_TeminDosyasi d 
               LEFT JOIN TANIM_Birim b ON d.birim_id = b.id 
               WHERE d.id = ?`
            )
            .get(dosyaId) || {}
        : {}

      // 4. Fetch items
      const items = dosyaId ? db.prepare('SELECT id, kalem_adi, aciklama, birim, miktar, tasinir_kodu, kdv_orani FROM DATA_TeminKalem WHERE temin_dosya_id = ? ORDER BY id ASC').all(dosyaId) : []

      // 5. Fetch invited firms
      let fileFirms: any[] = []
      if (dosyaId) {
        fileFirms = db.prepare(`
          SELECT 
            df.id as temin_firma_id,
            COALESCE(f.id, df.firma_id, df.id) as id,
            COALESCE(NULLIF(df.unvan, ''), NULLIF(f.unvan, ''), NULLIF(f.firma_adi, ''), NULLIF(df.firma_adi, ''), 'İstekli Firma') as unvan,
            COALESCE(NULLIF(f.yetkili_ad_soyad, ''), NULLIF(df.yetkili_ad_soyad, '')) as yetkili_ad_soyad,
            COALESCE(NULLIF(f.telefon, ''), NULLIF(df.telefon, '')) as telefon,
            COALESCE(NULLIF(f.eposta, ''), NULLIF(df.email, '')) as eposta
          FROM DATA_TeminFirma df
          LEFT JOIN TANIM_Firma f ON df.firma_id = f.id
          WHERE df.temin_dosya_id = ?
          ORDER BY df.id ASC
        `).all(dosyaId)
      }

      // 6. Fetch global firms for fallback/selection
      const globalFirms = db.prepare(
        "SELECT id, unvan, yetkili_ad_soyad, telefon, eposta FROM TANIM_Firma WHERE aktif_mi = 1 AND unvan IS NOT NULL AND unvan != '' ORDER BY unvan ASC"
      ).all()

      // 7. Fetch bids
      const bids = dosyaId ? db.prepare(
        'SELECT temin_kalem_id, temin_firma_id, birim_fiyat FROM DATA_TeminKalemTeklif WHERE temin_dosya_id = ?'
      ).all(dosyaId) : []

      // 8. Fetch commissions
      const komisyonlar = dosyaId ? db.prepare(`
        SELECT tk.*, 
               COALESCE(NULLIF(tk.ad_soyad, ''), NULLIF(p.ad_soyad, ''), '') as resolved_ad_soyad,
               COALESCE(NULLIF(tk.unvan, ''), NULLIF(p.unvan, ''), '') as resolved_unvan,
               COALESCE(k.ad, '') as komisyon_turu_adi
        FROM DATA_TeminKomisyon tk
        LEFT JOIN TANIM_Personel p ON tk.personel_id = p.id
        LEFT JOIN TANIM_Komisyon k ON tk.komisyon_id = k.id
        WHERE tk.temin_dosya_id = ?
      `).all(dosyaId) : []

      // 9. Fetch saved snapshot if exists
      let savedSnapshot: any = null
      if (dosyaId && documentId) {
        const cleanDocId = String(documentId).replace(/\.html$/i, '').trim()
        try {
          const snapRow = db.prepare(`
            SELECT veri_json FROM DATA_DosyaSablonVeri 
            WHERE temin_dosya_id = ? AND (
              sablon_kodu = ? 
              OR sablon_kodu = ?
              OR sablon_id = (SELECT id FROM TANIM_Sablon WHERE dosya_adi = ? OR dosya_adi = ? LIMIT 1)
            )
            ORDER BY id DESC LIMIT 1
          `).get(dosyaId, cleanDocId, `${cleanDocId}.html`, `${cleanDocId}.html`, cleanDocId) as any
          if (snapRow?.veri_json) {
            savedSnapshot = JSON.parse(snapRow.veri_json)
          }
        } catch (err) {
          console.error('[Document IPC] savedSnapshot fetch error:', err)
        }
      }

      // Calculate firm totals & winner
      fileFirms.forEach((firm: any) => {
        let total = 0
        items.forEach((item: any) => {
          const bid = bids.find(
            (b: any) =>
              b.temin_kalem_id === item.id &&
              (b.temin_firma_id === firm.temin_firma_id || b.temin_firma_id === firm.id)
          )
          if (bid && bid.birim_fiyat > 0) {
            total += bid.birim_fiyat * (item.miktar || 0)
          }
        })
        firm.total = total
      })

      const nonZeroTotals = fileFirms.filter((f) => f.total > 0)
      const lowestTotal = nonZeroTotals.length > 0 ? Math.min(...nonZeroTotals.map((f) => f.total)) : 0

      fileFirms.forEach((f) => {
        if (f.total > 0 && f.total === lowestTotal) {
          f.isWinner = true
          const formattedTotal = f.total.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          f.label = `🏆 ${f.unvan} (${formattedTotal} TL - En Düşük Teklif)`
        } else if (f.total > 0) {
          const formattedTotal = f.total.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          f.label = `🏢 ${f.unvan} (${formattedTotal} TL)`
        } else {
          f.label = `🏢 ${f.unvan}`
        }
      })

      const winnerFirmaId = (dosya as any)?.firma_id
      if (winnerFirmaId) {
        fileFirms.forEach((f) => {
          if (f.id === winnerFirmaId || f.temin_firma_id === winnerFirmaId || f.firma_id === winnerFirmaId) {
            f.isWinner = true
            const formattedTotal = f.total > 0 ? f.total.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''
            f.label = formattedTotal ? `🏆 ${f.unvan} (${formattedTotal} TL - Kazanan Firma)` : `🏆 ${f.unvan} (Kazanan Firma)`
          } else {
            f.isWinner = false
          }
        })
      }

      fileFirms.sort((a, b) => (b.isWinner ? 1 : 0) - (a.isWinner ? 1 : 0))

      const combinedFirms = [...fileFirms]
      globalFirms.forEach((g: any) => {
        if (
          g.unvan &&
          !combinedFirms.some(
            (f: any) => f.unvan && String(f.unvan).trim().toLowerCase() === String(g.unvan).trim().toLowerCase()
          )
        ) {
          combinedFirms.push(g)
        }
      })

      // Complete Node.js Server-side Document Context Pre-computation
      const winnerFirm = fileFirms.find((f: any) => f.isWinner) || fileFirms[0] || combinedFirms[0] || {}

      const ihtiyacKalemleri = items.map((kalem: any, idx: number) => {
        const miktarNum = Number(kalem.miktar || 0)
        let minPrice = Infinity
        let bestFirmName = ''

        const teklifler = fileFirms.map((firm: any) => {
          const bid = bids.find(
            (b: any) =>
              b.temin_kalem_id === kalem.id &&
              (b.temin_firma_id === firm.temin_firma_id || b.temin_firma_id === firm.id)
          )
          const priceNum = bid ? Number(bid.birim_fiyat || 0) : 0
          if (priceNum > 0 && priceNum < minPrice) {
            minPrice = priceNum
            bestFirmName = firm.unvan || ''
          }
          const formattedPrice =
            priceNum > 0
              ? priceNum.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
              : ''
          const itemTotalNum = priceNum * miktarNum
          const formattedTutar =
            itemTotalNum > 0
              ? itemTotalNum.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
              : ''

          return {
            firmaId: firm.id,
            firmaUnvan: firm.unvan,
            birimFiyat: priceNum,
            fiyat: formattedPrice,
            tutar: formattedTutar
          }
        })

        const validMinPrice = minPrice !== Infinity ? minPrice : 0
        const itemCostNum = validMinPrice * miktarNum

        return {
          ...kalem,
          siraNo: idx + 1,
          malzemeAdi: kalem.kalem_adi || '',
          ozelligi: kalem.aciklama || '',
          birimi: kalem.birim || '',
          miktar: miktarNum,
          enUygunFirmaAdi: bestFirmName,
          enDusukFiyat:
            validMinPrice > 0
              ? validMinPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
              : '-',
          toplamBedel:
            itemCostNum > 0
              ? itemCostNum.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
              : '-',
          firmaTeklifleri: teklifler,
          firmaTeklifleriDetay: teklifler
        }
      })

      const firmaTotals = fileFirms.map((firm: any) => ({
        firmaId: firm.id,
        unvan: firm.unvan,
        toplam:
          firm.total > 0
            ? firm.total.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : '0,00'
      }))

      let grandTotalNum = 0
      if (winnerFirm && winnerFirm.total > 0) {
        grandTotalNum = winnerFirm.total
      } else {
        grandTotalNum = ihtiyacKalemleri.reduce((sum: number, k: any) => {
          const raw = String(k.toplamBedel).replace(/\./g, '').replace(/,/g, '.')
          const n = parseFloat(raw)
          return sum + (isNaN(n) ? 0 : n)
        }, 0)
      }

      const formattedGrandTotal =
        grandTotalNum > 0
          ? grandTotalNum.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          : '0,00'

      let antetSatirlari: string[] = []
      if ((kurum as any)?.kurum_anteti) {
        try {
          const parsed = JSON.parse((kurum as any).kurum_anteti)
          if (Array.isArray(parsed)) {
            antetSatirlari = parsed.filter((s: string) => s && s.trim() !== '')
          }
        } catch {
          if (typeof (kurum as any).kurum_anteti === 'string' && (kurum as any).kurum_anteti.trim()) {
            antetSatirlari = (kurum as any).kurum_anteti.split('\n').map((s: string) => s.trim()).filter(Boolean)
          }
        }
      }
      if (antetSatirlari.length === 0) {
        const kurumAdiText = (kurum as any)?.ust_kurum_adi || (kurum as any)?.kurum_adi || (kurum as any)?.ad || settingsMap.institutionName || 'KAMU KURUMU'
        antetSatirlari = ['T.C.', String(kurumAdiText).toUpperCase()]
      }

      const birimAntet = (
        (dosya as any)?.antet_ek_satir ||
        (dosya as any)?.birim_antet_ek_satir ||
        (dosya as any)?.birim_tablo_adi ||
        (dosya as any)?.birim_adi ||
        (dosya as any)?.harcama_birimi ||
        settingsMap.spendingUnit ||
        ''
      ).trim()

      if (
        birimAntet &&
        !antetSatirlari.some((s: string) => s.trim().toUpperCase() === birimAntet.toUpperCase())
      ) {
        antetSatirlari.push(birimAntet)
      }

      const kurumAdi = (kurum as any)?.kurum_adi || (kurum as any)?.ad || settingsMap.institutionName || 'T.C. KAMU KURUMU'
      const harcamaBirimi =
        birimAntet || (dosya as any)?.harcama_birimi || settingsMap.spendingUnit || (dosya as any)?.konu || 'HARCAMA BİRİMİ'

      const hazirlayanPersonel = (personelListesi as any[]).find(
        (p: any) => p.id === (dosya as any)?.hazirlayan_personel_id
      )
      const talepEdenPersonel = (personelListesi as any[]).find(
        (p: any) => p.id === (dosya as any)?.talep_eden_personel_id
      )
      const onaylayanPersonel = (personelListesi as any[]).find(
        (p: any) => p.id === (dosya as any)?.onay_personel_id
      )

      const resolvedContext = {
        kurumAdi,
        harcamaBirimi,
        birimAdi: birimAntet,
        birimAnteti: birimAntet,
        antetEkSatir: birimAntet,
        antetSatirlari,
        hazirlayanPersonelAdi: hazirlayanPersonel?.ad_soyad || '',
        hazirlayanPersonelUnvan: hazirlayanPersonel?.unvan || '',
        hazirlayanTelefon: hazirlayanPersonel?.telefon || '',
        talepEdenPersonelAdi: talepEdenPersonel?.ad_soyad || '',
        talepEdenPersonelUnvan: talepEdenPersonel?.unvan || '',
        talepEdenTelefon: talepEdenPersonel?.telefon || '',
        onaylayanPersonelAdi: onaylayanPersonel?.ad_soyad || '',
        onaylayanPersonelUnvan: onaylayanPersonel?.unvan || '',
        antetSatir1: antetSatirlari[0] || '',
        antetSatir2: antetSatirlari[1] || '',
        antetSatir3: antetSatirlari[2] || '',
        antetSatir4: antetSatirlari[3] || '',
        solLogo,
        sagLogo,
        dosyaNo: (dosya as any)?.temin_no || '',
        konu: (dosya as any)?.konu || '',
        isinAdi: (dosya as any)?.konu || '',
        isinTanimi: (dosya as any)?.isin_aciklamasi || (dosya as any)?.konu || '',
        yaklasikMaliyet: (dosya as any)?.yaklasik_maliyet
          ? Number((dosya as any).yaklasik_maliyet).toLocaleString('tr-TR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })
          : formattedGrandTotal,
        genelToplam: formattedGrandTotal,
        yukleniciFirma: winnerFirm.unvan || '',
        yukleniciYetkili: winnerFirm.yetkili_ad_soyad || '',
        yukleniciAdresi: winnerFirm.adres || '',
        yukleniciIlce: winnerFirm.ilce || '',
        yukleniciIl: winnerFirm.il || '',
        teslimGun: (dosya as any)?.teslim_gun !== undefined && (dosya as any)?.teslim_gun !== null && String((dosya as any).teslim_gun).trim() !== '' ? String((dosya as any).teslim_gun) : '7',
        teslimGunu: (dosya as any)?.teslim_gun !== undefined && (dosya as any)?.teslim_gun !== null && String((dosya as any).teslim_gun).trim() !== '' ? String((dosya as any).teslim_gun) : '7',
        teslimTarihi: (dosya as any)?.teslim_tarihi || '',
        dosyaTarihi: (dosya as any)?.tarih || (dosya as any)?.temin_tarihi || new Date().toLocaleDateString('tr-TR'),
        evrakSayisi: (dosya as any)?.evrak_sayisi || (dosya as any)?.temin_no || '',
        ihtiyacKalemleri,
        firmaListesi: combinedFirms,
        firmalar: fileFirms,
        firmaToplamlari: firmaTotals,
        firmaToplamlariDetay: firmaTotals,
        komisyon: komisyonlar.map((k: any) => ({
          adSoyad: k.resolved_ad_soyad || k.ad_soyad || '',
          unvan: k.resolved_unvan || k.unvan || '',
          gorevi: k.gorevi || 'Üye'
        }))
      }

      return {
        success: true,
        data: {
          dosya,
          kurum,
          solLogo,
          sagLogo,
          settings: settingsMap,
          personelListesi,
          firmaListesi: combinedFirms,
          fileFirms,
          items,
          bids,
          komisyonlar,
          savedSnapshot,
          resolvedContext
        }
      }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  // 12. Full Dossier Document Center & Templates Engine (Ultra Fast Server-Side Resolution)
  handleDoc('belge:get-all-cikti-data', 'get-all-cikti-data', async (_, payload: { dosyaId?: number }) => {
    try {
      const { workspaceManager } = require('../database/workspace')
      const db = workspaceManager.getDb()
      const dosyaId = Number(payload?.dosyaId || 0)

      // 1. Master HTML & Master JSON
      const masterHtml =
        readSystemTemplate('master.html') ||
        '<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body>{{{content}}}</body></html>'
      let masterJson: any = {}
      const rawMasterJson = readSystemTemplate('master.html.json')
      if (rawMasterJson) {
        try {
          masterJson = JSON.parse(rawMasterJson)
        } catch {}
      }

      // 2. Templates (Latest active templates)
      const sablons = db
        .prepare(
          'SELECT * FROM TANIM_Sablon WHERE id IN (SELECT MAX(id) FROM TANIM_Sablon WHERE aktif_mi = 1 GROUP BY COALESCE(parent_id, id)) ORDER BY kategori ASC, ad ASC'
        )
        .all()

      // 3. Placeholders
      let placeholders: any[] = []
      try {
        placeholders = db.prepare('SELECT * FROM TANIM_Placeholder').all()
      } catch {}

      // 4. Personnel
      const personelListesi = db
        .prepare(
          'SELECT id, ad_soyad, unvan, telefon, eposta, birim, sicil_no FROM TANIM_Personel WHERE COALESCE(aktif_mi, 1) = 1 OR aktif_mi = "1" OR aktif_mi = "true" OR aktif_mi IS NULL ORDER BY ad_soyad ASC'
        )
        .all()

      // 5. Institution & Settings
      const kurum = db.prepare('SELECT * FROM TANIM_Kurum LIMIT 1').get() || {}
      const settingsMap: Record<string, string> = {}
      try {
        const settingsRows = db.prepare('SELECT key, value FROM settings').all()
        settingsRows.forEach((r: any) => {
          if (r.key) settingsMap[r.key] = r.value
        })
      } catch {}

      const solLogo =
        (kurum as any)?.logo_sol ||
        (kurum as any)?.logo_url ||
        settingsMap.logoLeft ||
        settingsMap.institutionLogo ||
        null
      const sagLogo = (kurum as any)?.logo_sag || settingsMap.logoRight || null

      let activeDosya: any = null
      let items: any[] = []
      let fileFirms: any[] = []
      let bids: any[] = []
      let komisyonlar: any[] = []

      if (dosyaId) {
        activeDosya =
          db
            .prepare(
              `
          SELECT d.*, 
                 b.antet_ek_satir as birim_antet_ek_satir,
                 b.birim_adi as birim_tablo_adi,
                 b.harcama_kodu as harcama_birim_kodu,
                 b.muhasebe_kodu,
                 p.ad_soyad as onaylayan_ad_soyad, p.unvan as onaylayan_unvan, p.telefon as onaylayan_telefon,
                 h.ad_soyad as hazirlayan_ad_soyad, h.unvan as hazirlayan_unvan,
                 h.telefon as hazirlayan_telefon, h.eposta as hazirlayan_eposta,
                 te.ad_soyad as talep_eden_ad_soyad, te.unvan as talep_eden_unvan, te.telefon as talep_eden_telefon,
                 su.ad_soyad as sunan_ad_soyad, su.unvan as sunan_unvan, su.telefon as sunan_telefon,
                 iy.ad_soyad as irtibat_ad_soyad, iy.unvan as irtibat_unvan, iy.telefon as irtibat_telefon,
                 f.unvan as yuklenici_firma_adi,
                 f.adres as yuklenici_firma_adresi,
                 f.ilce as yuklenici_firma_ilcesi,
                 f.il as yuklenici_firma_ili,
                 f.telefon as yuklenici_firma_telefon,
                 f.faks as yuklenici_firma_faks,
                 f.email as yuklenici_firma_email,
                 f.vergi_dairesi as yuklenici_firma_vergi_dairesi,
                 f.vergi_no as yuklenici_firma_vergi_no
          FROM DATA_TeminDosyasi d 
          LEFT JOIN TANIM_Birim b ON d.birim_id = b.id
          LEFT JOIN TANIM_Personel p ON d.onay_personel_id = p.id 
          LEFT JOIN TANIM_Personel h ON d.hazirlayan_personel_id = h.id
          LEFT JOIN TANIM_Personel te ON d.talep_eden_personel_id = te.id
          LEFT JOIN TANIM_Personel su ON d.sunan_personel_id = su.id
          LEFT JOIN TANIM_Personel iy ON d.irtibat_yetkilisi_id = iy.id
          LEFT JOIN TANIM_Firma f ON d.firma_id = f.id
          WHERE d.id = ?
        `
            )
            .get(dosyaId) || null

        items = db
          .prepare(
            'SELECT * FROM DATA_TeminKalem WHERE temin_dosya_id = ? ORDER BY id ASC'
          )
          .all(dosyaId)

        fileFirms = db
          .prepare(
            `
          SELECT 
            df.id as temin_firma_id,
            COALESCE(f.id, df.firma_id, df.id) as id,
            COALESCE(NULLIF(df.unvan, ''), NULLIF(f.unvan, ''), NULLIF(f.firma_adi, ''), NULLIF(df.firma_adi, ''), 'İstekli Firma') as unvan,
            COALESCE(NULLIF(f.yetkili_ad_soyad, ''), NULLIF(df.yetkili_ad_soyad, '')) as yetkili_ad_soyad,
            COALESCE(NULLIF(f.telefon, ''), NULLIF(df.telefon, '')) as telefon,
            COALESCE(NULLIF(f.eposta, ''), NULLIF(df.email, '')) as eposta,
            COALESCE(NULLIF(f.adres, ''), NULLIF(df.adres, '')) as adres,
            COALESCE(NULLIF(f.vergi_no, ''), NULLIF(df.vergi_no, '')) as vergi_no,
            COALESCE(NULLIF(f.vergi_dairesi, ''), NULLIF(df.vergi_dairesi, '')) as vergi_dairesi
          FROM DATA_TeminFirma df
          LEFT JOIN TANIM_Firma f ON df.firma_id = f.id
          WHERE df.temin_dosya_id = ?
          ORDER BY df.id ASC
        `
          )
          .all(dosyaId)

        bids = db
          .prepare(
            'SELECT temin_kalem_id, temin_firma_id, birim_fiyat FROM DATA_TeminKalemTeklif WHERE temin_dosya_id = ?'
          )
          .all(dosyaId)

        komisyonlar = db
          .prepare(
            `
          SELECT tk.*, 
                 COALESCE(NULLIF(tk.ad_soyad, ''), NULLIF(p.ad_soyad, ''), '') as resolved_ad_soyad,
                 COALESCE(NULLIF(tk.unvan, ''), NULLIF(p.unvan, ''), '') as resolved_unvan,
                 COALESCE(k.ad, '') as komisyon_turu_adi
          FROM DATA_TeminKomisyon tk
          LEFT JOIN TANIM_Personel p ON tk.personel_id = p.id
          LEFT JOIN TANIM_Komisyon k ON tk.komisyon_id = k.id
          WHERE tk.temin_dosya_id = ?
        `
          )
          .all(dosyaId)
      }

      if (!komisyonlar || komisyonlar.length === 0) {
        try {
          komisyonlar = db
            .prepare(
              `
            SELECT u.*, 
                   p.ad_soyad as resolved_ad_soyad, 
                   p.unvan as resolved_unvan, 
                   COALESCE(g.ad, 'Üye') as gorevi,
                   k.ad as komisyon_turu_adi
            FROM TANIM_KomisyonUye u
            JOIN TANIM_Komisyon k ON u.komisyon_id = k.id
            LEFT JOIN TANIM_Personel p ON u.personel_id = p.id
            LEFT JOIN TANIM_KomisyonGorevi g ON u.gorev_id = g.id
            WHERE (k.aktif_mi = 1 OR k.aktif_mi IS NULL)
          `
            )
            .all()
        } catch {}
      }

      // Build Bids Map
      const bidsMap: Record<string, number> = {}
      bids.forEach((b: any) => {
        bidsMap[`${b.temin_kalem_id}_${b.temin_firma_id}`] = b.birim_fiyat || 0
      })

      // Calculate Bid Totals per Firm
      const firmaTotals: Record<number, { unvan: string; total: number; formatted: string }> = {}
      fileFirms.forEach((f: any) => {
        let fTotal = 0
        items.forEach((item: any) => {
          const unitP = bidsMap[`${item.id}_${f.temin_firma_id}`] || 0
          const qty = Number(item.miktar || 0)
          fTotal += unitP * qty
        })
        firmaTotals[f.temin_firma_id] = {
          unvan: f.unvan,
          total: fTotal,
          formatted: fTotal.toLocaleString('tr-TR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })
        }
      })

      // Find Best / Winning Firm
      let minFirmaTotal = Infinity
      let winnerFirm: any = {
        unvan: activeDosya?.yuklenici_firma_adi || '',
        yetkili_ad_soyad: ''
      }
      fileFirms.forEach((f: any) => {
        const t = firmaTotals[f.temin_firma_id]?.total || 0
        if (t > 0 && t < minFirmaTotal) {
          minFirmaTotal = t
          winnerFirm = f
        }
      })
      if (!winnerFirm.unvan && activeDosya?.yuklenici_firma_adi) {
        winnerFirm.unvan = activeDosya.yuklenici_firma_adi
      }

      // Build items with bidder columns
      const ihtiyacKalemleri = items.map((item: any, idx: number) => {
        const miktarNum = Number(item.miktar || 0)
        const itemBids: {
          firmaId: number
          firmaAdi: string
          birimFiyat: number
          toplamFiyat: number
        }[] = []
        let minPrice = Infinity
        let bestFirm = ''

        fileFirms.forEach((f: any) => {
          const unitPrice = bidsMap[`${item.id}_${f.temin_firma_id}`] || 0
          const lineTotal = unitPrice * miktarNum
          if (unitPrice > 0 && unitPrice < minPrice) {
            minPrice = unitPrice
            bestFirm = f.unvan
          }
          itemBids.push({
            firmaId: f.temin_firma_id,
            firmaAdi: f.unvan,
            birimFiyat: unitPrice,
            toplamFiyat: lineTotal
          })
        })

        const resItem: any = {
          siraNo: idx + 1,
          id: item.id,
          kalemAdi: item.kalem_adi || item.malzeme_adi || '',
          malzemeAdi: item.kalem_adi || item.malzeme_adi || '',
          aciklama: item.aciklama || '',
          birim: item.birim || 'Adet',
          miktar: miktarNum,
          miktarFormatted: miktarNum.toLocaleString('tr-TR'),
          tasinirKodu: item.tasinir_kodu || '',
          kdvOrani: item.kdv_orani ?? 20,
          teklifler: itemBids,
          enUygunFiyat:
            minPrice !== Infinity
              ? minPrice.toLocaleString('tr-TR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })
              : '',
          enUygunFirma: bestFirm,
          birimFiyat:
            minPrice !== Infinity
              ? minPrice.toLocaleString('tr-TR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })
              : '0,00',
          toplamBedel:
            minPrice !== Infinity
              ? (minPrice * miktarNum).toLocaleString('tr-TR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })
              : '0,00'
        }

        // Dynamic columns firma1Fiyat, firma2Fiyat, etc.
        fileFirms.forEach((f: any, fIdx: number) => {
          const unitP = bidsMap[`${item.id}_${f.temin_firma_id}`] || 0
          const totalP = unitP * miktarNum
          resItem[`firma${fIdx + 1}Fiyat`] =
            unitP > 0
              ? unitP.toLocaleString('tr-TR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })
              : '-'
          resItem[`firma${fIdx + 1}Toplam`] =
            totalP > 0
              ? totalP.toLocaleString('tr-TR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })
              : '-'
        })

        return resItem
      })

      // Grand Total
      let grandTotalNum = activeDosya?.yaklasik_maliyet ? Number(activeDosya.yaklasik_maliyet) : 0
      if (!grandTotalNum && minFirmaTotal !== Infinity && minFirmaTotal > 0) {
        grandTotalNum = minFirmaTotal
      }
      if (!grandTotalNum) {
        grandTotalNum = ihtiyacKalemleri.reduce((sum: number, k: any) => {
          const raw = String(k.toplamBedel).replace(/\./g, '').replace(/,/g, '.')
          const n = parseFloat(raw)
          return sum + (isNaN(n) ? 0 : n)
        }, 0)
      }

      const formattedGrandTotal =
        grandTotalNum > 0
          ? grandTotalNum.toLocaleString('tr-TR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })
          : '0,00'

      let antetSatirlari: string[] = []
      if ((kurum as any)?.kurum_anteti) {
        try {
          const parsed = JSON.parse((kurum as any).kurum_anteti)
          if (Array.isArray(parsed)) {
            antetSatirlari = parsed.filter((s: string) => s && s.trim() !== '')
          }
        } catch {
          if (typeof (kurum as any).kurum_anteti === 'string' && (kurum as any).kurum_anteti.trim()) {
            antetSatirlari = (kurum as any).kurum_anteti.split('\n').map((s: string) => s.trim()).filter(Boolean)
          }
        }
      }
      if (antetSatirlari.length === 0) {
        const kurumAdiText = (kurum as any)?.ust_kurum_adi || (kurum as any)?.kurum_adi || (kurum as any)?.ad || settingsMap.institutionName || 'KAMU KURUMU'
        antetSatirlari = ['T.C.', String(kurumAdiText).toUpperCase()]
      }

      const birimAntet = (
        activeDosya?.antet_ek_satir ||
        activeDosya?.birim_antet_ek_satir ||
        activeDosya?.birim_tablo_adi ||
        activeDosya?.birim_adi ||
        activeDosya?.harcama_birimi ||
        settingsMap.spendingUnit ||
        ''
      ).trim()

      if (
        birimAntet &&
        !antetSatirlari.some((s: string) => s.trim().toUpperCase() === birimAntet.toUpperCase())
      ) {
        antetSatirlari.push(birimAntet)
      }

      const kurumAdi = (kurum as any)?.kurum_adi || (kurum as any)?.ad || settingsMap.institutionName || 'T.C. KAMU KURUMU'
      const harcamaBirimi =
        birimAntet || activeDosya?.harcama_birimi || settingsMap.spendingUnit || activeDosya?.konu || 'HARCAMA BİRİMİ'

      const dosyaContext: any = {
        ...masterJson,
        kurumAdi,
        harcamaBirimi,
        birimAdi: birimAntet,
        birimAnteti: birimAntet,
        antetEkSatir: birimAntet,
        antetSatirlari,
        antetSatir1: antetSatirlari[0] || '',
        antetSatir2: antetSatirlari[1] || '',
        antetSatir3: antetSatirlari[2] || '',
        antetSatir4: antetSatirlari[3] || '',
        solLogo,
        sagLogo,
        id: activeDosya?.id || 0,
        dosyaNo: activeDosya?.temin_no || '',
        teminNo: activeDosya?.temin_no || '',
        dosya_no: activeDosya?.temin_no || '',
        konu: activeDosya?.konu || '',
        is_adi: activeDosya?.konu || '',
        isinAdi: activeDosya?.konu || '',
        isinTanimi: activeDosya?.isin_aciklamasi || activeDosya?.konu || '',
        isin_tanimi: activeDosya?.isin_aciklamasi || activeDosya?.konu || '',
        butceYili: activeDosya?.butce_yili || new Date().getFullYear().toString(),
        butce_yili: activeDosya?.butce_yili || new Date().getFullYear().toString(),
        tarih: activeDosya?.tarih || new Date().toLocaleDateString('tr-TR'),
        dosyaTarihi: activeDosya?.tarih || new Date().toLocaleDateString('tr-TR'),
        kararNo: activeDosya?.karar_no || '',
        karar_no: activeDosya?.karar_no || '',
        faturaNo: activeDosya?.fatura_no || '',
        fatura_no: activeDosya?.fatura_no || '',
        faturaTarihi: activeDosya?.fatura_tarihi || '',
        fatura_tarihi: activeDosya?.fatura_tarihi || '',
        yaklasikMaliyet: activeDosya?.yaklasik_maliyet
          ? Number(activeDosya.yaklasik_maliyet).toLocaleString('tr-TR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })
          : formattedGrandTotal,
        yaklasik_maliyet: formattedGrandTotal,
        yaklasik_maliyet_yaziyla: numberToTurkishWords(grandTotalNum),
        kdv_haric_toplam_yaziyla: numberToTurkishWords(grandTotalNum),
        genelToplam: formattedGrandTotal,
        genel_toplam_yaziyla: numberToTurkishWords(grandTotalNum),
        yukleniciFirma: winnerFirm.unvan || '',
        yukleniciYetkili: winnerFirm.yetkili_ad_soyad || '',
        yukleniciAdresi: winnerFirm.adres || activeDosya?.yuklenici_firma_adresi || '',
        yukleniciVergiNo: winnerFirm.vergi_no || activeDosya?.yuklenici_firma_vergi_no || '',
        yukleniciVergiDairesi:
          winnerFirm.vergi_dairesi || activeDosya?.yuklenici_firma_vergi_dairesi || '',
        ihtiyacKalemleri,
        kalemler: ihtiyacKalemleri,
        firmalar: fileFirms,
        firmaListesi: fileFirms,
        firmaToplamlari: Object.values(firmaTotals),
        firmaToplamlariDetay: firmaTotals,
        harcamaYetkilisi: {
          adSoyad: activeDosya?.onaylayan_ad_soyad || '',
          unvan: activeDosya?.onaylayan_unvan || 'Harcama Yetkilisi',
          telefon: activeDosya?.onaylayan_telefon || ''
        },
        gerceklestirmeGorevlisi: {
          adSoyad: activeDosya?.hazirlayan_ad_soyad || '',
          unvan: activeDosya?.hazirlayan_unvan || 'Gerçekleştirme Görevlisi',
          telefon: activeDosya?.hazirlayan_telefon || ''
        },
        komisyon: komisyonlar.map((k: any) => ({
          adSoyad: k.resolved_ad_soyad || k.ad_soyad || '',
          unvan: k.resolved_unvan || k.unvan || '',
          gorevi: k.gorevi || 'Üye',
          komisyonTuru: k.komisyon_turu_adi || ''
        }))
      }

      // Pre-render HTML map using Mustache on server side for every active template
      const renderedHtmlMap: Record<number, string> = {}
      sablons.forEach((sab: any) => {
        try {
          let body = sab.html_icerik || ''
          if (!body && sab.dosya_adi) {
            body = readSystemTemplate(sab.dosya_adi) || ''
          }
          if (body) {
            const innerHtml = Mustache.render(body, dosyaContext)
            const fullHtml = masterHtml
              ? masterHtml.replace('{{{content}}}', innerHtml)
              : innerHtml
            renderedHtmlMap[sab.id] = fullHtml
          }
        } catch {}
      })

      return {
        success: true,
        data: {
          sablons,
          masterHtml,
          dosyaContext,
          renderedHtmlMap,
          placeholders,
          personelListesi,
          settings: settingsMap,
          activeDosya
        }
      }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })
}


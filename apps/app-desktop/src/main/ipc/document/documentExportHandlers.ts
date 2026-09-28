import { dialog, BrowserWindow, shell, app } from 'electron'
import { join } from 'path'
import fs from 'fs'
import AdmZip from 'adm-zip'
import { renderDocxBuffer } from '../../docxService'
import { renderPdfBuffer } from '../../pdfService'

export async function exportDocxHandler(
  payload: any,
  legacyFileName?: string
): Promise<{ success: boolean; filePath?: string; error?: string }> {
  try {
    const htmlContent =
      typeof payload === 'string' ? payload : payload?.html || payload?.htmlContent || ''
    const rawFileName =
      (typeof payload === 'object' &&
        (payload?.defaultFilename || payload?.fileName || payload?.filename)) ||
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
}

export async function exportUdfHandler(
  payload: any,
  legacyFileName?: string
): Promise<{ success: boolean; filePath?: string; error?: string }> {
  try {
    const htmlContent =
      typeof payload === 'string' ? payload : payload?.html || payload?.htmlContent || ''
    const rawFileName =
      (typeof payload === 'object' &&
        (payload?.defaultFilename || payload?.fileName || payload?.filename)) ||
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
}

export async function printHtmlHandler(
  payload: any,
  legacyOptions?: any
): Promise<{ success: boolean; error?: string }> {
  try {
    const htmlContent =
      typeof payload === 'string' ? payload : payload?.html || payload?.htmlContent || ''
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
}

export async function previewPdfHandler(
  htmlContent: string
): Promise<{ success: boolean; data?: string; error?: string }> {
  try {
    const pdfBuffer = await renderPdfBuffer(htmlContent)
    return { success: true, data: pdfBuffer.toString('base64') }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function openPdfExternalHandler(
  payload: any
): Promise<{ success: boolean; tempPath?: string; error?: string }> {
  try {
    const html =
      typeof payload === 'string' ? payload : payload?.html || payload?.htmlContent || ''
    const pdfBuffer = await renderPdfBuffer(html)
    const tempPath = join(app.getPath('temp'), `temin360_preview_${Date.now()}.pdf`)
    fs.writeFileSync(tempPath, pdfBuffer)
    await shell.openPath(tempPath)
    return { success: true, tempPath }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function exportPdfHandler(
  payload: any,
  _legacyOptions?: any,
  legacyFileName?: string
): Promise<{ success: boolean; filePath?: string; error?: string }> {
  try {
    const html =
      typeof payload === 'string' ? payload : payload?.html || payload?.htmlContent || ''
    const defaultFilename =
      (typeof payload === 'object' &&
        (payload?.defaultFilename || payload?.fileName || payload?.filename)) ||
      legacyFileName ||
      'Belge.pdf'

    const { canceled, filePath } = await dialog.showSaveDialog({
      title: 'PDF Olarak Kaydet',
      defaultPath: defaultFilename.endsWith('.pdf')
        ? defaultFilename
        : `${defaultFilename}.pdf`,
      filters: [{ name: 'PDF Dosyası', extensions: ['pdf'] }]
    })
    if (canceled || !filePath) return { success: false, error: 'İptal edildi' }

    const pdfBuffer = await renderPdfBuffer(html)
    fs.writeFileSync(filePath, pdfBuffer)
    return { success: true, filePath }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function exportZipHandler(
  payload: any,
  legacyZipName?: string
): Promise<{ success: boolean; filePath?: string; count?: number; error?: string }> {
  try {
    let items: Array<{
      name: string
      html?: string
      content?: string | Buffer
      format?: 'pdf' | 'docx' | 'udf' | 'html'
    }> = []
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
      const cleanName = rawName
        .replace(/[/\\:*?"<>|]/g, '_')
        .replace(/\.(pdf|docx|udf|html)$/i, '')

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
}

export async function exportHtmlHandler(
  htmlContent: string,
  options?: { paperSize?: string },
  fileName?: string
): Promise<{ success: boolean; filePath?: string; error?: string }> {
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
}

export async function exportXlsxHandler(
  bufferData: Uint8Array | ArrayBuffer
): Promise<{ success: boolean; filePath?: string; error?: string }> {
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
}

export async function importDocxHandler(): Promise<{ success: boolean; html?: string; messages?: any[]; error?: string }> {
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
}

export async function importXlsxHandler(): Promise<{ success: boolean; buffer?: ArrayBuffer; error?: string }> {
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
}

export async function openExcelHandler(): Promise<{ success: boolean; filePath?: string; error?: string }> {
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
}

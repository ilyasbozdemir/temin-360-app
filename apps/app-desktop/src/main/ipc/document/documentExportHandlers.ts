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
    const html = typeof payload === 'string' ? payload : payload?.html || payload?.htmlContent || ''
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
    const html = typeof payload === 'string' ? payload : payload?.html || payload?.htmlContent || ''
    const defaultFilename =
      (typeof payload === 'object' &&
        (payload?.defaultFilename || payload?.fileName || payload?.filename)) ||
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

export async function importDocxHandler(): Promise<{
  success: boolean
  html?: string
  messages?: any[]
  error?: string
}> {
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

export async function importXlsxHandler(): Promise<{
  success: boolean
  buffer?: ArrayBuffer
  error?: string
}> {
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

export async function openExcelHandler(): Promise<{
  success: boolean
  filePath?: string
  error?: string
}> {
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

export async function convertDocxToPdfHandler(payload?: {
  filePath?: string
  base64?: string
  fileName?: string
  fontFamily?: string
  fontSize?: string
  margins?: string
  lineHeight?: string
  saveImmediately?: boolean
}): Promise<{
  success: boolean
  data?: string
  filePath?: string
  html?: string
  fileName?: string
  error?: string
}> {
  try {
    let inputPath = payload?.filePath
    let originalName = payload?.fileName || 'Dokuman'

    if (!inputPath && !payload?.base64) {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        title: 'Word (.docx) Dosyası Seçin',
        filters: [{ name: 'Word Dokümanı (*.docx)', extensions: ['docx'] }],
        properties: ['openFile']
      })
      if (canceled || !filePaths || filePaths.length === 0) {
        return { success: false, error: 'Dosya seçimi iptal edildi' }
      }
      inputPath = filePaths[0]
      originalName = inputPath.split(/[/\\]/).pop() || 'Dokuman.docx'
    }

    const mammoth = require('mammoth')
    let conversionResult: { value: string; messages: any[] }

    if (payload?.base64) {
      const buffer = Buffer.from(payload.base64.replace(/^data:.*?;base64,/, ''), 'base64')
      conversionResult = await mammoth.convertToHtml({ buffer })
    } else if (inputPath) {
      conversionResult = await mammoth.convertToHtml({ path: inputPath })
    } else {
      return { success: false, error: 'Geçerli Word verisi sağlanamadı' }
    }

    const rawHtml = conversionResult.value || '<p>(Boş Doküman)</p>'
    const font = payload?.fontFamily || "'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    const size = payload?.fontSize || '11pt'
    const margin = payload?.margins || '20mm'
    const lineH = payload?.lineHeight || '1.6'

    const fullHtml = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <title>${originalName.replace(/\.docx$/i, '')}</title>
  <style>
    @page { 
      size: A4; 
      margin: ${margin}; 
    }
    *, *::before, *::after {
      box-sizing: border-box;
    }
    body {
      font-family: ${font};
      font-size: ${size};
      line-height: ${lineH};
      color: #1e293b;
      background: #ffffff;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
      word-wrap: break-word;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 14px 0;
      page-break-inside: auto;
    }
    tr {
      page-break-inside: avoid;
      page-break-after: auto;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 6px 10px;
      font-size: 10pt;
      vertical-align: top;
      text-align: left;
    }
    th {
      background-color: #f8fafc;
      font-weight: 700;
      color: #0f172a;
    }
    h1 { font-size: 16pt; font-weight: 800; color: #0f172a; margin: 18px 0 8px 0; }
    h2 { font-size: 14pt; font-weight: 700; color: #1e293b; margin: 16px 0 6px 0; }
    h3 { font-size: 12pt; font-weight: 700; color: #334155; margin: 14px 0 4px 0; }
    p { margin: 0 0 10px 0; }
    ul, ol { margin: 0 0 12px 0; padding-left: 24px; }
    li { margin-bottom: 4px; }
    img { max-width: 100%; height: auto; display: block; margin: 12px 0; }
    blockquote {
      margin: 12px 0;
      padding-left: 14px;
      border-left: 4px solid #94a3b8;
      color: #475569;
      font-style: italic;
    }
  </style>
</head>
<body>
  <div class="docx-rendered-content">
    ${rawHtml}
  </div>
</body>
</html>`

    const pdfBuffer = await renderPdfBuffer(fullHtml)
    const base64Data = pdfBuffer.toString('base64')
    const suggestedPdfName = originalName.replace(/\.docx$/i, '') + '.pdf'

    if (payload?.saveImmediately) {
      const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'Dönüştürülen PDF Dosyasını Kaydet',
        defaultPath: suggestedPdfName,
        filters: [{ name: 'PDF Dokümanı (*.pdf)', extensions: ['pdf'] }]
      })
      if (!canceled && filePath) {
        fs.writeFileSync(filePath, pdfBuffer)
        return {
          success: true,
          filePath,
          data: base64Data,
          html: rawHtml,
          fileName: suggestedPdfName
        }
      }
    }

    return {
      success: true,
      data: base64Data,
      html: rawHtml,
      fileName: suggestedPdfName
    }
  } catch (err: any) {
    console.error('convertDocxToPdf error:', err)
    return { success: false, error: err.message || 'Word to PDF dönüştürme hatası' }
  }
}

export async function convertImagesToPdfHandler(payload: {
  images: Array<{
    name?: string
    dataUrl: string
    orientation?: 'portrait' | 'landscape'
  }>
  fit?: 'contain' | 'cover' | 'fill'
  margins?: string
  title?: string
  saveImmediately?: boolean
}): Promise<{
  success: boolean
  data?: string
  filePath?: string
  error?: string
}> {
  try {
    const images = payload.images || []
    if (images.length === 0) {
      return { success: false, error: 'En az bir görsel eklenmelidir.' }
    }

    const docTitle = payload.title || 'Gorseller_Birlestirilmis'
    const fitMode = payload.fit || 'contain'
    const margin = payload.margins || '0mm'

    const pagesHtml = images
      .map((img, idx) => {
        const isLandscape = img.orientation === 'landscape'
        return `
        <div class="image-page ${isLandscape ? 'page-landscape' : 'page-portrait'}" style="page-break-after: ${
          idx === images.length - 1 ? 'auto' : 'always'
        };">
          <img src="${img.dataUrl}" alt="${img.name || `Sayfa ${idx + 1}`}" class="fitted-image" />
        </div>
      `
      })
      .join('\n')

    const fullHtml = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <title>${docTitle}</title>
  <style>
    @page {
      size: A4;
      margin: ${margin};
    }
    @page landscape-section {
      size: A4 landscape;
      margin: ${margin};
    }
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      background: #ffffff;
      margin: 0;
      padding: 0;
    }
    .image-page {
      width: 100vw;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      background: #ffffff;
      page-break-inside: avoid;
    }
    .page-landscape {
      page: landscape-section;
    }
    .fitted-image {
      max-width: 98%;
      max-height: 98%;
      object-fit: ${fitMode};
      display: block;
      margin: auto;
    }
  </style>
</head>
<body>
  ${pagesHtml}
</body>
</html>`

    const pdfBuffer = await renderPdfBuffer(fullHtml)
    const base64Data = pdfBuffer.toString('base64')
    const suggestedPdfName = `${docTitle.replace(/\.pdf$/i, '')}.pdf`

    if (payload?.saveImmediately) {
      const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'Görsellerden Oluşturulan PDF Dosyasını Kaydet',
        defaultPath: suggestedPdfName,
        filters: [{ name: 'PDF Dokümanı (*.pdf)', extensions: ['pdf'] }]
      })
      if (!canceled && filePath) {
        fs.writeFileSync(filePath, pdfBuffer)
        return { success: true, filePath, data: base64Data }
      }
    }

    return {
      success: true,
      data: base64Data
    }
  } catch (err: any) {
    console.error('convertImagesToPdf error:', err)
    return { success: false, error: err.message || 'Görselleri PDF yapma hatası' }
  }
}

export async function saveBase64FileHandler(payload: {
  dataBase64: string
  defaultFilename: string
  filterName?: string
  extensions?: string[]
}): Promise<{ success: boolean; filePath?: string; error?: string }> {
  try {
    const rawData = (payload.dataBase64 || '').replace(/^data:.*?;base64,/, '')
    const buffer = Buffer.from(rawData, 'base64')
    const filterName = payload.filterName || 'Dosya'
    const extensions = payload.extensions || ['pdf']

    const { canceled, filePath } = await dialog.showSaveDialog({
      title: 'Dosyayı Kaydet',
      defaultPath: payload.defaultFilename,
      filters: [{ name: filterName, extensions }]
    })

    if (canceled || !filePath) return { success: false, error: 'Kaydetme iptal edildi' }

    fs.writeFileSync(filePath, buffer)
    return { success: true, filePath }
  } catch (err: any) {
    console.error('saveBase64File error:', err)
    return { success: false, error: err.message || 'Dosya kaydedilemedi' }
  }
}


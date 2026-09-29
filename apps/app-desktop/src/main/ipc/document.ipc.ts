import { ipcMain } from 'electron'
import { workspaceManager } from '../database/workspace'
import {
  exportDocxHandler,
  exportUdfHandler,
  printHtmlHandler,
  previewPdfHandler,
  openPdfExternalHandler,
  exportPdfHandler,
  exportZipHandler,
  exportHtmlHandler,
  exportXlsxHandler,
  importDocxHandler,
  importXlsxHandler,
  openExcelHandler,
  resolveDocumentPayload,
  resolveAllCiktiData
} from './document'

export function registerDocumentIpcHandlers(): void {
  // Helper to register both namespaced channel and legacy aliases
  const handleDoc = (
    channel: string,
    alias: string,
    handler: (event: any, ...args: any[]) => Promise<any> | any
  ): void => {
    ipcMain.handle(channel, handler)
    if (alias) {
      ipcMain.handle(alias, handler)
    }
  }

  // 1. DOCX Export
  handleDoc('belge:export-docx', 'export-docx', (_, payload: any, legacyFileName?: string) =>
    exportDocxHandler(payload, legacyFileName)
  )
  ipcMain.handle('app:export-docx', (_, payload: any, legacyFileName?: string) =>
    exportDocxHandler(payload, legacyFileName)
  )
  ipcMain.handle('app:save-docx-as', (_, payload: any, legacyFileName?: string) =>
    exportDocxHandler(payload, legacyFileName)
  )
  ipcMain.handle('save-docx-as', (_, payload: any, legacyFileName?: string) =>
    exportDocxHandler(payload, legacyFileName)
  )

  // 2. UDF Export
  handleDoc('belge:export-udf', 'export-udf', (_, payload: any, legacyFileName?: string) =>
    exportUdfHandler(payload, legacyFileName)
  )
  ipcMain.handle('app:export-udf', (_, payload: any, legacyFileName?: string) =>
    exportUdfHandler(payload, legacyFileName)
  )

  // 3. Print HTML
  handleDoc('belge:print-html', 'print-html', (_, payload: any, legacyOptions?: any) =>
    printHtmlHandler(payload, legacyOptions)
  )
  ipcMain.handle('app:print-html', (_, payload: any, legacyOptions?: any) =>
    printHtmlHandler(payload, legacyOptions)
  )

  // 4. Preview PDF
  handleDoc('belge:preview-pdf', 'preview-pdf', (_, htmlContent: string) =>
    previewPdfHandler(htmlContent)
  )

  // 5. Open PDF External
  handleDoc('belge:open-pdf-external', 'open-pdf-external', (_, payload: any) =>
    openPdfExternalHandler(payload)
  )

  // 5.1 Save PDF As & Export PDF
  handleDoc(
    'belge:export-pdf',
    'export-pdf',
    (_, payload: any, legacyOptions?: any, legacyFileName?: string) =>
      exportPdfHandler(payload, legacyOptions, legacyFileName)
  )
  handleDoc(
    'app:save-pdf-as',
    'save-pdf-as',
    (_, payload: any, legacyOptions?: any, legacyFileName?: string) =>
      exportPdfHandler(payload, legacyOptions, legacyFileName)
  )
  ipcMain.handle('app:export-pdf', (_, payload: any, legacyOptions?: any, legacyFileName?: string) =>
    exportPdfHandler(payload, legacyOptions, legacyFileName)
  )

  // 5.2 Open PDF Preview
  handleDoc('app:open-pdf-preview', 'open-pdf-preview', (_, payload: any) =>
    openPdfExternalHandler(payload)
  )

  // 5.3 Batch Export as ZIP
  handleDoc('belge:export-zip', 'export-zip', (_, payload: any, legacyZipName?: string) =>
    exportZipHandler(payload, legacyZipName)
  )
  ipcMain.handle('app:export-zip', (_, payload: any, legacyZipName?: string) =>
    exportZipHandler(payload, legacyZipName)
  )

  // 6. Export HTML
  handleDoc(
    'belge:export-html',
    'export-html',
    (_, htmlContent: string, options?: { paperSize?: string }, fileName?: string) =>
      exportHtmlHandler(htmlContent, options, fileName)
  )

  // 7. Export XLSX
  handleDoc('belge:export-xlsx', 'export-xlsx', (_, bufferData: Uint8Array | ArrayBuffer) =>
    exportXlsxHandler(bufferData)
  )

  // 8. Import DOCX
  handleDoc('belge:import-docx', 'import-docx', () => importDocxHandler())

  // 9. Import XLSX
  handleDoc('belge:import-xlsx', 'import-xlsx', () => importXlsxHandler())

  // 10. Open Excel External
  handleDoc('belge:open-excel', 'open-excel', () => openExcelHandler())

  // 11. Complete Document & Stage Data Resolver
  handleDoc(
    'belge:get-document-payload',
    'get-document-payload',
    async (_, payload: { dosyaId?: number; documentId?: string }) => {
      try {
        const db = workspaceManager.getDb()
        if (!db) return { success: false, error: 'Çalışma alanı veritabanı aktif değil' }
        return resolveDocumentPayload(db, payload)
      } catch (e: any) {
        return { success: false, error: e?.message || 'Payload hatası' }
      }
    }
  )

  // 12. Full Dossier Document Center & Templates Engine
  handleDoc(
    'belge:get-all-cikti-data',
    'get-all-cikti-data',
    async (_, payload: { dosyaId?: number }) => {
      try {
        const db = workspaceManager.getDb()
        if (!db) return { success: false, error: 'Çalışma alanı veritabanı aktif değil' }
        return resolveAllCiktiData(db, payload)
      } catch (e: any) {
        return { success: false, error: e?.message || 'Çıktı verisi hatası' }
      }
    }
  )
}


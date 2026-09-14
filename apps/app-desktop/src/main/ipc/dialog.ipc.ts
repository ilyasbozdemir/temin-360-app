import { ipcMain, BrowserWindow, dialog } from 'electron'
import { defaultFormat, perFormatFilters, allFormatsFilter } from '../config/fileFormats'

export function registerDialogIpcHandlers(): void {
  ipcMain.handle('dialog:showSaveDialog', async () => {
    const mainWindow = BrowserWindow.getAllWindows()[0]
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Yeni Veri Dosyası Oluştur',
      defaultPath: `Yeni Dosya.${defaultFormat.ext}`,
      filters: [allFormatsFilter, ...perFormatFilters]
    })
    return { canceled, filePath }
  })

  ipcMain.handle('dialog:showOpenDialog', async () => {
    const mainWindow = BrowserWindow.getAllWindows()[0]
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      title: 'Veri Dosyası Seç',
      filters: [allFormatsFilter, ...perFormatFilters],
      properties: ['openFile']
    })
    return { canceled, filePath: filePaths && filePaths.length > 0 ? filePaths[0] : null }
  })
}

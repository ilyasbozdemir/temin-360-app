import { ipcMain, app, BrowserWindow } from 'electron'
import { autoUpdater } from 'electron-updater'
import { join } from 'path'
import fs from 'fs'

export function registerUpdaterIpcHandlers(): void {
  let devUpdateVersionOverride = ''

  const sendUpdaterStatus = (status: string, data: any = {}) => {
    const windows = BrowserWindow.getAllWindows()
    windows.forEach((w) => {
      if (!w.isDestroyed()) {
        w.webContents.send('updater:status', { status, ...data })
      }
    })
  }

  autoUpdater.allowPrerelease = true
  autoUpdater.allowDowngrade = true

  if (!app.isPackaged) {
    autoUpdater.autoDownload = false
    autoUpdater.autoInstallOnAppQuit = false
    autoUpdater.logger = console
  }

  // Only auto-check for updates in production packaged mode
  if (app.isPackaged) {
    setTimeout(() => {
      autoUpdater.checkForUpdates().catch((e) => {
        console.error('Update check error:', e.message)
      })
    }, 5000)
  }

  ipcMain.handle('updater:set-dev-version', (_, mode: boolean, version: string) => {
    devUpdateVersionOverride = mode && version ? version : ''
    if (devUpdateVersionOverride && !app.isPackaged) {
      try {
        const semver = require('semver')
        Object.defineProperty(autoUpdater, 'currentVersion', {
          get: () => semver.parse(devUpdateVersionOverride) || semver.parse('0.0.0'),
          configurable: true
        })
      } catch (e) {
        console.error('Mock currentVersion hatası:', e)
      }
    }
    return { success: true }
  })

  autoUpdater.on('checking-for-update', () => {
    console.log('Güncellemeler kontrol ediliyor...')
    sendUpdaterStatus('checking')
  })

  autoUpdater.on('update-available', (info) => {
    console.log(`Yeni sürüm bulundu! Sürüm: ${info.version}`)
    try {
      const versionsPath = app.isPackaged
        ? join(process.resourcesPath, 'versions.json')
        : join(app.getAppPath(), '../../packages/database/versions.json')
      if (fs.existsSync(versionsPath)) {
        const versionsList: string[] = JSON.parse(fs.readFileSync(versionsPath, 'utf8'))
        const currentV =
          devUpdateVersionOverride ||
          (autoUpdater.currentVersion as any)?.version ||
          app.getVersion()
        const incomingVersion = info.version.replace(/^v/, '')
        const cleanCurrentV = currentV.replace(/^v/, '')

        const currentIndex = versionsList.indexOf(cleanCurrentV)
        const incomingIndex = versionsList.indexOf(incomingVersion)

        if (currentIndex !== -1 && incomingIndex !== -1 && incomingIndex <= currentIndex) {
          console.log(
            `Bulunan sürüm (${incomingVersion}) mevcut sürümden (${cleanCurrentV}) daha eski veya aynı. Güncelleme reddedildi!`
          )
          sendUpdaterStatus('not-available', { version: cleanCurrentV, info: null })
          return
        }
      }
    } catch (err) {
      console.error('versions.json kontrol hatası:', err)
    }

    sendUpdaterStatus('available', { version: info.version, info })
  })

  autoUpdater.on('update-not-available', (info) => {
    console.log('Güncelleme yok, en güncel sürümdesiniz.')
    sendUpdaterStatus('not-available', { version: info?.version, info })
  })

  autoUpdater.on('update-downloaded', (info) => {
    console.log('Güncelleme başarıyla indirildi. Kurulum için hazır.', info.version)
    sendUpdaterStatus('downloaded', { version: info.version, info })
  })

  autoUpdater.on('error', (err: any) => {
    if (err.message && err.message.includes('No published versions on GitHub')) {
      console.log('Güncelleme yok, en güncel sürümdesiniz.')
      sendUpdaterStatus('not-available', { version: app.getVersion(), info: null })
    } else {
      console.error('Güncelleme sırasında hata oluştu:', err)
      sendUpdaterStatus('error', { error: err.message })
    }
  })

  ipcMain.handle('updater:check', async () => {
    try {
      if (!app.isPackaged && !autoUpdater.forceDevUpdateConfig) {
        return {
          success: true,
          version: app.getVersion()
        }
      }
      const result = await autoUpdater.checkForUpdates()
      if (result === null) {
        return {
          success: false,
          error: 'Güncelleme kontrolü bu ortamda atlandı veya desteklenmiyor.'
        }
      }
      return { success: true, version: result.updateInfo.version }
    } catch (error: any) {
      if (error.message && error.message.includes('No published versions on GitHub')) {
        console.log('Manuel kontrol: Sistem güncel.')
        sendUpdaterStatus('not-available', { version: app.getVersion(), info: null })
        return { success: true }
      }

      console.error('Manual update check error:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('updater:quit-and-install', () => {
    try {
      autoUpdater.quitAndInstall()
      return { success: true }
    } catch (error: any) {
      console.error('Quit and install error:', error)
      return { success: false, error: error.message }
    }
  })
}

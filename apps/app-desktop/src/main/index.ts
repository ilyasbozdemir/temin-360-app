import { app, shell, BrowserWindow, ipcMain, dialog, Tray, Menu, session, protocol } from 'electron'
import { join, basename } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import mime from 'mime-types'
import { autoUpdater } from 'electron-updater'
import fs from 'fs'

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'dta-res',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true
    }
  }
])

const icon = app.isPackaged
  ? join(process.resourcesPath, 'icon.png')
  : join(__dirname, '../../resources/icon.png')
import { workspaceManager, ensureSchemaIntegrity } from './database/workspace'
import { CURRENT_SCHEMA_VERSION, manifests } from '@dt/database'
import nodemailer from 'nodemailer'
import {
  isSupportedFile,
  defaultFormat,
  perFormatFilters,
  allFormatsFilter
} from './config/fileFormats'
import { recentFilesStore } from './store/recentFiles'
import { startServer, stopServer, getSocketServer } from './server'
import { connectToServer, disconnectFromServer, emitEvent } from './client'
import { generateContent, testConnection, AIGenerateOptions } from './ai/index'
import { renderPdfBuffer } from './pdfService'
import { renderDocxBuffer } from './docxService'
import { startExpressServer, stopExpressServer } from './network/expressServer'
import { registerArchiveHandlers } from './archive'
import { registerAllIpcHandlers } from './ipc'
import { performAutoCloudSync } from './ipc/network.ipc'
import { TANIM_Placeholder } from '@dt/database'

let isForceQuitting = false

// --- LOG SYSTEM & USERDATA SETUP ---
const isMultiInstance = process.argv.includes('--multi-instance')
const rawInitialFilePath = process.argv.find((arg) => isSupportedFile(arg)) ?? null
const initialFilePath = rawInitialFilePath
  ? rawInitialFilePath.replace(/^"+|"+$/g, '').trim()
  : null

try {
  let userDataPath = app.getPath('userData')
  let changed = false

  if (is.dev) {
    userDataPath += '-dev'
    changed = true
  }

  if (isMultiInstance && initialFilePath) {
    let hash = 0
    const normalizedPath = join(initialFilePath)
    for (let i = 0; i < normalizedPath.length; i++) {
      hash = (hash << 5) - hash + normalizedPath.charCodeAt(i)
      hash |= 0
    }
    userDataPath += `-multi-${Math.abs(hash)}`
    changed = true
  }

  if (changed) {
    app.setPath('userData', userDataPath)
  }
} catch (e) {
  console.error('Failed to configure userData path:', e)
}

const logDir = join(app.getPath('userData'), 'logs')
try {
  fs.mkdirSync(logDir, { recursive: true })
} catch (e) {}
const logPath = join(logDir, 'main.log')

export function writeLog(level: string, message: string, details?: any): void {
  const time = new Date().toISOString()
  const detailStr = details ? ` | Details: ${JSON.stringify(details)}` : ''
  const logLine = `[${time}] [${level}] ${message}${detailStr}\n`
  try {
    fs.appendFileSync(logPath, logLine, 'utf8')
  } catch (e) {}
}

writeLog('INFO', 'App startup initialized', {
  argv: process.argv,
  execPath: process.execPath,
  isPackaged: app.isPackaged,
  userData: app.getPath('userData')
})

process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION:', error)
  writeLog('ERROR', 'Uncaught Exception', {
    message: error?.message,
    stack: error?.stack
  })
})

let tray: Tray | null = null
const secondaryWindows = new Set<BrowserWindow>()
const dosyaWindows = new Map<number, BrowserWindow>()

function closeAllSecondaryWindows(): void {
  const copy = Array.from(secondaryWindows)
  for (const win of copy) {
    if (!win.isDestroyed()) win.close()
  }
  secondaryWindows.clear()

  const dCopy = Array.from(dosyaWindows.values())
  for (const win of dCopy) {
    if (!win.isDestroyed()) win.close()
  }
  dosyaWindows.clear()
}

// Uygulama tamamen kapanırken (Quit) aktif dosyayı/lock'u temizle ve buluta son verileri aktar
app.on('will-quit', () => {
  try {
    performAutoCloudSync()
  } catch {
    // ignore
  }
  try {
    closeAllSecondaryWindows()
    workspaceManager.close()
  } catch {
    //
  }
  try {
    stopServer()
  } catch {
    //
  }
  try {
    stopExpressServer()
  } catch {
    //
  }
  try {
    disconnectFromServer()
  } catch {
    //
  }
})

// Süreç herhangi bir sebeple çökerse veya kapanırsa son bir temizlik şansı
process.on('exit', () => {
  try {
    closeAllSecondaryWindows()
    workspaceManager.close()
  } catch {
    //
  }
  try {
    stopServer()
  } catch {
    //
  }
  try {
    stopExpressServer()
  } catch {
    //
  }
  try {
    disconnectFromServer()
  } catch {
    //
  }
})

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 768,
    show: false,
    autoHideMenuBar: true,
    frame: false,
    titleBarStyle: 'hidden',
    titleBarOverlay: false,
    icon: icon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
      plugins: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    if (process.argv.includes('--new-dosya')) {
      mainWindow.webContents.send('app:navigate', '/dosyalar/yeni')
    }
  })

  let quitRequestTimeout: NodeJS.Timeout | null = null

  mainWindow.on('close', (event) => {
    if (isForceQuitting) return
    const currentFile = workspaceManager.getCurrentFilePath()
    if (currentFile && !mainWindow.webContents.isCrashed() && !mainWindow.webContents.isDestroyed()) {
      event.preventDefault()
      mainWindow.webContents.send('app:quit-request')

      // Güvenlik: Eğer renderer donmuşsa veya yanıt vermiyorsa 2.5 saniye sonra zorla kapat
      if (quitRequestTimeout) clearTimeout(quitRequestTimeout)
      quitRequestTimeout = setTimeout(() => {
        writeLog('WARN', 'Renderer quit response timed out, forcing window close')
        isForceQuitting = true
        if (!mainWindow.isDestroyed()) {
          mainWindow.close()
        }
      }, 2500)
    }
  })

  ipcMain.on('window-minimize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win) win.minimize()
  })

  ipcMain.on('window-maximize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win) {
      if (win.isMaximized()) {
        win.unmaximize()
      } else {
        win.maximize()
      }
    }
  })

  ipcMain.on('window-close', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win) win.close()
  })

  ipcMain.on('window-toggle-devtools', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win) win.webContents.toggleDevTools()
  })

  ipcMain.on('open-external-url', (_event, url) => {
    shell.openExternal(url)
  })

  ipcMain.on('find-in-page:start', (event, text, options = {}) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win && text) {
      win.webContents.findInPage(text, {
        forward: options.forward !== false,
        findNext: options.findNext === true
      })
    }
  })

  ipcMain.on('find-in-page:stop', (event, action = 'clearSelection') => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win) {
      win.webContents.stopFindInPage(action)
    }
  })

  // Helper to open dta-res URLs in external application safely
  function openDtaResExternally(requestUrl: string): void {
    try {
      const parsedUrl = new URL(requestUrl)
      const relativePath = join(parsedUrl.host, decodeURIComponent(parsedUrl.pathname))

      const rendererDir = app.isPackaged
        ? join(__dirname, '../renderer')
        : join(__dirname, '../../src/renderer/public')

      let targetFilePath = join(rendererDir, relativePath)
      let fileExists = fs.existsSync(targetFilePath) && fs.statSync(targetFilePath).isFile()

      if (!fileExists) {
        const resourcesDir = app.isPackaged
          ? process.resourcesPath
          : join(__dirname, '../../resources')
        const fallbackPath = join(resourcesDir, relativePath)
        if (fs.existsSync(fallbackPath) && fs.statSync(fallbackPath).isFile()) {
          targetFilePath = fallbackPath
          fileExists = true
        }
      }

      if (fileExists) {
        if (app.isPackaged) {
          // If packaged (inside ASAR), copy to temp directory to open externally
          const tempFilePath = join(app.getPath('temp'), basename(targetFilePath))
          fs.copyFileSync(targetFilePath, tempFilePath)
          shell.openPath(tempFilePath)
        } else {
          // In development, open directly from filesystem
          shell.openPath(targetFilePath)
        }
      } else {
        console.error('File not found to open externally:', targetFilePath)
      }
    } catch (err) {
      console.error('Failed to open document externally:', err)
    }
  }

  mainWindow.webContents.setWindowOpenHandler((details) => {
    if (details.url.startsWith('dta-res://')) {
      openDtaResExternally(details.url)
      return { action: 'deny' }
    }
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // Navigation kilidi: Dış web sitelerine Electron içinden gidilmesini engelle
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!is.dev) {
      const parsedUrl = new URL(url)
      if (parsedUrl.origin !== 'file://') {
        event.preventDefault()
      }
    }
  })

  // Debug: Capture renderer console logs in the main process
  mainWindow.webContents.on('console-message', (_event, level, message, line, sourceId) => {
    console.log(`[RENDERER CONSOLE] (${level}) ${message} (at ${sourceId}:${line})`)
  })
  mainWindow.webContents.on('render-process-gone', (_event, details) => {
    console.error('Renderer process gone:', details)
  })

  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    writeLog('WARN', 'Main window did-fail-load, recovering index.html', {
      errorCode,
      errorDescription,
      validatedURL
    })
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
      mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('closed', () => {
    closeAllSecondaryWindows()
  })
}

// Dev-mode userData path configured at startup log block

// Single Instance Lock
const gotTheLock = isMultiInstance ? true : app.requestSingleInstanceLock()

if (!gotTheLock && !isMultiInstance) {
  app.quit()
} else {
  app.on('second-instance', (_event, commandLine) => {
    writeLog('INFO', 'Second instance event received', { commandLine })
    const windows = BrowserWindow.getAllWindows()
    if (windows.length > 0) {
      const mainWindow = windows[0]

      // Eğer desteklenen bir dosya çift tıklandıysa, yeni bir süreç (pencere) olarak başlat
      const rawFilePath = commandLine.find((arg) => isSupportedFile(arg))
      if (rawFilePath) {
        const filePath = rawFilePath.replace(/^"+|"+$/g, '').trim()
        const currentWorkspace = workspaceManager.getCurrentFilePath()
        const normalizedTarget = join(filePath)
        const normalizedCurrent = currentWorkspace ? join(currentWorkspace) : null

        writeLog('INFO', 'Attempting to open file from second instance', {
          target: normalizedTarget,
          currentWorkspace: normalizedCurrent
        })

        if (
          normalizedCurrent &&
          normalizedTarget.toLowerCase() === normalizedCurrent.toLowerCase()
        ) {
          writeLog('INFO', 'File is already open in main instance. Focusing window.')
          if (!mainWindow.isVisible()) {
            mainWindow.show()
          }
          if (mainWindow.isMinimized()) mainWindow.restore()
          mainWindow.focus()
        } else {
          writeLog('INFO', 'File is different/new. Opening in current instance.', {
            filePath
          })
          if (!mainWindow.isVisible()) {
            mainWindow.show()
          }
          if (mainWindow.isMinimized()) mainWindow.restore()
          mainWindow.focus()
          mainWindow.webContents.send('open-external-file', filePath)
        }
      } else {
        writeLog('INFO', 'No supported file found in commandLine arguments.')
        if (!mainWindow.isVisible()) {
          mainWindow.show()
        }
        if (mainWindow.isMinimized()) mainWindow.restore()
        mainWindow.focus()

        if (commandLine.includes('--new-dosya')) {
          mainWindow.webContents.send('app:navigate', '/dosyalar/yeni')
        }
      }
    } else {
      writeLog('INFO', 'No windows open. Recreating main window.')
      createWindow()
      const rawFilePath = commandLine.find((arg) => isSupportedFile(arg))
      if (rawFilePath) {
        const filePath = rawFilePath.replace(/^"+|"+$/g, '').trim()
        process.argv.push(filePath)
      }
    }
  })

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.whenReady().then(() => {
    // Custom Protocol: dta-res:// -> local resource mapping
    protocol.handle('dta-res', (request) => {
      try {
        const parsedUrl = new URL(request.url)
        const relativePath = join(parsedUrl.host, decodeURIComponent(parsedUrl.pathname))

        // 1. Resolve from public/renderer directory (packaged inside ASAR in production)
        const rendererDir = app.isPackaged
          ? join(__dirname, '../renderer')
          : join(__dirname, '../../src/renderer/public')

        let targetFilePath = join(rendererDir, relativePath)
        let fileExists = fs.existsSync(targetFilePath) && fs.statSync(targetFilePath).isFile()

        // 2. Fallback: Resolve from resources directory (outside ASAR in production)
        if (!fileExists) {
          const resourcesDir = app.isPackaged
            ? process.resourcesPath
            : join(__dirname, '../../resources')
          const fallbackPath = join(resourcesDir, relativePath)
          if (fs.existsSync(fallbackPath) && fs.statSync(fallbackPath).isFile()) {
            targetFilePath = fallbackPath
            fileExists = true
          }
        }

        if (!fileExists) {
          return new Response('File Not Found', { status: 404 })
        }

        const data = fs.readFileSync(targetFilePath)
        const contentType = mime.lookup(targetFilePath) || 'application/octet-stream'

        return new Response(data, {
          headers: {
            'Content-Type': contentType,
            'Access-Control-Allow-Origin': '*'
          }
        })
      } catch (err: any) {
        return new Response(`Error: ${err.message}`, { status: 500 })
      }
    })

    if (process.platform === 'win32') {
      app.setUserTasks([
        {
          program: process.execPath,
          arguments: '--new-dosya',
          iconPath: process.execPath,
          iconIndex: 0,
          title: 'Yeni Doğrudan Temin Dosyası',
          description: 'Hızlıca yeni bir doğrudan temin dosyası oluşturun'
        }
      ])
    }

    tray = new Tray(icon)
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Gösterge Paneli',
        click: () => {
          const windows = BrowserWindow.getAllWindows()
          if (windows.length > 0) {
            windows[0].show()
            windows[0].webContents.send('app:navigate', '/')
          }
        }
      },
      {
        label: 'Yeni Doğrudan Temin Dosyası',
        click: () => {
          const windows = BrowserWindow.getAllWindows()
          if (windows.length > 0) {
            windows[0].show()
            windows[0].webContents.send('app:navigate', '/dosyalar/yeni')
          }
        }
      },
      { type: 'separator' },
      {
        label: 'Çıkış',
        click: () => {
          app.quit()
        }
      }
    ])
    tray.setToolTip('TEMİN 360')
    tray.setContextMenu(contextMenu)
    tray.on('click', () => {
      const windows = BrowserWindow.getAllWindows()
      if (windows.length > 0) {
        if (windows[0].isVisible()) {
          windows[0].hide()
        } else {
          windows[0].show()
        }
      }
    })
    tray.on('double-click', () => {
      const windows = BrowserWindow.getAllWindows()
      if (windows.length > 0) {
        const mainWindow = windows[0]
        if (!mainWindow.isVisible()) {
          mainWindow.show()
        }
        if (mainWindow.isMinimized()) mainWindow.restore()
        mainWindow.focus()
      }
    })

    // Set app user model id for windows
    electronApp.setAppUserModelId('com.electron')

    // Default open or close DevTools by F12 in development
    // and ignore CommandOrControl + R in production.
    // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)

      // Ctrl + R / Cmd + R reload support in production, and Ctrl + F search support
      window.webContents.on('before-input-event', (event, input) => {
        const isR = input.key.toLowerCase() === 'r'
        const isF = input.key.toLowerCase() === 'f'
        const isCommandOrControl = input.control || input.meta

        if (isCommandOrControl && isR) {
          if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
            if (input.shift) {
              window.webContents.reloadIgnoringCache()
            } else {
              window.webContents.reload()
            }
          } else {
            // Production packaged app safe reload
            const currentURL = window.webContents.getURL()
            if (currentURL.startsWith('file://')) {
              const hashIndex = currentURL.indexOf('#')
              const hashPart = hashIndex !== -1 ? currentURL.substring(hashIndex + 1) : ''
              const indexFile = join(__dirname, '../renderer/index.html')
              window.loadFile(indexFile, { hash: hashPart })
            } else {
              window.webContents.reload()
            }
          }
          event.preventDefault()
        } else if (isCommandOrControl && isF) {
          window.webContents.send('find-in-page:toggle')
          event.preventDefault()
        }
      })

      // Send found-in-page match results back to renderer
      window.webContents.on('found-in-page', (_, result) => {
        window.webContents.send('find-in-page:result', {
          activeMatchOrdinal: result.activeMatchOrdinal,
          matches: result.matches
        })
      })
    })

    // Güvenlik: Tüm donanım (kamera, mikrofon) izinlerini varsayılan olarak reddet
    session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => {
      callback(false)
    })

    // Güvenlik: Production'da DevTools açılmasını tamamen engelle
    app.on('browser-window-created', (_, window) => {
      if (!is.dev) {
        window.webContents.on('devtools-opened', () => {
          window.webContents.closeDevTools()
        })
      }
    })

    const closeAllSecondaryWindows = () => {
      const windows = BrowserWindow.getAllWindows()
      for (let i = 1; i < windows.length; i++) {
        if (!windows[i].isDestroyed()) {
          windows[i].close()
        }
      }
    }

    registerAllIpcHandlers({
      closeAllSecondaryWindows,
      setForceQuit: () => {
        isForceQuitting = true
      },
      initialFilePath
    })

    createWindow()

    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })

    // --- Workspace & SQLite Handlers ---
    const broadcastDbChange = () => {
      BrowserWindow.getAllWindows().forEach((win) => {
        if (!win.isDestroyed()) {
          win.webContents.send('db:invalidated')
        }
      })
    }

    ipcMain.on('window:close-secondary-windows', () => {
      closeAllSecondaryWindows()
    })

    ipcMain.on('window:open-external', (_, data: { url: string; title?: string }) => {
      const newWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        show: false,
        autoHideMenuBar: false,
        title: data.title || 'Sorgulama Ekranı',
        icon: icon,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true
        }
      })
      secondaryWindows.add(newWindow)
      newWindow.on('closed', () => secondaryWindows.delete(newWindow))
      newWindow.once('ready-to-show', () => {
        newWindow.show()
        newWindow.focus()
      })
      newWindow.loadURL(data.url)
    })

    ipcMain.on(
      'window:open-secondary',
      (_, data: { path: string; search: string; title?: string }) => {
        const newWindow = new BrowserWindow({
          width: 1000,
          height: 750,
          minWidth: 800,
          minHeight: 600,
          show: false,
          autoHideMenuBar: true,
          title: data.title || 'TEMİN 360 — Detay',
          icon: icon,
          webPreferences: {
            preload: join(__dirname, '../preload/index.js'),
            sandbox: false
          }
        })

        secondaryWindows.add(newWindow)
        newWindow.on('closed', () => secondaryWindows.delete(newWindow))
        newWindow.once('ready-to-show', () => {
          newWindow.show()
          newWindow.focus()
        })

        if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
          newWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] + data.path + data.search)
        } else {
          const indexHtml = join(__dirname, '../renderer/index.html')
          newWindow.loadFile(indexHtml, {
            search: data.search.replace(/^\?/, ''),
            hash: data.path
          })
        }
      }
    )

    // --- Dosya ↔ Window IPC Handlers ---
    const dosyaWindows = new Map<number, BrowserWindow>()

    ipcMain.on(
      'window:open-dosya',
      (_, data: { dosyaId: number; path: string; workspacePath: string; title?: string }) => {
        const existingWin = dosyaWindows.get(data.dosyaId)
        if (existingWin && !existingWin.isDestroyed()) {
          if (existingWin.isMinimized()) existingWin.restore()
          existingWin.focus()
          return
        }

        const newWindow = new BrowserWindow({
          width: 1100,
          height: 800,
          minWidth: 800,
          minHeight: 600,
          show: false,
          autoHideMenuBar: true,
          frame: false,
          titleBarStyle: 'hidden',
          titleBarOverlay: false,
          title: data.title || `Dosya #${data.dosyaId}`,
          icon: icon,
          webPreferences: {
            preload: join(__dirname, '../preload/index.js'),
            sandbox: false
          }
        })

        dosyaWindows.set(data.dosyaId, newWindow)
        newWindow.on('closed', () => {
          dosyaWindows.delete(data.dosyaId)
        })
        newWindow.once('ready-to-show', () => {
          newWindow.show()
          newWindow.focus()
        })

        const wpParam = data.workspacePath ? '&wp=' + encodeURIComponent(data.workspacePath) : ''
        const searchParams = `?mode=dosya_window&dosyaId=${data.dosyaId}${wpParam}`

        if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
          newWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] + data.path + searchParams)
        } else {
          const indexHtml = join(__dirname, '../renderer/index.html')
          newWindow.loadFile(indexHtml, {
            hash: data.path,
            search: searchParams.replace(/^\?/, '')
          })
        }
      }
    )

    // --- Tab ↔ Window IPC Handlers ---
    // Opens a tab's content in a separate detached window
    ipcMain.on(
      'tab:open-in-window',
      (_, data: { path: string; title: string; workspacePath?: string }) => {
        const newWindow = new BrowserWindow({
          width: 1000,
          height: 750,
          minWidth: 800,
          minHeight: 600,
          show: false,
          autoHideMenuBar: true,
          frame: false,
          titleBarStyle: 'hidden',
          titleBarOverlay: false,
          title: data.title || 'TEMİN 360',
          icon: icon,
          webPreferences: {
            preload: join(__dirname, '../preload/index.js'),
            sandbox: false
          }
        })

        secondaryWindows.add(newWindow)
        newWindow.on('closed', () => secondaryWindows.delete(newWindow))
        newWindow.once('ready-to-show', () => {
          newWindow.show()
          newWindow.focus()
        })

        const wpParam = data.workspacePath ? '&wp=' + encodeURIComponent(data.workspacePath) : ''
        if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
          // Dev: path goes into URL pathname, params into query string
          newWindow.loadURL(
            process.env['ELECTRON_RENDERER_URL'] + data.path + '?mode=window' + wpParam
          )
        } else {
          // Production: path goes into hash, params into search
          const indexHtml = join(__dirname, '../renderer/index.html')
          newWindow.loadFile(indexHtml, {
            hash: data.path,
            search: 'mode=window' + wpParam
          })
        }
      }
    )

    // Returns a detached window's content back to the main window as a tab
    ipcMain.on('tab:return-to-parent', (event, data: { path: string }) => {
      // Find the main window (the first window that is NOT the sender)
      const senderWindow = BrowserWindow.fromWebContents(event.sender)
      const allWindows = BrowserWindow.getAllWindows()
      const mainWindow = allWindows.find((w) => w !== senderWindow) || allWindows[0]

      if (mainWindow && !mainWindow.isDestroyed()) {
        // Tell the main window to re-add this path as a tab
        mainWindow.webContents.send('tab:returned-from-window', { path: data.path })
        if (mainWindow.isMinimized()) mainWindow.restore()
        mainWindow.focus()
      }

      // Close the child window
      if (senderWindow && !senderWindow.isDestroyed()) {
        senderWindow.close()
      }
    })

  })
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

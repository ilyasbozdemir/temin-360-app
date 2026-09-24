import { app, shell, ipcMain } from 'electron'
import { join } from 'path'
import fs from 'fs'
import util from 'util'

class AppLogger {
  private logDir: string = ''
  private logFilePath: string = ''
  private isInitialized = false

  public init(): void {
    if (this.isInitialized) return

    try {
      // In dev mode, keep logs in project root /logs AND in userData/logs
      const baseDir = app.isReady()
        ? app.getPath('userData')
        : join(process.cwd(), 'logs')
      
      this.logDir = join(baseDir, 'logs')
      if (!fs.existsSync(this.logDir)) {
        fs.mkdirSync(this.logDir, { recursive: true })
      }

      const today = new Date().toISOString().slice(0, 10)
      this.logFilePath = join(this.logDir, `app-${today}.log`)

      // Write session start marker
      const header = `\n==================== [SESSION START ${new Date().toISOString()}] ====================\n`
      fs.appendFileSync(this.logFilePath, header, 'utf-8')

      this.interceptConsole()
      this.isInitialized = true

      console.log(`[Logger] Olay günlükleri dosyaya kaydediliyor: ${this.logFilePath}`)
    } catch (err) {
      // Fallback to basic console
      console.error('[Logger Init Error]:', err)
    }
  }

  private formatMessage(level: string, args: unknown[]): string {
    const timestamp = new Date().toISOString().replace('T', ' ').replace('Z', '')
    const formattedArgs = args
      .map((arg) => (typeof arg === 'string' ? arg : util.inspect(arg, { depth: 4, colors: false })))
      .join(' ')
    return `[${timestamp}] [${level.toUpperCase()}] ${formattedArgs}\n`
  }

  private writeToFile(line: string): void {
    if (!this.logFilePath) return
    try {
      fs.appendFile(this.logFilePath, line, (err) => {
        if (err) process.stderr.write(`[Log File Write Error] ${err.message}\n`)
      })
    } catch {}
  }

  private interceptConsole(): void {
    const origLog = console.log.bind(console)
    const origInfo = console.info.bind(console)
    const origWarn = console.warn.bind(console)
    const origError = console.error.bind(console)

    console.log = (...args: unknown[]) => {
      origLog(...args)
      this.writeToFile(this.formatMessage('INFO', args))
    }

    console.info = (...args: unknown[]) => {
      origInfo(...args)
      this.writeToFile(this.formatMessage('INFO', args))
    }

    console.warn = (...args: unknown[]) => {
      origWarn(...args)
      this.writeToFile(this.formatMessage('WARN', args))
    }

    console.error = (...args: unknown[]) => {
      origError(...args)
      this.writeToFile(this.formatMessage('ERROR', args))
    }
  }

  public getLogFilePath(): string {
    return this.logFilePath
  }

  public getLogDir(): string {
    return this.logDir
  }

  public readRecentLogs(lineCount = 200): string {
    try {
      if (!this.logFilePath || !fs.existsSync(this.logFilePath)) return ''
      const content = fs.readFileSync(this.logFilePath, 'utf-8')
      const lines = content.split('\n')
      return lines.slice(-lineCount).join('\n')
    } catch (err: unknown) {
      return `Günlükler okunamadı: ${(err as Error)?.message || err}`
    }
  }
}

export const appLogger = new AppLogger()

export function registerLoggerIpcHandlers(): void {
  ipcMain.handle('logs:get-path', () => appLogger.getLogFilePath())
  
  ipcMain.handle('logs:open-file', async () => {
    const path = appLogger.getLogFilePath()
    if (path && fs.existsSync(path)) {
      await shell.openPath(path)
      return { success: true, path }
    }
    return { success: false, message: 'Günlük dosyası henüz bulunamadı.' }
  })

  ipcMain.handle('logs:open-dir', async () => {
    const dir = appLogger.getLogDir()
    if (dir && fs.existsSync(dir)) {
      await shell.openPath(dir)
      return { success: true, dir }
    }
    return { success: false, message: 'Günlük klasörü bulunamadı.' }
  })

  ipcMain.handle('logs:read-recent', (_event, lineCount?: number) => {
    return appLogger.readRecentLogs(lineCount || 200)
  })
}

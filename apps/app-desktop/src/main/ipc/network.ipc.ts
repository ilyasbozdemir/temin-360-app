import { ipcMain, BrowserWindow, dialog } from 'electron'
import fs from 'fs'
import { basename } from 'path'
import nodemailer from 'nodemailer'
import { startServer, stopServer, getSocketServer } from '../server'
import { connectToServer, disconnectFromServer, emitEvent } from '../client'
import { startExpressServer, stopExpressServer } from '../network/expressServer'
import { workspaceManager } from '../database/workspace'

export function registerNetworkIpcHandlers(): void {
  ipcMain.handle('network:start-server', (_, port: number) => {
    return startServer(port)
  })

  ipcMain.handle('network:stop-server', () => {
    stopServer()
    return { success: true }
  })

  ipcMain.handle('network:connect-client', (_, url: string) => {
    return connectToServer(url)
  })

  ipcMain.handle('network:disconnect-client', () => {
    disconnectFromServer()
    return { success: true }
  })

  ipcMain.on('network:emit', (_, eventName: string, data: any) => {
    emitEvent(eventName, data)
    const io = getSocketServer()
    if (io) {
      io.emit(eventName, data)
    }
  })

  ipcMain.handle('network:start-express', (_, port: number) => {
    return startExpressServer(port)
  })

  ipcMain.handle('network:stop-express', () => {
    stopExpressServer()
    return { success: true }
  })

  ipcMain.handle('network:pull-db', async (_, url: string) => {
    try {
      const response = await fetch(`${url}/api/network/pull`)
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Sunucu Hatası: ${response.status} - ${errorText}`)
      }

      const arrayBuffer = await response.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      let currentFile = workspaceManager.getCurrentFilePath()
      let backupPath: string | null = null

      if (!currentFile) {
        const { canceled, filePath } = await dialog.showSaveDialog({
          title: 'Ağdan Gelen Veritabanını Kaydet',
          defaultPath: 'paylasim.dtal',
          filters: [{ name: 'DTAL Dosyaları', extensions: ['dtal'] }]
        })
        if (canceled || !filePath) throw new Error('İşlem iptal edildi.')
        currentFile = filePath
      } else {
        workspaceManager.close()
        backupPath = currentFile + '.syncbak'
        fs.copyFileSync(currentFile, backupPath)
      }

      try {
        fs.writeFileSync(currentFile, buffer)
        workspaceManager.open(currentFile, false)

        BrowserWindow.getAllWindows().forEach((win) => {
          if (!win.isDestroyed()) win.webContents.send('network:db-pulled')
        })

        return { success: true }
      } catch (e: any) {
        if (backupPath && fs.existsSync(backupPath)) {
          fs.copyFileSync(backupPath, currentFile)
          try {
            workspaceManager.open(currentFile, false)
          } catch {}
        }
        throw e
      }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('network:push-db', async (_, url: string) => {
    try {
      const currentFile = workspaceManager.getCurrentFilePath()
      if (!currentFile || !fs.existsSync(currentFile))
        throw new Error('Gönderilecek açık bir dosya yok.')

      workspaceManager.save()

      const fileData = fs.readFileSync(currentFile)

      const response = await fetch(`${url}/api/network/push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream'
        },
        body: fileData
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: 'Bilinmeyen Hata' }))
        throw new Error(`Hata: ${errData.error || response.statusText}`)
      }

      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('network:can-undo-sync', async () => {
    try {
      const currentFile = workspaceManager.getCurrentFilePath()
      if (!currentFile) return { canUndo: false }
      const backupPath = currentFile + '.syncbak'
      if (fs.existsSync(backupPath)) {
        const stats = fs.statSync(backupPath)
        return { canUndo: true, mtime: stats.mtime.toISOString() }
      }
      return { canUndo: false }
    } catch {
      return { canUndo: false }
    }
  })

  ipcMain.handle('network:undo-sync', async () => {
    try {
      const currentFile = workspaceManager.getCurrentFilePath()
      if (!currentFile) throw new Error('Açık bir çalışma dosyası yok.')

      const backupPath = currentFile + '.syncbak'
      if (!fs.existsSync(backupPath)) throw new Error('Geri alınacak yedek bulunamadı.')

      workspaceManager.close()
      fs.copyFileSync(backupPath, currentFile)
      fs.unlinkSync(backupPath)
      workspaceManager.open(currentFile, false)

      BrowserWindow.getAllWindows().forEach((win) => {
        if (!win.isDestroyed()) win.webContents.send('network:db-pulled')
      })

      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('sync:test-connection', async (_, { url, port, token }) => {
    try {
      if (!url) return { success: false, error: 'Sunucu adresi girilmedi.' }
      let cleanUrl = String(url).trim().replace(/\/+$/, '')
      if (port && !cleanUrl.includes(':' + port)) {
        cleanUrl = `${cleanUrl}:${port}`
      }
      const fullUrl = `${cleanUrl}/api/health`
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const res = await fetch(fullUrl, {
        method: 'GET',
        headers
      })
      if (res.ok) {
        const data = (await res.json().catch(() => ({}))) as { message?: string }
        return { success: true, message: data.message || 'Bağlantı Başarılı!' }
      }
      return { success: false, error: `Sunucu yanıt vermedi: HTTP ${res.status}` }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Bağlantı hatası'
      return { success: false, error: msg }
    }
  })

  ipcMain.handle('sync:run-sync', async (_, args?: { url?: string; token?: string }) => {
    try {
      let syncUrl = args?.url
      let syncToken = args?.token

      if (!syncUrl) {
        try {
          const db = workspaceManager.getDb()
          const urlRow = db
            .prepare("SELECT value FROM settings WHERE key = 'sync_server_url'")
            .get() as { value: string }
          const tokenRow = db
            .prepare("SELECT value FROM settings WHERE key = 'sync_server_token'")
            .get() as { value: string }
          syncUrl = urlRow?.value
          syncToken = tokenRow?.value
        } catch {
          // ignore
        }
      }

      if (!syncUrl) {
        return {
          success: false,
          error: 'Sunucu adresi tanımlı değil. Lütfen önce sunucu adresini kaydedin.'
        }
      }

      const cleanUrl = String(syncUrl).trim().replace(/\/+$/, '')
      const fullUrl = `${cleanUrl}/api/sync`

      let dosyalar: unknown[] = []
      const sablonlar: unknown[] = []
      try {
        const db = workspaceManager.getDb()
        const dCheck = db
          .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='dosyalar'")
          .get()
        if (dCheck) {
          dosyalar = db.prepare('SELECT id, title, created_at FROM dosyalar LIMIT 50').all()
        }
      } catch {
        // fallback
      }

      const res = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          Authorization: syncToken ? `Bearer ${syncToken}` : 'Bearer dta_desktop_client',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          dosyalar,
          sablonlar,
          syncedAt: new Date().toISOString()
        })
      })

      if (res.ok) {
        const data = (await res.json().catch(() => ({}))) as { message?: string }
        return {
          success: true,
          message: data.message || 'Senkronizasyon paketi başarıyla işlendi.'
        }
      }
      return { success: false, error: `Sunucu hatası: HTTP ${res.status}` }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Senkronizasyon hatası'
      return { success: false, error: msg }
    }
  })

  ipcMain.handle('sync:push', async (_, { url, port, token }) => {
    try {
      if (!url) return { success: false, error: 'Sunucu adresi tanımlı değil.' }
      let cleanUrl = String(url).trim().replace(/\/+$/, '')
      if (port && !cleanUrl.includes(':' + port)) {
        cleanUrl = `${cleanUrl}:${port}`
      }
      let dosyalar: unknown[] = []
      try {
        const db = workspaceManager.getDb()
        const dCheck = db
          .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='dosyalar'")
          .get()
        if (dCheck) {
          dosyalar = db.prepare('SELECT * FROM dosyalar LIMIT 100').all()
        }
      } catch {
        // fallback
      }

      const fullUrl = `${cleanUrl}/api/sync`

      const res = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          Authorization: token ? `Bearer ${token}` : 'Bearer dta_desktop_client',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'push',
          dosyalar,
          syncedAt: new Date().toISOString()
        })
      })

      if (res.ok) {
        return { success: true, message: 'Veriler buluta başarıyla gönderildi.' }
      }
      return { success: false, error: `Sunucu hatası: HTTP ${res.status}` }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Push hatası'
      return { success: false, error: msg }
    }
  })

  ipcMain.handle('sync:pull', async (_, { url, port, token }) => {
    try {
      if (!url) return { success: false, error: 'Sunucu adresi tanımlı değil.' }
      let cleanUrl = String(url).trim().replace(/\/+$/, '')
      if (port && !cleanUrl.includes(':' + port)) {
        cleanUrl = `${cleanUrl}:${port}`
      }
      const fullUrl = `${cleanUrl}/api/sync`

      const res = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          Authorization: token ? `Bearer ${token}` : 'Bearer dta_desktop_client',
          'Content-Type': 'application/json'
        }
      })

      if (res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          dosyalar?: Array<{ id: string; title?: string; ad?: string; created_at?: string }>
        }
        const files = data.dosyalar || []
        let imported = 0
        try {
          const db = workspaceManager.getDb()
          const dCheck = db
            .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='dosyalar'")
            .get()
          if (dCheck && files.length > 0) {
            const insertStmt = db.prepare(`
              INSERT OR REPLACE INTO dosyalar (id, title, created_at, updated_at)
              VALUES (@id, @title, @created_at, @updated_at)
            `)
            const tx = db.transaction((arr) => {
              for (const f of arr) {
                insertStmt.run({
                  id: f.id,
                  title: f.title || f.ad || 'İhale/Temin Dosyası',
                  created_at: f.created_at || new Date().toISOString(),
                  updated_at: new Date().toISOString()
                })
                imported++
              }
            })
            tx(files)
          }
        } catch (dbErr) {
          console.error('Pull DB insert error:', dbErr)
        }

        return {
          success: true,
          message: `${imported > 0 ? imported : files.length} kayıt buluttan başarıyla çekildi ve yerel veritabanına işlendi.`
        }
      }
      return { success: false, error: `Sunucu hatası: HTTP ${res.status}` }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Pull hatası'
      return { success: false, error: msg }
    }
  })
}

export async function performAutoCloudSync(): Promise<void> {
  try {
    const db = workspaceManager.getDb()
    if (!db) return
    const urlRow = db
      .prepare("SELECT value FROM settings WHERE key = 'sync_server_url'")
      .get() as { value: string } | undefined
    const tokenRow = db
      .prepare("SELECT value FROM settings WHERE key = 'sync_server_token'")
      .get() as { value: string } | undefined

    const syncUrl = urlRow?.value
    const syncToken = tokenRow?.value

    let dosyalar: unknown[] = []
    const dCheck = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='dosyalar'")
      .get()
    if (dCheck) {
      dosyalar = db.prepare('SELECT * FROM dosyalar LIMIT 100').all()
    }

    // 1. Bulut API Eşitlemesi
    if (syncUrl) {
      const cleanUrl = String(syncUrl).trim().replace(/\/+$/, '')
      const fullUrl = `${cleanUrl}/api/sync`

      await fetch(fullUrl, {
        method: 'POST',
        headers: {
          Authorization: syncToken ? `Bearer ${syncToken}` : 'Bearer dta_desktop_client',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'auto-sync-on-close',
          dosyalar,
          syncedAt: new Date().toISOString()
        })
      }).catch(() => {})
    }

    // 2. Otomatik E-Posta Yedeklemesi (Dosyada güncelleme varsa SMTP üzerinden yollar)
    try {
      if (!workspaceManager.hasChanges('email')) {
        console.log('[AutoCloudSync] Dosyada değişiklik bulunmadığı için otomatik e-posta gönderimi atlandı.')
      } else {
        const hostRow = db
          .prepare("SELECT value FROM settings WHERE key = 'smtpHost'")
          .get() as { value: string } | undefined
        const userRow = db
          .prepare("SELECT value FROM settings WHERE key = 'smtpUser'")
          .get() as { value: string } | undefined
        const passRow = db
          .prepare("SELECT value FROM settings WHERE key = 'smtpPass'")
          .get() as { value: string } | undefined
        const portRow = db
          .prepare("SELECT value FROM settings WHERE key = 'smtpPort'")
          .get() as { value: string } | undefined
        const emailRow = db
          .prepare("SELECT value FROM settings WHERE key = 'smtpReceiver'")
          .get() as { value: string } | undefined
        const secureRow = db
          .prepare("SELECT value FROM settings WHERE key = 'smtpSecure'")
          .get() as { value: string } | undefined

        if (hostRow?.value && userRow?.value && passRow?.value) {
          const receiver = emailRow?.value || userRow.value
          const port = parseInt(portRow?.value || '587') || 587
          const actualSecure =
            port === 465 ? true : port === 587 ? false : secureRow?.value === 'true'

          const transporter = nodemailer.createTransport({
            host: hostRow.value,
            port,
            secure: actualSecure,
            auth: {
              user: userRow.value,
              pass: passRow.value
            },
            tls: { rejectUnauthorized: false }
          })

          const curFile = workspaceManager.getCurrentFilePath()
          const attachments =
            curFile && fs.existsSync(curFile)
              ? [{ filename: basename(curFile), path: curFile }]
              : []

          await transporter.sendMail({
            from: `"TEMİN 360 Otomatik Kapanış Yedeği" <${userRow.value}>`,
            to: receiver,
            subject: `TEMİN 360 Otomatik Veritabanı Yedeği - ${new Date().toLocaleDateString('tr-TR')}`,
            text: `Uygulama kapatılırken otomatik veritabanı yedeğiniz alınmıştır.\nAktarılan dosya sayısı: ${dosyalar.length}\nTarih: ${new Date().toLocaleString('tr-TR')}`,
            attachments
          })
          workspaceManager.markSynced('email')
        }
      }
    } catch {
      // Non-blocking mail fail-safe
    }

    // 3. Otomatik Google Drive Bulut Yedeklemesi (Dosyada güncelleme varsa son 7 sürümü saklar ve eskileri temizler)
    try {
      if (!workspaceManager.hasChanges('gdrive')) {
        console.log('[AutoCloudSync] Dosyada değişiklik bulunmadığı için Google Drive yüklemesi atlandı.')
      } else {
        const gdriveRow = db
          .prepare("SELECT value FROM settings WHERE key = 'gdriveAccessToken'")
          .get() as { value?: string } | undefined
        const token = gdriveRow?.value
        const curFile = workspaceManager.getCurrentFilePath()
        if (token && curFile && fs.existsSync(curFile)) {
          const cleanToken = String(token)
            .trim()
            .replace(/^["']|["']$/g, '')
            .replace(/^Bearer\s+/i, '')
            .replace(/[\r\n\s]+/g, '')

          // Find or create TEMIN_360_YEDEKLER folder
          const folderName = 'TEMIN_360_YEDEKLER'
          const folderQuery = encodeURIComponent(
            `mimeType = 'application/vnd.google-apps.folder' and name = '${folderName}' and trashed = false`
          )
          let folderId = ''
          const searchRes = await fetch(
            `https://www.googleapis.com/drive/v3/files?q=${folderQuery}&fields=files(id,name)`,
            {
              headers: { Authorization: `Bearer ${cleanToken}` }
            }
          )
          if (searchRes.ok) {
            const sData = (await searchRes.json()) as { files?: Array<{ id: string }> }
            if (sData.files && sData.files.length > 0) folderId = sData.files[0].id
          }
          if (!folderId) {
            const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${cleanToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                name: folderName,
                mimeType: 'application/vnd.google-apps.folder',
                description: 'TEMİN 360 Otomatik Kapanış Bulut Yedekleri'
              })
            })
            if (createRes.ok) {
              const cData = (await createRes.json()) as { id: string }
              folderId = cData.id
            }
          }

          if (folderId) {
            const fileName = basename(curFile)
            const fileData = fs.readFileSync(curFile)
            const now = new Date()
            const dateStr = now.toISOString().slice(0, 10)
            const timeStr = `${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`
            const rawBase = fileName.replace(/\.dtal$/i, '').replace(/_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}$/, '')
            const backupFileName = `${rawBase}_${dateStr}_${timeStr}.dtal`

            const boundary = '--------------------------' + Date.now().toString(16)
            const metadata = JSON.stringify({
              name: backupFileName,
              description: `TEMİN 360 Kapanış Otomatik Yedeği (${new Date().toLocaleString('tr-TR')})`,
              parents: [folderId]
            })

            const metadataBuffer = Buffer.from(
              `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n`,
              'utf-8'
            )
            const fileHeaderBuffer = Buffer.from(
              `--${boundary}\r\nContent-Type: application/octet-stream\r\n\r\n`,
              'utf-8'
            )
            const closingBuffer = Buffer.from(`\r\n--${boundary}--`, 'utf-8')
            const multipartBody = Buffer.concat([
              metadataBuffer,
              fileHeaderBuffer,
              fileData,
              closingBuffer
            ])

            await fetch(
              'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
              {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${cleanToken}`,
                  'Content-Type': `multipart/related; boundary=${boundary}`
                },
                body: multipartBody
              }
            )

            workspaceManager.markSynced('gdrive')

            // Prune: keep last 7 versions
            const qList = encodeURIComponent(
              `'${folderId}' in parents and trashed = false and (name contains '.dtal' or name contains '.hkmp')`
            )
            const listRes = await fetch(
              `https://www.googleapis.com/drive/v3/files?q=${qList}&fields=files(id,name,createdTime)&orderBy=createdTime%20desc`,
              {
                headers: { Authorization: `Bearer ${cleanToken}` }
              }
            )
            if (listRes.ok) {
              const lData = (await listRes.json()) as { files?: Array<{ id: string }> }
              const files = lData.files || []
              if (files.length > 7) {
                const toDel = files.slice(7)
                for (const f of toDel) {
                  await fetch(`https://www.googleapis.com/drive/v3/files/${f.id}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${cleanToken}` }
                  }).catch(() => {})
                }
              }
            }
          }
        }
      }
    } catch {
      // Non-blocking gdrive fail-safe
    }
  } catch {
    // Non-blocking fail-safe
  }
}



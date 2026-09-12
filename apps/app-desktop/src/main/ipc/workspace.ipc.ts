import { ipcMain, BrowserWindow, dialog } from 'electron'
import { basename } from 'path'
import fs from 'fs'
import nodemailer from 'nodemailer'
import { workspaceManager } from '../database/workspace'

export function registerWorkspaceIpcHandlers(closeAllSecondaryWindows: () => void): void {
  ipcMain.handle('workspace:create', async (_, filePath: string, institutionName: string) => {
    try {
      const meta = workspaceManager.create(filePath, institutionName)
      return { success: true, meta, newFilePath: workspaceManager.getCurrentFilePath() }
    } catch (error: any) {
      console.error('Create workspace error:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle(
    'workspace:open',
    async (_, filePath: string, allowMigration: boolean = false) => {
      try {
        closeAllSecondaryWindows()
        const meta = workspaceManager.open(filePath, allowMigration)
        return { success: true, meta, newFilePath: workspaceManager.getCurrentFilePath() }
      } catch (error: any) {
        if (error.message && error.message.startsWith('MIGRATION_REQUIRED|')) {
          const payloadStr = error.message.split('|')[1]
          const payload = JSON.parse(payloadStr)
          return { success: false, ...payload }
        }
        console.error('Open workspace error:', error)
        return { success: false, error: error.message }
      }
    }
  )

  ipcMain.handle('workspace:save', async () => {
    try {
      const filePath = workspaceManager.getCurrentFilePath()
      if (!filePath) {
        return { success: false, error: 'Aktif bir çalışma dosyası bulunamadı!' }
      }
      workspaceManager.save()
      return { success: true, message: 'Çalışma dosyası başarıyla kaydedildi.' }
    } catch (error: any) {
      console.error('Save workspace error:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('workspace:close', async () => {
    try {
      closeAllSecondaryWindows()
      try {
        workspaceManager.save()
      } catch (saveErr) {
        console.error('Auto-save on close error:', saveErr)
      }
      workspaceManager.close()
      return { success: true }
    } catch (error: any) {
      console.error('Close workspace error:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('workspace:backup', async (event) => {
    try {
      const filePath = workspaceManager.getCurrentFilePath()
      if (!filePath) {
        return { success: false, error: 'Aktif bir çalışma dosyası bulunamadı!' }
      }
      workspaceManager.save()

      const win = BrowserWindow.fromWebContents(event.sender)
      const { filePath: destPath } = await dialog.showSaveDialog(win!, {
        title: 'Yedek Dosyasını Kaydet',
        defaultPath: basename(filePath),
        filters: [{ name: 'TEMİN 360 Proje Dosyası (*.temin, *.hkmp, *.dtal)', extensions: ['temin', 'hkmp', 'dtal'] }]
      })

      if (!destPath) {
        return { success: false, error: 'Yedekleme iptal edildi' }
      }

      fs.copyFileSync(filePath, destPath)
      return { success: true, backupPath: destPath }
    } catch (error: any) {
      console.error('Backup workspace error:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('workspace:backup-server', async () => {
    try {
      const filePath = workspaceManager.getCurrentFilePath()
      if (!filePath) {
        return { success: false, error: 'Aktif bir çalışma dosyası bulunamadı!' }
      }
      workspaceManager.save()
      console.log(`[Mock] Uploading ${filePath} to web server as a backup...`)
      await new Promise((resolve) => setTimeout(resolve, 1500))
      return { success: true, message: 'Web sunucusuna başarıyla yüklendi.' }
    } catch (error: any) {
      console.error('Backup to server error:', error)
      return { success: false, error: error.message }
    }
  })

  // Shared Google Drive Token Refresh Helper (DB'den dinamik okunur, asla hardcoded değil)
  const tryRefreshToken = async (db: any): Promise<string | null> => {
    try {
      const refreshRow = db
        .prepare("SELECT value FROM settings WHERE key = 'gdriveRefreshToken'")
        .get() as { value?: string }
      const refreshToken = refreshRow?.value
      if (!refreshToken) return null

      const clientIdRow = db
        .prepare("SELECT value FROM settings WHERE key = 'gdriveClientId'")
        .get() as { value?: string }
      const clientSecretRow = db
        .prepare("SELECT value FROM settings WHERE key = 'gdriveClientSecret'")
        .get() as { value?: string }

      const clientId = clientIdRow?.value?.trim()
      const clientSecret = clientSecretRow?.value?.trim()

      if (!clientId || !clientSecret) {
        console.warn('[Google Drive] gdriveClientId veya gdriveClientSecret ayarlanmamış. Token otomatik yenilenemiyor.')
        return null
      }

      const cleanRefresh = String(refreshToken).trim().replace(/^["']|["']$/g, '').replace(/[\r\n\s]+/g, '')

      const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: cleanRefresh,
          grant_type: 'refresh_token'
        }).toString()
      })

      if (res.ok) {
        const data = (await res.json()) as { access_token?: string }
        if (data.access_token) {
          db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('gdriveAccessToken', ?)")
            .run(data.access_token)
          console.log('[Google Drive] Access token otomatik yenilendi.')
          return data.access_token
        }
      } else {
        const errText = await res.text()
        console.warn('[Google Drive] Refresh token isteği başarısız:', res.status, errText)
      }
    } catch (err) {
      console.error('[Google Drive] Token yenileme hatası:', err)
    }
    return null
  }

  // Tek tıkla yerel OAuth loopback akışı (Tarayıcı açıp yetkiyi otomatik alır)
  ipcMain.handle('workspace:start-gdrive-oauth', async (_, args?: { clientId?: string; clientSecret?: string }) => {
    try {
      const db = workspaceManager.getDb()
      let clientId = args?.clientId?.trim()
      let clientSecret = args?.clientSecret?.trim()

      if (!clientId) {
        const clientIdRow = db.prepare("SELECT value FROM settings WHERE key = 'gdriveClientId'").get() as { value?: string }
        clientId = clientIdRow?.value?.trim()
      }
      if (!clientSecret) {
        const clientSecretRow = db.prepare("SELECT value FROM settings WHERE key = 'gdriveClientSecret'").get() as { value?: string }
        clientSecret = clientSecretRow?.value?.trim()
      }

      if (!clientId || !clientSecret) {
        return {
          success: false,
          error: 'Önce Google Cloud Client ID ve Client Secret alanlarını doldurun veya client_secret.json yükleyin.'
        }
      }

      // Güncel değerleri veritabanına kaydet
      try {
        db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('gdriveClientId', ?)").run(clientId)
        db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('gdriveClientSecret', ?)").run(clientSecret)
      } catch (dbSaveErr) {
        console.warn('Could not save client id/secret before oauth:', dbSaveErr)
      }

      const http = await import('http')
      const { shell } = await import('electron')

      return new Promise((resolve) => {
        let isResolved = false
        let port = 0

        const server = http.createServer(async (req, res) => {
          try {
            const reqUrl = new URL(req.url || '', `http://127.0.0.1:${port}`)
            const code = reqUrl.searchParams.get('code')
            const error = reqUrl.searchParams.get('error')

            if (error) {
              res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
              res.end('<h2>❌ Giriş İptal Edildi.</h2><p>Bu sekmeyi kapatıp uygulamaya dönebilirsiniz.</p>')
              server.close()
              if (!isResolved) {
                isResolved = true
                resolve({ success: false, error: `Google Yetkilendirme Hatası: ${error}` })
              }
              return
            }

            if (code) {
              res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
              res.end(`
                <!DOCTYPE html>
                <html>
                <head><meta charset="utf-8"><title>Temin 360 - Bağlantı Başarılı</title></head>
                <body style="font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #0f172a; color: #f8fafc; text-align: center;">
                  <div style="background: #1e293b; padding: 40px 60px; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.4); border: 1px solid #334155;">
                    <div style="font-size: 50px; margin-bottom: 10px;">🎉</div>
                    <h2 style="color: #38bdf8; margin: 0 0 10px 0;">Google Drive Bağlantısı Başarılı!</h2>
                    <p style="color: #94a3b8; font-size: 14px; margin: 0 0 20px 0;">Yetkilendirme tamamlandı. Bu sekmeyi kapatıp Temin 360 uygulamasına dönebilirsiniz.</p>
                  </div>
                </body>
                </html>
              `)
              server.close()

              // Exchange authorization code for tokens
              const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                  code,
                  client_id: clientId,
                  client_secret: clientSecret,
                  redirect_uri: `http://127.0.0.1:${port}`,
                  grant_type: 'authorization_code'
                }).toString()
              })

              if (!tokenRes.ok) {
                const errText = await tokenRes.text()
                if (!isResolved) {
                  isResolved = true
                  resolve({ success: false, error: `Token alma hatası (${tokenRes.status}): ${errText}` })
                }
                return
              }

              const tokenData = (await tokenRes.json()) as { access_token?: string; refresh_token?: string }
              if (tokenData.access_token) {
                db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('gdriveAccessToken', ?)").run(tokenData.access_token)
              }
              if (tokenData.refresh_token) {
                db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('gdriveRefreshToken', ?)").run(tokenData.refresh_token)
              }

              if (!isResolved) {
                isResolved = true
                resolve({
                  success: true,
                  accessToken: tokenData.access_token,
                  refreshToken: tokenData.refresh_token
                })
              }
            }
          } catch (e: any) {
            server.close()
            if (!isResolved) {
              isResolved = true
              resolve({ success: false, error: e.message })
            }
          }
        })

        server.listen(0, '127.0.0.1', () => {
          const addr = server.address()
          port = typeof addr === 'object' && addr ? addr.port : 0
          const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
            clientId
          )}&redirect_uri=${encodeURIComponent(
            `http://127.0.0.1:${port}`
          )}&response_type=code&scope=${encodeURIComponent(
            'https://www.googleapis.com/auth/drive.file'
          )}&access_type=offline&prompt=consent`

          shell.openExternal(authUrl)
        })

        // Timeout after 3 minutes if user didn't finish
        setTimeout(() => {
          if (!isResolved) {
            isResolved = true
            try { server.close() } catch {}
            resolve({ success: false, error: 'Oturum açma işlemi zaman aşımına uğradı (3 dakika).' })
          }
        }, 180000)
      })
    } catch (error: any) {
      console.error('Google OAuth loopback error:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('workspace:backup-gdrive', async (_, args?: { token?: string; force?: boolean }) => {
    try {
      const filePath = workspaceManager.getCurrentFilePath()
      if (!filePath) {
        return { success: false, error: 'Aktif bir çalışma dosyası bulunamadı!' }
      }
      workspaceManager.save()

      // Dosyada güncelleme/değişiklik yoksa gereksiz Google Drive yüklemesi yapma
      if (!args?.force && !workspaceManager.hasChanges('gdrive')) {
        console.log('[Google Drive] Dosyada değişiklik bulunmadığı için yükleme atlandı.')
        return {
          success: true,
          skipped: true,
          message: 'Dosyada son yedeklemeden bu yana herhangi bir değişiklik yapılmadığı için Google Drive yüklemesi atlandı.'
        }
      }

      const db = workspaceManager.getDb()
      let token = args?.token
      if (!token) {
        try {
          const row = db
            .prepare("SELECT value FROM settings WHERE key = 'gdriveAccessToken'")
            .get() as { value?: string }
          token = row?.value
        } catch {
          // Table/setting check fallback
        }
      }

      const fileName = basename(filePath)
      const fileData = fs.readFileSync(filePath)

      if (token) {
        let cleanToken = String(token).trim().replace(/^["']|["']$/g, '').replace(/^Bearer\s+/i, '').replace(/[\r\n\s]+/g, '')

        // 401 durumunda refresh token ile otomatik yenile
        let folderId: string
        try {
          folderId = await getOrCreateAppFolder(cleanToken)
        } catch (err: any) {
          if (err.message?.includes('GDRIVE_TOKEN_EXPIRED')) {
            console.log('[Google Drive] Token expire, refresh deneniyor...')
            const newToken = await tryRefreshToken(db)
            if (newToken) {
              cleanToken = newToken
              folderId = await getOrCreateAppFolder(cleanToken)
            } else {
              return {
                success: false,
                error: 'Google Drive erişim jetonu süresi dolmuş. Lütfen yeni Access Token girin ya da Refresh Token ve API ayarlarınızı kontrol edin.'
              }
            }
          } else {
            throw err
          }
        }

        // Versioned timestamped filename: e.g. Acme_2026-09-06_17-46.dtal
        const now = new Date()
        const pad = (n: number) => String(n).padStart(2, '0')
        const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
        const timeStr = `${pad(now.getHours())}-${pad(now.getMinutes())}`
        const rawBase = fileName
          .replace(/\.temin$/i, '')
          .replace(/\.dtal$/i, '')
          .replace(/\.hkmp$/i, '')
          .replace(/_\d{4}[-_.]\d{2}[-_.]\d{2}(?:[-_.]\d{2}[-_.]\d{2})?$/, '')
        const backupFileName = `${rawBase}_${dateStr}_${timeStr}.temin`

        // Construct multipart boundary for metadata + binary payload
        const boundary = '--------------------------' + Date.now().toString(16)
        const metadata = JSON.stringify({
          name: backupFileName,
          description: `TEMİN 360 Çalışma Dosyası Yedeği (${dateStr} ${timeStr.replace('-', ':')})`,
          parents: [folderId]
        })

        const metadataPart = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n`
        const fileHeaderPart = `--${boundary}\r\nContent-Type: application/octet-stream\r\n\r\n`
        const closingPart = `\r\n--${boundary}--`

        const metadataBuffer = Buffer.from(metadataPart, 'utf-8')
        const fileHeaderBuffer = Buffer.from(fileHeaderPart, 'utf-8')
        const closingBuffer = Buffer.from(closingPart, 'utf-8')

        const multipartBody = Buffer.concat([
          metadataBuffer,
          fileHeaderBuffer,
          fileData,
          closingBuffer
        ])

        const res = await fetch(
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

        if (!res.ok) {
          const errText = await res.text()
          throw new Error(`Google Drive API Yükleme Hatası (${res.status}): ${errText}`)
        }

        const uploadedFile = (await res.json()) as any

        // Prune older backups: keep only last 7 versions
        await pruneOldBackups(cleanToken, folderId, 7)

        // Track backup history in SQLite database
        try {
          const db = workspaceManager.getDb()
          db.exec(`
            CREATE TABLE IF NOT EXISTS LOG_YedekGecmisi (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              hedef TEXT NOT NULL,
              dosya_adi TEXT NOT NULL,
              gdrive_file_id TEXT,
              boyut_bytes INTEGER,
              surum_no TEXT,
              tarih TEXT NOT NULL,
              aciklama TEXT
            );
          `)
          db.prepare(`
            INSERT INTO LOG_YedekGecmisi (hedef, dosya_adi, gdrive_file_id, boyut_bytes, surum_no, tarih, aciklama)
            VALUES (?, ?, ?, ?, ?, datetime('now', 'localtime'), ?)
          `).run(
            'gdrive',
            backupFileName,
            uploadedFile.id,
            fileData.length,
            '1.0.0-beta.92',
            'Google Drive Bulut Yedeği (TEMIN_360_YEDEKLER)'
          )
          db.prepare(`INSERT OR REPLACE INTO settings (key, value) VALUES ('lastGdriveSync', ?)`).run(new Date().toISOString())
          db.prepare(`INSERT OR REPLACE INTO settings (key, value) VALUES ('lastBackupFileName', ?)`).run(backupFileName)
          db.prepare(`INSERT OR REPLACE INTO settings (key, value) VALUES ('lastBackupFileId', ?)`).run(uploadedFile.id)
          db.prepare(`INSERT OR REPLACE INTO settings (key, value) VALUES ('dbVersion', '1.0.0-beta.92')`).run()
        } catch (dbErr) {
          console.error('Failed to log backup history in DB:', dbErr)
        }

        workspaceManager.markSynced('gdrive')

        return {
          success: true,
          message: `${backupFileName} başarıyla Google Drive 'TEMIN_360_YEDEKLER' klasörüne yüklendi (Son 7 sürüm muhafaza ediliyor).`,
          fileId: uploadedFile.id
        }
      }

      // Fallback response if token not configured yet
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return {
        success: true,
        message: `${fileName} dosyanız Google Drive yedeği için hazırlandı. (Ayarlar > Google Drive alanından Access Token girdiğinizde doğrudan bulut senkronizasyonu aktif olacaktır.)`
      }
    } catch (error: any) {
      console.error('Google Drive backup error:', error)
      return { success: false, error: error.message }
    }
  })

  async function pruneOldBackups(token: string, folderId: string, maxVersions = 7): Promise<void> {
    try {
      const query = encodeURIComponent(
        `'${folderId}' in parents and trashed = false and (name contains '.temin' or name contains '.dtal' or name contains '.hkmp')`
      )
      const res = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,createdTime)&orderBy=createdTime%20desc`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      if (res.ok) {
        const data = (await res.json()) as { files?: Array<{ id: string; name: string }> }
        const files = data.files || []
        if (files.length > maxVersions) {
          const toDelete = files.slice(maxVersions)
          for (const file of toDelete) {
            await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` }
            }).catch(console.error)
          }
        }
      }
    } catch (err) {
      console.error('Google Drive backup pruning error:', err)
    }
  }

  async function getOrCreateAppFolder(token: string): Promise<string> {
    const folderName = 'TEMIN_360_YEDEKLER'
    const query = encodeURIComponent(
      `mimeType = 'application/vnd.google-apps.folder' and name = '${folderName}' and trashed = false`
    )

    // 1. Klasörü ara
    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`,
      { headers: { Authorization: `Bearer ${token}` } }
    )

    if (searchRes.status === 401) {
      throw new Error(
        'GDRIVE_TOKEN_EXPIRED: Google Drive erişim jetonu (access token) süresi dolmuş veya geçersiz. ' +
        'Lütfen Google OAuth Playground (developers.google.com/oauthplayground) adresinden yeni bir access_token alıp ' +
        'Ayarlar > Google Drive bölümünden güncelleyin. OAuth token\'ları yaklaşık 1 saat geçerlidir.'
      )
    }

    if (searchRes.ok) {
      const data = (await searchRes.json()) as { files?: Array<{ id: string; name: string }> }
      if (data.files && data.files.length > 0) {
        console.log(`[Google Drive] ${folderName} klasörü bulundu:`, data.files[0].id)
        return data.files[0].id
      }
    } else {
      const errText = await searchRes.text()
      throw new Error(`Google Drive klasör arama hatası (${searchRes.status}): ${errText}`)
    }

    // 2. Klasör bulunamadıysa oluştur
    console.log(`[Google Drive] ${folderName} bulunamadı, oluşturuluyor...`)
    const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        description: 'TEMİN 360 Doğrudan Temin Çalışma Alanı Bulut Yedekleri'
      })
    })

    if (createRes.status === 401) {
      throw new Error(
        'GDRIVE_TOKEN_EXPIRED: Google Drive erişim jetonu (access token) süresi dolmuş veya geçersiz. ' +
        'Lütfen Google OAuth Playground adresinden yeni bir access_token alıp Ayarlar > Google Drive bölümünden güncelleyin.'
      )
    }

    if (createRes.ok) {
      const folderData = (await createRes.json()) as { id: string }
      console.log(`[Google Drive] ${folderName} klasörü oluşturuldu:`, folderData.id)
      return folderData.id
    }

    const errText = await createRes.text()
    throw new Error(`Google Drive klasörü oluşturulamadı (${createRes.status}): ${errText}`)
  }

  ipcMain.handle('workspace:list-gdrive-files', async (_, args?: { token?: string }) => {
    try {
      const db = workspaceManager.getDb()
      let token = args?.token
      if (!token) {
        try {
          const row = db
            .prepare("SELECT value FROM settings WHERE key = 'gdriveAccessToken'")
            .get() as { value?: string }
          token = row?.value
        } catch {
          // Fallback
        }
      }

      if (!token) {
        return {
          success: false,
          error: 'Google Drive API Access Token bulunamadı. Lütfen Ayarlar > Google Drive alanından token tanımlayın.'
        }
      }

      let cleanToken = String(token).trim().replace(/^["']|["']$/g, '').replace(/^Bearer\s+/i, '').replace(/[\r\n\s]+/g, '')
      let folderId: string
      try {
        folderId = await getOrCreateAppFolder(cleanToken)
      } catch (err: any) {
        if (err.message?.includes('GDRIVE_TOKEN_EXPIRED') || err.message?.includes('401')) {
          console.log('[Google Drive list] Token expire, refresh deneniyor...')
          const newToken = await tryRefreshToken(db)
          if (newToken) {
            cleanToken = newToken
            folderId = await getOrCreateAppFolder(cleanToken)
          } else {
            return {
              success: false,
              error: 'Google Drive erişim jetonunun süresi dolmuş veya geçersiz. Lütfen yeni Access Token girin ya da Refresh Token ve API ayarlarınızı kontrol edin.'
            }
          }
        } else {
          throw err
        }
      }

      const query = encodeURIComponent(`'${folderId}' in parents and trashed = false`)
      let res = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,size,mimeType,modifiedTime,createdTime)&orderBy=createdTime%20desc`,
        {
          headers: {
            Authorization: `Bearer ${cleanToken}`
          }
        }
      )

      if (res.status === 401) {
        const newToken = await tryRefreshToken(db)
        if (newToken) {
          cleanToken = newToken
          res = await fetch(
            `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,size,mimeType,modifiedTime,createdTime)&orderBy=createdTime%20desc`,
            {
              headers: {
                Authorization: `Bearer ${cleanToken}`
              }
            }
          )
        }
      }

      if (!res.ok) {
        const errText = await res.text()
        throw new Error(`Google Drive Dosyaları Listelenemedi (${res.status}): ${errText}`)
      }

      const data = (await res.json()) as any
      // Strict security filter: only allow .temin / .dtal / .hkmp files inside TEMIN_360_YEDEKLER folder
      const validFiles = (data.files || []).filter(
        (f: any) =>
          (f.name.endsWith('.temin') || f.name.endsWith('.dtal') || f.name.endsWith('.hkmp')) &&
          f.mimeType !== 'application/vnd.google-apps.folder'
      )

      return {
        success: true,
        files: validFiles
      }
    } catch (error: any) {
      console.error('Google Drive list error:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle(
    'workspace:download-gdrive-file',
    async (_, args: { fileId: string; fileName: string; token?: string; overwriteActive?: boolean }) => {
      try {
        let token = args.token
        if (!token) {
          const db = workspaceManager.getDb()
          try {
            const row = db
              .prepare("SELECT value FROM settings WHERE key = 'gdriveAccessToken'")
              .get() as { value?: string }
            token = row?.value
          } catch {
            // Fallback
          }
        }

        if (!token) {
          return {
            success: false,
            error: 'Google Drive Access Token bulunamadı. Lütfen Ayarlar > Google Drive alanından token tanımlayın.'
          }
        }

        const cleanToken = String(token).trim().replace(/^["']|["']$/g, '').replace(/^Bearer\s+/i, '').replace(/[\r\n\s]+/g, '')
        
        // Security check: Only permit .temin, .dtal and .hkmp files
        if (!args.fileName.endsWith('.temin') && !args.fileName.endsWith('.dtal') && !args.fileName.endsWith('.hkmp')) {
          throw new Error('Güvenlik Koruması: Sadece geçerli .temin / .dtal çalışma alanı yedekleri indirilebilir.')
        }

        // Verify file belongs strictly to TEMIN_360_YEDEKLER folder
        const folderId = await getOrCreateAppFolder(cleanToken)
        const metaRes = await fetch(
          `https://www.googleapis.com/drive/v3/files/${args.fileId}?fields=id,name,parents,mimeType`,
          {
            headers: {
              Authorization: `Bearer ${cleanToken}`
            }
          }
        )

        if (metaRes.ok) {
          const metaData = (await metaRes.json()) as { parents?: string[]; mimeType?: string }
          if (metaData.mimeType === 'application/vnd.google-apps.folder') {
            throw new Error('Güvenlik Koruması: Klasörler doğrudan indirilemez.')
          }
          if (metaData.parents && !metaData.parents.includes(folderId)) {
            throw new Error('Güvenlik Koruması: Bu dosya TEMIN_360_YEDEKLER klasörüne ait değil.')
          }
        }

        const res = await fetch(
          `https://www.googleapis.com/drive/v3/files/${args.fileId}?alt=media`,
          {
            headers: {
              Authorization: `Bearer ${cleanToken}`
            }
          }
        )

        if (!res.ok) {
          const errText = await res.text()
          throw new Error(`Google Drive İndirme Hatası (${res.status}): ${errText}`)
        }

        const arrayBuffer = await res.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Determine destination path: overwrite active workspace or save as new file
        const currentPath = workspaceManager.getCurrentFilePath()
        let targetPath: string

        if (args.overwriteActive && currentPath && fs.existsSync(currentPath)) {
          // Create a safety backup before overwriting active workspace
          try {
            fs.copyFileSync(currentPath, currentPath + '.bak')
          } catch (e) {
            console.warn('Safety backup could not be created:', e)
          }
          workspaceManager.close()
          fs.writeFileSync(currentPath, buffer)
          targetPath = currentPath
        } else {
          const defaultPath = require('path').join(
            require('os').homedir(),
            'Desktop',
            args.fileName.endsWith('.temin') || args.fileName.endsWith('.dtal') || args.fileName.endsWith('.hkmp')
              ? args.fileName
              : `${args.fileName}.temin`
          )
          fs.writeFileSync(defaultPath, buffer)
          targetPath = defaultPath
        }

        // Open downloaded file as active workspace
        closeAllSecondaryWindows()
        const meta = workspaceManager.open(targetPath, true)

        return {
          success: true,
          message: args.overwriteActive
            ? `${args.fileName} buluttan indirildi ve mevcut aktif çalışma dosyanız güncellendi.`
            : `${args.fileName} Google Drive'dan başarıyla indirildi ve çalışma alanı olarak açıldı.`,
          meta,
          filePath: targetPath
        }
      } catch (error: any) {
        console.error('Google Drive download error:', error)
        return { success: false, error: error.message }
      }
    }
  )

  ipcMain.handle(
    'workspace:delete-gdrive-file',
    async (_, args: { fileId: string; token?: string }) => {
      try {
        let token = args.token
        if (!token) {
          const db = workspaceManager.getDb()
          try {
            const row = db
              .prepare("SELECT value FROM settings WHERE key = 'gdriveAccessToken'")
              .get() as { value?: string }
            token = row?.value
          } catch {
            // Fallback
          }
        }

        if (!token) {
          return { success: false, error: 'Google Drive token bulunamadı.' }
        }

        const cleanToken = String(token).trim().replace(/^["']|["']$/g, '').replace(/^Bearer\s+/i, '').replace(/[\r\n\s]+/g, '')
        const folderId = await getOrCreateAppFolder(cleanToken)

        // Verify file is strictly in TEMIN_360_YEDEKLER folder
        const metaRes = await fetch(
          `https://www.googleapis.com/drive/v3/files/${args.fileId}?fields=id,parents`,
          { headers: { Authorization: `Bearer ${cleanToken}` } }
        )
        if (metaRes.ok) {
          const meta = (await metaRes.json()) as { parents?: string[] }
          if (meta.parents && !meta.parents.includes(folderId)) {
            throw new Error('Güvenlik Koruması: Yalnızca TEMIN_360_YEDEKLER klasöründeki yedekler silinebilir.')
          }
        }

        const res = await fetch(`https://www.googleapis.com/drive/v3/files/${args.fileId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${cleanToken}` }
        })

        if (!res.ok && res.status !== 204) {
          const errText = await res.text()
          throw new Error(`Silme hatası (${res.status}): ${errText}`)
        }

        return { success: true, message: 'Yedek dosyası Google Drive üzerinden başarıyla silindi.' }
      } catch (err: any) {
        return { success: false, error: err.message }
      }
    }
  )

  ipcMain.handle('workspace:backup-email', async (_, args?: { force?: boolean }) => {
    try {
      const filePath = workspaceManager.getCurrentFilePath()
      if (!filePath) {
        return { success: false, error: 'Aktif bir çalışma dosyası bulunamadı!' }
      }
      workspaceManager.save()

      // Dosyada güncelleme/değişiklik yoksa gereksiz e-posta gönderimi yapma
      if (!args?.force && !workspaceManager.hasChanges('email')) {
        console.log('[Email Backup] Dosyada değişiklik bulunmadığı için e-posta gönderimi atlandı.')
        return {
          success: true,
          skipped: true,
          message: 'Dosyada son gönderimden bu yana herhangi bir değişiklik bulunmadığı için e-posta gönderimi atlandı.'
        }
      }

      const db = workspaceManager.getDb()
      const hostRow = db.prepare("SELECT value FROM settings WHERE key = 'smtpHost'").get() as {
        value: string
      }
      const portRow = db.prepare("SELECT value FROM settings WHERE key = 'smtpPort'").get() as {
        value: string
      }
      const userRow = db.prepare("SELECT value FROM settings WHERE key = 'smtpUser'").get() as {
        value: string
      }
      const passRow = db.prepare("SELECT value FROM settings WHERE key = 'smtpPass'").get() as {
        value: string
      }
      const emailRow = db
        .prepare("SELECT value FROM settings WHERE key = 'smtpReceiver'")
        .get() as { value: string }
      const secureRow = db
        .prepare("SELECT value FROM settings WHERE key = 'smtpSecure'")
        .get() as { value: string }

      if (!hostRow?.value || !userRow?.value || !passRow?.value) {
        return { success: false, error: 'SMTP ayarları yapılandırılmamış!' }
      }

      const receiver = emailRow?.value || userRow.value
      const port = parseInt(portRow.value) || 587
      const userSecure = secureRow?.value === 'true'
      const actualSecure = port === 465 ? true : port === 587 ? false : userSecure

      const transporter = nodemailer.createTransport({
        host: hostRow.value,
        port: port,
        secure: actualSecure,
        auth: {
          user: userRow.value,
          pass: passRow.value
        },
        tls: {
          rejectUnauthorized: false
        }
      })

      const fileName = basename(filePath)
      await transporter.sendMail({
        from: `"TEMİN 360 Yedekleme" <${userRow.value}>`,
        to: receiver,
        subject: `TEMİN 360 Veritabanı Yedeği - ${fileName}`,
        text: `Kurum dosyası yedeğiniz ektedir.\nDosya adı: ${fileName}\nTarih: ${new Date().toLocaleString('tr-TR')}`,
        attachments: [
          {
            filename: fileName,
            path: filePath
          }
        ]
      })

      workspaceManager.markSynced('email')
      return { success: true, email: receiver }
    } catch (error: any) {
      console.error('Email backup error:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('workspace:check-changes', async () => {
    try {
      return {
        success: true,
        hasChanges: workspaceManager.hasChanges('any'),
        hasGdriveChanges: workspaceManager.hasChanges('gdrive'),
        hasEmailChanges: workspaceManager.hasChanges('email'),
        currentHash: workspaceManager.getCurrentHash()
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        hasChanges: false,
        hasGdriveChanges: false,
        hasEmailChanges: false
      }
    }
  })

  ipcMain.handle('workspace:get-meta', async () => {
    try {
      const meta = workspaceManager.getMeta()
      return { success: true, meta }
    } catch (error: any) {
      console.error('Get meta error:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('workspace:upload-file', async (_, sourcePath: string) => {
    try {
      const result = workspaceManager.uploadAttachment(sourcePath)
      return { success: true, ...result }
    } catch (error: any) {
      console.error('Upload attachment error:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('workspace:open-file', async (_, relativePath: string) => {
    try {
      const success = await workspaceManager.openAttachment(relativePath)
      return { success }
    } catch (error: any) {
      console.error('Open attachment error:', error)
      return { success: false, error: error.message }
    }
  })
}

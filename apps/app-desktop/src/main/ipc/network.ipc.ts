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

  // ---------------- DETSİS DOĞRULAMA & CACHE MOTORU ----------------
  ipcMain.handle('network:verify-detsis', async (_, { detsisNo, force }: { detsisNo: string; force?: boolean }) => {
    if (!detsisNo || typeof detsisNo !== 'string') {
      return { success: false, verified: false, error: 'DETSİS numarası geçersiz.' }
    }
    const cleanNo = detsisNo.trim().replace(/[^0-9]/g, '')
    if (!cleanNo) {
      return { success: false, verified: false, error: 'DETSİS numarası yalnızca sayılardan oluşmalıdır.' }
    }

    const db = workspaceManager.getDb()

    // 1. Önce DB Cache kontrol et (force değilse)
    if (!force && db) {
      try {
        const cached = db.prepare('SELECT * FROM TANIM_DetsisCache WHERE detsis_no = ?').get(cleanNo) as {
          detsis_no: string
          is_verified: number
          birim_adi?: string
          kurum_adi?: string
          kurum_hiyerarsisi?: string
          ulke_adi?: string
          il_adi?: string
          ilce_adi?: string
          kategori_adi?: string
          statu_adi?: string
          logo_base64?: string
          ingilizce_adi?: string
          url?: string
          status_code?: number
          verified_at?: string
        } | undefined

        if (cached) {
          return {
            success: true,
            cached: true,
            verified: cached.is_verified === 1,
            detsisNo: cleanNo,
            birimAdi: cached.birim_adi || '',
            kurumAdi: cached.kurum_adi || '',
            kurumHiyerarsisi: cached.kurum_hiyerarsisi || '',
            ulkeAdi: cached.ulke_adi || '',
            ilAdi: cached.il_adi || '',
            ilceAdi: cached.ilce_adi || '',
            kategoriAdi: cached.kategori_adi || '',
            statuAdi: cached.statu_adi || '',
            logoByteArray: cached.logo_base64 || '',
            ingilizceAdi: cached.ingilizce_adi || '',
            url: cached.url || `https://detsis.gov.tr/ara/${cleanNo}`,
            statusCode: cached.status_code || 200,
            verifiedAt: cached.verified_at
          }
        }
      } catch (e) {
        console.warn('[DETSİS Cache Check] Warning:', e)
      }
    }

    // 2. DETSİS Resmi API & Web Siteleri üzerinden sorgulama
    const apiEndpoint = `https://yetkiliapi.detsis.gov.tr/api/backoffice/unauthorizedaccessdata/birimler?birimId=${cleanNo}&pageSize=10&page=1`
    const targetUrl = `https://detsis.gov.tr/ara/${cleanNo}`
    const kaysisUrl = `https://www.kaysis.gov.tr/Kutuphane/Kurum/Detay/${cleanNo}`

    let isVerified = false
    let statusCode = 0
    let birimAdi = ''
    let kurumAdi = ''
    let kurumHiyerarsisi = ''
    let ulkeAdi = ''
    let ilAdi = ''
    let ilceAdi = ''
    let kategoriAdi = ''
    let statuAdi = ''
    let logoByteArray = ''
    let ingilizceAdi = ''
    let finalUrl = targetUrl
    let rawResponse = ''

    // 2.1 Öncelikle Yetkili DETSİS REST API'sini çağır (En kesin ve zengin veri kaynağı)
    try {
      const apiController = new AbortController()
      const apiTimeout = setTimeout(() => apiController.abort(), 6000)

      const apiRes = await fetch(apiEndpoint, {
        method: 'GET',
        headers: {
          Accept: 'application/json, text/plain, */*',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        signal: apiController.signal
      }).catch(() => null)
      clearTimeout(apiTimeout)

      if (apiRes && apiRes.ok) {
        statusCode = apiRes.status
        const json = await apiRes.json().catch(() => null)
        if (json && Array.isArray(json.data) && json.data.length > 0) {
          const item = json.data[0]
          isVerified = true
          birimAdi = item.birimAdi ? item.birimAdi.trim() : ''
          kurumAdi = item.kurumHiyerarsisi ? item.kurumHiyerarsisi.trim() : item.birimAdi?.trim() || ''
          kurumHiyerarsisi = item.kurumHiyerarsisi ? item.kurumHiyerarsisi.trim() : ''
          ulkeAdi = item.ulkeAdi ? item.ulkeAdi.trim() : ''
          ilAdi = item.ilAdi ? item.ilAdi.trim() : ''
          ilceAdi = item.ilceAdi ? item.ilceAdi.trim() : ''
          kategoriAdi = item.kategoriAdi ? item.kategoriAdi.trim() : ''
          statuAdi = item.statuAdi ? item.statuAdi.trim() : ''
          logoByteArray = item.logoByteArray || ''
          ingilizceAdi = item.ingilizceAdi ? item.ingilizceAdi.trim() : ''
          rawResponse = JSON.stringify(item).slice(0, 1000)
        }
      }
    } catch (apiErr: any) {
      console.warn('[DETSİS API Error]:', apiErr.message)
    }

    // 2.2 Eğer API doğrudan yanıt vermediyse HTML Fetch + Kaysis fallback'i dene
    if (!isVerified) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)

        let res = await fetch(targetUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
          },
          signal: controller.signal,
          redirect: 'follow'
        }).catch(() => null)

        clearTimeout(timeoutId)

        if (!res || !res.ok) {
          const kaysisController = new AbortController()
          const kaysisTimeoutId = setTimeout(() => kaysisController.abort(), 5000)
          const kaysisRes = await fetch(kaysisUrl, {
            method: 'GET',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            signal: kaysisController.signal,
            redirect: 'follow'
          }).catch(() => null)
          clearTimeout(kaysisTimeoutId)

          if (kaysisRes && kaysisRes.ok) {
            res = kaysisRes
            finalUrl = kaysisUrl
          }
        }

        if (res) {
          statusCode = res.status
          if (res.ok && res.status >= 200 && res.status < 400) {
            isVerified = true
            try {
              const html = await res.text()
              rawResponse = html.slice(0, 1000)
              const titleMatch = html.match(/<title>([^<]+)<\/title>/i)
              if (titleMatch && titleMatch[1]) {
                const titleText = titleMatch[1].replace(/- DETSİS|- KAYSİS|KAYSİS/gi, '').trim()
                if (titleText && !titleText.toLowerCase().includes('hata') && !titleText.toLowerCase().includes('bulunamadı')) {
                  birimAdi = titleText
                }
              }
            } catch {}
          }
        }

        // 2.3 Headless Chromium Scraper fallback
        if (!isVerified) {
          try {
            const scraped = await scrapeDetsisWithHeadlessBrowser(cleanNo)
            if (scraped && scraped.verified) {
              isVerified = true
              statusCode = 200
              if (scraped.birimAdi) birimAdi = scraped.birimAdi
              if (scraped.kurumAdi) kurumAdi = scraped.kurumAdi
              if (scraped.url) finalUrl = scraped.url
            }
          } catch (scrapErr: any) {
            console.warn('[Headless Scraper Warning]:', scrapErr.message)
          }
        }
      } catch (err: any) {
        console.warn('[DETSİS Fetch Error]:', err.message)
      }
    }

    const verifiedAt = new Date().toISOString()

    // 3. Veritabanına kaydet (Cache)
    if (db) {
      try {
        db.prepare(`
          INSERT OR REPLACE INTO TANIM_DetsisCache (
            detsis_no, is_verified, birim_adi, kurum_adi, kurum_hiyerarsisi, ulke_adi, il_adi, ilce_adi,
            kategori_adi, statu_adi, logo_base64, ingilizce_adi, url, status_code, response_data, verified_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'))
        `).run(
          cleanNo,
          isVerified ? 1 : 0,
          birimAdi || null,
          kurumAdi || null,
          kurumHiyerarsisi || null,
          ulkeAdi || null,
          ilAdi || null,
          ilceAdi || null,
          kategoriAdi || null,
          statuAdi || null,
          logoByteArray || null,
          ingilizceAdi || null,
          finalUrl,
          statusCode,
          rawResponse ? rawResponse.slice(0, 500) : null,
          verifiedAt
        )
      } catch (dbErr) {
        console.warn('[DETSİS DB Save Warning]:', dbErr)
      }
    }

    return {
      success: true,
      cached: false,
      verified: isVerified,
      detsisNo: cleanNo,
      birimAdi,
      kurumAdi,
      kurumHiyerarsisi,
      ulkeAdi,
      ilAdi,
      ilceAdi,
      kategoriAdi,
      statuAdi,
      logoByteArray,
      ingilizceAdi,
      url: finalUrl,
      statusCode,
      verifiedAt
    }
  })

  ipcMain.handle('network:get-detsis-cache', async (_, detsisNo: string) => {
    if (!detsisNo) return null
    const cleanNo = detsisNo.toString().trim().replace(/[^0-9]/g, '')
    if (!cleanNo) return null
    const db = workspaceManager.getDb()
    if (!db) return null
    try {
      const row = db.prepare('SELECT * FROM TANIM_DetsisCache WHERE detsis_no = ?').get(cleanNo) as {
        detsis_no: string
        is_verified: number
        birim_adi?: string
        kurum_adi?: string
        kurum_hiyerarsisi?: string
        ulke_adi?: string
        il_adi?: string
        ilce_adi?: string
        kategori_adi?: string
        statu_adi?: string
        logo_base64?: string
        ingilizce_adi?: string
        url?: string
        status_code?: number
        verified_at?: string
      } | undefined

      if (!row) return null
      return {
        cached: true,
        verified: row.is_verified === 1,
        detsisNo: row.detsis_no,
        birimAdi: row.birim_adi || '',
        kurumAdi: row.kurum_adi || '',
        kurumHiyerarsisi: row.kurum_hiyerarsisi || '',
        ulkeAdi: row.ulke_adi || '',
        ilAdi: row.il_adi || '',
        ilceAdi: row.ilce_adi || '',
        kategoriAdi: row.kategori_adi || '',
        statuAdi: row.statu_adi || '',
        logoByteArray: row.logo_base64 || '',
        ingilizceAdi: row.ingilizce_adi || '',
        url: row.url || `https://detsis.gov.tr/ara/${cleanNo}`,
        statusCode: row.status_code,
        verifiedAt: row.verified_at
      }
    } catch {
      return null
    }
  })

  // DETSİS Search by Name Handler (Tüm Birimler Arama)
  const handleDetsisSearch = async (_: any, query: string) => {
    try {
      const trimmed = (query || '').trim()
      if (!trimmed || trimmed.length < 2) {
        return { success: true, data: [] }
      }

      const encodedQuery = encodeURIComponent(trimmed)
      const searchUrl = `https://yetkiliapi.detsis.gov.tr/api/backoffice/unauthorizedaccessdata/tumbirimler/${encodedQuery}`

      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'application/json, text/plain, */*'
        },
        signal: AbortSignal.timeout(10000)
      })

      if (!response.ok) {
        return {
          success: false,
          error: `DETSİS arama hatası: HTTP ${response.status}`,
          data: []
        }
      }

      const json = (await response.json()) as {
        data?: Array<{
          kurumHiyerarsisi?: string
          detsisNo?: number
          ulkeAdi?: string
          yurtdisiIlAdi?: string
          uavtIlAdi?: string
          uavtIlceAdi?: string
          ulkeTurkiyeMi?: boolean
          birimAdi?: string
          ingilizceAdi?: string
          id?: number
        }>
        totalCount?: number
        message?: string
      }

      const data = (json?.data || []).map((item) => ({
        detsisNo: item.detsisNo ? String(item.detsisNo) : String(item.id || ''),
        birimAdi: item.birimAdi || '',
        kurumHiyerarsisi: item.kurumHiyerarsisi || '',
        ulkeAdi: item.ulkeAdi || (item.ulkeTurkiyeMi ? 'TÜRKİYE' : ''),
        ilAdi: item.uavtIlAdi || item.yurtdisiIlAdi || '',
        ilceAdi: item.uavtIlceAdi || '',
        ingilizceAdi: item.ingilizceAdi || ''
      }))

      return {
        success: true,
        totalCount: json?.totalCount || data.length,
        data
      }
    } catch (err: any) {
      console.error('[DETSİS Search] Error:', err)
      return { success: false, error: err?.message || 'Arama yapılamadı', data: [] }
    }
  }

  ipcMain.handle('network:search-detsis', handleDetsisSearch)
  ipcMain.handle('workspace:search-detsis', handleDetsisSearch)

  // DETSİS Sub-units Handler (Kurumun alt birimlerini çekme)
  ipcMain.handle('network:get-detsis-subunits', async (_, ustBirimId: string | number) => {
    try {
      const cleanNo = String(ustBirimId || '').trim().replace(/[^0-9]/g, '')
      if (!cleanNo) {
        return { success: false, error: 'Geçersiz DETSİS numarası', data: [] }
      }

      console.log(`[DETSİS Sub-units] Fetching sub-units for ustBirimId=${cleanNo}`)

      let allItems: any[] = []
      let totalCount = 0
      let currentPage = 1
      const pageSize = 100 // DETSİS API maksimum 100 destekler

      while (currentPage <= 5) {
        const url = `https://yetkiliapi.detsis.gov.tr/api/backoffice/unauthorizedaccessdata/birimler?ustBirimId=${cleanNo}&pageSize=${pageSize}&page=${currentPage}`
        const response = await fetch(url, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Accept: 'application/json, text/plain, */*'
          },
          signal: AbortSignal.timeout(12000)
        })

        if (!response.ok) {
          let errorDetail = ''
          try {
            const errJson = await response.json()
            errorDetail = errJson?.Message || errJson?.message || JSON.stringify(errJson)
          } catch {
            errorDetail = await response.text().catch(() => '')
          }
          console.error(`[DETSİS Sub-units] HTTP ${response.status}:`, errorDetail)
          return {
            success: false,
            error: errorDetail ? `DETSİS Hatası (${response.status}): ${errorDetail}` : `DETSİS Sunucu Hatası: HTTP ${response.status}`,
            data: []
          }
        }

        const json = await response.json()
        const pageData = json?.data || []
        totalCount = json?.totalCount || pageData.length
        allItems = allItems.concat(pageData)

        if (pageData.length < pageSize || allItems.length >= totalCount) {
          break
        }
        currentPage++
      }

      const list = allItems.map((item: any) => ({
        detsisNo: item.detsisNo ? String(item.detsisNo) : String(item.id || ''),
        birimAdi: item.birimAdi || '',
        kurumHiyerarsisi: item.kurumHiyerarsisi || '',
        ulkeAdi: item.ulkeAdi || '',
        ilAdi: item.ilAdi || '',
        ilceAdi: item.ilceAdi || '',
        kategoriAdi: item.kategoriAdi || '',
        statuAdi: item.statuAdi || '',
        logoByteArray: item.logoByteArray || ''
      }))

      console.log(`[DETSİS Sub-units] Successfully retrieved ${list.length} units (total: ${totalCount})`)

      return {
        success: true,
        totalCount: totalCount || list.length,
        data: list
      }
    } catch (err: any) {
      console.error('[DETSİS Sub-units] Error:', err)
      return { success: false, error: err?.message || 'Alt birimler alınamadı', data: [] }
    }
  })

  // DETSİS Categories Tree Handler
  ipcMain.handle('network:get-detsis-categories', async () => {
    try {
      const url =
        'https://yetkiliapi.detsis.gov.tr/api/backoffice/unauthorizedaccessdata/kategorileregoredevletteskilati'
      const response = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'application/json, text/plain, */*'
        },
        signal: AbortSignal.timeout(10000)
      })

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}`, data: [] }
      }

      const json = await response.json()
      return { success: true, data: json?.data || [] }
    } catch (err: any) {
      console.error('[DETSİS Categories] Error:', err)
      return { success: false, error: err?.message || 'Kategoriler alınamadı', data: [] }
    }
  })

  // DETSİS Special Types Tree Handler
  ipcMain.handle('network:get-detsis-special-types', async () => {
    try {
      const url =
        'https://yetkiliapi.detsis.gov.tr/api/backoffice/unauthorizedaccessdata/ozellikliturleregoredevletteskilati'
      const response = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'application/json, text/plain, */*'
        },
        signal: AbortSignal.timeout(10000)
      })

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}`, data: [] }
      }

      const json = await response.json()
      return { success: true, data: json?.data || [] }
    } catch (err: any) {
      console.error('[DETSİS Special Types] Error:', err)
      return { success: false, error: err?.message || 'Özellikli türler alınamadı', data: [] }
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

async function scrapeDetsisWithHeadlessBrowser(cleanNo: string): Promise<{
  verified: boolean
  birimAdi?: string
  kurumAdi?: string
  url?: string
}> {
  return new Promise((resolve) => {
    let win: BrowserWindow | null = null
    let resolved = false

    const cleanup = () => {
      if (win && !win.isDestroyed()) {
        try {
          win.destroy()
        } catch {}
      }
      win = null
    }

    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true
        cleanup()
        resolve({ verified: false })
      }
    }, 7000)

    try {
      win = new BrowserWindow({
        show: false,
        width: 1024,
        height: 768,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          sandbox: true,
          images: false
        }
      })

      const targetUrl = `https://detsis.gov.tr/ara/${cleanNo}`

      win.webContents.on('did-finish-load', async () => {
        if (resolved || !win || win.isDestroyed()) return
        try {
          const result = await win.webContents.executeJavaScript(`
            (() => {
              const bodyText = document.body ? document.body.innerText : '';
              const title = document.title || '';
              const isNotFound = bodyText.includes('bulunamadı') || bodyText.includes('Hata') || title.includes('Hata');
              const h1 = document.querySelector('h1, h2, .unit-name, .birim-adi, .page-title');
              const heading = h1 ? h1.innerText.trim() : '';
              return {
                title,
                heading,
                bodyTextLength: bodyText.length,
                isNotFound
              };
            })()
          `).catch(() => null)

          if (result && !result.isNotFound && result.bodyTextLength > 50) {
            resolved = true
            clearTimeout(timeout)
            cleanup()
            resolve({
              verified: true,
              birimAdi: result.heading || result.title.replace(/- DETSİS|- KAYSİS|KAYSİS/gi, '').trim(),
              url: targetUrl
            })
            return
          }
        } catch {}

        resolved = true
        clearTimeout(timeout)
        cleanup()
        resolve({ verified: false, url: targetUrl })
      })

      win.webContents.on('did-fail-load', () => {
        if (!resolved) {
          resolved = true
          clearTimeout(timeout)
          cleanup()
          resolve({ verified: false })
        }
      })

      win.loadURL(targetUrl).catch(() => {
        if (!resolved) {
          resolved = true
          clearTimeout(timeout)
          cleanup()
          resolve({ verified: false })
        }
      })
    } catch {
      if (!resolved) {
        resolved = true
        clearTimeout(timeout)
        cleanup()
        resolve({ verified: false })
      }
    }
  })
}



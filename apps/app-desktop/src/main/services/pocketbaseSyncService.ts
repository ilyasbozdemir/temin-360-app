import fs from 'fs'
import path from 'path'

export interface PocketBaseConfig {
  url: string
  email?: string
  password?: string
  token?: string
}

export interface PocketBaseWorkspaceRecord {
  id: string
  title: string
  file_name: string
  total_amount?: number
  version?: string
  updated?: string
  created?: string
  data_json?: any
}

export class PocketBaseSyncService {
  private cleanUrl(url: string): string {
    let clean = url.trim()
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = 'http://' + clean
    }
    return clean.replace(/\/+$/, '')
  }

  /**
   * PocketBase Sunucusuna Bağlantı Testi ve (Opsiyonel) Auth Token Alma
   */
  async testConnection(config: PocketBaseConfig): Promise<{ success: boolean; token?: string; message: string }> {
    try {
      const baseUrl = this.cleanUrl(config.url)
      
      // 1. Health check
      const healthRes = await fetch(`${baseUrl}/api/health`)
      if (!healthRes.ok) {
        return { success: false, message: `PocketBase sunucusuna ulaşılamadı (${healthRes.status})` }
      }

      // 2. Eğer Email ve Parola girildiyse Admin/User login dene
      if (config.email && config.password) {
        // Öncelik: Superuser / Admin Auth (PocketBase v0.23+)
        let authRes = await fetch(`${baseUrl}/api/collections/_superusers/auth-with-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identity: config.email, password: config.password })
        })

        // Superusers yoksa normal users koleksiyonunu dene
        if (!authRes.ok) {
          authRes = await fetch(`${baseUrl}/api/collections/users/auth-with-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identity: config.email, password: config.password })
          })
        }

        if (authRes.ok) {
          const data = await authRes.json() as { token?: string }
          return {
            success: true,
            token: data.token,
            message: 'PocketBase sunucusuna başarıyla doğrulandı ✓'
          }
        } else {
          return {
            success: false,
            message: 'PocketBase sunucusuna ulaşıldı ancak kullanıcı bilgileri geçersiz!'
          }
        }
      }

      return {
        success: true,
        message: 'PocketBase sunucu bağlantısı aktif ✓ (Anonim / Genel Mod)'
      }
    } catch (err: any) {
      return {
        success: false,
        message: `PocketBase bağlantı hatası: ${err?.message || String(err)}`
      }
    }
  }

  /**
   * Çalışma dosyasını PocketBase 'workspaces' koleksiyonuna gönderir (Push)
   */
  async pushWorkspace(
    config: PocketBaseConfig,
    filePath: string,
    workspaceData?: any
  ): Promise<{ success: boolean; recordId?: string; message: string }> {
    try {
      const baseUrl = this.cleanUrl(config.url)
      const fileName = path.basename(filePath)

      if (!fs.existsSync(filePath)) {
        return { success: false, message: 'Çalışma dosyası bulunamadı!' }
      }

      const fileBuffer = fs.readFileSync(filePath)
      const blob = new Blob([fileBuffer], { type: 'application/octet-stream' })

      const formData = new FormData()
      formData.append('title', fileName.replace(/\.[^/.]+$/, ''))
      formData.append('file_name', fileName)
      formData.append('file', blob, fileName)
      if (workspaceData) {
        formData.append('data_json', JSON.stringify(workspaceData))
      }

      const headers: Record<string, string> = {}
      if (config.token) {
        headers['Authorization'] = config.token.startsWith('Bearer ') ? config.token : `Bearer ${config.token}`
      }

      // PocketBase 'workspaces' koleksiyonuna kaydet
      let response = await fetch(`${baseUrl}/api/collections/workspaces/records`, {
        method: 'POST',
        headers,
        body: formData
      })

      // Koleksiyon henüz yoksa fallback 'dosyalar' koleksiyonunu dene
      if (!response.ok && response.status === 404) {
        response = await fetch(`${baseUrl}/api/collections/dosyalar/records`, {
          method: 'POST',
          headers,
          body: formData
        })
      }

      if (response.ok) {
        const record = await response.json() as PocketBaseWorkspaceRecord
        return {
          success: true,
          recordId: record.id,
          message: `Dosya PocketBase'e başarıyla yüklendi (${record.id})`
        }
      } else {
        const errText = await response.text()
        return {
          success: false,
          message: `PocketBase yükleme hatası (${response.status}): ${errText}`
        }
      }
    } catch (err: any) {
      return {
        success: false,
        message: `PocketBase aktarım hatası: ${err?.message || String(err)}`
      }
    }
  }

  /**
   * PocketBase üzerindeki çalışma dosyalarını listeler
   */
  async listWorkspaces(config: PocketBaseConfig): Promise<{ success: boolean; items?: PocketBaseWorkspaceRecord[]; message?: string }> {
    try {
      const baseUrl = this.cleanUrl(config.url)
      const headers: Record<string, string> = {}
      if (config.token) {
        headers['Authorization'] = config.token.startsWith('Bearer ') ? config.token : `Bearer ${config.token}`
      }

      let res = await fetch(`${baseUrl}/api/collections/workspaces/records?sort=-updated`, { headers })
      if (!res.ok && res.status === 404) {
        res = await fetch(`${baseUrl}/api/collections/dosyalar/records?sort=-updated`, { headers })
      }

      if (res.ok) {
        const data = await res.json() as { items?: PocketBaseWorkspaceRecord[] }
        return { success: true, items: data.items || [] }
      } else {
        return { success: false, message: `PocketBase listeleme hatası: ${res.statusText}` }
      }
    } catch (err: any) {
      return { success: false, message: err?.message || String(err) }
    }
  }
}

export const pocketBaseSyncService = new PocketBaseSyncService()

import fs from 'fs'
import path from 'path'

export interface MinIOConfig {
  endpoint: string
  accessKey?: string
  secretKey?: string
  bucket?: string
  region?: string
  useSSL?: boolean
}

export interface MinIOWorkspaceItem {
  key: string
  fileName: string
  size?: number
  lastModified?: string
}

export class MinIOSyncService {
  private formatEndpoint(url: string, useSSL = false): string {
    let clean = url.trim()
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = (useSSL ? 'https://' : 'http://') + clean
    }
    return clean.replace(/\/+$/, '')
  }

  /**
   * MinIO / S3 Nesne Depolama Bağlantı Testi
   */
  async testConnection(
    config: MinIOConfig
  ): Promise<{ success: boolean; message: string; bucketExists?: boolean }> {
    try {
      if (!config.endpoint) {
        return { success: false, message: 'Lütfen MinIO / S3 Endpoint adresini girin.' }
      }

      const baseUrl = this.formatEndpoint(config.endpoint, config.useSSL)
      const bucket = config.bucket?.trim() || 'temin-360-yedekler'

      // 1. MinIO Canlılık (Health Live) endpoint denemesi
      let healthRes = await fetch(`${baseUrl}/minio/health/live`).catch(() => null)

      // Fallback: S3 Servis Kökü veya Bucket sorgusu
      if (!healthRes || !healthRes.ok) {
        healthRes = await fetch(`${baseUrl}/${bucket}`, { method: 'HEAD' }).catch(() => null)
      }

      if (healthRes && (healthRes.ok || healthRes.status === 403 || healthRes.status === 401)) {
        return {
          success: true,
          message: `MinIO / S3 sunucusu aktif ve erişilebilir (${healthRes.status === 200 ? 'Bucket Hazır' : 'Bağlantı Kuruldu'}) ✓`,
          bucketExists: healthRes.status === 200
        }
      }

      // 2. Genel HTTP GET denemesi
      const rootRes = await fetch(baseUrl).catch(() => null)
      if (
        rootRes &&
        (rootRes.ok || rootRes.status === 403 || rootRes.status === 400 || rootRes.status === 401)
      ) {
        return {
          success: true,
          message: `MinIO / S3 sunucusuna başarıyla ulaşıldı (${baseUrl}) ✓`
        }
      }

      return {
        success: false,
        message: `MinIO sunucusuna ulaşılamadı (${config.endpoint}). Lütfen adresi ve portu kontrol edin.`
      }
    } catch (err: any) {
      return {
        success: false,
        message: `MinIO bağlantı hatası: ${err?.message || String(err)}`
      }
    }
  }

  /**
   * Çalışma dosyasını MinIO / S3 Bucket deposuna yükler (Push)
   */
  async pushWorkspace(
    config: MinIOConfig,
    filePath: string
  ): Promise<{ success: boolean; objectKey?: string; message: string }> {
    try {
      if (!config.endpoint) {
        return { success: false, message: 'MinIO Endpoint adresi eksik!' }
      }

      if (!fs.existsSync(filePath)) {
        return { success: false, message: 'Yüklenecek çalışma dosyası bulunamadı!' }
      }

      const baseUrl = this.formatEndpoint(config.endpoint, config.useSSL)
      const bucket = config.bucket?.trim() || 'temin-360-yedekler'
      const fileName = path.basename(filePath)
      const fileBuffer = fs.readFileSync(filePath)

      const targetUrl = `${baseUrl}/${bucket}/${encodeURIComponent(fileName)}`

      const headers: Record<string, string> = {
        'Content-Type': 'application/octet-stream'
      }

      if (config.accessKey && config.secretKey) {
        const authString = Buffer.from(`${config.accessKey}:${config.secretKey}`).toString('base64')
        headers['Authorization'] = `Basic ${authString}`
      }

      const res = await fetch(targetUrl, {
        method: 'PUT',
        headers,
        body: fileBuffer
      })

      if (res.ok || res.status === 201 || res.status === 200) {
        return {
          success: true,
          objectKey: fileName,
          message: `${fileName} dosyası MinIO / S3 '${bucket}' kovasına başarıyla yüklendi ✓`
        }
      }

      const errText = await res.text().catch(() => '')
      return {
        success: false,
        message: `MinIO yükleme hatası (${res.status}): ${errText || 'Erişim reddedildi'}`
      }
    } catch (err: any) {
      return {
        success: false,
        message: `MinIO Aktarım hatası: ${err?.message || String(err)}`
      }
    }
  }

  /**
   * MinIO / S3 Bucket içindeki yedekleri listeler
   */
  async listWorkspaces(
    config: MinIOConfig
  ): Promise<{ success: boolean; files?: MinIOWorkspaceItem[]; message?: string }> {
    try {
      if (!config.endpoint) {
        return { success: false, message: 'MinIO Endpoint adresi girilmedi.' }
      }

      const baseUrl = this.formatEndpoint(config.endpoint, config.useSSL)
      const bucket = config.bucket?.trim() || 'temin-360-yedekler'

      const headers: Record<string, string> = {}
      if (config.accessKey && config.secretKey) {
        const authString = Buffer.from(`${config.accessKey}:${config.secretKey}`).toString('base64')
        headers['Authorization'] = `Basic ${authString}`
      }

      const res = await fetch(`${baseUrl}/${bucket}?list-type=2`, { headers })

      if (res.ok) {
        const xmlText = await res.text()
        const keyMatches = Array.from(xmlText.matchAll(/<Key>(.*?)<\/Key>/g)).map((m) => m[1])
        const validFiles: MinIOWorkspaceItem[] = keyMatches
          .filter((k) => k.endsWith('.temin') || k.endsWith('.dtal') || k.endsWith('.hkmp'))
          .map((k) => ({
            key: k,
            fileName: k
          }))

        return {
          success: true,
          files: validFiles
        }
      }

      return {
        success: false,
        message: `Bucket listelenemedi (${res.status})`
      }
    } catch (err: any) {
      return {
        success: false,
        message: `MinIO listeleme hatası: ${err?.message || String(err)}`
      }
    }
  }
}

export const minioSyncService = new MinIOSyncService()

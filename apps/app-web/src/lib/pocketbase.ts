export interface PocketBaseRecord {
  id: string
  title: string
  file_name: string
  file?: string
  total_amount?: number
  data_json?: any
  created?: string
  updated?: string
}

export class PocketBaseWebClient {
  private baseUrl: string

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://localhost:8090') {
    this.baseUrl = baseUrl.replace(/\/+$/, '')
  }

  /**
   * Health Check
   */
  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/api/health`)
      return res.ok
    } catch {
      return false
    }
  }

  /**
   * Workspaces koleksiyonundaki tüm dosyaları getirir
   */
  async getWorkspaces(token?: string): Promise<PocketBaseRecord[]> {
    try {
      const headers: Record<string, string> = {}
      if (token) {
        headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`
      }
      let res = await fetch(`${this.baseUrl}/api/collections/workspaces/records?sort=-updated`, { headers })
      if (!res.ok && res.status === 404) {
        res = await fetch(`${this.baseUrl}/api/collections/dosyalar/records?sort=-updated`, { headers })
      }
      if (res.ok) {
        const data = await res.json()
        return data.items || []
      }
      return []
    } catch (err) {
      console.error('PocketBase fetch error:', err)
      return []
    }
  }

  /**
   * PocketBase üzerindeki belirli bir dosyanın indirme URL'sini döndürür
   */
  getFileUrl(collectionIdOrName: string, recordId: string, fileName: string): string {
    return `${this.baseUrl}/api/files/${collectionIdOrName}/${recordId}/${fileName}`
  }
}

export const pocketbaseWeb = new PocketBaseWebClient()

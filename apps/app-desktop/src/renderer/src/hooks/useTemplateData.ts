import { useState, useEffect, useRef } from 'react'
import { resolveTemplateData, ProcessMapping } from '@temin360/document-templates'

/**
 * useTemplateData Hook
 *
 * Verilen ProcessMapping konfigürasyonunu ve dosya ID'sini kullanarak
 * SQLite veritabanından dinamik olarak şablon verisini çözer (resolve eder).
 *
 * @param dosyaId Aktif Temin Dosyası ID'si (number | null | undefined)
 * @param mapping İlgili şablonun ProcessMapping kuralları
 * @param dependencies Yeniden yükleme tetikleyici ek bağımlılıklar
 */
export function useTemplateData<T = Record<string, any>>(
  dosyaId: number | null | undefined,
  mapping: ProcessMapping,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T>({} as T)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const lastFetchRef = useRef<string>('')

  const fetchTemplateData = async (force: boolean = false) => {
    if (!dosyaId || !window.electron?.ipcRenderer) {
      setData({} as T)
      setLoading(false)
      return
    }

    const mappingHash = `${dosyaId}_${JSON.stringify(mapping)}`
    if (!force && lastFetchRef.current === mappingHash) {
      return
    }
    lastFetchRef.current = mappingHash

    setLoading(true)
    setError(null)

    try {
      // IPC DB query executor köprüsü
      const queryExecutor = async (sql: string, params: any[] = []): Promise<any[]> => {
        const res = await window.electron.ipcRenderer.invoke('db:query', sql, params)
        if (res && res.success && Array.isArray(res.data)) {
          return res.data
        }
        if (Array.isArray(res)) {
          return res
        }
        return []
      }

      const resolved = await resolveTemplateData(mapping, dosyaId, queryExecutor)
      setData(resolved as T)
    } catch (err: any) {
      console.error('[useTemplateData] Error resolving template data:', err)
      setError(err?.message || 'Şablon verisi çözümlenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTemplateData()
  }, [dosyaId, mapping, ...dependencies])

  return {
    data,
    loading,
    error,
    refetch: () => fetchTemplateData(true)
  }
}

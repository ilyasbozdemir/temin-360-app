import { useState, useEffect } from 'react'
import { RaporFilters } from './raporlar.hooks'

export interface RaporDokumanItem {
  id: number
  temin_dosya_id: number
  ihale_no: string
  ihale_adi: string
  dosya_adi: string
  dosya_yolu?: string
  imzali_dosya_yolu?: string
  is_signed?: number
  eklenme_tarihi: string
  butce_yili?: string
  birim?: string
  dosya_formati: string
}

export function useDokumanlarRaporu(filters: RaporFilters, searchTerm: string = '') {
  const [data, setData] = useState<RaporDokumanItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async (): Promise<void> => {
    if (typeof window === 'undefined' || !window.electron?.ipcRenderer) return
    setLoading(true)
    setError(null)

    try {
      const res = await window.electron.ipcRenderer.invoke(
        'db:query',
        `SELECT 
          b.id,
          b.temin_dosya_id,
          COALESCE(d.dosya_no, d.temin_no, '#' || d.id) as ihale_no,
          COALESCE(d.is_adi, d.dosya_adi, d.konu, 'İsimsiz İhale / Temin') as ihale_adi,
          b.belge_adi as dosya_adi,
          b.dosya_yolu,
          b.imzali_dosya_yolu,
          b.is_signed,
          COALESCE(b.belge_tarihi, b.created_at, d.temin_tarihi, d.created_at) as eklenme_tarihi,
          d.butce_yili,
          d.birim
        FROM DATA_TeminBelge b
        LEFT JOIN DATA_TeminDosyasi d ON (d.id = b.temin_dosya_id OR d.id = b.dosya_id)
        WHERE (d.is_deleted = 0 OR d.is_deleted IS NULL)
        ORDER BY b.id DESC`
      )

      if (res.success && Array.isArray(res.data)) {
        const mapped: RaporDokumanItem[] = res.data.map((r: any) => {
          const fileName = r.dosya_adi || 'Belge'
          let format = 'PDF'
          if (fileName.toLowerCase().endsWith('.zip') || r.dosya_yolu?.toLowerCase().endsWith('.zip')) {
            format = 'ZIP'
          } else if (fileName.toLowerCase().endsWith('.docx') || fileName.toLowerCase().endsWith('.doc')) {
            format = 'DOCX'
          } else if (fileName.toLowerCase().endsWith('.udf')) {
            format = 'UDF'
          } else if (fileName.toLowerCase().endsWith('.xlsx') || fileName.toLowerCase().endsWith('.xls')) {
            format = 'XLSX'
          }

          return {
            id: r.id,
            temin_dosya_id: r.temin_dosya_id,
            ihale_no: r.ihale_no || `#${r.temin_dosya_id}`,
            ihale_adi: r.ihale_adi,
            dosya_adi: fileName,
            dosya_yolu: r.dosya_yolu || '',
            imzali_dosya_yolu: r.imzali_dosya_yolu || '',
            is_signed: r.is_signed || 0,
            eklenme_tarihi: r.eklenme_tarihi ? String(r.eklenme_tarihi).split('T')[0] : '',
            butce_yili: r.butce_yili || '',
            birim: r.birim || '',
            dosya_formati: format
          }
        })

        let filtered = mapped

        if (filters.seciliYil) {
          filtered = filtered.filter((item) => {
            const itemYear = item.butce_yili || item.eklenme_tarihi?.slice(0, 4)
            return itemYear === filters.seciliYil
          })
        }

        if (filters.tarihBaslangic) {
          filtered = filtered.filter((item) => !item.eklenme_tarihi || item.eklenme_tarihi >= filters.tarihBaslangic!)
        }
        if (filters.tarihBitis) {
          filtered = filtered.filter((item) => !item.eklenme_tarihi || item.eklenme_tarihi <= filters.tarihBitis!)
        }
        if (filters.seciliBirim && filters.seciliBirim !== 'tumu') {
          filtered = filtered.filter((item) => item.birim === filters.seciliBirim)
        }

        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase().trim()
          filtered = filtered.filter(
            (item) =>
              item.ihale_no.toLowerCase().includes(q) ||
              item.ihale_adi.toLowerCase().includes(q) ||
              item.dosya_adi.toLowerCase().includes(q) ||
              item.dosya_formati.toLowerCase().includes(q)
          )
        }

        setData(filtered)
      } else {
        setData([])
      }
    } catch (err: any) {
      setError(err.message)
      setData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [
    filters.seciliYil,
    filters.tarihBaslangic,
    filters.tarihBitis,
    filters.seciliBirim,
    searchTerm
  ])

  return { data, loading, error, refetch: fetchData }
}

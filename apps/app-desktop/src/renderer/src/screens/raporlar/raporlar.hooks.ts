import { useState, useEffect } from 'react'

export interface RaporDosyaItem {
  id: number
  dosya_no: string
  temin_no?: string
  is_adi: string
  konu?: string
  tur: string
  alim_turu: string
  madde: string
  tarih?: string
  temin_tarihi?: string
  dosya_acilis_tarihi?: string
  butce_yili?: string
  odenek_tertibi?: string
  kullanilabilir_odenek?: string
  birim?: string
  durum?: string
  created_at?: string
  toplam_tutar: number
  kdv_dahil_tutar: number
  kazanan_firma?: string
  kazanan_vkn?: string
}

export interface RaporFilters {
  seciliYil: string
  seciliAy?: string
  tarihEsasi?: 'temin' | 'acilis'
  tarihBaslangic?: string
  tarihBitis?: string
  seciliBirim?: string
  alimTuru?: string
}

export function useRaporlarData(filtersOrYear: string | RaporFilters, ay?: string) {
  const filters: RaporFilters =
    typeof filtersOrYear === 'string'
      ? { seciliYil: filtersOrYear, seciliAy: ay }
      : filtersOrYear

  const [data, setData] = useState<RaporDosyaItem[]>([])
  const [birimlerList, setBirimlerList] = useState<string[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async (): Promise<void> => {
    if (typeof window === 'undefined' || !window.electron?.ipcRenderer) return
    setLoading(true)
    setError(null)

    try {
      const dateCol =
        filters.tarihEsasi === 'acilis'
          ? 'COALESCE(d.dosya_acilis_tarihi, d.tarih)'
          : 'COALESCE(d.temin_tarihi, d.tarih)'

      const res = await window.electron.ipcRenderer.invoke(
        'db:query',
        `SELECT 
          d.id,
          COALESCE(d.dosya_no, d.temin_no, '#' || d.id) as dosya_no,
          d.temin_no,
          COALESCE(d.is_adi, d.dosya_adi, d.konu, 'İsimsiz Alım') as is_adi,
          d.konu,
          d.tur,
          COALESCE(d.alim_turu, d.tur, 'mal') as alim_turu,
          d.tarih,
          d.temin_tarihi,
          d.dosya_acilis_tarihi,
          ${dateCol} as aktif_tarih,
          d.butce_yili,
          d.odenek_tertibi,
          d.kullanilabilir_odenek,
          COALESCE(d.birim, d.harcama_birimi, '') as birim,
          COALESCE(d.durum, 'Tamamlandı') as durum,
          COALESCE(d.madde, '4734 Sayılı Kanun Md. 22/d') as madde,
          d.created_at,
          COALESCE((SELECT SUM(miktar * birim_fiyat) FROM DATA_TeminKalem WHERE (temin_dosya_id = d.id OR dosya_id = d.id)), 0) as toplam_tutar,
          (
            SELECT COALESCE(tf.unvan, f.unvan)
            FROM DATA_TeminFirma f
            LEFT JOIN TANIM_Firma tf ON tf.id = f.firma_id
            WHERE (f.temin_dosya_id = d.id OR f.dosya_id = d.id) AND (f.secildi = 1 OR f.kazanan = 1)
            LIMIT 1
          ) as kazanan_firma,
          (
            SELECT COALESCE(tf.vergi_no, f.vergi_no)
            FROM DATA_TeminFirma f
            LEFT JOIN TANIM_Firma tf ON tf.id = f.firma_id
            WHERE (f.temin_dosya_id = d.id OR f.dosya_id = d.id) AND (f.secildi = 1 OR f.kazanan = 1)
            LIMIT 1
          ) as kazanan_vkn
        FROM DATA_TeminDosyasi d
        WHERE (d.is_deleted = 0 OR d.is_deleted IS NULL)
        ORDER BY d.id DESC`
      )

      if (res.success && Array.isArray(res.data)) {
        const units = new Set<string>()
        const mapped: RaporDosyaItem[] = res.data.map((r: any) => {
          if (r.birim) units.add(r.birim)
          const rawTur = (r.alim_turu || r.tur || 'mal').toLowerCase()
          let normalizedTur = 'Mal Alımı'
          if (rawTur.includes('hizmet')) normalizedTur = 'Hizmet Alımı'
          else if (rawTur.includes('yapım') || rawTur.includes('yapim')) normalizedTur = 'Yapım İşi'
          else if (rawTur.includes('danışman') || rawTur.includes('danisman')) normalizedTur = 'Danışmanlık'

          const tutar = Number(r.toplam_tutar) || 0
          const kdvDahil = tutar * 1.2

          return {
            id: r.id,
            dosya_no: r.dosya_no || `#${r.id}`,
            temin_no: r.temin_no || '',
            is_adi: r.is_adi,
            konu: r.konu || '',
            tur: rawTur,
            alim_turu: normalizedTur,
            madde: '4734 Sayılı Kanun Md. 22/d',
            tarih: r.aktif_tarih || r.temin_tarihi || r.tarih || r.created_at?.split('T')[0] || '',
            temin_tarihi: r.temin_tarihi || r.tarih || '',
            dosya_acilis_tarihi: r.dosya_acilis_tarihi || r.created_at?.split('T')[0] || '',
            butce_yili: r.butce_yili || (r.tarih ? r.tarih.slice(0, 4) : ''),
            odenek_tertibi: r.odenek_tertibi || '',
            kullanilabilir_odenek: r.kullanilabilir_odenek || '',
            birim: r.birim || '',
            durum: r.durum || 'Tamamlandı',
            created_at: r.created_at || '',
            toplam_tutar: tutar,
            kdv_dahil_tutar: kdvDahil,
            kazanan_firma: r.kazanan_firma || 'Belirlenmedi / Teklif Aşamasında',
            kazanan_vkn: r.kazanan_vkn || ''
          }
        })

        setBirimlerList(Array.from(units))

        let filtered = mapped

        if (filters.seciliYil) {
          filtered = filtered.filter((item) => {
            const itemYear = item.butce_yili || item.tarih?.slice(0, 4) || item.created_at?.slice(0, 4)
            return itemYear === filters.seciliYil
          })
        }

        if (filters.tarihBaslangic) {
          filtered = filtered.filter((item) => !item.tarih || item.tarih >= filters.tarihBaslangic!)
        }
        if (filters.tarihBitis) {
          filtered = filtered.filter((item) => !item.tarih || item.tarih <= filters.tarihBitis!)
        }
        if (filters.seciliBirim && filters.seciliBirim !== 'tumu') {
          filtered = filtered.filter((item) => item.birim === filters.seciliBirim)
        }
        if (filters.alimTuru && filters.alimTuru !== 'tumu') {
          filtered = filtered.filter((item) => item.alim_turu.toLowerCase().includes(filters.alimTuru!.toLowerCase()))
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
    filters.seciliAy,
    filters.tarihEsasi,
    filters.tarihBaslangic,
    filters.tarihBitis,
    filters.seciliBirim,
    filters.alimTuru
  ])

  return { data, birimlerList, loading, error, refetch: fetchData }
}

import { useEffect, useState } from 'react'
import { useWorkspaceStore } from '@renderer/store/workspaceStore'
import { documentPreloadService } from '@renderer/services/documentPreloadService'
import { FirmaStats, IslemlerData } from './types'

interface SiparisDataCacheEntry {
  kazananFirmaId: number | null
  kazananFirmaUnvan: string
  firmaStats: FirmaStats
  islemlerData: IslemlerData
  sonucOnayEkler: string[]
}
const siparisDataCache = new Map<number, SiparisDataCacheEntry>()

export function useSiparisVeSozlesmeData() {
  const { activeDosyaId } = useWorkspaceStore()
  const cached = activeDosyaId ? siparisDataCache.get(activeDosyaId) : undefined

  const [kazananFirmaId, setKazananFirmaId] = useState<number | null | undefined>(
    cached?.kazananFirmaId ?? undefined
  )
  const [kazananFirmaUnvan, setKazananFirmaUnvan] = useState<string>(
    cached?.kazananFirmaUnvan || ''
  )

  const [firmaStats, setFirmaStats] = useState<FirmaStats>(
    cached?.firmaStats || {
      teklifToplami: null,
      yaklasikMaliyet: null,
      teslimTarihi: null,
      yasaklilikDurumu: null,
      vergiNo: null,
      teklifSozlesmeTuru: null,
      sozlesmeYapilacakMi: 0,
      istekliFirmaSayisi: 0
    }
  )

  const [islemlerData, setIslemlerData] = useState<IslemlerData>(
    cached?.islemlerData || {
      sozlesmeYapilacakMi: false,
      siparisFormuGerekli: true,
      teslimGunu: 10,
      teslimTarihi: '',
      teklifSozlesmeTuru: 'Mal Alımı'
    }
  )

  const [sonucOnayEkler, setSonucOnayEkler] = useState<string[]>(
    cached?.sonucOnayEkler || [
      'Piyasa Fiyat Araştırması Tutanağı',
      'Teklif Mektupları',
      'İhtiyaç Raporu',
      'Harcama Talimatı',
      'Yaklaşık Maliyet Hesap Cetveli'
    ]
  )

  const [savedFeedback, setSavedFeedback] = useState(false)

  useEffect(() => {
    if (!activeDosyaId) return

    const checkKazananFirma = async (): Promise<void> => {
      try {
        const res = await window.electron.ipcRenderer.invoke(
          'db:query',
          `SELECT d.firma_id, f.unvan, f.vergi_no,
                  d.yaklasik_maliyet, d.teslim_tarihi, d.teslim_gun,
                  d.teklif_sozlesme_turu, d.sozlesme_yapilacak_mi, d.sablon_tercihleri
           FROM DATA_TeminDosyasi d
           LEFT JOIN TANIM_Firma f ON d.firma_id = f.id
           WHERE d.id = ?`,
          [activeDosyaId]
        )

        if (res.success && res.data && res.data.length > 0) {
          const row = res.data[0]
          let effectiveFirmaId = row.firma_id || null
          let effectiveUnvan = row.unvan || ''
          let effectiveVergiNo = row.vergi_no || null

          if (row.sablon_tercihleri) {
            try {
              const parsed = JSON.parse(row.sablon_tercihleri)
              if (Array.isArray(parsed.sonucOnayEkler) && parsed.sonucOnayEkler.length > 0) {
                setSonucOnayEkler(parsed.sonucOnayEkler)
              }
            } catch (e) {
              console.warn('Failed to parse sablon_tercihleri:', e)
            }
          }

          // Also check DATA_TeminFirma if row.firma_id is set but unvan was not found via TANIM_Firma
          if (effectiveFirmaId && !effectiveUnvan) {
            try {
              const tfCheck = await window.electron.ipcRenderer.invoke(
                'db:query',
                `SELECT COALESCE(NULLIF(tf.unvan, ''), NULLIF(f.unvan, ''), 'İstekli Firma') as unvan,
                        COALESCE(NULLIF(tf.vergi_no, ''), NULLIF(f.vergi_no, '')) as vergi_no
                 FROM DATA_TeminFirma tf
                 LEFT JOIN TANIM_Firma f ON tf.firma_id = f.id
                 WHERE tf.temin_dosya_id = ? AND (tf.firma_id = ? OR tf.id = ?)
                 LIMIT 1`,
                [activeDosyaId, effectiveFirmaId, effectiveFirmaId]
              )
              if (tfCheck.success && tfCheck.data?.length > 0) {
                effectiveUnvan = tfCheck.data[0].unvan || ''
                effectiveVergiNo = tfCheck.data[0].vergi_no || effectiveVergiNo
              }
            } catch (err) {
              console.warn('Failed to check DATA_TeminFirma fallback unvan:', err)
            }
          }

          if (!effectiveFirmaId || !effectiveUnvan) {
            const autoLowestRes = await window.electron.ipcRenderer.invoke(
              'db:query',
              `SELECT tf.firma_id, tf.id as temin_firma_id,
                      COALESCE(NULLIF(tf.unvan, ''), NULLIF(f.unvan, ''), 'İstekli Firma') as unvan,
                      COALESCE(NULLIF(tf.vergi_no, ''), NULLIF(f.vergi_no, '')) as vergi_no,
                      COALESCE(
                        NULLIF(tf.teklif_toplami, 0),
                        (SELECT SUM(kt.birim_fiyat * k.miktar)
                         FROM DATA_TeminKalemTeklif kt
                         JOIN DATA_TeminKalem k ON kt.temin_kalem_id = k.id
                         WHERE kt.temin_firma_id = tf.id AND kt.temin_dosya_id = ?)
                      ) as effective_teklif,
                      tf.yasaklilik_durumu
               FROM DATA_TeminFirma tf
               LEFT JOIN TANIM_Firma f ON tf.firma_id = f.id
               WHERE tf.temin_dosya_id = ? AND (COALESCE(tf.aktif_mi, 1) = 1 OR tf.aktif_mi = '1' OR tf.aktif_mi = 'true')
               ORDER BY (CASE WHEN tf.kazanan_mi = 1 THEN 0 ELSE 1 END),
                        CASE WHEN effective_teklif > 0 THEN effective_teklif ELSE 999999999 END ASC
               LIMIT 1`,
              [activeDosyaId, activeDosyaId]
            )
            if (autoLowestRes.success && autoLowestRes.data && autoLowestRes.data.length > 0) {
              const lowest = autoLowestRes.data[0]
              effectiveFirmaId = lowest.firma_id || lowest.temin_firma_id
              effectiveUnvan = lowest.unvan || 'İstekli Firma'
              effectiveVergiNo = lowest.vergi_no || null

              await window.electron.ipcRenderer.invoke(
                'db:run',
                'UPDATE DATA_TeminDosyasi SET firma_id = ? WHERE id = ?',
                [effectiveFirmaId, activeDosyaId]
              )
              await window.electron.ipcRenderer.invoke(
                'db:run',
                'UPDATE DATA_TeminFirma SET kazanan_mi = (CASE WHEN firma_id = ? OR id = ? THEN 1 ELSE 0 END) WHERE temin_dosya_id = ?',
                [effectiveFirmaId, effectiveFirmaId, activeDosyaId]
              )
            }
          }

          setKazananFirmaId(effectiveFirmaId)
          setKazananFirmaUnvan(effectiveUnvan)

          let teklifToplami = null
          let yasaklilikDurumu = null
          if (effectiveFirmaId) {
            const tfRes = await window.electron.ipcRenderer.invoke(
              'db:query',
              `SELECT tf.teklif_toplami, tf.yasaklilik_durumu,
                      (SELECT SUM(kt.birim_fiyat * k.miktar)
                       FROM DATA_TeminKalemTeklif kt
                       JOIN DATA_TeminKalem k ON kt.temin_kalem_id = k.id
                       WHERE kt.temin_firma_id = tf.id AND kt.temin_dosya_id = ?) as calculated_teklif
               FROM DATA_TeminFirma tf
               WHERE tf.temin_dosya_id = ? AND (tf.firma_id = ? OR tf.id = ?)`,
              [activeDosyaId, activeDosyaId, effectiveFirmaId, effectiveFirmaId]
            )
            if (tfRes.success && tfRes.data && tfRes.data.length > 0) {
              teklifToplami =
                tfRes.data[0].teklif_toplami || tfRes.data[0].calculated_teklif || null
              yasaklilikDurumu = tfRes.data[0].yasaklilik_durumu
            }
          }

          const firmCountRes = await window.electron.ipcRenderer.invoke(
            'db:query',
            `SELECT COUNT(*) as cnt FROM DATA_TeminFirma WHERE temin_dosya_id = ? AND (COALESCE(aktif_mi, 1) = 1 OR aktif_mi = '1' OR aktif_mi = 'true')`,
            [activeDosyaId]
          )
          const istekliFirmaSayisi =
            firmCountRes.success && firmCountRes.data && firmCountRes.data.length > 0
              ? firmCountRes.data[0].cnt
              : 0

          let formattedDate = ''
          let teslimGunu =
            row.teslim_gun !== undefined && row.teslim_gun !== null ? row.teslim_gun : 10

          if ((row.teslim_gun === undefined || row.teslim_gun === null) && row.teslim_tarihi) {
            const tDate = new Date(row.teslim_tarihi)
            const today = new Date()
            const diffTime = tDate.getTime() - today.getTime()
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            if (diffDays > 0) teslimGunu = diffDays
          }

          if (row.teslim_tarihi) {
            const d = new Date(row.teslim_tarihi)
            if (!isNaN(d.getTime())) {
              formattedDate = d.toISOString().split('T')[0]
            }
          }

          const nextStats: FirmaStats = {
            teklifToplami,
            yaklasikMaliyet: row.yaklasik_maliyet || null,
            teslimTarihi: formattedDate || null,
            yasaklilikDurumu,
            vergiNo: effectiveVergiNo,
            teklifSozlesmeTuru: row.teklif_sozlesme_turu || 'Mal Alımı',
            sozlesmeYapilacakMi: row.sozlesme_yapilacak_mi ? 1 : 0,
            istekliFirmaSayisi
          }

          const nextIslemler: IslemlerData = {
            sozlesmeYapilacakMi: Boolean(row.sozlesme_yapilacak_mi),
            siparisFormuGerekli: true,
            teslimGunu: teslimGunu,
            teslimTarihi: formattedDate || '',
            teklifSozlesmeTuru: row.teklif_sozlesme_turu || 'Mal Alımı'
          }

          setFirmaStats(nextStats)
          setIslemlerData(nextIslemler)

          if (activeDosyaId) {
            siparisDataCache.set(activeDosyaId, {
              kazananFirmaId: effectiveFirmaId,
              kazananFirmaUnvan: effectiveUnvan,
              firmaStats: nextStats,
              islemlerData: nextIslemler,
              sonucOnayEkler
            })
          }
        } else {
          setKazananFirmaId(null)
        }
      } catch (err) {
        console.error('Kazanan firma kontrol edilirken hata:', err)
        setKazananFirmaId(null)
      }
    }

    checkKazananFirma()
  }, [activeDosyaId])

  const formatCurrency = (val: number | null): string => {
    if (val === null || val === undefined) return '—'
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 2
    }).format(val)
  }

  const handleUpdateTeslimGunu = async (gun: number): Promise<void> => {
    if (!activeDosyaId) return
    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() + gun)
    const dateStr = targetDate.toISOString().split('T')[0]

    setIslemlerData((prev) => ({
      ...prev,
      teslimGunu: gun,
      teslimTarihi: dateStr
    }))
    setFirmaStats((prev) => ({ ...prev, teslimTarihi: dateStr }))

    try {
      await window.electron.ipcRenderer.invoke(
        'db:run',
        `UPDATE DATA_TeminDosyasi SET teslim_gun = ?, teslim_tarihi = ? WHERE id = ?`,
        [gun, dateStr, activeDosyaId]
      )
      documentPreloadService.invalidateCache(activeDosyaId)
      window.dispatchEvent(
        new CustomEvent('dossier:updated', {
          detail: { dosyaId: activeDosyaId }
        })
      )
      setSavedFeedback(true)
      setTimeout(() => setSavedFeedback(false), 2000)
    } catch (err) {
      console.error('Teslim süresi güncellenirken hata:', err)
    }
  }

  const handleUpdateTeslimTarihi = async (dateStr: string): Promise<void> => {
    if (!activeDosyaId) return
    let gun = islemlerData.teslimGunu
    if (dateStr) {
      const tDate = new Date(dateStr)
      const today = new Date()
      const diffTime = tDate.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      if (diffDays > 0) gun = diffDays
    }

    setIslemlerData((prev) => ({
      ...prev,
      teslimGunu: gun,
      teslimTarihi: dateStr
    }))
    setFirmaStats((prev) => ({ ...prev, teslimTarihi: dateStr }))

    try {
      await window.electron.ipcRenderer.invoke(
        'db:run',
        `UPDATE DATA_TeminDosyasi SET teslim_tarihi = ?, teslim_gun = ? WHERE id = ?`,
        [dateStr, gun, activeDosyaId]
      )
      documentPreloadService.invalidateCache(activeDosyaId)
      window.dispatchEvent(
        new CustomEvent('dossier:updated', {
          detail: { dosyaId: activeDosyaId }
        })
      )
      setSavedFeedback(true)
      setTimeout(() => setSavedFeedback(false), 2000)
    } catch (err) {
      console.error('Teslim tarihi kaydedilirken hata:', err)
    }
  }

  const handleToggleSozlesme = async (): Promise<void> => {
    if (!activeDosyaId) return
    const newStatus = firmaStats.sozlesmeYapilacakMi ? 0 : 1
    setFirmaStats((prev) => ({ ...prev, sozlesmeYapilacakMi: newStatus }))
    setIslemlerData((prev) => ({
      ...prev,
      sozlesmeYapilacakMi: newStatus === 1
    }))

    try {
      await window.electron.ipcRenderer.invoke(
        'db:run',
        `UPDATE DATA_TeminDosyasi SET sozlesme_yapilacak_mi = ? WHERE id = ?`,
        [newStatus, activeDosyaId]
      )
      documentPreloadService.invalidateCache(activeDosyaId)
      window.dispatchEvent(
        new CustomEvent('dossier:updated', {
          detail: { dosyaId: activeDosyaId }
        })
      )
      setSavedFeedback(true)
      setTimeout(() => setSavedFeedback(false), 2000)
    } catch (err) {
      console.error('Sözleşme durumu güncellenirken hata:', err)
    }
  }

  const handleUpdateEkler = async (newEkler: string[]): Promise<void> => {
    setSonucOnayEkler(newEkler)
    if (!activeDosyaId) return
    try {
      const fetchRes = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT sablon_tercihleri FROM DATA_TeminDosyasi WHERE id = ?',
        [activeDosyaId]
      )
      let curr = {}
      if (fetchRes.success && fetchRes.data?.[0]?.sablon_tercihleri) {
        try {
          curr = JSON.parse(fetchRes.data[0].sablon_tercihleri)
        } catch (e) {
          console.warn('Failed to parse existing sablon_tercihleri:', e)
        }
      }
      const updated = { ...curr, sonucOnayEkler: newEkler }
      await window.electron.ipcRenderer.invoke(
        'db:run',
        'UPDATE DATA_TeminDosyasi SET sablon_tercihleri = ? WHERE id = ?',
        [JSON.stringify(updated), activeDosyaId]
      )
    } catch (err) {
      console.error('Ekler kaydedilirken hata:', err)
    }
  }

  return {
    activeDosyaId,
    kazananFirmaId,
    kazananFirmaUnvan,
    firmaStats,
    islemlerData,
    sonucOnayEkler,
    savedFeedback,
    formatCurrency,
    handleUpdateTeslimGunu,
    handleUpdateTeslimTarihi,
    handleToggleSozlesme,
    handleUpdateEkler
  }
}

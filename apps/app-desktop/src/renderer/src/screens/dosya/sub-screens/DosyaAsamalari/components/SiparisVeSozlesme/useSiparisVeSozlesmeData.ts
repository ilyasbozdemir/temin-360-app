import { useEffect, useState } from 'react'
import { useWorkspaceStore } from '@renderer/store/workspaceStore'
import { documentPreloadService } from '@renderer/services/documentPreloadService'
import { FirmaStats, IslemlerData } from './types'
import { fetchSiparisVeSozlesmeData, ResolvedSiparisData } from './siparisDataFetcher'

const siparisDataCache = new Map<number, ResolvedSiparisData>()

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

    const loadData = async (): Promise<void> => {
      try {
        const resolved = await fetchSiparisVeSozlesmeData(activeDosyaId)
        if (resolved) {
          setKazananFirmaId(resolved.kazananFirmaId)
          setKazananFirmaUnvan(resolved.kazananFirmaUnvan)
          setFirmaStats(resolved.firmaStats)
          setIslemlerData(resolved.islemlerData)
          setSonucOnayEkler(resolved.sonucOnayEkler)
          siparisDataCache.set(activeDosyaId, resolved)
        } else {
          setKazananFirmaId(null)
          setKazananFirmaUnvan('')
          siparisDataCache.delete(activeDosyaId)
        }
      } catch (err) {
        console.error('Error loading siparis ve sozlesme data:', err)
        setKazananFirmaId(null)
        setKazananFirmaUnvan('')
      }
    }

    loadData()

    const handleDossierUpdated = () => {
      siparisDataCache.delete(activeDosyaId)
      loadData()
    }

    window.addEventListener('dossier:updated', handleDossierUpdated)
    window.addEventListener('bids:changed', handleDossierUpdated)

    return () => {
      window.removeEventListener('dossier:updated', handleDossierUpdated)
      window.removeEventListener('bids:changed', handleDossierUpdated)
    }
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

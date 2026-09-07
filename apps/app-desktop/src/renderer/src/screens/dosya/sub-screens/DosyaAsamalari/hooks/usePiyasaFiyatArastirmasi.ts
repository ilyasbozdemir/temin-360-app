import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { useDosyaAsamasiSablons, normalizeForMatch } from '../useDosyaAsamasiSablons'

export interface BiddingFirm {
  id: number
  temin_dosya_id: number
  firma_id: number
  unvan: string
  vergi_no?: string
  ilgili_kisi?: string
  telefon?: string
  email?: string
  teklif_toplami?: number
  para_birimi?: string
  temin_firma_id?: number
}

export interface PoolFirm {
  id: number
  unvan: string
  firma_kodu?: string
  istigal_konusu?: string
  il?: string
  vergi_no?: string
  telefon?: string
  email?: string
}

export interface BiddingKalem {
  id: number
  kalem_adi: string
  miktar: number
  birim: string
  tasinir_kodu?: string
  okas_kodu?: string
  aciklama?: string
  kdv_orani?: number
}

import { useTabStore } from '../../../../../store/tabStore'
import { formatDateString } from '../../../CiktiMerkezi.contextBuilder'
import { paraYaziyaCevir } from '../../../../../constants/sayiEslesmeleri'
import { emitAppEvent, useAppEventListener } from '../../../../../utils/appEvents'
import { documentPreloadService } from '../../../../../services/documentPreloadService'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function usePiyasaFiyatArastirmasiLogic() {
  const sablonsContext = useDosyaAsamasiSablons()
  const {
    activeDosyaId,
    sablons,
    activeStarredDocs,
    contextsByPath,
    dosyaContext,
    handleOpenPreviewForSablon,
    quickOpenExternal,
    quickPrint
  } = sablonsContext
  const activeTabPath = useTabStore((s) => s.activeTabPath)

  const [invitedFirms, setInvitedFirms] = useState<BiddingFirm[]>([])
  const [allPoolFirms, setAllPoolFirms] = useState<PoolFirm[]>([])
  const [items, setItems] = useState<BiddingKalem[]>([])
  const [bids, setBids] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  const [savedDocuments, setSavedDocuments] = useState<any[]>([])
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false)
  const [formMode, setFormMode] = useState<'maliyet' | 'tutanak'>('maliyet')

  const [hesaplamaEsasi, setHesaplamaEsasi] = useState<string>('Ortalama fiyat esasına göre')
  const [komisyonTakdiri, setKomisyonTakdiri] = useState<string>(
    'Sadece araştırma fiyatları dikkate alınacak'
  )
  const [isEditingFirms, setIsEditingFirms] = useState<boolean>(false)
  const [maliyetCetveliTarihi, setMaliyetCetveliTarihi] = useState<string>('')
  const [tutanakTarihi, setTutanakTarihi] = useState<string>('')
  const [syncTutanak, setSyncTutanak] = useState<boolean>(true)
  const [setLowestFirmAsWinner, setSetLowestFirmAsWinner] = useState<boolean>(true)
  const [manualWinnerFirmaId, setManualWinnerFirmaId] = useState<number | null>(null)
  const [belgeleriKaydet, setBelgeleriKaydet] = useState<boolean>(true)

  const [isFirmModalOpen, setIsFirmModalOpen] = useState(false)
  const [selectedFirmIds, setSelectedFirmIds] = useState<number[]>([])
  const [modalSearchQuery, setModalSearchQuery] = useState('')

  const [belgeMenuOpen, setBelgeMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const [selectedPresetId, setSelectedPresetId] = useState<string>(() => {
    try {
      return localStorage.getItem('dta_selected_preset_id') || ''
    } catch {
      return ''
    }
  })
  const [isChangingPreset, setIsChangingPreset] = useState(false)
  const [presets, setPresets] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('dta_document_presets')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    const handlePresetsChange = () => {
      try {
        const saved = localStorage.getItem('dta_document_presets')
        setPresets(saved ? JSON.parse(saved) : [])
      } catch (e) {
        console.error(e)
      }
    }
    window.addEventListener('dta_presets_changed', handlePresetsChange)
    return () => window.removeEventListener('dta_presets_changed', handlePresetsChange)
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setBelgeMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const stageSablons = useMemo(() => {
    return sablons.filter(
      (s) =>
        s.kategori === '2-piyasa-fiyat-arastirmasi' || s.kategori === '2. Piyasa Fiyat Araştırması'
    )
  }, [sablons])

  function getCleanName(ad: string): string {
    let clean = ad
    const matchStatus = clean.match(/^\[(.*?)\]\s*(.*)$/)
    if (matchStatus) clean = matchStatus[2].trim()
    return clean
  }

  const starredDocsForFilter = useMemo(() => {
    const activePresetId = selectedPresetId || (presets.length > 0 ? presets[0].id : '')
    if (activePresetId) {
      const preset = presets.find((p) => p.id === activePresetId)
      return preset ? preset.docs : []
    }
    return activeStarredDocs || []
  }, [selectedPresetId, presets, activeStarredDocs])

  const hasStarred = useMemo(() => {
    return stageSablons.some((sablon) => {
      const cleanName = getCleanName(sablon.ad)
      return starredDocsForFilter.some((d) => normalizeForMatch(d) === normalizeForMatch(cleanName))
    })
  }, [stageSablons, starredDocsForFilter])

  const [manualFilter, setManualFilter] = useState<'all' | 'starred' | null>(null)

  const filter = manualFilter !== null ? manualFilter : hasStarred ? 'starred' : 'all'

  const displaySablons = useMemo(() => {
    if (filter === 'starred') {
      return stageSablons.filter((sablon) => {
        const cleanName = getCleanName(sablon.ad)
        return starredDocsForFilter.some(
          (d) => normalizeForMatch(d) === normalizeForMatch(cleanName)
        )
      })
    }
    return stageSablons
  }, [filter, starredDocsForFilter, stageSablons])

  const loadData = useCallback(async (): Promise<void> => {
    if (!activeDosyaId) return
    setLoading(true)
    try {
      const resInvited = await window.electron.ipcRenderer.invoke(
        'db:query',
        `SELECT
           df.*,
           COALESCE(
             NULLIF(df.unvan, ''),
             NULLIF(f.unvan, ''),
             'İstekli Firma'
           ) as unvan,
           COALESCE(
             NULLIF(df.ilgili_kisi, ''),
             NULLIF(f.ilgili_adi, '')
           ) as yetkili_ad_soyad,
           COALESCE(NULLIF(df.telefon, ''), NULLIF(f.telefon, '')) as telefon,
           COALESCE(NULLIF(df.email, ''), NULLIF(f.email, '')) as email,
           COALESCE(NULLIF(df.email, ''), NULLIF(f.email, '')) as eposta
         FROM DATA_TeminFirma df
         LEFT JOIN TANIM_Firma f ON df.firma_id = f.id
         WHERE df.temin_dosya_id = ? AND df.aktif_mi = 1
         ORDER BY df.id ASC`,
        [activeDosyaId]
      )

      const resPool = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT * FROM TANIM_Firma WHERE aktif_mi = 1 ORDER BY unvan ASC'
      )

      const resItems = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT id, kalem_adi, miktar, birim FROM DATA_TeminKalem WHERE temin_dosya_id = ? ORDER BY id ASC',
        [activeDosyaId]
      )

      const resBids = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT temin_kalem_id, temin_firma_id, birim_fiyat FROM DATA_TeminKalemTeklif WHERE temin_dosya_id = ?',
        [activeDosyaId]
      )

      const resDosya = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT hesaplama_esasi, komisyon_takdiri, temin_tarihi, firma_id FROM DATA_TeminDosyasi WHERE id = ?',
        [activeDosyaId]
      )

      if (resInvited.success) {
        // Olası duplicate ID'leri temizle (React key çakışmasını önle)
        const rawInvited: BiddingFirm[] = resInvited.data || []
        const seenInvited = new Set<number>()
        setInvitedFirms(
          rawInvited.filter((f) => {
            if (seenInvited.has(f.firma_id)) return false
            seenInvited.add(f.firma_id)
            return true
          })
        )
      }
      if (resPool.success) {
        const rawPool: PoolFirm[] = resPool.data || []
        const seenPool = new Set<number>()
        setAllPoolFirms(
          rawPool.filter((p) => {
            if (seenPool.has(p.id)) return false
            seenPool.add(p.id)
            return true
          })
        )
      }
      if (resItems.success) setItems(resItems.data || [])
      let defaultDate = ''
      if (resDosya.success && resDosya.data && resDosya.data.length > 0) {
        setHesaplamaEsasi(resDosya.data[0].hesaplama_esasi || 'Ortalama fiyat esasına göre')
        setKomisyonTakdiri(
          resDosya.data[0].komisyon_takdiri || 'Sadece araştırma fiyatları dikkate alınacak'
        )
        defaultDate = resDosya.data[0].temin_tarihi || ''
        // Mevcut kazanan firma varsa state'e yükle
        if (resDosya.data[0].firma_id) {
          setManualWinnerFirmaId(resDosya.data[0].firma_id)
        } else {
          setManualWinnerFirmaId(null)
        }
      }

      const resBelgeler = await window.electron.ipcRenderer.invoke(
        'db:query',
        "SELECT * FROM DATA_TeminBelge WHERE temin_dosya_id = ? AND belge_adi IN ('Yaklaşık Maliyet Cetveli', 'Piyasa Fiyat Araştırma Tutanağı')",
        [activeDosyaId]
      )

      let mDate = ''
      let tDate = ''
      if (resBelgeler.success && resBelgeler.data) {
        setSavedDocuments(resBelgeler.data)
        const maliyetDoc = resBelgeler.data.find(
          (b: any) => b.belge_adi === 'Yaklaşık Maliyet Cetveli'
        )
        const tutanakDoc = resBelgeler.data.find(
          (b: any) => b.belge_adi === 'Piyasa Fiyat Araştırma Tutanağı'
        )
        mDate = maliyetDoc?.belge_tarihi || ''
        tDate = tutanakDoc?.belge_tarihi || ''
      }
      setMaliyetCetveliTarihi(mDate || defaultDate || new Date().toISOString().split('T')[0])
      setTutanakTarihi(tDate || defaultDate || new Date().toISOString().split('T')[0])

      if (resBids.success && resBids.data) {
        const bidsMap: Record<string, number> = {}
        resBids.data.forEach((row: any) => {
          bidsMap[`${row.temin_kalem_id}_${row.temin_firma_id}`] = row.birim_fiyat || 0
        })
        setBids(bidsMap)
        setIsEditingFirms(resBids.data.length === 0)
      }
    } catch (err) {
      console.error('Error loading bidding data:', err)
    } finally {
      setLoading(false)
    }
  }, [activeDosyaId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData()
  }, [activeDosyaId, activeTabPath, loadData])

  useAppEventListener(
    ['items:changed', 'dossier:updated', 'workspace:refreshed'],
    () => {
      loadData()
    }
  )

  const handleBulkAddFirms = async (): Promise<void> => {
    const targetDosyaId = activeDosyaId || Number(sessionStorage.getItem('workspace_dosya_id') || 0)
    if (!targetDosyaId || selectedFirmIds.length === 0) {
      if (!targetDosyaId) alert('Aktif dosya kimliği (ID) bulunamadı.')
      return
    }
    try {
      for (const fId of selectedFirmIds) {
        const poolFirm = allPoolFirms.find((pf) => pf.id === fId)
        if (!poolFirm) continue

        // Check if already added
        const checkRes = await window.electron.ipcRenderer.invoke(
          'db:query',
          'SELECT id FROM DATA_TeminFirma WHERE temin_dosya_id = ? AND firma_id = ? AND aktif_mi = 1',
          [targetDosyaId, poolFirm.id]
        )
        if (checkRes.success && checkRes.data && checkRes.data.length > 0) {
          continue
        }

        const firmUnvan = poolFirm.unvan || (poolFirm as any).firma_adi || 'İstekli Firma'
        await window.electron.ipcRenderer.invoke(
          'db:run',
          `INSERT INTO DATA_TeminFirma (temin_dosya_id, firma_id, unvan, vergi_no, telefon, email, davet_edildi_mi, teklif_durumu, aktif_mi) VALUES (?, ?, ?, ?, ?, ?, 1, 'Davet Edildi', 1)`,
          [
            targetDosyaId,
            poolFirm.id,
            firmUnvan,
            poolFirm.vergi_no || '',
            poolFirm.telefon || '',
            poolFirm.email || (poolFirm as any).eposta || ''
          ]
        )
      }
      setSelectedFirmIds([])
      setIsFirmModalOpen(false)
      await loadData()
      emitAppEvent('bids:changed', { dosyaId: targetDosyaId })
      emitAppEvent('dossier:updated', { dosyaId: targetDosyaId })
    } catch (err: any) {
      alert('Hata: ' + err.message)
    }
  }

  const handleAddSingleFirm = async (poolFirm: PoolFirm): Promise<void> => {
    const targetDosyaId = activeDosyaId || Number(sessionStorage.getItem('workspace_dosya_id') || 0)
    if (!targetDosyaId) {
      alert('Aktif dosya kimliği (ID) bulunamadı.')
      return
    }
    try {
      // Check if already added
      const checkRes = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT id FROM DATA_TeminFirma WHERE temin_dosya_id = ? AND firma_id = ? AND aktif_mi = 1',
        [targetDosyaId, poolFirm.id]
      )
      if (checkRes.success && checkRes.data && checkRes.data.length > 0) {
        return
      }

      const firmUnvan = poolFirm.unvan || (poolFirm as any).firma_adi || 'İstekli Firma'
      await window.electron.ipcRenderer.invoke(
        'db:run',
        `INSERT INTO DATA_TeminFirma (temin_dosya_id, firma_id, unvan, vergi_no, telefon, email, davet_edildi_mi, teklif_durumu, aktif_mi) VALUES (?, ?, ?, ?, ?, ?, 1, 'Davet Edildi', 1)`,
        [
          targetDosyaId,
          poolFirm.id,
          firmUnvan,
          poolFirm.vergi_no || '',
          poolFirm.telefon || '',
          poolFirm.email || (poolFirm as any).eposta || ''
        ]
      )
      await loadData()
      emitAppEvent('bids:changed', { dosyaId: targetDosyaId })
      emitAppEvent('dossier:updated', { dosyaId: targetDosyaId })
    } catch (err: any) {
      alert('Hata: ' + err.message)
    }
  }

  const handleRemoveFirm = async (teminFirmaId: number): Promise<void> => {
    if (
      !window.confirm(
        'Bu firmayı dosyadan ve ilişkili tekliflerden kaldırmak istediğinize emin misiniz?'
      )
    ) {
      return
    }
    try {
      await window.electron.ipcRenderer.invoke(
        'db:run',
        'DELETE FROM DATA_TeminKalemTeklif WHERE temin_firma_id = ?',
        [teminFirmaId]
      )
      const res = await window.electron.ipcRenderer.invoke(
        'db:run',
        'DELETE FROM DATA_TeminFirma WHERE id = ?',
        [teminFirmaId]
      )
      if (res.success) {
        await loadData()
        emitAppEvent('bids:changed', { dosyaId: activeDosyaId })
        emitAppEvent('dossier:updated', { dosyaId: activeDosyaId })
      }
    } catch (err: any) {
      alert('Hata: ' + err.message)
    }
  }

  const handlePriceChange = async (
    kalemId: number,
    teminFirmaId: number,
    priceStr: string
  ): Promise<void> => {
    const price = parseFloat(priceStr) || 0
    const key = `${kalemId}_${teminFirmaId}`

    setBids((prev) => ({
      ...prev,
      [key]: price
    }))

    try {
      await window.electron.ipcRenderer.invoke(
        'db:run',
        `INSERT OR REPLACE INTO DATA_TeminKalemTeklif (temin_dosya_id, temin_kalem_id, temin_firma_id, birim_fiyat, kdv_tutari, teklif_verildi_mi) VALUES (?, ?, ?, ?, 0, 1)`,
        [activeDosyaId, kalemId, teminFirmaId, price]
      )

      let total = 0
      items.forEach((kalem) => {
        const kPrice = kalem.id === kalemId ? price : bids[`${kalem.id}_${teminFirmaId}`] || 0
        total += kPrice * (kalem.miktar || 0)
      })

      await window.electron.ipcRenderer.invoke(
        'db:run',
        `UPDATE DATA_TeminFirma SET teklif_toplami = ?, teklif_verdi_mi = 1, teklif_durumu = 'Teklif Verildi' WHERE id = ?`,
        [total, teminFirmaId]
      )

      emitAppEvent('bids:changed', { dosyaId: activeDosyaId })

      const resInvited = await window.electron.ipcRenderer.invoke(
        'db:query',
        `SELECT 
           df.*,
           COALESCE(
             NULLIF(df.unvan, ''),
             NULLIF(f.unvan, ''),
             'İstekli Firma'
           ) as unvan,
           COALESCE(
             NULLIF(df.ilgili_kisi, ''),
             NULLIF(f.ilgili_adi, '')
           ) as yetkili_ad_soyad,
           COALESCE(NULLIF(df.telefon, ''), NULLIF(f.telefon, '')) as telefon,
           COALESCE(NULLIF(df.email, ''), NULLIF(f.email, '')) as eposta,
           COALESCE(NULLIF(df.email, ''), NULLIF(f.email, '')) as email
         FROM DATA_TeminFirma df
         LEFT JOIN TANIM_Firma f ON df.firma_id = f.id
         WHERE df.temin_dosya_id = ? AND df.aktif_mi = 1
         ORDER BY df.id ASC`,
        [activeDosyaId]
      )
      if (resInvited.success) setInvitedFirms(resInvited.data || [])
    } catch (err) {
      console.error('Error saving bid:', err)
    }
  }

  const getLowestBidInfo = useCallback(
    (kalemId: number): { price: number; firmaId: number | null } => {
      let minPrice = Infinity
      let minFirmaId: number | null = null

      invitedFirms.forEach((firma) => {
        const price = bids[`${kalemId}_${firma.id}`]
        if (price > 0 && price < minPrice) {
          minPrice = price
          minFirmaId = firma.id
        }
      })

      return {
        price: minPrice === Infinity ? 0 : minPrice,
        firmaId: minFirmaId
      }
    },
    [invitedFirms, bids]
  )

  const getAverageBid = useCallback(
    (kalemId: number): number => {
      let sum = 0
      let count = 0
      invitedFirms.forEach((firma) => {
        const price = bids[`${kalemId}_${firma.id}`]
        if (price > 0) {
          sum += price
          count++
        }
      })
      return count > 0 ? sum / count : 0
    },
    [invitedFirms, bids]
  )

  const getEstimatedCostTotal = useCallback((): number => {
    const isLowestBasis =
      hesaplamaEsasi?.toLowerCase().includes('en düşük') ||
      hesaplamaEsasi?.toLowerCase().includes('en dusuk')

    return items.reduce((sum, item) => {
      const price = isLowestBasis ? getLowestBidInfo(item.id).price : getAverageBid(item.id)
      return sum + (item.miktar || 0) * price
    }, 0)
  }, [items, getAverageBid, getLowestBidInfo, hesaplamaEsasi])

  /**
   * "Yeni PFAT / Yaklaşık Maliyet Oluştur" butonuna tıklandığında çağrılır.
   */
  const handleNewDocument = (mode: 'maliyet' | 'tutanak'): void => {
    setFormMode(mode)
    const today = new Date().toISOString().split('T')[0]
    if (!maliyetCetveliTarihi) setMaliyetCetveliTarihi(today)
    if (!tutanakTarihi) setTutanakTarihi(today)
    setSyncTutanak(true)
    setBelgeleriKaydet(true)
    setIsFormOpen(true)
  }

  const handleSaveToDosya = async (
    docType?: 'maliyet' | 'tutanak' | 'save_only'
  ): Promise<void> => {
    const targetMode = docType || formMode
    const total = getEstimatedCostTotal()

    if (targetMode !== 'save_only' && total === 0) {
      alert('Yaklaşık maliyet ₺0.00 olamaz. Lütfen önce teklif fiyatları girin.')
      return
    }

    try {
      // 1. Her durumda Yaklaşık Maliyeti Veritabanında güncelle
      await window.electron.ipcRenderer.invoke(
        'db:run',
        'UPDATE DATA_TeminDosyasi SET yaklasik_maliyet = ? WHERE id = ?',
        [total, activeDosyaId]
      )

      const effectiveMode = targetMode === 'save_only' ? (formMode || 'tutanak') : targetMode

      if (effectiveMode === 'tutanak' || targetMode === 'tutanak') {
        // Tutanak tarihi güncelle
        await window.electron.ipcRenderer.invoke(
          'db:run',
          'UPDATE DATA_TeminDosyasi SET temin_tarihi = ? WHERE id = ?',
          [tutanakTarihi || null, activeDosyaId]
        )

        // Kazanan firmayı belirle ve kaydet
        if (setLowestFirmAsWinner) {
          // Otomatik: en düşük teklif sahibi kazanan
          let lowestBidFirmMasterId: number | null = null
          let minTotalBid = Infinity
          invitedFirms.forEach((f) => {
            if (f.teklif_toplami && f.teklif_toplami > 0 && f.teklif_toplami < minTotalBid) {
              minTotalBid = f.teklif_toplami
              lowestBidFirmMasterId = f.firma_id
            }
          })

          if (lowestBidFirmMasterId) {
            await window.electron.ipcRenderer.invoke(
              'db:run',
              'UPDATE DATA_TeminDosyasi SET firma_id = ? WHERE id = ?',
              [lowestBidFirmMasterId, activeDosyaId]
            )
            setManualWinnerFirmaId(lowestBidFirmMasterId)
          }
        } else if (manualWinnerFirmaId) {
          // Elle seçilen kazanan firma
          await window.electron.ipcRenderer.invoke(
            'db:run',
            'UPDATE DATA_TeminDosyasi SET firma_id = ? WHERE id = ?',
            [manualWinnerFirmaId, activeDosyaId]
          )
        }
      }

      // 2. Resmi Belgeyi Üret
      const docName =
        effectiveMode === 'maliyet' ? 'Yaklaşık Maliyet Cetveli' : 'Piyasa Fiyat Araştırma Tutanağı'
      const docDate = effectiveMode === 'maliyet' ? maliyetCetveliTarihi : tutanakTarihi

      const sablon = stageSablons.find((s) => {
        const lowerAd = s.ad.toLowerCase()
        const lowerDocName = docName.toLowerCase()
        return lowerAd.includes(lowerDocName) || lowerDocName.includes(lowerAd)
      })

      let mergedCtxStr: string | null = null
      if (sablon) {
        const processPath = sablon.route_path || sablon.dosya_adi || ''
        const baseCtx = contextsByPath[processPath] || dosyaContext || {}

        const formatTR = (val: number): string =>
          new Intl.NumberFormat('tr-TR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }).format(val)

        // Dinamik Teklifler & Firma Toplamları Hesabı
        const calculatedTeklifler = invitedFirms
          .map((f, index: number) => {
            let sum = 0
            items.forEach((k) => {
              const price =
                bids[`${k.id}_${f.id}`] ||
                bids[`${k.id}_${f.firma_id}`] ||
                (f.temin_firma_id ? bids[`${k.id}_${f.temin_firma_id}`] : 0) ||
                0
              sum += price * (k.miktar || 0)
            })
            return {
              siraNo: index + 1,
              istekliUnvani: f.unvan,
              teklifBedeli: formatTR(sum),
              teklifBedeliRaw: sum,
              yaziIle: paraYaziyaCevir(sum)
            }
          })
          .sort((a, b) => a.teklifBedeliRaw - b.teklifBedeliRaw)

        const firmaToplamlari = invitedFirms.map((f) => {
          let sum = 0
          items.forEach((k) => {
            const price =
              bids[`${k.id}_${f.id}`] ||
              bids[`${k.id}_${f.firma_id}`] ||
              (f.temin_firma_id ? bids[`${k.id}_${f.temin_firma_id}`] : 0) ||
              0
            sum += price * (k.miktar || 0)
          })
          return {
            toplam: formatTR(sum)
          }
        })

        let enAvantajliTeklifSahibi = calculatedTeklifler[0]?.istekliUnvani || ''
        let enAvantajliTeklifBedeli = calculatedTeklifler[0]?.teklifBedeli || ''

        if (!setLowestFirmAsWinner && manualWinnerFirmaId) {
          const manualWinner = invitedFirms.find(
            (f) => f.firma_id === manualWinnerFirmaId || f.id === manualWinnerFirmaId
          )
          if (manualWinner) {
            enAvantajliTeklifSahibi = manualWinner.unvan
            const manualTeklif = calculatedTeklifler.find(
              (t) => t.istekliUnvani === manualWinner.unvan
            )
            if (manualTeklif) enAvantajliTeklifBedeli = manualTeklif.teklifBedeli
          }
        }

        const isLowestBasis = !hesaplamaEsasi?.toLowerCase().includes('ortalama')

        const needItems = items.map((k, index: number) => {
          const itemPrices = invitedFirms.map((f) => ({
            unvan: f.unvan,
            price:
              bids[`${k.id}_${f.id}`] ||
              bids[`${k.id}_${f.firma_id}`] ||
              (f.temin_firma_id ? bids[`${k.id}_${f.temin_firma_id}`] : 0) ||
              0
          }))
          const validPrices = itemPrices.filter((p) => p.price > 0)
          const minPrice = validPrices.length > 0 ? Math.min(...validPrices.map((p) => p.price)) : 0
          const avgPrice =
            validPrices.length > 0
              ? validPrices.reduce((sum, p) => sum + p.price, 0) / validPrices.length
              : 0

          const chosenPrice = isLowestBasis ? minPrice : avgPrice
          const lineTotal = chosenPrice * (k.miktar || 0)

          const enUygunFirma =
            validPrices.length > 0
              ? validPrices.reduce((prev, curr) => (prev.price < curr.price ? prev : curr))
              : null

          const firmaTeklifleri = invitedFirms.map((f) => {
            const price =
              bids[`${k.id}_${f.id}`] ||
              bids[`${k.id}_${f.firma_id}`] ||
              (f.temin_firma_id ? bids[`${k.id}_${f.temin_firma_id}`] : 0) ||
              0
            return {
              fiyat: price > 0 ? formatTR(price) : '-'
            }
          })

          const firmaTeklifleriDetay = invitedFirms.map((f) => {
            const price =
              bids[`${k.id}_${f.id}`] ||
              bids[`${k.id}_${f.firma_id}`] ||
              (f.temin_firma_id ? bids[`${k.id}_${f.temin_firma_id}`] : 0) ||
              0
            const itemTotal = price * (k.miktar || 0)
            return {
              birimFiyat: price > 0 ? formatTR(price) : '-',
              tutar: itemTotal > 0 ? formatTR(itemTotal) : '-',
              hasPrice: price > 0
            }
          })

          return {
            siraNo: index + 1,
            kodu: k.tasinir_kodu || k.okas_kodu || '-',
            malzemeAdi: k.kalem_adi,
            ozelligi: k.aciklama || '',
            birimi: k.birim,
            kdvOrani: k.kdv_orani,
            miktar: formatTR(k.miktar || 0),
            firmaTeklifleri,
            firmaTeklifleriDetay,
            enUygunFirmaAdi: enUygunFirma ? enUygunFirma.unvan : 'Teklif Yok',
            enDusukFiyat: minPrice > 0 ? formatTR(minPrice) : '-',
            toplamBedel: lineTotal > 0 ? formatTR(lineTotal) : '-'
          }
        })

        const formattedDocDate = formatDateString(docDate) || baseCtx.tarih || baseCtx.dosyaTarihi
        let tutanakTarihi = baseCtx.tutanakTarihi || formattedDocDate
        if (targetMode === 'tutanak') {
          tutanakTarihi = formattedDocDate
        }

        let maliyetCetveliTarihi = baseCtx.maliyetCetveliTarihi || formattedDocDate
        if (targetMode === 'maliyet') {
          maliyetCetveliTarihi = formattedDocDate
        }

        // Komisyon üyelerini veritabanından çek (DATA_TeminKomisyon -> TANIM_KomisyonUye fallback)
        let komisyonListesi: any[] = []
        try {
          const komsRes = await window.electron.ipcRenderer.invoke(
            'db:query',
            `SELECT tk.*, 
                    COALESCE(NULLIF(tk.ad_soyad, ''), NULLIF(p.ad_soyad, ''), '') as adSoyad,
                    COALESCE(NULLIF(tk.unvan, ''), NULLIF(p.unvan, ''), '') as unvan,
                    COALESCE(NULLIF(tk.gorev, ''), NULLIF(k.ad, ''), 'Üye') as gorevi
             FROM DATA_TeminKomisyon tk 
             LEFT JOIN TANIM_Personel p ON tk.personel_id = p.id 
             LEFT JOIN TANIM_Komisyon k ON tk.komisyon_id = k.id
             WHERE tk.temin_dosya_id = ?`,
            [activeDosyaId]
          )
          if (komsRes.success && komsRes.data && komsRes.data.length > 0) {
            komisyonListesi = komsRes.data
          } else {
            // Fallback: TANIM_KomisyonUye
            const fallbackRes = await window.electron.ipcRenderer.invoke(
              'db:query',
              `SELECT u.*, 
                      p.ad_soyad as adSoyad, 
                      p.unvan as unvan, 
                      COALESCE(g.ad, 'Üye') as gorevi
               FROM TANIM_KomisyonUye u
               JOIN TANIM_Komisyon k ON u.komisyon_id = k.id
               LEFT JOIN TANIM_Personel p ON u.personel_id = p.id
               LEFT JOIN TANIM_KomisyonGorevi g ON u.gorev_id = g.id
               WHERE (k.aktif_mi = 1 OR k.aktif_mi IS NULL)`
            )
            if (fallbackRes.success && fallbackRes.data) {
              komisyonListesi = fallbackRes.data
            }
          }
        } catch (e) {
          console.error('Komisyon çekme hatası:', e)
        }

        const formattedKomisyon = komisyonListesi.map((c: any) => ({
          adSoyad: c.adSoyad || c.ad_soyad || '',
          unvan: c.unvan || '',
          gorevi: c.gorevi || 'Üye'
        }))

        const mergedCtx = {
          ...baseCtx,
          tarih: formattedDocDate,
          dosyaTarihi: formattedDocDate,
          tutanakTarihi,
          maliyetCetveliTarihi,
          yaklasikMaliyet: formatTR(total),
          genelToplam: formatTR(total),
          firmalar: invitedFirms.map((f) => ({ unvan: f.unvan })),
          firmalarColspan: invitedFirms.length + 2,
          firmaToplamlari,
          calculatedTeklifler,
          enAvantajliTeklifSahibi,
          enAvantajliTeklifBedeli,
          ikinciAvantajliTeklifSahibi: calculatedTeklifler[1]?.istekliUnvani || '',
          ikinciAvantajliTeklifBedeli: calculatedTeklifler[1]?.teklifBedeli || '',
          items: needItems,
          kalemler: needItems,
          komisyon: formattedKomisyon.length > 0 ? formattedKomisyon : (baseCtx.komisyon || []),
          fiyatKomisyonu: formattedKomisyon.length > 0 ? formattedKomisyon : (baseCtx.fiyatKomisyonu || []),
          gorevlendirilenler: formattedKomisyon.length > 0 ? formattedKomisyon : (baseCtx.gorevlendirilenler || []),
          yukleniciFirma:
            targetMode === 'tutanak'
              ? enAvantajliTeklifSahibi
              : baseCtx.yukleniciFirma || enAvantajliTeklifSahibi
        }
        mergedCtxStr = JSON.stringify(mergedCtx)

        // Aktif şablon verisini güncelle (en son durum)
        await window.electron.ipcRenderer.invoke(
          'db:run',
          'INSERT OR REPLACE INTO DATA_DosyaSablonVeri (temin_dosya_id, sablon_id, veri_json) VALUES (?, ?, ?)',
          [activeDosyaId, sablon.id, mergedCtxStr]
        )
      }

      // 3. Varolan belge var mı kontrol et, varsa UPDATE et, yoksa INSERT et
      const existingDocRes = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT id FROM DATA_TeminBelge WHERE temin_dosya_id = ? AND belge_adi = ? ORDER BY id DESC LIMIT 1',
        [activeDosyaId, docName]
      )

      if (existingDocRes.success && existingDocRes.data && existingDocRes.data.length > 0) {
        const existingId = existingDocRes.data[0].id
        await window.electron.ipcRenderer.invoke(
          'db:run',
          'UPDATE DATA_TeminBelge SET belge_tarihi = ?, veri_json = ? WHERE id = ?',
          [docDate || null, mergedCtxStr, existingId]
        )
      } else {
        await window.electron.ipcRenderer.invoke(
          'db:run',
          'INSERT INTO DATA_TeminBelge (temin_dosya_id, belge_adi, belge_tarihi, dosya_yolu, veri_json) VALUES (?, ?, ?, ?, ?)',
          [activeDosyaId, docName, docDate || null, '', mergedCtxStr]
        )
      }

      alert(
        `${docName} başarıyla üretildi ve güncellendi: ₺ ${total.toLocaleString('tr-TR', {
          minimumFractionDigits: 2
        })}`
      )

      // Belgeleri yeniden yükle
      const resBelgelerNew = await window.electron.ipcRenderer.invoke(
        'db:query',
        "SELECT * FROM DATA_TeminBelge WHERE temin_dosya_id = ? AND belge_adi IN ('Yaklaşık Maliyet Cetveli', 'Piyasa Fiyat Araştırma Tutanağı')",
        [activeDosyaId]
      )
      if (resBelgelerNew.success && resBelgelerNew.data) {
        setSavedDocuments(resBelgelerNew.data)
      }

      emitAppEvent('documents:changed', { dosyaId: activeDosyaId, payload: { docName } })
      emitAppEvent('dossier:updated', { dosyaId: activeDosyaId })
      emitAppEvent('bids:changed', { dosyaId: activeDosyaId })

      setIsFormOpen(false)

      // Otomatik önizlemeye aç!
      if (sablon) {
        setTimeout(() => {
          handleOpenPreviewForSablon(sablon, sablon.ad)
        }, 300)
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : String(err))
    }
  }

  const handleUpdateDocumentDate = async (
    docId: number,
    newDate: string,
    docName: string
  ): Promise<void> => {
    try {
      await window.electron.ipcRenderer.invoke(
        'db:run',
        'UPDATE DATA_TeminBelge SET belge_tarihi = ? WHERE id = ?',
        [newDate || null, docId]
      )

      if (docName === 'Yaklaşık Maliyet Cetveli') {
        setMaliyetCetveliTarihi(newDate)
      } else if (docName === 'Piyasa Fiyat Araştırma Tutanağı') {
        setTutanakTarihi(newDate)
      }

      const sablon = stageSablons.find((s: any) => {
        const lowerAd = s.ad.toLowerCase()
        const lowerDocName = docName.toLowerCase()
        return lowerAd.includes(lowerDocName) || lowerDocName.includes(lowerAd)
      })

      if (sablon) {
        const processPath = sablon.route_path || sablon.dosya_adi || ''
        const baseCtx = contextsByPath[processPath] || dosyaContext

        const snapshotRes = await window.electron.ipcRenderer.invoke(
          'db:query',
          'SELECT veri_json FROM DATA_DosyaSablonVeri WHERE temin_dosya_id = ? AND sablon_id = ?',
          [activeDosyaId, sablon.id]
        )

        let currentVeri: any = { ...baseCtx }
        if (snapshotRes.success && snapshotRes.data.length > 0) {
          try {
            currentVeri = { ...currentVeri, ...JSON.parse(snapshotRes.data[0].veri_json) }
          } catch (e) {
            console.error(e)
          }
        }

        const mergedCtx = {
          ...currentVeri,
          tarih: newDate ? formatDateString(newDate) : currentVeri.tarih,
          dosyaTarihi: newDate ? formatDateString(newDate) : currentVeri.dosyaTarihi
        }

        await window.electron.ipcRenderer.invoke(
          'db:run',
          'INSERT OR REPLACE INTO DATA_DosyaSablonVeri (temin_dosya_id, sablon_id, veri_json) VALUES (?, ?, ?)',
          [activeDosyaId, sablon.id, JSON.stringify(mergedCtx)]
        )
      }

      const resBelgelerNew = await window.electron.ipcRenderer.invoke(
        'db:query',
        "SELECT * FROM DATA_TeminBelge WHERE temin_dosya_id = ? AND belge_adi IN ('Yaklaşık Maliyet Cetveli', 'Piyasa Fiyat Araştırma Tutanağı')",
        [activeDosyaId]
      )
      if (resBelgelerNew.success && resBelgelerNew.data) {
        setSavedDocuments(resBelgelerNew.data)
      }
    } catch (err) {
      console.error('Error updating document date:', err)
    }
  }

  const handleDeleteDocument = async (docId: number): Promise<void> => {
    if (!window.confirm('Bu belgeyi silmek istediğinize emin misiniz?')) {
      return
    }
    try {
      const res = await window.electron.ipcRenderer.invoke(
        'db:run',
        'DELETE FROM DATA_TeminBelge WHERE id = ?',
        [docId]
      )
      if (res.success) {
        // Belgeleri yeniden yükle
        const resBelgelerNew = await window.electron.ipcRenderer.invoke(
          'db:query',
          "SELECT * FROM DATA_TeminBelge WHERE temin_dosya_id = ? AND belge_adi IN ('Yaklaşık Maliyet Cetveli', 'Piyasa Fiyat Araştırma Tutanağı')",
          [activeDosyaId]
        )
        if (resBelgelerNew.success && resBelgelerNew.data) {
          setSavedDocuments(resBelgelerNew.data)
        }
      } else {
        alert('Belge silinirken hata oluştu: ' + res.error)
      }
    } catch (err: any) {
      alert('Hata: ' + err.message)
    }
  }

  const lowestTotalFirmaId = useMemo(() => {
    let minTotal = Infinity
    let minId: number | null = null
    invitedFirms.forEach((firma) => {
      if (firma.teklif_toplami && firma.teklif_toplami > 0 && firma.teklif_toplami < minTotal) {
        minTotal = firma.teklif_toplami
        minId = firma.id
      }
    })
    return minId
  }, [invitedFirms])

  const handleSetWinnerFirma = useCallback(
    async (firmaMasterId: number | null): Promise<void> => {
      if (!activeDosyaId) return
      try {
        // 1. DATA_TeminDosyasi tablosunu güncelle
        await window.electron.ipcRenderer.invoke(
          'db:run',
          'UPDATE DATA_TeminDosyasi SET firma_id = ? WHERE id = ?',
          [firmaMasterId, activeDosyaId]
        )

        // 2. DATA_TeminFirma tablosundaki kazanan_mi durumunu senkronize et
        if (firmaMasterId) {
          await window.electron.ipcRenderer.invoke(
            'db:run',
            `UPDATE DATA_TeminFirma 
             SET kazanan_mi = CASE WHEN firma_id = ? OR id = ? THEN 1 ELSE 0 END 
             WHERE temin_dosya_id = ?`,
            [firmaMasterId, firmaMasterId, activeDosyaId]
          )
        } else {
          await window.electron.ipcRenderer.invoke(
            'db:run',
            `UPDATE DATA_TeminFirma SET kazanan_mi = 0 WHERE temin_dosya_id = ?`,
            [activeDosyaId]
          )
        }

        setManualWinnerFirmaId(firmaMasterId)
        if (firmaMasterId) {
          setSetLowestFirmAsWinner(false)
        }

        // 3. Cache'i temizle ve olayları fırlat
        documentPreloadService.invalidateCache(activeDosyaId)
        emitAppEvent('dossier:updated', { dosyaId: activeDosyaId })
        emitAppEvent('bids:changed', { dosyaId: activeDosyaId })
      } catch (err) {
        console.error('Error setting winner firma:', err)
      }
    },
    [activeDosyaId]
  )

  return {
    sablonsContext,
    invitedFirms,
    allPoolFirms,
    items,
    bids,
    loading,
    hesaplamaEsasi,
    komisyonTakdiri,
    isFirmModalOpen,
    setIsFirmModalOpen,
    selectedFirmIds,
    setSelectedFirmIds,
    modalSearchQuery,
    setModalSearchQuery,
    belgeMenuOpen,
    setBelgeMenuOpen,
    dropdownRef,
    selectedPresetId,
    setSelectedPresetId,
    isChangingPreset,
    setIsChangingPreset,
    presets,
    stageSablons,
    getCleanName,
    filter,
    setManualFilter,
    displaySablons,
    handleBulkAddFirms,
    handleAddSingleFirm,
    handleRemoveFirm,
    handlePriceChange,
    getLowestBidInfo,
    getAverageBid,
    getEstimatedCostTotal,
    handleNewDocument,
    handleSaveToDosya,
    lowestTotalFirmaId,
    handleSetWinnerFirma,
    isEditingFirms,
    setIsEditingFirms,
    maliyetCetveliTarihi,
    setMaliyetCetveliTarihi,
    tutanakTarihi,
    setTutanakTarihi,
    savedDocuments,
    setSavedDocuments,
    isFormOpen,
    setIsFormOpen,
    formMode,
    setFormMode,
    syncTutanak,
    setSyncTutanak,
    setLowestFirmAsWinner,
    setSetLowestFirmAsWinner,
    manualWinnerFirmaId,
    setManualWinnerFirmaId,
    belgeleriKaydet,
    setBelgeleriKaydet,
    handleUpdateDocumentDate,
    handleDeleteDocument
  }
}

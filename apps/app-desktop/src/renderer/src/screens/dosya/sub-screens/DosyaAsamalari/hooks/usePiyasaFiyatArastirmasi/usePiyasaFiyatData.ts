import { useState, useCallback, useEffect } from 'react'
import Decimal from 'decimal.js'
import { BiddingFirm, PoolFirm, BiddingKalem } from './types'
import { emitAppEvent, useAppEventListener } from '../../../../../../utils/appEvents'

export function usePiyasaFiyatData(activeDosyaId: number | null, activeTabPath: string) {
  const [invitedFirms, setInvitedFirms] = useState<BiddingFirm[]>([])
  const [allPoolFirms, setAllPoolFirms] = useState<PoolFirm[]>([])
  const [items, setItems] = useState<BiddingKalem[]>([])
  const [bids, setBids] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  const [savedDocuments, setSavedDocuments] = useState<any[]>([])
  const [hesaplamaEsasi, setHesaplamaEsasiState] = useState<string>('Ortalama fiyat esasına göre')
  const [komisyonTakdiri, setKomisyonTakdiri] = useState<string>(
    'Sadece araştırma fiyatları dikkate alınacak'
  )
  const [isEditingFirms, setIsEditingFirms] = useState<boolean>(false)
  const [maliyetCetveliTarihi, setMaliyetCetveliTarihi] = useState<string>('')
  const [tutanakTarihi, setTutanakTarihi] = useState<string>('')
  const [dosyaDefaultDate, setDosyaDefaultDate] = useState<string>('')
  const [manualWinnerFirmaId, setManualWinnerFirmaId] = useState<number | null>(null)
  const [setLowestFirmAsWinner, setSetLowestFirmAsWinner] = useState<boolean>(true)

  const [isFirmModalOpen, setIsFirmModalOpen] = useState(false)
  const [selectedFirmIds, setSelectedFirmIds] = useState<number[]>([])
  const [modalSearchQuery, setModalSearchQuery] = useState('')

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
        'SELECT dosya_acilis_tarihi, temin_no, evrak_sayisi, hesaplama_esasi, komisyon_takdiri, temin_tarihi, firma_id FROM DATA_TeminDosyasi WHERE id = ?',
        [activeDosyaId]
      )

      if (resInvited.success) {
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
        const rawDate =
          resDosya.data[0].dosya_acilis_tarihi ||
          resDosya.data[0].temin_tarihi ||
          resDosya.data[0].tarih ||
          ''
        if (rawDate) {
          const cleanStr = String(rawDate).trim()
          if (/^\d{4}-\d{2}-\d{2}/.test(cleanStr)) {
            defaultDate = cleanStr.split(' ')[0]
          } else if (/^\d{2}\.\d{2}\.\d{4}/.test(cleanStr)) {
            const [d, m, y] = cleanStr.split('.')
            defaultDate = `${y}-${m}-${d}`
          } else {
            defaultDate = cleanStr
          }
        }
        setDosyaDefaultDate(defaultDate)
        setHesaplamaEsasiState(resDosya.data[0].hesaplama_esasi || 'Ortalama fiyat esasına göre')
        setKomisyonTakdiri(
          resDosya.data[0].komisyon_takdiri || 'Sadece araştırma fiyatları dikkate alınacak'
        )
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
    loadData()
  }, [activeDosyaId, activeTabPath, loadData])

  useAppEventListener(['items:changed', 'dossier:updated', 'workspace:refreshed'], () => {
    loadData()
  })

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

  const handleCreateNewFirm = async (firmaData: {
    unvan: string
    vergi_no?: string
    telefon?: string
    email?: string
    sehir?: string
  }): Promise<void> => {
    const targetDosyaId = activeDosyaId || Number(sessionStorage.getItem('workspace_dosya_id') || 0)
    if (!firmaData.unvan?.trim()) {
      alert('Firma unvanı zorunludur.')
      return
    }
    try {
      let existingId: number | null = null
      if (firmaData.vergi_no?.trim()) {
        const checkRes = await window.electron.ipcRenderer.invoke(
          'db:query',
          'SELECT id FROM TANIM_Firma WHERE vergi_no = ? LIMIT 1',
          [firmaData.vergi_no.trim()]
        )
        if (checkRes.success && checkRes.data?.length > 0) {
          existingId = checkRes.data[0].id
        }
      }

      if (!existingId) {
        const countRes = await window.electron.ipcRenderer.invoke(
          'db:query',
          'SELECT COUNT(*) as cnt FROM TANIM_Firma'
        )
        const nextNum = (countRes.success && countRes.data?.[0]?.cnt ? countRes.data[0].cnt : 0) + 1
        const firmaKodu = nextNum.toString().padStart(4, '0')

        const insertRes = await window.electron.ipcRenderer.invoke(
          'db:run',
          `INSERT INTO TANIM_Firma (firma_kodu, unvan, vergi_no, telefon, email, il, aktif_mi)
           VALUES (?, ?, ?, ?, ?, ?, 1)`,
          [
            firmaKodu,
            firmaData.unvan.trim(),
            firmaData.vergi_no?.trim() || '',
            firmaData.telefon?.trim() || '',
            firmaData.email?.trim() || '',
            firmaData.sehir?.trim() || ''
          ]
        )
        if (insertRes.success) {
          existingId = insertRes.data?.lastInsertRowid || insertRes.lastInsertRowid
        }
      }

      if (targetDosyaId && existingId) {
        const checkLink = await window.electron.ipcRenderer.invoke(
          'db:query',
          'SELECT id FROM DATA_TeminFirma WHERE temin_dosya_id = ? AND (firma_id = ? OR unvan = ?) AND aktif_mi = 1',
          [targetDosyaId, existingId, firmaData.unvan.trim()]
        )
        if (!checkLink.success || !checkLink.data?.length) {
          await window.electron.ipcRenderer.invoke(
            'db:run',
            `INSERT INTO DATA_TeminFirma (temin_dosya_id, firma_id, unvan, vergi_no, telefon, email, davet_edildi_mi, teklif_durumu, aktif_mi)
             VALUES (?, ?, ?, ?, ?, ?, 1, 'Davet Edildi', 1)`,
            [
              targetDosyaId,
              existingId,
              firmaData.unvan.trim(),
              firmaData.vergi_no?.trim() || '',
              firmaData.telefon?.trim() || '',
              firmaData.email?.trim() || ''
            ]
          )
        }
      }

      await loadData()
      emitAppEvent('bids:changed', { dosyaId: targetDosyaId })
      emitAppEvent('dossier:updated', { dosyaId: targetDosyaId })
    } catch (err: any) {
      alert('Firma eklenirken hata oluştu: ' + (err.message || err))
    }
  }

  const handleAddSingleFirm = async (poolFirm: PoolFirm): Promise<void> => {
    const targetDosyaId = activeDosyaId || Number(sessionStorage.getItem('workspace_dosya_id') || 0)
    if (!targetDosyaId) {
      alert('Aktif dosya kimliği (ID) bulunamadı.')
      return
    }
    try {
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

    const nextBids = {
      ...bids,
      [key]: price
    }
    setBids(nextBids)

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
      const currentInvitedFirms: BiddingFirm[] = resInvited.success
        ? resInvited.data || []
        : invitedFirms
      if (resInvited.success) setInvitedFirms(currentInvitedFirms)

      const isLowestBasis =
        hesaplamaEsasi?.toLowerCase().includes('en düşük') ||
        hesaplamaEsasi?.toLowerCase().includes('en dusuk')

      let totalDecimal = new Decimal(0)
      items.forEach((item) => {
        let p = 0
        if (isLowestBasis) {
          let minPrice = Infinity
          currentInvitedFirms.forEach((firma) => {
            const val = nextBids[`${item.id}_${firma.id}`]
            if (val > 0 && val < minPrice) {
              minPrice = val
            }
          })
          p = minPrice === Infinity ? 0 : minPrice
        } else {
          let sumDecimal = new Decimal(0)
          let count = 0
          currentInvitedFirms.forEach((firma) => {
            const val = nextBids[`${item.id}_${firma.id}`]
            if (val > 0) {
              sumDecimal = sumDecimal.plus(val)
              count++
            }
          })
          p = count > 0 ? sumDecimal.div(count).toDecimalPlaces(2).toNumber() : 0
        }
        const miktar = new Decimal(item.miktar || 0)
        totalDecimal = totalDecimal.plus(miktar.times(p))
      })
      const newYaklasikMaliyet = totalDecimal.toDecimalPlaces(2).toNumber()

      if (newYaklasikMaliyet > 0) {
        await window.electron.ipcRenderer.invoke(
          'db:run',
          'UPDATE DATA_TeminDosyasi SET yaklasik_maliyet = ? WHERE id = ?',
          [newYaklasikMaliyet, activeDosyaId]
        )
      }

      emitAppEvent('dossier:updated', { dosyaId: activeDosyaId })
    } catch (err) {
      console.error('Error saving bid:', err)
    }
  }

  return {
    invitedFirms,
    setInvitedFirms,
    allPoolFirms,
    setAllPoolFirms,
    items,
    setItems,
    bids,
    setBids,
    loading,
    savedDocuments,
    setSavedDocuments,
    hesaplamaEsasi,
    setHesaplamaEsasiState,
    komisyonTakdiri,
    setKomisyonTakdiri,
    isEditingFirms,
    setIsEditingFirms,
    maliyetCetveliTarihi,
    setMaliyetCetveliTarihi,
    tutanakTarihi,
    setTutanakTarihi,
    dosyaDefaultDate,
    manualWinnerFirmaId,
    setManualWinnerFirmaId,
    setLowestFirmAsWinner,
    setSetLowestFirmAsWinner,
    isFirmModalOpen,
    setIsFirmModalOpen,
    selectedFirmIds,
    setSelectedFirmIds,
    modalSearchQuery,
    setModalSearchQuery,
    loadData,
    handleBulkAddFirms,
    handleCreateNewFirm,
    handleAddSingleFirm,
    handleRemoveFirm,
    handlePriceChange
  }
}

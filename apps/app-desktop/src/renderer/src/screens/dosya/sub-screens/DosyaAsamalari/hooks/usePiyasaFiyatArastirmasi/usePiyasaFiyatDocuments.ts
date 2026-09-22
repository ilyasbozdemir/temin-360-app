import { useState } from 'react'
import { BiddingFirm, BiddingKalem } from './types'
import { formatDateString } from '../../../../CiktiMerkezi.contextBuilder'
import { paraYaziyaCevir } from '../../../../../../constants/sayiEslesmeleri'
import { emitAppEvent } from '../../../../../../utils/appEvents'

export function usePiyasaFiyatDocuments(
  activeDosyaId: number | null,
  invitedFirms: BiddingFirm[],
  items: BiddingKalem[],
  bids: Record<string, number>,
  hesaplamaEsasi: string,
  dosyaDefaultDate: string,
  maliyetCetveliTarihi: string,
  setMaliyetCetveliTarihi: (val: string) => void,
  tutanakTarihi: string,
  setTutanakTarihi: (val: string) => void,
  manualWinnerFirmaId: number | null,
  setManualWinnerFirmaId: (val: number | null) => void,
  setSavedDocuments: (docs: any[]) => void,
  stageSablons: any[],
  contextsByPath: Record<string, any>,
  dosyaContext: any,
  setLowestFirmAsWinner: boolean,
  setSetLowestFirmAsWinner: (val: boolean) => void,
  handleOpenPreviewForSablon: (sablon: any, title: string) => void,
  getEstimatedCostTotal: () => number
) {
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false)
  const [formMode, setFormMode] = useState<'maliyet' | 'tutanak'>('maliyet')
  const [syncTutanak, setSyncTutanak] = useState<boolean>(true)
  const [belgeleriKaydet, setBelgeleriKaydet] = useState<boolean>(true)

  const handleNewDocument = (mode: 'maliyet' | 'tutanak'): void => {
    setFormMode(mode)
    const today = new Date().toISOString().split('T')[0]
    const defaultTarih = dosyaDefaultDate || today
    if (!maliyetCetveliTarihi) setMaliyetCetveliTarihi(defaultTarih)
    if (!tutanakTarihi) setTutanakTarihi(defaultTarih)
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
      await window.electron.ipcRenderer.invoke(
        'db:run',
        'UPDATE DATA_TeminDosyasi SET yaklasik_maliyet = ?, hesaplama_esasi = ? WHERE id = ?',
        [total, hesaplamaEsasi || 'Ortalama fiyat esasına göre', activeDosyaId]
      )

      const effectiveMode = targetMode === 'save_only' ? (formMode || 'tutanak') : targetMode

      if (effectiveMode === 'tutanak' || targetMode === 'tutanak') {
        await window.electron.ipcRenderer.invoke(
          'db:run',
          'UPDATE DATA_TeminDosyasi SET temin_tarihi = ? WHERE id = ?',
          [tutanakTarihi || null, activeDosyaId]
        )

        if (setLowestFirmAsWinner) {
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
          await window.electron.ipcRenderer.invoke(
            'db:run',
            'UPDATE DATA_TeminDosyasi SET firma_id = ? WHERE id = ?',
            [manualWinnerFirmaId, activeDosyaId]
          )
        }
      }

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
        let tutanakTarihiVal = baseCtx.tutanakTarihi || formattedDocDate
        if (targetMode === 'tutanak') {
          tutanakTarihiVal = formattedDocDate
        }

        let maliyetCetveliTarihiVal = baseCtx.maliyetCetveliTarihi || formattedDocDate
        if (targetMode === 'maliyet') {
          maliyetCetveliTarihiVal = formattedDocDate
        }

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
          gorevi: c.gorevi || 'Üye',
          gorev: c.gorevi || 'Üye'
        }))

        const filteredGorevliler = formattedKomisyon.filter((c: any) => {
          const combined = `${c.adSoyad} ${c.unvan} ${c.gorevi || ''}`.toLowerCase()
          return (
            !combined.includes('harcama yetkili') &&
            !combined.includes('gerçekleştirme') &&
            !combined.includes('gerceklestirme') &&
            !combined.includes('muhasebe') &&
            !combined.includes('satın alma harcama') &&
            !combined.includes('talep eden') &&
            !combined.includes('hazırlayan') &&
            c.adSoyad.trim() !== ''
          )
        })
        const gorevlendirilenListesi = filteredGorevliler.length > 0 ? filteredGorevliler : formattedKomisyon

        const mergedCtx = {
          ...baseCtx,
          tarih: formattedDocDate,
          dosyaTarihi: formattedDocDate,
          tutanakTarihi: tutanakTarihiVal,
          maliyetCetveliTarihi: maliyetCetveliTarihiVal,
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
          komisyon: formattedKomisyon.length > 0 ? formattedKomisyon : baseCtx.komisyon || [],
          komisyonUyeleri: formattedKomisyon.length > 0 ? formattedKomisyon : baseCtx.komisyonUyeleri || baseCtx.komisyon || [],
          fiyatKomisyonu: formattedKomisyon.length > 0 ? formattedKomisyon : baseCtx.fiyatKomisyonu || [],
          gorevlendirilenler: gorevlendirilenListesi.length > 0 ? gorevlendirilenListesi : baseCtx.gorevlendirilenler || [],
          dagitimListesi: gorevlendirilenListesi.length > 0 ? gorevlendirilenListesi : baseCtx.dagitimListesi || [],
          yukleniciFirma:
            targetMode === 'tutanak'
              ? enAvantajliTeklifSahibi
              : baseCtx.yukleniciFirma || enAvantajliTeklifSahibi
        }
        mergedCtxStr = JSON.stringify(mergedCtx)

        await window.electron.ipcRenderer.invoke(
          'db:run',
          'INSERT OR REPLACE INTO DATA_DosyaSablonVeri (temin_dosya_id, sablon_id, veri_json) VALUES (?, ?, ?)',
          [activeDosyaId, sablon.id, mergedCtxStr]
        )
      }

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

  return {
    isFormOpen,
    setIsFormOpen,
    formMode,
    setFormMode,
    syncTutanak,
    setSyncTutanak,
    setLowestFirmAsWinner,
    setSetLowestFirmAsWinner,
    belgeleriKaydet,
    setBelgeleriKaydet,
    handleNewDocument,
    handleSaveToDosya,
    handleUpdateDocumentDate,
    handleDeleteDocument
  }
}

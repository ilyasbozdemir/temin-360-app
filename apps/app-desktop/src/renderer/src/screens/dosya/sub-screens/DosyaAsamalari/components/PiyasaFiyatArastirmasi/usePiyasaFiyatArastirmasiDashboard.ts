import { useMemo, useState } from 'react'
import { SABLON_ALIAS_MAP } from '../../constants/sablonAliases'
import { normalizeForMatch } from '../../useDosyaAsamasiSablons'
import { BelgeItem } from '../BelgeListesi'
import { formatDateString } from '../../../../CiktiMerkezi.contextBuilder'
import { useGlobalDocumentPreviewStore } from '../../../../../../store/globalDocumentPreviewStore'
import { useWorkspaceStore } from '../../../../../../store/workspaceStore'
import { PiyasaFiyatArastirmasiDashboardProps } from './types'

export function usePiyasaFiyatArastirmasiDashboard(props: PiyasaFiyatArastirmasiDashboardProps) {
  const {
    stageDocs,
    sablons,
    handleOpenPreviewForSablon,
    quickPrint,
    quickOpenExternal,
    invitedFirms,
    allPoolFirms,
    manualWinnerFirmaId
  } = props

  const { activeDosyaId } = useWorkspaceStore()

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(() => {
    if (!invitedFirms || invitedFirms.length === 0) return 1
    const hasAnyBid = invitedFirms.some((f: any) => f.teklif_toplami && f.teklif_toplami > 0)
    if (hasAnyBid || manualWinnerFirmaId) return 2
    return 1
  })

  const handleOpenSablonByDosyaAdi = (targetKey: string, firmData?: any) => {
    const cleanTarget = targetKey
      .replace(/\.html$/, '')
      .toLowerCase()
      .trim()
    const candidateKeys = SABLON_ALIAS_MAP[cleanTarget] || [cleanTarget]

    let foundSablon: any = null

    if (sablons && sablons.length > 0) {
      for (const key of candidateKeys) {
        foundSablon = sablons.find((s: any) => {
          const fileBase = (s.dosya_adi || '')
            .replace(/\.html$/, '')
            .toLowerCase()
            .trim()
          return fileBase === key
        })
        if (foundSablon) break
      }

      if (!foundSablon) {
        for (const key of candidateKeys) {
          foundSablon = sablons.find((s: any) => {
            const route = String(s.route_path || s.id || '')
              .toLowerCase()
              .trim()
            return route === key
          })
          if (foundSablon) break
        }
      }

      if (!foundSablon) {
        for (const key of candidateKeys) {
          const normKey = normalizeForMatch(key)
          foundSablon = sablons.find((s: any) => {
            const normSablonName = normalizeForMatch(s.ad || s.dosya_adi || '')
            return normSablonName.includes(normKey) || normKey.includes(normSablonName)
          })
          if (foundSablon) break
        }
      }
    }

    if (foundSablon && handleOpenPreviewForSablon) {
      handleOpenPreviewForSablon(foundSablon, foundSablon.ad, undefined, firmData)
    } else {
      useGlobalDocumentPreviewStore.getState().openDocument({
        documentId: targetKey,
        documentTitle: foundSablon ? foundSablon.ad : targetKey,
        dosyaId: activeDosyaId || undefined,
        selectedFirma: firmData || null,
        invitedFirms: invitedFirms || []
      })
    }
  }

  const handleOpenEkapSorgu = (firma?: any) => {
    window.electron?.ipcRenderer.send('window:open-external', {
      url: 'https://ekapv2.kik.gov.tr/sorgulamalar/yasak-sorgulama',
      title: firma?.unvan
        ? `${firma.unvan} - EKAP Yasaklılık Sorgulama`
        : 'EKAP Kamu İhale Yasaklı Sorgulama'
    })
  }

  const mappedBelgeler: BelgeItem[] = useMemo(() => {
    if (!stageDocs || stageDocs.length === 0) return []

    const counts: Record<string, number> = {}

    return stageDocs.map((doc) => {
      const isMaliyet =
        doc.belge_adi === 'Yaklaşık Maliyet Cetveli' ||
        doc.belge_adi?.toLowerCase().includes('maliyet')
      const typeId = isMaliyet ? 'yaklasik-maliyet' : 'piyasa-fiyat-arastirmasi'

      counts[typeId] = (counts[typeId] || 0) + 1

      return {
        id: doc.id,
        belgeTipiId: typeId,
        belgeAdi: doc.belge_adi,
        belgeTarihi: doc.belge_tarihi
          ? formatDateString(doc.belge_tarihi) || doc.belge_tarihi
          : '-',
        durum: 'Tamamlandı' as const,
        siraNo: counts[typeId],
        data: doc
      }
    })
  }, [stageDocs])

  const findSablonForBelge = (belge: BelgeItem) => {
    if (!sablons || sablons.length === 0) return null

    const originalDoc = belge.data as any
    const rawDocName = originalDoc?.belge_adi || belge.belgeAdi || ''
    const normDocName = normalizeForMatch(rawDocName)

    let found = sablons.find((s: any) => {
      const normSablonName = normalizeForMatch(s.ad || s.dosya_adi || '')
      return normSablonName.includes(normDocName) || normDocName.includes(normSablonName)
    })

    if (found) return found

    const isMaliyet =
      belge.belgeTipiId === 'yaklasik-maliyet' || rawDocName.toLowerCase().includes('maliyet')
    const targetKey = isMaliyet ? 'yaklasik-maliyet-cetveli' : 'piyasa-fiyat-arastirma-tutanagi'
    const candidateKeys = SABLON_ALIAS_MAP[targetKey] || [targetKey]

    for (const key of candidateKeys) {
      found = sablons.find((s: any) => {
        const fileBase = (s.dosya_adi || '')
          .replace(/\.html$/, '')
          .toLowerCase()
          .trim()
        return fileBase === key
      })
      if (found) break
    }

    if (!found) {
      for (const key of candidateKeys) {
        found = sablons.find((s: any) => {
          const route = String(s.route_path || s.id || '')
            .toLowerCase()
            .trim()
          return route === key
        })
        if (found) break
      }
    }

    return found || sablons[0]
  }

  const handleOpenBelgePreview = (belge: BelgeItem) => {
    const targetSablon = findSablonForBelge(belge)

    if (targetSablon && handleOpenPreviewForSablon) {
      let snapshotCtx = undefined
      const originalDoc = belge.data as any
      if (originalDoc?.veri_json) {
        try {
          snapshotCtx = JSON.parse(originalDoc.veri_json)
        } catch (e) {
          console.error('Error parsing saved document JSON:', e)
        }
      }
      handleOpenPreviewForSablon(targetSablon, targetSablon.ad, snapshotCtx)
    } else {
      alert('Bu belge için uygun şablon bulunamadı.')
    }
  }

  const handleOpenExternalForBelge = (belge: BelgeItem) => {
    const targetSablon = findSablonForBelge(belge)
    if (targetSablon && quickOpenExternal) {
      quickOpenExternal(targetSablon)
    }
  }

  const handleQuickPrintForBelge = (belge: BelgeItem) => {
    const targetSablon = findSablonForBelge(belge)
    if (targetSablon && quickPrint) {
      quickPrint(targetSablon)
    }
  }

  const firmaColumns = useMemo(
    () => [
      { key: 'unvan', label: 'Firma Unvanı' },
      { key: 'vergi_no', label: 'Vergi No / VKN' },
      { key: 'telefon', label: 'Telefon' },
      { key: 'email', label: 'E-Posta' },
      { key: 'sehir', label: 'İl / Semt' }
    ],
    []
  )

  const formattedFirms = useMemo(() => {
    if (!allPoolFirms) return []
    return allPoolFirms.map((pf) => {
      const existingInvited = invitedFirms?.find((ifrm) => ifrm.firma_id === pf.id)
      return {
        ...pf,
        temin_firma_id: existingInvited?.id,
        isAdded: Boolean(existingInvited),
        sehir: pf.il || (pf as any).sehir || '-',
        telefon: pf.telefon || '-',
        email: pf.email || (pf as any).eposta || '-',
        vergi_no: pf.vergi_no || '-'
      }
    })
  }, [allPoolFirms, invitedFirms])

  const activeWinnerFirma = useMemo(() => {
    if (!manualWinnerFirmaId || !invitedFirms) return null
    return invitedFirms.find(
      (f: any) => f.firma_id === manualWinnerFirmaId || f.id === manualWinnerFirmaId
    )
  }, [manualWinnerFirmaId, invitedFirms])

  const lowestBidFirm = useMemo(() => {
    if (!invitedFirms || invitedFirms.length === 0) return null
    let minTotal = Infinity
    let minFirm: any = null
    invitedFirms.forEach((f: any) => {
      if (f.teklif_toplami && f.teklif_toplami > 0 && f.teklif_toplami < minTotal) {
        minTotal = f.teklif_toplami
        minFirm = f
      }
    })
    return minFirm
  }, [invitedFirms])

  const isStep1Done = Boolean(invitedFirms && invitedFirms.length >= 2)
  const isStep2Done = Boolean(
    invitedFirms &&
    invitedFirms.some((f: any) => f.teklif_toplami && f.teklif_toplami > 0) &&
    (activeWinnerFirma || lowestBidFirm)
  )
  const isStep3Done = mappedBelgeler.length > 0

  return {
    currentStep,
    setCurrentStep,
    handleOpenSablonByDosyaAdi,
    handleOpenEkapSorgu,
    mappedBelgeler,
    handleOpenBelgePreview,
    handleOpenExternalForBelge,
    handleQuickPrintForBelge,
    firmaColumns,
    formattedFirms,
    activeWinnerFirma,
    lowestBidFirm,
    isStep1Done,
    isStep2Done,
    isStep3Done
  }
}

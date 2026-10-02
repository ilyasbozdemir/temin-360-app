import { useGlobalDocumentPreviewStore } from '@renderer/store/globalDocumentPreviewStore'
import { normalizeForMatch } from '../../useDosyaAsamasiSablons'
import { IslemlerData } from './types'

interface UseSiparisDocumentOpenerProps {
  stageSablons: Array<{
    id: number
    ad: string
    dosya_adi: string
    kategori?: string | null
    format?: string | null
    [key: string]: any
  }>
  activeDosyaId: number | null
  sonucOnayEkler: string[]
  islemlerData?: IslemlerData | null
  handleOpenPreviewForSablon: (
    sablon: any,
    title: string,
    overrideCtx?: any,
    selectedFirma?: any
  ) => Promise<void> | void
}

export function useSiparisDocumentOpener({
  stageSablons,
  activeDosyaId,
  sonucOnayEkler,
  islemlerData,
  handleOpenPreviewForSablon
}: UseSiparisDocumentOpenerProps) {
  const sharedInitialData = {
    teslimGun: String(islemlerData?.teslimGunu ?? 10),
    teslimGunu: String(islemlerData?.teslimGunu ?? 10),
    teslimSuresi: String(islemlerData?.teslimGunu ?? 10),
    teslimTarihi: islemlerData?.teslimTarihi ?? '',
    sozlesmeYapilacakMi: Boolean(islemlerData?.sozlesmeYapilacakMi)
  }

  const handleOpenSonucOnay = (): void => {
    const s = stageSablons.find(
      (sb) =>
        normalizeForMatch(sb.dosya_adi + sb.ad).includes('dogrudanteminonay') ||
        normalizeForMatch(sb.dosya_adi + sb.ad).includes('sonuconay') ||
        normalizeForMatch(sb.dosya_adi + sb.ad).includes('onaybelgesi') ||
        normalizeForMatch(sb.dosya_adi + sb.ad).includes('karar')
    )
    if (s) {
      handleOpenPreviewForSablon(s, s.ad || 'Doğrudan Temin Onay Belgesi', {
        ekler: sonucOnayEkler,
        ...sharedInitialData
      })
    } else {
      useGlobalDocumentPreviewStore.getState().openDocument({
        documentId: 'dogrudan-temin-onay-belgesi',
        dosyaId: activeDosyaId || undefined,
        documentTitle: 'Doğrudan Temin Onay Belgesi',
        initialData: { ekler: sonucOnayEkler, ...sharedInitialData }
      })
    }
  }

  const handleOpenButceSorgusu = (): void => {
    const s = stageSablons.find(
      (sb) =>
        normalizeForMatch(sb.dosya_adi + sb.ad).includes('butce') ||
        normalizeForMatch(sb.dosya_adi + sb.ad).includes('odenek')
    )
    if (s) {
      handleOpenPreviewForSablon(
        s,
        s.ad || 'Bütçe Sorgusu / Ödenek Uygunluk Belgesi',
        sharedInitialData
      )
    } else {
      useGlobalDocumentPreviewStore.getState().openDocument({
        documentId: 'butce-sorgusu',
        dosyaId: activeDosyaId || undefined,
        documentTitle: 'Bütçe Sorgusu / Ödenek Uygunluk Belgesi',
        initialData: sharedInitialData
      })
    }
  }

  const handleOpenKabulMektubu = (): void => {
    const s = stageSablons.find(
      (sb) =>
        normalizeForMatch(sb.dosya_adi + sb.ad).includes('kabulyazisi') ||
        normalizeForMatch(sb.dosya_adi + sb.ad).includes('kabuledilenteklif') ||
        normalizeForMatch(sb.dosya_adi + sb.ad).includes('kabul')
    )
    if (s) {
      handleOpenPreviewForSablon(
        s,
        s.ad || 'Kabul Edilen Teklif / Sipariş Formu',
        sharedInitialData
      )
    } else {
      useGlobalDocumentPreviewStore.getState().openDocument({
        documentId: 'kabul-edilen-teklif',
        dosyaId: activeDosyaId || undefined,
        documentTitle: 'Kabul Edilen Teklif Mektubu / Sipariş Formu',
        initialData: sharedInitialData
      })
    }
  }

  const handleOpenSiparisFormu = (): void => {
    const s = stageSablons.find(
      (sb) =>
        normalizeForMatch(sb.dosya_adi + sb.ad).includes('siparisformu') ||
        normalizeForMatch(sb.dosya_adi + sb.ad).includes('siparis')
    )
    if (s) {
      handleOpenPreviewForSablon(
        s,
        s.ad || 'Kabul Edilen Teklif / Sipariş Formu',
        sharedInitialData
      )
    } else {
      useGlobalDocumentPreviewStore.getState().openDocument({
        documentId: 'kabul-edilen-teklif',
        dosyaId: activeDosyaId || undefined,
        documentTitle: 'Kabul Edilen Teklif Mektubu / Sipariş Formu',
        initialData: sharedInitialData
      })
    }
  }

  const handleOpenDavetMektubu = (): void => {
    const s = stageSablons.find((sb) => normalizeForMatch(sb.dosya_adi + sb.ad).includes('davet'))
    if (s) {
      handleOpenPreviewForSablon(s, s.ad || 'Sözleşmeye Davet Mektubu', sharedInitialData)
    } else {
      useGlobalDocumentPreviewStore.getState().openDocument({
        documentId: 'sozlesmeye-davet',
        dosyaId: activeDosyaId || undefined,
        documentTitle: 'Sözleşmeye Davet Mektubu',
        initialData: sharedInitialData
      })
    }
  }

  const handleOpenStandartSozlesme = (): void => {
    const s = stageSablons.find(
      (sb) =>
        normalizeForMatch(sb.dosya_adi + sb.ad).includes('sozlesme') &&
        !normalizeForMatch(sb.dosya_adi + sb.ad).includes('alternatif') &&
        !normalizeForMatch(sb.dosya_adi + sb.ad).includes('uzun')
    )
    if (s) {
      handleOpenPreviewForSablon(s, s.ad || 'Doğrudan Temin Sözleşmesi', sharedInitialData)
    } else {
      useGlobalDocumentPreviewStore.getState().openDocument({
        documentId: 'dogrudan-temin-sozlesmesi',
        dosyaId: activeDosyaId || undefined,
        documentTitle: 'Doğrudan Temin Sözleşmesi',
        initialData: sharedInitialData
      })
    }
  }

  const handleOpenAlternatifSozlesme = (): void => {
    const s = stageSablons.find(
      (sb) =>
        normalizeForMatch(sb.dosya_adi + sb.ad).includes('sozlesme') &&
        normalizeForMatch(sb.dosya_adi + sb.ad).includes('alternatif')
    )
    if (s) {
      handleOpenPreviewForSablon(
        s,
        s.ad || 'Doğrudan Temin Sözleşmesi (Alternatif)',
        sharedInitialData
      )
    } else {
      useGlobalDocumentPreviewStore.getState().openDocument({
        documentId: 'dogrudan-temin-sozlesmesi-alternatif',
        dosyaId: activeDosyaId || undefined,
        documentTitle: 'Doğrudan Temin Sözleşmesi (Alternatif)',
        initialData: sharedInitialData
      })
    }
  }

  const handleOpenUzunFormSozlesme = (): void => {
    const s = stageSablons.find(
      (sb) =>
        normalizeForMatch(sb.dosya_adi + sb.ad).includes('sozlesme') &&
        normalizeForMatch(sb.dosya_adi + sb.ad).includes('uzun')
    )
    if (s) {
      handleOpenPreviewForSablon(
        s,
        s.ad || 'Doğrudan Temin Sözleşmesi (Kapsamlı)',
        sharedInitialData
      )
    } else {
      useGlobalDocumentPreviewStore.getState().openDocument({
        documentId: 'dogrudan-temin-sozlesmesi-uzun',
        dosyaId: activeDosyaId || undefined,
        documentTitle: 'Doğrudan Temin Sözleşmesi (Kapsamlı)',
        initialData: sharedInitialData
      })
    }
  }

  return {
    handleOpenSonucOnay,
    handleOpenButceSorgusu,
    handleOpenKabulMektubu,
    handleOpenSiparisFormu,
    handleOpenDavetMektubu,
    handleOpenStandartSozlesme,
    handleOpenAlternatifSozlesme,
    handleOpenUzunFormSozlesme
  }
}

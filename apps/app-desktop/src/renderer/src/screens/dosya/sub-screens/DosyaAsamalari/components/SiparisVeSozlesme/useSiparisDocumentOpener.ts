import { useGlobalDocumentPreviewStore } from '@renderer/store/globalDocumentPreviewStore'
import { normalizeForMatch } from '../../useDosyaAsamasiSablons'

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
  handleOpenPreviewForSablon
}: UseSiparisDocumentOpenerProps) {
  const handleOpenSonucOnay = (): void => {
    const s = stageSablons.find(
      (sb) =>
        normalizeForMatch(sb.dosya_adi + sb.ad).includes('sonuconay') ||
        normalizeForMatch(sb.dosya_adi + sb.ad).includes('sonuc') ||
        normalizeForMatch(sb.dosya_adi + sb.ad).includes('karar')
    )
    if (s) {
      handleOpenPreviewForSablon(
        s,
        s.ad || 'Doğrudan Temin Sonuç Onay Belgesi'
      )
    } else {
      useGlobalDocumentPreviewStore.getState().openDocument({
        documentId: 'dogrudan-temin-sonuc-onay-belgesi',
        dosyaId: activeDosyaId || undefined,
        documentTitle: 'Doğrudan Temin Sonuç Onay Belgesi',
        initialData: { ekler: sonucOnayEkler }
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
        s.ad || 'Bütçe Sorgusu / Ödenek Uygunluk Belgesi'
      )
    } else {
      useGlobalDocumentPreviewStore.getState().openDocument({
        documentId: 'butce-sorgusu',
        dosyaId: activeDosyaId || undefined,
        documentTitle: 'Bütçe Sorgusu / Ödenek Uygunluk Belgesi'
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
      handleOpenPreviewForSablon(s, s.ad || 'Kabul Edilen Teklif / Sipariş Formu')
    } else {
      useGlobalDocumentPreviewStore.getState().openDocument({
        documentId: 'kabul-edilen-teklif',
        dosyaId: activeDosyaId || undefined,
        documentTitle: 'Kabul Edilen Teklif Mektubu / Sipariş Formu'
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
      handleOpenPreviewForSablon(s, s.ad || 'Kabul Edilen Teklif / Sipariş Formu')
    } else {
      useGlobalDocumentPreviewStore.getState().openDocument({
        documentId: 'kabul-edilen-teklif',
        dosyaId: activeDosyaId || undefined,
        documentTitle: 'Kabul Edilen Teklif Mektubu / Sipariş Formu'
      })
    }
  }

  const handleOpenDavetMektubu = (): void => {
    const s = stageSablons.find((sb) =>
      normalizeForMatch(sb.dosya_adi + sb.ad).includes('davet')
    )
    if (s) {
      handleOpenPreviewForSablon(s, s.ad || 'Sözleşmeye Davet Mektubu')
    } else {
      useGlobalDocumentPreviewStore.getState().openDocument({
        documentId: 'sozlesmeye-davet',
        dosyaId: activeDosyaId || undefined,
        documentTitle: 'Sözleşmeye Davet Mektubu'
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
      handleOpenPreviewForSablon(s, s.ad || 'Doğrudan Temin Sözleşmesi')
    } else {
      useGlobalDocumentPreviewStore.getState().openDocument({
        documentId: 'dogrudan-temin-sozlesmesi',
        dosyaId: activeDosyaId || undefined,
        documentTitle: 'Doğrudan Temin Sözleşmesi'
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
      handleOpenPreviewForSablon(s, s.ad || 'Doğrudan Temin Sözleşmesi (Alternatif)')
    } else {
      useGlobalDocumentPreviewStore.getState().openDocument({
        documentId: 'dogrudan-temin-sozlesmesi-alternatif',
        dosyaId: activeDosyaId || undefined,
        documentTitle: 'Doğrudan Temin Sözleşmesi (Alternatif)'
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
      handleOpenPreviewForSablon(s, s.ad || 'Doğrudan Temin Sözleşmesi (Kapsamlı)')
    } else {
      useGlobalDocumentPreviewStore.getState().openDocument({
        documentId: 'dogrudan-temin-sozlesmesi-uzun',
        dosyaId: activeDosyaId || undefined,
        documentTitle: 'Doğrudan Temin Sözleşmesi (Kapsamlı)'
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

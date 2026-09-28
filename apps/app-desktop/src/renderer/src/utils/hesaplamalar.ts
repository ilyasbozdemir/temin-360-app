export type VergiOraniTuru = 'yuzde' | 'binde'

/**
 * Kuruş yuvarlama (Math.round) garantili kesinti hesaplama fonksiyonu.
 * Kamu muhasebesinde virgülden sonra iki basamak olacak şekilde yuvarlanmalıdır.
 *
 * @param brutTutar - Brüt Tutar
 * @param oranStr - Oran metni (Örn: '9,48' veya '20')
 * @param tur - 'yuzde' veya 'binde'
 * @returns Kuruş yuvarlaması yapılmış kesin tutar
 */
export const hesaplaKesinti = (brutTutar: number, oranStr: string, tur: VergiOraniTuru): number => {
  if (!brutTutar || isNaN(brutTutar)) return 0
  if (!oranStr) return 0

  const parsedOran = parseFloat(oranStr.replace(',', '.'))
  if (isNaN(parsedOran)) return 0

  if (tur === 'binde') {
    return Math.round(((brutTutar * parsedOran) / 1000) * 100) / 100
  }
  return Math.round(((brutTutar * parsedOran) / 100) * 100) / 100
}

/**
 * Tevkifat (Örn: 2/10, 5/10, 9/10) hesaplaması.
 * KDV'nin ne kadarının tevkif edileceğini bulur.
 *
 * @param kdvTutari - Kesilecek toplam KDV tutarı
 * @param pay - Tevkifat payı (Örn: 9)
 * @param payda - Tevkifat paydası (Örn: 10)
 * @returns Tevkif edilecek tutar
 */
export const hesaplaTevkifat = (kdvTutari: number, pay: number, payda: number = 10): number => {
  if (!kdvTutari || isNaN(kdvTutari)) return 0
  if (!pay || isNaN(pay) || !payda || isNaN(payda) || payda === 0) return 0

  return Math.round(((kdvTutari * pay) / payda) * 100) / 100
}

/**
 * Tutarı "1.234,56" şeklinde formatlar.
 */
export const formatTutar = (tutar: number): string => {
  if (isNaN(tutar)) return '0,00'
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(tutar)
}

export interface VergiOraniItem {
  id: string
  ad: string
  oran: string
  tur: VergiOraniTuru
  hesapKodu?: string
}

/**
 * Settings (Ayarlar/Mevzuat) üzerinden vergi oranını bulur.
 * Tanımlı değilse mevzuat varsayılanını (ör: 9,48 binde) döner.
 */
export const getAyarVergiOrani = (
  settings: any,
  turAd: 'hakedis_damga' | 'karar_damga' | 'kdv_20' | 'kdv_10' | 'kdv_1',
  fallbackOran?: string,
  fallbackTur?: VergiOraniTuru
): { oran: string; tur: VergiOraniTuru } => {
  if (settings?.rates) {
    try {
      const parsed: VergiOraniItem[] =
        typeof settings.rates === 'string' ? JSON.parse(settings.rates) : settings.rates
      if (Array.isArray(parsed)) {
        if (turAd === 'hakedis_damga') {
          const item = parsed.find(
            (r) =>
              r.ad?.toLowerCase().includes('hakediş') ||
              r.ad?.toLowerCase().includes('hakedis') ||
              r.id === '1'
          )
          if (item?.oran) return { oran: item.oran, tur: item.tur || 'binde' }
        }
        if (turAd === 'karar_damga') {
          const item = parsed.find((r) => r.ad?.toLowerCase().includes('karar') || r.id === '2')
          if (item?.oran) return { oran: item.oran, tur: item.tur || 'binde' }
        }
        if (turAd === 'kdv_20') {
          const item = parsed.find((r) => r.oran === '20' || r.id === '3')
          if (item?.oran) return { oran: item.oran, tur: item.tur || 'yuzde' }
        }
        if (turAd === 'kdv_10') {
          const item = parsed.find((r) => r.oran === '10' || r.id === '4')
          if (item?.oran) return { oran: item.oran, tur: item.tur || 'yuzde' }
        }
        if (turAd === 'kdv_1') {
          const item = parsed.find((r) => r.oran === '1' || r.id === '5')
          if (item?.oran) return { oran: item.oran, tur: item.tur || 'yuzde' }
        }
      }
    } catch {
      // ignore parse error
    }
  }

  // Fallbacks
  if (turAd === 'hakedis_damga') return { oran: fallbackOran || '9,48', tur: fallbackTur || 'binde' }
  if (turAd === 'karar_damga') return { oran: fallbackOran || '5,69', tur: fallbackTur || 'binde' }
  if (turAd === 'kdv_20') return { oran: fallbackOran || '20', tur: fallbackTur || 'yuzde' }
  if (turAd === 'kdv_10') return { oran: fallbackOran || '10', tur: fallbackTur || 'yuzde' }
  if (turAd === 'kdv_1') return { oran: fallbackOran || '1', tur: fallbackTur || 'yuzde' }

  return { oran: fallbackOran || '9,48', tur: fallbackTur || 'binde' }
}

export { sayiyiYaziyaCevir, amountToWordsTL, numberToWords } from './sayiyiYaziyaCevir'
export * from './priceDifference'


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

export { sayiyiYaziyaCevir, amountToWordsTL, numberToWords } from './sayiyiYaziyaCevir'

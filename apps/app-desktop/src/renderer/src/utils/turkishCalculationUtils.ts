/**
 * Turkish Number and Tender Calculation Utilities
 * TEMİN 360 - İhale ve Doğrudan Temin Hesaplama Araçları
 */

const ONES = ['', 'BİR', 'İKİ', 'ÜÇ', 'DÖRT', 'BEŞ', 'ALTI', 'YEDİ', 'SEKİZ', 'DOKUZ']
const TENS = ['', 'ON', 'YİRMİ', 'OTUZ', 'KIRK', 'ELLİ', 'ALTMIŞ', 'YETMİŞ', 'SEKSEN', 'DOKSAN']
const SCALES = ['', 'BİN', 'MİLYON', 'MİLYAR', 'TRİLYON', 'KATRİLYON']

function convertThreeDigits(n: number): string {
  let result = ''
  const hundreds = Math.floor(n / 100)
  const remainder = n % 100
  const tens = Math.floor(remainder / 10)
  const ones = remainder % 10

  if (hundreds > 0) {
    if (hundreds > 1) {
      result += ONES[hundreds]
    }
    result += 'YÜZ'
  }
  if (tens > 0) {
    result += TENS[tens]
  }
  if (ones > 0) {
    result += ONES[ones]
  }
  return result
}

export interface NumberToWordsOptions {
  currency?: 'TL' | 'USD' | 'EUR' | 'NONE'
  subCurrency?: 'KURUŞ' | 'CENT' | 'NONE'
  prefix?: string
  suffix?: string
  caseType?: 'UPPER' | 'LOWER' | 'TITLE'
}

/**
 * Sayıyı Türkçe Okunuşa / Yazıya Çevirir (Kuruş/Cent desteğiyle)
 */
export function convertNumberToWords(
  val: number | string,
  options: NumberToWordsOptions = {}
): string {
  const {
    currency = 'TL',
    subCurrency = 'KURUŞ',
    prefix = '',
    suffix = '',
    caseType = 'UPPER'
  } = options

  const num = typeof val === 'string' ? parseFloat(val.replace(',', '.')) : val
  if (isNaN(num) || num === null) return ''

  if (num === 0) {
    let zeroStr = 'SIFIR'
    if (currency !== 'NONE') zeroStr += ` ${currency}`
    return formatCase(`${prefix}${zeroStr}${suffix}`.trim(), caseType)
  }

  const isNegative = num < 0
  const absNum = Math.abs(num)
  const integerPart = Math.floor(absNum)
  const decimalPart = Math.round((absNum - integerPart) * 100)

  // 3'lü basamak gruplarına ayır
  const groups: number[] = []
  let temp = integerPart
  while (temp > 0) {
    groups.push(temp % 1000)
    temp = Math.floor(temp / 1000)
  }

  let words = ''
  for (let i = groups.length - 1; i >= 0; i--) {
    const groupVal = groups[i]
    if (groupVal === 0) continue

    let groupText = convertThreeDigits(groupVal)
    // 1000 için "BİR BİN" denmez, "BİN" denir
    if (i === 1 && groupVal === 1) {
      groupText = ''
    }

    words += groupText + (SCALES[i] || '')
  }

  words = words || 'SIFIR'

  let finalWords = ''
  if (isNegative) finalWords += 'EKSİ '

  if (currency !== 'NONE') {
    finalWords += `${words} ${currency}`
  } else {
    finalWords += words
  }

  if (decimalPart > 0) {
    const decText = convertThreeDigits(decimalPart)
    if (subCurrency !== 'NONE') {
      finalWords += ` ${decText} ${subCurrency}`
    } else {
      finalWords += ` VİRGÜL ${decText}`
    }
  }

  const output = `${prefix}${finalWords}${suffix}`.trim()
  return formatCase(output, caseType)
}

function formatCase(text: string, caseType: 'UPPER' | 'LOWER' | 'TITLE'): string {
  if (caseType === 'UPPER') return text.toLocaleUpperCase('tr-TR')
  if (caseType === 'LOWER') return text.toLocaleLowerCase('tr-TR')
  if (caseType === 'TITLE') {
    return text
      .split(' ')
      .map(
        (word) =>
          word.charAt(0).toLocaleUpperCase('tr-TR') + word.slice(1).toLocaleLowerCase('tr-TR')
      )
      .join(' ')
  }
  return text
}

/**
 * Örnek TÜİK Yİ-ÜFE Endeksleri (2024-2026)
 */
export const SAMPLE_YIUFE_INDEXES = [
  { yil: 2024, ay: 'Ocak', endeks: 3120.45 },
  { yil: 2024, ay: 'Şubat', endeks: 3237.15 },
  { yil: 2024, ay: 'Mart', endeks: 3343.82 },
  { yil: 2024, ay: 'Nisan', endeks: 3464.2 },
  { yil: 2024, ay: 'Mayıs', endeks: 3532.11 },
  { yil: 2024, ay: 'Haziran', endeks: 3534.62 },
  { yil: 2024, ay: 'Temmuz', endeks: 3603.2 },
  { yil: 2024, ay: 'Ağustos', endeks: 3663.95 },
  { yil: 2024, ay: 'Eylül', endeks: 3714.5 },
  { yil: 2024, ay: 'Ekim', endeks: 3762.4 },
  { yil: 2024, ay: 'Kasım', endeks: 3821.15 },
  { yil: 2024, ay: 'Aralık', endeks: 3878.8 },
  { yil: 2025, ay: 'Ocak', endeks: 3995.2 },
  { yil: 2025, ay: 'Şubat', endeks: 4085.6 },
  { yil: 2025, ay: 'Mart', endeks: 4180.1 },
  { yil: 2025, ay: 'Nisan', endeks: 4290.4 },
  { yil: 2025, ay: 'Mayıs', endeks: 4385.0 },
  { yil: 2025, ay: 'Haziran', endeks: 4470.2 },
  { yil: 2025, ay: 'Temmuz', endeks: 4575.8 },
  { yil: 2025, ay: 'Ağustos', endeks: 4660.1 },
  { yil: 2025, ay: 'Eylül', endeks: 4745.3 },
  { yil: 2025, ay: 'Ekim', endeks: 4830.0 },
  { yil: 2025, ay: 'Kasım', endeks: 4910.5 },
  { yil: 2025, ay: 'Aralık', endeks: 4995.0 },
  { yil: 2026, ay: 'Ocak', endeks: 5120.0 },
  { yil: 2026, ay: 'Şubat', endeks: 5210.0 },
  { yil: 2026, ay: 'Mart', endeks: 5315.0 },
  { yil: 2026, ay: 'Nisan', endeks: 5420.0 }
]

/**
 * Yİ-ÜFE Fiyat Farkı Hesaplama
 */
export interface FiyatFarkiHesaplaParams {
  hakedisTutari: number // An
  temelEndeks: number // Yo veya Po (İhale/Sözleşme ayı endeksi)
  guncelEndeks: number // Yn veya Pn (Uygulama/Hakediş ayı endeksi)
  sabitKatsayiB?: number // B katsayısı (genelde 0.90 veya 1.00)
}

export interface FiyatFarkiSonuc {
  fiyatFarkiTutari: number // F
  guncelToplamTutar: number // An + F
  artisOrani: number // % değişim
  fiyatEndeksKatsayisi: number // Pn/Po oranı
}

export function calculateFiyatFarki(params: FiyatFarkiHesaplaParams): FiyatFarkiSonuc {
  const { hakedisTutari, temelEndeks, guncelEndeks, sabitKatsayiB = 0.9 } = params

  if (temelEndeks <= 0 || guncelEndeks <= 0 || hakedisTutari <= 0) {
    return {
      fiyatFarkiTutari: 0,
      guncelToplamTutar: hakedisTutari,
      artisOrani: 0,
      fiyatEndeksKatsayisi: 1
    }
  }

  const fiyatEndeksKatsayisi = guncelEndeks / temelEndeks
  const artisOrani = ((guncelEndeks - temelEndeks) / temelEndeks) * 100
  // F = An * B * (Pn/Po - 1)
  const fiyatFarkiTutari = hakedisTutari * sabitKatsayiB * (fiyatEndeksKatsayisi - 1)
  const guncelToplamTutar = hakedisTutari + fiyatFarkiTutari

  return {
    fiyatFarkiTutari,
    guncelToplamTutar,
    artisOrani,
    fiyatEndeksKatsayisi
  }
}

/**
 * KDV ve Tevkifat Hesaplama
 */
export interface TevkifatSecenegi {
  kod: string
  ad: string
  pay: number
  payda: number
  aciklama: string
}

export const TEVKIFAT_ORANLARI: TevkifatSecenegi[] = [
  {
    kod: '0/10',
    ad: 'Tevkifatsız (0/10)',
    pay: 0,
    payda: 10,
    aciklama: 'Normal alımlar ve tevkifata tabi olmayan işlemler'
  },
  {
    kod: '2/10',
    ad: '2/10 Tevkifat',
    pay: 2,
    payda: 10,
    aciklama: 'Et ve et ürünleri, pamuk, tiftik vb.'
  },
  {
    kod: '3/10',
    ad: '3/10 Tevkifat',
    pay: 3,
    payda: 10,
    aciklama: 'Yapım işleri ile bu işlerle birlikte ifa edilen mühendislik/mimarlık hizmetleri'
  },
  {
    kod: '4/10',
    ad: '4/10 Tevkifat',
    pay: 4,
    payda: 10,
    aciklama: 'Yemek servis ve organizasyon hizmetleri'
  },
  {
    kod: '5/10',
    ad: '5/10 Tevkifat',
    pay: 5,
    payda: 10,
    aciklama: 'Servis taşımacılığı, baskı-basım, makine-teçhizat bakım ve onarım hizmetleri'
  },
  {
    kod: '7/10',
    ad: '7/10 Tevkifat',
    pay: 7,
    payda: 10,
    aciklama: 'Özel güvenlik ve koruma hizmetleri'
  },
  {
    kod: '9/10',
    ad: '9/10 Tevkifat',
    pay: 9,
    payda: 10,
    aciklama: 'Temizlik, çevre ve bahçe bakım, işgücü temin hizmetleri'
  },
  {
    kod: '10/10',
    ad: '10/10 Tam Tevkifat',
    pay: 10,
    payda: 10,
    aciklama: 'KDV’nin tamamının idare tarafından kesilerek beyan edilmesi'
  }
]

export interface KdvTevkifatHesaplaParams {
  tutar: number
  kdvOrani: number // %1, %10, %20
  tevkifatPay: number // örn: 5
  tevkifatPayda: number // örn: 10
  tutarTuru: 'HARIC' | 'DAHIL'
}

export interface KdvTevkifatSonuc {
  matrah: number
  hesaplananKdv: number
  tevkifEdilenKdv: number // İdarece kesilen (2 No'lu KDV)
  saticiyaOdenecekKdv: number // Faturadaki ödenecek KDV
  saticiyaOdenecekToplam: number // Matrah + Satıcı KDV
  genelToplam: number // Matrah + Hesaplanan KDV
}

export function calculateKdvTevkifat(params: KdvTevkifatHesaplaParams): KdvTevkifatSonuc {
  const { tutar, kdvOrani, tevkifatPay, tevkifatPayda, tutarTuru } = params

  if (tutar <= 0) {
    return {
      matrah: 0,
      hesaplananKdv: 0,
      tevkifEdilenKdv: 0,
      saticiyaOdenecekKdv: 0,
      saticiyaOdenecekToplam: 0,
      genelToplam: 0
    }
  }

  let matrah = 0
  let hesaplananKdv = 0

  if (tutarTuru === 'HARIC') {
    matrah = tutar
    hesaplananKdv = matrah * (kdvOrani / 100)
  } else {
    // Dahil
    matrah = tutar / (1 + kdvOrani / 100)
    hesaplananKdv = tutar - matrah
  }

  const tevkifatOrani = tevkifatPayda > 0 ? tevkifatPay / tevkifatPayda : 0
  const tevkifEdilenKdv = hesaplananKdv * tevkifatOrani
  const saticiyaOdenecekKdv = hesaplananKdv - tevkifEdilenKdv
  const saticiyaOdenecekToplam = matrah + saticiyaOdenecekKdv
  const genelToplam = matrah + hesaplananKdv

  return {
    matrah,
    hesaplananKdv,
    tevkifEdilenKdv,
    saticiyaOdenecekKdv,
    saticiyaOdenecekToplam,
    genelToplam
  }
}

/**
 * Damga Vergisi, Karar Pulu ve KİK Payı
 */
export interface DamgaVergisiSonuc {
  matrah: number
  ihaleKararPulu: number // ‰ 5.69
  sozlesmeDamgaVergisi: number // ‰ 9.48
  kikPayi: number // ‰ 0.5 (On binde 5)
  toplamKesinti: number
  netOdenecekTutar: number
}

export function calculateDamgaVergisi(
  matrah: number,
  options: {
    includeKararPulu?: boolean
    includeSozlesmeDamga?: boolean
    includeKikPayi?: boolean
  } = {}
): DamgaVergisiSonuc {
  const { includeKararPulu = true, includeSozlesmeDamga = true, includeKikPayi = true } = options

  if (matrah <= 0) {
    return {
      matrah: 0,
      ihaleKararPulu: 0,
      sozlesmeDamgaVergisi: 0,
      kikPayi: 0,
      toplamKesinti: 0,
      netOdenecekTutar: 0
    }
  }

  // ‰ 5.69 = 0.00569
  const ihaleKararPulu = includeKararPulu ? matrah * 0.00569 : 0
  // ‰ 9.48 = 0.00948
  const sozlesmeDamgaVergisi = includeSozlesmeDamga ? matrah * 0.00948 : 0
  // ‰ 0.5 = 0.0005 (On binde 5)
  const kikPayi = includeKikPayi ? matrah * 0.0005 : 0

  const toplamKesinti = ihaleKararPulu + sozlesmeDamgaVergisi + kikPayi
  const netOdenecekTutar = matrah - toplamKesinti

  return {
    matrah,
    ihaleKararPulu,
    sozlesmeDamgaVergisi,
    kikPayi,
    toplamKesinti,
    netOdenecekTutar
  }
}

/**
 * Gecikme Cezası Hesaplama
 */
export interface GecikmeCezasiSonuc {
  sozlesmeBedeli: number
  gecikmeGunSayisi: number
  gunlukCezaOrani: number
  gunlukCezaTutari: number
  toplamCezaTutari: number
  kalanSozlesmeBedeli: number
}

export function calculateGecikmeCezasi(
  sozlesmeBedeli: number,
  gunSayisi: number,
  gunlukOranBinde: number = 0.5 // On binde 5 = Binde 0.5 = 0.0005
): GecikmeCezasiSonuc {
  if (sozlesmeBedeli <= 0 || gunSayisi <= 0) {
    return {
      sozlesmeBedeli,
      gecikmeGunSayisi: gunSayisi,
      gunlukCezaOrani: gunlukOranBinde,
      gunlukCezaTutari: 0,
      toplamCezaTutari: 0,
      kalanSozlesmeBedeli: sozlesmeBedeli
    }
  }

  const oran = gunlukOranBinde / 1000
  const gunlukCezaTutari = sozlesmeBedeli * oran
  const toplamCezaTutari = gunlukCezaTutari * gunSayisi
  const kalanSozlesmeBedeli = Math.max(0, sozlesmeBedeli - toplamCezaTutari)

  return {
    sozlesmeBedeli,
    gecikmeGunSayisi: gunSayisi,
    gunlukCezaOrani: gunlukOranBinde,
    gunlukCezaTutari,
    toplamCezaTutari,
    kalanSozlesmeBedeli
  }
}

/**
 * Para formatlama yardımcısı (12.345,67 ₺)
 */
export function formatCurrency(amount: number, currencySuffix = '₺'): string {
  if (isNaN(amount)) return `0,00 ${currencySuffix}`
  return `${amount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currencySuffix}`.trim()
}

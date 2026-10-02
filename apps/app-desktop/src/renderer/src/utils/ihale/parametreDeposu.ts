/**
 * TEMİN 360 - MERKEZİ MEVZUAT VE PARAMETRE/TARİFE DEPOSU
 *
 * Kamu İhale Kanunu (4734), Devlet İhale Kanunu (2886), Vergi Kanunları ve Harçlar
 * kapsamında geçerli olan tüm eşik değerler, oranlar, katsayılar ve tarifeleri
 * tek bir geçerlilik tarihli veri deposunda tutar.
 *
 * Hiçbir hesaplayıcı fonksiyon rakamları sabit (hardcoded) gömmez;
 * ilgili yıl veya tarihteki parametre kaydını bu depodan çeker.
 */

export interface EsikDegerler {
  yil: number
  // 4734 Sayılı Kanun Madde 22/d Doğrudan Temin Limitleri (KDV Hariç)
  dogrudanTeminBuyuksehir: number
  dogrudanTeminDiger: number
  // 4734 Sayılı Kanun Madde 21/f Pazarlık Usulü Limiti (KDV Hariç)
  pazarlik21f: number
  // 4734 Madde 13 İlan Süreleri ve Kuralları Eşik Değeri
  ilanEsikDegeriMalHizmet: number
  ilanEsikDegeriYapim: number
  // KİK Payı Kesintisi Eşik Tutarı (4734 md. 53/j) - Bu tutarın üzerindeki sözleşmelerde onbinde 5
  kikPayiEsikTutari: number
  kikPayiOrani: number // 0.0005 (On binde 5)
  // 4734 Madde 62/ı %10 Bütçe Ödenek Tavan Sınırı Oranı
  butceYuzdeOnSinirOrani: number // 0.10
}

export interface VergiVeKesintiOranlari {
  // Damga Vergisi Oranları (488 sayılı Kanun)
  damgaVergisiIhaleKarari: number // 0.00569 (Binde 5,69)
  damgaVergisiSozlesme: number // 0.00948 (Binde 9,48)
  damgaVergisiHakedis: number // 0.00948 (Binde 9,48)
  damgaVergisiKira: number // 0.00189 (Binde 1,89)

  // Teminat Oranları
  geciciTeminatMinOran: number // 0.03 (%3)
  kesinTeminatOran: number // 0.06 (%6)
  ekKesinTeminatOran: number // 0.06 (%6)

  // Gecikme Cezası Standart Oranı (Sözleşme bedelinin günlük binde oranı)
  standartGunlukGecikmeCezaOrani: number // 0.0005 (Binde 0,5) veya 0.001 (Binde 1)
  maksimumGecikmeCezaOrani: number // 0.30 (Toplam sözleşme bedelinin %30'u tavan)

  // KDV Oranları
  standartKdvOrani: number // 0.20 (%20)
  indirimliKdvOrani1: number // 0.10 (%10)
  indirimliKdvOrani2: number // 0.01 (%1)

  // Stopaj Oranları
  gelirVergisiStopajHizmet: number // 0.03 (%3)
  gelirVergisiStopajKira: number // 0.20 (%20)
  gelirVergisiStopajSerbestMeslek: number // 0.20 (%20)
}

export interface KdvTevkifatTipi {
  kod: string
  ad: string
  pay: number
  payda: number
  oran: number // pay / payda
  aciklama: string
}

export interface ParametreYili {
  yil: number
  esikDegerler: EsikDegerler
  vergiVeKesintiler: VergiVeKesintiOranlari
  kdvTevkifatTurleri: KdvTevkifatTipi[]
}

/**
 * Resmi KDV Tevkifat Türleri Kataloğu (KDV Genel Uygulama Tebliği)
 */
export const KDV_TEVKIFAT_KATALOGU: KdvTevkifatTipi[] = [
  {
    kod: 'YAPIM_ISLERI',
    ad: 'Yapım İşleri ile Bu İşlerle Birlikte İfa Edilen Mimarlık-Mühendislik Hizmetleri',
    pay: 4,
    payda: 10,
    oran: 0.4,
    aciklama: 'KDV Genel Uygulama Tebliği I/C-2.1.3.2.1'
  },
  {
    kod: 'TEMIZLIK_HIZMETLERI',
    ad: 'Temizlik, Çevre ve Bahçe Bakım Hizmetleri',
    pay: 9,
    payda: 10,
    oran: 0.9,
    aciklama: 'KDV Genel Uygulama Tebliği I/C-2.1.3.2.5'
  },
  {
    kod: 'OZEL_GUVENLIK',
    ad: 'Özel Güvenlik Hizmetleri',
    pay: 9,
    payda: 10,
    oran: 0.9,
    aciklama: 'KDV Genel Uygulama Tebliği I/C-2.1.3.2.6'
  },
  {
    kod: 'MAKINE_TECIZAT_BAKIM',
    ad: 'Makine, Teçhizat, Demirbaş ve Taşıtlara Ait Tadil, Bakım ve Onarım Hizmetleri',
    pay: 7,
    payda: 10,
    oran: 0.7,
    aciklama: 'KDV Genel Uygulama Tebliği I/C-2.1.3.2.7'
  },
  {
    kod: 'YEMEK_ORGANIZASYON',
    ad: 'Yemek Servis ve Organizasyon Hizmetleri',
    pay: 5,
    payda: 10,
    oran: 0.5,
    aciklama: 'KDV Genel Uygulama Tebliği I/C-2.1.3.2.4'
  },
  {
    kod: 'ISGUCU_TEMIN',
    ad: 'İşgücü Temin Hizmetleri',
    pay: 9,
    payda: 10,
    oran: 0.9,
    aciklama: 'KDV Genel Uygulama Tebliği I/C-2.1.3.2.2'
  },
  {
    kod: 'SERVIS_TASIMACILIGI',
    ad: 'Servis Taşımacılığı Hizmeti',
    pay: 5,
    payda: 10,
    oran: 0.5,
    aciklama: 'KDV Genel Uygulama Tebliği I/C-2.1.3.2.11'
  },
  {
    kod: 'DURUMSUZ',
    ad: 'Tevkifatsız (Tam KDV)',
    pay: 0,
    payda: 10,
    oran: 0.0,
    aciklama: 'Tevkifat uygulanmaz'
  }
]

/**
 * Yıllara Göre Resmi Eşik Değerler ve Oranlar Tablosu
 */
export const MEVZUAT_PARAMETRELERI_TABLOSU: Record<number, ParametreYili> = {
  2026: {
    yil: 2026,
    esikDegerler: {
      yil: 2026,
      dogrudanTeminBuyuksehir: 1420000,
      dogrudanTeminDiger: 475000,
      pazarlik21f: 1420000,
      ilanEsikDegeriMalHizmet: 18500000,
      ilanEsikDegeriYapim: 405000000,
      kikPayiEsikTutari: 1150000,
      kikPayiOrani: 0.0005,
      butceYuzdeOnSinirOrani: 0.1
    },
    vergiVeKesintiler: {
      damgaVergisiIhaleKarari: 0.00569,
      damgaVergisiSozlesme: 0.00948,
      damgaVergisiHakedis: 0.00948,
      damgaVergisiKira: 0.00189,
      geciciTeminatMinOran: 0.03,
      kesinTeminatOran: 0.06,
      ekKesinTeminatOran: 0.06,
      standartGunlukGecikmeCezaOrani: 0.0005,
      maksimumGecikmeCezaOrani: 0.3,
      standartKdvOrani: 0.2,
      indirimliKdvOrani1: 0.1,
      indirimliKdvOrani2: 0.01,
      gelirVergisiStopajHizmet: 0.03,
      gelirVergisiStopajKira: 0.2,
      gelirVergisiStopajSerbestMeslek: 0.2
    },
    kdvTevkifatTurleri: KDV_TEVKIFAT_KATALOGU
  },
  2025: {
    yil: 2025,
    esikDegerler: {
      yil: 2025,
      dogrudanTeminBuyuksehir: 1021827,
      dogrudanTeminDiger: 340550,
      pazarlik21f: 1021827,
      ilanEsikDegeriMalHizmet: 13350000,
      ilanEsikDegeriYapim: 292000000,
      kikPayiEsikTutari: 850000,
      kikPayiOrani: 0.0005,
      butceYuzdeOnSinirOrani: 0.1
    },
    vergiVeKesintiler: {
      damgaVergisiIhaleKarari: 0.00569,
      damgaVergisiSozlesme: 0.00948,
      damgaVergisiHakedis: 0.00948,
      damgaVergisiKira: 0.00189,
      geciciTeminatMinOran: 0.03,
      kesinTeminatOran: 0.06,
      ekKesinTeminatOran: 0.06,
      standartGunlukGecikmeCezaOrani: 0.0005,
      maksimumGecikmeCezaOrani: 0.3,
      standartKdvOrani: 0.2,
      indirimliKdvOrani1: 0.1,
      indirimliKdvOrani2: 0.01,
      gelirVergisiStopajHizmet: 0.03,
      gelirVergisiStopajKira: 0.2,
      gelirVergisiStopajSerbestMeslek: 0.2
    },
    kdvTevkifatTurleri: KDV_TEVKIFAT_KATALOGU
  },
  2024: {
    yil: 2024,
    esikDegerler: {
      yil: 2024,
      dogrudanTeminBuyuksehir: 720000,
      dogrudanTeminDiger: 240000,
      pazarlik21f: 720000,
      ilanEsikDegeriMalHizmet: 9400000,
      ilanEsikDegeriYapim: 205000000,
      kikPayiEsikTutari: 600000,
      kikPayiOrani: 0.0005,
      butceYuzdeOnSinirOrani: 0.1
    },
    vergiVeKesintiler: {
      damgaVergisiIhaleKarari: 0.00569,
      damgaVergisiSozlesme: 0.00948,
      damgaVergisiHakedis: 0.00948,
      damgaVergisiKira: 0.00189,
      geciciTeminatMinOran: 0.03,
      kesinTeminatOran: 0.06,
      ekKesinTeminatOran: 0.06,
      standartGunlukGecikmeCezaOrani: 0.0005,
      maksimumGecikmeCezaOrani: 0.3,
      standartKdvOrani: 0.2,
      indirimliKdvOrani1: 0.1,
      indirimliKdvOrani2: 0.01,
      gelirVergisiStopajHizmet: 0.03,
      gelirVergisiStopajKira: 0.2,
      gelirVergisiStopajSerbestMeslek: 0.2
    },
    kdvTevkifatTurleri: KDV_TEVKIFAT_KATALOGU
  }
}

/**
 * Belirli bir yıla ait mevzuat parametrelerini döndürür.
 * İlgili yıl tanımlı değilse en yakın/güncel yılı esas alır.
 */
export function getMevzuatParametreleri(yil: number = new Date().getFullYear()): ParametreYili {
  if (MEVZUAT_PARAMETRELERI_TABLOSU[yil]) {
    return MEVZUAT_PARAMETRELERI_TABLOSU[yil]
  }

  const availableYears = Object.keys(MEVZUAT_PARAMETRELERI_TABLOSU)
    .map(Number)
    .sort((a, b) => b - a)

  // Aranan yıldan küçük eşit en yakın yılı bul, yoksa en güncel olanı ver
  const matchedYear = availableYears.find((y) => y <= yil) || availableYears[0]
  return MEVZUAT_PARAMETRELERI_TABLOSU[matchedYear]
}

/**
 * Belirli bir yıla ait Eşik Değerleri döndürür.
 */
export function getEsikDegerler(yil: number = new Date().getFullYear()): EsikDegerler {
  return getMevzuatParametreleri(yil).esikDegerler
}

/**
 * Belirli bir yıla ait Vergi ve Kesinti Oranlarını döndürür.
 */
export function getVergiOranlari(yil: number = new Date().getFullYear()): VergiVeKesintiOranlari {
  return getMevzuatParametreleri(yil).vergiVeKesintiler
}

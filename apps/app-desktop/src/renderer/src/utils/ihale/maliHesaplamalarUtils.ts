/**
 * TEMİN 360 - MALİ HESAPLAMA YARDIMCILARI & VERGİ/KESİNTİ MOTORU
 *
 * 1. Çift yönlü Vergi ve Kesinti Hesaplayıcı (Brüt <-> Net)
 * 2. KDV ve Kısmi Tevkifat Hesaplayıcı
 * 3. Gecikme Cezası ve Faiz Hesaplayıcı (Üst sınır kontrolü dahil)
 * 4. Teminat Hesapları (Geçici, Kesin, Ek Kesin)
 * 5. Avans ve Hakediş Mahsubu
 * 6. Ödeme Emri Özeti ve Denetim Hesap Açıklayıcısı
 */

import { getVergiOranlari, getEsikDegerler, KDV_TEVKIFAT_KATALOGU } from './parametreDeposu'
import { roundKurus, formatTL } from './paraVeYuvarlamaUtils'

export interface VergiHesaplamaInput {
  tutar: number // Hesaplamaya esas tutar
  tutarTipi: 'BRUT' | 'NET_ODENECEK' | 'KDV_HARIC'
  yil?: number
  kdvOrani?: number // Örn: 0.20 (%20)
  tevkifatKodu?: string // Örn: 'YAPIM_ISLERI' (4/10), 'TEMIZLIK_HIZMETLERI' (9/10), 'DURUMSUZ'
  damgaVergisiOrani?: number // Örn: 0.00948 (Binde 9.48)
  stopajOrani?: number // Örn: 0.03 veya 0.00
  kikPayiUygula?: boolean
}

export interface VergiHesaplamaSonucu {
  kdvHaricTutar: number
  kdvOrani: number
  hesaplananKdv: number
  tevkifatOrani: number // Pay / Payda
  tevkifatTutari: number // Alıcı (İdare) tarafından tevkif edilen KDV
  saticiyaOdenecekKdv: number // Yükleniciye ödenecek kalan KDV
  damgaVergisiTutari: number
  stopajTutari: number
  kikPayiTutari: number
  toplamKesintiler: number
  brutHakedisTutari: number // KDV Hariç Tutar + KDV (veya KDV Hariç Brüt)
  netOdenecekTutar: number // Yüklenici banka hesabına yatacak net tutar
  aciklamaDizisi: string[]
}

/**
 * Brüt veya Net tutardan yola çıkarak tüm KDV, Tevkifat, Damga Vergisi, Stopaj ve KİK Payını hesaplar.
 */
export function hesaplaMaliKesintiler(input: VergiHesaplamaInput): VergiHesaplamaSonucu {
  const yil = input.yil || new Date().getFullYear()
  const vergiOranlari = getVergiOranlari(yil)
  const esikDegerler = getEsikDegerler(yil)

  const kdvOrani = input.kdvOrani !== undefined ? input.kdvOrani : vergiOranlari.standartKdvOrani
  const damgaOrani =
    input.damgaVergisiOrani !== undefined
      ? input.damgaVergisiOrani
      : vergiOranlari.damgaVergisiHakedis
  const stopajOrani = input.stopajOrani !== undefined ? input.stopajOrani : 0.0

  // Tevkifat oranını bul
  let tevkifatOrani = 0.0
  let tevkifatAdi = 'Tevkifatsız'
  if (input.tevkifatKodu) {
    const matched = KDV_TEVKIFAT_KATALOGU.find((t) => t.kod === input.tevkifatKodu)
    if (matched) {
      tevkifatOrani = matched.oran
      tevkifatAdi = `${matched.pay}/${matched.payda} ${matched.ad}`
    }
  }

  let kdvHaric = 0

  if (input.tutarTipi === 'KDV_HARIC') {
    kdvHaric = input.tutar
  } else if (input.tutarTipi === 'BRUT') {
    // KDV Dahil Brüt tutardan KDV Hariç bulma
    kdvHaric = input.tutar / (1 + kdvOrani)
  } else {
    // NET_ODENECEK tutardan geriye doğru KDV Hariç tutarı bulma formülü:
    // Net = kdvHaric + (kdvHaric * kdvOrani * (1 - tevkifatOrani)) - (kdvHaric * damgaOrani) - (kdvHaric * stopajOrani) - kikPayi
    // Net = kdvHaric * [1 + kdvOrani*(1-tevkifatOrani) - damgaOrani - stopajOrani]
    const carpan = 1 + kdvOrani * (1 - tevkifatOrani) - damgaOrani - stopajOrani
    kdvHaric = carpan > 0 ? input.tutar / carpan : input.tutar
  }

  kdvHaric = roundKurus(kdvHaric)

  // Kesinti ve Vergi Kalemleri
  const hesaplananKdv = roundKurus(kdvHaric * kdvOrani)
  const tevkifatTutari = roundKurus(hesaplananKdv * tevkifatOrani)
  const saticiyaOdenecekKdv = roundKurus(hesaplananKdv - tevkifatTutari)
  const damgaVergisiTutari = roundKurus(kdvHaric * damgaOrani)
  const stopajTutari = roundKurus(kdvHaric * stopajOrani)

  let kikPayiTutari = 0
  if (input.kikPayiUygula && kdvHaric >= esikDegerler.kikPayiEsikTutari) {
    kikPayiTutari = roundKurus(kdvHaric * esikDegerler.kikPayiOrani)
  }

  // Toplam idarece yapılan kesintiler (Damga + Stopaj + KİK Payı + Tevkif edilen KDV)
  const toplamKesintiler = roundKurus(
    tevkifatTutari + damgaVergisiTutari + stopajTutari + kikPayiTutari
  )

  // Yükleniciye ödenecek net tutar: KDV Hariç + Yüklenici KDV Payı - Damga - Stopaj - KİK Payı
  const netOdenecekTutar = roundKurus(
    kdvHaric + saticiyaOdenecekKdv - damgaVergisiTutari - stopajTutari - kikPayiTutari
  )
  const brutHakedisTutari = roundKurus(kdvHaric + hesaplananKdv)

  // Denetim ve hesap açıklama maddeleri
  const aciklamalar: string[] = [
    `KDV Hariç Tutar: ${formatTL(kdvHaric)}`,
    `Hesaplanan KDV (%${kdvOrani * 100}): ${formatTL(hesaplananKdv)}`,
    tevkifatOrani > 0
      ? `KDV Tevkifatı (${tevkifatAdi}): ${formatTL(tevkifatTutari)} (İdarece 2 No'lu KDV ile beyan edilir)`
      : 'KDV Tevkifatı uygulanmamıştır.',
    `Damga Vergisi (Binde ${(damgaOrani * 1000).toFixed(2)}): ${formatTL(damgaVergisiTutari)}`,
    stopajOrani > 0
      ? `Gelir/Kurumlar Stopajı (%${stopajOrani * 100}): ${formatTL(stopajTutari)}`
      : 'Stopaj kesintisi yoktur.',
    kikPayiTutari > 0
      ? `KİK Payı Kesintisi (Onbinde 5): ${formatTL(kikPayiTutari)}`
      : 'KİK payı eşiği altında veya uygulanmadı.',
    `Net Ödenecek Tutar: ${formatTL(netOdenecekTutar)}`
  ]

  return {
    kdvHaricTutar: kdvHaric,
    kdvOrani,
    hesaplananKdv,
    tevkifatOrani,
    tevkifatTutari,
    saticiyaOdenecekKdv,
    damgaVergisiTutari,
    stopajTutari,
    kikPayiTutari,
    toplamKesintiler,
    brutHakedisTutari,
    netOdenecekTutar,
    aciklamaDizisi: aciklamalar
  }
}

/**
 * GECİKME CEZASI VE FAİZ HESAPLAYICI
 */
export interface GecikmeCezasiInput {
  sozlesmeBedeli: number
  gecikilenGunSayisi: number
  gunlukCezaOrani?: number // Standart: 0.0005 (Binde 0.5) veya 0.001 (Binde 1)
  tavanOrani?: number // Standart: 0.30 (%30)
  yil?: number
}

export interface GecikmeCezasiSonucu {
  gunlukCezaTutari: number
  hesaplananToplamCeza: number
  uygulananToplamCeza: number
  tavanCezaTutari: number
  tavanAsildiMi: boolean
  kesintiSonrasiKalanSozlesme: number
  aciklama: string
}

export function hesaplaGecikmeCezasi(input: GecikmeCezasiInput): GecikmeCezasiSonucu {
  const yil = input.yil || new Date().getFullYear()
  const vergiOranlari = getVergiOranlari(yil)

  const gunlukOran = input.gunlukCezaOrani ?? vergiOranlari.standartGunlukGecikmeCezaOrani
  const tavanOran = input.tavanOrani ?? vergiOranlari.maksimumGecikmeCezaOrani

  const gunlukCezaTutari = roundKurus(input.sozlesmeBedeli * gunlukOran)
  const hesaplananToplamCeza = roundKurus(gunlukCezaTutari * Math.max(0, input.gecikilenGunSayisi))
  const tavanCezaTutari = roundKurus(input.sozlesmeBedeli * tavanOran)

  const tavanAsildiMi = hesaplananToplamCeza > tavanCezaTutari
  const uygulananToplamCeza = tavanAsildiMi ? tavanCezaTutari : hesaplananToplamCeza
  const kesintiSonrasiKalan = roundKurus(input.sozlesmeBedeli - uygulananToplamCeza)

  const aciklama = `${input.gecikilenGunSayisi} gün gecikme için günlük binde ${(gunlukOran * 1000).toFixed(2)} (${formatTL(gunlukCezaTutari)}) üzerinden hesaplanmıştır.${tavanAsildiMi ? ` (Yasal %${tavanOran * 100} tavan sınırı uygulandı)` : ''}`

  return {
    gunlukCezaTutari,
    hesaplananToplamCeza,
    uygulananToplamCeza,
    tavanCezaTutari,
    tavanAsildiMi,
    kesintiSonrasiKalanSozlesme: kesintiSonrasiKalan,
    aciklama
  }
}

/**
 * TEMİNAT HESAPLAYICI (Geçici, Kesin, Ek Kesin Teminat)
 */
export interface TeminatHesabiSonucu {
  geciciTeminatMinTutar: number // Teklifin en az %3'ü
  kesinTeminatTutar: number // İhale bedelinin %6'sı
  ekKesinTeminatTutar: number // Fiyat farkı veya iş artışı durumunda %6
  aciklama: string
}

export function hesaplaTeminatlar(
  teklifVeyaIhaleBedeli: number,
  yil: number = new Date().getFullYear()
): TeminatHesabiSonucu {
  const vergiOranlari = getVergiOranlari(yil)
  const geciciMin = roundKurus(teklifVeyaIhaleBedeli * vergiOranlari.geciciTeminatMinOran)
  const kesin = roundKurus(teklifVeyaIhaleBedeli * vergiOranlari.kesinTeminatOran)
  const ekKesin = roundKurus(teklifVeyaIhaleBedeli * vergiOranlari.ekKesinTeminatOran)

  return {
    geciciTeminatMinTutar: geciciMin,
    kesinTeminatTutar: kesin,
    ekKesinTeminatTutar: ekKesin,
    aciklama: `4734 Sayılı Kanun gereğince: Geçici Teminat (En az %3): ${formatTL(geciciMin)}, Kesin Teminat (%6): ${formatTL(kesin)}`
  }
}

/**
 * AVANS VE MAHSUP HESAPLAYICI
 */
export interface AvansMahsupInput {
  toplamVerilenAvans: number
  oncekiMahsuplarToplami: number
  buHakedisTutari: number
  mahsupOrani?: number // Genellikle %10 - %20
}

export interface AvansMahsupSonucu {
  buHakedistenKesilecekAvans: number
  toplamMahsupEdilen: number
  kalanAvans: number
  avansTamamiKapandiMi: boolean
}

export function hesaplaAvansMahsubu(input: AvansMahsupInput): AvansMahsupSonucu {
  const mahsupOrani = input.mahsupOrani ?? 0.15 // Varsayılan %15 mahsup oranı
  const kalanOncekiAvans = Math.max(0, input.toplamVerilenAvans - input.oncekiMahsuplarToplami)

  let buHakedisMahsup = roundKurus(input.buHakedisTutari * mahsupOrani)
  if (buHakedisMahsup > kalanOncekiAvans) {
    buHakedisMahsup = kalanOncekiAvans
  }

  const toplamMahsup = roundKurus(input.oncekiMahsuplarToplami + buHakedisMahsup)
  const kalanAvans = roundKurus(input.toplamVerilenAvans - toplamMahsup)

  return {
    buHakedistenKesilecekAvans: buHakedisMahsup,
    toplamMahsupEdilen: toplamMahsup,
    kalanAvans,
    avansTamamiKapandiMi: kalanAvans <= 0
  }
}

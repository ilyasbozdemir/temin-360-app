/**
 * TEMİN 360 - YAKLAŞIK MALİYET, TEKLİF KARŞILAŞTIRMA VE SINIR DEĞER HESAPLAYICI
 *
 * 1. Piyasa Teklif İstatistikleri (Aritmetik Ortalama, Medyan, Min, Max)
 * 2. Yaklaşık Maliyet Belirleme Motoru
 * 3. 4734 Aşırı Düşük Teklif Sınır Değer Hesabı (R ve N Katsayıları)
 * 4. En Avantajlı Fiyat ve Fiyat Karşılaştırma Cetveli
 */

import { roundKurus, formatTL } from './paraVeYuvarlamaUtils'

export interface TeklifKalemi {
  firmaId?: string
  firmaAdi: string
  teklifTutari: number
  gecerliMi?: boolean
}

export interface TeklifAnalizSonucu {
  teklifSayisi: number
  gecerliTeklifSayisi: number
  toplamTutar: number
  aritmetikOrtalama: number
  medyanTutar: number
  enDusukTeklif: TeklifKalemi | null
  enYuksekTeklif: TeklifKalemi | null
  yaklasikMaliyetOnerisi: number
  sinirDegerTutari: number // Aşırı düşük teklif sorgulama sınır değeri
  asiriDusukTeklifler: TeklifKalemi[]
  aciklamaDizisi: string[]
}

/**
 * Sayı dizisinin medyanını (ortanca değerini) hesaplar.
 */
export function hesaplaMedyan(numbers: number[]): number {
  if (numbers.length === 0) return 0
  const sorted = [...numbers].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2.0
  }
  return sorted[middle]
}

/**
 * Piyasa tekliflerini analiz eder, yaklaşık maliyeti ve aşırı düşük teklif sınır değerini hesaplar.
 * @param teklifler - Firma teklif listesi
 * @param rKatsayisi - KİK Aşırı Düşük Sınır Değer Katsayısı (Genellikle Hizmette 0.75 - 0.80, Yapımda 0.85, Malda 0.80)
 */
export function analizEtPiyasaTeklifleri(
  teklifler: TeklifKalemi[],
  rKatsayisi: number = 0.8
): TeklifAnalizSonucu {
  const gecerliler = teklifler.filter((t) => t.gecerliMi !== false && t.teklifTutari > 0)

  if (gecerliler.length === 0) {
    return {
      teklifSayisi: teklifler.length,
      gecerliTeklifSayisi: 0,
      toplamTutar: 0,
      aritmetikOrtalama: 0,
      medyanTutar: 0,
      enDusukTeklif: null,
      enYuksekTeklif: null,
      yaklasikMaliyetOnerisi: 0,
      sinirDegerTutari: 0,
      asiriDusukTeklifler: [],
      aciklamaDizisi: ['Geçerli teklif bulunamadı.']
    }
  }

  const sortedByPrice = [...gecerliler].sort((a, b) => a.teklifTutari - b.teklifTutari)
  const tutarlar = gecerliler.map((t) => t.teklifTutari)

  const toplam = tutarlar.reduce((acc, curr) => acc + curr, 0)
  const ortalama = roundKurus(toplam / gecerliler.length)
  const medyan = roundKurus(hesaplaMedyan(tutarlar))
  const enDusuk = sortedByPrice[0]
  const enYuksek = sortedByPrice[sortedByPrice.length - 1]

  // Yaklaşık maliyet önerisi (standart aritmetik ortalama)
  const yaklasikMaliyet = ortalama

  // Aşırı düşük teklif sınır değeri hesabı (SD = YM * R)
  const sinirDeger = roundKurus(yaklasikMaliyet * rKatsayisi)
  const asiriDusukler = gecerliler.filter((t) => t.teklifTutari < sinirDeger)

  const aciklamalar: string[] = [
    `Toplam ${gecerliler.length} geçerli teklif değerlendirildi.`,
    `Aritmetik Ortalama: ${formatTL(ortalama)}, Medyan (Ortanca): ${formatTL(medyan)}`,
    `En Düşük Teklif: ${enDusuk.firmaAdi} (${formatTL(enDusuk.teklifTutari)})`,
    `En Yüksek Teklif: ${enYuksek.firmaAdi} (${formatTL(enYuksek.teklifTutari)})`,
    `Aşırı Düşük Sınır Değeri (R=${rKatsayisi}): ${formatTL(sinirDeger)}`,
    asiriDusukler.length > 0
      ? `${asiriDusukler.length} adet teklif sınır değerin altındadır (Açıklama istenmesi gerekebilir).`
      : 'Sınır değerin altında kalan aşırı düşük teklif bulunmamaktadır.'
  ]

  return {
    teklifSayisi: teklifler.length,
    gecerliTeklifSayisi: gecerliler.length,
    toplamTutar: roundKurus(toplam),
    aritmetikOrtalama: ortalama,
    medyanTutar: medyan,
    enDusukTeklif: enDusuk,
    enYuksekTeklif: enYuksek,
    yaklasikMaliyetOnerisi: yaklasikMaliyet,
    sinirDegerTutari: sinirDeger,
    asiriDusukTeklifler: asiriDusukler,
    aciklamaDizisi: aciklamalar
  }
}

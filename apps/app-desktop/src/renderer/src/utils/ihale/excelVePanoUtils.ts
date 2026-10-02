/**
 * TEMİN 360 - EXCEL VE PANO (CLIPBOARD) İÇE AKTARMA YARDIMCILARI
 *
 * Kullanıcının Excel veya Google E-Tablolar'dan kopyaladığı (Ctrl+C)
 * tablo verilerini (TSV / Tab-separated values) doğrudan analiz edip
 * yaklaşık maliyet, keşif cetveli veya malzeme listesi kalemlerine dönüştürür.
 */

import { parseTurkishFloat } from './paraVeYuvarlamaUtils'

export interface AyrismisTabloKalemi {
  siraNo?: number
  pozNo?: string
  aciklama: string
  miktar: number
  olcuBirimi: string
  birimFiyat: number
  toplamTutar: number
  kategori?: string
}

export interface PanoTabloSonucu {
  basariliMi: boolean
  toplamSatir: number
  gecerliKalemSayisi: number
  kalemler: AyrismisTabloKalemi[]
  genelToplam: number
  hataliSatirlar: { satirNo: number; hamMetin: string; hata: string }[]
}

/**
 * Excel'den kopyalanan metni (Tab veya Noktalı Virgülle ayrılmış) analiz eder.
 */
export function ayrıştırPanoTablosu(hamMetin: string): PanoTabloSonucu {
  if (!hamMetin || !hamMetin.trim()) {
    return {
      basariliMi: false,
      toplamSatir: 0,
      gecerliKalemSayisi: 0,
      kalemler: [],
      genelToplam: 0,
      hataliSatirlar: []
    }
  }

  const satirlar = hamMetin.split(/\r?\n/).filter((s) => s.trim().length > 0)
  const kalemler: AyrismisTabloKalemi[] = []
  const hataliSatirlar: { satirNo: number; hamMetin: string; hata: string }[] = []
  let genelToplam = 0

  satirlar.forEach((satir, index) => {
    // Tab (\t) veya noktalı virgül (;) veya virgül ayrıştırma
    let sutunlar = satir.split('\t')
    if (sutunlar.length === 1 && satir.includes(';')) {
      sutunlar = satir.split(';')
    }

    // Başlık satırı kontrolü (Sıra, Poz, Açıklama, Miktar gibi kelimeler içeriyorsa atla)
    const ilkSutun = sutunlar[0].toLowerCase().trim()
    if (
      ilkSutun.includes('sıra') ||
      ilkSutun.includes('sira') ||
      ilkSutun.includes('poz') ||
      ilkSutun.includes('malzeme') ||
      ilkSutun.includes('açıklama')
    ) {
      return // Başlık satırı
    }

    // Sütun eşleştirme mantığı:
    // Senaryo A (6+ Sütun): SıraNo | PozNo | Malzeme/Açıklama | Miktar | Birim | BirimFiyat
    // Senaryo B (5 Sütun): SıraNo | Malzeme/Açıklama | Miktar | Birim | BirimFiyat
    // Senaryo C (4 Sütun): Malzeme/Açıklama | Miktar | Birim | BirimFiyat
    // Senaryo D (3 Sütun): Malzeme/Açıklama | Miktar | Birim

    let pozNo = ''
    let aciklama = ''
    let miktar = 1
    let birim = 'Adet'
    let birimFiyat = 0

    if (sutunlar.length >= 6) {
      pozNo = sutunlar[1].trim()
      aciklama = sutunlar[2].trim()
      miktar = parseTurkishFloat(sutunlar[3]) || 1
      birim = sutunlar[4].trim() || 'Adet'
      birimFiyat = parseTurkishFloat(sutunlar[5]) || 0
    } else if (sutunlar.length === 5) {
      aciklama = sutunlar[1].trim()
      miktar = parseTurkishFloat(sutunlar[2]) || 1
      birim = sutunlar[3].trim() || 'Adet'
      birimFiyat = parseTurkishFloat(sutunlar[4]) || 0
    } else if (sutunlar.length === 4) {
      aciklama = sutunlar[0].trim()
      miktar = parseTurkishFloat(sutunlar[1]) || 1
      birim = sutunlar[2].trim() || 'Adet'
      birimFiyat = parseTurkishFloat(sutunlar[3]) || 0
    } else if (sutunlar.length === 3) {
      aciklama = sutunlar[0].trim()
      miktar = parseTurkishFloat(sutunlar[1]) || 1
      birim = sutunlar[2].trim() || 'Adet'
    } else if (sutunlar.length === 2) {
      aciklama = sutunlar[0].trim()
      miktar = parseTurkishFloat(sutunlar[1]) || 1
    } else {
      aciklama = sutunlar[0].trim()
    }

    if (!aciklama) {
      hataliSatirlar.push({
        satirNo: index + 1,
        hamMetin: satir,
        hata: 'Açıklama / Malzeme adı bulunamadı'
      })
      return
    }

    const toplamTutar = miktar * birimFiyat
    genelToplam += toplamTutar

    kalemler.push({
      siraNo: kalemler.length + 1,
      pozNo: pozNo || undefined,
      aciklama,
      miktar,
      olcuBirimi: birim,
      birimFiyat,
      toplamTutar
    })
  })

  return {
    basariliMi: kalemler.length > 0,
    toplamSatir: satirlar.length,
    gecerliKalemSayisi: kalemler.length,
    kalemler,
    genelToplam,
    hataliSatirlar
  }
}

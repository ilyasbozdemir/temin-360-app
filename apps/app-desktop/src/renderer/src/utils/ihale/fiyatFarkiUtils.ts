/**
 * TEMİN 360 - FİYAT FARKI HESAPLAMA MOTORU (TÜİK Yİ-ÜFE & FORMÜL YARDIMCISI)
 *
 * 4734 Sayılı Kanuna Göre İhale Edilen İşlerde Uygulanacak
 * Fiyat Farkı Esasları (Bakanlar Kurulu Kararı) Formülleri:
 *
 * 1. Genel Fiyat Farkı Formülü: F = B * [ A * (In / Io - 1) ]
 * 2. Ağırlık Oranları ile Bileşik Fiyat Farkı Formülü (Pn - 1)
 */

import { roundKurus, formatTL } from './paraVeYuvarlamaUtils'

export interface FiyatFarkiInput {
  hakedisTutariB: number // B: Fiyat farkı verilecek iş kalemi tutarı
  temelEndeksIo: number // Io: İhale/teklif tarihindeki temel endeks
  uygulamaEndeksiIn: number // In: Hakediş / uygulama ayındaki endeks
  katsayiA?: number // A: Fiyat farkı katsayısı (Varsayılan 0.90)
}

export interface FiyatFarkiSonucu {
  hakedisTutari: number
  fiyatFarkiTutariF: number
  artisOraniYuzde: number
  toplamHakedisBedeli: number
  aciklama: string
}

/**
 * Standart Genel Fiyat Farkı Formülü:
 * F = B * [ A * (In / Io - 1) ]
 */
export function hesaplaGenelFiyatFarki(input: FiyatFarkiInput): FiyatFarkiSonucu {
  const { hakedisTutariB, temelEndeksIo, uygulamaEndeksiIn, katsayiA = 0.9 } = input

  if (temelEndeksIo <= 0 || hakedisTutariB <= 0) {
    return {
      hakedisTutari: hakedisTutariB,
      fiyatFarkiTutariF: 0,
      artisOraniYuzde: 0,
      toplamHakedisBedeli: hakedisTutariB,
      aciklama: 'Geçersiz hakediş tutarı veya temel endeks değeri.'
    }
  }

  // Endeks artış oranı: (In / Io - 1)
  const endeksArtis = uygulamaEndeksiIn / temelEndeksIo - 1
  const fiyatFarki = roundKurus(hakedisTutariB * (katsayiA * endeksArtis))
  const toplamBedel = roundKurus(hakedisTutariB + fiyatFarki)
  const artisOraniYuzde = roundKurus(endeksArtis * 100)

  return {
    hakedisTutari: hakedisTutariB,
    fiyatFarkiTutariF: fiyatFarki,
    artisOraniYuzde,
    toplamHakedisBedeli: toplamBedel,
    aciklama: `Temel Endeks (${temelEndeksIo}) ve Uygulama Endeksi (${uygulamaEndeksiIn}) üzerinden %${artisOraniYuzde} endeks farkı tespit edilmiş, A=${katsayiA} katsayısı ile ${formatTL(fiyatFarki)} fiyat farkı hesaplanmıştır.`
  }
}

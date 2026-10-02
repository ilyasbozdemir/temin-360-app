/**
 * TEMİN 360 - ALAN, ÖLÇÜ VE GEOMETRİ YARDIMCILARI
 *
 * 1. Köşe Koordinatlarından Parsel/Zemin Alanı (Gauss / Shoelace Formülü)
 * 2. Birim Dönüştürücüler (m², Dönüm/Dekar, Hektar, Ar; m, km; m³, Litre; Ton, kg)
 * 3. İmar Göstergeleri (TAKS, KAKS/Emsal, Maksimum İnşaat Alanı)
 * 4. Bağımsız Bölüm Arsa Payı Hesaplayıcı
 */

import { roundToPrecision } from './paraVeYuvarlamaUtils'

export interface Point2D {
  x: number // Doğu / X (Metre)
  y: number // Kuzey / Y (Metre)
}

/**
 * Köşe koordinatları verilen 2D çokgenin (parsel/zemin) alanını Gauss (Shoelace) formülüyle hesaplar.
 * @param points - Sıralı köşe koordinatları dizisi
 * @returns Metrekare (m²) cinsinden alan
 */
export function hesaplaCokgenAlani(points: Point2D[]): number {
  if (!points || points.length < 3) return 0

  let area = 0
  const n = points.length

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    area += points[i].x * points[j].y
    area -= points[j].x * points[i].y
  }

  return roundToPrecision(Math.abs(area) / 2.0, 2)
}

/**
 * ALAN BİRİM DÖNÜŞTÜRÜCÜSÜ
 */
export type AlanBirimi = 'm2' | 'donum' | 'hektar' | 'ar'

export function donusturAlan(
  deger: number,
  kaynakBirim: AlanBirimi,
  hedefBirim: AlanBirimi
): number {
  if (isNaN(deger) || deger === 0) return 0

  // Önce m²'ye çevir
  let m2 = deger
  switch (kaynakBirim) {
    case 'donum':
      m2 = deger * 1000 // 1 Dönüm/Dekar = 1000 m²
      break
    case 'hektar':
      m2 = deger * 10000 // 1 Hektar = 10.000 m²
      break
    case 'ar':
      m2 = deger * 100 // 1 Ar = 100 m²
      break
    case 'm2':
    default:
      m2 = deger
      break
  }

  // m²'den hedef birime çevir
  switch (hedefBirim) {
    case 'donum':
      return roundToPrecision(m2 / 1000, 4)
    case 'hektar':
      return roundToPrecision(m2 / 10000, 4)
    case 'ar':
      return roundToPrecision(m2 / 100, 4)
    case 'm2':
    default:
      return roundToPrecision(m2, 2)
  }
}

/**
 * HACİM VE AĞIRLIK BİRİM DÖNÜŞTÜRÜCÜSÜ
 */
export function donusturHacim(
  deger: number,
  kaynak: 'm3' | 'litre',
  hedef: 'm3' | 'litre'
): number {
  if (kaynak === hedef) return deger
  if (kaynak === 'm3' && hedef === 'litre') return roundToPrecision(deger * 1000, 2)
  return roundToPrecision(deger / 1000, 4)
}

export function donusturAgirlik(deger: number, kaynak: 'ton' | 'kg', hedef: 'ton' | 'kg'): number {
  if (kaynak === hedef) return deger
  if (kaynak === 'ton' && hedef === 'kg') return roundToPrecision(deger * 1000, 2)
  return roundToPrecision(deger / 1000, 4)
}

/**
 * İMAR GÖSTERGELERİ VE EMSAL HESAPLAYICI
 */
export interface ImarHesabiInput {
  arsaAlaniM2: number
  taks?: number // Taban Alanı Katsayısı (Örn: 0.30)
  kaks?: number // Kat Alanı Katsayısı / Emsal (Örn: 1.50)
  katAdedi?: number
}

export interface ImarHesabiSonucu {
  tabanAlaniM2: number // Maksimum oturum alanı
  toplamInsaatAlaniM2: number // Emsale esas toplam inşaat alanı
  bahceAlaniM2: number // Kalan açık bahçe alanı
  aciklama: string
}

export function hesaplaImarGostergeleri(input: ImarHesabiInput): ImarHesabiSonucu {
  const arsa = Math.max(0, input.arsaAlaniM2)
  const taks = input.taks ?? 0.3
  const kaks = input.kaks ?? 1.5

  const tabanAlani = roundToPrecision(arsa * taks, 2)
  const toplamInsaatAlani = roundToPrecision(arsa * kaks, 2)
  const bahceAlani = roundToPrecision(Math.max(0, arsa - tabanAlani), 2)

  return {
    tabanAlaniM2: tabanAlani,
    toplamInsaatAlaniM2: toplamInsaatAlani,
    bahceAlaniM2: bahceAlani,
    aciklama: `${arsa.toLocaleString('tr-TR')} m² arsa üzerinde TAKS: ${taks} ile taban oturumu ${tabanAlani.toLocaleString('tr-TR')} m², KAKS (Emsal): ${kaks} ile toplam emsal inşaat alanı ${toplamInsaatAlani.toLocaleString('tr-TR')} m² olarak hesaplanmıştır.`
  }
}

/**
 * BAĞIMSIZ BÖLÜM ARSA PAYI HESAPLAYICI
 */
export function hesaplaArsaPayi(
  bagimsizBolumAlaniM2: number,
  toplamProjeAlaniM2: number,
  toplamPayda: number = 1000
): { pay: number; payda: number; oran: number; aciklama: string } {
  if (toplamProjeAlaniM2 <= 0 || bagimsizBolumAlaniM2 <= 0) {
    return { pay: 0, payda: toplamPayda, oran: 0, aciklama: 'Geçersiz alan değerleri' }
  }

  const oran = bagimsizBolumAlaniM2 / toplamProjeAlaniM2
  const pay = Math.round(oran * toplamPayda)

  return {
    pay,
    payda: toplamPayda,
    oran: roundToPrecision(oran * 100, 2),
    aciklama: `${bagimsizBolumAlaniM2} m² / ${toplamProjeAlaniM2} m² oranına karşılık gelen arsa payı: ${pay}/${toplamPayda} (%${(oran * 100).toFixed(2)})`
  }
}

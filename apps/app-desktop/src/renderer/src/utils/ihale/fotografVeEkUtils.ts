/**
 * TEMİN 360 - FOTOĞRAF, ŞANTİYE VE TESPİT EKİ YÖNETİM YARDIMCILARI
 *
 * Şantiye ilerlemesi, saha keşfi, muayene-kabul ve kaçak yapı tutanakları için
 * fotoğrafların GPS koordinatı, çekim tarihi, çeken personel ve dosya ile
 * ilişkilendirilmesini ve metadata yönetimini sağlar.
 */

import { GpsKonum, formatGpsDMS } from './haritaVeKonumUtils'

export type TespitFotografiTuru =
  | 'KESIF'
  | 'SANTIYE_ILERLEMESI'
  | 'MUAYENE_KABUL'
  | 'KACAK_YAPI_TESPITI'
  | 'HASAR_TESPITI'
  | 'TESLIMAT'
  | 'DIGER'

export interface DosyaFotografiMetadata {
  id: string
  dosyaId?: string | number
  dosyaNo?: string
  baslik: string
  aciklama?: string
  tur: TespitFotografiTuru
  dosyaYolu?: string
  veriUrl?: string // Base64 veya blob URL
  cekimTarihi: string // ISO date string
  cekenPersonelAdSoyad?: string
  konum?: GpsKonum
  etiketler?: string[]
}

/**
 * Fotoğraf türünün kullanıcı dostu Türkçe etiketini döndürür.
 */
export function getFotografTuruEtiketi(tur: TespitFotografiTuru): { etiket: string; renk: string } {
  switch (tur) {
    case 'KESIF':
      return { etiket: 'Saha Keşfi', renk: 'blue' }
    case 'SANTIYE_ILERLEMESI':
      return { etiket: 'Şantiye İlerlemesi', renk: 'amber' }
    case 'MUAYENE_KABUL':
      return { etiket: 'Muayene & Kabul', renk: 'emerald' }
    case 'KACAK_YAPI_TESPITI':
      return { etiket: 'Kaçak Yapı / İmar Tespiti', renk: 'rose' }
    case 'HASAR_TESPITI':
      return { etiket: 'Hasar Tespiti', renk: 'purple' }
    case 'TESLIMAT':
      return { etiket: 'Mal/İş Teslimatı', renk: 'indigo' }
    default:
      return { etiket: 'Genel Tespit', renk: 'slate' }
  }
}

/**
 * Fotoğraf metadata özet kartı metnini üretir.
 */
export function formatFotoMetadataOzeti(foto: DosyaFotografiMetadata): string {
  const formatTarih = new Date(foto.cekimTarihi).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  const { etiket } = getFotografTuruEtiketi(foto.tur)

  const satirlar = [
    `Tür: ${etiket}`,
    `Tarih: ${formatTarih}`,
    foto.cekenPersonelAdSoyad ? `Personel: ${foto.cekenPersonelAdSoyad}` : '',
    foto.konum ? `Konum: ${formatGpsDMS(foto.konum.enlem, foto.konum.boylam)}` : '',
    foto.aciklama ? `Not: ${foto.aciklama}` : ''
  ].filter(Boolean)

  return satirlar.join(' | ')
}

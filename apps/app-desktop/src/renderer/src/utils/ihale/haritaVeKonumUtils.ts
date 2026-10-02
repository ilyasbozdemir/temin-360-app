/**
 * TEMİN 360 - HARİTA, PARSEL VE COĞRAFİ KONUM YARDIMCILARI
 *
 * 1. OpenStreetMap ve Google Maps Harita Bağlantı URL'leri
 * 2. TKGM Parsel Sorgu Entegrasyon Linki Üretici (Ada/Parsel -> Resmi Harita)
 * 3. İki GPS Koordinatı Arası Kuş Uçuşu Mesafe Hesabı (Haversine Formülü)
 * 4. Koordinat Formatlayıcı (Ondalık Derece <-> Derece/Dakika/Saniye DMS)
 */

export interface GpsKonum {
  enlem: number // Latitude (Örn: 39.9255)
  boylam: number // Longitude (Örn: 32.8662)
  dogrulukMetre?: number // GPS sapma payı
  rakimMetre?: number // Yükseklik
}

export interface ParselBilgisi {
  il: string
  ilce: string
  mahalle?: string
  ada?: string | number
  parsel?: string | number
  pafta?: string
}

/**
 * OpenStreetMap haritasında koordinatı iğneleyen link üretir.
 */
export function uretOpenStreetMapUrl(lat: number, lng: number, zoom: number = 17): string {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=${zoom}/${lat}/${lng}`
}

/**
 * Google Maps haritasında koordinatı iğneleyen link üretir.
 */
export function uretGoogleMapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
}

/**
 * TKGM (Tapu ve Kadastro Genel Müdürlüğü) Parsel Sorgulama Portalı için arama linki üretir.
 */
export function uretTkgmParselSorguUrl(parsel: ParselBilgisi): string {
  const queryParts = [
    parsel.il,
    parsel.ilce,
    parsel.mahalle,
    parsel.ada ? `Ada: ${parsel.ada}` : '',
    parsel.parsel ? `Parsel: ${parsel.parsel}` : ''
  ]
    .filter(Boolean)
    .join(' ')

  return `https://parselsorgu.tkgm.gov.tr/#ara/idari/${encodeURIComponent(queryParts)}`
}

/**
 * İki GPS koordinatı arasındaki kuş uçuşu mesafeyi metre cinsinden hesaplar (Haversine Formülü).
 */
export function hesaplaGpsMesafeMetre(nokta1: GpsKonum, nokta2: GpsKonum): number {
  const R = 6371e3 // Dünya yarıçapı (metre)
  const phi1 = (nokta1.enlem * Math.PI) / 180
  const phi2 = (nokta2.enlem * Math.PI) / 180
  const deltaPhi = ((nokta2.enlem - nokta1.enlem) * Math.PI) / 180
  const deltaLambda = ((nokta2.boylam - nokta1.boylam) * Math.PI) / 180

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return Math.round(R * c)
}

/**
 * Koordinatı okunabilir derece/dakika/saniye (DMS) formatına çevirir.
 * Örn: 39° 55' 31.8" N, 32° 51' 58.3" E
 */
export function formatGpsDMS(enlem: number, boylam: number): string {
  const toDms = (deg: number, isLat: boolean) => {
    const absolute = Math.abs(deg)
    const degrees = Math.floor(absolute)
    const minutesNotTruncated = (absolute - degrees) * 60
    const minutes = Math.floor(minutesNotTruncated)
    const seconds = ((minutesNotTruncated - minutes) * 60).toFixed(1)

    const direction = isLat ? (deg >= 0 ? 'N' : 'S') : deg >= 0 ? 'E' : 'W'
    return `${degrees}° ${minutes}' ${seconds}" ${direction}`
  }

  return `${toDms(enlem, true)}, ${toDms(boylam, false)}`
}

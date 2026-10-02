/**
 * TEMİN 360 - AKILLI VARSAYILANLAR YARDIMCILARI (SMART DEFAULTS)
 *
 * Kullanıcının son kullandığı kurum, birim, imza yetkilisi, komisyon üyeleri
 * ve tercihleri hatırlar; yeni dosya açıldığında otomatik doldurur.
 */

export interface AkilliVarsayilanlar {
  sonKullanilanBirimId?: string
  sonKullanilanBirimAdi?: string
  sonHarcamaYetkilisiAdSoyad?: string
  sonHarcamaYetkilisiUnvan?: string
  sonGerceklestirmeGorevlisiAdSoyad?: string
  sonGerceklestirmeGorevlisiUnvan?: string
  sonKdvOrani?: number
  sonAlimTuru?: 'MAL' | 'HIZMET' | 'YAPIM'
}

const SMART_DEFAULTS_KEY = 'temin360_smart_defaults'

export function kaydetAkilliVarsayilanlar(degerler: Partial<AkilliVarsayilanlar>): void {
  try {
    const mevcut = okuAkilliVarsayilanlar()
    const guncel = { ...mevcut, ...degerler }
    localStorage.setItem(SMART_DEFAULTS_KEY, JSON.stringify(guncel))
  } catch {
    // Ignore
  }
}

export function okuAkilliVarsayilanlar(): AkilliVarsayilanlar {
  try {
    const raw = localStorage.getItem(SMART_DEFAULTS_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as AkilliVarsayilanlar
  } catch {
    return {}
  }
}

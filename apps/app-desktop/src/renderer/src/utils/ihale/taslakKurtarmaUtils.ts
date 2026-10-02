/**
 * TEMİN 360 - TASLAK OTOMATİK KAYIT VE KURTARMA YARDIMCILARI (CRASH RECOVERY)
 *
 * Elektrik kesintisi, tarayıcı/uygulama kapanması veya kaza durumlarında
 * formların ve evrak içeriklerinin kaybolmaması için yerel taslak mekanizması.
 */

export interface TaslakKaydi<T = any> {
  formAnahtari: string
  sonGuncelleme: string // ISO Date
  veri: T
  versiyon: number
}

const TASLAK_PREFIX = 'temin360_taslak_'

/**
 * Form verisini otomatik taslak olarak kaydeder.
 */
export function kaydetFormTaslagi<T>(formAnahtari: string, veri: T): void {
  try {
    const kayit: TaslakKaydi<T> = {
      formAnahtari,
      sonGuncelleme: new Date().toISOString(),
      veri,
      versiyon: 1
    }
    localStorage.setItem(`${TASLAK_PREFIX}${formAnahtari}`, JSON.stringify(kayit))
  } catch (err) {
    console.warn('Taslak kaydedilemedi:', err)
  }
}

/**
 * Kaydedilmiş taslak verisini okur.
 */
export function okuFormTaslagi<T>(formAnahtari: string): TaslakKaydi<T> | null {
  try {
    const raw = localStorage.getItem(`${TASLAK_PREFIX}${formAnahtari}`)
    if (!raw) return null
    return JSON.parse(raw) as TaslakKaydi<T>
  } catch {
    return null
  }
}

/**
 * İşlem tamamlandığında veya iptal edildiğinde taslağı siler.
 */
export function temizleFormTaslagi(formAnahtari: string): void {
  try {
    localStorage.removeItem(`${TASLAK_PREFIX}${formAnahtari}`)
  } catch {
    // Ignore
  }
}

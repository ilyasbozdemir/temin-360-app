import { DEFAULT_2886_DOSYALAR } from './teminSelector.constants'
import { Dosya2886Item, ProcurementMode } from './teminSelector.types'

export function getInitialProcurementMode(): ProcurementMode {
  return (localStorage.getItem('temin_procurement_mode') as ProcurementMode) || 'dogrudan_temin'
}

export function getInitial2886Dosyalar(): Dosya2886Item[] {
  try {
    const raw = localStorage.getItem('temin_2886_dosyalar_samples')
    if (raw !== null) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch (e) {
    console.warn('[teminSelector] 2886 dosya yükleme hatası:', e)
  }

  // Sadece localStorage'da anahtar hiç yoksa varsayılan listeyi kaydet
  try {
    localStorage.setItem('temin_2886_dosyalar_samples', JSON.stringify(DEFAULT_2886_DOSYALAR))
  } catch {}
  return DEFAULT_2886_DOSYALAR
}

export function persist2886Dosyalar(items: Dosya2886Item[]): void {
  try {
    localStorage.setItem('temin_2886_dosyalar_samples', JSON.stringify(items))
    window.dispatchEvent(new CustomEvent('devlet-ihale-2886-reloaded'))
  } catch (e) {
    console.error('[teminSelector] 2886 dosyalar kaydedilemedi:', e)
  }
}

export function getInitial2886ActiveDosya(): Dosya2886Item | null {
  try {
    const raw = localStorage.getItem('temin_2886_active_dosya')
    if (raw !== null) {
      if (raw === '' || raw === 'null' || raw === 'undefined') return null
      return JSON.parse(raw)
    }
  } catch {
    return null
  }
  const all = getInitial2886Dosyalar()
  return all.length > 0 ? all[0] : null
}

export function persist2886ActiveDosya(item: Dosya2886Item | null): void {
  try {
    if (item) {
      localStorage.setItem('temin_2886_active_dosya', JSON.stringify(item))
    } else {
      localStorage.removeItem('temin_2886_active_dosya')
    }
    window.dispatchEvent(new CustomEvent('devlet-ihale-2886-reloaded'))
  } catch {
    // ignore storage error
  }
}

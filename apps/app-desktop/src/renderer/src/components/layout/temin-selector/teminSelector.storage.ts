import { DEFAULT_2886_DOSYALAR } from './teminSelector.constants'
import { Dosya2886Item, ProcurementMode } from './teminSelector.types'

export function getInitialProcurementMode(): ProcurementMode {
  return (localStorage.getItem('temin_procurement_mode') as ProcurementMode) || 'dogrudan_temin'
}

export function getInitial2886Dosyalar(): Dosya2886Item[] {
  try {
    const raw = localStorage.getItem('temin_2886_dosyalar_samples')
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {
    return DEFAULT_2886_DOSYALAR
  }
  return DEFAULT_2886_DOSYALAR
}

export function getInitial2886ActiveDosya(): Dosya2886Item | null {
  try {
    const raw = localStorage.getItem('temin_2886_active_dosya')
    if (raw) return JSON.parse(raw)
  } catch {
    return DEFAULT_2886_DOSYALAR[0]
  }
  return DEFAULT_2886_DOSYALAR[0]
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

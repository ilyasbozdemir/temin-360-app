import { useState, useEffect, useCallback, useRef } from 'react'
import { ProcurementMode } from '../../temin-selector/teminSelector.types'

export interface UseProcurementModeReturn {
  procurementMode: ProcurementMode
  handleModeChange: (mode: ProcurementMode) => void
  isDt: boolean
  switchFeedback: string | null
}

export function useProcurementMode(): UseProcurementModeReturn {
  const [procurementMode, setProcurementMode] = useState<ProcurementMode>(() => {
    return (localStorage.getItem('temin_procurement_mode') as ProcurementMode) || 'dogrudan_temin'
  })
  const [switchFeedback, setSwitchFeedback] = useState<string | null>(null)
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isDt = procurementMode === 'dogrudan_temin'

  const handleModeChange = useCallback((mode: ProcurementMode): void => {
    setProcurementMode((prev) => {
      if (prev === mode) return prev
      localStorage.setItem('temin_procurement_mode', mode)
      window.dispatchEvent(new CustomEvent('procurement-mode-change', { detail: { mode } }))

      let message = 'Doğrudan Temin Modu (KİK Md. 22) Aktif'
      if (mode === 'ihale') {
        message = 'İhale Süreçleri Modu (KİK Md. 19 / 21) Aktif'
      } else if (mode === 'devlet_ihale_2886') {
        message = '2886 Devlet İhale Kanunu Modu (Satış & Kiralama) Aktif'
      }

      setSwitchFeedback(message)
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current)
      feedbackTimeoutRef.current = setTimeout(() => setSwitchFeedback(null), 2400)
      return mode
    })
  }, [])

  useEffect(() => {
    const handleModeEvent = (e: Event): void => {
      const customEvent = e as CustomEvent<{ mode: ProcurementMode }>
      if (customEvent.detail?.mode) setProcurementMode(customEvent.detail.mode)
    }
    window.addEventListener('procurement-mode-change', handleModeEvent)
    return () => {
      window.removeEventListener('procurement-mode-change', handleModeEvent)
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current)
    }
  }, [])

  return {
    procurementMode,
    handleModeChange,
    isDt,
    switchFeedback
  }
}

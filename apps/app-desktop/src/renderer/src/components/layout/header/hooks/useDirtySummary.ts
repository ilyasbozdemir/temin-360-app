import { useState, useCallback, useRef, useEffect, RefObject } from 'react'
import { DirtySummaryData } from '../header.types'
import { FALLBACK_DIRTY_SUMMARY } from '../header.constants'

export interface UseDirtySummaryReturn {
  isDirtySummaryOpen: boolean
  setIsDirtySummaryOpen: React.Dispatch<React.SetStateAction<boolean>>
  dirtySummary: DirtySummaryData | null
  isLoadingSummary: boolean
  toggleDirtySummary: () => void
  dirtySummaryRef: RefObject<HTMLDivElement | null>
}

export function useDirtySummary(): UseDirtySummaryReturn {
  const [isDirtySummaryOpen, setIsDirtySummaryOpen] = useState(false)
  const [dirtySummary, setDirtySummary] = useState<DirtySummaryData | null>(null)
  const [isLoadingSummary, setIsLoadingSummary] = useState(false)
  const dirtySummaryRef = useRef<HTMLDivElement>(null)

  const loadDirtySummary = useCallback(async (): Promise<void> => {
    try {
      setIsLoadingSummary(true)
      const res = await window.electron?.ipcRenderer.invoke('workspace:get-dirty-summary')
      if (res?.success) {
        setDirtySummary({
          totalChanges: res.totalChanges ?? 0,
          lastModifiedAt: res.lastModifiedAt ?? null,
          items: res.items ?? []
        })
      } else {
        setDirtySummary(FALLBACK_DIRTY_SUMMARY)
      }
    } catch {
      setDirtySummary(FALLBACK_DIRTY_SUMMARY)
    } finally {
      setIsLoadingSummary(false)
    }
  }, [])

  const toggleDirtySummary = useCallback((): void => {
    if (!isDirtySummaryOpen) {
      loadDirtySummary()
    }
    setIsDirtySummaryOpen((prev) => !prev)
  }, [isDirtySummaryOpen, loadDirtySummary])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (dirtySummaryRef.current && !dirtySummaryRef.current.contains(event.target as Node)) {
        setIsDirtySummaryOpen(false)
      }
    }
    if (isDirtySummaryOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isDirtySummaryOpen])

  return {
    isDirtySummaryOpen,
    setIsDirtySummaryOpen,
    dirtySummary,
    isLoadingSummary,
    toggleDirtySummary,
    dirtySummaryRef
  }
}

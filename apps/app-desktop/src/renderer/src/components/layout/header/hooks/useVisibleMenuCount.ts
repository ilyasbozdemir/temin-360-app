import { useState, useEffect } from 'react'
import { getBreakpointMenuCount } from '../header.constants'

export function useVisibleMenuCount(): number {
  const [maxVisibleMenus, setMaxVisibleMenus] = useState<number>(getBreakpointMenuCount)

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null
    const handleResize = (): void => {
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        const next = getBreakpointMenuCount()
        setMaxVisibleMenus((prev) => (prev !== next ? next : prev))
      }, 100)
    }

    window.addEventListener('resize', handleResize)
    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return maxVisibleMenus
}

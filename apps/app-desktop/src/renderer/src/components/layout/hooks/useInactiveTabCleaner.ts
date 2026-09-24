import { useEffect, useRef, useState } from 'react'
import { TabItem } from '../../../store/tabStore'

export interface InactiveTabCleanerState {
  expiredPaths: Record<string, boolean>
}

export function useInactiveTabCleaner(
  tabs: TabItem[],
  activeTabPath: string | null
): InactiveTabCleanerState {
  const lastActiveRef = useRef<Record<string, number>>({})
  const [expiredPaths, setExpiredPaths] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (activeTabPath) {
      lastActiveRef.current[activeTabPath] = Date.now()
      setExpiredPaths((prev) => {
        if (prev[activeTabPath]) {
          return { ...prev, [activeTabPath]: false }
        }
        return prev
      })
    }
  }, [activeTabPath])

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      setExpiredPaths((prev) => {
        const next: Record<string, boolean> = { ...prev }
        let changed = false
        for (const tab of tabs) {
          const isActive = tab.path === activeTabPath
          const lastActiveTime = lastActiveRef.current[tab.path] || now
          const isExpired = !isActive && tab.path !== '/' && now - lastActiveTime > 5 * 60 * 1000
          if (next[tab.path] !== isExpired) {
            next[tab.path] = isExpired
            changed = true
          }
        }
        return changed ? next : prev
      })
    }, 15000)
    return () => clearInterval(interval)
  }, [tabs, activeTabPath])

  return { expiredPaths }
}

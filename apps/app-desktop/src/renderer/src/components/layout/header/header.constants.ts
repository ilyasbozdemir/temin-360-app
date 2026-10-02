import { DirtySummaryData } from './header.types'

export const FALLBACK_DIRTY_SUMMARY: DirtySummaryData = {
  totalChanges: 1,
  lastModifiedAt: null,
  items: [
    {
      tableName: 'Veritabanı',
      title: 'Çalışma Dosyası Değişiklikleri',
      action: 'other',
      actionLabel: 'Düzenlendi',
      count: 1,
      lastTime: 'Az önce'
    }
  ]
}

export function getBreakpointMenuCount(): number {
  if (typeof window === 'undefined') return 3
  const w = window.innerWidth
  if (w >= 1520) return 7
  if (w >= 1340) return 5
  if (w >= 1180) return 4
  if (w >= 1020) return 3
  return 2
}

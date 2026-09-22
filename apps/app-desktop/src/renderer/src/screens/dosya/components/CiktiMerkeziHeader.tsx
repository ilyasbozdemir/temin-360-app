import React from 'react'
import { Layers, RefreshCw } from 'lucide-react'

interface CiktiMerkeziHeaderProps {
  selectedCount: number
  refreshing: boolean
  allExpanded: boolean
  onRefresh: () => void
  onToggleAllCategories: () => void
}

export function CiktiMerkeziHeader({
  selectedCount,
  refreshing,
  allExpanded,
  onRefresh,
  onToggleAllCategories
}: CiktiMerkeziHeaderProps): React.JSX.Element {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
        <Layers className="w-5 h-5 text-blue-500" />
        Dosya Belgeleri
      </h3>
      <div className="flex items-center gap-2">
        <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg text-slate-600 dark:text-slate-400 font-semibold">
          {selectedCount} Seçili
        </span>
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-blue-600 hover:border-blue-300 transition-all cursor-pointer"
          title="Hızlı Erişim listesini yenile"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
        <button
          onClick={onToggleAllCategories}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-blue-600 hover:border-blue-300 transition-all text-xs font-bold flex items-center gap-1 cursor-pointer"
          title="Tüm Grupları Aç / Kapat"
        >
          {allExpanded ? 'Hepsini Kapat' : 'Hepsini Aç'}
        </button>
      </div>
    </div>
  )
}

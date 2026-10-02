import React from 'react'
import { CheckCircle2, Trash2 } from 'lucide-react'

interface KabulBatchActionsBarProps {
  selectedCount: number
  onClearSelection: () => void
  onBulkApprove?: () => void
  onBulkDelete?: () => void
}

export function KabulBatchActionsBar({
  selectedCount,
  onClearSelection,
  onBulkApprove,
  onBulkDelete
}: KabulBatchActionsBarProps): React.JSX.Element | null {
  if (selectedCount === 0) return null

  return (
    <div className="flex items-center justify-between px-4 py-2.5 bg-blue-50 dark:bg-blue-950/40 border-b border-blue-200 dark:border-blue-900/60 animate-in fade-in duration-150">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold">
          {selectedCount}
        </span>
        <span className="text-xs font-semibold text-blue-900 dark:text-blue-200">
          tutanak seçildi
        </span>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={onClearSelection}
          className="px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          Seçimi Kaldır
        </button>
        {onBulkApprove && (
          <button
            type="button"
            onClick={onBulkApprove}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <CheckCircle2 size={13} />
            <span>Seçilenleri Onayla &amp; İşleme Al ({selectedCount})</span>
          </button>
        )}
        {onBulkDelete && (
          <button
            type="button"
            onClick={onBulkDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Trash2 size={13} />
            <span>Seçilenleri Sil ({selectedCount})</span>
          </button>
        )}
      </div>
    </div>
  )
}

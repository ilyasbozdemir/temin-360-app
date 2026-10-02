import React from 'react'
import { ChevronRight, FileSpreadsheet, Info } from 'lucide-react'
import { DirtySummaryItem as DirtySummaryItemType } from './header.types'
import {
  TABLE_DESCRIPTIONS,
  TABLE_FRIENDLY_NAMES
} from '../../../../../shared/constants/databaseConstants'

interface DirtySummaryItemProps {
  item: DirtySummaryItemType
  isExpanded: boolean
  onToggle: () => void
}

export const DirtySummaryItem: React.FC<DirtySummaryItemProps> = ({
  item,
  isExpanded,
  onToggle
}) => {
  const displayTitle =
    TABLE_FRIENDLY_NAMES[item.tableName] ||
    (item.title && item.title !== 'Veritabanı' ? item.title : 'Çalışma Dosyası Bilgileri')
  const description =
    TABLE_DESCRIPTIONS[item.tableName] ||
    'Bu modülde kullanıcı tarafından veri değişiklikleri yapıldı.'

  return (
    <div
      className={`rounded-xl border transition-all cursor-pointer overflow-hidden ${
        isExpanded
          ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700 shadow-xs'
          : 'bg-slate-50 dark:bg-slate-800/70 border-slate-200/60 dark:border-slate-800/80 hover:border-amber-300 dark:hover:border-amber-700'
      }`}
      onClick={onToggle}
    >
      <div className="flex items-center justify-between p-2">
        <div className="flex items-center gap-2 min-w-0 pr-2">
          <div className="p-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
            <FileSpreadsheet className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span
              className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate"
              title={displayTitle}
            >
              {displayTitle}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <span className="text-amber-600 dark:text-amber-400 font-semibold">
                {item.actionLabel}
              </span>
              <span>•</span>
              <span>Son: {item.lastTime}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="font-extrabold px-2 py-0.5 rounded-lg text-[11px] bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 border border-amber-300/50 dark:border-amber-700/50 font-mono">
            +{item.count}
          </span>
          <ChevronRight
            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
              isExpanded ? 'rotate-90 text-amber-600' : ''
            }`}
          />
        </div>
      </div>

      {isExpanded && (
        <div className="px-2.5 pb-2.5 pt-1.5 border-t border-amber-200/50 dark:border-amber-800/40 bg-white/70 dark:bg-slate-900/70 text-[10px] space-y-1.5 animate-in fade-in-0 duration-150">
          <div className="flex items-start gap-1.5 text-slate-700 dark:text-slate-200">
            <Info className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
            <span className="leading-tight">{description}</span>
          </div>
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 font-mono pt-1 text-[9px] border-t border-slate-100 dark:border-slate-800">
            <span>
              İşlem:{' '}
              <strong className="text-amber-700 dark:text-amber-300">
                {item.actionLabel} ({item.count} adet)
              </strong>
            </span>
            <span>Son Güncelleme: {item.lastTime}</span>
          </div>
        </div>
      )}
    </div>
  )
}

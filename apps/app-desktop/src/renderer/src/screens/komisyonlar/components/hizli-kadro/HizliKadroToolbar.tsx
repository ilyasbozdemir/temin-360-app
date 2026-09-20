import React from 'react'
import { Eye, Plus, RefreshCw, Users } from 'lucide-react'
import { MemberRow } from './types'

interface HizliKadroToolbarProps {
  rows: MemberRow[]
  onLoadStandardTemplate: () => void
  onAddRow: (gorevAd?: string, asil?: number) => void
}

export const HizliKadroToolbar: React.FC<HizliKadroToolbarProps> = ({
  rows,
  onLoadStandardTemplate,
  onAddRow
}) => {
  const asilCount = rows.filter((r) => r.asilMi === 1 && r.personelId).length
  const yedekCount = rows.filter((r) => r.asilMi === 0 && r.personelId).length
  const visibleCount = rows.filter((r) => r.belgedeGoster).length

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl mb-3">
      {/* İstatistik Rozetleri */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Users className="w-4 h-4 text-blue-600" />
          Toplam: <span className="text-blue-600 font-mono">{rows.length}</span>
        </span>
        <span className="text-slate-300 dark:text-slate-700">•</span>
        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
          {asilCount} Asil
        </span>
        <span className="text-slate-300 dark:text-slate-700">•</span>
        <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
          {yedekCount} Yedek
        </span>
        <span className="text-slate-300 dark:text-slate-700">•</span>
        <span className="text-[11px] font-semibold text-blue-500 flex items-center gap-1">
          <Eye className="w-3 h-3" /> {visibleCount} Belgede Görünür
        </span>
      </div>

      {/* Aksiyon Butonları */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onLoadStandardTemplate}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-all shadow-2xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-blue-500" />
          Standart Yükle
        </button>
        <button
          type="button"
          onClick={() => onAddRow('Üye', 1)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-800 rounded-xl transition-all shadow-2xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Üye Ekle
        </button>
      </div>
    </div>
  )
}

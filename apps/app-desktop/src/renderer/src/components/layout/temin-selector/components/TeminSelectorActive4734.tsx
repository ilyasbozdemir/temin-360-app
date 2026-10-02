import React from 'react'
import { ChevronDown, Edit, Eye, FileText, Gavel, TrendingUp, X } from 'lucide-react'
import { cn } from '../../../../utils/cn'
import { formatDosyaNo } from '../../../../utils/formatDosyaNo'
import { DosyaListItem } from '../teminSelector.types'
import { TUR_COLOR, TUR_LABEL } from '../teminSelector.constants'
import { formatMoney, getMevzuatBadgeInfo } from '../teminSelector.utils'

interface TeminSelectorActive4734Props {
  selectedDosya: DosyaListItem
  selectedIsIhale: boolean
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  navigate: (opts: { to: string }) => void
  addTab: (path: string) => void
  setShowInspector: (show: boolean) => void
  handleCloseDosya: () => void
}

export const TeminSelectorActive4734: React.FC<TeminSelectorActive4734Props> = ({
  selectedDosya,
  selectedIsIhale,
  isOpen,
  setIsOpen,
  navigate,
  addTab,
  setShowInspector,
  handleCloseDosya
}) => {
  const mevzuat = getMevzuatBadgeInfo(selectedDosya)

  return (
    <div
      onClick={(): void => setIsOpen(!isOpen)}
      className={`group flex items-center gap-1.5 sm:gap-2.5 px-2.5 sm:px-3.5 py-1 rounded-2xl bg-white dark:bg-slate-900 border transition-all duration-200 shadow-2xs hover:shadow-xs max-w-200 w-auto min-w-0 cursor-pointer select-none ${
        selectedIsIhale
          ? 'border-indigo-200 dark:border-indigo-800/80 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20'
          : 'border-blue-200 dark:border-blue-800/80 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50/40 dark:hover:bg-blue-950/20'
      }`}
      title="Dosya Değiştir"
    >
      <div
        className={`p-1 sm:p-1.5 rounded-xl shrink-0 transition-transform group-hover:scale-105 ${
          selectedIsIhale
            ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
            : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
        }`}
      >
        {selectedIsIhale ? (
          <Gavel className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        ) : (
          <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        )}
      </div>

      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center gap-1 mb-0.5 overflow-hidden">
          <span
            className={`shrink-0 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
              selectedIsIhale
                ? 'bg-indigo-50 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-800/40'
                : 'bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200/60 dark:border-blue-800/40'
            }`}
          >
            {formatDosyaNo(selectedDosya)}
          </span>
          {selectedDosya.tur && (
            <span
              className={`hidden sm:inline-block shrink-0 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide border ${
                TUR_COLOR[selectedDosya.tur] ?? 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              {TUR_LABEL[selectedDosya.tur] ?? selectedDosya.tur}
            </span>
          )}
          <span
            className={`hidden md:inline-block shrink-0 text-[9px] px-1.5 py-0.5 rounded font-bold border truncate max-w-32.5 ${mevzuat.className}`}
          >
            {mevzuat.label}
          </span>
        </div>
        <div
          className={`text-xs font-bold truncate leading-tight transition-colors ${
            selectedIsIhale
              ? 'text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-300'
              : 'text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-300'
          }`}
        >
          {selectedDosya.konu}
        </div>
      </div>

      {selectedDosya.yaklasik_maliyet ? (
        <div className="hidden sm:flex items-center gap-1 shrink-0 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40">
          <TrendingUp className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 font-mono whitespace-nowrap">
            ₺{formatMoney(selectedDosya.yaklasik_maliyet)}
          </span>
        </div>
      ) : null}

      <button
        type="button"
        onClick={(e): void => {
          e.stopPropagation()
          setShowInspector(true)
        }}
        className="p-1 sm:p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all shrink-0 active:scale-90 cursor-pointer"
        title="Dosya Verilerini İncele (Inspector)"
      >
        <Eye className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={(e): void => {
          e.stopPropagation()
          addTab(`/dosyalar/yeni?id=${selectedDosya.id}`)
          navigate({ to: `/dosyalar/yeni?id=${selectedDosya.id}` })
        }}
        className="p-1 sm:p-1.5 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all shrink-0 active:scale-90 cursor-pointer"
        title="Dosya Formunu Düzenle"
      >
        <Edit className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={(e): void => {
          e.stopPropagation()
          handleCloseDosya()
        }}
        className="p-1 sm:p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all shrink-0 active:scale-90 cursor-pointer"
        title="Dosyayı Kapat"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      <span className="w-px h-3.5 bg-slate-200 dark:bg-slate-700 shrink-0" />
      <ChevronDown
        className={cn(
          'w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0',
          isOpen && 'rotate-180'
        )}
      />
    </div>
  )
}

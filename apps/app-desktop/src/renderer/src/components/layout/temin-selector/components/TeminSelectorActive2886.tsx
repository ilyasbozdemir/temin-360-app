import React from 'react'
import { ChevronDown, Eye, Landmark, TrendingUp, X } from 'lucide-react'
import { cn } from '../../../../utils/cn'
import { Dosya2886Item } from '../teminSelector.types'
import { formatMoney, get2886IslemTuruBadge, get2886MevzuatBadge } from '../teminSelector.utils'

interface TeminSelectorActive2886Props {
  active2886Dosya: Dosya2886Item
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  navigate: (opts: { to: string }) => void
  handleClose2886Dosya: () => void
}

export const TeminSelectorActive2886: React.FC<TeminSelectorActive2886Props> = ({
  active2886Dosya,
  isOpen,
  setIsOpen,
  navigate,
  handleClose2886Dosya
}) => {
  const islemBadge = get2886IslemTuruBadge(active2886Dosya.islemTuru)
  const mevzuatBadge = get2886MevzuatBadge(active2886Dosya)
  const bedel =
    active2886Dosya.muhammenBedel?.takdirEdilenMuhammenBedel ||
    active2886Dosya.muhammenBedel?.hesaplananBedel

  return (
    <div
      onClick={(): void => setIsOpen(!isOpen)}
      className="group flex items-center gap-1.5 sm:gap-2.5 px-2.5 sm:px-3.5 py-1 rounded-2xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800/80 hover:border-purple-400 dark:hover:border-purple-600 hover:bg-purple-50/40 dark:hover:bg-purple-950/20 transition-all duration-200 shadow-2xs hover:shadow-xs max-w-200 w-auto min-w-0 cursor-pointer select-none"
      title="2886 İhale Dosyasını Değiştir"
    >
      <div className="p-1 sm:p-1.5 rounded-xl shrink-0 transition-transform group-hover:scale-105 bg-purple-500/10 text-purple-600 dark:text-purple-400">
        <Landmark className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </div>

      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center gap-1 mb-0.5 overflow-hidden">
          <span className="shrink-0 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border bg-purple-50 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200/60 dark:border-purple-800/40">
            {active2886Dosya.ihaleKayitNo || active2886Dosya.id}
          </span>
          <span
            className={`hidden sm:inline-block shrink-0 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide border ${islemBadge.className}`}
          >
            {islemBadge.label}
          </span>
          <span
            className={`hidden md:inline-block shrink-0 text-[9px] px-1.5 py-0.5 rounded font-bold border truncate max-w-32.5 ${mevzuatBadge.className}`}
          >
            {mevzuatBadge.label}
          </span>
        </div>
        <div className="text-xs font-bold truncate leading-tight transition-colors text-slate-800 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-300">
          {active2886Dosya.ihaleAdi}
        </div>
      </div>

      {bedel ? (
        <div className="hidden sm:flex items-center gap-1 shrink-0 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-800/40">
          <TrendingUp className="w-3 h-3 text-purple-600 dark:text-purple-400 shrink-0" />
          <span className="text-[10px] font-extrabold text-purple-700 dark:text-purple-300 font-mono whitespace-nowrap">
            ₺{formatMoney(bedel)}
          </span>
        </div>
      ) : null}

      <button
        type="button"
        onClick={(e): void => {
          e.stopPropagation()
          navigate({ to: '/devlet-ihale-2886' })
        }}
        className="p-1 sm:p-1.5 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-all shrink-0 active:scale-90 cursor-pointer"
        title="2886 Çalışma Masasına Git"
      >
        <Eye className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={(e): void => {
          e.stopPropagation()
          handleClose2886Dosya()
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

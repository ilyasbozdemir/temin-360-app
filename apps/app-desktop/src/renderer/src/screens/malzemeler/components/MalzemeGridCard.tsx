import React from 'react'
import { Edit2, Trash2, Building2, Briefcase, Package } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { cn } from '../../../utils/cn'
import { Kalem } from '../malzemeler.hooks'

interface MalzemeGridCardProps {
  item: Kalem
  isSelected: boolean
  onToggleSelect: (id: number) => void
  onEdit: (item: Kalem) => void
  onDelete: (item: Kalem) => void
}

export function MalzemeGridCard({
  item,
  isSelected,
  onToggleSelect,
  onEdit,
  onDelete
}: MalzemeGridCardProps): React.JSX.Element {
  const isYapim = item.tipi === 'Yapım' || !!item.poz_no
  const isHizmet = item.tipi?.startsWith('Hizmet') || !!item.hizmet_sinifi

  return (
    <div
      className={cn(
        'flex flex-col p-4 bg-white dark:bg-slate-900 border rounded-2xl hover:border-blue-400 dark:hover:border-blue-700 hover:shadow-md transition-all group relative cursor-pointer',
        isSelected
          ? 'border-blue-500 dark:border-blue-700 bg-blue-50/20 dark:bg-blue-950/30 ring-1 ring-blue-500/20'
          : 'border-slate-200 dark:border-slate-800'
      )}
      onClick={() => onToggleSelect(item.id)}
    >
      <div className="absolute top-3 left-3 z-10" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(item.id)}
          className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-blue-600 focus:ring-blue-500 cursor-pointer animate-in fade-in"
        />
      </div>

      <div
        className="absolute top-2.5 right-2.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-white/90 dark:bg-slate-900/90 rounded-lg p-0.5"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(item)}
          className="h-7 w-7 p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </Button>
        <Button
          title="Sil"
          variant="ghost"
          size="sm"
          onClick={() => onDelete(item)}
          className="h-7 w-7 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/15"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>

      {item.gorsel_url && (
        <div className="w-full h-32 mb-3 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 flex items-center justify-center">
          <img src={item.gorsel_url} alt={item.kalem_adi} className="w-full h-full object-contain" />
        </div>
      )}

      <div className="flex flex-col gap-1.5 mb-2 pr-12 pl-6">
        <span className="font-mono font-bold text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide">
          ID: {item.barkod_id}
        </span>

        <div className="flex flex-wrap gap-1">
          {item.tasinir_kodu && (
            <span className="w-fit font-mono font-bold text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200/50 dark:border-emerald-800/40 px-1.5 py-0.5 rounded">
              T: {item.tasinir_kodu}
            </span>
          )}
          {item.poz_no && (
            <span className="w-fit font-mono font-bold text-[10px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 border border-amber-200/50 dark:border-amber-800/40 px-1.5 py-0.5 rounded">
              Poz: {item.poz_no} {item.poz_yili ? `(${item.poz_yili})` : ''}
            </span>
          )}
          {item.hizmet_sinifi && (
            <span className="w-fit font-bold text-[10px] text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200/50 dark:border-indigo-800/40 px-1.5 py-0.5 rounded">
              {item.hizmet_sinifi}
            </span>
          )}
          {item.okas_kodu && (
            <span className="w-fit font-mono font-bold text-[10px] text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 border border-purple-200/50 dark:border-purple-800/40 px-1.5 py-0.5 rounded">
              OKAS: {item.okas_kodu}
            </span>
          )}
        </div>
      </div>

      <h4 className="text-sm font-bold text-slate-850 dark:text-slate-100 mb-3 leading-snug line-clamp-2">
        {item.kalem_adi}
      </h4>

      {item.ozelligi && (
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
          {item.ozelligi}
        </p>
      )}

      <div className="mt-auto border-t border-slate-100 dark:border-slate-800 pt-2.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <span className="font-semibold flex items-center gap-1">
          {isYapim ? (
            <Building2 className="w-3.5 h-3.5 text-amber-600" />
          ) : isHizmet ? (
            <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
          ) : (
            <Package className="w-3.5 h-3.5 text-blue-600" />
          )}
          {item.tipi}
        </span>
        <span className="font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
          {item.birim}
        </span>
      </div>
    </div>
  )
}


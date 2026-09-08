import React from 'react'
import { Edit2, Trash2 } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { cn } from '../../../utils/cn'
import { Kalem } from '../malzemeler.hooks'

interface MalzemeListCardProps {
  item: Kalem
  isSelected: boolean
  onToggleSelect: (id: number) => void
  onEdit: (item: Kalem) => void
  onDelete: (item: Kalem) => void
}

export function MalzemeListCard({
  item,
  isSelected,
  onToggleSelect,
  onEdit,
  onDelete
}: MalzemeListCardProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'flex items-center p-3 bg-slate-50/50 dark:bg-slate-950/20 border rounded-xl hover:border-blue-300 dark:hover:border-blue-800 transition-colors group relative cursor-pointer',
        isSelected
          ? 'border-blue-400 dark:border-blue-800 bg-blue-50/20 dark:bg-blue-900/10'
          : 'border-slate-150 dark:border-slate-850'
      )}
      onClick={() => onToggleSelect(item.id)}
    >
      <div className="mr-3" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(item.id)}
          className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-blue-600 focus:ring-blue-500 cursor-pointer animate-in fade-in"
        />
      </div>

      <div className="flex items-center flex-1 gap-3 pr-16">
        {item.gorsel_url ? (
          <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 shrink-0 bg-slate-100 dark:bg-slate-900">
            <img src={item.gorsel_url} alt={item.kalem_adi} className="w-full h-full object-cover" />
          </div>
        ) : null}

        <div className="flex flex-col gap-1 min-w-[120px]">
          <span className="font-mono font-bold text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            ID: {item.barkod_id}
          </span>
          <div className="flex gap-1 flex-wrap">
            {item.poz_no && (
              <span className="w-fit font-mono font-bold text-[10px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 border border-amber-200/50 dark:border-amber-800/30 px-1.5 py-0.5 rounded">
                POZ: {item.poz_no}
              </span>
            )}
            {item.hizmet_sinifi && (
              <span className="w-fit font-medium text-[10px] text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 border border-purple-200/50 dark:border-purple-800/30 px-1.5 py-0.5 rounded truncate max-w-[120px]">
                {item.hizmet_sinifi}
              </span>
            )}
            {item.tasinir_kodu && (
              <span className="w-fit font-mono font-bold text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100/20 dark:border-emerald-900/10 px-1.5 py-0.5 rounded">
                T: {item.tasinir_kodu}
              </span>
            )}
            {item.okas_kodu && (
              <span className="w-fit font-mono font-bold text-[10px] text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100/20 dark:border-indigo-900/10 px-1.5 py-0.5 rounded">
                OKAS: {item.okas_kodu}
              </span>
            )}
          </div>
        </div>

        <h4 className="flex-1 text-sm font-bold text-slate-800 dark:text-slate-200 leading-snug line-clamp-2">
          {item.kalem_adi}
        </h4>

        <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 min-w-[160px] justify-end">
          {item.fiyat_donemi && (
            <span className="font-mono text-[10px] text-slate-400">
              {item.fiyat_donemi}
            </span>
          )}
          <span className="font-semibold text-slate-600 dark:text-slate-300">{item.tipi}</span>
          <span className="font-semibold text-slate-600 dark:text-slate-300 bg-slate-200/50 dark:bg-slate-800/50 px-2 py-1 rounded">
            {item.birim}
          </span>
        </div>
      </div>

      <div
        className="absolute right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-50/90 dark:bg-slate-950/90 p-1 rounded-lg backdrop-blur-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(item)}
          className="h-8 w-8 p-0 text-slate-400 hover:text-blue-500"
        >
          <Edit2 className="w-4 h-4" />
        </Button>
        <Button
          title="Sil"
          variant="ghost"
          size="sm"
          onClick={() => onDelete(item)}
          className="h-8 w-8 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/15"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

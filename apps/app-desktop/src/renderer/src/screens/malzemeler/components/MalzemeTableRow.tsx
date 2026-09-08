import React from 'react'
import { Edit2, Trash2 } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { cn } from '../../../utils/cn'
import { Kalem } from '../malzemeler.hooks'

interface MalzemeTableRowProps {
  item: Kalem
  isSelected: boolean
  onToggleSelect: (id: number) => void
  onEdit: (item: Kalem) => void
  onDelete: (item: Kalem) => void
}

export function MalzemeTableRow({
  item,
  isSelected,
  onToggleSelect,
  onEdit,
  onDelete
}: MalzemeTableRowProps): React.JSX.Element {
  return (
    <tr
      className={cn(
        'hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors group cursor-pointer',
        isSelected && 'bg-blue-50/20 dark:bg-blue-900/10'
      )}
      onClick={() => onToggleSelect(item.id)}
    >
      <td className="px-4 py-3 w-10" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(item.id)}
          className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-blue-600 focus:ring-blue-500 cursor-pointer"
        />
      </td>
      <td className="px-4 py-3 text-xs font-mono font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap">
        {item.barkod_id}
      </td>
      <td className="px-4 py-3 text-[10px] whitespace-nowrap">
        <div className="flex flex-col gap-1">
          {item.poz_no ? (
            <span className="font-mono font-bold text-amber-700 dark:text-amber-400">
              POZ: {item.poz_no}
            </span>
          ) : null}
          {item.hizmet_sinifi ? (
            <span className="font-medium text-purple-700 dark:text-purple-400">
              {item.hizmet_sinifi}
            </span>
          ) : null}
          {item.tasinir_kodu ? (
            <span className="font-mono text-emerald-700 dark:text-emerald-400">
              T: {item.tasinir_kodu}
            </span>
          ) : (
            !item.poz_no && !item.hizmet_sinifi && <span className="text-slate-400">-</span>
          )}
          {item.okas_kodu ? (
            <span className="font-mono text-indigo-700 dark:text-indigo-400">
              O: {item.okas_kodu}
            </span>
          ) : null}
        </div>
      </td>
      <td
        className="px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-200 max-w-[300px]"
        title={item.kalem_adi}
      >
        <div className="flex items-center gap-2">
          {item.gorsel_url ? (
            <div className="w-7 h-7 rounded border border-slate-200 dark:border-slate-800 shrink-0 bg-slate-100 dark:bg-slate-900 overflow-hidden">
              <img src={item.gorsel_url} alt="" className="w-full h-full object-cover" />
            </div>
          ) : null}
          <span className="truncate">{item.kalem_adi}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-xs text-slate-650 dark:text-slate-300 whitespace-nowrap">
        {item.tipi}
      </td>
      <td className="px-4 py-3 text-xs font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap">
        {item.birim}
      </td>
      <td className="px-4 py-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(item)}
            className="h-7 w-7 p-0 text-slate-400 hover:text-blue-500"
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
      </td>
    </tr>
  )
}

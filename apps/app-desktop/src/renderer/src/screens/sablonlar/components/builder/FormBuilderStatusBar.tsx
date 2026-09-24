import React from 'react'
import { CheckCircle2 } from 'lucide-react'
import { FormFieldV2 } from '../../types/formBuilder.types'

interface FormBuilderStatusBarProps {
  activeField: FormFieldV2 | undefined
  selectedTab: string
  totalItems: number
  pageSize: 'A4' | 'A3'
  orientation: 'portrait' | 'landscape'
  zoom: number
}

export const FormBuilderStatusBar: React.FC<FormBuilderStatusBarProps> = ({
  activeField,
  selectedTab,
  totalItems,
  pageSize,
  orientation,
  zoom
}) => {
  return (
    <div className="flex items-center justify-between px-4 py-1.5 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-400 select-none transition-colors">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
          <CheckCircle2 className="w-3.5 h-3.5" /> Hazır
        </span>
        <span className="border-l border-slate-300 dark:border-slate-800 pl-3">
          Seçili Öğe:{' '}
          <span className="text-blue-600 dark:text-blue-400 font-bold">
            {activeField?.label || 'Seçilmedi'}
          </span>{' '}
          {activeField && `(${activeField.variableName})`}
        </span>
        <span className="border-l border-slate-300 dark:border-slate-800 pl-3">
          Aktif Sekme: <span className="text-slate-800 dark:text-slate-200 font-semibold">{selectedTab}</span>
        </span>
      </div>

      <div className="flex items-center gap-4">
        <span>
          Toplam Blok: <span className="text-slate-900 dark:text-white font-bold">{totalItems}</span>
        </span>
        <span className="border-l border-slate-300 dark:border-slate-800 pl-3">
          Sayfa Düzeni: <span className="text-slate-900 dark:text-white font-semibold">{pageSize}</span> (
          {orientation === 'portrait' ? 'Dikey' : 'Yatay'})
        </span>
        <span className="border-l border-slate-300 dark:border-slate-800 pl-3 font-bold text-blue-600 dark:text-blue-400">
          Ölçek: %{zoom}
        </span>
      </div>
    </div>
  )
}

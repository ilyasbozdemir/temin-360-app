import React from 'react'

interface KomisyonSyncToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
}

export const KomisyonSyncToggle: React.FC<KomisyonSyncToggleProps> = ({ checked, onChange }) => {
  return (
    <div className="flex items-center justify-between p-2.5 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 rounded-xl text-xs">
      <label className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300 font-medium cursor-pointer select-none">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
        />
        <span>
          Bu atamaları <strong>Genel Komisyon Yönetimi</strong>&apos;ne de otomatik aktar (Sonraki
          dosyalarda varsayılan olur)
        </span>
      </label>
      <span className="text-[11px] text-blue-600 dark:text-blue-400 font-mono bg-blue-100/80 dark:bg-blue-900/60 px-2 py-0.5 rounded-md font-semibold">
        TANIM_Komisyon
      </span>
    </div>
  )
}

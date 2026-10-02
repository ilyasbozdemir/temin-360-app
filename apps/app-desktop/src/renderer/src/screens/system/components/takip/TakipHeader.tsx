import React from 'react'
import { ClipboardList, Edit } from 'lucide-react'

interface TakipHeaderProps {
  activeDosya?: any
  onEditClick: () => void
}

export function TakipHeader({ activeDosya, onEditClick }: TakipHeaderProps): React.JSX.Element {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-855 dark:text-slate-100 tracking-tight flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-blue-600" />
          Süreç Takip & Durum Paneli
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Doğrudan temin dosyalarınızın yasal işlem adımlarını ve belge tamamlama durumlarını
          buradan izleyebilirsiniz.
        </p>
      </div>
      {activeDosya && (
        <button
          onClick={onEditClick}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all cursor-pointer shrink-0"
        >
          <Edit size={15} />
          Dosyayı Düzenle
        </button>
      )}
    </div>
  )
}

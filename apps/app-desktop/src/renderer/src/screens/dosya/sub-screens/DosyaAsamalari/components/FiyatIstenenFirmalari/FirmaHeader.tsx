import React from 'react'
import { Building2, Calculator, Plus, UserPlus } from 'lucide-react'
import { FirmaHeaderProps, MAX_FIRMS, MIN_FIRMS } from './types'

export function FirmaHeader({
  title = 'Fiyat İstenen Firmaların Seçilmesi',
  addedCount,
  canAdd,
  onOpenModal,
  onOpenNewFirmModal,
  onFiyatGir,
  extraHeaderAction
}: FirmaHeaderProps): React.JSX.Element {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/40 dark:bg-slate-900/40">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
          <Building2 className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-[10px] font-black uppercase tracking-wider">
              1. Adım
            </span>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">{title}</h3>
            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 px-2 py-0.5 bg-slate-200/70 dark:bg-slate-800 rounded-full">
              {addedCount} / {MAX_FIRMS} Firma
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Fiyat teklifi istenecek istekli firmalar (En az{' '}
            <span className="font-semibold text-slate-600 dark:text-slate-300">{MIN_FIRMS}</span>,
            en fazla{' '}
            <span className="font-semibold text-slate-600 dark:text-slate-300">{MAX_FIRMS}</span>{' '}
            firma). Teklif mektuplarını dağıttıktan sonra toplanan fiyatlar{' '}
            <strong>2. Adımda</strong> işlenir.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 shrink-0">
        {/* 1. Havuzdan Firma Ekle */}
        <button
          type="button"
          disabled={!canAdd}
          onClick={onOpenModal}
          title={!canAdd ? `Maksimum ${MAX_FIRMS} firma eklenebilir` : 'Havuzdan firma seç ve ekle'}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[11px] font-bold transition-colors cursor-pointer border-0 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Havuzdan Ekle</span>
        </button>

        {/* 2. Yeni Firma Kaydet & Ekle */}
        <button
          type="button"
          disabled={!canAdd}
          onClick={onOpenNewFirmModal}
          title={
            !canAdd
              ? `Maksimum ${MAX_FIRMS} firma eklenebilir`
              : 'Yeni firma tanımlayıp doğrudan dosyaya ekle'
          }
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 dark:text-slate-200 text-[11px] font-bold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 shadow-2xs"
        >
          <UserPlus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>+ Yeni Firma</span>
        </button>

        {/* 3. Dağıtım Sonrası: 2. Adım Fiyat Girişi Butonu */}
        {addedCount >= MIN_FIRMS && onFiyatGir && (
          <button
            type="button"
            onClick={onFiyatGir}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-all shadow-xs cursor-pointer border-0 ring-2 ring-emerald-500/20"
            title="Teklif mektuplarını dağıttıktan sonra toplanan fiyatları girmek için 2. adıma geç"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>2. Adım: Toplanan Fiyatları Gir ➔</span>
          </button>
        )}

        {extraHeaderAction}
      </div>
    </div>
  )
}

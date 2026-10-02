import React from 'react'
import { FileText, FolderClosed, Gavel, Plus, TrendingUp } from 'lucide-react'
import { formatDosyaNo } from '../../../utils/formatDosyaNo'
import { TUR_COLOR, TUR_LABEL } from '../teminSelector.constants'
import { formatMoney, getMevzuatBadgeInfo, isIhaleOrYapim } from '../teminSelector.utils'

interface DosyaItem {
  id: number
  temin_no?: string
  konu?: string
  tur?: string
  yaklasik_maliyet?: number
  is_deleted?: number
  ihale_sekli?: string
  ihale_tipi?: string
  isin_aciklamasi?: string
}

interface TeminSelectorList4734Props {
  isLoadingDosyalar: boolean
  filteredDosyalar: DosyaItem[]
  activeDosyaId: number | null
  isDt: boolean
  handleSelect: (id: number) => void
  handleCreateYeniDosya: (e: React.MouseEvent) => void
}

export const TeminSelectorList4734: React.FC<TeminSelectorList4734Props> = ({
  isLoadingDosyalar,
  filteredDosyalar,
  activeDosyaId,
  isDt,
  handleSelect,
  handleCreateYeniDosya
}) => {
  if (isLoadingDosyalar) {
    return (
      <div className="p-8 text-center text-xs text-slate-500 font-medium">
        Veritabanı taranıyor...
      </div>
    )
  }

  if (filteredDosyalar.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-slate-400 flex flex-col items-center gap-3">
        <FolderClosed className="w-8 h-8 opacity-40" />
        <span>
          {isDt
            ? 'Bu kriterlere uygun Doğrudan Temin dosyası bulunamadı.'
            : 'Bu kriterlere uygun İhale veya Yapım İşi dosyası bulunamadı.'}
        </span>
        <button
          onClick={handleCreateYeniDosya}
          className={`mt-2 px-4 py-2 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer ${
            isDt ? 'bg-blue-600 hover:bg-blue-500' : 'bg-indigo-600 hover:bg-indigo-500'
          }`}
        >
          <Plus className="w-4 h-4" />
          {isDt ? 'Yeni Doğrudan Temin Oluştur' : 'Yeni İhale Dosyası Oluştur'}
        </button>
      </div>
    )
  }

  return (
    <>
      {filteredDosyalar.map((dosya) => {
        const itemIsIhale = isIhaleOrYapim(dosya)
        const isActive = activeDosyaId === dosya.id
        const mevzuat = getMevzuatBadgeInfo(dosya)

        return (
          <div
            key={dosya.id}
            onClick={() => handleSelect(dosya.id)}
            className={`group w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all border cursor-pointer ${
              isActive
                ? itemIsIhale
                  ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800/80 shadow-2xs'
                  : 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800/80 shadow-2xs'
                : 'bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200/60 dark:border-slate-800'
            }`}
          >
            <div
              className={`p-2 rounded-xl shrink-0 ${
                isActive
                  ? itemIsIhale
                    ? 'bg-indigo-600 text-white'
                    : 'bg-blue-600 text-white'
                  : itemIsIhale
                    ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
                    : 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
              }`}
            >
              {itemIsIhale ? <Gavel className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                    itemIsIhale
                      ? 'bg-indigo-50 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-800/40'
                      : 'bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200/60 dark:border-blue-800/40'
                  }`}
                >
                  {formatDosyaNo(dosya)}
                </span>

                {dosya.tur && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide border ${
                      TUR_COLOR[dosya.tur] ?? 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {TUR_LABEL[dosya.tur] ?? dosya.tur}
                  </span>
                )}

                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-bold border ${mevzuat.className}`}
                >
                  {mevzuat.label}
                </span>
              </div>

              <div
                className={`text-xs font-bold truncate ${
                  isActive
                    ? itemIsIhale
                      ? 'text-indigo-900 dark:text-indigo-200 font-extrabold'
                      : 'text-blue-900 dark:text-blue-200 font-extrabold'
                    : 'text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white'
                }`}
              >
                {dosya.konu}
              </div>
            </div>

            {dosya.yaklasik_maliyet ? (
              <div className="flex items-center gap-1 shrink-0 px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40">
                <TrendingUp className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 font-mono whitespace-nowrap">
                  ₺{formatMoney(dosya.yaklasik_maliyet)}
                </span>
              </div>
            ) : null}
          </div>
        )
      })}
    </>
  )
}

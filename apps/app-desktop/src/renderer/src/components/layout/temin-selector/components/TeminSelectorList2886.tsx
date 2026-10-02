import React from 'react'
import { FolderClosed, Landmark, Plus, TrendingUp } from 'lucide-react'
import { Dosya2886Item } from '../teminSelector.types'
import { formatMoney, get2886IslemTuruBadge, get2886MevzuatBadge } from '../teminSelector.utils'

interface TeminSelectorList2886Props {
  filtered2886Dosyalar: Dosya2886Item[]
  active2886Dosya: Dosya2886Item | null
  handleSelect2886: (item: Dosya2886Item) => void
  handleCreateYeniDosya: (e: React.MouseEvent) => void
}

export const TeminSelectorList2886: React.FC<TeminSelectorList2886Props> = ({
  filtered2886Dosyalar,
  active2886Dosya,
  handleSelect2886,
  handleCreateYeniDosya
}) => {
  if (filtered2886Dosyalar.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-slate-400 flex flex-col items-center gap-3">
        <FolderClosed className="w-8 h-8 opacity-40 text-purple-400" />
        <span>Bu kriterlere uygun 2886 Devlet İhale dosyası bulunamadı.</span>
        <button
          onClick={handleCreateYeniDosya}
          className="mt-2 px-4 py-2 text-white bg-purple-600 hover:bg-purple-500 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          2886 İhale Masasını Aç
        </button>
      </div>
    )
  }

  return (
    <>
      {filtered2886Dosyalar.map((dosya) => {
        const isActive = active2886Dosya?.id === dosya.id
        const turBadge = get2886IslemTuruBadge(dosya.islemTuru)
        const mevzuatBadge = get2886MevzuatBadge(dosya)
        const bedel =
          dosya.muhammenBedel?.takdirEdilenMuhammenBedel || dosya.muhammenBedel?.hesaplananBedel

        return (
          <div
            key={dosya.id}
            onClick={() => handleSelect2886(dosya)}
            className={`group w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all border cursor-pointer ${
              isActive
                ? 'bg-purple-50/90 dark:bg-purple-950/40 border-purple-400 dark:border-purple-800 shadow-2xs'
                : 'bg-white dark:bg-slate-850 hover:bg-purple-50/40 dark:hover:bg-slate-800 border-slate-200/60 dark:border-slate-800'
            }`}
          >
            <div
              className={`p-2 rounded-xl shrink-0 ${
                isActive
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400'
              }`}
            >
              <Landmark className="w-4 h-4" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border bg-purple-50 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200/60 dark:border-purple-800/40">
                  {dosya.ihaleKayitNo || dosya.id}
                </span>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide border ${turBadge.className}`}
                >
                  {turBadge.label}
                </span>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-bold border ${mevzuatBadge.className}`}
                >
                  {mevzuatBadge.label}
                </span>
                {dosya.ihaleTarihi && (
                  <span className="hidden sm:inline-block text-[9px] px-1.5 py-0.5 rounded font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800">
                    İhale: {dosya.ihaleTarihi}
                  </span>
                )}
              </div>

              <div
                className={`text-xs font-bold truncate ${
                  isActive
                    ? 'text-purple-900 dark:text-purple-200 font-extrabold'
                    : 'text-slate-800 dark:text-slate-200 group-hover:text-purple-700 dark:group-hover:text-purple-300'
                }`}
              >
                {dosya.ihaleAdi}
              </div>
            </div>

            {bedel ? (
              <div className="flex items-center gap-1 shrink-0 px-2 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-800/40">
                <TrendingUp className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 font-mono whitespace-nowrap">
                  ₺{formatMoney(bedel)}
                </span>
              </div>
            ) : null}
          </div>
        )
      })}
    </>
  )
}

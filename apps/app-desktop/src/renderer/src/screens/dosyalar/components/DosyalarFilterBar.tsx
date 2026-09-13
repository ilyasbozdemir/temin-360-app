import React from 'react'
import { cn } from '../../../utils/cn'
import { Search } from 'lucide-react'

export function DosyalarFilterBar({
  filterYil,
  setFilterYil,
  filterStatus,
  setFilterStatus,
  uniqueYillar,
  filterTur,
  setFilterTur,
  searchQuery,
  setSearchQuery,
  filteredCount,
  totalCount
}: {
  filterYil: string
  setFilterYil: (val: string) => void
  filterStatus: string
  setFilterStatus: (val: string) => void
  uniqueYillar: number[]
  filterTur: string
  setFilterTur: (val: string) => void
  searchQuery: string
  setSearchQuery: (val: string) => void
  filteredCount: number
  totalCount: number
}): React.ReactElement {
  return (
    <div className="flex-none flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-2xl shadow-sm">
      <div className="flex items-center gap-1.5 flex-wrap">
        <select
          value={filterYil}
          onChange={(e) => setFilterYil(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-bold text-slate-600 dark:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
        >
          <option value="hepsi">Tüm Yıllar</option>
          {uniqueYillar.map((yil) => (
            <option key={yil} value={yil.toString()}>
              {yil} Yılı
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-bold text-slate-600 dark:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
        >
          <option value="hepsi">Tüm Durumlar</option>
          <option value="aktif">Sadece Aktifler</option>
          <option value="tamamlandi">Tamamlananlar</option>
          <option value="iptal_edildi">İptal Edilenler</option>
        </select>
        <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block"></div>
        {['hepsi', 'mal', 'hizmet', 'yapim_isi', 'danismanlik'].map((t) => (
          <button
            key={t}
            onClick={() => setFilterTur(t)}
            className={cn(
              'px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer border',
              filterTur === t
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
            )}
          >
            {t === 'hepsi'
              ? 'Tümü'
              : t === 'mal'
                ? 'Mal'
                : t === 'hizmet'
                  ? 'Hizmet'
                  : t === 'yapim_isi'
                    ? 'Yapım'
                    : 'Danışmanlık'}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto">
        {/* ARAMA */}
        <div className="relative flex-1 sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Dosya Konusu, No veya Birim ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-slate-800 dark:text-slate-200 select-text"
          />
        </div>
        {filteredCount < totalCount && (
          <span className="text-[10px] font-bold text-slate-500 shrink-0 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
            {filteredCount} / {totalCount}
          </span>
        )}
      </div>
    </div>
  )
}

import React from 'react'
import { cn } from '../../../utils/cn'
import { Search, Tag, X } from 'lucide-react'
import { TagBadge } from './Badges'

export function DosyalarFilterBar({
  filterYil,
  setFilterYil,
  filterStatus,
  setFilterStatus,
  uniqueYillar,
  filterTur,
  setFilterTur,
  filterProjeId = 'hepsi',
  setFilterProjeId,
  uniqueProjeler = [],
  filterTag = 'hepsi',
  setFilterTag,
  uniqueTags = [],
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
  filterProjeId?: string
  setFilterProjeId?: (val: string) => void
  uniqueProjeler?: { id: number; proje_kodu: string; proje_adi: string; renk?: string | null }[]
  filterTag?: string
  setFilterTag?: (val: string) => void
  uniqueTags?: string[]
  searchQuery: string
  setSearchQuery: (val: string) => void
  filteredCount: number
  totalCount: number
}): React.ReactElement {
  return (
    <div className="flex-none space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-2xl shadow-sm">
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

          {/* PROJE FİLTRESİ */}
          {setFilterProjeId && uniqueProjeler.length > 0 && (
            <div className="relative">
              <select
                value={filterProjeId}
                onChange={(e) => setFilterProjeId(e.target.value)}
                className={cn(
                  'px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border rounded-xl text-[10px] font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer transition-colors',
                  filterProjeId !== 'hepsi'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/40'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                )}
              >
                <option value="hepsi">📁 Tüm Projeler ({uniqueProjeler.length})</option>
                {uniqueProjeler.map((p) => (
                  <option key={p.id} value={p.id.toString()}>
                    {p.proje_kodu} - {p.proje_adi}
                  </option>
                ))}
              </select>
            </div>
          )}

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
              placeholder="Dosya, proje veya #etiket ara..."
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

      {/* HIZLI ETİKET (TAG) FİLTRELEME ÇUBUĞU */}
      {setFilterTag && uniqueTags.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 px-1 text-xs no-scrollbar">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1 mr-1">
            <Tag size={12} /> Etiketler:
          </span>
          <button
            type="button"
            onClick={() => setFilterTag('hepsi')}
            className={cn(
              'px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-all shrink-0',
              filterTag === 'hepsi'
                ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 border-transparent shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300'
            )}
          >
            Tümü
          </button>
          {uniqueTags.map((t) => {
            const isSelected = filterTag === t
            return (
              <TagBadge
                key={t}
                tag={t}
                active={isSelected}
                onClick={() => setFilterTag(isSelected ? 'hepsi' : t)}
              />
            )
          })}
          {filterTag !== 'hepsi' && (
            <button
              type="button"
              onClick={() => setFilterTag('hepsi')}
              className="text-[10px] font-semibold text-red-500 hover:text-red-600 flex items-center gap-0.5 ml-1 shrink-0"
            >
              <X size={12} /> Filtreyi Temizle
            </button>
          )}
        </div>
      )}
    </div>
  )
}

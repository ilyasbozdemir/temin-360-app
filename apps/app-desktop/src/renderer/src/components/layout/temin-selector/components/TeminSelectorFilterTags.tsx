import React from 'react'
import { Building, Hammer, Layers } from 'lucide-react'
import { SubFilterType } from '../teminSelector.types'

interface TeminSelectorFilterTagsProps {
  is2886: boolean
  isDt: boolean
  subFilter: SubFilterType
  setSubFilter: (filter: SubFilterType) => void
  dosyalar2886Length: number
  dtCount: number
  ihaleCount: number
}

export const TeminSelectorFilterTags: React.FC<TeminSelectorFilterTagsProps> = ({
  is2886,
  isDt,
  subFilter,
  setSubFilter,
  dosyalar2886Length,
  dtCount,
  ihaleCount
}) => {
  return (
    <div className="flex items-center gap-1 px-1 mb-2 text-[11px] font-semibold overflow-x-auto custom-scrollbar pb-1">
      <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mr-1 flex items-center gap-1">
        <Layers className="w-3 h-3" /> Filtre:
      </span>

      {is2886 ? (
        <>
          <button
            onClick={() => setSubFilter('mode_default')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              subFilter === 'mode_default'
                ? 'bg-purple-600 text-white font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Tüm 2886 Dosyaları ({dosyalar2886Length})
          </button>
          <button
            onClick={() => setSubFilter('2886_satis')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              subFilter === '2886_satis'
                ? 'bg-purple-600 text-white font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Taşınmaz Satış (Md. 45/36)
          </button>
          <button
            onClick={() => setSubFilter('2886_kiralama')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              subFilter === '2886_kiralama'
                ? 'bg-purple-600 text-white font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Kiralama İşleri (Md. 45)
          </button>
          <button
            onClick={() => setSubFilter('2886_hak')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              subFilter === '2886_hak'
                ? 'bg-purple-600 text-white font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Hak Tesisi & Trampa
          </button>
        </>
      ) : isDt ? (
        <>
          <button
            onClick={() => setSubFilter('mode_default')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              subFilter === 'mode_default'
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Tüm Doğrudan Teminler ({dtCount})
          </button>
          <button
            onClick={() => setSubFilter('dt_mal')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              subFilter === 'dt_mal'
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Mal Alımları (22/d)
          </button>
          <button
            onClick={() => setSubFilter('dt_hizmet')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              subFilter === 'dt_hizmet'
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Hizmet & Onarım İşleri
          </button>
          <button
            onClick={() => setSubFilter('all')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              subFilter === 'all'
                ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Tüm Arşiv (Hepsi)
          </button>
        </>
      ) : (
        <>
          <button
            onClick={() => setSubFilter('mode_default')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              subFilter === 'mode_default'
                ? 'bg-indigo-600 text-white font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Tüm İhale Dosyaları ({ihaleCount})
          </button>
          <button
            onClick={() => setSubFilter('ihale_acik')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              subFilter === 'ihale_acik'
                ? 'bg-indigo-600 text-white font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Açık İhale (Md. 19)
          </button>
          <button
            onClick={() => setSubFilter('ihale_pazarlik')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              subFilter === 'ihale_pazarlik'
                ? 'bg-indigo-600 text-white font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Pazarlık Usulü (Md. 21)
          </button>
          <button
            onClick={() => setSubFilter('ihale_yapim')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              subFilter === 'ihale_yapim'
                ? 'bg-emerald-600 text-white font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Hammer className="w-3 h-3 inline mr-1" />
            Yapım & Hakediş
          </button>
          <button
            onClick={() => setSubFilter('ihale_hizmet')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              subFilter === 'ihale_hizmet'
                ? 'bg-purple-600 text-white font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Building className="w-3 h-3 inline mr-1" />
            Hizmet İhaleleri
          </button>
          <button
            onClick={() => setSubFilter('all')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              subFilter === 'all'
                ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Tüm Arşiv (Hepsi)
          </button>
        </>
      )}
    </div>
  )
}

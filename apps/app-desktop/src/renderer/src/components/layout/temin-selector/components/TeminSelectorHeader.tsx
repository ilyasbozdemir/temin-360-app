import React from 'react'
import { Gavel, Landmark, Plus, Zap } from 'lucide-react'
import { ProcurementMode } from '../teminSelector.types'

interface TeminSelectorHeaderProps {
  procurementMode: ProcurementMode
  setGlobalMode: (mode: ProcurementMode) => void
  isDt: boolean
  is2886: boolean
  dtCount: number
  ihaleCount: number
  ihale2886Count: number
  handleCreateYeniDosya: (e: React.MouseEvent) => void
}

export const TeminSelectorHeader: React.FC<TeminSelectorHeaderProps> = ({
  setGlobalMode,
  isDt,
  is2886,
  dtCount,
  ihaleCount,
  ihale2886Count,
  handleCreateYeniDosya
}) => {
  return (
    <div className="flex items-center justify-between gap-2 p-1.5 bg-slate-100/70 dark:bg-slate-950/60 rounded-xl border border-slate-200/60 dark:border-slate-800 mb-2.5">
      <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto custom-scrollbar">
        {/* 1. Mod: Doğrudan Temin (KİK 22) */}
        <button
          onClick={() => setGlobalMode('dogrudan_temin')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
            isDt
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 hover:text-slate-900'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Doğrudan Temin (KİK 22)</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              isDt
                ? 'bg-blue-700 text-white font-bold'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            {dtCount}
          </span>
        </button>

        {/* 2. Mod: İhale Süreçleri (KİK 19/21) */}
        <button
          onClick={() => setGlobalMode('ihale')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
            !isDt && !is2886
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 hover:text-slate-900'
          }`}
        >
          <Gavel className="w-3.5 h-3.5" />
          <span>İhale Süreçleri (KİK 19/21)</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              !isDt && !is2886
                ? 'bg-indigo-700 text-white font-bold'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            {ihaleCount}
          </span>
        </button>

        {/* 3. Mod: 2886 Devlet İhale */}
        <button
          onClick={() => setGlobalMode('devlet_ihale_2886')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
            is2886
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-700 dark:hover:text-purple-300'
          }`}
          title="2886 Sayılı Devlet İhale Kanunu (Satış, Kiralama, Trampa)"
        >
          <Landmark className="w-3.5 h-3.5 text-purple-400" />
          <span>2886 Devlet İhale</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              is2886
                ? 'bg-purple-700 text-white font-bold'
                : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
            }`}
          >
            {ihale2886Count}
          </span>
        </button>
      </div>

      <button
        onClick={handleCreateYeniDosya}
        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0 ${
          is2886
            ? 'bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 dark:hover:bg-purple-900/60 border border-purple-200/60 dark:border-purple-800/40'
            : isDt
              ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 dark:hover:bg-blue-900/60 border border-blue-200/60 dark:border-blue-800/40'
              : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/60 border border-indigo-200/60 dark:border-indigo-800/40'
        }`}
        title={
          is2886
            ? '2886 Yeni Satış/Kiralama Masası'
            : isDt
              ? 'Yeni Doğrudan Temin'
              : 'Yeni İhale Dosyası'
        }
      >
        <Plus className="w-3.5 h-3.5" />
        <span>
          {is2886 ? 'Yeni 2886 Dosyası' : isDt ? 'Yeni Doğrudan Temin' : 'Yeni İhale Dosyası'}
        </span>
      </button>
    </div>
  )
}

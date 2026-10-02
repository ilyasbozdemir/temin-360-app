import React, { useMemo, useState } from 'react'
import { LogOut, Search, Sparkles } from 'lucide-react'
import {
  Dosya2886Item,
  DosyaListItem,
  ProcurementMode,
  SubFilterType
} from '../teminSelector.types'
import { filter2886Dosyalar, filterDosyalar } from '../teminSelector.filters'
import { TeminSelectorHeader } from './TeminSelectorHeader'
import { TeminSelectorFilterTags } from './TeminSelectorFilterTags'
import { TeminSelectorList2886 } from './TeminSelectorList2886'
import { TeminSelectorList4734 } from './TeminSelectorList4734'

interface TeminSelectorDropdownProps {
  procurementMode: ProcurementMode
  setGlobalMode: (mode: ProcurementMode) => void
  isDt: boolean
  is2886: boolean
  dtCount: number
  ihaleCount: number
  ihale2886Count: number
  dosyalar: DosyaListItem[]
  dosyalar2886: Dosya2886Item[]
  activeDosyaId: number | null
  active2886Dosya: Dosya2886Item | null
  isLoadingDosyalar: boolean
  handleSelect: (id: number) => void
  handleSelect2886: (item: Dosya2886Item) => void
  handleCloseDosya: () => void
  handleClose2886Dosya: () => void
  handleCreateYeniDosya: (e: React.MouseEvent) => void
}

export const TeminSelectorDropdown = React.memo(function TeminSelectorDropdown({
  procurementMode,
  setGlobalMode,
  isDt,
  is2886,
  dtCount,
  ihaleCount,
  ihale2886Count,
  dosyalar,
  dosyalar2886,
  activeDosyaId,
  active2886Dosya,
  isLoadingDosyalar,
  handleSelect,
  handleSelect2886,
  handleCloseDosya,
  handleClose2886Dosya,
  handleCreateYeniDosya
}: TeminSelectorDropdownProps): React.JSX.Element {
  const [searchQuery, setSearchQuery] = useState('')
  const [subFilter, setSubFilter] = useState<SubFilterType>('mode_default')

  const filteredDosyalar = useMemo(() => {
    return filterDosyalar(dosyalar, subFilter, searchQuery, isDt, is2886)
  }, [dosyalar, subFilter, searchQuery, isDt, is2886])

  const filtered2886Dosyalar = useMemo(() => {
    return filter2886Dosyalar(dosyalar2886, subFilter, searchQuery)
  }, [dosyalar2886, subFilter, searchQuery])

  return (
    <div
      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[880px] max-w-[94vw] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200 select-text"
      style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
    >
      <TeminSelectorHeader
        procurementMode={procurementMode}
        setGlobalMode={setGlobalMode}
        isDt={isDt}
        is2886={is2886}
        dtCount={dtCount}
        ihaleCount={ihaleCount}
        ihale2886Count={ihale2886Count}
        handleCreateYeniDosya={handleCreateYeniDosya}
      />

      <TeminSelectorFilterTags
        is2886={is2886}
        isDt={isDt}
        subFilter={subFilter}
        setSubFilter={setSubFilter}
        dosyalar2886Length={dosyalar2886.length}
        dtCount={dtCount}
        ihaleCount={ihaleCount}
      />

      <div className="relative flex items-center px-1 mb-2">
        <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder={
            is2886
              ? '2886 dosya no, ada/parsel, ihale konusu veya taşınmaz ara...'
              : isDt
                ? 'Doğrudan temin no, alım konusu veya birim ara...'
                : 'İhale kayıt no, iş konusu, yapım/hakediş veya birim ara...'
          }
          value={searchQuery}
          onChange={(e): void => setSearchQuery(e.target.value)}
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          className={`w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border rounded-xl text-xs focus:outline-none focus:ring-2 transition-all select-text ${
            is2886
              ? 'border-slate-200 dark:border-slate-800 focus:border-purple-500 focus:ring-purple-500/20'
              : isDt
                ? 'border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-blue-500/20'
                : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20'
          }`}
          autoFocus
        />
      </div>

      <div className="max-h-80 overflow-y-auto custom-scrollbar space-y-1 p-1">
        {is2886 ? (
          <TeminSelectorList2886
            filtered2886Dosyalar={filtered2886Dosyalar}
            active2886Dosya={active2886Dosya}
            handleSelect2886={handleSelect2886}
            handleCreateYeniDosya={handleCreateYeniDosya}
          />
        ) : (
          <TeminSelectorList4734
            isLoadingDosyalar={isLoadingDosyalar}
            filteredDosyalar={filteredDosyalar}
            activeDosyaId={activeDosyaId}
            isDt={isDt}
            handleSelect={handleSelect}
            handleCreateYeniDosya={handleCreateYeniDosya}
          />
        )}
      </div>

      {(activeDosyaId || (is2886 && active2886Dosya)) && (
        <div className="border-t border-slate-100 dark:border-slate-800 mt-2 pt-2 flex justify-between items-center text-xs px-1">
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Aktif dosya işlemlerini tamamladıktan sonra kapatabilirsiniz.
          </span>
          <button
            onClick={is2886 ? handleClose2886Dosya : handleCloseDosya}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-red-650 dark:text-red-405 hover:text-white hover:bg-red-600 bg-red-500/10 border border-red-500/20 rounded-lg transition-all cursor-pointer active:scale-95 shrink-0"
          >
            <LogOut className="w-3 h-3" />
            Dosyayı Kapat
          </button>
        </div>
      )}
    </div>
  )
})

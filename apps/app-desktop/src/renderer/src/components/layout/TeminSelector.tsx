import React from 'react'
import { LogOut, Search, Sparkles } from 'lucide-react'
import { YeniDosyaSecimModal } from '../modals/YeniDosyaSecimModal'
import { DosyaDataInspectorModal } from '../../screens/dosyalar/components/DosyaDataInspectorModal'
import { useTeminSelector } from './temin-selector/useTeminSelector'
import { TeminSelectorTrigger } from './temin-selector/components/TeminSelectorTrigger'
import { TeminSelectorHeader } from './temin-selector/components/TeminSelectorHeader'
import { TeminSelectorFilterTags } from './temin-selector/components/TeminSelectorFilterTags'
import { TeminSelectorList2886 } from './temin-selector/components/TeminSelectorList2886'
import { TeminSelectorList4734 } from './temin-selector/components/TeminSelectorList4734'

export function TeminSelector(): React.JSX.Element {
  const {
    isOpen,
    setIsOpen,
    showYeniDosyaModal,
    setShowYeniDosyaModal,
    showInspector,
    setShowInspector,
    searchQuery,
    setSearchQuery,
    procurementMode,
    setGlobalMode,
    isDt,
    is2886,
    subFilter,
    setSubFilter,
    activeDosyaId,
    selectedDosya,
    selectedIsIhale,
    isLoadingDosyalar,
    dosyalar2886,
    active2886Dosya,
    dtCount,
    ihaleCount,
    ihale2886Count,
    filteredDosyalar,
    filtered2886Dosyalar,
    containerRef,
    navigate,
    addTab,
    handleSelect,
    handleSelect2886,
    handleCloseDosya,
    handleClose2886Dosya,
    handleCreateYeniDosya
  } = useTeminSelector()

  return (
    <>
      <div className="relative max-w-full min-w-0 flex justify-center" ref={containerRef}>
        <TeminSelectorTrigger
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          is2886={is2886}
          isDt={isDt}
          selectedDosya={selectedDosya}
          selectedIsIhale={selectedIsIhale}
          active2886Dosya={active2886Dosya}
          navigate={navigate}
          addTab={addTab}
          setShowInspector={setShowInspector}
          handleCloseDosya={handleCloseDosya}
          handleClose2886Dosya={handleClose2886Dosya}
        />

        {isOpen && (
          <div
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[880px] max-w-[94vw] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200 select-text"
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
        )}
      </div>

      <YeniDosyaSecimModal
        isOpen={showYeniDosyaModal}
        onClose={(): void => setShowYeniDosyaModal(false)}
      />

      {selectedDosya && (
        <DosyaDataInspectorModal
          isOpen={showInspector}
          onClose={(): void => setShowInspector(false)}
          dosya={selectedDosya}
        />
      )}
    </>
  )
}

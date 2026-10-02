import React, { Suspense, lazy } from 'react'
import { useTeminSelector } from './temin-selector/useTeminSelector'
import { TeminSelectorTrigger } from './temin-selector/components/TeminSelectorTrigger'
import { TeminSelectorDropdown } from './temin-selector/components/TeminSelectorDropdown'

const YeniDosyaSecimModal = lazy(() =>
  import('../modals/YeniDosyaSecimModal').then((m) => ({ default: m.YeniDosyaSecimModal }))
)
const DosyaDataInspectorModal = lazy(() =>
  import('../../screens/dosyalar/components/DosyaDataInspectorModal').then((m) => ({
    default: m.DosyaDataInspectorModal
  }))
)

export function TeminSelector(): React.JSX.Element {
  const {
    isOpen,
    setIsOpen,
    showYeniDosyaModal,
    setShowYeniDosyaModal,
    showInspector,
    setShowInspector,
    procurementMode,
    setGlobalMode,
    isDt,
    is2886,
    activeDosyaId,
    selectedDosya,
    selectedIsIhale,
    dosyalar,
    isLoadingDosyalar,
    dosyalar2886,
    active2886Dosya,
    dtCount,
    ihaleCount,
    ihale2886Count,
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
          <TeminSelectorDropdown
            procurementMode={procurementMode}
            setGlobalMode={setGlobalMode}
            isDt={isDt}
            is2886={is2886}
            dtCount={dtCount}
            ihaleCount={ihaleCount}
            ihale2886Count={ihale2886Count}
            dosyalar={dosyalar}
            dosyalar2886={dosyalar2886}
            activeDosyaId={activeDosyaId}
            active2886Dosya={active2886Dosya}
            isLoadingDosyalar={isLoadingDosyalar}
            handleSelect={handleSelect}
            handleSelect2886={handleSelect2886}
            handleCloseDosya={handleCloseDosya}
            handleClose2886Dosya={handleClose2886Dosya}
            handleCreateYeniDosya={handleCreateYeniDosya}
          />
        )}
      </div>

      {showYeniDosyaModal && (
        <Suspense fallback={null}>
          <YeniDosyaSecimModal
            isOpen={showYeniDosyaModal}
            onClose={(): void => setShowYeniDosyaModal(false)}
          />
        </Suspense>
      )}

      {showInspector && selectedDosya && (
        <Suspense fallback={null}>
          <DosyaDataInspectorModal
            isOpen={showInspector}
            onClose={(): void => setShowInspector(false)}
            dosya={selectedDosya}
          />
        </Suspense>
      )}
    </>
  )
}

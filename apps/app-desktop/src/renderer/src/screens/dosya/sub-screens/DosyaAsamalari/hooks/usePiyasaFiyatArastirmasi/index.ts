import { useEffect, useRef, useState } from 'react'
import { useDosyaAsamasiSablons } from '../../useDosyaAsamasiSablons'
import { useTabStore } from '../../../../../../store/tabStore'
import { usePiyasaFiyatData } from './usePiyasaFiyatData'
import { usePiyasaFiyatPresets } from './usePiyasaFiyatPresets'
import { usePiyasaFiyatCalculation } from './usePiyasaFiyatCalculation'
import { usePiyasaFiyatDocuments } from './usePiyasaFiyatDocuments'

export * from './types'
export * from './usePiyasaFiyatData'
export * from './usePiyasaFiyatPresets'
export * from './usePiyasaFiyatCalculation'
export * from './usePiyasaFiyatDocuments'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function usePiyasaFiyatArastirmasiLogic() {
  const sablonsContext = useDosyaAsamasiSablons()
  const {
    activeDosyaId,
    sablons,
    activeStarredDocs,
    contextsByPath,
    dosyaContext,
    handleOpenPreviewForSablon
  } = sablonsContext
  const activeTabPath = useTabStore((s) => s.activeTabPath)

  const [belgeMenuOpen, setBelgeMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setBelgeMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const presetsHook = usePiyasaFiyatPresets(sablons, activeStarredDocs)

  const dataHook = usePiyasaFiyatData(activeDosyaId, activeTabPath)

  const calcHook = usePiyasaFiyatCalculation(
    activeDosyaId,
    dataHook.invitedFirms,
    dataHook.items,
    dataHook.bids,
    dataHook.hesaplamaEsasi,
    dataHook.setHesaplamaEsasiState,
    dataHook.setManualWinnerFirmaId,
    dataHook.setSetLowestFirmAsWinner
  )

  const docHook = usePiyasaFiyatDocuments(
    activeDosyaId,
    dataHook.invitedFirms,
    dataHook.items,
    dataHook.bids,
    dataHook.hesaplamaEsasi,
    dataHook.dosyaDefaultDate,
    dataHook.maliyetCetveliTarihi,
    dataHook.setMaliyetCetveliTarihi,
    dataHook.tutanakTarihi,
    dataHook.setTutanakTarihi,
    dataHook.manualWinnerFirmaId,
    dataHook.setManualWinnerFirmaId,
    dataHook.setSavedDocuments,
    presetsHook.stageSablons,
    contextsByPath,
    dosyaContext,
    dataHook.setLowestFirmAsWinner,
    dataHook.setSetLowestFirmAsWinner,
    handleOpenPreviewForSablon,
    calcHook.getEstimatedCostTotal
  )

  return {
    sablonsContext,
    invitedFirms: dataHook.invitedFirms,
    allPoolFirms: dataHook.allPoolFirms,
    items: dataHook.items,
    bids: dataHook.bids,
    loading: dataHook.loading,
    hesaplamaEsasi: dataHook.hesaplamaEsasi,
    setHesaplamaEsasi: calcHook.handleSetHesaplamaEsasi,
    komisyonTakdiri: dataHook.komisyonTakdiri,
    isFirmModalOpen: dataHook.isFirmModalOpen,
    setIsFirmModalOpen: dataHook.setIsFirmModalOpen,
    selectedFirmIds: dataHook.selectedFirmIds,
    setSelectedFirmIds: dataHook.setSelectedFirmIds,
    modalSearchQuery: dataHook.modalSearchQuery,
    setModalSearchQuery: dataHook.setModalSearchQuery,
    belgeMenuOpen,
    setBelgeMenuOpen,
    dropdownRef,
    selectedPresetId: presetsHook.selectedPresetId,
    setSelectedPresetId: presetsHook.setSelectedPresetId,
    isChangingPreset: presetsHook.isChangingPreset,
    setIsChangingPreset: presetsHook.setIsChangingPreset,
    presets: presetsHook.presets,
    stageSablons: presetsHook.stageSablons,
    getCleanName: presetsHook.getCleanName,
    filter: presetsHook.filter,
    setManualFilter: presetsHook.setManualFilter,
    displaySablons: presetsHook.displaySablons,
    handleBulkAddFirms: dataHook.handleBulkAddFirms,
    handleAddSingleFirm: dataHook.handleAddSingleFirm,
    handleCreateNewFirm: dataHook.handleCreateNewFirm,
    handleRemoveFirm: dataHook.handleRemoveFirm,
    handlePriceChange: dataHook.handlePriceChange,
    getLowestBidInfo: calcHook.getLowestBidInfo,
    getAverageBid: calcHook.getAverageBid,
    getEstimatedCostTotal: calcHook.getEstimatedCostTotal,
    handleNewDocument: docHook.handleNewDocument,
    handleSaveToDosya: docHook.handleSaveToDosya,
    lowestTotalFirmaId: calcHook.lowestTotalFirmaId,
    handleSetWinnerFirma: calcHook.handleSetWinnerFirma,
    isEditingFirms: dataHook.isEditingFirms,
    setIsEditingFirms: dataHook.setIsEditingFirms,
    maliyetCetveliTarihi: dataHook.maliyetCetveliTarihi,
    setMaliyetCetveliTarihi: dataHook.setMaliyetCetveliTarihi,
    tutanakTarihi: dataHook.tutanakTarihi,
    setTutanakTarihi: dataHook.setTutanakTarihi,
    savedDocuments: dataHook.savedDocuments,
    setSavedDocuments: dataHook.setSavedDocuments,
    isFormOpen: docHook.isFormOpen,
    setIsFormOpen: docHook.setIsFormOpen,
    formMode: docHook.formMode,
    setFormMode: docHook.setFormMode,
    syncTutanak: docHook.syncTutanak,
    setSyncTutanak: docHook.setSyncTutanak,
    setLowestFirmAsWinner: docHook.setLowestFirmAsWinner,
    setSetLowestFirmAsWinner: docHook.setSetLowestFirmAsWinner,
    manualWinnerFirmaId: dataHook.manualWinnerFirmaId,
    setManualWinnerFirmaId: dataHook.setManualWinnerFirmaId,
    belgeleriKaydet: docHook.belgeleriKaydet,
    setBelgeleriKaydet: docHook.setBelgeleriKaydet,
    handleUpdateDocumentDate: docHook.handleUpdateDocumentDate,
    handleDeleteDocument: docHook.handleDeleteDocument
  }
}

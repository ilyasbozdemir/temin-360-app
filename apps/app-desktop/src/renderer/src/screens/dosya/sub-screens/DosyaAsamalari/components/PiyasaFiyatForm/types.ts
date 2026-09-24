export interface PiyasaFiyatFormHeaderProps {
  formMode: 'maliyet' | 'tutanak'
  itemsCount: number
  invitedFirmsCount: number
  estimatedCostTotal: number
  setIsFormOpen: (val: boolean) => void
  handleSaveToDosya: (docType?: 'maliyet' | 'tutanak' | 'save_only') => void
}

export interface PiyasaFiyatFormSettingsBarProps {
  formMode: 'maliyet' | 'tutanak'
  hesaplamaEsasi: string
  setHesaplamaEsasi?: (val: string) => void
  maliyetCetveliTarihi: string
  setMaliyetCetveliTarihi: (val: string) => void
  tutanakTarihi: string
  setTutanakTarihi: (val: string) => void
  setLowestFirmAsWinner: boolean
  setSetLowestFirmAsWinner: (val: boolean) => void
  manualWinnerFirmaId: number | null
  setManualWinnerFirmaId: (id: number | null) => void
  invitedFirms: any[]
}

export interface PiyasaFiyatFormTabSwitcherProps {
  activeFormTab: 'firms' | 'matrix' | 'comparison'
  setActiveFormTab: (tab: 'firms' | 'matrix' | 'comparison') => void
}

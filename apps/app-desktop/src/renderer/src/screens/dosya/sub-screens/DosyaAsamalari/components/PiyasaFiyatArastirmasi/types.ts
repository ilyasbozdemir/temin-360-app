import { PoolFirm } from '../../hooks/usePiyasaFiyatArastirmasi'

export interface PiyasaFiyatArastirmasiDashboardProps {
  setIsFormOpen: (val: boolean) => void
  handleNewDocument: (mode: 'maliyet' | 'tutanak') => void
  dashboardViewMode: 'documents' | 'prices'
  setDashboardViewMode: (val: 'documents' | 'prices') => void
  stageDocs: any[]
  docViewMode: 'grid' | 'list' | 'table'
  changeDocViewMode: (mode: 'grid' | 'list' | 'table') => void
  stageSablons: any[]
  sablons: any[]
  activeStarredDocs: any[]
  ciktiLoading: boolean
  handleOpenPreviewForSablon: any
  quickPrint: any
  quickExport: any
  quickOpenExternal: any
  isSablonDisabled: (sablon: any) => boolean
  disableDocumentGuidance: boolean
  invitedFirms: any[]
  allPoolFirms?: PoolFirm[]
  handleAddSingleFirm?: (firma: PoolFirm) => void
  handleCreateNewFirm?: (firmaData: {
    unvan: string
    vergi_no?: string
    telefon?: string
    email?: string
    sehir?: string
  }) => Promise<void>
  handleRemoveFirm?: (id: number) => void
  items: any[]
  bids: any
  setActiveFormTab: (tab: 'firms' | 'matrix') => void
  activeActionDropdown: string | null
  setActiveActionDropdown: (val: string | null) => void
  handleUpdateDocumentDate: (docId: number, newDate: string, docName: string) => void
  setIsFirmModalOpen?: (val: boolean) => void
  handleDeleteDocument?: (id: number) => void
  handleSaveToDosya?: (docType?: 'maliyet' | 'tutanak' | 'save_only') => void
  getEstimatedCostTotal?: () => number
  manualWinnerFirmaId?: number | null
  handleSetWinnerFirma?: (firmaMasterId: number | null) => Promise<void>
  lowestTotalFirmaId?: number | null
  hesaplamaEsasi?: string
  setHesaplamaEsasi?: (val: string) => Promise<void> | void
}

export interface DagitimBelgeleriKartlariProps {
  handleOpenSablonByDosyaAdi: (targetKey: string, firmData?: any) => void
  handleOpenEkapSorgu?: (firma?: any) => void
}

export interface KazananKararPaneliProps {
  activeWinnerFirma: any
  lowestBidFirm: any
  handleSetWinnerFirma?: (firmaMasterId: number | null) => Promise<void>
  setIsFormOpen: (val: boolean) => void
  setActiveFormTab: (tab: 'firms' | 'matrix') => void
  hesaplamaEsasi?: string
  setHesaplamaEsasi?: (val: string) => Promise<void> | void
}

export interface PiyasaFiyatStepperProps {
  currentStep: 1 | 2 | 3
  setCurrentStep: (step: 1 | 2 | 3) => void
  isStep1Done: boolean
  isStep2Done: boolean
  isStep3Done: boolean
  invitedFirmsCount: number
  activeWinnerFirma: any
  mappedBelgelerCount: number
}

export interface SonucBelgesiKartlariProps {
  handleOpenSablonByDosyaAdi: (targetKey: string) => void
  handleNewDocument: (mode: 'maliyet' | 'tutanak') => void
}

export interface Step1IsteklilerVeDagitimProps {
  formattedFirms: any[]
  firmaColumns: any[]
  manualWinnerFirmaId?: number | null
  handleSetWinnerFirma?: (firmaMasterId: number | null) => Promise<void>
  handleCreateNewFirm?: (firmaData: {
    unvan: string
    vergi_no?: string
    telefon?: string
    email?: string
    sehir?: string
  }) => Promise<void>
  setCurrentStep: (step: 1 | 2 | 3) => void
  setIsFormOpen: (val: boolean) => void
  setActiveFormTab: (tab: 'firms' | 'matrix') => void
  handleOpenSablonByDosyaAdi: (targetKey: string, firmData?: any) => void
  handleOpenEkapSorgu: (firma?: any) => void
  handleAddSingleFirm?: (firma: any) => void
  handleRemoveFirm?: (id: number) => void
}

export interface Step2FiyatlarVeKazananProps {
  activeWinnerFirma: any
  lowestBidFirm: any
  invitedFirms: any[]
  items: any[]
  bids: any
  manualWinnerFirmaId?: number | null
  handleSetWinnerFirma?: (firmaMasterId: number | null) => Promise<void>
  setIsFormOpen: (val: boolean) => void
  setActiveFormTab: (tab: 'firms' | 'matrix') => void
  setCurrentStep: (step: 1 | 2 | 3) => void
}

export interface Step3TutanakVeMaliyetProps {
  mappedBelgeler: any[]
  docViewMode: 'grid' | 'list' | 'table'
  changeDocViewMode: (mode: 'grid' | 'list' | 'table') => void
  handleOpenSablonByDosyaAdi: (targetKey: string) => void
  handleNewDocument: (mode: 'maliyet' | 'tutanak') => void
  handleOpenBelgePreview: (belge: any) => void
  handleOpenExternalForBelge: (belge: any) => void
  handleQuickPrintForBelge: (belge: any) => void
  handleDeleteDocument?: (id: number) => void
  setCurrentStep: (step: 1 | 2 | 3) => void
  setIsFormOpen: (val: boolean) => void
  setActiveFormTab: (tab: 'firms' | 'matrix') => void
}

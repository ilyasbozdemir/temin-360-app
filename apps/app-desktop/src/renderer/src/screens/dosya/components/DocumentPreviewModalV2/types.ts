import { DocumentPreviewTab } from '../../../../store/globalDocumentPreviewStore'

export interface DocumentPreviewModalV2Props {
  isOpen: boolean
  documentId: string | null
  dosyaId?: number | null
  invitedFirms?: unknown[]
  selectedFirma?: unknown
  initialData?: Record<string, unknown>
  onClose: () => void
  isModal?: boolean
  backLabel?: string
  tabs?: DocumentPreviewTab[]
  activeTabId?: string | null
  onSwitchTab?: (tabId: string) => void
  onCloseTab?: (tabId: string) => void
  onAddTab?: (params: {
    documentId: string
    dosyaId?: number | null
    documentTitle?: string
  }) => void
}

export interface Personel {
  id: number
  ad_soyad: string
  unvan?: string
  telefon?: string
  eposta?: string
}

export interface Firma {
  id: number
  temin_firma_id?: number
  unvan: string
  yetkili_ad_soyad?: string
  telefon?: string
  eposta?: string
  total?: number
  isWinner?: boolean
  label?: string
}

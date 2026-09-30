import { TeminDosyasi } from './dosyalar.hooks'

export interface DBBirim {
  id: number
  birim_adi: string
  antet_ek_satir?: string
  sunum_makami?: string
  ihtiyac_yeri_eki?: string
  e_butce?: string
  harcama_yetkilisi_id?: number | null
  harcama_yetkilisi_unvan?: string
  gerceklestirme_gorevlisi_id?: number | null
}

export interface DBRol {
  id: number
  rol_kodu: string
  rol_adi?: string
  varsayilan_personel_id?: number | null
}

export interface DBPersonel {
  id: number
  ad_soyad: string
  unvan?: string
  birim?: string
  harcama_yetkilisi_mi?: number
}

export interface DBKodSozlugu {
  id: number
  tur: string
  kod: string
  aciklama?: string
}

export interface YeniDosyaTabProps {
  formData: Partial<TeminDosyasi>
  setFormData: React.Dispatch<React.SetStateAction<Partial<TeminDosyasi>>>
  isEdit: boolean
  editId?: number | null

  // Shared Data
  birimler: DBBirim[]
  kurum?: any
  personeller: DBPersonel[]
  roller?: DBRol[]
  kodSozlugu: DBKodSozlugu[]
  dosyalar: TeminDosyasi[]

  // AI & Suggestions State
  isDescLoading?: boolean
  showKonuSuggestions?: boolean
  setShowKonuSuggestions?: React.Dispatch<React.SetStateAction<boolean>>
  exactMatchCount?: number
  matchedSuggestions?: string[]

  // Handlers
  handleAiDescGenerate?: () => void
  handleCopyKonuToAciklama?: () => void
  openTextGenerator?: (
    targetField: keyof TeminDosyasi,
    title: string,
    fieldName: string,
    systemInstruction?: string
  ) => void

  // Search States
  showBirimSearch?: boolean
  setShowBirimSearch?: React.Dispatch<React.SetStateAction<boolean>>
  birimSearchQuery?: string
  setBirimSearchQuery?: React.Dispatch<React.SetStateAction<string>>
  filteredBirimler?: DBBirim[]
  handleSelectBirim?: (birim: DBBirim) => void

  showPersonelSearch?: 'irtibat' | 'hazirlayan' | 'onay' | 'talep_eden' | 'sunan' | null
  setShowPersonelSearch?: React.Dispatch<
    React.SetStateAction<'irtibat' | 'hazirlayan' | 'onay' | 'talep_eden' | 'sunan' | null>
  >
  personelSearchQuery?: string
  setPersonelSearchQuery?: React.Dispatch<React.SetStateAction<string>>
  filteredPersoneller?: DBPersonel[]

  // Refactored props
  limitType?: 'buyuksehir' | 'diger'
  currentLimit?: number
  isLimitExceeded?: boolean
  getNextTeminNo?: (year: number) => string
  getIhaleSekliExplanation?: (madde?: string) => string

  // Sub-stepper navigation
  onNextMainStep?: () => void
  activeSubStep?: number
  setActiveSubStep?: React.Dispatch<React.SetStateAction<number>>
}

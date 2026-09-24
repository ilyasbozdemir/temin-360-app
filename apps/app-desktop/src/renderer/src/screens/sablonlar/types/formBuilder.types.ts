export type FormFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'money'
  | 'date'
  | 'select'
  | 'checkbox'
  | 'table'
  | 'signature'
  | 'header'
  | 'paragraph'
  | 'divider'
  | 'custom'

export interface TableRowItem {
  id: string
  sira: number
  ad: string
  miktar: number | string
  birim: string
  birimFiyat: number | string
  toplamFiyat?: number | string
}

export interface SignatureMemberItem {
  id: string
  adSoyad: string
  unvan: string
  gorev: string
}

export interface FormFieldV2 {
  id: string
  label: string
  variableName: string
  type: FormFieldType
  required: boolean
  tabName?: string // Sekme / Bölüm Adı (Örn: 'Genel Bilgiler', 'Maliyet & Teklifler', 'Onay & İmzalar')
  placeholder?: string
  options?: string[]
  helpText?: string
  defaultValue?: string
  category?: 'header' | 'document' | 'financial' | 'commission' | 'terms' | 'custom'
  // Belge Görünüm & Veri Özellikleri
  staticContent?: string // Paragraf / Yasal metin içeriği
  headerInstitution?: string // Kurum Adı (Örn: T.C. İÇİŞLERİ BAKANLIĞI)
  headerDepartment?: string // Birim / Müdürlük (Örn: Destek Hizmetleri Dairesi Başkanlığı)
  headerLeftLogo?: boolean
  headerRightLogo?: boolean
  textAlign?: 'left' | 'center' | 'right' | 'justify'
  width?: '100%' | '50%' | '33%' | '25%'
  fontSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl'
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold'
  fontStyle?: 'normal' | 'italic'
  borderStyle?: 'none' | 'solid' | 'dashed' | 'double'
  indent?: boolean
  uppercase?: boolean
  tableType?: 'kalemler' | 'teklifler' | 'yaklasik_maliyet' | 'muayene'
  tableRows?: TableRowItem[]
  signatureType?: 'olur' | 'komisyon' | 'teslim'
  signatureMembers?: SignatureMemberItem[]
}

export type FormBuilderMode = 'design' | 'preview' | 'json'
export type DocumentPageSize = 'A4' | 'A3'
export type DocumentOrientation = 'portrait' | 'landscape'
export type DocumentMargin = 'compact' | 'normal' | 'wide'

export interface DocumentSettings {
  pageSize: DocumentPageSize
  orientation: DocumentOrientation
  margins: DocumentMargin
  zoom: number
  showGrid: boolean
  fontFamily?: 'serif' | 'sans'
  lineSpacing?: 'compact' | 'normal' | 'relaxed'
}

export interface PresetController {
  id: string
  name: string
  category: 'header' | 'document' | 'financial' | 'commission' | 'terms' | 'custom'
  description: string
  defaultField: Omit<FormFieldV2, 'id'>
}


import { TeminDosyasi } from '../../dosyalar/dosyalar.hooks'

export interface Belge {
  id: number
  ad: string
  asama: string
  durum: 'imzalandı' | 'imza_bekliyor' | 'oluşturuldu' | 'taslak' | 'oluşturulmadı'
  kod?: string
  pdfDosyaAdi?: string
  pdfYuklenmeTarihi?: string
  pdfBoyut?: string
}

export interface TaranmisBelge {
  id: number
  ad: string
  boyut: string
  tarih: string
  bagliBelgeId?: number
}

export interface Kalem {
  id: number
  malzemeAdi: string
  miktar: number
  birim: string
  birimFiyat: number
  toplamBedel: number
  tasinirKodu: string
  aciklama?: string
  tipi?: string
}

export interface FirmaItem {
  id: number
  unvan: string
  telefon: string
  email: string
  davetTarihi: string
  teklifTarihi: string | null
  teklifBedeli: number | null
  durumu: 'seçildi' | 'teklif' | 'bekliyor' | 'reddedildi'
}

export interface Uye {
  id: number
  adSoyad: string
  unvan: string
  gorev: string
  imza: 'imzaladı' | 'bekliyor'
}

export interface Komisyon {
  id: number
  tur: string
  dayanak: string
  olusturmaTarihi: string
  durum: 'aktif' | 'tamamlandı' | 'bekliyor'
  uyeler: Uye[]
}

export interface TaskItem {
  name: string
  done: boolean
  tab: string
}

export interface Stage {
  id: number
  title: string
  tasks: TaskItem[]
}

export interface StageWithStatus extends Stage {
  progress: number
  status: 'completed' | 'in-progress' | 'pending'
}

export interface SurecAkisiDosyaInfo {
  dosyaNo: string
  teminTuru: string
  kanunMaddesi: string
  tarih: string
  sonTeklifTarihi: string
  durum: string
}

export interface UseSurecAkisiReturn {
  activeDosya: TeminDosyasi | undefined
  dosyaContext: unknown
  dosya: SurecAkisiDosyaInfo
  selectedTab: string
  setSelectedTab: React.Dispatch<React.SetStateAction<string>>
  kalemler: Kalem[]
  firmalar: FirmaItem[]
  komisyonlar: Komisyon[]
  belgeler: Belge[]
  setBelgeler: React.Dispatch<React.SetStateAction<Belge[]>>
  selectedBelge: Belge | null
  setSelectedBelge: React.Dispatch<React.SetStateAction<Belge | null>>
  menuAcikId: number | null
  setMenuAcikId: React.Dispatch<React.SetStateAction<number | null>>
  previewBelge: Belge | null
  setPreviewBelge: React.Dispatch<React.SetStateAction<Belge | null>>
  selectedAsamaFilter: string
  setSelectedAsamaFilter: React.Dispatch<React.SetStateAction<string>>
  taranmisBelgeler: TaranmisBelge[]
  surukleniyor: boolean
  setSurukleniyor: React.Dispatch<React.SetStateAction<boolean>>
  expandedKomisyon: number | null
  setExpandedKomisyon: React.Dispatch<React.SetStateAction<number | null>>
  stages: Stage[]
  stagesWithStatus: StageWithStatus[]
  toggleTask: (stageId: number, taskIndex: number) => void
  belgeOlustur: (id: number) => void
  dosyalariEkle: (fileList: FileList | null, targetBelgeId?: number) => void
  taranmisBelgeSil: (id: number) => void
  toplamBedel: number
  totalTasks: number
  completedTasks: number
  overallProgress: number
  belgeTamamlanan: number
  pdfYuklenenSayisi: number
  filteredBelgeler: Belge[]
}

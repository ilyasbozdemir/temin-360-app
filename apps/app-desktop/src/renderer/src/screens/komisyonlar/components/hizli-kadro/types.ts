export interface PersonelItem {
  id: number
  ad_soyad: string
  unvan: string | null
  birim?: string | null
}

export interface GorevItem {
  id: number
  ad: string
}

export interface MemberRow {
  id: string | number
  dbUyeId?: number | null
  gorevId: number | null
  gorevAd: string
  personelId: number | null
  asilMi: number // 1: Asil, 0: Yedek
  belgedeGoster: boolean // Resmi belgede gösterilsin mi?
}

export interface HizliKadroGuncelleModalProps {
  isOpen: boolean
  onClose: () => void
  komisyonId: number | null
  komisyonAdi?: string
  activeDosyaId?: number | null
}

export const DEFAULT_YAKLASIK_ROLES = [
  { ad: 'Harcama Yetkilisi', asil: 1, belgedeGoster: false },
  { ad: 'Satın Alma Harcama Yetkilisi', asil: 1, belgedeGoster: false },
  { ad: 'Gerçekleştirme Görevlisi', asil: 1, belgedeGoster: false },
  { ad: 'Muhasebe Yetkilisi', asil: 1, belgedeGoster: false },
  { ad: 'Fiyat Araştırma Görevlisi', asil: 1, belgedeGoster: true },
  { ad: 'Fiyat Araştırma Görevlisi', asil: 1, belgedeGoster: true },
  { ad: 'Fiyat Araştırma Görevlisi', asil: 1, belgedeGoster: true }
]

export const DEFAULT_MUAYENE_ROLES = [
  { ad: 'Komisyon Başkanı', asil: 1, belgedeGoster: true },
  { ad: 'Üye', asil: 1, belgedeGoster: true },
  { ad: 'Üye', asil: 1, belgedeGoster: true },
  { ad: 'Üye', asil: 0, belgedeGoster: true },
  { ad: 'Üye', asil: 0, belgedeGoster: true }
]

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
  belgeKapsami: string // 'tumu' | 'piyasa_arastirma' | 'muayene_kabul' | 'olur_onay' | 'gizli'
}

export interface HizliKadroGuncelleModalProps {
  isOpen: boolean
  onClose: () => void
  komisyonId: number | null
  komisyonAdi?: string
  activeDosyaId?: number | null
}

export const DEFAULT_YAKLASIK_ROLES = [
  { ad: 'Harcama Yetkilisi', asil: 1, belgedeGoster: false, belgeKapsami: 'olur_onay' },
  { ad: 'Satın Alma Harcama Yetkilisi', asil: 1, belgedeGoster: false, belgeKapsami: 'olur_onay' },
  { ad: 'Gerçekleştirme Görevlisi', asil: 1, belgedeGoster: false, belgeKapsami: 'olur_onay' },
  { ad: 'Muhasebe Yetkilisi', asil: 1, belgedeGoster: false, belgeKapsami: 'gizli' },
  {
    ad: 'Fiyat Araştırma Görevlisi',
    asil: 1,
    belgedeGoster: true,
    belgeKapsami: 'piyasa_arastirma'
  },
  {
    ad: 'Fiyat Araştırma Görevlisi',
    asil: 1,
    belgedeGoster: true,
    belgeKapsami: 'piyasa_arastirma'
  },
  {
    ad: 'Fiyat Araştırma Görevlisi',
    asil: 1,
    belgedeGoster: true,
    belgeKapsami: 'piyasa_arastirma'
  }
]

export const DEFAULT_MUAYENE_ROLES = [
  { ad: 'Komisyon Başkanı', asil: 1, belgedeGoster: true, belgeKapsami: 'muayene_kabul' },
  { ad: 'Üye', asil: 1, belgedeGoster: true, belgeKapsami: 'muayene_kabul' },
  { ad: 'Üye', asil: 1, belgedeGoster: true, belgeKapsami: 'muayene_kabul' },
  { ad: 'Üye', asil: 0, belgedeGoster: true, belgeKapsami: 'muayene_kabul' },
  { ad: 'Üye', asil: 0, belgedeGoster: true, belgeKapsami: 'muayene_kabul' }
]

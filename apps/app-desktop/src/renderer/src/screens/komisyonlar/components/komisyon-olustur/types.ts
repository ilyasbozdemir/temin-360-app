export const KOMISYON_SABLONLARI = {
  yaklasik_maliyet: {
    label: 'Yaklaşık Maliyet Tespit Komisyonu',
    roller: [
      'Harcama Yetkilisi',
      'Satın Alma Harcama Yetkilisi',
      'Gerçekleştirme Görevlisi',
      'Muhasebe Yetkilisi',
      'Fiyat Araştırma Görevlisi',
      'Fiyat Araştırma Görevlisi',
      'Fiyat Araştırma Görevlisi',
      'Fiyat Araştırma Görevlisi',
      'Fiyat Araştırma Görevlisi',
      'Fiyat Araştırma Görevlisi'
    ]
  },
  muayene_kabul: {
    label: 'Muayene Kabul ve Tespit Komisyonu',
    roller: [
      'Komisyon Başkanı',
      'Üye',
      'Üye',
      'Üye',
      'Üye',
      'Üye',
      'Üye',
      'Üye',
      'Üye'
    ]
  }
} as const

export type KomisyonTipi = keyof typeof KOMISYON_SABLONLARI | ''

export interface UyeRow {
  id: number
  unvan: string // Görev unvanı (sabit, readonly)
  gorevId: number | string // DB'deki gorev_id (unvana göre eşleştirilen)
  personelId: number | null
  personelAdi: string // UI'da görüntülemek için
  personelArama: string
  asilMi: number
}

export interface KomisyonOlusturModalProps {
  isOpen: boolean
  onClose: () => void
  komisyonId?: number | null
  onPreviewSablon?: (sablon: any) => void
}

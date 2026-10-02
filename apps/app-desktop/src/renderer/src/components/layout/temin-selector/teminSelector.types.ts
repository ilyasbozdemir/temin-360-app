export type ProcurementMode = 'dogrudan_temin' | 'ihale' | 'devlet_ihale_2886'

export type SubFilterType =
  | 'mode_default'
  | 'all'
  | 'dt_all'
  | 'dt_mal'
  | 'dt_hizmet'
  | 'ihale_all'
  | 'ihale_acik'
  | 'ihale_pazarlik'
  | 'ihale_yapim'
  | 'ihale_hizmet'
  | '2886_satis'
  | '2886_kiralama'
  | '2886_hak'

export interface BadgeInfo {
  label: string
  className: string
}

export interface DosyaListItem {
  id: number
  temin_no?: string
  konu?: string
  tur?: string
  yaklasik_maliyet?: number
  is_deleted?: number
  ihale_sekli?: string
  ihale_tipi?: string
  isin_aciklamasi?: string
}

export interface Dosya2886Item {
  id: string
  islemTuru: 'satis' | 'kiralama' | 'irtifak_hakki' | 'trampa' | string
  usul: string
  ihaleAdi: string
  ihaleKayitNo: string
  ihaleTarihi: string
  ihaleSaati?: string
  ihaleYeri?: string
  tasinmaz?: {
    il?: string
    ilce?: string
    mahalleKoy?: string
    ada?: string
    parsel?: string
    yuzolcumuM2?: number
    cinsi?: string
    hisseOrani?: string
    mevcutDurumu?: string
    adres?: string
  }
  muhammenBedel?: {
    hesaplananBedel?: number
    takdirEdilenMuhammenBedel?: number
    geciciTeminatTutari?: number
    kdvOrani?: number
  }
}

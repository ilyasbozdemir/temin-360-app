import type { KomisyonAtamaModalProps, KomisyonType } from '../../types'

export type { KomisyonAtamaModalProps, KomisyonType }

export interface PersonelItem {
  id: number
  ad_soyad: string
  unvan?: string
}

export interface KomisyonRow {
  sira: number
  gorev: string
  personelId: number | null
  belgedeGoster: boolean
}

export interface KurumInfo {
  kurumAdi?: string
  makamAdi?: string
  kurumTipi?: string
}

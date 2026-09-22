export interface BiddingFirm {
  id: number
  temin_dosya_id: number
  firma_id: number
  unvan: string
  vergi_no?: string
  ilgili_kisi?: string
  telefon?: string
  email?: string
  teklif_toplami?: number
  para_birimi?: string
  temin_firma_id?: number
}

export interface PoolFirm {
  id: number
  unvan: string
  firma_kodu?: string
  istigal_konusu?: string
  il?: string
  vergi_no?: string
  telefon?: string
  email?: string
}

export interface BiddingKalem {
  id: number
  kalem_adi: string
  miktar: number
  birim: string
  tasinir_kodu?: string
  okas_kodu?: string
  aciklama?: string
  kdv_orani?: number
}

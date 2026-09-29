export interface FirmaStats {
  teklifToplami: number | null
  yaklasikMaliyet: number | null
  teslimTarihi: string | null
  yasaklilikDurumu: string | null
  vergiNo: string | null
  fiyatFarkiDayanagi?: string | null
  alimTuru?: string | null
  dosyaTarihi?: string | null
}

export interface KomisyonUye {
  id: number
  ad_soyad: string
  unvan?: string
  gorev?: string
  komisyon_turu?: string
  asli_yedek?: string
}

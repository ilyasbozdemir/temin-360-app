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

export interface MalKalemiItem {
  siraNo: number
  malzemeAdi: string
  ozelligi: string
  birimi: string
  miktari: number
  oncekiTeslimAlinan?: number
  toplamTeslimAlinan: number
  kabulMiktari: number
  birimFiyati?: number
  toplamTutar?: number
}

export interface KabulTutanakItem {
  id: string
  tutanakNo: string
  tutanakTarihi: string
  faturaNo?: string
  faturaTarihi?: string
  irsaliyeNo?: string
  irsaliyeTarihi?: string
  teslimYeri?: string
  teslimAlan?: string
  durum: 'kabul' | 'kismi' | 'sartli' | 'red'
  onaylandi?: boolean
  onayTarihi?: string
  islenmisMi?: boolean
  tutar?: number
  notlar?: string
  kalemler?: MalKalemiItem[]
  created_at?: string
}



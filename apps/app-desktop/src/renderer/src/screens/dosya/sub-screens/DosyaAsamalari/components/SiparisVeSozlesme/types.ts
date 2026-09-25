export type StepId =
  | 'teslimat'
  | 'sonuc_onay'
  | 'yasaklilik'
  | 'siparis'
  | 'sozlesme'
  | 'timeline'

export interface FirmaStats {
  teklifToplami: number | null
  yaklasikMaliyet: number | null
  teslimTarihi: string | null
  yasaklilikDurumu: string | null
  vergiNo: string | null
  teklifSozlesmeTuru: string | null
  sozlesmeYapilacakMi: number
  istekliFirmaSayisi: number
}

export interface IslemlerData {
  sozlesmeYapilacakMi: boolean
  siparisFormuGerekli: boolean
  teslimGunu: number
  teslimTarihi: string
  teklifSozlesmeTuru: string
}

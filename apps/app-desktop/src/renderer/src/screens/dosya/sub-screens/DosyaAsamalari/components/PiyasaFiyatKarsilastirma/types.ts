export interface ComparisonRow {
  id: number
  kalemAdi: string
  miktar: number
  birim: string
  beforeUnitPrice: number
  beforeTotal: number
  afterUnitPrice: number
  afterTotal: number
  diffUnitPrice: number
  diffTotal: number
  percentage: number
  winnerFirmName: string
  isSaving: boolean
}

export interface PiyasaFiyatKarsilastirmaTabProps {
  items: Array<{
    id: number
    kalem_adi: string
    miktar: number
    birim: string
  }>
  invitedFirms: Array<{
    id: number
    firma_id: number
    unvan: string
    temin_firma_id?: number
  }>
  beforeBids?: Record<string, number>
  afterBids?: Record<string, number>
  getLowestBidInfo: (itemId: number) => {
    lowestPrice: number
    winnerFirmName: string
    winnerFirmaId: number | null
  }
  getAverageBid: (itemId: number) => number
  onExportComparison?: () => void
}

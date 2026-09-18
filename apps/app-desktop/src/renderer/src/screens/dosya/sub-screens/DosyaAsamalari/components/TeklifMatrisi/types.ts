export interface BiddingFirm {
  id: number
  unvan: string
  teklif_toplami?: number
  para_birimi?: string
}

export interface BiddingKalem {
  id: number
  kalem_adi: string
  miktar: number
  birim: string
}

export interface TeklifMatrisiProps {
  invitedFirms: BiddingFirm[]
  items: BiddingKalem[]
  bids: Record<string, number>
  getEstimatedCostTotal: () => number
  getLowestBidInfo: (kalemId: number) => { price: number; firmaId: number | null }
  getAverageBid: (kalemId: number) => number
  handlePriceChange: (kalemId: number, firmaId: number, val: string) => Promise<void>
}

import Decimal from 'decimal.js'

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP })

export interface NeedItemFirmaTeklif {
  fiyat: string
}

export interface NeedItemFirmaTeklifDetay {
  birimFiyat: string
  tutar: string
  hasPrice: boolean
}

export interface NeedItem {
  siraNo: number
  kodu: string
  malzemeAdi: any
  ozelligi: string
  birimi: any
  kdvOrani: any
  miktar: string
  firmaTeklifleri: NeedItemFirmaTeklif[]
  firmaTeklifleriDetay: NeedItemFirmaTeklifDetay[]
  enUygunFirmaAdi: string
  enDusukFiyat: string
  toplamBedel: string
}

export interface CalculateNeedItemsResult {
  needItems: NeedItem[]
  grandTotal: number
  totalKdv: number
}

export function calculateNeedItems(
  kalemlerData: any[],
  firms: any[],
  bidsMap: Record<string, number>,
  isLowestBasis: boolean,
  formatTR: (val: number) => string
): CalculateNeedItemsResult {
  let grandTotalDecimal = new Decimal(0)
  let totalKdvDecimal = new Decimal(0)

  const needItems =
    kalemlerData?.map((k: any, index: number) => {
      const itemPrices = firms.map((f: any) => ({
        unvan: f.unvan,
        price: new Decimal(bidsMap[`${k.id}_${f.temin_firma_id}`] || 0)
      }))
      const validPrices = itemPrices.filter((p: any) => p.price.gt(0))

      let chosenPrice = new Decimal(0)
      if (validPrices.length > 0) {
        if (isLowestBasis) {
          chosenPrice = validPrices.reduce(
            (min, p) => (p.price.lt(min) ? p.price : min),
            validPrices[0].price
          )
        } else {
          const sumPrices = validPrices.reduce((sum, p) => sum.plus(p.price), new Decimal(0))
          chosenPrice = sumPrices.div(validPrices.length)
        }
      }

      const miktarDecimal = new Decimal(k.miktar || 0)
      const toplamBedelDecimal = chosenPrice.times(miktarDecimal)
      grandTotalDecimal = grandTotalDecimal.plus(toplamBedelDecimal)

      const kdvRateDecimal = new Decimal(k.kdv_orani || 0)
      const kdvAmountDecimal = toplamBedelDecimal.times(kdvRateDecimal.div(100))
      totalKdvDecimal = totalKdvDecimal.plus(kdvAmountDecimal)

      const minPrice =
        validPrices.length > 0
          ? validPrices.reduce((min, p) => (p.price.lt(min) ? p.price : min), validPrices[0].price)
          : new Decimal(0)

      const enUygunFirma =
        validPrices.length > 0
          ? validPrices.reduce((prev: any, curr: any) => (prev.price.lt(curr.price) ? prev : curr))
          : null
      const enUygunFirmaAdi = enUygunFirma ? enUygunFirma.unvan : 'Teklif Yok'

      const firmaTeklifleri = firms.map((f: any) => {
        const price = new Decimal(bidsMap[`${k.id}_${f.temin_firma_id}`] || 0)
        return {
          fiyat: price.gt(0) ? formatTR(price.toNumber()) : '-'
        }
      })

      const firmaTeklifleriDetay = firms.map((f: any) => {
        const price = new Decimal(bidsMap[`${k.id}_${f.temin_firma_id}`] || 0)
        const total = price.times(miktarDecimal)
        return {
          birimFiyat: price.gt(0) ? formatTR(price.toNumber()) : '-',
          tutar: total.gt(0) ? formatTR(total.toDecimalPlaces(2).toNumber()) : '-',
          hasPrice: price.gt(0)
        }
      })

      const finalToplamBedel = toplamBedelDecimal.toDecimalPlaces(2).toNumber()

      return {
        siraNo: index + 1,
        kodu: k.tasinir_kodu || k.okas_kodu || '-',
        malzemeAdi: k.kalem_adi,
        ozelligi: k.aciklama || '',
        birimi: k.birim,
        kdvOrani: k.kdv_orani,
        miktar: formatTR(miktarDecimal.toNumber()),
        firmaTeklifleri,
        firmaTeklifleriDetay,
        enUygunFirmaAdi,
        enDusukFiyat: minPrice.gt(0) ? formatTR(minPrice.toDecimalPlaces(2).toNumber()) : '-',
        toplamBedel: finalToplamBedel > 0 ? formatTR(finalToplamBedel) : '-'
      }
    }) || []

  const grandTotal = grandTotalDecimal.toDecimalPlaces(2).toNumber()
  const totalKdv = totalKdvDecimal.toDecimalPlaces(2).toNumber()

  return { needItems, grandTotal, totalKdv }
}

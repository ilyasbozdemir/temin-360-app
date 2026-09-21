import Decimal from 'decimal.js'
import { paraYaziyaCevir } from '../../../constants/sayiEslesmeleri'

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP })

export interface CalculateFirmaTeklifleriResult {
  firmaToplamlari: { toplam: string }[]
  calculatedTeklifler: {
    siraNo: number
    istekliUnvani: string
    teklifBedeli: string
    teklifBedeliRaw: number
    yaziIle: string
  }[]
  enAvantajliTeklifSahibi: string
  enAvantajliTeklifBedeli: string
  ikinciAvantajliTeklifSahibi: string
  ikinciAvantajliTeklifBedeli: string
}

export function calculateFirmaTeklifleri(
  firms: any[],
  kalemlerData: any[],
  bidsMap: Record<string, number>,
  formatTR: (val: number) => string
): CalculateFirmaTeklifleriResult {
  const firmaToplamlari = firms.map((f: any) => {
    let sumDecimal = new Decimal(0)
    kalemlerData?.forEach((k: any) => {
      const price = new Decimal(bidsMap[`${k.id}_${f.temin_firma_id}`] || 0)
      const miktar = new Decimal(k.miktar || 0)
      sumDecimal = sumDecimal.plus(price.times(miktar))
    })
    const finalSum = sumDecimal.toDecimalPlaces(2).toNumber()
    return {
      toplam: formatTR(finalSum)
    }
  })

  const calculatedTeklifler = firms
    .map((f: any, index: number) => {
      let sumDecimal = new Decimal(0)
      kalemlerData?.forEach((k: any) => {
        const price = new Decimal(bidsMap[`${k.id}_${f.temin_firma_id}`] || 0)
        const miktar = new Decimal(k.miktar || 0)
        sumDecimal = sumDecimal.plus(price.times(miktar))
      })
      const finalSum = sumDecimal.toDecimalPlaces(2).toNumber()
      return {
        siraNo: index + 1,
        istekliUnvani: f.unvan,
        teklifBedeli: formatTR(finalSum),
        teklifBedeliRaw: finalSum,
        yaziIle: paraYaziyaCevir(finalSum)
      }
    })
    .sort((a: any, b: any) => a.teklifBedeliRaw - b.teklifBedeliRaw)

  const enAvantajliTeklifSahibi = calculatedTeklifler[0]?.istekliUnvani || ''
  const enAvantajliTeklifBedeli = calculatedTeklifler[0]?.teklifBedeli || ''
  const ikinciAvantajliTeklifSahibi = calculatedTeklifler[1]?.istekliUnvani || ''
  const ikinciAvantajliTeklifBedeli = calculatedTeklifler[1]?.teklifBedeli || ''

  return {
    firmaToplamlari,
    calculatedTeklifler,
    enAvantajliTeklifSahibi,
    enAvantajliTeklifBedeli,
    ikinciAvantajliTeklifSahibi,
    ikinciAvantajliTeklifBedeli
  }
}

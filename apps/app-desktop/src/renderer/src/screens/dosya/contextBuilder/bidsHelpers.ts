import { paraYaziyaCevir } from '../../../constants/sayiEslesmeleri'

export function calculateFirmaTeklifleri(
  firms: any[],
  kalemlerData: any[],
  bidsMap: Record<string, number>,
  formatTR: (val: number) => string
) {
  const firmaToplamlari = firms.map((f: any) => {
    let sum = 0
    kalemlerData?.forEach((k: any) => {
      const price = bidsMap[`${k.id}_${f.temin_firma_id}`] || 0
      sum += price * (k.miktar || 0)
    })
    return {
      toplam: formatTR(sum)
    }
  })

  const calculatedTeklifler = firms
    .map((f: any, index: number) => {
      let sum = 0
      kalemlerData?.forEach((k: any) => {
        const price = bidsMap[`${k.id}_${f.temin_firma_id}`] || 0
        sum += price * (k.miktar || 0)
      })
      return {
        siraNo: index + 1,
        istekliUnvani: f.unvan,
        teklifBedeli: formatTR(sum),
        teklifBedeliRaw: sum,
        yaziIle: paraYaziyaCevir(sum)
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

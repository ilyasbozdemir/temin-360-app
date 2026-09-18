export function calculateNeedItems(
  kalemlerData: any[],
  firms: any[],
  bidsMap: Record<string, number>,
  isLowestBasis: boolean,
  formatTR: (val: number) => string
) {
  let grandTotal = 0
  let totalKdv = 0

  const needItems =
    kalemlerData?.map((k: any, index: number) => {
      const itemPrices = firms.map((f: any) => ({
        unvan: f.unvan,
        price: bidsMap[`${k.id}_${f.temin_firma_id}`] || 0
      }))
      const validPrices = itemPrices.filter((p: any) => p.price > 0)
      const minPrice =
        validPrices.length > 0 ? Math.min(...validPrices.map((p: any) => p.price)) : 0
      const avgPrice =
        validPrices.length > 0
          ? validPrices.reduce((sum: number, p: any) => sum + p.price, 0) / validPrices.length
          : 0

      const chosenPrice = isLowestBasis ? minPrice : avgPrice
      const toplamBedel = chosenPrice * (k.miktar || 0)
      grandTotal += toplamBedel

      const kdvRate = k.kdv_orani || 0
      totalKdv += toplamBedel * (kdvRate / 100)

      const enUygunFirma =
        validPrices.length > 0
          ? validPrices.reduce((prev: any, curr: any) => (prev.price < curr.price ? prev : curr))
          : null
      const enUygunFirmaAdi = enUygunFirma ? enUygunFirma.unvan : 'Teklif Yok'

      const firmaTeklifleri = firms.map((f: any) => {
        const price = bidsMap[`${k.id}_${f.temin_firma_id}`] || 0
        return {
          fiyat: price > 0 ? formatTR(price) : '-'
        }
      })

      const firmaTeklifleriDetay = firms.map((f: any) => {
        const price = bidsMap[`${k.id}_${f.temin_firma_id}`] || 0
        const total = price * (k.miktar || 0)
        return {
          birimFiyat: price > 0 ? formatTR(price) : '-',
          tutar: total > 0 ? formatTR(total) : '-',
          hasPrice: price > 0
        }
      })

      return {
        siraNo: index + 1,
        kodu: k.tasinir_kodu || k.okas_kodu || '-',
        malzemeAdi: k.kalem_adi,
        ozelligi: k.aciklama || '',
        birimi: k.birim,
        kdvOrani: k.kdv_orani,
        miktar: formatTR(k.miktar || 0),
        firmaTeklifleri,
        firmaTeklifleriDetay,
        enUygunFirmaAdi,
        enDusukFiyat: minPrice > 0 ? formatTR(minPrice) : '-',
        toplamBedel: toplamBedel > 0 ? formatTR(toplamBedel) : '-'
      }
    }) || []

  return { needItems, grandTotal, totalKdv }
}

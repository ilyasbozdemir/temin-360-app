export type ProcurementType = 'mal' | 'hizmet'

export interface PriceDifferenceComponent {
  key: string // b1, b2...
  name: string // İşçilik, akaryakıt, TÜFE, ÜFE vb.
  weight: number | null // sözleşmeden girilecek
}

export interface PriceDifferenceConfig {
  label: string
  type: ProcurementType
  decisionDate: string
  decisionNo: string
  // Pn = a + b1*(I1n/I1o) + b2*(I2n/I2o) + ...
  fixedCoefficient: number | null // a: sözleşmeden girilecek
  components: PriceDifferenceComponent[]
}

export const PRICE_DIFF_CONFIG: Record<string, PriceDifferenceConfig> = {
  '2013/5216': {
    label: '31.08.2013 Tarih ve 2013/5216 Sayılı Mal Alımı Bakanlar Kurulu Kararına Göre',
    type: 'mal',
    decisionDate: '2013-08-31',
    decisionNo: '2013/5216',
    fixedCoefficient: null,
    components: []
  },
  '2013/5215': {
    label: '31.08.2013 Tarih ve 2013/5215 Sayılı Hizmet Alımı Bakanlar Kurulu Kararına Göre',
    type: 'hizmet',
    decisionDate: '2013-08-31',
    decisionNo: '2013/5215',
    fixedCoefficient: null,
    components: []
  }
}

export interface PriceDifferenceParams {
  workAmount: number // An: dönem hakediş tutarı
  baseIndexes: Record<string, number> // Io değerleri (Temel endeksler)
  currentIndexes: Record<string, number> // In değerleri (Güncel endeksler)
  customComponents?: PriceDifferenceComponent[]
  customFixedCoefficient?: number
}

/**
 * Fiyat Farkı Hesabı
 * 
 * Formül: F = An * (Pn - 1)
 * Pn = a + ∑ [bi * (In_i / Io_i)]
 * 
 * @param configKey - '2013/5215' veya '2013/5216' ya da tam etiket metni
 * @param params - Hesaplama parametreleri (Hakediş tutarı An, Io ve In endeksleri)
 */
export function calculatePriceDifference(
  configKey: string,
  params: PriceDifferenceParams
): { pn: number; difference: number; formattedDifference: string } {
  const normalizedKey = configKey.includes('5215')
    ? '2013/5215'
    : configKey.includes('5216')
      ? '2013/5216'
      : configKey

  const cfg = PRICE_DIFF_CONFIG[normalizedKey]
  const a = params.customFixedCoefficient ?? cfg?.fixedCoefficient ?? 0
  const components =
    params.customComponents && params.customComponents.length > 0
      ? params.customComponents
      : cfg?.components || []

  const componentSum = components.reduce((sum, c) => {
    const w = c.weight ?? 0
    const io = params.baseIndexes[c.key]
    const inVal = params.currentIndexes[c.key]

    if (!io || io === 0 || inVal === undefined) return sum
    return sum + w * (inVal / io)
  }, 0)

  // Eğer components boşsa ama doğrudan endeksler verilmişse (ör: b1)
  const fallbackSum =
    components.length === 0 && Object.keys(params.baseIndexes).length > 0
      ? Object.keys(params.baseIndexes).reduce((sum, key) => {
          const io = params.baseIndexes[key]
          const inVal = params.currentIndexes[key]
          if (!io || io === 0 || inVal === undefined) return sum
          return sum + inVal / io
        }, 0)
      : 0

  const pn = a + (components.length > 0 ? componentSum : fallbackSum)
  const difference = Math.round(params.workAmount * (pn - 1) * 100) / 100

  return {
    pn: Number(pn.toFixed(4)),
    difference,
    formattedDifference: new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(difference)
  }
}

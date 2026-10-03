import { numberToWords, amountToWordsTL } from '@temin360/document-templates'

export function sayiyiYaziyaCevir(n: number): string {
  if (n === 0) return 'sıfır'
  if (n < 0) return 'eksi ' + sayiyiYaziyaCevir(Math.abs(n))
  return numberToWords(n).toLocaleLowerCase('tr-TR')
}

export function paraYaziyaCevir(val: string | number): string {
  return amountToWordsTL(val, { paraBirimi: 'TL', altBirim: 'Kr.' })
}

export const SAYI_YAZI_MAP: Record<number | string, string> = {}

for (let i = 1; i <= 100; i++) {
  SAYI_YAZI_MAP[i] = `${i} (${sayiyiYaziyaCevir(i)})`
}

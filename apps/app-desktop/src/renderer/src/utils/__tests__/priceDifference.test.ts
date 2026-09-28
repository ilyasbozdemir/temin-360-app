import { describe, it, expect } from 'vitest'
import { calculatePriceDifference } from '../priceDifference'
import { getAyarVergiOrani, hesaplaKesinti } from '../hesaplamalar'

describe('calculatePriceDifference', () => {
  it('should calculate price difference correctly with base and current indexes', () => {
    const result = calculatePriceDifference('2013/5215', {
      workAmount: 1_000_000,
      baseIndexes: { b1: 100 },
      currentIndexes: { b1: 112 }
    })

    expect(result.pn).toBe(1.12)
    expect(result.difference).toBe(120_000)
    expect(result.formattedDifference).toBe('120.000,00')
  })

  it('should support full label string matching', () => {
    const result = calculatePriceDifference(
      '31.08.2013 Tarih ve 2013/5216 Sayılı Mal Alımı Bakanlar Kurulu Kararına Göre',
      {
        workAmount: 500_000,
        baseIndexes: { b1: 100 },
        currentIndexes: { b1: 105 }
      }
    )

    expect(result.pn).toBe(1.05)
    expect(result.difference).toBe(25_000)
  })

  it('should calculate with custom components and weights', () => {
    const result = calculatePriceDifference('2013/5215', {
      workAmount: 100_000,
      customFixedCoefficient: 0.1, // a = 0.10
      customComponents: [
        { key: 'b1', name: 'İşçilik', weight: 0.5 },
        { key: 'b2', name: 'Akaryakıt', weight: 0.4 }
      ],
      baseIndexes: { b1: 100, b2: 200 },
      currentIndexes: { b1: 120, b2: 250 } // b1: 1.2 * 0.5 = 0.60; b2: 1.25 * 0.4 = 0.50 => Pn = 0.10 + 0.60 + 0.50 = 1.20
    })

    expect(result.pn).toBe(1.2)
    expect(result.difference).toBe(20_000)
  })

  it('should retrieve custom tax rate from settings or fallback to default', () => {
    const mockSettings = {
      rates: JSON.stringify([
        { id: '1', ad: 'Hakediş Damga Vergisi', oran: '9,48', tur: 'binde' }
      ])
    }
    const rate = getAyarVergiOrani(mockSettings, 'hakedis_damga')
    expect(rate.oran).toBe('9,48')
    expect(rate.tur).toBe('binde')
    expect(hesaplaKesinti(100000, rate.oran, rate.tur)).toBe(948)
  })
})


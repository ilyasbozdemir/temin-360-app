import { describe, it, expect } from 'vitest'
import {
  formatCurrency,
  formatDate,
  getInitials,
  normalizeForMatch,
  sayiyiYaziyaCevir,
  amountToWordsTL
} from '../formatters'

describe('formatters utility', () => {
  describe('formatCurrency', () => {
    it('formats positive numbers with Turkish locale and default currency symbol', () => {
      const res = formatCurrency(12500.5)
      expect(res).toContain('12.500,50')
      expect(res).toContain('₺')
    })

    it('handles symbol option and fallback properly', () => {
      expect(formatCurrency(null, { fallback: '-' })).toBe('-')
      expect(formatCurrency(undefined, { fallback: '0,00 ₺' })).toBe('0,00 ₺')
      expect(formatCurrency(100, { showSymbol: false })).toBe('100,00')
    })
  })

  describe('formatDate', () => {
    it('formats ISO dates correctly into Turkish format', () => {
      const formatted = formatDate('2026-10-03')
      expect(formatted).toBe('03.10.2026')
    })

    it('returns empty string or fallback for invalid/empty dates', () => {
      expect(formatDate(null, { fallback: '' })).toBe('')
      expect(formatDate(undefined, { fallback: '-' })).toBe('-')
      expect(formatDate('invalid-date')).toBe('invalid-date')
    })
  })

  describe('getInitials', () => {
    it('extracts initials from single or multiple word names', () => {
      expect(getInitials('İlyas Bozdemir')).toBe('İB')
      expect(getInitials('Ahmet')).toBe('A')
      expect(getInitials('')).toBe('SY')
      expect(getInitials(null)).toBe('SY')
    })
  })

  describe('normalizeForMatch', () => {
    it('normalizes Turkish characters and removes whitespace/punctuation', () => {
      expect(normalizeForMatch('İhale Komisyonu Kararı 2026')).toBe('ihalekomisyonukarari2026')
      expect(normalizeForMatch('Şartname & Sözleşme')).toBe('sartnamesozlesme')
    })
  })

  describe('sayiyiYaziyaCevir & amountToWordsTL', () => {
    it('converts monetary values to Turkish words', () => {
      const result = amountToWordsTL(1500)
      expect(result).toBe('BİN BEŞYÜZ TL')
    })
  })
})

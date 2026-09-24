import { describe, it, expect } from 'vitest'
import { TEMPLATE_NAMES } from '../templateConstants'

describe('Template Constants & Metadata Integrity', () => {
  it('should define non-empty mapping for TEMPLATE_NAMES', () => {
    expect(Object.keys(TEMPLATE_NAMES).length).toBeGreaterThan(0)
  })

  it('should map core templates to non-empty Turkish title strings', () => {
    expect(TEMPLATE_NAMES['harcama-talimati']).toBe('HARCAMA TALİMATI')
    expect(TEMPLATE_NAMES['ihtiyac-listesi']).toBe('İHTİYAÇ LİSTESİ')
    expect(TEMPLATE_NAMES['piyasa-fiyat-arastirma-tutanagi']).toBe(
      'PİYASA FİYAT ARAŞTIRMA TUTANAĞI'
    )
    expect(TEMPLATE_NAMES['dogrudan-temin-onay-belgesi']).toBe('DOĞRUDAN TEMİN ONAY BELGESİ')
  })

  it('should ensure all mapped values are non-empty strings', () => {
    for (const [key, value] of Object.entries(TEMPLATE_NAMES)) {
      expect(key.length).toBeGreaterThan(0)
      expect(typeof value).toBe('string')
      expect(value.trim().length).toBeGreaterThan(0)
    }
  })
})

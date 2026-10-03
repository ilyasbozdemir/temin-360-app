export interface DefaultRoleConfig {
  gorev: string
  belgedeGoster: boolean
  belgeKapsami: 'tumu' | 'piyasa_arastirma' | 'muayene_kabul' | 'olur_onay' | 'ozel' | 'gizli'
}

export const DEFAULT_MALIYET_ROLES: DefaultRoleConfig[] = [
  { gorev: 'Harcama Yetkilisi', belgedeGoster: true, belgeKapsami: 'olur_onay' },
  { gorev: 'Satın Alma Harcama Yetkilisi', belgedeGoster: true, belgeKapsami: 'olur_onay' },
  { gorev: 'Gerçekleştirme Görevlisi', belgedeGoster: true, belgeKapsami: 'olur_onay' },
  { gorev: 'Muhasebe Yetkilisi', belgedeGoster: false, belgeKapsami: 'gizli' },
  { gorev: 'Fiyat Araştırma Görevlisi', belgedeGoster: true, belgeKapsami: 'piyasa_arastirma' },
  { gorev: 'Fiyat Araştırma Görevlisi', belgedeGoster: true, belgeKapsami: 'piyasa_arastirma' },
  { gorev: 'Fiyat Araştırma Görevlisi', belgedeGoster: true, belgeKapsami: 'piyasa_arastirma' },
  { gorev: 'Fiyat Araştırma Görevlisi', belgedeGoster: true, belgeKapsami: 'piyasa_arastirma' },
  { gorev: 'Fiyat Araştırma Görevlisi', belgedeGoster: true, belgeKapsami: 'piyasa_arastirma' },
  { gorev: 'Fiyat Araştırma Görevlisi', belgedeGoster: true, belgeKapsami: 'piyasa_arastirma' }
]

export const DEFAULT_MUAYENE_ROLES: DefaultRoleConfig[] = [
  { gorev: 'Komisyon Başkanı', belgedeGoster: true, belgeKapsami: 'muayene_kabul' },
  { gorev: 'Üye', belgedeGoster: true, belgeKapsami: 'muayene_kabul' },
  { gorev: 'Üye', belgedeGoster: true, belgeKapsami: 'muayene_kabul' },
  { gorev: 'Üye', belgedeGoster: true, belgeKapsami: 'muayene_kabul' },
  { gorev: 'Üye', belgedeGoster: true, belgeKapsami: 'muayene_kabul' },
  { gorev: 'Üye', belgedeGoster: true, belgeKapsami: 'muayene_kabul' },
  { gorev: 'Üye', belgedeGoster: true, belgeKapsami: 'muayene_kabul' },
  { gorev: 'Üye', belgedeGoster: true, belgeKapsami: 'muayene_kabul' },
  { gorev: 'Üye', belgedeGoster: true, belgeKapsami: 'muayene_kabul' }
]

export function getRoleDefaults(gorevName: string): {
  belgedeGoster: boolean
  belgeKapsami: 'tumu' | 'piyasa_arastirma' | 'muayene_kabul' | 'olur_onay' | 'ozel' | 'gizli'
} {
  const g = (gorevName || '').toLowerCase().trim()
  if (g.includes('muhasebe')) {
    return { belgedeGoster: false, belgeKapsami: 'gizli' }
  }
  if (
    g.includes('harcama') ||
    g.includes('gerçekleştirme') ||
    g.includes('gerceklestirme') ||
    g.includes('onay') ||
    g.includes('olur')
  ) {
    return { belgedeGoster: true, belgeKapsami: 'olur_onay' }
  }
  if (g.includes('fiyat') || g.includes('piyasa') || g.includes('yaklaşık') || g.includes('yaklasik')) {
    return { belgedeGoster: true, belgeKapsami: 'piyasa_arastirma' }
  }
  if (g.includes('muayene') || g.includes('kabul')) {
    return { belgedeGoster: true, belgeKapsami: 'muayene_kabul' }
  }
  return { belgedeGoster: true, belgeKapsami: 'tumu' }
}


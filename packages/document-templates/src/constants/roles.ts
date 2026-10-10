export type Scope = 'tumu' | 'piyasa_arastirma' | 'muayene_kabul' | 'olur_onay' | 'ozel' | 'gizli'

export const ROLE = {
  HARCAMA_YETKILISI: 'harcama_yetkilisi',
  IHALE_YETKILISI: 'ihale_yetkilisi',
  GERCEKLESTIRME_GOREVLISI: 'gerceklestirme_gorevlisi',
  MUHASEBE: 'muhasebe',
  HAZIRLAYAN: 'hazirlayan',
  TALEP_EDEN: 'talep_eden',
  ONAYLAYAN: 'onaylayan',
  KOMISYON_BASKANI: 'komisyon_baskani',
  KOMISYON_UYESI: 'komisyon_uyesi'
} as const

export type RoleCode = (typeof ROLE)[keyof typeof ROLE]

export const ROLE_META: Record<RoleCode, { label: string; defaultScope: Scope }> = {
  [ROLE.HARCAMA_YETKILISI]: { label: 'Harcama Yetkilisi', defaultScope: 'olur_onay' },
  [ROLE.IHALE_YETKILISI]: { label: 'İhale Yetkilisi', defaultScope: 'olur_onay' },
  [ROLE.GERCEKLESTIRME_GOREVLISI]: { label: 'Gerçekleştirme Görevlisi', defaultScope: 'olur_onay' },
  [ROLE.MUHASEBE]: { label: 'Muhasebe Yetkilisi', defaultScope: 'gizli' },
  [ROLE.HAZIRLAYAN]: { label: 'Hazırlayan / Birim Görevlisi', defaultScope: 'piyasa_arastirma' },
  [ROLE.TALEP_EDEN]: { label: 'Talep Eden', defaultScope: 'piyasa_arastirma' },
  [ROLE.ONAYLAYAN]: { label: 'Onaylayan / Olur Makamı', defaultScope: 'olur_onay' },
  [ROLE.KOMISYON_BASKANI]: { label: 'Komisyon Başkanı', defaultScope: 'tumu' },
  [ROLE.KOMISYON_UYESI]: { label: 'Komisyon Üyesi', defaultScope: 'tumu' }
}

/**
 * Türkçe karakter uyumlu metin katlama (fold) yardımcısı.
 * "İhale Yetkilisi" -> "ihale yetkilisi"
 * "BAŞKAN" -> "baskan"
 */
export function foldRoleName(str?: string | null): string {
  if (!str) return ''
  return str
    .trim()
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[\s-_]+/g, ' ')
}

/**
 * Serbest metinden (Görev Unvanı / Adı) standart RoleCode türetici.
 */
export function toRoleCode(roleName?: string | null): RoleCode {
  if (!roleName) return ROLE.KOMISYON_UYESI
  const norm = foldRoleName(roleName)

  if (norm.includes('harcama yetkili')) return ROLE.HARCAMA_YETKILISI
  if (norm.includes('ihale yetkili')) return ROLE.IHALE_YETKILISI
  if (norm.includes('gerceklestirme')) return ROLE.GERCEKLESTIRME_GOREVLISI
  if (norm.includes('muhasebe')) return ROLE.MUHASEBE
  if (norm.includes('hazirlayan')) return ROLE.HAZIRLAYAN
  if (norm.includes('talep eden')) return ROLE.TALEP_EDEN
  if (norm.includes('onaylayan') || norm.includes('olur makam')) return ROLE.ONAYLAYAN
  if (norm.includes('baskan')) return ROLE.KOMISYON_BASKANI
  if (norm.includes('uye')) return ROLE.KOMISYON_UYESI

  if (norm === 'harcama_yetkilisi') return ROLE.HARCAMA_YETKILISI
  if (norm === 'ihale_yetkilisi') return ROLE.IHALE_YETKILISI
  if (norm === 'gerceklestirme_gorevlisi') return ROLE.GERCEKLESTIRME_GOREVLISI
  if (norm === 'muhasebe') return ROLE.MUHASEBE
  if (norm === 'hazirlayan') return ROLE.HAZIRLAYAN
  if (norm === 'talep_eden') return ROLE.TALEP_EDEN
  if (norm === 'onaylayan') return ROLE.ONAYLAYAN
  if (norm === 'komisyon_baskani') return ROLE.KOMISYON_BASKANI
  if (norm === 'komisyon_uyesi') return ROLE.KOMISYON_UYESI

  return ROLE.KOMISYON_UYESI
}

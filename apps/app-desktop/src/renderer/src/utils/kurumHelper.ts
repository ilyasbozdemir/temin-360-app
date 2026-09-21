export interface SubInstOption {
  value: string
  label: string
}

export interface InstitutionSuffixes {
  label: string
  kurumumuz: string // 1st person plural (bizim)
  kurumunuz: string // 2nd person plural (sizin)
  kurumu: string // 3rd person singular possessive (onun)
  kurumlari: string // 3rd person plural possessive (onların)
}

export const INSTITUTION_MAP: Record<string, InstitutionSuffixes> = {
  mudurluk: {
    label: 'İl / İlçe Müdürlüğü',
    kurumumuz: 'Müdürlüğümüz',
    kurumunuz: 'Müdürlüğünüz',
    kurumu: 'Müdürlüğü',
    kurumlari: 'Müdürlükleri'
  },
  bakanlik: {
    label: 'Bakanlık',
    kurumumuz: 'Bakanlığımız',
    kurumunuz: 'Bakanlığınız',
    kurumu: 'Bakanlığı',
    kurumlari: 'Bakanlıkları'
  },
  valilik: {
    label: 'Valilik',
    kurumumuz: 'Valiliğimiz',
    kurumunuz: 'Valiliğiniz',
    kurumu: 'Valiliği',
    kurumlari: 'Valilikleri'
  },
  kaymakamlik: {
    label: 'Kaymakamlık',
    kurumumuz: 'Kaymakamlığımız',
    kurumunuz: 'Kaymakamlığınız',
    kurumu: 'Kaymakamlığı',
    kurumlari: 'Kaymakamlıkları'
  },
  universite: {
    label: 'Üniversite',
    kurumumuz: 'Üniversitemiz',
    kurumunuz: 'Üniversiteniz',
    kurumu: 'Üniversitesi',
    kurumlari: 'Üniversiteleri'
  },
  belediye: {
    label: 'Belediye',
    kurumumuz: 'Belediyemiz',
    kurumunuz: 'Belediyeniz',
    kurumu: 'Belediyesi',
    kurumlari: 'Belediyeleri'
  },
  il_ozel: {
    label: 'İl Özel İdresi',
    kurumumuz: 'İl Özel İdaremiz',
    kurumunuz: 'İl Özel İdareniz',
    kurumu: 'İl Özel İdaresi',
    kurumlari: 'İl Özel İdareleri'
  },
  koy: {
    label: 'Köy Muhtarlığı',
    kurumumuz: 'Muhtarlığımız',
    kurumunuz: 'Muhtarlığınız',
    kurumu: 'Muhtarlığı',
    kurumlari: 'Muhtarlıkları'
  },
  sgk: {
    label: 'Sosyal Güvenlik İl Müdürlüğü',
    kurumumuz: 'Müdürlüğümüz',
    kurumunuz: 'Müdürlüğünüz',
    kurumu: 'Müdürlüğü',
    kurumlari: 'Müdürlükleri'
  },
  kurul: {
    label: 'Kurul / Kurum',
    kurumumuz: 'Kurulumuz',
    kurumunuz: 'Kurulunuz',
    kurumu: 'Kurulu',
    kurumlari: 'Kurulları'
  },
  diger: {
    label: 'Diğer',
    kurumumuz: 'Kurumumuz',
    kurumunuz: 'Kurumunuz',
    kurumu: 'Kurumu',
    kurumlari: 'Kurumları'
  }
}

export function getSubInstitutionOptions(instType: string, finKodu: string): SubInstOption[] {
  let keys: string[] = ['diger']
  if (instType === 'genel_butce' || finKodu === '1') {
    keys = ['mudurluk', 'bakanlik', 'valilik', 'kaymakamlik', 'diger']
  } else if (instType === 'ozel_butce' || finKodu === '2') {
    keys = ['universite', 'diger']
  } else if (instType === 'belediye' || finKodu === '5') {
    keys = ['belediye', 'il_ozel', 'koy', 'diger']
  } else if (instType === 'duzenleyici' || finKodu === '3') {
    keys = ['kurul', 'diger']
  } else if (instType === 'sosyal_guvenlik' || finKodu === '4') {
    keys = ['sgk', 'diger']
  }

  return keys.map((key) => {
    const item = INSTITUTION_MAP[key] || INSTITUTION_MAP.diger
    return {
      value: key,
      label: `${item.label} (Şablonlarda: "${item.kurumumuz}")`
    }
  })
}

export function getInstitutionSuffixes(
  subInstType: string,
  customSuffixes?: Partial<InstitutionSuffixes>
): InstitutionSuffixes {
  const base = INSTITUTION_MAP[subInstType] || INSTITUTION_MAP.diger
  if (subInstType === 'diger' && customSuffixes) {
    return {
      label: customSuffixes.label || base.label,
      kurumumuz: customSuffixes.kurumumuz || base.kurumumuz,
      kurumunuz: customSuffixes.kurumunuz || base.kurumunuz,
      kurumu: customSuffixes.kurumu || base.kurumu,
      kurumlari: customSuffixes.kurumlari || base.kurumlari
    }
  }
  return base
}

export function getKurumumuzText(
  _instType: string,
  _finKodu: string,
  subInstType: string,
  customKurumumuz?: string
): string {
  if (subInstType === 'diger' && customKurumumuz) {
    return customKurumumuz
  }
  const item = INSTITUTION_MAP[subInstType] || INSTITUTION_MAP.diger
  return item.kurumumuz
}

export function toPossessiveSuffix(str: string): string {
  if (!str) return 'Kurumumuzun'
  const trimmed = str.trim()
  const lower = trimmed.toLowerCase()
  if (
    lower.endsWith('n') ||
    lower.endsWith('in') ||
    lower.endsWith('ın') ||
    lower.endsWith('un') ||
    lower.endsWith('ün')
  ) {
    return trimmed
  }
  if (lower.endsWith('miz') || lower.endsWith('müz')) return `${trimmed}in`
  if (lower.endsWith('mız') || lower.endsWith('muz')) return `${trimmed}ın`
  if (
    lower.endsWith('si') ||
    lower.endsWith('su') ||
    lower.endsWith('sü') ||
    lower.endsWith('sı')
  ) {
    return `${trimmed}nin`
  }
  if (lower.endsWith('i') || lower.endsWith('ü')) return `${trimmed}nin`
  if (lower.endsWith('ı') || lower.endsWith('u')) return `${trimmed}nun`
  return `${trimmed}in`
}

export function getKurumIhtiyacYeriDefault(
  kurum?: {
    alt_kurum_bizim?: string
    alt_kurum_tipi?: string
    kurum_tipi?: string
  } | null
): string {
  if (!kurum) return 'Kurumumuzun'
  if (kurum.alt_kurum_bizim && String(kurum.alt_kurum_bizim).trim()) {
    return toPossessiveSuffix(kurum.alt_kurum_bizim.trim())
  }
  if (kurum.alt_kurum_tipi) {
    const map: Record<string, string> = {
      belediye: 'Belediyemizin',
      mudurluk: 'Müdürlüğümüzün',
      bakanlik: 'Bakanlığımızın',
      valilik: 'Valiliğimizin',
      kaymakamlik: 'Kaymakamlığımızın',
      universite: 'Üniversitemizin',
      il_ozel: 'İl Özel İdaremizin',
      koy: 'Muhtarlığımızın',
      sgk: 'Müdürlüğümüzün',
      kurul: 'Kurulumuzun',
      diger: 'Kurumumuzun'
    }
    if (map[kurum.alt_kurum_tipi]) return map[kurum.alt_kurum_tipi]
  }
  if (kurum.kurum_tipi === 'belediye') return 'Belediyemizin'
  if (kurum.kurum_tipi === 'ozel_butce') return 'Üniversitemizin'
  if (kurum.kurum_tipi === 'duzenleyici') return 'Kurulumuzun'
  if (kurum.kurum_tipi === 'genel_butce') return 'Müdürlüğümüzün'
  return 'Kurumumuzun'
}

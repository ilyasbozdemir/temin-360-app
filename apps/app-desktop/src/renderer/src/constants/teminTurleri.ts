import {
  Building,
  FileSpreadsheet,
  GraduationCap,
  Hammer,
  Package,
  Wrench,
  type LucideIcon
} from 'lucide-react'

/**
 * Tailwind renk tonlarına karşılık gelen tam stil haritası.
 * Tailwind'in safing mekanizması için sınıflar dinamik string birleştirme olmadan eksiksiz yazılmıştır.
 */
export const TONES = {
  blue: {
    badge:
      'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    icon: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 dark:bg-blue-500/20',
    hover: 'hover:border-blue-500/50 hover:bg-blue-50/40 dark:hover:bg-blue-950/20'
  },
  violet: {
    badge:
      'bg-violet-100 text-violet-700 dark:bg-violet-950/80 dark:text-violet-300 border-violet-200 dark:border-violet-800',
    icon: 'text-violet-600 dark:text-violet-400 bg-violet-500/10 dark:bg-violet-500/20',
    hover: 'hover:border-violet-500/50 hover:bg-violet-50/40 dark:hover:bg-violet-950/20'
  },
  amber: {
    badge:
      'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    icon: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-500/20',
    hover: 'hover:border-amber-500/50 hover:bg-amber-50/40 dark:hover:bg-amber-950/20'
  },
  pink: {
    badge:
      'bg-pink-100 text-pink-700 dark:bg-pink-950/80 dark:text-pink-300 border-pink-200 dark:border-pink-800',
    icon: 'text-pink-600 dark:text-pink-400 bg-pink-500/10 dark:bg-pink-500/20',
    hover: 'hover:border-pink-500/50 hover:bg-pink-50/40 dark:hover:bg-pink-950/20'
  },
  emerald: {
    badge:
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    icon: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/20',
    hover: 'hover:border-emerald-500/50 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20'
  },
  indigo: {
    badge:
      'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    icon: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 dark:bg-indigo-500/20',
    hover: 'hover:border-indigo-500/50 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20'
  },
  teal: {
    badge:
      'bg-teal-100 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300 border-teal-200 dark:border-teal-800',
    icon: 'text-teal-600 dark:text-teal-400 bg-teal-500/10 dark:bg-teal-500/20',
    hover: 'hover:border-teal-500/50 hover:bg-teal-50/40 dark:hover:bg-teal-950/20'
  },
  rose: {
    badge:
      'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    icon: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 dark:bg-rose-500/20',
    hover: 'hover:border-rose-500/50 hover:bg-rose-50/40 dark:hover:bg-rose-950/20'
  }
} as const

export type ToneName = keyof typeof TONES

export type AnaTeminTuru = 'mal' | 'hizmet' | 'yapim_isi'

export interface TeminTuruDef {
  id:
    | 'mal'
    | 'hizmet'
    | 'yapim_isi'
    | 'danismanlik'
    | 'hakedis'
    | 'ihale'
    | 'kira_2886'
    | 'satis_2886'
    | 'ecrimisil_2886'
  anaTur: AnaTeminTuru
  label: string
  kisa: string
  tone: ToneName
  icon: LucideIcon
  mevzuatAtfi: string
  desc: string
}

/**
 * 4734 Sayılı Kanun ve Doğrudan Temin Tebliği (11.07.2023, 32245) ile Uyumlu
 * Temin Türleri Tek Kaynak (Single Source of Truth) Tanımı.
 * Note: Danışmanlık mevzuatta hizmet alımının alt türüdür; anaTur: 'hizmet' olarak haritalanmıştır.
 */
export const TEMIN_TURLERI: readonly TeminTuruDef[] = [
  {
    id: 'mal',
    anaTur: 'mal',
    label: 'Mal Alımı',
    kisa: 'Mal',
    tone: 'blue',
    icon: Package,
    mevzuatAtfi: '4734 / 22-d & 22-a',
    desc: 'Tüketim malzemesi, kırtasiye, donanım, makine, tıbbi cihaz ve sarf alımları.'
  },
  {
    id: 'hizmet',
    anaTur: 'hizmet',
    label: 'Hizmet Alımı',
    kisa: 'Hizmet',
    tone: 'violet',
    icon: Wrench,
    mevzuatAtfi: '4734 / 22-d',
    desc: 'Bakım-onarım, araç kiralama, temizlik, yemek, organizasyon ve servis hizmetleri.'
  },
  {
    id: 'yapim_isi',
    anaTur: 'yapim_isi',
    label: 'Yapım İşi / Onarım',
    kisa: 'Yapım İşi',
    tone: 'amber',
    icon: Hammer,
    mevzuatAtfi: '4734 / 22-d',
    desc: 'Bina tadilatı, tesisat/elektrik yenileme, küçük inşaat ve bakım-onarım işleri.'
  },
  {
    id: 'danismanlik',
    anaTur: 'hizmet',
    label: 'Danışmanlık Hizmeti',
    kisa: 'Danışmanlık',
    tone: 'pink',
    icon: GraduationCap,
    mevzuatAtfi: 'Teknik & Müşavirlik',
    desc: 'Proje hazırlama, mimari etüt, harita, kontrollük ve müşavirlik hizmet alımları.'
  }
] as const

export type TeminTuruId = (typeof TEMIN_TURLERI)[number]['id'] | 'hakedis' | 'ihale'

/**
 * Metin girdi temizleyici ve slug dönüştürücü.
 * "Yapım İşi", "yapim-isi", "YAPIM_ISI" -> "yapim_isi"
 */
export const toKey = (v?: string | null): string => {
  if (!v?.trim()) return ''
  return v
    .trim()
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[\s-]+/g, '_')
}

const ALL_DEFINITIONS: readonly TeminTuruDef[] = [
  ...TEMIN_TURLERI,
  {
    id: 'hakedis',
    anaTur: 'hizmet',
    label: 'Hakediş İşlemleri',
    kisa: 'Hakediş',
    tone: 'emerald',
    icon: FileSpreadsheet,
    mevzuatAtfi: 'Sözleşme & Ödeme',
    desc: 'Devam eden mal/hizmet/yapım hakediş ödemeleri ve takibi.'
  },
  {
    id: 'ihale',
    anaTur: 'hizmet',
    label: 'İhale Süreci',
    kisa: 'İhale',
    tone: 'indigo',
    icon: Building,
    mevzuatAtfi: '4734 Kanunu',
    desc: 'Açık ihale veya belli istekliler arası ihale süreçleri.'
  },
  {
    id: 'kira_2886',
    anaTur: 'hizmet',
    label: '2886 Taşınmaz Kiralama',
    kisa: 'Kiralama (2886)',
    tone: 'teal',
    icon: Building,
    mevzuatAtfi: '2886 / Md. 45 & 51-g',
    desc: 'Kamu taşınmazlarının kiraya verilmesi, ecrimisil ve irtifak hakkı ihale süreçleri.'
  },
  {
    id: 'satis_2886',
    anaTur: 'hizmet',
    label: '2886 Taşınmaz / Taşınır Satışı',
    kisa: 'Satış (2886)',
    tone: 'rose',
    icon: Building,
    mevzuatAtfi: '2886 / Md. 45 & 35-a',
    desc: 'Mülkiyeti devlete/kuruma ait taşınmaz ve taşınır malların ihale ile satışı.'
  },
  {
    id: 'ecrimisil_2886',
    anaTur: 'hizmet',
    label: '2886 Ecrimisil & Fuzuli Şagil',
    kisa: 'Ecrimisil (2886)',
    tone: 'teal',
    icon: Building,
    mevzuatAtfi: '2886 / Md. 75',
    desc: 'İşgal edilen taşınmazların ecrimisil takibi ve 2886 sayılı kanun uygulamaları.'
  }
]

const byId = new Map<string, TeminTuruDef>(ALL_DEFINITIONS.map((t) => [t.id, t]))

const ALIASES: Record<string, string> = {
  mal_alimi: 'mal',
  hizmet_alimi: 'hizmet',
  yapim: 'yapim_isi',
  yapim_isi_onarim: 'yapim_isi',
  danismanlik_hizmeti: 'danismanlik',
  kira: 'kira_2886',
  kiralama: 'kira_2886',
  satis: 'satis_2886',
  ecrimisil: 'ecrimisil_2886',
  ihale2886: 'kira_2886'
}

export function getTeminTuruDef(value?: string | null): TeminTuruDef | undefined {
  if (!value) return undefined
  const key = toKey(value)
  const resolvedKey = ALIASES[key] || key
  return byId.get(resolvedKey)
}

export function isTeminTuru(value?: string | null): value is TeminTuruDef['id'] {
  return getTeminTuruDef(value) !== undefined
}

export function teminMeta(value?: string | null) {
  const def = getTeminTuruDef(value)
  if (!def) return undefined
  const toneObj = TONES[def.tone]
  return {
    ...def,
    badgeColor: toneObj.badge,
    iconColor: toneObj.icon,
    borderHover: toneObj.hover,
    badgeStyle: toneObj.badge,
    iconStyle: toneObj.icon,
    hoverStyle: toneObj.hover
  }
}

/**
 * Ekranlarda etiket basarken kullanılan standart yardımcı.
 * örn: teminLabel('yapim_isi') -> 'Yapım İşi / Onarım'
 */
export function teminLabel(value?: string | null, fallback = '—'): string {
  if (!value?.trim()) return fallback
  const meta = teminMeta(value)
  if (meta) return meta.label
  return value.trim()
}

/**
 * Kısa etiket isteyen yerler için yardımcı.
 * örn: teminKisaLabel('yapim_isi') -> 'Yapım İşi'
 */
export function teminKisaLabel(value?: string | null, fallback = '—'): string {
  if (!value?.trim()) return fallback
  const meta = teminMeta(value)
  if (meta) return meta.kisa
  return value.trim()
}

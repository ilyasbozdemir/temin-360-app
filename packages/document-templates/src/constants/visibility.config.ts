/**
 * visibility.config.ts
 * -----------------------------------------------------------------------------
 * Belge görünürlüğünün TEK kaynağı. Kural eklemek için bu dosyadaki TABLOLARA satır
 * ekle; başka yere if/else yazma.
 *
 * Konum: packages/document-templates/src/constants/visibility.config.ts
 * (renderer ve main bu paketten import eder; app-desktop'a bağımlılık olmasın)
 */

import {
  CANONICAL_TEMPLATE_ALIASES,
  normalizeTemplateKey,
  toCanonicalDocId,
} from './template-constants'

// ───────────────────────── 1) Tipler ─────────────────────────
export type DocGroup = 'piyasa_arastirma' | 'muayene_kabul' | 'olur_onay'
export type Scope = DocGroup | 'tumu' | 'ozel' | 'gizli'

export interface MemberScopeInput {
  belge_kapsami?: string | null
  belgeKapsami?: string | null
  hedef_belgeler?: string | string[] | null
  hedefBelgeler?: string | string[] | null
  [key: string]: any
}

// ───────────────────────── 2) VERİ: belge grupları ─────────────────────────
// Yeni şablon eklenince yalnızca ilgili listeye ID'sini ekle.
// Hiçbir gruba yazılmayan şablon "grupsuz"dur: sadece 'tumu' ve 'ozel' kapsamlı kişiler görünür.
// KARAR BEKLİYOR (grupsuz): ihtiyac-listesi, ihtiyac-talep-formu, tasinir-kayit-yetkilisi-gorusu,
//   teknik-sartname, luzum-muzekkeresi, luzum-muzekkeresi-onay-eki, gorevlendirme-yazisi
export const DOC_GROUPS: Record<DocGroup, readonly string[]> = {
  piyasa_arastirma: [
    'komisyon-gorevlendirme-onayi',
    'komisyon-gorevlendirme-onayi-eki',
    'piyasa-fiyat-arastirma-gorevlendirmesi',
    'son-alim-fiyat-cetveli',
    'fiyat-arastirma-mektubu',
    'birim-fiyat-teklif-mektubu',
    'arastirma-mektubu',
    'yaklasik-maliyet-cetveli',
    'piyasa-fiyat-arastirma-tutanagi'
  ],
  muayene_kabul: [
    'muayene-kabul-komisyonu',
    'muayene-kabul-tutanagi',
    'harcama-pusulasi',
    'luzum-muzekkeresi-teslim-tesellum'
  ],
  olur_onay: [
    'dogrudan-temin-onay-belgesi',
    'dogrudan-temin-sonuc-onay-belgesi',
    'idare-onay-belgesi',
    'harcama-talimati',
    'kabul-edilen-teklif',
    'butce-sorgusu',
    'dogrudan-temin-sozlesmesi',
    'sozlesmeye-davet',
    'odeme-yazisi'
  ]
}

// ───────────────────────── 3) VERİ: göreve göre varsayılan kapsam ─────────────────────────
// SIRA ÖNEMLİ: ilk eşleşen kural kazanır. Anahtar kelimeler Türkçe karakterden bağımsızdır
// (ç→c, ş→s ...) ve kelime BAŞINDAN eşleşir ("onay" -> "onaylayan" evet, "dolum" hayır).
export const ROLE_SCOPE_RULES: ReadonlyArray<{ scope: Scope; keywords: readonly string[] }> = [
  { scope: 'gizli', keywords: ['muhasebe'] },
  { scope: 'olur_onay', keywords: ['harcama', 'gerceklestirme', 'onay', 'olur'] },
  { scope: 'piyasa_arastirma', keywords: ['fiyat', 'piyasa', 'yaklasik'] },
  { scope: 'muayene_kabul', keywords: ['muayene', 'kabul'] }
]
export const DEFAULT_ROLE_SCOPE: Scope = 'tumu'

// ───────────────────────── 4) Yardımcılar ─────────────────────────
const TR_FOLD: Record<string, string> = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', â: 'a', î: 'i', û: 'u' }

/** Türkçe duyarlı küçük harf + aksan sadeleştirme. */
export function fold(text?: string | null): string {
  return (text || '')
    .toLocaleLowerCase('tr-TR')
    .replace(/[çğıöşüâîû]/g, (c) => TR_FOLD[c] || c)
    .replace(/\u0307/g, '')
}

export const tokens = (text?: string | null): string[] => fold(text).split(/[^a-z0-9]+/).filter(Boolean)

/** Görev adından varsayılan kapsamı üretir (if zinciri yok; tablo okur). */
export function defaultScopeForRole(gorevAd?: string | null): {
  belgeKapsami: Scope
  belgedeGoster: boolean
} {
  const words = tokens(gorevAd)
  const hit = ROLE_SCOPE_RULES.find((r) =>
    r.keywords.some((k) => words.some((w) => w.startsWith(k)))
  )
  const scope = hit ? hit.scope : DEFAULT_ROLE_SCOPE
  return { belgeKapsami: scope, belgedeGoster: scope !== 'gizli' }
}

const inGroup = (group: DocGroup, docIds: string[]): boolean =>
  docIds.some((id) => DOC_GROUPS[group].includes(id))

/** Şablonun grubunu döndürür (grupsuzsa null). */
export function groupOfDocument(docIds: string | string[]): DocGroup | null {
  const rawIds = Array.isArray(docIds) ? docIds : [docIds]
  const resolvedIds = rawIds.flatMap((id) => {
    const clean = normalizeTemplateKey(id)
    const canonical = CANONICAL_TEMPLATE_ALIASES[clean] || clean
    return [id, clean, canonical]
  })
  const groups = Object.keys(DOC_GROUPS) as DocGroup[]
  return groups.find((g) => inGroup(g, resolvedIds)) ?? null
}

function parseTargets(raw?: string | string[] | null): string[] {
  if (Array.isArray(raw)) return raw.map(String)
  if (!raw) return []
  try {
    const v = JSON.parse(raw)
    return Array.isArray(v) ? v.map(String) : [String(v)]
  } catch {
    return [String(raw)]
  }
}

// ───────────────────────── 5) Kapsam → karar tablosu ─────────────────────────
type Ctx = { docIds: string[]; targets: string[] }
const SCOPE_CHECKS: Record<Scope, (c: Ctx) => boolean> = {
  tumu: () => true,
  gizli: () => false,
  ozel: ({ docIds, targets }) =>
    targets.includes('*') || targets.includes('all') || docIds.some((d) => targets.includes(d)),
  piyasa_arastirma: ({ docIds }) => inGroup('piyasa_arastirma', docIds),
  muayene_kabul: ({ docIds }) => inGroup('muayene_kabul', docIds),
  olur_onay: ({ docIds }) => inGroup('olur_onay', docIds)
}

/**
 * Kişi katmanı: bu komisyon üyesi bu belgede görünür mü?
 * docInput = belgenin ID'si veya ID listesi (ham + alias çözülmüş kanonik ID).
 * Boş kapsam = 'tumu'. Tanınmayan kapsam = güvenli taraf (gizli).
 * Şablon politikası ('hide') bu fonksiyonun DIŞINDA, çağıranda VE ile birleştirilir.
 */
export function isMemberVisibleInDocument(member: MemberScopeInput, docInput: string | string[]): boolean {
  if (!member) return false
  const rawScope = (member.belge_kapsami ?? member.belgeKapsami ?? 'tumu')
  const scope = (rawScope ? String(rawScope).trim().toLowerCase() : 'tumu') as Scope
  const check = SCOPE_CHECKS[scope]
  if (!check) return false

  const rawIds = Array.isArray(docInput) ? docInput : [docInput]
  const docIds = rawIds.flatMap((id) => {
    if (!id) return []
    const clean = normalizeTemplateKey(id)
    const canonical = toCanonicalDocId(id)
    return Array.from(new Set([id, clean, canonical]))
  })

  const rawTargets = parseTargets(member.hedef_belgeler ?? member.hedefBelgeler)
  const targets = rawTargets.flatMap((t) => {
    if (t === '*' || t === 'all') return [t]
    const clean = normalizeTemplateKey(t)
    const canonical = toCanonicalDocId(t)
    return Array.from(new Set([t, clean, canonical]))
  })

  return check({ docIds, targets })
}

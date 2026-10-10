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

import type { Scope } from './roles'
export type { Scope }
export type DocGroup = 'piyasa_arastirma' | 'muayene_kabul' | 'olur_onay'

export interface MemberScopeInput {
  belgeSablonIds?: string[] | null
  belge_sablon_ids?: string[] | string | null
  belge_kapsami?: string | null
  belgeKapsami?: string | null
  hedef_belgeler?: string | string[] | null
  hedefBelgeler?: string | string[] | null
  [key: string]: any
}

import { TEMPLATE_REGISTRY } from './template-registry'

// ───────────────────────── 2) VERİ: belge grupları ─────────────────────────
// TEMPLATE_REGISTRY ana kaynak olarak kabul edilerek dinamik olarak türetilir.
export const DOC_GROUPS: Record<DocGroup, readonly string[]> = (() => {
  const map: Record<DocGroup, string[]> = {
    piyasa_arastirma: [],
    muayene_kabul: [],
    olur_onay: []
  }
  for (const t of TEMPLATE_REGISTRY) {
    const grps = Array.isArray(t.groups) && t.groups.length > 0
      ? t.groups
      : t.group
        ? [t.group]
        : []
    for (const g of grps) {
      if (map[g as DocGroup] && !map[g as DocGroup].includes(t.id)) {
        map[g as DocGroup].push(t.id)
      }
    }
  }
  return map
})()

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

import { resolveMemberVisibility } from '../services/memberVisibilityResolver'

/**
 * Kişi katmanı: bu komisyon üyesi bu belgede görünür mü?
 * Layered priority resolution model kullanarak kararı üretir.
 */
export function isMemberVisibleInDocument(member: MemberScopeInput, docInput: string | string[]): boolean {
  return resolveMemberVisibility(member, docInput).gorunur
}

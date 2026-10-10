import { RoleCode, RoleVisibility, TemplateGroup } from '../types'
import { TEMPLATE_REGISTRY } from './template-registry'

export const GROUP_DEFAULT_ROLE_VISIBILITY: Record<
  TemplateGroup,
  Partial<Record<RoleCode, RoleVisibility>>
> = {
  piyasa_arastirma: {
    harcama_yetkilisi: 'hide',
    ihale_yetkilisi: 'hide',
    muhasebe: 'hide',
    gerceklestirme_gorevlisi: 'hide',
    hazirlayan: 'show',
    talep_eden: 'show',
    onaylayan: 'hide',
    komisyon_baskani: 'show',
    komisyon_uyesi: 'show'
  },
  muayene_kabul: {
    harcama_yetkilisi: 'hide',
    ihale_yetkilisi: 'hide',
    muhasebe: 'hide',
    gerceklestirme_gorevlisi: 'hide',
    hazirlayan: 'hide',
    talep_eden: 'hide',
    onaylayan: 'hide',
    komisyon_baskani: 'show',
    komisyon_uyesi: 'show'
  },
  olur_onay: {
    harcama_yetkilisi: 'show',
    ihale_yetkilisi: 'show',
    muhasebe: 'optional',
    gerceklestirme_gorevlisi: 'show',
    hazirlayan: 'show',
    talep_eden: 'show',
    onaylayan: 'show',
    komisyon_baskani: 'show',
    komisyon_uyesi: 'show'
  }
}

/**
 * 0: hide (en kısıtlayıcı), 1: optional, 2: show
 */
const RANK: Record<RoleVisibility, number> = {
  hide: 0,
  optional: 1,
  show: 2
}

/**
 * Belirli bir şablon ve rol için görünürlük politikasını belirler.
 * 1. Şablonda tanımlı özel rol kuralı varsa o kazanır.
 * 2. Şablonun bağlı olduğu gruplar (çoklu gruplar dahil) taranarak en kısıtlayıcı politika seçilir.
 * 3. Hiçbiri yoksa varsayılan 'show' döndürülür.
 */
export function resolveRoleVisibility(templateId: string, roleCode: RoleCode): RoleVisibility {
  const template = TEMPLATE_REGISTRY.find((t) => t.id === templateId)
  if (!template) return 'show'

  // 1. Şablon içi özel kural
  const explicit = template.capabilities?.roleVisibility?.[roleCode]
  if (explicit) return explicit

  // 2. Çoklu grup birleştirme (çakışmada en kısıtlayıcı RANK kazanır)
  const groups = template.groups ?? (template.group ? [template.group] : [])
  if (groups.length > 0) {
    const groupRules = groups
      .map((g) => GROUP_DEFAULT_ROLE_VISIBILITY[g]?.[roleCode])
      .filter((r): r is RoleVisibility => Boolean(r))

    if (groupRules.length > 0) {
      return groupRules.reduce((a, b) => (RANK[a] <= RANK[b] ? a : b))
    }
  }

  return 'show'
}

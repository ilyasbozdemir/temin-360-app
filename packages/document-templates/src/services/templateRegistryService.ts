import { TEMPLATE_REGISTRY } from '../constants/template-registry'
import {
  CANONICAL_TEMPLATE_ALIASES,
  normalizeTemplateKey,
  toCanonicalDocId
} from '../constants/template-constants'
import { TemplateCapabilities, TemplateType } from '../types'
import { RoleCode, toRoleCode } from '../constants/roles'
import {
  GROUP_DEFAULT_ROLE_VISIBILITY,
  resolveRoleVisibility
} from '../constants/roleVisibility'
import { isMemberVisibleInDocument } from '../constants/visibility.config'

export class TemplateRegistryService {
  private static templatesMap: Map<string, TemplateType> = new Map()

  static {
    TEMPLATE_REGISTRY.forEach((t) => {
      this.templatesMap.set(t.id, t)
    })
  }

  /**
   * Get all registered document templates with complete metadata and capabilities
   */
  static getAllTemplates(): TemplateType[] {
    return Array.from(this.templatesMap.values())
  }

  /**
   * Get specific template metadata by ID or alias
   */
  static getTemplateById(id: string): TemplateType | undefined {
    if (!id) return undefined
    const clean = normalizeTemplateKey(id)
    const canonical = CANONICAL_TEMPLATE_ALIASES[clean] || clean
    return (
      this.templatesMap.get(id) ||
      this.templatesMap.get(clean) ||
      this.templatesMap.get(canonical)
    )
  }

  /**
   * Get template capabilities by ID or alias
   */
  static getCapabilities(id: string): TemplateCapabilities | undefined {
    return this.getTemplateById(id)?.capabilities
  }

  /**
   * Check if a template supports 'Olur' approval block
   */
  static supportsOlur(id: string): boolean {
    return Boolean(this.getCapabilities(id)?.supportsOlur)
  }

  /**
   * Filter templates that possess a specific capability (e.g. 'supportsCommission', 'supportsOlur')
   */
  static getTemplatesByCapability(capability: keyof TemplateCapabilities): TemplateType[] {
    return this.getAllTemplates().filter((t) => Boolean(t.capabilities[capability]))
  }

  /**
   * Resolve role visibility policy for a template ('show' | 'hide' | 'optional')
   * Delegate to central roleVisibility.ts which supports multi-group merging.
   */
  static resolveRoleVisibility(templateId: string, roleCode: RoleCode) {
    return resolveRoleVisibility(templateId, roleCode)
  }

  /**
   * Resolve commission role visibility policy for a template
   */
  static resolveCommissionRoleVisibility(templateId: string, commissionRoleName: string) {
    const roleCode = this.mapCommissionRoleNameToRoleCode(commissionRoleName)
    if (!roleCode) return 'show'
    return this.resolveRoleVisibility(templateId, roleCode)
  }

  /**
   * Map commission role name or task title to RoleCode enum
   */
  static mapCommissionRoleNameToRoleCode(roleName: string): RoleCode {
    return toRoleCode(roleName)
  }

  /**
   * Get document templates compatible with a commission type (e.g. 'piyasa_fiyat', 'muayene_kabul', 'yaklasik_maliyet')
   */
  static getTemplatesForCommissionType(commissionType?: string): TemplateType[] {
    const raw = (commissionType || '').trim().toLowerCase()
    return this.getAllTemplates().filter((t) => {
      if (!t.capabilities.supportsCommission) return false
      const types = t.capabilities.supportedCommissionTypes
      if (types.includes('all')) return true

      if (raw === 'yaklasik_maliyet' || raw === 'piyasa_fiyat') {
        return types.includes('piyasa_fiyat') || types.includes('yaklasik_maliyet')
      }
      if (raw === 'muayene_kabul') {
        return types.includes('muayene_kabul')
      }
      if (raw === 'ihale_komisyonu') {
        return types.includes('ihale_komisyonu')
      }

      if (
        raw.includes('fiyat') ||
        raw.includes('piyasa') ||
        raw.includes('maliyet')
      ) {
        return types.includes('piyasa_fiyat') || types.includes('yaklasik_maliyet')
      }
      if (raw.includes('muayene') || raw.includes('kabul')) {
        return types.includes('muayene_kabul')
      }
      if (raw.includes('ihale')) {
        return types.includes('ihale_komisyonu')
      }
      return types.length > 0
    })
  }

  /**
   * Komisyon üyesinin / kişinin hedef belgede görünür olup olmadığını belirler.
   */
  static isMemberVisibleInDocument(member: any, docIds: string | string[]): boolean {
    return isMemberVisibleInDocument(member, docIds)
  }

  /**
   * Geriye uyumluluk için templateId bazlı görünürlük fonksiyonu.
   */
  static isMemberVisibleInTemplate(member: any, templateId: string): boolean {
    return isMemberVisibleInDocument(member, [templateId])
  }

  /**
   * Filter commission member list for rendering in a target document template
   */
  static filterMembersForTemplate<T extends Record<string, any>>(members: T[], templateId: string): T[] {
    return members.filter((m) => isMemberVisibleInDocument(m, [templateId]))
  }
}

export {
  CANONICAL_TEMPLATE_ALIASES,
  normalizeTemplateKey,
  toCanonicalDocId,
  GROUP_DEFAULT_ROLE_VISIBILITY
}

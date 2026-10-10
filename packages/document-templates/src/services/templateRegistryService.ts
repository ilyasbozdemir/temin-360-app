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
   * Get TemplateWorkflow metadata by ID or alias
   */
  static getWorkflow(id: string) {
    return this.getTemplateById(id)?.workflow
  }

  /**
   * Get TemplateRouting metadata (Katman A) by ID or alias
   */
  static getRouting(id: string) {
    return this.getWorkflow(id)?.routing
  }

  /**
   * Get TemplateSignatureRule list (Katman B) by ID or alias
   */
  static getSignatureRules(id: string) {
    return this.getWorkflow(id)?.signatures
  }

  /**
   * Get approvalRole by ID or alias
   */
  static getApprovalRole(id: string) {
    return this.getWorkflow(id)?.approvalRole
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

  /**
   * Applies final role visibility policy to a document data object.
   * If a role policy is 'hide', clears both primary fields and all alias fields.
   */
  static applyRolePolicy(baseData: any, templateId: string): void {
    if (!baseData || typeof baseData !== 'object') return

    const harcamaPolicy = this.resolveRoleVisibility(templateId, 'harcama_yetkilisi')
    const onaylayanPolicy = this.resolveRoleVisibility(templateId, 'onaylayan')
    const hazirlayanPolicy = this.resolveRoleVisibility(templateId, 'hazirlayan')
    const talepEdenPolicy = this.resolveRoleVisibility(templateId, 'talep_eden')
    const gerceklestirmePolicy = this.resolveRoleVisibility(templateId, 'gerceklestirme_gorevlisi')
    const muhasebePolicy = this.resolveRoleVisibility(templateId, 'muhasebe')

    if (harcamaPolicy === 'hide') {
      baseData.harcamaYetkilisiAdi = ''
      baseData.harcamaYetkilisiUnvan = ''
      baseData.harcamaYetkilisi = ''
      baseData.harcama_yetkilisi = ''
    }

    if (onaylayanPolicy === 'hide') {
      baseData.onaylayanPersonelAdi = ''
      baseData.onaylayanPersonelUnvan = ''
      baseData.onaylayanPersonel = ''
      baseData.onaylayan = ''
      baseData.baskanAdi = ''
      baseData.baskanUnvan = ''
    }

    if (hazirlayanPolicy === 'hide') {
      baseData.hazirlayanPersonelAdi = ''
      baseData.hazirlayanPersonelUnvan = ''
      baseData.hazirlayanPersonel = ''
      baseData.hazirlayan = ''
    }

    if (gerceklestirmePolicy === 'hide') {
      baseData.gerceklestirmeGorevlisiAdi = ''
      baseData.gerceklestirmeGorevlisiUnvan = ''
      baseData.gerceklestirmeGorevlisi = ''
      baseData.gerceklestirme_gorevlisi = ''
    }

    if (talepEdenPolicy === 'hide') {
      baseData.talepEdenPersonelAdi = ''
      baseData.talepEdenPersonelUnvan = ''
      baseData.talepEdenPersonel = ''
      baseData.talepEden = ''
    }

    if (muhasebePolicy === 'hide') {
      baseData.mutemetAdi = ''
      baseData.mutemetUnvan = ''
      baseData.muhasebeYetkilisiAdi = ''
      baseData.muhasebeYetkilisiUnvan = ''
      baseData.muhasebeYetkilisi = ''
    }

    baseData.goster = {
      harcamaYetkilisi: harcamaPolicy !== 'hide',
      onaylayan: onaylayanPolicy !== 'hide',
      hazirlayan: hazirlayanPolicy !== 'hide',
      talepEden: talepEdenPolicy !== 'hide',
      gerceklestirmeGorevlisi: gerceklestirmePolicy !== 'hide',
      muhasebe: muhasebePolicy !== 'hide'
    }
  }
}

export {
  CANONICAL_TEMPLATE_ALIASES,
  normalizeTemplateKey,
  toCanonicalDocId,
  GROUP_DEFAULT_ROLE_VISIBILITY
}

import { TEMPLATE_REGISTRY } from "../constants/template-registry";
import {
  CANONICAL_TEMPLATE_ALIASES,
  normalizeTemplateKey,
  toCanonicalDocId,
} from "../constants/template-constants";
import {
  TemplateType,
  TemplateGroup,
  TemplateCapabilities,
  RoleCode,
  RoleVisibility,
} from "../types";

/**
 * Grup bazlı varsayılan rol görünürlük politikaları.
 * Şablon düzeyindeki roleVisibility tanımları yalnızca istisnai override içindir.
 */
export const GROUP_DEFAULT_ROLE_VISIBILITY: Record<
  TemplateGroup,
  Partial<Record<RoleCode, RoleVisibility>>
> = {
  olur_onay: {
    harcama_yetkilisi: "show",
    onaylayan: "show",
    gerceklestirme_gorevlisi: "optional",
    hazirlayan: "optional",
    talep_eden: "optional",
    muhasebe: "optional",
  },
  piyasa_arastirma: {
    harcama_yetkilisi: "hide",
    onaylayan: "optional",
    gerceklestirme_gorevlisi: "optional",
    hazirlayan: "optional",
    talep_eden: "optional",
    muhasebe: "hide",
  },
  muayene_kabul: {
    harcama_yetkilisi: "hide",
    onaylayan: "optional",
    gerceklestirme_gorevlisi: "optional",
    hazirlayan: "optional",
    talep_eden: "optional",
    muhasebe: "hide",
  },
};

export const UNGROUPED_DEFAULT_ROLE_VISIBILITY: Partial<Record<RoleCode, RoleVisibility>> = {
  harcama_yetkilisi: "hide",
  onaylayan: "optional",
  gerceklestirme_gorevlisi: "optional",
  hazirlayan: "optional",
  talep_eden: "optional",
  muhasebe: "hide",
};

import { isMemberVisibleInDocument } from "../constants/visibility.config";

export class TemplateRegistryService {
  private static templatesMap: Map<string, TemplateType> = new Map();

  static {
    TEMPLATE_REGISTRY.forEach((t) => {
      this.templatesMap.set(t.id, t);
    });
  }

  /**
   * Get all registered document templates with complete metadata and capabilities
   */
  static getAllTemplates(): TemplateType[] {
    return Array.from(this.templatesMap.values());
  }

  /**
   * Get specific template metadata by ID or alias
   */
  static getTemplateById(id: string): TemplateType | undefined {
    if (!id) return undefined;
    const clean = normalizeTemplateKey(id);
    const canonical = CANONICAL_TEMPLATE_ALIASES[clean] || clean;
    return (
      this.templatesMap.get(id) ||
      this.templatesMap.get(clean) ||
      this.templatesMap.get(canonical)
    );
  }

  /**
   * Filter templates that possess a specific capability (e.g. 'supportsCommission', 'supportsOlur')
   */
  static getTemplatesByCapability(capability: keyof TemplateCapabilities): TemplateType[] {
    return this.getAllTemplates().filter((t) => Boolean(t.capabilities[capability]));
  }

  /**
   * Resolve role visibility policy for a template ('show' | 'hide' | 'optional')
   * Uses template-specific override if present, else falls back to group default.
   */
  static resolveRoleVisibility(templateId: string, roleCode: RoleCode): RoleVisibility {
    const template = this.getTemplateById(templateId);
    if (!template) {
      return "hide";
    }

    // 1. Template-specific override
    if (template.capabilities?.roleVisibility?.[roleCode]) {
      return template.capabilities.roleVisibility[roleCode]!;
    }

    // 2. Group default
    if (template.group && GROUP_DEFAULT_ROLE_VISIBILITY[template.group]?.[roleCode]) {
      return GROUP_DEFAULT_ROLE_VISIBILITY[template.group]![roleCode]!;
    }

    // 3. Ungrouped default
    return UNGROUPED_DEFAULT_ROLE_VISIBILITY[roleCode] ?? "hide";
  }

  /**
   * Resolve commission role visibility policy for a template
   */
  static resolveCommissionRoleVisibility(templateId: string, commissionRoleName: string): RoleVisibility {
    const template = this.getTemplateById(templateId);
    if (!template) return "show";

    // 1. Template-specific override
    const customVis = template.capabilities?.commissionRoleVisibility;
    if (customVis) {
      const matchKey = Object.keys(customVis).find(
        (k) => k.toLowerCase().trim() === commissionRoleName.toLowerCase().trim()
      );
      if (matchKey) {
        return customVis[matchKey];
      }
    }

    // 2. Group default
    const normRole = commissionRoleName.toLowerCase().trim();
    if (template.group === "piyasa_arastirma" || template.group === "muayene_kabul") {
      if (normRole.includes("harcama yetkili") || normRole.includes("muhasebe yetkili")) {
        return "hide";
      }
    }

    return "show";
  }

  /**
   * Map commission role name to RoleCode enum
   */
  static mapCommissionRoleNameToRoleCode(roleName: string): RoleCode | null {
    const norm = roleName.toLowerCase().trim();
    if (norm.includes("harcama yetkili")) return "harcama_yetkilisi";
    if (norm.includes("ihale yetkili")) return "ihale_yetkilisi";
    if (norm.includes("gerçekleştirme") || norm.includes("gerceklestirme")) return "gerceklestirme_gorevlisi";
    if (norm.includes("muhasebe")) return "muhasebe";
    if (norm.includes("hazırlayan") || norm.includes("hazirlayan")) return "hazirlayan";
    if (norm.includes("talep eden") || norm.includes("talep_eden")) return "talep_eden";
    if (norm.includes("onaylayan") || norm.includes("başkan") || norm.includes("baskan")) return "onaylayan";
    return null;
  }

  /**
   * Get document templates compatible with a commission type (e.g. 'piyasa_fiyat', 'muayene_kabul')
   */
  static getTemplatesForCommissionType(commissionType?: string): TemplateType[] {
    const norm = (commissionType || "").toLowerCase();
    return this.getAllTemplates().filter((t) => {
      if (!t.capabilities.supportsCommission) return false;
      const types = t.capabilities.supportedCommissionTypes;
      if (types.includes("all")) return true;
      if (
        norm.includes("fiyat") ||
        norm.includes("piyasa") ||
        norm.includes("araştırma") ||
        norm.includes("arastirma")
      ) {
        return types.includes("piyasa_fiyat") || types.includes("yaklasik_maliyet");
      }
      if (norm.includes("muayene") || norm.includes("kabul")) {
        return types.includes("muayene_kabul");
      }
      if (norm.includes("ihale")) {
        return types.includes("ihale_komisyonu");
      }
      return types.length > 0;
    });
  }

  /**
   * Komisyon üyesinin / kişinin hedef belgede görünür olup olmadığını belirler.
   */
  static isMemberVisibleInDocument(
    member: any,
    docIds: string | string[]
  ): boolean {
    return isMemberVisibleInDocument(member, docIds);
  }

  /**
   * Geriye uyumluluk için templateId bazlı görünürlük fonksiyonu.
   */
  static isMemberVisibleInTemplate(
    member: any,
    templateId: string
  ): boolean {
    return isMemberVisibleInDocument(member, [templateId]);
  }

  /**
   * Filter commission member list for rendering in a target document template
   */
  static filterMembersForTemplate<T extends Record<string, any>>(
    members: T[],
    templateId: string
  ): T[] {
    return members.filter((m) => isMemberVisibleInDocument(m, [templateId]));
  }
}

export {
  CANONICAL_TEMPLATE_ALIASES,
  normalizeTemplateKey,
  toCanonicalDocId,
};

import { TEMPLATE_REGISTRY } from "../constants/template-registry";
import { TemplateType, TemplateCapabilities, RoleCode, RoleVisibility } from "../types";

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
   * Get specific template metadata by ID
   */
  static getTemplateById(id: string): TemplateType | undefined {
    return this.templatesMap.get(id);
  }

  /**
   * Filter templates that possess a specific capability (e.g. 'supportsCommission', 'supportsOlur')
   */
  static getTemplatesByCapability(capability: keyof TemplateCapabilities): TemplateType[] {
    return this.getAllTemplates().filter((t) => Boolean(t.capabilities[capability]));
  }

  /**
   * Resolve role visibility policy for a template ('show' | 'hide' | 'optional')
   * Defaults to 'hide' if not explicitly defined.
   */
  static resolveRoleVisibility(templateId: string, roleCode: RoleCode): RoleVisibility {
    const template = this.getTemplateById(templateId);
    if (!template || !template.capabilities.roleVisibility) {
      return "hide";
    }
    return template.capabilities.roleVisibility[roleCode] ?? "hide";
  }

  /**
   * Resolve commission role visibility policy for a template
   */
  static resolveCommissionRoleVisibility(templateId: string, commissionRoleName: string): RoleVisibility {
    const template = this.getTemplateById(templateId);
    if (!template) return "show";

    const customVis = template.capabilities.commissionRoleVisibility;
    if (customVis) {
      const matchKey = Object.keys(customVis).find(
        (k) => k.toLowerCase().trim() === commissionRoleName.toLowerCase().trim()
      );
      if (matchKey) {
        return customVis[matchKey];
      }
    }

    const norm = commissionRoleName.toLowerCase();
    if (norm.includes("harcama yetkili")) {
      return this.resolveRoleVisibility(templateId, "harcama_yetkilisi");
    }
    if (norm.includes("muhasebe")) {
      return this.resolveRoleVisibility(templateId, "muhasebe");
    }

    return "show";
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
      if (norm.includes("fiyat") || norm.includes("piyasa") || norm.includes("araştırma") || norm.includes("arastirma")) {
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
   * Check whether a specific member/commission row is visible in a target document template.
   * Priority Order:
   * 1. Template policy 'hide' -> not visible
   * 2. Member belgede_goster=0 or belge_kapsami='gizli' -> not visible
   * 3. Member belge_kapsami='ozel' and hedef_belgeler does not include templateId -> not visible
   * 4. Otherwise visible
   */
  static isMemberVisibleInTemplate(
    member: {
      belgede_goster?: number | string | boolean;
      belgedeGoster?: boolean | number | string;
      goster?: boolean | number | string;
      belge_kapsami?: string;
      belgeKapsami?: string;
      hedef_belgeler?: string | string[];
      hedefBelgeler?: string | string[];
      gorev?: string;
      gorev_adi?: string;
      gorevi?: string;
      komisyonGorevi?: string;
      rol?: string;
      komisyon_turu?: string;
    },
    templateId: string
  ): boolean {
    const roleName = member.gorev || member.gorev_adi || member.gorevi || member.komisyonGorevi || member.rol || "";
    if (roleName) {
      const vis = this.resolveCommissionRoleVisibility(templateId, roleName);
      if (vis === "hide") return false;
    }

    const bg = member.belgede_goster ?? member.belgedeGoster ?? member.goster;
    if (bg === 0 || bg === "0" || bg === false || bg === "false") return false;

    const kapsam = member.belge_kapsami || member.belgeKapsami;
    if (kapsam === "gizli") return false;

    const rawTargets = member.hedef_belgeler || member.hedefBelgeler;
    if (kapsam === "ozel" || (rawTargets && !kapsam)) {
      let targets: string[] = [];
      if (typeof rawTargets === "string") {
        try {
          targets = JSON.parse(rawTargets);
        } catch {
          targets = rawTargets ? [rawTargets] : [];
        }
      } else if (Array.isArray(rawTargets)) {
        targets = rawTargets;
      }

      if (
        targets.length > 0 &&
        !targets.includes("*") &&
        !targets.includes("all") &&
        !targets.includes(templateId)
      ) {
        return false;
      }
    }

    if (member.komisyon_turu) {
      const template = this.getTemplateById(templateId);
      if (template && template.capabilities.supportsCommission) {
        const compatible = this.getTemplatesForCommissionType(member.komisyon_turu);
        if (!compatible.some((t) => t.id === templateId)) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Filter commission member list for rendering in a target document template
   */
  static filterMembersForTemplate<T extends Record<string, any>>(
    members: T[],
    templateId: string
  ): T[] {
    return members.filter((m) => this.isMemberVisibleInTemplate(m, templateId));
  }
}

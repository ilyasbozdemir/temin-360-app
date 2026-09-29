import { TEMPLATE_REGISTRY } from "../constants/template-registry";
import { TemplateType, TemplateCapabilities } from "../types";

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
   * Check whether a specific member/commission row is compatible and visible for a given template ID
   */
  static isMemberVisibleInTemplate(
    member: {
      belgede_goster?: number;
      belgedeGoster?: boolean | number;
      komisyon_turu?: string;
      hedef_belgeler?: string | string[];
    },
    templateId: string
  ): boolean {
    const isVisible = member.belgede_goster !== 0 && member.belgedeGoster !== false && member.belgedeGoster !== 0;
    if (!isVisible) return false;

    const template = this.getTemplateById(templateId);
    if (!template) return true;

    if (!template.capabilities.supportsCommission) return false;

    if (member.hedef_belgeler) {
      let targets: string[] = [];
      if (typeof member.hedef_belgeler === "string") {
        try {
          targets = JSON.parse(member.hedef_belgeler);
        } catch {
          targets = [member.hedef_belgeler];
        }
      } else if (Array.isArray(member.hedef_belgeler)) {
        targets = member.hedef_belgeler;
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
      const compatible = this.getTemplatesForCommissionType(member.komisyon_turu);
      if (!compatible.some((t) => t.id === templateId)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Filter commission member list for rendering in a target document template
   */
  static filterMembersForTemplate<T extends { belgede_goster?: number; belgedeGoster?: boolean | number; komisyon_turu?: string; hedef_belgeler?: string | string[] }>(
    members: T[],
    templateId: string
  ): T[] {
    return members.filter((m) => this.isMemberVisibleInTemplate(m, templateId));
  }
}

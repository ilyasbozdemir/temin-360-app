import {
  normalizeTemplateKey,
  toCanonicalDocId,
} from "../constants/template-constants";
import { defaultScopeForRole, DOC_GROUPS, DocGroup } from "../constants/visibility.config";
import { TemplateRegistryService } from "./templateRegistryService";

export type OverrideState = "inherit" | "show" | "hide";
export type VisibilitySource =
  | "member_exception"
  | "group_exception"
  | "template_rule"
  | "role_default"
  | "fallback";

export interface MemberExceptionRule {
  target: string; // e.g. "harcama-talimati" or "tag:olur_onay"
  durum: "show" | "hide";
}

export interface MemberVisibilityContext {
  id?: string | number;
  gorevAd?: string;
  gorev_adi?: string;
  gorev?: string;
  belgeSablonIds?: string[] | null;
  belge_sablon_ids?: string[] | string | null;
  exceptions?: MemberExceptionRule[] | Record<string, "show" | "hide"> | null;
  belge_kapsami?: string | null;
  belgeKapsami?: string | null;
  hedef_belgeler?: string | string[] | null;
  hedefBelgeler?: string | string[] | null;
  [key: string]: any;
}

export interface VisibilityResult {
  gorunur: boolean;
  neden: string;
  source: VisibilitySource;
}

/**
 * Resolves member visibility for a target document using layered priority rules:
 * 1. Üye × Belge Özel İstisnası (show/hide)
 * 2. Üye × Etiket (Group) İstisnası (show/hide)
 * 3. Şablon Rol Kuralı (Template Policy)
 * 4. Üye Görev Rolü Varsayılanı (Role Scope Default)
 * 5. Varsayılan Görünürlük (Fallback)
 */
export function resolveMemberVisibility(
  member: MemberVisibilityContext | null | undefined,
  docInput: string | string[]
): VisibilityResult {
  if (!member) {
    return {
      gorunur: false,
      neden: "Geçersiz veya boş üye verisi",
      source: "fallback",
    };
  }

  const rawIds = Array.isArray(docInput) ? docInput : [docInput];
  const targetDocIds = rawIds.flatMap((id) => {
    if (!id) return [];
    const clean = normalizeTemplateKey(id);
    const canonical = toCanonicalDocId(id);
    return Array.from(new Set([id, clean, canonical]));
  });

  const primaryDocId = targetDocIds[0] || "";

  // 1. ÜYE ÖZEL İSTİSNALARI (Explicit Member Exceptions)
  if (member.exceptions) {
    let rules: MemberExceptionRule[] = [];
    if (Array.isArray(member.exceptions)) {
      rules = member.exceptions;
    } else if (typeof member.exceptions === "object") {
      rules = Object.entries(member.exceptions).map(([target, durum]) => ({
        target,
        durum: durum as "show" | "hide",
      }));
    }

    // 1.a. Tekil Belge İstisnası (Doküman Bazlı)
    const docRule = rules.find((r) => {
      const cleanTarget = normalizeTemplateKey(r.target.replace(/^tag:/, ""));
      return targetDocIds.some((id) => id === cleanTarget || toCanonicalDocId(id) === cleanTarget);
    });

    if (docRule) {
      const isShow = docRule.durum === "show";
      return {
        gorunur: isShow,
        neden: `Üyeye özel belge istisnası (${isShow ? "Açık Gösterim" : "Gizli"})`,
        source: "member_exception",
      };
    }

    // 1.b. Etiket (Grup) İstisnası (Tag/Group Bazlı)
    const templateObj = TemplateRegistryService.getTemplateById(primaryDocId);
    const tGroups = templateObj?.groups ?? (templateObj?.group ? [templateObj.group] : []);

    const tagRule = rules.find((r) => {
      if (!r.target.startsWith("tag:")) return false;
      const groupTag = r.target.replace(/^tag:/, "").trim().toLowerCase();
      return tGroups.some((g) => g.toLowerCase() === groupTag);
    });

    if (tagRule) {
      const isShow = tagRule.durum === "show";
      return {
        gorunur: isShow,
        neden: `Üyeye özel belge grubu istisnası (${tagRule.target})`,
        source: "group_exception",
      };
    }
  }

  // 1.c. belgeSablonIds (List of Allowed Template IDs / null)
  let sablonIds: string[] | null | undefined = member.belgeSablonIds;
  if (sablonIds === undefined && member.belge_sablon_ids !== undefined) {
    if (member.belge_sablon_ids === null) {
      sablonIds = null;
    } else if (Array.isArray(member.belge_sablon_ids)) {
      sablonIds = member.belge_sablon_ids;
    } else if (typeof member.belge_sablon_ids === "string") {
      try {
        const parsed = JSON.parse(member.belge_sablon_ids);
        sablonIds = Array.isArray(parsed) ? parsed : null;
      } catch {
        sablonIds = member.belge_sablon_ids === "*" ? null : [member.belge_sablon_ids];
      }
    }
  }

  if (sablonIds !== undefined && sablonIds !== null) {
    if (!Array.isArray(sablonIds) || sablonIds.length === 0) {
      return {
        gorunur: false,
        neden: "Üye belgede görünürlük listenin dışında (Gizli seçilmiş)",
        source: "member_exception",
      };
    }

    const cleanTargets = sablonIds.flatMap((t) => {
      if (t === "*" || t === "all") return [t];
      const clean = normalizeTemplateKey(t);
      const canonical = toCanonicalDocId(t);
      return Array.from(new Set([t, clean, canonical]));
    });

    if (!cleanTargets.includes("*") && !cleanTargets.includes("all")) {
      const matched = targetDocIds.some((d) => cleanTargets.includes(d));
      if (matched) {
        return {
          gorunur: true,
          neden: "Üyenin seçili özel şablon listesinde yer alıyor",
          source: "member_exception",
        };
      } else {
        return {
          gorunur: false,
          neden: "Üyenin seçili özel şablon listesinde yer almıyor",
          source: "member_exception",
        };
      }
    }
  }

  // 1.d. Legacy Scope / Kapsam Desteği (belge_kapsami & hedef_belgeler)
  const rawScope = member.belge_kapsami ?? member.belgeKapsami;
  if (rawScope !== undefined && rawScope !== null) {
    const scopeStr = String(rawScope).trim().toLowerCase();
    if (scopeStr === "gizli") {
      return {
        gorunur: false,
        neden: "Üye kapsamı gizli seçilmiş",
        source: "member_exception",
      };
    }
    if (scopeStr === "ozel") {
      const parseTargets = (raw?: any): string[] => {
        if (Array.isArray(raw)) return raw.map(String);
        if (!raw) return [];
        try {
          const v = JSON.parse(raw);
          return Array.isArray(v) ? v.map(String) : [String(v)];
        } catch {
          return [String(raw)];
        }
      };
      const rawTargets = parseTargets(member.hedef_belgeler ?? member.hedefBelgeler);
      const cleanTargets = rawTargets.flatMap((t) => {
        if (t === "*" || t === "all") return [t];
        const clean = normalizeTemplateKey(t);
        const canonical = toCanonicalDocId(t);
        return Array.from(new Set([t, clean, canonical]));
      });

      if (!cleanTargets.includes("*") && !cleanTargets.includes("all")) {
        const matched = targetDocIds.some((d) => cleanTargets.includes(d));
        return {
          gorunur: matched,
          neden: matched ? "Özel hedef belgeler listesinde eşleşti" : "Özel hedef belgeler listesinde yer almıyor",
          source: "member_exception",
        };
      }
    } else if (scopeStr && DOC_GROUPS[scopeStr as DocGroup]) {
      const groupDocs = DOC_GROUPS[scopeStr as DocGroup] || [];
      const matched = targetDocIds.some((id) => groupDocs.includes(id));
      return {
        gorunur: matched,
        neden: matched ? `Üyenin kapsadığı ${scopeStr} grubu ile eşleşti` : `Üyenin kapsadığı ${scopeStr} grubunda yer almıyor`,
        source: "member_exception",
      };
    }
  }

  // 2. ŞABLON ROL KURALI (Template Signature Policy)
  const gorevAd = member.gorevAd || member.gorev_adi || member.gorev || "";
  if (gorevAd && primaryDocId) {
    const roleCode = TemplateRegistryService.mapCommissionRoleNameToRoleCode(gorevAd);
    if (roleCode) {
      const templateVis = TemplateRegistryService.resolveRoleVisibility(primaryDocId, roleCode);
      if (templateVis === "hide") {
        return {
          gorunur: false,
          neden: `Şablon rol kuralı gereği ${gorevAd} bu belgede gizlidir`,
          source: "template_rule",
        };
      }
    }
  }

  // 3. ÜYE GÖREV ROLÜ VARSAYILANI (Role Scope Rules)
  const roleScope = defaultScopeForRole(gorevAd);
  if (roleScope.belgeKapsami === "gizli") {
    return {
      gorunur: false,
      neden: `${gorevAd} görevi tüm belgelerde varsayılan olarak gizlidir`,
      source: "role_default",
    };
  }

  if (roleScope.belgeKapsami && roleScope.belgeKapsami !== "tumu" && roleScope.belgeKapsami !== "ozel") {
    const groupDocs = DOC_GROUPS[roleScope.belgeKapsami as DocGroup] || [];
    const matchedGroupDoc = targetDocIds.some((id) => groupDocs.includes(id));
    if (matchedGroupDoc) {
      return {
        gorunur: true,
        neden: `${gorevAd} görevi ${roleScope.belgeKapsami} grubundaki belgelerde varsayılan olarak görünür`,
        source: "role_default",
      };
    } else {
      return {
        gorunur: false,
        neden: `${gorevAd} görevi ${roleScope.belgeKapsami} dışındaki belgelerde varsayılan olarak gizlidir`,
        source: "role_default",
      };
    }
  }

  // 4. VARSAYILAN (Fallback)
  return {
    gorunur: true,
    neden: "Varsayılan olarak görünür",
    source: "fallback",
  };
}

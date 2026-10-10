import React from 'react';
import type { RoleCode, Scope } from './constants/roles';

export type { RoleCode, Scope };

export type CommissionTypeCategory =
  | 'piyasa_fiyat'
  | 'muayene_kabul'
  | 'yaklasik_maliyet'
  | 'ihale_komisyonu'
  | 'all'
  | 'none';

/**
 * Belge/Rol Görünürlük Kuralı:
 * - 'show': Görünür (İmza / slot listesinde gösterilir)
 * - 'hide': Gizli (Görünmez)
 * - 'optional': İsteğe bağlı / Koşullu (Komisyonda/belgede atanmış üye/kişi varsa gösterilir)
 */
export type RoleVisibility = 'show' | 'hide' | 'optional';

export interface TemplateCapabilities {
  supportsOlur: boolean;
  supportsCommission: boolean;
  supportedCommissionTypes: CommissionTypeCategory[];
  supportsPersonnelList: boolean;
  supportsKalemListesi: boolean;
  supportsFirmaListesi: boolean;
  roleVisibility?: Partial<Record<RoleCode, RoleVisibility>>;
  commissionRoleVisibility?: Record<string, RoleVisibility>;
}

export type TemplateGroup = 'piyasa_arastirma' | 'muayene_kabul' | 'olur_onay';

/**
 * Belgenin sunulacağı makam yönlendirme modu (Katman A)
 */
export type RecipientMode = 'role' | 'commission' | 'unit' | 'none';

/**
 * İmza zorunluluğunun dayanak kaynağı
 */
export type RequirementSource =
  | 'statutory'            // Hukuken / Mevzuaten Zorunlu (Örn: 5018 S.K. Harcama Yetkilisi Oluru)
  | 'administrative'       // İdari Usul / Yönetmelik Gereği (Örn: Muayene Kabul Tutanak Onayı)
  | 'optional_custom'      // Kurum Tercihine Bağlı / İsteğe Bağlı
  | 'unspecified';         // Dayanağı henüz belirtilmemiş / nötr durum

/**
 * Metadata tanımlanma durumu (Eksik metadata ile bilinçli yokluğu ayırt eder)
 */
export type ExplicitState =
  | 'explicit_defined'      // Tanımları bilinçli ve doğrulanmış olarak yapılmış
  | 'explicit_none'         // Makam/İmza olmadığı bilinçli olarak belirtilmiş
  | 'unspecified_fallback'; // Henüz tanımlanmamış / varsayılan fallback durumu

/**
 * Sunulacak Makam Yönlendirme Metadata'sı (Katman A)
 */
export interface TemplateRouting {
  mode: RecipientMode;
  targetRole?: RoleCode;
  usesDynamicInstitutionalHeading?: boolean;
  fallbackHeading?: string;
}

/**
 * İmza ve Onay Rolü Detayı (Katman B)
 */
export interface TemplateSignatureRule {
  role: RoleCode;
  slotType: 'prepared_by' | 'checked_by' | 'approved_by' | 'member' | 'president';
  requirementSource: RequirementSource;
  labelOverride?: string;
}

/**
 * Belge İş Akışı ve Yönetim Metadata'sı (Workflow Metadata)
 */
export interface TemplateWorkflow {
  routing?: TemplateRouting;
  signatures?: TemplateSignatureRule[];
  approvalRole?: RoleCode;
  explicitState?: ExplicitState;
}

export type TemplateType = {
  id: string;
  name: string;
  title: string;
  category: string;
  group?: TemplateGroup;
  groups?: TemplateGroup[];
  description?: string;
  capabilities: TemplateCapabilities;
  workflow?: TemplateWorkflow;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface TemplateComponentProps<T = any> {
  data: T;
  onChange?: (data: Partial<T>) => void;
  orientation?: "portrait" | "landscape";
  pageSize?: "A4" | "A3";
}

export type TemplateComponentType = React.ComponentType<TemplateComponentProps>;

/**
 * Doğrulama sorununun önem seviyesi:
 * - 'error': Hata / Kritik eksiklik veya veri bozukluğu
 * - 'warning': Uyarı / İdari usul eksikliği (kullanıcı onayı gerektirebilir)
 * - 'info': Bilgilendirme / Format veya görsel iyileştirme tavsiyesi
 */
export type ValidationSeverity = 'error' | 'warning' | 'info';

/**
 * Belge doğrulama bulgusu / sorunu
 */
export interface ValidationIssue {
  code: string;
  field?: string;
  message: string;
  severity: ValidationSeverity;
  source: RequirementSource;
  detail?: string;
}

/**
 * Doğrulama çalışma bağlamı
 */
export interface ValidationContext {
  templateId: string;
  procurementType?: string;
  capabilities?: TemplateCapabilities;
  workflow?: TemplateWorkflow;
  options?: Record<string, any>;
}

/**
 * Doğrulama kuralı yürütme işlevi
 */
export type ValidationRuleFn = (
  payload: Record<string, any>,
  context: ValidationContext
) => ValidationIssue | ValidationIssue[] | null | undefined;

/**
 * Şablon doğrulama kural tanımı
 */
export interface TemplateValidationRule {
  id: string;
  description: string;
  source?: RequirementSource;
  severity?: ValidationSeverity;
  validate: ValidationRuleFn;
}

/**
 * Çıktı öncesi doğrulama raporu
 */
export interface ValidationReport {
  templateId: string;
  procurementType?: string;
  isValid: boolean;
  hasErrors: boolean;
  hasWarnings: boolean;
  hasInfos: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  infos: ValidationIssue[];
  issues: ValidationIssue[];
  summary: {
    total: number;
    errorCount: number;
    warningCount: number;
    infoCount: number;
  };
}

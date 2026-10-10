import {
  RequirementSource,
  TemplateValidationRule,
  ValidationContext,
  ValidationIssue,
  ValidationReport,
  ValidationSeverity
} from '../types'
import { normalizeTemplateKey, toCanonicalDocId } from '../constants/template-constants'

/**
 * Boş değer kontrolü yardımcı fonksiyonu
 */
export function isValueEmpty(val: unknown): boolean {
  if (val === null || val === undefined) return true
  if (typeof val === 'string') return val.trim() === ''
  if (Array.isArray(val)) return val.length === 0
  if (typeof val === 'object') return Object.keys(val as object).length === 0
  return false
}

/**
 * Belge Doğrulama ve Çıktı Öncesi Kontrol Servisi
 * Saf TypeScript mimarisi (React, Electron, IPC veya DB bağımlılığı içermez).
 */
export class DocumentValidationService {
  private static rulesMap: Map<string, TemplateValidationRule[]> = new Map()

  /**
   * Belirli bir şablon (veya tüm şablonlar için '*') için doğrulama kuralı kaydeder.
   */
  static registerRule(targetTemplateId: string, rule: TemplateValidationRule): void {
    if (!targetTemplateId || !rule || !rule.id) return
    const key = targetTemplateId === '*' || targetTemplateId === 'all'
      ? '*'
      : toCanonicalDocId(normalizeTemplateKey(targetTemplateId))

    const existing = this.rulesMap.get(key) || []
    // Aynı ID'ye sahip kural varsa üzerine yazar (idempotent)
    const filtered = existing.filter((r) => r.id !== rule.id)
    filtered.push(rule)
    this.rulesMap.set(key, filtered)
  }

  /**
   * Birden fazla kuralı topluca kaydeder.
   */
  static registerRules(targetTemplateId: string, rules: TemplateValidationRule[]): void {
    rules.forEach((rule) => this.registerRule(targetTemplateId, rule))
  }

  /**
   * Kayıtlı bir kuralı ID'sine göre kaldırır.
   */
  static unregisterRule(ruleId: string): boolean {
    let removed = false
    for (const [key, rules] of this.rulesMap.entries()) {
      const filtered = rules.filter((r) => r.id !== ruleId)
      if (filtered.length !== rules.length) {
        this.rulesMap.set(key, filtered)
        removed = true
      }
    }
    return removed
  }

  /**
   * Belirtilen şablon için geçerli tüm kuralları (şablona özel + genel '*' kuralları) listeler.
   */
  static getRulesForTemplate(templateId?: string): TemplateValidationRule[] {
    const globalRules = this.rulesMap.get('*') || []
    if (!templateId) {
      return [...globalRules]
    }
    const canonicalKey = toCanonicalDocId(normalizeTemplateKey(templateId))
    const specificRules = this.rulesMap.get(canonicalKey) || []
    return [...globalRules, ...specificRules]
  }

  /**
   * Tüm kayıtlı kuralları temizler (özellikle birim testlerinde izolasyon için).
   */
  static clearRules(): void {
    this.rulesMap.clear()
  }

  /**
   * Standart boş / geçerli bir ValidationReport nesnesi oluşturur.
   */
  static createReport(
    templateId: string,
    issues: ValidationIssue[] = [],
    procurementType?: string
  ): ValidationReport {
    const errors = issues.filter((i) => i.severity === 'error')
    const warnings = issues.filter((i) => i.severity === 'warning')
    const infos = issues.filter((i) => i.severity === 'info')

    return {
      templateId,
      procurementType,
      isValid: errors.length === 0,
      hasErrors: errors.length > 0,
      hasWarnings: warnings.length > 0,
      hasInfos: infos.length > 0,
      errors,
      warnings,
      infos,
      issues,
      summary: {
        total: issues.length,
        errorCount: errors.length,
        warningCount: warnings.length,
        infoCount: infos.length
      }
    }
  }

  /**
   * Tek bir ValidationIssue nesnesi üretmek için yardımcı builder.
   */
  static createIssue(params: {
    code: string
    field?: string
    message: string
    severity?: ValidationSeverity
    source?: RequirementSource
    detail?: string
  }): ValidationIssue {
    return {
      code: params.code,
      field: params.field,
      message: params.message,
      severity: params.severity || 'warning',
      source: params.source || 'unspecified',
      detail: params.detail
    }
  }

  /**
   * Şablon verisini (payload) ilgili kurallara göre doğrular ve kapsamlı rapor döndürür.
   * - payload null veya undefined ise güvenli bir şekilde boş nesne `{}` olarak ele alınır.
   * - Kural bulunamazsa veya tüm kurallar geçerse `isValid: true` döner.
   * - Kural yürütme sırasında beklenmeyen bir istisna olursa kural hata seviyesinde raporlanır, işlem çökmez.
   */
  static validate(
    templateId: string,
    payload?: Record<string, any> | null,
    context?: Partial<ValidationContext>
  ): ValidationReport {
    const safePayload = payload && typeof payload === 'object' ? payload : {}
    const canonicalId = templateId ? toCanonicalDocId(normalizeTemplateKey(templateId)) : 'unknown'
    const rules = this.getRulesForTemplate(templateId)

    const fullContext: ValidationContext = {
      templateId: canonicalId,
      procurementType: context?.procurementType,
      capabilities: context?.capabilities,
      workflow: context?.workflow,
      options: context?.options
    }

    const issues: ValidationIssue[] = []

    for (const rule of rules) {
      try {
        const result = rule.validate(safePayload, fullContext)
        if (!result) continue

        if (Array.isArray(result)) {
          issues.push(...result.filter(Boolean))
        } else {
          issues.push(result)
        }
      } catch (err: any) {
        // Kural içinde beklenmeyen bir kod hatası olursa güvenli raporla
        issues.push({
          code: `RULE_EXECUTION_ERROR_${rule.id}`,
          message: `Doğrulama kuralı yürütülürken hata oluştu: ${rule.description || rule.id}`,
          severity: 'warning',
          source: 'unspecified',
          detail: err?.message || String(err)
        })
      }
    }

    return this.createReport(canonicalId, issues, fullContext.procurementType)
  }
}

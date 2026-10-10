import { describe, it, expect, beforeEach } from 'vitest'
import {
  DocumentValidationService,
  isValueEmpty,
  TemplateValidationRule,
  ValidationIssue,
  ValidationReport
} from '../index'

describe('DocumentValidationService (Aşama 2 - Adım 2.1)', () => {
  beforeEach(() => {
    DocumentValidationService.clearRules()
  })

  describe('1. isValueEmpty Yardımcı Fonksiyonu', () => {
    it('null ve undefined için true dönmeli', () => {
      expect(isValueEmpty(null)).toBe(true)
      expect(isValueEmpty(undefined)).toBe(true)
    })

    it('boş veya sadece boşluk içeren stringler için true dönmeli', () => {
      expect(isValueEmpty('')).toBe(true)
      expect(isValueEmpty('   ')).toBe(true)
      expect(isValueEmpty('\t\n')).toBe(true)
      expect(isValueEmpty('Dolu')).toBe(false)
    })

    it('boş diziler için true, dolu diziler için false dönmeli', () => {
      expect(isValueEmpty([])).toBe(true)
      expect(isValueEmpty(['a'])).toBe(false)
      expect(isValueEmpty([1, 2])).toBe(false)
    })

    it('boş objeler için true, dolu objeler için false dönmeli', () => {
      expect(isValueEmpty({})).toBe(true)
      expect(isValueEmpty({ a: 1 })).toBe(false)
    })

    it('sayı ve boolean değerler için false dönmeli', () => {
      expect(isValueEmpty(0)).toBe(false)
      expect(isValueEmpty(123)).toBe(false)
      expect(isValueEmpty(false)).toBe(false)
      expect(isValueEmpty(true)).toBe(false)
    })
  })

  describe('2. Kural Bulunmaması Durumu ve Boş Payload Davranışı', () => {
    it('hiç kural tanımlı olmadığında geçerli rapor dönmeli ve çökmemeli', () => {
      const report = DocumentValidationService.validate('yaklasik-maliyet-cetveli', { foo: 'bar' })
      expect(report.isValid).toBe(true)
      expect(report.hasErrors).toBe(false)
      expect(report.hasWarnings).toBe(false)
      expect(report.hasInfos).toBe(false)
      expect(report.issues).toHaveLength(0)
      expect(report.summary.total).toBe(0)
    })

    it('payload null veya undefined olduğunda güvenle işlem yapmalı', () => {
      const reportNull = DocumentValidationService.validate('ihtiyac-listesi', null)
      expect(reportNull.isValid).toBe(true)
      expect(reportNull.issues).toHaveLength(0)

      const reportUndefined = DocumentValidationService.validate('ihtiyac-listesi', undefined)
      expect(reportUndefined.isValid).toBe(true)
      expect(reportUndefined.issues).toHaveLength(0)
    })
  })

  describe('3. Kural Kayıt ve Yaşam Döngüsü', () => {
    it('şablona özel ve genel (*) kuralları doğru şekilde kaydetmeli ve getirmeli', () => {
      const rule1: TemplateValidationRule = {
        id: 'rule-global',
        description: 'Genel kontrol',
        validate: () => null
      }
      const rule2: TemplateValidationRule = {
        id: 'rule-specific',
        description: 'Şablona özel kontrol',
        validate: () => null
      }

      DocumentValidationService.registerRule('*', rule1)
      DocumentValidationService.registerRule('yaklasik-maliyet-cetveli', rule2)

      const forYaklasik = DocumentValidationService.getRulesForTemplate('yaklasik-maliyet-cetveli')
      expect(forYaklasik).toHaveLength(2)
      expect(forYaklasik.map((r) => r.id)).toEqual(['rule-global', 'rule-specific'])

      const forDiger = DocumentValidationService.getRulesForTemplate('ihtiyac-listesi')
      expect(forDiger).toHaveLength(1)
      expect(forDiger[0].id).toBe('rule-global')
    })

    it('aynı ID ile kural kaydedildiğinde üzerine yazmalı (idempotent)', () => {
      const ruleA: TemplateValidationRule = {
        id: 'dup-rule',
        description: 'İlk versiyon',
        validate: () => null
      }
      const ruleB: TemplateValidationRule = {
        id: 'dup-rule',
        description: 'Güncel versiyon',
        validate: () => null
      }

      DocumentValidationService.registerRule('test-template', ruleA)
      DocumentValidationService.registerRule('test-template', ruleB)

      const rules = DocumentValidationService.getRulesForTemplate('test-template')
      expect(rules).toHaveLength(1)
      expect(rules[0].description).toBe('Güncel versiyon')
    })

    it('unregisterRule ile kuralı kaldırabilmeli', () => {
      const rule: TemplateValidationRule = {
        id: 'to-remove',
        description: 'Silinecek',
        validate: () => null
      }
      DocumentValidationService.registerRule('test-doc', rule)
      expect(DocumentValidationService.getRulesForTemplate('test-doc')).toHaveLength(1)

      const removed = DocumentValidationService.unregisterRule('to-remove')
      expect(removed).toBe(true)
      expect(DocumentValidationService.getRulesForTemplate('test-doc')).toHaveLength(0)
    })
  })

  describe('4. Önem Seviyeleri (Error, Warning, Info) ve Rapor Özeti', () => {
    it('yalnızca warning ve info içeren durumlarda isValid true kalmalı (çıktıyı engellemez)', () => {
      const warnRule: TemplateValidationRule = {
        id: 'warn-1',
        description: 'Uyarı kontrolü',
        validate: () =>
          DocumentValidationService.createIssue({
            code: 'ADMIN_WARNING_EVRAK',
            field: 'evrakSayisi',
            message: 'Evrak sayısı henüz idare tarafından atanmamış',
            severity: 'warning',
            source: 'administrative'
          })
      }
      const infoRule: TemplateValidationRule = {
        id: 'info-1',
        description: 'Bilgi kontrolü',
        validate: () =>
          DocumentValidationService.createIssue({
            code: 'LOGO_INFO',
            field: 'sagLogo',
            message: 'Sağ logo seçilmedi, varsayılan antet düzeni kullanılacak',
            severity: 'info',
            source: 'optional_custom'
          })
      }

      DocumentValidationService.registerRule('onay-belgesi', warnRule)
      DocumentValidationService.registerRule('onay-belgesi', infoRule)

      const report = DocumentValidationService.validate('onay-belgesi', {})
      expect(report.isValid).toBe(true)
      expect(report.hasErrors).toBe(false)
      expect(report.hasWarnings).toBe(true)
      expect(report.hasInfos).toBe(true)
      expect(report.summary.errorCount).toBe(0)
      expect(report.summary.warningCount).toBe(1)
      expect(report.summary.infoCount).toBe(1)
      expect(report.summary.total).toBe(2)
      expect(report.warnings[0].field).toBe('evrakSayisi')
      expect(report.infos[0].field).toBe('sagLogo')
    })

    it('error içeren durumlarda isValid false olmalı ve hasErrors true dönmeli', () => {
      const errRule: TemplateValidationRule = {
        id: 'err-1',
        description: 'Kritik hata',
        validate: (payload) => {
          if (!payload.kalemler || payload.kalemler.length === 0) {
            return DocumentValidationService.createIssue({
              code: 'ERR_EMPTY_ITEMS',
              field: 'kalemler',
              message: 'Belgede en az 1 ihtiyaç kalemi bulunmalıdır',
              severity: 'error',
              source: 'unspecified'
            })
          }
          return null
        }
      }

      DocumentValidationService.registerRule('ihtiyac-listesi', errRule)

      const invalidReport = DocumentValidationService.validate('ihtiyac-listesi', { kalemler: [] })
      expect(invalidReport.isValid).toBe(false)
      expect(invalidReport.hasErrors).toBe(true)
      expect(invalidReport.summary.errorCount).toBe(1)
      expect(invalidReport.errors[0].code).toBe('ERR_EMPTY_ITEMS')

      const validReport = DocumentValidationService.validate('ihtiyac-listesi', {
        kalemler: [{ id: 1, ad: 'Malzeme' }]
      })
      expect(validReport.isValid).toBe(true)
      expect(validReport.hasErrors).toBe(false)
      expect(validReport.summary.errorCount).toBe(0)
    })
  })

  describe('5. Birden Fazla Doğrulama Sonucunun Birlikte Döndürülmesi', () => {
    it('tek bir kural birden fazla bulgu döndürebilmeli ve hepsi raporda toplanmalı', () => {
      const multiRule: TemplateValidationRule = {
        id: 'multi-check',
        description: 'Çoklu alan kontrolü',
        validate: (payload) => {
          const issues: ValidationIssue[] = []
          if (!payload.ad) {
            issues.push(
              DocumentValidationService.createIssue({
                code: 'ERR_NAME',
                field: 'ad',
                message: 'Ad boş',
                severity: 'error'
              })
            )
          }
          if (!payload.tarih) {
            issues.push(
              DocumentValidationService.createIssue({
                code: 'WARN_DATE',
                field: 'tarih',
                message: 'Tarih belirtilmedi',
                severity: 'warning'
              })
            )
          }
          return issues
        }
      }

      DocumentValidationService.registerRule('test-multi', multiRule)

      const report = DocumentValidationService.validate('test-multi', {})
      expect(report.issues).toHaveLength(2)
      expect(report.errors).toHaveLength(1)
      expect(report.warnings).toHaveLength(1)
      expect(report.summary.total).toBe(2)
      expect(report.summary.errorCount).toBe(1)
      expect(report.summary.warningCount).toBe(1)
      expect(report.isValid).toBe(false)
    })
  })

  describe('6. İstisna Güvenliği (Exception Safety)', () => {
    it('kural çalışma esnasında throw etse dahi servis çökmemeli ve issue olarak raporlamalı', () => {
      const buggyRule: TemplateValidationRule = {
        id: 'buggy-rule',
        description: 'Hatalı kural implementasyonu',
        validate: () => {
          throw new Error('Beklenmeyen mantık hatası')
        }
      }

      DocumentValidationService.registerRule('crash-test', buggyRule)

      expect(() => {
        const report = DocumentValidationService.validate('crash-test', {})
        expect(report.issues).toHaveLength(1)
        expect(report.issues[0].code).toBe('RULE_EXECUTION_ERROR_buggy-rule')
        expect(report.issues[0].detail).toContain('Beklenmeyen mantık hatası')
      }).not.toThrow()
    })
  })

  describe('7. Bağlam (ValidationContext) ve Alım Türü İletimi', () => {
    it('bağlam parametreleri (procurementType, capabilities) kurala eksiksiz iletilmeli', () => {
      let receivedProcType = ''
      const contextRule: TemplateValidationRule = {
        id: 'context-check',
        description: 'Bağlam kontrolü',
        validate: (_payload, ctx) => {
          receivedProcType = ctx.procurementType || ''
          return null
        }
      }

      DocumentValidationService.registerRule('ctx-test', contextRule)

      DocumentValidationService.validate(
        'ctx-test',
        {},
        { procurementType: 'yapim_isi' }
      )

      expect(receivedProcType).toBe('yapim_isi')
    })
  })
})

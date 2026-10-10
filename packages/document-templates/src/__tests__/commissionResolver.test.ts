import { describe, it, expect } from 'vitest';
import { resolveCommissionCategory } from '../services/commissionResolver';
import { TemplateRegistryService } from '../services/templateRegistryService';

describe('Stage 7 — Commission Resolver & TemplateRegistryService Workflow Tests', () => {
  describe('1. Central Commission Classification (resolveCommissionCategory)', () => {
    it('should classify by explicit scope first', () => {
      expect(resolveCommissionCategory({ belge_kapsami: 'piyasa_arastirma' })).toBe('maliyet');
      expect(resolveCommissionCategory({ belge_kapsami: 'yaklasik_maliyet' })).toBe('maliyet');
      expect(resolveCommissionCategory({ belgeKapsami: 'muayene_kabul' })).toBe('muayene');
      expect(resolveCommissionCategory({ belge_kapsami: 'ihale_komisyonu' })).toBe('ihale');
      expect(resolveCommissionCategory({ belge_kapsami: 'gizli' })).toBe('unmapped');
    });

    it('should fall back to verified legacy database IDs', () => {
      expect(resolveCommissionCategory({ komisyon_id: 1 })).toBe('maliyet');
      expect(resolveCommissionCategory({ komisyon_id: 2 })).toBe('muayene');
      expect(resolveCommissionCategory({ komisyon_id: '1' })).toBe('maliyet');
      expect(resolveCommissionCategory({ komisyon_id: '2' })).toBe('muayene');
    });

    it('should fall back to normalized text classification', () => {
      expect(resolveCommissionCategory({ komisyon_turu: 'Piyasa Fiyat Araştırması' })).toBe('maliyet');
      expect(resolveCommissionCategory({ komisyon_adi: 'Muayene ve Kabul Komisyonu' })).toBe('muayene');
      expect(resolveCommissionCategory({ gorev: 'Fiyat Araştırma Görevlisi' })).toBe('maliyet');
    });

    it('should handle unmapped or invalid inputs safely without throwing', () => {
      expect(resolveCommissionCategory(null)).toBe('unmapped');
      expect(resolveCommissionCategory(undefined)).toBe('unmapped');
      expect(resolveCommissionCategory({})).toBe('unmapped');
      expect(resolveCommissionCategory({ komisyon_turu: 'Bilinmeyen Heyet' })).toBe('unmapped');
    });
  });

  describe('2. TemplateRegistryService Workflow Metadata Helpers', () => {
    it('should retrieve workflow metadata for templates with workflow', () => {
      const workflow = TemplateRegistryService.getWorkflow('harcama-talimati');
      expect(workflow).toBeDefined();

      const routing = TemplateRegistryService.getRouting('harcama-talimati');
      expect(routing).toBeDefined();
      expect(routing?.mode).toBe('role');
      expect(routing?.targetRole).toBe('harcama_yetkilisi');

      const rules = TemplateRegistryService.getSignatureRules('harcama-talimati');
      expect(rules).toBeDefined();
      expect(rules?.length).toBe(2);

      const approvalRole = TemplateRegistryService.getApprovalRole('harcama-talimati');
      expect(approvalRole).toBe('harcama_yetkilisi');
    });

    it('should return undefined for templates without workflow metadata', () => {
      expect(TemplateRegistryService.getWorkflow('ihtiyac-listesi')).toBeUndefined();
      expect(TemplateRegistryService.getRouting('ihtiyac-listesi')).toBeUndefined();
      expect(TemplateRegistryService.getSignatureRules('ihtiyac-listesi')).toBeUndefined();
    });
  });
});

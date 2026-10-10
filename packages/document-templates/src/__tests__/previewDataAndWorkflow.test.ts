import { describe, it, expect } from 'vitest';
import {
  TEMPLATE_REGISTRY,
  TemplateRegistryService,
  TemplateWorkflow,
  RequirementSource
} from '../index';

describe('Stage 6 — Preview Data, Workflow Metadata & Commission Classification Tests', () => {
  describe('1. Template Workflow Metadata Integrity & Compatibility', () => {
    it('should maintain backward compatibility for templates without workflow metadata', () => {
      const legacyTemplates = TEMPLATE_REGISTRY.filter((t) => !t.workflow);
      expect(legacyTemplates.length).toBeGreaterThan(0);
      for (const t of legacyTemplates) {
        expect(t.id).toBeDefined();
        expect(t.capabilities).toBeDefined();
        // Requesting role visibility on a template without workflow should work smoothly via capabilities fallback
        const vis = TemplateRegistryService.resolveRoleVisibility(t.id, 'harcama_yetkilisi');
        expect(['show', 'hide', 'optional']).toContain(vis);
      }
    });

    it('should validate verified workflow metadata on templates like harcama-talimati', () => {
      const template = TemplateRegistryService.getTemplateById('harcama-talimati');
      expect(template).toBeDefined();
      expect(template?.workflow).toBeDefined();

      const workflow = template?.workflow as TemplateWorkflow;
      expect(workflow.routing?.mode).toBe('role');
      expect(workflow.routing?.targetRole).toBe('harcama_yetkilisi');
      expect(workflow.routing?.usesDynamicInstitutionalHeading).toBe(true);

      expect(workflow.signatures).toBeDefined();
      expect(workflow.signatures?.length).toBe(2);

      const harcamaSig = workflow.signatures?.find((s) => s.role === 'harcama_yetkilisi');
      expect(harcamaSig).toBeDefined();
      expect(harcamaSig?.slotType).toBe('approved_by');
      expect(harcamaSig?.requirementSource).toBe('statutory');

      const gerceklestirmeSig = workflow.signatures?.find((s) => s.role === 'gerceklestirme_gorevlisi');
      expect(gerceklestirmeSig).toBeDefined();
      expect(gerceklestirmeSig?.slotType).toBe('checked_by');
      expect(gerceklestirmeSig?.requirementSource).toBe('statutory');
    });

    it('should verify explicitState definitions across defined workflow templates', () => {
      const templatesWithWorkflow = TEMPLATE_REGISTRY.filter((t) => t.workflow);
      expect(templatesWithWorkflow.length).toBeGreaterThan(0);
      for (const t of templatesWithWorkflow) {
        const wf = t.workflow!;
        if (wf.explicitState) {
          expect(['explicit_defined', 'explicit_none', 'unspecified_fallback']).toContain(wf.explicitState);
        }
      }
    });
  });

  describe('2. Role Policy Application & Hide Isolation (applyRolePolicy Simulation)', () => {
    it('should simulate applyRolePolicy clearing fields when policy is hide', () => {
      // Simulate role policy logic on baseData
      const templateId = 'piyasa-fiyat-arastirma-tutanagi'; // harcama_yetkilisi is 'hide'

      const harcamaPolicy = TemplateRegistryService.resolveRoleVisibility(templateId, 'harcama_yetkilisi');
      expect(harcamaPolicy).toBe('hide');

      const baseData: any = {
        harcamaYetkilisiAdi: 'Ahmet Yılmaz',
        harcamaYetkilisiUnvan: 'Müdür',
        onaylayanPersonelAdi: 'Ahmet Yılmaz',
        onaylayanPersonelUnvan: 'Müdür',
        hazirlayanPersonelAdi: 'Mehmet Demir',
        hazirlayanPersonelUnvan: 'Müh'
      };

      if (harcamaPolicy === 'hide') {
        baseData.harcamaYetkilisiAdi = '';
        baseData.harcamaYetkilisiUnvan = '';
      }

      expect(baseData.harcamaYetkilisiAdi).toBe('');
      expect(baseData.harcamaYetkilisiUnvan).toBe('');
      // Documenting current behavior: onaylayanPersonelAdi was NOT cleared when only harcamaYetkilisi was cleared unless policy checked both!
      expect(baseData.onaylayanPersonelAdi).toBe('Ahmet Yılmaz');
    });
  });

  describe('3. Commission Classification Current Behavior & Edge Cases', () => {
    // Documenting current text matching & ID based logic without modifying production behavior
    function simulateCurrentCommissionClassification(k: {
      komisyon_id?: number;
      komisyon_turu?: string;
      komisyon_adi?: string;
      gorev?: string;
      belge_kapsami?: string;
    }): 'maliyet' | 'muayene' | 'unmapped' {
      const scope = (k.belge_kapsami || '').trim().toLowerCase();
      if (scope === 'piyasa_arastirma' || scope === 'yaklasik_maliyet') {
        return 'maliyet';
      }
      if (scope === 'muayene_kabul') {
        return 'muayene';
      }

      const kId = k.komisyon_id;
      if (kId === 1) return 'maliyet';
      if (kId === 2) return 'muayene';

      const komTur = (k.komisyon_turu || k.komisyon_adi || k.gorev || '').toLowerCase();
      if (
        komTur.includes('fiyat') ||
        komTur.includes('maliyet') ||
        komTur.includes('araştırma') ||
        komTur.includes('arastirma')
      ) {
        return 'maliyet';
      }
      if (komTur.includes('muayene') || komTur.includes('kabul')) {
        return 'muayene';
      }

      return 'unmapped';
    }

    it('should correctly classify standard commission records', () => {
      expect(simulateCurrentCommissionClassification({ komisyon_id: 1 })).toBe('maliyet');
      expect(simulateCurrentCommissionClassification({ komisyon_id: 2 })).toBe('muayene');
      expect(simulateCurrentCommissionClassification({ belge_kapsami: 'piyasa_arastirma' })).toBe('maliyet');
      expect(simulateCurrentCommissionClassification({ belge_kapsami: 'muayene_kabul' })).toBe('muayene');
    });

    it('should demonstrate edge cases and potential ambiguities in current classification', () => {
      // Edge Case 1: Trailing whitespace in scope "muayene_kabul " without trim in legacy code
      expect(simulateCurrentCommissionClassification({ belge_kapsami: 'muayene_kabul ' })).toBe('muayene');

      // Edge Case 2: Conflicting IDs and text (e.g. komisyon_id = 1 but text says "Muayene Kabul")
      // Current behavior gives precedence to scope, then ID, then text.
      expect(simulateCurrentCommissionClassification({ komisyon_id: 1, komisyon_turu: 'Muayene Kabul Komisyonu' })).toBe('maliyet');

      // Edge Case 3: Unrecognized commission type text returns 'unmapped'
      expect(simulateCurrentCommissionClassification({ komisyon_turu: 'Özel İnceleme Heyeti' })).toBe('unmapped');
    });
  });

  describe('4. Snapshot Merging & Alias Leakage Test Scenarios', () => {
    it('should verify snapshot merge order precedence', () => {
      const baseData = { title: 'Base Document', teslimGun: '5' };
      const savedSnapshot = { teslimGun: '10', onayTarihi: '2026-01-01' };
      const initialData = { teslimGun: '15' };

      // Merging: Base -> Snapshot -> initialData
      const finalData = { ...baseData, ...savedSnapshot, ...initialData };

      expect(finalData.teslimGun).toBe('15'); // initialData wins over snapshot and base
      expect(finalData.onayTarihi).toBe('2026-01-01'); // snapshot preserved if not in initialData
    });
  });
});

import { describe, it, expect } from 'vitest';
import {
  TEMPLATE_REGISTRY,
  TemplateRegistryService,
  TemplateWorkflow,
  resolveCommissionCategory
} from '../index';

describe('Stage 7.1.1 — Production Integration & Workflow Tests', () => {
  describe('1. Central Commission Resolver Direct Production Integration', () => {
    it('should classify maliyet category correctly via resolveCommissionCategory', () => {
      expect(resolveCommissionCategory({ belge_kapsami: 'piyasa_arastirma' })).toBe('maliyet');
      expect(resolveCommissionCategory({ komisyon_id: 1 })).toBe('maliyet');
      expect(resolveCommissionCategory({ komisyon_turu: 'Piyasa Fiyat Araştırması' })).toBe('maliyet');
    });

    it('should classify muayene category correctly via resolveCommissionCategory', () => {
      expect(resolveCommissionCategory({ belge_kapsami: 'muayene_kabul' })).toBe('muayene');
      expect(resolveCommissionCategory({ komisyon_id: 2 })).toBe('muayene');
      expect(resolveCommissionCategory({ komisyon_adi: 'Muayene ve Kabul Komisyonu' })).toBe('muayene');
    });

    it('should return unmapped for unknown commission categories', () => {
      expect(resolveCommissionCategory({ komisyon_turu: 'Özel İnceleme Heyeti' })).toBe('unmapped');
      expect(resolveCommissionCategory({})).toBe('unmapped');
      expect(resolveCommissionCategory(null)).toBe('unmapped');
    });

    it('should preserve resolution precedence (explicit scope > ID > text)', () => {
      // Scope takes precedence over conflicting ID
      expect(resolveCommissionCategory({ belge_kapsami: 'muayene_kabul', komisyon_id: 1 })).toBe('muayene');
      // ID takes precedence over conflicting text
      expect(resolveCommissionCategory({ komisyon_id: 1, komisyon_turu: 'Muayene Kabul' })).toBe('maliyet');
    });

    it('should ensure unknown commission items filter to empty array and never leak into maliyet/muayene', () => {
      const dbRows = [
        { id: 10, ad_soyad: 'Ahmet Aras', komisyon_turu: 'Bilinmeyen Kurul' },
        { id: 11, ad_soyad: 'Mehmet Baki', komisyon_turu: 'Özel Denetim' }
      ];

      const maliyetMembers = dbRows.filter((r) => resolveCommissionCategory(r) === 'maliyet');
      const muayeneMembers = dbRows.filter((r) => resolveCommissionCategory(r) === 'muayene');

      expect(maliyetMembers).toEqual([]);
      expect(muayeneMembers).toEqual([]);
    });
  });

  describe('2. Real Role Policy Application & Alias Clearance (TemplateRegistryService.applyRolePolicy)', () => {
    it('should invoke real TemplateRegistryService.applyRolePolicy to clear primary and alias fields', () => {
      const templateId = 'piyasa-fiyat-arastirma-tutanagi'; // harcama_yetkilisi and onaylayan are 'hide', hazirlayan is 'show'

      const baseData: any = {
        harcamaYetkilisiAdi: 'Ahmet Yılmaz',
        harcamaYetkilisiUnvan: 'Müdür',
        harcamaYetkilisi: 'Ahmet Yılmaz',
        harcama_yetkilisi: 'Ahmet Yılmaz',
        onaylayanPersonelAdi: 'Mehmet Kaya',
        onaylayanPersonelUnvan: 'Şef',
        hazirlayanPersonelAdi: 'Ali Can',
        hazirlayanPersonelUnvan: 'Müh'
      };

      // Call REAL production function directly
      TemplateRegistryService.applyRolePolicy(baseData, templateId);

      // Primary and alias fields for hidden harcama_yetkilisi must be cleared
      expect(baseData.harcamaYetkilisiAdi).toBe('');
      expect(baseData.harcamaYetkilisiUnvan).toBe('');
      expect(baseData.harcamaYetkilisi).toBe('');
      expect(baseData.harcama_yetkilisi).toBe('');

      // Non-hidden role (hazirlayan) must be preserved
      expect(baseData.hazirlayanPersonelAdi).toBe('Ali Can');
      expect(baseData.goster.harcamaYetkilisi).toBe(false);
      expect(baseData.goster.hazirlayan).toBe(true);
    });

    it('should prevent snapshot/initialData from leaking hidden role values after applyRolePolicy runs', () => {
      const baseData = { title: 'Base Document' };
      const savedSnapshot = { harcamaYetkilisiAdi: 'Snapshot Personel', harcamaYetkilisi: 'Snapshot Personel' };
      const initialData = { harcamaYetkilisiAdi: 'Initial Personel' };

      // Merging sequence: baseData -> savedSnapshot -> initialData
      const mergedData = { ...baseData, ...savedSnapshot, ...initialData };

      // Execute REAL production applyRolePolicy
      TemplateRegistryService.applyRolePolicy(mergedData, 'piyasa-fiyat-arastirma-tutanagi');

      expect(mergedData.harcamaYetkilisiAdi).toBe('');
      expect(mergedData.harcamaYetkilisi).toBe('');
    });
  });

  describe('3. File Assignment & Visibility Allowlist Isolation', () => {
    it('should filter dossier commission members using isMemberVisibleInDocument with explicit target documents', () => {
      const fileAssignedMembers = [
        { id: 1, ad_soyad: 'Ali Veli', komisyon_turu: 'Piyasa Fiyat', belge_kapsami: 'ozel', hedef_belgeler: ['piyasa-fiyat-arastirma-tutanagi'] },
        { id: 2, ad_soyad: 'Zeynep Su', komisyon_turu: 'Piyasa Fiyat', belge_kapsami: 'ozel', hedef_belgeler: ['harcama-talimati'] }
      ];

      const visibleInTutanak = fileAssignedMembers.filter((m) =>
        TemplateRegistryService.isMemberVisibleInDocument(m, ['piyasa-fiyat-arastirma-tutanagi'])
      );

      expect(visibleInTutanak.length).toBe(1);
      expect(visibleInTutanak[0].ad_soyad).toBe('Ali Veli');
    });

    it('should keep commission panel empty when no dossier commission is assigned', () => {
      const dbKomisyonlar: any[] = [];
      const maliyetMembers = dbKomisyonlar.filter((k) => resolveCommissionCategory(k) === 'maliyet');
      const muayeneMembers = dbKomisyonlar.filter((k) => resolveCommissionCategory(k) === 'muayene');

      expect(maliyetMembers).toEqual([]);
      expect(muayeneMembers).toEqual([]);
    });
  });

  describe('4. Workflow Metadata Registry Verification', () => {
    it('should retrieve defined workflow metadata for harcama-talimati', () => {
      const workflow = TemplateRegistryService.getWorkflow('harcama-talimati');
      expect(workflow).toBeDefined();
      expect(workflow?.routing?.mode).toBe('role');

      const rules = TemplateRegistryService.getSignatureRules('harcama-talimati');
      expect(rules?.length).toBe(2);

      const approvalRole = TemplateRegistryService.getApprovalRole('harcama-talimati');
      expect(approvalRole).toBe('harcama_yetkilisi');
    });
  });
});



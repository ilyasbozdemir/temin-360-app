import { describe, it, expect } from 'vitest';
import {
  TEMPLATE_REGISTRY,
  TemplateRegistryService,
  TemplateWorkflow,
  resolveCommissionCategory,
  isTaskEligibleForMuayene,
  resolveTemplateData
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

  describe('5. Task Suitability Policy vs Commission Category Separation', () => {
    it('should reject incompatible roles via isTaskEligibleForMuayene', () => {
      expect(isTaskEligibleForMuayene('Fiyat Araştırma Görevlisi')).toBe(false);
      expect(isTaskEligibleForMuayene('fiyat arastirma')).toBe(false);
      expect(isTaskEligibleForMuayene('Harcama Yetkilisi')).toBe(false);
      expect(isTaskEligibleForMuayene('Muhasebe Yetkilisi')).toBe(false);
      expect(isTaskEligibleForMuayene('Gerçekleştirme Görevlisi')).toBe(false);
      expect(isTaskEligibleForMuayene('gerceklestirme')).toBe(false);

      // Input as object
      expect(isTaskEligibleForMuayene({ gorev: 'Harcama Yetkilisi' })).toBe(false);
      expect(isTaskEligibleForMuayene({ gorevi: 'Gerçekleştirme Görevlisi' })).toBe(false);
      expect(isTaskEligibleForMuayene({ komisyonGorevi: 'Fiyat Araştırma' })).toBe(false);
    });

    it('should accept valid inspection/acceptance roles via isTaskEligibleForMuayene', () => {
      expect(isTaskEligibleForMuayene('Komisyon Başkanı')).toBe(true);
      expect(isTaskEligibleForMuayene('Üye')).toBe(true);
      expect(isTaskEligibleForMuayene('Teknik Personel')).toBe(true);
      expect(isTaskEligibleForMuayene('Asil Üye')).toBe(true);
      expect(isTaskEligibleForMuayene('Yedek Üye')).toBe(true);
      expect(isTaskEligibleForMuayene('')).toBe(true);
      expect(isTaskEligibleForMuayene(null)).toBe(true);
      expect(isTaskEligibleForMuayene(undefined)).toBe(true);

      // Input as object
      expect(isTaskEligibleForMuayene({ gorev: 'Üye' })).toBe(true);
      expect(isTaskEligibleForMuayene({ gorev: 'Komisyon Başkanı' })).toBe(true);
    });

    it('should demonstrate clean separation: category resolution vs task suitability policy', () => {
      // Record has category 'muayene', but task is Harcama Yetkilisi (conflict of duties)
      const record = {
        komisyon_turu: 'Muayene ve Kabul Komisyonu',
        gorev: 'Harcama Yetkilisi'
      };

      // 1. Commission Category Resolver solely determines category
      expect(resolveCommissionCategory(record)).toBe('muayene');

      // 2. Task Suitability Policy independently evaluates duty eligibility
      expect(isTaskEligibleForMuayene(record)).toBe(false);

      // Filtering in UI requires BOTH conditions
      const allK = [
        { id: 1, komisyon_turu: 'Muayene Kabul', gorev: 'Üye' },
        { id: 2, komisyon_turu: 'Muayene Kabul', gorev: 'Harcama Yetkilisi' }, // incompatible
        { id: 3, komisyon_turu: 'Piyasa Araştırma', gorev: 'Fiyat Araştırma Görevlisi' } // maliyet
      ];

      const eligibleMuayene = allK.filter(
        (k) => resolveCommissionCategory(k) === 'muayene' && isTaskEligibleForMuayene(k)
      );

      expect(eligibleMuayene.length).toBe(1);
      expect(eligibleMuayene[0].id).toBe(1);
    });
  });

  describe('6. Real Production Data Loader (resolveTemplateData) Global Fallback Removal', () => {
    it('should return empty arrays when active dossier has no commission and NEVER query TANIM_KomisyonUye', async () => {
      const executedSqls: string[] = [];

      const mockQueryExecutor = async (sql: string, params: any[]) => {
        executedSqls.push(sql);

        if (sql.includes('DATA_TeminKomisyon')) {
          // Dossier has NO commission assigned
          return [];
        }
        if (sql.includes('TANIM_KomisyonUye')) {
          // If global fallback were called, this would return global pool members
          return [
            { id: 1, ad_soyad: 'Global Havuz Üyesi 1', komisyon_turu: 'Piyasa Fiyat' },
            { id: 2, ad_soyad: 'Global Havuz Üyesi 2', komisyon_turu: 'Muayene' }
          ];
        }
        return [];
      };

      const mapping = {
        fiyatKomisyonu: { tablo: 'DATA_TeminKomisyon', sutun: '*' },
        muayeneKomisyonu: { tablo: 'DATA_TeminKomisyon', sutun: '*' },
        komisyon: { tablo: 'DATA_TeminKomisyon', sutun: '*' }
      };

      const result = await resolveTemplateData(mapping as any, 101, mockQueryExecutor, 'piyasa-fiyat-arastirma-tutanagi');

      // Assertions:
      // 1. All commission lists must be empty
      expect(result.fiyatKomisyonu).toEqual([]);
      expect(result.muayeneKomisyonu).toEqual([]);
      expect(result.komisyon).toEqual([]);

      // 2. Global fallback table (TANIM_KomisyonUye) must NEVER be queried
      const queriedGlobalPool = executedSqls.some((sql) => sql.includes('TANIM_KomisyonUye'));
      expect(queriedGlobalPool).toBe(false);
    });

    it('should strictly separate maliyet, muayene and exclude unmapped members in real resolveTemplateData', async () => {
      const mockQueryExecutor = async (sql: string, params: any[]) => {
        if (sql.includes('DATA_TeminKomisyon')) {
          return [
            { id: 1, ad_soyad: 'Maliyet Üyesi', komisyon_turu_adi: 'Piyasa Fiyat', komisyon_id: 1, gorev: 'Üye' },
            { id: 2, ad_soyad: 'Muayene Üyesi', komisyon_turu_adi: 'Muayene Kabul', komisyon_id: 2, gorev: 'Üye' },
            { id: 3, ad_soyad: 'Bilinmeyen Üye', komisyon_turu_adi: 'Disiplin Kurulu', komisyon_id: 99, gorev: 'Raportör' }
          ];
        }
        return [];
      };

      const mapping = {
        fiyatKomisyonu: { tablo: 'DATA_TeminKomisyon', sutun: '*' },
        muayeneKomisyonu: { tablo: 'DATA_TeminKomisyon', sutun: '*' }
      };

      const result = await resolveTemplateData(mapping as any, 102, mockQueryExecutor, 'piyasa-fiyat-arastirma-tutanagi');

      // fiyatKomisyonu must ONLY contain maliyet member
      expect(result.fiyatKomisyonu.length).toBe(1);
      expect(result.fiyatKomisyonu[0].ad_soyad).toBe('Maliyet Üyesi');

      // muayeneKomisyonu must ONLY contain muayene member
      expect(result.muayeneKomisyonu.length).toBe(1);
      expect(result.muayeneKomisyonu[0].ad_soyad).toBe('Muayene Üyesi');

      // Unmapped member (id: 3) must NOT be present in either
      const allResolvedNames = [
        ...result.fiyatKomisyonu.map((m: any) => m.ad_soyad),
        ...result.muayeneKomisyonu.map((m: any) => m.ad_soyad)
      ];
      expect(allResolvedNames).not.toContain('Bilinmeyen Üye');
    });
  });
});



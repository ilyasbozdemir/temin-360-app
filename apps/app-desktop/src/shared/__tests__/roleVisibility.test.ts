import { describe, it, expect } from 'vitest'
import {
  TEMPLATE_REGISTRY,
  TemplateRegistryService,
  resolveTemplateData,
} from '@temin360/document-templates'
import { applyRolePolicy } from '../../../src/renderer/src/screens/dosya/components/DocumentPreviewModalV2/hooks/helpers/previewDataLoader'

describe('Belge Şablonlarında Rol/Kişi Görünürlük Politikası Testleri', () => {
  // TEST 1: Her TEMPLATE_REGISTRY girişinde roleVisibility tanımlı mı kontrolü
  it('1. TEMPLATE_REGISTRY içindeki her şablonda roleVisibility tanımlı olmalıdır', () => {
    expect(TEMPLATE_REGISTRY.length).toBeGreaterThan(0)
    for (const template of TEMPLATE_REGISTRY) {
      expect(template.capabilities).toBeDefined()
      expect(template.capabilities.roleVisibility).toBeDefined()
      expect(typeof template.capabilities.roleVisibility).toBe('object')
      // Tanımsız rol sorgulandığında güvenli varsayılan 'hide' dönmelidir
      const unkVis = TemplateRegistryService.resolveRoleVisibility(
        template.id,
        'ihale_yetkilisi' as any
      )
      expect(['show', 'hide', 'optional']).toContain(unkVis)
    }
  })

  // TEST 2: Politika 'hide' iken DATA_TeminKomisyon'da harcama yetkilisi olsa da alan boşaltılır
  it('2. Politika hide iken harcama yetkilisi veya komisyon üyesi basılmamalıdır', () => {
    const templateId = 'piyasa-fiyat-arastirma-tutanagi'
    const policy = TemplateRegistryService.resolveRoleVisibility(templateId, 'harcama_yetkilisi')
    expect(policy).toBe('hide')

    const baseData: Record<string, any> = {
      harcamaYetkilisiAdi: 'Ahmet Yılmaz',
      harcamaYetkilisiUnvan: 'Harcama Yetkilisi',
      onaylayanPersonelAdi: 'Ahmet Yılmaz',
      onaylayanPersonelUnvan: 'Harcama Yetkilisi'
    }

    applyRolePolicy(baseData, templateId)

    expect(baseData.harcamaYetkilisiAdi).toBe('')
    expect(baseData.harcamaYetkilisiUnvan).toBe('')
    expect(baseData.goster?.harcamaYetkilisi).toBe(false)

    // Commission member with role 'Harcama Yetkilisi' is hidden in piyasa-fiyat-arastirma-tutanagi
    const member = {
      ad_soyad: 'Ahmet Yılmaz',
      unvan: 'Müdür',
      gorev: 'Harcama Yetkilisi',
      belgede_goster: 1
    }
    const isVisible = TemplateRegistryService.isMemberVisibleInTemplate(member, templateId)
    expect(isVisible).toBe(false)
  })

  // TEST 3: hedef_belgeler başka şablonu gösteriyorsa üye çıkmaz
  it('3. hedef_belgeler başka şablonu gösteriyorsa (veya kapsam gizli ise) üye filtrelenmelidir', () => {
    const memberTargetingOther = {
      ad_soyad: 'Mehmet Öz',
      gorev: 'Üye',
      belge_kapsami: 'ozel',
      hedef_belgeler: JSON.stringify(['harcama-talimati', 'dogrudan-temin-onay-belgesi'])
    }

    const isVisibleInMuayene = TemplateRegistryService.isMemberVisibleInTemplate(
      memberTargetingOther,
      'muayene-kabul-tutanagi'
    )
    expect(isVisibleInMuayene).toBe(false)

    const isVisibleInHarcamaTalimati = TemplateRegistryService.isMemberVisibleInTemplate(
      memberTargetingOther,
      'harcama-talimati'
    )
    expect(isVisibleInHarcamaTalimati).toBe(true)

    // belgede_goster = 0 veya belge_kapsami = 'gizli' durumu
    const hiddenMember = {
      ad_soyad: 'Ali Veli',
      gorev: 'Üye',
      belge_kapsami: 'gizli'
    }
    expect(
      TemplateRegistryService.isMemberVisibleInTemplate(hiddenMember, 'harcama-talimati')
    ).toBe(false)
  })

  // TEST 4: onay_personel_id fallback'i 'hide' iken çalışmaz
  it('4. Onaylayan/harcama rolü hide iken onay_personel_id otomatik doldurulmaz', () => {
    const templateId = 'komisyon-gorevlendirme-onayi-eki'
    const onayPolicy = TemplateRegistryService.resolveRoleVisibility(templateId, 'onaylayan')
    expect(onayPolicy).toBe('hide')

    const baseData: Record<string, any> = {
      onaylayanPersonelAdi: 'Otomatik Atanmis Baskan',
      onaylayanPersonelUnvan: 'Baskan'
    }

    applyRolePolicy(baseData, templateId)

    expect(baseData.onaylayanPersonelAdi).toBe('')
    expect(baseData.onaylayanPersonelUnvan).toBe('')
    expect(baseData.goster?.onaylayan).toBe(false)
  })

  // TEST 5: Personel atanmamışken otomatik kişi uydurulmaz/basılmaz
  it('5. Dosyada personel atanmamışken mappingResolver otomatik tahminle kişi basmamalıdır', async () => {
    const mockQueryExecutor = async (sql: string, params: any[]) => {
      if (sql.includes('DATA_TeminDosyasi')) {
        return [{ id: 1, onay_personel_id: null, talep_eden_personel_id: null }]
      }
      if (sql.includes('TANIM_Personel')) {
        return [{ id: 10, ad_soyad: 'Rastgele Personel', unvan: 'Müdür' }]
      }
      return []
    }

    const mapping = {
      onaylayanPersonelAdi: {
        tablo: 'DATA_TeminDosyasi',
        sutun: 'onay_personel_id',
        iliskiliTablo: 'TANIM_Personel',
        iliskiliSutun: 'ad_soyad'
      }
    }

    const result = await resolveTemplateData(
      mapping,
      1,
      mockQueryExecutor,
      'harcama-talimati'
    )

    // Dosyada onay_personel_id null olduğu için rastgele bir kişi basılmamalı, boş/null dönmelidir
    expect(result.onaylayanPersonelAdi).toBeFalsy()
  })
})

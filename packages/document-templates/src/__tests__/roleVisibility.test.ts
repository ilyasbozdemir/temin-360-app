import { describe, it, expect } from 'vitest'
import {
  TEMPLATE_REGISTRY,
  TemplateRegistryService,
  resolveTemplateData,
  RoleCode
} from '../index'

describe('Belge Şablonlarında Rol/Kişi Görünürlük Politikası Testleri', () => {
  // TEST 1: Grup bazlı rol görünürlüğü ve template.group yapısı
  it('1. Şablonlarda grup tanımları ve grup bazlı roleVisibility çözümlemesi doğru çalışmalıdır', () => {
    expect(TEMPLATE_REGISTRY.length).toBeGreaterThan(0)
    for (const template of TEMPLATE_REGISTRY) {
      expect(template.capabilities).toBeDefined()
      // Şablon grubu opsiyonel TemplateGroup olmalıdır
      if (template.group) {
        expect(['piyasa_arastirma', 'muayene_kabul', 'olur_onay']).toContain(template.group)
      }
      // resolveRoleVisibility her şablon ve rol için geçerli bir politika dönmelidir
      const roles: RoleCode[] = [
        'harcama_yetkilisi',
        'gerceklestirme_gorevlisi',
        'muhasebe',
        'onaylayan',
        'hazirlayan',
        'talep_eden',
        'ihale_yetkilisi'
      ]
      for (const role of roles) {
        const vis = TemplateRegistryService.resolveRoleVisibility(template.id, role)
        expect(['show', 'hide', 'optional']).toContain(vis)
      }
    }
  })

  // TEST 2: Politika 'hide' iken harcama yetkilisi rolü gizlenir
  it('2. Politika hide iken harcama yetkilisi veya komisyon üyesi basılmamalıdır', () => {
    const templateId = 'piyasa-fiyat-arastirma-tutanagi'
    const policy = TemplateRegistryService.resolveRoleVisibility(templateId, 'harcama_yetkilisi')
    expect(policy).toBe('hide')

    // Commission member with role 'Harcama Yetkilisi' and scope 'olur_onay' is hidden in piyasa-fiyat-arastirma-tutanagi
    const member = {
      ad_soyad: 'Ahmet Yılmaz',
      unvan: 'Müdür',
      gorev: 'Harcama Yetkilisi',
      belge_kapsami: 'olur_onay',
      belgede_goster: 1
    }
    const isVisible = TemplateRegistryService.isMemberVisibleInTemplate(member, templateId)
    expect(isVisible).toBe(false)
  })

  // TEST 2.1: isMemberVisibleInDocument kapsam ve kanonik alias testleri
  it('2.1 isMemberVisibleInDocument kapsam kurallarını ve alias eşleşmelerini doğru çalıştırmalıdır', () => {
    // tumu veya boş
    expect(TemplateRegistryService.isMemberVisibleInDocument({ belge_kapsami: 'tumu' }, 'herhangi-belge')).toBe(true)
    expect(TemplateRegistryService.isMemberVisibleInDocument({ belge_kapsami: '' }, 'herhangi-belge')).toBe(true)
    expect(TemplateRegistryService.isMemberVisibleInDocument({}, 'herhangi-belge')).toBe(true)

    // gizli
    expect(TemplateRegistryService.isMemberVisibleInDocument({ belge_kapsami: 'gizli' }, 'harcama-talimati')).toBe(false)

    // piyasa_arastirma
    const fiyatUyesi = { belge_kapsami: 'piyasa_arastirma' }
    expect(TemplateRegistryService.isMemberVisibleInDocument(fiyatUyesi, 'piyasa-fiyat-arastirma-tutanagi')).toBe(true)
    expect(TemplateRegistryService.isMemberVisibleInDocument(fiyatUyesi, 'fiyat-arastirmasi')).toBe(true) // alias
    expect(TemplateRegistryService.isMemberVisibleInDocument(fiyatUyesi, 'muayene-kabul-tutanagi')).toBe(false)

    // olur_onay
    const harcamaUyesi = { belge_kapsami: 'olur_onay' }
    expect(TemplateRegistryService.isMemberVisibleInDocument(harcamaUyesi, 'harcama-talimati')).toBe(true)
    expect(TemplateRegistryService.isMemberVisibleInDocument(harcamaUyesi, 'idare-onay-belgesi')).toBe(true) // alias
    expect(TemplateRegistryService.isMemberVisibleInDocument(harcamaUyesi, 'dogrudan-temin-onay-belgesi')).toBe(true)
    expect(TemplateRegistryService.isMemberVisibleInDocument(harcamaUyesi, 'piyasa-fiyat-arastirma-tutanagi')).toBe(false)

    // ozel
    const ozelUye = {
      belge_kapsami: 'ozel',
      hedef_belgeler: ['idare-onay-belgesi', 'butce-sorgusu']
    }
    expect(TemplateRegistryService.isMemberVisibleInDocument(ozelUye, 'harcama-talimati')).toBe(true) // idare-onay-belgesi alias resolves to harcama-talimati
    expect(TemplateRegistryService.isMemberVisibleInDocument(ozelUye, 'butce-sorgusu')).toBe(true)
    expect(TemplateRegistryService.isMemberVisibleInDocument(ozelUye, 'muayene-kabul-tutanagi')).toBe(false)

    // ozel with wildcard *
    const wildcardUye = {
      belge_kapsami: 'ozel',
      hedef_belgeler: ['*']
    }
    expect(TemplateRegistryService.isMemberVisibleInDocument(wildcardUye, 'muayene-kabul-tutanagi')).toBe(true)
  })

  // TEST 3: hedef_belgeler başka şablonu gösteriyorsa üye filtrelenmelidir
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

  // TEST 4: Personel atanmamışken otomatik kişi uydurulmaz/basılmaz
  it('4. Dosyada personel atanmamışken mappingResolver otomatik tahminle kişi basmamalıdır', async () => {
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

  // TEST 5: gizli kisi imza ve komisyon listesinde bos kalmali, fallback calismamalidir
  it('5. Gizli kisi komisyon ve imza alanlarinda gorunmemelidir', () => {
    const hiddenHarcama = {
      ad_soyad: 'Gizli Yetkili',
      unvan: 'Harcama Yetkilisi',
      gorev: 'Harcama Yetkilisi',
      belge_kapsami: 'gizli'
    }

    expect(
      TemplateRegistryService.isMemberVisibleInDocument(hiddenHarcama, 'harcama-talimati')
    ).toBe(false)
    expect(
      TemplateRegistryService.isMemberVisibleInTemplate(hiddenHarcama, 'harcama-talimati')
    ).toBe(false)

    const filtered = TemplateRegistryService.filterMembersForTemplate([hiddenHarcama], 'harcama-talimati')
    expect(filtered.length).toBe(0)
  })

  // TEST 6: idare-onay-belgesi alias'ı ile açılan belgede olur_onay ve ozel kapsam çalışmalıdır
  it('6. idare-onay-belgesi alias normalizasyonu ile belge kapsamı doğrulanmalıdır', () => {
    const onayMember = {
      ad_soyad: 'Onaylayan Baskan',
      belge_kapsami: 'olur_onay'
    }
    // idare-onay-belgesi -> harcama-talimati kanonik ID'sine gider ve olur_onay listesindedir
    expect(
      TemplateRegistryService.isMemberVisibleInDocument(onayMember, 'idare-onay-belgesi')
    ).toBe(true)

    const ozelMember = {
      ad_soyad: 'Ozel Uye',
      belge_kapsami: 'ozel',
      hedef_belgeler: ['idare-onay-belgesi']
    }
    // ozel hedefinde idare-onay-belgesi varken harcama-talimati veya idare-onay-belgesi sorgusunda gorunur
    expect(
      TemplateRegistryService.isMemberVisibleInDocument(ozelMember, 'harcama-talimati')
    ).toBe(true)
    expect(
      TemplateRegistryService.isMemberVisibleInDocument(ozelMember, 'idare-onay-belgesi')
    ).toBe(true)
    expect(
      TemplateRegistryService.isMemberVisibleInDocument(ozelMember, 'muayene-kabul-tutanagi')
    ).toBe(false)
  })

  // TEST 7: Grupsuz şablonlarda yalnızca tumu/ozel kapsamlı kişiler görünür
  it('7. Grupsuz şablonlarda (group undefined) sadece tumu veya ozel kapsamlı kişiler görünmelidir', () => {
    const ungroupedDoc = 'ihtiyac-listesi'
    const template = TEMPLATE_REGISTRY.find((t) => t.id === ungroupedDoc)
    expect(template?.group).toBeUndefined()

    // tumu görünür
    expect(TemplateRegistryService.isMemberVisibleInDocument({ belge_kapsami: 'tumu' }, ungroupedDoc)).toBe(true)

    // ozel hedefinde bu şablon varsa görünür
    expect(
      TemplateRegistryService.isMemberVisibleInDocument(
        { belge_kapsami: 'ozel', hedef_belgeler: [ungroupedDoc] },
        ungroupedDoc
      )
    ).toBe(true)

    // grup kapsamlı üyeler grupsuz belgede GÖRÜNMEZ
    expect(
      TemplateRegistryService.isMemberVisibleInDocument({ belge_kapsami: 'piyasa_arastirma' }, ungroupedDoc)
    ).toBe(false)
    expect(
      TemplateRegistryService.isMemberVisibleInDocument({ belge_kapsami: 'muayene_kabul' }, ungroupedDoc)
    ).toBe(false)
    expect(
      TemplateRegistryService.isMemberVisibleInDocument({ belge_kapsami: 'olur_onay' }, ungroupedDoc)
    ).toBe(false)
  })
})

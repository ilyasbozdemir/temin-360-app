/**
 * Geliştirici ve Test Modu Veri Tohumlama (Database Seeder) Servisi
 * TEMİN 360 - Kurum, Birimler, Personeller, Firmalar, Kalemler, Komisyonlar, Ambarlar,
 * KİK Limitleri, Ayarlar ve Doğrudan Temin Dosya Süreçlerini Eksiksiz Gerçekçi Verilerle Doldurur.
 */

export interface SeedResult {
  success: boolean
  message: string
  details?: {
    kurumUpdated?: boolean
    birimlerCount?: number
    personelCount?: number
    firmalarCount?: number
    kalemlerCount?: number
    komisyonlarCount?: number
    ambarCount?: number
    kikLimitCount?: number
    dosyalarEnrichedCount?: number
    totalRecordsInserted?: number
  }
}

export const devSeedService = {
  /**
   * Önceki test verilerini (hareketler, teklifler, kalemler, dosyalar ve gerektiğinde tanımlar)
   * tamamen temizler; böylece tohumlama sıfırdan, çakışmasız ve güncel ilişkilerle yeniden yüklenir.
   */
  async cleanExistingSeedData(): Promise<void> {
    const runSql = async (sql: string, params: unknown[] = []): Promise<void> => {
      try {
        await window.electron.ipcRenderer.invoke('db:run', sql, params)
      } catch (e) {
        console.warn('[devSeedService] Clean step warning for SQL:', sql, e)
      }
    }

    // 1. DATA (Hareket / Süreç) tablolarını temizle
    await runSql('DELETE FROM DATA_TeminKalemTeklif')
    await runSql('DELETE FROM DATA_TeminKalem')
    await runSql('DELETE FROM DATA_TeminFirma')
    await runSql('DELETE FROM DATA_TeminKomisyon')
    await runSql('DELETE FROM DATA_TeminEkSurec')
    await runSql('DELETE FROM DATA_TeminDosyasi')
    await runSql('DELETE FROM DATA_HakedisKalem')
    await runSql('DELETE FROM DATA_HakedisKesinti')
    await runSql('DELETE FROM DATA_Hakedis')

    // 2. TANIM tablolarını temizle
    await runSql('DELETE FROM TANIM_Kalem')
    await runSql('DELETE FROM TANIM_Firma')
    await runSql('DELETE FROM TANIM_Ambar')
    await runSql('DELETE FROM TANIM_Komisyon')
    await runSql('DELETE FROM TANIM_Birim')
    await runSql('DELETE FROM TANIM_Personel')
    await runSql('DELETE FROM TANIM_KikLimit')

    // 3. SQLite AUTOINCREMENT sayaçlarını sıfırla (ID'ler temiz 1'den başlasın)
    await runSql(
      "DELETE FROM sqlite_sequence WHERE name IN ('DATA_TeminDosyasi', 'DATA_TeminKalem', 'DATA_TeminFirma', 'DATA_TeminKalemTeklif', 'DATA_TeminKomisyon', 'TANIM_Birim', 'TANIM_Personel', 'TANIM_Firma', 'TANIM_Kalem', 'TANIM_Ambar', 'TANIM_Komisyon', 'TANIM_KikLimit')"
    )
  },

  /**
   * Tek tıkla tüm sistemi ve ilişkili tüm tabloları eksiksiz test verisiyle doldurur.
   * cleanFirst: true olduğunda önce eski kayıtları tamamen siler, sıfırdan oluşturur.
   */
  async seedAll(cleanFirst = true): Promise<SeedResult> {
    try {
      if (cleanFirst) {
        await this.cleanExistingSeedData()
      }

      const details: SeedResult['details'] = {
        kurumUpdated: false,
        birimlerCount: 0,
        personelCount: 0,
        firmalarCount: 0,
        kalemlerCount: 0,
        komisyonlarCount: 0,
        ambarCount: 0,
        kikLimitCount: 0,
        dosyalarEnrichedCount: 0,
        totalRecordsInserted: 0
      }

      // 1. Kurum ve Genel Ayarları Doldur
      await this.seedKurum()
      await this.seedSettings()
      details.kurumUpdated = true

      // 2. KİK Parasal Limit Dönemlerini Doldur
      await this.seedKikLimitleri()
      details.kikLimitCount = 3

      // 3. Personelleri Doldur ve Rolleri Eşle
      const personelIds = await this.seedPersonel()
      details.personelCount = personelIds.length

      // 4. Birimleri (Harcama Birimleri ve Antetleriyle) Doldur
      const birimIds = await this.seedBirimler(personelIds)
      details.birimlerCount = birimIds.length

      // 5. Tedarikçi / İstekli Firmaları Doldur
      const firmaIds = await this.seedFirmalar()
      details.firmalarCount = firmaIds.length

      // 6. Kalem Havuzunu (Mal, Hizmet, Yapım) Doldur
      const kalemIds = await this.seedKalemler()
      details.kalemlerCount = kalemIds.length

      // 7. Komisyon ve Ambar Tanımlarını Doldur
      await this.seedKomisyonlarVeAmbarlar()
      details.komisyonlarCount = 3
      details.ambarCount = 4

      // 8. Doğrudan Temin Dosyalarını (Kalem, Teklif, Komisyon ve Hesaplamalarıyla) Doldur
      const enrichedCount = await this.enrichExistingDosyalar(firmaIds, personelIds, birimIds)
      details.dosyalarEnrichedCount = enrichedCount

      return {
        success: true,
        message: 'Tüm sistem (Kurum, Birimler, Personeller, Firmalar, Kalemler, Komisyonlar, Ambarlar ve Dosyalar) tertemiz sıfırlanıp eksiksiz tohumlandı!',
        details
      }
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : 'Bilinmeyen hata'
      console.error('[devSeedService] Hata:', error)
      return {
        success: false,
        message: `Tohumlama başarısız oldu: ${errMsg}`
      }
    }
  },

  /**
   * Kurum bilgilerini eksiksiz günceller / ekler
   */
  async seedKurum(): Promise<void> {
    const antetSatirlariJson = JSON.stringify([
      'T.C.',
      'SAĞLIK BAKANLIĞI',
      'Ankara İl Sağlık Müdürlüğü'
    ])

    const kurumData = {
      kurum_adi: 'T.C. ANKARA VALİLİĞİ İL SAĞLIK MÜDÜRLÜĞÜ',
      kurum_anteti: antetSatirlariJson,
      makam_adi: 'İL SAĞLIK MÜDÜRLÜĞÜ MAKAMINA',
      ust_kurum_adi: 'T.C. SAĞLIK BAKANLIĞI',
      logo_sol: '',
      logo_sag: '',
      logo_kurum: '',
      limit_tipi: 'diger',
      finansman_kodu: '5',
      kurum_tipi: 'İl Müdürlüğü',
      alt_kurum_tipi: 'bakanlik',
      alt_kurum_ozel_tanim: 'Müdürlüğümüz',
      alt_kurum_bizim: 'Müdürlüğümüzün',
      alt_kurum_sizin: 'Müdürlüğünüzün',
      alt_kurum_onun: 'Müdürlüğünün',
      alt_kurum_onlarin: 'Müdürlüklerinin',
      ebutce_kodu: '06.24.01.00',
      say2000i_kodu: '06.01.00.04',
      fonksiyonel_kod: '07.1.1.00',
      muhasebe_birim_kodu: '06001',
      muhasebe_birim_adi: 'Ankara Defterdarlığı Muhasebe Müdürlüğü',
      harcama_birim_kodu: '1001',
      harcama_birim_adi: 'Destek Hizmetleri Başkanlığı',
      dtvt_kodu: 'DT-06-001',
      detsis_kodu: '10234521',
      konu_ortalama_siniri: 'true',
      adres: 'Mithatpaşa Cad. No:3 Sıhhiye',
      ilce: 'Çankaya',
      posta_kodu: '06420',
      il: 'Ankara',
      telefon: '0312 585 10 00',
      faks: '0312 585 10 10',
      eposta: 'ankara.ism@saglik.gov.tr',
      kep_adresi: 'saglikbakanligi@hs01.kep.tr',
      web_sitesi: 'https://ankaraism.saglik.gov.tr'
    }

    const kurumCheck = await window.electron.ipcRenderer.invoke(
      'db:query',
      'SELECT id FROM TANIM_Kurum LIMIT 1'
    )

    if (kurumCheck.success && kurumCheck.data && kurumCheck.data.length > 0) {
      await window.electron.ipcRenderer.invoke(
        'db:run',
        `UPDATE TANIM_Kurum SET 
          kurum_adi = ?, 
          kurum_anteti = ?,
          makam_adi = ?, 
          ust_kurum_adi = ?, 
          limit_tipi = ?,
          finansman_kodu = ?,
          kurum_tipi = ?,
          alt_kurum_tipi = ?,
          alt_kurum_ozel_tanim = ?,
          alt_kurum_bizim = ?,
          alt_kurum_sizin = ?,
          alt_kurum_onun = ?,
          alt_kurum_onlarin = ?,
          ebutce_kodu = ?, 
          say2000i_kodu = ?, 
          fonksiyonel_kod = ?,
          muhasebe_birim_kodu = ?,
          muhasebe_birim_adi = ?,
          harcama_birim_kodu = ?,
          harcama_birim_adi = ?,
          dtvt_kodu = ?,
          detsis_kodu = ?,
          konu_ortalama_siniri = ?,
          adres = ?, 
          ilce = ?, 
          posta_kodu = ?,
          il = ?, 
          telefon = ?, 
          faks = ?,
          eposta = ?, 
          kep_adresi = ?,
          web_sitesi = ?
        WHERE id = ?`,
        [
          kurumData.kurum_adi,
          kurumData.kurum_anteti,
          kurumData.makam_adi,
          kurumData.ust_kurum_adi,
          kurumData.limit_tipi,
          kurumData.finansman_kodu,
          kurumData.kurum_tipi,
          kurumData.alt_kurum_tipi,
          kurumData.alt_kurum_ozel_tanim,
          kurumData.alt_kurum_bizim,
          kurumData.alt_kurum_sizin,
          kurumData.alt_kurum_onun,
          kurumData.alt_kurum_onlarin,
          kurumData.ebutce_kodu,
          kurumData.say2000i_kodu,
          kurumData.fonksiyonel_kod,
          kurumData.muhasebe_birim_kodu,
          kurumData.muhasebe_birim_adi,
          kurumData.harcama_birim_kodu,
          kurumData.harcama_birim_adi,
          kurumData.dtvt_kodu,
          kurumData.detsis_kodu,
          kurumData.konu_ortalama_siniri,
          kurumData.adres,
          kurumData.ilce,
          kurumData.posta_kodu,
          kurumData.il,
          kurumData.telefon,
          kurumData.faks,
          kurumData.eposta,
          kurumData.kep_adresi,
          kurumData.web_sitesi,
          kurumCheck.data[0].id
        ]
      )
    } else {
      await window.electron.ipcRenderer.invoke(
        'db:run',
        `INSERT INTO TANIM_Kurum (
          kurum_adi, kurum_anteti, makam_adi, ust_kurum_adi, limit_tipi, finansman_kodu, kurum_tipi,
          alt_kurum_tipi, alt_kurum_ozel_tanim, alt_kurum_bizim, alt_kurum_sizin, alt_kurum_onun, alt_kurum_onlarin,
          ebutce_kodu, say2000i_kodu, fonksiyonel_kod, muhasebe_birim_kodu, muhasebe_birim_adi,
          harcama_birim_kodu, harcama_birim_adi, dtvt_kodu, detsis_kodu, konu_ortalama_siniri,
          adres, ilce, posta_kodu, il, telefon, faks, eposta, kep_adresi, web_sitesi
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          kurumData.kurum_adi,
          kurumData.kurum_anteti,
          kurumData.makam_adi,
          kurumData.ust_kurum_adi,
          kurumData.limit_tipi,
          kurumData.finansman_kodu,
          kurumData.kurum_tipi,
          kurumData.alt_kurum_tipi,
          kurumData.alt_kurum_ozel_tanim,
          kurumData.alt_kurum_bizim,
          kurumData.alt_kurum_sizin,
          kurumData.alt_kurum_onun,
          kurumData.alt_kurum_onlarin,
          kurumData.ebutce_kodu,
          kurumData.say2000i_kodu,
          kurumData.fonksiyonel_kod,
          kurumData.muhasebe_birim_kodu,
          kurumData.muhasebe_birim_adi,
          kurumData.harcama_birim_kodu,
          kurumData.harcama_birim_adi,
          kurumData.dtvt_kodu,
          kurumData.detsis_kodu,
          kurumData.konu_ortalama_siniri,
          kurumData.adres,
          kurumData.ilce,
          kurumData.posta_kodu,
          kurumData.il,
          kurumData.telefon,
          kurumData.faks,
          kurumData.eposta,
          kurumData.kep_adresi,
          kurumData.web_sitesi
        ]
      )
    }
  },

  /**
   * Genel Ayarlar (settings tablosu) parametrelerini doldurur
   */
  async seedSettings(): Promise<void> {
    const settingsList = [
      { key: 'institutionName', value: 'T.C. ANKARA VALİLİĞİ İL SAĞLIK MÜDÜRLÜĞÜ' },
      { key: 'parentInstitution', value: 'T.C. SAĞLIK BAKANLIĞI' },
      { key: 'spendingUnit', value: 'Destek Hizmetleri Başkanlığı (Satınalma Birimi)' },
      { key: 'harcamaBirimAdi', value: 'Destek Hizmetleri Başkanlığı' },
      { key: 'kurumAdres', value: 'Mithatpaşa Cad. No:3 Sıhhiye / Çankaya / ANKARA' },
      { key: 'kurumTelefon', value: '0312 585 10 00' },
      { key: 'kurumEposta', value: 'ankara.ism@saglik.gov.tr' },
      { key: 'kullanilabilirOdenek', value: '1.250.000,00 TL' },
      {
        key: 'institutionLetterhead',
        value: JSON.stringify([
          'T.C.',
          'SAĞLIK BAKANLIĞI',
          'Ankara İl Sağlık Müdürlüğü',
          'Destek Hizmetleri Başkanlığı'
        ])
      },
      { key: 'subInstitutionType', value: 'bakanlik' },
      { key: 'customSubInstitutionLabel', value: 'Müdürlüğümüz' },
      { key: 'customSubInstitutionKurumumuz', value: 'Müdürlüğümüzce' },
      { key: 'customSubInstitutionKurumu', value: 'Müdürlüğü' }
    ]

    for (const s of settingsList) {
      await window.electron.ipcRenderer.invoke(
        'db:run',
        `INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
        [s.key, s.value]
      )
    }
  },

  /**
   * KİK Doğrudan Temin parasal limit dönemlerini doldurur
   */
  async seedKikLimitleri(): Promise<void> {
    const periods = [
      {
        donem_kodu: '2026',
        baslangic_tarihi: '2026-02-01',
        bitis_tarihi: '2027-01-31',
        buyuksehir_limit: 1021827.0,
        diger_limit: 340391.0,
        guncelleme_orani: '%43.93',
        kaynak: '2026 KİK Tebliği'
      },
      {
        donem_kodu: '2025',
        baslangic_tarihi: '2025-02-01',
        bitis_tarihi: '2026-01-31',
        buyuksehir_limit: 709947.0,
        diger_limit: 236495.0,
        guncelleme_orani: '%58.46',
        kaynak: '2025 KİK Tebliği'
      },
      {
        donem_kodu: '2024',
        baslangic_tarihi: '2024-02-01',
        bitis_tarihi: '2025-01-31',
        buyuksehir_limit: 448083.0,
        diger_limit: 149309.0,
        guncelleme_orani: '%64.77',
        kaynak: '2024 KİK Tebliği'
      }
    ]

    for (const p of periods) {
      await window.electron.ipcRenderer.invoke(
        'db:run',
        `INSERT INTO TANIM_KikLimitDonemleri (
          donem_kodu, baslangic_tarihi, bitis_tarihi, buyuksehir_limit, diger_limit, guncelleme_orani, kaynak
        ) VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(donem_kodu) DO UPDATE SET 
          buyuksehir_limit = excluded.buyuksehir_limit,
          diger_limit = excluded.diger_limit,
          guncelleme_orani = excluded.guncelleme_orani,
          kaynak = excluded.kaynak`,
        [p.donem_kodu, p.baslangic_tarihi, p.bitis_tarihi, p.buyuksehir_limit, p.diger_limit, p.guncelleme_orani, p.kaynak]
      )
    }
  },

  /**
   * Personel havuzunu eksiksiz ekler ve rollere bağlar
   */
  async seedPersonel(): Promise<number[]> {
    const personelList = [
      {
        ad_soyad: 'Uzm. Dr. Ali Kemal Yılmaz',
        unvan: 'İl Sağlık Müdürü (Harcama Yetkilisi)',
        birim: 'Destek Hizmetleri Başkanlığı',
        sicil: '10482',
        tel: '0532 100 0001',
        ep: 'ali.yilmaz@saglik.gov.tr'
      },
      {
        ad_soyad: 'Mehmet Ali Özkan',
        unvan: 'Destek Hizmetleri Başkanı (Harcama Yetkilisi)',
        birim: 'Destek Hizmetleri Başkanlığı',
        sicil: '12490',
        tel: '0533 200 0002',
        ep: 'mehmet.ozkan@saglik.gov.tr'
      },
      {
        ad_soyad: 'Ayşe Kaya Demir',
        unvan: 'Şube Müdürü (Gerçekleştirme Görevlisi)',
        birim: 'Destek Hizmetleri Başkanlığı',
        sicil: '14820',
        tel: '0535 300 0003',
        ep: 'ayse.kaya@saglik.gov.tr'
      },
      {
        ad_soyad: 'Selin Gürbüz',
        unvan: 'Satınalma Memuru (Dosya Hazırlayan)',
        birim: 'Destek Hizmetleri Başkanlığı',
        sicil: '22340',
        tel: '0536 900 0009',
        ep: 'selin.gurbuz@saglik.gov.tr'
      },
      {
        ad_soyad: 'Zeynep Aktaş',
        unvan: 'V.H.K.İ. (Taşınır Kayıt ve Kontrol Yetkilisi)',
        birim: 'Destek Hizmetleri Başkanlığı',
        sicil: '21045',
        tel: '0505 700 0007',
        ep: 'zeynep.aktas@saglik.gov.tr'
      },
      {
        ad_soyad: 'Fatma Şahin Korkmaz',
        unvan: 'Mali Hizmetler Uzmanı (Piyasa Araştırma Üyesi)',
        birim: 'İdari ve Mali İşler Şube Müdürlüğü',
        sicil: '16734',
        tel: '0544 500 0005',
        ep: 'fatma.sahin@saglik.gov.tr'
      },
      {
        ad_soyad: 'Hakan Öztürk',
        unvan: 'Mali Hizmetler Memuru',
        birim: 'İdari ve Mali İşler Şube Müdürlüğü',
        sicil: '17890',
        tel: '0538 400 0011',
        ep: 'hakan.ozturk@saglik.gov.tr'
      },
      {
        ad_soyad: 'Mustafa Çelik',
        unvan: 'Bilgisayar Mühendisi (Piyasa Araştırma Başkanı)',
        birim: 'Bilgi İşlem ve İletişim Şube Müdürlüğü',
        sicil: '18902',
        tel: '0542 400 0004',
        ep: 'mustafa.celik@saglik.gov.tr'
      },
      {
        ad_soyad: 'Caner Yılmaz',
        unvan: 'Yazılım ve Ağ Uzmanı',
        birim: 'Bilgi İşlem ve İletişim Şube Müdürlüğü',
        sicil: '19034',
        tel: '0543 500 0012',
        ep: 'caner.yilmaz@saglik.gov.tr'
      },
      {
        ad_soyad: 'Emre Karaca',
        unvan: 'Biyomedikal Mühendisi (Muayene Kabul Başkanı)',
        birim: 'Tıbbi Cihaz ve Biyomedikal Hizmetler Birimi',
        sicil: '20194',
        tel: '0555 600 0006',
        ep: 'emre.karaca@saglik.gov.tr'
      },
      {
        ad_soyad: 'Gizem Arslan',
        unvan: 'Biyomedikal Teknikeri',
        birim: 'Tıbbi Cihaz ve Biyomedikal Hizmetler Birimi',
        sicil: '20850',
        tel: '0554 700 0013',
        ep: 'gizem.arslan@saglik.gov.tr'
      },
      {
        ad_soyad: 'Murat Can Yurt',
        unvan: 'İnşaat Mühendisi (Muayene Kabul Üyesi)',
        birim: 'İnşaat, Emlak ve Teknik Hizmetler Birimi',
        sicil: '19450',
        tel: '0530 800 0008',
        ep: 'murat.yurt@saglik.gov.tr'
      },
      {
        ad_soyad: 'Burak Erdem',
        unvan: 'Elektrik Teknikeri (İrtibat Görevlisi)',
        birim: 'İnşaat, Emlak ve Teknik Hizmetler Birimi',
        sicil: '23110',
        tel: '0541 110 0010',
        ep: 'burak.erdem@saglik.gov.tr'
      },
      {
        ad_soyad: 'Dr. Serdar Tekin',
        unvan: 'Acil Sağlık Şube Müdürü',
        birim: 'Acil Sağlık Hizmetleri ve Lojistik Şube Müdürlüğü',
        sicil: '15400',
        tel: '0533 900 0014',
        ep: 'serdar.tekin@saglik.gov.tr'
      },
      {
        ad_soyad: 'Onur Karataş',
        unvan: 'Lojistik ve Ambulans Filo Sorumlusu',
        birim: 'Acil Sağlık Hizmetleri ve Lojistik Şube Müdürlüğü',
        sicil: '24500',
        tel: '0545 100 0015',
        ep: 'onur.karatas@saglik.gov.tr'
      }
    ]

    const ids: number[] = []
    for (const p of personelList) {
      const existing = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT id FROM TANIM_Personel WHERE ad_soyad = ? LIMIT 1',
        [p.ad_soyad]
      )
      if (existing.success && existing.data && existing.data.length > 0) {
        await window.electron.ipcRenderer.invoke(
          'db:run',
          'UPDATE TANIM_Personel SET unvan = ?, birim = ?, sicil_no = ?, telefon = ?, eposta = ?, aktif_mi = 1 WHERE id = ?',
          [p.unvan, p.birim, p.sicil, p.tel, p.ep, existing.data[0].id]
        )
        ids.push(existing.data[0].id)
      } else {
        const res = await window.electron.ipcRenderer.invoke(
          'db:run',
          `INSERT INTO TANIM_Personel (ad_soyad, unvan, birim, sicil_no, telefon, eposta, aktif_mi) VALUES (?, ?, ?, ?, ?, ?, 1)`,
          [p.ad_soyad, p.unvan, p.birim, p.sicil, p.tel, p.ep]
        )
        if (res.success && res.lastInsertRowid) {
          ids.push(Number(res.lastInsertRowid))
        }
      }
    }

    // TANIM_Roller tablosundaki varsayılan personelleri güncelle
    if (ids.length >= 5) {
      const roleMap = [
        { rol_kodu: 'harcama_yetkilisi', pId: ids[1] || ids[0] },
        { rol_kodu: 'gerceklestirme_gorevlisi', pId: ids[2] },
        { rol_kodu: 'hazirlayan', pId: ids[3] || ids[2] },
        { rol_kodu: 'talep_eden', pId: ids[2] },
        { rol_kodu: 'sunan_personel', pId: ids[2] },
        { rol_kodu: 'ilgili_personel', pId: ids[12] || ids[7] }
      ]

      for (const rm of roleMap) {
        await window.electron.ipcRenderer.invoke(
          'db:run',
          'UPDATE TANIM_Roller SET varsayilan_personel_id = ? WHERE rol_kodu = ?',
          [rm.pId, rm.rol_kodu]
        )
      }
    }

    return ids
  },

  /**
   * Birimleri (Tüm alanları, antet ve harcama yetkilisi eşleşmeleriyle) ekler
   */
  async seedBirimler(personelIds: number[] = []): Promise<number[]> {
    const p1 = personelIds[1] || 1 // Mehmet Ali Özkan (Destek Hizmetleri Başkanı)
    const p2 = personelIds[2] || 2 // Ayşe Kaya Demir (Şube Müdürü)
    const p3 = personelIds[3] || 3 // Selin Gürbüz (Satınalma Memuru)
    const p5 = personelIds[5] || 5 // Fatma Şahin Korkmaz (Mali Hizmetler)
    const p7 = personelIds[7] || 7 // Mustafa Çelik (Bilgisayar Müh)
    const p9 = personelIds[9] || 9 // Emre Karaca (Biyomedikal Müh)
    const p11 = personelIds[11] || 11 // Murat Can Yurt (İnşaat Müh)
    const p13 = personelIds[13] || 13 // Dr. Serdar Tekin (Acil Sağlık Müdürü)
    const p14 = personelIds[14] || 14 // Onur Karataş (Lojistik)

    const birimList = [
      {
        ad: 'Destek Hizmetleri Başkanlığı',
        kisa_ad: 'DHB',
        birim_adi: 'Destek Hizmetleri Başkanlığı',
        antet_ek_satir: 'Destek Hizmetleri Başkanlığı (Satınalma Birimi)',
        ihtiyac_yeri_eki: 'Destek Hizmetleri Başkanlığı Ambarı',
        sunum_makami: 'Destek Hizmetleri Başkanlığına',
        harcama_kodu: '1001',
        harcama_adi: 'Destek Hizmetleri',
        muhasebe_kodu: '06001',
        muhasebe_adi: 'Ankara Defterdarlığı Muhasebe Müdürlüğü',
        detsis_kodu: '10234521',
        say2000i: '06.01.00.04',
        dtvt_kodu: 'DT-DHB',
        e_butce: '06.24.01.00',
        harcama_yetkilisi_id: p1,
        harcama_yetkilisi_unvan: 'Destek Hizmetleri Başkanı',
        gerceklestirme_gorevlisi_id: p2,
        gerceklestirme_gorevlisi_unvan: 'Şube Müdürü',
        ayrintili_bilgi_personel: 'Selin Gürbüz - Satınalma Memuru',
        ilgili_personel_id: p3
      },
      {
        ad: 'İdari ve Mali İşler Şube Müdürlüğü',
        kisa_ad: 'İMİŞM',
        birim_adi: 'İdari ve Mali İşler Şube Müdürlüğü',
        antet_ek_satir: 'İdari ve Mali İşler Şube Müdürlüğü',
        ihtiyac_yeri_eki: 'Merkez İdari İşler Ambarı',
        sunum_makami: 'İdari ve Mali İşler Şube Müdürlüğüne',
        harcama_kodu: '1002',
        harcama_adi: 'İdari ve Mali İşler',
        muhasebe_kodu: '06001',
        muhasebe_adi: 'Ankara Defterdarlığı Muhasebe Müdürlüğü',
        detsis_kodu: '10234522',
        say2000i: '06.01.00.04',
        dtvt_kodu: 'DT-IMIS',
        e_butce: '06.24.01.00',
        harcama_yetkilisi_id: p1,
        harcama_yetkilisi_unvan: 'Destek Hizmetleri Başkanı',
        gerceklestirme_gorevlisi_id: p2,
        gerceklestirme_gorevlisi_unvan: 'Şube Müdürü',
        ayrintili_bilgi_personel: 'Fatma Şahin Korkmaz - Mali Hizmetler Uzmanı',
        ilgili_personel_id: p5
      },
      {
        ad: 'Bilgi İşlem ve İletişim Şube Müdürlüğü',
        kisa_ad: 'BİŞM',
        birim_adi: 'Bilgi İşlem ve İletişim Şube Müdürlüğü',
        antet_ek_satir: 'Bilgi İşlem ve İletişim Şube Müdürlüğü',
        ihtiyac_yeri_eki: 'Bilgi İşlem Sistem Odası ve Sunucu Ambarı',
        sunum_makami: 'Bilgi İşlem Şube Müdürlüğüne',
        harcama_kodu: '1003',
        harcama_adi: 'Bilgi Teknolojileri',
        muhasebe_kodu: '06001',
        muhasebe_adi: 'Ankara Defterdarlığı Muhasebe Müdürlüğü',
        detsis_kodu: '10234523',
        say2000i: '06.01.00.04',
        dtvt_kodu: 'DT-BISM',
        e_butce: '06.24.01.00',
        harcama_yetkilisi_id: p1,
        harcama_yetkilisi_unvan: 'Destek Hizmetleri Başkanı',
        gerceklestirme_gorevlisi_id: p2,
        gerceklestirme_gorevlisi_unvan: 'Şube Müdürü',
        ayrintili_bilgi_personel: 'Mustafa Çelik - Bilgisayar Mühendisi',
        ilgili_personel_id: p7
      },
      {
        ad: 'Tıbbi Cihaz ve Biyomedikal Hizmetler Birimi',
        kisa_ad: 'TCB',
        birim_adi: 'Tıbbi Cihaz ve Biyomedikal Hizmetler Birimi',
        antet_ek_satir: 'Tıbbi Cihaz ve Biyomedikal Hizmetler Birimi',
        ihtiyac_yeri_eki: 'Biyomedikal ve Tıbbi Cihaz Deposu',
        sunum_makami: 'Tıbbi Cihaz ve Biyomedikal Hizmetler Birimine',
        harcama_kodu: '1004',
        harcama_adi: 'Tıbbi Hizmetler',
        muhasebe_kodu: '06001',
        muhasebe_adi: 'Ankara Defterdarlığı Muhasebe Müdürlüğü',
        detsis_kodu: '10234524',
        say2000i: '06.01.00.04',
        dtvt_kodu: 'DT-TCB',
        e_butce: '06.24.01.00',
        harcama_yetkilisi_id: p1,
        harcama_yetkilisi_unvan: 'Destek Hizmetleri Başkanı',
        gerceklestirme_gorevlisi_id: p2,
        gerceklestirme_gorevlisi_unvan: 'Şube Müdürü',
        ayrintili_bilgi_personel: 'Emre Karaca - Biyomedikal Mühendisi',
        ilgili_personel_id: p9
      },
      {
        ad: 'İnşaat, Emlak ve Teknik Hizmetler Birimi',
        kisa_ad: 'İETHB',
        birim_adi: 'İnşaat, Emlak ve Teknik Hizmetler Birimi',
        antet_ek_satir: 'İnşaat, Emlak ve Teknik Hizmetler Birimi',
        ihtiyac_yeri_eki: 'Teknik Atölye ve Onarım Şantiyesi',
        sunum_makami: 'Teknik Hizmetler Birimine',
        harcama_kodu: '1005',
        harcama_adi: 'Teknik Hizmetler',
        muhasebe_kodu: '06001',
        muhasebe_adi: 'Ankara Defterdarlığı Muhasebe Müdürlüğü',
        detsis_kodu: '10234525',
        say2000i: '06.01.00.04',
        dtvt_kodu: 'DT-IETH',
        e_butce: '06.24.01.00',
        harcama_yetkilisi_id: p1,
        harcama_yetkilisi_unvan: 'Destek Hizmetleri Başkanı',
        gerceklestirme_gorevlisi_id: p2,
        gerceklestirme_gorevlisi_unvan: 'Şube Müdürü',
        ayrintili_bilgi_personel: 'Murat Can Yurt - İnşaat Mühendisi',
        ilgili_personel_id: p11
      },
      {
        ad: 'Acil Sağlık Hizmetleri ve Lojistik Şube Müdürlüğü',
        kisa_ad: 'ASHM',
        birim_adi: 'Acil Sağlık Hizmetleri ve Lojistik Şube Müdürlüğü',
        antet_ek_satir: 'Acil Sağlık Hizmetleri ve Lojistik Şube Müdürlüğü',
        ihtiyac_yeri_eki: '112 Acil Komuta ve Lojistik Ambarı',
        sunum_makami: 'Acil Sağlık Hizmetleri Müdürlüğüne',
        harcama_kodu: '1006',
        harcama_adi: 'Acil ve Lojistik',
        muhasebe_kodu: '06001',
        muhasebe_adi: 'Ankara Defterdarlığı Muhasebe Müdürlüğü',
        detsis_kodu: '10234526',
        say2000i: '06.01.00.04',
        dtvt_kodu: 'DT-ASHM',
        e_butce: '06.24.01.00',
        harcama_yetkilisi_id: p1,
        harcama_yetkilisi_unvan: 'Destek Hizmetleri Başkanı',
        gerceklestirme_gorevlisi_id: p13,
        gerceklestirme_gorevlisi_unvan: 'Şube Müdürü',
        ayrintili_bilgi_personel: 'Onur Karataş - Lojistik Sorumlusu',
        ilgili_personel_id: p14
      }
    ]

    const ids: number[] = []
    for (const b of birimList) {
      const existing = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT id FROM TANIM_Birim WHERE birim_adi = ? OR ad = ? LIMIT 1',
        [b.birim_adi, b.ad]
      )
      if (existing.success && existing.data && existing.data.length > 0) {
        await window.electron.ipcRenderer.invoke(
          'db:run',
          `UPDATE TANIM_Birim SET 
            ad = ?, 
            kisa_ad = ?, 
            birim_adi = ?, 
            antet_ek_satir = ?, 
            ihtiyac_yeri_eki = ?, 
            sunum_makami = ?, 
            say2000i = ?, 
            dtvt_kodu = ?, 
            detsis_kodu = ?, 
            muhasebe_kodu = ?, 
            muhasebe_adi = ?, 
            e_butce = ?, 
            harcama_kodu = ?, 
            harcama_adi = ?, 
            ayrintili_bilgi_personel = ?, 
            harcama_yetkilisi_id = ?, 
            harcama_yetkilisi_unvan = ?, 
            gerceklestirme_gorevlisi_id = ?, 
            gerceklestirme_gorevlisi_unvan = ?, 
            ilgili_personel_id = ?, 
            aktif_mi = 1 
          WHERE id = ?`,
          [
            b.ad,
            b.kisa_ad,
            b.birim_adi,
            b.antet_ek_satir,
            b.ihtiyac_yeri_eki,
            b.sunum_makami,
            b.say2000i,
            b.dtvt_kodu,
            b.detsis_kodu,
            b.muhasebe_kodu,
            b.muhasebe_adi,
            b.e_butce,
            b.harcama_kodu,
            b.harcama_adi,
            b.ayrintili_bilgi_personel,
            b.harcama_yetkilisi_id,
            b.harcama_yetkilisi_unvan,
            b.gerceklestirme_gorevlisi_id,
            b.gerceklestirme_gorevlisi_unvan,
            b.ilgili_personel_id,
            existing.data[0].id
          ]
        )
        ids.push(existing.data[0].id)
      } else {
        const res = await window.electron.ipcRenderer.invoke(
          'db:run',
          `INSERT INTO TANIM_Birim (
            ad, kisa_ad, birim_adi, antet_ek_satir, ihtiyac_yeri_eki, sunum_makami, say2000i, dtvt_kodu, detsis_kodu,
            muhasebe_kodu, muhasebe_adi, e_butce, harcama_kodu, harcama_adi, ayrintili_bilgi_personel,
            harcama_yetkilisi_id, harcama_yetkilisi_unvan, gerceklestirme_gorevlisi_id, gerceklestirme_gorevlisi_unvan,
            ilgili_personel_id, aktif_mi
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
          [
            b.ad,
            b.kisa_ad,
            b.birim_adi,
            b.antet_ek_satir,
            b.ihtiyac_yeri_eki,
            b.sunum_makami,
            b.say2000i,
            b.dtvt_kodu,
            b.detsis_kodu,
            b.muhasebe_kodu,
            b.muhasebe_adi,
            b.e_butce,
            b.harcama_kodu,
            b.harcama_adi,
            b.ayrintili_bilgi_personel,
            b.harcama_yetkilisi_id,
            b.harcama_yetkilisi_unvan,
            b.gerceklestirme_gorevlisi_id,
            b.gerceklestirme_gorevlisi_unvan,
            b.ilgili_personel_id
          ]
        )
        if (res.success && res.lastInsertRowid) {
          ids.push(Number(res.lastInsertRowid))
        }
      }
    }
    return ids
  },

  /**
   * Tedarikçi / İstekli Firmaları eksiksiz ekler
   */
  async seedFirmalar(): Promise<number[]> {
    const firmaList = [
      {
        unvan: 'Anadolu Bilişim ve Teknoloji Sistemleri San. ve Tic. Ltd. Şti.',
        kod: 'FRM-001',
        ilgili: 'Kaan Yıldırım',
        vno: '0680459201',
        vd: 'Çankaya V.D.',
        tel: '0312 444 10 20',
        ep: 'satis@anadolubilisim.com.tr',
        adr: 'Kızılay Mah. Gazi Mustafa Kemal Bulv. No:84/A Çankaya / Ankara',
        hesap_no: 'TR42 0006 4000 0011 2233 4455 66',
        banka: 'Türkiye İş Bankası',
        sube: 'Kızılay Şubesi'
      },
      {
        unvan: 'Boğaziçi Kırtasiye Ofis ve Büro Malzemeleri Pazarlama A.Ş.',
        kod: 'FRM-002',
        ilgili: 'Burak Demirtaş',
        vno: '1840294819',
        vd: 'Ulus V.D.',
        tel: '0312 310 40 50',
        ep: 'kurumsal@bogazicikirtasiye.com.tr',
        adr: 'Rüzgarlı Cad. İpek Sok. No:12 Altındağ / Ankara',
        hesap_no: 'TR15 0001 5001 5800 7300 1234 56',
        banka: 'VakıfBank',
        sube: 'Ulus Şubesi'
      },
      {
        unvan: 'Marmara Medikal Sağlık ve Laboratuvar Ürünleri Ltd. Şti.',
        kod: 'FRM-003',
        ilgili: 'Dr. Selin Aydın',
        vno: '5920194820',
        vd: 'Yenimahalle V.D.',
        tel: '0312 395 70 80',
        ep: 'ihale@marmaramedikal.com.tr',
        adr: 'Ostim OSB 1200. Cadde No:45 Yenimahalle / Ankara',
        hesap_no: 'TR88 0001 0002 3456 7890 1234 56',
        banka: 'Ziraat Bankası',
        sube: 'Ostim Şubesi'
      },
      {
        unvan: 'Başkent İnşaat, Tadilat ve Mühendislik Hizmetleri Tic. Ltd. Şti.',
        kod: 'FRM-004',
        ilgili: 'Engin Vural',
        vno: '1402948102',
        vd: 'Hitit V.D.',
        tel: '0312 284 30 00',
        ep: 'proje@baskentinsaat.com.tr',
        adr: 'Mustafa Kemal Mah. 2118. Cad. No:14 Çankaya / Ankara',
        hesap_no: 'TR62 0006 2000 0001 2987 6543 21',
        banka: 'Garanti BBVA',
        sube: 'Çukurambar Şubesi'
      },
      {
        unvan: 'Ege Teknik Endüstriyel Hırdavat ve Temizlik Malzemeleri A.Ş.',
        kod: 'FRM-005',
        ilgili: 'Murat Çetin',
        vno: '3290481029',
        vd: 'Sincan V.D.',
        tel: '0312 270 90 90',
        ep: 'info@egeteknik.com.tr',
        adr: 'İvedik OSB Ağaç İşleri Sanayi Sitesi 1354. Cadde No:8 Yenimahalle / Ankara',
        hesap_no: 'TR33 0006 7010 0000 0098 7654 32',
        banka: 'Yapı Kredi',
        sube: 'İvedik Şubesi'
      },
      {
        unvan: 'Güneş İklimlendirme Soğutma Havalandırma San. ve Tic. Ltd. Şti.',
        kod: 'FRM-006',
        ilgili: 'Ahmet Güneş',
        vno: '4301928374',
        vd: 'Dışkapı V.D.',
        tel: '0312 341 55 66',
        ep: 'servis@gunesiklimlendirme.com.tr',
        adr: 'Kazım Karabekir Cad. No:110 Altındağ / Ankara',
        hesap_no: 'TR54 0001 2009 8760 0012 3456 78',
        banka: 'Halkbank',
        sube: 'Dışkapı Şubesi'
      },
      {
        unvan: 'Atlas Kurumsal Tedarik ve Dağıtım Hizmetleri A.Ş.',
        kod: 'FRM-007',
        ilgili: 'Deniz Koçak',
        vno: '0981726354',
        vd: 'Seğmenler V.D.',
        tel: '0312 472 80 80',
        ep: 'satis@atlaskurumsal.com.tr',
        adr: 'Turan Güneş Bulv. No:52/B Çankaya / Ankara',
        hesap_no: 'TR77 0006 4000 0022 3344 5566 77',
        banka: 'Türkiye İş Bankası',
        sube: 'Yıldız Şubesi'
      },
      {
        unvan: 'Dinamik Laboratuvar ve Tıbbi Sarf Ticaret Ltd. Şti.',
        kod: 'FRM-008',
        ilgili: 'Ece Karahan',
        vno: '3049182736',
        vd: 'Maltepe V.D.',
        tel: '0312 231 99 00',
        ep: 'teklif@dinamikmedikal.com.tr',
        adr: 'Strazburg Cad. No:28/4 Sıhhiye / Çankaya / Ankara',
        hesap_no: 'TR91 0001 5001 5800 7300 9988 77',
        banka: 'VakıfBank',
        sube: 'Sıhhiye Şubesi'
      }
    ]

    const ids: number[] = []
    for (const f of firmaList) {
      const existing = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT id FROM TANIM_Firma WHERE unvan = ? OR vergi_no = ? LIMIT 1',
        [f.unvan, f.vno]
      )
      if (existing.success && existing.data && existing.data.length > 0) {
        await window.electron.ipcRenderer.invoke(
          'db:run',
          `UPDATE TANIM_Firma SET 
            unvan = ?, firma_kodu = ?, ilgili_adi = ?, vergi_no = ?, vergi_dairesi = ?, 
            telefon = ?, email = ?, adres = ?, il = ?, ilce = ?, hesap_no = ?, banka_adi = ?, 
            sube_kodu_adi = ?, aktif_mi = 1, kalite_skoru = 5, deneyim_skoru = 5 
          WHERE id = ?`,
          [f.unvan, f.kod, f.ilgili, f.vno, f.vd, f.tel, f.ep, f.adr, 'Ankara', 'Çankaya', f.hesap_no, f.banka, f.sube, existing.data[0].id]
        )
        ids.push(existing.data[0].id)
      } else {
        const res = await window.electron.ipcRenderer.invoke(
          'db:run',
          `INSERT INTO TANIM_Firma (
            unvan, firma_kodu, ilgili_adi, vergi_no, vergi_dairesi, telefon, email, adres, il, ilce, hesap_no, banka_adi, sube_kodu_adi, aktif_mi, kalite_skoru, deneyim_skoru
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 5, 5)`,
          [f.unvan, f.kod, f.ilgili, f.vno, f.vd, f.tel, f.ep, f.adr, 'Ankara', 'Çankaya', f.hesap_no, f.banka, f.sube]
        )
        if (res.success && res.lastInsertRowid) {
          ids.push(Number(res.lastInsertRowid))
        }
      }
    }
    return ids
  },

  /**
   * Malzeme, Hizmet ve Yapım Kalemleri Havuzunu Doldurur
   */
  async seedKalemler(): Promise<number[]> {
    const kalemList = [
      {
        barkod: '8690001001',
        ad: 'A4 80 gr/m² Beyaz Fotokopi Kağıdı (500 Yaprak / Paket)',
        tip: 'Mal',
        birim: 'Paket',
        kdv: 20,
        tkod: '150.01.01.01',
        okas: '30197630-1',
        ozelligi: '1. hamur yüksek beyazlık derecesine sahip fotokopi kağıdı'
      },
      {
        barkod: '8690001002',
        ad: 'Siyah Lazer Toner Kartuşu (Yüksek Kapasiteli 10.000 Sayfa)',
        tip: 'Mal',
        birim: 'Adet',
        kdv: 20,
        tkod: '150.01.02.04',
        okas: '30125100-2',
        ozelligi: 'Orijinal veya ISO standartlarına uygun muadil toner kartuşu'
      },
      {
        barkod: '8690001003',
        ad: 'Masaüstü İş İstasyonu Bilgisayar Seti (Intel i7 14700, 32GB RAM, 1TB NVMe SSD)',
        tip: 'Mal',
        birim: 'Set',
        kdv: 20,
        tkod: '255.02.01.01',
        okas: '30213000-5',
        ozelligi: 'Kurumsal kullanım için yüksek performanslı masaüstü bilgisayar kasası ve aksesuarları'
      },
      {
        barkod: '8690001004',
        ad: '27 inç IPS QHD (2560x1440) Profesyonel Çerçevesiz Monitör',
        tip: 'Mal',
        birim: 'Adet',
        kdv: 20,
        tkod: '255.02.01.02',
        okas: '30231300-0',
        ozelligi: 'Pivot özellikli, HDMI ve DisplayPort girişli IPS panel monitör'
      },
      {
        barkod: '8690001005',
        ad: 'Ergonomik Fileli Personel Çalışma Koltuğu',
        tip: 'Mal',
        birim: 'Adet',
        kdv: 20,
        tkod: '255.03.01.01',
        okas: '39112000-0',
        ozelligi: 'Ayarlanabilir bel destekli, nefes alabilir file sırtlı ofis çalışma koltuğu'
      },
      {
        barkod: '8690001006',
        ad: 'İklimlendirme & Split Klimalar Periyodik Bakım, Filtre Temizliği ve Gaz Dolumu',
        tip: 'Hizmet',
        birim: 'Adet',
        kdv: 20,
        tkod: '150.08.01.01',
        okas: '50730000-1',
        ozelligi: 'Bina içi klimaların antibakteriyel temizliği ve mevsimlik periyodik bakımı'
      },
      {
        barkod: '8690001007',
        ad: 'Kurumsal Sunucu ve Ağ Güvenlik Duvarı Yıllık Yazılım Lisansı ve Destek Hizmeti',
        tip: 'Hizmet',
        birim: 'Yıl',
        kdv: 20,
        tkod: '260.01.01.01',
        okas: '48218000-9',
        ozelligi: '7/24 teknik destek ve güncel güvenlik tehdit veri tabanı aboneliği'
      },
      {
        barkod: '8690001008',
        ad: 'İdari Hizmet Binası Katları İç Cephe Alçı Sıva ve Silikonlu Mat Boya Yapım İşi',
        tip: 'Yapım',
        birim: 'm²',
        kdv: 20,
        tkod: '252.01.01.01',
        okas: '45442110-1',
        ozelligi: 'Duvar ve tavan yüzey tamiratları, astar ve çift kat silikonlu iç cephe boyası uygulaması'
      },
      {
        barkod: '8690001009',
        ad: 'Endüstriyel Sıvı El Sabunu ve Yüzey Dezenfektanı Temizlik Seti',
        tip: 'Mal',
        birim: 'Koli',
        kdv: 20,
        tkod: '150.05.01.01',
        okas: '39831200-8',
        ozelligi: '5 litrelik antibakteriyel sıvı sabun ve genel yüzey temizlik solüsyonu'
      },
      {
        barkod: '8690001010',
        ad: 'Acil Yardım Ambulansları Medikal Oksijen Tüpü Dolumu ve Periyodik Testi',
        tip: 'Hizmet',
        birim: 'Adet',
        kdv: 20,
        tkod: '150.08.03.01',
        okas: '24111900-4',
        ozelligi: 'Tıbbi medikal oksijen dolumu, hidrostatik basınç testi ve vana kontrolleri'
      },
      {
        barkod: '8690001011',
        ad: 'Tıbbi Cihaz ve Biyomedikal Ekipmanlar Yıllık Metroloji Kalibrasyon Hizmeti',
        tip: 'Hizmet',
        birim: 'Adet',
        kdv: 20,
        tkod: '150.08.04.01',
        okas: '50421000-2',
        ozelligi: 'TÜRKAK akreditasyonlu kuruluş tarafından sertifikalı kalibrasyon ölçüm hizmeti'
      },
      {
        barkod: '8690001012',
        ad: 'Akustik Taşyünü Asma Tavan ve T-24 Taşıyıcı Karkas İmalatı Yapım İşi',
        tip: 'Yapım',
        birim: 'm²',
        kdv: 20,
        tkod: '252.01.03.01',
        okas: '45421146-9',
        ozelligi: '60x60 cm akustik taşyünü paneller ve galvaniz taşıyıcı profil montajı'
      }
    ]

    const ids: number[] = []
    for (const k of kalemList) {
      const existing = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT id FROM TANIM_Kalem WHERE barkod_id = ? OR kalem_adi = ? LIMIT 1',
        [k.barkod, k.ad]
      )
      if (existing.success && existing.data && existing.data.length > 0) {
        await window.electron.ipcRenderer.invoke(
          'db:run',
          `UPDATE TANIM_Kalem SET 
            kalem_adi = ?, tipi = ?, birim = ?, kdv_orani = ?, tasinir_kodu = ?, okas_kodu = ?, ozelligi = ?, aktif_mi = 1 
          WHERE id = ?`,
          [k.ad, k.tip, k.birim, k.kdv, k.tkod, k.okas, k.ozelligi, existing.data[0].id]
        )
        ids.push(existing.data[0].id)
      } else {
        const res = await window.electron.ipcRenderer.invoke(
          'db:run',
          `INSERT INTO TANIM_Kalem (
            barkod_id, kalem_adi, tipi, birim, kdv_orani, tasinir_kodu, okas_kodu, ozelligi, aktif_mi
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
          [k.barkod, k.ad, k.tip, k.birim, k.kdv, k.tkod, k.okas, k.ozelligi]
        )
        if (res.success && res.lastInsertRowid) {
          ids.push(Number(res.lastInsertRowid))
        }
      }
    }
    return ids
  },

  /**
   * Komisyon ve Ambar tanımlarını ekler
   */
  async seedKomisyonlarVeAmbarlar(): Promise<void> {
    // 1. Ambarlar
    const ambarlar = [
      {
        ad: 'Merkez Ana Malzeme ve Tüketim Ambarı',
        aciklama: 'Hizmet Binası B1 Katı - Genel Sarf Deposu',
        tasinir_kodu: 'AMB-01'
      },
      {
        ad: 'Bilgi İşlem ve Teknik Donanım Ambarı',
        aciklama: 'Hizmet Binası 3. Kat - Bilişim ve Ağ Ekipmanları Ambarı',
        tasinir_kodu: 'AMB-02'
      },
      {
        ad: 'Biyomedikal ve Tıbbi Cihaz Ambarı',
        aciklama: 'Hizmet Binası Zemin Kat - Tıbbi Cihaz ve Kalibrasyon Deposu',
        tasinir_kodu: 'AMB-03'
      },
      {
        ad: 'Teknik Atölye ve Hırdavat Ambarı',
        aciklama: 'Hizmet Binası Bahçe Katı - Bakım Onarım Malzemeleri',
        tasinir_kodu: 'AMB-04'
      }
    ]

    for (const amb of ambarlar) {
      const ex = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT id FROM TANIM_Ambar WHERE ambar_adi = ? LIMIT 1',
        [amb.ad]
      )
      if (!ex.success || !ex.data || ex.data.length === 0) {
        await window.electron.ipcRenderer.invoke(
          'db:run',
          `INSERT INTO TANIM_Ambar (ambar_adi, aciklama, tasinir_kodu, aktif_mi) VALUES (?, ?, ?, 1)`,
          [amb.ad, amb.aciklama, amb.tasinir_kodu]
        )
      }
    }

    // 2. Komisyonlar
    const komisyonlar = [
      { id: 1, ad: 'Piyasa Fiyat Araştırması Komisyonu', aciklama: 'Piyasa Fiyat Araştırma ve Teklif Değerlendirme Komisyonu' },
      { id: 2, ad: 'Muayene ve Kabul Komisyonu', aciklama: 'Taşınır Mal Muayene, Kabul ve Muayene Raporu Komisyonu' },
    ]

    for (const k of komisyonlar) {
      await window.electron.ipcRenderer.invoke(
        'db:run',
        `INSERT INTO TANIM_Komisyon (id, ad, aciklama, aktif_mi) VALUES (?, ?, ?, 1) ON CONFLICT(id) DO UPDATE SET ad = excluded.ad, aciklama = excluded.aciklama`,
        [k.id, k.ad, k.aciklama]
      )
    }
  },

  /**
   * 5 Ayrı Alım Türü ve Birim için Doğrudan Temin Dosyalarını tüm kalem, teklif, firma ve komisyonlarıyla eksiksiz doldurur.
   */
  async enrichExistingDosyalar(
    firmaIds: number[] = [],
    personelIds: number[] = [],
    birimIds: number[] = []
  ): Promise<number> {
    const runSql = async (sql: string, params: unknown[] = []): Promise<void> => {
      try {
        await window.electron.ipcRenderer.invoke('db:run', sql, params)
      } catch (e) {
        console.warn('[devSeedService] SQL execution warning:', sql, e)
      }
    }

    // Gerekli tanımlar eksikse otomatik getir veya tohumla
    if (!firmaIds || firmaIds.length === 0) {
      const fRes = await window.electron.ipcRenderer.invoke('db:query', 'SELECT id FROM TANIM_Firma ORDER BY id')
      if (fRes.success && fRes.data && fRes.data.length > 0) {
        firmaIds = fRes.data.map((r: { id: number }) => r.id)
      } else {
        firmaIds = await this.seedFirmalar()
      }
    }

    if (!personelIds || personelIds.length === 0) {
      const pRes = await window.electron.ipcRenderer.invoke('db:query', 'SELECT id FROM TANIM_Personel ORDER BY id')
      if (pRes.success && pRes.data && pRes.data.length > 0) {
        personelIds = pRes.data.map((r: { id: number }) => r.id)
      } else {
        personelIds = await this.seedPersonel()
      }
    }

    if (!birimIds || birimIds.length === 0) {
      const bRes = await window.electron.ipcRenderer.invoke('db:query', 'SELECT id FROM TANIM_Birim ORDER BY id')
      if (bRes.success && bRes.data && bRes.data.length > 0) {
        birimIds = bRes.data.map((r: { id: number }) => r.id)
      } else {
        birimIds = await this.seedBirimler(personelIds)
      }
    }

    // 1. Önceki tüm dosya ve alt ilişkili süreç/hareket verilerini tamamen temizle
    await runSql('DELETE FROM DATA_TeminKalemTeklif')
    await runSql('DELETE FROM DATA_TeminKalem')
    await runSql('DELETE FROM DATA_TeminFirma')
    await runSql('DELETE FROM DATA_TeminKomisyon')
    await runSql('DELETE FROM DATA_TeminEkSurec')
    await runSql('DELETE FROM DATA_HakedisKalem')
    await runSql('DELETE FROM DATA_HakedisKesinti')
    await runSql('DELETE FROM DATA_Hakedis')
    await runSql('DELETE FROM DATA_TeminDosyasi')
    await runSql(
      "DELETE FROM sqlite_sequence WHERE name IN ('DATA_TeminDosyasi', 'DATA_TeminKalem', 'DATA_TeminFirma', 'DATA_TeminKalemTeklif', 'DATA_TeminKomisyon', 'DATA_Hakedis')"
    )

    const currentYear = new Date().getFullYear()
    const dy = currentYear

    const predefinedDosyalar = [
      {
        temin_no: `DT-${dy}/01`,
        konu: `${dy} Yılı 1. Çeyrek Kırtasiye, Kağıt ve Büro Tüketim Malzemeleri Alımı`,
        isin_aciklamasi: 'Birimlerimizin acil kırtasiye ihtiyacının 4734 sayılı KİK 22/d doğrudan temin usulü ile karşılanması işi.',
        tur: 'mal',
        birim_id: birimIds[0] || 1,
        ihtiyac_yeri: 'Destek Hizmetleri Başkanlığı / Merkez Bina Ana Ambarı',
        butce_kodu: '03.2.1.01 Kırtasiye ve Büro Malzemesi Alımları',
        butce_yili: dy,
        butce_tipi: 'Genel Bütçe',
        ihale_sekli: '4734 Sayılı KİK Md. 22/d (Doğrudan Temin)',
        ihale_tipi: 'Doğrudan Temin'
      },
      {
        temin_no: `DT-${dy}/02`,
        konu: 'Hizmet Binası İklimlendirme ve Klimalar Periyodik Bakım Hizmet Alımı',
        isin_aciklamasi: 'Hizmet binasındaki tüm iklimlendirme sistemlerinin mevsimlik periyodik bakımı hizmet alımı.',
        tur: 'hizmet',
        birim_id: birimIds[1] || birimIds[0] || 1,
        ihtiyac_yeri: 'İdari ve Mali İşler Şube Müdürlüğü / Hizmet Binası Katları',
        butce_kodu: '03.5.2.02 Makine Teçhizat Bakım ve Onarım Giderleri',
        butce_yili: dy,
        butce_tipi: 'Genel Bütçe',
        ihale_sekli: '4734 Sayılı KİK Md. 22/d (Doğrudan Temin)',
        ihale_tipi: 'Doğrudan Temin'
      },
      {
        temin_no: `DT-${dy}/03`,
        konu: 'Hizmet Binası Zemin Kat Islak Hacim Tadilatı Yapım İşi',
        isin_aciklamasi: 'Zemin kat ortak kullanım alanları ve ıslak hacimlerin komple seramik kaplama ve tadilat yapım işi.',
        tur: 'yapim_isi',
        birim_id: birimIds[2] || birimIds[0] || 1,
        ihtiyac_yeri: 'İnşaat ve Teknik Hizmetler Birimi / Hizmet Binası Zemin Kat',
        butce_kodu: '03.8.2.01 Hizmet Binası Küçük Onarım Giderleri',
        butce_yili: dy,
        butce_tipi: 'Genel Bütçe',
        ihale_sekli: '4734 Sayılı KİK Md. 22/d (Doğrudan Temin)',
        ihale_tipi: 'Doğrudan Temin'
      }
    ]

    const samplePackages = [
      [
        { ad: 'A4 80 gr/m² Fotokopi Kağıdı', ozelligi: '1. hamur beyazlık', tip: 'Mal', birim: 'Paket', miktar: 100, kdv: 20, tkod: '150.01.01.01', f1: 185, f2: 195, f3: 175 },
        { ad: 'Siyah Lazer Toner', ozelligi: 'Yüksek kapasiteli', tip: 'Mal', birim: 'Adet', miktar: 12, kdv: 20, tkod: '150.01.02.04', f1: 1250, f2: 1320, f3: 1190 }
      ],
      [
        { ad: 'Klimalar Periyodik Bakım', ozelligi: 'Antibakteriyel', tip: 'Hizmet', birim: 'Adet', miktar: 24, kdv: 20, tkod: '150.08.01.01', f1: 850, f2: 920, f3: 800 },
        { ad: 'R410A / R32 Soğutucu Gaz Dolumu', ozelligi: 'Orijinal gaz', tip: 'Hizmet', birim: 'Kg', miktar: 15, kdv: 20, tkod: '150.08.01.03', f1: 650, f2: 700, f3: 600 }
      ],
      [
        { ad: '60x60 Taşyünü Asma Tavan', ozelligi: 'Akustik', tip: 'Yapım İşi', birim: 'm²', miktar: 180, kdv: 20, tkod: '150.07.01.01', f1: 420, f2: 450, f3: 390 },
        { ad: 'İç Cephe Silikonlu Boya', ozelligi: 'Çift kat astar', tip: 'Yapım İşi', birim: 'm²', miktar: 350, kdv: 20, tkod: '150.07.02.01', f1: 180, f2: 200, f3: 165 },
        { ad: 'Kaymaz Zemin Seramiği', ozelligi: 'Porselen', tip: 'Yapım İşi', birim: 'm²', miktar: 75, kdv: 20, tkod: '150.07.03.01', f1: 650, f2: 720, f3: 610 }
      ]
    ]

    let enrichedCount = 0

    // 3 Dosyayı sıfırdan oluştur: mal, hizmet, yapim_isi
    for (let i = 0; i < predefinedDosyalar.length; i++) {
      const predef = predefinedDosyalar[i]
      const pkg = samplePackages[i]

      // Dosya Ekle
      const insRes = await window.electron.ipcRenderer.invoke(
        'db:run',
        `INSERT INTO DATA_TeminDosyasi (
          temin_no, konu, isin_aciklamasi, tur, birim_id, ihtiyac_yeri, butce_kodu, butce_yili, butce_tipi, 
          ihale_sekli, ihale_tipi, durum_asama_id, status, is_deleted, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 2, 'devam_ediyor', 0, datetime('now'), datetime('now'))`,
        [
          predef.temin_no,
          predef.konu,
          predef.isin_aciklamasi,
          predef.tur,
          predef.birim_id,
          predef.ihtiyac_yeri,
          predef.butce_kodu,
          predef.butce_yili,
          predef.butce_tipi,
          predef.ihale_sekli,
          predef.ihale_tipi
        ]
      )
      const dosyaId = Number(insRes.lastInsertRowid)

      // Kalemleri ekle
      const dosyaKalemIds: number[] = []
      for (const item of pkg) {
        const kRes = await window.electron.ipcRenderer.invoke(
          'db:run',
          `INSERT INTO DATA_TeminKalem (
            temin_dosya_id, kalem_adi, tipi, birim, miktar, kdv_orani, tasinir_kodu, aciklama
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [dosyaId, item.ad, item.tip, item.birim, item.miktar, item.kdv, item.tkod, item.ozelligi || item.ad]
        )
        if (kRes.success && kRes.lastInsertRowid) {
          dosyaKalemIds.push(Number(kRes.lastInsertRowid))
        }
      }

      // İstekli Firmaları Bağla (3 firma seçilir)
      const selectedFirmaIds = [
        firmaIds[i % firmaIds.length],
        firmaIds[(i + 1) % firmaIds.length],
        firmaIds[(i + 2) % firmaIds.length]
      ].filter(Boolean)

      const firmalarData = await window.electron.ipcRenderer.invoke(
        'db:query',
        `SELECT id, unvan, vergi_no, telefon, email, ilgili_adi FROM TANIM_Firma WHERE id IN (${selectedFirmaIds.join(',')})`
      )

      const fDataList = firmalarData.data || []
      const teminFirmaIds: { id: number; firma_id: number; teklifTotal: number }[] = []

      for (let fi = 0; fi < fDataList.length; fi++) {
        const f = fDataList[fi]
        const isWinner = fi === 2 // 3. firma en avantajlı teklifi verecek
        const fRes = await window.electron.ipcRenderer.invoke(
          'db:run',
          `INSERT INTO DATA_TeminFirma (
            temin_dosya_id, firma_id, unvan, vergi_no, ilgili_kisi, telefon, email, davet_edildi_mi, teklif_verdi_mi, kazandi_mi, teklif_durumu, para_birimi
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1, ?, 'Teklif Alındı', 'TRY')`,
          [dosyaId, f.id, f.unvan, f.vergi_no, f.ilgili_adi, f.telefon, f.email, isWinner ? 1 : 0]
        )

        if (fRes.success && fRes.lastInsertRowid) {
          teminFirmaIds.push({
            id: Number(fRes.lastInsertRowid),
            firma_id: f.id,
            teklifTotal: 0
          })
        }
      }

      // Teklifleri Hesapla ve Doldur
      let approxCostTotal = 0
      let winningTotal = 0

      for (let ki = 0; ki < dosyaKalemIds.length; ki++) {
        const dKalemId = dosyaKalemIds[ki]
        const sampleItem = pkg[ki]
        const miktar = sampleItem.miktar
        const prices = [sampleItem.f1, sampleItem.f2, sampleItem.f3]

        approxCostTotal += ((prices[0] + prices[1] + prices[2]) / 3) * miktar
        winningTotal += prices[2] * miktar

        for (let fi = 0; fi < teminFirmaIds.length; fi++) {
          const tf = teminFirmaIds[fi]
          const unitPrice = prices[fi % prices.length]
          tf.teklifTotal += unitPrice * miktar

          await window.electron.ipcRenderer.invoke(
            'db:run',
            `INSERT INTO DATA_TeminKalemTeklif (
              temin_dosya_id, temin_kalem_id, temin_firma_id, birim_fiyat, kdv_tutari, teklif_verildi_mi
            ) VALUES (?, ?, ?, ?, ?, 1)`,
            [dosyaId, dKalemId, tf.id, unitPrice, unitPrice * 0.2]
          )
        }
      }

      // Firmaların toplam tekliflerini güncelle
      for (const tf of teminFirmaIds) {
        if (tf.teklifTotal > 0) {
          await window.electron.ipcRenderer.invoke(
            'db:run',
            'UPDATE DATA_TeminFirma SET teklif_toplami = ? WHERE id = ?',
            [tf.teklifTotal, tf.id]
          )
        }
      }

      // Komisyon Üyelerini Ata
      const p1 = personelIds[2] || 1
      const p2 = personelIds[3] || 2
      const p3 = personelIds[4] || 3

      const komisyonMembers = [
        { kom_id: 1, p_id: p1, ad: 'Ayşe Kaya Demir', unvan: 'Şube Müdürü', gorev: 'Komisyon Başkanı', rol: 'Asil' },
        { kom_id: 1, p_id: p2, ad: 'Mustafa Çelik', unvan: 'Mühendis', gorev: 'Üye', rol: 'Asil' },
        { kom_id: 1, p_id: p3, ad: 'Fatma Şahin Korkmaz', unvan: 'Uzman', gorev: 'Üye', rol: 'Asil' },
        { kom_id: 2, p_id: personelIds[5] || 4, ad: 'Emre Karaca', unvan: 'Biyomedikal Mühendisi', gorev: 'Muayene Kabul Başkanı', rol: 'Asil' },
        { kom_id: 2, p_id: personelIds[6] || 5, ad: 'Zeynep Aktaş', unvan: 'Taşınır Kayıt Yetkilisi', gorev: 'Üye', rol: 'Asil' }
      ]

      for (const km of komisyonMembers) {
        await window.electron.ipcRenderer.invoke(
          'db:run',
          `INSERT INTO DATA_TeminKomisyon (
            temin_dosya_id, komisyon_id, personel_id, ad_soyad, unvan, gorev, rol
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [dosyaId, km.kom_id, km.p_id, km.ad, km.unvan, km.gorev, km.rol]
        )
      }

      // Dosya Maliyet, Yüklenici ve Personel Bilgilerini Güncelle
      const winningFirmaId = teminFirmaIds.length > 2 ? teminFirmaIds[2].firma_id : (firmaIds[0] || 1)
      const harcamaYetkilisiId = personelIds[1] || personelIds[0] || 1
      const gerceklestirmeId = personelIds[2] || 2
      const irtibatId = personelIds[9] || personelIds[3] || 1
      const hazirlayanId = personelIds[8] || personelIds[2] || 1

      await window.electron.ipcRenderer.invoke(
        'db:run',
        `UPDATE DATA_TeminDosyasi SET 
          yaklasik_maliyet = ?,
          net_odenen = ?,
          firma_id = ?,
          onay_personel_id = ?,
          hazirlayan_personel_id = ?,
          talep_eden_personel_id = ?,
          sunan_personel_id = ?,
          irtibat_yetkilisi_id = ?,
          teslim_tarihi = date('now', '+15 days'),
          son_teklif_verme_tarihi = date('now', '+3 days')
        WHERE id = ?`,
        [
          approxCostTotal > 0 ? approxCostTotal : 50000,
          winningTotal > 0 ? winningTotal : 45000,
          winningFirmaId,
          harcamaYetkilisiId,
          hazirlayanId,
          gerceklestirmeId,
          gerceklestirmeId,
          irtibatId,
          dosyaId
        ]
      )

      enrichedCount++
    }

    return enrichedCount
  }
}

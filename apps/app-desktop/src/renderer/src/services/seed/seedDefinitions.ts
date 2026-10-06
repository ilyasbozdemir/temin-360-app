/**
 * Kurum bilgilerini (TANIM_Kurum) eksiksiz günceller veya yeni kayıt olarak ekler.
 */
export async function seedKurum(): Promise<void> {
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
        kurumData.kep_adresi
      ]
    )
  }
}

/**
 * Genel Ayarlar (settings tablosu) parametrelerini gerçekçi verilerle doldurur.
 */
export async function seedSettings(): Promise<void> {
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
}

/**
 * KİK Doğrudan Temin parasal limit dönemlerini (TANIM_KikLimitDonemleri) doldurur.
 */
export async function seedKikLimitleri(): Promise<void> {
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
      [
        p.donem_kodu,
        p.baslangic_tarihi,
        p.bitis_tarihi,
        p.buyuksehir_limit,
        p.diger_limit,
        p.guncelleme_orani,
        p.kaynak
      ]
    )
  }
}

/**
 * Personel havuzunu (TANIM_Personel) eksiksiz ekler ve rollere bağlar.
 */
export async function seedPersonel(): Promise<number[]> {
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
}

/**
 * Birimleri (TANIM_Birim) antet ve harcama yetkilisi eşleşmeleriyle ekler.
 */
export async function seedBirimler(personelIds: number[] = []): Promise<number[]> {
  const p1 = personelIds[1] || 1
  const p2 = personelIds[2] || 2
  const p3 = personelIds[3] || 3
  const p5 = personelIds[5] || 5
  const p7 = personelIds[7] || 7
  const p9 = personelIds[9] || 9
  const p11 = personelIds[11] || 11
  const p13 = personelIds[13] || 13
  const p14 = personelIds[14] || 14

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
}

/**
 * Tedarikçi / İstekli Firmaları (TANIM_Firma) eksiksiz ekler.
 */
export async function seedFirmalar(): Promise<number[]> {
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
        [
          f.unvan,
          f.kod,
          f.ilgili,
          f.vno,
          f.vd,
          f.tel,
          f.ep,
          f.adr,
          'Ankara',
          'Çankaya',
          f.hesap_no,
          f.banka,
          f.sube,
          existing.data[0].id
        ]
      )
      ids.push(existing.data[0].id)
    } else {
      const res = await window.electron.ipcRenderer.invoke(
        'db:run',
        `INSERT INTO TANIM_Firma (
          unvan, firma_kodu, ilgili_adi, vergi_no, vergi_dairesi, telefon, email, adres, il, ilce, hesap_no, banka_adi, sube_kodu_adi, aktif_mi, kalite_skoru, deneyim_skoru
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 5, 5)`,
        [
          f.unvan,
          f.kod,
          f.ilgili,
          f.vno,
          f.vd,
          f.tel,
          f.ep,
          f.adr,
          'Ankara',
          'Çankaya',
          f.hesap_no,
          f.banka,
          f.sube
        ]
      )
      if (res.success && res.lastInsertRowid) {
        ids.push(Number(res.lastInsertRowid))
      }
    }
  }
  return ids
}

/**
 * Malzeme, Hizmet ve Yapım Kalemleri Havuzunu (TANIM_Kalem) doldurur.
 */
export async function seedKalemler(): Promise<number[]> {
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
      ozelligi:
        'Kurumsal kullanım için yüksek performanslı masaüstü bilgisayar kasası ve aksesuarları'
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
      ozelligi:
        'Duvar ve tavan yüzey tamiratları, astar ve çift kat silikonlu iç cephe boyası uygulaması'
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
}

/**
 * Komisyon (TANIM_Komisyon) ve Ambar (TANIM_Ambar) tanımlarını ekler.
 */
export async function seedKomisyonlarVeAmbarlar(): Promise<void> {
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

  const komisyonlar = [
    {
      id: 1,
      ad: 'Piyasa Fiyat Araştırması Komisyonu',
      aciklama: 'Piyasa Fiyat Araştırma ve Teklif Değerlendirme Komisyonu'
    },
    {
      id: 2,
      ad: 'Muayene ve Kabul Komisyonu',
      aciklama: 'Taşınır Mal Muayene, Kabul ve Muayene Raporu Komisyonu'
    }
  ]

  for (const k of komisyonlar) {
    await window.electron.ipcRenderer.invoke(
      'db:run',
      `INSERT INTO TANIM_Komisyon (id, ad, aciklama, aktif_mi) VALUES (?, ?, ?, 1) ON CONFLICT(id) DO UPDATE SET ad = excluded.ad, aciklama = excluded.aciklama`,
      [k.id, k.ad, k.aciklama]
    )
  }
}

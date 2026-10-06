import { runSql } from './seedUtils'

/**
 * <summary>
 * 2886 Sayılı Devlet İhale Kanunu Kapsamında Satış, Kiralama ve Hak Tesisi Tohumlama Fonksiyonu
 * </summary>
 */
export async function seedDevletIhale2886(): Promise<number> {
  // 1. Emlak ve İstimlak / Gelir Birimleri Ekle
  const birimler2886 = [
    {
      ad: 'Emlak ve İstimlak Müdürlüğü',
      kisa_ad: 'EMLAK',
      birim_adi: 'Emlak ve İstimlak Müdürlüğü',
      antet_ek_satir: 'Emlak ve İstimlak Müdürlüğü (Taşınmaz ve Gelir Servisi)',
      sunum_makami: 'Emlak ve İstimlak Müdürlüğüne',
      dtvt_kodu: 'DT-EMLAK',
      detsis_kodu: '10234530',
      harcama_kodu: '1007',
      harcama_adi: 'Emlak ve İstimlak Hizmetleri'
    },
    {
      ad: 'Gelirler ve Mali Hizmetler Şefliği',
      kisa_ad: 'GELİR',
      birim_adi: 'Gelirler ve Mali Hizmetler Şefliği',
      antet_ek_satir: 'Mali Hizmetler Müdürlüğü (Gelir ve Tahsilat Şefliği)',
      sunum_makami: 'Gelirler Şefliğine',
      dtvt_kodu: 'DT-GELIR',
      detsis_kodu: '10234531',
      harcama_kodu: '1008',
      harcama_adi: 'Gelir ve Tahakkuk İşlemleri'
    }
  ]

  for (const b of birimler2886) {
    const ex = await window.electron.ipcRenderer.invoke(
      'db:query',
      'SELECT id FROM TANIM_Birim WHERE ad = ? OR birim_adi = ? LIMIT 1',
      [b.ad, b.birim_adi]
    )
    if (!ex.success || !ex.data || ex.data.length === 0) {
      await runSql(
        `INSERT INTO TANIM_Birim (
          ad, kisa_ad, birim_adi, antet_ek_satir, sunum_makami, dtvt_kodu, detsis_kodu,
          harcama_kodu, harcama_adi, harcama_yetkilisi_id, harcama_yetkilisi_unvan,
          gerceklestirme_gorevlisi_id, gerceklestirme_gorevlisi_unvan, aktif_mi
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'Harcama Yetkilisi / Müdür', 2, 'Şube Müdürü', 1)`,
        [
          b.ad,
          b.kisa_ad,
          b.birim_adi,
          b.antet_ek_satir,
          b.sunum_makami,
          b.dtvt_kodu,
          b.detsis_kodu,
          b.harcama_kodu,
          b.harcama_adi
        ]
      )
    }
  }

  // 2. 2886 Kıymet Takdir ve Encümen Komisyonu Ekle
  const komisyonlar2886 = [
    {
      ad: '2886 Sayılı Kanun Kıymet Takdir Komisyonu',
      aciklama:
        '2886 sayılı DİK kapsamında taşınmaz ve menkul malların muhammen bedel tespiti için oluşturulan takdir heyeti.'
    },
    {
      ad: 'Belediye Encümeni (2886 İhale Komisyonu)',
      aciklama:
        '2886 sayılı DİK Madde 13 uyarınca belediyelerde ihale komisyonu görevini yürüten Belediye Encümeni.'
    }
  ]

  for (const k of komisyonlar2886) {
    const ex = await window.electron.ipcRenderer.invoke(
      'db:query',
      'SELECT id FROM TANIM_Komisyon WHERE ad = ? LIMIT 1',
      [k.ad]
    )
    if (!ex.success || !ex.data || ex.data.length === 0) {
      await runSql(`INSERT INTO TANIM_Komisyon (ad, aciklama, aktif_mi) VALUES (?, ?, 1)`, [
        k.ad,
        k.aciklama
      ])
    }
  }

  // 3. 2886 İstekli / Alıcı / Kiracı Firmalar ve Şahıslar Ekle
  const firmalar2886 = [
    {
      unvan: 'Anadolu Gayrimenkul Yatırım & İnşaat A.Ş.',
      kod: 'FRM-2886-01',
      vkn: '8450129845',
      vd: 'Çankaya V.D.',
      adres: 'Mustafa Kemal Mah. 2118. Cad. No: 142 Çankaya / Ankara',
      tel: '0312 444 10 20',
      yetkili: 'Ahmet Faruk Yılmaz',
      il: 'Ankara',
      ilce: 'Çankaya'
    },
    {
      unvan: 'Marmara Sosyal Tesisler ve Kafe İşletmeciliği Ltd. Şti.',
      kod: 'FRM-2886-02',
      vkn: '1129485721',
      vd: 'Kadıköy V.D.',
      adres: 'Bağdat Cad. No: 120 Kadıköy / İstanbul',
      tel: '0216 350 40 50',
      yetkili: 'Mustafa Kemal Akdeniz',
      il: 'İstanbul',
      ilce: 'Kadıköy'
    },
    {
      unvan: 'Ege Tarım, Hayvancılık & Lojistik San. Tic. A.Ş.',
      kod: 'FRM-2886-03',
      vkn: '4455667788',
      vd: 'Bornova V.D.',
      adres: 'Organize Sanayi Bölgesi 4. Cad. No: 18 Bornova / İzmir',
      tel: '0232 460 70 80',
      yetkili: 'Salih Güneyli',
      il: 'İzmir',
      ilce: 'Bornova'
    },
    {
      unvan: 'Hakan Yıldırım (Bireysel Yatırımcı / İstekli)',
      kod: 'FRM-2886-04',
      vkn: '32165498710',
      vd: 'Nilüfer V.D.',
      adres: 'Ataevler Mah. Barış Cad. No: 8 Nilüfer / Bursa',
      tel: '0532 555 12 34',
      yetkili: 'Hakan Yıldırım',
      il: 'Bursa',
      ilce: 'Nilüfer'
    }
  ]

  for (const f of firmalar2886) {
    const ex = await window.electron.ipcRenderer.invoke(
      'db:query',
      'SELECT id FROM TANIM_Firma WHERE unvan = ? OR vergi_no = ? LIMIT 1',
      [f.unvan, f.vkn]
    )
    if (!ex.success || !ex.data || ex.data.length === 0) {
      await runSql(
        `INSERT INTO TANIM_Firma (
          unvan, firma_kodu, ilgili_adi, vergi_no, vergi_dairesi, telefon, email, adres, il, ilce, aktif_mi, kalite_skoru, deneyim_skoru
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 5, 5)`,
        [
          f.unvan,
          f.kod,
          f.yetkili,
          f.vkn,
          f.vd,
          f.tel,
          'info@' + f.unvan.toLowerCase().split(' ')[0] + '.com.tr',
          f.adres,
          f.il,
          f.ilce
        ]
      )
    }
  }

  // 4. 2886 Taşınmaz & Menkul Varlık Kataloğu Ekle
  const tasinmazKalemleri = [
    {
      barkod: '2886001',
      ad: 'Merkez Mah. 104 Ada 12 Parsel Ticari İmarlı Arsa (1.450 m²)',
      tip: 'Yapım',
      birim: 'm²',
      kdv: 0,
      tkod: '252.01.01.01',
      ozelligi:
        'Emsal: 1.50, Hmax: 15.50m (5 Kat), Ticaret + Konut Alanı, Belediye Mülkiyetinde Taşınmaz Satışı.'
    },
    {
      barkod: '2886002',
      ad: 'Belediye İş Merkezi Zemin Kat 4 Nolu Dükkan (85 m²)',
      tip: 'Hizmet',
      birim: 'Adet',
      kdv: 20,
      tkod: '150.01.01.01',
      ozelligi:
        'Kira süresi: 3 Yıl. Aylık kira bedeli ve yıllık TÜFE/Yİ-ÜFE artışı uygulanacaktır.'
    },
    {
      barkod: '2886003',
      ad: 'Atatürk Parkı İçi Kafeterya ve Çay Bahçesi (350 m²)',
      tip: 'Hizmet',
      birim: 'Adet',
      kdv: 20,
      tkod: '150.01.01.02',
      ozelligi:
        'Açık ve kapalı alanı bulunan belediye sosyal tesisi işletme hakkı devri / kiralaması.'
    },
    {
      barkod: '2886004',
      ad: 'Yayla Mevkii 205 Ada 3 Parsel Tarım Arazisi (12.000 m²)',
      tip: 'Hizmet',
      birim: 'Dekar',
      kdv: 0,
      tkod: '252.02.01.01',
      ozelligi: '5 yıllık tarımsal amaçlı kiralama ihalesi.'
    }
  ]

  for (const k of tasinmazKalemleri) {
    const ex = await window.electron.ipcRenderer.invoke(
      'db:query',
      'SELECT id FROM TANIM_Kalem WHERE barkod_id = ? OR kalem_adi = ? LIMIT 1',
      [k.barkod, k.ad]
    )
    if (!ex.success || !ex.data || ex.data.length === 0) {
      await runSql(
        `INSERT INTO TANIM_Kalem (
          barkod_id, kalem_adi, tipi, birim, kdv_orani, tasinir_kodu, ozelligi, aktif_mi
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
        [k.barkod, k.ad, k.tip, k.birim, k.kdv, k.ozelligi]
      )
    }
  }

  // 5. 2886 Örnek Çalışma Masası Verisini localStorage'a Hazırla & Kaydet
  const sample2886Dosyalar = [
    {
      id: '2886-SATIS-2026-01',
      islemTuru: 'satis',
      usul: 'acik_teklif_45',
      ihaleAdi: 'Merkez Mah. 104 Ada 12 Parsel 1.450 m² Ticari İmarlı Arsa Satışı İhalesi',
      ihaleKayitNo: '2026/2886-ST-01',
      ihaleTarihi: '2026-10-15',
      ihaleSaati: '14:30',
      ihaleYeri: 'Belediye Encümen Toplantı Salonu',
      tasinmaz: {
        il: 'Ankara',
        ilce: 'Çankaya',
        mahalleKoy: 'Çukurambar Mahallesi',
        ada: '104',
        parsel: '12',
        yuzolcumuM2: 1450,
        cinsi: 'Ticaret + Konut İmarlı Arsa',
        hisseOrani: '1/1 (Tamamı Belediyeye Ait)',
        mevcutDurumu: 'Boş / Teslime Hazır',
        adres: 'Öğretmenler Caddesi No: 45 Çankaya / Ankara'
      },
      muhammenBedel: {
        birimFiyatM2: 3103.45,
        toplamAlanM2: 1450,
        hesaplananBedel: 4500000,
        takdirEdilenMuhammenBedel: 4500000,
        geciciTeminatOrani: 3,
        geciciTeminatTutari: 135000,
        kdvOrani: 0,
        kararTarihi: '2026-09-20',
        kararNo: '2026/KKT-14'
      },
      istekliler: [
        {
          id: 'ist-1',
          unvanVeyaAd: 'Anadolu Gayrimenkul Yatırım & İnşaat A.Ş.',
          tcVkn: '8450129845',
          geciciTeminatYatirdiMi: true,
          teminatTutari: 135000,
          teklifler: [4500000, 4750000, 5000000, 5250000],
          sonTeklifTutari: 5250000,
          kazandiMi: true
        },
        {
          id: 'ist-2',
          unvanVeyaAd: 'Ege Tarım, Hayvancılık & Lojistik San. Tic. A.Ş.',
          tcVkn: '4455667788',
          geciciTeminatYatirdiMi: true,
          teminatTutari: 135000,
          teklifler: [4500000, 4700000, 4950000, 5200000],
          sonTeklifTutari: 5200000,
          kazandiMi: false
        },
        {
          id: 'ist-3',
          unvanVeyaAd: 'Hakan Yıldırım',
          tcVkn: '32165498710',
          geciciTeminatYatirdiMi: true,
          teminatTutari: 135000,
          teklifler: [4500000, 4650000],
          sonTeklifTutari: 4650000,
          kazandiMi: false
        }
      ]
    },
    {
      id: '2886-KIRA-2026-02',
      islemTuru: 'kiralama',
      usul: 'acik_teklif_45',
      ihaleAdi: 'Atatürk Parkı İçi Sosyal Tesis ve Kafeterya Alanı 3 Yıllık Kiralanması',
      ihaleKayitNo: '2026/2886-KR-02',
      ihaleTarihi: '2026-10-22',
      ihaleSaati: '10:00',
      ihaleYeri: 'Belediye Encümen Toplantı Salonu',
      tasinmaz: {
        il: 'İstanbul',
        ilce: 'Kadıköy',
        mahalleKoy: 'Fenerbahçe Mahallesi',
        ada: '88',
        parsel: '4',
        yuzolcumuM2: 350,
        cinsi: 'Sosyal Tesis / Kafeterya ve Çay Bahçesi',
        hisseOrani: '1/1',
        mevcutDurumu: 'Kirada (Sözleşme Bitiş: 31.10.2026)',
        adres: 'Fenerbahçe Parkı İçi Tesisler Kadıköy / İstanbul'
      },
      muhammenBedel: {
        birimFiyatM2: 514.28,
        toplamAlanM2: 350,
        hesaplananBedel: 180000,
        takdirEdilenMuhammenBedel: 180000,
        geciciTeminatOrani: 3,
        geciciTeminatTutari: 16200,
        kdvOrani: 20,
        kararTarihi: '2026-09-25',
        kararNo: '2026/KKT-18'
      },
      kiraPlani: {
        yil: 3,
        aylikKiraBedeli: 20000,
        yillikToplamKira: 240000,
        artisOraniTuru: 'yi_ufe_12_aylik',
        guvenceBedeliDepozito: 60000,
        odemeGunu: 5
      },
      istekliler: [
        {
          id: 'ist-k1',
          unvanVeyaAd: 'Marmara Sosyal Tesisler ve Kafe İşletmeciliği Ltd. Şti.',
          tcVkn: '1129485721',
          geciciTeminatYatirdiMi: true,
          teminatTutari: 16200,
          teklifler: [180000, 200000, 220000, 240000],
          sonTeklifTutari: 240000,
          kazandiMi: true
        },
        {
          id: 'ist-k2',
          unvanVeyaAd: 'Anadolu Gayrimenkul Yatırım & İnşaat A.Ş.',
          tcVkn: '8450129845',
          geciciTeminatYatirdiMi: true,
          teminatTutari: 16200,
          teklifler: [180000, 195000, 215000, 235000],
          sonTeklifTutari: 235000,
          kazandiMi: false
        }
      ]
    },
    {
      id: '2886-SATIS-2026-03',
      islemTuru: 'satis',
      usul: 'acik_teklif_45',
      ihaleAdi: 'Ekonomik Ömrünü Tamamlamış 5 Adet Hizmet Aracı ve İş Makinesi Satış İhalesi',
      ihaleKayitNo: '2026/2886-MS-03',
      ihaleTarihi: '2026-10-28',
      ihaleSaati: '11:30',
      ihaleYeri: 'Belediye Encümen Toplantı Salonu',
      tasinmaz: {
        il: 'İzmir',
        ilce: 'Bornova',
        mahalleKoy: 'Sanayi Mahallesi',
        ada: '0',
        parsel: '0',
        yuzolcumuM2: 0,
        cinsi: 'Menkul Mal / 5 Adet Motorlu Taşıt ve İş Makinesi',
        hisseOrani: '1/1',
        mevcutDurumu: 'Fen İşleri Şantiyesinde Park Halinde',
        adres: 'Fen İşleri Makine İkmal Sahası Bornova / İzmir'
      },
      muhammenBedel: {
        birimFiyatM2: 0,
        toplamAlanM2: 0,
        hesaplananBedel: 1850000,
        takdirEdilenMuhammenBedel: 1850000,
        geciciTeminatOrani: 3,
        geciciTeminatTutari: 55500,
        kdvOrani: 1,
        kararTarihi: '2026-09-28',
        kararNo: '2026/KKT-22'
      },
      istekliler: [
        {
          id: 'ist-m1',
          unvanVeyaAd: 'Ege Lojistik & Ağır Vasıta Ltd. Şti.',
          tcVkn: '8450129845',
          geciciTeminatYatirdiMi: true,
          teminatTutari: 55500,
          teklifler: [1850000, 1920000, 2050000],
          sonTeklifTutari: 2050000,
          kazandiMi: true
        },
        {
          id: 'ist-m2',
          unvanVeyaAd: 'Hakan Yıldırım',
          tcVkn: '32165498710',
          geciciTeminatYatirdiMi: true,
          teminatTutari: 55500,
          teklifler: [1850000, 1900000, 2000000],
          sonTeklifTutari: 2000000,
          kazandiMi: false
        }
      ]
    },
    {
      id: '2886-HAK-2026-04',
      islemTuru: 'irtifak_hakki',
      usul: 'kapali_teklif_36',
      ihaleAdi:
        'Kent Meydanı Otopark ve Elektrikli Şarj İstasyonu 10 Yıllık Sınırlı Ayni Hak Tesis İhalesi',
      ihaleKayitNo: '2026/2886-HT-04',
      ihaleTarihi: '2026-11-05',
      ihaleSaati: '15:00',
      ihaleYeri: 'Belediye Encümen Toplantı Salonu',
      tasinmaz: {
        il: 'Bursa',
        ilce: 'Nilüfer',
        mahalleKoy: 'Cumhuriyet Mahallesi',
        ada: '152',
        parsel: '8',
        yuzolcumuM2: 2200,
        cinsi: 'Meydan Altı Kapalı Otopark Alanı',
        hisseOrani: '1/1',
        mevcutDurumu: 'Mevcut Tesis',
        adres: 'FSM Bulvarı Kent Meydanı Altı Nilüfer / Bursa'
      },
      muhammenBedel: {
        birimFiyatM2: 163.63,
        toplamAlanM2: 2200,
        hesaplananBedel: 3600000,
        takdirEdilenMuhammenBedel: 3600000,
        geciciTeminatOrani: 3,
        geciciTeminatTutari: 108000,
        kdvOrani: 20,
        kararTarihi: '2026-10-01',
        kararNo: '2026/KKT-25'
      },
      istekliler: [
        {
          id: 'ist-h1',
          unvanVeyaAd: 'Anadolu Gayrimenkul Yatırım & İnşaat A.Ş.',
          tcVkn: '8450129845',
          geciciTeminatYatirdiMi: true,
          teminatTutari: 108000,
          teklifler: [3600000, 3850000, 4100000],
          sonTeklifTutari: 4100000,
          kazandiMi: true
        }
      ]
    }
  ]

  try {
    localStorage.setItem('temin_2886_dosyalar_samples', JSON.stringify(sample2886Dosyalar))
    localStorage.setItem('temin_2886_active_dosya', JSON.stringify(sample2886Dosyalar[0]))
    window.dispatchEvent(new CustomEvent('devlet-ihale-2886-reloaded'))
  } catch (e) {
    console.warn('[devSeedService] localStorage 2886 write error:', e)
  }

  return sample2886Dosyalar.length
}

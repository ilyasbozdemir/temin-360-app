import { seedFirmalar, seedPersonel, seedBirimler } from './seedDefinitions'
import { runSql } from './seedUtils'

/**
 * <summary>
 * Doğrudan Temin ve Süreç Dosyaları Tohumlama Fonksiyonları
 * </summary>
 */

export async function enrichExistingDosyalar(
  firmaIds: number[] = [],
  personelIds: number[] = [],
  birimIds: number[] = []
): Promise<number> {
  // Gerekli tanımlar eksikse otomatik getir veya tohumla
  if (!firmaIds || firmaIds.length === 0) {
    const fRes = await window.electron.ipcRenderer.invoke(
      'db:query',
      'SELECT id FROM TANIM_Firma ORDER BY id'
    )
    if (fRes.success && fRes.data && fRes.data.length > 0) {
      firmaIds = fRes.data.map((r: { id: number }) => r.id)
    } else {
      firmaIds = await seedFirmalar()
    }
  }

  if (!personelIds || personelIds.length === 0) {
    const pRes = await window.electron.ipcRenderer.invoke(
      'db:query',
      'SELECT id FROM TANIM_Personel ORDER BY id'
    )
    if (pRes.success && pRes.data && pRes.data.length > 0) {
      personelIds = pRes.data.map((r: { id: number }) => r.id)
    } else {
      personelIds = await seedPersonel()
    }
  }

  if (!birimIds || birimIds.length === 0) {
    const bRes = await window.electron.ipcRenderer.invoke(
      'db:query',
      'SELECT id FROM TANIM_Birim ORDER BY id'
    )
    if (bRes.success && bRes.data && bRes.data.length > 0) {
      birimIds = bRes.data.map((r: { id: number }) => r.id)
    } else {
      birimIds = await seedBirimler(personelIds)
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
    // --- DOĞRUDAN TEMİN (KİK 22) DOSYALARI ---
    {
      temin_no: `DT-${dy}/01`,
      konu: `${dy} Yılı 1. Çeyrek Kırtasiye, Kağıt ve Büro Tüketim Malzemeleri Alımı`,
      isin_aciklamasi:
        'Birimlerimizin acil kırtasiye ihtiyacının 4734 sayılı KİK 22/d doğrudan temin usulü ile karşılanması işi.',
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
      isin_aciklamasi:
        'Hizmet binasındaki tüm iklimlendirme sistemlerinin mevsimlik periyodik bakımı hizmet alımı.',
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
      isin_aciklamasi:
        'Zemin kat ortak kullanım alanları ve ıslak hacimlerin komple seramik kaplama ve tadilat yapım işi.',
      tur: 'yapim_isi',
      birim_id: birimIds[2] || birimIds[0] || 1,
      ihtiyac_yeri: 'İnşaat ve Teknik Hizmetler Birimi / Hizmet Binası Zemin Kat',
      butce_kodu: '03.8.2.01 Hizmet Binası Küçük Onarım Giderleri',
      butce_yili: dy,
      butce_tipi: 'Genel Bütçe',
      ihale_sekli: '4734 Sayılı KİK Md. 22/d (Doğrudan Temin)',
      ihale_tipi: 'Doğrudan Temin'
    },
    {
      temin_no: `DT-${dy}/04`,
      konu: 'Ağ Altyapısı Güvenlik ve Sunucu Yazılım Lisansı Teknik Destek Alımı',
      isin_aciklamasi:
        'Kurumsal ağ omurgası güvenlik duvarı ve sanallaştırma lisanslarının 1 yıllık teknik destek ve güncelleme alımı.',
      tur: 'hizmet',
      birim_id: birimIds[3] || birimIds[0] || 1,
      ihtiyac_yeri: 'Bilgi İşlem Birimi / Veri Merkezi',
      butce_kodu: '03.7.1.90 Diğer Dayanıklı Mal ve Malzeme Alımları',
      butce_yili: dy,
      butce_tipi: 'Genel Bütçe',
      ihale_sekli: '4734 Sayılı KİK Md. 22/c (Mevcut Uyumluluk)',
      ihale_tipi: 'Doğrudan Temin'
    },
    {
      temin_no: `DT-${dy}/05`,
      konu: 'Tıbbi Cihaz ve Biyomedikal Ekipman Kalibrasyon Hizmet Alımı',
      isin_aciklamasi:
        'Kurumumuz bünyesindeki tıbbi analiz ve ölçüm cihazlarının yıllık akredite kalibrasyon hizmeti.',
      tur: 'hizmet',
      birim_id: birimIds[0] || 1,
      ihtiyac_yeri: 'Laboratuvar ve Tanı Hizmetleri',
      butce_kodu: '03.5.1.08 Laboratuvar Hizmet Alımları',
      butce_yili: dy,
      butce_tipi: 'Genel Bütçe',
      ihale_sekli: '4734 Sayılı KİK Md. 22/f (İlaç ve Tıbbi Cihaz)',
      ihale_tipi: 'Doğrudan Temin'
    }
  ]

  const samplePackages = [
    // 1. DT-01 (Kırtasiye)
    [
      {
        ad: 'A4 80 gr/m² Fotokopi Kağıdı',
        ozelligi: '1. hamur yüksek beyazlık',
        tip: 'Mal',
        birim: 'Paket',
        miktar: 100,
        kdv: 20,
        tkod: '150.01.01.01',
        f1: 185,
        f2: 195,
        f3: 175
      },
      {
        ad: 'Siyah Lazer Toner Kartuşu',
        ozelligi: 'Yüksek kapasiteli orijinal muadili',
        tip: 'Mal',
        birim: 'Adet',
        miktar: 12,
        kdv: 20,
        tkod: '150.01.02.04',
        f1: 1250,
        f2: 1320,
        f3: 1190
      }
    ],
    // 2. DT-02 (Klima Bakım)
    [
      {
        ad: 'Split ve VRF Klimalar Periyodik Bakım',
        ozelligi: 'Antibakteriyel dezenfeksiyon ve filtre temizliği',
        tip: 'Hizmet',
        birim: 'Adet',
        miktar: 24,
        kdv: 20,
        tkod: '150.08.01.01',
        f1: 850,
        f2: 920,
        f3: 800
      },
      {
        ad: 'R410A / R32 Çevre Dostu Soğutucu Gaz Dolumu',
        ozelligi: 'Orijinal gaz takviyesi ve kaçak testi',
        tip: 'Hizmet',
        birim: 'Kg',
        miktar: 15,
        kdv: 20,
        tkod: '150.08.01.03',
        f1: 650,
        f2: 700,
        f3: 600
      }
    ],
    // 3. DT-03 (Islak Hacim)
    [
      {
        ad: '60x60 Taşyünü Asma Tavan İmalatı',
        ozelligi: 'Akustik ve neme dayanıklı',
        tip: 'Yapım İşi',
        birim: 'm²',
        miktar: 180,
        kdv: 20,
        tkod: '150.07.01.01',
        f1: 420,
        f2: 450,
        f3: 390
      },
      {
        ad: 'İç Cephe Silikonlu Mat Boya Uygulaması',
        ozelligi: 'Çift kat astar ve son kat boya',
        tip: 'Yapım İşi',
        birim: 'm²',
        miktar: 350,
        kdv: 20,
        tkod: '150.07.02.01',
        f1: 180,
        f2: 200,
        f3: 165
      },
      {
        ad: 'Kaymaz Porselen Zemin Seramiği',
        ozelligi: '1. sınıf aşınma dirençli',
        tip: 'Yapım İşi',
        birim: 'm²',
        miktar: 75,
        kdv: 20,
        tkod: '150.07.03.01',
        f1: 650,
        f2: 720,
        f3: 610
      }
    ],
    // 4. DT-04 (Yazılım Lisans)
    [
      {
        ad: 'Güvenlik Duvarı UTM Lisansı ve 1 Yıllık Destek',
        ozelligi: 'Web Filtreleme, IPS/IDS ve Antivirus modülleri dahil',
        tip: 'Hizmet',
        birim: 'Adet',
        miktar: 1,
        kdv: 20,
        tkod: '150.08.02.01',
        f1: 85000,
        f2: 89000,
        f3: 82000
      },
      {
        ad: 'SSL VPN & Uzaktan Erişim Kullanıcı Lisans Paketi',
        ozelligi: '100 Eşzamanlı Kullanıcı Destekli',
        tip: 'Hizmet',
        birim: 'Paket',
        miktar: 1,
        kdv: 20,
        tkod: '150.08.02.02',
        f1: 34000,
        f2: 36500,
        f3: 32500
      }
    ],
    // 5. DT-05 (Kalibrasyon)
    [
      {
        ad: 'Hasta Başı Monitörleri ve Defibrilatör Kalibrasyonu',
        ozelligi: 'TÜRKAK akredite ölçüm ve sertifikalandırma',
        tip: 'Hizmet',
        birim: 'Adet',
        miktar: 18,
        kdv: 20,
        tkod: '150.08.03.01',
        f1: 1600,
        f2: 1750,
        f3: 1500
      },
      {
        ad: 'Laboratuvar Santrifüj ve Otoklav Cihazı Testi',
        ozelligi: 'Sıcaklık ve devir kalibrasyonu',
        tip: 'Hizmet',
        birim: 'Adet',
        miktar: 6,
        kdv: 20,
        tkod: '150.08.03.02',
        f1: 2400,
        f2: 2600,
        f3: 2250
      }
    ]
  ]

  let enrichedCount = 0

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
        [
          dosyaId,
          item.ad,
          item.tip,
          item.birim,
          item.miktar,
          item.kdv,
          item.tkod,
          item.ozelligi || item.ad
        ]
      )
      if (kRes.success && kRes.lastInsertRowid) {
        dosyaKalemIds.push(Number(kRes.lastInsertRowid))
      }
    }

    // İstekli Firmaları Bağla
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
      const isWinner = fi === 2
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
      {
        kom_id: 1,
        p_id: p1,
        ad: 'Ayşe Kaya Demir',
        unvan: 'Şube Müdürü',
        gorev: 'Komisyon Başkanı',
        rol: 'Asil'
      },
      { kom_id: 1, p_id: p2, ad: 'Mustafa Çelik', unvan: 'Mühendis', gorev: 'Üye', rol: 'Asil' },
      {
        kom_id: 1,
        p_id: p3,
        ad: 'Fatma Şahin Korkmaz',
        unvan: 'Uzman',
        gorev: 'Üye',
        rol: 'Asil'
      },
      {
        kom_id: 2,
        p_id: personelIds[5] || 4,
        ad: 'Emre Karaca',
        unvan: 'Biyomedikal Mühendisi',
        gorev: 'Muayene Kabul Başkanı',
        rol: 'Asil'
      },
      {
        kom_id: 2,
        p_id: personelIds[6] || 5,
        ad: 'Zeynep Aktaş',
        unvan: 'Taşınır Kayıt Yetkilisi',
        gorev: 'Üye',
        rol: 'Asil'
      }
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

    const winningFirmaId = teminFirmaIds.length > 2 ? teminFirmaIds[2].firma_id : firmaIds[0] || 1
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

/**
 * <summary>
 * Veritabanındaki Doğrudan Temin haricindeki tüm İhale Süreç dosyalarını ve ilişkili hareket kayıtlarını tek SQL mantığıyla tamamen siler.
 * </summary>
 */
export async function deleteIhaleDosyalariFromDb(): Promise<{
  success: boolean
  deletedCount?: number
}> {
  const nonDtDosyaSubQuery = `
    SELECT id FROM DATA_TeminDosyasi 
    WHERE (ihale_tipi IS NOT NULL AND ihale_tipi != 'Doğrudan Temin')
       OR (ihale_sekli IS NOT NULL AND ihale_sekli NOT LIKE '%22%' AND ihale_sekli NOT LIKE '%Doğrudan Temin%')
       OR temin_no LIKE 'İH-%'
  `

  try {
    // 1. Hakediş alt kesinti ve kalemlerini sil
    await runSql(`
      DELETE FROM DATA_HakedisKesinti WHERE hakedis_id IN (
        SELECT id FROM DATA_Hakedis WHERE temin_dosya_id IN (${nonDtDosyaSubQuery})
      )
    `)
    await runSql(`
      DELETE FROM DATA_HakedisKalem WHERE hakedis_id IN (
        SELECT id FROM DATA_Hakedis WHERE temin_dosya_id IN (${nonDtDosyaSubQuery})
      )
    `)
    // 2. Hakediş kayıtlarını sil
    await runSql(`
      DELETE FROM DATA_Hakedis WHERE temin_dosya_id IN (${nonDtDosyaSubQuery})
    `)
    // 3. Kalem tekliflerini sil
    await runSql(`
      DELETE FROM DATA_TeminKalemTeklif WHERE temin_dosya_id IN (${nonDtDosyaSubQuery})
    `)
    // 4. Kalemleri sil
    await runSql(`
      DELETE FROM DATA_TeminKalem WHERE temin_dosya_id IN (${nonDtDosyaSubQuery})
    `)
    // 5. Firmaları (İstekliler) sil
    await runSql(`
      DELETE FROM DATA_TeminFirma WHERE temin_dosya_id IN (${nonDtDosyaSubQuery})
    `)
    // 6. Komisyon üyelerini sil
    await runSql(`
      DELETE FROM DATA_TeminKomisyon WHERE temin_dosya_id IN (${nonDtDosyaSubQuery})
    `)
    // 7. Ek süreçleri sil
    await runSql(`
      DELETE FROM DATA_TeminEkSurec WHERE temin_dosya_id IN (${nonDtDosyaSubQuery})
    `)
    // 8. Ana dosya kayıtlarını sil (DATA_TeminDosyasi)
    await runSql(`
      DELETE FROM DATA_TeminDosyasi 
      WHERE (ihale_tipi IS NOT NULL AND ihale_tipi != 'Doğrudan Temin')
         OR (ihale_sekli IS NOT NULL AND ihale_sekli NOT LIKE '%22%' AND ihale_sekli NOT LIKE '%Doğrudan Temin%')
         OR temin_no LIKE 'İH-%'
    `)

    return { success: true }
  } catch (error) {
    console.error('[deleteIhaleDosyalariFromDb] Hata:', error)
    return { success: false }
  }
}

export async function seedDogrudanTeminOnly(
  firmaIds: number[] = [],
  personelIds: number[] = [],
  birimIds: number[] = []
): Promise<number> {
  return await enrichExistingDosyalar(firmaIds, personelIds, birimIds)
}

export async function seedIhale4734Only(
  firmaIds: number[] = [],
  personelIds: number[] = [],
  birimIds: number[] = []
): Promise<number> {
  void firmaIds
  void personelIds
  void birimIds
  await deleteIhaleDosyalariFromDb()
  return 0
}


import { isMemberVisibleInDocument } from '@temin360/document-templates'
import { formatTurkishDate, getIpcKurumBizimText, getIpcKurumIhtiyacYeri } from './documentUtils'

export function resolveDocumentPayload(
  db: any,
  payload: { dosyaId?: number; documentId?: string }
): { success: boolean; data?: any; error?: string } {
  try {
    const dosyaId = Number(payload?.dosyaId || 0)
    const documentId = payload?.documentId || ''

    // 1. Fetch active personnel list
    const personelListesi = db
      .prepare(
        'SELECT id, ad_soyad, unvan, telefon, eposta, birim, sicil_no FROM TANIM_Personel WHERE COALESCE(aktif_mi, 1) = 1 OR aktif_mi = "1" OR aktif_mi = "true" OR aktif_mi IS NULL ORDER BY ad_soyad ASC'
      )
      .all()

    // 1.1 Fetch active units list
    const birimListesi = db
      .prepare(
        'SELECT id, ad, birim_adi, kisa_ad, sunum_makami, antet_ek_satir, harcama_yetkilisi_id, harcama_yetkilisi_unvan FROM TANIM_Birim WHERE COALESCE(aktif_mi, 1) = 1 ORDER BY birim_adi ASC'
      )
      .all()

    // 2. Fetch institution and app settings
    const settingsMap: Record<string, string> = {}
    try {
      const settingsRows = db.prepare('SELECT key, value FROM settings').all()
      settingsRows.forEach((r: any) => {
        if (r.key) settingsMap[r.key] = r.value
      })
    } catch {}

    const activeId = Number(settingsMap.activeKurumId || 1)
    const kurum =
      db.prepare('SELECT * FROM TANIM_Kurum WHERE id = ?').get(activeId) ||
      db.prepare('SELECT * FROM TANIM_Kurum WHERE is_active = 1 LIMIT 1').get() ||
      db.prepare('SELECT * FROM TANIM_Kurum ORDER BY id ASC LIMIT 1').get() ||
      {}

    const solLogo =
      (kurum as any)?.logo_sol ||
      (kurum as any)?.logo_kurum ||
      (kurum as any)?.logo_url ||
      settingsMap.logoLeft ||
      settingsMap.institutionLogo ||
      null
    const sagLogo = (kurum as any)?.logo_sag || settingsMap.logoRight || null

    // 3. Fetch file details with Purchasing Unit (TANIM_Birim) antet data
    const dosya = dosyaId
      ? db
          .prepare(
            `SELECT d.*, 
                  b.antet_ek_satir as birim_antet_ek_satir, 
                  b.birim_adi as birim_tablo_adi,
                  b.harcama_kodu as harcama_birim_kodu,
                  b.muhasebe_kodu,
                  b.detsis_kodu
           FROM DATA_TeminDosyasi d 
           LEFT JOIN TANIM_Birim b ON d.birim_id = b.id 
           WHERE d.id = ?`
          )
          .get(dosyaId) || {}
      : {}

    // 4. Fetch items
    const items = dosyaId
      ? db
          .prepare(
            'SELECT id, kalem_adi, aciklama, birim, miktar, tasinir_kodu, kdv_orani FROM DATA_TeminKalem WHERE temin_dosya_id = ? ORDER BY id ASC'
          )
          .all(dosyaId)
      : []

    // 5. Fetch invited firms
    let fileFirms: any[] = []
    if (dosyaId) {
      fileFirms = db
        .prepare(
          `
      SELECT 
        df.id as temin_firma_id,
        COALESCE(f.id, df.firma_id, df.id) as id,
        COALESCE(NULLIF(df.unvan, ''), NULLIF(f.unvan, ''), 'İstekli Firma') as unvan,
        COALESCE(NULLIF(df.ilgili_kisi, ''), NULLIF(f.ilgili_adi, '')) as yetkili_ad_soyad,
        COALESCE(NULLIF(f.telefon, ''), NULLIF(df.telefon, '')) as telefon,
        COALESCE(NULLIF(f.email, ''), NULLIF(df.email, '')) as eposta
      FROM DATA_TeminFirma df
      LEFT JOIN TANIM_Firma f ON df.firma_id = f.id
      WHERE df.temin_dosya_id = ?
      ORDER BY df.id ASC
    `
        )
        .all(dosyaId)
    }

    // 6. Fetch global firms for fallback/selection
    const globalFirms = db
      .prepare(
        "SELECT id, unvan, ilgili_adi as yetkili_ad_soyad, telefon, email as eposta FROM TANIM_Firma WHERE aktif_mi = 1 AND unvan IS NOT NULL AND unvan != '' ORDER BY unvan ASC"
      )
      .all()

    // 7. Fetch bids
    const bids = dosyaId
      ? db
          .prepare(
            'SELECT temin_kalem_id, temin_firma_id, birim_fiyat FROM DATA_TeminKalemTeklif WHERE temin_dosya_id = ?'
          )
          .all(dosyaId)
      : []

    // 8. Fetch commissions
    let komisyonlar = dosyaId
      ? db
          .prepare(
            `
    SELECT tk.*, 
           COALESCE(NULLIF(tk.ad_soyad, ''), NULLIF(p.ad_soyad, ''), '') as resolved_ad_soyad,
           COALESCE(NULLIF(tk.unvan, ''), NULLIF(p.unvan, ''), '') as resolved_unvan,
           COALESCE(k.ad, '') as komisyon_turu_adi
    FROM DATA_TeminKomisyon tk
    LEFT JOIN TANIM_Personel p ON tk.personel_id = p.id
    LEFT JOIN TANIM_Komisyon k ON tk.komisyon_id = k.id
    WHERE tk.temin_dosya_id = ?
  `
          )
          .all(dosyaId)
      : []

    // Otomatik Fallback: Eğer dosyaya özel komisyon onaylanmamışsa, genel Komisyon Ayarlarından (TANIM_Komisyon) aktif üyeleri getir
    if (!komisyonlar || komisyonlar.length === 0) {
      try {
        komisyonlar = db
          .prepare(
            `
        SELECT u.*, 
               COALESCE(NULLIF(p.ad_soyad, ''), '') as resolved_ad_soyad,
               COALESCE(NULLIF(p.unvan, ''), '') as resolved_unvan,
               COALESCE(k.ad, '') as komisyon_turu_adi,
               COALESCE(g.ad, 'Üye') as gorev
        FROM TANIM_KomisyonUye u
        JOIN TANIM_Komisyon k ON u.komisyon_id = k.id
        LEFT JOIN TANIM_Personel p ON u.personel_id = p.id
        LEFT JOIN TANIM_KomisyonGorevi g ON u.gorev_id = g.id
        WHERE (k.aktif_mi = 1 OR k.aktif_mi IS NULL)
      `
          )
          .all()
      } catch (komErr) {
        console.error('[Document IPC] TANIM_Komisyon fallback error:', komErr)
      }
    }

    // 9. Fetch saved snapshot if exists
    let savedSnapshot: any = null
    if (dosyaId && documentId) {
      const cleanDocId = String(documentId)
        .replace(/\.html$/i, '')
        .trim()
      try {
        const snapRow = db
          .prepare(
            `
        SELECT veri_json FROM DATA_DosyaSablonVeri 
        WHERE temin_dosya_id = ? AND (
          sablon_kodu = ? 
          OR sablon_kodu = ?
          OR sablon_id = (SELECT id FROM TANIM_Sablon WHERE dosya_adi = ? OR dosya_adi = ? LIMIT 1)
        )
        ORDER BY id DESC LIMIT 1
      `
          )
          .get(dosyaId, cleanDocId, `${cleanDocId}.html`, `${cleanDocId}.html`, cleanDocId) as any
        if (snapRow?.veri_json) {
          savedSnapshot = JSON.parse(snapRow.veri_json)
        }
      } catch (err) {
        console.error('[Document IPC] savedSnapshot fetch error:', err)
      }
    }

    // Calculate firm totals & winner
    fileFirms.forEach((firm: any) => {
      let total = 0
      items.forEach((item: any) => {
        const bid = bids.find(
          (b: any) =>
            b.temin_kalem_id === item.id &&
            (b.temin_firma_id === firm.temin_firma_id || b.temin_firma_id === firm.id)
        )
        if (bid && bid.birim_fiyat > 0) {
          total += bid.birim_fiyat * (item.miktar || 0)
        }
      })
      firm.total = total
    })

    const nonZeroTotals = fileFirms.filter((f) => f.total > 0)
    const lowestTotal =
      nonZeroTotals.length > 0 ? Math.min(...nonZeroTotals.map((f) => f.total)) : 0

    fileFirms.forEach((f) => {
      if (f.total > 0 && f.total === lowestTotal) {
        f.isWinner = true
        const formattedTotal = f.total.toLocaleString('tr-TR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })
        f.label = `🏆 ${f.unvan} (${formattedTotal} TL - En Düşük Teklif)`
      } else if (f.total > 0) {
        const formattedTotal = f.total.toLocaleString('tr-TR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })
        f.label = `🏢 ${f.unvan} (${formattedTotal} TL)`
      } else {
        f.label = `🏢 ${f.unvan}`
      }
    })

    const winnerFirmaId = (dosya as any)?.firma_id
    if (winnerFirmaId) {
      fileFirms.forEach((f) => {
        if (
          f.id === winnerFirmaId ||
          f.temin_firma_id === winnerFirmaId ||
          f.firma_id === winnerFirmaId
        ) {
          f.isWinner = true
          const formattedTotal =
            f.total > 0
              ? f.total.toLocaleString('tr-TR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })
              : ''
          f.label = formattedTotal
            ? `🏆 ${f.unvan} (${formattedTotal} TL - Kazanan Firma)`
            : `🏆 ${f.unvan} (Kazanan Firma)`
        } else {
          f.isWinner = false
        }
      })
    }

    fileFirms.sort((a, b) => (b.isWinner ? 1 : 0) - (a.isWinner ? 1 : 0))

    const combinedFirms = [...fileFirms]
    globalFirms.forEach((g: any) => {
      if (
        g.unvan &&
        !combinedFirms.some(
          (f: any) =>
            f.unvan && String(f.unvan).trim().toLowerCase() === String(g.unvan).trim().toLowerCase()
        )
      ) {
        combinedFirms.push(g)
      }
    })

    const winnerFirm =
      fileFirms.find((f: any) => f.isWinner) || fileFirms[0] || combinedFirms[0] || {}

    const ihtiyacKalemleri = items.map((kalem: any, idx: number) => {
      const miktarNum = Number(kalem.miktar || 0)
      let minPrice = Infinity
      let bestFirmName = ''

      const teklifler = fileFirms.map((firm: any) => {
        const bid = bids.find(
          (b: any) =>
            b.temin_kalem_id === kalem.id &&
            (b.temin_firma_id === firm.temin_firma_id || b.temin_firma_id === firm.id)
        )
        const priceNum = bid ? Number(bid.birim_fiyat || 0) : 0
        if (priceNum > 0 && priceNum < minPrice) {
          minPrice = priceNum
          bestFirmName = firm.unvan || ''
        }
        const formattedPrice =
          priceNum > 0
            ? priceNum.toLocaleString('tr-TR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })
            : ''
        const itemTotalNum = priceNum * miktarNum
        const formattedTutar =
          itemTotalNum > 0
            ? itemTotalNum.toLocaleString('tr-TR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })
            : ''

        return {
          firmaId: firm.id,
          firmaUnvan: firm.unvan,
          birimFiyat: priceNum,
          fiyat: formattedPrice,
          tutar: formattedTutar
        }
      })

      const validMinPrice = minPrice !== Infinity ? minPrice : 0
      const itemCostNum = validMinPrice * miktarNum

      return {
        ...kalem,
        siraNo: idx + 1,
        malzemeAdi: kalem.kalem_adi || '',
        ozelligi: kalem.aciklama || '',
        birimi: kalem.birim || '',
        miktar: miktarNum,
        enUygunFirmaAdi: bestFirmName,
        enDusukFiyat:
          validMinPrice > 0
            ? validMinPrice.toLocaleString('tr-TR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })
            : '-',
        toplamBedel:
          itemCostNum > 0
            ? itemCostNum.toLocaleString('tr-TR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })
            : '-',
        firmaTeklifleri: teklifler,
        firmaTeklifleriDetay: teklifler
      }
    })

    const firmaTotals = fileFirms.map((firm: any) => ({
      firmaId: firm.id,
      unvan: firm.unvan,
      toplam:
        firm.total > 0
          ? firm.total.toLocaleString('tr-TR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })
          : '0,00'
    }))

    let grandTotalNum = 0
    if (winnerFirm && winnerFirm.total > 0) {
      grandTotalNum = winnerFirm.total
    } else {
      grandTotalNum = ihtiyacKalemleri.reduce((sum: number, k: any) => {
        const raw = String(k.toplamBedel).replace(/\./g, '').replace(/,/g, '.')
        const n = parseFloat(raw)
        return sum + (isNaN(n) ? 0 : n)
      }, 0)
    }

    const formattedGrandTotal =
      grandTotalNum > 0
        ? grandTotalNum.toLocaleString('tr-TR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })
        : '0,00'

    let antetSatirlari: string[] = []
    if ((kurum as any)?.kurum_anteti) {
      try {
        const parsed = JSON.parse((kurum as any).kurum_anteti)
        if (Array.isArray(parsed)) {
          antetSatirlari = parsed.filter((s: string) => s && s.trim() !== '')
        }
      } catch {
        if (typeof (kurum as any).kurum_anteti === 'string' && (kurum as any).kurum_anteti.trim()) {
          antetSatirlari = (kurum as any).kurum_anteti
            .split('\n')
            .map((s: string) => s.trim())
            .filter(Boolean)
        }
      }
    }
    if (antetSatirlari.length === 0) {
      const kurumAdiText =
        (kurum as any)?.ust_kurum_adi ||
        (kurum as any)?.kurum_adi ||
        (kurum as any)?.ad ||
        settingsMap.institutionName ||
        'KAMU KURUMU'
      antetSatirlari = ['T.C.', String(kurumAdiText).toUpperCase()]
    }

    const birimAntet = (
      (dosya as any)?.antet_ek_satir ||
      (dosya as any)?.birim_antet_ek_satir ||
      (dosya as any)?.birim_tablo_adi ||
      (dosya as any)?.birim_adi ||
      (dosya as any)?.harcama_birimi ||
      settingsMap.spendingUnit ||
      ''
    ).trim()

    if (
      birimAntet &&
      !antetSatirlari.some((s: string) => s.trim().toUpperCase() === birimAntet.toUpperCase())
    ) {
      antetSatirlari.push(birimAntet)
    }

    const kurumAdi =
      (kurum as any)?.kurum_adi ||
      (kurum as any)?.ad ||
      settingsMap.institutionName ||
      'T.C. KAMU KURUMU'
    const harcamaBirimi =
      birimAntet ||
      (dosya as any)?.harcama_birimi ||
      settingsMap.spendingUnit ||
      (dosya as any)?.konu ||
      'HARCAMA BİRİMİ'

    const hazirlayanPersonel = (personelListesi as any[]).find(
      (p: any) => p.id === (dosya as any)?.hazirlayan_personel_id
    )
    const talepEdenPersonel = (personelListesi as any[]).find(
      (p: any) => p.id === (dosya as any)?.talep_eden_personel_id
    )
    const onaylayanPersonel = (personelListesi as any[]).find(
      (p: any) => p.id === (dosya as any)?.onay_personel_id
    )

    const ipcKurumBizim = getIpcKurumBizimText(kurum)
    const ipcIhtiyacYeri =
      (dosya as any)?.ihtiyac_yeri ||
      (dosya as any)?.ihtiyac_yeri_eki ||
      getIpcKurumIhtiyacYeri(kurum)

    let parsedPref: any = {}
    if (savedSnapshot) {
      try {
        parsedPref = typeof savedSnapshot === 'string' ? JSON.parse(savedSnapshot) : savedSnapshot
      } catch {}
    }

    const firstTutanak =
      Array.isArray(parsedPref?.kabulTutanaklari) && parsedPref.kabulTutanaklari.length > 0
        ? parsedPref.kabulTutanaklari[0]
        : null

    const resolvedFaturaNo = (dosya as any)?.fatura_no || firstTutanak?.faturaNo || ''
    const rawFaturaTarihi = (dosya as any)?.fatura_tarihi || firstTutanak?.faturaTarihi || ''
    const resolvedFaturaTarihi = rawFaturaTarihi ? formatTurkishDate(rawFaturaTarihi) : ''
    const resolvedIrsaliyeNo = firstTutanak?.irsaliyeNo || ''
    const rawIrsaliyeTarihi = firstTutanak?.irsaliyeTarihi || ''
    const resolvedIrsaliyeTarihi = rawIrsaliyeTarihi ? formatTurkishDate(rawIrsaliyeTarihi) : ''
    const resolvedTutanakNo = firstTutanak?.tutanakNo || (dosya as any)?.temin_no || ''
    const rawTutanakTarihi =
      firstTutanak?.tutanakTarihi ||
      (dosya as any)?.teslim_tarihi ||
      (dosya as any)?.temin_tarihi ||
      ''
    const resolvedTutanakTarihi = rawTutanakTarihi ? formatTurkishDate(rawTutanakTarihi) : ''

    const resolvedContext = {
      faturaNo: resolvedFaturaNo,
      fatura_no: resolvedFaturaNo,
      faturaTarihi: resolvedFaturaTarihi,
      fatura_tarihi: resolvedFaturaTarihi,
      irsaliyeNo: resolvedIrsaliyeNo,
      irsaliye_no: resolvedIrsaliyeNo,
      irsaliyeTarihi: resolvedIrsaliyeTarihi,
      irsaliye_tarihi: resolvedIrsaliyeTarihi,
      tutanakNo: resolvedTutanakNo,
      tutanak_no: resolvedTutanakNo,
      tutanakTarihi: resolvedTutanakTarihi,
      tutanak_tarihi: resolvedTutanakTarihi,
      kabulTarihi: resolvedTutanakTarihi,
      kabul_tarihi: resolvedTutanakTarihi,
      tutanakNotu: firstTutanak?.notlar || '',
      tutanak_notu: firstTutanak?.notlar || '',
      kurumAdi,
      harcamaBirimi,
      kurumumuz: ipcKurumBizim,
      altKurumBizim: ipcKurumBizim,
      ihtiyacYeri: ipcIhtiyacYeri,
      birimAdi: birimAntet,
      birimAnteti: birimAntet,
      antetEkSatir: birimAntet,
      antetSatirlari,
      hazirlayanPersonelAdi: hazirlayanPersonel?.ad_soyad || '',
      hazirlayanPersonelUnvan: hazirlayanPersonel?.unvan || '',
      hazirlayanTelefon: hazirlayanPersonel?.telefon || '',
      talepEdenPersonelAdi: talepEdenPersonel?.ad_soyad || '',
      talepEdenPersonelUnvan: talepEdenPersonel?.unvan || '',
      talepEdenTelefon: talepEdenPersonel?.telefon || '',
      onaylayanPersonelAdi: onaylayanPersonel?.ad_soyad || '',
      onaylayanPersonelUnvan: onaylayanPersonel?.unvan || '',
      harcamaYetkilisiAdi:
        onaylayanPersonel?.ad_soyad ||
        ((birimListesi as any[]).find((b: any) => b.id === (dosya as any)?.birim_id)?.harcama_yetkilisi_id
          ? (personelListesi as any[]).find(
              (p: any) =>
                p.id ===
                (birimListesi as any[]).find((b: any) => b.id === (dosya as any)?.birim_id)
                  ?.harcama_yetkilisi_id
            )?.ad_soyad || ''
          : ''),
      harcamaYetkilisiUnvan:
        onaylayanPersonel?.unvan ||
        (birimListesi as any[]).find((b: any) => b.id === (dosya as any)?.birim_id)
          ?.harcama_yetkilisi_unvan ||
        'Harcama Yetkilisi',
      muhatapBirim:
        (birimListesi as any[]).find((b: any) => b.id === (dosya as any)?.birim_id)?.sunum_makami ||
        (birimListesi as any[]).find((b: any) => b.id === (dosya as any)?.birim_id)?.birim_adi ||
        'STRATEJİ GELİŞTİRME DAİRE BAŞKANLIĞINA',
      sunumMakami:
        (birimListesi as any[]).find((b: any) => b.id === (dosya as any)?.birim_id)?.sunum_makami ||
        (birimListesi as any[]).find((b: any) => b.id === (dosya as any)?.birim_id)?.birim_adi ||
        'STRATEJİ GELİŞTİRME DAİRE BAŞKANLIĞINA',
      antetSatir1: antetSatirlari[0] || '',
      antetSatir2: antetSatirlari[1] || '',
      antetSatir3: antetSatirlari[2] || '',
      antetSatir4: antetSatirlari[3] || '',
      ustKurumAdi: (kurum as any)?.ust_kurum_adi || '',
      detsisKodu:
        (kurum as any)?.detsis_kodu || (kurum as any)?.dtvt_kodu || settingsMap.detsisKodu || '',
      eButceKodu: (kurum as any)?.ebutce_kodu || settingsMap.eButceKodu || '',
      say2000iKodu: (kurum as any)?.say2000i_kodu || settingsMap.say2000iKodu || '',
      fonksiyonelKod: (kurum as any)?.fonksiyonel_kod || settingsMap.fonksiyonelKod || '',
      muhasebeBirimKodu:
        (kurum as any)?.muhasebe_birim_kodu ||
        (dosya as any)?.muhasebe_kodu ||
        settingsMap.muhasebeBirimKodu ||
        '',
      muhasebeBirimAdi: (kurum as any)?.muhasebe_birim_adi || settingsMap.muhasebeBirimAdi || '',
      harcamaBirimKodu:
        (kurum as any)?.harcama_birim_kodu ||
        (dosya as any)?.harcama_birim_kodu ||
        settingsMap.harcamaBirimKodu ||
        '',
      harcamaBirimAdi: (kurum as any)?.harcama_birim_adi || settingsMap.harcamaBirimAdi || '',
      kurumAdresi: (kurum as any)?.adres || settingsMap.address || '',
      kurumIl: (kurum as any)?.il || settingsMap.city || '',
      kurumIlce: (kurum as any)?.ilce || settingsMap.district || '',
      kurumTelefon: (kurum as any)?.telefon || settingsMap.phone || '',
      kurumEposta: (kurum as any)?.eposta || settingsMap.email || '',
      kurumWeb: (kurum as any)?.web_sitesi || settingsMap.website || '',
      limitType: (kurum as any)?.limit_tipi || settingsMap.limitType || 'diger',
      finansmanKodu: (kurum as any)?.finansman_kodu || settingsMap.finansmanKodu || '5',
      odenekTertibi: (dosya as any)?.odenek_tertibi || '',
      butceTertibi: (dosya as any)?.odenek_tertibi || '',
      kullanilabilirOdenek: (dosya as any)?.kullanilabilir_odenek
        ? String((dosya as any).kullanilabilir_odenek)
        : '',
      butceYili:
        (dosya as any)?.butce_yili ||
        (dosya as any)?.butce_yili_str ||
        new Date().getFullYear().toString(),
      odenekKalemi: (dosya as any)?.odenek_kalemi || '',
      butceGerekce: (dosya as any)?.butce_gerekce || '',
      solLogo,
      sagLogo,
      dosyaNo: (dosya as any)?.temin_no || '',
      konu: (dosya as any)?.konu || '',
      isinAdi: (dosya as any)?.konu || '',
      isinTanimi: (dosya as any)?.isin_aciklamasi || (dosya as any)?.konu || '',
      yaklasikMaliyet: (dosya as any)?.yaklasik_maliyet
        ? Number((dosya as any).yaklasik_maliyet).toLocaleString('tr-TR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })
        : formattedGrandTotal,
      genelToplam: formattedGrandTotal,
      yukleniciFirma: winnerFirm.unvan || '',
      yukleniciYetkili: winnerFirm.yetkili_ad_soyad || '',
      yukleniciAdresi: winnerFirm.adres || '',
      yukleniciIlce: winnerFirm.ilce || '',
      yukleniciIl: winnerFirm.il || '',
      teslimGun:
        (dosya as any)?.teslim_gun !== undefined &&
        (dosya as any)?.teslim_gun !== null &&
        String((dosya as any).teslim_gun).trim() !== ''
          ? String((dosya as any).teslim_gun)
          : '7',
      teslimGunu:
        (dosya as any)?.teslim_gun !== undefined &&
        (dosya as any)?.teslim_gun !== null &&
        String((dosya as any).teslim_gun).trim() !== ''
          ? String((dosya as any).teslim_gun)
          : '7',
      teslimTarihi: (dosya as any)?.teslim_tarihi || '',
      dosyaAcilisTarihi: formatTurkishDate(
        (dosya as any)?.dosya_acilis_tarihi || (dosya as any)?.tarih || (dosya as any)?.created_at
      ),
      acilisTarihi: formatTurkishDate(
        (dosya as any)?.dosya_acilis_tarihi || (dosya as any)?.tarih || (dosya as any)?.created_at
      ),
      dosyaTarihi: formatTurkishDate(
        (dosya as any)?.dosya_acilis_tarihi || (dosya as any)?.tarih || (dosya as any)?.created_at
      ),
      onayaSunulanTarih: formatTurkishDate(
        (dosya as any)?.temin_tarihi ||
          (dosya as any)?.dosya_acilis_tarihi ||
          (dosya as any)?.tarih ||
          (dosya as any)?.created_at
      ),
      onayTarihi: formatTurkishDate(
        (dosya as any)?.onay_tarihi || (dosya as any)?.dosya_acilis_tarihi || (dosya as any)?.tarih
      ),
      tarih: formatTurkishDate(
        (dosya as any)?.dosya_acilis_tarihi || (dosya as any)?.tarih || (dosya as any)?.created_at
      ),
      evrakSayisi: (dosya as any)?.evrak_sayisi || (dosya as any)?.temin_no || '',
      ihtiyacKalemleri,
      firmaListesi: combinedFirms,
      firmalar: fileFirms,
      firmaToplamlari: firmaTotals,
      firmaToplamlariDetay: firmaTotals,
      komisyon: (() => {
        const eligible = komisyonlar.filter((k: any) => isMemberVisibleInDocument(k, documentId))
        const mapped = eligible.map((k: any) => ({
          adSoyad: k.resolved_ad_soyad || k.ad_soyad || '',
          unvan: k.resolved_unvan || k.unvan || '',
          gorevi: k.gorev || k.gorevi || 'Üye',
          pozisyonu: k.resolved_unvan || k.unvan || ''
        }))
        const seen = new Set<string>()
        return mapped.filter((item: any) => {
          const name = (item.adSoyad || '').trim().toLowerCase()
          if (!name || seen.has(name)) return false
          seen.add(name)
          return true
        })
      })(),
      fiyatKomisyonu: (() => {
        const eligible = komisyonlar.filter((k: any) => isMemberVisibleInDocument(k, documentId))
        const mapped = eligible.map((k: any) => ({
          adSoyad: k.resolved_ad_soyad || k.ad_soyad || '',
          unvan: k.resolved_unvan || k.unvan || '',
          gorevi: k.gorev || k.gorevi || 'Üye',
          pozisyonu: k.resolved_unvan || k.unvan || ''
        }))
        const seen = new Set<string>()
        return mapped.filter((item: any) => {
          const name = (item.adSoyad || '').trim().toLowerCase()
          if (!name || seen.has(name)) return false
          seen.add(name)
          return true
        })
      })(),
      muayeneKomisyonu: (() => {
        const eligible = komisyonlar.filter((k: any) => isMemberVisibleInDocument(k, documentId))
        const mapped = eligible.map((k: any) => ({
          adSoyad: k.resolved_ad_soyad || k.ad_soyad || '',
          unvan: k.resolved_unvan || k.unvan || '',
          gorevi: k.gorev || k.gorevi || 'Üye',
          pozisyonu: k.resolved_unvan || k.unvan || ''
        }))
        const seen = new Set<string>()
        return mapped.filter((item: any) => {
          const name = (item.adSoyad || '').trim().toLowerCase()
          if (!name || seen.has(name)) return false
          seen.add(name)
          return true
        })
      })()
    }

    return {
      success: true,
      data: {
        dosya,
        kurum,
        solLogo,
        sagLogo,
        settings: settingsMap,
        personelListesi,
        birimListesi,
        firmaListesi: combinedFirms,
        fileFirms,
        items,
        bids,
        komisyonlar,
        savedSnapshot,
        resolvedContext
      }
    }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

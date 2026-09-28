import Mustache from 'mustache'
import { numberToTurkishWords, readSystemTemplate } from './documentUtils'

export function resolveAllCiktiData(
  db: any,
  payload: { dosyaId?: number }
): { success: boolean; data?: any; error?: string } {
  try {
    const dosyaId = Number(payload?.dosyaId || 0)

    // 1. Master HTML & Master JSON
    const masterHtml =
      readSystemTemplate('master.html') ||
      '<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body>{{{content}}}</body></html>'
    let masterJson: any = {}
    const rawMasterJson = readSystemTemplate('master.html.json')
    if (rawMasterJson) {
      try {
        masterJson = JSON.parse(rawMasterJson)
      } catch {}
    }

    // 2. Templates (Latest active templates)
    const sablons = db
      .prepare(
        'SELECT * FROM TANIM_Sablon WHERE id IN (SELECT MAX(id) FROM TANIM_Sablon WHERE aktif_mi = 1 GROUP BY COALESCE(parent_id, id)) ORDER BY kategori ASC, ad ASC'
      )
      .all()

    // 3. Placeholders
    let placeholders: any[] = []
    try {
      placeholders = db.prepare('SELECT * FROM TANIM_Placeholder').all()
    } catch {}

    // 4. Personnel
    const personelListesi = db
      .prepare(
        'SELECT id, ad_soyad, unvan, telefon, eposta, birim, sicil_no FROM TANIM_Personel WHERE COALESCE(aktif_mi, 1) = 1 OR aktif_mi = "1" OR aktif_mi = "true" OR aktif_mi IS NULL ORDER BY ad_soyad ASC'
      )
      .all()

    // 5. Institution & Settings
    const kurum = db.prepare('SELECT * FROM TANIM_Kurum LIMIT 1').get() || {}
    const settingsMap: Record<string, string> = {}
    try {
      const settingsRows = db.prepare('SELECT key, value FROM settings').all()
      settingsRows.forEach((r: any) => {
        if (r.key) settingsMap[r.key] = r.value
      })
    } catch {}

    const solLogo =
      (kurum as any)?.logo_sol ||
      (kurum as any)?.logo_url ||
      settingsMap.logoLeft ||
      settingsMap.institutionLogo ||
      null
    const sagLogo = (kurum as any)?.logo_sag || settingsMap.logoRight || null

    let activeDosya: any = null
    let items: any[] = []
    let fileFirms: any[] = []
    let bids: any[] = []
    let komisyonlar: any[] = []

    if (dosyaId) {
      activeDosya =
        db
          .prepare(
            `
      SELECT d.*, 
             b.antet_ek_satir as birim_antet_ek_satir,
             b.birim_adi as birim_tablo_adi,
             b.harcama_kodu as harcama_birim_kodu,
             b.muhasebe_kodu,
             p.ad_soyad as onaylayan_ad_soyad, p.unvan as onaylayan_unvan, p.telefon as onaylayan_telefon,
             h.ad_soyad as hazirlayan_ad_soyad, h.unvan as hazirlayan_unvan,
             h.telefon as hazirlayan_telefon, h.eposta as hazirlayan_eposta,
             te.ad_soyad as talep_eden_ad_soyad, te.unvan as talep_eden_unvan, te.telefon as talep_eden_telefon,
             su.ad_soyad as sunan_ad_soyad, su.unvan as sunan_unvan, su.telefon as sunan_telefon,
             iy.ad_soyad as irtibat_ad_soyad, iy.unvan as irtibat_unvan, iy.telefon as irtibat_telefon,
             f.unvan as yuklenici_firma_adi,
             f.adres as yuklenici_firma_adresi,
             f.ilce as yuklenici_firma_ilcesi,
             f.il as yuklenici_firma_ili,
             f.telefon as yuklenici_firma_telefon,
             f.faks as yuklenici_firma_faks,
             f.email as yuklenici_firma_email,
             f.vergi_dairesi as yuklenici_firma_vergi_dairesi,
             f.vergi_no as yuklenici_firma_vergi_no
      FROM DATA_TeminDosyasi d 
      LEFT JOIN TANIM_Birim b ON d.birim_id = b.id
      LEFT JOIN TANIM_Personel p ON d.onay_personel_id = p.id 
      LEFT JOIN TANIM_Personel h ON d.hazirlayan_personel_id = h.id
      LEFT JOIN TANIM_Personel te ON d.talep_eden_personel_id = te.id
      LEFT JOIN TANIM_Personel su ON d.sunan_personel_id = su.id
      LEFT JOIN TANIM_Personel iy ON d.irtibat_yetkilisi_id = iy.id
      LEFT JOIN TANIM_Firma f ON d.firma_id = f.id
      WHERE d.id = ?
    `
          )
          .get(dosyaId) || null

      items = db
        .prepare('SELECT * FROM DATA_TeminKalem WHERE temin_dosya_id = ? ORDER BY id ASC')
        .all(dosyaId)

      fileFirms = db
        .prepare(
          `
      SELECT 
        df.id as temin_firma_id,
        COALESCE(f.id, df.firma_id, df.id) as id,
        COALESCE(NULLIF(df.unvan, ''), NULLIF(f.unvan, ''), 'İstekli Firma') as unvan,
        COALESCE(NULLIF(df.ilgili_kisi, ''), NULLIF(f.ilgili_adi, '')) as yetkili_ad_soyad,
        COALESCE(NULLIF(f.telefon, ''), NULLIF(df.telefon, '')) as telefon,
        COALESCE(NULLIF(f.email, ''), NULLIF(df.email, '')) as eposta,
        f.adres as adres,
        COALESCE(NULLIF(df.vergi_no, ''), NULLIF(f.vergi_no, '')) as vergi_no,
        f.vergi_dairesi as vergi_dairesi
      FROM DATA_TeminFirma df
      LEFT JOIN TANIM_Firma f ON df.firma_id = f.id
      WHERE df.temin_dosya_id = ?
      ORDER BY df.id ASC
    `
        )
        .all(dosyaId)

      bids = db
        .prepare(
          'SELECT temin_kalem_id, temin_firma_id, birim_fiyat FROM DATA_TeminKalemTeklif WHERE temin_dosya_id = ?'
        )
        .all(dosyaId)

      komisyonlar = db
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
    }

    if (!komisyonlar || komisyonlar.length === 0) {
      try {
        komisyonlar = db
          .prepare(
            `
        SELECT u.*, 
               p.ad_soyad as resolved_ad_soyad, 
               p.unvan as resolved_unvan, 
               COALESCE(g.ad, 'Üye') as gorevi,
               k.ad as komisyon_turu_adi
        FROM TANIM_KomisyonUye u
        JOIN TANIM_Komisyon k ON u.komisyon_id = k.id
        LEFT JOIN TANIM_Personel p ON u.personel_id = p.id
        LEFT JOIN TANIM_KomisyonGorevi g ON u.gorev_id = g.id
        WHERE (k.aktif_mi = 1 OR k.aktif_mi IS NULL)
      `
          )
          .all()
      } catch {}
    }

    // Build Bids Map
    const bidsMap: Record<string, number> = {}
    bids.forEach((b: any) => {
      bidsMap[`${b.temin_kalem_id}_${b.temin_firma_id}`] = b.birim_fiyat || 0
    })

    // Calculate Bid Totals per Firm
    const firmaTotals: Record<number, { unvan: string; total: number; formatted: string }> = {}
    fileFirms.forEach((f: any) => {
      let fTotal = 0
      items.forEach((item: any) => {
        const unitP = bidsMap[`${item.id}_${f.temin_firma_id}`] || 0
        const qty = Number(item.miktar || 0)
        fTotal += unitP * qty
      })
      firmaTotals[f.temin_firma_id] = {
        unvan: f.unvan,
        total: fTotal,
        formatted: fTotal.toLocaleString('tr-TR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })
      }
    })

    // Find Best / Winning Firm
    let minFirmaTotal = Infinity
    let winnerFirm: any = {
      unvan: activeDosya?.yuklenici_firma_adi || '',
      yetkili_ad_soyad: ''
    }
    fileFirms.forEach((f: any) => {
      const t = firmaTotals[f.temin_firma_id]?.total || 0
      if (t > 0 && t < minFirmaTotal) {
        minFirmaTotal = t
        winnerFirm = f
      }
    })
    if (!winnerFirm.unvan && activeDosya?.yuklenici_firma_adi) {
      winnerFirm.unvan = activeDosya.yuklenici_firma_adi
    }

    // Build items with bidder columns
    const ihtiyacKalemleri = items.map((item: any, idx: number) => {
      const miktarNum = Number(item.miktar || 0)
      const itemBids: {
        firmaId: number
        firmaAdi: string
        birimFiyat: number
        toplamFiyat: number
      }[] = []
      let minPrice = Infinity
      let bestFirm = ''

      fileFirms.forEach((f: any) => {
        const unitPrice = bidsMap[`${item.id}_${f.temin_firma_id}`] || 0
        const lineTotal = unitPrice * miktarNum
        if (unitPrice > 0 && unitPrice < minPrice) {
          minPrice = unitPrice
          bestFirm = f.unvan
        }
        itemBids.push({
          firmaId: f.temin_firma_id,
          firmaAdi: f.unvan,
          birimFiyat: unitPrice,
          toplamFiyat: lineTotal
        })
      })

      const resItem: any = {
        siraNo: idx + 1,
        id: item.id,
        kalemAdi: item.kalem_adi || item.malzeme_adi || '',
        malzemeAdi: item.kalem_adi || item.malzeme_adi || '',
        aciklama: item.aciklama || '',
        birim: item.birim || 'Adet',
        miktar: miktarNum,
        miktarFormatted: miktarNum.toLocaleString('tr-TR'),
        tasinirKodu: item.tasinir_kodu || '',
        kdvOrani: item.kdv_orani ?? 20,
        teklifler: itemBids,
        enUygunFiyat:
          minPrice !== Infinity
            ? minPrice.toLocaleString('tr-TR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })
            : '',
        enUygunFirma: bestFirm,
        birimFiyat:
          minPrice !== Infinity
            ? minPrice.toLocaleString('tr-TR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })
            : '0,00',
        toplamBedel:
          minPrice !== Infinity
            ? (minPrice * miktarNum).toLocaleString('tr-TR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })
            : '0,00'
      }

      // Dynamic columns firma1Fiyat, firma2Fiyat, etc.
      fileFirms.forEach((f: any, fIdx: number) => {
        const unitP = bidsMap[`${item.id}_${f.temin_firma_id}`] || 0
        const totalP = unitP * miktarNum
        resItem[`firma${fIdx + 1}Fiyat`] =
          unitP > 0
            ? unitP.toLocaleString('tr-TR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })
            : '-'
        resItem[`firma${fIdx + 1}Toplam`] =
          totalP > 0
            ? totalP.toLocaleString('tr-TR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })
            : '-'
      })

      return resItem
    })

    // Grand Total
    let grandTotalNum = activeDosya?.yaklasik_maliyet ? Number(activeDosya.yaklasik_maliyet) : 0
    if (!grandTotalNum && minFirmaTotal !== Infinity && minFirmaTotal > 0) {
      grandTotalNum = minFirmaTotal
    }
    if (!grandTotalNum) {
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
        if (
          typeof (kurum as any).kurum_anteti === 'string' &&
          (kurum as any).kurum_anteti.trim()
        ) {
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
      activeDosya?.antet_ek_satir ||
      activeDosya?.birim_antet_ek_satir ||
      activeDosya?.birim_tablo_adi ||
      activeDosya?.birim_adi ||
      activeDosya?.harcama_birimi ||
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
      activeDosya?.harcama_birimi ||
      settingsMap.spendingUnit ||
      activeDosya?.konu ||
      'HARCAMA BİRİMİ'

    const dosyaContext: any = {
      ...masterJson,
      kurumAdi,
      harcamaBirimi,
      birimAdi: birimAntet,
      birimAnteti: birimAntet,
      antetEkSatir: birimAntet,
      antetSatirlari,
      antetSatir1: antetSatirlari[0] || '',
      antetSatir2: antetSatirlari[1] || '',
      antetSatir3: antetSatirlari[2] || '',
      antetSatir4: antetSatirlari[3] || '',
      solLogo,
      sagLogo,
      id: activeDosya?.id || 0,
      dosyaNo: activeDosya?.temin_no || '',
      teminNo: activeDosya?.temin_no || '',
      dosya_no: activeDosya?.temin_no || '',
      konu: activeDosya?.konu || '',
      is_adi: activeDosya?.konu || '',
      isinAdi: activeDosya?.konu || '',
      isinTanimi: activeDosya?.isin_aciklamasi || activeDosya?.konu || '',
      isin_tanimi: activeDosya?.isin_aciklamasi || activeDosya?.konu || '',
      butceYili: activeDosya?.butce_yili || new Date().getFullYear().toString(),
      butce_yili: activeDosya?.butce_yili || new Date().getFullYear().toString(),
      tarih: activeDosya?.tarih || new Date().toLocaleDateString('tr-TR'),
      dosyaTarihi: activeDosya?.tarih || new Date().toLocaleDateString('tr-TR'),
      kararNo: activeDosya?.karar_no || '',
      karar_no: activeDosya?.karar_no || '',
      faturaNo: activeDosya?.fatura_no || '',
      fatura_no: activeDosya?.fatura_no || '',
      faturaTarihi: activeDosya?.fatura_tarihi || '',
      fatura_tarihi: activeDosya?.fatura_tarihi || '',
      yaklasikMaliyet: activeDosya?.yaklasik_maliyet
        ? Number(activeDosya.yaklasik_maliyet).toLocaleString('tr-TR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })
        : formattedGrandTotal,
      yaklasik_maliyet: formattedGrandTotal,
      yaklasik_maliyet_yaziyla: numberToTurkishWords(grandTotalNum),
      kdv_haric_toplam_yaziyla: numberToTurkishWords(grandTotalNum),
      genelToplam: formattedGrandTotal,
      genel_toplam_yaziyla: numberToTurkishWords(grandTotalNum),
      yukleniciFirma: winnerFirm.unvan || '',
      yukleniciYetkili: winnerFirm.yetkili_ad_soyad || '',
      yukleniciAdresi: winnerFirm.adres || activeDosya?.yuklenici_firma_adresi || '',
      yukleniciVergiNo: winnerFirm.vergi_no || activeDosya?.yuklenici_firma_vergi_no || '',
      yukleniciVergiDairesi:
        winnerFirm.vergi_dairesi || activeDosya?.yuklenici_firma_vergi_dairesi || '',
      ihtiyacKalemleri,
      kalemler: ihtiyacKalemleri,
      firmalar: fileFirms,
      firmaListesi: fileFirms,
      firmaToplamlari: Object.values(firmaTotals),
      firmaToplamlariDetay: firmaTotals,
      harcamaYetkilisi: {
        adSoyad: activeDosya?.onaylayan_ad_soyad || '',
        unvan: activeDosya?.onaylayan_unvan || 'Harcama Yetkilisi',
        telefon: activeDosya?.onaylayan_telefon || ''
      },
      gerceklestirmeGorevlisi: {
        adSoyad: activeDosya?.hazirlayan_ad_soyad || '',
        unvan: activeDosya?.hazirlayan_unvan || 'Gerçekleştirme Görevlisi',
        telefon: activeDosya?.hazirlayan_telefon || ''
      },
      komisyon: komisyonlar.map((k: any) => ({
        adSoyad: k.resolved_ad_soyad || k.ad_soyad || '',
        unvan: k.resolved_unvan || k.unvan || '',
        gorevi: k.gorevi || 'Üye',
        komisyonTuru: k.komisyon_turu_adi || ''
      }))
    }

    // Pre-render HTML map using Mustache on server side for every active template
    const renderedHtmlMap: Record<number, string> = {}
    sablons.forEach((sab: any) => {
      try {
        let body = sab.html_icerik || ''
        if (!body && sab.dosya_adi) {
          body = readSystemTemplate(sab.dosya_adi) || ''
        }
        if (body) {
          const innerHtml = Mustache.render(body, dosyaContext)
          const fullHtml = masterHtml
            ? masterHtml.replace('{{{content}}}', innerHtml)
            : innerHtml
          renderedHtmlMap[sab.id] = fullHtml
        }
      } catch {}
    })

    return {
      success: true,
      data: {
        sablons,
        masterHtml,
        dosyaContext,
        renderedHtmlMap,
        placeholders,
        personelListesi,
        settings: settingsMap,
        activeDosya
      }
    }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

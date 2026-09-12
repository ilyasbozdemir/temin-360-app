import { ProcessMapping, TableColumnMapping } from './types';

/**
 * Resolves official E-DETSIS formatted document number e.g. E-10234521-934.01-0001
 */
export async function resolveEvrakSayisi(
  activeDosyaId: number,
  queryExecutor: (sql: string, params: any[]) => Promise<any[]>
): Promise<string> {
  try {
    let detsisNo = '';

    // 1. Fetch detsis_kodu from TANIM_Kurum
    const kurumRes = await queryExecutor('SELECT detsis_kodu FROM TANIM_Kurum LIMIT 1', []);
    if (kurumRes?.[0]?.detsis_kodu) {
      detsisNo = kurumRes[0].detsis_kodu;
    }

    // 2. Fallback to TANIM_Ayar (detsisKodu / detsis_kodu)
    if (!detsisNo) {
      const ayarRes = await queryExecutor(
        'SELECT deger FROM TANIM_Ayar WHERE anahtar IN ("detsisKodu", "detsis_kodu") LIMIT 1',
        []
      );
      if (ayarRes?.[0]?.deger) {
        detsisNo = ayarRes[0].deger;
      }
    }

    if (!detsisNo) {
      detsisNo = '0000000000';
    }

    const dosyaRes = await queryExecutor(
      'SELECT temin_no, tur FROM DATA_TeminDosyasi WHERE id = ? LIMIT 1',
      [activeDosyaId]
    );

    const dosyaSayisi = dosyaRes?.[0]?.temin_no || '';
    const rawTur = (dosyaRes?.[0]?.tur || 'mal').toLowerCase();

    let sdpAltKodu = '01';
    if (rawTur.includes('hizmet') || rawTur.includes('danismanlik')) {
      sdpAltKodu = '02';
    } else if (rawTur.includes('yapim')) {
      sdpAltKodu = '03';
    } else {
      sdpAltKodu = '01';
    }
    const sdpKodu = `934.${sdpAltKodu}`;

    let formattedEvrakSayisi = 'E-10234521-934.01-0001';
    if (dosyaSayisi) {
      const rawNumberStr = dosyaSayisi.includes('/')
        ? dosyaSayisi.split('/').pop()
        : dosyaSayisi.includes('-')
        ? dosyaSayisi.split('-').pop()
        : dosyaSayisi;
      const cleanSayi = String(rawNumberStr || '').replace(/\D/g, '') || '1';
      const paddedSayi = cleanSayi.padStart(4, '0');

      formattedEvrakSayisi = `E-${detsisNo}-${sdpKodu}-${paddedSayi}`;
    } else {
      formattedEvrakSayisi = `E-${detsisNo}-${sdpKodu}-0001`;
    }

    return formattedEvrakSayisi;
  } catch (err) {
    return 'E-10234521-934.01-0001';
  }
}

/**
 * Resolves institution header lines by combining TANIM_Kurum.kurum_anteti and DATA_TeminDosyasi.antet_ek_satir
 */
export async function resolveAntetSatirlari(
  activeDosyaId: number,
  queryExecutor: (sql: string, params: any[]) => Promise<any[]>
): Promise<string[]> {
  try {
    let result: string[] = [];

    // 1. Fetch kurum_anteti or individual institution columns from TANIM_Kurum
    const kurumRes = await queryExecutor(
      'SELECT kurum_anteti, ust_kurum_adi, kurum_adi FROM TANIM_Kurum LIMIT 1',
      []
    );

    if (kurumRes && kurumRes.length > 0) {
      const row = kurumRes[0];
      if (row.kurum_anteti) {
        try {
          const parsed = JSON.parse(row.kurum_anteti);
          if (Array.isArray(parsed) && parsed.filter(Boolean).length > 0) {
            result = parsed.filter((s: string) => s && s.trim() !== '');
          }
        } catch {
          if (typeof row.kurum_anteti === 'string' && row.kurum_anteti.trim()) {
            result = row.kurum_anteti.split('\n').map((s: string) => s.trim()).filter(Boolean);
          }
        }
      }

      // If kurum_anteti column was empty or array of empty strings, build from row fields
      if (result.length === 0) {
        const built: string[] = ['T.C.'];
        if (row.ust_kurum_adi && row.ust_kurum_adi.trim()) built.push(row.ust_kurum_adi.toUpperCase());
        if (row.kurum_adi && row.kurum_adi.trim()) built.push(row.kurum_adi.toUpperCase());

        let birimAdi = '';
        if (activeDosyaId) {
          try {
            const birimRes = await queryExecutor(
              'SELECT b.birim_adi FROM DATA_TeminDosyasi d LEFT JOIN TANIM_Birim b ON d.birim_id = b.id WHERE d.id = ? LIMIT 1',
              [activeDosyaId]
            );
            if (birimRes && birimRes.length > 0 && birimRes[0].birim_adi) {
              birimAdi = birimRes[0].birim_adi.trim();
            }
          } catch (e) {}
        }
        if (birimAdi) built.push(birimAdi);

        if (built.length > 1) {
          result = built;
        }
      }
    }

    // 2. Fallback to settings (institutionLetterhead or institutionName) if TANIM_Kurum has no antet
    if (result.length === 0) {
      try {
        const ayarRes = await queryExecutor(
          'SELECT key, value FROM settings WHERE key IN ("institutionLetterhead", "institutionName", "parentInstitution")',
          []
        );
        if (ayarRes && Array.isArray(ayarRes)) {
          const ayarMap: Record<string, string> = {};
          ayarRes.forEach((item: any) => {
            ayarMap[item.key] = item.value;
          });

          if (ayarMap.institutionLetterhead) {
            try {
              const parsed = JSON.parse(ayarMap.institutionLetterhead);
              if (Array.isArray(parsed) && parsed.filter(Boolean).length > 0) {
                result = parsed.filter((s: string) => s && s.trim() !== '');
              }
            } catch {}
          }

          if (result.length === 0) {
            const built: string[] = ['T.C.'];
            if (ayarMap.parentInstitution && ayarMap.parentInstitution.trim()) built.push(ayarMap.parentInstitution.toUpperCase());
            if (ayarMap.institutionName && ayarMap.institutionName.trim()) built.push(ayarMap.institutionName.toUpperCase());
            if (built.length > 1) result = built;
          }
        }
      } catch (e) {}
    }

    // 3. Fallback to clean T.C. if TANIM_Kurum and settings had no header lines
    if (result.length === 0) {
      result = ['T.C.'];
    }

    // 4. Fetch antet_ek_satir or birim antet from DATA_TeminDosyasi & TANIM_Birim
    if (activeDosyaId) {
      try {
        const birimRes = await queryExecutor(
          `SELECT d.antet_ek_satir as dosya_antet, 
                  b.antet_ek_satir as birim_antet, 
                  b.birim_adi, 
                  d.harcama_birimi
           FROM DATA_TeminDosyasi d 
           LEFT JOIN TANIM_Birim b ON d.birim_id = b.id 
           WHERE d.id = ? LIMIT 1`,
          [activeDosyaId]
        );
        if (birimRes && birimRes.length > 0) {
          const row = birimRes[0];
          const ekSatir = (
            row.dosya_antet ||
            row.birim_antet ||
            row.birim_adi ||
            row.harcama_birimi ||
            ''
          ).trim();
          if (
            ekSatir &&
            !result.some((s: string) => s.trim().toUpperCase() === ekSatir.toUpperCase())
          ) {
            result.push(ekSatir);
          }
        }
      } catch (e) {
        console.error('Birim antet ek satırı çözümlenirken hata:', e);
      }
    }

    return result;
  } catch (err) {
    console.error('Antet satırları çözümlenirken hata:', err);
  }
  return ['T.C.'];
}

/**
 * Formats any date string (ISO or YYYY-MM-DD) into Turkish DD.MM.YYYY format
 */
export function formatDateTR(dateVal: any): string {
  if (!dateVal) return '';
  const str = String(dateVal).trim();

  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    const parts = str.split('T')[0].split('-');
    if (parts.length === 3) {
      const [y, m, d] = parts;
      return `${d}.${m}.${y}`;
    }
  }

  if (/^\d{2}\.\d{2}\.\d{4}/.test(str)) {
    return str;
  }

  try {
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}.${month}.${year}`;
    }
  } catch {
    // Ignore
  }

  return str;
}

/**
 * Resolves all variables in a ProcessMapping using database query execution.
 */
export async function resolveTemplateData(
  mapping: ProcessMapping,
  activeDosyaId: number,
  rawQueryExecutor: (sql: string, params: any[]) => Promise<any[]>
): Promise<Record<string, any>> {
  const queryCache = new Map<string, Promise<any[]>>();
  const queryExecutor = (sql: string, params: any[]): Promise<any[]> => {
    const key = `${sql}__${JSON.stringify(params)}`;
    if (!queryCache.has(key)) {
      queryCache.set(key, rawQueryExecutor(sql, params));
    }
    return queryCache.get(key)!;
  };

  // Pre-fetch main tables in parallel
  if (activeDosyaId) {
    queryExecutor('SELECT * FROM DATA_TeminDosyasi WHERE id = ? LIMIT 1', [activeDosyaId]);
    queryExecutor('SELECT * FROM DATA_TeminKalem WHERE temin_dosya_id = ?', [activeDosyaId]);
    queryExecutor('SELECT * FROM TANIM_Kurum LIMIT 1', []);
  }

  const resolvedPayload: Record<string, any> = {};

  for (const [sablonDegiskeni, rule] of Object.entries(mapping)) {
    // 0. Automatic official evrakSayisi formatting (E-DETSIS-SDP-0001)
    if (sablonDegiskeni === 'evrakSayisi' && rule.deger === undefined) {
      resolvedPayload['evrakSayisi'] = await resolveEvrakSayisi(activeDosyaId, queryExecutor);
      continue;
    }

    // 0.b Automatic institution antet lines formatting
    if (sablonDegiskeni === 'antetSatirlari' && !rule.deger) {
      resolvedPayload['antetSatirlari'] = await resolveAntetSatirlari(activeDosyaId, queryExecutor);
      continue;
    }
    // 1. Static value
    if (rule.deger !== undefined) {
      resolvedPayload[sablonDegiskeni] = rule.deger;
      continue;
    }

    // 2. Formula value
    if (rule.formul) {
      resolvedPayload[sablonDegiskeni] = await resolveFormula(rule.formul, activeDosyaId, queryExecutor);
      continue;
    }

    // 3. Array of objects (e.g. ihtiyacKalemleri)
    if (rule.tablo && rule.sutun === '*' && rule.altEslestirme && rule.iliskili_id) {
      try {
        let rows: any[] = [];
        if (rule.tablo === 'DATA_TeminKalem') {
          try {
            const tkQuery = `
              SELECT tk.*, 
                     COALESCE(NULLIF(tk.aciklama, ''), tanim.ozelligi, '') as aciklama,
                     COALESCE(NULLIF(tk.aciklama, ''), tanim.ozelligi, '') as ozelligi
              FROM DATA_TeminKalem tk
              LEFT JOIN TANIM_Kalem tanim ON (
                tk.kalem_adi = tanim.kalem_adi 
                OR (tk.barkod_id IS NOT NULL AND tk.barkod_id != '' AND tk.barkod_id = tanim.barkod_id)
                OR (tk.tasinir_kodu IS NOT NULL AND tk.tasinir_kodu != '' AND tk.tasinir_kodu = tanim.tasinir_kodu)
              )
              WHERE tk.temin_dosya_id = ?
              ORDER BY tk.id ASC
            `;
            rows = await queryExecutor(tkQuery, [activeDosyaId]);
          } catch {
            rows = await queryExecutor(`SELECT * FROM ${rule.tablo} WHERE ${rule.iliskili_id} = ?`, [activeDosyaId]);
          }
        } else {
          rows = await queryExecutor(`SELECT * FROM ${rule.tablo} WHERE ${rule.iliskili_id} = ?`, [activeDosyaId]);
        }
        
        let firms: any[] = [];
        let bidsMap: Record<string, number> = {};
        
        if (rule.tablo === 'DATA_TeminKalem') {
          try {
            const firmQuery = `SELECT df.id as temin_firma_id,
                                      COALESCE(NULLIF(df.unvan, ''), NULLIF(f.unvan, ''), 'İstekli Firma') as unvan
                               FROM DATA_TeminFirma df
                               LEFT JOIN TANIM_Firma f ON df.firma_id = f.id
                               WHERE df.temin_dosya_id = ?
                               ORDER BY df.id ASC`;
            firms = await queryExecutor(firmQuery, [activeDosyaId]);
            if (firms && firms.length > 0) {
              resolvedPayload['firmalar'] = firms.map((f: any) => ({ unvan: f.unvan }));
            }
            
            const bidQuery = `SELECT temin_kalem_id, temin_firma_id, birim_fiyat FROM DATA_TeminKalemTeklif WHERE temin_dosya_id = ?`;
            const bidRows = await queryExecutor(bidQuery, [activeDosyaId]);
            (bidRows || []).forEach((b: any) => {
              bidsMap[`${b.temin_kalem_id}_${b.temin_firma_id}`] = b.birim_fiyat || 0;
            });
          } catch {
            // Ignore firm query failure
          }
        }

        const formatTR = (val: number) => {
          return new Intl.NumberFormat('tr-TR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }).format(val);
        };

        const firmTotals = (firms || []).map(() => 0);

        resolvedPayload[sablonDegiskeni] = rows.map((row: any, idx: number) => {
          const item: Record<string, any> = { siraNo: idx + 1 };
          for (const [templateKey, dbColumn] of Object.entries(rule.altEslestirme!)) {
            item[templateKey] = row[dbColumn] ?? row[templateKey] ?? '';
          }

          if (!item.ozelligi || item.ozelligi === '') {
            item.ozelligi = row.aciklama || row.ozelligi || '';
          }

          if (rule.tablo === 'DATA_TeminKalem' && firms && firms.length > 0) {
            let minPrice = Infinity;
            let minIdx = -1;

            const firmaTeklifleriDetay = firms.map((f: any, fIdx: number) => {
              const price = bidsMap[`${row.id}_${f.temin_firma_id}`] || 0;
              const numMiktar = typeof row.miktar === 'number' ? row.miktar : parseFloat(String(row.miktar || 0));
              const total = price * (isNaN(numMiktar) ? 0 : numMiktar);
              if (price > 0) {
                firmTotals[fIdx] += total;
                if (price < minPrice) {
                  minPrice = price;
                  minIdx = fIdx;
                }
              }
              return {
                birimFiyat: price > 0 ? formatTR(price) : '-',
                tutar: total > 0 ? formatTR(total) : '-'
              };
            });

            item['firmaTeklifleriDetay'] = firmaTeklifleriDetay;
            if (minIdx !== -1 && firms[minIdx]) {
              const numMiktar = typeof row.miktar === 'number' ? row.miktar : parseFloat(String(row.miktar || 0));
              item['enUygunFirmaAdi'] = firms[minIdx].unvan;
              item['enDusukFiyat'] = formatTR(minPrice);
              item['toplamBedel'] = formatTR(minPrice * (isNaN(numMiktar) ? 0 : numMiktar));
            } else {
              item['enUygunFirmaAdi'] = item['enUygunFirmaAdi'] || '-';
              item['enDusukFiyat'] = item['enDusukFiyat'] || '-';
              item['toplamBedel'] = item['toplamBedel'] || '-';
            }
          }

          return item;
        });

        if (rule.tablo === 'DATA_TeminKalem' && firms && firms.length > 0) {
          resolvedPayload['firmaToplamlariDetay'] = firmTotals.map((tot: number) => ({
            toplam: tot > 0 ? formatTR(tot) : '-'
          }));
        }
      } catch (err) {
        resolvedPayload[sablonDegiskeni] = [];
      }
      continue;
    }

    // 3.5 Commission members (fiyatKomisyonu / muayeneKomisyonu / komisyon)
    if (sablonDegiskeni === 'fiyatKomisyonu' || sablonDegiskeni === 'muayeneKomisyonu' || sablonDegiskeni === 'komisyon') {
      try {
        let members: any[] = [];
        // 1. Try querying DATA_TeminKomisyon for active file
        const fileKomQuery = `SELECT tk.*, 
                                     COALESCE(NULLIF(tk.ad_soyad, ''), NULLIF(p.ad_soyad, ''), '') as resolved_ad_soyad,
                                     COALESCE(NULLIF(tk.unvan, ''), NULLIF(p.unvan, ''), '') as resolved_unvan,
                                     COALESCE(k.ad, '') as komisyon_turu_adi
                              FROM DATA_TeminKomisyon tk 
                              LEFT JOIN TANIM_Personel p ON tk.personel_id = p.id 
                              LEFT JOIN TANIM_Komisyon k ON tk.komisyon_id = k.id
                              WHERE tk.temin_dosya_id = ?`;
        const fileKomRows = await queryExecutor(fileKomQuery, [activeDosyaId]);
        if (fileKomRows && fileKomRows.length > 0) {
          if (sablonDegiskeni === 'fiyatKomisyonu' || sablonDegiskeni === 'komisyon') {
            const filtered = fileKomRows.filter((r: any) => {
              const kt = String(r.komisyon_turu_adi || r.komisyon_turu || '').toLowerCase();
              return !kt || kt.includes('fiyat') || kt.includes('piyasa') || kt.includes('araştırma') || kt.includes('arastirma');
            });
            members = filtered.length > 0 ? filtered : fileKomRows;
          } else if (sablonDegiskeni === 'muayeneKomisyonu') {
            const filtered = fileKomRows.filter((r: any) => {
              const kt = String(r.komisyon_turu_adi || r.komisyon_turu || '').toLowerCase();
              return kt.includes('muayene') || kt.includes('kabul');
            });
            members = filtered.length > 0 ? filtered : fileKomRows;
          } else {
            members = fileKomRows;
          }
        }

        // 2. Fallback: Query TANIM_Komisyon & TANIM_KomisyonUye (Komisyon Yönetimi)
        if (members.length === 0) {
          const tanimQuery = `SELECT u.*, k.ad as komisyon_adi, p.ad_soyad, p.unvan, g.ad as gorev_adi
                              FROM TANIM_KomisyonUye u
                              JOIN TANIM_Komisyon k ON u.komisyon_id = k.id
                              LEFT JOIN TANIM_Personel p ON u.personel_id = p.id
                              LEFT JOIN TANIM_KomisyonGorevi g ON u.gorev_id = g.id
                              WHERE k.aktif_mi = 1 OR k.aktif_mi IS NULL`;
          const tanimRows = await queryExecutor(tanimQuery, []);
          if (tanimRows && tanimRows.length > 0) {
            if (sablonDegiskeni === 'fiyatKomisyonu' || sablonDegiskeni === 'komisyon') {
              const filtered = tanimRows.filter((r: any) => {
                const ka = String(r.komisyon_adi || '').toLowerCase();
                return ka.includes('fiyat') || ka.includes('piyasa') || ka.includes('araştırma') || ka.includes('arastirma');
              });
              members = filtered.length > 0 ? filtered : tanimRows;
            } else if (sablonDegiskeni === 'muayeneKomisyonu') {
              const filtered = tanimRows.filter((r: any) => {
                const ka = String(r.komisyon_adi || '').toLowerCase();
                return ka.includes('muayene') || ka.includes('kabul');
              });
              members = filtered.length > 0 ? filtered : tanimRows;
            } else {
              members = tanimRows;
            }
          }
        }

        // 3. Fallback: Query TANIM_Personel if no commission table setup exists
        if (members.length === 0) {
          const pRows = await queryExecutor(
            'SELECT ad_soyad, unvan FROM TANIM_Personel WHERE (aktif_mi = 1 OR aktif_mi IS NULL) ORDER BY id ASC LIMIT 3',
            []
          );
          if (pRows && pRows.length > 0) {
            members = pRows.map((p: any) => ({
              resolved_ad_soyad: p.ad_soyad,
              resolved_unvan: p.unvan,
              gorev_adi: 'Görevli'
            }));
          }
        }

        resolvedPayload[sablonDegiskeni] = members.map((m: any) => ({
          adSoyad: m.resolved_ad_soyad || m.ad_soyad || m.adSoyad || '',
          unvan: m.resolved_unvan || m.unvan || '',
          gorevi: m.gorev || m.gorev_adi || (m.asil_mi === 0 ? 'Yedek Üye' : 'Üye'),
          pozisyonu: m.resolved_unvan || m.unvan || ''
        }));
        continue;
      } catch (err) {
        resolvedPayload[sablonDegiskeni] = [];
        continue;
      }
    }

    // 4. Single table columns or JSON array of strings
    if (rule.tablo && rule.sutun && rule.sutun !== '*') {
      try {
        const effectiveRule = { ...rule };
        // Smart normalization for TANIM_Kurum columns
        if (effectiveRule.tablo === 'TANIM_Kurum') {
          if (effectiveRule.sutun === 'ust_idari_birim') {
            effectiveRule.sutun = 'ust_kurum_adi';
          }
        }

        // Smart normalization for DATA_TeminDosyasi columns
        if (effectiveRule.tablo === 'DATA_TeminDosyasi') {
          if (effectiveRule.sutun === 'hazirlayan_personel_ad') {
            effectiveRule.sutun = 'hazirlayan_personel_id';
            effectiveRule.iliskiliTablo = 'TANIM_Personel';
            effectiveRule.iliskiliSutun = 'ad_soyad';
          } else if (effectiveRule.sutun === 'hazirlayan_personel_unvan') {
            effectiveRule.sutun = 'hazirlayan_personel_id';
            effectiveRule.iliskiliTablo = 'TANIM_Personel';
            effectiveRule.iliskiliSutun = 'unvan';
          } else if (effectiveRule.sutun === 'hazirlayan_telefon') {
            effectiveRule.sutun = 'hazirlayan_personel_id';
            effectiveRule.iliskiliTablo = 'TANIM_Personel';
            effectiveRule.iliskiliSutun = 'telefon';
          } else if (effectiveRule.sutun === 'onaylayan_personel_ad') {
            effectiveRule.sutun = 'onay_personel_id';
            effectiveRule.iliskiliTablo = 'TANIM_Personel';
            effectiveRule.iliskiliSutun = 'ad_soyad';
          } else if (effectiveRule.sutun === 'onaylayan_personel_unvan') {
            effectiveRule.sutun = 'onay_personel_id';
            effectiveRule.iliskiliTablo = 'TANIM_Personel';
            effectiveRule.iliskiliSutun = 'unvan';
          } else if (effectiveRule.sutun === 'onaylayan_personel_id') {
            effectiveRule.sutun = 'onay_personel_id';
          } else if (effectiveRule.sutun === 'kazanan_firma_id') {
            effectiveRule.sutun = 'firma_id';
          } else if (effectiveRule.sutun === 'olusturma_tarihi') {
            effectiveRule.sutun = 'dosya_acilis_tarihi';
          } else if (effectiveRule.sutun === 'temin_no_clean') {
            effectiveRule.sutun = 'temin_no';
          } else if (effectiveRule.sutun === 'talep_eden_personel_ad') {
            effectiveRule.sutun = 'talep_eden_personel_id';
            effectiveRule.iliskiliTablo = 'TANIM_Personel';
            effectiveRule.iliskiliSutun = 'ad_soyad';
          } else if (effectiveRule.sutun === 'talep_eden_personel_unvan') {
            effectiveRule.sutun = 'talep_eden_personel_id';
            effectiveRule.iliskiliTablo = 'TANIM_Personel';
            effectiveRule.iliskiliSutun = 'unvan';
          } else if (effectiveRule.sutun === 'talep_eden_telefon') {
            effectiveRule.sutun = 'talep_eden_personel_id';
            effectiveRule.iliskiliTablo = 'TANIM_Personel';
            effectiveRule.iliskiliSutun = 'telefon';
          } else if (effectiveRule.sutun === 'sunan_personel_ad') {
            effectiveRule.sutun = 'sunan_personel_id';
            effectiveRule.iliskiliTablo = 'TANIM_Personel';
            effectiveRule.iliskiliSutun = 'ad_soyad';
          } else if (effectiveRule.sutun === 'sunan_personel_unvan') {
            effectiveRule.sutun = 'sunan_personel_id';
            effectiveRule.iliskiliTablo = 'TANIM_Personel';
            effectiveRule.iliskiliSutun = 'unvan';
          } else if (effectiveRule.sutun === 'sunan_telefon' || effectiveRule.sutun === 'irtibat_telefon') {
            effectiveRule.sutun = 'irtibat_yetkilisi_id';
            effectiveRule.iliskiliTablo = 'TANIM_Personel';
            effectiveRule.iliskiliSutun = 'telefon';
          } else if (effectiveRule.sutun === 'isin_suresi') {
            effectiveRule.sutun = 'teslim_tarihi';
          } else if (effectiveRule.sutun === 'ihale_usulu') {
            effectiveRule.sutun = 'ihale_sekli';
          } else if (effectiveRule.sutun === 'odenek_tutari') {
            effectiveRule.sutun = 'yaklasik_maliyet';
          } else if (effectiveRule.sutun === 'butce_tertibi') {
            effectiveRule.sutun = 'ekonomik_kod';
          } else if (effectiveRule.sutun === 'alim_turu') {
            effectiveRule.sutun = 'tur';
          } else if (effectiveRule.sutun === 'onay_tarihi' || effectiveRule.sutun === 'dosya_tarihi') {
            effectiveRule.sutun = 'dosya_acilis_tarihi';
          } else if (effectiveRule.sutun === 'isin_gerekcesi') {
            effectiveRule.sutun = 'isin_aciklamasi';
          }
        }

        let query = '';
        let params: any[] = [];
        
        if (effectiveRule.iliskiliTablo && effectiveRule.iliskiliSutun) {
          query = `SELECT p.${effectiveRule.iliskiliSutun} AS res_val FROM ${effectiveRule.tablo} d LEFT JOIN ${effectiveRule.iliskiliTablo} p ON d.${effectiveRule.sutun} = p.id WHERE d.id = ? LIMIT 1`;
          params = [activeDosyaId];
        } else if (effectiveRule.iliskili_id) {
          query = `SELECT ${effectiveRule.sutun} AS res_val FROM ${effectiveRule.tablo} WHERE ${effectiveRule.iliskili_id} = ? LIMIT 1`;
          params = [activeDosyaId];
        } else if (effectiveRule.tablo && effectiveRule.tablo.toLowerCase().startsWith('data_')) {
          query = `SELECT ${effectiveRule.sutun} AS res_val FROM ${effectiveRule.tablo} WHERE id = ? LIMIT 1`;
          params = [activeDosyaId];
        } else {
          query = `SELECT ${effectiveRule.sutun} AS res_val FROM ${effectiveRule.tablo} LIMIT 1`;
        }

        const res = await queryExecutor(query, params);
        let rawValue = res?.[0]?.res_val;

        // Personnel signature auto-fallback if no specific personnel is selected on active file
        if (effectiveRule.iliskiliTablo === 'TANIM_Personel' && (!rawValue || String(rawValue).trim() === '')) {
          try {
            let pQuery = '';
            if (sablonDegiskeni.toLowerCase().includes('onay') || sablonDegiskeni.toLowerCase().includes('yetkili')) {
              pQuery = `SELECT ${effectiveRule.iliskiliSutun} AS res_val FROM TANIM_Personel WHERE (unvan LIKE '%Harcama Yetkilisi%' OR unvan LIKE '%Müdür%' OR unvan LIKE '%Başkan%') AND (aktif_mi = 1 OR aktif_mi IS NULL) ORDER BY id ASC LIMIT 1`;
            } else {
              pQuery = `SELECT ${effectiveRule.iliskiliSutun} AS res_val FROM TANIM_Personel WHERE (aktif_mi = 1 OR aktif_mi IS NULL) ORDER BY id ASC LIMIT 1`;
            }
            const pRes = await queryExecutor(pQuery, []);
            if (pRes?.[0]?.res_val) {
              rawValue = pRes[0].res_val;
            }
          } catch (e) {}
        }

        // Dynamic fallback for sunulacakMakamAdi from TANIM_Kurum
        if (sablonDegiskeni === 'sunulacakMakamAdi') {
          try {
            const kRes = await queryExecutor('SELECT kurum_adi, ust_kurum_adi, makam_adi FROM TANIM_Kurum LIMIT 1', []);
            if (kRes?.[0]) {
              const kRow = kRes[0];
              if (kRow.makam_adi && kRow.makam_adi.trim()) {
                rawValue = kRow.makam_adi.trim();
              } else if (kRow.kurum_adi && kRow.kurum_adi.trim()) {
                const kName = kRow.kurum_adi.trim();
                rawValue = kName.toUpperCase().endsWith('BAŞKANLIĞI')
                  ? `${kName.toUpperCase()}NA`
                  : `${kName.toUpperCase()} BAŞKANLIĞINA`;
              } else if (kRow.ust_kurum_adi && kRow.ust_kurum_adi.trim()) {
                rawValue = `${kRow.ust_kurum_adi.trim().toUpperCase()} BAŞKANLIĞINA`;
              }
            }
          } catch (e) {}
        }

        // Smart normalization for alimTuru so it doesn't just say 'mal' or 'yapim'
        if (sablonDegiskeni === 'alimTuru' || (effectiveRule.tablo === 'DATA_TeminDosyasi' && effectiveRule.sutun === 'tur')) {
          const raw = String(rawValue || '').trim().toLowerCase();
          if (raw === 'mal' || raw === 'malzeme') {
            rawValue = 'mal alımı';
          } else if (raw === 'hizmet') {
            rawValue = 'hizmet alımı';
          } else if (raw === 'yapim' || raw === 'yapım' || raw === 'yapim_isi') {
            rawValue = 'yapım işi';
          } else if (raw === 'danismanlik' || raw === 'danışmanlık') {
            rawValue = 'danışmanlık hizmet alımı';
          }
        }
        
        // Dynamic fallback for aciklama / isinAciklamasi if empty in DATA_TeminDosyasi
        if ((sablonDegiskeni === 'aciklama' || sablonDegiskeni === 'isinAciklamasi') && (!rawValue || String(rawValue).trim() === '')) {
          try {
            const dosyaRes = await queryExecutor(
              'SELECT isin_aciklamasi, konu FROM DATA_TeminDosyasi WHERE id = ? LIMIT 1',
              [activeDosyaId]
            );
            if (dosyaRes?.[0]) {
              rawValue = dosyaRes[0].isin_aciklamasi || dosyaRes[0].konu || '';
            }
          } catch (e) {}
        }

        // Handle stringified JSON arrays (like antetSatirlari)
        if (typeof rawValue === 'string' && (rawValue.trim().startsWith('[') || rawValue.trim().startsWith('{'))) {
          try {
            resolvedPayload[sablonDegiskeni] = JSON.parse(rawValue);
          } catch (e) {
            resolvedPayload[sablonDegiskeni] = rawValue;
          }
        } else {
          resolvedPayload[sablonDegiskeni] = rawValue !== undefined && rawValue !== null && String(rawValue).trim() !== ''
            ? rawValue 
            : (rule.varsayilan ?? '');
        }
      } catch (err) {
        resolvedPayload[sablonDegiskeni] = rule.varsayilan ?? '';
      }
    }
  }

  // Automatic solLogo and sagLogo fallback from TANIM_Kurum or settings
  if (!resolvedPayload['solLogo']) {
    try {
      const res = await queryExecutor('SELECT logo_sol FROM TANIM_Kurum LIMIT 1', []);
      const logoSol = res?.[0]?.logo_sol ? String(res[0].logo_sol).replace(/['"]+/g, '').trim() : '';
      if (logoSol) {
        resolvedPayload['solLogo'] = res[0].logo_sol;
      } else {
        const ayarRes = await queryExecutor("SELECT key, value FROM settings WHERE key IN ('logoLeft', 'sol_logo')", []);
        const logoVal = ayarRes?.find((r: any) => r.key === 'logoLeft')?.value || ayarRes?.find((r: any) => r.key === 'sol_logo')?.value;
        const cleanLogoVal = logoVal ? String(logoVal).replace(/['"]+/g, '').trim() : '';
        if (cleanLogoVal) resolvedPayload['solLogo'] = logoVal;
      }
    } catch (e) {}
  }
  if (!resolvedPayload['sagLogo']) {
    try {
      const res = await queryExecutor('SELECT logo_sag FROM TANIM_Kurum LIMIT 1', []);
      const logoSag = res?.[0]?.logo_sag ? String(res[0].logo_sag).replace(/['"]+/g, '').trim() : '';
      if (logoSag) {
        resolvedPayload['sagLogo'] = res[0].logo_sag;
      } else {
        const ayarRes = await queryExecutor("SELECT key, value FROM settings WHERE key IN ('logoRight', 'sag_logo')", []);
        const logoVal = ayarRes?.find((r: any) => r.key === 'logoRight')?.value || ayarRes?.find((r: any) => r.key === 'sag_logo')?.value;
        const cleanLogoVal = logoVal ? String(logoVal).replace(/['"]+/g, '').trim() : '';
        if (cleanLogoVal) resolvedPayload['sagLogo'] = logoVal;
      }
    } catch (e) {}
  }

  // Format all date variables into Turkish GG.AA.YYYY format
  for (const key of Object.keys(resolvedPayload)) {
    const val = resolvedPayload[key];
    if (
      typeof val === 'string' &&
      (/^\d{4}-\d{2}-\d{2}/.test(val) || key.toLowerCase().includes('tarih'))
    ) {
      resolvedPayload[key] = formatDateTR(val);
    }
  }

  return resolvedPayload;
}

/**
 * Parses and resolves tokenized formula strings e.g. {{TANIM_Kurum.detsis_kodu}}
 */
async function resolveFormula(
  formul: string,
  activeDosyaId: number,
  queryExecutor: (sql: string, params: any[]) => Promise<any[]>
): Promise<string> {
  const tokenRegex = /\{\{([^}]+)\}\}/g;
  let resolved = formul;
  
  const matches = [...formul.matchAll(tokenRegex)];
  
  for (const m of matches) {
    const fullToken = m[0];
    const path = m[1].trim();
    const parts = path.split('.');
    
    if (parts.length === 2) {
      let [table, column] = parts;
      
      // Column normalization in formulas
      if (table === 'TANIM_Kurum' && column === 'ust_idari_birim') {
        column = 'ust_kurum_adi';
      }
      if (table === 'DATA_TeminDosyasi') {
        if (column === 'temin_no_clean') {
          column = 'temin_no';
        } else if (column === 'olusturma_tarihi') {
          column = 'dosya_acilis_tarihi';
        } else if (column === 'onaylayan_personel_id') {
          column = 'onay_personel_id';
        } else if (column === 'kazanan_firma_id') {
          column = 'firma_id';
        }
      }

      try {
        let query = `SELECT ${column} FROM ${table} LIMIT 1`;
        let params: any[] = [];
        
        if (table.toLowerCase().startsWith('data_')) {
          query = `SELECT ${column} FROM ${table} WHERE id = ? LIMIT 1`;
          params = [activeDosyaId];
        }
        
        const res = await queryExecutor(query, params);
        let val = res?.[0]?.[column] ?? '';
        if (parts[1] === 'temin_no_clean' && typeof val === 'string') {
          val = val.replace(/[^0-9]/g, '') || val;
        }
        if (column === 'detsis_kodu' && (!val || String(val).trim() === '')) {
          val = '0000000000';
        }
        resolved = resolved.replace(fullToken, String(val));
      } catch (err) {
        resolved = resolved.replace(fullToken, '');
      }
    }
  }
  return resolved;
}

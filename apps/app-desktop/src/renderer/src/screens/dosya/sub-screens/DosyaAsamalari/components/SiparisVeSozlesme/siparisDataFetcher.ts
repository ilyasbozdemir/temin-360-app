import { FirmaStats, IslemlerData } from './types'

export interface ResolvedSiparisData {
  kazananFirmaId: number | null
  kazananFirmaUnvan: string
  firmaStats: FirmaStats
  islemlerData: IslemlerData
  sonucOnayEkler: string[]
}

const DEFAULT_EKLER = [
  'Piyasa Fiyat Araştırması Tutanağı',
  'Teklif Mektupları',
  'İhtiyaç Raporu',
  'Harcama Talimatı',
  'Yaklaşık Maliyet Hesap Cetveli'
]

export async function fetchSiparisVeSozlesmeData(
  activeDosyaId: number
): Promise<ResolvedSiparisData | null> {
  const dosyaRes = await window.electron.ipcRenderer.invoke(
    'db:query',
    `SELECT d.firma_id, d.yaklasik_maliyet, d.teslim_tarihi, d.teslim_gun,
            d.teklif_sozlesme_turu, d.sozlesme_yapilacak_mi, d.sablon_tercihleri
     FROM DATA_TeminDosyasi d
     WHERE d.id = ?`,
    [activeDosyaId]
  )

  if (!dosyaRes.success || !dosyaRes.data || dosyaRes.data.length === 0) {
    return null
  }

  const dosyaRow = dosyaRes.data[0]
  let sonucOnayEkler = DEFAULT_EKLER

  if (dosyaRow.sablon_tercihleri) {
    try {
      const parsed = JSON.parse(dosyaRow.sablon_tercihleri)
      if (Array.isArray(parsed.sonucOnayEkler) && parsed.sonucOnayEkler.length > 0) {
        sonucOnayEkler = parsed.sonucOnayEkler
      }
    } catch (e) {
      console.warn('Failed to parse sablon_tercihleri:', e)
    }
  }

  const firmsRes = await window.electron.ipcRenderer.invoke(
    'db:query',
    `SELECT 
       df.id as temin_firma_id,
       df.firma_id as master_firma_id,
       COALESCE(NULLIF(df.unvan, ''), NULLIF(f.unvan, ''), 'İstekli Firma') as unvan,
       COALESCE(NULLIF(df.vergi_no, ''), NULLIF(f.vergi_no, '')) as vergi_no,
       df.yasaklilik_durumu,
       df.kazanan_mi,
       df.teklif_toplami
     FROM DATA_TeminFirma df
     LEFT JOIN TANIM_Firma f ON df.firma_id = f.id
     WHERE df.temin_dosya_id = ? 
       AND (COALESCE(df.aktif_mi, 1) = 1 OR df.aktif_mi = '1' OR df.aktif_mi = 'true')
     ORDER BY df.id ASC`,
    [activeDosyaId]
  )

  const firmList = firmsRes.success && Array.isArray(firmsRes.data) ? firmsRes.data : []
  if (firmList.length === 0) {
    return null
  }

  const bidsRes = await window.electron.ipcRenderer.invoke(
    'db:query',
    `SELECT kt.temin_firma_id, SUM(kt.birim_fiyat * COALESCE(k.miktar, 1)) as calculated_total
     FROM DATA_TeminKalemTeklif kt
     JOIN DATA_TeminKalem k ON kt.temin_kalem_id = k.id
     WHERE kt.temin_dosya_id = ?
     GROUP BY kt.temin_firma_id`,
    [activeDosyaId]
  )

  const bidsMap = new Map<number, number>()
  if (bidsRes.success && Array.isArray(bidsRes.data)) {
    bidsRes.data.forEach((row: any) => {
      bidsMap.set(Number(row.temin_firma_id), Number(row.calculated_total) || 0)
    })
  }

  const enhancedFirms = firmList.map((f: any) => {
    const rawTotal = Number(f.teklif_toplami) || 0
    const calcTotal = bidsMap.get(Number(f.temin_firma_id)) || 0
    const effectiveTotal = rawTotal > 0 ? rawTotal : calcTotal
    return {
      ...f,
      calculated_teklif: effectiveTotal
    }
  })

  let winner = enhancedFirms.find(
    (f: any) =>
      dosyaRow.firma_id &&
      (Number(f.master_firma_id) === Number(dosyaRow.firma_id) ||
        Number(f.temin_firma_id) === Number(dosyaRow.firma_id))
  )

  if (!winner) {
    winner = enhancedFirms.find((f: any) => Number(f.kazanan_mi) === 1 || f.kazanan_mi === '1')
  }

  if (!winner) {
    const firmsWithBids = enhancedFirms.filter((f: any) => f.calculated_teklif > 0)
    if (firmsWithBids.length > 0) {
      firmsWithBids.sort((a: any, b: any) => a.calculated_teklif - b.calculated_teklif)
      winner = firmsWithBids[0]
    }
  }

  if (!winner && enhancedFirms.length > 0) {
    winner = enhancedFirms[0]
  }

  if (!winner) return null

  const effectiveFirmaId = Number(winner.master_firma_id) || Number(winner.temin_firma_id)
  const effectiveUnvan = winner.unvan || 'İstekli Firma'
  const effectiveVergiNo = winner.vergi_no || null
  const teklifToplami = winner.calculated_teklif > 0 ? winner.calculated_teklif : null
  const yasaklilikDurumu = winner.yasaklilik_durumu || null

  if (Number(dosyaRow.firma_id) !== effectiveFirmaId || Number(winner.kazanan_mi) !== 1) {
    try {
      await window.electron.ipcRenderer.invoke(
        'db:run',
        'UPDATE DATA_TeminDosyasi SET firma_id = ? WHERE id = ?',
        [effectiveFirmaId, activeDosyaId]
      )
      await window.electron.ipcRenderer.invoke(
        'db:run',
        `UPDATE DATA_TeminFirma 
         SET kazanan_mi = (CASE WHEN firma_id = ? OR id = ? THEN 1 ELSE 0 END) 
         WHERE temin_dosya_id = ?`,
        [effectiveFirmaId, winner.temin_firma_id, activeDosyaId]
      )
    } catch (syncErr) {
      console.warn('Winner auto-sync warning:', syncErr)
    }
  }

  let formattedDate = ''
  let teslimGunu =
    dosyaRow.teslim_gun !== undefined && dosyaRow.teslim_gun !== null ? dosyaRow.teslim_gun : 10

  if (
    (dosyaRow.teslim_gun === undefined || dosyaRow.teslim_gun === null) &&
    dosyaRow.teslim_tarihi
  ) {
    const tDate = new Date(dosyaRow.teslim_tarihi)
    const today = new Date()
    const diffTime = tDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    if (diffDays > 0) teslimGunu = diffDays
  }

  if (dosyaRow.teslim_tarihi) {
    const d = new Date(dosyaRow.teslim_tarihi)
    if (!isNaN(d.getTime())) {
      formattedDate = d.toISOString().split('T')[0]
    }
  }

  const firmaStats: FirmaStats = {
    teklifToplami,
    yaklasikMaliyet: dosyaRow.yaklasik_maliyet || null,
    teslimTarihi: formattedDate || null,
    yasaklilikDurumu,
    vergiNo: effectiveVergiNo,
    teklifSozlesmeTuru: dosyaRow.teklif_sozlesme_turu || 'Mal Alımı',
    sozlesmeYapilacakMi: dosyaRow.sozlesme_yapilacak_mi ? 1 : 0,
    istekliFirmaSayisi: enhancedFirms.length
  }

  const islemlerData: IslemlerData = {
    sozlesmeYapilacakMi: Boolean(dosyaRow.sozlesme_yapilacak_mi),
    siparisFormuGerekli: true,
    teslimGunu,
    teslimTarihi: formattedDate || '',
    teklifSozlesmeTuru: dosyaRow.teklif_sozlesme_turu || 'Mal Alımı'
  }

  return {
    kazananFirmaId: effectiveFirmaId,
    kazananFirmaUnvan: effectiveUnvan,
    firmaStats,
    islemlerData,
    sonucOnayEkler
  }
}

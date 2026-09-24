import { TemplateResolver } from '@temin360/document-templates'
import { getDefaultMappingForProcess } from '../../../../../../constants/mappings'
import { useSettingsStore } from '../../../../../../store/settingsStore'
import { useGlobalDocumentPreviewStore } from '../../../../../../store/globalDocumentPreviewStore'
import { formatDateString } from '../../../../contextBuilder/dateHelpers'
import { LoadPreviewDataParams, LoadPreviewDataResult } from './types'

function dedupeMembers(members: any[]) {
  if (!Array.isArray(members)) return []
  const seen = new Set<string>()
  return members.filter((m: any) => {
    const rawName = (m.ad_soyad || m.adSoyad || '').trim().toLowerCase()
    const pid = m.personel_id ? `pid_${m.personel_id}` : null
    const key = pid || (rawName ? `name_${rawName}` : null)
    if (!key) return true
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export async function loadDocumentPreviewData({
  activeDosyaId,
  resolvedId,
  selectedDocId,
  propInvitedFirms,
  showLogoLeft,
  showLogoRight,
  logoLeft,
  logoRight,
  institutionLogo
}: LoadPreviewDataParams): Promise<LoadPreviewDataResult> {
  const queryExecutor = async (sql: string, params: any[]): Promise<any[]> => {
    if (!window.electron?.ipcRenderer) return []
    const res = await window.electron.ipcRenderer.invoke('db:query', sql, params)
    if (res && res.success) {
      return res.data
    }
    return []
  }

  const mapping = getDefaultMappingForProcess(resolvedId)
  const resolver = new TemplateResolver(queryExecutor)

  // Fetch complete pre-computed document payload via single native Electron IPC handler + resolver in parallel
  const [payloadRes, resolved] = await Promise.all([
    window.electron?.ipcRenderer
      ? window.electron.ipcRenderer.invoke('belge:get-document-payload', {
          dosyaId: activeDosyaId,
          documentId: resolvedId
        })
      : Promise.resolve({ success: false, data: {} }),
    resolver.resolve(mapping, activeDosyaId || 0)
  ])

  const payloadData = payloadRes?.success ? payloadRes.data : {}
  let dosyaRecord = payloadData.dosya || null
  if (!dosyaRecord && activeDosyaId) {
    const res = await queryExecutor('SELECT * FROM DATA_TeminDosyasi WHERE id = ?', [activeDosyaId])
    if (res && res[0]) dosyaRecord = res[0]
  }

  let personelList = payloadData.personelListesi || []
  if (!personelList || personelList.length === 0) {
    try {
      personelList = await queryExecutor(
        "SELECT id, ad_soyad, unvan, telefon, eposta, birim, sicil_no FROM TANIM_Personel WHERE COALESCE(aktif_mi, 1) = 1 OR aktif_mi = '1' OR aktif_mi = 'true' OR aktif_mi IS NULL ORDER BY ad_soyad ASC",
        []
      )
    } catch (e) {
      console.error('Direct personel query error:', e)
    }
  }

  let fileFirms = payloadData.fileFirms || []
  let combinedFirms = payloadData.firmaListesi || []
  let items = payloadData.items || []
  let bids = payloadData.bids || []

  if (activeDosyaId) {
    if (!fileFirms || fileFirms.length === 0) {
      try {
        const dbFirms = await queryExecutor(
          `SELECT tf.*, f.unvan, f.firma_adi, f.vergi_no, f.adres, f.telefon, f.email, f.yetkili_ad_soyad 
           FROM DATA_TeminFirma tf 
           LEFT JOIN TANIM_Firma f ON tf.firma_id = f.id 
           WHERE tf.temin_dosya_id = ? 
           ORDER BY tf.id ASC`,
          [activeDosyaId]
        )
        if (dbFirms && dbFirms.length > 0) {
          fileFirms = dbFirms.map((f: any) => ({
            ...f,
            id: f.id,
            temin_firma_id: f.id,
            firma_id: f.firma_id,
            unvan: f.unvan || f.firma_adi || f.firmaUnvan || `Firma ${f.id}`,
            firma_adi: f.firma_adi || f.unvan || '',
            vergi_no: f.vergi_no || '',
            adres: f.adres || '',
            telefon: f.telefon || '',
            email: f.email || ''
          }))
        }
      } catch (e) {
        console.error('Direct fileFirms query error:', e)
      }
    }

    if (!items || items.length === 0) {
      try {
        const dbKalemler = await queryExecutor(
          `SELECT * FROM DATA_TeminKalem WHERE temin_dosya_id = ? ORDER BY sira_no ASC, id ASC`,
          [activeDosyaId]
        )
        if (dbKalemler && dbKalemler.length > 0) {
          items = dbKalemler
        }
      } catch (e) {
        console.error('Direct items query error:', e)
      }
    }

    if (!bids || bids.length === 0) {
      try {
        const dbTeklifler = await queryExecutor(
          `SELECT * FROM DATA_TeminKalemTeklif WHERE temin_dosya_id = ?`,
          [activeDosyaId]
        )
        if (dbTeklifler && dbTeklifler.length > 0) {
          bids = dbTeklifler
        }
      } catch (e) {
        console.error('Direct bids query error:', e)
      }
    }
  }

  if ((!fileFirms || fileFirms.length === 0) && propInvitedFirms && propInvitedFirms.length > 0) {
    fileFirms = propInvitedFirms
  }

  if (!combinedFirms || combinedFirms.length === 0) {
    try {
      combinedFirms = await queryExecutor(
        `SELECT id, unvan, firma_adi, vergi_no, adres, telefon, email FROM TANIM_Firma ORDER BY unvan ASC LIMIT 100`,
        []
      )
    } catch (e) {
      console.error('Direct TANIM_Firma query error:', e)
    }
  }

  const baseData: any = { ...resolved }

  if (
    resolved.antetSatirlari &&
    Array.isArray(resolved.antetSatirlari) &&
    resolved.antetSatirlari.length > 0
  ) {
    baseData.antetSatirlari = resolved.antetSatirlari
  } else {
    try {
      const kurumRows = await queryExecutor(
        'SELECT kurum_anteti, kurum_adi, mudurluk FROM TANIM_Kurum LIMIT 1',
        []
      )
      if (kurumRows && kurumRows[0]) {
        const kRow = kurumRows[0]
        if (kRow.kurum_anteti) {
          try {
            const parsed = JSON.parse(kRow.kurum_anteti)
            if (Array.isArray(parsed) && parsed.length > 0) {
              baseData.antetSatirlari = parsed.filter((s: string) => s && s.trim() !== '')
            } else {
              baseData.antetSatirlari = [kRow.kurum_anteti]
            }
          } catch {
            baseData.antetSatirlari = [kRow.kurum_anteti]
          }
        }
        if (!baseData.kurumAdi && kRow.kurum_adi) baseData.kurumAdi = kRow.kurum_adi
        if (!baseData.mudurluk && kRow.mudurluk) baseData.mudurluk = kRow.mudurluk
      }
    } catch (e) {
      console.error('Failed to load kurum_anteti fallback in previewDataLoader:', e)
    }
  }

  const dosyaObj = payloadData.dosya || dosyaRecord || {}
  const formattedAcilisTarihi =
    formatDateString(dosyaObj.dosya_acilis_tarihi) ||
    formatDateString(dosyaObj.tarih) ||
    formatDateString(dosyaObj.created_at) ||
    ''

  baseData.dosyaAcilisTarihi =
    formatDateString(dosyaObj.dosya_acilis_tarihi) ||
    baseData.dosyaAcilisTarihi ||
    formattedAcilisTarihi
  baseData.acilisTarihi =
    formatDateString(dosyaObj.dosya_acilis_tarihi) || baseData.acilisTarihi || formattedAcilisTarihi
  baseData.dosyaTarihi =
    formatDateString(dosyaObj.dosya_acilis_tarihi) || baseData.dosyaTarihi || formattedAcilisTarihi
  baseData.onayaSunulanTarih =
    formatDateString(dosyaObj.temin_tarihi) ||
    formatDateString(dosyaObj.dosya_acilis_tarihi) ||
    baseData.onayaSunulanTarih ||
    formattedAcilisTarihi
  baseData.tarih = baseData.tarih || formattedAcilisTarihi || baseData.onayaSunulanTarih || ''
  baseData.onayTarihi =
    formatDateString(dosyaObj.onay_tarihi) || baseData.onayTarihi || formattedAcilisTarihi
  const ctx = payloadData.resolvedContext || {}

  baseData.kurumumuz = baseData.kurumumuz || ctx.kurumumuz || ctx.altKurumBizim || 'Belediyemiz'
  baseData.altKurumBizim =
    baseData.altKurumBizim || ctx.altKurumBizim || ctx.kurumumuz || 'Belediyemiz'
  baseData.ihtiyacYeri = baseData.ihtiyacYeri || ctx.ihtiyacYeri || 'Belediyemizin'

  if (!baseData.hazirlayanPersonelAdi) {
    baseData.hazirlayanPersonelAdi = ctx.hazirlayanPersonelAdi || ''
    baseData.hazirlayanPersonelUnvan = ctx.hazirlayanPersonelUnvan || ''
    if (!baseData.hazirlayanPersonelAdi && dosyaObj.hazirlayan_personel_id) {
      const hp = (personelList || []).find((p: any) => p.id === dosyaObj.hazirlayan_personel_id)
      if (hp) {
        baseData.hazirlayanPersonelAdi = hp.ad_soyad
        baseData.hazirlayanPersonelUnvan = hp.unvan || ''
      }
    }
  }

  if (!baseData.talepEdenPersonelAdi) {
    baseData.talepEdenPersonelAdi = ctx.talepEdenPersonelAdi || ''
    baseData.talepEdenPersonelUnvan = ctx.talepEdenPersonelUnvan || ''
    if (!baseData.talepEdenPersonelAdi && dosyaObj.talep_eden_personel_id) {
      const tp = (personelList || []).find((p: any) => p.id === dosyaObj.talep_eden_personel_id)
      if (tp) {
        baseData.talepEdenPersonelAdi = tp.ad_soyad
        baseData.talepEdenPersonelUnvan = tp.unvan || ''
      }
    }
  }

  if (!baseData.onaylayanPersonelAdi) {
    baseData.onaylayanPersonelAdi = ctx.onaylayanPersonelAdi || ''
    baseData.onaylayanPersonelUnvan = ctx.onaylayanPersonelUnvan || ''
    if (!baseData.onaylayanPersonelAdi && dosyaObj.onay_personel_id) {
      const op = (personelList || []).find((p: any) => p.id === dosyaObj.onay_personel_id)
      if (op) {
        baseData.onaylayanPersonelAdi = op.ad_soyad
        baseData.onaylayanPersonelUnvan = op.unvan || ''
      }
    }
  }

  const storeSettings = useSettingsStore.getState()
  const resolvedSolLogo =
    (payloadData.solLogo && String(payloadData.solLogo).trim() !== ''
      ? payloadData.solLogo
      : null) ||
    (resolved.solLogo && String(resolved.solLogo).trim() !== '' ? resolved.solLogo : null) ||
    logoLeft ||
    institutionLogo ||
    storeSettings.logoLeft ||
    storeSettings.institutionLogo ||
    null
  const resolvedSagLogo =
    (payloadData.sagLogo && String(payloadData.sagLogo).trim() !== ''
      ? payloadData.sagLogo
      : null) ||
    (resolved.sagLogo && String(resolved.sagLogo).trim() !== '' ? resolved.sagLogo : null) ||
    logoRight ||
    storeSettings.logoRight ||
    null

  if (resolvedSolLogo) {
    baseData.solLogo = resolvedSolLogo
  }
  if (resolvedSagLogo) {
    baseData.sagLogo = resolvedSagLogo
  }

  if (activeDosyaId) {
    try {
      const dbKomisyonlar = await queryExecutor(
        `SELECT tk.*, p.ad_soyad, p.unvan, tk.gorev, tk.rol, tk.komisyon_id 
         FROM DATA_TeminKomisyon tk 
         LEFT JOIN TANIM_Personel p ON tk.personel_id = p.id 
         WHERE tk.temin_dosya_id = ? 
         ORDER BY tk.id ASC`,
        [activeDosyaId]
      )
      if (dbKomisyonlar && dbKomisyonlar.length > 0) {
        const maliyetMembers = dbKomisyonlar.filter((k: any) => {
          const isMaliyet =
            k.komisyon_id === 1 ||
            (k.komisyon_turu &&
              (k.komisyon_turu.toLowerCase().includes('maliyet') ||
                k.komisyon_turu.toLowerCase().includes('fiyat')))
          if (!isMaliyet) return false

          if (k.belgede_goster === 0 || k.belgede_goster === false) return false

          if (k.belgede_goster === undefined || k.belgede_goster === null) {
            const g = (k.gorev || '').toLowerCase()
            if (
              g.includes('harcama yetkili') ||
              g.includes('gerçekleştirme') ||
              g.includes('gerceklestirme') ||
              g.includes('muhasebe')
            ) {
              return false
            }
          }
          return true
        })

        const muayeneMembers = dbKomisyonlar.filter((k: any) => {
          const isMuayene =
            k.komisyon_id === 2 ||
            (k.komisyon_turu &&
              (k.komisyon_turu.toLowerCase().includes('muayene') ||
                k.komisyon_turu.toLowerCase().includes('kabul')))
          if (!isMuayene) return false
          if (k.belgede_goster === 0 || k.belgede_goster === false) return false
          return true
        })

        // 1. Muhasebe Yetkilisi / Mutemet tespiti
        const muhasebeRow = dbKomisyonlar.find((k: any) => {
          const g = (k.gorev || '').toLowerCase()
          return g.includes('muhasebe') || g.includes('mutemet')
        })
        if (muhasebeRow && (muhasebeRow.ad_soyad || muhasebeRow.personel_id)) {
          let cleanName = (muhasebeRow.ad_soyad || '').split('(')[0].trim()
          if (!cleanName && muhasebeRow.personel_id) {
            const p = (personelList || []).find((x: any) => x.id === muhasebeRow.personel_id)
            if (p) cleanName = (p.ad_soyad || '').split('(')[0].trim()
          }
          if (cleanName) {
            baseData.mutemetAdi = cleanName
            baseData.mutemetUnvan = muhasebeRow.unvan || 'Muhasebe Yetkilisi'
            baseData.muhasebeYetkilisiAdi = cleanName
            baseData.muhasebeYetkilisiUnvan = muhasebeRow.unvan || 'Muhasebe Yetkilisi'
            baseData.muhasebeYetkilisi = cleanName
          }
        }

        // 2. Harcama Yetkilisi (Onaylayan / Olur Veren)
        const harcamaRow = dbKomisyonlar.find((k: any) => {
          const g = (k.gorev || '').toLowerCase()
          return g.includes('harcama yetkili')
        })
        if (harcamaRow && (harcamaRow.ad_soyad || harcamaRow.personel_id)) {
          if (!baseData.onaylayanPersonelAdi) {
            baseData.onaylayanPersonelAdi = harcamaRow.ad_soyad || ''
            baseData.onaylayanPersonelUnvan = harcamaRow.unvan || 'Harcama Yetkilisi'
          }
          baseData.harcamaYetkilisiAdi = harcamaRow.ad_soyad || ''
          baseData.harcamaYetkilisiUnvan = harcamaRow.unvan || 'Harcama Yetkilisi'
        }

        // 3. Gerçekleştirme Görevlisi (Teklif Eden / Hazırlayan)
        const gerceklestirmeRow = dbKomisyonlar.find((k: any) => {
          const g = (k.gorev || '').toLowerCase()
          return (
            g.includes('gerçekleştirme') || g.includes('gerceklestirme') || g.includes('hazırlayan')
          )
        })
        if (gerceklestirmeRow && (gerceklestirmeRow.ad_soyad || gerceklestirmeRow.personel_id)) {
          if (!baseData.hazirlayanPersonelAdi) {
            baseData.hazirlayanPersonelAdi = gerceklestirmeRow.ad_soyad || ''
            baseData.hazirlayanPersonelUnvan = gerceklestirmeRow.unvan || 'Gerçekleştirme Görevlisi'
          }
          baseData.gerceklestirmeGorevlisiAdi = gerceklestirmeRow.ad_soyad || ''
          baseData.gerceklestirmeGorevlisiUnvan =
            gerceklestirmeRow.unvan || 'Gerçekleştirme Görevlisi'
        }

        if (maliyetMembers.length > 0) {
          const deduplicatedMaliyet = dedupeMembers(maliyetMembers)
          const formattedMaliyet = deduplicatedMaliyet.map((m: any) => ({
            adSoyad: m.ad_soyad || '',
            unvan: m.unvan || '',
            gorev: m.gorev || 'Fiyat Araştırma Görevlisi',
            gorevi: m.gorev || 'Fiyat Araştırma Görevlisi',
            komisyonGorevi: m.gorev || 'Fiyat Araştırma Görevlisi',
            rol: m.rol || 'Üye'
          }))
          baseData.fiyatKomisyonu = formattedMaliyet
          baseData.gorevlendirilenler = formattedMaliyet
          baseData.gorevliler = formattedMaliyet
          baseData.dagitimListesi = formattedMaliyet
        }

        if (muayeneMembers.length > 0) {
          const deduplicatedMuayene = dedupeMembers(muayeneMembers)
          baseData.muayeneKomisyonu = deduplicatedMuayene.map((m: any) => ({
            adSoyad: m.ad_soyad || '',
            unvan: m.unvan || '',
            gorev: m.gorev || 'Üye',
            rol: m.rol || 'Üye'
          }))
        }
      }
    } catch (e) {
      console.error('DATA_TeminKomisyon preview query error:', e)
    }
  }

  // Global Komisyon Yönetimi (TANIM_KomisyonUye) ve Personel tablosu Fallback'i
  let globalKomisyonlar: any[] = []
  try {
    globalKomisyonlar = await queryExecutor(
      `SELECT u.*, p.ad_soyad, p.unvan, g.ad as gorev, k.ad as komisyon_adi, k.id as komisyon_id
       FROM TANIM_KomisyonUye u
       LEFT JOIN TANIM_Personel p ON u.personel_id = p.id
       LEFT JOIN TANIM_KomisyonGorevi g ON u.gorev_id = g.id
       LEFT JOIN TANIM_Komisyon k ON u.komisyon_id = k.id
       WHERE u.personel_id IS NOT NULL
       ORDER BY u.sira ASC, u.id ASC`,
      []
    )
  } catch (err) {
    console.error('Global komisyon query error in preview:', err)
  }

  if (globalKomisyonlar && globalKomisyonlar.length > 0) {
    if (
      !baseData.mutemetAdi ||
      baseData.mutemetAdi === '......' ||
      !baseData.muhasebeYetkilisiAdi
    ) {
      const mRow = globalKomisyonlar.find((k: any) => {
        const g = (k.gorev || '').toLowerCase()
        return g.includes('muhasebe') || g.includes('mutemet')
      })
      if (mRow && mRow.ad_soyad) {
        const cleanName = mRow.ad_soyad.split('(')[0].trim()
        if (!baseData.mutemetAdi || baseData.mutemetAdi === '......') {
          baseData.mutemetAdi = cleanName
          baseData.mutemetUnvan = mRow.unvan || 'Muhasebe Yetkilisi'
        }
        baseData.muhasebeYetkilisiAdi = baseData.muhasebeYetkilisiAdi || cleanName
        baseData.muhasebeYetkilisiUnvan =
          baseData.muhasebeYetkilisiUnvan || mRow.unvan || 'Muhasebe Yetkilisi'
        baseData.muhasebeYetkilisi = baseData.muhasebeYetkilisi || cleanName
      }
    }

    if (!baseData.onaylayanPersonelAdi || !baseData.harcamaYetkilisiAdi) {
      const hRow = globalKomisyonlar.find((k: any) =>
        (k.gorev || '').toLowerCase().includes('harcama yetkili')
      )
      if (hRow && hRow.ad_soyad) {
        baseData.onaylayanPersonelAdi = baseData.onaylayanPersonelAdi || hRow.ad_soyad
        baseData.onaylayanPersonelUnvan =
          baseData.onaylayanPersonelUnvan || hRow.unvan || 'Harcama Yetkilisi'
        baseData.harcamaYetkilisiAdi = baseData.harcamaYetkilisiAdi || hRow.ad_soyad
        baseData.harcamaYetkilisiUnvan =
          baseData.harcamaYetkilisiUnvan || hRow.unvan || 'Harcama Yetkilisi'
      }
    }

    if (!baseData.hazirlayanPersonelAdi || !baseData.gerceklestirmeGorevlisiAdi) {
      const gRow = globalKomisyonlar.find((k: any) => {
        const g = (k.gorev || '').toLowerCase()
        return (
          g.includes('gerçekleştirme') ||
          g.includes('gerceklestirme') ||
          g.includes('hazırlayan')
        )
      })
      if (gRow && gRow.ad_soyad) {
        baseData.hazirlayanPersonelAdi = baseData.hazirlayanPersonelAdi || gRow.ad_soyad
        baseData.hazirlayanPersonelUnvan =
          baseData.hazirlayanPersonelUnvan || gRow.unvan || 'Gerçekleştirme Görevlisi'
        baseData.gerceklestirmeGorevlisiAdi =
          baseData.gerceklestirmeGorevlisiAdi || gRow.ad_soyad
        baseData.gerceklestirmeGorevlisiUnvan =
          baseData.gerceklestirmeGorevlisiUnvan || gRow.unvan || 'Gerçekleştirme Görevlisi'
      }
    }

    // Fiyat komisyonu fallback'i
    if (
      !baseData.fiyatKomisyonu ||
      (Array.isArray(baseData.fiyatKomisyonu) && baseData.fiyatKomisyonu.length === 0)
    ) {
      const globalFiyatKom = globalKomisyonlar.filter((k: any) => {
        const kId = k.komisyon_id
        const kAd = (k.komisyon_adi || '').toLowerCase()
        return (
          kId === 1 ||
          kAd.includes('fiyat') ||
          kAd.includes('maliyet') ||
          kAd.includes('araştırma') ||
          kAd.includes('arastirma')
        )
      })
      if (globalFiyatKom.length > 0) {
        const mapped = globalFiyatKom.map((m: any) => ({
          adSoyad: m.ad_soyad || '',
          unvan: m.unvan || '',
          gorev: m.gorev || 'Fiyat Araştırma Görevlisi',
          gorevi: m.gorev || 'Fiyat Araştırma Görevlisi',
          komisyonGorevi: m.gorev || 'Fiyat Araştırma Görevlisi',
          rol: m.rol || 'Üye'
        }))
        baseData.fiyatKomisyonu = mapped
        baseData.gorevlendirilenler = mapped
        baseData.gorevliler = mapped
        baseData.dagitimListesi = mapped
        baseData.komisyon = mapped
      }
    }

    // Muayene komisyonu fallback'i
    if (
      !baseData.muayeneKomisyonu ||
      (Array.isArray(baseData.muayeneKomisyonu) && baseData.muayeneKomisyonu.length === 0)
    ) {
      const globalMuayeneKom = globalKomisyonlar.filter((k: any) => {
        const kId = k.komisyon_id
        const kAd = (k.komisyon_adi || '').toLowerCase()
        return kId === 2 || kAd.includes('muayene') || kAd.includes('kabul')
      })
      if (globalMuayeneKom.length > 0) {
        baseData.muayeneKomisyonu = globalMuayeneKom.map((m: any) => ({
          adSoyad: m.ad_soyad || '',
          unvan: m.unvan || '',
          gorev: m.gorev || 'Üye',
          rol: m.rol || 'Üye'
        }))
      }
    }
  }

  if (
    !baseData.mutemetAdi ||
    baseData.mutemetAdi === '......' ||
    !baseData.muhasebeYetkilisiAdi
  ) {
    const pMuhasebe = (personelList || []).find((p: any) => {
      const u = `${p.unvan || ''} ${p.gorev || ''} ${p.birim || ''}`.toLowerCase()
      return u.includes('muhasebe') || u.includes('mutemet')
    })
    if (pMuhasebe && pMuhasebe.ad_soyad) {
      const cleanName = pMuhasebe.ad_soyad.split('(')[0].trim()
      if (!baseData.mutemetAdi || baseData.mutemetAdi === '......') {
        baseData.mutemetAdi = cleanName
        baseData.mutemetUnvan = pMuhasebe.unvan || 'Muhasebe Yetkilisi'
      }
      baseData.muhasebeYetkilisiAdi = baseData.muhasebeYetkilisiAdi || cleanName
      baseData.muhasebeYetkilisiUnvan =
        baseData.muhasebeYetkilisiUnvan || pMuhasebe.unvan || 'Muhasebe Yetkilisi'
      baseData.muhasebeYetkilisi = baseData.muhasebeYetkilisi || cleanName
    }
  }

  if (
    !baseData.fiyatKomisyonu ||
    (Array.isArray(baseData.fiyatKomisyonu) && baseData.fiyatKomisyonu.length === 0)
  ) {
    if (ctx.fiyatKomisyonu && ctx.fiyatKomisyonu.length > 0) {
      baseData.fiyatKomisyonu = ctx.fiyatKomisyonu
      const activeFromCtx = ctx.fiyatKomisyonu.filter((m: any) => {
        const combined =
          `${m.adSoyad || m.ad_soyad || ''} ${m.unvan || ''} ${m.gorev || m.gorevi || ''}`.toLowerCase()
        return (
          !combined.includes('harcama yetkili') &&
          !combined.includes('gerçekleştirme') &&
          !combined.includes('gerceklestirme') &&
          !combined.includes('muhasebe') &&
          !combined.includes('satın alma harcama') &&
          !combined.includes('talep eden') &&
          !combined.includes('hazırlayan') &&
          (m.adSoyad || m.ad_soyad)
        )
      })
      baseData.gorevlendirilenler = activeFromCtx.length > 0 ? activeFromCtx : ctx.fiyatKomisyonu
      baseData.gorevliler = baseData.gorevlendirilenler
      baseData.dagitimListesi = baseData.gorevlendirilenler
    } else {
      const defaultPersonnel = (personelList || [])
        .filter((p: any) => {
          const u = `${p.unvan || ''} ${p.ad_soyad || ''}`.toLowerCase()
          return !u.includes('harcama yetkili') && !u.includes('belediye başkanı')
        })
        .slice(0, 2)
        .map((p: any) => ({
          adSoyad: p.ad_soyad || '',
          unvan: p.unvan || 'Memur',
          gorev: 'Fiyat Araştırma Görevlisi',
          gorevi: 'Fiyat Araştırma Görevlisi',
          rol: 'Üye'
        }))
      if (defaultPersonnel.length > 0) {
        baseData.fiyatKomisyonu = defaultPersonnel
        baseData.gorevlendirilenler = defaultPersonnel
        baseData.gorevliler = defaultPersonnel
        baseData.dagitimListesi = defaultPersonnel
        baseData.komisyon = defaultPersonnel
      }
    }
  }

  if (
    !baseData.muayeneKomisyonu ||
    (Array.isArray(baseData.muayeneKomisyonu) && baseData.muayeneKomisyonu.length === 0)
  ) {
    if (ctx.muayeneKomisyonu && ctx.muayeneKomisyonu.length > 0) {
      baseData.muayeneKomisyonu = ctx.muayeneKomisyonu
    }
  }
  if (!baseData.komisyon || (Array.isArray(baseData.komisyon) && baseData.komisyon.length === 0)) {
    if (ctx.komisyon && ctx.komisyon.length > 0) {
      baseData.komisyon = ctx.komisyon
    } else if (baseData.fiyatKomisyonu && baseData.fiyatKomisyonu.length > 0) {
      baseData.komisyon = baseData.fiyatKomisyonu
    }
  }

  // Deduplicate all commission member lists in baseData
  if (Array.isArray(baseData.fiyatKomisyonu))
    baseData.fiyatKomisyonu = dedupeMembers(baseData.fiyatKomisyonu)
  if (Array.isArray(baseData.gorevlendirilenler))
    baseData.gorevlendirilenler = dedupeMembers(baseData.gorevlendirilenler)
  if (Array.isArray(baseData.gorevliler)) baseData.gorevliler = dedupeMembers(baseData.gorevliler)
  if (Array.isArray(baseData.dagitimListesi))
    baseData.dagitimListesi = dedupeMembers(baseData.dagitimListesi)
  if (Array.isArray(baseData.muayeneKomisyonu))
    baseData.muayeneKomisyonu = dedupeMembers(baseData.muayeneKomisyonu)
  if (Array.isArray(baseData.komisyon)) baseData.komisyon = dedupeMembers(baseData.komisyon)

  const activeFirms =
    fileFirms.length > 0
      ? fileFirms
      : propInvitedFirms && propInvitedFirms.length > 0
        ? propInvitedFirms
        : baseData.firmalar && Array.isArray(baseData.firmalar) && baseData.firmalar.length > 0
          ? baseData.firmalar
          : baseData.firmaListesi &&
              Array.isArray(baseData.firmaListesi) &&
              baseData.firmaListesi.length > 0
            ? baseData.firmaListesi.slice(0, 3)
            : combinedFirms && combinedFirms.length > 0
              ? combinedFirms.slice(0, 3)
              : []
  baseData.firmalar = activeFirms
  baseData.firmaListesi = combinedFirms

  // Kazanan firma tespiti
  const winnerFirmaId =
    payloadData.dosya?.firma_id ||
    dosyaRecord?.firma_id ||
    fileFirms.find((f: any) => f.kazanan_mi === 1 || f.isWinner)?.id

  const winnerFirm =
    fileFirms.find(
      (f: any) =>
        (winnerFirmaId &&
          (f.id === winnerFirmaId ||
            f.temin_firma_id === winnerFirmaId ||
            f.firma_id === winnerFirmaId)) ||
        f.kazanan_mi === 1 ||
        f.isWinner
    ) ||
    fileFirms[0] ||
    activeFirms[0] ||
    combinedFirms[0]

  if (winnerFirm && (winnerFirm.unvan || winnerFirm.firma_adi)) {
    const resolvedUnvan = winnerFirm.unvan || winnerFirm.firma_adi
    if (
      !baseData.yukleniciFirma ||
      baseData.yukleniciFirma === 'YÜKLENİCİ FİRMA' ||
      baseData.yukleniciFirma === 'İstekli Firma' ||
      baseData.yukleniciFirma.includes('[Belirtilmedi')
    ) {
      baseData.yukleniciFirma = resolvedUnvan
    }
    if (winnerFirm.adres && !baseData.yukleniciAdresi) {
      baseData.yukleniciAdresi = winnerFirm.adres
      baseData.yukleniciIlce = winnerFirm.ilce
      baseData.yukleniciIl = winnerFirm.il
    }
    if (
      !baseData.teslimEden_0_adSoyad ||
      baseData.teslimEden_0_adSoyad === '' ||
      baseData.teslimEden_0_adSoyad.includes('[Belirtilmedi')
    ) {
      baseData.teslimEden_0_adSoyad = resolvedUnvan
      baseData.teslimEden_0_unvan = winnerFirm.yetkili_ad_soyad
        ? `Yetkili: ${winnerFirm.yetkili_ad_soyad}`
        : 'Yüklenici Firma / Yetkilisi'
    }
  }

  // Seçilen veya hedeflenen istekli firma bilgileri (Mektup ve Teklif formları için)
  const globalStoreState = useGlobalDocumentPreviewStore.getState()
  const explicitFirm =
    globalStoreState.selectedFirma ||
    globalStoreState.initialData?.selectedFirma ||
    (propInvitedFirms && propInvitedFirms.length === 1 ? propInvitedFirms[0] : null)

  if (explicitFirm) {
    const fUnvan = explicitFirm.unvan || explicitFirm.firma_adi || ''
    const fAdres = explicitFirm.adres || ''
    const fIlce = explicitFirm.ilce || explicitFirm.semt || ''
    const fIl = explicitFirm.il || explicitFirm.sehir || ''
    const fSehir = [fIlce, fIl].filter(Boolean).join(' / ') || fIl
    const fVergiNo = explicitFirm.vergi_no || ''
    const fTelefon = explicitFirm.telefon || ''
    const fEmail = explicitFirm.email || explicitFirm.eposta || ''

    baseData.selectedFirma = explicitFirm
    baseData.firmaUnvani = fUnvan
    baseData.sayinIlgili = fUnvan ? `Sayın ${fUnvan}` : 'Sayın İlgili,'
    baseData.firmaAdresi = fAdres
    baseData.firmaSehir = fSehir
    baseData.firmaVergiNo = fVergiNo
    baseData.teklifSahibi = fUnvan
    baseData.tebligatAdresi = [fAdres, fSehir].filter(Boolean).join(' ') || fAdres
    baseData.vergiNo = fVergiNo
    baseData.telefonFaks = fTelefon
    baseData.eposta = fEmail
  }

  if (globalStoreState.initialData) {
    Object.assign(baseData, globalStoreState.initialData)
  }

  // Teslim süresi
  if (
    dosyaObj.teslim_gun !== undefined &&
    dosyaObj.teslim_gun !== null &&
    String(dosyaObj.teslim_gun).trim() !== ''
  ) {
    baseData.teslimGun = String(dosyaObj.teslim_gun)
    baseData.teslimGunu = String(dosyaObj.teslim_gun)
  } else if (dosyaObj.teslim_suresi) {
    baseData.teslimGun = String(dosyaObj.teslim_suresi)
    baseData.teslimGunu = String(dosyaObj.teslim_suresi)
  } else if (dosyaObj.teslim_tarihi) {
    const tDate = new Date(dosyaObj.teslim_tarihi)
    const baseDate = dosyaObj.tarih
      ? new Date(dosyaObj.tarih)
      : dosyaObj.dosya_acilis_tarihi
        ? new Date(dosyaObj.dosya_acilis_tarihi)
        : new Date()
    const diffDays = Math.ceil((tDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays > 0 && diffDays < 365) {
      baseData.teslimGun = String(diffDays)
      baseData.teslimGunu = String(diffDays)
    }
  }
  if (!baseData.teslimGun) {
    baseData.teslimGun = '7'
    baseData.teslimGunu = '7'
  }

  const baseKalemler =
    baseData.ihtiyacKalemleri &&
    Array.isArray(baseData.ihtiyacKalemleri) &&
    baseData.ihtiyacKalemleri.length > 0
      ? baseData.ihtiyacKalemleri
      : items

  if (baseKalemler && Array.isArray(baseKalemler)) {
    let grandTotalNum = 0

    baseData.ihtiyacKalemleri = baseKalemler.map((kalem: any, idx: number) => {
      const miktarNum = Number(kalem.miktar || 1)
      const kalemId = kalem.id || items[idx]?.id || idx + 1
      let minPrice = Infinity
      let bestFirmName = ''
      let winnerPrice = 0

      const teklifler = activeFirms.map((firm: any, fIdx: number) => {
        const firmId = firm.id ?? firm.temin_firma_id ?? firm.firma_id
        const firmUnvan = (firm.unvan || firm.firma_adi || firm.firmaUnvan || '').trim().toLowerCase()

        // 1. Match from bids list
        const bid = bids.find(
          (b: any) =>
            (b.temin_kalem_id === kalemId ||
              b.temin_kalem_id === kalem.siraNo ||
              b.temin_kalem_id === idx + 1 ||
              b.kalem_id === kalemId) &&
            (b.temin_firma_id === firmId ||
              b.temin_firma_id === firm.temin_firma_id ||
              b.temin_firma_id === firm.id ||
              b.firma_id === firm.firma_id ||
              b.firma_id === firm.id)
        )

        let priceVal: any = bid ? (bid.birim_fiyat ?? bid.fiyat ?? bid.birimFiyat) : undefined

        // 2. Check in kalem's existing teklifler/firmaTeklifleri if not found
        if (priceVal === undefined || priceVal === null || priceVal === '' || priceVal === '-') {
          const existingOffers =
            kalem.firmaTeklifleriDetay || kalem.firmaTeklifleri || kalem.teklifler || []
          if (Array.isArray(existingOffers) && existingOffers.length > 0) {
            const foundOffer =
              existingOffers.find((eo: any) => {
                const eoId = eo.firmaId ?? eo.temin_firma_id ?? eo.firma_id ?? eo.id
                if (firmId !== undefined && eoId !== undefined && String(firmId) === String(eoId))
                  return true
                const eoUnvan = (eo.firmaUnvan || eo.unvan || eo.firma_adi || '')
                  .trim()
                  .toLowerCase()
                if (firmUnvan && eoUnvan && firmUnvan === eoUnvan) return true
                return false
              }) || existingOffers[fIdx]

            if (foundOffer) {
              priceVal = foundOffer.birimFiyat ?? foundOffer.fiyat ?? foundOffer.birim_fiyat
            }
          }
        }

        let priceNum = 0
        if (priceVal !== undefined && priceVal !== null && priceVal !== '' && priceVal !== '-') {
          if (typeof priceVal === 'number') {
            priceNum = isNaN(priceVal) ? 0 : priceVal
          } else {
            const clean = String(priceVal).replace(/[^0-9.,-]/g, '')
            let parsed = 0
            if (clean.includes(',') && !clean.includes('.')) {
              parsed = parseFloat(clean.replace(',', '.'))
            } else if (clean.includes('.') && clean.includes(',')) {
              parsed = parseFloat(clean.replace(/\./g, '').replace(',', '.'))
            } else {
              parsed = parseFloat(clean)
            }
            priceNum = isNaN(parsed) ? 0 : parsed
          }
        }

        if (priceNum > 0 && priceNum < minPrice) {
          minPrice = priceNum
          bestFirmName = firm.unvan || firm.firma_adi || ''
        }

        if (
          winnerFirm &&
          (firm.id === winnerFirm.id || firm.temin_firma_id === winnerFirm.temin_firma_id) &&
          priceNum > 0
        ) {
          winnerPrice = priceNum
        }

        const formattedPrice =
          priceNum > 0
            ? priceNum.toLocaleString('tr-TR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })
            : '-'

        const itemTotalNum = priceNum * miktarNum
        const formattedTutar =
          itemTotalNum > 0
            ? itemTotalNum.toLocaleString('tr-TR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })
            : '-'

        return {
          firmaId: firm.id,
          firmaUnvan: firm.unvan || firm.firma_adi || `Firma ${fIdx + 1}`,
          birimFiyat: priceNum,
          fiyat: formattedPrice,
          tutar: formattedTutar
        }
      })

      const effectivePrice = winnerPrice > 0 ? winnerPrice : minPrice !== Infinity ? minPrice : 0
      const itemCostNum = effectivePrice * miktarNum
      grandTotalNum += itemCostNum

      return {
        ...kalem,
        id: kalemId,
        siraNo: kalem.siraNo || idx + 1,
        kodu: kalem.kodu || kalem.tasinir_kodu || items[idx]?.tasinir_kodu || '-',
        malzemeAdi: kalem.malzemeAdi || kalem.kalem_adi || items[idx]?.kalem_adi || '',
        ozelligi: kalem.ozelligi || kalem.aciklama || items[idx]?.aciklama || '',
        birimi: kalem.birimi || kalem.birim || items[idx]?.birim || '',
        miktar: miktarNum,
        enUygunFirmaAdi: bestFirmName,
        enDusukFiyat:
          effectivePrice > 0
            ? effectivePrice.toLocaleString('tr-TR', {
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

    // Build firm totals row
    const firmTotals = activeFirms.map((firm: any) => {
      let firmTotalNum = 0
      baseData.ihtiyacKalemleri.forEach((kalem: any) => {
        const miktarNum = Number(kalem.miktar || 0)
        const tf = (kalem.firmaTeklifleriDetay || []).find(
          (t: any) =>
            (firm.id && t.firmaId === firm.id) ||
            (firm.unvan && t.firmaUnvan === firm.unvan)
        )
        if (tf && tf.birimFiyat > 0) {
          firmTotalNum += tf.birimFiyat * miktarNum
        }
      })

      return {
        firmaId: firm.id,
        unvan: firm.unvan || firm.firma_adi || '',
        toplam:
          firmTotalNum > 0
            ? firmTotalNum.toLocaleString('tr-TR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })
            : '0,00'
      }
    })

    baseData.firmaToplamlari = firmTotals
    baseData.firmaToplamlariDetay = firmTotals

    if (winnerFirm?.teklif_toplami && Number(winnerFirm.teklif_toplami) > 0) {
      baseData.genelToplam = Number(winnerFirm.teklif_toplami).toLocaleString('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    } else if (grandTotalNum > 0) {
      baseData.genelToplam = grandTotalNum.toLocaleString('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    }
  }

  // Son alım fiyat cetveli kalemleri
  if (
    (!baseData.fiyatKalemleri || baseData.fiyatKalemleri.length === 0) &&
    baseData.ihtiyacKalemleri &&
    baseData.ihtiyacKalemleri.length > 0
  ) {
    baseData.fiyatKalemleri = baseData.ihtiyacKalemleri.map((k: any, idx: number) => {
      const birimFiyatStr =
        k.enDusukFiyat && k.enDusukFiyat !== '-'
          ? k.enDusukFiyat
          : k.birimFiyat
            ? Number(k.birimFiyat).toLocaleString('tr-TR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })
            : '0,00'
      const toplamTutarStr =
        k.toplamBedel && k.toplamBedel !== '-'
          ? k.toplamBedel
          : k.toplamTutar
            ? Number(k.toplamTutar).toLocaleString('tr-TR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })
            : '0,00'

      return {
        siraNo: k.siraNo || idx + 1,
        malzemeKodu: k.kodu || k.malzemeKodu || k.tasinir_kodu || '-',
        malzemeAdi: k.malzemeAdi || k.kalem_adi || '',
        ozelligi: k.ozelligi || k.aciklama || '',
        birimi: k.birimi || k.birim || '',
        kdvOrani: k.kdvOrani ? String(k.kdvOrani).replace('%', '') : '20',
        miktar: k.miktar || 1,
        birimFiyat: birimFiyatStr,
        toplamTutar: toplamTutarStr,
        kazananFirma: k.kazananFirma || winnerFirm?.unvan || k.enUygunFirmaAdi || '-',
        alimTarihi:
          k.alimTarihi ||
          dosyaObj.sozlesme_tarihi ||
          dosyaObj.dosya_acilis_tarihi ||
          dosyaObj.tarih ||
          '-'
      }
    })
  }

  // Fetch direct JSON Snapshot from DB if available
  let snapshotData = payloadData.savedSnapshot
  if (activeDosyaId) {
    try {
      const dbSnap = await queryExecutor(
        `SELECT veri_json FROM DATA_DosyaSablonVeri 
         WHERE temin_dosya_id = ? AND (
           sablon_kodu = ? 
           OR sablon_kodu = ? 
           OR sablon_id = (SELECT id FROM TANIM_Sablon WHERE dosya_adi = ? OR dosya_adi = ? LIMIT 1)
         )
         ORDER BY id DESC LIMIT 1`,
        [
          activeDosyaId,
          resolvedId,
          `${resolvedId}.html`,
          `${resolvedId}.html`,
          `${resolvedId}.html`
        ]
      )
      if (dbSnap && dbSnap.length > 0 && dbSnap[0]?.veri_json) {
        snapshotData = JSON.parse(dbSnap[0].veri_json)
      }
    } catch (e) {
      console.error('Direct snapshot query error:', e)
    }
  }

  // Overlay Saved Snapshot JSON on top of defaults
  let finalData = { ...baseData }
  let activeLogoLeft = showLogoLeft
  let activeLogoRight = showLogoRight
  let activeOrientation: 'portrait' | 'landscape' = 'portrait'

  if (snapshotData && typeof snapshotData === 'object') {
    try {
      for (const [key, val] of Object.entries(snapshotData)) {
        if (val !== undefined && val !== null) {
          if (key === 'solLogo' && (!val || String(val).trim() === '')) {
            continue
          }
          if (key === 'sagLogo' && (!val || String(val).trim() === '')) {
            continue
          }
          if (
            (key === 'mutemetAdi' ||
              key === 'muhasebeYetkilisiAdi' ||
              key === 'muhasebeYetkilisi') &&
            (!val ||
              val === '......' ||
              val === 'Mutemet / Muhasebe Yetkilisi' ||
              String(val).trim() === '') &&
            baseData.mutemetAdi
          ) {
            continue
          }
          if (
            (key === 'onaylayanPersonelAdi' || key === 'harcamaYetkilisiAdi') &&
            (!val || val === '......' || String(val).trim() === '') &&
            baseData.onaylayanPersonelAdi
          ) {
            continue
          }
          if (
            (key === 'hazirlayanPersonelAdi' || key === 'gerceklestirmeGorevlisiAdi') &&
            (!val || val === '......' || String(val).trim() === '') &&
            baseData.hazirlayanPersonelAdi
          ) {
            continue
          }
          finalData[key] = val
        }
      }
      const explicitTarih =
        snapshotData.tarih || snapshotData.onayaSunulanTarih || snapshotData.belgeTarihi
      if (explicitTarih) {
        if (!finalData.tarih) finalData.tarih = explicitTarih
        if (!finalData.onayaSunulanTarih) finalData.onayaSunulanTarih = explicitTarih
        if (!finalData.belgeTarihi) finalData.belgeTarihi = explicitTarih
      }
      const explicitOnayTarih = snapshotData.onayTarihi || snapshotData.olurTarihi
      if (explicitOnayTarih) {
        finalData.onayTarihi = explicitOnayTarih
        finalData.olurTarihi = explicitOnayTarih
      }
      if (snapshotData.showLogoLeft !== undefined) {
        activeLogoLeft = Boolean(snapshotData.showLogoLeft)
      }
      if (snapshotData.showLogoRight !== undefined) {
        activeLogoRight = Boolean(snapshotData.showLogoRight)
      }
      if (snapshotData.orientation) {
        activeOrientation = snapshotData.orientation
      }
    } catch (e) {
      console.error('Failed to merge saved snapshot JSON', e)
    }
  }

  if (!finalData.solLogo && resolvedSolLogo) {
    finalData.solLogo = resolvedSolLogo
  }
  if (!finalData.sagLogo && resolvedSagLogo) {
    finalData.sagLogo = resolvedSagLogo
  }

  const initialSnapshotJson = JSON.stringify({
    ...finalData,
    showLogoLeft: activeLogoLeft,
    showLogoRight: activeLogoRight,
    olurYazisi: finalData.olurYazisi !== false,
    orientation: activeOrientation
  })

  return {
    finalData,
    personelListesi: personelList || [],
    firmaListesi: combinedFirms,
    dosyaRecord,
    activeLogoLeft,
    activeLogoRight,
    activeOrientation,
    initialSnapshotJson
  }
}

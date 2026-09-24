import { TeminDosyasi } from '../screens/dosyalar/dosyalar.hooks'
import { emitAppEvent } from './appEvents'

export interface CloneDosyaCustomOptions {
  temin_no?: string
  butce_yili?: number
  konu?: string
  dosya_acilis_tarihi?: string
  son_teklif_verme_tarihi?: string
  teslim_tarihi?: string
  cloneItems?: boolean // Malzeme & Hizmet Kalemleri (varsayılan: true)
  cloneFirms?: boolean // İstekli / Davet Edilen Firmalar (varsayılan: true)
  cloneCommissions?: boolean // Komisyon Üyeleri (varsayılan: false)
}

export interface CloneDosyaResult {
  success: boolean
  newId?: number
  nextTeminNo?: string
  error?: string
  clonedItemCount?: number
  clonedFirmCount?: number
  clonedCommissionCount?: number
}

/**
 * Belirtilen yıl için en son kullanılan DT sıra numarasını bulur ve bir sonraki numarayı döner (örn: 2026/5).
 */
export async function calculateNextTeminNo(
  targetYear: number = new Date().getFullYear(),
  dosyalarList: TeminDosyasi[] = []
): Promise<string> {
  const yearStr = String(targetYear)
  let maxSeq = 0

  // 1. Mevcut listeden tara
  dosyalarList.forEach((d) => {
    const raw = (d.temin_no || '').trim()
    if (!raw) return
    const parts = raw.split(/[/_ -]+/)
    for (let i = parts.length - 1; i >= 0; i--) {
      const num = parseInt(parts[i], 10)
      if (!isNaN(num) && num !== targetYear && num > 0) {
        if (num > maxSeq) maxSeq = num
        break
      }
    }
  })

  // 2. SQLite veritabanını doğrudan sorgulayarak en güncel numarayı garantile
  if (window.electron?.ipcRenderer) {
    try {
      const dbRes = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT temin_no, butce_yili FROM DATA_TeminDosyasi'
      )
      if (dbRes?.success && Array.isArray(dbRes.data)) {
        dbRes.data.forEach((r: any) => {
          const raw = (r.temin_no || '').trim()
          if (!raw) return
          const parts = raw.split(/[/_ -]+/)
          for (let i = parts.length - 1; i >= 0; i--) {
            const num = parseInt(parts[i], 10)
            if (!isNaN(num) && num !== targetYear && num > 0) {
              if (num > maxSeq) maxSeq = num
              break
            }
          }
        })
      }
    } catch (err) {
      console.warn('DB temin_no listeleme uyarısı:', err)
    }
  }

  return `${yearStr}/${maxSeq + 1}`
}

/**
 * Bir dosyanın alt kalem, firma ve komisyon sayılarını sorgular.
 */
export async function getDosyaCounts(
  dosyaId: number
): Promise<{ itemCount: number; firmCount: number; commissionCount: number }> {
  let itemCount = 0
  let firmCount = 0
  let commissionCount = 0

  if (window.electron?.ipcRenderer && dosyaId) {
    try {
      const [itemsRes, firmsRes, commRes] = await Promise.all([
        window.electron.ipcRenderer.invoke(
          'db:query',
          'SELECT COUNT(*) as cnt FROM DATA_TeminKalem WHERE temin_dosya_id = ?',
          [dosyaId]
        ),
        window.electron.ipcRenderer.invoke(
          'db:query',
          'SELECT COUNT(*) as cnt FROM DATA_TeminFirma WHERE temin_dosya_id = ?',
          [dosyaId]
        ),
        window.electron.ipcRenderer.invoke(
          'db:query',
          'SELECT COUNT(*) as cnt FROM DATA_TeminKomisyon WHERE temin_dosya_id = ?',
          [dosyaId]
        )
      ])
      if (itemsRes?.success && itemsRes.data?.[0]?.cnt !== undefined) {
        itemCount = itemsRes.data[0].cnt
      }
      if (firmsRes?.success && firmsRes.data?.[0]?.cnt !== undefined) {
        firmCount = firmsRes.data[0].cnt
      }
      if (commRes?.success && commRes.data?.[0]?.cnt !== undefined) {
        commissionCount = commRes.data[0].cnt
      }
    } catch (err) {
      console.error('Dosya alt sayaçları sorgulama hatası:', err)
    }
  }

  return { itemCount, firmCount, commissionCount }
}

/**
 * Mevcut Doğrudan Temin Dosyasını Kalemleri, Firmaları ve Komisyonlarıyla Birlikte Klonlar.
 * Kullanıcının belirlediği tarih ve veri kapsamı seçeneklerini uygular.
 */
export async function cloneDosyaWithItems(
  eskiDosya: TeminDosyasi,
  dosyalarList: TeminDosyasi[],
  addDosyaFn: (data: Partial<TeminDosyasi>) => Promise<any>,
  options?: CloneDosyaCustomOptions
): Promise<CloneDosyaResult> {
  try {
    const currentYear = new Date().getFullYear()
    const targetYear =
      options?.butce_yili ||
      (options?.dosya_acilis_tarihi
        ? new Date(options.dosya_acilis_tarihi).getFullYear()
        : currentYear)

    // 1. Sıradaki dosya numarasını hesapla veya kullanıcının girdisini al
    const finalTeminNo =
      options?.temin_no?.trim() || (await calculateNextTeminNo(targetYear, dosyalarList))

    const finalKonu = options?.konu?.trim() || `${eskiDosya.konu || 'Doğrudan Temin'} (Kopya)`
    const finalAcilisTarihi = options?.dosya_acilis_tarihi || new Date().toISOString().split('T')[0]
    const finalSonTeklifTarihi = options?.son_teklif_verme_tarihi || ''
    const finalTeslimTarihi = options?.teslim_tarihi || ''

    const shouldCloneItems = options?.cloneItems !== false
    const shouldCloneFirms = options?.cloneFirms !== false
    const shouldCloneCommissions = options?.cloneCommissions === true

    // 2. Eski dosyanın kalemlerini, firmalarını ve komisyonlarını çek
    let oldItems: any[] = []
    let oldFirms: any[] = []
    let oldCommissions: any[] = []

    if (window.electron?.ipcRenderer && eskiDosya.id) {
      try {
        const [itemsRes, firmsRes, commRes] = await Promise.all([
          shouldCloneItems
            ? window.electron.ipcRenderer.invoke(
                'db:query',
                'SELECT * FROM DATA_TeminKalem WHERE temin_dosya_id = ? ORDER BY id ASC',
                [eskiDosya.id]
              )
            : Promise.resolve({ success: true, data: [] }),
          shouldCloneFirms
            ? window.electron.ipcRenderer.invoke(
                'db:query',
                'SELECT * FROM DATA_TeminFirma WHERE temin_dosya_id = ?',
                [eskiDosya.id]
              )
            : Promise.resolve({ success: true, data: [] }),
          shouldCloneCommissions
            ? window.electron.ipcRenderer.invoke(
                'db:query',
                'SELECT * FROM DATA_TeminKomisyon WHERE temin_dosya_id = ?',
                [eskiDosya.id]
              )
            : Promise.resolve({ success: true, data: [] })
        ])
        if (itemsRes?.success && Array.isArray(itemsRes.data)) oldItems = itemsRes.data
        if (firmsRes?.success && Array.isArray(firmsRes.data)) oldFirms = firmsRes.data
        if (commRes?.success && Array.isArray(commRes.data)) oldCommissions = commRes.data
      } catch (err) {
        console.error('Eski dosya verilerini okuma hatası:', err)
      }
    }

    // 3. Yeni dosya ana kaydını oluştur
    const newDosyaPayload: any = {
      ...eskiDosya,
      id: undefined,
      temin_no: finalTeminNo,
      butce_yili: targetYear,
      konu: finalKonu,
      dosya_acilis_tarihi: finalAcilisTarihi,
      son_teklif_verme_tarihi: finalSonTeklifTarihi,
      teslim_tarihi: finalTeslimTarihi,
      status: 'devam_ediyor',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Tabloda olmayan join ve aşama çıktı alanlarını temizle (temiz başlangıç)
    delete newDosyaPayload.birim_adi
    delete newDosyaPayload.hazirlayan_ad
    delete newDosyaPayload.onaylayan_ad
    delete newDosyaPayload.sunan_ad
    delete newDosyaPayload.talep_eden_ad
    delete newDosyaPayload.irtibat_ad
    delete newDosyaPayload.firma_sayisi
    delete newDosyaPayload.kalem_sayisi
    delete newDosyaPayload.toplam_tutar
    delete newDosyaPayload.kazanan_firma_adi
    delete newDosyaPayload.fatura_no
    delete newDosyaPayload.fatura_tarihi
    delete newDosyaPayload.fatura_tutari
    delete newDosyaPayload.karar_no
    delete newDosyaPayload.karar_tarihi
    delete newDosyaPayload.kabul_tarihi
    delete newDosyaPayload.odeme_emri_no
    delete newDosyaPayload.odeme_emri_tarihi

    const createRes = await addDosyaFn(newDosyaPayload)
    const newId =
      (createRes as any)?.lastInsertRowid ||
      (createRes as any)?.data?.lastInsertRowid ||
      (createRes as any)?.id

    if (newId && window.electron?.ipcRenderer) {
      // 4. Kalemleri klonla (Eğer seçildiyse)
      if (shouldCloneItems && oldItems.length > 0) {
        for (const it of oldItems) {
          await window.electron.ipcRenderer.invoke(
            'db:run',
            `INSERT INTO DATA_TeminKalem 
             (temin_dosya_id, kalem_adi, aciklama, birim, miktar, tasinir_kodu, okas_kodu, kdv_orani, tipi)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              newId,
              it.kalem_adi || it.malzeme_adi || '',
              it.aciklama || '',
              it.birim || 'Adet',
              it.miktar || 1,
              it.tasinir_kodu || '',
              it.okas_kodu || '',
              it.kdv_orani ?? 20,
              it.tipi || 'Mal'
            ]
          )
        }
      }

      // 5. İstekli firmaları klonla (Eğer seçildiyse)
      if (shouldCloneFirms && oldFirms.length > 0) {
        for (const f of oldFirms) {
          await window.electron.ipcRenderer.invoke(
            'db:run',
            `INSERT INTO DATA_TeminFirma 
             (temin_dosya_id, firma_id, unvan, yetkili_ad_soyad, telefon, email, adres, vergi_no, vergi_dairesi)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              newId,
              f.firma_id,
              f.unvan,
              f.yetkili_ad_soyad || '',
              f.telefon || '',
              f.email || '',
              f.adres || '',
              f.vergi_no || '',
              f.vergi_dairesi || ''
            ]
          )
        }
      }

      // 6. Komisyon üyelerini klonla (Eğer seçildiyse)
      if (shouldCloneCommissions && oldCommissions.length > 0) {
        for (const c of oldCommissions) {
          await window.electron.ipcRenderer.invoke(
            'db:run',
            `INSERT INTO DATA_TeminKomisyon 
             (temin_dosya_id, komisyon_id, personel_id, ad_soyad, unvan, gorevi, komisyon_turu)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              newId,
              c.komisyon_id || null,
              c.personel_id || null,
              c.ad_soyad || '',
              c.unvan || '',
              c.gorevi || 'Üye',
              c.komisyon_turu || ''
            ]
          )
        }
      }

      // Realtime eventler
      emitAppEvent('dossier:created', { dosyaId: newId })
      emitAppEvent('dossier:updated', { dosyaId: newId })
      emitAppEvent('items:changed', { dosyaId: newId })
      emitAppEvent('workspace:refreshed', {})

      return {
        success: true,
        newId,
        nextTeminNo: finalTeminNo,
        clonedItemCount: shouldCloneItems ? oldItems.length : 0,
        clonedFirmCount: shouldCloneFirms ? oldFirms.length : 0,
        clonedCommissionCount: shouldCloneCommissions ? oldCommissions.length : 0
      }
    }

    return { success: false, error: 'Dosya kaydı veritabanına eklenemedi.' }
  } catch (err: any) {
    console.error('Klonlama motoru hatası:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Komisyon Varsayılan Aktarımı (Seed) ve Yaşam Döngüsü Servisi
 * Aşama 7.1.3.1 Mimari Standartları
 */

export interface SeedCommissionOptions {
  mode?: 'initial' | 'missing_only' | 'replace'
  force?: boolean
}

export interface SeedCommissionResult {
  success: boolean
  skipped?: boolean
  reason?: 'already_seeded' | 'deliberately_cleared' | 'legacy_dossier' | 'no_default_members'
  seededCount?: number
  error?: string
}

export type DossierCommissionLifecycleStatus =
  | 'new_unseeded' // Yeni dosya, henüz aktarım yapılmadı (komisyon_seed_edildi === 0)
  | 'seeded' // Kurumsal varsayılanlar başarıyla aktarıldı (komisyon_seed_edildi === 1)
  | 'deliberately_empty' // Kullanıcı bilerek tüm üyeleri sildi (komisyon_seed_edildi === 2)
  | 'legacy_file' // Geçmişten gelen eski dosya (komisyon_seed_edildi IS NULL)

/**
 * Dosyanın komisyon yaşam döngüsü durumunu sorgular
 */
export async function getDossierCommissionStatus(
  dosyaId: number
): Promise<{ status: DossierCommissionLifecycleStatus; memberCount: number }> {
  try {
    const dosyaRes = await (window as any).electron.ipcRenderer.invoke(
      'db:query',
      'SELECT id, komisyon_seed_edildi FROM DATA_TeminDosyasi WHERE id = ? LIMIT 1',
      [dosyaId]
    )
    const dosya = dosyaRes?.data?.[0]
    if (!dosya) {
      return { status: 'legacy_file', memberCount: 0 }
    }

    const countRes = await (window as any).electron.ipcRenderer.invoke(
      'db:query',
      'SELECT COUNT(*) as cnt FROM DATA_TeminKomisyon WHERE temin_dosya_id = ?',
      [dosyaId]
    )
    const memberCount = countRes?.data?.[0]?.cnt || 0

    const seedState = dosya.komisyon_seed_edildi

    if (seedState === 1) {
      return { status: 'seeded', memberCount }
    }
    if (seedState === 2) {
      return { status: 'deliberately_empty', memberCount }
    }
    if (seedState === 0) {
      return { status: 'new_unseeded', memberCount }
    }
    return { status: 'legacy_file', memberCount }
  } catch (err) {
    console.error('getDossierCommissionStatus error:', err)
    return { status: 'legacy_file', memberCount: 0 }
  }
}

/**
 * Kullanıcı dosyadaki tüm üyeleri bilerek sildiğinde dosya durumunu 'bilinçli boş' olarak işaretler
 */
export async function markDossierAsDeliberatelyCleared(dosyaId: number): Promise<boolean> {
  try {
    const res = await (window as any).electron.ipcRenderer.invoke(
      'db:run',
      'UPDATE DATA_TeminDosyasi SET komisyon_seed_edildi = 2 WHERE id = ?',
      [dosyaId]
    )
    return Boolean(res?.success)
  } catch (err) {
    console.error('markDossierAsDeliberatelyCleared error:', err)
    return false
  }
}

/**
 * Kurumsal varsayılan komisyon üyelerini dosyaya kontrollü ve atomik olarak aktarır.
 *
 * Güvenceler:
 * 1. Tekil 'db:transaction' içinde çalışır; kısmi hata durumunda otomatik rollback yapılır.
 * 2. Idempotent çalışır; aynı üyeler mükerrer eklenmez.
 * 3. Eski dosyaları (NULL) veya bilinçli boş bırakılmış dosyaları (2) 'force' olmadan ezmez.
 */
export async function seedDossierCommission(
  dosyaId: number,
  options: SeedCommissionOptions = {}
): Promise<SeedCommissionResult> {
  const { mode = 'initial', force = false } = options

  try {
    if (!dosyaId || isNaN(dosyaId)) {
      return { success: false, error: 'Geçersiz dosya ID' }
    }

    // 1. Dosya kaydını oku
    const dosyaRes = await (window as any).electron.ipcRenderer.invoke(
      'db:query',
      'SELECT id, komisyon_seed_edildi FROM DATA_TeminDosyasi WHERE id = ? LIMIT 1',
      [dosyaId]
    )
    const dosya = dosyaRes?.data?.[0]
    if (!dosya) {
      return { success: false, error: 'Dosya bulunamadı' }
    }

    const seedState = dosya.komisyon_seed_edildi

    // Kontroller (force değilse)
    if (!force) {
      if (seedState === 1) {
        return { success: true, skipped: true, reason: 'already_seeded' }
      }
      if (seedState === 2) {
        return { success: true, skipped: true, reason: 'deliberately_cleared' }
      }
      if (seedState === null || seedState === undefined) {
        // Eski dosya: Kullanıcı açık işlem yapmadan otomatik seed edilmez
        return { success: true, skipped: true, reason: 'legacy_dossier' }
      }
    }

    // 2. Kurumsal komisyon tanımlarını ve üyelerini çek
    const defRes = await (window as any).electron.ipcRenderer.invoke(
      'db:query',
      `SELECT u.*, p.ad_soyad, p.unvan, g.ad as gorev_adi, k.ad as komisyon_adi, k.tur as komisyon_tur_kodu
       FROM TANIM_KomisyonUye u
       JOIN TANIM_Personel p ON u.personel_id = p.id
       JOIN TANIM_KomisyonGorevi g ON u.gorev_id = g.id
       JOIN TANIM_Komisyon k ON u.komisyon_id = k.id
       WHERE u.personel_id IS NOT NULL
       ORDER BY u.komisyon_id ASC, u.sira ASC`
    )

    if (!defRes?.success || !Array.isArray(defRes.data) || defRes.data.length === 0) {
      // Kurumsal üye tanımlanmamışsa bile dosyayı aktarılmış işaretle
      await (window as any).electron.ipcRenderer.invoke(
        'db:run',
        'UPDATE DATA_TeminDosyasi SET komisyon_seed_edildi = 1 WHERE id = ?',
        [dosyaId]
      )
      return { success: true, skipped: true, reason: 'no_default_members', seededCount: 0 }
    }

    const defaultMembers: any[] = defRes.data

    // 3. Mevcut dosya üyelerini al (Mükerrerlik engeli)
    let existingMemberSet = new Set<string>()
    if (mode !== 'replace') {
      const existingRes = await (window as any).electron.ipcRenderer.invoke(
        'db:query',
        'SELECT komisyon_id, personel_id FROM DATA_TeminKomisyon WHERE temin_dosya_id = ?',
        [dosyaId]
      )
      if (existingRes?.success && Array.isArray(existingRes.data)) {
        existingRes.data.forEach((r: any) => {
          existingMemberSet.add(`${r.komisyon_id}_${r.personel_id}`)
        })
      }
    }

    // 4. Atomik Transaction listesi hazırla
    const txStatements: { sql: string; params: any[] }[] = []

    if (mode === 'replace') {
      txStatements.push({
        sql: 'DELETE FROM DATA_TeminKomisyon WHERE temin_dosya_id = ?',
        params: [dosyaId]
      })
    }

    let insertCount = 0
    for (const m of defaultMembers) {
      const key = `${m.komisyon_id}_${m.personel_id}`
      if (mode !== 'replace' && existingMemberSet.has(key)) {
        continue // Mükerrer eklemeyi engelle
      }

      const rol =
        m.asil_mi === 0
          ? 'Yedek Üye'
          : m.gorev_adi?.toLowerCase().includes('başkan') || m.gorev_adi?.toLowerCase().includes('baskan')
            ? 'Başkan'
            : 'Üye'

      const isShow = m.belgede_goster !== 0 && m.belgede_goster !== false ? 1 : 0
      const scope = m.belge_kapsami || 'tumu'
      const hedefJson = m.hedef_belgeler || '["*"]'

      txStatements.push({
        sql: `INSERT INTO DATA_TeminKomisyon 
              (temin_dosya_id, komisyon_id, personel_id, ad_soyad, unvan, gorev, rol, komisyon_turu, belgede_goster, belge_kapsami, hedef_belgeler, asli_yedek, kaynak)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'kurumsal')`,
        params: [
          dosyaId,
          m.komisyon_id,
          m.personel_id,
          m.ad_soyad,
          m.unvan || null,
          m.gorev_adi || 'Üye',
          rol,
          m.komisyon_adi || 'Komisyon',
          isShow,
          scope,
          hedefJson,
          m.asil_mi === 1 ? 'Asil' : 'Yedek'
        ]
      })
      insertCount++
    }

    // Dosya bayrağını da aynı transaction içinde '1' yap
    txStatements.push({
      sql: 'UPDATE DATA_TeminDosyasi SET komisyon_seed_edildi = 1 WHERE id = ?',
      params: [dosyaId]
    })

    // 5. Tek seferde atomik çalıştır
    const txRes = await (window as any).electron.ipcRenderer.invoke('db:transaction', txStatements)
    if (!txRes?.success) {
      throw new Error(txRes?.error || 'Transaction başarısız oldu')
    }

    return { success: true, seededCount: insertCount }
  } catch (err: any) {
    console.error('seedDossierCommission error:', err)
    return { success: false, error: err.message }
  }
}

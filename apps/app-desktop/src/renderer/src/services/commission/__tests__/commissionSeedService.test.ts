import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  seedDossierCommission,
  getDossierCommissionStatus,
  markDossierAsDeliberatelyCleared
} from '../commissionSeedService'

describe('Aşama 7.1.3.1 - Commission Seed Service Lifecycle Tests', () => {
  let mockDbData: {
    dosyalar: any[]
    komisyonlar: any[]
    tanimUye: any[]
  }
  let transactionExecuted: any[] = []
  let transactionFailNext = false

  beforeEach(() => {
    transactionExecuted = []
    transactionFailNext = false

    mockDbData = {
      dosyalar: [
        { id: 101, konu: 'Yeni Dosya', komisyon_seed_edildi: 0 },
        { id: 102, konu: 'Eski Dosya (Legacy)', komisyon_seed_edildi: null },
        { id: 103, konu: 'Seed Edilmiş Dosya', komisyon_seed_edildi: 1 },
        { id: 104, konu: 'Bilinçli Olarak Boş Dosya', komisyon_seed_edildi: 2 }
      ],
      komisyonlar: [
        // Dosya 103'e ait mevcut komisyon
        {
          id: 1,
          temin_dosya_id: 103,
          komisyon_id: 1,
          personel_id: 5,
          ad_soyad: 'Ahmet Yılmaz',
          rol: 'Başkan'
        }
      ],
      tanimUye: [
        {
          id: 1,
          komisyon_id: 1,
          personel_id: 5,
          ad_soyad: 'Ahmet Yılmaz',
          unvan: 'Müdür',
          gorev_id: 1,
          gorev_adi: 'Komisyon Başkanı',
          komisyon_adi: 'Yaklaşık Maliyet Komisyonu',
          komisyon_tur_kodu: 'maliyet',
          asil_mi: 1,
          belgede_goster: 1
        },
        {
          id: 2,
          komisyon_id: 1,
          personel_id: 6,
          ad_soyad: 'Mehmet Demir',
          unvan: 'Mühendis',
          gorev_id: 2,
          gorev_adi: 'Üye',
          komisyon_adi: 'Yaklaşık Maliyet Komisyonu',
          komisyon_tur_kodu: 'maliyet',
          asil_mi: 1,
          belgede_goster: 1
        },
        {
          id: 3,
          komisyon_id: 2,
          personel_id: 7,
          ad_soyad: 'Ayşe Kaya',
          unvan: 'Tekniker',
          gorev_id: 3,
          gorev_adi: 'Üye',
          komisyon_adi: 'Muayene Kabul Komisyonu',
          komisyon_tur_kodu: 'muayene',
          asil_mi: 1,
          belgede_goster: 1
        }
      ]
    }

    // Window mock
    ;(globalThis as any).window = {
      electron: {
        ipcRenderer: {
          invoke: vi.fn(async (channel: string, ...args: any[]) => {
            if (channel === 'db:query') {
              const sql = args[0] as string
              const params = args[1] || []

              if (sql.includes('SELECT id, komisyon_seed_edildi FROM DATA_TeminDosyasi')) {
                const dosyaId = params[0]
                const d = mockDbData.dosyalar.find((x) => x.id === dosyaId)
                return { success: true, data: d ? [d] : [] }
              }

              if (sql.includes('SELECT COUNT(*) as cnt FROM DATA_TeminKomisyon')) {
                const dosyaId = params[0]
                const count = mockDbData.komisyonlar.filter((x) => x.temin_dosya_id === dosyaId).length
                return { success: true, data: [{ cnt: count }] }
              }

              if (sql.includes('FROM TANIM_KomisyonUye u')) {
                return { success: true, data: [...mockDbData.tanimUye] }
              }

              if (sql.includes('SELECT komisyon_id, personel_id FROM DATA_TeminKomisyon')) {
                const dosyaId = params[0]
                const rows = mockDbData.komisyonlar
                  .filter((x) => x.temin_dosya_id === dosyaId)
                  .map((x) => ({ komisyon_id: x.komisyon_id, personel_id: x.personel_id }))
                return { success: true, data: rows }
              }

              return { success: true, data: [] }
            }

            if (channel === 'db:run') {
              const sql = args[0] as string
              const params = args[1] || []

              if (sql.includes('UPDATE DATA_TeminDosyasi SET komisyon_seed_edildi = 2')) {
                const dosyaId = params[0]
                const d = mockDbData.dosyalar.find((x) => x.id === dosyaId)
                if (d) d.komisyon_seed_edildi = 2
                return { success: true }
              }

              if (sql.includes('UPDATE DATA_TeminDosyasi SET komisyon_seed_edildi = 1')) {
                const dosyaId = params[0]
                const d = mockDbData.dosyalar.find((x) => x.id === dosyaId)
                if (d) d.komisyon_seed_edildi = 1
                return { success: true }
              }

              return { success: true }
            }

            if (channel === 'db:transaction') {
              const queries = args[0] as { sql: string; params: any[] }[]
              if (transactionFailNext) {
                return { success: false, error: 'Simüle edilen transaction hatası (Rollback)' }
              }
              transactionExecuted = [...queries]

              // Simüle işlem uygulama
              for (const q of queries) {
                if (q.sql.includes('UPDATE DATA_TeminDosyasi SET komisyon_seed_edildi = 1')) {
                  const dosyaId = q.params[0]
                  const d = mockDbData.dosyalar.find((x) => x.id === dosyaId)
                  if (d) d.komisyon_seed_edildi = 1
                }
                if (q.sql.includes('INSERT INTO DATA_TeminKomisyon')) {
                  mockDbData.komisyonlar.push({
                    id: mockDbData.komisyonlar.length + 1,
                    temin_dosya_id: q.params[0],
                    komisyon_id: q.params[1],
                    personel_id: q.params[2],
                    ad_soyad: q.params[3]
                  })
                }
                if (q.sql.includes('DELETE FROM DATA_TeminKomisyon WHERE temin_dosya_id = ?')) {
                  const dosyaId = q.params[0]
                  mockDbData.komisyonlar = mockDbData.komisyonlar.filter((x) => x.temin_dosya_id !== dosyaId)
                }
              }

              return { success: true, changes: queries.length }
            }

            return { success: true }
          })
        }
      }
    }
  })

  it('1. Yeni dosya (0): İlk açılışta ve oluşturmada atomik olarak seed edilmeli ve durumu 1 olmalı', async () => {
    const statusBefore = await getDossierCommissionStatus(101)
    expect(statusBefore.status).toBe('new_unseeded')

    const res = await seedDossierCommission(101, { mode: 'initial' })
    expect(res.success).toBe(true)
    expect(res.seededCount).toBe(3) // 3 varsayılan üye aktarıldı

    // Transaction tekil işletildi mi?
    expect(transactionExecuted.length).toBe(4) // 3 insert + 1 dosya durum güncellemesi

    // Son güncelleme dosya bayrağını 1 yaptı mı?
    const lastStmt = transactionExecuted[transactionExecuted.length - 1]
    expect(lastStmt.sql).toContain('komisyon_seed_edildi = 1')
    expect(lastStmt.params[0]).toBe(101)

    const statusAfter = await getDossierCommissionStatus(101)
    expect(statusAfter.status).toBe('seeded')
  })

  it('2. Eski dosya (NULL): Otomatik olarak sessizce tohumlanmamalı (legacy_dossier skip)', async () => {
    const statusBefore = await getDossierCommissionStatus(102)
    expect(statusBefore.status).toBe('legacy_file')

    // Normal mount/initial çağrısı eski dosyayı ezmemeli
    const res = await seedDossierCommission(102, { mode: 'initial' })
    expect(res.success).toBe(true)
    expect(res.skipped).toBe(true)
    expect(res.reason).toBe('legacy_dossier')
    expect(transactionExecuted.length).toBe(0) // Hiç transaction çalıştırılmadı

    // Durum hâlâ legacy olarak korunmalı
    const statusAfter = await getDossierCommissionStatus(102)
    expect(statusAfter.status).toBe('legacy_file')
  })

  it('3. Eski dosya (NULL): Kullanıcı açıkça talep ettiğinde (force: true) aktarılmalı', async () => {
    const res = await seedDossierCommission(102, { mode: 'missing_only', force: true })
    expect(res.success).toBe(true)
    expect(res.seededCount).toBe(3)
    expect(transactionExecuted.length).toBe(4)

    const statusAfter = await getDossierCommissionStatus(102)
    expect(statusAfter.status).toBe('seeded')
  })

  it('4. Bilinçli olarak boş bırakılmış dosya (2): Otomatik tohumlanmamalı (deliberately_cleared skip)', async () => {
    const statusBefore = await getDossierCommissionStatus(104)
    expect(statusBefore.status).toBe('deliberately_empty')

    const res = await seedDossierCommission(104, { mode: 'initial' })
    expect(res.success).toBe(true)
    expect(res.skipped).toBe(true)
    expect(res.reason).toBe('deliberately_cleared')
    expect(transactionExecuted.length).toBe(0)
  })

  it('5. Tüm üyeleri silen kullanıcı: markDossierAsDeliberatelyCleared ile dosya durumu 2 olmalı', async () => {
    const ok = await markDossierAsDeliberatelyCleared(101)
    expect(ok).toBe(true)

    const status = await getDossierCommissionStatus(101)
    expect(status.status).toBe('deliberately_empty')
  })

  it('6. Hata ve Rollback: Transaction başarısız olduğunda dosya durumu 0 kalmalı ve yarım kayıt oluşmamalı', async () => {
    transactionFailNext = true

    const res = await seedDossierCommission(101, { mode: 'initial' })
    expect(res.success).toBe(false)
    expect(res.error).toContain('Simüle edilen transaction hatası')

    // Durum hâlâ unseeded (0) kalmalı, rollback garantisi
    const status = await getDossierCommissionStatus(101)
    expect(status.status).toBe('new_unseeded')
    expect(status.memberCount).toBe(0)

    // Tekrar deneme (Retry) güvenli şekilde çalışmalı
    transactionFailNext = false
    const retryRes = await seedDossierCommission(101, { mode: 'initial' })
    expect(retryRes.success).toBe(true)
    expect(retryRes.seededCount).toBe(3)

    const statusAfter = await getDossierCommissionStatus(101)
    expect(statusAfter.status).toBe('seeded')
  })

  it('7. Idempotency & Mükerrer Kayıt Engeli: Aynı üyeler tekrar aktarılmaya çalışıldığında mükerrer kayıt oluşmamalı', async () => {
    // Dosya 103'te personel 5 zaten var
    const res = await seedDossierCommission(103, { mode: 'missing_only', force: true })
    expect(res.success).toBe(true)
    expect(res.seededCount).toBe(2) // Personel 5 atlandı, sadece 6 ve 7 eklendi

    const insertStatements = transactionExecuted.filter((q) => q.sql.includes('INSERT INTO DATA_TeminKomisyon'))
    expect(insertStatements.length).toBe(2)

    // Hiçbir insert ifadesi personel 5 içermemeli
    const containsPersonel5 = insertStatements.some((q) => q.params[2] === 5)
    expect(containsPersonel5).toBe(false)
  })

  it('8. Replace Modu: Kullanıcı tümünü baştan yükle seçtiğinde önce DELETE çalışmalı', async () => {
    const res = await seedDossierCommission(103, { mode: 'replace', force: true })
    expect(res.success).toBe(true)
    expect(res.seededCount).toBe(3) // Tümü baştan eklendi

    // İlk ifade DELETE olmalı
    expect(transactionExecuted[0].sql).toContain('DELETE FROM DATA_TeminKomisyon WHERE temin_dosya_id = ?')
    expect(transactionExecuted[0].params[0]).toBe(103)
  })

  it('9. Dosya İzolasyonu: TANIM_KomisyonUye tanımları değiştiğinde dosyadaki mevcut kayıtlar etkilenmemeli', async () => {
    // 101 numaralı dosyayı tohumla
    await seedDossierCommission(101, { mode: 'initial' })

    const file101MembersBefore = mockDbData.komisyonlar.filter((x) => x.temin_dosya_id === 101)
    expect(file101MembersBefore.length).toBe(3)

    // Genel kurumsal tanımlara yeni üye eklensin veya üye silinsin
    mockDbData.tanimUye.push({
      id: 99,
      komisyon_id: 1,
      personel_id: 99,
      ad_soyad: 'Yeni Personel',
      gorev_adi: 'Üye',
      komisyon_adi: 'Yaklaşık Maliyet Komisyonu'
    })

    // Dosya 101'e tekrar initial seed çağrısı gelse bile (mount vs.)
    const rese = await seedDossierCommission(101, { mode: 'initial' })
    expect(rese.skipped).toBe(true)

    // Dosyadaki üyeler değişmemeli
    const file101MembersAfter = mockDbData.komisyonlar.filter((x) => x.temin_dosya_id === 101)
    expect(file101MembersAfter.length).toBe(3)
  })
})

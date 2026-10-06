import { SeedResult } from './seedTypes'
import { cleanExistingSeedData } from './seedUtils'
import {
  seedKurum,
  seedSettings,
  seedKikLimitleri,
  seedPersonel,
  seedBirimler,
  seedFirmalar,
  seedKalemler,
  seedKomisyonlarVeAmbarlar
} from './seedDefinitions'
import {
  enrichExistingDosyalar,
  seedDogrudanTeminOnly,
  seedIhale4734Only,
  deleteIhaleDosyalariFromDb
} from './seedDosyalar'
import { seedDevletIhale2886 } from './seedDevletIhale2886'

export * from './seedTypes'
export * from './seedUtils'
export * from './seedDefinitions'
export * from './seedDosyalar'
export * from './seedDevletIhale2886'

/**
 * Geliştirici ve Test Modu Veri Tohumlama (Database Seeder) Servisi
 * TEMİN 360 - Kurum, Birimler, Personeller, Firmalar, Kalemler, Komisyonlar, Ambarlar,
 * KİK Limitleri, Ayarlar ve Doğrudan Temin Dosya Süreçlerini Eksiksiz Gerçekçi Verilerle Doldurur.
 */
export const devSeedService = {
  cleanExistingSeedData,
  deleteIhaleDosyalariFromDb,

  /**
   * Tek tıkla tüm sistemi ve ilişkili tüm tabloları eksiksiz test verisiyle doldurur.
   * cleanFirst: true olduğunda önce eski kayıtları tamamen siler, sıfırdan oluşturur.
   */
  async seedAll(cleanFirst = true): Promise<SeedResult> {
    try {
      if (cleanFirst) {
        await cleanExistingSeedData()
      }

      const details: SeedResult['details'] = {
        kurumUpdated: false,
        birimlerCount: 0,
        personelCount: 0,
        firmalarCount: 0,
        kalemlerCount: 0,
        komisyonlarCount: 0,
        ambarCount: 0,
        kikLimitCount: 0,
        dosyalarEnrichedCount: 0,
        totalRecordsInserted: 0
      }

      // 1. Kurum ve Genel Ayarları Doldur
      await seedKurum()
      await seedSettings()
      details.kurumUpdated = true

      // 2. KİK Parasal Limit Dönemlerini Doldur
      await seedKikLimitleri()
      details.kikLimitCount = 3

      // 3. Personelleri Doldur ve Rolleri Eşle
      const personelIds = await seedPersonel()
      details.personelCount = personelIds.length

      // 4. Birimleri (Harcama Birimleri ve Antetleriyle) Doldur
      const birimIds = await seedBirimler(personelIds)
      details.birimlerCount = birimIds.length

      // 5. Tedarikçi / İstekli Firmaları Doldur
      const firmaIds = await seedFirmalar()
      details.firmalarCount = firmaIds.length

      // 6. Kalem Havuzunu (Mal, Hizmet, Yapım) Doldur
      const kalemIds = await seedKalemler()
      details.kalemlerCount = kalemIds.length

      // 7. Komisyon ve Ambar Tanımlarını Doldur
      await seedKomisyonlarVeAmbarlar()
      details.komisyonlarCount = 3
      details.ambarCount = 4

      // 8. Doğrudan Temin Dosyalarını (Kalem, Teklif, Komisyon ve Hesaplamalarıyla) Doldur
      const enrichedCount = await enrichExistingDosyalar(firmaIds, personelIds, birimIds)
      details.dosyalarEnrichedCount = enrichedCount

      // 9. 2886 Devlet İhale Satış & Kiralama Süreçlerini Tohumla
      const ihale2886Count = await seedDevletIhale2886()
      details.devletIhale2886Count = ihale2886Count

      return {
        success: true,
        message:
          'Tüm sistem (Kurum, Birimler, Personeller, Firmalar, Kalemler, Komisyonlar, Ambarlar, DT Dosyaları ve 2886 Devlet İhale Süreçleri) tertemiz sıfırlanıp eksiksiz tohumlandı!',
        details
      }
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : 'Bilinmeyen hata'
      console.error('[devSeedService] Hata:', error)
      return {
        success: false,
        message: `Tohumlama başarısız oldu: ${errMsg}`
      }
    }
  },

  seedKurum,
  seedSettings,
  seedKikLimitleri,
  seedPersonel,
  seedBirimler,
  seedFirmalar,
  seedKalemler,
  seedKomisyonlarVeAmbarlar,
  enrichExistingDosyalar,
  seedDogrudanTeminOnly,
  seedIhale4734Only,
  seedDevletIhale2886
}

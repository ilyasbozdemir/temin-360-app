/**
 * <summary>
 * Veri Tohumlama (Seed) Sonuç Arayüzü
 * </summary>
 */
export interface SeedResult {
  success: boolean
  message: string
  details?: {
    kurumUpdated?: boolean
    birimlerCount?: number
    personelCount?: number
    firmalarCount?: number
    kalemlerCount?: number
    komisyonlarCount?: number
    ambarCount?: number
    kikLimitCount?: number
    dosyalarEnrichedCount?: number
    dogrudanTeminCount?: number
    ihale4734Count?: number
    devletIhale2886Count?: number
    totalRecordsInserted?: number
  }
}

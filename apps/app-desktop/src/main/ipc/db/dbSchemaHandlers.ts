import { ipcMain } from 'electron'
import { workspaceManager, ensureSchemaIntegrity } from '../../database/workspace'

/**
 * <summary>
 * Veritabanı Şema ve Placeholder (Alan Değişkenleri) Sözlüğü IPC İşleyicileri
 * </summary>
 * <description>
 * Şablon editörü için dinamik alan sözlüğü sağlama ve veritabanı bütünlük/placeholder tanımlarını sıfırlama işlevlerini sunar.
 * </description>
 */
export function registerDbSchemaHandlers(): void {
  /**
   * <summary>
   * Veritabanı Şema Sözlüğü ve Placeholder Listesini Getirme
   * </summary>
   * <returns>Şablon editöründe kullanılabilecek alan etiketleri ve sözlük nesnesi</returns>
   */
  ipcMain.handle('db:get-schema-dict', async () => {
    try {
      const schemaDict = {
        DATA_TeminDosyasi: {
          label: 'Doğrudan Temin Dosyası',
          columns: {
            temin_no: 'Doğrudan Temin / Dosya No',
            konu: 'İşin Adı / Konu',
            isin_aciklamasi: 'İşin Açıklaması / Tanımı',
            butce_yili: 'Bütçe Yılı',
            tarih: 'Dosya Tarihi',
            karar_no: 'Karar No',
            fatura_no: 'Fatura No',
            fatura_tarihi: 'Fatura Tarihi',
            yaklasik_maliyet: 'Yaklaşık Maliyet Tutarı',
            teslim_gun: 'Teslim Süresi (Gün)',
            teslim_tarihi: 'Teslim Tarihi',
            harcama_birimi: 'Harcama Birimi'
          }
        },
        TANIM_Kurum: {
          label: 'Kurum Bilgileri',
          columns: {
            kurum_adi: 'Kurum Adı',
            ust_kurum_adi: 'Üst Kurum Adı',
            makam_adi: 'Sunum / Makam Adı',
            adres: 'Kurum Adresi',
            il: 'İl',
            ilce: 'İlçe',
            telefon: 'Telefon',
            eposta: 'E-posta',
            vergi_dairesi: 'Vergi Dairesi',
            vergi_no: 'Vergi No'
          }
        },
        TANIM_Firma: {
          label: 'Yüklenici / İstekli Firma',
          columns: {
            unvan: 'Firma Unvanı',
            yetkili_ad_soyad: 'Yetkili Adı Soyadı',
            adres: 'Firma Adresi',
            ilce: 'İlçe',
            il: 'İl',
            telefon: 'Telefon',
            vergi_dairesi: 'Vergi Dairesi',
            vergi_no: 'Vergi / TC No',
            banka_adi: 'Banka Adı',
            iban: 'IBAN Numarası'
          }
        },
        TANIM_Personel: {
          label: 'Personel',
          columns: {
            ad_soyad: 'Personel Adı Soyadı',
            unvan: 'Unvanı',
            birim: 'Birimi / Görevi',
            sicil_no: 'Sicil No',
            telefon: 'Telefon',
            eposta: 'E-posta'
          }
        }
      }
      return { success: true, data: schemaDict }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  /**
   * <summary>
   * Placeholder Listesini Sıfırlama ve Şema Bütünlüğünü Doğrulama
   * </summary>
   */
  ipcMain.handle('db:resetPlaceholders', async () => {
    try {
      const db = workspaceManager.getDb()
      ensureSchemaIntegrity(db)
      workspaceManager.save()
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })
}

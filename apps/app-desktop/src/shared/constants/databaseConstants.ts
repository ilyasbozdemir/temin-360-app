/**
 * Veritabanı Tablo Tanımları ve Sabitleri
 *
 * Tek Doğruluk Kaynağı (Single Source of Truth)
 * Tablo dost isimleri, loglama ve kullanıcı arayüzü etiketleri bu dosyadan çekilir.
 */

export const TABLE_FRIENDLY_NAMES: Record<string, string> = {
  DATA_TeminDosyasi: 'Doğrudan Temin / İhale Dosyası',
  DATA_Kalemler: 'Malzeme & Kalem Listesi',
  DATA_Malzemeler: 'Malzeme Tanımları',
  DATA_YaklasikMaliyet: 'Yaklaşık Maliyet Cetveli',
  DATA_YaklasikMaliyetFirmaFiyat: 'Piyasa Fiyat Teklifleri',
  DATA_Komisyonlar: 'Komisyon & Kurul Kaydı',
  DATA_KomisyonUyeleri: 'Komisyon Üyeleri',
  DATA_DosyaSablonVeri: 'Belge & Şablon Verisi',
  DATA_Hakedis: 'Hakediş & Ödeme Kaydı',
  DATA_HakedisKalemler: 'Hakediş Kalemleri',
  DATA_Sozlesme: 'Sözleşme Bilgileri',
  DATA_MuayeneKabul: 'Muayene & Kabul Tutanağı',
  DATA_Faturalar: 'Fatura & İrsaliye',
  DATA_Teklifler: 'Firma Teklifleri',
  DATA_BirimFiyatCetveli: 'Birim Fiyat Cetveli',
  DATA_NotVeGorev: 'Notlar & Yapılacaklar (To-Do)',
  TANIM_Personel: 'Personel Tanımı',
  TANIM_Firmalar: 'Firma Tanımı',
  TANIM_Birimler: 'Birim Tanımı',
  TANIM_Pozlar: 'Poz / Birim Fiyat',
  TANIM_Ambarlar: 'Ambar Tanımı',
  settings: 'Kurum / Sistem Ayarları',
  attachments: 'Ek Dosyalar & Belgeler'
}

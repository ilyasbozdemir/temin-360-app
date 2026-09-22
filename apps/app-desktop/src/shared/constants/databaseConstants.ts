/**
 * Veritabanı Tablo Tanımları ve Sabitleri
 *
 * Tek Doğruluk Kaynağı (Single Source of Truth)
 * Tablo dost isimleri, loglama ve kullanıcı arayüzü etiketleri bu dosyadan çekilir.
 */

export const TABLE_FRIENDLY_NAMES: Record<string, string> = {
  DATA_TeminDosyasi: 'Dosya Genel Bilgileri',
  DATA_TeminKalem: 'Malzeme & Kalem Listesi',
  DATA_Kalemler: 'Malzeme & Kalem Listesi',
  DATA_Malzemeler: 'Malzeme Tanımları',
  DATA_TeminFirma: 'İstekli Firmalar',
  DATA_TeminKalemTeklif: 'Firma Teklif Fiyatları',
  DATA_Teklifler: 'Firma Teklifleri',
  DATA_TeminKomisyon: 'Komisyon & Görevliler',
  DATA_Komisyonlar: 'Komisyon Kaydı',
  DATA_KomisyonUyeleri: 'Komisyon Üyeleri',
  DATA_TeminBelge: 'Üretilen Belgeler & Tutanağı',
  DATA_DosyaSablonVeri: 'Belge & Şablon Verisi',
  DATA_YaklasikMaliyet: 'Yaklaşık Maliyet Cetveli',
  DATA_YaklasikMaliyetFirmaFiyat: 'Piyasa Fiyat Teklifleri',
  DATA_Hakedis: 'Hakediş & Ödeme Kaydı',
  DATA_HakedisKalemler: 'Hakediş Kalemleri',
  DATA_Sozlesme: 'Sözleşme Bilgileri',
  DATA_MuayeneKabul: 'Muayene & Kabul Tutanağı',
  DATA_Faturalar: 'Fatura & İrsaliye',
  DATA_BirimFiyatCetveli: 'Birim Fiyat Cetveli',
  DATA_NotVeGorev: 'Notlar & Görevler',
  TANIM_Personel: 'Personel Tanımları',
  TANIM_Firma: 'Firma Tanımları',
  TANIM_Birim: 'Birim Tanımları',
  TANIM_Pozlar: 'Poz / Birim Fiyatlar',
  TANIM_Ambar: 'Ambar Tanımları',
  settings: 'Sistem Ayarları',
  attachments: 'Ek Dosyalar & Belgeler',
  Veritabanı: 'Çalışma Dosyası Bilgileri'
}

export const TABLE_DESCRIPTIONS: Record<string, string> = {
  DATA_TeminDosyasi: 'Dosya başlığı, ihale usulü, limit ve temel konfigürasyon ayarları.',
  DATA_TeminKalem: 'Satın alma dosyasındaki malzeme, hizmet ve iş kalemleri listesi.',
  DATA_TeminFirma: 'Teklif vermesi için davet edilen veya teklif sunan istekli firmalar.',
  DATA_TeminKalemTeklif: 'Firmaların kalem bazlı verdiği fiyat teklifleri ve yaklaşık maliyet matrisi.',
  DATA_TeminKomisyon: 'Piyasa araştırma, ihale ve muayene kabul komisyon görevlileri.',
  DATA_TeminBelge: 'Otomatik oluşturulan resmi belgeler, onay tutanakları ve çıktılar.',
  DATA_DosyaSablonVeri: 'Belge şablonlarında özelleştirilen metin, madde ve değişken verileri.',
  DATA_YaklasikMaliyet: 'Yaklaşık maliyet hesap cetvelleri ve ortalama fiyat analizleri.',
  DATA_NotVeGorev: 'Dosyaya bağlı özel notlar ve yapılacak işler listesi.',
  TANIM_Personel: 'Kurum personeli, unvan ve yetkili imzacı kayıtları.',
  TANIM_Firma: 'Kayıtlı tedarikçi ve yüklenici firma rehberi.',
  Veritabanı: 'Çalışma dosyasındaki veri, ayar ve ihale süreci güncellemeleri.'
}

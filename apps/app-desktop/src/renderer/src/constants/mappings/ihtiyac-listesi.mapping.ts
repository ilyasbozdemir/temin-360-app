import { ProcessMapping } from './types'

export const IhtiyacListesiMapping: ProcessMapping = {
  antetSatirlari: {
    tablo: 'TANIM_Kurum',
    sutun: 'kurum_anteti',
    aciklama: 'Dosyanın antet satırları'
  },
  dosyaKonusu: { deger: 'İhtiyaç Listesi', aciklama: 'Belge Başlığı / Konusu' },
  evrakSayisi: {
    aciklama: 'E-DETSİS-SDP-NO standart formatına uygun resmi evrak sayısı (örn: E-10234521-934.01-0001)'
  },

  tarih: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'temin_tarihi',
    varsayilan: new Date().toLocaleDateString('tr-TR'),
    aciklama: 'Belge tarihi'
  },
  onayaSunulanTarih: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'temin_tarihi',
    varsayilan: new Date().toLocaleDateString('tr-TR'),
    aciklama: 'Onaya sunulma tarihi'
  },
  onayTarihi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'dosya_acilis_tarihi',
    varsayilan: new Date().toLocaleDateString('tr-TR'),
    aciklama: 'OLUR / Onay tarihi'
  },

  sunulacakMakamAdi: {
    tablo: 'TANIM_Kurum',
    sutun: 'makam_adi',
    aciklama: 'Sunulacak makam adı'
  },

  ihtiyacKalemleri: {
    tablo: 'DATA_TeminKalem',
    sutun: '*',
    iliskili_id: 'temin_dosya_id',
    altEslestirme: {
      kodu: 'tasinir_kodu',
      malzemeAdi: 'kalem_adi',
      ozelligi: 'aciklama',
      birimi: 'birim',
      kdvOrani: 'kdv_orani',
      miktar: 'miktar'
    },
    aciklama: 'İhtiyaç listesi kalemleri'
  },
  ihtiyacYeri: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'ihtiyac_yeri',
    aciklama: 'İhtiyaç listesi yerleri'
  },

  isinAciklamasi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'isin_aciklamasi',
    varsayilan: 'ihtiyacı olan',
    aciklama: 'İşin Açıklaması/Açıklama'
  },
  olurYazisi: {
    deger: true,
    aciklama: 'Olur yazısı oluşturulacak'
  },
  kurumIci: {
    deger: true,
    aciklama: 'Kurum içi mi?'
  },
  kurumAdres: {
    tablo: 'TANIM_Kurum',
    sutun: 'adres',
    varsayilan: '[Adres Belirtilmedi]',
    aciklama: 'Kurum adresi'
  },
  kurumTelefon: {
    tablo: 'TANIM_Kurum',
    sutun: 'telefon',
    varsayilan: '[Telefon Belirtilmedi]',
    aciklama: 'Kurum telefonu'
  },
  kurumFaks: {
    tablo: 'TANIM_Kurum',
    sutun: 'faks',
    varsayilan: '[Faks Belirtilmedi]',
    aciklama: 'Kurum faks'
  },
  kurumWeb: {
    tablo: 'TANIM_Kurum',
    sutun: 'web_sitesi',
    varsayilan: '[Web Adresi Belirtilmedi]',
    aciklama: 'Kurum web sitesi'
  },
  kurumEposta: {
    tablo: 'TANIM_Kurum',
    sutun: 'eposta',
    varsayilan: '[E-Posta Belirtilmedi]',
    aciklama: 'Kurum e-posta adresi'
  },
  kurumKep: {
    tablo: 'TANIM_Kurum',
    sutun: 'kep_adresi',
    varsayilan: '[Kep Adresi Belirtilmedi]',
    aciklama: 'Kurum kep adresi'
  },

  // Personnel signature auto-resolutions
  hazirlayanPersonelAdi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'hazirlayan_personel_id',
    iliskiliTablo: 'TANIM_Personel',
    iliskiliSutun: 'ad_soyad',
    aciklama: 'Hazırlayan Personel Adı Soyadı'
  },
  hazirlayanPersonelUnvan: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'hazirlayan_personel_id',
    iliskiliTablo: 'TANIM_Personel',
    iliskiliSutun: 'unvan',
    aciklama: 'Hazırlayan Personel Unvanı'
  },
  talepEdenPersonelAdi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'hazirlayan_personel_id',
    iliskiliTablo: 'TANIM_Personel',
    iliskiliSutun: 'ad_soyad',
    aciklama: 'Talep Eden Personel Adı Soyadı'
  },
  talepEdenPersonelUnvan: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'hazirlayan_personel_id',
    iliskiliTablo: 'TANIM_Personel',
    iliskiliSutun: 'unvan',
    aciklama: 'Talep Eden Personel Unvanı'
  },
  onaylayanPersonelAdi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'onay_personel_id',
    iliskiliTablo: 'TANIM_Personel',
    iliskiliSutun: 'ad_soyad',
    aciklama: 'Harcama Yetkilisi / Onaylayan Adı Soyadı'
  },
  onaylayanPersonelUnvan: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'onay_personel_id',
    iliskiliTablo: 'TANIM_Personel',
    iliskiliSutun: 'unvan',
    aciklama: 'Harcama Yetkilisi / Onaylayan Unvanı'
  }
}

import { ProcessMapping } from './types'

export const LuzumOnayEkiMapping: ProcessMapping = {
  antetSatirlari: {
    tablo: 'TANIM_Kurum',
    sutun: 'kurum_anteti',
    aciklama: 'Dosyanın antet satırları'
  },
  dosyaKonusu: {
    deger: 'Lüzum Müzekkeresi',
    aciklama: 'Belgenin konusu'
  },
  solLogo: {
    tablo: 'TANIM_Kurum',
    sutun: 'logo_sol',
    aciklama: 'Sol Logo / Amblem'
  },
  sagLogo: {
    tablo: 'TANIM_Kurum',
    sutun: 'logo_sag',
    aciklama: 'Sağ Logo / Amblem'
  },
  evrakSayisi: {
    aciklama: 'E-DETSİS-SDP-NO standart formatına uygun resmi evrak sayısı (örn: E-10234521-934.01-0001)'
  },
  ekNo: {
    deger: '1',
    aciklama: 'Ek numarası'
  },
  talepEdenPersonelAdi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'talep_eden_personel_id',
    iliskiliTablo: 'TANIM_Personel',
    iliskiliSutun: 'ad_soyad',
    aciklama: 'Talep Eden Personel Adı Soyadı'
  },
  talepEdenPersonelUnvan: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'talep_eden_personel_id',
    iliskiliTablo: 'TANIM_Personel',
    iliskiliSutun: 'unvan',
    aciklama: 'Talep Eden Personel Unvanı'
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
    aciklama: 'Onay eki kalemleri'
  },
  dosyaTarihi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'dosya_acilis_tarihi',
    aciklama: 'Dosya tarihi'
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
  kurumAdi: {
    tablo: 'TANIM_Kurum',
    sutun: 'kurum_adi',
    aciklama: 'Kurum adı'
  },
  altKurumTipi: {
    tablo: 'TANIM_Kurum',
    sutun: 'alt_kurum_tipi',
    varsayilan: 'belediye',
    aciklama: 'Alt Kurum Tipi / Tabiri'
  }
}

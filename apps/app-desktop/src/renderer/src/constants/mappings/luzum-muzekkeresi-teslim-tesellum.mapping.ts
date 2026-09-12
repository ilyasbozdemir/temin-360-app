import { ProcessMapping } from './types'

export const LuzumTeslimTesellumMapping: ProcessMapping = {
  antetSatirlari: {
    tablo: 'TANIM_Kurum',
    sutun: 'kurum_anteti',
    aciklama: 'Dosyanın antet satırları'
  },
  dosyaKonusu: {
    deger: 'TESLİM TESELLÜM BELGESİ',
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
  isinAdi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'konu',
    aciklama: 'İşin adı'
  },
  kurumIci: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'kurum_ici',
    deger: true,
    aciklama: 'Kurum içi mi?'
  },
  yukleniciFirma: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'firma_id',
    iliskiliTablo: 'TANIM_Firma',
    iliskiliSutun: 'unvan',
    varsayilan: '',
    aciklama: 'Kazanan / Yüklenici Firma Unvanı'
  },
  kurumumuz: {
    tablo: 'TANIM_Kurum',
    sutun: 'kurum_adi',
    aciklama: 'Kurumun adı (tabiri ile birlikte)'
  },
  dosyaNumarasi: {
    formul: '{{DATA_TeminDosyasi.butce_yili}}-{{DATA_TeminDosyasi.temin_no}}',
    aciklama: 'Yıl-Dosya no birleşimi'
  },
  dosyaTarihi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'dosya_acilis_tarihi',
    aciklama: 'Dosya tarihi'
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
    aciklama: 'Teslim tesellüm kalemleri'
  },
  teslimAlanlar: {
    tablo: 'DATA_TeminKomisyon',
    sutun: '*',
    iliskili_id: 'temin_dosya_id',
    altEslestirme: {
      adSoyad: 'ad_soyad',
      unvan: 'unvan'
    },
    aciklama: 'Teslim alan kişiler'
  }
}

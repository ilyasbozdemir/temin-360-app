import { ProcessMapping } from './types'

export const IhtiyacTalepFormuMapping: ProcessMapping = {
  antetSatirlari: {
    tablo: 'TANIM_Kurum',
    sutun: 'kurum_anteti',
    aciklama: 'Dosyanın antet satırları'
  },
  dosyaKonusu: {
    deger: 'İhtiyaç Talep Formu',
    aciklama: 'Dosya konusu'
  },
  evrakSayisi: {
    aciklama:
      'E-DETSİS-SDP-NO standart formatına uygun resmi evrak sayısı (örn: E-10234521-934.01-0001)'
  },
  sunulacakMakamAdi: {
    tablo: 'TANIM_Kurum',
    sutun: 'makam_adi',
    aciklama: 'Sunulacak makam adı'
  },
  ihtiyacYeri: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'ihtiyac_yeri',
    aciklama: 'İhtiyaç Yeri'
  },
  gerekce: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'isin_aciklamasi',
    aciklama: 'Birimin talep gerekçesi (İşin açıklaması baz alınır)'
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
    aciklama: 'İhtiyaç talep formu kalemleri'
  }
}

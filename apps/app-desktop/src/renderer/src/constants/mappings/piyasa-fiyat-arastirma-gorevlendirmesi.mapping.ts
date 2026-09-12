import { ProcessMapping } from './types'

export const PiyasaFiyatArastirmaGorevlendirmesiMapping: ProcessMapping = {
  antetSatirlari: {
    tablo: 'TANIM_Kurum',
    sutun: 'kurum_anteti',
    aciklama: 'Kurum Anteti'
  },
  detsisNo: {
    tablo: 'TANIM_Kurum',
    sutun: 'detsis_kodu',
    aciklama: 'Kurum DETSİS Numarası'
  },
  yili: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'butce_yili',
    aciklama: 'Bütçe Yılı'
  },
  sayisi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'temin_no',
    aciklama: 'Temin Numarası'
  },
  evrakSayisi: {
    aciklama: 'E-DETSİS-SDP-NO standart formatına uygun resmi evrak sayısı'
  },
  dosyaKonusu: { deger: 'Piyasa Fiyat Araştırma Görevlendirmesi', aciklama: 'Belgenin konusu' },
  dosyaTarihi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'dosya_tarihi',
    aciklama: 'Dosya Tarihi'
  },
  kurumumuz: {
    tablo: 'TANIM_Kurum',
    sutun: 'kurum_adi',
    aciklama: 'Kurum Adı'
  },
  isinAdi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'konu',
    aciklama: 'İşin Adı'
  },
  hazirlayanPersonelAdi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'hazirlayan_personel_ad',
    aciklama: 'Hazırlayan Personel'
  },
  hazirlayanPersonelUnvan: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'hazirlayan_personel_unvan',
    aciklama: 'Hazırlayan Personel Ünvanı'
  },
  onaylayanPersonelAdi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'onaylayan_personel_ad',
    aciklama: 'Onaylayan Yetkili (Harcama Yetkilisi)'
  },
  onaylayanPersonelUnvan: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'onaylayan_personel_unvan',
    aciklama: 'Onaylayan Yetkili Ünvanı'
  },
  kurumAdres: {
    tablo: 'TANIM_Kurum',
    sutun: 'adres',
    aciklama: 'Kurum Adresi'
  },
  kurumTelefon: {
    tablo: 'TANIM_Kurum',
    sutun: 'telefon',
    aciklama: 'Kurum Telefonu'
  },
  kurumFaks: {
    tablo: 'TANIM_Kurum',
    sutun: 'faks',
    aciklama: 'Kurum Faksı'
  },
  kurumWeb: {
    tablo: 'TANIM_Kurum',
    sutun: 'web_sitesi',
    aciklama: 'Kurum Web Sitesi'
  },
  kurumEposta: {
    tablo: 'TANIM_Kurum',
    sutun: 'eposta',
    aciklama: 'Kurum E-Posta'
  },
  kurumKep: {
    tablo: 'TANIM_Kurum',
    sutun: 'kep_adresi',
    aciklama: 'Kurum KEP Adresi'
  },
  kurumIci: {
    deger: true,
    aciklama: 'Kurum içi mi?'
  },
  fiyatKomisyonu: {
    tablo: 'DATA_TeminKomisyon',
    sutun: '*',
    aciklama: 'Piyasa Araştırma ve Satınalma Komisyon Üyeleri'
  },
  muayeneKomisyonu: {
    tablo: 'DATA_TeminKomisyon',
    sutun: '*',
    aciklama: 'Muayene Kabul ve Teslim Alma Komisyon Üyeleri'
  }
}

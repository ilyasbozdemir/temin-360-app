import { ProcessMapping } from './types'

export const HarcamaTalimatiMapping: ProcessMapping = {
  evrakSayisi: {
    aciklama:
      'E-DETSİS-SDP-NO standart formatına uygun resmi evrak sayısı (örn: E-10234521-934.01-0001)'
  },
  tarih: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'dosya_acilis_tarihi',
    aciklama: 'Onay Tarihi'
  },
  idareAdi: {
    tablo: 'TANIM_Kurum',
    sutun: 'kurum_adi',
    aciklama: 'İdare Adı'
  },
  gerekce: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'isin_aciklamasi',
    aciklama: 'Alımın Gerekçesi'
  },
  isAdi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'konu',
    aciklama: 'İşin Adı'
  },
  sure: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'isin_suresi',
    aciklama: 'İşin Süresi'
  },
  teminSekli: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'ihale_usulu',
    aciklama: 'Temin Åekli / Usulü'
  },
  yaklasikMaliyet: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'yaklasik_maliyet',
    aciklama: 'Yaklaşık Maliyet'
  },
  odenekTutari: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'odenek_tutari',
    aciklama: 'Ödenek Tutarı'
  },
  butceTertibi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'butce_tertibi',
    aciklama: 'Bütçe Tertibi'
  },
  aciklama: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'isin_aciklamasi',
    aciklama: 'İşin Açıklaması'
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
    aciklama: 'Harcama Yetkilisi / Onaylayan Yetkili'
  },
  onaylayanPersonelUnvan: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'onaylayan_personel_unvan',
    aciklama: 'Onaylayan Personel Ünvanı'
  },
  mutemetAdi: {
    tablo: 'DATA_TeminKomisyon',
    sutun: 'ad_soyad',
    aciklama: 'Harcama Yetkilisi Mutemedi / Muhasebe Yetkilisi'
  },
  mutemetUnvan: {
    tablo: 'DATA_TeminKomisyon',
    sutun: 'unvan',
    aciklama: 'Mutemet Ünvanı'
  },
  muhasebeYetkilisiAdi: {
    tablo: 'DATA_TeminKomisyon',
    sutun: 'ad_soyad',
    aciklama: 'Muhasebe Yetkilisi'
  }
}

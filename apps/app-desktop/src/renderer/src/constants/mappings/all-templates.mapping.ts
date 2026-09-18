import { ProcessMapping } from './types'

// ===========================================================
// 1. Araştırma Mektubu
// ===========================================================
export const ArastirmaMektubuMapping: ProcessMapping = {
  antetSatirlari: { tablo: 'TANIM_Kurum', sutun: 'kurum_anteti', aciklama: 'Kurum Anteti' },
  dosyaKonusu: { deger: 'Fiyat Araştırması', aciklama: 'Belge Başlığı / Konusu' },
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
  kurumAdres: { tablo: 'TANIM_Kurum', sutun: 'adres', aciklama: 'Kurum Adresi' },
  kurumTelefon: { tablo: 'TANIM_Kurum', sutun: 'telefon', aciklama: 'Kurum Telefonu' },
  kurumEposta: { tablo: 'TANIM_Kurum', sutun: 'eposta', aciklama: 'Kurum E-Posta' },
  kurumKep: { tablo: 'TANIM_Kurum', sutun: 'kep_adresi', aciklama: 'Kurum KEP Adresi' },
  kurumIci: { deger: true },
  ihtiyacKalemleri: {
    tablo: 'DATA_TeminKalem',
    sutun: '*',
    iliskili_id: 'temin_dosya_id',
    altEslestirme: {
      malzemeAdi: 'kalem_adi',
      ozelligi: 'aciklama',
      birimi: 'birim',
      miktar: 'miktar'
    }
  },
  gorevlendirilenler: {
    tablo: 'DATA_TeminKomisyon',
    sutun: '*',
    iliskili_id: 'temin_dosya_id',
    altEslestirme: {
      adSoyad: 'ad_soyad',
      unvan: 'unvan',
      komisyonGorevi: 'gorevi',
      gorevi: 'gorevi'
    }
  },
  fiyatKomisyonu: {
    tablo: 'DATA_TeminKomisyon',
    sutun: '*',
    iliskili_id: 'temin_dosya_id',
    altEslestirme: {
      adSoyad: 'ad_soyad',
      unvan: 'unvan',
      komisyonGorevi: 'gorevi',
      gorevi: 'gorevi'
    }
  }
}

// ===========================================================
// 2. Birim Fiyat Teklif Cetveli
// ===========================================================
export const BirimFiyatTeklifCetveliMapping: ProcessMapping = {
  antetSatirlari: { tablo: 'TANIM_Kurum', sutun: 'kurum_anteti', aciklama: 'Kurum Anteti' },
  dosyaKonusu: { deger: 'Birim Fiyat Teklif Cetveli', aciklama: 'Belge Başlığı / Konusu' },
  idareAdi: { tablo: 'TANIM_Kurum', sutun: 'kurum_adi', aciklama: 'İdare Adı' },
  isinAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'konu', aciklama: 'İşin Adı' },
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
  kurumAdres: { tablo: 'TANIM_Kurum', sutun: 'adres', aciklama: 'Kurum Adresi' },
  kurumTelefon: { tablo: 'TANIM_Kurum', sutun: 'telefon', aciklama: 'Kurum Telefonu' },
  kurumEposta: { tablo: 'TANIM_Kurum', sutun: 'eposta', aciklama: 'Kurum E-Posta' },
  kurumKep: { tablo: 'TANIM_Kurum', sutun: 'kep_adresi', aciklama: 'Kurum KEP Adresi' },
  kurumIci: { deger: true },
  ihtiyacKalemleri: {
    tablo: 'DATA_TeminKalem',
    sutun: '*',
    iliskili_id: 'temin_dosya_id',
    altEslestirme: {
      malzemeAdi: 'kalem_adi',
      ozelligi: 'aciklama',
      birimi: 'birim',
      miktar: 'miktar'
    }
  }
}

// ===========================================================
// 3. Birim Fiyat Teklif Mektubu
// ===========================================================
export const BirimFiyatTeklifMektubuMapping: ProcessMapping = {
  antetSatirlari: { tablo: 'TANIM_Kurum', sutun: 'kurum_anteti', aciklama: 'Kurum Anteti' },
  isinAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'konu', aciklama: 'İşin Adı' },
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
  kurumAdres: { tablo: 'TANIM_Kurum', sutun: 'adres', aciklama: 'Kurum Adresi' },
  kurumTelefon: { tablo: 'TANIM_Kurum', sutun: 'telefon', aciklama: 'Kurum Telefonu' },
  kurumEposta: { tablo: 'TANIM_Kurum', sutun: 'eposta', aciklama: 'Kurum E-Posta' },
  kurumKep: { tablo: 'TANIM_Kurum', sutun: 'kep_adresi', aciklama: 'Kurum KEP Adresi' },
  kurumIci: { deger: true },
  ihtiyacKalemleri: {
    tablo: 'DATA_TeminKalem',
    sutun: '*',
    iliskili_id: 'temin_dosya_id',
    altEslestirme: {
      malzemeAdi: 'kalem_adi',
      ozelligi: 'aciklama',
      birimi: 'birim',
      miktar: 'miktar'
    }
  }
}

// ===========================================================
// 4. Dağıtım Çizelgesi
// ===========================================================
export const DagitimCizelgesiMapping: ProcessMapping = {
  antetSatirlari: { tablo: 'TANIM_Kurum', sutun: 'kurum_anteti', aciklama: 'Kurum Anteti' },
  kurumUst: { tablo: 'TANIM_Kurum', sutun: 'ust_kurum_adi', aciklama: 'Üst İdari Birim' },
  kurumAdi: { tablo: 'TANIM_Kurum', sutun: 'kurum_adi', aciklama: 'Kurum Adı' },
  mudurluk: { tablo: 'TANIM_Kurum', sutun: 'makam_adi', aciklama: 'Müdürlük / Makam' },
  isAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'konu', aciklama: 'İşin Adı' },
  baskanAdi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'onaylayan_personel_ad',
    aciklama: 'Başkan (Onaylayan)'
  },
  baskanUnvan: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'onaylayan_personel_unvan',
    aciklama: 'Başkan Ünvanı'
  }
}

// ===========================================================
// 5. Dağıtım Çizelgesi Karma
// ===========================================================
export const DagitimCizelgesiKarmaMapping: ProcessMapping = {
  antetSatirlari: { tablo: 'TANIM_Kurum', sutun: 'kurum_anteti', aciklama: 'Kurum Anteti' },
  kurumUst: { tablo: 'TANIM_Kurum', sutun: 'ust_kurum_adi', aciklama: 'Üst İdari Birim' },
  kurumAdi: { tablo: 'TANIM_Kurum', sutun: 'kurum_adi', aciklama: 'Kurum Adı' },
  mudurluk: { tablo: 'TANIM_Kurum', sutun: 'makam_adi', aciklama: 'Müdürlük / Makam' },
  isAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'konu', aciklama: 'İşin Adı' },
  baskanAdi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'onaylayan_personel_ad',
    aciklama: 'Başkan (Onaylayan)'
  },
  baskanUnvan: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'onaylayan_personel_unvan',
    aciklama: 'Başkan Ünvanı'
  }
}

// ===========================================================
// 6. Fiyat Araştırma Mektubu
// ===========================================================
export const FiyatArastirmaMektubuMapping: ProcessMapping = {
  antetSatirlari: { tablo: 'TANIM_Kurum', sutun: 'kurum_anteti', aciklama: 'Kurum Anteti' },
  isinAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'konu', aciklama: 'İşin Adı' },
  kurumAdi: { tablo: 'TANIM_Kurum', sutun: 'kurum_adi', aciklama: 'Kurum Adı' },
  kurumAdres: { tablo: 'TANIM_Kurum', sutun: 'adres', aciklama: 'Kurum Adresi' },
  kurumTelefon: { tablo: 'TANIM_Kurum', sutun: 'telefon', aciklama: 'Kurum Telefonu' },
  kurumEposta: { tablo: 'TANIM_Kurum', sutun: 'eposta', aciklama: 'Kurum E-Posta' },
  kurumKep: { tablo: 'TANIM_Kurum', sutun: 'kep_adresi', aciklama: 'Kurum KEP Adresi' },
  kurumIci: { deger: true },
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
  ihtiyacKalemleri: {
    tablo: 'DATA_TeminKalem',
    sutun: '*',
    iliskili_id: 'temin_dosya_id',
    altEslestirme: {
      malzemeAdi: 'kalem_adi',
      ozelligi: 'aciklama',
      birimi: 'birim',
      miktar: 'miktar'
    }
  }
}

// ===========================================================
// 7. Fiyat Araştırması (Tutanak)
// ===========================================================
export const FiyatArastirmasiMapping: ProcessMapping = {
  evrakSayisi: {
    formul:
      '{{TANIM_Kurum.detsis_kodu}}-{{DATA_TeminDosyasi.butce_yili}}/{{DATA_TeminDosyasi.temin_no}}',
    aciklama: 'Evrak Sayısı'
  },
  dosyaKonusu: { deger: 'Fiyat Araştırması', aciklama: 'Belge Başlığı / Konusu' },
  sunulacakMakamAdi: { tablo: 'TANIM_Kurum', sutun: 'makam_adi', aciklama: 'Sunulacak Makam Adı' },
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
  kurumAdres: { tablo: 'TANIM_Kurum', sutun: 'adres', aciklama: 'Kurum Adresi' },
  kurumEposta: { tablo: 'TANIM_Kurum', sutun: 'eposta', aciklama: 'Kurum E-Posta' },
  kurumFaks: { tablo: 'TANIM_Kurum', sutun: 'faks', aciklama: 'Kurum Faksı' },
  kurumTelefon: { tablo: 'TANIM_Kurum', sutun: 'telefon', aciklama: 'Kurum Telefonu' },
  kurumKep: { tablo: 'TANIM_Kurum', sutun: 'kep_adresi', aciklama: 'Kurum KEP Adresi' },
  kurumIci: { deger: true },
  ihtiyacKalemleri: {
    tablo: 'DATA_TeminKalem',
    sutun: '*',
    iliskili_id: 'temin_dosya_id',
    altEslestirme: {
      malzemeAdi: 'kalem_adi',
      ozelligi: 'aciklama',
      birimi: 'birim',
      miktar: 'miktar'
    }
  }
}

// ===========================================================
// 9. Piyasa Fiyat Araştırma Tutanağı
// ===========================================================
export const PiyasaFiyatArastirmaTutanagiMapping: ProcessMapping = {
  antetSatirlari: { tablo: 'TANIM_Kurum', sutun: 'kurum_anteti', aciklama: 'Kurum Anteti' },
  kurumUst: { tablo: 'TANIM_Kurum', sutun: 'ust_kurum_adi', aciklama: 'Üst İdari Birim' },
  kurumAdi: { tablo: 'TANIM_Kurum', sutun: 'kurum_adi', aciklama: 'Kurum Adı' },
  mudurluk: { tablo: 'TANIM_Kurum', sutun: 'makam_adi', aciklama: 'Müdürlük / Makam' },
  isAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'konu', aciklama: 'İşin Adı' },
  isinAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'konu', aciklama: 'İşin Adı' },
  dosyaKonusu: { tablo: 'DATA_TeminDosyasi', sutun: 'konu', aciklama: 'Dosya Konusu' },
  toplamBedel: { tablo: 'DATA_TeminDosyasi', sutun: 'yaklasik_maliyet', aciklama: 'Toplam Bedel' },
  ihtiyacKalemleri: {
    tablo: 'DATA_TeminKalem',
    sutun: '*',
    iliskili_id: 'temin_dosya_id',
    altEslestirme: {
      malzemeAdi: 'kalem_adi',
      ozelligi: 'aciklama',
      birimi: 'birim',
      miktar: 'miktar'
    }
  },
  komisyon: {
    tablo: 'DATA_TeminKomisyon',
    sutun: '*',
    iliskili_id: 'temin_dosya_id',
    altEslestirme: {
      adSoyad: 'ad_soyad',
      unvan: 'unvan',
      gorevi: 'gorevi'
    }
  },
  baskanAdi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'onay_personel_id',
    iliskiliTablo: 'TANIM_Personel',
    iliskiliSutun: 'ad_soyad',
    aciklama: 'Harcama Yetkilisi / Onaylayan'
  },
  baskanUnvan: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'onay_personel_id',
    iliskiliTablo: 'TANIM_Personel',
    iliskiliSutun: 'unvan',
    aciklama: 'Harcama Yetkilisi Unvanı'
  },
  firmalar: {
    tablo: 'DATA_TeminFirma',
    sutun: '*',
    iliskili_id: 'temin_dosya_id',
    iliskiliTablo: 'TANIM_Firma',
    iliskiliSutun: 'unvan',
    altEslestirme: {
      unvan: 'unvan'
    },
    aciklama: 'Firma Listesi'
  },
  hesaplamaEsasi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'hesaplama_esasi',
    aciklama: 'Hesaplama Esasi'
  }
}

// ===========================================================
// 10. Teklif Mektubu Dağıtım Çizelgesi
// ===========================================================
export const TeklifMektubuDagitimCizelgesiMapping: ProcessMapping = {
  antetSatirlari: { tablo: 'TANIM_Kurum', sutun: 'kurum_anteti', aciklama: 'Kurum Anteti' },
  kurumUst: { tablo: 'TANIM_Kurum', sutun: 'ust_kurum_adi', aciklama: 'Üst İdari Birim' },
  kurumAdi: { tablo: 'TANIM_Kurum', sutun: 'kurum_adi', aciklama: 'Kurum Adı' },
  mudurluk: { tablo: 'TANIM_Kurum', sutun: 'makam_adi', aciklama: 'Müdürlük / Makam' },
  isAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'konu', aciklama: 'İşin Adı' },
  baskanAdi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'onaylayan_personel_ad',
    aciklama: 'Başkan (Onaylayan)'
  },
  baskanUnvan: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'onaylayan_personel_unvan',
    aciklama: 'Başkan Ünvanı'
  }
}

// ===========================================================
// 11. Bütçe Sorgusu
// ===========================================================
export const ButceSorgusuMapping: ProcessMapping = {
  antetSatirlari: { tablo: 'TANIM_Kurum', sutun: 'kurum_anteti', aciklama: 'Kurum Anteti' },
  kurumAdi: { tablo: 'TANIM_Kurum', sutun: 'kurum_adi', aciklama: 'Kurum Adı' },
  dosyaKonusu: { deger: 'Bütçe Sorgusu', aciklama: 'Belge Başlığı / Konusu' },
  evrakSayisi: {
    formul:
      '{{TANIM_Kurum.detsis_kodu}}-{{DATA_TeminDosyasi.butce_yili}}/{{DATA_TeminDosyasi.temin_no}}',
    aciklama: 'Evrak Sayısı'
  },
  butceYili: { tablo: 'DATA_TeminDosyasi', sutun: 'butce_yili', aciklama: 'Bütçe Yılı' },
  butceTertibi: { tablo: 'DATA_TeminDosyasi', sutun: 'butce_tertibi', aciklama: 'Bütçe Tertibi' },
  isAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'konu', aciklama: 'İşin Adı' },
  hazirlayanPersonelAdi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'hazirlayan_personel_ad',
    aciklama: 'Hazırlayan Personel'
  },
  hazirlayanPersonelUnvan: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'hazirlayan_personel_unvan',
    aciklama: 'Hazırlayan Personel Ünvanı'
  }
}

// ===========================================================
// 12. Doğrudan Temin Onay Belgesi
// ===========================================================
export const DogrudanTeminOnayBelgesiMapping: ProcessMapping = {
  kurumUst: { tablo: 'TANIM_Kurum', sutun: 'ust_kurum_adi', aciklama: 'Üst İdari Birim' },
  kurumAdi: { tablo: 'TANIM_Kurum', sutun: 'kurum_adi', aciklama: 'Kurum Adı' },
  mudurluk: { tablo: 'TANIM_Kurum', sutun: 'makam_adi', aciklama: 'Müdürlük / Makam' },
  idareAdi: { tablo: 'TANIM_Kurum', sutun: 'kurum_adi', aciklama: 'İdare Adı' },
  evrakSayisi: {
    formul:
      '{{TANIM_Kurum.detsis_kodu}}-{{DATA_TeminDosyasi.butce_yili}}/{{DATA_TeminDosyasi.temin_no}}',
    aciklama: 'Evrak Sayısı'
  },
  teminNo: { tablo: 'DATA_TeminDosyasi', sutun: 'temin_no', aciklama: 'Temin Numarası' },
  isAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'konu', aciklama: 'İşin Adı' },
  isinAciklamasi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'isin_aciklamasi',
    aciklama: 'İşin Açıklaması'
  },
  yaklasikMaliyet: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'yaklasik_maliyet',
    aciklama: 'Yaklaşık Maliyet'
  },
  odenekTutari: { tablo: 'DATA_TeminDosyasi', sutun: 'odenek_tutari', aciklama: 'Ödenek Tutarı' },
  butceTertibi: { tablo: 'DATA_TeminDosyasi', sutun: 'butce_tertibi', aciklama: 'Bütçe Tertibi' },
  teminSekli: { tablo: 'DATA_TeminDosyasi', sutun: 'ihale_usulu', aciklama: 'Temin Åekli' },
  alimTuru: { tablo: 'DATA_TeminDosyasi', sutun: 'tur', aciklama: 'Alım Türü' },
  tarih: { tablo: 'DATA_TeminDosyasi', sutun: 'dosya_acilis_tarihi', aciklama: 'Onay Tarihi' },
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
    aciklama: 'Onaylayan Yetkili'
  },
  onaylayanPersonelUnvan: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'onaylayan_personel_unvan',
    aciklama: 'Onaylayan Yetkili Ünvanı'
  },
  baskanAdi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'onaylayan_personel_ad',
    aciklama: 'Başkan / Harcama Yetkilisi'
  },
  baskanUnvan: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'onaylayan_personel_unvan',
    aciklama: 'Başkan Ünvanı'
  }
}

// ===========================================================
// 13. Doğrudan Temin Sonuç Onay Belgesi
// ===========================================================
export const DogrudanTeminSonucOnayBelgesiMapping: ProcessMapping = {
  kurumUst: { tablo: 'TANIM_Kurum', sutun: 'ust_kurum_adi', aciklama: 'Üst İdari Birim' },
  kurumAdi: { tablo: 'TANIM_Kurum', sutun: 'kurum_adi', aciklama: 'Kurum Adı' },
  mudurluk: { tablo: 'TANIM_Kurum', sutun: 'makam_adi', aciklama: 'Müdürlük / Makam' },
  idareAdi: { tablo: 'TANIM_Kurum', sutun: 'kurum_adi', aciklama: 'İdare Adı' },
  evrakSayisi: {
    formul:
      '{{TANIM_Kurum.detsis_kodu}}-{{DATA_TeminDosyasi.butce_yili}}/{{DATA_TeminDosyasi.temin_no}}',
    aciklama: 'Evrak Sayısı'
  },
  isAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'konu', aciklama: 'İşin Adı' },
  isinAciklamasi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'isin_aciklamasi',
    aciklama: 'İşin Açıklaması'
  },
  yaklasikMaliyet: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'yaklasik_maliyet',
    aciklama: 'Yaklaşık Maliyet'
  },
  teminSekli: { tablo: 'DATA_TeminDosyasi', sutun: 'ihale_usulu', aciklama: 'Temin Åekli' },
  alimTuru: { tablo: 'DATA_TeminDosyasi', sutun: 'tur', aciklama: 'Alım Türü' },
  tarih: { tablo: 'DATA_TeminDosyasi', sutun: 'dosya_acilis_tarihi', aciklama: 'Onay Tarihi' },
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
    aciklama: 'Onaylayan Yetkili'
  },
  onaylayanPersonelUnvan: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'onaylayan_personel_unvan',
    aciklama: 'Onaylayan Yetkili Ünvanı'
  },
  baskanAdi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'onaylayan_personel_ad',
    aciklama: 'Başkan / Harcama Yetkilisi'
  },
  baskanUnvan: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'onaylayan_personel_unvan',
    aciklama: 'Başkan Ünvanı'
  }
}

// ===========================================================
// 14. Doğrudan Temin Sözleşmesi
// ===========================================================
export const DogrudanTeminSozlesmesiMapping: ProcessMapping = {
  kurumAdi: { tablo: 'TANIM_Kurum', sutun: 'kurum_adi', aciklama: 'Kurum Adı' },
  idareAdresi: { tablo: 'TANIM_Kurum', sutun: 'adres', aciklama: 'İdare Adresi' },
  idareTelefon: { tablo: 'TANIM_Kurum', sutun: 'telefon', aciklama: 'İdare Telefonu' },
  idareFaks: { tablo: 'TANIM_Kurum', sutun: 'faks', aciklama: 'İdare Faksı' },
  idareEposta: { tablo: 'TANIM_Kurum', sutun: 'eposta', aciklama: 'İdare E-Posta' },
  isinAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'konu', aciklama: 'İşin Adı' },
  genelToplam: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'yaklasik_maliyet',
    aciklama: 'Sözleşme Genel Toplamı'
  },
  baskanAdi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'onaylayan_personel_ad',
    aciklama: 'İdare Yetkilisi'
  },
  baskanUnvan: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'onaylayan_personel_unvan',
    aciklama: 'İdare Yetkilisi Ünvanı'
  }
}

// ===========================================================
// 15. Doğrudan Temin Sözleşmesi Alternatif
// ===========================================================
export const DogrudanTeminSozlesmesiAlternatifMapping: ProcessMapping = {
  kurumAdi: { tablo: 'TANIM_Kurum', sutun: 'kurum_adi', aciklama: 'Kurum Adı' },
  idareAdresi: { tablo: 'TANIM_Kurum', sutun: 'adres', aciklama: 'İdare Adresi' },
  idareTelefon: { tablo: 'TANIM_Kurum', sutun: 'telefon', aciklama: 'İdare Telefonu' },
  idareFaks: { tablo: 'TANIM_Kurum', sutun: 'faks', aciklama: 'İdare Faksı' },
  idareEposta: { tablo: 'TANIM_Kurum', sutun: 'eposta', aciklama: 'İdare E-Posta' },
  isinAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'konu', aciklama: 'İşin Adı' },
  genelToplam: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'yaklasik_maliyet',
    aciklama: 'Sözleşme Genel Toplamı'
  },
  baskanAdi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'onaylayan_personel_ad',
    aciklama: 'İdare Yetkilisi'
  },
  baskanUnvan: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'onaylayan_personel_unvan',
    aciklama: 'İdare Yetkilisi Ünvanı'
  }
}

// ===========================================================
// 16. Doğrudan Temin Sözleşmesi Uzun
// ===========================================================
export const DogrudanTeminSozlesmesiUzunMapping: ProcessMapping = {
  kurumAdi: { tablo: 'TANIM_Kurum', sutun: 'kurum_adi', aciklama: 'Kurum Adı' },
  idareAdresi: { tablo: 'TANIM_Kurum', sutun: 'adres', aciklama: 'İdare Adresi' },
  idareTelefon: { tablo: 'TANIM_Kurum', sutun: 'telefon', aciklama: 'İdare Telefonu' },
  idareFaks: { tablo: 'TANIM_Kurum', sutun: 'faks', aciklama: 'İdare Faksı' },
  idareEposta: { tablo: 'TANIM_Kurum', sutun: 'eposta', aciklama: 'İdare E-Posta' },
  isinAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'konu', aciklama: 'İşin Adı' },
  genelToplam: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'yaklasik_maliyet',
    aciklama: 'Sözleşme Genel Toplamı'
  },
  baskanAdi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'onaylayan_personel_ad',
    aciklama: 'İdare Yetkilisi'
  },
  baskanUnvan: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'onaylayan_personel_unvan',
    aciklama: 'İdare Yetkilisi Ünvanı'
  }
}

// ===========================================================
// 17. İdare Onay Belgesi (İhale Onay Belgesi)
// ===========================================================
export const IdareOnayBelgesiMapping: ProcessMapping = {
  kurumUst: { tablo: 'TANIM_Kurum', sutun: 'ust_kurum_adi', aciklama: 'Üst İdari Birim' },
  kurumAdi: { tablo: 'TANIM_Kurum', sutun: 'kurum_adi', aciklama: 'Kurum Adı' },
  mudurluk: { tablo: 'TANIM_Kurum', sutun: 'makam_adi', aciklama: 'Müdürlük / Makam' },
  idareAdi: { tablo: 'TANIM_Kurum', sutun: 'kurum_adi', aciklama: 'İdare Adı' },
  evrakSayisi: {
    formul:
      '{{TANIM_Kurum.detsis_kodu}}-{{DATA_TeminDosyasi.butce_yili}}/{{DATA_TeminDosyasi.temin_no}}',
    aciklama: 'Evrak Sayısı'
  },
  teminNo: { tablo: 'DATA_TeminDosyasi', sutun: 'temin_no', aciklama: 'Temin Numarası' },
  isAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'konu', aciklama: 'İşin Adı' },
  isinAciklamasi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'isin_aciklamasi',
    aciklama: 'İşin Açıklaması'
  },
  yaklasikMaliyet: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'yaklasik_maliyet',
    aciklama: 'Yaklaşık Maliyet'
  },
  odenekTutari: { tablo: 'DATA_TeminDosyasi', sutun: 'odenek_tutari', aciklama: 'Ödenek Tutarı' },
  butceTertibi: { tablo: 'DATA_TeminDosyasi', sutun: 'butce_tertibi', aciklama: 'Bütçe Tertibi' },
  teminSekli: { tablo: 'DATA_TeminDosyasi', sutun: 'ihale_usulu', aciklama: 'Temin Åekli' },
  tarih: { tablo: 'DATA_TeminDosyasi', sutun: 'dosya_acilis_tarihi', aciklama: 'Onay Tarihi' },
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
    aciklama: 'Onaylayan Yetkili'
  },
  onaylayanPersonelUnvan: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'onaylayan_personel_unvan',
    aciklama: 'Onaylayan Yetkili Ünvanı'
  }
}

// ===========================================================
// 18. İhale Komisyon Kararı
// ===========================================================
export const IhaleKomisyonKarariMapping: ProcessMapping = {
  kurumAdi: { tablo: 'TANIM_Kurum', sutun: 'kurum_adi', aciklama: 'Kurum Adı' },
  isinAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'konu', aciklama: 'İşin Adı' }
}

// ===========================================================
// 19. Kabul Edilen Teklif
// ===========================================================
export const KabulEdilenTeklifMapping: ProcessMapping = {
  antetSatirlari: { tablo: 'TANIM_Kurum', sutun: 'kurum_anteti', aciklama: 'Kurum Anteti' },
  kurumAdi: { tablo: 'TANIM_Kurum', sutun: 'kurum_adi', aciklama: 'Kurum Adı' },
  evrakSayisi: {
    formul:
      '{{TANIM_Kurum.detsis_kodu}}-{{DATA_TeminDosyasi.butce_yili}}/{{DATA_TeminDosyasi.temin_no}}',
    aciklama: 'Evrak Sayısı'
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
  baskanAdi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'onaylayan_personel_ad',
    aciklama: 'Onaylayan Yetkili'
  },
  baskanUnvan: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'onaylayan_personel_unvan',
    aciklama: 'Onaylayan Yetkili Ünvanı'
  },
  teslimGun: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'teslim_gun',
    varsayilan: '7',
    aciklama: 'Teslim Süresi (Gün)'
  },
  ihtiyacKalemleri: {
    tablo: 'DATA_TeminKalem',
    sutun: '*',
    iliskili_id: 'temin_dosya_id',
    altEslestirme: {
      malzemeAdi: 'kalem_adi',
      ozelligi: 'aciklama',
      birimi: 'birim',
      miktar: 'miktar'
    }
  }
}

// ===========================================================
// 20. Sözleşmeye Davet
// ===========================================================
export const SozlesmeyeDavetMapping: ProcessMapping = {
  antetSatirlari: { tablo: 'TANIM_Kurum', sutun: 'kurum_anteti', aciklama: 'Kurum Anteti' },
  kurumAdi: { tablo: 'TANIM_Kurum', sutun: 'kurum_adi', aciklama: 'Kurum Adı' },
  evrakSayisi: {
    formul:
      '{{TANIM_Kurum.detsis_kodu}}-{{DATA_TeminDosyasi.butce_yili}}/{{DATA_TeminDosyasi.temin_no}}',
    aciklama: 'Evrak Sayısı'
  },
  baskanAdi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'onaylayan_personel_ad',
    aciklama: 'Onaylayan Yetkili'
  },
  baskanUnvan: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'onaylayan_personel_unvan',
    aciklama: 'Onaylayan Yetkili Ünvanı'
  },
  ihtiyacKalemleri: {
    tablo: 'DATA_TeminKalem',
    sutun: '*',
    iliskili_id: 'temin_dosya_id',
    altEslestirme: {
      malzemeAdi: 'kalem_adi',
      ozelligi: 'aciklama',
      birimi: 'birim',
      miktar: 'miktar'
    }
  }
}

// ===========================================================
// 21. Teklif Mektubu
// ===========================================================
export const TeklifMektubuMapping: ProcessMapping = {
  antetSatirlari: { tablo: 'TANIM_Kurum', sutun: 'kurum_anteti', aciklama: 'Kurum Anteti' },
  kurumAdi: { tablo: 'TANIM_Kurum', sutun: 'kurum_adi', aciklama: 'Kurum Adı' },
  isinAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'konu', aciklama: 'İşin Adı' }
}

// ===========================================================
// 22. Hakediş Raporu
// ===========================================================
export const HakedisRaporuMapping: ProcessMapping = {
  kurumAdi: { tablo: 'TANIM_Kurum', sutun: 'kurum_adi', aciklama: 'Kurum Adı' },
  isinAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'konu', aciklama: 'İşin Adı' },
  onaylayanPersonelAdi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'onaylayan_personel_ad',
    aciklama: 'Onaylayan Yetkili'
  },
  onaylayanPersonelUnvan: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'onaylayan_personel_unvan',
    aciklama: 'Onaylayan Yetkili Ünvanı'
  }
}

// ===========================================================
// 23. Harcama Pusulası
// ===========================================================
export const HarcamaPusulasiMapping: ProcessMapping = {
  evrakSayisi: {
    aciklama: 'E-DETSİS-SDP-NO standart formatına uygun resmi evrak sayısı (örn: E-10234521-934.01-0001)'
  },
  tarih: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'dosya_acilis_tarihi',
    aciklama: 'Onay Tarihi'
  },
  idareAdi: { tablo: 'TANIM_Kurum', sutun: 'kurum_adi', aciklama: 'İdare Adı' },
  isAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'konu', aciklama: 'İşin Adı' },
  alimTuru: { tablo: 'DATA_TeminDosyasi', sutun: 'tur', aciklama: 'Alım Türü' },
  tutar: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'odenek_tutari',
    aciklama: 'Ödenek / Toplam Tutar (₺)'
  },
  // tutarYazi şablonda otomatik hesaplanır; gerekirse snapshot üzerinden override edilebilir
  tutarYazi: { aciklama: 'Tutarın yazı ile ifadesi (otomatik)' },
  miktar: { aciklama: 'Satın alınan mal/hizmet miktarı' },
  birimFiyat: { aciklama: 'Birim fiyatı (₺)' },
  aciklama: { aciklama: 'Harcama pusulası açıklaması' },
  saticiTcNo: { aciklama: 'Satıcının T.C. Kimlik No' },
  saticiAdiSoyadi: { aciklama: 'Satıcının Adı Soyadı' },
  saticiAdres: { aciklama: 'Satıcının Adresi' },
  onaylayanPersonelAdi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'onaylayan_personel_ad',
    aciklama: 'Onaylayan Yetkili'
  },
  onaylayanPersonelUnvan: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'onaylayan_personel_unvan',
    aciklama: 'Onaylayan Yetkili Ünvanı'
  }
}

// ===========================================================
// 24. Hizmet İşleri Kabul Teklif Belgesi
// ===========================================================
export const HizmetIsleriKabulTeklifBelgesiMapping: ProcessMapping = {
  kurumAdi: { tablo: 'TANIM_Kurum', sutun: 'kurum_adi', aciklama: 'Kurum Adı' },
  dosyaKonusu: { deger: 'Hizmet İşleri Kabul Teklif Belgesi', aciklama: 'Belge Başlığı / Konusu' },
  baskanAdi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'onaylayan_personel_ad',
    aciklama: 'Onaylayan Yetkili'
  },
  baskanUnvan: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'onaylayan_personel_unvan',
    aciklama: 'Onaylayan Yetkili Ünvanı'
  }
}

// ===========================================================
// 25. Hizmet İşleri Kabul Tutanağı
// ===========================================================
export const HizmetIsleriKabulTutanagiMapping: ProcessMapping = {
  kurumAdi: { tablo: 'TANIM_Kurum', sutun: 'kurum_adi', aciklama: 'Kurum Adı' },
  dosyaKonusu: { deger: 'Hizmet İşleri Kabul Tutanağı', aciklama: 'Belge Başlığı / Konusu' },
  baskanAdi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'onaylayan_personel_ad',
    aciklama: 'Onaylayan Yetkili'
  },
  baskanUnvan: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'onaylayan_personel_unvan',
    aciklama: 'Onaylayan Yetkili Ünvanı'
  }
}

// ===========================================================
// 26. Kabul Edilen Teklif Ödeme
// ===========================================================
export const KabulEdilenTeklifOdemeMapping: ProcessMapping = {
  antetSatirlari: { tablo: 'TANIM_Kurum', sutun: 'kurum_anteti', aciklama: 'Kurum Anteti' },
  kurumAdi: { tablo: 'TANIM_Kurum', sutun: 'kurum_adi', aciklama: 'Kurum Adı' },
  evrakSayisi: {
    formul:
      '{{TANIM_Kurum.detsis_kodu}}-{{DATA_TeminDosyasi.butce_yili}}/{{DATA_TeminDosyasi.temin_no}}',
    aciklama: 'Evrak Sayısı'
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
  baskanAdi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'onaylayan_personel_ad',
    aciklama: 'Onaylayan Yetkili'
  },
  baskanUnvan: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'onaylayan_personel_unvan',
    aciklama: 'Onaylayan Yetkili Ünvanı'
  },
  teslimGun: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'teslim_gun',
    varsayilan: '7',
    aciklama: 'Teslim Süresi (Gün)'
  },
  ihtiyacKalemleri: {
    tablo: 'DATA_TeminKalem',
    sutun: '*',
    iliskili_id: 'temin_dosya_id',
    altEslestirme: {
      malzemeAdi: 'kalem_adi',
      ozelligi: 'aciklama',
      birimi: 'birim',
      miktar: 'miktar'
    }
  }
}

// ===========================================================
// 27. Muayene Kabul Tutanağı
// ===========================================================
export const MuayeneKabulTutanagiMapping: ProcessMapping = {
  antetSatirlari: { tablo: 'TANIM_Kurum', sutun: 'kurum_anteti', aciklama: 'Kurum Anteti' },
  kurumAdi: { tablo: 'TANIM_Kurum', sutun: 'kurum_adi', aciklama: 'Kurum Adı' },
  evrakSayisi: {
    formul:
      '{{TANIM_Kurum.detsis_kodu}}-{{DATA_TeminDosyasi.butce_yili}}/{{DATA_TeminDosyasi.temin_no}}',
    aciklama: 'Evrak Sayısı'
  },
  baskanAdi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'onaylayan_personel_ad',
    aciklama: 'Onaylayan Yetkili'
  },
  baskanUnvan: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'onaylayan_personel_unvan',
    aciklama: 'Onaylayan Yetkili Ünvanı'
  },
  ihtiyacKalemleri: {
    tablo: 'DATA_TeminKalem',
    sutun: '*',
    iliskili_id: 'temin_dosya_id',
    altEslestirme: {
      malzemeAdi: 'kalem_adi',
      ozelligi: 'aciklama',
      birimi: 'birim',
      miktar: 'miktar'
    }
  }
}

// ===========================================================
// 28. Ödeme Emri Belgesi
// ===========================================================
export const OdemeEmriBelgesiMapping: ProcessMapping = {
  kurumAdi: { tablo: 'TANIM_Kurum', sutun: 'kurum_adi', aciklama: 'Kurum Adı' },
  dosyaKonusu: { deger: 'Ödeme Emri Belgesi', aciklama: 'Belge Başlığı / Konusu' },
  butceYili: { tablo: 'DATA_TeminDosyasi', sutun: 'butce_yili', aciklama: 'Bütçe Yılı' },
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
    aciklama: 'Onaylayan Yetkili'
  },
  onaylayanPersonelUnvan: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'onaylayan_personel_unvan',
    aciklama: 'Onaylayan Yetkili Ünvanı'
  },
  baskanAdi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'onaylayan_personel_ad',
    aciklama: 'Onaylayan Yetkili'
  },
  baskanUnvan: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'onaylayan_personel_unvan',
    aciklama: 'Onaylayan Yetkili Ünvanı'
  },
  gerceklestirmeGorevlisiAdi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'hazirlayan_personel_ad',
    aciklama: 'Gerçekleştirme Görevlisi'
  },
  gerceklestirmeGorevlisiUnvan: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'hazirlayan_personel_unvan',
    aciklama: 'Gerçekleştirme Görevlisi Ünvanı'
  }
}

// ===========================================================
// 29. Ödeme Yazısı
// ===========================================================
export const OdemeYazisiMapping: ProcessMapping = {
  kurumAdi: { tablo: 'TANIM_Kurum', sutun: 'kurum_adi', aciklama: 'Kurum Adı' },
  dosyaKonusu: { deger: 'Ödeme Yazısı', aciklama: 'Belge Başlığı / Konusu' },
  evrakSayisi: {
    formul:
      '{{TANIM_Kurum.detsis_kodu}}-{{DATA_TeminDosyasi.butce_yili}}/{{DATA_TeminDosyasi.temin_no}}',
    aciklama: 'Evrak Sayısı'
  },
  isinAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'konu', aciklama: 'İşin Adı' },
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
  baskanAdi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'onaylayan_personel_ad',
    aciklama: 'Onaylayan Yetkili'
  },
  baskanUnvan: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'onaylayan_personel_unvan',
    aciklama: 'Onaylayan Yetkili Ünvanı'
  }
}

// ===========================================================
// 30. Taşınır İşlem Fişi
// ===========================================================
export const TasinirIslemFisiMapping: ProcessMapping = {
  kurumAdi: { tablo: 'TANIM_Kurum', sutun: 'kurum_adi', aciklama: 'Kurum Adı' },
  ihtiyacKalemleri: {
    tablo: 'DATA_TeminKalem',
    sutun: '*',
    iliskili_id: 'temin_dosya_id',
    altEslestirme: {
      malzemeAdi: 'kalem_adi',
      ozelligi: 'aciklama',
      birimi: 'birim',
      miktar: 'miktar'
    }
  }
}

// ===========================================================
// 31. İhale Kapağı
// ===========================================================
export const IhaleKapagiMapping: ProcessMapping = {
  antetSatirlari: { tablo: 'TANIM_Kurum', sutun: 'kurum_anteti', aciklama: 'Kurum Anteti' },
  isAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'konu', aciklama: 'İşin Adı' },
  isinAciklamasi: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'isin_aciklamasi',
    aciklama: 'İşin Açıklaması'
  },
  yaklasikMaliyet: {
    tablo: 'DATA_TeminDosyasi',
    sutun: 'yaklasik_maliyet',
    aciklama: 'Yaklaşık Maliyet'
  },
  teminNo: { tablo: 'DATA_TeminDosyasi', sutun: 'temin_no', aciklama: 'Temin Numarası' },
  alimTuru: { tablo: 'DATA_TeminDosyasi', sutun: 'tur', aciklama: 'Alım Türü' },
  butceTertibi: { tablo: 'DATA_TeminDosyasi', sutun: 'butce_tertibi', aciklama: 'Bütçe Tertibi' }
}

// ===========================================================
// 32. Kapak İçi İndeks Åablonu
// ===========================================================
export const KapakIciIndeksSablonuMapping: ProcessMapping = {
  antetSatirlari: { tablo: 'TANIM_Kurum', sutun: 'kurum_anteti', aciklama: 'Kurum Anteti' },
  solLogo: { tablo: 'TANIM_Kurum', sutun: 'logo_sol', aciklama: 'Sol Logo (Base64)' },
  sagLogo: { tablo: 'TANIM_Kurum', sutun: 'logo_sag', aciklama: 'Sağ Logo (Base64)' },
  kurumAdi: { tablo: 'TANIM_Kurum', sutun: 'kurum_adi', aciklama: 'Kurum Adı' },
  isAdi: { tablo: 'DATA_TeminDosyasi', sutun: 'konu', aciklama: 'İşin Adı' }
}

// ===========================================================
// 33. Klasör Sırtlığı 3cm
// ===========================================================
export const KlasorSirtligi3cmMapping: ProcessMapping = {
  kurumAdi: { tablo: 'TANIM_Kurum', sutun: 'kurum_adi', aciklama: 'Kurum Adı' },
  solLogo: { tablo: 'TANIM_Kurum', sutun: 'logo_sol', aciklama: 'Sol Logo (Base64)' },
  yil: { tablo: 'DATA_TeminDosyasi', sutun: 'butce_yili', aciklama: 'Bütçe Yılı' },
  konu: { tablo: 'DATA_TeminDosyasi', sutun: 'konu', aciklama: 'İşin Adı' }
}

// ===========================================================
// 34. Klasör Sırtlığı 5cm
// ===========================================================
export const KlasorSirtligi5cmMapping: ProcessMapping = {
  kurumAdi: { tablo: 'TANIM_Kurum', sutun: 'kurum_adi', aciklama: 'Kurum Adı' },
  solLogo: { tablo: 'TANIM_Kurum', sutun: 'logo_sol', aciklama: 'Sol Logo (Base64)' },
  yil: { tablo: 'DATA_TeminDosyasi', sutun: 'butce_yili', aciklama: 'Bütçe Yılı' },
  konu: { tablo: 'DATA_TeminDosyasi', sutun: 'konu', aciklama: 'İşin Adı' }
}

// ===========================================================
// 35. Klasör Sırtlığı 7.5cm
// ===========================================================
export const KlasorSirtligi75cmMapping: ProcessMapping = {
  kurumAdi: { tablo: 'TANIM_Kurum', sutun: 'kurum_adi', aciklama: 'Kurum Adı' },
  solLogo: { tablo: 'TANIM_Kurum', sutun: 'logo_sol', aciklama: 'Sol Logo (Base64)' },
  yil: { tablo: 'DATA_TeminDosyasi', sutun: 'butce_yili', aciklama: 'Bütçe Yılı' },
  konu: { tablo: 'DATA_TeminDosyasi', sutun: 'konu', aciklama: 'İşin Adı' }
}

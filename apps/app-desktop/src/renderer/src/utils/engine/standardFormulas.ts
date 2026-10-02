/**
 * TEMİN 360 - STANDART MEVZUAT FORMÜLLERİ VE KURALLARI KATALOĞU
 *
 * Kamu kurumları ve belediyeler için önceden tanımlanmış,
 * mevzuata uygun hazır formül ve kural seti.
 */

import { KuralTanimi } from './ruleEngine'

export interface FormulTanimi {
  id: string
  ad: string
  etiket: string
  kategori: 'MALI' | 'IHALE' | 'VERGI' | 'SURE' | 'IMAR'
  formul: string
  sonucTipi: 'para' | 'yuzde' | 'sayi' | 'tarih' | 'metin' | 'mantiksal'
  aciklama: string
  ornekGirdiler: Record<string, any>
}

export const STANDART_FORMUL_KATALOGU: FormulTanimi[] = [
  {
    id: 'damga_vergisi_sozlesme',
    ad: 'damga_vergisi_sozlesme',
    etiket: 'Sözleşme Damga Vergisi (Binde 9.48)',
    kategori: 'VERGI',
    formul: 'sozlesme_bedeli * parametre("damgaVergisiSozlesme")',
    sonucTipi: 'para',
    aciklama: '488 sayılı Kanuna göre sözleşme bedeli üzerinden binde 9,48 damga vergisi hesaplar.',
    ornekGirdiler: { sozlesme_bedeli: 500000 }
  },
  {
    id: 'damga_vergisi_karar',
    ad: 'damga_vergisi_karar',
    etiket: 'İhale Karar Damga Vergisi (Binde 5.69)',
    kategori: 'VERGI',
    formul: 'ihale_bedeli * parametre("damgaVergisiIhaleKarari")',
    sonucTipi: 'para',
    aciklama:
      'İhale komisyonu veya encümen ihale karar bedeli üzerinden binde 5,69 damga vergisi hesaplar.',
    ornekGirdiler: { ihale_bedeli: 500000 }
  },
  {
    id: 'gecici_teminat_min',
    ad: 'gecici_teminat_min',
    etiket: 'Geçici Teminat Tutarı (%3)',
    kategori: 'IHALE',
    formul: 'teklif_bedeli * 0.03',
    sonucTipi: 'para',
    aciklama:
      '4734 sayılı Kanun gereğince teklif edilen bedelin en az %3 oranındaki geçici teminatı hesaplar.',
    ornekGirdiler: { teklif_bedeli: 750000 }
  },
  {
    id: 'kesin_teminat',
    ad: 'kesin_teminat',
    etiket: 'Kesin Teminat Tutarı (%6)',
    kategori: 'IHALE',
    formul: 'sozlesme_bedeli * 0.06',
    sonucTipi: 'para',
    aciklama: 'İhale bedeli üzerinden %6 oranında kesin teminat tutarını hesaplar.',
    ornekGirdiler: { sozlesme_bedeli: 1000000 }
  },
  {
    id: 'gecikme_cezasi',
    ad: 'gecikme_cezasi',
    etiket: 'Gecikme Cezası (Günlük Binde 0.5 - Maks %30)',
    kategori: 'MALI',
    formul: 'min(gecikme_gun * sozlesme_bedeli * 0.0005, sozlesme_bedeli * 0.30)',
    sonucTipi: 'para',
    aciklama: 'Sözleşmede belirlenen günlük ceza tutarını hesaplar, yasal %30 üst sınırını aşamaz.',
    ornekGirdiler: { sozlesme_bedeli: 1000000, gecikme_gun: 15 }
  },
  {
    id: 'kik_payi_kesintisi',
    ad: 'kik_payi_kesintisi',
    etiket: 'KİK Payı Kesintisi (Onbinde 5)',
    kategori: 'VERGI',
    formul: 'eger(sozlesme_bedeli >= esik("kikPayiEsikTutari"), sozlesme_bedeli * 0.0005, 0)',
    sonucTipi: 'para',
    aciklama:
      'Eşik değerin üzerindeki sözleşmelerde Kamu İhale Kurumu payını (On binde 5) hesaplar.',
    ornekGirdiler: { sozlesme_bedeli: 2000000 }
  },
  {
    id: 'net_odeme',
    ad: 'net_odeme',
    etiket: 'Net Hakediş Ödeme Tutarı',
    kategori: 'MALI',
    formul: 'hakedis_brut - stopaj - damga_vergisi_sozlesme - avans_mahsubu',
    sonucTipi: 'para',
    aciklama:
      'Brüt hakedişten tüm vergi, stopaj ve avans mahsuplarını düşerek yükleniciye ödenecek net tutarı bulur.',
    ornekGirdiler: {
      hakedis_brut: 350000,
      stopaj: 0,
      sozlesme_bedeli: 350000,
      avans_mahsubu: 25000
    }
  }
]

export const STANDART_KURAL_KATALOGU: KuralTanimi[] = [
  {
    id: 'kural_22d_limit_kontrolu',
    ad: '4734 Madde 22/d Doğrudan Temin Limit Denetimi',
    aciklama: 'Alım tutarı doğrudan temin limitini aştığında ihale onayını durdurur.',
    kosulFormulu: 'yaklasik_maliyet > esik("dogrudanTemin22d")',
    sonucTipi: 'ENGELLE',
    mesaj:
      'Yaklaşık Maliyet, ilgili yıl doğrudan temin limitini aşmaktadır! Pazarlık (21/f) veya Açık İhale (Madde 19) usulü uygulanmalıdır.',
    aktifMi: true,
    oncelik: 100
  },
  {
    id: 'kural_butce_yuzde_on',
    ad: '4734 Madde 62/ı %10 Bütçe Tavan Uyarısı',
    aciklama:
      'Yıllık doğrudan temin toplamı ödenek tavanını aşarsa KİK uygun görüş şartı uyarısı verir.',
    kosulFormulu: 'yillik_harcama_toplami > (yillik_toplam_odenek * 0.10)',
    sonucTipi: 'ONAY_GEREKTIR',
    mesaj:
      '4734 Madde 62/ı uyarınca doğrudan temin harcamaları bütçe ödeneğinin %10 sınırını aşmıştır. Kamu İhale Kurulu uygun görüşü gereklidir.',
    aktifMi: true,
    oncelik: 90
  },
  {
    id: 'kural_is_artisi_yasal_sinir',
    ad: '4735 Madde 24 İş Artışı %20 Yasal Sınır Kontrolü',
    aciklama: 'Sözleşme artış tutarı %20 sınırını aştığında engelleme uygular.',
    kosulFormulu: 'artis_tutari > (sozlesme_bedeli * 0.20)',
    sonucTipi: 'ENGELLE',
    mesaj:
      'İş artış tutarı yasal %20 sözleşme sınırını aşamaz! Cumhurbaşkanlığı / Bakanlar Kurulu izni olmadan ek sözleşme yapılamaz.',
    aktifMi: true,
    oncelik: 95
  },
  {
    id: 'kural_sure_uzatimi_uyari',
    ad: 'Süre Uzatımı Üst Yönetici Onayı',
    aciklama: 'Süre uzatımı toplam sürenin %50sini aşarsa üst yetkili onayı ister.',
    kosulFormulu: 'toplam_uzatma_gun > (sozlesme_suresi_gun * 0.50)',
    sonucTipi: 'ONAY_GEREKTIR',
    mesaj:
      "Talep edilen süre uzatımı toplam sözleşme süresinin %50'sini aşmaktadır. Harcama Yetkilisi ve Üst Yönetici onayı gereklidir.",
    aktifMi: true,
    oncelik: 80
  },
  {
    id: 'kural_gecikme_ceza_tavani',
    ad: 'Gecikme Cezası %30 Tavan Uyarısı',
    aciklama: 'Gecikme cezası sözleşme bedelinin %30una ulaştığında fesih uyarısı verir.',
    kosulFormulu: 'gecikme_gun * 0.0005 >= 0.30',
    sonucTipi: 'UYARI',
    mesaj:
      "Gecikme cezası yasal tavan olan %30'a ulaşmıştır. Sözleşmenin feshi ve kesin teminatın gelir kaydedilmesi değerlendirilmelidir.",
    aktifMi: true,
    oncelik: 85
  }
]

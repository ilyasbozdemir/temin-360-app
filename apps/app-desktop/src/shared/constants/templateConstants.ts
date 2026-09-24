/**
 * Şablon Tanımları, Grupları, Kategorileri ve Komisyon Sabitleri
 *
 * Tek Doğruluk Kaynağı (Single Source of Truth)
 * Uygulama genelinde (main & renderer) tüm şablon isimleri ve gruplandırmaları
 * bu dosyadan çekilir, tekrar eden veri kullanılmaz.
 */

export interface TemplateGroupItem {
  dosya_adi: string
  etiket: string
}

export interface TemplateGroup {
  grup: string
  sablonlar: TemplateGroupItem[]
}

/**
 * Tüm HTML şablonlarının dosya/klasör ID'si ile Türkçe resmi adı eşleşmesi.
 */
export const TEMPLATE_NAMES: Record<string, string> = {
  'harcama-talimati': 'HARCAMA TALİMATI',
  'ihtiyac-listesi': 'İHTİYAÇ LİSTESİ',
  'ihtiyac-talep-formu': 'İHTİYAÇ TALEP FORMU',
  'komisyon-gorevlendirme-onayi':
    'KOMİSYON GÖREVLENDİRME ONAYI (MUAYENE VE KABUL VE FİYAT ARAŞTIRMASI)',
  'komisyon-gorevlendirme-onayi-eki':
    'KOMİSYON GÖREVLENDİRME ONAYI EKİ (MUAYENE VE KABUL VE FİYAT ARAŞTIRMASI)',
  'luzum-muzekkeresi': 'Lüzum Müzekkeresi',
  'luzum-muzekkeresi-onay-eki': 'Lüzum Müzekkeresi ONAY EKİ',
  'luzum-muzekkeresi-teslim-tesellum': 'Lüzum Müzekkeresi TESLİM TESELLÜM',
  'son-alim-fiyat-cetveli': 'SON ALIM FİYAT CETVELİ',
  'arastirma-mektubu': 'ARAŞTIRMA MEKTUBU',
  'birim-fiyat-teklif-cetveli': 'BİRİM FİYAT TEKLİF CETVELİ',
  'birim-fiyat-teklif-mektubu': 'BİRİM FİYAT TEKLİF MEKTUBU',
  'dagitim-cizelgesi': 'DAĞITIM ÇİZELGESİ',
  'dagitim-cizelgesi-karma': 'DAĞITIM ÇİZELGESİ (KARMA)',
  'fiyat-arastirma-mektubu': 'FİYAT ARAŞTIRMA MEKTUBU',
  'fiyat-arastirmasi': 'FİYAT ARAŞTIRMASI',
  'piyasa-fiyat-arastirma-gorevlendirmesi': 'PİYASA FİYAT ARAŞTIRMA GÖREVLENDİRMESİ',
  'piyasa-fiyat-arastirma-tutanagi': 'PİYASA FİYAT ARAŞTIRMA TUTANAĞI',
  'teklif-mektubu-dagitim-cizelgesi': 'TEKLİF MEKTUBU DAĞITIM ÇİZELGESİ',
  'yaklasik-maliyet-cetveli': 'YAKLAŞIK MALİYET CETVELİ',
  'yaklasik-maliyet-teklif-mektubu': 'YAKLAŞIK MALİYET TEKLİF MEKTUBU',
  'butce-sorgusu': 'BÜTÇE SORGUSU',
  'dogrudan-temin-onay-belgesi': 'DOĞRUDAN TEMİN ONAY BELGESİ',
  'dogrudan-temin-sonuc-onay-belgesi': 'DOĞRUDAN TEMİN SONUÇ ONAY BELGESİ',
  'dogrudan-temin-sozlesmesi': 'DOĞRUDAN TEMİN SÖZLEŞMESİ',
  'dogrudan-temin-sozlesmesi-alternatif': 'DOĞRUDAN TEMİN SÖZLEŞMESİ (ALTERNATİF)',
  'dogrudan-temin-sozlesmesi-uzun': 'DOĞRUDAN TEMİN SÖZLEŞMESİ (UZUN)',
  'idare-onay-belgesi': 'İDARE ONAY BELGESİ',
  'ihale-komisyon-karari': 'İHALE KOMİSYON KARARI',
  'kabul-edilen-teklif': 'KABUL EDİLEN TEKLİF',
  'kabul-edilen-teklif-alternatif': 'KABUL EDİLEN TEKLİF (ALTERNATİF)',
  'sozlesmeye-davet': 'SÖZLEŞMEYE DAVET',
  'teklif-mektubu': 'TEKLİF MEKTUBU',
  'gunluk-calisma-puantaj-cizelgesi': 'GÜNLÜK ÇALIŞMA PUANTAJ ÇİZELGESİ',
  'hakedis-raporu': 'HAKEDİŞ RAPORU',
  'harcama-pusulasi': 'HARCAMA PUSULASI',
  'hizmet-isleri-kabul-teklif-belgesi': 'HİZMET İŞLERİ KABUL TEKLİF BELGESİ',
  'hizmet-isleri-kabul-tutanagi': 'HİZMET İŞLERİ KABUL TUTANAĞI',
  'muayene-kabul-komisyonu': 'MUAYENE VE KABUL KOMİSYONU',
  'muayene-kabul-tutanagi': 'MUAYENE VE KABUL TUTANAĞI',
  'odeme-emri-belgesi': 'ÖDEME EMRİ BELGESİ',
  'odeme-yazisi': 'ÖDEME YAZISI',
  'tasinir-islem-fisi': 'TAŞINIR İŞLEM FİŞİ',
  'ihale-kapagi': 'İHALE KAPAĞI',
  'kapak-ici-indeks-sablonu': 'KAPAK İÇİ İNDEKS ŞABLONU',
  'klasor-sirtligi-3cm': 'KLASÖR SIRTLIĞI (3 CM)',
  'klasor-sirtligi-5cm': 'KLASÖR SIRTLIĞI (5 CM)',
  'klasor-sirtligi-7-5cm': 'KLASÖR SIRTLIĞI (7.5 CM)'
}

/**
 * Şablon klasörleri ve aşama başlıkları eşleşmesi.
 */
export const TEMPLATE_CATEGORIES: Record<string, string> = {
  '1-ihtiyac-tespiti-ve-baslangic': '1. İhtiyaç Tespiti & Başlangıç',
  '2-piyasa-fiyat-arastirmasi': '2. Piyasa Fiyat Araştırması',
  '3-siparis-ve-sozlesme': '3. Sipariş & Sözleşme',
  '4-kabul-ve-odeme-islemleri': '4. Muayene & Kabul & Ödeme İşlemleri',
  '5-klasor-ve-kapaklar': '5. Klasör & Kapaklar'
}

/**
 * TEMPLATE_GROUPS — Hangi şablonlar aynı kart veya süreç altında gruplanır.
 * Dizi sırası = grup_siralama (0-indexed). İlk eleman her zaman "Ana Belge" görünür.
 */
export const TEMPLATE_GROUPS: TemplateGroup[] = [
  // İhtiyaç Listesi ailesi
  {
    grup: 'ihtiyac-listesi',
    sablonlar: [
      { dosya_adi: 'ihtiyac-listesi', etiket: 'İhtiyaç Listesi' },
      { dosya_adi: 'ihtiyac-talep-formu', etiket: 'Talep Formu' }
    ]
  },
  // Lüzum Müzekkeresi ailesi
  {
    grup: 'luzum-muzekkeresi',
    sablonlar: [
      { dosya_adi: 'luzum-muzekkeresi', etiket: 'Lüzum Müzekkeresi' },
      { dosya_adi: 'luzum-muzekkeresi-onay-eki', etiket: 'Onay Eki' },
      { dosya_adi: 'luzum-muzekkeresi-teslim-tesellum', etiket: 'Teslim Tesellüm' }
    ]
  },
  // Komisyon Görevlendirme ailesi
  {
    grup: 'komisyon-gorevlendirme',
    sablonlar: [
      { dosya_adi: 'komisyon-gorevlendirme-onayi', etiket: 'Komisyon Atama' },
      { dosya_adi: 'komisyon-gorevlendirme-onayi-eki', etiket: 'Onay Eki' }
    ]
  },
  // Onay Belgesi ailesi
  {
    grup: 'onay-belgesi',
    sablonlar: [
      { dosya_adi: 'dogrudan-temin-onay-belgesi', etiket: 'Doğrudan Temin' },
      { dosya_adi: 'idare-onay-belgesi', etiket: 'İhale' },
      { dosya_adi: 'butce-sorgusu', etiket: 'Bütçe Sorgusu' }
    ]
  },
  // Harcama ailesi
  {
    grup: 'harcama',
    sablonlar: [
      { dosya_adi: 'harcama-talimati', etiket: 'Harcama Talimatı' },
      { dosya_adi: 'harcama-pusulasi', etiket: 'Harcama Pusulası' }
    ]
  },
  // Doğrudan Temin Sözleşmesi ailesi
  {
    grup: 'dt-sozlesmesi',
    sablonlar: [
      { dosya_adi: 'dogrudan-temin-sozlesmesi', etiket: 'Standart' },
      { dosya_adi: 'dogrudan-temin-sozlesmesi-alternatif', etiket: 'Alternatif' },
      { dosya_adi: 'dogrudan-temin-sozlesmesi-uzun', etiket: 'Uzun Form' }
    ]
  },
  // Dağıtım Çizelgesi ailesi
  {
    grup: 'dagitim-cizelgesi',
    sablonlar: [
      { dosya_adi: 'dagitim-cizelgesi', etiket: 'Standart' },
      { dosya_adi: 'dagitim-cizelgesi-karma', etiket: 'Karma' }
    ]
  },
  // Klasör Sırtlığı ailesi
  {
    grup: 'klasor-sirtligi',
    sablonlar: [
      { dosya_adi: 'klasor-sirtligi-3cm', etiket: '3 cm' },
      { dosya_adi: 'klasor-sirtligi-5cm', etiket: '5 cm' },
      { dosya_adi: 'klasor-sirtligi-7-5cm', etiket: '7.5 cm' }
    ]
  },
  // Kabul Edilen Teklif ailesi
  {
    grup: 'kabul-edilen-teklif',
    sablonlar: [
      { dosya_adi: 'kabul-edilen-teklif', etiket: 'Standart' },
      { dosya_adi: 'kabul-edilen-teklif-alternatif', etiket: 'Alternatif' }
    ]
  },
  // Muayene & Kabul ailesi
  {
    grup: 'muayene-kabul',
    sablonlar: [
      { dosya_adi: 'muayene-kabul-komisyonu', etiket: 'Komisyon' },
      { dosya_adi: 'muayene-kabul-tutanagi', etiket: 'Tutanak' }
    ]
  }
]

/**
 * Hızlı lookup Record: dosya_adi → { grup, etiket, siralama }
 * useDosyaAsamasiSablons ve diğer UI bileşenleri için dinamik olarak üretilir.
 */
export const SABLON_GRUPLARI: Record<string, { grup: string; etiket: string; siralama: number }> =
  {}

for (const g of TEMPLATE_GROUPS) {
  g.sablonlar.forEach((s, i) => {
    SABLON_GRUPLARI[s.dosya_adi] = {
      grup: g.grup,
      etiket: s.etiket,
      siralama: i
    }
  })
}

/**
 * Yaklaşık Maliyet komisyonuna otomatik atanacak varsayılan şablon listesi.
 */
export const DEFAULT_YAKLASIK_SABLONLAR = [
  'piyasa-fiyat-arastirma-gorevlendirmesi',
  'komisyon-gorevlendirme-onayi',
  'komisyon-gorevlendirme-onayi-eki',
  'arastirma-mektubu',
  'fiyat-arastirma-mektubu',
  'birim-fiyat-teklif-mektubu',
  'birim-fiyat-teklif-cetveli',
  'dagitim-cizelgesi',
  'dagitim-cizelgesi-karma',
  'piyasa-fiyat-arastirma-tutanagi',
  'yaklasik-maliyet-cetveli',
  'son-alim-fiyat-cetveli'
] as const

/**
 * Muayene ve Kabul komisyonuna otomatik atanacak varsayılan şablon listesi.
 */
export const DEFAULT_MUAYENE_SABLONLAR = [
  'muayene-kabul-komisyonu',
  'muayene-kabul-tutanagi',
  'harcama-pusulasi',
  'luzum-muzekkeresi-teslim-tesellum',
  'hizmet-isleri-kabul-tutanagi',
  'hizmet-isleri-kabul-teklif-belgesi'
] as const

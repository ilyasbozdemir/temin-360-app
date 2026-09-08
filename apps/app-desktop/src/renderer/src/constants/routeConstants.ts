export const APP_ROUTES = {
  // Main
  DASHBOARD: '/',
  HARCAMA_MERKEZI: '/harcama-merkezi',

  // Dosyalar
  DOSYALAR: '/dosyalar',
  YENI_DOSYA: '/dosyalar/yeni',
  DOSYA_DETAY: '/dosya',
  CIKTI_MERKEZI_DASHBOARD: '/cikti-merkezi',

  // Modüller
  FIRMALAR: '/firmalar',
  PERSONEL: '/personel',
  SABLONLAR: '/sablonlar',
  DEGISKENLER: '/degiskenler',
  KOMISYONLAR: '/komisyonlar',
  KOMISYON_DETAY: '/komisyonlar/detay',
  KOMISYON_GOREVLERI: '/komisyon-gorevleri',
  TAKIP: '/takip',
  TASLAK_YONETIM: '/taslakyonetim',
  RAPORLAR: '/raporlar',
  OKAS_KOD: '/okaskod',
  MEVZUAT: '/mevzuat',
  CHANGELOG: '/changelog',
  YARDIM: '/yardim',
  IMPORT: '/import',
  AYARLAR: '/ayarlar',
  TEMA: '/tema',
  BIRIMLER: '/birimler',
  AMBAR: '/ambar',
  MALZEMELER: '/malzemeler',
  YENI_MALZEME: '/malzemeler/yeni',
  TASINIR_KOD: '/tasinirkod',
  POZLAR: '/pozlar',
  OLCU_BIRIMLERI: '/olcubirimleri',
  KURUM: '/kurum',
  PROFIL: '/profil',
  HAKEDIS: '/hakedis',

  // Dosya Alt Süreçleri (SubScreens)
  // Aşamalar
  HAZIRLIK_VE_IHTIYAC: '/dosya/hazirlik-ve-ihtiyac',
  PIYASA_FIYAT_ARASTIRMASI: '/dosya/piyasa-fiyat-arastirmasi',
  SIPARIS_VE_SOZLESME: '/dosya/siparis-ve-sozlesme',
  KABUL_VE_ODEME: '/dosya/kabul-ve-odeme',
  KLASOR_VE_KAPAKLAR: '/dosya/klasor-ve-kapaklar',

  // Diğer Alt Modüller
  YAKLASIK_MALIYET: '/dosya/firmalar-maliyet/yaklasik',
  DOSYA_CIKTI_MERKEZI: '/dosya/cikti-merkezi',
  DOSYA_VERITABANI: '/dosya/veritabani',
  FATURA_VE_IRSALIYE: '/dosya/fatura-ve-irsaliye',
  IMZALI_BELGELER: '/dosya/imzali-belgeler',
  HIZLI_DOSYA_EKLE: '/hizli-dosya-ekle',
  SUREC_AKISI: '/surec-akisi',
  DT_SUREC_AKISI: '/surec-akisi'
} as const

export type AppRoute = (typeof APP_ROUTES)[keyof typeof APP_ROUTES]

export interface YardimDocumentItem {
  id: string
  title: string
  description: string
  file: string
}

export interface YardimDocumentCategory {
  category: string
  items: YardimDocumentItem[]
}

export const DOCUMENTS: YardimDocumentCategory[] = [
  {
    category: 'Sistem Kılavuzu & Tanıtım',
    items: [
      {
        id: 'uygulamamizi_yakindan_taniyalim',
        title: 'Uygulamamızı Yakından Tanıyalım',
        description:
          'Uygulama genel yapısı, şablon mekanizması, sayfa yerleşimleri (A4/yarım sayfa) ve dosya/veri mimarisi hakkında detaylı rehber.',
        file: 'system_guide'
      },
      {
        id: 'standart_dosya_plani_ve_saklama_rehberi',
        title: 'SDP & Arşiv Saklama Rehberi',
        description:
          'Standart Dosya Planı (SDP) kodları, DETSİS numaralandırma yapısı ve arşiv saklama/imha süreleri hakkında resmi rehber.',
        file: 'standart_dosya_plani'
      }
    ]
  },
  {
    category: 'Resmi Yazışma ve Kullanıcı Kılavuzları',
    items: [
      {
        id: 'dogrudan_temin_islem_sureci',
        title: 'Doğrudan Temin İşlem Süreci',
        description:
          'Doğrudan temin alım sürecinin adım adım tüm aşamaları (Lüzum Müzekkeresinden ödeme emrine).',
        file: 'dta-res://docs/dogrudan_temin_islem_sureci.doc'
      },
      {
        id: 'resmi_yazisma_kurallari',
        title: 'Resmi Yazışma Kuralları',
        description: 'Resmi yazışmalarda uyulması gereken kurallar ve standartlar.',
        file: 'dta-res://docs/resmi_yazisma_kurallari.pdf'
      },
      {
        id: 'resmi_yazismalarda_uygulanacak_usul_ve_esaslar_yonetmelik_kilavuzu',
        title: 'Resmi Yazışmalar Yönetmelik Kılavuzu',
        description: 'Resmi Yazışmalarda Uygulanacak Usul ve Esaslar Hakkında Yönetmelik Kılavuzu.',
        file: 'dta-res://docs/resmi_yazismalarda_uygulanacak_usul_ve_esaslar_yonetmelik_kilavuzu.pdf'
      },
      {
        id: 'dogrudan_temin_son_kullanici_kilavuzu',
        title: 'Doğrudan Temin Son Kullanıcı Kılavuzu',
        description: 'Doğrudan Temin Modülü son kullanıcı detaylı kullanım kılavuzu.',
        file: 'dta-res://docs/dogrudan_temin_son_kullanici_kilavuzu.pdf'
      }
    ]
  },
  {
    category: 'Taşınır Mal Yönetmeliği & Kod Listeleri',
    items: [
      {
        id: 'tasinir_mal_yonetmeligi_rehberi',
        title: 'Taşınır Mal Yönetmeliği Rehberi',
        description: 'Taşınır Mal Yönetmeliği uygulamaları ve işleyişi hakkında detaylı rehber.',
        file: 'dta-res://docs/tasinir/tasinir_mal_yonetmeligi_rehberi.pdf'
      },
      {
        id: 'tasinir_kod_listesi_ve_tanitimlari',
        title: 'Taşınır Kod Listesi ve Tanıtımları',
        description:
          'Tüm taşınır (150, 253, 254, 255 vb.) hesap kodları ve açıklamaları tablosu (Excel).',
        file: 'dta-res://docs/tasinir/tasinir_kod_listesi_ve_tanitimlari.xls'
      },
      {
        id: 'tasinir_kod_listesi_guncel_2026',
        title: 'Güncel Taşınır Kod Listesi',
        description: 'Güncel taşınır kodları ve detaylı sınıflandırma listesi (Excel).',
        file: 'dta-res://docs/tasinir/tasinir_kod_listesi_guncel_2026.xls'
      }
    ]
  },
  {
    category: 'Kamu İhale & OKAS Kodları',
    items: [
      {
        id: 'okas_kod_listesi',
        title: 'OKAS Kod Listesi (Ortak Kamu Alımları Sözlüğü)',
        description: 'Ortak Kamu Alımları Sözlüğü (OKAS / CPV) kodları tablosu (Excel).',
        file: 'dta-res://docs/kik/okas_kod_listesi.xls'
      }
    ]
  },
  {
    category: 'Muhasebat & Bütçe Sınıflandırması',
    items: [
      {
        id: 'analitik_butce_siniflandirmasina_iliskin_rehber',
        title: 'Analitik Bütçe Sınıflandırması Rehberi',
        description:
          'Harcama birimleri için kurumsal, fonksiyonel ve ekonomik kodlama yapısı rehberi.',
        file: 'dta-res://docs/muhasebat/analitik_butce_siniflandirmasina_iliskin_rehber.pdf'
      },
      {
        id: 'kamu_idarelerince_hazirlanacak_faaliyet_raporlari_hakkinda_yonetmelik',
        title: 'Faaliyet Raporları Yönetmeliği',
        description: 'Kamu idarelerince hazırlanacak faaliyet raporları hakkında yönetmelik.',
        file: 'dta-res://docs/muhasebat/kamu_idarelerince_hazirlanacak_faaliyet_raporlari_hakkinda_yonetmelik.pdf'
      },
      {
        id: 'giderlerin_kurumsal_siniflandirilmasi_tablosu',
        title: 'Giderlerin Kurumsal Sınıflandırılması Tablosu',
        description: 'Kurumsal kod yapısı ve idari birim kodları tablosu.',
        file: 'dta-res://docs/muhasebat/giderlerin_kurumsal_siniflandirilmasi_tablosu.pdf'
      },
      {
        id: 'giderlerin_fonksiyonel_siniflandirilmasi_tablosu',
        title: 'Giderlerin Fonksiyonel Sınıflandırılması Tablosu',
        description: 'Kamu hizmetlerinin fonksiyonel sınıflandırma kodları tablosu.',
        file: 'dta-res://docs/muhasebat/giderlerin_fonksiyonel_siniflandirilmasi_tablosu.pdf'
      },
      {
        id: 'giderlerin_ekonomik_siniflandirilmasi_tablosu',
        title: 'Giderlerin Ekonomik Sınıflandırılması Tablosu',
        description: 'Bütçe giderlerinin ekonomik sınıflandırma (03, 03.2 vb.) detayları tablosu.',
        file: 'dta-res://docs/muhasebat/giderlerin_ekonomik_siniflandirilmasi_tablosu.pdf'
      },
      {
        id: 'butce_giderleri_ve_odenekler_tablosu',
        title: 'Bütçe Giderleri ve Ödenekler Tablosu',
        description: 'Bütçe giderleri, ödenek türleri ve harcama tertipleri tablosu.',
        file: 'dta-res://docs/muhasebat/butce_giderleri_ve_odenekler_tablosu.pdf'
      },
      {
        id: 'ekonomik_ve_fonksiyonel_kodlar_rehberi',
        title: 'Ekonomik ve Fonksiyonel Kodlar Rehberi',
        description:
          'Ekonomik, kurumsal ve fonksiyonel kod yapısı, alım türleri ve bütçe ödeneklerinin (Bütçe Hazırlama Rehberi 2026-2028 esaslarına göre) malzeme ve süreçlerle ilişkilendirilmesi kılavuzu.',
        file: 'economic_code_guide'
      },
      {
        id: 'dogrudan_temin_muhasebe_rehberi',
        title: 'Doğrudan Temin Muhasebe ve Ödeme Kılavuzu',
        description:
          'Mali kesintiler (Damga Vergisi, Tevkifat), ödeme emri düzenleme adımları ve kanıtlayıcı belgeler kontrol listesi.',
        file: 'dogrudan_temin_muhasebe'
      },
      {
        id: 'mahalli_idarelerde_gelir_gider_ve_butce_hesaplarinin_karsilastirilmasi',
        title: 'Mahalli İdareler Gelir Gider ve Bütçe Karşılaştırması',
        description: 'Mahalli idarelerde bütçe hesapları ve karşılaştırmalı kılavuz.',
        file: 'dta-res://docs/muhasebat/mahalli_idarelerde_gelir_gider_ve_butce_hesaplarinin_karsilastirilmasi.pdf'
      }
    ]
  }
]

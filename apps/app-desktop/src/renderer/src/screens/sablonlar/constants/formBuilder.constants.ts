import { FormFieldV2, FormFieldType, PresetController } from '../types/formBuilder.types'

export const INITIAL_FIELDS: FormFieldV2[] = [
  {
    id: 'f-1',
    label: 'Resmi Kurum Anteti & Logolar',
    variableName: 'antet_bilgisi',
    tabName: 'Genel Bilgiler',
    type: 'header',
    required: true,
    placeholder: 'T.C. İÇİŞLERİ BAKANLIĞI - Destek Hizmetleri Dairesi',
    helpText: 'Belgenin üst kısmındaki sağ-sol amblem ve resmi idare başlığı',
    category: 'header',
    headerInstitution: 'T.C. İÇİŞLERİ BAKANLIĞI',
    headerDepartment: 'Destek Hizmetleri Dairesi Başkanlığı',
    headerLeftLogo: true,
    headerRightLogo: true
  },
  {
    id: 'f-2',
    label: 'Evrak & Kayıt Bilgileri',
    variableName: 'evrak_bilgileri',
    tabName: 'Genel Bilgiler',
    type: 'text',
    required: true,
    placeholder: 'Sayı: E-74389201-934.01-1029 | Tarih: 24.09.2026',
    defaultValue: 'Sayı: E-74389201-934.01-1029 | Tarih: 24.09.2026',
    helpText: 'EBYS veya resmi desimal evrak kayıt bilgisi',
    category: 'document'
  },
  {
    id: 'f-3',
    label: 'Alım / İş Tanımı',
    variableName: 'isin_aciklamasi',
    tabName: 'Genel Bilgiler',
    type: 'text',
    required: true,
    placeholder: 'Bilgisayar ve Donanım Malzemesi Alımı İşi',
    defaultValue: 'Bilgisayar ve Donanım Malzemesi Alımı İşi',
    helpText: 'Belgede yer alan resmi iş ve talep tanımı',
    category: 'document'
  },
  {
    id: 'f-4',
    label: 'Mevzuat & Gerekçe Metni',
    variableName: 'gerekce_metni',
    tabName: 'Genel Bilgiler',
    type: 'paragraph',
    required: false,
    staticContent:
      '4734 sayılı Kamu İhale Kanununun ilgili maddesi uyarınca doğrudan temin usulüyle yapılması planlanan alım için piyasa araştırması yapılmış ve fiyat cetveli düzenlenmiştir.',
    category: 'document'
  },
  {
    id: 'f-5',
    label: 'Dinamik Hesaplama & Kalem Tablosu',
    variableName: 'kalem_ve_fiyat_tablosu',
    tabName: 'Maliyet & Teklifler',
    type: 'table',
    tableType: 'yaklasik_maliyet',
    required: true,
    helpText: 'Kalemler, miktarlar, birim fiyatlar ve toplam tutar tablosu',
    category: 'financial',
    tableRows: [
      {
        id: 'r-1',
        sira: 1,
        ad: 'Dizüstü Bilgisayar (İş İstasyonu)',
        miktar: 5,
        birim: 'Adet',
        birimFiyat: 35000,
        toplamFiyat: 175000
      },
      {
        id: 'r-2',
        sira: 2,
        ad: 'Lazer Çok Fonksiyonlu Yazıcı',
        miktar: 2,
        birim: 'Adet',
        birimFiyat: 12500,
        toplamFiyat: 25000
      },
      {
        id: 'r-3',
        sira: 3,
        ad: '27 inç 4K IPS Monitör',
        miktar: 5,
        birim: 'Adet',
        birimFiyat: 8500,
        toplamFiyat: 42500
      }
    ]
  },
  {
    id: 'f-6',
    label: 'Komisyon / Görevli Heyet İmza Bloğu',
    variableName: 'komisyon_imza_blogu',
    tabName: 'Onay & İmzalar',
    type: 'signature',
    signatureType: 'komisyon',
    required: true,
    helpText: 'Görevli heyet veya komisyon üyelerinin ad, unvan ve imza alanı',
    category: 'commission',
    signatureMembers: [
      {
        id: 'm-1',
        adSoyad: 'Ahmet YILMAZ',
        unvan: 'Bilgisayar Mühendisi',
        gorev: 'Komisyon Üyesi'
      },
      {
        id: 'm-2',
        adSoyad: 'Mehmet DEMİR',
        unvan: 'V.H.K.İ.',
        gorev: 'Komisyon Üyesi'
      },
      {
        id: 'm-3',
        adSoyad: 'Ayşe KAYA',
        unvan: 'Tekniker',
        gorev: 'Komisyon Üyesi'
      }
    ]
  },
  {
    id: 'f-7',
    label: 'Makam / Yetkili Onay Bloğu',
    variableName: 'yetkili_onay_blogu',
    tabName: 'Onay & İmzalar',
    type: 'signature',
    signatureType: 'olur',
    required: true,
    helpText: 'Yetkili makamın O L U R onay kutusu ve resmi imzası',
    category: 'commission',
    signatureMembers: [
      {
        id: 'm-olur',
        adSoyad: 'Mustafa ÖZTÜRK',
        unvan: 'Daire Başkanı',
        gorev: 'Yetkili Makam'
      }
    ]
  }
]

export const TYPE_LABELS: Record<FormFieldType, string> = {
  header: 'Kurum Antet & Logo Bloğu',
  paragraph: 'Metin & Paragraf Bloğu',
  text: 'Tek Satır Metin Alanı',
  textarea: 'Geniş Metin & Açıklama',
  number: 'Sayısal Değer Alanı',
  money: 'Para Tutarı (₺) Alanı',
  date: 'Resmi Tarih Alanı',
  select: 'Seçim Listesi',
  checkbox: 'Onay Kutusu',
  table: 'Dinamik Tablo Bloğu',
  signature: 'İmza & Onay Bloğu',
  divider: 'Sayfa Bölücü Çizgi',
  custom: 'Özel Kullanıcı Bileşeni'
}

export const PRESET_CONTROLLERS: PresetController[] = [
  {
    id: 'preset-antet',
    name: 'Resmi Kurum Antet & Logo Bloğu',
    category: 'header',
    description: 'Sol/Sağ amblem ve çok satırlı kurum başlığı',
    defaultField: {
      label: 'Resmi Kurum Anteti',
      variableName: 'kurum_anteti',
      type: 'header',
      required: true,
      category: 'header',
      headerInstitution: 'T.C. İÇİŞLERİ BAKANLIĞI',
      headerDepartment: 'Destek Hizmetleri Dairesi Başkanlığı',
      headerLeftLogo: true,
      headerRightLogo: true
    }
  },
  {
    id: 'preset-yetkili-onay',
    name: 'Yetkili Makam Onay Bloğu (OLUR)',
    category: 'commission',
    description: 'Tekli makam onay ve imza yetkili alanı',
    defaultField: {
      label: 'Yetkili Makam Onayı',
      variableName: 'yetkili_onay',
      type: 'signature',
      signatureType: 'olur',
      required: true,
      category: 'commission',
      signatureMembers: [
        {
          id: 'm-olur',
          adSoyad: 'Mustafa ÖZTÜRK',
          unvan: 'Daire Başkanı',
          gorev: 'Yetkili Makam'
        }
      ]
    }
  },
  {
    id: 'preset-komisyon-heyet',
    name: 'Komisyon & Heyet İmza Bloğu',
    category: 'commission',
    description: 'Çoklu görevli personelin yan yana imza bloğu',
    defaultField: {
      label: 'Komisyon İmza Bloğu',
      variableName: 'komisyon_imzalari',
      type: 'signature',
      signatureType: 'komisyon',
      required: true,
      category: 'commission',
      signatureMembers: [
        {
          id: 'm-1',
          adSoyad: 'Ahmet YILMAZ',
          unvan: 'Mühendis',
          gorev: 'Üye'
        },
        {
          id: 'm-2',
          adSoyad: 'Mehmet DEMİR',
          unvan: 'V.H.K.İ.',
          gorev: 'Üye'
        }
      ]
    }
  },
  {
    id: 'preset-dinamik-tablo',
    name: 'Dinamik Veri & Hesap Tablosu',
    category: 'financial',
    description: 'Kalemler, miktarlar, birim fiyatlar ve toplam tutar matrisi',
    defaultField: {
      label: 'Dinamik Hesaplama Tablosu',
      variableName: 'hesaplama_tablosu',
      type: 'table',
      tableType: 'yaklasik_maliyet',
      required: true,
      category: 'financial',
      tableRows: [
        {
          id: 'r-1',
          sira: 1,
          ad: 'Örnek Malzeme / Hizmet Kalemi',
          miktar: 10,
          birim: 'Adet',
          birimFiyat: 1500,
          toplamFiyat: 15000
        }
      ]
    }
  },
  {
    id: 'preset-metin-gerekce',
    name: 'Yasal Metin & Paragraf Bloğu',
    category: 'document',
    description: 'Kanun maddeleri, açıklamalar veya gerekçe metinleri',
    defaultField: {
      label: 'Yasal Dayanak & Gerekçe',
      variableName: 'yasal_gerekce_metni',
      type: 'paragraph',
      staticContent:
        'Yukarıda nitelik ve miktarı belirtilen alım için mevzuatın ilgili maddesi gereğince işlem yapılmış olup onayınıza arz olunur.',
      required: false,
      category: 'document'
    }
  }
]

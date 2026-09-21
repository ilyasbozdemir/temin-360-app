import { FormFieldV2, PresetController } from '../types/formBuilder.types'

export const INITIAL_FIELDS: FormFieldV2[] = [
  {
    id: 'f-1',
    label: 'Kurum / İdare Antet Bilgisi',
    variableName: 'antet_bilgisi',
    type: 'text',
    required: true,
    placeholder: 'Örn: T.C. İÇİŞLERİ BAKANLIĞI - Destek Hizmetleri Dairesi',
    helpText: 'Resmi belgenin üst kısmındaki idare amblemi ve antet başlığı',
    category: 'header'
  },
  {
    id: 'f-2',
    label: 'Evrak Kayıt Sayı / Kod No',
    variableName: 'evrak_sayisi',
    type: 'text',
    required: true,
    placeholder: 'Örn: E-74389201-934.01-1029',
    helpText: 'EBYS veya Desimal kayıt numarası',
    category: 'document'
  },
  {
    id: 'f-3',
    label: 'Alım / İş Konusu',
    variableName: 'isin_aciklamasi',
    type: 'text',
    required: true,
    placeholder: 'Örn: Bilgisayar ve Donanım Malzemesi Alımı İşi',
    helpText: 'Onay ve teklif mektuplarında gözükecek ana iş konusu',
    category: 'document'
  },
  {
    id: 'f-4',
    label: 'Muhatap / Teklif Veren Firma',
    variableName: 'muhatap_firma',
    type: 'text',
    required: false,
    placeholder: 'Örn: ABC Teknoloji Ltd. Şti.',
    helpText: 'Fiyat araştırma ve teklif mektubunun hitap edeceği firma',
    category: 'document'
  },
  {
    id: 'f-5',
    label: 'Tahmini Yaklaşık Maliyet',
    variableName: 'yaklasik_maliyet',
    type: 'money',
    required: true,
    placeholder: '0,00 ₺',
    category: 'financial'
  },
  {
    id: 'f-6',
    label: 'Alım Türü (Mevzuat)',
    variableName: 'alim_turu',
    type: 'select',
    required: true,
    options: ['Mal Alımı (4734 22/d)', 'Hizmet Alımı (4734 22/d)', 'Yapım İşi (4734 22/d)', 'Danışmanlık Alımı'],
    category: 'document'
  },
  {
    id: 'f-7',
    label: 'İhtiyaç Kalemleri Cetveli',
    variableName: 'kalemler_tablosu',
    type: 'table',
    required: true,
    helpText: 'Sıra no, malzeme adı, miktar, birim ve teklif tutarlarını içeren tablo',
    category: 'financial'
  },
  {
    id: 'f-8',
    label: 'Harcama Yetkilisi & Komisyon İmza Bloğu',
    variableName: 'komisyon_listesi',
    type: 'signature',
    required: true,
    helpText: 'Resmi onay yetkilileri, piyasa araştırma görevlileri ve imza alanları',
    category: 'commission'
  }
]

export const TYPE_LABELS: Record<FormFieldV2['type'], string> = {
  text: 'Tek Satır Metin',
  textarea: 'Açıklama / Paragraf',
  number: 'Sayısal Değer',
  money: 'Tutar (₺)',
  date: 'Tarih Seçici',
  select: 'Seçim Kutusu',
  checkbox: 'Onay Kutusu',
  table: 'Dinamik Tablo',
  signature: 'İmza Bloğu'
}

export const PRESET_CONTROLLERS: PresetController[] = [
  {
    id: 'ctrl-antet',
    name: 'İdare Antet Bilgisi',
    category: 'header',
    description: 'Resmi onay evraklarının başında yer alan Kurum / İdare ve Birim başlığı',
    defaultField: {
      label: 'İdare / Birim Antet Başlığı',
      variableName: 'antet_bilgisi',
      type: 'text',
      required: true,
      placeholder: 'T.C. ... BAKANLIĞI / BELEDİYESİ',
      category: 'header'
    }
  },
  {
    id: 'ctrl-evrak',
    name: 'Evrak Sayı / Desimal Kodu',
    category: 'document',
    description: 'Resmi yazışma desimal kayıt numarası ve tarih alanı',
    defaultField: {
      label: 'Evrak Kayıt / Sayı No',
      variableName: 'evrak_sayisi',
      type: 'text',
      required: true,
      placeholder: 'E-00000000-000.00-000',
      category: 'document'
    }
  },
  {
    id: 'ctrl-muhatap',
    name: 'Muhatap Firma / İstekli Bilgisi',
    category: 'document',
    description: 'Fiyat teklif isteme mektubunda teklif istenen firma unvanı ve adresi',
    defaultField: {
      label: 'Muhatap Firma Unvanı',
      variableName: 'muhatap_firma',
      type: 'text',
      required: true,
      placeholder: 'Firma Unvanı / İlgili Makama',
      category: 'document'
    }
  },
  {
    id: 'ctrl-konu',
    name: 'İşin Konusu / İhale Başlığı',
    category: 'document',
    description: 'Doğrudan temin alımına konu olan Mal/Hizmet/Yapım iş tanımı',
    defaultField: {
      label: 'İşin Konusu / Alım Amacı',
      variableName: 'isin_aciklamasi',
      type: 'textarea',
      required: true,
      placeholder: 'Alımı yapılacak malzeme veya işin detaylı açıklaması...',
      category: 'document'
    }
  },
  {
    id: 'ctrl-maliyet',
    name: 'Yaklaşık Maliyet (₺)',
    category: 'financial',
    description: 'Alımın tahmini tutarı, KDV hariç yaklaşık maliyet cetveli',
    defaultField: {
      label: 'Tahmini Yaklaşık Maliyet',
      variableName: 'yaklasik_maliyet',
      type: 'money',
      required: true,
      placeholder: '0,00 ₺',
      category: 'financial'
    }
  },
  {
    id: 'ctrl-tablo',
    name: 'Malzeme / Kalem Cetveli',
    category: 'financial',
    description: 'Sıra No, Malzeme Adı, Miktar, Birim, Birim Fiyat ve Toplam Fiyat Tablosu',
    defaultField: {
      label: 'İhtiyaç Kalemleri ve Miktar Tablosu',
      variableName: 'kalemler_tablosu',
      type: 'table',
      required: true,
      helpText: 'Dinamik malzeme ve miktar cetveli',
      category: 'financial'
    }
  },
  {
    id: 'ctrl-imza',
    name: 'İmza & Komisyon Bloğu',
    category: 'commission',
    description: 'Harcama Yetkilisi, Gerçekleştirme Görevlisi ve Piyasa Araştırma Üyeleri İmza Bloğu',
    defaultField: {
      label: 'Onay Yetkilileri ve İmza Bloğu',
      variableName: 'komisyon_listesi',
      type: 'signature',
      required: true,
      helpText: 'Harcama Yetkilisi Oluru ve Piyasa Araştırma Üyeleri',
      category: 'commission'
    }
  },
  {
    id: 'ctrl-sartlar',
    name: 'Teslimat & Ödeme Şartları',
    category: 'terms',
    description: 'Teslim süresi, garanti süresi, nakliye ve ödeme yeri özel şartları',
    defaultField: {
      label: 'Teslimat ve Ödeme Şartları',
      variableName: 'teslimat_sartlari',
      type: 'textarea',
      required: false,
      placeholder: 'Malzemeler ... gün içerisinde muayene kabul komisyonuna teslim edilecektir.',
      category: 'terms'
    }
  }
]

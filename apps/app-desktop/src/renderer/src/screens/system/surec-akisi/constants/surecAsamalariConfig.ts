import { Belge, Stage } from '../types'
import { TEMPLATE_REGISTRY } from '@temin360/document-templates'
import { SABLON_KATEGORILERI } from '../../../../constants/sablonKategorileri'

export interface SurecStageDefinition {
  id: number
  key: string
  title: string
  kategoriId: string
  routePath: string
  tabKey: string
  description: string
  tasks: Array<{
    name: string
    tab: string
    checkDone?: (context: {
      kalemler: any[]
      firmalar: any[]
      komisyonlar: any[]
      activeDosya: any
      dosyaContext: any
    }) => boolean
  }>
  defaultDocs: Array<{
    kod: string
    ad: string
  }>
}

export const SUREC_STAGE_DEFINITIONS: SurecStageDefinition[] = [
  {
    id: 1,
    key: 'ihtiyac-tespiti',
    title: 'İhtiyaç Tespiti & Başlangıç',
    kategoriId: '1-ihtiyac-tespiti-ve-baslangic',
    routePath: '/dosya/hazirlik-ve-ihtiyac',
    tabKey: 'malzeme',
    description: 'Mal ve hizmet kalemlerinin tespiti, teknik kriterler ve başlangıç onayları',
    tasks: [
      {
        name: 'Malzeme / İhtiyaç Kalemlerini Ekle',
        tab: 'malzeme',
        checkDone: ({ kalemler }) => kalemler.length > 0
      },
      {
        name: 'İhtiyaç Talep Formu / Lüzum Müzekkeresi',
        tab: 'belgeler',
        checkDone: ({ kalemler }) => kalemler.length > 0
      },
      {
        name: 'Komisyon / Görevlendirme Tanımla',
        tab: 'komisyon',
        checkDone: ({ komisyonlar }) => komisyonlar.length > 0
      }
    ],
    defaultDocs: [
      { kod: 'ihtiyac-talep-formu', ad: 'İhtiyaç Talep Formu' },
      { kod: 'ihtiyac-listesi', ad: 'İhtiyaç Listesi' },
      { kod: 'luzum-muzekkeresi', ad: 'Lüzum Müzekkeresi' },
      { kod: 'komisyon-gorevlendirme-onayi', ad: 'Komisyon Görevlendirme Yazısı' },
      { kod: 'tasinir-kayit-yetkilisi-gorusu', ad: 'Taşınır Kayıt Yetkilisi Görüşü' }
    ]
  },
  {
    id: 2,
    key: 'piyasa-arastirmasi',
    title: 'Piyasa Fiyat Araştırması',
    kategoriId: '2-piyasa-fiyat-arastirmasi',
    routePath: '/dosya/piyasa-fiyat-arastirmasi',
    tabKey: 'firmalar',
    description: 'İstekli tedarikçilerden fiyat tekliflerinin toplanması ve karşılaştırılması',
    tasks: [
      {
        name: 'İstekli Tedarikçi Firmaları Belirle',
        tab: 'firmalar',
        checkDone: ({ firmalar }) => firmalar.length > 0
      },
      {
        name: 'Fiyat Teklif Mektuplarını Gönder',
        tab: 'belgeler',
        checkDone: ({ firmalar }) => firmalar.length > 0
      },
      {
        name: 'Teklif Fiyatlarını Kaydet',
        tab: 'firmalar',
        checkDone: ({ firmalar }) =>
          firmalar.some((f) => f.durumu === 'teklif' || f.durumu === 'seçildi' || f.teklifBedeli)
      },
      {
        name: 'Piyasa Araştırma Tutanağını Tamamla',
        tab: 'belgeler',
        checkDone: ({ firmalar }) => firmalar.some((f) => f.durumu === 'seçildi' || f.isKazanan)
      }
    ],
    defaultDocs: [
      { kod: 'piyasa-fiyat-arastirma-tutanagi', ad: 'Piyasa Araştırması Tutanağı' },
      { kod: 'birim-fiyat-teklif-mektubu', ad: 'Fiyat Araştırma Mektubu' },
      { kod: 'yaklasik-maliyet-cetveli', ad: 'Yaklaşık Maliyet Cetveli' }
    ]
  },
  {
    id: 3,
    key: 'onay-ve-sozlesme',
    title: 'Onay Süreci & Sipariş',
    kategoriId: '3-siparis-ve-sozlesme',
    routePath: '/dosya/siparis-ve-sozlesme',
    tabKey: 'belgeler',
    description: 'Harcama yetkilisi onayı, kazanan firmaya sipariş ve sözleşme işlemleri',
    tasks: [
      {
        name: 'Doğrudan Temin Onay Belgesi Al',
        tab: 'belgeler',
        checkDone: ({ activeDosya }) => Boolean(activeDosya?.onay_tarihi || activeDosya?.karar_no)
      },
      {
        name: 'Sipariş Mektubu / Sözleşmeye Davet Gönder',
        tab: 'belgeler',
        checkDone: ({ firmalar }) => firmalar.some((f) => f.durumu === 'seçildi' || f.isKazanan)
      },
      {
        name: 'Doğrudan Temin Sözleşmesi / Taahhüt',
        tab: 'belgeler',
        checkDone: ({ activeDosya }) => Boolean(activeDosya?.sozlesme_tarihi || activeDosya?.sozlesme_bedeli)
      }
    ],
    defaultDocs: [
      { kod: 'dogrudan-temin-onay-belgesi', ad: 'Doğrudan Temin Onay Belgesi' },
      { kod: 'sozlesmeye-davet', ad: 'Sipariş Mektubu' },
      { kod: 'dogrudan-temin-sozlesmesi', ad: 'Doğrudan Temin Sözleşmesi' }
    ]
  },
  {
    id: 4,
    key: 'teslim-ve-kabul',
    title: 'Teslim ve Muayene Kabul',
    kategoriId: '4-kabul-ve-odeme-islemleri',
    routePath: '/dosya/kabul-ve-odeme',
    tabKey: 'komisyon',
    description: 'Mal ve hizmetlerin teslim alınması, muayene kabul komisyon incelemesi',
    tasks: [
      {
        name: 'Muayene Kabul Komisyonu İncelemesi',
        tab: 'komisyon',
        checkDone: ({ komisyonlar }) =>
          komisyonlar.some((k) => k.tur.toLowerCase().includes('muayene') || k.tur.toLowerCase().includes('kabul'))
      },
      {
        name: 'Muayene Kabul Tutanağını Düzenle',
        tab: 'belgeler',
        checkDone: ({ activeDosya }) => Boolean(activeDosya?.muayene_kabul_tarihi)
      },
      {
        name: 'Taşınır İşlem Fişi (TİF) / Ambar Girişi',
        tab: 'belgeler',
        checkDone: ({ activeDosya }) => Boolean(activeDosya?.tif_no || activeDosya?.fatura_no)
      }
    ],
    defaultDocs: [
      { kod: 'muayene-kabul-tutanagi', ad: 'Muayene Kabul Tutanağı' },
      { kod: 'muayene-kabul-komisyonu', ad: 'Muayene Kabul Komisyonu' },
      { kod: 'tasinir-kayit-yetkilisi-gorusu', ad: 'Taşınır İşlem Fişi' }
    ]
  },
  {
    id: 5,
    key: 'odeme-ve-muhasebe',
    title: 'Ödeme ve Muhasebe',
    kategoriId: '4-kabul-ve-odeme-islemleri',
    routePath: '/dosya/kabul-ve-odeme',
    tabKey: 'belgeler',
    description: 'Fatura tahakkuku, ödeme emri belgesi ve muhasebe yetkilisine intikal',
    tasks: [
      {
        name: 'Fatura ve Hakediş Kontrolü',
        tab: 'belgeler',
        checkDone: ({ activeDosya }) => Boolean(activeDosya?.fatura_no || activeDosya?.fatura_tutari)
      },
      {
        name: 'Ödeme Yazısı / Harcama Pusulası Hazırla',
        tab: 'belgeler',
        checkDone: ({ activeDosya }) => Boolean(activeDosya?.odeme_tarihi || activeDosya?.fatura_no)
      },
      {
        name: 'Ödeme Emri Belgesi ve Muhasebe Kaydı',
        tab: 'belgeler',
        checkDone: ({ activeDosya }) => Boolean(activeDosya?.odeme_emri_no)
      }
    ],
    defaultDocs: [
      { kod: 'odeme-yazisi', ad: 'Ödeme Emri Belgesi' },
      { kod: 'harcama-pusulasi', ad: 'Harcama Pusulası' }
    ]
  }
]

export function buildInitialSurecStages(context: {
  kalemler: any[]
  firmalar: any[]
  komisyonlar: any[]
  activeDosya: any
  dosyaContext: any
}): Stage[] {
  return SUREC_STAGE_DEFINITIONS.map((def) => ({
    id: def.id,
    title: def.title,
    tasks: def.tasks.map((t) => ({
      name: t.name,
      tab: t.tab,
      done: t.checkDone ? t.checkDone(context) : false
    }))
  }))
}

export function buildInitialSurecBelgeler(): Belge[] {
  let idCounter = 1
  const belgeler: Belge[] = []

  SUREC_STAGE_DEFINITIONS.forEach((stage) => {
    stage.defaultDocs.forEach((doc) => {
      belgeler.push({
        id: idCounter++,
        ad: doc.ad,
        asama: stage.title,
        kod: doc.kod,
        durum: 'oluşturulmadı'
      })
    })
  })

  return belgeler
}

export { TEMPLATE_REGISTRY, SABLON_KATEGORILERI }

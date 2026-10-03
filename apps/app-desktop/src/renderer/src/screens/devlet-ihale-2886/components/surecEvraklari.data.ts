import { SurecEvrakiItem } from '../types/devletIhale2886.types'

export const DEFAULT_2886_EVRAKLAR: SurecEvrakiItem[] = [
  // 1. Başlangıç ve Yetki
  {
    id: '1',
    ad: 'Başkanlık Oluru / İhale Başlatma Onay Belgesi',
    kod: '2886-EVR-01',
    asama: 'baslangic',
    zorunluMu: true,
    durum: 'onaylandi',
    tarih: '2026-03-01',
    sayiNo: 'E-2026/104'
  },
  {
    id: '2',
    ad: 'Belediye Encümeni Satış / Kiralama Yetki Kararı',
    kod: '2886-EVR-02',
    asama: 'baslangic',
    zorunluMu: true,
    durum: 'onaylandi',
    tarih: '2026-03-05',
    sayiNo: 'Karar No: 2026/112'
  },
  // 2. Kıymet Takdiri
  {
    id: '3',
    ad: 'Kıymet Takdir Komisyonu Görevlendirme Yazısı',
    kod: '2886-EVR-03',
    asama: 'kiymet_takdir',
    zorunluMu: true,
    durum: 'onaylandi',
    tarih: '2026-03-08'
  },
  {
    id: '4',
    ad: 'Emsal Fiyat Araştırma Yazıları (Oda / Muhtarlık vb.)',
    kod: '2886-EVR-04',
    asama: 'kiymet_takdir',
    zorunluMu: true,
    durum: 'onaylandi',
    tarih: '2026-03-12'
  },
  {
    id: '5',
    ad: 'Kıymet Takdir Komisyonu Kararı & Muhammen Bedel Cetveli',
    kod: '2886-EVR-05',
    asama: 'kiymet_takdir',
    zorunluMu: true,
    durum: 'onaylandi',
    tarih: '2026-03-15',
    sayiNo: '2026/08-KT'
  },
  // 3. Şartname ve İlan
  {
    id: '6',
    ad: 'İdari Şartname ve Tip Sözleşme Taslağı (Genel & Özel Şartlar)',
    kod: '2886-EVR-06',
    asama: 'sartname_ve_ilan',
    zorunluMu: true,
    durum: 'onaylandi',
    tarih: '2026-03-18'
  },
  {
    id: '7',
    ad: 'Encümen İhale Kararı (İlan Onayı ve Tarih Tespiti)',
    kod: '2886-EVR-07',
    asama: 'sartname_ve_ilan',
    zorunluMu: true,
    durum: 'onaylandi',
    tarih: '2026-03-20',
    sayiNo: 'Karar No: 2026/135'
  },
  {
    id: '8',
    ad: 'Belediye / Kaymakamlık / Web İlan Metinleri',
    kod: '2886-EVR-08',
    asama: 'sartname_ve_ilan',
    zorunluMu: true,
    durum: 'onaylandi',
    tarih: '2026-03-22'
  },
  {
    id: '9',
    ad: 'Askıya Çıkarma ve Askıdan İndirme Tutanakları',
    kod: '2886-EVR-09',
    asama: 'sartname_ve_ilan',
    zorunluMu: true,
    durum: 'taslak'
  },
  // 4. İhale Günü
  {
    id: '10',
    ad: 'Şartname Satın Alma / Alınma Belgesi Kaydı',
    kod: '2886-EVR-10',
    asama: 'ihale_gunu',
    zorunluMu: true,
    durum: 'taslak'
  },
  {
    id: '11',
    ad: 'İhale Cetveli (Açık Artırma & Teklif Zarfı Açma Tutanağı)',
    kod: '2886-EVR-11',
    asama: 'ihale_gunu',
    zorunluMu: true,
    durum: 'taslak'
  },
  {
    id: '12',
    ad: 'İhale Komisyonu (Encümen) İhale Kararı',
    kod: '2886-EVR-12',
    asama: 'ihale_gunu',
    zorunluMu: true,
    durum: 'taslak'
  },
  // 5. Onay ve Sözleşme
  {
    id: '13',
    ad: 'İta Amiri (Belediye Başkanı) İhale Onay Belgesi',
    kod: '2886-EVR-13',
    asama: 'onay_ve_sozlesme',
    zorunluMu: true,
    durum: 'hazirlanmadi'
  },
  {
    id: '14',
    ad: 'Kesinleşen İhale Kararı Tebligat Yazısı',
    kod: '2886-EVR-14',
    asama: 'onay_ve_sozlesme',
    zorunluMu: true,
    durum: 'hazirlanmadi'
  },
  {
    id: '15',
    ad: 'Taşınmaz Satış / Kira Sözleşmesi & Ödeme Planı',
    kod: '2886-EVR-15',
    asama: 'onay_ve_sozlesme',
    zorunluMu: true,
    durum: 'hazirlanmadi'
  },
  {
    id: '16',
    ad: 'Taşınmaz / İşyeri Yer Teslim Tutanağı',
    kod: '2886-EVR-16',
    asama: 'onay_ve_sozlesme',
    zorunluMu: true,
    durum: 'hazirlanmadi'
  }
]

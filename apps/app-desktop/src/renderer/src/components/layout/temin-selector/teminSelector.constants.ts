import { Dosya2886Item } from './teminSelector.types'

export const DEFAULT_2886_DOSYALAR: Dosya2886Item[] = [
  {
    id: '2886-SATIS-2026-01',
    islemTuru: 'satis',
    usul: 'acik_teklif_45',
    ihaleAdi: 'Merkez Mah. 104 Ada 12 Parsel 1.450 m² Ticari İmarlı Arsa Satışı İhalesi',
    ihaleKayitNo: '2026/2886-ST-01',
    ihaleTarihi: '2026-10-15',
    ihaleSaati: '14:30',
    ihaleYeri: 'Belediye Encümen Toplantı Salonu',
    tasinmaz: {
      il: 'Ankara',
      ilce: 'Çankaya',
      mahalleKoy: 'Çukurambar Mahallesi',
      ada: '104',
      parsel: '12',
      yuzolcumuM2: 1450,
      cinsi: 'Ticaret + Konut İmarlı Arsa',
      hisseOrani: '1/1',
      mevcutDurumu: 'Boş / Teslime Hazır',
      adres: 'Öğretmenler Caddesi No: 45 Çankaya / Ankara'
    },
    muhammenBedel: {
      hesaplananBedel: 4500000,
      takdirEdilenMuhammenBedel: 4500000,
      geciciTeminatTutari: 135000,
      kdvOrani: 0
    }
  },
  {
    id: '2886-KIRA-2026-02',
    islemTuru: 'kiralama',
    usul: 'acik_teklif_45',
    ihaleAdi: 'Atatürk Parkı İçi Sosyal Tesis ve Kafeterya Alanı 3 Yıllık Kiralanması',
    ihaleKayitNo: '2026/2886-KR-02',
    ihaleTarihi: '2026-10-22',
    ihaleSaati: '10:00',
    ihaleYeri: 'Belediye Encümen Toplantı Salonu',
    tasinmaz: {
      il: 'İstanbul',
      ilce: 'Kadıköy',
      mahalleKoy: 'Fenerbahçe Mahallesi',
      ada: '88',
      parsel: '4',
      yuzolcumuM2: 350,
      cinsi: 'Sosyal Tesis / Kafeterya',
      hisseOrani: '1/1',
      mevcutDurumu: 'Kirada',
      adres: 'Fenerbahçe Parkı İçi Tesisler Kadıköy / İstanbul'
    },
    muhammenBedel: {
      hesaplananBedel: 180000,
      takdirEdilenMuhammenBedel: 180000,
      geciciTeminatTutari: 16200,
      kdvOrani: 20
    }
  },
  {
    id: '2886-SATIS-2026-03',
    islemTuru: 'satis',
    usul: 'acik_teklif_45',
    ihaleAdi: 'Ekonomik Ömrünü Tamamlamış 5 Adet Hizmet Aracı ve İş Makinesi Satış İhalesi',
    ihaleKayitNo: '2026/2886-MS-03',
    ihaleTarihi: '2026-10-28',
    ihaleSaati: '11:30',
    ihaleYeri: 'Belediye Encümen Toplantı Salonu',
    tasinmaz: {
      il: 'İzmir',
      ilce: 'Bornova',
      mahalleKoy: 'Sanayi Mahallesi',
      ada: '0',
      parsel: '0',
      yuzolcumuM2: 0,
      cinsi: 'Menkul Mal / 5 Adet Taşıt ve İş Makinesi',
      hisseOrani: '1/1',
      mevcutDurumu: 'Kademe Parkında',
      adres: 'Fen İşleri Makine İkmal Sahası Bornova / İzmir'
    },
    muhammenBedel: {
      hesaplananBedel: 1850000,
      takdirEdilenMuhammenBedel: 1850000,
      geciciTeminatTutari: 55500,
      kdvOrani: 1
    }
  },
  {
    id: '2886-HAK-2026-04',
    islemTuru: 'irtifak_hakki',
    usul: 'kapali_teklif_36',
    ihaleAdi:
      'Kent Meydanı Otopark ve Elektrikli Şarj İstasyonu 10 Yıllık Sınırlı Ayni Hak Tesis İhalesi',
    ihaleKayitNo: '2026/2886-HT-04',
    ihaleTarihi: '2026-11-05',
    ihaleSaati: '15:00',
    ihaleYeri: 'Belediye Encümen Toplantı Salonu',
    tasinmaz: {
      il: 'Bursa',
      ilce: 'Nilüfer',
      mahalleKoy: 'Cumhuriyet Mahallesi',
      ada: '152',
      parsel: '8',
      yuzolcumuM2: 2200,
      cinsi: 'Meydan Altı Kapalı Otopark Alanı',
      hisseOrani: '1/1',
      mevcutDurumu: 'Mevcut Tesis',
      adres: 'FSM Bulvarı Kent Meydanı Altı Nilüfer / Bursa'
    },
    muhammenBedel: {
      hesaplananBedel: 3600000,
      takdirEdilenMuhammenBedel: 3600000,
      geciciTeminatTutari: 108000,
      kdvOrani: 20
    }
  }
]

export const TUR_LABEL: Record<string, string> = {
  mal: 'Mal Alımı',
  hizmet: 'Hizmet',
  yapim_isi: 'Yapım İşi',
  danismanlik: 'Danışmanlık',
  hakedis: 'Hakediş',
  ihale: 'İhale'
}

export const TUR_COLOR: Record<string, string> = {
  mal: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  hizmet:
    'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  yapim_isi:
    'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  danismanlik:
    'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300 border-pink-200 dark:border-pink-800',
  hakedis:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  ihale:
    'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
}

export interface PozItem {
  id?: number | string
  poz_no: string
  kalem_adi: string
  poz_tanimi?: string
  birim: string
  yapi_sinifi?: string
  okas_kodu?: string
  poz_yili?: number
  fiyat_donemi?: string
  poz_kurumu?: string
  ozelligi?: string
}

export const POZ_KURUMLARI = [
  { id: 'ALL', name: 'Tüm Kurumlar', badge: 'Tümü' },
  { id: 'ÇŞB', name: 'Çevre, Şehircilik ve İklim Değ. Bak. (ÇŞB)', badge: 'ÇŞB' },
  { id: 'KGM', name: 'Karayolları Genel Müdürlüğü (KGM)', badge: 'KGM' },
  { id: 'DSİ', name: 'Devlet Su İşleri Genel Müd. (DSİ)', badge: 'DSİ' },
  { id: 'İLBANK', name: 'İller Bankası A.Ş. (İLBANK)', badge: 'İLBANK' },
  { id: 'VGM', name: 'Vakıflar Genel Müdürlüğü (VGM)', badge: 'VGM' },
  { id: 'KTB', name: 'Kültür ve Turizm Bakanlığı (KTB)', badge: 'KTB' },
  { id: 'TEDAŞ', name: 'Türkiye Elektrik Dağıtım A.Ş. (TEDAŞ)', badge: 'TEDAŞ' },
  { id: 'TEİAŞ', name: 'Türkiye Elektrik İletim A.Ş. (TEİAŞ)', badge: 'TEİAŞ' },
  { id: 'UAB', name: 'Ulaştırma ve Altyapı Bak. (DLH / Demiryolu)', badge: 'UAB' },
  { id: 'MSB', name: 'Milli Savunma Bakanlığı (MSB / ASFAT)', badge: 'MSB' },
  { id: 'TCDD', name: 'T.C. Devlet Demiryolları (TCDD)', badge: 'TCDD' },
  { id: 'ÖZEL', name: 'Özel Poz / Analizli İdare Pozu', badge: 'ÖZEL POZ' }
]

/**
 * Seçilen veya aktif çalışma yılına göre dinamik fiyat araştırma dönem listesi üretir
 */
export const getDinamikFiyatDonemleri = (yil?: number) => {
  const currentYear = yil || new Date().getFullYear()
  return [
    { kod: `${currentYear}/1`, etiket: `${currentYear} Yılı 1. Dönem Fiyat Araştırması (Ocak-Haziran)` },
    { kod: `${currentYear}/2`, etiket: `${currentYear} Yılı 2. Dönem Fiyat Araştırması (Temmuz-Aralık)` },
    { kod: `${currentYear}/3`, etiket: `${currentYear} Yılı 3. Dönem / Ek Bülten` },
    { kod: `${currentYear - 1}/2`, etiket: `${currentYear - 1} Yılı 2. Dönem Fiyat Araştırması` },
    { kod: `${currentYear - 1}/1`, etiket: `${currentYear - 1} Yılı 1. Dönem Fiyat Araştırması` },
    { kod: `${currentYear}/ÖZEL`, etiket: `${currentYear} Yılı Özel Piyasa Rayici / Analiz Dönemi` }
  ]
}

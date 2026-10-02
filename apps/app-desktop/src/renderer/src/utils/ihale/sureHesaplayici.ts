/**
 * TEMİN 360 - İHALE VE YASAL SÜRE HESAPLAYICI (RESMİ TATİL & İŞ GÜNÜ MOTORU)
 *
 * 1. Türkiye Resmi Tatil ve Ulusal Bayram Takvimi (2024 - 2027)
 * 2. Hafta Sonu ve Resmi Tatil Atlayarak İş Günü Hesaplayıcı
 * 3. 4734 ve 2886 Yasal Süre Motoru:
 *    - İtiraz ve Şikayet Süresi (10 Takvim Günü - Son gün tatile gelirse ilk iş gününe uzar)
 *    - Sözleşme İmza Davet Süresi (10 Gün)
 *    - Bilgi Edinme Başvuru Süresi (15 İş Günü)
 *    - İlan Askı Süresi
 *    - Muayene ve Kabul Süresi
 */

/**
 * Sabit ve Değişken Türkiye Resmi Tatilleri (YYYY-MM-DD Formatında)
 */
export const TURKIYE_RESMI_TATILLER: Set<string> = new Set([
  // 2024
  '2024-01-01', // Yılbaşı
  '2024-04-09',
  '2024-04-10',
  '2024-04-11',
  '2024-04-12', // Ramazan Bayramı
  '2024-04-23', // Ulusal Egemenlik ve Çocuk Bayramı
  '2024-05-01', // Emek ve Dayanışma Günü
  '2024-05-19', // Atatürk'ü Anma, Gençlik ve Spor Bayramı
  '2024-06-15',
  '2024-06-16',
  '2024-06-17',
  '2024-06-18',
  '2024-06-19', // Kurban Bayramı
  '2024-07-15', // Demokrasi ve Milli Birlik Günü
  '2024-08-30', // Zafer Bayramı
  '2024-10-28',
  '2024-10-29', // Cumhuriyet Bayramı

  // 2025
  '2025-01-01',
  '2025-03-29',
  '2025-03-30',
  '2025-03-31',
  '2025-04-01', // Ramazan Bayramı
  '2025-04-23',
  '2025-05-01',
  '2025-05-19',
  '2025-06-05',
  '2025-06-06',
  '2025-06-07',
  '2025-06-08',
  '2025-06-09', // Kurban Bayramı
  '2025-07-15',
  '2025-08-30',
  '2025-10-28',
  '2025-10-29',

  // 2026
  '2026-01-01',
  '2026-03-19',
  '2026-03-20',
  '2026-03-21',
  '2026-03-22', // Ramazan Bayramı
  '2026-04-23',
  '2026-05-01',
  '2026-05-19',
  '2026-05-26',
  '2026-05-27',
  '2026-05-28',
  '2026-05-29',
  '2026-05-30', // Kurban Bayramı
  '2026-07-15',
  '2026-08-30',
  '2026-10-28',
  '2026-10-29',

  // 2027
  '2027-01-01',
  '2027-03-09',
  '2027-03-10',
  '2027-03-11',
  '2027-03-12', // Ramazan Bayramı
  '2027-04-23',
  '2027-05-01',
  '2027-05-16',
  '2027-05-17',
  '2027-05-18',
  '2027-05-19', // Kurban Bayramı & 19 Mayıs
  '2027-07-15',
  '2027-08-30',
  '2027-10-28',
  '2027-10-29'
])

/**
 * Verilen tarihin resmi tatil veya hafta sonu olup olmadığını kontrol eder.
 */
export function isResmiTatilVeyaHaftasonu(date: Date): { isHoliday: boolean; reason?: string } {
  const dayOfWeek = date.getDay() // 0: Pazar, 6: Cumartesi
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return { isHoliday: true, reason: dayOfWeek === 0 ? 'Pazar Günü' : 'Cumartesi Günü' }
  }

  const iso = date.toISOString().split('T')[0]
  if (TURKIYE_RESMI_TATILLER.has(iso)) {
    return { isHoliday: true, reason: 'Ulusal Bayram / Resmi Tatil' }
  }

  return { isHoliday: false }
}

/**
 * Başlangıç tarihine N iş günü ekler (Hafta sonları ve resmi tatilleri atlar).
 */
export function ekleIsGunu(baslangic: Date | string, isGunuSayisi: number): Date {
  const cur = new Date(baslangic)
  let eklenen = 0

  while (eklenen < isGunuSayisi) {
    cur.setDate(cur.getDate() + 1)
    if (!isResmiTatilVeyaHaftasonu(cur).isHoliday) {
      eklenen++
    }
  }

  return cur
}

/**
 * Başlangıç tarihine N takvim günü ekler.
 * Kamu İhale Kanunu ve Borçlar Kanunu gereğince:
 * Eğer sürenin son günü resmi tatile veya hafta sonuna rastlarsa,
 * süre tatili takip eden ilk iş günü mesai bitimine kadar uzar.
 */
export function ekleTakvimGunuMevzuatUyarlamali(
  baslangic: Date | string,
  takvimGunu: number
): Date {
  const cur = new Date(baslangic)
  cur.setDate(cur.getDate() + takvimGunu)

  // Son gün tatile denk geliyorsa ilk iş gününe ilerlet
  while (isResmiTatilVeyaHaftasonu(cur).isHoliday) {
    cur.setDate(cur.getDate() + 1)
  }

  return cur
}

/**
 * İki tarih arasındaki toplam takvim günü ve fiili iş günü sayısını hesaplar.
 */
export function hesaplaGunFarki(
  baslangic: Date | string,
  bitis: Date | string
): { toplamGun: number; netIsGunu: number; tatilGunu: number } {
  const d1 = new Date(baslangic)
  const d2 = new Date(bitis)

  if (d2 < d1) {
    return { toplamGun: 0, netIsGunu: 0, tatilGunu: 0 }
  }

  let toplamGun = 0
  let netIsGunu = 0
  let tatilGunu = 0

  const cur = new Date(d1)
  while (cur <= d2) {
    toplamGun++
    if (isResmiTatilVeyaHaftasonu(cur).isHoliday) {
      tatilGunu++
    } else {
      netIsGunu++
    }
    cur.setDate(cur.getDate() + 1)
  }

  return { toplamGun, netIsGunu, tatilGunu }
}

/**
 * YASAL SÜRE MATRİSİ VE HESAPLAMA PAKETİ
 */
export interface YasalSurePaketi {
  kararTebligTarihi: Date
  itirazSikayetSonTarih: Date // 10 Takvim Günü (4734 md. 55)
  sozlesmeDavetSonTarih: Date // 10 Takvim Günü (4734 md. 42)
  bilgiEdinmeSonCevapTarihi: Date // 15 İş Günü (4982 md. 11)
  muayeneKabulSonTarih: Date // Genellikle 10 İş Günü
  aciklama: string
}

export function hesaplaYasalSureler(kararTebligTarihi: Date | string): YasalSurePaketi {
  const teblig = new Date(kararTebligTarihi)

  const itiraz = ekleTakvimGunuMevzuatUyarlamali(teblig, 10)
  const sozlesme = ekleTakvimGunuMevzuatUyarlamali(teblig, 10)
  const bilgiEdinme = ekleIsGunu(teblig, 15)
  const muayene = ekleIsGunu(teblig, 10)

  const format = (d: Date) =>
    d.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      weekday: 'long'
    })

  return {
    kararTebligTarihi: teblig,
    itirazSikayetSonTarih: itiraz,
    sozlesmeDavetSonTarih: sozlesme,
    bilgiEdinmeSonCevapTarihi: bilgiEdinme,
    muayeneKabulSonTarih: muayene,
    aciklama: `Karar Tebliği (${format(teblig)}) sonrası 10 günlük şikayet/itiraz süresi ${format(itiraz)} mesai bitiminde sona erer.`
  }
}

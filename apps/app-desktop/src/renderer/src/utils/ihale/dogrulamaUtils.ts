/**
 * TEMİN 360 - DOĞRULAMA VE VERİ TEMİZLEME YARDIMCILARI
 *
 * 1. T.C. Kimlik No Algoritmik Kontrolü
 * 2. Vergi Kimlik No Algoritmik Kontrolü
 * 3. Türkiye IBAN Doğrulaması (ISO 7064 MOD-97)
 * 4. Telefon Numarası Formatlayıcı & Doğrulayıcı
 * 5. Araç Plaka Formatlayıcı & Doğrulayıcı
 * 6. Tutarlılık ve Mantıksal Tarih Sıralaması Denetçisi
 */

/**
 * T.C. Kimlik Numarasının resmi MERNİS algoritmasına göre geçerli olup olmadığını denetler.
 */
export function validateTCKimlikNo(tc: string | null | undefined): {
  isValid: boolean
  message?: string
} {
  if (!tc) return { isValid: false, message: 'T.C. Kimlik No boş olamaz.' }

  const clean = tc.toString().trim()
  if (!/^\d{11}$/.test(clean)) {
    return { isValid: false, message: 'T.C. Kimlik No 11 haneli rakamlardan oluşmalıdır.' }
  }

  if (clean.charAt(0) === '0') {
    return { isValid: false, message: 'T.C. Kimlik No 0 ile başlayamaz.' }
  }

  const digits = clean.split('').map(Number)

  // 1, 3, 5, 7 ve 9. hanelerin toplamı
  const teklerToplami = digits[0] + digits[2] + digits[4] + digits[6] + digits[8]
  // 2, 4, 6 ve 8. hanelerin toplamı
  const ciftlerToplami = digits[1] + digits[3] + digits[5] + digits[7]

  // 10. hane kuralı: ((teklerToplami * 7) - ciftlerToplami) % 10
  const hane10 = (teklerToplami * 7 - ciftlerToplami + 1000) % 10
  if (digits[9] !== hane10) {
    return { isValid: false, message: 'Geçersiz T.C. Kimlik No (10. hane kuralı uyuşmuyor).' }
  }

  // 11. hane kuralı: İlk 10 hanenin toplamının birler basamağı
  const ilk10Toplam = digits.slice(0, 10).reduce((acc, curr) => acc + curr, 0)
  if (digits[10] !== ilk10Toplam % 10) {
    return {
      isValid: false,
      message: 'Geçersiz T.C. Kimlik No (11. hane kontrol toplamı uyuşmuyor).'
    }
  }

  return { isValid: true }
}

/**
 * Vergi Kimlik Numarasının (VKN) resmi Gelir İdaresi algoritmasına göre geçerli olup olmadığını denetler.
 */
export function validateVergiKimlikNo(vkn: string | null | undefined): {
  isValid: boolean
  message?: string
} {
  if (!vkn) return { isValid: false, message: 'Vergi Kimlik No boş olamaz.' }

  const clean = vkn.toString().trim()
  if (!/^\d{10}$/.test(clean)) {
    return { isValid: false, message: 'Vergi Kimlik No 10 haneli rakamlardan oluşmalıdır.' }
  }

  const digits = clean.split('').map(Number)
  let sum = 0

  for (let i = 0; i < 9; i++) {
    const v1 = (digits[i] + (9 - i)) % 10
    const v2 = (v1 * Math.pow(2, 9 - i)) % 9
    const v3 = v1 !== 0 && v2 === 0 ? 9 : v2
    sum += v3
  }

  const lastDigitCheck = (10 - (sum % 10)) % 10
  if (digits[9] !== lastDigitCheck) {
    return { isValid: false, message: 'Geçersiz Vergi Kimlik Numarası algoritması.' }
  }

  return { isValid: true }
}

/**
 * Türkiye IBAN Doğrulaması (ISO 7064 MOD-97)
 */
export function validateTR_IBAN(iban: string | null | undefined): {
  isValid: boolean
  formatted: string
  message?: string
} {
  if (!iban) return { isValid: false, formatted: '', message: 'IBAN boş olamaz.' }

  const clean = iban.replace(/\s+/g, '').toUpperCase()
  if (!clean.startsWith('TR')) {
    return {
      isValid: false,
      formatted: clean,
      message: 'Türkiye IBAN numaraları "TR" ile başlamalıdır.'
    }
  }

  if (clean.length !== 26) {
    return { isValid: false, formatted: clean, message: 'TR IBAN numarası 26 karakter olmalıdır.' }
  }

  // Formatlı gösterim (TRxx xxxx xxxx xxxx xxxx xxxx xx)
  const formatted = clean.replace(/(.{4})/g, '$1 ').trim()

  // ISO 7064 Mod-97 Doğrulaması: TR (T=29, R=27) -> Karakterleri sona taşı
  const rearranged = clean.slice(4) + '2927' + clean.slice(2, 4)

  // Büyük sayı bölme işlemi (BigInt veya parça modülo)
  let remainder = 0
  for (let i = 0; i < rearranged.length; i++) {
    remainder = (remainder * 10 + parseInt(rearranged[i], 10)) % 97
  }

  if (remainder !== 1) {
    return {
      isValid: false,
      formatted,
      message: 'Geçersiz IBAN kontrol hanesi (Mod-97 uyuşmuyor).'
    }
  }

  return { isValid: true, formatted }
}

/**
 * Türkiye Telefon Numarası Formatlama & Doğrulama (05xx xxx xx xx)
 */
export function formatTurkishPhone(phone: string | null | undefined): string {
  if (!phone) return ''
  const digits = phone.replace(/\D/g, '')

  let clean = digits
  if (clean.startsWith('90') && clean.length === 12) {
    clean = clean.slice(2)
  } else if (!clean.startsWith('0') && clean.length === 10) {
    clean = '0' + clean
  }

  if (clean.length === 11) {
    return clean.replace(/(\d{4})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4')
  }

  return phone
}

/**
 * Türkiye Araç Plaka Formatlama & Doğrulama (Örn: 06 ABC 123, 34 AB 1234)
 */
export function formatPlaka(raw: string | null | undefined): string {
  if (!raw) return ''
  const clean = raw
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
  const match = clean.match(/^(\d{2})([A-Z]{1,3})(\d{2,4})$/)
  if (match) {
    return `${match[1]} ${match[2]} ${match[3]}`
  }
  return raw.toUpperCase()
}

/**
 * Tutarlılık ve Mantıksal Tarih Sıralaması Denetçisi
 * İhale sürecindeki kronolojik mantık hatalarını yakalar.
 */
export interface SurecTarihleri {
  ihtiyacTarihi?: string | Date
  onayBelgesiTarihi?: string | Date
  ihaleTarihi?: string | Date
  kararTarihi?: string | Date
  sozlesmeTarihi?: string | Date
  iseBaslamaTarihi?: string | Date
  isinBitisTarihi?: string | Date
  kabulTarihi?: string | Date
}

export function denetleTarihSiralamasi(tarihler: SurecTarihleri): {
  isConsistent: boolean
  hatalar: string[]
} {
  const hatalar: string[] = []

  const parse = (d?: string | Date) => (d ? new Date(d).getTime() : null)

  const tIhtiyac = parse(tarihler.ihtiyacTarihi)
  const tOnay = parse(tarihler.onayBelgesiTarihi)
  const tIhale = parse(tarihler.ihaleTarihi)
  const tKarar = parse(tarihler.kararTarihi)
  const tSozlesme = parse(tarihler.sozlesmeTarihi)
  const tBaslama = parse(tarihler.iseBaslamaTarihi)
  const tBitis = parse(tarihler.isinBitisTarihi)
  const tKabul = parse(tarihler.kabulTarihi)

  if (tIhtiyac && tOnay && tOnay < tIhtiyac) {
    hatalar.push('İhale onay belgesi tarihi, ihtiyaç talep tarihinden önce olamaz.')
  }
  if (tOnay && tIhale && tIhale < tOnay) {
    hatalar.push('İhale tarihi, onay belgesi tarihinden önce olamaz.')
  }
  if (tIhale && tKarar && tKarar < tIhale) {
    hatalar.push('İhale komisyon karar tarihi, ihale tarihinden önce olamaz.')
  }
  if (tKarar && tSozlesme && tSozlesme < tKarar) {
    hatalar.push('Sözleşme imza tarihi, ihale karar tarihinden önce olamaz.')
  }
  if (tSozlesme && tBaslama && tBaslama < tSozlesme) {
    hatalar.push('İşe başlama/yer teslimi tarihi, sözleşme tarihinden önce olamaz.')
  }
  if (tBaslama && tBitis && tBitis < tBaslama) {
    hatalar.push('İşin bitiş tarihi, işe başlama tarihinden önce olamaz.')
  }
  if (tBitis && tKabul && tKabul < tBitis) {
    hatalar.push('Muayene ve kabul tarihi, işin bitiş tarihinden önce olamaz.')
  }

  return {
    isConsistent: hatalar.length === 0,
    hatalar
  }
}

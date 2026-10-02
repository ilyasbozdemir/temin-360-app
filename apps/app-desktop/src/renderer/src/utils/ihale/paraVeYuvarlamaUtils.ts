/**
 * TEMİN 360 - PARA VE YUVARLAMA YARDIMCILARI & ÇİFT YÖNLÜ PARSER
 *
 * Kamu maliyesi ve ihale hesaplamalarında kuruş hassasiyetini,
 * tutarlı yuvarlama standartlarını ve Türkçe metinden sayıya (Yazı -> Sayı)
 * tersine çevirme motorunu yönetir.
 */

/**
 * Sayıyı 2 ondalıklı standart mali kuruş hassasiyetine güvenle yuvarlar.
 * JavaScript floating-point (0.1 + 0.2 = 0.30000000000000004) hatalarını önler.
 */
export function roundKurus(num: number): number {
  if (isNaN(num) || !isFinite(num)) return 0
  return Math.round((num + Number.EPSILON) * 100) / 100
}

/**
 * Sayıyı belirtilen basamak hassasiyetine göre yuvarlar.
 */
export function roundToPrecision(num: number, decimals: number = 2): number {
  if (isNaN(num) || !isFinite(num)) return 0
  const factor = Math.pow(10, decimals)
  return Math.round((num + Number.EPSILON) * factor) / factor
}

/**
 * Sayıyı Türk Lirası para birimi formatına dönüştürür. (Örn: 1.450.250,50 ₺)
 */
export function formatTL(
  val: number | string | null | undefined,
  includeSymbol: boolean = true
): string {
  if (val === null || val === undefined || val === '') return '0,00' + (includeSymbol ? ' ₺' : '')
  const num = typeof val === 'number' ? val : parseTurkishFloat(String(val))
  if (isNaN(num)) return '0,00' + (includeSymbol ? ' ₺' : '')

  const formatted = new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num)

  return includeSymbol ? `${formatted} ₺` : formatted
}

/**
 * Türkçe formatlı string tutarı (1.250,50 veya 1250.50) float sayıya dönüştürür.
 */
export function parseTurkishFloat(raw: string | number | null | undefined): number {
  if (raw === null || raw === undefined || raw === '') return 0
  if (typeof raw === 'number') return isNaN(raw) ? 0 : raw

  const str = String(raw).trim()
  if (!str) return 0

  // Eğer içinde virgül varsa: noktaları kaldır, virgülü noktaya çevir
  if (str.includes(',')) {
    const clean = str
      .replace(/[^\d,-]/g, '')
      .replace(/\./g, '')
      .replace(',', '.')
    const parsed = parseFloat(clean)
    return isNaN(parsed) ? 0 : parsed
  }

  // Sadece nokta veya düz sayı varsa
  const clean = str.replace(/[^\d.-]/g, '')
  const parsed = parseFloat(clean)
  return isNaN(parsed) ? 0 : parsed
}

/**
 * YAZIDAN SAYIYA ÇEVİRİCİ (NLP / Kelime Ayrıştırıcı)
 *
 * Örnekler:
 * "İKİYÜZ SEKSENİKİBİN YÜZONİKİ TL ELLİ KURUŞ" -> 282112.50
 * "BİR MİLYON BEŞYÜZ BİN TÜRK LİRASI" -> 1500000.00
 * "YEDİ YÜZ ELLİ TL YİRMİ BEŞ KURUŞ" -> 750.25
 * "SIFIR TL" -> 0
 */
const WORD_MAP: Record<string, number> = {
  SIFIR: 0,
  BİR: 1,
  BIR: 1,
  İKİ: 2,
  IKI: 2,
  ÜÇ: 3,
  UC: 3,
  DÖRT: 4,
  DORT: 4,
  BEŞ: 5,
  BES: 5,
  ALTI: 6,
  YEDİ: 7,
  YEDI: 7,
  SEKİZ: 8,
  SEKIZ: 8,
  DOKUZ: 9,

  ON: 10,
  YİRMİ: 20,
  YIRMI: 20,
  OTUZ: 30,
  KIRK: 40,
  ELLİ: 50,
  ELLI: 50,
  ALTMIŞ: 60,
  ALTMIS: 60,
  YETMİŞ: 70,
  YETMIS: 70,
  SEKSEN: 80,
  DOKSAN: 90
}

const SCALE_MAP: Record<string, number> = {
  YÜZ: 100,
  YUZ: 100,
  BİN: 1000,
  BIN: 1000,
  MİLYON: 1000000,
  MILYON: 1000000,
  MİLYAR: 1000000000,
  MILYAR: 1000000000,
  TRİLYON: 1000000000000,
  TRILYON: 1000000000000
}

/**
 * Tek bir Türkçe kelime bloğunu (Örn: "İKİYÜZSEKSENİKİ") alt parçalarına böler.
 */
function tokenizeTurkishCompoundWord(word: string): string[] {
  const normalized = word.toLocaleUpperCase('tr-TR').trim()
  if (!normalized) return []

  const tokens: string[] = []
  let pos = 0

  const allKeys = [
    'TRİLYON',
    'TRILYON',
    'MİLYAR',
    'MILYAR',
    'MİLYON',
    'MILYON',
    'ALTI',
    'YEDİ',
    'YEDI',
    'SEKİZ',
    'SEKIZ',
    'DOKUZ',
    'YİRMİ',
    'YIRMI',
    'ALTMIŞ',
    'ALTMIS',
    'YETMİŞ',
    'YETMIS',
    'SEKSEN',
    'DOKSAN',
    'BİR',
    'BIR',
    'İKİ',
    'IKI',
    'DÖRT',
    'DORT',
    'OTUZ',
    'KIRK',
    'ELLİ',
    'ELLI',
    'SIFIR',
    'YÜZ',
    'YUZ',
    'BİN',
    'BIN',
    'ÜÇ',
    'UC',
    'BEŞ',
    'BES',
    'ON'
  ]

  while (pos < normalized.length) {
    let matched = false
    for (const key of allKeys) {
      if (normalized.startsWith(key, pos)) {
        tokens.push(key)
        pos += key.length
        matched = true
        break
      }
    }
    if (!matched) {
      // Tanınmayan bir karakter varsa bir sonraki karaktere geç
      pos++
    }
  }

  return tokens
}

/**
 * 0-999 veya grup seviyesinde token listesini sayıya çevirir.
 */
function parseTokenGroup(tokens: string[]): number {
  let total = 0
  let currentGroup = 0

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]

    if (token in WORD_MAP) {
      currentGroup += WORD_MAP[token]
    } else if (token === 'YÜZ' || token === 'YUZ') {
      if (currentGroup === 0) {
        currentGroup = 100
      } else {
        currentGroup *= 100
      }
    } else if (token in SCALE_MAP) {
      const scale = SCALE_MAP[token]
      if (currentGroup === 0) currentGroup = 1
      total += currentGroup * scale
      currentGroup = 0
    }
  }

  total += currentGroup
  return total
}

/**
 * Yazıyla ifade edilen Türkçe para tutarını sayıya dönüştürür.
 *
 * @param text - Örn: "İKİYÜZ SEKSEN İKİ BİN YÜZ ON İKİ TL ELLİ KURUŞ"
 * @returns Sayısal değer (Örn: 282112.50) veya geçersiz ise null
 */
export function yaziyiSayiyaCevir(text: string | null | undefined): number | null {
  if (!text || typeof text !== 'string') return null

  const clean = text
    .toLocaleUpperCase('tr-TR')
    .replace(/TÜRK LİRASI|TURK LIRASI|TL|LİRA|LIRA/g, '___TL___')
    .replace(/KURUŞ|KURUS|KRŞ|KRS/g, '___KR___')
    .trim()

  const parts = clean.split('___TL___')
  const liraPart = parts[0] ? parts[0].trim() : ''
  const kurusPart = parts.length > 1 ? parts[1].replace('___KR___', '').trim() : ''

  // Lira kelimelerini tokenize et
  const rawLiraWords = liraPart.split(/\s+/)
  const liraTokens: string[] = []
  for (const w of rawLiraWords) {
    liraTokens.push(...tokenizeTurkishCompoundWord(w))
  }

  let liraVal = 0
  if (liraTokens.length > 0) {
    liraVal = parseTokenGroup(liraTokens)
  }

  // Kuruş kelimelerini tokenize et
  let kurusVal = 0
  if (kurusPart) {
    const rawKurusWords = kurusPart.split(/\s+/)
    const kurusTokens: string[] = []
    for (const w of rawKurusWords) {
      kurusTokens.push(...tokenizeTurkishCompoundWord(w))
    }
    if (kurusTokens.length > 0) {
      kurusVal = parseTokenGroup(kurusTokens)
    }
  }

  if (liraTokens.length === 0 && !kurusPart) return null

  return roundKurus(liraVal + kurusVal / 100)
}

/**
 * Global Formatters & Normalization Utilities
 * TEMİN 360 - Merkezi Formatlayıcı ve Yardımcı Fonksiyonlar
 */

import {
  amountToWordsTL,
  sayiyiYaziyaCevir as docSayiyiYaziyaCevir,
  numberToWords,
  convertGroup,
  SayiyiYaziyaCevirOptions
} from '@temin360/document-templates'

export interface FormatCurrencyOptions {
  currency?: string
  showSymbol?: boolean
  fallback?: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
}

/**
 * Sayısal değeri Türkçe para birimi formatına dönüştürür (Örn: "12.345,67 ₺")
 *
 * @param val - Formatlanacak sayı veya metin
 * @param options - Para birimi sembolü (string) veya detaylı yapılandırma nesnesi
 */
export function formatCurrency(
  val: number | string | null | undefined,
  options: FormatCurrencyOptions | string = '₺'
): string {
  const opt: FormatCurrencyOptions =
    typeof options === 'string'
      ? { currency: options, fallback: '-' }
      : { currency: '₺', fallback: '-', showSymbol: true, ...options }

  const fallback = opt.fallback ?? '-'
  const showSymbol = opt.showSymbol !== false
  const currencySuffix = showSymbol && opt.currency ? ` ${opt.currency.trim()}` : ''

  if (val === null || val === undefined || val === '') {
    return fallback
  }

  const num =
    typeof val === 'number'
      ? val
      : parseFloat(String(val).replace(/\./g, '').replace(',', '.'))

  if (isNaN(num)) {
    return fallback
  }

  return (
    num.toLocaleString('tr-TR', {
      minimumFractionDigits: opt.minimumFractionDigits ?? 2,
      maximumFractionDigits: opt.maximumFractionDigits ?? 2
    }) + currencySuffix
  ).trim()
}

/**
 * `formatCurrency` için alias
 */
export const formatPara = formatCurrency

export interface FormatDateOptions {
  includeTime?: boolean
  dateStyle?: 'full' | 'long' | 'medium' | 'short'
  timeStyle?: 'full' | 'long' | 'medium' | 'short'
  fallback?: string
}

/**
 * Tarih değerini Türkçe formatında gösterir (Örn: "03.10.2026" veya "03 Eki 2026, 19:45")
 *
 * @param val - Tarih string, timestamp, Date veya null/undefined
 * @param options - Ek tarih formatlama seçenekleri
 */
export function formatDate(
  val: string | number | Date | null | undefined,
  options: FormatDateOptions = {}
): string {
  const fallback = options.fallback ?? '-'
  if (!val) return fallback

  try {
    const date = val instanceof Date ? val : new Date(val)
    if (isNaN(date.getTime())) {
      return typeof val === 'string' && val.trim() ? val : fallback
    }

    if (options.dateStyle || options.timeStyle) {
      return date.toLocaleString('tr-TR', {
        dateStyle: options.dateStyle,
        timeStyle: options.timeStyle
      })
    }

    if (options.includeTime) {
      return date.toLocaleString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  } catch {
    return typeof val === 'string' ? val : fallback
  }
}

/**
 * `formatDate` için alias
 */
export const formatTurkishDate = formatDate

/**
 * Sayıyı Türkçe Okunuşa / Yazıya Çevirir (Kuruş/Cent desteğiyle)
 */
export { amountToWordsTL, docSayiyiYaziyaCevir as sayiyiYaziyaCevir, numberToWords, convertGroup }
export type { SayiyiYaziyaCevirOptions }

/**
 * İsim ve soyisimden baş harfleri çıkarır (Örn: "İlyas Bozdemir" -> "İB")
 *
 * @param name - Tam isim veya unvan
 * @param fallback - Boş olması durumunda dönecek varsayılan metin (Varsayılan: "SY")
 */
export function getInitials(name?: string | null, fallback = 'SY'): string {
  if (!name || typeof name !== 'string') return fallback
  const trimmed = name.trim()
  if (!trimmed) return fallback

  const parts = trimmed.split(/\s+/).filter(Boolean)
  if (parts.length === 1) {
    return parts[0][0].toLocaleUpperCase('tr-TR')
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toLocaleUpperCase('tr-TR')
}

/**
 * Karşılaştırma ve arama için Türkçe metni normalize eder
 * (Türkçe karakterleri dönüştürür, küçük harfe çevirir ve alfanümerik olmayanları temizler)
 *
 * @param str - Normalize edilecek metin
 */
export function normalizeForMatch(str?: string | null): string {
  if (!str) return ''
  return String(str)
    .toLocaleLowerCase('tr-TR')
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]/g, '')
}

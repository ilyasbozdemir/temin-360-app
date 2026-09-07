/**
 * TEMİN 360 — Desteklenen Dosya Formatları
 * .hkmp ve .dtal SQLite veritabanı dosyalarıdır.
 */

export interface FileFormat {
  /** Uzantı (nokta olmadan, örn: 'hkmp') */
  ext: string
  /** Kullanıcıya gösterilecek açıklama */
  label: string
  /** Kısa açıklama (dialog filtresi adı) */
  dialogName: string
  /** Bu format varsayılan yeni dosya uzantısı mı? */
  isDefault?: boolean
}

export const SUPPORTED_FORMATS: FileFormat[] = [
  {
    ext: 'hkmp',
    label: 'TEMİN 360 Proje Dosyası',
    dialogName: 'TEMİN 360 Dosyası (*.hkmp)',
    isDefault: true
  },
  {
    ext: 'dtal',
    label: 'TEMİN 360 Veri Dosyası (Eski .dtal)',
    dialogName: 'TEMİN 360 / DTAL Dosyası (*.dtal)'
  },
  {
    ext: 'dtm',
    label: 'TEMİN 360 Veri Dosyası (Eski .dtm)',
    dialogName: 'TEMİN 360 / DTM Dosyası (*.dtm)'
  },
  {
    ext: 'dte',
    label: 'TEMİN 360 Veri Aktarım Dosyası (.dte)',
    dialogName: 'TEMİN 360 / DTE Dosyası (*.dte)'
  }
]

/** Tüm desteklenen uzantıları ['hkmp', 'dtal'] olarak döner */
export const allExtensions = SUPPORTED_FORMATS.map((f) => f.ext)

/** Varsayılan uzantı (yeni dosya oluştururken kullanılır) */
export const defaultFormat = SUPPORTED_FORMATS.find((f) => f.isDefault) ?? SUPPORTED_FORMATS[0]

/** Electron dialog filter listesi — tüm formatları tek grupta gösterir */
export const allFormatsFilter = {
  name: 'TEMİN 360 Dosyaları',
  extensions: allExtensions
}

/** Her format için ayrı ayrı dialog filter listesi */
export const perFormatFilters = SUPPORTED_FORMATS.map((f) => ({
  name: f.dialogName,
  extensions: [f.ext]
}))

export function isSupportedFile(filePath: string): boolean {
  if (!filePath) return false
  const cleanPath = filePath.replace(/^"+|"+$/g, '').trim()
  const lower = cleanPath.toLowerCase()
  return allExtensions.some((ext) => lower.endsWith('.' + ext))
}

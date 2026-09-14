import fs from 'fs'

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
    ext: 'temin',
    label: 'TEMİN 360 Proje Dosyası',
    dialogName: 'TEMİN 360 Dosyası (*.temin)',
    isDefault: true
  },
  {
    ext: 'hkmp',
    label: 'Hakim Pro Dosyası (Eski .hkmp)',
    dialogName: 'Hakim Pro Dosyası (*.hkmp)'
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
  },
  {
    ext: 'dta',
    label: 'TEMİN 360 / DTA Dosyası (Eski .dta)',
    dialogName: 'TEMİN 360 / DTA Dosyası (*.dta)'
  },
  {
    ext: 'tmn360',
    label: 'TEMİN 360 Arşiv Paketi (.tmn360)',
    dialogName: 'TEMİN 360 Arşiv Paketi (*.tmn360)'
  },
  {
    ext: 'sqlite',
    label: 'SQLite Veritabanı Dosyası (*.sqlite)',
    dialogName: 'SQLite Veritabanı (*.sqlite)'
  },
  {
    ext: 'db',
    label: 'Veritabanı Dosyası (*.db)',
    dialogName: 'Veritabanı Dosyası (*.db)'
  }
]

/** Tüm desteklenen uzantıları ['temin', 'hkmp', ...] olarak döner */
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
  if (!filePath || typeof filePath !== 'string') return false
  const cleanPath = filePath.replace(/^"+|"+$/g, '').trim()
  if (cleanPath.startsWith('-')) return false
  const lower = cleanPath.toLowerCase()
  if (allExtensions.some((ext) => lower.endsWith('.' + ext))) return true

  // Ekstra akıllı algılama: Uzantı farklı olsa bile dosya geçerli SQLite veya ZIP/TEMİN ise destekle
  try {
    if (fs.existsSync(cleanPath) && fs.statSync(cleanPath).isFile()) {
      const fd = fs.openSync(cleanPath, 'r')
      const buf = Buffer.alloc(16)
      fs.readSync(fd, buf, 0, 16, 0)
      fs.closeSync(fd)
      const sig = buf.toString('latin1')
      if (sig.includes('SQLite format 3') || (buf[0] === 0x50 && buf[1] === 0x4b)) {
        return true
      }
    }
  } catch {
    // İhmal et
  }

  return false
}


export interface GDriveFile {
  id: string
  name: string
  size?: string
  modifiedTime?: string
}

export type StatusType = 'success' | 'error' | 'info'
export interface StatusMsg {
  text: string
  type: StatusType
}

export type AuthTab = 'api' | 'manual'

export const SUPPORTED_BACKUP_EXTS = [
  'temin',
  'hkmp',
  'dtal',
  'dtm',
  'dte',
  'dta',
  'tmn360',
  'sqlite',
  'db',
  'zip',
  'bak'
]

/** Tırnakları ve tüm boşluk/satır sonlarını temizler (Client ID, Secret, Refresh Token). */
export const cleanSecret = (value?: string | null): string =>
  (value ?? '')
    .trim()
    .replace(/^["']|["']$/g, '')
    .replace(/[\r\n\s]+/g, '')

/** cleanSecret + baştaki "Bearer " önekini kaldırır (Access Token). */
export const cleanAccessToken = (value?: string | null): string =>
  (value ?? '')
    .trim()
    .replace(/^["']|["']$/g, '')
    .replace(/^Bearer\s+/i, '')
    .replace(/[\r\n\s]+/g, '')

export const isSupportedBackup = (fileName: string): boolean => {
  const lower = fileName.toLowerCase()
  return SUPPORTED_BACKUP_EXTS.some((ext) => lower.endsWith('.' + ext))
}

export const formatFileSize = (bytes?: string | number): string => {
  if (!bytes) return '—'
  const num = Number(bytes)
  if (isNaN(num)) return '—'
  if (num < 1024) return `${num} B`
  if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`
  return `${(num / (1024 * 1024)).toFixed(2)} MB`
}

export const errorText = (err: unknown, fallback: string): string =>
  (err instanceof Error && err.message) || fallback

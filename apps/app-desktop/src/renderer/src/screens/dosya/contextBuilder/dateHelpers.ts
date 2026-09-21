export function formatDateString(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null
  try {
    const cleanStr = String(dateStr).trim()
    if (/^\d{4}-\d{2}-\d{2}/.test(cleanStr)) {
      const datePart = cleanStr.split('T')[0].split(' ')[0]
      const [y, m, d] = datePart.split('-')
      if (y && m && d) {
        return `${d.padStart(2, '0')}.${m.padStart(2, '0')}.${y}`
      }
    }
    if (/^\d{2}\.\d{2}\.\d{4}/.test(cleanStr)) {
      return cleanStr.substring(0, 10)
    }
    const d = new Date(cleanStr)
    if (isNaN(d.getTime())) return null
    return new Intl.DateTimeFormat('tr-TR', {
      timeZone: 'Europe/Istanbul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(d)
  } catch {
    return null
  }
}

export function getFileDate(dosyaResData: any): string {
  const today = new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date())

  return (
    formatDateString(dosyaResData?.dosya_acilis_tarihi) ||
    formatDateString(dosyaResData?.tarih) ||
    formatDateString(dosyaResData?.temin_tarihi) ||
    formatDateString(dosyaResData?.created_at) ||
    today
  )
}

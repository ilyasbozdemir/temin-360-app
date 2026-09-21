export const TURKISH_STOPWORDS = new Set([
  've',
  'veya',
  'ile',
  'için',
  'göre',
  'alım',
  'alımı',
  'satın',
  'işi',
  'işleri',
  'tarafından',
  'tane',
  'adet',
  'bu',
  'şu',
  'her',
  'gibi',
  'hakkında',
  'ilgili',
  'doğrudan',
  'temin',
  'mal',
  'hizmet',
  'yapım',
  'danışmanlık',
  'türü',
  'tipi',
  'kodu',
  'bölüm',
  'birim',
  'yıl',
  'yılı',
  'sayılı',
  'madde',
  'maddesi'
])

export function normalizeTrChars(str: string): string {
  if (!str) return ''
  return str
    .replace(/Ğ/g, 'G')
    .replace(/ğ/g, 'g')
    .replace(/Ü/g, 'U')
    .replace(/ü/g, 'u')
    .replace(/Ş/g, 'S')
    .replace(/ş/g, 's')
    .replace(/İ/g, 'I')
    .replace(/ı/g, 'i')
    .replace(/Ö/g, 'O')
    .replace(/ö/g, 'o')
    .replace(/Ç/g, 'C')
    .replace(/ç/g, 'c')
}

export function slugifyTag(text: string): string {
  if (!text) return ''
  const clean = normalizeTrChars(text)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  if (!clean) return ''
  return clean.startsWith('#') ? clean : `#${clean}`
}

export function suggestTagsFromTitle(title?: string | null, description?: string | null): string[] {
  const text = `${title || ''} ${description || ''}`.trim()
  if (!text) return []

  const words = text
    .split(/[\s,.;:()/\\-]+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 3)

  const tags: string[] = []
  const seen = new Set<string>()

  for (const rawWord of words) {
    const lowerRaw = rawWord.toLowerCase()
    if (TURKISH_STOPWORDS.has(lowerRaw)) continue

    const slug = slugifyTag(rawWord)
    if (slug && slug.length >= 3 && !seen.has(slug)) {
      seen.add(slug)
      tags.push(slug)
    }
  }

  return tags.slice(0, 10)
}

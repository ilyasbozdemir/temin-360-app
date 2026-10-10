import { app } from 'electron'
import { join } from 'path'
import fs from 'fs'

export function readSystemTemplate(fileName: string): string | null {
  const templatesDirDev = join(app.getAppPath(), 'resources', 'templates')
  const templatesDirProd = join(process.resourcesPath, 'templates')
  const targetDir = fs.existsSync(templatesDirProd) ? templatesDirProd : templatesDirDev

  const altName1 = fileName.endsWith('.html')
    ? fileName.replace(/\.html$/, '.mustache')
    : fileName.replace(/\.mustache$/, '.html')
  const altName2 = fileName.endsWith('.html.json')
    ? fileName.replace(/\.html\.json$/, '.mustache.json')
    : fileName.replace(/\.mustache\.json$/, '.html.json')

  const findFile = (dir: string): string | null => {
    try {
      if (!fs.existsSync(dir)) return null
      const list = fs.readdirSync(dir)
      for (const file of list) {
        const filePath = join(dir, file)
        const stat = fs.statSync(filePath)
        if (stat.isDirectory()) {
          const found = findFile(filePath)
          if (found) return found
        } else if (file === fileName || file === altName1 || file === altName2) {
          return filePath
        }
      }
    } catch {}
    return null
  }

  const foundPath = findFile(targetDir)
  if (foundPath && fs.existsSync(foundPath)) {
    try {
      return fs.readFileSync(foundPath, 'utf-8')
    } catch {}
  }
  return null
}

const ONES = ['', 'BİR', 'İKİ', 'ÜÇ', 'DÖRT', 'BEŞ', 'ALTI', 'YEDİ', 'SEKİZ', 'DOKUZ']
const TENS = ['', 'ON', 'YİRMİ', 'OTUZ', 'KIRK', 'ELLİ', 'ALTMIŞ', 'YETMİŞ', 'SEKSEN', 'DOKSAN']
const SCALES = ['', 'BİN', 'MİLYON', 'MİLYAR', 'TRİLYON', 'KATRİLYON']

export function convertNumberGroup(n: number): string {
  let result = ''
  const yuzler = Math.floor(n / 100)
  const kalan = n % 100
  const onlar = Math.floor(kalan / 10)
  const birler = kalan % 10

  if (yuzler > 0) {
    if (yuzler > 1) result += ONES[yuzler]
    result += 'YÜZ'
  }
  if (onlar > 0) result += TENS[onlar]
  if (birler > 0) result += ONES[birler]

  return result
}

export function numberToTurkishWords(num: number): string {
  if (isNaN(num) || num === 0) return 'SIFIR TL'

  const tam = Math.floor(Math.abs(num))
  const kurus = Math.round((Math.abs(num) - tam) * 100)

  // 3'erli basamaklara ayır
  const groups: number[] = []
  let temp = tam
  while (temp > 0) {
    groups.push(temp % 1000)
    temp = Math.floor(temp / 1000)
  }

  let words = ''
  for (let i = groups.length - 1; i >= 0; i--) {
    const g = groups[i]
    if (g === 0) continue

    let groupWords = convertNumberGroup(g)
    if (i === 1 && g === 1) {
      groupWords = '' // "BİR BİN" değil, sadece "BİN"
    }

    words += groupWords + (SCALES[i] || '') + ' '
  }

  words = (words.trim() || 'SIFIR') + ' TL'
  if (kurus > 0) {
    words += ' ' + convertNumberGroup(kurus) + ' KURUŞ'
  }

  return words
}

export function getIpcKurumBizimText(k: any): string {
  if (k?.alt_kurum_bizim && String(k.alt_kurum_bizim).trim())
    return String(k.alt_kurum_bizim).trim()
  if (k?.alt_kurum_tipi) {
    const map: Record<string, string> = {
      belediye: 'Belediyemiz',
      mudurluk: 'Müdürlüğümüz',
      bakanlik: 'Bakanlığımız',
      valilik: 'Valiliğimiz',
      kaymakamlik: 'Kaymakamlığımız',
      universite: 'Üniversitemiz',
      il_ozel: 'İl Özel İdaremiz',
      koy: 'Muhtarlığımız',
      sgk: 'Müdürlüğümüz',
      kurul: 'Kurulumuz',
      diger: 'İdaremiz'
    }
    if (map[k.alt_kurum_tipi]) return map[k.alt_kurum_tipi]
  }
  if (k?.kurum_tipi === 'belediye') return 'Belediyemiz'
  if (k?.kurum_tipi === 'ozel_butce') return 'Üniversitemiz'
  if (k?.kurum_tipi === 'duzenleyici') return 'Kurulumuz'
  if (k?.kurum_tipi === 'genel_butce') return 'Müdürlüğümüz'
  return 'İdaremiz'
}

export function getIpcKurumIhtiyacYeri(k: any): string {
  if (k?.alt_kurum_bizim && String(k.alt_kurum_bizim).trim()) {
    const str = String(k.alt_kurum_bizim).trim()
    const lower = str.toLowerCase()
    if (
      lower.endsWith('n') ||
      lower.endsWith('in') ||
      lower.endsWith('ın') ||
      lower.endsWith('un') ||
      lower.endsWith('ün')
    )
      return str
    if (lower.endsWith('miz') || lower.endsWith('müz')) return `${str}in`
    if (lower.endsWith('mız') || lower.endsWith('muz')) return `${str}ın`
    if (
      lower.endsWith('si') ||
      lower.endsWith('su') ||
      lower.endsWith('sü') ||
      lower.endsWith('sı')
    )
      return `${str}nin`
    if (lower.endsWith('i') || lower.endsWith('ü')) return `${str}nin`
    if (lower.endsWith('ı') || lower.endsWith('u')) return `${str}nun`
    return `${str}in`
  }
  if (k?.alt_kurum_tipi) {
    const map: Record<string, string> = {
      belediye: 'Belediyemizin',
      mudurluk: 'Müdürlüğümüzün',
      bakanlik: 'Bakanlığımızın',
      valilik: 'Valiliğimizin',
      kaymakamlik: 'Kaymakamlığımızın',
      universite: 'Üniversitemizin',
      il_ozel: 'İl Özel İdaremizin',
      koy: 'Muhtarlığımızın',
      sgk: 'Müdürlüğümüzün',
      kurul: 'Kurulumuzun',
      diger: 'İdaremizin'
    }
    if (map[k.alt_kurum_tipi]) return map[k.alt_kurum_tipi]
  }
  if (k?.kurum_tipi === 'belediye') return 'Belediyemizin'
  if (k?.kurum_tipi === 'ozel_butce') return 'Üniversitemizin'
  if (k?.kurum_tipi === 'duzenleyici') return 'Kurulumuzun'
  if (k?.kurum_tipi === 'genel_butce') return 'Müdürlüğümüzün'
  return 'İdaremizin'
}

export function formatTurkishDate(raw: any): string {
  if (!raw) return ''
  const clean = String(raw).trim()
  if (/^\d{4}-\d{2}-\d{2}/.test(clean)) {
    const [y, m, d] = clean.split('T')[0].split(' ')[0].split('-')
    return `${d.padStart(2, '0')}.${m.padStart(2, '0')}.${y}`
  }
  return clean.substring(0, 10)
}

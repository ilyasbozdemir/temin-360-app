import fs from 'fs'
import path from 'path'

/**
 * TEMİN 360 - Kod Tabanı Derin Analiz Scripti
 * Çalıştırmak için: node scripts/analyze-codebase.mjs
 */

import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

function getFiles(dir, exts = ['.ts', '.tsx', '.js', '.jsx']) {
  let results = []
  const fullDir = path.isAbsolute(dir) ? dir : path.join(rootDir, dir)
  if (!fs.existsSync(fullDir)) return results
  const list = fs.readdirSync(fullDir)
  list.forEach(file => {
    const filePath = path.join(fullDir, file)
    const relPath = path.relative(rootDir, filePath).replace(/\\/g, '/')
    const stat = fs.statSync(filePath)
    if (stat && stat.isDirectory()) {
      if (!['node_modules', 'dist', 'out', '.git', '.gemini', 'build', '.agents', 'dist-electron'].includes(file)) {
        results = results.concat(getFiles(filePath, exts))
      }
    } else {
      if (exts.includes(path.extname(file)) && !file.endsWith('.d.ts')) {
        results.push(relPath)
      }
    }
  })
  return results
}

const targetDirs = [
  'apps/app-desktop/src',
  'packages/document-templates/src',
  'packages/database/src'
]

const files = targetDirs.flatMap(d => getFiles(d))

// 1. Dosya Büyüklük Analizi
const fileStats = files.map(f => {
  const content = fs.readFileSync(path.join(rootDir, f), 'utf-8')
  const lines = content.split('\n').length
  return { path: f, lines, size: content.length }
})

fileStats.sort((a, b) => b.lines - a.lines)

console.log('================================================================================')
console.log('📊 TEMİN 360 - KOD TABANI VE MODÜLARİTE ANALİZ RAPORU')
console.log('================================================================================')
console.log(`🔍 Taranan Toplam Dosya : ${files.length}`)
console.log(`📄 Toplam Satır Sayısı  : ${fileStats.reduce((acc, f) => acc + f.lines, 0).toLocaleString('tr-TR')}`)
console.log('================================================================================\n')

console.log('📌 1. EN BÜYÜK DOSYALAR (> 500 Satır - Modülerleştirme Adayları)')
console.log('--------------------------------------------------------------------------------')
const largeFiles = fileStats.filter(f => f.lines >= 500)
largeFiles.forEach((f, idx) => {
  const badge = f.lines >= 1000 ? '🔴 KRİTİK' : f.lines >= 750 ? '🟡 BÜYÜK' : '⚪ İNCELE'
  console.log(`${(idx + 1).toString().padStart(2, ' ')}. ${badge} | ${f.lines.toString().padStart(5, ' ')} satır  ->  ${f.path}`)
})

// 2. Mükerrer (Duplicate) Fonksiyon Analizi
const functionMap = new Map()

const funcRegex = /(?:export\s+)?(?:async\s+)?function\s+([a-zA-Z0-9_$]+)\s*\(([^)]*)\)/g
const arrowFuncRegex = /(?:export\s+)?const\s+([a-zA-Z0-9_$]+)\s*=\s*(?:async\s*)?\(([^)]*)\)\s*(?::\s*[^=]+)?\s*=>/g

files.forEach(f => {
  if (f.includes('__tests__') || f.includes('.test.') || f.includes('.spec.')) return

  const content = fs.readFileSync(path.join(rootDir, f), 'utf-8')
  const lines = content.split('\n')

  lines.forEach((lineText, lineIdx) => {
    let match
    // Standart fonksiyonlar
    funcRegex.lastIndex = 0
    while ((match = funcRegex.exec(lineText)) !== null) {
      const name = match[1]
      if (['render', 'default', 'App', 'Component', 'constructor', 'useMemo', 'useCallback', 'useEffect', 'useState'].includes(name)) continue
      if (!functionMap.has(name)) functionMap.set(name, [])
      functionMap.get(name).push({ file: f, line: lineIdx + 1, signature: match[0].trim() })
    }

    // Arrow fonksiyonlar
    arrowFuncRegex.lastIndex = 0
    while ((match = arrowFuncRegex.exec(lineText)) !== null) {
      const name = match[1]
      if (['App', 'Component'].includes(name)) continue
      if (!functionMap.has(name)) functionMap.set(name, [])
      functionMap.get(name).push({ file: f, line: lineIdx + 1, signature: match[0].trim() })
    }
  })
})

const duplicates = []
for (const [name, occurrences] of functionMap.entries()) {
  const uniqueFiles = new Set(occurrences.map(o => o.file))
  if (uniqueFiles.size > 1) {
    duplicates.push({ name, count: uniqueFiles.size, occurrences })
  }
}

duplicates.sort((a, b) => b.count - a.count)

console.log('\n================================================================================')
console.log('📌 2. BİRDEN FAZLA DOSYADA TANIMLANMIŞ FONKSİYONLAR (Tekrar Edenler)')
console.log('================================================================================')

duplicates.forEach(d => {
  console.log(`\n🔹 [${d.name}] (${d.count} farklı dosyada tanımlı):`)
  const seenFiles = new Set()
  d.occurrences.forEach(o => {
    if (!seenFiles.has(o.file)) {
      seenFiles.add(o.file)
      console.log(`   - ${o.file}:${o.line}`)
    }
  })
})

console.log('\n================================================================================')
console.log(`✅ Analiz tamamlandı. Toplam ${duplicates.length} adet mükerrer fonksiyon ve ${largeFiles.length} adet 500+ satırlık dosya listelendi.`)
console.log('================================================================================\n')

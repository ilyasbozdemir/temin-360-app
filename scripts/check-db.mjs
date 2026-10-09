#!/usr/bin/env node
/**
 * Zero-dependency / Readonly SQLite Database Health & Integrity Audit Tool
 * Usage:
 *   node scripts/check-db.mjs <db-yolu> [--out rapor.md]
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

const tablesDir = path.join(rootDir, 'packages', 'database', 'src', 'tables')
const manifestVersionsDir = path.join(rootDir, 'packages', 'database', 'src', 'schema-manifest', 'versions')
const templateRegistryPath = path.join(rootDir, 'packages', 'document-templates', 'src', 'constants', 'template-registry.ts')
const templateConstantsPath = path.join(rootDir, 'packages', 'document-templates', 'src', 'constants', 'template-constants.ts')

async function openReadonlySqlite(dbPath) {
  try {
    const req = createRequire(path.join(rootDir, 'packages', 'database', 'package.json'))
    const BS3 = req('better-sqlite3')
    const db = new BS3(dbPath, { readonly: true, fileMustExist: true })
    return {
      exec: (sql) => db.exec(sql),
      prepare: (sql) => db.prepare(sql),
      pragma: (str) => db.pragma(str),
      close: () => db.close()
    }
  } catch {
    const { DatabaseSync } = await import('node:sqlite')
    const db = new DatabaseSync(dbPath, { readOnly: true })
    return {
      exec: (sql) => db.exec(sql),
      prepare: (sql) => db.prepare(sql),
      pragma: (str) => db.prepare(`PRAGMA ${str}`).all(),
      close: () => db.close()
    }
  }
}

// 1. Parse schema definitions from packages/database/src/tables/*.ts
function extractTableColumnsFromSource(source) {
  const columns = []
  const colRegex = /name:\s*['"]([a-zA-Z0-9_]+)['"]/g
  let match
  const tableNameMatch = source.match(/name:\s*['"]([a-zA-Z0-9_]+)['"]/)
  if (!tableNameMatch) return null
  const tableName = tableNameMatch[1]

  const colsSectionMatch = source.match(/columns:\s*\[([\s\S]*?)\]\s*(?:,|\n|\})/m)
  if (colsSectionMatch) {
    const colsContent = colsSectionMatch[1]
    while ((match = colRegex.exec(colsContent)) !== null) {
      columns.push(match[1])
    }
  }
  return { tableName, columns: new Set(columns) }
}

function getKnownSchema() {
  const schema = {}
  if (!fs.existsSync(tablesDir)) {
    console.error(`[check-db] Tables directory not found: ${tablesDir}`)
    process.exit(1)
  }

  const files = fs.readdirSync(tablesDir).filter((f) => f.endsWith('.ts') && !f.endsWith('.d.ts'))
  for (const file of files) {
    const fullPath = path.join(tablesDir, file)
    const content = fs.readFileSync(fullPath, 'utf8')
    const parsed = extractTableColumnsFromSource(content)
    if (parsed && parsed.tableName) {
      schema[parsed.tableName] = parsed.columns
    }
  }
  return schema
}

// 2. Parse all manifest versions to map which change added which table/column
function loadAllManifestChanges() {
  const manifests = []
  if (!fs.existsSync(manifestVersionsDir)) {
    return { manifests, maxSchemaVersion: 1, columnManifestMap: {}, tableManifestMap: {} }
  }

  function getTsFiles(dir) {
    let results = []
    if (!fs.existsSync(dir)) return results
    const list = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of list) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        results = results.concat(getTsFiles(full))
      } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) {
        results.push(full)
      }
    }
    return results
  }
  const files = getTsFiles(manifestVersionsDir)
  const columnManifestMap = {} // "TableName.colName" -> manifest string
  const tableManifestMap = {} // "TableName" -> manifest string
  let maxSchema = 1

  for (const filePath of files) {
    const file = path.basename(filePath)
    const content = fs.readFileSync(filePath, 'utf8')
    const appMatch = content.match(/app:\s*['"]([^'"]+)['"]/)
    const schemaMaxMatch = content.match(/schema_max:\s*(\d+)/)
    const appVersion = appMatch ? appMatch[1] : file
    const sMax = schemaMaxMatch ? parseInt(schemaMaxMatch[1], 10) : 1
    if (sMax > maxSchema) maxSchema = sMax

    // Extract changes
    const changeBlocks = content.split(/\{\s*schema:/).slice(1)
    const changes = []
    for (const cb of changeBlocks) {
      const sMatch = cb.match(/^\s*(\d+)/)
      const descMatch = cb.match(/description:\s*['"]([^'"]+)['"]/)
      const schemaNum = sMatch ? parseInt(sMatch[1], 10) : sMax
      const desc = descMatch ? descMatch[1] : ''

      // tables_added
      const tablesMatch = cb.match(/tables_added:\s*\[([\s\S]*?)\]/)
      if (tablesMatch) {
        const tNames = tablesMatch[1].match(/['"]([a-zA-Z0-9_]+)['"]/g) || []
        for (const t of tNames) {
          const cleanT = t.replace(/['"]/g, '')
          tableManifestMap[cleanT] = `v${schemaNum} (${appVersion}: ${desc})`
        }
      }

      // columns_added
      const colAddedMatch = cb.match(/columns_added:\s*\[([\s\S]*?)\]/)
      if (colAddedMatch) {
        const colObjRegex = /\{\s*table:\s*['"]([a-zA-Z0-9_]+)['"]\s*,\s*column:\s*['"]([a-zA-Z0-9_]+)['"]\s*\}/g
        let coMatch
        while ((coMatch = colObjRegex.exec(colAddedMatch[1])) !== null) {
          const t = coMatch[1]
          const c = coMatch[2]
          columnManifestMap[`${t}.${c}`] = `v${schemaNum} (${appVersion}: ${desc})`
        }
      }

      changes.push({ schema: schemaNum, description: desc, appVersion })
    }

    manifests.push({ appVersion, sMax, changes })
  }

  return { manifests, maxSchemaVersion: maxSchema, columnManifestMap, tableManifestMap }
}

// 3. Load known template registry IDs and canonical aliases
function loadKnownTemplates() {
  const knownIds = new Set()
  const aliasMap = {}

  if (fs.existsSync(templateRegistryPath)) {
    const content = fs.readFileSync(templateRegistryPath, 'utf8')
    const idMatches = content.match(/id:\s*['"]([a-zA-Z0-9_-]+)['"]/g) || []
    for (const m of idMatches) {
      const id = m.match(/id:\s*['"]([a-zA-Z0-9_-]+)['"]/)[1]
      knownIds.add(id)
    }
  }

  if (fs.existsSync(templateConstantsPath)) {
    const content = fs.readFileSync(templateConstantsPath, 'utf8')
    const aliasRegex = /['"]([a-zA-Z0-9_-]+)['"]\s*:\s*['"]([a-zA-Z0-9_-]+)['"]/g
    let m
    while ((m = aliasRegex.exec(content)) !== null) {
      aliasMap[m[1]] = m[2]
    }
  }

  return { knownIds, aliasMap }
}

function resolveDocumentId(docId, knownTemplates) {
  if (!docId) return null
  const clean = String(docId).trim().toLowerCase()
  if (clean === '*' || clean === 'all') return '*'
  if (knownTemplates.knownIds.has(clean)) return clean
  if (knownTemplates.aliasMap[clean]) return knownTemplates.aliasMap[clean]
  return null
}

async function runAudit(dbPath, reportOutputPath) {
  if (!fs.existsSync(dbPath)) {
    console.error(`\x1b[31m[check-db] HATA: Belirtilen veritabanı dosyası bulunamadı: ${dbPath}\x1b[0m`)
    process.exit(1)
  }

  console.log(`\x1b[36m==================================================================\x1b[0m`)
  console.log(`\x1b[36m   TEMİN 360 — VERİTABANI SAĞLIK VE TUTARLILIK DENETİMİ          \x1b[0m`)
  console.log(`\x1b[36m==================================================================\x1b[0m`)
  console.log(`Hedef DB: \x1b[1m${path.resolve(dbPath)}\x1b[0m (Readonly modda açılıyor)\n`)

  let db
  try {
    db = await openReadonlySqlite(dbPath)
  } catch (err) {
    console.error(`\x1b[31m[check-db] HATA: Veritabanı açılırken hata oluştu: ${err.message}\x1b[0m`)
    process.exit(1)
  }

  const schema = getKnownSchema()
  const { maxSchemaVersion, columnManifestMap, tableManifestMap, manifests } = loadAllManifestChanges()
  const knownTemplates = loadKnownTemplates()

  const findings = {
    critical: [],
    warning: [],
    info: [],
    manifestSuggestions: {
      columns_added: [],
      tables_added: [],
      raw_sql: []
    }
  }

  // -------------------------------------------------------------
  // KONTROL 1: PRAGMA integrity_check & foreign_key_check
  // -------------------------------------------------------------
  try {
    const integrity = db.pragma('integrity_check')
    if (integrity && integrity.length > 0 && integrity[0]?.integrity_check !== 'ok') {
      findings.critical.push({
        title: 'Bozuk Veritabanı Bütünlüğü (integrity_check)',
        detail: integrity.map((r) => r.integrity_check || JSON.stringify(r)).join('; ')
      })
    }
  } catch (e) {
    findings.critical.push({ title: 'integrity_check çalıştırılamadı', detail: e.message })
  }

  try {
    const fkErrors = db.pragma('foreign_key_check')
    if (fkErrors && fkErrors.length > 0) {
      findings.warning.push({
        title: 'Yabancı Anahtar (Foreign Key) Tutarsızlıkları',
        detail: `Toplam ${fkErrors.length} satırda yabancı anahtar ihlali tespit edildi.`,
        samples: fkErrors.slice(0, 5)
      })
    }
  } catch (e) {
    findings.warning.push({ title: 'foreign_key_check çalıştırılamadı', detail: e.message })
  }

  // -------------------------------------------------------------
  // KONTROL 2: settings.dbSchemaVersion ve Bekleyen Migrations
  // -------------------------------------------------------------
  let currentDbVersion = null
  try {
    const row = db.prepare("SELECT value FROM settings WHERE key = 'dbSchemaVersion'").get()
    if (row && row.value) {
      currentDbVersion = parseInt(row.value, 10)
    }
  } catch {}

  if (currentDbVersion === null) {
    findings.warning.push({
      title: 'settings.dbSchemaVersion Tanımsız',
      detail: 'Veritabanında şema sürüm numarası kaydedilmemiş veya settings tablosu eksik.'
    })
  } else if (currentDbVersion < maxSchemaVersion) {
    const pending = []
    for (const m of manifests) {
      for (const ch of m.changes) {
        if (ch.schema > currentDbVersion && ch.schema <= maxSchemaVersion) {
          pending.push(`v${ch.schema} (${m.appVersion}): ${ch.description}`)
        }
      }
    }
    findings.warning.push({
      title: `Bekleyen Şema Göçleri (Mevcut: v${currentDbVersion} -> Hedef: v${maxSchemaVersion})`,
      detail: pending.length > 0 ? pending.join('\n  - ') : 'Şema sürümü geride.'
    })
  }

  // -------------------------------------------------------------
  // KONTROL 3: Tablo ve Sütun Farkları (tables/*.ts vs PRAGMA table_info)
  // -------------------------------------------------------------
  let dbTablesRows = []
  try {
    dbTablesRows = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all()
  } catch {}
  const dbTableNames = new Set(dbTablesRows.map((r) => r.name))

  const missingTables = []
  const missingColumns = []
  const extraColumns = []

  for (const [tableName, expectedCols] of Object.entries(schema)) {
    if (!dbTableNames.has(tableName)) {
      const manifestCoverage = tableManifestMap[tableName] || 'HİÇBİR MANİFESTTE TANIMLI DEĞİL'
      missingTables.push({ table: tableName, manifestCoverage })
      findings.critical.push({
        title: `Eksik Tablo: ${tableName}`,
        detail: `Şemada tanımlı ${tableName} tablosu DB'de bulunamadı. Manifest durumu: ${manifestCoverage}`
      })
      findings.manifestSuggestions.tables_added.push(tableName)
      continue
    }

    const colInfoRows = db.pragma(`table_info("${tableName}")`) || []
    const existingColNames = new Set(colInfoRows.map((r) => r.name))

    for (const col of expectedCols) {
      if (!existingColNames.has(col)) {
        const coverage = columnManifestMap[`${tableName}.${col}`] || 'HİÇBİR MANİFESTTE TANIMLI DEĞİL'
        missingColumns.push({ table: tableName, column: col, coverage })
        findings.critical.push({
          title: `Eksik Sütun: ${tableName}.${col}`,
          detail: `Tabloda ${col} sütunu eksik. Manifest durumu: ${coverage}`
        })
        findings.manifestSuggestions.columns_added.push({ table: tableName, column: col })
      }
    }

    for (const col of existingColNames) {
      if (!expectedCols.has(col)) {
        extraColumns.push({ table: tableName, column: col })
        findings.info.push({
          title: `DB'de Ekstra Sütun: ${tableName}.${col}`,
          detail: 'Bu sütun veritabanında mevcut ancak güncel schema dosyasında tanımlı değil.'
        })
      }
    }
  }

  // -------------------------------------------------------------
  // KONTROL 4: Komisyon ve Belge Kapsamı Veri Sağlığı (DATA_TeminKomisyon & TANIM_KomisyonUye)
  // -------------------------------------------------------------
  const VALID_SCOPES = new Set(['tumu', 'piyasa_arastirma', 'muayene_kabul', 'olur_onay', 'ozel', 'gizli', ''])

  for (const table of ['DATA_TeminKomisyon', 'TANIM_KomisyonUye']) {
    if (!dbTableNames.has(table)) continue

    const colInfo = db.pragma(`table_info("${table}")`) || []
    const hasKapsam = colInfo.some((c) => c.name === 'belge_kapsami')
    const hasGoster = colInfo.some((c) => c.name === 'belgede_goster')
    const hasHedef = colInfo.some((c) => c.name === 'hedef_belgeler')

    if (!hasKapsam || !hasGoster || !hasHedef) {
      findings.warning.push({
        title: `${table} Şema Eksikliği`,
        detail: `${table} tablosunda belge_kapsami, belgede_goster veya hedef_belgeler sütunları bulunmuyor.`
      })
      continue
    }

    const rows = db.prepare(`SELECT * FROM ${table}`).all()

    let invalidScopeCount = 0
    let contradictionCount = 0
    let invalidJsonCount = 0
    let emptyCustomCount = 0
    let unresolvableTargetCount = 0

    for (const r of rows) {
      const scope = (r.belge_kapsami || '').trim().toLowerCase()
      const isShow = r.belgede_goster === 1 || r.belgede_goster === true || r.belgede_goster === '1'

      // 1. Kapsam kontrolü
      if (r.belge_kapsami !== null && !VALID_SCOPES.has(scope)) {
        invalidScopeCount++
      }

      // 2. belgede_goster vs belge_kapsami çelişkisi:
      // Kapsam gizli DEĞİL iken belgede_goster 0 veya null kalmışsa
      if (scope !== 'gizli' && !isShow) {
        contradictionCount++
      }

      // 3. hedef_belgeler JSON doğrulaması
      if (r.hedef_belgeler) {
        try {
          const parsed = JSON.parse(r.hedef_belgeler)
          if (!Array.isArray(parsed)) {
            invalidJsonCount++
          } else {
            if (scope === 'ozel' && parsed.length === 0) {
              emptyCustomCount++
            }
            for (const docId of parsed) {
              const res = resolveDocumentId(docId, knownTemplates)
              if (!res) {
                unresolvableTargetCount++
              }
            }
          }
        } catch {
          invalidJsonCount++
        }
      } else if (scope === 'ozel') {
        emptyCustomCount++
      }
    }

    if (invalidScopeCount > 0) {
      findings.critical.push({
        title: `${table} Geçersiz 'belge_kapsami' Değerleri`,
        detail: `${invalidScopeCount} satırda tanımsız kapsam değeri bulundu.`
      })
      findings.manifestSuggestions.raw_sql.push(
        `UPDATE ${table} SET belge_kapsami = 'tumu' WHERE belge_kapsami NOT IN ('tumu', 'piyasa_arastirma', 'muayene_kabul', 'olur_onay', 'ozel', 'gizli') AND belge_kapsami IS NOT NULL;`
      )
    }

    if (contradictionCount > 0) {
      findings.warning.push({
        title: `${table} Belgede Göster vs Belge Kapsamı Çelişkisi`,
        detail: `${contradictionCount} satırda belge_kapsami != 'gizli' olmasına rağmen belgede_goster = 0 olarak kalmış.`
      })
      findings.manifestSuggestions.raw_sql.push(
        `UPDATE ${table} SET belgede_goster = 1 WHERE (belge_kapsami IS NULL OR belge_kapsami != 'gizli') AND (belgede_goster = 0 OR belgede_goster IS NULL);`
      )
    }

    if (invalidJsonCount > 0) {
      findings.critical.push({
        title: `${table} Bozuk 'hedef_belgeler' JSON Formatı`,
        detail: `${invalidJsonCount} satırda JSON parse edilemedi veya dizi değil.`
      })
      findings.manifestSuggestions.raw_sql.push(
        `UPDATE ${table} SET hedef_belgeler = '["*"]' WHERE hedef_belgeler IS NULL OR hedef_belgeler = '' OR json_valid(hedef_belgeler) = 0;`
      )
    }

    if (emptyCustomCount > 0) {
      findings.warning.push({
        title: `${table} 'ozel' Kapsamda Hedef Belge Boş`,
        detail: `${emptyCustomCount} satırda kapsam 'ozel' seçilmiş ancak hedef_belgeler listesi boş.`
      })
      findings.manifestSuggestions.raw_sql.push(
        `UPDATE ${table} SET belge_kapsami = 'tumu', hedef_belgeler = '["*"]' WHERE belge_kapsami = 'ozel' AND (hedef_belgeler IS NULL OR hedef_belgeler = '[]' OR hedef_belgeler = '');`
      )
    }

    if (unresolvableTargetCount > 0) {
      findings.warning.push({
        title: `${table} Çözümlenemeyen Hedef Belge ID'leri`,
        detail: `${unresolvableTargetCount} adet hedef belge ID'si şablon kayıt defterinde veya alias listesinde bulunamadı.`
      })
    }
  }

  // -------------------------------------------------------------
  // RAPOR ÇIKTISI OLUŞTURMA
  // -------------------------------------------------------------
  const reportLines = []
  reportLines.push(`# TEMİN 360 — Veritabanı Sağlık ve Uyumluluk Raporu`)
  reportLines.push(`**Denetim Tarihi:** ${new Date().toLocaleString('tr-TR')}`)
  reportLines.push(`**Hedef DB Dosyası:** \`${path.resolve(dbPath)}\``)
  reportLines.push(`**DB Şema Sürümü:** ${currentDbVersion !== null ? `v${currentDbVersion}` : 'Tanımsız'}`)
  reportLines.push(`**En Güncel Kod Şema Sürümü:** v${maxSchemaVersion}\n`)

  reportLines.push(`## 1. Özet Tablosu`)
  reportLines.push(`| Kategori | Durum | Sayı |`)
  reportLines.push(`| :--- | :---: | :---: |`)
  reportLines.push(`| **Kritik Hatalar** | ${findings.critical.length === 0 ? '✅ Temiz' : '❌ HATA'} | ${findings.critical.length} |`)
  reportLines.push(`| **Uyarılar / İncelemeler** | ${findings.warning.length === 0 ? '✅ Temiz' : '⚠️ UYARI'} | ${findings.warning.length} |`)
  reportLines.push(`| **Bilgilendirmeler** | ℹ️ BİLGİ | ${findings.info.length} |\n`)

  if (findings.critical.length > 0) {
    reportLines.push(`## 2. Kritik Bulgular (Öncelikli Düzeltilmesi Gerekenler)`)
    findings.critical.forEach((f, idx) => {
      reportLines.push(`### 2.${idx + 1}. ${f.title}`)
      reportLines.push(`- **Açıklama:** ${f.detail}\n`)
    })
  }

  if (findings.warning.length > 0) {
    reportLines.push(`## 3. Uyarılar ve Tutarsızlıklar`)
    findings.warning.forEach((f, idx) => {
      reportLines.push(`### 3.${idx + 1}. ${f.title}`)
      reportLines.push(`- **Açıklama:** ${f.detail}\n`)
    })
  }

  if (findings.info.length > 0) {
    reportLines.push(`## 4. Bilgilendirme Notları`)
    findings.info.forEach((f, idx) => {
      reportLines.push(`- **${f.title}:** ${f.detail}`)
    })
    reportLines.push('')
  }

  reportLines.push(`## 5. Yeni Sürüme Eklenecekler (Manifest & SQL Önerileri)`)
  reportLines.push(`Aşağıdaki bloklar doğrudan yeni sürüm manifestine (\`packages/database/src/schema-manifest/versions/\`) veya migration betiğine eklenebilir:\n`)

  if (findings.manifestSuggestions.tables_added.length > 0) {
    reportLines.push(`### Tablo Eklemeleri (\`tables_added\`):`)
    reportLines.push('```ts')
    reportLines.push(`tables_added: ${JSON.stringify(Array.from(new Set(findings.manifestSuggestions.tables_added)), null, 2)},`)
    reportLines.push('```\n')
  }

  if (findings.manifestSuggestions.columns_added.length > 0) {
    reportLines.push(`### Sütun Eklemeleri (\`columns_added\`):`)
    reportLines.push('```ts')
    reportLines.push(`columns_added: ${JSON.stringify(findings.manifestSuggestions.columns_added, null, 2)},`)
    reportLines.push('```\n')
  }

  if (findings.manifestSuggestions.raw_sql.length > 0) {
    reportLines.push(`### Veri Onarım Komutları (\`raw_sql\`):`)
    reportLines.push('```sql')
    Array.from(new Set(findings.manifestSuggestions.raw_sql)).forEach((sql) => {
      reportLines.push(sql)
    })
    reportLines.push('```\n')
  }

  if (
    findings.manifestSuggestions.tables_added.length === 0 &&
    findings.manifestSuggestions.columns_added.length === 0 &&
    findings.manifestSuggestions.raw_sql.length === 0
  ) {
    reportLines.push(`*Yeni bir şema değişikliği veya SQL düzeltmesi gerekmiyor; veritabanı tamamen uyumlu.*`)
  }

  const reportText = reportLines.join('\n')
  fs.writeFileSync(reportOutputPath, reportText, 'utf8')

  // ASCII Console Output
  console.log(`+----------------------------------------------------------------+`)
  console.log(`|                    DENETİM SONUÇ ÖZETİ                         |`)
  console.log(`+----------------------------------------------------------------+`)
  console.log(`| Kritik Hatalar     : ${findings.critical.length > 0 ? `\x1b[31m${findings.critical.length} adet (Eksik tablo/sütun veya bozuk JSON)\x1b[0m` : `\x1b[32m0 (Temiz)\x1b[0m`}`)
  console.log(`| Uyarılar           : ${findings.warning.length > 0 ? `\x1b[33m${findings.warning.length} adet (Çelişkili veri veya bekleyen göç)\x1b[0m` : `\x1b[32m0 (Temiz)\x1b[0m`}`)
  console.log(`| Bilgi Kayıtları    : ${findings.info.length} adet`)
  console.log(`+----------------------------------------------------------------+`)
  console.log(`\nRapor oluşturuldu: \x1b[32m${reportOutputPath}\x1b[0m\n`)

  const hasIssues = findings.critical.length > 0 || findings.warning.length > 0
  if (hasIssues) {
    console.log(`\x1b[33m>> İnceleme tamamlandı: Bazı maddeler karar veya düzeltme bekliyor.\x1b[0m`)
    process.exit(1)
  } else {
    console.log(`\x1b[32m✔ Veritabanı sağlık kontrolünden başarıyla geçti!\x1b[0m`)
    process.exit(0)
  }
}

function main() {
  const args = process.argv.slice(2)
  if (args.length === 0 || args[0].startsWith('--')) {
    console.log(`Kullanım: node scripts/check-db.mjs <db-yolu> [--out rapor.md]`)
    process.exit(1)
  }

  const dbPath = args[0]
  let reportPath = path.join(rootDir, 'rapor.md')
  const outIdx = args.indexOf('--out')
  if (outIdx !== -1 && args[outIdx + 1]) {
    reportPath = path.resolve(args[outIdx + 1])
  }

  runAudit(dbPath, reportPath)
}

main()

#!/usr/bin/env node
/**
 * Zero-dependency SQL References & Schema Audit Tool
 * Usage:
 *   node scripts/check-sql-refs.mjs
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

const tablesDir = path.join(rootDir, 'packages', 'database', 'src', 'tables')

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
    console.error(`Tables directory not found: ${tablesDir}`)
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

function getAllSourceFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (
        entry.name === 'node_modules' ||
        entry.name === 'dist' ||
        entry.name === '.git' ||
        entry.name === 'out' ||
        entry.name === '.system_generated'
      ) {
        continue
      }
      getAllSourceFiles(fullPath, fileList)
    } else if (
      entry.isFile() &&
      (entry.name.endsWith('.ts') ||
        entry.name.endsWith('.tsx') ||
        entry.name.endsWith('.js') ||
        entry.name.endsWith('.mjs'))
    ) {
      fileList.push(fullPath)
    }
  }
  return fileList
}

function parseSqlReferences(sqlText, schema) {
  const issues = []
  const cleanSql = sqlText.replace(/--.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, ' ')

  // 1. Resolve table aliases: FROM <Table> <alias>, JOIN <Table> <alias>
  const aliasMap = {} // alias -> TableName
  const tableRefRegex = /(?:FROM|JOIN|INTO|UPDATE)\s+([a-zA-Z0-9_]+)(?:\s+(?:AS\s+)?([a-zA-Z0-9_]+))?/gi
  let match
  while ((match = tableRefRegex.exec(cleanSql)) !== null) {
    const rawTable = match[1]
    const alias = match[2]
    const matchedTable = Object.keys(schema).find(
      (t) => t.toLowerCase() === rawTable.toLowerCase()
    )
    if (matchedTable) {
      aliasMap[matchedTable.toLowerCase()] = matchedTable
      if (alias) {
        const lowerAlias = alias.toLowerCase()
        if (
          !['where', 'join', 'left', 'right', 'inner', 'outer', 'on', 'group', 'order', 'limit', 'set', 'values'].includes(
            lowerAlias
          )
        ) {
          aliasMap[lowerAlias] = matchedTable
        }
      }
    }
  }

  // 2. Find all alias.column or table.column references
  const colRefRegex = /\b([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)\b/g
  while ((match = colRefRegex.exec(cleanSql)) !== null) {
    const prefix = match[1].toLowerCase()
    const colName = match[2]

    if (prefix === 'window' || prefix === 'electron' || prefix === 'ipcRenderer' || prefix === 'console') {
      continue
    }

    const targetTable = aliasMap[prefix]
    if (targetTable && schema[targetTable]) {
      const tableCols = schema[targetTable]
      if (colName !== '*' && !tableCols.has(colName)) {
        // Special internal/virtual columns in SQLite
        if (['rowid', 'oid', '_rowid_'].includes(colName.toLowerCase())) {
          continue
        }
        issues.push({
          type: 'COLUMN_NOT_FOUND',
          table: targetTable,
          column: colName,
          prefix: match[1],
          confidence: 'high'
        })
      }
    }
  }

  // 3. Single table queries: SELECT col1, col2 FROM TableName WHERE col3 = ...
  if (Object.keys(aliasMap).length === 1) {
    const singleTable = Object.values(aliasMap)[0]
    const tableCols = schema[singleTable]
    if (tableCols) {
      const selectMatch = cleanSql.match(/SELECT\s+([\s\S]*?)\s+FROM/i)
      if (selectMatch) {
        const selectCols = selectMatch[1].split(',')
        for (let colStr of selectCols) {
          colStr = colStr.trim().replace(/AS\s+[a-zA-Z0-9_]+/i, '').trim()
          colStr = colStr.replace(/COALESCE\s*\(/i, '').replace(/NULLIF\s*\(/i, '')
          const simpleColMatch = colStr.match(/^([a-zA-Z0-9_]+)$/)
          if (simpleColMatch) {
            const col = simpleColMatch[1]
            if (
              !tableCols.has(col) &&
              col !== '*' &&
              !['count', 'max', 'min', 'sum', 'avg', 'distinct'].includes(col.toLowerCase()) &&
              !['rowid', 'oid', '_rowid_'].includes(col.toLowerCase())
            ) {
              issues.push({
                type: 'SINGLE_TABLE_COLUMN_NOT_FOUND',
                table: singleTable,
                column: col,
                confidence: 'medium'
              })
            }
          }
        }
      }
    }
  }

  return issues
}

function auditFile(filePath, schema) {
  const content = fs.readFileSync(filePath, 'utf8')
  const lines = content.split('\n')
  const findings = []

  // A. Scan for string templates containing SELECT / INSERT / UPDATE / DELETE
  const sqlStringRegex = /(`[\s\S]*?`|'[\s\S]*?'|"[\s\S]*?")/g
  let match
  while ((match = sqlStringRegex.exec(content)) !== null) {
    const rawStr = match[1]
    if (
      (rawStr.includes('SELECT') ||
        rawStr.includes('select') ||
        rawStr.includes('INSERT INTO') ||
        rawStr.includes('UPDATE ') ||
        rawStr.includes('DELETE FROM')) &&
      (rawStr.includes('DATA_') || rawStr.includes('TANIM_') || rawStr.includes('LOG_') || rawStr.includes('settings'))
    ) {
      const index = match.index
      const lineNumber = content.substring(0, index).split('\n').length
      const cleanSql = rawStr.slice(1, -1)
      const issues = parseSqlReferences(cleanSql, schema)
      for (const iss of issues) {
        findings.push({
          file: path.relative(rootDir, filePath),
          line: lineNumber,
          ...iss,
          snippet: lines[lineNumber - 1]?.trim() || ''
        })
      }
    }
  }

  // B. Scan for mapping rules: tablo: '...', sutun: '...'
  const mappingRegex = /tablo:\s*['"]([a-zA-Z0-9_]+)['"]\s*,\s*sutun:\s*['"]([a-zA-Z0-9_]+)['"]/g
  while ((match = mappingRegex.exec(content)) !== null) {
    const table = match[1]
    const column = match[2]
    const index = match.index
    const lineNumber = content.substring(0, index).split('\n').length

    if (schema[table] && column !== '*') {
      if (!schema[table].has(column)) {
        findings.push({
          file: path.relative(rootDir, filePath),
          line: lineNumber,
          type: 'MAPPING_COLUMN_NOT_FOUND',
          table,
          column,
          confidence: 'high',
          snippet: lines[lineNumber - 1]?.trim() || ''
        })
      }
    }
  }

  // C. Scan for iliskiliTablo: '...', iliskiliSutun: '...'
  const relMappingRegex = /iliskiliTablo:\s*['"]([a-zA-Z0-9_]+)['"]\s*,\s*iliskiliSutun:\s*['"]([a-zA-Z0-9_]+)['"]/g
  while ((match = relMappingRegex.exec(content)) !== null) {
    const table = match[1]
    const column = match[2]
    const index = match.index
    const lineNumber = content.substring(0, index).split('\n').length

    if (schema[table] && column !== '*') {
      if (!schema[table].has(column)) {
        findings.push({
          file: path.relative(rootDir, filePath),
          line: lineNumber,
          type: 'MAPPING_REL_COLUMN_NOT_FOUND',
          table,
          column,
          confidence: 'high',
          snippet: lines[lineNumber - 1]?.trim() || ''
        })
      }
    }
  }

  return findings
}

function main() {
  console.log('\x1b[36m=== SQL REFERANS VE ŞEMA DENETİMİ (check-sql-refs) ===\x1b[0m\n')
  const schema = getKnownSchema()
  console.log(`[+] Yüklenen Tablo Sayısı: ${Object.keys(schema).length}`)

  const targetDirs = [
    path.join(rootDir, 'apps', 'app-desktop', 'src'),
    path.join(rootDir, 'packages', 'document-templates', 'src'),
    path.join(rootDir, 'packages', 'database', 'src')
  ]

  let allFiles = []
  for (const d of targetDirs) {
    allFiles = allFiles.concat(getAllSourceFiles(d))
  }
  console.log(`[+] Taranan Kaynak Dosya Sayısı: ${allFiles.length}\n`)

  const allFindings = []
  for (const file of allFiles) {
    const findings = auditFile(file, schema)
    allFindings.push(...findings)
  }

  // Deduplicate findings by file:line:table:column
  const uniqueMap = new Map()
  for (const f of allFindings) {
    const key = `${f.file}:${f.line}:${f.table}:${f.column}`
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, f)
    }
  }
  const uniqueFindings = Array.from(uniqueMap.values())

  if (uniqueFindings.length === 0) {
    console.log('\x1b[32m✔ Tebrikler! Şemada bulunmayan hiçbir SQL sütun referansı tespit edilmedi.\x1b[0m')
    process.exit(0)
  }

  console.log(`\x1b[33mToplam ${uniqueFindings.length} potansiyel referans uyuşmazlığı bulundu:\x1b[0m\n`)

  const highConfidence = uniqueFindings.filter((f) => f.confidence === 'high')
  const mediumConfidence = uniqueFindings.filter((f) => f.confidence !== 'high')

  if (highConfidence.length > 0) {
    console.log('\x1b[31m--- [HATA / YÜKSEK ÖNEMLİ BULGULAR] ---\x1b[0m')
    for (const item of highConfidence) {
      console.log(
        `\x1b[31m✖\x1b[0m ${item.file}:${item.line} -> \x1b[1m${item.table}.${item.column}\x1b[0m şemada tanımlı değil!`
      )
      if (item.snippet) {
        console.log(`   \x1b[90m${item.snippet}\x1b[0m`)
      }
    }
    console.log('')
  }

  if (mediumConfidence.length > 0) {
    console.log('\x1b[33m--- [UYARI / EMİN DEĞİLİM / İNCELEME GEREKİR] ---\x1b[0m')
    for (const item of mediumConfidence) {
      console.log(
        `\x1b[33m?\x1b[0m ${item.file}:${item.line} -> ${item.table}.${item.column} (Tek tablolu sorgu çıkarımı)`
      )
      if (item.snippet) {
        console.log(`   \x1b[90m${item.snippet}\x1b[0m`)
      }
    }
    console.log('')
  }

  console.log(`\x1b[36mÖzet: ${highConfidence.length} kesin uyuşmazlık, ${mediumConfidence.length} şüpheli referans.\x1b[0m`)
}

main()

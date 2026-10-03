#!/usr/bin/env node
/**
 * Zero-dependency Schema Integrity & Manifest Consistency Checker
 * Usage:
 *   node scripts/check-schema.mjs        # Check schema consistency against snapshot
 *   node scripts/check-schema.mjs --fix  # Update snapshot to match current tables
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

const tablesDir = path.join(rootDir, 'packages', 'database', 'src', 'tables')
const snapshotPath = path.join(rootDir, 'packages', 'database', 'schema-snapshot.json')

function extractTableColumnsFromSource(source) {
  const columns = []
  // Matches name: 'column_name' inside columns: [...]
  const colRegex = /name:\s*['"]([a-zA-Z0-9_]+)['"]/g
  let match
  // First extract table name
  let tableNameMatch = source.match(/name:\s*['"]([a-zA-Z0-9_]+)['"]/)
  if (!tableNameMatch) return null
  const tableName = tableNameMatch[1]

  // Extract columns array section
  const colsSectionMatch = source.match(/columns:\s*\[([\s\S]*?)\]\s*(?:,|\n|\})/m)
  if (colsSectionMatch) {
    const colsContent = colsSectionMatch[1]
    while ((match = colRegex.exec(colsContent)) !== null) {
      columns.push(match[1])
    }
  }
  return { tableName, columns: Array.from(new Set(columns)).sort() }
}

function getCurrentTablesSchema() {
  const currentTables = {}
  if (!fs.existsSync(tablesDir)) {
    console.error(`[check-schema] Tables directory not found: ${tablesDir}`)
    process.exit(1)
  }

  const files = fs.readdirSync(tablesDir).filter((f) => f.endsWith('.ts') && !f.endsWith('.d.ts'))
  for (const file of files) {
    const fullPath = path.join(tablesDir, file)
    const content = fs.readFileSync(fullPath, 'utf8')
    const parsed = extractTableColumnsFromSource(content)
    if (parsed && parsed.tableName) {
      currentTables[parsed.tableName] = parsed.columns
    }
  }
  return currentTables
}

function main() {
  const isFix = process.argv.includes('--fix')
  const currentTables = getCurrentTablesSchema()

  if (!fs.existsSync(snapshotPath)) {
    if (isFix) {
      const newSnapshot = {
        schema: 36,
        tables: currentTables
      }
      fs.writeFileSync(snapshotPath, JSON.stringify(newSnapshot, null, 2) + '\n', 'utf8')
      console.log(`\x1b[32m✔ [check-schema] Created initial schema snapshot at ${snapshotPath}\x1b[0m`)
      process.exit(0)
    } else {
      console.error(`\x1b[31m✖ [check-schema] Snapshot file does not exist. Run with --fix to generate it.\x1b[0m`)
      process.exit(1)
    }
  }

  const snapshotContent = fs.readFileSync(snapshotPath, 'utf8')
  let snapshot
  try {
    snapshot = JSON.parse(snapshotContent)
  } catch (e) {
    console.error(`\x1b[31m✖ [check-schema] Failed to parse schema-snapshot.json: ${e.message}\x1b[0m`)
    process.exit(1)
  }

  const snapshotTables = snapshot.tables || {}
  const diffs = []

  // Check for missing or altered tables
  for (const [table, cols] of Object.entries(currentTables)) {
    if (!snapshotTables[table]) {
      diffs.push(`+ Yeni Tablo: ${table}`)
    } else {
      const snapCols = new Set(snapshotTables[table])
      const curCols = new Set(cols)

      for (const col of cols) {
        if (!snapCols.has(col)) {
          diffs.push(`+ ${table}.${col} (Yeni sütun)`)
        }
      }
      for (const col of snapshotTables[table]) {
        if (!curCols.has(col)) {
          diffs.push(`- ${table}.${col} (Silinen sütun)`)
        }
      }
    }
  }

  for (const table of Object.keys(snapshotTables)) {
    if (!currentTables[table]) {
      diffs.push(`- Silinen Tablo: ${table}`)
    }
  }

  if (diffs.length === 0) {
    console.log(`\x1b[32m✔ [check-schema] Şema ve snapshot tamamen tutarlı (${Object.keys(currentTables).length} tablo doğrulandı).\x1b[0m`)
    process.exit(0)
  }

  if (isFix) {
    snapshot.tables = currentTables
    fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2) + '\n', 'utf8')
    console.log(`\x1b[33m⚡ [check-schema] Snapshot güncellendi:\x1b[0m`)
    diffs.forEach((d) => console.log(`   ${d}`))
    console.log(`\x1b[32m✔ [check-schema] Başarıyla eşitlendi.\x1b[0m`)
    process.exit(0)
  } else {
    console.error(`\x1b[31m✖ [check-schema] Şema uyuşmazlığı tespit edildi:\x1b[0m`)
    diffs.forEach((d) => console.error(`   ${d}`))
    console.error(`\x1b[33m>> Şemayı onaylamak için 'node scripts/check-schema.mjs --fix' çalıştırın.\x1b[0m`)
    process.exit(1)
  }
}

main()

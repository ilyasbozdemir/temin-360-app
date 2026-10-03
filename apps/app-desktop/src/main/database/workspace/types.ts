import crypto from 'crypto'
import Database from 'better-sqlite3'
import { TABLE_FRIENDLY_NAMES } from '../../../shared/constants/databaseConstants'

export interface WorkspaceMeta {
  dtal_version: string
  app_version: string
  created_at: string
  institution: string
  schema_version: number
  platform: string
  file_version: number
  active_db_file?: string
  updated_at?: string
  integrity_hash?: string
  warnings?: string[]
}

export interface MutationSummaryItem {
  tableName: string
  title: string
  action: 'insert' | 'update' | 'delete' | 'other'
  actionLabel: string
  count: number
  lastTime: string
}

export { TABLE_FRIENDLY_NAMES }

export function calculateIntegrityHash(meta: Partial<WorkspaceMeta>): string {
  const payload = {
    dtal_version: meta.dtal_version,
    app_version: meta.app_version,
    schema_version: meta.schema_version,
    created_at: meta.created_at,
    institution: meta.institution,
    platform: meta.platform
  }
  return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex')
}

export function normalizeMeta(raw: any): WorkspaceMeta {
  return {
    dtal_version: raw.dtal_version || raw.dtm_version || '1.0',
    app_version: raw.app_version || raw.version || '1.0.0',
    created_at:
      raw.created_at ||
      (raw.createdAt ? raw.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]),
    institution: raw.institution || raw.institutionName || 'Bilinmeyen Kurum',
    schema_version: parseInt(raw.schema_version || raw.schemaVersion || '1', 10) || 1,
    platform: raw.platform || process.platform,
    file_version: raw.file_version || parseInt(raw.fileVersion || '1', 10) || 1,
    active_db_file: raw.active_db_file || 'database.sqlite',
    updated_at: raw.updated_at || raw.updatedAt || new Date().toISOString(),
    integrity_hash: raw.integrity_hash,
    warnings: []
  }
}

export function extractTableAndAction(sql: string): {
  tableName: string
  action: 'insert' | 'update' | 'delete' | 'other'
} {
  if (!sql || typeof sql !== 'string') return { tableName: 'Veritabanı', action: 'other' }
  const clean = sql.trim().replace(/\s+/g, ' ')
  const upper = clean.toUpperCase()
  let action: 'insert' | 'update' | 'delete' | 'other' = 'other'

  if (upper.startsWith('INSERT')) action = 'insert'
  else if (upper.startsWith('UPDATE')) action = 'update'
  else if (upper.startsWith('DELETE')) action = 'delete'

  let tableName = 'Veritabanı'
  const match = clean.match(
    /(?:FROM|INTO|UPDATE)\s+(?:["`'\[]?[A-Za-z0-9_]+["`'\]]?\.)?["`'\[]?([A-Za-z0-9_]+)["`'\]]?/i
  )
  if (match && match[1]) {
    tableName = match[1]
  }
  return { tableName, action }
}

export function extractDbInfo(
  sqliteFilePath: string,
  fallbackName: string
): { schemaVersion: number; institutionName: string } {
  let schemaVersion = 1
  let institutionName = fallbackName
  try {
    const tempDb = new Database(sqliteFilePath, { readonly: true })
    try {
      const row = tempDb
        .prepare("SELECT value FROM settings WHERE key = 'dbSchemaVersion'")
        .get() as { value: string } | undefined
      if (row?.value) {
        const parsed = parseInt(row.value, 10)
        if (!isNaN(parsed) && parsed > 0) {
          schemaVersion = parsed
        }
      } else {
        const migRow = tempDb
          .prepare('SELECT MAX(version) as max_v FROM schema_migrations')
          .get() as { max_v: number } | undefined
        if (migRow?.max_v && migRow.max_v > 0) {
          schemaVersion = migRow.max_v
        }
      }
    } catch {
      // settings / schema_migrations tablosu yoksa varsayilan 1
    }

    try {
      const instRow = tempDb
        .prepare("SELECT value FROM settings WHERE key = 'institutionName'")
        .get() as { value: string } | undefined
      if (instRow?.value && instRow.value.trim()) {
        institutionName = instRow.value.trim()
      }
    } catch {
      // institutionName yoksa dosya adi
    }

    tempDb.close()
  } catch (e) {
    console.warn('[Workspace] DB bilgileri okunurken uyari:', e)
  }
  return { schemaVersion, institutionName }
}

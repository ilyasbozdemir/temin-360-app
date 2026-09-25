/* eslint-disable */
import Database from 'better-sqlite3'
import { manifests } from './schema-manifest/index'

export interface SchemaChange {
  schema: number
  type: string
  description: string
  tables_added?: string[]
  columns_added?: { table: string; column: string }[]
  raw_sql?: string[]
}

export interface AppVersionManifest {
  app: string
  schema_min: number
  schema_max: number
  release_date: string
  changes: SchemaChange[]
}

export function getMaxSchemaVersion(): number {
  if (!manifests || manifests.length === 0) return 1
  return Math.max(...manifests.map((m) => m.schema_max || 0), 1)
}

export function getCurrentAppManifest(): AppVersionManifest {
  if (!manifests || manifests.length === 0) {
    return {
      app: '1.0.0',
      schema_min: 1,
      schema_max: 1,
      release_date: new Date().toISOString().split('T')[0],
      changes: []
    }
  }
  return manifests[manifests.length - 1]
}

export const CURRENT_SCHEMA_MAX = getMaxSchemaVersion()
export const CURRENT_SCHEMA_VERSION = CURRENT_SCHEMA_MAX

export interface PendingMigrationInfo {
  schema: number
  description: string
}

export function getPendingMigrations(fromVersion: number): PendingMigrationInfo[] {
  const maxSchema = getMaxSchemaVersion()
  const pending: PendingMigrationInfo[] = []
  if (fromVersion >= maxSchema) return pending

  const allChanges: SchemaChange[] = []
  for (const v of manifests) {
    if (v.changes) {
      for (const change of v.changes) {
        if (!allChanges.find((c) => c.schema === change.schema)) {
          allChanges.push(change)
        }
      }
    }
  }
  allChanges.sort((a, b) => a.schema - b.schema)

  for (const change of allChanges) {
    if (change.schema > fromVersion && change.schema <= maxSchema) {
      pending.push({
        schema: change.schema,
        description: change.description
      })
    }
  }
  return pending
}

export function runMigrations(db: Database.Database, fromVersion: number, dbSchemaDef: any): void {
  const MAX_SCHEMA = getMaxSchemaVersion()
  if (fromVersion >= MAX_SCHEMA) return

  const allChanges: SchemaChange[] = []
  for (const v of manifests) {
    if (v.changes) {
      for (const change of v.changes) {
        if (!allChanges.find((c) => c.schema === change.schema)) {
          allChanges.push(change)
        }
      }
    }
  }
  allChanges.sort((a, b) => a.schema - b.schema)

  const pendingChanges = allChanges.filter((c) => c.schema > fromVersion && c.schema <= MAX_SCHEMA)

  if (pendingChanges.length === 0) return

  console.log(`v${fromVersion} sürümünden v${MAX_SCHEMA} sürümüne veritabanı göçü başlatılıyor...`)

  db.exec('CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT);')
  db.exec('CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL);')

  const executeMigrationsTransaction = db.transaction(() => {
    for (const change of pendingChanges) {
      console.log(`[Migration v${change.schema}] ${change.description} çalıştırılıyor...`)
      try {
        if (change.tables_added && change.tables_added.length > 0) {
          for (const tableName of change.tables_added) {
            const tableDef = dbSchemaDef?.tables?.find((t: any) => t.name === tableName)
            if (!tableDef) {
              console.warn(`Tablo tanımı bulunamadı: ${tableName}`)
              continue
            }

            const columnsSql = tableDef.columns
              .map((col: any) => {
                let colDef = '"' + col.name + '" ' + col.type
                if (col.primaryKey) colDef += ' PRIMARY KEY'
                if (col.autoIncrement) colDef += ' AUTOINCREMENT'
                if (col.unique) colDef += ' UNIQUE'
                if (col.notNull) colDef += ' NOT NULL'
                if (col.default !== undefined) {
                  colDef +=
                    ' DEFAULT ' + (typeof col.default === 'string' ? col.default : col.default)
                }
                return colDef
              })
              .join(', ')

            const constraintsSql = (tableDef as any).constraints
              ? ', ' + (tableDef as any).constraints.join(', ')
              : ''
            db.exec(`CREATE TABLE IF NOT EXISTS ${tableName} (${columnsSql}${constraintsSql});`)

            if (tableDef.initialData && tableDef.initialData.length > 0) {
              tableDef.initialData.forEach((row: any) => {
                const keys = Object.keys(row)
                const values = Object.values(row).map((v) =>
                  typeof v === 'string' ? "'" + v.replace(/'/g, "''") + "'" : v
                )
                db.exec(
                  `INSERT OR IGNORE INTO ${tableName} (${keys.join(', ')}) VALUES (${values.join(
                    ', '
                  )});`
                )
              })
            }
          }
        }

        if (change.columns_added && change.columns_added.length > 0) {
          for (const colAdd of change.columns_added) {
            const tableDef = dbSchemaDef?.tables?.find((t: any) => t.name === colAdd.table)
            if (!tableDef) {
              console.warn(`Tablo tanımı bulunamadı: ${colAdd.table}`)
              continue
            }
            const colDef = tableDef.columns?.find((c: any) => c.name === colAdd.column)
            if (!colDef) {
              console.warn(`Kolon tanımı bulunamadı: ${colAdd.table}.${colAdd.column}`)
              continue
            }

            let sqlDef = '"' + colDef.name + '" ' + colDef.type
            const d = (colDef as any).default
            if (d !== undefined) {
              if (typeof d === 'string') {
                const upper = d.trim().toUpperCase()
                if (
                  upper === 'CURRENT_TIMESTAMP' ||
                  upper === 'CURRENT_DATE' ||
                  upper === 'CURRENT_TIME'
                ) {
                  // SQLite ALTER TABLE ADD COLUMN does NOT allow non-constant defaults like CURRENT_TIMESTAMP
                } else if (d.startsWith("'") || d.startsWith('"')) {
                  sqlDef += ' DEFAULT ' + d
                } else {
                  sqlDef += " DEFAULT '" + d.replace(/'/g, "''") + "'"
                }
              } else {
                sqlDef += ' DEFAULT ' + d
              }
            }

            try {
              db.exec(`ALTER TABLE ${colAdd.table} ADD COLUMN ${sqlDef};`)
            } catch (err: any) {
              if (err.message && (err.message.includes('duplicate column') || err.message.includes('already exists'))) {
                console.log(`Column ${colAdd.table}.${colAdd.column} already exists, skipping.`)
              } else {
                console.warn(`ALTER TABLE ${colAdd.table} ADD COLUMN ${sqlDef} warning:`, err.message)
              }
            }
          }
        }

        if (change.raw_sql && change.raw_sql.length > 0) {
          for (const sql of change.raw_sql) {
            try {
              db.exec(sql)
            } catch (err: any) {
              console.warn(`Raw SQL error in migration v${change.schema}:`, err.message)
            }
          }
        }

        db.prepare(
          "INSERT OR REPLACE INTO settings (key, value) VALUES ('dbSchemaVersion', ?);"
        ).run(change.schema.toString())

        try {
          db.prepare(
            "INSERT OR REPLACE INTO schema_migrations (version, applied_at) VALUES (?, datetime('now'));"
          ).run(change.schema)
        } catch {}
      } catch (error: any) {
        throw new Error(
          `[Sürüm ${change.schema} - ${change.description}] adımı sırasında hata oluştu: ${error.message}`
        )
      }
    }
  })

  try {
    executeMigrationsTransaction()
  } catch (error: any) {
    throw error
  }
  console.log('Tüm veritabanı göç adımları başarıyla tamamlandı.')
}

/**
 * Utility higher-order function to wrap SQLite database queries/executions.
 * If a "no such column" or missing table error is encountered, it triggers schema auto-repair and retries.
 */
import { schema } from '@dt/database'

let repairInFlight: Promise<void> | null = null

const knownColumns = new Set<string>()
try {
  schema.tables.forEach((t: any) => {
    t.columns.forEach((c: any) => {
      if (c && c.name) {
        knownColumns.add(String(c.name).toLowerCase())
      }
    })
  })
} catch {}

function extractMissingColumn(error: any): string | null {
  const msg = String(error?.message || error || '')
  // "no such column: d.aktif_mi"  ->  aktif_mi
  let m = msg.match(/no such column:\s*(?:\w+\.)?(\w+)/i)
  if (m) return m[1]
  // "table X has no column named Y"  ->  Y
  m = msg.match(/has no column named\s+(\w+)/i)
  return m ? m[1] : null
}

function isSchemaError(error: any): boolean {
  const errorMsg = String(error?.message || error || '')
  return (
    errorMsg.includes('no such column') ||
    errorMsg.includes('no such table') ||
    errorMsg.includes('has no column named')
  )
}

export async function withSchemaRetry<T>(
  fn: () => Promise<T>,
  repairSchema?: () => Promise<void>,
  sqlQuery?: string
): Promise<T> {
  try {
    return await fn()
  } catch (error: any) {
    if (!isSchemaError(error)) {
      throw error
    }

    if (!repairSchema) {
      // If no repair function is supplied, do not execute fn() a second time.
      throw error
    }

   const col = extractMissingColumn(error)
    if (col && knownColumns && !knownColumns.has(col)) {
      console.error(
        `\x1b[1;41;37m [KOD HATASI] \x1b[0m Sutun semada tanimli degil: "${col}"\n` +
        `>> SQL: ${sqlQuery || 'Bilinmiyor'}\n` +
        `>> Onarim calistirilmadi; sorgudaki sutun adini duzeltin.`
      )
      throw error
    }
    
    // ANSI Color formatting with clean cross-platform ASCII delimiters for console visibility
    console.error(
      `\x1b[1;31m===========================================================================\x1b[0m\n` +
      `\x1b[1;41;37m [SEMA UYARISI / EKSIK SUTUN VEYA TABLO TESPIT EDILDI] \x1b[0m\n` +
      `\x1b[1;31m>> HATA DETAYI : \x1b[0m\x1b[31m${error?.message || error}\x1b[0m\n` +
      `\x1b[1;33m>> CALISAN SQL : \x1b[0m\x1b[33m${sqlQuery || 'Bilinmiyor'}\x1b[0m\n` +
      `\x1b[1;36m>> Sema otomatik onarim (schema auto-repair) devreye aliniyor...\x1b[0m\n` +
      `\x1b[1;31m===========================================================================\x1b[0m`
    )

    // Reuse in-flight repair promise to prevent race conditions during concurrent queries
    if (!repairInFlight) {
      repairInFlight = repairSchema().finally(() => {
        repairInFlight = null
      })
    }

    try {
      await repairInFlight
    } catch (repairErr: any) {
      console.error('[schemaRetry] Schema repair failed:', repairErr)
      throw new Error(`[schemaRetry] Schema repair failed: ${repairErr?.message || repairErr}`, {
        cause: repairErr
      })
    }

    // Retry once after successful schema repair
    return await fn()
  }
}

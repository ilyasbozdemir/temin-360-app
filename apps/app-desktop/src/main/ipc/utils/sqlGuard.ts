/**
 * SQL Security Guard for validating IPC SQL queries.
 * Prevents multi-statement injections, mass unparameterized modifications,
 * and raw SQL exfiltration of sensitive key-value tables (settings / TANIM_Ayar).
 */

const RESTRICTED_TABLES = ['SETTINGS', 'TANIM_AYAR']

export function validateSqlQuery(sql: string, _params: any[] = []): void {
  const cleanSql = sql.trim()

  // 1. Check for multi-statement injection (e.g. SELECT 1; DELETE FROM tutanaklar)
  // Strip quoted strings first to prevent false positives on semicolons inside string literals
  const strippedSql = cleanSql.replace(/'[^']*'/g, "''").replace(/"[^"]*"/g, '""')
  const statements = strippedSql.split(';').filter((stmt) => stmt.trim().length > 0)
  if (statements.length > 1) {
    throw new Error('[sqlGuard] Multi-statement SQL injection detected and blocked.')
  }

  // 2. Reject destructive DDL statements (DROP, TRUNCATE, ALTER)
  if (/\b(DROP|TRUNCATE|ALTER)\s+TABLE\b/i.test(cleanSql)) {
    throw new Error(
      '[sqlGuard] Destructive DDL operations (DROP/TRUNCATE/ALTER) are prohibited via IPC.'
    )
  }

  // 3. Reject mass DELETE / UPDATE without WHERE clause (whitespace-resilient regex)
  if (/^\s*DELETE\s+FROM/i.test(cleanSql) && !/\sWHERE\s/i.test(cleanSql)) {
    throw new Error('[sqlGuard] Unparameterized mass DELETE without WHERE clause is prohibited.')
  }
  if (/^\s*UPDATE\s+/i.test(cleanSql) && !/\sWHERE\s/i.test(cleanSql)) {
    throw new Error('[sqlGuard] Unparameterized mass UPDATE without WHERE clause is prohibited.')
  }

  // 4. Default-Deny rule for restricted key-value tables (settings / TANIM_Ayar)
  // General db:query / db:run channels must NOT directly execute raw SQL on settings.
  // Named handlers (db:get-settings, db:save-settings) must be used.
  const containsRestrictedTable = RESTRICTED_TABLES.some((table) =>
    new RegExp(`\\b${table}\\b`, 'i').test(cleanSql)
  )

  if (containsRestrictedTable) {
    throw new Error(
      '[sqlGuard] Direct raw SQL query on settings/TANIM_Ayar table is restricted. ' +
        'Use dedicated named handlers (e.g. db:get-settings, db:save-settings) instead.'
    )
  }
}

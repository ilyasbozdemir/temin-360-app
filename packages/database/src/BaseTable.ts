import { auditColumns, auditColumnsNoRef } from './audit'

/**
 * Tablo tanımına standart audit (denetim) kolonlarını otomatik enjekte eden tablo fabrikası.
 * @param schema - Ham tablo şeması tanımı.
 * @returns Audit kolonları eklenmiş güncel tablo şeması.
 */
export const defineTable = (schema: any): any => {
  if (!schema || !schema.columns) return schema
  // 1. Audit istenmiyorsa (hasAudit: false) direkt dön
  if (schema.hasAudit === false) return schema

  // 2. Kolon listesini al
  const baseAuditCols = schema.name === 'TANIM_Personel' ? auditColumnsNoRef : auditColumns

  const existingColNames = new Set((schema.columns || []).map((c: any) => c.name?.toLowerCase()))
  const columnsToAdd = baseAuditCols.filter(
    (auditCol: any) => !existingColNames.has(auditCol.name.toLowerCase())
  )

  return {
    ...schema,
    columns: [...schema.columns, ...columnsToAdd]
  }
}



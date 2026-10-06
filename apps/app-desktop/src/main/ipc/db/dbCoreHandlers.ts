import { ipcMain } from 'electron'
import {
  workspaceManager,
  ensureSchemaIntegrity,
  extractTableAndAction
} from '../../database/workspace'
import { validateSqlQuery } from '../utils/sqlGuard'
import { withSchemaRetry } from '../utils/schemaRetry'

/**
 * <summary>
 * Veritabanı Temel SQL Çalıştırma ve Sorgulama IPC İşleyicileri
 * </summary>
 * <description>
 * SQLite veritabanı üzerinde SELECT, INSERT, UPDATE, DELETE ve TRANSACTION işlemlerini
 * şema kurtarma ve SQL güvenlik kontrolleri ile birlikte yürütür.
 * </description>
 */
export function registerDbCoreHandlers(): void {
  /**
   * <summary>
   * SELECT Sorgusu Çalıştırma İşleyicisi
   * </summary>
   * <param name="sql">Çalıştırılacak SQL SELECT sorgusu</param>
   * <param name="params">Sorgu parametreleri</param>
   * <returns>İşlem sonucu ve veri satırları listesi</returns>
   */
  ipcMain.handle('db:query', async (_, sql: string, params: any[] = []) => {
    try {
      validateSqlQuery(sql, params)
      const executeQuery = async () => {
        const db = workspaceManager.getDb()
        const stmt = db.prepare(sql)
        const rows = stmt.all(...params)
        return { success: true, data: rows }
      }

      return await withSchemaRetry(
        executeQuery,
        async () => {
          const db = workspaceManager.getDb()
          ensureSchemaIntegrity(db)
        },
        sql
      )
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  /**
   * <summary>
   * INSERT, UPDATE, DELETE İşlem Çalıştırma İşleyicisi
   * </summary>
   * <param name="sql">Çalıştırılacak DML SQL ifadesi</param>
   * <param name="params">Sorgu parametreleri</param>
   * <returns>Son eklenen satır ID'si ve etkilenen satır sayısı</returns>
   */
  ipcMain.handle('db:run', async (_, sql: string, params: any[] = []) => {
    try {
      validateSqlQuery(sql, params)
      const executeRun = async () => {
        const db = workspaceManager.getDb()
        const stmt = db.prepare(sql)
        const info = stmt.run(...params)
        const { tableName, action } = extractTableAndAction(sql)
        workspaceManager.recordMutation(tableName, action, info.changes || 1)
        if (workspaceManager.isDirty()) {
          workspaceManager.save()
        }
        return { success: true, lastInsertRowid: info.lastInsertRowid, changes: info.changes }
      }

      return await withSchemaRetry(
        executeRun,
        async () => {
          const db = workspaceManager.getDb()
          ensureSchemaIntegrity(db)
        },
        sql
      )
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  /**
   * <summary>
   * Alternatif SQL İfadesi Çalıştırma İşleyicisi
   * </summary>
   * <param name="sql">Çalıştırılacak SQL ifadesi</param>
   * <param name="params">Parametreler dizisi veya değişken argümanlar</param>
   */
  ipcMain.handle('db:execute', async (_, sql: string, ...params: any[]) => {
    try {
      const actualParams = params.length === 1 && Array.isArray(params[0]) ? params[0] : params
      validateSqlQuery(sql, actualParams)
      const executeStmt = async () => {
        const db = workspaceManager.getDb()
        const stmt = db.prepare(sql)
        const info = stmt.run(...actualParams)
        const { tableName, action } = extractTableAndAction(sql)
        workspaceManager.recordMutation(tableName, action, info.changes || 1)
        if (workspaceManager.isDirty()) {
          workspaceManager.save()
        }
        return { success: true, lastInsertRowid: info.lastInsertRowid, changes: info.changes }
      }

      return await withSchemaRetry(
        executeStmt,
        async () => {
          const db = workspaceManager.getDb()
          ensureSchemaIntegrity(db)
        },
        sql
      )
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  /**
   * <summary>
   * Çoklu Sorgu Tranzaksiyonu (Transaction) İşleyicisi
   * </summary>
   * <param name="queries">Çalıştırılacak SQL ve parametre nesneleri dizisi</param>
   * <returns>Tranzaksiyon sonucu ve toplam değişen satır sayısı</returns>
   */
  ipcMain.handle('db:transaction', async (_, queries: { sql: string; params: any[] }[]) => {
    try {
      const db = workspaceManager.getDb()
      for (const q of queries) {
        validateSqlQuery(q.sql, q.params)
      }

      let lastInsertRowid: number | bigint = 0
      let totalChanges = 0

      const transaction = db.transaction((stmts: { sql: string; params: any[] }[]) => {
        for (const q of stmts) {
          const stmt = db.prepare(q.sql)
          const info = stmt.run(...q.params)
          lastInsertRowid = info.lastInsertRowid
          totalChanges += info.changes
          const { tableName, action } = extractTableAndAction(q.sql)
          workspaceManager.recordMutation(tableName, action, info.changes || 1)
        }
      })

      transaction(queries)
      if (workspaceManager.isDirty()) {
        workspaceManager.save()
      }

      return { success: true, lastInsertRowid, changes: totalChanges }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })
}

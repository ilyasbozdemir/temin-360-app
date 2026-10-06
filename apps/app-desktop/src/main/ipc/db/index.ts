import { registerDbCoreHandlers } from './dbCoreHandlers'
import { registerDbAuthHandlers } from './dbAuthHandlers'
import { registerDbSettingsHandlers } from './dbSettingsHandlers'
import { registerDbExcelHandlers } from './dbExcelHandlers'
import { registerDbSchemaHandlers } from './dbSchemaHandlers'

/**
 * Veritabanı IPC İşleyicileri Ana Kayıt Noktası
 * Veritabanı ile ilgili tüm IPC dinleyicilerini (Core, Auth, Settings, Excel, Schema) modüler olarak kaydeder.
 */
export function registerDbIpcHandlers(): void {
  registerDbCoreHandlers()
  registerDbAuthHandlers()
  registerDbSettingsHandlers()
  registerDbExcelHandlers()
  registerDbSchemaHandlers()
}

export * from './dbCoreHandlers'
export * from './dbAuthHandlers'
export * from './dbSettingsHandlers'
export * from './dbExcelHandlers'
export * from './dbSchemaHandlers'

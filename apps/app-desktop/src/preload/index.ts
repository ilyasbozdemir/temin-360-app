import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Whitelist of authorized IPC channels for Preload gatekeeper
const allowedChannels = new Set([
  // DB
  'db:query',
  'db:run',
  'db:execute',
  'db:transaction',
  'db:bulk-import',
  'db:get-settings',
  'db:save-settings',
  'db:check-auth-setup',
  'db:setup-auth',
  // Excel / CSV / Import / Export
  'db:export-kalem-excel',
  'db:import-kalem-excel',
  'db:export-table-excel',
  'db:export-table-template',
  'db:import-table-excel',
  'db:export-tasinir-template',
  'db:import-tasinir-excel',
  'db:export-okas-template',
  'db:import-okas-excel',
  'excel:read-preview',
  'excel:import-raw',
  'export-excel',
  'import-xlsx',
  'db:login',
  'db:get-schema-dict',
  'db:resetPlaceholders',
  // Archive & Year Summary
  'db:get-year-summary',
  'db:close-year-records',
  'db:archive-old-records',
  // Workspace
  'workspace:create',
  'workspace:open',
  'workspace:close',
  'workspace:get-meta',
  'workspace:backup',
  'workspace:backup-server',
  'workspace:backup-email',
  'workspace:backup-gdrive',
  'workspace:start-gdrive-oauth',
  'workspace:list-gdrive-files',
  'workspace:download-gdrive-file',
  'workspace:delete-gdrive-file',
  'workspace:upload-file',
  'workspace:open-file',
  // Document
  'belge:get-all-cikti-data',
  'get-all-cikti-data',
  'belge:get-document-payload',
  'get-document-payload',
  'belge:export-docx',
  'export-docx',
  'app:export-docx',
  'app:save-docx-as',
  'save-docx-as',
  'belge:export-udf',
  'export-udf',
  'app:export-udf',
  'belge:export-zip',
  'export-zip',
  'app:export-zip',
  'belge:print-html',
  'print-html',
  'app:print-html',
  'belge:preview-pdf',
  'preview-pdf',
  'belge:open-pdf-external',
  'open-pdf-external',
  'belge:export-pdf',
  'export-pdf',
  'app:export-pdf',
  'app:save-pdf-as',
  'save-pdf-as',
  'app:open-pdf-preview',
  'open-pdf-preview',
  'belge:export-html',
  'export-html',
  'belge:export-xlsx',
  'export-xlsx',
  'belge:import-docx',
  'import-docx',
  'belge:import-xlsx',
  'import-xlsx',
  'belge:open-excel',
  'open-excel',
  // Network / Sync
  'network:start-server',
  'network:stop-server',
  'network:connect-client',
  'network:disconnect-client',
  'network:start-express',
  'network:stop-express',
  'network:pull-db',
  'network:push-db',
  'network:can-undo-sync',
  'network:undo-sync',
  'sync:test-connection',
  'sync:run-sync',
  'sync:push',
  'sync:pull',
  // Template
  'template:export',
  'template:import',
  'template:read-system',
  'template:write-system',
  // App
  'app:get-version',
  'app:isPackaged',
  'app:force-quit',
  'app:get-recent-files',
  'app:add-recent-file',
  'app:remove-recent-file',
  'app:get-initial-file',
  'get-initial-file',
  'app:get-changelog',
  'get-changelog',
  // Dialog
  'dialog:showSaveDialog',
  'dialog:showOpenDialog',
  // AI
  'ai:generate',
  'ai:test',
  // Updater
  'updater:check',
  'updater:download',
  'updater:quit-and-install',
  'updater:set-dev-version'
])


// Secure gated wrapper exposing only authorized channels to renderer
const secureElectronAPI = {
  ...electronAPI,
  ipcRenderer: {
    ...electronAPI.ipcRenderer,
    invoke: (channel: string, ...args: any[]) => {
      if (!allowedChannels.has(channel)) {
        console.error(`[Preload Security] Access denied for unauthorized channel: '${channel}'`)
        throw new Error(`[Preload Security] Channel access denied: '${channel}'`)
      }
      return ipcRenderer.invoke(channel, ...args)
    }
  }
}

// Custom typed APIs for renderer
const api = {
  aiGenerate: (options: {
    prompt: string
    systemInstruction?: string
    enableDatabaseAccess?: boolean
  }) => ipcRenderer.invoke('ai:generate', options),
  aiTest: (provider: string, apiKey: string) => ipcRenderer.invoke('ai:test', provider, apiKey),
  getAppVersion: () => ipcRenderer.invoke('app:get-version'),
  setDevVersion: (mode: boolean, version: string) =>
    ipcRenderer.invoke('updater:set-dev-version', mode, version)
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', secureElectronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore
  window.electron = secureElectronAPI
  // @ts-ignore
  window.api = api
}

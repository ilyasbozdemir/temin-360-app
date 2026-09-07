import { registerDbIpcHandlers } from './db.ipc'
import { registerWorkspaceIpcHandlers } from './workspace.ipc'
import { registerNetworkIpcHandlers } from './network.ipc'
import { registerDocumentIpcHandlers } from './document.ipc'
import { registerTemplateIpcHandlers } from './template.ipc'
import { registerAppIpcHandlers } from './app.ipc'
import { registerDialogIpcHandlers } from './dialog.ipc'
import { registerAiIpcHandlers } from './ai.ipc'
import { registerUpdaterIpcHandlers } from './updater.ipc'

export interface IpcRegistrationOptions {
  closeAllSecondaryWindows: () => void
  setForceQuit: () => void
  initialFilePath: string | null
}

export function registerAllIpcHandlers(options: IpcRegistrationOptions): void {
  registerDbIpcHandlers()
  registerWorkspaceIpcHandlers(options.closeAllSecondaryWindows)
  registerNetworkIpcHandlers()
  registerDocumentIpcHandlers()
  registerTemplateIpcHandlers()
  registerAppIpcHandlers(options.setForceQuit, options.initialFilePath)
  registerDialogIpcHandlers()
  registerAiIpcHandlers()
  registerUpdaterIpcHandlers()
}


import { create } from 'zustand'

export interface WorkspaceMeta {
  dtal_version: string
  app_version: string
  created_at: string
  institution: string
  schema_version: number
  updated_at?: string
  warnings?: string[]
}

interface WorkspaceState {
  activeFilePath: string | null
  fileName: string
  isAuthenticated: boolean
  activeDosyaId: number | null
  isCreatingDosya: boolean
  activeMeta: WorkspaceMeta | null
  activeStarredDocs: string[]
  setIsCreatingDosya: (flag: boolean) => void
  setActiveFile: (path: string | null) => void
  setIsAuthenticated: (auth: boolean) => void
  setActiveDosyaId: (id: number | null) => void
  setActiveStarredDocs: (docs: string[]) => void
  openWorkspace: (
    filePath: string,
    allowMigration?: boolean
  ) => Promise<{
    success: boolean
    error?: string
    requiresMigration?: boolean
    pendingUpdates?: any[]
  }>
  createWorkspace: (
    filePath: string,
    institutionName: string,
    eButceKodu?: string,
    adminUsername?: string,
    adminPassword?: string
  ) => Promise<{ success: boolean; error?: string }>

  closeWorkspace: () => Promise<void>
  loadActiveMeta: () => Promise<void>
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  activeFilePath: sessionStorage.getItem('workspace_path') || null,
  fileName: sessionStorage.getItem('workspace_path')
    ? sessionStorage.getItem('workspace_path')!.split('\\').pop()?.split('/').pop() ||
      'Bilinmeyen Dosya'
    : 'Veri Dosyası Seçilmedi',
  isAuthenticated: sessionStorage.getItem('workspace_auth') === 'true',
  activeDosyaId: sessionStorage.getItem('workspace_dosya_id')
    ? parseInt(sessionStorage.getItem('workspace_dosya_id')!, 10)
    : null,
  isCreatingDosya: false,
  activeMeta: null,
  activeStarredDocs: [],
  setIsCreatingDosya: (flag) => set({ isCreatingDosya: flag }),
  setActiveStarredDocs: (docs) => set({ activeStarredDocs: docs }),
  setActiveFile: (path) => {
    if (path) {
      sessionStorage.setItem('workspace_path', path)
    } else {
      sessionStorage.removeItem('workspace_path')
    }
    set({
      activeFilePath: path,
      fileName: path
        ? path.split('\\').pop()?.split('/').pop() || 'Bilinmeyen Dosya'
        : 'Veri Dosyası Seçilmedi'
    })
  },
  setIsAuthenticated: (auth) => {
    sessionStorage.setItem('workspace_auth', auth ? 'true' : 'false')
    set({ isAuthenticated: auth })
  },
  setActiveDosyaId: (id) => {
    if (id !== null) {
      sessionStorage.setItem('workspace_dosya_id', id.toString())
      window.electron.ipcRenderer
        .invoke('db:query', 'SELECT starred_docs FROM DATA_TeminDosyasi WHERE id = ?', [id])
        .then((res: { success: boolean; data?: Array<{ starred_docs?: string }> }) => {
          if (res.success && res.data && res.data.length > 0) {
            try {
              const docs = res.data[0].starred_docs ? JSON.parse(res.data[0].starred_docs) : []
              set({ activeDosyaId: id, activeStarredDocs: docs })
              return
            } catch {
              // noop
            }
          }
          set({ activeDosyaId: id, activeStarredDocs: [] })
        })
        .catch(() => {
          set({ activeDosyaId: id, activeStarredDocs: [] })
        })
    } else {
      sessionStorage.removeItem('workspace_dosya_id')
      set({ activeDosyaId: null, activeStarredDocs: [] })
    }
  },
  openWorkspace: async (filePath: string, allowMigration: boolean = false) => {
    try {
      const result = await window.electron.ipcRenderer.invoke(
        'workspace:open',
        filePath,
        allowMigration
      )

      if (result.requiresMigration) {
        return { success: false, requiresMigration: true, pendingUpdates: result.pendingUpdates }
      }

      if (result.success) {
        const actualFilePath = result.newFilePath || filePath
        const isSameFile = sessionStorage.getItem('workspace_path') === actualFilePath
        const wasAuth = sessionStorage.getItem('workspace_auth') === 'true'
        const keepAuth = isSameFile && wasAuth

        sessionStorage.setItem('workspace_path', actualFilePath)
        sessionStorage.setItem('workspace_auth', keepAuth ? 'true' : 'false')

        if (!keepAuth) {
          sessionStorage.removeItem('workspace_dosya_id')
        }

        set({
          activeFilePath: actualFilePath,
          fileName: actualFilePath.split(/[/\\]/).pop() || 'Bilinmeyen Dosya',
          isAuthenticated: keepAuth,
          activeMeta: result.meta || null,
          activeDosyaId: keepAuth
            ? sessionStorage.getItem('workspace_dosya_id')
              ? parseInt(sessionStorage.getItem('workspace_dosya_id')!, 10)
              : null
            : null
        })

        // Add to recent files
        const nameWithoutExt =
          result.meta?.institution ||
          actualFilePath
            .split(/[/\\]/)
            .pop()
            ?.replace(/\.(hkmp|dtal|dtm|dte)$/i, '') ||
          'Bilinmeyen Kurum'
        window.electron.ipcRenderer
          .invoke('app:add-recent-file', actualFilePath, nameWithoutExt)
          .catch(console.error)

        return { success: true }
      }
      return { success: false, error: result.error }
    } catch (e: any) {
      console.error(e)
      return { success: false, error: e.message }
    }
  },
  createWorkspace: async (
    filePath: string,
    institutionName: string,
    eButceKodu?: string,
    adminUsername?: string,
    adminPassword?: string
  ) => {
    try {
      const result = await window.electron.ipcRenderer.invoke(
        'workspace:create',
        filePath,
        institutionName,
        eButceKodu || '',
        adminUsername || '',
        adminPassword || ''
      )
      if (result.success) {
        const actualFilePath = result.newFilePath || filePath
        sessionStorage.setItem('workspace_path', actualFilePath)
        sessionStorage.setItem('workspace_auth', 'true')
        sessionStorage.removeItem('workspace_dosya_id')
        set({
          activeFilePath: actualFilePath,
          fileName: actualFilePath.split(/[/\\]/).pop() || 'Bilinmeyen Dosya',
          isAuthenticated: true, // Auto-logged in on create
          activeMeta: result.meta || null,
          activeDosyaId: null
        })

        // Add to recent files
        const nameWithoutExt =
          result.meta?.institution ||
          actualFilePath
            .split(/[/\\]/)
            .pop()
            ?.replace(/\.(hkmp|dtal|dtm|dte)$/i, '') ||
          'Bilinmeyen Kurum'
        window.electron.ipcRenderer
          .invoke('app:add-recent-file', actualFilePath, nameWithoutExt)
          .catch(console.error)

        return { success: true }
      }
      return { success: false, error: result.error }
    } catch (e: any) {
      console.error(e)
      return { success: false, error: e.message }
    }
  },

  closeWorkspace: async () => {
    await window.electron.ipcRenderer.invoke('workspace:close')
    sessionStorage.removeItem('workspace_path')
    sessionStorage.removeItem('workspace_auth')
    sessionStorage.removeItem('workspace_dosya_id')
    set({
      activeFilePath: null,
      fileName: 'Veri Dosyası Seçilmedi',
      isAuthenticated: false,
      activeMeta: null,
      activeDosyaId: null
    })
  },
  loadActiveMeta: async () => {
    if (!get().activeFilePath) return
    try {
      const result = await window.electron.ipcRenderer.invoke('workspace:get-meta')
      if (result.success) {
        set({ activeMeta: result.meta || null })
      }
    } catch (e) {
      console.error(e)
    }
  }
}))

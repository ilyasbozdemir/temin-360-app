import { create } from 'zustand'

export interface SyncState {
  syncUrl: string
  syncPort: string
  syncToken: string
  isOnlineMode: boolean
  syncStatus: 'idle' | 'loading' | 'ok' | 'error'
  syncMessage: string
  isSyncing: boolean
  isPushing: boolean
  isPulling: boolean
  syncLastResult: { type: 'ok' | 'error'; msg: string } | null
  dbVersionLocal: number
  dbVersionCloud: number
  activeProvider: 'server' | 'gdrive' | 'pocketbase'
  pocketbaseUrl: string
  pocketbaseToken: string
  pocketbaseEmail: string
  pocketbasePassword: string

  setSyncUrl: (url: string) => void
  setSyncPort: (port: string) => void
  setSyncToken: (token: string) => void
  setPocketbaseUrl: (url: string) => void
  setPocketbaseToken: (token: string) => void
  setPocketbaseEmail: (email: string) => void
  setPocketbasePassword: (password: string) => void
  setIsOnlineMode: (val: boolean) => Promise<void>
  setActiveProvider: (provider: 'server' | 'gdrive' | 'pocketbase') => void
  loadSettings: () => Promise<void>
  saveSettings: () => Promise<void>
  testConnection: () => Promise<{ success: boolean; message?: string }>
  testPocketBase: () => Promise<{ success: boolean; message?: string }>
  pushPocketBase: () => Promise<{ success: boolean; message?: string }>
  triggerSync: () => Promise<void>
  triggerPush: () => Promise<void>
  triggerPull: () => Promise<void>
}

export const useSyncStore = create<SyncState>((set, get) => ({
  syncUrl: 'https://temin360app.demo.ilyasbozdemir.dev/',
  syncPort: '',
  syncToken: '',
  pocketbaseUrl: 'http://localhost:8090',
  pocketbaseToken: '',
  pocketbaseEmail: '',
  pocketbasePassword: '',
  isOnlineMode: true,
  syncStatus: 'idle',
  syncMessage: '',
  isSyncing: false,
  isPushing: false,
  isPulling: false,
  syncLastResult: null,
  dbVersionLocal: 104,
  dbVersionCloud: 104,
  activeProvider: 'server',

  setSyncUrl: (syncUrl) => set({ syncUrl }),
  setSyncPort: (syncPort) => set({ syncPort }),
  setSyncToken: (syncToken) => set({ syncToken }),
  setPocketbaseUrl: (pocketbaseUrl) => set({ pocketbaseUrl }),
  setPocketbaseToken: (pocketbaseToken) => set({ pocketbaseToken }),
  setPocketbaseEmail: (pocketbaseEmail) => set({ pocketbaseEmail }),
  setPocketbasePassword: (pocketbasePassword) => set({ pocketbasePassword }),
  setActiveProvider: (activeProvider) => set({ activeProvider }),

  setIsOnlineMode: async (checked: boolean) => {
    set({ isOnlineMode: checked })
    try {
      if (window.electron?.ipcRenderer) {
        await window.electron.ipcRenderer.invoke('db:save-settings', {
          is_offline_mode: String(!checked)
        })
      }
    } catch (err) {
      console.error('Save offline mode error:', err)
    }
  },

  loadSettings: async () => {
    try {
      if (!window.electron?.ipcRenderer) return
      const settings = await window.electron.ipcRenderer.invoke('db:get-settings')
      if (settings) {
        const isOffline = settings.is_offline_mode === 'true'
        set({
          syncUrl: settings.sync_server_url !== undefined ? settings.sync_server_url : get().syncUrl,
          syncPort: settings.sync_server_port || '',
          syncToken: settings.sync_server_token || '',
          isOnlineMode: !isOffline,
          dbVersionLocal: Number(settings.db_version_local || 104),
          dbVersionCloud: Number(settings.db_version_cloud || settings.db_version_local || 104)
        })
      }
    } catch (err) {
      console.error('Load sync settings error:', err)
    }
  },

  saveSettings: async () => {
    const { syncUrl, syncPort, syncToken, isOnlineMode } = get()
    try {
      if (window.electron?.ipcRenderer) {
        await window.electron.ipcRenderer.invoke('db:save-settings', {
          sync_server_url: syncUrl,
          sync_server_port: syncPort,
          sync_server_token: syncToken,
          is_offline_mode: String(!isOnlineMode)
        })
      }
      set({
        syncLastResult: { type: 'ok', msg: 'Sunucu ayarları başarıyla kaydedildi ✓' }
      })
    } catch (err: any) {
      set({
        syncLastResult: { type: 'error', msg: err?.message || 'Ayarlar kaydedilemedi!' }
      })
    }
  },

  testConnection: async () => {
    const { syncUrl, syncPort, syncToken } = get()
    if (!syncUrl) {
      set({
        syncStatus: 'error',
        syncMessage: 'Lütfen sunucu adresini girin.',
        syncLastResult: { type: 'error', msg: 'Lütfen sunucu adresini girin.' }
      })
      return { success: false, message: 'Lütfen sunucu adresini girin.' }
    }

    set({
      syncStatus: 'loading',
      syncMessage: 'Bağlantı test ediliyor...',
      syncLastResult: null
    })

    try {
      if (window.electron?.ipcRenderer) {
        // First save current inputs
        await window.electron.ipcRenderer.invoke('db:save-settings', {
          sync_server_url: syncUrl,
          sync_server_port: syncPort,
          sync_server_token: syncToken
        })

        const res = await window.electron.ipcRenderer.invoke('sync:test-connection', {
          url: syncUrl,
          port: syncPort,
          token: syncToken
        })

        if (res.success) {
          const msg = res.message || 'Bağlantı Başarılı! ✓'
          set({
            syncStatus: 'ok',
            syncMessage: msg,
            isOnlineMode: true,
            syncLastResult: { type: 'ok', msg }
          })
          await window.electron.ipcRenderer.invoke('db:save-settings', {
            is_offline_mode: 'false'
          })
          return { success: true, message: msg }
        } else {
          const msg = res.error || res.message || 'Bağlantı başarısız.'
          set({
            syncStatus: 'error',
            syncMessage: msg,
            syncLastResult: { type: 'error', msg }
          })
          return { success: false, message: msg }
        }
      }
      return { success: false, message: 'Electron IPC bulunamadı.' }
    } catch (err: any) {
      const msg = err.message || 'Bir hata oluştu.'
      set({
        syncStatus: 'error',
        syncMessage: msg,
        syncLastResult: { type: 'error', msg }
      })
      return { success: false, message: msg }
    }
  },

  triggerSync: async () => {
    const { isSyncing, syncUrl, syncToken, dbVersionLocal } = get()
    if (isSyncing) return
    set({
      isSyncing: true,
      syncMessage: 'Veriler eşitleniyor...',
      syncLastResult: null
    })

    try {
      if (window.electron?.ipcRenderer) {
        const syncRes = await window.electron.ipcRenderer.invoke('sync:run-sync', {
          url: syncUrl,
          token: syncToken
        })
        if (syncRes.success) {
          const newVer = dbVersionLocal + 1
          set({
            syncStatus: 'ok',
            syncMessage: 'Senkronizasyon Tamamlandı! ✓',
            dbVersionLocal: newVer,
            dbVersionCloud: newVer,
            syncLastResult: { type: 'ok', msg: 'Veriler başarıyla eşitlendi (Push + Pull) ✓' }
          })
          await window.electron.ipcRenderer.invoke('db:save-settings', {
            db_version_local: String(newVer),
            db_version_cloud: String(newVer)
          })
        } else {
          const msg = syncRes.error || syncRes.message || 'Senkronizasyon başarısız.'
          set({
            syncStatus: 'error',
            syncMessage: msg,
            syncLastResult: { type: 'error', msg }
          })
        }
      }
    } catch (err: any) {
      const msg = err.message || 'Bir hata oluştu.'
      set({
        syncStatus: 'error',
        syncMessage: msg,
        syncLastResult: { type: 'error', msg }
      })
    } finally {
      set({ isSyncing: false })
    }
  },

  testPocketBase: async () => {
    const { pocketbaseUrl, pocketbaseEmail, pocketbasePassword, pocketbaseToken } = get()
    if (!pocketbaseUrl) {
      set({ syncStatus: 'error', syncMessage: 'Lütfen PocketBase URL adresini girin.' })
      return { success: false, message: 'Lütfen PocketBase URL adresini girin.' }
    }

    set({ syncStatus: 'loading', syncMessage: 'PocketBase bağlantısı sınanıyor...' })
    try {
      if (window.electron?.ipcRenderer) {
        const res = await window.electron.ipcRenderer.invoke('workspace:pocketbase-test', {
          url: pocketbaseUrl,
          email: pocketbaseEmail,
          password: pocketbasePassword,
          token: pocketbaseToken
        })

        if (res.success) {
          if (res.token) {
            set({ pocketbaseToken: res.token })
          }
          set({
            syncStatus: 'ok',
            syncMessage: res.message || 'PocketBase bağlantısı başarılı ✓'
          })
          return { success: true, message: res.message }
        } else {
          set({
            syncStatus: 'error',
            syncMessage: res.message || 'PocketBase bağlantı başarısız.'
          })
          return { success: false, message: res.message }
        }
      }
      return { success: false, message: 'Electron IPC mevcut değil.' }
    } catch (err: any) {
      const msg = err.message || 'PocketBase sına hatası'
      set({ syncStatus: 'error', syncMessage: msg })
      return { success: false, message: msg }
    }
  },

  pushPocketBase: async () => {
    const { pocketbaseUrl, pocketbaseToken, isPushing } = get()
    if (isPushing) return { success: false, message: 'İşlem devam ediyor...' }
    set({ isPushing: true, syncStatus: 'loading', syncMessage: 'Dosya PocketBase\'e aktarılıyor...' })

    try {
      if (window.electron?.ipcRenderer) {
        const res = await window.electron.ipcRenderer.invoke('workspace:pocketbase-push', {
          url: pocketbaseUrl,
          token: pocketbaseToken
        })

        if (res.success) {
          set({
            syncStatus: 'ok',
            syncMessage: res.message || 'Dosya PocketBase sunucusuna aktarıldı ✓'
          })
          return { success: true, message: res.message }
        } else {
          set({
            syncStatus: 'error',
            syncMessage: res.message || 'Aktarım başarısız.'
          })
          return { success: false, message: res.message }
        }
      }
      return { success: false, message: 'Electron IPC bulunamadı.' }
    } catch (err: any) {
      const msg = err.message || 'PocketBase aktarım hatası'
      set({ syncStatus: 'error', syncMessage: msg })
      return { success: false, message: msg }
    } finally {
      set({ isPushing: false })
    }
  },

  triggerPush: async () => {
    const { isPushing } = get()
    if (isPushing) return
    set({ isPushing: true, syncLastResult: null })
    try {
      if (window.electron?.ipcRenderer) {
        const res = await window.electron.ipcRenderer.invoke('sync:push')
        if (res.success) {
          set({
            syncLastResult: {
              type: 'ok',
              msg: `Yerel veritabanı başarıyla uzak sunucuya gönderildi (Rev #${res.revision || 1}) ✓`
            }
          })
        } else {
          set({
            syncLastResult: {
              type: 'error',
              msg: res.error || 'Sunucuya gönderme başarısız.'
            }
          })
        }
      }
    } catch (err: any) {
      set({
        syncLastResult: {
          type: 'error',
          msg: 'Hata: ' + (err.message || 'Gönderilemedi')
        }
      })
    } finally {
      set({ isPushing: false })
    }
  },

  triggerPull: async () => {
    const { isPulling } = get()
    if (isPulling) return
    set({ isPulling: true, syncLastResult: null })
    try {
      if (window.electron?.ipcRenderer) {
        const res = await window.electron.ipcRenderer.invoke('sync:pull')
        if (res.success) {
          set({
            syncLastResult: {
              type: 'ok',
              msg: `Uzak sunucudaki en güncel veritabanı yerel sisteme indirildi ve yüklendi ✓`
            }
          })
        } else {
          set({
            syncLastResult: {
              type: 'error',
              msg: res.error || 'Sunucudan veri çekme başarısız.'
            }
          })
        }
      }
    } catch (err: any) {
      set({
        syncLastResult: {
          type: 'error',
          msg: 'Hata: ' + (err.message || 'Alınamadı')
        }
      })
    } finally {
      set({ isPulling: false })
    }
  }
}))

import React, { useState } from 'react'
import {
  FolderOpen,
  Folder,
  PlusCircle,
  Building,
  User,
  KeyRound,
  ShieldAlert,
  Minus,
  Square,
  X,
  Sun,
  Moon,
  Eye,
  EyeOff,
  Wifi,
  Clock,
  ChevronRight
} from 'lucide-react'
import { useWorkspaceStore } from '../../store/workspaceStore'
import { useQueryClient } from '@tanstack/react-query'
import { useTheme } from '../../components/providers/ThemeProvider'
import { NetworkSyncModal } from '../../components/network/NetworkSyncModal'

export default function LauncherScreen(): React.ReactNode {
  const { openWorkspace, createWorkspace } = useWorkspaceStore()
  const queryClient = useQueryClient()
  const { theme, setTheme } = useTheme()

  // Modal states for creating a new institution
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showNetworkModal, setShowNetworkModal] = useState(false)
  const [pendingFilePath, setPendingFilePath] = useState<string | null>(null)

  // Migration states
  const [showMigrationModal, setShowMigrationModal] = useState(false)
  const [migrationData, setMigrationData] = useState<{
    filePath: string
    pendingUpdates: any[]
  } | null>(null)

  const [institutionName, setInstitutionName] = useState('')
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('')
  const [creating, setCreating] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Recent files state
  const [recentFiles, setRecentFiles] = useState<
    { name: string; path: string; lastOpened: number }[]
  >([])

  React.useEffect(() => {
    // Fetch recent files on mount
    window.electron?.ipcRenderer
      .invoke('app:get-recent-files')
      .then((files) => {
        if (files) setRecentFiles(files)
      })
      .catch(console.error)
  }, [])

  const handleCreateNewFile = async (): Promise<void> => {
    try {
      const res = await window.electron?.ipcRenderer.invoke('dialog:showSaveDialog')
      if (!res.canceled && res.filePath) {
        // Dosya yolundan dosya adını (uzantısız) çıkar
        const fileName = res.filePath.split(/[/\\]/).pop() || 'Yeni Kurum'
        const projectName = fileName.replace(/\.(hkmp|dtal|dtm|dte)$/i, '')

        setPendingFilePath(res.filePath)
        setInstitutionName(projectName)
        setShowCreateModal(true)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleChangeSaveLocation = async (): Promise<void> => {
    try {
      const res = await window.electron?.ipcRenderer.invoke('dialog:showSaveDialog')
      if (!res.canceled && res.filePath) {
        const fileName = res.filePath.split(/[/\\]/).pop() || 'Yeni Kurum'
        const projectName = fileName.replace(/\.(hkmp|dtal|dtm|dte)$/i, '')
        setPendingFilePath(res.filePath)
        if (!institutionName || institutionName === 'Yeni Kurum' || institutionName === 'Yeni Dosya') {
          setInstitutionName(projectName)
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleModalSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!pendingFilePath) return

    setCreating(true)
    try {
      const result = await createWorkspace(
        pendingFilePath,
        institutionName,
        undefined,
        username,
        password
      )
      if (result.success) {
        queryClient.clear()
        setShowCreateModal(false)
        setPendingFilePath(null)
      } else {
        alert(`Kurum dosyası oluşturulamadı!\nHata: ${result.error || 'Bilinmeyen hata'}`)
      }
    } catch (err: any) {
      console.error(err)
      alert(`Hata oluştu!\nHata: ${err.message || 'Bilinmeyen hata'}`)
    } finally {
      setCreating(false)
    }
  }

  const handleOpenFile = async (): Promise<void> => {
    try {
      const res = await window.electron?.ipcRenderer.invoke('dialog:showOpenDialog')
      if (!res.canceled && res.filePath) {
        const result = await openWorkspace(res.filePath, false)

        if (result.requiresMigration) {
          setMigrationData({ filePath: res.filePath, pendingUpdates: result.pendingUpdates || [] })
          setShowMigrationModal(true)
          return
        }

        if (result.success) {
          queryClient.clear()
        } else {
          alert(`Kurum dosyası açılamadı!\nHata: ${result.error || 'Bilinmeyen hata'}`)
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleOpenRecent = async (filePath: string): Promise<void> => {
    try {
      const result = await openWorkspace(filePath, false)
      if (result.requiresMigration) {
        setMigrationData({ filePath, pendingUpdates: result.pendingUpdates || [] })
        setShowMigrationModal(true)
        return
      }
      if (result.success) {
        queryClient.clear()
      } else {
        const errorMsg = result.error || 'Bilinmeyen hata'
        if (
          errorMsg.includes('ENOENT') ||
          errorMsg.includes('bulunamadı') ||
          errorMsg.includes('no such file')
        ) {
          const remove = window.confirm(
            `Dosya bulunamadı veya taşınmış:\n${filePath}\n\nBu dosyayı son açılanlar listesinden kaldırmak ister misiniz?`
          )
          if (remove) {
            const updated = await window.electron?.ipcRenderer.invoke(
              'app:remove-recent-file',
              filePath
            )
            if (Array.isArray(updated)) {
              setRecentFiles(updated)
            } else {
              setRecentFiles((prev) => prev.filter((f) => f.path !== filePath))
            }
          }
        } else {
          alert(`Kurum dosyası açılamadı!\nHata: ${errorMsg}`)
        }
      }
    } catch (e: any) {
      console.error(e)
      alert(`Hata oluştu!\nHata: ${e?.message || 'Bilinmeyen hata'}`)
    }
  }

  const handleRemoveRecent = async (filePath: string, e: React.MouseEvent): Promise<void> => {
    e.stopPropagation()
    const confirmDelete = window.confirm(
      'Bu dosyayı son açılanlar listesinden kaldırmak istediğinize emin misiniz?'
    )
    if (!confirmDelete) return

    try {
      const res = await window.electron?.ipcRenderer.invoke('app:remove-recent-file', filePath)
      if (Array.isArray(res)) {
        setRecentFiles(res)
      } else {
        setRecentFiles((prev) => prev.filter((file) => file.path !== filePath))
      }
    } catch (err) {
      console.error('Son açılan dosya kaldırılırken hata oluştu:', err)
      setRecentFiles((prev) => prev.filter((file) => file.path !== filePath))
    }
  }

  const handleConfirmMigration = async (): Promise<void> => {
    if (!migrationData) return
    setCreating(true)
    try {
      const result = await openWorkspace(migrationData.filePath, true)
      if (result.success) {
        queryClient.clear()
        setShowMigrationModal(false)
        setMigrationData(null)
      } else {
        alert(`Veritabanı güncellenemedi veya dosya açılamadı!\nHata: ${result.error}`)
      }
    } catch (err: any) {
      alert(`Hata oluştu!\nHata: ${err.message}`)
    } finally {
      setCreating(false)
    }
  }

  const handleMinimize = (): void => window.electron?.ipcRenderer.send('window-minimize')
  const handleMaximize = (): void => window.electron?.ipcRenderer.send('window-maximize')
  const handleClose = (): void => {
    window.electron?.ipcRenderer.invoke('app:force-quit').catch(() => {
      window.electron?.ipcRenderer.send('window-close')
    })
  }

  return (
    <div className="flex items-center justify-center h-screen w-full bg-slate-50 dark:bg-slate-950 p-6 relative transition-colors duration-300">
      {/* Draggable Header with Window Controls & Theme Switcher */}
      <div
        className="absolute top-0 left-0 w-full h-12 flex justify-between items-center px-4 bg-transparent z-50 select-none"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        <div className="flex items-center gap-2 text-slate-400 dark:text-slate-600 text-xs font-semibold">
          <FolderOpen className="w-3.5 h-3.5" />
          <span>TEMİN 360 Başlatıcı</span>
        </div>

        <div
          className="flex items-center space-x-1"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <button
            onClick={() => setShowNetworkModal(true)}
            className="p-1.5 text-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
            title="Ağ Paylaşımı"
          >
            <Wifi className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300 transition-all rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800/50 mr-2"
            title="Tema Değiştir"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={handleMinimize}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300 transition-all rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
            title="Simge Durumuna Küçült"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={handleMaximize}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300 transition-all rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
            title="Ekranı Kapla"
          >
            <Square className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-red-600 rounded-lg transition-all"
            title="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        className="max-w-4xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-row"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <div className="flex-1 flex flex-col">
          <div className="p-8 text-center border-b border-slate-100 dark:border-slate-800">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600 dark:text-blue-400 animate-pulse">
              <FolderOpen className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
              TEMİN 360&apos;a Hoş Geldiniz
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto">
              Çalışmaya başlamak için yeni bir kurum/çalışma alanı dosyası (.dtal) oluşturun veya
              mevcut bir kurumu açın.
            </p>
          </div>

          <div className="p-8 space-y-4 flex-1 flex flex-col justify-center">
            <button
              onClick={handleCreateNewFile}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-100/50 dark:hover:bg-blue-900/20 text-blue-700 dark:text-blue-300 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform shadow-md shadow-blue-600/20">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-base">Yeni Kurum Oluştur</h3>
                <p className="text-xs opacity-80 mt-0.5">Yeni yıl veya kurum için sıfırdan başla</p>
              </div>
            </button>

            <button
              onClick={handleOpenFile}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 shrink-0 group-hover:scale-105 transition-transform">
                <FolderOpen className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-base">Mevcut Kurumu Aç</h3>
                <p className="text-xs opacity-80 mt-0.5">
                  Önceden oluşturulmuş .dtal dosyasını yükle
                </p>
              </div>
            </button>
          </div>
        </div>

        <div className="w-80 border-l border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-6 flex flex-col">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 mb-4">
            <Clock className="w-4 h-4" />
            <span>Son Açılanlar</span>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
            {recentFiles.map((file) => (
              <div
                key={file.path}
                onClick={() => handleOpenRecent(file.path)}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all group text-left cursor-pointer"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                    <FolderOpen className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <h4 className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                      {file.name}
                    </h4>
                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate" dir="rtl">
                      {file.path}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={(e) => handleRemoveRecent(file.path, e)}
                    className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    title="Listeden Kaldır"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-400 dark:group-hover:text-slate-400 opacity-0 group-hover:opacity-100 transition-all shrink-0" />
                </div>
              </div>
            ))}
            {recentFiles.length === 0 && (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <FolderOpen className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-2" />
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Henüz son açılan bir dosya yok.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CREATE WORKSPACE AUTH MODAL */}
      {showCreateModal && (
        <div
          className="absolute inset-0 bg-slate-950/40 dark:bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-md w-full rounded-3xl p-6 shadow-2xl flex flex-col text-slate-800 dark:text-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl text-blue-600 dark:text-blue-400">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Kurum Kayıt Bilgileri
                </h3>
                <p className="text-xs text-slate-550 dark:text-slate-400">
                  Yeni veri dosyası için şifre ve kimlik ayarları
                </p>
              </div>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 ml-1">
                  Dosya Kayıt Konumu (.hkmp)
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 min-w-0">
                    <Folder className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                    <input
                      type="text"
                      readOnly
                      value={pendingFilePath || ''}
                      placeholder="Kayıt konumu seçilmedi..."
                      title={pendingFilePath || ''}
                      className="w-full pl-9 pr-3 py-2 bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-700 dark:text-slate-300 focus:outline-none truncate cursor-default"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleChangeSaveLocation}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold shrink-0 transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
                  >
                    Gözat / Değiştir
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 ml-1">
                  Kurum Adı
                </label>
                <input
                  type="text"
                  required
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-slate-850 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 ml-1">
                  Yönetici Kullanıcı Adı
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-slate-850 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 ml-1">
                  Giriş Parolası
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-550" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Parolayı Belirleyin"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-slate-850 dark:text-white placeholder-slate-400 dark:placeholder-slate-655"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-350 focus:outline-none"
                    title={showPassword ? 'Şifreyi Gizle' : 'Şifreyi Göster'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-2 p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl text-amber-700 dark:text-amber-500 text-[10px] leading-relaxed">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <span>
                  Bu şifre veritabanına kaydedilir. İnternet olmasa dahi bu kurum dosyasına girmek
                  için bu şifreyi kullanacaksınız. Lütfen unutmayın.
                </span>
              </div>

              <div className="flex gap-3 mt-6 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setPendingFilePath(null)
                  }}
                  className="flex-1 py-2 border border-slate-205 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl text-sm font-semibold transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white rounded-xl text-sm font-semibold transition-colors"
                >
                  {creating ? 'Oluşturuluyor...' : 'Veri Dosyasını Aç'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MIGRATION MODAL */}
      {showMigrationModal && migrationData && (
        <div
          className="absolute inset-0 bg-slate-950/40 dark:bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-md w-full rounded-3xl p-6 shadow-2xl flex flex-col text-slate-800 dark:text-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-100 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl text-amber-600 dark:text-amber-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Veritabanı Güncellemesi Gerekli
                </h3>
              </div>
            </div>

            <div className="mb-4 text-sm text-slate-600 dark:text-slate-400">
              Bu dosya eski bir sürümde oluşturulmuş. Açılabilmesi için{' '}
              <strong>{migrationData.pendingUpdates.length}</strong> güncelleme uygulanacak:
            </div>

            <div className="max-h-48 overflow-y-auto mb-6 space-y-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
              {migrationData.pendingUpdates.map((update, idx) => (
                <div key={idx} className="flex gap-2 text-slate-600 dark:text-slate-400">
                  <span className="text-blue-500">•</span>
                  <span>
                    <strong>Schema {update.schema}:</strong> {update.description}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowMigrationModal(false)
                  setMigrationData(null)
                }}
                className="flex-1 py-2 border border-slate-205 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl text-sm font-semibold transition-colors"
              >
                İptal Et
              </button>
              <button
                type="button"
                onClick={handleConfirmMigration}
                disabled={creating}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                {creating ? 'Güncelleniyor...' : 'Devam Edilsin mi?'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showNetworkModal && <NetworkSyncModal onClose={() => setShowNetworkModal(false)} />}
    </div>
  )
}

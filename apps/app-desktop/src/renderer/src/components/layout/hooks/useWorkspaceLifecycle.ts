import { useEffect, useState } from 'react'
import { QueryClient } from '@tanstack/react-query'
import { useWorkspaceStore } from '../../../store/workspaceStore'
import { useSettingsStore } from '../../../store/settingsStore'
import { useTabStore } from '../../../store/tabStore'

export interface WorkspaceLifecycleState {
  showFormatUpgradeModal: boolean
  setShowFormatUpgradeModal: (show: boolean) => void
  upgradeFilePath: string | null
  handleUpgradeAndOpen: (filePath: string) => Promise<void>
}

export function useWorkspaceLifecycle(
  isAnyWindowMode: boolean,
  navigate: (options: { to: string }) => void,
  queryClient: QueryClient
): WorkspaceLifecycleState {
  const { activeFilePath, openWorkspace, loadActiveMeta } = useWorkspaceStore()
  const { loadSettings } = useSettingsStore()
  const { addTab, clearTabs } = useTabStore()

  const [showFormatUpgradeModal, setShowFormatUpgradeModal] = useState(false)
  const [upgradeFilePath, setUpgradeFilePath] = useState<string | null>(null)

  const handleUpgradeAndOpen = async (filePath: string): Promise<void> => {
    const result = await useWorkspaceStore.getState().convertAndOpenWorkspace(filePath)
    if (result.success) {
      queryClient.clear()
      clearTabs()
      navigate({ to: '/' })
    } else {
      throw new Error(result.error || 'Dönüştürme başarısız oldu.')
    }
  }

  // Listen for db change invalidations from main process
  useEffect(() => {
    if (!window.electron) return
    const removeListener = window.electron.ipcRenderer.on('db:invalidated', () => {
      queryClient.invalidateQueries()
      loadActiveMeta()
    })
    return () => {
      if (removeListener) removeListener()
    }
  }, [queryClient, loadActiveMeta])

  // Listen for tabs returned from detached windows
  useEffect(() => {
    if (!window.electron) return
    const removeListener = window.electron.ipcRenderer.on(
      'tab:returned-from-window',
      (_, data: { path: string }) => {
        addTab(data.path)
        navigate({ to: data.path })
      }
    )
    return () => {
      if (removeListener) removeListener()
    }
  }, [addTab, navigate])

  // When opened as a detached window, restore workspace context from URL params
  useEffect(() => {
    if (!isAnyWindowMode) return
    const searchParams = new URLSearchParams(window.location.search)
    const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '')
    const wpFromSearch = searchParams.get('wp')
    const wpFromHash = hashParams.get('wp')
    const workspacePath = wpFromSearch || wpFromHash

    const dosyaId = searchParams.get('dosyaId') || hashParams.get('dosyaId')
    if (dosyaId) {
      sessionStorage.setItem('workspace_dosya_id', dosyaId)
    }

    if (workspacePath) {
      const decodedPath = decodeURIComponent(workspacePath)
      sessionStorage.setItem('workspace_path', decodedPath)
      sessionStorage.setItem('workspace_auth', 'true')

      useWorkspaceStore.setState({
        activeFilePath: decodedPath,
        fileName: decodedPath.split(/[/\\]/).pop() || 'Bilinmeyen Dosya',
        isAuthenticated: true,
        activeDosyaId: dosyaId ? parseInt(dosyaId, 10) : null
      })
      loadSettings()
      loadActiveMeta()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (isAnyWindowMode) return

    const handleDteFileOpen = async (filePath: string) => {
      const currentActivePath = useWorkspaceStore.getState().activeFilePath
      if (!currentActivePath) {
        alert(
          `Dışarıdan veri aktarım dosyası (.dte) algılandı, ancak aktif bir kurum dosyası açık değil.\nLütfen önce bir çalışma dosyası (.dtal) açın veya oluşturun.`
        )
        return
      }

      const fileBaseName = filePath.split('\\').pop()?.split('/').pop() || 'veri'
      const confirmImport = confirm(
        `"${fileBaseName}" veri dosyasındaki kayıtları aktif kurumunuza aktarmak istiyor musunuz?`
      )

      if (!confirmImport) return

      try {
        const res = await window.electron.ipcRenderer.invoke('db:import-dte', filePath)
        if (res.success) {
          let msg = ''
          if (res.importedFirmsCount > 0) {
            msg += `${res.importedFirmsCount} adet firma `
          }
          if (res.importedItemsCount > 0) {
            msg += `${msg ? 've ' : ''}${res.importedItemsCount} adet malzeme/hizmet kalemi `
          }

          if (!msg) {
            msg = 'Aktarılacak yeni kayıt bulunamadı veya atlandı.'
          } else {
            msg += 'başarıyla içe aktarıldı.'
          }

          if (res.warnings && res.warnings.length > 0) {
            msg += `\n(Uyarılar: ${res.warnings.join(', ')})`
          }

          alert(msg)
          queryClient.clear()
        } else {
          alert(`İçe aktarma başarısız oldu!\nHata: ${res.error || 'Bilinmeyen hata'}`)
        }
      } catch (err: any) {
        alert(`İçe aktarma sırasında hata oluştu!\nHata: ${err.message}`)
      }
    }

    const handleOpenExternalWorkspace = async (filePath: string) => {
      if (!filePath) return
      try {
        if (filePath.toLowerCase().endsWith('.dte')) {
          handleDteFileOpen(filePath)
          return
        }

        if (!filePath.toLowerCase().endsWith('.temin')) {
          setUpgradeFilePath(filePath)
          setShowFormatUpgradeModal(true)
          return
        }

        let result = await openWorkspace(filePath, false)
        if (result.requiresMigration) {
          result = await openWorkspace(filePath, true)
        }

        if (result.success) {
          queryClient.clear()
          clearTabs()
          navigate({ to: '/' })
        } else if (result.error) {
          alert(`Çalışma dosyası açılamadı!\n\nDosya: ${filePath}\nHata: ${result.error}`)
        }
      } catch (err: any) {
        console.error('External file open error:', err)
        alert(`Çalışma dosyası açılırken hata oluştu!\n\nHata: ${err.message}`)
      }
    }

    let isMounted = true

    const initWorkspace = async (): Promise<void> => {
      try {
        const initialFile = await window.electron?.ipcRenderer.invoke('get-initial-file')
        if (initialFile) {
          console.log('[PageWrapper] Başlangıçta çift tıklanan dosya açılıyor:', initialFile)
          await handleOpenExternalWorkspace(initialFile)
          return
        }
      } catch (e) {
        console.warn('get-initial-file hatası:', e)
      }

      try {
        const res = await window.electron?.ipcRenderer.invoke('db:get-settings')
        const dbIsOpen = res && res.institutionName && !res.institutionName.includes('Hata')
        const targetPath = activeFilePath || localStorage.getItem('workspace_path')

        if (!dbIsOpen && targetPath && isMounted) {
          let result = await openWorkspace(targetPath, false)
          if (result.requiresMigration) {
            result = await openWorkspace(targetPath, true)
          }
          if (result.success) queryClient.clear()
        } else if (!dbIsOpen && isMounted) {
          const recent = await window.electron?.ipcRenderer.invoke('app:get-recent-files')
          if (recent && recent.length > 0 && recent[0]?.path && isMounted) {
            let result = await openWorkspace(recent[0].path, false)
            if (result.requiresMigration) {
              result = await openWorkspace(recent[0].path, true)
            }
            if (result.success) queryClient.clear()
          }
        }
      } catch (e) {
        console.warn('Otomatik son dosya yükleme başarısız:', e)
      }
    }

    initWorkspace()

    const removeListener = window.electron?.ipcRenderer.on(
      'open-external-file',
      async (_, filePath) => {
        handleOpenExternalWorkspace(filePath)
      }
    )

    const removeNavListener = window.electron?.ipcRenderer.on('app:navigate', (_, route) => {
      if (route) {
        navigate({ to: route })
      }
    })

    return () => {
      isMounted = false
      if (removeListener) removeListener()
      if (removeNavListener) removeNavListener()
    }
  }, [isAnyWindowMode, activeFilePath, clearTabs, navigate, openWorkspace, queryClient])

  return {
    showFormatUpgradeModal,
    setShowFormatUpgradeModal,
    upgradeFilePath,
    handleUpgradeAndOpen
  }
}

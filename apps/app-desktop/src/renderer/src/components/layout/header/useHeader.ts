import { useEffect, useState, useCallback } from 'react'
import { useNavigate, NavigateFn } from '@tanstack/react-router'
import { useTheme } from '../../providers/ThemeProvider'
import { useWorkspaceStore } from '../../../store/workspaceStore'
import { useSettingsStore } from '../../../store/settingsStore'

export function calculateMaxVisibleMenus(): number {
  const w = typeof window !== 'undefined' ? window.innerWidth : 1280
  if (w >= 1520) return 7
  if (w >= 1340) return 5
  if (w >= 1180) return 4
  if (w >= 1020) return 3
  return 2
}

export interface UseHeaderReturn {
  navigate: NavigateFn
  theme: string
  setTheme: (theme: 'dark' | 'light' | 'system') => void
  activeDosyaId: number | null
  fileName: string | null
  isDirty: boolean
  isOldFormat: boolean
  institutionLogo: string | null
  logoLeft: string | null
  showFormatUpgradeModal: boolean
  setShowFormatUpgradeModal: (show: boolean) => void
  showAboutModal: boolean
  setShowAboutModal: (show: boolean) => void
  upgradeFilePath: string | null
  setUpgradeFilePath: (path: string | null) => void
  showUpdateModal: boolean
  setShowUpdateModal: (show: boolean) => void
  switchFeedback: string | null
  saveFeedback: string | null
  updateStatus: { status: string; version?: string } | null
  maxVisibleMenus: number
  procurementMode: 'dogrudan_temin' | 'ihale' | 'devlet_ihale_2886'
  isDt: boolean
  handleUpgradeAndOpen: (filePath: string) => Promise<void>
  handleModeChange: (mode: 'dogrudan_temin' | 'ihale' | 'devlet_ihale_2886') => void
  handleSaveAndSync: () => Promise<void>
  handleCloseWorkspace: () => Promise<void>
  handleClose: () => void
}

export function useHeader(): UseHeaderReturn {
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()
  const { activeDosyaId, fileName, isDirty, activeFilePath } = useWorkspaceStore()
  const { institutionLogo, logoLeft } = useSettingsStore()

  const [showFormatUpgradeModal, setShowFormatUpgradeModal] = useState(false)
  const [showAboutModal, setShowAboutModal] = useState(false)
  const [upgradeFilePath, setUpgradeFilePath] = useState<string | null>(null)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [switchFeedback, setSwitchFeedback] = useState<string | null>(null)
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null)
  const [updateStatus, setUpdateStatus] = useState<{ status: string; version?: string } | null>(
    null
  )

  const activeExt = (activeFilePath?.split('.').pop() || '').toLowerCase()
  const isOldFormat = Boolean(activeFilePath && activeExt !== 'temin')

  const [maxVisibleMenus, setMaxVisibleMenus] = useState<number>(calculateMaxVisibleMenus)

  const [procurementMode, setProcurementMode] = useState<
    'dogrudan_temin' | 'ihale' | 'devlet_ihale_2886'
  >(() => {
    return (
      (localStorage.getItem('temin_procurement_mode') as
        | 'dogrudan_temin'
        | 'ihale'
        | 'devlet_ihale_2886') || 'dogrudan_temin'
    )
  })

  const isDt = procurementMode === 'dogrudan_temin'

  const handleUpgradeAndOpen = useCallback(async (filePath: string): Promise<void> => {
    const result = await useWorkspaceStore.getState().convertAndOpenWorkspace(filePath)
    if (result.success) {
      window.location.reload()
    } else {
      throw new Error(result.error || 'Dönüştürme başarısız oldu.')
    }
  }, [])

  const handleModeChange = useCallback(
    (mode: 'dogrudan_temin' | 'ihale' | 'devlet_ihale_2886'): void => {
      setProcurementMode((prev) => {
        if (prev === mode) return prev
        localStorage.setItem('temin_procurement_mode', mode)
        window.dispatchEvent(new CustomEvent('procurement-mode-change', { detail: { mode } }))

        let message = 'Doğrudan Temin Modu (KİK Md. 22) Aktif'
        if (mode === 'ihale') {
          message = 'İhale Süreçleri Modu (KİK Md. 19 / 21) Aktif'
        } else if (mode === 'devlet_ihale_2886') {
          message = '2886 Devlet İhale Kanunu Modu (Satış & Kiralama) Aktif'
        }

        setSwitchFeedback(message)
        setTimeout(() => setSwitchFeedback(null), 2400)
        return mode
      })
    },
    []
  )

  const handleSaveAndSync = useCallback(async (): Promise<void> => {
    try {
      setSaveFeedback('💾 Dosya kaydediliyor...')
      const saveRes = await window.electron?.ipcRenderer.invoke('workspace:save')
      if (!saveRes?.success) throw new Error(saveRes?.error || 'Dosya kaydedilemedi.')

      const s = await window.electron?.ipcRenderer.invoke('db:get-settings')
      if (s?.gdriveAccessToken) {
        setSaveFeedback('☁️ Google Drive bulutuna yedekleniyor...')
        const gdriveRes = await window.electron?.ipcRenderer.invoke('workspace:backup-gdrive', {
          force: true
        })
        if (gdriveRes?.success) {
          setSaveFeedback(
            gdriveRes?.skipped
              ? '✓ Kaydedildi (Drive yedeği güncel)'
              : "✓ Kaydedildi ve Drive'a yedeklendi"
          )
        } else {
          setSaveFeedback(`⚠️ Kaydedildi, bulut uyarısı: ${gdriveRes?.error || 'Yetki hatası'}`)
        }
      } else {
        setSaveFeedback('✓ Çalışma dosyası başarıyla kaydedildi')
      }
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : String(e)
      setSaveFeedback(`❌ Kaydetme hatası: ${errorMsg}`)
    } finally {
      setTimeout(() => setSaveFeedback(null), 3500)
    }
  }, [])

  const handleCloseWorkspace = useCallback(async (): Promise<void> => {
    window.dispatchEvent(new CustomEvent('workspace-close-request'))
  }, [])

  const handleClose = useCallback((): void => {
    window.electron?.ipcRenderer.send('window-close')
  }, [])

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null
    const handleResize = (): void => {
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        const next = calculateMaxVisibleMenus()
        setMaxVisibleMenus((prev) => (prev !== next ? next : prev))
      }, 100)
    }
    window.addEventListener('resize', handleResize)
    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  useEffect(() => {
    const handleModeEvent = (e: Event): void => {
      const customEvent = e as CustomEvent<{
        mode: 'dogrudan_temin' | 'ihale' | 'devlet_ihale_2886'
      }>
      if (customEvent.detail?.mode) setProcurementMode(customEvent.detail.mode)
    }
    window.addEventListener('procurement-mode-change', handleModeEvent)
    return () => window.removeEventListener('procurement-mode-change', handleModeEvent)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        handleSaveAndSync()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleSaveAndSync])

  useEffect(() => {
    const removeListener = window.electron?.ipcRenderer.on(
      'updater:status',
      (_event, data: { status: string; version?: string }) => {
        setUpdateStatus(data)
        if (data.status === 'downloaded') setShowUpdateModal(true)
      }
    )
    return () => {
      if (removeListener) removeListener()
    }
  }, [])

  return {
    navigate,
    theme,
    setTheme,
    activeDosyaId,
    fileName,
    isDirty,
    isOldFormat,
    institutionLogo,
    logoLeft,
    showFormatUpgradeModal,
    setShowFormatUpgradeModal,
    showAboutModal,
    setShowAboutModal,
    upgradeFilePath,
    setUpgradeFilePath,
    showUpdateModal,
    setShowUpdateModal,
    switchFeedback,
    saveFeedback,
    updateStatus,
    maxVisibleMenus,
    procurementMode,
    isDt,
    handleUpgradeAndOpen,
    handleModeChange,
    handleSaveAndSync,
    handleCloseWorkspace,
    handleClose
  }
}

import { useEffect, useRef, useState, RefObject } from 'react'
import { useNavigate, NavigateFn } from '@tanstack/react-router'
import { useTheme } from '../../providers/ThemeProvider'
import { useWorkspaceStore } from '../../../store/workspaceStore'
import { useSettingsStore } from '../../../store/settingsStore'
import { DirtySummaryData } from './header.types'

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
  activeMenu: string | null
  setActiveMenu: (menu: string | null) => void
  hoveredSubMenu: string | null
  setHoveredSubMenu: (menu: string | null) => void
  showFormatUpgradeModal: boolean
  setShowFormatUpgradeModal: (show: boolean) => void
  showAboutModal: boolean
  setShowAboutModal: (show: boolean) => void
  upgradeFilePath: string | null
  setUpgradeFilePath: (path: string | null) => void
  showUpdateModal: boolean
  setShowUpdateModal: (show: boolean) => void
  showNotifications: boolean
  setShowNotifications: (show: boolean) => void
  switchFeedback: string | null
  saveFeedback: string | null
  isDirtySummaryOpen: boolean
  setIsDirtySummaryOpen: (open: boolean) => void
  dirtySummary: DirtySummaryData | null
  isLoadingSummary: boolean
  dirtySummaryRef: RefObject<HTMLDivElement | null>
  updateStatus: { status: string; version?: string } | null
  windowWidth: number
  procurementMode: 'dogrudan_temin' | 'ihale' | 'devlet_ihale_2886'
  isDt: boolean
  handleUpgradeAndOpen: (filePath: string) => Promise<void>
  toggleDirtySummary: () => void
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

  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [hoveredSubMenu, setHoveredSubMenu] = useState<string | null>(null)
  const [showFormatUpgradeModal, setShowFormatUpgradeModal] = useState(false)
  const [showAboutModal, setShowAboutModal] = useState(false)
  const [upgradeFilePath, setUpgradeFilePath] = useState<string | null>(null)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [switchFeedback, setSwitchFeedback] = useState<string | null>(null)
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null)
  const [isDirtySummaryOpen, setIsDirtySummaryOpen] = useState(false)
  const [dirtySummary, setDirtySummary] = useState<DirtySummaryData | null>(null)
  const [isLoadingSummary, setIsLoadingSummary] = useState(false)
  const [updateStatus, setUpdateStatus] = useState<{ status: string; version?: string } | null>(
    null
  )
  const dirtySummaryRef = useRef<HTMLDivElement>(null)

  const activeExt = (activeFilePath?.split('.').pop() || '').toLowerCase()
  const isOldFormat = Boolean(activeFilePath && activeExt !== 'temin')

  const [windowWidth, setWindowWidth] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1280
  )

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

  const handleUpgradeAndOpen = async (filePath: string): Promise<void> => {
    const result = await useWorkspaceStore.getState().convertAndOpenWorkspace(filePath)
    if (result.success) {
      window.location.reload()
    } else {
      throw new Error(result.error || 'Dönüştürme başarısız oldu.')
    }
  }

  const loadDirtySummary = async (): Promise<void> => {
    try {
      setIsLoadingSummary(true)
      const res = await window.electron?.ipcRenderer.invoke('workspace:get-dirty-summary')
      if (res?.success) {
        setDirtySummary({
          totalChanges: res.totalChanges ?? 0,
          lastModifiedAt: res.lastModifiedAt ?? null,
          items: res.items ?? []
        })
      } else {
        setDirtySummary({
          totalChanges: 1,
          lastModifiedAt: null,
          items: [
            {
              tableName: 'Veritabanı',
              title: 'Çalışma Dosyası Değişiklikleri',
              action: 'other',
              actionLabel: 'Düzenlendi',
              count: 1,
              lastTime: 'Az önce'
            }
          ]
        })
      }
    } catch {
      setDirtySummary({
        totalChanges: 1,
        lastModifiedAt: null,
        items: [
          {
            tableName: 'Veritabanı',
            title: 'Çalışma Dosyası Değişiklikleri',
            action: 'other',
            actionLabel: 'Düzenlendi',
            count: 1,
            lastTime: 'Az önce'
          }
        ]
      })
    } finally {
      setIsLoadingSummary(false)
    }
  }

  const toggleDirtySummary = (): void => {
    if (!isDirtySummaryOpen) {
      loadDirtySummary()
    }
    setIsDirtySummaryOpen((prev) => !prev)
  }

  const handleModeChange = (mode: 'dogrudan_temin' | 'ihale' | 'devlet_ihale_2886'): void => {
    if (mode === procurementMode) return
    setProcurementMode(mode)
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
  }

  const handleSaveAndSync = async (): Promise<void> => {
    try {
      setIsDirtySummaryOpen(false)
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
  }

  const handleCloseWorkspace = async (): Promise<void> => {
    window.dispatchEvent(new CustomEvent('workspace-close-request'))
  }

  const handleClose = (): void => window.electron?.ipcRenderer.send('window-close')

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (dirtySummaryRef.current && !dirtySummaryRef.current.contains(event.target as Node)) {
        setIsDirtySummaryOpen(false)
      }
    }
    if (isDirtySummaryOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isDirtySummaryOpen])

  useEffect(() => {
    const handleResize = (): void => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
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
  }, [])

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

  useEffect(() => {
    const menuBar = document.getElementById('native-menu-bar')
    function handleClickOutside(e: MouseEvent): void {
      if (menuBar && !menuBar.contains(e.target as Node)) {
        setActiveMenu(null)
        setHoveredSubMenu(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
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
    activeMenu,
    setActiveMenu,
    hoveredSubMenu,
    setHoveredSubMenu,
    showFormatUpgradeModal,
    setShowFormatUpgradeModal,
    showAboutModal,
    setShowAboutModal,
    upgradeFilePath,
    setUpgradeFilePath,
    showUpdateModal,
    setShowUpdateModal,
    showNotifications,
    setShowNotifications,
    switchFeedback,
    saveFeedback,
    isDirtySummaryOpen,
    setIsDirtySummaryOpen,
    dirtySummary,
    isLoadingSummary,
    dirtySummaryRef,
    updateStatus,
    windowWidth,
    procurementMode,
    isDt,
    handleUpgradeAndOpen,
    toggleDirtySummary,
    handleModeChange,
    handleSaveAndSync,
    handleCloseWorkspace,
    handleClose
  }
}

import { useState, useCallback, useEffect } from 'react'
import { useNavigate, NavigateFn } from '@tanstack/react-router'
import { useShallow } from 'zustand/react/shallow'
import { useTheme } from '../../providers/ThemeProvider'
import { useWorkspaceStore } from '../../../store/workspaceStore'
import { useSettingsStore } from '../../../store/settingsStore'
import { useProcurementMode } from './hooks/useProcurementMode'
import { useWorkspaceSave } from './hooks/useWorkspaceSave'
import { useUpdaterStatus } from './hooks/useUpdaterStatus'
import { useVisibleMenuCount } from './hooks/useVisibleMenuCount'
import { ProcurementMode } from '../temin-selector/teminSelector.types'

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
  setShowFormatUpgradeModal: React.Dispatch<React.SetStateAction<boolean>>
  showAboutModal: boolean
  setShowAboutModal: React.Dispatch<React.SetStateAction<boolean>>
  upgradeFilePath: string | null
  setUpgradeFilePath: React.Dispatch<React.SetStateAction<string | null>>
  showUpdateModal: boolean
  setShowUpdateModal: React.Dispatch<React.SetStateAction<boolean>>
  switchFeedback: string | null
  saveFeedback: string | null
  updateStatus: { status: string; version?: string } | null
  maxVisibleMenus: number
  procurementMode: ProcurementMode
  isDt: boolean
  handleUpgradeAndOpen: (filePath: string) => Promise<void>
  handleModeChange: (mode: ProcurementMode) => void
  handleSaveAndSync: () => Promise<void>
  handleCloseWorkspace: () => Promise<void>
  handleClose: () => void
}

export function useHeader(): UseHeaderReturn {
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()

  const { activeDosyaId, fileName, isDirty, activeFilePath } = useWorkspaceStore(
    useShallow((state) => ({
      activeDosyaId: state.activeDosyaId,
      fileName: state.fileName,
      isDirty: state.isDirty,
      activeFilePath: state.activeFilePath
    }))
  )

  const { institutionLogo, logoLeft } = useSettingsStore(
    useShallow((state) => ({
      institutionLogo: state.institutionLogo,
      logoLeft: state.logoLeft
    }))
  )

  const [showFormatUpgradeModal, setShowFormatUpgradeModal] = useState(false)
  const [showAboutModal, setShowAboutModal] = useState(false)
  const [upgradeFilePath, setUpgradeFilePath] = useState<string | null>(null)

  const { procurementMode, handleModeChange, isDt, switchFeedback } = useProcurementMode()
  const { saveFeedback, handleSaveAndSync } = useWorkspaceSave()
  const { updateStatus, showUpdateModal, setShowUpdateModal } = useUpdaterStatus()
  const maxVisibleMenus = useVisibleMenuCount()

  const activeExt = (activeFilePath?.split('.').pop() || '').toLowerCase()
  const isOldFormat = Boolean(activeFilePath && activeExt !== 'temin')

  const handleUpgradeAndOpen = useCallback(async (filePath: string): Promise<void> => {
    const result = await useWorkspaceStore.getState().convertAndOpenWorkspace(filePath)
    if (result.success) {
      window.location.reload()
    } else {
      throw new Error(result.error || 'Dönüştürme başarısız oldu.')
    }
  }, [])

  const handleCloseWorkspace = useCallback(async (): Promise<void> => {
    window.dispatchEvent(new CustomEvent('workspace-close-request'))
  }, [])

  const handleClose = useCallback((): void => {
    window.electron?.ipcRenderer.send('window-close')
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

import React, { useEffect } from 'react'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { Header } from './Header'
import { ActiveFileSidebar } from './ActiveFileSidebar'
import { ActiveFileShortcuts } from './ActiveFileShortcuts'
import { Footer } from './Footer'
import { TabsBar } from './TabsBar'
import { useWorkspaceStore } from '../../store/workspaceStore'
import { useSettingsStore } from '../../store/settingsStore'
import { normalizePath, useTabStore } from '../../store/tabStore'
import LauncherScreen from '../../screens/launcher/index.screen'
import LockScreen from './LockScreen'
import { DisclaimerModal } from '../modals/DisclaimerModal'
import { routeComponents } from './routeComponents'
import { FindInPage } from './FindInPage'
import { WorkspaceCloseModal } from './WorkspaceCloseModal'
import { ShutdownOverlay } from './ShutdownOverlay'
import { GoogleDriveModal } from '../ui/GoogleDriveModal'
import { GlobalDocumentPreviewHost } from './GlobalDocumentPreviewHost'
import { FormatUpgradeModal } from '../modals/FormatUpgradeModal'
import { SayiyiYaziyaCevirModal } from '../modals/SayiyiYaziyaCevirModal'

import { useDocumentTitle } from './hooks/useDocumentTitle'
import { useGlobalInteractivityGuard } from './hooks/useGlobalInteractivityGuard'
import { useSayiyiYaziyaCevirModal } from './hooks/useSayiyiYaziyaCevirModal'
import { useInactiveTabCleaner } from './hooks/useInactiveTabCleaner'
import { useWorkspaceCloseHandler } from './hooks/useWorkspaceCloseHandler'
import { useWorkspaceLifecycle } from './hooks/useWorkspaceLifecycle'
import { DetachedWindowLayout } from './components/DetachedWindowLayout'

export function PageWrapper(): React.ReactNode {
  const routerState = useRouterState()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const searchParams = new URLSearchParams(window.location.search)
  const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '')
  const isWindowMode = searchParams.get('mode') === 'window' || hashParams.get('mode') === 'window'
  const isDosyaWindowMode =
    searchParams.get('mode') === 'dosya_window' || hashParams.get('mode') === 'dosya_window'
  const isAnyWindowMode = isWindowMode || isDosyaWindowMode

  useDocumentTitle(routerState.location.pathname)
  useGlobalInteractivityGuard(routerState.location.href)

  const { isSayiModalOpen, sayiInitialVal, setIsSayiModalOpen } = useSayiyiYaziyaCevirModal()

  const {
    activeFilePath,
    isAuthenticated,
    loadActiveMeta,
    activeDosyaId,
    setActiveDosyaId,
    closeWorkspace,
    fileName
  } = useWorkspaceStore()
  const { unifiedStepperMode, loadSettings } = useSettingsStore()

  useEffect(() => {
    const idParam = searchParams.get('id')
    if (idParam) {
      const id = parseInt(idParam, 10)
      if (!isNaN(id) && activeDosyaId !== id) {
        setActiveDosyaId(id)
      }
    }
  }, [window.location.search, setActiveDosyaId, activeDosyaId])

  const { tabs, activeTabPath, addTab, clearTabs, clearDosyaTabs } = useTabStore()

  const isDosyaAsamasi = [
    '/dosya/hazirlik-ve-ihtiyac',
    '/dosya/piyasa-fiyat-arastirmasi',
    '/dosya/siparis-ve-sozlesme',
    '/dosya/kabul-ve-odeme',
    '/dosya/klasor-ve-kapaklar'
  ].some((path) => activeTabPath && activeTabPath.includes(path))

  const showRightSidebar = !(unifiedStepperMode && isDosyaAsamasi)

  const {
    isCloseModalOpen,
    setIsCloseModalOpen,
    isGDriveModalOpen,
    setIsGDriveModalOpen,
    isShuttingDown,
    shutdownStatusText,
    shutdownSteps,
    handleConfirmClose
  } = useWorkspaceCloseHandler(closeWorkspace, queryClient)

  const { expiredPaths } = useInactiveTabCleaner(tabs, activeTabPath)

  const {
    showFormatUpgradeModal,
    setShowFormatUpgradeModal,
    upgradeFilePath,
    handleUpgradeAndOpen
  } = useWorkspaceLifecycle(isAnyWindowMode, navigate, queryClient)

  useEffect(() => {
    if (activeFilePath && isAuthenticated) {
      loadSettings()
      loadActiveMeta()
    }
  }, [activeFilePath, isAuthenticated, loadSettings, loadActiveMeta])

  useEffect(() => {
    if (isAnyWindowMode) return
    if (activeFilePath && isAuthenticated) {
      addTab(routerState.location.href)
    }
  }, [routerState.location.href, activeFilePath, isAuthenticated, addTab, isAnyWindowMode])

  useEffect(() => {
    if (isAnyWindowMode) return
    if (!activeFilePath || !isAuthenticated) {
      clearTabs()
    }
  }, [activeFilePath, isAuthenticated, clearTabs, isAnyWindowMode])

  useEffect(() => {
    if (isAnyWindowMode) return
    if (activeDosyaId === null) {
      clearDosyaTabs()
    }
  }, [activeDosyaId, clearDosyaTabs, isAnyWindowMode])

  if (isAnyWindowMode) {
    return <DetachedWindowLayout isDosyaWindowMode={isDosyaWindowMode} routerState={routerState} />
  }

  if (!activeFilePath) {
    return <LauncherScreen />
  }

  if (!isAuthenticated) {
    return <LockScreen />
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <DisclaimerModal />
      <SayiyiYaziyaCevirModal
        isOpen={isSayiModalOpen}
        onClose={() => setIsSayiModalOpen(false)}
        initialValue={sayiInitialVal}
      />
      <FindInPage />
      <div className="flex flex-col flex-1 min-w-0">
        <Header />
        <TabsBar />
        <div className="flex flex-1 overflow-hidden relative">
          {activeDosyaId && <ActiveFileShortcuts />}
          <main className="flex-1 relative overflow-hidden">
            {tabs.map((tab) => {
              const isActive = tab.path === activeTabPath
              const isExpired = expiredPaths[tab.path]

              if (isExpired) return null

              const cleanPath = normalizePath(tab.path).split('?')[0]
              const Component = routeComponents[cleanPath]
              if (!Component) return null

              return (
                <div
                  key={tab.path}
                  style={{ display: isActive ? 'block' : 'none' }}
                  className="h-full w-full absolute inset-0 p-6 overflow-auto"
                >
                  <Component />
                </div>
              )
            })}
          </main>
          {activeDosyaId && showRightSidebar && <ActiveFileSidebar />}
        </div>
        <Footer />
      </div>

      <WorkspaceCloseModal
        isOpen={isCloseModalOpen}
        onClose={() => setIsCloseModalOpen(false)}
        fileName={fileName}
        onConfirm={handleConfirmClose}
      />
      <GoogleDriveModal isOpen={isGDriveModalOpen} onClose={() => setIsGDriveModalOpen(false)} />
      <GlobalDocumentPreviewHost />
      <FormatUpgradeModal
        isOpen={showFormatUpgradeModal}
        filePath={upgradeFilePath}
        onClose={() => {
          setShowFormatUpgradeModal(false)
        }}
        onUpgradeAndOpen={handleUpgradeAndOpen}
      />
      <ShutdownOverlay
        isOpen={isShuttingDown}
        fileName={fileName}
        statusText={shutdownStatusText}
        steps={shutdownSteps}
      />
    </div>
  )
}

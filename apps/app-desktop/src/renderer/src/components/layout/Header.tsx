import React, { useMemo } from 'react'
import { Sparkles } from 'lucide-react'
import { FormatUpgradeModal } from '../modals/FormatUpgradeModal'
import { UpdateModal } from '../ui/UpdateModal'
import { AboutModal } from '../ui/AboutModal'
import { WindowControls } from './header/WindowControls'
import { NativeMenuBar } from './header/NativeMenuBar'
import { DirtySummaryPopover } from './header/DirtySummaryPopover'
import { HeaderActions } from './header/HeaderActions'
import { HeaderBottomRow } from './header/HeaderBottomRow'
import { useHeader } from './header/useHeader'
import { getHeaderMenus } from './header/headerNavigation'

export function Header(): React.JSX.Element {
  const {
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
  } = useHeader()

  const menus = useMemo(
    () =>
      getHeaderMenus({
        navigate,
        procurementMode,
        activeDosyaId,
        isOldFormat,
        handleSaveAndSync,
        handleCloseWorkspace,
        handleClose,
        setUpgradeFilePath,
        setShowFormatUpgradeModal,
        setShowAboutModal
      }),
    [
      navigate,
      procurementMode,
      activeDosyaId,
      isOldFormat,
      handleSaveAndSync,
      handleCloseWorkspace,
      handleClose,
      setUpgradeFilePath,
      setShowFormatUpgradeModal,
      setShowAboutModal
    ]
  )

  const maxVisibleMenus = useMemo(() => {
    if (windowWidth >= 1520) return 7
    if (windowWidth >= 1340) return 5
    if (windowWidth >= 1180) return 4
    if (windowWidth >= 1020) return 3
    return 2
  }, [windowWidth])

  const visibleMenus = menus.slice(0, maxVisibleMenus)
  const overflowMenus = menus.slice(maxVisibleMenus)

  return (
    <header
      className="flex flex-col bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 shrink-0 z-50 shadow-xs transition-all duration-300 relative select-none"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* Üst Vurgu Çizgisi: Seçilen moda göre renk tonu */}
      <div
        className={`h-0.5 w-full transition-all duration-500 bg-linear-to-r ${
          isDt
            ? 'from-blue-500 via-sky-400 to-indigo-500'
            : 'from-indigo-600 via-purple-500 to-pink-500'
        }`}
      />

      {/* Mod Geçiş Bildirimi Toast */}
      {switchFeedback && (
        <div className="absolute top-10 left-1/2 -translate-x-1/2 z-200 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/95 dark:bg-slate-100/95 text-white dark:text-slate-900 text-xs font-semibold shadow-xl border border-slate-700/50 dark:border-slate-300/50 animate-in fade-in zoom-in-95 duration-200 pointer-events-none">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{switchFeedback}</span>
        </div>
      )}

      {/* ÜST SATIR: Menü Çubuğu, Çalışma Dosyası Özeti ve Sistem Kontrolleri */}
      <div className="h-9 flex items-center justify-between px-3 border-b border-slate-200/40 dark:border-slate-800/40 relative z-40">
        <NativeMenuBar
          visibleMenus={visibleMenus}
          overflowMenus={overflowMenus}
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          hoveredSubMenu={hoveredSubMenu}
          setHoveredSubMenu={setHoveredSubMenu}
          isDt={isDt}
          logo={institutionLogo || logoLeft}
        />

        <DirtySummaryPopover
          fileName={fileName}
          isDirty={isDirty}
          saveFeedback={saveFeedback}
          isDirtySummaryOpen={isDirtySummaryOpen}
          toggleDirtySummary={toggleDirtySummary}
          dirtySummaryRef={dirtySummaryRef}
          dirtySummary={dirtySummary}
          isLoadingSummary={isLoadingSummary}
          handleSaveAndSync={handleSaveAndSync}
          setIsDirtySummaryOpen={setIsDirtySummaryOpen}
        />

        <HeaderActions
          theme={theme}
          setTheme={setTheme}
          navigate={navigate}
          updateStatus={updateStatus}
          setShowUpdateModal={setShowUpdateModal}
          showNotifications={showNotifications}
          setShowNotifications={setShowNotifications}
        />

        <WindowControls />
      </div>

      {/* ALT SATIR: Çalışma Dosyası Seçimi, Mod Rozeti & Süreç Butonları */}
      <HeaderBottomRow
        isDt={isDt}
        procurementMode={procurementMode}
        handleModeChange={handleModeChange}
        activeDosyaId={activeDosyaId}
      />

      {saveFeedback && (
        <div className="absolute top-10 left-1/2 -translate-x-1/2 z-50 px-4 py-1.5 rounded-full shadow-lg text-xs font-medium bg-slate-900/95 dark:bg-slate-800 text-white backdrop-blur border border-slate-700 flex items-center gap-2 pointer-events-none transition-all duration-300">
          <span>{saveFeedback}</span>
        </div>
      )}

      <FormatUpgradeModal
        isOpen={showFormatUpgradeModal}
        filePath={upgradeFilePath}
        onClose={() => setShowFormatUpgradeModal(false)}
        onUpgradeAndOpen={handleUpgradeAndOpen}
      />

      <UpdateModal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        version={updateStatus?.version}
        status={updateStatus?.status}
      />

      <AboutModal isOpen={showAboutModal} onClose={() => setShowAboutModal(false)} />
    </header>
  )
}
export default Header

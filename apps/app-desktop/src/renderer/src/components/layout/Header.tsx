import React, { useMemo, Suspense, lazy } from 'react'
import { Sparkles } from 'lucide-react'
import { WindowControls } from './header/WindowControls'
import { NativeMenuBar } from './header/NativeMenuBar'
import { DirtySummaryPopover } from './header/DirtySummaryPopover'
import { HeaderActions } from './header/HeaderActions'
import { HeaderBottomRow } from './header/HeaderBottomRow'
import { useHeader } from './header/useHeader'
import { getHeaderMenus } from './header/headerNavigation'

const FormatUpgradeModal = lazy(() =>
  import('../modals/FormatUpgradeModal').then((m) => ({ default: m.FormatUpgradeModal }))
)
const UpdateModal = lazy(() =>
  import('../ui/UpdateModal').then((m) => ({ default: m.UpdateModal }))
)
const AboutModal = lazy(() => import('../ui/AboutModal').then((m) => ({ default: m.AboutModal })))

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

  const visibleMenus = useMemo(() => menus.slice(0, maxVisibleMenus), [menus, maxVisibleMenus])
  const overflowMenus = useMemo(() => menus.slice(maxVisibleMenus), [menus, maxVisibleMenus])

  return (
    <header
      className="flex flex-col bg-slate-50/95 dark:bg-slate-900/95 border-b border-slate-200/50 dark:border-slate-800/50 shrink-0 z-50 shadow-xs relative select-none"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* Üst Vurgu Çizgisi */}
      <div
        className={`h-0.5 w-full bg-linear-to-r ${
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
        {/* Sol Alan: Uygulama Menüleri */}
        <div className="flex items-center min-w-0 shrink-0">
          <NativeMenuBar
            visibleMenus={visibleMenus}
            overflowMenus={overflowMenus}
            isDt={isDt}
            logo={institutionLogo || logoLeft}
          />
        </div>

        {/* Orta Alan: Çalışma Dosyası ve Kaydetme Durumu */}
        <div className="flex-1 flex items-center justify-center min-w-0 px-2">
          <DirtySummaryPopover
            fileName={fileName}
            isDirty={isDirty}
            saveFeedback={saveFeedback}
            handleSaveAndSync={handleSaveAndSync}
          />
        </div>

        {/* Sağ Alan: Hızlı Araçlar ve Pencere Kontrolleri */}
        <div className="flex items-center gap-2 shrink-0">
          <HeaderActions
            theme={theme}
            setTheme={setTheme}
            navigate={navigate}
            updateStatus={updateStatus}
            setShowUpdateModal={setShowUpdateModal}
          />
          <WindowControls />
        </div>
      </div>

      {/* ALT SATIR: Çalışma Dosyası Seçimi, Mod Rozeti & Süreç Butonları */}
      <HeaderBottomRow
        isDt={isDt}
        procurementMode={procurementMode}
        handleModeChange={handleModeChange}
        activeDosyaId={activeDosyaId}
      />

      {/* Tembel (Lazy) Yüklenen Modallar: Sadece açıkken render edilir */}
      {showFormatUpgradeModal && (
        <Suspense fallback={null}>
          <FormatUpgradeModal
            isOpen={showFormatUpgradeModal}
            filePath={upgradeFilePath}
            onClose={(): void => setShowFormatUpgradeModal(false)}
            onUpgradeAndOpen={handleUpgradeAndOpen}
          />
        </Suspense>
      )}

      {showUpdateModal && (
        <Suspense fallback={null}>
          <UpdateModal
            isOpen={showUpdateModal}
            onClose={(): void => setShowUpdateModal(false)}
            version={updateStatus?.version}
            status={updateStatus?.status}
          />
        </Suspense>
      )}

      {showAboutModal && (
        <Suspense fallback={null}>
          <AboutModal isOpen={showAboutModal} onClose={(): void => setShowAboutModal(false)} />
        </Suspense>
      )}
    </header>
  )
}
export default Header

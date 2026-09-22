import React from 'react'
import {
  CheckSquare,
  Coins,
  DownloadCloud,
  Moon,
  Sun
} from 'lucide-react'
import { SyncPopover } from './SyncPopover'
import { NotificationPopover } from './NotificationPopover'

interface HeaderActionsProps {
  theme: string
  setTheme: (theme: 'light' | 'dark') => void
  navigate: (opts: { to: string }) => void
  updateStatus: { status: string; version?: string } | null
  setShowUpdateModal: (show: boolean) => void
  showNotifications: boolean
  setShowNotifications: (show: boolean) => void
}

export function HeaderActions({
  theme,
  setTheme,
  navigate,
  updateStatus,
  setShowUpdateModal,
  showNotifications,
  setShowNotifications
}: HeaderActionsProps): React.JSX.Element {
  return (
    <div
      className="flex items-center space-x-2 pr-36"
      style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
    >
      {/* Sayıyı Yazıya Çevirici Hızlı Araç */}
      <button
        onClick={() =>
          window.dispatchEvent(
            new CustomEvent('open:sayiyi-yaziya-cevir', {
              detail: { value: '282.112,00' }
            })
          )
        }
        className="p-1 text-slate-500 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400 transition-all rounded hover:bg-slate-200/50 dark:hover:bg-slate-800/50 cursor-pointer"
        title="Sayıyı Yazıya Çevirici (TL)"
      >
        <Coins className="w-3.5 h-3.5" />
      </button>

      {/* Notlar & Yapılacaklar (To-Do) Hızlı Erişim Butonu */}
      <button
        onClick={() => navigate({ to: '/notlar' })}
        className="p-1 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-all rounded hover:bg-slate-200/50 dark:hover:bg-slate-800/50 cursor-pointer"
        title="Notlar & Yapılacaklar Listesi (To-Do)"
      >
        <CheckSquare className="w-3.5 h-3.5" />
      </button>

      {/* Tema Değiştir */}
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="p-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-all rounded hover:bg-slate-200/50 dark:hover:bg-slate-800/50 cursor-pointer"
        title="Tema Değiştir"
      >
        {theme === 'dark' ? (
          <Sun className="w-3.5 h-3.5" />
        ) : (
          <Moon className="w-3.5 h-3.5" />
        )}
      </button>

      {/* Güncelleme Durumu */}
      {updateStatus &&
        (updateStatus.status === 'available' ||
          updateStatus.status === 'downloaded') && (
          <button
            type="button"
            onClick={() => setShowUpdateModal(true)}
            className={`relative flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all border shadow-xs cursor-pointer ${
              updateStatus.status === 'downloaded'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 animate-pulse'
                : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 hover:bg-blue-500/20'
            }`}
            title={
              updateStatus.status === 'downloaded'
                ? `Yeni sürüm hazır: ${updateStatus.version} (Kurmak için tıkla)`
                : `Yeni sürüm indiriliyor: ${updateStatus.version}...`
            }
          >
            <DownloadCloud className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {updateStatus.status === 'downloaded'
                ? `Güncelleme Hazır (${updateStatus.version || ''})`
                : `Güncelleniyor...`}
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                updateStatus.status === 'downloaded'
                  ? 'bg-emerald-500 animate-ping'
                  : 'bg-blue-500 animate-pulse'
              }`}
            />
          </button>
        )}

      {/* Senkronizasyon & Bulut Popover */}
      <SyncPopover />

      {/* Bildirim Popover */}
      <NotificationPopover
        isOpen={showNotifications}
        onToggle={setShowNotifications}
      />
    </div>
  )
}

import React, { useEffect, useRef, useState } from 'react'
import { Cloud, Shield, Wifi, WifiOff } from 'lucide-react'
import { GoogleDriveModal } from '../../ui/GoogleDriveModal'
import { useSyncStore } from '../../../store/syncStore'
import {
  ServerSyncForm,
  PocketBaseSyncForm,
  MinIOSyncForm,
  GDriveSyncForm
} from './SyncProviderForms'

type SyncProviderId = 'server' | 'pocketbase' | 'minio' | 'gdrive'

export function SyncPopover(): React.JSX.Element {
  const [showSyncPopover, setShowSyncPopover] = useState(false)
  const [showGDriveModal, setShowGDriveModal] = useState(false)
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )
  const syncRef = useRef<HTMLDivElement>(null)

  const { isOnlineMode, activeProvider, setActiveProvider, loadSettings } = useSyncStore()

  useEffect(() => {
    loadSettings()
    const handleOnline = (): void => setIsOnline(true)
    const handleOffline = (): void => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [loadSettings])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (syncRef.current && !syncRef.current.contains(event.target as Node)) {
        setShowSyncPopover(false)
      }
    }
    if (showSyncPopover) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showSyncPopover])

  return (
    <div className="relative" ref={syncRef}>
      <button
        onClick={() => setShowSyncPopover(!showSyncPopover)}
        className={`px-2 py-0.5 rounded text-[9px] font-bold border transition-all flex items-center gap-1 cursor-pointer ${
          !isOnlineMode
            ? 'bg-amber-500/10 text-amber-650 border-amber-500/20 dark:text-amber-400 hover:bg-amber-500/20'
            : isOnline
              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400 hover:bg-emerald-500/20'
              : 'bg-rose-500/10 text-rose-650 border-rose-500/20 dark:text-rose-400 hover:bg-rose-500/20'
        }`}
        title="Bulut Senkronizasyon"
      >
        <Cloud className="w-3 h-3" />
        <span
          className={`w-1 h-1 rounded-full ${
            !isOnlineMode
              ? 'bg-amber-500 animate-pulse'
              : isOnline
                ? 'bg-emerald-500 animate-pulse'
                : 'bg-rose-500 animate-pulse'
          }`}
        />
      </button>

      {showSyncPopover && (
        <div className="absolute top-full right-0 mt-2 w-[360px] sm:w-[400px] max-w-[92vw] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 space-y-3 z-[100] text-left animate-in fade-in slide-in-from-top-2">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-blue-500" />
                Bulut Entegrasyon Ayarları
              </h4>
              <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
                Bulut sağlayıcınızı seçin ve senkronize edin.
              </p>
            </div>

            <div
              className={`px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1 border ${
                isOnline && isOnlineMode
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
              }`}
            >
              {isOnline && isOnlineMode ? (
                <Wifi className="w-3 h-3" />
              ) : (
                <WifiOff className="w-3 h-3" />
              )}
              {isOnline && isOnlineMode ? 'Çevrimiçi' : 'Çevrimdışı'}
            </div>
          </div>

          <div className="flex bg-slate-100 dark:bg-slate-955 p-1 rounded-xl gap-1 border border-slate-200/60 dark:border-slate-800/80">
            {[
              { id: 'server' as SyncProviderId, label: '🌐 API Sunucu' },
              { id: 'pocketbase' as SyncProviderId, label: '⚡ PocketBase' },
              { id: 'minio' as SyncProviderId, label: '🪣 MinIO / S3' },
              { id: 'gdrive' as SyncProviderId, label: '☁️ Drive' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveProvider(tab.id)}
                className={`flex-1 py-1.5 px-1 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  activeProvider === tab.id
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeProvider === 'server' && <ServerSyncForm />}
          {activeProvider === 'pocketbase' && <PocketBaseSyncForm />}
          {activeProvider === 'minio' && <MinIOSyncForm />}
          {activeProvider === 'gdrive' && (
            <GDriveSyncForm onOpenModal={() => setShowGDriveModal(true)} />
          )}
        </div>
      )}

      <GoogleDriveModal isOpen={showGDriveModal} onClose={() => setShowGDriveModal(false)} />
    </div>
  )
}

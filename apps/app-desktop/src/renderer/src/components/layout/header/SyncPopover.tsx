import React, { useEffect, useRef } from 'react'
import { Cloud, Shield, Wifi, WifiOff, RefreshCw } from 'lucide-react'
import packageJson from '../../../../../../package.json'
import { GoogleDriveModal } from '../../ui/GoogleDriveModal'
import { useSyncStore } from '../../../store/syncStore'

export function SyncPopover(): React.JSX.Element {
  const [showSyncPopover, setShowSyncPopover] = React.useState(false)
  const [showGDriveModal, setShowGDriveModal] = React.useState(false)
  const [isOnline, setIsOnline] = React.useState(true)
  const syncRef = useRef<HTMLDivElement>(null)

  const {
    syncUrl,
    setSyncUrl,
    syncToken,
    setSyncToken,
    isOnlineMode,
    setIsOnlineMode,
    syncStatus,
    syncMessage,
    isSyncing,
    dbVersionLocal,
    dbVersionCloud,
    activeProvider,
    setActiveProvider,
    pocketbaseUrl,
    setPocketbaseUrl,
    pocketbaseEmail,
    setPocketbaseEmail,
    pocketbasePassword,
    setPocketbasePassword,
    testPocketBase,
    pushPocketBase,
    isPushing,
    loadSettings,
    testConnection,
    triggerSync
  } = useSyncStore()

  useEffect(() => {
    loadSettings()

    setIsOnline(navigator.onLine)
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (syncRef.current && !syncRef.current.contains(event.target as Node)) {
        setShowSyncPopover(false)
      }
    }
    if (showSyncPopover) {
      document.addEventListener('mousedown', handleClickOutside)
    }
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
              {isOnline && isOnlineMode ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {isOnline && isOnlineMode ? 'Çevrimiçi' : 'Çevrimdışı'}
            </div>
          </div>

          <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl gap-1 border border-slate-200/60 dark:border-slate-800/80">
            <button
              onClick={() => setActiveProvider('server')}
              className={`flex-1 py-1.5 px-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                activeProvider === 'server'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              🌐 API Sunucu
            </button>
            <button
              onClick={() => setActiveProvider('pocketbase')}
              className={`flex-1 py-1.5 px-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                activeProvider === 'pocketbase'
                  ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              ⚡ PocketBase
            </button>
            <button
              onClick={() => setActiveProvider('gdrive')}
              className={`flex-1 py-1.5 px-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                activeProvider === 'gdrive'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              ☁️ Google Drive
            </button>
          </div>

          {activeProvider === 'server' ? (
            <div className="space-y-3">
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl p-2.5 space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-slate-500">
                  <span>Yerel Veri Sürümü:</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                    v{packageJson.version}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>Bulut Sunucu Sürümü:</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                    v{packageJson.version}
                  </span>
                </div>
                {dbVersionLocal < dbVersionCloud && (
                  <div className="text-[9px] text-amber-600 dark:text-amber-400 font-bold animate-pulse text-right">
                    ▲ Sunucuda yeni değişiklikler var! Eşitleyin.
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">
                  Sunucu Adresi
                </label>
                <input
                  type="text"
                  placeholder="https://temin360app.demo.ilyasbozdemir.dev/"
                  value={syncUrl}
                  onChange={(e) => setSyncUrl(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-250 dark:border-slate-800/80 rounded-lg p-2 font-mono text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">
                  Güvenlik Tokenı (Auth Key)
                </label>
                <input
                  type="password"
                  placeholder="dta_key_..."
                  value={syncToken}
                  onChange={(e) => setSyncToken(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-250 dark:border-slate-800/80 rounded-lg p-2 font-mono text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Çalışma Modu
                  </span>
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">
                    {isOnlineMode ? 'Ofis (Online - Canlı Senkronizasyon)' : 'Ev (Offline - Yerel Çalışma)'}
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isOnlineMode}
                    onChange={(e) => setIsOnlineMode(e.target.checked)}
                    className="sr-only peer cursor-pointer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => testConnection()}
                  disabled={syncStatus === 'loading'}
                  className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer border border-slate-250 dark:border-slate-700"
                >
                  {syncStatus === 'loading' ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    'Sına & Kaydet'
                  )}
                </button>

                <button
                  onClick={() => triggerSync()}
                  disabled={isSyncing || !syncUrl || !isOnline}
                  className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer shadow-sm shadow-blue-500/10"
                >
                  {isSyncing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Şimdi Eşitle'}
                </button>
              </div>

              {syncMessage && (
                <p
                  className={`text-[10px] font-semibold p-2 rounded-lg text-center ${
                    syncStatus === 'ok'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'bg-rose-500/10 text-rose-650 dark:text-rose-400'
                  }`}
                >
                  {syncMessage}
                </p>
              )}
            </div>
          ) : activeProvider === 'pocketbase' ? (
            <div className="space-y-3 pt-1">
              <div className="bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 p-3 rounded-xl space-y-1 text-xs">
                <div className="flex items-center justify-between font-bold text-amber-800 dark:text-amber-300">
                  <span className="flex items-center gap-1.5">
                    ⚡ PocketBase Self-Hosted API
                  </span>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-amber-200/60 dark:bg-amber-900/60 font-mono">
                    Hafif & Hızlı REST/Realtime
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Kendi sunucunuzdaki PocketBase servisine çalışma dosyalarınızı tek tıkla gönderip web uygulamanızla senkronize edin.
                </p>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">
                  PocketBase Sunucu URL (Örn: http://localhost:8090)
                </label>
                <input
                  type="text"
                  placeholder="http://localhost:8090"
                  value={pocketbaseUrl}
                  onChange={(e) => setPocketbaseUrl(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-250 dark:border-slate-800/80 rounded-lg p-2 font-mono text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">
                    E-Posta / Kullanıcı
                  </label>
                  <input
                    type="text"
                    placeholder="admin@temin360.com"
                    value={pocketbaseEmail}
                    onChange={(e) => setPocketbaseEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-250 dark:border-slate-800/80 rounded-lg p-2 font-mono text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">
                    Parola
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={pocketbasePassword}
                    onChange={(e) => setPocketbasePassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-250 dark:border-slate-800/80 rounded-lg p-2 font-mono text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => testPocketBase()}
                  disabled={syncStatus === 'loading'}
                  className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer border border-slate-250 dark:border-slate-700"
                >
                  {syncStatus === 'loading' ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    'Sına & Doğrula'
                  )}
                </button>

                <button
                  onClick={() => pushPocketBase()}
                  disabled={isPushing || !pocketbaseUrl}
                  className="flex-1 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 text-white rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-amber-500/10"
                >
                  {isPushing ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    '⚡ Webe Gönder (PocketBase)'
                  )}
                </button>
              </div>

              {syncMessage && (
                <p
                  className={`text-[10px] font-semibold p-2 rounded-lg text-center ${
                    syncStatus === 'ok'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'bg-rose-500/10 text-rose-650 dark:text-rose-400'
                  }`}
                >
                  {syncMessage}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              <div className="bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 p-3.5 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  <span className="flex items-center gap-1.5">
                    <Cloud size={16} /> Google Drive Bulut Depolama
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Google hesabınızla oturum açıp çalışma alanınızı buluta yedekleyin veya buluttan `.dtal` dosyalarınızı indirin.
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => setShowGDriveModal(true)}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Cloud size={16} /> Google Giriş Yap & Bulut Yöneticisini Aç
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <GoogleDriveModal isOpen={showGDriveModal} onClose={() => setShowGDriveModal(false)} />
    </div>
  )
}

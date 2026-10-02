import React from 'react'
import { RefreshCw } from 'lucide-react'
import packageJson from '../../../../../../package.json'
import { useSyncStore } from '../../../store/syncStore'

export function ServerSyncForm(): React.JSX.Element {
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
    testConnection,
    triggerSync
  } = useSyncStore()

  return (
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
          disabled={isSyncing || !syncUrl}
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
  )
}

export function PocketBaseSyncForm(): React.JSX.Element {
  const {
    pocketbaseUrl,
    setPocketbaseUrl,
    pocketbaseEmail,
    setPocketbaseEmail,
    pocketbasePassword,
    setPocketbasePassword,
    testPocketBase,
    pushPocketBase,
    isPushing,
    syncStatus,
    syncMessage
  } = useSyncStore()

  return (
    <div className="space-y-3 pt-1">
      <div className="bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 p-3 rounded-xl space-y-1 text-xs">
        <div className="flex items-center justify-between font-bold text-amber-800 dark:text-amber-300">
          <span className="flex items-center gap-1.5">⚡ PocketBase Self-Hosted API</span>
          <span className="text-[9px] px-2 py-0.5 rounded bg-amber-200/60 dark:bg-amber-900/60 font-mono">
            Hafif & Hızlı
          </span>
        </div>
        <p className="text-[11px] text-slate-600 dark:text-slate-400">
          PocketBase sunucunuza çalışma dosyalarını aktarın.
        </p>
      </div>

      <div className="space-y-1">
        <label className="block text-[10px] font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">
          PocketBase URL
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
            E-Posta
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
          className="flex-1 py-2 bg-linear-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 text-white rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-amber-500/10"
        >
          {isPushing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : '⚡ Webe Gönder'}
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
  )
}

import React from 'react'
import { Cloud, RefreshCw } from 'lucide-react'
import { useSyncStore } from '../../../store/syncStore'

export function MinIOSyncForm(): React.JSX.Element {
  const {
    minioEndpoint,
    setMinioEndpoint,
    minioBucket,
    setMinioBucket,
    testMinIO,
    pushMinIO,
    isPushing,
    syncStatus,
    syncMessage
  } = useSyncStore()

  return (
    <div className="space-y-3 pt-1">
      <div className="bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 p-3 rounded-xl space-y-1 text-xs">
        <div className="flex items-center justify-between font-bold text-rose-800 dark:text-rose-300">
          <span className="flex items-center gap-1.5">🪣 MinIO / S3 Depolama</span>
          <span className="text-[9px] px-2 py-0.5 rounded bg-rose-200/60 dark:bg-rose-900/60 font-mono">
            S3 Bucket
          </span>
        </div>
        <p className="text-[11px] text-slate-600 dark:text-slate-400">
          MinIO veya AWS S3 uyumlu nesne deposuna çalışma dosyalarını aktarın.
        </p>
      </div>

      <div className="space-y-1">
        <label className="block text-[10px] font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">
          MinIO Endpoint URL
        </label>
        <input
          type="text"
          placeholder="http://localhost:9000"
          value={minioEndpoint}
          onChange={(e) => setMinioEndpoint(e.target.value)}
          className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-250 dark:border-slate-800/80 rounded-lg p-2 font-mono text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-rose-500"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-[10px] font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">
          Bucket Adı
        </label>
        <input
          type="text"
          placeholder="temin-360-yedekler"
          value={minioBucket}
          onChange={(e) => setMinioBucket(e.target.value)}
          className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-250 dark:border-slate-800/80 rounded-lg p-2 font-mono text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-rose-500"
        />
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={() => testMinIO()}
          disabled={syncStatus === 'loading'}
          className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer border border-slate-250 dark:border-slate-700"
        >
          {syncStatus === 'loading' ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            'Sına & Bağlan'
          )}
        </button>

        <button
          onClick={() => pushMinIO()}
          disabled={isPushing || !minioEndpoint}
          className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-rose-500/10"
        >
          {isPushing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "🪣 MinIO'ya Gönder"}
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

export function GDriveSyncForm({ onOpenModal }: { onOpenModal: () => void }): React.JSX.Element {
  return (
    <div className="space-y-3 pt-1">
      <div className="bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 p-3.5 rounded-xl space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300">
          <span className="flex items-center gap-1.5">
            <Cloud size={16} /> Google Drive Bulut Depolama
          </span>
        </div>
        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
          Google hesabınızla oturum açıp çalışma alanınızı buluta yedekleyin veya buluttan
          dosyalarınızı indirin.
        </p>
      </div>

      <button
        onClick={onOpenModal}
        className="w-full py-2.5 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
      >
        <Cloud size={16} /> Google Giriş Yap & Bulut Yöneticisini Aç
      </button>
    </div>
  )
}

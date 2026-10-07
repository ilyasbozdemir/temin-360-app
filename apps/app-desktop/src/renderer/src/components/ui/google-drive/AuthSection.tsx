import React from 'react'
import { CheckCircle, Clock, Key, LogIn, Sliders } from 'lucide-react'
import { ApiAuthPanel } from './ApiAuthPanel'
import { ManualTokenPanel } from './ManualTokenPanel'
import type { GoogleDriveState } from './useGoogleDrive'

interface TabButtonProps {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  title: string
  badge: string
  badgeCls: string
  description: string
}

function TabButton(p: TabButtonProps): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={p.onClick}
      className={`p-2.5 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
        p.active
          ? 'bg-white dark:bg-slate-900 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
          : 'bg-white/50 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800/80 opacity-75 hover:opacity-100'
      }`}
    >
      <div
        className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
          p.active ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
        }`}
      >
        {p.icon}
      </div>
      <div className="space-y-0.5 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{p.title}</span>
          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${p.badgeCls}`}>
            {p.badge}
          </span>
        </div>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
          {p.description}
        </p>
      </div>
    </button>
  )
}

function ActiveModeBadge({ gd }: { gd: GoogleDriveState }): React.JSX.Element {
  const base = 'text-[10px] px-2.5 py-1 rounded-full border flex items-center gap-1.5'
  if (gd.clientId && gd.clientSecret) {
    return (
      <span
        className={`${base} bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-bold shadow-xs`}
      >
        <CheckCircle size={12} className="text-emerald-500" />
        Aktif: Kalıcı Özel API (Otomatik Yenileme)
      </span>
    )
  }
  if (gd.isSavedToken) {
    return (
      <span
        className={`${base} bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 font-bold shadow-xs`}
      >
        <Clock size={12} className="text-amber-500" />
        Aktif: Geçici Manuel Token (~1 Saatlik)
      </span>
    )
  }
  return (
    <span
      className={`${base} bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30 font-medium`}
    >
      Bağlantı Yapılandırılmadı
    </span>
  )
}

/** Bağlantı yöntemi seçimi + aktif yöntemin paneli */
export function AuthSection({ gd }: { gd: GoogleDriveState }): React.JSX.Element {
  return (
    <div className="bg-gradient-to-r from-blue-900/10 via-indigo-900/10 to-emerald-900/10 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-emerald-950/40 p-4 rounded-2xl border border-blue-200/60 dark:border-blue-800/40 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-200/50 dark:border-slate-800/50">
        <div>
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 uppercase tracking-wider">
            <LogIn size={16} className="text-blue-500" />
            Google Drive Bağlantı Yöntemi
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Aşağıdaki iki yöntemden birini seçip kaydedin; girdiğiniz yöntem otomatik aktif olur.
          </p>
        </div>
        <ActiveModeBadge gd={gd} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <TabButton
          active={gd.authTab === 'api'}
          onClick={() => gd.setAuthTab('api')}
          icon={<Sliders size={15} />}
          title="1. Yöntem: Google Cloud API"
          badge="Tavsiye Edilen"
          badgeCls="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          description="Client ID & Secret ile kalıcı, süresiz otomatik yenileme (24 saat sınırı yok)."
        />
        <TabButton
          active={gd.authTab === 'manual'}
          onClick={() => gd.setAuthTab('manual')}
          icon={<Key size={15} />}
          title="2. Yöntem: Hızlı Manuel Token"
          badge="Geçici Test"
          badgeCls="bg-amber-500/10 text-amber-600 dark:text-amber-400"
          description="Sadece tek bir Access Token (ya29...) ile anında test (~1 saat geçerli)."
        />
      </div>

      {gd.authTab === 'api' ? <ApiAuthPanel gd={gd} /> : <ManualTokenPanel gd={gd} />}
    </div>
  )
}

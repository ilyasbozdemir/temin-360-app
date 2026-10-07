import React from 'react'
import { ExternalLink, Key } from 'lucide-react'
import { Button } from '../Button'
import { SecretInput } from './SecretInput'
import type { GoogleDriveState } from './useGoogleDrive'

/** 2. Yöntem: Hızlı Manuel Access Token */
export function ManualTokenPanel({ gd }: { gd: GoogleDriveState }): React.JSX.Element {
  return (
    <div className="space-y-3 p-3.5 bg-white/70 dark:bg-slate-900/70 rounded-xl border border-amber-200/70 dark:border-amber-900/50">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="space-y-0.5">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
            Geçici Erişim Jetonu (Access Token)
          </span>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            OAuth Playground üzerinden doğrudan üretilen ~1 saat geçerli test token&apos;ı:
          </p>
        </div>
        <Button
          onClick={gd.handleOpenGoogleAuth}
          className="bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl shrink-0 flex items-center gap-1.5 shadow-2xs"
        >
          <ExternalLink size={13} className="text-blue-500" />
          <span>Google Yetkilendirme Sayfası Aç</span>
        </Button>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
          Access Token
        </label>
        <SecretInput
          placeholder="ya29.a0Ax... (Google OAuth Access Token)"
          value={gd.token}
          onChange={gd.setToken}
          className="text-xs"
          iconSize={14}
        />
      </div>

      <Button
        onClick={gd.handleSaveManualToken}
        className="w-full bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs shadow-md transition-all"
      >
        <Key size={15} />
        <span>Manuel Access Token&apos;ı Kaydet ve Bağlan</span>
      </Button>
    </div>
  )
}

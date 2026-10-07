import React from 'react'
import { CheckCircle, ExternalLink, FileJson, LogIn, RefreshCw } from 'lucide-react'
import { Button } from '../Button'
import { Input } from '../Input'
import { SecretInput } from './SecretInput'
import type { GoogleDriveState } from './useGoogleDrive'

const labelCls =
  'text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider'

/** 1. Yöntem: Google Cloud API (Client ID & Secret + Refresh Token) */
export function ApiAuthPanel({ gd }: { gd: GoogleDriveState }): React.JSX.Element {
  return (
    <div className="space-y-3 p-3.5 bg-white/70 dark:bg-slate-900/70 rounded-xl border border-blue-200/70 dark:border-blue-900/50">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="space-y-0.5">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
            Özel API İstemcisi Bilgileri
          </span>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            İster masaüstündeki JSON dosyasını yükleyin, ister kutulara yapıştırın:
          </p>
        </div>
        <label className="cursor-pointer text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/60 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800 shadow-2xs transition-colors shrink-0">
          <FileJson size={14} />
          <span>client_secret.json Yükle</span>
          <input
            type="file"
            accept=".json"
            onChange={gd.handleImportClientJson}
            className="hidden"
          />
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className={labelCls}>Client ID</label>
          <Input
            type="text"
            placeholder="...apps.googleusercontent.com"
            value={gd.clientId}
            onChange={(e) => gd.setClientId(e.target.value)}
            className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-[11px] font-mono"
          />
        </div>
        <div className="space-y-1">
          <label className={labelCls}>Client Secret</label>
          <SecretInput
            placeholder="GOCSPX-..."
            value={gd.clientSecret}
            onChange={gd.setClientSecret}
            className="text-[11px]"
          />
        </div>
      </div>

      {/* TEK TIKLA GOOGLE İLE OTURUM AÇ & BAĞLAN (BİRİNCİL VE ÖNERİLEN) */}
      <div className="p-3.5 bg-gradient-to-r from-blue-50 via-indigo-50 to-emerald-50 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-emerald-950/40 border border-blue-200 dark:border-blue-800/60 rounded-xl space-y-2">
        <Button
          type="button"
          onClick={gd.handleStartGoogleOAuth}
          disabled={gd.isAuthenticating || !gd.clientId || !gd.clientSecret}
          className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-xs shadow-md hover:shadow-lg transition-all cursor-pointer"
        >
          {gd.isAuthenticating ? (
            <>
              <RefreshCw size={15} className="animate-spin" />
              <span>Google Girişi Bekleniyor (Tarayıcınızı Kontrol Edin)...</span>
            </>
          ) : (
            <>
              <LogIn size={15} />
              <span>Google Hesabı ile Oturum Aç & Yetkilendir (Tek Tıkla Kalıcı)</span>
            </>
          )}
        </Button>
        <p className="text-[10px] text-center text-slate-600 dark:text-slate-400 leading-snug">
          ✨ <strong>24 saat sınırı yok:</strong> Butona tıkladığınızda tarayıcınız açılır; Google
          hesabınıza onay verdiğinizde kalıcı yetki otomatik alınır ve yedekleme butonları anında
          aktif olur.
        </p>
      </div>

      {/* GELİŞMİŞ / MANUEL REFRESH TOKEN OPSİYONU */}
      <div className="border-t border-slate-200 dark:border-slate-800 pt-3 space-y-2.5">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className={`${labelCls} flex items-center gap-1`}>
              <RefreshCw size={11} className="text-emerald-500" />
              Alternatif: Manuel Refresh Token (Opsiyonel)
            </label>
            {gd.refreshToken && (
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle size={10} /> Tanımlı
              </span>
            )}
          </div>
          <Input
            type="password"
            placeholder="1//04wKn... (OAuth Playground'dan kendi client'ınızla üretilen refresh token)"
            value={gd.refreshToken}
            onChange={(e) => gd.setRefreshToken(e.target.value)}
            className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-[11px] font-mono"
          />
        </div>

        <div className="flex items-center justify-between pt-0.5">
          <button
            type="button"
            onClick={gd.handleOpenGoogleAuth}
            className="text-[10px] text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1"
          >
            <ExternalLink size={11} /> OAuth Playground ile Manuel Kod Üretme Rehberi
          </button>
          <Button
            type="button"
            onClick={gd.handleSaveApiSettings}
            className="bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold py-1.5 px-3 rounded-lg flex items-center gap-1.5 text-[11px] transition-all"
          >
            <CheckCircle size={13} />
            <span>API Bilgilerini Kaydet</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

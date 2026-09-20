import React from 'react'
import { ClipboardCheck, Sparkles } from 'lucide-react'

interface LockScreenVerifyCodeProps {
  recoveryEmail: string
  testCode: string | null
  recoveryWarning: string | null
  recoveryCode: string
  setRecoveryCode: (code: string) => void
  loading: boolean
  onVerify: () => void
  onResend: () => void
  onCancel: () => void
}

export function LockScreenVerifyCode({
  recoveryEmail,
  testCode,
  recoveryWarning,
  recoveryCode,
  setRecoveryCode,
  loading,
  onVerify,
  onResend,
  onCancel
}: LockScreenVerifyCodeProps): React.JSX.Element {
  return (
    <div className="space-y-4">
      <p className="text-slate-650 dark:text-slate-300 text-xs leading-relaxed">
        Kurtarma kodu <strong>{recoveryEmail}</strong> adresine başarıyla gönderildi. Lütfen gelen
        6 haneli kodu girin.
      </p>

      {testCode && (
        <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl flex flex-col gap-2 animate-in fade-in">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 dark:text-amber-300">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>Test Modu Doğrulama Kodu</span>
          </div>
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-amber-100 dark:border-amber-900/50">
            <span className="font-mono text-base font-bold tracking-[3px] text-amber-700 dark:text-amber-300">
              {testCode}
            </span>
            <button
              type="button"
              onClick={() => setRecoveryCode(testCode)}
              className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 underline cursor-pointer"
            >
              Kodu Kutuya Doldur
            </button>
          </div>
          {recoveryWarning && (
            <span className="text-[10px] text-amber-700/80 dark:text-amber-400/80 leading-tight">
              {recoveryWarning}
            </span>
          )}
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 ml-1">
          Doğrulama Kodu (6 Hane)
        </label>
        <div className="relative">
          <ClipboardCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-555" />
          <input
            type="text"
            required
            maxLength={6}
            placeholder="Örn: 123456"
            value={recoveryCode}
            onChange={(e) => setRecoveryCode(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 text-center tracking-[4px] font-bold"
          />
        </div>
      </div>
      <button
        onClick={onVerify}
        disabled={loading}
        className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white rounded-xl text-sm font-semibold transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
      >
        {loading ? 'Doğrulanıyor...' : 'Kodu Doğrula'}
      </button>
      <div className="flex gap-2">
        <button
          onClick={onResend}
          disabled={loading}
          className="w-1/2 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-305 hover:text-slate-900 dark:hover:text-white rounded-xl text-xs font-semibold transition-all border border-slate-200 dark:border-slate-700 focus:outline-none cursor-pointer"
        >
          Tekrar Kod Gönder
        </button>
        <button
          onClick={onCancel}
          className="w-1/2 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-305 hover:text-slate-900 dark:hover:text-white rounded-xl text-xs font-semibold transition-all border border-slate-200 dark:border-slate-700 focus:outline-none cursor-pointer"
        >
          İptal
        </button>
      </div>
    </div>
  )
}

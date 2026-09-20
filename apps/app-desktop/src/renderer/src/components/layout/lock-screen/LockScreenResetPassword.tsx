import React from 'react'
import { Eye, EyeOff, KeyRound, User } from 'lucide-react'

interface LockScreenResetPasswordProps {
  username: string
  setUsername: (val: string) => void
  password: string
  setPassword: (val: string) => void
  showPassword: boolean
  setShowPassword: (val: boolean) => void
  loading: boolean
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
}

export function LockScreenResetPassword({
  username,
  setUsername,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  loading,
  onSubmit,
  onCancel
}: LockScreenResetPasswordProps): React.JSX.Element {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <p className="text-slate-650 dark:text-slate-300 text-xs leading-relaxed mb-2">
        Kod başarıyla doğrulandı! Lütfen kurum dosyanız için yeni erişim bilgilerini tanımlayın.
      </p>

      <div>
        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 ml-1">
          Kullanıcı Adı
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-550" />
          <input
            type="text"
            required
            placeholder="Kullanıcı Adı (Örn: admin)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 ml-1">
          Yeni Parola
        </label>
        <div className="relative">
          <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-550" />
          <input
            type={showPassword ? 'text' : 'password'}
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-550 dark:hover:text-slate-350 focus:outline-none cursor-pointer"
            title={showPassword ? 'Şifreyi Gizle' : 'Şifreyi Göster'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white rounded-xl text-sm font-semibold transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
      >
        {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle ve Giriş Yap'}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-305 hover:text-slate-900 dark:hover:text-white rounded-xl text-xs font-semibold transition-all border border-slate-200 dark:border-slate-700 focus:outline-none cursor-pointer"
      >
        İptal
      </button>
    </form>
  )
}

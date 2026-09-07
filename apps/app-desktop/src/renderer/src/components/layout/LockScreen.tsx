import React, { useState, useEffect } from 'react'
import {
  Lock,
  LogOut,
  KeyRound,
  Building2,
  User,
  ShieldAlert,
  Mail,
  ClipboardCheck,
  Minus,
  Square,
  X,
  Sun,
  Moon,
  Eye,
  EyeOff
} from 'lucide-react'
import { useWorkspaceStore } from '../../store/workspaceStore'
import { useSettingsStore } from '../../store/settingsStore'
import { useTheme } from '../providers/ThemeProvider'

export default function LockScreen(): React.JSX.Element {
  const { fileName, setIsAuthenticated, closeWorkspace } = useWorkspaceStore()
  const { institutionName, institutionLogo, logoLeft, logoRight, loadSettings } = useSettingsStore()
  const { theme, setTheme } = useTheme()

  const [isSetupMode, setIsSetupMode] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [recoveryStep, setRecoveryStep] = useState<
    'login' | 'send_code' | 'verify_code' | 'reset_password'
  >('login')

  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('')
  const [recoveryCode, setRecoveryCode] = useState('')
  const [recoveryEmail, setRecoveryEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Check if credentials are set up on mount and load settings & remembered credentials
  useEffect(() => {
    const checkAuthSetup = async (): Promise<void> => {
      try {
        const res = await window.electron.ipcRenderer.invoke('db:check-auth-setup')
        if (res && !res.hasCredentials) {
          setIsSetupMode(true)
        }
      } catch (err) {
        console.error('Check setup error:', err)
      }
    }
    checkAuthSetup()
    loadSettings() // Load institutional settings pre-login to show name and logo

    setTimeout(() => {
      if (fileName) {
        const isRemembered = localStorage.getItem(`rememberMe_${fileName}`) === 'true'
        setRememberMe(isRemembered)
        if (isRemembered) {
          setUsername(localStorage.getItem(`rememberedUser_${fileName}`) || 'admin')
          setPassword(localStorage.getItem(`rememberedPass_${fileName}`) || '')
        } else {
          setUsername('admin')
          setPassword('')
        }
      }
    }, 0)
  }, [loadSettings, fileName])

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (isSetupMode) {
        // Setup new credentials
        const res = await window.electron.ipcRenderer.invoke(
          'db:setup-auth',
          '',
          username,
          password
        )
        if (res.success) {
          if (rememberMe && fileName) {
            localStorage.setItem(`rememberMe_${fileName}`, 'true')
            localStorage.setItem(`rememberedUser_${fileName}`, username)
            localStorage.setItem(`rememberedPass_${fileName}`, password)
          }
          setIsAuthenticated(true)
          await loadSettings()
        } else {
          setError(res.error || 'Bilgiler kaydedilemedi!')
        }
      } else {
        // Login with existing credentials
        const res = await window.electron.ipcRenderer.invoke('db:login', '', username, password)
        if (res.success) {
          if (rememberMe && fileName) {
            localStorage.setItem(`rememberMe_${fileName}`, 'true')
            localStorage.setItem(`rememberedUser_${fileName}`, username)
            localStorage.setItem(`rememberedPass_${fileName}`, password)
          } else if (fileName) {
            localStorage.setItem(`rememberMe_${fileName}`, 'false')
            localStorage.removeItem(`rememberedUser_${fileName}`)
            localStorage.removeItem(`rememberedPass_${fileName}`)
          }
          setIsAuthenticated(true)
          await loadSettings()
        } else {
          setError(res.error || 'Giriş bilgileri hatalı!')
        }
      }
    } catch (err: unknown) {
      setError('Bağlantı hatası: ' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setLoading(false)
    }
  }

  const handleSendRecoveryEmail = async (): Promise<void> => {
    setError(null)
    setLoading(true)
    try {
      const res = await window.electron.ipcRenderer.invoke('db:send-recovery-email')
      if (res.success) {
        setRecoveryEmail(res.email)
        setRecoveryStep('verify_code')
      } else {
        setError(res.error || 'SMTP veya E-posta gönderme hatası!')
      }
    } catch (err: unknown) {
      setError(
        'Kurtarma e-postası gönderilemedi: ' + (err instanceof Error ? err.message : String(err))
      )
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyRecoveryCode = async (): Promise<void> => {
    setError(null)
    setLoading(true)
    try {
      const res = await window.electron.ipcRenderer.invoke('db:verify-recovery-code', recoveryCode)
      if (res.success) {
        setRecoveryStep('reset_password')
      } else {
        setError(res.error || 'Doğrulama kodu hatalı!')
      }
    } catch (err: unknown) {
      setError('Kod doğrulama hatası: ' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setLoading(false)
    }
  }

  const handleResetSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await window.electron.ipcRenderer.invoke('db:setup-auth', '', username, password)
      if (res.success) {
        setIsAuthenticated(true)
        await loadSettings()
      } else {
        setError(res.error || 'Şifre güncellenemedi!')
      }
    } catch (err: unknown) {
      setError('Güncelleme hatası: ' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setLoading(false)
    }
  }

  const getTitleText = (): string => {
    if (isSetupMode) return 'Kurum Şifresi Belirleyin'
    if (recoveryStep === 'send_code') return 'Şifre Kurtarma'
    if (recoveryStep === 'verify_code') return 'Kodu Doğrula'
    if (recoveryStep === 'reset_password') return 'Şifre Sıfırlama'
    return institutionName || 'Kurum Dosyası Girişi'
  }

  const handleMinimize = (): void => window.electron?.ipcRenderer.send('window-minimize')
  const handleMaximize = (): void => window.electron?.ipcRenderer.send('window-maximize')
  const handleClose = (): void => {
    window.electron?.ipcRenderer.invoke('app:force-quit').catch(() => {
      window.electron?.ipcRenderer.send('window-close')
    })
  }

  // Pick a logo: institutionLogo fallback to logoLeft, then logoRight
  const activeLogo = institutionLogo || logoLeft || logoRight

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-55 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans p-4 relative overflow-hidden transition-colors duration-300">
      {/* Draggable Header with Window Controls & Theme Switcher */}
      <div
        className="absolute top-0 left-0 w-full h-12 flex justify-between items-center px-4 bg-transparent z-50 select-none"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        <div className="flex items-center gap-2 text-slate-400 dark:text-slate-655 text-xs font-semibold">
          <Lock className="w-3.5 h-3.5" />
          <span>TEMİN 360 Giriş</span>
        </div>

        <div
          className="flex items-center space-x-1"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-350 transition-all rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800/50 mr-2"
            title="Tema Değiştir"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={handleMinimize}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-350 transition-all rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
            title="Simge Durumuna Küçült"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={handleMaximize}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-350 transition-all rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
            title="Ekranı Kapla"
          >
            <Square className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-red-650 rounded-lg transition-all"
            title="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white/90 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10">
        <div className="flex flex-col items-center mb-8">
          {/* Institution Logo with custom visual style or warm placeholder */}
          <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 border border-slate-200 dark:border-blue-900/30 rounded-2xl flex items-center justify-center mb-4 overflow-hidden shadow-inner">
            {activeLogo ? (
              <img
                src={activeLogo}
                alt="Kurum Logosu"
                className="w-full h-full object-contain p-1"
                onError={(e) => {
                  // Fallback if image fails to load
                  e.currentTarget.style.display = 'none'
                  const parent = e.currentTarget.parentElement
                  if (parent) {
                    const fallback = parent.querySelector('.logo-fallback') as HTMLElement
                    if (fallback) fallback.style.display = 'flex'
                  }
                }}
              />
            ) : null}
            <div
              className="logo-fallback w-full h-full flex items-center justify-center text-blue-600 dark:text-blue-400"
              style={{ display: activeLogo ? 'none' : 'flex' }}
            >
              <Building2 className="w-10 h-10" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-850 dark:text-white tracking-tight text-center">
            {getTitleText()}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 text-center truncate max-w-full px-4">
            {isSetupMode
              ? 'Dosya için henüz giriş şifresi tanımlanmamış. Lütfen belirleyin.'
              : `Açık Dosya: ${fileName}`}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl text-xs text-red-650 dark:text-red-450 font-medium text-center">
            {error}
          </div>
        )}

        {recoveryStep === 'login' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 ml-1">
                Kullanıcı Adı
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-550" />
                <input
                  type="text"
                  required
                  placeholder="Kullanıcı Adı"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 ml-1">
                {isSetupMode ? 'Yeni Parola' : 'Parola'}
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-350 focus:outline-none"
                  title={showPassword ? 'Şifreyi Gizle' : 'Şifreyi Göster'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {isSetupMode && (
              <div className="flex gap-2 p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl text-amber-700 dark:text-amber-550 text-[10px] leading-relaxed">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <span>
                  Bu şifre veritabanına kaydedilir. İnternet olmasa dahi bu kurum dosyasına girmek
                  için bu şifreyi kullanacaksınız. Lütfen unutmayın.
                </span>
              </div>
            )}

            <div className="flex items-center justify-between mt-2 px-1">
              <label className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-blue-600 focus:ring-blue-500/50"
                />
                Beni Hatırla
              </label>
              {!isSetupMode && (
                <button
                  type="button"
                  onClick={(): void => {
                    setError(null)
                    setRecoveryStep('send_code')
                  }}
                  className="text-xs text-blue-650 dark:text-blue-500 hover:underline transition-colors focus:outline-none font-medium"
                >
                  Şifremi Unuttum
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-500/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              {loading
                ? isSetupMode
                  ? 'Kaydediliyor...'
                  : 'Doğrulanıyor...'
                : isSetupMode
                  ? 'Şifre Belirle ve Giriş Yap'
                  : 'Giriş Yap ve Kilidi Aç'}
            </button>
          </form>
        )}

        {recoveryStep === 'send_code' && (
          <div className="space-y-4">
            <p className="text-slate-650 dark:text-slate-300 text-xs leading-relaxed">
              Kilitli kurum dosyanıza erişim şifrenizi sıfırlamak için, sistemde tanımlı olan kurum
              e-posta adresine tek kullanımlık 6 haneli bir doğrulama kodu gönderilecektir.
            </p>
            <div className="p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-2xl flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <span className="text-[10px] text-blue-700 dark:text-blue-300 leading-normal">
                Bu işlemin çalışabilmesi için Ayarlar menüsünden SMTP Sunucu ve Kurum E-posta
                bilgilerinin önceden tanımlanmış veya ikna edilerek içe aktarılmış olması
                gerekmektedir.
              </span>
            </div>
            <button
              onClick={handleSendRecoveryEmail}
              disabled={loading}
              className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white rounded-xl text-sm font-semibold transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              {loading ? 'Gönderiliyor...' : 'Kurtarma Kodu Gönder'}
            </button>
            <button
              onClick={(): void => {
                setError(null)
                setRecoveryStep('login')
              }}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-305 hover:text-slate-900 dark:hover:text-white rounded-xl text-xs font-semibold transition-all border border-slate-200 dark:border-slate-700 focus:outline-none"
            >
              Giriş Ekranına Dön
            </button>
          </div>
        )}

        {recoveryStep === 'verify_code' && (
          <div className="space-y-4">
            <p className="text-slate-650 dark:text-slate-300 text-xs leading-relaxed">
              Kurtarma kodu <strong>{recoveryEmail}</strong> adresine başarıyla gönderildi. Lütfen
              gelen 6 haneli kodu girin.
            </p>
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
              onClick={handleVerifyRecoveryCode}
              disabled={loading}
              className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white rounded-xl text-sm font-semibold transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              {loading ? 'Doğrulanıyor...' : 'Kodu Doğrula'}
            </button>
            <div className="flex gap-2">
              <button
                onClick={handleSendRecoveryEmail}
                disabled={loading}
                className="w-1/2 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-305 hover:text-slate-900 dark:hover:text-white rounded-xl text-xs font-semibold transition-all border border-slate-200 dark:border-slate-700 focus:outline-none"
              >
                Tekrar Kod Gönder
              </button>
              <button
                onClick={(): void => {
                  setError(null)
                  setRecoveryStep('login')
                }}
                className="w-1/2 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-305 hover:text-slate-900 dark:hover:text-white rounded-xl text-xs font-semibold transition-all border border-slate-200 dark:border-slate-700 focus:outline-none"
              >
                İptal
              </button>
            </div>
          </div>
        )}

        {recoveryStep === 'reset_password' && (
          <form onSubmit={handleResetSubmit} className="space-y-4">
            <p className="text-slate-650 dark:text-slate-300 text-xs leading-relaxed mb-2">
              Kod başarıyla doğrulandı! Lütfen kurum dosyanız için yeni erişim bilgilerini
              tanımlayın.
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-350 focus:outline-none"
                  title={showPassword ? 'Şifreyi Gizle' : 'Şifreyi Göster'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white rounded-xl text-sm font-semibold transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle ve Giriş Yap'}
            </button>
            <button
              type="button"
              onClick={(): void => {
                setError(null)
                setRecoveryStep('login')
              }}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-305 hover:text-slate-900 dark:hover:text-white rounded-xl text-xs font-semibold transition-all border border-slate-200 dark:border-slate-700 focus:outline-none"
            >
              İptal
            </button>
          </form>
        )}

        <div className="mt-8 border-t border-slate-100 dark:border-slate-800/80 pt-6 flex justify-center">
          <button
            onClick={() => closeWorkspace()}
            className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-550 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Başka Çalışma Dosyası Seç (.dtal)
          </button>
        </div>
      </div>
    </div>
  )
}

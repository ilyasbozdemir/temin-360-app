import React, { useState, useEffect } from 'react'
import { LogOut } from 'lucide-react'
import { useWorkspaceStore } from '../../store/workspaceStore'
import { useSettingsStore } from '../../store/settingsStore'
import {
  LockScreenHeader,
  LockScreenLogo,
  LockScreenLoginForm,
  LockScreenSendCode,
  LockScreenVerifyCode,
  LockScreenResetPassword
} from './lock-screen'

export default function LockScreen(): React.JSX.Element {
  const { fileName, setIsAuthenticated, closeWorkspace } = useWorkspaceStore()
  const { institutionName, institutionLogo, logoLeft, logoRight, loadSettings } = useSettingsStore()

  const [isSetupMode, setIsSetupMode] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [recoveryStep, setRecoveryStep] = useState<
    'login' | 'send_code' | 'verify_code' | 'reset_password'
  >('login')

  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('')
  const [recoveryCode, setRecoveryCode] = useState('')
  const [recoveryEmail, setRecoveryEmail] = useState('')
  const [testCode, setTestCode] = useState<string | null>(null)
  const [recoveryWarning, setRecoveryWarning] = useState<string | null>(null)
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

    if (fileName) {
      const isRemembered = localStorage.getItem(`rememberMe_${fileName}`) === 'true'
      setRememberMe(isRemembered)
      if (isRemembered) {
        const savedUser = localStorage.getItem(`rememberedUser_${fileName}`) || 'admin'
        const savedPass = localStorage.getItem(`rememberedPass_${fileName}`) || ''
        setUsername(savedUser)
        setPassword(savedPass)
      } else {
        setUsername('admin')
        setPassword('')
      }
    }
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
          } else if (fileName) {
            localStorage.setItem(`rememberMe_${fileName}`, 'false')
            localStorage.removeItem(`rememberedUser_${fileName}`)
            localStorage.removeItem(`rememberedPass_${fileName}`)
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
    setRecoveryWarning(null)
    setTestCode(null)
    setLoading(true)
    try {
      const res = await window.electron.ipcRenderer.invoke('db:send-recovery-email')
      if (res && res.success) {
        setRecoveryEmail(res.email || 'Tanımlı E-posta')
        if (res.testCode) {
          setTestCode(res.testCode)
        }
        if (res.warning) {
          setRecoveryWarning(res.warning)
        }
        setRecoveryStep('verify_code')
      } else {
        setError(res?.error || 'SMTP veya E-posta gönderme hatası!')
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
      if (res && res.success) {
        setRecoveryStep('reset_password')
      } else {
        setError(res?.error || 'Doğrulama kodu hatalı!')
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
        if (rememberMe && fileName) {
          localStorage.setItem(`rememberMe_${fileName}`, 'true')
          localStorage.setItem(`rememberedUser_${fileName}`, username)
          localStorage.setItem(`rememberedPass_${fileName}`, password)
        }
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

  // Pick a logo: institutionLogo fallback to logoLeft, then logoRight
  const activeLogo = institutionLogo || logoLeft || logoRight

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-55 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans p-4 relative overflow-hidden transition-colors duration-300">
      {/* Draggable Header with Window Controls & Theme Switcher */}
      <LockScreenHeader />

      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white/90 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10">
        {/* Kurum Logosu ve Başlık */}
        <LockScreenLogo
          activeLogo={activeLogo}
          titleText={getTitleText()}
          isSetupMode={isSetupMode}
          fileName={fileName}
        />

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl text-xs text-red-650 dark:text-red-450 font-medium text-center">
            {error}
          </div>
        )}

        {/* 1. Giriş veya İlk Kurulum Formu */}
        {recoveryStep === 'login' && (
          <LockScreenLoginForm
            isSetupMode={isSetupMode}
            username={username}
            setUsername={setUsername}
            password={password}
            setPassword={setPassword}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            rememberMe={rememberMe}
            setRememberMe={setRememberMe}
            loading={loading}
            onSubmit={handleSubmit}
            onForgotPassword={() => {
              setError(null)
              setRecoveryStep('send_code')
            }}
          />
        )}

        {/* 2. Şifre Kurtarma - E-posta Kod Gönderme */}
        {recoveryStep === 'send_code' && (
          <LockScreenSendCode
            loading={loading}
            onSendCode={handleSendRecoveryEmail}
            onCancel={() => {
              setError(null)
              setRecoveryStep('login')
            }}
          />
        )}

        {/* 3. Şifre Kurtarma - Kod Doğrulama & Test Kodu */}
        {recoveryStep === 'verify_code' && (
          <LockScreenVerifyCode
            recoveryEmail={recoveryEmail}
            testCode={testCode}
            recoveryWarning={recoveryWarning}
            recoveryCode={recoveryCode}
            setRecoveryCode={setRecoveryCode}
            loading={loading}
            onVerify={handleVerifyRecoveryCode}
            onResend={handleSendRecoveryEmail}
            onCancel={() => {
              setError(null)
              setRecoveryStep('login')
            }}
          />
        )}

        {/* 4. Şifre Kurtarma - Yeni Şifre Belirleme */}
        {recoveryStep === 'reset_password' && (
          <LockScreenResetPassword
            username={username}
            setUsername={setUsername}
            password={password}
            setPassword={setPassword}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            loading={loading}
            onSubmit={handleResetSubmit}
            onCancel={() => {
              setError(null)
              setRecoveryStep('login')
            }}
          />
        )}

        <div className="mt-8 border-t border-slate-100 dark:border-slate-800/80 pt-6 flex justify-center">
          <button
            onClick={() => closeWorkspace()}
            className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-550 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Başka Çalışma Dosyası Seç (.dtal)
          </button>
        </div>
      </div>
    </div>
  )
}

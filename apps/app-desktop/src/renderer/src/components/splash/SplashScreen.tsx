import React, { useCallback, useEffect, useState } from 'react'
import {
  Code2,
  Cpu,
  Database,
  ExternalLink,
  FileCheck,
  GitBranch,
  Globe,
  Sparkles,
  Zap
} from 'lucide-react'
import defaultAppIcon from '../../assets/icon.png'
import { useSettingsStore } from '../../store/settingsStore'

interface SplashScreenProps {
  onComplete?: () => void
  durationMs?: number
  autoHide?: boolean
}

const LOADING_STEPS = [
  {
    progress: 15,
    title: 'Sistem Çekirdeği Başlatılıyor',
    subtitle: 'Bellek ve Electron IPC iletişim kanalları yapılandırılıyor...',
    icon: Cpu
  },
  {
    progress: 40,
    title: 'Veritabanı & Şema Manifestleri',
    subtitle: 'SQLite yerel çalışma alanı ve şablon tabloları doğrulanıyor...',
    icon: Database
  },
  {
    progress: 70,
    title: '4734 Sayılı KİK Mevzuat & Şablon Motoru',
    subtitle: 'Doğrudan temin formülleri, hesaplama cetvelleri ve matrisler yükleniyor...',
    icon: FileCheck
  },
  {
    progress: 90,
    title: 'Geliştirici Mimarisi Doğrulandı',
    subtitle: 'İlyas BOZDEMİR (ilyasbozdemir.dev) • Modüller Hazırlanıyor...',
    icon: Code2
  },
  {
    progress: 100,
    title: 'Temin 360 Hazır',
    subtitle: 'Arayüz açılıyor, keyifli çalışmalar dileriz!',
    icon: Sparkles
  }
]

export function SplashScreen({
  onComplete,
  durationMs = 5000,
  autoHide = true
}: SplashScreenProps): React.JSX.Element | null {
  const [visible, setVisible] = useState(true)
  const [fadingOut, setFadingOut] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStepIdx, setCurrentStepIdx] = useState(0)
  const { institutionLogo, logoLeft, institutionName, loadSettings } = useSettingsStore()

  useEffect(() => {
    loadSettings().catch(() => null)
  }, [loadSettings])

  const activeLogo = institutionLogo || logoLeft || defaultAppIcon
  const isCustomLogo = Boolean(institutionLogo || logoLeft)

  const finishImmediately = useCallback((): void => {
    setProgress(100)
    setCurrentStepIdx(4)
    setFadingOut(true)
    setTimeout(() => {
      setVisible(false)
      if (onComplete) onComplete()
    }, 200)
  }, [onComplete])

  const handleOpenLink = (e: React.MouseEvent, url: string): void => {
    e.stopPropagation()
    try {
      if (window.electron?.ipcRenderer?.invoke) {
        window.electron.ipcRenderer.invoke('shell:openExternal', url)
      } else {
        window.open(url, '_blank')
      }
    } catch {
      window.open(url, '_blank')
    }
  }

  useEffect(() => {
    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const rawRatio = Math.min(elapsed / durationMs, 1)

      const eased = Math.round(rawRatio * 100)
      setProgress(eased)

      if (eased >= 95) setCurrentStepIdx(4)
      else if (eased >= 75) setCurrentStepIdx(3)
      else if (eased >= 45) setCurrentStepIdx(2)
      else if (eased >= 20) setCurrentStepIdx(1)
      else setCurrentStepIdx(0)

      if (rawRatio >= 1) {
        clearInterval(interval)
        if (autoHide) {
          setTimeout(() => {
            setFadingOut(true)
            setTimeout(() => {
              setVisible(false)
              if (onComplete) onComplete()
            }, 450)
          }, 350)
        }
      }
    }, 25)

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        finishImmediately()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      clearInterval(interval)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [durationMs, autoHide, onComplete, finishImmediately])

  if (!visible) return null

  const CurrentIcon = LOADING_STEPS[currentStepIdx].icon

  return (
    <div
      className={`fixed inset-0 z-99999 flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/95 backdrop-blur-2xl text-slate-900 dark:text-slate-100 select-none transition-opacity duration-500 ease-out ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      onClick={finishImmediately}
      title="Hızlı geçmek için tıklayın veya ESC tuşuna basın"
    >
      {/* Background glow effects (Theme responsive) */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/15 dark:bg-blue-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/15 dark:bg-indigo-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-sky-400/10 dark:bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main card */}
      <div
        className="relative w-full max-w-lg mx-4 p-8 rounded-3xl bg-white/95 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 shadow-2xl shadow-slate-900/10 dark:shadow-blue-950/50 flex flex-col items-center text-center overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top App / User Custom Logo & Version Badge */}
        <div className="relative mb-5 group">
          <div className="w-20 h-20 rounded-2xl bg-linear-to-tr from-blue-600 via-indigo-600 to-sky-400 p-0.5 shadow-xl shadow-blue-500/20 flex items-center justify-center transform transition-transform group-hover:scale-105">
            <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[14px] flex items-center justify-center p-2.5 overflow-hidden">
              <img
                src={activeLogo}
                alt="Logo"
                className="w-full h-full object-contain drop-shadow-md"
              />
            </div>
          </div>
          <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-blue-600 dark:bg-blue-500 text-white dark:text-slate-950 text-[10px] font-black tracking-wider uppercase shadow-xs">
            {isCustomLogo ? 'KURUM' : 'v1.0'}
          </span>
        </div>

        {/* Title & Slogan */}
        <h1 className="text-2xl font-black tracking-tight bg-linear-to-r from-slate-900 via-blue-950 to-slate-700 dark:from-white dark:via-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
          TEMİN 360 PRO
        </h1>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 max-w-sm truncate">
          {institutionName && institutionName !== 'Kurum Bilgisi Bekleniyor...'
            ? institutionName
            : 'Kamu Satınalma & Doğrudan Temin Süreç Yönetim Platformu'}
        </p>

        {/* Developer Credit Box */}
        <div className="mt-5 w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/60 flex flex-col gap-3 shadow-2xs">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-500 via-blue-600 to-sky-500 flex items-center justify-center text-white font-black text-sm shadow-xs shrink-0">
                İB
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                    İlyas BOZDEMİR
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30">
                    Developer & Architect
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block">
                  Lead Software Architect
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={(e) => handleOpenLink(e, 'https://github.com/ilyasbozdemir')}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer shadow-2xs"
                title="GitHub Profilini Aç"
              >
                <GitBranch className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
                <span>GitHub</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
              </button>

              <button
                type="button"
                onClick={(e) => handleOpenLink(e, 'https://ilyasbozdemir.dev')}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/60 text-[11px] font-mono font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-all cursor-pointer shadow-2xs"
                title="ilyasbozdemir.dev Web Sitesini Aç"
              >
                <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
                <span>ilyasbozdemir.dev</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Step Info */}
        <div className="mt-6 w-full text-left">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <CurrentIcon className="w-4 h-4 text-blue-600 dark:text-sky-400 shrink-0" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                {LOADING_STEPS[currentStepIdx].title}
              </span>
            </div>
            <span className="text-xs font-mono font-extrabold text-blue-600 dark:text-sky-400 shrink-0">
              %{progress}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-linear-to-r from-blue-500 via-indigo-500 to-sky-400 transition-all duration-100 ease-out shadow-xs shadow-blue-500/50"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 truncate font-mono">
            {LOADING_STEPS[currentStepIdx].subtitle}
          </p>
        </div>

        {/* Footer skip hint */}
        <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800/60 w-full flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
          <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
            <Zap className="w-3 h-3 text-amber-500 dark:text-amber-400" />
            <span>Hızlı & Güvenli Yerel SQLite Mimarisi</span>
          </div>
          <button
            type="button"
            onClick={finishImmediately}
            className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer bg-transparent border-0 underline font-bold"
          >
            Hemen Başlat (ESC)
          </button>
        </div>
      </div>
    </div>
  )
}

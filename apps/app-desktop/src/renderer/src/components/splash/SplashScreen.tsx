import React, { useCallback, useEffect, useState } from 'react'
import {
  Code2,
  Cpu,
  Database,
  ExternalLink,
  FileCheck,
  GitBranch,
  Globe,
  Landmark,
  ShieldCheck,
  Sparkles
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
    icon: Cpu,
    color: 'from-blue-500 to-cyan-400'
  },
  {
    progress: 40,
    title: 'Veritabanı & Şema Manifestleri',
    subtitle: 'SQLite yerel çalışma alanı ve şablon tabloları doğrulanıyor...',
    icon: Database,
    color: 'from-indigo-500 to-blue-500'
  },
  {
    progress: 70,
    title: '4734 Sayılı KİK Mevzuat & Şablon Motoru',
    subtitle: 'Doğrudan temin formülleri, hesaplama cetvelleri ve matrisler yükleniyor...',
    icon: FileCheck,
    color: 'from-sky-500 to-indigo-500'
  },
  {
    progress: 90,
    title: 'Geliştirici Mimarisi Doğrulandı',
    subtitle: 'İlyas BOZDEMİR (ilyasbozdemir.dev) • Modüller Hazırlanıyor...',
    icon: Code2,
    color: 'from-violet-500 to-purple-500'
  },
  {
    progress: 100,
    title: 'Temin 360 Hazır',
    subtitle: 'Arayüz açılıyor, keyifli çalışmalar dileriz!',
    icon: Sparkles,
    color: 'from-emerald-500 to-teal-400'
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

  const CurrentStep = LOADING_STEPS[currentStepIdx]
  const CurrentIcon = CurrentStep.icon

  return (
    <div
      className={`fixed inset-0 z-99999 flex items-center justify-center bg-slate-950/60 dark:bg-black/85 backdrop-blur-xl text-slate-900 dark:text-slate-100 select-none transition-all duration-500 ease-out ${
        fadingOut ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      onClick={finishImmediately}
      title="Hemen başlatmak için tıklayın veya ESC tuşuna basın"
    >
      {/* Dynamic Background Ambient Glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-500/20 dark:bg-blue-600/25 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-500/20 dark:bg-indigo-600/25 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-sky-400/10 dark:bg-cyan-500/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Main Glassmorphic Card */}
      <div
        className="relative w-full max-w-135 mx-4 p-8 sm:p-9 rounded-4xl bg-white/95 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.25)] dark:shadow-[0_30px_90px_rgba(0,0,0,0.85)] ring-1 ring-black/5 dark:ring-white/10 flex flex-col items-center text-center overflow-hidden transition-all backdrop-blur-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Shimmer Line */}
        <div className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-transparent via-blue-500/70 dark:via-sky-400/70 to-transparent" />

        {/* Top App / Institution Logo Presentation */}
        <div className="relative mb-4 group">
          <div className="relative w-21 h-21 rounded-3xl bg-linear-to-tr from-blue-600 via-indigo-600 to-sky-400 p-0.5 shadow-xl shadow-blue-500/25 flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:shadow-blue-500/40">
            <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[22px] flex items-center justify-center p-2.5 overflow-hidden">
              <img
                src={activeLogo}
                alt="Logo"
                className="w-full h-full object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          </div>
          <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-slate-900 dark:bg-blue-500 text-white dark:text-slate-950 text-[10px] font-black tracking-wider uppercase shadow-md ring-2 ring-white dark:ring-slate-900">
            {isCustomLogo ? 'KURUM' : 'PRO'}
          </span>
        </div>

        {/* Title */}
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-[26px] font-black tracking-tight bg-linear-to-r from-slate-900 via-blue-900 to-slate-800 dark:from-white dark:via-sky-100 dark:to-slate-300 bg-clip-text text-transparent">
            TEMİN 360 PRO
          </h1>
          <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-sky-400 text-[10px] font-extrabold border border-blue-500/20">
            v2.0
          </span>
        </div>

        {/* Institution Info Pill */}
        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 max-w-full">
          <Landmark className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400 shrink-0" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
            {institutionName && institutionName !== 'Kurum Bilgisi Bekleniyor...'
              ? institutionName
              : 'Kamu Satınalma & Doğrudan Temin Süreç Yönetim Platformu'}
          </span>
        </div>

        {/* Developer Credit Box */}
        <div className="mt-5 w-full p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-950/70 border border-slate-200/90 dark:border-slate-800/80 flex flex-col gap-3 shadow-xs">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-left w-full sm:w-auto">
              <div className="relative w-11 h-11 rounded-2xl bg-linear-to-br from-indigo-500 via-blue-600 to-sky-500 p-[1.5px] shadow-md shadow-blue-500/20 shrink-0">
                <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-white font-black text-sm tracking-wider">
                  İB
                </div>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                    İlyas BOZDEMİR
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30">
                    Developer & Architect
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block mt-0.5 truncate">
                  Lead Software Architect
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
              <button
                type="button"
                onClick={(e) => handleOpenLink(e, 'https://github.com/ilyasbozdemir')}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-sky-400 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-xs transition-all cursor-pointer"
                title="GitHub Profilini Aç"
              >
                <GitBranch className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
                <span>GitHub</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-50" />
              </button>

              <button
                type="button"
                onClick={(e) => handleOpenLink(e, 'https://ilyasbozdemir.dev')}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200/90 dark:border-blue-800/80 text-[11px] font-mono font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/80 hover:shadow-xs transition-all cursor-pointer"
                title="ilyasbozdemir.dev Web Sitesini Aç"
              >
                <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
                <span>ilyasbozdemir.dev</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-50" />
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Loading Step Section */}
        <div className="mt-6 w-full text-left">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-center shrink-0">
                <CurrentIcon className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400 animate-pulse" />
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                {CurrentStep.title}
              </span>
            </div>
            <span className="text-xs font-mono font-black text-blue-600 dark:text-sky-400 shrink-0 ml-2">
              %{progress}
            </span>
          </div>

          {/* Progress Bar with Glowing Shimmer Beam */}
          <div className="relative w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 overflow-hidden p-0.5">
            <div
              className={`relative h-full rounded-full bg-linear-to-r ${CurrentStep.color} transition-all duration-150 ease-out shadow-xs`}
              style={{ width: `${progress}%` }}
            >
              {/* Shimmer light sweep on active progress */}
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/40 to-transparent animate-[shimmer_2s_infinite]" />
            </div>
          </div>

          <div className="flex items-center gap-1.5 mt-2.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-mono">
              {CurrentStep.subtitle}
            </p>
          </div>
        </div>

        {/* Footer Bar with Status and Quick-Skip Kbd Badge */}
        <div className="mt-6 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 w-full flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 font-semibold">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-[11px]">Hızlı & Güvenli Yerel SQLite Mimarisi</span>
          </div>

          <button
            type="button"
            onClick={finishImmediately}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer group bg-transparent border-0"
          >
            <span className="text-[11px] font-medium group-hover:underline">Hemen Başlat</span>
            <kbd className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 border border-slate-300/80 dark:border-slate-700 shadow-2xs group-hover:bg-slate-200 dark:group-hover:bg-slate-700">
              ESC
            </kbd>
          </button>
        </div>
      </div>
    </div>
  )
}

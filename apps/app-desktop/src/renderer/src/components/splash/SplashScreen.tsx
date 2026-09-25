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
  Sparkles,
  ArrowRight,
  Layers,
  CheckCircle2
} from 'lucide-react'
import defaultAppIcon from '../../assets/icon.png'
import { useSettingsStore } from '../../store/settingsStore'
import { useWorkspaceStore } from '../../store/workspaceStore'

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
    color: 'from-blue-500 via-sky-400 to-cyan-400'
  },
  {
    progress: 40,
    title: 'Veritabanı & Şema Bütünlüğü',
    subtitle: 'SQLite yerel çalışma alanı, tablolar ve göç adımları denetleniyor...',
    icon: Database,
    color: 'from-indigo-500 via-blue-500 to-sky-400'
  },
  {
    progress: 70,
    title: '4734 Sayılı KİK Mevzuat & Şablon Motoru',
    subtitle: 'Doğrudan temin standart formülleri, hesaplama cetvelleri yükleniyor...',
    icon: FileCheck,
    color: 'from-sky-500 via-indigo-500 to-violet-500'
  },
  {
    progress: 90,
    title: 'Modül & Arayüz Katmanları Hazır',
    subtitle: 'Birim fiyat modülleri, komisyon yönetimi ve şablonlar doğrulanıyor...',
    icon: Code2,
    color: 'from-violet-500 via-purple-500 to-indigo-500'
  },
  {
    progress: 100,
    title: 'Temin 360 Başlamaya Hazır',
    subtitle: 'Arayüz açılıyor, keyifli ve verimli çalışmalar dileriz!',
    icon: Sparkles,
    color: 'from-emerald-500 via-teal-400 to-cyan-400'
  }
]

export function SplashScreen({
  onComplete,
  durationMs = 4500,
  autoHide = true
}: SplashScreenProps): React.JSX.Element | null {
  const [visible, setVisible] = useState(true)
  const [fadingOut, setFadingOut] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStepIdx, setCurrentStepIdx] = useState(0)

  const { institutionLogo, logoLeft, institutionName, harcamaBirimAdi, loadSettings } =
    useSettingsStore()
  const { activeMeta } = useWorkspaceStore()

  useEffect(() => {
    loadSettings().catch(() => null)
  }, [loadSettings])

  // Institution identification
  const currentInstitutionName =
    activeMeta?.institution ||
    (institutionName && institutionName !== 'Kurum Bilgisi Bekleniyor...'
      ? institutionName
      : null)
  const customInstLogo = institutionLogo || logoLeft

  const finishImmediately = useCallback((): void => {
    setProgress(100)
    setCurrentStepIdx(4)
    setFadingOut(true)
    setTimeout(() => {
      setVisible(false)
      if (onComplete) onComplete()
    }, 250)
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
      className={`fixed inset-0 z-99999 flex flex-col justify-between p-6 sm:p-10 md:p-14 bg-slate-50/95 dark:bg-[#080d1a]/95 backdrop-blur-2xl text-slate-900 dark:text-slate-100 select-none transition-all duration-500 ease-out overflow-hidden ${
        fadingOut ? 'opacity-0 scale-98 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      onClick={finishImmediately}
      title="Hemen başlatmak için tıklayın veya ESC tuşuna basın"
    >
      {/* Ambient Fluid Glows */}
      <div className="absolute -top-40 -left-40 w-130 h-130 bg-blue-500/15 dark:bg-blue-600/20 rounded-full blur-[130px] pointer-events-none animate-pulse" />
      <div className="absolute top-1/3 -right-40 w-140 h-140 bg-indigo-500/15 dark:bg-indigo-600/20 rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute -bottom-40 left-1/3 w-120 h-120 bg-sky-400/10 dark:bg-cyan-500/15 rounded-full blur-[130px] pointer-events-none" />

      {/* Subtle Grid Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />

      {/* ================= TOP BAR ================= */}
      <header className="relative z-10 w-full max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Platform & Engine Badge */}
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xs backdrop-blur-md">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="text-xs font-bold tracking-tight text-slate-700 dark:text-slate-300">
            4734 Sayılı Kamu İhale Mevzuatı • Doğrudan Temin ve Hakediş Sistemi
          </span>
        </div>

        {/* Right: Version & Quick Skip */}
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-sky-300 text-xs font-mono font-bold border border-blue-200/80 dark:border-blue-800/60 shadow-xs">
            v2.0 PRO
          </span>

          <button
            type="button"
            onClick={finishImmediately}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-sky-400 hover:border-blue-300 dark:hover:border-blue-600 shadow-xs transition-all cursor-pointer group"
          >
            <span>Hemen Başlat</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700 group-hover:bg-blue-500 group-hover:text-white transition-colors">
              ESC
            </kbd>
          </button>
        </div>
      </header>

      {/* ================= HERO CENTER (BREATHABLE & LUXURIOUS) ================= */}
      <main
        className="relative z-10 w-full max-w-6xl mx-auto my-auto py-8 flex flex-col items-center text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Brand Showcase with Dual Identity (App Master Brand + User Workspace) */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-14 w-full">
          {/* Main Application Identity Box */}
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            {/* Master App Icon */}
            <div className="relative group">
              <div className="absolute -inset-1 rounded-3xl bg-linear-to-r from-blue-600 via-indigo-600 to-sky-400 opacity-60 blur-lg group-hover:opacity-100 transition duration-500" />
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xl flex items-center justify-center p-3.5 overflow-hidden">
                <img
                  src={defaultAppIcon}
                  alt="TEMİN 360 Logo"
                  className="w-full h-full object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            </div>

            {/* Main App Title */}
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2.5">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight bg-linear-to-r from-slate-950 via-blue-900 to-slate-800 dark:from-white dark:via-sky-100 dark:to-slate-300 bg-clip-text text-transparent">
                  TEMİN 360
                </h1>
                <span className="px-2 py-0.5 rounded-md bg-linear-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-black tracking-wider uppercase shadow-xs">
                  PRO
                </span>
              </div>
              <p className="mt-1.5 text-sm sm:text-base font-semibold text-slate-600 dark:text-slate-400 max-w-md">
                Kamu Satınalma, Doğrudan Temin ve Hakediş Yönetim Sistemi
              </p>
            </div>
          </div>

          {/* Divider on large screens */}
          <div className="hidden lg:block w-px h-24 bg-linear-to-b from-transparent via-slate-200 dark:via-slate-800 to-transparent" />

          {/* Active Workspace / Institution Profile Card */}
          <div className="w-full max-w-md p-5 rounded-3xl bg-white/85 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800/90 shadow-xl dark:shadow-2xl shadow-slate-200/50 dark:shadow-black/60 backdrop-blur-xl flex items-center gap-4 text-left transition-all">
            {customInstLogo ? (
              <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 flex items-center justify-center shrink-0 shadow-inner overflow-hidden">
                <img
                  src={customInstLogo}
                  alt="Kurum Logosu"
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center shrink-0">
                <Landmark className="w-7 h-7 text-blue-600 dark:text-sky-400" />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-sky-400">
                  {currentInstitutionName ? 'Aktif Kurum Çalışma Alanı' : 'Çalışma Dosyası'}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate mt-0.5">
                {currentInstitutionName || 'Genel Kurum Çalışma Alanı'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5 font-medium">
                {harcamaBirimAdi || 'SQLite Yerel Veritabanı • Çevrimdışı Güvenli'}
              </p>
            </div>
          </div>
        </div>

        {/* ================= LOADING PIPELINE (WIDE & SLEEK) ================= */}
        <div className="w-full max-w-3xl mt-12 sm:mt-16">
          {/* Active Step Indicator Banner */}
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0 shadow-xs">
                <CurrentIcon className="w-4 h-4 text-blue-600 dark:text-sky-400 animate-pulse" />
              </div>
              <div className="text-left min-w-0">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                  {CurrentStep.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-mono mt-0.5">
                  {CurrentStep.subtitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 ml-4">
              <span className="text-base sm:text-lg font-mono font-black text-blue-600 dark:text-sky-400">
                %{progress}
              </span>
            </div>
          </div>

          {/* Smooth Energy Progress Bar */}
          <div className="relative w-full h-3 rounded-full bg-slate-200/80 dark:bg-slate-900 border border-slate-300/80 dark:border-slate-800 p-0.5 overflow-hidden shadow-inner">
            <div
              className={`relative h-full rounded-full bg-linear-to-r ${CurrentStep.color} transition-all duration-150 ease-out shadow-md`}
              style={{ width: `${progress}%` }}
            >
              {/* Pulsing Highlight Glow */}
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/40 to-transparent animate-[shimmer_2s_infinite]" />
            </div>
          </div>

          {/* 5-Step Pipeline Dots */}
          <div className="grid grid-cols-5 gap-2 mt-3.5">
            {LOADING_STEPS.map((step, idx) => {
              const isPassed = progress >= step.progress
              const isCurrent = currentStepIdx === idx
              return (
                <div
                  key={step.title}
                  className={`flex items-center gap-1.5 text-left transition-opacity duration-300 ${
                    isCurrent ? 'opacity-100' : isPassed ? 'opacity-70' : 'opacity-35'
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full shrink-0 transition-colors ${
                      isPassed
                        ? 'bg-blue-600 dark:bg-sky-400'
                        : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  />
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 truncate hidden md:inline">
                    {step.title.split(' ')[0]}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </main>

      {/* ================= FOOTER BAR ================= */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
        {/* Left: Architect & Developer Signature */}
        <div className="flex items-center gap-3 text-left">
          <div className="relative w-9 h-9 rounded-xl bg-linear-to-br from-indigo-500 via-blue-600 to-sky-500 p-[1.5px] shadow-sm shrink-0">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center text-white font-black text-xs">
              İB
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-900 dark:text-white">
                İlyas BOZDEMİR
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                Lead Software Architect
              </span>
            </div>
            <div className="flex items-center gap-3 mt-0.5">
              <button
                type="button"
                onClick={(e) => handleOpenLink(e, 'https://github.com/ilyasbozdemir')}
                className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-sky-400 transition-colors cursor-pointer"
              >
                <GitBranch className="w-3 h-3" />
                <span>GitHub</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-50" />
              </button>

              <span className="text-slate-300 dark:text-slate-700">•</span>

              <button
                type="button"
                onClick={(e) => handleOpenLink(e, 'https://ilyasbozdemir.dev')}
                className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-blue-600 dark:text-sky-400 hover:underline transition-colors cursor-pointer"
              >
                <Globe className="w-3 h-3" />
                <span>ilyasbozdemir.dev</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-50" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Security & Storage Assurance */}
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Yerel SQLite Mimarisi • %100 Çevrimdışı Veri Güvenliği</span>
        </div>
      </footer>
    </div>
  )
}

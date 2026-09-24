import React from 'react'
import { Link } from '@tanstack/react-router'
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  FileSpreadsheet,
  FileText,
  Gavel,
  KeyRound,
  Plus,
  ShieldCheck,
  Sparkles
} from 'lucide-react'

interface DashboardHeroV2Props {
  isIhale: boolean
  currentDate: string
  greeting: string
  adminName?: string
  adminUsername?: string
  adminTitle?: string
  institutionName?: string
  isAiConfigured: boolean
  stats: any
  onOpenAi: () => void
  onShowAiMissing: () => void
  smartAlerts: any[]
}

export const DashboardHeroV2: React.FC<DashboardHeroV2Props> = ({
  isIhale,
  currentDate,
  greeting,
  adminName,
  adminUsername,
  adminTitle,
  institutionName,
  isAiConfigured,
  stats,
  onOpenAi,
  onShowAiMissing,
  smartAlerts
}) => {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl p-7 md:p-8 shadow-xs border transition-all duration-500 ${
        isIhale
          ? 'bg-linear-to-br from-indigo-50/90 via-white to-slate-50/80 border-indigo-100 dark:bg-linear-to-br dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/80 dark:border-indigo-800/50 text-slate-800 dark:text-white'
          : 'bg-linear-to-br from-blue-50/90 via-white to-slate-50/80 border-blue-100 dark:bg-linear-to-br dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/80 dark:border-slate-800 text-slate-800 dark:text-white'
      }`}
    >
      {/* Dekoratif Glow Işıkları */}
      <div
        className={`absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-all duration-500 opacity-30 dark:opacity-100 ${
          isIhale ? 'bg-indigo-300 dark:bg-indigo-600/30' : 'bg-blue-300 dark:bg-blue-600/25'
        }`}
      />
      <div
        className={`absolute bottom-0 left-1/3 -ml-20 -mb-20 w-80 h-80 rounded-full blur-3xl pointer-events-none transition-all duration-500 opacity-25 dark:opacity-100 ${
          isIhale ? 'bg-purple-300 dark:bg-purple-600/25' : 'bg-indigo-300 dark:bg-indigo-600/20'
        }`}
      />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-3 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase border ${
                isIhale
                  ? 'bg-indigo-100/90 text-indigo-700 border-indigo-200/80 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-400/30'
                  : 'bg-blue-100/90 text-blue-700 border-blue-200/80 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-400/30'
              }`}
            >
              {isIhale ? (
                <Gavel className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              )}
              {isIhale
                ? 'KAMU İHALE MERKEZİ • KİK 19/21 & HAKEDİŞ YÖNETİMİ'
                : 'DOĞRUDAN TEMİN PORTALI • KİK 22/d HARCAMA YÖNETİMİ'}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-100/90 text-emerald-800 border border-emerald-200/80 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              {isIhale
                ? '4734 Kamu İhale & 4735 Sözleşmeler Kanunu'
                : '4734 / 22-d & 5018 Sayılı Mali Yönetim Uyumlu'}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">{currentDate}</span>
          </div>

          <div>
            <div
              className={`text-xs font-bold tracking-wider uppercase mb-1 ${
                isIhale
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-blue-600 dark:text-blue-400'
              }`}
            >
              {greeting},
            </div>
            <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                {adminName && !adminName.includes('YÖNETİCİ')
                  ? adminName
                  : adminUsername || 'İdare Yöneticisi'}
              </h1>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-white/10 shadow-2xs">
                {adminTitle && !adminTitle.includes('YÖNETİCİ')
                  ? adminTitle
                  : isIhale
                    ? 'İhale Yetkilisi / Şube Müdürü'
                    : 'Harcama Yetkilisi / Şube Müdürü'}
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed max-w-2xl">
              <strong className="text-slate-900 dark:text-white font-semibold">
                {institutionName && !institutionName.includes('KURUM')
                  ? institutionName
                  : 'Kurum İdaresi'}
              </strong>{' '}
              {isIhale
                ? 'bünyesindeki Açık İhale (KİK 19), Pazarlık Usulü (KİK 21), yaklaşık maliyet hesaplamaları, ihale komisyon kararları, sözleşme ve ara/kesin hakediş işlemleri tek ekranda yönetiliyor.'
                : 'bünyesindeki doğrudan temin süreçleri (22/d), piyasa fiyat araştırmaları, KİK eşik limit kontrolleri, onay belgeleri ve harcama talimatları tek ekranda yönetiliyor.'}
            </p>
          </div>
        </div>

        {/* Hızlı Aksiyon Butonları - MODA GÖRE DİNAMİK */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full lg:w-97.5 shrink-0">
          {isAiConfigured ? (
            <button
              type="button"
              onClick={onOpenAi}
              className="w-full bg-linear-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-2.5 px-3.5 rounded-xl shadow-md shadow-purple-900/20 border border-purple-400/30 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] text-xs"
            >
              <Sparkles className="w-4 h-4 text-purple-200 animate-spin" />
              <span className="font-extrabold tracking-wide">TEMİN 360 AI</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onShowAiMissing}
              className="w-full bg-slate-100/90 hover:bg-slate-200/90 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium py-2.5 px-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-400/80 dark:hover:border-amber-500/80 flex items-center justify-between gap-1.5 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.98] text-xs group"
              title="TEMİN 360 AI (API Anahtarı Gerekli - Tanımlamak için tıklayın)"
            >
              <div className="flex items-center gap-1.5 truncate">
                <KeyRound className="w-3.5 h-3.5 text-amber-500 shrink-0 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white truncate">
                  TEMİN 360 AI
                </span>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800 shrink-0">
                API Key Gerekli
              </span>
            </button>
          )}

          {isIhale ? (
            <Link to="/harcama-merkezi" className="w-full">
              <button
                type="button"
                className="w-full bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-2.5 px-3.5 rounded-xl shadow-md shadow-indigo-900/20 border border-indigo-400/30 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] text-xs"
              >
                <Plus className="w-4 h-4" />
                <span className="font-extrabold tracking-wide">+ Yeni İhale (19/21)</span>
              </button>
            </Link>
          ) : (
            <Link to="/dosyalar/yeni" className="w-full">
              <button
                type="button"
                className="w-full bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold py-2.5 px-3.5 rounded-xl shadow-md shadow-blue-900/20 border border-blue-400/30 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] text-xs"
              >
                <Plus className="w-4 h-4" />
                <span className="font-extrabold tracking-wide">+ Yeni Temin (22)</span>
              </button>
            </Link>
          )}

          {isIhale ? (
            <Link to="/hakedis" className="w-full">
              <button
                type="button"
                className="w-full bg-linear-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold py-2.5 px-3.5 rounded-xl shadow-md shadow-amber-900/20 border border-amber-400/30 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] text-xs"
              >
                <Gavel className="w-4 h-4" />
                <span className="font-extrabold tracking-wide">İhale & Hakediş</span>
              </button>
            </Link>
          ) : (
            <Link to="/harcama-merkezi" className="w-full">
              <button
                type="button"
                className="w-full bg-linear-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white font-bold py-2.5 px-3.5 rounded-xl shadow-md shadow-blue-900/20 border border-blue-400/30 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] text-xs"
              >
                <FileText className="w-4 h-4" />
                <span className="font-extrabold tracking-wide">Piyasa Araştırması</span>
              </button>
            </Link>
          )}

          <Link to="/dosyalar" className="w-full">
            <button
              type="button"
              className="w-full bg-white hover:bg-slate-50 dark:bg-slate-800/90 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-100 hover:text-slate-900 dark:hover:text-white border border-slate-200/90 dark:border-slate-700/90 font-bold py-2.5 px-3.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] text-xs"
            >
              <FileSpreadsheet
                className={`w-4 h-4 ${
                  isIhale
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-blue-600 dark:text-blue-400'
                }`}
              />
              <span className="font-bold">
                {isIhale
                  ? `İhale Dosyaları (${stats.ihaleDosyaSayisi || 0})`
                  : `Temin Dosyaları (${stats.dogrudanTeminSayisi || 0})`}
              </span>
            </button>
          </Link>
        </div>
      </div>

      {/* Akıllı Durum Uyarıları (Smart Alerts) */}
      {smartAlerts.length > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-amber-50/90 dark:bg-amber-950/40 -mx-7 md:-mx-8 -mb-7 md:-mb-8 px-7 md:px-8 py-3.5 border-t-amber-300/50 dark:border-t-amber-500/30">
          <div className="flex items-center gap-2.5 text-amber-900 dark:text-amber-200 text-xs font-medium">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              <strong className="text-amber-700 dark:text-amber-300 font-bold">
                Sistem Uyarısı:
              </strong>{' '}
              {smartAlerts[0].title} —{' '}
              <span className="text-slate-700 dark:text-slate-200">{smartAlerts[0].message}</span>
            </span>
          </div>
          <Link to={smartAlerts[0].actionLink as any} search={smartAlerts[0].actionSearch as any}>
            <button className="text-xs font-bold text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 underline flex items-center gap-1 cursor-pointer shrink-0">
              {smartAlerts[0].actionText} <ChevronRight className="w-3 h-3" />
            </button>
          </Link>
        </div>
      )}
    </div>
  )
}

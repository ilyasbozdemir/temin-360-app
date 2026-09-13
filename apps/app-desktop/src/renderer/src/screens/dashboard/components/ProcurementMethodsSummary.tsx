import React from 'react'
import { Link } from '@tanstack/react-router'
import { ChevronRight, Scale } from 'lucide-react'
import { cn } from '../../../utils/cn'

interface ProcurementMethodsSummaryProps {
  procurementMode: 'dogrudan_temin' | 'ihale' | 'all'
  switchProcurementMode: (mode: 'dogrudan_temin' | 'ihale' | 'all') => void
  stats: any
  isLoading: boolean
  formatCurrency: (value: number) => string
}

export const ProcurementMethodsSummary: React.FC<ProcurementMethodsSummaryProps> = ({
  procurementMode,
  switchProcurementMode,
  stats,
  isLoading,
  formatCurrency
}) => {
  const totalAllCount =
    (stats.dogrudanTeminSayisi || 0) +
    (stats.acikIhaleSayisi || 0) +
    (stats.pazarlikSayisi || 0) +
    (stats.hakediseSayisi || 0)

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Başlık */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center border border-indigo-200 dark:border-indigo-900/50">
            <Scale className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
              Usule Göre Temin Dağılımı
            </h2>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              4734 Sayılı KİK kapsamındaki tüm usullerin anlık özeti
            </p>
          </div>
        </div>
        <Link to="/dosyalar">
          <button
            type="button"
            className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            Tümünü Gör <ChevronRight className="w-3 h-3" />
          </button>
        </Link>
      </div>

      {/* 4'lü Kart Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-slate-100 dark:divide-slate-800">
        {/* Doğrudan Temin */}
        <div
          onClick={() => switchProcurementMode('dogrudan_temin')}
          className={cn(
            'p-4 md:p-5 transition-all cursor-pointer relative',
            procurementMode === 'dogrudan_temin'
              ? 'bg-blue-50/90 dark:bg-blue-950/40 ring-2 ring-inset ring-blue-500/80 shadow-inner'
              : 'hover:bg-blue-50/60 dark:hover:bg-blue-950/20'
          )}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
              Doğrudan Temin
            </span>
            <div className="flex items-center gap-1">
              {procurementMode === 'dogrudan_temin' && (
                <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-600 text-white shadow-xs">
                  Aktif
                </span>
              )}
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50">
                Md. 22
              </span>
            </div>
          </div>
          <div className="flex items-end justify-between gap-2">
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {isLoading ? (
                  <span className="inline-block w-8 h-7 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                ) : (
                  stats.dogrudanTeminSayisi
                )}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                dosya
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-black text-blue-600 dark:text-blue-400 font-mono">
                {isLoading ? '...' : formatCurrency(stats.dogrudanTeminMaliyet)}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                yaklaşık maliyet
              </div>
            </div>
          </div>
          {/* Mini progress bar */}
          <div className="mt-3 w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              style={{
                width: `${
                  totalAllCount > 0
                    ? Math.round(((stats.dogrudanTeminSayisi || 0) / totalAllCount) * 100)
                    : 0
                }%`
              }}
              className="h-full bg-blue-500 rounded-full transition-all duration-700"
            />
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
            %{' '}
            {totalAllCount > 0
              ? Math.round(((stats.dogrudanTeminSayisi || 0) / totalAllCount) * 100)
              : 0}{' '}
            toplam alım içinde
          </div>
        </div>

        {/* Açık İhale */}
        <div
          onClick={() => switchProcurementMode('ihale')}
          className={cn(
            'p-4 md:p-5 transition-all cursor-pointer relative',
            procurementMode === 'ihale'
              ? 'bg-amber-50/90 dark:bg-amber-950/40 ring-2 ring-inset ring-amber-500/80 shadow-inner'
              : 'hover:bg-amber-50/60 dark:hover:bg-amber-950/20'
          )}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
              Açık İhale
            </span>
            <div className="flex items-center gap-1">
              {procurementMode === 'ihale' && (
                <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-600 text-white shadow-xs">
                  Aktif Mod
                </span>
              )}
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50">
                Md. 19
              </span>
            </div>
          </div>
          <div className="flex items-end justify-between gap-2">
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {isLoading ? (
                  <span className="inline-block w-8 h-7 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                ) : (
                  stats.acikIhaleSayisi
                )}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                dosya
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-black text-amber-600 dark:text-amber-400 font-mono">
                {isLoading ? '...' : formatCurrency(stats.acikIhaleMaliyet)}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                yaklaşık maliyet
              </div>
            </div>
          </div>
          <div className="mt-3 w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              style={{
                width: `${
                  totalAllCount > 0
                    ? Math.round(((stats.acikIhaleSayisi || 0) / totalAllCount) * 100)
                    : 0
                }%`
              }}
              className="h-full bg-amber-500 rounded-full transition-all duration-700"
            />
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
            %{' '}
            {totalAllCount > 0
              ? Math.round(((stats.acikIhaleSayisi || 0) / totalAllCount) * 100)
              : 0}{' '}
            toplam alım içinde
          </div>
        </div>

        {/* Pazarlık Usulü */}
        <div
          onClick={() => switchProcurementMode('ihale')}
          className={cn(
            'p-4 md:p-5 transition-all cursor-pointer relative',
            procurementMode === 'ihale'
              ? 'bg-purple-50/90 dark:bg-purple-950/40 ring-2 ring-inset ring-purple-500/80 shadow-inner'
              : 'hover:bg-purple-50/60 dark:hover:bg-purple-950/20'
          )}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-purple-600 dark:text-purple-400">
              <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
              Pazarlık Usulü
            </span>
            <div className="flex items-center gap-1">
              {procurementMode === 'ihale' && (
                <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-600 text-white shadow-xs">
                  Aktif Mod
                </span>
              )}
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900/50">
                Md. 21
              </span>
            </div>
          </div>
          <div className="flex items-end justify-between gap-2">
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {isLoading ? (
                  <span className="inline-block w-8 h-7 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                ) : (
                  stats.pazarlikSayisi
                )}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                dosya
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-black text-purple-600 dark:text-purple-400 font-mono">
                {isLoading ? '...' : formatCurrency(stats.pazarlikMaliyet)}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                yaklaşık maliyet
              </div>
            </div>
          </div>
          <div className="mt-3 w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              style={{
                width: `${
                  totalAllCount > 0
                    ? Math.round(((stats.pazarlikSayisi || 0) / totalAllCount) * 100)
                    : 0
                }%`
              }}
              className="h-full bg-purple-500 rounded-full transition-all duration-700"
            />
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
            %{' '}
            {totalAllCount > 0
              ? Math.round(((stats.pazarlikSayisi || 0) / totalAllCount) * 100)
              : 0}{' '}
            toplam alım içinde
          </div>
        </div>

        {/* Hakediş / Yapım */}
        <div
          onClick={() => switchProcurementMode('ihale')}
          className={cn(
            'p-4 md:p-5 transition-all cursor-pointer relative',
            procurementMode === 'ihale'
              ? 'bg-emerald-50/90 dark:bg-emerald-950/40 ring-2 ring-inset ring-emerald-500/80 shadow-inner'
              : 'hover:bg-emerald-50/60 dark:hover:bg-emerald-950/20'
          )}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              Hakediş / Yapım
            </span>
            <div className="flex items-center gap-1">
              {procurementMode === 'ihale' && (
                <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-600 text-white shadow-xs">
                  Aktif Mod
                </span>
              )}
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50">
                Yapım İşi
              </span>
            </div>
          </div>
          <div className="flex items-end justify-between gap-2">
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {isLoading ? (
                  <span className="inline-block w-8 h-7 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                ) : (
                  stats.hakediseSayisi
                )}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                dosya
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {isLoading ? '...' : formatCurrency(stats.hakediseMaliyet)}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                yaklaşık maliyet
              </div>
            </div>
          </div>
          <div className="mt-3 w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              style={{
                width: `${
                  totalAllCount > 0
                    ? Math.round(((stats.hakediseSayisi || 0) / totalAllCount) * 100)
                    : 0
                }%`
              }}
              className="h-full bg-emerald-500 rounded-full transition-all duration-700"
            />
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
            %{' '}
            {totalAllCount > 0
              ? Math.round(((stats.hakediseSayisi || 0) / totalAllCount) * 100)
              : 0}{' '}
            toplam alım içinde
          </div>
        </div>
      </div>
    </div>
  )
}

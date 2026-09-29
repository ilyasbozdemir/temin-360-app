import React from 'react'
import {
  AlertTriangle,
  Building2,
  ChevronRight,
  Info,
  Scale,
  ShieldAlert,
  ShieldCheck,
  TrendingUp
} from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { cn } from '../../../utils/cn'
import type { DashboardStats, KikLimitStat, BirimHarcamaStat } from '../dashboard.hooks'

interface KikLimitVeBirimAnalizSectionProps {
  stats: DashboardStats
  isLoading: boolean
  formatCurrency: (value: number) => string
}

export const KikLimitVeBirimAnalizSection: React.FC<KikLimitVeBirimAnalizSectionProps> = ({
  stats,
  isLoading,
  formatCurrency
}): React.ReactElement => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm animate-pulse min-h-[340px]">
          <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/3 mb-4" />
          <div className="h-24 bg-slate-100 dark:bg-slate-800/60 rounded-2xl mb-4" />
          <div className="grid grid-cols-3 gap-3">
            <div className="h-16 bg-slate-100 dark:bg-slate-800/60 rounded-xl" />
            <div className="h-16 bg-slate-100 dark:bg-slate-800/60 rounded-xl" />
            <div className="h-16 bg-slate-100 dark:bg-slate-800/60 rounded-xl" />
          </div>
        </div>
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm animate-pulse min-h-[340px]">
          <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/3 mb-4" />
          <div className="space-y-3">
            <div className="h-12 bg-slate-100 dark:bg-slate-800/60 rounded-xl" />
            <div className="h-12 bg-slate-100 dark:bg-slate-800/60 rounded-xl" />
            <div className="h-12 bg-slate-100 dark:bg-slate-800/60 rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  const limitStat: KikLimitStat | null = stats.kikLimitStat
  const birimler: BirimHarcamaStat[] = stats.birimHarcamalari || []

  // Durum renk ve metin belirleyicileri
  const getDurumConfig = (durum?: string): {
    color: string
    bg: string
    barColor: string
    badgeText: string
    badgeClass: string
    icon: typeof ShieldCheck
  } => {
    switch (durum) {
      case 'asildi':
        return {
          color: 'text-red-600 dark:text-red-400',
          bg: 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/60',
          barColor: 'bg-red-600',
          badgeText: 'Yıllık Limit Aşıldı!',
          badgeClass: 'bg-red-500 text-white',
          icon: ShieldAlert
        }
      case 'kritik':
        return {
          color: 'text-orange-600 dark:text-orange-400',
          bg: 'bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-900/60',
          barColor: 'bg-orange-500',
          badgeText: 'Kritik Limit Eşiği (>%85)',
          badgeClass: 'bg-orange-500 text-white',
          icon: AlertTriangle
        }
      case 'uyari':
        return {
          color: 'text-amber-600 dark:text-amber-400',
          bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60',
          barColor: 'bg-amber-500',
          badgeText: 'Limit İzleme Modu (>%65)',
          badgeClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-300',
          icon: AlertTriangle
        }
      default:
        return {
          color: 'text-emerald-600 dark:text-emerald-400',
          bg: 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/40',
          barColor: 'bg-emerald-500',
          badgeText: 'Güvenli Limit Alanı',
          badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-300',
          icon: ShieldCheck
        }
    }
  }

  const durumCfg = getDurumConfig(limitStat?.durum)
  const DurumIcon = durumCfg.icon

  // Birim renk paleti
  const barColors = [
    'from-blue-600 to-indigo-600',
    'from-emerald-500 to-teal-600',
    'from-violet-600 to-purple-600',
    'from-amber-500 to-orange-600',
    'from-sky-500 to-cyan-600',
    'from-rose-500 to-pink-600'
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* ── 1. SOL: KİK 22/d YILLIK LİMİT TÜKETİM GÖSTERGESİ ── */}
      <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/50 flex items-center justify-center shrink-0">
                <Scale className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                    K.İ.K 22/d Yıllık Limit Tüketimi
                  </h3>
                  {limitStat && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {limitStat.donem_kodu} Dönemi
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  4734 Sayılı Kanun Madde 22/d Doğrudan Temin Yasal Eşik Kontrolü
                </p>
              </div>
            </div>

            <span
              className={cn(
                'inline-flex items-center gap-1.5 text-[10px] font-extrabold px-2.5 py-1 rounded-full border shadow-2xs shrink-0',
                durumCfg.badgeClass
              )}
            >
              <DurumIcon className="w-3.5 h-3.5" />
              {durumCfg.badgeText}
            </span>
          </div>

          {/* Limit Bar & Big Percentage */}
          {limitStat ? (
            <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-750/80 my-3 space-y-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Toplam Bütçe Tüketim Oranı
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
                      %{limitStat.tuketimYuzdesi}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      tüketildi
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Kurum Tipi / Statü
                  </span>
                  <div className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                    {limitStat.limitType === 'buyuksehir'
                      ? 'Büyükşehir Belediyesi / İdaresi (22/d*)'
                      : 'Diğer İdareler (22/d**)'}
                  </div>
                </div>
              </div>

              {/* Progress Bar with Gradient */}
              <div className="relative w-full h-3.5 bg-slate-200 dark:bg-slate-700/60 rounded-full overflow-hidden p-0.5">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-700 shadow-xs',
                    durumCfg.barColor
                  )}
                  style={{ width: `${Math.min(100, Math.max(2, limitStat.tuketimYuzdesi))}%` }}
                />
              </div>

              {/* 3 Metric Cards */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-2xs">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block truncate">
                    Yıllık Eşik Limit
                  </span>
                  <span className="text-xs font-black text-slate-800 dark:text-slate-100 truncate block mt-0.5">
                    {formatCurrency(limitStat.limit)}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-2xs">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block truncate">
                    Harcanan Tutar
                  </span>
                  <span className="text-xs font-black text-blue-600 dark:text-blue-400 truncate block mt-0.5">
                    {formatCurrency(limitStat.harcananTutar)}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-2xs">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block truncate">
                    Kalan Güvenli Limit
                  </span>
                  <span
                    className={cn(
                      'text-xs font-black truncate block mt-0.5',
                      limitStat.kalanTutar > 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-red-600 dark:text-red-400'
                    )}
                  >
                    {formatCurrency(limitStat.kalanTutar)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-850 rounded-2xl my-3">
              Henüz tanımlı KİK 22/d limit dönemi bulunamadı.
            </div>
          )}
        </div>

        {/* Footer Warning Info */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span>22/d alımlarında kısımlara bölme yasağı ve yıllık limit takibi esastır.</span>
          </div>
          <Link to="/ayarlar" className="font-bold text-blue-600 dark:text-blue-400 hover:underline shrink-0">
            Limitleri Düzenle →
          </Link>
        </div>
      </div>

      {/* ── 2. SAĞ: BİRİMLER BAZINDA HARCAMA DAĞILIMI & ANALİZİ ── */}
      <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-900/50 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                  Birimler Bazında Harcama Oranları
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Harcama yetkilisi birimlerin doğrudan temin bütçe kullanım payları
                </p>
              </div>
            </div>

            <Link to="/birimler">
              <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer">
                Tüm Birimler <ChevronRight className="w-3 h-3" />
              </span>
            </Link>
          </div>

          {/* Unit List with Progress Bars */}
          <div className="space-y-3 my-2 max-h-64 overflow-y-auto pr-1">
            {birimler.length > 0 ? (
              birimler.map((b, idx) => {
                const barGradient = barColors[idx % barColors.length]
                return (
                  <div
                    key={b.id}
                    className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-850/50 border border-slate-200/60 dark:border-slate-800/80 hover:border-indigo-200 dark:hover:border-indigo-800/60 transition-all"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                      <div className="flex items-center gap-2 truncate max-w-[65%]">
                        <span className="w-5 h-5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-[10px] font-black text-slate-500 shrink-0">
                          {idx + 1}
                        </span>
                        <span className="truncate">{b.birim_adi}</span>
                        <span className="text-[10px] font-medium text-slate-400 shrink-0">
                          ({b.dosya_sayisi} dosya)
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono text-slate-700 dark:text-slate-300">
                          {formatCurrency(b.toplam_harcama)}
                        </span>
                        <span className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded-md">
                          %{b.yuzde}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-500', barGradient)}
                        style={{ width: `${Math.min(100, Math.max(3, b.yuzde))}%` }}
                      />
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-850 rounded-2xl">
                Henüz birim atanmış harcama dosyası bulunmuyor.
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>Toplam {birimler.length} harcama birimi doğrudan temin sürecinde aktif.</span>
          </div>
          <span className="font-semibold text-slate-400">Canlı Veritabanı Eşitlemesi</span>
        </div>
      </div>
    </div>
  )
}

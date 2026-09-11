import React, { useMemo, useState } from 'react'
import { Calculator, Sparkles, TrendingUp, X } from 'lucide-react'
import { yiUfeService } from '../../services/yiUfeService'
import { useNavigate } from '@tanstack/react-router'

interface YiUfePriceBadgeProps {
  price: number
  year?: number | null
  month?: number | null
  title?: string
  className?: string
  compact?: boolean
}

export function YiUfePriceBadge({
  price,
  year,
  month,
  title,
  className = '',
  compact = false
}: YiUfePriceBadgeProps): React.JSX.Element | null {
  const [showModal, setShowModal] = useState(false)
  const navigate = useNavigate()

  // Eğer fiyat yoksa veya yıl güncel yıldan büyük/eşitse ya da yıl belirtilmemişse
  const latest = useMemo(() => yiUfeService.getLatest(), [])

  const calculation = useMemo(() => {
    if (!price || price <= 0 || !year || year >= latest.yil) {
      return null
    }
    return yiUfeService.calculateAdjustment({
      basePrice: price,
      baseYear: year,
      baseMonth: month || 7
    })
  }, [price, year, month, latest])

  if (!calculation || calculation.percentChange <= 0) {
    return null
  }

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 2
    }).format(val)
  }

  const formatNumber = (val: number, digits = 2) => {
    return new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    }).format(val)
  }

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setShowModal(true)
        }}
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer border shadow-2xs group ${
          compact
            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/50 hover:bg-amber-100'
            : 'bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-indigo-800/50 hover:border-blue-400'
        } ${className}`}
        title={`${year} yılı fiyatının güncel (${latest.ay_adi} ${latest.yil}) Yİ-ÜFE karşılığı: ${formatMoney(calculation.adjustedPrice)} (+%${formatNumber(calculation.percentChange)})`}
      >
        <TrendingUp className="w-3 h-3 text-blue-500 dark:text-blue-400 group-hover:scale-110 transition-transform" />
        <span>
          Güncel Yİ-ÜFE: {formatMoney(calculation.adjustedPrice)}
        </span>
        <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 font-extrabold">
          +%{formatNumber(calculation.percentChange, 1)}
        </span>
      </button>

      {/* DETAY AÇIKLAMA MODALI */}
      {showModal && (
        <div
          onClick={(e) => {
            e.stopPropagation()
            setShowModal(false)
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-sm space-y-4 animate-in zoom-in-95 duration-150 text-slate-800 dark:text-slate-100"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    Yİ-ÜFE Fiyat Güncelleme Detayı
                  </h4>
                  <p className="text-[10px] text-slate-400">TÜİK Üretici Fiyat Endeksi Esleme</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400">
                  Orijinal / Baz Fiyat ({calculation.baseYear} {calculation.baseMonthName}):
                </span>
                <span className="font-bold font-mono text-slate-800 dark:text-slate-200">
                  {formatMoney(calculation.basePrice)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60">
                  <span className="text-slate-400 block">Baz Endeks (Y0):</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                    {formatNumber(calculation.baseIndex)}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60">
                  <span className="text-slate-400 block">
                    Güncel Endeks ({calculation.targetMonthName} {calculation.targetYear}):
                  </span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                    {formatNumber(calculation.targetIndex)}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-950/60 dark:to-indigo-950/60 border border-blue-200 dark:border-indigo-900/60 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-blue-700 dark:text-blue-300 font-semibold">
                    Güncel Yİ-ÜFE Karşılığı:
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-600 text-white font-black">
                    Pn: {formatNumber(calculation.factor, 4)}
                  </span>
                </div>
                <div className="text-xl font-black text-slate-900 dark:text-white font-mono">
                  {formatMoney(calculation.adjustedPrice)}
                </div>
                <div className="text-[10px] text-blue-600 dark:text-blue-300 font-medium">
                  Kümülatif Fiyat Artışı: +%{formatNumber(calculation.percentChange)} (+{formatMoney(calculation.fark)})
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false)
                  navigate({ to: '/mevzuat', search: { tab: 'yi-ufe' } as any })
                }}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-700 underline cursor-pointer flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-amber-500" />
                Tüm Yİ-ÜFE Tablosunu İncele
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold cursor-pointer"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

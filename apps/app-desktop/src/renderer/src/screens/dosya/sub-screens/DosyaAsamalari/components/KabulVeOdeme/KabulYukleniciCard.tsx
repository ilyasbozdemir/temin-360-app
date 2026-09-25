import React from 'react'
import { Banknote, Calendar, Trophy } from 'lucide-react'
import { FirmaStats } from './types'

interface KabulYukleniciCardProps {
  kazananFirmaUnvan: string
  firmaStats: FirmaStats
  formatCurrency: (val: number | null) => string
  formatDate: (dateStr: string | null) => string
}

export function KabulYukleniciCard({
  kazananFirmaUnvan,
  firmaStats,
  formatCurrency,
  formatDate
}: KabulYukleniciCardProps) {
  return (
    <div className="bg-gradient-to-br from-emerald-50 via-white to-teal-50/30 dark:from-emerald-950/20 dark:via-slate-900 dark:to-teal-950/10 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0 border border-emerald-300/40 dark:border-emerald-700/40">
          <Trophy className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-wider">
            Yüklenici Firma
          </span>
          <span className="text-sm font-extrabold text-emerald-800 dark:text-emerald-300">
            {kazananFirmaUnvan}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/70 dark:bg-slate-800/50 rounded-xl p-3 border border-emerald-100 dark:border-emerald-900/30">
          <div className="flex items-center gap-1.5 mb-1">
            <Banknote className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Sözleşme / Teklif Tutarı
            </span>
          </div>
          <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
            {formatCurrency(firmaStats.teklifToplami)}
          </span>
        </div>
        <div className="bg-white/70 dark:bg-slate-800/50 rounded-xl p-3 border border-emerald-100 dark:border-emerald-900/30">
          <div className="flex items-center gap-1.5 mb-1">
            <Calendar className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Teslim Tarihi
            </span>
          </div>
          <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
            {formatDate(firmaStats.teslimTarihi)}
          </span>
        </div>
      </div>
    </div>
  )
}

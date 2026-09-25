import React from 'react'
import { Calculator, TrendingDown } from 'lucide-react'
import { FirmaStats } from './types'

interface KabulFaturaHakedisCardProps {
  firmaStats: FirmaStats
  faturaNo: string
  faturaTarihi: string
  onFaturaNoChange: (val: string) => void
  onFaturaTarihiChange: (val: string) => void
  formatCurrency: (val: number | null) => string
}

export function KabulFaturaHakedisCard({
  firmaStats,
  faturaNo,
  faturaTarihi,
  onFaturaNoChange,
  onFaturaTarihiChange,
  formatCurrency
}: KabulFaturaHakedisCardProps) {
  const teklifToplami = firmaStats.teklifToplami || 0
  const kdvTutari = teklifToplami * 0.2
  const brutTutar = teklifToplami * 1.2
  const damgaVergisi = teklifToplami * 0.00948
  const netOdenecek = brutTutar - damgaVergisi

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4">
        <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md border border-blue-200 dark:border-blue-800">
          Önizleme
        </span>
      </div>

      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-6">
        <Calculator className="w-4 h-4 text-slate-500" />
        Fatura &amp; Hakediş (Geliştirme Aşamasında)
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
            Fatura Numarası
          </label>
          <input
            type="text"
            placeholder="Örn: ABC2026000000123"
            value={faturaNo}
            onChange={(e) => onFaturaNoChange(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
            Fatura Tarihi
          </label>
          <input
            type="date"
            value={faturaTarihi}
            onChange={(e) => onFaturaTarihiChange(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 border border-slate-100 dark:border-slate-700/50 mb-6">
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-600 dark:text-slate-400 font-medium">
              Hakediş Tutarı (KDV Hariç)
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {formatCurrency(firmaStats.teklifToplami)}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-600 dark:text-slate-400 font-medium">
              KDV (%20)
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {formatCurrency(kdvTutari)}
            </span>
          </div>
          <div className="h-px w-full bg-slate-200 dark:bg-slate-700"></div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-700 dark:text-slate-300 font-bold">
              Brüt Tutar
            </span>
            <span className="font-black text-slate-900 dark:text-white">
              {formatCurrency(brutTutar)}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm text-red-600 dark:text-red-400 mt-2">
            <span className="font-medium flex items-center gap-1">
              <TrendingDown className="w-3 h-3" />
              Kesintiler (Damga Vergisi vb.)
            </span>
            <span className="font-bold">
              - {formatCurrency(damgaVergisi)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 rounded-xl">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-0.5">
            Net Ödenecek Tutar
          </span>
          <span className="text-2xl font-black text-blue-900 dark:text-blue-300">
            {formatCurrency(netOdenecek)}
          </span>
        </div>
        <button
          disabled={!faturaNo || !faturaTarihi}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg ${
            !faturaNo || !faturaTarihi
              ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed opacity-70'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 cursor-pointer'
          }`}
        >
          ÖEB Oluştur
        </button>
      </div>
    </div>
  )
}

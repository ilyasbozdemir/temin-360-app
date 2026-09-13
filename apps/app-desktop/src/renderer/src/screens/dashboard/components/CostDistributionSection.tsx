import React from 'react'
import { PieChart } from 'lucide-react'

interface CostDistributionSectionProps {
  stats: any
  totalCat: number
  malPct: number
  hizmetPct: number
  yapimPct: number
  danismanlikPct: number
  formatCurrency: (value: number) => string
}

export const CostDistributionSection: React.FC<CostDistributionSectionProps> = ({
  stats,
  totalCat,
  malPct,
  hizmetPct,
  yapimPct,
  danismanlikPct,
  formatCurrency
}) => {
  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <PieChart className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Alım Türlerine Göre Maliyet Dağılımı
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            4734 Sayılı Kanun kapsamındaki Mal, Hizmet ve Yapım harcamaları
          </p>
        </div>
        <span className="text-xs font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700 font-mono">
          {formatCurrency(totalCat)}
        </span>
      </div>

      {/* Segmented Progress Bar */}
      <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex gap-0.5 mb-4 p-0.5">
        <div
          style={{ width: `${malPct}%` }}
          className="h-full bg-blue-500 rounded-l-full transition-all duration-500"
          title={`Mal Alımı: %${malPct}`}
        />
        <div
          style={{ width: `${hizmetPct}%` }}
          className="h-full bg-indigo-500 transition-all duration-500"
          title={`Hizmet Alımı: %${hizmetPct}`}
        />
        <div
          style={{ width: `${yapimPct}%` }}
          className="h-full bg-amber-500 transition-all duration-500"
          title={`Yapım İşi: %${yapimPct}`}
        />
        <div
          style={{ width: `${danismanlikPct}%` }}
          className="h-full bg-purple-500 rounded-r-full transition-all duration-500"
          title={`Danışmanlık: %${danismanlikPct}`}
        />
      </div>

      {/* Dağılım İstatistik Kutuları */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50">
          <div className="flex items-center justify-between text-xs text-blue-700 dark:text-blue-400 font-bold mb-1">
            <span>Mal Alımı</span>
            <span>%{malPct}</span>
          </div>
          <div className="text-sm font-black text-slate-900 dark:text-white font-mono">
            {formatCurrency(stats.malYaklasikMaliyet)}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50">
          <div className="flex items-center justify-between text-xs text-indigo-700 dark:text-indigo-400 font-bold mb-1">
            <span>Hizmet Alımı</span>
            <span>%{hizmetPct}</span>
          </div>
          <div className="text-sm font-black text-slate-900 dark:text-white font-mono">
            {formatCurrency(stats.hizmetYaklasikMaliyet)}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50">
          <div className="flex items-center justify-between text-xs text-amber-700 dark:text-amber-400 font-bold mb-1">
            <span>Yapım İşi</span>
            <span>%{yapimPct}</span>
          </div>
          <div className="text-sm font-black text-slate-900 dark:text-white font-mono">
            {formatCurrency(stats.yapimYaklasikMaliyet)}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50">
          <div className="flex items-center justify-between text-xs text-purple-700 dark:text-purple-400 font-bold mb-1">
            <span>Danışmanlık</span>
            <span>%{danismanlikPct}</span>
          </div>
          <div className="text-sm font-black text-slate-900 dark:text-white font-mono">
            {formatCurrency(stats.danismanlikYaklasikMaliyet)}
          </div>
        </div>
      </div>
    </div>
  )
}

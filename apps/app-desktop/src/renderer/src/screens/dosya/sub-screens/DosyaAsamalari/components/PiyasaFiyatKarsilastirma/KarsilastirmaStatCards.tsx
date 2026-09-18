import React from "react";
import { CheckCircle2, DollarSign, Percent, TrendingDown, TrendingUp } from "lucide-react";

interface KarsilastirmaStatCardsProps {
  totalBefore: number;
  totalAfter: number;
  netSavings: number;
  overallSavingsRate: number;
  formatCurrency: (val: number) => string;
}

export function KarsilastirmaStatCards({
  totalBefore,
  totalAfter,
  netSavings,
  overallSavingsRate,
  formatCurrency,
}: KarsilastirmaStatCardsProps): React.JSX.Element {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* ÖNCESİ (YAKLAŞIK MALİYET) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4.5 shadow-sm">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider">
            1. İşlem Öncesi (Yaklaşık Maliyet)
          </span>
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <DollarSign size={16} />
          </div>
        </div>
        <div className="text-xl font-black text-slate-800 dark:text-slate-100">
          {formatCurrency(totalBefore)}
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Öngörülen bütçe / ortalama tavan maliyet</p>
      </div>

      {/* SONRASI (GERÇEKLEŞEN / KAZANAN) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4.5 shadow-sm">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider">
            2. İşlem Sonrası (Nihai Teklif)
          </span>
          <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
            <CheckCircle2 size={16} />
          </div>
        </div>
        <div className="text-xl font-black text-slate-800 dark:text-slate-100">
          {formatCurrency(totalAfter)}
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Nihai teklifler sonucu oluşan toplam bedel</p>
      </div>

      {/* NET TASARRUF / FARK */}
      <div
        className={`border rounded-2xl p-4.5 shadow-sm ${
          netSavings >= 0
            ? 'bg-emerald-50/70 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200'
            : 'bg-rose-50/70 border-rose-200 dark:bg-rose-950/30 dark:border-rose-800/60 text-rose-900 dark:text-rose-200'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider">
            {netSavings >= 0 ? 'Net Kamu Tasarrufu' : 'Maliyet Artışı'}
          </span>
          <div
            className={`p-2 rounded-xl ${
              netSavings >= 0
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300'
                : 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300'
            }`}
          >
            {netSavings >= 0 ? <TrendingDown size={16} /> : <TrendingUp size={16} />}
          </div>
        </div>
        <div className="text-xl font-black">{formatCurrency(Math.abs(netSavings))}</div>
        <p className="text-[11px] opacity-80 mt-1">
          {netSavings >= 0 ? 'Yaklaşık maliyetin altında tamamlandı' : 'Bütçe artışı gerçekleşti'}
        </p>
      </div>

      {/* TASARRUF ORANI */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4.5 shadow-sm">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider">Tasarruf Oranı</span>
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Percent size={16} />
          </div>
        </div>
        <div
          className={`text-xl font-black ${
            overallSavingsRate >= 0
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-rose-600 dark:text-rose-400'
          }`}
        >
          %{overallSavingsRate.toFixed(2)}
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Öncesi ve sonrası yüzdesel değişim</p>
      </div>
    </div>
  );
}

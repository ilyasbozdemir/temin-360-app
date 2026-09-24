import React from 'react'
import { BarChart3, Building2, FileSpreadsheet } from 'lucide-react'
import { ComparisonRow, KarsilastirmaTableProps } from './types'

export function KarsilastirmaTable({
  comparisonData,
  totalBefore,
  totalAfter,
  netSavings,
  overallSavingsRate,
  formatCurrency,
  onExportComparison
}: KarsilastirmaTableProps): React.JSX.Element {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
      {/* TABLE HEADER BAR */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/50">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <BarChart3 size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Kademeli Fiyat Analiz Matrisi (Öncesi vs Sonrası)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Kalem bazında yaklaşık maliyet tahmini ile kesinleşen tekliflerin karşılaştırması
            </p>
          </div>
        </div>

        {onExportComparison && (
          <button
            onClick={onExportComparison}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all border border-slate-300/60 dark:border-slate-700"
          >
            <FileSpreadsheet size={14} className="text-emerald-600" />
            Excel Raporu
          </button>
        )}
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-bold">
              <th className="py-3 px-3.5 w-12 text-center">#</th>
              <th className="py-3 px-3.5">Malzeme / Kalem Adı</th>
              <th className="py-3 px-3.5 text-center">Miktar</th>
              <th className="py-3 px-3.5 text-right bg-blue-50/40 dark:bg-blue-950/20">
                Öncesi (Birim)
              </th>
              <th className="py-3 px-3.5 text-right bg-blue-50/40 dark:bg-blue-950/20">
                Öncesi (Toplam)
              </th>
              <th className="py-3 px-3.5 text-right bg-purple-50/40 dark:bg-purple-950/20">
                Sonrası (Birim)
              </th>
              <th className="py-3 px-3.5 text-right bg-purple-50/40 dark:bg-purple-950/20">
                Sonrası (Toplam)
              </th>
              <th className="py-3 px-3.5 text-right">Fark (TL)</th>
              <th className="py-3 px-3.5 text-center">Değişim (%)</th>
              <th className="py-3 px-3.5">Kazanan İstekli</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {comparisonData.map((row, idx) => (
              <tr
                key={row.id}
                className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
              >
                <td className="py-2.5 px-3.5 text-center text-slate-400 font-mono">{idx + 1}</td>
                <td className="py-2.5 px-3.5 font-bold text-slate-800 dark:text-slate-200">
                  {row.kalemAdi}
                </td>
                <td className="py-2.5 px-3.5 text-center text-slate-600 dark:text-slate-400 font-medium">
                  {row.miktar} {row.birim}
                </td>
                <td className="py-2.5 px-3.5 text-right font-mono text-slate-700 dark:text-slate-300 bg-blue-50/20 dark:bg-blue-950/10">
                  {formatCurrency(row.beforeUnitPrice)}
                </td>
                <td className="py-2.5 px-3.5 text-right font-mono font-semibold text-slate-800 dark:text-slate-200 bg-blue-50/20 dark:bg-blue-950/10">
                  {formatCurrency(row.beforeTotal)}
                </td>
                <td className="py-2.5 px-3.5 text-right font-mono text-slate-700 dark:text-slate-300 bg-purple-50/20 dark:bg-purple-950/10">
                  {formatCurrency(row.afterUnitPrice)}
                </td>
                <td className="py-2.5 px-3.5 text-right font-mono font-semibold text-slate-800 dark:text-slate-200 bg-purple-50/20 dark:bg-purple-950/10">
                  {formatCurrency(row.afterTotal)}
                </td>
                <td
                  className={`py-2.5 px-3.5 text-right font-mono font-bold ${
                    row.diffTotal >= 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {row.diffTotal >= 0 ? '-' : '+'}
                  {formatCurrency(Math.abs(row.diffTotal))}
                </td>
                <td className="py-2.5 px-3.5 text-center font-mono">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      row.percentage >= 0
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    {row.percentage >= 0 ? '-%' : '+%'}
                    {Math.abs(row.percentage).toFixed(1)}
                  </span>
                </td>
                <td className="py-2.5 px-3.5 text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <Building2 size={13} className="text-slate-400 shrink-0" />
                  <span className="truncate max-w-[160px] font-medium" title={row.winnerFirmName}>
                    {row.winnerFirmName}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-300 dark:border-slate-700 bg-slate-100/90 dark:bg-slate-950/90 font-black text-slate-900 dark:text-white">
              <td colSpan={4} className="py-3 px-3.5 text-right uppercase tracking-wider">
                TOPLAM TUTARLAR:
              </td>
              <td className="py-3 px-3.5 text-right font-mono text-blue-600 dark:text-blue-400">
                {formatCurrency(totalBefore)}
              </td>
              <td className="py-3 px-3.5 text-right"></td>
              <td className="py-3 px-3.5 text-right font-mono text-purple-600 dark:text-purple-400">
                {formatCurrency(totalAfter)}
              </td>
              <td
                className={`py-3 px-3.5 text-right font-mono ${
                  netSavings >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {netSavings >= 0 ? '-' : '+'}
                {formatCurrency(Math.abs(netSavings))}
              </td>
              <td className="py-3 px-3.5 text-center font-mono text-emerald-600 dark:text-emerald-400">
                %{overallSavingsRate.toFixed(2)}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

import React, { useMemo } from 'react'
import {
  TrendingDown,
  TrendingUp,
  DollarSign,
  Percent,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Building2
} from 'lucide-react'

export interface PiyasaFiyatKarsilastirmaTabProps {
  items: Array<{
    id: number
    kalem_adi: string
    miktar: number
    birim: string
  }>
  invitedFirms: Array<{
    id: number
    firma_id: number
    unvan: string
    temin_firma_id?: number
  }>
  beforeBids?: Record<string, number> // Öncesi / Yaklaşık maliyet birim fiyatları (kalemId_firmaId veya sadece kalemId)
  afterBids?: Record<string, number> // Sonrası / Nihai teklif birim fiyatları
  getLowestBidInfo: (itemId: number) => {
    lowestPrice: number
    winnerFirmName: string
    winnerFirmaId: number | null
  }
  getAverageBid: (itemId: number) => number
  onExportComparison?: () => void
}

export function PiyasaFiyatKarsilastirmaTab({
  items,
  invitedFirms,
  beforeBids = {},
  afterBids = {},
  getLowestBidInfo,
  getAverageBid,
  onExportComparison
}: PiyasaFiyatKarsilastirmaTabProps): React.JSX.Element {
  // Compute comparison rows
  const comparisonData = useMemo(() => {
    return items.map((item) => {
      // 1. Calculate Before Price (Yaklaşık Maliyet ortalaması veya girilmiş ön fiyat)
      let beforeUnitPrice = 0
      const firmPricesBefore: number[] = []

      invitedFirms.forEach((f) => {
        const firmKey = f.temin_firma_id || f.id
        const key = `${item.id}_${firmKey}`
        if (beforeBids[key] && beforeBids[key] > 0) {
          firmPricesBefore.push(beforeBids[key])
        }
      })

      if (firmPricesBefore.length > 0) {
        beforeUnitPrice =
          firmPricesBefore.reduce((a, b) => a + b, 0) / firmPricesBefore.length
      } else {
        // Fallback: If no dedicated before bid, use average bid from all data or 0
        beforeUnitPrice = getAverageBid(item.id) || 0
      }

      const beforeTotal = beforeUnitPrice * item.miktar

      // 2. Calculate After Price (En düşük / kesinleşen teklif)
      const lowestInfo = getLowestBidInfo(item.id)
      const afterUnitPrice = lowestInfo.lowestPrice || 0
      const afterTotal = afterUnitPrice * item.miktar

      // 3. Difference and Percentage
      const diffTotal = beforeTotal - afterTotal
      const diffUnitPrice = beforeUnitPrice - afterUnitPrice
      const percentage =
        beforeTotal > 0 ? ((beforeTotal - afterTotal) / beforeTotal) * 100 : 0

      return {
        id: item.id,
        kalemAdi: item.kalem_adi,
        miktar: item.miktar,
        birim: item.birim,
        beforeUnitPrice,
        beforeTotal,
        afterUnitPrice,
        afterTotal,
        diffUnitPrice,
        diffTotal,
        percentage,
        winnerFirmName: lowestInfo.winnerFirmName || 'Teklif Yok',
        isSaving: diffTotal >= 0
      }
    })
  }, [items, invitedFirms, beforeBids, afterBids, getLowestBidInfo, getAverageBid])

  // Summary Totals
  const totalBefore = useMemo(
    () => comparisonData.reduce((sum, row) => sum + row.beforeTotal, 0),
    [comparisonData]
  )
  const totalAfter = useMemo(
    () => comparisonData.reduce((sum, row) => sum + row.afterTotal, 0),
    [comparisonData]
  )
  const netSavings = totalBefore - totalAfter
  const overallSavingsRate = totalBefore > 0 ? (netSavings / totalBefore) * 100 : 0

  const formatCurrency = (val: number): string => {
    return val.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₺'
  }

  if (items.length === 0) {
    return (
      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-6 text-center text-amber-800 dark:text-amber-300">
        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-amber-500" />
        <h4 className="font-bold text-sm">Karşılaştırma Yapılacak Kalem Bulunamadı</h4>
        <p className="text-xs mt-1 text-amber-600 dark:text-amber-400">
          Öncesi-Sonrası karşılaştırma tablosunu görüntülemek için önce ihtiyaç listesini ve teklifleri giriniz.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 4 SUMMARY STAT CARDS */}
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

      {/* COMPARISON MATRIX TABLE */}
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
    </div>
  )
}

import React, { useMemo } from 'react'
import { AlertCircle } from 'lucide-react'
import {
  PiyasaFiyatKarsilastirmaTabProps,
  KarsilastirmaStatCards,
  KarsilastirmaTable
} from './PiyasaFiyatKarsilastirma'

export type { PiyasaFiyatKarsilastirmaTabProps }

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
        beforeUnitPrice = getAverageBid(item.id) || 0
      }

      const beforeTotal = beforeUnitPrice * item.miktar

      const lowestInfo = getLowestBidInfo(item.id)
      const afterUnitPrice = lowestInfo.lowestPrice || 0
      const afterTotal = afterUnitPrice * item.miktar

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
      <KarsilastirmaStatCards
        totalBefore={totalBefore}
        totalAfter={totalAfter}
        netSavings={netSavings}
        overallSavingsRate={overallSavingsRate}
        formatCurrency={formatCurrency}
      />

      <KarsilastirmaTable
        comparisonData={comparisonData}
        totalBefore={totalBefore}
        totalAfter={totalAfter}
        netSavings={netSavings}
        overallSavingsRate={overallSavingsRate}
        formatCurrency={formatCurrency}
        onExportComparison={onExportComparison}
      />
    </div>
  )
}

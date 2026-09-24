import React from 'react'
import { AlertCircle, Building2, Check, ClipboardList, Plus, Settings, Trophy } from 'lucide-react'
import { cn } from '../../../../../utils/cn'

interface PricesSummaryDashboardProps {
  invitedFirms: any[]
  items: any[]
  bids: Record<string, number>
  onManageFirmsClick?: () => void
  manualWinnerFirmaId?: number | null
  handleSetWinnerFirma?: (firmaMasterId: number | null) => Promise<void>
}

export function PricesSummaryDashboard({
  invitedFirms,
  items,
  bids,
  onManageFirmsClick,
  manualWinnerFirmaId,
  handleSetWinnerFirma
}: PricesSummaryDashboardProps): React.JSX.Element {
  if (invitedFirms.length === 0) {
    return (
      <div className="py-10 text-center flex flex-col items-center justify-center gap-3">
        <AlertCircle className="w-9 h-9 text-slate-350 dark:text-slate-655" />
        <div className="text-slate-700 dark:text-slate-300 text-sm font-bold">
          Teklif bilgisi bulunamadı.
        </div>
        <p className="text-xs text-slate-450 dark:text-slate-500 max-w-md">
          Fiyat tekliflerini görmek için lütfen &quot;Yeni Tutanak Ekle / Teklif Girişi&quot;
          butonuna tıklayarak firmaları davet edin ve teklifleri girin.
        </p>
        {onManageFirmsClick && (
          <button
            type="button"
            onClick={onManageFirmsClick}
            className="mt-2 flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl transition-all cursor-pointer border-0"
          >
            <Plus className="w-4 h-4" />
            İstekli Firmaları Yönet
          </button>
        )}
      </div>
    )
  }

  // Calculate totals
  const firmTotals = invitedFirms.map((firm: any) => {
    let total = 0
    items.forEach((item: any) => {
      const key = `${item.id}_${firm.id}`
      const bidVal = bids[key]
      if (bidVal && bidVal > 0) {
        total += bidVal * (item.miktar || 0)
      }
    })
    return { firm, total }
  })

  const nonZeroTotals = firmTotals.filter((t) => t.total > 0)
  const lowestTotal = nonZeroTotals.length > 0 ? Math.min(...nonZeroTotals.map((t) => t.total)) : 0

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Firm totals summary card grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {firmTotals.map(({ firm, total }) => {
          const isLowest = total > 0 && total === lowestTotal
          const isSelectedWinner = manualWinnerFirmaId
            ? manualWinnerFirmaId === firm.firma_id || manualWinnerFirmaId === firm.id
            : isLowest

          return (
            <div
              key={firm.id}
              className={cn(
                'p-5 rounded-2xl border transition-all flex flex-col justify-between relative overflow-hidden',
                isSelectedWinner
                  ? 'bg-amber-50/40 dark:bg-amber-955/10 border-amber-300 dark:border-amber-700 shadow-sm ring-1 ring-amber-400/40'
                  : isLowest
                    ? 'bg-emerald-50/30 dark:bg-emerald-955/10 border-emerald-300 dark:border-emerald-800'
                    : 'bg-slate-50/50 dark:bg-slate-900/10 border-slate-200/60 dark:border-slate-800/80'
              )}
            >
              {isSelectedWinner && (
                <div className="absolute -right-6 -top-6 w-16 h-16 bg-amber-500/15 rounded-full flex items-center justify-center rotate-45">
                  <Trophy className="w-4 h-4 text-amber-600 dark:text-amber-450 mt-8" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Building2
                    className={cn(
                      'w-4 h-4 shrink-0',
                      isSelectedWinner
                        ? 'text-amber-500'
                        : isLowest
                          ? 'text-emerald-500'
                          : 'text-slate-400'
                    )}
                  />
                  <span
                    className="font-extrabold text-xs text-slate-800 dark:text-slate-250 truncate block max-w-[180px]"
                    title={firm.unvan}
                  >
                    {firm.unvan}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {isSelectedWinner && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-black bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-md border border-amber-500/25">
                      <Trophy className="w-2.5 h-2.5 text-amber-600" />
                      Kazanan Firma
                    </span>
                  )}
                  {isLowest && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-black bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-450 px-2 py-0.5 rounded-md border border-emerald-500/15">
                      <Check className="w-2.5 h-2.5 text-emerald-600" />
                      En Düşük Teklif
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">Toplam Teklif</span>
                  <span
                    className={cn(
                      'text-base font-extrabold font-mono',
                      total > 0
                        ? isSelectedWinner
                          ? 'text-amber-600 dark:text-amber-400'
                          : isLowest
                            ? 'text-emerald-650 dark:text-emerald-455'
                            : 'text-slate-800 dark:text-slate-200'
                        : 'text-slate-400 italic text-xs font-semibold'
                    )}
                  >
                    {total > 0
                      ? `${total.toLocaleString('tr-TR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })} TL`
                      : 'Fiyat girilmedi'}
                  </span>
                </div>

                {handleSetWinnerFirma && (
                  <button
                    type="button"
                    onClick={() => {
                      if (isSelectedWinner) {
                        handleSetWinnerFirma(null)
                      } else {
                        handleSetWinnerFirma(firm.firma_id || firm.id)
                      }
                    }}
                    className={cn(
                      'px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer border-0 shrink-0 inline-flex items-center gap-1',
                      isSelectedWinner
                        ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xs'
                        : 'bg-slate-100 hover:bg-amber-100 dark:bg-slate-800 dark:hover:bg-amber-950/40 text-slate-700 dark:text-slate-300 hover:text-amber-800 dark:hover:text-amber-300'
                    )}
                    title={isSelectedWinner ? 'Kazanan seçimini kaldır' : 'Bu firmayı kazanan yap'}
                  >
                    <Trophy className="w-3 h-3" />
                    {isSelectedWinner ? 'Seçili' : 'Kazanan Yap'}
                  </button>
                )}
              </div>
            </div>
          )
        })}

        {onManageFirmsClick && (
          <div
            onClick={onManageFirmsClick}
            className="p-5 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-800/80 bg-slate-50/20 hover:bg-slate-50/40 dark:bg-slate-900/5 dark:hover:bg-slate-900/20 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer group min-h-[140px]"
          >
            <div className="p-2.5 bg-blue-50 dark:bg-blue-955/30 text-blue-600 dark:text-blue-400 rounded-full group-hover:scale-110 transition-transform duration-300">
              <Settings className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              İstekli Firmaları Yönet
            </span>
          </div>
        )}
      </div>

      {/* Needs comparison breakdown */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-blue-500" />
          Kalem Bazlı Fiyat Karşılaştırması
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-455 font-extrabold">
                <th className="py-2.5 px-3">İhtiyaç Kalemi</th>
                <th className="py-2.5 px-3 text-center">Miktar</th>
                {invitedFirms.map((firm: any) => (
                  <th
                    key={firm.id}
                    className="py-2.5 px-3 text-right max-w-[150px] truncate"
                    title={firm.unvan}
                  >
                    {firm.unvan}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item: any) => {
                // Find lowest bid for this item
                const itemBids = invitedFirms
                  .map((f: any) => {
                    const key = `${item.id}_${f.id}`
                    return {
                      firmId: f.id,
                      price: bids[key] || 0
                    }
                  })
                  .filter((b) => b.price > 0)

                const minItemPrice =
                  itemBids.length > 0 ? Math.min(...itemBids.map((b) => b.price)) : 0

                return (
                  <tr
                    key={item.id}
                    className="border-b border-slate-50 dark:border-slate-900/60 hover:bg-slate-50/30 dark:hover:bg-slate-950/20 transition-colors"
                  >
                    <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-250">
                      {item.kalem_adi}
                    </td>
                    <td className="py-3 px-3 text-center text-slate-500 font-semibold">
                      {item.miktar} {item.birim}
                    </td>
                    {invitedFirms.map((firm: any) => {
                      const key = `${item.id}_${firm.id}`
                      const bidVal = bids[key] || 0
                      const isItemWinner = bidVal > 0 && bidVal === minItemPrice

                      return (
                        <td key={firm.id} className="py-3 px-3 text-right font-mono font-bold">
                          {bidVal > 0 ? (
                            <span
                              className={
                                isItemWinner
                                  ? 'text-emerald-600 dark:text-emerald-450 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-lg border border-emerald-500/10'
                                  : 'text-slate-700 dark:text-slate-300'
                              }
                            >
                              {bidVal.toLocaleString('tr-TR', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })}{' '}
                              TL
                            </span>
                          ) : (
                            <span className="text-slate-350 italic text-[11px] font-semibold">
                              -
                            </span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

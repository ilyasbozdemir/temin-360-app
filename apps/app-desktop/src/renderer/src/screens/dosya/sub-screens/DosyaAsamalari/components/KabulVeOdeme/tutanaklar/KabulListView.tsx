import React from 'react'
import {
  Calendar,
  Edit2,
  FileText,
  MapPin,
  MessageSquareText,
  Receipt,
  Trash2,
  Truck
} from 'lucide-react'
import { Button } from '../../../../../../../components/ui/Button'
import { KabulTutanakItem } from '../types'
import { KabulDurumBadge } from './KabulDurumBadge'

interface KabulListViewProps {
  tutanaklar: KabulTutanakItem[]
  filteredTutanaklar: KabulTutanakItem[]
  effectiveFirma: string
  effectiveTeklifTutar: number
  effectiveTeslimAlan: string
  effectiveTeslimYeri: string
  faturaNo?: string
  faturaTarihi?: string
  irsaliyeNo?: string
  irsaliyeTarihi?: string
  dosyaNo?: string
  primarySablonKey: string
  formatDate: (dateStr: string | null) => string
  formatCurrency: (val: number | null) => string
  onOpenPreview?: (sablonKey: string, tutanak?: KabulTutanakItem) => void
  onEditTutanak?: (tutanak: KabulTutanakItem) => void
  onDeleteTutanak?: (id: string) => void
}

export function KabulListView({
  tutanaklar,
  filteredTutanaklar,
  effectiveFirma,
  effectiveTeklifTutar,
  effectiveTeslimAlan,
  effectiveTeslimYeri,
  faturaNo = '',
  faturaTarihi = '',
  irsaliyeNo = '',
  irsaliyeTarihi = '',
  dosyaNo = '',
  primarySablonKey,
  formatDate,
  formatCurrency,
  onOpenPreview,
  onEditTutanak,
  onDeleteTutanak
}: KabulListViewProps): React.JSX.Element {
  const items =
    filteredTutanaklar.length > 0
      ? filteredTutanaklar
      : tutanaklar.length === 0
        ? [
            {
              id: 'default_1',
              tutanakNo: 'KT-2026-001',
              tutanakTarihi: faturaTarihi || new Date().toISOString().slice(0, 10),
              faturaNo: faturaNo || dosyaNo || '1',
              faturaTarihi,
              irsaliyeNo,
              irsaliyeTarihi,
              durum: 'kabul' as const,
              tutar: effectiveTeklifTutar,
              teslimYeri: effectiveTeslimYeri,
              teslimAlan: effectiveTeslimAlan
            }
          ]
        : []

  return (
    <div className="p-4 space-y-2.5">
      {items.map((tut) => {
        const rowFaturaNo = tut.faturaNo || faturaNo
        const rowFaturaTarihi = tut.faturaTarihi || faturaTarihi
        const rowIrsaliyeNo = tut.irsaliyeNo || irsaliyeNo
        const rowIrsaliyeTarihi = tut.irsaliyeTarihi || irsaliyeTarihi

        return (
          <div
            key={tut.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-200 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-all"
          >
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/60 font-mono font-bold text-xs mt-0.5">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400">
                    {tut.tutanakNo}
                  </span>
                  <KabulDurumBadge durum={tut.durum} onaylandi={tut.onaylandi} />
                </div>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate mt-1">
                  {effectiveFirma} &bull; {tut.teslimYeri || effectiveTeslimYeri}
                </div>

                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-3 flex-wrap mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {formatDate(tut.tutanakTarihi)}
                  </span>

                  {rowFaturaNo && (
                    <span className="flex items-center gap-1 font-mono text-slate-700 dark:text-slate-300">
                      <Receipt className="w-3 h-3 text-emerald-600" />
                      Fat: {rowFaturaNo}
                    </span>
                  )}

                  {rowIrsaliyeNo && (
                    <span className="flex items-center gap-1 font-mono text-blue-700 dark:text-blue-300 font-semibold">
                      <Truck className="w-3 h-3 text-blue-600" />
                      İrs: {rowIrsaliyeNo}
                    </span>
                  )}
                </div>

                {tut.notlar && (
                  <div className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-300 mt-1.5 bg-slate-50 dark:bg-slate-800/80 px-2 py-0.5 rounded border border-slate-200/60 dark:border-slate-700/60">
                    <MessageSquareText className="w-3 h-3 text-indigo-500 shrink-0" />
                    <span>{tut.notlar}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {tut.tutar ? formatCurrency(tut.tutar) : formatCurrency(effectiveTeklifTutar)}
                </div>
                <div className="text-[10px] text-slate-400">Teslimat Tutarı</div>
              </div>
              <Button
                onClick={() => onOpenPreview?.(primarySablonKey, tut)}
                variant="outline"
                size="sm"
                className="h-8 px-2.5 text-xs font-semibold gap-1 text-blue-600 border-blue-200 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Tutanağı Aç</span>
              </Button>
              {tut.id !== 'default_1' && onEditTutanak && (
                <button
                  type="button"
                  onClick={() => onEditTutanak(tut)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Tutanağı Düzenle"
                >
                  <Edit2 size={14} />
                </button>
              )}
              {tut.id !== 'default_1' && onDeleteTutanak && (
                <button
                  type="button"
                  onClick={() => {
                    if (
                      window.confirm(
                        `"${tut.tutanakNo}" numaralı tutanağı silmek istediğinizden emin misiniz?`
                      )
                    ) {
                      onDeleteTutanak(tut.id)
                    }
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                  title="Tutanağı Sil"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

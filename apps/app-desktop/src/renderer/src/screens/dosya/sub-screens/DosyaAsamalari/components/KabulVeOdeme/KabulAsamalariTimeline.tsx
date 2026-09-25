import React from 'react'
import { CheckCircle2, Clock, CreditCard, FileText, PackageCheck } from 'lucide-react'
import { Button } from '../../../../../../components/ui/Button'
import { FirmaStats } from './types'

interface KabulAsamalariTimelineProps {
  firmaStats: FirmaStats
  faturaNo: string
  faturaTarihi: string
  onOpenTifModal: () => void
}

export function KabulAsamalariTimeline({
  firmaStats,
  faturaNo,
  faturaTarihi,
  onOpenTifModal
}: KabulAsamalariTimelineProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
      <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
        <Clock className="w-4 h-4 text-slate-400" />
        Muayene &amp; Kabul &amp; Ödeme Aşamaları
      </h4>

      <div className="flex flex-col gap-4 relative">
        <div className="absolute left-3 top-2 bottom-2 w-px bg-slate-200 dark:bg-slate-700/50 -z-10"></div>

        {/* 1. Mal/Hizmet Teslimi */}
        <div className="flex gap-3">
          {firmaStats.teslimTarihi ? (
            <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center shrink-0 mt-0.5 shadow-[0_0_0_3px_rgba(59,130,246,0.1)]">
              <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
            </div>
          )}
          <div>
            <h5
              className={`text-xs font-bold ${
                firmaStats.teslimTarihi
                  ? 'text-slate-800 dark:text-slate-200'
                  : 'text-blue-700 dark:text-blue-400'
              }`}
            >
              1. Mal/Hizmet Teslimi
            </h5>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {firmaStats.teslimTarihi
                ? `Teslim Edildi (${new Date(firmaStats.teslimTarihi).toLocaleDateString('tr-TR')})`
                : 'Tedarikçi teslimatı bekleniyor.'}
            </p>
          </div>
        </div>

        {/* 2. Muayene & Kabul İşlemi */}
        <div className="flex gap-3">
          {!firmaStats.teslimTarihi ? (
            <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
              <Clock className="w-3.5 h-3.5" />
            </div>
          ) : faturaNo ? (
            <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center shrink-0 mt-0.5 shadow-[0_0_0_3px_rgba(59,130,246,0.1)]">
              <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
            </div>
          )}
          <div>
            <h5
              className={`text-xs font-bold ${
                !firmaStats.teslimTarihi
                  ? 'text-slate-500 dark:text-slate-400'
                  : faturaNo
                  ? 'text-slate-800 dark:text-slate-200'
                  : 'text-blue-700 dark:text-blue-400'
              }`}
            >
              2. Muayene &amp; Kabul İşlemi
            </h5>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {!firmaStats.teslimTarihi
                ? 'Kabul işlemleri beklemede.'
                : faturaNo
                ? 'Kabul Edildi (Komisyon Onaylı)'
                : 'Komisyon tarafından ürünler inceleniyor.'}
            </p>
          </div>
        </div>

        {/* 3. TİF & Fatura Kaydı */}
        <div className="flex gap-3">
          {!faturaNo ? (
            <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
              <FileText className="w-3.5 h-3.5" />
            </div>
          ) : faturaTarihi ? (
            <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center shrink-0 mt-0.5 shadow-[0_0_0_3px_rgba(59,130,246,0.1)]">
              <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2">
              <h5
                className={`text-xs font-bold ${
                  !faturaNo
                    ? 'text-slate-500 dark:text-slate-400'
                    : faturaTarihi
                    ? 'text-slate-800 dark:text-slate-200'
                    : 'text-blue-700 dark:text-blue-400'
                }`}
              >
                3. TİF &amp; Fatura Kaydı
              </h5>
              <Button
                size="sm"
                variant="outline"
                onClick={onOpenTifModal}
                className="h-6 text-[10px] px-2 gap-1 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 bg-emerald-50/60 dark:bg-emerald-950/30"
              >
                <PackageCheck className="w-3 h-3" /> TİF Aktar
              </Button>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {!faturaNo
                ? 'Kabul sonrası fatura ve taşınır işlemi.'
                : `Fatura No: ${faturaNo}`}
            </p>
          </div>
        </div>

        {/* 4. Ödeme Emri Belgesi (ÖEB) */}
        <div className="flex gap-3">
          {!faturaTarihi ? (
            <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
              <CreditCard className="w-3.5 h-3.5" />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center shrink-0 mt-0.5 shadow-[0_0_0_3px_rgba(59,130,246,0.1)]">
              <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
            </div>
          )}
          <div>
            <h5
              className={`text-xs font-bold ${
                !faturaTarihi
                  ? 'text-slate-500 dark:text-slate-400'
                  : 'text-blue-700 dark:text-blue-400'
              }`}
            >
              4. Ödeme Emri Belgesi (ÖEB)
            </h5>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {!faturaTarihi
                ? 'Harcama birimi tarafından ödeme emri düzenlenmesi.'
                : 'ÖEB MYS sistemine gönderilmeye hazır.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

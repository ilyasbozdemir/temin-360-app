import React from 'react'
import {
  CheckCircle2,
  Clock,
  CreditCard,
  FileCheck,
  FileText,
  PackageCheck,
  ShoppingCart,
  Users
} from 'lucide-react'
import { Button } from '../../../../../../components/ui/Button'
import { FirmaStats } from './types'

interface KabulAsamalariTimelineProps {
  firmaStats: FirmaStats
  faturaNo: string
  faturaTarihi: string
  alimTuru?: string
  onOpenTifModal: () => void
  onOpenKomisyonModal?: () => void
  onOpenPreview?: (sablonKey: string) => void
}

export function KabulAsamalariTimeline({
  firmaStats,
  faturaNo,
  faturaTarihi,
  alimTuru = 'mal',
  onOpenTifModal,
  onOpenKomisyonModal,
  onOpenPreview
}: KabulAsamalariTimelineProps): React.JSX.Element {
  const isHizmet = alimTuru === 'hizmet'
  const primarySablonKey = isHizmet ? 'hizmet-isleri-kabul-tutanagi' : 'muayene-kabul-tutanagi'

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
      <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
        <Clock className="w-4 h-4 text-slate-400" />
        Muayene &amp; Kabul &amp; Ödeme Aşamaları
      </h4>

      <div className="flex flex-col gap-5 relative">
        <div className="absolute left-3 top-2 bottom-2 w-px bg-slate-200 dark:bg-slate-700/50 -z-10"></div>

        {/* 1. Mal/Hizmet Teslimi */}
        <div className="flex gap-3">
          {firmaStats?.teslimTarihi ? (
            <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center shrink-0 mt-0.5 shadow-[0_0_0_3px_rgba(59,130,246,0.1)]">
              <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h5
                className={`text-xs font-bold ${
                  firmaStats?.teslimTarihi
                    ? 'text-slate-800 dark:text-slate-200'
                    : 'text-blue-700 dark:text-blue-400'
                }`}
              >
                1. Mal/Hizmet Teslimi
              </h5>
              {onOpenPreview && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onOpenPreview('kabul-edilen-teklif')}
                  className="h-6 text-[10px] px-2 gap-1 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Sipariş / Kabul Mektubunu İncele"
                >
                  <ShoppingCart className="w-3 h-3 text-blue-500" /> Sipariş Yazısı
                </Button>
              )}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {firmaStats?.teslimTarihi
                ? `Teslim Edildi (${new Date(firmaStats.teslimTarihi).toLocaleDateString('tr-TR')})`
                : 'Tedarikçi teslimatı bekleniyor.'}
            </p>
          </div>
        </div>

        {/* 2. Muayene & Kabul İşlemi */}
        <div className="flex gap-3">
          {!firmaStats?.teslimTarihi ? (
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
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h5
                className={`text-xs font-bold ${
                  !firmaStats?.teslimTarihi
                    ? 'text-slate-500 dark:text-slate-400'
                    : faturaNo
                    ? 'text-slate-800 dark:text-slate-200'
                    : 'text-blue-700 dark:text-blue-400'
                }`}
              >
                2. Muayene &amp; Kabul İşlemi
              </h5>
              <div className="flex items-center gap-1.5 flex-wrap">
                {onOpenPreview && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onOpenPreview(primarySablonKey)}
                    className="h-6 text-[10px] px-2 gap-1 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60 bg-blue-50/50 dark:bg-blue-950/30 hover:bg-blue-100"
                    title="Kabul Tutanağını Görüntüle"
                  >
                    <FileCheck className="w-3 h-3 text-blue-600" /> Tutanağı Aç
                  </Button>
                )}
                {onOpenKomisyonModal && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onOpenKomisyonModal}
                    className="h-6 text-[10px] px-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                    title="Kabul Komisyonunu Belirle"
                  >
                    <Users className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {!firmaStats?.teslimTarihi
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
            <div className="flex items-center justify-between gap-2 flex-wrap">
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
              <div className="flex items-center gap-1.5 flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onOpenTifModal}
                  className="h-6 text-[10px] px-2 gap-1 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 bg-emerald-50/60 dark:bg-emerald-950/30 hover:bg-emerald-100"
                >
                  <PackageCheck className="w-3 h-3" /> TİF Aktar
                </Button>
                {onOpenPreview && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onOpenPreview('tasinir-islem-fisi')}
                    className="h-6 text-[10px] px-2 gap-1 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Taşınır İşlem Fişini Aç"
                  >
                    <FileText className="w-3 h-3 text-slate-500" /> Fiş
                  </Button>
                )}
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {!faturaNo
                ? 'Kabul sonrası fatura ve taşınır işlemi.'
                : `Fatura No: ${faturaNo}`}
            </p>
          </div>
        </div>

        {/* 4. Ödeme Emri Belgesi (ÖEB) & Ödeme Yazısı */}
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
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h5
                className={`text-xs font-bold ${
                  !faturaTarihi
                    ? 'text-slate-500 dark:text-slate-400'
                    : 'text-blue-700 dark:text-blue-400'
                }`}
              >
                4. Ödeme Yazısı &amp; ÖEB
              </h5>
              {onOpenPreview && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onOpenPreview('odeme-yazisi')}
                    className="h-6 text-[10px] px-2 gap-1 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 bg-emerald-50/60 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50"
                  >
                    <FileText className="w-3 h-3" /> Ödeme Yazısı
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onOpenPreview('odeme-emri-belgesi')}
                    className="h-6 text-[10px] px-2 gap-1 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700 bg-blue-50/60 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-900/50"
                  >
                    <CreditCard className="w-3 h-3" /> ÖEB
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onOpenPreview('hakedis-raporu')}
                    className="h-6 text-[10px] px-2 gap-1 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700 bg-amber-50/60 dark:bg-amber-950/30 hover:bg-amber-100"
                    title="Hakediş Raporunu Aç"
                  >
                    Hakediş
                  </Button>
                </div>
              )}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {!faturaTarihi
                ? 'Harcama birimi tarafından ödeme emri ve ödeme yazısı düzenlenmesi.'
                : 'Ödeme yazısı ve ÖEB MYS sistemine gönderilmeye hazır.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}


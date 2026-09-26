import React from 'react'
import { FileCheck, ReceiptText, Sparkles } from 'lucide-react'
import { FirmaStats } from './types'

interface Props {
  kazananFirmaUnvan: string
  firmaStats: FirmaStats
  formatCurrency: (val: number | null) => string
  onOpenResultApproval: () => void
  onOpenButceSorgusu?: () => void
}

export const Step2SonucOnay: React.FC<Props> = ({
  kazananFirmaUnvan,
  firmaStats,
  formatCurrency,
  onOpenResultApproval,
  onOpenButceSorgusu
}) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <FileCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Adım 2: Karar & Sonuç Onay ve Bütçe Uygunluk Süreci
            </h3>
            <p className="text-[11px] text-slate-400">
              Piyasa fiyat araştırması neticesinde doğrudan temin sonuç onay belgesi ve bütçe ödeneği kontrol işlemleri
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 p-4 rounded-xl bg-slate-50/70 dark:bg-slate-850/60 border border-slate-200/70 dark:border-slate-800 flex flex-col gap-3">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            Karar & Onay Özeti
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block font-bold">Uygun Görülen İstekli</span>
              <strong className="text-slate-800 dark:text-slate-100">{kazananFirmaUnvan || 'Belirtilmedi'}</strong>
            </div>
            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block font-bold">Onaylanacak Tutar (KDV Hariç)</span>
              <strong className="text-emerald-600 dark:text-emerald-400">{formatCurrency(firmaStats.teklifToplami)}</strong>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Bu belgeler harcama yetkilisinin onayına ve mali hizmetler biriminin bütçe/ödenek kontrolüne sunularak alımın kesinleşmesini sağlar. Önizleme ekranlarından tarih ve personel bilgilerini düzenleyebilirsiniz.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/60 flex flex-col justify-between gap-3">
          <div>
            <span className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300 block mb-1">
              Onay Belgeleri İşlemleri
            </span>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
              Sonuç onay belgesi veya bütçe sorgusu belgesini yazdırın ya da düzenleyin.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={onOpenResultApproval}
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-95 transition-all"
            >
              <FileCheck className="w-4 h-4" />
              Sonuç Onay Belgesini Aç
            </button>

            {onOpenButceSorgusu && (
              <button
                type="button"
                onClick={onOpenButceSorgusu}
                className="w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-slate-800 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60 font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-95 transition-all"
              >
                <ReceiptText className="w-3.5 h-3.5" />
                Bütçe Sorgusu Belgesi Aç
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


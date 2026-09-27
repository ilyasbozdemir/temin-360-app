import React from 'react'
import { FileCheck2 } from 'lucide-react'

interface Step4KabulVeSiparisProps {
  teslimGunu: number
  onOpenKabulMektubu: () => void
}

export function Step4KabulVeSiparis({
  teslimGunu,
  onOpenKabulMektubu
}: Step4KabulVeSiparisProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
            <FileCheck2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Adım 3: Kabul Edilen Teklif Mektubu & Sipariş Formu
            </h3>
            <p className="text-[11px] text-slate-400">
              Sonucun kazanan istekliye tebliği ve teslimatın başlatılması için resmi kabul ve sipariş mektubu
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1 max-w-xl">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Kabul Edilen Teklif Mektubu / Sipariş Formu
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Fiyat araştırması sonucunun ve{' '}
            <strong className="text-blue-600 dark:text-blue-400 font-bold">{teslimGunu} günlük</strong>{' '}
            yasal teslim süresinin firmaya tebliğ edildiği, alım kalemleri ve toplam bedeli içeren resmi yazıdır.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenKabulMektubu}
          className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs hover:shadow active:scale-95 transition-all shrink-0"
        >
          <FileCheck2 className="w-4 h-4" />
          Kabul Edilen Teklif / Sipariş Formunu Aç
        </button>
      </div>
    </div>
  )
}

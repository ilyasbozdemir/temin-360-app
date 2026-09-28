import React from 'react'
import { FileCheck2, Calendar } from 'lucide-react'

interface Step4KabulVeSiparisProps {
  teslimGunu: number
  onOpenKabulMektubu: () => void
}

export function Step4KabulVeSiparis({
  teslimGunu,
  onOpenKabulMektubu
}: Step4KabulVeSiparisProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-4">
      <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex flex-col gap-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 uppercase tracking-wider border border-blue-200 dark:border-blue-800">
              Yasal Tebligat Belgesi
            </span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              {teslimGunu} Günlük Teslim Süresi
            </span>
          </div>

          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
            Kabul Edilen Teklif Mektubu / Sipariş Formu
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Fiyat araştırması sonucunun ve belirlenen yasal teslim süresinin kazanan istekliye tebliğ edildiği, alım kalemleri ile toplam bedeli içeren resmi belgedir.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenKabulMektubu}
          className="py-3 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg active:scale-95 transition-all shrink-0"
        >
          <FileCheck2 className="w-4 h-4" />
          Kabul / Sipariş Formunu Aç
        </button>
      </div>
    </div>
  )
}


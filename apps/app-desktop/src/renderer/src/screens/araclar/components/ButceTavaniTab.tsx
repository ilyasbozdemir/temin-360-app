import React, { useState } from 'react'
import { Percent, ShieldAlert } from 'lucide-react'
import { denetleButceYuzdeOnSiniri, formatTL } from '../../../utils/ihale'

export function ButceTavaniTab(): React.JSX.Element {
  const [butceYillik, setButceYillik] = useState<number>(50000000)
  const [butceOncekiHarcama, setButceOncekiHarcama] = useState<number>(4200000)
  const [butceBuAlim, setButceBuAlim] = useState<number>(650000)

  const butceSonuc = denetleButceYuzdeOnSiniri({
    yillikToplamOdenek: butceYillik,
    oncekiHarcananToplam22d: butceOncekiHarcama,
    buAlimTutari: butceBuAlim
  })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
      <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Percent size={16} className="text-purple-600" />
          4734 Madde 62/ı Bütçe Girişleri
        </h3>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            İlgili Tertip Yıllık Toplam Ödeneği (₺)
          </label>
          <input
            type="number"
            value={butceYillik}
            onChange={(e) => setButceYillik(parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-base font-mono font-bold"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Bu Yıl 22/d ile Yapılan Önceki Harcamalar (₺)
          </label>
          <input
            type="number"
            value={butceOncekiHarcama}
            onChange={(e) => setButceOncekiHarcama(parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-base font-mono font-bold"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Yeni Yapılacak Alım Tutarı (₺)
          </label>
          <input
            type="number"
            value={butceBuAlim}
            onChange={(e) => setButceBuAlim(parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-base font-mono font-bold"
          />
        </div>
      </div>

      <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white">
          %10 Bütçe Tavan Denetimi Raporu
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
            <span className="text-xs text-slate-500 block">Yasal %10 Tavan Limiti</span>
            <span className="text-lg font-mono font-bold text-slate-900 dark:text-white">
              {formatTL(butceSonuc.yuzdeOnTavanTutari)}
            </span>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-800">
            <span className="text-xs text-blue-600 block">Kullanılan Toplam</span>
            <span className="text-lg font-mono font-bold text-blue-900 dark:text-blue-100">
              {formatTL(butceSonuc.yeniToplamHarcama)} (%{butceSonuc.kullanilanOranYuzde})
            </span>
          </div>
        </div>

        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-3 ${
            butceSonuc.uyariSeviyesi === 'ASILDI'
              ? 'bg-rose-50 border-rose-300 text-rose-800'
              : butceSonuc.uyariSeviyesi === 'YAKLASIYOR'
                ? 'bg-amber-50 border-amber-300 text-amber-800'
                : 'bg-emerald-50 border-emerald-300 text-emerald-800'
          }`}
        >
          <ShieldAlert size={20} />
          <span>{butceSonuc.mesaj}</span>
        </div>
      </div>
    </div>
  )
}

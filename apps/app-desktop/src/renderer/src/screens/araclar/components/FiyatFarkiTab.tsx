import React, { useState } from 'react'
import { TrendingUp } from 'lucide-react'
import { hesaplaGenelFiyatFarki, formatTL } from '../../../utils/ihale'

export function FiyatFarkiTab(): React.JSX.Element {
  const [ffHakedis, setFfHakedis] = useState<number>(800000)
  const [ffTemelEndeks, setFfTemelEndeks] = useState<number>(2850.45)
  const [ffUygulamaEndeks, setFfUygulamaEndeks] = useState<number>(3420.8)

  const ffSonuc = hesaplaGenelFiyatFarki({
    hakedisTutariB: ffHakedis,
    temelEndeksIo: ffTemelEndeks,
    uygulamaEndeksiIn: ffUygulamaEndeks
  })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
      <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <TrendingUp size={16} className="text-indigo-600" />
          Yİ-ÜFE Endeks Değerleri
        </h3>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Fiyat Farkı Verilecek Hakediş Tutarı B (₺)
          </label>
          <input
            type="number"
            value={ffHakedis}
            onChange={(e) => setFfHakedis(parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-base font-mono font-bold"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Temel Endeks (Io)
            </label>
            <input
              type="number"
              value={ffTemelEndeks}
              onChange={(e) => setFfTemelEndeks(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Uygulama Endeksi (In)
            </label>
            <input
              type="number"
              value={ffUygulamaEndeks}
              onChange={(e) => setFfUygulamaEndeks(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono font-bold"
            />
          </div>
        </div>
      </div>

      <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white">Hesaplanan Fiyat Farkı</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200 dark:border-indigo-800">
            <span className="text-xs text-indigo-600 block">Fiyat Farkı Tutarı (F)</span>
            <span className="text-2xl font-mono font-black text-indigo-900 dark:text-indigo-100">
              {formatTL(ffSonuc.fiyatFarkiTutariF)}
            </span>
          </div>

          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800">
            <span className="text-xs text-emerald-600 block">Toplam Ödenecek Hakediş</span>
            <span className="text-2xl font-mono font-black text-emerald-900 dark:text-emerald-100">
              {formatTL(ffSonuc.toplamHakedisBedeli)}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
          {ffSonuc.aciklama}
        </p>
      </div>
    </div>
  )
}

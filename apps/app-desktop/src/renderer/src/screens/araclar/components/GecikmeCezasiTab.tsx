import React, { useState } from 'react'
import { Clock, AlertTriangle } from 'lucide-react'
import { hesaplaGecikmeCezasi, formatTL } from '../../../utils/ihale'

export function GecikmeCezasiTab(): React.JSX.Element {
  const [cezaSozlesme, setCezaSozlesme] = useState<number>(1000000)
  const [cezaGun, setCezaGun] = useState<number>(12)
  const [cezaGunlukOran, setCezaGunlukOran] = useState<number>(0.0005)

  const cezaSonuc = hesaplaGecikmeCezasi({
    sozlesmeBedeli: cezaSozlesme,
    gecikilenGunSayisi: cezaGun,
    gunlukCezaOrani: cezaGunlukOran
  })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
      <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Clock size={16} className="text-rose-600" />
          Ceza Hesaplama Parametreleri
        </h3>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Sözleşme Bedeli (₺)
          </label>
          <input
            type="number"
            value={cezaSozlesme}
            onChange={(e) => setCezaSozlesme(parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-base font-mono font-bold text-slate-800 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Gecikilen Gün Sayısı
            </label>
            <input
              type="number"
              value={cezaGun}
              onChange={(e) => setCezaGun(parseInt(e.target.value, 10) || 0)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Günlük Ceza Oranı
            </label>
            <select
              value={cezaGunlukOran}
              onChange={(e) => setCezaGunlukOran(parseFloat(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
            >
              <option value={0.0005}>Binde 0.5 (Standart)</option>
              <option value={0.001}>Binde 1.0</option>
              <option value={0.002}>Binde 2.0</option>
              <option value={0.003}>Binde 3.0</option>
            </select>
          </div>
        </div>
      </div>

      <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white">
          Gecikme Cezası Hesap Özeti
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
            <span className="text-xs text-slate-500 block">Günlük Ceza Tutarı</span>
            <span className="text-lg font-mono font-bold text-slate-900 dark:text-white">
              {formatTL(cezaSonuc.gunlukCezaTutari)}
            </span>
          </div>

          <div className="p-4 bg-rose-50 dark:bg-rose-950/40 rounded-2xl border border-rose-200 dark:border-rose-800">
            <span className="text-xs text-rose-600 dark:text-rose-400 block">
              Toplam Kesilecek Ceza
            </span>
            <span className="text-lg font-mono font-bold text-rose-900 dark:text-rose-100">
              {formatTL(cezaSonuc.uygulananToplamCeza)}
            </span>
          </div>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <span className="text-xs text-slate-600 dark:text-slate-300">
            Ceza Kesintisi Sonrası Kalan Sözleşme Bedeli:
          </span>
          <span className="text-base font-mono font-bold text-emerald-600">
            {formatTL(cezaSonuc.kesintiSonrasiKalanSozlesme)}
          </span>
        </div>

        {cezaSonuc.tavanAsildiMi && (
          <div className="p-3 bg-amber-50 text-amber-900 rounded-xl border border-amber-300 text-xs flex items-center gap-2">
            <AlertTriangle size={16} />
            <span>
              Yasal %30 ceza tavan sınırı uygulanmıştır. Sözleşmenin feshi değerlendirilmelidir.
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

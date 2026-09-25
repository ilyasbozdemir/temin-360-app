import React from 'react'
import { MapPin, Save } from 'lucide-react'

interface KlasorArsivKonumCardProps {
  isDosyaClosed: boolean
  arsivLokasyon: string
  klasorNo: string
  rafNo: string
  globalArsivLokasyonlari: string[]
  onArsivLokasyonChange: (val: string) => void
  onKlasorNoChange: (val: string) => void
  onRafNoChange: (val: string) => void
}

export function KlasorArsivKonumCard({
  isDosyaClosed,
  arsivLokasyon,
  klasorNo,
  rafNo,
  globalArsivLokasyonlari,
  onArsivLokasyonChange,
  onKlasorNoChange,
  onRafNoChange
}: KlasorArsivKonumCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
      <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-5">
        <MapPin className="w-4 h-4 text-amber-500" />
        Fiziksel Arşiv Konumu
      </h4>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5 col-span-2">
          <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
            Arşiv Lokasyonu / Dolap
            <span className="ml-2 font-normal text-slate-400">(Genel Ayarlardan)</span>
          </label>
          <select
            disabled={isDosyaClosed}
            value={arsivLokasyon}
            onChange={(e) => onArsivLokasyonChange(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all disabled:opacity-60"
          >
            <option value="">-- Lokasyon Seçiniz --</option>
            {globalArsivLokasyonlari.map((lokasyon) => (
              <option key={lokasyon} value={lokasyon}>
                {lokasyon}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
            Klasör / Sıra No
          </label>
          <input
            type="text"
            disabled={isDosyaClosed}
            placeholder="Örn: 2026-05"
            value={klasorNo}
            onChange={(e) => onKlasorNoChange(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all disabled:opacity-60"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
            Raf No
          </label>
          <input
            type="text"
            disabled={isDosyaClosed}
            placeholder="Örn: 3. Raf"
            value={rafNo}
            onChange={(e) => onRafNoChange(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all disabled:opacity-60"
          />
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <button
          disabled={isDosyaClosed}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg transition-colors border border-slate-200 dark:border-slate-700 disabled:opacity-50 cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" /> Konumu Kaydet
        </button>
      </div>
    </div>
  )
}

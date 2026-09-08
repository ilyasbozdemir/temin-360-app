import React from 'react'
import {
  Calculator,
  ArrowRightLeft,
  CheckCircle2,
  Sparkles,
  Scale,
  Ruler,
  Maximize2,
  Thermometer
} from 'lucide-react'
import { OlcuBirimi, BirimDonusum, convertUnits } from '../olcubirimleri.hooks'
import { BirimSelect } from './BirimSelect'

interface BirimCeviriciProps {
  birimler: OlcuBirimi[]
  donusumler: BirimDonusum[]
  calcAmount: number
  setCalcAmount: (val: number) => void
  calcFromId: number
  setCalcFromId: (id: number) => void
  calcToId: number
  setCalcToId: (id: number) => void
  onSwap: () => void
}

export const BirimCevirici: React.FC<BirimCeviriciProps> = ({
  birimler,
  donusumler,
  calcAmount,
  setCalcAmount,
  calcFromId,
  setCalcFromId,
  calcToId,
  setCalcToId,
  onSwap
}) => {
  const fromUnit = birimler.find((b) => b.id === calcFromId)
  const toUnit = birimler.find((b) => b.id === calcToId)
  const conversionResult = React.useMemo(() => {
    return convertUnits(calcAmount, fromUnit, toUnit, donusumler)
  }, [calcAmount, fromUnit, toUnit, donusumler])

  return (
    <div className="flex-1 overflow-auto grid grid-cols-1 lg:grid-cols-12 gap-6 p-2">
      {/* Interactive Calculator Card */}
      <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col gap-6">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              İnteraktif Dönüşüm Hesaplayıcı
            </h3>
            <p className="text-xs text-slate-500">
              Miktar girin ve birimleri seçerek anlık dönüşüm sonucunu inceleyin.
            </p>
          </div>
        </div>

        {/* Input row */}
        <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-end">
          {/* Amount */}
          <div className="md:col-span-3 flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Miktar</label>
            <input
              type="number"
              step="any"
              value={calcAmount}
              onChange={(e) => setCalcAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-base font-bold font-mono text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/40 focus:outline-none"
              placeholder="Miktar..."
            />
          </div>

          {/* From Unit */}
          <div className="md:col-span-3">
            <BirimSelect
              label="Kaynak Birim"
              birimler={birimler}
              value={calcFromId}
              onChange={setCalcFromId}
              placeholder="Kaynak birim..."
            />
          </div>

          {/* Swap Button */}
          <div className="md:col-span-1 flex items-center justify-center pb-1">
            <button
              type="button"
              onClick={onSwap}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors shadow-xs border border-slate-200 dark:border-slate-700"
              title="Birimleri Değiştir (Swap)"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          {/* To Unit */}
          <div className="md:col-span-4">
            <BirimSelect
              label="Hedef Birim"
              birimler={birimler}
              value={calcToId}
              preferredCategory={fromUnit?.kategori}
              onChange={setCalcToId}
              placeholder="Hedef birim..."
            />
          </div>
        </div>

        {/* Result Display Box */}
        <div className="mt-2 p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-slate-50 dark:from-blue-950/40 dark:via-indigo-950/20 dark:to-slate-900 border border-blue-200/80 dark:border-blue-800/50 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Dönüşüm Sonucu</span>
            {conversionResult.success && (
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Başarılı
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl md:text-4xl font-black font-mono tracking-tight text-blue-600 dark:text-blue-400">
              {conversionResult.success
                ? Number(conversionResult.result.toFixed(6)).toLocaleString('tr-TR')
                : '-'}
            </span>
            <span className="text-lg font-bold text-slate-700 dark:text-slate-300">
              {toUnit?.kisa_ad || toUnit?.ad}
            </span>
          </div>

          <div className="pt-3 border-t border-blue-100 dark:border-blue-900/40 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Uygulanan Kural & Formül:</span>
            <span className="font-mono font-bold text-slate-700 dark:text-slate-300 bg-white/70 dark:bg-slate-800/80 px-2 py-0.5 rounded border border-blue-100 dark:border-blue-800">
              {conversionResult.formulaText || 'Eşleşen kural yok'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Reference / Scenario Cards */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Popüler Dönüşüm Senaryoları
          </h4>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30 flex flex-col gap-1">
              <span className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5" /> Ağırlık Dönüşümleri
              </span>
              <span className="font-mono text-slate-600 dark:text-slate-400">1 Ton = 1.000 kg = 1.000.000 g</span>
              <span className="font-mono text-slate-600 dark:text-slate-400">1 kg = 1.000 g = 0.001 Ton</span>
            </div>

            <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/30 flex flex-col gap-1">
              <span className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5" /> Uzunluk & Yapım
              </span>
              <span className="font-mono text-slate-600 dark:text-slate-400">1 km = 1.000 m = 100.000 cm</span>
              <span className="font-mono text-slate-600 dark:text-slate-400">
                1 m = 100 cm = 1.000 mm = 1 Metretül (mt)
              </span>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/30 flex flex-col gap-1">
              <span className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                <Maximize2 className="w-3.5 h-3.5" /> Alan & Hacim
              </span>
              <span className="font-mono text-slate-600 dark:text-slate-400">1 Hektar (ha) = 10.000 m² = 10 Dönüm</span>
              <span className="font-mono text-slate-600 dark:text-slate-400">1 m³ = 1.000 Litre | 1 L = 1.000 ml</span>
            </div>

            <div className="p-3 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-800/30 flex flex-col gap-1">
              <span className="font-bold text-rose-900 dark:text-rose-300 flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5" /> Sıcaklık (Formüllü)
              </span>
              <span className="font-mono text-slate-600 dark:text-slate-400">
                0 °C = 32 °F | Formül: (°C × 9/5) + 32
              </span>
              <span className="font-mono text-slate-600 dark:text-slate-400">
                100 °C = 212 °F | 0 °C = 273.15 K
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

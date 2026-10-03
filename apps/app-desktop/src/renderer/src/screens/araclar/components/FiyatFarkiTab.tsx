import React, { useEffect, useState } from 'react'
import { TrendingUp, Calendar, Calculator, Sparkles } from 'lucide-react'
import { hesaplaGenelFiyatFarki, formatTL } from '../../../utils/ihale'
import { AY_ISIMLERI, yiUfeService } from '../../../services/yiUfeService'

export function FiyatFarkiTab(): React.JSX.Element {
  const [ffHakedis, setFfHakedis] = useState<number>(800000)
  const [useTable, setUseTable] = useState<boolean>(true)

  // Tablodan dinamik seçim state'leri
  const [temelYil, setTemelYil] = useState<number>(2025)
  const [temelAy, setTemelAy] = useState<number>(1)
  const [uygulamaYil, setUygulamaYil] = useState<number>(2026)
  const [uygulamaAy, setUygulamaAy] = useState<number>(8)

  // Manuel override veya dinamik hesaplanan endeks değerleri
  const [ffTemelEndeks, setFfTemelEndeks] = useState<number>(2850.45)
  const [ffUygulamaEndeks, setFfUygulamaEndeks] = useState<number>(3420.8)

  useEffect(() => {
    yiUfeService.loadFromDatabase().then(() => {
      const latest = yiUfeService.getLatest()
      if (latest) {
        setUygulamaYil(latest.yil)
        setUygulamaAy(latest.ay)
        const tVal = yiUfeService.getIndex(2025, 1) || 2850.45
        const uVal = latest.endeks || 3420.8
        setFfTemelEndeks(tVal)
        setFfUygulamaEndeks(uVal)
      }
    }).catch(() => {})
  }, [])

  const handleTemelChange = (yil: number, ay: number): void => {
    setTemelYil(yil)
    setTemelAy(ay)
    const val = yiUfeService.getIndex(yil, ay)
    if (val !== null && val > 0) {
      setFfTemelEndeks(val)
    }
  }

  const handleUygulamaChange = (yil: number, ay: number): void => {
    setUygulamaYil(yil)
    setUygulamaAy(ay)
    const val = yiUfeService.getIndex(yil, ay)
    if (val !== null && val > 0) {
      setFfUygulamaEndeks(val)
    }
  }

  const ffSonuc = hesaplaGenelFiyatFarki({
    hakedisTutariB: ffHakedis,
    temelEndeksIo: ffTemelEndeks,
    uygulamaEndeksiIn: ffUygulamaEndeks
  })

  const pnRatio = ffTemelEndeks > 0 ? ffUygulamaEndeks / ffTemelEndeks : 1
  const percentChange = ((pnRatio - 1) * 100)
  const availableYears = Array.from({ length: 33 }, (_, i) => 2026 - i)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
      {/* Sol Panel: Giriş Parametreleri */}
      <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <TrendingUp size={16} className="text-indigo-600" />
            Yİ-ÜFE Endeks Parametreleri
          </h3>
          <button
            type="button"
            onClick={() => setUseTable(!useTable)}
            className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/50 hover:bg-indigo-100 transition-colors cursor-pointer"
          >
            {useTable ? '✍️ Manuel Endeks Girişi' : '📊 TÜİK Tablosundan Seç'}
          </button>
        </div>

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

        {useTable ? (
          <div className="space-y-3">
            {/* Temel Endeks (Io) Tablo Seçimi */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <Calendar size={13} className="text-indigo-500" />
                  Temel Endeks Dönemi (Io - İhale / Baz Ay)
                </span>
                <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {ffTemelEndeks.toFixed(2)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={temelYil}
                  onChange={(e) => handleTemelChange(Number(e.target.value), temelAy)}
                  className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
                >
                  {availableYears.map((y) => (
                    <option key={y} value={y}>{y} Yılı</option>
                  ))}
                </select>
                <select
                  value={temelAy}
                  onChange={(e) => handleTemelChange(temelYil, Number(e.target.value))}
                  className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
                >
                  {AY_ISIMLERI.map((m, idx) => (
                    <option key={idx + 1} value={idx + 1}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Uygulama Endeksi (In) Tablo Seçimi */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <Calendar size={13} className="text-emerald-500" />
                  Uygulama Endeksi Dönemi (In - Hakediş Ayı)
                </span>
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {ffUygulamaEndeks.toFixed(2)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={uygulamaYil}
                  onChange={(e) => handleUygulamaChange(Number(e.target.value), uygulamaAy)}
                  className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
                >
                  {availableYears.map((y) => (
                    <option key={y} value={y}>{y} Yılı</option>
                  ))}
                </select>
                <select
                  value={uygulamaAy}
                  onChange={(e) => handleUygulamaChange(uygulamaYil, Number(e.target.value))}
                  className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
                >
                  {AY_ISIMLERI.map((m, idx) => (
                    <option key={idx + 1} value={idx + 1}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Temel Endeks (Io)
              </label>
              <input
                type="number"
                step="0.01"
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
                step="0.01"
                value={ffUygulamaEndeks}
                onChange={(e) => setFfUygulamaEndeks(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono font-bold"
              />
            </div>
          </div>
        )}
      </div>

      {/* Sağ Panel: Hesaplama Sonuçları */}
      <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
            <Calculator size={16} className="text-emerald-600" />
            Hesaplanan Fiyat Farkı & Değişim
          </h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200 dark:border-indigo-800">
              <span className="text-xs text-indigo-600 dark:text-indigo-400 block font-semibold">Fiyat Farkı Tutarı (F)</span>
              <span className="text-2xl font-mono font-black text-indigo-900 dark:text-indigo-100">
                {formatTL(ffSonuc.fiyatFarkiTutariF)}
              </span>
              <span className="text-[10px] text-indigo-500/80 block mt-1">
                F = B × (In/Io - 1)
              </span>
            </div>

            <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800">
              <span className="text-xs text-emerald-600 dark:text-emerald-400 block font-semibold">Toplam Ödenecek Hakediş</span>
              <span className="text-2xl font-mono font-black text-emerald-900 dark:text-emerald-100">
                {formatTL(ffSonuc.toplamHakedisBedeli)}
              </span>
              <span className="text-[10px] text-emerald-500/80 block mt-1">
                Hakediş + Fiyat Farkı
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Fiyat Farkı Katsayısı (Pn):</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {pnRatio.toFixed(4)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Endeks Değişimi:</span>
              <span className={`font-mono font-bold ${percentChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                %{percentChange >= 0 ? `+${percentChange.toFixed(2)}` : percentChange.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="p-3 bg-indigo-50/40 dark:bg-indigo-950/20 rounded-xl border border-indigo-100 dark:border-indigo-900/30 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
          <Sparkles size={14} className="text-indigo-500 shrink-0 mt-0.5" />
          <span>{ffSonuc.aciklama}</span>
        </div>
      </div>
    </div>
  )
}

import React, { useState, useMemo } from 'react'
import {
  Calculator,
  ArrowRightLeft,
  CheckCircle2,
  Sparkles,
  Scale,
  Ruler,
  Maximize2,
  Thermometer,
  Layers
} from 'lucide-react'
import {
  useOlcuBirimleri,
  useBirimDonusumleri,
  convertUnits,
  BIRIM_KATEGORILERI
} from '../../olcubirimleri/olcubirimleri.hooks'

export function BirimDonusumTab(): React.JSX.Element {
  const { data: birimler = [] } = useOlcuBirimleri()
  const { data: donusumler = [] } = useBirimDonusumleri()

  const [selectedKategori, setSelectedKategori] = useState<string>('Ağırlık')
  const [calcAmount, setCalcAmount] = useState<number>(1000)
  const [calcFromId, setCalcFromId] = useState<number>(1)
  const [calcToId, setCalcToId] = useState<number>(2)

  // Kategoriye göre filtrelenmiş birimler
  const filteredBirimler = useMemo(() => {
    return birimler.filter((b) => !selectedKategori || b.kategori === selectedKategori)
  }, [birimler, selectedKategori])

  // İlk yüklemede veya kategori değişiminde ilk iki birimi seç
  React.useEffect(() => {
    if (filteredBirimler.length >= 2) {
      setCalcFromId(filteredBirimler[0].id)
      setCalcToId(filteredBirimler[1].id)
    } else if (filteredBirimler.length === 1) {
      setCalcFromId(filteredBirimler[0].id)
      setCalcToId(filteredBirimler[0].id)
    }
  }, [selectedKategori, filteredBirimler.length])

  const fromUnit = useMemo(() => birimler.find((b) => b.id === calcFromId), [birimler, calcFromId])
  const toUnit = useMemo(() => birimler.find((b) => b.id === calcToId), [birimler, calcToId])

  const conversionResult = useMemo(() => {
    return convertUnits(calcAmount, fromUnit, toUnit, donusumler)
  }, [calcAmount, fromUnit, toUnit, donusumler])

  const handleSwap = (): void => {
    const temp = calcFromId
    setCalcFromId(calcToId)
    setCalcToId(temp)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
      {/* Sol Panel: Dönüşüm Hesaplayıcı */}
      <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6 flex flex-col justify-between">
        <div className="space-y-5">
          {/* Başlık ve Kategori Filtresi */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Birim Çevirici</h3>
                <p className="text-[11px] text-slate-500">Ölçü birimlerini kamu ve teknik standartlara göre dönüştürün</p>
              </div>
            </div>

            {/* Kategori Butonları */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              {BIRIM_KATEGORILERI.slice(0, 5).map((kat) => (
                <button
                  key={kat}
                  type="button"
                  onClick={() => setSelectedKategori(kat)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all shrink-0 cursor-pointer ${
                    selectedKategori === kat
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {kat}
                </button>
              ))}
            </div>
          </div>

          {/* Girdi Satırı */}
          <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-end">
            {/* Miktar */}
            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Miktar
              </label>
              <input
                type="number"
                step="any"
                value={calcAmount}
                onChange={(e) => setCalcAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-base font-mono font-bold"
                placeholder="Miktar..."
              />
            </div>

            {/* Kaynak Birim */}
            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Kaynak Birim
              </label>
              <select
                value={calcFromId}
                onChange={(e) => setCalcFromId(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
              >
                {filteredBirimler.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.ad} {b.kisa_ad ? `(${b.kisa_ad})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Swap */}
            <div className="md:col-span-1 flex items-center justify-center">
              <button
                type="button"
                onClick={handleSwap}
                className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600 border border-slate-200 dark:border-slate-700 cursor-pointer shadow-xs"
                title="Birimleri Değiştir"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Hedef Birim */}
            <div className="md:col-span-4">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Hedef Birim
              </label>
              <select
                value={calcToId}
                onChange={(e) => setCalcToId(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
              >
                {filteredBirimler.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.ad} {b.kisa_ad ? `(${b.kisa_ad})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Sonuç Kartı */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50/80 via-teal-50/40 to-slate-50 dark:from-emerald-950/30 dark:via-slate-800/80 dark:to-slate-800/60 border border-emerald-200/80 dark:border-emerald-800/60 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Dönüşüm Sonucu</span>
            {conversionResult.success && (
              <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-100/70 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" /> Başarılı
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-baseline gap-3">
            <span className="text-3xl md:text-4xl font-black font-mono tracking-tight text-emerald-700 dark:text-emerald-300">
              {conversionResult.success
                ? Number(conversionResult.result.toFixed(6)).toLocaleString('tr-TR')
                : '-'}
            </span>
            <span className="text-lg font-bold text-slate-800 dark:text-slate-200">
              {toUnit?.ad} {toUnit?.kisa_ad ? `(${toUnit.kisa_ad})` : ''}
            </span>
          </div>

          <div className="pt-2 border-t border-emerald-100 dark:border-emerald-900/40 flex items-center justify-between text-xs text-slate-500">
            <span>Kural / Formül:</span>
            <span className="font-mono font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-800">
              {conversionResult.formulaText || 'Eşleşen kural yok'}
            </span>
          </div>
        </div>
      </div>

      {/* Sağ Panel: Popüler Dönüşüm Kuralları */}
      <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between gap-4">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Sık Kullanılan Kamu Standartları
          </h4>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30 space-y-1">
              <span className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-amber-600" /> Ağırlık
              </span>
              <p className="font-mono text-slate-600 dark:text-slate-400">1 Ton = 1.000 kg = 1.000.000 g</p>
            </div>

            <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/30 space-y-1">
              <span className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5 text-blue-600" /> Uzunluk & Yapım
              </span>
              <p className="font-mono text-slate-600 dark:text-slate-400">1 m = 100 cm = 1.000 mm = 1 mt</p>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/30 space-y-1">
              <span className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                <Maximize2 className="w-3.5 h-3.5 text-emerald-600" /> Alan & Hacim
              </span>
              <p className="font-mono text-slate-600 dark:text-slate-400">1 Dönüm = 1.000 m² | 1 m³ = 1.000 L</p>
            </div>

            <div className="p-3 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-800/30 space-y-1">
              <span className="font-bold text-rose-900 dark:text-rose-300 flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-rose-600" /> Sıcaklık
              </span>
              <p className="font-mono text-slate-600 dark:text-slate-400">0 °C = 32 °F | K = °C + 273.15</p>
            </div>
          </div>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/70 dark:border-slate-800 text-[11px] text-slate-500 flex items-center gap-2">
          <Layers size={14} className="text-emerald-500 shrink-0" />
          <span>TANIM_OlcuBirimi ve TANIM_BirimDonusum ile tam entegre çalışır.</span>
        </div>
      </div>
    </div>
  )
}

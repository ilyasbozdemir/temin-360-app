import React, { useState, useMemo } from 'react'
import {
  Calculator,
  Type,
  TrendingUp,
  Percent,
  Coins,
  Clock,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react'
import {
  convertNumberToWords,
  calculateFiyatFarki,
  calculateKdvTevkifat,
  calculateDamgaVergisi,
  calculateGecikmeCezasi,
  formatCurrency,
  SAMPLE_YIUFE_INDEXES,
  TEVKIFAT_ORANLARI
} from '../../utils/turkishCalculationUtils'

type ActiveTool = 'sayi_yazi' | 'yi_ufe' | 'kdv_tevkifat' | 'damga_vergisi' | 'gecikme_cezasi'

export default function PlaygroundScreen(): React.JSX.Element {
  const [activeTool, setActiveTool] = useState<ActiveTool>('sayi_yazi')
  const [copiedText, setCopiedText] = useState<string | null>(null)

  const handleCopy = (text: string, key = 'default'): void => {
    navigator.clipboard.writeText(text)
    setCopiedText(key)
    setTimeout(() => setCopiedText(null), 2000)
  }

  // --- 1. SAYIYI YAZIYA ÇEVİRİCİ STATE ---
  const [sayiInput, setSayiInput] = useState<string>('128450.75')
  const [currencyOpt, setCurrencyOpt] = useState<'TL' | 'USD' | 'EUR' | 'NONE'>('TL')
  const [caseOpt, setCaseOpt] = useState<'UPPER' | 'LOWER' | 'TITLE'>('UPPER')
  const [prefixOpt, setPrefixOpt] = useState<string>('#Yalnız ')
  const [suffixOpt, setSuffixOpt] = useState<string>("'dir#")

  const sayiYaziSonuc = useMemo(() => {
    const num = parseFloat(sayiInput.replace(',', '.'))
    if (isNaN(num)) return ''
    return convertNumberToWords(num, {
      currency: currencyOpt,
      subCurrency: currencyOpt === 'TL' ? 'KURUŞ' : currencyOpt === 'USD' || currencyOpt === 'EUR' ? 'CENT' : 'NONE',
      prefix: prefixOpt,
      suffix: suffixOpt,
      caseType: caseOpt
    })
  }, [sayiInput, currencyOpt, caseOpt, prefixOpt, suffixOpt])

  // --- 2. Yİ-ÜFE FİYAT FARKI STATE ---
  const [hakedisTutari, setHakedisTutari] = useState<string>('500000')
  const [temelEndeksIndex, setTemelEndeksIndex] = useState<number>(0) // 2024 Ocak
  const [guncelEndeksIndex, setGuncelEndeksIndex] = useState<number>(SAMPLE_YIUFE_INDEXES.length - 1) // En güncel
  const [customTemel, setCustomTemel] = useState<string>('')
  const [customGuncel, setCustomGuncel] = useState<string>('')
  const [sabitKatsayiB, setSabitKatsayiB] = useState<number>(0.9)

  const yiUfeSonuc = useMemo(() => {
    const tutar = parseFloat(hakedisTutari.replace(',', '.')) || 0
    const temel = customTemel ? parseFloat(customTemel.replace(',', '.')) : SAMPLE_YIUFE_INDEXES[temelEndeksIndex]?.endeks || 0
    const guncel = customGuncel ? parseFloat(customGuncel.replace(',', '.')) : SAMPLE_YIUFE_INDEXES[guncelEndeksIndex]?.endeks || 0

    return calculateFiyatFarki({
      hakedisTutari: tutar,
      temelEndeks: temel,
      guncelEndeks: guncel,
      sabitKatsayiB
    })
  }, [hakedisTutari, temelEndeksIndex, guncelEndeksIndex, customTemel, customGuncel, sabitKatsayiB])

  // --- 3. KDV VE TEVKİFAT STATE ---
  const [kdvTutarInput, setKdvTutarInput] = useState<string>('100000')
  const [kdvOrani, setKdvOrani] = useState<number>(20)
  const [selectedTevkifatKod, setSelectedTevkifatKod] = useState<string>('5/10')
  const [tutarTuru, setTutarTuru] = useState<'HARIC' | 'DAHIL'>('HARIC')

  const kdvTevkifatSonuc = useMemo(() => {
    const tutar = parseFloat(kdvTutarInput.replace(',', '.')) || 0
    const secilenTevkifat = TEVKIFAT_ORANLARI.find((t) => t.kod === selectedTevkifatKod) || TEVKIFAT_ORANLARI[0]

    return calculateKdvTevkifat({
      tutar,
      kdvOrani,
      tevkifatPay: secilenTevkifat.pay,
      tevkifatPayda: secilenTevkifat.payda,
      tutarTuru
    })
  }, [kdvTutarInput, kdvOrani, selectedTevkifatKod, tutarTuru])

  // --- 4. DAMGA VERGİSİ VE KESİNTİLER STATE ---
  const [damgaMatrahInput, setDamgaMatrahInput] = useState<string>('250000')
  const [incKararPulu, setIncKararPulu] = useState<boolean>(true)
  const [incSozlesmeDamga, setIncSozlesmeDamga] = useState<boolean>(true)
  const [incKikPayi, setIncKikPayi] = useState<boolean>(true)

  const damgaSonuc = useMemo(() => {
    const matrah = parseFloat(damgaMatrahInput.replace(',', '.')) || 0
    return calculateDamgaVergisi(matrah, {
      includeKararPulu: incKararPulu,
      includeSozlesmeDamga: incSozlesmeDamga,
      includeKikPayi: incKikPayi
    })
  }, [damgaMatrahInput, incKararPulu, incSozlesmeDamga, incKikPayi])

  // --- 5. GECİKME CEZASI STATE ---
  const [cezaSozlesmeBedeli, setCezaSozlesmeBedeli] = useState<string>('750000')
  const [cezaGunSayisi, setCezaGunSayisi] = useState<string>('12')
  const [cezaOraniBinde, setCezaOraniBinde] = useState<number>(0.5)

  const gecikmeSonuc = useMemo(() => {
    const sozlesme = parseFloat(cezaSozlesmeBedeli.replace(',', '.')) || 0
    const gun = parseInt(cezaGunSayisi, 10) || 0
    return calculateGecikmeCezasi(sozlesme, gun, cezaOraniBinde)
  }, [cezaSozlesmeBedeli, cezaGunSayisi, cezaOraniBinde])

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden text-slate-800 dark:text-slate-100">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-blue-600/10 text-blue-600 dark:text-blue-400 rounded-xl">
                <Calculator className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                  İhale &amp; Harcama Hesaplama Araçları (Playground)
                  <span className="px-2 py-0.5 text-[11px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 rounded-full">
                    UTILS HUB
                  </span>
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Sayıyı metne çevirme, Yİ-ÜFE fiyat farkı eskalasyonu, KDV tevkifatı, damga vergisi ve gecikme cezası hesaplayıcıları.
                </p>
              </div>
            </div>
          </div>

          {/* Hızlı Butonlar / Tab Listesi */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTool('sayi_yazi')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTool === 'sayi_yazi'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Type className="w-4 h-4" />
              Sayıyı Yazıya Çevirici
            </button>
            <button
              type="button"
              onClick={() => setActiveTool('yi_ufe')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTool === 'yi_ufe'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Yİ-ÜFE Fiyat Farkı
            </button>
            <button
              type="button"
              onClick={() => setActiveTool('kdv_tevkifat')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTool === 'kdv_tevkifat'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Percent className="w-4 h-4" />
              KDV &amp; Tevkifat
            </button>
            <button
              type="button"
              onClick={() => setActiveTool('damga_vergisi')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTool === 'damga_vergisi'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Coins className="w-4 h-4" />
              Damga &amp; Karar Pulu
            </button>
            <button
              type="button"
              onClick={() => setActiveTool('gecikme_cezasi')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTool === 'gecikme_cezasi'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4" />
              Gecikme Cezası
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* 1. TOOL: SAYIYI YAZIYA ÇEVİRİCİ */}
          {activeTool === 'sayi_yazi' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Sol Ayar Paneli */}
              <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Type className="w-4 h-4 text-blue-600" />
                    Sayı &amp; Tutar Girişi
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setSayiInput('1000000')
                      setCurrencyOpt('TL')
                      setCaseOpt('UPPER')
                    }}
                    className="text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Sıfırla
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Dönüştürülecek Tutar / Sayı
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={sayiInput}
                      onChange={(e) => setSayiInput(e.target.value)}
                      placeholder="Örn: 125430.50"
                      className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-base font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  {/* Hızlı Örnekler */}
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    <span className="text-[11px] text-slate-400 font-medium">Örnekler:</span>
                    {['1250', '45890.50', '1500000', '12345678.90'].map((ex) => (
                      <button
                        key={ex}
                        type="button"
                        onClick={() => setSayiInput(ex)}
                        className="text-[11px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-600 dark:text-slate-300 hover:text-blue-600 rounded cursor-pointer transition-colors"
                      >
                        {parseFloat(ex).toLocaleString('tr-TR')} ₺
                      </button>
                    ))}
                  </div>
                </div>

                {/* Para Birimi */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Para Birimi &amp; Kuruş Eki
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'TL', label: 'Türk Lirası (TL)' },
                      { id: 'USD', label: 'Dolar ($)' },
                      { id: 'EUR', label: 'Euro (€)' },
                      { id: 'NONE', label: 'Birimsiz Sayı' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setCurrencyOpt(item.id as any)}
                        className={`px-2.5 py-2 text-xs font-medium rounded-xl border transition-all cursor-pointer text-center ${
                          currencyOpt === item.id
                            ? 'bg-blue-50 border-blue-600 text-blue-700 dark:bg-blue-950/40 dark:border-blue-500 dark:text-blue-300 font-bold'
                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Harf Düzeni */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Büyük / Küçük Harf Düzeni
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'UPPER', label: 'TÜMÜ BÜYÜK' },
                      { id: 'TITLE', label: 'Baş Harfler Büyük' },
                      { id: 'LOWER', label: 'tümü küçük' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setCaseOpt(item.id as any)}
                        className={`px-2.5 py-2 text-xs font-medium rounded-xl border transition-all cursor-pointer text-center ${
                          caseOpt === item.id
                            ? 'bg-blue-50 border-blue-600 text-blue-700 dark:bg-blue-950/40 dark:border-blue-500 dark:text-blue-300 font-bold'
                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ön Ek ve Son Ek */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Başlangıç Ön Eki
                    </label>
                    <input
                      type="text"
                      value={prefixOpt}
                      onChange={(e) => setPrefixOpt(e.target.value)}
                      placeholder="#Yalnız "
                      className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Bitiş Son Eki
                    </label>
                    <input
                      type="text"
                      value={suffixOpt}
                      onChange={(e) => setSuffixOpt(e.target.value)}
                      placeholder="'dir#"
                      className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Sağ Sonuç Kartı */}
              <div className="lg:col-span-7 flex flex-col gap-5">
                <div className="bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-900 border border-blue-800/50 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-300 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        Yazıyla Tutar Okunuşu
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(sayiYaziSonuc, 'sayi_yazi')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-semibold rounded-lg transition-all cursor-pointer shadow-sm"
                      >
                        {copiedText === 'sayi_yazi' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-300" />
                            Kopyalandı!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Panoya Kopyala
                          </>
                        )}
                      </button>
                    </div>

                    <div className="min-h-[120px] bg-slate-950/60 border border-blue-500/20 rounded-xl p-5 flex items-center justify-center text-center">
                      <p className="text-lg md:text-xl font-bold tracking-wide text-blue-50 leading-relaxed select-all">
                        {sayiYaziSonuc || 'Lütfen geçerli bir sayı giriniz'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-blue-800/40 text-xs text-blue-200/80">
                    <div>
                      <span className="block text-[10px] uppercase text-blue-400 font-semibold">Rakamla Tutar:</span>
                      <span className="font-bold text-white text-sm">
                        {parseFloat(sayiInput.replace(',', '.') || '0').toLocaleString('tr-TR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}{' '}
                        ₺
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase text-blue-400 font-semibold">Para Birimi:</span>
                      <span className="font-bold text-white">{currencyOpt}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase text-blue-400 font-semibold">Kullanım Yeri:</span>
                      <span className="font-bold text-white">İhale / Onay Belgeleri</span>
                    </div>
                  </div>
                </div>

                {/* Bilgilendirme Kutusu */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400">
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      4734 Sayılı Kamu İhale Kanunu ve Muhasebat Standartları:
                    </p>
                    <p className="mt-0.5 text-slate-500 dark:text-slate-400">
                      Resmi belgelerde, onay belgelerinde, yaklaşık maliyet hesap cetvellerinde ve hakediş kapaklarında tutarların yazı ile belirtilmesi zorunludur. Yanıltmayı önlemek amacıyla metnin başına ve sonuna &quot;#&quot; karakteri veya &quot;Yalnız&quot; ibaresi eklenmesi tavsiye edilir.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. TOOL: Yİ-ÜFE FİYAT FARKI HESAPLAYICI */}
          {activeTool === 'yi_ufe' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Sol Ayar Paneli */}
              <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    Fiyat Farkı Parametreleri
                  </h3>
                  <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
                    4734 Esasları
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Hakediş / Sözleşme Tutarı (Aₙ)
                  </label>
                  <input
                    type="text"
                    value={hakedisTutari}
                    onChange={(e) => setHakedisTutari(e.target.value)}
                    placeholder="Örn: 500000"
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                {/* Temel Endeks (Yo / Po) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Temel Endeks (İhale / Sözleşme Ayı - Y₀)
                    </label>
                    <span className="text-[11px] text-slate-400">TÜİK Yİ-ÜFE</span>
                  </div>
                  <select
                    value={temelEndeksIndex}
                    onChange={(e) => {
                      setTemelEndeksIndex(Number(e.target.value))
                      setCustomTemel('')
                    }}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none cursor-pointer"
                  >
                    {SAMPLE_YIUFE_INDEXES.map((item, idx) => (
                      <option key={idx} value={idx}>
                        {item.yil} {item.ay} — {item.endeks.toFixed(2)}
                      </option>
                    ))}
                  </select>
                  <div className="mt-1.5 flex items-center gap-2">
                    <input
                      type="text"
                      value={customTemel}
                      onChange={(e) => setCustomTemel(e.target.value)}
                      placeholder="Manuel temel endeks değeri..."
                      className="flex-1 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>

                {/* Güncel Endeks (Yn / Pn) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Güncel Endeks (Uygulama / Hakediş Ayı - Yₙ)
                    </label>
                    <span className="text-[11px] text-slate-400">TÜİK Yİ-ÜFE</span>
                  </div>
                  <select
                    value={guncelEndeksIndex}
                    onChange={(e) => {
                      setGuncelEndeksIndex(Number(e.target.value))
                      setCustomGuncel('')
                    }}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none cursor-pointer"
                  >
                    {SAMPLE_YIUFE_INDEXES.map((item, idx) => (
                      <option key={idx} value={idx}>
                        {item.yil} {item.ay} — {item.endeks.toFixed(2)}
                      </option>
                    ))}
                  </select>
                  <div className="mt-1.5 flex items-center gap-2">
                    <input
                      type="text"
                      value={customGuncel}
                      onChange={(e) => setCustomGuncel(e.target.value)}
                      placeholder="Manuel güncel endeks değeri..."
                      className="flex-1 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>

                {/* Sabit Katsayı B */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Sabit Katsayı (B Katsayısı - Genelde 0.90)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { val: 0.9, label: '0.90 (Standart)' },
                      { val: 1.0, label: '1.00 (Tam Oran)' },
                      { val: 0.85, label: '0.85' }
                    ].map((item) => (
                      <button
                        key={item.val}
                        type="button"
                        onClick={() => setSabitKatsayiB(item.val)}
                        className={`px-2 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer text-center ${
                          sabitKatsayiB === item.val
                            ? 'bg-blue-50 border-blue-600 text-blue-700 dark:bg-blue-950/40 dark:border-blue-500 dark:text-blue-300 font-bold'
                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sağ Hesaplama Sonuç Raporu */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">
                        Fiyat Farkı Hesaplama Çıktısı
                      </h4>
                      <p className="text-xs text-slate-500">
                        Formül: <code className="font-mono text-blue-600 dark:text-blue-400">F = Aₙ × B × (Pₙ/P₀ - 1)</code>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const report = `FİYAT FARKI HESAPLAMA RAPORU\nHakediş Tutarı: ${formatCurrency(parseFloat(hakedisTutari) || 0)}\nTemel Endeks (Yo): ${customTemel || SAMPLE_YIUFE_INDEXES[temelEndeksIndex]?.endeks}\nGüncel Endeks (Yn): ${customGuncel || SAMPLE_YIUFE_INDEXES[guncelEndeksIndex]?.endeks}\nArtış Oranı: %${yiUfeSonuc.artisOrani.toFixed(2)}\nHesaplanan Fiyat Farkı: ${formatCurrency(yiUfeSonuc.fiyatFarkiTutari)}\nToplam Ödenecek: ${formatCurrency(yiUfeSonuc.guncelToplamTutar)}`
                        handleCopy(report, 'yi_ufe_report')
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold cursor-pointer transition-all"
                    >
                      {copiedText === 'yi_ufe_report' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          Rapor Kopyalandı!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Raporu Kopyala
                        </>
                      )}
                    </button>
                  </div>

                  {/* Büyük Vurgulu Kartlar */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-4 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/50 rounded-xl">
                      <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                        Hesaplanan Fiyat Farkı (F)
                      </span>
                      <span className="text-xl font-bold text-blue-700 dark:text-blue-300 mt-1 block">
                        {formatCurrency(yiUfeSonuc.fiyatFarkiTutari)}
                      </span>
                    </div>

                    <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 rounded-xl">
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                        Toplam Ödenecek (Aₙ + F)
                      </span>
                      <span className="text-xl font-bold text-emerald-700 dark:text-emerald-300 mt-1 block">
                        {formatCurrency(yiUfeSonuc.guncelToplamTutar)}
                      </span>
                    </div>

                    <div className="p-4 bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/50 rounded-xl">
                      <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider block">
                        Endeks Artış Oranı
                      </span>
                      <span className="text-xl font-bold text-purple-700 dark:text-purple-300 mt-1 block">
                        %{yiUfeSonuc.artisOrani.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Detay Döküm Tablosu */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    <table className="w-full text-xs text-left border-collapse">
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        <tr>
                          <td className="p-2.5 font-medium text-slate-500 bg-slate-50 dark:bg-slate-800/50 w-1/2">
                            Hakediş Ana Tutarı (Aₙ)
                          </td>
                          <td className="p-2.5 font-bold text-slate-800 dark:text-slate-200">
                            {formatCurrency(parseFloat(hakedisTutari) || 0)}
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-medium text-slate-500 bg-slate-50 dark:bg-slate-800/50">
                            Temel Endeks (Y₀)
                          </td>
                          <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-200">
                            {customTemel || SAMPLE_YIUFE_INDEXES[temelEndeksIndex]?.endeks.toFixed(2)}
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-medium text-slate-500 bg-slate-50 dark:bg-slate-800/50">
                            Güncel Endeks (Yₙ)
                          </td>
                          <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-200">
                            {customGuncel || SAMPLE_YIUFE_INDEXES[guncelEndeksIndex]?.endeks.toFixed(2)}
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-medium text-slate-500 bg-slate-50 dark:bg-slate-800/50">
                            Fiyat Endeks Katsayısı (Pₙ / P₀)
                          </td>
                          <td className="p-2.5 font-mono text-slate-800 dark:text-slate-200">
                            {yiUfeSonuc.fiyatEndeksKatsayisi.toFixed(6)}
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-medium text-slate-500 bg-slate-50 dark:bg-slate-800/50">
                            Katsayı B (Fiyat Farkı Katsayısı)
                          </td>
                          <td className="p-2.5 font-mono text-slate-800 dark:text-slate-200">
                            {sabitKatsayiB.toFixed(2)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. TOOL: KDV VE TEVKİFAT HESAPLAYICI */}
          {activeTool === 'kdv_tevkifat' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Sol Ayar Paneli */}
              <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Percent className="w-4 h-4 text-blue-600" />
                    KDV &amp; Tevkifat Girişi
                  </h3>
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[11px]">
                    <button
                      type="button"
                      onClick={() => setTutarTuru('HARIC')}
                      className={`px-2 py-1 rounded font-semibold transition-all cursor-pointer ${
                        tutarTuru === 'HARIC' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs' : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      KDV Hariç
                    </button>
                    <button
                      type="button"
                      onClick={() => setTutarTuru('DAHIL')}
                      className={`px-2 py-1 rounded font-semibold transition-all cursor-pointer ${
                        tutarTuru === 'DAHIL' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs' : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      KDV Dahil
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    İşlem Tutarı ({tutarTuru === 'HARIC' ? 'KDV Hariç Matrah' : 'KDV Dahil Toplam'})
                  </label>
                  <input
                    type="text"
                    value={kdvTutarInput}
                    onChange={(e) => setKdvTutarInput(e.target.value)}
                    placeholder="Örn: 100000"
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-base font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                {/* KDV Oranı */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    KDV Oranı
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { val: 20, label: '%20 (Genel)' },
                      { val: 10, label: '%10 (Gıda / Temel)' },
                      { val: 1, label: '%1 (Özel)' }
                    ].map((item) => (
                      <button
                        key={item.val}
                        type="button"
                        onClick={() => setKdvOrani(item.val)}
                        className={`px-2.5 py-2 text-xs font-medium rounded-xl border transition-all cursor-pointer text-center ${
                          kdvOrani === item.val
                            ? 'bg-blue-50 border-blue-600 text-blue-700 dark:bg-blue-950/40 dark:border-blue-500 dark:text-blue-300 font-bold'
                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tevkifat Oranları */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Kamu İhale Tevkifat Türü ve Oranı
                  </label>
                  <select
                    value={selectedTevkifatKod}
                    onChange={(e) => setSelectedTevkifatKod(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white outline-none cursor-pointer"
                  >
                    {TEVKIFAT_ORANLARI.map((item) => (
                      <option key={item.kod} value={item.kod}>
                        {item.ad} — ({item.aciklama})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sağ Sonuç Döküm Tablosu */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      KDV &amp; Tevkifat Dağılım Tablosu
                    </h4>
                    <span className="text-xs font-medium text-slate-500">
                      Oran: %{kdvOrani} KDV | {selectedTevkifatKod} Tevkifat
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                        KDV Hariç Matrah
                      </span>
                      <span className="text-lg font-bold text-slate-900 dark:text-white mt-1 block">
                        {formatCurrency(kdvTevkifatSonuc.matrah)}
                      </span>
                    </div>

                    <div className="p-4 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 rounded-xl">
                      <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                        İdarece Kesilen KDV (2 No&apos;lu)
                      </span>
                      <span className="text-lg font-bold text-amber-700 dark:text-amber-300 mt-1 block">
                        {formatCurrency(kdvTevkifatSonuc.tevkifEdilenKdv)}
                      </span>
                    </div>

                    <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 rounded-xl">
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                        Yükleniciye Ödenecek Tutar
                      </span>
                      <span className="text-lg font-bold text-emerald-700 dark:text-emerald-300 mt-1 block">
                        {formatCurrency(kdvTevkifatSonuc.saticiyaOdenecekToplam)}
                      </span>
                    </div>
                  </div>

                  {/* Kalem Kalem Döküm */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden mt-2">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="p-2.5 font-semibold text-slate-600 dark:text-slate-300">Hesap Kalemi</th>
                          <th className="p-2.5 font-semibold text-slate-600 dark:text-slate-300 text-right">Tutar (₺)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        <tr>
                          <td className="p-2.5 font-medium text-slate-700 dark:text-slate-300">1. Mal/Hizmet Bedeli (Matrah)</td>
                          <td className="p-2.5 font-semibold text-slate-900 dark:text-white text-right">{formatCurrency(kdvTevkifatSonuc.matrah)}</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-medium text-slate-700 dark:text-slate-300">2. Toplam Hesaplanan KDV (%{kdvOrani})</td>
                          <td className="p-2.5 font-semibold text-slate-900 dark:text-white text-right">{formatCurrency(kdvTevkifatSonuc.hesaplananKdv)}</td>
                        </tr>
                        <tr className="bg-amber-50/30 dark:bg-amber-950/10">
                          <td className="p-2.5 font-medium text-amber-700 dark:text-amber-300">
                            3. Tevkif Edilen KDV ({selectedTevkifatKod} - İdarece Vergi Dairesine Ödenir)
                          </td>
                          <td className="p-2.5 font-bold text-amber-700 dark:text-amber-300 text-right">
                            - {formatCurrency(kdvTevkifatSonuc.tevkifEdilenKdv)}
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-medium text-slate-700 dark:text-slate-300">4. Yükleniciye Ödenecek KDV Payı</td>
                          <td className="p-2.5 font-semibold text-slate-900 dark:text-white text-right">{formatCurrency(kdvTevkifatSonuc.saticiyaOdenecekKdv)}</td>
                        </tr>
                        <tr className="bg-emerald-50/40 dark:bg-emerald-950/20 font-bold">
                          <td className="p-3 text-emerald-800 dark:text-emerald-200">5. Yükleniciye Ödenecek Net Tutar (Matrah + Kalan KDV)</td>
                          <td className="p-3 text-emerald-800 dark:text-emerald-200 text-right">{formatCurrency(kdvTevkifatSonuc.saticiyaOdenecekToplam)}</td>
                        </tr>
                        <tr className="bg-slate-100 dark:bg-slate-800/80 font-semibold">
                          <td className="p-3 text-slate-900 dark:text-white">Genel İşlem Toplamı (Matrah + Toplam KDV)</td>
                          <td className="p-3 text-slate-900 dark:text-white text-right">{formatCurrency(kdvTevkifatSonuc.genelToplam)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. TOOL: DAMGA VERGİSİ VE KESİNTİLER */}
          {activeTool === 'damga_vergisi' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Coins className="w-4 h-4 text-blue-600" />
                    Sözleşme &amp; Karar Bedeli
                  </h3>
                  <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
                    Yasal Kesintiler
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    İhale / Sözleşme Bedeli (KDV Hariç Matrah)
                  </label>
                  <input
                    type="text"
                    value={damgaMatrahInput}
                    onChange={(e) => setDamgaMatrahInput(e.target.value)}
                    placeholder="Örn: 250000"
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-base font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                {/* Uygulanacak Kesintiler */}
                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Hesaplanacak Yasal Kesintiler
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={incKararPulu}
                      onChange={(e) => setIncKararPulu(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded cursor-pointer accent-blue-600"
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-slate-900 dark:text-white block">
                        İhale Karar Pulu (‰ 5,69 — Binde 5.69)
                      </span>
                      <span className="text-slate-500 text-[11px]">İhale yetkilisinin onayladığı kararlar üzerinden kesilir</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={incSozlesmeDamga}
                      onChange={(e) => setIncSozlesmeDamga(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded cursor-pointer accent-blue-600"
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-slate-900 dark:text-white block">
                        Sözleşme Damga Vergisi (‰ 9,48 — Binde 9.48)
                      </span>
                      <span className="text-slate-500 text-[11px]">Düzenlenen sözleşmeler ve taahhütnameler üzerinden kesilir</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={incKikPayi}
                      onChange={(e) => setIncKikPayi(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded cursor-pointer accent-blue-600"
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-slate-900 dark:text-white block">
                        Kamu İhale Kurumu (KİK) Payı (‰ 0,5 — On Binde 5)
                      </span>
                      <span className="text-slate-500 text-[11px]">Sözleşme bedelinin on binde beşi oranında tahsil edilir</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Sağ Sonuç Dökümü */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
                    Kesinti ve Tahakkuk Dökümü
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 bg-red-50/70 dark:bg-red-950/30 border border-red-200/80 dark:border-red-800/50 rounded-xl">
                      <span className="text-[11px] font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider block">
                        Toplam Yasal Kesinti
                      </span>
                      <span className="text-xl font-bold text-red-700 dark:text-red-300 mt-1 block">
                        {formatCurrency(damgaSonuc.toplamKesinti)}
                      </span>
                    </div>

                    <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 rounded-xl">
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                        Net Tahakkuk / Ödeme Tutarı
                      </span>
                      <span className="text-xl font-bold text-emerald-700 dark:text-emerald-300 mt-1 block">
                        {formatCurrency(damgaSonuc.netOdenecekTutar)}
                      </span>
                    </div>
                  </div>

                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden mt-2">
                    <table className="w-full text-xs text-left border-collapse">
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        <tr>
                          <td className="p-3 font-medium text-slate-600 dark:text-slate-300">İhale / Sözleşme Bedeli</td>
                          <td className="p-3 font-bold text-slate-900 dark:text-white text-right">{formatCurrency(damgaSonuc.matrah)}</td>
                        </tr>
                        {incKararPulu && (
                          <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                            <td className="p-3 text-slate-700 dark:text-slate-300">İhale Karar Pulu (‰ 5,69)</td>
                            <td className="p-3 font-semibold text-red-600 dark:text-red-400 text-right">- {formatCurrency(damgaSonuc.ihaleKararPulu)}</td>
                          </tr>
                        )}
                        {incSozlesmeDamga && (
                          <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                            <td className="p-3 text-slate-700 dark:text-slate-300">Sözleşme Damga Vergisi (‰ 9,48)</td>
                            <td className="p-3 font-semibold text-red-600 dark:text-red-400 text-right">- {formatCurrency(damgaSonuc.sozlesmeDamgaVergisi)}</td>
                          </tr>
                        )}
                        {incKikPayi && (
                          <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                            <td className="p-3 text-slate-700 dark:text-slate-300">KİK Payı (‰ 0,5)</td>
                            <td className="p-3 font-semibold text-red-600 dark:text-red-400 text-right">- {formatCurrency(damgaSonuc.kikPayi)}</td>
                          </tr>
                        )}
                        <tr className="bg-slate-100 dark:bg-slate-800 font-bold">
                          <td className="p-3 text-slate-900 dark:text-white">Kesintiler Sonrası Net Ödenecek</td>
                          <td className="p-3 text-emerald-600 dark:text-emerald-400 text-right text-sm">{formatCurrency(damgaSonuc.netOdenecekTutar)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 5. TOOL: GECİKME CEZASI HESAPLAYICI */}
          {activeTool === 'gecikme_cezasi' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    Gecikme Parametreleri
                  </h3>
                  <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
                    Sözleşme İhlali
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Toplam Sözleşme Bedeli (KDV Hariç)
                  </label>
                  <input
                    type="text"
                    value={cezaSozlesmeBedeli}
                    onChange={(e) => setCezaSozlesmeBedeli(e.target.value)}
                    placeholder="Örn: 750000"
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-base font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Gecikilen Gün Sayısı (Takvim Günü)
                  </label>
                  <input
                    type="number"
                    value={cezaGunSayisi}
                    onChange={(e) => setCezaGunSayisi(e.target.value)}
                    placeholder="Örn: 12"
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-base font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Günlük Ceza Oranı (Sözleşme Maddesi)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { val: 0.5, label: 'On Binde 5 (‰ 0.5)' },
                      { val: 1.0, label: 'Binde 1 (‰ 1.0)' },
                      { val: 2.0, label: 'Binde 2 (‰ 2.0)' }
                    ].map((item) => (
                      <button
                        key={item.val}
                        type="button"
                        onClick={() => setCezaOraniBinde(item.val)}
                        className={`px-2 py-2 text-xs font-medium rounded-xl border transition-all cursor-pointer text-center ${
                          cezaOraniBinde === item.val
                            ? 'bg-blue-50 border-blue-600 text-blue-700 dark:bg-blue-950/40 dark:border-blue-500 dark:text-blue-300 font-bold'
                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sağ Ceza Dökümü */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
                    Gecikme Cezası Hesaplama Sonucu
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 bg-red-50/70 dark:bg-red-950/30 border border-red-200/80 dark:border-red-800/50 rounded-xl">
                      <span className="text-[11px] font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider block">
                        Toplam Kesilecek Gecikme Cezası
                      </span>
                      <span className="text-xl font-bold text-red-700 dark:text-red-300 mt-1 block">
                        {formatCurrency(gecikmeSonuc.toplamCezaTutari)}
                      </span>
                    </div>

                    <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 rounded-xl">
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                        Ceza Sonrası Kalan Sözleşme Tutarı
                      </span>
                      <span className="text-xl font-bold text-emerald-700 dark:text-emerald-300 mt-1 block">
                        {formatCurrency(gecikmeSonuc.kalanSozlesmeBedeli)}
                      </span>
                    </div>
                  </div>

                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden mt-2">
                    <table className="w-full text-xs text-left border-collapse">
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        <tr>
                          <td className="p-3 font-medium text-slate-600 dark:text-slate-300">Sözleşme Bedeli</td>
                          <td className="p-3 font-bold text-slate-900 dark:text-white text-right">{formatCurrency(gecikmeSonuc.sozlesmeBedeli)}</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-medium text-slate-600 dark:text-slate-300">Gecikme Süresi</td>
                          <td className="p-3 font-semibold text-slate-900 dark:text-white text-right">{gecikmeSonuc.gecikmeGunSayisi} Gün</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-medium text-slate-600 dark:text-slate-300">Günlük Ceza Tutarı</td>
                          <td className="p-3 font-semibold text-slate-900 dark:text-white text-right">{formatCurrency(gecikmeSonuc.gunlukCezaTutari)}</td>
                        </tr>
                        <tr className="bg-red-50/40 dark:bg-red-950/20 font-bold">
                          <td className="p-3 text-red-700 dark:text-red-300">Hakedişten Kesilecek Ceza Toplamı</td>
                          <td className="p-3 text-red-700 dark:text-red-300 text-right">- {formatCurrency(gecikmeSonuc.toplamCezaTutari)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

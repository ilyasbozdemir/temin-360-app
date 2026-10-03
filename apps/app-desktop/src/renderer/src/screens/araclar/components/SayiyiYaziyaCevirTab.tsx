import React, { useState } from 'react'
import {
  ArrowLeftRight,
  Calculator,
  Check,
  Clipboard,
  Coins,
  FileText,
  Info,
  RotateCcw,
  Sparkles,
  Type
} from 'lucide-react'
import { amountToWordsTL } from '../../../utils/sayiyiYaziyaCevir'
import { yaziyiSayiyaCevir, formatTL } from '../../../utils/ihale/paraVeYuvarlamaUtils'

const SAYIDAN_YAZIYA_PRESETS = [
  { label: '282.112,00 ₺', value: '282.112,00' },
  { label: '1.450.000,50 ₺', value: '1.450.000,50' },
  { label: '45.750,25 ₺', value: '45.750,25' },
  { label: '1.000,00 ₺', value: '1.000,00' },
  { label: '100,00 ₺', value: '100,00' },
  { label: '75,50 ₺', value: '75,50' }
]

const YAZIDAN_SAYIYA_PRESETS = [
  { label: 'İKİYÜZSEKSENİKİBİN YÜZONİKİ TL', value: 'İKİYÜZSEKSENİKİBİN YÜZONİKİ TL' },
  { label: 'BİR MİLYON DÖRTYÜZELLİ BİN TL ELLİ KURUŞ', value: 'BİR MİLYON DÖRTYÜZELLİ BİN TL ELLİ KURUŞ' },
  { label: 'KIRKBEŞ BİN YEDİYÜZELLİ TL YİRMİBEŞ KURUŞ', value: 'KIRKBEŞ BİN YEDİYÜZELLİ TL YİRMİBEŞ KURUŞ' },
  { label: 'BİN TL', value: 'BİN TL' }
]

export function SayiyiYaziyaCevirTab(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<'sayidanYaziya' | 'yazidanSayiya'>('sayidanYaziya')
  const [inputValue, setInputValue] = useState<string>('282.112,00')
  const [harfTipi, setHarfTipi] = useState<'buyuk' | 'baslik' | 'kucuk'>('buyuk')
  const [paraBirimi, setParaBirimi] = useState<string>('TL')
  const [altBirim, setAltBirim] = useState<string>('KURUŞ')
  const [textInput, setTextInput] = useState<string>('İKİYÜZSEKSENİKİBİN YÜZONİKİ TL')
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const resultWords = amountToWordsTL(inputValue, { paraBirimi, altBirim, harfTipi })
  const parsedNumber = yaziyiSayiyaCevir(textInput)

  const handleCopy = async (text: string, key = 'default'): Promise<void> => {
    if (!text && text !== '0') return
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
      }
    } catch {}
    setCopiedKey(key)
    setTimeout(() => setCopiedKey((prev) => (prev === key ? null : prev)), 2000)
  }

  const handleCurrencyChange = (curr: 'TL' | 'USD' | 'EUR'): void => {
    if (curr === 'TL') {
      setParaBirimi('TL')
      setAltBirim('KURUŞ')
    } else if (curr === 'USD') {
      setParaBirimi('DOLAR')
      setAltBirim('CENT')
    } else if (curr === 'EUR') {
      setParaBirimi('EURO')
      setAltBirim('CENT')
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
      {/* Sol Kart: Giriş & Modlar */}
      <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Çift Yönlü Çevirici</h3>
              <p className="text-[11px] text-slate-500">Rakam ile metin arasında kamu formatında dönüşüm</p>
            </div>
          </div>

          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setActiveTab('sayidanYaziya')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'sayidanYaziya'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              123 → Yazı
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('yazidanSayiya')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'yazidanSayiya'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Yazı → 123
            </button>
          </div>
        </div>

        {activeTab === 'sayidanYaziya' ? (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <Calculator size={14} className="text-blue-600" />
                  Rakam ile Sayı / Tutar
                </label>
                <button
                  type="button"
                  onClick={() => setInputValue('')}
                  className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-1"
                >
                  <RotateCcw size={11} /> Temizle
                </button>
              </div>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Örn: 282.112,00 veya 1500000"
                className="w-full text-base font-mono font-bold px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {SAYIDAN_YAZIYA_PRESETS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setInputValue(p.value)}
                  className="px-2.5 py-1 text-xs font-mono font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-600 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700"
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Harf Formatı</label>
                <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex gap-1 border border-slate-200/60 dark:border-slate-700">
                  {(['buyuk', 'baslik', 'kucuk'] as const).map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setHarfTipi(h)}
                      className={`flex-1 py-1 text-[11px] font-bold rounded-lg ${
                        harfTipi === h ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs' : 'text-slate-500'
                      }`}
                    >
                      {h === 'buyuk' ? 'BÜYÜK' : h === 'baslik' ? 'Baş' : 'küçük'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Para Birimi</label>
                <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex gap-1 border border-slate-200/60 dark:border-slate-700">
                  {(['TL', 'USD', 'EUR'] as const).map((curr) => (
                    <button
                      key={curr}
                      type="button"
                      onClick={() => handleCurrencyChange(curr)}
                      className={`flex-1 py-1 text-[11px] font-bold rounded-lg ${
                        paraBirimi.startsWith(curr === 'TL' ? 'TL' : curr === 'USD' ? 'DOLAR' : 'EURO')
                          ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                          : 'text-slate-500'
                      }`}
                    >
                      {curr}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <Type size={14} className="text-indigo-600" />
                  Yazı ile Belirtilen Tutar Metni
                </label>
                <button
                  type="button"
                  onClick={() => setTextInput('')}
                  className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-1"
                >
                  <RotateCcw size={11} /> Temizle
                </button>
              </div>
              <textarea
                rows={3}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Örn: İKİYÜZSEKSENİKİBİN YÜZONİKİ TL ELLİ KURUŞ"
                className="w-full text-sm font-semibold px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 uppercase"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              {YAZIDAN_SAYIYA_PRESETS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setTextInput(p.value)}
                  className="text-left px-2.5 py-1 text-[11px] font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sağ Kart: Sonuç Raporu */}
      <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
            <Sparkles size={16} className="text-amber-500" />
            Dönüşüm Sonucu
          </h3>

          {activeTab === 'sayidanYaziya' ? (
            <div className="p-5 bg-gradient-to-br from-blue-50/80 to-indigo-50/40 dark:from-blue-950/30 dark:to-slate-800/60 border border-blue-200/70 dark:border-blue-800/60 rounded-2xl space-y-3">
              <div className="flex items-center justify-between text-xs text-blue-700 dark:text-blue-300 font-semibold">
                <span className="flex items-center gap-1.5"><FileText size={14} /> Resmi Yazı Formatı</span>
                {resultWords && <span>{resultWords.length} karakter</span>}
              </div>
              <p className="text-base font-bold text-blue-950 dark:text-blue-100 leading-relaxed select-all">
                {resultWords || <span className="text-slate-400 font-normal italic">Tutar giriniz...</span>}
              </p>
              {resultWords && (
                <button
                  type="button"
                  onClick={() => handleCopy(resultWords, 'words')}
                  className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedKey === 'words' ? <><Check size={14} /> Kopyalandı</> : <><Clipboard size={14} /> Metni Kopyala</>}
                </button>
              )}
            </div>
          ) : (
            <div className="p-5 bg-gradient-to-br from-indigo-50/80 to-purple-50/40 dark:from-indigo-950/30 dark:to-slate-800/60 border border-indigo-200/70 dark:border-indigo-800/60 rounded-2xl space-y-3">
              <div className="text-xs text-indigo-700 dark:text-indigo-300 font-semibold flex items-center gap-1.5">
                <Calculator size={14} /> Rakam Karşılığı
              </div>
              <p className="text-2xl font-mono font-black text-indigo-950 dark:text-indigo-100">
                {parsedNumber !== null ? formatTL(parsedNumber) : <span className="text-slate-400 text-sm font-normal italic">Metin giriniz...</span>}
              </p>
              {parsedNumber !== null && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(formatTL(parsedNumber), 'fmt')}
                    className="px-3.5 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center gap-1.5"
                  >
                    {copiedKey === 'fmt' ? <><Check size={14} /> Kopyalandı</> : <><Clipboard size={14} /> ₺ Formatlı</>}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy(String(parsedNumber), 'raw')}
                    className="px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    {copiedKey === 'raw' ? 'Düz Alındı' : 'Düz Sayı'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/70 dark:border-slate-800 text-[11px] text-slate-500 flex items-start gap-2">
          <Info size={15} className="text-blue-500 shrink-0 mt-0.5" />
          <span>Kamu İhale ve Muhasebat standartlarına göre <b>&quot;BİR BİN&quot;</b> yerine <b>&quot;BİN&quot;</b> ifadesi yazılır.</span>
        </div>
      </div>
    </div>
  )
}

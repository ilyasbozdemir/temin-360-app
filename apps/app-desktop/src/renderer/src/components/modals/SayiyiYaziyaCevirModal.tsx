import React, { useState } from 'react'
import {
  Calculator,
  Check,
  Clipboard,
  Coins,
  FileText,
  Info,
  RotateCcw,
  Sparkles,
  X
} from 'lucide-react'
import { amountToWordsTL } from '../../utils/sayiyiYaziyaCevir'
import { cn } from '../../utils/cn'

interface SayiyiYaziyaCevirModalProps {
  isOpen: boolean
  onClose: () => void
  initialValue?: string | number
}

const PRESETS = [
  { label: '282.112,00 ₺', value: '282.112,00' },
  { label: '1.450.000,50 ₺', value: '1.450.000,50' },
  { label: '45.750,25 ₺', value: '45.750,25' },
  { label: '1.000,00 ₺', value: '1.000,00' },
  { label: '100,00 ₺', value: '100,00' },
  { label: '75,50 ₺', value: '75,50' }
]

export function SayiyiYaziyaCevirModal({
  isOpen,
  onClose,
  initialValue = '282.112,00'
}: SayiyiYaziyaCevirModalProps): React.JSX.Element | null {
  const [inputValue, setInputValue] = useState<string>(String(initialValue))
  const [harfTipi, setHarfTipi] = useState<'buyuk' | 'baslik' | 'kucuk'>('buyuk')
  const [paraBirimi, setParaBirimi] = useState<string>('TL')
  const [altBirim, setAltBirim] = useState<string>('KURUŞ')
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const resultWords = amountToWordsTL(inputValue, {
    paraBirimi,
    altBirim,
    harfTipi
  })

  const handleCopy = async () => {
    if (!resultWords) return
    try {
      await navigator.clipboard.writeText(resultWords)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
    }
  }

  const handleCurrencyChange = (curr: 'TL' | 'USD' | 'EUR') => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 md:p-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50/60 dark:from-blue-950/30 dark:via-slate-900 dark:to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                Sayıyı Yazıya Çevirici
                <span className="text-[11px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 px-2.5 py-0.5 rounded-full">
                  Mevzuat Standardı
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                İhale, teklif ve hakediş dokümanlarında kullanılan resmi &quot;Yazı ile&quot; çevirici
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 md:p-6 space-y-5 overflow-y-auto max-h-[calc(85vh-140px)]">
          
          {/* Tutar Giriş Alanı */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <Calculator size={15} className="text-blue-600" />
                Rakam ile Tutar
              </label>
              <button
                type="button"
                onClick={() => setInputValue('')}
                className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 transition-colors"
              >
                <RotateCcw size={12} /> Temizle
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Örn: 282.112,00 veya 1500000"
                className="w-full text-lg md:text-xl font-mono font-bold px-4 py-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-slate-800 dark:text-white transition-all shadow-inner"
                autoFocus
              />
            </div>
          </div>

          {/* Hızlı Örnek Değerler */}
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Hızlı Örnekler
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setInputValue(p.value)}
                  className="px-2.5 py-1 text-xs font-mono font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-300 text-slate-600 dark:text-slate-300 transition-colors border border-slate-200/60 dark:border-slate-700"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ayarlar: Harf Tipi & Para Birimi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Harf Formatı
              </label>
              <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex gap-1 border border-slate-200/60 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setHarfTipi('buyuk')}
                  className={cn(
                    'flex-1 py-1.5 text-xs font-bold rounded-lg transition-all',
                    harfTipi === 'buyuk'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  )}
                >
                  BÜYÜK (Resmi)
                </button>
                <button
                  type="button"
                  onClick={() => setHarfTipi('baslik')}
                  className={cn(
                    'flex-1 py-1.5 text-xs font-bold rounded-lg transition-all',
                    harfTipi === 'baslik'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  )}
                >
                  Baş Harfler
                </button>
                <button
                  type="button"
                  onClick={() => setHarfTipi('kucuk')}
                  className={cn(
                    'flex-1 py-1.5 text-xs font-bold rounded-lg transition-all',
                    harfTipi === 'kucuk'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  )}
                >
                  küçük
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Para Birimi
              </label>
              <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex gap-1 border border-slate-200/60 dark:border-slate-700">
                {(['TL', 'USD', 'EUR'] as const).map((curr) => (
                  <button
                    key={curr}
                    type="button"
                    onClick={() => handleCurrencyChange(curr)}
                    className={cn(
                      'flex-1 py-1.5 text-xs font-bold rounded-lg transition-all',
                      paraBirimi.startsWith(curr === 'TL' ? 'TL' : curr === 'USD' ? 'DOLAR' : 'EURO')
                        ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    )}
                  >
                    {curr}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sonuç Kartı */}
          <div className="pt-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5">
                <FileText size={15} className="text-emerald-600" />
                Yazı ile Karşılığı
              </span>
              {resultWords && (
                <span className="text-[11px] font-normal text-slate-400">
                  {resultWords.length} karakter
                </span>
              )}
            </label>

            <div className="relative group bg-gradient-to-br from-blue-50/90 via-indigo-50/50 to-emerald-50/40 dark:from-blue-950/40 dark:via-slate-800/80 dark:to-slate-800/60 border-2 border-blue-200/80 dark:border-blue-800/60 rounded-2xl p-5 min-h-[90px] flex items-center justify-between gap-4 transition-all">
              <p className="text-base md:text-lg font-bold text-blue-900 dark:text-blue-100 leading-relaxed break-words select-all">
                {resultWords || (
                  <span className="text-sm font-normal text-slate-400 italic">
                    Tutar girdiğinizde yazı ile karşılığı burada belirecektir...
                  </span>
                )}
              </p>

              {resultWords && (
                <button
                  type="button"
                  onClick={handleCopy}
                  className={cn(
                    'px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all shadow-sm',
                    copied
                      ? 'bg-emerald-600 text-white scale-105'
                      : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md'
                  )}
                >
                  {copied ? (
                    <>
                      <Check size={16} /> Kopyalandı!
                    </>
                  ) : (
                    <>
                      <Clipboard size={16} /> Kopyala
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Bilgi Notu */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/70 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed flex items-start gap-2.5">
            <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-700 dark:text-slate-300">Kamu Mevzuat Kuralı: </span>
              4734 sayılı Kamu İhale Kanunu ve Muhasebat standartlarına göre <b>&quot;BİR BİN&quot;</b> yerine yalnızca <b>&quot;BİN&quot;</b>, <b>&quot;BİR YÜZ&quot;</b> yerine <b>&quot;YÜZ&quot;</b> ifadeleri kullanılır. Tutarlar otomatik olarak bu kurala göre sadeleştirilir.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Sparkles size={14} className="text-amber-500" />
            Tüm teklif ve onay evraklarında standart kullanılır
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-xl transition-colors"
          >
            Kapat
          </button>
        </div>

      </div>
    </div>
  )
}

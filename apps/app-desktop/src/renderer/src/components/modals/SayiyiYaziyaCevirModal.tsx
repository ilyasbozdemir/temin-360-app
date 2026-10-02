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
  Type,
  X
} from 'lucide-react'
import { amountToWordsTL } from '../../utils/sayiyiYaziyaCevir'
import { yaziyiSayiyaCevir, formatTL } from '../../utils/ihale/paraVeYuvarlamaUtils'
import { cn } from '../../utils/cn'

interface SayiyiYaziyaCevirModalProps {
  isOpen: boolean
  onClose: () => void
  initialValue?: string | number
}

const SAYIDAN_YAZIYA_PRESETS = [
  { label: '282.112,00 ₺', value: '282.112,00' },
  { label: '1.450.000,50 ₺', value: '1.450.000,50' },
  { label: '45.750,25 ₺', value: '45.750,25' },
  { label: '1.000,00 ₺', value: '1.000,00' },
  { label: '100,00 ₺', value: '100,00' },
  { label: '75,50 ₺', value: '75,50' }
]

const YAZIDAN_SAYIYA_PRESETS = [
  {
    label: 'İKİYÜZSEKSENİKİBİN YÜZONİKİ TL',
    value: 'İKİYÜZSEKSENİKİBİN YÜZONİKİ TL'
  },
  {
    label: 'BİR MİLYON DÖRTYÜZELLİ BİN TL ELLİ KURUŞ',
    value: 'BİR MİLYON DÖRTYÜZELLİ BİN TL ELLİ KURUŞ'
  },
  {
    label: 'KIRKBEŞ BİN YEDİYÜZELLİ TL YİRMİBEŞ KURUŞ',
    value: 'KIRKBEŞ BİN YEDİYÜZELLİ TL YİRMİBEŞ KURUŞ'
  },
  { label: 'BİN TL', value: 'BİN TL' }
]

export function SayiyiYaziyaCevirModal({
  isOpen,
  onClose,
  initialValue = '282.112,00'
}: SayiyiYaziyaCevirModalProps): React.JSX.Element | null {
  const [activeTab, setActiveTab] = useState<'sayidanYaziya' | 'yazidanSayiya'>('sayidanYaziya')

  // Sayıdan Yazıya State
  const [inputValue, setInputValue] = useState<string>(String(initialValue))
  const [harfTipi, setHarfTipi] = useState<'buyuk' | 'baslik' | 'kucuk'>('buyuk')
  const [paraBirimi, setParaBirimi] = useState<string>('TL')
  const [altBirim, setAltBirim] = useState<string>('KURUŞ')

  // Yazıdan Sayıya State
  const [textInput, setTextInput] = useState<string>('İKİYÜZSEKSENİKİBİN YÜZONİKİ TL')

  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  if (!isOpen) return null

  // Hesaplamalar
  const resultWords = amountToWordsTL(inputValue, {
    paraBirimi,
    altBirim,
    harfTipi
  })

  const parsedNumber = yaziyiSayiyaCevir(textInput)

  const handleCopy = async (text: string, key = 'default') => {
    if (!text && text !== '0') return
    let success = false

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
        success = true
      }
    } catch {
      success = false
    }

    if (!success) {
      try {
        const textarea = document.createElement('textarea')
        textarea.value = text
        textarea.style.position = 'fixed'
        textarea.style.left = '-9999px'
        textarea.style.top = '-9999px'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.focus()
        textarea.select()
        success = document.execCommand('copy')
        document.body.removeChild(textarea)
      } catch (err) {
        console.error('Kopyalama hatası:', err)
      }
    }

    setCopiedKey(key)
    setTimeout(() => {
      setCopiedKey((prev) => (prev === key ? null : prev))
    }, 2000)
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
                Çift Yönlü Sayı & Yazı Çevirici
                <span className="text-[11px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 px-2.5 py-0.5 rounded-full">
                  Mevzuat Standardı
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                İhale, teklif, sözleşme ve hakediş dokümanları için resmi tutar dönüştürücüsü
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

        {/* Sekmeler (Sayıdan Yazıya / Yazıdan Sayıya) */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 px-6 pt-3 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('sayidanYaziya')}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2',
              activeTab === 'sayidanYaziya'
                ? 'bg-white dark:bg-slate-900 text-blue-600 border-blue-600 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-white'
            )}
          >
            <Calculator size={15} />
            Sayıdan Yazıya (Rakam → Metin)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('yazidanSayiya')}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2',
              activeTab === 'yazidanSayiya'
                ? 'bg-white dark:bg-slate-900 text-blue-600 border-blue-600 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-white'
            )}
          >
            <ArrowLeftRight size={15} />
            Yazıdan Sayıya (Metin → Rakam Ters Çevirme)
          </button>
        </div>

        {/* Body */}
        <div className="p-5 md:p-6 space-y-5 overflow-y-auto max-h-[calc(85vh-160px)]">
          {activeTab === 'sayidanYaziya' ? (
            <>
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
                  {SAYIDAN_YAZIYA_PRESETS.map((p) => (
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
                      BÜYÜK
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
                          paraBirimi.startsWith(
                            curr === 'TL' ? 'TL' : curr === 'USD' ? 'DOLAR' : 'EURO'
                          )
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
                      onClick={() => handleCopy(resultWords, 'words')}
                      className={cn(
                        'px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all shadow-sm',
                        copiedKey === 'words'
                          ? 'bg-emerald-600 text-white scale-105'
                          : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md'
                      )}
                    >
                      {copiedKey === 'words' ? (
                        <>
                          <Check size={16} /> Kopyalandı!
                        </>
                      ) : (
                        <>
                          <Clipboard size={16} /> Yazıyı Kopyala
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* YAZIDAN SAYIYA TERS ÇEVİRİCİ SEKME */
            <>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <Type size={15} className="text-indigo-600" />
                    Yazı ile Belirtilen Tutar Metni
                  </label>
                  <button
                    type="button"
                    onClick={() => setTextInput('')}
                    className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw size={12} /> Temizle
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Örn: İKİYÜZSEKSENİKİBİN YÜZONİKİ TL ELLİ KURUŞ"
                  className="w-full text-base font-semibold px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-slate-800 dark:text-white transition-all shadow-inner uppercase"
                  autoFocus
                />
              </div>

              {/* Hızlı Örnekler */}
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Hızlı Örnek Cümleler
                </span>
                <div className="flex flex-col gap-1.5">
                  {YAZIDAN_SAYIYA_PRESETS.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setTextInput(p.value)}
                      className="text-left px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-300 text-slate-600 dark:text-slate-300 transition-colors border border-slate-200/60 dark:border-slate-700"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ayrıştırılan Sayısal Tutar Kartı */}
              <div className="pt-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center justify-between mb-2">
                  <span className="flex items-center gap-1.5">
                    <Calculator size={15} className="text-indigo-600" />
                    Ayrıştırılan Rakam Karşılığı
                  </span>
                </label>

                <div className="relative group bg-gradient-to-br from-indigo-50/90 via-purple-50/40 to-slate-50 dark:from-indigo-950/40 dark:via-slate-800/80 dark:to-slate-800/60 border-2 border-indigo-200/80 dark:border-indigo-800/60 rounded-2xl p-5 min-h-[90px] flex items-center justify-between gap-4 transition-all">
                  <div>
                    <p className="text-2xl md:text-3xl font-mono font-black text-indigo-950 dark:text-indigo-100">
                      {parsedNumber !== null ? (
                        formatTL(parsedNumber)
                      ) : (
                        <span className="text-sm font-normal text-slate-400 italic">
                          Türkçe metin girildiğinde sayısal tutar burada görüntülenir...
                        </span>
                      )}
                    </p>
                    {parsedNumber !== null && (
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 font-mono mt-1">
                        Düz Değer: {parsedNumber}
                      </p>
                    )}
                  </div>

                  {parsedNumber !== null && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopy(formatTL(parsedNumber), 'formatted')}
                        className={cn(
                          'px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all shadow-sm',
                          copiedKey === 'formatted'
                            ? 'bg-emerald-600 text-white scale-105'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-md'
                        )}
                        title="Formatlı TL olarak kopyalar (örn: 282.112,00 ₺)"
                      >
                        {copiedKey === 'formatted' ? (
                          <>
                            <Check size={16} /> Kopyalandı!
                          </>
                        ) : (
                          <>
                            <Clipboard size={16} /> Tutarı Kopyala
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopy(String(parsedNumber), 'raw')}
                        className={cn(
                          'px-3 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 shrink-0 transition-all border',
                          copiedKey === 'raw'
                            ? 'bg-emerald-100 border-emerald-400 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                        )}
                        title="Düz sayı olarak kopyalar (örn: 282112)"
                      >
                        {copiedKey === 'raw' ? (
                          <>
                            <Check size={14} className="text-emerald-600" /> Düz Sayı Alındı
                          </>
                        ) : (
                          <>Düz Sayı</>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Bilgi Notu */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/70 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed flex items-start gap-2.5">
            <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-700 dark:text-slate-300">
                Kamu Mevzuat Kuralı:{' '}
              </span>
              4734 sayılı Kamu İhale Kanunu ve Muhasebat standartlarına göre{' '}
              <b>&quot;BİR BİN&quot;</b> yerine yalnızca <b>&quot;BİN&quot;</b>,{' '}
              <b>&quot;BİR YÜZ&quot;</b> yerine <b>&quot;YÜZ&quot;</b> ifadeleri kullanılır. Hem
              ileri hem tersine dönüştürücü bu kuralı otomatik destekler.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Sparkles size={14} className="text-amber-500" />
            Tüm teklif, hakediş ve onay evraklarında standart kullanılır
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

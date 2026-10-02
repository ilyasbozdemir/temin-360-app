import React, { useState } from 'react'
import { Coins, Check, Clipboard } from 'lucide-react'
import { hesaplaMaliKesintiler, KDV_TEVKIFAT_KATALOGU, formatTL } from '../../../utils/ihale'

export function VergiVeKesintiTab(): React.JSX.Element {
  const [vergiTutar, setVergiTutar] = useState<number>(500000)
  const [vergiTipi, setVergiTipi] = useState<'KDV_HARIC' | 'BRUT' | 'NET_ODENECEK'>('KDV_HARIC')
  const [vergiKdvOran, setVergiKdvOran] = useState<number>(0.2)
  const [vergiTevkifatKod, setVergiTevkifatKod] = useState<string>('YAPIM_ISLERI')
  const [vergiDamgaOran, setVergiDamgaOran] = useState<number>(0.00948)
  const [vergiStopajOran, setVergiStopajOran] = useState<number>(0.0)
  const [copied, setCopied] = useState(false)

  const copyText = (txt: string) => {
    navigator.clipboard.writeText(txt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const vergiSonuc = hesaplaMaliKesintiler({
    tutar: vergiTutar,
    tutarTipi: vergiTipi,
    kdvOrani: vergiKdvOran,
    tevkifatKodu: vergiTevkifatKod,
    damgaVergisiOrani: vergiDamgaOran,
    stopajOrani: vergiStopajOran,
    kikPayiUygula: true
  })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
      <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Coins size={16} className="text-emerald-600" />
          Hesaplama Girişleri
        </h3>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Tutar Giriş Tipi
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => setVergiTipi('KDV_HARIC')}
              className={`py-2 text-xs font-bold rounded-xl border ${
                vergiTipi === 'KDV_HARIC'
                  ? 'bg-blue-50 text-blue-600 border-blue-400'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600'
              }`}
            >
              KDV Hariç
            </button>
            <button
              type="button"
              onClick={() => setVergiTipi('BRUT')}
              className={`py-2 text-xs font-bold rounded-xl border ${
                vergiTipi === 'BRUT'
                  ? 'bg-blue-50 text-blue-600 border-blue-400'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600'
              }`}
            >
              KDV Dahil
            </button>
            <button
              type="button"
              onClick={() => setVergiTipi('NET_ODENECEK')}
              className={`py-2 text-xs font-bold rounded-xl border ${
                vergiTipi === 'NET_ODENECEK'
                  ? 'bg-blue-50 text-blue-600 border-blue-400'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600'
              }`}
            >
              Net Ele Geçen
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Tutar (₺)
          </label>
          <input
            type="number"
            value={vergiTutar}
            onChange={(e) => setVergiTutar(parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-base font-mono font-bold text-slate-800 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              KDV Oranı
            </label>
            <select
              value={vergiKdvOran}
              onChange={(e) => setVergiKdvOran(parseFloat(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
            >
              <option value={0.2}>%20 (Standart)</option>
              <option value={0.1}>%10 (İndirimli)</option>
              <option value={0.01}>%1 (İndirimli)</option>
              <option value={0.0}>%0 (Muaf)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Damga Vergisi
            </label>
            <select
              value={vergiDamgaOran}
              onChange={(e) => setVergiDamgaOran(parseFloat(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
            >
              <option value={0.00948}>Binde 9.48 (Hakediş / Sözleşme)</option>
              <option value={0.00569}>Binde 5.69 (İhale Karar Pulu)</option>
              <option value={0.00189}>Binde 1.89 (Kira Sözleşmesi)</option>
              <option value={0.0}>Muaf / Yok</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            KDV Tevkifat Türü
          </label>
          <select
            value={vergiTevkifatKod}
            onChange={(e) => setVergiTevkifatKod(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
          >
            {KDV_TEVKIFAT_KATALOGU.map((t) => (
              <option key={t.kod} value={t.kod}>
                {t.pay > 0 ? `${t.pay}/${t.payda} - ${t.ad}` : t.ad}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center justify-between">
          <span>Hesaplanan Vergi & Ödeme Tablosu</span>
          <span className="text-xs font-mono text-slate-400">KDV Tevkifatlı Çözümleme</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-xs text-slate-500 block">KDV Hariç Tutar</span>
            <span className="text-lg font-mono font-bold text-slate-900 dark:text-white">
              {formatTL(vergiSonuc.kdvHaricTutar)}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
            <span className="text-xs text-blue-600 dark:text-blue-400 block">
              Toplam Hesaplanan KDV
            </span>
            <span className="text-lg font-mono font-bold text-blue-900 dark:text-blue-100">
              {formatTL(vergiSonuc.hesaplananKdv)}
            </span>
          </div>
        </div>

        <div className="space-y-2 border-t border-b border-slate-100 dark:border-slate-800 py-3">
          <div className="flex justify-between text-xs py-1">
            <span className="text-slate-500">Tevkif Edilen KDV (İdarece Beyan Edilecek):</span>
            <span className="font-mono font-bold text-amber-600">
              {formatTL(vergiSonuc.tevkifatTutari)}
            </span>
          </div>
          <div className="flex justify-between text-xs py-1">
            <span className="text-slate-500">Yükleniciye Ödenecek KDV Payı:</span>
            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
              {formatTL(vergiSonuc.saticiyaOdenecekKdv)}
            </span>
          </div>
          <div className="flex justify-between text-xs py-1">
            <span className="text-slate-500">Damga Vergisi Kesintisi:</span>
            <span className="font-mono font-bold text-rose-600">
              -{formatTL(vergiSonuc.damgaVergisiTutari)}
            </span>
          </div>
          {vergiSonuc.kikPayiTutari > 0 && (
            <div className="flex justify-between text-xs py-1">
              <span className="text-slate-500">KİK Payı Kesintisi (Onbinde 5):</span>
              <span className="font-mono font-bold text-rose-600">
                -{formatTL(vergiSonuc.kikPayiTutari)}
              </span>
            </div>
          )}
        </div>

        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-800 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block">
              YÜKLENİCİYE ÖDENECEK NET TUTAR
            </span>
            <span className="text-2xl font-mono font-black text-emerald-900 dark:text-emerald-100">
              {formatTL(vergiSonuc.netOdenecekTutar)}
            </span>
          </div>
          <button
            type="button"
            onClick={() => copyText(formatTL(vergiSonuc.netOdenecekTutar))}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
          >
            {copied ? <Check size={14} /> : <Clipboard size={14} />}
            {copied ? 'Kopyalandı' : 'Kopyala'}
          </button>
        </div>
      </div>
    </div>
  )
}

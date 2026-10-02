import React, { useState } from 'react'
import { Calculator, Sparkles } from 'lucide-react'
import { belirleIhaleUsulu, AlimTuru } from '../../../utils/ihale'

export function UsulBelirleyiciTab(): React.JSX.Element {
  const [usulTutar, setUsulTutar] = useState<number>(850000)
  const [usulAlimTuru, setUsulAlimTuru] = useState<AlimTuru>('MAL')
  const [usulIdare, setUsulIdare] = useState<'BUYUKSEHIR_BELEDIYESI' | 'DIGER_BELEDIYE'>(
    'BUYUKSEHIR_BELEDIYESI'
  )
  const [usulMevzuat, setUsulMevzuat] = useState<'4734' | '2886'>('4734')

  const usulSonuc = belirleIhaleUsulu({
    tutar: usulTutar,
    alimTuru: usulAlimTuru,
    idareTipi: usulIdare,
    mevzuatKapsami: usulMevzuat
  })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
      <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Calculator size={16} className="text-blue-600" />
          Alım Parametreleri
        </h3>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Kapsam Kanunu
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setUsulMevzuat('4734')
                if (usulAlimTuru === 'KIRA_GELIR' || usulAlimTuru === 'SATIS_GELIR')
                  setUsulAlimTuru('MAL')
              }}
              className={`py-2 text-xs font-bold rounded-xl border ${
                usulMevzuat === '4734'
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 border-blue-400'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              4734 (Gider / Alım)
            </button>
            <button
              type="button"
              onClick={() => {
                setUsulMevzuat('2886')
                setUsulAlimTuru('KIRA_GELIR')
              }}
              className={`py-2 text-xs font-bold rounded-xl border ${
                usulMevzuat === '2886'
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 border-amber-400'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              2886 (Gelir / Kira / Satış)
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Tahmini Tutar / Yaklaşık Maliyet (₺)
          </label>
          <input
            type="number"
            value={usulTutar}
            onChange={(e) => setUsulTutar(parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-base font-mono font-bold text-slate-800 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            İş / Alım Türü
          </label>
          <select
            value={usulAlimTuru}
            onChange={(e) => setUsulAlimTuru(e.target.value as any)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
          >
            {usulMevzuat === '4734' ? (
              <>
                <option value="MAL">Mal Alımı</option>
                <option value="HIZMET">Hizmet Alımı</option>
                <option value="YAPIM">Yapım İşi</option>
                <option value="DANISMANLIK">Danışmanlık Hizmet Alımı</option>
              </>
            ) : (
              <>
                <option value="KIRA_GELIR">Taşınmaz Kiraya Verme (Dükkan, Büfe, Çay Ocağı)</option>
                <option value="SATIS_GELIR">Taşınmaz Satışı (Arsa, Konut)</option>
              </>
            )}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            İdare Türü
          </label>
          <select
            value={usulIdare}
            onChange={(e) => setUsulIdare(e.target.value as any)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
          >
            <option value="BUYUKSEHIR_BELEDIYESI">Büyükşehir Belediyesi / Bağlı İdare</option>
            <option value="DIGER_BELEDIYE">Diğer Belediyeler / İl Özel İdareleri</option>
          </select>
        </div>
      </div>

      <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Sparkles size={16} className="text-amber-500" />
            Önerilen Yasal Alım Usulü
          </h3>
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
            {usulSonuc.oncelikliUsulKodu}
          </span>
        </div>

        <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-slate-800 rounded-2xl border border-blue-200/80 dark:border-blue-800">
          <h4 className="text-base font-black text-blue-900 dark:text-blue-100">
            {usulSonuc.usulAdi}
          </h4>
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
            {usulSonuc.mevzuatDayanagi}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700 text-center">
            <span className="text-[10px] text-slate-400 block font-bold">KOMİSYON</span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
              {usulSonuc.komisyonGerekliMi ? 'Zorunlu' : 'Gerekmiyor'}
            </span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700 text-center">
            <span className="text-[10px] text-slate-400 block font-bold">İLAN SÜRESİ</span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
              {usulSonuc.ilanGerekliMi ? `${usulSonuc.ilanSuresiGun} Gün` : 'İlansız'}
            </span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700 text-center">
            <span className="text-[10px] text-slate-400 block font-bold">GEÇİCİ TEMİNAT</span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
              {usulSonuc.geciciTeminatGerekliMi ? `%${usulSonuc.geciciTeminatOraniYuzde}` : 'Yok'}
            </span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700 text-center">
            <span className="text-[10px] text-slate-400 block font-bold">KESİN TEMİNAT</span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
              {usulSonuc.kesinTeminatGerekliMi
                ? `%${usulSonuc.kesinTeminatOraniYuzde}`
                : 'İsteğe Bağlı'}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
            Mevzuat Notları & Yasal Hatırlatmalar
          </span>
          <ul className="space-y-1.5">
            {usulSonuc.uyariVeTavsiyeler.map((u, i) => (
              <li
                key={i}
                className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2"
              >
                <span className="text-blue-500 mt-0.5">•</span>
                <span>{u}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

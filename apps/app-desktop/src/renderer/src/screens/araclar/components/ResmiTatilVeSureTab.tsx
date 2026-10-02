import React, { useState } from 'react'
import { Calendar } from 'lucide-react'
import { hesaplaYasalSureler, ekleIsGunu } from '../../../utils/ihale'

export function ResmiTatilVeSureTab(): React.JSX.Element {
  const [sureBaslangic, setSureBaslangic] = useState<string>(new Date().toISOString().split('T')[0])
  const [sureIsGunu, setSureIsGunu] = useState<number>(15)

  const yasalSurePaketi = hesaplaYasalSureler(sureBaslangic)
  const hesaplananIsGunuTarihi = ekleIsGunu(sureBaslangic, sureIsGunu)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
      <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Calendar size={16} className="text-indigo-600" />
          Tarih ve Gün Parametreleri
        </h3>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Tebliğ / Karar / Başlangıç Tarihi
          </label>
          <input
            type="date"
            value={sureBaslangic}
            onChange={(e) => setSureBaslangic(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-800 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Eklenecek Net İş Günü (Tatiller Atlanır)
          </label>
          <input
            type="number"
            value={sureIsGunu}
            onChange={(e) => setSureIsGunu(parseInt(e.target.value, 10) || 0)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-base font-mono font-bold text-slate-800 dark:text-white"
          />
        </div>

        <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200 dark:border-indigo-800">
          <span className="text-xs text-indigo-700 dark:text-indigo-300 font-bold block">
            {sureIsGunu} İş Günü Sonrası Bitiş Tarihi:
          </span>
          <span className="text-lg font-bold text-indigo-950 dark:text-indigo-100 font-mono">
            {hesaplananIsGunuTarihi.toLocaleDateString('tr-TR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              weekday: 'long'
            })}
          </span>
        </div>
      </div>

      <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center justify-between">
          <span>Otomatik Hesaplanmış Yasal Süreler</span>
          <span className="text-[11px] text-slate-400">Resmi Tatil Korumalı</span>
        </h3>

        <div className="space-y-3">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                10 Günlük İhale İtiraz & Şikayet Süresi
              </span>
              <span className="text-[11px] text-slate-500">4734 Sayılı Kanun Madde 55</span>
            </div>
            <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
              {yasalSurePaketi.itirazSikayetSonTarih.toLocaleDateString('tr-TR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                weekday: 'short'
              })}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                10 Günlük Sözleşmeye Davet & İmza Süresi
              </span>
              <span className="text-[11px] text-slate-500">4734 Sayılı Kanun Madde 42</span>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {yasalSurePaketi.sozlesmeDavetSonTarih.toLocaleDateString('tr-TR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                weekday: 'short'
              })}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                15 İş Günü Bilgi Edinme Başvuru Süresi
              </span>
              <span className="text-[11px] text-slate-500">4982 Sayılı Kanun Madde 11</span>
            </div>
            <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">
              {yasalSurePaketi.bilgiEdinmeSonCevapTarihi.toLocaleDateString('tr-TR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                weekday: 'short'
              })}
            </span>
          </div>
        </div>

        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300">
          💡 <b>Mevzuat Kuralı:</b> Sürenin son günü ulusal bayram, resmi tatil veya hafta sonuna
          denk geldiğinde, süre tatili takip eden ilk iş günü mesai saati bitimine kadar uzar.
        </div>
      </div>
    </div>
  )
}

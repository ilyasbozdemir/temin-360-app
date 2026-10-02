import React, { useState } from 'react'
import {
  Gavel,
  Trophy,
  Users,
  Plus,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { TeklifVerenIstekli } from '../types/devletIhale2886.types'

export function IhaleGunuVeTekliflerTab(): React.JSX.Element {
  const [muhammenBedel] = useState<number>(1300000)

  const [istekliler, setIstekliler] = useState<TeklifVerenIstekli[]>([
    {
      id: '1',
      unvanVeyaAd: 'Kaya Mimarlık & İnşaat Ltd. Şti.',
      tcVkn: '5420194812',
      geciciTeminatYatirdiMi: true,
      teminatTutari: 39000,
      teklifler: [1300000, 1350000, 1420000, 1500000],
      sonTeklifTutari: 1500000,
      kazandiMi: true
    },
    {
      id: '2',
      unvanVeyaAd: 'Öztürk Ticaret - Mehmet ÖZTÜRK',
      tcVkn: '28491029482',
      geciciTeminatYatirdiMi: true,
      teminatTutari: 39000,
      teklifler: [1300000, 1340000, 1400000, 1480000],
      sonTeklifTutari: 1480000,
      kazandiMi: false
    },
    {
      id: '3',
      unvanVeyaAd: 'Ermenek Emlak ve Otomotiv A.Ş.',
      tcVkn: '3819204910',
      geciciTeminatYatirdiMi: true,
      teminatTutari: 39000,
      teklifler: [1300000, 1320000],
      sonTeklifTutari: 1320000,
      kazandiMi: false
    }
  ])

  const formatMoney = (n: number) =>
    n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const enYuksekTeklif = Math.max(...istekliler.map((i) => i.sonTeklifTutari))
  const kazanan = istekliler.find((i) => i.kazandiMi)
  const artisTutari = enYuksekTeklif - muhammenBedel
  const artisOrani = ((artisTutari / muhammenBedel) * 100).toFixed(1)

  return (
    <div className="space-y-4">
      {/* İhale Sonuç ve En Yüksek Teklif Paneli */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-blue-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 shadow-2xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-xs">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                İhalede Oluşan En Yüksek Teklif (Kazanan İstekli)
              </div>
              <div className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                {kazanan?.unvanVeyaAd}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-right">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold">
                Nihai İhale Bedeli
              </span>
              <div className="text-lg font-mono font-extrabold text-emerald-700 dark:text-emerald-300">
                ₺{formatMoney(enYuksekTeklif)}
              </div>
            </div>
            <div className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/60 rounded-lg text-[11px] font-bold text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700">
              +{artisOrani}% Artış (₺{formatMoney(artisTutari)})
            </div>
          </div>
        </div>
      </div>

      {/* İstekliler ve Açık Artırma Cetveli */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Gavel className="w-4 h-4 text-indigo-600" />
            İstekliler, Geçici Teminat ve Açık Artırma Turları
          </h3>
          <button
            type="button"
            className="px-2.5 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg border border-indigo-200 dark:border-indigo-800 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Yeni İstekli Ekle
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 bg-slate-50 dark:bg-slate-850">
                <th className="py-2.5 px-3 font-semibold">Sıra</th>
                <th className="py-2.5 px-3 font-semibold">İstekli Ünvanı / Adı</th>
                <th className="py-2.5 px-3 font-semibold">TCKN / VKN</th>
                <th className="py-2.5 px-3 font-semibold text-center">Geçici Teminat</th>
                <th className="py-2.5 px-3 font-semibold text-right">Başlangıç (Taban)</th>
                <th className="py-2.5 px-3 font-semibold text-right">Son Pey / Teklif</th>
                <th className="py-2.5 px-3 font-semibold text-center">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {istekliler.map((istekli, idx) => (
                <tr
                  key={istekli.id}
                  className={`hover:bg-slate-50/80 dark:hover:bg-slate-850 ${
                    istekli.kazandiMi
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20 font-medium'
                      : ''
                  }`}
                >
                  <td className="py-2.5 px-3 font-mono text-slate-400">{idx + 1}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-slate-200">
                    {istekli.unvanVeyaAd}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-500">{istekli.tcVkn}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                      <CheckCircle2 className="w-3 h-3" /> ₺{formatMoney(istekli.teminatTutari)}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-right text-slate-500">
                    ₺{formatMoney(muhammenBedel)}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-extrabold text-right text-slate-900 dark:text-slate-100 text-sm">
                    ₺{formatMoney(istekli.sonTeklifTutari)}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {istekli.kazandiMi ? (
                      <span className="inline-block text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-600 text-white shadow-2xs">
                        İhale Üzerinde Kaldı
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">Çekildi / Elendi</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

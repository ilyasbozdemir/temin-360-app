import React, { useState } from 'react'
import {
  CreditCard,
  TrendingUp,
  Calendar,
  ShieldCheck,
  Percent,
  Receipt,
  Download,
  AlertCircle
} from 'lucide-react'
import { IslemTuru2886 } from '../types/devletIhale2886.types'

interface Props {
  islemTuru: IslemTuru2886
}

export function KiraVeTahsilatTakipTab({ islemTuru }: Props): React.JSX.Element {
  const isKiralama = islemTuru === 'kiralama'

  // Satış Taksit Planı Verisi
  const [satisTaksitler] = useState([
    { no: 'Peşinat (%25)', vade: 'Sözleşme İmzası (Peşin)', tutar: 375000, durum: 'odendi' },
    { no: '1. Taksit', vade: '2026-06-15', tutar: 375000, durum: 'bekliyor' },
    { no: '2. Taksit', vade: '2026-09-15', tutar: 375000, durum: 'bekliyor' },
    { no: '3. Taksit', vade: '2026-12-15', tutar: 375000, durum: 'bekliyor' }
  ])

  // Kiralama Yıllık Artış & Tahsilat Verisi
  const [kiraPlani] = useState([
    { yil: '1. Yıl (2026)', aylikKira: 18500, yillikToplam: 222000, artis: 'Başlangıç İhale Bedeli' },
    { yil: '2. Yıl (2027)', aylikKira: 24975, yillikToplam: 299700, artis: '+%35.0 (TÜFE 12 Aylık Ort.)' },
    { yil: '3. Yıl (2028)', aylikKira: 32467, yillikToplam: 389604, artis: '+%30.0 (Tahmini TÜFE)' }
  ])

  const formatMoney = (n: number) =>
    n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div className="space-y-4">
      {isKiralama ? (
        <>
          {/* Kira Artış ve 5018 Gelir Entegrasyonu Bilgi Kartı */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-600 text-white rounded-lg">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200 uppercase tracking-wider">
                    Kira Artış ve Tahsilat Takip Modülü (5018 Sayılı Kanun Gelir Hesabı)
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Kira sözleşmelerinde her yıl TÜFE / Yİ-ÜFE 12 aylık ortalamalar oranında otomatik artış hesaplanır.
                  </p>
                </div>
              </div>
              <div className="text-right font-mono">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Güvence Depozitosu</span>
                <div className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                  ₺55.500,00 (3 Aylık)
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              Yıllık Kira Artış Projeksiyonu ve Dönemler
            </h4>

            <div className="space-y-2.5">
              {kiraPlani.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800 rounded-lg text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{item.yil}</span>
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                      {item.artis}
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-right">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Aylık Kira</span>
                      <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        ₺{formatMoney(item.aylikKira)}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Yıllık Toplam</span>
                      <div className="font-mono font-extrabold text-emerald-700 dark:text-emerald-300 text-sm">
                        ₺{formatMoney(item.yillikToplam)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Satış Tahsilat ve Taksit Planı */}
          <div className="bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 text-white rounded-lg">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-blue-900 dark:text-blue-200 uppercase tracking-wider">
                    Taşınmaz Satış Bedeli & Taksit Ödeme Takvimi
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    2886 kapsamında taksitli satışlarda peşinat tahsil edilmeden yer teslimi yapılmaz.
                  </p>
                </div>
              </div>
              <div className="text-right font-mono">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Toplam Satış Bedeli</span>
                <div className="text-base font-extrabold text-blue-700 dark:text-blue-300">
                  ₺1.500.000,00
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-600" />
              Taksit ve Tahsilat Çizelgesi
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 bg-slate-50 dark:bg-slate-850">
                    <th className="py-2.5 px-3 font-semibold">Taksit Tanımı</th>
                    <th className="py-2.5 px-3 font-semibold">Son Ödeme Vadesi</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Tutar</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Durum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {satisTaksitler.map((t, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-850">
                      <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-slate-200">
                        {t.no}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-400">
                        {t.vade}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-right text-slate-900 dark:text-slate-100">
                        ₺{formatMoney(t.tutar)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {t.durum === 'odendi' ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                            Tahsil Edildi (Makbuz Kesildi)
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                            Vadesi Bekleniyor
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

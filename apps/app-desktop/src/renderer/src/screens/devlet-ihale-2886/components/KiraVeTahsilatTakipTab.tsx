import React, { useState } from 'react'
import { CreditCard, TrendingUp, Calendar, Receipt, Plus } from 'lucide-react'
import { IslemTuru2886 } from '../types/devletIhale2886.types'

interface Props {
  islemTuru: IslemTuru2886
}

export function KiraVeTahsilatTakipTab({ islemTuru }: Props): React.JSX.Element {
  const isKiralama = islemTuru === 'kiralama'

  // Satış Taksit Planı Verisi
  const [satisTaksitler, setSatisTaksitler] = useState<
    Array<{ no: string; vade: string; tutar: number; durum: 'odendi' | 'bekliyor' }>
  >([])

  // Kiralama Yıllık Artış & Tahsilat Verisi
  const [kiraPlani, setKiraPlani] = useState<
    Array<{ yil: string; aylikKira: number; yillikToplam: number; artis: string }>
  >([])

  const formatMoney = (n: number): string =>
    n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const toplamSatisBedeli = satisTaksitler.reduce((acc, t) => acc + t.tutar, 0)
  const ilkYilAylik = kiraPlani[0]?.aylikKira || 0
  const guvenceDepozitosu = ilkYilAylik * 3

  const handleAddKiraYili = (): void => {
    const nextYilNum = kiraPlani.length + 1
    const currentYear = new Date().getFullYear() + kiraPlani.length
    const defaultAylik =
      ilkYilAylik > 0 ? Math.round(ilkYilAylik * Math.pow(1.3, nextYilNum - 1)) : 0
    setKiraPlani((prev) => [
      ...prev,
      {
        yil: `${nextYilNum}. Yıl (${currentYear})`,
        aylikKira: defaultAylik,
        yillikToplam: defaultAylik * 12,
        artis: nextYilNum === 1 ? 'Başlangıç İhale Bedeli' : '+%30 (Tahmini TÜFE / Yİ-ÜFE)'
      }
    ])
  }

  const handleAddTaksit = (): void => {
    const nextNo = satisTaksitler.length === 0 ? 'Peşinat' : `${satisTaksitler.length}. Taksit`
    setSatisTaksitler((prev) => [
      ...prev,
      {
        no: nextNo,
        vade: new Date().toISOString().split('T')[0],
        tutar: 0,
        durum: 'bekliyor'
      }
    ])
  }

  return (
    <div className="space-y-4">
      {isKiralama ? (
        <>
          {/* Kira Artış ve 5018 Gelir Entegrasyonu Bilgi Kartı */}
          <div className="bg-linear-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 shadow-2xs">
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
                    Kira sözleşmelerinde her yıl TÜFE / Yİ-ÜFE 12 aylık ortalamalar oranında
                    otomatik artış hesaplanır.
                  </p>
                </div>
              </div>
              <div className="text-right font-mono">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">
                  Güvence Depozitosu
                </span>
                <div className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                  ₺{formatMoney(guvenceDepozitosu)} (3 Aylık)
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                Yıllık Kira Artış Projeksiyonu ve Dönemler
              </h4>
              <button
                type="button"
                onClick={handleAddKiraYili}
                className="px-2.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg border border-emerald-200 dark:border-emerald-800 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Dönem / Yıl Ekle
              </button>
            </div>

            {kiraPlani.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400">
                <Calendar className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-xs font-medium">
                  Henüz kira artış ve tahsilat takvimi oluşturulmadı.
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Kiralama dönemleri ve tahmini TÜFE artış projeksiyonunu eklemek için &quot;Dönem /
                  Yıl Ekle&quot; butonunu kullanabilirsiniz.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {kiraPlani.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800 rounded-lg text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {item.yil}
                      </span>
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                        {item.artis}
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-right">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">
                          Aylık Kira
                        </span>
                        <div className="flex items-center gap-1 font-mono font-bold text-slate-800 dark:text-slate-200">
                          <span>₺</span>
                          <input
                            type="number"
                            value={item.aylikKira || ''}
                            placeholder="0"
                            onChange={(e) => {
                              const val = Number(e.target.value) || 0
                              const updated = [...kiraPlani]
                              updated[idx].aylikKira = val
                              updated[idx].yillikToplam = val * 12
                              setKiraPlani(updated)
                            }}
                            className="w-24 px-1.5 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-xs font-mono font-bold text-right"
                          />
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">
                          Yıllık Toplam
                        </span>
                        <div className="font-mono font-extrabold text-emerald-700 dark:text-emerald-300 text-sm">
                          ₺{formatMoney(item.yillikToplam)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                    2886 kapsamında taksitli satışlarda peşinat tahsil edilmeden yer teslimi
                    yapılmaz.
                  </p>
                </div>
              </div>
              <div className="text-right font-mono">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">
                  Toplam Satış Bedeli
                </span>
                <div className="text-base font-extrabold text-blue-700 dark:text-blue-300">
                  ₺{formatMoney(toplamSatisBedeli)}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-600" />
                Taksit ve Tahsilat Çizelgesi
              </h4>
              <button
                type="button"
                onClick={handleAddTaksit}
                className="px-2.5 py-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Taksit Ekle
              </button>
            </div>

            {satisTaksitler.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400">
                <CreditCard className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-xs font-medium">Henüz taksit veya ödeme planı eklenmedi.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Peşinat ve taksit vadelerini girmek için &quot;Taksit Ekle&quot; butonunu
                  kullanabilirsiniz.
                </p>
              </div>
            ) : (
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
                          <input
                            type="text"
                            value={t.no}
                            onChange={(e) => {
                              const updated = [...satisTaksitler]
                              updated[idx].no = e.target.value
                              setSatisTaksitler(updated)
                            }}
                            className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-xs font-bold w-36"
                          />
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-400">
                          <input
                            type="text"
                            value={t.vade}
                            onChange={(e) => {
                              const updated = [...satisTaksitler]
                              updated[idx].vade = e.target.value
                              setSatisTaksitler(updated)
                            }}
                            className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-xs w-44 font-mono"
                          />
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-right text-slate-900 dark:text-slate-100">
                          <div className="flex items-center justify-end gap-1">
                            <span>₺</span>
                            <input
                              type="number"
                              placeholder="0"
                              value={t.tutar || ''}
                              onChange={(e) => {
                                const updated = [...satisTaksitler]
                                updated[idx].tutar = Number(e.target.value) || 0
                                setSatisTaksitler(updated)
                              }}
                              className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-xs font-mono font-bold text-right w-32"
                            />
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...satisTaksitler]
                              updated[idx].durum =
                                updated[idx].durum === 'odendi' ? 'bekliyor' : 'odendi'
                              setSatisTaksitler(updated)
                            }}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
                              t.durum === 'odendi'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            }`}
                          >
                            {t.durum === 'odendi'
                              ? 'Tahsil Edildi (Makbuz Kesildi)'
                              : 'Vadesi Bekleniyor'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

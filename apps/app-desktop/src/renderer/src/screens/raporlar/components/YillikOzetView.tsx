import React from 'react'
import { TrendingUp, Building2, Layers, Award } from 'lucide-react'
import { useRaporlarData } from '../raporlar.hooks'

const fmt = (n: number) =>
  n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₺'

interface YillikOzetViewProps {
  yil: string
}

export const YillikOzetView: React.FC<YillikOzetViewProps> = ({ yil }) => {
  const { data: rows } = useRaporlarData(yil)

  const toplam = rows.reduce((s, r) => s + r.toplam_tutar, 0)
  const islemSayisi = rows.length
  const ortalama = islemSayisi > 0 ? toplam / islemSayisi : 0

  // En çok iş yapılan firmalar (Group by firma)
  const firmaStats = new Map<string, { count: number; total: number }>()
  for (const r of rows) {
    const name = r.kazanan_firma || 'Diğer / Teklif'
    if (!firmaStats.has(name)) {
      firmaStats.set(name, { count: 0, total: 0 })
    }
    const cur = firmaStats.get(name)!
    cur.count += 1
    cur.total += r.toplam_tutar
  }

  const topFirmalar = Array.from(firmaStats.entries())
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 5)

  // Alım türü dağılımı (Mal vs Hizmet vs Yapım)
  const turStats = new Map<string, number>()
  for (const r of rows) {
    const t = r.alim_turu || 'Mal Alımı'
    turStats.set(t, (turStats.get(t) || 0) + r.toplam_tutar)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            Yıllık Doğrudan Temin ve Harcama İcmali
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {yil} Bütçe Yılı Kümülatif İstatistikleri
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Yıllık Toplam Harcama',
            value: fmt(toplam),
            color: 'text-emerald-600 dark:text-emerald-400'
          },
          {
            label: 'Toplam İşlem Adedi',
            value: `${islemSayisi} Dosya`,
            color: 'text-blue-600 dark:text-blue-400'
          },
          {
            label: 'Ortalama Dosya Tutarı',
            value: fmt(ortalama),
            color: 'text-purple-600 dark:text-purple-400'
          },
          {
            label: 'Aktif İstekli / Firma',
            value: `${firmaStats.size} Firma`,
            color: 'text-orange-600 dark:text-orange-400'
          }
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs"
          >
            <div className="text-xs text-slate-500 font-semibold mb-1">{item.label}</div>
            <div className={`text-xl font-bold font-mono ${item.color}`}>{item.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* En Çok Alım Yapılan Firmalar */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-500" />
            En Çok Alım Yapılan Yükleniciler
          </div>
          {topFirmalar.length === 0 ? (
            <div className="text-xs text-slate-400 py-4">Kayıt bulunamadı.</div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {topFirmalar.map(([firma, stats], i) => (
                <div key={firma} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-[10px]">
                      {i + 1}
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                      {firma}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-slate-900 dark:text-slate-100">{fmt(stats.total)}</div>
                    <div className="text-[10px] text-slate-400">{stats.count} alım</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Alım Türü Dağılımı */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-indigo-500" />
            Alım Türü Harcama Dağılımı
          </div>
          {Array.from(turStats.entries()).map(([tur, tutar]) => {
            const pct = toplam > 0 ? (tutar / toplam) * 100 : 0
            return (
              <div key={tur} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{tur}</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                    {fmt(tutar)} (%{pct.toFixed(1)})
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

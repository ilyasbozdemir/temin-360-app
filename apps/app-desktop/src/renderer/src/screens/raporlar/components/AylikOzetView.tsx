import React from 'react'
import { Download, TrendingUp, BarChart2 } from 'lucide-react'
import { useRaporlarData } from '../raporlar.hooks'

const AYLAR = [
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık'
]

const fmt = (n: number) =>
  n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₺'

interface AylikOzetViewProps {
  yil: string
}

export const AylikOzetView: React.FC<AylikOzetViewProps> = ({ yil }) => {
  const { data: rows, loading } = useRaporlarData(yil)

  // Aylık dağılımı hesapla
  const aylikVeriler = AYLAR.map((ayAdi, idx) => {
    const monthNum = idx + 1
    const monthRows = rows.filter((r) => {
      const dStr = r.temin_tarihi || r.tarih || r.created_at
      if (!dStr) return false
      const m = parseInt(dStr.split('-')[1] || '', 10)
      return m === monthNum
    })

    const harcama = monthRows.reduce((sum, r) => sum + r.toplam_tutar, 0)
    return {
      ay: ayAdi,
      ayNo: monthNum,
      harcama,
      islem: monthRows.length
    }
  })

  const toplam = aylikVeriler.reduce((s, r) => s + r.harcama, 0)
  const toplamIslem = aylikVeriler.reduce((s, r) => s + r.islem, 0)
  const maxHarcama = Math.max(...aylikVeriler.map((r) => r.harcama), 1)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-indigo-600" />
            Aylık Doğrudan Temin Harcama Dağılımı
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {yil} Yılı • 12 Aylık Dönem İcmali
          </div>
        </div>
      </div>

      {/* Özet Kartlar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold mb-1">Yıllık Toplam Harcama</div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
            {fmt(toplam)}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold mb-1">Aylık Ortalama Harcama</div>
          <div className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
            {fmt(toplam / 12)}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold mb-1">Toplam İşlem Adedi</div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {toplamIslem} Dosya
          </div>
        </div>
      </div>

      {/* Aylık Çubuk Grafiği ve Tablo */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-indigo-500" />
          Aylık Harcama Çubukları
        </h4>

        <div className="space-y-3">
          {aylikVeriler.map((item) => {
            const pct = maxHarcama > 0 ? (item.harcama / maxHarcama) * 100 : 0
            return (
              <div key={item.ay} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-200 w-24">{item.ay}</span>
                  <span className="font-mono text-slate-500">{item.islem} işlem</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{fmt(item.harcama)}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

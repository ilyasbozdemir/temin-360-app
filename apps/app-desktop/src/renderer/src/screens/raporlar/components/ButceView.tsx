import React from 'react'
import { Wallet, ShieldAlert, CheckCircle2, Percent, TrendingUp } from 'lucide-react'
import { useRaporlarData } from '../raporlar.hooks'
import { denetleButceYuzdeOnSiniri, formatTL } from '../../../utils/ihale'

const fmt = (n: number) =>
  n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₺'

interface ButceViewProps {
  yil: string
}

export const ButceView: React.FC<ButceViewProps> = ({ yil }) => {
  const { data: rows } = useRaporlarData(yil)

  const kullanilanToplam = rows.reduce((s, r) => s + r.toplam_tutar, 0)

  // Dosyalarda girilmiş ödenek varsa kullan, yoksa varsayılan kurum bütçe referansı
  const odenekFromFiles = rows.find((r) => r.kullanilabilir_odenek)?.kullanilabilir_odenek
  const yillikLimit = odenekFromFiles
    ? parseFloat(odenekFromFiles.replace(/[^0-9.-]+/g, '')) || 50000000
    : 50000000

  const yuzdeOnTavan = yillikLimit * 0.1
  const kalanTavan = Math.max(yuzdeOnTavan - kullanilanToplam, 0)
  const gerceklesmePct = yillikLimit > 0 ? (kullanilanToplam / yillikLimit) * 100 : 0
  const tavanKullanimPct = yuzdeOnTavan > 0 ? (kullanilanToplam / yuzdeOnTavan) * 100 : 0

  const denetimSonuc = denetleButceYuzdeOnSiniri({
    yillikToplamOdenek: yillikLimit,
    oncekiHarcananToplam22d: 0,
    buAlimTutari: kullanilanToplam
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-purple-600" />
            4734 Sayılı Kanun Madde 62/ı & %10 Bütçe Durum Raporu
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {yil} Bütçe Yılı Ödenek Tavanı ve Kümülatif 22/d Harcama Durumu
          </div>
        </div>
      </div>

      {/* Genel Durum Kartı */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="text-xs text-slate-500 font-semibold">22/d Doğrudan Temin Kümülatif Harcama</div>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 font-mono">
              {fmt(kullanilanToplam)}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Yıllık %10 Tavan Limiti: <strong className="text-slate-700 dark:text-slate-300 font-mono">{fmt(yuzdeOnTavan)}</strong>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-purple-600 dark:text-purple-400 font-mono">
              %{tavanKullanimPct.toFixed(1)}
            </div>
            <div className="text-xs text-slate-400 font-semibold">%10 Tavan Doluluk Oranı</div>
          </div>
        </div>

        {/* Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              tavanKullanimPct > 100
                ? 'bg-rose-500'
                : tavanKullanimPct > 80
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(tavanKullanimPct, 100)}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300 pt-1">
          <span>
            Harcanan (22/d): <strong className="text-purple-600 font-mono">{fmt(kullanilanToplam)}</strong>
          </span>
          <span>
            Kalan %10 Payı: <strong className="text-emerald-600 font-mono">{fmt(kalanTavan)}</strong>
          </span>
        </div>
      </div>

      {/* 3'lü İcmal Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-slate-500">Yıllık Toplam Bütçe Ödeneği</div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">{fmt(yillikLimit)}</div>
          <div className="text-[11px] text-slate-400">Genel / İlgili Tertip Ödeneği</div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-slate-500">KİK İznisiz Azami 22/d Limiti</div>
          <div className="text-xl font-bold font-mono text-purple-600 dark:text-purple-400">{fmt(yuzdeOnTavan)}</div>
          <div className="text-[11px] text-slate-400">Ödeneğin %10&apos;luk Yasal Tavanı</div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-slate-500">Kalan Kullanılabilir Limit</div>
          <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">{fmt(kalanTavan)}</div>
          <div className="text-[11px] text-slate-400">%10 Sınırına Kalan Pay</div>
        </div>
      </div>

      {/* Sayıştay ve KİK Mevzuat Uyarı Kutusu */}
      <div
        className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-3 ${
          denetimSonuc.uyariSeviyesi === 'ASILDI'
            ? 'bg-rose-50 border-rose-300 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300'
            : denetimSonuc.uyariSeviyesi === 'YAKLASIYOR'
              ? 'bg-amber-50 border-amber-300 text-amber-800 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300'
              : 'bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
        }`}
      >
        {denetimSonuc.uyariSeviyesi === 'GUVENLI' ? (
          <CheckCircle2 size={20} className="shrink-0 text-emerald-600" />
        ) : (
          <ShieldAlert size={20} className="shrink-0" />
        )}
        <span>{denetimSonuc.mesaj}</span>
      </div>
    </div>
  )
}

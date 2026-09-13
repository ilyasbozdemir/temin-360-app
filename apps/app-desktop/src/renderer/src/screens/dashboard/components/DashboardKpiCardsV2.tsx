import React from 'react'
import { Building2, Coins, Scale, ShieldCheck, Users } from 'lucide-react'

interface DashboardKpiCardsV2Props {
  stats: any
  isLoading: boolean
  kikLimit: number
  formatCurrency: (value: number) => string
}

export const DashboardKpiCardsV2: React.FC<DashboardKpiCardsV2Props> = ({
  stats,
  isLoading,
  kikLimit,
  formatCurrency
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* Kart 1: Toplam Yaklaşık Maliyet & Bütçe */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Toplam Yaklaşık Maliyet
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {isLoading ? '...' : formatCurrency(stats.toplamYaklasikMaliyet)}
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/50">
            <Coins className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">KİK Eşik Durumu:</span>
          <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">
            {formatCurrency(kikLimit)} / limit
          </span>
        </div>
      </div>

      {/* Kart 2: Dosya & Süreç Hacmi */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-amber-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Toplam Doğrudan Temin
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {isLoading ? '...' : stats.ihaleDosyaSayisi}{' '}
              <span className="text-sm font-bold text-slate-400">Dosya</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-100 dark:border-amber-900/50">
            <Scale className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Aktif İşlemde:</span>
          <span className="font-bold text-amber-600 dark:text-amber-400">
            {stats.aktifDosyaSayisi || stats.ihaleDosyaSayisi} dosya açık
          </span>
        </div>
      </div>

      {/* Kart 3: İstekli Firma & Piyasa Katılımı */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Tedarikçi & İstekli Havuzu
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {isLoading ? '...' : stats.kayitliFirmaSayisi}{' '}
              <span className="text-sm font-bold text-slate-400">Firma</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/50">
            <Building2 className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Teklif Verenler:</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">
            {stats.ihalelereKatilanFirmaSayisi || stats.kayitliFirmaSayisi} katılım
          </span>
        </div>
      </div>

      {/* Kart 4: Personel & Mevzuat Uyum Skoru */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-rose-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Mevzuat & Denetim Güvencesi
            </span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-6 h-6" /> %100 Uyum
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-100 dark:border-rose-900/50">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Görevli Personel:</span>
          <span className="font-bold text-slate-800 dark:text-slate-200">
            {stats.kayitliPersonelSayisi} yetkili tanımlı
          </span>
        </div>
      </div>
    </div>
  )
}

import React from 'react'
import { ArrowUpRight, Sparkles } from 'lucide-react'
import { Komisyon } from '../types'

interface SurecAkisiHeaderProps {
  dosya: {
    dosyaNo: string
    teminTuru: string
    kanunMaddesi: string
    tarih: string
    sonTeklifTarihi: string
    durum: string
  }
  konu?: string
  komisyonlarCount: number
  stagesWithStatus: Array<{
    id: number
    title: string
    status: 'completed' | 'in-progress' | 'pending'
    progress: number
  }>
  onSelectTab: (tab: string) => void
}

export const SurecAkisiHeader: React.FC<SurecAkisiHeaderProps> = ({
  dosya,
  konu,
  komisyonlarCount,
  stagesWithStatus,
  onSelectTab
}) => {
  return (
    <div className="bg-white dark:bg-slate-955 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
            <Sparkles className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-855 dark:text-slate-100 flex items-center gap-2">
              Doğrudan Temin Süreci
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 uppercase tracking-widest">
                Canlı Takip
              </span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm font-medium">
              {dosya.kanunMaddesi} — {konu || 'Aktif temin dosyası takip ve yönetim merkezi'}
            </p>
          </div>
        </div>
        <span className="text-xs px-3 py-1.5 rounded-xl border font-bold bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800 shrink-0">
          {dosya.durum}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-1">
            Dosya Numarası
          </div>
          <div className="text-base font-extrabold text-slate-900 dark:text-slate-100 font-mono">
            {dosya.dosyaNo}
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-1">
            Temin Türü
          </div>
          <div className="text-base font-extrabold text-slate-900 dark:text-slate-100">
            {dosya.teminTuru}
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-1">
            Açılış Tarihi
          </div>
          <div className="text-base font-extrabold text-slate-900 dark:text-slate-100">
            {dosya.tarih}
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-1">
            Son Teklif Tarihi
          </div>
          <div className="text-base font-extrabold text-slate-900 dark:text-slate-100">
            {dosya.sonTeklifTarihi}
          </div>
        </div>
        <div className="bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <div className="text-xs text-blue-600 dark:text-blue-400 font-bold mb-1">
            Dosyanın Durumu
          </div>
          <div className="text-base font-extrabold text-blue-900 dark:text-blue-100">
            {dosya.durum}
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-1">
            Görevli Komisyon
          </div>
          <div className="text-base font-extrabold text-slate-900 dark:text-slate-100">
            {komisyonlarCount} Komisyon
          </div>
        </div>
      </div>

      {/* Mini Süreç Şeridi */}
      <button
        onClick={() => onSelectTab('surec')}
        className="w-full mt-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl px-5 py-3 flex items-center hover:border-blue-400 transition-colors group cursor-pointer"
      >
        {stagesWithStatus.map((stage, index) => (
          <React.Fragment key={stage.id}>
            <div className="flex items-center gap-2 shrink-0">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                  stage.status === 'completed'
                    ? 'bg-emerald-500 text-white'
                    : stage.status === 'in-progress'
                      ? 'bg-blue-600 text-white ring-4 ring-blue-500/20'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}
              >
                {stage.status === 'completed' ? '✓' : stage.id}
              </div>
              <span
                className={`hidden sm:inline text-xs whitespace-nowrap ${
                  stage.status === 'in-progress'
                    ? 'font-bold text-slate-900 dark:text-slate-100'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {stage.title}
              </span>
            </div>
            {index < stagesWithStatus.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 rounded-full ${
                  stage.status === 'completed' ? 'bg-emerald-400' : 'bg-slate-200 dark:bg-slate-800'
                }`}
              ></div>
            )}
          </React.Fragment>
        ))}
        <ArrowUpRight
          size={16}
          className="ml-3 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors shrink-0"
        />
      </button>
    </div>
  )
}

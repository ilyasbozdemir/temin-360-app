import React from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ArrowRight, FolderOpen, Sparkles, X } from 'lucide-react'
import { formatDosyaNo } from '../../../utils/formatDosyaNo'
import { cn } from '../../../utils/cn'

interface ActiveDosyaCardProps {
  activeDosya: any
  harcamaBirimAdi?: string
  getAsamaDetails: (asamaSira: number) => { name: string; color: string }
  getDtFileColor: (type?: string | null) => string
  getDtFileText: (type?: string | null) => string
  formatCurrency: (value: number) => string
  onOpenAi: (dosya: any) => void
  onClose: () => void
}

export const ActiveDosyaCard: React.FC<ActiveDosyaCardProps> = ({
  activeDosya,
  harcamaBirimAdi,
  getAsamaDetails,
  getDtFileColor,
  getDtFileText,
  formatCurrency,
  onOpenAi,
  onClose
}) => {
  const navigate = useNavigate()
  const asama = getAsamaDetails((activeDosya as any)?.durum_asama_id || 1)

  return (
    <div className="rounded-3xl p-6 bg-linear-to-r from-slate-900 via-indigo-950 to-blue-950 text-white shadow-xl border border-blue-500/30 relative overflow-hidden animate-in fade-in slide-in-from-top-3 duration-300">
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 -ml-16 -mb-16 w-60 h-60 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
        <div className="space-y-2.5 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-500/25 text-blue-200 border border-blue-400/40 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              AKTİF ÇALIŞILAN SÜREÇ DOSYASI
            </span>
            <span className="text-xs font-mono font-black px-2.5 py-1 rounded-lg bg-white/10 text-white border border-white/15">
              {formatDosyaNo(activeDosya)}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${asama.color}`}>
              {asama.name}
            </span>
            <span
              className={cn(
                'text-[10px] font-bold px-2 py-0.5 rounded-md border',
                getDtFileColor(activeDosya.tur)
              )}
            >
              {getDtFileText(activeDosya.tur)}
            </span>
          </div>

          <div>
            <h3 className="text-xl md:text-2xl font-black tracking-tight text-white line-clamp-1">
              {activeDosya.konu || 'Konu Belirtilmemiş Dosya'}
            </h3>
            <p className="text-xs text-blue-200/80 mt-1 flex flex-wrap items-center gap-3 font-medium">
              <span>
                🏢 Birim:{' '}
                <strong>
                  {activeDosya.harcama_birimi || harcamaBirimAdi || 'Birim Belirtilmedi'}
                </strong>
              </span>
              <span>•</span>
              <span>
                📅 Kayıt:{' '}
                <strong>
                  {activeDosya.dosya_acilis_tarihi
                    ? activeDosya.dosya_acilis_tarihi.substring(0, 10)
                    : 'Bugün'}
                </strong>
              </span>
              <span>•</span>
              <span className="text-emerald-300 font-bold font-mono">
                💰 Yaklaşık Maliyet: {formatCurrency(activeDosya.yaklasik_maliyet || 0)}
              </span>
            </p>
          </div>

          {/* Hızlı 4 Aşama Butonları */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => navigate({ to: '/dosya/hazirlik-ve-ihtiyac' })}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-blue-100 hover:text-white text-[11px] font-semibold border border-white/10 transition-colors cursor-pointer"
            >
              1. İhtiyaç & Onay
            </button>
            <button
              type="button"
              onClick={() => navigate({ to: '/dosya/piyasa-fiyat-arastirmasi' })}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-blue-100 hover:text-white text-[11px] font-semibold border border-white/10 transition-colors cursor-pointer"
            >
              2. Piyasa Araştırması
            </button>
            <button
              type="button"
              onClick={() => navigate({ to: '/dosya/siparis-ve-sozlesme' })}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-blue-100 hover:text-white text-[11px] font-semibold border border-white/10 transition-colors cursor-pointer"
            >
              3. Karar & Sözleşme
            </button>
            <button
              type="button"
              onClick={() => navigate({ to: '/dosya/kabul-ve-odeme' })}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-blue-100 hover:text-white text-[11px] font-semibold border border-white/10 transition-colors cursor-pointer"
            >
              4. Muayene & Ödeme
            </button>
          </div>
        </div>

        {/* Sağ Aksiyon Butonları */}
        <div className="flex flex-wrap lg:flex-nowrap items-center gap-2.5 shrink-0 w-full lg:w-auto">
          <button
            type="button"
            onClick={() => navigate({ to: '/takip' })}
            className="flex-1 lg:flex-none bg-blue-600 hover:bg-blue-500 text-white font-black text-xs py-3 px-5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <FolderOpen className="w-4 h-4" />
            <span>Dosya Süreç Takibini Aç</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onOpenAi(activeDosya)}
            className="p-3 rounded-2xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/40 text-purple-200 hover:text-white transition-all cursor-pointer"
            title="Bu Dosya İçin AI Karar Desteği Al"
          >
            <Sparkles className="w-4 h-4 text-purple-300" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-3 rounded-2xl bg-white/10 hover:bg-rose-500/20 border border-white/15 hover:border-rose-400/30 text-slate-300 hover:text-rose-200 transition-all cursor-pointer"
            title="Dosya Seçimini Kapat (Konsolide Genel Bakışa Dön)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

import React from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowRight, Bot, ChevronRight, KeyRound } from 'lucide-react'
import { cn } from '../../../utils/cn'

interface AiAdvisorCardProps {
  isAiConfigured: boolean
  kikLimit: number
  toplamYaklasikMaliyet: number
  onOpenConsultation: (config: { temin_no: string; konu: string; yaklasik_maliyet: number }) => void
  onShowAiMissing: () => void
}

export const AiAdvisorCard: React.FC<AiAdvisorCardProps> = ({
  isAiConfigured,
  kikLimit,
  toplamYaklasikMaliyet,
  onOpenConsultation,
  onShowAiMissing
}) => {
  return (
    <div className="p-6 rounded-3xl bg-slate-900 dark:bg-slate-950 text-white shadow-md border border-slate-800 relative overflow-hidden">
      <div className="absolute top-0 right-0 -mr-10 -mt-10 w-36 h-36 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
            <Bot className="w-4 h-4 text-purple-300" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-purple-200">
              TEMİN 360 AI Karar Desteği
            </h4>
            <span className="text-[10px] text-purple-300/80">4734 Sayılı Kanun & KİK Mevzuatı</span>
          </div>
        </div>

        {isAiConfigured ? (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Aktif
          </span>
        ) : (
          <Link
            to="/ayarlar"
            search={{ tab: 'ai' } as any}
            className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 flex items-center gap-1 cursor-pointer transition-colors shrink-0"
            title="API Anahtarı Tanımlamak İçin Ayarlar'a Git"
          >
            <KeyRound className="w-2.5 h-2.5" />
            <span>API Key Gerekli</span>
            <ArrowRight className="w-2.5 h-2.5" />
          </Link>
        )}
      </div>

      <p className="text-xs text-slate-300 leading-relaxed mb-4">
        Doğrudan temin lüzum yazıları, yaklaşık maliyet piyasa araştırması, hakediş raporları ve
        onay belgesi gerekçelerini mevzuata tam uyumlu olarak otomatik oluşturun.
      </p>

      {!isAiConfigured && (
        <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-200">
          <KeyRound className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-amber-300 text-[11px]">Yapay Zeka Servisi Yapılandırılmadı</p>
            <p className="text-[11px] text-amber-200/80 leading-relaxed">
              Mevzuat analizi ve karar desteğini aktifleştirmek için API anahtarınızı tanımlayın.
            </p>
            <Link
              to="/ayarlar"
              search={{ tab: 'ai' } as any}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 hover:text-amber-200 underline pt-0.5"
            >
              <span>Ayarlar &rarr; Yapay Zeka sekmesine git &rarr;</span>
            </Link>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <button
          type="button"
          onClick={() => {
            if (!isAiConfigured) {
              onShowAiMissing()
              return
            }
            onOpenConsultation({
              temin_no: 'MEVZUAT-REHBERI',
              konu: '4734 Sayılı Kamu İhale Kanunu 22/d Maddesi Kapsamında Alım Esasları',
              yaklasik_maliyet: kikLimit
            })
          }}
          className={cn(
            'w-full text-left p-2.5 rounded-xl border text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer',
            isAiConfigured
              ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-purple-100'
              : 'bg-slate-800/40 hover:bg-slate-800/80 border-slate-700/60 text-slate-300 hover:text-purple-100'
          )}
        >
          <span>💡 22/d Eşik Limit ve KDV Kuralları</span>
          <ChevronRight className="w-3.5 h-3.5 text-purple-300" />
        </button>

        <button
          type="button"
          onClick={() => {
            if (!isAiConfigured) {
              onShowAiMissing()
              return
            }
            onOpenConsultation({
              temin_no: 'DENETIM-KONTROL',
              konu: 'Sayıştay ve İç Denetim Standartlarına Göre Doğrudan Temin Dosya Hazırlığı',
              yaklasik_maliyet: toplamYaklasikMaliyet
            })
          }}
          className={cn(
            'w-full text-left p-2.5 rounded-xl border text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer',
            isAiConfigured
              ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-purple-100'
              : 'bg-slate-800/40 hover:bg-slate-800/80 border-slate-700/60 text-slate-300 hover:text-purple-100'
          )}
        >
          <span>🛡️ Sayıştay Denetim Kontrol Listesi</span>
          <ChevronRight className="w-3.5 h-3.5 text-purple-300" />
        </button>
      </div>
    </div>
  )
}

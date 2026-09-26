import React, { useState } from 'react'
import { ShieldCheck, Server, Lock, ChevronDown, ChevronUp, Info, Scale } from 'lucide-react'

interface OpenSourcePrivacyNoticeProps {
  compact?: boolean
  className?: string
}

export function OpenSourcePrivacyNotice({
  compact = false,
  className = ''
}: OpenSourcePrivacyNoticeProps): React.ReactNode {
  const [isExpanded, setIsExpanded] = useState(!compact)

  return (
    <div
      className={`rounded-2xl border border-blue-200/80 dark:border-blue-900/50 bg-linear-to-br from-blue-50/70 via-indigo-50/40 to-slate-50/70 dark:from-blue-950/25 dark:via-slate-900/40 dark:to-slate-900/40 shadow-sm transition-all duration-200 ${className}`}
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200/50 dark:border-blue-800/50">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100 flex items-center gap-1.5">
                  <span>Açık Kaynak Kod &amp; Yerel Veri Güvenliği</span>
                </h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                  %100 Yerel / On-Premise
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                  GPL / Non-Commercial
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Verileriniz kurumunuzda kalır; harici hiçbir sunucuya aktarılmaz.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-slate-450 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800/60 rounded-lg transition-colors shrink-0"
            title={isExpanded ? 'Detayları Daralt' : 'Detayları Göster'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-3.5 border-t border-blue-100 dark:border-blue-900/40 grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs text-slate-650 dark:text-slate-300">
            {/* 1. Veri Güvenliği ve Yerel Barındırma */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-blue-100/70 dark:border-slate-800 shadow-xs">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Server className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                  <span>Veriler Asla Dış Sunucuya Gitmez</span>
                  <Lock className="w-3 h-3 text-emerald-500" />
                </div>
                <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                  Tanımladığınız birimler, bütçe kodları, harcama yetkilileri ve ihale kayıtları
                  harici yabancı bir bulut sunucusuna gönderilmez. Tüm veriler yerel
                  bilgisayarınızda veya kurumunuzun kendi iç ağında kuracağınız yerel
                  hosting/sunucularda barınır.
                </p>
              </div>
            </div>

            {/* 2. Açık Kaynak Lisansı ve Özelleştirme */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-blue-100/70 dark:border-slate-800 shadow-xs">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                <Scale className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                  <span>Açık Kaynak Kod &amp; Özelleştirme Serbestisi</span>
                  <Info className="w-3 h-3 text-blue-500" />
                </div>
                <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                  Bu sistem açık kaynaklıdır. Kaynak kodları indirip kurumunuzun ihtiyaçlarına göre
                  dilediğiniz gibi özelleştirebilir ve geliştirebilirsiniz. Ancak lisans gereğince
                  <strong> ticari bir ürüne dönüştürülemez ve satılamaz.</strong>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

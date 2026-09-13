import React from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  ArrowRight,
  FileText,
  KeyRound,
  Layers,
  Plus,
  Search,
  Sparkles
} from 'lucide-react'
import { formatDosyaNo } from '../../../utils/formatDosyaNo'
import { cn } from '../../../utils/cn'

interface LivePipelineSectionProps {
  filteredDosyalar: any[]
  searchTerm: string
  setSearchTerm: (term: string) => void
  harcamaBirimAdi?: string
  getAsamaDetails: (asamaSira: number) => { name: string; color: string }
  getDtFileColor: (type?: string | null) => string
  getDtFileText: (type?: string | null) => string
  formatCurrency: (value: number) => string
  isAiConfigured: boolean
  onOpenDosya: (id: string | number) => void
  onAiConsult: (dosya: any) => void
}

export const LivePipelineSection: React.FC<LivePipelineSectionProps> = ({
  filteredDosyalar,
  searchTerm,
  setSearchTerm,
  harcamaBirimAdi,
  getAsamaDetails,
  getDtFileColor,
  getDtFileText,
  formatCurrency,
  isAiConfigured,
  onOpenDosya,
  onAiConsult
}) => {
  const navigate = useNavigate()

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Canlı Süreç Akış Hattı
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Hazırlıktan kabul ve ödemeye kadar doğrudan temin dosyaları
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Dosya no veya konu ara..."
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <Link to="/dosyalar/yeni">
            <button
              type="button"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1.5 px-3 rounded-xl cursor-pointer flex items-center gap-1 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Yeni</span>
            </button>
          </Link>
        </div>
      </div>

      {filteredDosyalar.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700">
          <FileText className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-60" />
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            Henüz Kayıtlı Dosya Bulunmuyor
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            Yeni bir doğrudan temin dosyası başlatarak 4 aşamalı satın alma sürecinizi anında devreye
            alın.
          </p>
          <Link to="/dosyalar/yeni">
            <button
              type="button"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-4 rounded-xl cursor-pointer"
            >
              İlk Dosyayı Oluştur
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDosyalar.slice(0, 6).map((dosya) => {
            const asamaInfo = getAsamaDetails((dosya as any).durum_asama_id || 1)

            return (
              <div
                key={dosya.id}
                onClick={() => onOpenDosya(dosya.id)}
                className="p-4 rounded-2xl bg-slate-50 hover:bg-white dark:bg-slate-800/50 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 hover:border-blue-400 dark:hover:border-blue-600 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group shadow-xs hover:shadow-sm cursor-pointer"
              >
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-black text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950/80 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
                      {formatDosyaNo(dosya)}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${asamaInfo.color}`}
                    >
                      {asamaInfo.name}
                    </span>
                    <span
                      className={cn(
                        'text-[10px] font-bold px-2 py-0.5 rounded-md border',
                        getDtFileColor(dosya.tur)
                      )}
                    >
                      {getDtFileText(dosya.tur)}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {dosya.konu || 'Konu belirtilmemiş'}
                  </h4>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-3 font-medium">
                    <span>
                      Birim: {dosya.harcama_birimi || harcamaBirimAdi || 'Genel Birim'}
                    </span>
                    <span>•</span>
                    <span>
                      Tarih:{' '}
                      {dosya.dosya_acilis_tarihi
                        ? dosya.dosya_acilis_tarihi.substring(0, 10)
                        : 'Bugün'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-slate-700">
                  <div className="text-right">
                    <div className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      {formatCurrency(dosya.yaklasik_maliyet || 0)}
                    </div>
                    <span className="text-[10px] text-slate-400">Yaklaşık Maliyet</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onAiConsult(dosya)
                      }}
                      className={cn(
                        'p-2 rounded-xl transition-all cursor-pointer border',
                        isAiConfigured
                          ? 'bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 text-purple-600 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                          : 'bg-slate-100 hover:bg-amber-50 dark:bg-slate-800/80 dark:hover:bg-amber-950/30 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-400/60'
                      )}
                      title={
                        isAiConfigured
                          ? 'TEMİN 360 AI Süreç Tavsiyesi Al'
                          : 'TEMİN 360 AI (API Anahtarı Gerekli - Yapılandırmak için tıklayın)'
                      }
                    >
                      {isAiConfigured ? (
                        <Sparkles className="w-3.5 h-3.5" />
                      ) : (
                        <KeyRound className="w-3.5 h-3.5 text-amber-500/80" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onOpenDosya(dosya.id)
                      }}
                      className="text-xs font-bold py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-950/50 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer flex items-center gap-1 transition-colors group-hover:border-blue-300 dark:group-hover:border-blue-700"
                    >
                      <span>Aç</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

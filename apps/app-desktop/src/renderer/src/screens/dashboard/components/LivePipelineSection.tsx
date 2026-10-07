import React from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowRight, FileText, KeyRound, Landmark, Layers, Plus, Search, Sparkles } from 'lucide-react'
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
  onOpenDosya: (id: string | number, dosya?: any) => void
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
            Canlı Süreç Akış Hattı & Dosyalar
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Doğrudan temin ve 2886 Devlet İhale süreçlerinin anlık operasyonel listesi
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Dosya no, ihale veya konu ara..."
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <Link to="/dosyalar/yeni">
            <button
              type="button"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1.5 px-3 rounded-xl cursor-pointer flex items-center gap-1 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Yeni Alım</span>
            </button>
          </Link>
          <Link to="/devlet-ihale-2886">
            <button
              type="button"
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-1.5 px-3 rounded-xl cursor-pointer flex items-center gap-1 shadow-xs"
            >
              <Landmark className="w-3.5 h-3.5" />
              <span>2886 İhale</span>
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
            Yeni bir doğrudan temin veya 2886 ihale dosyası başlatarak süreçlerinizi anında devreye alın.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link to="/dosyalar/yeni">
              <button
                type="button"
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-4 rounded-xl cursor-pointer"
              >
                Yeni Doğrudan Temin
              </button>
            </Link>
            <Link to="/devlet-ihale-2886">
              <button
                type="button"
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-4 rounded-xl cursor-pointer"
              >
                2886 İhale Masası
              </button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDosyalar.slice(0, 8).map((dosya) => {
            const is2886 = Boolean(dosya.ihaleKayitNo || dosya.islemTuru || dosya.tasinmaz)
            const asamaInfo = getAsamaDetails((dosya as any).durum_asama_id || 1)
            const bedel = is2886
              ? dosya.muhammenBedel?.hesaplananBedel ||
                dosya.muhammenBedel?.takdirEdilenMuhammenBedel ||
                (typeof dosya.muhammenBedel === 'number' ? dosya.muhammenBedel : 0)
              : dosya.yaklasik_maliyet || 0

            return (
              <div
                key={dosya.id}
                onClick={() => onOpenDosya(dosya.id, dosya)}
                className={cn(
                  'p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group shadow-xs hover:shadow-sm cursor-pointer',
                  is2886
                    ? 'bg-indigo-50/40 hover:bg-white dark:bg-indigo-950/20 dark:hover:bg-slate-800 border-indigo-200/70 dark:border-indigo-800/60 hover:border-indigo-400'
                    : 'bg-slate-50 hover:bg-white dark:bg-slate-800/50 dark:hover:bg-slate-800 border-slate-200/90 dark:border-slate-700/80 hover:border-blue-400 dark:hover:border-blue-600'
                )}
              >
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        'text-[11px] font-mono font-black px-2 py-0.5 rounded-md border',
                        is2886
                          ? 'text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-950/80 border-indigo-200 dark:border-indigo-800'
                          : 'text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950/80 border-blue-200 dark:border-blue-800'
                      )}
                    >
                      {is2886 ? dosya.ihaleKayitNo : formatDosyaNo(dosya)}
                    </span>
                    <span
                      className={cn(
                        'text-[10px] font-bold px-2 py-0.5 rounded-md border',
                        is2886
                          ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                          : asamaInfo.color
                      )}
                    >
                      {is2886 ? '2886 İhale Süreci' : asamaInfo.name}
                    </span>
                    <span
                      className={cn(
                        'text-[10px] font-bold px-2 py-0.5 rounded-md border',
                        is2886
                          ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                          : getDtFileColor(dosya.tur)
                      )}
                    >
                      {is2886
                        ? dosya.islemTuru === 'satis'
                          ? 'Taşınmaz Satış'
                          : dosya.islemTuru === 'kiralama'
                            ? 'Taşınmaz Kiralama'
                            : 'İrtifak / Trampa'
                        : getDtFileText(dosya.tur)}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {dosya.ihaleAdi || dosya.konu || 'Konu belirtilmemiş'}
                  </h4>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-3 font-medium">
                    <span>
                      Birim: {dosya.harcama_birimi || harcamaBirimAdi || (is2886 ? 'Emlak ve İstimlak Md.' : 'Genel Birim')}
                    </span>
                    <span>•</span>
                    <span>
                      Tarih:{' '}
                      {dosya.ihaleTarihi ||
                        (dosya.dosya_acilis_tarihi ? dosya.dosya_acilis_tarihi.substring(0, 10) : 'Bugün')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-slate-700">
                  <div className="text-right">
                    <div className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      {formatCurrency(bedel)}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {is2886 ? 'Muhammen Bedel' : 'Yaklaşık Maliyet'}
                    </span>
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
                          : 'TEMİN 360 AI (API Anahtarı Gerekli)'
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
                        onOpenDosya(dosya.id, dosya)
                      }}
                      className={cn(
                        'text-xs font-bold py-1.5 px-3 rounded-xl border cursor-pointer flex items-center gap-1 transition-colors',
                        is2886
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-950/50 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 group-hover:border-blue-300 dark:group-hover:border-blue-700'
                      )}
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

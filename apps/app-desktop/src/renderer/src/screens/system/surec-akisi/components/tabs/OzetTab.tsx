import React from 'react'
import { Clock, FileCheck2, Package, FileText, ArrowUpRight, Users, Check } from 'lucide-react'
import { Komisyon } from '../../types'
import { getLineColor, getKomisyonDurumBadge, getKomisyonDurumLabel } from '../../utils/helpers'

interface OzetTabProps {
  overallProgress: number
  pdfYuklenenSayisi: number
  belgelerLength: number
  toplamBedel: number
  kalemlerLength: number
  belgeTamamlanan: number
  stagesWithStatus: Array<{
    id: number
    title: string
    status: 'completed' | 'in-progress' | 'pending'
    progress: number
    tasks: Array<{ name: string; done: boolean; tab: string }>
  }>
  komisyonlar: Komisyon[]
  onSelectTab: (tab: string) => void
}

export const OzetTab: React.FC<OzetTabProps> = ({
  overallProgress,
  pdfYuklenenSayisi,
  belgelerLength,
  toplamBedel,
  kalemlerLength,
  belgeTamamlanan,
  stagesWithStatus,
  komisyonlar,
  onSelectTab
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in fade-in duration-300">
      <div className="bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="text-blue-600 dark:text-blue-400" size={24} />
          <div>
            <div className="text-xs text-blue-600 dark:text-blue-400 font-bold">Genel İlerleme</div>
            <div className="text-3xl font-black text-blue-900 dark:text-blue-100">
              {overallProgress}%
            </div>
          </div>
        </div>
        <div className="w-full bg-blue-200 dark:bg-blue-900/50 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          ></div>
        </div>
      </div>

      <div className="bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <FileCheck2 className="text-emerald-600 dark:text-emerald-400" size={24} />
          <div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
              İmzalı Evrak Teslimi
            </div>
            <div className="text-3xl font-black text-emerald-900 dark:text-emerald-100">
              {pdfYuklenenSayisi}/{belgelerLength}
            </div>
          </div>
        </div>
        <div className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
          {pdfYuklenenSayisi} belge imzalı PDF olarak sisteme yüklendi
        </div>
      </div>

      <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Package className="text-amber-600 dark:text-amber-400" size={24} />
          <div>
            <div className="text-xs text-amber-600 dark:text-amber-400 font-bold">Toplam Bedel</div>
            <div className="text-2xl font-black text-amber-900 dark:text-amber-100">
              {toplamBedel.toLocaleString('tr-TR')} ₺
            </div>
          </div>
        </div>
        <div className="text-xs text-amber-700 dark:text-amber-300 font-medium">
          {kalemlerLength} malzeme kalemi
        </div>
      </div>

      <div className="bg-purple-50/70 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="text-purple-600 dark:text-purple-400" size={24} />
          <div>
            <div className="text-xs text-purple-600 dark:text-purple-400 font-bold">
              Resmi Belgeler
            </div>
            <div className="text-3xl font-black text-purple-900 dark:text-purple-100">
              {belgeTamamlanan}/{belgelerLength}
            </div>
          </div>
        </div>
        <div className="text-xs text-purple-700 dark:text-purple-300 font-medium">
          İmzalandı olarak işaretlendi
        </div>
      </div>

      {/* Süreç Akışı Kartı */}
      <div className="md:col-span-4 bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="text-slate-500" size={18} />
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Süreç Akışı</h3>
          </div>
          <button
            onClick={() => onSelectTab('surec')}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            Tüm görevleri gör <ArrowUpRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {stagesWithStatus.map((stage) => {
            const doneCount = stage.tasks.filter((t) => t.done).length
            return (
              <button
                key={stage.id}
                onClick={() => onSelectTab('surec')}
                className="text-left border border-slate-150 dark:border-slate-800 rounded-xl p-3.5 hover:border-blue-400 hover:bg-blue-50/40 dark:hover:bg-blue-950/30 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      stage.status === 'completed'
                        ? 'bg-emerald-500 text-white'
                        : stage.status === 'in-progress'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {stage.status === 'completed' ? '✓' : stage.id}
                  </div>
                  <span className="text-xs font-bold text-slate-855 dark:text-slate-100 leading-tight">
                    {stage.title}
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mb-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${getLineColor(
                      stage.status
                    )}`}
                    style={{ width: `${stage.progress}%` }}
                  ></div>
                </div>
                <div className="text-[11px] text-slate-400 font-semibold">
                  {doneCount}/{stage.tasks.length} görev
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Komisyon İmza Takip Kartı */}
      <div className="md:col-span-4 bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Users className="text-slate-500" size={18} />
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
            Komisyon İmza Durum Takibi
          </h3>
        </div>
        <div className="space-y-4">
          {komisyonlar.map((k) => (
            <div key={k.id}>
              <div className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-2">
                <span>{k.tur}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-md border ${getKomisyonDurumBadge(k.durum)}`}
                >
                  {getKomisyonDurumLabel(k.durum)}
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                {k.uyeler.map((u) => (
                  <span
                    key={u.id}
                    className={`text-xs px-3 py-1.5 rounded-xl border font-bold flex items-center gap-1.5 ${
                      u.imza === 'imzaladı'
                        ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {u.imza === 'imzaladı' ? <Check size={14} className="text-emerald-600" /> : '◯'}{' '}
                    {u.adSoyad} — {u.gorev}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

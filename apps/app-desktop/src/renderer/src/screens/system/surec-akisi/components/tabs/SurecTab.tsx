import React from 'react'
import {
  Clock,
  ExternalLink,
  ChevronDown,
  ArrowUpRight,
  FileText,
  Filter,
  FileCheck2,
  Upload,
  Eye,
  Printer
} from 'lucide-react'
import { Belge } from '../../types'
import {
  getStatusColor,
  getStatusLabel,
  getLineColor,
  getBelgeDurumBadge,
  getBelgeDurumLabel
} from '../../utils/helpers'

interface SurecTabProps {
  stagesWithStatus: Array<{
    id: number
    title: string
    status: 'completed' | 'in-progress' | 'pending'
    progress: number
    tasks: Array<{ name: string; done: boolean; tab: string }>
  }>
  filteredBelgeler: Belge[]
  selectedAsamaFilter: string
  setSelectedAsamaFilter: (asama: string) => void
  onToggleTask: (stageId: number, taskIndex: number) => void
  onSelectTab: (tab: string) => void
  onPreview: (belge: Belge) => void
  onDosyalariEkle: (files: FileList | null, targetId: number) => void
  onNavigateCiktiMerkezi: () => void
}

export const SurecTab: React.FC<SurecTabProps> = ({
  stagesWithStatus,
  filteredBelgeler,
  selectedAsamaFilter,
  setSelectedAsamaFilter,
  onToggleTask,
  onSelectTab,
  onPreview,
  onDosyalariEkle,
  onNavigateCiktiMerkezi
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Üst Bilgi */}
      <div className="bg-white dark:bg-slate-955 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
            <Clock className="text-blue-600 dark:text-blue-400" size={18} />5 Adımda Doğrudan Temin
            Süreci Takibi
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Görev kutularına tıklayarak süreci tamamlayın. İlgili aşamanın belgelerini hemen
            altındaki matristen yönetin.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateCiktiMerkezi}
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl px-4 py-2 cursor-pointer transition-colors shadow-sm shadow-blue-500/20"
          >
            <ExternalLink size={14} /> Tüm Belgeler & Çıktı Merkezi
          </button>
        </div>
      </div>

      {/* 5 Aşama Şeridi */}
      <div className="flex flex-col md:flex-row items-stretch gap-3">
        {stagesWithStatus.map((stage, index) => (
          <React.Fragment key={stage.id}>
            <div className="flex-1 min-w-0 md:min-w-[190px] border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-955 overflow-hidden flex flex-col shadow-xs hover:border-blue-400 transition-all">
              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-2">
                  <div className="shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow-xs">
                    {stage.id}
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs leading-tight">
                    {stage.title}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-200 dark:bg-slate-800 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${getLineColor(
                        stage.status
                      )}`}
                      style={{ width: `${stage.progress}%` }}
                    ></div>
                  </div>
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-md border font-extrabold whitespace-nowrap ${getStatusColor(
                      stage.status
                    )}`}
                  >
                    {getStatusLabel(stage.status)}
                  </span>
                </div>
              </div>

              <div className="p-2 flex-1 space-y-1">
                {stage.tasks.map((task, taskIndex) => (
                  <div
                    key={taskIndex}
                    className="group flex items-center gap-2 px-2.5 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                  >
                    <button
                      onClick={() => onToggleTask(stage.id, taskIndex)}
                      className="shrink-0 w-4 h-4 rounded-md border-2 flex items-center justify-center transition-colors cursor-pointer"
                      style={{
                        borderColor: task.done ? '#10b981' : '#cbd5e1',
                        backgroundColor: task.done ? '#10b981' : 'transparent'
                      }}
                      title="Tamamlandı olarak işaretle"
                    >
                      {task.done && <span className="text-white text-[10px] font-bold">✓</span>}
                    </button>
                    <span
                      className={`flex-1 text-xs ${
                        task.done
                          ? 'text-slate-400 dark:text-slate-500 line-through'
                          : 'text-slate-800 dark:text-slate-200 font-semibold'
                      }`}
                    >
                      {task.name}
                    </span>
                    {task.tab && (
                      <button
                        onClick={() => onSelectTab(task.tab)}
                        className="shrink-0 text-slate-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="İlgili sekmeye git"
                      >
                        <ArrowUpRight size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {index < stagesWithStatus.length - 1 && (
              <>
                <div className="hidden md:flex items-center justify-center px-1">
                  <ChevronDown
                    className="text-slate-300 dark:text-slate-700 -rotate-90"
                    size={20}
                  />
                </div>
                <div className="flex md:hidden items-center justify-center py-1">
                  <ChevronDown className="text-slate-300 dark:text-slate-700" size={20} />
                </div>
              </>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Aşama Belgeleri Matrisi */}
      <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
              <FileText className="text-blue-600 dark:text-blue-400" size={18} />
              Aşamalara Göre Resmi Belgeler & İmzalı PDF Takibi
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Seçili aşamaya ait belgeleri önizleyin, imzalı PDF yükleyerek teslim durumunu
              onaylayın.
            </p>
          </div>

          {/* Aşama Filtresi */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <Filter size={14} className="text-slate-400 shrink-0 mr-1" />
            {[
              'Tümü',
              'İhtiyaç Tespiti',
              'Piyasa Araştırması',
              'Onay Süreci',
              'Teslim ve Kabul',
              'Ödeme İşlemleri'
            ].map((asama) => (
              <button
                key={asama}
                onClick={() => setSelectedAsamaFilter(asama)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedAsamaFilter === asama
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {asama}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBelgeler.map((b) => (
            <div
              key={b.id}
              className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-900/40 hover:border-blue-300 dark:hover:border-blue-800 transition-all flex flex-col justify-between space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 min-w-0">
                  <FileText
                    size={18}
                    className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5"
                  />
                  <div className="min-w-0">
                    <h5 className="font-bold text-slate-900 dark:text-slate-100 text-xs truncate">
                      {b.ad}
                    </h5>
                    <span className="text-[10px] text-slate-500 font-semibold">{b.asama}</span>
                  </div>
                </div>
                <span
                  className={`text-[9px] px-2 py-0.5 rounded-md border font-extrabold shrink-0 ${
                    b.pdfDosyaAdi
                      ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                      : getBelgeDurumBadge(b.durum)
                  }`}
                >
                  {b.pdfDosyaAdi ? '✓ PDF Teslim Alındı' : getBelgeDurumLabel(b.durum)}
                </span>
              </div>

              {b.pdfDosyaAdi && (
                <div className="text-[10px] text-emerald-700 dark:text-emerald-300 font-medium bg-emerald-50/80 dark:bg-emerald-950/30 p-2 rounded-lg border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-between">
                  <span className="truncate flex items-center gap-1">
                    <FileCheck2 size={12} /> {b.pdfDosyaAdi}
                  </span>
                  <span className="shrink-0 text-slate-400">{b.pdfBoyut}</span>
                </div>
              )}

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <label className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer">
                  <Upload size={12} /> PDF Yükle
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => onDosyalariEkle(e.target.files, b.id)}
                  />
                </label>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onPreview(b)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
                    title="Önizle"
                  >
                    <Eye size={15} />
                  </button>
                  <button
                    onClick={() => {
                      onPreview(b)
                      setTimeout(() => window.print(), 300)
                    }}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Yazdır"
                  >
                    <Printer size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

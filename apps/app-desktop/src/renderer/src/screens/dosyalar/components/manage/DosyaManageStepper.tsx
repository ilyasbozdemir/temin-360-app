import React from 'react'
import { cn } from '../../../../utils/cn'
import { FileEdit, FilePlus, Info, CheckCircle2 } from 'lucide-react'
import { formatDosyaNo } from '../../../../utils/formatDosyaNo'

export interface DosyaManageStepperProps {
  isEdit?: boolean
  formData?: any
  editId?: number | null
  activeTab: 'genel' | 'ihtiyac'
  setActiveTab: (tab: 'genel' | 'ihtiyac') => void
  activeSubStep: number
  setActiveSubStep: (step: number) => void
  onSelectIhtiyacTab: () => void
}

const SUB_STEP_LABELS = ['Genel & Antet', 'Mali & Bütçe', 'İhale & Teklif', 'Yetkililer'] as const

export const DosyaManageStepper: React.FC<DosyaManageStepperProps> = ({
  isEdit = false,
  formData = {},
  editId,
  activeTab,
  setActiveTab,
  activeSubStep,
  setActiveSubStep,
  onSelectIhtiyacTab
}) => {
  return (
    <div className="w-64 flex-none border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex flex-col p-4 space-y-6 overflow-y-auto">
      {/* Düzenleme Durum Kartı */}
      {isEdit && (
        <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/40 space-y-1.5">
          <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300">
            <FileEdit size={14} className="shrink-0" />
            <span className="text-[11px] font-bold">Düzenlenen Dosya</span>
          </div>
          <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
            {formData?.temin_no ? formatDosyaNo({ ...formData, id: editId }) : `#${editId || ''}`}
          </p>
          {formData?.konu && (
            <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-tight">
              {formData.konu}
            </p>
          )}
        </div>
      )}

      <div>
        <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
          {isEdit ? 'Yönetim Adımları' : 'Dosya Süreci Adımları'}
        </h3>

        <div className="space-y-4">
          {/* Adım 1: Genel Bilgiler */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setActiveTab('genel')}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all text-left cursor-pointer',
                activeTab === 'genel'
                  ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              )}
            >
              <span
                className={cn(
                  'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors',
                  activeTab === 'genel'
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                )}
              >
                1
              </span>
              Genel Bilgiler
            </button>

            {/* Genel Bilgiler Alt Adımları */}
            {activeTab === 'genel' && (
              <div className="pl-8 space-y-1 border-l border-slate-200 dark:border-slate-800 ml-5.5">
                {SUB_STEP_LABELS.map((label, i) => {
                  const stepId = i + 1
                  const isDone = stepId < activeSubStep
                  const isActive = stepId === activeSubStep
                  return (
                    <button
                      key={stepId}
                      type="button"
                      onClick={() => setActiveSubStep(stepId)}
                      className={cn(
                        'w-full text-left py-1 px-2 rounded-lg text-[11px] font-semibold flex items-center justify-between transition-colors cursor-pointer',
                        isActive
                          ? 'text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20'
                          : 'text-slate-550 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                      )}
                    >
                      <span>{label}</span>
                      {isDone && <CheckCircle2 size={12} className="text-blue-500 shrink-0" />}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Adım 2: İhtiyaç Listesi */}
          <button
            type="button"
            onClick={onSelectIhtiyacTab}
            className={cn(
              'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all text-left cursor-pointer',
              activeTab === 'ihtiyac'
                ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            )}
          >
            <span
              className={cn(
                'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors',
                activeTab === 'ihtiyac'
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700'
              )}
            >
              2
            </span>
            İhtiyaç Listesi &amp; Kalemler
          </button>
        </div>
      </div>

      {/* Kısayol Menüleri / Bilgilendirme */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3 mt-auto">
        <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Mevzuat ve Limit Notu
        </h4>
        <div className="bg-slate-50 dark:bg-slate-900/30 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60 flex items-start gap-2">
          <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
          <p className="text-[10px] text-slate-500 leading-relaxed">
            4734 sayılı KİK 22/d doğrudan temin limit kontrolü KDV hariç tutar üzerinden otomatik hesaplanır.
          </p>
        </div>
      </div>
    </div>
  )
}

import React from 'react'
import { Link } from '@tanstack/react-router'
import { CheckCircle2, HelpCircle, Layers } from 'lucide-react'

interface TakipAsamaStepperProps {
  stages: any[]
  currentAsamaSira: number
  stageRoutes: Record<number, string>
  stageShortLabels: Record<number, string>
}

export function TakipAsamaStepper({
  stages,
  currentAsamaSira,
  stageRoutes,
  stageShortLabels
}: TakipAsamaStepperProps): React.JSX.Element {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-2 border-b border-slate-100 dark:border-slate-800/60">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-250 flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600" />
          İşlem Aşaması İlerleme Durumu
        </h3>
        <Link
          to="/yardim"
          search={{ doc: 'dogrudan_temin_islem_sureci' }}
          className="text-xs font-semibold text-blue-600 hover:text-blue-750 dark:text-blue-400 dark:hover:text-blue-305 flex items-center gap-1.5 bg-blue-50 dark:bg-blue-955/20 px-3 py-1.5 rounded-xl border border-blue-100 dark:border-blue-900/40 transition-all cursor-pointer shadow-xs"
        >
          <HelpCircle className="w-3.5 h-3.5 animate-pulse" />
          İşlem Süreci Akış Şeması
        </Link>
      </div>

      {/* Progress Line stepper */}
      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8 md:gap-4 mt-4">
        {/* Horizontal connection line */}
        <div className="absolute top-5 left-5 right-5 h-1 bg-slate-100 dark:bg-slate-800 hidden md:block z-0" />

        {stages.map((asama, idx) => {
          const isCompleted = asama.asama_sira < currentAsamaSira
          const isActive = asama.asama_sira === currentAsamaSira
          const route = stageRoutes[asama.asama_sira] || '/dosya/hazirlik-ve-ihtiyac'
          const shortLabel = stageShortLabels[asama.asama_sira] || asama.asama_adi

          return (
            <Link
              to={route}
              key={
                asama.id
                  ? `stepper-stage-${asama.id}-${idx}`
                  : `stepper-sira-${asama.asama_sira}-${idx}`
              }
              className="flex md:flex-col items-start md:items-center text-left md:text-center flex-1 relative z-10 gap-3 md:gap-2 group cursor-pointer hover:-translate-y-0.5 transition-transform"
              title={`${asama.asama_sira}. Aşama: ${shortLabel} Ekranına Git`}
            >
              {/* Step node */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 shadow-sm ${
                  isCompleted
                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20 group-hover:bg-emerald-600'
                    : isActive
                      ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20 scale-110 group-hover:bg-blue-700'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 group-hover:border-blue-400 group-hover:text-blue-500'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                ) : (
                  <span className="text-xs font-black">{asama.asama_sira}</span>
                )}
              </div>

              {/* Step Labels */}
              <div className="flex flex-col md:items-center mt-1">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400 dark:text-slate-500">
                  {asama.asama_sira}. Aşama
                </span>
                <span
                  className={`text-xs font-extrabold transition-colors duration-200 mt-0.5 ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400'
                      : isCompleted
                        ? 'text-emerald-600 dark:text-emerald-500'
                        : 'text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                  }`}
                >
                  {shortLabel}
                </span>
                <p className="text-[10px] text-slate-450 dark:text-slate-400 mt-0.5 max-w-[160px] line-clamp-2 md:block hidden">
                  {asama.aciklama}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

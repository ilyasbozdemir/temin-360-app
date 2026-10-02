import React from 'react'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../../../utils/cn'
import { YeniDosyaTabProps } from '../types'
import { GenelBilgilerVeIdariAntetSection } from './components/genel-bilgiler/GenelBilgilerVeIdariAntetSection'
import { MaliAnalizVeButceSection } from './components/genel-bilgiler/MaliAnalizVeButceSection'
import { IhaleVeTeklifFinansalSection } from './components/genel-bilgiler/IhaleVeTeklifFinansalSection'
import { SorumlularVeSurecTarihleriSection } from './components/genel-bilgiler/SorumlularVeSurecTarihleriSection'

const SUB_STEP_COUNT = 4

export function GenelBilgilerTab(props: YeniDosyaTabProps): React.JSX.Element {
  const { onNextMainStep, activeSubStep = 1, setActiveSubStep } = props

  const goNext = () => {
    if (activeSubStep < SUB_STEP_COUNT) {
      setActiveSubStep?.((s) => s + 1)
    } else {
      onNextMainStep?.()
    }
  }

  const goPrev = () => {
    if (activeSubStep > 1) setActiveSubStep?.((s) => s - 1)
  }

  const isLast = activeSubStep === SUB_STEP_COUNT

  return (
    <div className="space-y-5">
      {/* ─── Section Content ─── */}
      <div className="animate-in fade-in slide-in-from-right-2 duration-300" key={activeSubStep}>
        {activeSubStep === 1 && <GenelBilgilerVeIdariAntetSection {...props} />}
        {activeSubStep === 2 && <MaliAnalizVeButceSection {...props} />}
        {activeSubStep === 3 && <IhaleVeTeklifFinansalSection {...props} />}
        {activeSubStep === 4 && <SorumlularVeSurecTarihleriSection {...props} />}
      </div>

      {/* ─── Sub-step Navigation ─── */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
        {/* Prev */}
        <button
          type="button"
          onClick={goPrev}
          className={cn(
            'flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border',
            activeSubStep === 1
              ? 'opacity-0 pointer-events-none'
              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer'
          )}
        >
          <ChevronLeft size={14} />
          Önceki
        </button>

        {/* Step dots */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: SUB_STEP_COUNT }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveSubStep?.(i + 1)}
              className={cn(
                'rounded-full transition-all duration-200 cursor-pointer',
                i + 1 === activeSubStep
                  ? 'w-5 h-2 bg-blue-600'
                  : i + 1 < activeSubStep
                    ? 'w-2 h-2 bg-blue-400'
                    : 'w-2 h-2 bg-slate-300 dark:bg-slate-600'
              )}
            />
          ))}
        </div>

        {/* Next */}
        <button
          type="button"
          onClick={goNext}
          className={cn(
            'flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer',
            isLast
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20'
              : 'bg-slate-800 dark:bg-slate-100 hover:bg-slate-900 dark:hover:bg-white text-white dark:text-slate-900'
          )}
        >
          {isLast ? (
            <>
              İhtiyaç Listesine Geç
              <ArrowRight size={14} />
            </>
          ) : (
            <>
              Sonraki
              <ChevronRight size={14} />
            </>
          )}
        </button>
      </div>
    </div>
  )
}

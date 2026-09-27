import React from 'react'
import { StepId } from './types'

interface SiparisStepperNavProps {
  activeStep: StepId
  onStepChange: (step: StepId) => void
  sozlesmeYapilacakMi?: boolean
}

export function SiparisStepperNav({
  activeStep,
  onStepChange,
  sozlesmeYapilacakMi = false
}: SiparisStepperNavProps) {
  const steps: StepId[] = [
    'teslimat',
    'sonuc_onay',
    'siparis',
    ...(sozlesmeYapilacakMi ? (['sozlesme'] as StepId[]) : [])
  ]

  const curIdx = steps.indexOf(activeStep)

  const handlePrev = () => {
    if (curIdx > 0) {
      onStepChange(steps[curIdx - 1])
    }
  }

  const handleNext = () => {
    if (curIdx >= 0 && curIdx < steps.length - 1) {
      onStepChange(steps[curIdx + 1])
    }
  }

  const isFirst = curIdx <= 0
  const isLast = curIdx === -1 || curIdx >= steps.length - 1

  return (
    <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 mt-1">
      <div className="flex items-center gap-2">
        {!isFirst && (
          <button
            type="button"
            onClick={handlePrev}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs cursor-pointer active:scale-95 transition-all"
          >
            ← Önceki Adım
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {!isLast && (
          <button
            type="button"
            onClick={handleNext}
            className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
          >
            <span>Sonraki Adım</span>
            <span>→</span>
          </button>
        )}
      </div>
    </div>
  )
}

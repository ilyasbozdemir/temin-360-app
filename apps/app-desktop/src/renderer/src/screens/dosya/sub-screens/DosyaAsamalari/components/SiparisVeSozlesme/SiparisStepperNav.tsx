import React from "react";
import { StepId } from "./types";

interface SiparisStepperNavProps {
  activeStep: StepId;
  onStepChange: (step: StepId) => void;
}

const ORDER: StepId[] = [
  "teslimat",
  "sonuc_onay",
  "yasaklilik",
  "siparis",
  "sozlesme",
  "timeline",
];

export function SiparisStepperNav({
  activeStep,
  onStepChange,
}: SiparisStepperNavProps) {
  const curIdx = ORDER.indexOf(activeStep);

  const handlePrev = () => {
    if (curIdx > 0) {
      onStepChange(ORDER[curIdx - 1]);
    }
  };

  const handleNext = () => {
    if (curIdx < ORDER.length - 1) {
      onStepChange(ORDER[curIdx + 1]);
    }
  };

  return (
    <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 mt-1">
      <div className="flex items-center gap-2">
        {activeStep !== "teslimat" && (
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
        {activeStep !== "timeline" && (
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
  );
}

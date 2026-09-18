import React from "react";
import { CheckCircle2 } from "lucide-react";

interface PiyasaFiyatStepperProps {
  currentStep: 1 | 2 | 3;
  setCurrentStep: (step: 1 | 2 | 3) => void;
  isStep1Done: boolean;
  isStep2Done: boolean;
  isStep3Done: boolean;
  invitedFirmsCount: number;
  activeWinnerFirma: any;
  mappedBelgelerCount: number;
}

export function PiyasaFiyatStepper({
  currentStep,
  setCurrentStep,
  isStep1Done,
  isStep2Done,
  isStep3Done,
  invitedFirmsCount,
  activeWinnerFirma,
  mappedBelgelerCount,
}: PiyasaFiyatStepperProps): React.JSX.Element {
  return (
    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-3 shadow-xs">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {/* Adım 1 Butonu */}
        <button
          type="button"
          onClick={() => setCurrentStep(1)}
          className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
            currentStep === 1
              ? "bg-blue-50/80 dark:bg-blue-950/40 border-blue-400 dark:border-blue-600 shadow-xs ring-2 ring-blue-500/20"
              : isStep1Done
              ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-50/80"
              : "bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:bg-slate-100/60"
          }`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
              currentStep === 1
                ? "bg-blue-600 text-white"
                : isStep1Done
                ? "bg-emerald-600 text-white"
                : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
            }`}
          >
            {isStep1Done ? <CheckCircle2 className="w-4 h-4" /> : "1"}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate flex items-center gap-1.5">
              <span>1. İstekliler & Dağıtım</span>
              {isStep1Done && (
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  ({invitedFirmsCount} Firma)
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
              Firma seçimi & dağıtım mektupları
            </div>
          </div>
        </button>

        {/* Adım 2 Butonu */}
        <button
          type="button"
          onClick={() => setCurrentStep(2)}
          className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
            currentStep === 2
              ? "bg-blue-50/80 dark:bg-blue-950/40 border-blue-400 dark:border-blue-600 shadow-xs ring-2 ring-blue-500/20"
              : isStep2Done
              ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-50/80"
              : "bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:bg-slate-100/60"
          }`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
              currentStep === 2
                ? "bg-blue-600 text-white"
                : isStep2Done
                ? "bg-emerald-600 text-white"
                : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
            }`}
          >
            {isStep2Done ? <CheckCircle2 className="w-4 h-4" /> : "2"}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate flex items-center gap-1.5">
              <span>2. Teklif Fiyatları & Kazanan</span>
              {activeWinnerFirma && (
                <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 truncate">
                  (Kazanan Belirlendi)
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
              Toplanan teklifleri gir & değerlendir
            </div>
          </div>
        </button>

        {/* Adım 3 Butonu */}
        <button
          type="button"
          onClick={() => setCurrentStep(3)}
          className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
            currentStep === 3
              ? "bg-blue-50/80 dark:bg-blue-950/40 border-blue-400 dark:border-blue-600 shadow-xs ring-2 ring-blue-500/20"
              : isStep3Done
              ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-50/80"
              : "bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:bg-slate-100/60"
          }`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
              currentStep === 3
                ? "bg-blue-600 text-white"
                : isStep3Done
                ? "bg-emerald-600 text-white"
                : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
            }`}
          >
            {isStep3Done ? <CheckCircle2 className="w-4 h-4" /> : "3"}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate flex items-center gap-1.5">
              <span>3. Tutanak & Maliyet Çıktıları</span>
              {mappedBelgelerCount > 0 && (
                <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                  ({mappedBelgelerCount} Belge)
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
              Piyasa tutanağı & yaklaşık maliyet
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

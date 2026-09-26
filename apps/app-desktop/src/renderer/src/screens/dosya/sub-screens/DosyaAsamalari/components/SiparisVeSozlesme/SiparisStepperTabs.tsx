import React from "react";
import {
  Building2,
  CheckCircle2,
  Clock,
  FileCheck,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { cn } from "../../../../../../utils/cn";
import { StepId } from "./types";

interface Props {
  activeStep: StepId;
  setActiveStep: (step: StepId) => void;
  sozlesmeYapilacakMi: boolean;
}

export const SiparisStepperTabs: React.FC<Props> = ({
  activeStep,
  setActiveStep,
  sozlesmeYapilacakMi,
}) => {
  const steps = [
    {
      id: "teslimat" as StepId,
      stepNum: 1,
      label: "Teslimat & Şartlar",
      sub: "Süre ve Koşullar",
      icon: Clock,
    },
    {
      id: "sonuc_onay" as StepId,
      stepNum: 2,
      label: "Karar & Sonuç Onayı",
      sub: "Sonuç & Bütçe Onayı",
      icon: FileCheck,
    },
    {
      id: "siparis" as StepId,
      stepNum: 3,
      label: "Onay Sonrası: Sipariş",
      sub: "Kabul & Sipariş Formu",
      icon: Building2,
    },
    {
      id: "sozlesme" as StepId,
      stepNum: 4,
      label: "Onay Sonrası: Sözleşme",
      sub: sozlesmeYapilacakMi ? "Zorunlu Sözleşme" : "İsteğe Bağlı",
      icon: CheckCircle2,
    },
    {
      id: "timeline" as StepId,
      stepNum: "★",
      label: "Tüm Süreç Akışı",
      sub: "Özet Görünüm",
      icon: Sparkles,
    },
  ];

  return (
    <div className="bg-slate-100/80 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-1.5 shadow-2xs flex items-center justify-between gap-1 overflow-x-auto">
      {steps.map((step) => {
        const isActive = activeStep === step.id;
        const StepIcon = step.icon;
        return (
          <button
            key={step.id}
            type="button"
            onClick={() => setActiveStep(step.id)}
            className={cn(
              "flex-1 min-w-35 px-3 py-2 rounded-xl flex items-center gap-2.5 transition-all text-left cursor-pointer border",
              isActive
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border-slate-300 dark:border-slate-700"
                : "bg-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 border-transparent hover:bg-white/50 dark:hover:bg-slate-800/50",
            )}
          >
            <div
              className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 transition-colors",
                isActive
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
              )}
            >
              {typeof step.stepNum === "number"
                ? (
                  step.stepNum
                )
                : <StepIcon className="w-3.5 h-3.5" />}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-extrabold truncate leading-tight">
                {step.label}
              </span>
              <span className="text-[10px] text-slate-400 truncate leading-tight">
                {step.sub}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};

import React from "react";
import { Layers } from "lucide-react";

interface TakipAsamaAciklamalariProps {
  stages: any[];
  currentAsamaSira: number;
}

export function TakipAsamaAciklamalari({
  stages,
  currentAsamaSira,
}: TakipAsamaAciklamalariProps): React.JSX.Element {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
        Aşama Detayları ve Açıklamalar
      </h3>

      {stages.map((asama, idx) => {
        const isActive = asama.asama_sira === currentAsamaSira;
        const isCompleted = asama.asama_sira < currentAsamaSira;

        return (
          <div
            key={asama.id
              ? `detail-stage-${asama.id}-${idx}`
              : `detail-sira-${asama.asama_sira}-${idx}`}
            className={`p-5 rounded-2xl border transition-all duration-300 flex items-start gap-4 ${
              isActive
                ? "bg-blue-50/50 dark:bg-blue-950/10 border-blue-200 dark:border-blue-900/50 shadow-xs"
                : isCompleted
                ? "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-850 opacity-80"
                : "bg-slate-50/40 dark:bg-slate-900/20 border-slate-100 dark:border-slate-900/50 opacity-60"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                isActive
                  ? "bg-blue-600 text-white"
                  : isCompleted
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-400"
              }`}
            >
              <Layers className="w-4 h-4" />
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {asama.asama_sira}. Aşama: {asama.asama_adi}
                </h4>
                {isActive && (
                  <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 bg-blue-100/50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full border border-blue-500/10 uppercase tracking-wider">
                    Aktif İşlem Aşaması
                  </span>
                )}
                {isCompleted && (
                  <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-500 bg-emerald-100/50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/10 uppercase tracking-wider">
                    Tamamlandı
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed">
                {asama.aciklama || "Bu aşama için bir açıklama girilmemiş."}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

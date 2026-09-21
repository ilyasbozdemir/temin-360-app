import React from "react";
import { Award, FileSpreadsheet } from "lucide-react";
import { cn } from "@renderer/utils/cn";

import { PiyasaFiyatFormTabSwitcherProps } from "./types";

export function PiyasaFiyatFormTabSwitcher({
  activeFormTab,
  setActiveFormTab,
}: PiyasaFiyatFormTabSwitcherProps): React.JSX.Element {
  return (
    <div className="bg-slate-100/70 dark:bg-slate-950/60 p-2 px-4 md:px-8 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveFormTab("matrix")}
          className={cn(
            "px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
            activeFormTab === "matrix"
              ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200 dark:border-slate-700"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200",
          )}
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-blue-500" />
          <span>💰 Fiyat & Teklif Matrisi</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFormTab("comparison")}
          className={cn(
            "px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
            activeFormTab === "comparison"
              ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200 dark:border-slate-700"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200",
          )}
        >
          <Award className="w-3.5 h-3.5 text-indigo-500" />
          <span>📊 Kademeli Karşılaştırma Matrisi (Öncesi vs Sonrası)</span>
        </button>
      </div>
    </div>
  );
}

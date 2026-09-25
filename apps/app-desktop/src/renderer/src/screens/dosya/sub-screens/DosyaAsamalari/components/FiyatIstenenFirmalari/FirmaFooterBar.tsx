import React from "react";
import { Calculator } from "lucide-react";
import { FirmaFooterBarProps, MIN_FIRMS } from "./types";

export function FirmaFooterBar({
  addedCount,
  onFiyatGir,
}: FirmaFooterBarProps): React.JSX.Element | null {
  if (addedCount < MIN_FIRMS || !onFiyatGir) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-2.5 bg-emerald-50/50 dark:bg-emerald-950/20 border-t border-emerald-100 dark:border-emerald-900/40">
      <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-200">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
        <span>
          <strong>{addedCount} İstekli Firma</strong>{" "}
          belirlendi. Teklif mektuplarını dağıttıktan sonra toplanan fiyatları
          girebilirsiniz:
        </span>
      </div>
      <button
        type="button"
        onClick={onFiyatGir}
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer border-0 shrink-0"
        title="Toplanan teklif fiyatlarını girmek için 2. adıma geç"
      >
        <Calculator className="w-3.5 h-3.5" />
        <span>2. Adım: Toplanan Fiyatları Gir ➔</span>
      </button>
    </div>
  );
}

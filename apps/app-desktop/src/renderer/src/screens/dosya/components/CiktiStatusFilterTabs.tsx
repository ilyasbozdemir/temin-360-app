import React from "react";
import { CheckCircle2, Layers, Printer } from "lucide-react";

export type StatusFilterType = "all" | "ready" | "starred" | "printed";

interface CiktiStatusFilterTabsProps {
  statusFilter: StatusFilterType;
  setStatusFilter: (filter: StatusFilterType) => void;
  totalCount: number;
  readyCount: number;
  starredCount: number;
  printedCount: number;
}

export function CiktiStatusFilterTabs({
  statusFilter,
  setStatusFilter,
  totalCount,
  readyCount,
  starredCount,
  printedCount,
}: CiktiStatusFilterTabsProps): React.JSX.Element {
  return (
    <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 dark:bg-slate-800/60 rounded-2xl mb-4 text-xs font-semibold overflow-x-auto border border-slate-200/60 dark:border-slate-800">
      <button
        onClick={() => setStatusFilter("all")}
        className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
          statusFilter === "all"
            ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-xs font-bold"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
        }`}
      >
        <Layers className="w-3.5 h-3.5 text-blue-500" />
        Tüm Belgeler
        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300">
          {totalCount}
        </span>
      </button>

      <button
        onClick={() => setStatusFilter("ready")}
        className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
          statusFilter === "ready"
            ? "bg-emerald-500 text-white shadow-xs font-bold"
            : "text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
        }`}
      >
        <CheckCircle2 className="w-3.5 h-3.5" />
        Yazdırmaya Hazır
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
            statusFilter === "ready"
              ? "bg-emerald-600 text-white"
              : "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300"
          }`}
        >
          {readyCount}
        </span>
      </button>

      <button
        onClick={() => setStatusFilter("starred")}
        className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
          statusFilter === "starred"
            ? "bg-amber-500 text-white shadow-xs font-bold"
            : "text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40"
        }`}
      >
        <span>⭐</span>
        Hızlı Erişim
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
            statusFilter === "starred"
              ? "bg-amber-600 text-white"
              : "bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300"
          }`}
        >
          {starredCount}
        </span>
      </button>

      <button
        onClick={() => setStatusFilter("printed")}
        className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
          statusFilter === "printed"
            ? "bg-blue-600 text-white shadow-xs font-bold"
            : "text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40"
        }`}
      >
        <Printer className="w-3.5 h-3.5" />
        Yazdırılanlar
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
            statusFilter === "printed"
              ? "bg-blue-700 text-white"
              : "bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300"
          }`}
        >
          {printedCount}
        </span>
      </button>
    </div>
  );
}

import React from "react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";

interface KabulFilterBarProps {
  totalCount: number;
  approvedCount: number;
  pendingCount: number;
  filterStatus: "all" | "approved" | "pending";
  setFilterStatus: (status: "all" | "approved" | "pending") => void;
}

export function KabulFilterBar({
  totalCount,
  approvedCount,
  pendingCount,
  filterStatus,
  setFilterStatus,
}: KabulFilterBarProps): React.JSX.Element {
  return (
    <div className="px-5 py-2.5 bg-slate-50/90 dark:bg-slate-800/40 border-b border-slate-200/70 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 min-w-0">
        <Info className="w-4 h-4 text-blue-500 shrink-0" />
        <span className="leading-relaxed">
          <strong className="text-slate-800 dark:text-slate-200">
            Parçalı / Aşamalı Teslimat:
          </strong>{" "}
          Birden fazla muayene kabul tutanağı eklenebilir. Stok ve kabul
          miktarlarından yalnızca{" "}
          <strong className="text-emerald-700 dark:text-emerald-300 font-bold">
            Onaylı (İşleme Alınan)
          </strong>{" "}
          tutanaklar düşülür.
        </span>
      </div>

      {/* Filtreleme Butonları */}
      {totalCount > 0 && (
        <div className="flex items-center gap-1.5 shrink-0 self-start md:self-center">
          <button
            type="button"
            onClick={() => setFilterStatus("all")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filterStatus === "all"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
            }`}
          >
            Tümü ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus("approved")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
              filterStatus === "approved"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60"
            }`}
          >
            <CheckCircle2 size={12} />
            <span>Onaylı ({approvedCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus("pending")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
              filterStatus === "pending"
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60"
            }`}
          >
            <AlertCircle size={12} />
            <span>Onay Bekleyen ({pendingCount})</span>
          </button>
        </div>
      )}
    </div>
  );
}

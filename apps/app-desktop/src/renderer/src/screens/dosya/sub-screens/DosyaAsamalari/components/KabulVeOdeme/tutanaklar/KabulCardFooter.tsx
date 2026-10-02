import React from "react";
import { FirmaStats } from "../types";

interface KabulCardFooterProps {
  effectiveTeklifTutar: number;
  firmaStats?: FirmaStats;
  formatCurrency: (val: number | null) => string;
}

export function KabulCardFooter({
  effectiveTeklifTutar,
  firmaStats,
  formatCurrency,
}: KabulCardFooterProps): React.JSX.Element {
  return (
    <div className="p-3.5 px-5 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 gap-2">
      <div className="flex items-center gap-4">
        <span>
          Toplam Kabul Bedeli:{" "}
          <strong className="text-slate-700 dark:text-slate-200 font-bold">
            {formatCurrency(effectiveTeklifTutar)}
          </strong>
        </span>
        {firmaStats?.yaklasikMaliyet && (
          <span>
            Yaklaşık Maliyet:{" "}
            <strong className="text-slate-700 dark:text-slate-200 font-bold">
              {formatCurrency(firmaStats.yaklasikMaliyet)}
            </strong>
          </span>
        )}
      </div>
      <span className="text-[10px] text-slate-400">
        * Muayene kabul tutanağı onaylandıktan sonra ödeme emri ve taşınır fişi düzenlenebilir.
      </span>
    </div>
  );
}

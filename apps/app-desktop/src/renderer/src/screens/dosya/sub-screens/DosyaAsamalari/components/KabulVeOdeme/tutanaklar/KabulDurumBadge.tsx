import React from "react";
import { AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";

interface KabulDurumBadgeProps {
  durum?: string;
  onaylandi?: boolean;
}

export function KabulDurumBadge({
  durum,
  onaylandi,
}: KabulDurumBadgeProps): React.JSX.Element {
  const isApproved = onaylandi ?? true;
  return (
    <div className="flex flex-col gap-1 items-start">
      {durum === "kismi" && (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50">
          🔶 Kısmi Kabul
        </span>
      )}
      {durum === "sartli" && (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50">
          ⚠️ Şartlı Kabul
        </span>
      )}
      {durum === "red" && (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800/50">
          ❌ Reddedildi
        </span>
      )}
      {(durum === "kabul" || !durum) && (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
          <CheckCircle2 className="w-3 h-3" />
          <span>Kabul Edildi</span>
        </span>
      )}
      {isApproved ? (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200/70 dark:border-blue-800/60">
          <ShieldCheck className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400" />
          <span>İşleme Alındı (Stok Düşüldü)</span>
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800/60">
          <AlertCircle className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
          <span>Onay Bekliyor</span>
        </span>
      )}
    </div>
  );
}

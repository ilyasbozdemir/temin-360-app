import React from "react";
import { formatMoney } from "../types";

interface InspectorFirmalarTabProps {
  firmalar: any[];
}

export const InspectorFirmalarTab: React.FC<InspectorFirmalarTabProps> = ({
  firmalar,
}) => {
  if (firmalar.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs italic">
        Bu dosyaya teklif isteyen firma atanmamış.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {firmalar.map((f, idx) => (
          <div
            key={f.id || idx}
            className={`p-3.5 rounded-xl border ${
              f.kazandi_mi
                ? "border-emerald-500/60 bg-emerald-50/20 dark:bg-emerald-950/20"
                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100">
                {f.unvan || "Firma"}
              </h4>
              {f.kazandi_mi && (
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-600 text-white font-extrabold shrink-0">
                  Kazanan
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 space-y-0.5">
              <div>
                Yetkili: <strong>{f.yetkili || "-"}</strong>
              </div>
              <div>
                VN: <strong>{f.vergi_no || "-"}</strong> | Tel:{" "}
                <strong>{f.telefon || "-"}</strong>
              </div>
            </div>
            <div className="mt-2.5 pt-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-bold">Teklif Tutarı:</span>
              <span className="font-mono font-black text-slate-850 dark:text-slate-100">
                ₺{formatMoney(f.toplam_teklif_tutari)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

import React from "react";
import { Award, Calendar } from "lucide-react";

interface PiyasaFiyatFormSettingsBarProps {
  formMode: "maliyet" | "tutanak";
  hesaplamaEsasi: string;
  maliyetCetveliTarihi: string;
  setMaliyetCetveliTarihi: (val: string) => void;
  tutanakTarihi: string;
  setTutanakTarihi: (val: string) => void;
  setLowestFirmAsWinner: boolean;
  setSetLowestFirmAsWinner: (val: boolean) => void;
  manualWinnerFirmaId: number | null;
  setManualWinnerFirmaId: (id: number | null) => void;
  invitedFirms: any[];
}

export function PiyasaFiyatFormSettingsBar({
  formMode,
  hesaplamaEsasi,
  maliyetCetveliTarihi,
  setMaliyetCetveliTarihi,
  tutanakTarihi,
  setTutanakTarihi,
  setLowestFirmAsWinner,
  setSetLowestFirmAsWinner,
  manualWinnerFirmaId,
  setManualWinnerFirmaId,
  invitedFirms,
}: PiyasaFiyatFormSettingsBarProps): React.JSX.Element {
  return (
    <div className="bg-slate-50/90 dark:bg-slate-900/80 p-3 px-4 md:px-8 flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-100 dark:border-slate-800/40">
      {/* Dates & Basis Info */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-slate-500 dark:text-slate-400 font-medium">
          Hesaplama Yöntemi:{" "}
          <strong className="text-slate-700 dark:text-slate-200 font-semibold">
            {hesaplamaEsasi}
          </strong>
        </span>

        <span className="text-slate-300 dark:text-slate-700">•</span>

        {/* Date Inputs */}
        {formMode !== "tutanak" && (
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs h-9">
            <Calendar className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              Maliyet Cetveli Tarihi:
            </span>
            <input
              type="date"
              value={maliyetCetveliTarihi}
              onChange={(e) => setMaliyetCetveliTarihi(e.target.value)}
              className="bg-transparent border-none text-xs font-extrabold focus:outline-none cursor-pointer text-slate-800 dark:text-slate-100 w-28"
            />
          </div>
        )}

        {formMode !== "maliyet" && (
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs h-9">
            <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              Tutanak Tarihi:
            </span>
            <input
              type="date"
              value={tutanakTarihi}
              onChange={(e) => setTutanakTarihi(e.target.value)}
              className="bg-transparent border-none text-xs font-extrabold focus:outline-none cursor-pointer text-slate-800 dark:text-slate-100 w-28"
            />
          </div>
        )}
      </div>

      {/* Winner Firm Settings */}
      <div className="flex flex-wrap items-center gap-2.5">
        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs h-9 cursor-pointer select-none hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
          <input
            type="checkbox"
            checked={setLowestFirmAsWinner}
            onChange={(e) => setSetLowestFirmAsWinner(e.target.checked)}
            className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer accent-indigo-600"
          />
          <span className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-500 shrink-0" />
            <span>En Düşük Teklifi Kazanan Yap</span>
          </span>
        </label>

        {!setLowestFirmAsWinner && invitedFirms.length > 0 && (
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-xl border border-amber-300/60 dark:border-amber-900/60 h-9">
            <span className="text-amber-700 dark:text-amber-400 shrink-0 font-semibold">
              Kazanan Firma:
            </span>
            <select
              value={manualWinnerFirmaId ?? ""}
              onChange={(e) =>
                setManualWinnerFirmaId(
                  e.target.value ? Number(e.target.value) : null,
                )}
              className="bg-transparent border-none text-xs font-extrabold focus:outline-none cursor-pointer text-slate-800 dark:text-slate-200 max-w-45 truncate"
            >
              <option value="">-- Firma Seç --</option>
              {invitedFirms.map((f, idx) => (
                <option
                  key={`winner_firm_${f.id || f.firma_id}_${idx}`}
                  value={f.firma_id}
                >
                  {f.unvan}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}

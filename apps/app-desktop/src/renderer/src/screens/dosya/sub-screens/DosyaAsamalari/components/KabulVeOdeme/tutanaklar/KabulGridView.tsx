import React from "react";
import {
  Calendar,
  Edit2,
  FileText,
  MapPin,
  MessageSquareText,
  Receipt,
  Trash2,
  Truck,
} from "lucide-react";
import { Button } from "../../../../../../../components/ui/Button";
import { KabulTutanakItem } from "../types";
import { KabulDurumBadge } from "./KabulDurumBadge";

interface KabulGridViewProps {
  tutanaklar: KabulTutanakItem[];
  filteredTutanaklar: KabulTutanakItem[];
  effectiveFirma: string;
  effectiveTeklifTutar: number;
  effectiveTeslimAlan: string;
  effectiveTeslimYeri: string;
  faturaNo?: string;
  faturaTarihi?: string;
  irsaliyeNo?: string;
  irsaliyeTarihi?: string;
  dosyaNo?: string;
  primarySablonKey: string;
  formatDate: (dateStr: string | null) => string;
  formatCurrency: (val: number | null) => string;
  onOpenPreview?: (sablonKey: string, tutanak?: KabulTutanakItem) => void;
  onEditTutanak?: (tutanak: KabulTutanakItem) => void;
  onDeleteTutanak?: (id: string) => void;
}

export function KabulGridView({
  tutanaklar,
  filteredTutanaklar,
  effectiveFirma,
  effectiveTeklifTutar,
  effectiveTeslimAlan,
  effectiveTeslimYeri,
  faturaNo = "",
  faturaTarihi = "",
  irsaliyeNo = "",
  irsaliyeTarihi = "",
  dosyaNo = "",
  primarySablonKey,
  formatDate,
  formatCurrency,
  onOpenPreview,
  onEditTutanak,
  onDeleteTutanak,
}: KabulGridViewProps): React.JSX.Element {
  const items =
    filteredTutanaklar.length > 0
      ? filteredTutanaklar
      : tutanaklar.length === 0
      ? [
          {
            id: "default_1",
            tutanakNo: "KT-2026-001",
            tutanakTarihi:
              faturaTarihi || new Date().toISOString().slice(0, 10),
            faturaNo: faturaNo || dosyaNo || "1",
            faturaTarihi,
            irsaliyeNo,
            irsaliyeTarihi,
            durum: "kabul" as const,
            tutar: effectiveTeklifTutar,
            teslimYeri: effectiveTeslimYeri,
            teslimAlan: effectiveTeslimAlan,
          },
        ]
      : [];

  return (
    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((tut) => {
        const rowFaturaNo = tut.faturaNo || faturaNo;
        const rowIrsaliyeNo = tut.irsaliyeNo || irsaliyeNo;

        return (
          <div
            key={tut.id}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs border border-blue-100 dark:border-blue-900/60">
                  <FileText className="w-4 h-4" />
                </div>
                <KabulDurumBadge
                  durum={tut.durum}
                  onaylandi={tut.onaylandi}
                />
              </div>
              <div className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400">
                {tut.tutanakNo}
              </div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate mt-1">
                {effectiveFirma}
              </div>
              <div className="text-[11px] text-slate-500 mt-2 space-y-1">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>Tarih: {formatDate(tut.tutanakTarihi)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                  <span className="truncate">
                    {tut.teslimYeri || effectiveTeslimYeri}
                  </span>
                </div>
                {rowFaturaNo && (
                  <div className="flex items-center gap-1.5 font-mono text-emerald-700 dark:text-emerald-400">
                    <Receipt className="w-3 h-3 text-emerald-500 shrink-0" />
                    <span className="truncate">Fat: {rowFaturaNo}</span>
                  </div>
                )}
                {rowIrsaliyeNo && (
                  <div className="flex items-center gap-1.5 font-mono text-blue-700 dark:text-blue-400">
                    <Truck className="w-3 h-3 text-blue-500 shrink-0" />
                    <span className="truncate">İrs: {rowIrsaliyeNo}</span>
                  </div>
                )}
                {tut.notlar && (
                  <div
                    className="flex items-center gap-1.5 text-[10px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-200/60 dark:border-slate-700/60 mt-1"
                    title={tut.notlar}
                  >
                    <MessageSquareText className="w-3 h-3 text-indigo-500 shrink-0" />
                    <span className="truncate">{tut.notlar}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                {tut.tutar
                  ? formatCurrency(tut.tutar)
                  : formatCurrency(effectiveTeklifTutar)}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  onClick={() => onOpenPreview?.(primarySablonKey, tut)}
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-xs text-blue-600 border-blue-200 cursor-pointer"
                >
                  Aç
                </Button>
                {tut.id !== "default_1" && onEditTutanak && (
                  <button
                    type="button"
                    onClick={() => onEditTutanak(tut)}
                    className="p-1 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
                    title="Tutanağı Düzenle"
                  >
                    <Edit2 size={13} />
                  </button>
                )}
                {tut.id !== "default_1" && onDeleteTutanak && (
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        window.confirm(
                          `"${tut.tutanakNo}" numaralı tutanağı silmek istediğinizden emin misiniz?`,
                        )
                      ) {
                        onDeleteTutanak(tut.id);
                      }
                    }}
                    className="p-1 rounded text-slate-400 hover:text-red-600 cursor-pointer"
                    title="Tutanağı Sil"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

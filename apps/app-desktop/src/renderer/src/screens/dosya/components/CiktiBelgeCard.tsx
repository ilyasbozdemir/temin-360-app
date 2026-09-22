import React from "react";
import {
  AlertCircle,
  CheckCircle2,
  CheckSquare,
  Lock,
  Printer,
  Square,
  Unlock,
} from "lucide-react";
import { Sablon } from "../../sablonlar/sablonlar.hooks";
import { BelgeAksiyonlari } from "../../../components/ui/BelgeAksiyonlari";
import { CURRENT_APP_VERSION } from "../../../store/printQueueStore";

interface CiktiBelgeCardProps {
  sablon: Sablon;
  isSelected: boolean;
  missingMsg: string | null;
  docStatus: "draft" | "ready_to_print" | "printed" | "modified";
  isLocked: boolean;
  lockInfo: { lockedAtVersion?: string } | null;
  activeDosyaId: number | null;
  dosyaContext: any;
  contextsByPath: any;
  onToggleSelect: (id: number) => void;
  onUnlock: (docKey: string, docName: string) => void;
  onToggleReady: (docKey: string, docName: string) => void;
  onPreview: (sablon: Sablon) => void;
  onQuickPrint: (sablonId: number) => void;
  onExport: (format: "pdf" | "udf" | "docx", sablonId: number) => void;
  onOpenExternal: (sablon: Sablon) => void;
}

export function CiktiBelgeCard({
  sablon,
  isSelected,
  missingMsg,
  docStatus,
  isLocked,
  lockInfo,
  onToggleSelect,
  onUnlock,
  onToggleReady,
  onPreview,
  onQuickPrint,
  onExport,
  onOpenExternal,
}: CiktiBelgeCardProps): React.JSX.Element {
  const docKey = (sablon.dosya_adi || "").replace(/\.html$/, "");

  return (
    <div
      key={`cikti_${sablon.id}_${docKey}`}
      onClick={() => onToggleSelect(sablon.id)}
      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
        missingMsg
          ? "bg-slate-50 border-slate-200 opacity-70 cursor-not-allowed dark:bg-slate-900 dark:border-slate-800"
          : isSelected
          ? "bg-blue-50/50 border-blue-200 text-blue-800 cursor-pointer dark:bg-blue-900/20 dark:border-blue-800/50 dark:text-blue-300"
          : "bg-white border-slate-200 text-slate-700 cursor-pointer hover:border-blue-300 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-300 dark:hover:border-slate-700"
      }`}
    >
      <div className="shrink-0">
        {missingMsg ? (
          <span title={missingMsg ?? undefined}>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </span>
        ) : isSelected ? (
          <CheckSquare className="w-4 h-4 text-blue-600" />
        ) : (
          <Square className="w-4 h-4 text-slate-300 dark:text-slate-600" />
        )}
      </div>

      <div className="flex-1 min-w-0" title={missingMsg || sablon.ad}>
        <div className="flex items-center gap-1.5 flex-wrap">
          <p
            className={`text-xs font-bold truncate ${
              missingMsg ? "text-slate-500 line-through" : ""
            }`}
          >
            {sablon.ad}
          </p>

          {isLocked && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300/50">
              <Lock className="w-2.5 h-2.5 text-amber-500" />{" "}
              {lockInfo?.lockedAtVersion || CURRENT_APP_VERSION} Kilitli
            </span>
          )}

          {!isLocked && docStatus === "ready_to_print" && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300/50">
              <CheckCircle2 className="w-2.5 h-2.5" /> Hazır
            </span>
          )}

          {!isLocked && docStatus === "modified" && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300/50">
              Kontrol Bekliyor
            </span>
          )}

          {!isLocked && docStatus === "printed" && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-300/50">
              <Printer className="w-2.5 h-2.5" /> Yazdırıldı
            </span>
          )}
        </div>

        <p
          className="text-[10px] text-slate-500 truncate mt-0.5"
          title={sablon.dosya_adi}
        >
          {sablon.dosya_adi}
        </p>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {isLocked && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onUnlock(docKey, sablon.ad);
            }}
            className="p-1 rounded-lg border text-amber-500 hover:text-amber-700 border-amber-200 dark:border-amber-800"
            title="Yazdırma Kilidini Aç"
          >
            <Unlock className="w-3.5 h-3.5" />
          </button>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleReady(docKey, sablon.ad);
          }}
          className={`p-1 rounded-lg border transition-all ${
            docStatus === "ready_to_print"
              ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/60 dark:border-emerald-800 hover:bg-emerald-100"
              : "text-slate-400 hover:text-emerald-600 hover:border-emerald-300 border-slate-200 dark:border-slate-800"
          }`}
          title={
            docStatus === "ready_to_print"
              ? "Yazdırmaya hazır işaretini kaldır"
              : "Yazdırmaya hazır olarak işaretle"
          }
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
        </button>

        <BelgeAksiyonlari
          onPreview={() => onPreview(sablon)}
          onQuickPrint={() => onQuickPrint(sablon.id)}
          onExport={(fmt) => onExport(fmt, sablon.id)}
          docName={sablon.ad}
          onOpenExternal={() => onOpenExternal(sablon)}
          disabled={!!missingMsg}
        />
      </div>
    </div>
  );
}

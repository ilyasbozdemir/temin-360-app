import React, { useState } from "react";
import { Eye, FileText, Info, Plus, Users } from "lucide-react";
import { TemplateRegistryService } from "@temin360/document-templates";
import { MemberRow } from "./types";

interface HizliKadroToolbarProps {
  rows: MemberRow[];
  onLoadStandardTemplate: () => void;
  onAddRow: (gorevAd?: string, asil?: number) => void;
}

export const HizliKadroToolbar: React.FC<HizliKadroToolbarProps> = ({
  rows,
  onAddRow,
}) => {
  const [showTemplateInfo, setShowTemplateInfo] = useState(false);
  const asilCount = rows.filter((r) => r.asilMi === 1 && r.personelId).length;
  const yedekCount = rows.filter((r) => r.asilMi === 0 && r.personelId).length;
  const visibleCount = rows.filter((r) => r.belgedeGoster).length;

  const compatibleTemplates = TemplateRegistryService.getTemplatesByCapability("supportsCommission");

  return (
    <div className="relative flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl mb-3">
      {/* İstatistik Rozetleri */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Users className="w-4 h-4 text-blue-600" />
          Toplam: <span className="text-blue-600 font-mono">{rows.length}</span>
        </span>
        <span className="text-slate-300 dark:text-slate-700">•</span>
        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
          {asilCount} Asil
        </span>
        <span className="text-slate-300 dark:text-slate-700">•</span>
        <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
          {yedekCount} Yedek
        </span>
        <span className="text-slate-300 dark:text-slate-700">•</span>
        <button
          type="button"
          onClick={() => setShowTemplateInfo(!showTemplateInfo)}
          className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline cursor-pointer bg-blue-50/80 dark:bg-blue-950/40 px-2 py-0.5 rounded-lg border border-blue-200/60 dark:border-blue-800/60 transition-all"
          title="Uyumlu Belge Şablonlarını Gör"
        >
          <Eye className="w-3 h-3" /> {visibleCount} Belgede Görünür
          <Info className="w-3 h-3 text-blue-400 ml-0.5" />
        </button>
      </div>

      {/* Şablon Uyumluluğu Popover */}
      {showTemplateInfo && (
        <div className="absolute top-full left-3 mt-2 z-50 w-80 p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 text-xs animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2 mb-2">
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              Komisyon Uyumlu Şablonlar ({compatibleTemplates.length})
            </span>
            <button
              type="button"
              onClick={() => setShowTemplateInfo(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold"
            >
              ×
            </button>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2 leading-relaxed">
            Bu kadrodaki &quot;Belgede Görünür&quot; işaretli üyeler aşağıdaki uyumlu belge çıktılarına otomatik yansıtılır:
          </p>
          <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar pr-1">
            {compatibleTemplates.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-[11px] text-slate-700 dark:text-slate-300"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="font-medium truncate">{t.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Aksiyon Butonları */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onAddRow("Üye", 1)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-800 rounded-xl transition-all shadow-2xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Üye Ekle
        </button>
      </div>
    </div>
  );
};

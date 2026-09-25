import React from "react";
import { ShieldCheck, Trophy } from "lucide-react";
import { cn } from "../../../../../../utils/cn";
import { WinnerDocumentsMenu } from "../WinnerDocumentsMenu";
import { PrintDropdownButton } from "../../../../components/PrintDropdownButton";
import { FirmaStats, IslemlerData } from "./types";

interface Props {
  kazananFirmaUnvan: string;
  firmaStats: FirmaStats;
  islemlerData: IslemlerData;
  formatCurrency: (val: number | null) => string;
  stageSablons: any[];
  sablons: any[];
  activeStarredDocs: string[];
  ciktiLoading: boolean;
  handleOpenPreviewForSablon: (sablon: any, title: string, overrideCtx?: any, selectedFirma?: any) => Promise<void> | void;
  quickPrint: (sablon: any) => Promise<void> | void;
  quickExport: (sablon: any, format: any) => Promise<void> | void;
  quickOpenExternal: (sablon: any) => Promise<void> | void;
  isSablonDisabled: (sablon: any) => boolean;
  disableDocumentGuidance?: boolean;
  activeDosyaId?: number | null;
  onPrintResultApproval: () => void;
  onPrintAcceptanceLetter: () => void;
  onPrintOrderForm: () => void;
  onPrintContractInvitation: () => void;
  onPrintContract: () => void;
  onPrintContractAlternative: () => void;
  onPrintContractLong: () => void;
}

export const SiparisKazananFirmaCard: React.FC<Props> = ({
  kazananFirmaUnvan,
  firmaStats,
  islemlerData,
  formatCurrency,
  stageSablons,
  sablons,
  activeStarredDocs,
  ciktiLoading,
  handleOpenPreviewForSablon,
  quickPrint,
  quickExport,
  quickOpenExternal,
  isSablonDisabled,
  disableDocumentGuidance,
  onPrintResultApproval,
  onPrintAcceptanceLetter,
  onPrintOrderForm,
  onPrintContractInvitation,
  onPrintContract,
  onPrintContractAlternative,
  onPrintContractLong,
}) => {
  const tasarrufOrani = firmaStats.yaklasikMaliyet && firmaStats.teklifToplami
    ? ((firmaStats.yaklasikMaliyet - firmaStats.teklifToplami) /
      firmaStats.yaklasikMaliyet) * 100
    : null;

  return (
    <div className="bg-gradient-to-br from-emerald-50 via-white to-teal-50/30 dark:from-emerald-950/20 dark:via-slate-900 dark:to-teal-950/10 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-4 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Sol: Firma adı + VKN + Yasaklılık */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0 border border-emerald-300/40 dark:border-emerald-700/40 shadow-2xs">
            <Trophy className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-wider">
                Kazanan / Yüklenici Firma
              </span>
              {firmaStats.yasaklilikDurumu && (
                <span
                  className={cn(
                    "px-1.5 py-0.5 rounded text-[8.5px] font-extrabold uppercase tracking-wider flex items-center gap-1",
                    firmaStats.yasaklilikDurumu === "Temiz" &&
                      "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50",
                    firmaStats.yasaklilikDurumu === "Yasaklı" &&
                      "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/50",
                    firmaStats.yasaklilikDurumu === "Sorgulanmadı" &&
                      "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700",
                  )}
                >
                  <ShieldCheck className="w-2.5 h-2.5" />
                  {firmaStats.yasaklilikDurumu}
                </span>
              )}
            </div>
            <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100 truncate">
              {kazananFirmaUnvan || "Seçili Firma"}
            </span>
            {firmaStats.vergiNo && (
              <span className="text-[10px] text-slate-400 font-mono">
                VKN: {firmaStats.vergiNo}
              </span>
            )}
          </div>
        </div>

        {/* Orta: Kompakt Metrikler */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="px-3 py-1.5 rounded-xl bg-white/80 dark:bg-slate-850 border border-emerald-100 dark:border-emerald-900/40 flex flex-col shadow-2xs">
            <span className="text-[9px] font-bold text-slate-400 uppercase">
              Teklif Tutarı
            </span>
            <span className="text-xs font-black text-emerald-700 dark:text-emerald-300">
              {formatCurrency(firmaStats.teklifToplami)}
            </span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-white/80 dark:bg-slate-850 border border-blue-100 dark:border-blue-900/40 flex flex-col shadow-2xs">
            <span className="text-[9px] font-bold text-slate-400 uppercase">
              Yaklaşık Maliyet
            </span>
            <span className="text-xs font-black text-slate-700 dark:text-slate-200">
              {formatCurrency(firmaStats.yaklasikMaliyet)}
            </span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-white/80 dark:bg-slate-850 border border-violet-100 dark:border-violet-900/40 flex flex-col shadow-2xs">
            <span className="text-[9px] font-bold text-slate-400 uppercase">
              Tasarruf
            </span>
            <span
              className={cn(
                "text-xs font-black",
                tasarrufOrani !== null && tasarrufOrani >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400",
              )}
            >
              {tasarrufOrani !== null ? `%${tasarrufOrani.toFixed(1)}` : "—"}
            </span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-white/80 dark:bg-slate-850 border border-amber-100 dark:border-amber-900/40 flex flex-col shadow-2xs">
            <span className="text-[9px] font-bold text-slate-400 uppercase">
              Teslim Süresi
            </span>
            <span className="text-xs font-black text-amber-600 dark:text-amber-400">
              {islemlerData.teslimGunu} Gün
            </span>
          </div>
        </div>

        {/* Sağ: Belge Menüsü & Yazdır */}
        <div className="flex items-center gap-2 relative shrink-0">
          <WinnerDocumentsMenu
            sozlesmeYapilacakMi={Boolean(firmaStats.sozlesmeYapilacakMi)}
            onPrintResultApproval={onPrintResultApproval}
            onPrintAcceptanceLetter={onPrintAcceptanceLetter}
            onPrintOrderForm={onPrintOrderForm}
            onPrintContractInvitation={onPrintContractInvitation}
            onPrintContract={onPrintContract}
            onPrintContractAlternative={onPrintContractAlternative}
            onPrintContractLong={onPrintContractLong}
            onEkapBlacklistQuery={() => {
              window.electron?.ipcRenderer.send("window:open-external", {
                url: "https://ekapv2.kik.gov.tr/sorgulamalar/yasak-sorgulama",
                title: "EKAP Kamu İhale Yasaklı Sorgulama",
              });
            }}
            onEdevletBlacklistQuery={() => {
              window.electron?.ipcRenderer.send("window:open-external", {
                url: "https://www.turkiye.gov.tr/kik-yasakli-sorgula",
                title: "e-Devlet KİK Yasaklılık Sorgulama",
              });
            }}
          />

          {stageSablons.length > 0 && (
            <div>
              <PrintDropdownButton
                kategori="3-siparis-ve-sozlesme"
                sablons={sablons}
                overrideSablons={stageSablons}
                activeStarredDocs={activeStarredDocs}
                ciktiLoading={ciktiLoading}
                handleOpenPreviewForSablon={handleOpenPreviewForSablon}
                quickPrint={quickPrint}
                quickExport={quickExport}
                quickOpenExternal={quickOpenExternal}
                isSablonDisabled={isSablonDisabled}
                buttonHeightClass="h-9 text-xs"
                label={disableDocumentGuidance ? "İşlemler" : "Yazdır"}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

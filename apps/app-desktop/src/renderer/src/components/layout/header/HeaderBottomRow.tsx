import React from "react";
import { Link } from "@tanstack/react-router";
import { ClipboardList, Landmark, Layers, Printer } from "lucide-react";
import { TeminSelector } from "../TeminSelector";

interface HeaderBottomRowProps {
  isDt?: boolean;
  procurementMode?: "dogrudan_temin" | "ihale" | "devlet_ihale_2886";
  handleModeChange: (
    mode: "dogrudan_temin" | "ihale" | "devlet_ihale_2886",
  ) => void;
  activeDosyaId?: number | string | null;
}

export const HeaderBottomRow = React.memo(function HeaderBottomRow({
  isDt,
  procurementMode = isDt ? "dogrudan_temin" : "ihale",
  handleModeChange,
  activeDosyaId,
}: HeaderBottomRowProps): React.JSX.Element {
  const currentMode = procurementMode;

  const handleNextMode = (): void => {
    if (currentMode === "dogrudan_temin") {
      handleModeChange("ihale");
    } else if (currentMode === "ihale") {
      handleModeChange("devlet_ihale_2886");
    } else {
      handleModeChange("dogrudan_temin");
    }
  };

  const getBadgeStyle = (): { container: string; dot: string } => {
    if (currentMode === "dogrudan_temin") {
      return {
        container:
          "bg-blue-50/90 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200/60 dark:border-blue-800/40",
        dot: "bg-blue-500",
      };
    }
    if (currentMode === "devlet_ihale_2886") {
      return {
        container:
          "bg-amber-50/90 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/40",
        dot: "bg-amber-500",
      };
    }
    return {
      container:
        "bg-indigo-50/90 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-800/40",
      dot: "bg-indigo-500",
    };
  };

  const style = getBadgeStyle();

  return (
    <div
      className="min-h-9 py-1 flex items-center justify-between gap-1 sm:gap-2.5 bg-slate-100/50 dark:bg-slate-950/20 border-t border-slate-200/30 dark:border-slate-800/30 select-none px-2 sm:px-3 relative z-20 w-full"
      style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
    >
      {/* Sol: İnce ve Şık Aktif Çalışma Modu Rozeti */}
      <div className="shrink-0 flex items-center">
        <button
          type="button"
          onClick={handleNextMode}
          title="Süreç rejimini değiştirmek için tıklayın (Doğrudan Temin ↔ 4734 İhale ↔ 2886 Devlet İhale)"
          className={`inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full text-[11px] font-medium transition-all duration-300 border cursor-pointer hover:opacity-85 ${style.container}`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${style.dot} animate-pulse shrink-0`}
          />
          <span className="hidden 2xl:inline">
            {currentMode === "dogrudan_temin"
              ? "Doğrudan Temin (Md. 22)"
              : currentMode === "devlet_ihale_2886"
              ? "Devlet İhale (2886 Sayılı Kanun)"
              : "İhale İşlemleri (Md. 19 / 21)"}
          </span>
          <span className="hidden xl:inline 2xl:hidden font-semibold">
            {currentMode === "dogrudan_temin"
              ? "DT (Md. 22)"
              : currentMode === "devlet_ihale_2886"
              ? "2886 DİK"
              : "İhale (19/21)"}
          </span>
          <span className="hidden sm:inline xl:hidden font-semibold">
            {currentMode === "dogrudan_temin"
              ? "DT"
              : currentMode === "devlet_ihale_2886"
              ? "2886"
              : "İhale"}
          </span>
        </button>
      </div>

      {/* Orta: Temin Seçici */}
      <div className="flex-1 min-w-0 flex justify-center px-1 sm:px-2">
        <TeminSelector />
      </div>

      {/* Sağ: Süreç & Çıktı Butonları */}
      {activeDosyaId ? (
        <div className="flex items-center gap-1 shrink-0 justify-end">
          {currentMode === 'devlet_ihale_2886' ? (
            <>
              <Link
                to="/devlet-ihale-2886"
                title="2886 Devlet İhale Süreç & Karar Yönetimi"
                className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-md transition-all shadow-2xs hover:shadow-xs border text-amber-700 bg-amber-50/80 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-900/50 border-amber-200/50 dark:border-amber-900/30"
              >
                <Landmark className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden 2xl:inline">2886 Devlet İhale Yönetimi</span>
                <span className="hidden xl:inline 2xl:hidden">2886 Süreç</span>
                <span className="hidden sm:inline xl:hidden">2886</span>
              </Link>
              <Link
                to="/cikti-merkezi"
                title="2886 Çıktı & Belge Merkezi"
                className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold text-amber-800 bg-amber-100/80 hover:bg-amber-200/80 dark:bg-amber-900/40 dark:text-amber-200 border border-amber-300/60 dark:border-amber-800/40 rounded-md transition-colors shadow-2xs hover:shadow-xs"
              >
                <Printer className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden 2xl:inline">2886 Çıktı</span>
                <span className="hidden xl:inline 2xl:hidden">Çıktı</span>
              </Link>
            </>
          ) : currentMode === 'ihale' ? (
            <>
              <Link
                to="/dosya/hazirlik-ve-ihtiyac"
                title="İhale Aşamaları (KİK Md. 19 / 21)"
                className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-md transition-all shadow-2xs hover:shadow-xs border text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-900/50 border-indigo-200/50 dark:border-indigo-900/30"
              >
                <ClipboardList className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden 2xl:inline">İhale Aşamaları (19/21)</span>
                <span className="hidden xl:inline 2xl:hidden">İhale Süreci</span>
                <span className="hidden sm:inline xl:hidden">İhale</span>
              </Link>
              <Link
                to="/surec-akisi"
                title="İhale Süreç Akış Haritası"
                className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold text-purple-700 bg-purple-50/80 hover:bg-purple-100 dark:bg-purple-950/40 dark:text-purple-300 dark:hover:bg-purple-900/50 border border-purple-200/50 dark:border-purple-900/30 rounded-md transition-colors shadow-2xs hover:shadow-xs"
              >
                <Layers className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden 2xl:inline">İhale Akışı</span>
                <span className="hidden xl:inline 2xl:hidden">Akış</span>
              </Link>
              <Link
                to="/cikti-merkezi"
                title="İhale Belge & Çıktı Merkezi"
                className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50/80 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/50 border border-emerald-100/50 dark:border-emerald-900/30 rounded-md transition-colors shadow-2xs hover:shadow-xs"
              >
                <Printer className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden 2xl:inline">İhale Çıktı</span>
                <span className="hidden xl:inline 2xl:hidden">Çıktı</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/takip"
                title="Doğrudan Temin Süreç Takibi (Md. 22)"
                className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-md transition-all shadow-2xs hover:shadow-xs border text-blue-700 bg-blue-50/80 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-900/50 border-blue-200/50 dark:border-blue-900/30"
              >
                <ClipboardList className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden 2xl:inline">Doğrudan Temin Takip</span>
                <span className="hidden xl:inline 2xl:hidden">DT Takip</span>
                <span className="hidden sm:inline xl:hidden">Takip</span>
              </Link>
              <Link
                to="/surec-akisi"
                title="Doğrudan Temin Süreç Akış Haritası"
                className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold text-purple-700 bg-purple-50/80 hover:bg-purple-100 dark:bg-purple-950/40 dark:text-purple-300 dark:hover:bg-purple-900/50 border border-purple-200/50 dark:border-purple-900/30 rounded-md transition-colors shadow-2xs hover:shadow-xs"
              >
                <Layers className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden 2xl:inline">Süreç Akışı</span>
                <span className="hidden xl:inline 2xl:hidden">Akış</span>
              </Link>
              <Link
                to="/cikti-merkezi"
                title="Çıktı Merkezi & Yazdırma"
                className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50/80 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/50 border border-emerald-100/50 dark:border-emerald-900/30 rounded-md transition-colors shadow-2xs hover:shadow-xs"
              >
                <Printer className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden 2xl:inline">Çıktı Merkezi</span>
                <span className="hidden xl:inline 2xl:hidden">Çıktı</span>
              </Link>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
});

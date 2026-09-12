import React, { useState } from "react";
import { TabType } from "./types";
import { useDosyaInspectorData } from "./useDosyaInspectorData";
import { InspectorHeader } from "./InspectorHeader";
import { InspectorTabBar } from "./InspectorTabBar";
import { InspectorFooter } from "./InspectorFooter";
import { InspectorGenelBakisTab } from "./tabs/InspectorGenelBakisTab";
import { InspectorKunyeTab } from "./tabs/InspectorKunyeTab";
import { InspectorKalemlerTab } from "./tabs/InspectorKalemlerTab";
import { InspectorFirmalarTab } from "./tabs/InspectorFirmalarTab";
import { InspectorKomisyonTab } from "./tabs/InspectorKomisyonTab";
import { InspectorRawJsonTab } from "./tabs/InspectorRawJsonTab";

export interface DosyaInspectorViewProps {
  dosya: any;
  mode?: "modal" | "screen";
  onClose?: () => void;
  className?: string;
}

export const DosyaInspectorView: React.FC<DosyaInspectorViewProps> = ({
  dosya,
  mode = "modal",
  onClose,
  className = "",
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("genel");
  const {
    dosya: d,
    subData,
    loading,
    toplamYaklasikMaliyet,
    fullPayload,
  } = useDosyaInspectorData(dosya);

  if (!d || !d.id) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400">
        <p className="text-sm font-medium">Dosya verisi bulunamadı veya henüz seçilmedi.</p>
      </div>
    );
  }

  const containerClasses =
    mode === "screen"
      ? `flex-1 flex flex-col h-full min-h-0 bg-slate-50 dark:bg-slate-950 overflow-hidden ${className}`
      : `bg-white dark:bg-slate-900 w-full max-w-6xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col border border-slate-200/80 dark:border-slate-800 overflow-hidden ring-1 ring-slate-900/10 dark:ring-white/10 ${className}`;

  return (
    <div className={containerClasses} onClick={(e) => e.stopPropagation()}>
      {/* HEADER */}
      <InspectorHeader
        dosya={d}
        subData={subData}
        mode={mode}
        onClose={onClose}
      />

      {/* TAB BAR */}
      <InspectorTabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        kalemlerCount={subData.kalemler.length}
        firmalarCount={subData.firmalar.length}
        komisyonCount={subData.komisyon.length}
        fullPayload={fullPayload}
      />

      {/* SCROLLABLE BODY */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5 min-h-0">
        {loading && (
          <div className="py-2 px-3 mb-2 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 text-xs flex items-center gap-2 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
            Dosya ve alt verileri güncelleniyor...
          </div>
        )}

        {activeTab === "genel" && (
          <InspectorGenelBakisTab
            dosya={d}
            subData={subData}
            toplamYaklasikMaliyet={toplamYaklasikMaliyet}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === "kunye" && (
          <InspectorKunyeTab
            dosya={d}
            toplamYaklasikMaliyet={toplamYaklasikMaliyet}
          />
        )}

        {activeTab === "kalemler" && (
          <InspectorKalemlerTab
            kalemler={subData.kalemler}
            toplamYaklasikMaliyet={toplamYaklasikMaliyet}
          />
        )}

        {activeTab === "firmalar" && (
          <InspectorFirmalarTab firmalar={subData.firmalar} />
        )}

        {activeTab === "komisyon" && (
          <InspectorKomisyonTab komisyon={subData.komisyon} />
        )}

        {activeTab === "rawjson" && (
          <InspectorRawJsonTab payload={fullPayload} />
        )}
      </div>

      {/* FOOTER */}
      <InspectorFooter dosya={d} mode={mode} onClose={onClose} />
    </div>
  );
};

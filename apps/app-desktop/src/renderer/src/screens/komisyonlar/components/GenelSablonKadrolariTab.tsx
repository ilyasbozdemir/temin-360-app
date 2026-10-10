import React from "react";
import { Search } from "lucide-react";
import { Input } from "../../../components/ui/Input";
import { KomisyonCard } from "./KomisyonCard";

// Refreshed component for GenelSablonKadrolariTab
interface GenelSablonKadrolariTabProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  procurementFilter: "all" | "dogrudan_temin" | "ihale";
  setProcurementFilter: (val: "all" | "dogrudan_temin" | "ihale") => void;
  komisyonlar: any[];
  filteredKomisyonlar: any[];
  isKomisyonLoading: boolean;
  isKomisyonMatchingMode: (
    k: any,
    mode: "all" | "dogrudan_temin" | "ihale",
  ) => boolean;
  isBaseKomisyon: (ad?: string, id?: number) => boolean;
  getIconForTur: (ad: string) => React.ReactNode;
  expandedBelgelerMap: Record<number, boolean>;
  toggleBelgeler: (id: number) => void;
  onHizliKadro: (komisyon: { id: number; ad: string }) => void;
  onEditKomisyon: (id: number) => void;
  onDeleteKomisyon: (id: number) => void;
  onOpenPreview: (sablon: any, title: string) => void;
  onOpenDetails: (id: number) => void;
  activeDosyaId?: number | null;
}

export const GenelSablonKadrolariTab: React.FC<GenelSablonKadrolariTabProps> = (
  {
    searchTerm,
    setSearchTerm,
    procurementFilter,
    setProcurementFilter,
    komisyonlar,
    filteredKomisyonlar,
    isKomisyonLoading,
    isKomisyonMatchingMode,
    isBaseKomisyon,
    getIconForTur,
    expandedBelgelerMap,
    toggleBelgeler,
    onHizliKadro,
    onEditKomisyon,
    onDeleteKomisyon,
    onOpenPreview,
    onOpenDetails,
    activeDosyaId,
  },
) => {
  return (
    <div className="grid grid-cols-1 gap-8 items-start flex-1 min-h-0">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm min-h-[450px] flex flex-col overflow-hidden relative">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Komisyon adı veya üye ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-full bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl text-sm"
            />
          </div>

          {/* Süreç Usulü Mod Filtreleyici */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setProcurementFilter("all")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                procurementFilter === "all"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Tümü ({komisyonlar.length})
            </button>
            <button
              type="button"
              onClick={() => setProcurementFilter("dogrudan_temin")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                procurementFilter === "dogrudan_temin"
                  ? "bg-blue-600 text-white shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
              }`}
            >
              <span>🛒 Doğrudan Temin</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  procurementFilter === "dogrudan_temin"
                    ? "bg-blue-700 text-white"
                    : "bg-slate-200 dark:bg-slate-800"
                }`}
              >
                {komisyonlar.filter((k: any) =>
                  isKomisyonMatchingMode(k, "dogrudan_temin")
                ).length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setProcurementFilter("ihale")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                procurementFilter === "ihale"
                  ? "bg-indigo-600 text-white shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
              }`}
            >
              <span>🏛️ İhale Komisyonları</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  procurementFilter === "ihale"
                    ? "bg-indigo-700 text-white"
                    : "bg-slate-200 dark:bg-slate-800"
                }`}
              >
                {komisyonlar.filter((k: any) =>
                  isKomisyonMatchingMode(k, "ihale")
                ).length}
              </span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/50 rounded-xl flex flex-col p-6">
          {isKomisyonLoading
            ? (
              <div className="flex-1 flex items-center justify-center text-slate-500">
                Yükleniyor...
              </div>
            )
            : filteredKomisyonlar.length === 0
            ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center max-w-md">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">
                    Kayıtlı Komisyon Bulunamadı
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    Henüz bir komisyon tanımı bulunmuyor. Yeni bir komisyon
                    eklemek için yukarıdaki "Yeni Komisyon Tanımla" butonunu
                    kullanabilirsiniz.
                  </p>
                </div>
              </div>
            )
            : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredKomisyonlar.map((komisyon: any) => (
                  <KomisyonCard
                    key={komisyon.id}
                    komisyon={komisyon}
                    isBaseKomisyon={isBaseKomisyon}
                    getIconForTur={getIconForTur}
                    expanded={!!expandedBelgelerMap[komisyon.id]}
                    onToggleExpanded={() => toggleBelgeler(komisyon.id)}
                    onHizliKadro={onHizliKadro}
                    onEditKomisyon={onEditKomisyon}
                    onDeleteKomisyon={onDeleteKomisyon}
                    onOpenPreview={onOpenPreview}
                    onOpenDetails={onOpenDetails}
                    activeDosyaId={activeDosyaId}
                  />
                ))}
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

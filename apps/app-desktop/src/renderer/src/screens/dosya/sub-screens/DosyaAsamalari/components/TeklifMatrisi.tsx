import React, { useState, useEffect } from "react";
import { AlertCircle, Coins } from "lucide-react";
import {
  TeklifMatrisiProps,
  FirmBasedEntryView,
  TableView,
} from "./TeklifMatrisi/index";

export type { TeklifMatrisiProps };

export const TeklifMatrisi: React.FC<TeklifMatrisiProps> = ({
  invitedFirms,
  items,
  bids,
  getEstimatedCostTotal,
  getLowestBidInfo,
  getAverageBid,
  handlePriceChange,
}) => {
  const [activeView, setActiveView] = useState<"firm" | "matrix">("firm");
  const [selectedFirmId, setSelectedFirmId] = useState<number | null>(null);

  // Initialize and synchronize selectedFirmId
  useEffect(() => {
    if (
      invitedFirms.length > 0 &&
      (selectedFirmId === null || !invitedFirms.some((f) => f.id === selectedFirmId))
    ) {
      setSelectedFirmId(invitedFirms[0].id);
    }
  }, [invitedFirms, selectedFirmId]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col gap-5 overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="text-left">
          <h3 className="text-lg font-bold text-slate-855 dark:text-slate-100 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            Teklif Giriş Tablosu & Karşılaştırma
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Her firma için malzeme birim fiyatlarını girin. En uygun teklifler yeşil renkle
            vurgulanır ve yaklaşık maliyet otomatik hesaplanır.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* View Toggle */}
          <div className="flex items-center gap-1.5 bg-slate-100/80 dark:bg-slate-955 p-1 rounded-xl h-10 border border-slate-200/40 dark:border-slate-800/40 select-none">
            <button
              onClick={() => setActiveView("firm")}
              className={`px-3.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer border-0 ${
                activeView === "firm"
                  ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-xs"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-350"
              }`}
            >
              Firma Bazlı
            </button>
            <button
              onClick={() => setActiveView("matrix")}
              className={`px-3.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer border-0 ${
                activeView === "matrix"
                  ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-xs"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-355"
              }`}
            >
              Tüm Teklifler (Tablo)
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-50 dark:bg-slate-955 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 h-10">
            <Coins className="w-4 h-4 text-emerald-500" />
            <span>Para Birimi: TL</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 px-3.5 py-1.5 rounded-xl border border-amber-200/50 dark:border-amber-900/30 h-10">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Birim Fiyatlar KDV Hariçtir</span>
          </div>
        </div>
      </div>

      {invitedFirms.some((f) => !f.teklif_toplami || f.teklif_toplami === 0) && (
        <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-xl p-3 px-4 flex items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-300 font-medium">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Fiyat Girişi Devam Ediyor:</strong> Davet edilen bazı firmaların (Örn:{" "}
              {invitedFirms.filter((f) => !f.teklif_toplami).map((f) => f.unvan).join(", ")}) henüz teklif fiyatları girilmedi. Tüm fiyatlar girildikten sonra kazanan firma netleşecektir.
            </span>
          </div>
        </div>
      )}

      {activeView === "firm" && invitedFirms.length > 0 && selectedFirmId !== null ? (
        <FirmBasedEntryView
          invitedFirms={invitedFirms}
          items={items}
          bids={bids}
          selectedFirmId={selectedFirmId}
          setSelectedFirmId={setSelectedFirmId}
          getLowestBidInfo={getLowestBidInfo}
          handlePriceChange={handlePriceChange}
        />
      ) : (
        <TableView
          invitedFirms={invitedFirms}
          items={items}
          bids={bids}
          getEstimatedCostTotal={getEstimatedCostTotal}
          getLowestBidInfo={getLowestBidInfo}
          getAverageBid={getAverageBid}
          handlePriceChange={handlePriceChange}
        />
      )}
    </div>
  );
};

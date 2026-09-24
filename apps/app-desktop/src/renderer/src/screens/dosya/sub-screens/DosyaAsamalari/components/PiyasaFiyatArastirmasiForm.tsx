import React from "react";
import { cn } from "../../../../../utils/cn";
import { PiyasaFiyatArastirmasiMatrixTab } from "./PiyasaFiyatArastirmasiMatrixTab";
import { PiyasaFiyatKarsilastirmaTab } from "./PiyasaFiyatKarsilastirmaTab";
import {
  PiyasaFiyatFormHeader,
  PiyasaFiyatFormSettingsBar,
  PiyasaFiyatFormTabSwitcher,
} from "./PiyasaFiyatForm";

interface PiyasaFiyatArastirmasiFormProps {
  isFormFullscreen?: boolean;
  setIsFormOpen: (val: boolean) => void;
  activeFormTab: any;
  setActiveFormTab: (tab: any) => void;
  hesaplamaEsasi: string;
  setHesaplamaEsasi?: (val: string) => void;
  invitedFirms: any[];
  items: any[];
  bids: Record<string, number>;
  getEstimatedCostTotal: () => number;
  getLowestBidInfo: (itemId: number) => any;
  getAverageBid: (itemId: number) => number;
  handlePriceChange: (
    kalemId: number,
    teminFirmaId: number,
    priceStr: string,
  ) => Promise<void>;
  handleSaveToDosya: (docType?: "maliyet" | "tutanak" | "save_only") => void;
  maliyetCetveliTarihi: string;
  setMaliyetCetveliTarihi: (val: string) => void;
  tutanakTarihi: string;
  setTutanakTarihi: (val: string) => void;
  syncTutanak: boolean;
  setSyncTutanak: (val: boolean) => void;
  setLowestFirmAsWinner: boolean;
  setSetLowestFirmAsWinner: (val: boolean) => void;
  manualWinnerFirmaId: number | null;
  setManualWinnerFirmaId: (id: number | null) => void;
  belgeleriKaydet: boolean;
  setBelgeleriKaydet: (val: boolean) => void;
  formMode: "maliyet" | "tutanak";
  isEditingFirms: boolean;
  setIsEditingFirms: (val: boolean) => void;
  setIsFirmModalOpen: (val: boolean) => void;
  lowestTotalFirmaId: number | null;
  handleRemoveFirm: (id: number) => void;
}

export function PiyasaFiyatArastirmasiForm({
  isFormFullscreen,
  setIsFormOpen,
  activeFormTab,
  setActiveFormTab,
  hesaplamaEsasi,
  setHesaplamaEsasi,
  invitedFirms,
  items,
  bids,
  getEstimatedCostTotal,
  getLowestBidInfo,
  getAverageBid,
  handlePriceChange,
  handleSaveToDosya,
  maliyetCetveliTarihi,
  setMaliyetCetveliTarihi,
  tutanakTarihi,
  setTutanakTarihi,
  setLowestFirmAsWinner,
  setSetLowestFirmAsWinner,
  manualWinnerFirmaId,
  setManualWinnerFirmaId,
  formMode,
}: PiyasaFiyatArastirmasiFormProps): React.JSX.Element {
  const estimatedCostTotal = getEstimatedCostTotal();

  return (
    <div
      className={cn(
        isFormFullscreen
          ? "fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950 overflow-y-auto flex flex-col animate-in fade-in duration-300"
          : "w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-sm flex flex-col animate-in fade-in duration-300 mt-4 overflow-hidden",
      )}
    >
      {/* Form Header */}
      <div
        className={cn(
          "bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex flex-col",
          isFormFullscreen ? "sticky top-0 z-50 shadow-xs" : "",
        )}
      >
        <PiyasaFiyatFormHeader
          formMode={formMode}
          itemsCount={items.length}
          invitedFirmsCount={invitedFirms.length}
          estimatedCostTotal={estimatedCostTotal}
          setIsFormOpen={setIsFormOpen}
          handleSaveToDosya={handleSaveToDosya}
        />

        <PiyasaFiyatFormSettingsBar
          formMode={formMode}
          hesaplamaEsasi={hesaplamaEsasi}
          setHesaplamaEsasi={setHesaplamaEsasi}
          maliyetCetveliTarihi={maliyetCetveliTarihi}
          setMaliyetCetveliTarihi={setMaliyetCetveliTarihi}
          tutanakTarihi={tutanakTarihi}
          setTutanakTarihi={setTutanakTarihi}
          setLowestFirmAsWinner={setLowestFirmAsWinner}
          setSetLowestFirmAsWinner={setSetLowestFirmAsWinner}
          manualWinnerFirmaId={manualWinnerFirmaId}
          setManualWinnerFirmaId={setManualWinnerFirmaId}
          invitedFirms={invitedFirms}
        />

        <PiyasaFiyatFormTabSwitcher
          activeFormTab={activeFormTab}
          setActiveFormTab={setActiveFormTab}
        />
      </div>

      {/* Form Content Area */}
      <div
        className={cn(
          "p-6 flex flex-col gap-6 w-full flex-1",
          isFormFullscreen ? "md:p-8" : "",
        )}
      >
        {activeFormTab === "comparison"
          ? (
            <PiyasaFiyatKarsilastirmaTab
              items={items}
              invitedFirms={invitedFirms}
              afterBids={bids}
              getLowestBidInfo={getLowestBidInfo}
              getAverageBid={getAverageBid}
            />
          )
          : (
            <PiyasaFiyatArastirmasiMatrixTab
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
    </div>
  );
}

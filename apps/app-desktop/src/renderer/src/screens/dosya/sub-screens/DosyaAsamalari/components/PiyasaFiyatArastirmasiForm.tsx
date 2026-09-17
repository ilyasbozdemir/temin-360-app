import React from "react";
import {
  ArrowLeft,
  Award,
  Calendar,
  ChevronDown,
  FileSpreadsheet,
  FileText,
  Save,
} from "lucide-react";
import { cn } from "../../../../../utils/cn";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@renderer/components/ui/DropdownMenu";
import { PiyasaFiyatArastirmasiMatrixTab } from "./PiyasaFiyatArastirmasiMatrixTab";
import { PiyasaFiyatKarsilastirmaTab } from "./PiyasaFiyatKarsilastirmaTab";

interface PiyasaFiyatArastirmasiFormProps {
  isFormFullscreen?: boolean;
  setIsFormOpen: (val: boolean) => void;
  activeFormTab: "firms" | "matrix" | "comparison";
  setActiveFormTab: (tab: "firms" | "matrix" | "comparison") => void;
  hesaplamaEsasi: string;
  invitedFirms: any[];
  items: any[];
  bids: any;
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
  const isMaliyetMode = formMode === "maliyet";

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
        {/* Top Row: Title, Stats & Main Action Buttons */}
        <div className="p-4 md:px-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center gap-4 shrink-0">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-all cursor-pointer shadow-2xs border border-slate-200 dark:border-slate-700 shrink-0"
              title="Geri Dön / Kapat"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="text-left">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={cn(
                    "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-2xs flex items-center gap-1",
                    isMaliyetMode
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600"
                      : "bg-gradient-to-r from-indigo-600 to-blue-600",
                  )}
                >
                  {isMaliyetMode
                    ? <FileSpreadsheet className="w-3 h-3" />
                    : <FileText className="w-3 h-3" />}
                  {isMaliyetMode
                    ? "Yaklaşık Maliyet"
                    : "Piyasa Fiyat Araştırması"}
                </span>

                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                  {items.length} Kalem • {invitedFirms.length} Firma
                </span>
              </div>

              <h3 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2 leading-tight mt-1">
                {isMaliyetMode
                  ? "Yaklaşık Maliyet Cetveli Oluşturma & Teklif Girişi"
                  : "Piyasa Fiyat Araştırma Tutanağı Oluşturma & Teklif Girişi"}
              </h3>
            </div>
          </div>

          {/* Stat Box & Split Action Context Menu Button */}
          <div className="flex flex-wrap lg:flex-nowrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end shrink-0">
            {/* Toplam Maliyet Rozeti */}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/60 text-xs font-semibold">
              <span className="text-slate-500 dark:text-slate-400">
                Yaklaşık Maliyet:
              </span>
              <strong className="font-mono text-sm font-black text-emerald-700 dark:text-emerald-300">
                ₺ {estimatedCostTotal.toLocaleString("tr-TR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </strong>
            </div>

            {/* Split Action Dropdown Button */}
            <div className="flex items-center shadow-md rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() =>
                  handleSaveToDosya(isMaliyetMode ? "maliyet" : "tutanak")}
                className={cn(
                  "px-4 py-2.5 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer h-10 shrink-0 border-0 active:scale-95 whitespace-nowrap",
                  isMaliyetMode
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                    : "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700",
                )}
                title="Fiyat tekliflerini kaydeder ve resmi belgeyi günceller"
              >
                {isMaliyetMode
                  ? (
                    <FileSpreadsheet className="w-4 h-4 text-emerald-100 shrink-0" />
                  )
                  : <FileText className="w-4 h-4 text-indigo-100 shrink-0" />}
                <span>
                  {isMaliyetMode
                    ? "Kaydet & Cetvel Üret"
                    : "Kaydet & Tutanak Üret"}
                </span>
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "px-2.5 py-2.5 text-white text-xs font-bold transition-all flex items-center justify-center cursor-pointer h-10 shrink-0 border-l border-white/20 active:scale-95",
                      isMaliyetMode
                        ? "bg-teal-700 hover:bg-teal-800"
                        : "bg-blue-700 hover:bg-blue-800",
                    )}
                    title="Diğer Kaydetme ve İşlem Seçenekleri"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuItem
                    onClick={() => handleSaveToDosya("save_only")}
                  >
                    <Save className="mr-2 h-4 w-4 text-slate-500" />
                    <span>Sadece Fiyatları Sakla (Taslak)</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => handleSaveToDosya("maliyet")}
                  >
                    <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-600" />
                    <span>Yaklaşık Maliyet Cetvelini Güncelle</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => handleSaveToDosya("tutanak")}
                  >
                    <FileText className="mr-2 h-4 w-4 text-indigo-600" />
                    <span>Piyasa Fiyat Araştırma Tutanağını Güncelle</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Sub Settings Bar: Dates & Winner Selection Settings */}
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

        {/* Segment / Tab Switcher Bar */}
        <div className="bg-slate-100/70 dark:bg-slate-950/60 p-2 px-4 md:px-8 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveFormTab("matrix")}
              className={cn(
                "px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
                activeFormTab === "matrix"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200 dark:border-slate-700"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200",
              )}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-500" />
              <span>💰 Fiyat & Teklif Matrisi</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFormTab("comparison")}
              className={cn(
                "px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
                activeFormTab === "comparison"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200 dark:border-slate-700"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200",
              )}
            >
              <Award className="w-3.5 h-3.5 text-indigo-500" />
              <span>📊 Kademeli Karşılaştırma Matrisi (Öncesi vs Sonrası)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Form Content Area */}
      <div
        className={cn(
          "p-6 flex flex-col gap-6 w-full flex-1",
          isFormFullscreen ? "md:p-8" : "",
        )}
      >
        {activeFormTab === "comparison" ? (
          <PiyasaFiyatKarsilastirmaTab
            items={items}
            invitedFirms={invitedFirms}
            afterBids={bids}
            getLowestBidInfo={getLowestBidInfo}
            getAverageBid={getAverageBid}
          />
        ) : (
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

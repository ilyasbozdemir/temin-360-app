import React from "react";
import { Award } from "lucide-react";
import { BiddingFirm, BiddingKalem } from "./types";
import { BidPriceInput } from "./BidPriceInput";

interface FirmBasedEntryViewProps {
  invitedFirms: BiddingFirm[];
  items: BiddingKalem[];
  bids: Record<string, number>;
  selectedFirmId: number;
  setSelectedFirmId: (id: number) => void;
  getLowestBidInfo: (kalemId: number) => { price: number; firmaId: number | null };
  handlePriceChange: (kalemId: number, firmaId: number, val: string) => Promise<void>;
}

export function FirmBasedEntryView({
  invitedFirms,
  items,
  bids,
  selectedFirmId,
  setSelectedFirmId,
  getLowestBidInfo,
  handlePriceChange,
}: FirmBasedEntryViewProps): React.JSX.Element {
  const selectedFirm = invitedFirms.find((f) => f.id === selectedFirmId);

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-300">
      {/* Firm Select Tab List */}
      <div className="flex flex-wrap gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        {invitedFirms.map((f) => (
          <button
            key={f.id}
            onClick={() => setSelectedFirmId(f.id)}
            className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
              selectedFirmId === f.id
                ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-855"
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  selectedFirmId === f.id ? "bg-white" : "bg-slate-400 dark:bg-slate-500"
                }`}
              ></span>
              <span className="truncate max-w-[160px]" title={f.unvan}>
                {f.unvan}
              </span>
              <span className="text-[10px] font-mono opacity-90">
                (
                {f.teklif_toplami
                  ? f.teklif_toplami.toLocaleString("tr-TR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : "0,00"}{" "}
                ₺)
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Simple inputs vertical list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((kalem) => {
          const val = bids[`${kalem.id}_${selectedFirmId}`] || 0;
          const lowest = getLowestBidInfo(kalem.id);
          const isLowest = lowest.price > 0 && lowest.firmaId === selectedFirmId;

          return (
            <div
              key={kalem.id}
              className="p-4 bg-slate-50/50 dark:bg-slate-955/20 border border-slate-150 dark:border-slate-850 rounded-2xl flex items-center justify-between gap-4 hover:shadow-xs transition-shadow"
            >
              <div className="flex-1 min-w-0">
                <span
                  className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate"
                  title={kalem.kalem_adi}
                >
                  {kalem.kalem_adi}
                </span>
                <span className="text-[10px] text-slate-450 dark:text-slate-400 block mt-0.5 font-semibold">
                  Miktar: {kalem.miktar} {kalem.birim}
                </span>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {isLowest && (
                  <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-lg border border-emerald-500/10 flex items-center gap-1">
                    <Award className="w-3 h-3 text-emerald-500" />
                    En Uygun
                  </span>
                )}

                <div className="relative flex items-center w-36">
                  <span className="absolute left-2.5 text-[10px] font-bold text-slate-400 select-none">
                    ₺
                  </span>
                  <BidPriceInput
                    initialValue={val}
                    onChange={(newVal) => handlePriceChange(kalem.id, selectedFirmId, newVal)}
                    isLowest={isLowest}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Firm Offer Summary Footer Card */}
      {selectedFirm && (
        <div className="mt-2 p-4 bg-blue-50/40 dark:bg-blue-955/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {selectedFirm.unvan} Toplam Teklif
            </span>
            <p className="text-[10px] text-slate-550 dark:text-slate-400 mt-0.5">
              Firma bazlı girilen kalemlerin toplam tutarı (KDV Hariç)
            </p>
          </div>
          <span className="text-lg font-mono font-black text-blue-600 dark:text-blue-450">
            {selectedFirm.teklif_toplami
              ? selectedFirm.teklif_toplami.toLocaleString("tr-TR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              : "0,00"}{" "}
            ₺
          </span>
        </div>
      )}
    </div>
  );
}

import React from "react";
import { Award } from "lucide-react";
import { BiddingFirm, BiddingKalem } from "./types";
import { BidPriceInput } from "./BidPriceInput";

interface TableViewProps {
  invitedFirms: BiddingFirm[];
  items: BiddingKalem[];
  bids: Record<string, number>;
  getEstimatedCostTotal: () => number;
  getLowestBidInfo: (kalemId: number) => { price: number; firmaId: number | null };
  getAverageBid: (kalemId: number) => number;
  handlePriceChange: (kalemId: number, firmaId: number, val: string) => Promise<void>;
}

export function TableView({
  invitedFirms,
  items,
  bids,
  getEstimatedCostTotal,
  getLowestBidInfo,
  getAverageBid,
  handlePriceChange,
}: TableViewProps): React.JSX.Element {
  return (
    <div className="overflow-x-auto w-full border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs animate-in fade-in duration-300">
      <table className="w-full text-left border-collapse border border-slate-200 dark:border-slate-800 text-xs">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-950/60">
            <th className="p-3 border border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300 w-48">
              Malzeme/Hizmet Adı
            </th>
            <th className="p-3 border border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300 text-center w-28">
              Miktar / Birim
            </th>
            {invitedFirms.map((firma) => (
              <th
                key={firma.id}
                className="p-3 border border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300 text-right min-w-[150px]"
              >
                <div className="truncate w-36 ml-auto text-right" title={firma.unvan}>
                  {firma.unvan}
                </div>
              </th>
            ))}
            <th className="p-3 border border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300 text-right w-36 bg-slate-100/30 dark:bg-slate-950/20">
              Ort. (Yaklaşık)
            </th>
            <th className="p-3 border border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300 text-right w-36 bg-emerald-500/[0.02] dark:bg-emerald-500/[0.01]">
              En Düşük
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((kalem) => {
            const lowest = getLowestBidInfo(kalem.id);
            const avgPrice = getAverageBid(kalem.id);

            return (
              <tr
                key={kalem.id}
                className="hover:bg-slate-50/30 dark:hover:bg-slate-950/10 transition-colors"
              >
                <td className="p-3 border border-slate-200 dark:border-slate-805 font-semibold text-slate-800 dark:text-slate-200 bg-slate-50/20 dark:bg-slate-950/5">
                  {kalem.kalem_adi}
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-805 text-center text-slate-500">
                  {kalem.miktar} {kalem.birim}
                </td>
                {invitedFirms.map((firma) => {
                  const val = bids[`${kalem.id}_${firma.id}`] || 0;
                  const isLowest = lowest.price > 0 && lowest.firmaId === firma.id;

                  return (
                    <td
                      key={firma.id}
                      className={`p-0 border border-slate-200 dark:border-slate-805 text-right transition-colors ${
                        isLowest
                          ? "bg-emerald-500/[0.05] dark:bg-emerald-500/[0.02]"
                          : "bg-white dark:bg-slate-950"
                      }`}
                    >
                      <div className="relative flex items-center w-full h-full">
                        <span className="absolute left-2 text-[10px] font-bold text-slate-400 select-none">
                          ₺
                        </span>
                        <BidPriceInput
                          initialValue={val}
                          onChange={(newVal) => handlePriceChange(kalem.id, firma.id, newVal)}
                          isLowest={isLowest}
                          isExcelStyle={true}
                        />
                      </div>
                    </td>
                  );
                })}
                <td className="p-3 border border-slate-200 dark:border-slate-805 text-right font-bold text-slate-700 dark:text-slate-300 bg-slate-100/10 dark:bg-slate-950/10 font-mono">
                  {avgPrice > 0
                    ? `${avgPrice.toLocaleString("tr-TR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })} ₺`
                    : "-"}
                </td>
                <td className="p-3 border border-slate-200 dark:border-slate-805 text-right font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/[0.02] dark:bg-emerald-500/[0.005] font-mono">
                  <div className="flex items-center justify-end gap-1">
                    {lowest.price > 0 && <Award className="w-3.5 h-3.5 text-emerald-500" />}
                    <span>
                      {lowest.price > 0
                        ? `${lowest.price.toLocaleString("tr-TR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })} ₺`
                        : "-"}
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
          {/* TOPLAM TEKLİFLER SATIRI */}
          <tr className="bg-slate-50/80 dark:bg-slate-950/40 font-bold text-slate-850 dark:text-slate-100">
            <td className="p-3.5 border border-slate-200 dark:border-slate-800">
              Toplam Teklif Tutarı
            </td>
            <td className="p-3.5 border border-slate-200 dark:border-slate-800"></td>
            {invitedFirms.map((firma) => (
              <td
                key={firma.id}
                className="p-3.5 border border-slate-200 dark:border-slate-800 text-right text-sm font-extrabold text-slate-900 dark:text-slate-100 font-mono"
              >
                {firma.teklif_toplami
                  ? `${firma.teklif_toplami.toLocaleString("tr-TR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })} ₺`
                  : "0,00 ₺"}
              </td>
            ))}
            <td className="p-3.5 border border-slate-200 dark:border-slate-800 bg-slate-100/10 dark:bg-slate-950/10 text-right font-extrabold text-slate-900 dark:text-slate-100 font-mono">
              {getEstimatedCostTotal() > 0
                ? `${getEstimatedCostTotal().toLocaleString("tr-TR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })} ₺`
                : "-"}
            </td>
            <td className="p-3.5 border border-slate-200 dark:border-slate-800 bg-emerald-500/[0.02] dark:bg-emerald-500/[0.005]"></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

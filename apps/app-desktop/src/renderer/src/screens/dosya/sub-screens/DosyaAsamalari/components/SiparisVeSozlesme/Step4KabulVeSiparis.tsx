import React from "react";
import { Building2 } from "lucide-react";

interface Step4KabulVeSiparisProps {
  teslimGunu: number;
  onOpenKabulMektubu: () => void;
  onOpenSiparisFormu: () => void;
}

export function Step4KabulVeSiparis({
  teslimGunu,
  onOpenKabulMektubu,
  onOpenSiparisFormu,
}: Step4KabulVeSiparisProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Adım 4: Kabul Edilen Teklif Mektubu & Sipariş Formu
            </h3>
            <p className="text-[11px] text-slate-400">
              Sonucun kazanan istekliye tebliği ve teslimatın başlatılması için resmi sipariş mektubu
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Kabul Edilen Teklif Mektubu */}
        <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-850/60 border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Kabul Edilen Teklif Mektubu
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Fiyat araştırması sonucunun ve {teslimGunu} günlük teslim süresinin firmaya tebliğ edildiği resmi yazı.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenKabulMektubu}
            className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-2xs active:scale-95 transition-all"
          >
            Kabul Mektubunu Aç
          </button>
        </div>

        {/* Sipariş Formu */}
        <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-850/60 border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Sipariş Formu
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Malzeme veya hizmet kalemlerinin kalem bazlı teslimat detaylarını içeren sipariş formu.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenSiparisFormu}
            className="w-full py-2 px-3 rounded-xl bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-2xs active:scale-95 transition-all"
          >
            Sipariş Formunu Aç
          </button>
        </div>
      </div>
    </div>
  );
}

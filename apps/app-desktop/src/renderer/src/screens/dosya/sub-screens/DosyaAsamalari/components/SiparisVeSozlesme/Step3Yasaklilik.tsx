import React from "react";
import { ShieldCheck } from "lucide-react";

interface Step3YasaklilikProps {
  vergiNo: string | null;
}

export function Step3Yasaklilik({ vergiNo }: Step3YasaklilikProps) {
  const handleEkapQuery = () => {
    window.electron?.ipcRenderer.send("window:open-external", {
      url: "https://ekapv2.kik.gov.tr/sorgulamalar/yasak-sorgulama",
      title: "EKAP Kamu İhale Yasaklı Sorgulama",
    });
  };

  const handleEdevletQuery = () => {
    window.electron?.ipcRenderer.send("window:open-external", {
      url: "https://www.turkiye.gov.tr/kik-yasakli-sorgula",
      title: "e-Devlet KİK Yasaklılık Sorgulama",
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-950/60 flex items-center justify-center text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Adım 3: Kamu İhale Yasaklılık Kontrolü
            </h3>
            <p className="text-[11px] text-slate-400">
              4734 sayılı Kanun kapsamında kazanan firmanın ihalelere katılmaktan yasaklı olup olmadığını sorgulayın
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* EKAP Sorgusu */}
        <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-850/60 border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between gap-3">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-orange-500" />
                EKAP Yasaklılık Sorgulama
              </h4>
              <span className="text-[10px] text-orange-600 dark:text-orange-400 font-bold bg-orange-50 dark:bg-orange-950/50 px-2 py-0.5 rounded border border-orange-200 dark:border-orange-800">
                Resmi Portaldan
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              EKAP üzerinden firmanın VKN ({vergiNo || "Girilmedi"}) ile sorgulama ekranını açar.
            </p>
          </div>

          <button
            type="button"
            onClick={handleEkapQuery}
            className="w-full py-2 px-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-2xs active:scale-95 transition-all"
          >
            EKAP&apos;ta Sorgula ↗
          </button>
        </div>

        {/* e-Devlet KİK Sorgusu */}
        <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-850/60 border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between gap-3">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-500" />
                e-Devlet KİK Yasaklılık
              </h4>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                e-Devlet Girişi
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Kamu İhale Kurumu e-Devlet yasaklı sorgulama servisine yönlendirir.
            </p>
          </div>

          <button
            type="button"
            onClick={handleEdevletQuery}
            className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-2xs active:scale-95 transition-all"
          >
            e-Devlet KİK Sorgula ↗
          </button>
        </div>
      </div>
    </div>
  );
}

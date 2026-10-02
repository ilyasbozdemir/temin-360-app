import React from "react";
import { AlertCircle, Users } from "lucide-react";
import { KomisyonUye } from "../types";

interface KomisyonHeyetiBarProps {
  komisyonUyeleri: KomisyonUye[];
  hasKomisyon: boolean;
  onOpenKomisyonModal?: () => void;
}

export function KomisyonHeyetiBar({
  komisyonUyeleri,
  hasKomisyon,
  onOpenKomisyonModal,
}: KomisyonHeyetiBarProps): React.JSX.Element {
  return (
    <div className="px-5 py-3 bg-indigo-50/40 dark:bg-indigo-950/20 border-b border-indigo-100/80 dark:border-indigo-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 font-bold text-indigo-900 dark:text-indigo-200">
          <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span>Muayene Kabul ve Tespit Komisyonu Heyeti:</span>
        </div>

        {hasKomisyon ? (
          <div className="flex items-center gap-1.5 flex-wrap">
            {komisyonUyeleri.map((uye, idx) => {
              const isBaskan =
                uye.gorev?.toLowerCase().includes("başkan") ||
                uye.gorev?.toLowerCase().includes("baskan");
              return (
                <span
                  key={uye.id || idx}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${
                    isBaskan
                      ? "bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-800/60"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700"
                  }`}
                  title={
                    uye.unvan
                      ? `${uye.gorev || "Üye"} - ${uye.unvan}`
                      : uye.gorev || "Üye"
                  }
                >
                  {isBaskan ? "👑" : "👤"}
                  <span className="font-bold">{uye.ad_soyad}</span>
                  <span className="text-[10px] text-slate-400">
                    ({isBaskan ? "Başkan" : uye.gorev || "Üye"})
                  </span>
                </span>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>
              Komisyon henüz atanmadı. İmzalı belgeler için heyet tanımlayabilirsiniz.
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onOpenKomisyonModal}
          className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 hover:underline cursor-pointer bg-transparent border-0 p-0"
        >
          {hasKomisyon ? "Heyeti Düzenle" : "+ Komisyon Ata"}
        </button>
      </div>
    </div>
  );
}

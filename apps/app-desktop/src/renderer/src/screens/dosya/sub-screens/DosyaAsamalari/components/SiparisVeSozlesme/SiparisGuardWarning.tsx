import React from "react";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft, PackageSearch } from "lucide-react";
import { APP_ROUTES } from "../../../../../../constants/routeConstants";

export function SiparisGuardWarning() {
  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-300">
      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-700/60 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0 border border-amber-300/50 dark:border-amber-700/40">
            <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-extrabold text-amber-800 dark:text-amber-300">
              Kazanan Firma Belirlenmedi
            </h3>
            <p className="text-xs text-amber-700 dark:text-amber-400/90 leading-relaxed max-w-xl">
              Sipariş &amp; Sözleşme belgelerini oluşturabilmek için önce{" "}
              <strong>Piyasa Fiyat Araştırması</strong>{" "}
              adımında kazanan firmayı belirlemeniz gerekir. Tutanağı
              kaydederken <em>&ldquo;En Düşük Teklifi Kazanan Yap&rdquo;</em>
              {" "}
              seçeneğini işaretleyin ya da açılan firma listesinden kazananı
              elle seçin.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-amber-200 dark:border-amber-800/60 pt-4">
          <Link
            to={APP_ROUTES.PIYASA_FIYAT_ARASTIRMASI}
            className="flex items-center gap-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl shadow-sm hover:shadow transition-all cursor-pointer border-0"
          >
            <PackageSearch className="w-4 h-4" />
            Piyasa Fiyat Araştırması&apos;na Git
          </Link>
          <Link
            to={APP_ROUTES.PIYASA_FIYAT_ARASTIRMASI}
            className="flex items-center gap-2 text-xs font-bold bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Geri Dön
          </Link>
        </div>
      </div>

      {/* Adım akışı bilgi kartı */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          Süreç Adımları
        </h4>
        <ol className="flex flex-col gap-2">
          {[
            {
              step: "1",
              label: "Hazırlık & İhtiyaç",
              done: true,
              current: false,
            },
            {
              step: "2",
              label: "Piyasa Fiyat Araştırması — Kazanan firma belirle",
              done: false,
              current: true,
            },
            {
              step: "3",
              label: "Sipariş & Sözleşme",
              done: false,
              current: false,
            },
            {
              step: "4",
              label: "Muayene & Kabul & Ödeme İşlemleri",
              done: false,
              current: false,
            },
            {
              step: "5",
              label: "Klasör & Kapaklar",
              done: false,
              current: false,
            },
          ].map((item) => (
            <li
              key={item.step}
              className={`flex items-center gap-3 text-xs font-bold px-3 py-2 rounded-xl transition-colors ${
                item.current
                  ? "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60"
                  : item.done
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-slate-400 dark:text-slate-600"
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                  item.current
                    ? "bg-amber-500 text-white"
                    : item.done
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                }`}
              >
                {item.step}
              </span>
              {item.label}
              {item.current && (
                <span className="ml-auto text-[10px] font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-md border border-amber-500/20">
                  Bekliyor
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

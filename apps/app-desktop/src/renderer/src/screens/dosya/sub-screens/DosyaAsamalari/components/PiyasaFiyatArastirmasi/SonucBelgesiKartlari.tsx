import React from "react";
import { FileSpreadsheet, FileText } from "lucide-react";

interface SonucBelgesiKartlariProps {
  handleOpenSablonByDosyaAdi: (targetKey: string) => void;
  handleNewDocument: (mode: "maliyet" | "tutanak") => void;
}

export function SonucBelgesiKartlari({
  handleOpenSablonByDosyaAdi,
  handleNewDocument,
}: SonucBelgesiKartlariProps): React.JSX.Element {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 1. Piyasa Fiyat Araştırması Tutanağı */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/60 via-white to-white dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 shadow-xs flex flex-col justify-between">
        <div className="flex items-start gap-3.5">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Piyasa Fiyat Araştırması Tutanağı
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              İsteklilerden toplanan tüm teklifleri ve komisyon/görevli kararını içeren resmi piyasa fiyat araştırması tutanağı.
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleOpenSablonByDosyaAdi("piyasa-fiyat-arastirma-tutanagi")}
            className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer border-0"
          >
            <FileText className="w-4 h-4" />
            <span>Piyasa Araştırma Tutanağını Aç</span>
          </button>
          <button
            type="button"
            onClick={() => handleNewDocument("tutanak")}
            className="py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-colors cursor-pointer border border-indigo-200 dark:border-indigo-800 shrink-0"
            title="Yeni Tutanak Kaydet"
          >
            + Kaydet
          </button>
        </div>
      </div>

      {/* 2. Yaklaşık Maliyet Hesap Cetveli */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/60 via-white to-white dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 shadow-xs flex flex-col justify-between">
        <div className="flex items-start gap-3.5">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Yaklaşık Maliyet Hesap Cetveli
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Alıma ait kalemlerin piyasa teklifleri ortalamasına göre hesaplanan resmi yaklaşık maliyet cetveli.
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleOpenSablonByDosyaAdi("yaklasik-maliyet-hesap-cetveli")}
            className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer border-0"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Yaklaşık Maliyet Cetvelini Aç</span>
          </button>
          <button
            type="button"
            onClick={() => handleNewDocument("maliyet")}
            className="py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition-colors cursor-pointer border border-emerald-200 dark:border-emerald-800 shrink-0"
            title="Yeni Maliyet Cetveli Kaydet"
          >
            + Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}

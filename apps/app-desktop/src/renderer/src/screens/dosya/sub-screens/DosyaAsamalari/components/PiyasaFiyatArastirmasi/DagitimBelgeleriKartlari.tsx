import React from "react";
import {
  ExternalLink,
  FileCheck,
  FileSpreadsheet,
  Layers,
  Send,
  ShieldCheck,
} from "lucide-react";

interface DagitimBelgeleriKartlariProps {
  handleOpenSablonByDosyaAdi: (targetKey: string, firmData?: any) => void;
  handleOpenEkapSorgu: (firma?: any) => void;
}

export function DagitimBelgeleriKartlari({
  handleOpenSablonByDosyaAdi,
  handleOpenEkapSorgu,
}: DagitimBelgeleriKartlariProps): React.JSX.Element {
  return (
    <div className="rounded-2xl border border-indigo-100 dark:border-indigo-900/50 bg-gradient-to-br from-indigo-50/50 via-white to-blue-50/40 dark:from-slate-900 dark:via-slate-950 dark:to-indigo-950/20 p-5 shadow-xs flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100/80 dark:border-indigo-950/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Send className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span>Teklif İsteme & Dağıtım Belgeleri</span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                Firmalara Gönderilecek Formlar
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Fiyat araştırma tutanağı öncesinde firmalara iletilecek resmi teklif mektuplarını ve boş cetvelleri üretin.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Kart 1: Teklif Mektubu (Dağıtımlı) */}
        <div className="flex flex-col justify-between p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 shadow-2xs hover:shadow-sm transition-all group">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0 group-hover:scale-105 transition-transform">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                Teklif Mektubu (Dağıtımlı)
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                İstekli firmaların isimlerinin yer aldığı toplu dağıtım listeli resmi yazı.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleOpenSablonByDosyaAdi("arastirma-mektubu")}
            className="mt-3 w-full py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Dağıtım Mektubunu Aç</span>
          </button>
        </div>

        {/* Kart 2: Karma Dağıtım Mektubu */}
        <div className="flex flex-col justify-between p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700 shadow-2xs hover:shadow-sm transition-all group">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0 group-hover:scale-105 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                Karma Dağıtım Mektubu
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Farklı kalem grupları içeren alımlar için dağıtım çizelgeli mektup.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleOpenSablonByDosyaAdi("fiyat-arastirma-mektubu")}
            className="mt-3 w-full py-1.5 px-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Karma Mektubu Aç</span>
          </button>
        </div>

        {/* Kart 3: Boş Birim Fiyat Teklif Cetveli */}
        <div className="flex flex-col justify-between p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 shadow-2xs hover:shadow-sm transition-all group">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                Birim Fiyat Teklif Cetveli
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                İstekli firmalara fiyatlarını doldurmaları için verilecek boş teklif formu.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleOpenSablonByDosyaAdi("birim-fiyat-teklif-mektubu")}
            className="mt-3 w-full py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Teklif Cetvelini Aç</span>
          </button>
        </div>

        {/* Kart 4: EKAP Yasaklılık Kontrolü & Tutanak */}
        <div className="flex flex-col justify-between p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-orange-300 dark:hover:border-orange-700 shadow-2xs hover:shadow-sm transition-all group">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 shrink-0 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                Yasaklılık Sorgulama & Tutanak
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                İhale yasağı kontrolü yapın ve yasaklılık sorgulama tutanağını düzenleyin.
              </p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => handleOpenEkapSorgu()}
              className="py-1.5 px-2 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 text-[11px] font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer border border-orange-200 dark:border-orange-800"
              title="EKAP üzerinden canlı sorgula"
            >
              <ExternalLink className="w-3 h-3 text-orange-600" />
              <span>EKAP Sorgu</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenSablonByDosyaAdi("yasaklilik-sorgulama-tutanagi")}
              className="py-1.5 px-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-[11px] font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
              title="Yasaklılık Sorgulama Tutanağını Aç"
            >
              <FileCheck className="w-3 h-3" />
              <span>Tutanağı Aç</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import {
  FileSpreadsheet,
  Layers,
  Send,
  Tag,
} from "lucide-react";
import { DAGITIM_BELGELERI_KARTLARI } from "../FiyatIstenenFirmalari/constants";

interface DagitimBelgeleriKartlariProps {
  handleOpenSablonByDosyaAdi: (targetKey: string, firmData?: any) => void;
  handleOpenEkapSorgu?: (firma?: any) => void;
}

const ICON_MAP = {
  Send,
  Layers,
  Tag,
  FileSpreadsheet,
};

const COLOR_STYLES = {
  indigo: {
    hoverBorder: "hover:border-indigo-300 dark:hover:border-indigo-700",
    iconBg: "bg-indigo-500/10",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    buttonBg: "bg-indigo-600 hover:bg-indigo-700",
  },
  purple: {
    hoverBorder: "hover:border-purple-300 dark:hover:border-purple-700",
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-600 dark:text-purple-400",
    buttonBg: "bg-purple-600 hover:bg-purple-700",
  },
  violet: {
    hoverBorder: "hover:border-violet-300 dark:hover:border-violet-700",
    iconBg: "bg-violet-500/10",
    iconColor: "text-violet-600 dark:text-violet-400",
    buttonBg: "bg-violet-600 hover:bg-violet-700",
  },
  emerald: {
    hoverBorder: "hover:border-emerald-300 dark:hover:border-emerald-700",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    buttonBg: "bg-emerald-600 hover:bg-emerald-700",
  },
};

export function DagitimBelgeleriKartlari({
  handleOpenSablonByDosyaAdi,
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
                Genel / Sayın İlgili Formları
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Fiyat araştırma tutanağı öncesinde firmalara genel/anonim (&quot;Sayın İlgili&quot;) olarak iletilecek resmi teklif mektuplarını ve boş cetvelleri üretin.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {DAGITIM_BELGELERI_KARTLARI.map((kart) => {
          const IconComponent = ICON_MAP[kart.iconName];
          const style = COLOR_STYLES[kart.themeColor];

          return (
            <div
              key={kart.id}
              className={`flex flex-col justify-between p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 ${style.hoverBorder} shadow-2xs hover:shadow-sm transition-all group`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-lg ${style.iconBg} ${style.iconColor} shrink-0 group-hover:scale-105 transition-transform`}
                >
                  <IconComponent className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    {kart.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {kart.description}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleOpenSablonByDosyaAdi(kart.templateKey)}
                className={`mt-3 w-full py-1.5 px-3 rounded-lg ${style.buttonBg} text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs`}
              >
                <IconComponent className="w-3.5 h-3.5" />
                <span>{kart.buttonText}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

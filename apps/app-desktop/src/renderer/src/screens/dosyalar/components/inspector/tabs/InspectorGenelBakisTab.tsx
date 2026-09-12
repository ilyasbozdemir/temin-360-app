import React from "react";
import { Briefcase, FileSpreadsheet } from "lucide-react";
import { formatMoney } from "../types";

interface InspectorGenelBakisTabProps {
  dosya: any;
  subData: any;
  toplamYaklasikMaliyet: number;
  onNavigateTab: (tab: "kunye" | "kalemler") => void;
}

export const InspectorGenelBakisTab: React.FC<InspectorGenelBakisTabProps> = ({
  dosya,
  subData,
  toplamYaklasikMaliyet,
  onNavigateTab,
}) => {
  const d = dosya;

  return (
    <div className="space-y-5 text-xs">
      {/* ÜST KPI KARTLARI */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20">
          <span className="text-[10.5px] font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
            Yaklaşık Maliyet
          </span>
          <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 block">
            ₺{formatMoney(toplamYaklasikMaliyet)}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">
            KDV Hariç Toplam
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20">
          <span className="text-[10.5px] font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
            İhtiyaç Kalemleri
          </span>
          <span className="text-base font-black text-blue-600 dark:text-blue-400 font-mono mt-0.5 block">
            {subData.kalemler.length} Kalem
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Malzeme / Hizmet
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20">
          <span className="text-[10.5px] font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
            İstekli Firmalar
          </span>
          <span className="text-base font-black text-purple-600 dark:text-purple-400 font-mono mt-0.5 block">
            {subData.firmalar.length} Firma
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {subData.teklifler.length} Birim Teklif
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20">
          <span className="text-[10.5px] font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
            Komisyon / Görevli
          </span>
          <span className="text-base font-black text-amber-600 dark:text-amber-400 font-mono mt-0.5 block">
            {subData.komisyon.length} Üye
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Piyasa / Muayene
          </span>
        </div>
      </div>

      {/* HIZLI ÖZET VE DETAY MATRİSİ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* SOL: Dosya & Süreç Özeti */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-600" />
              Temel Dosya Bilgileri
            </span>
            <button
              onClick={() => onNavigateTab("kunye")}
              className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
            >
              Tümünü Gör →
            </button>
          </div>
          <div className="p-4 space-y-2.5 text-xs divide-y divide-slate-100 dark:divide-slate-800/60">
            <div className="flex justify-between items-center pt-1 first:pt-0">
              <span className="text-slate-500">Dosya No:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {d.temin_no
                  ? `DT-${d.butce_yili || "2026"}/${d.temin_no}`
                  : `#${d.id}`}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-slate-500">Harcama Birimi:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-xs">
                {d.birim_adi || d.harcama_birimi || "Belirtilmemiş"}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-slate-500">KİK Maddesi / Usul:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {d.ihale_sekli || "4734 Sayılı KİK Md. 22/d"}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-slate-500">Bütçe Kodu / Yılı:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {d.butce_yili || "2026"} /{" "}
                {d.butce_kodu || d.ekonomik_kod || "03.2"}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-slate-500">Sözleşme Durumu:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {d.sozlesme_yapilacak_mi
                  ? "Sözleşme Yapılacak"
                  : "Sözleşme Yapılmayacak"}
              </span>
            </div>
          </div>
        </div>

        {/* SAĞ: İhtiyaç Listesi Hızlı Önizleme */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              İhtiyaç Kalemleri ({subData.kalemler.length})
            </span>
            <button
              onClick={() => onNavigateTab("kalemler")}
              className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
            >
              Detaylı Tablo →
            </button>
          </div>
          <div className="p-3">
            {subData.kalemler.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs italic">
                Henüz kalem eklenmemiş.
              </div>
            ) : (
              <div className="space-y-2">
                {subData.kalemler.slice(0, 4).map((k: any, idx: number) => (
                  <div
                    key={k.id || idx}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                  >
                    <div className="min-w-0 pr-2">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block truncate text-xs">
                        {k.kalem_adi}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {k.miktar} {k.olcu_birimi || k.birim || "Adet"}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs whitespace-nowrap">
                      ₺{formatMoney(k.yaklasik_maliyet_toplam)}
                    </span>
                  </div>
                ))}
                {subData.kalemler.length > 4 && (
                  <div className="text-center pt-1 text-[11px] text-slate-400">
                    +{subData.kalemler.length - 4} diğer kalem daha mevcut
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

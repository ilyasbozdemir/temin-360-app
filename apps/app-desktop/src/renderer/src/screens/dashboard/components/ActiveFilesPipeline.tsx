import React from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight, Plus, Sparkles } from "lucide-react";
import { Button } from "../../../components/ui/Button";

interface ActiveFilesPipelineProps {
  activeFiles: any[];
  getAsamaDetails: (asamaSira: number) => { name: string; color: string };
  formatCurrency: (value: number) => string;
  setSelectedFileForAI: (file: any) => void;
  setShowAIModal: (show: boolean) => void;
}

export const ActiveFilesPipeline: React.FC<ActiveFilesPipelineProps> = ({
  activeFiles,
  getAsamaDetails,
  formatCurrency,
  setSelectedFileForAI,
  setShowAIModal,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Aktif Temin Süreçleri ve Aşamaları
          </h3>
          <p className="text-[11px] text-slate-450 mt-0.5">
            Sistemde devam eden doğrudan temin dosyalarının işlem adımları
          </p>
        </div>
        <Link to="/dosyalar">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs font-bold text-blue-600 dark:text-blue-450 hover:bg-blue-50 dark:hover:bg-blue-950/20 flex items-center gap-1"
          >
            Tüm Dosyaları Gör
            <ChevronRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {activeFiles.length === 0
        ? (
          <div className="py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-center flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Henüz Doğrudan Temin Dosyası Yok
              </h4>
              <p className="text-xs text-slate-450 dark:text-slate-500 max-w-sm mt-1 mx-auto leading-relaxed">
                Süreç başlatmak için ilk satın alma talebinizi ("dosyaKonusu":
                "Lüzum Müzekkeresi",) girerek doğrudan temin dosyasını başlatın.
              </p>
            </div>
            <Link to="/dosyalar/yeni">
              <Button className="bg-blue-600 hover:bg-blue-700 text-xs font-bold py-2.5 px-5 rounded-xl shadow-xs cursor-pointer text-white">
                Yeni Doğrudan Temin Başlat
              </Button>
            </Link>
          </div>
        )
        : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pb-3">
                  <th className="py-3 px-4">Dosya Bilgisi</th>
                  <th className="py-3 px-4">Birim & Tür</th>
                  <th className="py-3 px-4 text-right">Yaklaşık Maliyet</th>
                  <th className="py-3 px-4">Süreç Aşaması</th>
                  <th className="py-3 px-4 text-center">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {activeFiles.map((file) => {
                  const asamaInfo = getAsamaDetails(file.durum_asama_id || 1);
                  return (
                    <tr
                      key={file.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group"
                    >
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex flex-col gap-1">
                          <span className="font-mono font-bold text-[10px] text-blue-600 dark:text-blue-450 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded w-max border border-blue-500/10">
                            {file.temin_no}
                          </span>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {file.konu}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-355">
                            {file.birim_adi || "Birim Belirtilmedi"}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                            Süreç Türü: {file.tur} Alımı
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <span className="font-mono font-bold text-xs text-slate-800 dark:text-slate-100">
                          {formatCurrency(file.yaklasik_maliyet)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border w-max ${asamaInfo?.color}`}
                          >
                            {asamaInfo?.name}
                          </span>
                          {/* Process Step Visual indicator */}
                          <div className="flex items-center gap-1.5">
                            {[1, 2, 3, 4, 5].map((step) => (
                              <div
                                key={step}
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                  step < (file.durum_asama_id || 1)
                                    ? "bg-emerald-500 w-4"
                                    : step === (file.durum_asama_id || 1)
                                    ? "bg-blue-500 w-6 animate-pulse"
                                    : "bg-slate-200 dark:bg-slate-850 w-2.5"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex justify-center items-center gap-2">
                          <Link to="/dosyalar">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1"
                            >
                              Detay
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                          <Button
                            onClick={() => {
                              setSelectedFileForAI(file);
                              setShowAIModal(true);
                            }}
                            className="h-8 px-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-500/20 flex items-center gap-1 cursor-pointer"
                          >
                            <Sparkles size={12} className="animate-pulse" />
                            AI
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
    </div>
  );
};

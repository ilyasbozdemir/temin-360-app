import React from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

interface TakipKalemlerVeFirmalarGridProps {
  kalemler: any[];
  firmalar: any[];
}

export function TakipKalemlerVeFirmalarGrid({
  kalemler,
  firmalar,
}: TakipKalemlerVeFirmalarGridProps): React.JSX.Element {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Malzemeler */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <h3 className="text-xs font-bold text-slate-855 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <span>📦</span> Malzeme / Hizmet Kalemleri
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-extrabold">
              {kalemler.length} Kalem
            </span>
          </h3>
          <Link
            to="/dosya/hazirlik-ve-ihtiyac"
            className="text-[11px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 hover:underline"
          >
            <span>Yönet & Ekle</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-inner max-h-[240px] overflow-y-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-655 dark:text-slate-400">
              <tr>
                <th className="p-3">Malzeme Adı</th>
                <th className="p-3 text-center">Miktar</th>
                <th className="p-3 text-center">Birim</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-600 dark:text-slate-450">
              {kalemler.map((item: any) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/55 dark:hover:bg-slate-900/10"
                >
                  <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                    {item.kalem_adi}
                  </td>
                  <td className="p-3 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                    {item.miktar}
                  </td>
                  <td className="p-3 text-center text-slate-500 dark:text-slate-400">
                    {item.olcu_birimi || item.birim || "Adet"}
                  </td>
                </tr>
              ))}
              {kalemler.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="p-6 text-center text-slate-400 italic"
                  >
                    Dosyada henüz kayıtlı malzeme bulunmuyor.{" "}
                    <Link
                      to="/dosya/hazirlik-ve-ihtiyac"
                      className="text-blue-600 underline font-semibold ml-1"
                    >
                      Kalem eklemek için tıklayın.
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tedarikçiler */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <h3 className="text-xs font-bold text-slate-855 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <span>💼</span> Teklif Veren İstekliler / Firmalar
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-extrabold">
              {firmalar.length} Firma
            </span>
          </h3>
          <Link
            to="/dosya/piyasa-fiyat-arastirmasi"
            className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1 hover:underline"
          >
            <span>Teklifleri Yönet</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-inner max-h-[240px] overflow-y-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-655 dark:text-slate-400">
              <tr>
                <th className="p-3">Firma Ünvanı</th>
                <th className="p-3 text-center">Teklif Durumu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-600 dark:text-slate-450">
              {firmalar.map((f: any) => (
                <tr
                  key={f.id}
                  className="hover:bg-slate-50/55 dark:hover:bg-slate-900/10"
                >
                  <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                    {f.unvan}
                  </td>
                  <td className="p-3 text-center">
                    <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 px-2.5 py-0.5 rounded-lg border border-emerald-100 dark:border-emerald-800 font-extrabold tracking-tight">
                      Teklif Eklendi
                    </span>
                  </td>
                </tr>
              ))}
              {firmalar.length === 0 && (
                <tr>
                  <td
                    colSpan={2}
                    className="p-6 text-center text-slate-400 italic"
                  >
                    Dosyada henüz kayıtlı firma teklifi bulunmuyor.{" "}
                    <Link
                      to="/dosya/piyasa-fiyat-arastirmasi"
                      className="text-emerald-600 underline font-semibold ml-1"
                    >
                      Firma davet etmek için tıklayın.
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

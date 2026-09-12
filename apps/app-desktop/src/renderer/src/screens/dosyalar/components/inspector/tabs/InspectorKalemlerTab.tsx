import React from "react";
import { formatMoney } from "../types";

interface InspectorKalemlerTabProps {
  kalemler: any[];
  toplamYaklasikMaliyet: number;
}

export const InspectorKalemlerTab: React.FC<InspectorKalemlerTabProps> = ({
  kalemler,
  toplamYaklasikMaliyet,
}) => {
  if (kalemler.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs italic">
        Bu dosyaya henüz malzeme veya ihtiyaç kalemi eklenmemiş.
      </div>
    );
  }

  return (
    <div className="space-y-3 text-xs">
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-extrabold text-[10px] uppercase border-b border-slate-200 dark:border-slate-700">
              <th className="py-2 px-3 w-10 text-center">Sıra</th>
              <th className="py-2 px-3">Kalem / Malzeme Adı</th>
              <th className="py-2 px-3 text-right">Miktar</th>
              <th className="py-2 px-3 text-center">Birim</th>
              <th className="py-2 px-3 text-center">KDV</th>
              <th className="py-2 px-3 text-right">Yaklaşık Birim Fiyat</th>
              <th className="py-2 px-3 text-right">Toplam Tutar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {kalemler.map((item, idx) => (
              <tr
                key={item.id || idx}
                className="hover:bg-blue-50/30 dark:hover:bg-blue-950/20"
              >
                <td className="py-2 px-3 text-center text-slate-400 font-bold">
                  {item.sira_no || idx + 1}
                </td>
                <td className="py-2 px-3">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {item.kalem_adi}
                  </span>
                  {item.aciklama && (
                    <span className="text-[10px] text-slate-400 block">
                      {item.aciklama}
                    </span>
                  )}
                </td>
                <td className="py-2 px-3 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                  {item.miktar}
                </td>
                <td className="py-2 px-3 text-center text-slate-500">
                  {item.olcu_birimi || item.birim || "Adet"}
                </td>
                <td className="py-2 px-3 text-center text-slate-500">
                  %{item.kdv_orani || 20}
                </td>
                <td className="py-2 px-3 text-right font-mono">
                  {formatMoney(item.yaklasik_maliyet_birim)} ₺
                </td>
                <td className="py-2 px-3 text-right font-mono font-bold text-blue-600 dark:text-blue-400">
                  {formatMoney(item.yaklasik_maliyet_toplam)} ₺
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-slate-50 dark:bg-slate-950 font-bold border-t border-slate-200 dark:border-slate-800">
              <td
                colSpan={6}
                className="py-2.5 px-3 text-right text-slate-500 uppercase text-[11px]"
              >
                Toplam Yaklaşık Maliyet:
              </td>
              <td className="py-2.5 px-3 text-right font-mono text-emerald-600 dark:text-emerald-400 text-xs font-black">
                ₺{formatMoney(toplamYaklasikMaliyet)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

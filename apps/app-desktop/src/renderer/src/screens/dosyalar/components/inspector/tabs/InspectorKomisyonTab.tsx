import React from "react";

interface InspectorKomisyonTabProps {
  komisyon: any[];
}

export const InspectorKomisyonTab: React.FC<InspectorKomisyonTabProps> = ({
  komisyon,
}) => {
  if (komisyon.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs italic">
        Komisyon üyesi veya piyasa araştırma görevlisi atanmamış.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-extrabold text-[10px] uppercase border-b border-slate-200 dark:border-slate-700">
              <th className="py-2 px-3 w-10 text-center">Sıra</th>
              <th className="py-2 px-3">Adı Soyadı</th>
              <th className="py-2 px-3">Kurum Ünvanı</th>
              <th className="py-2 px-3">Görevi</th>
              <th className="py-2 px-3 text-center">Durum</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {komisyon.map((k, idx) => (
              <tr
                key={k.id || idx}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/40"
              >
                <td className="py-2 px-3 text-center text-slate-400 font-bold">
                  {k.sira || idx + 1}
                </td>
                <td className="py-2 px-3 font-bold text-slate-800 dark:text-slate-200">
                  {k.ad_soyad}
                </td>
                <td className="py-2 px-3 text-slate-500">
                  {k.personel_unvan || "-"}
                </td>
                <td className="py-2 px-3 font-bold text-blue-600 dark:text-blue-400">
                  {k.gorev_adi || k.gorev_kod || "-"}
                </td>
                <td className="py-2 px-3 text-center">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {k.asl_yedek || "ASIL"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

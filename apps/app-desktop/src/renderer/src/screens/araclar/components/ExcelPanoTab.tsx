import React, { useState } from 'react'
import { FileSpreadsheet } from 'lucide-react'
import { ayrıştırPanoTablosu, formatTL } from '../../../utils/ihale'

export function ExcelPanoTab(): React.JSX.Element {
  const [panoMetin, setPanoMetin] = useState<string>(
    '1\t15.01.01\tA4 Fotokopi Kağıdı 80 gr (Paket)\t500\tPaket\t145,50\n2\t15.02.04\tMavi Tükenmez Kalem (Kutu)\t120\tKutu\t85,00\n3\t18.04.12\tZımba Teli No:10 (Kutu)\t250\tKutu\t32,50'
  )

  const panoSonuc = ayrıştırPanoTablosu(panoMetin)

  return (
    <div className="space-y-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <FileSpreadsheet size={16} className="text-emerald-600" />
          Excel / E-Tablolardan Kopyalanan Tabloyu Yapıştırın (Ctrl+V)
        </h3>
        <span className="text-xs font-mono font-bold text-emerald-600">
          {panoSonuc.gecerliKalemSayisi} Kalem Algılandı
        </span>
      </div>

      <textarea
        rows={5}
        value={panoMetin}
        onChange={(e) => setPanoMetin(e.target.value)}
        placeholder="Excel'den hücreleri seçip buraya yapıştırın..."
        className="w-full font-mono text-xs p-3.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />

      <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-2xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="p-3">Sıra</th>
              <th className="p-3">Poz No</th>
              <th className="p-3">Malzeme / İş Açıklaması</th>
              <th className="p-3 text-right">Miktar</th>
              <th className="p-3">Birim</th>
              <th className="p-3 text-right">Birim Fiyat</th>
              <th className="p-3 text-right">Toplam Tutar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {panoSonuc.kalemler.map((k, i) => (
              <tr key={i} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                <td className="p-3 font-mono text-slate-400">{k.siraNo}</td>
                <td className="p-3 font-mono font-semibold text-blue-600">{k.pozNo || '-'}</td>
                <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{k.aciklama}</td>
                <td className="p-3 text-right font-mono">{k.miktar}</td>
                <td className="p-3 text-slate-500">{k.olcuBirimi}</td>
                <td className="p-3 text-right font-mono">{formatTL(k.birimFiyat)}</td>
                <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                  {formatTL(k.toplamTutar)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-50 dark:bg-slate-800/80 font-bold border-t border-slate-200 dark:border-slate-700">
            <tr>
              <td colSpan={6} className="p-3 text-right text-slate-600 dark:text-slate-300">
                GENEL TOPLAM:
              </td>
              <td className="p-3 text-right font-mono text-emerald-600 text-sm">
                {formatTL(panoSonuc.genelToplam)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

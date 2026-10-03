import React from 'react'
import { PackageCheck } from 'lucide-react'
import { MalKalemiItem } from '../types'

interface KabulTutanakKalemlerTableProps {
  kalemler: MalKalemiItem[]
  onUpdateKalem: (idx: number, field: keyof MalKalemiItem, val: string | number) => void
}

export function KabulTutanakKalemlerTable({
  kalemler,
  onUpdateKalem
}: KabulTutanakKalemlerTableProps): React.JSX.Element {
  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/50 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PackageCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Muayene ve Teslim Alınan Kalemler Cetveli (Malzeme Listesi)
          </h4>
        </div>
        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          Toplam {kalemler.length} Kalem
        </span>
      </div>

      <div className="overflow-x-auto max-h-60 border border-slate-200/80 dark:border-slate-800 rounded-lg">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
              <th className="py-2 px-2 w-10 text-center">Sıra</th>
              <th className="py-2 px-3 min-w-[160px]">Kalem / Malzeme Adı</th>
              <th className="py-2 px-2 min-w-[100px]">Özelliği</th>
              <th className="py-2 px-2 w-16 text-center">Birimi</th>
              <th className="py-2 px-2 w-20 text-center" title="İhtiyaç Listesindeki Miktar">
                İhtiyaç
              </th>
              <th
                className="py-2 px-2 w-20 text-center"
                title="Önceki Tutanaklarda Kabul Edilen Miktar"
              >
                Önceki
              </th>
              <th
                className="py-2 px-2 w-24 text-center"
                title="Bu Muayene Tutanağında Kabul Edilen Miktar"
              >
                Bu Kabul *
              </th>
              <th className="py-2 px-2 w-24 text-right" title="Kalem Birim Fiyatı (₺)">
                Birim Fiyatı (₺)
              </th>
              <th
                className="py-2 px-2 w-28 text-right"
                title="Bu Tutanağa Ait Kabul Tutarı (₺)"
              >
                Kabul Tutarı (₺)
              </th>
              <th
                className="py-2 px-2 w-20 text-center"
                title="Kalan Teslim Edilecek Miktar Bakiyesi"
              >
                Kalan Bakiye
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800 bg-white dark:bg-slate-900">
            {kalemler.map((kalem, idx) => {
              const ihtiyac = Number(kalem.miktari || 0)
              const onceki = Number(kalem.oncekiTeslimAlinan || 0)
              const buKabul = Number(kalem.kabulMiktari || 0)
              const bFiyat = Number(kalem.birimFiyati || 0)
              const kalemTutar = buKabul * bFiyat
              const bakiye = Math.max(0, ihtiyac - (onceki + buKabul))

              return (
                <tr
                  key={kalem.siraNo || idx}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <td className="py-2 px-2 text-center font-bold text-slate-500">
                    {kalem.siraNo || idx + 1}
                  </td>
                  <td className="py-2 px-3 font-semibold text-slate-800 dark:text-slate-100">
                    {kalem.malzemeAdi || `Kalem #${idx + 1}`}
                  </td>
                  <td className="py-2 px-2 text-slate-500 dark:text-slate-400">
                    {kalem.ozelligi || '-'}
                  </td>
                  <td className="py-2 px-2 text-center">
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-medium">
                      {kalem.birimi || 'Adet'}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                    {ihtiyac}
                  </td>
                  <td className="py-2 px-2 text-center">
                    <span className="inline-block px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono text-xs rounded font-bold">
                      {onceki}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-center">
                    <input
                      type="number"
                      min={0}
                      value={kalem.kabulMiktari ?? 0}
                      onChange={(e) =>
                        onUpdateKalem(idx, 'kabulMiktari', Math.max(0, Number(e.target.value)))
                      }
                      className="w-full h-8 px-1.5 text-center font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 rounded-lg text-xs font-mono focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    />
                  </td>
                  <td className="py-2 px-2 text-right">
                    <input
                      type="number"
                      step="any"
                      min={0}
                      value={kalem.birimFiyati ?? 0}
                      onChange={(e) =>
                        onUpdateKalem(idx, 'birimFiyati', Math.max(0, Number(e.target.value)))
                      }
                      className="w-full h-8 px-1.5 text-right font-mono bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td className="py-2 px-2 text-right">
                    <span className="inline-block px-2 py-1 bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-mono text-xs rounded-lg font-bold">
                      {kalemTutar > 0
                        ? kalemTutar.toLocaleString('tr-TR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          }) + ' ₺'
                        : '0,00 ₺'}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-center">
                    {bakiye === 0 ? (
                      <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                        Tam (0)
                      </span>
                    ) : (
                      <span
                        className="inline-block px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold text-[10px]"
                        title="Teslim edilecek kalan bakiye"
                      >
                        Kalan: {bakiye}
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

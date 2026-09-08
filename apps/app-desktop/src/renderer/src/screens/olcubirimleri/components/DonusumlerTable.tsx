import React from 'react'
import { Edit2, Trash2 } from 'lucide-react'
import { BirimDonusum } from '../olcubirimleri.hooks'
import { cn } from '../../../utils/cn'

interface DonusumlerTableProps {
  filteredDonusumler: BirimDonusum[]
  isLoading: boolean
  onEdit: (donusum: BirimDonusum) => void
  onDelete: (id: number) => void
}

export const DonusumlerTable: React.FC<DonusumlerTableProps> = ({
  filteredDonusumler,
  isLoading,
  onEdit,
  onDelete
}) => {
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead className="bg-slate-50 dark:bg-slate-800/60 sticky top-0 z-10 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="py-2.5 px-4 font-bold text-xs text-slate-600 dark:text-slate-300 w-16">ID</th>
              <th className="py-2.5 px-4 font-bold text-xs text-slate-600 dark:text-slate-300">Kaynak Birim</th>
              <th className="py-2.5 px-4 font-bold text-xs text-slate-600 dark:text-slate-300 text-center w-10">⇄</th>
              <th className="py-2.5 px-4 font-bold text-xs text-slate-600 dark:text-slate-300">Hedef Birim</th>
              <th className="py-2.5 px-4 font-bold text-xs text-slate-600 dark:text-slate-300">Dönüşüm Faktörü / Formülü</th>
              <th className="py-2.5 px-4 font-bold text-xs text-slate-600 dark:text-slate-300">Ters Formül</th>
              <th className="py-2.5 px-4 font-bold text-xs text-slate-600 dark:text-slate-300">Açıklama</th>
              <th className="py-2.5 px-4 font-bold text-xs text-slate-600 dark:text-slate-300 text-center w-20">Durum</th>
              <th className="py-2.5 px-4 font-bold text-xs text-slate-600 dark:text-slate-300 text-right w-24">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {isLoading ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400">
                  Yükleniyor...
                </td>
              </tr>
            ) : filteredDonusumler.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-500">
                  Henüz kayıtlı özel birim dönüşüm kuralı bulunmuyor.
                </td>
              </tr>
            ) : (
              filteredDonusumler.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group">
                  <td className="py-3 px-4 font-mono text-slate-400">#{d.id}</td>
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                    {d.kaynak_ad} {d.kaynak_kisa_ad ? <span className="font-mono text-xs text-slate-400">({d.kaynak_kisa_ad})</span> : ''}
                  </td>
                  <td className="py-3 px-4 text-center text-blue-500 font-bold">➔</td>
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                    {d.hedef_ad} {d.hedef_kisa_ad ? <span className="font-mono text-xs text-slate-400">({d.hedef_kisa_ad})</span> : ''}
                  </td>
                  <td className="py-3 px-4 font-mono">
                    {d.formul ? (
                      <span className="font-bold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800/40">
                        {d.formul}
                      </span>
                    ) : (
                      <span className="font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800/40">
                        × {d.donusum_faktoru}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500">
                    {d.ters_formul || (d.donusum_faktoru ? `÷ ${d.donusum_faktoru}` : '-')}
                  </td>
                  <td className="py-3 px-4 text-slate-500">{d.aciklama || '-'}</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold',
                        d.aktif_mi
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60'
                          : 'bg-slate-100 text-slate-500'
                      )}
                    >
                      {d.aktif_mi ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEdit(d)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                        title="Düzenle"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => onDelete(d.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                        title="Sil"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

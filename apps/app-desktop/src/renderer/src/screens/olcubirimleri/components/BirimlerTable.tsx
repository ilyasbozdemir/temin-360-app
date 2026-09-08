import React from 'react'
import { Star, Edit2, Trash2 } from 'lucide-react'
import { OlcuBirimi, BIRIM_KATEGORILERI } from '../olcubirimleri.hooks'
import { getUnitIcon } from './BirimSelect'
import { cn } from '../../../utils/cn'

interface BirimlerTableProps {
  birimler: OlcuBirimi[]
  filteredBirimler: OlcuBirimi[]
  selectedKategori: string
  setSelectedKategori: (kategori: string) => void
  searchQuery: string
  isLoading: boolean
  onEdit: (birim: OlcuBirimi) => void
  onDelete: (id: number) => void
}

export const BirimlerTable: React.FC<BirimlerTableProps> = ({
  birimler,
  filteredBirimler,
  selectedKategori,
  setSelectedKategori,
  searchQuery,
  isLoading,
  onEdit,
  onDelete
}) => {
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Category Filter Pills */}
      <div className="flex-none p-3 border-b border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 overflow-x-auto flex items-center gap-1.5 scrollbar-thin">
        <button
          onClick={() => setSelectedKategori('TÜMÜ')}
          className={cn(
            'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all',
            selectedKategori === 'TÜMÜ'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/60'
          )}
        >
          Tümü ({birimler.length})
        </button>
        {BIRIM_KATEGORILERI.map((kat) => {
          const count = birimler.filter((b) => (b.kategori || 'Adet/Miktar') === kat).length
          return (
            <button
              key={kat}
              onClick={() => setSelectedKategori(kat)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border',
                selectedKategori === kat
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600'
              )}
            >
              {getUnitIcon(kat)}
              <span>{kat}</span>
              <span
                className={cn(
                  'text-[10px] px-1.5 py-0.2 rounded-full font-mono',
                  selectedKategori === kat
                    ? 'bg-blue-700 text-blue-100'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                )}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead className="bg-slate-50 dark:bg-slate-800/60 sticky top-0 z-10 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="py-2.5 px-4 font-bold text-xs text-slate-600 dark:text-slate-300 w-16">ID</th>
              <th className="py-2.5 px-4 font-bold text-xs text-slate-600 dark:text-slate-300">Ölçü Birimi</th>
              <th className="py-2.5 px-4 font-bold text-xs text-slate-600 dark:text-slate-300">Kategori</th>
              <th className="py-2.5 px-4 font-bold text-xs text-slate-600 dark:text-slate-300">Kısa Ad / Sembol</th>
              <th className="py-2.5 px-4 font-bold text-xs text-slate-600 dark:text-slate-300">Dönüşüm Faktörü</th>
              <th className="py-2.5 px-4 font-bold text-xs text-slate-600 dark:text-slate-300">Ondalık</th>
              <th className="py-2.5 px-4 font-bold text-xs text-slate-600 dark:text-slate-300 text-center">Durum</th>
              <th className="py-2.5 px-4 font-bold text-xs text-slate-600 dark:text-slate-300 text-right w-24">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  Yükleniyor...
                </td>
              </tr>
            ) : filteredBirimler.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500">
                  {searchQuery
                    ? 'Aramanızla eşleşen ölçü birimi bulunamadı.'
                    : 'Bu kategoride kayıtlı ölçü birimi bulunmuyor.'}
                </td>
              </tr>
            ) : (
              filteredBirimler.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group">
                  <td className="py-3 px-4 font-mono text-slate-400">#{b.id}</td>
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                    <div className="flex items-center gap-2">
                      <span>{b.ad}</span>
                      {b.temel_birim_mi ? (
                        <span
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40"
                          title="Kategori Temel / Referans Birimi"
                        >
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          Temel
                        </span>
                      ) : null}
                    </div>
                    {b.aciklama && <p className="text-[11px] text-slate-400 font-normal mt-0.5">{b.aciklama}</p>}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      {getUnitIcon(b.kategori)}
                      {b.kategori || 'Adet/Miktar'}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                    {b.kisa_ad || b.sembol ? (
                      <span className="bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                        {b.kisa_ad || '-'} {b.sembol && b.sembol !== b.kisa_ad ? `(${b.sembol})` : ''}
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                    {b.donusum_tipi === 'formula' ? (
                      <span className="text-purple-600 dark:text-purple-400 font-sans text-[11px]">Formüllü</span>
                    ) : (
                      <span>{b.donusum_faktoru ?? 1.0}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500">{b.ondalik_basamak ?? 2}</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold',
                        b.aktif_mi
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
                      )}
                    >
                      {b.aktif_mi ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEdit(b)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                        title="Düzenle"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => onDelete(b.id)}
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

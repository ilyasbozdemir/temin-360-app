import React, { useState } from 'react'
import {
  Eye,
  EyeOff,
  HelpCircle,
  Plus,
  Settings,
  Trash2
} from 'lucide-react'
import { PersonelCombobox } from '../PersonelCombobox'
import { KomisyonRowDetail } from './KomisyonRowDetail'
import type { KomisyonRow, PersonelItem } from './types'

interface KomisyonAtamaTableProps {
  rows: KomisyonRow[]
  personeller: PersonelItem[]
  gorevler?: string[]
  onPersonelChange: (sira: number, personelId: number | null) => void
  onGorevChange: (sira: number, newGorev: string) => void
  onToggleBelgedeGoster: (sira: number) => void
  onRowFieldChange?: (sira: number, field: keyof KomisyonRow, value: any) => void
  onAddRow: () => void
  onRemoveRow: (sira: number) => void
}

const DEFAULT_SUGGESTED_ROLES = [
  'Komisyon Başkanı',
  'Üye',
  'Fiyat Araştırma Görevlisi',
  'Harcama Yetkilisi',
  'Satın Alma Harcama Yetkilisi',
  'Gerçekleştirme Görevlisi',
  'Muhasebe Yetkilisi',
  'Yedek Üye',
  'Uzman Üye'
]

export const KomisyonAtamaTable: React.FC<KomisyonAtamaTableProps> = ({
  rows,
  personeller,
  gorevler = [],
  onPersonelChange,
  onGorevChange,
  onToggleBelgedeGoster,
  onRowFieldChange,
  onAddRow,
  onRemoveRow
}) => {
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({})

  const toggleRowExpanded = (sira: number) => {
    setExpandedRows((prev) => ({ ...prev, [sira]: !prev[sira] }))
  }

  const allRoles = Array.from(new Set([...DEFAULT_SUGGESTED_ROLES, ...gorevler]))

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
      <div className="max-h-[50vh] overflow-y-auto custom-scrollbar">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 shadow-2xs">
            <tr>
              <th className="py-2.5 px-3 font-bold text-slate-600 dark:text-slate-400 w-12 text-center border-r border-slate-200 dark:border-slate-800">
                #
              </th>
              <th className="py-2.5 px-3 font-bold text-slate-600 dark:text-slate-400 w-52 border-r border-slate-200 dark:border-slate-800">
                Komisyondaki Görevi / Rolü
              </th>
              <th className="py-2.5 px-3 font-bold text-slate-600 dark:text-slate-400">
                Atanan Personel (Ad Soyad / Unvan)
              </th>
              <th
                className="py-2.5 px-3 font-bold text-slate-600 dark:text-slate-400 w-32 text-center border-l border-slate-200 dark:border-slate-800"
                title="Resmi belge tablosunda ve dağıtımında listelensin mi?"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Belgede Göster</span>
                  <HelpCircle className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-2.5 px-2 w-20 border-l border-slate-200 dark:border-slate-800 text-center font-bold text-slate-600 dark:text-slate-400">
                Detay
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((row, idx) => {
              const isExpanded = !!expandedRows[row.sira]
              const hasCustomSettings =
                !!row.vekaletUnvani ||
                !!row.baslangicTarihi ||
                (row.belgeKapsami && row.belgeKapsami !== 'tumu') ||
                (Array.isArray(row.hedefBelgeler) && row.hedefBelgeler.length > 0)

              return (
                <React.Fragment key={row.sira}>
                  <tr
                    style={{ zIndex: rows.length - idx }}
                    className={`relative hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors ${
                      !row.belgedeGoster ? 'bg-slate-50/30 dark:bg-slate-900/30' : ''
                    }`}
                  >
                    <td className="py-2 px-3 text-center text-slate-500 font-medium border-r border-slate-100 dark:border-slate-800">
                      {row.sira}.
                    </td>
                    <td className="py-1.5 px-3 font-semibold text-slate-800 dark:text-slate-200 border-r border-slate-100 dark:border-slate-800">
                      <input
                        type="text"
                        list={`gorev-options-${row.sira}`}
                        value={row.gorev}
                        onChange={(e) => onGorevChange(row.sira, e.target.value)}
                        placeholder="Görev seçin veya yazın..."
                        className="w-full bg-slate-50/70 dark:bg-slate-850 hover:bg-white dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-slate-200/80 dark:border-slate-700 focus:border-blue-500 rounded-lg px-2.5 py-1 text-xs outline-none transition-all font-semibold"
                      />
                      <datalist id={`gorev-options-${row.sira}`}>
                        {allRoles.map((r, rIdx) => (
                          <option key={rIdx} value={r} />
                        ))}
                      </datalist>
                    </td>
                    <td className="py-1.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 min-w-0">
                          <PersonelCombobox
                            personeller={personeller}
                            selectedId={row.personelId}
                            onChange={(personelId) => onPersonelChange(row.sira, personelId)}
                          />
                        </div>
                        {row.vekaletUnvani && (
                          <span
                            className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 rounded-md shrink-0 border border-amber-200 dark:border-amber-800"
                            title={`Özelleştirilmiş Ünvan: ${row.vekaletUnvani}`}
                          >
                            {row.vekaletUnvani}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-1.5 px-3 text-center border-l border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => onToggleBelgedeGoster(row.sira)}
                        className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer w-full select-none ${
                          row.belgedeGoster
                            ? 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 shadow-2xs'
                            : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {row.belgedeGoster ? (
                          <>
                            <Eye className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span>Göster</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>Gizle</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-1.5 px-2 text-center border-l border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => toggleRowExpanded(row.sira)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer relative ${
                            isExpanded || hasCustomSettings
                              ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 font-bold'
                              : 'text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                          title="Özelleştirilmiş Görev Unvanı, Süre ve Belge Görünürlük Ayarları"
                        >
                          <Settings className="w-3.5 h-3.5" />
                          {hasCustomSettings && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full absolute top-0.5 right-0.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemoveRow(row.sira)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Satırı Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expandable Detail Section */}
                  {isExpanded && (
                    <KomisyonRowDetail
                      row={row}
                      personeller={personeller}
                      onRowFieldChange={onRowFieldChange}
                    />
                  )}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="p-2 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex justify-end">
        <button
          type="button"
          onClick={onAddRow}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 rounded-lg transition-all shadow-2xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Yeni Üye Ekle
        </button>
      </div>
    </div>
  )
}

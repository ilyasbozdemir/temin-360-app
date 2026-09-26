import React from 'react'
import { Plus, X } from 'lucide-react'
import { FormFieldV2, TableRowItem } from '../../../types/formBuilder.types'

interface InspectorTableManagerProps {
  activeField: FormFieldV2
  onAddTableRow: () => void
  onUpdateTableRow: (rowId: string, updates: Partial<TableRowItem>) => void
  onDeleteTableRow: (rowId: string) => void
}

export const InspectorTableManager: React.FC<InspectorTableManagerProps> = ({
  activeField,
  onAddTableRow,
  onUpdateTableRow,
  onDeleteTableRow
}) => {
  const calculateTableTotal = (rows?: TableRowItem[]): number => {
    if (!rows || rows.length === 0) return 0
    return rows.reduce((acc, r) => {
      const top =
        typeof r.toplamFiyat === 'number' ? r.toplamFiyat : parseFloat(String(r.toplamFiyat)) || 0
      return acc + top
    }, 0)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
          Tablo Kalemleri ({activeField.tableRows?.length || 0})
        </span>
        <button
          type="button"
          onClick={onAddTableRow}
          className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold shadow-xs cursor-pointer transition-all"
        >
          <Plus className="w-3 h-3" />
          <span>+ Satır Ekle</span>
        </button>
      </div>

      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {activeField.tableRows?.map((row) => (
          <div
            key={row.id}
            className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                #{row.sira} Kalem
              </span>
              <button
                type="button"
                onClick={() => onDeleteTableRow(row.id)}
                className="text-slate-400 hover:text-red-500 p-0.5 rounded cursor-pointer"
                title="Satırı Sil"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div>
              <input
                type="text"
                placeholder="Mal / Hizmet Adı"
                value={row.ad}
                onChange={(e) => onUpdateTableRow(row.id, { ad: e.target.value })}
                className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              <div>
                <label className="text-[9px] text-slate-500 block mb-0.5">Miktar</label>
                <input
                  type="number"
                  value={row.miktar}
                  onChange={(e) =>
                    onUpdateTableRow(row.id, {
                      miktar: parseFloat(e.target.value) || 0
                    })
                  }
                  className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-[9px] text-slate-500 block mb-0.5">Birim</label>
                <input
                  type="text"
                  value={row.birim}
                  onChange={(e) => onUpdateTableRow(row.id, { birim: e.target.value })}
                  className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-[9px] text-slate-500 block mb-0.5">Birim Fiyat (₺)</label>
                <input
                  type="number"
                  value={row.birimFiyat}
                  onChange={(e) =>
                    onUpdateTableRow(row.id, {
                      birimFiyat: parseFloat(e.target.value) || 0
                    })
                  }
                  className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl text-xs font-bold flex justify-between text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-xs">
        <span>Genel Toplam:</span>
        <span className="text-emerald-600 dark:text-emerald-400 font-mono">
          {calculateTableTotal(activeField.tableRows).toLocaleString('tr-TR', {
            minimumFractionDigits: 2
          })}{' '}
          ₺
        </span>
      </div>
    </div>
  )
}

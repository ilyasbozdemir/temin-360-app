import React from 'react'
import { Building2, Edit2, Trash2 } from 'lucide-react'
import { Button } from '../../../components/ui/Button'

interface FirmaListProps {
  filtered: any[]
  dataViewMode: 'list' | 'table' | string
  handleViewClick: (firma: any) => void
  openEditModal: (e: React.MouseEvent, firma: any) => void
  handleDelete: (e: React.MouseEvent, id: number) => void
}

export const FirmaList: React.FC<FirmaListProps> = ({
  filtered,
  dataViewMode,
  handleViewClick,
  openEditModal,
  handleDelete
}) => {
  if (dataViewMode === 'list') {
    return (
      <div className="flex flex-col gap-3">
        {filtered.map((firma) => (
          <div
            key={firma.id}
            onClick={() => handleViewClick(firma)}
            className={`flex flex-col sm:flex-row p-3 border rounded-xl hover:border-blue-300 dark:hover:border-blue-800 transition-colors group relative cursor-pointer gap-4 sm:items-center ${
              firma.kara_liste === 1
                ? 'bg-red-50/20 border-red-200 dark:border-red-900/40'
                : 'bg-slate-50/50 dark:bg-slate-950/20 border-slate-150 dark:border-slate-850'
            }`}
          >
            <div
              className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center border text-blue-600 dark:text-blue-400 ${
                firma.kara_liste === 1
                  ? 'bg-red-100 dark:bg-red-950/50 border-red-200 dark:border-red-800 text-red-600'
                  : 'bg-blue-50 dark:bg-blue-900/30 border-blue-100 dark:border-blue-800/50'
              }`}
            >
              <Building2 className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 line-clamp-1">
                  {firma.unvan}
                </h3>
                {firma.kara_liste === 1 && (
                  <span className="font-bold text-[9px] text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/80 px-1.5 py-0.5 rounded animate-pulse">
                    KARA LİSTE
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {firma.firma_kodu && (
                  <span className="font-mono font-bold text-[10px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border border-blue-100/20 dark:border-blue-900/10 px-1.5 py-0.5 rounded">
                    {firma.firma_kodu}
                  </span>
                )}
                {firma.il && (
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    {firma.il}
                  </span>
                )}
                {Boolean(firma.deneyim_skoru) && (
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-1.5 py-0.5 rounded">
                    ⭐ {firma.deneyim_skoru}/5
                  </span>
                )}
              </div>
            </div>

            <div className="flex-1 min-w-[150px] text-xs text-slate-600 dark:text-slate-400">
              {firma.vergi_no && <div className="truncate">🏢 VN: {firma.vergi_no}</div>}
              {firma.telefon && <div>📞 {firma.telefon}</div>}
            </div>

            <div className="flex-1 min-w-[150px] text-xs text-slate-600 dark:text-slate-400 hidden lg:block">
              {firma.ilgili_adi && <div className="truncate">👤 {firma.ilgili_adi}</div>}
            </div>

            <div className="flex items-center gap-1 pr-2">
              <Button
                title="Düzenle"
                variant="ghost"
                size="sm"
                onClick={(e) => openEditModal(e, firma)}
                className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                title="Sil"
                variant="ghost"
                size="sm"
                onClick={(e) => handleDelete(e, firma.id)}
                className="h-8 w-8 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/15"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Table view fallback
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
        <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
          <tr>
            <th className="px-4 py-3">Ünvan</th>
            <th className="px-4 py-3">Firma Kodu</th>
            <th className="px-4 py-3">CRM & Skor</th>
            <th className="px-4 py-3">Vergi No</th>
            <th className="px-4 py-3">Şehir</th>
            <th className="px-4 py-3">Telefon</th>
            <th className="px-4 py-3 text-right">İşlemler</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {filtered.map((firma) => (
            <tr
              key={firma.id}
              onClick={() => handleViewClick(firma)}
              className={`hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors group cursor-pointer ${
                firma.kara_liste === 1 ? 'bg-red-50/10' : ''
              }`}
            >
              <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                <div className="flex items-center gap-2">
                  <span>{firma.unvan}</span>
                  {firma.kara_liste === 1 && (
                    <span className="font-bold text-[9px] text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950 px-1.5 py-0.5 rounded">
                      KARA LİSTE
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 font-mono">{firma.firma_kodu || '-'}</td>
              <td className="px-4 py-3">
                {Boolean(firma.deneyim_skoru) ? (
                  <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                    ⭐ {firma.deneyim_skoru}/5
                  </span>
                ) : (
                  <span className="text-xs text-slate-400">-</span>
                )}
              </td>
              <td className="px-4 py-3">{firma.vergi_no || '-'}</td>
              <td className="px-4 py-3">{firma.il || '-'}</td>
              <td className="px-4 py-3">{firma.telefon || '-'}</td>
              <td className="px-4 py-3 text-right">
                <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => openEditModal(e, firma)}
                    className="h-7 w-7 p-0 text-slate-400 hover:text-blue-600"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleDelete(e, firma.id)}
                    className="h-7 w-7 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/15"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

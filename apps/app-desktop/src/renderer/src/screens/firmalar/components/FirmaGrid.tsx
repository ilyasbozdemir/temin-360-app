import React from 'react'
import { Building2, Edit2, Trash2, Phone, User } from 'lucide-react'
import { Button } from '../../../components/ui/Button'

interface FirmaGridProps {
  filtered: any[]
  handleViewClick: (firma: any) => void
  openEditModal: (e: React.MouseEvent, firma: any) => void
  handleDelete: (e: React.MouseEvent, id: number) => void
}

export const FirmaGrid: React.FC<FirmaGridProps> = ({
  filtered,
  handleViewClick,
  openEditModal,
  handleDelete
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {filtered.map((firma) => (
        <div
          key={firma.id}
          onClick={() => handleViewClick(firma)}
          className={`flex flex-col p-5 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900/60 dark:to-slate-900 border rounded-2xl hover:border-blue-400 dark:hover:border-blue-500/80 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 group relative cursor-pointer overflow-hidden min-h-[175px] ${
            firma.kara_liste === 1
              ? 'border-red-300 dark:border-red-900/50 bg-red-50/10'
              : 'border-slate-200/80 dark:border-slate-800'
          }`}
        >
          {/* Accent line on top of card */}
          <div
            className={`absolute top-0 left-0 right-0 h-1 transition-opacity duration-300 ${
              firma.kara_liste === 1
                ? 'bg-red-500 opacity-100'
                : 'bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100'
            }`}
          />

          {/* Action buttons */}
          <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            <Button
              title="Düzenle"
              variant="ghost"
              size="sm"
              onClick={(e) => openEditModal(e, firma)}
              className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors border-0"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </Button>
            <Button
              title="Sil"
              variant="ghost"
              size="sm"
              onClick={(e) => handleDelete(e, firma.id)}
              className="h-8 w-8 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors border-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Badges row */}
          <div className="flex items-center gap-1.5 mb-3.5 pr-14 flex-wrap">
            {firma.kara_liste === 1 && (
              <span className="font-bold text-[9px] text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/80 border border-red-200 dark:border-red-800 px-2 py-0.5 rounded-lg tracking-wider animate-pulse flex items-center gap-1">
                🚫 KARA LİSTE
              </span>
            )}
            {firma.firma_kodu && (
              <span className="font-mono font-black text-[9px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border border-blue-100/50 dark:border-blue-900/30 px-2 py-0.5 rounded-lg tracking-wider">
                {firma.firma_kodu}
              </span>
            )}
            {firma.il && (
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-lg border border-slate-200/30 dark:border-slate-700/20">
                {firma.il}
              </span>
            )}
            {Boolean(firma.deneyim_skoru) && (
              <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border border-amber-200/50 dark:border-amber-800/30 px-1.5 py-0.5 rounded-lg">
                ⭐ {firma.deneyim_skoru}/5
              </span>
            )}
          </div>

          {/* Title */}
          <h4 className="font-black text-sm text-slate-800 dark:text-slate-100 line-clamp-2 mb-3.5 leading-snug flex-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {firma.unvan}
          </h4>

          {/* Info grid */}
          <div className="space-y-2 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/60 pt-3">
            {firma.vergi_no && (
              <div className="flex items-center gap-2 truncate">
                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">
                  VN:{' '}
                  <strong className="text-slate-655 dark:text-slate-355">{firma.vergi_no}</strong>{' '}
                  {firma.vergi_dairesi && `(${firma.vergi_dairesi})`}
                </span>
              </div>
            )}
            {firma.ilgili_adi && (
              <div className="flex items-center gap-2 truncate">
                <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{firma.ilgili_adi}</span>
              </div>
            )}
            {firma.telefon && (
              <div className="flex items-center gap-2 truncate">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{firma.telefon}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

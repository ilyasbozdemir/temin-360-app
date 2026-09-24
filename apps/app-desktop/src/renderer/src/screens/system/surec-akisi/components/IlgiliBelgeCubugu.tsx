import React from 'react'
import { FileText, Eye, Upload, Printer, ExternalLink, ArrowUpRight } from 'lucide-react'
import { Belge } from '../types'
import { getBelgeDurumBadge, getBelgeDurumLabel } from '../utils/helpers'

interface IlgiliBelgeCubuguProps {
  belgeAdi: string
  belgeler: Belge[]
  onPreview: (belge: Belge) => void
  onDosyalariEkle: (files: FileList | null, targetId: number) => void
  onNavigateCiktiMerkezi: () => void
  onSelectTab: (tab: string) => void
}

export const IlgiliBelgeCubugu: React.FC<IlgiliBelgeCubuguProps> = ({
  belgeAdi,
  belgeler,
  onPreview,
  onDosyalariEkle,
  onNavigateCiktiMerkezi,
  onSelectTab
}) => {
  const belge = belgeler.find((b) => b.ad === belgeAdi)
  if (!belge) return null

  return (
    <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 mb-4 shadow-xs">
      <div className="flex items-center gap-2 min-w-0">
        <FileText size={16} className="text-slate-400 shrink-0" />
        <span className="text-xs text-slate-600 dark:text-slate-400 truncate">
          İlgili belge:{' '}
          <span className="font-bold text-slate-900 dark:text-slate-100">{belge.ad}</span>
        </span>
        <span
          className={`text-[10px] px-2.5 py-0.5 rounded-lg border font-bold shrink-0 ${
            belge.pdfDosyaAdi
              ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
              : getBelgeDurumBadge(belge.durum)
          }`}
        >
          {belge.pdfDosyaAdi ? '✓ İmzalı PDF Var' : getBelgeDurumLabel(belge.durum)}
        </span>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onPreview(belge)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
          title="Önizle"
        >
          <Eye size={16} />
        </button>

        <label
          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
          title="İmzalı PDF Yükle & Teslim Al"
        >
          <Upload size={16} />
          <input
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => onDosyalariEkle(e.target.files, belge.id)}
          />
        </label>

        <button
          onClick={() => {
            onPreview(belge)
            setTimeout(() => window.print(), 300)
          }}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Yazdır"
        >
          <Printer size={16} />
        </button>
        <button
          onClick={onNavigateCiktiMerkezi}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Çıktı Merkezinde Aç"
        >
          <ExternalLink size={16} />
        </button>
        <button
          onClick={() => onSelectTab('belgeler')}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Belgeler sekmesine git"
        >
          <ArrowUpRight size={16} />
        </button>
      </div>
    </div>
  )
}

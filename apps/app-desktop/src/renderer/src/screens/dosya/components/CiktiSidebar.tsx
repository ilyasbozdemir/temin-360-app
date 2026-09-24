import React from 'react'
import {
  Printer,
  Download,
  FileText,
  CheckCircle2,
  Archive,
  FileSpreadsheet,
  Zap
} from 'lucide-react'
import { usePrintQueueStore } from '../../../store/printQueueStore'
import { useWorkspaceStore } from '../../../store/workspaceStore'

interface CiktiSidebarProps {
  selectedCount: number
  processing: boolean
  hasStarredDocs: boolean
  onPrintClick: () => void
  onDownloadClick: (action: 'pdf' | 'docx' | 'udf' | 'zip' | 'excel') => void
  onAutoProcessQueue?: () => void
}

export function CiktiSidebar({
  selectedCount,
  processing,
  hasStarredDocs,
  onPrintClick,
  onDownloadClick,
  onAutoProcessQueue
}: CiktiSidebarProps): React.JSX.Element {
  const { activeDosyaId } = useWorkspaceStore()
  const { getReadyCountForDosya } = usePrintQueueStore()
  const readyCount = getReadyCountForDosya(activeDosyaId)

  const canPrint = processing || selectedCount > 0 || hasStarredDocs || readyCount > 0

  return (
    <div className="w-full md:w-80 bg-slate-50 dark:bg-slate-900/50 p-6 flex flex-col gap-3">
      <div className="mb-2">
        <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Toplu İşlemler</h3>
        <p className="text-[11px] text-slate-500">
          Seçtiğiniz {selectedCount} belge{' '}
          {readyCount > 0 ? `ve kuyrukta bekleyen ${readyCount} belge ` : ''}için işlem yapın.
        </p>
      </div>

      {readyCount > 0 && (
        <button
          onClick={onAutoProcessQueue || onPrintClick}
          disabled={processing}
          className="w-full flex items-center gap-3 p-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 text-white rounded-2xl shadow-lg shadow-emerald-600/20 transition-all cursor-pointer border border-emerald-500/30"
        >
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
            <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
          </div>
          <div className="text-left flex-1">
            <div className="text-xs font-extrabold text-white flex items-center justify-between">
              <span>Kuyruktakileri Otomatik İşle</span>
              <span className="bg-white/25 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                {readyCount}
              </span>
            </div>
            <div className="text-[9px] text-emerald-100/90 mt-0.5">
              Kuyruktaki hazır belgeleri tek tıkla yazdır
            </div>
          </div>
        </button>
      )}

      <button
        onClick={onPrintClick}
        disabled={!canPrint || processing}
        className="w-full flex items-center gap-3 p-3.5 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-slate-900/10 cursor-pointer relative"
      >
        <Printer className="w-5 h-5 text-slate-300" />
        <div className="text-left flex-1">
          <div className="text-sm font-bold flex items-center justify-between">
            <span>Sırayla Yazdır</span>
            {readyCount > 0 && (
              <span className="bg-emerald-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 size={10} />
                {readyCount} Hazır
              </span>
            )}
          </div>
          <div className="text-[10px] text-slate-400">Yazdırma merkezine gönderilenler dahil</div>
        </div>
      </button>

      {/* TOPLU ZIP İNDİR */}
      <button
        onClick={() => onDownloadClick('zip')}
        disabled={processing || (selectedCount === 0 && readyCount === 0)}
        className="w-full flex items-center gap-3 p-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-600/15 cursor-pointer"
      >
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
          <Archive className="w-4 h-4" />
        </div>
        <div className="text-left flex-1">
          <div className="text-xs font-bold text-white">Toplu İndir (ZIP Arşivi)</div>
          <div className="text-[9px] text-white/80">
            Seçili / kuyruktaki belgeleri tek ZIP&apos;te topla
          </div>
        </div>
      </button>

      {/* MASTER EXCEL İNDİR */}
      <button
        onClick={() => onDownloadClick('excel')}
        disabled={processing}
        className="w-full flex items-center gap-3 p-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-emerald-600/15 cursor-pointer"
      >
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
          <FileSpreadsheet className="w-4 h-4" />
        </div>
        <div className="text-left flex-1">
          <div className="text-xs font-bold text-white">Master Excel İndir (.xlsx)</div>
          <div className="text-[9px] text-white/80">Tüm süreç, kalemler ve şablonlar</div>
        </div>
      </button>

      <div className="h-px bg-slate-200 dark:bg-slate-800 my-1"></div>

      <button
        onClick={() => onDownloadClick('pdf')}
        disabled={processing || (selectedCount === 0 && readyCount === 0)}
        className="w-full flex items-center gap-3 p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-900 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
      >
        <div className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-600 shrink-0">
          <Download className="w-4 h-4" />
        </div>
        <div className="text-left flex-1">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
            PDF Olarak İndir
          </div>
          <div className="text-[9px] text-slate-500">Ayrı ayrı PDF dosyaları</div>
        </div>
      </button>

      <button
        onClick={() => onDownloadClick('docx')}
        disabled={processing || (selectedCount === 0 && readyCount === 0)}
        className="w-full flex items-center gap-3 p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-900 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
      >
        <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 shrink-0">
          <FileText className="w-4 h-4" />
        </div>
        <div className="text-left flex-1">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Word (DOCX) İndir
          </div>
          <div className="text-[9px] text-slate-500">Düzenlenebilir ofis belgesi</div>
        </div>
      </button>

      <button
        onClick={() => onDownloadClick('udf')}
        disabled={processing || (selectedCount === 0 && readyCount === 0)}
        className="w-full flex items-center gap-3 p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-900 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
      >
        <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 shrink-0">
          <Download className="w-4 h-4" />
        </div>
        <div className="text-left flex-1">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300">UDF İndir</div>
          <div className="text-[9px] text-slate-500">UYAP formatında (Salt metin)</div>
        </div>
      </button>
    </div>
  )
}

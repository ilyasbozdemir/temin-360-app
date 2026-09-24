import React from 'react'
import { CheckCircle2, Edit3, Printer, Send, Star, X, Sparkles } from 'lucide-react'
import { Sablon } from '../../sablonlar/sablonlar.hooks'
import { usePrintQueueStore } from '../../../store/printQueueStore'
import { useWorkspaceStore } from '../../../store/workspaceStore'

interface CiktiPreviewModalProps {
  previewSablon: Sablon
  activeStarredDocs: string[]
  onClose: () => void
  onToggleStar: (sablonAd: string, e?: React.MouseEvent) => void
  srcDoc: string
  onPrintSingle?: (sablonId: number) => Promise<void>
  onOpenAdvancedEditor?: (sablon: Sablon) => void
}

export function CiktiPreviewModal({
  previewSablon,
  activeStarredDocs,
  onClose,
  onToggleStar,
  srcDoc,
  onPrintSingle,
  onOpenAdvancedEditor
}: CiktiPreviewModalProps): React.JSX.Element {
  const { activeDosyaId } = useWorkspaceStore()
  const { isInQueue, toggleReadyToPrint, getDocumentStatus, markAsPrinted } = usePrintQueueStore()

  const docKey = (previewSablon.dosya_adi || '').replace(/\.html$/, '')
  const isQueued = activeDosyaId ? isInQueue(activeDosyaId, docKey) : false
  const docStatus = activeDosyaId ? getDocumentStatus(activeDosyaId, docKey) : 'draft'

  const isStarred = activeStarredDocs.some(
    (d) => d.localeCompare(previewSablon.ad, 'tr', { sensitivity: 'base' }) === 0
  )

  const handleToggleQueue = (): void => {
    if (!activeDosyaId) return
    toggleReadyToPrint(activeDosyaId, docKey, previewSablon.ad)
  }

  const handleDirectPrint = async (): Promise<void> => {
    if (activeDosyaId) {
      markAsPrinted(activeDosyaId, docKey)
    }
    if (onPrintSingle) {
      await onPrintSingle(previewSablon.id)
    }
  }

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-3 md:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50/90 dark:bg-slate-950/80 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base truncate">
                  {previewSablon.ad}
                </h3>
                {docStatus === 'ready_to_print' ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700 shrink-0">
                    <CheckCircle2 size={11} className="text-emerald-600 dark:text-emerald-400" />
                    Yazdırmaya Hazır
                  </span>
                ) : docStatus === 'modified' ? (
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-700 shrink-0">
                    Düzenlendi / Kontrol Bekliyor
                  </span>
                ) : docStatus === 'printed' ? (
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800 shrink-0">
                    Yazdırıldı
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full shrink-0">
                    Taslak
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 font-mono truncate">
                {previewSablon.dosya_adi}
              </p>
            </div>
          </div>

          {/* Action Buttons in Header */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Hızlı Erişim Yıldız */}
            <button
              onClick={(e) => onToggleStar(previewSablon.ad, e)}
              className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                isStarred
                  ? 'bg-amber-50 text-amber-600 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-700'
                  : 'bg-white text-slate-500 hover:text-amber-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              }`}
              title={isStarred ? 'Hızlı Erişimden Çıkar' : 'Hızlı Erişime Ekle'}
            >
              <Star className={`w-4 h-4 ${isStarred ? 'fill-current' : ''}`} />
            </button>

            {/* Gelişmiş Düzenleyici Butonu */}
            {onOpenAdvancedEditor && (
              <button
                type="button"
                onClick={() => onOpenAdvancedEditor(previewSablon)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                title="Gelişmiş Belge Düzenleyici Modunu Aç"
              >
                <Edit3 className="w-3.5 h-3.5 text-blue-500" />
                <span>Düzenleyicide Aç</span>
              </button>
            )}

            {/* Yazdırma Sırasına Ekle / Çıkar */}
            <button
              type="button"
              onClick={handleToggleQueue}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border shadow-2xs ${
                isQueued
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
                  : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800/60 hover:bg-amber-100'
              }`}
            >
              {isQueued ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Yazdırmaya Hazır ✓</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Yazdırma Sırasına Ekle</span>
                </>
              )}
            </button>

            {/* Tekil Doğrudan Yazdır Butonu */}
            <button
              type="button"
              onClick={handleDirectPrint}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-blue-600/20"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Yazdır</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 bg-slate-100 dark:bg-slate-950 p-4 relative min-h-0 flex flex-col">
          <iframe
            srcDoc={srcDoc}
            className="w-full flex-1 bg-white rounded-2xl shadow-md border border-slate-200 dark:border-slate-800 overflow-auto"
            sandbox="allow-same-origin"
            title="Belge Önizleme"
          />
        </div>
      </div>
    </div>
  )
}

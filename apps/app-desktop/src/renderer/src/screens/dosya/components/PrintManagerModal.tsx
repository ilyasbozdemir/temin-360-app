import React, { useMemo } from 'react'
import { X, Printer, AlertCircle, Trash2, CheckCircle2, FileText } from 'lucide-react'
import { Sablon } from '../../sablonlar/sablonlar.hooks'
import { usePrintQueueStore } from '../../../store/printQueueStore'
import { useWorkspaceStore } from '../../../store/workspaceStore'

interface PrintManagerModalProps {
  isOpen: boolean
  onClose: () => void
  sablons: Sablon[]
  activeStarredDocs: string[]
  selectedIds: Set<number>
  onRemoveFromQueue: (sablonId: number) => void
  onPrint: (validSablonIds: number[]) => Promise<void>
  processing: boolean
  normalizeForMatch: (str: string) => string
  getMissingRequirement: (sablon: Sablon) => string | null
}

export function PrintManagerModal({
  isOpen,
  onClose,
  sablons,
  activeStarredDocs,
  selectedIds,
  onRemoveFromQueue,
  onPrint,
  processing,
  normalizeForMatch,
  getMissingRequirement
}: PrintManagerModalProps): React.JSX.Element | null {
  const { activeDosyaId } = useWorkspaceStore()
  const {
    getQueueForDosya,
    removeFromQueue,
    markAsPrinted,
    clearQueueForDosya
  } = usePrintQueueStore()

  const queuedDocs = getQueueForDosya(activeDosyaId)

  const queueItems = useMemo(() => {
    const items = new Map<
      number,
      { sablon: Sablon; source: 'queue' | 'selected' | 'starred'; isReadyFlag: boolean }
    >()

    if (!isOpen) return []

    // 1. First add documents explicitly sent to print queue (Ready to print)
    queuedDocs.forEach((qd) => {
      const sab = sablons.find(
        (s) =>
          normalizeForMatch(s.dosya_adi || '') === normalizeForMatch(`${qd.docKey}.html`) ||
          normalizeForMatch(s.ad) === normalizeForMatch(qd.title) ||
          normalizeForMatch(s.ad) === normalizeForMatch(qd.docKey)
      )
      if (sab) {
        items.set(sab.id, {
          sablon: sab,
          source: 'queue',
          isReadyFlag: qd.status === 'ready_to_print'
        })
      }
    })

    // 2. Add currently selected items
    sablons.forEach((s) => {
      if (selectedIds.has(s.id) && !items.has(s.id)) {
        items.set(s.id, {
          sablon: s,
          source: 'selected',
          isReadyFlag: false
        })
      }
    })

    // 3. Add starred quick access items
    activeStarredDocs.forEach((docName) => {
      const sablon = sablons.find((s) => normalizeForMatch(s.ad) === normalizeForMatch(docName))
      if (sablon && !items.has(sablon.id)) {
        items.set(sablon.id, {
          sablon,
          source: 'starred',
          isReadyFlag: false
        })
      }
    })

    return Array.from(items.values())
  }, [isOpen, sablons, activeStarredDocs, selectedIds, queuedDocs, normalizeForMatch])

  if (!isOpen) return null

  const validItems = queueItems.filter((item) => !getMissingRequirement(item.sablon))
  const invalidItems = queueItems.filter((item) => getMissingRequirement(item.sablon))
  const canPrint = validItems.length > 0

  const handlePrintAll = async (): Promise<void> => {
    const validIds = validItems.map((i) => i.sablon.id)
    // Mark queued docs as printed
    if (activeDosyaId) {
      validItems.forEach((i) => {
        const docKey = (i.sablon.dosya_adi || '').replace(/\.html$/, '')
        markAsPrinted(activeDosyaId, docKey)
      })
    }
    await onPrint(validIds)
  }

  const handleRemove = (item: { sablon: Sablon; source: 'queue' | 'selected' | 'starred' }): void => {
    if (item.source === 'queue' && activeDosyaId) {
      const docKey = (item.sablon.dosya_adi || '').replace(/\.html$/, '')
      removeFromQueue(activeDosyaId, docKey)
    }
    onRemoveFromQueue(item.sablon.id)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
              <Printer className="w-6 h-6 text-blue-500" />
              Çıktı & Yazdırma Yöneticisi
            </h2>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <span>Kuyruktaki toplam belge sayısı: <strong className="text-slate-700 dark:text-slate-300">{queueItems.length}</strong></span>
              {queuedDocs.filter((q) => q.status === 'ready_to_print').length > 0 && (
                <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 px-2 py-0.5 rounded-full font-extrabold text-[10px] border border-emerald-300 dark:border-emerald-700">
                  {queuedDocs.filter((q) => q.status === 'ready_to_print').length} Yazdırmaya Hazır
                </span>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {queueItems.length === 0 ? (
            <div className="text-center py-12">
              <Printer className="w-12 h-12 text-slate-200 dark:text-slate-800 mx-auto mb-4" />
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Yazdırma Sırasında Bekleyen Belge Yok
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Belge önizleme ekranından <strong>&quot;Yazdırma Sırasına Gönder&quot;</strong> butonuna tıklayarak veya sol menüden belgeleri seçerek kuyruğa ekleyebilirsiniz.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {queueItems.map((item, idx) => {
                const { sablon, isReadyFlag } = item
                const missingMsg = getMissingRequirement(sablon)
                return (
                  <div
                    key={`queue_${sablon.id ?? idx}_${sablon.dosya_adi || sablon.ad || idx}`}
                    className={`flex items-center gap-3.5 p-3.5 rounded-2xl border transition-all ${
                      missingMsg
                        ? 'bg-rose-50/50 border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/30'
                        : isReadyFlag
                        ? 'bg-emerald-50/40 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/30'
                        : 'bg-white border-slate-200 dark:bg-slate-900/50 dark:border-slate-800'
                    }`}
                  >
                    <div className="shrink-0">
                      {missingMsg ? (
                        <AlertCircle className="w-5 h-5 text-rose-500" />
                      ) : isReadyFlag ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <FileText className="w-5 h-5 text-blue-500" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-xs font-bold truncate ${
                            missingMsg
                              ? 'text-rose-700 dark:text-rose-400'
                              : 'text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {sablon.ad}
                        </p>
                        {isReadyFlag && (
                          <span className="text-[9px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-200 dark:border-emerald-800">
                            Yazdırmaya Hazır
                          </span>
                        )}
                      </div>
                      {missingMsg ? (
                        <p className="text-[10px] text-rose-500 mt-0.5">Eksik Veri: {missingMsg}</p>
                      ) : (
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {isReadyFlag ? 'Önizlemeden kuyruğa gönderildi' : 'Seçilen listeden eklendi'}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => handleRemove(item)}
                      className="shrink-0 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors cursor-pointer"
                      title="Kuyruktan Çıkar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 rounded-b-3xl">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs">
              <span className="text-slate-500">Yazdırılacak Belge Sayısı: </span>
              <strong className="text-emerald-600 dark:text-emerald-500 font-mono font-bold text-sm">
                {validItems.length}
              </strong>
              {invalidItems.length > 0 && (
                <span className="text-rose-500 ml-2 text-xs font-semibold">(Eksik Verili: {invalidItems.length})</span>
              )}
            </div>
            {activeDosyaId && queuedDocs.length > 0 && (
              <button
                type="button"
                onClick={() => clearQueueForDosya(activeDosyaId)}
                className="text-[10px] text-slate-400 hover:text-rose-600 font-semibold cursor-pointer underline"
              >
                Kuyruğu Temizle
              </button>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-5 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-all text-xs cursor-pointer"
            >
              Kapat
            </button>
            <button
              onClick={handlePrintAll}
              disabled={!canPrint || processing}
              className={`flex-[2] flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all text-xs cursor-pointer ${
                canPrint && !processing
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
              }`}
            >
              {processing ? (
                <>Yazdırılıyor...</>
              ) : (
                <>
                  <Printer className="w-4 h-4" />
                  Sırayla Toplu Yazdır ({validItems.length})
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


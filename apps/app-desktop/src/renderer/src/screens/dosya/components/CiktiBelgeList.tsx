import React from 'react'
import { CheckSquare, ChevronDown, ChevronRight, Loader2, Square } from 'lucide-react'
import { Sablon } from '../../sablonlar/sablonlar.hooks'
import { CiktiBelgeCard } from './CiktiBelgeCard'
import { StatusFilterType } from './CiktiStatusFilterTabs'
import { PrintStatus } from '../../../store/printQueueStore'

interface CiktiBelgeListProps {
  loading: boolean
  groupedSablons: Record<string, Sablon[]>
  expandedCategories: Set<string>
  selectedIds: Set<number>
  statusFilter: StatusFilterType
  activeDosyaId: number | null
  dosyaContext: any
  contextsByPath: any
  getMissingRequirement: (sablon: Sablon) => string | null
  getDocumentStatus: (dosyaId: number, docKey: string) => PrintStatus
  isDocumentLocked: (dosyaId: number, docKey: string) => boolean
  getDocumentLockInfo: (
    dosyaId: number,
    docKey: string
  ) => { isLocked: boolean; lockedAtVersion?: string; lockedAt?: string } | null
  toggleCategory: (kategori: string) => void
  toggleGroup: (kategori: string) => void
  toggleSelect: (id: number) => void
  unlockDocument: (dosyaId: number, docKey: string) => void
  toggleReadyToPrint: (dosyaId: number, docKey: string, docName: string) => void
  openDocument: (params: { documentId: string; dosyaId?: number; documentTitle: string }) => void
  handleAction: (
    action: 'pdf' | 'udf' | 'docx' | 'print' | 'zip' | 'excel',
    specificIds?: number[]
  ) => void
  handleOpenExternal: (sablon: Sablon) => void
}

export function CiktiBelgeList({
  loading,
  groupedSablons,
  expandedCategories,
  selectedIds,
  statusFilter,
  activeDosyaId,
  dosyaContext,
  contextsByPath,
  getMissingRequirement,
  getDocumentStatus,
  isDocumentLocked,
  getDocumentLockInfo,
  toggleCategory,
  toggleGroup,
  toggleSelect,
  unlockDocument,
  toggleReadyToPrint,
  openDocument,
  handleAction,
  handleOpenExternal
}: CiktiBelgeListProps): React.JSX.Element {
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400 py-12">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    )
  }

  const categoryKeys = Object.keys(groupedSablons)

  return (
    <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar">
      {categoryKeys.length === 0 && (
        <div className="py-12 text-center text-slate-400 text-sm">
          {statusFilter === 'ready' && 'Yazdırmaya hazır olarak işaretlenmiş belge bulunamadı.'}
          {statusFilter === 'starred' && 'Hızlı erişim için yıldızlanmış belge bulunamadı.'}
          {statusFilter === 'printed' && 'Bu dosyada henüz yazdırılan belge bulunamadı.'}
          {statusFilter === 'all' && 'Kayıtlı belge şablonu bulunamadı.'}
        </div>
      )}

      {Object.entries(groupedSablons).map(([kategori, items]) => {
        const isExpanded = expandedCategories.has(kategori)
        return (
          <div key={kategori} className="space-y-2">
            <div
              className="flex items-center justify-between px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg cursor-pointer transition-colors"
              onClick={() => toggleCategory(kategori)}
            >
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleGroup(kategori)
                  }}
                  className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  {items
                    .filter((i) => !getMissingRequirement(i))
                    .every((i) => selectedIds.has(i.id)) ? (
                    <CheckSquare className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                </button>
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  {kategori} ({items.length})
                </h4>
              </div>
              <div>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </div>
            </div>

            {isExpanded && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-4">
                {items.map((sablon) => {
                  const missingMsg = getMissingRequirement(sablon)
                  const docKey = (sablon.dosya_adi || '').replace(/\.html$/, '')
                  const docStatus = activeDosyaId
                    ? getDocumentStatus(activeDosyaId, docKey)
                    : 'draft'
                  const isLocked = activeDosyaId
                    ? isDocumentLocked(activeDosyaId, docKey)
                    : false
                  const lockInfo = activeDosyaId
                    ? getDocumentLockInfo(activeDosyaId, docKey)
                    : null

                  return (
                    <CiktiBelgeCard
                      key={`cikti_${sablon.id}_${docKey}`}
                      sablon={sablon}
                      isSelected={selectedIds.has(sablon.id)}
                      missingMsg={missingMsg}
                      docStatus={docStatus}
                      isLocked={isLocked}
                      lockInfo={lockInfo}
                      activeDosyaId={activeDosyaId}
                      dosyaContext={dosyaContext}
                      contextsByPath={contextsByPath}
                      onToggleSelect={toggleSelect}
                      onUnlock={(dKey, dName) => {
                        if (
                          confirm(
                            `"${dName}" belgesinin yazdırma kilidini açmak ve yeniden düzenlemeye izin vermek istiyor musunuz?`
                          )
                        ) {
                          if (activeDosyaId) {
                            unlockDocument(activeDosyaId, dKey)
                          }
                        }
                      }}
                      onToggleReady={(dKey, dName) => {
                        if (activeDosyaId) {
                          toggleReadyToPrint(activeDosyaId, dKey, dName)
                        }
                      }}
                      onPreview={(s) => {
                        const key = (s.dosya_adi || '').replace(/\.html$/, '')
                        openDocument({
                          documentId: key,
                          dosyaId: activeDosyaId || undefined,
                          documentTitle: s.ad
                        })
                      }}
                      onQuickPrint={(sId) => handleAction('print', [sId])}
                      onExport={(fmt, sId) => handleAction(fmt, [sId])}
                      onOpenExternal={handleOpenExternal}
                    />
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

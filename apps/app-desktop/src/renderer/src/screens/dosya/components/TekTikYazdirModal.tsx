import React, { useState, useMemo, useEffect } from 'react'
import {
  X,
  Printer,
  FileText,
  CheckCircle2,
  AlertCircle,
  Lock,
  Unlock,
  Download,
  Archive,
  ZoomIn,
  ZoomOut,
  Settings2,
  CheckSquare,
  Square,
  ChevronRight,
  ChevronLeft,
  FileCheck
} from 'lucide-react'
import { Sablon } from '../../sablonlar/sablonlar.hooks'
import {
  usePrintQueueStore,
  CURRENT_APP_VERSION,
  PrintSettings
} from '../../../store/printQueueStore'
import { useWorkspaceStore } from '../../../store/workspaceStore'

export interface TekTikYazdirModalProps {
  isOpen: boolean
  onClose: () => void
  sablons: Sablon[]
  activeDosya?: Record<string, unknown> | null
  activeStarredDocs?: string[]
  initialSelectedIds?: number[]
  renderHtml: (sablon: Sablon) => string
  onExecutePrint: (
    selectedSablons: Sablon[],
    action: 'print' | 'pdf' | 'zip',
    settings: PrintSettings
  ) => Promise<void>
  getMissingRequirement?: (sablon: Sablon) => string | null
  normalizeForMatch?: (str: string) => string
}

export function TekTikYazdirModal({
  isOpen,
  onClose,
  sablons,
  activeDosya,
  initialSelectedIds = [],
  renderHtml,
  onExecutePrint,
  getMissingRequirement,
  normalizeForMatch = (s) => s.toLowerCase()
}: TekTikYazdirModalProps): React.JSX.Element | null {
  const { activeDosyaId } = useWorkspaceStore()
  const {
    getDocumentStatus,
    isDocumentLocked,
    getDocumentLockInfo,
    unlockDocument,
    markAsPrinted
  } = usePrintQueueStore()

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<number>>(() => new Set(initialSelectedIds))
  const [activePreviewIndex, setActivePreviewIndex] = useState<number>(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [zoomLevel, setZoomLevel] = useState<number>(100)
  const [processingAction, setProcessingAction] = useState<'print' | 'pdf' | 'zip' | null>(null)
  const [showSettings, setShowSettings] = useState<boolean>(true)

  // Print settings
  const [printSettings, setPrintSettings] = useState<PrintSettings>({
    pageSize: 'A4',
    orientation: 'portrait',
    copies: 1,
    printBackground: true,
    showPageNumbers: true,
    scale: 100
  })

  // Auto-lock toggle
  const [autoLockOnPrint, setAutoLockOnPrint] = useState<boolean>(true)

  // Sync initialSelectedIds when modal opens
  useEffect(() => {
    if (!isOpen) return
    const timer = setTimeout(() => {
      if (initialSelectedIds.length > 0) {
        setSelectedIds(new Set(initialSelectedIds))
      } else {
        const validIds = sablons
          .filter((s) => !(getMissingRequirement && getMissingRequirement(s)))
          .map((s) => s.id)
        setSelectedIds(new Set(validIds))
      }
      setActivePreviewIndex(0)
    }, 0)
    return () => clearTimeout(timer)
  }, [isOpen, initialSelectedIds, sablons, getMissingRequirement])

  // Filtered sablons list
  const filteredSablons = useMemo(() => {
    if (!searchQuery.trim()) return sablons
    const q = normalizeForMatch(searchQuery)
    return sablons.filter(
      (s) =>
        normalizeForMatch(s.ad).includes(q) ||
        normalizeForMatch(s.dosya_adi || '').includes(q) ||
        normalizeForMatch(s.kategori || '').includes(q)
    )
  }, [sablons, searchQuery, normalizeForMatch])

  // Selected Sablons array
  const selectedSablons = useMemo(() => {
    return sablons.filter((s) => selectedIds.has(s.id))
  }, [sablons, selectedIds])

  // Active preview sablon
  const currentPreviewSablon = selectedSablons[activePreviewIndex] || selectedSablons[0] || null

  // Render HTML for current preview
  const previewHtml = useMemo(() => {
    if (!currentPreviewSablon) return ''
    try {
      return renderHtml(currentPreviewSablon)
    } catch (e) {
      console.error('Error rendering HTML in preview:', e)
      return '<div style="padding: 40px; color: red;">Belge render edilirken hata oluştu.</div>'
    }
  }, [currentPreviewSablon, renderHtml])

  if (!isOpen) return null

  const toggleSelect = (id: number): void => {
    const next = new Set(selectedIds)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    setSelectedIds(next)
    if (activePreviewIndex >= next.size) {
      setActivePreviewIndex(Math.max(0, next.size - 1))
    }
  }

  const selectAll = (): void => {
    const valid = sablons
      .filter((s) => !(getMissingRequirement && getMissingRequirement(s)))
      .map((s) => s.id)
    setSelectedIds(new Set(valid))
  }

  const selectNone = (): void => {
    setSelectedIds(new Set())
  }

  const selectReadyOnly = (): void => {
    if (!activeDosyaId) return
    const readyIds = sablons
      .filter((s) => {
        const docKey = (s.dosya_adi || '').replace(/\.html$/, '')
        const status = getDocumentStatus(activeDosyaId, docKey)
        return status === 'ready_to_print'
      })
      .map((s) => s.id)
    setSelectedIds(new Set(readyIds))
  }

  const handleUnlock = (sablon: Sablon, e: React.MouseEvent): void => {
    e.stopPropagation()
    if (!activeDosyaId) return
    const docKey = (sablon.dosya_adi || '').replace(/\.html$/, '')
    const confirmUnlock = window.confirm(
      `"${sablon.ad}" belgesinin yazdırma kilidini açmak ve yeniden düzenlemeye izin vermek istiyor musunuz?`
    )
    if (confirmUnlock) {
      unlockDocument(activeDosyaId, docKey)
    }
  }

  const handleAction = async (action: 'print' | 'pdf' | 'zip'): Promise<void> => {
    if (selectedSablons.length === 0) return
    setProcessingAction(action)
    try {
      if (autoLockOnPrint && activeDosyaId && (action === 'print' || action === 'pdf')) {
        selectedSablons.forEach((s) => {
          const docKey = (s.dosya_adi || '').replace(/\.html$/, '')
          markAsPrinted(activeDosyaId, docKey, CURRENT_APP_VERSION, printSettings)
        })
      }
      await onExecutePrint(selectedSablons, action, printSettings)
      if (action === 'print') {
        onClose()
      }
    } finally {
      setProcessingAction(null)
    }
  }

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-2 md:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl w-full max-w-[1550px] h-[92vh] flex flex-col overflow-hidden text-slate-100 animate-in zoom-in-95 duration-200">
        {/* TOP HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Printer size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold tracking-tight text-white">
                  Tek Tıkla Yazdırma & Çıktı Önizleme Merkezi
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  {CURRENT_APP_VERSION}
                </span>
                {Boolean(activeDosya?.dosya_no) && (
                  <span className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2.5 py-0.5 rounded-lg border border-slate-700">
                    Dosya No: {String(activeDosya?.dosya_no)}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Resmi evraklarınızı canlı sayfa düzeninde önizleyin, yazdırma ayarlarını yapılandırın ve tek seferde yazdırın.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                showSettings
                  ? 'bg-indigo-600/30 border-indigo-500/50 text-indigo-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Settings2 size={14} />
              Yazdırma Ayarları
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* MAIN 3-COLUMN OR 2-COLUMN BODY */}
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT: DOCUMENT SELECTOR & LOCK STATUS */}
          <div className="w-80 md:w-96 border-r border-slate-800 bg-slate-900/60 flex flex-col shrink-0">
            {/* Action toolbar */}
            <div className="p-3.5 border-b border-slate-800 bg-slate-950/40 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">
                  Seçilen Belgeler ({selectedIds.size}/{sablons.length})
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={selectAll}
                    className="text-[11px] font-medium text-indigo-400 hover:text-indigo-300 hover:underline"
                  >
                    Tümü
                  </button>
                  <span className="text-slate-600">|</span>
                  <button
                    onClick={selectReadyOnly}
                    className="text-[11px] font-medium text-emerald-400 hover:text-emerald-300 hover:underline"
                  >
                    Hazırlar
                  </button>
                  <span className="text-slate-600">|</span>
                  <button
                    onClick={selectNone}
                    className="text-[11px] font-medium text-slate-400 hover:text-slate-300 hover:underline"
                  >
                    Temizle
                  </button>
                </div>
              </div>

              {/* Search input */}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Belge veya şablon adı ara..."
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Document list */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
              {filteredSablons.map((sablon) => {
                const isSelected = selectedIds.has(sablon.id)
                const missingReq = getMissingRequirement ? getMissingRequirement(sablon) : null
                const docKey = (sablon.dosya_adi || '').replace(/\.html$/, '')
                const isLocked = activeDosyaId ? isDocumentLocked(activeDosyaId, docKey) : false
                const lockInfo = activeDosyaId ? getDocumentLockInfo(activeDosyaId, docKey) : null
                const docStatus = activeDosyaId ? getDocumentStatus(activeDosyaId, docKey) : 'draft'
                const isCurrentPreview =
                  currentPreviewSablon && currentPreviewSablon.id === sablon.id

                return (
                  <div
                    key={sablon.id}
                    onClick={() => {
                      if (!missingReq) {
                        toggleSelect(sablon.id)
                        const selIndex = selectedSablons.findIndex((s) => s.id === sablon.id)
                        if (selIndex >= 0) setActivePreviewIndex(selIndex)
                      }
                    }}
                    className={`group relative p-2.5 rounded-2xl border transition-all cursor-pointer select-none flex items-start gap-2.5 ${
                      missingReq
                        ? 'opacity-50 bg-slate-900/40 border-slate-800 cursor-not-allowed'
                        : isSelected
                        ? 'bg-indigo-950/30 border-indigo-500/50 shadow-sm'
                        : 'bg-slate-850/40 border-slate-800 hover:bg-slate-800/60 hover:border-slate-700'
                    } ${isCurrentPreview ? 'ring-1 ring-indigo-400/80' : ''}`}
                  >
                    {/* Checkbox */}
                    <div className="pt-0.5">
                      {isSelected ? (
                        <CheckSquare size={16} className="text-indigo-400" />
                      ) : (
                        <Square size={16} className="text-slate-600 group-hover:text-slate-400" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-xs font-semibold truncate ${
                            isSelected ? 'text-white' : 'text-slate-300'
                          }`}
                        >
                          {sablon.ad}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {/* Lock / Printed Badge */}
                        {isLocked ? (
                          <span
                            title={`Bu belge ${lockInfo?.lockedAtVersion || CURRENT_APP_VERSION} sürümünde yazdırıldı ve kilitlendi.`}
                            className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-950/80 text-amber-300 px-2 py-0.5 rounded-md border border-amber-700/60"
                          >
                            <Lock size={10} className="text-amber-400" />
                            {lockInfo?.lockedAtVersion || CURRENT_APP_VERSION} Kilitli
                          </span>
                        ) : docStatus === 'ready_to_print' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-950/80 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-700/60">
                            <CheckCircle2 size={10} className="text-emerald-400" />
                            Hazır
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-medium">Taslak</span>
                        )}

                        {sablon.kategori && (
                          <span className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">
                            {sablon.kategori}
                          </span>
                        )}
                      </div>

                      {missingReq && (
                        <p className="text-[11px] text-rose-400/90 mt-1 flex items-center gap-1">
                          <AlertCircle size={11} className="shrink-0" />
                          {missingReq}
                        </p>
                      )}
                    </div>

                    {/* Unlock action button if locked */}
                    {isLocked && (
                      <button
                        onClick={(e) => handleUnlock(sablon, e)}
                        title="Yazdırma Kilidini Aç"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-amber-950/50 transition-colors shrink-0"
                      >
                        <Unlock size={13} />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* CENTER: LIVE HIGH-RESOLUTION DOCUMENT PREVIEW */}
          <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden relative">
            {/* Preview Toolbar */}
            <div className="px-5 py-3 border-b border-slate-800 bg-slate-900/70 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <FileText size={16} className="text-indigo-400 shrink-0" />
                <span className="text-sm font-bold text-white truncate">
                  {currentPreviewSablon ? currentPreviewSablon.ad : 'Önizlenecek Belge Seçilmedi'}
                </span>
                {currentPreviewSablon && (
                  <span className="text-xs text-slate-400 font-mono hidden md:inline">
                    ({currentPreviewSablon.dosya_adi})
                  </span>
                )}
              </div>

              {/* Zoom & Page Navigation */}
              {selectedSablons.length > 0 && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-xl border border-slate-700 text-xs">
                    <button
                      onClick={() => setActivePreviewIndex((prev) => Math.max(0, prev - 1))}
                      disabled={activePreviewIndex === 0}
                      className="p-1 rounded text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <span className="font-semibold text-slate-200 px-1">
                      {activePreviewIndex + 1} / {selectedSablons.length}
                    </span>
                    <button
                      onClick={() =>
                        setActivePreviewIndex((prev) =>
                          Math.min(selectedSablons.length - 1, prev + 1)
                        )
                      }
                      disabled={activePreviewIndex >= selectedSablons.length - 1}
                      className="p-1 rounded text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-xl border border-slate-700 text-xs">
                    <button
                      onClick={() => setZoomLevel((z) => Math.max(50, z - 15))}
                      className="p-1 text-slate-300 hover:text-white cursor-pointer"
                      title="Uzaklaştır"
                    >
                      <ZoomOut size={14} />
                    </button>
                    <span className="font-mono text-slate-200 w-12 text-center">{zoomLevel}%</span>
                    <button
                      onClick={() => setZoomLevel((z) => Math.min(175, z + 15))}
                      className="p-1 text-slate-300 hover:text-white cursor-pointer"
                      title="Yakınlaştır"
                    >
                      <ZoomIn size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Document Content Viewport */}
            <div className="flex-1 overflow-auto p-6 flex justify-center bg-slate-950/90 custom-scrollbar">
              {currentPreviewSablon ? (
                <div
                  style={{
                    transform: `scale(${zoomLevel / 100})`,
                    transformOrigin: 'top center',
                    transition: 'transform 0.15s ease'
                  }}
                  className="shadow-2xl rounded-sm overflow-hidden bg-white text-black min-h-[1050px] w-[794px] shrink-0 my-2"
                >
                  <iframe
                    title="Live Preview"
                    srcDoc={previewHtml}
                    className="w-full h-full min-h-[1050px] border-0"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-12 text-slate-500 my-auto">
                  <Printer size={48} className="stroke-[1.5] mb-3 text-slate-600" />
                  <p className="text-base font-semibold text-slate-300">Önizleme İçin Belge Seçin</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    Sol listeden yazdırmak veya önizlemek istediğiniz resmi evrakları işaretleyin.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: PRINT SETTINGS PANEL */}
          {showSettings && (
            <div className="w-72 border-l border-slate-800 bg-slate-900/90 p-5 flex flex-col shrink-0 overflow-y-auto custom-scrollbar space-y-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <Settings2 size={13} className="text-indigo-400" />
                  Yazdırma Tercihleri
                </h3>

                <div className="space-y-4 text-xs">
                  {/* Page Size */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1.5">Kağıt Boyutu</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['A4', 'A3'] as const).map((size) => (
                        <button
                          key={size}
                          onClick={() => setPrintSettings({ ...printSettings, pageSize: size })}
                          className={`py-1.5 rounded-xl font-bold border transition-all ${
                            printSettings.pageSize === size
                              ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                              : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Orientation */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1.5">Sayfa Yönü</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { key: 'portrait', label: 'Dikey' },
                        { key: 'landscape', label: 'Yatay' }
                      ].map((ori) => (
                        <button
                          key={ori.key}
                          onClick={() =>
                            setPrintSettings({
                              ...printSettings,
                              orientation: ori.key as any
                            })
                          }
                          className={`py-1.5 rounded-xl font-bold border transition-all ${
                            printSettings.orientation === ori.key
                              ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                              : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                          }`}
                        >
                          {ori.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Copies */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1.5">Kopya Sayısı</label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={printSettings.copies || 1}
                      onChange={(e) =>
                        setPrintSettings({
                          ...printSettings,
                          copies: Math.max(1, parseInt(e.target.value) || 1)
                        })
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Print Background */}
                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={printSettings.printBackground ?? true}
                      onChange={(e) =>
                        setPrintSettings({
                          ...printSettings,
                          printBackground: e.target.checked
                        })
                      }
                      className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
                    />
                    <span className="text-slate-300 font-medium">Arka plan ve renkleri dahil et</span>
                  </label>
                </div>
              </div>

              {/* Document Locking Policy Box */}
              <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs space-y-2">
                <div className="flex items-center gap-2 text-indigo-300 font-bold">
                  <Lock size={14} className="text-indigo-400" />
                  Sürüm Kilitleme
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Yazdırılan resmi belgeler otomatik olarak <strong className="text-indigo-300">{CURRENT_APP_VERSION}</strong> sürüm damgası ile kilitlenir.
                </p>
                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={autoLockOnPrint}
                    onChange={(e) => setAutoLockOnPrint(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
                  />
                  <span className="text-slate-200 font-medium text-[11px]">Yazdırınca kilitle</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/95 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <FileCheck size={14} className="text-emerald-400" />
              <strong className="text-white">{selectedSablons.length}</strong> Belge Hazır
            </span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="hidden sm:inline">
              Kağıt:{' '}
              <strong className="text-slate-200">
                {printSettings.pageSize} ({printSettings.orientation === 'portrait' ? 'Dikey' : 'Yatay'})
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Export ZIP */}
            <button
              onClick={() => handleAction('zip')}
              disabled={selectedSablons.length === 0 || !!processingAction}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-200 hover:bg-slate-750 hover:text-white border border-slate-700 transition-all flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
            >
              <Archive size={14} />
              ZIP Paketi
            </button>

            {/* Export PDF */}
            <button
              onClick={() => handleAction('pdf')}
              disabled={selectedSablons.length === 0 || !!processingAction}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-200 hover:bg-slate-750 hover:text-white border border-slate-700 transition-all flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
            >
              <Download size={14} />
              PDF Olarak Kaydet
            </button>

            {/* DIRECT PRINT BUTTON */}
            <button
              onClick={() => handleAction('print')}
              disabled={selectedSablons.length === 0 || !!processingAction}
              className="px-6 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 disabled:opacity-40 cursor-pointer"
            >
              <Printer size={16} className="stroke-[2.5]" />
              {processingAction === 'print' ? 'Yazdırılıyor...' : '🖨️ Tek Tıkla Yazdır'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

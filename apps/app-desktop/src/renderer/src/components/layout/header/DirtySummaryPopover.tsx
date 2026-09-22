import React from 'react'
import {
  Check,
  ChevronDown,
  Clock,
  FileSpreadsheet,
  Layers,
  Save
} from 'lucide-react'
import { DirtySummaryData } from './header.types'

interface DirtySummaryPopoverProps {
  fileName?: string
  isDirty: boolean
  saveFeedback: string | null
  isDirtySummaryOpen: boolean
  toggleDirtySummary: () => void
  dirtySummaryRef: React.RefObject<HTMLDivElement | null>
  dirtySummary: DirtySummaryData | null
  isLoadingSummary: boolean
  handleSaveAndSync: () => Promise<void>
  setIsDirtySummaryOpen: (open: boolean) => void
}

export function DirtySummaryPopover({
  fileName,
  isDirty,
  saveFeedback,
  isDirtySummaryOpen,
  toggleDirtySummary,
  dirtySummaryRef,
  dirtySummary,
  isLoadingSummary,
  handleSaveAndSync,
  setIsDirtySummaryOpen
}: DirtySummaryPopoverProps): React.JSX.Element {
  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1 rounded-md text-xs transition-all pointer-events-auto z-40"
      style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
    >
      <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-200">
        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span
          className="max-w-[120px] md:max-w-[180px] lg:max-w-[240px] truncate font-semibold"
          title={fileName || 'Çalışma Dosyası'}
        >
          {fileName || 'Çalışma Dosyası'}
        </span>
      </div>

      <span className="text-slate-300 dark:text-slate-700 select-none hidden sm:inline">
        •
      </span>

      {saveFeedback ? (
        <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400 animate-pulse flex items-center gap-1">
          {saveFeedback}
        </span>
      ) : isDirty ? (
        <div className="relative z-50" ref={dirtySummaryRef}>
          <div className="inline-flex items-center shadow-xs rounded-full border border-amber-300/60 dark:border-amber-700/50 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300">
            <button
              onClick={handleSaveAndSync}
              className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-0.5 rounded-l-full text-[11px] font-semibold hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors cursor-pointer group"
              title="Değişiklikleri ana dosyaya kaydet (Ctrl+S)"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping mr-0.5 shrink-0" />
              <span className="hidden sm:inline">Değiştirildi (Kaydet)</span>
              <span className="sm:hidden">Kaydet</span>
              <Save className="w-3 h-3 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
            </button>
            <button
              onClick={toggleDirtySummary}
              className="px-1.5 py-0.5 border-l border-amber-300/50 dark:border-amber-700/40 rounded-r-full hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors cursor-pointer text-amber-700 dark:text-amber-300 flex items-center"
              title="Nelerin değiştiğini gör (Özet)"
            >
              <ChevronDown
                className={`w-3 h-3 transition-transform duration-150 ${
                  isDirtySummaryOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
          </div>

          {/* Tıklayınca Açılan Değişiklik Özeti Popover'ı */}
          {isDirtySummaryOpen && (
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-84 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-800 p-3.5 z-50 animate-in fade-in-0 zoom-in-95 duration-100 text-left drop-shadow-2xl">
              {/* Başlık */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-500" />
                  <span className="font-semibold text-xs text-slate-800 dark:text-slate-100">
                    Kaydedilmemiş Değişiklikler
                  </span>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                  {dirtySummary?.totalChanges || 1} işlem
                </span>
              </div>

              {/* Detay Listesi */}
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-0.5 custom-scrollbar text-[11px]">
                {isLoadingSummary ? (
                  <div className="py-4 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                    <span>Yükleniyor...</span>
                  </div>
                ) : dirtySummary && dirtySummary.items.length > 0 ? (
                  dirtySummary.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80"
                    >
                      <div className="flex flex-col min-w-0 pr-2">
                        <span
                          className="font-medium text-slate-700 dark:text-slate-200 truncate"
                          title={item.title}
                        >
                          {item.title}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {item.actionLabel} • Son: {item.lastTime}
                        </span>
                      </div>
                      <span className="shrink-0 font-semibold px-1.5 py-0.2 rounded text-[10px] bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-200/40 dark:border-amber-800/30">
                        +{item.count}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="py-4 text-center text-slate-500 dark:text-slate-400 text-xs flex flex-col items-center justify-center gap-1.5">
                    <FileSpreadsheet className="w-5 h-5 text-amber-500 opacity-80" />
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      {dirtySummary && dirtySummary.totalChanges > 0
                        ? `${dirtySummary.totalChanges} adet veri işlemi kaydedilmeyi bekliyor.`
                        : 'Çalışma dosyasında kaydedilmeyi bekleyen değişiklikler mevcut.'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Dosyayı senkronize etmek için aşağıdaki butona tıklayın.
                    </span>
                  </div>
                )}
              </div>

              {/* Son Değişiklik Saati */}
              {dirtySummary?.lastModifiedAt && (
                <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                  <Clock className="w-3 h-3" />
                  <span>Son Değişiklik: {dirtySummary.lastModifiedAt}</span>
                </div>
              )}

              {/* Aksiyon Butonları */}
              <div className="flex items-center justify-end gap-1.5 mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setIsDirtySummaryOpen(false)}
                  className="px-2.5 py-1 text-[11px] rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Kapat
                </button>
                <button
                  onClick={async () => {
                    setIsDirtySummaryOpen(false)
                    await handleSaveAndSync()
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-medium rounded-lg bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors cursor-pointer"
                >
                  <Save className="w-3 h-3" />
                  <span>Şimdi Kaydet (Ctrl+S)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/40 dark:border-emerald-800/40"
          title="Tüm değişiklikler çalışma dosyasına kaydedildi."
        >
          <Check className="w-3 h-3 text-emerald-500" />
          <span>Kaydedildi</span>
        </span>
      )}
    </div>
  )
}

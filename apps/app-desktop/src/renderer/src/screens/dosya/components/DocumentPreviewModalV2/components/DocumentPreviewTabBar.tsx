import React, { useState, useRef, useEffect } from 'react'
import { FileText, Plus, X, Layers, ChevronDown } from 'lucide-react'
import { DocumentPreviewTab } from '../../../../../store/globalDocumentPreviewStore'
import { TemplateOptionItem } from '../templateResolver'

interface DocumentPreviewTabBarProps {
  tabs: DocumentPreviewTab[]
  activeTabId: string | null
  onSwitchTab: (tabId: string) => void
  onCloseTab: (tabId: string) => void
  onAddTab?: (params: {
    documentId: string
    dosyaId?: number | null
    documentTitle?: string
  }) => void
  templateOptions?: TemplateOptionItem[]
  currentDosyaId?: number | null
}

export function DocumentPreviewTabBar({
  tabs,
  activeTabId,
  onSwitchTab,
  onCloseTab,
  onAddTab,
  templateOptions = [],
  currentDosyaId
}: DocumentPreviewTabBarProps): React.JSX.Element | null {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dropdownOpen])

  if (tabs.length === 0) return null

  return (
    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-100/90 dark:bg-slate-950/90 px-3 py-1 gap-2 shrink-0 select-none relative z-30">
      {/* Sekmeler Listesi */}
      <div className="flex items-center gap-1.5 min-w-0 flex-1 overflow-x-auto custom-scrollbar py-0.5">
        {tabs.map((tab) => {
          const isActive = tab.tabId === activeTabId
          const firmUnvan =
            typeof tab.selectedFirma?.unvan === 'string' ? (tab.selectedFirma.unvan as string) : ''
          const firmText = firmUnvan ? ` (${firmUnvan.substring(0, 18)}...)` : ''
          const titleText = tab.documentTitle || tab.documentId
          const dosyaText = tab.dosyaNo
            ? `${tab.dosyaNo} • `
            : tab.dosyaId
              ? `#${tab.dosyaId} • `
              : ''

          return (
            <div
              key={tab.tabId}
              onClick={() => onSwitchTab(tab.tabId)}
              className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border shrink-0 max-w-65 ${
                isActive
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/80 shadow-xs'
                  : 'bg-slate-50/70 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 border-transparent hover:bg-white/60 dark:hover:bg-slate-900/70 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title={`${dosyaText}${titleText}${firmText}`}
            >
              <FileText
                className={`w-3.5 h-3.5 shrink-0 ${
                  isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 opacity-70'
                }`}
              />

              <span className="truncate">
                {dosyaText}
                {titleText}
                {firmText}
              </span>

              {tabs.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onCloseTab(tab.tabId)
                  }}
                  className="p-0.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-red-500 opacity-60 group-hover:opacity-100 transition-opacity ml-1 shrink-0 cursor-pointer"
                  title="Sekmeyi Kapat"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Yeni Belge Aç Dropdown Butonu */}
      {onAddTab && templateOptions.length > 0 && (
        <div className="relative shrink-0 z-40" ref={menuRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200/80 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 text-xs font-bold transition-all cursor-pointer shadow-2xs"
            title="Yeni belgeyi sekmede aç"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sekme Ekle</span>
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-64 max-h-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2 z-50 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 px-2 py-1 uppercase tracking-wider">
                Yeni Sekmede Açılacak Belge
              </div>
              <div className="space-y-0.5 mt-1">
                {templateOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      onAddTab({
                        documentId: opt.id,
                        dosyaId: currentDosyaId,
                        documentTitle: opt.title
                      })
                      setDropdownOpen(false)
                    }}
                    className="w-full text-left flex items-center gap-2 p-2 rounded-xl text-xs hover:bg-blue-50 dark:hover:bg-blue-950/60 text-slate-700 dark:text-slate-200 font-semibold transition-colors cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span className="truncate">{opt.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

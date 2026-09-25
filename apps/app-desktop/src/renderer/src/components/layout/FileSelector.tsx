import React, { useState, useRef, useEffect } from 'react'
import { FolderOpen, Search, Check, ChevronDown, Sparkles } from 'lucide-react'
import { cn } from '../../utils/cn'
import { useWorkspaceStore } from '../../store/workspaceStore'
import { useQueryClient } from '@tanstack/react-query'

import { FormatUpgradeModal } from '../modals/FormatUpgradeModal'

export function FileSelector(): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFormatUpgradeModal, setShowFormatUpgradeModal] = useState(false)
  const [upgradeFilePath, setUpgradeFilePath] = useState<string | null>(null)

  const [recentFiles, setRecentFiles] = useState<
    { name: string; path: string; lastOpened: number }[]
  >([])
  const [selectedFile, setSelectedFile] = useState<{
    id: string
    name: string
    path: string
  } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const {
    createWorkspace,
    openWorkspace,
    fileName,
    activeFilePath,
    upgradeToTemin,
    convertAndOpenWorkspace
  } = useWorkspaceStore()
  const queryClient = useQueryClient()

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      window.electron?.ipcRenderer
        .invoke('app:get-recent-files')
        .then((files) => {
          if (files) setRecentFiles(files)
        })
        .catch(console.error)
    }
  }, [isOpen])

  const filteredFiles = recentFiles.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleUpgradeAndOpen = async (filePath: string): Promise<void> => {
    const result = await convertAndOpenWorkspace(filePath)
    if (result.success) {
      queryClient.clear()
    } else {
      throw new Error(result.error || 'Dönüştürme başarısız oldu.')
    }
  }

  const handleCreateNewFile = async () => {
    setIsOpen(false)
    try {
      const res = await window.electron?.ipcRenderer.invoke('dialog:showSaveDialog')
      if (!res.canceled && res.filePath) {
        const fileBaseName = res.filePath.split(/[/\\]/).pop() || 'Yeni Kurum'
        const projectName = fileBaseName.replace(/\.(temin|hkmp|dtal|dtm|dte|dta|tmn360)$/i, '')

        const result = await createWorkspace(res.filePath, projectName)
        if (result.success) {
          queryClient.clear()
        } else {
          alert(`Çalışma dosyası oluşturulamadı!\nHata: ${result.error || 'Bilinmeyen hata'}`)
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleOpenFile = async () => {
    setIsOpen(false)
    try {
      const res = await window.electron?.ipcRenderer.invoke('dialog:showOpenDialog')
      if (!res.canceled && res.filePath) {
        if (!res.filePath.toLowerCase().endsWith('.temin')) {
          setUpgradeFilePath(res.filePath)
          setShowFormatUpgradeModal(true)
          return
        }

        let result = await openWorkspace(res.filePath, false)
        if (result.requiresMigration) {
          result = await openWorkspace(res.filePath, true)
        }
        if (result.success) {
          queryClient.clear()
        } else {
          alert(`Çalışma dosyası açılamadı!\nHata: ${result.error || 'Bilinmeyen hata'}`)
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center justify-between w-64 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg border transition-all',
          isOpen
            ? 'border-blue-500 ring-2 ring-blue-500/20'
            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
        )}
      >
        <div className="flex items-center truncate">
          <FolderOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mr-2" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
            {fileName || 'Kurum Seçilmedi'}
          </span>
        </div>
        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
      </button>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden z-50 flex flex-col">
          {/* Search Input */}
          <div className="p-2 border-b border-slate-100 dark:border-slate-800">
            <div className="relative">
              <Search className="absolute left-2.5 top-2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder="Geçmiş kurumlarda ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border-none rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-slate-200"
              />
            </div>
          </div>

          {/* List */}
          <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
            {filteredFiles.length === 0 ? (
              <div className="px-3 py-4 text-center text-sm text-slate-500">
                Geçmiş kurum bulunamadı.
              </div>
            ) : (
              filteredFiles.map((file, index) => (
                <button
                  key={file.path || index}
                  onClick={async () => {
                    setSelectedFile(file as any)
                    setIsOpen(false)
                    setSearchQuery('')
                    if (!file.path.toLowerCase().endsWith('.temin')) {
                      setUpgradeFilePath(file.path)
                      setShowFormatUpgradeModal(true)
                      return
                    }
                    let r = await openWorkspace(file.path, false)
                    if (r.requiresMigration) {
                      r = await openWorkspace(file.path, true)
                    }
                    if (r.success) {
                      queryClient.clear()
                    }
                  }}
                  className={cn(
                    'w-full flex items-center justify-between px-2 py-2 text-sm rounded-md transition-colors text-left',
                    fileName === file.name || selectedFile?.path === file.path
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  )}
                >
                  <span className="truncate">{file.name}</span>
                  {(fileName === file.name || selectedFile?.path === file.path) && (
                    <Check className="w-4 h-4 shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>

          {/* Legacy File Upgrade to .temin Banner */}
          {activeFilePath && !activeFilePath.toLowerCase().endsWith('.temin') && (
            <div className="p-2 border-t border-amber-200 dark:border-amber-900/50 bg-amber-50/80 dark:bg-amber-950/40">
              <button
                onClick={async (): Promise<void> => {
                  setIsOpen(false)
                  const res = await upgradeToTemin()
                  if (res.success) {
                    alert('Çalışma dosyası başarıyla en güncel .temin formatına dönüştürüldü!')
                  } else {
                    alert(`Dönüştürme hatası: ${res.error}`)
                  }
                }}
                className="w-full text-center px-2.5 py-1.5 text-xs font-semibold text-amber-800 dark:text-amber-200 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/40 dark:hover:bg-amber-800/60 border border-amber-300 dark:border-amber-700 rounded-md transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>En Güncel Formata (.temin) Yükselt</span>
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex gap-2">
            <button
              onClick={handleOpenFile}
              className="flex-1 text-center px-3 py-1.5 text-sm font-semibold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
            >
              Çalışma Dosyası Aç
            </button>
            <button
              onClick={handleCreateNewFile}
              className="flex-1 text-center px-3 py-1.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-sm cursor-pointer"
            >
              Yeni Çalışma Dosyası
            </button>
          </div>
        </div>
      )}

      {/* Format Upgrade Modal */}
      <FormatUpgradeModal
        isOpen={showFormatUpgradeModal}
        filePath={upgradeFilePath}
        onClose={() => {
          setShowFormatUpgradeModal(false)
          setUpgradeFilePath(null)
        }}
        onUpgradeAndOpen={handleUpgradeAndOpen}
      />
    </div>
  )
}

import React, { useState } from 'react'
import { FileSpreadsheet, Download, Upload, FileDown, Loader2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from './DropdownMenu'

export interface ExcelActionsProps {
  tableName: string
  title?: string
  customFileName?: string
  uniqueCol?: string
  onImportSuccess?: (info?: { count: number; inserted: number; updated: number }) => void
  variant?: 'dropdown' | 'buttons' | 'compact'
  className?: string
}

export function ExcelActions({
  tableName,
  title,
  customFileName,
  uniqueCol,
  onImportSuccess,
  variant = 'dropdown',
  className
}: ExcelActionsProps): React.JSX.Element {
  const [loading, setLoading] = useState(false)

  const entityTitle = title || tableName.replace('TANIM_', '').replace(/_/g, ' ')

  const handleExport = async (): Promise<void> => {
    try {
      setLoading(true)
      const res = await window.electron.ipcRenderer.invoke(
        'db:export-table-excel',
        tableName,
        customFileName
      )
      if (res.success) {
        alert(`✅ ${entityTitle} listesi (${res.count} kayıt) başarıyla Excel dosyasına aktarıldı.`)
      } else if (res.error && res.error !== 'İptal edildi') {
        alert('Dışa aktarma hatası: ' + res.error)
      }
    } catch (err: any) {
      alert('Dışa aktarılırken hata: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadTemplate = async (): Promise<void> => {
    try {
      setLoading(true)
      const res = await window.electron.ipcRenderer.invoke(
        'db:export-table-template',
        tableName,
        customFileName ? `${customFileName}_Sablon.xlsx` : undefined
      )
      if (res.success) {
        alert(`✅ ${entityTitle} Excel veri giriş şablonu başarıyla indirildi.`)
      } else if (res.error && res.error !== 'İptal edildi') {
        alert('Şablon indirme hatası: ' + res.error)
      }
    } catch (err: any) {
      alert('Şablon indirilirken hata: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async (): Promise<void> => {
    try {
      setLoading(true)
      const res = await window.electron.ipcRenderer.invoke('db:import-table-excel', tableName, {
        uniqueCol
      })
      if (res.success) {
        alert(
          `✅ Excel İçe Aktarımı Tamamlandı!\n\n` +
            `• Toplam İşlenen: ${res.count} kayıt\n` +
            `• Yeni Eklenen: ${res.inserted || 0}\n` +
            `• Güncellenen (Override): ${res.updated || 0}`
        )
        if (onImportSuccess) {
          onImportSuccess(res)
        }
      } else if (res.error && res.error !== 'İptal edildi') {
        alert('İçe aktarma hatası: ' + res.error)
      }
    } catch (err: any) {
      alert('İçe aktarılırken hata: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  if (variant === 'buttons') {
    return (
      <div className={`flex items-center gap-1.5 ${className || ''}`}>
        <button
          type="button"
          onClick={handleExport}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
          title="Excel'e Aktar"
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : <FileSpreadsheet size={13} />}
          <span>Excel&apos;e Aktar</span>
        </button>

        <button
          type="button"
          onClick={handleImport}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
          title="Excel'den İçe Aktar (Aynı kayıtları günceller/override eder)"
        >
          <Upload size={13} />
          <span>Excel İçe Aktar</span>
        </button>

        <button
          type="button"
          onClick={handleDownloadTemplate}
          disabled={loading}
          className="p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
          title="Excel Şablonu İndir"
        >
          <FileDown size={15} />
        </button>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={loading}
          className={`flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100/80 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/50 rounded-lg text-xs font-bold transition-all shadow-2xs disabled:opacity-50 ${className || ''}`}
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <FileSpreadsheet size={14} />}
          <span>Excel İşlemleri</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-1.5">
        <DropdownMenuItem onClick={handleExport} className="gap-2 text-xs font-medium cursor-pointer">
          <Download size={14} className="text-emerald-600" />
          <span>Excel&apos;e Aktar (.xlsx)</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleImport} className="gap-2 text-xs font-medium cursor-pointer">
          <Upload size={14} className="text-blue-600" />
          <span>Excel&apos;den İçe Aktar (Override)</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleDownloadTemplate} className="gap-2 text-xs font-medium cursor-pointer">
          <FileDown size={14} className="text-amber-600" />
          <span>Excel Şablonu İndir</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

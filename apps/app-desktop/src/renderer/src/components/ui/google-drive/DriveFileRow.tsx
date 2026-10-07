import React from 'react'
import { Clock, Download, FileSpreadsheet, FolderDown, RefreshCw, Trash2 } from 'lucide-react'
import { Button } from '../Button'
import { formatDate } from '@renderer/utils/formatters'
import { GDriveFile, formatFileSize } from './gdriveUtils'

interface DriveFileRowProps {
  file: GDriveFile
  index: number
  total: number
  isDownloading: boolean
  isDeleting: boolean
  onDownload: (file: GDriveFile, overwriteActive: boolean) => void
  onDelete: (file: GDriveFile) => void
}

export function DriveFileRow({
  file,
  index,
  total,
  isDownloading,
  isDeleting,
  onDownload,
  onDelete
}: DriveFileRowProps): React.JSX.Element {
  const busy = isDownloading || isDeleting
  return (
    <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors">
      <div className="flex items-start gap-3 min-w-0 flex-1">
        <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
          <FileSpreadsheet size={18} />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <span
            className="text-xs font-bold text-slate-900 dark:text-slate-100 break-all select-all leading-snug"
            title={file.name}
          >
            {file.name}
          </span>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-2">
            {index === 0 && (
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
                En Güncel Sürüm
              </span>
            )}
            <span className="text-[9px] font-medium px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0">
              Sürüm #{total - index}
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300">
              <Clock size={11} className="text-slate-400" />
              {formatDate(file.modifiedTime)}
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span>Boyut: {formatFileSize(file.size)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
        <Button
          onClick={() => onDownload(file, true)}
          disabled={busy}
          title="Bu bulut yedeğini doğrudan mevcut aktif çalışma dosyanızın üzerine yazar ve anında geri yükler."
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shrink-0 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
        >
          {isDownloading ? (
            <>
              <RefreshCw size={12} className="animate-spin" />
              <span>Geri Yükleniyor...</span>
            </>
          ) : (
            <>
              <Download size={13} />
              <span>Aktif Dosyaya Aç</span>
            </>
          )}
        </Button>

        <Button
          onClick={() => onDownload(file, false)}
          disabled={busy}
          title="Masaüstüne yeni bir dosya olarak indir ve aç"
          className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium px-2.5 py-1.5 rounded-lg shrink-0 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <FolderDown size={13} />
          <span>Masaüstüne İndir</span>
        </Button>

        <Button
          onClick={() => onDelete(file)}
          disabled={busy}
          title="Bu yedeği Google Drive'dan sil"
          className="bg-slate-100 dark:bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-500 dark:text-slate-400 text-xs font-bold p-1.5 rounded-lg shrink-0 transition-colors cursor-pointer"
        >
          {isDeleting ? (
            <RefreshCw size={12} className="animate-spin text-rose-500" />
          ) : (
            <Trash2 size={13} />
          )}
        </Button>
      </div>
    </div>
  )
}

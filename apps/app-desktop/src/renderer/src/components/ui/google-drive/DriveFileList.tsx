import React from 'react'
import { HardDrive, RefreshCw, ShieldCheck } from 'lucide-react'
import { DriveFileRow } from './DriveFileRow'
import type { GoogleDriveState } from './useGoogleDrive'

export function DriveFileList({ gd }: { gd: GoogleDriveState }): React.JSX.Element {
  const { files, isLoadingList, isConnected } = gd

  return (
    <div className="space-y-2">
      {/* Güvenlik & Gizlilik Garantisi */}
      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-2">
        <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
        <span>
          <strong>Güvenlik ve İzolasyon Garantisi:</strong> Drive&apos;ınızdaki diğer şahsi
          dosyalarınıza kesinlikle erişilmez. Yalnızca <strong>TEMIN_360_YEDEKLER</strong>{' '}
          klasöründeki son 7 adet <strong>.dtal</strong> çalışma dosyası listelenir ve korunur.
        </span>
      </div>

      <div className="flex items-center justify-between pt-1">
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <HardDrive size={15} /> Klasör: TEMIN_360_YEDEKLER ({files.length})
        </h4>
        <span className="text-[10px] text-slate-400 font-mono">
          Google Drive / TEMIN_360_YEDEKLER
        </span>
      </div>

      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-950 max-h-64 overflow-y-auto">
        {isLoadingList ? (
          <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw size={16} className="animate-spin text-blue-500" /> Dosyalar listeleniyor...
          </div>
        ) : files.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500">
            {!isConnected
              ? 'Devam etmek için lütfen yukarıdan Google Hesabınızla bağlanın veya Access Token kaydedin.'
              : 'TEMIN_360_YEDEKLER klasöründe henüz proje yedek dosyası yok. Yukarıdaki "Aktif Dosyayı Buluta Yükle" butonuyla ilk yedeğinizi yükleyebilirsiniz.'}
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-850">
            {files.map((file, index) => (
              <DriveFileRow
                key={file.id}
                file={file}
                index={index}
                total={files.length}
                isDownloading={gd.downloadingId === file.id}
                isDeleting={gd.deletingId === file.id}
                onDownload={gd.handleDownloadFile}
                onDelete={gd.handleDeleteFile}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

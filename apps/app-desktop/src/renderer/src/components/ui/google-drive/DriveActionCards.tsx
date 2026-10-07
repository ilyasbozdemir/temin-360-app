import React from 'react'
import { AlertCircle, CheckCircle, Download, RefreshCw, Upload } from 'lucide-react'
import { Button } from '../Button'
import type { StatusMsg } from './gdriveUtils'
import type { GoogleDriveState } from './useGoogleDrive'

const statusCls: Record<StatusMsg['type'], string> = {
  success:
    'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300',
  error:
    'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300',
  info: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
}

export function StatusAlert({ msg }: { msg: StatusMsg | null }): React.JSX.Element | null {
  if (!msg) return null
  return (
    <div
      className={`p-3.5 rounded-xl border text-xs font-medium flex items-center gap-2.5 ${statusCls[msg.type]}`}
    >
      {msg.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
      <span className="flex-1">{msg.text}</span>
    </div>
  )
}

export function DriveActionCards({ gd }: { gd: GoogleDriveState }): React.JSX.Element {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200/60 dark:border-blue-800/40 p-4 rounded-2xl space-y-2.5">
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs">
          <Upload size={16} /> Google Drive&apos;a Yükle
        </div>
        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
          Mevcut çalışma dosyanızı tarih damgasıyla (.dtal) doğrudan Google Drive hesabınıza yedek
          olarak aktarır.
        </p>
        <Button
          onClick={gd.handleUploadCurrentFile}
          disabled={gd.isUploading || !gd.isConnected}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer"
        >
          {gd.isUploading ? (
            <>
              <RefreshCw size={14} className="animate-spin" /> Yükleniyor...
            </>
          ) : (
            <>
              <Upload size={14} /> Aktif Dosyayı Buluta Yükle
            </>
          )}
        </Button>
      </div>

      <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200/60 dark:border-emerald-800/40 p-4 rounded-2xl space-y-2.5">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
          <Download size={16} /> Buluttan İndir & Çek
        </div>
        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
          Google Drive hesabınızdaki `.dtal` yedeklerinizi dökerek seçtiğiniz dosyayı indirir ve
          açar.
        </p>
        <Button
          onClick={() => gd.fetchDriveFiles()}
          disabled={gd.isLoadingList || !gd.isConnected}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer"
        >
          <RefreshCw size={14} className={gd.isLoadingList ? 'animate-spin' : ''} />
          {gd.isLoadingList ? 'Yükleniyor...' : 'Bulut Listesini Yenile'}
        </Button>
      </div>
    </div>
  )
}

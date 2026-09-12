import React, { useEffect, useRef, useState } from 'react'
import {
  AlertTriangle,
  Cloud,
  CloudDownload,
  Info,
  Loader2,
  RefreshCw,
  ShieldCheck
} from 'lucide-react'
import { Modal } from '../ui/Modal'
import { useWorkspaceStore } from '../../store/workspaceStore'

interface GDriveFile {
  id: string
  name: string
  size?: string
  modifiedTime?: string
  createdTime?: string
}

export function GoogleDriveFooterWidget(): React.JSX.Element | null {
  const { fileName, activeMeta } = useWorkspaceStore()
  const [isConfigured, setIsConfigured] = useState(false)
  const [authError, setAuthError] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null)
  const [hasNewerVersion, setHasNewerVersion] = useState(false)
  const [newerFile, setNewerFile] = useState<GDriveFile | null>(null)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [showPopover, setShowPopover] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  const checkGoogleDriveUpdates = async (silent = false): Promise<void> => {
    if (!window.electron?.ipcRenderer) return
    if (!silent) setIsChecking(true)

    try {
      const settings = await window.electron.ipcRenderer.invoke('db:get-settings')
      const hasDrive =
        !!settings?.gdriveAccessToken ||
        (!!settings?.gdriveClientId && !!settings?.gdriveClientSecret)
      setIsConfigured(hasDrive)

      if (!hasDrive) {
        setIsChecking(false)
        return
      }

      setLastSyncTime(settings?.lastGdriveSync || null)
      const lastFileId = settings?.lastBackupFileId

      const res = await window.electron.ipcRenderer.invoke('workspace:list-gdrive-files')
      if (!res?.success) {
        const err = String(res?.error || '')
        if (
          err.includes('jeton') ||
          err.includes('401') ||
          err.includes('expired') ||
          err.includes('invalid_grant')
        ) {
          setAuthError(true)
        }
        setIsChecking(false)
        return
      }

      setAuthError(false)

      const allFiles: GDriveFile[] = res.files || []
      const validBackups = allFiles.filter(
        (f) =>
          f.name.endsWith('.temin') || f.name.endsWith('.dtal') || f.name.endsWith('.hkmp')
      )

      if (validBackups.length === 0) {
        setHasNewerVersion(false)
        setNewerFile(null)
        setIsChecking(false)
        return
      }

      // Aktif dosya ismine göre eşleşen yedekleri filtrele
      const rawBase = (fileName || '')
        .replace(/\.(temin|dtal|hkmp)$/i, '')
        .replace(/_\d{4}[-_.]\d{2}[-_.]\d{2}(?:[-_.]\d{2}[-_.]\d{2})?$/, '')
        .trim()

      let matching = validBackups.filter((f) =>
        rawBase ? f.name.toLowerCase().startsWith(rawBase.toLowerCase()) : true
      )
      if (matching.length === 0) {
        matching = validBackups
      }

      // En yeni oluşturulan dosya (list API createdTime desc sıralı döndürür)
      const latestCloudFile = matching[0]
      if (!latestCloudFile) {
        setHasNewerVersion(false)
        setNewerFile(null)
        setIsChecking(false)
        return
      }

      const cloudTime = new Date(
        latestCloudFile.createdTime || latestCloudFile.modifiedTime || 0
      ).getTime()
      const localSyncTime = new Date(settings?.lastGdriveSync || 0).getTime()
      const localFileTime = new Date(activeMeta?.updated_at || 0).getTime()
      const localTime = Math.max(localSyncTime, localFileTime)

      // Buluttaki dosya ID'si son yüklediğimizden farklı ve zamanı yerelden en az 30 saniye yeniyse
      const isCloudNewer =
        latestCloudFile.id !== lastFileId &&
        (cloudTime > localTime + 30000 || (!settings?.lastGdriveSync && cloudTime > 0))

      if (isCloudNewer) {
        setHasNewerVersion(true)
        setNewerFile(latestCloudFile)
      } else {
        setHasNewerVersion(false)
        setNewerFile(null)
      }
    } catch (err) {
      console.warn('[GoogleDriveWidget] Kontrol hatası:', err)
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    checkGoogleDriveUpdates(false)

    // Her 60 saniyede bir sessiz kontrol et
    const interval = setInterval(() => {
      checkGoogleDriveUpdates(true)
    }, 60000)

    const handleSaved = () => {
      setTimeout(() => checkGoogleDriveUpdates(true), 2000)
    }

    window.addEventListener('workspace-saved', handleSaved)

    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowPopover(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      clearInterval(interval)
      window.removeEventListener('workspace-saved', handleSaved)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [fileName, activeMeta?.updated_at])

  const handleApplyCloudUpdate = async (): Promise<void> => {
    if (!newerFile || !window.electron?.ipcRenderer) return
    setIsUpdating(true)
    try {
      const res = await window.electron.ipcRenderer.invoke('workspace:download-gdrive-file', {
        fileId: newerFile.id,
        fileName: newerFile.name,
        overwriteActive: true
      })

      if (res?.success) {
        setShowUpdateModal(false)
        alert(
          `🎉 Google Drive'dan başarıyla güncellendi!\n\n"${newerFile.name}" sürümü aktif edildi. Güvenlik için eski dosyanız (.bak) olarak korundu.`
        )
        window.location.reload()
      } else {
        alert(`Güncelleme yapılamadı:\n${res?.error || 'Bilinmeyen hata'}`)
      }
    } catch (err: unknown) {
      alert(`İndirme hatası: ${err instanceof Error ? err.message : 'Bilinmeyen hata'}`)
    } finally {
      setIsUpdating(false)
    }
  }

  const openGDriveSettings = (): void => {
    window.dispatchEvent(new CustomEvent('open-gdrive-modal'))
    setShowPopover(false)
  }

  const formatFileSize = (bytes?: string | number): string => {
    const b = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes
    if (!b || isNaN(b)) return ''
    if (b < 1024) return `${b} B`
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
    return `${(b / (1024 * 1024)).toFixed(2)} MB`
  }

  const formatDateTime = (isoString?: string | null): string => {
    if (!isoString) return '-'
    const d = new Date(isoString)
    if (isNaN(d.getTime())) return '-'
    return d.toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <>
      <div className="flex items-center gap-2 relative" ref={popoverRef}>
        {/* Durum 1: Bulutta Daha Güncel Bir Sürüm Var! (Öncelikli Dikkat Çekici Uyarı) */}
        {hasNewerVersion && newerFile ? (
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-linear-to-r from-amber-500/20 via-emerald-500/20 to-blue-500/20 border border-emerald-500/50 text-emerald-800 dark:text-emerald-300 font-bold text-[11px] shadow-xs animate-pulse">
            <CloudDownload className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="truncate max-w-[220px]">
              Drive&apos;da daha güncel sürüm var! ({formatDateTime(newerFile.modifiedTime || newerFile.createdTime)})
            </span>
            <button
              type="button"
              onClick={() => setShowUpdateModal(true)}
              className="ml-0.5 px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[10px] font-bold shadow-xs cursor-pointer hover:scale-105 transition-transform"
              title="Google Drive'daki en son sürümü indirip aktif dosyayı güncelle"
            >
              Buluttan Güncelle
            </button>
          </div>
        ) : authError ? (
          /* Durum 2: Google Drive Bağlı ancak Yetki Süresi Dolmuş */
          <button
            type="button"
            onClick={openGDriveSettings}
            className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-semibold hover:underline cursor-pointer px-1.5 py-0.5 rounded hover:bg-amber-50 dark:hover:bg-amber-950/30"
            title="Google Drive yetki süresi dolmuş. Yeniden bağlanmak için tıklayın."
          >
            <AlertTriangle className="w-3 h-3 text-amber-500" />
            <span>Drive Yetkisi Gerekli</span>
          </button>
        ) : isConfigured ? (
          /* Durum 3: Google Drive Bağlı ve Güncel */
          <button
            type="button"
            onClick={() => setShowPopover(!showPopover)}
            className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium cursor-pointer px-1.5 py-0.5 rounded hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
            title="Google Drive Senkronizasyon Durumu"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <Cloud className="w-3 h-3 text-blue-500" />
            <span>Drive Güncel</span>
            {isChecking && <Loader2 className="w-2.5 h-2.5 animate-spin text-slate-400" />}
          </button>
        ) : (
          /* Durum 4: Google Drive Henüz Yapılandırılmamış */
          <button
            type="button"
            onClick={openGDriveSettings}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer px-1.5 py-0.5 rounded hover:bg-slate-200/50 dark:hover:bg-slate-800"
            title="Google Drive Bulut Korumasını Etkinleştir"
          >
            <Cloud className="w-3 h-3" />
            <span>Drive Bağla</span>
          </button>
        )}

        {/* Küçük Durum Popover'ı */}
        {showPopover && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-3.5 space-y-2.5 z-50 text-left animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Google Drive Durumu
              </span>
              <button
                type="button"
                disabled={isChecking}
                onClick={() => checkGoogleDriveUpdates(false)}
                className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
                <span>Kontrol Et</span>
              </button>
            </div>

            <div className="text-[11px] space-y-1.5 text-slate-600 dark:text-slate-350">
              <div className="flex justify-between">
                <span>Son Bulut Senkronizasyonu:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {formatDateTime(lastSyncTime)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Bulut Koruması:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  Aktif (Son 7 Sürüm)
                </span>
              </div>
            </div>

            <div className="pt-1 flex gap-2">
              <button
                type="button"
                onClick={openGDriveSettings}
                className="flex-1 py-1.5 text-[11px] font-semibold text-center rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                Yedekleri Yönet
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Buluttan Güncelleme Onay Modalı */}
      <Modal
        isOpen={showUpdateModal}
        onClose={isUpdating ? () => {} : () => setShowUpdateModal(false)}
        title="Google Drive'dan Güncelle"
        description="Bulutta açık olan çalışma dosyanızdan daha yeni bir sürüm bulundu."
      >
        <div className="flex flex-col gap-4 p-1">
          {/* Uyarı ve Bilgilendirme Kutusu */}
          <div className="p-3.5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-amber-900 dark:text-amber-200 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Daha Güncel Bir Sürüm Tespit Edildi</span>
            </div>
            <p className="text-[11px] leading-relaxed opacity-95">
              Google Drive üzerindeki <strong>TEMIN_360_YEDEKLER</strong> klasöründe yerel dosyanızdan
              daha yeni tarihte kaydedilmiş bir kopya bulunmaktadır.
            </p>
          </div>

          {/* Dosya Karşılaştırma Detayları */}
          <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 space-y-2.5 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
              <span className="text-slate-500 font-medium">Buluttaki Dosya:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                {newerFile?.name}
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
              <span className="text-slate-500 font-medium">Bulut Kayıt Tarihi:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-[11px]">
                {formatDateTime(newerFile?.modifiedTime || newerFile?.createdTime)}
              </span>
            </div>
            {newerFile?.size && (
              <div className="flex items-center justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
                <span className="text-slate-500 font-medium">Dosya Boyutu:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300 text-[11px]">
                  {formatFileSize(newerFile.size)}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500 font-medium">Yerel Dosya:</span>
              <span className="font-mono text-slate-600 dark:text-slate-400 text-[11px]">
                {fileName} ({formatDateTime(activeMeta?.updated_at || lastSyncTime)})
              </span>
            </div>
          </div>

          {/* Güvenlik Notu */}
          <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200/70 dark:border-blue-900/30 text-blue-800 dark:text-blue-300 text-[11px] flex items-start gap-2">
            <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />
            <span>
              <strong>Güvenlik Garantisi:</strong> Güncelleme işlemi sırasında mevcut yerel dosyanız
              kaybolmaz; otomatik olarak <code>.bak</code> uzantısıyla emniyet kopyası alınır ve
              buluttaki sürüm aktif edilir.
            </span>
          </div>

          {/* Footer Butonları */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => setShowUpdateModal(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer disabled:opacity-50"
            >
              Vazgeç
            </button>
            <button
              type="button"
              disabled={isUpdating}
              onClick={handleApplyCloudUpdate}
              className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md cursor-pointer flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>İndiriliyor ve Güncelleniyor...</span>
                </>
              ) : (
                <>
                  <CloudDownload className="w-4 h-4" />
                  <span>Buluttan İndir & Güncelle</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}

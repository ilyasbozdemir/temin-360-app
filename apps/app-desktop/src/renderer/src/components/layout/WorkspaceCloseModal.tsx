import React, { useEffect, useState } from 'react'
import { Modal } from '../ui/Modal'
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  CloudUpload,
  Loader2,
  Mail,
  Save,
  ShieldCheck
} from 'lucide-react'
import { cn } from '../../utils/cn'

export type CloseActionType = 'none' | 'backup' | 'email' | 'server' | 'gdrive'

interface WorkspaceCloseModalProps {
  isOpen: boolean
  onClose: () => void
  fileName: string
  onConfirm: (actions: CloseActionType[] | CloseActionType) => Promise<void>
}

export function WorkspaceCloseModal({
  isOpen,
  onClose,
  fileName,
  onConfirm
}: WorkspaceCloseModalProps): React.JSX.Element {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const isMailConfigured = !!settings.smtp_host
  const isGDriveConfigured = !!settings.gdriveAccessToken
  const isServerConfigured = !!settings.sync_server_url

  const [selectedActions, setSelectedActions] = useState<CloseActionType[]>([])
  const [rememberPreference, setRememberPreference] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && window.electron?.ipcRenderer) {
      window.electron.ipcRenderer
        .invoke('db:get-settings')
        .then((s) => {
          if (s) {
            setSettings(s)

            // Parse saved preferences
            let initial: CloseActionType[] = []
            if (s.closeActionPreference && s.closeActionPreference !== 'ask') {
              try {
                const parsed = JSON.parse(s.closeActionPreference)
                if (Array.isArray(parsed)) {
                  // Ignore legacy 'backup' default so we don't popup Save As dialog on normal close
                  initial = parsed.filter((x: string) => x !== 'backup')
                } else if (typeof parsed === 'string' && parsed !== 'backup') {
                  initial = [parsed as CloseActionType]
                }
              } catch {
                if (typeof s.closeActionPreference === 'string') {
                  initial = s.closeActionPreference
                    .split(',')
                    .map((x) => x.trim())
                    .filter((x) => x !== 'backup') as CloseActionType[]
                }
              }
            }

            // By default, no extra actions (saves directly in-place without dialogs)
            if (initial.length === 0 || initial.includes('none')) {
              setSelectedActions([])
            } else {
              setSelectedActions(initial)
            }

            if (s.closeActionRemember === 'true') {
              setRememberPreference(true)
            }
          }
        })
        .catch(console.error)
    }
  }, [isOpen])

  const toggleAction = (action: CloseActionType): void => {
    setSelectedActions((prev) =>
      prev.includes(action) ? prev.filter((a) => a !== action) : [...prev, action]
    )
  }

  const handleSelectAll = (): void => {
    const all: CloseActionType[] = []
    if (isGDriveConfigured) all.push('gdrive')
    if (isServerConfigured) all.push('server')
    if (isMailConfigured) all.push('email')
    all.push('backup')
    setSelectedActions(all)
  }

  const handleClearAll = (): void => {
    setSelectedActions([])
  }

  const handleConfirm = async (): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      const actionsToRun: CloseActionType[] =
        selectedActions.length > 0 ? selectedActions : ['none']

      if (window.electron?.ipcRenderer) {
        await window.electron.ipcRenderer.invoke('db:save-settings', {
          closeActionPreference: JSON.stringify(actionsToRun),
          closeActionRemember: rememberPreference ? 'true' : 'false'
        })
      }

      await onConfirm(actionsToRun)
      onClose()
    } catch (err: unknown) {
      console.error(err)
      setError(
        err instanceof Error ? err.message : 'İşlem gerçekleştirilirken bir hata oluştu.'
      )
    } finally {
      setLoading(false)
    }
  }

  const hasAnyCloudConfigured = isGDriveConfigured || isServerConfigured
  const isAllSelected =
    (!isGDriveConfigured || selectedActions.includes('gdrive')) &&
    (!isServerConfigured || selectedActions.includes('server')) &&
    (!isMailConfigured || selectedActions.includes('email')) &&
    selectedActions.includes('backup')

  return (
    <Modal
      isOpen={isOpen}
      onClose={loading ? () => {} : onClose}
      title="Çalışma Dosyasını Kapat"
      description={`${fileName} dosyasındaki değişiklikler otomatik olarak kaydedilecektir.`}
    >
      <div className="flex flex-col gap-3.5">
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-800 dark:text-red-400 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Cloud active notice */}
        {isGDriveConfigured ? (
          <div className="p-3 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-emerald-900 dark:text-emerald-300 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Google Drive Bulut Koruması Devrede</span>
            </div>
            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded-full font-bold">
              Son 7 Sürüm Tutulur
            </span>
          </div>
        ) : !hasAnyCloudConfigured ? (
          <div className="p-3 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 text-blue-900 dark:text-blue-300 text-xs space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-blue-700 dark:text-blue-400">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Otomatik Dosya Güncelleme</span>
            </div>
            <p className="text-[11px] leading-relaxed opacity-90">
              Yapılan tüm değişiklikler mevcut açık çalışma dosyanıza (<strong>{fileName}</strong>)
              {' '}doğrudan kaydedilir. İlave bulut veya e-posta yedeklemesi isterseniz aşağıdaki
              seçenekleri işaretleyebilirsiniz.
            </p>
          </div>
        ) : null}

        {/* Header & Quick Action Buttons */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            İsteğe bağlı ilave yedekleme yöntemleri:
          </p>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              disabled={loading}
              onClick={isAllSelected ? handleClearAll : handleSelectAll}
              className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 px-2 py-1 rounded-lg transition-colors cursor-pointer"
            >
              {isAllSelected ? 'Seçimi Kaldır' : 'Tümünü Seç'}
            </button>
          </div>
        </div>

        {/* Options List with Checkboxes */}
        <div className="flex flex-col gap-2">
          {/* Option: Google Drive Cloud Backup (Only if configured) */}
          {isGDriveConfigured && (
            <div
              onClick={() => !loading && toggleAction('gdrive')}
              className={cn(
                'flex items-start gap-3 p-3 rounded-2xl border text-left transition-all cursor-pointer select-none',
                selectedActions.includes('gdrive')
                  ? 'border-emerald-500/70 bg-emerald-50/40 dark:bg-emerald-950/20 ring-1 ring-emerald-500/30 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/20 dark:bg-slate-900/20 opacity-80'
              )}
            >
              <div className="pt-0.5 shrink-0">
                <div
                  className={cn(
                    'w-5 h-5 rounded-lg flex items-center justify-center border transition-all',
                    selectedActions.includes('gdrive')
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                      : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800'
                  )}
                >
                  {selectedActions.includes('gdrive') && (
                    <Check className="w-3.5 h-3.5 stroke-3" />
                  )}
                </div>
              </div>
              <div className="p-2 rounded-xl shrink-0 bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300">
                <CloudUpload className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-850 dark:text-slate-150">
                    Google Drive Bulutuna Yedekle
                  </h4>
                  <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-extrabold px-1.5 py-0.5 rounded">
                    ÖNERİLEN
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  Çalışma dosyanızı Google Drive&apos;daki <strong>TEMIN_360_YEDEKLER</strong> klasörünüze yükler ve son 7 sürümü saklar.
                </p>
              </div>
            </div>
          )}

          {/* Option: Server Backup (Only if configured) */}
          {isServerConfigured && (
            <div
              onClick={() => !loading && toggleAction('server')}
              className={cn(
                'flex items-start gap-3 p-3 rounded-2xl border text-left transition-all cursor-pointer select-none',
                selectedActions.includes('server')
                  ? 'border-indigo-500/70 bg-indigo-50/40 dark:bg-indigo-950/20 ring-1 ring-indigo-500/30 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/20 dark:bg-slate-900/20 opacity-80'
              )}
            >
              <div className="pt-0.5 shrink-0">
                <div
                  className={cn(
                    'w-5 h-5 rounded-lg flex items-center justify-center border transition-all',
                    selectedActions.includes('server')
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                      : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800'
                  )}
                >
                  {selectedActions.includes('server') && (
                    <Check className="w-3.5 h-3.5 stroke-3" />
                  )}
                </div>
              </div>
              <div className="p-2 rounded-xl shrink-0 bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300">
                <CloudUpload className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-slate-850 dark:text-slate-150">
                  API Web Sunucusuna Yedekle
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  Çalışma dosyasını merkezi HTTPS sunucunuza yeni sürüm olarak güvenle iletir.
                </p>
              </div>
            </div>
          )}

          {/* Option: Email Backup (Only if configured) */}
          {isMailConfigured && (
            <div
              onClick={() => !loading && toggleAction('email')}
              className={cn(
                'flex items-start gap-3 p-3 rounded-2xl border text-left transition-all cursor-pointer select-none',
                selectedActions.includes('email')
                  ? 'border-blue-500/70 bg-blue-50/40 dark:bg-blue-950/20 ring-1 ring-blue-500/30 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/20 dark:bg-slate-900/20 opacity-80'
              )}
            >
              <div className="pt-0.5 shrink-0">
                <div
                  className={cn(
                    'w-5 h-5 rounded-lg flex items-center justify-center border transition-all',
                    selectedActions.includes('email')
                      ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                      : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800'
                  )}
                >
                  {selectedActions.includes('email') && (
                    <Check className="w-3.5 h-3.5 stroke-3" />
                  )}
                </div>
              </div>
              <div className="p-2 rounded-xl shrink-0 bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300">
                <Mail className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-slate-850 dark:text-slate-150">
                  E-Posta ile Yedek Gönder
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  Dosyayı SMTP sunucunuz üzerinden kayıtlı yedek e-posta adresinize ek dosya olarak postalar.
                </p>
              </div>
            </div>
          )}

          {/* Option: Local Backup (Optional save-as copy) */}
          <div
            onClick={() => !loading && toggleAction('backup')}
            className={cn(
              'flex items-start gap-3 p-3 rounded-2xl border text-left transition-all cursor-pointer select-none',
              selectedActions.includes('backup')
                ? 'border-blue-500/70 bg-blue-50/40 dark:bg-blue-950/20 ring-1 ring-blue-500/30 shadow-xs'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/20 dark:bg-slate-900/20 opacity-80'
            )}
          >
            <div className="pt-0.5 shrink-0">
              <div
                className={cn(
                  'w-5 h-5 rounded-lg flex items-center justify-center border transition-all',
                  selectedActions.includes('backup')
                    ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                    : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800'
                )}
              >
                {selectedActions.includes('backup') && (
                  <Check className="w-3.5 h-3.5 stroke-3" />
                )}
              </div>
            </div>
            <div className="p-2 rounded-xl shrink-0 bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300">
              <Save className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-slate-850 dark:text-slate-150">
                Farklı Konuma Yedek Kopyası Al (Farklı Kaydet)
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                Mevcut dosyanızı güncellemenin yanı sıra, güvenli bir kopyasını seçeceğiniz başka bir klasöre yedekler.
              </p>
            </div>
          </div>
        </div>

        {/* Selected Summary Notice */}
        {selectedActions.length === 0 ? (
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>
              Mevcut çalışma dosyanız (<strong>{fileName}</strong>) güncellenerek kapatılacaktır.
            </span>
          </div>
        ) : (
          <div className="px-3 py-2 rounded-xl bg-slate-100/70 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 text-xs flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{selectedActions.length} adet ilave yedekleme seçildi</span>
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {selectedActions
                .map((a) =>
                  a === 'gdrive'
                    ? 'Drive'
                    : a === 'server'
                      ? 'Sunucu'
                      : a === 'email'
                        ? 'E-Posta'
                        : 'Farklı Kaydet'
                )
                .join(' + ')}
            </span>
          </div>
        )}

        {/* Remember Preference Checkbox */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-start gap-3 mt-0.5">
          <input
            id="remember-close-pref"
            type="checkbox"
            checked={rememberPreference}
            onChange={(e) => setRememberPreference(e.target.checked)}
            className="w-4 h-4 mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          <label
            htmlFor="remember-close-pref"
            className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none leading-normal flex-1"
          >
            <span className="font-bold block text-slate-900 dark:text-slate-100">
              Bu seçimlerimi hatırla ve dosyayı her kapattığımda otomatik uygula
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5 leading-relaxed">
              İşaretlenirse sonraki kapatmalarda bu pencere sorulmadan seçtiğiniz işlemler doğrudan
              yapılır. Bu ayarı dilediğiniz zaman <strong>Ayarlar &gt; Senkronizasyon</strong>{' '}
              alanından değiştirebilir veya sıfırlayabilirsiniz.
            </span>
          </label>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3.5 mt-1">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 cursor-pointer disabled:opacity-50"
          >
            Vazgeç
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={handleConfirm}
            className={cn(
              'px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-md cursor-pointer flex items-center gap-2 min-w-32.5 justify-center transition-all',
              selectedActions.includes('gdrive')
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-blue-600 hover:bg-blue-700'
            )}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Kaydediliyor...</span>
              </>
            ) : selectedActions.length === 0 ? (
              <span>Kaydet ve Kapat</span>
            ) : (
              <span>
                {selectedActions.length === 1
                  ? 'Kaydet ve Kapat'
                  : `Kaydet ve Kapat (${selectedActions.length})`}
              </span>
            )}
          </button>
        </div>
      </div>
    </Modal>
  )
}

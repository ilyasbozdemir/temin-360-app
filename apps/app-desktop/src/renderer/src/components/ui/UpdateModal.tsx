import React, { useState } from 'react'
import { Modal } from './Modal'
import { Sparkles, Download, CheckCircle2, RotateCw, AlertTriangle } from 'lucide-react'

interface UpdateModalProps {
  isOpen: boolean
  onClose: () => void
  version?: string
  status?: string // 'checking' | 'available' | 'downloaded' | 'error'
  error?: string
}

export const UpdateModal: React.FC<UpdateModalProps> = ({
  isOpen,
  onClose,
  version,
  status = 'downloaded',
  error
}) => {
  const [isInstalling, setIsInstalling] = useState(false)

  const handleInstallAndRestart = async (): Promise<void> => {
    setIsInstalling(true)
    try {
      if (window.electron?.ipcRenderer) {
        await window.electron.ipcRenderer.invoke('updater:quit-and-install')
      }
    } catch (err) {
      console.error('Update install error:', err)
      alert('Güncelleme yüklenirken hata oluştu. Lütfen uygulamayı manuel kapatıp açınız.')
      setIsInstalling(false)
    }
  }

  if (!isOpen) return null

  const isDownloaded = status === 'downloaded'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isDownloaded ? 'Yeni Güncelleme Hazır!' : 'Güncelleme İndiriliyor'}
      description="TEMİN 360 Otomatik Güncelleme Sistemi"
      className="max-w-md"
    >
      <div className="space-y-5 p-2">
        {/* Animated Icon & Version Badge */}
        <div className="flex flex-col items-center justify-center text-center space-y-3 pt-2">
          <div className="relative">
            <div className="w-16 h-16 rounded-3xl bg-blue-500/10 dark:bg-blue-400/10 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-inner">
              {isDownloaded ? (
                <Sparkles className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-bounce" />
              ) : status === 'error' ? (
                <AlertTriangle className="w-8 h-8 text-amber-500" />
              ) : (
                <Download className="w-8 h-8 text-blue-500 animate-pulse" />
              )}
            </div>
            {isDownloaded && (
              <span className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 text-white rounded-full shadow-md">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            )}
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
              {isDownloaded ? 'Güncelleme Başarıyla İndirildi' : 'Yeni Sürüm Tespit Edildi'}
            </h3>
            {version && (
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                v{version.replace(/^v/, '')}
              </span>
            )}
          </div>
        </div>

        {/* Content Box */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl space-y-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          {isDownloaded ? (
            <>
              <p>
                Uygulamanız için yeni sürüm paketi arka planda tamamen indirildi.
              </p>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                Yeni özelliklerin ve performans iyileştirmelerinin aktifleşmesi için uygulamanın yeniden başlatılarak kurulması önerilir.
              </p>
            </>
          ) : status === 'error' ? (
            <p className="text-red-600 dark:text-red-400">
              Güncelleme kontrolü sırasında bir sorun oluştu: {error || 'Bilinmeyen hata'}
            </p>
          ) : (
            <p>
              Yeni sürüm dosyaları arka planda güvenle indiriliyor. İndirme tamamlandığında kurulum ekranı otomatik olarak açılacaktır.
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Daha Sonra
          </button>

          {isDownloaded && (
            <button
              type="button"
              onClick={handleInstallAndRestart}
              disabled={isInstalling}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isInstalling ? 'animate-spin' : ''}`} />
              <span>{isInstalling ? 'Kuruluyor & Başlatılıyor...' : 'Şimdi Kur ve Yeniden Başlat'}</span>
            </button>
          )}
        </div>
      </div>
    </Modal>
  )
}

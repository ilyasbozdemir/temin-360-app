import React, { useState } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  FileCheck2,
  FileCode,
  Loader2,
  Sparkles,
  X
} from 'lucide-react'

interface FormatUpgradeModalProps {
  isOpen: boolean
  filePath: string | null
  onClose: () => void
  onUpgradeAndOpen: (filePath: string) => Promise<void>
}

export function FormatUpgradeModal({
  isOpen,
  filePath,
  onClose,
  onUpgradeAndOpen
}: FormatUpgradeModalProps): React.JSX.Element | null {
  const [isUpgrading, setIsUpgrading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen || !filePath) return null

  const fileName = filePath.split(/[/\\]/).pop() || 'Bilinmeyen Dosya'
  const oldExt = (fileName.split('.').pop() || 'dtal').toLowerCase()
  const baseName = fileName.replace(/\.[^.]+$/, '')
  const newFileName = `${baseName}.temin`

  const handleUpgrade = async () => {
    setIsUpgrading(true)
    setError(null)
    try {
      await onUpgradeAndOpen(filePath)
      onClose()
    } catch (err: any) {
      console.error('Upgrade modal error:', err)
      setError(err?.message || 'Dosya dönüştürülürken bir hata oluştu.')
    } finally {
      setIsUpgrading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-blue-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">
                Yeni Format Dönüşümü Gerekli
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                TEMİN 360 Yeni Nesil (.temin) Dosya Mimarisi
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isUpgrading}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            Seçtiğiniz dosya eski <strong>.{oldExt}</strong> formatındadır. TEMİN 360 standart{' '}
            <strong>.temin</strong> mimarisine geçmiştir. Eski format desteği ilerleyen sürümlerde
            tamamen kaldırılacaktır.
          </p>

          {/* Visual Transformation Box */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950/80 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Dosya Dönüşümü
            </div>
            <div className="flex items-center justify-between gap-3">
              {/* Old Format */}
              <div className="flex-1 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <FileCode className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                    Eski (.{oldExt})
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate" title={fileName}>
                  {fileName}
                </div>
              </div>

              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shrink-0">
                <ArrowRight className="w-4 h-4" />
              </div>

              {/* New Format */}
              <div className="flex-1 p-3 bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 rounded-lg min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <FileCheck2 className="w-4 h-4 text-blue-500 shrink-0" />
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                    Yeni (.temin)
                  </span>
                </div>
                <div className="text-xs font-bold text-blue-900 dark:text-blue-200 truncate" title={newFileName}>
                  {newFileName}
                </div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2 bg-slate-100/60 dark:bg-slate-800/40 p-3 rounded-lg">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span>
              <strong>Güvenli Koruma:</strong> Orijinal <code>.{oldExt}</code> dosyanız silinmez, aynı
              klasörde yeni <code>.temin</code> formatında oluşturularak otomatik olarak açılacaktır.
            </span>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg text-xs text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isUpgrading}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            İptal
          </button>
          <button
            type="button"
            onClick={handleUpgrade}
            disabled={isUpgrading}
            className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all flex items-center gap-2 cursor-pointer"
          >
            {isUpgrading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Dönüştürülüyor...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" /> Yeni Formata Güncelle &amp; Aç (.temin)
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

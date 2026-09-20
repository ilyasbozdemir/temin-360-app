import React, { useEffect, useState } from 'react'
import { RefreshCw, ExternalLink, ShieldCheck, Loader2, XCircle } from 'lucide-react'

export interface DetsisVerificationState {
  cached?: boolean
  verified: boolean
  detsisNo?: string
  birimAdi?: string
  kurumAdi?: string
  url?: string
  statusCode?: number
  verifiedAt?: string
  error?: string
}

interface DetsisBadgeProps {
  detsisNo?: string
  className?: string
  autoCheckOnMount?: boolean
  showUrlLink?: boolean
  compact?: boolean
}

export function DetsisBadge({
  detsisNo,
  className = '',
  autoCheckOnMount = true,
  showUrlLink = true,
  compact = false
}: DetsisBadgeProps): React.ReactElement | null {
  const [loading, setLoading] = useState<boolean>(false)
  const [result, setResult] = useState<DetsisVerificationState | null>(null)

  const cleanNo = (detsisNo || '')
    .toString()
    .trim()
    .replace(/[^0-9]/g, '')

  // Doğrulama yap
  const handleVerify = async (force: boolean = false): Promise<void> => {
    if (!cleanNo || !window.electron?.ipcRenderer) return
    setLoading(true)
    try {
      const res = (await window.electron.ipcRenderer.invoke('network:verify-detsis', {
        detsisNo: cleanNo,
        force
      })) as (DetsisVerificationState & { success: boolean }) | null

      if (res && res.success) {
        setResult(res)
      } else {
        setResult({
          verified: false,
          detsisNo: cleanNo,
          error: res?.error || 'Doğrulama başarısız.'
        })
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bağlantı hatası.'
      setResult({
        verified: false,
        detsisNo: cleanNo,
        error: msg
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    if (cleanNo && autoCheckOnMount && window.electron?.ipcRenderer) {
      try {
        const p = window.electron.ipcRenderer.invoke('network:get-detsis-cache', cleanNo)
        if (p && typeof p.then === 'function') {
          p.then((cached: DetsisVerificationState | null) => {
            if (isMounted && cached) {
              setResult(cached)
            }
          }).catch(() => {})
        }
      } catch {
        // Preload fallback
      }
    }

    return (): void => {
      isMounted = false
    }
  }, [cleanNo, autoCheckOnMount])

  if (!cleanNo) {
    return null
  }

  const targetUrl = result?.url || `https://detsis.gov.tr/birim/${cleanNo}`
  const formattedDate = result?.verifiedAt
    ? new Date(result.verifiedAt).toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : null

  if (loading) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium ${className}`}
      >
        <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
        <span>DETSİS Sorgulanıyor...</span>
      </div>
    )
  }

  if (result && result.verified) {
    return (
      <div
        className={`inline-flex items-center flex-wrap gap-2 px-2.5 py-1 rounded-lg text-xs bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 font-medium animate-in fade-in duration-200 ${className}`}
      >
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <strong className="font-semibold">DETSİS&apos;te Kayıtlı</strong>
          {formattedDate && !compact && (
            <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 font-normal">
              ({formattedDate})
            </span>
          )}
        </span>

        <div className="flex items-center gap-1.5 ml-auto">
          {showUrlLink && (
            <a
              href={targetUrl}
              target="_blank"
              rel="noreferrer"
              title="DETSİS Kaydını Görüntüle"
              className="p-0.5 rounded text-emerald-700 hover:text-emerald-900 dark:text-emerald-300 dark:hover:text-emerald-100 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/50 transition-colors flex items-center gap-0.5 text-[10px]"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">DETSİS Sayfası</span>
            </a>
          )}

          <button
            type="button"
            onClick={() => handleVerify(true)}
            title="DETSİS Kaydını Yeniden Doğrula"
            className="p-0.5 rounded text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-100 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/50 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
      </div>
    )
  }

  if (result && !result.verified) {
    return (
      <div
        className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300 font-medium animate-in fade-in duration-200 ${className}`}
      >
        <span className="flex items-center gap-1.5">
          <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
          <span>DETSİS&apos;te Bulunamadı</span>
          {formattedDate && !compact && (
            <span className="text-[10px] text-rose-500/80 font-normal">({formattedDate})</span>
          )}
        </span>

        <button
          type="button"
          onClick={() => handleVerify(true)}
          className="ml-auto inline-flex items-center gap-1 text-[10px] font-semibold text-rose-700 dark:text-rose-300 hover:underline cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Tekrar Dene</span>
        </button>
      </div>
    )
  }

  // Henüz doğrulanmamış durum (Doğrula butonu)
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={() => handleVerify(false)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 font-medium transition-colors cursor-pointer"
      >
        <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
        <span>DETSİS Doğrula</span>
      </button>

      {showUrlLink && (
        <a
          href={targetUrl}
          target="_blank"
          rel="noreferrer"
          className="text-[10px] text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 flex items-center gap-0.5"
          title="DETSİS Sayfasını Aç"
        >
          <ExternalLink className="w-3 h-3" />
          <span>Sorgu Linki</span>
        </a>
      )}
    </div>
  )
}

import React, { useEffect, useState } from 'react'
import {
  Building2,
  ExternalLink,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  XCircle
} from 'lucide-react'
import { DetsisSearchModal } from './DetsisSearchModal'

export interface DetsisVerificationState {
  cached?: boolean
  verified: boolean
  detsisNo?: string
  birimAdi?: string
  kurumAdi?: string
  kurumHiyerarsisi?: string
  ulkeAdi?: string
  ilAdi?: string
  ilceAdi?: string
  kategoriAdi?: string
  statuAdi?: string
  logoByteArray?: string
  ingilizceAdi?: string
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
  showDetails?: boolean
  showSearchButton?: boolean
  searchTitle?: string
  onApplyData?: (data: DetsisVerificationState) => void
  onDataFetched?: (data: DetsisVerificationState) => void
}

export function DetsisBadge({
  detsisNo,
  className = '',
  autoCheckOnMount = true,
  showUrlLink = true,
  compact = false,
  showDetails = true,
  showSearchButton = true,
  searchTitle,
  onApplyData,
  onDataFetched
}: DetsisBadgeProps): React.JSX.Element | null {
  const [loading, setLoading] = useState<boolean>(false)
  const [result, setResult] = useState<DetsisVerificationState | null>(null)
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)

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
        if (onDataFetched) onDataFetched(res)
      } else {
        const failedState: DetsisVerificationState = {
          verified: false,
          detsisNo: cleanNo,
          error: res?.error || 'Doğrulama başarısız.'
        }
        setResult(failedState)
        if (onDataFetched) onDataFetched(failedState)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bağlantı hatası.'
      const errState: DetsisVerificationState = {
        verified: false,
        detsisNo: cleanNo,
        error: msg
      }
      setResult(errState)
      if (onDataFetched) onDataFetched(errState)
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
              if (onDataFetched) onDataFetched(cached)
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

  const targetUrl = result?.url || `https://detsis.gov.tr/ara/${cleanNo}`
  const formattedDate = result?.verifiedAt
    ? new Date(result.verifiedAt).toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : null

  const handleSearchResultSelect = (selectedData: DetsisVerificationState): void => {
    setResult(selectedData)
    if (onApplyData) onApplyData(selectedData)
    if (onDataFetched) onDataFetched(selectedData)
  }

  // If no detsisNo is present yet, render Search Trigger button (if enabled or onApplyData exists)
  if (!cleanNo) {
    if (!showSearchButton && !onApplyData) return null

    return (
      <>
        <div className={`inline-flex items-center gap-1.5 ${className}`}>
          <button
            type="button"
            onClick={() => setIsSearchModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-semibold transition-all cursor-pointer shadow-2xs"
          >
            <Search className="w-3.5 h-3.5" />
            <span>DETSİS&apos;te Ara</span>
          </button>
        </div>

        <DetsisSearchModal
          isOpen={isSearchModalOpen}
          onClose={() => setIsSearchModalOpen(false)}
          onSelect={handleSearchResultSelect}
          title={searchTitle}
        />
      </>
    )
  }

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
      <>
        <div className={`flex flex-col gap-1.5 ${className}`}>
          <div className="inline-flex items-center flex-wrap gap-2 px-2.5 py-1 rounded-lg text-xs bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 font-medium animate-in fade-in duration-200">
            <span className="flex items-center gap-1.5">
              {result.logoByteArray ? (
                <img
                  src={result.logoByteArray}
                  alt="DETSİS Logo"
                  className="w-4 h-4 object-contain rounded bg-white p-0.5 border border-emerald-200/50 dark:border-emerald-700/50 shrink-0"
                />
              ) : (
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              )}
              <strong className="font-semibold">DETSİS&apos;te Kayıtlı</strong>
              {formattedDate && !compact && (
                <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 font-normal">
                  ({formattedDate})
                </span>
              )}
            </span>

            <div className="flex items-center gap-1.5 ml-auto">
              {onApplyData && (
                <button
                  type="button"
                  onClick={() => onApplyData(result)}
                  title="DETSİS'ten Gelen Bilgileri ve Logoyu Forma Aktar"
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-semibold transition-colors shadow-xs cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Forma Aktar</span>
                </button>
              )}

              {showSearchButton && (
                <button
                  type="button"
                  onClick={() => setIsSearchModalOpen(true)}
                  title="Başka Bir Kurum/Birim Ara"
                  className="p-1 rounded text-emerald-700 hover:text-emerald-900 dark:text-emerald-300 dark:hover:text-emerald-100 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/50 transition-colors flex items-center gap-1 text-[10px] cursor-pointer"
                >
                  <Search className="w-3 h-3" />
                  <span className="hidden sm:inline">Ara</span>
                </button>
              )}

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

          {/* Detay Bilgi Kutucuğu (İl / İlçe / Hiyerarşi) */}
          {showDetails &&
            !compact &&
            (result.birimAdi || result.kurumHiyerarsisi || result.ilAdi) && (
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
                {result.birimAdi && (
                  <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                    <Building2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span className="truncate">{result.birimAdi}</span>
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                  {(result.ilAdi || result.ilceAdi) && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span>{[result.ilceAdi, result.ilAdi].filter(Boolean).join(' / ')}</span>
                    </span>
                  )}
                  {result.kategoriAdi && (
                    <span className="px-1.5 py-0.2 rounded bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {result.kategoriAdi}
                    </span>
                  )}
                  {result.statuAdi && (
                    <span className="px-1.5 py-0.2 rounded bg-blue-100/70 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                      {result.statuAdi}
                    </span>
                  )}
                </div>
              </div>
            )}
        </div>

        <DetsisSearchModal
          isOpen={isSearchModalOpen}
          onClose={() => setIsSearchModalOpen(false)}
          onSelect={handleSearchResultSelect}
          title={searchTitle}
        />
      </>
    )
  }

  if (result && !result.verified) {
    return (
      <>
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

          <div className="flex items-center gap-2 ml-auto">
            {showSearchButton && (
              <button
                type="button"
                onClick={() => setIsSearchModalOpen(true)}
                className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 dark:text-blue-300 hover:underline cursor-pointer"
              >
                <Search className="w-3 h-3" />
                <span>İsimle Ara</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleVerify(true)}
              className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-700 dark:text-rose-300 hover:underline cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Tekrar Dene</span>
            </button>
          </div>
        </div>

        <DetsisSearchModal
          isOpen={isSearchModalOpen}
          onClose={() => setIsSearchModalOpen(false)}
          onSelect={handleSearchResultSelect}
          title={searchTitle}
        />
      </>
    )
  }

  // Henüz doğrulanmamış durum (Doğrula butonu ve İsimle Ara butonu)
  return (
    <>
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <button
          type="button"
          onClick={() => handleVerify(false)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 font-medium transition-colors cursor-pointer"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>DETSİS Doğrula</span>
        </button>

        {showSearchButton && (
          <button
            type="button"
            onClick={() => setIsSearchModalOpen(true)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors cursor-pointer"
            title="DETSİS'te Kurum veya Birim Ara"
          >
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <span>İsimle Ara</span>
          </button>
        )}

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

      <DetsisSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelect={handleSearchResultSelect}
        title={searchTitle}
      />
    </>
  )
}

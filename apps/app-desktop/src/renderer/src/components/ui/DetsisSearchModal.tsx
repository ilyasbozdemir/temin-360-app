import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  Search,
  Building2,
  MapPin,
  Loader2,
  Sparkles,
  ExternalLink,
  X,
  AlertCircle
} from 'lucide-react'
import { Modal } from './Modal'
import { DetsisVerificationState } from './DetsisBadge'

export interface DetsisSearchResultItem {
  detsisNo: string
  birimAdi: string
  kurumHiyerarsisi?: string
  ulkeAdi?: string
  ilAdi?: string
  ilceAdi?: string
  ingilizceAdi?: string
}

interface DetsisSearchModalProps {
  isOpen: boolean
  onClose: () => void
  initialQuery?: string
  onSelect: (selectedData: DetsisVerificationState) => void
  title?: string
}

export function DetsisSearchModal({
  isOpen,
  onClose,
  initialQuery = '',
  onSelect,
  title = "DETSİS'te Kurum / Birim Ara"
}: DetsisSearchModalProps): React.JSX.Element | null {
  const [searchTerm, setSearchTerm] = useState(initialQuery)
  const [results, setResults] = useState<DetsisSearchResultItem[]>([])
  const [loading, setLoading] = useState(false)
  const [selectingId, setSelectingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [searchedOnce, setSearchedOnce] = useState(false)

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const performSearch = useCallback(async (query: string): Promise<void> => {
    const clean = query.trim()
    if (!clean || clean.length < 2) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    setSearchedOnce(true)

    try {
      if (!window.electron?.ipcRenderer) {
        throw new Error('Elektron IPC bağlantısı kurulamadı.')
      }

      const res = (await window.electron.ipcRenderer.invoke('network:search-detsis', clean)) as {
        success: boolean
        data?: DetsisSearchResultItem[]
        error?: string
      }

      if (res && res.success && Array.isArray(res.data)) {
        setResults(res.data)
      } else {
        setError(res?.error || 'Arama sırasında bir hata oluştu.')
        setResults([])
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Bağlantı hatası oluştu.')
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Sync initialQuery when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchTerm(initialQuery)
      setResults([])
      setError(null)
      setSearchedOnce(false)
      setSelectingId(null)

      if (initialQuery.trim().length >= 2) {
        performSearch(initialQuery.trim())
      }
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen, initialQuery, performSearch])

  // Handle Input Change with 350ms Debounce
  const handleInputChange = (val: string): void => {
    setSearchTerm(val)
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    if (val.trim().length >= 2) {
      setLoading(true)
      debounceTimerRef.current = setTimeout(() => {
        performSearch(val)
      }, 350)
    } else {
      setResults([])
      setLoading(false)
      setSearchedOnce(false)
    }
  }

  // Handle Selection: Fetch full details & logo via verify-detsis
  const handleSelectItem = async (item: DetsisSearchResultItem): Promise<void> => {
    setSelectingId(item.detsisNo)
    setError(null)

    try {
      if (window.electron?.ipcRenderer) {
        // Fetch full verified details including logo base64 & hiyerarsi
        const fullRes = (await window.electron.ipcRenderer.invoke('network:verify-detsis', {
          detsisNo: item.detsisNo,
          force: true
        })) as (DetsisVerificationState & { success: boolean }) | null

        if (fullRes && fullRes.success) {
          onSelect(fullRes)
          onClose()
          return
        }
      }

      // Fallback if verification endpoint had issues: pass basic search data
      onSelect({
        verified: true,
        detsisNo: item.detsisNo,
        birimAdi: item.birimAdi,
        kurumHiyerarsisi: item.kurumHiyerarsisi,
        ulkeAdi: item.ulkeAdi,
        ilAdi: item.ilAdi,
        ilceAdi: item.ilceAdi,
        ingilizceAdi: item.ingilizceAdi
      })
      onClose()
    } catch (err: unknown) {
      console.error('DETSİS selection error:', err)
      // Even on error pass known search item
      onSelect({
        verified: true,
        detsisNo: item.detsisNo,
        birimAdi: item.birimAdi,
        kurumHiyerarsisi: item.kurumHiyerarsisi,
        ulkeAdi: item.ulkeAdi,
        ilAdi: item.ilAdi,
        ilceAdi: item.ilceAdi
      })
      onClose()
    } finally {
      setSelectingId(null)
    }
  }

  if (!isOpen) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description="Resmi DETSİS (Devlet Teşkilatı Merkezi Kayıt Sistemi) veritabanında arama yaparak kurum ve birim bilgilerini tek tıkla çekin."
    >
      <div className="space-y-4">
        {/* Search Input Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
                performSearch(searchTerm)
              }
            }}
            placeholder="Kurum veya Birim Adı yazın... (Örn: İçişleri, Çankaya, Fen İşleri)"
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all shadow-inner"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('')
                setResults([])
                setSearchedOnce(false)
                inputRef.current?.focus()
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs select-none">
          <span className="text-[11px] font-semibold text-slate-400 shrink-0 mr-1">
            Hızlı Filtreler:
          </span>
          {[
            { label: '🏛️ Bakanlıklar', query: 'Bakanlığı' },
            { label: '🏙️ Belediyeler', query: 'Belediyesi' },
            { label: '🎓 Üniversiteler', query: 'Üniversitesi' },
            { label: '📍 Valilikler', query: 'Valiliği' },
            { label: '🏢 Genel Müdürlükler', query: 'Genel Müdürlüğü' },
            { label: '🏥 Sağlık / Hastaneler', query: 'Hastanesi' },
            { label: '⚖️ Mahkemeler', query: 'Mahkemesi' }
          ].map((cat) => (
            <button
              key={cat.query}
              type="button"
              onClick={() => {
                setSearchTerm(cat.query)
                performSearch(cat.query)
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-850 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-slate-700 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-all shrink-0 text-[11px] border border-slate-200 dark:border-slate-800"
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-center justify-center gap-2 py-8 text-blue-600 dark:text-blue-400 text-xs font-medium animate-in fade-in">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>DETSİS resmi kayıtlarında aranıyor...</span>
          </div>
        )}

        {/* Error Alert */}
        {error && !loading && (
          <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Results List */}
        {!loading && results.length > 0 && (
          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 px-1 flex justify-between items-center">
              <span>Bulunan Sonuçlar ({results.length})</span>
              <span>Seçmek için tıklayın</span>
            </div>

            {results.map((item) => {
              const isSelected = selectingId === item.detsisNo
              const locationParts = [item.ilceAdi, item.ilAdi, item.ulkeAdi].filter(Boolean)

              return (
                <div
                  key={item.detsisNo}
                  onClick={() => !isSelected && handleSelectItem(item)}
                  className={`group p-3.5 rounded-2xl border transition-all cursor-pointer select-none relative ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-400 dark:border-blue-700 shadow-sm'
                      : 'bg-white dark:bg-slate-900/70 hover:bg-blue-50/50 dark:hover:bg-slate-850 border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                        <Building2 className="w-5 h-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {item.birimAdi}
                          </h4>
                          <span className="px-2 py-0.5 rounded-md bg-blue-100/70 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-mono text-[10px] font-bold">
                            DETSİS: {item.detsisNo}
                          </span>
                        </div>

                        {item.kurumHiyerarsisi && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 leading-tight">
                            {item.kurumHiyerarsisi}
                          </p>
                        )}

                        {locationParts.length > 0 && (
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 mt-1.5">
                            <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
                            <span>{locationParts.join(' / ')}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col items-end gap-1">
                      {isSelected ? (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-semibold shadow-xs">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Aktarılıyor...</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 shadow-2xs group-hover:bg-blue-600 group-hover:text-white"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Seç & Bilgileri Çek</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Empty State when searched and nothing found */}
        {!loading && searchedOnce && results.length === 0 && !error && (
          <div className="text-center py-10 px-4 space-y-2 animate-in fade-in">
            <Building2 className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Sonuç Bulunamadı
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              &quot;<strong>{searchTerm}</strong>&quot; araması için DETSİS sisteminde kayıtlı birim
              veya kurum bulunamadı. Lütfen kelimeyi kontrol edin veya farklı bir anahtar kelime
              deneyin.
            </p>
          </div>
        )}

        {/* Default Help Info when no search done yet */}
        {!loading && !searchedOnce && results.length === 0 && (
          <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 dark:text-blue-400">
              <Sparkles className="w-4 h-4" />
              <span>DETSİS Arama İpucu</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Kamu kurumu veya biriminizin adını yukarıdaki arama kutusuna yazmaya başladığınızda,
              T.C. Cumhurbaşkanlığı DETSİS kayıtları canlı olarak sorgulanır. Listeden seçtiğiniz
              kurumun <strong>DETSİS No, Kurum Hiyerarşisi, İl/İlçe ve Resmi Amblemi</strong> tek
              tıkla ilgili form alanlarına aktarılır.
            </p>
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <a
            href="https://detsis.gov.tr"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>detsis.gov.tr Resmi Sayfası</span>
          </a>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </Modal>
  )
}

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, FileText, Printer } from 'lucide-react'
import { cn } from '../../../utils/cn'
import { BelgeAksiyonlari } from '../../../components/ui/BelgeAksiyonlari'
import { normalizeForMatch } from '../sub-screens/DosyaAsamalari/useDosyaAsamasiSablons'
import { useWorkspaceStore } from '../../../store/workspaceStore'
import { documentPreloadService } from '../../../services/documentPreloadService'

export interface PrintDropdownButtonV2Props {
  kategori: string // e.g. '4-kabul-ve-odeme-islemleri'
  sablons: any[]
  overrideSablons?: any[] // Optional pre-filtered/combined templates list
  activeStarredDocs: string[]
  ciktiLoading: boolean
  handleOpenPreviewForSablon: (sablon: any, title: string) => void
  quickPrint: (sablon: any) => Promise<void>
  quickExport: (sablon: any, format: 'pdf' | 'docx' | 'udf') => Promise<void>
  quickOpenExternal: (sablon: any) => Promise<void>
  isSablonDisabled?: (name: string) => boolean
  className?: string
  buttonHeightClass?: string // Optional button height class, e.g. "h-10"
  label?: string
}

export function PrintDropdownButtonV2({
  kategori,
  sablons,
  overrideSablons,
  activeStarredDocs,
  ciktiLoading,
  handleOpenPreviewForSablon,
  quickPrint,
  quickExport,
  quickOpenExternal,
  isSablonDisabled,
  className = '',
  buttonHeightClass = '',
  label
}: PrintDropdownButtonV2Props): React.JSX.Element | null {
  const { activeDosyaId } = useWorkspaceStore()
  const [belgeMenuOpen, setBelgeMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const [selectedPresetId, setSelectedPresetId] = useState<string>(() => {
    try {
      return localStorage.getItem('dta_selected_preset_id') || ''
    } catch {
      return ''
    }
  })
  const [isChangingPreset, setIsChangingPreset] = useState(false)
  const [presets, setPresets] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('dta_document_presets')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    const handlePresetsChange = () => {
      try {
        const saved = localStorage.getItem('dta_document_presets')
        setPresets(saved ? JSON.parse(saved) : [])
      } catch (e) {
        console.error(e)
      }
    }
    window.addEventListener('dta_presets_changed', handlePresetsChange)
    return () => window.removeEventListener('dta_presets_changed', handlePresetsChange)
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setBelgeMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const stageSablons = useMemo(() => {
    if (overrideSablons) return overrideSablons
    const categoryLower = kategori.toLowerCase()
    return sablons.filter((s) => {
      const cat = (s.kategori || '').toLowerCase()
      if (categoryLower.startsWith('1-') || categoryLower.includes('baslangic')) {
        return cat.includes('1-') || cat.includes('baslangic') || cat.includes('başlangıç')
      }
      if (categoryLower.startsWith('2-') || categoryLower.includes('fiyat')) {
        return cat.includes('2-') || cat.includes('piyasa') || cat.includes('fiyat')
      }
      if (
        categoryLower.startsWith('3-') ||
        categoryLower.includes('siparis') ||
        categoryLower.includes('sozlesme')
      ) {
        return cat.includes('3-') || cat.includes('sipariş') || cat.includes('sözleşme')
      }
      if (
        categoryLower.startsWith('4-') ||
        categoryLower.includes('kabul') ||
        categoryLower.includes('odeme')
      ) {
        return cat.includes('4-') || cat.includes('kabul') || cat.includes('ödeme')
      }
      if (
        categoryLower.startsWith('5-') ||
        categoryLower.includes('klasor') ||
        categoryLower.includes('kapak')
      ) {
        return cat.includes('5-') || cat.includes('klasör') || cat.includes('kapak')
      }
      return cat === categoryLower
    })
  }, [sablons, kategori])

  function getCleanName(ad: string): string {
    let clean = ad
    const matchStatus = clean.match(/^\[(.*?)\]\s*(.*)$/)
    if (matchStatus) clean = matchStatus[2].trim()
    return clean
  }

  function isSablonMatch(docStr: string, sablon: any): boolean {
    if (!docStr || !sablon) return false
    const cleanDocStr = docStr.replace(/\.html$/i, '')
    const cleanAd = (sablon.ad || '').replace(/^\[(.*?)\]\s*/, '').replace(/\.html$/i, '')
    const cleanDosya = (sablon.dosya_adi || '').replace(/\.html$/i, '')

    const normDoc = normalizeForMatch(cleanDocStr)
    const normAd = normalizeForMatch(cleanAd)
    const normDosya = normalizeForMatch(cleanDosya)

    return normDoc === normAd || normDoc === normDosya
  }

  const starredDocsForFilter = useMemo(() => {
    const activePresetId = selectedPresetId || (presets.length > 0 ? presets[0].id : '')
    if (activePresetId) {
      const preset = presets.find((p) => p.id === activePresetId)
      return preset ? preset.docs : []
    }
    return activeStarredDocs || []
  }, [selectedPresetId, presets, activeStarredDocs])

  const hasStarred = useMemo(() => {
    return stageSablons.some((sablon) => {
      return starredDocsForFilter.some((d) => isSablonMatch(d, sablon))
    })
  }, [stageSablons, starredDocsForFilter])

  const [manualFilter, setManualFilter] = useState<'all' | 'starred' | null>(null)

  const filter = manualFilter !== null ? manualFilter : hasStarred ? 'starred' : 'all'

  const displaySablons = useMemo(() => {
    const rawList =
      filter === 'starred'
        ? stageSablons.filter((sablon) => {
            return starredDocsForFilter.some((d) => isSablonMatch(d, sablon))
          })
        : stageSablons

    const unique: any[] = []
    const seen = new Set<string>()
    for (const s of rawList) {
      const key = `${s.id ?? ''}_${(s.dosya_adi || s.ad || '').toLowerCase().trim()}`
      if (!seen.has(key)) {
        seen.add(key)
        unique.push(s)
      }
    }
    return unique
  }, [filter, starredDocsForFilter, stageSablons])

  if (stageSablons.length === 0) return null

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      <button
        onClick={() => setBelgeMenuOpen((v) => !v)}
        onMouseEnter={() => {
          if (activeDosyaId && stageSablons.length > 0) {
            documentPreloadService.warmStageDocuments(
              kategori,
              activeDosyaId,
              stageSablons.map((s) => s.dosya_adi || s.route_path || s.ad)
            )
          }
        }}
        disabled={ciktiLoading}
        className={cn(
          'flex items-center gap-1.5 px-3 py-2 bg-slate-55 hover:bg-slate-100 text-slate-705 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold transition-all shadow-2xs hover:shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
          buttonHeightClass
        )}
      >
        <Printer className="w-3.5 h-3.5 text-blue-500" />
        {label || 'Belgeleri Yazdır'}
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {belgeMenuOpen && (
        <div className="absolute right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-50 w-80 py-1.5 animate-in fade-in slide-in-from-top-1 duration-150 overflow-visible text-left">
          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1 space-y-2">
            <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              <span>Bu Aşamanın Belgeleri</span>
            </div>

            <div className="flex items-center bg-slate-100 dark:bg-slate-950/40 rounded-lg p-0.5 w-full">
              <button
                type="button"
                onClick={() => setManualFilter('all')}
                className={cn(
                  'flex-1 py-1 text-[10px] font-extrabold rounded-md transition-colors text-center cursor-pointer',
                  filter === 'all'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-355'
                )}
              >
                Tümü
              </button>
              <button
                type="button"
                onClick={() => setManualFilter('starred')}
                className={cn(
                  'flex-1 py-1 text-[10px] font-extrabold rounded-md transition-colors text-center cursor-pointer',
                  filter === 'starred'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-355'
                )}
              >
                Hızlı Erişim / Paket
              </button>
            </div>

            {filter === 'starred' && presets.length > 0 && (
              <div className="relative w-full pt-0.5">
                {isChangingPreset ? (
                  <select
                    value={selectedPresetId || (presets.length > 0 ? presets[0].id : '')}
                    onChange={(e) => {
                      const val = e.target.value
                      setSelectedPresetId(val)
                      localStorage.setItem('dta_selected_preset_id', val)
                      setIsChangingPreset(false)
                    }}
                    onBlur={() => setIsChangingPreset(false)}
                    autoFocus
                    className="w-full bg-slate-55 dark:bg-slate-850 border border-blue-500 dark:border-blue-600 rounded-lg py-1 px-2 text-[10px] font-extrabold text-blue-600 dark:text-blue-400 focus:outline-none cursor-pointer shadow-xs"
                  >
                    {presets.map((p) => (
                      <option key={p.id} value={p.id}>
                        📦 {p.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsChangingPreset(true)}
                    className="w-full flex items-center justify-between bg-blue-50/40 dark:bg-blue-955/10 hover:bg-blue-50 dark:hover:bg-blue-900/25 border border-blue-100 dark:border-blue-900/30 hover:border-blue-200 dark:hover:border-blue-800 text-blue-600 dark:text-blue-400 rounded-lg py-1 px-2.5 text-[10px] font-extrabold transition-all cursor-pointer shadow-2xs"
                  >
                    <span className="truncate">
                      📦{' '}
                      {presets.find(
                        (p) =>
                          p.id === (selectedPresetId || (presets.length > 0 ? presets[0].id : ''))
                      )?.name || 'Paket Seçilmedi'}
                    </span>
                    <ChevronDown className="w-3 h-3 text-blue-400 shrink-0 ml-1" />
                  </button>
                )}
              </div>
            )}
          </div>

          {displaySablons.length === 0 ? (
            <div className="px-3 py-4 text-center text-slate-455 dark:text-slate-500 text-xs italic">
              Listelenecek belge bulunamadı.
            </div>
          ) : (
            displaySablons.map((sablon: any) => {
              const docKey = sablon.dosya_adi || sablon.route_path || sablon.ad
              let cleanName = sablon.ad
              const matchStatus = cleanName.match(/^\[(.*?)\]\s*(.*)$/)
              if (matchStatus) cleanName = matchStatus[2].trim()
              const cleanTitle = cleanName.replace(/\s*\(.*?\)\s*$/, '').trim()

              const isDisabled = ciktiLoading || (isSablonDisabled && isSablonDisabled(cleanName))

              return (
                <div
                  key={`sablon_${sablon.id ?? ''}_${docKey}`}
                  onMouseEnter={() => {
                    if (activeDosyaId && docKey) {
                      documentPreloadService.warmOnHover(docKey, activeDosyaId)
                    }
                  }}
                  className="w-full flex items-center justify-between px-3 py-1 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors gap-2"
                >
                  <button
                    disabled={isDisabled}
                    onClick={() => {
                      handleOpenPreviewForSablon(sablon, sablon.ad)
                      setBelgeMenuOpen(false)
                    }}
                    onMouseEnter={() => {
                      if (activeDosyaId && docKey) {
                        documentPreloadService.warmOnHover(docKey, activeDosyaId)
                      }
                    }}
                    className="flex-1 text-left text-xs text-slate-700 dark:text-slate-300 font-semibold transition-colors cursor-pointer flex items-center gap-2 truncate disabled:opacity-50 disabled:cursor-not-allowed hover:text-blue-650 dark:hover:text-blue-400"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-450 dark:text-slate-500 shrink-0" />
                    <span className="truncate">{cleanTitle}</span>
                  </button>

                  <div className="shrink-0">
                    <BelgeAksiyonlari
                      onPreview={() => {
                        handleOpenPreviewForSablon(sablon, sablon.ad)
                        setBelgeMenuOpen(false)
                      }}
                      onQuickPrint={() => quickPrint(sablon)}
                      onExport={(fmt) => quickExport(sablon, fmt)}
                      onOpenExternal={() => quickOpenExternal(sablon)}
                      disabled={isDisabled}
                      docName={cleanName}
                    />
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import { Check, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { useCiktiMerkeziData } from '../../screens/dosya/CiktiMerkezi.hooks'
import { useQuery } from '@tanstack/react-query'
import { useWorkspaceStore } from '../../store/workspaceStore'
import { subPagesMapping } from '../../constants/surecler'
import { APP_ROUTES } from '../../constants/routeConstants'
import { checkIsSablonDisabled } from '../../screens/dosya/sub-screens/DosyaAsamalari/useDosyaAsamasiSablons'
import { cn } from '../../utils/cn'

const parseStatusAndName = (name?: string | null): { status: string | null; cleanName: string } => {
  if (!name) return { status: null, cleanName: '' }
  let status: string | null = null
  let cleanName = name

  const nameMatch = name.match(/^\[(.*?)\]\s*(.*)$/)
  if (nameMatch) {
    status = nameMatch[1].trim()
    cleanName = nameMatch[2].trim()
  }

  return { status, cleanName }
}

const getStatusBadgeClass = (status: string): string => {
  const lower = status.toLowerCase()
  if (
    lower.includes('bakım') ||
    lower.includes('güncel') ||
    lower.includes('geliş') ||
    lower.includes('maint')
  ) {
    return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-500/20'
  }
  if (
    lower.includes('aktif') ||
    lower.includes('hazır') ||
    lower.includes('tamam') ||
    lower.includes('ready') ||
    lower.includes('active')
  ) {
    return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border border-green-500/20'
  }
  if (
    lower.includes('pasif') ||
    lower.includes('iptal') ||
    lower.includes('eski') ||
    lower.includes('disable') ||
    lower.includes('deprec')
  ) {
    return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border border-green-500/20'
  }
  return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-500/20'
}

export function ActiveFileSidebar(): React.JSX.Element | null {
  const { activeDosyaId, activeStarredDocs } = useWorkspaceStore()
  const router = useRouterState()
  const navigate = useNavigate()

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem('dta_active_sidebar_collapsed')
    return saved === 'true'
  })

  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const [selectedPresetId, setSelectedPresetId] = useState<string>(() => {
    try {
      return localStorage.getItem('dta_selected_preset_id') || ''
    } catch {
      return ''
    }
  })
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
    const handleSelectedPresetChange = () => {
      try {
        setSelectedPresetId(localStorage.getItem('dta_selected_preset_id') || '')
      } catch (e) {
        console.error(e)
      }
    }
    window.addEventListener('dta_presets_changed', handlePresetsChange)
    window.addEventListener('dta_presets_changed', handleSelectedPresetChange)
    window.addEventListener('storage', handleSelectedPresetChange)
    return () => {
      window.removeEventListener('dta_presets_changed', handlePresetsChange)
      window.removeEventListener('dta_presets_changed', handleSelectedPresetChange)
      window.removeEventListener('storage', handleSelectedPresetChange)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('dta_active_sidebar_collapsed', String(isCollapsed))
  }, [isCollapsed])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const { data: dbAsamalar = [] } = useQuery<any[]>({
    queryKey: ['sidebar_asamalar'],
    queryFn: async () => {
      const res = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT * FROM TANIM_Asama WHERE aktif_mi = 1 ORDER BY asama_sira ASC'
      )
      if (!res.success) return []
      return res.data
    }
  })

  const stagesToUse =
    dbAsamalar.length > 0
      ? [...dbAsamalar]
      : [
          { asama_sira: 1, asama_adi: 'İhtiyaç Tespiti & Başlangıç' },
          { asama_sira: 2, asama_adi: 'Piyasa Fiyat Araştırması' },
          { asama_sira: 3, asama_adi: 'Sipariş & Sözleşme' },
          { asama_sira: 4, asama_adi: 'Muayene & Kabul & Ödeme İşlemleri' },
          { asama_sira: 5, asama_adi: 'Klasör & Kapaklar' }
        ]

  if (dbAsamalar.length > 0 && !stagesToUse.some((a) => a.asama_sira === 5)) {
    stagesToUse.push({ asama_sira: 5, asama_adi: 'Klasör & Kapaklar' })
  }

  const stagesToUseMapped = stagesToUse.map((asama) => {
    return {
      ...asama,
      asama_adi: asama.asama_adi
    }
  })

  const { sablons, dosyaContext, activeDosya } = useCiktiMerkeziData(activeDosyaId)

  const STAGE_KATEGORI: Record<number, string[]> = {
    1: ['1-ihtiyac-tespiti-ve-baslangic', '1. İhtiyaç Tespiti & Başlangıç'],
    2: ['2-piyasa-fiyat-arastirmasi', '2. Piyasa Fiyat Araştırması'],
    3: ['3-siparis-ve-sozlesme', '3. Sipariş & Sözleşme'],
    4: ['4-kabul-ve-odeme-islemleri', '4. Muayene & Kabul & Ödeme İşlemleri'],
    5: ['5-klasor-ve-kapaklar', '5. Klasör & Kapaklar']
  }

  const STAGE_ROUTE: Record<number, string> = {
    1: APP_ROUTES.HAZIRLIK_VE_IHTIYAC,
    2: APP_ROUTES.PIYASA_FIYAT_ARASTIRMASI,
    3: APP_ROUTES.SIPARIS_VE_SOZLESME,
    4: APP_ROUTES.KABUL_VE_ODEME,
    5: APP_ROUTES.KLASOR_VE_KAPAKLAR
  }

  const isSablonDisabled = (cleanName: string): boolean => {
    return checkIsSablonDisabled(cleanName, dosyaContext)
  }

  if (!activeDosyaId) return null

  return (
    <div
      ref={dropdownRef}
      className={cn(
        'h-full bg-white dark:bg-slate-900 border-l border-slate-250 dark:border-slate-800/80 flex flex-col transition-all duration-300 relative shrink-0 z-30 select-none',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Sidebar Header / Toggle */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-850 flex items-center justify-between min-h-[3rem] shrink-0">
        {!isCollapsed && (
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Dosya Süreçleri
          </span>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-auto cursor-pointer"
          title={isCollapsed ? 'Genişlet' : 'Daralt'}
        >
          {isCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* Stages List */}
      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1.5">
        {stagesToUseMapped.map((asama, idx) => {
          const kategoriler = STAGE_KATEGORI[asama.asama_sira] || []
          let stageSablons = sablons.filter((s: any) => kategoriler.includes(s.kategori))

          const activePresetId = selectedPresetId || (presets.length > 0 ? presets[0].id : '')
          const starredDocsForFilter = activePresetId
            ? presets.find((p) => p.id === activePresetId)?.docs || []
            : activeStarredDocs || []

          if (starredDocsForFilter && starredDocsForFilter.length > 0) {
            stageSablons = stageSablons.filter((sablon: any) => {
              const { cleanName } = parseStatusAndName(sablon.ad)
              const normalize = (str: string) =>
                str
                  .replace(/[^a-zA-Z0-9ğüşıöçĞÜŞİÖÇ]/g, '')
                  .toLowerCase()
                  .trim()
              return starredDocsForFilter.some(
                (d: string) =>
                  normalize(d) === normalize(sablon.ad) || normalize(d) === normalize(cleanName)
              )
            })
          } else {
            stageSablons = []
          }

          const stageRoute = STAGE_ROUTE[asama.asama_sira]
          const dropdownKey = `sidebar_asama_${asama.asama_sira}`

          const isCompleted = activeDosya?.durum_asama_id
            ? asama.asama_sira < activeDosya.durum_asama_id
            : false

          const currentPath = router.location.pathname
          const isRouteActive = currentPath === stageRoute

          return (
            <div
              key={`sidebar_asama_${asama.id || asama.asama_sira}_${idx}`}
              className="relative group"
            >
              <button
                onClick={() => {
                  if (stageSablons.length === 0 || isCollapsed) {
                    navigate({ to: stageRoute as any })
                  } else {
                    setOpenDropdown(openDropdown === dropdownKey ? null : dropdownKey)
                  }
                }}
                className={cn(
                  'w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all duration-200 border cursor-pointer',
                  isRouteActive
                    ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-900/50 text-blue-700 dark:text-blue-400 font-bold'
                    : isCompleted
                      ? 'bg-emerald-50/50 border-emerald-100 dark:bg-emerald-950/5 dark:border-emerald-950/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/10'
                      : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                )}
                title={`${asama.asama_sira}. Aşama: ${asama.asama_adi}`}
              >
                {/* Stage Indicator (Number or Check or Icon) */}
                <div
                  className={cn(
                    'w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors',
                    isRouteActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                      : isCompleted
                        ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/10'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
                  )}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : asama.asama_sira}
                </div>

                {/* Stage Info */}
                {!isCollapsed && (
                  <div className="flex-1 min-w-0 pr-1">
                    <div className="text-xs truncate">{asama.asama_adi}</div>
                  </div>
                )}

                {/* Dropdown Chevron */}
                {!isCollapsed && stageSablons.length > 0 && (
                  <ChevronDown
                    className={cn(
                      'w-3 h-3 text-slate-400 transition-transform shrink-0',
                      openDropdown === dropdownKey ? 'rotate-180' : ''
                    )}
                  />
                )}
              </button>

              {/* Collapsed Tooltip / Hover Menu */}
              {isCollapsed && (
                <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2 hidden group-hover:block z-50 bg-slate-900 text-white text-xs rounded-lg py-1.5 px-3 shadow-xl whitespace-nowrap">
                  {asama.asama_adi}
                </div>
              )}

              {/* Stage Sub-templates (Dropdown) */}
              {!isCollapsed && openDropdown === dropdownKey && stageSablons.length > 0 && (
                <div className="mt-1 ml-6 pl-3 border-l border-slate-200 dark:border-slate-800 space-y-0.5 animate-in slide-in-from-top-1 duration-150">
                  <Link
                    to={stageRoute as any}
                    onClick={() => setOpenDropdown(null)}
                    className="flex items-center gap-2 px-2.5 py-1.5 text-[10.5px] font-bold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg"
                  >
                    Aşamaya Git →
                  </Link>
                  {stageSablons.map((sablon: any, sIdx: number) => {
                    const { status, cleanName } = parseStatusAndName(sablon.ad)
                    const disabled = isSablonDisabled(cleanName)

                    return (
                      <button
                        key={`sidebar_sablon_${asama.asama_sira}_${sablon.id || sablon.ad}_${sIdx}`}
                        onClick={() => {
                          if (disabled) return
                          setOpenDropdown(null)
                          navigate({
                            to: stageRoute as any,
                            search: { sablonAd: sablon.ad } as any
                          })
                        }}
                        disabled={disabled}
                        className={cn(
                          'w-full flex items-center justify-between p-1.5 rounded-lg text-left text-[11px] transition-colors',
                          disabled
                            ? 'opacity-40 cursor-not-allowed text-slate-500'
                            : 'text-slate-650 hover:bg-slate-50 dark:text-slate-350 dark:hover:bg-slate-850 cursor-pointer'
                        )}
                      >
                        <span className="truncate pr-1.5">{cleanName}</span>
                        {status && (
                          <span
                            className={cn(
                              'px-1 py-0.2 rounded text-[7px] font-extrabold uppercase shrink-0',
                              getStatusBadgeClass(status)
                            )}
                          >
                            {status}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

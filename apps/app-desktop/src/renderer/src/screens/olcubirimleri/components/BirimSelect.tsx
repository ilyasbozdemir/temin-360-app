import React, { useState, useRef, useEffect, useMemo } from 'react'
import {
  Search,
  Check,
  ChevronsUpDown,
  X,
  Star,
  Scale,
  Ruler,
  Maximize2,
  Box,
  Clock,
  Thermometer,
  Zap,
  Hash,
  Tag,
  Sparkles
} from 'lucide-react'
import { OlcuBirimi, BIRIM_KATEGORILERI } from '../olcubirimleri.hooks'
import { cn } from '../../../utils/cn'

interface BirimSelectProps {
  value?: number | null
  onChange: (unitId: number, unit?: OlcuBirimi) => void
  birimler: OlcuBirimi[]
  preferredCategory?: string | null
  label?: string
  placeholder?: string
  disabled?: boolean
  excludeId?: number | null
  className?: string
  showCategoryHint?: boolean
}

export function getKategoriBadgeColor(kategori: string | null | undefined): string {
  switch (kategori) {
    case 'Ağırlık':
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
    case 'Uzunluk':
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
    case 'Alan':
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
    case 'Hacim':
      return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20'
    case 'Zaman':
      return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
    case 'Sıcaklık':
      return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
    case 'Elektrik/Enerji':
      return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20'
    case 'Adet/Miktar':
      return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
    default:
      return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20'
  }
}

export function getKategoriActiveTabColor(kategori: string | null | undefined): string {
  switch (kategori) {
    case 'Ağırlık':
      return 'bg-amber-600 text-white shadow-xs'
    case 'Uzunluk':
      return 'bg-blue-600 text-white shadow-xs'
    case 'Alan':
      return 'bg-emerald-600 text-white shadow-xs'
    case 'Hacim':
      return 'bg-cyan-600 text-white shadow-xs'
    case 'Zaman':
      return 'bg-purple-600 text-white shadow-xs'
    case 'Sıcaklık':
      return 'bg-rose-600 text-white shadow-xs'
    case 'Elektrik/Enerji':
      return 'bg-yellow-600 text-white shadow-xs'
    case 'Adet/Miktar':
      return 'bg-indigo-600 text-white shadow-xs'
    default:
      return 'bg-slate-700 text-white shadow-xs'
  }
}

export function getUnitIcon(
  kategori: string | null | undefined,
  className = 'w-4 h-4'
): React.JSX.Element {
  switch (kategori) {
    case 'Ağırlık':
      return <Scale className={cn(className, 'text-amber-500')} />
    case 'Uzunluk':
      return <Ruler className={cn(className, 'text-blue-500')} />
    case 'Alan':
      return <Maximize2 className={cn(className, 'text-emerald-500')} />
    case 'Hacim':
      return <Box className={cn(className, 'text-cyan-500')} />
    case 'Zaman':
      return <Clock className={cn(className, 'text-purple-500')} />
    case 'Sıcaklık':
      return <Thermometer className={cn(className, 'text-rose-500')} />
    case 'Elektrik/Enerji':
      return <Zap className={cn(className, 'text-yellow-500')} />
    case 'Adet/Miktar':
      return <Hash className={cn(className, 'text-indigo-500')} />
    default:
      return <Tag className={cn(className, 'text-slate-400')} />
  }
}

export function BirimSelect({
  value,
  onChange,
  birimler,
  preferredCategory,
  label,
  placeholder = 'Birim seçiniz...',
  disabled = false,
  excludeId,
  className,
  showCategoryHint = true
}: BirimSelectProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedKat, setSelectedKat] = useState<string>('TÜMÜ')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const selectedUnit = useMemo(() => {
    return birimler.find((b) => b.id === value)
  }, [birimler, value])

  // When opening or when preferredCategory changes, sync category filter
  const handleOpenToggle = () => {
    if (disabled) return
    const nextState = !isOpen
    if (nextState) {
      if (preferredCategory && preferredCategory !== 'TÜMÜ') {
        setSelectedKat(preferredCategory)
      } else if (selectedUnit?.kategori) {
        setSelectedKat(selectedUnit.kategori)
      } else {
        setSelectedKat('TÜMÜ')
      }
      setSearch('')
    }
    setIsOpen(nextState)
  }

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent): void {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Focus search on open
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus()
      }, 50)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [isOpen])

  // Count units per category
  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = { TÜMÜ: birimler.length }
    BIRIM_KATEGORILERI.forEach((k) => {
      map[k] = birimler.filter((b) => (b.kategori || 'Adet/Miktar') === k).length
    })
    return map
  }, [birimler])

  // Filtered unit list
  const filteredList = useMemo(() => {
    return birimler.filter((b) => {
      if (excludeId && b.id === excludeId) return false
      const katMatch = selectedKat === 'TÜMÜ' || (b.kategori || 'Adet/Miktar') === selectedKat
      const q = search.trim().toLowerCase()
      if (!q) return katMatch

      const nameMatch = b.ad.toLowerCase().includes(q)
      const kisaMatch = b.kisa_ad ? b.kisa_ad.toLowerCase().includes(q) : false
      const sembolMatch = b.sembol ? b.sembol.toLowerCase().includes(q) : false
      const katNameMatch = b.kategori ? b.kategori.toLowerCase().includes(q) : false

      return (nameMatch || kisaMatch || sembolMatch || katNameMatch) && (selectedKat === 'TÜMÜ' || katMatch)
    })
  }, [birimler, excludeId, selectedKat, search])

  // Group filtered units by category, putting preferred category first if in "TÜMÜ" mode
  const sortedCategories = useMemo(() => {
    const uniqueKats = Array.from(new Set(filteredList.map((b) => b.kategori || 'Diğer')))
    if (preferredCategory && uniqueKats.includes(preferredCategory)) {
      return [preferredCategory, ...uniqueKats.filter((k) => k !== preferredCategory)]
    }
    return uniqueKats
  }, [filteredList, preferredCategory])

  const groupedUnits = useMemo(() => {
    const groups: { [key: string]: OlcuBirimi[] } = {}
    filteredList.forEach((b) => {
      const kat = b.kategori || 'Diğer'
      if (!groups[kat]) groups[kat] = []
      groups[kat].push(b)
    })
    return groups
  }, [filteredList])

  const handleSelect = (u: OlcuBirimi): void => {
    onChange(u.id, u)
    setIsOpen(false)
  }

  return (
    <div className={cn('relative w-full flex flex-col gap-1', className)} ref={dropdownRef}>
      {label && (
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
          <span>{label}</span>
          {selectedUnit?.kategori && showCategoryHint && (
            <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
              <span>Kategori:</span>
              <span
                className={cn(
                  'px-1.5 py-0.2 rounded font-bold border text-[10px]',
                  getKategoriBadgeColor(selectedUnit.kategori)
                )}
              >
                {selectedUnit.kategori}
              </span>
            </span>
          )}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={handleOpenToggle}
        className={cn(
          'w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border text-left transition-all text-xs font-medium',
          'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 shadow-xs',
          isOpen && 'ring-2 ring-blue-500/40 border-blue-500 dark:border-blue-500',
          disabled && 'opacity-60 cursor-not-allowed bg-slate-100 dark:bg-slate-800'
        )}
      >
        {selectedUnit ? (
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div
              className={cn(
                'p-1.5 rounded-lg border flex-shrink-0 flex items-center justify-center',
                getKategoriBadgeColor(selectedUnit.kategori)
              )}
            >
              {getUnitIcon(selectedUnit.kategori, 'w-4 h-4')}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-slate-900 dark:text-slate-100 truncate text-xs">
                  {selectedUnit.ad}
                </span>
                {selectedUnit.kisa_ad && (
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[10px] font-bold border border-slate-200 dark:border-slate-700">
                    {selectedUnit.kisa_ad}
                  </span>
                )}
                {selectedUnit.temel_birim_mi === 1 && (
                  <span
                    className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold border border-amber-500/20"
                    title="Kategori Referans Birimi"
                  >
                    <Star className="w-2.5 h-2.5 fill-amber-500" /> Ref
                  </span>
                )}
              </div>
            </div>
            <span
              className={cn(
                'text-[10px] font-bold px-2 py-0.5 rounded-md border flex-shrink-0 flex items-center gap-1',
                getKategoriBadgeColor(selectedUnit.kategori)
              )}
            >
              {selectedUnit.kategori || 'Adet/Miktar'}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
            {preferredCategory ? (
              <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-medium">
                {getUnitIcon(preferredCategory, 'w-3.5 h-3.5')}
                <span>{preferredCategory} birimi seçin...</span>
              </div>
            ) : (
              <span>{placeholder}</span>
            )}
          </div>
        )}
        <ChevronsUpDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-full min-w-[340px] max-w-[460px] z-50 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
          {/* Search Header */}
          <div className="p-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 bg-slate-50/80 dark:bg-slate-800/40">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0 ml-1" />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Birim ara (Kilogram, kg, metre, litre, saat...)"
              className="flex-1 bg-transparent text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter Chips */}
          <div className="px-2.5 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-slate-50/40 dark:bg-slate-800/20">
            <button
              type="button"
              onClick={() => setSelectedKat('TÜMÜ')}
              className={cn(
                'px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all flex items-center gap-1',
                selectedKat === 'TÜMÜ'
                  ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              )}
            >
              <span>Tümü</span>
              <span className="text-[9px] opacity-70 font-mono">({categoryCounts.TÜMÜ || 0})</span>
            </button>
            {BIRIM_KATEGORILERI.map((kat) => {
              const count = categoryCounts[kat] || 0
              if (count === 0) return null
              const isSelected = selectedKat === kat
              const isPreferred = preferredCategory === kat
              return (
                <button
                  key={kat}
                  type="button"
                  onClick={() => setSelectedKat(kat)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border border-transparent',
                    isSelected
                      ? getKategoriActiveTabColor(kat)
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800',
                    isPreferred && !isSelected && 'border-blue-400/60 bg-blue-50/60 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold'
                  )}
                >
                  {getUnitIcon(kat, 'w-3 h-3')}
                  <span>{kat}</span>
                  {isPreferred && !isSelected && <Sparkles className="w-2.5 h-2.5 text-blue-500" />}
                  <span className="text-[9px] opacity-70 font-mono">({count})</span>
                </button>
              )
            })}
          </div>

          {/* Units List */}
          <div className="max-h-72 overflow-y-auto p-2 space-y-1">
            {filteredList.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 flex flex-col items-center gap-1">
                <Tag className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                <span>Eşleşen ölçü birimi bulunamadı.</span>
              </div>
            ) : selectedKat === 'TÜMÜ' ? (
              // Grouped view
              sortedCategories.map((category) => {
                const items = groupedUnits[category] || []
                if (items.length === 0) return null
                const isPreferred = preferredCategory === category
                return (
                  <div key={category} className="mb-3 last:mb-0">
                    <div
                      className={cn(
                        'px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase flex items-center justify-between mb-1 border',
                        isPreferred
                          ? 'bg-blue-50/80 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60'
                          : 'bg-slate-100/70 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-slate-200/50 dark:border-slate-800'
                      )}
                    >
                      <div className="flex items-center gap-1.5">
                        {getUnitIcon(category, 'w-3.5 h-3.5')}
                        <span>{category}</span>
                        {isPreferred && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.2 rounded-full bg-blue-600 text-white font-bold">
                            <Sparkles className="w-2.5 h-2.5" /> Önerilen
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] font-mono font-normal">
                        {items.length} birim
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      {items.map((u) => {
                        const isSelected = u.id === value
                        return (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => handleSelect(u)}
                            className={cn(
                              'w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl text-left transition-all text-xs',
                              isSelected
                                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800 shadow-xs'
                                : 'hover:bg-slate-100 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-200'
                            )}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <div
                                className={cn(
                                  'p-1.5 rounded-lg border flex-shrink-0 flex items-center justify-center',
                                  getKategoriBadgeColor(u.kategori)
                                )}
                              >
                                {getUnitIcon(u.kategori, 'w-3.5 h-3.5')}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="truncate font-bold">{u.ad}</span>
                                  {u.kisa_ad && (
                                    <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono text-[10px] font-bold border border-slate-200 dark:border-slate-700">
                                      {u.kisa_ad}
                                    </span>
                                  )}
                                  {u.temel_birim_mi === 1 && (
                                    <span
                                      className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[9px] font-bold border border-amber-500/20"
                                      title="Kategori Referans Birimi"
                                    >
                                      <Star className="w-2.5 h-2.5 fill-amber-500" /> Ref
                                    </span>
                                  )}
                                </div>
                                {u.aciklama && (
                                  <span className="text-[10px] text-slate-400 truncate max-w-[260px]">
                                    {u.aciklama}
                                  </span>
                                )}
                              </div>
                            </div>
                            {isSelected && (
                              <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })
            ) : (
              // Single category list
              filteredList.map((u) => {
                const isSelected = u.id === value
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleSelect(u)}
                    className={cn(
                      'w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl text-left transition-all text-xs',
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800 shadow-xs'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-200'
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div
                        className={cn(
                          'p-1.5 rounded-lg border flex-shrink-0 flex items-center justify-center',
                          getKategoriBadgeColor(u.kategori)
                        )}
                      >
                        {getUnitIcon(u.kategori, 'w-3.5 h-3.5')}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate font-bold">{u.ad}</span>
                          {u.kisa_ad && (
                            <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono text-[10px] font-bold border border-slate-200 dark:border-slate-700">
                              {u.kisa_ad}
                            </span>
                          )}
                          {u.temel_birim_mi === 1 && (
                            <span
                              className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[9px] font-bold border border-amber-500/20"
                              title="Kategori Referans Birimi"
                            >
                              <Star className="w-2.5 h-2.5 fill-amber-500" /> Ref
                            </span>
                          )}
                        </div>
                        {u.aciklama && (
                          <span className="text-[10px] text-slate-400 truncate max-w-[260px]">
                            {u.aciklama}
                          </span>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

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
  Tag
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
  className
}: BirimSelectProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedKat, setSelectedKat] = useState<string>('TÜMÜ')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const selectedUnit = useMemo(() => {
    return birimler.find((b) => b.id === value)
  }, [birimler, value])

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

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => searchInputRef.current?.focus(), 50)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [isOpen])

  const filteredList = useMemo(() => {
    return birimler.filter((b) => {
      if (excludeId && b.id === excludeId) return false
      const katMatch = selectedKat === 'TÜMÜ' || (b.kategori || 'Adet/Miktar') === selectedKat
      const q = search.trim().toLowerCase()
      if (!q) return katMatch
      return (
        (b.ad.toLowerCase().includes(q) ||
          (b.kisa_ad && b.kisa_ad.toLowerCase().includes(q)) ||
          (b.sembol && b.sembol.toLowerCase().includes(q)) ||
          (b.kategori && b.kategori.toLowerCase().includes(q))) &&
        (selectedKat === 'TÜMÜ' || katMatch)
      )
    })
  }, [birimler, excludeId, selectedKat, search])

  const handleSelect = (u: OlcuBirimi): void => {
    onChange(u.id, u)
    setIsOpen(false)
  }

  return (
    <div className={cn('relative w-full flex flex-col gap-1.5', className)} ref={dropdownRef}>
      {label && (
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}

      {/* Clean, Non-Cluttered Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={handleOpenToggle}
        className={cn(
          'w-full h-11 flex items-center justify-between gap-2 px-3 rounded-xl border text-left transition-all',
          'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 shadow-xs',
          isOpen && 'ring-2 ring-blue-500/40 border-blue-500 dark:border-blue-500',
          disabled && 'opacity-60 cursor-not-allowed bg-slate-100 dark:bg-slate-800'
        )}
      >
        {selectedUnit ? (
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 flex-shrink-0">
              {getUnitIcon(selectedUnit.kategori, 'w-4 h-4')}
            </div>
            <div className="flex items-center gap-1.5 min-w-0 flex-1 overflow-hidden">
              <span className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
                {selectedUnit.ad}
              </span>
              {selectedUnit.kisa_ad && (
                <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 flex-shrink-0">
                  {selectedUnit.kisa_ad}
                </span>
              )}
            </div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700/60 flex-shrink-0 hidden sm:inline-block">
              {selectedUnit.kategori || 'Diğer'}
            </span>
          </div>
        ) : (
          <span className="text-xs text-slate-400 dark:text-slate-500 truncate">{placeholder}</span>
        )}
        <ChevronsUpDown className="w-4 h-4 text-slate-400 flex-shrink-0 ml-1" />
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-full min-w-[320px] max-w-[420px] z-50 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
          {/* Search Header */}
          <div className="p-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 bg-slate-50/80 dark:bg-slate-800/40">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0 ml-1" />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Birim ara..."
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
          <div className="px-2.5 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1 overflow-x-auto no-scrollbar bg-slate-50/40 dark:bg-slate-800/20">
            <button
              type="button"
              onClick={() => setSelectedKat('TÜMÜ')}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all',
                selectedKat === 'TÜMÜ'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              )}
            >
              Tümü
            </button>
            {BIRIM_KATEGORILERI.map((kat) => (
              <button
                key={kat}
                type="button"
                onClick={() => setSelectedKat(kat)}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5',
                  selectedKat === kat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                )}
              >
                {getUnitIcon(kat, 'w-3 h-3')}
                <span>{kat}</span>
              </button>
            ))}
          </div>

          {/* Units List */}
          <div className="max-h-64 overflow-y-auto p-1.5 space-y-0.5">
            {filteredList.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                Eşleşen ölçü birimi bulunamadı.
              </div>
            ) : (
              filteredList.map((u) => {
                const isSelected = u.id === value
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleSelect(u)}
                    className={cn(
                      'w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-left transition-all text-xs',
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-200'
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {getUnitIcon(u.kategori, 'w-3.5 h-3.5 flex-shrink-0')}
                      <span className="font-semibold truncate">{u.ad}</span>
                      {u.kisa_ad && (
                        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded border border-slate-200 dark:border-slate-700">
                          {u.kisa_ad}
                        </span>
                      )}
                      {u.temel_birim_mi === 1 && (
                        <span
                          className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[9px] font-bold border border-amber-500/20"
                          title="Temel Referans Birim"
                        >
                          <Star className="w-2.5 h-2.5 fill-amber-500" /> Ref
                        </span>
                      )}
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

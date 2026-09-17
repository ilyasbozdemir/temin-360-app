import React, { useState, useRef, useEffect, useMemo } from 'react'
import { Search, ChevronDown, Check, X, UserPlus, User } from 'lucide-react'

export interface PersonelOption {
  id: number
  ad_soyad: string
  unvan?: string | null
  birim?: string | null
}

interface PersonelComboboxProps {
  personeller: PersonelOption[]
  selectedId: number | null
  onChange: (personelId: number | null) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  compact?: boolean
}

export function PersonelCombobox({
  personeller,
  selectedId,
  onChange,
  placeholder = 'Personel Seçiniz...',
  disabled = false,
  className = '',
  compact = false
}: PersonelComboboxProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const selectedPerson = useMemo(() => {
    return personeller.find((p) => p.id === selectedId) || null
  }, [personeller, selectedId])

  const cleanUnvan = (unvan?: string | null) => {
    if (!unvan) return ''
    return unvan.replace(/^\(+|\)+$/g, '').trim()
  }

  const filteredList = useMemo(() => {
    if (!searchTerm.trim()) return personeller
    const query = searchTerm.toLowerCase().trim()
    return personeller.filter((p) => {
      const name = (p.ad_soyad || '').toLowerCase()
      const title = (p.unvan || '').toLowerCase()
      const unit = (p.birim || '').toLowerCase()
      return name.includes(query) || title.includes(query) || unit.includes(query)
    })
  }, [personeller, searchTerm])

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 50)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Trigger Button */}
      <div
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen)
            setSearchTerm('')
          }
        }}
        className={`flex items-center justify-between ${compact ? 'px-2 py-1 text-xs' : 'px-2.5 py-1.5 text-xs'} bg-white dark:bg-slate-800/90 border rounded-lg font-medium cursor-pointer transition-all ${
          disabled
            ? 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
            : isOpen
              ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
              : selectedPerson
                ? 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-800 dark:text-slate-100'
                : 'border-dashed border-slate-300 dark:border-slate-700 text-slate-400 hover:border-blue-400 dark:hover:border-blue-500'
        }`}
      >
        <div className="flex items-center gap-2 truncate flex-1 min-w-0 pr-1">
          {selectedPerson ? (
            <>
              <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                {selectedPerson.ad_soyad ? selectedPerson.ad_soyad.substring(0, 2).toLocaleUpperCase('tr-TR') : <User className="w-3 h-3" />}
              </div>
              <div className="truncate flex items-center gap-1.5">
                <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {selectedPerson.ad_soyad}
                </span>
                {selectedPerson.unvan && (
                  <span className="text-slate-400 dark:text-slate-400 text-[11px] truncate">
                    ({cleanUnvan(selectedPerson.unvan)})
                  </span>
                )}
              </div>
            </>
          ) : (
            <span className="flex items-center gap-1.5 text-slate-400 italic text-[11px]">
              <UserPlus className="w-3.5 h-3.5" />
              {placeholder}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-1">
          {selectedPerson && !disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onChange(null)
              }}
              title="Seçimi Kaldır"
              className="p-0.5 text-slate-400 hover:text-rose-500 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${
              isOpen ? 'rotate-180 text-blue-500' : ''
            }`}
          />
        </div>
      </div>

      {/* Autocomplete Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-1.5 max-h-64 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100">
          {/* Arama Input */}
          <div className="relative mb-1.5">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="İsim veya unvan ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            />
          </div>

          {/* Personel Listesi */}
          <div className="overflow-y-auto max-h-48 custom-scrollbar space-y-0.5">
            <button
              type="button"
              onClick={() => {
                onChange(null)
                setIsOpen(false)
                setSearchTerm('')
              }}
              className="w-full text-left px-2.5 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors flex items-center justify-between font-medium cursor-pointer"
            >
              <span>-- Boş Bırak / Seçimi Kaldır --</span>
              <X className="w-3 h-3" />
            </button>

            {filteredList.length === 0 ? (
              <div className="py-4 text-center text-xs text-slate-400">
                Eşleşen personel bulunamadı
              </div>
            ) : (
              filteredList.map((p) => {
                const isSelected = p.id === selectedId
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      onChange(p.id)
                      setIsOpen(false)
                      setSearchTerm('')
                    }}
                    className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {p.ad_soyad ? p.ad_soyad.substring(0, 2).toLocaleUpperCase('tr-TR') : <User className="w-3 h-3" />}
                      </div>
                      <div className="truncate">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {p.ad_soyad}
                        </div>
                        {p.unvan && (
                          <div className="text-[10px] text-slate-400 truncate">
                            {cleanUnvan(p.unvan)}
                          </div>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
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

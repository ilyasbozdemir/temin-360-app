import React from 'react'
import { Check, Search, UserMinus, X } from 'lucide-react'

interface PersonnelSelectFieldProps {
  label: string
  selectedPersonelId: number | null | undefined
  onSelect: (personelId: number | null) => void
  isOpen: boolean
  onToggleOpen: () => void
  onClose: () => void
  searchQuery: string
  onSearchChange: (q: string) => void
  personeller: any[]
  filteredPersoneller: any[]
  placeholder?: string
  badgeText?: string
  badgeClass?: string
  isHarcamaYetkilisiField?: boolean
}

export function PersonnelSelectField({
  label,
  selectedPersonelId,
  onSelect,
  isOpen,
  onToggleOpen,
  onClose,
  searchQuery,
  onSearchChange,
  personeller,
  filteredPersoneller,
  placeholder = 'Personel Seçin...',
  badgeText = 'Seçili',
  badgeClass = 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  isHarcamaYetkilisiField = false
}: PersonnelSelectFieldProps): React.JSX.Element {
  const selectedPerson = selectedPersonelId
    ? personeller.find((p) => p.id === selectedPersonelId)
    : null

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">{label}</label>
        {selectedPerson && (
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${badgeClass}`}>
            {badgeText}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onToggleOpen}
          className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none text-slate-800 dark:text-slate-200 text-left font-semibold hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer"
        >
          <span
            className={
              selectedPerson
                ? 'text-slate-800 dark:text-slate-200 font-bold truncate'
                : 'text-slate-400 dark:text-slate-500'
            }
          >
            {selectedPerson ? selectedPerson.ad_soyad : placeholder}
          </span>
          <Search size={14} className="text-slate-400 shrink-0 ml-2" />
        </button>

        {selectedPerson && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onSelect(null)
              onClose()
            }}
            title="Seçimi Kaldır / Boş Bırak"
            className="p-2.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-rose-200 rounded-xl transition-all cursor-pointer shrink-0"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <input
            type="text"
            placeholder="Personel ara..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 mb-2 text-slate-800 dark:text-slate-200"
            autoFocus
          />

          <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-0.5">
            <button
              type="button"
              onClick={() => {
                onSelect(null)
                onClose()
                onSearchChange('')
              }}
              className="w-full text-left p-2 text-xs rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2 transition-colors border-b border-slate-100 dark:border-slate-800/60 pb-2 mb-1 cursor-pointer"
            >
              <UserMinus size={13} className="text-slate-400 shrink-0" />
              <span>— Boş Bırak (Atama Yok)</span>
              {!selectedPersonelId && <Check size={13} className="ml-auto text-emerald-500" />}
            </button>

            {(filteredPersoneller ?? []).map((p) => {
              const isSelected = p.id === selectedPersonelId
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    onSelect(p.id)
                    onClose()
                    onSearchChange('')
                  }}
                  className={`w-full text-left p-2 text-xs rounded-lg transition-colors flex items-center justify-between border-none cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-bold'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <span className="truncate mr-2">
                    {p.ad_soyad}
                    {isHarcamaYetkilisiField && p.harcama_yetkilisi_mi === 1 && (
                      <span className="text-amber-500 font-bold ml-1 text-[11px]">
                        ★ Harcama Yetkilisi
                      </span>
                    )}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {p.unvan && (
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[110px]">
                        {p.unvan}
                      </span>
                    )}
                    {isSelected && <Check size={13} className="text-blue-600 dark:text-blue-400" />}
                  </div>
                </button>
              )
            })}

            {(filteredPersoneller ?? []).length === 0 && (
              <div className="p-3 text-center text-xs text-slate-400">
                Eşleşen personel bulunamadı
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

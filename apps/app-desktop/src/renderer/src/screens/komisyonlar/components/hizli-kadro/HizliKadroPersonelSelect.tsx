import React from 'react'
import { Check, ChevronDown, Search, UserPlus, X } from 'lucide-react'
import { PersonelItem } from './types'

interface HizliKadroPersonelSelectProps {
  rowId: string | number
  personelId: number | null
  assignedPerson?: PersonelItem
  isOpen: boolean
  onToggleOpen: () => void
  searchTerm: string
  onSearchChange: (val: string) => void
  onSelectPersonel: (pId: number | null) => void
  personeller: PersonelItem[]
}

export const HizliKadroPersonelSelect: React.FC<HizliKadroPersonelSelectProps> = ({
  personelId,
  assignedPerson,
  isOpen,
  onToggleOpen,
  searchTerm,
  onSearchChange,
  onSelectPersonel,
  personeller
}) => {
  const filteredPersoneller = personeller.filter(
    (p) =>
      p.ad_soyad.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.unvan && p.unvan.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="relative">
      <div
        onClick={onToggleOpen}
        className={`flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-955 border rounded-xl text-xs font-medium cursor-pointer transition-all ${
          isOpen
            ? 'border-blue-500 ring-2 ring-blue-500/10'
            : assignedPerson
              ? 'border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100'
              : 'border-dashed border-slate-300 dark:border-slate-700 text-slate-400 hover:border-blue-400'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          {assignedPerson ? (
            <>
              <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center text-[9px] font-bold shrink-0">
                {assignedPerson.ad_soyad.substring(0, 2).toUpperCase()}
              </div>
              <div className="truncate">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {assignedPerson.ad_soyad}
                </span>
                {assignedPerson.unvan && (
                  <span className="text-slate-400 text-[11px] ml-1.5">
                    ({assignedPerson.unvan})
                  </span>
                )}
              </div>
            </>
          ) : (
            <span className="flex items-center gap-1.5 text-slate-400 italic">
              <UserPlus className="w-3 h-3" /> Personel Seçiniz...
            </span>
          )}
        </div>
        <ChevronDown className="w-3 h-3 text-slate-400 shrink-0 ml-1" />
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2 max-h-56 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
          <div className="relative mb-2">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              autoFocus
              placeholder="Personel ara..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 text-slate-800 dark:text-slate-200"
            />
          </div>
          <div className="overflow-y-auto flex-1 custom-scrollbar divide-y divide-slate-100 dark:divide-slate-800/50">
            <button
              type="button"
              onClick={() => onSelectPersonel(null)}
              className="w-full text-left px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors flex items-center justify-between cursor-pointer"
            >
              <span>(Atamayı Kaldır)</span>
              <X className="w-3 h-3" />
            </button>
            {filteredPersoneller.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-400">Personel bulunamadı</div>
            ) : (
              filteredPersoneller.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onSelectPersonel(p.id)}
                  className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                    personelId === p.id
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div>
                    <div className="font-semibold">{p.ad_soyad}</div>
                    {p.unvan && <div className="text-[10px] text-slate-400">{p.unvan}</div>}
                  </div>
                  {personelId === p.id && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

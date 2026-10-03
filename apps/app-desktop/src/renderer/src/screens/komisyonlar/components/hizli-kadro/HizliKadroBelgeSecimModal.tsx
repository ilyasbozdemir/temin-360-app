import React, { useMemo, useState } from 'react'
import { Check, CheckSquare, FileText, Search, Square, X } from 'lucide-react'
import {
  DEFAULT_MUAYENE_SABLONLAR,
  DEFAULT_YAKLASIK_SABLONLAR,
  TEMPLATE_NAMES
} from '../../../../../../shared/constants/templateConstants'

const DEFAULT_OLUR_ONAY_SABLONLAR = [
  'dogrudan-temin-onay-belgesi',
  'idare-onay-belgesi',
  'harcama-talimati',
  'dogrudan-temin-sonuc-onay-belgesi',
  'ihale-komisyon-karari',
  'dogrudan-temin-sozlesmesi',
  'dogrudan-temin-sozlesmesi-alternatif',
  'dogrudan-temin-sozlesmesi-uzun',
  'odeme-emri-belgesi',
  'odeme-yazisi'
]

interface HizliKadroBelgeSecimModalProps {
  isOpen: boolean
  onClose: () => void
  memberName: string
  memberGorev: string
  selectedDocs: string[]
  onSave: (docs: string[]) => void
}

export function HizliKadroBelgeSecimModal({
  isOpen,
  onClose,
  memberName,
  memberGorev,
  selectedDocs,
  onSave
}: HizliKadroBelgeSecimModalProps): React.JSX.Element | null {
  const [selected, setSelected] = useState<string[]>(() => selectedDocs || [])
  const [search, setSearch] = useState('')

  React.useEffect(() => {
    if (isOpen) {
      setSelected(selectedDocs || [])
      setSearch('')
    }
  }, [isOpen, selectedDocs])

  const allDocList = useMemo(() => {
    return Object.entries(TEMPLATE_NAMES).map(([key, label]) => ({
      key,
      label: String(label)
    }))
  }, [])

  const filteredDocs = useMemo(() => {
    if (!search.trim()) return allDocList
    const q = search.toLowerCase()
    return allDocList.filter(
      (d) => d.label.toLowerCase().includes(q) || d.key.toLowerCase().includes(q)
    )
  }, [allDocList, search])

  if (!isOpen) return null

  const toggleDoc = (key: string) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  const handleSelectAll = () => {
    setSelected(allDocList.map((d) => d.key))
  }

  const handleClearAll = () => {
    setSelected([])
  }

  const applyPreset = (preset: readonly string[] | string[]) => {
    setSelected(Array.from(new Set(preset)))
  }

  const handleConfirm = () => {
    onSave(selected)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              Hedef Belge Seçimi — {memberName || 'Personel'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Görev: <span className="font-semibold text-slate-700 dark:text-slate-300">{memberGorev}</span> • Yalnızca seçili evrakların imza/komisyon bloklarında yer alır.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toolbar & Search */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col gap-2.5">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Şablon veya evrak adı ara..."
              className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
          </div>

          <div className="flex items-center justify-between flex-wrap gap-1.5 text-xs">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleSelectAll}
                className="px-2.5 py-1 font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1"
              >
                <CheckSquare className="w-3.5 h-3.5" /> Tümünü Seç
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="px-2.5 py-1 font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1"
              >
                <Square className="w-3.5 h-3.5" /> Temizle
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => applyPreset(DEFAULT_YAKLASIK_SABLONLAR)}
                className="px-2 py-0.5 font-medium rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 text-[11px]"
              >
                🛒 Fiyat Araştırma
              </button>
              <button
                type="button"
                onClick={() => applyPreset(DEFAULT_MUAYENE_SABLONLAR)}
                className="px-2 py-0.5 font-medium rounded-md bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 text-[11px]"
              >
                🔬 Muayene Kabul
              </button>
              <button
                type="button"
                onClick={() => applyPreset(DEFAULT_OLUR_ONAY_SABLONLAR)}
                className="px-2 py-0.5 font-medium rounded-md bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 text-[11px]"
              >
                📑 Olur / Onay
              </button>
            </div>
          </div>
        </div>

        {/* List of Documents */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100 dark:divide-slate-800/60">
          {filteredDocs.map((doc) => {
            const isChecked = selected.includes(doc.key)
            return (
              <label
                key={doc.key}
                onClick={() => toggleDoc(doc.key)}
                className={`flex items-center justify-between py-2 px-2.5 rounded-xl cursor-pointer transition-colors ${
                  isChecked
                    ? 'bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 font-semibold'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                      isChecked
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span className="text-xs truncate">{doc.label}</span>
                </div>
                <span className="text-[10px] font-mono font-normal text-slate-400 dark:text-slate-500 shrink-0">
                  {doc.key}
                </span>
              </label>
            )
          })}
          {filteredDocs.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-400">
              Aramanızla eşleşen şablon bulunamadı.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            {selected.length} / {allDocList.length} belge seçildi
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors"
            >
              Vazgeç
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-4 py-1.5 text-xs font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-all"
            >
              Seçimi Kaydet
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

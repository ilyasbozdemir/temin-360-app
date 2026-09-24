import React, { useMemo, useState } from 'react'
import { AlertTriangle, CheckSquare, Plus, Search, Square, UserPlus, X } from 'lucide-react'
import { Firma, FirmaEkleModaliProps, MAX_FIRMS } from './types'

export function FirmaEkleModali({
  availableFirms,
  addedCount,
  onConfirm,
  onOpenNewFirm,
  onClose
}: FirmaEkleModaliProps): React.JSX.Element {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Set<number>>(new Set())

  const remaining = MAX_FIRMS - addedCount

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return availableFirms
    return availableFirms.filter(
      (f) =>
        String(f.unvan ?? '')
          .toLowerCase()
          .includes(q) ||
        String(f.vergi_no ?? '')
          .toLowerCase()
          .includes(q) ||
        String(f.sehir ?? '')
          .toLowerCase()
          .includes(q) ||
        String(f.telefon ?? '')
          .toLowerCase()
          .includes(q)
    )
  }, [availableFirms, query])

  const toggle = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        if (next.size < remaining) next.add(id)
      }
      return next
    })
  }

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleConfirm = async () => {
    setIsSubmitting(true)
    try {
      const firmsToAdd = availableFirms.filter((f) => selected.has(f.id))
      await onConfirm(firmsToAdd)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[80vh] border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-[10px] font-black uppercase tracking-wider">
                1. Adım
              </span>
              <span>İstekli Firma Seçimi & Teklif Dağıtımı</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Havuzdan Ekle
              </span>
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Fiyat teklifi istenecek istekli firmaları seçin (En fazla{' '}
              <span className="font-bold text-amber-500">{MAX_FIRMS}</span> firma). Seçimden sonra
              teklif mektupları dağıtılır ve toplanan fiyatlar{' '}
              <strong>2. Adım (Fiyat Girişi)</strong> aşamasında sisteme işlenir.
              {remaining < MAX_FIRMS && (
                <span className="ml-1 text-slate-500">
                  (Mevcut: {addedCount}, Kalan: {remaining})
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose()
                onOpenNewFirm()
              }}
              className="px-2.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Yeni Firma Kaydı</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {remaining === 0 && (
          <div className="mx-5 mt-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 text-[11px] font-semibold">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            Maksimum {MAX_FIRMS} firma eklenebilir. Yeni eklemek için önce mevcut bir firmayı
            çıkarın.
          </div>
        )}

        <div className="p-4 pb-0">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Firma ara (Unvan, VKN, Şehir, Telefon)..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
          {filtered.length === 0 ? (
            <div className="py-8 text-center flex flex-col items-center justify-center gap-2">
              <p className="text-xs text-slate-400">Eşleşen havuz firması bulunamadı.</p>
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onOpenNewFirm()
                }}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Bu isimle yeni firma oluştur & ekle
              </button>
            </div>
          ) : (
            filtered.map((firma) => {
              const isSelected = selected.has(firma.id)
              const isDisabled = !isSelected && selected.size >= remaining
              return (
                <button
                  key={firma.id}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => toggle(firma.id)}
                  className={[
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all cursor-pointer',
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
                      : isDisabled
                        ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-150 dark:border-slate-800 opacity-50 cursor-not-allowed'
                        : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-900/10'
                  ].join(' ')}
                >
                  <span className={isSelected ? 'text-blue-500' : 'text-slate-400'}>
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                      {firma.unvan}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                      {[firma.vergi_no, firma.sehir, firma.telefon].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                </button>
              )
            })
          )}
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <p className="text-[11px] text-slate-500">
            {selected.size > 0 ? (
              <span>
                <span className="font-bold text-blue-600">{selected.size}</span> firma seçildi
              </span>
            ) : (
              'Eklenecek firmaları işaretleyin'
            )}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              İptal
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={selected.size === 0 || isSubmitting}
              className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer border-0 shadow-xs"
            >
              {isSubmitting ? 'Ekleniyor...' : `Seçilenleri Ekle (${selected.size})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

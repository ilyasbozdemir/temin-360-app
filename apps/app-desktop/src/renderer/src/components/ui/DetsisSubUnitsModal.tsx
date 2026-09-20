import React, { useState, useEffect } from 'react'
import {
  Building2,
  CheckCircle2,
  Download,
  Loader2,
  RefreshCw,
  Search,
  Sparkles,
  MapPin,
  ShieldCheck,
  AlertCircle
} from 'lucide-react'
import { Modal } from './Modal'

export interface DetsisSubUnitItem {
  detsisNo: string
  birimAdi: string
  kurumHiyerarsisi?: string
  ulkeAdi?: string
  ilAdi?: string
  ilceAdi?: string
  kategoriAdi?: string
  statuAdi?: string
  logoByteArray?: string
}

interface DetsisSubUnitsModalProps {
  isOpen: boolean
  onClose: () => void
  institutionDetsisNo?: string
  institutionName?: string
  existingBirimDetsisNos?: string[]
  existingBirimNames?: string[]
  onImportUnits: (units: DetsisSubUnitItem[]) => Promise<void> | void
}

export function DetsisSubUnitsModal({
  isOpen,
  onClose,
  institutionDetsisNo,
  institutionName,
  existingBirimDetsisNos = [],
  existingBirimNames = [],
  onImportUnits
}: DetsisSubUnitsModalProps): React.JSX.Element | null {
  const [loading, setLoading] = useState(false)
  const [units, setUnits] = useState<DetsisSubUnitItem[]>([])
  const [selectedNos, setSelectedNos] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cleanInstNo = (institutionDetsisNo || '').toString().trim().replace(/[^0-9]/g, '')

  const fetchSubUnits = async (id: string): Promise<void> => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      if (!window.electron?.ipcRenderer) {
        throw new Error('Elektron IPC bağlantısı kurulamadı.')
      }

      const res = (await window.electron.ipcRenderer.invoke('network:get-detsis-subunits', id)) as {
        success: boolean
        data?: DetsisSubUnitItem[]
        totalCount?: number
        error?: string
      }

      if (res && res.success && Array.isArray(res.data)) {
        setUnits(res.data)
        // Auto-select non-existing ones
        const newSet = new Set<string>()
        res.data.forEach((u) => {
          const alreadyExists =
            existingBirimDetsisNos.includes(u.detsisNo) ||
            existingBirimNames.some(
              (name) => name.toLowerCase().trim() === u.birimAdi.toLowerCase().trim()
            )
          if (!alreadyExists) {
            newSet.add(u.detsisNo)
          }
        })
        setSelectedNos(newSet)
      } else {
        setError(res?.error || 'Alt birimler alınamadı.')
        setUnits([])
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Bağlantı hatası oluştu.')
      setUnits([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && cleanInstNo) {
      fetchSubUnits(cleanInstNo)
    } else if (isOpen) {
      setUnits([])
      setSelectedNos(new Set())
    }
  }, [isOpen, cleanInstNo])

  const filteredUnits = units.filter(
    (u) =>
      u.birimAdi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.detsisNo.includes(searchTerm) ||
      (u.ilceAdi && u.ilceAdi.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleToggleSelectAll = (): void => {
    if (selectedNos.size === filteredUnits.length) {
      setSelectedNos(new Set())
    } else {
      setSelectedNos(new Set(filteredUnits.map((u) => u.detsisNo)))
    }
  }

  const handleToggleOne = (detsisNo: string): void => {
    const next = new Set(selectedNos)
    if (next.has(detsisNo)) {
      next.delete(detsisNo)
    } else {
      next.add(detsisNo)
    }
    setSelectedNos(next)
  }

  const handleImport = async (): Promise<void> => {
    const selectedItems = units.filter((u) => selectedNos.has(u.detsisNo))
    if (selectedItems.length === 0) return

    setImporting(true)
    try {
      await onImportUnits(selectedItems)
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'İçe aktarma sırasında hata oluştu.')
    } finally {
      setImporting(false)
    }
  }

  if (!isOpen) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="DETSİS'ten Alt Birimleri / Müdürlükleri Toplu İçe Aktar"
      description={`${institutionName || 'Kurum'} bünyesinde DETSİS sisteminde kayıtlı olan tüm alt birim ve müdürlükleri tek tıkla veritabanınıza aktarın.`}
    >
      <div className="space-y-4">
        {/* Header summary */}
        <div className="flex items-center justify-between p-3 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 rounded-2xl">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <h4 className="text-xs font-bold text-blue-900 dark:text-blue-200">
                {institutionName || 'Tanımlı Kurum'}
              </h4>
              <p className="text-[10px] text-blue-700/80 dark:text-blue-400/80">
                DETSİS Kodu: <strong>{cleanInstNo || 'Tanımsız'}</strong> • Toplam Birim:{' '}
                <strong>{units.length}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => cleanInstNo && fetchSubUnits(cleanInstNo)}
            disabled={loading || !cleanInstNo}
            className="p-1.5 rounded-xl text-blue-600 hover:bg-blue-100/70 dark:text-blue-400 dark:hover:bg-blue-900/40 transition-colors cursor-pointer"
            title="Yenile"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Birimler arasında filtrele..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-100 placeholder-slate-400"
            />
          </div>

          <button
            type="button"
            onClick={handleToggleSelectAll}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors shrink-0"
          >
            {selectedNos.size === filteredUnits.length ? 'Seçimi Kaldır' : 'Tümünü Seç'}
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Units list */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-blue-600 dark:text-blue-400 text-xs">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>DETSİS alt birimleri çekiliyor...</span>
          </div>
        ) : filteredUnits.length > 0 ? (
          <div className="max-h-[320px] overflow-y-auto space-y-1.5 pr-1 border border-slate-100 dark:border-slate-800/60 p-1.5 rounded-2xl">
            {filteredUnits.map((u) => {
              const isSelected = selectedNos.has(u.detsisNo)
              const alreadyExists =
                existingBirimDetsisNos.includes(u.detsisNo) ||
                existingBirimNames.some(
                  (name) => name.toLowerCase().trim() === u.birimAdi.toLowerCase().trim()
                )

              return (
                <div
                  key={u.detsisNo}
                  onClick={() => handleToggleOne(u.detsisNo)}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer select-none transition-all ${
                    isSelected
                      ? 'bg-blue-50/70 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700'
                      : 'bg-white dark:bg-slate-900/50 border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}} // handled by parent div
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500/50 shrink-0"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                          {u.birimAdi}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                          {u.detsisNo}
                        </span>
                        {alreadyExists && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Zaten Ekli
                          </span>
                        )}
                      </div>

                      {u.kurumHiyerarsisi && (
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                          {u.kurumHiyerarsisi}
                        </p>
                      )}
                    </div>
                  </div>

                  {u.ilceAdi && (
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 shrink-0">
                      <MapPin className="w-3 h-3 text-emerald-500" />
                      <span>{[u.ilceAdi, u.ilAdi].filter(Boolean).join(' / ')}</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-10 text-xs text-slate-400 space-y-1">
            <Building2 className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
            <p>Bu kuruma ait alt birim bulunamadı.</p>
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-500">
            Seçilen:{' '}
            <strong className="text-blue-600 dark:text-blue-400">{selectedNos.size}</strong> birim
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors"
            >
              İptal
            </button>
            <button
              type="button"
              onClick={handleImport}
              disabled={selectedNos.size === 0 || importing}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-blue-500/10 cursor-pointer disabled:cursor-not-allowed"
            >
              {importing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>Seçilenleri İçe Aktar ({selectedNos.size})</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

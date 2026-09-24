import React, { useState, useMemo } from 'react'
import {
  RefreshCw,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  PackageCheck
} from 'lucide-react'
import { Modal } from '@renderer/components/ui/Modal'
import { Button } from '@renderer/components/ui/Button'

export interface KalemDiffField {
  fieldName: string
  fieldLabel: string
  oldValue: any
  newValue: any
  isChanged: boolean
}

export interface KalemDiffItem {
  teminKalemId: number
  katalogId?: number
  kalemAdi: string
  eskiKalem: any
  yeniKatalogVerisi: any
  fields: KalemDiffField[]
  hasChanges: boolean
}

import type { KatalogSenkronizasyonModalProps } from '../types'

export type { KatalogSenkronizasyonModalProps }

export function KatalogSenkronizasyonModal({
  isOpen,
  onClose,
  diffItems,
  isLoading = false,
  onApplyUpdates
}: KatalogSenkronizasyonModalProps): React.JSX.Element {
  const [deselectedIds, setDeselectedIds] = useState<Set<number>>(new Set())
  const [collapsedIds, setCollapsedIds] = useState<Set<number>>(new Set())
  const [isApplying, setIsApplying] = useState(false)

  // Sadece değişiklik olan kalemler
  const changedItems = useMemo(() => diffItems.filter((d) => d.hasChanges), [diffItems])

  const selectedCount = useMemo(() => {
    return changedItems.filter((d) => !deselectedIds.has(d.teminKalemId)).length
  }, [changedItems, deselectedIds])

  const handleToggleSelect = (id: number): void => {
    setDeselectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleToggleSelectAll = (): void => {
    if (selectedCount === changedItems.length) {
      // Tümünü kaldır
      setDeselectedIds(new Set(changedItems.map((d) => d.teminKalemId)))
    } else {
      // Tümünü seç
      setDeselectedIds(new Set())
    }
  }

  const handleToggleExpand = (id: number): void => {
    setCollapsedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleApply = async (): Promise<void> => {
    const selected = changedItems.filter((d) => !deselectedIds.has(d.teminKalemId))
    if (selected.length === 0) {
      alert('Lütfen güncellenecek en az bir kalem seçin.')
      return
    }

    setIsApplying(true)
    try {
      await onApplyUpdates(selected)
      onClose()
    } catch (err: any) {
      alert('Güncelleme sırasında hata oluştu: ' + (err?.message || err))
    } finally {
      setIsApplying(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Kütüphane / Katalog Senkronizasyon & Karşılaştırma"
      className="max-w-4xl"
    >
      <div className="space-y-4 p-1">
        {/* Üst Bilgi Barı */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-slate-50 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-slate-900/40 border border-blue-100 dark:border-blue-900/40 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </div>
          <div className="space-y-1 flex-1">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Katalog Güncelleme Denetimi
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                {changedItems.length} Kalemde Fark Bulundu
              </span>
            </h4>
            <p className="text-[11.5px] text-slate-600 dark:text-slate-300 leading-relaxed">
              Dosyanızdaki ihtiyaç kalemleri ana malzeme/poz kütüphanesindeki güncel verilerle
              karşılaştırıldı. Onayladığınızda <strong>dosyadaki miktarınız korunarak</strong> isim,
              birim, taşınır kodu, kdv ve teknik açıklamalar güncellenir.
            </p>
          </div>
        </div>

        {/* İçerik */}
        {isLoading ? (
          <div className="py-16 text-center text-xs text-slate-400 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-500" />
            <p>Kütüphane verileri karşılaştırılıyor...</p>
          </div>
        ) : changedItems.length === 0 ? (
          <div className="py-12 text-center bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center mx-auto">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
              Tüm Kalemler Kütüphane ile Senkronize
            </h3>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 max-w-md mx-auto">
              Dosyanızdaki ihtiyaç/imalat kalemleri ana katalogdaki en güncel isim, birim, taşınır
              ve KDV tanımlarıyla birebir uyumludur. Herhangi bir değişiklik gerekmiyor.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Toolbar: Tümünü Seç / Kaldır */}
            <div className="flex items-center justify-between px-1 text-xs">
              <label className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedCount === changedItems.length && changedItems.length > 0}
                  onChange={handleToggleSelectAll}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span>
                  Tüm Değişiklikleri Seç ({selectedCount} / {changedItems.length})
                </span>
              </label>

              <span className="text-[11px] text-slate-400">Sadece seçili kalemler güncellenir</span>
            </div>

            {/* Diff Listesi */}
            <div className="max-h-[50vh] overflow-y-auto space-y-3 pr-1">
              {changedItems.map((diff) => {
                const isSelected = !deselectedIds.has(diff.teminKalemId)
                const isExpanded = !collapsedIds.has(diff.teminKalemId)
                const changedFields = diff.fields.filter((f) => f.isChanged)

                return (
                  <div
                    key={diff.teminKalemId}
                    className={`rounded-2xl border transition-all overflow-hidden ${
                      isSelected
                        ? 'bg-white dark:bg-slate-900 border-blue-300 dark:border-blue-700 shadow-xs'
                        : 'bg-slate-50/60 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 opacity-80'
                    }`}
                  >
                    {/* Kart Başlığı */}
                    <div className="p-3.5 flex items-center justify-between gap-3 bg-slate-50/80 dark:bg-slate-850/60 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3 min-w-0">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(diff.teminKalemId)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                              {diff.kalemAdi}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                              {changedFields.length} alan değişti
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            Miktar: {diff.eskiKalem?.miktar} {diff.eskiKalem?.birim}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleExpand(diff.teminKalemId)}
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                        title={isExpanded ? 'Daralt' : 'Genişlet'}
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>

                    {/* Diff Tablosu / Alanları */}
                    {isExpanded && (
                      <div className="p-3 bg-slate-50/30 dark:bg-slate-900/40 space-y-2">
                        {changedFields.map((f, fIdx) => (
                          <div
                            key={fIdx}
                            className="grid grid-cols-10 items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-950/80 border border-slate-150 dark:border-slate-800 text-xs shadow-2xs"
                          >
                            {/* Alan Adı */}
                            <div className="col-span-2 font-semibold text-slate-600 dark:text-slate-400 text-[11px]">
                              {f.fieldLabel}
                            </div>

                            {/* Eski Değer */}
                            <div className="col-span-4 bg-red-50/70 dark:bg-red-955/20 border border-red-200 dark:border-red-900/40 p-2 rounded-lg text-red-700 dark:text-red-400 text-[11px] line-through wrap-break-word">
                              {f.oldValue !== null &&
                              f.oldValue !== undefined &&
                              String(f.oldValue).trim() !== ''
                                ? String(f.oldValue)
                                : '(Boş)'}
                            </div>

                            {/* Ok İkonu */}
                            <div className="col-span-0.5 flex justify-center text-slate-400">
                              <ArrowRight size={14} />
                            </div>

                            {/* Yeni Değer */}
                            <div className="col-span-4 bg-emerald-50/80 dark:bg-emerald-955/20 border border-emerald-200 dark:border-emerald-800/50 p-2 rounded-lg text-emerald-900 dark:text-emerald-300 font-bold text-[11px] wrap-break-word flex items-center gap-1.5">
                              <Sparkles size={12} className="text-emerald-600 shrink-0" />
                              <span>
                                {f.newValue !== null &&
                                f.newValue !== undefined &&
                                String(f.newValue).trim() !== ''
                                  ? String(f.newValue)
                                  : '(Boş)'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Footer Butonları */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            {changedItems.length > 0 && (
              <span>
                <strong>{selectedCount}</strong> / {changedItems.length} kalem seçildi
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isApplying}
              className="text-xs"
            >
              Vazgeç
            </Button>

            {changedItems.length > 0 && (
              <Button
                type="button"
                onClick={handleApply}
                disabled={isApplying || selectedCount === 0}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 shadow-sm px-4"
              >
                {isApplying ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Güncelleniyor...
                  </>
                ) : (
                  <>
                    <PackageCheck size={15} />
                    Değişiklikleri Uygula & Güncelle ({selectedCount})
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}

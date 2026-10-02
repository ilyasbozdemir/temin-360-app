import React, { useState } from 'react'
import {
  FileCheck,
  ReceiptText,
  Sparkles,
  Paperclip,
  Plus,
  X,
  CheckCircle2,
  FileText,
  Layers
} from 'lucide-react'
import { FirmaStats } from './types'
import { cn } from '@renderer/utils/cn'
import { ButceVeOdenekCard } from './ButceVeOdenekCard'

interface Props {
  kazananFirmaUnvan: string
  firmaStats: FirmaStats
  formatCurrency: (val: number | null) => string
  onOpenResultApproval: () => void
  onOpenButceSorgusu?: () => void
  ekler?: string[]
  onUpdateEkler?: (ekler: string[]) => void
  activeDosyaId?: number | null
}

export const STANDART_SUREC_BELGELERI = [
  {
    label: 'Piyasa Fiyat Araştırması Tutanağı',
    desc: 'İsteklilerden toplanan tekliflerin özet tablosu'
  },
  { label: 'Teklif Mektupları', desc: 'Firmalar tarafından sunulan kaşeli/imzalı teklifler' },
  { label: 'İhtiyaç Raporu', desc: 'Birim tarafından talep edilen ihtiyaç gerekçesi' },
  { label: 'Harcama Talimatı', desc: 'Harcama yetkilisinin doğrudan temin alım talimatı' },
  {
    label: 'Yaklaşık Maliyet Hesap Cetveli',
    desc: 'Fiyat araştırması öncesi belirlenen tahmini maliyet'
  },
  { label: 'Teknik Şartname / Talep Yazısı', desc: 'Alınacak mal/hizmetin teknik özellikleri' },
  { label: 'Ödenek / Bütçe Uygunluk Belgesi', desc: 'Mali hizmetler ödenek teyit belgesi' }
]

export const Step2SonucOnay: React.FC<Props> = ({
  kazananFirmaUnvan,
  firmaStats,
  formatCurrency,
  onOpenResultApproval,
  onOpenButceSorgusu,
  ekler = [
    'Piyasa Fiyat Araştırması Tutanağı',
    'Teklif Mektupları',
    'İhtiyaç Raporu',
    'Harcama Talimatı',
    'Yaklaşık Maliyet Hesap Cetveli'
  ],
  onUpdateEkler,
  activeDosyaId
}) => {
  const [newEkInput, setNewEkInput] = useState('')

  const handleToggleDoc = (label: string): void => {
    let updated: string[]
    if (ekler.includes(label)) {
      updated = ekler.filter((e) => e !== label)
    } else {
      updated = [...ekler, label]
    }
    onUpdateEkler?.(updated)
  }

  const handleAddCustomEk = (text: string): void => {
    const trimmed = text.trim()
    if (!trimmed || ekler.includes(trimmed)) return
    const updated = [...ekler, trimmed]
    onUpdateEkler?.(updated)
    setNewEkInput('')
  }

  const handleRemoveCustomEk = (item: string): void => {
    const updated = ekler.filter((e) => e !== item)
    onUpdateEkler?.(updated)
  }

  const handleSelectAll = (): void => {
    const allLabels = STANDART_SUREC_BELGELERI.map((b) => b.label)
    const combined = Array.from(new Set([...ekler, ...allLabels]))
    onUpdateEkler?.(combined)
  }

  const handleClearAll = (): void => {
    onUpdateEkler?.([])
  }

  // Standart dışı kullanıcı tarafından elle girilmiş ekler
  const customEkler = ekler.filter((e) => !STANDART_SUREC_BELGELERI.some((s) => s.label === e))

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 flex flex-col gap-3">
          {/* Karar & Onay Özeti */}
          <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-850/60 border border-slate-200/70 dark:border-slate-800 flex flex-col gap-3">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              Karar & Onay Özeti
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-bold">
                  Uygun Görülen İstekli
                </span>
                <strong className="text-slate-800 dark:text-slate-100">
                  {kazananFirmaUnvan || 'Belirtilmedi'}
                </strong>
              </div>
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-bold">
                  Onaylanacak Tutar (KDV Hariç)
                </span>
                <strong className="text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(firmaStats.teklifToplami)}
                </strong>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Bu belgeler harcama yetkilisinin onayına sunularak alımın kesinleşmesini sağlar.
              Aşağıdaki listeden Sonuç Onay Belgesi altına eklenecek resmi dosya evraklarını
              seçebilirsiniz.
            </p>
          </div>

          {/* ═══ Bütçe & Ödenek Tertibi Yönetimi Paneli ═══ */}
          <ButceVeOdenekCard
            activeDosyaId={activeDosyaId}
            onOpenButceSorgusu={onOpenButceSorgusu}
          />

          {/* Süreç Belgeleri ve EKLER Seçimi */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col gap-3 shadow-xs">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    Sonuç Onay Belgesine Eklenecek Evraklar (EKLER)
                  </h4>
                  <span className="text-[10.5px] text-slate-400">
                    Onay belgesi altında gösterilecek evrakları işaretleyin
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-[10.5px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline px-1.5 py-0.5"
                >
                  Tümünü Seç
                </button>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-[10.5px] font-bold text-slate-400 hover:text-red-500 px-1.5 py-0.5"
                >
                  Temizle
                </button>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-extrabold border border-emerald-200 dark:border-emerald-800 ml-1">
                  {ekler.length} Belge Seçili
                </span>
              </div>
            </div>

            {/* Standart Belge Listesi (Göster / Gizle Toggles) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
              {STANDART_SUREC_BELGELERI.map((doc, idx) => {
                const isSelected = ekler.includes(doc.label)
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleToggleDoc(doc.label)}
                    className={cn(
                      'p-2.5 rounded-xl border text-left flex items-start justify-between gap-2.5 transition-all cursor-pointer',
                      isSelected
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700 shadow-2xs'
                        : 'bg-slate-50/50 dark:bg-slate-850/40 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 opacity-70'
                    )}
                  >
                    <div className="flex items-start gap-2 min-w-0">
                      <div
                        className={cn(
                          'w-5 h-5 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold',
                          isSelected
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                        )}
                      >
                        {isSelected ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <FileText className="w-3 h-3" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <span
                          className={cn(
                            'text-xs font-bold block truncate',
                            isSelected
                              ? 'text-emerald-900 dark:text-emerald-200'
                              : 'text-slate-600 dark:text-slate-400'
                          )}
                        >
                          {doc.label}
                        </span>
                        <span className="text-[10px] text-slate-400 block line-clamp-1">
                          {doc.desc}
                        </span>
                      </div>
                    </div>

                    <span
                      className={cn(
                        'text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 uppercase tracking-wider',
                        isSelected
                          ? 'bg-emerald-200/80 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                      )}
                    >
                      {isSelected ? 'Eklendi' : 'Gizli'}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Özel Ekler (Varsa) */}
            {customEkler.length > 0 && (
              <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10.5px] font-bold text-slate-500">
                  Özel Eklenen Diğer Belgeler:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {customEkler.map((item, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 font-medium"
                    >
                      <Paperclip className="w-3 h-3 text-emerald-600" />
                      {item}
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomEk(item)}
                        className="p-0.5 hover:text-red-500 rounded cursor-pointer"
                        title="Kaldır"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Yeni Özel Ek Ekleme */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <input
                type="text"
                value={newEkInput}
                onChange={(e) => setNewEkInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddCustomEk(newEkInput)
                  }
                }}
                placeholder="Örn: Ruhsat Fotokopisi, Numune Raporu vb."
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => handleAddCustomEk(newEkInput)}
                disabled={!newEkInput.trim()}
                className="px-3 py-1.5 rounded-lg bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-all shrink-0 disabled:opacity-40"
              >
                <Plus className="w-3.5 h-3.5" />
                Özel Ek Ekle
              </button>
            </div>
          </div>
        </div>

        {/* Sağ: Belge İşlemleri & Canlı Ekler Özeti */}
        <div className="flex flex-col gap-3">
          <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/60 flex flex-col justify-between gap-3 shadow-xs">
            <div>
              <span className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300 block mb-1">
                Onay Belgeleri İşlemleri
              </span>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 leading-relaxed">
                Sonuç onay belgesini veya bütçe sorgusu belgesini doğrudan açarak yazdırabilir veya
                indirebilirsiniz.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={onOpenResultApproval}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-95 transition-all"
              >
                <FileCheck className="w-4 h-4" />
                Sonuç Onay Belgesini Aç
              </button>

              {onOpenButceSorgusu && (
                <button
                  type="button"
                  onClick={onOpenButceSorgusu}
                  className="w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-slate-800 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60 font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-95 transition-all"
                >
                  <ReceiptText className="w-3.5 h-3.5" />
                  Bütçe Sorgusu Belgesi Aç
                </button>
              )}
            </div>
          </div>

          {/* Canlı Belge Çıktı Önizleme Özeti */}
          <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-800 flex flex-col gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Belgeye Yansıyacak EKLER ({ekler.length})
            </span>
            {ekler.length > 0 ? (
              <ol className="text-xs text-slate-700 dark:text-slate-300 list-decimal list-inside space-y-1 pl-1">
                {ekler.map((item, idx) => (
                  <li key={idx} className="truncate font-medium">
                    {item}
                  </li>
                ))}
              </ol>
            ) : (
              <span className="text-[11px] text-slate-400 italic">Hiçbir ek seçilmedi.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

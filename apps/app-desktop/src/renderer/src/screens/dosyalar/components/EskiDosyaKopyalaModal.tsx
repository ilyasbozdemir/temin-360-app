import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  Search,
  FileText,
  Calendar,
  Copy,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  Package,
  Building2,
  Users2,
  Sparkles,
  Info,
  Loader2
} from 'lucide-react'
import { TeminDosyasi } from '../dosyalar.hooks'
import { cn } from '../../../utils/cn'
import {
  calculateNextTeminNo,
  getDosyaCounts,
  CloneDosyaCustomOptions
} from '../../../utils/cloneDosya'

interface EskiDosyaKopyalaModalProps {
  isOpen: boolean
  onClose: () => void
  dosyalar: TeminDosyasi[]
  onSelect: (dosya: TeminDosyasi, options: CloneDosyaCustomOptions) => Promise<void> | void
}

export function EskiDosyaKopyalaModal({
  isOpen,
  onClose,
  dosyalar,
  onSelect
}: EskiDosyaKopyalaModalProps): React.JSX.Element | null {
  const [step, setStep] = useState<1 | 2>(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDosya, setSelectedDosya] = useState<TeminDosyasi | null>(null)
  const [isLoadingCounts, setIsLoadingCounts] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Alt veri sayaçları
  const [counts, setCounts] = useState<{
    itemCount: number
    firmCount: number
    commissionCount: number
  }>({ itemCount: 0, firmCount: 0, commissionCount: 0 })

  // Kopyalama Form Değerleri
  const [formData, setFormData] = useState<CloneDosyaCustomOptions>({
    temin_no: '',
    butce_yili: new Date().getFullYear(),
    konu: '',
    dosya_acilis_tarihi: new Date().toISOString().split('T')[0],
    son_teklif_verme_tarihi: '',
    teslim_tarihi: '',
    cloneItems: true,
    cloneFirms: true,
    cloneCommissions: false
  })

  // Modal açıldığında state sıfırlama
  useEffect(() => {
    if (isOpen) {
      setStep(1)
      setSearchQuery('')
      setSelectedDosya(null)
      setIsSubmitting(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  // Filtreleme
  const filteredDosyalar = dosyalar.filter((d) => {
    const q = searchQuery.toLowerCase()
    return (
      (d.konu && d.konu.toLowerCase().includes(q)) ||
      (d.temin_no && d.temin_no.toLowerCase().includes(q)) ||
      (d.birim_adi && d.birim_adi.toLowerCase().includes(q))
    )
  })

  // Dosya seçildiğinde 2. adıma geçiş ve form ön doldurma
  const handleSelectOldDosya = async (dosya: TeminDosyasi) => {
    setSelectedDosya(dosya)
    setIsLoadingCounts(true)
    setStep(2)

    try {
      const currentYear = new Date().getFullYear()
      const nextNo = await calculateNextTeminNo(currentYear, dosyalar)

      // 7 gün sonraki tarihi son teklif olarak öner
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 7)
      const defaultSonTeklif = futureDate.toISOString().split('T')[0]

      const dosyaCounts = dosya.id
        ? await getDosyaCounts(dosya.id)
        : { itemCount: 0, firmCount: 0, commissionCount: 0 }
      setCounts(dosyaCounts)

      setFormData({
        temin_no: nextNo,
        butce_yili: currentYear,
        konu: `${dosya.konu || 'Doğrudan Temin'} (Kopya)`,
        dosya_acilis_tarihi: new Date().toISOString().split('T')[0],
        son_teklif_verme_tarihi: defaultSonTeklif,
        teslim_tarihi: '',
        cloneItems: true,
        cloneFirms: true,
        cloneCommissions: false
      })
    } catch (err) {
      console.error('Kopyalama hazırlık hatası:', err)
    } finally {
      setIsLoadingCounts(false)
    }
  }

  // Kopyalamayı onayla ve çalıştır
  const handleConfirmCopy = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDosya) return
    try {
      setIsSubmitting(true)
      await onSelect(selectedDosya, formData)
    } catch (err) {
      console.error('Kopyalama onay hatası:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] overflow-y-auto p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs flex min-h-full items-center justify-center animate-in fade-in duration-200"
      style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-3xl my-auto max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 shrink-0">
          <div className="flex items-center gap-3">
            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={isSubmitting}
                className="p-2 -ml-1 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Dosya Seçimine Geri Dön"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Copy className="text-blue-600" size={20} />
                {step === 1 ? 'Mevcut Dosyadan Kopyala' : 'Kopyalama & Tarih Yapılandırması'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {step === 1
                  ? 'Kopyalamak istediğiniz kaynak doğrudan temin dosyasını seçin.'
                  : 'Yeni dosyanın tarihlerini, numarasını ve kopyalanacak veri kapsamını belirleyin.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-xl transition-colors shadow-xs cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* STEP 1: DOSYA SEÇİMİ */}
        {step === 1 && (
          <>
            {/* SEARCH BAR */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Dosya numarası, konu veya birim adı ile arayın..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-slate-800 dark:text-slate-200"
                  autoFocus
                />
              </div>
            </div>

            {/* LIST */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50 dark:bg-slate-950/50 custom-scrollbar">
              {filteredDosyalar.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <FileText className="text-slate-400" size={24} />
                  </div>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Kayıtlı Dosya Bulunamadı
                  </p>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    Arama kriterinize uygun kopyalanabilecek geçmiş dosya kaydı yok.
                  </p>
                </div>
              ) : (
                <div className="grid gap-2.5">
                  {filteredDosyalar.map((dosya) => (
                    <button
                      key={dosya.id}
                      type="button"
                      onClick={() => handleSelectOldDosya(dosya)}
                      className="w-full text-left p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-blue-500/60 dark:hover:border-blue-500/60 hover:shadow-md transition-all group flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[11px] font-mono font-black text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                            {dosya.temin_no || 'NO BELİRSİZ'}
                          </span>
                          <span
                            className={cn(
                              'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded',
                              dosya.tur === 'mal'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                                : dosya.tur === 'hizmet'
                                  ? 'bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300'
                                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                            )}
                          >
                            {dosya.tur === 'mal'
                              ? 'MAL ALIMI'
                              : dosya.tur === 'hizmet'
                                ? 'HİZMET ALIMI'
                                : dosya.tur === 'yapim_isi'
                                  ? 'YAPIM İŞİ'
                                  : 'DANIŞMANLIK'}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {dosya.konu}
                        </h3>
                        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="truncate max-w-[220px]" title={dosya.birim_adi || ''}>
                            🏢 {dosya.birim_adi || 'Birim Belirtilmemiş'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={11} />
                            {dosya.dosya_acilis_tarihi
                              ? new Date(dosya.dosya_acilis_tarihi).toLocaleDateString('tr-TR')
                              : '-'}
                          </span>
                          {dosya.yaklasik_maliyet ? (
                            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                              ₺ {dosya.yaklasik_maliyet.toLocaleString('tr-TR')}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all text-slate-400 shrink-0 shadow-xs">
                        <ChevronRight size={18} />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* STEP 2: YAPILANDIRMA VE TARİH FORMU */}
        {step === 2 && selectedDosya && (
          <form onSubmit={handleConfirmCopy} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 custom-scrollbar bg-slate-50/50 dark:bg-slate-950/50">
              {/* Kaynak Dosya Özeti */}
              <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/60 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-blue-600 text-white shrink-0 shadow-xs">
                  <Sparkles size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black font-mono text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/80 px-2 py-0.5 rounded">
                      KAYNAK: {selectedDosya.temin_no || 'Belirsiz'}
                    </span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                      {selectedDosya.birim_adi || 'Birim Yok'}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white mt-1 truncate">
                    {selectedDosya.konu}
                  </div>
                </div>
              </div>

              {/* BÖLÜM 1: TARİHLER VE TEMEL BİLGİLER */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Calendar size={14} className="text-blue-600" />
                  1. Yeni Dosya Bilgileri ve Tarihler
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Yeni DT / Dosya Numarası <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.temin_no || ''}
                      onChange={(e) => setFormData({ ...formData, temin_no: e.target.value })}
                      placeholder="2026/1"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Bütçe Yılı <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.butce_yili || new Date().getFullYear()}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          butce_yili: parseInt(e.target.value, 10) || new Date().getFullYear()
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Yeni Dosya Konusu / Başlığı <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.konu || ''}
                      onChange={(e) => setFormData({ ...formData, konu: e.target.value })}
                      placeholder="Doğrudan temin konusu..."
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Dosya Açılış / Onay Tarihi <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.dosya_acilis_tarihi || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, dosya_acilis_tarihi: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Son Teklif Verme Tarihi
                    </label>
                    <input
                      type="date"
                      value={formData.son_teklif_verme_tarihi || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, son_teklif_verme_tarihi: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                  </div>
                </div>
              </div>

              {/* BÖLÜM 2: KOPYALANACAK VERİ KAPSAMI */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    2. Kopyalanacak İçerikler ve Kapsam
                  </h3>
                  {isLoadingCounts && (
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Loader2 size={12} className="animate-spin" /> Veriler sayılıyor...
                    </span>
                  )}
                </div>

                <div className="grid gap-2.5">
                  {/* Kalemler Checkbox */}
                  <label
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none',
                      formData.cloneItems
                        ? 'border-blue-500/50 bg-blue-50/40 dark:bg-blue-950/20'
                        : 'border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={formData.cloneItems ?? true}
                      onChange={(e) => setFormData({ ...formData, cloneItems: e.target.checked })}
                      className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <Package size={14} className="text-blue-600" />
                          Malzeme ve Hizmet Kalemleri
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                          {counts.itemCount} Kalem
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Ürün adları, açıklamalar, birimler, miktarlar, taşınır ve KDV oranları.
                      </p>
                    </div>
                  </label>

                  {/* Firmalar Checkbox */}
                  <label
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none',
                      formData.cloneFirms
                        ? 'border-indigo-500/50 bg-indigo-50/40 dark:bg-indigo-950/20'
                        : 'border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={formData.cloneFirms ?? true}
                      onChange={(e) => setFormData({ ...formData, cloneFirms: e.target.checked })}
                      className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <Building2 size={14} className="text-indigo-600" />
                          Davet Edilen / İstekli Firmalar
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
                          {counts.firmCount} Firma
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Firma unvanları, vergi numaraları, yetkili ve iletişim bilgileri.
                      </p>
                    </div>
                  </label>

                  {/* Komisyon Üyeleri Checkbox */}
                  <label
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none',
                      formData.cloneCommissions
                        ? 'border-amber-500/50 bg-amber-50/40 dark:bg-amber-950/20'
                        : 'border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={formData.cloneCommissions ?? false}
                      onChange={(e) =>
                        setFormData({ ...formData, cloneCommissions: e.target.checked })
                      }
                      className="mt-0.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <Users2 size={14} className="text-amber-600" />
                          Komisyon Üyeleri & Görevliler
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300">
                          {counts.commissionCount} Üye
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Muayene ve kabul veya yaklaşık maliyet komisyon personelleri.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Temiz Başlangıç Notu */}
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-start gap-2 text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                  <Info size={15} className="text-blue-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Temiz Başlangıç Güvencesi:</strong> Eski dosyaya ait geçmiş teklif
                    fiyatları, faturalar ve kabul tutanakları aktarılmaz. Yeni dosyanız temiz ve
                    teklif toplamaya hazır olarak açılır.
                  </span>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft size={14} /> Geri
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !formData.temin_no || !formData.konu}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Kopyalanıyor...
                  </>
                ) : (
                  <>
                    <Copy size={14} /> Kopyala ve Dosyayı Başlat
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  )
}

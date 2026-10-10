import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from '@tanstack/react-router'
import { ArrowRight, Building, Copy, FileSpreadsheet, Sparkles, X, Zap } from 'lucide-react'
import { cn } from '../../utils/cn'
import { TeminDosyasi, useDosyalarHooks } from '../../screens/dosyalar/dosyalar.hooks'
import { EskiDosyaKopyalaModal } from '../../screens/dosyalar/components/EskiDosyaKopyalaModal'
import { cloneDosyaWithItems } from '../../utils/cloneDosya'
import { TEMIN_TURLERI, teminMeta, type TeminTuruId } from '../../constants/teminTurleri'

export interface YeniDosyaSecimModalProps {
  isOpen: boolean
  onClose: () => void
}

export function YeniDosyaSecimModal({
  isOpen,
  onClose
}: YeniDosyaSecimModalProps): React.JSX.Element | null {
  const navigate = useNavigate()
  const { dosyalar, addDosya } = useDosyalarHooks()
  const [showKopyalaModal, setShowKopyalaModal] = useState(false)
  const [isCloning, setIsCloning] = useState(false)

  if (!isOpen) return null

  const handleSelectTeminTur = (tur: TeminTuruId) => {
    onClose()
    navigate({
      to: '/dosyalar/yeni',
      search: { tur } as any
    })
  }

  const handleSelectHakedis = () => {
    onClose()
    navigate({ to: '/hakedis' })
  }

  const handleSelectKopyala = () => {
    setShowKopyalaModal(true)
  }

  const handleExecuteClone = async (
    eskiDosya: TeminDosyasi,
    options: import('../../utils/cloneDosya').CloneDosyaCustomOptions
  ) => {
    try {
      setIsCloning(true)
      setShowKopyalaModal(false)
      const res = await cloneDosyaWithItems(eskiDosya, dosyalar, addDosya, options)
      if (res.success && res.newId) {
        onClose()
        navigate({
          to: `/dosyalar/yeni?id=${res.newId}` as any
        })
      } else {
        alert('Kopyalama sırasında hata oluştu: ' + (res.error || 'Bilinmeyen hata'))
      }
    } catch (err: any) {
      alert('Kopyalama sırasında hata: ' + err.message)
    } finally {
      setIsCloning(false)
    }
  }

  const handleSelectImport = () => {
    onClose()
    navigate({ to: '/import' })
  }

  const teminTurleriList = TEMIN_TURLERI.map((t) => teminMeta(t.id)!).filter(Boolean)

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] overflow-y-auto p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs flex min-h-full items-center justify-center animate-in fade-in duration-200"
      style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl my-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/80 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  Yeni Dosya Tanımlama Sihirbazı
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Başlatmak istediğiniz işlem veya ihale türünü seçiniz:
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            title="Kapat"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6">
          {/* Bölüm 1: Doğrudan Temin Türleri */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                1. Doğrudan Temin Dosyaları (KİK Md. 22)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {teminTurleriList.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectTeminTur(item.id)}
                    className={cn(
                      'group flex items-start gap-3.5 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-left transition-all duration-200 cursor-pointer bg-white dark:bg-slate-900/60 shadow-xs hover:shadow-md',
                      item.borderHover
                    )}
                  >
                    <div
                      className={cn(
                        'p-2.5 rounded-xl shrink-0 transition-transform group-hover:scale-105',
                        item.iconColor
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5 mb-1">
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {item.label}
                        </span>
                        <span
                          className={cn(
                            'text-[10px] font-bold px-1.5 py-0.5 rounded border',
                            item.badgeColor
                          )}
                        >
                          {item.mevzuatAtfi}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                        {item.desc}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Bölüm 2: 2886 Sayılı Devlet İhale Kanunu Süreçleri */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Building className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                2. 2886 Sayılı Devlet İhale Kanunu (Taşınmaz Satış & Kiralama)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSelectTeminTur('kira_2886')}
                className="group flex items-start gap-3.5 p-4 rounded-2xl border border-teal-200/80 dark:border-teal-800/40 bg-teal-50/40 dark:bg-teal-950/20 text-left transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md hover:border-teal-400"
              >
                <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 shrink-0 group-hover:scale-105 transition-transform">
                  <Building className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1.5 mb-1">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-teal-600 transition-colors">
                      Taşınmaz Kiralama (2886)
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-200 dark:border-teal-800">
                      Md. 45 & 51/g
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                    Kamu taşınmazlarının kiraya verilmesi, ecrimisil ve irtifak hakkı ihale şartnameleri.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectTeminTur('satis_2886')}
                className="group flex items-start gap-3.5 p-4 rounded-2xl border border-rose-200/80 dark:border-rose-800/40 bg-rose-50/40 dark:bg-rose-950/20 text-left transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md hover:border-rose-400"
              >
                <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 shrink-0 group-hover:scale-105 transition-transform">
                  <Building className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1.5 mb-1">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-rose-600 transition-colors">
                      Taşınmaz / Taşınır Satışı (2886)
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-200 dark:border-rose-800">
                      Md. 45 & 35/a
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                    Devlet ve belediye taşınmazı/taşınırının ihale ile satışı ve mülkiyet devri.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Bölüm 3: Hakediş & Sözleşmeli Süreç Yönetimi */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Building className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                3. Hakediş & Sözleşmeli Süreç Yönetimi
              </h3>
            </div>

            <button
              type="button"
              onClick={handleSelectHakedis}
              className="w-full group flex items-center justify-between p-4 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/40 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md text-left"
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      Hakediş ve Süreç Dosyası Oluştur
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      Sözleşme & Hakediş
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    İhale veya sözleşmeye bağlı işlerde ara/kesin hakediş raporu, metraj ve kesinti takibi.
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 group-hover:translate-x-1 transition-transform ml-2" />
            </button>
          </div>

          {/* Bölüm 4: Hızlı Seçenekler / Kopyalama & Excel */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Copy className="w-4 h-4 text-slate-500" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                4. Hızlı Başlangıç & İçe Aktarma
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleSelectKopyala}
                className="group flex items-start gap-3 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-400/50 hover:bg-amber-50/40 dark:hover:bg-amber-950/20 text-left transition-all cursor-pointer shadow-xs"
              >
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 shrink-0">
                  <Copy className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 mb-0.5">
                    Mevcut Dosyadan Kopyala
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                    Kayıtlı eski dosyalardan kalemleri ve kurum bilgilerini
                    klonlayarak başlatır.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={handleSelectImport}
                className="group flex items-start gap-3 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-teal-400/50 hover:bg-teal-50/40 dark:hover:bg-teal-950/20 text-left transition-all cursor-pointer shadow-xs"
              >
                <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 shrink-0">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-teal-600 dark:group-hover:text-teal-400 mb-0.5">
                    Excel / .DTE İçe Aktar
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                    Excel tablosundan veya dış veri dosyasından toplu dosya ve
                    malzeme aktarımı.
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Vazgeç
          </button>
        </div>
      </div>

      {/* Eski Dosya Kopyala Modal */}
      <EskiDosyaKopyalaModal
        isOpen={showKopyalaModal}
        onClose={() => setShowKopyalaModal(false)}
        dosyalar={dosyalar}
        onSelect={handleExecuteClone}
      />
    </div>,
    document.body,
  );
}

import React, { useRef, useState } from 'react'
import {
  ArrowLeft,
  Bot,
  ChevronLeft,
  ChevronRight,
  Copy,
  FileEdit,
  FilePlus,
  MoreVertical,
  Save,
  Sparkles
} from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { formatDosyaNo } from '../../../../utils/formatDosyaNo'

export interface DosyaManageHeaderProps {
  isEdit: boolean
  editId?: number | null
  formData: any
  activeTab: 'genel' | 'ihtiyac'
  activeSubStep: number
  subStepCount: number
  onPrevSubStep: () => void
  onNextSubStep: () => void
  onOpenKopyalaModal: () => void
  onAiFormValidation: () => void
  onAiFullFormGenerate: () => void
  onClearForm: () => void
  onFillMockData: () => void
  onSave: (e: React.FormEvent | React.MouseEvent) => void
}

export const DosyaManageHeader: React.FC<DosyaManageHeaderProps> = ({
  isEdit,
  editId,
  formData,
  activeTab,
  activeSubStep,
  subStepCount,
  onPrevSubStep,
  onNextSubStep,
  onOpenKopyalaModal,
  onAiFormValidation,
  onAiFullFormGenerate,
  onClearForm,
  onFillMockData,
  onSave
}) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const moreMenuBtnRef = useRef<HTMLButtonElement>(null)

  const dosyaTitle = isEdit
    ? formatDosyaNo({ ...formData, id: editId })
    : formData.temin_no
      ? formatDosyaNo(formData)
      : 'Yeni Doğrudan Temin Kaydı'

  return (
    <div className="flex-none px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3 shadow-xs">
      {/* Sol: Geri + Başlık & Mod Bilgisi */}
      <div className="flex items-center gap-2.5 min-w-0">
        <Link
          to="/dosyalar"
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm shrink-0"
          title="Dosyalar Listesine Dön"
        >
          <ArrowLeft size={16} />
        </Link>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5 truncate">
              {isEdit ? (
                <FileEdit className="text-indigo-600 dark:text-indigo-400 shrink-0" size={16} />
              ) : (
                <FilePlus className="text-blue-600 dark:text-blue-400 shrink-0" size={16} />
              )}
              {isEdit ? 'Dosya Düzenleme & Yönetim' : 'Yeni Doğrudan Temin Dosyası'}
            </h1>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                isEdit
                  ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/40'
                  : 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/40'
              }`}
            >
              {isEdit ? 'Düzenleme Modu' : 'Oluşturma Modu'}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 hidden md:flex items-center gap-1 truncate mt-0.5">
            <span className="font-semibold text-slate-600 dark:text-slate-400">{dosyaTitle}</span>
            {isEdit && formData.konu && (
              <>
                <span>•</span>
                <span className="truncate max-w-[280px]">{formData.konu}</span>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Sağ: Sub-step nav + Kebab menü + Kaydet Butonu */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Sub-step ileri/geri — sadece Genel Bilgiler sekmesinde */}
        {activeTab === 'genel' && (
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-1 py-1">
            <button
              type="button"
              onClick={onPrevSubStep}
              disabled={activeSubStep === 1}
              className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
              title="Önceki Adım"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 px-1 tabular-nums">
              {activeSubStep}
              <span className="text-slate-400">/{subStepCount}</span>
            </span>
            <button
              type="button"
              onClick={onNextSubStep}
              className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 transition-all cursor-pointer"
              title={activeSubStep === subStepCount ? 'İhtiyaç Listesine Geç' : 'Sonraki Adım'}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}

        {/* ⋮ Daha Fazla Menüsü */}
        <div className="relative">
          <button
            ref={moreMenuBtnRef}
            type="button"
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            title="İşlemler ve Araçlar"
          >
            <MoreVertical size={16} />
          </button>

          {showMoreMenu && (
            <>
              {/* Backdrop */}
              <div className="fixed inset-0 z-[9998]" onClick={() => setShowMoreMenu(false)} />
              {/* Dropdown */}
              <div className="fixed right-4 top-[52px] w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-[9999] overflow-hidden flex flex-col py-1 animate-in fade-in zoom-in-95 duration-150">
                {!isEdit && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenKopyalaModal()
                      setShowMoreMenu(false)
                    }}
                    className="px-4 py-2.5 text-left text-xs font-bold text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 flex items-center gap-2 cursor-pointer"
                  >
                    <Copy size={13} className="text-amber-500" />
                    Mevcut Dosyalardan Kopyala
                  </button>
                )}

                <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

                <button
                  type="button"
                  onClick={() => {
                    setShowMoreMenu(false)
                    onAiFormValidation()
                  }}
                  className="px-4 py-2.5 text-left text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                >
                  <Bot size={13} className="text-teal-500" />
                  YZ — Hata ve Tutarsızlık Kontrolü
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMoreMenu(false)
                    onAiFullFormGenerate()
                  }}
                  className="px-4 py-2.5 text-left text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles size={13} className="text-indigo-500" />
                  YZ — Metinden Dosya Üret
                </button>

                <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

                <button
                  type="button"
                  onClick={() => {
                    onClearForm()
                    setShowMoreMenu(false)
                  }}
                  className="px-4 py-2.5 text-left text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                >
                  Formu Temizle
                </button>

                {import.meta.env.DEV && (
                  <button
                    type="button"
                    onClick={() => {
                      onFillMockData()
                      setShowMoreMenu(false)
                    }}
                    className="px-4 py-2.5 text-left text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 flex items-center gap-2 cursor-pointer"
                  >
                    Test Verisi Doldur
                  </button>
                )}

                <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

                <Link
                  to="/dosyalar"
                  className="px-4 py-2.5 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 cursor-pointer"
                >
                  İptal &amp; Listeye Dön
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Kaydet / Güncelle Butonu */}
        <button
          onClick={onSave}
          className={`px-4 py-2 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer ${
            isEdit
              ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/15'
              : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/15'
          }`}
        >
          <Save size={14} />
          {isEdit ? 'Değişiklikleri Güncelle' : 'Dosyayı Oluştur'}
        </button>
      </div>
    </div>
  )
}

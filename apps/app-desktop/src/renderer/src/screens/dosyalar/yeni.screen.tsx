import React, { useRef, useState } from 'react'
import {
  ArrowLeft,
  Bot,
  ChevronLeft,
  ChevronRight,
  Copy,
  FileText,
  HelpCircle,
  MoreVertical,
  Save,
  Sparkles
} from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { cn } from '../../utils/cn'
import { AIFormFillModal } from '../../components/ui/AIFormFillModal'
import { AITextGeneratorModal } from '../../components/ui/AITextGeneratorModal'
import { EskiDosyaKopyalaModal } from './components/EskiDosyaKopyalaModal'
import { GenelBilgilerTab } from './tabs/GenelBilgilerTab'
import { IhtiyacListesiTab } from './tabs/IhtiyacListesiTab'
import { useYeniDosyaScreen } from './yeni.hooks'
import { getEmptyFormData, getMockFormData } from './yeni.config'
import { formatDosyaNo } from '../../utils/formatDosyaNo'

export default function YeniDosyaScreen(): React.JSX.Element {
  const {
    dosyalar,
    donemTanimsizMi,
    isDescLoading,
    showKonuSuggestions,
    setShowKonuSuggestions,
    isEdit,
    editId,
    birimler,
    personeller,
    kodSozlugu,
    loadingDb,
    formData,
    setFormData,
    activeTab,
    setActiveTab,
    showKopyalaModal,
    setShowKopyalaModal,
    showBirimSearch,
    setShowBirimSearch,
    birimSearchQuery,
    setBirimSearchQuery,
    showPersonelSearch,
    setShowPersonelSearch,
    personelSearchQuery,
    setPersonelSearchQuery,
    filteredBirimler,
    filteredPersoneller,
    handleCopyKonuToAciklama,
    showAIModal,
    setShowAIModal,
    textGenConfig,
    setTextGenConfig,
    aiKalemConfig,
    setAiKalemConfig,
    openTextGenerator,
    getAIFormContext,
    handleAIApply,
    handleAiDescGenerate,
    handleAiFormValidation,
    handleAiFullFormGenerate,
    handleSelectBirim,
    handleSave,
    handleCopyDosya,
    matchedSuggestions,
    exactMatchCount,
    getNextTeminNo,
    validationError,
    setValidationError,
    kurum
  } = useYeniDosyaScreen()

  const [activeSubStep, setActiveSubStep] = useState(1)

  const SUB_STEP_COUNT = 4
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const [showMaliyetAyarlari, setShowMaliyetAyarlari] = useState(false)
  const moreMenuBtnRef = useRef<HTMLButtonElement>(null)

  const goPrevSubStep = () => setActiveSubStep((s) => Math.max(1, s - 1))
  const goNextSubStep = () => {
    if (activeSubStep < SUB_STEP_COUNT) {
      setActiveSubStep((s) => s + 1)
    } else {
      setValidationError(null)
      setActiveTab('ihtiyac')
    }
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* HEADER — kompakt */}
      <div className="flex-none px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3">
        {/* Sol: Geri + Başlık */}
        <div className="flex items-center gap-2 min-w-0">
          <Link
            to="/dosyalar"
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm shrink-0"
          >
            <ArrowLeft size={16} />
          </Link>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5 truncate">
              <FileText className="text-blue-600 shrink-0" size={16} />
              {isEdit ? 'Dosya Düzenle' : 'Yeni Doğrudan Temin'}
            </h1>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 hidden md:block">
              {isEdit ? formatDosyaNo({ ...formData, id: editId }) : (formData.temin_no ? formatDosyaNo(formData) : 'Yeni kayıt oluşturuluyor')}
            </p>
          </div>
        </div>

        {/* Sağ: Sub-step nav + Kebab menü + Kaydet */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Sub-step ileri/geri — sadece Genel Bilgiler tab'ında */}
          {activeTab === 'genel' && (
            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-1 py-1">
              <button
                type="button"
                onClick={goPrevSubStep}
                disabled={activeSubStep === 1}
                className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                title="Önceki adım"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 px-1 tabular-nums">
                {activeSubStep}
                <span className="text-slate-400">/4</span>
              </span>
              <button
                type="button"
                onClick={goNextSubStep}
                className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 transition-all cursor-pointer"
                title={activeSubStep === SUB_STEP_COUNT ? 'İhtiyaç Listesine Geç' : 'Sonraki adım'}
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
              title="Daha fazla"
            >
              <MoreVertical size={16} />
            </button>

            {showMoreMenu && (
              <>
                {/* Backdrop */}
                <div className="fixed inset-0 z-[9998]" onClick={() => setShowMoreMenu(false)} />
                {/* Dropdown */}
                <div className="fixed right-4 top-[52px] w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-[9999] overflow-hidden flex flex-col py-1">
                  {!isEdit && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowKopyalaModal(true)
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
                      handleAiFormValidation()
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
                      handleAiFullFormGenerate()
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
                      const y = new Date().getFullYear()
                      setFormData(getEmptyFormData(y, getNextTeminNo(y), birimler, personeller))
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
                        const y = new Date().getFullYear()
                        setFormData(getMockFormData(y, getNextTeminNo(y), birimler, personeller))
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
                    İptal
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Kaydet Butonu */}
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/10 flex items-center gap-1.5 cursor-pointer"
          >
            <Save size={14} />
            {isEdit ? 'Güncelle' : 'Kaydet'}
          </button>
        </div>
      </div>

      {/* Yaklaşık Maliyet Ayarları Paneli */}
      {showMaliyetAyarlari && (
        <>
          <div
            className="fixed inset-0 bg-black/25 dark:bg-black/50 z-[9998]"
            onClick={() => setShowMaliyetAyarlari(false)}
          />
          <div className="fixed right-4 top-[52px] w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-[9999] p-4 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                <svg
                  className="w-4 h-4 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
                Yaklaşık Maliyet Ayarları
              </h3>
              <button
                type="button"
                onClick={() => setShowMaliyetAyarlari(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
              >
                Kapat
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Yaklaşık Maliyet (₺)
                </label>
                <input
                  type="number"
                  value={formData.yaklasik_maliyet || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      yaklasik_maliyet: Number(e.target.value)
                    })
                  }
                  placeholder="0.00"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  KDV Durumu
                </label>
                <select
                  value={formData.yaklasik_maliyet_kdv_dahil_mi ?? 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      yaklasik_maliyet_kdv_dahil_mi: parseInt(e.target.value, 10)
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                >
                  <option value={0}>KDV Hariç</option>
                  <option value={1}>KDV Dahil</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Hesaplama Yöntemi
                </label>
                <select
                  value={formData.yaklasik_maliyet_hesaplamasi || 'kdv_haric'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      yaklasik_maliyet_hesaplamasi: e.target.value
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-850 dark:text-slate-200"
                >
                  <option value="kdv_haric">KDV Hariç Hesapla</option>
                  <option value="kdv_dahil">KDV Dahil Hesapla</option>
                </select>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* SOL PANEL: Dikey Stepper & Kısayollar */}
        <div className="w-64 flex-none border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex flex-col p-4 space-y-6 overflow-y-auto">
          <div>
            <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
              Dosya Süreci Adımları
            </h3>

            <div className="space-y-4">
              {/* Adım 1: Genel Bilgiler */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('genel')}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all text-left',
                    activeTab === 'genel'
                      ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  )}
                >
                  <span
                    className={cn(
                      'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors',
                      activeTab === 'genel'
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                    )}
                  >
                    1
                  </span>
                  Genel Bilgiler
                </button>

                {/* Genel Bilgiler Alt Adımları */}
                {activeTab === 'genel' && (
                  <div className="pl-8 space-y-1 border-l border-slate-200 dark:border-slate-800 ml-5.5">
                    {(
                      ['Genel & Antet', 'Mali & Bütçe', 'İhale & Teklif', 'Yetkililer'] as const
                    ).map((label, i) => {
                      const stepId = i + 1
                      const isDone = stepId < activeSubStep
                      const isActive = stepId === activeSubStep
                      return (
                        <button
                          key={stepId}
                          type="button"
                          onClick={() => setActiveSubStep(stepId)}
                          className={cn(
                            'w-full text-left py-1 px-2 rounded-lg text-[11px] font-semibold flex items-center justify-between transition-colors',
                            isActive
                              ? 'text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20'
                              : 'text-slate-550 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                          )}
                        >
                          <span>{label}</span>
                          {isDone && <span className="text-blue-500 text-[10px]">✓</span>}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Adım 2: İhtiyaç Listesi */}
              <button
                type="button"
                onClick={() => {
                  if (!formData.konu?.trim()) {
                    setValidationError('Lütfen önce dosya konusunu (İşin Adı) giriniz.')
                    return
                  }
                  setValidationError(null)
                  setActiveTab('ihtiyac')
                }}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all text-left',
                  activeTab === 'ihtiyac'
                    ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                )}
              >
                <span
                  className={cn(
                    'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors',
                    activeTab === 'ihtiyac'
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                  )}
                >
                  2
                </span>
                İhtiyaç Listesi
              </button>
            </div>
          </div>

          {/* Kısayol Menüleri / Bilgilendirme */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Hızlı Kısayollar
            </h4>
            <div className="bg-slate-50 dark:bg-slate-900/30 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60">
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Limit ve Mevzuat:
              </span>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                22/d limiti KDV hariç tutar üzerinden yıl bazlı sistem ayarlarından kontrol edilir.
              </p>
            </div>
          </div>
        </div>

        {/* SAĞ PANEL: Form Alanı */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-slate-50 dark:bg-slate-900/40">
          <form
            onSubmit={handleSave}
            className="max-w-[1600px] mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6"
          >
            {loadingDb ? (
              <div className="p-8 text-center text-sm text-slate-500 italic">
                Bilgiler yükleniyor...
              </div>
            ) : (
              <>
                {validationError && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-r-xl mb-6 shadow-sm flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <div className="bg-amber-100 dark:bg-amber-900/50 p-2 rounded-lg">
                        <HelpCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-amber-800 dark:text-amber-300">
                          Form Kontrol Uyarısı
                        </h3>
                        <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                          {validationError}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setValidationError(null)}
                      className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline px-2 py-1 cursor-pointer"
                    >
                      Kapat
                    </button>
                  </div>
                )}

                {donemTanimsizMi(formData.dosya_acilis_tarihi || undefined) && (
                  <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-xl mb-6 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="bg-red-100 dark:bg-red-900/50 p-2 rounded-lg">
                        <HelpCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-red-800 dark:text-red-300">
                          Kritik Hata: 22/d Limit Dönemi Bulunamadı!
                        </h3>
                        <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                          Sistemde, seçtiğiniz &quot;Dosya Açılış Tarihi&quot; (
                          {formData.dosya_acilis_tarihi}) ile eşleşen bir Doğrudan Temin Limit
                          Dönemi bulunamadı. Lütfen{' '}
                          <strong>Sistem Ayarları &gt; Mevzuat ve Parametreler</strong> bölümünden
                          ilgili tarihe ait limiti ekleyiniz. Limit olmadan bu dosyaya tahmini bedel
                          kontrolü yapılamaz.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'genel' && (
                  <GenelBilgilerTab
                    formData={formData}
                    setFormData={setFormData}
                    isEdit={isEdit}
                    editId={editId}
                    birimler={birimler}
                    kurum={kurum}
                    personeller={personeller}
                    kodSozlugu={kodSozlugu}
                    dosyalar={dosyalar}
                    getNextTeminNo={getNextTeminNo}
                    isDescLoading={isDescLoading}
                    showKonuSuggestions={showKonuSuggestions}
                    setShowKonuSuggestions={setShowKonuSuggestions}
                    exactMatchCount={exactMatchCount}
                    matchedSuggestions={matchedSuggestions}
                    handleAiDescGenerate={handleAiDescGenerate}
                    handleCopyKonuToAciklama={handleCopyKonuToAciklama}
                    openTextGenerator={openTextGenerator}
                    showBirimSearch={showBirimSearch}
                    setShowBirimSearch={setShowBirimSearch}
                    birimSearchQuery={birimSearchQuery}
                    setBirimSearchQuery={setBirimSearchQuery}
                    filteredBirimler={filteredBirimler}
                    handleSelectBirim={handleSelectBirim}
                    showPersonelSearch={showPersonelSearch}
                    setShowPersonelSearch={setShowPersonelSearch}
                    personelSearchQuery={personelSearchQuery}
                    setPersonelSearchQuery={setPersonelSearchQuery}
                    filteredPersoneller={filteredPersoneller}
                    onNextMainStep={() => {
                      if (!formData.konu?.trim()) {
                        setValidationError('Lütfen önce dosya konusunu (İşin Adı) giriniz.')
                        return
                      }
                      setValidationError(null)
                      setActiveTab('ihtiyac')
                    }}
                    activeSubStep={activeSubStep}
                    setActiveSubStep={setActiveSubStep}
                  />
                )}

                {/* TAB 2: İHTİYAÇ LİSTESİ */}
                {activeTab === 'ihtiyac' && (
                  <IhtiyacListesiTab
                    formData={formData}
                    setFormData={setFormData}
                    isEdit={isEdit}
                    editId={editId}
                    birimler={birimler}
                    personeller={personeller}
                    kodSozlugu={kodSozlugu}
                    dosyalar={dosyalar}
                    getNextTeminNo={getNextTeminNo}
                  />
                )}
              </>
            )}
            {/* TAB CONTINUATION ACTION BUTTONS */}
            <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-5 mt-6">
              <div className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold uppercase tracking-wider">
                {isEdit ? formatDosyaNo({ ...formData, id: editId }) : (formData.temin_no ? formatDosyaNo(formData) : 'Yeni Kayıt Yapılıyor')}
              </div>

              <div className="flex gap-3">
                {activeTab === 'ihtiyac' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setActiveTab('genel')}
                      className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-transparent rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      Geri Git
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/25 flex items-center gap-2 cursor-pointer"
                    >
                      <Save size={16} />
                      {isEdit ? 'Değişiklikleri Kaydet' : 'Dosyayı Oluştur'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* AI Form Fill Modal */}
        <AIFormFillModal
          isOpen={showAIModal}
          onClose={() => setShowAIModal(false)}
          context={getAIFormContext()}
          onApply={handleAIApply}
        />

        {/* AI Text Generator Modal */}
        <AITextGeneratorModal
          isOpen={textGenConfig.isOpen}
          onClose={() => setTextGenConfig((prev) => ({ ...prev, isOpen: false }))}
          title={textGenConfig.title}
          fieldName={textGenConfig.fieldName}
          initialSubject={formData.konu}
          systemInstruction={textGenConfig.systemInstruction}
          placeholderMappings={{
            '[DOSYA_KONU]': formData.konu || 'Belirtilmemiş',
            '[DOSYA_NO]': formData.temin_no || 'Belirtilmemiş',
            '[DOSYA_MALIYET]': formData.yaklasik_maliyet
              ? String(formData.yaklasik_maliyet)
              : 'Belirtilmemiş'
          }}
          onApply={(text) => {
            setFormData((prev) => ({
              ...prev,
              [textGenConfig.targetField]: text
            }))
          }}
        />

        {/* AI Kalem Asistanı Modal */}
        <AITextGeneratorModal
          isOpen={aiKalemConfig.isOpen}
          onClose={() => setAiKalemConfig({ isOpen: false })}
          title="Yapay Zeka ile Kalem Tanımlama"
          fieldName="Kalem (OKAS ve Ortak Alımlar Sözlüğü)"
          initialSubject={formData.konu}
          mode="json"
          expectedJsonFormat={
            '{ "kalemAdi": "Örn: A4 Fotokopi Kağıdı 80gr", "miktari": 50, "birimi": "Paket", "okasKodu": "Örn: 30197630-1" }'
          }
          systemInstruction={`Sen bir kamu ihale ve doğrudan temin uzmanısın. Kullanıcı bir mal, hizmet veya yapım işi için listeye kalem eklemek istiyor. 
Kullanıcının girdiği genel tanıma ve alımın konusuna ([DOSYA_KONU]) bakarak:
1. En uygun, resmi, şartnameye uygun 'Kalem Adı'nı belirle.
2. Bu kalem için EKAP sisteminde kullanılan en uygun 'OKAS Kodunu' (Ortak Alımlar Sözlüğü CPV kodu) veya Taşınır/Taşınmaz mal kodunu bul. Bulamazsan uygun bir üst kategori OKAS kodu tahmin et.
3. Uygun miktar ve ölçü birimi (Adet, Paket, Kg, Ton, Ay, Gün, m2 vb.) öner.
Yanıtını SADECE JSON formatında ver.`}
          placeholderMappings={{
            '[DOSYA_KONU]': formData.konu || formData.tur || 'Belirtilmemiş'
          }}
          onApply={(data) => {
            console.log('AI Kalem Verisi:', data)
            alert(
              `Yapay Zeka şu kalemi buldu:\n\nAdı: ${data.kalemAdi}\nOKAS Kodu: ${data.okasKodu}\nMiktar: ${data.miktari} ${data.birimi}\n\nNot: Kalem listesi altyapısı tamamlandığında bu kalem otomatik olarak listeye eklenecektir.`
            )
          }}
        />

        {/* Eski Dosya Kopyala Modal */}
        <EskiDosyaKopyalaModal
          isOpen={showKopyalaModal}
          onClose={() => setShowKopyalaModal(false)}
          dosyalar={dosyalar}
          onSelect={handleCopyDosya}
        />
      </div>
    </div>
  )
}

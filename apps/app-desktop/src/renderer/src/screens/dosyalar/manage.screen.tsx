import React, { useState } from 'react'
import { GenelBilgilerTab } from './tabs/GenelBilgilerTab'
import { IhtiyacListesiTab } from './tabs/IhtiyacListesiTab'
import { useYeniDosyaScreen } from './yeni.hooks'
import { getEmptyFormData, getMockFormData } from './yeni.config'
import {
  DosyaManageHeader,
  DosyaManageStepper,
  DosyaManageMaliyetModal,
  DosyaManageAlerts,
  DosyaManageFooter,
  DosyaManageModals
} from './components/manage'

const SUB_STEP_COUNT = 4

/**
 * DosyaManageScreen
 * Doğrudan Temin dosyalarının hem "Yeni Oluşturma" (Create) hem de
 * "Düzenleme / Güncelleme" (Edit / Manage) işlemlerini yöneten ana form ekranıdır.
 */
export function DosyaManageScreen(): React.JSX.Element {
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
  const [showMaliyetAyarlari, setShowMaliyetAyarlari] = useState(false)

  const goPrevSubStep = () => setActiveSubStep((s) => Math.max(1, s - 1))
  const goNextSubStep = () => {
    if (activeSubStep < SUB_STEP_COUNT) {
      setActiveSubStep((s) => s + 1)
    } else {
      setValidationError(null)
      setActiveTab('ihtiyac')
    }
  }

  const handleSelectIhtiyacTab = () => {
    if (!formData.konu?.trim()) {
      setValidationError('Lütfen önce dosya konusunu (İşin Adı) giriniz.')
      return
    }
    setValidationError(null)
    setActiveTab('ihtiyac')
  }

  const handleClearForm = () => {
    const y = new Date().getFullYear()
    setFormData(getEmptyFormData(y, getNextTeminNo(y), birimler, personeller))
  }

  const handleFillMockData = () => {
    const y = new Date().getFullYear()
    setFormData(getMockFormData(y, getNextTeminNo(y), birimler, personeller))
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* HEADER BİLEŞENİ */}
      <DosyaManageHeader
        isEdit={isEdit}
        editId={editId}
        formData={formData}
        activeTab={activeTab}
        activeSubStep={activeSubStep}
        subStepCount={SUB_STEP_COUNT}
        onPrevSubStep={goPrevSubStep}
        onNextSubStep={goNextSubStep}
        onOpenKopyalaModal={() => setShowKopyalaModal(true)}
        onAiFormValidation={handleAiFormValidation}
        onAiFullFormGenerate={handleAiFullFormGenerate}
        onClearForm={handleClearForm}
        onFillMockData={handleFillMockData}
        onSave={handleSave}
      />

      {/* YAKLAŞIK MALİYET POPUP/MODAL */}
      <DosyaManageMaliyetModal
        isOpen={showMaliyetAyarlari}
        onClose={() => setShowMaliyetAyarlari(false)}
        formData={formData}
        setFormData={setFormData}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* SOL PANEL: DİKEY STEPPER & KISAYOLLAR */}
        <DosyaManageStepper
          isEdit={isEdit}
          formData={formData}
          editId={editId}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeSubStep={activeSubStep}
          setActiveSubStep={setActiveSubStep}
          onSelectIhtiyacTab={handleSelectIhtiyacTab}
        />

        {/* SAĞ PANEL: FORM ALANI */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-slate-50 dark:bg-slate-900/40">
          <form
            onSubmit={handleSave}
            className="max-w-[1600px] mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6"
          >
            {loadingDb ? (
              <div className="p-8 text-center text-sm text-slate-500 italic">
                Bilgiler yükleniyor...
              </div>
            ) : (
              <>
                {/* UYARI VE LİMİT MESAJLARI */}
                <DosyaManageAlerts
                  validationError={validationError}
                  onClearValidationError={() => setValidationError(null)}
                  isDonemTanimsiz={donemTanimsizMi(formData.dosya_acilis_tarihi || undefined)}
                  dosyaAcilisTarihi={formData.dosya_acilis_tarihi}
                />

                {/* SEKME 1: GENEL BİLGİLER */}
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
                    onNextMainStep={handleSelectIhtiyacTab}
                    activeSubStep={activeSubStep}
                    setActiveSubStep={setActiveSubStep}
                  />
                )}

                {/* SEKME 2: İHTİYAÇ LİSTESİ */}
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

            {/* ALT BUTONLAR VE İŞLEMLER */}
            <DosyaManageFooter
              activeTab={activeTab}
              isEdit={isEdit}
              editId={editId}
              formData={formData}
              onGoBack={() => setActiveTab('genel')}
              onSave={handleSave}
            />
          </form>
        </div>

        {/* MODAL VE DİYALOGLAR */}
        <DosyaManageModals
          showAIModal={showAIModal}
          setShowAIModal={setShowAIModal}
          getAIFormContext={getAIFormContext}
          handleAIApply={handleAIApply}
          textGenConfig={textGenConfig}
          setTextGenConfig={setTextGenConfig}
          formData={formData}
          setFormData={setFormData}
          aiKalemConfig={aiKalemConfig}
          setAiKalemConfig={setAiKalemConfig}
          showKopyalaModal={showKopyalaModal}
          setShowKopyalaModal={setShowKopyalaModal}
          dosyalar={dosyalar}
          handleCopyDosya={handleCopyDosya}
        />
      </div>
    </div>
  )
}

export default DosyaManageScreen

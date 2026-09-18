import React from "react";
import {
  PiyasaFiyatArastirmasiDashboardProps,
  PiyasaFiyatStepper,
  Step1IsteklilerVeDagitim,
  Step2FiyatlarVeKazanan,
  Step3TutanakVeMaliyet,
  usePiyasaFiyatArastirmasiDashboard,
} from "./PiyasaFiyatArastirmasi";

export type { PiyasaFiyatArastirmasiDashboardProps };

export function PiyasaFiyatArastirmasiDashboard(
  props: PiyasaFiyatArastirmasiDashboardProps,
): React.JSX.Element {
  const {
    currentStep,
    setCurrentStep,
    handleOpenSablonByDosyaAdi,
    handleOpenEkapSorgu,
    mappedBelgeler,
    handleOpenBelgePreview,
    handleOpenExternalForBelge,
    handleQuickPrintForBelge,
    firmaColumns,
    formattedFirms,
    activeWinnerFirma,
    lowestBidFirm,
    isStep1Done,
    isStep2Done,
    isStep3Done,
  } = usePiyasaFiyatArastirmasiDashboard(props);

  const {
    setIsFormOpen,
    handleNewDocument,
    docViewMode,
    changeDocViewMode,
    invitedFirms,
    handleAddSingleFirm,
    handleCreateNewFirm,
    handleRemoveFirm,
    items,
    bids,
    setActiveFormTab,
    handleDeleteDocument,
    manualWinnerFirmaId,
    handleSetWinnerFirma,
  } = props;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* STEPPER */}
      <PiyasaFiyatStepper
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        isStep1Done={isStep1Done}
        isStep2Done={isStep2Done}
        isStep3Done={isStep3Done}
        invitedFirmsCount={invitedFirms?.length || 0}
        activeWinnerFirma={activeWinnerFirma}
        mappedBelgelerCount={mappedBelgeler.length}
      />

      {/* ADIM 1 */}
      {currentStep === 1 && (
        <Step1IsteklilerVeDagitim
          formattedFirms={formattedFirms}
          firmaColumns={firmaColumns}
          manualWinnerFirmaId={manualWinnerFirmaId}
          handleSetWinnerFirma={handleSetWinnerFirma}
          handleCreateNewFirm={handleCreateNewFirm}
          setCurrentStep={setCurrentStep}
          setIsFormOpen={setIsFormOpen}
          setActiveFormTab={setActiveFormTab}
          handleOpenSablonByDosyaAdi={handleOpenSablonByDosyaAdi}
          handleOpenEkapSorgu={handleOpenEkapSorgu}
          handleAddSingleFirm={handleAddSingleFirm}
          handleRemoveFirm={handleRemoveFirm}
        />
      )}

      {/* ADIM 2 */}
      {currentStep === 2 && (
        <Step2FiyatlarVeKazanan
          activeWinnerFirma={activeWinnerFirma}
          lowestBidFirm={lowestBidFirm}
          invitedFirms={invitedFirms}
          items={items}
          bids={bids}
          manualWinnerFirmaId={manualWinnerFirmaId}
          handleSetWinnerFirma={handleSetWinnerFirma}
          setIsFormOpen={setIsFormOpen}
          setActiveFormTab={setActiveFormTab}
          setCurrentStep={setCurrentStep}
        />
      )}

      {/* ADIM 3 */}
      {currentStep === 3 && (
        <Step3TutanakVeMaliyet
          mappedBelgeler={mappedBelgeler}
          docViewMode={docViewMode}
          changeDocViewMode={changeDocViewMode}
          handleOpenSablonByDosyaAdi={handleOpenSablonByDosyaAdi}
          handleNewDocument={handleNewDocument}
          handleOpenBelgePreview={handleOpenBelgePreview}
          handleOpenExternalForBelge={handleOpenExternalForBelge}
          handleQuickPrintForBelge={handleQuickPrintForBelge}
          handleDeleteDocument={handleDeleteDocument}
          setCurrentStep={setCurrentStep}
          setIsFormOpen={setIsFormOpen}
          setActiveFormTab={setActiveFormTab}
        />
      )}
    </div>
  );
}

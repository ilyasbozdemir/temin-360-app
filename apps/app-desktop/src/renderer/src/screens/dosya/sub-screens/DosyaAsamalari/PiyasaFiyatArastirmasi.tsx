import React, { useState } from "react";
import { PackageSearch } from "lucide-react";
import { SubScreen } from "../../SubScreens.screen";
import { isV2Template, normalizeForMatch } from "./useDosyaAsamasiSablons";
import { FirmaSecmeModali } from "./components/FirmaSecmeModali";
import { PiyasaFiyatArastirmasiDashboard } from "./components/PiyasaFiyatArastirmasiDashboard";
import { PiyasaFiyatArastirmasiForm } from "./components/PiyasaFiyatArastirmasiForm";
import { usePiyasaFiyatArastirmasiLogic } from "./hooks/usePiyasaFiyatArastirmasi";
import { useSettingsStore } from "../../../../store/settingsStore";
import { useWorkspaceStore } from "../../../../store/workspaceStore";

export function PiyasaFiyatArastirmasi(): React.JSX.Element {
  const { activeDosyaId } = useWorkspaceStore();
  const logic = usePiyasaFiyatArastirmasiLogic();
  const {
    sablonsContext: {
      masterHtml,
      dosyaContext,
      placeholders,
      personelListesi,
      previewModalOpen,
      setPreviewModalOpen,
      previewData,
      executePrint,
      executeExportPdf,
      executeExportDocx,
      executeExportUdf,
      quickPrint,
      quickExport,
      quickOpenExternal,
      toggleStar,
      refreshSnapshot,
      saveSnapshot,
      activeStarredDocs,
      contextsByPath,
      handleOpenPreviewForSablon,
      sablons,
      ciktiLoading,
      isSablonDisabled,
    },
    invitedFirms,
    allPoolFirms,
    isFormOpen,
    setIsFormOpen,
    items,
    bids,
    hesaplamaEsasi,
    isFirmModalOpen,
    setIsFirmModalOpen,
    selectedFirmIds,
    setSelectedFirmIds,
    modalSearchQuery,
    setModalSearchQuery,
    handleBulkAddFirms,
    handleAddSingleFirm,
    handleRemoveFirm,
    handlePriceChange,
    getLowestBidInfo,
    getAverageBid,
    getEstimatedCostTotal,
    handleSaveToDosya,
    handleNewDocument,
    lowestTotalFirmaId,
    isEditingFirms,
    setIsEditingFirms,
    setMaliyetCetveliTarihi,
    tutanakTarihi,
    setTutanakTarihi,
    savedDocuments,
    stageSablons,
    formMode,
    setFormMode,
    syncTutanak,
    setSyncTutanak,
    setLowestFirmAsWinner,
    setSetLowestFirmAsWinner,
    manualWinnerFirmaId,
    setManualWinnerFirmaId,
    maliyetCetveliTarihi,
    belgeleriKaydet,
    setBelgeleriKaydet,
    handleUpdateDocumentDate,
    handleDeleteDocument,
    handleSetWinnerFirma,
  } = logic;

  const [activeFormTab, setActiveFormTab] = useState<"firms" | "matrix">(() => {
    return invitedFirms.length > 0 ? "matrix" : "firms";
  });
  const [activeActionDropdown, setActiveActionDropdown] = useState<
    string | null
  >(null);
  const [isFormFullscreen, setIsFormFullscreen] = useState<boolean>(false);
  const [dashboardViewMode, setDashboardViewMode] = useState<
    "documents" | "prices"
  >("documents");
  const [docViewMode, setDocViewMode] = useState<"grid" | "list" | "table">(
    () => {
      try {
        return (localStorage.getItem("dta_doc_view_mode") as any) || "grid";
      } catch {
        return "grid";
      }
    },
  );

  const changeDocViewMode = (mode: "grid" | "list" | "table") => {
    setDocViewMode(mode);
    try {
      localStorage.setItem("dta_doc_view_mode", mode);
    } catch (e) {
      console.error(e);
    }
  };

  const stageDocs = savedDocuments;
  const { disableDocumentGuidance } = useSettingsStore();

  const isStarred = previewData?.title
    ? activeStarredDocs.some(
      (d) =>
        normalizeForMatch(d) === normalizeForMatch(previewData.title || ""),
    )
    : false;

  const isV2 = isV2Template(previewData?.dosyaAdi);

  return (
    <SubScreen
      title="Teklifler & Piyasa Fiyat Araştırması"
      icon={PackageSearch}
      description="Tedarikçi teklif mektupları hazırlayabilir, toplanan teklifleri fiyat araştırma tablosuna girerek en uygun teklifleri ve yaklaşık maliyeti belirleyebilirsiniz."
      previewDocumentId={previewModalOpen && previewData?.dosyaAdi
        ? previewData.dosyaAdi
        : null}
      invitedFirms={logic.invitedFirms}
      onClosePreview={() => setPreviewModalOpen(false)}
    >
      {!isFormOpen
        ? (
          <PiyasaFiyatArastirmasiDashboard
            setIsFormOpen={setIsFormOpen}
            handleNewDocument={handleNewDocument}
            setActiveFormTab={setActiveFormTab}
            dashboardViewMode={dashboardViewMode}
            setDashboardViewMode={setDashboardViewMode}
            docViewMode={docViewMode}
            changeDocViewMode={changeDocViewMode}
            activeActionDropdown={activeActionDropdown}
            setActiveActionDropdown={setActiveActionDropdown}
            stageDocs={stageDocs}
            stageSablons={stageSablons}
            disableDocumentGuidance={disableDocumentGuidance}
            invitedFirms={invitedFirms}
            allPoolFirms={allPoolFirms}
            handleAddSingleFirm={handleAddSingleFirm}
            handleCreateNewFirm={logic.handleCreateNewFirm}
            handleRemoveFirm={handleRemoveFirm}
            items={items}
            bids={bids}
            sablons={sablons}
            activeStarredDocs={activeStarredDocs}
            ciktiLoading={ciktiLoading}
            handleOpenPreviewForSablon={handleOpenPreviewForSablon}
            quickPrint={quickPrint}
            quickExport={quickExport}
            quickOpenExternal={quickOpenExternal}
            isSablonDisabled={isSablonDisabled}
            handleUpdateDocumentDate={handleUpdateDocumentDate}
            handleDeleteDocument={handleDeleteDocument}
            setIsFirmModalOpen={setIsFirmModalOpen}
            handleSaveToDosya={handleSaveToDosya}
            getEstimatedCostTotal={getEstimatedCostTotal}
            manualWinnerFirmaId={manualWinnerFirmaId}
            handleSetWinnerFirma={handleSetWinnerFirma}
            lowestTotalFirmaId={lowestTotalFirmaId}
          />
        )
        : (
          <PiyasaFiyatArastirmasiForm
            formMode={formMode}
            setIsFormOpen={setIsFormOpen}
            activeFormTab={activeFormTab}
            setActiveFormTab={setActiveFormTab}
            hesaplamaEsasi={hesaplamaEsasi}
            invitedFirms={invitedFirms}
            items={items}
            bids={bids}
            getEstimatedCostTotal={getEstimatedCostTotal}
            handleSaveToDosya={handleSaveToDosya}
            maliyetCetveliTarihi={maliyetCetveliTarihi}
            setMaliyetCetveliTarihi={setMaliyetCetveliTarihi}
            tutanakTarihi={tutanakTarihi}
            setTutanakTarihi={setTutanakTarihi}
            syncTutanak={syncTutanak}
            setSyncTutanak={setSyncTutanak}
            setLowestFirmAsWinner={setLowestFirmAsWinner}
            setSetLowestFirmAsWinner={setSetLowestFirmAsWinner}
            manualWinnerFirmaId={manualWinnerFirmaId}
            setManualWinnerFirmaId={setManualWinnerFirmaId}
            belgeleriKaydet={belgeleriKaydet}
            setBelgeleriKaydet={setBelgeleriKaydet}
            isEditingFirms={isEditingFirms}
            setIsEditingFirms={setIsEditingFirms}
            setIsFirmModalOpen={setIsFirmModalOpen}
            lowestTotalFirmaId={lowestTotalFirmaId}
            handleRemoveFirm={handleRemoveFirm}
            getLowestBidInfo={getLowestBidInfo}
            getAverageBid={getAverageBid}
            handlePriceChange={handlePriceChange}
            isFormFullscreen={isFormFullscreen}
          />
        )}

      {/* İSTEKLİ FİRMALARDAN SEÇ MODALI */}
      <FirmaSecmeModali
        isOpen={isFirmModalOpen}
        onClose={() => setIsFirmModalOpen(false)}
        allPoolFirms={allPoolFirms}
        invitedFirms={invitedFirms}
        selectedFirmIds={selectedFirmIds}
        setSelectedFirmIds={setSelectedFirmIds}
        modalSearchQuery={modalSearchQuery}
        setModalSearchQuery={setModalSearchQuery}
        onAddFirms={handleBulkAddFirms}
      />
    </SubScreen>
  );
}

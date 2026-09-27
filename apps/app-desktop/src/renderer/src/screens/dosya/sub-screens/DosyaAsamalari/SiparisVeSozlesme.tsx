import React from "react";
import { FileCheck } from "lucide-react";
import { SubScreen } from "../../SubScreens.screen";
import { useDosyaAsamasiSablons } from "./useDosyaAsamasiSablons";
import {
  SiparisGuardWarning,
  SiparisKazananFirmaCard,
  SiparisVeSozlesmeAccordion,
  useSiparisDocumentOpener,
  useSiparisVeSozlesmeData,
} from "./components/SiparisVeSozlesme";

export function SiparisVeSozlesme(): React.JSX.Element {
  const {
    sablons,
    previewModalOpen,
    setPreviewModalOpen,
    previewData,
    handleOpenPreviewForSablon,
  } = useDosyaAsamasiSablons();

  const stageSablons = sablons.filter(
    (s) =>
      s.kategori === "3-siparis-ve-sozlesme" ||
      s.kategori === "3. Sipariş & Sözleşme",
  );

  const {
    activeDosyaId,
    kazananFirmaId,
    kazananFirmaUnvan,
    firmaStats,
    islemlerData,
    sonucOnayEkler,
    savedFeedback,
    formatCurrency,
    handleUpdateTeslimGunu,
    handleUpdateTeslimTarihi,
    handleToggleSozlesme,
    handleUpdateEkler,
  } = useSiparisVeSozlesmeData();

  const docOpener = useSiparisDocumentOpener({
    stageSablons,
    activeDosyaId,
    sonucOnayEkler,
    islemlerData,
    handleOpenPreviewForSablon,
  });

  return (
    <SubScreen
      title="Yüklenici & Sipariş İşlemleri"
      icon={FileCheck}
      description="Doğrudan temin sonuç onay belgesi, sipariş formu, kabul mektubu ve sözleşme süreçlerinizi bu panelden yönetebilirsiniz."
      previewDocumentId={
        previewModalOpen && previewData?.dosyaAdi ? previewData.dosyaAdi : null
      }
      onClosePreview={() => setPreviewModalOpen(false)}
    >
      {/* Yükleniyor durumu */}
      {kazananFirmaId === undefined && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="ml-3 text-sm text-slate-500">
            Kontrol ediliyor...
          </span>
        </div>
      )}

      {/* Kazanan firma YOK → Guard uyarısı */}
      {kazananFirmaId === null && <SiparisGuardWarning />}

      {/* Kazanan firma VAR → Normal içerik */}
      {kazananFirmaId && (
        <div className="flex flex-col gap-4 animate-in fade-in duration-300">
          {/* ═══ Kazanan Firma Bilgi Kartı ═══ */}
          <SiparisKazananFirmaCard
            kazananFirmaUnvan={kazananFirmaUnvan}
            firmaStats={firmaStats}
            islemlerData={islemlerData}
            formatCurrency={formatCurrency}
            onPrintResultApproval={docOpener.handleOpenSonucOnay}
            onPrintAcceptanceLetter={docOpener.handleOpenKabulMektubu}
            onPrintOrderForm={docOpener.handleOpenSiparisFormu}
            onPrintContractInvitation={docOpener.handleOpenDavetMektubu}
            onPrintContract={docOpener.handleOpenStandartSozlesme}
            onPrintContractAlternative={docOpener.handleOpenAlternatifSozlesme}
            onPrintContractLong={docOpener.handleOpenUzunFormSozlesme}
          />

          {/* ═══ Akordeon Adımları ═══ */}
          <SiparisVeSozlesmeAccordion
            kazananFirmaUnvan={kazananFirmaUnvan}
            firmaStats={firmaStats}
            islemlerData={islemlerData}
            sonucOnayEkler={sonucOnayEkler}
            savedFeedback={savedFeedback}
            formatCurrency={formatCurrency}
            handleUpdateTeslimGunu={handleUpdateTeslimGunu}
            handleUpdateTeslimTarihi={handleUpdateTeslimTarihi}
            handleToggleSozlesme={handleToggleSozlesme}
            handleUpdateEkler={handleUpdateEkler}
            handleOpenSonucOnay={docOpener.handleOpenSonucOnay}
            handleOpenButceSorgusu={docOpener.handleOpenButceSorgusu}
            handleOpenKabulMektubu={docOpener.handleOpenKabulMektubu}
            handleOpenDavetMektubu={docOpener.handleOpenDavetMektubu}
            handleOpenStandartSozlesme={docOpener.handleOpenStandartSozlesme}
            handleOpenAlternatifSozlesme={docOpener.handleOpenAlternatifSozlesme}
            handleOpenUzunFormSozlesme={docOpener.handleOpenUzunFormSozlesme}
          />
        </div>
      )}
    </SubScreen>
  );
}

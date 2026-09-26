import React, { useEffect, useState } from "react";
import { FileCheck } from "lucide-react";
import { SubScreen } from "../../SubScreens.screen";
import {
  normalizeForMatch,
  useDosyaAsamasiSablons,
} from "./useDosyaAsamasiSablons";
import { useSettingsStore } from "../../../../store/settingsStore";
import { useWorkspaceStore } from "../../../../store/workspaceStore";
import { useGlobalDocumentPreviewStore } from "../../../../store/globalDocumentPreviewStore";
import { documentPreloadService } from "../../../../services/documentPreloadService";
import {
  StepId,
  FirmaStats,
  IslemlerData,
  SiparisKazananFirmaCard,
  SiparisStepperTabs,
  Step1TeslimatVeSurec,
  Step2SonucOnay,
  Step3Yasaklilik,
  Step4KabulVeSiparis,
  Step5SozlesmeVeDavet,
  StepTimelineAll,
  SiparisStepperNav,
  SiparisGuardWarning,
} from "./components/SiparisVeSozlesme";

export function SiparisVeSozlesme(): React.JSX.Element {
  const {
    activeStarredDocs,
    sablons,
    ciktiLoading,
    previewModalOpen,
    setPreviewModalOpen,
    previewData,
    handleOpenPreviewForSablon,
    quickPrint,
    quickExport,
    quickOpenExternal,
    isSablonDisabled,
  } = useDosyaAsamasiSablons();

  const { disableDocumentGuidance } = useSettingsStore();
  const { activeDosyaId } = useWorkspaceStore();

  const stageSablons = sablons.filter(
    (s) =>
      s.kategori === "3-siparis-ve-sozlesme" ||
      s.kategori === "3. Sipariş & Sözleşme",
  );

  // Kazanan firma guard state
  const [kazananFirmaId, setKazananFirmaId] = useState<
    number | null | undefined
  >(undefined); // undefined = yükleniyor
  const [kazananFirmaUnvan, setKazananFirmaUnvan] = useState<string>("");

  // İstatistik verileri
  const [firmaStats, setFirmaStats] = useState<FirmaStats>({
    teklifToplami: null,
    yaklasikMaliyet: null,
    teslimTarihi: null,
    yasaklilikDurumu: null,
    vergiNo: null,
    teklifSozlesmeTuru: null,
    sozlesmeYapilacakMi: 0,
    istekliFirmaSayisi: 0,
  });

  const [islemlerData, setIslemlerData] = useState<IslemlerData>({
    sozlesmeYapilacakMi: false,
    siparisFormuGerekli: true,
    teslimGunu: 10,
    teslimTarihi: "",
    teklifSozlesmeTuru: "Mal Alımı",
  });

  const [activeStep, setActiveStep] = useState<StepId>("teslimat");
  const [savedFeedback, setSavedFeedback] = useState(false);

  useEffect(() => {
    if (!activeDosyaId) return;

    const checkKazananFirma = async (): Promise<void> => {
      try {
        // Ana dosya + firma bilgisi
        const res = await window.electron.ipcRenderer.invoke(
          "db:query",
          `SELECT d.firma_id, f.unvan, f.vergi_no,
                  d.yaklasik_maliyet, d.teslim_tarihi, d.teslim_gun,
                  d.teklif_sozlesme_turu, d.sozlesme_yapilacak_mi
           FROM DATA_TeminDosyasi d
           LEFT JOIN TANIM_Firma f ON d.firma_id = f.id
           WHERE d.id = ?`,
          [activeDosyaId],
        );

        if (res.success && res.data && res.data.length > 0) {
          const row = res.data[0];
          let effectiveFirmaId = row.firma_id || null;
          let effectiveUnvan = row.unvan || "";
          let effectiveVergiNo = row.vergi_no || null;

          // Fiyatlar girilmişse ve henüz manuel kazanan seçilmemişse, en düşük teklif veren firmayı otomatik kazanan yap
          if (!effectiveFirmaId) {
            const autoLowestRes = await window.electron.ipcRenderer.invoke(
              "db:query",
              `SELECT tf.firma_id, f.unvan, f.vergi_no, tf.teklif_toplami, tf.yasaklilik_durumu
               FROM DATA_TeminFirma tf
               JOIN TANIM_Firma f ON tf.firma_id = f.id
               WHERE tf.temin_dosya_id = ? AND tf.teklif_toplami > 0
               ORDER BY tf.teklif_toplami ASC LIMIT 1`,
              [activeDosyaId],
            );
            if (autoLowestRes.success && autoLowestRes.data?.length > 0) {
              const lowest = autoLowestRes.data[0];
              effectiveFirmaId = lowest.firma_id;
              effectiveUnvan = lowest.unvan;
              effectiveVergiNo = lowest.vergi_no;
              await window.electron.ipcRenderer.invoke(
                "db:run",
                "UPDATE DATA_TeminDosyasi SET firma_id = ? WHERE id = ?",
                [lowest.firma_id, activeDosyaId],
              );
            }
          }

          setKazananFirmaId(effectiveFirmaId);
          setKazananFirmaUnvan(effectiveUnvan);

          // Kazanan firmanın teklif toplamı ve yasaklılık durumu
          let teklifToplami: number | null = null;
          let yasaklilikDurumu: string | null = null;
          if (effectiveFirmaId) {
            const teklifRes = await window.electron.ipcRenderer.invoke(
              "db:query",
              `SELECT tf.teklif_toplami, tf.yasaklilik_durumu
               FROM DATA_TeminFirma tf
               WHERE tf.temin_dosya_id = ? AND tf.firma_id = ?`,
              [activeDosyaId, effectiveFirmaId],
            );
            if (teklifRes.success && teklifRes.data?.length > 0) {
              teklifToplami = teklifRes.data[0].teklif_toplami;
              yasaklilikDurumu = teklifRes.data[0].yasaklilik_durumu;
            }
          }

          // İstekli firma sayısı
          const firmCountRes = await window.electron.ipcRenderer.invoke(
            "db:query",
            `SELECT COUNT(*) as cnt FROM DATA_TeminFirma WHERE temin_dosya_id = ?`,
            [activeDosyaId],
          );
          const istekliFirmaSayisi =
            firmCountRes.success && firmCountRes.data?.length > 0
              ? firmCountRes.data[0].cnt
              : 0;

          // Gün sayısı hesaplama (eğer teslim günü veya tarihi varsa)
          let calculatedDays =
            row.teslim_gun !== undefined && row.teslim_gun !== null &&
              Number(row.teslim_gun) > 0
              ? Number(row.teslim_gun)
              : 10;
          if (
            (row.teslim_gun === undefined || row.teslim_gun === null) &&
            row.teslim_tarihi
          ) {
            const tDate = new Date(row.teslim_tarihi);
            const today = new Date();
            const diffTime = tDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays > 0 && diffDays < 365) {
              calculatedDays = diffDays;
            }
          }

          setFirmaStats({
            teklifToplami,
            yaklasikMaliyet: row.yaklasik_maliyet || null,
            teslimTarihi: row.teslim_tarihi || null,
            yasaklilikDurumu,
            vergiNo: effectiveVergiNo || row.vergi_no || null,
            teklifSozlesmeTuru: row.teklif_sozlesme_turu || "Mal Alımı",
            sozlesmeYapilacakMi: row.sozlesme_yapilacak_mi || 0,
            istekliFirmaSayisi,
          });

          setIslemlerData({
            sozlesmeYapilacakMi: row.sozlesme_yapilacak_mi === 1,
            siparisFormuGerekli: true,
            teslimGunu: calculatedDays,
            teslimTarihi: row.teslim_tarihi || "",
            teklifSozlesmeTuru: row.teklif_sozlesme_turu || "Mal Alımı",
          });
        } else {
          setKazananFirmaId(null);
        }
      } catch {
        setKazananFirmaId(null);
      }
    };

    checkKazananFirma();
  }, [activeDosyaId]);

  const formatCurrency = (val: number | null): string => {
    if (val === null || val === undefined) return "—";
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 2,
    }).format(val);
  };

  // Teslim gününü ve tarihini otomatik güncelleme
  const handleUpdateTeslimGunu = async (gun: number): Promise<void> => {
    if (!activeDosyaId) return;
    const d = new Date();
    d.setDate(d.getDate() + gun);
    const dateStr = d.toISOString().split("T")[0];

    setIslemlerData((prev) => ({
      ...prev,
      teslimGunu: gun,
      teslimTarihi: dateStr,
    }));
    setFirmaStats((prev) => ({ ...prev, teslimTarihi: dateStr }));

    try {
      await window.electron.ipcRenderer.invoke(
        "db:query",
        `UPDATE DATA_TeminDosyasi SET teslim_tarihi = ?, teslim_gun = ? WHERE id = ?`,
        [dateStr, gun, activeDosyaId],
      );
      documentPreloadService.invalidateCache(activeDosyaId);
      window.dispatchEvent(
        new CustomEvent("dossier:updated", {
          detail: { dosyaId: activeDosyaId },
        }),
      );
      setSavedFeedback(true);
      setTimeout(() => setSavedFeedback(false), 2000);
    } catch (err) {
      console.error("Teslim süresi güncellenirken hata:", err);
    }
  };

  // Özel teslim tarihi seçildiğinde
  const handleUpdateTeslimTarihi = async (dateStr: string): Promise<void> => {
    if (!activeDosyaId) return;
    let gun = islemlerData.teslimGunu;
    if (dateStr) {
      const tDate = new Date(dateStr);
      const today = new Date();
      const diffTime = tDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 0) gun = diffDays;
    }

    setIslemlerData((prev) => ({
      ...prev,
      teslimGunu: gun,
      teslimTarihi: dateStr,
    }));
    setFirmaStats((prev) => ({ ...prev, teslimTarihi: dateStr }));

    try {
      await window.electron.ipcRenderer.invoke(
        "db:query",
        `UPDATE DATA_TeminDosyasi SET teslim_tarihi = ?, teslim_gun = ? WHERE id = ?`,
        [dateStr, gun, activeDosyaId],
      );
      documentPreloadService.invalidateCache(activeDosyaId);
      window.dispatchEvent(
        new CustomEvent("dossier:updated", {
          detail: { dosyaId: activeDosyaId },
        }),
      );
      setSavedFeedback(true);
      setTimeout(() => setSavedFeedback(false), 2000);
    } catch (err) {
      console.error("Teslim tarihi kaydedilirken hata:", err);
    }
  };

  // Sözleşme yapılma tercihini değiştirme
  const handleToggleSozlesme = async (): Promise<void> => {
    if (!activeDosyaId) return;
    const newStatus = firmaStats.sozlesmeYapilacakMi ? 0 : 1;
    setFirmaStats((prev) => ({ ...prev, sozlesmeYapilacakMi: newStatus }));
    setIslemlerData((prev) => ({
      ...prev,
      sozlesmeYapilacakMi: newStatus === 1,
    }));

    try {
      await window.electron.ipcRenderer.invoke(
        "db:query",
        `UPDATE DATA_TeminDosyasi SET sozlesme_yapilacak_mi = ? WHERE id = ?`,
        [newStatus, activeDosyaId],
      );
      documentPreloadService.invalidateCache(activeDosyaId);
      window.dispatchEvent(
        new CustomEvent("dossier:updated", {
          detail: { dosyaId: activeDosyaId },
        }),
      );
      setSavedFeedback(true);
      setTimeout(() => setSavedFeedback(false), 2000);
    } catch (err) {
      console.error("Sözleşme durumu güncellenirken hata:", err);
    }
  };

  // Belge Açma Yardımcıları
  const handleOpenSonucOnay = () => {
    useGlobalDocumentPreviewStore.getState().openDocument({
      documentId: "dogrudan-temin-sonuc-onay-belgesi",
      dosyaId: activeDosyaId || undefined,
      documentTitle: "Doğrudan Temin Sonuç Onay Belgesi",
    });
  };

  const handleOpenButceSorgusu = () => {
    useGlobalDocumentPreviewStore.getState().openDocument({
      documentId: "butce-sorgusu",
      dosyaId: activeDosyaId || undefined,
      documentTitle: "Bütçe Sorgusu / Ödenek Uygunluk Belgesi",
    });
  };

  const handleOpenKabulMektubu = () => {
    const s = stageSablons.find(
      (sb) =>
        normalizeForMatch(sb.dosya_adi + sb.ad).includes("kabulyazisi") ||
        normalizeForMatch(sb.dosya_adi + sb.ad).includes("kabuledilenteklif") ||
        normalizeForMatch(sb.dosya_adi + sb.ad).includes("kabul"),
    );
    if (s) handleOpenPreviewForSablon(s, s.ad);
    else {
      useGlobalDocumentPreviewStore.getState().openDocument({
        documentId: "kabul-edilen-teklif",
        dosyaId: activeDosyaId || undefined,
        documentTitle: "Kabul Edilen Teklif Mektubu",
      });
    }
  };

  const handleOpenSiparisFormu = () => {
    const s = stageSablons.find(
      (sb) =>
        normalizeForMatch(sb.dosya_adi + sb.ad).includes("siparisformu") ||
        normalizeForMatch(sb.dosya_adi + sb.ad).includes("siparis"),
    );
    if (s) handleOpenPreviewForSablon(s, s.ad);
    else {
      useGlobalDocumentPreviewStore.getState().openDocument({
        documentId: "kabul-edilen-teklif",
        dosyaId: activeDosyaId || undefined,
        documentTitle: "Sipariş Formu",
      });
    }
  };

  const handleOpenDavetMektubu = () => {
    const s = stageSablons.find((sb) =>
      normalizeForMatch(sb.dosya_adi + sb.ad).includes("davet")
    );
    if (s) handleOpenPreviewForSablon(s, s.ad);
    else {
      useGlobalDocumentPreviewStore.getState().openDocument({
        documentId: "sozlesmeye-davet",
        dosyaId: activeDosyaId || undefined,
        documentTitle: "Sözleşmeye Davet Mektubu",
      });
    }
  };

  const handleOpenStandartSozlesme = () => {
    const s = stageSablons.find(
      (sb) =>
        normalizeForMatch(sb.dosya_adi + sb.ad) === "dogrudanteminsozlesmesi" ||
        normalizeForMatch(sb.dosya_adi + sb.ad) === "sozlesme",
    );
    if (s) handleOpenPreviewForSablon(s, s.ad);
    else {
      useGlobalDocumentPreviewStore.getState().openDocument({
        documentId: "dogrudan-temin-sozlesmesi",
        dosyaId: activeDosyaId || undefined,
        documentTitle: "Doğrudan Temin Sözleşmesi",
      });
    }
  };

  const handleOpenAlternatifSozlesme = () => {
    const s = stageSablons.find((sb) =>
      normalizeForMatch(sb.dosya_adi + sb.ad).includes("alternatif")
    );
    if (s) handleOpenPreviewForSablon(s, s.ad);
    else {
      useGlobalDocumentPreviewStore.getState().openDocument({
        documentId: "dogrudan-temin-sozlesmesi-alternatif",
        dosyaId: activeDosyaId || undefined,
        documentTitle: "Doğrudan Temin Sözleşmesi (Alternatif)",
      });
    }
  };

  const handleOpenUzunFormSozlesme = () => {
    const s = stageSablons.find((sb) =>
      normalizeForMatch(sb.dosya_adi + sb.ad).includes("uzun")
    );
    if (s) handleOpenPreviewForSablon(s, s.ad);
    else {
      useGlobalDocumentPreviewStore.getState().openDocument({
        documentId: "dogrudan-temin-sozlesmesi-uzun",
        dosyaId: activeDosyaId || undefined,
        documentTitle: "Doğrudan Temin Sözleşmesi (Uzun Form)",
      });
    }
  };

  const handleOpenEkap = () => {
    window.electron?.ipcRenderer.send("window:open-external", {
      url: "https://ekapv2.kik.gov.tr/sorgulamalar/yasak-sorgulama",
      title: "EKAP Kamu İhale Yasaklı Sorgulama",
    });
  };

  return (
    <SubScreen
      title="Sipariş & Sözleşme"
      icon={FileCheck}
      description="Doğrudan temin onay belgesi, ihale komisyon kararı ve sözleşmeye davet gibi dökümanları hazırlayabilir, doğrudan temin sözleşme süreçlerinizi bu panelden yönetebilirsiniz."
      previewDocumentId={previewModalOpen && previewData?.dosyaAdi
        ? previewData.dosyaAdi
        : null}
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
            stageSablons={stageSablons}
            sablons={sablons}
            activeStarredDocs={activeStarredDocs}
            ciktiLoading={ciktiLoading}
            handleOpenPreviewForSablon={handleOpenPreviewForSablon}
            quickPrint={quickPrint}
            quickExport={quickExport}
            quickOpenExternal={quickOpenExternal}
            isSablonDisabled={isSablonDisabled}
            disableDocumentGuidance={disableDocumentGuidance}
            activeDosyaId={activeDosyaId}
            onPrintResultApproval={handleOpenSonucOnay}
            onPrintAcceptanceLetter={handleOpenKabulMektubu}
            onPrintOrderForm={handleOpenSiparisFormu}
            onPrintContractInvitation={handleOpenDavetMektubu}
            onPrintContract={handleOpenStandartSozlesme}
            onPrintContractAlternative={handleOpenAlternatifSozlesme}
            onPrintContractLong={handleOpenUzunFormSozlesme}
          />

          {/* ═══ Stepper Sekme Barı ═══ */}
          <SiparisStepperTabs
            activeStep={activeStep}
            setActiveStep={setActiveStep}
            sozlesmeYapilacakMi={Boolean(firmaStats.sozlesmeYapilacakMi)}
          />

          {/* ═══ Stepper İçerik Paneli ═══ */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col gap-4 animate-in fade-in duration-200">
            {activeStep === "teslimat" && (
              <Step1TeslimatVeSurec
                islemlerData={islemlerData}
                firmaStats={firmaStats}
                savedFeedback={savedFeedback}
                handleUpdateTeslimGunu={handleUpdateTeslimGunu}
                handleUpdateTeslimTarihi={handleUpdateTeslimTarihi}
                handleToggleSozlesme={handleToggleSozlesme}
              />
            )}

            {activeStep === "sonuc_onay" && (
              <Step2SonucOnay
                kazananFirmaUnvan={kazananFirmaUnvan}
                firmaStats={firmaStats}
                formatCurrency={formatCurrency}
                onOpenResultApproval={handleOpenSonucOnay}
                onOpenButceSorgusu={handleOpenButceSorgusu}
              />
            )}

            {activeStep === "yasaklilik" && (
              <Step3Yasaklilik vergiNo={firmaStats.vergiNo} />
            )}

            {activeStep === "siparis" && (
              <Step4KabulVeSiparis
                teslimGunu={islemlerData.teslimGunu}
                onOpenKabulMektubu={handleOpenKabulMektubu}
                onOpenSiparisFormu={handleOpenSiparisFormu}
              />
            )}

            {activeStep === "sozlesme" && (
              <Step5SozlesmeVeDavet
                sozlesmeYapilacakMi={firmaStats.sozlesmeYapilacakMi}
                onOpenDavetMektubu={handleOpenDavetMektubu}
                onOpenStandartSozlesme={handleOpenStandartSozlesme}
                onOpenAlternatifSozlesme={handleOpenAlternatifSozlesme}
                onOpenUzunFormSozlesme={handleOpenUzunFormSozlesme}
              />
            )}

            {activeStep === "timeline" && (
              <StepTimelineAll
                onOpenSonucOnay={handleOpenSonucOnay}
                onOpenEkap={handleOpenEkap}
                onOpenKabulMektubu={handleOpenKabulMektubu}
                onOpenDavetMektubu={handleOpenDavetMektubu}
                onOpenSozlesme={handleOpenStandartSozlesme}
              />
            )}

            {/* Stepper Alt Gezinme Butonları */}
            <SiparisStepperNav
              activeStep={activeStep}
              onStepChange={setActiveStep}
            />
          </div>
        </div>
      )}
    </SubScreen>
  );
}

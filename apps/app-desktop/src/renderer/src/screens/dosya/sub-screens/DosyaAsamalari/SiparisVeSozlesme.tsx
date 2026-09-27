import React, { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronsUpDown,
  Clock,
  FileCheck,
  FileSignature,
  ShieldCheck,
} from "lucide-react";
import { SubScreen } from "../../SubScreens.screen";
import {
  normalizeForMatch,
  useDosyaAsamasiSablons,
} from "./useDosyaAsamasiSablons";
import { useWorkspaceStore } from "../../../../store/workspaceStore";
import { useGlobalDocumentPreviewStore } from "../../../../store/globalDocumentPreviewStore";
import { documentPreloadService } from "../../../../services/documentPreloadService";
import {
  FirmaStats,
  IslemlerData,
  SiparisGuardWarning,
  SiparisKazananFirmaCard,
  Step1TeslimatVeSurec,
  Step2SonucOnay,
  Step3Yasaklilik,
  Step5SozlesmeVeDavet,
} from "./components/SiparisVeSozlesme";
import { cn } from "../../../../../utils/cn";

export function SiparisVeSozlesme(): React.JSX.Element {
  const {
    sablons,
    previewModalOpen,
    setPreviewModalOpen,
    previewData,
    handleOpenPreviewForSablon,
  } = useDosyaAsamasiSablons();

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

  const [savedFeedback, setSavedFeedback] = useState(false);

  // Accordion açık/kapalı state'leri (Varsayılan olarak 1 ve 2 açık)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    teslimat: true,
    sonuc_onay: true,
    yasaklilik: false,
    sozlesme: true,
  });

  const toggleSection = (key: string): void => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleAllSections = (): void => {
    const allOpen = Object.values(openSections).every(Boolean);
    setOpenSections({
      teslimat: !allOpen,
      sonuc_onay: !allOpen,
      yasaklilik: !allOpen,
      sozlesme: !allOpen,
    });
  };

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
               WHERE tf.dosya_id = ? AND tf.teklif_toplami > 0
               ORDER BY tf.teklif_toplami ASC LIMIT 1`,
              [activeDosyaId],
            );
            if (
              autoLowestRes.success && autoLowestRes.data &&
              autoLowestRes.data.length > 0
            ) {
              effectiveFirmaId = autoLowestRes.data[0].firma_id;
              effectiveUnvan = autoLowestRes.data[0].unvan || "";
              effectiveVergiNo = autoLowestRes.data[0].vergi_no || null;

              // Veritabanına da sessizce yaz
              await window.electron.ipcRenderer.invoke(
                "db:run",
                "UPDATE DATA_TeminDosyasi SET firma_id = ? WHERE id = ?",
                [effectiveFirmaId, activeDosyaId],
              );
            }
          }

          setKazananFirmaId(effectiveFirmaId);
          setKazananFirmaUnvan(effectiveUnvan);

          // Teklif toplamını ve yasaklılık durumunu kazanan firma kaydından çek
          let teklifToplami = null;
          let yasaklilikDurumu = null;
          if (effectiveFirmaId) {
            const tfRes = await window.electron.ipcRenderer.invoke(
              "db:query",
              `SELECT teklif_toplami, yasaklilik_durumu FROM DATA_TeminFirma WHERE dosya_id = ? AND firma_id = ?`,
              [activeDosyaId, effectiveFirmaId],
            );
            if (tfRes.success && tfRes.data && tfRes.data.length > 0) {
              teklifToplami = tfRes.data[0].teklif_toplami;
              yasaklilikDurumu = tfRes.data[0].yasaklilik_durumu;
            }
          }

          // Toplam istekli firma sayısını öğren
          const firmCountRes = await window.electron.ipcRenderer.invoke(
            "db:query",
            `SELECT COUNT(*) as cnt FROM DATA_TeminFirma WHERE dosya_id = ?`,
            [activeDosyaId],
          );
          const istekliFirmaSayisi =
            firmCountRes.success && firmCountRes.data &&
              firmCountRes.data.length > 0
              ? firmCountRes.data[0].cnt
              : 0;

          // Teslim tarihi formatlaması
          let formattedDate = "";
          let teslimGunu = row.teslim_gun !== undefined &&
              row.teslim_gun !== null
            ? row.teslim_gun
            : 10;

          if (
            (row.teslim_gun === undefined || row.teslim_gun === null) &&
            row.teslim_tarihi
          ) {
            const tDate = new Date(row.teslim_tarihi);
            const today = new Date();
            const diffTime = tDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays > 0) teslimGunu = diffDays;
          }

          if (row.teslim_tarihi) {
            const d = new Date(row.teslim_tarihi);
            if (!isNaN(d.getTime())) {
              formattedDate = d.toISOString().split("T")[0];
            }
          }

          setFirmaStats({
            teklifToplami,
            yaklasikMaliyet: row.yaklasik_maliyet || null,
            teslimTarihi: formattedDate || null,
            yasaklilikDurumu,
            vergiNo: effectiveVergiNo,
            teklifSozlesmeTuru: row.teklif_sozlesme_turu || "Mal Alımı",
            sozlesmeYapilacakMi: row.sozlesme_yapilacak_mi ? 1 : 0,
            istekliFirmaSayisi,
          });

          setIslemlerData({
            sozlesmeYapilacakMi: Boolean(row.sozlesme_yapilacak_mi),
            siparisFormuGerekli: true,
            teslimGunu: teslimGunu,
            teslimTarihi: formattedDate || "",
            teklifSozlesmeTuru: row.teklif_sozlesme_turu || "Mal Alımı",
          });
        } else {
          setKazananFirmaId(null);
        }
      } catch (err) {
        console.error("Kazanan firma kontrol edilirken hata:", err);
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
      maximumFractionDigits: 2,
    }).format(val);
  };

  // Teslimat günü hızlıca seçildiğinde
  const handleUpdateTeslimGunu = async (gun: number): Promise<void> => {
    if (!activeDosyaId) return;
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + gun);
    const dateStr = targetDate.toISOString().split("T")[0];

    setIslemlerData((prev) => ({
      ...prev,
      teslimGunu: gun,
      teslimTarihi: dateStr,
    }));
    setFirmaStats((prev) => ({ ...prev, teslimTarihi: dateStr }));

    try {
      await window.electron.ipcRenderer.invoke(
        "db:query",
        `UPDATE DATA_TeminDosyasi SET teslim_gun = ?, teslim_tarihi = ? WHERE id = ?`,
        [gun, dateStr, activeDosyaId],
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
  const handleOpenSonucOnay = (): void => {
    const s = stageSablons.find(
      (sb) =>
        normalizeForMatch(sb.dosya_adi + sb.ad).includes("sonuconay") ||
        normalizeForMatch(sb.dosya_adi + sb.ad).includes("sonuc") ||
        normalizeForMatch(sb.dosya_adi + sb.ad).includes("karar"),
    );
    if (s) {
      handleOpenPreviewForSablon(
        s,
        s.ad || "Doğrudan Temin Sonuç Onay Belgesi",
      );
    } else {
      useGlobalDocumentPreviewStore.getState().openDocument({
        documentId: "dogrudan-temin-sonuc-onay-belgesi",
        dosyaId: activeDosyaId || undefined,
        documentTitle: "Doğrudan Temin Sonuç Onay Belgesi",
      });
    }
  };

  const handleOpenButceSorgusu = (): void => {
    const s = stageSablons.find(
      (sb) =>
        normalizeForMatch(sb.dosya_adi + sb.ad).includes("butce") ||
        normalizeForMatch(sb.dosya_adi + sb.ad).includes("odenek"),
    );
    if (s) {
      handleOpenPreviewForSablon(
        s,
        s.ad || "Bütçe Sorgusu / Ödenek Uygunluk Belgesi",
      );
    } else {
      useGlobalDocumentPreviewStore.getState().openDocument({
        documentId: "butce-sorgusu",
        dosyaId: activeDosyaId || undefined,
        documentTitle: "Bütçe Sorgusu / Ödenek Uygunluk Belgesi",
      });
    }
  };

  const handleOpenKabulMektubu = (): void => {
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
        documentTitle: "Kabul Edilen Teklif Mektubu / Sipariş Formu",
      });
    }
  };

  const handleOpenSiparisFormu = (): void => {
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
        documentTitle: "Kabul Edilen Teklif Mektubu / Sipariş Formu",
      });
    }
  };

  const handleOpenDavetMektubu = (): void => {
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

  const handleOpenStandartSozlesme = (): void => {
    const s = stageSablons.find(
      (sb) =>
        normalizeForMatch(sb.dosya_adi + sb.ad).includes("sozlesme") &&
        !normalizeForMatch(sb.dosya_adi + sb.ad).includes("alternatif") &&
        !normalizeForMatch(sb.dosya_adi + sb.ad).includes("uzun"),
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

  const handleOpenAlternatifSozlesme = (): void => {
    const s = stageSablons.find(
      (sb) =>
        normalizeForMatch(sb.dosya_adi + sb.ad).includes("sozlesme") &&
        normalizeForMatch(sb.dosya_adi + sb.ad).includes("alternatif"),
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

  const handleOpenUzunFormSozlesme = (): void => {
    const s = stageSablons.find(
      (sb) =>
        normalizeForMatch(sb.dosya_adi + sb.ad).includes("sozlesme") &&
        normalizeForMatch(sb.dosya_adi + sb.ad).includes("uzun"),
    );
    if (s) handleOpenPreviewForSablon(s, s.ad);
    else {
      useGlobalDocumentPreviewStore.getState().openDocument({
        documentId: "dogrudan-temin-sozlesmesi-uzun",
        dosyaId: activeDosyaId || undefined,
        documentTitle: "Doğrudan Temin Sözleşmesi (Kapsamlı)",
      });
    }
  };

  const hasSozlesme = Boolean(firmaStats.sozlesmeYapilacakMi);

  return (
    <SubScreen
      title="Yüklenici & Sipariş İşlemleri"
      icon={FileCheck}
      description="Doğrudan temin sonuç onay belgesi, sipariş formu, kabul mektubu ve sözleşme süreçlerinizi bu panelden yönetebilirsiniz."
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
            onPrintResultApproval={handleOpenSonucOnay}
            onPrintAcceptanceLetter={handleOpenKabulMektubu}
            onPrintOrderForm={handleOpenSiparisFormu}
            onPrintContractInvitation={handleOpenDavetMektubu}
            onPrintContract={handleOpenStandartSozlesme}
            onPrintContractAlternative={handleOpenAlternatifSozlesme}
            onPrintContractLong={handleOpenUzunFormSozlesme}
          />

          {/* ═══ Akordeon / Collapse Başlık Çubuğu ═══ */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                İşlem ve Belge Aşamaları
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                {hasSozlesme ? "4 Adım" : "3 Adım"}
              </span>
            </div>

            <button
              type="button"
              onClick={toggleAllSections}
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer transition-colors py-1 px-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40"
            >
              <ChevronsUpDown className="w-3.5 h-3.5" />
              {Object.values(openSections).every(Boolean)
                ? "Tümünü Daralt"
                : "Tümünü Genişlet"}
            </button>
          </div>

          {/* ═══ AKORDEON (COLLAPSE) LİSTESİ ═══ */}
          <div className="flex flex-col gap-3">
            {/* ── 1. Adım: Teslimat & Sipariş Formu ── */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden transition-all">
              <button
                type="button"
                onClick={() => toggleSection("teslimat")}
                className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-slate-50/70 dark:hover:bg-slate-850/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800 text-[10px]">
                        Adım 1
                      </span>
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                        Teslimat Şartları & Sipariş Formu / Kabul Mektubu
                      </h3>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Yasal teslim süresi belirleme, sözleşme tercihi ve kabul/sipariş formunu açma
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800">
                    {islemlerData.teslimGunu} Gün Teslimat
                  </span>
                  <div
                    className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 transition-transform duration-200",
                      openSections.teslimat && "rotate-180 text-slate-700 dark:text-slate-200",
                    )}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </button>

              {openSections.teslimat && (
                <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800/80 animate-in fade-in duration-200">
                  <Step1TeslimatVeSurec
                    islemlerData={islemlerData}
                    firmaStats={firmaStats}
                    savedFeedback={savedFeedback}
                    handleUpdateTeslimGunu={handleUpdateTeslimGunu}
                    handleUpdateTeslimTarihi={handleUpdateTeslimTarihi}
                    handleToggleSozlesme={handleToggleSozlesme}
                    onOpenKabulMektubu={handleOpenKabulMektubu}
                  />
                </div>
              )}
            </div>

            {/* ── 2. Adım: Karar & Sonuç Onay ve Bütçe Uygunluk ── */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden transition-all">
              <button
                type="button"
                onClick={() => toggleSection("sonuc_onay")}
                className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-slate-50/70 dark:hover:bg-slate-850/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shrink-0">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 text-[10px]">
                        Adım 2
                      </span>
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                        Karar & Sonuç Onay ve Bütçe Uygunluk Süreci
                      </h3>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Piyasa fiyat araştırması neticesinde sonuç onay belgesi ve bütçe uygunluk formu
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    Onay & Bütçe
                  </span>
                  <div
                    className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 transition-transform duration-200",
                      openSections.sonuc_onay && "rotate-180 text-slate-700 dark:text-slate-200",
                    )}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </button>

              {openSections.sonuc_onay && (
                <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800/80 animate-in fade-in duration-200">
                  <Step2SonucOnay
                    kazananFirmaUnvan={kazananFirmaUnvan}
                    firmaStats={firmaStats}
                    formatCurrency={formatCurrency}
                    onOpenResultApproval={handleOpenSonucOnay}
                    onOpenButceSorgusu={handleOpenButceSorgusu}
                  />
                </div>
              )}
            </div>

            {/* ── 3. Adım: Yasaklılık Teyit İşlemleri ── */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden transition-all">
              <button
                type="button"
                onClick={() => toggleSection("yasaklilik")}
                className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-slate-50/70 dark:hover:bg-slate-850/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-950/60 flex items-center justify-center text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800 shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/50 px-1.5 py-0.5 rounded border border-violet-200 dark:border-violet-800 text-[10px]">
                        Adım 3
                      </span>
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                        Yasaklılık Teyit İşlemleri
                      </h3>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      KİK İhale Yasaklılık sorgulama ve teyit belgesi kontrolü
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="text-[11px] font-bold text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/40 px-2.5 py-1 rounded-lg border border-violet-200 dark:border-violet-800">
                    KİK Teyit
                  </span>
                  <div
                    className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 transition-transform duration-200",
                      openSections.yasaklilik && "rotate-180 text-slate-700 dark:text-slate-200",
                    )}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </button>

              {openSections.yasaklilik && (
                <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800/80 animate-in fade-in duration-200">
                  <Step3Yasaklilik vergiNo={firmaStats.vergiNo} />
                </div>
              )}
            </div>

            {/* ── 4. Adım: Sözleşme & Davet İşlemleri (Yalnızca Sözleşme Yapılacaksa) ── */}
            {hasSozlesme && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden transition-all">
                <button
                  type="button"
                  onClick={() => toggleSection("sozlesme")}
                  className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-slate-50/70 dark:hover:bg-slate-850/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 shrink-0">
                      <FileSignature className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800 text-[10px]">
                          Adım 4
                        </span>
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                          Sözleşme & Davet İşlemleri
                        </h3>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Yüklenici sözleşmeye davet mektubu ve doğrudan temin alım sözleşmesi
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800">
                      Sözleşme & Davet
                    </span>
                    <div
                      className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 transition-transform duration-200",
                        openSections.sozlesme && "rotate-180 text-slate-700 dark:text-slate-200",
                      )}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </button>

                {openSections.sozlesme && (
                  <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800/80 animate-in fade-in duration-200">
                    <Step5SozlesmeVeDavet
                      sozlesmeYapilacakMi={firmaStats.sozlesmeYapilacakMi}
                      onOpenDavetMektubu={handleOpenDavetMektubu}
                      onOpenStandartSozlesme={handleOpenStandartSozlesme}
                      onOpenAlternatifSozlesme={handleOpenAlternatifSozlesme}
                      onOpenUzunFormSozlesme={handleOpenUzunFormSozlesme}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </SubScreen>
  );
}

import { useEffect, useRef, useState } from "react";
import { renderToString } from "react-dom/server";
import React from "react";
import {
  IhtiyacListesiType,
  TemplateEditProvider,
  TemplateResolver,
} from "@temin360/document-templates";
import { useWorkspaceStore } from "../../../../../store/workspaceStore";
import { useSettingsStore } from "../../../../../store/settingsStore";
import { usePrintQueueStore } from "../../../../../store/printQueueStore";
import { getDefaultMappingForProcess } from "../../../../../constants/mappings";
import { getInstitutionSuffixes } from "../../../../../utils/kurumHelper";
import { Personel } from "../types";
import {
  resolveTemplateConfig,
  TEMPLATE_OPTIONS,
} from "../templateResolver";
import { buildExportFileName } from "../../../../../utils/exportFileName";
import { documentPreloadService } from "../../../../../services/documentPreloadService";

interface UseDocumentPreviewDataParams {
  isOpen: boolean;
  documentId: string | null;
  dosyaId?: number | null;
  invitedFirms?: any[];
}

export function useDocumentPreviewData({
  isOpen,
  documentId,
  dosyaId: propDosyaId,
  invitedFirms: propInvitedFirms,
}: UseDocumentPreviewDataParams) {
  const { activeDosyaId: storeDosyaId } = useWorkspaceStore();
  const activeDosyaId =
    propDosyaId ||
    storeDosyaId ||
    Number(sessionStorage.getItem("workspace_dosya_id") || 0) ||
    Number(localStorage.getItem("active_dosya_id") || 0);

  const [selectedDocId, setSelectedDocId] = useState<string>(
    () => documentId || "ihtiyac-listesi",
  );
  const [prevPropDocId, setPrevPropDocId] = useState<string | null>(documentId);

  if (documentId !== prevPropDocId) {
    setPrevPropDocId(documentId);
    if (documentId) {
      setSelectedDocId(documentId);
    }
  }

  const {
    logoLeft,
    logoRight,
    institutionLogo,
    showLogoLeft,
    showLogoRight,
    subInstitutionType,
    customSubInstitutionLabel,
    customSubInstitutionKurumumuz,
    customSubInstitutionKurumu,
    customSubInstitutionKurumlari,
  } = useSettingsStore();

  const {
    config: activeTemplateConf,
    component: ActiveComponent,
    resolvedId,
  } = resolveTemplateConfig(selectedDocId);

  const initialPreloaded = documentPreloadService.getCachedDocument(
    resolvedId,
    activeDosyaId,
  );

  const [formData, setFormData] = useState<Partial<IhtiyacListesiType>>(() => {
    if (initialPreloaded?.resolvedData) {
      return initialPreloaded.resolvedData;
    }
    if (propInvitedFirms && propInvitedFirms.length > 0) {
      return {
        firmalar: propInvitedFirms.map((f: any) => ({
          unvan: f.unvan || f.firma_adi || "İstekli Firma",
          yetkili_ad_soyad: f.yetkili_ad_soyad || "",
        })),
      };
    }
    return {};
  });

  const [personelListesi, setPersonelListesi] = useState<Personel[]>(() => {
    return initialPreloaded?.payloadData?.personelListesi || [];
  });
  const [firmaListesi, setFirmaListesi] = useState<any[]>(() => {
    if (initialPreloaded?.payloadData?.firmaListesi) {
      return initialPreloaded.payloadData.firmaListesi;
    }
    if (propInvitedFirms && propInvitedFirms.length > 0) {
      return propInvitedFirms.map((f: any) => ({
        temin_firma_id: f.temin_firma_id || f.id,
        id: f.id || f.firma_id || f.temin_firma_id,
        unvan: f.unvan || f.firma_adi || "İstekli Firma",
        yetkili_ad_soyad: f.yetkili_ad_soyad || "",
        telefon: f.telefon || "",
        eposta: f.eposta || f.email || "",
      }));
    }
    return [];
  });

  const [localShowLogoLeft, setLocalShowLogoLeft] = useState(showLogoLeft);
  const [localShowLogoRight, setLocalShowLogoRight] = useState(showLogoRight);
  const [dosyaRecord, setDosyaRecord] = useState<any>(
    () => initialPreloaded?.payloadData?.dosya || null,
  );
  const [isLoading, setIsLoading] = useState(!initialPreloaded);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">(
    "portrait",
  );
  const [isEditingMode, setIsEditingMode] = useState(true);
  const [previewScale, setPreviewScale] = useState(1);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [zoomMode, setZoomMode] = useState<"auto" | "manual">("auto");
  const [manualZoom, setManualZoom] = useState(1.0);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const previewContainerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const initialSnapshotRef = useRef<string>(
    initialPreloaded?.resolvedData
      ? JSON.stringify({
          ...initialPreloaded.resolvedData,
          showLogoLeft,
          showLogoRight,
          olurYazisi: initialPreloaded.resolvedData.olurYazisi !== false,
          orientation: "portrait",
        })
      : "",
  );

  const currentSnapshot = JSON.stringify({
    ...formData,
    showLogoLeft: localShowLogoLeft,
    showLogoRight: localShowLogoRight,
    olurYazisi: formData.olurYazisi !== false,
    orientation,
  });

  const isDirty = Boolean(
    initialSnapshotRef.current &&
    currentSnapshot !== initialSnapshotRef.current &&
    !isLoading
  );

  // Auto-scale: belge genişliği A4 = 800px (portrait) / 1131px (landscape)
  // Container'ın içine sığacak şekilde scale hesapla
  useEffect(() => {
    const container = previewContainerRef.current
    if (!container) return

    const DOC_W = orientation === 'landscape' ? 1131 : 800
    const PADDING = 64 // py-8 = 32px * 2

    const recalculate = () => {
      if (zoomMode === 'manual') {
        setPreviewScale(manualZoom)
        return
      }
      const availableW = container.clientWidth - PADDING
      if (availableW <= 0) return
      const scale = Math.min(availableW / DOC_W, 1) // max 1x, sığmıyorsa küçült
      setPreviewScale(Math.round(scale * 1000) / 1000)
    }

    recalculate()

    const observer = new ResizeObserver(recalculate)
    observer.observe(container)
    return () => observer.disconnect()
  }, [orientation, zoomMode, manualZoom])
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const preloaded = documentPreloadService.getCachedDocument(
      resolvedId,
      activeDosyaId,
    );
    if (!preloaded) {
      setIsLoading(true);
    }

    const loadInitialData = async (): Promise<void> => {
      try {
        const queryExecutor = async (
          sql: string,
          params: any[],
        ): Promise<any[]> => {
          if (!window.electron?.ipcRenderer) return [];
          const res = await window.electron.ipcRenderer.invoke(
            "db:query",
            sql,
            params,
          );
          if (res && res.success) {
            return res.data;
          }
          return [];
        };

        const mapping = getDefaultMappingForProcess(resolvedId);
        const resolver = new TemplateResolver(queryExecutor);

        // Fetch complete pre-computed document payload via single native Electron IPC handler + resolver in parallel
        const [payloadRes, resolved] = await Promise.all([
          window.electron?.ipcRenderer
            ? window.electron.ipcRenderer.invoke("belge:get-document-payload", {
                dosyaId: activeDosyaId,
                documentId: resolvedId,
              })
            : Promise.resolve({ success: false, data: {} }),
          resolver.resolve(mapping, activeDosyaId || 0),
        ]);

        if (!isMounted) return;

        const payloadData = payloadRes?.success ? payloadRes.data : {};
        if (payloadData.dosya) {
          setDosyaRecord(payloadData.dosya);
        } else if (activeDosyaId) {
          queryExecutor("SELECT * FROM DATA_TeminDosyasi WHERE id = ?", [activeDosyaId]).then((res) => {
            if (res && res[0]) setDosyaRecord(res[0]);
          });
        }
        let personelList = payloadData.personelListesi || [];
        if (!personelList || personelList.length === 0) {
          try {
            personelList = await queryExecutor(
              "SELECT id, ad_soyad, unvan, telefon, eposta, birim, sicil_no FROM TANIM_Personel WHERE COALESCE(aktif_mi, 1) = 1 OR aktif_mi = '1' OR aktif_mi = 'true' OR aktif_mi IS NULL ORDER BY ad_soyad ASC",
              []
            );
          } catch (e) {
            console.error("Direct personel query error:", e);
          }
        }
        const fileFirms = payloadData.fileFirms || [];
        const combinedFirms = payloadData.firmaListesi || [];
        const items = payloadData.items || [];
        const bids = payloadData.bids || [];

        setPersonelListesi(personelList || []);
        setFirmaListesi(combinedFirms);

        // 1. Compute Base Data with Default Resolutions
        const baseData: any = { ...resolved };

        if (
          resolved.antetSatirlari &&
          Array.isArray(resolved.antetSatirlari) &&
          resolved.antetSatirlari.length > 0
        ) {
          baseData.antetSatirlari = resolved.antetSatirlari;
        }

        baseData.tarih = baseData.tarih || baseData.onayaSunulanTarih || "";
        baseData.onayTarihi = baseData.onayTarihi || baseData.dosyaTarihi || "";

        const resolvedSolLogo =
          payloadData.solLogo ||
          resolved.solLogo ||
          logoLeft ||
          institutionLogo ||
          null;
        const resolvedSagLogo =
          payloadData.sagLogo || resolved.sagLogo || logoRight || null;

        if (resolvedSolLogo) {
          baseData.solLogo = resolvedSolLogo;
        }
        if (resolvedSagLogo) {
          baseData.sagLogo = resolvedSagLogo;
        }

        const activeFirms = fileFirms.length > 0 ? fileFirms : combinedFirms;
        baseData.firmalar = activeFirms;
        baseData.firmaListesi = combinedFirms;

        // Kazanan firma tespiti
        const winnerFirmaId =
          payloadData.dosya?.firma_id ||
          dosyaRecord?.firma_id ||
          fileFirms.find((f: any) => f.kazanan_mi === 1 || f.isWinner)?.id;

        const winnerFirm =
          fileFirms.find(
            (f: any) =>
              (winnerFirmaId && (f.id === winnerFirmaId || f.temin_firma_id === winnerFirmaId || f.firma_id === winnerFirmaId)) ||
              f.kazanan_mi === 1 ||
              f.isWinner,
          ) ||
          fileFirms[0] ||
          combinedFirms[0];

        if (winnerFirm && (winnerFirm.unvan || winnerFirm.firma_adi)) {
          const resolvedUnvan = winnerFirm.unvan || winnerFirm.firma_adi;
          if (
            !baseData.yukleniciFirma ||
            baseData.yukleniciFirma === "YÜKLENİCİ FİRMA" ||
            baseData.yukleniciFirma === "İstekli Firma" ||
            baseData.yukleniciFirma.includes("[Belirtilmedi")
          ) {
            baseData.yukleniciFirma = resolvedUnvan;
          }
          if (winnerFirm.adres && !baseData.yukleniciAdresi) {
            baseData.yukleniciAdresi = winnerFirm.adres;
            baseData.yukleniciIlce = winnerFirm.ilce;
            baseData.yukleniciIl = winnerFirm.il;
          }
          if (
            !baseData.teslimEden_0_adSoyad ||
            baseData.teslimEden_0_adSoyad === "" ||
            baseData.teslimEden_0_adSoyad.includes("[Belirtilmedi")
          ) {
            baseData.teslimEden_0_adSoyad = resolvedUnvan;
            baseData.teslimEden_0_unvan = winnerFirm.yetkili_ad_soyad
              ? `Yetkili: ${winnerFirm.yetkili_ad_soyad}`
              : "Yüklenici Firma / Yetkilisi";
          }
        }

        // Teslim süresi
        const dosyaObj = payloadData.dosya || dosyaRecord || {};
        if (dosyaObj.teslim_gun !== undefined && dosyaObj.teslim_gun !== null && String(dosyaObj.teslim_gun).trim() !== "") {
          baseData.teslimGun = String(dosyaObj.teslim_gun);
          baseData.teslimGunu = String(dosyaObj.teslim_gun);
        } else if (dosyaObj.teslim_suresi) {
          baseData.teslimGun = String(dosyaObj.teslim_suresi);
          baseData.teslimGunu = String(dosyaObj.teslim_suresi);
        } else if (dosyaObj.teslim_tarihi) {
          const tDate = new Date(dosyaObj.teslim_tarihi);
          const baseDate = dosyaObj.tarih ? new Date(dosyaObj.tarih) : (dosyaObj.dosya_acilis_tarihi ? new Date(dosyaObj.dosya_acilis_tarihi) : new Date());
          const diffDays = Math.ceil((tDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays > 0 && diffDays < 365) {
            baseData.teslimGun = String(diffDays);
            baseData.teslimGunu = String(diffDays);
          }
        }
        if (!baseData.teslimGun) {
          baseData.teslimGun = "7";
          baseData.teslimGunu = "7";
        }

        const baseKalemler =
          baseData.ihtiyacKalemleri &&
          Array.isArray(baseData.ihtiyacKalemleri) &&
          baseData.ihtiyacKalemleri.length > 0
            ? baseData.ihtiyacKalemleri
            : items;

        if (baseKalemler && Array.isArray(baseKalemler)) {
          let grandTotalNum = 0;

          baseData.ihtiyacKalemleri = baseKalemler.map((kalem: any, idx: number) => {
            const miktarNum = Number(kalem.miktar || 1);
            const kalemId = kalem.id || items[idx]?.id || idx + 1;
            let minPrice = Infinity;
            let bestFirmName = "";
            let winnerPrice = 0;

            const teklifler = activeFirms.map((firm: any) => {
              const bid = bids.find(
                (b: any) =>
                  (b.temin_kalem_id === kalemId || b.temin_kalem_id === kalem.siraNo || b.temin_kalem_id === idx + 1) &&
                  (b.temin_firma_id === firm.temin_firma_id || b.temin_firma_id === firm.id)
              );

              const priceNum = bid ? Number(bid.birim_fiyat || 0) : 0;
              if (priceNum > 0 && priceNum < minPrice) {
                minPrice = priceNum;
                bestFirmName = firm.unvan || "";
              }

              if (winnerFirm && (firm.id === winnerFirm.id || firm.temin_firma_id === winnerFirm.temin_firma_id) && priceNum > 0) {
                winnerPrice = priceNum;
              }

              const formattedPrice = priceNum > 0
                ? priceNum.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : "";

              const itemTotalNum = priceNum * miktarNum;
              const formattedTutar = itemTotalNum > 0
                ? itemTotalNum.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : "";

              return {
                firmaId: firm.id,
                firmaUnvan: firm.unvan,
                birimFiyat: priceNum,
                fiyat: formattedPrice,
                tutar: formattedTutar,
              };
            });

            const effectivePrice = winnerPrice > 0 ? winnerPrice : (minPrice !== Infinity ? minPrice : 0);
            const itemCostNum = effectivePrice * miktarNum;
            grandTotalNum += itemCostNum;

            return {
              ...kalem,
              id: kalemId,
              siraNo: kalem.siraNo || idx + 1,
              kodu: kalem.kodu || kalem.tasinir_kodu || items[idx]?.tasinir_kodu || "-",
              malzemeAdi: kalem.malzemeAdi || kalem.kalem_adi || items[idx]?.kalem_adi || "",
              ozelligi: kalem.ozelligi || kalem.aciklama || items[idx]?.aciklama || "",
              birimi: kalem.birimi || kalem.birim || items[idx]?.birim || "",
              miktar: miktarNum,
              enUygunFirmaAdi: bestFirmName,
              enDusukFiyat: effectivePrice > 0
                ? effectivePrice.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : "-",
              toplamBedel: itemCostNum > 0
                ? itemCostNum.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : "-",
              firmaTeklifleri: teklifler,
              firmaTeklifleriDetay: teklifler,
            };
          });

          // Build firm totals row
          const firmTotals = activeFirms.map((firm: any) => {
            let firmTotalNum = 0;
            baseData.ihtiyacKalemleri.forEach((kalem: any) => {
              const miktarNum = Number(kalem.miktar || 0);
              const tf = (kalem.firmaTeklifleriDetay || []).find(
                (t: any) => t.firmaId === firm.id || t.firmaUnvan === firm.unvan
              );
              if (tf && tf.birimFiyat > 0) {
                firmTotalNum += tf.birimFiyat * miktarNum;
              }
            });

            return {
              firmaId: firm.id,
              unvan: firm.unvan,
              toplam: firmTotalNum > 0
                ? firmTotalNum.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : "0,00",
            };
          });

          baseData.firmaToplamlari = firmTotals;
          baseData.firmaToplamlariDetay = firmTotals;

          if (winnerFirm?.teklif_toplami && Number(winnerFirm.teklif_toplami) > 0) {
            baseData.genelToplam = Number(winnerFirm.teklif_toplami).toLocaleString("tr-TR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });
          } else if (grandTotalNum > 0) {
            baseData.genelToplam = grandTotalNum.toLocaleString("tr-TR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });
          }
        }

        // 2. Fetch direct JSON Snapshot from DB if available
        let snapshotData = payloadData.savedSnapshot;
        if (activeDosyaId) {
          try {
            const dbSnap = await queryExecutor(
              `SELECT veri_json FROM DATA_DosyaSablonVeri 
               WHERE temin_dosya_id = ? AND (
                 sablon_kodu = ? 
                 OR sablon_kodu = ? 
                 OR sablon_id = (SELECT id FROM TANIM_Sablon WHERE dosya_adi = ? OR dosya_adi = ? LIMIT 1)
               )
               ORDER BY id DESC LIMIT 1`,
              [activeDosyaId, resolvedId, `${resolvedId}.html`, `${resolvedId}.html`, `${resolvedId}.html`]
            );
            if (dbSnap && dbSnap.length > 0 && dbSnap[0]?.veri_json) {
              snapshotData = JSON.parse(dbSnap[0].veri_json);
            }
          } catch (e) {
            console.error("Direct snapshot query error:", e);
          }
        }

        // 3. Overlay Saved Snapshot JSON on top of defaults (User edits are authoritative!)
        let finalData = { ...baseData };
        let activeLogoLeft = showLogoLeft;
        let activeLogoRight = showLogoRight;
        let activeOrientation: "portrait" | "landscape" = orientation;

        if (snapshotData && typeof snapshotData === "object") {
          try {
            for (const [key, val] of Object.entries(snapshotData)) {
              if (val !== undefined && val !== null) {
                finalData[key] = val;
              }
            }
            const explicitTarih = snapshotData.onayaSunulanTarih || snapshotData.tarih || snapshotData.belgeTarihi;
            if (explicitTarih) {
              finalData.tarih = explicitTarih;
              finalData.onayaSunulanTarih = explicitTarih;
              finalData.belgeTarihi = explicitTarih;
            }
            const explicitOnayTarih = snapshotData.onayTarihi || snapshotData.olurTarihi;
            if (explicitOnayTarih) {
              finalData.onayTarihi = explicitOnayTarih;
              finalData.olurTarihi = explicitOnayTarih;
            }
            if (snapshotData.showLogoLeft !== undefined) {
              activeLogoLeft = Boolean(snapshotData.showLogoLeft);
            }
            if (snapshotData.showLogoRight !== undefined) {
              activeLogoRight = Boolean(snapshotData.showLogoRight);
            }
            if (snapshotData.orientation) {
              activeOrientation = snapshotData.orientation;
            }
          } catch (e) {
            console.error("Failed to merge saved snapshot JSON", e);
          }
        }

        setLocalShowLogoLeft(activeLogoLeft);
        setLocalShowLogoRight(activeLogoRight);
        setOrientation(activeOrientation);
        setFormData(finalData);

        initialSnapshotRef.current = JSON.stringify({
          ...finalData,
          showLogoLeft: activeLogoLeft,
          showLogoRight: activeLogoRight,
          olurYazisi: finalData.olurYazisi !== false,
          orientation: activeOrientation,
        });
      } catch (err) {
        console.error("Error loading V2 template data:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadInitialData();
  }, [
    isOpen,
    activeDosyaId,
    selectedDocId,
    resolvedId,
    propInvitedFirms,
    showLogoLeft,
    showLogoRight,
    logoLeft,
    logoRight,
    institutionLogo,
    subInstitutionType,
    customSubInstitutionLabel,
    customSubInstitutionKurumumuz,
    customSubInstitutionKurumu,
    customSubInstitutionKurumlari,
  ]);

  // 2. Document Scaling Logic
  useEffect(() => {
    if (zoomMode === "manual") {
      setPreviewScale(manualZoom);
      return;
    }
    if (!previewContainerRef.current || !isOpen) return;

    const observer = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      const targetWidth = orientation === "landscape" ? 1131 : 800;
      const PADDING = 64;
      const availableWidth = width - PADDING;

      if (availableWidth > 250 && availableWidth < targetWidth) {
        setPreviewScale(availableWidth / targetWidth);
      } else {
        setPreviewScale(1);
      }
    });

    observer.observe(previewContainerRef.current);
    return () => observer.disconnect();
  }, [isOpen, selectedDocId, orientation, zoomMode, manualZoom]);

  // 3. Dropdown outside click handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDownloadOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 4. Save handler
  const handleSaveToDb = async (): Promise<void> => {
    if (!activeDosyaId || !resolvedId) return;
    setIsSaving(true);
    try {
      const dataToSave = {
        ...formData,
        showLogoLeft: localShowLogoLeft,
        showLogoRight: localShowLogoRight,
        olurYazisi: formData.olurYazisi !== false,
        orientation,
      };
      const jsonStr = JSON.stringify(dataToSave);
      const sablonRes = await window.electron.ipcRenderer.invoke(
        "db:query",
        "SELECT id FROM TANIM_Sablon WHERE dosya_adi = ? OR dosya_adi = ? LIMIT 1",
        [`${resolvedId}.html`, `${selectedDocId}.html`],
      );
      let sablonId = sablonRes?.success && sablonRes.data?.length > 0 ? sablonRes.data[0].id : null;
      if (!sablonId) {
        await window.electron.ipcRenderer.invoke(
          "db:run",
          "INSERT OR IGNORE INTO TANIM_Sablon (ad, dosya_adi, dosya_turu, icerik, kategori, aktif_mi) VALUES (?, ?, 'html', '', 'genel', 1)",
          [activeTemplateConf?.name || resolvedId, `${resolvedId}.html`],
        );
        const refetch = await window.electron.ipcRenderer.invoke(
          "db:query",
          "SELECT id FROM TANIM_Sablon WHERE dosya_adi = ? LIMIT 1",
          [`${resolvedId}.html`],
        );
        if (refetch?.success && refetch.data?.length > 0) {
          sablonId = refetch.data[0].id;
        }
      }

      // Clean up any old duplicate records for this dosya & sablon
      await window.electron.ipcRenderer.invoke(
        "db:run",
        "DELETE FROM DATA_DosyaSablonVeri WHERE temin_dosya_id = ? AND (sablon_kodu = ? OR sablon_kodu = ? OR (sablon_id IS NOT NULL AND sablon_id = ?))",
        [activeDosyaId, resolvedId, `${resolvedId}.html`, sablonId],
      );

      // Insert new authoritative JSON snapshot (using db:run so changes persist & save)
      await window.electron.ipcRenderer.invoke(
        "db:run",
        "INSERT OR REPLACE INTO DATA_DosyaSablonVeri (temin_dosya_id, sablon_id, sablon_kodu, veri_json, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)",
        [activeDosyaId, sablonId, resolvedId, jsonStr],
      );

      // Update in-memory preload cache so next opens are instantaneous
      documentPreloadService.updateCachedResolvedData(resolvedId, activeDosyaId, dataToSave);

      // Reset dirty state
      initialSnapshotRef.current = jsonStr;

      // Invalidate ready status in print queue
      usePrintQueueStore.getState().invalidateReadyStatus(activeDosyaId, resolvedId, "Belge içeriği güncellendi");
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (e) {
      console.error("Belge kaydetme hatası:", e);
    } finally {
      setIsSaving(false);
    }
  };

  // 5. HTML compiler
  const getCompiledHtml = (): string => {
    if (!ActiveComponent) return "";
    const bodyHtml = renderToString(
      React.createElement(
        TemplateEditProvider,
        {
          isEditing: false,
          personelListesi,
          firmaListesi,
          firstPageLimit: formData.firstPageLimit,
        },
        React.createElement(ActiveComponent, {
          data: {
            ...formData,
            personelListesi,
            firmaListesi,
            tarih: formData.tarih || formData.onayaSunulanTarih || "",
            onayTarihi: formData.onayTarihi || formData.dosyaTarihi || "",
            solLogo: localShowLogoLeft ? formData.solLogo : null,
            sagLogo: localShowLogoRight ? formData.sagLogo : null,
            olurYazisi: formData.olurYazisi !== false,
            orientation,
          },
          orientation,
        }),
      ),
    );

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${activeTemplateConf?.name || "Belge Önizleme"}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @page {
              size: A4 ${orientation};
              margin: 10mm;
            }
            body {
              font-family: Arial, Helvetica, sans-serif;
              color: #000;
              margin: 0;
              padding: 0;
              background-color: #fff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            @media print {
              body {
                background: white !important;
                padding: 0 !important;
              }
              .page-break {
                page-break-before: always;
              }
            }
          </style>
        </head>
        <body>
          <div class="a4-document-root ${orientation}">
            ${bodyHtml}
          </div>
        </body>
      </html>
    `;
  };

  // 6. Print handler
  const handlePrint = async (): Promise<void> => {
    setIsPrinting(true);
    try {
      const htmlContent = getCompiledHtml();
      await window.electron.ipcRenderer.invoke("app:print-html", {
        html: htmlContent,
        orientation,
      });
    } catch (e) {
      console.error("Yazdırma hatası:", e);
    } finally {
      setIsPrinting(false);
    }
  };

  // 7. PDF Export (Standardized {butceYili}-{dtNo}-{belgeAdi}.pdf)
  const handlePdf = async (): Promise<void> => {
    setIsPrinting(true);
    try {
      const htmlContent = getCompiledHtml();
      const defaultFilename = buildExportFileName({
        dosya: dosyaRecord,
        butceYili: (formData as any)?.butceYili || (formData as any)?.butce_yili || dosyaRecord?.butce_yili,
        teminNo: (formData as any)?.teminNo || (formData as any)?.temin_no || dosyaRecord?.temin_no,
        belgeAdi: activeTemplateConf?.name || "Belge",
        extension: "pdf",
      });

      try {
        const res = await window.electron.ipcRenderer.invoke("app:save-pdf-as", {
          html: htmlContent,
          orientation,
          defaultFilename,
        });
        if (res && res.success) {
          alert("PDF başarıyla kaydedildi.");
          return;
        }
      } catch {
        // Fallback: Doğrudan harici PDF oluşturucu kanalını çalıştır
        await window.electron.ipcRenderer.invoke("belge:open-pdf-external", htmlContent);
      }
    } catch (e) {
      console.error("PDF kaydetme hatası:", e);
    } finally {
      setIsPrinting(false);
      setDownloadOpen(false);
    }
  };

  // 7.1 Word (DOCX) Export (Standardized {butceYili}-{dtNo}-{belgeAdi}.docx)
  const handleDocx = async (): Promise<void> => {
    setIsPrinting(true);
    try {
      const htmlContent = getCompiledHtml();
      const defaultFilename = buildExportFileName({
        dosya: dosyaRecord,
        butceYili: (formData as any)?.butceYili || (formData as any)?.butce_yili || dosyaRecord?.butce_yili,
        teminNo: (formData as any)?.teminNo || (formData as any)?.temin_no || dosyaRecord?.temin_no,
        belgeAdi: activeTemplateConf?.name || "Belge",
        extension: "docx",
      });

      const res = await window.electron.ipcRenderer.invoke("belge:export-docx", {
        html: htmlContent,
        defaultFilename,
      });
      if (res && res.success) {
        alert("Word (DOCX) belgesi başarıyla kaydedildi.");
      }
    } catch (e) {
      console.error("Word (DOCX) kaydetme hatası:", e);
    } finally {
      setIsPrinting(false);
      setDownloadOpen(false);
    }
  };

  // 8. Open PDF in New Tab / External Viewer
  const handleOpenPdfInNewTab = async (): Promise<void> => {
    setIsPrinting(true);
    try {
      const htmlContent = getCompiledHtml();
      try {
        await window.electron.ipcRenderer.invoke("app:open-pdf-preview", {
          html: htmlContent,
          orientation,
        });
      } catch {
        // Fallback: Standart harici PDF önizleme kanalını çağır
        await window.electron.ipcRenderer.invoke("belge:open-pdf-external", htmlContent);
      }
    } catch (e) {
      console.error("PDF önizleme penceresi açılırken hata:", e);
    } finally {
      setIsPrinting(false);
      setDownloadOpen(false);
    }
  };

  // 9. Reset and refresh data from database
  const handleRefreshFromDb = async (): Promise<void> => {
    const isConfirmed = confirm(
      "Belge üzerindeki tüm verileri veritabanındaki güncel değerlerle sıfırlamak istiyor musunuz? Canlı düzenlemeleriniz kaybolabilir.",
    );
    if (!isConfirmed || !activeDosyaId) return;

    try {
      const queryExecutor = async (
        sql: string,
        params: any[],
      ): Promise<any[]> => {
        const res = await window.electron.ipcRenderer.invoke(
          "db:query",
          sql,
          params,
        );
        if (res && res.success) {
          return res.data;
        }
        return [];
      };

      const mapping = getDefaultMappingForProcess(resolvedId);
      const resolver = new TemplateResolver(queryExecutor);
      const resolved = await resolver.resolve(mapping, activeDosyaId);

      const suffixes = getInstitutionSuffixes(subInstitutionType || "belediye", {
        label: customSubInstitutionLabel,
        kurumumuz: customSubInstitutionKurumumuz,
        kurumu: customSubInstitutionKurumu,
        kurumlari: customSubInstitutionKurumlari,
      });

      setFormData({
        ...resolved,
        tarih: resolved.tarih || resolved.onayaSunulanTarih || "",
        onayTarihi: resolved.onayTarihi || resolved.dosyaTarihi || "",
        kurumumuz: suffixes.kurumumuz,
      });
    } catch (e) {
      console.error("Failed to refresh template resolution:", e);
    }
  };

  return {
    isLoading,
    activeDosyaId,
    dosyaRecord,
    selectedDocId,
    setSelectedDocId,
    resolvedId,
    templateOptions: TEMPLATE_OPTIONS,
    activeTemplateConf,
    ActiveComponent,
    formData,
    setFormData,
    personelListesi,
    firmaListesi,
    localShowLogoLeft,
    setLocalShowLogoLeft,
    localShowLogoRight,
    setLocalShowLogoRight,
    orientation,
    setOrientation,
    isEditingMode,
    setIsEditingMode,
    previewScale,
    isPrinting,
    isSaving,
    saveSuccess,
    isDirty,
    downloadOpen,
    setDownloadOpen,
    sidebarOpen,
    setSidebarOpen,
    zoomMode,
    setZoomMode,
    manualZoom,
    setManualZoom,
    isFullScreen,
    setIsFullScreen,
    previewContainerRef,
    dropdownRef,
    handleSaveToDb,
    handlePrint,
    handlePdf,
    handleDocx,
    handleOpenPdfInNewTab,
    handleRefreshFromDb,
  };
}

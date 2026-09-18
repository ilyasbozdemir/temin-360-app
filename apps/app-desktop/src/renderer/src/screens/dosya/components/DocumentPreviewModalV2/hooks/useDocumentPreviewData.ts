import { useEffect, useRef, useState } from "react";
import { IhtiyacListesiType } from "@temin360/document-templates";
import { useWorkspaceStore } from "../../../../../store/workspaceStore";
import { useSettingsStore } from "../../../../../store/settingsStore";
import { Personel } from "../types";
import {
  resolveTemplateConfig,
  TEMPLATE_OPTIONS,
} from "../templateResolver";
import { documentPreloadService } from "../../../../../services/documentPreloadService";
import {
  compileDocumentHtml,
  exportDocumentDocx,
  exportDocumentPdf,
  loadDocumentPreviewData,
  openPdfPreview,
  refreshDocumentFromDb,
  saveDocumentToDb,
  useDocumentPreviewScale,
  UseDocumentPreviewDataParams,
} from "./helpers";

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
    !isLoading,
  );

  // Auto-scale calculation using custom hook
  const previewScale = useDocumentPreviewScale({
    isOpen,
    orientation,
    zoomMode,
    manualZoom,
    previewContainerRef,
  });

  // Load preview data from DB & IPC
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
        const result = await loadDocumentPreviewData({
          activeDosyaId,
          resolvedId,
          selectedDocId,
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
        });

        if (!isMounted) return;

        setDosyaRecord(result.dosyaRecord);
        setPersonelListesi(result.personelListesi);
        setFirmaListesi(result.firmaListesi);
        setLocalShowLogoLeft(result.activeLogoLeft);
        setLocalShowLogoRight(result.activeLogoRight);
        setOrientation(result.activeOrientation);
        setFormData(result.finalData);
        initialSnapshotRef.current = result.initialSnapshotJson;
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

  // Dropdown outside click handler
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

  // Save handler
  const handleSaveToDb = async (): Promise<void> => {
    if (!activeDosyaId || !resolvedId) return;
    setIsSaving(true);
    try {
      const jsonStr = await saveDocumentToDb({
        activeDosyaId,
        resolvedId,
        selectedDocId,
        activeTemplateConf,
        formData,
        localShowLogoLeft,
        localShowLogoRight,
        logoLeft,
        logoRight,
        institutionLogo,
        orientation,
      });

      if (jsonStr) {
        initialSnapshotRef.current = jsonStr;
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (e) {
      console.error("Belge kaydetme hatası:", e);
    } finally {
      setIsSaving(false);
    }
  };

  // HTML compiler helper
  const getCompiledHtml = (): string => {
    return compileDocumentHtml({
      ActiveComponent,
      activeTemplateConf,
      formData,
      personelListesi,
      firmaListesi,
      localShowLogoLeft,
      localShowLogoRight,
      logoLeft,
      logoRight,
      institutionLogo,
      orientation,
    });
  };

  // Print handler
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

  // PDF Export
  const handlePdf = async (): Promise<void> => {
    setIsPrinting(true);
    try {
      const htmlContent = getCompiledHtml();
      await exportDocumentPdf({
        htmlContent,
        orientation,
        dosyaRecord,
        formData,
        activeTemplateConf,
      });
    } catch (e) {
      console.error("PDF kaydetme hatası:", e);
    } finally {
      setIsPrinting(false);
      setDownloadOpen(false);
    }
  };

  // Word (DOCX) Export
  const handleDocx = async (): Promise<void> => {
    setIsPrinting(true);
    try {
      const htmlContent = getCompiledHtml();
      await exportDocumentDocx({
        htmlContent,
        dosyaRecord,
        formData,
        activeTemplateConf,
      });
    } catch (e) {
      console.error("Word (DOCX) kaydetme hatası:", e);
    } finally {
      setIsPrinting(false);
      setDownloadOpen(false);
    }
  };

  // Open PDF in New Tab / External Viewer
  const handleOpenPdfInNewTab = async (): Promise<void> => {
    setIsPrinting(true);
    try {
      const htmlContent = getCompiledHtml();
      await openPdfPreview({
        htmlContent,
        orientation,
      });
    } catch (e) {
      console.error("PDF önizleme penceresi açılırken hata:", e);
    } finally {
      setIsPrinting(false);
      setDownloadOpen(false);
    }
  };

  // Reset and refresh data from database
  const handleRefreshFromDb = async (): Promise<void> => {
    const isConfirmed = confirm(
      "Belge üzerindeki tüm verileri veritabanındaki güncel değerlerle sıfırlamak istiyor musunuz? Canlı düzenlemeleriniz kaybolabilir.",
    );
    if (!isConfirmed || !activeDosyaId || !resolvedId) return;

    try {
      setIsLoading(true);
      const baseData = await refreshDocumentFromDb({
        activeDosyaId,
        resolvedId,
      });

      if (baseData) {
        setFormData(baseData);
        initialSnapshotRef.current = JSON.stringify({
          ...baseData,
          showLogoLeft: localShowLogoLeft,
          showLogoRight: localShowLogoRight,
          olurYazisi: baseData.olurYazisi !== false,
          orientation,
        });
      }
    } catch (e) {
      console.error("Failed to refresh template resolution:", e);
    } finally {
      setIsLoading(false);
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

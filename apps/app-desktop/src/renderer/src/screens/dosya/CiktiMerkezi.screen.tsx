import React, { useCallback, useMemo, useState } from "react";
import { SubScreen } from "./SubScreens.screen";
import {
  AlertCircle,
  CheckCircle2,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Layers,
  Loader2,
  Lock,
  Printer,
  RefreshCw,
  Sparkles,
  Square,
  Unlock,
} from "lucide-react";
import { useWorkspaceStore } from "../../store/workspaceStore";
import Mustache from "mustache";
import { Sablon } from "../sablonlar/sablonlar.hooks";
import { useCiktiMerkeziData } from "./CiktiMerkezi.hooks";
import { useDocumentLogger } from "../../hooks/useDocumentLogger";
import { useRouterState } from "@tanstack/react-router";
import { TekTikYazdirModal } from "./components/TekTikYazdirModal";
import { PrintManagerModal } from "./components/PrintManagerModal";
import { SABLON_DOSYAADI_KATEGORI } from "../../constants/sablonKategorileri";
import { BelgeAksiyonlari } from "../../components/ui/BelgeAksiyonlari";
import { CiktiPresetManager } from "./components/CiktiPresetManager";
import { CiktiSidebar } from "./components/CiktiSidebar";
import { CiktiPreviewModal } from "./components/CiktiPreviewModal";
import { buildExportFileName, buildBatchZipFileName } from "../../utils/exportFileName";
import {
  usePrintQueueStore,
  CURRENT_APP_VERSION,
  PrintSettings,
} from "../../store/printQueueStore";
import { useGlobalDocumentPreviewStore } from "../../store/globalDocumentPreviewStore";
import { exportDogrudanTeminMasterExcel } from "../../services/excelExportService";

const normalizeForMatch = (str: string) => {
  return str
    .toLocaleLowerCase("tr-TR")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/i̇/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]/g, "");
};

const getSablonGroup = (sablon: Sablon): string => {
  if (sablon.kategori) return sablon.kategori;
  const dosyaAdiNoExt = (sablon.dosya_adi || "").replace(/\.html$/, "");
  return SABLON_DOSYAADI_KATEGORI[dosyaAdiNoExt] || "Genel";
};

export function CiktiMerkeziScreen(): React.JSX.Element {
  const { activeDosyaId, activeStarredDocs, setActiveStarredDocs } =
    useWorkspaceStore();
  const {
    sablons,
    loading,
    masterHtml,
    dosyaContext,
    activeDosya,
    contextsByPath,
  } = useCiktiMerkeziData(activeDosyaId);
  const { logDocument } = useDocumentLogger();
  const {
    getReadyCountForDosya,
    getPrintedCountForDosya,
    getDocumentStatus,
    toggleReadyToPrint,
    markAsPrinted,
    isDocumentLocked,
    getDocumentLockInfo,
    unlockDocument,
  } = usePrintQueueStore();
  const { openDocument } = useGlobalDocumentPreviewStore();

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [processing, setProcessing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  );
  const [previewSablon, setPreviewSablon] = useState<Sablon | null>(null);
  const [isPrintManagerOpen, setIsPrintManagerOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "ready" | "starred" | "printed"
  >("all");

  const readyCount = getReadyCountForDosya(activeDosyaId);
  const printedCount = getPrintedCountForDosya(activeDosyaId);
  const [toast, setToast] = useState<
    {
      message: string;
      type: "success" | "error" | "warning";
    } | null
  >(null);

  const showToast = useCallback(
    (message: string, type: "success" | "error" | "warning" = "success") => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 4000);
    },
    [],
  );

  const router = useRouterState();
  const searchSablonAd = (router.location.search as any)?.sablonAd;

  interface DocumentPreset {
    id: string;
    name: string;
    docs: string[];
  }

  const [presets, setPresets] = useState<DocumentPreset[]>(() => {
    try {
      const saved = localStorage.getItem("dta_document_presets");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [activePresetId, setActivePresetId] = useState<string>("");

  const handleSelectPreset = (presetId: string): void => {
    setActivePresetId(presetId);
    if (!presetId) {
      setSelectedIds(new Set());
      return;
    }
    const preset = presets.find((p) => p.id === presetId);
    if (preset) {
      const ids = new Set<number>();
      sablons.forEach((s) => {
        if (
          preset.docs.some((docAd) =>
            normalizeForMatch(docAd) === normalizeForMatch(s.ad)
          )
        ) {
          ids.add(s.id);
        }
      });
      setSelectedIds(ids);
      showToast(
        `'${preset.name}' paketi seçildi. (${ids.size} belge)`,
        "success",
      );
    }
  };

  const handleSavePreset = (): void => {
    if (selectedIds.size === 0) {
      showToast(
        "Lütfen paket oluşturmak için önce en az bir belge seçin.",
        "warning",
      );
      return;
    }
    const name = prompt("Lütfen bu belge paketi taslağı için bir isim girin:");
    if (!name || name.trim() === "") return;

    const selectedDocs = sablons.filter((s) => selectedIds.has(s.id)).map((s) =>
      s.ad
    );
    const newPreset: DocumentPreset = {
      id: Date.now().toString(),
      name: name.trim(),
      docs: selectedDocs,
    };
    const updated = [...presets, newPreset];
    setPresets(updated);
    localStorage.setItem("dta_document_presets", JSON.stringify(updated));
    setActivePresetId(newPreset.id);
    showToast(`'${newPreset.name}' paketi kaydedildi.`, "success");
  };

  const handleDeletePreset = (presetId: string, e: React.MouseEvent): void => {
    e.stopPropagation();
    const preset = presets.find((p) => p.id === presetId);
    if (!preset) return;
    if (
      !confirm(`'${preset.name}' paketini silmek istediğinize emin misiniz?`)
    ) {
      return;
    }

    const updated = presets.filter((p) => p.id !== presetId);
    setPresets(updated);
    localStorage.setItem("dta_document_presets", JSON.stringify(updated));
    if (activePresetId === presetId) {
      setActivePresetId("");
      setSelectedIds(new Set());
    }
    showToast(`'${preset.name}' paketi silindi.`, "success");
  };

  // localStarredDocs artık global store'dan geliyor; DB'deki starred_docs ile sync
  React.useEffect(() => {
    if (activeDosya?.starred_docs) {
      try {
        const docs = JSON.parse(activeDosya.starred_docs);
        setActiveStarredDocs(docs);
      } catch (_e) {
        setActiveStarredDocs([]);
      }
    } else {
      setActiveStarredDocs([]);
    }
  }, [activeDosya?.starred_docs, setActiveStarredDocs]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (activeDosyaId) {
        const res = await window.electron.ipcRenderer.invoke(
          "db:query",
          "SELECT starred_docs FROM DATA_TeminDosyasi WHERE id = ?",
          [activeDosyaId],
        );
        if (res.success && res.data.length > 0) {
          try {
            const docs = JSON.parse(res.data[0].starred_docs || "[]");
            setActiveStarredDocs(docs);
          } catch (_e) {
            /* noop */
          }
        }
      }
    } finally {
      setRefreshing(false);
    }
  }, [activeDosyaId, setActiveStarredDocs]);

  React.useEffect(() => {
    const onStarredChanged = () => {
      handleRefresh();
    };
    window.addEventListener("global_starred_changed", onStarredChanged);
    return () => {
      window.removeEventListener("global_starred_changed", onStarredChanged);
    };
  }, [handleRefresh]);

  React.useEffect(() => {
    if (searchSablonAd && sablons.length > 0) {
      const found = sablons.find(
        (s) => normalizeForMatch(s.ad) === normalizeForMatch(searchSablonAd),
      );
      if (found && !selectedIds.has(found.id)) {
        setSelectedIds((prev) => new Set([...prev, found.id]));
        const cat = getSablonGroup(found);
        setExpandedCategories((prev) => new Set([...prev, cat]));
      }
    }
  }, [searchSablonAd, sablons]);

  const toggleCategory = (kategori: string) => {
    const newSet = new Set(expandedCategories);
    if (newSet.has(kategori)) {
      newSet.delete(kategori);
    } else {
      newSet.add(kategori);
    }
    setExpandedCategories(newSet);
  };

  const toggleAllCategories = () => {
    const allCats = Object.keys(groupedSablons);
    const allExpanded = allCats.every((cat) => expandedCategories.has(cat));
    if (allExpanded) {
      setExpandedCategories(new Set());
    } else {
      setExpandedCategories(new Set(allCats));
    }
  };

  const toggleStar = async (sablonAd: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!activeDosyaId) return;

    const existingIdx = activeStarredDocs.findIndex(
      (d) => normalizeForMatch(d) === normalizeForMatch(sablonAd),
    );
    const newDocs = [...activeStarredDocs];

    if (existingIdx >= 0) {
      newDocs.splice(existingIdx, 1);
    } else {
      newDocs.push(sablonAd);
    }

    setActiveStarredDocs(newDocs); // Instantly update global store
    await window.electron.ipcRenderer.invoke(
      "db:run",
      "UPDATE DATA_TeminDosyasi SET starred_docs = ? WHERE id = ?",
      [JSON.stringify(newDocs), activeDosyaId],
    );
  };

  const groupedSablons = useMemo((): Record<string, Sablon[]> => {
    const groups: Record<string, Sablon[]> = {};
    
    // Filter sablons based on statusFilter
    const filteredSablons = sablons.filter((s) => {
      const docKey = (s.dosya_adi || "").replace(/\.html$/, "");
      const st = activeDosyaId ? getDocumentStatus(activeDosyaId, docKey) : "draft";

      if (statusFilter === "ready") {
        return st === "ready_to_print";
      }
      if (statusFilter === "printed") {
        return st === "printed";
      }
      if (statusFilter === "starred") {
        return activeStarredDocs.some(
          (d) => normalizeForMatch(d) === normalizeForMatch(s.ad),
        );
      }
      return true;
    });

    filteredSablons.forEach((s) => {
      const cat = getSablonGroup(s);
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(s);
    });
    return groups;
  }, [sablons, statusFilter, activeDosyaId, getDocumentStatus, activeStarredDocs]);

  const toggleGroup = (cat: string) => {
    const groupItems = groupedSablons[cat] || [];
    const groupIds = groupItems.map((s) => s.id);
    const validIds = groupIds.filter(
      (id) => !getMissingRequirement(sablons.find((s) => s.id === id)!),
    );
    const allSelected = validIds.every((id) => selectedIds.has(id));
    const newSet = new Set(selectedIds);

    if (allSelected) {
      validIds.forEach((id) => newSet.delete(id));
    } else {
      validIds.forEach((id) => newSet.add(id));
    }
    setSelectedIds(newSet);
  };

  const getMissingRequirement = (sablon: Sablon): string | null => {
    if (!sablon) return null;
    if (
      sablon.icerik.includes("{{#kalemler}}") &&
      (!dosyaContext.kalemler || dosyaContext.kalemler.length === 0)
    ) {
      return "İhtiyaç listesinde (malzeme kalemi) tanımlanmamış.";
    }
    if (
      sablon.icerik.includes("{{#firmalar}}") &&
      (!dosyaContext.firmalar || dosyaContext.firmalar.length === 0)
    ) {
      return "Dosyaya yüklenici/davetli firma eklenmemiş.";
    }
    if (
      sablon.icerik.includes("{{#komisyon_uyeleri}}") &&
      (!dosyaContext.komisyon_uyeleri ||
        dosyaContext.komisyon_uyeleri.length === 0)
    ) {
      return "İlgili komisyon üyeleri belirlenmemiş.";
    }
    return null;
  };

  const toggleSelect = (id: number) => {
    const sablon = sablons.find((s) => s.id === id);
    if (sablon && getMissingRequirement(sablon)) return; // Block selection if missing requirement

    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const renderHtml = (sablon: Sablon) => {
    try {
      if (!masterHtml) return sablon.icerik;

      const processContext = contextsByPath?.[sablon.route_path || ""] ||
        dosyaContext;
      const templateContext = { ...processContext };

      const renderedContent = Mustache.render(sablon.icerik, templateContext);
      templateContext.icerik = renderedContent;
      return Mustache.render(masterHtml, templateContext);
    } catch (error) {
      console.error("Template render hatası:", error);
      return sablon.icerik;
    }
  };

  const handleAction = async (
    action: "pdf" | "udf" | "docx" | "print" | "zip" | "excel",
    specificIds?: number[],
  ) => {
    if (action === "excel") {
      setProcessing(true);
      try {
        const kalemlerRes = await window.electron.ipcRenderer.invoke(
          "db:query",
          "SELECT * FROM DATA_TeminKalem WHERE temin_dosya_id = ?",
          [activeDosyaId],
        );
        const firmalarRes = await window.electron.ipcRenderer.invoke(
          "db:query",
          `SELECT f.*, tf.durum as teklif_durumu, tf.toplam_teklif 
           FROM DATA_TeminFirma tf 
           JOIN TANIM_Firma f ON tf.firma_id = f.id 
           WHERE tf.temin_dosya_id = ?`,
          [activeDosyaId],
        );
        const tekliflerRes = await window.electron.ipcRenderer.invoke(
          "db:query",
          "SELECT * FROM DATA_TeminKalemTeklif WHERE temin_dosya_id = ?",
          [activeDosyaId],
        );
        const komisyonRes = await window.electron.ipcRenderer.invoke(
          "db:query",
          "SELECT * FROM DATA_TeminKomisyon WHERE temin_dosya_id = ?",
          [activeDosyaId],
        );
        const kurumRes = await window.electron.ipcRenderer.invoke(
          "db:query",
          "SELECT * FROM TANIM_Kurum LIMIT 1",
        );

        await exportDogrudanTeminMasterExcel({
          dosya: activeDosya,
          kalemler: kalemlerRes.success ? kalemlerRes.data : [],
          firmalar: firmalarRes.success ? firmalarRes.data : [],
          teklifler: tekliflerRes.success ? tekliflerRes.data : [],
          komisyon: komisyonRes.success ? komisyonRes.data : [],
          kurum: kurumRes.success ? kurumRes.data?.[0] : null,
          sablons: sablons,
        });

        showToast("Master Excel raporu başarıyla indirildi.", "success");
      } catch (err: any) {
        showToast("Master Excel hazırlanırken hata: " + err.message, "error");
      } finally {
        setProcessing(false);
      }
      return;
    }

    const targetIds = specificIds ? new Set(specificIds) : selectedIds;

    if (targetIds.size === 0) {
      showToast("Lütfen en az bir belge seçin.", "warning");
      return;
    }

    setProcessing(true);
    try {
      const selectedSablons = sablons.filter((s) => targetIds.has(s.id));

      if (action === "zip") {
        const zipFiles: Array<{
          name: string;
          html: string;
          format: "pdf" | "docx" | "udf";
        }> = [];

        for (const sablon of selectedSablons) {
          const html = renderHtml(sablon);
          const pdfFileName = buildExportFileName({
            dosya: activeDosya,
            belgeAdi: sablon.ad,
            extension: "pdf",
          });
          const docxFileName = buildExportFileName({
            dosya: activeDosya,
            belgeAdi: sablon.ad,
            extension: "docx",
          });

          zipFiles.push({
            name: pdfFileName,
            html: String(html || ""),
            format: "pdf",
          });
          zipFiles.push({
            name: docxFileName,
            html: String(html || ""),
            format: "docx",
          });
        }

        const defaultZipName = buildBatchZipFileName({
          dosya: activeDosya,
          customSuffix: "Tum_Belgeler",
        });

        const res = await window.electron.ipcRenderer.invoke(
          "belge:export-zip",
          {
            fileName: defaultZipName,
            files: zipFiles,
          },
        );

        if (res && res.success && !res.canceled) {
          await logDocument("Toplu Belge Paketi", defaultZipName);
          showToast(
            `ZIP arşivi başarıyla kaydedildi (${selectedSablons.length} belge).`,
            "success",
          );
        }
        return;
      }

      for (const sablon of selectedSablons) {
        const html = renderHtml(sablon);
        const fileNameWithExt = buildExportFileName({
          dosya: activeDosya,
          belgeAdi: sablon.ad,
          extension: action === "print" ? "pdf" : action,
        });
        const fileBase = fileNameWithExt.replace(/\.[^.]+$/, "");
        const docKey = (sablon.dosya_adi || "").replace(/\.html$/, "");

        if (action === "pdf") {
          await window.electron.ipcRenderer.invoke(
            "export-pdf",
            html,
            null,
            fileBase,
          );
          await logDocument(sablon.ad, `${fileBase}.pdf`);
        } else if (action === "udf") {
          await window.electron.ipcRenderer.invoke(
            "export-udf",
            html,
            fileBase,
          );
          await logDocument(sablon.ad, `${fileBase}.udf`);
        } else if (action === "docx") {
          await window.electron.ipcRenderer.invoke(
            "export-docx",
            html,
            fileBase,
          );
          await logDocument(sablon.ad, `${fileBase}.docx`);
        } else if (action === "print") {
          await window.electron.ipcRenderer.invoke("print-html", html, {
            silent: true,
          }); // Silent true for batch printing
          await logDocument(sablon.ad, "Yazdırıldı");
          if (activeDosyaId) {
            markAsPrinted(activeDosyaId, docKey);
          }
        }
      }

      if (action === "print") {
        setIsPrintManagerOpen(false);
        showToast(
          "Belgeler başarıyla yazdırıldı ve 'Yazdırıldı' olarak işaretlendi.",
          "success",
        );
      } else {
        showToast("Belgeler başarıyla oluşturuldu ve kaydedildi.", "success");
      }
    } catch (error: any) {
      showToast(`İşlem sırasında hata oluştu: ${error.message}`, "error");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <SubScreen
      title="Çıktı & Yazdırma Merkezi"
      icon={Printer}
      description="Dosya gereksinimlerine uygun resmi evrakların tek merkezden toplu üretimi ve yazdırılması."
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col md:flex-row min-h-[500px] mt-4 overflow-hidden">
        {/* SOL: BELGE LİSTESİ */}
        <div className="flex-1 p-6 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-500" />
              Dosya Belgeleri
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg text-slate-600 dark:text-slate-400 font-semibold">
                {selectedIds.size} Seçili
              </span>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-blue-600 hover:border-blue-300 transition-all"
                title="Hızlı Erişim listesini yenile"
              >
                <RefreshCw
                  className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                />
              </button>
              <button
                onClick={toggleAllCategories}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-blue-600 hover:border-blue-300 transition-all text-xs font-bold flex items-center gap-1"
                title="Tüm Grupları Aç / Kapat"
              >
                {Object.keys(groupedSablons).every((cat) =>
                    expandedCategories.has(cat)
                  )
                  ? "Hepsini Kapat"
                  : "Hepsini Aç"}
              </button>
            </div>
          </div>

          {/* DURUM FİLTRELEME SEKMELERİ */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 dark:bg-slate-800/60 rounded-2xl mb-4 text-xs font-semibold overflow-x-auto border border-slate-200/60 dark:border-slate-800">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
                statusFilter === "all"
                  ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-blue-500" />
              Tüm Belgeler
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300">
                {sablons.length}
              </span>
            </button>

            <button
              onClick={() => setStatusFilter("ready")}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
                statusFilter === "ready"
                  ? "bg-emerald-500 text-white shadow-xs font-bold"
                  : "text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Yazdırmaya Hazır
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  statusFilter === "ready"
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300"
                }`}
              >
                {readyCount}
              </span>
            </button>

            <button
              onClick={() => setStatusFilter("starred")}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
                statusFilter === "starred"
                  ? "bg-amber-500 text-white shadow-xs font-bold"
                  : "text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40"
              }`}
            >
              <span>⭐</span>
              Hızlı Erişim
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  statusFilter === "starred"
                    ? "bg-amber-600 text-white"
                    : "bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300"
                }`}
              >
                {activeStarredDocs.length}
              </span>
            </button>

            <button
              onClick={() => setStatusFilter("printed")}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
                statusFilter === "printed"
                  ? "bg-blue-600 text-white shadow-xs font-bold"
                  : "text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40"
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              Yazdırılanlar
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  statusFilter === "printed"
                    ? "bg-blue-700 text-white"
                    : "bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300"
                }`}
              >
                {printedCount}
              </span>
            </button>
          </div>

          {/* BELGE PAKETLERİ VE TASLAKLAR */}
          <CiktiPresetManager
            presets={presets}
            activePresetId={activePresetId}
            selectedIdsSize={selectedIds.size}
            onSelectPreset={handleSelectPreset}
            onSavePreset={handleSavePreset}
            onDeletePreset={handleDeletePreset}
          />

          {loading
            ? (
              <div className="flex-1 flex items-center justify-center text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            )
            : (
              <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar">
                {Object.keys(groupedSablons).length === 0 && (
                  <div className="py-12 text-center text-slate-400 text-sm">
                    {statusFilter === "ready" && "Yazdırmaya hazır olarak işaretlenmiş belge bulunamadı."}
                    {statusFilter === "starred" && "Hızlı erişim için yıldızlanmış belge bulunamadı."}
                    {statusFilter === "printed" && "Bu dosyada henüz yazdırılan belge bulunamadı."}
                    {statusFilter === "all" && "Kayıtlı belge şablonu bulunamadı."}
                  </div>
                )}
                {Object.entries(groupedSablons).map(([kategori, items]) => {
                  const isExpanded = expandedCategories.has(kategori);
                  return (
                    <div key={kategori} className="space-y-2">
                      <div
                        className="flex items-center justify-between px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg cursor-pointer transition-colors"
                        onClick={() => toggleCategory(kategori)}
                      >
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleGroup(kategori);
                            }}
                            className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                          >
                            {items
                                .filter((i) => !getMissingRequirement(i))
                                .every((i) => selectedIds.has(i.id))
                              ? (
                                <CheckSquare className="w-4 h-4 text-blue-600" />
                              )
                              : <Square className="w-4 h-4 text-slate-400" />}
                          </button>
                          <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            {kategori} ({items.length})
                          </h4>
                        </div>
                        <div>
                          {isExpanded
                            ? <ChevronDown className="w-4 h-4 text-slate-400" />
                            : (
                              <ChevronRight className="w-4 h-4 text-slate-400" />
                            )}
                        </div>
                      </div>
                      {isExpanded && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-4">
                          {items.map((sablon) => {
                            const missingMsg = getMissingRequirement(sablon);
                            const docKey = (sablon.dosya_adi || "").replace(/\.html$/, "");
                            const docStatus = activeDosyaId
                              ? getDocumentStatus(activeDosyaId, docKey)
                              : "draft";
                            const isLocked = activeDosyaId
                              ? isDocumentLocked(activeDosyaId, docKey)
                              : false;
                            const lockInfo = activeDosyaId
                              ? getDocumentLockInfo(activeDosyaId, docKey)
                              : null;

                            return (
                              <div
                                key={`cikti_${sablon.id}_${docKey}`}
                                onClick={() => toggleSelect(sablon.id)}
                                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                                  missingMsg
                                    ? "bg-slate-50 border-slate-200 opacity-70 cursor-not-allowed dark:bg-slate-900 dark:border-slate-800"
                                    : selectedIds.has(sablon.id)
                                    ? "bg-blue-50/50 border-blue-200 text-blue-800 cursor-pointer dark:bg-blue-900/20 dark:border-blue-800/50 dark:text-blue-300"
                                    : "bg-white border-slate-200 text-slate-700 cursor-pointer hover:border-blue-300 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-300 dark:hover:border-slate-700"
                                }`}
                              >
                                <div className="shrink-0">
                                  {missingMsg
                                    ? (
                                      <span title={missingMsg ?? undefined}>
                                        <AlertCircle className="w-4 h-4 text-rose-500" />
                                      </span>
                                    )
                                    : selectedIds.has(sablon.id)
                                    ? (
                                      <CheckSquare className="w-4 h-4 text-blue-600" />
                                    )
                                    : (
                                      <Square className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                                    )}
                                </div>
                                <div
                                  className="flex-1 min-w-0"
                                  title={missingMsg || sablon.ad}
                                >
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <p
                                      className={`text-xs font-bold truncate ${
                                        missingMsg
                                          ? "text-slate-500 line-through"
                                          : ""
                                      }`}
                                    >
                                      {sablon.ad}
                                    </p>
                                    {isLocked && (
                                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300/50">
                                        <Lock className="w-2.5 h-2.5 text-amber-500" /> {lockInfo?.lockedAtVersion || CURRENT_APP_VERSION} Kilitli
                                      </span>
                                    )}
                                    {!isLocked && docStatus === "ready_to_print" && (
                                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300/50">
                                        <CheckCircle2 className="w-2.5 h-2.5" /> Hazır
                                      </span>
                                    )}
                                    {!isLocked && docStatus === "modified" && (
                                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300/50">
                                        Kontrol Bekliyor
                                      </span>
                                    )}
                                    {!isLocked && docStatus === "printed" && (
                                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-300/50">
                                        <Printer className="w-2.5 h-2.5" /> Yazdırıldı
                                      </span>
                                    )}
                                  </div>
                                  <p
                                    className="text-[10px] text-slate-500 truncate mt-0.5"
                                    title={sablon.dosya_adi}
                                  >
                                    {sablon.dosya_adi}
                                  </p>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  {isLocked && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (
                                          confirm(
                                            `"${sablon.ad}" belgesinin yazdırma kilidini açmak ve yeniden düzenlemeye izin vermek istiyor musunuz?`
                                          )
                                        ) {
                                          if (activeDosyaId) {
                                            unlockDocument(activeDosyaId, docKey);
                                          }
                                        }
                                      }}
                                      className="p-1 rounded-lg border text-amber-500 hover:text-amber-700 border-amber-200 dark:border-amber-800"
                                      title="Yazdırma Kilidini Aç"
                                    >
                                      <Unlock className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  {/* Quick toggle ready to print button */}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (activeDosyaId) {
                                        toggleReadyToPrint(activeDosyaId, docKey, sablon.ad);
                                      }
                                    }}
                                    className={`p-1 rounded-lg border transition-all ${
                                      docStatus === "ready_to_print"
                                        ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/60 dark:border-emerald-800 hover:bg-emerald-100"
                                        : "text-slate-400 hover:text-emerald-600 hover:border-emerald-300 border-slate-200 dark:border-slate-800"
                                    }`}
                                    title={
                                      docStatus === "ready_to_print"
                                        ? "Yazdırmaya hazır işaretini kaldır"
                                        : "Yazdırmaya hazır olarak işaretle"
                                    }
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                  </button>

                                  <BelgeAksiyonlari
                                    onPreview={() => setPreviewSablon(sablon)}
                                    onQuickPrint={() =>
                                      handleAction("print", [sablon.id])}
                                    onExport={(fmt) =>
                                      handleAction(fmt, [sablon.id])}
                                    docName={sablon.ad}
                                    onOpenExternal={async () => {
                                      const processCtx =
                                        contextsByPath
                                          ?.[sablon.route_path || ""] ||
                                        dosyaContext;
                                      const eksikAlanlar: string[] = [];
                                      const doluAlanlar: string[] = [];
                                      for (
                                        const [key, value] of Object.entries(
                                          processCtx,
                                        )
                                      ) {
                                        if (
                                          key === "icerik" ||
                                          key.startsWith("_")
                                        ) continue;
                                        if (
                                          typeof value === "string" &&
                                          value.includes("[Belirtilmedi:")
                                        ) {
                                          const match = value.match(
                                            /\[Belirtilmedi:\s*(.+?)\]/,
                                          );
                                          eksikAlanlar.push(
                                            match ? match[1] : key,
                                          );
                                        } else if (Array.isArray(value)) {
                                          if (value.length > 0) {
                                            doluAlanlar.push(key);
                                          }
                                        } else if (
                                          value !== null &&
                                          value !== undefined &&
                                          value !== ""
                                        ) {
                                          doluAlanlar.push(key);
                                        }
                                      }
                                      if (eksikAlanlar.length > 0) {
                                        const maxGoster = 12;
                                        const eksikListesi = eksikAlanlar
                                          .slice(0, maxGoster)
                                          .map((m) => `  • ${m}`)
                                          .join("\n");
                                        const fazla =
                                          eksikAlanlar.length > maxGoster
                                            ? `\n  ... ve ${
                                              eksikAlanlar.length - maxGoster
                                            } alan daha`
                                            : "";
                                        const devam = confirm(
                                          `⚠️ ${eksikAlanlar.length} alan eksik / belirtilmemiş:\n\n${eksikListesi}${fazla}\n\n✅ ${doluAlanlar.length} alan dolu.\n\nYine de PDF olarak açmak istiyor musunuz?`,
                                        );
                                        if (!devam) return;
                                      }
                                      const html = renderHtml(sablon);
                                      if (html) {
                                        await window.electron.ipcRenderer
                                          .invoke(
                                            "open-pdf-external",
                                            html,
                                          );
                                      }
                                    }}
                                    disabled={!!missingMsg}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
        </div>

        {/* SAĞ: İŞLEM MENÜSÜ */}
        <CiktiSidebar
          selectedCount={selectedIds.size}
          processing={processing}
          hasStarredDocs={activeStarredDocs.length > 0}
          onPrintClick={() => setIsPrintManagerOpen(true)}
          onDownloadClick={(action) => handleAction(action)}
        />
      </div>

      {/* ÖNİZLEME MODALI */}
      {previewSablon && (
        <CiktiPreviewModal
          previewSablon={previewSablon}
          activeStarredDocs={activeStarredDocs}
          onClose={() => setPreviewSablon(null)}
          onToggleStar={toggleStar}
          srcDoc={renderHtml(previewSablon)}
          onPrintSingle={async (id) => {
            await handleAction("print", [id]);
          }}
          onOpenAdvancedEditor={(sab) => {
            setPreviewSablon(null);
            const key = (sab.dosya_adi || "").replace(/\.html$/, "");
            openDocument({
              documentId: key,
              dosyaId: activeDosyaId || undefined,
              documentTitle: sab.ad,
            });
          }}
        />
      )}

      <TekTikYazdirModal
        isOpen={isPrintManagerOpen}
        onClose={() => setIsPrintManagerOpen(false)}
        sablons={sablons}
        activeDosya={activeDosya}
        activeStarredDocs={activeStarredDocs}
        initialSelectedIds={Array.from(selectedIds)}
        renderHtml={renderHtml}
        onExecutePrint={async (selected, action, settings) => {
          await handleAction(action, selected.map((s) => s.id));
        }}
        getMissingRequirement={getMissingRequirement}
        normalizeForMatch={normalizeForMatch}
      />

      {toast && (
        <div
          className={`fixed bottom-6 right-6 px-4 py-3 rounded-2xl shadow-xl border backdrop-blur-md text-sm flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 z-[9999] transition-all duration-300 ${
            toast.type === "success"
              ? "bg-emerald-50/90 border-emerald-200 text-emerald-800 dark:bg-emerald-950/90 dark:border-emerald-800 dark:text-emerald-300"
              : toast.type === "warning"
              ? "bg-amber-50/90 border-amber-200 text-amber-800 dark:bg-amber-950/90 dark:border-amber-800 dark:text-amber-300"
              : "bg-rose-50/90 border-rose-200 text-rose-800 dark:bg-rose-950/90 dark:border-rose-800 dark:text-rose-300"
          }`}
        >
          {toast.type === "success"
            ? <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
            : toast.type === "warning"
            ? <AlertCircle className="w-5 h-5 shrink-0 text-amber-500" />
            : <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />}
          <div className="font-semibold">{toast.message}</div>
        </div>
      )}
    </SubScreen>
  );
}

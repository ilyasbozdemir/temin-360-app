import React, { useCallback, useMemo, useState } from "react";
import { SubScreen } from "./SubScreens.screen";
import {
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Layers,
  Loader2,
  Printer,
  RefreshCw,
  Square,
} from "lucide-react";
import { useWorkspaceStore } from "../../store/workspaceStore";
import Mustache from "mustache";
import { Sablon } from "../sablonlar/sablonlar.hooks";
import { useCiktiMerkeziData } from "./CiktiMerkezi.hooks";
import { useDocumentLogger } from "../../hooks/useDocumentLogger";
import { useRouterState } from "@tanstack/react-router";
import { TekTikYazdirModal } from "./components/TekTikYazdirModal";
import { SABLON_DOSYAADI_KATEGORI } from "../../constants/sablonKategorileri";
import { CiktiPresetManager } from "./components/CiktiPresetManager";
import { CiktiSidebar } from "./components/CiktiSidebar";
import { CiktiStatusFilterTabs, StatusFilterType } from "./components/CiktiStatusFilterTabs";
import { CiktiBelgeCard } from "./components/CiktiBelgeCard";
import { CiktiToast, ToastInfo } from "./components/CiktiToast";
import {
  buildBatchZipFileName,
  buildExportFileName,
} from "../../utils/exportFileName";
import { usePrintQueueStore } from "../../store/printQueueStore";
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

interface DocumentPreset {
  id: string;
  name: string;
  docs: string[];
}

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
    new Set()
  );

  const [isPrintManagerOpen, setIsPrintManagerOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>("all");

  const readyCount = getReadyCountForDosya(activeDosyaId);
  const printedCount = getPrintedCountForDosya(activeDosyaId);
  const [toast, setToast] = useState<ToastInfo | null>(null);

  const showToast = useCallback(
    (message: string, type: "success" | "error" | "warning" = "success") => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 4000);
    },
    []
  );

  const router = useRouterState();
  const searchSablonAd = (router.location.search as any)?.sablonAd;

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
          preset.docs.some(
            (docAd) => normalizeForMatch(docAd) === normalizeForMatch(s.ad)
          )
        ) {
          ids.add(s.id);
        }
      });
      setSelectedIds(ids);
      showToast(`'${preset.name}' paketi seçildi. (${ids.size} belge)`, "success");
    }
  };

  const handleSavePreset = (): void => {
    if (selectedIds.size === 0) {
      showToast(
        "Lütfen paket oluşturmak için önce en az bir belge seçin.",
        "warning"
      );
      return;
    }
    const name = prompt("Lütfen bu belge paketi taslağı için bir isim girin:");
    if (!name || name.trim() === "") return;

    const selectedDocs = sablons
      .filter((s) => selectedIds.has(s.id))
      .map((s) => s.ad);
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
          [activeDosyaId]
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
        (s) => normalizeForMatch(s.ad) === normalizeForMatch(searchSablonAd)
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

  const groupedSablons = useMemo((): Record<string, Sablon[]> => {
    const groups: Record<string, Sablon[]> = {};

    const filteredSablons = sablons.filter((s) => {
      const docKey = (s.dosya_adi || "").replace(/\.html$/, "");
      const st = activeDosyaId
        ? getDocumentStatus(activeDosyaId, docKey)
        : "draft";

      if (statusFilter === "ready") {
        return st === "ready_to_print";
      }
      if (statusFilter === "printed") {
        return st === "printed";
      }
      if (statusFilter === "starred") {
        return activeStarredDocs.some(
          (d) => normalizeForMatch(d) === normalizeForMatch(s.ad)
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
  }, [
    sablons,
    statusFilter,
    activeDosyaId,
    getDocumentStatus,
    activeStarredDocs,
  ]);

  const toggleGroup = (cat: string) => {
    const groupItems = groupedSablons[cat] || [];
    const groupIds = groupItems.map((s) => s.id);
    const validIds = groupIds.filter(
      (id) => !getMissingRequirement(sablons.find((s) => s.id === id)!)
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
    if (sablon && getMissingRequirement(sablon)) return;

    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const renderHtml = (sablon: Sablon) => {
    try {
      if (!masterHtml) return sablon.icerik;

      const processContext =
        contextsByPath?.[sablon.route_path || ""] || dosyaContext;
      const templateContext = { ...processContext };

      const renderedContent = Mustache.render(sablon.icerik, templateContext);
      templateContext.icerik = renderedContent;
      return Mustache.render(masterHtml, templateContext);
    } catch (error) {
      console.error("Template render hatası:", error);
      return sablon.icerik;
    }
  };

  const handleAutoProcessQueue = () => {
    if (!activeDosyaId) return;
    const readyIds = sablons
      .filter((s) => {
        if (getMissingRequirement(s)) return false;
        const docKey = (s.dosya_adi || "").replace(/\.html$/, "");
        return getDocumentStatus(activeDosyaId, docKey) === "ready_to_print";
      })
      .map((s) => s.id);

    if (readyIds.length === 0) {
      showToast("Kuyrukta işlenecek hazır belge bulunamadı.", "warning");
      return;
    }

    setSelectedIds(new Set(readyIds));
    setIsPrintManagerOpen(true);
    showToast(`Kuyruktaki ${readyIds.length} adet hazır belge otomatik olarak seçildi.`, "success");
  };

  const handleAction = async (
    action: "pdf" | "udf" | "docx" | "print" | "zip" | "excel",
    specificIds?: number[]
  ) => {
    if (action === "excel") {
      setProcessing(true);
      try {
        const kalemlerRes = await window.electron.ipcRenderer.invoke(
          "db:query",
          "SELECT * FROM DATA_TeminKalem WHERE temin_dosya_id = ?",
          [activeDosyaId]
        );
        const firmalarRes = await window.electron.ipcRenderer.invoke(
          "db:query",
          `SELECT f.*, tf.durum as teklif_durumu, tf.toplam_teklif 
           FROM DATA_TeminFirma tf 
           JOIN TANIM_Firma f ON tf.firma_id = f.id 
           WHERE tf.temin_dosya_id = ?`,
          [activeDosyaId]
        );
        const tekliflerRes = await window.electron.ipcRenderer.invoke(
          "db:query",
          "SELECT * FROM DATA_TeminKalemTeklif WHERE temin_dosya_id = ?",
          [activeDosyaId]
        );
        const komisyonRes = await window.electron.ipcRenderer.invoke(
          "db:query",
          "SELECT * FROM DATA_TeminKomisyon WHERE temin_dosya_id = ?",
          [activeDosyaId]
        );
        const kurumRes = await window.electron.ipcRenderer.invoke(
          "db:query",
          "SELECT * FROM TANIM_Kurum LIMIT 1"
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

    let targetIds = specificIds ? new Set(specificIds) : selectedIds;

    if (targetIds.size === 0 && activeDosyaId) {
      const readyIds = sablons
        .filter((s) => {
          if (getMissingRequirement(s)) return false;
          const docKey = (s.dosya_adi || "").replace(/\.html$/, "");
          return getDocumentStatus(activeDosyaId, docKey) === "ready_to_print";
        })
        .map((s) => s.id);
      if (readyIds.length > 0) {
        targetIds = new Set(readyIds);
      }
    }

    if (targetIds.size === 0) {
      showToast("Lütfen en az bir belge seçin veya kuyruğa hazır belge ekleyin.", "warning");
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
          }
        );

        if (res && res.success && !res.canceled) {
          await logDocument("Toplu Belge Paketi", defaultZipName);
          showToast(
            `ZIP arşivi başarıyla kaydedildi (${selectedSablons.length} belge).`,
            "success"
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
            fileBase
          );
          await logDocument(sablon.ad, `${fileBase}.pdf`);
        } else if (action === "udf") {
          await window.electron.ipcRenderer.invoke(
            "export-udf",
            html,
            fileBase
          );
          await logDocument(sablon.ad, `${fileBase}.udf`);
        } else if (action === "docx") {
          await window.electron.ipcRenderer.invoke(
            "export-docx",
            html,
            fileBase
          );
          await logDocument(sablon.ad, `${fileBase}.docx`);
        } else if (action === "print") {
          await window.electron.ipcRenderer.invoke("print-html", html, {
            silent: true,
          });
          await logDocument(sablon.ad, "Yazdırıldı");
        }

        if (activeDosyaId) {
          markAsPrinted(activeDosyaId, docKey);
        }
      }

      if (action === "print") {
        setIsPrintManagerOpen(false);
        showToast(
          "Belgeler başarıyla yazdırıldı ve 'Yazdırıldı' olarak işaretlendi.",
          "success"
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

  const handleOpenExternal = async (sablon: Sablon) => {
    const processCtx =
      contextsByPath?.[sablon.route_path || ""] || dosyaContext;
    const eksikAlanlar: string[] = [];
    const doluAlanlar: string[] = [];
    for (const [key, value] of Object.entries(processCtx)) {
      if (key === "icerik" || key.startsWith("_")) continue;
      if (typeof value === "string" && value.includes("[Belirtilmedi:")) {
        const match = value.match(/\[Belirtilmedi:\s*(.+?)\]/);
        eksikAlanlar.push(match ? match[1] : key);
      } else if (Array.isArray(value)) {
        if (value.length > 0) {
          doluAlanlar.push(key);
        }
      } else if (value !== null && value !== undefined && value !== "") {
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
          ? `\n  ... ve ${eksikAlanlar.length - maxGoster} alan daha`
          : "";
      const devam = confirm(
        `⚠️ ${eksikAlanlar.length} alan eksik / belirtilmemiş:\n\n${eksikListesi}${fazla}\n\n✅ ${doluAlanlar.length} alan dolu.\n\nYine de PDF olarak açmak istiyor musunuz?`
      );
      if (!devam) return;
    }
    const html = renderHtml(sablon);
    if (html) {
      await window.electron.ipcRenderer.invoke("open-pdf-external", html);
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
          <CiktiStatusFilterTabs
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            totalCount={sablons.length}
            readyCount={readyCount}
            starredCount={activeStarredDocs.length}
            printedCount={printedCount}
          />

          {/* BELGE PAKETLERİ VE TASLAKLAR */}
          <CiktiPresetManager
            presets={presets}
            activePresetId={activePresetId}
            selectedIdsSize={selectedIds.size}
            onSelectPreset={handleSelectPreset}
            onSavePreset={handleSavePreset}
            onDeletePreset={handleDeletePreset}
          />

          {loading ? (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar">
              {Object.keys(groupedSablons).length === 0 && (
                <div className="py-12 text-center text-slate-400 text-sm">
                  {statusFilter === "ready" &&
                    "Yazdırmaya hazır olarak işaretlenmiş belge bulunamadı."}
                  {statusFilter === "starred" &&
                    "Hızlı erişim için yıldızlanmış belge bulunamadı."}
                  {statusFilter === "printed" &&
                    "Bu dosyada henüz yazdırılan belge bulunamadı."}
                  {statusFilter === "all" &&
                    "Kayıtlı belge şablonu bulunamadı."}
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
                            .every((i) => selectedIds.has(i.id)) ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                        <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          {kategori} ({items.length})
                        </h4>
                      </div>
                      <div>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-4">
                        {items.map((sablon) => {
                          const missingMsg = getMissingRequirement(sablon);
                          const docKey = (sablon.dosya_adi || "").replace(
                            /\.html$/,
                            ""
                          );
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
                            <CiktiBelgeCard
                              key={`cikti_${sablon.id}_${docKey}`}
                              sablon={sablon}
                              isSelected={selectedIds.has(sablon.id)}
                              missingMsg={missingMsg}
                              docStatus={docStatus}
                              isLocked={isLocked}
                              lockInfo={lockInfo}
                              activeDosyaId={activeDosyaId}
                              dosyaContext={dosyaContext}
                              contextsByPath={contextsByPath}
                              onToggleSelect={toggleSelect}
                              onUnlock={(dKey, dName) => {
                                if (
                                  confirm(
                                    `"${dName}" belgesinin yazdırma kilidini açmak ve yeniden düzenlemeye izin vermek istiyor musunuz?`
                                  )
                                ) {
                                  if (activeDosyaId) {
                                    unlockDocument(activeDosyaId, dKey);
                                  }
                                }
                              }}
                              onToggleReady={(dKey, dName) => {
                                if (activeDosyaId) {
                                  toggleReadyToPrint(
                                    activeDosyaId,
                                    dKey,
                                    dName
                                  );
                                }
                              }}
                              onPreview={(s) => {
                                const key = (s.dosya_adi || "").replace(
                                  /\.html$/,
                                  ""
                                );
                                openDocument({
                                  documentId: key,
                                  dosyaId: activeDosyaId || undefined,
                                  documentTitle: s.ad,
                                });
                              }}
                              onQuickPrint={(sId) => handleAction("print", [sId])}
                              onExport={(fmt, sId) => handleAction(fmt, [sId])}
                              onOpenExternal={handleOpenExternal}
                            />
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
          onAutoProcessQueue={handleAutoProcessQueue}
        />
      </div>

      <TekTikYazdirModal
        isOpen={isPrintManagerOpen}
        onClose={() => setIsPrintManagerOpen(false)}
        sablons={sablons}
        activeDosya={activeDosya}
        activeStarredDocs={activeStarredDocs}
        initialSelectedIds={Array.from(selectedIds)}
        renderHtml={renderHtml}
        onExecutePrint={async (selected, action) => {
          await handleAction(action, selected.map((s) => s.id));
        }}
        getMissingRequirement={getMissingRequirement}
        normalizeForMatch={normalizeForMatch}
      />

      <CiktiToast toast={toast} />
    </SubScreen>
  );
}

import React, { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building2,
  Calculator,
  CheckCircle2,
  ExternalLink,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Layers,
  Mail,
  RotateCcw,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trophy,
} from "lucide-react";
import { PricesSummaryDashboard } from "./PricesSummaryDashboard";
import { MalzemeTabloPopover } from "../../components/MalzemeListesi/components/MalzemeTabloPopover";
import { normalizeForMatch } from "../useDosyaAsamasiSablons";
import { FiyatIstenenFirmalarınSecilmesi } from "./FiyatIstenenFirmalarınSecilmesi";
import { PoolFirm } from "../hooks/usePiyasaFiyatArastirmasi";
import { SABLON_ALIAS_MAP } from "../constants/sablonAliases";
import { BelgeItem, BelgeListesi } from "./BelgeListesi";
import { formatDateString } from "../../../CiktiMerkezi.contextBuilder";
import { useGlobalDocumentPreviewStore } from "../../../../../store/globalDocumentPreviewStore";
import { useWorkspaceStore } from "../../../../../store/workspaceStore";

interface PiyasaFiyatArastirmasiDashboardProps {
  setIsFormOpen: (val: boolean) => void;
  handleNewDocument: (mode: "maliyet" | "tutanak") => void;
  dashboardViewMode: "documents" | "prices";
  setDashboardViewMode: (val: "documents" | "prices") => void;
  stageDocs: any[];
  docViewMode: "grid" | "list" | "table";
  changeDocViewMode: (mode: "grid" | "list" | "table") => void;
  stageSablons: any[];
  sablons: any[];
  activeStarredDocs: any[];
  ciktiLoading: boolean;
  handleOpenPreviewForSablon: any;
  quickPrint: any;
  quickExport: any;
  quickOpenExternal: any;
  isSablonDisabled: (sablon: any) => boolean;
  disableDocumentGuidance: boolean;
  invitedFirms: any[];
  allPoolFirms?: PoolFirm[];
  handleAddSingleFirm?: (firma: PoolFirm) => void;
  handleCreateNewFirm?: (firmaData: {
    unvan: string;
    vergi_no?: string;
    telefon?: string;
    email?: string;
    sehir?: string;
  }) => Promise<void>;
  handleRemoveFirm?: (id: number) => void;
  items: any[];
  bids: any;
  setActiveFormTab: (tab: "firms" | "matrix") => void;
  activeActionDropdown: string | null;
  setActiveActionDropdown: (val: string | null) => void;
  handleUpdateDocumentDate: (
    docId: number,
    newDate: string,
    docName: string,
  ) => void;
  setIsFirmModalOpen?: (val: boolean) => void;
  handleDeleteDocument?: (id: number) => void;
  handleSaveToDosya?: (docType?: "maliyet" | "tutanak" | "save_only") => void;
  getEstimatedCostTotal?: () => number;
  manualWinnerFirmaId?: number | null;
  handleSetWinnerFirma?: (firmaMasterId: number | null) => Promise<void>;
  lowestTotalFirmaId?: number | null;
}

export function PiyasaFiyatArastirmasiDashboard({
  setIsFormOpen,
  handleNewDocument,
  stageDocs,
  docViewMode,
  changeDocViewMode,
  sablons,
  handleOpenPreviewForSablon,
  quickPrint,
  quickOpenExternal,
  invitedFirms,
  allPoolFirms,
  handleAddSingleFirm,
  handleCreateNewFirm,
  handleRemoveFirm,
  items,
  bids,
  setActiveFormTab,
  handleDeleteDocument,
  manualWinnerFirmaId,
  handleSetWinnerFirma,
}: PiyasaFiyatArastirmasiDashboardProps): React.JSX.Element {
  const { activeDosyaId } = useWorkspaceStore();

  // Akıllı Adım (Stepper) Başlangıç Durumu
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(() => {
    if (!invitedFirms || invitedFirms.length === 0) return 1;
    const hasAnyBid = invitedFirms.some((f: any) => f.teklif_toplami && f.teklif_toplami > 0);
    if (hasAnyBid || manualWinnerFirmaId) return 2;
    return 1;
  });

  const handleOpenSablonByDosyaAdi = (targetKey: string, firmData?: any) => {
    const cleanTarget = targetKey.replace(/\.html$/, "").toLowerCase().trim();
    const candidateKeys = SABLON_ALIAS_MAP[cleanTarget] || [cleanTarget];

    let foundSablon: any = null;

    if (sablons && sablons.length > 0) {
      for (const key of candidateKeys) {
        foundSablon = sablons.find((s: any) => {
          const fileBase = (s.dosya_adi || "").replace(/\.html$/, "")
            .toLowerCase().trim();
          return fileBase === key;
        });
        if (foundSablon) break;
      }

      if (!foundSablon) {
        for (const key of candidateKeys) {
          foundSablon = sablons.find((s: any) => {
            const route = (s.route_path || s.id || "").toLowerCase().trim();
            return route === key;
          });
          if (foundSablon) break;
        }
      }

      if (!foundSablon) {
        for (const key of candidateKeys) {
          const normKey = normalizeForMatch(key);
          foundSablon = sablons.find((s: any) => {
            const normSablonName = normalizeForMatch(s.ad || s.dosya_adi || "");
            return normSablonName.includes(normKey) ||
              normKey.includes(normSablonName);
          });
          if (foundSablon) break;
        }
      }
    }

    if (foundSablon && handleOpenPreviewForSablon) {
      handleOpenPreviewForSablon(foundSablon, foundSablon.ad, undefined, firmData);
    } else {
      useGlobalDocumentPreviewStore.getState().openDocument({
        documentId: targetKey,
        documentTitle: foundSablon ? foundSablon.ad : targetKey,
        dosyaId: activeDosyaId || undefined,
        selectedFirma: firmData || null,
        invitedFirms: invitedFirms || [],
      });
    }
  };

  const handleOpenEkapSorgu = (firma?: any) => {
    window.electron?.ipcRenderer.send("window:open-external", {
      url: "https://ekapv2.kik.gov.tr/sorgulamalar/yasak-sorgulama",
      title: firma?.unvan
        ? `${firma.unvan} - EKAP Yasaklılık Sorgulama`
        : "EKAP Kamu İhale Yasaklı Sorgulama",
    });
  };

  const mappedBelgeler: BelgeItem[] = useMemo(() => {
    if (!stageDocs || stageDocs.length === 0) return [];

    const counts: Record<string, number> = {};

    return stageDocs.map((doc) => {
      const isMaliyet = doc.belge_adi === "Yaklaşık Maliyet Cetveli" ||
        doc.belge_adi?.toLowerCase().includes("maliyet");
      const typeId = isMaliyet
        ? "yaklasik-maliyet"
        : "piyasa-fiyat-arastirmasi";

      counts[typeId] = (counts[typeId] || 0) + 1;

      return {
        id: doc.id,
        belgeTipiId: typeId,
        belgeAdi: doc.belge_adi,
        belgeTarihi: doc.belge_tarihi
          ? formatDateString(doc.belge_tarihi) || doc.belge_tarihi
          : "-",
        durum: "Tamamlandı" as const,
        siraNo: counts[typeId],
        data: doc,
      };
    });
  }, [stageDocs]);

  const findSablonForBelge = (belge: BelgeItem) => {
    if (!sablons || sablons.length === 0) return null;

    const originalDoc = belge.data as any;
    const rawDocName = originalDoc?.belge_adi || belge.belgeAdi || "";
    const normDocName = normalizeForMatch(rawDocName);

    let found = sablons.find((s: any) => {
      const normSablonName = normalizeForMatch(s.ad || s.dosya_adi || "");
      return normSablonName.includes(normDocName) ||
        normDocName.includes(normSablonName);
    });

    if (found) return found;

    const isMaliyet = belge.belgeTipiId === "yaklasik-maliyet" ||
      rawDocName.toLowerCase().includes("maliyet");
    const targetKey = isMaliyet
      ? "yaklasik-maliyet-cetveli"
      : "piyasa-fiyat-arastirma-tutanagi";
    const candidateKeys = SABLON_ALIAS_MAP[targetKey] || [targetKey];

    for (const key of candidateKeys) {
      found = sablons.find((s: any) => {
        const fileBase = (s.dosya_adi || "").replace(/\.html$/, "")
          .toLowerCase().trim();
        return fileBase === key;
      });
      if (found) break;
    }

    if (!found) {
      for (const key of candidateKeys) {
        found = sablons.find((s: any) => {
          const route = (s.route_path || s.id || "").toLowerCase().trim();
          return route === key;
        });
        if (found) break;
      }
    }

    return found || sablons[0];
  };

  const handleOpenBelgePreview = (belge: BelgeItem) => {
    const targetSablon = findSablonForBelge(belge);

    if (targetSablon && handleOpenPreviewForSablon) {
      let snapshotCtx = undefined;
      const originalDoc = belge.data as any;
      if (originalDoc?.veri_json) {
        try {
          snapshotCtx = JSON.parse(originalDoc.veri_json);
        } catch (e) {
          console.error("Error parsing saved document JSON:", e);
        }
      }
      handleOpenPreviewForSablon(targetSablon, targetSablon.ad, snapshotCtx);
    } else {
      alert("Bu belge için uygun şablon bulunamadı.");
    }
  };

  const handleOpenExternalForBelge = (belge: BelgeItem) => {
    const targetSablon = findSablonForBelge(belge);
    if (targetSablon && quickOpenExternal) {
      quickOpenExternal(targetSablon);
    }
  };

  const handleQuickPrintForBelge = (belge: BelgeItem) => {
    const targetSablon = findSablonForBelge(belge);
    if (targetSablon && quickPrint) {
      quickPrint(targetSablon);
    }
  };

  const firmaColumns = useMemo(
    () => [
      { key: "unvan", label: "Firma Unvanı" },
      { key: "vergi_no", label: "Vergi No / VKN" },
      { key: "telefon", label: "Telefon" },
      { key: "email", label: "E-Posta" },
      { key: "sehir", label: "İl / Semt" },
    ],
    [],
  );

  const formattedFirms = useMemo(() => {
    if (!allPoolFirms) return [];
    return allPoolFirms.map((pf) => {
      const existingInvited = invitedFirms?.find(
        (ifrm) => ifrm.firma_id === pf.id,
      );
      return {
        ...pf,
        temin_firma_id: existingInvited?.id,
        isAdded: Boolean(existingInvited),
        sehir: pf.il || (pf as any).sehir || "-",
        telefon: pf.telefon || "-",
        email: pf.email || (pf as any).eposta || "-",
        vergi_no: pf.vergi_no || "-",
      };
    });
  }, [allPoolFirms, invitedFirms]);

  const activeWinnerFirma = useMemo(() => {
    if (!manualWinnerFirmaId || !invitedFirms) return null;
    return invitedFirms.find(
      (f: any) =>
        f.firma_id === manualWinnerFirmaId || f.id === manualWinnerFirmaId,
    );
  }, [manualWinnerFirmaId, invitedFirms]);

  const lowestBidFirm = useMemo(() => {
    if (!invitedFirms || invitedFirms.length === 0) return null;
    let minTotal = Infinity;
    let minFirm: any = null;
    invitedFirms.forEach((f: any) => {
      if (
        f.teklif_toplami && f.teklif_toplami > 0 && f.teklif_toplami < minTotal
      ) {
        minTotal = f.teklif_toplami;
        minFirm = f;
      }
    });
    return minFirm;
  }, [invitedFirms]);

  // Adım Durumları
  const isStep1Done = invitedFirms && invitedFirms.length >= 2;
  const isStep2Done = Boolean(
    invitedFirms &&
      invitedFirms.some((f: any) => f.teklif_toplami && f.teklif_toplami > 0) &&
      (activeWinnerFirma || lowestBidFirm),
  );
  const isStep3Done = mappedBelgeler.length > 0;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* ─── STEPPER (ADIM ADIM SÜREÇ ÇİZELGESİ) ─── */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-3 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {/* Adım 1 Butonu */}
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
              currentStep === 1
                ? "bg-blue-50/80 dark:bg-blue-950/40 border-blue-400 dark:border-blue-600 shadow-xs ring-2 ring-blue-500/20"
                : isStep1Done
                ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-50/80"
                : "bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:bg-slate-100/60"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                currentStep === 1
                  ? "bg-blue-600 text-white"
                  : isStep1Done
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
              }`}
            >
              {isStep1Done ? <CheckCircle2 className="w-4 h-4" /> : "1"}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate flex items-center gap-1.5">
                <span>1. İstekliler & Dağıtım</span>
                {isStep1Done && (
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                    ({invitedFirms.length} Firma)
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                Firma seçimi & dağıtım mektupları
              </div>
            </div>
          </button>

          {/* Adım 2 Butonu */}
          <button
            type="button"
            onClick={() => setCurrentStep(2)}
            className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
              currentStep === 2
                ? "bg-blue-50/80 dark:bg-blue-950/40 border-blue-400 dark:border-blue-600 shadow-xs ring-2 ring-blue-500/20"
                : isStep2Done
                ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-50/80"
                : "bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:bg-slate-100/60"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                currentStep === 2
                  ? "bg-blue-600 text-white"
                  : isStep2Done
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
              }`}
            >
              {isStep2Done ? <CheckCircle2 className="w-4 h-4" /> : "2"}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate flex items-center gap-1.5">
                <span>2. Teklif Fiyatları & Kazanan</span>
                {activeWinnerFirma && (
                  <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 truncate">
                    (Kazanan Belirlendi)
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                Toplanan teklifleri gir & değerlendir
              </div>
            </div>
          </button>

          {/* Adım 3 Butonu */}
          <button
            type="button"
            onClick={() => setCurrentStep(3)}
            className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
              currentStep === 3
                ? "bg-blue-50/80 dark:bg-blue-950/40 border-blue-400 dark:border-blue-600 shadow-xs ring-2 ring-blue-500/20"
                : isStep3Done
                ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-50/80"
                : "bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:bg-slate-100/60"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                currentStep === 3
                  ? "bg-blue-600 text-white"
                  : isStep3Done
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
              }`}
            >
              {isStep3Done ? <CheckCircle2 className="w-4 h-4" /> : "3"}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate flex items-center gap-1.5">
                <span>3. Tutanak & Maliyet Çıktıları</span>
                {mappedBelgeler.length > 0 && (
                  <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                    ({mappedBelgeler.length} Belge)
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                Piyasa tutanağı & yaklaşık maliyet
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* ─── ADIM 1: İSTEKLİ FİRMALAR & TEKLİF İSTEME / DAĞITIM BELGELERİ ─── */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {currentStep === 1 && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-200">
          {/* 1.1 İstekli Firmalar Tablosu */}
          <FiyatIstenenFirmalarınSecilmesi
            title="Fiyat İstenen İstekli Firmaların Belirlenmesi"
            firms={formattedFirms}
            columns={firmaColumns}
            winnerFirmaId={manualWinnerFirmaId}
            onSetWinnerFirma={(f) => {
              if (handleSetWinnerFirma) {
                const targetId = (f.firma_id as number) || f.id;
                handleSetWinnerFirma(
                  manualWinnerFirmaId === targetId ? null : targetId,
                );
              }
            }}
            onCreateNewFirm={handleCreateNewFirm}
            onFiyatGir={() => {
              setCurrentStep(2);
              setIsFormOpen(true);
              setActiveFormTab("matrix");
            }}
            onFiyatPiyasaFormu={(firma) => {
              handleOpenSablonByDosyaAdi("arastirma-mektubu", firma);
            }}
            onBirimFiyatArastirmasi={(firma) => {
              handleOpenSablonByDosyaAdi("birim-fiyat-teklif-mektubu", firma);
            }}
            onBosTeklifCetveli={(firma) => {
              handleOpenSablonByDosyaAdi("birim-fiyat-teklif-mektubu", firma);
            }}
            onEkapSorgula={(firma) => {
              handleOpenEkapSorgu(firma);
            }}
            onFirmaEkle={async (firma) => {
              if (handleAddSingleFirm) {
                handleAddSingleFirm(firma);
              }
            }}
            onFirmaCikar={(firma) => {
              if (handleRemoveFirm) {
                const targetId = (firma.temin_firma_id as number) || firma.id;
                handleRemoveFirm(targetId);
              }
            }}
          />

          {/* 1.2 Dağıtım Belgeleri Kartları */}
          <div className="rounded-2xl border border-indigo-100 dark:border-indigo-900/50 bg-gradient-to-br from-indigo-50/50 via-white to-blue-50/40 dark:from-slate-900 dark:via-slate-950 dark:to-indigo-950/20 p-5 shadow-xs flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100/80 dark:border-indigo-950/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <span>Teklif İsteme & Dağıtım Belgeleri</span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                      Firmalara Gönderilecek Formlar
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Fiyat araştırma tutanağı öncesinde firmalara iletilecek resmi teklif mektuplarını ve boş cetvelleri üretin.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Kart 1: Teklif Mektubu (Dağıtımlı) */}
              <div className="flex flex-col justify-between p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 shadow-2xs hover:shadow-sm transition-all group">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0 group-hover:scale-105 transition-transform">
                    <Send className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      Teklif Mektubu (Dağıtımlı)
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      İstekli firmaların isimlerinin yer aldığı toplu dağıtım listeli resmi yazı.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenSablonByDosyaAdi("arastirma-mektubu")}
                  className="mt-3 w-full py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Dağıtım Mektubunu Aç</span>
                </button>
              </div>

              {/* Kart 2: Karma Dağıtım Mektubu */}
              <div className="flex flex-col justify-between p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700 shadow-2xs hover:shadow-sm transition-all group">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0 group-hover:scale-105 transition-transform">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      Karma Dağıtım Mektubu
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Farklı kalem grupları içeren alımlar için dağıtım çizelgeli mektup.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenSablonByDosyaAdi("fiyat-arastirma-mektubu")}
                  className="mt-3 w-full py-1.5 px-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Karma Mektubu Aç</span>
                </button>
              </div>

              {/* Kart 3: Boş Birim Fiyat Teklif Cetveli */}
              <div className="flex flex-col justify-between p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 shadow-2xs hover:shadow-sm transition-all group">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      Birim Fiyat Teklif Cetveli
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      İstekli firmalara fiyatlarını doldurmaları için verilecek boş teklif formu.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenSablonByDosyaAdi("birim-fiyat-teklif-mektubu")}
                  className="mt-3 w-full py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Teklif Cetvelini Aç</span>
                </button>
              </div>

              {/* Kart 4: EKAP Yasaklılık Kontrolü & Tutanak */}
              <div className="flex flex-col justify-between p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-orange-300 dark:hover:border-orange-700 shadow-2xs hover:shadow-sm transition-all group">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 shrink-0 group-hover:scale-105 transition-transform">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      Yasaklılık Sorgulama & Tutanak
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      İhale yasağı kontrolü yapın ve yasaklılık sorgulama tutanağını düzenleyin.
                    </p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEkapSorgu()}
                    className="py-1.5 px-2 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 text-[11px] font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer border border-orange-200 dark:border-orange-800"
                    title="EKAP üzerinden canlı sorgula"
                  >
                    <ExternalLink className="w-3 h-3 text-orange-600" />
                    <span>EKAP Sorgu</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenSablonByDosyaAdi("yasaklilik-sorgulama-tutanagi")}
                    className="py-1.5 px-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-[11px] font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                    title="Yasaklılık Sorgulama Tutanağını Aç"
                  >
                    <FileCheck className="w-3 h-3" />
                    <span>Tutanağı Aç</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Adım 1 Alt İlerleme Çubuğu */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Firmaları ekleyip teklif mektuplarını dağıttıktan sonra toplanan fiyatları girmek için sonraki adıma geçin.
            </div>
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs hover:shadow-md cursor-pointer border-0"
            >
              <span>2. Adım: Fiyatları Girmeye Geç</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* ─── ADIM 2: TOPLANAN TEKLİF FİYATLARININ GİRİLMESİ & KAZANAN ───────── */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {currentStep === 2 && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-200">
          {/* Kazanan İstekli / Karar Paneli */}
          <div className="p-4 rounded-2xl border border-amber-200/80 dark:border-amber-900/50 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                    Seçilen / En Uygun Teklif Sahibi
                  </h4>
                  {activeWinnerFirma && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">
                      Onaylandı
                    </span>
                  )}
                </div>
                <div className="text-sm font-extrabold text-slate-800 dark:text-slate-100 mt-0.5">
                  {activeWinnerFirma
                    ? activeWinnerFirma.unvan
                    : lowestBidFirm
                    ? `${lowestBidFirm.unvan} (En Düşük Teklif)`
                    : "Henüz teklif girilmedi veya kazanan seçilmedi"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsFormOpen(true);
                  setActiveFormTab("matrix");
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-xs cursor-pointer border-0"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Teklif Fiyatlarını Gir / Düzenle</span>
              </button>

              {lowestBidFirm && (
                <button
                  type="button"
                  onClick={() => {
                    if (handleSetWinnerFirma) {
                      handleSetWinnerFirma(
                        lowestBidFirm.firma_id || lowestBidFirm.id,
                      );
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition-all shadow-xs cursor-pointer border-0 active:scale-95"
                  title={`En düşük teklif sahibi (${lowestBidFirm.unvan}) kazanan olarak atanır.`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                  En Düşük Teklifi Kazanan Yap
                </button>
              )}

              {activeWinnerFirma && (
                <button
                  type="button"
                  onClick={() => {
                    if (handleSetWinnerFirma) {
                      handleSetWinnerFirma(null);
                    }
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer border-0"
                  title="Seçimi Kaldır"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Sıfırla
                </button>
              )}
            </div>
          </div>

          {/* Fiyat Matrisi Dashboard */}
          <PricesSummaryDashboard
            invitedFirms={invitedFirms}
            items={items}
            bids={bids}
            manualWinnerFirmaId={manualWinnerFirmaId}
            handleSetWinnerFirma={handleSetWinnerFirma}
            onManageFirmsClick={() => {
              setIsFormOpen(true);
              setActiveFormTab("firms");
            }}
          />

          {/* Adım 2 Alt İlerleme Çubuğu */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer border-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>1. Adıma Dön</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs hover:shadow-md cursor-pointer border-0"
            >
              <span>3. Adım: Tutanak & Maliyeti Üret</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* ─── ADIM 3: PİYASA ARAŞTIRMA TUTANAĞI & YAKLAŞIK MALİYET (SONUÇ) ───── */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {currentStep === 3 && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-200">
          {/* Hızlı Sonuç Belgesi Üretim Kartları */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Piyasa Fiyat Araştırması Tutanağı */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/60 via-white to-white dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 shadow-xs flex flex-col justify-between">
              <div className="flex items-start gap-3.5">
                <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    Piyasa Fiyat Araştırması Tutanağı
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    İsteklilerden toplanan tüm teklifleri ve komisyon/görevli kararını içeren resmi piyasa fiyat araştırması tutanağı.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenSablonByDosyaAdi("piyasa-fiyat-arastirma-tutanagi")}
                  className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer border-0"
                >
                  <FileText className="w-4 h-4" />
                  <span>Piyasa Araştırma Tutanağını Aç</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleNewDocument("tutanak")}
                  className="py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-colors cursor-pointer border border-indigo-200 dark:border-indigo-800 shrink-0"
                  title="Yeni Tutanak Kaydet"
                >
                  + Kaydet
                </button>
              </div>
            </div>

            {/* 2. Yaklaşık Maliyet Hesap Cetveli */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/60 via-white to-white dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 shadow-xs flex flex-col justify-between">
              <div className="flex items-start gap-3.5">
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    Yaklaşık Maliyet Hesap Cetveli
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Alıma ait kalemlerin piyasa teklifleri ortalamasına göre hesaplanan resmi yaklaşık maliyet cetveli.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenSablonByDosyaAdi("yaklasik-maliyet-hesap-cetveli")}
                  className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer border-0"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Yaklaşık Maliyet Cetvelini Aç</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleNewDocument("maliyet")}
                  className="py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition-colors cursor-pointer border border-emerald-200 dark:border-emerald-800 shrink-0"
                  title="Yeni Maliyet Cetveli Kaydet"
                >
                  + Kaydet
                </button>
              </div>
            </div>
          </div>

          {/* Hazırlanan Tutanaklar Listesi */}
          <BelgeListesi
            title="Dosyaya Kaydedilen Tutanak ve Cetveller"
            belgeler={mappedBelgeler}
            viewMode={docViewMode}
            onViewModeChange={changeDocViewMode}
            onView={handleOpenBelgePreview}
            onOpenExternal={handleOpenExternalForBelge}
            onPrint={handleQuickPrintForBelge}
            onEdit={(belge) => {
              const isMaliyet = belge.belgeTipiId === "yaklasik-maliyet" ||
                belge.belgeAdi?.toLowerCase().includes("maliyet");
              handleNewDocument(isMaliyet ? "maliyet" : "tutanak");
            }}
            onDelete={(belge) => {
              if (handleDeleteDocument) {
                handleDeleteDocument(belge.id);
              }
            }}
            createButtonLabel="Yeni Tutanak / Cetvel Kaydet"
            onCreateBelge={(type) => {
              const mode = type === "yaklasik-maliyet" ? "maliyet" : "tutanak";
              handleNewDocument(mode);
            }}
            onFiyatGir={() => {
              setCurrentStep(2);
              setIsFormOpen(true);
              setActiveFormTab("matrix");
            }}
          />

          {/* Adım 3 Alt Geri Dönüş Çubuğu */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer border-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>2. Adıma Dön (Fiyatlar & Kazanan)</span>
            </button>
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Piyasa Fiyat Araştırma Süreci Tamamlandı</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

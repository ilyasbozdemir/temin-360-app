import React, { useMemo } from "react";
import {
  AlertCircle,
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
  dashboardViewMode,
  stageDocs,
  docViewMode,
  changeDocViewMode,
  sablons,
  handleOpenPreviewForSablon,
  quickPrint,
  quickOpenExternal,
  disableDocumentGuidance,
  invitedFirms,
  allPoolFirms,
  handleAddSingleFirm,
  handleCreateNewFirm,
  handleRemoveFirm,
  items,
  bids,
  setActiveFormTab,
  setIsFirmModalOpen,
  handleDeleteDocument,
  handleSaveToDosya,
  getEstimatedCostTotal,
  manualWinnerFirmaId,
  handleSetWinnerFirma,
  lowestTotalFirmaId,
}: PiyasaFiyatArastirmasiDashboardProps): React.JSX.Element {
  const { activeDosyaId } = useWorkspaceStore();

  const handleOpenSablonByDosyaAdi = (targetKey: string) => {
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
      handleOpenPreviewForSablon(foundSablon, foundSablon.ad);
    } else {
      useGlobalDocumentPreviewStore.getState().openDocument({
        documentId: targetKey,
        documentTitle: targetKey,
        dosyaId: activeDosyaId || undefined,
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

  const handleOpenEdevletSorgu = () => {
    window.electron?.ipcRenderer.send("window:open-external", {
      url: "https://www.turkiye.gov.tr/kik-yasakli-sorgula",
      title: "e-Devlet KİK Yasaklılık Sorgulama",
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

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* ─── 1. İstekli Firmaların Seçilmesi & Yönetimi ─── */}
      <FiyatIstenenFirmalarınSecilmesi
        title="Fiyat İstenen Firmaların Seçilmesi"
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
          setIsFormOpen(true);
          setActiveFormTab("matrix");
        }}
        onFiyatPiyasaFormu={() => {
          handleOpenSablonByDosyaAdi("arastirma-mektubu");
        }}
        onBirimFiyatArastirmasi={() => {
          handleOpenSablonByDosyaAdi("birim-fiyat-arastirmasi");
        }}
        onEkapSorgula={handleOpenEkapSorgu}
        onDagitimMektubu={() => {
          handleOpenSablonByDosyaAdi("teklif-mektubu-dagitim");
        }}
        onKarmaDagitimMektubu={() => {
          handleOpenSablonByDosyaAdi("teklif-mektubu-dagitim-karma");
        }}
        onBosTeklifCetveli={() => {
          handleOpenSablonByDosyaAdi("birim-fiyat-teklif-cetveli");
        }}
        onYasaklilikTutanagi={() => {
          handleOpenSablonByDosyaAdi("yasaklilik-sorgulama-tutanagi");
        }}
        onFirmaEkle={(firma) => {
          if (handleAddSingleFirm) {
            handleAddSingleFirm(firma);
          }
        }}
        onFirmaCikar={(firma) => {
          if (handleRemoveFirm && (firma as any).temin_firma_id) {
            handleRemoveFirm((firma as any).temin_firma_id);
          }
        }}
        onOpenFirmaSecmeModali={() => {
          if (setIsFirmModalOpen) {
            setIsFirmModalOpen(true);
          }
        }}
        extraHeaderAction={
          <MalzemeTabloPopover
            step={2}
            disableDocumentGuidance={disableDocumentGuidance}
            onGorevlendirmeOnayi={() =>
              handleOpenSablonByDosyaAdi("komisyon-gorevlendirme-onayi")}
            onGorevlendirmeOnayEki={() =>
              handleOpenSablonByDosyaAdi("komisyon-gorevlendirme-onayi-eki")}
            onYaklasikMaliyetKomisyonu={() =>
              handleOpenSablonByDosyaAdi("komisyon-gorevlendirme-onayi")}
            onMuayeneKabulKomisyonu={() =>
              handleOpenSablonByDosyaAdi("muayene-kabul-komisyonu")}
            onFiyatArastirmaKomisyonu={() =>
              handleOpenSablonByDosyaAdi("komisyon-gorevlendirme-onayi")}
            onPiyasaArastirmaGorevlendirmesi={() =>
              handleOpenSablonByDosyaAdi(
                "piyasa-fiyat-arastirma-gorevlendirmesi",
              )}
            onPiyasaArastirmaTutanagi={() =>
              handleOpenSablonByDosyaAdi("piyasa-fiyat-arastirma-tutanagi")}
            onYaklasikMaliyetHesapCetveli={() =>
              handleOpenSablonByDosyaAdi("yaklasik-maliyet-cetveli")}
            onSonAlimCetveli={() =>
              handleOpenSablonByDosyaAdi("son-alim-fiyat-cetveli")}
            onPiyasaSonucCetveli={() =>
              handleOpenSablonByDosyaAdi(
                "piyasa-fiyat-arastirmasi-sonuc-cetveli",
              )}
            onTeklifIstemeMektubu={() =>
              handleOpenSablonByDosyaAdi("arastirma-mektubu")}
            onTeklifMektubuDagitim={() =>
              handleOpenSablonByDosyaAdi("teklif-mektubu-dagitim")}
            onTeklifMektubuKarma={() =>
              handleOpenSablonByDosyaAdi("teklif-mektubu-dagitim-karma")}
            onFirmalarTeklifCetveli={() =>
              handleOpenSablonByDosyaAdi("firmalar-teklif-cetveli")}
            onYasaklilikSorgulama={() =>
              handleOpenSablonByDosyaAdi("yasaklilik-sorgulama-tutanagi")}
            onOnayBelgesi={() =>
              handleOpenSablonByDosyaAdi("dogrudan-temin-onay-belgesi")}
          />
        }
      />

      {/* ─── 2. Kazanan Firma Belirleme & Hızlı Seçim Paneli ─── */}
      {invitedFirms && invitedFirms.length > 0 && (
        <div className="rounded-2xl border border-amber-200/80 dark:border-amber-800/60 bg-linear-to-r from-amber-50/70 via-orange-50/40 to-amber-50/70 dark:from-amber-950/20 dark:via-slate-900/40 dark:to-amber-950/20 backdrop-blur-md p-4 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 dark:bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 shadow-xs border border-amber-500/20">
                <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-300">
                    Kazanan Firma (Yüklenici) Belirleme
                  </span>
                  {activeWinnerFirma
                    ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        Belirlendi
                      </span>
                    )
                    : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100/80 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-md border border-amber-500/20">
                        <AlertCircle className="w-3 h-3" />
                        Henüz Seçilmedi
                      </span>
                    )}
                </div>
                <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100 mt-0.5">
                  {activeWinnerFirma
                    ? (
                      <span className="text-emerald-700 dark:text-emerald-300 font-black">
                        {activeWinnerFirma.unvan}
                      </span>
                    )
                    : (
                      <span className="text-slate-500 dark:text-slate-400 font-medium">
                        Teklif girişi haricinde buradan dilediğiniz firmayı
                        doğrudan kazanan yüklenici olarak atayabilirsiniz.
                      </span>
                    )}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[200px]">
                <select
                  value={manualWinnerFirmaId || ""}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : null;
                    if (handleSetWinnerFirma) {
                      handleSetWinnerFirma(val);
                    }
                  }}
                  className="w-full text-xs font-bold px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer shadow-xs"
                >
                  <option value="">— Firma Seçerek Belirle —</option>
                  {invitedFirms.map((f: any) => (
                    <option key={f.id} value={f.firma_id || f.id}>
                      {f.unvan} {f.teklif_toplami
                        ? `(${f.teklif_toplami.toLocaleString("tr-TR")} ₺)`
                        : ""}
                    </option>
                  ))}
                </select>
              </div>

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
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition-all shadow-xs hover:shadow-md cursor-pointer border-0 active:scale-95"
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
        </div>
      )}

      {/* ─── 3. Süreç & Teklif Dağıtım Merkezi (Rehber & Ön Hazırlık Kartları) ─── */}
      <div className="rounded-2xl border border-indigo-100 dark:border-indigo-900/50 bg-gradient-to-br from-indigo-50/50 via-white to-blue-50/40 dark:from-slate-900 dark:via-slate-950 dark:to-indigo-950/20 p-5 shadow-xs flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100/80 dark:border-indigo-950/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span>Teklif İsteme, Dağıtım & Araştırma İşlemleri</span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  Tutanak Öncesi Dağıtım
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Piyasa fiyat araştırma tutanağını oluşturmadan önce firmalara
                teklif mektuplarını dağıtın, teklif cetvelini iletin ve
                yasaklılık durumlarını kontrol edin.
              </p>
            </div>
          </div>
        </div>

        {/* 4'lü Süreç & Dağıtım Kartları */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Kart 1: Teklif İsteme Mektubu (Dağıtımlı) */}
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
                  Tüm istekli firmaların isimlerinin yer aldığı toplu dağıtım
                  listeli mektup.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                handleOpenSablonByDosyaAdi("teklif-mektubu-dagitim")}
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
                  Farklı kalem grupları içeren karma alımlar için dağıtım
                  çizelgeli mektup.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                handleOpenSablonByDosyaAdi("teklif-mektubu-dagitim-karma")}
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
                  İstekli firmalara tekliflerini doldurmaları için verilecek boş
                  cetvel formu.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                handleOpenSablonByDosyaAdi("birim-fiyat-teklif-cetveli")}
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
                  İhale yasağı kontrolü yapın ve yasaklılık sorgulama tutanağını
                  düzenleyin.
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
                onClick={() =>
                  handleOpenSablonByDosyaAdi("yasaklilik-sorgulama-tutanagi")}
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

      {/* ─── 4. Hazırlanan Tutanaklar / Fiyat Matrisi ─── */}
      {dashboardViewMode === "prices"
        ? (
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
        )
        : (
          <BelgeListesi
            title="Hazırlanan Tutanaklar"
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
            createButtonLabel="Yeni Tutanak / Cetvel Ekle"
            onCreateBelge={(type) => {
              const mode = type === "yaklasik-maliyet" ? "maliyet" : "tutanak";
              handleNewDocument(mode);
            }}
            onFiyatGir={() => handleNewDocument("tutanak")}
          />
        )}
    </div>
  );
}

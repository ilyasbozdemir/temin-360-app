import React, { useEffect, useState } from "react";
import { TeminDosyasi, useDosyalarHooks } from "./dosyalar.hooks";
import { useProjeHooks } from "../../hooks/useProjeHooks";
import { useTabStore } from "../../store/tabStore";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useWorkspaceStore } from "../../store/workspaceStore";
import { AITextGeneratorModal } from "../../components/ui/AITextGeneratorModal";
import { logActivity } from "../../utils/logger";
import { DosyalarPageHeader } from "./components/DosyalarPageHeader";
import { DosyalarStats } from "./components/DosyalarStats";
import { DosyalarFilterBar } from "./components/DosyalarFilterBar";
import { DosyalarList } from "./components/DosyalarList";
import { Sliders } from "lucide-react";
import { formatDosyaNo } from "../../utils/formatDosyaNo";

export default function DosyalarScreen(): React.ReactNode {
  const {
    dosyalar,
    isLoadingDosyalar,
    deleteDosya,
    hardDeleteDosya,
    updateDosya,
    bulkDeleteDosyalar,
    bulkHardDeleteDosyalar,
  } = useDosyalarHooks();
  const { projeler } = useProjeHooks();
  const { activeDosyaId, setActiveDosyaId, activeMeta } = useWorkspaceStore();
  const { updateTabLabel } = useTabStore();
  const routerState = useRouterState();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(window.location.search);
  const isWindowMode = searchParams.get("mode") === "window";

  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list" | "table">("grid");
  const [filterTur, setFilterTur] = useState<string>("hepsi");
  const [filterYil, setFilterYil] = useState<string>("hepsi");
  const [filterStatus, setFilterStatus] = useState<string>("hepsi");
  const [filterProjeId, setFilterProjeId] = useState<string>("hepsi");
  const [filterTag, setFilterTag] = useState<string>("hepsi");

  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const toggleGroup = (baseKonu: string) => {
    setExpandedGroups((prev) =>
      prev.includes(baseKonu)
        ? prev.filter((g) => g !== baseKonu)
        : [...prev, baseKonu]
    );
  };

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [activeDosyaId]);

  useEffect(() => {
    if (isWindowMode) return;
    const currentHref = routerState.location.href;
    if (currentHref === "/" || currentHref.includes("dashboard")) {
      updateTabLabel(currentHref, "Anasayfa");
    } else {
      updateTabLabel(currentHref, "Doğrudan Temin");
    }
  }, [routerState.location.href, updateTabLabel, isWindowMode]);

  const [showAIModal, setShowAIModal] = useState(false);
  const [selectedFileForAI, setSelectedFileForAI] = useState<
    Partial<TeminDosyasi> | null
  >(null);

  const [ekapModalOpen, setEkapModalOpen] = useState(false);
  const [ekapInputVal, setEkapInputVal] = useState("");
  const [ekapTargetId, setEkapTargetId] = useState<number | null>(null);

  const [selectedDosyaForMaliyet, setSelectedDosyaForMaliyet] = useState<
    any | null
  >(null);

  const handleSaveMaliyetAyarlari = async (): Promise<void> => {
    if (!selectedDosyaForMaliyet) return;

    let finalMaliyet = Number(selectedDosyaForMaliyet.yaklasik_maliyet) || 0;
    const kdvRate = Number(selectedDosyaForMaliyet.kdv) || 0;
    const isKdvDahil =
      Number(selectedDosyaForMaliyet.yaklasik_maliyet_kdv_dahil_mi) === 1;

    if (isKdvDahil && kdvRate > 0) {
      finalMaliyet = Number((finalMaliyet / (1 + kdvRate / 100)).toFixed(2));
    }

    await updateDosya({
      id: selectedDosyaForMaliyet.id,
      yaklasik_maliyet: finalMaliyet,
      kdv: selectedDosyaForMaliyet.kdv,
      yaklasik_maliyet_hesaplamasi:
        selectedDosyaForMaliyet.yaklasik_maliyet_hesaplamasi,
      yaklasik_maliyet_kdv_dahil_mi: 0, // Her zaman veritabanında KDV hariç olarak standardize ediyoruz
    });
    setSelectedDosyaForMaliyet(null);
  };

  const handleOpenMaliyetAyarlari = (dosya: any): void => {
    setSelectedDosyaForMaliyet({ ...dosya });
  };

  const handleOpenAI = (dosya: Partial<TeminDosyasi>) => {
    setSelectedFileForAI(dosya);
    setShowAIModal(true);
  };

  const handleOpenInNewWindow = (dosya: TeminDosyasi) => {
    if (!dosya) return;
    const wpParam = activeFilePath ? `&wp=${encodeURIComponent(activeFilePath)}` : '';
    window.electron?.ipcRenderer.send("window:open-secondary", {
      path: "/dosyalar",
      search: `?id=${dosya.id}&mode=window${wpParam}`,
      title: `DT: ${dosya.konu}`,
    });
  };

  const handleDelete = async (
    id: number,
    skipConfirm = false,
  ): Promise<void> => {
    if (
      skipConfirm ||
      confirm(
        'Bu dosyayı iptal etmek istediğinize emin misiniz? Dosya listelerde "İptal Edildi" olarak işaretlenecektir.',
      )
    ) {
      const dosya = dosyalar.find((d) => d.id === id);
      await deleteDosya(id);
      if (dosya) {
        await logActivity(
          "Dosya İptal Edildi",
          `${
            dosya.temin_no || "NO BELİRSİZ"
          } numaralı dosya iptal edildi olarak işaretlendi.`,
          "warning",
        );
      }
      if (activeDosyaId === id) setActiveDosyaId(null);
    }
  };

  const handleHardDelete = async (id: number): Promise<void> => {
    if (
      confirm(
        "DİKKAT (Geliştirici Modu Özel): Bu dosyayı veritabanından KALICI OLARAK SİLMEK (Hard Delete) istediğinize emin misiniz? Bu işlem geri alınamaz!",
      )
    ) {
      try {
        await hardDeleteDosya(id);
        if (activeDosyaId === id) setActiveDosyaId(null);
      } catch (error: any) {
        let errorMsg = error?.message || "Bilinmeyen bir hata oluştu.";
        if (
          errorMsg.includes("FOREIGN KEY") || errorMsg.includes("CONSTRAINT")
        ) {
          errorMsg =
            "Bu dosyayı silemezsiniz çünkü bu dosyaya bağlı alt kayıtlar (fatura, komisyon üyeleri, yüklenen evraklar vb.) mevcut. Dosyayı kalıcı olarak silebilmek için önce o kayıtları silmeniz gerekmektedir.\n\nTeknik Hata: " +
            errorMsg;
        }
        alert("Silme İşlemi Başarısız!\n\n" + errorMsg);
      }
    }
  };

  const handleBulkDelete = async (ids: number[]): Promise<void> => {
    await bulkDeleteDosyalar(ids);
    await logActivity(
      "Toplu Dosya İptali",
      `${ids.length} adet dosya iptal edildi olarak işaretlendi.`,
      "warning",
    );
    if (activeDosyaId && ids.includes(activeDosyaId)) setActiveDosyaId(null);
  };

  const handleBulkHardDelete = async (ids: number[]): Promise<void> => {
    try {
      await bulkHardDeleteDosyalar(ids);
      if (activeDosyaId && ids.includes(activeDosyaId)) setActiveDosyaId(null);
    } catch (error: any) {
      const errorMsg = error?.message || "Bilinmeyen bir hata oluştu.";
      alert("Toplu Silme İşlemi Başarısız!\n\n" + errorMsg);
    }
  };

  const handleUpdateStatus = async (
    id: number,
    status: string,
  ): Promise<void> => {
    await updateDosya({ id, status });
    const dosya = dosyalar.find((d) => d.id === id);
    if (dosya) {
      if (status === "tamamlandi") {
        await logActivity(
          "Dosya Tamamlandı",
          `${
            dosya.temin_no || "NO BELİRSİZ"
          } numaralı dosya tamamlandı olarak işaretlendi.`,
          "success",
        );
      } else if (status === "devam_ediyor") {
        await logActivity(
          "Dosya Aktife Alındı",
          `${
            dosya.temin_no || "NO BELİRSİZ"
          } numaralı dosya tekrar aktife alındı.`,
          "info",
        );
      }
    }
  };

  const handleEkapGonder = (id: number): void => {
    setEkapTargetId(id);
    setEkapInputVal("");
    setEkapModalOpen(true);
  };

  const handleEkapGonderSubmit = async (): Promise<void> => {
    if (!ekapTargetId) return;
    const id = ekapTargetId;
    const ekapNo = ekapInputVal.trim();
    if (!ekapNo) return;

    await updateDosya({ id, is_ekap_sent: 1, ekap_no: ekapNo });
    const dosya = dosyalar.find((d) => d.id === id);
    if (dosya) {
      await logActivity(
        "EKAP Kilit",
        `${
          dosya.temin_no || "NO BELİRSİZ"
        } numaralı dosya kilitlendi (İKN: ${ekapNo}).`,
        "success",
      );
    }
    setEkapModalOpen(false);
    setEkapTargetId(null);
  };

  const handleKilidiAc = async (id: number): Promise<void> => {
    if (
      confirm(
        "Kilidi açarsanız dosyanın EKAP bağlantısı/kilit durumu iptal edilecektir. Düzenlemeye devam edebilmek için emin misiniz?",
      )
    ) {
      await updateDosya({ id, is_ekap_sent: 0, ekap_no: null });
      const dosya = dosyalar.find((d) => d.id === id);
      if (dosya) {
        await logActivity(
          "EKAP Kilit Açıldı",
          `${dosya.temin_no || "NO BELİRSİZ"} numaralı dosyanın kilidi açıldı.`,
          "warning",
        );
      }
    }
  };

  const uniqueYillar = Array.from(
    new Set(
      dosyalar
        .map((d) => {
          if (d.butce_yili) return d.butce_yili;
          if (d.dosya_acilis_tarihi) {
            return new Date(d.dosya_acilis_tarihi).getFullYear();
          }
          if (d.created_at) return new Date(d.created_at).getFullYear();
          return new Date().getFullYear();
        })
        .filter(Boolean),
    ),
  ).sort((a, b) => b - a);

  const uniqueTags = React.useMemo(() => {
    const set = new Set<string>()
    dosyalar.forEach((d) => {
      if (d.tags) {
        try {
          const parsed = JSON.parse(d.tags)
          if (Array.isArray(parsed)) parsed.forEach((t: string) => set.add(t))
        } catch {
          if (typeof d.tags === 'string') {
            d.tags.split(',').forEach((t: string) => set.add(t.trim()))
          }
        }
      }
    })
    return Array.from(set).filter(Boolean)
  }, [dosyalar]);

  const filteredDosyalar = dosyalar.filter((d) => {
    const matchSearch =
      (d.konu || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.temin_no || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.birim_adi || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.proje_adi || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.proje_kodu || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.tags || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchTur = filterTur === "hepsi" || d.tur === filterTur;

    const dosyaYili = d.butce_yili ||
      (d.dosya_acilis_tarihi
        ? new Date(d.dosya_acilis_tarihi).getFullYear()
        : new Date(d.created_at).getFullYear());
    const matchYil = filterYil === "hepsi" ||
      dosyaYili.toString() === filterYil;

    const matchStatus = filterStatus === "hepsi" ||
      (filterStatus === "aktif" && d.is_deleted !== 1 &&
        d.status !== "tamamlandi") ||
      (filterStatus === "iptal_edildi" && d.is_deleted === 1) ||
      (filterStatus === "tamamlandi" && d.status === "tamamlandi" &&
        d.is_deleted !== 1);

    const matchProje = filterProjeId === "hepsi" || d.project_id?.toString() === filterProjeId;
    const matchTag = filterTag === "hepsi" || Boolean(d.tags && d.tags.includes(filterTag));

    return matchSearch && matchTur && matchYil && matchStatus && matchProje && matchTag;
  });

  const aktifDosyalar = dosyalar.filter((d) => d.is_deleted !== 1);

  const groupedDosyalar = React.useMemo(() => {
    const groups: { baseKonu: string; files: typeof dosyalar }[] = [];

    filteredDosyalar.forEach((dosya) => {
      const baseMatch = (dosya.konu || "").match(/^(.*?)\s*\(\d+\)$/);
      const baseKonu = baseMatch
        ? baseMatch[1].trim()
        : (dosya.konu || "").trim();

      let group = groups.find((g) =>
        g.baseKonu.toLowerCase() === baseKonu.toLowerCase()
      );
      if (!group) {
        group = { baseKonu, files: [] };
        groups.push(group);
      }
      group.files.push(dosya);
    });

    const getFileTime = (f: typeof dosyalar[0]) => {
      if (f.dosya_acilis_tarihi) return new Date(f.dosya_acilis_tarihi).getTime();
      if (f.created_at) return new Date(f.created_at).getTime();
      return 0;
    };

    groups.forEach((g) => {
      g.files.sort((a, b) => getFileTime(b) - getFileTime(a));
    });

    groups.sort((a, b) => {
      const maxA = Math.max(...a.files.map(getFileTime));
      const maxB = Math.max(...b.files.map(getFileTime));
      return maxB - maxA;
    });

    return groups;
  }, [filteredDosyalar, dosyalar]);

  const toplamMaliyet = aktifDosyalar.reduce(
    (acc, d) => acc + (d.yaklasik_maliyet || 0),
    0,
  );
  const tamamlananCount = aktifDosyalar.filter(
    (d) => d.status === "tamamlandi",
  ).length;
  const taslakCount = aktifDosyalar.filter((d) => !d.durum_asama_id).length;

  const formatMoney = (val: number) =>
    val ? val.toLocaleString("tr-TR", { minimumFractionDigits: 2 }) : "0.00";

  const formatDate = (val: string | null | undefined) => {
    if (!val) return "-";
    return new Date(val).toLocaleDateString("tr-TR");
  };

  const getDosyaNoLabel = (d: any) => formatDosyaNo(d);

  const aktifCount = aktifDosyalar.filter(
    (d) => d.durum_asama_id && d.status !== "tamamlandi",
  ).length;

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 p-4 md:p-6 overflow-hidden gap-4 select-none">
      <DosyalarPageHeader
        viewMode={viewMode}
        setViewMode={setViewMode}
        onOpenAI={() => {
          setSelectedFileForAI({
            konu: "Genel Mevzuat Danışmanlığı",
            yaklasik_maliyet: 0,
            temin_no: "Belirtilmemiş",
          });
          setShowAIModal(true);
        }}
      />

      <DosyalarStats
        totalCount={dosyalar.length}
        aktifCount={aktifCount}
        taslakCount={taslakCount}
        toplamMaliyet={toplamMaliyet}
        formatMoney={formatMoney}
      />

      <DosyalarFilterBar
        filterYil={filterYil}
        setFilterYil={setFilterYil}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        uniqueYillar={uniqueYillar}
        filterTur={filterTur}
        setFilterTur={setFilterTur}
        filterProjeId={filterProjeId}
        setFilterProjeId={setFilterProjeId}
        uniqueProjeler={projeler}
        filterTag={filterTag}
        setFilterTag={setFilterTag}
        uniqueTags={uniqueTags}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filteredCount={filteredDosyalar.length}
        totalCount={dosyalar.length}
      />

      <div className="flex-1 flex flex-col gap-5 overflow-hidden">
        <div className="w-full flex flex-col h-full overflow-hidden">
          <DosyalarList
            isLoadingDosyalar={isLoadingDosyalar}
            filteredDosyalar={filteredDosyalar}
            dosyalar={dosyalar}
            viewMode={viewMode}
            filterYil={filterYil}
            filterTur={filterTur}
            groupedDosyalar={groupedDosyalar}
            expandedGroups={expandedGroups}
            searchQuery={searchQuery}
            toggleGroup={toggleGroup}
            activeDosyaId={activeDosyaId}
            setActiveDosyaId={setActiveDosyaId}
            getDosyaNoLabel={getDosyaNoLabel}
            formatMoney={formatMoney}
            formatDate={formatDate}
            handleDelete={handleDelete}
            handleHardDelete={handleHardDelete}
            handleBulkDelete={handleBulkDelete}
            handleBulkHardDelete={handleBulkHardDelete}
            handleUpdateStatus={handleUpdateStatus}
            handleEkapGonder={handleEkapGonder}
            handleKilidiAc={handleKilidiAc}
            logActivity={logActivity}
            handleOpenAI={handleOpenAI}
            handleOpenInNewWindow={handleOpenInNewWindow}
            handleOpenMaliyetAyarlari={handleOpenMaliyetAyarlari}
          />
        </div>
      </div>
      {showAIModal && selectedFileForAI && (
        <AITextGeneratorModal
          isOpen={true}
          isAdvisorMode={true}
          fieldName="Mevzuat Analizi"
          title="Yapay Zeka Asistanı"
          initialPrompt=""
          systemInstruction={selectedFileForAI.konu ===
              "Genel Mevzuat Danışmanlığı"
            ? "Sen profesyonel bir kamu ihale ve doğrudan temin (4734 Sayılı Kanun) asistanısın. Kullanıcıya genel mevzuat veya idari işleyiş hakkında rehberlik edeceksin.\n\nÖNEMLİ GİZLİLİK KURALI: Gerçek kurum veya kişi isimlerini maskele."
            : `Sen profesyonel bir kamu ihale ve doğrudan temin (4734 Sayılı Kanun) asistanısın. Kullanıcı sana sistemdeki bir dosyası hakkında danışacak.\n\nŞu anki Aktif Dosya Bilgileri:\n- Dosya No: [DOSYA_NO]\n- Konu: [DOSYA_KONU]\n- Maliyet: [DOSYA_MALIYET]\n- İhale Şekli (Madde): [DOSYA_IHALE_SEKLI]\n\nÖNEMLİ GİZLİLİK KURALI: Gerçek kurum, şahıs isimleri veya adresleri [Kurum Adı], [İlgili Kişi] şeklinde maskele. Eğer dosyayla ilgili analiz veya rehberlik yaparken dosya numarası, konu, maliyet veya ihale şeklinden bahsedeceksen kesinlikle [DOSYA_NO], [DOSYA_KONU], [DOSYA_MALIYET], [DOSYA_IHALE_SEKLI] şeklinde olan bu yer tutucuları aynen koru, gerçek veriyi asla kullanma.`}
          placeholderMappings={{
            "[DOSYA_NO]": selectedFileForAI.temin_no || "Belirtilmemiş",
            "[DOSYA_KONU]": selectedFileForAI.konu || "Belirtilmemiş",
            "[DOSYA_MALIYET]":
              (selectedFileForAI.yaklasik_maliyet || 0).toLocaleString(
                "tr-TR",
              ) + " TL",
            "[DOSYA_IHALE_SEKLI]": selectedFileForAI.ihale_sekli ||
              "Belirtilmemiş",
            "[KURUM_ADI]": activeMeta?.institution || "Belirtilmemiş",
            "[BIRIM_ADI]": selectedFileForAI.birim_adi || "Belirtilmemiş",
          }}
          onClose={() => {
            setShowAIModal(false);
            setSelectedFileForAI(null);
          }}
          onApply={(text) => {
            console.log("AI tavsiyesi:", text);
            setShowAIModal(false);
            setSelectedFileForAI(null);
          }}
        />
      )}

      {ekapModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-6 w-full max-w-md mx-4 animate-in zoom-in-95 duration-200">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">
              EKAP İhale Kayıt Numarası (İKN)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Lütfen doğrudan temin dosyasını kilitlemek için geçerli bir EKAP
              İKN giriniz.
            </p>
            <input
              type="text"
              value={ekapInputVal}
              onChange={(e) => setEkapInputVal(e.target.value)}
              placeholder="Örn: 2026/12345"
              className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 mb-4 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && ekapInputVal.trim()) {
                  handleEkapGonderSubmit();
                }
              }}
            />
            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={() => setEkapModalOpen(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400 transition-all cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                onClick={handleEkapGonderSubmit}
                disabled={!ekapInputVal.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl disabled:opacity-50 transition-all cursor-pointer"
              >
                Kilitle ve Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedDosyaForMaliyet && (
        <>
          <div
            className="fixed inset-0 bg-black/25 dark:bg-black/50 z-[9998]"
            onClick={() => setSelectedDosyaForMaliyet(null)}
          />
          <div className="fixed right-4 top-[52px] w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-[9999] p-4 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                <Sliders size={14} className="text-blue-500" />
                Yaklaşık Maliyet Ayarları
              </h3>
              <button
                type="button"
                onClick={() => setSelectedDosyaForMaliyet(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
              >
                Kapat
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Yaklaşık Maliyet Hesabı
                </label>
                <select
                  value={selectedDosyaForMaliyet.yaklasik_maliyet_hesaplamasi ||
                    "burada"}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedDosyaForMaliyet({
                      ...selectedDosyaForMaliyet,
                      yaklasik_maliyet_hesaplamasi: val,
                      yaklasik_maliyet: val !== "onceden"
                        ? 0
                        : selectedDosyaForMaliyet.yaklasik_maliyet,
                    });
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200 font-semibold"
                >
                  <option value="burada">
                    Burada Hesaplanacak (Teklifler ile)
                  </option>
                  <option value="onceden">
                    Önceden Hesaplandı (Tutar Girilecek)
                  </option>
                  <option value="hesaplanmayacak">Hesaplanmayacak</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Yaklaşık Maliyet KDV Durumu
                </label>
                <select
                  value={selectedDosyaForMaliyet
                    .yaklasik_maliyet_kdv_dahil_mi ?? 0}
                  onChange={(e) => {
                    const newKdvDahilMi = Number(e.target.value);
                    const oldKdvDahilMi =
                      selectedDosyaForMaliyet.yaklasik_maliyet_kdv_dahil_mi ??
                        0;
                    const kdvRate = Number(selectedDosyaForMaliyet.kdv) || 20;
                    let currentVal = selectedDosyaForMaliyet.yaklasik_maliyet ||
                      0;

                    if (newKdvDahilMi !== oldKdvDahilMi) {
                      if (newKdvDahilMi === 1) {
                        currentVal = currentVal * (1 + kdvRate / 100);
                      } else {
                        currentVal = currentVal / (1 + kdvRate / 100);
                      }
                    }

                    setSelectedDosyaForMaliyet({
                      ...selectedDosyaForMaliyet,
                      yaklasik_maliyet_kdv_dahil_mi: newKdvDahilMi,
                      yaklasik_maliyet: Number(currentVal.toFixed(2)),
                    });
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200 font-semibold"
                >
                  <option value={0}>KDV Hariç</option>
                  <option value={1}>KDV Dahil</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Yaklaşık Maliyet (₺)
                </label>
                <input
                  type="number"
                  disabled={selectedDosyaForMaliyet
                    .yaklasik_maliyet_hesaplamasi !== "onceden"}
                  value={selectedDosyaForMaliyet.yaklasik_maliyet ?? ""}
                  onChange={(e) =>
                    setSelectedDosyaForMaliyet({
                      ...selectedDosyaForMaliyet,
                      yaklasik_maliyet: e.target.value === ""
                        ? 0
                        : Number(e.target.value),
                    })}
                  placeholder="0.00"
                  className={`w-full px-3 py-2 border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold ${
                    selectedDosyaForMaliyet.yaklasik_maliyet_hesaplamasi !==
                        "onceden"
                      ? "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
                      : "bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                  }`}
                />
                {selectedDosyaForMaliyet.yaklasik_maliyet_hesaplamasi ===
                    "burada" && (
                  <p className="text-[10px] text-blue-500 mt-1 font-medium">
                    💡 Bu tutar, teklifler girildiğinde otomatik olarak
                    hesaplanacaktır.
                  </p>
                )}
                {selectedDosyaForMaliyet.yaklasik_maliyet_hesaplamasi ===
                    "hesaplanmayacak" && (
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">
                    💡 Bu dosya için yaklaşık maliyet hesaplanmayacaktır.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  KDV Oranı (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={selectedDosyaForMaliyet.kdv !== undefined
                    ? selectedDosyaForMaliyet.kdv
                    : "20"}
                  onChange={(e) =>
                    setSelectedDosyaForMaliyet({
                      ...selectedDosyaForMaliyet,
                      kdv: e.target.value,
                    })}
                  placeholder="Örn: 20"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedDosyaForMaliyet(null)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400 transition-all cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  onClick={handleSaveMaliyetAyarlari}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all cursor-pointer"
                >
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

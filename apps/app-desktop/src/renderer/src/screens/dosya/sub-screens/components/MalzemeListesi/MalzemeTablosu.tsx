import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Check,
  Edit2,
  FileCheck,
  FileSpreadsheet,
  FileText,
  History as HistoryIcon,
  Info,
  Package,
  Plus,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { cn } from "../../../../../utils/cn";
import { MalzemeTabloPopover } from "./components/MalzemeTabloPopover";
import { useSettingsStore } from "../../../../../store/settingsStore";
import { PrintDropdownButtonV2 } from "@renderer/screens/dosya/components/PrintDropdownButtonV2";
import { normalizeForMatch } from "../../DosyaAsamalari/useDosyaAsamasiSablonsV2";
import { exportDogrudanTeminMasterExcel } from "../../../../../services/excelExportService";
import { useGlobalDocumentPreviewStore } from "../../../../../store/globalDocumentPreviewStore";

export function MalzemeTablosu({
  state,
  stageSablons = [],
  dagitimSablons = [],
  sablons = [],
  onSablonClick,
  ciktiLoading,
  activeStarredDocs = [],
  onQuickPrint,
  onExport,
  onOpenExternal,
  isSablonDisabled,
  activeDosya,
  activeDosyaId,
}: {
  state: any;
  stageSablons?: any[];
  dagitimSablons?: any[];
  sablons?: any[];
  onSablonClick?: (sablon: any, title: string) => void;
  ciktiLoading?: boolean;
  activeStarredDocs?: string[] | null;
  onQuickPrint?: (sablon: any) => void;
  onExport?: (sablon: any, format: "pdf" | "docx" | "udf") => void;
  onOpenExternal?: (sablon: any) => void;
  isSablonDisabled?: (cleanName: string) => boolean;
  activeDosya?: any;
  activeDosyaId?: number | null;
}): React.JSX.Element {
  const {
    items,
    units,
    loading,
    setIsAddModalOpen,
    editingId,
    setEditingId,
    editMiktar,
    setEditMiktar,
    editBirim,
    setEditBirim,
    editKdv,
    setEditKdv,
    handleStartEdit,
    handleSaveEdit,
    handleDeleteItem,
    loadData,
  } = state;

  const { disableDocumentGuidance } = useSettingsStore();

  // Çoklu komisyon seçimi — değerler DB'den gelen id (number)
  const [selectedKomisyonlar, setSelectedKomisyonlar] = useState<number[]>([]);
  // Komisyon paneli açık/kapalı
  const [komisyonPanelOpen, setKomisyonPanelOpen] = useState(false);

  // Checkbox ve toplu işlem state'leri
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const handleToggleSelectRow = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((item: any) => item.id)));
    }
  };

  const handleDeleteSelected = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) {
      alert("Lütfen silinecek ihtiyaç kalemlerini seçin.");
      return;
    }
    if (
      !confirm(`Seçilen ${ids.length} kalemi silmek istediğinize emin misiniz?`)
    ) return;

    try {
      for (const id of ids) {
        await (window as any).electron.ipcRenderer.invoke(
          "db:run",
          "DELETE FROM DATA_TeminKalem WHERE id = ?",
          [id],
        );
      }
      setSelectedIds(new Set());
      if (loadData) loadData();
    } catch (err: any) {
      alert("Silme işleminde hata oluştu: " + err.message);
    }
  };

  const handleExcelImport = async () => {
    if (!activeDosyaId) return;
    try {
      const res = await (window as any).electron.ipcRenderer.invoke(
        "open-excel",
      );
      if (!res) return;

      const XLSX = await import("xlsx");
      const workbook = XLSX.read(res.buffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const rows = XLSX.utils.sheet_to_json<any[]>(workbook.Sheets[sheetName], {
        header: 1,
      });

      if (rows.length <= 1) {
        alert("Seçilen Excel dosyasında veri bulunamadı veya boş.");
        return;
      }

      let count = 0;
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;

        const kalemAdi = row[2] ? String(row[2]).trim() : null;
        if (!kalemAdi) continue;

        const tasinirKodu = row[0] ? String(row[0]).trim() : null;
        const okasKodu = row[1] ? String(row[1]).trim() : null;
        const tipi = row[3] ? String(row[3]).trim() : "Mal";
        const birim = row[4] ? String(row[4]).trim() : "Adet";
        const miktar = row[5] !== undefined ? Number(row[5]) : 1;
        const kdvOrani = row[6] !== undefined ? Number(row[6]) : 20;
        const aciklama = row[7] ? String(row[7]).trim() : null;

        await (window as any).electron.ipcRenderer.invoke(
          "db:run",
          `INSERT INTO DATA_TeminKalem 
           (temin_dosya_id, tasinir_kodu, okas_kodu, kalem_adi, tipi, birim, miktar, kdv_orani, aciklama) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            activeDosyaId,
            tasinirKodu,
            okasKodu,
            kalemAdi,
            tipi,
            birim,
            miktar,
            kdvOrani,
            aciklama,
          ],
        );
        count++;
      }

      if (count > 0) {
        alert(`${count} adet ihtiyaç kalemi başarıyla içe aktarıldı.`);
        if (loadData) loadData();
      } else {
        alert(
          "İçe aktarıldı: İçe aktarılacak geçerli satır bulunamadı. Lütfen Kalem Adı kolonunun (C sütunu) dolu olduğundan emin olun.",
        );
      }
    } catch (err: any) {
      alert("Excel aktarımında hata: " + err.message);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const res = await (window as any).electron.ipcRenderer.invoke(
        "db:export-temin-kalem-template",
      );
      if (res && res.success) {
        alert(`Excel şablonu başarıyla indirildi:\n${res.filePath}`);
      } else if (res && res.error) {
        if (res.error !== "İptal edildi") {
          alert("Şablon indirilemedi: " + res.error);
        }
      }
    } catch (err: any) {
      alert("Hata oluştu: " + err.message);
    }
  };

  const handleExportToLibrary = async () => {
    if (items.length === 0) {
      alert("Aktarılacak ihtiyaç kalemi bulunmuyor.");
      return;
    }
    if (
      !confirm(
        `Tablodaki ${items.length} ihtiyaç kalemini genel malzeme kütüphanesine aktarmak istediğinize emin misiniz?`,
      )
    ) {
      return;
    }

    try {
      let addedCount = 0;
      let skippedCount = 0;

      // Get all existing library items
      const libRes = await (window as any).electron.ipcRenderer.invoke(
        "db:query",
        "SELECT tasinir_kodu, okas_kodu, kalem_adi FROM TANIM_Kalem",
      );
      const libItems = libRes.success ? libRes.data : [];

      const cleanString = (str: string) => {
        if (!str) return "";
        return str
          .toLowerCase()
          .replace(/[\s\-_.,\/\\()]/g, "") // spaces, dots, dashes, slashes, parens
          .replace(/ı/g, "i")
          .replace(/ğ/g, "g")
          .replace(/ü/g, "u")
          .replace(/ş/g, "s")
          .replace(/ö/g, "o")
          .replace(/ç/g, "c");
      };

      for (const item of items) {
        const cleanName = cleanString(item.kalem_adi);
        if (!cleanName) {
          skippedCount++;
          continue;
        }

        // Check if there is an almost matching item
        let isDup = false;
        for (const lib of libItems) {
          const cleanLibName = cleanString(lib.kalem_adi);

          // 1. Exact cleaned name match (case and spacing variations)
          if (cleanName === cleanLibName) {
            isDup = true;
            break;
          }

          // 2. Same code and one name is a substring of the other (almost matching)
          const sameTasinir = item.tasinir_kodu &&
            lib.tasinir_kodu &&
            item.tasinir_kodu.trim() === lib.tasinir_kodu.trim();
          const sameOkas = item.okas_kodu && lib.okas_kodu &&
            item.okas_kodu.trim() === lib.okas_kodu.trim();

          if (sameTasinir || sameOkas) {
            if (
              cleanName.includes(cleanLibName) ||
              cleanLibName.includes(cleanName)
            ) {
              isDup = true;
              break;
            }
          }
        }

        if (isDup) {
          skippedCount++;
          continue;
        }

        // Generate a unique barkod_id/ID
        const barkodId = `LIB-${Date.now()}-${
          Math.random().toString(36).substr(2, 5)
        }`;

        // Insert into global library
        const insertRes = await (window as any).electron.ipcRenderer.invoke(
          "db:run",
          `INSERT INTO TANIM_Kalem (barkod_id, tasinir_kodu, okas_kodu, kalem_adi, tipi, birim, kdv_orani, aktif_mi)
           VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
          [
            barkodId,
            item.tasinir_kodu || null,
            item.okas_kodu || null,
            item.kalem_adi,
            item.tipi || "Mal",
            item.birim || "Adet",
            item.kdv_orani ?? 20,
          ],
        );
        if (insertRes.success) {
          addedCount++;
          // Push to temporary list so we don't duplicate within the same batch!
          libItems.push({
            tasinir_kodu: item.tasinir_kodu || "",
            okas_kodu: item.okas_kodu || "",
            kalem_adi: item.kalem_adi,
          });
        }
      }

      alert(
        `Aktarım tamamlandı.\nKütüphaneye eklenen yeni kalem: ${addedCount}\nMevcut/Benzer olduğu için atlanan kalem: ${skippedCount}`,
      );
    } catch (err: any) {
      alert("Kütüphaneye aktarılırken hata oluştu: " + err.message);
    }
  };

  // DB'deki aktif komisyonları dinamik çek
  const { data: dbKomisyonlar = [] } = useQuery<
    { id: number; ad: string; sablonlar: any[] }[]
  >({
    queryKey: ["tanim_komisyonlar_with_sablons"],
    queryFn: async () => {
      const res = await (window as any).electron.ipcRenderer.invoke(
        "db:query",
        "SELECT id, ad FROM TANIM_Komisyon WHERE aktif_mi = 1 ORDER BY id ASC",
      );
      if (!res.success) throw new Error(res.error);

      const sablonlarRes = await (window as any).electron.ipcRenderer.invoke(
        "db:query",
        `SELECT ks.komisyon_id, s.id, s.ad, s.aciklama, s.icerik, s.dosya_adi, s.route_path, s.test_verisi, s.kategori 
         FROM TANIM_Komisyon_Sablon ks
         JOIN TANIM_Sablon s ON ks.sablon_id = s.id
         WHERE s.aktif_mi = 1`,
      );

      const allCommissions = res.data.map((k: any) => ({
        ...k,
        sablonlar: sablonlarRes.success
          ? sablonlarRes.data.filter((s: any) => s.komisyon_id === k.id)
          : [],
      }));

      // 1. Adım olduğu için Muayene komisyonlarını bu listede göstermiyoruz
      return allCommissions.filter((k: any) =>
        !k.ad.toLowerCase().includes("muayene")
      );
    },
    enabled: komisyonPanelOpen,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (activeDosyaId) {
      const saved = localStorage.getItem(
        `dta_selected_komisyonlar_${activeDosyaId}`,
      );
      const timer = setTimeout(() => {
        if (saved) {
          try {
            setSelectedKomisyonlar(JSON.parse(saved));
          } catch {
            /* ignore */
          }
        }
      }, 0);
      return () => clearTimeout(timer);
    }
    return;
  }, [activeDosyaId]);

  // Çoklu komisyon onaylama — seçilen komisyon ID'lerine göre DB'yi güncelle
  const handleKomisyonlarOnayla = async (
    seciliKomisyonIdleri: number[],
  ): Promise<void> => {
    if (!activeDosyaId) return;
    try {
      await (window as any).electron.ipcRenderer.invoke(
        "db:run",
        "DELETE FROM DATA_TeminKomisyon WHERE temin_dosya_id = ?",
        [activeDosyaId],
      );

      for (const komisyonId of seciliKomisyonIdleri) {
        const komisyonData = dbKomisyonlar.find((k) => k.id === komisyonId);
        if (!komisyonData) continue;

        const res = await (window as any).electron.ipcRenderer.invoke(
          "db:query",
          `SELECT u.*, p.ad_soyad, p.unvan, g.ad as gorev_adi 
           FROM TANIM_KomisyonUye u 
           JOIN TANIM_Personel p ON u.personel_id = p.id 
           JOIN TANIM_KomisyonGorevi g ON u.gorev_id = g.id 
           WHERE u.komisyon_id = ?`,
          [komisyonId],
        );
        if (res.success && res.data) {
          for (const member of res.data) {
            await (window as any).electron.ipcRenderer.invoke(
              "db:run",
              `INSERT INTO DATA_TeminKomisyon 
               (temin_dosya_id, komisyon_id, personel_id, ad_soyad, unvan, gorev, rol, komisyon_turu) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                activeDosyaId,
                komisyonId,
                member.personel_id,
                member.ad_soyad,
                member.unvan || null,
                member.gorev_adi === "Komisyon Başkanı" ? "Başkan" : "Üye",
                member.asil_mi === 1 ? "Asil" : "Yedek",
                komisyonData.ad,
              ],
            );
          }
        }
      }

      localStorage.setItem(
        `dta_selected_komisyonlar_${activeDosyaId}`,
        JSON.stringify(seciliKomisyonIdleri),
      );
      setSelectedKomisyonlar(seciliKomisyonIdleri);
      setKomisyonPanelOpen(false);
    } catch (e: any) {
      alert("Komisyon güncellenirken hata oluştu: " + e.message);
    }
  };

  const validSelectedKomisyonlar = useMemo(() => {
    return selectedKomisyonlar.filter((id) =>
      dbKomisyonlar.some((k) => k.id === id)
    );
  }, [selectedKomisyonlar, dbKomisyonlar]);

  const komisyonSablons = useMemo(() => {
    const sablonsToAdd: any[] = [];
    for (const komisyonId of validSelectedKomisyonlar) {
      const k = dbKomisyonlar.find((k) => k.id === komisyonId);
      if (k && k.sablonlar) {
        for (const s of k.sablonlar) {
          if (!sablonsToAdd.find((existing) => existing.id === s.id)) {
            const fullSablon = sablons?.find((fullS: any) =>
              fullS.dosya_adi === s.dosya_adi || fullS.id === s.id
            ) ||
              s;
            sablonsToAdd.push(fullSablon);
          }
        }
      }
    }
    return sablonsToAdd;
  }, [validSelectedKomisyonlar, dbKomisyonlar, sablons]);

  const combinedSablons = useMemo(() => {
    const baseSablons = [...stageSablons];
    for (const s of komisyonSablons) {
      if (!baseSablons.find((existing) => existing.id === s.id)) {
        baseSablons.push(s);
      }
    }
    return baseSablons;
  }, [stageSablons, komisyonSablons]);

  const handleOpenSablonByDosyaAdi = (targetKey: string) => {
    const ALIAS_MAP: Record<string, string[]> = {
      "teklif-isteme-mektubu": [
        "fiyat-arastirma-mektubu",
        "arastirma-mektubu",
        "birim-fiyat-teklif-mektubu",
        "teklif-isteme-mektubu",
      ],
      "teklif-mektubu-dagitim": [
        "dagitim-cizelgesi",
        "teklif-mektubu-dagitim-cizelgesi",
        "teklif-mektubu-dagitim",
      ],
      "teklif-mektubu-dagitim-karma": [
        "dagitim-cizelgesi-karma",
        "teklif-mektubu-dagitim-karma",
        "teklif-mektubu-karma",
      ],
      "firmalar-teklif-cetveli": [
        "birim-fiyat-teklif-cetveli",
        "firmalar-teklif-cetveli",
        "piyasa-fiyat-arastirmasi-sonuc-cetveli",
      ],
      "yasaklilik-sorgulama-tutanagi": [
        "yasaklilik-sorgulama-tutanagi",
        "yasaklilik-sorgulama",
        "ekap-yasaklilik",
      ],
      "piyasa-fiyat-arastirma-gorevlendirmesi": [
        "piyasa-fiyat-arastirma-gorevlendirmesi",
      ],
      "piyasa-fiyat-arastirma-tutanagi": [
        "piyasa-fiyat-arastirma-tutanagi",
        "fiyat-arastirmasi-tutanagi",
      ],
      "yaklasik-maliyet-cetveli": [
        "yaklasik-maliyet-cetveli",
        "yaklasik-maliyet-hesap-cetveli",
      ],
      "dogrudan-temin-onay-belgesi": [
        "dogrudan-temin-onay-belgesi",
        "idare-onay-belgesi",
        "onay-belgesi",
      ],
    };

    const cleanTarget = targetKey.replace(/\.html$/, "").toLowerCase().trim();
    const candidateKeys = ALIAS_MAP[cleanTarget] || [cleanTarget];

    let foundSablon: any = null;

    if (sablons && sablons.length > 0) {
      // 1. Exact match on dosya_adi (with or without .html)
      for (const key of candidateKeys) {
        foundSablon = sablons.find((s: any) => {
          const fileBase = (s.dosya_adi || "").replace(/\.html$/, "").toLowerCase().trim();
          return fileBase === key;
        });
        if (foundSablon) break;
      }

      // 2. Exact match on route_path or id
      if (!foundSablon) {
        for (const key of candidateKeys) {
          foundSablon = sablons.find((s: any) => {
            const route = (s.route_path || s.id || "").toLowerCase().trim();
            return route === key;
          });
          if (foundSablon) break;
        }
      }

      // 3. Fallback: Normalized title exact match to prevent cross-contamination
      if (!foundSablon) {
        for (const key of candidateKeys) {
          const normKey = normalizeForMatch(key);
          foundSablon = sablons.find((s: any) => {
            const normSablonName = normalizeForMatch(s.ad || s.dosya_adi || "");
            return normSablonName === normKey;
          });
          if (foundSablon) break;
        }
      }
    }

    if (foundSablon && onSablonClick) {
      onSablonClick(foundSablon, foundSablon.ad);
    } else {
      useGlobalDocumentPreviewStore.getState().openDocument({
        documentId: cleanTarget,
        dosyaId: activeDosyaId || undefined,
        documentTitle: targetKey
          .replace(/-/g, " ")
          .replace(/\.html$/, "")
          .toLocaleUpperCase("tr-TR"),
      });
    }
  };

  const isYapim =
    activeDosya?.tur === "yapim_isi" ||
    activeDosya?.tur === "yapim" ||
    activeDosya?.ihale_tipi === "Hakediş";
  const isHizmet = activeDosya?.tur === "hizmet";

  const [isExportingMasterExcel, setIsExportingMasterExcel] = useState(false);

  const handleExportMasterExcel = async (): Promise<void> => {
    if (!activeDosyaId) return;
    try {
      setIsExportingMasterExcel(true);
      const firmalarRes = await (window as any).electron.ipcRenderer.invoke(
        "db:query",
        `SELECT f.*, tf.id as temin_firma_id, tf.kazandi_mi, tf.teklif_toplami 
         FROM DATA_TeminFirma tf 
         JOIN TANIM_Firma f ON tf.firma_id = f.id 
         WHERE tf.temin_dosya_id = ?`,
        [activeDosyaId],
      );

      const tekliflerRes = await (window as any).electron.ipcRenderer.invoke(
        "db:query",
        "SELECT * FROM DATA_TeminKalemTeklif WHERE temin_dosya_id = ?",
        [activeDosyaId],
      );

      const komisyonRes = await (window as any).electron.ipcRenderer.invoke(
        "db:query",
        "SELECT * FROM DATA_TeminKomisyon WHERE temin_dosya_id = ?",
        [activeDosyaId],
      );

      const kurumRes = await (window as any).electron.ipcRenderer.invoke(
        "db:query",
        "SELECT * FROM TANIM_Kurum LIMIT 1",
      );

      await exportDogrudanTeminMasterExcel({
        dosya: activeDosya,
        kalemler: items,
        firmalar: firmalarRes.success ? firmalarRes.data : [],
        teklifler: tekliflerRes.success ? tekliflerRes.data : [],
        komisyon: komisyonRes.success ? komisyonRes.data : [],
        kurum: kurumRes.success ? kurumRes.data?.[0] : null,
        sablons: sablons,
      });
    } catch (err: any) {
      alert("Master Excel raporu hazırlanırken hata oluştu: " + err.message);
    } finally {
      setIsExportingMasterExcel(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col min-h-[400px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Package className="w-4 h-4 text-blue-600" />
          {isYapim
            ? "Dosyadaki İmalat / İş Kalemleri (Pozlar)"
            : isHizmet
            ? "Dosyadaki Hizmet Kalemleri"
            : "Dosyadaki İhtiyaç Kalemleri"}
          <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full font-bold">
            {items.length}
          </span>
        </h3>
        <div className="flex items-center gap-2 relative">
          <button
            onClick={handleExportMasterExcel}
            disabled={isExportingMasterExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
            title="Tüm Doğrudan Temin Sürecini, Şablonları ve Kalemleri Excel (XLSX) Formatında İndir"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            {isExportingMasterExcel ? "Hazırlanıyor..." : "Master Excel İndir"}
          </button>

          <button
            onClick={() => handleOpenSablonByDosyaAdi("son-alim-fiyat-cetveli")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
          >
            <HistoryIcon className="w-3.5 h-3.5" />
            Son Alım Fiyat Cetveli
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            {isYapim
              ? "Poz / İmalat Ekle"
              : isHizmet
              ? "Hizmet Kalemi Ekle"
              : "İhtiyaç Kalemi Ekle"}
          </button>

          {!disableDocumentGuidance && combinedSablons.length > 0 &&
            onSablonClick && (
            <>
              <PrintDropdownButtonV2
                kategori="1-ihtiyac-tespiti-ve-baslangic"
                sablons={sablons}
                overrideSablons={combinedSablons}
                activeStarredDocs={activeStarredDocs || []}
                ciktiLoading={ciktiLoading || false}
                handleOpenPreviewForSablon={onSablonClick}
                quickPrint={async (sablon) =>
                  onQuickPrint && onQuickPrint(sablon)}
                quickExport={async (sablon, format) =>
                  onExport && onExport(sablon, format)}
                quickOpenExternal={async (sablon) =>
                  onOpenExternal && onOpenExternal(sablon)}
                isSablonDisabled={isSablonDisabled}
                buttonHeightClass="py-1.5"
              />
            </>
          )}

          <MalzemeTabloPopover
            step={1}
            selectedCount={selectedIds.size}
            totalCount={items.length}
            onSelectAll={handleToggleSelectAll}
            onDeleteSelected={handleDeleteSelected}
            onExportMasterExcel={handleExportMasterExcel}
            onExcelImport={handleExcelImport}
            onDownloadTemplate={handleDownloadTemplate}
            onExportToLibrary={handleExportToLibrary}
            onKomisyonSettings={() => setKomisyonPanelOpen(true)}
            disableDocumentGuidance={disableDocumentGuidance}
            onIhtiyacListesi={() =>
              handleOpenSablonByDosyaAdi("ihtiyac-listesi")}
            onIhtiyacTalepFormu={() =>
              handleOpenSablonByDosyaAdi("ihtiyac-talep-formu")}
            onLuzumMuzekkeresi={() =>
              handleOpenSablonByDosyaAdi("luzum-muzekkeresi")}
            onLuzumMuzekkeresiOnayEki={() =>
              handleOpenSablonByDosyaAdi("luzum-muzekkeresi-onay-eki")}
            onLuzumMuzekkeresiTeslimTesellum={() =>
              handleOpenSablonByDosyaAdi("luzum-muzekkeresi-teslim-tesellum")}
            onHarcamaTalimati={() =>
              handleOpenSablonByDosyaAdi("harcama-talimati")}
            onHarcamaPusulasi={() =>
              handleOpenSablonByDosyaAdi("harcama-pusulasi")}
            onGorevlendirmeOnayi={() =>
              handleOpenSablonByDosyaAdi("komisyon-gorevlendirme-onayi")}
            onGorevlendirmeOnayEki={() =>
              handleOpenSablonByDosyaAdi("komisyon-gorevlendirme-onayi-eki")}
            onFiyatArastirmaKomisyonu={() =>
              handleOpenSablonByDosyaAdi(
                "piyasa-fiyat-arastirma-gorevlendirmesi",
              )}
            onYaklasikMaliyetKomisyonu={() =>
              handleOpenSablonByDosyaAdi("yaklasik-maliyet-tespit-komisyonu")}
            onSonAlimCetveli={() =>
              handleOpenSablonByDosyaAdi("son-alim-fiyat-cetveli")}
            onOnayBelgesi={() =>
              handleOpenSablonByDosyaAdi("dogrudan-temin-onay-belgesi")}
          />
        </div>
      </div>

      {/* 1. Aşama Süreç & Ekler Rehberi (Mevzuat & Deneyim Notu) */}
      {!disableDocumentGuidance && (
        <div className="mb-4 p-3.5 bg-linear-to-r from-blue-50/80 via-indigo-50/50 to-slate-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-slate-900/40 border border-blue-100 dark:border-blue-900/30 rounded-2xl text-xs text-slate-700 dark:text-slate-300 shadow-xs">
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg shrink-0 mt-0.5">
              <Info className="w-4 h-4" />
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-slate-100 text-xs tracking-tight">
                  1. Aşama: İhtiyaç Tespiti, Onay & Ekler Rehberi
                </span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold bg-blue-100/60 dark:bg-blue-900/40 px-2 py-0.5 rounded-full">
                  Mevzuat & Deneyim Notu
                </span>
              </div>
              <p className="text-[11.5px] leading-relaxed text-slate-600 dark:text-slate-300">
                • <strong>Lüzum Müzekkeresi Onay Eki (Ek-1):</strong> Talep edilen malzeme/ihtiyaç listesi ve onay tablosu <u>Ek-1</u> olarak düzenlenir, Lüzum Müzekkeresi ile harcama yetkilisine sunulur.
                <br />
                • <strong>Komisyon Görevlendirme Onayı Eki (Ek-2):</strong> Fiyat araştırması ve muayene-kabul işlemlerini yürütecek görevli personellerin unvan ve görev listesi <u>Ek-2</u> olarak görevlendirme onayına bağlanır.
                <br />
                • <strong>Harcama Talimatı / Onay Belgesi:</strong> İhtiyaçlar ve görevliler netleştikten sonra 4734 Sayılı Kanun (Md. 22) kapsamında doğrudan temin alım sürecini resmi olarak başlatan temel idari belgedir.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-blue-100/70 dark:border-blue-900/30">
                <span className="text-[10.5px] font-bold text-slate-500 dark:text-slate-400">Hızlı Belge Erişimi:</span>
                <button
                  type="button"
                  onClick={() => handleOpenSablonByDosyaAdi("luzum-muzekkeresi-onay-eki")}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer shadow-xs"
                >
                  <FileText className="w-3 h-3 text-blue-500" />
                  Lüzum Müzekkeresi Onay Eki (Ek-1)
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenSablonByDosyaAdi("komisyon-gorevlendirme-onayi-eki")}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer shadow-xs"
                >
                  <Users className="w-3 h-3 text-blue-500" />
                  Komisyon Görevlendirme Eki (Ek-2)
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenSablonByDosyaAdi("harcama-talimati")}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer shadow-xs"
                >
                  <FileCheck className="w-3 h-3 text-teal-500" />
                  Harcama Talimatı
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Komisyon Onay Belgeleri Paneli */}
      {items.length > 0 && activeDosya?.tur === "mal" && (
        <div className="mx-4 mb-4">
          {/* Açılan Panel */}
          {komisyonPanelOpen &&
            (() => {
              const isDisabled = ciktiLoading ||
                selectedKomisyonlar.length === 0;

              return (
                <div className="mt-1.5 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4 animate-in fade-in slide-in-from-top-1">
                  {/* Görevlendirilecek Komisyonlar — DB'den dinamik */}
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Görevlendirilecek Komisyonlar
                    </p>
                    <div className="space-y-2">
                      {dbKomisyonlar.length === 0
                        ? (
                          <div className="text-xs text-slate-400 italic px-2 py-1">
                            Komisyon bulunamadı. "Komisyon Yönetimi" ekranından
                            komisyon ekleyiniz.
                          </div>
                        )
                        : (
                          dbKomisyonlar.map((k) => (
                            <label
                              key={k.id}
                              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border cursor-pointer transition-all ${
                                selectedKomisyonlar.includes(k.id)
                                  ? "border-blue-500 bg-blue-50/60 dark:bg-blue-900/20 shadow-sm shadow-blue-500/10"
                                  : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                              }`}
                            >
                              <input
                                type="checkbox"
                                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                                checked={selectedKomisyonlar.includes(k.id)}
                                onChange={(e) => {
                                  const next = e.target.checked
                                    ? [...selectedKomisyonlar, k.id]
                                    : selectedKomisyonlar.filter((v) =>
                                      v !== k.id
                                    );
                                  setSelectedKomisyonlar(next);
                                }}
                              />
                              <span
                                className={`text-xs font-semibold ${
                                  selectedKomisyonlar.includes(k.id)
                                    ? "text-blue-700 dark:text-blue-400"
                                    : "text-slate-700 dark:text-slate-300"
                                }`}
                              >
                                {k.ad}
                              </span>
                            </label>
                          ))
                        )}
                    </div>
                  </div>

                  {/* Aksiyon Butonları */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setKomisyonPanelOpen(false)}
                      className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer font-bold"
                    >
                      Kapat
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={isDisabled}
                        onClick={() =>
                          handleKomisyonlarOnayla(selectedKomisyonlar)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Görevlendirmeyi Onayla
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
        </div>
      )}

      {loading
        ? (
          <div className="flex-1 flex items-center justify-center text-xs text-slate-400 italic">
            Yükleniyor...
          </div>
        )
        : items.length === 0
        ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <Package className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-xs">
              {isYapim
                ? "Bu dosyada henüz herhangi bir imalat veya poz kalemi eklenmemiş."
                : isHizmet
                ? "Bu dosyada henüz herhangi bir hizmet kalemi eklenmemiş."
                : "Bu dosyada henüz herhangi bir ihtiyaç kalemi eklenmemiş."}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">
              {isYapim
                ? "Yukarıdaki butonu kullanarak ilk imalat/poz kalemini ekleyebilirsiniz."
                : isHizmet
                ? "Yukarıdaki butonu kullanarak ilk hizmet kalemini ekleyebilirsiniz."
                : "Yukarıdaki butonu kullanarak ilk ihtiyaç kalemini ekleyebilirsiniz."}
            </p>
          </div>
        )
        : (
          <div className="overflow-x-auto custom-scrollbar flex-1">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="sticky top-0 bg-slate-50 dark:bg-slate-950 text-slate-500 font-bold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="p-3 pl-4 w-10">
                    <input
                      type="checkbox"
                      checked={items.length > 0 &&
                        selectedIds.size === items.length}
                      onChange={handleToggleSelectAll}
                      className="rounded border-slate-350 text-blue-600 focus:ring-blue-500/20 cursor-pointer"
                    />
                  </th>
                  <th className="p-3 pl-4">Sıra No</th>
                  <th className="p-3 pl-4">
                    {isYapim ? "Poz No" : isHizmet ? "Hizmet Kodu" : "Kodu"}
                  </th>
                  <th className="p-3 pl-4">
                    {isYapim
                      ? "İmalat / Poz Adı (İş Kalemi)"
                      : isHizmet
                      ? "Hizmet Kalemi Adı"
                      : "İhtiyaç Kalemi Adı"}
                  </th>
                  <th className="p-3">Tür</th>
                  <th className="p-3 text-center">Miktar</th>
                  <th className="p-3">Birim</th>
                  <th className="p-3 text-center">KDV (%)</th>
                  <th className="p-3 text-right pr-4">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {items.map((item: any, index: number) => {
                  const isEditing = editingId === item.id;
                  return (
                    <tr
                      key={item.id}
                      className={cn(
                        "hover:bg-slate-50/50 dark:hover:bg-slate-800/10",
                        selectedIds.has(item.id) &&
                          "bg-blue-50/30 dark:bg-blue-955/15",
                      )}
                    >
                      <td className="p-3 pl-4 w-10">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(item.id)}
                          onChange={() => handleToggleSelectRow(item.id)}
                          className="rounded border-slate-350 text-blue-600 focus:ring-blue-500/20 cursor-pointer"
                        />
                      </td>
                      <td className="p-3 pl-4 font-mono text-[10px] text-slate-500 dark:text-slate-400">
                        {index + 1}
                      </td>

                      <td className="p-3 pl-4 font-mono text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                        {item.tasinir_kodu || "-"}
                      </td>

                      <td className="p-3 pl-4">
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {item.kalem_adi}
                        </div>
                        {item.okas_kodu && (
                          <div className="text-[9px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                            OKAS: {item.okas_kodu}
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <span
                          className={cn(
                            "px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase",
                            item.tipi === "Mal" &&
                              "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
                            item.tipi === "Hizmet" &&
                              "bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400",
                            item.tipi === "Yapım" &&
                              "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
                            item.tipi === "Danışmanlık" &&
                              "bg-pink-50 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400",
                          )}
                        >
                          {item.tipi}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        {isEditing
                          ? (
                            <input
                              type="number"
                              step="0.01"
                              value={editMiktar}
                              onChange={(e) =>
                                setEditMiktar(parseFloat(e.target.value) || 1)}
                              className="w-16 p-1 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-955 rounded text-center text-xs font-bold"
                            />
                          )
                          : (
                            <span className="font-black text-slate-750 dark:text-slate-300">
                              {item.miktar}
                            </span>
                          )}
                      </td>
                      <td className="p-3">
                        {isEditing
                          ? (
                            <select
                              value={editBirim}
                              onChange={(e) => setEditBirim(e.target.value)}
                              className="p-1 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-955 rounded text-xs"
                            >
                              {units.map((u: any, idx: number) => (
                                <option key={idx} value={u.ad}>
                                  {u.ad}
                                </option>
                              ))}
                            </select>
                          )
                          : <span>{item.birim}</span>}
                      </td>
                      <td className="p-3 text-center">
                        {isEditing
                          ? (
                            <select
                              value={editKdv}
                              onChange={(e) =>
                                setEditKdv(parseInt(e.target.value, 10))}
                              className="p-1 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-955 rounded text-xs"
                            >
                              <option value="0">%0</option>
                              <option value="1">%1</option>
                              <option value="10">%10</option>
                              <option value="20">%20</option>
                            </select>
                          )
                          : <span>%{item.kdv_orani}</span>}
                      </td>
                      <td className="p-3 text-right pr-4">
                        <div className="flex justify-end gap-2">
                          {isEditing
                            ? (
                              <>
                                <button
                                  onClick={() => handleSaveEdit(item.id)}
                                  className="p-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-900/30 border border-emerald-250 dark:border-emerald-900/40 hover:border-emerald-300 dark:hover:border-emerald-800 text-emerald-600 dark:text-emerald-450 rounded-lg transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95 flex items-center justify-center"
                                  title="Değişiklikleri Kaydet"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="p-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-955/20 dark:hover:bg-red-950/30 border border-red-250 dark:border-red-900/40 hover:border-red-300 dark:hover:border-red-800 text-red-500 dark:text-red-400 rounded-lg transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95 flex items-center justify-center"
                                  title="İptal"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )
                            : (
                              <>
                                <button
                                  onClick={() => handleStartEdit(item)}
                                  className="p-1.5 bg-slate-50 hover:bg-blue-50 dark:bg-slate-950 dark:hover:bg-blue-955/30 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-900/50 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 rounded-lg transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95 flex items-center justify-center"
                                  title="İhtiyaç Kalemi Düzenle"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="p-1.5 bg-slate-50 hover:bg-red-50 dark:bg-slate-950 dark:hover:bg-red-955/20 border border-slate-200 dark:border-slate-800 hover:border-red-300 dark:hover:border-red-900/50 text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 rounded-lg transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95 flex items-center justify-center"
                                  title="İhtiyaç Kalemi Sil"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
    </div>
  );
}

import React, { useEffect, useState } from "react";
import {
  Building2,
  Check,
  Eye,
  EyeOff,
  FileText,
  HelpCircle,
  RefreshCw,
  Save,
  UserCheck,
  Users,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Modal } from "../../../../../../components/ui/Modal";
import { PersonelCombobox } from "./PersonelCombobox";

interface PersonelItem {
  id: number;
  ad_soyad: string;
  unvan?: string;
}

interface KomisyonRow {
  sira: number;
  gorev: string;
  personelId: number | null;
  belgedeGoster: boolean;
}

export type KomisyonType = "yaklasik_maliyet" | "muayene_kabul";

interface KomisyonAtamaModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: KomisyonType;
  activeDosyaId?: number | null;
  onOpenDocument?: (dosyaAdi: string) => void;
}

const DEFAULT_MALIYET_ROLES: { gorev: string; belgedeGoster: boolean }[] = [
  { gorev: "Harcama Yetkilisi", belgedeGoster: false },
  { gorev: "Satın Alma Harcama Yetkilisi", belgedeGoster: false },
  { gorev: "Gerçekleştirme Görevlisi", belgedeGoster: false },
  { gorev: "Muhasebe Yetkilisi", belgedeGoster: false },
  { gorev: "Fiyat Araştırma Görevlisi", belgedeGoster: true },
  { gorev: "Fiyat Araştırma Görevlisi", belgedeGoster: true },
  { gorev: "Fiyat Araştırma Görevlisi", belgedeGoster: true },
  { gorev: "Fiyat Araştırma Görevlisi", belgedeGoster: true },
  { gorev: "Fiyat Araştırma Görevlisi", belgedeGoster: true },
  { gorev: "Fiyat Araştırma Görevlisi", belgedeGoster: true },
];

const DEFAULT_MUAYENE_ROLES: { gorev: string; belgedeGoster: boolean }[] = [
  { gorev: "Komisyon Başkanı", belgedeGoster: true },
  { gorev: "Üye", belgedeGoster: true },
  { gorev: "Üye", belgedeGoster: true },
  { gorev: "Üye", belgedeGoster: true },
  { gorev: "Üye", belgedeGoster: true },
  { gorev: "Üye", belgedeGoster: true },
  { gorev: "Üye", belgedeGoster: true },
  { gorev: "Üye", belgedeGoster: true },
  { gorev: "Üye", belgedeGoster: true },
];

export const KomisyonAtamaModal: React.FC<KomisyonAtamaModalProps> = ({
  isOpen,
  onClose,
  initialType = "yaklasik_maliyet",
  activeDosyaId,
  onOpenDocument,
}) => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<KomisyonType>(initialType);
  const [personeller, setPersoneller] = useState<PersonelItem[]>([]);
  const [kurumInfo, setKurumInfo] = useState<{
    kurumAdi?: string;
    makamAdi?: string;
    kurumTipi?: string;
  } | null>(null);

  const [maliyetRows, setMaliyetRows] = useState<KomisyonRow[]>(
    DEFAULT_MALIYET_ROLES.map((item, idx) => ({
      sira: idx + 1,
      gorev: item.gorev,
      personelId: null,
      belgedeGoster: item.belgedeGoster,
    })),
  );

  const [muayeneRows, setMuayeneRows] = useState<KomisyonRow[]>(
    DEFAULT_MUAYENE_ROLES.map((item, idx) => ({
      sira: idx + 1,
      gorev: item.gorev,
      personelId: null,
      belgedeGoster: item.belgedeGoster,
    })),
  );

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [syncToGlobalCommission, setSyncToGlobalCommission] = useState(true);

  useEffect(() => {
    if (initialType) {
      setActiveTab(initialType);
    }
  }, [initialType]);

  // Personel listesi, kurum bilgisi ve mevcut komisyon üyelerini yükle
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      try {
        // 1. Kurum bilgisi
        try {
          const kInfoRes = await (window as any).electron.ipcRenderer.invoke(
            "db:query",
            "SELECT kurum_adi, makam_adi, kurum_tipi, alt_kurum_tipi FROM TANIM_Kurum LIMIT 1",
          );
          if (kInfoRes.success && kInfoRes.data?.[0] && isMounted) {
            setKurumInfo({
              kurumAdi: kInfoRes.data[0].kurum_adi,
              makamAdi: kInfoRes.data[0].makam_adi,
              kurumTipi: kInfoRes.data[0].kurum_tipi || kInfoRes.data[0].alt_kurum_tipi,
            });
          }
        } catch (e) {
          console.warn("Kurum bilgisi okunamadı:", e);
        }

        // 2. Personel listesi
        const pRes = await (window as any).electron.ipcRenderer.invoke(
          "db:query",
          "SELECT id, ad_soyad, unvan FROM TANIM_Personel WHERE aktif_mi = 1 ORDER BY ad_soyad ASC",
        );
        const pList: PersonelItem[] = pRes.success && pRes.data ? pRes.data : [];
        if (isMounted) setPersoneller(pList);

        // 3. Mevcut DATA_TeminKomisyon kayıtları
        if (activeDosyaId) {
          const kRes = await (window as any).electron.ipcRenderer.invoke(
            "db:query",
            "SELECT * FROM DATA_TeminKomisyon WHERE temin_dosya_id = ? ORDER BY id ASC",
            [activeDosyaId],
          );

          if (kRes.success && kRes.data && kRes.data.length > 0) {
            const allK = kRes.data;

            // Maliyet komisyonu üyeleri
            const mList = allK.filter(
              (k: any) =>
                k.komisyon_id === 1 ||
                (k.komisyon_turu &&
                  (k.komisyon_turu.toLowerCase().includes("maliyet") ||
                    k.komisyon_turu.toLowerCase().includes("fiyat"))),
            );

            // Muayene komisyonu üyeleri
            const muList = allK.filter(
              (k: any) =>
                k.komisyon_id === 2 ||
                (k.komisyon_turu &&
                  (k.komisyon_turu.toLowerCase().includes("muayene") ||
                    k.komisyon_turu.toLowerCase().includes("kabul"))),
            );

            if (isMounted) {
              if (mList.length > 0) {
                const newMaliyet = DEFAULT_MALIYET_ROLES.map((item, idx) => {
                  const matched = mList[idx];
                  const hasBelgedeGoster =
                    matched?.belgede_goster !== undefined &&
                    matched?.belgede_goster !== null;

                  return {
                    sira: idx + 1,
                    gorev: matched?.gorev || item.gorev,
                    personelId: matched?.personel_id || null,
                    belgedeGoster: hasBelgedeGoster
                      ? matched.belgede_goster === 1
                      : item.belgedeGoster,
                  };
                });
                setMaliyetRows(newMaliyet);
              }

              if (muList.length > 0) {
                const newMuayene = DEFAULT_MUAYENE_ROLES.map((item, idx) => {
                  const matched = muList[idx];
                  const hasBelgedeGoster =
                    matched?.belgede_goster !== undefined &&
                    matched?.belgede_goster !== null;

                  return {
                    sira: idx + 1,
                    gorev: matched?.gorev || item.gorev,
                    personelId: matched?.personel_id || null,
                    belgedeGoster: hasBelgedeGoster
                      ? matched.belgede_goster === 1
                      : item.belgedeGoster,
                  };
                });
                setMuayeneRows(newMuayene);
              }
            }
          }
        }
      } catch (err) {
        console.error("Komisyon verileri yüklenirken hata:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [isOpen, activeDosyaId]);

  // Komisyon Yönetimi (TANIM_KomisyonUye) üzerinden güncelle
  const handleSyncFromKomisyonYonetimi = async () => {
    const isMaliyet = activeTab === "yaklasik_maliyet";
    try {
      const findRes = await (window as any).electron.ipcRenderer.invoke(
        "db:query",
        isMaliyet
          ? `SELECT id FROM TANIM_Komisyon 
             WHERE LOWER(TRIM(ad)) LIKE '%yaklaşık%' OR LOWER(TRIM(ad)) LIKE '%fiyat%' OR id = 1
             ORDER BY CASE WHEN id = 1 THEN 0 ELSE 1 END, id ASC LIMIT 1`
          : `SELECT id FROM TANIM_Komisyon 
             WHERE LOWER(TRIM(ad)) LIKE '%muayene%' OR LOWER(TRIM(ad)) LIKE '%kabul%' OR id = 2
             ORDER BY CASE WHEN id = 2 THEN 0 ELSE 1 END, id ASC LIMIT 1`,
      );
      const komId =
        findRes.success && findRes.data?.[0]?.id
          ? findRes.data[0].id
          : isMaliyet
            ? 1
            : 2;

      const res = await (window as any).electron.ipcRenderer.invoke(
        "db:query",
        `SELECT u.*, p.ad_soyad, p.unvan, g.ad as gorev_adi
         FROM TANIM_KomisyonUye u
         JOIN TANIM_Personel p ON u.personel_id = p.id
         LEFT JOIN TANIM_KomisyonGorevi g ON u.gorev_id = g.id
         WHERE u.komisyon_id = ?
         ORDER BY u.id ASC`,
        [komId],
      );

      if (res.success && res.data && res.data.length > 0) {
        const members = res.data;
        if (isMaliyet) {
          const next = DEFAULT_MALIYET_ROLES.map((item, idx) => {
            const m = members[idx];
            return {
              sira: idx + 1,
              gorev: m?.gorev_adi || item.gorev,
              personelId: m ? m.personel_id : null,
              belgedeGoster: item.belgedeGoster,
            };
          });
          setMaliyetRows(next);
        } else {
          const next = DEFAULT_MUAYENE_ROLES.map((item, idx) => {
            const m = members[idx];
            return {
              sira: idx + 1,
              gorev: m?.gorev_adi || item.gorev,
              personelId: m ? m.personel_id : null,
              belgedeGoster: item.belgedeGoster,
            };
          });
          setMuayeneRows(next);
        }
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      } else {
        alert(
          "Komisyon Yönetiminde bu komisyon için atanmış personel bulunamadı. Lütfen Komisyon Yönetimi ekranından üyeleri atayınız.",
        );
      }
    } catch (err: any) {
      alert("Komisyon Yönetiminden aktarım yapılırken hata: " + err.message);
    }
  };

  // Seçilen komisyonu DATA_TeminKomisyon tablosuna kaydet
  const handleSave = async (tabToSave: KomisyonType = activeTab): Promise<boolean> => {
    if (!activeDosyaId) return false;

    setSaving(true);
    try {
      const isMaliyet = tabToSave === "yaklasik_maliyet";
      const komId = isMaliyet ? 1 : 2;
      const komTitle = isMaliyet
        ? "Yaklaşık Maliyet Tespit Komisyonu"
        : "Muayene Kabul ve Tespit Komisyonu";
      const rows = isMaliyet ? maliyetRows : muayeneRows;

      // 0. Sütun kontrolü (belgede_goster sütununu gerekirse ekle)
      try {
        await (window as any).electron.ipcRenderer.invoke(
          "db:run",
          "ALTER TABLE DATA_TeminKomisyon ADD COLUMN belgede_goster INTEGER DEFAULT 1",
        );
      } catch {
        // Zaten mevcut
      }

      // 1. Önceki kayıtları temizle
      if (isMaliyet) {
        await (window as any).electron.ipcRenderer.invoke(
          "db:run",
          `DELETE FROM DATA_TeminKomisyon 
           WHERE temin_dosya_id = ? 
           AND (komisyon_id = 1 OR komisyon_turu LIKE '%maliyet%' OR komisyon_turu LIKE '%fiyat%')`,
          [activeDosyaId],
        );
      } else {
        await (window as any).electron.ipcRenderer.invoke(
          "db:run",
          `DELETE FROM DATA_TeminKomisyon 
           WHERE temin_dosya_id = ? 
           AND (komisyon_id = 2 OR komisyon_turu LIKE '%muayene%' OR komisyon_turu LIKE '%kabul%')`,
          [activeDosyaId],
        );
      }

      // 2. Seçili personelleri ekle
      for (const row of rows) {
        if (!row.personelId) continue;
        const p = personeller.find((item) => item.id === row.personelId);
        if (!p) continue;

        const rol =
          row.gorev.toLowerCase().includes("başkan") ||
          row.gorev.toLowerCase().includes("yetkili")
            ? "Başkan"
            : "Üye";

        await (window as any).electron.ipcRenderer.invoke(
          "db:run",
          `INSERT INTO DATA_TeminKomisyon 
           (temin_dosya_id, komisyon_id, personel_id, ad_soyad, unvan, gorev, rol, komisyon_turu, belgede_goster)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            activeDosyaId,
            komId,
            p.id,
            p.ad_soyad,
            p.unvan || null,
            row.gorev,
            rol,
            komTitle,
            row.belgedeGoster ? 1 : 0,
          ],
        );

        // Harcama Yetkilisi ve Gerçekleştirme Görevlisi ise dosyaya da kaydet
        if (isMaliyet) {
          if (row.gorev === "Harcama Yetkilisi") {
            await (window as any).electron.ipcRenderer.invoke(
              "db:run",
              `UPDATE DATA_TeminDosyasi 
               SET onay_personel_id = ?, onaylayan_ad_soyad = ?, onaylayan_unvan = ? 
               WHERE id = ?`,
              [p.id, p.ad_soyad, p.unvan || null, activeDosyaId],
            );
          } else if (row.gorev === "Gerçekleştirme Görevlisi") {
            await (window as any).electron.ipcRenderer.invoke(
              "db:run",
              `UPDATE DATA_TeminDosyasi 
               SET hazirlayan_personel_id = ?, hazirlayan_ad_soyad = ?, hazirlayan_unvan = ? 
               WHERE id = ?`,
              [p.id, p.ad_soyad, p.unvan || null, activeDosyaId],
            );
          }
        }
      }

      // 3. Genel Komisyon Yönetimi (TANIM_Komisyon & TANIM_KomisyonUye) ile senkronize et
      if (syncToGlobalCommission) {
        try {
          const findRes = await (window as any).electron.ipcRenderer.invoke(
            "db:query",
            isMaliyet
              ? `SELECT id FROM TANIM_Komisyon 
                 WHERE LOWER(TRIM(ad)) LIKE '%yaklaşık%' OR LOWER(TRIM(ad)) LIKE '%fiyat%' OR id = 1
                 ORDER BY CASE WHEN id = 1 THEN 0 ELSE 1 END, id ASC LIMIT 1`
              : `SELECT id FROM TANIM_Komisyon 
                 WHERE LOWER(TRIM(ad)) LIKE '%muayene%' OR LOWER(TRIM(ad)) LIKE '%kabul%' OR id = 2
                 ORDER BY CASE WHEN id = 2 THEN 0 ELSE 1 END, id ASC LIMIT 1`,
          );
          const targetKomId =
            findRes.success && findRes.data?.[0]?.id
              ? findRes.data[0].id
              : isMaliyet
                ? 1
                : 2;

          // Mevcut TANIM_KomisyonGorevi listesi
          const gorevRes = await (window as any).electron.ipcRenderer.invoke(
            "db:query",
            "SELECT id, ad FROM TANIM_KomisyonGorevi",
          );
          const existingGorevler: { id: number; ad: string }[] =
            gorevRes.success && gorevRes.data ? gorevRes.data : [];

          // Eski genel komisyon üyelerini temizle
          await (window as any).electron.ipcRenderer.invoke(
            "db:run",
            "DELETE FROM TANIM_KomisyonUye WHERE komisyon_id = ?",
            [targetKomId],
          );

          // Yeni personelleri genel komisyon üyelerine ekle
          for (const row of rows) {
            if (!row.personelId) continue;

            let gorevId = existingGorevler.find(
              (g) => g.ad.trim().toLowerCase() === row.gorev.trim().toLowerCase(),
            )?.id;

            if (!gorevId) {
              const insertGorevRes = await (window as any).electron.ipcRenderer.invoke(
                "db:run",
                "INSERT INTO TANIM_KomisyonGorevi (ad) VALUES (?)",
                [row.gorev.trim()],
              );
              if (insertGorevRes.success && insertGorevRes.lastInsertRowid) {
                const newGorevId = Number(insertGorevRes.lastInsertRowid);
                gorevId = newGorevId;
                existingGorevler.push({ id: newGorevId, ad: row.gorev.trim() });
              }
            }

            const isAsil = row.gorev.toLowerCase().includes("yedek") ? 0 : 1;

            if (gorevId) {
              await (window as any).electron.ipcRenderer.invoke(
                "db:run",
                "INSERT INTO TANIM_KomisyonUye (komisyon_id, personel_id, gorev_id, asil_mi) VALUES (?, ?, ?, ?)",
                [targetKomId, row.personelId, gorevId, isAsil],
              );
            }
          }

          // React query önbelleklerini tazele
          queryClient.invalidateQueries({ queryKey: ["komisyonlar"] });
          queryClient.invalidateQueries({ queryKey: ["komisyon_detay", targetKomId] });
          queryClient.invalidateQueries({ queryKey: ["tanim_komisyonlar"] });
          queryClient.invalidateQueries({ queryKey: ["tanim_komisyonlar_with_sablons"] });
        } catch (globalErr) {
          console.warn("Global komisyon senkronizasyonu sırasında hata:", globalErr);
        }
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
      return true;
    } catch (err: any) {
      alert("Komisyon üyeleri kaydedilirken hata: " + err.message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Belge Aç Butonu (Kayıttan sonra önizleme açar)
  const handleOpenDoc = async (targetDoc?: string) => {
    const ok = await handleSave(activeTab);
    if (ok && onOpenDocument) {
      onClose();
      if (targetDoc) {
        onOpenDocument(targetDoc);
      } else if (activeTab === "yaklasik_maliyet") {
        onOpenDocument("piyasa-fiyat-arastirma-gorevlendirmesi");
      } else {
        onOpenDocument("muayene-kabul-komisyonu");
      }
    }
  };

  const currentRows = activeTab === "yaklasik_maliyet" ? maliyetRows : muayeneRows;

  const handlePersonelChange = (sira: number, personelId: number | null) => {
    if (activeTab === "yaklasik_maliyet") {
      setMaliyetRows((prev) =>
        prev.map((r) => (r.sira === sira ? { ...r, personelId } : r)),
      );
    } else {
      setMuayeneRows((prev) =>
        prev.map((r) => (r.sira === sira ? { ...r, personelId } : r)),
      );
    }
  };

  const handleGorevChange = (sira: number, newGorev: string) => {
    if (activeTab === "yaklasik_maliyet") {
      setMaliyetRows((prev) =>
        prev.map((r) => (r.sira === sira ? { ...r, gorev: newGorev } : r)),
      );
    } else {
      setMuayeneRows((prev) =>
        prev.map((r) => (r.sira === sira ? { ...r, gorev: newGorev } : r)),
      );
    }
  };

  const handleToggleBelgedeGoster = (sira: number) => {
    if (activeTab === "yaklasik_maliyet") {
      setMaliyetRows((prev) =>
        prev.map((r) =>
          r.sira === sira ? { ...r, belgedeGoster: !r.belgedeGoster } : r,
        ),
      );
    } else {
      setMuayeneRows((prev) =>
        prev.map((r) =>
          r.sira === sira ? { ...r, belgedeGoster: !r.belgedeGoster } : r,
        ),
      );
    }
  };

  const modalFooter = (
    <div className="flex flex-wrap items-center justify-between gap-3 w-full">
      <div className="flex items-center gap-2 flex-wrap">
        {activeTab === "yaklasik_maliyet" ? (
          <>
            <button
              type="button"
              onClick={() => handleOpenDoc("piyasa-fiyat-arastirma-gorevlendirmesi")}
              disabled={saving || loading}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-95 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
              title="Piyasa Fiyat Araştırması Görevlendirmesi Belgesini Aç"
            >
              <FileText className="w-3.5 h-3.5" />
              Fiyat Araştırma Görevlendirmesi
            </button>
            <button
              type="button"
              onClick={() => handleOpenDoc("komisyon-gorevlendirme-onayi")}
              disabled={saving || loading}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-800 active:scale-95 text-white rounded-lg text-xs font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50"
              title="Komisyon Görevlendirme Onayı Belgesini Aç"
            >
              <FileText className="w-3.5 h-3.5" />
              Komisyon Onayı
            </button>
            <button
              type="button"
              onClick={() => handleOpenDoc("komisyon-gorevlendirme-onayi-eki")}
              disabled={saving || loading}
              className="flex items-center gap-1.5 px-2.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium transition-all cursor-pointer disabled:opacity-50"
              title="Komisyon Görevlendirme Onayı Ekini Aç"
            >
              <FileText className="w-3.5 h-3.5" />
              Onay Eki
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => handleOpenDoc("muayene-kabul-komisyonu")}
              disabled={saving || loading}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-95 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
              title="Muayene ve Kabul Komisyonu Belgesini Aç"
            >
              <FileText className="w-3.5 h-3.5" />
              Muayene ve Kabul Komisyonu
            </button>
            <button
              type="button"
              onClick={() => handleOpenDoc("komisyon-gorevlendirme-onayi")}
              disabled={saving || loading}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-800 active:scale-95 text-white rounded-lg text-xs font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50"
              title="Komisyon Görevlendirme Onayı Belgesini Aç"
            >
              <FileText className="w-3.5 h-3.5" />
              Komisyon Onayı
            </button>
            <button
              type="button"
              onClick={() => handleOpenDoc("komisyon-gorevlendirme-onayi-eki")}
              disabled={saving || loading}
              className="flex items-center gap-1.5 px-2.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium transition-all cursor-pointer disabled:opacity-50"
              title="Komisyon Görevlendirme Onayı Ekini Aç"
            >
              <FileText className="w-3.5 h-3.5" />
              Onay Eki
            </button>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleSyncFromKomisyonYonetimi}
          disabled={loading || saving}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold transition-all cursor-pointer"
          title="Komisyon Yönetimi ekranında tanımlı üyeleri yükle"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Komisyon Yönetiminden Yükle
        </button>

        <button
          type="button"
          onClick={() => handleSave(activeTab)}
          disabled={saving || loading}
          className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
        >
          {saveSuccess ? (
            <>
              <Check className="w-3.5 h-3.5 text-white" />
              Kaydedildi
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Komisyon ve Görevli Atama"
      description="Bu dosyaya ve belgelere ait komisyon üyelerini, görevlerini ve onay makamlarını belirleyin."
      className="max-w-5xl max-h-[90vh]"
      footer={modalFooter}
    >
      <div className="space-y-3.5">
        {/* Kurum & Makam Bilgi Özeti */}
        {kurumInfo && (
          <div className="flex items-center justify-between px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-800 rounded-xl text-xs">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="font-bold text-slate-850 dark:text-slate-100">
                {kurumInfo.kurumAdi || "Kurum Bilgisi"}
              </span>
              {kurumInfo.makamAdi && (
                <span className="text-slate-400 font-medium text-[11px]">
                  • Onay Makamı: <strong className="text-slate-600 dark:text-slate-300">{kurumInfo.makamAdi}</strong>
                </span>
              )}
            </div>
            {kurumInfo.kurumTipi && (
              <span className="text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 bg-blue-100/70 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-md">
                {kurumInfo.kurumTipi}
              </span>
            )}
          </div>
        )}

        {/* Tab Butonları */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 -mx-2 px-2 gap-1 pb-1">
          <button
            type="button"
            onClick={() => setActiveTab("yaklasik_maliyet")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === "yaklasik_maliyet"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Yaklaşık Maliyet &amp; Piyasa Fiyat Araştırma Komisyonu
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("muayene_kabul")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === "muayene_kabul"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            Muayene Kabul ve Tespit Komisyonu
          </button>
        </div>

        {/* Global Senkronizasyon Bilgilendirme ve Toggle Kutusu */}
        <div className="flex items-center justify-between p-2.5 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 rounded-xl text-xs">
          <label className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300 font-medium cursor-pointer select-none">
            <input
              type="checkbox"
              checked={syncToGlobalCommission}
              onChange={(e) => setSyncToGlobalCommission(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
            />
            <span>
              Bu atamaları <strong>Genel Komisyon Yönetimi</strong>&apos;ne de otomatik aktar (Sonraki dosyalarda varsayılan olur)
            </span>
          </label>
          <span className="text-[11px] text-blue-600 dark:text-blue-400 font-mono bg-blue-100/80 dark:bg-blue-900/60 px-2 py-0.5 rounded-md font-semibold">
            TANIM_Komisyon
          </span>
        </div>

        {/* Tablo Alanı */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
              <tr>
                <th className="py-2.5 px-3 font-bold text-slate-600 dark:text-slate-400 w-12 text-center border-r border-slate-200 dark:border-slate-800">
                  #
                </th>
                <th className="py-2.5 px-3 font-bold text-slate-600 dark:text-slate-400 w-56 border-r border-slate-200 dark:border-slate-800">
                  Komisyondaki Görevi / Rolü
                </th>
                <th className="py-2.5 px-3 font-bold text-slate-600 dark:text-slate-400">
                  Atanan Personel (Ad Soyad / Unvan)
                </th>
                <th
                  className="py-2.5 px-3 font-bold text-slate-600 dark:text-slate-400 w-36 text-center border-l border-slate-200 dark:border-slate-800"
                  title="Resmi belge tablosunda ve dağıtımında listelensin mi?"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Belgede Göster</span>
                    <HelpCircle className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {currentRows.map((row) => (
                <tr
                  key={row.sira}
                  className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors ${
                    !row.belgedeGoster ? "bg-slate-50/30 dark:bg-slate-900/30" : ""
                  }`}
                >
                  <td className="py-2 px-3 text-center text-slate-500 font-medium border-r border-slate-100 dark:border-slate-800">
                    {row.sira}.
                  </td>
                  <td className="py-1.5 px-3 font-semibold text-slate-800 dark:text-slate-200 border-r border-slate-100 dark:border-slate-800">
                    <input
                      type="text"
                      value={row.gorev}
                      onChange={(e) => handleGorevChange(row.sira, e.target.value)}
                      className="w-full bg-transparent hover:bg-white dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-transparent hover:border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded px-2 py-1 text-xs outline-none transition-all font-semibold"
                    />
                  </td>
                  <td className="py-1.5 px-3">
                    <PersonelCombobox
                      personeller={personeller}
                      selectedId={row.personelId}
                      onChange={(personelId) => handlePersonelChange(row.sira, personelId)}
                    />
                  </td>
                  <td className="py-1.5 px-3 text-center border-l border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => handleToggleBelgedeGoster(row.sira)}
                      className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer w-full select-none ${
                        row.belgedeGoster
                          ? "bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 shadow-2xs"
                          : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                      }`}
                      title={
                        row.belgedeGoster
                          ? "Bu görevli resmi belge komisyon listesinde ve dağıtımında gösterilir."
                          : "Bu görevli belgedeki komisyon tablosunda gizlenir (yalnızca onay/dosya yetkilisi olarak işlenir)."
                      }
                    >
                      {row.belgedeGoster ? (
                        <>
                          <Eye className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span>Göster</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Gizle</span>
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
};

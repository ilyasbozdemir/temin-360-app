import React, { useEffect, useState } from "react";
import { Check, FileText, RefreshCw, Save, UserCheck, Users } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Modal } from "../../../../../../components/ui/Modal";

interface PersonelItem {
  id: number;
  ad_soyad: string;
  unvan?: string;
}

interface KomisyonRow {
  sira: number;
  gorev: string;
  personelId: number | null;
}

export type KomisyonType = "yaklasik_maliyet" | "muayene_kabul";

interface KomisyonAtamaModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: KomisyonType;
  activeDosyaId?: number | null;
  onOpenDocument?: (dosyaAdi: string) => void;
}

const DEFAULT_MALIYET_ROLES = [
  "Harcama Yetkilisi",
  "Satın Alma Harcama Yetkilisi",
  "Gerçekleştirme Görevlisi",
  "Muhasebe Yetkilisi",
  "Fiyat Araştırma Görevlisi",
  "Fiyat Araştırma Görevlisi",
  "Fiyat Araştırma Görevlisi",
  "Fiyat Araştırma Görevlisi",
  "Fiyat Araştırma Görevlisi",
  "Fiyat Araştırma Görevlisi",
];

const DEFAULT_MUAYENE_ROLES = [
  "Komisyon Başkanı",
  "Üye",
  "Üye",
  "Üye",
  "Üye",
  "Üye",
  "Üye",
  "Üye",
  "Üye",
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
  const [maliyetRows, setMaliyetRows] = useState<KomisyonRow[]>(
    DEFAULT_MALIYET_ROLES.map((gorev, idx) => ({
      sira: idx + 1,
      gorev,
      personelId: null,
    })),
  );
  const [muayeneRows, setMuayeneRows] = useState<KomisyonRow[]>(
    DEFAULT_MUAYENE_ROLES.map((gorev, idx) => ({
      sira: idx + 1,
      gorev,
      personelId: null,
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

  // Personel listesi ve mevcut komisyon üyelerini yükle
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      try {
        // 1. Personel listesi
        const pRes = await (window as any).electron.ipcRenderer.invoke(
          "db:query",
          "SELECT id, ad_soyad, unvan FROM TANIM_Personel WHERE aktif_mi = 1 ORDER BY ad_soyad ASC",
        );
        const pList: PersonelItem[] = pRes.success && pRes.data ? pRes.data : [];
        if (isMounted) setPersoneller(pList);

        // 2. Mevcut DATA_TeminKomisyon kayıtları
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
                const newMaliyet = DEFAULT_MALIYET_ROLES.map((gorev, idx) => {
                  const matched = mList[idx];
                  return {
                    sira: idx + 1,
                    gorev: matched?.gorev || gorev,
                    personelId: matched?.personel_id || null,
                  };
                });
                setMaliyetRows(newMaliyet);
              }

              if (muList.length > 0) {
                const newMuayene = DEFAULT_MUAYENE_ROLES.map((gorev, idx) => {
                  const matched = muList[idx];
                  return {
                    sira: idx + 1,
                    gorev: matched?.gorev || gorev,
                    personelId: matched?.personel_id || null,
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
          const next = DEFAULT_MALIYET_ROLES.map((defGorev, idx) => {
            const m = members[idx];
            return {
              sira: idx + 1,
              gorev: m?.gorev_adi || defGorev,
              personelId: m ? m.personel_id : null,
            };
          });
          setMaliyetRows(next);
        } else {
          const next = DEFAULT_MUAYENE_ROLES.map((defGorev, idx) => {
            const m = members[idx];
            return {
              sira: idx + 1,
              gorev: m?.gorev_adi || defGorev,
              personelId: m ? m.personel_id : null,
            };
          });
          setMuayeneRows(next);
        }
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      } else {
        alert("Komisyon Yönetiminde bu komisyon için atanmış personel bulunamadı. Lütfen Komisyon Yönetimi ekranından üyeleri atayınız.");
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
           (temin_dosya_id, komisyon_id, personel_id, ad_soyad, unvan, gorev, rol, komisyon_turu)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            activeDosyaId,
            komId,
            p.id,
            p.ad_soyad,
            p.unvan || null,
            row.gorev,
            rol,
            komTitle,
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

  const handlePersonelChange = (sira: number, personelIdStr: string) => {
    const val = personelIdStr ? Number(personelIdStr) : null;
    if (activeTab === "yaklasik_maliyet") {
      setMaliyetRows((prev) =>
        prev.map((r) => (r.sira === sira ? { ...r, personelId: val } : r)),
      );
    } else {
      setMuayeneRows((prev) =>
        prev.map((r) => (r.sira === sira ? { ...r, personelId: val } : r)),
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Komisyon ve Görevli Atama"
      description="Bu dosyaya ve belgelere ait komisyon üyelerini ve onay makamlarını belirleyin."
      className="max-w-4xl"
    >
      <div className="space-y-4">
        {/* Tab Butonları */}
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab("yaklasik_maliyet")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "yaklasik_maliyet"
                ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Users className="w-4 h-4" />
            Yaklaşık Maliyet ve Piyasa Fiyat Araştırma Komisyonu
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("muayene_kabul")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "muayene_kabul"
                ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Muayene Kabul Komisyonu
          </button>
        </div>

        {/* Global Senkronizasyon Bilgilendirme ve Toggle Kutusu */}
        <div className="flex items-center justify-between p-2.5 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-800/50 rounded-lg text-xs">
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
          <span className="text-[11px] text-blue-600 dark:text-blue-400 font-mono bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 rounded">
            TANIM_Komisyon &amp; TANIM_KomisyonUye
          </span>
        </div>

        {/* Tablo Alanı */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden max-h-[380px] overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-900/80 sticky top-0 border-b border-slate-200 dark:border-slate-800 z-10">
              <tr>
                <th className="p-2.5 font-semibold text-slate-600 dark:text-slate-400 w-12 text-center">
                  #
                </th>
                <th className="p-2.5 font-semibold text-slate-600 dark:text-slate-400 w-64">
                  Görevi / Rolü
                </th>
                <th className="p-2.5 font-semibold text-slate-600 dark:text-slate-400">
                  Atanan Personel (Ad Soyad / Unvan)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {currentRows.map((row) => (
                <tr
                  key={row.sira}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors"
                >
                  <td className="p-2.5 text-center text-slate-500 font-medium">
                    {row.sira}
                  </td>
                  <td className="p-2.5 font-medium text-slate-800 dark:text-slate-200">
                    <input
                      type="text"
                      value={row.gorev}
                      onChange={(e) => handleGorevChange(row.sira, e.target.value)}
                      className="w-full bg-transparent border border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 rounded px-1.5 py-1 text-xs outline-none transition-all"
                    />
                  </td>
                  <td className="p-2.5">
                    <select
                      value={row.personelId || ""}
                      onChange={(e) => handlePersonelChange(row.sira, e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all cursor-pointer"
                    >
                      <option value="">-- Personel Seçiniz --</option>
                      {personeller.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.ad_soyad}
                          {p.unvan ? ` (${p.unvan})` : ""}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Butonlar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-1.5 flex-wrap">
            {activeTab === "yaklasik_maliyet" ? (
              <>
                <button
                  type="button"
                  onClick={() => handleOpenDoc("piyasa-fiyat-arastirma-gorevlendirmesi")}
                  disabled={saving || loading}
                  className="flex items-center gap-1.5 px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-md text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                  title="Piyasa Fiyat Araştırması Görevlendirmesi Belgesini Aç"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Fiyat Araştırma Görevlendirmesi
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenDoc("komisyon-gorevlendirme-onayi")}
                  disabled={saving || loading}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-md text-xs font-semibold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                  title="Komisyon Görevlendirme Onayı Belgesini Aç"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Komisyon Onayı
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenDoc("komisyon-gorevlendirme-onayi-eki")}
                  disabled={saving || loading}
                  className="flex items-center gap-1.5 px-2.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-md text-xs font-medium transition-all cursor-pointer disabled:opacity-50"
                  title="Komisyon Görevlendirme Onayı Ekini Aç"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Onay Eki
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => handleOpenDoc("muayene-kabul-komisyonu")}
                disabled={saving || loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-md text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                <FileText className="w-3.5 h-3.5" />
                Kabul Komisyon Onay Yazısı
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSyncFromKomisyonYonetimi}
              disabled={loading || saving}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-md text-xs font-semibold transition-all cursor-pointer"
              title="Komisyon Yönetimi ekranında tanımlı üyeleri yükle"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Komisyon Yönetiminden Güncelle
            </button>

            <button
              type="button"
              onClick={() => handleSave(activeTab)}
              disabled={saving || loading}
              className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
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
      </div>
    </Modal>
  );
};

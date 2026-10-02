import { useEffect, useState } from "react";
import { useSettingsStore } from "../../../../../../store/settingsStore";
import { useWorkspaceStore } from "../../../../../../store/workspaceStore";
import { useDosyaAsamasiSablons } from "../../useDosyaAsamasiSablons";
import {
  FirmaStats,
  KabulTutanakItem,
  KomisyonUye,
} from "./types";

interface KabulDataCacheEntry {
  kazananFirmaId: number | null;
  kazananFirmaUnvan: string;
  komisyonBaskani: string;
  komisyonUyeleri: KomisyonUye[];
  teslimYeri: string;
  firmaStats: FirmaStats;
  faturaNo: string;
  faturaTarihi: string;
  tutanaklar?: KabulTutanakItem[];
}

const kabulDataCache = new Map<number, KabulDataCacheEntry>();

export function useKabulVeOdemeData() {
  const {
    activeStarredDocs,
    sablons,
    ciktiLoading,
    dosyaContext,
    previewModalOpen,
    setPreviewModalOpen,
    previewData,
    handleOpenPreviewForSablon,
    quickPrint,
    quickExport,
    quickOpenExternal,
    isSablonDisabled,
  } = useDosyaAsamasiSablons();

  const { disableDocumentGuidance } = useSettingsStore();
  const { activeDosyaId } = useWorkspaceStore();

  const cached = activeDosyaId ? kabulDataCache.get(activeDosyaId) : undefined;
  const optimisticFirmaId = cached?.kazananFirmaId ??
    (dosyaContext?.kazanan_firma_id ||
      dosyaContext?.firma_id ||
      (dosyaContext?.enAvantajliTeklifSahibi ? 1 : undefined));

  const optimisticUnvan = cached?.kazananFirmaUnvan ||
    dosyaContext?.enAvantajliTeklifSahibi ||
    dosyaContext?.kazanan_firma ||
    dosyaContext?.firma_unvani ||
    "";

  const [kazananFirmaId, setKazananFirmaId] = useState<
    number | null | undefined
  >(optimisticFirmaId);
  const [kazananFirmaUnvan, setKazananFirmaUnvan] = useState<string>(
    optimisticUnvan,
  );
  const [komisyonBaskani, setKomisyonBaskani] = useState<string>(
    cached?.komisyonBaskani || "",
  );
  const [komisyonUyeleri, setKomisyonUyeleri] = useState<KomisyonUye[]>(
    cached?.komisyonUyeleri || [],
  );
  const [teslimYeri, setTeslimYeri] = useState<string>(
    cached?.teslimYeri || dosyaContext?.ihtiyac_yeri || "",
  );

  const [firmaStats, setFirmaStats] = useState<FirmaStats>(
    cached?.firmaStats || {
      teklifToplami: dosyaContext?.enAvantajliTeklifBedeli
        ? Number(dosyaContext.enAvantajliTeklifBedeli)
        : null,
      yaklasikMaliyet: dosyaContext?.yaklasikMaliyet
        ? Number(dosyaContext.yaklasikMaliyet)
        : null,
      teslimTarihi: null,
      yasaklilikDurumu: null,
      vergiNo: null,
      alimTuru: (dosyaContext?.alimTuru || "mal") as "mal" | "hizmet" | "yapim",
    },
  );

  const [faturaNo, setFaturaNo] = useState<string>(cached?.faturaNo || "");
  const [faturaTarihi, setFaturaTarihi] = useState<string>(
    cached?.faturaTarihi || "",
  );
  const [isTifModalOpen, setIsTifModalOpen] = useState(false);
  const [isKomisyonModalOpen, setIsKomisyonModalOpen] = useState(false);

  const [tutanaklar, setTutanaklar] = useState<KabulTutanakItem[]>(
    cached?.tutanaklar || [],
  );
  const [dosyaKalemler, setDosyaKalemler] = useState<any[]>([]);
  const [isTutanakModalOpen, setIsTutanakModalOpen] = useState(false);
  const [editingTutanak, setEditingTutanak] = useState<KabulTutanakItem | null>(
    null,
  );

  const rawAlimTuru = String(
    firmaStats?.alimTuru ||
      dosyaContext?.alimTuru ||
      dosyaContext?.alim_turu ||
      dosyaContext?.tur ||
      "mal",
  ).toLowerCase();
  const isYapim =
    rawAlimTuru.includes("yapim") ||
    rawAlimTuru.includes("inşaat") ||
    rawAlimTuru.includes("insaat");
  const isHizmet =
    !isYapim &&
    (rawAlimTuru.includes("hizmet") || rawAlimTuru.includes("danismanlik"));
  const isMal = !isYapim && !isHizmet;
  const alimTuru = isYapim ? "yapim" : isHizmet ? "hizmet" : "mal";

  const handleOpenAddTutanak = (): void => {
    setEditingTutanak(null);
    setIsTutanakModalOpen(true);
  };

  const handleOpenEditTutanak = (item: KabulTutanakItem): void => {
    setEditingTutanak(item);
    setIsTutanakModalOpen(true);
  };

  const handleSaveTutanak = async (
    tutanakItem: KabulTutanakItem,
  ): Promise<void> => {
    const exists = tutanaklar.some((t) => t.id === tutanakItem.id);
    const updated = exists
      ? tutanaklar.map((t) => (t.id === tutanakItem.id ? tutanakItem : t))
      : [...tutanaklar, tutanakItem];

    setTutanaklar(updated);

    if (activeDosyaId && window.electron) {
      try {
        const fileRes = await window.electron.ipcRenderer.invoke(
          "db:query",
          "SELECT sablon_tercihleri FROM DATA_TeminDosyasi WHERE id = ?",
          [activeDosyaId],
        );
        let existingObj: any = {};
        if (fileRes.success && fileRes.data?.[0]?.sablon_tercihleri) {
          try {
            existingObj =
              typeof fileRes.data[0].sablon_tercihleri === "string"
                ? JSON.parse(fileRes.data[0].sablon_tercihleri) || {}
                : fileRes.data[0].sablon_tercihleri || {};
          } catch {}
        }
        existingObj.kabulTutanaklari = updated;
        await window.electron.ipcRenderer.invoke(
          "db:run",
          "UPDATE DATA_TeminDosyasi SET sablon_tercihleri = ? WHERE id = ?",
          [JSON.stringify(existingObj), activeDosyaId],
        );
      } catch (e) {
        console.error("Failed to save kabulTutanaklari:", e);
      }
    }
  };

  const handleDeleteTutanak = async (id: string): Promise<void> => {
    const updated = tutanaklar.filter((t) => t.id !== id);
    setTutanaklar(updated);

    if (activeDosyaId && window.electron) {
      try {
        const fileRes = await window.electron.ipcRenderer.invoke(
          "db:query",
          "SELECT sablon_tercihleri FROM DATA_TeminDosyasi WHERE id = ?",
          [activeDosyaId],
        );
        let existingObj: any = {};
        if (fileRes.success && fileRes.data?.[0]?.sablon_tercihleri) {
          try {
            existingObj =
              typeof fileRes.data[0].sablon_tercihleri === "string"
                ? JSON.parse(fileRes.data[0].sablon_tercihleri) || {}
                : fileRes.data[0].sablon_tercihleri || {};
          } catch {}
        }
        existingObj.kabulTutanaklari = updated;
        await window.electron.ipcRenderer.invoke(
          "db:run",
          "UPDATE DATA_TeminDosyasi SET sablon_tercihleri = ? WHERE id = ?",
          [JSON.stringify(existingObj), activeDosyaId],
        );
      } catch (e) {
        console.error("Failed to delete kabulTutanaklari:", e);
      }
    }
  };

  const handleBulkDeleteTutanaklar = async (ids: string[]): Promise<void> => {
    const idSet = new Set(ids);
    const updated = tutanaklar.filter((t) => !idSet.has(t.id));
    setTutanaklar(updated);

    if (activeDosyaId && window.electron) {
      try {
        const fileRes = await window.electron.ipcRenderer.invoke(
          "db:query",
          "SELECT sablon_tercihleri FROM DATA_TeminDosyasi WHERE id = ?",
          [activeDosyaId],
        );
        let existingObj: any = {};
        if (fileRes.success && fileRes.data?.[0]?.sablon_tercihleri) {
          try {
            existingObj =
              typeof fileRes.data[0].sablon_tercihleri === "string"
                ? JSON.parse(fileRes.data[0].sablon_tercihleri) || {}
                : fileRes.data[0].sablon_tercihleri || {};
          } catch {}
        }
        existingObj.kabulTutanaklari = updated;
        await window.electron.ipcRenderer.invoke(
          "db:run",
          "UPDATE DATA_TeminDosyasi SET sablon_tercihleri = ? WHERE id = ?",
          [JSON.stringify(existingObj), activeDosyaId],
        );
      } catch (e) {
        console.error("Failed to delete multiple kabulTutanaklari:", e);
      }
    }
  };

  const handleToggleApproveTutanak = async (id: string): Promise<void> => {
    const todayStr = new Date().toISOString().split("T")[0];
    const updated = tutanaklar.map((t) => {
      if (t.id === id) {
        const nextApproved = !(t.onaylandi ?? true); // varsayılan olarak true değilse toggle
        return {
          ...t,
          onaylandi: nextApproved,
          islenmisMi: nextApproved,
          onayTarihi: nextApproved ? (t.onayTarihi || todayStr) : undefined,
        };
      }
      return t;
    });
    setTutanaklar(updated);

    if (activeDosyaId && window.electron) {
      try {
        const fileRes = await window.electron.ipcRenderer.invoke(
          "db:query",
          "SELECT sablon_tercihleri FROM DATA_TeminDosyasi WHERE id = ?",
          [activeDosyaId],
        );
        let existingObj: any = {};
        if (fileRes.success && fileRes.data?.[0]?.sablon_tercihleri) {
          try {
            existingObj =
              typeof fileRes.data[0].sablon_tercihleri === "string"
                ? JSON.parse(fileRes.data[0].sablon_tercihleri) || {}
                : fileRes.data[0].sablon_tercihleri || {};
          } catch {}
        }
        existingObj.kabulTutanaklari = updated;
        await window.electron.ipcRenderer.invoke(
          "db:run",
          "UPDATE DATA_TeminDosyasi SET sablon_tercihleri = ? WHERE id = ?",
          [JSON.stringify(existingObj), activeDosyaId],
        );
      } catch (e) {
        console.error("Failed to toggle approve tutanak:", e);
      }
    }
  };

  const handleBulkApproveTutanaklar = async (
    ids: string[],
    approved = true,
  ): Promise<void> => {
    const idSet = new Set(ids);
    const todayStr = new Date().toISOString().split("T")[0];
    const updated = tutanaklar.map((t) => {
      if (idSet.has(t.id)) {
        return {
          ...t,
          onaylandi: approved,
          islenmisMi: approved,
          onayTarihi: approved ? (t.onayTarihi || todayStr) : undefined,
        };
      }
      return t;
    });
    setTutanaklar(updated);

    if (activeDosyaId && window.electron) {
      try {
        const fileRes = await window.electron.ipcRenderer.invoke(
          "db:query",
          "SELECT sablon_tercihleri FROM DATA_TeminDosyasi WHERE id = ?",
          [activeDosyaId],
        );
        let existingObj: any = {};
        if (fileRes.success && fileRes.data?.[0]?.sablon_tercihleri) {
          try {
            existingObj =
              typeof fileRes.data[0].sablon_tercihleri === "string"
                ? JSON.parse(fileRes.data[0].sablon_tercihleri) || {}
                : fileRes.data[0].sablon_tercihleri || {};
          } catch {}
        }
        existingObj.kabulTutanaklari = updated;
        await window.electron.ipcRenderer.invoke(
          "db:run",
          "UPDATE DATA_TeminDosyasi SET sablon_tercihleri = ? WHERE id = ?",
          [JSON.stringify(existingObj), activeDosyaId],
        );
      } catch (e) {
        console.error("Failed to bulk approve tutanaklar:", e);
      }
    }
  };

  const allStageSablons = sablons.filter(
    (s) =>
      s.kategori === "4-kabul-ve-odeme-islemleri" ||
      s.kategori === "4. Muayene & Kabul & Ödeme İşlemleri",
  );

  const stageSablons = allStageSablons.filter((s) => {
    const key = String(s.dosya_adi || s.id || "").toLowerCase();
    if (isHizmet) {
      return (
        !key.includes("muayene-kabul-tutanagi") &&
        !key.includes("muayene-kabul-komisyonu") &&
        !key.includes("tasinir-islem-fisi")
      );
    } else {
      return (
        !key.includes("hizmet-isleri") &&
        !key.includes("hakedis-raporu") &&
        !key.includes("puantaj")
      );
    }
  });

  const handleQuickPreview = (
    sablonKey: string,
    tutanakItem?: KabulTutanakItem,
  ): void => {
    const found =
      sablons.find(
        (s) =>
          String(s.dosya_adi || s.id || "").toLowerCase() ===
            sablonKey.toLowerCase() ||
          String(s.dosya_adi || s.id || "").toLowerCase().includes(
            sablonKey.toLowerCase(),
          ),
      ) || ({ dosya_adi: sablonKey, ad: sablonKey } as any);

    // Build a per-tutanak override context when a specific row is opened
    let overrideCtx: Record<string, any> | undefined;
    if (tutanakItem) {
      const fmt = (val: number | null | undefined) =>
        val != null
          ? new Intl.NumberFormat("tr-TR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(val)
          : null;

      overrideCtx = {
        ...(dosyaContext || {}),
        // Evrak kimliği
        evrakSayisi: tutanakItem.tutanakNo,
        dosyaTarihi: tutanakItem.tutanakTarihi,
        kabulTarihi: tutanakItem.tutanakTarihi,
        // Fatura / irsaliye
        faturaNo: tutanakItem.faturaNo,
        faturaTarihi: tutanakItem.faturaTarihi,
        irsaliyeNo: tutanakItem.irsaliyeNo,
        irsaliyeTarihi: tutanakItem.irsaliyeTarihi,
        // Firma
        yukleniciFirma: kazananFirmaUnvan,
        // Tutarlar
        genelToplam: fmt(tutanakItem.tutar),
        kdvDahilToplam: fmt(tutanakItem.tutar),
        tutar: fmt(tutanakItem.tutar),
        kabulEdilenTutar: fmt(tutanakItem.tutar),
        tutanakNo: tutanakItem.tutanakNo,
        tutanakTarihi: tutanakItem.tutanakTarihi,
        // Teslim
        teslimYeri: tutanakItem.teslimYeri,
        // Notlar
        tutanakNotu: tutanakItem.notlar,
        // Mal kalemleri → muayene-kabul-tutanagi şablonu için
        ihtiyacKalemleri: (tutanakItem.kalemler || []).map((k, i) => ({
          siraNo: k.siraNo || i + 1,
          malzemeAdi: k.malzemeAdi,
          ozelligi: k.ozelligi,
          birimi: k.birimi,
          miktar: k.miktari,
          buguneKadarKabulEdilen: k.oncekiTeslimAlinan ?? 0,
          bugunKabulEdilenMiktar: k.kabulMiktari,
          kalanMiktar: Math.max(0, k.miktari - (k.kabulMiktari || 0)),
          birimFiyat: k.birimFiyati,
          birimFiyati: fmt(k.birimFiyati),
          kalemTutari: fmt(
            k.toplamTutar || (k.kabulMiktari || 0) * (k.birimFiyati || 0)
          ),
          teslimYeri: tutanakItem.teslimYeri,
        })),
        // Komisyon heyeti
        muayeneKomisyonu: komisyonUyeleri.map((u) => ({
          gorevi: u.gorev || "Üye",
          adSoyad: u.ad_soyad,
          unvan: u.unvan || "",
        })),
      };
    }

    handleOpenPreviewForSablon(
      found,
      (found as any).ad || sablonKey,
      overrideCtx,
    );
  };

  const reloadKomisyonUyeleri = async (): Promise<void> => {
    if (!activeDosyaId) return;
    try {
      const allKomRes = await window.electron.ipcRenderer.invoke(
        "db:query",
        `SELECT id, komisyon_id, ad_soyad, unvan, gorev, komisyon_turu, COALESCE(rol, 'Asil') as asli_yedek FROM DATA_TeminKomisyon
         WHERE temin_dosya_id = ?
         ORDER BY (CASE WHEN LOWER(COALESCE(gorev, '')) LIKE '%başkan%' OR LOWER(COALESCE(gorev, '')) LIKE '%baskan%' THEN 0 ELSE 1 END) ASC, id ASC`,
        [activeDosyaId],
      );
      if (allKomRes.success && Array.isArray(allKomRes.data)) {
        const muayeneMembers = allKomRes.data.filter((k: any) => {
          if (!k) return false;
          if (k.komisyon_id === 2) return true;
          if (k.komisyon_id === 1) return false;
          const tur = (k.komisyon_turu || "").toLowerCase();
          if (tur.includes("muayene") || tur.includes("kabul")) return true;
          if (tur.includes("maliyet") || tur.includes("fiyat")) return false;
          const gorev = (k.gorev || "").toLowerCase();
          if (
            gorev.includes("fiyat araştırma") ||
            gorev.includes("harcama yetkili") ||
            gorev.includes("muhasebe yetkili") ||
            gorev.includes("gerçekleştirme") ||
            gorev.includes("gerceklestirme")
          ) {
            return false;
          }
          return true;
        });
        setKomisyonUyeleri(muayeneMembers);
        const baskan = muayeneMembers.find(
          (k: any) =>
            k.gorev?.toLowerCase().includes("başkan") ||
            k.gorev?.toLowerCase().includes("baskan"),
        );
        setKomisyonBaskani(
          baskan ? baskan.ad_soyad : muayeneMembers[0]?.ad_soyad || "",
        );
      }
    } catch (e) {
      console.error("Failed to reload komisyon:", e);
    }
  };

  useEffect(() => {
    if (!activeDosyaId) return;

    let isMounted = true;

    const checkKazananFirma = async (): Promise<void> => {
      try {
        const [dosyaRes, komRes] = await Promise.all([
          window.electron.ipcRenderer.invoke(
            "db:query",
            `SELECT d.firma_id, f.unvan, f.vergi_no,
                    d.yaklasik_maliyet, d.teslim_tarihi,
                    d.fiyat_farki_dayanagi, COALESCE(NULLIF(d.alim_turu, ''), NULLIF(d.tur, ''), 'mal') as alim_turu,
                    d.dosya_acilis_tarihi, d.temin_tarihi, d.tarih,
                    d.ihtiyac_yeri, d.sablon_tercihleri
             FROM DATA_TeminDosyasi d
             LEFT JOIN TANIM_Firma f ON d.firma_id = f.id
             WHERE d.id = ?`,
            [activeDosyaId],
          ),
          window.electron.ipcRenderer.invoke(
            "db:query",
            `SELECT id, komisyon_id, ad_soyad, unvan, gorev, komisyon_turu, COALESCE(rol, 'Asil') as asli_yedek FROM DATA_TeminKomisyon
             WHERE temin_dosya_id = ?
             ORDER BY (CASE WHEN LOWER(COALESCE(gorev, '')) LIKE '%başkan%' OR LOWER(COALESCE(gorev, '')) LIKE '%baskan%' THEN 0 ELSE 1 END) ASC, id ASC`,
            [activeDosyaId],
          ),
        ]);

        if (!isMounted) return;

        if (dosyaRes.success && dosyaRes.data && dosyaRes.data.length > 0) {
          const row = dosyaRes.data[0];
          let effectiveFirmaId = row.firma_id || null;
          let effectiveUnvan = row.unvan || "";
          let effectiveVergiNo = row.vergi_no || null;

          if (row.sablon_tercihleri) {
            try {
              const prefs = typeof row.sablon_tercihleri === "string"
                ? JSON.parse(row.sablon_tercihleri)
                : row.sablon_tercihleri;
              if (Array.isArray(prefs?.kabulTutanaklari)) {
                setTutanaklar(prefs.kabulTutanaklari);
              }
            } catch (err) {
              console.warn("Failed to parse kabulTutanaklari from prefs:", err);
            }
          }

          if (effectiveFirmaId && !effectiveUnvan) {
            try {
              const tfCheck = await window.electron.ipcRenderer.invoke(
                "db:query",
                `SELECT COALESCE(NULLIF(tf.unvan, ''), NULLIF(f.unvan, ''), 'İstekli Firma') as unvan,
                        COALESCE(NULLIF(tf.vergi_no, ''), NULLIF(f.vergi_no, '')) as vergi_no
                 FROM DATA_TeminFirma tf
                 LEFT JOIN TANIM_Firma f ON tf.firma_id = f.id
                 WHERE tf.temin_dosya_id = ? AND (tf.firma_id = ? OR tf.id = ?)
                 LIMIT 1`,
                [activeDosyaId, effectiveFirmaId, effectiveFirmaId],
              );
              if (tfCheck.success && tfCheck.data?.length > 0) {
                effectiveUnvan = tfCheck.data[0].unvan || "";
                effectiveVergiNo = tfCheck.data[0].vergi_no || effectiveVergiNo;
              }
            } catch (err) {
              console.warn(
                "Failed to check DATA_TeminFirma fallback unvan:",
                err,
              );
            }
          }

          if (!effectiveFirmaId || !effectiveUnvan) {
            const autoLowestRes = await window.electron.ipcRenderer.invoke(
              "db:query",
              `SELECT tf.firma_id, tf.id as temin_firma_id,
                      COALESCE(NULLIF(tf.unvan, ''), NULLIF(f.unvan, ''), 'İstekli Firma') as unvan,
                      COALESCE(NULLIF(tf.vergi_no, ''), NULLIF(f.vergi_no, '')) as vergi_no,
                      COALESCE(
                        NULLIF(tf.teklif_toplami, 0),
                        (SELECT SUM(kt.birim_fiyat * k.miktar)
                         FROM DATA_TeminKalemTeklif kt
                         JOIN DATA_TeminKalem k ON kt.temin_kalem_id = k.id
                         WHERE kt.temin_firma_id = tf.id AND kt.temin_dosya_id = ?)
                      ) as effective_teklif,
                      tf.yasaklilik_durumu
               FROM DATA_TeminFirma tf
               LEFT JOIN TANIM_Firma f ON tf.firma_id = f.id
               WHERE tf.temin_dosya_id = ? AND (COALESCE(tf.aktif_mi, 1) = 1 OR tf.aktif_mi = '1' OR tf.aktif_mi = 'true')
               ORDER BY (CASE WHEN tf.kazanan_mi = 1 THEN 0 ELSE 1 END),
                        CASE WHEN effective_teklif > 0 THEN effective_teklif ELSE 999999999 END ASC
               LIMIT 1`,
              [activeDosyaId, activeDosyaId],
            );
            if (autoLowestRes.success && autoLowestRes.data?.length > 0) {
              const lowest = autoLowestRes.data[0];
              effectiveFirmaId = lowest.firma_id || lowest.temin_firma_id;
              effectiveUnvan = lowest.unvan || "İstekli Firma";
              effectiveVergiNo = lowest.vergi_no || null;
              window.electron.ipcRenderer.invoke(
                "db:run",
                "UPDATE DATA_TeminDosyasi SET firma_id = ? WHERE id = ?",
                [effectiveFirmaId, activeDosyaId],
              );
              window.electron.ipcRenderer.invoke(
                "db:run",
                "UPDATE DATA_TeminFirma SET kazanan_mi = (CASE WHEN firma_id = ? OR id = ? THEN 1 ELSE 0 END) WHERE temin_dosya_id = ?",
                [effectiveFirmaId, effectiveFirmaId, activeDosyaId],
              );
            }
          }

          let teklifToplami: number | null = null;
          let yasaklilikDurumu: string | null = null;
          if (effectiveFirmaId) {
            const teklifRes = await window.electron.ipcRenderer.invoke(
              "db:query",
              `SELECT tf.teklif_toplami, tf.yasaklilik_durumu,
                      (SELECT SUM(kt.birim_fiyat * k.miktar)
                       FROM DATA_TeminKalemTeklif kt
                       JOIN DATA_TeminKalem k ON kt.temin_kalem_id = k.id
                       WHERE kt.temin_firma_id = tf.id AND kt.temin_dosya_id = ?) as calculated_teklif
                FROM DATA_TeminFirma tf
                WHERE tf.temin_dosya_id = ? AND (tf.firma_id = ? OR tf.id = ?)`,
              [
                activeDosyaId,
                activeDosyaId,
                effectiveFirmaId,
                effectiveFirmaId,
              ],
            );
            if (teklifRes.success && teklifRes.data?.length > 0) {
              teklifToplami = teklifRes.data[0].teklif_toplami ||
                teklifRes.data[0].calculated_teklif || null;
              yasaklilikDurumu = teklifRes.data[0].yasaklilik_durumu;
            }
          }

          let fetchedKomUyeleri: KomisyonUye[] = [];
          let fetchedBaskan = "";

          const isMuayeneMember = (k: any): boolean => {
            if (!k) return false;
            if (k.komisyon_id === 2) return true;
            if (k.komisyon_id === 1) return false;
            const tur = (k.komisyon_turu || "").toLowerCase();
            if (tur.includes("muayene") || tur.includes("kabul")) return true;
            if (tur.includes("maliyet") || tur.includes("fiyat")) return false;
            const gorev = (k.gorev || "").toLowerCase();
            if (
              gorev.includes("fiyat araştırma") ||
              gorev.includes("harcama yetkili") ||
              gorev.includes("muhasebe yetkili") ||
              gorev.includes("gerçekleştirme") ||
              gorev.includes("gerceklestirme")
            ) {
              return false;
            }
            return true;
          };

          if (
            komRes.success && Array.isArray(komRes.data) &&
            komRes.data.length > 0
          ) {
            const muayeneMembers = komRes.data.filter(isMuayeneMember);
            if (muayeneMembers.length > 0) {
              fetchedKomUyeleri = muayeneMembers;
            }
          }

          if (fetchedKomUyeleri.length === 0) {
            try {
              const globalKomRes = await window.electron.ipcRenderer.invoke(
                "db:query",
                `SELECT u.id, u.personel_id, p.ad_soyad, p.unvan, g.ad as gorev, 'Muayene Kabul ve Tespit Komisyonu' as komisyon_turu,
                        (CASE WHEN LOWER(COALESCE(g.ad, '')) LIKE '%başkan%' THEN 'Başkan' ELSE 'Üye' END) as asli_yedek
                 FROM TANIM_KomisyonUye u
                 JOIN TANIM_Personel p ON u.personel_id = p.id
                 LEFT JOIN TANIM_KomisyonGorevi g ON u.gorev_id = g.id
                 WHERE u.komisyon_id = 2 OR u.komisyon_id = (
                   SELECT id FROM TANIM_Komisyon WHERE LOWER(TRIM(ad)) LIKE '%muayene%' OR LOWER(TRIM(ad)) LIKE '%kabul%' LIMIT 1
                 )
                 ORDER BY (CASE WHEN LOWER(COALESCE(g.ad, '')) LIKE '%başkan%' THEN 0 ELSE 1 END) ASC, u.id ASC`,
              );
              if (
                globalKomRes.success && Array.isArray(globalKomRes.data) &&
                globalKomRes.data.length > 0
              ) {
                fetchedKomUyeleri = globalKomRes.data;
              }
            } catch (fallbackErr) {
              console.warn("Global komisyon fallback hatası:", fallbackErr);
            }
          }

          if (fetchedKomUyeleri.length > 0) {
            const baskan = fetchedKomUyeleri.find(
              (k) =>
                k.gorev?.toLowerCase().includes("başkan") ||
                k.gorev?.toLowerCase().includes("baskan"),
            );
            fetchedBaskan = baskan
              ? baskan.ad_soyad
              : fetchedKomUyeleri[0]?.ad_soyad || "";
          }

          const nextStats: FirmaStats = {
            teklifToplami,
            yaklasikMaliyet: row.yaklasik_maliyet || null,
            teslimTarihi: row.teslim_tarihi || null,
            yasaklilikDurumu,
            vergiNo: effectiveVergiNo || row.vergi_no || null,
            fiyatFarkiDayanagi: row.fiyat_farki_dayanagi || null,
            alimTuru: row.alim_turu || null,
            dosyaTarihi: row.temin_tarihi || row.dosya_acilis_tarihi ||
              row.tarih || null,
          };

          setKazananFirmaId(effectiveFirmaId);
          setKazananFirmaUnvan(effectiveUnvan);
          setTeslimYeri(row.ihtiyac_yeri || "");
          setKomisyonUyeleri(fetchedKomUyeleri);
          setKomisyonBaskani(fetchedBaskan);
          setFirmaStats(nextStats);

          try {
            const kalemRes = await window.electron.ipcRenderer.invoke(
              "db:query",
              `SELECT k.id, k.id as sira_no, k.kalem_adi as malzeme_adi, k.kalem_adi,
                      k.aciklama as ozelligi, k.aciklama,
                      k.birim as birimi, k.birim, k.miktar, k.tasinir_kodu, k.kdv_orani,
                      COALESCE(
                        (SELECT kt.birim_fiyat FROM DATA_TeminKalemTeklif kt WHERE kt.temin_kalem_id = k.id AND (kt.temin_firma_id = ? OR kt.temin_firma_id = (SELECT id FROM DATA_TeminFirma WHERE temin_dosya_id = ? AND (firma_id = ? OR id = ?) LIMIT 1)) LIMIT 1),
                        (SELECT MIN(kt2.birim_fiyat) FROM DATA_TeminKalemTeklif kt2 WHERE kt2.temin_kalem_id = k.id AND kt2.birim_fiyat > 0),
                        0
                      ) as birim_fiyat
               FROM DATA_TeminKalem k
               WHERE k.temin_dosya_id = ?
               ORDER BY k.id ASC`,
              [
                effectiveFirmaId,
                activeDosyaId,
                effectiveFirmaId,
                effectiveFirmaId,
                activeDosyaId,
              ],
            );
            if (kalemRes.success && Array.isArray(kalemRes.data)) {
              setDosyaKalemler(kalemRes.data);
            }
          } catch (kalemErr) {
            console.warn("Failed to load DATA_TeminKalem:", kalemErr);
          }

          kabulDataCache.set(activeDosyaId, {
            kazananFirmaId: effectiveFirmaId,
            kazananFirmaUnvan: effectiveUnvan,
            komisyonBaskani: fetchedBaskan,
            komisyonUyeleri: fetchedKomUyeleri,
            teslimYeri: row.ihtiyac_yeri || "",
            firmaStats: nextStats,
            faturaNo,
            faturaTarihi,
          });
        } else {
          setKazananFirmaId(null);
        }
      } catch {
        if (isMounted) setKazananFirmaId(null);
      }
    };

    checkKazananFirma();

    return () => {
      isMounted = false;
    };
  }, [activeDosyaId]);

  const formatCurrency = (val: number | null): string => {
    if (val === null || val === undefined) return "—";
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 2,
    }).format(val);
  };

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat("tr-TR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  return {
    activeDosyaId,
    activeStarredDocs,
    sablons,
    stageSablons,
    ciktiLoading,
    dosyaContext,
    dosyaKalemler,
    previewModalOpen,
    setPreviewModalOpen,
    previewData,
    handleOpenPreviewForSablon,
    quickPrint,
    quickExport,
    quickOpenExternal,
    isSablonDisabled,
    disableDocumentGuidance,
    kazananFirmaId,
    kazananFirmaUnvan,
    komisyonBaskani,
    komisyonUyeleri,
    teslimYeri,
    firmaStats,
    faturaNo,
    setFaturaNo,
    faturaTarihi,
    setFaturaTarihi,
    isTifModalOpen,
    setIsTifModalOpen,
    isKomisyonModalOpen,
    setIsKomisyonModalOpen,
    tutanaklar,
    isTutanakModalOpen,
    setIsTutanakModalOpen,
    editingTutanak,
    setEditingTutanak,
    alimTuru,
    isMal,
    isHizmet,
    isYapim,
    handleOpenAddTutanak,
    handleOpenEditTutanak,
    handleSaveTutanak,
    handleDeleteTutanak,
    handleBulkDeleteTutanaklar,
    handleToggleApproveTutanak,
    handleBulkApproveTutanaklar,
    handleQuickPreview,
    reloadKomisyonUyeleri,
    handleReloadKomisyon: reloadKomisyonUyeleri,
    formatCurrency,
    formatDate,
  };
}

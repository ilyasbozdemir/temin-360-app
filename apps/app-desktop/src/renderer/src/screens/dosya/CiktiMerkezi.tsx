import React, { useEffect, useState } from "react";
import { useWorkspaceStore } from "../../store/workspaceStore";
import { Link } from "@tanstack/react-router";
import { ArrowRight, FileCheck, FileText, Printer } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export function CiktiMerkezi(): React.JSX.Element {
  const { activeDosyaId } = useWorkspaceStore();
  const [activeDosya, setActiveDosya] = useState<any>(null);

  // Fetch active dosya
  useEffect(() => {
    if (!activeDosyaId) return;
    window.electron.ipcRenderer
      .invoke("db:query", "SELECT * FROM DATA_TeminDosyasi WHERE id = ?", [
        activeDosyaId,
      ])
      .then((res) => {
        if (res.success && res.data.length > 0) {
          setActiveDosya(res.data[0]);
        }
      });
  }, [activeDosyaId]);

  // Fetch Alım Türü configs from DB
  const { data: dbAlimTurleri = [] } = useQuery<any[]>({
    queryKey: ["alim_turleri_list_cikti"],
    queryFn: async () => {
      const res = await window.electron.ipcRenderer.invoke(
        "db:query",
        "SELECT * FROM TANIM_AlimTuru WHERE aktif_mi = 1",
      );
      if (!res.success) return [];
      return res.data.map((d: any) => ({
        ...d,
        belgeler: typeof d.belgeler === "string"
          ? JSON.parse(d.belgeler)
          : d.belgeler || [],
      }));
    },
  });

  const activeAlimTuru = activeDosya
    ? dbAlimTurleri.find((t) => {
      const fileTur = activeDosya.tur?.toLowerCase() || "";
      const dbTur = t.tur_adi?.toLowerCase() || "";

      if (fileTur.includes("mal") && dbTur.includes("mal")) return true;
      if (fileTur.includes("hizmet") && dbTur.includes("hizmet")) return true;
      if (
        (fileTur.includes("yapım") || fileTur.includes("yapim")) &&
        (dbTur.includes("yapım") || dbTur.includes("yapim"))
      ) {
        return true;
      }
      if (
        (fileTur.includes("danışmanlık") || fileTur.includes("danismanlik")) &&
        (dbTur.includes("danışmanlık") || dbTur.includes("danismanlik"))
      ) {
        return true;
      }

      return dbTur === fileTur;
    })
    : null;

  // Fetch Produced Documents
  const { data: dbBelgeler = [] } = useQuery<any[]>({
    queryKey: ["cikti_belgeler", activeDosyaId],
    queryFn: async () => {
      if (!activeDosyaId) return [];
      const res = await window.electron.ipcRenderer.invoke(
        "db:query",
        `SELECT belge_adi FROM DATA_TeminBelge WHERE temin_dosya_id = ?`,
        [activeDosyaId],
      );
      if (!res.success) return [];
      return res.data;
    },
    enabled: !!activeDosyaId,
  });

  const getDocumentRoute = (docName: string) => {
    const lower = docName.toLowerCase();
    if (lower.includes("yaklaşık maliyet")) {
      return "/dosya/firmalar-maliyet/yaklasik";
    }
    if (lower.includes("piyasa fiyat araştırma")) {
      return "/dosya/piyasa-fiyat-arastirmasi";
    }
    if (lower.includes("onay belgesi")) return "/dosya/siparis-ve-sozlesme";
    if (lower.includes("harcama talimatı")) return "/dosya/kabul-ve-odeme";
    if (lower.includes("muayene kabul")) return "/dosya/kabul-ve-odeme";
    if (lower.includes("sözleşme tasarısı")) {
      return "/dosya/siparis-ve-sozlesme";
    }
    if (lower.includes("lüzum müzekkeresi")) {
      return "/dosya/hazirlik-ve-ihtiyac";
    }
    return null;
  };

  const getDocumentStatus = (docName: string, skippedDocs: string[]) => {
    if (!activeDosya) return "bekliyor";
    if (skippedDocs.includes(docName)) return "atlandi";

    // Gerçek Belge Kontrolü: Bu belge DATA_TeminBelge tablosunda üretilmiş olarak var mı?
    const isProduced = dbBelgeler.some((b: any) => b.belge_adi === docName);
    if (isProduced) return "tamamlandi";

    return "bekliyor";
  };

  // Tab Title Update
  useEffect(() => {
    document.title = "Çıktı & Yazdırma Merkezi - Doğrudan Temin";
  }, []);

  if (!activeDosyaId || !activeDosya) {
    return (
      <div className="p-8 max-w-7xl mx-auto w-full">
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30 text-amber-800 dark:text-amber-400 p-6 rounded-2xl flex items-center gap-3">
          <FileText className="w-6 h-6" />
          <div className="font-semibold">
            Lütfen önce bir dosya seçin. İşlem yapabilmek için sol taraftan veya
            "Dosyalar" menüsünden aktif bir dosya seçmeniz gerekmektedir.
          </div>
        </div>
      </div>
    );
  }

  let orderedDocs: string[] | null = null;
  let skippedDocs: string[] = [];

  try {
    orderedDocs = activeDosya.ordered_docs
      ? JSON.parse(activeDosya.ordered_docs)
      : null;
  } catch (e) {
    console.error("ordered_docs parse error", e);
  }

  try {
    skippedDocs = activeDosya.skipped_docs
      ? JSON.parse(activeDosya.skipped_docs)
      : [];
  } catch (e) {
    console.error("skipped_docs parse error", e);
  }

  const documentList =
    orderedDocs && Array.isArray(orderedDocs) && orderedDocs.length > 0
      ? orderedDocs
      : activeAlimTuru && activeAlimTuru.belgeler &&
          activeAlimTuru.belgeler.length > 0
      ? activeAlimTuru.belgeler.map((
        b: any,
      ) => (typeof b === "string" ? b : b?.ad || ""))
      : [
        "Yaklaşık Maliyet Cetveli",
        "Piyasa Fiyat Araştırma Tutanağı",
        "Onay Belgesi",
        "Harcama Talimatı",
        "Muayene Kabul Komisyonu Tutanağı",
        "Harcama Pusulası",
      ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl">
          <Printer className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Çıktı & Üretim Merkezi
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Dosyanıza ait tüm evrakların tek merkezden üretimi ve yazdırılması.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documentList.map((docName: string, idx: number) => {
          const status = getDocumentStatus(docName, skippedDocs);
          const route = getDocumentRoute(docName);

          return (
            <div
              key={idx}
              className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${
                status === "atlandi"
                  ? "bg-slate-50/50 dark:bg-slate-900/20 border-transparent opacity-60"
                  : status === "tamamlandi"
                  ? "bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-900/30 shadow-sm hover:shadow-md"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-300"
              }`}
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`p-2.5 rounded-xl ${
                      status === "tamamlandi"
                        ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600"
                        : status === "atlandi"
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-400"
                        : "bg-blue-50 dark:bg-blue-900/20 text-blue-600"
                    }`}
                  >
                    {status === "tamamlandi"
                      ? <FileCheck className="w-6 h-6" />
                      : <FileText className="w-6 h-6" />}
                  </div>
                  <div className="flex gap-2">
                    <span className="text-xs font-bold px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg">
                      #{idx + 1}
                    </span>
                  </div>
                </div>

                <h3
                  className={`font-bold text-base mb-1 ${
                    status === "atlandi"
                      ? "text-slate-400 line-through"
                      : "text-slate-800 dark:text-slate-200"
                  }`}
                >
                  {docName}
                </h3>

                <div className="mt-4 flex items-center justify-between">
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                      status === "tamamlandi"
                        ? "bg-emerald-100 text-emerald-700"
                        : status === "atlandi"
                        ? "bg-slate-100 text-slate-500"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {status === "tamamlandi"
                      ? "Hazır / Üretildi"
                      : status === "atlandi"
                      ? "Dışarıdan Sağlandı"
                      : "Üretim Bekliyor"}
                  </span>

                  {route && status !== "atlandi" && (
                    <Link
                      to={route}
                      className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      Üret/Gör <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                  {!route && status !== "atlandi" && (
                    <span className="text-[10px] text-slate-400 italic">
                      Sistem dışı üretilir
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

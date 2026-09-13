import React, { useEffect, useState } from "react";
import { useTabStore } from "../../store/tabStore";
import { useWorkspaceStore } from "../../store/workspaceStore";
import { DosyaInspectorView } from "./components/inspector/DosyaInspectorView";
import { FileSearch, Layers } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

export const DosyaDataInspectorScreen: React.FC = () => {
  const { activeTabPath } = useTabStore();
  const { activeDosyaId } = useWorkspaceStore();
  const navigate = useNavigate();

  const [dosya, setDosya] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 1) Tab path or window location / hash param
  const tabParams = new URLSearchParams(activeTabPath.split("?")[1] || "");
  const searchParams = new URLSearchParams(window.location.search);
  const hashQuery = window.location.hash.split("?")[1] || "";
  const hashParams = new URLSearchParams(hashQuery);
  const paramIdStr = tabParams.get("id") || hashParams.get("id") || searchParams.get("id");
  const targetId = paramIdStr ? parseInt(paramIdStr, 10) : activeDosyaId;

  useEffect(() => {
    let isMounted = true;
    const loadDosya = async () => {
      if (!targetId || !window.electron) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await window.electron.ipcRenderer.invoke(
          "db:query",
          "SELECT * FROM DATA_TeminDosyasi WHERE id = ?",
          [targetId]
        );
        if (isMounted) {
          if (res?.success && res.data.length > 0) {
            setDosya(res.data[0]);
          } else {
            setDosya(null);
          }
        }
      } catch (err) {
        console.error("Dosya yüklenirken hata:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDosya();
    return () => {
      isMounted = false;
    };
  }, [targetId]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400 bg-slate-50 dark:bg-slate-950 h-full">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm font-medium">Dosya künyesi ve verileri yükleniyor...</p>
      </div>
    );
  }

  if (!dosya) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-50 dark:bg-slate-950 h-full">
        <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-4 shadow-sm">
          <FileSearch className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
          Görüntülenecek Dosya Seçilmedi
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mb-6">
          Dosya veri denetçisi (künye) ekranında bir dosyayı incelemek için Doğrudan Temin listesinden bir dosya seçebilir veya Süreç Takip paneline gidebilirsiniz.
        </p>
        <button
          onClick={() => navigate({ to: "/dosyalar" })}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md cursor-pointer transition-all"
        >
          <Layers className="w-4 h-4" />
          Doğrudan Temin Dosyalarına Git
        </button>
      </div>
    );
  }

  return <DosyaInspectorView dosya={dosya} mode="screen" className="rounded-none border-0 shadow-none" />;
};

export default DosyaDataInspectorScreen;

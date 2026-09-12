import { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Edit,
  ExternalLink,
  Eye,
  Lock,
  MoreVertical,
  Sliders,
  Trash2,
  Unlock,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { cn } from "../../../utils/cn";
import { useTabStore } from "../../../store/tabStore";
import { DosyaDataInspectorModal } from "./DosyaDataInspectorModal";

export interface DosyaActionMenuProps {
  dosya: any;
  openMenuId: number | null;
  setOpenMenuId: (id: number | null) => void;
  selectedDosyaIds: number[];
  menuClassName?: string;
  handleOpenInNewWindow?: (dosya: any) => void;
  handleUpdateStatus?: (id: number, status: string) => Promise<void>;
  handleEkapGonder?: (id: number) => void;
  handleKilidiAc?: (id: number) => Promise<void>;
  handleOpenAI?: (dosya: any) => void;
  handleDelete?: (id: number) => Promise<void>;
  handleHardDelete?: (id: number) => Promise<void>;
  handleOpenMaliyetAyarlari?: (dosya: any) => void;
}

export function DosyaActionMenu({
  dosya,
  openMenuId,
  setOpenMenuId,
  selectedDosyaIds,
  menuClassName,
  handleOpenInNewWindow,
  handleUpdateStatus,
  handleEkapGonder,
  handleKilidiAc,
  handleOpenAI,
  handleDelete,
  handleHardDelete,
  handleOpenMaliyetAyarlari,
}: DosyaActionMenuProps) {
  const navigate = useNavigate();
  const { addTab } = useTabStore();
  const [showInspector, setShowInspector] = useState(false);
  const isOpen = openMenuId === dosya.id;

  return (
    <>
      <div
        className={cn(
          "relative",
          menuClassName?.includes("inline-block") ? "inline-block" : "",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setOpenMenuId(isOpen ? null : dosya.id);
          }}
          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <MoreVertical
            size={menuClassName?.includes("inline-block") ? 16 : 14}
          />
        </button>

        {isOpen && (
          <div
            className={cn(
              "absolute bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl py-1 flex flex-col text-xs font-semibold",
              menuClassName || "right-0 top-full mt-1 w-52 z-[999]",
            )}
          >
            <button
              onClick={() => {
                setOpenMenuId(null);
                handleOpenInNewWindow && handleOpenInNewWindow(dosya);
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200 flex items-center gap-2"
            >
              <ExternalLink size={13} className="text-slate-400" />{" "}
              Yeni Pencerede Aç
            </button>

            {dosya.is_deleted !== 1 && dosya.is_ekap_sent !== 1 && (
              <button
                disabled={selectedDosyaIds.length > 1}
                onClick={() => {
                  setOpenMenuId(null);
                  navigate({
                    to: `/dosyalar/yeni?id=${dosya.id}`,
                  });
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Edit size={13} className="text-slate-400" /> Düzenle
              </button>
            )}

            {/* Dosya Veri Görüntüleyici (View) */}
            <button
              onClick={() => {
                setOpenMenuId(null);
                setShowInspector(true);
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center gap-2 font-bold"
            >
              <Eye size={13} className="text-blue-500" />{" "}
              Tüm Ayarları & Verileri İncele (View)
            </button>

            <button
              onClick={() => {
                setOpenMenuId(null);
                const route = `/dosya/kunye?id=${dosya.id}`;
                addTab(route);
                navigate({ to: route });
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center gap-2"
            >
              <ExternalLink size={13} className="text-blue-500" />{" "}
              Dosya Künyesi (Sekmede Aç)
            </button>

            {dosya.is_deleted !== 1 && handleOpenMaliyetAyarlari && (
              <button
                onClick={() => {
                  setOpenMenuId(null);
                  handleOpenMaliyetAyarlari(dosya);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200 flex items-center gap-2"
              >
                <Sliders size={13} className="text-slate-400" />{" "}
                Yaklaşık Maliyet Ayarları
              </button>
            )}

            {dosya.is_deleted !== 1 && (
              <button
                onClick={() => {
                  setOpenMenuId(null);
                  handleUpdateStatus &&
                    handleUpdateStatus(
                      dosya.id,
                      dosya.status === "tamamlandi"
                        ? "devam_ediyor"
                        : "tamamlandi",
                    );
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200 flex items-center gap-2"
              >
                {dosya.status === "tamamlandi"
                  ? (
                    <>
                      <Clock size={13} className="text-amber-500" /> Aktife Al
                    </>
                  )
                  : (
                    <>
                      <CheckCircle2 size={13} className="text-emerald-500" />
                      {" "}
                      Tamamlandı İşaretle
                    </>
                  )}
              </button>
            )}

            {dosya.is_deleted !== 1 && (
              <button
                onClick={() => {
                  setOpenMenuId(null);
                  dosya.is_ekap_sent === 1
                    ? handleKilidiAc && handleKilidiAc(dosya.id)
                    : handleEkapGonder && handleEkapGonder(dosya.id);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200 flex items-center gap-2"
              >
                {dosya.is_ekap_sent === 1
                  ? (
                    <>
                      <Unlock size={13} className="text-amber-500" />{" "}
                      Kilidi Aç / EKAP İptal
                    </>
                  )
                  : (
                    <>
                      <Lock size={13} className="text-indigo-500" />{" "}
                      Dosyayı Kilitle (EKAP)
                    </>
                  )}
              </button>
            )}

            {dosya.is_deleted !== 1 && (
              <button
                onClick={() => {
                  setOpenMenuId(null);
                  handleOpenAI && handleOpenAI(dosya);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center gap-2"
              >
                <AlertCircle size={13} className="text-indigo-500" />{" "}
                Yapay Zeka Asistanı
              </button>
            )}

            {dosya.is_deleted !== 1 && dosya.is_ekap_sent !== 1 && (
              <>
                <div className="h-px bg-slate-100 dark:bg-slate-800 my-1 mx-2" />
                <button
                  onClick={() => {
                    setOpenMenuId(null);
                    handleDelete && handleDelete(dosya.id);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center gap-2"
                >
                  <Trash2 size={13} /> İptal Et / Sil
                </button>
              </>
            )}

            {import.meta.env.DEV && (
              <>
                <div className="h-px bg-slate-100 dark:bg-slate-800 my-1 mx-2" />
                <button
                  onClick={() => {
                    setOpenMenuId(null);
                    handleHardDelete && handleHardDelete(dosya.id);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center gap-2"
                >
                  <AlertCircle size={13} /> Kalıcı Sil (Dev Mode)
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <DosyaDataInspectorModal
        isOpen={showInspector}
        onClose={() => setShowInspector(false)}
        dosya={dosya}
      />
    </>
  );
}

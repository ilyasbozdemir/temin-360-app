import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  CheckCircle2,
  CreditCard,
  Edit2,
  FileCheck,
  FileText,
  MoreHorizontal,
  PackageCheck,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { KabulTutanakItem } from "../types";

interface TutanakRowActionsMenuProps {
  tut: KabulTutanakItem;
  primarySablonKey: string;
  isMal: boolean;
  onOpenPreview?: (sablonKey: string, tutanak?: KabulTutanakItem) => void;
  onToggleApproveTutanak?: (id: string) => void;
  onEditTutanak?: (tutanak: KabulTutanakItem) => void;
  onDeleteTutanak?: (id: string) => void;
  onOpenTifModal?: () => void;
}

export function TutanakRowActionsMenu({
  tut,
  primarySablonKey,
  isMal,
  onOpenPreview,
  onToggleApproveTutanak,
  onEditTutanak,
  onDeleteTutanak,
  onOpenTifModal,
}: TutanakRowActionsMenuProps): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  const updateCoords = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const menuWidth = 220;
      let left = rect.right - menuWidth;
      if (left < 10) left = 10;
      const menuHeight = 320;
      let top = rect.bottom + 4;
      if (top + menuHeight > window.innerHeight) {
        top = Math.max(10, rect.top - menuHeight - 4);
      }
      setCoords({ top, left });
    }
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    updateCoords();
    window.addEventListener("resize", updateCoords);
    window.addEventListener("scroll", updateCoords, true);
    return () => {
      window.removeEventListener("resize", updateCoords);
      window.removeEventListener("scroll", updateCoords, true);
    };
  }, [open, updateCoords]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent): void => {
      const target = e.target as Node;
      if (
        buttonRef.current &&
        !buttonRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    const handleClear = (): void => setOpen(false);
    document.addEventListener("mousedown", handler);
    window.addEventListener("app:clear-overlays", handleClear);
    return () => {
      document.removeEventListener("mousedown", handler);
      window.removeEventListener("app:clear-overlays", handleClear);
    };
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        title="Tutanak İşlemleri"
      >
        <MoreHorizontal size={15} />
      </button>

      {open &&
        coords &&
        createPortal(
          <div
            ref={menuRef}
            style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
            className="fixed z-[9999] w-52 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xl py-1 text-left animate-in fade-in zoom-in-95 duration-150"
          >
            {onToggleApproveTutanak && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onToggleApproveTutanak(tut.id);
                }}
                className={`w-full px-3 py-2 text-xs font-semibold flex items-center gap-2 cursor-pointer ${
                  (tut.onaylandi ?? true)
                    ? "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                    : "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 font-bold"
                }`}
              >
                <CheckCircle2
                  size={13}
                  className={(tut.onaylandi ?? true) ? "text-slate-400" : "text-emerald-600"}
                />
                <span>
                  {(tut.onaylandi ?? true)
                    ? "Onayı Kaldır (Taslak Yap)"
                    : "Onayla & İşleme Al"}
                </span>
              </button>
            )}

            {onEditTutanak && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onEditTutanak(tut);
                }}
                className="w-full px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
              >
                <Edit2 size={13} className="text-blue-500" />
                <span>Düzenle / Özelleştir</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onOpenPreview?.(primarySablonKey, tut);
              }}
              className="w-full px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
            >
              <FileText size={13} className="text-blue-500" />
              <span>Kabul Tutanağı Belgesi</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onOpenPreview?.("muayene-kabul-komisyonu", tut);
              }}
              className="w-full px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
            >
              <ShieldCheck size={13} className="text-indigo-500" />
              <span>Komisyon Kararı Belgesi</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onOpenPreview?.("odeme-yazisi", tut);
              }}
              className="w-full px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
            >
              <FileText size={13} className="text-emerald-500" />
              <span>Ödeme Yazısı Al</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onOpenPreview?.("odeme-emri-belgesi", tut);
              }}
              className="w-full px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
            >
              <CreditCard size={13} className="text-blue-500" />
              <span>Ödeme Emri (MİF) Al</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onOpenPreview?.("kabul-edilen-teklif", tut);
              }}
              className="w-full px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
            >
              <FileCheck size={13} className="text-violet-500" />
              <span>Ödeme Onay Yazısı (Kabul)</span>
            </button>

            {isMal && onOpenTifModal && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onOpenTifModal();
                }}
                className="w-full px-3 py-2 text-xs font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center gap-2 cursor-pointer border-t border-slate-100 dark:border-slate-700/60"
              >
                <PackageCheck size={13} className="text-emerald-600" />
                <span>Ambara Aktar (TİF)</span>
              </button>
            )}

            {onDeleteTutanak && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  if (
                    window.confirm(
                      `"${tut.tutanakNo}" numaralı tutanağı silmek istediğinizden emin misiniz?`,
                    )
                  ) {
                    onDeleteTutanak(tut.id);
                  }
                }}
                className="w-full px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2 cursor-pointer border-t border-slate-100 dark:border-slate-700/60"
              >
                <Trash2 size={13} />
                <span>Tutanağı Sil</span>
              </button>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}

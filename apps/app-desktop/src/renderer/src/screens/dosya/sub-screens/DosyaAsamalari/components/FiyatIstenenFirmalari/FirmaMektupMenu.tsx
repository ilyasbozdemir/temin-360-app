import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ChevronDown,
  FileSpreadsheet,
  FileText,
  Layers,
  Mail,
  Tag,
} from "lucide-react";
import { MEKTUP_MENU_ITEMS } from "./constants";
import { Firma, FirmaMektupMenuProps } from "./types";

export function FirmaMektupMenu({
  firma,
  onFiyatPiyasaFormu,
  onIdareFiyatArastirmaMektubu,
  onBirimFiyatArastirmasi,
  onBosTeklifCetveli,
}: FirmaMektupMenuProps): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(
    null,
  );

  const updateCoords = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const menuWidth = 270;
      let left = rect.right - menuWidth;
      if (left < 10) left = 10;
      let top = rect.bottom + 4;
      if (top + 220 > window.innerHeight) {
        top = Math.max(10, rect.top - 220 - 4);
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
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleAction = (fn?: (firma: Firma) => void) => {
    if (fn) fn(firma);
    setOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className="relative inline-flex items-center shadow-2xs rounded-lg overflow-hidden border border-blue-200/70 dark:border-blue-800/50"
    >
      <button
        type="button"
        onClick={() => handleAction(onFiyatPiyasaFormu)}
        className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 dark:hover:bg-blue-900/60 text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 border-0"
        title={`${firma.unvan} için Fiyat Araştırma İsteme Mektubunu (Hitaplı & Adresli) Aç`}
      >
        <Mail className="w-3 h-3 text-blue-500" />
        <span>Fiyat Araştırması</span>
      </button>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="px-1 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 dark:hover:bg-blue-900/70 border-l border-blue-200/70 dark:border-blue-800/50 transition-colors cursor-pointer border-t-0 border-b-0 border-r-0"
        title="Mektup ve Teklif Format Seçenekleri"
      >
        <ChevronDown className="w-3 h-3" />
      </button>

      {open &&
        coords &&
        createPortal(
          <div
            ref={menuRef}
            style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
            className="fixed z-[9999] w-72 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl py-1.5 animate-in fade-in zoom-in-95 duration-100 divide-y divide-slate-100 dark:divide-slate-800"
          >
            <div className="px-3 py-1.5 bg-slate-50/70 dark:bg-slate-850">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Mektup & Teklif Formatları
              </p>
              <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 truncate">
                {firma.unvan}
              </p>
            </div>

            <div className="py-1">
              {onFiyatPiyasaFormu && (
                <button
                  type="button"
                  onClick={() => handleAction(onFiyatPiyasaFormu)}
                  className="w-full flex items-start gap-2.5 px-3 py-2 text-left hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {MEKTUP_MENU_ITEMS.ARASTIRMA_MEKTUBU.title}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {MEKTUP_MENU_ITEMS.ARASTIRMA_MEKTUBU.description}
                    </div>
                  </div>
                </button>
              )}

              {onIdareFiyatArastirmaMektubu && (
                <button
                  type="button"
                  onClick={() => handleAction(onIdareFiyatArastirmaMektubu)}
                  className="w-full flex items-start gap-2.5 px-3 py-2 text-left hover:bg-teal-50 dark:hover:bg-teal-950/40 transition-colors cursor-pointer"
                >
                  <Layers className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {MEKTUP_MENU_ITEMS.IDARE_FIYAT_ARASTIRMA.title}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {MEKTUP_MENU_ITEMS.IDARE_FIYAT_ARASTIRMA.description}
                    </div>
                  </div>
                </button>
              )}

              {onBirimFiyatArastirmasi && (
                <button
                  type="button"
                  onClick={() => handleAction(onBirimFiyatArastirmasi)}
                  className="w-full flex items-start gap-2.5 px-3 py-2 text-left hover:bg-violet-50 dark:hover:bg-violet-950/40 transition-colors cursor-pointer"
                >
                  <Tag className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {MEKTUP_MENU_ITEMS.BIRIM_FIYAT_ARASTIRMASI.title}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {MEKTUP_MENU_ITEMS.BIRIM_FIYAT_ARASTIRMASI.description}
                    </div>
                  </div>
                </button>
              )}

              {onBosTeklifCetveli && (
                <button
                  type="button"
                  onClick={() => handleAction(onBosTeklifCetveli)}
                  className="w-full flex items-start gap-2.5 px-3 py-2 text-left hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {MEKTUP_MENU_ITEMS.BOS_TEKLIF_CETVELI.title}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {MEKTUP_MENU_ITEMS.BOS_TEKLIF_CETVELI.description}
                    </div>
                  </div>
                </button>
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

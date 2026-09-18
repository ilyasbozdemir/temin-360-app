import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Calculator,
  FileSpreadsheet,
  FileText,
  MoreVertical,
  ShieldCheck,
  Tag,
  Trash2,
  Trophy,
} from "lucide-react";
import { Firma } from "./types";

export interface RowMenuProps {
  firma: Firma;
  onFirmaCikar?: (firma: Firma) => void;
  onFiyatGir?: () => void;
  onFiyatPiyasaFormu?: (firma: Firma) => void;
  onBirimFiyatArastirmasi?: (firma: Firma) => void;
  onBosTeklifCetveli?: (firma: Firma) => void;
  onEkapSorgula?: (firma: Firma) => void;
  onSetWinnerFirma?: (firma: Firma) => void;
  isWinner?: boolean;
}

export function RowMenu({
  firma,
  onFirmaCikar,
  onFiyatGir,
  onFiyatPiyasaFormu,
  onBirimFiyatArastirmasi,
  onBosTeklifCetveli,
  onEkapSorgula,
  onSetWinnerFirma,
  isWinner,
}: RowMenuProps): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  const updateCoords = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const menuWidth = 240;
      let left = rect.right - menuWidth;
      if (left < 10) left = 10;
      let top = rect.bottom + 4;
      if (top + 280 > window.innerHeight) {
        top = Math.max(10, rect.top - 280 - 4);
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
        buttonRef.current &&
        !buttonRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleItem = (fn: () => void) => {
    fn();
    setOpen(false);
  };

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer border-0"
        title="Diğer İşlemler"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {open &&
        coords &&
        createPortal(
          <div
            ref={menuRef}
            style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
            className="fixed z-[9999] w-64 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl py-1.5 animate-in fade-in zoom-in-95 duration-100"
          >
            {onSetWinnerFirma && (
              <button
                type="button"
                onClick={() => handleItem(() => onSetWinnerFirma(firma))}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors cursor-pointer"
              >
                <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
                {isWinner ? "Kazanan Seçimini Kaldır" : "Kazanan Firma Olarak Seç"}
              </button>
            )}

            {onFiyatGir && (
              <button
                type="button"
                onClick={() => handleItem(onFiyatGir)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
              >
                <Calculator className="w-4 h-4 text-emerald-500 shrink-0" />
                Teklif / Fiyat Girişi Yap
              </button>
            )}

            {onFiyatPiyasaFormu && (
              <button
                type="button"
                onClick={() => handleItem(() => onFiyatPiyasaFormu(firma))}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                Fiyat Araştırma İsteme Mektubu
              </button>
            )}

            {onBirimFiyatArastirmasi && (
              <button
                type="button"
                onClick={() => handleItem(() => onBirimFiyatArastirmasi(firma))}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Tag className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                Birim Fiyat Teklif Mektubu
              </button>
            )}

            {onBosTeklifCetveli && (
              <button
                type="button"
                onClick={() => handleItem(() => onBosTeklifCetveli(firma))}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                Birim Fiyat Teklif Cetveli
              </button>
            )}

            {onEkapSorgula && (
              <button
                type="button"
                onClick={() => handleItem(() => onEkapSorgula(firma))}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-orange-700 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/40 transition-colors cursor-pointer font-medium"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                EKAP Yasaklılık Sorgula
              </button>
            )}

            {onFirmaCikar && (
              <>
                <hr className="my-1 border-slate-100 dark:border-slate-800" />
                <button
                  type="button"
                  onClick={() => handleItem(() => onFirmaCikar(firma))}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 shrink-0" />
                  Listeden Çıkar
                </button>
              </>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}

import React, { useState } from "react";
import { ChevronDown, ChevronsUpDown, Clock, FileCheck, FileSignature } from "lucide-react";
import { cn } from "@renderer/utils/cn";
import { FirmaStats, IslemlerData } from "./types";
import { Step1TeslimatVeSurec } from "./Step1TeslimatVeSurec";
import { Step2SonucOnay } from "./Step2SonucOnay";
import { Step5SozlesmeVeDavet } from "./Step5SozlesmeVeDavet";

interface SiparisVeSozlesmeAccordionProps {
  kazananFirmaUnvan: string;
  firmaStats: FirmaStats;
  islemlerData: IslemlerData;
  sonucOnayEkler: string[];
  savedFeedback: boolean;
  formatCurrency: (val: number | null) => string;
  handleUpdateTeslimGunu: (gun: number) => Promise<void>;
  handleUpdateTeslimTarihi: (dateStr: string) => Promise<void>;
  handleToggleSozlesme: () => Promise<void>;
  handleUpdateEkler: (newEkler: string[]) => Promise<void>;
  handleOpenSonucOnay: () => void;
  handleOpenButceSorgusu: () => void;
  handleOpenKabulMektubu: () => void;
  handleOpenDavetMektubu: () => void;
  handleOpenStandartSozlesme: () => void;
  handleOpenAlternatifSozlesme: () => void;
  handleOpenUzunFormSozlesme: () => void;
}

export function SiparisVeSozlesmeAccordion({
  kazananFirmaUnvan,
  firmaStats,
  islemlerData,
  sonucOnayEkler,
  savedFeedback,
  formatCurrency,
  handleUpdateTeslimGunu,
  handleUpdateTeslimTarihi,
  handleToggleSozlesme,
  handleUpdateEkler,
  handleOpenSonucOnay,
  handleOpenButceSorgusu,
  handleOpenKabulMektubu,
  handleOpenDavetMektubu,
  handleOpenStandartSozlesme,
  handleOpenAlternatifSozlesme,
  handleOpenUzunFormSozlesme,
}: SiparisVeSozlesmeAccordionProps): React.JSX.Element {
  const hasSozlesme = Boolean(firmaStats.sozlesmeYapilacakMi);

  // Accordion açık/kapalı state'leri (Varsayılan olarak hepsi açık)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    teslimat: true,
    sonuc_onay: true,
    sozlesme: true,
  });

  const toggleSection = (key: string): void => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleAllSections = (): void => {
    const allOpen = Object.values(openSections).every(Boolean);
    setOpenSections({
      teslimat: !allOpen,
      sonuc_onay: !allOpen,
      sozlesme: !allOpen,
    });
  };

  return (
    <div className="flex flex-col gap-3">
      {/* ═══ Akordeon / Collapse Başlık Çubuğu ═══ */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            İşlem ve Belge Aşamaları
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">
            {hasSozlesme ? "3 Adım" : "2 Adım"}
          </span>
        </div>

        <button
          type="button"
          onClick={toggleAllSections}
          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer transition-colors py-1 px-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40"
        >
          <ChevronsUpDown className="w-3.5 h-3.5" />
          {Object.values(openSections).every(Boolean)
            ? "Tümünü Daralt"
            : "Tümünü Genişlet"}
        </button>
      </div>

      {/* ── 1. Adım: Teslimat & Sipariş Formu ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => toggleSection("teslimat")}
          className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-slate-50/70 dark:hover:bg-slate-850/50 cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800 text-[10px]">
                  Adım 1
                </span>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  Teslimat Şartları & Sipariş Formu / Kabul Mektubu
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Yasal teslim süresi belirleme, sözleşme tercihi ve kabul/sipariş formunu açma
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800">
              {islemlerData.teslimGunu} Gün Teslimat
            </span>
            <div
              className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 transition-transform duration-200",
                openSections.teslimat && "rotate-180 text-slate-700 dark:text-slate-200",
              )}
            >
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </button>

        {openSections.teslimat && (
          <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800/80 animate-in fade-in duration-200">
            <Step1TeslimatVeSurec
              islemlerData={islemlerData}
              firmaStats={firmaStats}
              savedFeedback={savedFeedback}
              handleUpdateTeslimGunu={handleUpdateTeslimGunu}
              handleUpdateTeslimTarihi={handleUpdateTeslimTarihi}
              handleToggleSozlesme={handleToggleSozlesme}
              onOpenKabulMektubu={handleOpenKabulMektubu}
            />
          </div>
        )}
      </div>

      {/* ── 2. Adım: Karar & Sonuç Onay ve Bütçe Uygunluk ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => toggleSection("sonuc_onay")}
          className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-slate-50/70 dark:hover:bg-slate-850/50 cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shrink-0">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 text-[10px]">
                  Adım 2
                </span>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  Karar & Sonuç Onay, EKLER ve Bütçe Uygunluk Süreci
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Piyasa fiyat araştırması neticesinde sonuç onay belgesi, belge ekleri ve bütçe uygunluk formu
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
              Onay & Ekler
            </span>
            <div
              className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 transition-transform duration-200",
                openSections.sonuc_onay && "rotate-180 text-slate-700 dark:text-slate-200",
              )}
            >
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </button>

        {openSections.sonuc_onay && (
          <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800/80 animate-in fade-in duration-200">
            <Step2SonucOnay
              kazananFirmaUnvan={kazananFirmaUnvan}
              firmaStats={firmaStats}
              formatCurrency={formatCurrency}
              onOpenResultApproval={handleOpenSonucOnay}
              onOpenButceSorgusu={handleOpenButceSorgusu}
              ekler={sonucOnayEkler}
              onUpdateEkler={handleUpdateEkler}
            />
          </div>
        )}
      </div>

      {/* ── 3. Adım: Sözleşme & Davet İşlemleri (Yalnızca Sözleşme Yapılacaksa) ── */}
      {hasSozlesme && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden transition-all">
          <button
            type="button"
            onClick={() => toggleSection("sozlesme")}
            className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-slate-50/70 dark:hover:bg-slate-850/50 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 shrink-0">
                <FileSignature className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800 text-[10px]">
                    Adım 3
                  </span>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    Sözleşme & Davet İşlemleri
                  </h3>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Yüklenici sözleşmeye davet mektubu ve doğrudan temin alım sözleşmesi
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800">
                Sözleşme & Davet
              </span>
              <div
                className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 transition-transform duration-200",
                  openSections.sozlesme && "rotate-180 text-slate-700 dark:text-slate-200",
                )}
              >
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </button>

          {openSections.sozlesme && (
            <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800/80 animate-in fade-in duration-200">
              <Step5SozlesmeVeDavet
                sozlesmeYapilacakMi={firmaStats.sozlesmeYapilacakMi}
                onOpenDavetMektubu={handleOpenDavetMektubu}
                onOpenStandartSozlesme={handleOpenStandartSozlesme}
                onOpenAlternatifSozlesme={handleOpenAlternatifSozlesme}
                onOpenUzunFormSozlesme={handleOpenUzunFormSozlesme}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import React, { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileCheck,
  FileCheck2,
  FileSignature,
  Info,
} from "lucide-react";
import { cn } from "@renderer/utils/cn";
import { FirmaStats, IslemlerData } from "./types";
import { Step2SonucOnay } from "./Step2SonucOnay";
import { Step5SozlesmeVeDavet } from "./Step5SozlesmeVeDavet";
import { Step4KabulVeSiparis } from "./Step4KabulVeSiparis";

interface SiparisVeSozlesmeStepsProps {
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

export function SiparisVeSozlesmeSteps({
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
}: SiparisVeSozlesmeStepsProps): React.JSX.Element {
  const hasSozlesme = Boolean(firmaStats.sozlesmeYapilacakMi);
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);

  const maxStep = hasSozlesme ? 3 : 2;
  const effectiveStep = !hasSozlesme && activeStep > 2 ? 2 : activeStep;

  // Tanımlı adımlar listesi:
  // Adım 1: Karar & Sonuç Onayı (Yetkili Onayı, Ekler, Bütçe)
  // Adım 2: Kabul & Sipariş Formu (Teslimat Ayarları, Şartlar ve Tebligat/Sipariş Belgeleri)
  // Adım 3 (Opsiyonel): Sözleşme & Davet (Sözleşmeye Davet Mektubu & Tip Sözleşmeler)
  const steps = [
    {
      stepNum: 1 as const,
      label: "Karar & Sonuç Onayı",
      sub: `${sonucOnayEkler.length} Ek Belge Seçili`,
      icon: FileCheck,
      badge: "Adım 1",
    },
    {
      stepNum: 2 as const,
      label: "Kabul & Sipariş Formu",
      sub: `${islemlerData.teslimGunu || 7} Günlük Teslim Süresi`,
      icon: FileCheck2,
      badge: "Adım 2",
    },
    ...(hasSozlesme
      ? [
        {
          stepNum: 3 as const,
          label: "Sözleşme & Davet",
          sub: "Sözleşmeye Davet ve Metinler",
          icon: FileSignature,
          badge: "Adım 3",
        },
      ]
      : []),
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* ═══ Kibar ve Modern Stepper / Sekme Çubuğu ═══ */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 rounded-2xl p-2 shadow-xs">
        <div
          className={cn(
            "grid gap-2",
            hasSozlesme
              ? "grid-cols-1 md:grid-cols-3"
              : "grid-cols-1 sm:grid-cols-2",
          )}
        >
          {steps.map((step) => {
            const isActive = effectiveStep === step.stepNum;
            const isCompleted = step.stepNum < effectiveStep;
            const StepIcon = step.icon;

            return (
              <button
                key={step.stepNum}
                type="button"
                onClick={() => setActiveStep(step.stepNum as 1 | 2 | 3)}
                className={cn(
                  "relative flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer group select-none",
                  isActive
                    ? "bg-blue-50/80 dark:bg-blue-950/40 border-blue-500/80 dark:border-blue-500/80 shadow-xs ring-1 ring-blue-500/20"
                    : isCompleted
                    ? "bg-slate-50/60 dark:bg-slate-850/40 border-slate-200/80 dark:border-slate-800 hover:bg-slate-100/70 dark:hover:bg-slate-800/60"
                    : "bg-slate-50/30 dark:bg-slate-850/20 border-slate-200/50 dark:border-slate-800/50 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 opacity-75 hover:opacity-100",
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Step Numarası / İkon */}
                  <div
                    className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors border",
                      isActive
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : isCompleted
                        ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                        : "bg-slate-200/80 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-700",
                    )}
                  >
                    {isCompleted
                      ? <CheckCircle2 className="w-4 h-4" />
                      : <StepIcon className="w-4 h-4" />}
                  </div>

                  {/* Metinler */}
                  <div className="flex flex-col min-w-0">
                    <span
                      className={cn(
                        "text-xs font-bold truncate leading-tight",
                        isActive
                          ? "text-blue-900 dark:text-blue-100"
                          : isCompleted
                          ? "text-slate-800 dark:text-slate-200"
                          : "text-slate-600 dark:text-slate-400",
                      )}
                    >
                      {step.label}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate leading-tight mt-0.5">
                      {step.sub}
                    </span>
                  </div>
                </div>

                {/* Durum Rozeti */}
                <div className="shrink-0 ml-2">
                  {isActive
                    ? (
                      <span className="text-[9.5px] font-extrabold px-2 py-0.5 rounded-full bg-blue-600 text-white shadow-2xs animate-in fade-in">
                        Aktif
                      </span>
                    )
                    : isCompleted
                    ? (
                      <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        Tamamlandı
                      </span>
                    )
                    : (
                      <span className="text-[9.5px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                        Sırada
                      </span>
                    )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══ Sıralama / Bilgilendirme Uyarısı ═══ */}
      {effectiveStep === 1 && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/60 text-blue-900 dark:text-blue-200 text-xs animate-in fade-in duration-200">
          <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="font-bold">
              1. Aşama: Doğrudan Temin Karar & Onay Belgesi:
            </span>
            <p className="text-[11px] text-blue-800 dark:text-blue-300 leading-relaxed">
              Bu adımda oluşturacağınız Sonuç Onay Belgesi ve seçilen dosya
              ekleri (EKLER), alımın yasal olarak sonuçlandırılması için Harcama
              Yetkilisinin onayına sunulur. Onay tamamlandığında istekliye
              tebligat ve sipariş aşamasına geçebilirsiniz.
            </p>
          </div>
        </div>
      )}

      {effectiveStep === 2 && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="font-bold">
              2. Aşama: İstekli Tebligat & Sipariş Formu Yönetimi:
            </span>
            <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
              Kazanan istekliye bildirilecek teslimat süresi ve sözleşme
              durumunu buradan düzenleyebilir, hazırlanan Kabul Edilen Teklif
              Mektubu / Sipariş Formunu anında açıp yazdırabilirsiniz.
            </p>
          </div>
        </div>
      )}

      {effectiveStep === 3 && hasSozlesme && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-violet-50/80 dark:bg-violet-950/30 border border-violet-200/80 dark:border-violet-800/60 text-violet-900 dark:text-violet-200 text-xs animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="font-bold">
              3. Aşama: Sözleşme & Yasal Davet Süreci:
            </span>
            <p className="text-[11px] text-violet-800 dark:text-violet-300 leading-relaxed">
              Bu dosyada sözleşme imzalanması seçilmiştir. Yükleniciye 10 günlük
              yasal sözleşmeye davet mektubu tebliğ edebilir ve ilgili sözleşme
              metinlerini düzenleyebilirsiniz.
            </p>
          </div>
        </div>
      )}

      {/* ═══ Adım İçerik Kartı ═══ */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-all">
        {/* Adım 1: Karar & Sonuç Onayı ve Ekler */}
        {effectiveStep === 1 && (
          <div className="animate-in fade-in duration-200">
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

        {/* Adım 2: Kabul & Sipariş Formu (Teslimat Ayarları + Şartlar + Belge Açma & Yazdırma) */}
        {effectiveStep === 2 && (
          <div className="animate-in fade-in duration-200">
            <Step4KabulVeSiparis
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

        {/* Adım 3: Sözleşme & Davet (Sözleşme Yapılacaksa) */}
        {effectiveStep === 3 && hasSozlesme && (
          <div className="animate-in fade-in duration-200">
            <Step5SozlesmeVeDavet
              sozlesmeYapilacakMi={firmaStats.sozlesmeYapilacakMi}
              onOpenDavetMektubu={handleOpenDavetMektubu}
              onOpenStandartSozlesme={handleOpenStandartSozlesme}
              onOpenAlternatifSozlesme={handleOpenAlternatifSozlesme}
              onOpenUzunFormSozlesme={handleOpenUzunFormSozlesme}
            />
          </div>
        )}

        {/* ═══ Adım Geçiş Butonları ═══ */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
          {effectiveStep > 1
            ? (
              <button
                type="button"
                onClick={() =>
                  setActiveStep((prev) => Math.max(1, prev - 1) as 1 | 2 | 3)}
                className="py-2 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs"
              >
                <ChevronLeft className="w-4 h-4" />
                Önceki Adım
              </button>
            )
            : <div />}

          {effectiveStep < maxStep
            ? (
              <button
                type="button"
                onClick={() =>
                  setActiveStep((prev) =>
                    Math.min(maxStep, prev + 1) as 1 | 2 | 3
                  )}
                className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs hover:shadow active:scale-95 transition-all"
              >
                Sonraki Adıma Geç
                <ChevronRight className="w-4 h-4" />
              </button>
            )
            : (
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-4 h-4" />
                Tüm Aşamalar Tamamlandı
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

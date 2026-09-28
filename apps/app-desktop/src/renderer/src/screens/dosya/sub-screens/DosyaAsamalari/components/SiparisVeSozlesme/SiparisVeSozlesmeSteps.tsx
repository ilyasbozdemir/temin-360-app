import React, { useState } from 'react'
import {
  Clock,
  FileCheck,
  FileSignature,
  FileCheck2,
  ChevronRight,
  ChevronLeft,
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { cn } from '@renderer/utils/cn'
import { FirmaStats, IslemlerData } from './types'
import { Step1TeslimatVeSurec } from './Step1TeslimatVeSurec'
import { Step2SonucOnay } from './Step2SonucOnay'
import { Step5SozlesmeVeDavet } from './Step5SozlesmeVeDavet'
import { Step4KabulVeSiparis } from './Step4KabulVeSiparis'

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

  // Tanımlı adımlar listesi
  const steps = [
    {
      stepNum: 1 as const,
      label: "Teslimat & Şartlar",
      sub: `${islemlerData.teslimGunu || 7} Günlük Teslim Süresi`,
      icon: Clock,
      badge: "Adım 1",
      ready: true
    },
    {
      stepNum: 2 as const,
      label: "Karar & Sonuç Onayı",
      sub: `${sonucOnayEkler.length} Ek Belge Seçili`,
      icon: FileCheck,
      badge: "Adım 2",
      ready: true
    },
    {
      stepNum: 3 as const,
      label: hasSozlesme ? 'Sözleşme & Davet' : 'Sipariş & Tebligat',
      sub: hasSozlesme ? 'Sözleşmeye Davet ve Metinler' : 'Kabul Edilen Teklif Formu',
      icon: hasSozlesme ? FileSignature : FileCheck2,
      badge: 'Adım 3',
      ready: true
    }
  ]

  return (
    <div className="flex flex-col gap-4">
      {/* ═══ Kibar ve Modern Stepper / Sekme Çubuğu ═══ */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 rounded-2xl p-2 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {steps.map((step) => {
            const isActive = activeStep === step.stepNum
            const isCompleted = step.stepNum < activeStep
            const StepIcon = step.icon

            return (
              <button
                key={step.stepNum}
                type="button"
                onClick={() => setActiveStep(step.stepNum)}
                className={cn(
                  'relative flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer group select-none',
                  isActive
                    ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500/80 dark:border-blue-500/80 shadow-xs ring-1 ring-blue-500/20'
                    : isCompleted
                    ? 'bg-slate-50/60 dark:bg-slate-850/40 border-slate-200/80 dark:border-slate-800 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                    : 'bg-slate-50/30 dark:bg-slate-850/20 border-slate-200/50 dark:border-slate-800/50 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 opacity-75 hover:opacity-100'
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
                        : "bg-slate-200/80 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-700"
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <StepIcon className="w-4 h-4" />
                    )}
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
                          : "text-slate-600 dark:text-slate-400"
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
                  {isActive ? (
                    <span className="text-[9.5px] font-extrabold px-2 py-0.5 rounded-full bg-blue-600 text-white shadow-2xs animate-in fade-in">
                      Aktif
                    </span>
                  ) : isCompleted ? (
                    <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      Tamamlandı
                    </span>
                  ) : (
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

      {/* ═══ Sıralama / Bilgilendirme Uyarısı (İlgili Adım İçin Kibar Rehber) ═══ */}
      {activeStep === 3 && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="font-bold">Süreç Sıralaması Hatırlatması:</span>
            <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
              Yükleniciye {hasSozlesme ? "sözleşmeye davet mektubu" : "kabul/sipariş formu"} göndermeden önce, 
              <strong> Adım 2</strong>&apos;deki Doğrudan Temin Sonuç Onay Belgesinin Harcama Yetkilisince imzalanarak alımın kesinleştiğinden emin olunuz.
            </p>
          </div>
        </div>
      )}

      {activeStep === 2 && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/60 text-blue-900 dark:text-blue-200 text-xs animate-in fade-in duration-200">
          <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="font-bold">Doğrudan Temin Karar & Onay Aşaması:</span>
            <p className="text-[11px] text-blue-800 dark:text-blue-300 leading-relaxed">
              Bu adımda oluşturacağınız Sonuç Onay Belgesi ve seçilen dosya ekleri (EKLER), alımın yasal olarak sonuçlandırılması için Harcama Yetkilisinin onayına sunulur. Onay tamamlandığında Adım 3&apos;e geçebilirsiniz.
            </p>
          </div>
        </div>
      )}

      {/* ═══ Adım İçerik Kartı (Aktif Adımın Net Gösterimi) ═══ */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-all">
        {/* Adım 1: Teslimat ve Şartlar */}
        {activeStep === 1 && (
          <div className="animate-in fade-in duration-200">
            <Step1TeslimatVeSurec
              islemlerData={islemlerData}
              firmaStats={firmaStats}
              savedFeedback={savedFeedback}
              handleUpdateTeslimGunu={handleUpdateTeslimGunu}
              handleUpdateTeslimTarihi={handleUpdateTeslimTarihi}
              handleToggleSozlesme={handleToggleSozlesme}
            />
          </div>
        )}

        {/* Adım 2: Karar & Sonuç Onayı ve Ekler */}
        {activeStep === 2 && (
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

        {/* Adım 3: Sözleşme & Davet VEYA Sipariş Formu / Kabul */}
        {activeStep === 3 && (
          <div className="animate-in fade-in duration-200">
            {hasSozlesme ? (
              <Step5SozlesmeVeDavet
                sozlesmeYapilacakMi={firmaStats.sozlesmeYapilacakMi}
                onOpenDavetMektubu={handleOpenDavetMektubu}
                onOpenStandartSozlesme={handleOpenStandartSozlesme}
                onOpenAlternatifSozlesme={handleOpenAlternatifSozlesme}
                onOpenUzunFormSozlesme={handleOpenUzunFormSozlesme}
              />
            ) : (
              <Step4KabulVeSiparis
                teslimGunu={islemlerData.teslimGunu}
                onOpenKabulMektubu={handleOpenKabulMektubu}
              />
            )}
          </div>
        )}

        {/* ═══ Adım Geçiş Butonları ═══ */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
          {activeStep > 1 ? (
            <button
              type="button"
              onClick={() => setActiveStep((prev) => (prev - 1) as 1 | 2 | 3)}
              className="py-2 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4" />
              Önceki Adım
            </button>
          ) : (
            <div />
          )}

          {activeStep < 3 ? (
            <button
              type="button"
              onClick={() => setActiveStep((prev) => (prev + 1) as 1 | 2 | 3)}
              className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs hover:shadow active:scale-95 transition-all"
            >
              Sonraki Adıma Geç
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
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

import React from "react";
import { ArrowRight } from "lucide-react";
import { FiyatIstenenFirmalarınSecilmesi } from "../FiyatIstenenFirmalarınSecilmesi";
import { DagitimBelgeleriKartlari } from "./DagitimBelgeleriKartlari";

interface Step1IsteklilerVeDagitimProps {
  formattedFirms: any[];
  firmaColumns: any[];
  manualWinnerFirmaId?: number | null;
  handleSetWinnerFirma?: (firmaMasterId: number | null) => Promise<void>;
  handleCreateNewFirm?: (firmaData: {
    unvan: string;
    vergi_no?: string;
    telefon?: string;
    email?: string;
    sehir?: string;
  }) => Promise<void>;
  setCurrentStep: (step: 1 | 2 | 3) => void;
  setIsFormOpen: (val: boolean) => void;
  setActiveFormTab: (tab: "firms" | "matrix") => void;
  handleOpenSablonByDosyaAdi: (targetKey: string, firmData?: any) => void;
  handleOpenEkapSorgu: (firma?: any) => void;
  handleAddSingleFirm?: (firma: any) => void;
  handleRemoveFirm?: (id: number) => void;
}

export function Step1IsteklilerVeDagitim({
  formattedFirms,
  firmaColumns,
  manualWinnerFirmaId,
  handleSetWinnerFirma,
  handleCreateNewFirm,
  setCurrentStep,
  setIsFormOpen,
  setActiveFormTab,
  handleOpenSablonByDosyaAdi,
  handleOpenEkapSorgu,
  handleAddSingleFirm,
  handleRemoveFirm,
}: Step1IsteklilerVeDagitimProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200">
      {/* 1.1 İstekli Firmalar Tablosu */}
      <FiyatIstenenFirmalarınSecilmesi
        title="Fiyat İstenen İstekli Firmaların Belirlenmesi"
        firms={formattedFirms}
        columns={firmaColumns}
        winnerFirmaId={manualWinnerFirmaId}
        onSetWinnerFirma={(f) => {
          if (handleSetWinnerFirma) {
            const targetId = (f.firma_id as number) || f.id;
            handleSetWinnerFirma(
              manualWinnerFirmaId === targetId ? null : targetId,
            );
          }
        }}
        onCreateNewFirm={handleCreateNewFirm}
        onFiyatGir={() => {
          setCurrentStep(2);
          setIsFormOpen(true);
          setActiveFormTab("matrix");
        }}
        onFiyatPiyasaFormu={(firma) => {
          handleOpenSablonByDosyaAdi("arastirma-mektubu", firma);
        }}
        onIdareFiyatArastirmaMektubu={(firma) => {
          handleOpenSablonByDosyaAdi("fiyat-arastirma-mektubu", firma);
        }}
        onBirimFiyatArastirmasi={(firma) => {
          handleOpenSablonByDosyaAdi("birim-fiyat-teklif-mektubu", firma);
        }}
        onBosTeklifCetveli={(firma) => {
          handleOpenSablonByDosyaAdi("birim-fiyat-teklif-mektubu", firma);
        }}
        onEkapSorgula={(firma) => {
          handleOpenEkapSorgu(firma);
        }}
        onFirmaEkle={async (firma) => {
          if (handleAddSingleFirm) {
            handleAddSingleFirm(firma);
          }
        }}
        onFirmaCikar={(firma) => {
          if (handleRemoveFirm) {
            const targetId = (firma.temin_firma_id as number) || firma.id;
            handleRemoveFirm(targetId);
          }
        }}
      />

      {/* 1.2 Dağıtım Belgeleri Kartları */}
      <DagitimBelgeleriKartlari
        handleOpenSablonByDosyaAdi={handleOpenSablonByDosyaAdi}
        handleOpenEkapSorgu={handleOpenEkapSorgu}
      />

      {/* 1. Adım Alt İlerleme Çubuğu */}
      <div className="flex items-center justify-between p-3.5 px-5 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
          <span>
            Firmaları ekleyip mektupları dağıttıktan sonra toplanan fiyatları
            girmek için sonraki adıma geçin.
          </span>
        </div>
        <button
          type="button"
          onClick={() => setCurrentStep(2)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs hover:shadow-md cursor-pointer border-0 active:scale-95 shrink-0"
        >
          <span>2. Adım: Fiyatları Girmeye Geç</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

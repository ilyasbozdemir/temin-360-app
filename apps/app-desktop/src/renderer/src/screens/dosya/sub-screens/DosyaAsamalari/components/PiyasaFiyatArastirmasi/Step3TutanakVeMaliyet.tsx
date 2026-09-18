import React from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { BelgeItem, BelgeListesi } from "../BelgeListesi";
import { SonucBelgesiKartlari } from "./SonucBelgesiKartlari";

interface Step3TutanakVeMaliyetProps {
  mappedBelgeler: BelgeItem[];
  docViewMode: "grid" | "list" | "table";
  changeDocViewMode: (mode: "grid" | "list" | "table") => void;
  handleOpenSablonByDosyaAdi: (targetKey: string) => void;
  handleNewDocument: (mode: "maliyet" | "tutanak") => void;
  handleOpenBelgePreview: (belge: BelgeItem) => void;
  handleOpenExternalForBelge: (belge: BelgeItem) => void;
  handleQuickPrintForBelge: (belge: BelgeItem) => void;
  handleDeleteDocument?: (id: number) => void;
  setCurrentStep: (step: 1 | 2 | 3) => void;
  setIsFormOpen: (val: boolean) => void;
  setActiveFormTab: (tab: "firms" | "matrix") => void;
}

export function Step3TutanakVeMaliyet({
  mappedBelgeler,
  docViewMode,
  changeDocViewMode,
  handleOpenSablonByDosyaAdi,
  handleNewDocument,
  handleOpenBelgePreview,
  handleOpenExternalForBelge,
  handleQuickPrintForBelge,
  handleDeleteDocument,
  setCurrentStep,
  setIsFormOpen,
  setActiveFormTab,
}: Step3TutanakVeMaliyetProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200">
      {/* Hızlı Sonuç Belgesi Üretim Kartları */}
      <SonucBelgesiKartlari
        handleOpenSablonByDosyaAdi={handleOpenSablonByDosyaAdi}
        handleNewDocument={handleNewDocument}
      />

      {/* Hazırlanan Tutanaklar Listesi */}
      <BelgeListesi
        title="Dosyaya Kaydedilen Tutanak ve Cetveller"
        belgeler={mappedBelgeler}
        viewMode={docViewMode}
        onViewModeChange={changeDocViewMode}
        onView={handleOpenBelgePreview}
        onOpenExternal={handleOpenExternalForBelge}
        onPrint={handleQuickPrintForBelge}
        onEdit={(belge) => {
          const isMaliyet = belge.belgeTipiId === "yaklasik-maliyet" ||
            belge.belgeAdi?.toLowerCase().includes("maliyet");
          handleNewDocument(isMaliyet ? "maliyet" : "tutanak");
        }}
        onDelete={(belge) => {
          if (handleDeleteDocument) {
            handleDeleteDocument(belge.id);
          }
        }}
        createButtonLabel="Yeni Tutanak / Cetvel Kaydet"
        onCreateBelge={(type) => {
          const mode = type === "yaklasik-maliyet" ? "maliyet" : "tutanak";
          handleNewDocument(mode);
        }}
        onFiyatGir={() => {
          setCurrentStep(2);
          setIsFormOpen(true);
          setActiveFormTab("matrix");
        }}
      />

      {/* Adım 3 Alt Geri Dönüş Çubuğu */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <button
          type="button"
          onClick={() => setCurrentStep(2)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer border-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>2. Adıma Dön (Fiyatlar & Kazanan)</span>
        </button>
        <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4" />
          <span>Piyasa Fiyat Araştırma Süreci Tamamlandı</span>
        </div>
      </div>
    </div>
  );
}

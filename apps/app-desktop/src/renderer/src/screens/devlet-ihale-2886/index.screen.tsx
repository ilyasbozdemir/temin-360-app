import React, { useState } from "react";
import {
  Calculator,
  CheckCircle2,
  CreditCard,
  FileText,
  Gavel,
  Landmark,
  Layers,
} from "lucide-react";
import { IslemTuru2886 } from "./types/devletIhale2886.types";
import { IslemTuruSecici } from "./components/IslemTuruSecici";
import { MuhammenBedelVeTakdirTab } from "./components/MuhammenBedelVeTakdirTab";
import { UsulVeKararMatrisiTab } from "./components/UsulVeKararMatrisiTab";
import { SurecEvraklariTab } from "./components/SurecEvraklariTab";
import { IhaleGunuVeTekliflerTab } from "./components/IhaleGunuVeTekliflerTab";
import { KiraVeTahsilatTakipTab } from "./components/KiraVeTahsilatTakipTab";

export default function DevletIhale2886Screen(): React.JSX.Element {
  const [islemTuru, setIslemTuru] = useState<IslemTuru2886>("satis");
  const [activeTab, setActiveTab] = useState<
    "takdir" | "usul" | "evraklar" | "ihale_gunu" | "tahsilat"
  >("takdir");

  const tabs: {
    id: typeof activeTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[] = [
    {
      id: "takdir",
      label: "1. Taşınmaz & Muhammen Bedel",
      icon: Calculator,
      badge: "Takdir Komisyonu",
    },
    {
      id: "usul",
      label: "2. İhale Usulü & Karar Matrisi",
      icon: Gavel,
      badge: "Md. 45 / 36",
    },
    {
      id: "evraklar",
      label: "3. Süreç Evrakları & İlanlar",
      icon: FileText,
      badge: "16 Evrak",
    },
    {
      id: "ihale_gunu",
      label: "4. İhale Günü & Teklifler",
      icon: Layers,
      badge: "Pey Sürme",
    },
    {
      id: "tahsilat",
      label: islemTuru === "kiralama"
        ? "5. Kira & Artış Takibi"
        : "5. Tahsilat & Taksit Planı",
      icon: CreditCard,
      badge: "5018 Gelir",
    },
  ];

  return (
    <div className="w-full min-h-full bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-y-auto custom-scrollbar p-4 md:p-6 space-y-5">
      {/* 1. Header Banner */}
      <div className="shrink-0 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-2xl p-5 md:p-6 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold">
              <Landmark className="w-3.5 h-3.5" />
              <span>2886 Sayılı Devlet İhale Kanunu Modülü</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-2.5">
              <span>Taşınmaz Satış, Kiralama ve Gelir Yönetimi</span>
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              4734&apos;ten (Gider/Alım) tamamen bağımsız; Muhammen Bedel tespiti, en
              yüksek teklif, açık artırma ve kira/tahsilat takibi için özel
              tasarlanmış gelir yönetim çalışma masası.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto shrink-0 font-mono">
            <div className="px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-right">
              <span className="text-[10px] text-slate-300 uppercase block font-sans">
                Dosya Durumu
              </span>
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                İhale Aşamasında (2026/01)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. İşlem Türü Seçici (Satış, Kiralama, İrtifak, Trampa) */}
      <div className="shrink-0">
        <IslemTuruSecici selected={islemTuru} onSelect={setIslemTuru} />
      </div>

      {/* 3. Sekmeler Barı */}
      <div className="shrink-0 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto custom-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer select-none shadow-2xs ${
                isActive
                  ? "bg-indigo-600 text-white shadow-xs scale-[1.02]"
                  : "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                    isActive
                      ? "bg-indigo-700 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 4. Aktif Sekme İçeriği */}
      <div className="w-full pb-8 space-y-4">
        {activeTab === "takdir" && <MuhammenBedelVeTakdirTab />}
        {activeTab === "usul" && <UsulVeKararMatrisiTab />}
        {activeTab === "evraklar" && <SurecEvraklariTab />}
        {activeTab === "ihale_gunu" && <IhaleGunuVeTekliflerTab />}
        {activeTab === "tahsilat" && (
          <KiraVeTahsilatTakipTab islemTuru={islemTuru} />
        )}
      </div>
    </div>
  );
}

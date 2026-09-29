import React, { useState } from "react";
import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle2,
  CreditCard,
  Edit2,
  FileCheck,
  FileText,
  Grid2X2,
  List,
  MapPin,
  PackageCheck,
  Plus,
  ShieldCheck,
  Table2,
  Trash2,
  UserCheck,
  Users,
} from "lucide-react";
import { Button } from "../../../../../../components/ui/Button";
import { FirmaStats, KabulTutanakItem, KomisyonUye } from "./types";

interface KabulTutanaklariListCardV2Props {
  kazananFirmaUnvan: string;
  firmaStats: FirmaStats;
  faturaNo: string;
  faturaTarihi: string;
  komisyonBaskani: string;
  komisyonUyeleri?: KomisyonUye[];
  teslimYeri: string;
  dosyaNo?: string;
  alimTuru: string;
  tutanaklar?: KabulTutanakItem[];
  onOpenAddTutanak: () => void;
  onEditTutanak: (tutanak: KabulTutanakItem) => void;
  onDeleteTutanak: (id: string) => void;
  onOpenPreview: (sablonKey: string) => void;
  onOpenTifModal: () => void;
  onOpenKomisyonModal: () => void;
  formatDate: (dateStr: string | null) => string;
  formatCurrency: (val: number | null) => string;
}

export function KabulTutanaklariListCardV2({
  kazananFirmaUnvan,
  firmaStats,
  faturaNo,
  faturaTarihi,
  komisyonBaskani,
  komisyonUyeleri = [],
  teslimYeri,
  dosyaNo,
  alimTuru,
  tutanaklar = [],
  onOpenAddTutanak,
  onEditTutanak,
  onDeleteTutanak,
  onOpenPreview,
  onOpenTifModal,
  onOpenKomisyonModal,
  formatDate,
  formatCurrency,
}: KabulTutanaklariListCardV2Props): React.JSX.Element {
  const [viewMode, setViewMode] = useState<"table" | "list" | "grid">("table");

  const isMal = alimTuru === "mal";
  const isHizmet = alimTuru === "hizmet";

  const effectiveKabulTarihi = faturaTarihi || firmaStats.teslimTarihi ||
    firmaStats.dosyaTarihi;
  const effectiveSiraNo = faturaNo || dosyaNo || "1";
  const effectiveTeslimAlan = komisyonBaskani || "Muayene & Kabul Komisyonu";
  const effectiveTeslimYeri = teslimYeri || "Kurum Ambarı / İhtiyaç Yeri";

  const primarySablonKey = isHizmet
    ? "hizmet-isleri-kabul-tutanagi"
    : "muayene-kabul-komisyonu";

  const hasKomisyon = komisyonUyeleri.length > 0;
  const kayitSayisi = tutanaklar.length > 0 ? tutanaklar.length : 1;

  const getDurumBadge = (durum: string) => {
    switch (durum) {
      case "kismi":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50">
            🔶 Kısmi Kabul
          </span>
        );
      case "sartli":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50">
            ⚠️ Şartlı Kabul
          </span>
        );
      case "red":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800/50">
            ❌ Reddedildi
          </span>
        );
      case "kabul":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
            <CheckCircle2 className="w-3 h-3" />
            <span>Kabul Edildi</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden flex flex-col">
      <div>
      </div>
    </div>
  );
}

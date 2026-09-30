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
  MoreHorizontal,
  PackageCheck,
  Plus,
  ShieldCheck,
  Table2,
  Trash2,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { Button } from "../../../../../../components/ui/Button";
import { FirmaStats, KabulTutanakItem, KomisyonUye } from "./types";

export type TutanakTipi = "mal" | "hizmet";

export interface MalKalemi {
  id: number;
  malzemeAdi: string;
  ozelligi: string;
  birimi: string;
  miktari: number;
  toplamTeslimAlinan: number;
  kabulMiktari: number;
}

export interface KabulTutanagi {
  id: number | string;
  tip: TutanakTipi;
  tarih: string;
  firma: string;
  sayi: string;
  teslimAlan: string;
  teslimYeri: string;
  faturaTarihi: string;
  faturaNo: string;
  hizmetAciklamasi?: string;
  kalemler?: MalKalemi[];
  ambaraAktarildi?: boolean;
}

export interface KabulTutanaklariListCardProps {
  /** Yüklenici Firma Unvanı */
  firma?: string;
  kazananFirmaUnvan?: string;
  /** Kabul edilen teklif tutarı */
  kabulEdilenTeklif?: number;
  firmaStats?: FirmaStats;
  faturaNo?: string;
  faturaTarihi?: string;
  komisyonBaskani?: string;
  komisyonUyeleri?: KomisyonUye[];
  teslimYeri?: string;
  dosyaNo?: string;
  alimTuru?: string;
  tutanaklar?: KabulTutanakItem[];
  baslangicTutanaklari?: KabulTutanagi[];
  varsayilanTeslimAlan?: string;
  varsayilanTeslimYeri?: string;
  onOpenAddTutanak?: () => void;
  onEditTutanak?: (tutanak: KabulTutanakItem) => void;
  onDeleteTutanak?: (id: string) => void;
  onOpenPreview?: (sablonKey: string) => void;
  onOpenTifModal?: () => void;
  onOpenKomisyonModal?: () => void;
  onSaveTutanak?: (tutanak: KabulTutanakItem) => void;
  formatDate?: (dateStr: string | null) => string;
  formatCurrency?: (val: number | null) => string;
}

const bosKalem = (id: number): MalKalemi => ({
  id,
  malzemeAdi: "",
  ozelligi: "",
  birimi: "Adet",
  miktari: 0,
  toplamTeslimAlinan: 0,
  kabulMiktari: 0,
});

const defaultFormatCurrency = (n: number | null | undefined): string => {
  if (n == null) return "0,00 ₺";
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(n);
};

const defaultFormatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toLocaleDateString("tr-TR");
  } catch {
    return dateStr;
  }
};

const inputCls =
  "w-full rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/40 transition-all";
const labelCls =
  "block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5";

export function KabulTutanaklariListCard({
  firma,
  kazananFirmaUnvan,
  kabulEdilenTeklif,
  firmaStats,
  faturaNo = "",
  faturaTarihi = "",
  komisyonBaskani = "",
  komisyonUyeleri = [],
  teslimYeri = "",
  dosyaNo,
  alimTuru = "mal",
  tutanaklar = [],
  baslangicTutanaklari = [],
  varsayilanTeslimAlan = "",
  varsayilanTeslimYeri = "",
  onOpenAddTutanak,
  onEditTutanak,
  onDeleteTutanak,
  onOpenPreview,
  onOpenTifModal,
  onOpenKomisyonModal,
  formatDate = defaultFormatDate,
  formatCurrency = defaultFormatCurrency,
}: KabulTutanaklariListCardProps): React.JSX.Element {
  const [viewMode, setViewMode] = useState<"table" | "list" | "grid">("table");
  const [menuAcik, setMenuAcik] = useState(false);
  const [digerIslemlerAcik, setDigerIslemlerAcik] = useState(false);
  const [activeRowMenuId, setActiveRowMenuId] = useState<string | number | null>(null);
  const [formTipi, setFormTipi] = useState<TutanakTipi | null>(null);
  const [hata, setHata] = useState("");

  const effectiveFirma = kazananFirmaUnvan || firma || "İstekli Yüklenici Firma";
  const effectiveTeklifTutar = kabulEdilenTeklif ?? firmaStats?.teklifToplami ?? 0;
  const effectiveTeslimAlan = komisyonBaskani || varsayilanTeslimAlan || "Muayene & Kabul Komisyonu";
  const effectiveTeslimYeri = teslimYeri || varsayilanTeslimYeri || "Kurum Ambarı / İhtiyaç Yeri";

  const rawAlimTuru = String(
    alimTuru || firmaStats?.alimTuru || "mal",
  ).toLowerCase();
  const isHizmet = rawAlimTuru.includes("hizmet") || rawAlimTuru.includes("danismanlik");
  const isMal = !isHizmet;

  const primarySablonKey = isHizmet
    ? "hizmet-isleri-kabul-tutanagi"
    : "muayene-kabul-komisyonu";

  const hasKomisyon = komisyonUyeleri.length > 0;
  const kayitSayisi = tutanaklar.length > 0 ? tutanaklar.length : (baslangicTutanaklari.length > 0 ? baslangicTutanaklari.length : 1);

  const [form, setForm] = useState({
    tarih: new Date().toISOString().slice(0, 10),
    sayi: faturaNo || dosyaNo || "KT-2026-001",
    teslimAlan: effectiveTeslimAlan,
    teslimYeri: effectiveTeslimYeri,
    faturaTarihi: faturaTarihi || new Date().toISOString().slice(0, 10),
    faturaNo: faturaNo || "",
    hizmetAciklamasi: "",
  });
  const [kalemler, setKalemler] = useState<MalKalemi[]>([bosKalem(1)]);

  const formuAc = (tip: TutanakTipi) => {
    setMenuAcik(false);
    setHata("");
    setForm({
      tarih: new Date().toISOString().slice(0, 10),
      sayi: `KT-${new Date().getFullYear()}-${String(tutanaklar.length + 1).padStart(3, "0")}`,
      teslimAlan: effectiveTeslimAlan,
      teslimYeri: tip === "mal" ? effectiveTeslimYeri : "Hizmet İfa Yeri",
      faturaTarihi: faturaTarihi || new Date().toISOString().slice(0, 10),
      faturaNo: faturaNo || "",
      hizmetAciklamasi: "",
    });
    setKalemler([bosKalem(1)]);
    setFormTipi(tip);
  };

  const kalemGuncelle = (id: number, alan: keyof MalKalemi, deger: string) => {
    setKalemler((ks) =>
      ks.map((k) =>
        k.id === id
          ? {
              ...k,
              [alan]: ["miktari", "toplamTeslimAlinan", "kabulMiktari"].includes(alan)
                ? Number(deger)
                : deger,
            }
          : k
      )
    );
  };

  const kaydetForm = () => {
    if (
      !form.tarih ||
      !form.sayi ||
      !form.teslimAlan.trim() ||
      !form.teslimYeri.trim()
    ) {
      setHata("Tarih, sayı, teslim alan ve teslim yeri alanları zorunludur.");
      return;
    }
    if (formTipi === "mal" && kalemler.some((k) => !k.malzemeAdi.trim())) {
      setHata("Lütfen tüm malzeme satırları için malzeme adını doldurun.");
      return;
    }
    if (formTipi === "hizmet" && !form.hizmetAciklamasi.trim()) {
      setHata("Hizmet işleri kabul tutanağı için hizmet açıklaması zorunludur.");
      return;
    }

    if (onOpenAddTutanak) {
      onOpenAddTutanak();
    }
    setFormTipi(null);
  };

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
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden flex flex-col transition-all">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800/60 shadow-xs">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                Muayene Kabul ve Tespit Komisyonu Tutanakları ({kayitSayisi})
              </h3>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  isHizmet
                    ? "bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/60"
                    : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60"
                }`}
              >
                {isHizmet ? "Hizmet Alımı" : "Mal Alımı"}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Yüklenici:{" "}
              <strong className="text-slate-700 dark:text-slate-200">
                {effectiveFirma}
              </strong>{" "}
              &bull; Kabul Edilen Teklif:{" "}
              <strong className="text-emerald-600 dark:text-emerald-400">
                {formatCurrency(effectiveTeklifTutar)}
              </strong>
            </p>
          </div>
        </div>

        {/* Top Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap self-start xl:self-center">
          {/* Görünüm Seçici (Tablo / Liste / Kart) */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
            {[
              { mode: "table" as const, icon: Table2, label: "Tablo" },
              { mode: "list" as const, icon: List, label: "Liste" },
              { mode: "grid" as const, icon: Grid2X2, label: "Kart" },
            ].map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                type="button"
                title={label}
                onClick={() => setViewMode(mode)}
                className={`rounded-md p-1.5 transition-colors cursor-pointer ${
                  viewMode === mode
                    ? "bg-blue-600 text-white"
                    : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>

          {/* Primary Action 1: Tutanak Ekle Dropdown */}
          <div className="relative">
            <Button
              onClick={() => setMenuAcik((v) => !v)}
              className="gap-1.5 text-xs font-bold h-9 px-3.5 bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
              title="Yeni Muayene Kabul ve Tespit Komisyonu Tutanağı Ekle"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Tutanak Ekle</span>
            </Button>

            {menuAcik && (
              <div className="absolute right-0 z-20 mt-2 w-64 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-150">
                <button
                  type="button"
                  onClick={() => formuAc("mal")}
                  className="w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 flex items-center justify-between cursor-pointer"
                >
                  <span>📦 Mal Muayene ve Kabul</span>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-full">
                    Ambar Girişli
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => formuAc("hizmet")}
                  className="w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 flex items-center justify-between cursor-pointer border-t border-slate-100 dark:border-slate-700/50"
                >
                  <span>🛠️ Hizmet Muayene ve Kabul</span>
                  <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded-full">
                    Hizmet İfa
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuAcik(false);
                    onOpenAddTutanak?.();
                  }}
                  className="w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/60 flex items-center gap-1.5 cursor-pointer border-t border-slate-100 dark:border-slate-700/50"
                >
                  <Plus className="w-3.5 h-3.5 text-slate-400" />
                  <span>Sistem Formu ile Özelleştir</span>
                </button>
              </div>
            )}
          </div>

          {/* Primary Action 2: Kabul Tutanağı Çıktı */}
          <Button
            onClick={() => onOpenPreview?.(primarySablonKey)}
            variant="outline"
            className="gap-1.5 text-xs font-semibold h-9 px-3 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40"
            title="Kabul Tutanağı Belgesini Önizle ve Yazdır"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>
              {isHizmet ? "Hizmet Tutanağı Çıktı" : "Kabul Tutanağı Çıktı"}
            </span>
          </Button>

          {/* Diğer İşlemler / Belgeler (...) Dropdown Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setDigerIslemlerAcik((v) => !v)}
              className="h-9 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              title="Diğer Belge ve İşlem Seçenekleri"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {digerIslemlerAcik && (
              <div className="absolute right-0 z-30 mt-2 w-56 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700/60">
                  Diğer Belgeler &amp; Çıktılar
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setDigerIslemlerAcik(false);
                    onOpenPreview?.("muayene-kabul-komisyonu");
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 flex items-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Komisyon Kararı Belgesi</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDigerIslemlerAcik(false);
                    onOpenPreview?.("odeme-yazisi");
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 flex items-center gap-2 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Mali Hizmetler Ödeme Yazısı</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDigerIslemlerAcik(false);
                    onOpenPreview?.("odeme-emri-belgesi");
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 flex items-center gap-2 cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5 text-blue-500" />
                  <span>Ödeme Emri Belgesi (MİF)</span>
                </button>

                {isMal && (
                  <>
                    <div className="border-t border-slate-100 dark:border-slate-700/60 my-1" />
                    <button
                      type="button"
                      onClick={() => {
                        setDigerIslemlerAcik(false);
                        onOpenTifModal?.();
                      }}
                      className="w-full px-3 py-2 text-left text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center gap-2 cursor-pointer"
                    >
                      <PackageCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Ambara Aktar (TİF)</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Komisyon Heyeti Bar */}
      <div className="px-5 py-3 bg-indigo-50/40 dark:bg-indigo-950/20 border-b border-indigo-100/80 dark:border-indigo-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 font-bold text-indigo-900 dark:text-indigo-200">
            <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>Muayene Kabul ve Tespit Komisyonu Heyeti:</span>
          </div>

          {hasKomisyon ? (
            <div className="flex items-center gap-1.5 flex-wrap">
              {komisyonUyeleri.map((uye, idx) => {
                const isBaskan =
                  uye.gorev?.toLowerCase().includes("başkan") ||
                  uye.gorev?.toLowerCase().includes("baskan");
                return (
                  <span
                    key={uye.id || idx}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${
                      isBaskan
                        ? "bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-800/60"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700"
                    }`}
                    title={
                      uye.unvan
                        ? `${uye.gorev || "Üye"} - ${uye.unvan}`
                        : uye.gorev || "Üye"
                    }
                  >
                    {isBaskan ? "👑" : "👤"}
                    <span className="font-bold">{uye.ad_soyad}</span>
                    <span className="text-[10px] text-slate-400">
                      ({isBaskan ? "Başkan" : uye.gorev || "Üye"})
                    </span>
                  </span>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>
                Komisyon henüz atanmadı. İmzalı belgeler için heyet tanımlayabilirsiniz.
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenKomisyonModal}
            className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 hover:underline cursor-pointer bg-transparent border-0 p-0"
          >
            {hasKomisyon ? "Heyeti Düzenle" : "+ Komisyon Ata"}
          </button>
        </div>
      </div>

      {/* TABLE VIEW */}
      {viewMode === "table" && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Tutanak No & Tarih</th>
                <th className="py-3 px-4">Yüklenici Firma</th>
                <th className="py-3 px-4">Fatura No & Tarih</th>
                <th className="py-3 px-4">Teslim Yeri & Heyet</th>
                <th className="py-3 px-4">Muayene Kararı</th>
                <th className="py-3 px-4 text-right">Tutar (₺)</th>
                <th className="py-3 px-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {tutanaklar.length > 0 ? (
                tutanaklar.map((tut) => (
                  <tr
                    key={tut.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                      <div className="font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400">
                        {tut.tutanakNo}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{formatDate(tut.tutanakTarihi)}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span className="truncate max-w-48" title={effectiveFirma}>
                          {effectiveFirma}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {tut.faturaNo || faturaNo ? (
                        <span className="font-mono font-semibold text-slate-700 dark:text-slate-200 text-[11px]">
                          {tut.faturaNo || faturaNo}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                      {tut.faturaTarihi && (
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {formatDate(tut.faturaTarihi)}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="truncate max-w-40 font-medium">
                          {tut.teslimYeri || effectiveTeslimYeri}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block ml-5 truncate max-w-40">
                        {tut.teslimAlan || effectiveTeslimAlan}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getDurumBadge(tut.durum)}
                      {tut.notlar && (
                        <span className="text-[10px] text-slate-400 block mt-0.5 truncate max-w-36">
                          {tut.notlar}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {tut.tutar
                        ? formatCurrency(tut.tutar)
                        : formatCurrency(effectiveTeklifTutar)}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5 relative">
                        <Button
                          onClick={() => onOpenPreview?.(primarySablonKey)}
                          variant="outline"
                          size="sm"
                          className="h-8 px-2.5 text-xs font-semibold gap-1 text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300"
                          title="Tutanağı Görüntüle ve Yazdır"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Tutanağı Aç</span>
                        </Button>

                        <button
                          type="button"
                          onClick={() =>
                            setActiveRowMenuId((cur) => (cur === tut.id ? null : tut.id))
                          }
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Tutanak İşlemleri"
                        >
                          <MoreHorizontal size={15} />
                        </button>

                        {activeRowMenuId === tut.id && (
                          <div className="absolute right-0 top-10 z-30 w-48 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl overflow-hidden py-1 text-left animate-in fade-in zoom-in-95 duration-150">
                            {onEditTutanak && (
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveRowMenuId(null);
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
                                setActiveRowMenuId(null);
                                onOpenPreview?.("odeme-yazisi");
                              }}
                              className="w-full px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
                            >
                              <FileText size={13} className="text-emerald-500" />
                              <span>Ödeme Yazısı Al</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setActiveRowMenuId(null);
                                onOpenPreview?.("odeme-emri-belgesi");
                              }}
                              className="w-full px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
                            >
                              <CreditCard size={13} className="text-blue-500" />
                              <span>Ödeme Emri (MİF) Al</span>
                            </button>

                            {isMal && onOpenTifModal && (
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveRowMenuId(null);
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
                                  setActiveRowMenuId(null);
                                  onDeleteTutanak(tut.id);
                                }}
                                className="w-full px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2 cursor-pointer border-t border-slate-100 dark:border-slate-700/60"
                              >
                                <Trash2 size={13} />
                                <span>Tutanağı Sil</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatDate(faturaTarihi || new Date().toISOString().slice(0, 10))}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span className="truncate max-w-48" title={effectiveFirma}>
                        {effectiveFirma}
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    {faturaNo ? (
                      <span className="font-mono font-semibold text-slate-700 dark:text-slate-200 text-[11px]">
                        {faturaNo}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">—</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="truncate max-w-40 font-semibold" title={effectiveTeslimAlan}>
                        {effectiveTeslimAlan}
                      </span>
                    </div>
                    {hasKomisyon && (
                      <span className="text-[10px] text-indigo-500 block ml-5">
                        {komisyonUyeleri.length} Kişilik Heyet
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">{getDurumBadge("kabul")}</td>

                  <td className="py-3.5 px-4 text-right font-bold text-slate-900 dark:text-white whitespace-nowrap">
                    {formatCurrency(effectiveTeklifTutar)}
                  </td>

                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        onClick={() => onOpenPreview?.(primarySablonKey)}
                        variant="outline"
                        size="sm"
                        className="h-8 px-2.5 text-xs font-semibold gap-1 text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Tutanağı Aç</span>
                      </Button>
                      <Button
                        onClick={onOpenAddTutanak}
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" /> Özelleştir
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === "list" && (
        <div className="p-4 space-y-2">
          {(tutanaklar.length > 0
            ? tutanaklar
            : [
                {
                  id: "default_1",
                  tutanakNo: "KT-2026-001",
                  tutanakTarihi: faturaTarihi || new Date().toISOString().slice(0, 10),
                  faturaNo: faturaNo || dosyaNo || "1",
                  durum: "kabul" as const,
                  tutar: effectiveTeklifTutar,
                  teslimYeri: effectiveTeslimYeri,
                  teslimAlan: effectiveTeslimAlan,
                },
              ]
          ).map((tut) => (
            <div
              key={tut.id}
              className="flex items-center justify-between gap-4 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-200 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/60 font-mono font-bold text-xs">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400">
                      {tut.tutanakNo}
                    </span>
                    {getDurumBadge(tut.durum)}
                  </div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate mt-0.5">
                    {effectiveFirma} &bull; {tut.teslimYeri || effectiveTeslimYeri}
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-3 mt-0.5">
                    <span>Tarih: {formatDate(tut.tutanakTarihi)}</span>
                    <span>Fatura: {tut.faturaNo || faturaNo || "—"}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {tut.tutar ? formatCurrency(tut.tutar) : formatCurrency(effectiveTeklifTutar)}
                  </div>
                  <div className="text-[10px] text-slate-400">Teslimat Tutarı</div>
                </div>
                <Button
                  onClick={() => onOpenPreview?.(primarySablonKey)}
                  variant="outline"
                  size="sm"
                  className="h-8 px-2.5 text-xs font-semibold gap-1 text-blue-600 border-blue-200"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Tutanağı Aç</span>
                </Button>
                {tut.id !== "default_1" && onEditTutanak && (
                  <button
                    onClick={() => onEditTutanak(tut)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <Edit2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* GRID VIEW */}
      {viewMode === "grid" && (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(tutanaklar.length > 0
            ? tutanaklar
            : [
                {
                  id: "default_1",
                  tutanakNo: "KT-2026-001",
                  tutanakTarihi: faturaTarihi || new Date().toISOString().slice(0, 10),
                  faturaNo: faturaNo || dosyaNo || "1",
                  durum: "kabul" as const,
                  tutar: effectiveTeklifTutar,
                  teslimYeri: effectiveTeslimYeri,
                  teslimAlan: effectiveTeslimAlan,
                },
              ]
          ).map((tut) => (
            <div
              key={tut.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs border border-blue-100 dark:border-blue-900/60">
                    <FileText className="w-4 h-4" />
                  </div>
                  {getDurumBadge(tut.durum)}
                </div>
                <div className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400">
                  {tut.tutanakNo}
                </div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate mt-1">
                  {effectiveFirma}
                </div>
                <div className="text-[11px] text-slate-500 mt-2 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>Tarih: {formatDate(tut.tutanakTarihi)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                    <span className="truncate">{tut.teslimYeri || effectiveTeslimYeri}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {tut.tutar ? formatCurrency(tut.tutar) : formatCurrency(effectiveTeklifTutar)}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    onClick={() => onOpenPreview?.(primarySablonKey)}
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs text-blue-600 border-blue-200"
                  >
                    Aç
                  </Button>
                  {tut.id !== "default_1" && onEditTutanak && (
                    <button
                      onClick={() => onEditTutanak(tut)}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      <Edit2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="p-3.5 px-5 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 gap-2">
        <div className="flex items-center gap-4">
          <span>
            Toplam Kabul Bedeli:{" "}
            <strong className="text-slate-700 dark:text-slate-200 font-bold">
              {formatCurrency(effectiveTeklifTutar)}
            </strong>
          </span>
          {firmaStats?.yaklasikMaliyet && (
            <span>
              Yaklaşık Maliyet:{" "}
              <strong className="text-slate-700 dark:text-slate-200 font-bold">
                {formatCurrency(firmaStats.yaklasikMaliyet)}
              </strong>
            </span>
          )}
        </div>
        <span className="text-[10px] text-slate-400">
          * Muayene kabul tutanağı onaylandıktan sonra ödeme emri ve taşınır fişi düzenlenebilir.
        </span>
      </div>

      {/* Ekleme ekranı modal */}
      {formTipi && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="my-8 w-full max-w-4xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40">
              <div>
                <h4 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                  {formTipi === "mal"
                    ? "Mal Muayene Kabul ve Tespit Komisyonu Tutanağı"
                    : "Hizmet Muayene Kabul ve Tespit Komisyonu Tutanağı"}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Yüklenici:{" "}
                  <strong className="text-slate-700 dark:text-slate-200">
                    {effectiveFirma}
                  </strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFormTipi(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {hata && (
                <div className="rounded-xl bg-rose-50 p-3.5 text-xs font-bold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                  ⚠️ {hata}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className={labelCls}>Tutanak Tarihi</label>
                  <input
                    type="date"
                    className={inputCls}
                    value={form.tarih}
                    onChange={(e) => setForm({ ...form, tarih: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelCls}>Tutanak Sayısı / Evrak No</label>
                  <input
                    className={inputCls}
                    value={form.sayi}
                    onChange={(e) => setForm({ ...form, sayi: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelCls}>Teslim Alan (Heyet Başkanı)</label>
                  <input
                    className={inputCls}
                    value={form.teslimAlan}
                    onChange={(e) => setForm({ ...form, teslimAlan: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelCls}>Teslim Yeri</label>
                  <input
                    className={inputCls}
                    value={form.teslimYeri}
                    placeholder={
                      formTipi === "mal" ? "Ambar / Depo" : "Hizmet İfa Yeri"
                    }
                    onChange={(e) => setForm({ ...form, teslimYeri: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelCls}>Fatura Tarihi</label>
                  <input
                    type="date"
                    className={inputCls}
                    value={form.faturaTarihi}
                    onChange={(e) => setForm({ ...form, faturaTarihi: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelCls}>Fatura No</label>
                  <input
                    className={inputCls}
                    value={form.faturaNo}
                    onChange={(e) => setForm({ ...form, faturaNo: e.target.value })}
                  />
                </div>
              </div>

              {formTipi === "hizmet" && (
                <div>
                  <label className={labelCls}>Hizmet Açıklaması ve Muayene Notları</label>
                  <textarea
                    rows={3}
                    className={inputCls}
                    value={form.hizmetAciklamasi}
                    onChange={(e) =>
                      setForm({ ...form, hizmetAciklamasi: e.target.value })
                    }
                    placeholder="İfa edilen hizmetin mevzuata ve sözleşme şartlarına uygunluğuna ilişkin muayene notları..."
                  />
                </div>
              )}

              {formTipi === "mal" && (
                <div>
                  <label className={labelCls}>Teslim Alınan Malzeme Kalemleri</label>
                  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">
                        <tr>
                          {[
                            "Sıra",
                            "Malzeme Adı",
                            "Özelliği",
                            "Birimi",
                            "Miktarı",
                            "Teslim Alınan",
                            "Kabul Miktarı",
                            "",
                          ].map((h) => (
                            <th key={h} className="px-3 py-2.5 font-bold whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {kalemler.map((k, i) => (
                          <tr key={k.id}>
                            <td className="px-3 py-2 text-slate-400 font-bold text-center">{i + 1}</td>
                            <td className="px-3 py-2 min-w-40">
                              <input
                                className={inputCls}
                                value={k.malzemeAdi}
                                onChange={(e) =>
                                  kalemGuncelle(k.id, "malzemeAdi", e.target.value)
                                }
                                placeholder="Örn: A4 Fotokopi Kağıdı"
                              />
                            </td>
                            <td className="px-3 py-2 min-w-40">
                              <input
                                className={inputCls}
                                value={k.ozelligi}
                                onChange={(e) =>
                                  kalemGuncelle(k.id, "ozelligi", e.target.value)
                                }
                                placeholder="Örn: 80 gr/m² 500'lü"
                              />
                            </td>
                            <td className="px-3 py-2 w-24">
                              <input
                                className={inputCls}
                                value={k.birimi}
                                onChange={(e) =>
                                  kalemGuncelle(k.id, "birimi", e.target.value)
                                }
                              />
                            </td>
                            <td className="px-3 py-2 w-24">
                              <input
                                type="number"
                                min={0}
                                className={inputCls}
                                value={k.miktari}
                                onChange={(e) =>
                                  kalemGuncelle(k.id, "miktari", e.target.value)
                                }
                              />
                            </td>
                            <td className="px-3 py-2 w-28">
                              <input
                                type="number"
                                min={0}
                                className={inputCls}
                                value={k.toplamTeslimAlinan}
                                onChange={(e) =>
                                  kalemGuncelle(k.id, "toplamTeslimAlinan", e.target.value)
                                }
                              />
                            </td>
                            <td className="px-3 py-2 w-28">
                              <input
                                type="number"
                                min={0}
                                className={inputCls}
                                value={k.kabulMiktari}
                                onChange={(e) =>
                                  kalemGuncelle(k.id, "kabulMiktari", e.target.value)
                                }
                              />
                            </td>
                            <td className="px-3 py-2">
                              {kalemler.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setKalemler((ks) => ks.filter((x) => x.id !== k.id))
                                  }
                                  className="text-xs text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                                >
                                  Kaldır
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setKalemler((ks) => [
                        ...ks,
                        bosKalem(Math.max(...ks.map((x) => x.id)) + 1),
                      ])
                    }
                    className="mt-3 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Malzeme Satırı Ekle</span>
                  </button>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-slate-50/70 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setFormTipi(null)}
                className="px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700/60 rounded-xl transition-colors cursor-pointer"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={kaydetForm}
                className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Kaydet ve Tutanağa İşle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

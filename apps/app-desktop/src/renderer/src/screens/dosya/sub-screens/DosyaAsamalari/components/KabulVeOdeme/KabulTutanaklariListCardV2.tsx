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
      {/* Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800/60">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                Bu Doğrudan Temin Sürecine Ait Kabul Tutanakları ({kayitSayisi})
              </h3>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isHizmet
                    ? "bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/60"
                    : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60"
                }`}
              >
                {isHizmet ? "Hizmet Alımı" : "Mal Alımı"}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Yüklenici teslimatı, muayene heyeti incelemesi ve resmi kabul
              evrakları
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

          {/* Komisyon Kararı Belgesi */}
          <Button
            onClick={() => onOpenPreview("muayene-kabul-komisyonu")}
            variant="outline"
            className="gap-1.5 text-xs font-semibold h-9 px-3 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
            title="Muayene ve Kabul Komisyon Kararı Belgesini Aç"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Komisyon Kararı
          </Button>

          {isMal && (
            <Button
              onClick={onOpenTifModal}
              className="gap-1.5 text-xs font-semibold h-9 px-3 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
              title="Ambara Giriş ve Taşınır İşlem Fişi Oluştur"
            >
              <PackageCheck className="w-3.5 h-3.5" />
              Ambara Aktar (TİF)
            </Button>
          )}

          <Button
            onClick={() => onOpenPreview("odeme-yazisi")}
            variant="outline"
            className="gap-1.5 text-xs font-semibold h-9 px-3 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
            title="Mali Hizmetler Ödeme Üst Yazısı"
          >
            <FileText className="w-3.5 h-3.5" />
            Ödeme Yazısı
          </Button>

          <Button
            onClick={() => onOpenPreview("odeme-emri-belgesi")}
            variant="outline"
            className="gap-1.5 text-xs font-semibold h-9 px-3 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40"
            title="Ödeme Emri Belgesi (MİF)"
          >
            <CreditCard className="w-3.5 h-3.5" />
            Ödeme Emri (MİF)
          </Button>

          {/* Primary Button: Belgeyi Doğrudan Açan Kabul Tutanağı Çıktı Butonu */}
          <Button
            onClick={() => onOpenPreview(primarySablonKey)}
            className="gap-1.5 text-xs font-bold h-9 px-3.5 bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
            title="Kabul Tutanağı Belgesini Önizle ve Yazdır"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>
              {isHizmet ? "Hizmet Tutanağı Çıktı" : "Kabul Tutanağı Çıktı"}
            </span>
          </Button>

          {/* İsteğe Bağlı Özel Form Ekleme / Özelleştir Butonu */}
          <Button
            onClick={onOpenAddTutanak}
            variant="ghost"
            className="gap-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 h-9 px-2"
            title="Özel Kabul Tutanağı Kaydı / Kısmi Teslimat Düzenle"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Özelleştir</span>
          </Button>
        </div>
      </div>

      {/* Komisyon Heyeti Bar */}
      <div className="px-5 py-3 bg-indigo-50/40 dark:bg-indigo-950/20 border-b border-indigo-100/80 dark:border-indigo-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 font-bold text-indigo-900 dark:text-indigo-200">
            <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>Muayene &amp; Kabul Heyeti:</span>
          </div>

          {hasKomisyon
            ? (
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
                      title={uye.unvan
                        ? `${uye.gorev || "Üye"} - ${uye.unvan}`
                        : uye.gorev || "Üye"}
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
            )
            : (
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>
                  Komisyon henüz atanmadı. İmzalı belgeler için heyet
                  tanımlayabilirsiniz.
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
              {tutanaklar.length > 0
                ? (
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
                          <span
                            className="truncate max-w-48"
                            title={kazananFirmaUnvan}
                          >
                            {kazananFirmaUnvan || "İstekli Firma"}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {(tut.faturaNo || faturaNo)
                          ? (
                            <span className="font-mono font-semibold text-slate-700 dark:text-slate-200 text-[11px]">
                              {tut.faturaNo || faturaNo}
                            </span>
                          )
                          : (
                            <span className="text-slate-400 text-[11px]">
                              —
                            </span>
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
                          ? `${formatCurrency(tut.tutar)}`
                          : formatCurrency(firmaStats.teklifToplami)}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            onClick={() => onOpenPreview(primarySablonKey)}
                            variant="outline"
                            size="sm"
                            className="h-8 px-2.5 text-xs font-semibold gap-1 text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300"
                            title="Tutanağı Görüntüle ve Yazdır"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Tutanağı Aç</span>
                          </Button>
                          <button
                            onClick={() => onEditTutanak(tut)}
                            title="Tutanağı Düzenle"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => onDeleteTutanak(tut.id)}
                            title="Tutanağı Sil"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )
                : (
                  <tr className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatDate(effectiveKabulTarihi || null)}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span
                          className="truncate max-w-48"
                          title={kazananFirmaUnvan}
                        >
                          {kazananFirmaUnvan || "İstekli Firma"}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {faturaNo
                        ? (
                          <span className="font-mono font-semibold text-slate-700 dark:text-slate-200 text-[11px]">
                            {faturaNo}
                          </span>
                        )
                        : <span className="text-slate-400 text-[11px]">—</span>}
                    </td>

                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span
                          className="truncate max-w-40 font-semibold"
                          title={effectiveTeslimAlan}
                        >
                          {effectiveTeslimAlan}
                        </span>
                      </div>
                      {hasKomisyon && (
                        <span className="text-[10px] text-indigo-500 block ml-5">
                          {komisyonUyeleri.length} Kişilik Heyet
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getDurumBadge("kabul")}
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {formatCurrency(firmaStats.teklifToplami)}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          onClick={() => onOpenPreview(primarySablonKey)}
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
          {(tutanaklar.length > 0 ? tutanaklar : [
            {
              id: "default_1",
              tutanakNo: "KT-2026-001",
              tutanakTarihi: effectiveKabulTarihi || "",
              faturaNo: effectiveSiraNo,
              durum: "kabul" as const,
              tutar: firmaStats.teklifToplami,
              teslimYeri: effectiveTeslimYeri,
              teslimAlan: effectiveTeslimAlan,
            },
          ]).map((tut) => (
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
                    {kazananFirmaUnvan || "İstekli Firma"} &bull;{" "}
                    {tut.teslimYeri || effectiveTeslimYeri}
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
                    {tut.tutar
                      ? formatCurrency(tut.tutar)
                      : formatCurrency(firmaStats.teklifToplami)}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Teslimat Tutarı
                  </div>
                </div>
                <Button
                  onClick={() => onOpenPreview(primarySablonKey)}
                  variant="outline"
                  size="sm"
                  className="h-8 px-2.5 text-xs font-semibold gap-1 text-blue-600 border-blue-200"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Tutanağı Aç</span>
                </Button>
                {tut.id !== "default_1" && (
                  <button
                    onClick={() => onEditTutanak(tut as KabulTutanakItem)}
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
          {(tutanaklar.length > 0 ? tutanaklar : [
            {
              id: "default_1",
              tutanakNo: "KT-2026-001",
              tutanakTarihi: effectiveKabulTarihi || "",
              faturaNo: effectiveSiraNo,
              durum: "kabul" as const,
              tutar: firmaStats.teklifToplami,
              teslimYeri: effectiveTeslimYeri,
              teslimAlan: effectiveTeslimAlan,
            },
          ]).map((tut) => (
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
                  {kazananFirmaUnvan || "İstekli Firma"}
                </div>
                <div className="text-[11px] text-slate-500 mt-2 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>Tarih: {formatDate(tut.tutanakTarihi)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                    <span className="truncate">
                      {tut.teslimYeri || effectiveTeslimYeri}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {tut.tutar
                    ? formatCurrency(tut.tutar)
                    : formatCurrency(firmaStats.teklifToplami)}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    onClick={() => onOpenPreview(primarySablonKey)}
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs text-blue-600 border-blue-200"
                  >
                    Aç
                  </Button>
                  {tut.id !== "default_1" && (
                    <button
                      onClick={() => onEditTutanak(tut as KabulTutanakItem)}
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
              {formatCurrency(firmaStats.teklifToplami)}
            </strong>
          </span>
          {firmaStats.yaklasikMaliyet && (
            <span>
              Yaklaşık Maliyet:{" "}
              <strong className="text-slate-700 dark:text-slate-200 font-bold">
                {formatCurrency(firmaStats.yaklasikMaliyet)}
              </strong>
            </span>
          )}
        </div>
        <span className="text-[10px] text-slate-400">
          * Kabul tutanağı onaylandıktan sonra ödeme emri ve hakediş
          düzenlenebilir.
        </span>
      </div>
    </div>
  );
}

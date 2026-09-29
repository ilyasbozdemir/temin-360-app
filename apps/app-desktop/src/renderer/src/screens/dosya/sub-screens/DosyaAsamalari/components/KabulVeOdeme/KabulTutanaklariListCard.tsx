import React from "react";
import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle2,
  CreditCard,
  FileCheck,
  FileText,
  MapPin,
  PackageCheck,
  Printer,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";
import { Button } from "../../../../../../components/ui/Button";
import { FirmaStats, KomisyonUye } from "./types";

interface KabulTutanaklariListCardProps {
  kazananFirmaUnvan: string;
  firmaStats: FirmaStats;
  faturaNo: string;
  faturaTarihi: string;
  komisyonBaskani: string;
  komisyonUyeleri?: KomisyonUye[];
  teslimYeri: string;
  dosyaNo?: string;
  alimTuru: string;
  onOpenPreview: (sablonKey: string) => void;
  onOpenTifModal: () => void;
  onOpenKomisyonModal: () => void;
  formatDate: (dateStr: string | null) => string;
  formatCurrency: (val: number | null) => string;
}

export function KabulTutanaklariListCard({
  kazananFirmaUnvan,
  firmaStats,
  faturaNo,
  faturaTarihi,
  komisyonBaskani,
  komisyonUyeleri = [],
  teslimYeri,
  dosyaNo,
  alimTuru,
  onOpenPreview,
  onOpenTifModal,
  onOpenKomisyonModal,
  formatDate,
  formatCurrency,
}: KabulTutanaklariListCardProps): React.JSX.Element {
  const isMal = alimTuru === "mal";
  const isHizmet = alimTuru === "hizmet";

  const effectiveKabulTarihi = faturaTarihi || firmaStats.teslimTarihi ||
    firmaStats.dosyaTarihi;
  const effectiveSiraNo = faturaNo || dosyaNo || "1";
  const effectiveTeslimAlan = komisyonBaskani || "Muayene & Kabul Komisyonu";
  const effectiveTeslimYeri = teslimYeri || "Kurum Ambarı / İhtiyaç Yeri";

  const primarySablonKey = isHizmet
    ? "hizmet-isleri-kabul-tutanagi"
    : "muayene-kabul-tutanagi";

  const hasKomisyon = komisyonUyeleri.length > 0;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800/60">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                Bu Doğrudan Temin Sürecine Ait Kabul Tutanakları
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

        {/* Top Quick Actions */}
        <div className="flex items-center gap-2 self-start sm:self-center flex-wrap">
          {/* Komisyon Belgesi */}
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
              className="gap-1.5 text-xs font-semibold h-9 px-3 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
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

          <Button
            onClick={() => onOpenPreview(primarySablonKey)}
            className="gap-1.5 text-xs font-semibold h-9 px-3.5 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            {isHizmet ? "Hizmet Tutanağı Çıktı" : "Kabul Tutanağı Çıktı"}
          </Button>
        </div>
      </div>

      {/* Komisyon Heyeti Bilgilendirme / Roster Bar */}
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
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <button
            type="button"
            onClick={() => onOpenPreview("muayene-kabul-komisyonu")}
            className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 hover:underline cursor-pointer bg-transparent border-0 p-0"
          >
            Görevlendirme Onayı
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Kabul Tarihi</th>
              <th className="py-3 px-4">Firma</th>
              <th className="py-3 px-4">Sayı / Fatura No</th>
              <th className="py-3 px-4">Teslim Alan / Heyet</th>
              <th className="py-3 px-4">Teslim Yeri</th>
              <th className="py-3 px-4">Durum</th>
              <th className="py-3 px-4 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            <tr className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
              {/* Kabul Tarihi */}
              <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{formatDate(effectiveKabulTarihi || null)}</span>
                </div>
              </td>

              {/* Firma */}
              <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span className="truncate max-w-55" title={kazananFirmaUnvan}>
                    {kazananFirmaUnvan || "İstekli Firma"}
                  </span>
                </div>
                {firmaStats.vergiNo && (
                  <span className="text-[10px] text-slate-400 block ml-5">
                    VKN: {firmaStats.vergiNo}
                  </span>
                )}
              </td>

              {/* Sayı / No */}
              <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-mono text-[11px]">
                  {effectiveSiraNo}
                </span>
              </td>

              {/* Teslim Alan */}
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
                    {komisyonUyeleri.length} Kişilik Kabul Heyeti
                  </span>
                )}
              </td>

              {/* Teslim Yeri */}
              <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span
                    className="truncate max-w-45"
                    title={effectiveTeslimYeri}
                  >
                    {effectiveTeslimYeri}
                  </span>
                </div>
              </td>

              {/* Durum */}
              <td className="py-3.5 px-4 whitespace-nowrap">
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Kabul Edildi</span>
                </div>
              </td>

              {/* İşlemler */}
              <td className="py-3.5 px-4 text-right whitespace-nowrap">
                <div className="flex items-center justify-end gap-1.5">
                  {/* Primary acceptance document */}
                  <Button
                    onClick={() => onOpenPreview(primarySablonKey)}
                    variant="outline"
                    size="sm"
                    className="h-8 px-2.5 text-xs font-semibold gap-1 text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300 hover:bg-blue-50 dark:border-blue-900/60 dark:hover:bg-blue-950/40"
                    title="Kabul Tutanağını Görüntüle ve Yazdır"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Tutanağı Aç</span>
                  </Button>

                  {/* For hizmet alımı: Hizmet İşleri Kabul Teklif Belgesi */}
                  {isHizmet && (
                    <Button
                      onClick={() =>
                        onOpenPreview("hizmet-isleri-kabul-teklif-belgesi")}
                      variant="outline"
                      size="sm"
                      className="h-8 px-2.5 text-xs font-semibold gap-1 text-purple-600 hover:text-purple-700 border-purple-200 hover:border-purple-300 hover:bg-purple-50 dark:border-purple-900/60 dark:hover:bg-purple-950/40"
                      title="Hizmet İşleri Kabul Teklif Belgesini Aç"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>Teklif Belgesi</span>
                    </Button>
                  )}

                  {/* Ödeme Yazısı */}
                  <Button
                    onClick={() => onOpenPreview("odeme-yazisi")}
                    variant="outline"
                    size="sm"
                    className="h-8 px-2.5 text-xs font-semibold gap-1 text-emerald-600 hover:text-emerald-700 border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50 dark:border-emerald-900/60 dark:hover:bg-emerald-950/40"
                    title="Ödeme Yazısını Görüntüle ve Yazdır"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Ödeme Yazısı</span>
                  </Button>

                  {/* Ambara Aktar / TİF */}
                  {isMal && (
                    <Button
                      onClick={onOpenTifModal}
                      variant="outline"
                      size="sm"
                      className="h-8 px-2.5 text-xs font-semibold gap-1 text-emerald-600 hover:text-emerald-700 border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50 dark:border-emerald-900/60 dark:hover:bg-emerald-950/40"
                      title="TİF Oluştur ve Ambara Giriş Yap"
                    >
                      <PackageCheck className="w-3.5 h-3.5" />
                      <span>TİF / Ambar</span>
                    </Button>
                  )}

                  {/* Komisyon Modal */}
                  <Button
                    onClick={onOpenKomisyonModal}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                    title="Muayene & Kabul Komisyonunu Düzenle"
                  >
                    <Users className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer Info & Statistics Bar */}
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

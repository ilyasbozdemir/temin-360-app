import React, { useMemo } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Building2,
  Calendar,
  CheckCircle2,
  Copy,
  DollarSign,
  Edit2,
  ExternalLink,
  FileText,
  Layers,
  Link2,
  Percent,
  Plus,
  RotateCcw,
  Share2,
  Sparkles,
  Tag,
  Trash2,
} from "lucide-react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { PozFiyatGecmisi, PozItem, usePozlarHooks } from "./pozlar.hooks";
import { APP_ROUTES } from "../../constants/routeConstants";
import { Button } from "../../components/ui/Button";
import { cn } from "../../utils/cn";

export default function PozDetayScreen(): React.JSX.Element {
  const search: any = useSearch({ strict: false });
  const id = search?.id ? Number(search.id) : null;

  const navigate = useNavigate();
  const { pozList, isLoading, deletePoz } = usePozlarHooks();

  const poz = useMemo(() => {
    if (!id || !pozList) return null;
    return pozList.find((p) => p.id === id) || null;
  }, [id, pozList]);

  // Eski poz eşleşmesi kaydı
  const eskiPozItem = useMemo(() => {
    if (!poz?.eski_poz_no || !pozList) return null;
    return pozList.find((p) =>
      p.poz_no === poz.eski_poz_no ||
      (p.id !== poz.id && p.eski_poz_no === poz.eski_poz_no)
    ) || null;
  }, [poz, pozList]);

  // Bu poz eski bir poz ise, 2019+ yeni karşılığı var mı?
  const yeniKarsilikPozItem = useMemo(() => {
    if (!poz?.poz_no || !pozList) return null;
    return pozList.find((p) =>
      p.eski_poz_no === poz.poz_no && p.id !== poz.id
    ) || null;
  }, [poz, pozList]);

  // Fiyat geçmişini ayrıştır
  const fiyatListesi = useMemo<PozFiyatGecmisi[]>(() => {
    if (!poz) return [];
    if (poz.birim_fiyatlar) {
      try {
        const parsed = JSON.parse(poz.birim_fiyatlar);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch {
        // Fallback below
      }
    }
    if (poz.birim_fiyat) {
      return [
        {
          donem: poz.fiyat_donemi ||
            `${poz.poz_yili || new Date().getFullYear()}/1`,
          fiyat: poz.birim_fiyat,
        },
      ];
    }
    return [];
  }, [poz]);

  const handleDelete = async () => {
    if (!poz || !poz.id) return;
    if (
      confirm(`"${poz.poz_no}" numaralı pozu silmek istediğinize emin misiniz?`)
    ) {
      try {
        await deletePoz(poz.id);
        navigate({ to: APP_ROUTES.POZLAR });
      } catch (err: any) {
        alert("Silinirken hata oluştu: " + (err?.message || "Bilinmeyen hata"));
      }
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-xs text-slate-400">
        Poz bilgileri yükleniyor...
      </div>
    );
  }

  if (!poz) {
    return (
      <div className="p-16 text-center max-w-lg mx-auto space-y-4">
        <Building2 size={48} className="mx-auto text-amber-500 opacity-40" />
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">
          Poz Bulunamadı
        </h2>
        <p className="text-xs text-slate-500">
          Görüntülemek istediğiniz birim fiyat pozu silinmiş veya mevcut
          veritabanında bulunamamış olabilir.
        </p>
        <Button
          onClick={() => navigate({ to: APP_ROUTES.POZLAR })}
          className="bg-amber-600 hover:bg-amber-700 text-white gap-2 text-xs"
        >
          <ArrowLeft size={15} />
          <span>Poz Listesine Geri Dön</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-[1550px] mx-auto space-y-6 animate-in fade-in pb-20">
      {/* Üst Bar / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate({ to: APP_ROUTES.POZLAR })}
            className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
            title="Poz Listesine Geri Dön"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60">
                POZ DETAYI
              </span>
              <span className="text-xs text-slate-400">/</span>
              <span className="text-xs text-slate-500 font-medium">
                {poz.kategori || poz.poz_kurumu || "ÇŞB"} Kitabı
              </span>
            </div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>{poz.poz_no}</span>
              <span className="text-slate-400 text-base font-normal">
                Poz Detay & Birim Fiyatları
              </span>
            </h1>
          </div>
        </div>

        {/* Üst Aksiyonlar */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto flex-wrap">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate({ to: APP_ROUTES.POZLAR })}
            className="gap-2 text-xs"
          >
            <ArrowLeft size={14} />
            <span>Tüm Pozlar</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleDelete}
            className="gap-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 border-red-200 dark:border-red-900"
          >
            <Trash2 size={14} />
            <span>Sil</span>
          </Button>

          <Button
            type="button"
            onClick={() =>
              navigate({
                to: APP_ROUTES.YENI_POZ,
                search: { id: poz.id },
              })}
            className="bg-amber-600 hover:bg-amber-700 text-white gap-2 text-xs shadow-xs px-4"
          >
            <Edit2 size={14} />
            <span>Pozu Düzenle</span>
          </Button>
        </div>
      </div>

      {/* Sorumluluk ve Rehber Bilgilendirme Bannerı */}
      <div className="p-4 bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl text-xs flex items-start gap-3 text-amber-900 dark:text-amber-200">
        <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-xl text-amber-700 dark:text-amber-400 shrink-0 mt-0.5">
          <AlertTriangle size={18} />
        </div>
        <div className="flex-1 space-y-1">
          <p className="font-bold text-amber-800 dark:text-amber-300">
            Resmî Bülten & Yaklaşık Maliyet Teyit Uyarısı
          </p>
          <p className="text-[11px] text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
            Bu poz kalemi ilgili idarenin (ÇŞB, KGM, DSİ, İLBANK vb.)
            yayımladığı resmî birim fiyat ve analiz kitaplarına uygun olarak
            saklanmaktadır. İhale ve hakediş çalışmalarınızda bülten dönemini ve
            rayiçlerini kontrol ediniz.
          </p>
        </div>
      </div>

      {/* Ana Detay Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sol Kolon: Poz Detay Bilgileri Tablosu (7 Kolon) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. KART: Pozu Detay Bilgileri (Kullanıcının İstediği Tasarım) */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
            <div className="bg-[#f97316] text-white px-5 py-3.5 font-bold text-sm flex items-center justify-between">
              <span className="text-base tracking-tight">
                {poz.poz_no} Pozu Detay Bilgileri
              </span>
              <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded uppercase font-extrabold tracking-wider">
                {poz.kategori || poz.poz_kurumu || "ÇŞB"}
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {/* Poz No & Eski Poz No */}
              <div className="grid grid-cols-12 p-4 bg-slate-50/50 dark:bg-slate-950/40 items-center">
                <div className="col-span-4 font-bold text-slate-500">
                  Poz No
                </div>
                <div className="col-span-8 font-mono font-bold text-slate-900 dark:text-white flex items-center gap-3 flex-wrap">
                  <span className="text-sm px-2.5 py-1 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 rounded-md text-amber-900 dark:text-amber-200 font-extrabold">
                    {poz.poz_no}
                  </span>
                  {poz.eski_poz_no && (
                    <button
                      type="button"
                      onClick={() => {
                        if (eskiPozItem) {
                          navigate({
                            to: APP_ROUTES.POZ_DETAY,
                            search: { id: eskiPozItem.id },
                          });
                        } else {
                          navigate({ to: APP_ROUTES.POZLAR });
                        }
                      }}
                      className="text-blue-600 dark:text-blue-400 font-bold underline underline-offset-4 text-xs flex items-center gap-1 hover:text-blue-800 dark:hover:text-blue-300 cursor-pointer"
                      title={eskiPozItem
                        ? `Eski poz kaydına git (${eskiPozItem.poz_no})`
                        : "Eski poz numarasını ara"}
                    >
                      <Link2 size={13} /> Eski Poz No : {poz.eski_poz_no}
                    </button>
                  )}
                  {yeniKarsilikPozItem && (
                    <button
                      type="button"
                      onClick={() =>
                        navigate({
                          to: APP_ROUTES.POZ_DETAY,
                          search: { id: yeniKarsilikPozItem.id },
                        })}
                      className="text-emerald-600 dark:text-emerald-400 font-bold underline underline-offset-4 text-xs flex items-center gap-1 hover:text-emerald-800 dark:hover:text-emerald-300 cursor-pointer"
                      title="2019+ Güncel Yeni Poz Karşılığına Git"
                    >
                      <Sparkles size={13} /> 2019+ Yeni Karşılığı :{" "}
                      {yeniKarsilikPozItem.poz_no}
                    </button>
                  )}
                </div>
              </div>

              {/* Tanım */}
              <div className="grid grid-cols-12 p-4">
                <div className="col-span-4 font-bold text-slate-500">Tanım</div>
                <div className="col-span-8 text-slate-900 dark:text-slate-100 leading-relaxed font-semibold">
                  {poz.kalem_adi || poz.poz_tanimi || "-"}
                </div>
              </div>

              {/* Uzun Tanım */}
              <div className="grid grid-cols-12 p-4 bg-slate-50/50 dark:bg-slate-950/40">
                <div className="col-span-4 font-bold text-slate-500">
                  Uzun Tanım
                </div>
                <div className="col-span-8 text-slate-700 dark:text-slate-300 leading-relaxed text-xs">
                  {poz.ozelligi || poz.poz_tanimi || poz.kalem_adi || "-"}
                </div>
              </div>

              {/* Birim */}
              <div className="grid grid-cols-12 p-4">
                <div className="col-span-4 font-bold text-slate-500">Birim</div>
                <div className="col-span-8 font-extrabold font-mono text-slate-900 dark:text-white uppercase text-sm">
                  {poz.birim || "m³"}
                </div>
              </div>

              {/* Pozun Tipi */}
              <div className="grid grid-cols-12 p-4 bg-slate-50/50 dark:bg-slate-950/40">
                <div className="col-span-4 font-bold text-slate-500">
                  Pozun Tipi
                </div>
                <div className="col-span-8 font-bold text-emerald-700 dark:text-emerald-300 text-xs">
                  {poz.poz_tipi || "Analiz"}
                </div>
              </div>

              {/* Bulunduğu Kitap */}
              <div className="grid grid-cols-12 p-4">
                <div className="col-span-4 font-bold text-slate-500">
                  Bulunduğu Kitap
                </div>
                <div className="col-span-8 font-semibold text-slate-900 dark:text-white">
                  {poz.fasikul ||
                    "Çevre ve Şehircilik Bakanlığı 2019 ve Sonrası"}
                </div>
              </div>
            </div>
          </div>

          {/* Eski Poz / Yeni Poz Eşleşme Bilgi Kartı */}
          {poz.eski_poz_no && (
            <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 shrink-0">
                  <Link2 size={16} />
                </div>
                <div>
                  <span className="font-bold text-blue-900 dark:text-blue-200 block">
                    2018 ve Öncesi Eski Poz No Eşleşmesi:
                  </span>
                  <span className="font-mono font-bold text-blue-700 dark:text-blue-300">
                    {poz.eski_poz_no}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                    Bu poz için eski bülten kodu kayıtlıdır. Arama ve hakediş
                    kontrollerinde eşleştirme sağlanır.
                  </span>
                </div>
              </div>

              {eskiPozItem && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    navigate({
                      to: APP_ROUTES.POZ_DETAY,
                      search: { id: eskiPozItem.id },
                    })}
                  className="shrink-0 text-xs text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800 hover:bg-blue-100/50"
                >
                  Eski Poz Kaydına Git
                </Button>
              )}
            </div>
          )}

          {yeniKarsilikPozItem && (
            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 shrink-0">
                  <Sparkles size={16} />
                </div>
                <div>
                  <span className="font-bold text-emerald-900 dark:text-emerald-200 block">
                    2019+ Yılı Güncel Yeni Poz Karşılığı:
                  </span>
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">
                    {yeniKarsilikPozItem.poz_no}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                    {yeniKarsilikPozItem.kalem_adi}
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  navigate({
                    to: APP_ROUTES.POZ_DETAY,
                    search: { id: yeniKarsilikPozItem.id },
                  })}
                className="shrink-0 text-xs text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100/50"
              >
                Yeni Pozu İncele
              </Button>
            </div>
          )}

          {/* Ek Sınıflandırma Kartı */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers size={16} className="text-purple-600" />
              <span>İhale Sınıflandırma & Vergi Parametreleri</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block mb-1">
                  OKAS / CPV Kodu:
                </span>
                <span className="font-mono font-bold text-purple-700 dark:text-purple-300 text-sm">
                  {poz.okas_kodu || "45000000"}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block mb-1">
                  Yapı Sınıfı:
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                  {poz.yapi_sinifi || "Genel Yapım İşleri"}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block mb-1">
                  KDV Oranı:
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  %{poz.kdv_orani ?? 20}
                </span>
              </div>
            </div>

            {poz.notlar && (
              <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 rounded-xl text-xs space-y-1">
                <span className="font-bold text-amber-800 dark:text-amber-300">
                  Özel Şartname / Keşif Notları:
                </span>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {poz.notlar}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sağ Kolon: Birim Fiyatlar Tablosu & Hızlı Aksiyonlar (5 Kolon) */}
        <div className="lg:col-span-5 space-y-6">
          {/* 2. KART: Pozu Birim Fiyatları Tablosu (Kullanıcının İstediği Tasarım) */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
            <div className="bg-[#f97316] text-white px-5 py-3.5 font-bold text-sm flex items-center justify-between">
              <span className="text-base tracking-tight">
                {poz.poz_no} Pozu Birim Fiyatları
              </span>
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded font-mono">
                {fiyatListesi.length} Kayıtlı Dönem
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold">
                  <tr>
                    <th className="p-3.5 pl-5">Birim Fiyat Tarihi</th>
                    <th className="p-3.5 text-right pr-5">Birim Fiyatı (TL)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-xs">
                  {fiyatListesi.length === 0
                    ? (
                      <tr>
                        <td
                          colSpan={2}
                          className="p-6 text-center text-slate-400 font-sans"
                        >
                          Henüz dönemsel birim fiyat kaydedilmedi.
                        </td>
                      </tr>
                    )
                    : (
                      fiyatListesi.map((f, i) => (
                        <tr
                          key={i}
                          className={cn(
                            "hover:bg-amber-50/30 dark:hover:bg-amber-950/20 transition-colors",
                            i === 0 &&
                              "bg-amber-50/10 dark:bg-amber-950/10 font-bold",
                          )}
                        >
                          <td className="p-3.5 pl-5 text-slate-900 dark:text-white flex items-center gap-2">
                            <span>{f.donem || "-"}</span>
                            {i === 0 && (
                              <span className="text-[10px] font-sans font-extrabold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                GÜNCEL
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-right pr-5 font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                            {Number(f.fiyat || 0).toLocaleString("tr-TR", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })} TL
                          </td>
                        </tr>
                      ))
                    )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Aksiyon Kutusu */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              Hızlı İşlemler
            </h4>
            <div className="space-y-2">
              <Button
                type="button"
                onClick={() =>
                  navigate({
                    to: APP_ROUTES.YENI_POZ,
                    search: { id: poz.id },
                  })}
                className="w-full bg-[#f97316] hover:bg-orange-600 text-white gap-2 text-xs py-2.5 font-bold shadow-xs"
              >
                <Edit2 size={14} />
                <span>Bu Pozu ve Fiyatlarını Düzenle</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: APP_ROUTES.YENI_POZ })}
                className="w-full gap-2 text-xs py-2.5"
              >
                <Plus size={14} />
                <span>Yeni Farklı Bir Poz Tanımla</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

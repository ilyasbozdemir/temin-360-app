import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  Building2,
  DollarSign,
  Edit2,
  Eye,
  Filter,
  FileSpreadsheet,
  Layers,
  Link2,
  Plus,
  Search,
  Sparkles,
  Tag,
  Trash2,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { ExcelActions } from "../../components/ui/ExcelActions";
import { PozItem, usePozlarHooks } from "./pozlar.hooks";
import { POZ_KURUMLARI } from "../malzemeler/components/pozKitaplari.data";
import { APP_ROUTES } from "../../constants/routeConstants";
import { cn } from "../../utils/cn";

export default function PozlarScreen() {
  const navigate = useNavigate();
  const { pozList, isLoading, deletePoz } = usePozlarHooks();

  // Filtreler
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKurum, setSelectedKurum] = useState("ALL");
  const [selectedYil, setSelectedYil] = useState<string>("ALL");
  const [selectedPozTipi, setSelectedPozTipi] = useState<string>("ALL");

  // Filtrelenmiş Poz Listesi (Eski Poz No, Fasikül, Poz Tipi ve Tanımları kapsar)
  const filteredList = useMemo(() => {
    return pozList.filter((item) => {
      const matchKurum = selectedKurum === "ALL" ||
        (item.kategori || item.poz_kurumu || "").toLowerCase().includes(
          selectedKurum.toLowerCase(),
        ) ||
        (item.poz_no || "").toLowerCase().startsWith(
          selectedKurum.toLowerCase(),
        );

      const matchYil = selectedYil === "ALL" ||
        String(item.poz_yili || "") === selectedYil;

      const matchTipi = selectedPozTipi === "ALL" ||
        (item.poz_tipi || "Analiz").toLowerCase() ===
          selectedPozTipi.toLowerCase();

      const query = searchQuery.toLowerCase().trim();
      const matchSearch = !query ||
        (item.poz_no || "").toLowerCase().includes(query) ||
        (item.eski_poz_no || "").toLowerCase().includes(query) ||
        (item.kalem_adi || "").toLowerCase().includes(query) ||
        (item.poz_tanimi || "").toLowerCase().includes(query) ||
        (item.fasikul || "").toLowerCase().includes(query) ||
        (item.poz_tipi || "").toLowerCase().includes(query) ||
        (item.yapi_sinifi || "").toLowerCase().includes(query) ||
        (item.okas_kodu || "").includes(query);

      return matchKurum && matchYil && matchTipi && matchSearch;
    });
  }, [pozList, selectedKurum, selectedYil, selectedPozTipi, searchQuery]);

  // İstatistikler
  const stats = useMemo(() => {
    const total = pozList.length;
    const analizCount = pozList.filter((p) =>
      (p.poz_tipi || "Analiz") === "Analiz"
    ).length;
    const rayicCount = pozList.filter((p) => p.poz_tipi === "Rayiç").length;
    const eskiPozCount = pozList.filter((p) => !!p.eski_poz_no).length;
    return { total, analizCount, rayicCount, eskiPozCount };
  }, [pozList]);

  const handleDelete = async (id: number, pozNo: string) => {
    if (confirm(`"${pozNo}" numaralı pozu silmek istediğinize emin misiniz?`)) {
      try {
        await deletePoz(id);
      } catch (err: any) {
        alert("Silinirken hata oluştu: " + err.message);
      }
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-[1600px] mx-auto space-y-6 animate-in fade-in">
      {/* Üst Başlık & Aksiyonlar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Building2 size={26} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              Birim Fiyat Pozları & Fasiküller
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Resmî Bakanlık/İdare Birim Fiyat Kitapları (ÇŞB, KGM, DSİ,
              İLBANK), Eski/Yeni Poz Eşleşmesi ve Fiyat Geçmişi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            onClick={() => navigate({ to: APP_ROUTES.TOPLU_POZ_EKLE })}
            className="border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10 gap-2 shadow-xs"
          >
            <FileSpreadsheet size={16} className="text-amber-600 dark:text-amber-400" />
            <span>Toplu Poz Ekle & GitHub Eşitle</span>
          </Button>

          <ExcelActions
            tableName="TANIM_Kalem"
            customFileName="Birim_Fiyat_Pozlari"
            title="Birim Fiyat Pozları"
            uniqueCol="poz_no"
            onImportSuccess={() => window.location.reload()}
          />

          <Button
            onClick={() => navigate({ to: APP_ROUTES.YENI_POZ })}
            className="bg-amber-600 hover:bg-amber-700 text-white gap-2 shadow-xs"
          >
            <Plus size={16} />
            <span>Yeni Poz Tanımla</span>
          </Button>
        </div>
      </div>

      {/* Sorumluluk ve Rehber Bilgilendirme Bannerı */}
      <div className="p-3.5 bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl text-xs flex items-start gap-3 text-amber-900 dark:text-amber-200">
        <div className="p-1.5 bg-amber-100 dark:bg-amber-900/40 rounded-lg text-amber-700 dark:text-amber-400 shrink-0 mt-0.5">
          <AlertTriangle size={16} />
        </div>
        <div className="flex-1 space-y-1">
          <p className="font-bold text-amber-800 dark:text-amber-300">
            Eski Poz No / Yeni Poz No Eşleşmesi & Fasikül Arama Desteği
          </p>
          <p className="text-[11px] text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
            Arama çubuğuna ister 2019 sonrası güncel poz numarasını (örn:{" "}
            <span className="font-mono font-bold">15.110.1001</span>), ister
            önceki eski bülten poz numarasını (örn:{" "}
            <span className="font-mono font-bold">14.040/1</span>), ister
            fasikül adını yazarak arama yapabilirsiniz.
          </p>
        </div>
      </div>

      {/* KPI Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <Layers size={20} />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500">
              Toplam Kayıtlı Poz
            </span>
            <p className="text-xl font-black text-slate-900 dark:text-white font-mono">
              {stats.total}
            </p>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <BookOpen size={20} />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500">
              Analiz Pozları
            </span>
            <p className="text-xl font-black text-slate-900 dark:text-white font-mono">
              {stats.analizCount}
            </p>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <DollarSign size={20} />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500">
              Rayiç Kalemleri
            </span>
            <p className="text-xl font-black text-slate-900 dark:text-white font-mono">
              {stats.rayicCount}
            </p>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
            <Link2 size={20} />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500">
              Eski Poz Eşleşmeli
            </span>
            <p className="text-xl font-black text-slate-900 dark:text-white font-mono">
              {stats.eskiPozCount}
            </p>
          </div>
        </div>
      </div>

      {/* Arama ve Filtre Çubuğu */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        {/* Kurum Butonları */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Filter size={12} /> Kurum:
          </span>
          {POZ_KURUMLARI.map((k) => (
            <button
              key={k.id}
              type="button"
              onClick={() => setSelectedKurum(k.id)}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all border",
                selectedKurum === k.id
                  ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-400",
              )}
            >
              {k.badge}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Arama Çubuğu */}
          <div className="sm:col-span-6 relative">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Poz No (örn: 15.110.1001), Eski Poz No (örn: 14.040/1), Tanım, Fasikül Ara..."
              className="pl-10 text-xs"
            />
          </div>

          {/* Poz Tipi Filtresi */}
          <div className="sm:col-span-3">
            <select
              value={selectedPozTipi}
              onChange={(e) => setSelectedPozTipi(e.target.value)}
              className="w-full px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-amber-500"
            >
              <option value="ALL">Tüm Poz Tipleri</option>
              <option value="Analiz">Analiz Pozları</option>
              <option value="Rayiç">Rayiç Kalemleri</option>
              <option value="İmalat">İmalat / Montajsız</option>
              <option value="Montaj">Montaj Bedelleri</option>
              <option value="Nakliye">Nakliye & Taşıma</option>
              <option value="Özel">Özel İdare Pozları</option>
            </select>
          </div>

          {/* Yıl Filtresi */}
          <div className="sm:col-span-3">
            <select
              value={selectedYil}
              onChange={(e) => setSelectedYil(e.target.value)}
              className="w-full px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-amber-500"
            >
              <option value="ALL">Tüm Bülten Yılları</option>
              <option value="2026">2026 Yılı</option>
              <option value="2025">2025 Yılı</option>
              <option value="2024">2024 Yılı</option>
              <option value="2023">2023 Yılı</option>
            </select>
          </div>
        </div>
      </div>

      {/* Poz Listesi Tablosu */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {isLoading
          ? (
            <div className="p-12 text-center text-xs text-slate-400">
              Yükleniyor...
            </div>
          )
          : filteredList.length === 0
          ? (
            <div className="p-16 text-center text-slate-400 text-xs flex flex-col items-center gap-3">
              <Building2 size={40} className="opacity-30 text-amber-600" />
              <div className="space-y-1">
                <p className="font-semibold text-slate-700 dark:text-slate-300">
                  Aramanıza uygun poz veya rayiç bulunamadı.
                </p>
                <p className="text-slate-400 text-[11px]">
                  Yukarıdaki butonla yeni resmî veya özel analizli poz
                  ekleyebilirsiniz.
                </p>
              </div>
              <Button
                onClick={() => navigate({ to: APP_ROUTES.YENI_POZ })}
                className="bg-amber-600 hover:bg-amber-700 text-white gap-2 mt-2"
              >
                <Plus size={14} /> Yeni Poz Ekle
              </Button>
            </div>
          )
          : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold">
                  <tr>
                    <th className="p-3.5 pl-5">POZ NO / ESKİ POZ NO</th>
                    <th className="p-3.5">İMALAT / POZ TANIMI</th>
                    <th className="p-3.5">KURUM & FASİKÜL</th>
                    <th className="p-3.5">POZ TİPİ</th>
                    <th className="p-3.5 text-center">BİRİM</th>
                    <th className="p-3.5 text-right">GÜNCEL FİYAT (TL)</th>
                    <th className="p-3.5">DÖNEM</th>
                    <th className="p-3.5 text-right pr-5">İŞLEMLER</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredList.map((item) => {
                    const isOzel = item.poz_no?.startsWith("ÖZEL") ||
                      item.poz_no?.startsWith("ÖZ") ||
                      item.poz_no?.startsWith("İDARE") ||
                      item.poz_tipi === "Özel";
                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-amber-50/20 dark:hover:bg-amber-950/10 transition-colors group"
                      >
                        {/* Poz No & Eski Poz No */}
                        <td className="p-3.5 pl-5 font-mono">
                          <div className="flex flex-col gap-1 items-start">
                            <button
                              type="button"
                              onClick={() =>
                                navigate({
                                  to: APP_ROUTES.POZ_DETAY,
                                  search: { id: item.id },
                                })}
                              className={cn(
                                "px-2.5 py-0.5 rounded-lg text-xs border font-extrabold cursor-pointer transition-transform hover:scale-105 text-left",
                                isOzel
                                  ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800 hover:bg-purple-100"
                                  : "bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800 hover:bg-amber-100",
                              )}
                              title="Poz Detayı ve Birim Fiyatlarını Görüntüle"
                            >
                              {item.poz_no}
                            </button>
                            {item.eski_poz_no && (
                              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1">
                                <Link2 size={10} /> {item.eski_poz_no}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Tanım & Uzun Tanım */}
                        <td className="p-3.5 font-semibold text-slate-900 dark:text-white max-w-md">
                          <div
                            onClick={() =>
                              navigate({
                                to: APP_ROUTES.POZ_DETAY,
                                search: { id: item.id },
                              })}
                            className="line-clamp-2 leading-relaxed cursor-pointer hover:text-amber-600 transition-colors"
                          >
                            {item.kalem_adi || item.poz_tanimi}
                          </div>
                          {item.ozelligi && item.ozelligi !== item.kalem_adi &&
                            (
                              <span className="text-[10px] text-slate-400 mt-0.5 line-clamp-1 block">
                                {item.ozelligi}
                              </span>
                            )}
                        </td>

                        {/* Kurum & Fasikül */}
                        <td className="p-3.5">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 w-max">
                              {item.kategori || item.poz_kurumu ||
                                (isOzel ? "ÖZEL POZ" : "ÇŞB")}
                            </span>
                            <span className="text-[10px] text-slate-500 line-clamp-1">
                              {item.fasikul || "Genel Kitap"}
                            </span>
                          </div>
                        </td>

                        {/* Poz Tipi */}
                        <td className="p-3.5">
                          <span
                            className={cn(
                              "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                              (item.poz_tipi || "Analiz") === "Analiz"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
                                : item.poz_tipi === "Rayiç"
                                ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300"
                                : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300",
                            )}
                          >
                            {item.poz_tipi || "Analiz"}
                          </span>
                        </td>

                        {/* Ölçü Birimi */}
                        <td className="p-3.5 text-center font-mono font-bold text-slate-800 dark:text-slate-200 uppercase">
                          {item.birim || "m³"}
                        </td>

                        {/* Güncel Fiyat */}
                        <td className="p-3.5 text-right font-mono font-bold text-slate-900 dark:text-white">
                          {Number(item.birim_fiyat || 0) > 0
                            ? (
                              <span className="text-emerald-600 dark:text-emerald-400">
                                {Number(item.birim_fiyat).toLocaleString(
                                  "tr-TR",
                                  {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  },
                                )} TL
                              </span>
                            )
                            : (
                              <span className="text-slate-400 text-[11px]">
                                -
                              </span>
                            )}
                        </td>

                        {/* Dönem */}
                        <td className="p-3.5 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                          {item.fiyat_donemi || `${item.poz_yili || ""}`}
                        </td>

                        {/* İşlemler */}
                        <td className="p-3.5 pr-5 text-right">
                          <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={() =>
                                navigate({
                                  to: APP_ROUTES.POZ_DETAY,
                                  search: { id: item.id },
                                })}
                              className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors"
                              title="Detay ve Fiyat Geçmişini Görüntüle"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                navigate({
                                  to: APP_ROUTES.YENI_POZ,
                                  search: { id: item.id },
                                })}
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors"
                              title="Düzenle"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                item.id && handleDelete(item.id, item.poz_no)}
                              className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                              title="Sil"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
      </div>
    </div>
  );
}

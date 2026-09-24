import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Award,
  Banknote,
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  Package,
  Search,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { cn } from "../../../utils/cn";

interface TeminRecord {
  dosya_id: number;
  temin_no: string;
  konu: string;
  tur: string;
  dosya_acilis_tarihi: string;
  temin_tarihi: string;
  status: string;
  teklif_toplami: number;
  kazandi_mi: number;
  teklif_durumu: string;
  yaklasik_maliyet: number;
  firma_id_kazanan: number;
  firma_unvan_kazanan: string;
  davet_tarihi: string;
}

interface FirmaGecmisTeminlerProps {
  firmaId: number;
  firmaUnvan: string;
}

export const FirmaGecmisTeminler: React.FC<FirmaGecmisTeminlerProps> = ({
  firmaId,
  firmaUnvan,
}) => {
  const [records, setRecords] = useState<TeminRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [expandedKalemler, setExpandedKalemler] = useState<
    Record<number, any[]>
  >({});
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "kazanan" | "kaybeden"
  >("all");

  useEffect(() => {
    async function loadHistory(): Promise<void> {
      if (!firmaId) return;
      setLoading(true);
      try {
        const res = await window.electron.ipcRenderer.invoke(
          "db:query",
          `SELECT
            d.id as dosya_id,
            d.temin_no,
            d.konu,
            d.tur,
            d.dosya_acilis_tarihi,
            d.temin_tarihi,
            d.status,
            d.yaklasik_maliyet,
            d.firma_id as firma_id_kazanan,
            df.teklif_toplami,
            df.kazandi_mi,
            df.teklif_durumu,
            df.davet_tarihi,
            COALESCE(winner.unvan, '') as firma_unvan_kazanan
          FROM DATA_TeminFirma df
          JOIN DATA_TeminDosyasi d ON df.temin_dosya_id = d.id
          LEFT JOIN TANIM_Firma winner ON d.firma_id = winner.id
          WHERE df.firma_id = ? AND d.is_deleted = 0
          ORDER BY d.dosya_acilis_tarihi DESC, d.id DESC`,
          [firmaId],
        );
        if (res.success) {
          setRecords(res.data || []);
        }
      } catch (err) {
        console.error("Firma geçmiş teminler yükleme hatası:", err);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, [firmaId]);

  const loadKalemler = async (dosyaId: number): Promise<void> => {
    if (expandedKalemler[dosyaId]) return;
    try {
      const res = await window.electron.ipcRenderer.invoke(
        "db:query",
        `SELECT
          k.kalem_adi,
          k.miktar,
          k.birim,
          k.kdv_orani,
          COALESCE(t.birim_fiyat, 0) as birim_fiyat
        FROM DATA_TeminKalem k
        LEFT JOIN DATA_TeminKalemTeklif t ON t.temin_kalem_id = k.id
          AND t.temin_firma_id = (
            SELECT id FROM DATA_TeminFirma
            WHERE temin_dosya_id = ? AND firma_id = ?
            LIMIT 1
          )
        WHERE k.temin_dosya_id = ?
        ORDER BY k.id ASC`,
        [dosyaId, firmaId, dosyaId],
      );
      if (res.success) {
        setExpandedKalemler((prev) => ({ ...prev, [dosyaId]: res.data || [] }));
      }
    } catch (err) {
      console.error("Kalemler yükleme hatası:", err);
    }
  };

  const handleToggleExpand = (dosyaId: number): void => {
    if (expandedId === dosyaId) {
      setExpandedId(null);
    } else {
      setExpandedId(dosyaId);
      loadKalemler(dosyaId);
    }
  };

  // Statistics
  const stats = useMemo(() => {
    const toplam = records.length;
    const kazanan = records.filter((r) => r.kazandi_mi === 1).length;
    const toplamTeklif = records.reduce(
      (acc, r) => acc + (r.teklif_toplami || 0),
      0,
    );
    const kazananTeklif = records
      .filter((r) => r.kazandi_mi === 1)
      .reduce((acc, r) => acc + (r.teklif_toplami || 0), 0);
    return { toplam, kazanan, toplamTeklif, kazananTeklif };
  }, [records]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    let items = records;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (r) =>
          r.konu?.toLowerCase().includes(q) ||
          r.temin_no?.toLowerCase().includes(q),
      );
    }
    if (filterStatus === "kazanan") {
      items = items.filter((r) => r.kazandi_mi === 1);
    } else if (filterStatus === "kaybeden") {
      items = items.filter((r) => r.kazandi_mi !== 1);
    }
    return items;
  }, [records, searchQuery, filterStatus]);

  const getStatusBadge = (status: string, kazandi: number): React.ReactNode => {
    if (kazandi === 1) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-black bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/15">
          <Award className="w-3 h-3" />
          Kazandı
        </span>
      );
    }
    if (status === "tamamlandi") {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
          <CheckCircle2 className="w-3 h-3" />
          Tamamlandı
        </span>
      );
    }
    if (status === "iptal") {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-black bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-md border border-red-200 dark:border-red-800">
          <XCircle className="w-3 h-3" />
          İptal
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-black bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
        <Clock className="w-3 h-3" />
        Devam Ediyor
      </span>
    );
  };

  const formatTur = (tur: string): string => {
    const turMap: Record<string, string> = {
      mal: "Mal Alımı",
      hizmet: "Hizmet Alımı",
      yapim_isi: "Yapım İşi",
      danismanlik: "Danışmanlık",
    };
    return turMap[tur] || tur || "Mal Alımı";
  };

  const formatCurrency = (val: number): string => {
    if (!val || val === 0) return "-";
    return val.toLocaleString("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-semibold">
          Geçmiş teminler yükleniyor...
        </p>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="py-12 text-center flex flex-col items-center justify-center gap-3">
        <FileText className="w-10 h-10 text-slate-300 dark:text-slate-700" />
        <div className="text-slate-700 dark:text-slate-300 text-sm font-bold">
          Bu firmaya ait geçmiş doğrudan temin kaydı bulunamadı.
        </div>
        <p className="text-xs text-slate-450 dark:text-slate-500 max-w-md">
          Firma henüz hiçbir doğrudan temin dosyasında yer almamış görünüyor.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-50/60 dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-4 flex flex-col gap-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <BarChart3 className="w-3.5 h-3.5" />
            Toplam Katılım
          </span>
          <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
            {stats.toplam}
          </span>
          <span className="text-[10px] text-slate-500 font-semibold">
            dosya
          </span>
        </div>

        <div className="bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-200/60 dark:border-emerald-800 rounded-2xl p-4 flex flex-col gap-1">
          <span className="text-[10px] text-emerald-600 dark:text-emerald-500 font-bold uppercase tracking-wider flex items-center gap-1">
            <Award className="w-3.5 h-3.5" />
            Kazandığı
          </span>
          <span className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">
            {stats.kazanan}
          </span>
          <span className="text-[10px] text-emerald-600/70 dark:text-emerald-500/70 font-semibold">
            dosya ({stats.toplam > 0
              ? Math.round((stats.kazanan / stats.toplam) * 100)
              : 0}%)
          </span>
        </div>

        <div className="bg-blue-50/40 dark:bg-blue-950/10 border border-blue-200/60 dark:border-blue-800 rounded-2xl p-4 flex flex-col gap-1">
          <span className="text-[10px] text-blue-600 dark:text-blue-500 font-bold uppercase tracking-wider flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            Toplam Teklif
          </span>
          <span className="text-lg font-extrabold text-blue-700 dark:text-blue-400 font-mono">
            {formatCurrency(stats.toplamTeklif)}
          </span>
          <span className="text-[10px] text-blue-600/70 dark:text-blue-500/70 font-semibold">
            TL
          </span>
        </div>

        <div className="bg-violet-50/40 dark:bg-violet-950/10 border border-violet-200/60 dark:border-violet-800 rounded-2xl p-4 flex flex-col gap-1">
          <span className="text-[10px] text-violet-600 dark:text-violet-500 font-bold uppercase tracking-wider flex items-center gap-1">
            <Banknote className="w-3.5 h-3.5" />
            Kazanılan Toplam
          </span>
          <span className="text-lg font-extrabold text-violet-700 dark:text-violet-400 font-mono">
            {formatCurrency(stats.kazananTeklif)}
          </span>
          <span className="text-[10px] text-violet-600/70 dark:text-violet-500/70 font-semibold">
            TL
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200/60 dark:border-slate-800 shrink-0">
          {(["all", "kazanan", "kaybeden"] as const).map((key) => {
            const labels = {
              all: "Tümü",
              kazanan: "Kazandığı",
              kaybeden: "Diğer",
            };
            return (
              <button
                key={key}
                type="button"
                onClick={() => setFilterStatus(key)}
                className={cn(
                  "py-1.5 px-3 text-[11px] font-black rounded-lg transition-all cursor-pointer border-0",
                  filterStatus === key
                    ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-3xs"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-400 bg-transparent",
                )}
              >
                {labels[key]}
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Dosya konusu veya numarası ara..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold text-slate-800 dark:text-slate-200 placeholder:text-slate-400 outline-none focus:border-blue-400 dark:focus:border-blue-600 transition-colors"
          />
        </div>
      </div>

      {/* Records List */}
      {filteredRecords.length === 0
        ? (
          <div className="py-10 text-center flex flex-col items-center justify-center gap-2">
            <AlertCircle className="w-8 h-8 text-slate-300 dark:text-slate-700" />
            <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
              Filtrelemeye uygun kayıt bulunamadı.
            </p>
          </div>
        )
        : (
          <div className="flex flex-col gap-3">
            {filteredRecords.map((rec) => {
              const isExpanded = expandedId === rec.dosya_id;
              const kalemler = expandedKalemler[rec.dosya_id];

              return (
                <div
                  key={rec.dosya_id}
                  className={cn(
                    "bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden transition-all duration-200",
                    rec.kazandi_mi === 1
                      ? "border-emerald-200/60 dark:border-emerald-800/60"
                      : "border-slate-200/60 dark:border-slate-800",
                    isExpanded ? "shadow-md" : "shadow-xs hover:shadow-sm",
                  )}
                >
                  {/* Main Row */}
                  <button
                    type="button"
                    onClick={() => handleToggleExpand(rec.dosya_id)}
                    className="w-full text-left p-5 flex items-center gap-4 cursor-pointer bg-transparent border-0 group"
                  >
                    {/* Icon */}
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-colors",
                        rec.kazandi_mi === 1
                          ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                          : "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700",
                      )}
                    >
                      <Package className="w-5 h-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {rec.temin_no && (
                          <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded border border-blue-100 dark:border-blue-800">
                            {rec.temin_no}
                          </span>
                        )}
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          {formatTur(rec.tur)}
                        </span>
                        {getStatusBadge(rec.status, rec.kazandi_mi)}
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-150 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {rec.konu}
                      </h4>
                    </div>

                    {/* Price & Date */}
                    <div className="flex items-center gap-6 shrink-0">
                      <div className="text-right hidden sm:block">
                        <span className="text-[10px] text-slate-400 block font-bold">
                          Teklif Tutarı
                        </span>
                        <span
                          className={cn(
                            "text-sm font-extrabold font-mono",
                            rec.teklif_toplami > 0
                              ? rec.kazandi_mi === 1
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-slate-800 dark:text-slate-200"
                              : "text-slate-400 italic text-xs",
                          )}
                        >
                          {rec.teklif_toplami > 0
                            ? `${formatCurrency(rec.teklif_toplami)} TL`
                            : "Girilmedi"}
                        </span>
                      </div>

                      <div className="text-right hidden md:block">
                        <span className="text-[10px] text-slate-400 block font-bold">
                          Tarih
                        </span>
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {rec.temin_tarihi || rec.dosya_acilis_tarihi || "-"}
                        </span>
                      </div>

                      <div className="w-5 h-5 text-slate-400 transition-transform duration-200">
                        {isExpanded
                          ? <ChevronUp className="w-5 h-5" />
                          : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </button>

                  {/* Expanded Detail */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 dark:border-slate-800 p-5 bg-slate-50/50 dark:bg-slate-950/30 animate-in fade-in slide-in-from-top-1 duration-200">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block">
                            Yaklaşık Maliyet
                          </span>
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300 font-mono">
                            {rec.yaklasik_maliyet > 0
                              ? `${formatCurrency(rec.yaklasik_maliyet)} TL`
                              : "-"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block">
                            Teklif Durumu
                          </span>
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                            {rec.teklif_durumu || "-"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block">
                            Kazanan Firma
                          </span>
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                            {rec.firma_unvan_kazanan || "Belirlenmedi"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block">
                            Davet Tarihi
                          </span>
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                            {rec.davet_tarihi || "-"}
                          </span>
                        </div>
                      </div>

                      {/* Item Breakdown Table */}
                      {kalemler && kalemler.length > 0
                        ? (
                          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl overflow-hidden">
                            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                              <Package className="w-3.5 h-3.5 text-blue-500" />
                              <span className="text-xs font-black text-slate-700 dark:text-slate-300">
                                İhtiyaç Kalemleri & Birim Fiyatlar
                              </span>
                            </div>
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold">
                                  <th className="text-left py-2.5 px-4">
                                    Kalem
                                  </th>
                                  <th className="text-center py-2.5 px-3">
                                    Miktar
                                  </th>
                                  <th className="text-right py-2.5 px-3">
                                    Birim Fiyat
                                  </th>
                                  <th className="text-right py-2.5 px-4">
                                    Toplam
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {kalemler.map((k: any, idx: number) => (
                                  <tr
                                    key={idx}
                                    className="border-b border-slate-50 dark:border-slate-900/60 hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors"
                                  >
                                    <td className="py-2.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                                      {k.kalem_adi}
                                    </td>
                                    <td className="py-2.5 px-3 text-center text-slate-500 font-semibold">
                                      {k.miktar} {k.birim}
                                    </td>
                                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                                      {k.birim_fiyat > 0
                                        ? `${formatCurrency(k.birim_fiyat)} TL`
                                        : "-"}
                                    </td>
                                    <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                                      {k.birim_fiyat > 0
                                        ? `${
                                          formatCurrency(
                                            k.birim_fiyat * (k.miktar || 1),
                                          )
                                        } TL`
                                        : "-"}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )
                        : kalemler
                        ? (
                          <div className="text-center py-4 text-xs text-slate-400 font-semibold italic">
                            Bu dosyada kalem bilgisi bulunmuyor.
                          </div>
                        )
                        : (
                          <div className="flex items-center justify-center py-4 gap-2">
                            <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                            <span className="text-xs text-slate-500 font-semibold">
                              Kalemler yükleniyor...
                            </span>
                          </div>
                        )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
    </div>
  );
};

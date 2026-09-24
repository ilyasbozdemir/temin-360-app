import React, { useState } from "react";
import {
  Building2,
  ChevronRight,
  Package,
  PlusCircle,
  Sparkles,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../components/ui/Popover";
import { useNavigate } from "@tanstack/react-router";
import { useWorkspaceStore } from "../../../store/workspaceStore";
import { useQuery } from "@tanstack/react-query";
import { cn } from "../../../utils/cn";

interface DosyaHizliIcerikPopoverProps {
  dosya: any;
  trigger?: React.ReactNode;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
}

interface KalemItem {
  id: number;
  sira_no?: number;
  kalem_adi?: string;
  malzeme_adi?: string;
  miktar?: number;
  birim?: string;
  kdv_orani?: number;
  yaklasik_maliyet_birim_fiyat?: number;
  tasinir_kodu?: string;
  okas_kodu?: string;
  aciklama?: string;
}

interface FirmaItem {
  temin_firma_id: number;
  id?: number;
  firma_id?: number;
  unvan?: string;
  vergi_no?: string;
  telefon?: string;
  email?: string;
  il?: string;
  teklif_durumu?: string;
  yasaklilik_durumu?: string;
  toplam_teklif?: number;
  kazanan_mi?: number;
}

interface PoolSummary {
  kalemCount: number;
  firmaCount: number;
  sampleKalemler: {
    id: number;
    kalem_adi: string;
    birim?: string;
    tasinir_kodu?: string;
  }[];
  sampleFirmalar: {
    id: number;
    unvan: string;
    il?: string;
    vergi_no?: string;
  }[];
}

export function DosyaHizliIcerikPopover({
  dosya,
  trigger,
  align = "end",
  side = "bottom",
}: DosyaHizliIcerikPopoverProps): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"malzemeler" | "firmalar">(
    "malzemeler",
  );

  const { setActiveDosyaId } = useWorkspaceStore();
  const navigate = useNavigate();

  // 1. Fetch Items for this dossier
  const { data: kalemler = [], isLoading: isLoadingKalemler } = useQuery<
    KalemItem[]
  >({
    queryKey: ["popover_kalemler", dosya?.id],
    queryFn: async () => {
      if (!dosya?.id || !window.electron) return [];
      const res = await window.electron.ipcRenderer.invoke(
        "db:query",
        `SELECT tk.*, COALESCE(NULLIF(tk.kalem_adi, ''), tk.malzeme_adi) as kalem_adi 
         FROM DATA_TeminKalem tk 
         WHERE tk.temin_dosya_id = ? 
         ORDER BY COALESCE(tk.sira_no, tk.id) ASC`,
        [dosya.id],
      );
      return res?.success && Array.isArray(res.data) ? res.data : [];
    },
    enabled: open && !!dosya?.id,
  });

  // 2. Fetch Firms and calculate proposal totals for this dossier
  const { data: firmalar = [], isLoading: isLoadingFirmalar } = useQuery<
    FirmaItem[]
  >({
    queryKey: ["popover_firmalar", dosya?.id],
    queryFn: async () => {
      if (!dosya?.id || !window.electron) return [];
      const res = await window.electron.ipcRenderer.invoke(
        "db:query",
        `SELECT 
           df.id as temin_firma_id,
           df.id,
           df.firma_id,
           df.teklif_durumu,
           df.yasaklilik_durumu,
           COALESCE(NULLIF(df.unvan, ''), NULLIF(f.unvan, ''), 'İstekli Firma') as unvan,
           f.vergi_no,
           f.telefon,
           f.email,
           f.il,
           (
             SELECT SUM(COALESCE(tkt.birim_fiyat, 0) * COALESCE(tk.miktar, 1))
             FROM DATA_TeminKalemTeklif tkt
             LEFT JOIN DATA_TeminKalem tk ON tkt.temin_kalem_id = tk.id
             WHERE tkt.temin_firma_id = df.id
           ) as toplam_teklif
         FROM DATA_TeminFirma df 
         LEFT JOIN TANIM_Firma f ON df.firma_id = f.id 
         WHERE df.temin_dosya_id = ? AND (df.aktif_mi IS NULL OR df.aktif_mi = 1)
         ORDER BY df.id ASC`,
        [dosya.id],
      );
      return res?.success && Array.isArray(res.data) ? res.data : [];
    },
    enabled: open && !!dosya?.id,
  });

  // 3. Fetch System Pool Summary (Registered general materials & firms)
  const { data: poolData } = useQuery<PoolSummary>({
    queryKey: ["popover_system_pool"],
    queryFn: async () => {
      if (!window.electron) {
        return {
          kalemCount: 0,
          firmaCount: 0,
          sampleKalemler: [],
          sampleFirmalar: [],
        };
      }
      try {
        const [kRes, fRes, kSample, fSample] = await Promise.all([
          window.electron.ipcRenderer.invoke(
            "db:query",
            "SELECT COUNT(*) as count FROM TANIM_Kalem WHERE aktif_mi = 1",
          ),
          window.electron.ipcRenderer.invoke(
            "db:query",
            "SELECT COUNT(*) as count FROM TANIM_Firma WHERE aktif_mi = 1",
          ),
          window.electron.ipcRenderer.invoke(
            "db:query",
            "SELECT id, kalem_adi, birim, tasinir_kodu FROM TANIM_Kalem WHERE aktif_mi = 1 ORDER BY id DESC LIMIT 3",
          ),
          window.electron.ipcRenderer.invoke(
            "db:query",
            "SELECT id, unvan, il, vergi_no FROM TANIM_Firma WHERE aktif_mi = 1 ORDER BY id DESC LIMIT 3",
          ),
        ]);
        return {
          kalemCount: kRes?.success && kRes.data?.[0]?.count
            ? Number(kRes.data[0].count)
            : 0,
          firmaCount: fRes?.success && fRes.data?.[0]?.count
            ? Number(fRes.data[0].count)
            : 0,
          sampleKalemler: kSample?.success && Array.isArray(kSample.data)
            ? kSample.data
            : [],
          sampleFirmalar: fSample?.success && Array.isArray(fSample.data)
            ? fSample.data
            : [],
        };
      } catch {
        return {
          kalemCount: 0,
          firmaCount: 0,
          sampleKalemler: [],
          sampleFirmalar: [],
        };
      }
    },
    enabled: open,
    staleTime: 60000,
  });

  const isLoading = isLoadingKalemler || isLoadingFirmalar;

  const handleOpenDosya = (e: React.MouseEvent): void => {
    e.stopPropagation();
    setOpen(false);
    setActiveDosyaId(dosya.id);
    navigate({ to: "/takip" });
  };

  const formatMoney = (val?: number | null): string => {
    if (!val) return "0,00";
    return Number(val).toLocaleString("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const totalQuantity = kalemler.reduce(
    (acc, k) => acc + (Number(k.miktar) || 0),
    0,
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="inline-flex"
        >
          {trigger || (
            <button
              type="button"
              className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-all cursor-pointer group"
              title="Malzeme Listesi ve İstekli Firmalar Özeti"
            >
              <Package
                size={14}
                className="group-hover:scale-110 transition-transform"
              />
            </button>
          )}
        </div>
      </PopoverTrigger>

      <PopoverContent
        align={align}
        side={side}
        sideOffset={6}
        className="w-[420px] max-w-[95vw] p-0 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xl z-[100] overflow-hidden text-slate-800 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bölümü */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-950/90 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
              <span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                {dosya.temin_no || `DT-${dosya.id}`}
              </span>
              {dosya.birim_adi && (
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold truncate max-w-[170px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                  {dosya.birim_adi}
                </span>
              )}
              {dosya.tur && (
                <span className="text-[9px] uppercase font-bold text-slate-500 dark:text-slate-400 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                  {dosya.tur}
                </span>
              )}
            </div>
            <h4
              className="text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug"
              title={dosya.konu}
            >
              {dosya.konu}
            </h4>
          </div>

          <button
            onClick={() => setOpen(false)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            <X size={14} />
          </button>
        </div>

        {/* Tab Butonları */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 px-3 pt-2 gap-3 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("malzemeler")}
            className={cn(
              "pb-2 px-1 font-bold flex items-center gap-1.5 transition-all relative cursor-pointer text-xs",
              activeTab === "malzemeler"
                ? "text-blue-600 dark:text-blue-400"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300",
            )}
          >
            <Package size={14} />
            <span>Malzeme & Kalemler</span>
            <span
              className={cn(
                "text-[10px] px-1.5 py-0.2 rounded-full font-extrabold",
                kalemler.length > 0
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300"
                  : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
              )}
            >
              {kalemler.length}
            </span>
            {activeTab === "malzemeler" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("firmalar")}
            className={cn(
              "pb-2 px-1 font-bold flex items-center gap-1.5 transition-all relative cursor-pointer text-xs",
              activeTab === "firmalar"
                ? "text-blue-600 dark:text-blue-400"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300",
            )}
          >
            <Users size={14} />
            <span>İstekli Firmalar</span>
            <span
              className={cn(
                "text-[10px] px-1.5 py-0.2 rounded-full font-extrabold",
                firmalar.length > 0
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300"
                  : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
              )}
            >
              {firmalar.length}
            </span>
            {activeTab === "firmalar" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full" />
            )}
          </button>
        </div>

        {/* İçerik Alanı */}
        <div className="max-h-[290px] overflow-y-auto custom-scrollbar p-3 space-y-2.5">
          {isLoading
            ? (
              <div className="py-10 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span>Veriler yükleniyor...</span>
              </div>
            )
            : activeTab === "malzemeler"
            ? (
              kalemler.length === 0
                ? (
                  <div className="space-y-3">
                    {/* Empty Alert Card */}
                    <div className="p-3.5 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-center">
                      <Package
                        size={26}
                        className="mx-auto text-slate-300 dark:text-slate-600 mb-1.5"
                      />
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Bu dosyada henüz kayıtlı kalem bulunmuyor.
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Dosya içerisine girerek manuel veya kütüphaneden kalem
                        ekleyebilirsiniz.
                      </p>

                      <button
                        type="button"
                        onClick={handleOpenDosya}
                        className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 rounded-xl text-[11px] font-bold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors cursor-pointer"
                      >
                        <PlusCircle size={13} />
                        <span>Dosyayı Aç & Kalem Ekle</span>
                      </button>
                    </div>

                    {/* System Pool Hint & Preview */}
                    {poolData && poolData.kalemCount > 0 && (
                      <div className="p-2.5 rounded-xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-100/60 dark:border-blue-900/40">
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1">
                            <Sparkles size={11} className="text-blue-500" />
                            Sistem Kütüphanesi ({poolData.kalemCount}{" "}
                            Kalem Mevcut)
                          </span>
                          <span className="text-[9px] text-slate-400">
                            Referans
                          </span>
                        </div>
                        <div className="space-y-1">
                          {poolData.sampleKalemler.map((sk) => (
                            <div
                              key={sk.id}
                              className="flex items-center justify-between text-[10px] p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/70"
                            >
                              <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                                {sk.kalem_adi}
                              </span>
                              <span className="text-slate-400 shrink-0 font-mono">
                                {sk.birim || "Adet"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
                : (
                  <div className="space-y-1.5">
                    {/* Summary Header */}
                    <div className="flex items-center justify-between px-1 text-[10px] text-slate-500 font-semibold">
                      <span>Toplam {kalemler.length} Kalem Listeleniyor</span>
                      {totalQuantity > 0 && (
                        <span className="text-blue-600 dark:text-blue-400 font-bold">
                          Toplam Miktar: {totalQuantity}
                        </span>
                      )}
                    </div>

                    {kalemler.map((kalem, idx) => (
                      <div
                        key={kalem.id || idx}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80 text-xs hover:border-blue-200 dark:hover:border-blue-800 transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 flex items-center justify-center text-[10px] font-black shrink-0">
                            {kalem.sira_no || idx + 1}
                          </span>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 dark:text-slate-200 truncate text-[11px]">
                              {kalem.kalem_adi || kalem.malzeme_adi ||
                                "İsimsiz Kalem"}
                            </p>
                            <div className="flex items-center gap-2 text-[9px] text-slate-400 mt-0.5">
                              {kalem.tasinir_kodu && (
                                <span className="font-mono bg-slate-200/50 dark:bg-slate-800 px-1 rounded">
                                  TK: {kalem.tasinir_kodu}
                                </span>
                              )}
                              {kalem.okas_kodu && (
                                <span className="font-mono bg-slate-200/50 dark:bg-slate-800 px-1 rounded">
                                  OKAS: {kalem.okas_kodu}
                                </span>
                              )}
                              {kalem.aciklama && (
                                <span
                                  className="truncate max-w-[140px]"
                                  title={kalem.aciklama}
                                >
                                  {kalem.aciklama}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-extrabold text-blue-600 dark:text-blue-400 text-xs font-mono">
                            {kalem.miktar || 1} {kalem.birim || "Adet"}
                          </span>
                          {kalem.kdv_orani !== undefined &&
                            kalem.kdv_orani !== null && (
                            <span className="block text-[9px] text-slate-400">
                              %{kalem.kdv_orani} KDV
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )
            )
            : firmalar.length === 0
            ? (
              <div className="space-y-3">
                {/* Empty Alert Card */}
                <div className="p-3.5 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-center">
                  <Building2
                    size={26}
                    className="mx-auto text-slate-300 dark:text-slate-600 mb-1.5"
                  />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Bu dosyaya henüz istekli firma eklenmemiş.
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Piyasa fiyat araştırması veya teklif mektubu için firma
                    tanımlayabilirsiniz.
                  </p>

                  <button
                    type="button"
                    onClick={handleOpenDosya}
                    className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 rounded-xl text-[11px] font-bold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors cursor-pointer"
                  >
                    <PlusCircle size={13} />
                    <span>Dosyayı Aç & Firma Ata</span>
                  </button>
                </div>

                {/* System Pool Hint & Preview */}
                {poolData && poolData.firmaCount > 0 && (
                  <div className="p-2.5 rounded-xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-100/60 dark:border-blue-900/40">
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1">
                        <Sparkles size={11} className="text-blue-500" />
                        Firma Rehberi ({poolData.firmaCount} Kayıtlı Firma)
                      </span>
                      <span className="text-[9px] text-slate-400">Havuz</span>
                    </div>
                    <div className="space-y-1">
                      {poolData.sampleFirmalar.map((sf) => (
                        <div
                          key={sf.id}
                          className="flex items-center justify-between text-[10px] p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/70"
                        >
                          <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                            {sf.unvan}
                          </span>
                          <span className="text-slate-400 shrink-0 text-[9px]">
                            {sf.il || sf.vergi_no || "Tedarikçi"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
            : (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between px-1 text-[10px] text-slate-500 font-semibold">
                  <span>Toplam {firmalar.length} Firma Bulundu</span>
                </div>

                {firmalar.map((firma, idx) => (
                  <div
                    key={firma.temin_firma_id || firma.id || idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80 text-xs hover:border-blue-200 dark:hover:border-blue-800 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/50">
                        <Building2 size={13} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 dark:text-slate-200 truncate text-[11px]">
                          {firma.unvan || `Firma #${firma.id}`}
                        </p>
                        <div className="flex items-center gap-2 text-[9px] text-slate-400 mt-0.5">
                          {firma.vergi_no && (
                            <span className="font-mono">
                              VN: {firma.vergi_no}
                            </span>
                          )}
                          {firma.il && <span>{firma.il}</span>}
                          {firma.teklif_durumu && (
                            <span className="bg-slate-200/60 dark:bg-slate-800 px-1 py-0.2 rounded font-medium text-slate-600 dark:text-slate-300">
                              {firma.teklif_durumu}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {firma.toplam_teklif && Number(firma.toplam_teklif) > 0
                        ? (
                          <div>
                            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                              ₺{formatMoney(firma.toplam_teklif)}
                            </span>
                            <span className="block text-[8px] text-slate-400 font-semibold">
                              Toplam Teklif
                            </span>
                          </div>
                        )
                        : (
                          <span className="text-[10px] text-slate-400 italic">
                            Teklif bekleniyor
                          </span>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>

        {/* Alt Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950/90 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <TrendingUp size={13} className="text-emerald-500" />
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-400 font-medium">
                Yaklaşık Maliyet
              </span>
              <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-xs">
                ₺{formatMoney(dosya.yaklasik_maliyet)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenDosya}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all cursor-pointer text-xs shadow-xs hover:shadow-md"
          >
            <span>Dosyayı Aç</span>
            <ChevronRight size={13} />
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

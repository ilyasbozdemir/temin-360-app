import React, { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Briefcase,
  Building2,
  Check,
  CheckCircle2,
  Code,
  Copy,
  DollarSign,
  Edit,
  ExternalLink,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Info,
  Layers,
  ShieldCheck,
  Tag,
  Users,
  X,
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { useGlobalDocumentPreviewStore } from "../../../store/globalDocumentPreviewStore";
import { useTabStore } from "../../../store/tabStore";
import { useNavigate } from "@tanstack/react-router";
import { exportDogrudanTeminMasterExcel } from "../../../services/excelExportService";

interface DosyaDataInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  dosya: any;
}

type TabType =
  | "genel"
  | "kunye"
  | "kalemler"
  | "firmalar"
  | "komisyon"
  | "rawjson";

export const DosyaDataInspectorModal: React.FC<DosyaDataInspectorModalProps> = (
  {
    isOpen,
    onClose,
    dosya,
  },
) => {
  const [activeTab, setActiveTab] = useState<TabType>("genel");
  const [copied, setCopied] = useState(false);
  const [fullDosya, setFullDosya] = useState<any>(dosya);
  const [subData, setSubData] = useState<{
    kalemler: any[];
    firmalar: any[];
    teklifler: any[];
    komisyon: any[];
    sablonVeri: any[];
  }>({
    kalemler: [],
    firmalar: [],
    teklifler: [],
    komisyon: [],
    sablonVeri: [],
  });
  const [, setLoading] = useState(false);

  const { openDocument } = useGlobalDocumentPreviewStore();
  const { addTab } = useTabStore();
  const navigate = useNavigate();

  const loadSubData = useCallback(async (dosyaId: number) => {
    setLoading(true);
    try {
      const [dRes, kRes, fRes, tRes, komRes, sRes] = await Promise.all([
        window.electron.ipcRenderer.invoke(
          "db:query",
          `SELECT d.*, 
                  b.birim_adi, 
                  p_irt.ad_soyad as irtibat_ad,
                  p_onay.ad_soyad as onaylayan_ad,
                  p_sunan.ad_soyad as sunan_ad,
                  p_haz.ad_soyad as hazirlayan_ad,
                  p_talep.ad_soyad as talep_eden_ad
           FROM DATA_TeminDosyasi d
           LEFT JOIN TANIM_Birim b ON d.birim_id = b.id
           LEFT JOIN TANIM_Personel p_irt ON d.irtibat_yetkilisi_id = p_irt.id
           LEFT JOIN TANIM_Personel p_onay ON d.onaylayan_yetkili_id = p_onay.id
           LEFT JOIN TANIM_Personel p_sunan ON d.sunan_gorevli_id = p_sunan.id
           LEFT JOIN TANIM_Personel p_haz ON d.piyasa_arastirma_gorevlisi_id = p_haz.id
           LEFT JOIN TANIM_Personel p_talep ON d.talep_eden_personel_id = p_talep.id
           WHERE d.id = ?`,
          [dosyaId],
        ),
        window.electron.ipcRenderer.invoke(
          "db:query",
          "SELECT * FROM DATA_TeminKalem WHERE temin_dosya_id = ? ORDER BY id ASC",
          [dosyaId],
        ),
        window.electron.ipcRenderer.invoke(
          "db:query",
          "SELECT tf.*, f.unvan, f.vergi_no, f.telefon, f.yetkili FROM DATA_TeminFirma tf LEFT JOIN TANIM_Firma f ON tf.firma_id = f.id WHERE tf.temin_dosya_id = ?",
          [dosyaId],
        ),
        window.electron.ipcRenderer.invoke(
          "db:query",
          "SELECT * FROM DATA_TeminKalemTeklif WHERE temin_dosya_id = ?",
          [dosyaId],
        ),
        window.electron.ipcRenderer.invoke(
          "db:query",
          "SELECT tk.*, p.ad_soyad, p.unvan as personel_unvan, tk.gorev as gorev_adi FROM DATA_TeminKomisyon tk LEFT JOIN TANIM_Personel p ON tk.personel_id = p.id WHERE tk.temin_dosya_id = ? ORDER BY tk.id ASC",
          [dosyaId],
        ),
        window.electron.ipcRenderer.invoke(
          "db:query",
          "SELECT * FROM DATA_DosyaSablonVeri WHERE temin_dosya_id = ?",
          [dosyaId],
        ),
      ]);

      if (dRes?.success && dRes.data.length > 0) {
        setFullDosya(dRes.data[0]);
      } else {
        setFullDosya(dosya);
      }

      setSubData({
        kalemler: kRes?.success ? kRes.data : [],
        firmalar: fRes?.success ? fRes.data : [],
        teklifler: tRes?.success ? tRes.data : [],
        komisyon: komRes?.success ? komRes.data : [],
        sablonVeri: sRes?.success ? sRes.data : [],
      });
    } catch (err) {
      console.error("Dosya detayları yüklenirken hata:", err);
      setFullDosya(dosya);
    } finally {
      setLoading(false);
    }
  }, [dosya]);

  useEffect(() => {
    if (isOpen && dosya?.id && window.electron) {
      loadSubData(dosya.id);
    }
  }, [isOpen, dosya?.id, loadSubData]);

  if (!isOpen || !dosya) return null;

  const d = fullDosya || dosya;

  const fullPayload = {
    dosya: d,
    ...subData,
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(fullPayload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatMoney = (val: any): string => {
    const num = Number(val);
    if (isNaN(num) || num === 0) return "0,00";
    return num.toLocaleString("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (val: string | null | undefined): string => {
    if (!val) return "-";
    try {
      const date = new Date(val);
      if (isNaN(date.getTime())) return val;
      return date.toLocaleDateString("tr-TR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch {
      return val;
    }
  };

  const turLabelMap: Record<string, string> = {
    mal: "Mal Alımı",
    hizmet: "Hizmet Alımı",
    yapim_isi: "Yapım İşi",
    danismanlik: "Danışmanlık",
    hakedis: "Hakediş Dosyası",
  };

  const statusLabelMap: Record<string, string> = {
    devam_ediyor: "Devam Ediyor",
    tamamlandi: "Tamamlandı",
    iptal: "İptal Edildi",
  };

  const toplamYaklasikMaliyet = subData.kalemler.reduce(
    (acc, cur) => acc + Number(cur.yaklasik_maliyet_toplam || 0),
    0,
  ) || Number(d.yaklasik_maliyet || 0);

  if (!isOpen || !dosya) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-5xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col border border-slate-200/80 dark:border-slate-800 overflow-hidden ring-1 ring-slate-900/10 dark:ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER (Kompakt & Net) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950 shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shrink-0 font-black text-sm tracking-wider">
              DT
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200">
                  {d.temin_no
                    ? `DT-${d.butce_yili || "2026"}/${d.temin_no}`
                    : `#${d.id}`}
                </span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate max-w-lg">
                  {d.konu || "Dosya Künyesi"}
                </span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  {statusLabelMap[d.status] || "Devam Ediyor"}
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                Birim:{" "}
                <strong className="text-slate-700 dark:text-slate-300">
                  {d.birim_adi || d.harcama_birimi || "Belirtilmemiş"}
                </strong>{" "}
                • Tür:{" "}
                <strong className="text-slate-700 dark:text-slate-300">
                  {turLabelMap[d.tur] || "Mal"}
                </strong>{" "}
                • Bütçe Yılı:{" "}
                <strong className="text-slate-700 dark:text-slate-300">
                  {d.butce_yili || "2026"}
                </strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                exportDogrudanTeminMasterExcel({
                  dosya: d,
                  kalemler: subData.kalemler,
                  firmalar: subData.firmalar,
                  teklifler: subData.teklifler,
                  komisyon: subData.komisyon,
                });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all text-xs font-bold cursor-pointer shadow-xs active:scale-95"
              title="Master Excel İndir (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Master Excel
            </button>
            <button
              onClick={() => {
                onClose();
                addTab(`/dosyalar/yeni?id=${d.id}`);
                navigate({ to: `/dosyalar/yeni?id=${d.id}` });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white transition-all text-xs font-bold cursor-pointer shadow-xs active:scale-95"
              title="Dosya Düzenleme Formuna Git"
            >
              <Edit className="w-3.5 h-3.5" />
              Düzenle
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TAB BAR (Kompakt & Sabit) */}
        <div className="flex items-center justify-between px-6 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <button
              onClick={() => setActiveTab("genel")}
              className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "genel"
                  ? "bg-blue-600 text-white font-bold shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Genel Bakış
            </button>
            <button
              onClick={() => setActiveTab("kunye")}
              className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "kunye"
                  ? "bg-blue-600 text-white font-bold shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Dosya Künyesi & Bütçe
            </button>
            <button
              onClick={() => setActiveTab("kalemler")}
              className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "kalemler"
                  ? "bg-blue-600 text-white font-bold shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              İhtiyaç Listesi ({subData.kalemler.length})
            </button>
            <button
              onClick={() => setActiveTab("firmalar")}
              className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "firmalar"
                  ? "bg-blue-600 text-white font-bold shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Firmalar & Teklifler ({subData.firmalar.length})
            </button>
            <button
              onClick={() => setActiveTab("komisyon")}
              className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "komisyon"
                  ? "bg-blue-600 text-white font-bold shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Komisyon ({subData.komisyon.length})
            </button>
            <button
              onClick={() => setActiveTab("rawjson")}
              className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "rawjson"
                  ? "bg-slate-800 text-white font-bold shadow-xs"
                  : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              JSON
            </button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyJson}
            className="text-xs h-7 gap-1 px-2.5 text-slate-500"
          >
            {copied
              ? <Check className="w-3.5 h-3.5 text-emerald-500" />
              : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Kopyalandı" : "Kopyala"}
          </Button>
        </div>

        {/* MODAL BODY (Kaydırılabilir & Dengeli Yerleşim) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* TAB 0: GENEL BAKIŞ (360 DERECE TÜM VERİLERİ ORTAYA ALAN GÖRÜNÜM) */}
          {activeTab === "genel" && (
            <div className="space-y-5 text-xs">
              {/* ÜST KPI KARTLARI */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20">
                  <span className="text-[10.5px] font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
                    Yaklaşık Maliyet
                  </span>
                  <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 block">
                    ₺{formatMoney(toplamYaklasikMaliyet)}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    KDV Hariç Toplam
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20">
                  <span className="text-[10.5px] font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
                    İhtiyaç Kalemleri
                  </span>
                  <span className="text-base font-black text-blue-600 dark:text-blue-400 font-mono mt-0.5 block">
                    {subData.kalemler.length} Kalem
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Malzeme / Hizmet
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20">
                  <span className="text-[10.5px] font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
                    İstekli Firmalar
                  </span>
                  <span className="text-base font-black text-purple-600 dark:text-purple-400 font-mono mt-0.5 block">
                    {subData.firmalar.length} Firma
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {subData.teklifler.length} Birim Teklif
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20">
                  <span className="text-[10.5px] font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
                    Komisyon / Görevli
                  </span>
                  <span className="text-base font-black text-amber-600 dark:text-amber-400 font-mono mt-0.5 block">
                    {subData.komisyon.length} Üye
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Piyasa / Muayene
                  </span>
                </div>
              </div>

              {/* HIZLI ÖZET VE DETAY MATRİSİ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* SOL: Dosya & Süreç Özeti */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
                  <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-blue-600" />
                      Temel Dosya Bilgileri
                    </span>
                    <button
                      onClick={() => setActiveTab("kunye")}
                      className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
                    >
                      Tümünü Gör →
                    </button>
                  </div>
                  <div className="p-4 space-y-2.5 text-xs divide-y divide-slate-100 dark:divide-slate-800/60">
                    <div className="flex justify-between items-center pt-1 first:pt-0">
                      <span className="text-slate-500">Dosya No:</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {d.temin_no
                          ? `DT-${d.butce_yili || "2026"}/${d.temin_no}`
                          : `#${d.id}`}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-slate-500">Harcama Birimi:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-xs">
                        {d.birim_adi || d.harcama_birimi || "Belirtilmemiş"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-slate-500">
                        KİK Maddesi / Usul:
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {d.ihale_sekli || "4734 Sayılı KİK Md. 22/d"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-slate-500">Bütçe Kodu / Yılı:</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {d.butce_yili || "2026"} /{" "}
                        {d.butce_kodu || d.ekonomik_kod || "03.2"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-slate-500">Sözleşme Durumu:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {d.sozlesme_yapilacak_mi
                          ? "Sözleşme Yapılacak"
                          : "Sözleşme Yapılmayacak"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* SAĞ: İhtiyaç Listesi Hızlı Önizleme */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
                  <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                      İhtiyaç Kalemleri ({subData.kalemler.length})
                    </span>
                    <button
                      onClick={() => setActiveTab("kalemler")}
                      className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
                    >
                      Detaylı Tablo →
                    </button>
                  </div>
                  <div className="p-3">
                    {subData.kalemler.length === 0
                      ? (
                        <div className="p-6 text-center text-slate-400 text-xs italic">
                          Henüz kalem eklenmemiş.
                        </div>
                      )
                      : (
                        <div className="space-y-2">
                          {subData.kalemler.slice(0, 4).map((k, idx) => (
                            <div
                              key={k.id || idx}
                              className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                            >
                              <div className="min-w-0 pr-2">
                                <span className="font-bold text-slate-800 dark:text-slate-200 block truncate text-xs">
                                  {k.kalem_adi}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {k.miktar}{" "}
                                  {k.olcu_birimi || k.birim || "Adet"}
                                </span>
                              </div>
                              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs whitespace-nowrap">
                                ₺{formatMoney(k.yaklasik_maliyet_toplam)}
                              </span>
                            </div>
                          ))}
                          {subData.kalemler.length > 4 && (
                            <div className="text-center pt-1 text-[11px] text-slate-400">
                              +{subData.kalemler.length - 4}{" "}
                              diğer kalem daha mevcut
                            </div>
                          )}
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: KÜNYE (RESMİ DOSYA ÖZET FİŞİ) */}
          {activeTab === "kunye" && (
            <div className="space-y-4 text-xs">
              {/* ÜST 4'LÜ ÖZET SATIRI */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">
                    Yaklaşık Maliyet
                  </span>
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    ₺{formatMoney(toplamYaklasikMaliyet)}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">
                    İhale Usulü
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {d.ihale_sekli || "22/d* Doğrudan Temin"}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">
                    Açılış / Talep Tarihi
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {formatDate(d.acilis_tarihi || d.created_at)}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">
                    Son Teklif Tarihi
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {formatDate(d.son_teklif_tarihi)}
                  </span>
                </div>
              </div>

              {/* 2 SÜTUNLU ANA DETAY TABLOSU */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* SOL: İhale & Süreç Parametreleri */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                  <div className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 font-extrabold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                    <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                    İhale & Süreç Parametreleri
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    <div className="flex justify-between items-center px-3.5 py-2">
                      <span className="text-slate-500">Alım Türü</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {turLabelMap[d.tur] || "Mal Alımı"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center px-3.5 py-2">
                      <span className="text-slate-500">
                        KİK Dayanağı / Madde
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {d.ihale_sekli || "22/d*"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center px-3.5 py-2">
                      <span className="text-slate-500">
                        Teklif & Sözleşme Türü
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {d.teklif_sozlesme_turu || "Birim Fiyat"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center px-3.5 py-2">
                      <span className="text-slate-500">Sözleşme Düzenleme</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {d.sozlesme_yapilacak_mi
                          ? "Sözleşme Yapılacak"
                          : "Sözleşme Yapılmayacak"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center px-3.5 py-2">
                      <span className="text-slate-500">KDV Oranı</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        %{d.kdv || "20"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center px-3.5 py-2">
                      <span className="text-slate-500">
                        Kısmi Teklif Durumu
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {d.kismi_teklif_verilecek_mi
                          ? "Kısmi Teklife Açık"
                          : "Kısmi Teklife Kapalı"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center px-3.5 py-2">
                      <span className="text-slate-500">Fiyat Farkı</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {d.fiyat_farki_dayanagi || "Ödenmeyecek"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center px-3.5 py-2">
                      <span className="text-slate-500">
                        Karar / Temin Tarihi
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {formatDate(d.temin_tarihi)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* SAĞ: İdari Birim ve Görevli Personeller */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                  <div className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 font-extrabold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                    <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                    İdari Birim & Görevliler
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    <div className="flex justify-between items-center px-3.5 py-2">
                      <span className="text-slate-500">Talep Eden Birim</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                        {d.birim_adi || d.harcama_birimi || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center px-3.5 py-2">
                      <span className="text-slate-500">İhtiyaç Yeri</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                        {d.ihtiyac_yeri || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center px-3.5 py-2">
                      <span className="text-slate-500">İrtibat Yetkilisi</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {d.irtibat_ad || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center px-3.5 py-2">
                      <span className="text-slate-500">
                        Harcama Yetkilisi (Onaylayan)
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {d.onaylayan_ad || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center px-3.5 py-2">
                      <span className="text-slate-500">
                        Gerçekleştirme Görevlisi
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {d.sunan_ad || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center px-3.5 py-2">
                      <span className="text-slate-500">
                        Piyasa Araştırma Görevlisi
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {d.hazirlayan_ad || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center px-3.5 py-2">
                      <span className="text-slate-500">
                        Talep Eden Personel
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {d.talep_eden_ad || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center px-3.5 py-2">
                      <span className="text-slate-500">
                        Tahmini Teslim Tarihi
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {formatDate(d.teslim_tarihi)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* BÜTÇE & MUHASEBE TERTİP KODLARI (Kompakt 6'lı Satır) */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                <div className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 font-extrabold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                  <DollarSign className="w-3.5 h-3.5 text-amber-600" />
                  Bütçe & Muhasebe Tertip Kodları
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800 text-center p-2.5">
                  <div className="p-1.5">
                    <span className="text-[10px] text-slate-400 block font-bold">
                      Harcama Birimi
                    </span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-xs">
                      {d.harcama_birimi || "-"}
                    </span>
                  </div>
                  <div className="p-1.5">
                    <span className="text-[10px] text-slate-400 block font-bold">
                      Muhasebe Birimi
                    </span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-xs">
                      {d.muhasebe_birimi || "-"}
                    </span>
                  </div>
                  <div className="p-1.5">
                    <span className="text-[10px] text-slate-400 block font-bold">
                      Bütçe Kodu
                    </span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-xs">
                      {d.butce_kodu || "-"}
                    </span>
                  </div>
                  <div className="p-1.5">
                    <span className="text-[10px] text-slate-400 block font-bold">
                      Fonksiyonel Kod
                    </span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-xs">
                      {d.fonksiyonel_kod || "-"}
                    </span>
                  </div>
                  <div className="p-1.5">
                    <span className="text-[10px] text-slate-400 block font-bold">
                      Finansman Kodu
                    </span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-xs">
                      {d.finansman_kodu || "-"}
                    </span>
                  </div>
                  <div className="p-1.5">
                    <span className="text-[10px] text-slate-400 block font-bold">
                      Ekonomik Kod
                    </span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-xs">
                      {d.ekonomik_kod || "-"}
                    </span>
                  </div>
                </div>
              </div>

              {/* AÇIKLAMA / NOTLAR */}
              {d.notlar && (
                <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10.5px] font-bold text-blue-800 dark:text-blue-300 block">
                      Süreç Notu / Gerekçe:
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                      {d.notlar}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: KALEMLER & İHTİYAÇ LİSTESİ */}
          {activeTab === "kalemler" && (
            <div className="space-y-3">
              {subData.kalemler.length === 0
                ? (
                  <div className="p-8 text-center text-slate-400 text-xs italic">
                    Bu dosyaya henüz malzeme veya ihtiyaç kalemi eklenmemiş.
                  </div>
                )
                : (
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-extrabold text-[10px] uppercase border-b border-slate-200 dark:border-slate-700">
                          <th className="py-2 px-3 w-10 text-center">Sıra</th>
                          <th className="py-2 px-3">Kalem / Malzeme Adı</th>
                          <th className="py-2 px-3 text-right">Miktar</th>
                          <th className="py-2 px-3 text-center">Birim</th>
                          <th className="py-2 px-3 text-center">KDV</th>
                          <th className="py-2 px-3 text-right">
                            Yaklaşık Birim Fiyat
                          </th>
                          <th className="py-2 px-3 text-right">Toplam Tutar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {subData.kalemler.map((item, idx) => (
                          <tr
                            key={item.id || idx}
                            className="hover:bg-blue-50/30 dark:hover:bg-blue-950/20"
                          >
                            <td className="py-2 px-3 text-center text-slate-400 font-bold">
                              {item.sira_no || idx + 1}
                            </td>
                            <td className="py-2 px-3">
                              <span className="font-bold text-slate-800 dark:text-slate-200">
                                {item.kalem_adi}
                              </span>
                              {item.aciklama && (
                                <span className="text-[10px] text-slate-400 block">
                                  {item.aciklama}
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                              {item.miktar}
                            </td>
                            <td className="py-2 px-3 text-center text-slate-500">
                              {item.olcu_birimi || item.birim || "Adet"}
                            </td>
                            <td className="py-2 px-3 text-center text-slate-500">
                              %{item.kdv_orani || 20}
                            </td>
                            <td className="py-2 px-3 text-right font-mono">
                              {formatMoney(item.yaklasik_maliyet_birim)} ₺
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-blue-600 dark:text-blue-400">
                              {formatMoney(item.yaklasik_maliyet_toplam)} ₺
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-slate-50 dark:bg-slate-950 font-bold border-t border-slate-200 dark:border-slate-800">
                          <td
                            colSpan={6}
                            className="py-2.5 px-3 text-right text-slate-500 uppercase text-[11px]"
                          >
                            Toplam Yaklaşık Maliyet:
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-emerald-600 dark:text-emerald-400 text-xs font-black">
                            ₺{formatMoney(toplamYaklasikMaliyet)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
            </div>
          )}

          {/* TAB 3: FİRMALAR & TEKLİFLER */}
          {activeTab === "firmalar" && (
            <div className="space-y-3">
              {subData.firmalar.length === 0
                ? (
                  <div className="p-8 text-center text-slate-400 text-xs italic">
                    Bu dosyaya teklif isteyen firma atanmamış.
                  </div>
                )
                : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {subData.firmalar.map((f, idx) => (
                      <div
                        key={f.id || idx}
                        className={`p-3.5 rounded-xl border ${
                          f.kazandi_mi
                            ? "border-emerald-500/60 bg-emerald-50/20 dark:bg-emerald-950/20"
                            : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100">
                            {f.unvan || "Firma"}
                          </h4>
                          {f.kazandi_mi && (
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-600 text-white font-extrabold shrink-0">
                              Kazanan
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1 space-y-0.5">
                          <div>
                            Yetkili: <strong>{f.yetkili || "-"}</strong>
                          </div>
                          <div>
                            VN: <strong>{f.vergi_no || "-"}</strong> | Tel:{" "}
                            <strong>{f.telefon || "-"}</strong>
                          </div>
                        </div>
                        <div className="mt-2.5 pt-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                          <span className="text-slate-500 font-bold">
                            Teklif Tutarı:
                          </span>
                          <span className="font-mono font-black text-slate-850 dark:text-slate-100">
                            ₺{formatMoney(f.toplam_teklif_tutari)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          )}

          {/* TAB 4: KOMİSYON */}
          {activeTab === "komisyon" && (
            <div className="space-y-3">
              {subData.komisyon.length === 0
                ? (
                  <div className="p-8 text-center text-slate-400 text-xs italic">
                    Komisyon üyesi veya piyasa araştırma görevlisi atanmamış.
                  </div>
                )
                : (
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-extrabold text-[10px] uppercase border-b border-slate-200 dark:border-slate-700">
                          <th className="py-2 px-3 w-10 text-center">Sıra</th>
                          <th className="py-2 px-3">Adı Soyadı</th>
                          <th className="py-2 px-3">Kurum Ünvanı</th>
                          <th className="py-2 px-3">Görevi</th>
                          <th className="py-2 px-3 text-center">Durum</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {subData.komisyon.map((k, idx) => (
                          <tr
                            key={k.id || idx}
                            className="hover:bg-slate-50 dark:hover:bg-slate-800/40"
                          >
                            <td className="py-2 px-3 text-center text-slate-400 font-bold">
                              {k.sira || idx + 1}
                            </td>
                            <td className="py-2 px-3 font-bold text-slate-800 dark:text-slate-200">
                              {k.ad_soyad}
                            </td>
                            <td className="py-2 px-3 text-slate-500">
                              {k.personel_unvan || "-"}
                            </td>
                            <td className="py-2 px-3 font-bold text-blue-600 dark:text-blue-400">
                              {k.gorev_adi || k.gorev_kod || "-"}
                            </td>
                            <td className="py-2 px-3 text-center">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                {k.asl_yedek || "ASIL"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
            </div>
          )}

          {/* TAB 5: JSON */}
          {activeTab === "rawjson" && (
            <pre className="p-4 bg-slate-950 text-slate-100 rounded-xl font-mono text-xs overflow-auto max-h-[50vh] border border-slate-800 select-all">
              {JSON.stringify(fullPayload, null, 2)}
            </pre>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="px-5 py-2.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                addTab("/takip");
                navigate({ to: "/takip" });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-blue-500" />
              Süreç Takip Paneline Git
            </button>
            <button
              onClick={() => {
                onClose();
                openDocument({
                  documentId: "arastirma-mektubu",
                  dosyaId: d.id,
                  documentTitle: "Piyasa Fiyat Araştırma Mektubu",
                });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Araştırma Mektubu
            </button>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 dark:bg-slate-200 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold transition-all cursor-pointer"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bot,
  Building2,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Coins,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Gavel,
  Landmark,
  Layers,
  PieChart,
  Plus,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

import { useSettingsStore } from "../../store/settingsStore";
import { useWorkspaceStore } from "../../store/workspaceStore";
import {
  useAnnouncements,
  useDashboardStats,
  useSmartAlerts,
} from "./dashboard.hooks";
import { useDosyalarHooks } from "../dosyalar/dosyalar.hooks";
import { useAyarlarHooks } from "../ayarlar/ayarlar.hooks";
import { logActivity } from "../../utils/logger";
import { formatDosyaNo } from "../../utils/formatDosyaNo";
import { AITextGeneratorModal } from "../../components/ui/AITextGeneratorModal";
import { TakipScreen } from "../system/TakipScreen";
import { cn } from "../../utils/cn";

export default function DashboardScreenV2(): React.JSX.Element {
  const navigate = useNavigate();
  const {
    institutionName,
    limitType,
    institutionType,
    kurumsalKod,
    fonksiyonelKod,
    muhasebeBirimAdi,
    harcamaBirimAdi,
    adminName,
    adminTitle,
    adminUsername,
  } = useSettingsStore();

  const { activeDosyaId, setActiveDosyaId } = useWorkspaceStore();

  // Mod Seçici Durumu: 'dogrudan_temin' (KİK 22), 'ihale' (KİK 19/21) veya 'all'
  const [procurementMode, setProcurementMode] = useState<
    "dogrudan_temin" | "ihale" | "all"
  >(() => {
    return (
      (localStorage.getItem("temin_procurement_mode") as
        | "dogrudan_temin"
        | "ihale") || "dogrudan_temin"
    );
  });

  const isDt = procurementMode === "dogrudan_temin";
  const isIhale = procurementMode === "ihale";

  // Header veya diğer bileşenlerden gelen mod değişimlerini dinle
  useEffect(() => {
    const handleModeChange = (e: any): void => {
      if (e.detail?.mode) {
        setProcurementMode(e.detail.mode);
      }
    };
    window.addEventListener("procurement-mode-change", handleModeChange);
    return () => {
      window.removeEventListener("procurement-mode-change", handleModeChange);
    };
  }, []);

  const switchProcurementMode = (mode: "dogrudan_temin" | "ihale" | "all"): void => {
    setProcurementMode(mode);
    if (mode !== "all") {
      localStorage.setItem("temin_procurement_mode", mode);
      window.dispatchEvent(
        new CustomEvent("procurement-mode-change", {
          detail: { mode },
        }),
      );
    }
  };

  const { stats, isLoading } = useDashboardStats(procurementMode);
  const { announcements, isLoading: isAnnouncementsLoading } =
    useAnnouncements();
  const { dosyalar } = useDosyalarHooks();
  const { settings } = useAyarlarHooks();
  const isMailConfigured = !!settings.smtp_host;

  const [showAIModal, setShowAIModal] = useState(false);
  const [selectedFileForAI, setSelectedFileForAI] = useState<any>(null);
  const [activePillar, setActivePillar] = useState<
    "T" | "E" | "M" | "I" | "N"
  >("T");
  const [searchTerm, setSearchTerm] = useState("");

  // Zaman tabanlı karşılama
  const greeting = (() => {
    const hours = new Date().getHours();
    if (hours >= 6 && hours < 12) return "Günaydın";
    if (hours >= 12 && hours < 18) return "İyi Günler";
    if (hours >= 18 && hours < 23) return "İyi Akşamlar";
    return "İyi Geceler";
  })();

  const currentDate = new Intl.DateTimeFormat("tr-TR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());

  // Kurum Türü Başlığı
  const getInstitutionTypeLabel = (type: string): string => {
    switch (type) {
      case "belediye":
        return "Belediye / Mahalli İdare";
      case "genel_butce":
        return "Bakanlık / Genel Bütçe";
      case "ozel_butce":
        return "Üniversite / Özel Bütçe";
      case "duzenleyici":
        return "Düzenleyici / Denetleyici Kurum";
      case "diger":
        return "Diğer Kurum";
      default:
        return "Kurum Tipi Belirtilmedi";
    }
  };
  const kurumTuruLabel = getInstitutionTypeLabel(institutionType || "");

  // Para Biçimlendirme
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  // 4734 Sayılı Kanun Madde 22/d KİK Eşik Değeri
  const kikLimit = limitType === "buyuksehir" ? 1021827 : 340391;

  // Bütçe / Harcama Tür Dağılımı
  const totalCat = (stats.malYaklasikMaliyet || 0) +
      (stats.hizmetYaklasikMaliyet || 0) +
      (stats.yapimYaklasikMaliyet || 0) +
      (stats.danismanlikYaklasikMaliyet || 0) || 1;
  const malPct = Math.round(((stats.malYaklasikMaliyet || 0) / totalCat) * 100);
  const hizmetPct = Math.round(
    ((stats.hizmetYaklasikMaliyet || 0) / totalCat) * 100,
  );
  const yapimPct = Math.round(
    ((stats.yapimYaklasikMaliyet || 0) / totalCat) * 100,
  );
  const danismanlikPct = Math.max(0, 100 - malPct - hizmetPct - yapimPct);

  // Asamalar Sorgusu
  const fetchAsamalar = async (): Promise<any[]> => {
    const res = await window.electron.ipcRenderer.invoke(
      "db:query",
      "SELECT * FROM TANIM_Asama WHERE aktif_mi = 1 ORDER BY asama_sira ASC",
    );
    if (!res.success) throw new Error(res.error);
    return res.data;
  };

  const { data: asamalar = [] } = useQuery<any[]>({
    queryKey: ["asamalar_dashboard_v2"],
    queryFn: fetchAsamalar,
  });

  // Harcama Yetkilisi
  const fetchHarcamaYetkilisi = async (): Promise<
    { ad_soyad: string; unvan: string | null } | null
  > => {
    const res = await window.electron.ipcRenderer.invoke(
      "db:query",
      `SELECT p.ad_soyad, p.unvan 
       FROM TANIM_Roller r 
       LEFT JOIN TANIM_Personel p ON r.varsayilan_personel_id = p.id 
       WHERE r.rol_kodu = 'harcama_yetkilisi'`,
    );
    if (!res.success) throw new Error(res.error);
    return res.data[0] || null;
  };

  const { data: harcamaYetkilisi = null } = useQuery({
    queryKey: ["harcama_yetkilisi_dashboard_v2"],
    queryFn: fetchHarcamaYetkilisi,
  });

  const smartAlerts = useSmartAlerts(settings, activeDosyaId, null);

  useEffect(() => {
    if (isLoading || isAnnouncementsLoading) return;

    const notifiedStr = localStorage.getItem("dta_notified_syslog_keys") ||
      "[]";
    let notifiedKeys: string[] = [];
    try {
      notifiedKeys = JSON.parse(notifiedStr);
    } catch {
      notifiedKeys = [];
    }

    const newNotifiedKeys = [...notifiedKeys];
    let hasNewLog = false;

    if (!isMailConfigured) {
      const key = "smtp_not_configured";
      if (!notifiedKeys.includes(key)) {
        logActivity(
          "Mail (SMTP) Yapılandırılmamış",
          "Posta sunucu ayarlarınız eksik. Bildirimler ve onay mailleri devre dışı kalabilir.",
          "warning",
        );
        newNotifiedKeys.push(key);
        hasNewLog = true;
      }
    }

    smartAlerts.forEach((alert) => {
      if (alert.type === "error" || alert.type === "warning") {
        const key = `alert_${alert.id}`;
        if (!notifiedKeys.includes(key)) {
          logActivity(alert.title, alert.message, alert.type);
          newNotifiedKeys.push(key);
          hasNewLog = true;
        }
      }
    });

    if (hasNewLog) {
      localStorage.setItem(
        "dta_notified_syslog_keys",
        JSON.stringify(newNotifiedKeys),
      );
    }
  }, [smartAlerts, isMailConfigured, isLoading, isAnnouncementsLoading]);

  // Aşama Renk ve İsim Tanımlayıcı
  const getAsamaDetails = (
    asamaSira: number,
  ): { name: string; color: string } => {
    const asama = asamalar.find((a: any) => a.asama_sira === asamaSira);
    if (asama) {
      return {
        name: asama.asama_adi,
        color:
          "border-blue-200 dark:border-blue-800/80 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60",
      };
    }

    switch (asamaSira) {
      case 1:
        return {
          name: "1. İhtiyaç & Lüzum",
          color:
            "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/60",
        };
      case 2:
        return {
          name: "2. Piyasa Fiyat Araştırması",
          color:
            "border-amber-200 dark:border-amber-800/80 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60",
        };
      case 3:
        return {
          name: "3. Teklif Değerlendirme",
          color:
            "border-indigo-200 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60",
        };
      case 4:
        return {
          name: "4. Karar & Onay Belgesi",
          color:
            "border-purple-200 dark:border-purple-800/80 text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60",
        };
      case 5:
        return {
          name: "5. Muayene Kabul & Ödeme",
          color:
            "border-emerald-200 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60",
        };
      default:
        return {
          name: "Süreç İlerliyor",
          color:
            "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-400 bg-slate-100 dark:bg-slate-900",
        };
    }
  };

  // Filtrelenmiş Dosyalar
  const filteredDosyalar = dosyalar.filter((d) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      d.temin_no?.toLowerCase().includes(q) ||
      d.konu?.toLowerCase().includes(q) ||
      d.harcama_birimi?.toLowerCase().includes(q)
    );
  });

  // Eğer açık aktif bir dosya varsa takip ekranını render et
  if (activeDosyaId) {
    return <TakipScreen />;
  }

  // TEMİN 360 Modülleri Bilgisi
  const teminPillars = [
    {
      key: "T" as const,
      letter: "T",
      title: "Teklif & Piyasa Fiyat Araştırması",
      subtitle: "Piyasa Araştırma Tutanağı & Teklif Havuzu",
      icon: Coins,
      badge: `${formatCurrency(stats.toplamYaklasikMaliyet)} Toplam Alım`,
      description:
        "Tedarikçi teklif mektuplarını toplar, yaklaşık maliyet cetvellerini otomatik hesaplar ve piyasa fiyat araştırma tutanaklarını kanuna tam uyumlu üretir.",
      statsText: `${stats.kayitliFirmaSayisi} İstekli Firma & Tedarikçi Havuzu`,
    },
    {
      key: "E" as const,
      letter: "E",
      title: "Evrak, Şartname & E-İmza",
      subtitle: "Resmi Yazışma Standartları & EBYS Uyumluluğu",
      icon: FileCheck,
      badge: "Baskıya & EBYS Hazır",
      description:
        "React TSX şablon motoruyla Onay Belgesi, İhtiyaç Belgesi, Piyasa Araştırma Tutanağı ve Ödeme Emri evraklarını tek tıkla mühürlü/imzalı PDF olarak üretir.",
      statsText: "25+ Resmi Kamu Evrak ve Tutanak Şablonu",
    },
    {
      key: "M" as const,
      letter: "M",
      title: "Maliyet, Bütçe & Harcama Yönetimi",
      subtitle: "4734 / 22-d ve 5018 Sayılı Mali Yönetim",
      icon: Scale,
      badge: "%100 Mevzuat Uyum Skoru",
      description:
        "KİK doğrudan temin eşik limitlerini, harcama birimi bütçe tertiplerini ve analitik bütçe kodlarını gerçek zamanlı kontrol altında tutar.",
      statsText: `Yıllık KİK Eşik Sınırı: ${formatCurrency(kikLimit)} (${
        limitType === "buyuksehir" ? "Büyükşehir" : "Normal"
      })`,
    },
    {
      key: "I" as const,
      letter: "İ",
      title: "İhale, Doğrudan Temin & Sözleşme",
      subtitle: "Uçtan Uca 4 Aşamalı Dijital Dosya Yaşam Döngüsü",
      icon: FileText,
      badge: `${stats.ihaleDosyaSayisi} Kayıtlı Dosya`,
      description:
        "İhtiyaç lüzumundan piyasa araştırmasına, teklif mektubu dağıtımından onay belgesine kadar tüm doğrudan temin adımlarını kanuna uygun yürütür.",
      statsText: `${
        stats.aktifDosyaSayisi || stats.ihaleDosyaSayisi
      } Aktif Süreç Devam Ediyor`,
    },
    {
      key: "N" as const,
      letter: "N",
      title: "Netice, Hakediş & Muayene Kabul",
      subtitle: "Muayene Komisyonu, Hakediş & Ödeme Emri",
      icon: ShieldCheck,
      badge: "Sayıştay Güvenceli",
      description:
        "Mal/hizmet ve yapım işleri için ara ve kesin hakediş raporları hazırlar, KDV tevkifatı ve damga vergisi kesintilerini hesaplar, muhasebe ödeme emrine bağlar.",
      statsText:
        `${stats.kayitliPersonelSayisi} Yetkili & Komisyon Üyesi Kayıtlı`,
    },
  ];

  const currentPillar = teminPillars.find((p) => p.key === activePillar) ||
    teminPillars[0];

  function getDtFileText(type?: string | null): string {
    if (!type) return "Mal Alımı";
    const t = type.toLowerCase().trim();
    if (t === "mal") return "Mal Alımı";
    if (t === "hizmet") return "Hizmet Alımı";
    if (t === "yapim_isi" || t === "yapim" || t.includes("yapım")) {
      return "Yapım İşi / Onarım";
    }
    if (t === "danismanlik" || t.includes("danışman")) return "Danışmanlık";
    if (t === "hakedis" || t.includes("hakediş")) return "Hakediş";
    if (t === "ihale") return "İhale";
    return type;
  }

  function getDtFileColor(type?: string | null): string {
    const t = (type || "").toLowerCase().trim();
    if (t === "mal") {
      return "text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border-blue-200/80 dark:border-blue-800/60";
    }
    if (t === "hizmet") {
      return "text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/60 border-violet-200/80 dark:border-violet-800/60";
    }
    if (t === "yapim_isi" || t === "yapim" || t.includes("yapım")) {
      return "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border-amber-200/80 dark:border-amber-800/60";
    }
    if (t === "danismanlik" || t.includes("danışman")) {
      return "text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 border-purple-200/80 dark:border-purple-800/60";
    }
    if (t === "hakedis" || t.includes("hakediş")) {
      return "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/80 dark:border-emerald-800/60";
    }
    return "text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700";
  }


  return (
    <div className="flex flex-col gap-6 w-full max-w-[1650px] mx-auto pb-12 animate-in fade-in slide-in-from-bottom-3 duration-500 text-slate-800 dark:text-slate-100">
      
      {/* 0. SAYFA TEPESİ: ÇALIŞMA ALANI & USUL SEÇİCİ SEGMENTLİ KONTROL PANELİ */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2.5 px-3 py-1">
          <div className={`p-2 rounded-xl ${isDt ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : isIhale ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'}`}>
            {isDt ? <Zap className="w-5 h-5" /> : isIhale ? <Gavel className="w-5 h-5" /> : <Layers className="w-5 h-5" />}
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Aktif Çalışma Alanı & Süreç Usulü
            </div>
            <div className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
              <span>{isDt ? '🛒 Doğrudan Temin (KİK Md. 22/d)' : isIhale ? '🏛️ Kamu İhale Süreçleri (KİK 19/21 & Hakediş)' : '🌐 Konsolide Görünüm (Tüm Alımlar)'}</span>
              <span className={`inline-block w-2 h-2 rounded-full animate-pulse ${isDt ? 'bg-blue-500' : isIhale ? 'bg-indigo-500' : 'bg-emerald-500'}`} />
            </div>
          </div>
        </div>

        {/* 3'lü Segment Mod Butonları */}
        <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold shrink-0">
          <button
            type="button"
            onClick={() => switchProcurementMode("dogrudan_temin")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
              isDt
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 scale-[1.02]"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Doğrudan Temin (22/d)</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
              isDt ? 'bg-blue-700 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}>
              {stats.dogrudanTeminSayisi || 0}
            </span>
          </button>

          <button
            type="button"
            onClick={() => switchProcurementMode("ihale")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
              isIhale
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-[1.02]"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800"
            }`}
          >
            <Gavel className="w-3.5 h-3.5" />
            <span>İhale Süreçleri (19/21)</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
              isIhale ? 'bg-indigo-700 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}>
              {stats.ihaleDosyaSayisi || 0}
            </span>
          </button>

          <button
            type="button"
            onClick={() => switchProcurementMode("all")}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all cursor-pointer ${
              procurementMode === "all"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-[1.02]"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Tüm Alımlar</span>
          </button>
        </div>
      </div>

      {/* 1. TEMİN 360 KOMUTA MERKEZİ HERO HEADER (SEÇİLEN MODA GÖRE DİNAMİK) */}
      <div className={`relative overflow-hidden rounded-3xl text-white p-7 md:p-8 shadow-xl border transition-all duration-500 ${
        isIhale 
          ? 'bg-linear-to-br from-slate-950 via-slate-900 to-indigo-950/80 border-indigo-800/50' 
          : 'bg-linear-to-br from-slate-950 via-slate-900 to-blue-950/80 border-slate-800'
      }`}>
        {/* Dekoratif Glow Işıkları */}
        <div className={`absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-all duration-500 ${
          isIhale ? 'bg-indigo-600/30' : 'bg-blue-600/25'
        }`} />
        <div className={`absolute bottom-0 left-1/3 -ml-20 -mb-20 w-80 h-80 rounded-full blur-3xl pointer-events-none transition-all duration-500 ${
          isIhale ? 'bg-purple-600/25' : 'bg-indigo-600/20'
        }`} />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase border ${
                isIhale
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30'
                  : 'bg-blue-500/20 text-blue-300 border-blue-400/30'
              }`}>
                {isIhale ? <Gavel className="w-3.5 h-3.5 text-indigo-400" /> : <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />}
                {isIhale ? 'KAMU İHALE MERKEZİ • KİK 19/21 & HAKEDİŞ YÖNETİMİ' : 'DOĞRUDAN TEMİN PORTALI • KİK 22/d HARCAMA YÖNETİMİ'}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                {isIhale ? '4734 Kamu İhale & 4735 Sözleşmeler Kanunu' : '4734 / 22-d & 5018 Sayılı Mali Yönetim Uyumlu'}
              </span>
              <span className="text-xs text-slate-400">{currentDate}</span>
            </div>

            <div>
              <div className={`text-xs font-bold tracking-wider uppercase mb-1 ${isIhale ? 'text-indigo-400' : 'text-blue-400'}`}>
                {greeting},
              </div>
              <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-white">
                  {adminName && !adminName.includes("YÖNETİCİ")
                    ? adminName
                    : (adminUsername || "İdare Yöneticisi")}
                </h1>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white/10 text-slate-200 border border-white/10 shadow-xs">
                  {adminTitle && !adminTitle.includes("YÖNETİCİ")
                    ? adminTitle
                    : isIhale ? "İhale Yetkilisi / Şube Müdürü" : "Harcama Yetkilisi / Şube Müdürü"}
                </span>
              </div>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed max-w-2xl">
                <strong className="text-white font-semibold">
                  {institutionName && !institutionName.includes("KURUM")
                    ? institutionName
                    : "Kurum İdaresi"}
                </strong>{" "}
                {isIhale
                  ? "bünyesindeki Açık İhale (KİK 19), Pazarlık Usulü (KİK 21), yaklaşık maliyet hesaplamaları, ihale komisyon kararları, sözleşme ve ara/kesin hakediş işlemleri tek ekranda yönetiliyor."
                  : "bünyesindeki doğrudan temin süreçleri (22/d), piyasa fiyat araştırmaları, KİK eşik limit kontrolleri, onay belgeleri ve harcama talimatları tek ekranda yönetiliyor."}
              </p>
            </div>
          </div>

          {/* Hızlı Aksiyon Butonları - MODA GÖRE DİNAMİK */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full lg:w-[390px] shrink-0">
            <button
              type="button"
              onClick={() => {
                setSelectedFileForAI({
                  temin_no: isIhale ? "İHALE-ASISTAN" : "TEMIN-ASISTAN",
                  konu: isIhale
                    ? "Kamu İhale Mevzuatı (KİK 19/21), Şartname ve Hakediş Karar Desteği"
                    : "Doğrudan Temin (KİK 22/d), Piyasa Araştırması ve Harcama Karar Desteği",
                  yaklasik_maliyet: stats.toplamYaklasikMaliyet,
                });
                setShowAIModal(true);
              }}
              className="w-full bg-linear-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-2.5 px-3.5 rounded-xl shadow-md shadow-purple-900/30 border border-purple-400/30 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] text-xs"
            >
              <Sparkles className="w-4 h-4 text-purple-200 animate-spin" />
              <span className="font-extrabold tracking-wide">
                TEMİN 360 AI
              </span>
            </button>

            {isIhale ? (
              <Link to="/harcama-merkezi" className="w-full">
                <button
                  type="button"
                  className="w-full bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-2.5 px-3.5 rounded-xl shadow-md shadow-indigo-900/30 border border-indigo-400/30 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] text-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span className="font-extrabold tracking-wide">
                    + Yeni İhale (19/21)
                  </span>
                </button>
              </Link>
            ) : (
              <Link to="/dosyalar/yeni" className="w-full">
                <button
                  type="button"
                  className="w-full bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold py-2.5 px-3.5 rounded-xl shadow-md shadow-blue-900/30 border border-blue-400/30 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] text-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span className="font-extrabold tracking-wide">
                    + Yeni Temin (22)
                  </span>
                </button>
              </Link>
            )}

            {isIhale ? (
              <Link to="/hakedis" className="w-full">
                <button
                  type="button"
                  className="w-full bg-linear-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold py-2.5 px-3.5 rounded-xl shadow-md shadow-amber-900/30 border border-amber-400/30 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] text-xs"
                >
                  <Gavel className="w-4 h-4" />
                  <span className="font-extrabold tracking-wide">
                    İhale & Hakediş
                  </span>
                </button>
              </Link>
            ) : (
              <Link to="/harcama-merkezi" className="w-full">
                <button
                  type="button"
                  className="w-full bg-linear-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white font-bold py-2.5 px-3.5 rounded-xl shadow-md shadow-blue-900/30 border border-blue-400/30 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] text-xs"
                >
                  <FileText className="w-4 h-4" />
                  <span className="font-extrabold tracking-wide">
                    Piyasa Araştırması
                  </span>
                </button>
              </Link>
            )}

            <Link to="/dosyalar" className="w-full">
              <button
                type="button"
                className="w-full bg-slate-800/90 hover:bg-slate-700 text-slate-100 hover:text-white border border-slate-700/90 font-bold py-2.5 px-3.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] text-xs"
              >
                <FileSpreadsheet className={`w-4 h-4 ${isIhale ? 'text-indigo-400' : 'text-blue-400'}`} />
                <span className="font-bold">
                  {isIhale ? `İhale Dosyaları (${stats.ihaleDosyaSayisi || 0})` : `Temin Dosyaları (${stats.dogrudanTeminSayisi || 0})`}
                </span>
              </button>
            </Link>
          </div>
        </div>

        {/* Akıllı Durum Uyarıları (Smart Alerts) */}
        {smartAlerts.length > 0 && (
          <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-amber-950/40 -mx-7 md:-mx-8 -mb-7 md:-mb-8 px-7 md:px-8 py-3.5 border-t-amber-500/30">
            <div className="flex items-center gap-2.5 text-amber-200 text-xs font-medium">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong className="text-amber-300 font-bold">
                  Sistem Uyarısı:
                </strong>{" "}
                {smartAlerts[0].title} —{" "}
                <span className="text-slate-200">{smartAlerts[0].message}</span>
              </span>
            </div>
            <Link
              to={smartAlerts[0].actionLink as any}
              search={smartAlerts[0].actionSearch as any}
            >
              <button className="text-xs font-bold text-amber-300 hover:text-amber-100 underline flex items-center gap-1 cursor-pointer shrink-0">
                {smartAlerts[0].actionText} <ChevronRight className="w-3 h-3" />
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* 2. SÜREÇ & USUL MODU SEÇİCİ (DOĞRUDAN TEMİN vs İHALE SÜREÇLERİ) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-2.5 sm:p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2 px-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
          <span className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
            Aktif Görünüm Modu:
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
          <button
            type="button"
            onClick={() => switchProcurementMode("dogrudan_temin")}
            className={cn(
              "px-3.5 py-2 rounded-lg text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer",
              procurementMode === "dogrudan_temin"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 scale-[1.02]"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/60"
            )}
          >
            <span className="w-2 h-2 rounded-full bg-blue-300 inline-block" />
            <span>Doğrudan Temin (22/d)</span>
            {stats.dogrudanTeminSayisi > 0 && (
              <span className={cn(
                "text-[10px] px-1.5 py-0.2 rounded-full font-bold",
                procurementMode === "dogrudan_temin"
                  ? "bg-blue-800/80 text-white"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
              )}>
                {stats.dogrudanTeminSayisi}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => switchProcurementMode("ihale")}
            className={cn(
              "px-3.5 py-2 rounded-lg text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer",
              procurementMode === "ihale"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30 scale-[1.02]"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/60"
            )}
          >
            <span className="w-2 h-2 rounded-full bg-purple-300 inline-block" />
            <span>İhale Süreçleri (19/21)</span>
            {(stats.acikIhaleSayisi + stats.pazarlikSayisi + stats.hakediseSayisi) > 0 && (
              <span className={cn(
                "text-[10px] px-1.5 py-0.2 rounded-full font-bold",
                procurementMode === "ihale"
                  ? "bg-purple-800/80 text-white"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
              )}>
                {stats.acikIhaleSayisi + stats.pazarlikSayisi + stats.hakediseSayisi}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => switchProcurementMode("all")}
            className={cn(
              "px-3.5 py-2 rounded-lg text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer",
              procurementMode === "all"
                ? "bg-slate-900 text-white dark:bg-slate-700 shadow-md scale-[1.02]"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/60"
            )}
          >
            <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
            <span>Tüm Alımlar (Konsolide)</span>
          </button>
        </div>
      </div>

      {/* 2. TEMİN 360 5 TEMEL DİREK (PILLARS) İNTERAKTİF NAVİGASYON MATRİSİ */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 md:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm border shadow-xs",
              procurementMode === "dogrudan_temin"
                ? "bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/60"
                : procurementMode === "ihale"
                ? "bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900/60"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
            )}>
              {procurementMode === "dogrudan_temin" ? "📑" : procurementMode === "ihale" ? "⚖️" : "🏛️"}
            </div>
            <div>
              <h2 className="text-base md:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                {procurementMode === "dogrudan_temin"
                  ? "TEMİN 360 Doğrudan Temin Süreç Mimarisi (KİK Md. 22)"
                  : procurementMode === "ihale"
                  ? "TEMİN 360 İhale & Hakediş Süreç Yönetimi (KİK Md. 19 / 21)"
                  : "TEMİN 360 Entegre Kamu Satın Alma & Hakediş Mimarisi"}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {procurementMode === "dogrudan_temin"
                  ? "4734 Sayılı Kanun Madde 22/d piyasa fiyat araştırması, teklif mektupları ve hızlı onay süreci kontrol paneli"
                  : procurementMode === "ihale"
                  ? "Açık ihale (Md. 19), Pazarlık usulü (Md. 21), pursantaj cetvelleri ve hakediş ödeme yaşam döngüsü kontrol paneli"
                  : "Uçtan uca doğrudan temin ve hakediş yaşam döngüsü kontrol paneli"}
              </p>
            </div>
          </div>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 hidden sm:inline-block bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
            Modül seçmek için harflere tıklayın
          </span>
        </div>

        {/* T - E - M - İ - N Buton Şeridi */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {teminPillars.map((pillar) => {
            const isSelected = activePillar === pillar.key;
            const Icon = pillar.icon;
            return (
              <button
                key={pillar.key}
                type="button"
                onClick={() => setActivePillar(pillar.key)}
                className={cn(
                  "flex flex-col text-left p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer relative overflow-hidden group",
                  isSelected
                    ? "bg-linear-to-br from-blue-600 to-indigo-700 text-white border-blue-500 shadow-lg shadow-blue-500/25 scale-[1.02] ring-2 ring-blue-400/40"
                    : "bg-slate-50 hover:bg-slate-100/90 text-slate-800 border-slate-200/90 dark:bg-slate-800/70 dark:hover:bg-slate-800 dark:text-slate-200 dark:border-slate-700/80 hover:border-blue-300 dark:hover:border-blue-600",
                )}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div
                    className={cn(
                      "w-7 h-7 rounded-xl flex items-center justify-center font-black text-sm shadow-xs transition-colors",
                      isSelected
                        ? "bg-white text-blue-700 font-black shadow-md"
                        : "bg-blue-600 text-white dark:bg-blue-500 group-hover:scale-105",
                    )}
                  >
                    {pillar.letter}
                  </div>
                  <Icon
                    className={cn(
                      "w-4 h-4 transition-colors",
                      isSelected
                        ? "text-white"
                        : "text-slate-400 dark:text-slate-400 group-hover:text-blue-500",
                    )}
                  />
                </div>
                <span
                  className={cn(
                    "text-xs font-extrabold tracking-tight leading-tight",
                    isSelected
                      ? "text-white"
                      : "text-slate-900 dark:text-slate-100",
                  )}
                >
                  {pillar.title.split("&")[0]}
                </span>
                <span
                  className={cn(
                    "text-[10px] mt-0.5 truncate font-medium",
                    isSelected
                      ? "text-blue-100"
                      : "text-slate-500 dark:text-slate-400",
                  )}
                >
                  {pillar.subtitle}
                </span>
              </button>
            );
          })}
        </div>

        {/* Seçili Pillar Detay Kartı */}
        <div className="mt-4 p-4 md:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black text-blue-700 dark:text-blue-400 uppercase tracking-widest">
                {currentPillar.letter} SÜTUNU: {currentPillar.title}
              </span>
              <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold bg-blue-600 text-white shadow-xs border border-blue-400/30">
                {currentPillar.badge}
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
              {currentPillar.description}
            </p>
            <div className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 pt-0.5">
              <Activity className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{currentPillar.statsText}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
            {activePillar === "T" && (
              <Link to="/dosyalar" className="w-full md:w-auto">
                <button
                  type="button"
                  className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-transform hover:scale-[1.02]"
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>Piyasa Fiyat Araştırmaları</span>
                </button>
              </Link>
            )}
            {activePillar === "E" && (
              <Link to="/taslakyonetim" className="w-full md:w-auto">
                <button
                  type="button"
                  className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-transform hover:scale-[1.02]"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Evrak Şablonları & Taslaklar</span>
                </button>
              </Link>
            )}
            {activePillar === "M" && (
              <Link to="/harcama-merkezi" className="w-full md:w-auto">
                <button
                  type="button"
                  className="w-full md:w-auto bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-transform hover:scale-[1.02]"
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>Harcama & KİK Limit Takibi</span>
                </button>
              </Link>
            )}
            {activePillar === "I" && (
              <Link to="/dosyalar/yeni" className="w-full md:w-auto">
                <button
                  type="button"
                  className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-transform hover:scale-[1.02]"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Yeni Doğrudan Temin Başlat</span>
                </button>
              </Link>
            )}
            {activePillar === "N" && (
              <Link to="/hakedis" className="w-full md:w-auto">
                <button
                  type="button"
                  className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-transform hover:scale-[1.02]"
                >
                  <ClipboardCheck className="w-3.5 h-3.5" />
                  <span>Hakediş & Kabul Merkezi</span>
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 3. USUL / TÜR BAZLI ÖZET BANT */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Başlık */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center border border-indigo-200 dark:border-indigo-900/50">
              <Scale className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
                Usule Göre Temin Dağılımı
              </h2>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                4734 Sayılı KİK kapsamındaki tüm usullerin anlık özeti
              </p>
            </div>
          </div>
          <Link to="/dosyalar">
            <button type="button" className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer">
              Tümünü Gör <ChevronRight className="w-3 h-3" />
            </button>
          </Link>
        </div>

        {/* 4'lü Kart Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-slate-100 dark:divide-slate-800">

          {/* Doğrudan Temin */}
          <div
            onClick={() => switchProcurementMode("dogrudan_temin")}
            className={cn(
              "p-4 md:p-5 transition-all cursor-pointer relative",
              procurementMode === "dogrudan_temin"
                ? "bg-blue-50/90 dark:bg-blue-950/40 ring-2 ring-inset ring-blue-500/80 shadow-inner"
                : "hover:bg-blue-50/60 dark:hover:bg-blue-950/20"
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                Doğrudan Temin
              </span>
              <div className="flex items-center gap-1">
                {procurementMode === "dogrudan_temin" && (
                  <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-600 text-white shadow-xs">
                    Aktif
                  </span>
                )}
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50">
                  Md. 22
                </span>
              </div>
            </div>
            <div className="flex items-end justify-between gap-2">
              <div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {isLoading ? (
                    <span className="inline-block w-8 h-7 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                  ) : stats.dogrudanTeminSayisi}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">dosya</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-black text-blue-600 dark:text-blue-400 font-mono">
                  {isLoading ? "..." : formatCurrency(stats.dogrudanTeminMaliyet)}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">yaklaşık maliyet</div>
              </div>
            </div>
            {/* Mini progress bar */}
            <div className="mt-3 w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                style={{
                  width: `${
                    (stats.dogrudanTeminSayisi + stats.acikIhaleSayisi + stats.pazarlikSayisi + stats.hakediseSayisi) > 0
                      ? Math.round((stats.dogrudanTeminSayisi / (stats.dogrudanTeminSayisi + stats.acikIhaleSayisi + stats.pazarlikSayisi + stats.hakediseSayisi)) * 100)
                      : 0
                  }%`
                }}
                className="h-full bg-blue-500 rounded-full transition-all duration-700"
              />
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
              % {
                (stats.dogrudanTeminSayisi + stats.acikIhaleSayisi + stats.pazarlikSayisi + stats.hakediseSayisi) > 0
                  ? Math.round((stats.dogrudanTeminSayisi / (stats.dogrudanTeminSayisi + stats.acikIhaleSayisi + stats.pazarlikSayisi + stats.hakediseSayisi)) * 100)
                  : 0
              } toplam alım içinde
            </div>
          </div>

          {/* Açık İhale */}
          <div
            onClick={() => switchProcurementMode("ihale")}
            className={cn(
              "p-4 md:p-5 transition-all cursor-pointer relative",
              procurementMode === "ihale"
                ? "bg-amber-50/90 dark:bg-amber-950/40 ring-2 ring-inset ring-amber-500/80 shadow-inner"
                : "hover:bg-amber-50/60 dark:hover:bg-amber-950/20"
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                Açık İhale
              </span>
              <div className="flex items-center gap-1">
                {procurementMode === "ihale" && (
                  <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-600 text-white shadow-xs">
                    Aktif Mod
                  </span>
                )}
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50">
                  Md. 19
                </span>
              </div>
            </div>
            <div className="flex items-end justify-between gap-2">
              <div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {isLoading ? (
                    <span className="inline-block w-8 h-7 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                  ) : stats.acikIhaleSayisi}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">dosya</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-black text-amber-600 dark:text-amber-400 font-mono">
                  {isLoading ? "..." : formatCurrency(stats.acikIhaleMaliyet)}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">yaklaşık maliyet</div>
              </div>
            </div>
            <div className="mt-3 w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                style={{
                  width: `${
                    (stats.dogrudanTeminSayisi + stats.acikIhaleSayisi + stats.pazarlikSayisi + stats.hakediseSayisi) > 0
                      ? Math.round((stats.acikIhaleSayisi / (stats.dogrudanTeminSayisi + stats.acikIhaleSayisi + stats.pazarlikSayisi + stats.hakediseSayisi)) * 100)
                      : 0
                  }%`
                }}
                className="h-full bg-amber-500 rounded-full transition-all duration-700"
              />
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
              % {
                (stats.dogrudanTeminSayisi + stats.acikIhaleSayisi + stats.pazarlikSayisi + stats.hakediseSayisi) > 0
                  ? Math.round((stats.acikIhaleSayisi / (stats.dogrudanTeminSayisi + stats.acikIhaleSayisi + stats.pazarlikSayisi + stats.hakediseSayisi)) * 100)
                  : 0
              } toplam alım içinde
            </div>
          </div>

          {/* Pazarlık Usulü */}
          <div
            onClick={() => switchProcurementMode("ihale")}
            className={cn(
              "p-4 md:p-5 transition-all cursor-pointer relative",
              procurementMode === "ihale"
                ? "bg-purple-50/90 dark:bg-purple-950/40 ring-2 ring-inset ring-purple-500/80 shadow-inner"
                : "hover:bg-purple-50/60 dark:hover:bg-purple-950/20"
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-purple-600 dark:text-purple-400">
                <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
                Pazarlık Usulü
              </span>
              <div className="flex items-center gap-1">
                {procurementMode === "ihale" && (
                  <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-600 text-white shadow-xs">
                    Aktif Mod
                  </span>
                )}
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900/50">
                  Md. 21
                </span>
              </div>
            </div>
            <div className="flex items-end justify-between gap-2">
              <div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {isLoading ? (
                    <span className="inline-block w-8 h-7 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                  ) : stats.pazarlikSayisi}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">dosya</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-black text-purple-600 dark:text-purple-400 font-mono">
                  {isLoading ? "..." : formatCurrency(stats.pazarlikMaliyet)}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">yaklaşık maliyet</div>
              </div>
            </div>
            <div className="mt-3 w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                style={{
                  width: `${
                    (stats.dogrudanTeminSayisi + stats.acikIhaleSayisi + stats.pazarlikSayisi + stats.hakediseSayisi) > 0
                      ? Math.round((stats.pazarlikSayisi / (stats.dogrudanTeminSayisi + stats.acikIhaleSayisi + stats.pazarlikSayisi + stats.hakediseSayisi)) * 100)
                      : 0
                  }%`
                }}
                className="h-full bg-purple-500 rounded-full transition-all duration-700"
              />
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
              % {
                (stats.dogrudanTeminSayisi + stats.acikIhaleSayisi + stats.pazarlikSayisi + stats.hakediseSayisi) > 0
                  ? Math.round((stats.pazarlikSayisi / (stats.dogrudanTeminSayisi + stats.acikIhaleSayisi + stats.pazarlikSayisi + stats.hakediseSayisi)) * 100)
                  : 0
              } toplam alım içinde
            </div>
          </div>

          {/* Hakediş / Yapım */}
          <div
            onClick={() => switchProcurementMode("ihale")}
            className={cn(
              "p-4 md:p-5 transition-all cursor-pointer relative",
              procurementMode === "ihale"
                ? "bg-emerald-50/90 dark:bg-emerald-950/40 ring-2 ring-inset ring-emerald-500/80 shadow-inner"
                : "hover:bg-emerald-50/60 dark:hover:bg-emerald-950/20"
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                Hakediş / Yapım
              </span>
              <div className="flex items-center gap-1">
                {procurementMode === "ihale" && (
                  <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-600 text-white shadow-xs">
                    Aktif Mod
                  </span>
                )}
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50">
                  Yapım İşi
                </span>
              </div>
            </div>
            <div className="flex items-end justify-between gap-2">
              <div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {isLoading ? (
                    <span className="inline-block w-8 h-7 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                  ) : stats.hakediseSayisi}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">dosya</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {isLoading ? "..." : formatCurrency(stats.hakediseMaliyet)}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">yaklaşık maliyet</div>
              </div>
            </div>
            <div className="mt-3 w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                style={{
                  width: `${
                    (stats.dogrudanTeminSayisi + stats.acikIhaleSayisi + stats.pazarlikSayisi + stats.hakediseSayisi) > 0
                      ? Math.round((stats.hakediseSayisi / (stats.dogrudanTeminSayisi + stats.acikIhaleSayisi + stats.pazarlikSayisi + stats.hakediseSayisi)) * 100)
                      : 0
                  }%`
                }}
                className="h-full bg-emerald-500 rounded-full transition-all duration-700"
              />
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
              % {
                (stats.dogrudanTeminSayisi + stats.acikIhaleSayisi + stats.pazarlikSayisi + stats.hakediseSayisi) > 0
                  ? Math.round((stats.hakediseSayisi / (stats.dogrudanTeminSayisi + stats.acikIhaleSayisi + stats.pazarlikSayisi + stats.hakediseSayisi)) * 100)
                  : 0
              } toplam alım içinde
            </div>
          </div>

        </div>
      </div>

      {/* 4. ANA KPI & METRİK KARTLARI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Kart 1: Toplam Yaklaşık Maliyet & Bütçe */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Toplam Yaklaşık Maliyet
              </span>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {isLoading
                  ? "..."
                  : formatCurrency(stats.toplamYaklasikMaliyet)}
              </div>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/50">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              KİK Eşik Durumu:
            </span>
            <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">
              {formatCurrency(kikLimit)} / limit
            </span>
          </div>
        </div>

        {/* Kart 2: Dosya & Süreç Hacmi */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-amber-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Toplam Doğrudan Temin
              </span>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {isLoading ? "..." : stats.ihaleDosyaSayisi}{" "}
                <span className="text-sm font-bold text-slate-400">Dosya</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-100 dark:border-amber-900/50">
              <Scale className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              Aktif İşlemde:
            </span>
            <span className="font-bold text-amber-600 dark:text-amber-400">
              {stats.aktifDosyaSayisi || stats.ihaleDosyaSayisi} dosya açık
            </span>
          </div>
        </div>

        {/* Kart 3: İstekli Firma & Piyasa Katılımı */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Tedarikçi & İstekli Havuzu
              </span>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {isLoading ? "..." : stats.kayitliFirmaSayisi}{" "}
                <span className="text-sm font-bold text-slate-400">Firma</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/50">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              Teklif Verenler:
            </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {stats.ihalelereKatilanFirmaSayisi || stats.kayitliFirmaSayisi}
              {" "}
              katılım
            </span>
          </div>
        </div>

        {/* Kart 4: Personel & Mevzuat Uyum Skoru */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-rose-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Mevzuat & Denetim Güvencesi
              </span>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-6 h-6" /> %100 Uyum
              </div>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-100 dark:border-rose-900/50">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              Görevli Personel:
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {stats.kayitliPersonelSayisi} yetkili tanımlı
            </span>
          </div>
        </div>
      </div>

      {/* 4. İKİ SÜTUNLU ANALİTİK & OPERASYON PANELİ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* SOL TARAF: SATIN ALMA TÜR DAĞILIMI & AKTİF DOSYALAR (8 Kolon) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Alım Türlerine Göre Dağılım Barı */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Alım Türlerine Göre Maliyet Dağılımı
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  4734 Sayılı Kanun kapsamındaki Mal, Hizmet ve Yapım
                  harcamaları
                </p>
              </div>
              <span className="text-xs font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700 font-mono">
                {formatCurrency(totalCat)}
              </span>
            </div>

            {/* Segmented Progress Bar */}
            <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex gap-0.5 mb-4 p-0.5">
              <div
                style={{ width: `${malPct}%` }}
                className="h-full bg-blue-500 rounded-l-full transition-all duration-500"
                title={`Mal Alımı: %${malPct}`}
              />
              <div
                style={{ width: `${hizmetPct}%` }}
                className="h-full bg-indigo-500 transition-all duration-500"
                title={`Hizmet Alımı: %${hizmetPct}`}
              />
              <div
                style={{ width: `${yapimPct}%` }}
                className="h-full bg-amber-500 transition-all duration-500"
                title={`Yapım İşi: %${yapimPct}`}
              />
              <div
                style={{ width: `${danismanlikPct}%` }}
                className="h-full bg-purple-500 rounded-r-full transition-all duration-500"
                title={`Danışmanlık: %${danismanlikPct}`}
              />
            </div>

            {/* Dağılım İstatistik Kutuları */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50">
                <div className="flex items-center justify-between text-xs text-blue-700 dark:text-blue-400 font-bold mb-1">
                  <span>Mal Alımı</span>
                  <span>%{malPct}</span>
                </div>
                <div className="text-sm font-black text-slate-900 dark:text-white font-mono">
                  {formatCurrency(stats.malYaklasikMaliyet)}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50">
                <div className="flex items-center justify-between text-xs text-indigo-700 dark:text-indigo-400 font-bold mb-1">
                  <span>Hizmet Alımı</span>
                  <span>%{hizmetPct}</span>
                </div>
                <div className="text-sm font-black text-slate-900 dark:text-white font-mono">
                  {formatCurrency(stats.hizmetYaklasikMaliyet)}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50">
                <div className="flex items-center justify-between text-xs text-amber-700 dark:text-amber-400 font-bold mb-1">
                  <span>Yapım İşi</span>
                  <span>%{yapimPct}</span>
                </div>
                <div className="text-sm font-black text-slate-900 dark:text-white font-mono">
                  {formatCurrency(stats.yapimYaklasikMaliyet)}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50">
                <div className="flex items-center justify-between text-xs text-purple-700 dark:text-purple-400 font-bold mb-1">
                  <span>Danışmanlık</span>
                  <span>%{danismanlikPct}</span>
                </div>
                <div className="text-sm font-black text-slate-900 dark:text-white font-mono">
                  {formatCurrency(stats.danismanlikYaklasikMaliyet)}
                </div>
              </div>
            </div>
          </div>

          {/* AKTİF SÜREÇLER & DOĞRUDAN TEMİN PİPELİNE */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Canlı Süreç Akış Hattı
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Hazırlıktan kabul ve ödemeye kadar doğrudan temin dosyaları
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Dosya no veya konu ara..."
                    className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <Link to="/dosyalar/yeni">
                  <button
                    type="button"
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1.5 px-3 rounded-xl cursor-pointer flex items-center gap-1 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Yeni</span>
                  </button>
                </Link>
              </div>
            </div>

            {filteredDosyalar.length === 0
              ? (
                <div className="text-center py-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700">
                  <FileText className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-60" />
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Henüz Kayıtlı Dosya Bulunmuyor
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                    Yeni bir doğrudan temin dosyası başlatarak 4 aşamalı satın
                    alma sürecinizi anında devreye alın.
                  </p>
                  <Link to="/dosyalar/yeni">
                    <button
                      type="button"
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-4 rounded-xl cursor-pointer"
                    >
                      İlk Dosyayı Oluştur
                    </button>
                  </Link>
                </div>
              )
              : (
                <div className="space-y-3">
                  {filteredDosyalar.slice(0, 6).map((dosya) => {
                    const asamaInfo = getAsamaDetails(
                      (dosya as any).durum_asama_id || 1,
                    );
                    const handleOpenThisDosya = () => {
                      setActiveDosyaId(dosya.id);
                      navigate({ to: "/takip" });
                    };

                    return (
                      <div
                        key={dosya.id}
                        onClick={handleOpenThisDosya}
                        className="p-4 rounded-2xl bg-slate-50 hover:bg-white dark:bg-slate-800/50 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 hover:border-blue-400 dark:hover:border-blue-600 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group shadow-xs hover:shadow-sm cursor-pointer"
                      >
                        <div className="space-y-1.5 max-w-xl">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono font-black text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950/80 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
                              {formatDosyaNo(dosya)}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${asamaInfo.color}`}
                            >
                              {asamaInfo.name}
                            </span>
                            <span
                              className={cn(
                                "text-[10px] font-bold px-2 py-0.5 rounded-md border",
                                getDtFileColor(dosya.tur),
                              )}
                            >
                              {getDtFileText(dosya.tur)}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {dosya.konu || "Konu belirtilmemiş"}
                          </h4>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-3 font-medium">
                            <span>
                              Birim: {dosya.harcama_birimi || harcamaBirimAdi ||
                                "Genel Birim"}
                            </span>
                            <span>•</span>
                            <span>
                              Tarih: {dosya.dosya_acilis_tarihi
                                ? dosya.dosya_acilis_tarihi.substring(0, 10)
                                : "Bugün"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-slate-700">
                          <div className="text-right">
                            <div className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">
                              {formatCurrency(dosya.yaklasik_maliyet || 0)}
                            </div>
                            <span className="text-[10px] text-slate-400">
                              Yaklaşık Maliyet
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedFileForAI(dosya);
                                setShowAIModal(true);
                              }}
                              className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 text-purple-600 dark:text-purple-300 transition-colors cursor-pointer border border-purple-200 dark:border-purple-800"
                              title="TEMİN 360 AI Süreç Tavsiyesi Al"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenThisDosya();
                              }}
                              className="text-xs font-bold py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-950/50 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer flex items-center gap-1 transition-colors group-hover:border-blue-300 dark:group-hover:border-blue-700"
                            >
                              <span>Aç</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
          </div>
        </div>

        {/* SAĞ TARAF: KURUM KİMLİK KARTI & DUYURULAR & SİSTEM KONTROLÜ (4 Kolon) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Kurumsal Mali Kimlik & Bütçe Kartı */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 font-black shadow-md shadow-blue-500/20">
                <Landmark className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                  {institutionName || "Kurum Adı Tanımlanmamış"}
                </h3>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold truncate block">
                  {kurumTuruLabel}
                </span>
              </div>
            </div>

            {/* Bütçe & Analitik Kod Matrisi */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-medium">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">
                  Limit Statüsü
                </span>
                <span className="font-bold text-slate-900 dark:text-white uppercase bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px] border border-slate-200 dark:border-slate-700">
                  {limitType === "buyuksehir"
                    ? "Büyükşehir Kapsamı"
                    : "Normal İdare"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">
                  Harcama Birimi
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[170px]">
                  {harcamaBirimAdi || "Belirtilmedi"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">
                  Kurumsal / Fonk. Kod
                </span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {kurumsalKod || "00.00"} / {fonksiyonelKod || "00.0"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">
                  Muhasebe Birimi
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[170px]">
                  {muhasebeBirimAdi || "Belirtilmedi"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-500 dark:text-slate-400">
                  Harcama Yetkilisi
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {harcamaYetkilisi?.ad_soyad || "Atanmamış"}
                </span>
              </div>
            </div>

            <Link to="/mevzuat" search={{ tab: "mali" } as any}>
              <button
                type="button"
                className="w-full text-xs font-bold py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer transition-colors"
              >
                Mali Parametreleri Düzenle
              </button>
            </Link>
          </div>

          {/* TEMİN 360 Akıllı Asistan & Mevzuat Bülteni */}
          <div className="p-6 rounded-3xl bg-slate-900 dark:bg-slate-950 text-white shadow-md border border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-36 h-36 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                <Bot className="w-4 h-4 text-purple-300" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-purple-200">
                  TEMİN 360 AI Karar Desteği
                </h4>
                <span className="text-[10px] text-purple-300/80">
                  4734 Sayılı Kanun & KİK Mevzuatı
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Doğrudan temin lüzum yazıları, yaklaşık maliyet piyasa
              araştırması, hakediş raporları ve onay belgesi gerekçelerini
              mevzuata tam uyumlu olarak otomatik oluşturun.
            </p>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setSelectedFileForAI({
                    temin_no: "MEVZUAT-REHBERI",
                    konu:
                      "4734 Sayılı Kamu İhale Kanunu 22/d Maddesi Kapsamında Alım Esasları",
                    yaklasik_maliyet: kikLimit,
                  });
                  setShowAIModal(true);
                }}
                className="w-full text-left p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-purple-100 transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>💡 22/d Eşik Limit ve KDV Kuralları</span>
                <ChevronRight className="w-3.5 h-3.5 text-purple-300" />
              </button>

              <button
                onClick={() => {
                  setSelectedFileForAI({
                    temin_no: "DENETIM-KONTROL",
                    konu:
                      "Sayıştay ve İç Denetim Standartlarına Göre Doğrudan Temin Dosya Hazırlığı",
                    yaklasik_maliyet: stats.toplamYaklasikMaliyet,
                  });
                  setShowAIModal(true);
                }}
                className="w-full text-left p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-purple-100 transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>🛡️ Sayıştay Denetim Kontrol Listesi</span>
                <ChevronRight className="w-3.5 h-3.5 text-purple-300" />
              </button>
            </div>
          </div>

          {/* Sistem Duyuruları ve Güncellemeler */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Sürüm & Mevzuat Bülteni
              </h4>
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-900/40">
                v1.0.0-beta.85
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              {announcements && announcements.length > 0
                ? (
                  announcements.slice(0, 3).map((ann, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
                    >
                      <div className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                        {ann.title}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed font-normal">
                        {ann.content}
                      </p>
                    </div>
                  ))
                )
                : (
                  <div className="text-xs text-slate-500 dark:text-slate-400 text-center py-4">
                    Sistem güncel, aktif bildirim bulunmuyor.
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* 5. TEMİN 360 AI ASİSTAN MODALI */}
      {showAIModal && selectedFileForAI && (
        <AITextGeneratorModal
          isOpen={true}
          isAdvisorMode={true}
          fieldName="TEMİN 360 AI Karar Desteği"
          title={`TEMİN 360 AI Asistanı - ${
            selectedFileForAI.temin_no || "Mevzuat Rehberi"
          }`}
          initialPrompt={`Aşağıdaki konu ve bütçe detaylarına sahip kamu satın alma süreci için çalışıyorum:\n- Dosya/Konu: ${selectedFileForAI.konu}\n- Yaklaşık Maliyet: ${
            formatCurrency(
              selectedFileForAI.yaklasik_maliyet || 0,
            )
          }\n\nLütfen 4734 Sayılı Kamu İhale Kanunu ve ilgili mevzuata göre dikkat edilmesi gereken hususlar, piyasa araştırması esasları ve sonraki adımlar hakkında uzman tavsiyesi sun.`}
          placeholderMappings={{
            "[DOSYA_NO]": selectedFileForAI.temin_no || "Belirtilmemiş",
            "[DOSYA_KONU]": selectedFileForAI.konu || "Belirtilmemiş",
            "[DOSYA_MALIYET]": formatCurrency(
              selectedFileForAI.yaklasik_maliyet || 0,
            ),
          }}
          onClose={() => setShowAIModal(false)}
          onApply={(text) => {
            console.log("TEMİN 360 AI Yanıtı:", text);
            setShowAIModal(false);
          }}
          systemInstruction="Sen yetkin bir TEMİN 360 Kamu Satın Alma, Doğrudan Temin, Harcama ve Hakediş (4734 ve 5018 Sayılı Kanunlar) mevzuat uzmanı ve karar destek asistanısın. Kullanıcıya net, Sayıştay denetim standartlarına uygun, pratik ve yasal tavsiyeler ver. ÖNEMLİ GİZLİLİK KURALI: Eğer kullanıcıdan gelen metin içinde belirli bir Kurum Adı, Belediye, Kişi Adı-Soyadı, TC No veya açık adres geçiyorsa; cevabında bu özel isimleri asla açıkça kullanma, '[İlgili Kurum]' veya '[İlgili Kişi]' şeklinde sansürle (maskele)."
        />
      )}
    </div>
  );
}

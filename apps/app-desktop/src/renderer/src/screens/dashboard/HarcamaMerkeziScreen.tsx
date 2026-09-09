import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  Calculator,
  CheckCircle2,
  Compass,
  FileCheck,
  Gavel,
  Hammer,
  Info,
  Landmark,
  Layers,
  LayoutDashboard,
  Package,
  Plus,
  Receipt,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { useSettingsStore } from "../../store/settingsStore";
import { useDosyalarHooks } from "../dosyalar/dosyalar.hooks";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

export default function HarcamaMerkeziScreen(): React.JSX.Element {
  const { institutionName, limitType } = useSettingsStore();
  const { dosyalar } = useDosyalarHooks();

  // State for Live Tender Law & Budget Calculator
  const [simulatedBudget, setSimulatedBudget] = useState<number>(650000);
  const [simulatedWorkType, setSimulatedWorkType] = useState<
    "mal" | "hizmet" | "yapim"
  >("mal");

  // State for Interactive Wizard
  const [wizardStep, setWizardStep] = useState<number>(0);
  const [wizardSelection, setWizardSelection] = useState<{
    kategori?: "yapim" | "mal" | "hizmet" | "danismanlik";
    alimTuru?: "dogrudan_temin" | "ihale" | "hakedis";
    butce?: "limit_alti" | "limit_ustu";
  }>({});

  // Format Currency Helper
  const formatCurrency = (val: number): string => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const activeLimit = limitType === "buyuksehir" ? 1021827 : 340391;

  // 4 Core Public Expenditure Modules Definition
  const MODULES = [
    {
      id: "yapim",
      title: "Yapım İşleri & Hakediş Yönetimi",
      subTitle: "Anahtar Teslimi Götürü Bedel & Birim Fiyatlı Hakedişler",
      icon: Hammer,
      badge: "İLBANK & ÇŞB Uyumlu",
      badgeColor:
        "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
      gradient:
        "from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/30",
      headerBg: "bg-amber-500",
      description:
        "Kaba inşaat, altyapı, kanalizasyon, yol, içme suyu, parke ve bina yapım projelerinde pursantaj bazlı fiziki ilerleme ve hak ediş evrakları.",
      features: [
        "Pursantaj (Ağırlık Yüzdeleri) ve İlerleme Cetveli",
        "Kümülatif Hakediş Hesabı & Önceki Dönem Mahsubu",
        "Fiyat Farkı Hesabı (TÜİK Endeksleri Katsayılı)",
        "İhzarat Malzeme Tutanağı & Şantiye Ataşmanı",
        "Dizi Pusulası, İcmal & Sayıştay Denetim Kapakları",
        "Kesintiler (Stopaj %5, Damga Vergisi %0.948, Ceza)",
      ],
      actionLabel: "Hakediş Modülünü Aç",
      actionPath: "/hakedis",
      isBeta: true,
    },
    {
      id: "mal",
      title: "Mal Alımları & Taşınır Kayıt",
      subTitle: "Teknik Şartname, Muayene Kabul & Ambar Girişi",
      icon: Package,
      badge: "TKYS & TİF Entegre",
      badgeColor:
        "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
      gradient:
        "from-blue-500/10 via-blue-500/5 to-transparent border-blue-500/30",
      headerBg: "bg-blue-600",
      description:
        "Demirbaş, araç-gereç, yedek parça, kırtasiye ve sarf malzeme alımlarında piyasa araştırmasından taşınır kayıt fişine tam kabul zinciri.",
      features: [
        "Piyasa Fiyat Araştırma Tutanağı & Teklifler",
        "Muayene ve Kabul Komisyonu Tutanağı",
        "Taşınır İşlem Fişi (TİF) & Ambar Stok Girişi",
        "Sevk İrsaliyesi, Fatura & Garanti Belgeleri",
        "Partili / Taksitli Teslimat Kabul Çizelgesi",
        "MİF (Muhasebe İşlem Fişi) & Ödeme Emri Belgesi",
      ],
      actionLabel: "Mal Alımı Süreci Başlat",
      actionPath: "/dosyalar/yeni",
      isBeta: false,
    },
    {
      id: "hizmet",
      title: "Hizmet Alımı & Puantaj Takibi",
      subTitle: "Aylık Hak Ediş İcmali, Personel & Araç Takibi",
      icon: Truck,
      badge: "SGK & Puantaj Kontrollü",
      badgeColor:
        "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
      gradient:
        "from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/30",
      headerBg: "bg-emerald-600",
      description:
        "Temizlik, güvenlik, iş makinesi/araç kiralama, bakım-onarım ve danışmanlık hizmetlerinin aylık hakediş ve SGK doğrulama süreçleri.",
      features: [
        "Aylık Personel Puantajı & Vardiya Takip Cetveli",
        "Araç & İş Makinesi Çalışma Saati Çizelgesi",
        "Aylık SGK Prim Hizmet Listesi & Borcu Yoktur Doğrulama",
        "Maaş Banka Dekontu & İşçi Hakları Denetimi",
        "Aylık Hizmet Kabul Tutanağı & Kesinti Raporu",
        "Hizmet Hakediş İcmali & Vezne Ödeme Emri",
      ],
      actionLabel: "Hizmet Hakedişi Başlat",
      actionPath: "/hakedis",
      isBeta: true,
    },
    {
      id: "dogrudan_temin",
      title: "Doğrudan Temin (4734 KİK 22/a-d)",
      subTitle: "Hızlı Alım, Lüzum Müzekkeresi & Onay Belgesi",
      icon: FileCheck,
      badge: `Limit: ${formatCurrency(activeLimit)}`,
      badgeColor:
        "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
      gradient:
        "from-indigo-500/10 via-indigo-500/5 to-transparent border-indigo-500/30",
      headerBg: "bg-indigo-600",
      description:
        "İhale yapılmaksızın harcama yetkilisince görevlendirilen kişi/komisyon tarafından piyasadan en uygun fiyatla yapılan hızlı kamu alımları (yalnızca mal alımı).",
      features: [
        "Lüzum Müzekkeresi & İhtiyaç Talep Formu",
        "Yaklaşık Maliyet Cetveli (Birim Fiyat Teklifli)",
        "Fiyat Araştırma & Teklif İsteme Mektupları",
        "Doğrudan Temin Onay Belgesi (Harcama Yetkilisi)",
        "Sözleşme & Taahhütname Taslağı (Opsiyonel)",
        "Klasör Sırtlığı, Dizi Pusulası & Arşivleme",
      ],
      actionLabel: "Doğrudan Temin Başlat",
      actionPath: "/dosyalar/yeni",
      isBeta: false,
    },
  ];

  return (
    <div className="flex flex-col gap-8 w-full max-w-[1600px] mx-auto pb-12 animate-in fade-in duration-300">
      {/* 1. TOP HERO BANNER: KAMU HARCAMA & HAKEDİŞ MERKEZİ (TEMİN 360) */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 text-white shadow-2xl p-8 md:p-10">
        {/* Glow Effects */}
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-20 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1.5 uppercase tracking-wider">
                <Landmark className="w-3.5 h-3.5" />{" "}
                TEMİN 360 • Harcama & Hakediş Merkezi
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />{" "}
                4734 / 4735 / 5018 Sayılı Mevzuat Uyumlu
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                İller Bankası (İLBANK) Formatı
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white leading-tight">
              Kamu Harcama, İhale, Malzeme ve Hakediş Yönetim Süiti
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              Doğrudan teminden anahtar teslimi yapım işlerine, İller Bankası
              pursantajlı hakedişlerinden mal ve hizmet kabul evraklarına kadar
              tüm kamu mali süreçlerini tek ekrandan yönetin.
            </p>

            <div className="flex items-center gap-6 pt-2 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <strong className="text-white font-bold">
                  {institutionName || "Kurum Adı"}
                </strong>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                KİK 22/d Tekil Limit:
                <strong className="text-emerald-400 font-mono font-bold">
                  {formatCurrency(activeLimit)}
                </strong>
              </span>
              <span>•</span>
              <span>
                Aktif Kayıtlı Dosya:
                <strong className="text-indigo-300 font-bold ml-1">
                  {dosyalar.length} Adet
                </strong>
              </span>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full sm:w-auto shrink-0">
            <Link to="/dosyalar/yeni" className="w-full">
              <Button className="w-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs py-3 px-6 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all">
                <Plus className="w-4 h-4" /> Yeni Harcama / Dosya Başlat
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Link to="/" className="flex-1">
                <Button
                  variant="outline"
                  className="w-full border-slate-700 hover:bg-slate-800  text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-indigo-400" />
                  {" "}
                  Klasik Panel
                </Button>
              </Link>
              <Link to="/mevzuat" className="flex-1">
                <Button
                  variant="outline"
                  className="w-full border-slate-700 hover:bg-slate-800  text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Scale className="w-3.5 h-3.5 text-amber-400" /> KİK Limitleri
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CORE PROCESS CARDS GRID (4 BÜYÜK KAMU SÜRECİ) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Kamu Harcama ve Alım Süreçleri Modül Kataloğu
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              İhtiyacınıza uygun iş türünü seçin, sistem ilgili şartnameye ve
              İller Bankası standartlarına göre evrak setini otomatik
              oluştursun.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MODULES.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.id}
                className={`relative flex flex-col justify-between p-6 rounded-3xl border transition-all duration-300 hover:shadow-xl hover:scale-[1.01] bg-linear-to-br ${mod.gradient} bg-white dark:bg-slate-900`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md ${mod.headerBg}`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border inline-block mb-1 ${mod.badgeColor}`}
                        >
                          {mod.badge}
                        </span>
                        <h3 className="text-base font-black text-slate-900 dark:text-slate-100 leading-snug">
                          {mod.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          {mod.subTitle}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-4 leading-relaxed font-normal">
                    {mod.description}
                  </p>

                  {/* Feature Bullets */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                    <h4 className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      📋 Üretilen Resmi Evraklar & Hesaplamalar:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {mod.features.map((feat, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-1.5 text-slate-600 dark:text-slate-400 text-[11px]"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Bottom CTA Button */}
                <div className="mt-6 pt-4 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-mono">
                      Mevzuat: <strong>4734 / 4735 KİK</strong>
                    </span>
                    {mod.isBeta && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-rose-500/15 text-rose-400 border border-rose-500/30">
                        BETA
                      </span>
                    )}
                  </div>
                  <Link to={mod.actionPath}>
                    <Button className="bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer">
                      {mod.actionLabel} <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2.5. 4734 SAYILI KANUN: BÜTÇE LİMİTLERİ, İHALE USULLERİ & CANLI SİMÜLATÖR */}
      <div className="p-6 md:p-8 rounded-3xl bg-linear-to-br from-slate-900 via-indigo-950/80 to-slate-900 border border-indigo-500/30 text-white space-y-6 shadow-2xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-indigo-500/20 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600/30 border border-indigo-400/30 text-indigo-300 flex items-center justify-center shrink-0 shadow-inner">
              <Gavel className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base md:text-lg font-black text-white">
                  4734 Sayılı Kamu İhale Kanunu: İhale Usulü ve Bütçe Karar
                  Matrisi
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                  Madde 18 - 22 & 62/ı
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Bütçe tutarınıza göre Açık İhale mi, Pazarlık Usulü mü yoksa
                Doğrudan Temin mi uygulanacağını anında tespit edin.
              </p>
            </div>
          </div>
          <Link to="/mevzuat">
            <Button
              variant="outline"
              size="sm"
              className="border-indigo-400/40 text-indigo-200 hover:bg-indigo-950 text-xs font-semibold"
            >
              <Scale className="w-3.5 h-3.5 mr-1 text-amber-400" />{" "}
              KİK Tebliği ve Eşik Değerler
            </Button>
          </Link>
        </div>

        {/* LIVE BUDGET CALCULATOR & DECISION BOX */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left: Input & Selection */}
          <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-950/80 border border-indigo-500/20 flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-indigo-400" />{" "}
                  Tahmini Alım / Hakediş Bütçesi (TL)
                </label>
                <span className="text-[10px] font-mono text-slate-400">
                  KDV Hariç
                </span>
              </div>
              <div className="relative">
                <Input
                  type="number"
                  value={simulatedBudget}
                  onChange={(e) =>
                    setSimulatedBudget(Number(e.target.value) || 0)}
                  className="text-base font-mono font-bold bg-slate-900 border-indigo-500/40 text-white pl-4 pr-12 h-11"
                  placeholder="Örn: 500000"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-indigo-400">
                  TL
                </span>
              </div>

              {/* Work Type Selection */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">
                  İş / Alım Türü:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "mal", label: "Mal Alımı", icon: Package },
                    { id: "hizmet", label: "Hizmet Alımı", icon: Truck },
                    { id: "yapim", label: "Yapım İşi", icon: Hammer },
                  ].map((t) => {
                    const TIcon = t.icon;
                    const isSelected = simulatedWorkType === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() =>
                          setSimulatedWorkType(
                            t.id as "mal" | "hizmet" | "yapim",
                          )}
                        className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                          isSelected
                            ? "bg-indigo-600 border-indigo-400 text-white shadow-md"
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                        }`}
                      >
                        <TIcon className="w-4 h-4" />
                        <span className="text-[11px] font-bold">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[10px] text-slate-400">
                  Hızlı Değerler:
                </span>
                {[
                  { label: "250 Bin", val: 250000 },
                  { label: "Limit (~1M)", val: activeLimit },
                  { label: "2.5 Milyon", val: 2500000 },
                  { label: "15 Milyon", val: 15000000 },
                ].map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setSimulatedBudget(p.val)}
                    className="px-2 py-0.5 rounded-md bg-slate-900 hover:bg-indigo-900 border border-slate-800 text-[10px] font-mono text-slate-300 cursor-pointer transition-colors"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-[11px] text-indigo-300 flex items-start gap-2">
              <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <span>
                Kurumunuz için geçerli tekil 22/d KİK limiti:
                <strong className="text-white ml-1 font-mono">
                  {formatCurrency(activeLimit)}
                </strong>
              </span>
            </div>
          </div>

          {/* Right: Real-time Analysis & Statutory Path */}
          <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-950/90 border border-indigo-500/30 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Mevzuat Analiz Sonucu
                </span>
                <span className="font-mono text-xs font-bold text-amber-400">
                  Hesaplanan Tutar: {formatCurrency(simulatedBudget)}
                </span>
              </div>

              {/* Decision Result Banner */}
              {simulatedBudget <= activeLimit
                ? (
                  <div className="mt-4 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        ⚡ KİK Madde 22/d: DOĞRUDAN TEMİN LİMİTİ DAHİLİNDE
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white">
                      Bu alım ihale açılmaksızın doğrudan temin usulüyle
                      yapılabilir.
                    </h4>
                    <p className="text-xs text-emerald-200/80 leading-relaxed">
                      İlan ve teminat alma zorunluluğu yoktur. İhale komisyonu
                      kurulması zorunlu değildir; harcama yetkilisince
                      görevlendirilecek personel piyasa fiyat araştırması
                      yaparak onay belgesi düzenleyebilir.
                    </p>
                  </div>
                )
                : simulatedBudget <= activeLimit * 2
                ? (
                  <div className="mt-4 p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        ⚖️ KİK Madde 21/f veya Madde 19: PAZARLIK / AÇIK İHALE
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white">
                      Doğrudan temin limiti aşılmıştır. İhale usulü zorunludur!
                    </h4>
                    <p className="text-xs text-amber-200/80 leading-relaxed">
                      Bu tutar tek seferde doğrudan teminle karşılanamaz. KİK
                      Md. 21/f pazarlık usulü (ilan yapılmaksızın en az 3
                      istekli davetiyle) veya Md. 19 Açık İhale usulü tercih
                      edilmelidir. İhale komisyonu ve %6 kesin teminat şarttır.
                    </p>
                  </div>
                )
                : (
                  <div className="mt-4 p-4 rounded-2xl bg-blue-950/40 border border-blue-500/40 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-500/20 text-blue-300 border border-blue-500/40">
                        🏛️ KİK Madde 19: AÇIK İHALE USULÜ ZORUNLUDUR
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white">
                      Yüksek tutarlı alım: EKAP üzerinden Açık İhale ilanı
                      zorunludur.
                    </h4>
                    <p className="text-xs text-blue-200/80 leading-relaxed">
                      Tüm isteklilere açık EKAP ilanı verilmeli, kanuni ilan
                      askı süreleri (14/21/40 gün) beklenmeli, %3 geçici teminat
                      ve %6 kesin teminat tahsil edilmelidir.
                    </p>
                  </div>
                )}

              {/* Comparison Checklist */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 text-[11px]">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">
                    EKAP İlanı:
                  </span>
                  <strong className="text-white">
                    {simulatedBudget <= activeLimit
                      ? "❌ Aranmaz"
                      : "✅ Zorunlu"}
                  </strong>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">
                    Teminat:
                  </span>
                  <strong className="text-white">
                    {simulatedBudget <= activeLimit
                      ? "❌ Aranmaz"
                      : "✅ %6 Kesin Teminat"}
                  </strong>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">
                    İhale Komisyonu:
                  </span>
                  <strong className="text-white">
                    {simulatedBudget <= activeLimit
                      ? "❌ İsteğe Bağlı"
                      : "✅ Zorunlu"}
                  </strong>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">
                    Hakediş / İcmal:
                  </span>
                  <strong className="text-white">
                    {simulatedWorkType === "yapim" ||
                        simulatedBudget > activeLimit
                      ? "✅ Zorunlu"
                      : "📄 Fatura / TİF"}
                  </strong>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Kanun Referansı: <strong>4734 Sayılı KİK Madde 18-22</strong>
              </span>
              <Link
                to={simulatedBudget <= activeLimit
                  ? "/dosyalar/yeni"
                  : "/hakedis"}
              >
                <Button className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-1.5 px-4 rounded-xl cursor-pointer flex items-center gap-1">
                  {simulatedBudget <= activeLimit ? "Doğrudan Temin Başlat" : (
                    <>
                      İhale Modülü{" "}
                      <span className="px-1 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-rose-500/20 text-rose-300 border border-rose-500/30 ml-1">
                        BETA
                      </span>
                    </>
                  )}
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* SAYIŞTAY VE KİK KRİTİK DENETİM KURALLARI (MADDE 5 & 62/ı) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-indigo-500/20">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-rose-500/30 space-y-1.5">
            <h4 className="text-xs font-extrabold text-rose-400 flex items-center gap-1.5 uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4" />{" "}
              KİK Madde 5: Kısımlara Bölme Yasağı
            </h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Eşik değerlerin altında kalmak veya 22/d doğrudan temin limitini
              aşmamak amacıyla{" "}
              <strong>aynı nitelikteki bir iş parçalara bölünerek</strong>{" "}
              ayrı ayrı doğrudan teminle yapılamaz. Sayıştay denetimlerinde en
              çok zimmet çıkan konudur.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-amber-500/30 space-y-1.5">
            <h4 className="text-xs font-extrabold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4" />{" "}
              KİK Madde 62/ı: %10 Bütçe Sınırı Kuralı
            </h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              İdarelerin 21/f (pazarlık) ve 22/d (doğrudan temin) ile
              yapacakları harcamaların toplamı, o yılki toplam mal/hizmet
              bütçelerinin{" "}
              <strong>%10&apos;unu aşamaz</strong>. Aşılması durumunda önceden
              Kamu İhale Kurulu&apos;ndan (KİK) izin alınması zorunludur.
            </p>
          </div>
        </div>
      </div>

      {/* 3. İLLER BANKASI & SAYIŞTAY DENETİM KRİTERLERİ BİLGİ PANELİ */}
      <div className="p-6 md:p-8 rounded-3xl bg-slate-900 border border-slate-800 text-white space-y-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                İller Bankası (İLBANK) & Sayıştay Hakediş Güvencesi
              </h3>
              <p className="text-xs text-slate-400">
                Neden hakediş ve harcama evrakları bu kadar katı kurallara
                bağlıdır?
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
            5018 Sayılı Kamu Mali Yönetimi Kanunu
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
            <h4 className="text-sm font-bold text-amber-400 flex items-center gap-1.5">
              <Landmark className="w-4 h-4" /> 1. Şahsi Zimmet & Mali Sorumluluk
            </h4>
            <p className="text-slate-300 leading-relaxed">
              İller Bankası mühendisleri ve belediye harcama yetkilileri,
              imzalanan hakedişlerdeki her kuruştan şahsi mal varlıklarıyla
              sorumludur. Eksik pursantaj veya hatalı yeşil defter doğrudan{" "}
              <strong>kamu zararı</strong> sayılır.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
            <h4 className="text-sm font-bold text-blue-400 flex items-center gap-1.5">
              <Receipt className="w-4 h-4" /> 2. Dizi Pusulası & Kesinti Zinciri
            </h4>
            <p className="text-slate-300 leading-relaxed">
              SGK Borcu Yoktur, Vergi Borcu Yoktur, %5 Stopaj Kesintisi ve Damga
              Vergisi kesintisi olmadan hakediş vezneden çıkamaz. Sistem bu
              kesintileri kuruşu kuruşuna otomatik yapar.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
            <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> 3. Laboratuvar & Deney Onayı
            </h4>
            <p className="text-slate-300 leading-relaxed">
              Beton kırım raporları, boru sızdırmazlık testleri ve şantiye
              ataşman defterleri hakedişin ayrılmaz ekidir. TEMİN 360 dizi
              pusulasında tüm ekleri eksiksiz numaralandırır.
            </p>
          </div>
        </div>
      </div>

      {/* 4. AKILLI SÜREÇ SİHİRBAZI (INTERACTIVE DECISION WIZARD) */}
      <div className="p-6 md:p-8 rounded-3xl bg-linear-to-br from-indigo-50/70 via-white to-blue-50/70 dark:from-slate-900/90 dark:via-slate-900 dark:to-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-indigo-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                Akıllı Süreç & İhale Türü Seçim Rehberi
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Yapacağınız harcama veya hakedişin hangi kategoriye girdiğinden
                emin değil misiniz? Birkaç adımda öğrenin.
              </p>
            </div>
          </div>
          {wizardStep > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setWizardStep(0);
                setWizardSelection({});
              }}
              className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            >
              Yeniden Başlat
            </Button>
          )}
        </div>

        {/* Wizard Steps */}
        {wizardStep === 0 && (
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              1. Adım: Yapılacak işin ana niteliği nedir?
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => {
                  setWizardSelection((prev) => ({
                    ...prev,
                    kategori: "yapim",
                  }));
                  setWizardStep(1);
                }}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 text-left transition-all group cursor-pointer"
              >
                <Hammer className="w-6 h-6 text-amber-500 mb-2 group-hover:scale-110 transition-transform" />
                <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                  İnşaat, Onarım, Tesis veya Altyapı
                </h5>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Bina, asfalt, kilit parke, kanalizasyon, tadilat veya tesis
                  yapımı.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setWizardSelection((prev) => ({ ...prev, kategori: "mal" }));
                  setWizardStep(1);
                }}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 text-left transition-all group cursor-pointer"
              >
                <Package className="w-6 h-6 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
                <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                  Malzeme, Teçhizat veya Ürün Satın Alma
                </h5>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Kırtasiye, akaryakıt, yedek parça, çimento, boru, bilgisayar
                  vb.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setWizardSelection((prev) => ({
                    ...prev,
                    kategori: "hizmet",
                  }));
                  setWizardStep(1);
                }}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 text-left transition-all group cursor-pointer"
              >
                <Truck className="w-6 h-6 text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
                <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                  Hizmet, İşçilik veya Araç Kiralama
                </h5>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Personel, temizlik, güvenlik, araç kiralama, bakım ve
                  danışmanlık.
                </p>
              </button>
            </div>
          </div>
        )}

        {wizardStep === 1 && (
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              2. Adım: Tahmini bütçe ve ödeme modeli nasıl olacak?
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => {
                  setWizardSelection((prev) => ({
                    ...prev,
                    butce: "limit_alti",
                    alimTuru: "dogrudan_temin",
                  }));
                  setWizardStep(2);
                }}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 text-left transition-all group cursor-pointer"
              >
                <FileCheck className="w-6 h-6 text-indigo-500 mb-2 group-hover:scale-110 transition-transform" />
                <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                  Doğrudan Temin Limiti Altında ({formatCurrency(activeLimit)})
                </h5>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  KİK 22/d maddesi uyarınca komisyonsuz, hızlı onay belgesi ve
                  piyasa araştırması ile tek seferlik alım.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setWizardSelection((prev) => ({
                    ...prev,
                    butce: "limit_ustu",
                    alimTuru: "hakedis",
                  }));
                  setWizardStep(2);
                }}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 text-left transition-all group cursor-pointer"
              >
                <Hammer className="w-6 h-6 text-amber-500 mb-2 group-hover:scale-110 transition-transform" />
                <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                  Sözleşmeli / İhaleli veya Aylık Hak Ediş Süreci
                </h5>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Pursantaj tablosu, hakediş icmali, fiyat farkı ve Sayıştay
                  denetim kapakları gerektiren taksitli süreç.
                </p>
              </button>
            </div>
          </div>
        )}

        {wizardStep === 2 && (
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-950 border border-indigo-200 dark:border-indigo-900 space-y-4">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4" />{" "}
              Önerilen Süreç ve Evrak Seti Belirlendi
            </div>

            <h4 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
              {wizardSelection.kategori === "yapim" &&
                  wizardSelection.alimTuru === "hakedis"
                ? "🏗️ Anahtar Teslimi / Birim Fiyatlı Yapım İşi Hakediş Süreci"
                : wizardSelection.kategori === "mal"
                ? "📦 Mal Alımı Muayene Kabul ve Taşınır Kayıt (TİF) Süreci"
                : wizardSelection.kategori === "hizmet"
                ? "📋 Hizmet Alımı Puantaj & SGK Kontrollü Aylık Hakediş Süreci"
                : "⚡ 4734 Sayılı KİK 22/d Doğrudan Temin Alım Süreci"}
            </h4>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Seçtiğiniz parametrelere göre sistem arka planda gerekli mevzuat
              şablonlarını, dizi pusulası fihristini ve onay mercilerini
              otomatik hazırlayacaktır.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <Link
                to={wizardSelection.alimTuru === "dogrudan_temin"
                  ? "/dosyalar/yeni"
                  : "/hakedis"}
              >
                <Button className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2.5 px-5 rounded-xl shadow-md cursor-pointer flex items-center gap-1.5">
                  Bu Süreçle Dosya Oluştur
                  {wizardSelection.alimTuru !== "dogrudan_temin" && (
                    <span className="px-1 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      BETA
                    </span>
                  )}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => {
                  setWizardStep(0);
                  setWizardSelection({});
                }}
                className="text-xs border-slate-300 dark:border-slate-700"
              >
                Farklı Bir Seçim Yap
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

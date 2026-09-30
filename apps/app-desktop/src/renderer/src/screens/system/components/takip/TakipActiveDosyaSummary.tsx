import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  Calculator,
  CheckSquare,
  ChevronRight,
  ClipboardList,
  Coins,
  Edit,
  ExternalLink,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Layers,
  MoreVertical,
  Printer,
  Trash2,
} from "lucide-react";

interface TakipActiveDosyaSummaryProps {
  activeDosya: any;
  kalemler: any[];
  firmalar: any[];
  formatCurrency: (val: number) => string;
  onEditClick: () => void;
  onSurecAkisiClick: () => void;
  onOpenNewWindowClick: () => void;
  onDeleteClick: () => void;
}

export function TakipActiveDosyaSummary({
  activeDosya,
  kalemler,
  firmalar,
  formatCurrency,
  onEditClick,
  onSurecAkisiClick,
  onOpenNewWindowClick,
  onDeleteClick,
}: TakipActiveDosyaSummaryProps): React.JSX.Element {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
      {/* Dossier Basic Info */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div className="space-y-1.5 flex-1 min-w-[260px]">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-450 uppercase tracking-widest bg-blue-100/40 dark:bg-blue-955/40 px-2.5 py-1 rounded-full border border-blue-500/15">
              {activeDosya.temin_no || "Dosya No Belirtilmedi"}
            </span>
            <span
              className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                activeDosya.status === "tamamlandi"
                  ? "bg-emerald-100/40 text-emerald-600 border-emerald-500/15"
                  : activeDosya.status === "iptal"
                  ? "bg-rose-100/40 text-rose-600 border-rose-500/15"
                  : "bg-amber-100/40 text-amber-600 border-amber-500/15"
              }`}
            >
              {activeDosya.status === "tamamlandi"
                ? "Tamamlandı"
                : activeDosya.status === "iptal"
                ? "İptal Edildi"
                : "Devam Ediyor"}
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-850 dark:text-slate-100">
            {activeDosya.konu}
          </h2>
          <p className="text-xs text-slate-550 dark:text-slate-400 capitalize">
            Tür:{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-350">
              {activeDosya.tur} Alımı
            </span>{" "}
            | Birim:{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-350">
              {activeDosya.birim_adi || "Birim Belirtilmedi"}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2.5 select-none">
          <div className="text-right mr-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Yaklaşık Maliyet
            </span>
            <span className="text-xl font-mono font-extrabold text-slate-855 dark:text-slate-100">
              {formatCurrency(activeDosya.yaklasik_maliyet || 0)}
            </span>
          </div>

          <button
            onClick={onEditClick}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-600 dark:hover:text-white border border-blue-200 dark:border-blue-800/60 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
            title="Dosya Formunu Düzenle"
          >
            <Edit size={14} />
            Düzenle
          </button>

          <button
            onClick={onSurecAkisiClick}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-50 hover:bg-purple-600 text-purple-700 hover:text-white dark:bg-purple-950/40 dark:text-purple-300 dark:hover:bg-purple-600 dark:hover:text-white border border-purple-200 dark:border-purple-800/60 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
            title="Süreç Akış Haritasını Aç (Beta Tablar)"
          >
            <Layers size={14} />
            Süreç Akışı (Beta)
          </button>

          <div className="relative dosya-menu-container">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-205 hover:bg-slate-55 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-slate-200 dark:border-slate-800 h-10 w-10 flex items-center justify-center"
              title="Dosya İşlemleri"
            >
              <MoreVertical size={16} />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 py-2 flex flex-col text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-200">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onEditClick();
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200 flex items-center gap-2 transition-colors cursor-pointer border-0 bg-transparent font-semibold"
                >
                  <Edit size={14} className="text-slate-400" />
                  Dosyayı Düzenle
                </button>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenNewWindowClick();
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200 flex items-center gap-2 transition-colors cursor-pointer border-0 bg-transparent font-semibold"
                >
                  <ExternalLink size={14} className="text-slate-400" />
                  Yeni Pencerede Aç
                </button>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onSurecAkisiClick();
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-purple-50 dark:hover:bg-purple-950/20 text-purple-700 dark:text-purple-300 flex items-center gap-2 transition-colors cursor-pointer border-0 bg-transparent font-semibold"
                >
                  <Layers size={14} className="text-purple-500" />
                  Süreç Akış Haritası (Beta)
                </button>

                <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onDeleteClick();
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-955/20 text-red-600 dark:text-red-400 flex items-center gap-2 transition-colors cursor-pointer border-0 bg-transparent font-semibold"
                >
                  <Trash2
                    size={14}
                    className="text-red-400 dark:text-red-500"
                  />
                  Dosyayı İptal Et (Sil)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4 Ana Süreç Aşaması Kartları */}
      <div>
        <div className="flex items-center justify-between mb-3 select-none">
          <h4 className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-blue-500" />
            Doğrudan Temin Süreç Aşamaları
          </h4>
          <span className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
            4 Temel Aşama
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
          {/* 1. Aşama */}
          <Link
            to="/dosya/hazirlik-ve-ihtiyac"
            className="group relative p-4 bg-white dark:bg-slate-900/90 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 border border-slate-200/80 hover:border-blue-400/60 dark:border-slate-800 dark:hover:border-blue-500/40 rounded-2xl transition-all duration-200 flex flex-col justify-between min-h-[120px] cursor-pointer shadow-xs hover:shadow-md hover:-translate-y-0.5"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40">
                  1. Aşama
                </span>
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="w-3.5 h-3.5" />
                </div>
              </div>
              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 block group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                İhtiyaç & Hazırlık
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block leading-tight mt-1">
                Malzeme Kalemleri, Lüzum Müzekkeresi & Başlangıç Onayı
              </span>
              <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                <span
                  className={`text-[9.5px] font-bold px-2 py-0.5 rounded-md border ${
                    kalemler.length > 0
                      ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-900/50"
                      : "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                  }`}
                >
                  📦 {kalemler.length > 0
                    ? `${kalemler.length} Kalem Eklendi`
                    : "Kalem Eklenmedi"}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100 dark:border-slate-800/60 text-[10px] font-bold text-blue-600 dark:text-blue-400">
              <span>Aşamaya Git</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 2. Aşama */}
          <Link
            to="/dosya/piyasa-fiyat-arastirmasi"
            className="group relative p-4 bg-white dark:bg-slate-900/90 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 border border-slate-200/80 hover:border-emerald-400/60 dark:border-slate-800 dark:hover:border-emerald-500/40 rounded-2xl transition-all duration-200 flex flex-col justify-between min-h-[120px] cursor-pointer shadow-xs hover:shadow-md hover:-translate-y-0.5"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
                  2. Aşama
                </span>
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                </div>
              </div>
              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 block group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Piyasa Fiyat Araştırması
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block leading-tight mt-1">
                Firma Teklifleri, Teklif Cetveli & Fiyat Tutanağı
              </span>
              <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                <span
                  className={`text-[9.5px] font-bold px-2 py-0.5 rounded-md border ${
                    firmalar.length > 0
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900/50"
                      : "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                  }`}
                >
                  💼 {firmalar.length > 0
                    ? `${firmalar.length} Firma Teklifi`
                    : "Teklif Bekleniyor"}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100 dark:border-slate-800/60 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              <span>Aşamaya Git</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 3. Aşama */}
          <Link
            to="/dosya/siparis-ve-sozlesme"
            className="group relative p-4 bg-white dark:bg-slate-900/90 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 border border-slate-200/80 hover:border-amber-400/60 dark:border-slate-800 dark:hover:border-amber-500/40 rounded-2xl transition-all duration-200 flex flex-col justify-between min-h-[120px] cursor-pointer shadow-xs hover:shadow-md hover:-translate-y-0.5"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40">
                  3. Aşama
                </span>
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileCheck className="w-3.5 h-3.5" />
                </div>
              </div>
              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 block group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                Sipariş & Sözleşme
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block leading-tight mt-1">
                Temin Onay Belgesi, Sipariş Mektubu & Sözleşme
              </span>
              <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                <span
                  className={`text-[9.5px] font-bold px-2 py-0.5 rounded-md border ${
                    activeDosya.firma_id
                      ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900/50"
                      : "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                  }`}
                >
                  📝 {activeDosya.firma_id
                    ? "Yüklenici Belirlendi"
                    : "Karar / Sözleşme"}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100 dark:border-slate-800/60 text-[10px] font-bold text-amber-600 dark:text-amber-400">
              <span>Aşamaya Git</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 4. Aşama */}
          <Link
            to="/dosya/kabul-ve-odeme"
            className="group relative p-4 bg-white dark:bg-slate-900/90 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 border border-slate-200/80 hover:border-purple-400/60 dark:border-slate-800 dark:hover:border-purple-500/40 rounded-2xl transition-all duration-200 flex flex-col justify-between min-h-[120px] cursor-pointer shadow-xs hover:shadow-md hover:-translate-y-0.5"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/40">
                  4. Aşama
                </span>
                <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-650 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Coins className="w-3.5 h-3.5" />
                </div>
              </div>
              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 block group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                Muayene, Kabul & Ödeme
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block leading-tight mt-1">
                Muayene Kabul Tutanağı, TİF & Ödeme Emri Belgesi
              </span>
              <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                <span
                  className={`text-[9.5px] font-bold px-2 py-0.5 rounded-md border ${
                    activeDosya.status === "tamamlandi"
                      ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-900/50"
                      : "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                  }`}
                >
                  🏁 {activeDosya.status === "tamamlandi"
                    ? "Süreç Tamamlandı"
                    : "Kabul & Ödeme"}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100 dark:border-slate-800/60 text-[10px] font-bold text-purple-600 dark:text-purple-400">
              <span>Aşamaya Git</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* Hızlı İşlemler & Ek Modüller */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60 overflow-x-auto pb-1">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 shrink-0 select-none">
            Hızlı Araçlar:
          </span>
          <Link
            to="/dosya/cikti-merkezi"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700/60 text-xs font-bold transition-all shrink-0 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-blue-500" />
            Dosya Çıktı Merkezi
          </Link>
          <Link
            to="/dosya/klasor-ve-kapaklar"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 text-xs font-bold transition-all shrink-0 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-500" />
            Klasör & Kapaklar
          </Link>
          <Link
            to="/dosya/firmalar-maliyet/yaklasik"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 text-xs font-bold transition-all shrink-0 cursor-pointer"
          >
            <Calculator className="w-3.5 h-3.5 text-indigo-500" />
            Yaklaşık Maliyet Cetveli
          </Link>
          <Link
            to="/dosya/fatura-ve-irsaliye"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 text-xs font-bold transition-all shrink-0 cursor-pointer"
          >
            <ClipboardList className="w-3.5 h-3.5 text-emerald-500" />
            Fatura & İrsaliye
          </Link>
          <Link
            to="/dosya/imzali-belgeler"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 text-xs font-bold transition-all shrink-0 cursor-pointer"
          >
            <FileCheck className="w-3.5 h-3.5 text-purple-500" />
            İmzalı Belgeler
          </Link>
          <Link
            to="/notlar"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 text-xs font-bold transition-all shrink-0 cursor-pointer"
          >
            <CheckSquare className="w-3.5 h-3.5 text-blue-500" />
            Notlar & To-Do
          </Link>
        </div>
      </div>
    </div>
  );
}

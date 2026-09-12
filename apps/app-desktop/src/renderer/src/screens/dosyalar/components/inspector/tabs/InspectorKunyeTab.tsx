import React from "react";
import { Briefcase, Building2, DollarSign, Info } from "lucide-react";
import { formatDate, formatMoney, turLabelMap } from "../types";

interface InspectorKunyeTabProps {
  dosya: any;
  toplamYaklasikMaliyet: number;
}

export const InspectorKunyeTab: React.FC<InspectorKunyeTabProps> = ({
  dosya,
  toplamYaklasikMaliyet,
}) => {
  const d = dosya;

  return (
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
              <span className="text-slate-500">KİK Dayanağı / Madde</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {d.ihale_sekli || "22/d*"}
              </span>
            </div>
            <div className="flex justify-between items-center px-3.5 py-2">
              <span className="text-slate-500">Teklif & Sözleşme Türü</span>
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
              <span className="text-slate-500">Kısmi Teklif Durumu</span>
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
              <span className="text-slate-500">Karar / Temin Tarihi</span>
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
              <span className="text-slate-500">Gerçekleştirme Görevlisi</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {d.sunan_ad || "-"}
              </span>
            </div>
            <div className="flex justify-between items-center px-3.5 py-2">
              <span className="text-slate-500">Piyasa Araştırma Görevlisi</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {d.hazirlayan_ad || "-"}
              </span>
            </div>
            <div className="flex justify-between items-center px-3.5 py-2">
              <span className="text-slate-500">Talep Eden Personel</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {d.talep_eden_ad || "-"}
              </span>
            </div>
            <div className="flex justify-between items-center px-3.5 py-2">
              <span className="text-slate-500">Tahmini Teslim Tarihi</span>
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
  );
};

import React from "react";
import { Info, Search, User } from "lucide-react";
import { YeniDosyaTabProps } from "../../../types";

export function SorumlularVeSurecTarihleriSection(
  props: YeniDosyaTabProps,
): React.JSX.Element {
  const {
    formData,
    setFormData,
    personeller,
    showPersonelSearch,
    setShowPersonelSearch,
    personelSearchQuery,
    setPersonelSearchQuery,
    filteredPersoneller,
  } = props;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
        <User className="text-blue-500 w-5 h-5" />
        <h2 className="text-base font-bold text-slate-800 dark:text-white">
          Yetkililer, Süreç Tarihleri ve İdari Kayıtlar
        </h2>
      </div>

      <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 p-4 rounded-xl text-xs text-blue-700 dark:text-blue-300">
        <Info className="w-5 h-5 shrink-0 text-blue-500 dark:text-blue-400 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Yetkili Personel & Tarih Bilgilendirmesi</p>
          <p className="leading-relaxed opacity-90">
            Doğrudan temin evraklarının alt bilgileri, onay ve imza alanlarında
            yer alacak personelleri (İrtibat Yetkilisi, Dosyayı Hazırlayan,
            Talep Eden, Sunan ve Onaylayan) buradan belirleyebilirsiniz. Ayrıca
            talebe ait resmî evrak numarası, teklif alma ve teslim tarihlerini
            girerek şablonların otomatik dolmasını sağlayabilirsiniz.
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 italic mt-2 block">
            * Not: Bu alanlar üzerinde ilerleyen süreçlerde daha da sadeleştirme
            ve otomatik tamamlama iyileştirmeleri yapılabilir.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* HAZIRLAYAN PERSONEL */}
        <div className="relative">
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-455 mb-1.5">
            Dosyayı Hazırlayan Personel
          </label>
          <button
            type="button"
            onClick={() =>
              setShowPersonelSearch?.(
                showPersonelSearch === "hazirlayan" ? null : "hazirlayan",
              )}
            className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none text-slate-800 dark:text-slate-200 text-left"
          >
            <span>
              {formData.hazirlayan_personel_id
                ? personeller.find((p) =>
                  p.id === formData.hazirlayan_personel_id
                )?.ad_soyad
                : "Hazırlayan Seçin..."}
            </span>
            <Search size={14} className="text-slate-400" />
          </button>

          {showPersonelSearch === "hazirlayan" && (
            <div className="absolute left-0 mt-1.5 w-full bg-white dark:bg-slate-955 border border-slate-250 dark:border-slate-800 rounded-2xl shadow-xl p-2 z-50">
              <input
                type="text"
                placeholder="Personel ara..."
                value={personelSearchQuery}
                onChange={(e) => setPersonelSearchQuery?.(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 mb-2"
                autoFocus
              />
              <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-0.5">
                {(filteredPersoneller ?? []).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        hazirlayan_personel_id: p.id,
                      }));
                      setShowPersonelSearch?.(null);
                      setPersonelSearchQuery?.("");
                    }}
                    className="w-full text-left p-2 text-xs rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                  >
                    {p.ad_soyad}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* TALEP EDEN (ŞUBE MÜDÜRÜ VB) */}
        <div className="relative">
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-455 mb-1.5">
            Talep Eden Personel
          </label>
          <button
            type="button"
            onClick={() =>
              setShowPersonelSearch?.(
                showPersonelSearch === "talep_eden" ? null : "talep_eden",
              )}
            className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none text-slate-800 dark:text-slate-200 text-left"
          >
            <span>
              {formData.talep_eden_personel_id
                ? personeller.find((p) =>
                  p.id === formData.talep_eden_personel_id
                )?.ad_soyad
                : "Talep Eden Personel Seçin..."}
            </span>
            <Search size={14} className="text-slate-400" />
          </button>

          {showPersonelSearch === "talep_eden" && (
            <div className="absolute left-0 mt-1.5 w-full bg-white dark:bg-slate-955 border border-slate-250 dark:border-slate-800 rounded-2xl shadow-xl p-2 z-50">
              <input
                type="text"
                placeholder="Personel ara..."
                value={personelSearchQuery}
                onChange={(e) => setPersonelSearchQuery?.(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 mb-2"
                autoFocus
              />
              <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-0.5">
                {(filteredPersoneller ?? []).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        talep_eden_personel_id: p.id,
                      }));
                      setShowPersonelSearch?.(null);
                      setPersonelSearchQuery?.("");
                    }}
                    className="w-full text-left p-2 text-xs rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                  >
                    {p.ad_soyad}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* HARCAMA YETKİLİSİ (ONAY VEREN) */}
        <div className="relative">
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-455 mb-1.5">
            Harcama Yetkilisi (Onaylayan)
          </label>
          <button
            type="button"
            onClick={() =>
              setShowPersonelSearch?.(
                showPersonelSearch === "onay" ? null : "onay",
              )}
            className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none text-slate-800 dark:text-slate-200 text-left"
          >
            <span>
              {formData.onay_personel_id
                ? personeller.find((p) => p.id === formData.onay_personel_id)
                  ?.ad_soyad
                : "Harcama Yetkilisi Seçin..."}
            </span>
            <Search size={14} className="text-slate-400" />
          </button>

          {showPersonelSearch === "onay" && (
            <div className="absolute left-0 mt-1.5 w-full bg-white dark:bg-slate-955 border border-slate-250 dark:border-slate-800 rounded-2xl shadow-xl p-2 z-50">
              <input
                type="text"
                placeholder="Personel ara..."
                value={personelSearchQuery}
                onChange={(e) => setPersonelSearchQuery?.(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 mb-2"
                autoFocus
              />
              <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-0.5">
                {(filteredPersoneller ?? []).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        onay_personel_id: p.id,
                      }));
                      setShowPersonelSearch?.(null);
                      setPersonelSearchQuery?.("");
                    }}
                    className="w-full text-left p-2 text-xs rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                  >
                    {p.ad_soyad} {p.harcama_yetkilisi_mi === 1 && "★"}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-455 mb-1.5">
            Son Teklif Verme Tarih &amp; Saati
          </label>
          <input
            type="datetime-local"
            value={formData.son_teklif_verme_tarihi || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                son_teklif_verme_tarihi: e.target.value,
              })}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-455 mb-1.5">
            Tahmini İşi Bitiş / Teslim Tarihi
          </label>
          <input
            type="date"
            value={formData.teslim_tarihi || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                teslim_tarihi: e.target.value,
              })}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
          />
        </div>
      </div>
    </div>
  );
}

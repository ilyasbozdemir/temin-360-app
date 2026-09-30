import React, { useState } from "react";
import { Check, Info, RefreshCw, Search, Sparkles, User } from "lucide-react";
import { YeniDosyaTabProps } from "../../../types";
import { resolveDefaultPersonnel } from "../../../yeni.config";

export function SorumlularVeSurecTarihleriSection(
  props: YeniDosyaTabProps,
): React.JSX.Element {
  const {
    formData,
    setFormData,
    personeller = [],
    birimler = [],
    roller = [],
    showPersonelSearch,
    setShowPersonelSearch,
    personelSearchQuery,
    setPersonelSearchQuery,
    filteredPersoneller,
  } = props;

  const [assignMessage, setAssignMessage] = useState("");

  // Kurum & Birim Varsayılan Personellerini Otomatik Atama
  const handleAutoAssignDefaults = () => {
    if (!personeller || personeller.length === 0) return;

    const selectedBirim = birimler.find((b) => b.id === formData.birim_id) || birimler[0] || null;
    const defaults = resolveDefaultPersonnel(personeller, selectedBirim, roller);

    setFormData((prev) => ({
      ...prev,
      ...defaults,
    }));

    setAssignMessage("Kurum ve birim varsayılan yetkilileri dosyaya aktarıldı.");
    setTimeout(() => setAssignMessage(""), 4000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <User className="text-blue-500 w-5 h-5" />
          <h2 className="text-base font-bold text-slate-800 dark:text-white">
            Yetkililer, Süreç Tarihleri ve İdari Kayıtlar
          </h2>
        </div>

        <button
          type="button"
          onClick={handleAutoAssignDefaults}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-600 dark:hover:text-white border border-blue-200 dark:border-blue-800/60 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
          title="Kurum ve birim varsayılan yetkili personellerini otomatik ata"
        >
          <Sparkles size={13} />
          Kurum Varsayılan Yetkililerini Yükle
        </button>
      </div>

      {assignMessage && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 animate-in fade-in duration-200">
          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{assignMessage}</span>
        </div>
      )}

      <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 p-4 rounded-xl text-xs text-blue-700 dark:text-blue-300">
        <Info className="w-5 h-5 shrink-0 text-blue-500 dark:text-blue-400 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Yetkili Personel &amp; Tarih Bilgilendirmesi</p>
          <p className="leading-relaxed opacity-90">
            Doğrudan temin evraklarının alt bilgileri, onay ve imza alanlarında
            yer alacak personelleri (İrtibat Yetkilisi, Dosyayı Hazırlayan,
            Talep Eden, Sunan ve Onaylayan) buradan belirleyebilirsiniz.
            Yukarıdaki <strong>"Kurum Varsayılan Yetkililerini Yükle"</strong>{" "}
            butonunu kullanarak sistemde kayıtlı varsayılan idari kişileri tek
            tıkla dosyaya atayabilirsiniz.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* HAZIRLAYAN PERSONEL */}
        <div className="relative">
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-455">
              Dosyayı Hazırlayan Personel
            </label>
            {formData.hazirlayan_personel_id && (
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">
                Seçili
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() =>
              setShowPersonelSearch?.(
                showPersonelSearch === "hazirlayan" ? null : "hazirlayan",
              )}
            className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none text-slate-800 dark:text-slate-200 text-left font-semibold"
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
                    className="w-full text-left p-2 text-xs rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors flex items-center justify-between border-none bg-transparent"
                  >
                    <span>{p.ad_soyad}</span>
                    {p.unvan && (
                      <span className="text-[10px] text-slate-400">
                        {p.unvan}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* TALEP EDEN (ŞUBE MÜDÜRÜ VB) */}
        <div className="relative">
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-455">
              Talep Eden Personel
            </label>
            {formData.talep_eden_personel_id && (
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">
                Seçili
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() =>
              setShowPersonelSearch?.(
                showPersonelSearch === "talep_eden" ? null : "talep_eden",
              )}
            className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none text-slate-800 dark:text-slate-200 text-left font-semibold"
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
                    className="w-full text-left p-2 text-xs rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors flex items-center justify-between border-none bg-transparent"
                  >
                    <span>{p.ad_soyad}</span>
                    {p.unvan && (
                      <span className="text-[10px] text-slate-400">
                        {p.unvan}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* HARCAMA YETKİLİSİ (ONAY VEREN) */}
        <div className="relative">
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-455">
              Harcama Yetkilisi (Onaylayan)
            </label>
            {formData.onay_personel_id && (
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded">
                ★ Onay Yetkilisi
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() =>
              setShowPersonelSearch?.(
                showPersonelSearch === "onay" ? null : "onay",
              )}
            className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none text-slate-800 dark:text-slate-200 text-left font-semibold"
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
                    className="w-full text-left p-2 text-xs rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors flex items-center justify-between border-none bg-transparent"
                  >
                    <span>
                      {p.ad_soyad}{" "}
                      {p.harcama_yetkilisi_mi === 1 && (
                        <span className="text-amber-500 font-bold ml-1">
                          ★ Harcama Yetkilisi
                        </span>
                      )}
                    </span>
                    {p.unvan && (
                      <span className="text-[10px] text-slate-400">
                        {p.unvan}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* GERÇEKLEŞTİRME GÖREVLİSİ (SUNAN) */}
        <div className="relative">
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-455">
              Gerçekleştirme Görevlisi (Sunan)
            </label>
            {formData.sunan_personel_id && (
              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold bg-purple-50 dark:bg-purple-900/30 px-1.5 py-0.5 rounded">
                ★ Gerçekleştirme
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() =>
              setShowPersonelSearch?.(
                showPersonelSearch === "sunan" ? null : "sunan",
              )}
            className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none text-slate-800 dark:text-slate-200 text-left font-semibold"
          >
            <span>
              {formData.sunan_personel_id
                ? personeller.find((p) => p.id === formData.sunan_personel_id)
                  ?.ad_soyad
                : "Gerçekleştirme Görevlisi Seçin..."}
            </span>
            <Search size={14} className="text-slate-400" />
          </button>

          {showPersonelSearch === "sunan" && (
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
                        sunan_personel_id: p.id,
                      }));
                      setShowPersonelSearch?.(null);
                      setPersonelSearchQuery?.("");
                    }}
                    className="w-full text-left p-2 text-xs rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors flex items-center justify-between border-none bg-transparent"
                  >
                    <span>{p.ad_soyad}</span>
                    {p.unvan && (
                      <span className="text-[10px] text-slate-400">
                        {p.unvan}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* İRTİBAT YETKİLİSİ */}
        <div className="relative">
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-455">
              İrtibat Yetkilisi
            </label>
            {formData.irtibat_yetkilisi_id && (
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">
                Seçili
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() =>
              setShowPersonelSearch?.(
                showPersonelSearch === "irtibat" ? null : "irtibat",
              )}
            className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none text-slate-800 dark:text-slate-200 text-left font-semibold"
          >
            <span>
              {formData.irtibat_yetkilisi_id
                ? personeller.find((p) =>
                  p.id === formData.irtibat_yetkilisi_id
                )?.ad_soyad
                : "İrtibat Yetkilisi Seçin..."}
            </span>
            <Search size={14} className="text-slate-400" />
          </button>

          {showPersonelSearch === "irtibat" && (
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
                        irtibat_yetkilisi_id: p.id,
                      }));
                      setShowPersonelSearch?.(null);
                      setPersonelSearchQuery?.("");
                    }}
                    className="w-full text-left p-2 text-xs rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors flex items-center justify-between border-none bg-transparent"
                  >
                    <span>{p.ad_soyad}</span>
                    {p.unvan && (
                      <span className="text-[10px] text-slate-400">
                        {p.unvan}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SON TEKLİF VERME TARİHİ */}
        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-455 mb-1.5">
            Son Teklif Verme Tarih &amp; Saati
          </label>
          <input
            type="datetime-local"
            value={formData.son_teklif_verme_tarihi
              ? /^\d{4}-\d{2}-\d{2}$/.test(
                  String(formData.son_teklif_verme_tarihi).trim(),
                )
                ? `${String(formData.son_teklif_verme_tarihi).trim()}T10:00`
                : String(formData.son_teklif_verme_tarihi).replace(" ", "T")
                  .slice(0, 16)
              : ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                son_teklif_verme_tarihi: e.target.value,
              })}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200 font-semibold"
          />
        </div>

        {/* TAHMİNİ TESLİM TARİHİ */}
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
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200 font-semibold"
          />
        </div>
      </div>
    </div>
  );
}

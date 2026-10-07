import React, { useState } from "react";
import { Check, Info, Sparkles, User } from "lucide-react";
import { YeniDosyaTabProps } from "../../../types";
import { resolveDefaultPersonnel } from "../../../yeni.config";
import { PersonnelSelectField } from "./PersonnelSelectField";

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
    personelSearchQuery = "",
    setPersonelSearchQuery,
    filteredPersoneller = [],
  } = props;

  const [assignMessage, setAssignMessage] = useState("");

  const handleAutoAssignDefaults = () => {
    if (!personeller || personeller.length === 0) return;

    const selectedBirim = birimler.find((b) => b.id === formData.birim_id) ||
      birimler[0] || null;
    const defaults = resolveDefaultPersonnel(
      personeller,
      selectedBirim,
      roller,
    );

    setFormData((prev) => ({
      ...prev,
      ...defaults,
    }));

    setAssignMessage(
      "Kurum ve birim varsayılan yetkilileri dosyaya aktarıldı.",
    );
    setTimeout(() => setAssignMessage(""), 4000);
  };

  const handleSelectField = (field: string, id: number | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: id,
    }));
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
          <p className="font-bold">
            Yetkili Personel &amp; Tarih Bilgilendirmesi
          </p>
          <p className="leading-relaxed opacity-90">
            Doğrudan temin evraklarının alt bilgileri, onay ve imza alanlarında
            yer alacak personelleri buradan belirleyebilir veya dilediğiniz
            personeli boş bırakabilirsiniz.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* HAZIRLAYAN PERSONEL */}
        <PersonnelSelectField
          label="Dosyayı Hazırlayan Personel"
          selectedPersonelId={formData.hazirlayan_personel_id}
          onSelect={(id) => handleSelectField("hazirlayan_personel_id", id)}
          isOpen={showPersonelSearch === "hazirlayan"}
          onToggleOpen={() =>
            setShowPersonelSearch?.(
              showPersonelSearch === "hazirlayan" ? null : "hazirlayan",
            )}
          onClose={() => setShowPersonelSearch?.(null)}
          searchQuery={personelSearchQuery}
          onSearchChange={(q) => setPersonelSearchQuery?.(q)}
          personeller={personeller}
          filteredPersoneller={filteredPersoneller}
          placeholder="Hazırlayan Seçin..."
        />

        {/* TALEP EDEN PERSONEL */}
        <PersonnelSelectField
          label="Talep Eden Personel"
          selectedPersonelId={formData.talep_eden_personel_id}
          onSelect={(id) => handleSelectField("talep_eden_personel_id", id)}
          isOpen={showPersonelSearch === "talep_eden"}
          onToggleOpen={() =>
            setShowPersonelSearch?.(
              showPersonelSearch === "talep_eden" ? null : "talep_eden",
            )}
          onClose={() => setShowPersonelSearch?.(null)}
          searchQuery={personelSearchQuery}
          onSearchChange={(q) => setPersonelSearchQuery?.(q)}
          personeller={personeller}
          filteredPersoneller={filteredPersoneller}
          placeholder="Talep Eden Seçin..."
        />

        {/* HARCAMA YETKİLİSİ (ONAYLAYAN) */}
        <PersonnelSelectField
          label="Harcama Yetkilisi (Onaylayan)"
          selectedPersonelId={formData.onay_personel_id}
          onSelect={(id) => handleSelectField("onay_personel_id", id)}
          isOpen={showPersonelSearch === "onay"}
          onToggleOpen={() =>
            setShowPersonelSearch?.(
              showPersonelSearch === "onay" ? null : "onay",
            )}
          onClose={() => setShowPersonelSearch?.(null)}
          searchQuery={personelSearchQuery}
          onSearchChange={(q) => setPersonelSearchQuery?.(q)}
          personeller={personeller}
          filteredPersoneller={filteredPersoneller}
          placeholder="Harcama Yetkilisi Seçin..."
          badgeText="★ Onay Yetkilisi"
          badgeClass="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
          isHarcamaYetkilisiField
        />

        {/* GERÇEKLEŞTİRME GÖREVLİSİ (SUNAN) */}
        <PersonnelSelectField
          label="Gerçekleştirme Görevlisi (Sunan)"
          selectedPersonelId={formData.sunan_personel_id}
          onSelect={(id) => handleSelectField("sunan_personel_id", id)}
          isOpen={showPersonelSearch === "sunan"}
          onToggleOpen={() =>
            setShowPersonelSearch?.(
              showPersonelSearch === "sunan" ? null : "sunan",
            )}
          onClose={() => setShowPersonelSearch?.(null)}
          searchQuery={personelSearchQuery}
          onSearchChange={(q) => setPersonelSearchQuery?.(q)}
          personeller={personeller}
          filteredPersoneller={filteredPersoneller}
          placeholder="Gerçekleştirme Görevlisi Seçin..."
          badgeText="★ Gerçekleştirme"
          badgeClass="bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
        />

        {/* İRTİBAT YETKİLİSİ */}
        <PersonnelSelectField
          label="İrtibat Yetkilisi"
          selectedPersonelId={formData.irtibat_yetkilisi_id}
          onSelect={(id) => handleSelectField("irtibat_yetkilisi_id", id)}
          isOpen={showPersonelSearch === "irtibat"}
          onToggleOpen={() =>
            setShowPersonelSearch?.(
              showPersonelSearch === "irtibat" ? null : "irtibat",
            )}
          onClose={() => setShowPersonelSearch?.(null)}
          searchQuery={personelSearchQuery}
          onSearchChange={(q) => setPersonelSearchQuery?.(q)}
          personeller={personeller}
          filteredPersoneller={filteredPersoneller}
          placeholder="İrtibat Yetkilisi Seçin..."
        />

        {/* SON TEKLİF VERME TARİHİ */}
        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
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
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200 font-semibold"
          />
        </div>

        {/* TAHMİNİ TESLİM TARİHİ */}
        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
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
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200 font-semibold"
          />
        </div>
      </div>
    </div>
  );
}

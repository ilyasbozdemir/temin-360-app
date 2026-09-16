import React, { useState, useRef } from "react";
import {
  Clipboard,
  FileSpreadsheet,
  Loader2,
  Plus,
  PlusCircle,
  Sparkles,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import { cn } from "../../../../../utils/cn";

export interface HizliKalemRow {
  id: string;
  kalem_adi: string;
  miktar: number;
  birim: string;
  tasinir_kodu?: string;
  okas_kodu?: string;
  kdv_orani?: number;
  aciklama?: string;
}

interface HizliTopluKalemGridProps {
  activeDosya?: any;
  activeDosyaId?: number | null;
  units?: any[];
  onSaveBatch: (
    commonData: {
      tipi: string;
      okas_kodu?: string;
      tasinir_kodu_prefix?: string;
      kdv_orani: number;
      birim: string;
    },
    rows: HizliKalemRow[],
  ) => Promise<boolean>;
  onCancel?: () => void;
  isModal?: boolean;
}

const PRESET_PACKAGES = [
  {
    name: "📁 Kırtasiye Temel Paketi",
    tipi: "Mal",
    okas_kodu: "30192700-6",
    tasinir_kodu: "150.01.01",
    kdv: 20,
    birim: "Adet",
    items: [
      { kalem_adi: "A4 80 gr/m² Fotokopi Kağıdı (500'lü Paket)", miktar: 10, birim: "Paket", aciklama: "Beyaz 80 gr lazer yazıcı uyumlu" },
      { kalem_adi: "Telli Plastik Dosya (50'li Paket)", miktar: 2, birim: "Paket", aciklama: "Mavi/kırmızı telli standart dosya" },
      { kalem_adi: "Şeffaf Poşet Dosya A4 (100'lü Paket)", miktar: 5, birim: "Paket", aciklama: "Evrak koruma poşeti" },
      { kalem_adi: "Geniş Klasör A4 Plastik Kaplı", miktar: 20, birim: "Adet", aciklama: "Mekanizmalı sırt etiketli" },
      { kalem_adi: "Mavi Tükenmez Kalem 0.7mm (50'li Kutu)", miktar: 1, birim: "Kutu", aciklama: "Akıcı yazım yağ bazlı mürekkep" },
      { kalem_adi: "Zımba Teli No:24/6 (1000'li Kutu)", miktar: 5, birim: "Kutu", aciklama: "Standart zımba makinesi teli" },
    ],
  },
  {
    name: "🧹 Temizlik & Hijyen Paketi",
    tipi: "Mal",
    okas_kodu: "39830000-9",
    tasinir_kodu: "150.02.01",
    kdv: 20,
    birim: "Adet",
    items: [
      { kalem_adi: "Yoğun Kıvamlı Çamaşır Suyu (5 Lt)", miktar: 6, birim: "Adet", aciklama: "Hijyenik dezenfektan etkili" },
      { kalem_adi: "Genel Yüzey Temizleyici Çiçek Kokulu (5 Lt)", miktar: 4, birim: "Adet", aciklama: "Zemin ve sert yüzey temizliği" },
      { kalem_adi: "Sıvı El Sabunu Nemlendiricili (5 Lt)", miktar: 4, birim: "Adet", aciklama: "Dermatolojik onaylı pH 5.5" },
      { kalem_adi: "Çift Katlı Rulo Kağıt Havlu (12'li Paket)", miktar: 5, birim: "Paket", aciklama: "%100 selüloz emici doku" },
      { kalem_adi: "Büyük Boy Çöp Torbası 80x110 cm (10'lu Rulo)", miktar: 10, birim: "Rulo", aciklama: "Endüstriyel kalın dayanıklı" },
    ],
  },
  {
    name: "🎨 Boya & Küçük Onarım",
    tipi: "Yapım",
    okas_kodu: "45442110-1",
    tasinir_kodu: "15.120",
    kdv: 20,
    birim: "m²",
    items: [
      { kalem_adi: "İç Cephe Alçı Sıva Tamiratı ve Silikonlu Plastik Boya", miktar: 250, birim: "m²", aciklama: "Yüzey temizliği, astar ve 2 kat silikonlu boya yapılması" },
      { kalem_adi: "Tavan Boyası Yapılması (2 Kat)", miktar: 120, birim: "m²", aciklama: "Su bazlı mat beyaz tavan boyası" },
      { kalem_adi: "Kestirme Fırçası No:3 ve Boya Rulosu 20cm", miktar: 4, birim: "Adet", aciklama: "Profesyonel damlatmaz rulo ve fırça" },
      { kalem_adi: "Maskeleme Bandı 50mm ve Koruyucu Hışır Örtü", miktar: 10, birim: "Adet", aciklama: "Boya koruma malzemesi" },
    ],
  },
  {
    name: "💻 BT / Donanım Sarf Paketi",
    tipi: "Mal",
    okas_kodu: "30237000-9",
    tasinir_kodu: "150.05.01",
    kdv: 20,
    birim: "Adet",
    items: [
      { kalem_adi: "Siyah Muadil Toner (Yüksek Kapasite)", miktar: 4, birim: "Adet", aciklama: "Lazer yazıcı uyumlu çipli toner" },
      { kalem_adi: "USB 3.0 Flash Bellek 64 GB", miktar: 5, birim: "Adet", aciklama: "Metal gövde yüksek hızlı veri aktarımı" },
      { kalem_adi: "Cat6 UTP Patch Kablo 3 Metre", miktar: 10, birim: "Adet", aciklama: "Fabrika sonlandırmalı RJ45 uçlu" },
      { kalem_adi: "Kablosuz Optik Mouse ve Mousepad", miktar: 3, birim: "Adet", aciklama: "2.4GHz nano alıcılı sessiz tuşlu" },
      { kalem_adi: "6'lı Akım Korumalı Priz 2 Metre", miktar: 3, birim: "Adet", aciklama: "Aşırı gerilim korumalı anahtarlı priz" },
    ],
  },
];

export function HizliTopluKalemGrid({
  activeDosya,
  activeDosyaId,
  units = [],
  onSaveBatch,
  onCancel,
}: HizliTopluKalemGridProps): React.JSX.Element {
  const isYapim =
    activeDosya?.tur === "yapim_isi" ||
    activeDosya?.tur === "yapim" ||
    activeDosya?.ihale_tipi === "Hakediş";
  const isHizmet = activeDosya?.tur === "hizmet";

  // Common Header Defaults
  const [commonType, setCommonType] = useState<string>(
    isYapim ? "Yapım" : isHizmet ? "Hizmet" : "Mal",
  );
  const [commonOkas, setCommonOkas] = useState<string>("");
  const [commonTasinirPrefix, setCommonTasinirPrefix] = useState<string>("");
  const [commonKdv, setCommonKdv] = useState<number>(20);
  const [commonBirim, setCommonBirim] = useState<string>(
    isYapim ? "m²" : "Adet",
  );

  // AI Loading for OKAS
  const [aiLoading, setAiLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Table Rows
  const [rows, setRows] = useState<HizliKalemRow[]>([
    { id: "row-1", kalem_adi: "", miktar: 1, birim: isYapim ? "m²" : "Adet", tasinir_kodu: "", aciklama: "" },
    { id: "row-2", kalem_adi: "", miktar: 1, birim: isYapim ? "m²" : "Adet", tasinir_kodu: "", aciklama: "" },
    { id: "row-3", kalem_adi: "", miktar: 1, birim: isYapim ? "m²" : "Adet", tasinir_kodu: "", aciklama: "" },
    { id: "row-4", kalem_adi: "", miktar: 1, birim: isYapim ? "m²" : "Adet", tasinir_kodu: "", aciklama: "" },
  ]);

  const rowInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const handleAddEmptyRow = (count: number = 1) => {
    const newRows: HizliKalemRow[] = [];
    for (let i = 0; i < count; i++) {
      newRows.push({
        id: `row-${Date.now()}-${Math.random()}`,
        kalem_adi: "",
        miktar: 1,
        birim: commonBirim,
        tasinir_kodu: "",
        aciklama: "",
      });
    }
    setRows((prev) => [...prev, ...newRows]);
  };

  const handleUpdateRow = (id: string, field: keyof HizliKalemRow, value: any) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    );
  };

  const handleDeleteRow = (id: string) => {
    if (rows.length <= 1) {
      setRows([
        { id: `row-${Date.now()}`, kalem_adi: "", miktar: 1, birim: commonBirim, tasinir_kodu: "", aciklama: "" },
      ]);
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleClearAll = () => {
    if (confirm("Tablodaki tüm satırları temizlemek istediğinize emin misiniz?")) {
      setRows([
        { id: "row-1", kalem_adi: "", miktar: 1, birim: commonBirim, tasinir_kodu: "", aciklama: "" },
        { id: "row-2", kalem_adi: "", miktar: 1, birim: commonBirim, tasinir_kodu: "", aciklama: "" },
      ]);
    }
  };

  // Load Preset
  const handleApplyPreset = (preset: (typeof PRESET_PACKAGES)[0]) => {
    setCommonType(preset.tipi);
    setCommonOkas(preset.okas_kodu);
    setCommonTasinirPrefix(preset.tasinir_kodu);
    setCommonKdv(preset.kdv);
    setCommonBirim(preset.birim);

    const generatedRows: HizliKalemRow[] = preset.items.map((item, idx) => ({
      id: `preset-${Date.now()}-${idx}`,
      kalem_adi: item.kalem_adi,
      miktar: item.miktar,
      birim: item.birim || preset.birim,
      tasinir_kodu: preset.tasinir_kodu,
      aciklama: item.aciklama,
    }));

    setRows(generatedRows);
  };

  // Paste from Clipboard / Excel
  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text || !text.trim()) {
        alert("Panoda kopyalanmış herhangi bir metin veya Excel verisi bulunamadı.");
        return;
      }

      const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      if (lines.length === 0) return;

      const parsedRows: HizliKalemRow[] = lines.map((line, idx) => {
        // Tab-separated or Semicolon/Comma separated
        const cols = line.includes("\t")
          ? line.split("\t")
          : line.includes(";")
          ? line.split(";")
          : [line];

        const name = cols[0]?.trim() || "";
        const mkt = parseFloat(cols[1]?.replace(",", ".") || "1") || 1;
        const brm = cols[2]?.trim() || commonBirim;
        const note = cols[3]?.trim() || "";

        return {
          id: `pasted-${Date.now()}-${idx}`,
          kalem_adi: name,
          miktar: mkt,
          birim: brm,
          tasinir_kodu: commonTasinirPrefix || "",
          aciklama: note,
        };
      });

      // Filter out empty rows and append or replace
      const nonEmptyExisting = rows.filter((r) => r.kalem_adi.trim().length > 0);
      setRows([...nonEmptyExisting, ...parsedRows]);
      alert(`✅ Excel / Panodan ${parsedRows.length} satır başarıyla aktarıldı!`);
    } catch (err: any) {
      alert("Panodan okuma başarısız oldu. Lütfen tarayıcı izinlerini kontrol edin veya doğrudan yapıştırın.");
    }
  };

  // AI Suggest OKAS based on first row or preset
  const handleAiSuggestOkas = async () => {
    const sampleItem = rows.find((r) => r.kalem_adi.trim().length > 0)?.kalem_adi;
    if (!sampleItem && !activeDosya?.konu) {
      alert("Lütfen en az bir satıra kalem adı girin veya dosya konusu belirleyin.");
      return;
    }

    const query = sampleItem || activeDosya?.konu;
    setAiLoading(true);
    try {
      const prompt = `Aşağıdaki iş/malzeme grubu için Kamu İhale Kurumu OKAS (Ortak Kamu Alımları Sözlüğü) CPV kodunu ve kısa adını öner. Sadece "KOD: AÇIKLAMA" formatında yanıt ver. Örneğin: "30192700-6: Kırtasiye malzemeleri". Konu: ${query}`;
      const res = await (window as any).electron.ipcRenderer.invoke("ai:generate", { prompt });
      if (res.success && res.data) {
        const text = res.data.trim();
        const match = text.match(/^([\d-]+)/);
        if (match && match[1]) {
          setCommonOkas(match[1]);
        } else {
          setCommonOkas(text);
        }
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  const validRowCount = rows.filter((r) => r.kalem_adi.trim().length > 0).length;

  const handleSave = async () => {
    if (validRowCount === 0) {
      alert("Lütfen en az bir adet geçerli kalem adı giriniz.");
      return;
    }

    setIsSaving(true);
    try {
      const success = await onSaveBatch(
        {
          tipi: commonType,
          okas_kodu: commonOkas.trim() || undefined,
          tasinir_kodu_prefix: commonTasinirPrefix.trim() || undefined,
          kdv_orani: commonKdv,
          birim: commonBirim,
        },
        rows,
      );

      if (success) {
        setRows([
          { id: "row-1", kalem_adi: "", miktar: 1, birim: commonBirim, tasinir_kodu: "", aciklama: "" },
          { id: "row-2", kalem_adi: "", miktar: 1, birim: commonBirim, tasinir_kodu: "", aciklama: "" },
        ]);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* 1. ORTAK / SABİT DEĞERLER (Header Defaults) */}
      <div className="p-4 bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-slate-50 dark:from-slate-900 dark:via-blue-950/20 dark:to-slate-900 border border-blue-200/80 dark:border-blue-900/40 rounded-2xl shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-blue-200/60 dark:border-blue-900/30">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                Ortak / Sabit Değerler Paneli
                <span className="text-[10px] font-normal text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/80 px-2 py-0.5 rounded-full font-mono">
                  Otomatik Tüm Satırlara Uygulanır
                </span>
              </h4>
            </div>
          </div>

          {/* Hazır Paket Şablonları */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[11px] font-bold text-slate-500 shrink-0">Hızlı Paket:</span>
            {PRESET_PACKAGES.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="text-[11px] font-semibold px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/40 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg shrink-0 transition-colors shadow-2xs cursor-pointer"
                title={`${p.name} (${p.items.length} Kalem)`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Ortak Alanlar Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Ortak Tür */}
          <div>
            <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
              Kalem Türü
            </label>
            <select
              value={commonType}
              onChange={(e) => setCommonType(e.target.value)}
              className="w-full px-2.5 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              <option value="Mal">Mal Alımı</option>
              <option value="Hizmet">Hizmet Alımı</option>
              <option value="Yapım">Yapım İşi</option>
              <option value="Danışmanlık">Danışmanlık Alımı</option>
            </select>
          </div>

          {/* Ortak OKAS Kodu */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Ortak OKAS Kodu
              </label>
              <button
                type="button"
                onClick={handleAiSuggestOkas}
                disabled={aiLoading}
                className="text-[9px] font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-0.5 cursor-pointer disabled:opacity-50"
                title="Yapay Zeka ile OKAS Kodu Öner"
              >
                {aiLoading ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Sparkles className="w-2.5 h-2.5" />}
                AI
              </button>
            </div>
            <input
              type="text"
              value={commonOkas}
              onChange={(e) => setCommonOkas(e.target.value)}
              placeholder="Örn: 30192700-6"
              className="w-full px-2.5 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Ortak Taşınır Kodu / Poz Grubu */}
          <div>
            <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
              {commonType === "Yapım" ? "Poz Öneki / Grubu" : "Taşınır Kodu Öneki"}
            </label>
            <input
              type="text"
              value={commonTasinirPrefix}
              onChange={(e) => setCommonTasinirPrefix(e.target.value)}
              placeholder={commonType === "Yapım" ? "Örn: 15.120" : "Örn: 150.01.01"}
              className="w-full px-2.5 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Varsayılan Ölçü Birimi */}
          <div>
            <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
              Varsayılan Birim
            </label>
            <select
              value={commonBirim}
              onChange={(e) => {
                const b = e.target.value;
                setCommonBirim(b);
                setRows((prev) =>
                  prev.map((r) => (!r.kalem_adi ? { ...r, birim: b } : r)),
                );
              }}
              className="w-full px-2.5 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              {(units.length > 0
                ? units.map((u: any) => u.ad)
                : ["Adet", "Paket", "Kutu", "Koli", "Metre", "m²", "m³", "Kg", "Litre", "Takım", "Gün", "Ay", "Yıl"]
              ).map((uName: string, idx: number) => (
                <option key={idx} value={uName}>
                  {uName}
                </option>
              ))}
            </select>
          </div>

          {/* Ortak KDV Oranı */}
          <div>
            <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
              KDV Oranı
            </label>
            <div className="flex gap-1">
              {[0, 1, 10, 20].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => setCommonKdv(rate)}
                  className={cn(
                    "flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer",
                    commonKdv === rate
                      ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                      : "bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100",
                  )}
                >
                  %{rate}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. EXCEL GRID TABLOSU & TOOLBAR */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Hızlı Kalem Giriş Tablosu ({validRowCount} Geçerli Kalem)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePasteFromClipboard}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              title="Excel'den kopyaladığınız satırları anında tabloya ekler"
            >
              <Clipboard className="w-3.5 h-3.5" />
              Excel / Panodan Yapıştır
            </button>

            <button
              type="button"
              onClick={() => handleAddEmptyRow(5)}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              +5 Satır
            </button>

            <button
              type="button"
              onClick={handleClearAll}
              className="px-2.5 py-1.5 text-slate-400 hover:text-red-500 rounded-xl text-xs transition-colors cursor-pointer"
              title="Tabloyu Temizle"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tablo */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs bg-white dark:bg-slate-900">
          <div className="max-h-80 overflow-y-auto custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100/80 dark:bg-slate-800/80 sticky top-0 z-10 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="w-10 px-3 py-2 text-center">#</th>
                  <th className="px-3 py-2 min-w-[220px]">
                    Kalem / İmalat Adı <span className="text-red-500">*</span>
                  </th>
                  <th className="w-24 px-2 py-2 text-center">Miktar</th>
                  <th className="w-28 px-2 py-2">Birim</th>
                  <th className="w-36 px-2 py-2">Taşınır / Poz No</th>
                  <th className="px-3 py-2 min-w-[160px]">Açıklama / Not</th>
                  <th className="w-10 px-2 py-2 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {rows.map((row, idx) => (
                  <tr
                    key={row.id}
                    className="hover:bg-blue-50/30 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    <td className="px-3 py-1.5 text-center font-mono text-[11px] text-slate-400 font-bold">
                      {idx + 1}
                    </td>
                    <td className="px-2 py-1">
                      <input
                        ref={(el) => {
                          rowInputRefs.current[row.id] = el;
                        }}
                        type="text"
                        value={row.kalem_adi}
                        onChange={(e) => handleUpdateRow(row.id, "kalem_adi", e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (idx === rows.length - 1) {
                              handleAddEmptyRow(1);
                            } else {
                              const nextId = rows[idx + 1]?.id;
                              if (nextId && rowInputRefs.current[nextId]) {
                                rowInputRefs.current[nextId]?.focus();
                              }
                            }
                          }
                        }}
                        placeholder={`Örn: ${
                          idx === 0
                            ? "A4 Fotokopi Kağıdı 80gr"
                            : idx === 1
                            ? "Plastik Telli Dosya"
                            : "Kalem / İmalat Adı giriniz..."
                        }`}
                        className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={row.miktar}
                        onChange={(e) =>
                          handleUpdateRow(row.id, "miktar", parseFloat(e.target.value) || 1)
                        }
                        className="w-full text-center px-2 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold text-blue-600 dark:text-blue-400 focus:outline-none"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input
                        type="text"
                        value={row.birim || commonBirim}
                        onChange={(e) => handleUpdateRow(row.id, "birim", e.target.value)}
                        className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input
                        type="text"
                        value={row.tasinir_kodu !== undefined ? row.tasinir_kodu : commonTasinirPrefix}
                        onChange={(e) => handleUpdateRow(row.id, "tasinir_kodu", e.target.value)}
                        placeholder={commonTasinirPrefix || "Kod"}
                        className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono text-slate-700 dark:text-slate-300 focus:outline-none"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input
                        type="text"
                        value={row.aciklama || ""}
                        onChange={(e) => handleUpdateRow(row.id, "aciklama", e.target.value)}
                        placeholder="Özellik, standart..."
                        className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-600 dark:text-slate-300 focus:outline-none"
                      />
                    </td>
                    <td className="px-2 py-1 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteRow(row.id)}
                        className="p-1 text-slate-300 hover:text-red-500 rounded-md transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-2.5 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={() => handleAddEmptyRow(1)}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5 cursor-pointer px-2 py-1"
            >
              <PlusCircle className="w-4 h-4" />
              Yeni Boş Satır Ekle (veya Enter tuşuna basın)
            </button>
            <span className="text-[11px] text-slate-400">
              Excel&apos;den birden fazla hücre kopyalayıp &ldquo;Excel / Panodan Yapıştır&rdquo; yapabilirsiniz.
            </span>
          </div>
        </div>
      </div>

      {/* 3. ALT AKSİYON BUTONLARI */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              İptal
            </button>
          )}
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {validRowCount > 0
              ? `Toplam ${validRowCount} kalem tek seferde kaydedilecek`
              : "Henüz kalem girilmedi"}
          </span>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={validRowCount === 0 || isSaving}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Zap className="w-4 h-4 text-amber-300" />
          )}
          {activeDosyaId
            ? `${validRowCount} Kalemi Toplu Dosyaya Ekle`
            : `${validRowCount} Kalemi Kütüphaneye Kaydet`}
        </button>
      </div>
    </div>
  );
}

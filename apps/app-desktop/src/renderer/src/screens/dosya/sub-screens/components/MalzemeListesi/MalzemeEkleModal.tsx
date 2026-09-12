import React, { useState } from "react";
import {
  BookOpen,
  Check,
  CheckCheck,
  Plus,
  PlusCircle,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "../../../../../utils/cn";
import { Modal } from "../../../../../components/ui/Modal";
import { useSettingsStore } from "../../../../../store/settingsStore";

export function MalzemeEkleModal({
  state,
  activeDosya,
}: {
  state: any;
  activeDosya?: any;
}): React.JSX.Element {
  const { isAiConfigured } = useSettingsStore();
  const isYapim =
    activeDosya?.tur === "yapim_isi" ||
    activeDosya?.tur === "yapim" ||
    activeDosya?.ihale_tipi === "Hakediş";
  const isHizmet = activeDosya?.tur === "hizmet";

  const {
    libraryItems,
    units,
    kalemAdi,
    setKalemAdi,
    tasinirKodu,
    setTasinirKodu,
    okasKodu,
    setOkasKodu,
    tipi,
    setTipi,
    birim,
    setBirim,
    miktar,
    setMiktar,
    kdvOrani,
    setKdvOrani,
    aciklama,
    setAciklama,
    searchQuery,
    setSearchQuery,
    showSuggestions,
    setShowSuggestions,
    aiLoading,
    isAddModalOpen,
    setIsAddModalOpen,
    activeTab,
    setActiveTab,
    selectedItemIds,
    setSelectedItemIds,
    itemMiktarlar,
    setItemMiktarlar,
    libSearchQuery,
    setLibSearchQuery,
    handleAiAçiklama,
    handleSelectSuggestion,
    handleAddItem,
    handleAddSelected,
    filteredSuggestions,
  } = state;

  const [selectedCategory, setSelectedCategory] = useState<string>("Tümü");

  const categoryOptions = ["Tümü", "Mal", "Hizmet", "Yapım", "Danışmanlık"];

  const filteredLibraryItems = libraryItems.filter((item: any) => {
    const matchesSearch =
      !libSearchQuery.trim() ||
      item.kalem_adi?.toLowerCase().includes(libSearchQuery.toLowerCase()) ||
      (item.tasinir_kodu || "").toLowerCase().includes(
        libSearchQuery.toLowerCase(),
      ) ||
      (item.okas_kodu || "").toLowerCase().includes(
        libSearchQuery.toLowerCase(),
      );

    const matchesCategory =
      selectedCategory === "Tümü" || item.tipi === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleSelectAllFiltered = () => {
    if (selectedItemIds.size === filteredLibraryItems.length) {
      setSelectedItemIds(new Set());
    } else {
      const next = new Set<number>();
      filteredLibraryItems.forEach((i: any) => next.add(i.id));
      setSelectedItemIds(next);
    }
  };

  return (
    <Modal
      isOpen={isAddModalOpen}
      onClose={() => {
        setIsAddModalOpen(false);
        setSelectedItemIds(new Set());
        setItemMiktarlar({});
        setLibSearchQuery("");
      }}
      title={
        isYapim
          ? "Dosyaya İmalat / Poz Kalemi Ekle"
          : isHizmet
          ? "Dosyaya Hizmet Kalemi Ekle"
          : "Dosyaya İhtiyaç Kalemi Ekle"
      }
      description={
        isYapim
          ? "Poz ve imalat kütüphanesinden seçim yapın veya özel yeni imalat/poz oluşturun."
          : isHizmet
          ? "Hizmet kütüphanesinden seçim yapın veya yeni hizmet kalemi tanımlayın."
          : "Taşınır kütüphanesinden toplu seçim yapın veya özel yeni malzeme kalemi oluşturun."
      }
    >
      {/* SEKMELER */}
      <div className="flex gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl mb-5 border border-slate-200/60 dark:border-slate-700/60">
        <button
          type="button"
          onClick={() => setActiveTab("library")}
          className={cn(
            "flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2",
            activeTab === "library"
              ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/50 dark:border-slate-700/50"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200",
          )}
        >
          <BookOpen className="w-3.5 h-3.5" />
          {isYapim
            ? `Poz Kütüphanesinden Seç (${libraryItems.length})`
            : isHizmet
            ? `Hizmet Havuzundan Seç (${libraryItems.length})`
            : `Kütüphaneden Seç (${libraryItems.length})`}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("new")}
          className={cn(
            "flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2",
            activeTab === "new"
              ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/50 dark:border-slate-700/50"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200",
          )}
        >
          <PlusCircle className="w-3.5 h-3.5" />
          {isYapim
            ? "Yeni Poz / İmalat Tanımla"
            : isHizmet
            ? "Yeni Hizmet Kalemi Tanımla"
            : "Yeni Kalem Oluştur"}
        </button>
      </div>

      {/* SEKME 1: KÜTÜPHANE LİSTESİ */}
      {activeTab === "library" && (
        <div className="space-y-4">
          {/* Arama & Kategori Filtresi */}
          <div className="space-y-2.5">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={libSearchQuery}
                onChange={(e) => setLibSearchQuery(e.target.value)}
                placeholder={
                  isYapim
                    ? "Poz no (örn: 15.120.1001), imalat adı veya OKAS ile canlı arayın..."
                    : isHizmet
                    ? "Hizmet adı, kodu veya açıklama ile canlı arayın..."
                    : "Kalem adı, taşınır kodu veya OKAS ile canlı arayın..."
                }
                className="w-full pl-10 pr-9 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-200 font-medium transition-all"
              />
              {libSearchQuery && (
                <button
                  type="button"
                  onClick={() => setLibSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-0.5 rounded-full"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Kategori Filtre Butonları */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex gap-1 overflow-x-auto">
                {categoryOptions.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer",
                      selectedCategory === cat
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200",
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {filteredLibraryItems.length > 0 && (
                <button
                  type="button"
                  onClick={handleSelectAllFiltered}
                  className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline shrink-0 cursor-pointer flex items-center gap-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  {selectedItemIds.size === filteredLibraryItems.length
                    ? "Seçimi Kaldır"
                    : "Tümünü Seç"}
                </button>
              )}
            </div>
          </div>

          {/* Kalem Listesi */}
          <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
            {filteredLibraryItems.map((item: any) => {
              const isSelected = selectedItemIds.has(item.id);
              const mkt = itemMiktarlar[item.id] ?? 1;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    const next = new Set(selectedItemIds);
                    if (isSelected) {
                      next.delete(item.id);
                    } else {
                      next.add(item.id);
                      if (!itemMiktarlar[item.id]) {
                        setItemMiktarlar((prev: any) => ({
                          ...prev,
                          [item.id]: 1,
                        }));
                      }
                    }
                    setSelectedItemIds(next);
                  }}
                  className={cn(
                    "p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between gap-3",
                    isSelected
                      ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 shadow-xs"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100/70 dark:hover:bg-slate-800/50",
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={cn(
                        "w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-colors",
                        isSelected
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800",
                      )}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                        {item.kalem_adi}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={cn(
                            "text-[9px] font-black uppercase px-2 py-0.5 rounded-md border",
                            item.tipi === "Mal" &&
                              "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
                            item.tipi === "Hizmet" &&
                              "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800",
                            item.tipi === "Yapım" &&
                              "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
                            item.tipi === "Danışmanlık" &&
                              "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/40 dark:text-pink-300 dark:border-pink-800",
                          )}
                        >
                          {item.tipi || "Mal"}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                          {item.birim} · %{item.kdv_orani ?? 20} KDV
                        </span>
                        {item.tasinir_kodu && (
                          <span className="text-[10px] text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                            {isYapim
                              ? `Poz: ${item.tasinir_kodu}`
                              : item.tasinir_kodu}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Miktar Arttır/Azalt Kontrolü */}
                  {isSelected && (
                    <div
                      className="flex items-center gap-1 shrink-0 bg-white dark:bg-slate-950 p-1 border border-blue-200 dark:border-blue-800 rounded-xl"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setItemMiktarlar((prev: any) => ({
                            ...prev,
                            [item.id]: Math.max(1, (prev[item.id] ?? 1) - 1),
                          }))
                        }
                        className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center cursor-pointer transition-colors"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={mkt}
                        onChange={(e) =>
                          setItemMiktarlar((prev: any) => ({
                            ...prev,
                            [item.id]: Math.max(
                              1,
                              parseInt(e.target.value, 10) || 1,
                            ),
                          }))
                        }
                        className="w-10 text-center text-xs font-bold text-blue-600 dark:text-blue-400 focus:outline-none bg-transparent"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setItemMiktarlar((prev: any) => ({
                            ...prev,
                            [item.id]: (prev[item.id] ?? 1) + 1,
                          }))
                        }
                        className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center cursor-pointer transition-colors"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredLibraryItems.length === 0 && (
              <div className="text-center text-xs text-slate-400 py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                Aramanızla eşleşen kalem bulunamadı. &ldquo;Yeni Kalem&rdquo;
                sekmesinden ekleyebilirsiniz.
              </div>
            )}
          </div>

          {/* Ekle / İptal Aksiyon Butonları */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setSelectedItemIds(new Set());
                setItemMiktarlar({});
                setLibSearchQuery("");
              }}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              İptal
            </button>
            <button
              type="button"
              disabled={selectedItemIds.size === 0}
              onClick={handleAddSelected}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {selectedItemIds.size > 0
                ? isYapim
                  ? `${selectedItemIds.size} Pozu Ekle`
                  : isHizmet
                  ? `${selectedItemIds.size} Hizmeti Ekle`
                  : `${selectedItemIds.size} Kalem Ekle`
                : isYapim
                ? "Poz Seçin"
                : "Kalem Seçin"}
            </button>
          </div>
        </div>
      )}

      {/* SEKME 2: YENİ KALEM FORMU */}
      {activeTab === "new" && (
        <form onSubmit={handleAddItem} className="space-y-4">
          {/* Kalem Arama / Autocomplete */}
          <div className="relative">
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
              {isYapim
                ? "İmalat / İş Kalemi (Poz Tanımı)"
                : isHizmet
                ? "Hizmet Tanımı / Alım Konusu"
                : "Malzeme / Ürün Adı"}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setKalemAdi(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder={
                isYapim
                  ? "Örn: İç Cephe Alçı Sıva Tamiratı ve Silikonlu Boya Yapılması"
                  : isHizmet
                  ? "Örn: Split Klimalar Periyodik Bakım ve Soğutucu Gaz Dolumu"
                  : "Örn: A4 80 gr/m² Fotokopi Kağıdı"
              }
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-100 font-bold transition-all"
            />
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden max-h-48 overflow-y-auto">
                {filteredSuggestions.map((item: any) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectSuggestion(item)}
                    className="w-full text-left px-3.5 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-xs text-slate-700 dark:text-slate-200 font-semibold transition-colors flex flex-col cursor-pointer"
                  >
                    <span>{item.kalem_adi}</span>
                    <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                      Tip: {item.tipi} | Birim: {item.birim} | KDV: %
                      {item.kdv_orani}{" "}
                      {item.tasinir_kodu
                        ? isYapim
                          ? `| Poz No: ${item.tasinir_kodu}`
                          : `| Taşınır: ${item.tasinir_kodu}`
                        : ""}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Türü & Birimi */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                Kalem Türü
              </label>
              <select
                value={tipi}
                onChange={(e) => setTipi(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-100 font-semibold cursor-pointer"
              >
                <option value="Yapım">Yapım İşi</option>
                <option value="Mal">Mal Alımı</option>
                <option value="Hizmet">Hizmet Alımı</option>
                <option value="Danışmanlık">Danışmanlık Alımı</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                Ölçü Birimi
              </label>
              <select
                value={birim}
                onChange={(e) => setBirim(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-100 font-semibold cursor-pointer"
              >
                {units.map((u: { ad: string }, idx: number) => (
                  <option key={idx} value={u.ad}>
                    {u.ad}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Miktar & KDV */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                Miktar <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                required
                min="0.01"
                value={miktar}
                onChange={(e) => setMiktar(parseFloat(e.target.value) || 1)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-100 font-black"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                KDV Oranı (%)
              </label>
              <select
                value={kdvOrani}
                onChange={(e) => setKdvOrani(parseInt(e.target.value, 10))}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-100 font-semibold cursor-pointer"
              >
                <option value="0">%0</option>
                <option value="1">%1</option>
                <option value="10">%10</option>
                <option value="20">%20</option>
              </select>
            </div>
          </div>

          {/* Taşınır & OKAS Kodları */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                {isYapim
                  ? "Bakanlık / ÇŞB Poz No"
                  : isHizmet
                  ? "Hizmet / Faaliyet Kodu"
                  : "Taşınır Kodu"}
              </label>
              <input
                type="text"
                value={tasinirKodu}
                onChange={(e) => setTasinirKodu(e.target.value)}
                placeholder={
                  isYapim
                    ? "Örn: 15.120.1001 veya Y.25.001/01"
                    : isHizmet
                    ? "Örn: HZM-01 veya 50730000-1"
                    : "Örn: 150.01.01.01"
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none text-slate-800 dark:text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                OKAS Kodu
              </label>
              <input
                type="text"
                value={okasKodu}
                onChange={(e) => setOkasKodu(e.target.value)}
                placeholder="Örn: 45442110-1"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none text-slate-800 dark:text-slate-100 font-mono"
              />
            </div>
          </div>

          {/* Açıklama & AI Öneri */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                {isYapim
                  ? "İmalat & Poz Tarifi / Şartname"
                  : isHizmet
                  ? "Hizmet Şartnamesi & Kapsamı"
                  : "Teknik Şartname / Açıklama"}
              </label>
              {isAiConfigured && (
                <button
                  type="button"
                  onClick={handleAiAçiklama}
                  disabled={(!kalemAdi && !searchQuery) || aiLoading}
                  className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 px-2.5 py-1 rounded-full hover:bg-blue-100 transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-3 h-3 text-blue-500 animate-pulse" />
                  {aiLoading
                    ? "AI Üretiyor..."
                    : isYapim
                    ? "AI Poz & İmalat Tarifi"
                    : isHizmet
                    ? "AI Hizmet Şartnamesi"
                    : "AI Şartname Önerisi"}
                </button>
              )}
            </div>
            <textarea
              value={aciklama}
              onChange={(e) => setAciklama(e.target.value)}
              placeholder={
                isYapim
                  ? "İmalatın uygulama şartları, kullanılacak malzeme standartları (TSE/CE), montaj ve işçilik detayları..."
                  : isHizmet
                  ? "Hizmetin kapsamı, çalışma periyotları, personel/araç yeterlilikleri ve kabul kriterleri..."
                  : "Malzemenin teknik özellikleri, marka/model, standartlar veya ambalaj bilgileri..."
              }
              rows={3}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Butonlar */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              İptal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {isYapim
                ? "Pozu Kaydet ve Dosyaya Ekle"
                : isHizmet
                ? "Hizmeti Kaydet ve Dosyaya Ekle"
                : "Kaydet ve Dosyaya Ekle"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

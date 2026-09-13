"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Database,
  DollarSign,
  FileText,
  Filter,
  Layers,
  Package,
  Plus,
  RefreshCw,
  Search,
  Server,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { DosyalarApi, SystemApi } from "@/lib/api";

export default function DosyalarWebPage() {
  const [dosyalar, setDosyalar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [backendHealth, setBackendHealth] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDurum, setFilterDurum] = useState("hepsi");
  const [filterTur, setFilterTur] = useState("hepsi");

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDosya, setSelectedDosya] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create Form State
  const [formData, setFormData] = useState({
    dosyaNo: "",
    isAdi: "",
    alimTuru: "mal",
    usul: "22_d",
    durum: "taslak",
    yaklasikMaliyet: "",
    kalemAdi: "",
    kalemMiktar: "1",
    kalemBirim: "Adet",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [healthRes, statsRes, dosyalarRes] = await Promise.all([
        SystemApi.getHealth(),
        SystemApi.getStats(),
        DosyalarApi.list({
          q: searchQuery || undefined,
          durum: filterDurum !== "hepsi" ? filterDurum : undefined,
          alimTuru: filterTur !== "hepsi" ? filterTur : undefined,
        }),
      ]);

      setBackendHealth(healthRes);
      if (statsRes.success) setStats(statsRes.data);
      if (dosyalarRes.success && dosyalarRes.data) {
        setDosyalar(dosyalarRes.data);
      } else {
        setDosyalar([]);
      }
    } catch (err) {
      console.error("Veri yüklenirken hata:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterDurum, filterTur]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleCreateDosya = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.dosyaNo || !formData.isAdi) return;

    setIsSubmitting(true);
    try {
      const payload: any = {
        dosyaNo: formData.dosyaNo,
        isAdi: formData.isAdi,
        alimTuru: formData.alimTuru,
        usul: formData.usul,
        durum: formData.durum,
        yaklasikMaliyet: formData.yaklasikMaliyet
          ? Number(formData.yaklasikMaliyet)
          : null,
      };

      if (formData.kalemAdi) {
        payload.kalemler = [
          {
            siraNo: 1,
            malzemeAdi: formData.kalemAdi,
            miktar: Number(formData.kalemMiktar) || 1,
            birim: formData.kalemBirim || "Adet",
          },
        ];
      }

      const res = await DosyalarApi.create(payload);
      if (res.success) {
        setShowCreateModal(false);
        setFormData({
          dosyaNo: "",
          isAdi: "",
          alimTuru: "mal",
          usul: "22_d",
          durum: "taslak",
          yaklasikMaliyet: "",
          kalemAdi: "",
          kalemMiktar: "1",
          kalemBirim: "Adet",
        });
        await loadData();
      } else {
        alert(`Hata: ${res.error || "Dosya oluşturulamadı"}`);
      }
    } catch (err: any) {
      alert(`İşlem başarısız: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDosya = async (id: number, dosyaNo: string) => {
    if (!confirm(`'${dosyaNo}' numaralı dosyayı ve veritabanı kayıtlarını silmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      const res = await DosyalarApi.delete(id);
      if (res.success) {
        setDosyalar((prev) => prev.filter((d) => d.id !== id));
      } else {
        alert(`Silme başarısız: ${res.error}`);
      }
    } catch (err: any) {
      alert(`Hata: ${err.message}`);
    }
  };

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      const res = await DosyalarApi.update(id, { durum: newStatus });
      if (res.success) {
        setDosyalar((prev) =>
          prev.map((d) => (d.id === id ? { ...d, durum: newStatus } : d)),
        );
      }
    } catch (err: any) {
      console.error("Durum güncelleme hatası:", err);
    }
  };

  const formatMoney = (val: any) => {
    const num = Number(val);
    if (isNaN(num) || num === 0) return "0,00";
    return num.toLocaleString("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans selection:bg-blue-600 selection:text-white">
      {/* HEADER & NAVIGATION */}
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link
                href="/"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white hover:border-slate-700 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Gateway Paneli</span>
              </Link>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Database className="w-3.5 h-3.5 text-blue-400" />
                <span>Prisma ORM & PostgreSQL</span>
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <Layers className="w-7 h-7 text-blue-500" />
              Doğrudan Temin & İhale Dosyaları (Web)
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              PostgreSQL veritabanına bağlı bağımsız backend sunucusu üzerinden canlı CRUD yönetimi.
            </p>
          </div>

          {/* SAĞ TARAF: BACKEND SAĞLIK ROZETİ & YENİ DOSYA EKLE */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs">
              <span
                className={`w-2 h-2 rounded-full ${
                  backendHealth?.success
                    ? "bg-emerald-500 animate-pulse"
                    : "bg-rose-500"
                }`}
              />
              <span className="text-slate-400">Sunucu:</span>
              <span className="font-bold text-slate-200">
                {backendHealth?.success ? "4000 (Bağlı)" : "Çevrimdışı"}
              </span>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Dosya Ekle</span>
            </button>
          </div>
        </div>

        {/* 4'LÜ İSTATİSTİK KARTLARI */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-3xl bg-slate-900/60 border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
              <span>Toplam Dosya</span>
              <Layers className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-white font-mono">
              {stats?.totalDosyalar ?? dosyalar.length}
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">
              PostgreSQL tablosunda kayıtlı
            </span>
          </div>

          <div className="p-4 rounded-3xl bg-slate-900/60 border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
              <span>Aktif Süreçler</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400 font-mono">
              {stats?.aktifDosyalar ?? dosyalar.filter((d) => d.durum === "aktif").length}
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">
              İşlem gören dosyalar
            </span>
          </div>

          <div className="p-4 rounded-3xl bg-slate-900/60 border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
              <span>Tamamlanan</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400 font-mono">
              {stats?.tamamlananDosyalar ?? dosyalar.filter((d) => d.durum === "tamamlandi").length}
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">
              Kabul & ödemesi bitenler
            </span>
          </div>

          <div className="p-4 rounded-3xl bg-slate-900/60 border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
              <span>Yaklaşık Maliyet</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-lg md:text-xl font-black text-emerald-400 font-mono">
              ₺{formatMoney(stats?.toplamYaklasikMaliyet ?? 0)}
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">
              Toplam bütçe hacmi
            </span>
          </div>
        </div>

        {/* FİLTRE & ARAMA ÇUBUĞU */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            <select
              value={filterDurum}
              onChange={(e) => setFilterDurum(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="hepsi">Tüm Durumlar</option>
              <option value="taslak">Taslak</option>
              <option value="aktif">Aktif</option>
              <option value="tamamlandi">Tamamlandı</option>
            </select>

            <select
              value={filterTur}
              onChange={(e) => setFilterTur(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="hepsi">Tüm Alım Türleri</option>
              <option value="mal">Mal Alımı</option>
              <option value="hizmet">Hizmet Alımı</option>
              <option value="yapim_isi">Yapım İşi</option>
              <option value="danismanlik">Danışmanlık</option>
            </select>

            <button
              onClick={loadData}
              disabled={loading}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
              title="Yenile"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          <form onSubmit={handleSearch} className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Dosya No veya İş Adı ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
            />
          </form>
        </div>

        {/* DOSYA LİSTESİ */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs font-semibold">PostgreSQL verileri getiriliyor...</p>
          </div>
        ) : dosyalar.length === 0 ? (
          <div className="py-16 text-center bg-slate-900/30 rounded-3xl border border-slate-800/50 p-8">
            <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-300">
              Henüz Kayıtlı Dosya Bulunmuyor
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
              Backend sunucusu PostgreSQL veritabanına bağlıdır. Yeni bir doğrudan temin dosyası ekleyerek CRUD işlemlerini test edebilirsiniz.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-all cursor-pointer shadow-md"
            >
              + İlk Dosyayı Oluştur
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dosyalar.map((d) => (
              <div
                key={d.id}
                className="rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 p-5 flex flex-col justify-between transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {d.dosyaNo}
                    </span>

                    {/* DURUM ROZETİ */}
                    <div className="flex items-center gap-1.5">
                      <select
                        value={d.durum}
                        onChange={(e) => handleUpdateStatus(d.id, e.target.value)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border cursor-pointer ${
                          d.durum === "aktif"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            : d.durum === "tamamlandi"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-slate-800 text-slate-400 border-slate-700"
                        }`}
                      >
                        <option value="taslak">Taslak</option>
                        <option value="aktif">Aktif</option>
                        <option value="tamamlandi">Tamamlandı</option>
                      </select>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-slate-100 group-hover:text-blue-400 transition-colors line-clamp-2 mb-2">
                    {d.isAdi}
                  </h3>

                  <div className="space-y-1.5 text-xs text-slate-400">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Alım Türü:</span>
                      <span className="font-semibold text-slate-300 uppercase text-[10px]">
                        {d.alimTuru}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Usul:</span>
                      <span className="font-semibold text-slate-300">
                        {d.usul}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Yaklaşık Maliyet:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        ₺{formatMoney(d.yaklasikMaliyet)}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Kalem Sayısı:</span>
                      <span className="font-bold text-slate-300">
                        {d._count?.kalemler ?? d.kalemler?.length ?? 0} Kalem
                      </span>
                    </div>
                  </div>
                </div>

                {/* ALT AKSİYONLAR */}
                <div className="border-t border-slate-800/80 pt-3 mt-4 flex items-center justify-between">
                  <button
                    onClick={async () => {
                      const res = await DosyalarApi.get(d.id);
                      if (res.success) setSelectedDosya(res.data);
                    }}
                    className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                  >
                    Detayları Gör →
                  </button>

                  <button
                    onClick={() => handleDeleteDosya(d.id, d.dosyaNo)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                    title="Dosyayı Sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* YENİ DOSYA OLUŞTURMA MODALI */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 relative animate-in zoom-in-95">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-black text-white mb-1 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-500" />
              Yeni Doğrudan Temin Dosyası (Prisma CRUD)
            </h2>
            <p className="text-xs text-slate-400 mb-5">
              Bilgileri doldurarak PostgreSQL veritabanında yeni bir kayıt oluşturun.
            </p>

            <form onSubmit={handleCreateDosya} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Dosya Numarası *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: 2026/DT-002"
                  value={formData.dosyaNo}
                  onChange={(e) =>
                    setFormData({ ...formData, dosyaNo: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  İşin / Alımın Adı *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Kırtasiye ve Büro Malzemesi Alımı"
                  value={formData.isAdi}
                  onChange={(e) =>
                    setFormData({ ...formData, isAdi: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Alım Türü
                  </label>
                  <select
                    value={formData.alimTuru}
                    onChange={(e) =>
                      setFormData({ ...formData, alimTuru: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="mal">Mal Alımı</option>
                    <option value="hizmet">Hizmet Alımı</option>
                    <option value="yapim_isi">Yapım İşi</option>
                    <option value="danismanlik">Danışmanlık</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Yaklaşık Maliyet (₺)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.yaklasikMaliyet}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        yaklasikMaliyet: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* İSTEĞE BAĞLI İLK KALEM */}
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <span className="text-[11px] font-bold text-blue-400 block">
                  + İlk Kalem Tanımı (Opsiyonel)
                </span>
                <input
                  type="text"
                  placeholder="Malzeme / İş Adı (Örn: A4 Fotokopi Kağıdı)"
                  value={formData.kalemAdi}
                  onChange={(e) =>
                    setFormData({ ...formData, kalemAdi: e.target.value })
                  }
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Miktar (Örn: 50)"
                    value={formData.kalemMiktar}
                    onChange={(e) =>
                      setFormData({ ...formData, kalemMiktar: e.target.value })
                    }
                    className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Birim (Örn: Paket / Adet)"
                    value={formData.kalemBirim}
                    onChange={(e) =>
                      setFormData({ ...formData, kalemBirim: e.target.value })
                    }
                    className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-all cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Kaydediliyor..." : "Veritabanına Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DOSYA DETAY MODALI */}
      {selectedDosya && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <button
              onClick={() => setSelectedDosya(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {selectedDosya.dosyaNo}
              </span>
              <span className="text-xs text-slate-400">
                {new Date(selectedDosya.createdAt).toLocaleDateString("tr-TR")}
              </span>
            </div>

            <h2 className="text-lg font-black text-white mb-4">
              {selectedDosya.isAdi}
            </h2>

            {/* KALEMLER LİSTESİ */}
            <div className="space-y-4 text-xs">
              <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950">
                <div className="px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 font-bold text-slate-300 flex items-center justify-between">
                  <span>İhtiyaç Kalemleri ({selectedDosya.kalemler?.length ?? 0})</span>
                  <span className="text-emerald-400 font-mono font-black">
                    ₺{formatMoney(selectedDosya.yaklasikMaliyet)}
                  </span>
                </div>
                {selectedDosya.kalemler && selectedDosya.kalemler.length > 0 ? (
                  <div className="divide-y divide-slate-800/60">
                    {selectedDosya.kalemler.map((k: any) => (
                      <div
                        key={k.id}
                        className="px-4 py-2.5 flex items-center justify-between"
                      >
                        <div>
                          <span className="text-slate-200 font-semibold block">
                            {k.siraNo}. {k.malzemeAdi}
                          </span>
                          {k.tasinirKodu && (
                            <span className="text-[10px] text-slate-500 font-mono">
                              Taşınır: {k.tasinirKodu}
                            </span>
                          )}
                        </div>
                        <span className="font-mono font-bold text-slate-300">
                          {Number(k.miktar)} {k.birim}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-slate-500 text-xs">
                    Bu dosyaya henüz kalem eklenmemiş.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

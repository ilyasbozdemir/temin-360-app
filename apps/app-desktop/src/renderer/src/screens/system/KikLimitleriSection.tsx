import React, { useState } from "react";
import { AlertTriangle, Edit2, Info, Plus } from "lucide-react";
import { LimitDonemKaydi, useKikLimitDonemleri } from "./kik-limitleri.hooks";
import { donemTarihAraligiUret } from "../../constants/madde-22d-donemler";
import { useSettingsStore } from "../../store/settingsStore";
import { formatCurrency } from "@renderer/utils/formatters";

export function KikLimitleriSection(): React.JSX.Element {
  const {
    donemler,
    isLoading,
    addMutation,
    yaklasanDonemUyarisiGosterilsinMi,
  } = useKikLimitDonemleri();
  const { ekapDonemKurali, limitType } = useSettingsStore();

  const [newDonemKodu, setNewDonemKodu] = useState("");
  const [newBaslangic, setNewBaslangic] = useState("");
  const [newBitis, setNewBitis] = useState("");
  const [newBuyuksehir, setNewBuyuksehir] = useState("");
  const [newDiger, setNewDiger] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Dönem kodu değiştiğinde başlangıç/bitiş tarihlerini otomatik öner (istenirse elle değiştirilebilir)
  React.useEffect(() => {
    if (newDonemKodu.length >= 4) {
      const kural = ekapDonemKurali ? JSON.parse(ekapDonemKurali) : undefined;
      try {
        const res = donemTarihAraligiUret(newDonemKodu, kural);
        setNewBaslangic(res.baslangic_tarihi);
        setNewBitis(res.bitis_tarihi);
      } catch (e) {
        // ignore
      }
    }
  }, [newDonemKodu, ekapDonemKurali]);

  const handleAdd = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setErrorMsg("");
    try {
      let bLimit = parseFloat(
        newBuyuksehir.replace(/\./g, "").replace(",", "."),
      );
      let dLimit = parseFloat(newDiger.replace(/\./g, "").replace(",", "."));

      if (isNaN(bLimit)) bLimit = 0;
      if (isNaN(dLimit)) dLimit = 0;

      if (limitType === "buyuksehir" && bLimit <= 0) {
        setErrorMsg(
          "Kurum tipiniz Büyükşehir olduğu için lütfen Büyükşehir limiti için geçerli bir değer giriniz.",
        );
        return;
      }
      if (limitType === "diger" && dLimit <= 0) {
        setErrorMsg(
          "Kurum tipiniz Diğer İdare olduğu için lütfen Diğer İdareler limiti için geçerli bir değer giriniz.",
        );
        return;
      }
      if (bLimit <= 0 && dLimit <= 0) {
        setErrorMsg("Lütfen en az bir limit değerini giriniz.");
        return;
      }

      if (!newDonemKodu || !newBaslangic || !newBitis) {
        setErrorMsg(
          "Lütfen dönem yılı, başlangıç ve bitiş tarihlerini giriniz.",
        );
        return;
      }

      const isUpdate = donemler.some((d) => d.donem_kodu === newDonemKodu);
      if (isUpdate) {
        if (
          !confirm(
            `UYARI: "${newDonemKodu}" dönemi zaten kayıtlı. Bu dönemi güncellerseniz, bu döneme ait mevcut doğrudan temin hesaplamaları (henüz tamamlanmamış dosyalar için) etkilenebilir.\n\nYine de değerlerin doğruluğunu onaylayıp GÜNCELLEMEK istiyor musunuz?`,
          )
        ) {
          return;
        }
      } else {
        if (
          !confirm(
            `"${newDonemKodu}" dönemini sisteme ekliyorsunuz.\n\nDeğerlerin doğruluğunu onaylıyor musunuz?`,
          )
        ) {
          return;
        }
      }

      await addMutation.mutateAsync({
        donem_kodu: newDonemKodu,
        baslangic_tarihi: newBaslangic,
        bitis_tarihi: newBitis,
        buyuksehir_limit: bLimit,
        diger_limit: dLimit,
      });

      setNewDonemKodu("");
      setNewBaslangic("");
      setNewBitis("");
      setNewBuyuksehir("");
      setNewDiger("");
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMsg(error.message || "Ekleme başarısız.");
      } else {
        setErrorMsg("Ekleme başarısız.");
      }
    }
  };

  const handleEdit = (donem: LimitDonemKaydi) => {
    setNewDonemKodu(donem.donem_kodu);
    setNewBaslangic(donem.baslangic_tarihi);
    setNewBitis(donem.bitis_tarihi);
    setNewBuyuksehir(donem.buyuksehir_limit.toString().replace(".", ","));
    setNewDiger(donem.diger_limit.toString().replace(".", ","));
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(val);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-start gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-xl border border-blue-100 dark:border-blue-800/50">
        <Info className="w-5 h-5 shrink-0 mt-0.5 text-blue-500" />
        <div className="text-sm">
          <p className="font-semibold mb-1">
            Doğrudan Temin (Madde 22/d) Limit Dönemleri
          </p>
          <p>
            Limitler statik değildir. Geçmiş dönemlere ait limitleri ve gelecek
            dönemleri buraya kaydederek geriye dönük hesaplamaların doğru
            çalışmasını sağlayabilirsiniz.
          </p>
        </div>
      </div>

      {yaklasanDonemUyarisiGosterilsinMi() && (
        <div className="flex items-start gap-4 p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 rounded-xl border border-amber-200 dark:border-amber-800/50">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
          <div className="text-sm">
            <p className="font-semibold mb-1">
              Yeni Limitler Yayımlanmış Olabilir
            </p>
            <p>
              1 Şubat itibarıyla yeni KİK eşik değerleri devreye girecektir.
              İlgili limitleri yeni bir dönem ekleyerek sisteme tanımlamanız
              önerilir. Aksi takdirde 1 Şubat itibarıyla tahmini bedel
              hesaplamalarında sorun yaşayabilirsiniz.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <div className="md:col-span-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Yeni Dönem Ekle / Güncelle
          </h3>
          <form onSubmit={handleAdd} className="space-y-4">
            {errorMsg && (
              <div className="p-2 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100">
                {errorMsg}
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Dönem Yılı (Örn: 2027)
              </label>
              <input
                type="text"
                value={newDonemKodu}
                onChange={(e) => setNewDonemKodu(e.target.value)}
                maxLength={4}
                placeholder="2027"
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Başlangıç Tarihi
                </label>
                <input
                  type="date"
                  value={newBaslangic}
                  onChange={(e) => setNewBaslangic(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Bitiş Tarihi
                </label>
                <input
                  type="date"
                  value={newBitis}
                  onChange={(e) => setNewBitis(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/50 text-xs text-indigo-700 dark:text-indigo-300">
              <span className="font-bold flex items-center gap-1 mb-1">
                <Info size={14} /> Bilgi
              </span>
              Sistem ayarlarında Kurum Tipi{" "}
              <strong>
                {limitType === "buyuksehir"
                  ? "Büyükşehir Belediyesi"
                  : "Diğer İdare"}
              </strong>{" "}
              olarak seçili. Sadece bu alanın doldurulması zorunludur. Sistemin
              veri analizlerini iyileştirmek için diğer limiti de
              girebilirsiniz.
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                22/d* (Tek Yıldız) - Büyükşehir Limiti (₺){" "}
                {limitType === "buyuksehir" && (
                  <span className="text-red-500">*</span>
                )}
              </label>
              <input
                type="text"
                value={newBuyuksehir}
                onChange={(e) => setNewBuyuksehir(e.target.value)}
                placeholder="1.021.827,00"
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                22/d** (Çift Yıldız) - Diğer İdareler Limiti (₺){" "}
                {limitType === "diger" && (
                  <span className="text-red-500">*</span>
                )}
              </label>
              <input
                type="text"
                value={newDiger}
                onChange={(e) => setNewDiger(e.target.value)}
                placeholder="340.391,00"
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium"
              />
            </div>
            <button
              type="submit"
              disabled={addMutation.isPending}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-all disabled:opacity-50"
            >
              {addMutation.isPending ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </form>
        </div>

        <div className="md:col-span-2">
          {isLoading
            ? (
              <div className="p-8 text-center text-sm text-slate-500">
                Yükleniyor...
              </div>
            )
            : (
              <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                  <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-xs uppercase font-bold text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Dönem</th>
                      <th className="px-4 py-3">Geçerlilik Aralığı</th>
                      <th className="px-4 py-3">22/d* (Tek Yıldız - Büyükşehir)</th>
                      <th className="px-4 py-3">22/d** (Çift Yıldız - Diğer)</th>
                      <th className="px-4 py-3 w-10">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {donemler.map((donem) => (
                      <tr
                        key={donem.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50"
                      >
                        <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">
                          {donem.donem_kodu}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {donem.baslangic_tarihi} / {donem.bitis_tarihi}
                        </td>
                        <td className="px-4 py-3 font-medium text-blue-600 dark:text-blue-400">
                          {formatCurrency(donem.buyuksehir_limit)}
                        </td>
                        <td className="px-4 py-3 font-medium text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(donem.diger_limit)}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleEdit(donem)}
                            className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                            title="Düzenle"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {donemler.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-8 text-center text-slate-500 italic"
                        >
                          Kayıtlı dönem bulunamadı. Lütfen sol taraftaki formdan
                          ekleyin.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { MessageSquareText, Plus, Receipt, Truck, X } from "lucide-react";
import { bosKalem, MalKalemi, TutanakTipi } from "./types";

interface KabulHizliEkleModalProps {
  formTipi: TutanakTipi | null;
  onClose: () => void;
  onSave: () => void;
  effectiveFirma: string;
  effectiveTeslimAlan: string;
  effectiveTeslimYeri: string;
  faturaNo?: string;
  faturaTarihi?: string;
  irsaliyeNo?: string;
  irsaliyeTarihi?: string;
  dosyaNo?: string;
  tutanaklarLength: number;
}

const inputCls =
  "w-full rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/40 transition-all";
const labelCls =
  "block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5";

export function KabulHizliEkleModal({
  formTipi,
  onClose,
  onSave,
  effectiveFirma,
  effectiveTeslimAlan,
  effectiveTeslimYeri,
  faturaNo = "",
  faturaTarihi = "",
  irsaliyeNo = "",
  irsaliyeTarihi = "",
  dosyaNo = "",
  tutanaklarLength,
}: KabulHizliEkleModalProps): React.JSX.Element | null {
  const [hata, setHata] = useState("");
  const [form, setForm] = useState({
    tarih: new Date().toISOString().slice(0, 10),
    sayi:
      faturaNo ||
      dosyaNo ||
      `KT-${new Date().getFullYear()}-${String(tutanaklarLength + 1).padStart(
        3,
        "0",
      )}`,
    teslimAlan: effectiveTeslimAlan,
    teslimYeri: formTipi === "mal" ? effectiveTeslimYeri : "Hizmet İfa Yeri",
    faturaTarihi: faturaTarihi || new Date().toISOString().slice(0, 10),
    faturaNo: faturaNo || "",
    irsaliyeTarihi: irsaliyeTarihi || new Date().toISOString().slice(0, 10),
    irsaliyeNo: irsaliyeNo || "",
    notlar: "",
    hizmetAciklamasi: "",
  });
  const [kalemler, setKalemler] = useState<MalKalemi[]>([bosKalem(1)]);

  if (!formTipi) return null;

  const kalemGuncelle = (id: number, alan: keyof MalKalemi, deger: string) => {
    setKalemler((ks) =>
      ks.map((k) =>
        k.id === id
          ? {
              ...k,
              [alan]: ["miktari", "toplamTeslimAlinan", "kabulMiktari"].includes(
                alan,
              )
                ? Number(deger)
                : deger,
            }
          : k,
      ),
    );
  };

  const handleSubmit = () => {
    if (
      !form.tarih ||
      !form.sayi ||
      !form.teslimAlan.trim() ||
      !form.teslimYeri.trim()
    ) {
      setHata("Tarih, sayı, teslim alan ve teslim yeri alanları zorunludur.");
      return;
    }
    if (formTipi === "mal" && kalemler.some((k) => !k.malzemeAdi.trim())) {
      setHata("Lütfen tüm malzeme satırları için malzeme adını doldurun.");
      return;
    }
    if (formTipi === "hizmet" && !form.hizmetAciklamasi.trim()) {
      setHata(
        "Hizmet işleri kabul tutanağı için hizmet açıklaması zorunludur.",
      );
      return;
    }

    onSave();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="my-8 w-full max-w-4xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40">
          <div>
            <h4 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
              {formTipi === "mal"
                ? "Mal Muayene Kabul ve Tespit Komisyonu Tutanağı"
                : "Hizmet Muayene Kabul ve Tespit Komisyonu Tutanağı"}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Yüklenici:{" "}
              <strong className="text-slate-700 dark:text-slate-200">
                {effectiveFirma}
              </strong>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {hata && (
            <div className="rounded-xl bg-rose-50 p-3.5 text-xs font-bold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
              ⚠️ {hata}
            </div>
          )}

          {/* Temel Bilgiler */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div>
              <label className={labelCls}>Tutanak Tarihi *</label>
              <input
                type="date"
                className={inputCls}
                value={form.tarih}
                onChange={(e) => setForm({ ...form, tarih: e.target.value })}
              />
            </div>
            <div>
              <label className={labelCls}>Tutanak Sayısı / Evrak No *</label>
              <input
                className={inputCls}
                value={form.sayi}
                onChange={(e) => setForm({ ...form, sayi: e.target.value })}
              />
            </div>
            <div>
              <label className={labelCls}>Teslim Alan (Heyet Başkanı) *</label>
              <input
                className={inputCls}
                value={form.teslimAlan}
                onChange={(e) =>
                  setForm({ ...form, teslimAlan: e.target.value })
                }
              />
            </div>
            <div>
              <label className={labelCls}>Teslim Yeri *</label>
              <input
                className={inputCls}
                value={form.teslimYeri}
                placeholder={
                  formTipi === "mal" ? "Ambar / Depo" : "Hizmet İfa Yeri"
                }
                onChange={(e) =>
                  setForm({ ...form, teslimYeri: e.target.value })
                }
              />
            </div>
          </div>

          {/* Fatura & İrsaliye Bilgileri */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
            <div>
              <label className={`${labelCls} flex items-center gap-1`}>
                <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                <span>Fatura No</span>
              </label>
              <input
                className={inputCls}
                value={form.faturaNo}
                placeholder="Örn: FAT-2026-001"
                onChange={(e) =>
                  setForm({ ...form, faturaNo: e.target.value })
                }
              />
            </div>
            <div>
              <label className={labelCls}>Fatura Tarihi</label>
              <input
                type="date"
                className={inputCls}
                value={form.faturaTarihi}
                onChange={(e) =>
                  setForm({ ...form, faturaTarihi: e.target.value })
                }
              />
            </div>
            <div>
              <label className={`${labelCls} flex items-center gap-1`}>
                <Truck className="w-3.5 h-3.5 text-blue-600" />
                <span>İrsaliye No</span>
              </label>
              <input
                className={inputCls}
                value={form.irsaliyeNo}
                placeholder="Örn: IRS-2026-001"
                onChange={(e) =>
                  setForm({ ...form, irsaliyeNo: e.target.value })
                }
              />
            </div>
            <div>
              <label className={labelCls}>İrsaliye Tarihi</label>
              <input
                type="date"
                className={inputCls}
                value={form.irsaliyeTarihi}
                onChange={(e) =>
                  setForm({ ...form, irsaliyeTarihi: e.target.value })
                }
              />
            </div>
          </div>

          {/* Tutanak Notları / Açıklama */}
          <div>
            <label className={`${labelCls} flex items-center gap-1`}>
              <MessageSquareText className="w-3.5 h-3.5 text-indigo-500" />
              <span>Muayene ve Tespit Notları / Açıklama</span>
            </label>
            <input
              className={inputCls}
              value={form.notlar}
              placeholder="Muayene sonucuna ilişkin ilave tespitler veya kabul notları..."
              onChange={(e) => setForm({ ...form, notlar: e.target.value })}
            />
          </div>

          {formTipi === "hizmet" && (
            <div>
              <label className={labelCls}>
                Hizmet Açıklaması ve Muayene Notları
              </label>
              <textarea
                rows={3}
                className={inputCls}
                value={form.hizmetAciklamasi}
                onChange={(e) =>
                  setForm({ ...form, hizmetAciklamasi: e.target.value })
                }
                placeholder="İfa edilen hizmetin mevzuata ve sözleşme şartlarına uygunluğuna ilişkin muayene notları..."
              />
            </div>
          )}

          {formTipi === "mal" && (
            <div>
              <label className={labelCls}>
                Teslim Alınan Malzeme Kalemleri
              </label>
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">
                    <tr>
                      {[
                        "Sıra",
                        "Malzeme Adı",
                        "Özelliği",
                        "Birimi",
                        "Miktarı",
                        "Teslim Alınan",
                        "Kabul Miktarı",
                        "",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-3 py-2.5 font-bold whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {kalemler.map((k, i) => (
                      <tr key={k.id}>
                        <td className="px-3 py-2 text-slate-400 font-bold text-center">
                          {i + 1}
                        </td>
                        <td className="px-3 py-2 min-w-40">
                          <input
                            className={inputCls}
                            value={k.malzemeAdi}
                            onChange={(e) =>
                              kalemGuncelle(
                                k.id,
                                "malzemeAdi",
                                e.target.value,
                              )
                            }
                            placeholder="Örn: A4 Fotokopi Kağıdı"
                          />
                        </td>
                        <td className="px-3 py-2 min-w-40">
                          <input
                            className={inputCls}
                            value={k.ozelligi}
                            onChange={(e) =>
                              kalemGuncelle(k.id, "ozelligi", e.target.value)
                            }
                            placeholder="Örn: 80 gr/m² 500'lü"
                          />
                        </td>
                        <td className="px-3 py-2 w-24">
                          <input
                            className={inputCls}
                            value={k.birimi}
                            onChange={(e) =>
                              kalemGuncelle(k.id, "birimi", e.target.value)
                            }
                          />
                        </td>
                        <td className="px-3 py-2 w-24">
                          <input
                            type="number"
                            min={0}
                            className={inputCls}
                            value={k.miktari}
                            onChange={(e) =>
                              kalemGuncelle(k.id, "miktari", e.target.value)
                            }
                          />
                        </td>
                        <td className="px-3 py-2 w-28">
                          <input
                            type="number"
                            min={0}
                            className={inputCls}
                            value={k.toplamTeslimAlinan}
                            onChange={(e) =>
                              kalemGuncelle(
                                k.id,
                                "toplamTeslimAlinan",
                                e.target.value,
                              )
                            }
                          />
                        </td>
                        <td className="px-3 py-2 w-28">
                          <input
                            type="number"
                            min={0}
                            className={inputCls}
                            value={k.kabulMiktari}
                            onChange={(e) =>
                              kalemGuncelle(
                                k.id,
                                "kabulMiktari",
                                e.target.value,
                              )
                            }
                          />
                        </td>
                        <td className="px-3 py-2">
                          {kalemler.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                setKalemler((ks) =>
                                  ks.filter((x) => x.id !== k.id),
                                )
                              }
                              className="text-xs text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                            >
                              Kaldır
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                type="button"
                onClick={() =>
                  setKalemler((ks) => [
                    ...ks,
                    bosKalem(Math.max(...ks.map((x) => x.id)) + 1),
                  ])
                }
                className="mt-3 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Malzeme Satırı Ekle</span>
              </button>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-slate-50/70 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700/60 rounded-xl transition-colors cursor-pointer"
          >
            İptal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Kaydet ve Tutanağa İşle
          </button>
        </div>
      </div>
    </div>
  );
}

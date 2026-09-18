import React, { useMemo, useState } from "react";
import { Building2, Calculator, Plus, ShieldAlert, Trophy, UserPlus } from "lucide-react";
import {
  Firma,
  FirmaColumn,
  FiyatIstenenFirmalarınSecilmesiProps,
  MAX_FIRMS,
  MIN_FIRMS,
} from "./FiyatIstenenFirmalari/types";
import { FirmaEkleModali } from "./FiyatIstenenFirmalari/FirmaEkleModali";
import { YeniFirmaModali } from "./FiyatIstenenFirmalari/YeniFirmaModali";
import { FirmaMektupMenu } from "./FiyatIstenenFirmalari/FirmaMektupMenu";
import { RowMenu } from "./FiyatIstenenFirmalari/RowMenu";

export type { Firma, FirmaColumn, FiyatIstenenFirmalarınSecilmesiProps };

export function FiyatIstenenFirmalarınSecilmesi({
  title = "Fiyat İstenen Firmaların Seçilmesi",
  firms,
  columns,
  onFirmaEkle,
  onCreateNewFirm,
  onFirmaCikar,
  onFiyatGir,
  onFiyatPiyasaFormu,
  onBirimFiyatArastirmasi,
  onBosTeklifCetveli,
  onEkapSorgula,
  onOpenFirmaSecmeModali,
  extraHeaderAction,
  winnerFirmaId,
  onSetWinnerFirma,
}: FiyatIstenenFirmalarınSecilmesiProps): React.JSX.Element {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewFirmModalOpen, setIsNewFirmModalOpen] = useState(false);

  const addedFirms = useMemo(() => {
    const seen = new Set<number>();
    return firms.filter((f) => {
      if (!f.isAdded) return false;
      const key = f.temin_firma_id ?? f.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [firms]);

  const availableFirms = useMemo(() => {
    const seen = new Set<number>();
    return firms.filter((f) => {
      if (f.isAdded || seen.has(f.id)) return false;
      seen.add(f.id);
      return true;
    });
  }, [firms]);

  const canAdd = addedFirms.length < MAX_FIRMS;

  const handleConfirm = async (selected: Firma[]) => {
    for (const f of selected) {
      await onFirmaEkle(f);
    }
    setIsModalOpen(false);
  };

  const handleSaveNewFirm = async (firmaData: {
    unvan: string;
    vergi_no?: string;
    telefon?: string;
    email?: string;
    sehir?: string;
  }) => {
    if (onCreateNewFirm) {
      await onCreateNewFirm(firmaData);
    }
  };

  return (
    <>
      {isModalOpen && (
        <FirmaEkleModali
          availableFirms={availableFirms}
          addedCount={addedFirms.length}
          onConfirm={handleConfirm}
          onOpenNewFirm={() => setIsNewFirmModalOpen(true)}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {isNewFirmModalOpen && (
        <YeniFirmaModali
          onClose={() => setIsNewFirmModalOpen(false)}
          onSave={handleSaveNewFirm}
        />
      )}

      <div className="space-y-0 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md shadow-xs overflow-hidden">
        {/* Üst Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/40 dark:bg-slate-900/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-[10px] font-black uppercase tracking-wider">
                  1. Adım
                </span>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {title}
                </h3>
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 px-2 py-0.5 bg-slate-200/70 dark:bg-slate-800 rounded-full">
                  {addedFirms.length} / {MAX_FIRMS} Firma
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Fiyat teklifi istenecek istekli firmalar (En az{" "}
                <span className="font-semibold text-slate-600 dark:text-slate-300">
                  {MIN_FIRMS}
                </span>
                , en fazla{" "}
                <span className="font-semibold text-slate-600 dark:text-slate-300">
                  {MAX_FIRMS}
                </span>{" "}
                firma). Teklif mektuplarını dağıttıktan sonra toplanan fiyatlar <strong>2. Adımda</strong> işlenir.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* 1. Havuzdan Firma Ekle */}
            <button
              type="button"
              disabled={!canAdd}
              onClick={() => {
                if (onOpenFirmaSecmeModali) {
                  onOpenFirmaSecmeModali();
                } else {
                  setIsModalOpen(true);
                }
              }}
              title={
                !canAdd
                  ? `Maksimum ${MAX_FIRMS} firma eklenebilir`
                  : "Havuzdan firma seç ve ekle"
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[11px] font-bold transition-colors cursor-pointer border-0 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Havuzdan Ekle</span>
            </button>

            {/* 2. Yeni Firma Kaydet & Ekle */}
            <button
              type="button"
              disabled={!canAdd}
              onClick={() => setIsNewFirmModalOpen(true)}
              title={
                !canAdd
                  ? `Maksimum ${MAX_FIRMS} firma eklenebilir`
                  : "Yeni firma tanımlayıp doğrudan dosyaya ekle"
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 dark:text-slate-200 text-[11px] font-bold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 shadow-2xs"
            >
              <UserPlus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>+ Yeni Firma</span>
            </button>

            {/* 3. Dağıtım Sonrası: 2. Adım Fiyat Girişi Butonu */}
            {addedFirms.length >= MIN_FIRMS && onFiyatGir && (
              <button
                type="button"
                onClick={onFiyatGir}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-all shadow-xs cursor-pointer border-0 ring-2 ring-emerald-500/20"
                title="Teklif mektuplarını dağıttıktan sonra toplanan fiyatları girmek için 2. adıma geç"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>2. Adım: Toplanan Fiyatları Gir ➔</span>
              </button>
            )}

            {extraHeaderAction}
          </div>
        </div>

        {/* Tablo */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap ${
                      column.className ?? ""
                    }`}
                  >
                    {column.label}
                  </th>
                ))}
                <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 min-w-[200px]">
                  Hızlı Eylemler & Dağıtım
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {addedFirms.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + 1}
                    className="px-4 py-10 text-center text-xs text-slate-400"
                  >
                    Henüz istekli firma eklenmedi.{" "}
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(true)}
                      className="text-blue-500 hover:underline font-bold cursor-pointer bg-transparent border-0 p-0 ml-1"
                    >
                      Havuzdan Firma Seçin
                    </button>
                    {" "}veya{" "}
                    <button
                      type="button"
                      onClick={() => setIsNewFirmModalOpen(true)}
                      className="text-indigo-500 hover:underline font-bold cursor-pointer bg-transparent border-0 p-0"
                    >
                      Yeni Firma Ekleyin
                    </button>
                  </td>
                </tr>
              ) : (
                addedFirms.map((firma, idx) => {
                  const isWinner = winnerFirmaId
                    ? winnerFirmaId === firma.id ||
                      winnerFirmaId === (firma as any).firma_id
                    : false;

                  return (
                    <tr
                      key={
                        firma.temin_firma_id
                          ? `temin-${firma.temin_firma_id}`
                          : `firm-${firma.id}-${idx}`
                      }
                      className={`group transition-colors ${
                        isWinner
                          ? "bg-amber-50/40 dark:bg-amber-950/20 hover:bg-amber-50/70 dark:hover:bg-amber-950/30 font-medium"
                          : "hover:bg-slate-50/70 dark:hover:bg-slate-900/50"
                      }`}
                    >
                      {columns.map((column) => (
                        <td
                          key={column.key}
                          className={`px-4 py-3 text-xs text-slate-700 dark:text-slate-300 ${
                            column.className ?? ""
                          }`}
                        >
                          {column.render ? (
                            column.render(firma)
                          ) : column.key === "unvan" && isWinner ? (
                            <div className="flex items-center gap-2">
                              <span>{String(firma[column.key] ?? "-")}</span>
                              <span className="inline-flex items-center gap-1 text-[9px] font-black bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/25 shrink-0">
                                <Trophy className="w-2.5 h-2.5 text-amber-600" />
                                Kazanan
                              </span>
                            </div>
                          ) : (
                            String(firma[column.key] ?? "-")
                          )}
                        </td>
                      ))}

                      {/* Hızlı Eylem Butonları & Kebap Menüsü */}
                      <td className="px-3 py-2 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          {/* 1. Teklif / Mektup Format Menüsü */}
                          <FirmaMektupMenu
                            firma={firma}
                            onFiyatPiyasaFormu={onFiyatPiyasaFormu}
                            onBirimFiyatArastirmasi={onBirimFiyatArastirmasi}
                            onBosTeklifCetveli={onBosTeklifCetveli}
                          />

                          {/* 2. EKAP Yasaklılık Butonu */}
                          {onEkapSorgula && (
                            <button
                              type="button"
                              onClick={() => onEkapSorgula(firma)}
                              className="px-2 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300 dark:hover:bg-orange-900/60 text-[11px] font-bold transition-colors cursor-pointer border border-orange-200/60 dark:border-orange-800/40 flex items-center gap-1"
                              title={`${firma.unvan} için EKAP Yasaklılık Durumunu Sorgula`}
                            >
                              <ShieldAlert className="w-3 h-3 text-orange-500" />
                              <span>EKAP Sorgu</span>
                            </button>
                          )}

                          {/* 3. Fiyat Gir Butonu */}
                          {onFiyatGir && (
                            <button
                              type="button"
                              onClick={onFiyatGir}
                              className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 dark:hover:bg-emerald-900/60 text-[11px] font-bold transition-colors cursor-pointer border border-emerald-200/60 dark:border-emerald-800/40 flex items-center gap-1"
                              title="Teklif Fiyatlarını Gir"
                            >
                              <Calculator className="w-3 h-3 text-emerald-500" />
                              <span>Fiyat Gir</span>
                            </button>
                          )}

                          {/* 4. Kebap Menüsü */}
                          <RowMenu
                            firma={firma}
                            onFirmaCikar={onFirmaCikar}
                            onFiyatGir={onFiyatGir}
                            onFiyatPiyasaFormu={onFiyatPiyasaFormu}
                            onBirimFiyatArastirmasi={onBirimFiyatArastirmasi}
                            onBosTeklifCetveli={onBosTeklifCetveli}
                            onEkapSorgula={onEkapSorgula}
                            onSetWinnerFirma={onSetWinnerFirma}
                            isWinner={isWinner}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 2. Adım Geçiş Çubuğu */}
        {addedFirms.length >= MIN_FIRMS && onFiyatGir && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-2.5 bg-emerald-50/50 dark:bg-emerald-950/20 border-t border-emerald-100 dark:border-emerald-900/40">
            <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span>
                <strong>{addedFirms.length} İstekli Firma</strong> belirlendi. Teklif mektuplarını dağıttıktan sonra toplanan fiyatları girebilirsiniz:
              </span>
            </div>
            <button
              type="button"
              onClick={onFiyatGir}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer border-0 shrink-0"
              title="Toplanan teklif fiyatlarını girmek için 2. adıma geç"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>2. Adım: Toplanan Fiyatları Gir ➔</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}

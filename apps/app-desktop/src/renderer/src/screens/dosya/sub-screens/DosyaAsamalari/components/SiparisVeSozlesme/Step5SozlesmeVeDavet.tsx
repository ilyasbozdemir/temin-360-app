import React from "react";
import { CheckCircle2 } from "lucide-react";

interface Step5SozlesmeVeDavetProps {
  sozlesmeYapilacakMi: boolean | number;
  onOpenDavetMektubu: () => void;
  onOpenStandartSozlesme: () => void;
  onOpenAlternatifSozlesme: () => void;
  onOpenUzunFormSozlesme: () => void;
}

export function Step5SozlesmeVeDavet({
  sozlesmeYapilacakMi,
  onOpenDavetMektubu,
  onOpenStandartSozlesme,
  onOpenAlternatifSozlesme,
  onOpenUzunFormSozlesme,
}: Step5SozlesmeVeDavetProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-950/60 flex items-center justify-center text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Adım 5: Sözleşmeye Davet & Sözleşme Belgeleri
            </h3>
            <p className="text-[11px] text-slate-400">
              {sozlesmeYapilacakMi
                ? "Sözleşme imzalanması seçilmiştir. Yasal davet mektubu ve sözleşme metinlerini hazırlayabilirsiniz."
                : "Bu dosyada sözleşme yapılmayacak olarak belirlenmiştir. İhtiyaç halinde aşağıdaki butonlardan sözleşme hazırlayabilirsiniz."}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Sözleşmeye Davet Mektubu */}
        <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-850/60 border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-extrabold text-violet-600 dark:text-violet-400 uppercase">
              Yasal 10 Gün Davet
            </span>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Sözleşmeye Davet Mektubu
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
              Firmayı 10 gün içinde sözleşmeye çağıran tebligat yazısı.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenDavetMektubu}
            className="w-full py-1.5 px-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs cursor-pointer shadow-2xs active:scale-95 transition-all"
          >
            Davet Mektubunu Aç
          </button>
        </div>

        {/* Standart Sözleşme */}
        <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-850/60 border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-extrabold text-cyan-600 dark:text-cyan-400 uppercase">
              Standart Tip
            </span>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Doğrudan Temin Sözleşmesi
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
              Mevzuata uygun standart doğrudan temin sözleşme metni.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenStandartSozlesme}
            className="w-full py-1.5 px-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs cursor-pointer shadow-2xs active:scale-95 transition-all"
          >
            Standart Sözleşme
          </button>
        </div>

        {/* Alternatif Sözleşme */}
        <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-850/60 border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase">
              Alternatif Tip
            </span>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Alternatif Sözleşme
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
              Farklı idari hükümler içeren alternatif sözleşme şablonu.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenAlternatifSozlesme}
            className="w-full py-1.5 px-2.5 rounded-lg bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer shadow-2xs active:scale-95 transition-all"
          >
            Alternatif Sözleşme
          </button>
        </div>

        {/* Uzun Form Sözleşme */}
        <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-850/60 border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase">
              Geniş Kapsamlı
            </span>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Uzun Form Sözleşme
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
              Tüm cezai ve teknik şartları içeren detaylı sözleşme.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenUzunFormSozlesme}
            className="w-full py-1.5 px-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer shadow-2xs active:scale-95 transition-all"
          >
            Uzun Formu Aç
          </button>
        </div>
      </div>
    </div>
  );
}

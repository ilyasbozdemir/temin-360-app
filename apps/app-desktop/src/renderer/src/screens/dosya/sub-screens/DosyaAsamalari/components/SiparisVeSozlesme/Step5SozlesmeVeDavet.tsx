import React from 'react'

interface Step5SozlesmeVeDavetProps {
  sozlesmeYapilacakMi?: boolean | number
  onOpenDavetMektubu: () => void
  onOpenStandartSozlesme: () => void
  onOpenAlternatifSozlesme: () => void
  onOpenUzunFormSozlesme: () => void
}

export function Step5SozlesmeVeDavet({
  onOpenDavetMektubu,
  onOpenStandartSozlesme,
  onOpenAlternatifSozlesme,
  onOpenUzunFormSozlesme
}: Step5SozlesmeVeDavetProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-4">
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

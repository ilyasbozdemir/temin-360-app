import React from "react";

interface StepTimelineAllProps {
  onOpenSonucOnay: () => void;
  onOpenEkap: () => void;
  onOpenKabulMektubu: () => void;
  onOpenDavetMektubu: () => void;
  onOpenSozlesme: () => void;
}

export function StepTimelineAll({
  onOpenSonucOnay,
  onOpenEkap,
  onOpenKabulMektubu,
  onOpenDavetMektubu,
  onOpenSozlesme,
}: StepTimelineAllProps) {
  const items = [
    {
      num: "1",
      title: "Sonuç Onay Belgesi",
      desc: "Piyasa fiyat araştırması sonuç kararını onaylayın",
      btn: "Belgeyi Aç",
      action: onOpenSonucOnay,
    },
    {
      num: "2",
      title: "Kabul Yazısı / Sipariş Formu",
      desc: "Kazanan firmaya sipariş ve kabul tebligatı",
      btn: "Kabul Mektubu Aç",
      action: onOpenKabulMektubu,
    },
    {
      num: "3",
      title: "Sözleşmeye Davet Mektubu",
      desc: "Sözleşme imzalanması için yasal 10 gün süre",
      btn: "Davet Mektubu Aç",
      action: onOpenDavetMektubu,
    },
    {
      num: "4",
      title: "Doğrudan Temin Sözleşmesi",
      desc: "Standart, alternatif veya uzun form sözleşme",
      btn: "Sözleşmeyi Aç",
      action: onOpenSozlesme,
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
          Aşama Süreç Akışı ve Tüm Belgeler
        </h3>
        <span className="text-[11px] text-slate-400">
          Tüm adımları tek bakışta inceleyin
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-850/60 border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between gap-2"
          >
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-extrabold text-xs flex items-center justify-center">
                {item.num}
              </span>
              <strong className="text-xs text-slate-800 dark:text-slate-100">
                {item.title}
              </strong>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
              {item.desc}
            </p>
            <button
              type="button"
              onClick={item.action}
              className="w-full py-1.5 px-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-[11px] transition-all cursor-pointer"
            >
              {item.btn}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

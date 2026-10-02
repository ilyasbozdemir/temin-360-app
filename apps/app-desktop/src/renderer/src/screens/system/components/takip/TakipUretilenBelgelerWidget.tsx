import React from 'react'
import { CheckCircle2, Clock, FileCheck } from 'lucide-react'

interface TakipUretilenBelgelerWidgetProps {
  dbBelgeler: any[]
  onToggleSign: (belgeId: number, currentState: number) => void
}

export function TakipUretilenBelgelerWidget({
  dbBelgeler,
  onToggleSign
}: TakipUretilenBelgelerWidgetProps): React.JSX.Element {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <FileCheck className="w-5 h-5 text-indigo-500" />
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
            Üretilen Belgeler ve İmza Takibi
          </h3>
          <p className="text-[10px] text-slate-500">
            Sistemden üretilmiş dosyaların ıslak imzalı kopyalarını buradan takip edebilirsiniz.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {dbBelgeler.length === 0 ? (
          <div className="p-3 text-xs text-slate-500 text-center italic bg-slate-50 dark:bg-slate-900 rounded-lg">
            Henüz bu dosya için belge üretilmemiş.
          </div>
        ) : (
          dbBelgeler.map((belge) => (
            <div
              key={belge.id}
              className={`flex items-center justify-between p-2.5 rounded-lg border transition-colors duration-200 ${
                belge.is_signed
                  ? 'bg-emerald-50/30 border-emerald-100 dark:bg-emerald-950/10 dark:border-emerald-900/30'
                  : 'bg-slate-50/50 border-slate-200 dark:bg-slate-900 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                    belge.is_signed ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                  }`}
                />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {belge.belge_adi}
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={belge.is_signed ? 'true' : 'false'}
                onClick={() => onToggleSign(belge.id, belge.is_signed)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 cursor-pointer ${
                  belge.is_signed
                    ? 'bg-emerald-500 focus:ring-emerald-400'
                    : 'bg-slate-300 dark:bg-slate-600 focus:ring-slate-400'
                }`}
                title={belge.is_signed ? 'İmzayı kaldır' : 'İmzalandı olarak işaretle'}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    belge.is_signed ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </button>
              <span
                className={`text-[10px] font-bold flex items-center gap-1 min-w-[70px] justify-end ${
                  belge.is_signed
                    ? 'text-emerald-600 dark:text-emerald-500'
                    : 'text-amber-600 dark:text-amber-400'
                }`}
              >
                {belge.is_signed ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> İmzalandı
                  </>
                ) : (
                  <>
                    <Clock className="w-3.5 h-3.5" /> Bekliyor
                  </>
                )}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

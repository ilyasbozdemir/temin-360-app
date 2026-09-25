import React from 'react'
import { CheckCircle2, Lock } from 'lucide-react'

interface KlasorStatusHeaderProps {
  isDosyaClosed: boolean
  onToggleDosyaClosed: () => void
}

export function KlasorStatusHeader({
  isDosyaClosed,
  onToggleDosyaClosed
}: KlasorStatusHeaderProps) {
  return (
    <div
      className={`flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl border shadow-sm transition-colors ${
        isDosyaClosed
          ? 'bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700'
          : 'bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-800/50'
      }`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
            isDosyaClosed
              ? 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
              : 'bg-emerald-100 dark:bg-emerald-900/40 border-emerald-300/40 dark:border-emerald-700/40'
          }`}
        >
          {isDosyaClosed ? (
            <Lock className="w-6 h-6 text-slate-500 dark:text-slate-400" />
          ) : (
            <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          )}
        </div>
        <div>
          <h3 className="text-sm font-black text-slate-800 dark:text-slate-200">
            {isDosyaClosed
              ? 'Dosya Kapatıldı (Arşivlendi)'
              : 'Süreç Tamamlandı: Arşivlemeye Hazır'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isDosyaClosed
              ? 'Bu dosyadaki işlemler bitmiş ve fiziksel olarak arşive kaldırılmıştır.'
              : 'Tüm adımlar tamamlandı. Fiziksel dosyanızı hazırlayıp kapatabilirsiniz.'}
          </p>
        </div>
      </div>
      <div className="mt-4 md:mt-0">
        <button
          onClick={onToggleDosyaClosed}
          className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer ${
            isDosyaClosed
              ? 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20 hover:shadow-emerald-500/30'
          }`}
        >
          {isDosyaClosed ? (
            <>Kilidi Aç &amp; Düzenle</>
          ) : (
            <>
              <Lock className="w-4 h-4" /> İşleri Bitir &amp; Dosyayı Kapat
            </>
          )}
        </button>
      </div>
    </div>
  )
}

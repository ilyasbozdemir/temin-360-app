import React from 'react'
import { Link } from '@tanstack/react-router'
import { AlertTriangle, ArrowLeft, PackageSearch } from 'lucide-react'
import { APP_ROUTES } from '../../../../../../constants/routeConstants'

export function KabulGuardWarning() {
  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-300">
      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-700/60 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0 border border-amber-300/50 dark:border-amber-700/40">
            <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-extrabold text-amber-800 dark:text-amber-300">
              Kazanan Firma Belirlenmedi
            </h3>
            <p className="text-xs text-amber-700 dark:text-amber-400/90 leading-relaxed max-w-xl">
              Muayene &amp; Kabul &amp; Ödeme belgelerini oluşturabilmek için önce{' '}
              <strong>Piyasa Fiyat Araştırması</strong> adımında kazanan firmayı belirlemeniz
              gerekir. Tutanağı kaydederken <em>&ldquo;En Düşük Teklifi Kazanan Yap&rdquo;</em> seçeneğini
              işaretleyin ya da açılan firma listesinden kazananı elle seçin.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-amber-200 dark:border-amber-800/60 pt-4">
          <Link
            to={APP_ROUTES.PIYASA_FIYAT_ARASTIRMASI}
            className="flex items-center gap-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl shadow-sm hover:shadow transition-all cursor-pointer border-0"
          >
            <PackageSearch className="w-4 h-4" />
            Piyasa Fiyat Araştırması&apos;na Git
          </Link>
          <Link
            to={APP_ROUTES.PIYASA_FIYAT_ARASTIRMASI}
            className="flex items-center gap-2 text-xs font-bold bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Geri Dön
          </Link>
        </div>
      </div>
    </div>
  )
}

import React from 'react'
import { BookOpen } from 'lucide-react'

export function TakipIsAkisiYonergesi(): React.JSX.Element {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-600" />
          Doğrudan Temin İş Akışı & Şablon Yönergesi
        </h3>
        <span className="text-[10px] px-2 py-0.5 bg-blue-50 dark:bg-blue-955/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30 rounded-full font-bold uppercase tracking-wider">
          Dinamik Altyapı
        </span>
      </div>

      <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed space-y-3">
        <p>
          Sistemimizdeki tüm şablonlar, dosyaya girdiğiniz veriler ile
          <strong className="text-slate-800 dark:text-slate-200">
            {' '}
            tamamen dinamik ve otomatik{' '}
          </strong>
          olarak doldurulur. Süreç boyunca yaptığınız her giriş anında evraklara yansır.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 rounded-2xl flex gap-3">
            <span className="text-base select-none">💡</span>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                Esnek & Dinamik Şablonlar
              </h4>
              <p className="text-[10.5px] text-slate-500 leading-normal">
                Şablonların yerleşimleri ve içerikleri mevzuata uygun şekilde dinamik olarak
                bağlanmıştır.
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 rounded-2xl flex gap-3">
            <span className="text-base select-none">🚀</span>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                Süreç Nasıl Başlar? (1. Aşama)
              </h4>
              <p className="text-[10.5px] text-slate-500 leading-normal">
                İhtiyaç listesini girerek süreci başlatırsınız. Bu adıma göre Lüzum Müzekkeresi ve
                Harcama Talimatı gibi başlangıç belgeleri üretilir.
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 rounded-2xl flex gap-3">
            <span className="text-base select-none">📊</span>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                Piyasa Fiyat Araştırması (2. Aşama)
              </h4>
              <p className="text-[10.5px] text-slate-500 leading-normal">
                Firma tekliflerini girdiğinizde, komisyonlar ve yaklaşık maliyet hesaplamaları
                otomatik olarak dolup cetvel haline getirilir.
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 rounded-2xl flex gap-3">
            <span className="text-base select-none">🏁</span>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                Sözleşme & Süreç Sonu (3/4. Aşama)
              </h4>
              <p className="text-[10.5px] text-slate-500 leading-normal">
                Kazanan firmayı atar, sözleşme basar ve son aşamada Muayene Kabul Tutanağı ile
                süreci kapatıp imzaya çıkarırsınız.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

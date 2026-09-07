import React from 'react'

interface GenelTabProps {
  disableDocumentGuidance: boolean
  setDisableDocumentGuidance: (val: boolean) => void
  unifiedStepperMode: boolean
  setUnifiedStepperMode: (val: boolean) => void
}

export const GenelTab: React.FC<GenelTabProps> = ({
  disableDocumentGuidance,
  setDisableDocumentGuidance,
  unifiedStepperMode,
  setUnifiedStepperMode
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
        <div>
          <h2 className="text-lg font-bold text-slate-850 dark:text-slate-100">
            Genel Sistem Ayarları
          </h2>
          <p className="text-xs text-slate-500">
            Uygulamanın genel davranışını ve belge akış yönlendirmelerini düzenleyin.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-350 mb-2">
            Belge Çıkarma & Yönlendirme Modu
          </label>
          <p className="text-xs text-slate-500 mb-4">
            Diyalog adımlarında (Hazırlık, Teklifler, Sipariş, Kabul) belgeleri yazdırma ve işlem
            yapma butonlarının gösterilip gösterilmeyeceğini belirleyin.
          </p>

          <div className="space-y-3">
            <label className="flex items-start gap-3 p-4 bg-slate-50/50 dark:bg-slate-900/20 border border-slate-205 dark:border-slate-800 rounded-2xl cursor-pointer hover:bg-slate-100/30 dark:hover:bg-slate-800/20 transition-all">
              <input
                type="radio"
                name="documentGuidanceMode"
                checked={disableDocumentGuidance}
                onChange={() => setDisableDocumentGuidance(true)}
                className="mt-0.5 rounded-full border-slate-300 dark:border-slate-700 bg-slate-55 dark:bg-slate-950 text-blue-600 focus:ring-blue-500 accent-blue-600 cursor-pointer"
              />
              <div>
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 block">
                  Serbest Belge Çıkarma Modu (Varsayılan)
                </span>
                <span className="text-[11px] text-slate-500 block mt-1 leading-relaxed">
                  {
                    'Dosya adımlarındaki "Belgeleri Yazdır" kılavuz butonunu gizler. Bunun yerine "İşlemler" menüsünü ve serbest belge çıkarma seçeneklerini gösterir.'
                  }
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 bg-slate-50/50 dark:bg-slate-900/20 border border-slate-205 dark:border-slate-800 rounded-2xl cursor-pointer hover:bg-slate-100/30 dark:hover:bg-slate-800/20 transition-all">
              <input
                type="radio"
                name="documentGuidanceMode"
                checked={!disableDocumentGuidance}
                onChange={() => setDisableDocumentGuidance(false)}
                className="mt-0.5 rounded-full border-slate-300 dark:border-slate-700 bg-slate-55 dark:bg-slate-950 text-blue-600 focus:ring-blue-500 accent-blue-600 cursor-pointer"
              />
              <div>
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 block">
                  Yönlendirmeli Akış Modu (Kılavuzlu)
                </span>
                <span className="text-[11px] text-slate-500 block mt-1 leading-relaxed">
                  {
                    'Dosya adımlarında ilgili aşamanın belgelerini hazırlamanız için "Belgeleri Yazdır" butonunu gösterir, "İşlemler" menüsünü gizler.'
                  }
                </span>
              </div>
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-350 mb-2">
            Dosya Aşamaları Navigasyon Tipi
          </label>
          <p className="text-xs text-slate-500 mb-4">
            Dosya aşamalarına tıkladığınızda işlemlerin tek bir pencerede (Stepper) mi, yoksa ayrı
            sayfalarda mı açılacağını seçin.
          </p>

          <div className="space-y-3">
            <label className="flex items-start gap-3 p-4 bg-slate-50/50 dark:bg-slate-900/20 border border-slate-205 dark:border-slate-800 rounded-2xl cursor-pointer hover:bg-slate-100/30 dark:hover:bg-slate-800/20 transition-all">
              <input
                type="radio"
                name="unifiedStepperMode"
                checked={unifiedStepperMode}
                onChange={() => setUnifiedStepperMode(true)}
                className="mt-0.5 rounded-full border-slate-300 dark:border-slate-700 bg-slate-55 dark:bg-slate-950 text-blue-600 focus:ring-blue-500 accent-blue-600 cursor-pointer"
              />
              <div>
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 block">
                  Tek Ekran (Stepper) Görünümü (Varsayılan)
                </span>
                <span className="text-[11px] text-slate-500 block mt-1 leading-relaxed">
                  Tüm aşamaları sol taraftaki menü yardımıyla tek bir ekrandan sayfa değiştirmeden
                  yönetin.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 bg-slate-50/50 dark:bg-slate-900/20 border border-slate-205 dark:border-slate-800 rounded-2xl cursor-pointer hover:bg-slate-100/30 dark:hover:bg-slate-800/20 transition-all">
              <input
                type="radio"
                name="unifiedStepperMode"
                checked={!unifiedStepperMode}
                onChange={() => setUnifiedStepperMode(false)}
                className="mt-0.5 rounded-full border-slate-300 dark:border-slate-700 bg-slate-55 dark:bg-slate-950 text-blue-600 focus:ring-blue-500 accent-blue-600 cursor-pointer"
              />
              <div>
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 block">
                  Ayrı Sekmeler Görünümü
                </span>
                <span className="text-[11px] text-slate-500 block mt-1 leading-relaxed">
                  Aşamalara tıklandığında tam sayfa olarak ayrı bir sekmeye (sayfaya) yönlendirilir.
                </span>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

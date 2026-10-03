import React from 'react'

export const MuhasebeKanitlayiciBelgeler: React.FC = () => {
  return (
    <>
      {/* 1. KANITLAYICI BELGELER */}
      <div className="bg-white dark:bg-slate-955 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-250 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          1. Ödeme Dosyasında Bulunması Gereken Kanıtlayıcı Belgeler
        </h3>
        <p className="text-xs text-slate-655 dark:text-slate-400 leading-relaxed">
          Mahalli İdareler Harcama Belgeleri Yönetmeliği Madde 22 kapsamında, doğrudan temin
          yöntemiyle yapılan alımların ödemelerinde aşağıdaki belgelerin ödeme emri belgesine
          eklenmesi zorunludur:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-2">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              Mal Alımları İçin Kontrol Listesi:
            </span>
            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
              <li>Doğrudan Temin Onay Belgesi</li>
              <li>Yaklaşık Maliyet Cetveli</li>
              <li>Piyasa Fiyat Araştırması Tutanağı</li>
              <li>Teklif Mektupları</li>
              <li>Fatura (Asıl/E-Fatura)</li>
              <li>Muayene ve Kabul Komisyonu Tutanağı</li>
              <li>Taşınır İşlem Fişi (TİF - Ambar Girişi)</li>
              <li>SGK ve Vergi Borcu Yoktur Belgeleri</li>
            </ul>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-2">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              Hizmet / Yapım İşleri İçin Kontrol Listesi:
            </span>
            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
              <li>Doğrudan Temin Onay Belgesi</li>
              <li>Piyasa Fiyat Araştırması Tutanağı</li>
              <li>Teklif Mektupları &amp; Varsa Sözleşme</li>
              <li>Fatura (Asıl/E-Fatura)</li>
              <li>Hizmet İşleri Kabul Teklif Belgesi</li>
              <li>Hizmet/Yapım Muayene Kabul Tutanakları</li>
              <li>SGK ve Vergi Borcu Yoktur Belgeleri</li>
              <li>Hakediş Raporları (Kademeli işlerde)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 2. VERGİ KESİNTİLERİ VE ORANLAR */}
      <div className="bg-white dark:bg-slate-955 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-250 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          2. Mali Kesintiler ve Vergi Oranları (Güncel)
        </h3>
        <p className="text-xs text-slate-655 dark:text-slate-400 leading-relaxed">
          Muhasebe yetkilisi tarafından hak sahibine ödeme yapılmadan önce kanun gereği hesaplanıp
          bütçeye gelir kaydedilmesi gereken kesintiler:
        </p>
        <div className="space-y-3">
          {/* Damga Vergisi */}
          <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-750 dark:text-slate-250 mb-1">
              A. Damga Vergisi Kesintileri
            </h4>
            <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <li>
                <strong>Ödeme Damga Vergisi:</strong> Hak sahibine fatura tutarı (KDV hariç matrah)
                üzerinden <strong>Binde 9,48</strong> oranında uygulanır.
              </li>
              <li>
                <strong>Karar Damga Vergisi:</strong> İdare ile yüklenici arasında yazılı bir
                sözleşme imzalanması durumunda, sözleşme bedeli üzerinden <strong>Binde 5,69</strong>{' '}
                oranında Damga Vergisi kesilerek ilgili vergi dairesine yatırılır.
              </li>
            </ul>
          </div>

          {/* KDV Tevkifatı */}
          <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-750 dark:text-slate-250 mb-1">
              B. KDV Tevkifatı (Kısmi Vergi Sorumluluğu)
            </h4>
            <p className="text-[11px] text-slate-550 dark:text-slate-450 mb-2">
              Kamu kurumlarına sunulan belirli hizmetlerde fatura KDV&apos;sinin bir kısmı doğrudan
              vergi dairesine beyan edilmek üzere kesilir:
            </p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="font-semibold block text-slate-700 dark:text-slate-350">
                  Temizlik Hizmetleri
                </span>
                <span className="text-blue-600 dark:text-blue-400 font-bold">9/10 Tevkifat</span>
              </div>
              <div className="p-2 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="font-semibold block text-slate-700 dark:text-slate-350">
                  Güvenlik Hizmetleri
                </span>
                <span className="text-blue-600 dark:text-blue-400 font-bold">9/10 Tevkifat</span>
              </div>
              <div className="p-2 bg-white dark:bg-slate-955 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="font-semibold block text-slate-700 dark:text-slate-350">
                  Yemek &amp; Organizasyon
                </span>
                <span className="text-blue-600 dark:text-blue-400 font-bold">5/10 Tevkifat</span>
              </div>
              <div className="p-2 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="font-semibold block text-slate-700 dark:text-slate-350">
                  Yapım ve Onarım İşleri
                </span>
                <span className="text-blue-600 dark:text-blue-400 font-bold">4/10 Tevkifat</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

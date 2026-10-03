import React, { useState } from 'react'

export function DogrudanTeminSurecAkisi(): React.JSX.Element {
  const [activeSubTab, setActiveSubTab] = useState<'roller' | 'surec'>('roller')

  const roles = [
    {
      step: '1',
      title: 'İHTİYAÇ / TALEP',
      role: 'İhtiyaç Sahibi Birim',
      desc: 'Harcama birimi fiili ihtiyacı tespit eder.',
      action:
        '“Şuna ihtiyacım var” diyerek İhtiyaç Listesi / Talep Formu (Lüzum Müzekkeresi) oluşturur ve süreci başlatır.',
      bg: 'from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/10 border-blue-200 dark:border-blue-900/50',
      text: 'text-blue-700 dark:text-blue-400',
      iconBg: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
    },
    {
      step: '2',
      title: 'HARCAMA YETKİLİSİ',
      role: 'Birim Amiri (Müdür, Başkan, Rektör vb.)',
      desc: 'Harcamaya karar veren ve bütçeyi kullandıran ana yetkili.',
      action:
        '“Bu alım yapılsın” talimatı verir, Onay Belgesini imzalar. Sürecin en üst sorumlusudur.',
      bg: 'from-amber-50 to-orange-50 dark:from-amber-955/20 dark:to-orange-955/10 border-amber-200 dark:border-amber-900/50',
      text: 'text-amber-700 dark:text-amber-400',
      iconBg: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
    },
    {
      step: '3',
      title: 'GERÇEKLEŞTİRME GÖREVLİSİ',
      role: 'Satın Alma Müdürü, Şef, Görevlendirilen Personel',
      desc: 'Harcama yetkilisinin talimatıyla alım işlemlerini fiilen yürüten kişi.',
      action:
        'Piyasa fiyat araştırması yapar, teklifleri alır. Muayene ve kabul işlemlerini yapar. Ödeme Emri Belgesini hazırlar ve “Mal/hizmet alındı, fatura doğrudur” diyerek imzalar.',
      bg: 'from-purple-50 to-fuchsia-50 dark:from-purple-955/20 dark:to-fuchsia-955/10 border-purple-200 dark:border-purple-900/50',
      text: 'text-purple-700 dark:text-purple-400',
      iconBg: 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
    },
    {
      step: '4',
      title: 'ÖN MALİ KONTROL',
      role: 'Mali Hizmetler Birimi (Müdür / Personel)',
      desc: 'Harcamanın bütçeye ve genel mevzuata uygunluğunu denetleyen birim.',
      action:
        'Ödeneğin yeterli olup olmadığını kontrol eder. Mevzuata uygunluk durumunda “Uygun Görüş” verir.',
      bg: 'from-sky-50 to-cyan-50 dark:from-sky-955/20 dark:to-cyan-955/10 border-sky-200 dark:border-sky-900/50',
      text: 'text-sky-700 dark:text-sky-400',
      iconBg: 'bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300'
    },
    {
      step: '5',
      title: 'MUHASEBE YETKİLİSİ',
      role: 'Sayman, Muhasebe Müdürü',
      desc: 'Harcama biriminden tamamen bağımsız, ödemeyi gerçekleştiren merci.',
      action:
        'Gelen hak sahibi belgelerini (fatura, tutanak vb.) son kez kontrol eder. Ödeme Emrini onaylar ve bankadan fiili EFT/havale işlemini yaparak muhasebe kaydını girer.',
      bg: 'from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/10 border-emerald-200 dark:border-emerald-900/50',
      text: 'text-emerald-700 dark:text-emerald-450',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
    }
  ]

  const steps = [
    {
      title: '1- İHTİYAÇ OLUŞTU (TALEP / Lüzum Müzekkeresi)',
      desc: 'İhtiyaç sahibi birim tarafından alımı talep edilen mal veya hizmet belirlenir ve Lüzum Müzekkeresi ile resmi satın alma süreci tetiklenir.'
    },
    {
      title: '2- DOĞRUDAN TEMİN ONAYI ALINDI',
      desc: 'Harcama Yetkilisi (Birim Amiri) tarafından "Bu alım yapılsın" talimatı verilir ve resmi Onay Belgesi imzalanır.'
    },
    {
      title: '3- PİYASA FİYAT ARAŞTIRMASI YAPILDI',
      desc: 'Görevlendirilen gerçekleştirme görevlileri piyasadan teklifleri toplar ve resmi Piyasa Fiyat Araştırma Tutanağına işler.'
    },
    {
      title: '4- YÜKLENİCİ BELİRLENDİ',
      desc: 'Piyasa fiyat araştırması sonucunda en uygun/ekonomik teklifi sunan firma "Yüklenici" olarak belirlenir ve onaylanır.'
    },
    {
      title: '5- MAL / HİZMET TESLİM EDİLDİ',
      desc: 'Belirlenen yüklenici firma, talep edilen malı veya hizmeti kuruma/ambara fiilen teslim eder.'
    },
    {
      title: '6- TESLİM TESELLÜM TUTANAĞI',
      desc: '✍️ "Kim teslim etti, kim teslim aldı?"\nTeslimatın yapıldığına dair malları teslim eden yüklenici ile teslim alan görevliler arasında imzalanan iki taraflı tutanaktır.'
    },
    {
      title: '7- MUAYENE VE KABUL TUTANAĞI',
      desc: '🔎 "Komisyon kontrol etti, uygun buldu."\nMuayene ve kabul komisyonu üyeleri tarafından teslim edilen malların veya hizmetin teknik şartlara, Lüzum Müzekkeresine uygun olup olmadığı kontrol edilerek kabul edilir.'
    },
    {
      title: '8- FATURA DÜZENLENDİ',
      desc: 'Yüklenici firma, kabul işleminin ardından mal/hizmet bedeli için resmi e-faturayı/arşiv faturasını keser ve kuruma sunar.'
    },
    {
      title: '9- ÖDEME TALEP DİLEKÇESİ',
      desc: '🏦 "Bedelin şu IBAN\'a ödenmesini talep ediyorum."\nYüklenici firmanın alacak tutarının belirtilen şirket IBAN numarasına yatırılmasını talep ettiği resmi başvuru dilekçesidir.'
    },
    {
      title: '10- TAŞINIR İŞLEM FİŞİ (TİF)',
      desc: '📦 "Mal envantere girdi."\nAlınan malzeme demirbaş veya tüketim malzemesi ise ambar memuru tarafından Taşınır İşlem Fişi (TİF) düzenlenerek resmi envantere/stok kaydına alınır.'
    },
    {
      title: '11- ÖDEME EMRİ (MUHASEBE ÖDEMEYİ YAPTI)',
      desc: '💳 Tüm kanıtlayıcı belgeler (fatura, tutanaklar, dilekçe, TİF vb.) eklenerek Ödeme Emri Belgesi hazırlanır ve Muhasebe Yetkilisi bankadan fiili EFT/havale işlemini gerçekleştirir.'
    }
  ]

  return (
    <div className="p-6 overflow-y-auto h-full max-h-full custom-scrollbar bg-slate-50 dark:bg-slate-900/40">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center pb-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
            Doğrudan Temin & Kamu Harcama Süreci
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            5018 Sayılı Kamu Mali Yönetimi Kanunu Rolleri ve Doğrudan Temin İşlem Adımları Rehberi
          </p>
        </div>

        <div className="flex justify-center border-b border-slate-200 dark:border-slate-800 pb-px">
          <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl">
            <button
              onClick={() => setActiveSubTab('roller')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeSubTab === 'roller'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/50 dark:border-slate-800'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-350'
              }`}
            >
              👥 5018 Harcama Rolleri
            </button>
            <button
              onClick={() => setActiveSubTab('surec')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeSubTab === 'surec'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/50 dark:border-slate-800'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-350'
              }`}
            >
              ⚙️ Doğrudan Temin İşlem Adımları
            </button>
          </div>
        </div>

        {activeSubTab === 'roller' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {roles.map((role) => (
                <div
                  key={role.step}
                  className={`bg-gradient-to-r ${role.bg} border rounded-2xl p-5 shadow-xs transition-all hover:shadow-sm`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-xl font-black text-sm shrink-0 ${role.iconBg}`}
                    >
                      {role.step}
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 ${role.text}`}
                        >
                          {role.title}
                        </span>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-250">
                          {role.role}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-650 dark:text-slate-400 leading-normal font-normal">
                        <strong>Tarihsel Görevi:</strong> {role.desc}
                      </p>
                      <p className="text-xs text-slate-705 dark:text-slate-300 leading-relaxed font-semibold mt-2 pt-2 border-t border-slate-200/40 dark:border-slate-800/40">
                        ⚡ {role.action}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-150 dark:border-blue-900/50 rounded-2xl p-4 text-xs text-blue-750 dark:text-blue-400 leading-relaxed mt-4">
              📌 <strong>5018 Sayılı Kanun Uyarınca Temel Kural:</strong> Harcama Yetkilisi
              (Onaylayan) ile Muhasebe Yetkilisi (Ödeyen) unvanları{' '}
              <strong>asla aynı kişide birleşemez</strong>. Muhasebe birimi tamamen bağımsız kontrol
              mercii olarak çalışır.
            </div>
          </div>
        )}

        {activeSubTab === 'surec' && (
          <div className="relative border-l-2 border-blue-500 dark:border-blue-700 ml-4 md:ml-6 space-y-6 py-2">
            {steps.map((step, idx) => (
              <div key={idx} className="relative pl-6 md:pl-8 group">
                <div className="absolute left-[-11px] top-1 w-5 h-5 rounded-full bg-white dark:bg-slate-900 border-4 border-blue-500 dark:border-blue-600 group-hover:scale-125 transition-transform duration-200" />

                <div className="bg-white dark:bg-slate-955 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs group-hover:border-blue-300 dark:group-hover:border-blue-800 transition-colors">
                  <h3 className="text-xs font-bold text-blue-600 dark:text-blue-450 uppercase tracking-wide flex items-center gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-[10px] text-blue-700 dark:text-blue-300 font-bold shrink-0">
                      {idx + 1}
                    </span>
                    {step.title}
                  </h3>
                  {step.desc && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed font-normal whitespace-pre-wrap">
                      {step.desc}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

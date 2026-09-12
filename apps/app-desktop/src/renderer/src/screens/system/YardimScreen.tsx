import React, { useState } from "react";
import {
  BookOpen,
  Cpu,
  Download,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  HelpCircle,
  Info,
  Layers,
  Layout,
} from "lucide-react";
import { ExcelViewer } from "../../components/ui/ExcelViewer";

const DOCUMENTS = [
  {
    category: "Sistem Kılavuzu & Tanıtım",
    items: [
      {
        id: "uygulamamizi_yakindan_taniyalim",
        title: "Uygulamamızı Yakından Tanıyalım",
        description:
          "Uygulama genel yapısı, şablon mekanizması, sayfa yerleşimleri (A4/yarım sayfa) ve dosya/veri mimarisi hakkında detaylı rehber.",
        file: "system_guide",
      },
      {
        id: "standart_dosya_plani_ve_saklama_rehberi",
        title: "SDP & Arşiv Saklama Rehberi",
        description:
          "Standart Dosya Planı (SDP) kodları, DETSİS numaralandırma yapısı ve arşiv saklama/imha süreleri hakkında resmi rehber.",
        file: "standart_dosya_plani",
      },
    ],
  },
  {
    category: "Resmi Yazışma ve Kullanıcı Kılavuzları",
    items: [
      {
        id: "dogrudan_temin_islem_sureci",
        title: "Doğrudan Temin İşlem Süreci",
        description:
          "Doğrudan temin alım sürecinin adım adım tüm aşamaları (Lüzum Müzekkeresinden ödeme emrine).",
        file: "dta-res://docs/dogrudan_temin_islem_sureci.doc",
      },
      {
        id: "resmi_yazisma_kurallari",
        title: "Resmi Yazışma Kuralları",
        description:
          "Resmi yazışmalarda uyulması gereken kurallar ve standartlar.",
        file: "dta-res://docs/resmi_yazisma_kurallari.pdf",
      },
      {
        id:
          "resmi_yazismalarda_uygulanacak_usul_ve_esaslar_yonetmelik_kilavuzu",
        title: "Resmi Yazışmalar Yönetmelik Kılavuzu",
        description:
          "Resmi Yazışmalarda Uygulanacak Usul ve Esaslar Hakkında Yönetmelik Kılavuzu.",
        file:
          "dta-res://docs/resmi_yazismalarda_uygulanacak_usul_ve_esaslar_yonetmelik_kilavuzu.pdf",
      },
      {
        id: "dogrudan_temin_son_kullanici_kilavuzu",
        title: "Doğrudan Temin Son Kullanıcı Kılavuzu",
        description:
          "Doğrudan Temin süreci ve uygulamanın kullanımı hakkında son kullanıcı kılavuzu.",
        file: "dta-res://docs/dogrudan_temin_son_kullanici_kilavuzu.pdf",
      },
      {
        id: "20200610-8",
        title: "Faydalı Doküman (20200610-8)",
        description: "İlgili resmi mevzuat dokümanı.",
        file: "dta-res://docs/20200610-8.pdf",
      },
      {
        id: "100_soruda_dogrudan_temin",
        title: "100 Soruda Doğrudan Temin Kılavuzu",
        description:
          "Doğrudan temin süreçleri ve yasal usuller hakkında 100 soru-cevaplık detaylı kılavuz.",
        file: "dta-res://docs/100_soruda_dogrudan_temin.pdf",
      },
    ],
  },
  {
    category: "Muhasebat & Maliyet Dokümanları",
    items: [
      {
        id: "guncel_tasinir_kod_listesi",
        title: "Güncel Taşınır Kod Listesi",
        description: "Taşınır hesap planer ve kod listesi (Güncel).",
        file: "dta-res://docs/muhasebat/guncel_tasinir_kod_listesi.xls",
      },
      {
        id: "2018_mahalli_idareler_detayli_hesap_plani",
        title: "Mahalli İdareler Detaylı Hesap Planı (2018)",
        description:
          "Mahalli idareler için detaylı muhasebat hesap planı excel tablosu.",
        file:
          "dta-res://docs/muhasebat/2018_mahalli_idareler_detayli_hesap_plani.xls",
      },
      {
        id: "defter_belge_ve_cetvel_ornekleri",
        title: "Defter, Belge ve Cetvel Örnekleri",
        description:
          "Muhasebat süreçleri için defter, belge ve cetvel örnekleri.",
        file: "dta-res://docs/muhasebat/defter_belge_ve_cetvel_ornekleri.xlsx",
      },
      {
        id: "ek_10_teslim_sureleri_tablosu",
        title: "EK-10 Teslim Süreleri Tablosu",
        description: "Resmi evrak ve faturaların teslim süreleri tablosu.",
        file: "dta-res://docs/muhasebat/ek_10_teslim_sureleri_tablosu.xlsx",
      },
      {
        id: "kurumsal_2019_2021",
        title: "Kurumsal Muhasebat Kılavuzu (2019-2021)",
        description: "Kurumsal kılavuz ve mali istatistikler (2019-2021).",
        file: "dta-res://docs/muhasebat/kurumsal_2019_2021.pdf",
      },
      {
        id: "5816_2",
        title: "Mali Mevzuat Dokümanı (5816_2)",
        description: "Maliye ve Muhasebat ilgili mevzuat PDF dokümanı.",
        file: "dta-res://docs/muhasebat/5816_2.pdf",
      },
      {
        id: "giderlerin_ekonomik_siniflandirilmasi_tablosu",
        title: "Giderlerin Ekonomik Sınıflandırılması Tablosu",
        description:
          "Bütçe giderlerinin ekonomik sınıflandırma (03, 03.2 vb.) detayları tablosu.",
        file:
          "dta-res://docs/muhasebat/giderlerin_ekonomik_siniflandirilmasi_tablosu.pdf",
      },
      {
        id: "butce_giderleri_ve_odenekler_tablosu",
        title: "Bütçe Giderleri ve Ödenekler Tablosu",
        description:
          "Bütçe giderleri, ödenek türleri ve harcama tertipleri tablosu.",
        file:
          "dta-res://docs/muhasebat/butce_giderleri_ve_odenekler_tablosu.pdf",
      },
      {
        id: "ekonomik_ve_fonksiyonel_kodlar_rehberi",
        title: "Ekonomik ve Fonksiyonel Kodlar Rehberi",
        description:
          "Ekonomik, kurumsal ve fonksiyonel kod yapısı, alım türleri ve bütçe ödeneklerinin (Bütçe Hazırlama Rehberi 2026-2028 esaslarına göre) malzeme ve süreçlerle ilişkilendirilmesi kılavuzu.",
        file: "economic_code_guide",
      },
      {
        id: "dogrudan_temin_muhasebe_rehberi",
        title: "Doğrudan Temin Muhasebe ve Ödeme Kılavuzu",
        description:
          "Mali kesintiler (Damga Vergisi, Tevkifat), ödeme emri düzenleme adımları ve kanıtlayıcı belgeler kontrol listesi.",
        file: "dogrudan_temin_muhasebe",
      },
      {
        id:
          "mahalli_idarelerde_gelir_gider_ve_butce_hesaplarinin_karsilastirilmasi",
        title: "Mahalli İdareler Gelir Gider ve Bütçe Karşılaştırması",
        description:
          "Mahalli idarelerde bütçe hesapları ve karşılaştırmalı kılavuz.",
        file:
          "dta-res://docs/muhasebat/mahalli_idarelerde_gelir_gider_ve_butce_hesaplarinin_karsilastirilmasi.pdf",
      },
    ],
  },
];

const DogrudanTeminSurecAkisi = () => {
  const [activeSubTab, setActiveSubTab] = useState<"roller" | "surec">(
    "roller",
  );

  const roles = [
    {
      step: "1",
      title: "İHTİYAÇ / TALEP",
      role: "İhtiyaç Sahibi Birim",
      desc: "Harcama birimi fiili ihtiyacı tespit eder.",
      action:
        "“Şuna ihtiyacım var” diyerek İhtiyaç Listesi / Talep Formu (Lüzum Müzekkeresi) oluşturur ve süreci başlatır.",
      bg:
        "from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/10 border-blue-200 dark:border-blue-900/50",
      text: "text-blue-700 dark:text-blue-400",
      iconBg:
        "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300",
    },
    {
      step: "2",
      title: "HARCAMA YETKİLİSİ",
      role: "Birim Amiri (Müdür, Başkan, Rektör vb.)",
      desc: "Harcamaya karar veren ve bütçeyi kullandıran ana yetkili.",
      action:
        "“Bu alım yapılsın” talimatı verir, Onay Belgesini imzalar. Sürecin en üst sorumlusudur.",
      bg:
        "from-amber-50 to-orange-50 dark:from-amber-955/20 dark:to-orange-955/10 border-amber-200 dark:border-amber-900/50",
      text: "text-amber-700 dark:text-amber-400",
      iconBg:
        "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300",
    },
    {
      step: "3",
      title: "GERÇEKLEŞTİRME GÖREVLİSİ",
      role: "Satın Alma Müdürü, Şef, Görevlendirilen Personel",
      desc:
        "Harcama yetkilisinin talimatıyla alım işlemlerini fiilen yürüten kişi.",
      action:
        "Piyasa fiyat araştırması yapar, teklifleri alır. Muayene ve kabul işlemlerini yapar. Ödeme Emri Belgesini hazırlar ve “Mal/hizmet alındı, fatura doğrudur” diyerek imzalar.",
      bg:
        "from-purple-50 to-fuchsia-50 dark:from-purple-955/20 dark:to-fuchsia-955/10 border-purple-200 dark:border-purple-900/50",
      text: "text-purple-700 dark:text-purple-400",
      iconBg:
        "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300",
    },
    {
      step: "4",
      title: "ÖN MALİ KONTROL",
      role: "Mali Hizmetler Birimi (Müdür / Personel)",
      desc:
        "Harcamanın bütçeye ve genel mevzuata uygunluğunu denetleyen birim.",
      action:
        "Ödeneğin yeterli olup olmadığını kontrol eder. Mevzuata uygunluk durumunda “Uygun Görüş” verir.",
      bg:
        "from-sky-50 to-cyan-50 dark:from-sky-955/20 dark:to-cyan-955/10 border-sky-200 dark:border-sky-900/50",
      text: "text-sky-700 dark:text-sky-400",
      iconBg: "bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300",
    },
    {
      step: "5",
      title: "MUHASEBE YETKİLİSİ",
      role: "Sayman, Muhasebe Müdürü",
      desc:
        "Harcama biriminden tamamen bağımsız, ödemeyi gerçekleştiren merci.",
      action:
        "Gelen hak sahibi belgelerini (fatura, tutanak vb.) son kez kontrol eder. Ödeme Emrini onaylar ve bankadan fiili EFT/havale işlemini yaparak muhasebe kaydını girer.",
      bg:
        "from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/10 border-emerald-200 dark:border-emerald-900/50",
      text: "text-emerald-700 dark:text-emerald-450",
      iconBg:
        "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300",
    },
  ];

  const steps = [
    {
      title: "1- İHTİYAÇ OLUŞTU (TALEP / Lüzum Müzekkeresi)",
      desc:
        "İhtiyaç sahibi birim tarafından alımı talep edilen mal veya hizmet belirlenir ve Lüzum Müzekkeresi ile resmi satın alma süreci tetiklenir.",
    },
    {
      title: "2- DOĞRUDAN TEMİN ONAYI ALINDI",
      desc:
        'Harcama Yetkilisi (Birim Amiri) tarafından "Bu alım yapılsın" talimatı verilir ve resmi Onay Belgesi imzalanır.',
    },
    {
      title: "3- PİYASA FİYAT ARAŞTIRMASI YAPILDI",
      desc:
        "Görevlendirilen gerçekleştirme görevlileri piyasadan teklifleri toplar ve resmi Piyasa Fiyat Araştırma Tutanağına işler.",
    },
    {
      title: "4- YÜKLENİCİ BELİRLENDİ",
      desc:
        'Piyasa fiyat araştırması sonucunda en uygun/ekonomik teklifi sunan firma "Yüklenici" olarak belirlenir ve onaylanır.',
    },
    {
      title: "5- MAL / HİZMET TESLİM EDİLDİ",
      desc:
        "Belirlenen yüklenici firma, talep edilen malı veya hizmeti kuruma/ambara fiilen teslim eder.",
    },
    {
      title: "6- TESLİM TESELLÜM TUTANAĞI",
      desc:
        '✍️ "Kim teslim etti, kim teslim aldı?"\nTeslimatın yapıldığına dair malları teslim eden yüklenici ile teslim alan görevliler arasında imzalanan iki taraflı tutanaktır.',
    },
    {
      title: "7- MUAYENE VE KABUL TUTANAĞI",
      desc:
        '🔎 "Komisyon kontrol etti, uygun buldu."\nMuayene ve kabul komisyonu üyeleri tarafından teslim edilen malların veya hizmetin teknik şartlara, Lüzum Müzekkeresine uygun olup olmadığı kontrol edilerek kabul edilir.',
    },
    {
      title: "8- FATURA DÜZENLENDİ",
      desc:
        "Yüklenici firma, kabul işleminin ardından mal/hizmet bedeli için resmi e-faturayı/arşiv faturasını keser ve kuruma sunar.",
    },
    {
      title: "9- ÖDEME TALEP DİLEKÇESİ",
      desc:
        '🏦 "Bedelin şu IBAN\'a ödenmesini talep ediyorum."\nYüklenici firmanın alacak tutarının belirtilen şirket IBAN numarasına yatırılmasını talep ettiği resmi başvuru dilekçesidir.',
    },
    {
      title: "10- TAŞINIR İŞLEM FİŞİ (TİF)",
      desc:
        '📦 "Mal envantere girdi."\nAlınan malzeme demirbaş veya tüketim malzemesi ise ambar memuru tarafından Taşınır İşlem Fişi (TİF) düzenlenerek resmi envantere/stok kaydına alınır.',
    },
    {
      title: "11- ÖDEME EMRİ (MUHASEBE ÖDEMEYİ YAPTI)",
      desc:
        "💳 Tüm kanıtlayıcı belgeler (fatura, tutanaklar, dilekçe, TİF vb.) eklenerek Ödeme Emri Belgesi hazırlanır ve Muhasebe Yetkilisi bankadan fiili EFT/havale işlemini gerçekleştirir.",
    },
  ];

  return (
    <div className="p-6 overflow-y-auto h-full max-h-full custom-scrollbar bg-slate-50 dark:bg-slate-900/40">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center pb-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
            Doğrudan Temin & Kamu Harcama Süreci
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            5018 Sayılı Kamu Mali Yönetimi Kanunu Rolleri ve Doğrudan Temin
            İşlem Adımları Rehberi
          </p>
        </div>

        <div className="flex justify-center border-b border-slate-200 dark:border-slate-800 pb-px">
          <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl">
            <button
              onClick={() => setActiveSubTab("roller")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeSubTab === "roller"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/50 dark:border-slate-800"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-350"
              }`}
            >
              👥 5018 Harcama Rolleri
            </button>
            <button
              onClick={() => setActiveSubTab("surec")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeSubTab === "surec"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/50 dark:border-slate-800"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-350"
              }`}
            >
              ⚙️ Doğrudan Temin İşlem Adımları
            </button>
          </div>
        </div>

        {activeSubTab === "roller" && (
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
              📌 <strong>5018 Sayılı Kanun Uyarınca Temel Kural:</strong>{" "}
              Harcama Yetkilisi (Onaylayan) ile Muhasebe Yetkilisi (Ödeyen)
              unvanları{" "}
              <strong>asla aynı kişide birleşemez</strong>. Muhasebe birimi
              tamamen bağımsız kontrol mercii olarak çalışır.
            </div>
          </div>
        )}

        {activeSubTab === "surec" && (
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
  );
};

const UygulamaRehberi = () => {
  return (
    <div className="p-6 overflow-y-auto h-full max-h-full custom-scrollbar bg-slate-50 dark:bg-slate-900/40">
      <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="text-center pb-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center justify-center gap-2">
            <Cpu className="w-5 h-5 text-blue-600" />
            Uygulamamızı Yakından Tanıyalım (Sistem Kılavuzu)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Uygulamanın genel kullanım akışı, sayfa yazdırma mantığı ve şablon
            özelleştirme rehberi
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Genel Kullanım Akışı */}
          <div className="bg-white dark:bg-slate-955 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-sm transition-shadow">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-500" />
              1. Genel Kullanım Akışı ve Hızlı Çıktı
            </h3>
            <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed mb-3">
              Uygulamanın temel amacı satın alma dosyalarınızı tek merkezden
              hızlıca hazırlamaktır. En verimli süreç akışı şu şekildedir:
            </p>
            <ul className="text-xs text-slate-600 dark:text-slate-400 list-disc list-inside space-y-1.5 font-normal">
              <li>
                <strong>Kurum Bilgileri:</strong>{" "}
                İlk olarak kurum bilgilerinizi doldurun. Bu veriler tüm
                belgelerde otomatik olarak kullanılır.
              </li>
              <li>
                <strong>Doğrudan Temin Dosyaları:</strong>{" "}
                Süreç dosyalarınızı oluşturup malzeme, komisyon, yaklaşık
                maliyet gibi detayları girin.
              </li>
              <li>
                <strong>Otomatik Çıktı:</strong>{" "}
                Dosyanızı doldurduğunuzda, tüm süreç evraklarını{" "}
                <strong>Çıktı Merkezi</strong>{" "}
                üzerinden tek tuşla otomatik, hızlı ve resmi formatta
                yazdırabilirsiniz.
              </li>
            </ul>
          </div>

          {/* Card 2: Şablon Yönetimi (Geliştirici Rehberi) */}
          <div className="bg-white dark:bg-slate-955 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-sm transition-shadow">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-500" />
              2. Şablon Yönetimi (Geliştirici Rehberi)
            </h3>
            <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed mb-3">
              Yazdırılabilir resmi belgeler dinamik HTML şablonları üzerinden
              üretilir. Geliştirici veya teknik kullanıcı iseniz:
            </p>
            <ul className="text-xs text-slate-600 dark:text-slate-400 list-disc list-inside space-y-1.5 font-normal">
              <li>
                <strong>Şablon Düzenleme:</strong> Uygulama menüsündeki{" "}
                <strong>Şablonlar</strong>{" "}
                ekranından kod bazında HTML ve JSON yapılarını doğrudan
                özelleştirebilir ve düzenleyebilirsiniz.
              </li>
              <li>
                <strong>Mustache Motoru:</strong> HTML şablonlarında{" "}
                <code>{"{{deger}}"}</code>{" "}
                Mustache yapısı kullanılır, dinamik veriler buraya yerleşir.
              </li>
              <li>
                <strong>Şablon Konumu:</strong> Proje dizinindeki{" "}
                <code>resources/templates/</code>{" "}
                klasöründe yer alan kaynak kodlara müdahale edebilirsiniz.
              </li>
            </ul>
          </div>

          {/* Card 3: Çift Nüsha (Half-Page) Hassasiyeti */}
          <div className="bg-white dark:bg-slate-955 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-sm transition-shadow">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
              <Layout className="w-4 h-4 text-violet-500" />
              3. Çift Nüsha (A4/2) & Dinamik Sayfa Mantığı
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
              Teslim Tesellüm gibi belgelerde kağıt tasarrufu için A4 sayfasının
              üst ve alt yarısında iki kopya (`half-page`) yer alır:
            </p>
            <ul className="text-xs text-slate-600 dark:text-slate-400 list-disc list-inside space-y-1.5 font-normal">
              <li>
                <strong>Yarım Sayfa Modu:</strong>{" "}
                Kalem sayısı azsa (≤ 5) iki nüsha tek bir A4 kağıdına
                sığdırılır, araya kesikli çizgi konulur.
              </li>
              <li>
                <strong>Dinamik Tam Sayfa (Full-Page):</strong>{" "}
                Eğer malzeme satırı sayısı 5&apos;ten fazla ise şablondaki DOM
                scripti otomatik olarak <code>full-page-mode</code>{" "}
                sınıfını ekler.
              </li>
              <li>
                Bu modda iki nüsha da dikey A4 boyutuna genişletilir ve sayfa
                sonu (`break-after: page`) verilerek ardışık iki tam A4 sayfası
                olarak yazdırılır.
              </li>
            </ul>
          </div>

          {/* Card 4: Veri Entegrasyonu ve Nesne Yapısı */}
          <div className="bg-white dark:bg-slate-955 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-sm transition-shadow">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-500" />
              4. Kararlı Veri & Dotted Fallback Kuralı
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
              Kullanıcının bazı alanları (örneğin dosya numarası) boş bırakması
              ihtimaline karşı resmi evraklarda şu kurallar uygulanır:
            </p>
            <ul className="text-xs text-slate-600 dark:text-slate-400 list-disc list-inside space-y-1.5 font-normal">
              <li>
                <strong>Obje Ayrıştırma:</strong> <code>dosyaNumarasi</code>
                {" "}
                bir bütün string yerine{" "}
                <code>{'{ yili: "2026", sayisi: "123" }'}</code>{" "}
                şeklinde bir nesne olarak saklanır.
              </li>
              <li>
                <strong>Mustache Fallback:</strong>{" "}
                Sayı değeri girilmediğinde şablonun bozulmaması için{" "}
                <code>
                  {"{{yili}}/{{#sayisi}}{{sayisi}}{{/sayisi}}{{^sayisi}}....{{/sayisi}}"}
                </code>{" "}
                yapısı kullanılır.
              </li>
              <li>
                <strong>Çıktı Güvenliği:</strong> Böylece eksik verilerde çıktı
                {" "}
                <code>2026/....</code> veya tamamen boş ise{" "}
                <code>..../....</code>{" "}
                şeklinde gösterilerek resmi evrak formatı korunur.
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl p-4 text-xs text-blue-800 dark:text-blue-300 leading-relaxed flex gap-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div>
            <strong>Geliştirici & Model Notu:</strong>{" "}
            Şablonları güncellerken veya yeni alanlar eklerken bu yerleşim
            kurallarına ve boş veri yedekleme (fallback) yapılarına sadık
            kalmaya özen gösterin.
          </div>
        </div>
      </div>
    </div>
  );
};

const EkonomikVeFonksiyonelKodlarRehberi = () => {
  return (
    <div className="p-6 overflow-y-auto h-full max-h-full custom-scrollbar bg-slate-50 dark:bg-slate-900/40">
      <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="text-center pb-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center justify-center gap-2">
            <Layers className="w-5 h-5 text-indigo-650" />
            Ekonomik ve Fonksiyonel Kodlar Rehberi (2026 - 2028)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Analitik bütçe sınıflandırması, ekonomik kodlar (03.02, 03.05 vb.)
            ve malzemeler/süreçler ile ilişkilendirilmesi
          </p>
        </div>

        <div className="bg-white dark:bg-slate-955 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-250 border-b border-slate-100 dark:border-slate-800 pb-2">
            1. Bütçe Sınıflandırma Yapısı (Yeni Program Bütçe Düzeni)
          </h3>
          <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed">
            50 program bütçe sistemine geçişle birlikte, harcamalar{" "}
            <strong>Program - Alt Program - Faaliyet</strong>{" "}
            düzeyinde izlenmektedir. Bütçe tertibi şu 4 ana bileşenden oluşur:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold block">
                PROGRAM
              </span>
              <span className="text-sm font-extrabold text-blue-600 font-mono">
                29
              </span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold block">
                KURUMSAL
              </span>
              <span className="text-sm font-extrabold text-indigo-600 font-mono">
                10.26
              </span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold block">
                FİNANSMAN
              </span>
              <span className="text-sm font-extrabold text-emerald-600 font-mono">
                01
              </span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold block">
                EKONOMİK
              </span>
              <span className="text-sm font-extrabold text-amber-650 font-mono">
                03.02
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-955 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              03.02 - Tüketime Yönelik Mal ve Malzeme Alımları
            </h3>
            <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed mb-3">
              Kırtasiye, büro malzemeleri, yakacak, elektrik, su, temizlik
              malzemeleri, giyecek, gıda ve ilaç alımlarını kapsar. Malzeme
              kartı oluştururken ve alım sürecine dahil ederken en sık
              kullanılan kodlerdir:
            </p>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 font-mono">
              <li>
                •{" "}
                <strong className="text-slate-700 dark:text-slate-300">
                  03.02.10.01
                </strong>: Kırtasiye Alımları
              </li>
              <li>
                •{" "}
                <strong className="text-slate-700 dark:text-slate-300">
                  03.02.10.02
                </strong>: Büro Malzemesi Alımları
              </li>
              <li>
                •{" "}
                <strong className="text-slate-700 dark:text-slate-300">
                  03.02.20.02
                </strong>: Temizlik Malzemesi Alımları
              </li>
              <li>
                •{" "}
                <strong className="text-slate-700 dark:text-slate-300">
                  03.02.30.03
                </strong>: Elektrik Alımları
              </li>
              <li>
                •{" "}
                <strong className="text-slate-700 dark:text-slate-300">
                  03.02.40.01
                </strong>: Yiyecek Alımları
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-slate-955 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              03.05 - Hizmet Alımları & Kiralar
            </h3>
            <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed mb-3">
              Müteahhitlik, temizlik hizmetleri alımı, haberleşme giderleri,
              kiralama işlemleri, taşıma, bakım onarım gibi hizmet niteliğindeki
              doğrudan temin süreçlerinde kullanılır:
            </p>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 font-mono">
              <li>
                •{" "}
                <strong className="text-slate-700 dark:text-slate-300">
                  03.05.10.03
                </strong>: Bilgisayar Hizmet Alım Giderleri
              </li>
              <li>
                •{" "}
                <strong className="text-slate-700 dark:text-slate-300">
                  03.05.10.07
                </strong>: İş Sağlığı ve Güvenliği Hizmet Alımları
              </li>
              <li>
                •{" "}
                <strong className="text-slate-700 dark:text-slate-300">
                  03.05.20.02
                </strong>: Telefon Abonelik ve Kullanım
              </li>
              <li>
                •{" "}
                <strong className="text-slate-700 dark:text-slate-300">
                  03.05.50.05
                </strong>: Hizmet Binası Kiralama
              </li>
              <li>
                •{" "}
                <strong className="text-slate-700 dark:text-slate-300">
                  03.05.10.51
                </strong>: Personel Çalıştırılmasına Dayalı Temizlik Hizmeti
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-955 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-500" />
            2. Malzemelere Ekonomik Kod Bağlama
          </h3>
          <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed">
            Sistemde tanımladığınız her bir malzeme/hizmet kalemine bu ekonomik
            kodları atayabilirsiniz. Böylece yaklaşık maliyet hesap cetvelinde
            ve lüzum belgelerinde her kalemin bütçedeki yeri (örneğin 03.2.1.01
            kırtasiye) otomatik gruplanır ve bütçe sorgu aşamasında ödenek
            kontrolü tam doğrulukla yapılır.
          </p>
        </div>
      </div>
    </div>
  );
};

const DogrudanTeminMuhasebeRehberi = () => {
  return (
    <div className="p-6 overflow-y-auto h-full max-h-full custom-scrollbar bg-slate-50 dark:bg-slate-900/40">
      <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="text-center pb-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center justify-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            Doğrudan Temin Muhasebe ve Ödeme Süreci Kılavuzu
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Maliye mevzuatı, harcama evrakları, vergi kesintileri (Damga
            Vergisi, KDV Tevkifatı) ve ödeme emri onay kriterleri
          </p>
        </div>

        {/* 1. KANITLAYICI BELGELER */}
        <div className="bg-white dark:bg-slate-955 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-250 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            1. Ödeme Dosyasında Bulunması Gereken Kanıtlayıcı Belgeler
          </h3>
          <p className="text-xs text-slate-655 dark:text-slate-400 leading-relaxed">
            Mahalli İdareler Harcama Belgeleri Yönetmeliği Madde 22 kapsamında,
            doğrudan temin yöntemiyle yapılan alımların ödemelerinde aşağıdaki
            belgelerin ödeme emri belgesine eklenmesi zorunludur:
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
                <li>Teklif Mektupları & Varsa Sözleşme</li>
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
            Muhasebe yetkilisi tarafından hak sahibine ödeme yapılmadan önce
            kanun gereği hesaplanıp bütçeye gelir kaydedilmesi gereken
            kesintiler:
          </p>
          <div className="space-y-3">
            {/* Damga Vergisi */}
            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-750 dark:text-slate-250 mb-1">
                A. Damga Vergisi Kesintileri
              </h4>
              <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-400 space-y-1">
                <li>
                  <strong>Ödeme Damga Vergisi:</strong>{" "}
                  Hak sahibine fatura tutarı (KDV hariç matrah) üzerinden{" "}
                  <strong>Binde 9,48</strong> oranında uygulanır.
                </li>
                <li>
                  <strong>Karar Damga Vergisi:</strong>{" "}
                  İdare ile yüklenici arasında yazılı bir sözleşme imzalanması
                  durumunda, sözleşme bedeli üzerinden{" "}
                  <strong>Binde 5,69</strong>{" "}
                  oranında Damga Vergisi kesilerek ilgili vergi dairesine
                  yatırılır.
                </li>
              </ul>
            </div>

            {/* KDV Tevkifatı */}
            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-750 dark:text-slate-250 mb-1">
                B. KDV Tevkifatı (Kısmi Vergi Sorumluluğu)
              </h4>
              <p className="text-[11px] text-slate-550 dark:text-slate-450 mb-2">
                Kamu kurumlarına sunulan belirli hizmetlerde fatura
                KDV&apos;sinin bir kısmı doğrudan vergi dairesine beyan edilmek
                üzere kesilir:
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="font-semibold block text-slate-700 dark:text-slate-350">
                    Temizlik Hizmetleri
                  </span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold">
                    9/10 Tevkifat
                  </span>
                </div>
                <div className="p-2 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="font-semibold block text-slate-700 dark:text-slate-350">
                    Güvenlik Hizmetleri
                  </span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold">
                    9/10 Tevkifat
                  </span>
                </div>
                <div className="p-2 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="font-semibold block text-slate-700 dark:text-slate-350">
                    Yemek & Organizasyon
                  </span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold">
                    5/10 Tevkifat
                  </span>
                </div>
                <div className="p-2 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="font-semibold block text-slate-700 dark:text-slate-350">
                    Yapım ve Onarım İşleri
                  </span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold">
                    4/10 Tevkifat
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. ÖDENEK VE YAKLAŞIK MALİYET */}
        <div className="bg-white dark:bg-slate-955 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-255 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            3. Ödenek Kontrolü ve Yaklaşık Maliyet Esasları
          </h3>
          <ul className="text-xs text-slate-600 dark:text-slate-400 list-disc list-inside space-y-2 font-normal">
            <li>
              <strong>Ödenek Zorunluluğu:</strong>{" "}
              Ödeneği bulunmayan hiçbir iş için ihaleye/alıma çıkılamaz (4734
              Sayılı Kanun Md. 5). Kamu idareleri, bütçelerinde yer alan
              ödeneklerin üzerinde harcama yapamaz (5018 Sayılı Kanun Md. 20/d).
            </li>
            <li>
              <strong>Yaklaşık Maliyet Tespiti:</strong>{" "}
              22/d kapsamındaki yapım işlerinde yaklaşık maliyet çalışması
              yapılması zorunludur (Genel Tebliğ 22.5.1). Ayrıca, alım limiti
              parasal sınıra yakınsa, limit aşımı olup olmadığının tespiti için
              yaklaşık maliyetin belirlenmesi şarttır.
            </li>
            <li>
              <strong>Fiyat Tespit Kaynakları:</strong>{" "}
              Yaklaşık maliyet hesaplanırken; piyasadan proforma faturalar,
              idarenin önceki benzer alım fiyatları, kamu kurumlarının
              yayınladığı rayiçler veya ilgili meslek odası fiyatları esas
              alınabilir.
            </li>
          </ul>
        </div>

        {/* 4. ŞARTNAME, SÖZLEŞME VE EKAP BİLDİRİMİ */}
        <div className="bg-white dark:bg-slate-955 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-255 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            4. Şartname, Yazılı Sözleşme ve EKAP Bildirim Kuralları
          </h3>
          <ul className="text-xs text-slate-600 dark:text-slate-400 list-disc list-inside space-y-2 font-normal">
            <li>
              <strong>Şartname ve Sözleşme:</strong>{" "}
              Doğrudan teminde şartname ve sözleşme düzenlenmesi idarenin
              takdirindedir. Ancak **süreli alımlarda** (işin
              gerçekleştirilmesinin belli bir süreye bağlı olduğu hizmet veya
              mal alımlarında) yazılı sözleşme düzenlenmesi gerekmektedir.
            </li>
            <li>
              <strong>EKAP Yasaklılık Teyidi:</strong>{" "}
              22/d kapsamındaki alımlarda, alım yapılacak gerçek veya tüzel
              kişinin EKAP üzerinden yasaklılar listesinde olup olmadığı
              sorgulanmalı ve **yasaklı olduğu tespit edilen kişilerden
              kesinlikle alım yapılmamalıdır** (KİK Genel Tebliği Md. 30.5.4).
            </li>
            <li>
              <strong>EKAP Bildirim Süresi:</strong>{" "}
              Doğrudan temin yoluyla gerçekleştirilen alımlara ilişkin
              &quot;Doğrudan Temin Kayıt Formu&quot;, alım tarihini takip eden
              **ayın 10 uncu gününe kadar** EKAP üzerinden Kuruma
              bildirilmelidir.
            </li>
          </ul>
        </div>

        {/* 5. MUAYENE, KABUL VE TİF İSTİSNALARI */}
        <div className="bg-white dark:bg-slate-955 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-255 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />
            5. Muayene Kabul İşlemleri ve TİF Düzenlenmeyen Durumlar
          </h3>
          <ul className="text-xs text-slate-600 dark:text-slate-400 list-disc list-inside space-y-2 font-normal">
            <li>
              <strong>Muayene ve Kabul Komisyonu:</strong>{" "}
              Alımı yapılan mal veya iş, idarece kurulacak **en az 3 kişilik**
              muayene ve kabul komisyonu tarafından incelenir. İş yüklenici
              tarafından teslim edilmedikçe muayene kabul işlemleri yapılamaz.
            </li>
            <li>
              <strong>Taşınır İşlem Fişi (TİF) İstisnaları:</strong>{" "}
              Aşağıdaki alımlarda Taşınır İşlem Fişi (TİF) düzenlenmesi zorunlu
              değildir:
              <ul className="list-disc list-inside pl-4 mt-1 space-y-1 text-slate-500">
                <li>
                  Satın alındığı andan itibaren tüketilen su, doğalgaz, kum,
                  çakıl, bahçe toprağı, gübre alımları.
                </li>
                <li>
                  Kısa sürede tüketilen mutfak tüpleri, yangın söndürme tüpü
                  dolumları ve yazıcı kartuşu dolumları.
                </li>
                <li>
                  Servislerde yapılan bakım-onarımlarda kullanılan yedek
                  parçalar ile doğrudan depolarına konulan akaryakıt, yağ
                  alımları.
                </li>
                <li>
                  Dergi, gazete gibi süreli yayın alımları ile arşivlenme
                  niteliği olmayan kütüphane materyalleri.
                </li>
              </ul>
            </li>
          </ul>
        </div>

        {/* 6. YASAL SORUMLULUK */}
        <div className="bg-white dark:bg-slate-955 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-255 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            6. Yasal Sorumluluk ve Sayıştay Kararları
          </h3>
          <p className="text-xs text-slate-655 dark:text-slate-400 leading-relaxed">
            Sürecin her aşamasında görev alan ilgililer görevlerini kanuni
            gereklere uygun ve tarafsızlıkla yapmalıdır:
          </p>
          <ul className="text-xs text-slate-600 dark:text-slate-400 list-disc list-inside space-y-2 font-normal">
            <li>
              <strong>Cezai Sorumluluk:</strong>{" "}
              Görevini kötüye kullanan veya ihmal edenlere disiplin cezası
              uygulanır ve oluşan kamu zararları rücu edilir.
            </li>
            <li>
              <strong>Sayıştay İçtihatları:</strong>{" "}
              Sayıştay kararları uyarınca, doğrudan temin alımlarında da temel
              ilkeler gözetilerek **sağlıklı bir piyasa fiyat araştırması
              yapılması** zorunludur.
            </li>
          </ul>
        </div>

        {/* 7. ÖDEME ONAY KRİTERLERİ */}
        <div className="bg-white dark:bg-slate-955 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-250 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-teal-500" />
            7. Muhasebe Yetkilisi İmza ve Kontrol Kriterleri
          </h3>
          <p className="text-xs text-slate-655 dark:text-slate-400 leading-relaxed">
            Harcama belgeleri muhasebe birimine teslim edildiğinde, Muhasebe
            Yetkilisi ödemeyi yapmadan önce 5018 Sayılı Kanun uyarınca şu
            hususları kontrol etmekle yükümlüdür:
          </p>
          <ul className="text-xs text-slate-600 dark:text-slate-400 list-disc list-inside space-y-2 font-normal">
            <li>
              <strong>Görevler Ayrılığı İlkesi:</strong>{" "}
              Harcama belgesini düzenleyen Gerçekleştirme Görevlisi (Örn. Piyasa
              Fiyat Komisyon Üyesi) ile Muhasebe Yetkilisi{" "}
              <strong>kesinlikle aynı kişi olamaz</strong>.
            </li>
            <li>
              <strong>Maddi Hata Kontrolü:</strong>{" "}
              Faturadaki birim fiyat, miktar ve KDV hesaplamaları ile Muayene
              Kabul Tutanağındaki ve Yaklaşık Maliyet Cetvelindeki rakamların
              matematiksel olarak birbirini doğrulaması gerekir.
            </li>
            <li>
              <strong>Borç Sorgulaması (Kamu Alacakları):</strong>{" "}
              6183 Sayılı Kanun gereğince, ödeme tutarı vadesi geçmiş borç
              limitlerinin üzerindeyse (Örn: Vergi borcunda 5.000 TL, SGK
              borcunda asgari ücretin 1 katı üzeri), ödeme yapılmadan önce
              Yüklenicinin vergi dairesinden ve SGK sisteminden &quot;Borcu
              Yoktur&quot; belgesi veya kesinti talimatı sorgulanır. Borç varsa
              muhasebe birimi ödemeden kesinti yaparak ilgili kuruma aktarır.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const SDP_CODE_BLOCK = `{
  dosyaNo: "934.01",
  saklamaSüresi: 10,
  tasfiyeKodu: "C",
  
  // İmha Süreci
  imhaListesiTarih: "2036-01-15",
  devletArşivOnayi: "2036-02-20",     // Devlet onayı
  müdürOnayi: "2036-02-21",            // En üst amir onayı
  imhaTutanağıTarih: "2036-03-01",
  durum: "İMHA EDİLDİ",
  
  // Kanıt
  imhaTutanağıPDF: "..."               // Devlet Arşivleri'ne gönderilen
}`;

const StandartDosyaPlaniRehberi = () => {
  return (
    <div className="p-6 overflow-y-auto h-full max-h-full custom-scrollbar bg-slate-50 dark:bg-slate-900/40 animate-in fade-in duration-300">
      <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="text-center pb-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-855 dark:text-slate-100 flex items-center justify-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Standart Dosya Planı (SDP) &amp; Arşiv Kılavuzu
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Resmi evrak numaralandırma şeması (E-DETSİS-SDP-SIRA), dosya kodları
            ve arşiv saklama/imha süreçleri
          </p>
        </div>

        {/* 1. YENİ EVRAK VE DOSYA NUMARALANDIRMA YAPISI */}
        <div className="bg-white dark:bg-slate-955 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-250 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            1. Evrak Numaralandırma Yapısı (Yeni Mevzuat)
          </h3>
          <p className="text-xs text-slate-655 dark:text-slate-400 leading-relaxed">
            Resmi belgelerin hazırlanma sürecini gösteren harf kodu ile
            başlayan, DETSİS kurumsal kodu, Standart Dosya Planı (SDP) kodu ve
            kesintisiz artan genel sıra numarasını barındıran resmi evrak
            şemasıdır:
          </p>

          <div className="bg-slate-900 dark:bg-slate-950 p-4 rounded-xl text-white font-mono text-xs overflow-x-auto space-y-3 shadow-inner">
            <div className="text-blue-400 font-extrabold text-sm">
              ŞEMA: E-DETSİS-SDP-SIRA
            </div>
            <div className="text-slate-300">
              Örnek:{" "}
              <span className="text-emerald-400 font-extrabold">
                E-10234521-934.01-0001
              </span>
            </div>
            <div className="border-t border-slate-800 pt-2 space-y-1 text-slate-400 text-[11px]">
              <div>
                • <strong className="text-slate-250">E:</strong>{" "}
                Belgenin hazırlanma sürecini (Evrak) ifade eder. (Olağanüstü
                haller için{" "}
                <span className="text-amber-500">O</span>, zorunlu haller için
                {" "}
                <span className="text-red-500">Z</span> harfleri kullanılır)
              </div>
              <div>
                • <strong className="text-slate-250">10234521:</strong>{" "}
                Birim/Kurum DETSİS Kodu
              </div>
              <div>
                • <strong className="text-slate-250">934.01:</strong>{" "}
                Standart Dosya Planı (SDP) Kodu (Örn: Mal Alımı)
              </div>
              <div>
                • <strong className="text-slate-250">0001:</strong>{" "}
                Genel Sıra Numarası (Yılbaşında sıfırlanmaz, kesintisiz devam
                eder)
              </div>
            </div>
          </div>
        </div>

        {/* 2. DOĞRUDAN TEMİN SDP KODLARI */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-955 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              Satınalma ve Alım İşleri (930 - 934)
            </h3>
            <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed mb-3">
              Doğrudan Temin işlemleri girildiğinde alım türlerine göre sistem
              otomatik olarak aşağıdaki Standart Dosya Planı (SDP) kodlarını
              bağlar:
            </p>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg flex justify-between items-center border border-slate-200/50 dark:border-slate-800">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Mal Alım İşi (alımTürü: Mal)
                </span>
                <span className="font-mono bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded font-extrabold">
                  934.01
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg flex justify-between items-center border border-slate-200/50 dark:border-slate-800">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Hizmet Alım İşi (alımTürü: Hizmet)
                </span>
                <span className="font-mono bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded font-extrabold">
                  934.02
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg flex justify-between items-center border border-slate-200/50 dark:border-slate-800">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Yapım İşi (alımTürü: Yapım)
                </span>
                <span className="font-mono bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded font-extrabold">
                  934.03
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg flex justify-between items-center border border-slate-200/50 dark:border-slate-800">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Diğer Alımlar (Diğer)
                </span>
                <span className="font-mono bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded font-extrabold">
                  934.99
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-955 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                Ödeme Emri Belgesi (ÖEB) Şeması
              </h3>
              <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed mb-3">
                Ödeme Emri Belgesi (ÖEB) numaraları, bütçe yılı veya dosya
                tipinden bağımsız olarak DETSİS kodu ve kesintisiz artan sıra
                numarasıyla oluşturulur:
              </p>
              <div className="bg-slate-900 dark:bg-slate-950 p-4 rounded-xl text-white font-mono text-xs space-y-1 shadow-inner">
                <div className="text-teal-400 font-extrabold">
                  ŞEMA: E-DETSİS-SIRA
                </div>
                <div className="text-slate-300">
                  Örnek:{" "}
                  <span className="text-emerald-400 font-extrabold">
                    E-10234521-000087
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800/80 mt-1">
                  Ödeme Emri Sıra No 6 haneli (000087) olarak doldurulur.
                </div>
              </div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-955/20 border border-amber-200 dark:border-amber-900/50 rounded-xl p-3 text-[11px] text-amber-800 dark:text-amber-400 leading-normal mt-3">
              ⚠️ <strong>Sıfırlanmama Kuralı:</strong>{" "}
              Yeni yıl başlangıcında (ör. 2026&apos;dan 2027&apos;ye geçişte)
              evrak sıra numaraları ve ÖEB sayıları sıfırlanmaz; kaldığı
              numaradan artarak devam eder.
            </div>
          </div>
        </div>

        {/* 3. ARŞİV SAKLAMA VE İMHA KRİTERLERİ */}
        <div className="bg-white dark:bg-slate-955 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-250 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            3. Arşiv Saklama Süreleri ve Tasfiye/İmha Yapısı
          </h3>
          <p className="text-xs text-slate-655 dark:text-slate-400 leading-relaxed">
            Mevzuat gereği doğrudan temin (934.01) dosyalarının{" "}
            <strong>10 Yıl</strong>{" "}
            saklanması ve saklama süresi sonunda tasfiye koduna (C) göre işlem
            yapılması gerekir. Bir dosyanın arşiv yönetim süreci veri modeli
            şöyledir:
          </p>

          <div className="bg-slate-900 dark:bg-slate-950 p-4 rounded-xl text-slate-300 font-mono text-xs overflow-x-auto shadow-inner">
            <pre className="whitespace-pre">{SDP_CODE_BLOCK}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
export default function YardimScreen(): React.JSX.Element {
  const [activeDoc, setActiveDoc] = useState(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const docId = searchParams.get("doc");
    if (docId) {
      for (const group of DOCUMENTS) {
        const found = group.items.find((item) => item.id === docId);
        if (found) return found;
      }
    }
    return DOCUMENTS[0].items[0];
  });

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 animate-in fade-in duration-500">
      <div className="flex-none p-6 pb-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3 text-slate-850 dark:text-slate-100">
          <HelpCircle className="w-7 h-7 text-blue-600" />
          Yardım ve Faydalı Dokümanlar
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
          Sistemi kullanırken faydalanabileceğiniz resmi mevzuat, kullanım
          kılavuzları ve muhasebat tablolarına buradan ulaşabilirsiniz.
        </p>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Document List */}
        <div className="w-[340px] flex-none border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-y-auto p-4 space-y-6 custom-scrollbar">
          {DOCUMENTS.map((group) => (
            <div key={group.category} className="space-y-2">
              <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 mb-3">
                {group.category}
              </h2>
              {group.items.map((doc) => {
                const isExcel = doc.file.endsWith(".xls") ||
                  doc.file.endsWith(".xlsx");
                return (
                  <button
                    key={doc.id}
                    onClick={() => setActiveDoc(doc)}
                    className={`w-full text-left p-3 rounded-xl border transition-all duration-200 ${
                      activeDoc.id === doc.id
                        ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800/50 shadow-sm"
                        : "bg-white border-transparent hover:bg-slate-50 hover:border-slate-200 dark:bg-slate-950 dark:hover:bg-slate-900 dark:hover:border-slate-800"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {isExcel
                        ? (
                          <FileSpreadsheet
                            className={`w-5 h-5 shrink-0 mt-0.5 ${
                              activeDoc.id === doc.id
                                ? "text-green-600 dark:text-green-500"
                                : "text-slate-400"
                            }`}
                          />
                        )
                        : (
                          <FileText
                            className={`w-5 h-5 shrink-0 mt-0.5 ${
                              activeDoc.id === doc.id
                                ? "text-blue-600"
                                : "text-slate-400"
                            }`}
                          />
                        )}
                      <div>
                        <h3
                          className={`text-sm font-semibold mb-1 leading-tight ${
                            activeDoc.id === doc.id
                              ? "text-blue-700 dark:text-blue-400"
                              : "text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {doc.title}
                        </h3>
                        <p className="text-[10px] text-slate-500 line-clamp-2 leading-normal">
                          {doc.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Right Content - PDF / Excel Viewer Placeholder */}
        <div className="flex-1 flex flex-col bg-slate-100 dark:bg-slate-900 overflow-hidden relative">
          <div className="flex-none p-3 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center shadow-sm z-10">
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
              {activeDoc.id === "uygulamamizi_yakindan_taniyalim"
                ? <Cpu className="w-4 h-4 text-blue-500" />
                : activeDoc.file.endsWith(".xls") ||
                    activeDoc.file.endsWith(".xlsx")
                ? <FileSpreadsheet className="w-4 h-4 text-green-500" />
                : <FileText className="w-4 h-4 text-blue-500" />}
              {activeDoc.title}
            </h2>
            <div className="flex items-center gap-2">
              {activeDoc.id !== "uygulamamizi_yakindan_taniyalim" && (
                <>
                  <a
                    href={activeDoc.file}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    title="Yeni Sekmede Aç / Dışarıda Görüntüle"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Dışarıda Aç
                  </a>
                  <a
                    href={activeDoc.file}
                    download
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 rounded-lg transition-colors shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    İndir
                  </a>
                </>
              )}
            </div>
          </div>

          <div className="flex-1 w-full h-full relative z-0 overflow-hidden bg-white dark:bg-slate-955">
            {activeDoc.id === "uygulamamizi_yakindan_taniyalim"
              ? <UygulamaRehberi />
              : activeDoc.id === "standart_dosya_plani_ve_saklama_rehberi"
              ? <StandartDosyaPlaniRehberi />
              : activeDoc.id === "ekonomik_ve_fonksiyonel_kodlar_rehberi"
              ? <EkonomikVeFonksiyonelKodlarRehberi />
              : activeDoc.id === "dogrudan_temin_islem_sureci"
              ? <DogrudanTeminSurecAkisi />
              : activeDoc.id === "dogrudan_temin_muhasebe_rehberi"
              ? <DogrudanTeminMuhasebeRehberi />
              : activeDoc.file.endsWith(".pdf")
              ? (
                <div className="p-4 w-full h-full">
                  <iframe
                    src={`${activeDoc.file}#view=FitH`}
                    className="w-full h-full rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white"
                    title={activeDoc.title}
                  />
                </div>
              )
              : activeDoc.file.endsWith(".xls") ||
                  activeDoc.file.endsWith(".xlsx")
              ? <ExcelViewer fileUrl={activeDoc.file} />
              : (
                <div className="w-full h-full flex items-center justify-center p-8">
                  <div className="flex flex-col items-center text-center max-w-sm">
                    <div className="w-20 h-20 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center mb-6 shadow-sm border border-slate-200 dark:border-slate-800 text-slate-400">
                      <FileText className="w-10 h-10" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
                      {activeDoc.title}
                    </h3>
                    <p className="text-sm text-slate-500 mb-8">
                      Önizleme desteklenmiyor.
                    </p>
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}

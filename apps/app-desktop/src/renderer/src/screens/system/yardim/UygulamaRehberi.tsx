import React from 'react'
import { BookOpen, Cpu, Info, Layers, Layout } from 'lucide-react'

export function UygulamaRehberi(): React.JSX.Element {
  return (
    <div className="p-6 overflow-y-auto h-full max-h-full custom-scrollbar bg-slate-50 dark:bg-slate-900/40">
      <div className="w-full space-y-6">
        <div className="text-center pb-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center justify-center gap-2">
            <Cpu className="w-5 h-5 text-blue-600" />
            Uygulamamızı Yakından Tanıyalım (Sistem Kılavuzu)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Uygulamanın genel kullanım akışı, sayfa yazdırma mantığı ve şablon özelleştirme rehberi
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
              Uygulamanın temel amacı satın alma dosyalarınızı tek merkezden hızlıca hazırlamaktır.
              En verimli süreç akışı şu şekildedir:
            </p>
            <ul className="text-xs text-slate-600 dark:text-slate-400 list-disc list-inside space-y-1.5 font-normal">
              <li>
                <strong>Kurum Bilgileri:</strong> İlk olarak kurum bilgilerinizi doldurun. Bu
                veriler tüm belgelerde otomatik olarak kullanılır.
              </li>
              <li>
                <strong>Doğrudan Temin Dosyaları:</strong> Süreç dosyalarınızı oluşturup malzeme,
                komisyon, yaklaşık maliyet gibi detayları girin.
              </li>
              <li>
                <strong>Otomatik Çıktı:</strong> Dosyanızı doldurduğunuzda, tüm süreç evraklarını{' '}
                <strong>Çıktı Merkezi</strong> üzerinden tek tuşla otomatik, hızlı ve resmi formatta
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
              Yazdırılabilir resmi belgeler dinamik HTML şablonları üzerinden üretilir. Geliştirici
              veya teknik kullanıcı iseniz:
            </p>
            <ul className="text-xs text-slate-600 dark:text-slate-400 list-disc list-inside space-y-1.5 font-normal">
              <li>
                <strong>Şablon Düzenleme:</strong> Uygulama menüsündeki <strong>Şablonlar</strong>{' '}
                ekranından kod bazında HTML ve JSON yapılarını doğrudan özelleştirebilir ve
                düzenleyebilirsiniz.
              </li>
              <li>
                <strong>Mustache Motoru:</strong> HTML şablonlarında <code>{'{{deger}}'}</code>{' '}
                Mustache yapısı kullanılır, dinamik veriler buraya yerleşir.
              </li>
              <li>
                <strong>Şablon Konumu:</strong> Proje dizinindeki <code>resources/templates/</code>{' '}
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
              Teslim Tesellüm gibi belgelerde kağıt tasarrufu için A4 sayfasının üst ve alt
              yarısında iki kopya (`half-page`) yer alır:
            </p>
            <ul className="text-xs text-slate-600 dark:text-slate-400 list-disc list-inside space-y-1.5 font-normal">
              <li>
                <strong>Yarım Sayfa Modu:</strong> Kalem sayısı azsa (≤ 5) iki nüsha tek bir A4
                kağıdına sığdırılır, araya kesikli çizgi konulur.
              </li>
              <li>
                <strong>Dinamik Tam Sayfa (Full-Page):</strong> Eğer malzeme satırı sayısı
                5&apos;ten fazla ise şablondaki DOM scripti otomatik olarak{' '}
                <code>full-page-mode</code> sınıfını ekler.
              </li>
              <li>
                Bu modda iki nüsha da dikey A4 boyutuna genişletilir ve sayfa sonu (`break-after:
                page`) verilerek ardışık iki tam A4 sayfası olarak yazdırılır.
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
              Kullanıcının bazı alanları (örneğin dosya numarası) boş bırakması ihtimaline karşı
              resmi evraklarda şu kurallar uygulanır:
            </p>
            <ul className="text-xs text-slate-600 dark:text-slate-400 list-disc list-inside space-y-1.5 font-normal">
              <li>
                <strong>Obje Ayrıştırma:</strong> <code>dosyaNumarasi</code> bir bütün string yerine{' '}
                <code>{'{ yili: "2026", sayisi: "123" }'}</code> şeklinde bir nesne olarak saklanır.
              </li>
              <li>
                <strong>Mustache Fallback:</strong> Sayı değeri girilmediğinde şablonun bozulmaması
                için{' '}
                <code>{'{{yili}}/{{#sayisi}}{{sayisi}}{{/sayisi}}{{^sayisi}}....{{/sayisi}}'}</code>{' '}
                yapısı kullanılır.
              </li>
              <li>
                <strong>Çıktı Güvenliği:</strong> Böylece eksik verilerde çıktı{' '}
                <code>2026/....</code> veya tamamen boş ise <code>..../....</code> şeklinde
                gösterilerek resmi evrak formatı korunur.
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl p-4 text-xs text-blue-800 dark:text-blue-300 leading-relaxed flex gap-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div>
            <strong>Geliştirici & Model Notu:</strong> Şablonları güncellerken veya yeni alanlar
            eklerken bu yerleşim kurallarına ve boş veri yedekleme (fallback) yapılarına sadık
            kalmaya özen gösterin.
          </div>
        </div>
      </div>
    </div>
  )
}

import React from 'react'
import { BookOpen } from 'lucide-react'

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
}`

export const StandartDosyaPlaniRehberi: React.FC = () => {
  return (
    <div className="p-6 overflow-y-auto h-full max-h-full custom-scrollbar bg-slate-50 dark:bg-slate-900/40 animate-in fade-in duration-300">
      <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="text-center pb-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-855 dark:text-slate-100 flex items-center justify-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Standart Dosya Planı (SDP) &amp; Arşiv Kılavuzu
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Resmi evrak numaralandırma şeması (E-DETSİS-SDP-SIRA), dosya kodları ve arşiv
            saklama/imha süreçleri
          </p>
        </div>

        {/* 1. YENİ EVRAK VE DOSYA NUMARALANDIRMA YAPISI */}
        <div className="bg-white dark:bg-slate-955 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-250 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            1. Evrak Numaralandırma Yapısı (Yeni Mevzuat)
          </h3>
          <p className="text-xs text-slate-655 dark:text-slate-400 leading-relaxed">
            Resmi belgelerin hazırlanma sürecini gösteren harf kodu ile başlayan, DETSİS kurumsal
            kodu, Standart Dosya Planı (SDP) kodu ve kesintisiz artan genel sıra numarasını
            barındıran resmi evrak şemasıdır:
          </p>

          <div className="bg-slate-900 dark:bg-slate-950 p-4 rounded-xl text-white font-mono text-xs overflow-x-auto space-y-3 shadow-inner">
            <div className="text-blue-400 font-extrabold text-sm">ŞEMA: E-DETSİS-SDP-SIRA</div>
            <div className="text-slate-300">
              Örnek: <span className="text-emerald-400 font-extrabold">E-10234521-934.01-0001</span>
            </div>
            <div className="border-t border-slate-800 pt-2 space-y-1 text-slate-400 text-[11px]">
              <div>
                • <strong className="text-slate-250">E:</strong> Belgenin hazırlanma sürecini
                (Evrak) ifade eder. (Olağanüstü haller için{' '}
                <span className="text-amber-500">O</span>, zorunlu haller için{' '}
                <span className="text-red-500">Z</span> harfleri kullanılır)
              </div>
              <div>
                • <strong className="text-slate-250">10234521:</strong> Birim/Kurum DETSİS Kodu
              </div>
              <div>
                • <strong className="text-slate-250">934.01:</strong> Standart Dosya Planı (SDP)
                Kodu (Örn: Mal Alımı)
              </div>
              <div>
                • <strong className="text-slate-250">0001:</strong> Genel Sıra Numarası (Yılbaşında
                sıfırlanmaz, kesintisiz devam eder)
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
              Doğrudan Temin işlemleri girildiğinde alım türlerine göre sistem otomatik olarak
              aşağıdaki Standart Dosya Planı (SDP) kodlarını bağlar:
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
                Ödeme Emri Belgesi (ÖEB) numaraları, bütçe yılı veya dosya tipinden bağımsız olarak
                DETSİS kodu ve kesintisiz artan sıra numarasıyla oluşturulur:
              </p>
              <div className="bg-slate-900 dark:bg-slate-950 p-4 rounded-xl text-white font-mono text-xs space-y-1 shadow-inner">
                <div className="text-teal-400 font-extrabold">ŞEMA: E-DETSİS-SIRA</div>
                <div className="text-slate-300">
                  Örnek: <span className="text-emerald-400 font-extrabold">E-10234521-000087</span>
                </div>
                <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800/80 mt-1">
                  Ödeme Emri Sıra No 6 haneli (000087) olarak doldurulur.
                </div>
              </div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-955/20 border border-amber-200 dark:border-amber-900/50 rounded-xl p-3 text-[11px] text-amber-800 dark:text-amber-400 leading-normal mt-3">
              ⚠️ <strong>Sıfırlanmama Kuralı:</strong> Yeni yıl başlangıcında (ör. 2026&apos;dan
              2027&apos;ye geçişte) evrak sıra numaraları ve ÖEB sayıları sıfırlanmaz; kaldığı
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
            Mevzuat gereği doğrudan temin (934.01) dosyalarının <strong>10 Yıl</strong> saklanması
            ve saklama süresi sonunda tasfiye koduna (C) göre işlem yapılması gerekir. Bir dosyanın
            arşiv yönetim süreci veri modeli şöyledir:
          </p>

          <div className="bg-slate-900 dark:bg-slate-950 p-4 rounded-xl text-slate-300 font-mono text-xs overflow-x-auto shadow-inner">
            <pre className="whitespace-pre">{SDP_CODE_BLOCK}</pre>
          </div>
        </div>
      </div>
    </div>
  )
}

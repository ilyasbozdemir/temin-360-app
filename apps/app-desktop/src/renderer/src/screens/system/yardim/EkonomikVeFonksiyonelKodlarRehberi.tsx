import React from 'react'
import { Layers, Info } from 'lucide-react'

export const EkonomikVeFonksiyonelKodlarRehberi: React.FC = () => {
  return (
    <div className="p-6 overflow-y-auto h-full max-h-full custom-scrollbar bg-slate-50 dark:bg-slate-900/40">
      <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="text-center pb-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center justify-center gap-2">
            <Layers className="w-5 h-5 text-indigo-650" />
            Ekonomik ve Fonksiyonel Kodlar Rehberi (2026 - 2028)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Analitik bütçe sınıflandırması, ekonomik kodlar (03.02, 03.05 vb.) ve
            malzemeler/süreçler ile ilişkilendirilmesi
          </p>
        </div>

        <div className="bg-white dark:bg-slate-955 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-250 border-b border-slate-100 dark:border-slate-800 pb-2">
            1. Bütçe Sınıflandırma Yapısı (Yeni Program Bütçe Düzeni)
          </h3>
          <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed">
            50 program bütçe sistemine geçişle birlikte, harcamalar{' '}
            <strong>Program - Alt Program - Faaliyet</strong> düzeyinde izlenmektedir. Bütçe tertibi
            şu 4 ana bileşenden oluşur:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold block">PROGRAM</span>
              <span className="text-sm font-extrabold text-blue-600 font-mono">29</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold block">KURUMSAL</span>
              <span className="text-sm font-extrabold text-indigo-600 font-mono">10.26</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold block">FİNANSMAN</span>
              <span className="text-sm font-extrabold text-emerald-600 font-mono">01</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold block">EKONOMİK</span>
              <span className="text-sm font-extrabold text-amber-650 font-mono">03.02</span>
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
              Kırtasiye, büro malzemeleri, yakacak, elektrik, su, temizlik malzemeleri, giyecek,
              gıda ve ilaç alımlarını kapsar. Malzeme kartı oluştururken ve alım sürecine dahil
              ederken en sık kullanılan kodlerdir:
            </p>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 font-mono">
              <li>
                • <strong className="text-slate-700 dark:text-slate-300">03.02.10.01</strong>:
                Kırtasiye Alımları
              </li>
              <li>
                • <strong className="text-slate-700 dark:text-slate-300">03.02.10.02</strong>: Büro
                Malzemesi Alımları
              </li>
              <li>
                • <strong className="text-slate-700 dark:text-slate-300">03.02.20.02</strong>:
                Temizlik Malzemesi Alımları
              </li>
              <li>
                • <strong className="text-slate-700 dark:text-slate-300">03.02.30.03</strong>:
                Elektrik Alımları
              </li>
              <li>
                • <strong className="text-slate-700 dark:text-slate-300">03.02.40.01</strong>:
                Yiyecek Alımları
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-slate-955 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              03.05 - Hizmet Alımları & Kiralar
            </h3>
            <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed mb-3">
              Müteahhitlik, temizlik hizmetleri alımı, haberleşme giderleri, kiralama işlemleri,
              taşıma, bakım onarım gibi hizmet niteliğindeki doğrudan temin süreçlerinde kullanılır:
            </p>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 font-mono">
              <li>
                • <strong className="text-slate-700 dark:text-slate-300">03.05.10.03</strong>:
                Bilgisayar Hizmet Alım Giderleri
              </li>
              <li>
                • <strong className="text-slate-700 dark:text-slate-300">03.05.10.07</strong>: İş
                Sağlığı ve Güvenliği Hizmet Alımları
              </li>
              <li>
                • <strong className="text-slate-700 dark:text-slate-300">03.05.20.02</strong>:
                Telefon Abonelik ve Kullanım
              </li>
              <li>
                • <strong className="text-slate-700 dark:text-slate-300">03.05.50.05</strong>:
                Hizmet Binası Kiralama
              </li>
              <li>
                • <strong className="text-slate-700 dark:text-slate-300">03.05.10.51</strong>:
                Personel Çalıştırılmasına Dayalı Temizlik Hizmeti
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
            Sistemde tanımladığınız her bir malzeme/hizmet kalemine bu ekonomik kodları
            atayabilirsiniz. Böylece yaklaşık maliyet hesap cetvelinde ve lüzum belgelerinde her
            kalemin bütçedeki yeri (örneğin 03.2.1.01 kırtasiye) otomatik gruplanır ve bütçe sorgu
            aşamasında ödenek kontrolü tam doğrulukla yapılır.
          </p>
        </div>
      </div>
    </div>
  )
}

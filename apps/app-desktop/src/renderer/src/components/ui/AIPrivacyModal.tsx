import { ShieldAlert, Check, X } from 'lucide-react'

interface AIPrivacyModalProps {
  onAccept: () => void
  onDecline: () => void
}

export function AIPrivacyModal({ onAccept, onDecline }: AIPrivacyModalProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6 text-amber-600 dark:text-amber-500" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 dark:text-white">
              Yapay Zeka Gizlilik ve Veri Güvenliği
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Lütfen devam etmeden önce okuyunuz.
            </p>
          </div>
        </div>

        <div className="p-6 space-y-4 text-sm text-slate-600 dark:text-slate-300 overflow-y-auto">
          <p>
            Yapay Zeka (AI) Asistanı, resmi doğrudan temin ve ihale süreçlerinizi hızlandırmak
            amacıyla geliştirilmiş bir eklentidir.
          </p>
          <div className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-800">
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <span>
                  <strong>Hassas Veri Koruması:</strong> Sistemdeki verileriniz Yapay Zeka
                  sunucularına doğrudan gitmez. Tüm kritik verileriniz ve kurum bilgileri, arka
                  planda <strong>yer tutucular (placeholder)</strong> olarak maskelenir ve
                  anonimleştirilir.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <span>
                  <strong>Açık Kaynak Sistem:</strong> Bu uygulama ve AI entegrasyonu açık kaynak
                  kodludur. Güvenliğinizi tehdit edecek hiçbir arka plan veri paylaşımı söz konusu
                  değildir.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <span>
                  <strong>Yasal Sorumluluk:</strong> Yapay zeka tavsiyeleri 4734, 4735 ve 2886
                  sayılı kanunlar ile ilgili kamu ihale mevzuatı çerçevesinde şekillense de, son onay
                  ve yasal sorumluluk her zaman işlemi gerçekleştiren personele aittir.
                </span>
              </li>
            </ul>
          </div>
          <p className="text-xs text-slate-500 font-semibold text-center">
            "Kabul Ediyorum" diyerek, uygulamanın yapay zeka özelliklerini kullanmayı onaylamış
            olursunuz.
          </p>
        </div>

        <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-col sm:flex-row justify-end gap-3">
          <button
            onClick={onDecline}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
          >
            <X size={18} />
            İptal Et
          </button>
          <button
            onClick={onAccept}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
          >
            <Check size={18} />
            Okudum, Kabul Ediyorum
          </button>
        </div>
      </div>
    </div>
  )
}

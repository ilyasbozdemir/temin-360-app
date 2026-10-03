import React from 'react'
import { AlertTriangle, CheckCircle } from 'lucide-react'
import { useSettingsStore } from '../../store/settingsStore'

export const DisclaimerModal: React.FC = () => {
  const { isDisclaimerAccepted, setDisclaimerAccepted, disclaimerHistory, setDisclaimerHistory } =
    useSettingsStore()

  if (isDisclaimerAccepted) return null

  const handleAccept = async () => {
    try {
      // Save locally
      setDisclaimerAccepted(true)

      let historyArray: string[] = []
      try {
        if (disclaimerHistory) {
          historyArray = JSON.parse(disclaimerHistory)
          if (!Array.isArray(historyArray)) historyArray = []
        }
      } catch (e) {
        historyArray = []
      }

      historyArray.push(new Date().toISOString())
      const newHistory = JSON.stringify(historyArray)
      setDisclaimerHistory(newHistory)

      // Save to db
      await window.electron.ipcRenderer.invoke('db:save-settings', {
        isDisclaimerAccepted: 'true',
        disclaimerHistory: newHistory
      })
    } catch (error) {
      console.error('Sorumluluk reddi kaydedilirken hata oluştu:', error)
      // Fallback
      setDisclaimerAccepted(true)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 bg-red-50 dark:bg-red-900/10 border-b border-red-100 dark:border-red-900/20 flex items-start gap-4">
          <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full text-red-600 dark:text-red-400 flex-shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">
              Yasal Uyarı ve Sorumluluk Reddi
            </h2>
            <p className="text-xs text-red-600/80 dark:text-red-400/80 font-medium mt-1">
              Lütfen kullanıma başlamadan önce okuyun.
            </p>
          </div>
        </div>

        <div className="p-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3.5 max-h-[60vh] overflow-y-auto">
          <div className="p-3.5 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-900/50 text-blue-900 dark:text-blue-200 text-xs">
            💡 <strong>Ücretsiz Yardımcı Araç:</strong> Bu uygulama, satın alma birimleri ve kamu
            görevlilerinin 4734 doğrudan temin / ihale ve 2886 devlet ihale süreçlerini kolaylaştırmak,
            kendi veri ve şablonlarını düzenli yönetmelerini sağlamak amacıyla sunulmuş{' '}
            <strong>ücretsiz bir masaüstü aracıdır</strong>.
          </div>

          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200 text-xs space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
              ⚠️ <strong>Veri Girişi, Güncelleme ve Sorumluluk Kapsamı:</strong>
            </div>
            <ul className="list-disc list-inside space-y-1.5 text-[11px] text-amber-900/90 dark:text-amber-300/90">
              <li>
                <strong>Veri ve Mevzuat Güncelleme Yükümlülüğü Yoktur:</strong> Yazılım geliştiricisinin
                sürekli değişen kamu ihale mevzuatını (4734, 4735, 2886), parasal limitleri, vergi/SGK
                oranlarını veya Bakanlık birim fiyat pozlarını takip etme, güncelleme veya sisteme
                yükleme gibi hiçbir taahhüdü ve yükümlülüğü bulunmamaktadır.
              </li>
              <li>
                <strong>Veri Yönetimi Kullanıcıya Aittir:</strong> Kurum ayarları, birim fiyat pozları,
                komisyon listeleri, teklifler ve şablonlar kullanıcı/idare tarafından girilir ve
                yönetilir.
              </li>
              <li>
                <strong>Resmî Doğrulama Sorumluluğu:</strong> Resmî iş ve işlemlerde kullanılan tüm evrak,
                oran, limit ve hesaplamaların güncelliğini Resmî Gazete,{' '}
                <span className="font-semibold">mevzuat.gov.tr</span> ve{' '}
                <span className="font-semibold">ihale.gov.tr</span> üzerinden teyit etmek tamamen{' '}
                <strong>kullanıcının ve ilgili kamu idaresinin kendi sorumluluğundadır</strong>.
              </li>
            </ul>
          </div>

          <p className="p-3 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 italic">
            Geliştirici ve katkıda bulunanlar; veri girişi eksikliği, mevzuat değişiklikleri, hesaplama
            farklılıkları veya hatalı kullanım sebebiyle oluşabilecek hiçbir hukuki, idari veya mali
            sonuçtan hukuken sorumlu tutulamaz.
          </p>
        </div>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
          <button
            onClick={handleAccept}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-2 transition-colors shadow-sm shadow-blue-600/20"
          >
            <CheckCircle className="w-4 h-4" />
            Anladım, Kabul Ediyorum
          </button>
        </div>
      </div>
    </div>
  )
}

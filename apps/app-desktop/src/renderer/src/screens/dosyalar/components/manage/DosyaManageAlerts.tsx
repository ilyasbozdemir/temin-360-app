import React from 'react'
import { HelpCircle } from 'lucide-react'

export interface DosyaManageAlertsProps {
  validationError: string | null
  onClearValidationError: () => void
  isDonemTanimsiz: boolean
  dosyaAcilisTarihi?: string | null
}

export const DosyaManageAlerts: React.FC<DosyaManageAlertsProps> = ({
  validationError,
  onClearValidationError,
  isDonemTanimsiz,
  dosyaAcilisTarihi
}) => {
  return (
    <>
      {validationError && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-r-xl mb-6 shadow-sm flex justify-between items-start">
          <div className="flex items-start gap-3">
            <div className="bg-amber-100 dark:bg-amber-900/50 p-2 rounded-lg">
              <HelpCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-amber-800 dark:text-amber-300">
                Form Kontrol Uyarısı
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                {validationError}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClearValidationError}
            className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline px-2 py-1 cursor-pointer"
          >
            Kapat
          </button>
        </div>
      )}

      {isDonemTanimsiz && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-xl mb-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="bg-red-100 dark:bg-red-900/50 p-2 rounded-lg">
              <HelpCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="font-bold text-red-800 dark:text-red-300">
                Kritik Hata: 22/d Limit Dönemi Bulunamadı!
              </h3>
              <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                Sistemde, seçtiğiniz &quot;Dosya Açılış Tarihi&quot; (
                {dosyaAcilisTarihi}) ile eşleşen bir Doğrudan Temin Limit
                Dönemi bulunamadı. Lütfen{' '}
                <strong>Sistem Ayarları &gt; Mevzuat ve Parametreler</strong> bölümünden
                ilgili tarihe ait limiti ekleyiniz. Limit olmadan bu dosyaya tahmini bedel
                kontrolü yapılamaz.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

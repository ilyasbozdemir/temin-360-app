import React from 'react'
import { Mail } from 'lucide-react'

interface LockScreenSendCodeProps {
  loading: boolean
  onSendCode: () => void
  onCancel: () => void
}

export function LockScreenSendCode({
  loading,
  onSendCode,
  onCancel
}: LockScreenSendCodeProps): React.JSX.Element {
  return (
    <div className="space-y-4">
      <p className="text-slate-650 dark:text-slate-300 text-xs leading-relaxed">
        Kilitli kurum dosyanıza erişim şifrenizi sıfırlamak için, sistemde tanımlı olan kurum
        e-posta adresine tek kullanımlık 6 haneli bir doğrulama kodu gönderilecektir.
      </p>
      <div className="p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-2xl flex items-start gap-3">
        <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <span className="text-[10px] text-blue-700 dark:text-blue-300 leading-normal">
          Bu işlemin çalışabilmesi için Ayarlar menüsünden SMTP Sunucu ve Kurum E-posta bilgilerinin
          önceden tanımlanmış veya yapılandırılmış olması gerekmektedir.
        </span>
      </div>
      <button
        onClick={onSendCode}
        disabled={loading}
        className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white rounded-xl text-sm font-semibold transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
      >
        {loading ? 'Gönderiliyor...' : 'Kurtarma Kodu Gönder'}
      </button>
      <button
        onClick={onCancel}
        className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-305 hover:text-slate-900 dark:hover:text-white rounded-xl text-xs font-semibold transition-all border border-slate-200 dark:border-slate-700 focus:outline-none cursor-pointer"
      >
        Giriş Ekranına Dön
      </button>
    </div>
  )
}

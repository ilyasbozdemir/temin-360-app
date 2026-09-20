import React from 'react'
import { Building2 } from 'lucide-react'

interface LockScreenLogoProps {
  activeLogo: string | null
  titleText: string
  isSetupMode: boolean
  fileName: string | null
}

export function LockScreenLogo({
  activeLogo,
  titleText,
  isSetupMode,
  fileName
}: LockScreenLogoProps): React.JSX.Element {
  return (
    <div className="flex flex-col items-center mb-8">
      {/* Institution Logo with custom visual style or warm placeholder */}
      <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 border border-slate-200 dark:border-blue-900/30 rounded-2xl flex items-center justify-center mb-4 overflow-hidden shadow-inner">
        {activeLogo ? (
          <img
            src={activeLogo}
            alt="Kurum Logosu"
            className="w-full h-full object-contain p-1"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              const parent = e.currentTarget.parentElement
              if (parent) {
                const fallback = parent.querySelector('.logo-fallback') as HTMLElement
                if (fallback) fallback.style.display = 'flex'
              }
            }}
          />
        ) : null}
        <div
          className="logo-fallback w-full h-full flex items-center justify-center text-blue-600 dark:text-blue-400"
          style={{ display: activeLogo ? 'none' : 'flex' }}
        >
          <Building2 className="w-10 h-10" />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-slate-850 dark:text-white tracking-tight text-center">
        {titleText}
      </h2>
      <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 text-center truncate max-w-full px-4">
        {isSetupMode
          ? 'Dosya için henüz giriş şifresi tanımlanmamış. Lütfen belirleyin.'
          : `Açık Dosya: ${fileName}`}
      </p>
    </div>
  )
}

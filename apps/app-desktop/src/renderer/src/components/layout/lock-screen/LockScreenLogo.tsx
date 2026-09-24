import React, { useState } from 'react'
import { Building2 } from 'lucide-react'

function normalizeLogoUrl(src?: string | null): string | null {
  if (!src || typeof src !== 'string') return null
  const trimmed = src.trim()
  if (!trimmed || trimmed === 'null' || trimmed === 'undefined') return null

  // If already full data URI or valid URL protocol
  if (
    trimmed.startsWith('data:') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('file://') ||
    trimmed.startsWith('atom://') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('./')
  ) {
    return trimmed
  }

  // SVG raw text
  if (trimmed.startsWith('<svg') || trimmed.startsWith('<?xml')) {
    return `data:image/svg+xml;utf8,${encodeURIComponent(trimmed)}`
  }

  // Base64 SVG
  if (trimmed.startsWith('PHN2Zy') || trimmed.startsWith('PD94bWw')) {
    return `data:image/svg+xml;base64,${trimmed}`
  }

  // Base64 JPEG
  if (trimmed.startsWith('/9j/')) {
    return `data:image/jpeg;base64,${trimmed}`
  }

  // Default raw Base64 PNG
  return `data:image/png;base64,${trimmed}`
}

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
  const [imageError, setImageError] = useState(false)
  const normalizedLogo = normalizeLogoUrl(activeLogo)
  const shouldShowImage = Boolean(normalizedLogo && !imageError)

  return (
    <div className="flex flex-col items-center mb-8">
      {/* Institution Logo with clean container */}
      <div className="w-20 h-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center mb-4 overflow-hidden shadow-lg p-2 transition-all">
        {shouldShowImage ? (
          <img
            src={normalizedLogo!}
            alt="Kurum Logosu"
            className="w-full h-full object-contain drop-shadow-xs"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30 rounded-xl">
            <Building2 className="w-9 h-9" />
          </div>
        )}
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

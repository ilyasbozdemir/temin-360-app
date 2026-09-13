import React from 'react'
import { KeyRound, Sparkles, X } from 'lucide-react'

interface AiMissingModalProps {
  isOpen: boolean
  onClose: () => void
  onGoToSettings: () => void
}

export const AiMissingModal: React.FC<AiMissingModalProps> = ({
  isOpen,
  onClose,
  onGoToSettings
}) => {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-32 h-32 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 shadow-xs">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">TEMİN 360 AI</h3>
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
              API Anahtarı Yapılandırılmadı
            </p>
          </div>
        </div>

        <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
          <p>
            <strong className="text-slate-900 dark:text-white">TEMİN 360 AI Karar Desteği</strong>,
            doğrudan temin (22/d) ve ihale süreçlerinizde mevzuat kontrolü, piyasa araştırması ve
            onay belgesi gerekçeleri oluşturmak için yapay zeka servislerinden faydalanır.
          </p>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              <span>Desteklenen Servis Sağlayıcıları:</span>
            </div>
            <ul className="list-disc list-inside text-slate-500 dark:text-slate-400 text-[11px] space-y-1 pl-1">
              <li>
                <strong>Google Gemini</strong> (Önerilen - Ücretsiz / Düşük Maliyet)
              </li>
              <li>
                <strong>OpenAI ChatGPT</strong> (GPT-4o / GPT-4o-mini)
              </li>
              <li>
                <strong>Anthropic Claude</strong> (Claude 3.5 Sonnet)
              </li>
            </ul>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            🔒 API anahtarınız yalnızca sizin yerel bilgisayarınızda güvenle saklanır, harici
            sunucularla paylaşılmaz.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Kapat
          </button>
          <button
            type="button"
            onClick={onGoToSettings}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-900/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Ayarlar'a Git & API Key Ekle</span>
          </button>
        </div>
      </div>
    </div>
  )
}

import React from 'react'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

export interface ToastInfo {
  message: string
  type: 'success' | 'error' | 'warning'
}

interface CiktiToastProps {
  toast: ToastInfo | null
}

export function CiktiToast({ toast }: CiktiToastProps): React.JSX.Element | null {
  if (!toast) return null

  return (
    <div
      className={`fixed bottom-6 right-6 px-4 py-3 rounded-2xl shadow-xl border backdrop-blur-md text-sm flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 z-[9999] transition-all duration-300 ${
        toast.type === 'success'
          ? 'bg-emerald-50/90 border-emerald-200 text-emerald-800 dark:bg-emerald-950/90 dark:border-emerald-800 dark:text-emerald-300'
          : toast.type === 'warning'
            ? 'bg-amber-50/90 border-amber-200 text-amber-800 dark:bg-amber-950/90 dark:border-amber-800 dark:text-amber-300'
            : 'bg-rose-50/90 border-rose-200 text-rose-800 dark:bg-rose-950/90 dark:border-rose-800 dark:text-rose-300'
      }`}
    >
      {toast.type === 'success' ? (
        <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
      ) : toast.type === 'warning' ? (
        <AlertCircle className="w-5 h-5 shrink-0 text-amber-500" />
      ) : (
        <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
      )}
      <div className="font-semibold">{toast.message}</div>
    </div>
  )
}

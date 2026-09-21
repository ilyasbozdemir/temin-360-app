import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, X } from 'lucide-react'
import { Button } from './Button'

interface Props {
  children: ReactNode
  onClose?: () => void
  modalTitle?: string
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ModalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  }

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ModalErrorBoundary] Modal içeriğinde hata yakalandı:', error, errorInfo)
    this.setState({ errorInfo })

    // Güvenlik Temizliği: Body üzerindeki kilitleri anında aç
    try {
      document.body.removeAttribute('data-scroll-locked')
      document.body.style.setProperty('pointer-events', 'auto', 'important')
      document.documentElement.style.setProperty('pointer-events', 'auto', 'important')
      document.body.style.overflow = 'unset'

      // Radix kilit stillerini temizle
      document.querySelectorAll('style[data-radix-scroll-lock], style[data-radix-body-lock]').forEach((el) => {
        el.remove()
      })
    } catch {
      // ignore
    }
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    if (this.props.onClose) {
      this.props.onClose()
    }
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-rose-50/90 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 rounded-2xl space-y-4 text-left shadow-lg animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300 rounded-xl shrink-0 mt-0.5">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1 flex-1 min-w-0">
              <h3 className="text-sm font-bold text-rose-900 dark:text-rose-200 flex items-center justify-between">
                <span>Pencere İçeriğinde Bir Hata Oluştu</span>
                {this.props.modalTitle && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-200/60 dark:bg-rose-900/40 text-rose-800 dark:text-rose-300">
                    {this.props.modalTitle}
                  </span>
                )}
              </h3>
              <p className="text-xs text-rose-700 dark:text-rose-300 leading-relaxed">
                İşlem sırasında beklenmeyen bir görüntüleme hatası meydana geldi. Ekran kilidi otomatik kaldırıldı, diğer işlemlerinize güvenle devam edebilirsiniz.
              </p>
            </div>
          </div>

          {this.state.error && (
            <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-rose-200/60 dark:border-rose-900/40 text-[11px] font-mono text-rose-800 dark:text-rose-300 overflow-x-auto max-h-32 custom-scrollbar select-all">
              <strong>Hata Mesajı:</strong> {this.state.error.toString()}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button
              type="button"
              onClick={this.handleReset}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>Pencereyi Kapat ve Devam Et</span>
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

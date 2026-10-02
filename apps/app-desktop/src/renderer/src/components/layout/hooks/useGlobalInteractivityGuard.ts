import { useEffect } from 'react'

/**
 * Global Interactivity Guard (Performans Optimize Edilmiş Sürüm)
 * Sekme veya rota değiştiğinde arka planda kalan modal scroll lock ve overlay kilitlerini
 * layout thrashing (sürekli reflow) yapmadan temizler.
 */
export function useGlobalInteractivityGuard(activeRouteOrTab: string): void {
  useEffect(() => {
    // Rota değiştiğinde açık custom dropdown veya geçici overlay'leri temizle
    window.dispatchEvent(new CustomEvent('app:clear-overlays'))

    const cleanupStuckLocks = (): void => {
      // 1. Body & HTML pointer events kilidini hafifçe kontrol et
      if (document.body.style.pointerEvents === 'none') {
        document.body.style.pointerEvents = 'auto'
      }
      if (document.documentElement.style.pointerEvents === 'none') {
        document.documentElement.style.pointerEvents = 'auto'
      }

      // 2. Kalan scroll kilitlerini kaldır
      if (document.body.hasAttribute('data-scroll-locked')) {
        document.body.removeAttribute('data-scroll-locked')
      }

      if (document.body.style.overflow === 'hidden') {
        // Eğer sahnede görünür bir modal yoksa overflow'u sıfırla
        const modal = document.querySelector('[role="dialog"]')
        if (!modal) {
          document.body.style.overflow = ''
        }
      }

      // 3. Radix veya Headless UI kilit stillerini temizle
      const lockStyles = document.querySelectorAll(
        'style[data-radix-scroll-lock], style[data-radix-body-lock]'
      )
      lockStyles.forEach((el) => {
        try {
          el.remove()
        } catch {
          // ignore
        }
      })

      // 4. Root üzerindeki hatalı inert/aria-hidden kilitlerini temizle
      const root = document.getElementById('root')
      if (root) {
        if (root.getAttribute('aria-hidden') === 'true') {
          root.removeAttribute('aria-hidden')
        }
        if (root.hasAttribute('inert')) {
          root.removeAttribute('inert')
        }
      }
    }

    // Yalnızca rota/sekme değiştiğinde 1 kez çalıştır
    cleanupStuckLocks()

    const handleClearOverlays = (): void => {
      cleanupStuckLocks()
    }

    window.addEventListener('app:clear-overlays', handleClearOverlays)

    return () => {
      window.removeEventListener('app:clear-overlays', handleClearOverlays)
    }
  }, [activeRouteOrTab])
}

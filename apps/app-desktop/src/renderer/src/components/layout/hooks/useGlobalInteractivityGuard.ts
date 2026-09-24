import { useEffect } from 'react'

export function useGlobalInteractivityGuard(locationHref: string): void {
  useEffect(() => {
    const isElementVisible = (el: Element): boolean => {
      if (!(el instanceof HTMLElement)) return false
      const rect = el.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return false
      const style = window.getComputedStyle(el)
      return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0'
    }

    const ensureInteractivity = () => {
      const candidateModals = Array.from(
        document.querySelectorAll(
          '[role="dialog"], [data-radix-portal] [role="dialog"], .fixed.inset-0.z-\\[99999\\], .fixed.inset-0.z-\\[100\\], .fixed.inset-0.z-\\[200\\], .fixed.inset-0.z-\\[9999\\], .fixed.inset-0.z-50'
        )
      )

      const hasVisibleModal = candidateModals.some(isElementVisible)

      if (!hasVisibleModal) {
        if (document.body.hasAttribute('data-scroll-locked')) {
          document.body.removeAttribute('data-scroll-locked')
        }

        document
          .querySelectorAll('style[data-radix-scroll-lock], style[data-radix-body-lock]')
          .forEach((el) => {
            try {
              el.remove()
            } catch {
              // ignore
            }
          })

        if (
          document.body.style.pointerEvents === 'none' ||
          window.getComputedStyle(document.body).pointerEvents === 'none'
        ) {
          document.body.style.setProperty('pointer-events', 'auto', 'important')
        }
        if (
          document.documentElement.style.pointerEvents === 'none' ||
          window.getComputedStyle(document.documentElement).pointerEvents === 'none'
        ) {
          document.documentElement.style.setProperty('pointer-events', 'auto', 'important')
        }

        if (document.body.style.overflow === 'hidden') {
          document.body.style.overflow = 'unset'
        }

        const root = document.getElementById('root')
        if (root) {
          if (root.getAttribute('aria-hidden') === 'true') {
            root.removeAttribute('aria-hidden')
          }
          if (root.hasAttribute('inert')) {
            root.removeAttribute('inert')
          }
        }

        document.querySelectorAll('[data-aria-hidden="true"]').forEach((el) => {
          el.removeAttribute('data-aria-hidden')
          el.removeAttribute('aria-hidden')
        })
      }
    }

    ensureInteractivity()
    const interval = setInterval(ensureInteractivity, 250)

    const observer = new MutationObserver(() => {
      ensureInteractivity()
    })

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['style', 'aria-hidden', 'inert', 'class', 'data-scroll-locked']
    })

    const handleUserInteraction = (e: Event) => {
      ensureInteractivity()

      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        const isReadOnly =
          (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) &&
          e.target.readOnly
        if (document.activeElement !== e.target && !e.target.disabled && !isReadOnly) {
          e.target.focus()
        }
      }
    }

    window.addEventListener('pointerdown', handleUserInteraction, true)
    window.addEventListener('mousedown', handleUserInteraction, true)
    window.addEventListener('click', handleUserInteraction, true)
    window.addEventListener('focusin', handleUserInteraction, true)
    window.addEventListener('keydown', ensureInteractivity, true)
    window.addEventListener('focus', ensureInteractivity, true)

    return () => {
      clearInterval(interval)
      observer.disconnect()
      window.removeEventListener('pointerdown', handleUserInteraction, true)
      window.removeEventListener('mousedown', handleUserInteraction, true)
      window.removeEventListener('click', handleUserInteraction, true)
      window.removeEventListener('focusin', handleUserInteraction, true)
      window.removeEventListener('keydown', ensureInteractivity, true)
      window.removeEventListener('focus', ensureInteractivity, true)
    }
  }, [locationHref])
}

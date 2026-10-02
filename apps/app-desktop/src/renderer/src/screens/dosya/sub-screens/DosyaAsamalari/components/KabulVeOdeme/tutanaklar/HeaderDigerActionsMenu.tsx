import React, { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CreditCard, FileText, MoreHorizontal, PackageCheck, ShieldCheck } from 'lucide-react'

interface HeaderDigerActionsMenuProps {
  isMal: boolean
  onOpenPreview?: (sablonKey: string) => void
  onOpenTifModal?: () => void
}

export function HeaderDigerActionsMenu({
  isMal,
  onOpenPreview,
  onOpenTifModal
}: HeaderDigerActionsMenuProps): React.JSX.Element {
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null)

  const updateCoords = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const menuWidth = 240
      let left = rect.right - menuWidth
      if (left < 10) left = 10
      let top = rect.bottom + 4
      if (top + 260 > window.innerHeight) {
        top = Math.max(10, rect.top - 260 - 4)
      }
      setCoords({ top, left })
    }
  }, [])

  useEffect(() => {
    if (!open) return undefined
    updateCoords()
    window.addEventListener('resize', updateCoords)
    window.addEventListener('scroll', updateCoords, true)
    return () => {
      window.removeEventListener('resize', updateCoords)
      window.removeEventListener('scroll', updateCoords, true)
    }
  }, [open, updateCoords])

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent): void => {
      const target = e.target as Node
      if (
        buttonRef.current &&
        !buttonRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setOpen(false)
      }
    }
    const handleClear = (): void => setOpen(false)
    document.addEventListener('mousedown', handler)
    window.addEventListener('app:clear-overlays', handleClear)
    return () => {
      document.removeEventListener('mousedown', handler)
      window.removeEventListener('app:clear-overlays', handleClear)
    }
  }, [open])

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="h-9 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer"
        title="Diğer Belge ve İşlem Seçenekleri"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {open &&
        coords &&
        createPortal(
          <div
            ref={menuRef}
            style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
            className="fixed z-[9999] w-60 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xl py-1 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700/60">
              Genel Dosya Çıktıları (Tüm Süreç)
            </div>
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                onOpenPreview?.('muayene-kabul-komisyonu')
              }}
              className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 flex items-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
              <span>Komisyon Kararı Belgesi</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                onOpenPreview?.('odeme-yazisi')
              }}
              className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-500" />
              <span>Mali Hizmetler Ödeme Yazısı</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                onOpenPreview?.('odeme-emri-belgesi')
              }}
              className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 flex items-center gap-2 cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5 text-blue-500" />
              <span>Ödeme Emri Belgesi (MİF)</span>
            </button>

            {isMal && (
              <>
                <div className="border-t border-slate-100 dark:border-slate-700/60 my-1" />
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    onOpenTifModal?.()
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center gap-2 cursor-pointer"
                >
                  <PackageCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Ambara Aktar (TİF)</span>
                </button>
              </>
            )}
          </div>,
          document.body
        )}
    </>
  )
}

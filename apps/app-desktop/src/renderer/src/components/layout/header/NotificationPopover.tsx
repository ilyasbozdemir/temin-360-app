import React, { useRef, useEffect, useState } from 'react'
import { Bell, X, Info, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react'
import { useAnnouncements } from '../../../screens/dashboard/dashboard.hooks'

export const NotificationPopover = React.memo(function NotificationPopover(): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false)
  const { announcements } = useAnnouncements()
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const getIcon = (type: string): React.JSX.Element => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
      case 'warning':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
      case 'error':
        return <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
      default:
        return <Info className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
    }
  }

  const getBorderColor = (type: string): string => {
    switch (type) {
      case 'success':
        return 'border-l-[3px] border-l-emerald-500'
      case 'warning':
        return 'border-l-[3px] border-l-amber-500'
      case 'error':
        return 'border-l-[3px] border-l-rose-500'
      default:
        return 'border-l-[3px] border-l-blue-500'
    }
  }

  const formatDate = (dateVal: string): string => {
    const d = new Date(dateVal)
    return isNaN(d.getTime())
      ? dateVal
      : d.toLocaleString('tr-TR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
  }

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={(): void => setIsOpen(!isOpen)}
        className="p-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-all rounded hover:bg-slate-200/50 dark:hover:bg-slate-800/50 relative cursor-pointer"
        title="Bildirimler"
      >
        <Bell className="w-3.5 h-3.5" />
        <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-red-500 rounded-full border border-white dark:border-slate-900 shadow-sm animate-pulse"></span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2">
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 font-bold text-sm text-slate-700 dark:text-slate-200 flex justify-between items-center">
            Bildirimler ve İşlem Logları
            <button
              onClick={(): void => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-650 cursor-pointer"
              title="Kapat"
            >
              <X size={14} />
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto custom-scrollbar flex flex-col divide-y divide-slate-50 dark:divide-slate-800/40">
            {announcements && announcements.length > 0 ? (
              announcements.slice(0, 15).map((item, i) => (
                <div
                  key={`notif-${item.id || ''}-${i}`}
                  className={`p-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors flex gap-2.5 ${getBorderColor(item.type || 'info')}`}
                >
                  {getIcon(item.type || 'info')}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight mb-1">
                      {item.title}
                    </p>
                    <p className="text-[10px] text-slate-550 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {item.content}
                    </p>
                    <p className="text-[9px] text-slate-400 mt-1.5 font-mono">
                      {formatDate(item.date)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-slate-400 text-xs">
                Henüz bildirim bulunmuyor.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
})

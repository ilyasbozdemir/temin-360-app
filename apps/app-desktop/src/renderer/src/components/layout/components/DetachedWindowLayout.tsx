import React from 'react'
import { Outlet } from '@tanstack/react-router'
import { ArrowLeftToLine, Minus, Square, X } from 'lucide-react'
import { FindInPage } from '../FindInPage'
import { getTabLabel } from '../../../store/tabStore'

interface DetachedWindowLayoutProps {
  isDosyaWindowMode: boolean
  routerState: any
}

export function DetachedWindowLayout({
  isDosyaWindowMode,
  routerState
}: DetachedWindowLayoutProps): React.JSX.Element {
  const rawPath =
    routerState.location.pathname +
    (routerState.location.searchStr || '') +
    (routerState.location.hash || '')
  const windowTitle = getTabLabel(rawPath)

  const handleReturnToParent = () => {
    window.electron?.ipcRenderer.send('tab:return-to-parent', {
      path: rawPath
    })
  }

  const handleMinimize = () => window.electron?.ipcRenderer.send('window-minimize')
  const handleMaximize = () => window.electron?.ipcRenderer.send('window-maximize')
  const handleClose = () => window.electron?.ipcRenderer.send('window-close')

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300 flex flex-col">
      <FindInPage />
      {/* Window Title Bar */}
      <div
        className="h-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 flex items-center px-3 shrink-0 gap-2"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        {/* Return to Parent button - only for tab windows */}
        {!isDosyaWindowMode && (
          <button
            onClick={handleReturnToParent}
            title="Ana Pencereye Dön (Sekme Olarak)"
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-all cursor-pointer"
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          >
            <ArrowLeftToLine className="w-3.5 h-3.5" />
            <span>Sekmeye Dön</span>
          </button>
        )}

        {/* Title */}
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate flex-1 ml-2">
          {windowTitle}
        </span>

        {/* Window controls */}
        <div
          className="flex items-center"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <button
            onClick={handleMinimize}
            className="h-8 w-10 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-slate-700 transition-none"
            title="Simge Durumuna Küçült"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleMaximize}
            className="h-8 w-10 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-slate-700 transition-none"
            title="Ekranı Kapla"
          >
            <Square className="w-3 h-3" />
          </button>
          <button
            onClick={handleClose}
            className="h-8 w-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#e81123] transition-none"
            title="Kapat"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

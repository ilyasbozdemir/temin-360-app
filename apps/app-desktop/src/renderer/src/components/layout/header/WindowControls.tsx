import React from 'react'
import { Minus, Square, X } from 'lucide-react'

export const WindowControls = React.memo(function WindowControls(): React.JSX.Element {
  const handleMinimize = (): void => window.electron?.ipcRenderer.send('window-minimize')
  const handleMaximize = (): void => window.electron?.ipcRenderer.send('window-maximize')
  const handleClose = (): void => window.electron?.ipcRenderer.send('window-close')

  return (
    <div
      className="flex items-center -mr-3 h-9"
      style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
    >
      <button
        onClick={handleMinimize}
        className="w-11 h-9 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        title="Simge Durumuna Küçült"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={handleMaximize}
        className="w-11 h-9 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        title="Ekranı Kapla / Geri Getir"
      >
        <Square className="w-3 h-3" />
      </button>

      <button
        onClick={handleClose}
        className="w-11 h-9 flex items-center justify-center text-slate-500 hover:text-white hover:bg-rose-600 transition-colors cursor-pointer"
        title="Kapat"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
})

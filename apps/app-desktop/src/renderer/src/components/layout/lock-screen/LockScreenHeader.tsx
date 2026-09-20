import React from 'react'
import { Lock, Minus, Moon, Square, Sun, X } from 'lucide-react'
import { useTheme } from '../../providers/ThemeProvider'

export function LockScreenHeader(): React.JSX.Element {
  const { theme, setTheme } = useTheme()

  const handleMinimize = (): void => window.electron?.ipcRenderer.send('window-minimize')
  const handleMaximize = (): void => window.electron?.ipcRenderer.send('window-maximize')
  const handleClose = (): void => {
    window.electron?.ipcRenderer.invoke('app:force-quit').catch(() => {
      window.electron?.ipcRenderer.send('window-close')
    })
  }

  return (
    <div
      className="absolute top-0 left-0 w-full h-12 flex justify-between items-center px-4 bg-transparent z-50 select-none"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      <div className="flex items-center gap-2 text-slate-400 dark:text-slate-655 text-xs font-semibold">
        <Lock className="w-3.5 h-3.5" />
        <span>TEMİN 360 Giriş</span>
      </div>

      <div
        className="flex items-center space-x-1"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-1.5 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-350 transition-all rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800/50 mr-2 cursor-pointer"
          title="Tema Değiştir"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <button
          onClick={handleMinimize}
          className="p-1.5 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-350 transition-all rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800/50 cursor-pointer"
          title="Simge Durumuna Küçült"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={handleMaximize}
          className="p-1.5 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-350 transition-all rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800/50 cursor-pointer"
          title="Ekranı Kapla"
        >
          <Square className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleClose}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-red-650 rounded-lg transition-all cursor-pointer"
          title="Kapat"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

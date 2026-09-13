import React, { useState, useEffect, useRef } from 'react'
import { X, ChevronUp, ChevronDown, Search } from 'lucide-react'

export function FindInPage(): React.JSX.Element | null {
  const [show, setShow] = useState(false)
  const [query, setQuery] = useState('')
  const [current, setCurrent] = useState(0)
  const [total, setTotal] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClose = (): void => {
    setShow(false)
    if (window.electron) {
      window.electron.ipcRenderer.send('find-in-page:stop', 'clearSelection')
    }
    setQuery('')
    setCurrent(0)
    setTotal(0)
  }

  const handleNext = (): void => {
    if (window.electron && query) {
      window.electron.ipcRenderer.send('find-in-page:start', query, {
        forward: true,
        findNext: true
      })
    }
  }

  const handlePrev = (): void => {
    if (window.electron && query) {
      window.electron.ipcRenderer.send('find-in-page:start', query, {
        forward: false,
        findNext: true
      })
    }
  }

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const val = e.target.value
    setQuery(val)
    if (!window.electron) return

    if (!val) {
      window.electron.ipcRenderer.send('find-in-page:stop', 'clearSelection')
      setCurrent(0)
      setTotal(0)
    } else {
      window.electron.ipcRenderer.send('find-in-page:start', val, { findNext: false })
    }
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (e.shiftKey) {
        handlePrev()
      } else {
        handleNext()
      }
    }
  }

  useEffect(() => {
    if (!window.electron) return

    // Handle Ctrl+F toggle event from main process
    const removeToggleListener = window.electron.ipcRenderer.on('find-in-page:toggle', () => {
      setShow((prev) => {
        const next = !prev
        if (!next) {
          window.electron.ipcRenderer.send('find-in-page:stop', 'clearSelection')
          setQuery('')
          setCurrent(0)
          setTotal(0)
        }
        return next
      })
    })

    // Listen to find-in-page results from main process
    const removeResultListener = window.electron.ipcRenderer.on(
      'find-in-page:result',
      (_, result: { activeMatchOrdinal: number; matches: number }) => {
        setCurrent(result.activeMatchOrdinal)
        setTotal(result.matches)
      }
    )

    // Catch local keydown (Ctrl+F) as additional handler
    const handleKeyDown = (e: KeyboardEvent): void => {
      const isF = e.key.toLowerCase() === 'f'
      const isCmdOrCtrl = e.ctrlKey || e.metaKey
      if (isCmdOrCtrl && isF) {
        e.preventDefault()
        setShow(true)
        setTimeout(() => {
          inputRef.current?.focus()
          inputRef.current?.select()
        }, 50)
      } else if (e.key === 'Escape' && show) {
        e.preventDefault()
        handleClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown, true)

    return () => {
      if (removeToggleListener) removeToggleListener()
      if (removeResultListener) removeResultListener()
      document.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [show, query])

  // Focus input when search bar opens
  useEffect(() => {
    if (show) {
      setTimeout(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
      }, 50)
    }
  }, [show])

  if (!show) return null

  return (
    <div className="fixed top-14 right-6 z-99999 flex items-center gap-2 p-1.5 pl-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur border border-slate-200 dark:border-slate-800 shadow-xl rounded-2xl animate-in slide-in-from-top-2 duration-200 select-none">
      <div className="flex items-center gap-2 text-slate-400">
        <Search className="w-4 h-4 text-slate-455 dark:text-slate-500 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Sayfada ara..."
          value={query}
          onChange={handleQueryChange}
          onKeyDown={handleInputKeyDown}
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          className="w-40 sm:w-56 text-xs bg-transparent border-none outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 select-text"
        />
      </div>

      {query && (
        <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 px-1 bg-slate-100 dark:bg-slate-800 rounded">
          {total > 0 ? `${current}/${total}` : '0/0'}
        </span>
      )}

      <div className="flex items-center border-l border-slate-200 dark:border-slate-800 ml-1 pl-1">
        <button
          type="button"
          onClick={handlePrev}
          disabled={!query || total === 0}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
          title="Önceki (Shift+Enter)"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!query || total === 0}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
          title="Sonraki (Enter)"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleClose}
          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all cursor-pointer ml-0.5"
          title="Kapat (Esc)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

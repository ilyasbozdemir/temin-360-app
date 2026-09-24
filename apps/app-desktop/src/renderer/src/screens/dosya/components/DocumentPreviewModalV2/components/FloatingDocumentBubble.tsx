import React, { useEffect, useRef, useState } from 'react'
import { Download, FileText, Layers, Maximize2, Printer, X } from 'lucide-react'

interface FloatingDocumentBubbleProps {
  documentTitle?: string
  onExpand: () => void
  onClose: () => void
  onPrint?: () => void
  onPdf?: () => void
  isPrinting?: boolean
}

export const FloatingDocumentBubble: React.FC<FloatingDocumentBubbleProps> = ({
  documentTitle,
  onExpand,
  onClose,
  onPrint,
  onPdf,
  isPrinting = false
}) => {
  // Position state (default: bottom-right offset)
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    const defaultX = typeof window !== 'undefined' ? window.innerWidth - 380 : 20
    const defaultY = typeof window !== 'undefined' ? window.innerHeight - 100 : 20
    return {
      x: Math.max(20, defaultX),
      y: Math.max(20, defaultY)
    }
  })
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef<{ startX: number; startY: number; posX: number; posY: number } | null>(
    null
  )
  const bubbleRef = useRef<HTMLDivElement | null>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag from handle or card background, not buttons
    if ((e.target as HTMLElement).closest('button')) return
    e.preventDefault()
    setIsDragging(true)
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: position.x,
      posY: position.y
    }
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !dragRef.current) return
      const dx = e.clientX - dragRef.current.startX
      const dy = e.clientY - dragRef.current.startY

      const newX = Math.min(Math.max(10, dragRef.current.posX + dx), window.innerWidth - 360)
      const newY = Math.min(Math.max(10, dragRef.current.posY + dy), window.innerHeight - 80)

      setPosition({ x: newX, y: newY })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      dragRef.current = null
    }

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  return (
    <div
      ref={bubbleRef}
      onMouseDown={handleMouseDown}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 60
      }}
      className={`group select-none transition-shadow duration-200 ${
        isDragging ? 'cursor-grabbing opacity-95 scale-102' : 'cursor-grab'
      }`}
    >
      {/* Balloon Glow Layer */}
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 rounded-3xl blur-md opacity-30 group-hover:opacity-60 transition duration-300 animate-pulse" />

      {/* Main Bubble Card */}
      <div className="relative flex items-center gap-3 px-4 py-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-blue-500/30 dark:border-blue-500/20 shadow-2xl shadow-blue-500/10 min-w-[320px] max-w-[400px]">
        {/* Drag Indicator & Pulse Dot */}
        <div className="relative flex items-center justify-center p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl shadow-md shadow-blue-500/20 shrink-0">
          <FileText className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
        </div>

        {/* Document Info */}
        <div
          onClick={onExpand}
          className="flex-1 min-w-0 cursor-pointer"
          title="Belgeyi Tam Boyut Aç"
        >
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            <Layers className="w-3 h-3" />
            <span>Yüzen Belge Modu</span>
          </div>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate mt-0.5">
            {documentTitle || 'Belge Önizleme'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 shrink-0 pl-1 border-l border-slate-200 dark:border-slate-800">
          {/* Print Button */}
          {onPrint && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onPrint()
              }}
              disabled={isPrinting}
              title="Hızlı Yazdır"
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
          )}

          {/* PDF Download Button */}
          {onPdf && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onPdf()
              }}
              title="PDF İndir"
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Expand Full Modal */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onExpand()
            }}
            title="Belgeyi Büyüt / Genişlet"
            className="p-1.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-lg font-bold transition-all cursor-pointer shadow-2xs"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          {/* Close Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            title="Belgeyi Kapat"
            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

import React, { useState } from 'react'
import {
  CheckSquare,
  Plus,
  ArrowRight,
  CheckCircle2,
  Circle,
  Calendar,
  Edit3
} from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { useNotlarHooks } from '../notlar.hooks'
import { NotModal } from './NotModal'
import { NotVeGorev } from '../types'

interface DosyaNotlariWidgetProps {
  dosyaId: number
  dosyaNo?: string
  className?: string
}

export function DosyaNotlariWidget({
  dosyaId,
  dosyaNo,
  className = ''
}: DosyaNotlariWidgetProps): React.JSX.Element {
  const navigate = useNavigate()
  const { notlar, createNot, toggleNot, updateNot } = useNotlarHooks()

  const [quickTitle, setQuickTitle] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<NotVeGorev | null>(null)

  // Sadece bu dosyaya ait notlar ve görevler
  const fileNotes = notlar.filter((n) => n.temin_dosya_id === dosyaId)
  const pendingCount = fileNotes.filter((n) => n.tamamlandi === 0).length

  const handleQuickAdd = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!quickTitle.trim()) return

    try {
      await createNot({
        baslik: quickTitle.trim(),
        temin_dosya_id: dosyaId,
        tip: 'todo',
        oncelik: 'orta',
        kategori: 'İhale / Doğrudan Temin',
        renk: 'slate'
      })
      setQuickTitle('')
    } catch (err) {
      console.error('Dosya notu eklenemedi:', err)
    }
  }

  return (
    <div
      className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 ${className}`}
    >
      {/* Başlık Çubuğu */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
            <CheckSquare className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
              Dosya Notları & Yapılacaklar (To-Do)
            </h4>
            <span className="text-[10px] text-slate-400">
              {dosyaNo ? `${dosyaNo} • ` : ''}
              {pendingCount} bekleyen işlem
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate({ to: '/notlar' as any, search: { dosyaId } as any })}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          title="Bu dosyanın tüm not ve görevlerini Notlar ekranında aç"
        >
          <span>Tüm Notlar</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Hızlı Görev Ekleme */}
      <form onSubmit={handleQuickAdd} className="flex items-center gap-1.5">
        <input
          type="text"
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
          placeholder="Bu dosyaya özel görev ekle (örn: Onay belgesi imzalatılacak)..."
          className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={!quickTitle.trim()}
          className="px-3 py-1.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer disabled:opacity-40"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Görev Listesi */}
      <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar pr-0.5">
        {fileNotes.length === 0 ? (
          <div className="py-4 text-center text-xs text-slate-400">
            Bu dosyaya ait henüz bir not veya görev eklenmemiş.
          </div>
        ) : (
          fileNotes.map((item) => {
            const isCompleted = item.tamamlandi === 1
            return (
              <div
                key={item.id}
                className={`flex items-center justify-between p-2 rounded-xl border transition-all text-xs ${
                  isCompleted
                    ? 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-200/50 dark:border-slate-800/40 opacity-60'
                    : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 shadow-xs'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
                  <button
                    type="button"
                    onClick={() => toggleNot({ id: item.id, tamamlandi: !isCompleted })}
                    className="text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer shrink-0"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                  </button>
                  <span
                    className={`truncate font-medium ${
                      isCompleted ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {item.baslik}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {item.vade_tarihi && (
                    <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                      <Calendar className="w-2.5 h-2.5" />
                      {item.vade_tarihi}
                    </span>
                  )}
                  {item.oncelik === 'acil' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setEditingItem(item)
                      setIsModalOpen(true)
                    }}
                    className="p-1 rounded text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                    title="Düzenle"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Modal */}
      <NotModal
        isOpen={isModalOpen}
        editingItem={editingItem}
        dosyalar={[]}
        defaultDosyaId={dosyaId}
        onClose={() => {
          setIsModalOpen(false)
          setEditingItem(null)
        }}
        onSave={async (data) => {
          if (editingItem) {
            await updateNot(data)
          } else {
            await createNot(data)
          }
        }}
      />
    </div>
  )
}

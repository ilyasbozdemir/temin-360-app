import React, { useState } from 'react'
import { Check, ListChecks } from 'lucide-react'

export interface ChecklistItem {
  id: string
  label: string
  checked: boolean
}

interface KlasorChecklistCardProps {
  checklist: ChecklistItem[]
  isDosyaClosed: boolean
  onToggleChecklist: (id: string) => void
  onRemoveItem: (id: string) => void
  onAddFromGlobal: (globalItem: { id: string; label: string }) => void
  onAddCustomItem: (text: string) => void
  onMoveUp: (index: number) => void
  onMoveDown: (index: number) => void
  globalBelgeler: Array<{ id: string; label: string }>
}

export function KlasorChecklistCard({
  checklist,
  isDosyaClosed,
  onToggleChecklist,
  onRemoveItem,
  onAddFromGlobal,
  onAddCustomItem,
  onMoveUp,
  onMoveDown,
  globalBelgeler
}: KlasorChecklistCardProps) {
  const [isEditMode, setIsEditMode] = useState(false)
  const [customItemText, setCustomItemText] = useState('')

  const completedCount = checklist.filter((c) => c.checked).length
  const progressPercent =
    checklist.length > 0 ? Math.round((completedCount / checklist.length) * 100) : 0

  const handleAddCustom = () => {
    if (!customItemText.trim()) return
    onAddCustomItem(customItemText.trim())
    setCustomItemText('')
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <ListChecks className="w-4 h-4 text-blue-500" />
          Fiziksel Dosya İçerik Kontrol Listesi
        </h4>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            disabled={isDosyaClosed}
            className="text-xs font-bold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isEditMode ? 'Bitti' : 'Düzenle'}
          </button>
          <span className="text-[10px] font-bold px-2 py-1 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-md border border-blue-200 dark:border-blue-800">
            {progressPercent}% Tamamlandı
          </span>
        </div>
      </div>

      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mb-5 overflow-hidden">
        <div
          className="bg-blue-500 h-1.5 transition-all duration-500 rounded-full"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      <div className="flex flex-col gap-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
        {checklist.map((item, index) => (
          <div
            key={item.id}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
              item.checked
                ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40'
                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {!isEditMode && (
              <label className="flex items-center gap-3 flex-1 cursor-pointer">
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border ${
                    item.checked
                      ? 'bg-emerald-500 border-emerald-600 text-white'
                      : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600'
                  }`}
                >
                  {item.checked && <Check className="w-3.5 h-3.5" />}
                </div>
                <span
                  className={`text-xs font-semibold ${
                    item.checked
                      ? 'text-emerald-800 dark:text-emerald-300 line-through opacity-70'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {item.label}
                </span>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={item.checked}
                  onChange={() => onToggleChecklist(item.id)}
                  disabled={isDosyaClosed}
                />
              </label>
            )}

            {isEditMode && (
              <div className="flex items-center justify-between flex-1">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {item.label}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onMoveUp(index)}
                    disabled={index === 0}
                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500 disabled:opacity-30 cursor-pointer"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => onMoveDown(index)}
                    disabled={index === checklist.length - 1}
                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500 disabled:opacity-30 cursor-pointer"
                  >
                    ▼
                  </button>
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="p-1 hover:bg-red-100 text-red-500 rounded ml-2 cursor-pointer"
                  >
                    X
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {isEditMode && (
        <div className="mt-4 flex flex-col gap-4">
          <div className="p-4 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl flex flex-col gap-3">
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
              Özel / Serbest Madde Ekle:
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={customItemText}
                onChange={(e) => setCustomItemText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
                placeholder="Örn: Garanti Belgesi..."
                className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleAddCustom}
                disabled={!customItemText.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                Ekle
              </button>
            </div>
          </div>

          <div className="p-4 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl">
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
              Genel Listeden Ekle:
            </p>
            <div className="flex flex-wrap gap-2">
              {globalBelgeler
                .filter((g) => !checklist.some((c) => c.label === g.label))
                .map((g) => (
                  <button
                    key={g.id}
                    onClick={() => onAddFromGlobal(g)}
                    className="text-[10px] px-2 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 dark:border-slate-700 rounded-md transition-colors cursor-pointer"
                  >
                    + {g.label}
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

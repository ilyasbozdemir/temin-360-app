import React, { useState } from 'react'
import { Plus, X, List } from 'lucide-react'
import { FormFieldV2 } from '../../../types/formBuilder.types'

interface InspectorOptionsManagerProps {
  activeField: FormFieldV2
  onUpdateActiveField: (updates: Partial<FormFieldV2>) => void
}

export const InspectorOptionsManager: React.FC<InspectorOptionsManagerProps> = ({
  activeField,
  onUpdateActiveField
}) => {
  const [newOptionInput, setNewOptionInput] = useState('')

  const handleAddOption = () => {
    if (!newOptionInput.trim()) return
    const currentOptions = activeField.options || []
    onUpdateActiveField({
      options: [...currentOptions, newOptionInput.trim()]
    })
    setNewOptionInput('')
  }

  const handleRemoveOption = (indexToRemove: number) => {
    if (!activeField.options) return
    onUpdateActiveField({
      options: activeField.options.filter((_, idx) => idx !== indexToRemove)
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-1.5">
        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
          <List className="w-3.5 h-3.5 text-blue-600" />
          Seçenek Listesi ({activeField.options?.length || 0})
        </span>
      </div>

      {/* Seçenek Ekleme Girişi */}
      <div className="flex items-center gap-1.5">
        <input
          type="text"
          placeholder="Yeni seçenek adı..."
          value={newOptionInput}
          onChange={(e) => setNewOptionInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleAddOption()
            }
          }}
          className="flex-1 px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
        />
        <button
          type="button"
          onClick={handleAddOption}
          className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
          title="Seçenek Ekle"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Ekle</span>
        </button>
      </div>

      {/* Mevcut Seçenekler */}
      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
        {activeField.options && activeField.options.length > 0 ? (
          activeField.options.map((opt, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 group hover:border-blue-300 dark:hover:border-blue-700"
            >
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[9px] font-bold text-slate-500">
                  {idx + 1}
                </span>
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">{opt}</span>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveOption(idx)}
                className="p-1 text-slate-400 hover:text-red-500 rounded cursor-pointer transition-colors"
                title="Seçeneği Kaldır"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        ) : (
          <div className="p-3 bg-slate-100 dark:bg-slate-900/50 rounded-lg text-center text-slate-400 dark:text-slate-500 italic text-[11px]">
            Henüz seçenek eklenmedi. Yukarıdaki kutudan seçenek ekleyebilirsiniz.
          </div>
        )}
      </div>
    </div>
  )
}

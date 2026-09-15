import React, { useState } from 'react'
import { TagBadge } from '../../screens/dosyalar/components/Badges'
import { Plus, Tag as TagIcon } from 'lucide-react'

export interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  presetTags?: string[]
}

const DEFAULT_PRESETS = [
  'Acil',
  'Tadilat',
  'BAP',
  'TÜBİTAK',
  'DönerSermaye',
  'Yatırım2026',
  'BakımOnarım',
  'Yazılım',
  'Kırtasiye',
  'TıbbiCihaz'
]

export function TagInput({
  tags = [],
  onChange,
  placeholder = 'Etiket ekle ve Enter\'a bas...',
  presetTags = DEFAULT_PRESETS
}: TagInputProps): React.JSX.Element {
  const [inputVal, setInputVal] = useState('')
  const [showPresets, setShowPresets] = useState(false)

  const handleAdd = (val: string): void => {
    let clean = val.trim()
    if (!clean) return
    if (!clean.startsWith('#')) clean = `#${clean}`
    if (!tags.includes(clean)) {
      onChange([...tags, clean])
    }
    setInputVal('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      handleAdd(inputVal)
    } else if (e.key === 'Backspace' && !inputVal && tags.length > 0) {
      onChange(tags.slice(0, -1))
    }
  }

  const handleRemove = (targetTag: string): void => {
    onChange(tags.filter((t) => t !== targetTag))
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl min-h-[42px] focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
        <TagIcon size={14} className="text-slate-400 shrink-0 ml-1" />
        {tags.map((tag) => (
          <TagBadge key={tag} tag={tag} onRemove={() => handleRemove(tag)} />
        ))}
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowPresets(true)}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] bg-transparent text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none px-1"
        />
        {inputVal.trim() && (
          <button
            type="button"
            onClick={() => handleAdd(inputVal)}
            className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-lg text-xs font-bold transition-all flex items-center gap-0.5"
          >
            <Plus size={12} /> Ekle
          </button>
        )}
      </div>

      {showPresets && (
        <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px] text-slate-500">
          <span className="font-semibold text-slate-400">Önerilenler:</span>
          {presetTags.map((p) => {
            const formatted = `#${p}`
            const isSelected = tags.includes(formatted)
            return (
              <button
                key={p}
                type="button"
                onClick={() => {
                  if (isSelected) {
                    handleRemove(formatted)
                  } else {
                    handleAdd(p)
                  }
                }}
                className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-all border ${
                  isSelected
                    ? 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/60 dark:text-blue-200 dark:border-blue-700'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                {formatted} {isSelected ? '✓' : '+'}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

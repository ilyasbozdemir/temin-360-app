import React, { useState } from 'react'
import { TagBadge } from '../../screens/dosyalar/components/Badges'
import { Plus, Sparkles, Tag as TagIcon } from 'lucide-react'
import { slugifyTag, suggestTagsFromTitle } from '../../utils/tagUtils'

export interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  presetTags?: string[]
  autoSuggestText?: string | null
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
  placeholder = "Etiket ekle ve Enter'a bas...",
  presetTags = DEFAULT_PRESETS,
  autoSuggestText
}: TagInputProps): React.JSX.Element {
  const [inputVal, setInputVal] = useState('')
  const [showPresets, setShowPresets] = useState(false)

  const suggestedFromText = autoSuggestText ? suggestTagsFromTitle(autoSuggestText) : []

  const handleAdd = (val: string): void => {
    let clean = val.trim()
    if (!clean) return
    clean = slugifyTag(clean)
    if (clean && !tags.includes(clean)) {
      onChange([...tags, clean])
    }
    setInputVal('')
  }

  const handleAddMultiple = (newItems: string[]): void => {
    const updated = [...tags]
    for (const item of newItems) {
      const clean = slugifyTag(item)
      if (clean && !updated.includes(clean)) {
        updated.push(clean)
      }
    }
    onChange(updated)
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

      {suggestedFromText.length > 0 && (
        <div className="p-2 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-900/40 text-[11px] space-y-1.5">
          <div className="flex items-center justify-between text-purple-700 dark:text-purple-300 font-bold">
            <span className="flex items-center gap-1">
              <Sparkles size={12} className="text-purple-500" /> İş Konusundan Önerilen Etiketler:
            </span>
            <button
              type="button"
              onClick={() => handleAddMultiple(suggestedFromText)}
              className="text-[10px] bg-purple-600 text-white hover:bg-purple-700 px-2 py-0.5 rounded-md font-medium transition-colors"
            >
              Tümünü Ekle
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {suggestedFromText.map((st) => {
              const isAdded = tags.includes(st)
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => (isAdded ? handleRemove(st) : handleAdd(st))}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-all border ${
                    isAdded
                      ? 'bg-purple-200 text-purple-900 border-purple-300 dark:bg-purple-900 dark:text-purple-100'
                      : 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 hover:bg-purple-100'
                  }`}
                >
                  {st} {isAdded ? '✓' : '+'}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {showPresets && (
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5 text-[11px] text-slate-500">
          <span className="font-semibold text-slate-400">Hızlı Şablonlar:</span>
          {presetTags.map((p) => {
            const formatted = slugifyTag(p)
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

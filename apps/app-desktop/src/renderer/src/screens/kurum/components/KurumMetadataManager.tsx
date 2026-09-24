import React, { useState } from 'react'
import { Plus, Trash2, Key, Tag, Sparkles, Check, Edit2 } from 'lucide-react'
import { Input } from '../../../components/ui/Input'
import { Button } from '../../../components/ui/Button'

export interface KeyValuePair {
  id: string
  key: string
  value: string
  category?: string
}

interface KurumMetadataManagerProps {
  metadata: KeyValuePair[]
  onChange: (updated: KeyValuePair[]) => void
  isReadOnly?: boolean
}

const PRESET_KEYS = [
  'KEP Adresi',
  'VKN / Vergi Dairesi',
  'SGK İşyeri Sicil No',
  'MYS Harcama Birim Kodu',
  'DETSİS Alt Birim Kodu',
  'Döner Sermaye Kodu',
  'Özel İletişim Notu'
]

export const KurumMetadataManager: React.FC<KurumMetadataManagerProps> = ({
  metadata,
  onChange,
  isReadOnly = false
}) => {
  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)

  const handleAdd = () => {
    if (!newKey.trim()) return
    const newItem: KeyValuePair = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 4),
      key: newKey.trim(),
      value: newValue.trim()
    }
    onChange([...metadata, newItem])
    setNewKey('')
    setNewValue('')
  }

  const handleQuickAddPreset = (presetKey: string) => {
    if (metadata.some((m) => m.key.toLowerCase() === presetKey.toLowerCase())) {
      return
    }
    const newItem: KeyValuePair = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 4),
      key: presetKey,
      value: ''
    }
    onChange([...metadata, newItem])
  }

  const handleUpdate = (id: string, field: 'key' | 'value', val: string) => {
    onChange(metadata.map((item) => (item.id === id ? { ...item, [field]: val } : item)))
  }

  const handleDelete = (id: string) => {
    onChange(metadata.filter((item) => item.id !== id))
  }

  if (isReadOnly) {
    if (metadata.length === 0) {
      return (
        <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
          Henüz özel key-value metadata tanımı yapılmadı.
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {metadata.map((item) => (
          <div
            key={item.id}
            className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/70 space-y-1 transition-all hover:border-blue-300 dark:hover:border-blue-800"
          >
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              <Tag className="w-3 h-3 text-blue-500 shrink-0" />
              <span className="truncate">{item.key}</span>
            </div>
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 break-all">
              {item.value || <span className="text-slate-400 italic">Girilmedi</span>}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
        <div>
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Key className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Özel Kurum Meta Verileri & Parametreler (Key - Value)
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Resmi çıktılara veya özel entegrasyonlara aktarılmak üzere ek alanlar ve değerler
            tanımlayın.
          </p>
        </div>

        {/* Preset Badges */}
        <div className="flex flex-wrap gap-1">
          {PRESET_KEYS.map((preset) => {
            const exists = metadata.some((m) => m.key.toLowerCase() === preset.toLowerCase())
            return (
              <button
                key={preset}
                type="button"
                disabled={exists}
                onClick={() => handleQuickAddPreset(preset)}
                className={`text-[9px] font-bold px-2 py-1 rounded-lg border transition-all flex items-center gap-1 cursor-pointer ${
                  exists
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 opacity-60'
                    : 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/30'
                }`}
              >
                <Sparkles className="w-2.5 h-2.5" />
                <span>+ {preset}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Add Form */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <Input
          placeholder="Anahtar / Key (Örn: VKN, KEP Adresi)"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          className="text-xs flex-1 bg-transparent border-slate-200 dark:border-slate-800"
        />
        <Input
          placeholder="Değer / Value (Örn: 1234567890)"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          className="text-xs flex-1 bg-transparent border-slate-200 dark:border-slate-800"
        />
        <Button
          type="button"
          onClick={handleAdd}
          disabled={!newKey.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Ekle</span>
        </Button>
      </div>

      {/* Existing Items List */}
      <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
        {metadata.length === 0 ? (
          <p className="text-[11px] text-slate-400 italic text-center py-2">
            Henüz eklenmiş özel parametre bulunmuyor. Yukarıdan hızlı ekleyebilirsiniz.
          </p>
        ) : (
          metadata.map((item) => {
            const isEditing = editingId === item.id

            return (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 transition-all hover:shadow-2xs"
              >
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                  <div className="flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    {isEditing ? (
                      <Input
                        value={item.key}
                        onChange={(e) => handleUpdate(item.id, 'key', e.target.value)}
                        className="text-xs font-bold bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 py-1"
                      />
                    ) : (
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {item.key}
                      </span>
                    )}
                  </div>

                  <div>
                    {isEditing ? (
                      <Input
                        value={item.value}
                        onChange={(e) => handleUpdate(item.id, 'value', e.target.value)}
                        className="text-xs bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 py-1"
                      />
                    ) : (
                      <span className="text-xs text-slate-600 dark:text-slate-300 break-all font-mono">
                        {item.value || (
                          <span className="text-slate-400 italic font-sans text-[11px]">
                            Değer Yok
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => setEditingId(isEditing ? null : item.id)}
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors cursor-pointer"
                    title={isEditing ? 'Tamamla' : 'Düzenle'}
                  >
                    {isEditing ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Edit2 className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                    title="Sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

import React, { useState } from 'react'
import {
  ArrowLeft,
  Trash2,
  Settings,
  Eye,
  Code,
  CheckSquare,
  Calendar,
  DollarSign,
  AlignLeft,
  ListFilter,
  Users,
  Grid,
  Copy,
  Check,
  RefreshCw,
  Play,
  ChevronUp,
  ChevronDown,
  GripVertical,
  Building,
  Briefcase,
  Layers
} from 'lucide-react'
import { FormFieldV2, FormBuilderMode, PresetController } from '../types/formBuilder.types'
import { INITIAL_FIELDS, TYPE_LABELS, PRESET_CONTROLLERS } from '../constants/formBuilder.constants'

export type { FormFieldV2 }

export function FormBuilderV2Playground({ onBack }: { onBack: () => void }): React.JSX.Element {
  const [fields, setFields] = useState<FormFieldV2[]>(INITIAL_FIELDS)
  const [activeFieldId, setActiveFieldId] = useState<string | null>('f-1')
  const [mode, setMode] = useState<FormBuilderMode>('design')
  const [copied, setCopied] = useState(false)
  const [formData, setFormData] = useState<Record<string, any>>({
    antet_bilgisi: 'T.C. İÇİŞLERİ BAKANLIĞI - Destek Hizmetleri Dairesi',
    evrak_sayisi: 'E-74389201-934.01-1029',
    isin_aciklamasi: 'Kırtasiye ve Büro Malzemesi Alımı',
    muhatap_firma: 'ABC Teknoloji Ltd. Şti.',
    yaklasik_maliyet: '45.000,00 ₺',
    son_teklif_tarihi: '2026-10-01',
    alim_turu: 'Mal Alımı (4734 22/d)'
  })

  const activeField = fields.find((f) => f.id === activeFieldId)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const handleAddField = (type: FormFieldV2['type'], insertAtIndex?: number): void => {
    const newId = `f-${Date.now()}`

    const newField: FormFieldV2 = {
      id: newId,
      label: `Yeni ${TYPE_LABELS[type] || 'Alan'}`,
      variableName: `degisken_${fields.length + 1}`,
      type,
      required: false,
      placeholder: ''
    }

    if (typeof insertAtIndex === 'number') {
      const next = [...fields]
      next.splice(insertAtIndex, 0, newField)
      setFields(next)
    } else {
      setFields([...fields, newField])
    }
    setActiveFieldId(newId)
  }

  const handleAddPresetController = (preset: PresetController, insertAtIndex?: number): void => {
    const newId = `f-${Date.now()}`
    const newField: FormFieldV2 = {
      id: newId,
      ...preset.defaultField,
      variableName: `${preset.defaultField.variableName}_${fields.length + 1}`
    }

    if (typeof insertAtIndex === 'number') {
      const next = [...fields]
      next.splice(insertAtIndex, 0, newField)
      setFields(next)
    } else {
      setFields([...fields, newField])
    }
    setActiveFieldId(newId)
  }

  const handleMoveField = (fromIndex: number, toIndex: number): void => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || toIndex >= fields.length) return
    const updated = [...fields]
    const [movedItem] = updated.splice(fromIndex, 1)
    updated.splice(toIndex, 0, movedItem)
    setFields(updated)
  }

  const handleMoveUp = (index: number, e: React.MouseEvent): void => {
    e.stopPropagation()
    handleMoveField(index, index - 1)
  }

  const handleMoveDown = (index: number, e: React.MouseEvent): void => {
    e.stopPropagation()
    handleMoveField(index, index + 1)
  }

  const handleUpdateActiveField = (updates: Partial<FormFieldV2>): void => {
    if (!activeFieldId) return
    setFields((prev) => prev.map((f) => (f.id === activeFieldId ? { ...f, ...updates } : f)))
  }

  const handleDeleteField = (id: string, e: React.MouseEvent): void => {
    e.stopPropagation()
    setFields((prev) => prev.filter((f) => f.id !== id))
    if (activeFieldId === id) {
      setActiveFieldId(null)
    }
  }

  const handleCopyJson = (): void => {
    navigator.clipboard.writeText(JSON.stringify(fields, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl animate-in fade-in duration-300">
      {/* ÜST TOOLBAR */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950/80 border-b border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-850 transition-colors cursor-pointer"
            title="Şablon Listesine Dön"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white flex items-center gap-2">
                Form Builder v2 Oyun Alanı (Playground)
              </h1>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white uppercase tracking-wider">
                v2 Sandbox
              </span>
            </div>
            <p className="text-xs text-slate-400">
              C# Controller Mantığında Kamu Alımları & Şablon Form Motoru — Sürükle, Bırak ve Sırala
            </p>
          </div>
        </div>

        {/* MOD DEĞİŞTİRİCİ (Tasarım ↔ Önizleme ↔ JSON) */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setMode('design')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mode === 'design'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Tasarım Modu</span>
          </button>

          <button
            onClick={() => setMode('preview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mode === 'preview'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Canlı Form Testi</span>
          </button>

          <button
            onClick={() => setMode('json')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mode === 'json'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>JSON Şema</span>
          </button>
        </div>
      </div>

      {/* İÇERİK ALANI */}
      {mode === 'design' && (
        <div className="flex-1 min-h-0 grid grid-cols-12 overflow-hidden">
          {/* 1. SOL: KAMU ALIMI KONTROLÖRLERİ & BİLEŞEN PALETİ */}
          <div className="col-span-3 bg-slate-950/40 border-r border-slate-800/80 p-4 overflow-y-auto space-y-5">
            <div>
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-2.5">
                <Briefcase className="w-4 h-4 text-amber-400" /> Kamu Alım Kontrolörleri
              </h2>
              <div className="space-y-1.5">
                {PRESET_CONTROLLERS.map((preset) => (
                  <button
                    key={preset.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData(
                        'application/json',
                        JSON.stringify({ isPreset: true, presetId: preset.id })
                      )
                    }}
                    onClick={() => handleAddPresetController(preset)}
                    className="w-full flex items-start justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 hover:bg-amber-500/10 text-slate-300 hover:text-white text-xs text-left transition-all cursor-grab active:cursor-grabbing group"
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{preset.name}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-1">
                        {preset.description}
                      </p>
                    </div>
                    <GripVertical className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 shrink-0 mt-0.5" />
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2.5">
                <Layers className="w-4 h-4 text-blue-400" /> Temel Form Elemanları
              </h2>

              <div className="space-y-1.5">
                {[
                  {
                    type: 'text' as const,
                    label: 'Tek Satır Metin',
                    icon: AlignLeft,
                    color: 'text-blue-400'
                  },
                  {
                    type: 'textarea' as const,
                    label: 'Çok Satırlı Metin',
                    icon: AlignLeft,
                    color: 'text-sky-400'
                  },
                  {
                    type: 'money' as const,
                    label: 'Para Birimi (₺ Tutar)',
                    icon: DollarSign,
                    color: 'text-emerald-400'
                  },
                  {
                    type: 'date' as const,
                    label: 'Tarih Seçici',
                    icon: Calendar,
                    color: 'text-indigo-400'
                  },
                  {
                    type: 'select' as const,
                    label: 'Açılır Liste (Select)',
                    icon: ListFilter,
                    color: 'text-purple-400'
                  },
                  {
                    type: 'checkbox' as const,
                    label: 'Onay Kutusu (Checkbox)',
                    icon: CheckSquare,
                    color: 'text-amber-400'
                  },
                  {
                    type: 'table' as const,
                    label: 'Dinamik Kalem Tablosu',
                    icon: Grid,
                    color: 'text-rose-400'
                  },
                  {
                    type: 'signature' as const,
                    label: 'İmza / Komisyon Bloğu',
                    icon: Users,
                    color: 'text-teal-400'
                  }
                ].map((item) => {
                  const IconComp = item.icon
                  return (
                    <button
                      key={item.type}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData(
                          'application/json',
                          JSON.stringify({ isPaletteItem: true, fieldType: item.type })
                        )
                      }}
                      onClick={() => handleAddField(item.type)}
                      className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 hover:bg-blue-500/10 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-grab active:cursor-grabbing group"
                    >
                      <div className="flex items-center gap-2">
                        <IconComp
                          className={`w-3.5 h-3.5 ${item.color} group-hover:scale-110 transition-transform`}
                        />
                        <span>{item.label}</span>
                      </div>
                      <GripVertical className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400" />
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* 2. ORTA: CANVAS & TASARIM SAHNESİ */}
          <div
            className="col-span-6 p-6 overflow-y-auto bg-slate-900/40"
            onDragOver={(e) => {
              e.preventDefault()
              e.dataTransfer.dropEffect = 'move'
            }}
            onDrop={(e) => {
              e.preventDefault()
              const rawData = e.dataTransfer.getData('application/json')
              if (!rawData) return
              try {
                const parsed = JSON.parse(rawData)
                if (parsed.isPreset && parsed.presetId) {
                  const preset = PRESET_CONTROLLERS.find((p) => p.id === parsed.presetId)
                  if (preset) handleAddPresetController(preset)
                } else if (parsed.isPaletteItem && parsed.fieldType) {
                  handleAddField(parsed.fieldType)
                }
              } catch {
                // ignore
              }
            }}
          >
            <div className="max-w-2xl mx-auto space-y-3">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Form Tuvali ({fields.length} Alan) — Sürükle ve Sırala
                </span>
                <button
                  onClick={() => setFields(INITIAL_FIELDS)}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Varsayılana Sıfırla
                </button>
              </div>

              {fields.map((field, idx) => {
                const isSelected = field.id === activeFieldId
                const isDragTarget = dragOverIndex === idx
                return (
                  <div
                    key={field.id}
                    draggable
                    onDragStart={(e) => {
                      setDraggedIndex(idx)
                      e.dataTransfer.setData(
                        'application/json',
                        JSON.stringify({ isPaletteItem: false, index: idx })
                      )
                    }}
                    onDragOver={(e) => {
                      e.preventDefault()
                      if (dragOverIndex !== idx) setDragOverIndex(idx)
                    }}
                    onDragLeave={() => {
                      if (dragOverIndex === idx) setDragOverIndex(null)
                    }}
                    onDragEnd={() => {
                      setDraggedIndex(null)
                      setDragOverIndex(null)
                    }}
                    onDrop={(e) => {
                      e.preventDefault()
                      setDragOverIndex(null)
                      const rawData = e.dataTransfer.getData('application/json')
                      if (!rawData) return
                      try {
                        const parsed = JSON.parse(rawData)
                        if (parsed.isPreset && parsed.presetId) {
                          const preset = PRESET_CONTROLLERS.find((p) => p.id === parsed.presetId)
                          if (preset) handleAddPresetController(preset, idx + 1)
                        } else if (parsed.isPaletteItem && parsed.fieldType) {
                          handleAddField(parsed.fieldType, idx + 1)
                        } else if (typeof parsed.index === 'number') {
                          handleMoveField(parsed.index, idx)
                        }
                      } catch {
                        if (draggedIndex !== null && draggedIndex !== idx) {
                          handleMoveField(draggedIndex, idx)
                        }
                      }
                      setDraggedIndex(null)
                    }}
                    onClick={() => setActiveFieldId(field.id)}
                    className={`group relative p-4 rounded-xl border transition-all cursor-pointer ${
                      isDragTarget
                        ? 'border-emerald-400 bg-emerald-500/10 shadow-lg scale-[1.01]'
                        : isSelected
                          ? 'bg-slate-850 border-blue-500 shadow-lg ring-2 ring-blue-500/20'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-slate-500 group-hover:text-blue-400 cursor-grab active:cursor-grabbing shrink-0" />
                        <span className="text-xs font-bold text-white">{field.label}</span>
                        {field.required && (
                          <span className="text-red-400 text-xs font-bold">*</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-blue-400 font-semibold mr-1">
                          {`{${field.variableName}}`}
                        </span>

                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={(e) => handleMoveUp(idx, e)}
                          className="p-1 text-slate-500 hover:text-white disabled:opacity-30 disabled:hover:text-slate-500 hover:bg-slate-800 rounded transition-colors"
                          title="Yukarı Taşı"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          disabled={idx === fields.length - 1}
                          onClick={(e) => handleMoveDown(idx, e)}
                          className="p-1 text-slate-500 hover:text-white disabled:opacity-30 disabled:hover:text-slate-500 hover:bg-slate-800 rounded transition-colors"
                          title="Aşağı Taşı"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={(e) => handleDeleteField(field.id, e)}
                          className="p-1 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"
                          title="Alanı Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Pre-render mockup */}
                    <div className="mt-2 pointer-events-none opacity-80">
                      {field.type === 'textarea' ? (
                        <div className="h-14 bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-500">
                          {field.placeholder || 'Paragraf açıklaması...'}
                        </div>
                      ) : field.type === 'select' ? (
                        <div className="h-9 bg-slate-900 border border-slate-800 rounded-lg px-3 flex items-center justify-between text-xs text-slate-400">
                          <span>{field.options?.[0] || 'Seçiniz...'}</span>
                          <span>▼</span>
                        </div>
                      ) : field.type === 'signature' ? (
                        <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg text-center text-xs text-slate-400 font-mono">
                          [ İMZA VE KOMİSYON ÜYELERİ TABLOSU MODÜLÜ ]
                        </div>
                      ) : field.type === 'table' ? (
                        <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg text-center text-xs text-slate-400 font-mono">
                          [ DİNAMİK MALZEME / HİZMET KALEMLERİ TABLOSU ]
                        </div>
                      ) : (
                        <div className="h-9 bg-slate-900 border border-slate-800 rounded-lg px-3 flex items-center text-xs text-slate-500">
                          {field.placeholder || `${field.label} değeri...`}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 3. SAĞ: ALAN AYARLARI DENETÇİSİ (FIELD INSPECTOR) */}
          <div className="col-span-3 bg-slate-950/40 border-l border-slate-800/80 p-4 overflow-y-auto">
            {activeField ? (
              <div className="space-y-4">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-4">
                  <Settings className="w-4 h-4 text-blue-400" /> Alan Özellikleri
                </h2>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Alan Etiketi (Başlık)
                  </label>
                  <input
                    type="text"
                    value={activeField.label}
                    onChange={(e) => handleUpdateActiveField({ label: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Sistem Değişken Adı (Tag)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs text-slate-500 font-mono">
                      {'{'}
                    </span>
                    <input
                      type="text"
                      value={activeField.variableName}
                      onChange={(e) =>
                        handleUpdateActiveField({
                          variableName: e.target.value.toLowerCase().replace(/\s+/g, '_')
                        })
                      }
                      className="w-full pl-6 pr-6 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-blue-400 font-mono focus:outline-none focus:border-blue-500"
                    />
                    <span className="absolute right-3 top-2 text-xs text-slate-500 font-mono">
                      {'}'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Şablonda {`{${activeField.variableName}}`} etiketiyle otomatik basılır.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Placeholder (İpucu İfadesi)
                  </label>
                  <input
                    type="text"
                    value={activeField.placeholder || ''}
                    onChange={(e) => handleUpdateActiveField({ placeholder: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={activeField.required}
                      onChange={(e) => handleUpdateActiveField({ required: e.target.checked })}
                      className="rounded border-slate-800 bg-slate-900 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs font-semibold text-slate-300">
                      Bu Alan Zorunlu Mu?
                    </span>
                  </label>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 font-medium">
                Düzenlemek için bir alana tıklayın.
              </div>
            )}
          </div>
        </div>
      )}

      {/* CANLI FORM TESTİ (PREVIEW) */}
      {mode === 'preview' && (
        <div className="flex-1 p-8 overflow-y-auto bg-slate-950/60">
          <div className="max-w-xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white">Form Builder v2 — Canlı Test</h3>
                <p className="text-xs text-slate-400">
                  Form verisi doldurulduğunda otomatik üretilen JSON çıktısını test edin.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-1">
                <Play className="w-3 h-3 fill-current" /> Aktif Simülatör
              </span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                alert('Form başarıyla doğrulandı ve gönderildi!')
              }}
              className="space-y-4"
            >
              {fields.map((f) => (
                <div key={f.id} className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    {f.label} {f.required && <span className="text-red-400">*</span>}
                  </label>
                  {f.type === 'textarea' ? (
                    <textarea
                      required={f.required}
                      placeholder={f.placeholder}
                      value={formData[f.variableName] || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, [f.variableName]: e.target.value })
                      }
                      rows={3}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  ) : f.type === 'select' ? (
                    <select
                      required={f.required}
                      value={formData[f.variableName] || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, [f.variableName]: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      {f.options?.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={f.type === 'date' ? 'date' : 'text'}
                      required={f.required}
                      placeholder={f.placeholder}
                      value={formData[f.variableName] || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, [f.variableName]: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  )}
                </div>
              ))}

              <button
                type="submit"
                className="w-full mt-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20 cursor-pointer"
              >
                Form Verisini Doğrula ve Kaydet
              </button>
            </form>
          </div>
        </div>
      )}

      {/* JSON ŞEMA KODU (JSON SCHEME) */}
      {mode === 'json' && (
        <div className="flex-1 p-6 overflow-y-auto bg-slate-950/80 font-mono relative">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Form Builder v2 JSON Şema Çıktısı
            </span>
            <button
              onClick={handleCopyJson}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-sans font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Kopyalandı!' : 'Şemayı Kopyala'}</span>
            </button>
          </div>
          <pre className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs text-purple-300 overflow-x-auto">
            {JSON.stringify(fields, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

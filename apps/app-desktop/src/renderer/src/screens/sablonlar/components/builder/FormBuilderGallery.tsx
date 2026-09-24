import React from 'react'
import {
  SlidersHorizontal,
  Search,
  Grid,
  Building,
  AlignJustify,
  Users,
  Type,
  DollarSign,
  Calendar,
  AlignLeft,
  ListFilter,
  GripVertical,
  Layers,
  Plus
} from 'lucide-react'
import { FormFieldType, PresetController } from '../../types/formBuilder.types'

interface FormBuilderGalleryProps {
  toolboxSearch: string
  onSearchChange: (query: string) => void
  onOpenNewComponentModal: () => void
  onAddField: (type: FormFieldType) => void
  allPresets: PresetController[]
  onAddPreset: (preset: PresetController) => void
}

export const FormBuilderGallery: React.FC<FormBuilderGalleryProps> = ({
  toolboxSearch,
  onSearchChange,
  onOpenNewComponentModal,
  onAddField,
  allPresets,
  onAddPreset
}) => {
  const basicTools = [
    {
      type: 'header' as FormFieldType,
      label: 'Kurum Antet & Logolar',
      icon: Building,
      color: 'text-indigo-500 dark:text-indigo-400'
    },
    {
      type: 'paragraph' as FormFieldType,
      label: 'Gerekçe & Metin Bloğu',
      icon: AlignJustify,
      color: 'text-blue-500 dark:text-blue-400'
    },
    {
      type: 'table' as FormFieldType,
      label: 'İhale Mal/Hizmet Tablosu',
      icon: Grid,
      color: 'text-amber-500 dark:text-amber-400'
    },
    {
      type: 'signature' as FormFieldType,
      label: 'İmza & Onay Heyeti',
      icon: Users,
      color: 'text-emerald-500 dark:text-emerald-400'
    },
    {
      type: 'text' as FormFieldType,
      label: 'Tek Satır Metin Alanı',
      icon: Type,
      color: 'text-slate-500 dark:text-slate-400'
    },
    {
      type: 'money' as FormFieldType,
      label: 'Para Tutarı (₺) Alanı',
      icon: DollarSign,
      color: 'text-teal-500 dark:text-teal-400'
    },
    {
      type: 'date' as FormFieldType,
      label: 'Resmi Tarih Seçici',
      icon: Calendar,
      color: 'text-orange-500 dark:text-orange-400'
    },
    {
      type: 'textarea' as FormFieldType,
      label: 'Geniş Açıklama & Not',
      icon: AlignLeft,
      color: 'text-purple-500 dark:text-purple-400'
    },
    {
      type: 'select' as FormFieldType,
      label: 'Açılır Seçim Listesi',
      icon: ListFilter,
      color: 'text-violet-500 dark:text-violet-400'
    }
  ]

  const filteredBasicTools = basicTools.filter((t) =>
    t.label.toLowerCase().includes(toolboxSearch.toLowerCase())
  )

  const filteredPresets = allPresets.filter((p) =>
    p.name.toLowerCase().includes(toolboxSearch.toLowerCase())
  )

  return (
    <div className="w-72 bg-slate-50/90 dark:bg-slate-950/90 border-r border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden transition-all shrink-0">
      {/* Galeri Başlığı & Arama */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-800 space-y-2 bg-white dark:bg-slate-900/40">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            Bileşen Galerisi
          </span>
          <button
            type="button"
            onClick={onOpenNewComponentModal}
            className="text-[10px] px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-600/30 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-200 dark:border-blue-500/30 font-bold transition-colors cursor-pointer"
          >
            + Özel Bileşen
          </button>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-2.5 top-2" />
          <input
            type="text"
            placeholder="Bileşenlerde ara..."
            value={toolboxSearch}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Bileşen Listesi */}
      <div className="flex-1 p-3 overflow-y-auto space-y-4 font-sans text-xs">
        {/* Grup 1: Standart İdari Bileşenler */}
        <div>
          <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1 font-mono">
            <Grid className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            Standart Bileşenler ({filteredBasicTools.length})
          </div>
          <div className="space-y-1">
            {filteredBasicTools.map((tool) => {
              const IconComp = tool.icon
              return (
                <button
                  key={tool.type}
                  type="button"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData(
                      'application/json',
                      JSON.stringify({ isPaletteItem: true, fieldType: tool.type })
                    )
                  }}
                  onClick={() => onAddField(tool.type)}
                  className="w-full flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500/50 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-grab active:cursor-grabbing group shadow-xs"
                >
                  <div className="flex items-center gap-2">
                    <IconComp
                      className={`w-3.5 h-3.5 ${tool.color} group-hover:scale-110 transition-transform`}
                    />
                    <span className="font-medium text-xs">{tool.label}</span>
                  </div>
                  <GripVertical className="w-3 h-3 text-slate-400 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-400" />
                </button>
              )
            })}
          </div>
        </div>

        {/* Grup 2: Hazır Kamu Belge Şablonları */}
        <div>
          <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1 font-mono">
            <Layers className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            Hazır Kamu Blokları ({filteredPresets.length})
          </div>
          <div className="space-y-1">
            {filteredPresets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData(
                    'application/json',
                    JSON.stringify({ isPreset: true, presetId: preset.id })
                  )
                }}
                onClick={() => onAddPreset(preset)}
                className="w-full text-left p-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500/50 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-grab active:cursor-grabbing group shadow-xs"
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {preset.name}
                  </span>
                  <Plus className="w-3 h-3 text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                  {preset.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

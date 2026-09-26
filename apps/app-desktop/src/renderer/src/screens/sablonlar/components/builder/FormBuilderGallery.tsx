import React, { useState } from 'react'
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
  Plus,
  Minus,
  FileSpreadsheet,
  CheckSquare,
  CircleDot,
  Columns,
  Sparkles
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

type GalleryCategory = 'all' | 'layout' | 'input' | 'official' | 'preset'

export const FormBuilderGallery: React.FC<FormBuilderGalleryProps> = ({
  toolboxSearch,
  onSearchChange,
  onOpenNewComponentModal,
  onAddField,
  allPresets,
  onAddPreset
}) => {
  const [selectedCategory, setSelectedCategory] = useState<GalleryCategory>('all')

  const layoutTools = [
    {
      type: 'grid' as FormFieldType,
      label: 'Kolon / Grid Düzeni',
      desc: 'Yan yana 2-3-4 kolonlu alan düzeni',
      icon: Columns,
      color: 'text-sky-500 dark:text-sky-400'
    },
    {
      type: 'table' as FormFieldType,
      label: 'İhale Mal/Hizmet Tablosu',
      desc: 'Dinamik hesaplama ve kalem matrisi',
      icon: Grid,
      color: 'text-amber-500 dark:text-amber-400'
    },
    {
      type: 'header' as FormFieldType,
      label: 'Kurum Antet & Logolar',
      desc: 'Çift logo ve resmi idare anteti',
      icon: Building,
      color: 'text-indigo-500 dark:text-indigo-400'
    },
    {
      type: 'divider' as FormFieldType,
      label: 'Sayfa Bölücü Çizgi',
      desc: 'Görsel ayırıcı çizgi ve boşluk',
      icon: Minus,
      color: 'text-slate-500 dark:text-slate-400'
    },
    {
      type: 'page_break' as FormFieldType,
      label: 'Sayfa Sonu (Kesme)',
      desc: 'Baskıda sonraki sayfaya geçiş noktası',
      icon: FileSpreadsheet,
      color: 'text-rose-500 dark:text-rose-400'
    }
  ]

  const inputTools = [
    {
      type: 'text' as FormFieldType,
      label: 'Tek Satır Metin Alanı',
      desc: 'Kısa başlık, ad veya kod girişi',
      icon: Type,
      color: 'text-blue-500 dark:text-blue-400'
    },
    {
      type: 'textarea' as FormFieldType,
      label: 'Geniş Açıklama & Not',
      desc: 'Çok satırlı detaylı metin alanı',
      icon: AlignLeft,
      color: 'text-purple-500 dark:text-purple-400'
    },
    {
      type: 'money' as FormFieldType,
      label: 'Para Tutarı (₺) Alanı',
      desc: 'Para birimi ve otomatik format',
      icon: DollarSign,
      color: 'text-teal-500 dark:text-teal-400'
    },
    {
      type: 'date' as FormFieldType,
      label: 'Resmi Tarih Seçici',
      desc: 'Gün/Ay/Yıl takvim seçici',
      icon: Calendar,
      color: 'text-orange-500 dark:text-orange-400'
    },
    {
      type: 'select' as FormFieldType,
      label: 'Açılır Seçim Listesi (Select)',
      desc: 'Önceden tanımlı açılır liste',
      icon: ListFilter,
      color: 'text-violet-500 dark:text-violet-400'
    },
    {
      type: 'checkbox' as FormFieldType,
      label: 'Onay Kutusu (Checkbox)',
      desc: 'Evet/Hayır veya çoklu seçim',
      icon: CheckSquare,
      color: 'text-emerald-500 dark:text-emerald-400'
    },
    {
      type: 'radio' as FormFieldType,
      label: 'Tekli Seçim (Radyo Buton)',
      desc: 'Birbirini dışlayan tekli opsiyonlar',
      icon: CircleDot,
      color: 'text-pink-500 dark:text-pink-400'
    }
  ]

  const officialTools = [
    {
      type: 'signature' as FormFieldType,
      label: 'İmza & Onay Heyeti',
      desc: 'Komisyon üyeleri veya Olur makamı',
      icon: Users,
      color: 'text-emerald-500 dark:text-emerald-400'
    },
    {
      type: 'paragraph' as FormFieldType,
      label: 'Gerekçe & Mevzuat Metni',
      desc: 'Resmi kanun maddesi ve gerekçe',
      icon: AlignJustify,
      color: 'text-blue-500 dark:text-blue-400'
    }
  ]

  const filterList = <T extends { label?: string; name?: string; desc?: string; description?: string }>(
    list: T[]
  ): T[] => {
    if (!toolboxSearch) return list
    const q = toolboxSearch.toLowerCase()
    return list.filter((item) => {
      const name = (item.label || item.name || '').toLowerCase()
      const desc = (item.desc || item.description || '').toLowerCase()
      return name.includes(q) || desc.includes(q)
    })
  }

  const filteredLayout = filterList(layoutTools)
  const filteredInput = filterList(inputTools)
  const filteredOfficial = filterList(officialTools)
  const filteredPresets = filterList(allPresets)

  const categories: { id: GalleryCategory; label: string; count: number }[] = [
    {
      id: 'all',
      label: 'Tümü',
      count:
        filteredLayout.length +
        filteredInput.length +
        filteredOfficial.length +
        filteredPresets.length
    },
    { id: 'layout', label: 'Düzen', count: filteredLayout.length },
    { id: 'input', label: 'Girişler', count: filteredInput.length },
    { id: 'official', label: 'İdari', count: filteredOfficial.length },
    { id: 'preset', label: 'Hazır Blok', count: filteredPresets.length }
  ]

  return (
    <div className="w-80 bg-slate-50/90 dark:bg-slate-950/90 border-r border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden transition-all shrink-0 select-none">
      {/* Galeri Başlığı & Arama */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-800 space-y-2.5 bg-white dark:bg-slate-900/40">
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
            placeholder="Bileşen veya şablon ara..."
            value={toolboxSearch}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Kategori Filtre Butonları */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2 py-1 rounded-md text-[10.5px] font-semibold shrink-0 transition-all cursor-pointer flex items-center gap-1 ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[9px] px-1 rounded-full ${
                  selectedCategory === cat.id
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Bileşen Listesi */}
      <div className="flex-1 p-3 overflow-y-auto space-y-4 font-sans text-xs">
        {/* Grup 1: Düzen & Yapı Blokları */}
        {(selectedCategory === 'all' || selectedCategory === 'layout') &&
          filteredLayout.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between font-mono">
                <span className="flex items-center gap-1">
                  <Columns className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                  Düzen & Yapı Blokları
                </span>
                <span className="text-[9px] text-slate-400">{filteredLayout.length}</span>
              </div>
              <div className="space-y-1.5">
                {filteredLayout.map((tool) => {
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
                      <div className="flex items-start gap-2 overflow-hidden text-left">
                        <IconComp
                          className={`w-4 h-4 ${tool.color} group-hover:scale-110 transition-transform shrink-0 mt-0.5`}
                        />
                        <div className="truncate">
                          <div className="font-semibold text-xs text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                            {tool.label}
                          </div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 line-clamp-1 font-normal">
                            {tool.desc}
                          </div>
                        </div>
                      </div>
                      <GripVertical className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-400 shrink-0 ml-1" />
                    </button>
                  )
                })}
              </div>
            </div>
          )}

        {/* Grup 2: Giriş & Form Bileşenleri */}
        {(selectedCategory === 'all' || selectedCategory === 'input') &&
          filteredInput.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between font-mono">
                <span className="flex items-center gap-1">
                  <Grid className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  Form & Giriş Alanları
                </span>
                <span className="text-[9px] text-slate-400">{filteredInput.length}</span>
              </div>
              <div className="space-y-1.5">
                {filteredInput.map((tool) => {
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
                      <div className="flex items-start gap-2 overflow-hidden text-left">
                        <IconComp
                          className={`w-4 h-4 ${tool.color} group-hover:scale-110 transition-transform shrink-0 mt-0.5`}
                        />
                        <div className="truncate">
                          <div className="font-semibold text-xs text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                            {tool.label}
                          </div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 line-clamp-1 font-normal">
                            {tool.desc}
                          </div>
                        </div>
                      </div>
                      <GripVertical className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-400 shrink-0 ml-1" />
                    </button>
                  )
                })}
              </div>
            </div>
          )}

        {/* Grup 3: İdari & Resmi Bloklar */}
        {(selectedCategory === 'all' || selectedCategory === 'official') &&
          filteredOfficial.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between font-mono">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                  İdari & Onay Blokları
                </span>
                <span className="text-[9px] text-slate-400">{filteredOfficial.length}</span>
              </div>
              <div className="space-y-1.5">
                {filteredOfficial.map((tool) => {
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
                      <div className="flex items-start gap-2 overflow-hidden text-left">
                        <IconComp
                          className={`w-4 h-4 ${tool.color} group-hover:scale-110 transition-transform shrink-0 mt-0.5`}
                        />
                        <div className="truncate">
                          <div className="font-semibold text-xs text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                            {tool.label}
                          </div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 line-clamp-1 font-normal">
                            {tool.desc}
                          </div>
                        </div>
                      </div>
                      <GripVertical className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-400 shrink-0 ml-1" />
                    </button>
                  )
                })}
              </div>
            </div>
          )}

        {/* Grup 4: Hazır Kamu Belge Şablonları */}
        {(selectedCategory === 'all' || selectedCategory === 'preset') &&
          filteredPresets.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between font-mono">
                <span className="flex items-center gap-1">
                  <Layers className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  Hazır Kamu Blokları
                </span>
                <span className="text-[9px] text-slate-400">{filteredPresets.length}</span>
              </div>
              <div className="space-y-1.5">
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
                    className="w-full text-left p-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500/50 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-grab active:cursor-grabbing group shadow-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                        {preset.name}
                      </span>
                      <Plus className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 shrink-0" />
                    </div>
                    <p className="text-[10.5px] text-slate-500 dark:text-slate-400 line-clamp-2 font-normal">
                      {preset.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
      </div>
    </div>
  )
}


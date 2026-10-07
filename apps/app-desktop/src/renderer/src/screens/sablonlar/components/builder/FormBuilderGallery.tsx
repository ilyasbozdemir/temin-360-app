import React, { useState, useMemo } from 'react'
import {
  SlidersHorizontal,
  Search,
  Grid,
  GripVertical,
  Layers,
  Plus,
  Columns,
  Sparkles,
  Users,
  SearchX,
  LucideIcon
} from 'lucide-react'
import { FormFieldType, PresetController } from '../../types/formBuilder.types'
import {
  LAYOUT_TOOLS,
  INPUT_TOOLS,
  OFFICIAL_TOOLS,
  GalleryToolItem
} from '../../constants/galleryTools'

interface FormBuilderGalleryProps {
  toolboxSearch: string
  onSearchChange: (query: string) => void
  onOpenNewComponentModal: () => void
  onAddField: (type: FormFieldType) => void
  allPresets: PresetController[]
  onAddPreset: (preset: PresetController) => void
}

type GalleryCategory = 'all' | 'layout' | 'input' | 'official' | 'preset'

interface GallerySectionConfig {
  id: GalleryCategory
  title: string
  icon: LucideIcon
  iconColor: string
  items: GalleryToolItem[]
}

const PaletteItem: React.FC<{
  tool: GalleryToolItem
  onAdd: (type: FormFieldType) => void
}> = ({ tool, onAdd }) => {
  const IconComp = tool.icon
  return (
    <button
      type="button"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'copy'
        e.dataTransfer.setData(
          'application/json',
          JSON.stringify({
            kind: 'field',
            fieldType: tool.type,
            isPaletteItem: true // Geriye uyumluluk fallback
          })
        )
      }}
      onClick={() => onAdd(tool.type)}
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
}

export const FormBuilderGallery: React.FC<FormBuilderGalleryProps> = ({
  toolboxSearch,
  onSearchChange,
  onOpenNewComponentModal,
  onAddField,
  allPresets,
  onAddPreset
}) => {
  const [selectedCategory, setSelectedCategory] = useState<GalleryCategory>('all')

  const filterList = <
    T extends { label?: string; name?: string; desc?: string; description?: string }
  >(
    list: readonly T[] | T[]
  ): T[] => {
    if (!toolboxSearch.trim()) return [...list]
    const q = toolboxSearch.toLocaleLowerCase('tr-TR')
    return list.filter((item) => {
      const name = (item.label || item.name || '').toLocaleLowerCase('tr-TR')
      const desc = (item.desc || item.description || '').toLocaleLowerCase('tr-TR')
      return name.includes(q) || desc.includes(q)
    })
  }

  const filteredLayout = useMemo(() => filterList(LAYOUT_TOOLS), [toolboxSearch])
  const filteredInput = useMemo(() => filterList(INPUT_TOOLS), [toolboxSearch])
  const filteredOfficial = useMemo(() => filterList(OFFICIAL_TOOLS), [toolboxSearch])
  const filteredPresets = useMemo(() => filterList(allPresets), [toolboxSearch, allPresets])

  const SECTIONS: GallerySectionConfig[] = useMemo(
    () => [
      {
        id: 'layout',
        title: 'Düzen & Yapı Blokları',
        icon: Columns,
        iconColor: 'text-sky-600 dark:text-sky-400',
        items: filteredLayout
      },
      {
        id: 'input',
        title: 'Form & Giriş Alanları',
        icon: Grid,
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        items: filteredInput
      },
      {
        id: 'official',
        title: 'İdari & Onay Blokları',
        icon: Users,
        iconColor: 'text-indigo-600 dark:text-indigo-400',
        items: filteredOfficial
      }
    ],
    [filteredLayout, filteredInput, filteredOfficial]
  )

  const totalFilteredCount = useMemo(
    () =>
      filteredLayout.length +
      filteredInput.length +
      filteredOfficial.length +
      filteredPresets.length,
    [
      filteredLayout.length,
      filteredInput.length,
      filteredOfficial.length,
      filteredPresets.length
    ]
  )

  const categories = useMemo(
    () => [
      {
        id: 'all' as GalleryCategory,
        label: 'Tümü',
        count: totalFilteredCount
      },
      { id: 'layout' as GalleryCategory, label: 'Düzen', count: filteredLayout.length },
      { id: 'input' as GalleryCategory, label: 'Girişler', count: filteredInput.length },
      { id: 'official' as GalleryCategory, label: 'İdari', count: filteredOfficial.length },
      { id: 'preset' as GalleryCategory, label: 'Hazır Blok', count: filteredPresets.length }
    ],
    [
      totalFilteredCount,
      filteredLayout.length,
      filteredInput.length,
      filteredOfficial.length,
      filteredPresets.length
    ]
  )

  const currentCategoryHasItems = useMemo(() => {
    if (selectedCategory === 'all') return totalFilteredCount > 0
    if (selectedCategory === 'layout') return filteredLayout.length > 0
    if (selectedCategory === 'input') return filteredInput.length > 0
    if (selectedCategory === 'official') return filteredOfficial.length > 0
    if (selectedCategory === 'preset') return filteredPresets.length > 0
    return false
  }, [
    selectedCategory,
    totalFilteredCount,
    filteredLayout.length,
    filteredInput.length,
    filteredOfficial.length,
    filteredPresets.length
  ])

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
        {/* Boş Durum (Empty State) Mesajı */}
        {!currentCategoryHasItems && (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
              <SearchX className="w-5 h-5 text-slate-400 dark:text-slate-500" />
            </div>
            <p className="font-semibold text-xs text-slate-700 dark:text-slate-300 mb-1">
              Sonuç Bulunamadı
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-[200px]">
              {toolboxSearch
                ? `"${toolboxSearch}" ile eşleşen bileşen veya şablon bulunamadı.`
                : 'Bu kategoride henüz bileşen bulunmuyor.'}
            </p>
          </div>
        )}

        {/* Standart Araç Grupları (DRY Loop) */}
        {SECTIONS.map((sec) => {
          if (
            (selectedCategory !== 'all' && selectedCategory !== sec.id) ||
            sec.items.length === 0
          ) {
            return null
          }

          const SecIcon = sec.icon
          return (
            <div key={sec.id}>
              <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between font-mono">
                <span className="flex items-center gap-1">
                  <SecIcon className={`w-3 h-3 ${sec.iconColor}`} />
                  {sec.title}
                </span>
                <span className="text-[9px] text-slate-400">{sec.items.length}</span>
              </div>
              <div className="space-y-1.5">
                {sec.items.map((tool) => (
                  <PaletteItem key={tool.type} tool={tool} onAdd={onAddField} />
                ))}
              </div>
            </div>
          )
        })}

        {/* Grup 4: Hazır Kamu Belge Şablonları (Presets) */}
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
                      e.dataTransfer.effectAllowed = 'copy'
                      e.dataTransfer.setData(
                        'application/json',
                        JSON.stringify({
                          kind: 'preset',
                          presetId: preset.id,
                          isPreset: true // Geriye uyumluluk fallback
                        })
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

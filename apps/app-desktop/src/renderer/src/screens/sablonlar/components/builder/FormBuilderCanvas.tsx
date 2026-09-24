import React, { useState } from 'react'
import {
  FolderOpen,
  Tag,
  Check,
  X,
  Plus,
  GripVertical,
  CopyPlus,
  ChevronUp,
  ChevronDown,
  Trash2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify
} from 'lucide-react'
import {
  FormFieldV2,
  FormFieldType,
  PresetController,
  DocumentSettings,
  TableRowItem
} from '../../types/formBuilder.types'

interface FormBuilderCanvasProps {
  fields: FormFieldV2[]
  activeFieldId: string | null
  onSelectField: (id: string) => void
  selectedTab: string
  onSelectTab: (tab: string) => void
  availableTabs: string[]
  isAddingNewTab: boolean
  onSetIsAddingNewTab: (val: boolean) => void
  newTabNameInput: string
  onNewTabNameInputChange: (val: string) => void
  onCreateNewTab: () => void
  docSettings: DocumentSettings
  formData: Record<string, string>
  onDuplicateField: (id: string, e: React.MouseEvent) => void
  onMoveUp: (index: number, e: React.MouseEvent) => void
  onMoveDown: (index: number, e: React.MouseEvent) => void
  onDeleteField: (id: string, e: React.MouseEvent) => void
  onMoveField: (from: number, to: number) => void
  onAddField: (type: FormFieldType, insertAtIndex?: number) => void
  onAddPreset: (preset: PresetController, insertAtIndex?: number) => void
  allPresets: PresetController[]
}

export const FormBuilderCanvas: React.FC<FormBuilderCanvasProps> = ({
  fields,
  activeFieldId,
  onSelectField,
  selectedTab,
  onSelectTab,
  availableTabs,
  isAddingNewTab,
  onSetIsAddingNewTab,
  newTabNameInput,
  onNewTabNameInputChange,
  onCreateNewTab,
  docSettings,
  formData,
  onDuplicateField,
  onMoveUp,
  onMoveDown,
  onDeleteField,
  onMoveField,
  onAddField,
  onAddPreset,
  allPresets
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const filteredFields =
    selectedTab === 'Tümü'
      ? fields
      : fields.filter((f) => (f.tabName || 'Genel Bilgiler') === selectedTab)

  const getPageDimensions = (): { width: string; minHeight: string } => {
    const isA3 = docSettings.pageSize === 'A3'
    const isLandscape = docSettings.orientation === 'landscape'

    if (isA3) {
      return isLandscape
        ? { width: '420mm', minHeight: '297mm' }
        : { width: '297mm', minHeight: '420mm' }
    }
    return isLandscape
      ? { width: '297mm', minHeight: '210mm' }
      : { width: '210mm', minHeight: '297mm' }
  }

  const getPagePadding = (): string => {
    switch (docSettings.margins) {
      case 'compact':
        return '1.2cm 1cm'
      case 'wide':
        return '2.5cm 2.2cm'
      case 'normal':
      default:
        return '1.8cm 1.5cm'
    }
  }

  const calculateTableTotal = (rows?: TableRowItem[]): number => {
    if (!rows || rows.length === 0) return 0
    return rows.reduce((acc, r) => {
      const top =
        typeof r.toplamFiyat === 'number' ? r.toplamFiyat : parseFloat(String(r.toplamFiyat)) || 0
      return acc + top
    }, 0)
  }

  const getTextAlignClass = (align?: 'left' | 'center' | 'right' | 'justify'): string => {
    switch (align) {
      case 'center':
        return 'text-center'
      case 'right':
        return 'text-right'
      case 'justify':
        return 'text-justify'
      case 'left':
      default:
        return 'text-left'
    }
  }

  const getWidthClass = (width?: '100%' | '50%' | '33%' | '25%'): string => {
    switch (width) {
      case '50%':
        return 'w-full md:w-[calc(50%-6px)] inline-block'
      case '33%':
        return 'w-full md:w-[calc(33.33%-8px)] inline-block'
      case '25%':
        return 'w-full md:w-[calc(25%-9px)] inline-block'
      case '100%':
      default:
        return 'w-full'
    }
  }

  return (
    <div className="flex-1 bg-slate-100 dark:bg-slate-950 flex flex-col overflow-hidden relative transition-colors">
      {/* Sekmeler Şeridi */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-xs overflow-x-auto select-none transition-colors">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mr-1 flex items-center gap-1">
            <FolderOpen className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            Sekmeler:
          </span>

          {/* 'Tümü' Sekmesi */}
          <button
            type="button"
            onClick={() => onSelectTab('Tümü')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedTab === 'Tümü'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <span>Tümü</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-black/20 dark:bg-black/40 text-white">
              {fields.length}
            </span>
          </button>

          {/* Kullanıcı / Şablon Sekmeleri */}
          {availableTabs.map((tab) => {
            const count = fields.filter((f) => (f.tabName || 'Genel Bilgiler') === tab).length
            const isTabActive = selectedTab === tab

            return (
              <button
                key={tab}
                type="button"
                onClick={() => onSelectTab(tab)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isTabActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Tag className="w-2.5 h-2.5 opacity-70" />
                <span>{tab}</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-black/20 dark:bg-black/40 text-white">
                  {count}
                </span>
              </button>
            )
          })}

          {/* Yeni Sekme Ekleme Girişi */}
          {isAddingNewTab ? (
            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-0.5 rounded-lg border border-blue-500 shadow-xs animate-in fade-in">
              <input
                type="text"
                placeholder="Sekme Adı..."
                value={newTabNameInput}
                onChange={(e) => onNewTabNameInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onCreateNewTab()
                  if (e.key === 'Escape') onSetIsAddingNewTab(false)
                }}
                autoFocus
                className="px-1.5 py-0.5 text-xs text-slate-800 dark:text-white bg-transparent focus:outline-none w-28 font-medium"
              />
              <button
                type="button"
                onClick={onCreateNewTab}
                className="p-1 bg-blue-600 hover:bg-blue-500 text-white rounded cursor-pointer transition-colors"
                title="Kaydet"
              >
                <Check className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => onSetIsAddingNewTab(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer transition-colors"
                title="İptal"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onSetIsAddingNewTab(true)}
              className="p-1 px-2 text-xs text-blue-600 dark:text-blue-400 hover:text-white hover:bg-blue-600 rounded-lg border border-dashed border-blue-300 dark:border-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
              title="Yeni Sekme Ekle"
            >
              <Plus className="w-3 h-3" />
              <span className="text-[11px] font-medium">Yeni Sekme</span>
            </button>
          )}
        </div>
      </div>

      {/* GERÇEK BELGE KAĞIDI TUVALİ */}
      <div
        className={`flex-1 p-8 overflow-y-auto flex justify-center items-start ${
          docSettings.showGrid
            ? 'bg-[radial-gradient(#94a3b8_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] bg-size-[16px_16px] bg-slate-200/60 dark:bg-slate-950'
            : 'bg-slate-200/60 dark:bg-slate-950'
        }`}
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
              const preset = allPresets.find((p) => p.id === parsed.presetId)
              if (preset) onAddPreset(preset)
            } else if (parsed.isPaletteItem && parsed.fieldType) {
              onAddField(parsed.fieldType)
            }
          } catch {
            // ignore
          }
        }}
      >
        {/* A4 / A3 FORM KAĞIDI */}
        <div
          style={{
            ...getPageDimensions(),
            padding: getPagePadding(),
            transform: `scale(${docSettings.zoom / 100})`,
            transformOrigin: 'top center'
          }}
          className="bg-white text-slate-900 shadow-2xl border border-slate-300 dark:border-slate-700 rounded-xs transition-all relative font-serif text-[10pt] leading-normal min-h-[297mm]"
        >
          {/* Kağıt Üst Başlığı */}
          <div className="flex items-center justify-between pb-2 mb-4 border-b border-slate-200 text-[10px] font-sans text-slate-400 select-none">
            <span className="font-bold uppercase tracking-wider text-slate-600 font-mono">
              {docSettings.pageSize} Sayfa Tuvali (
              {docSettings.orientation === 'portrait' ? 'Dikey' : 'Yatay'}) —{' '}
              {selectedTab === 'Tümü'
                ? `Tüm Bloklar (${fields.length})`
                : `Sekme: "${selectedTab}" (${filteredFields.length})`}
            </span>
            <span className="text-slate-400 font-mono text-[9px]">
              Temin360 Resmi Belge Sistemi
            </span>
          </div>

          {/* BELGE BİLEŞEN BLOKLARI (Flex Wrap Layout) */}
          <div className="flex flex-wrap gap-2.5 items-start">
            {filteredFields.map((field, idx) => {
              const isSelected = field.id === activeFieldId
              const isDragTarget = dragOverIndex === idx
              const globalIdx = fields.findIndex((f) => f.id === field.id)

              return (
                <div
                  key={field.id}
                  draggable
                  onDragStart={(e) => {
                    setDraggedIndex(globalIdx)
                    e.dataTransfer.setData(
                      'application/json',
                      JSON.stringify({ isPaletteItem: false, index: globalIdx })
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
                        const preset = allPresets.find((p) => p.id === parsed.presetId)
                        if (preset) onAddPreset(preset, globalIdx + 1)
                      } else if (parsed.isPaletteItem && parsed.fieldType) {
                        onAddField(parsed.fieldType, globalIdx + 1)
                      } else if (typeof parsed.index === 'number') {
                        onMoveField(parsed.index, globalIdx)
                      }
                    } catch {
                      if (draggedIndex !== null && draggedIndex !== globalIdx) {
                        onMoveField(draggedIndex, globalIdx)
                      }
                    }
                    setDraggedIndex(null)
                  }}
                  onClick={() => onSelectField(field.id)}
                  className={`group relative p-3 rounded-lg border transition-all cursor-pointer select-none ${getWidthClass(
                    field.width
                  )} ${
                    isDragTarget
                      ? 'border-emerald-500 bg-emerald-50/60 shadow-lg ring-2 ring-emerald-400'
                      : isSelected
                        ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/40 shadow-lg'
                        : 'border-slate-200 hover:border-slate-400 bg-slate-50/30'
                  }`}
                >
                  {/* Seçim Köşe Noktaları */}
                  {isSelected && (
                    <>
                      <span className="absolute -top-1 -left-1 w-2 h-2 bg-blue-600 border border-white rounded-xs shadow-xs" />
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 border border-white rounded-xs shadow-xs" />
                      <span className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-600 border border-white rounded-xs shadow-xs" />
                      <span className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-600 border border-white rounded-xs shadow-xs" />
                    </>
                  )}

                  {/* Kontrol Çubuğu */}
                  <div className="flex items-center justify-between mb-2 font-sans opacity-75 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <GripVertical className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 cursor-grab active:cursor-grabbing shrink-0" />
                      <span className="text-[11px] font-bold text-slate-800 truncate">
                        {field.label}
                      </span>
                      {field.required && <span className="text-red-500 font-bold">*</span>}
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-mono font-semibold shrink-0">
                        {field.tabName || 'Genel Bilgiler'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {/* Hizalama ikonu */}
                      {field.textAlign && field.textAlign !== 'left' && (
                        <span className="text-slate-400 p-0.5" title={`Hizalama: ${field.textAlign}`}>
                          {field.textAlign === 'center' && <AlignCenter className="w-3 h-3" />}
                          {field.textAlign === 'right' && <AlignRight className="w-3 h-3" />}
                          {field.textAlign === 'justify' && <AlignJustify className="w-3 h-3" />}
                        </span>
                      )}
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-200 text-blue-800 font-semibold">
                        {`{${field.variableName}}`}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => onDuplicateField(field.id, e)}
                        className="p-1 text-slate-500 hover:text-blue-600 hover:bg-slate-200 rounded cursor-pointer"
                        title="Bileşeni Çoğalt"
                      >
                        <CopyPlus className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        disabled={globalIdx === 0}
                        onClick={(e) => onMoveUp(globalIdx, e)}
                        className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-20 hover:bg-slate-200 rounded cursor-pointer"
                        title="Yukarı Taşı"
                      >
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        disabled={globalIdx === fields.length - 1}
                        onClick={(e) => onMoveDown(globalIdx, e)}
                        className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-20 hover:bg-slate-200 rounded cursor-pointer"
                        title="Aşağı Taşı"
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => onDeleteField(field.id, e)}
                        className="p-1 text-slate-500 hover:text-red-600 hover:bg-slate-200 rounded cursor-pointer"
                        title="Alanı Sil"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Gerçek Belge Görseli Render */}
                  <div
                    className={`pointer-events-none ${getTextAlignClass(field.textAlign)} ${
                      field.fontWeight === 'bold' ? 'font-bold' : ''
                    } ${field.fontStyle === 'italic' ? 'italic' : ''}`}
                  >
                    {field.type === 'header' ? (
                      <div className="flex items-center justify-between border-b-2 border-slate-800 pb-2 text-center">
                        {field.headerLeftLogo && (
                          <div className="w-16 h-14 border border-dashed border-slate-300 rounded flex items-center justify-center text-[8pt] text-slate-400 shrink-0">
                            [Sol Logo]
                          </div>
                        )}
                        <div className="font-bold text-center px-4 leading-tight flex-1">
                          <div className="text-[11pt]">
                            {field.headerInstitution || 'T.C. İÇİŞLERİ BAKANLIĞI'}
                          </div>
                          <div className="text-[10pt]">
                            {field.headerDepartment || 'Destek Hizmetleri Dairesi Başkanlığı'}
                          </div>
                        </div>
                        {field.headerRightLogo && (
                          <div className="w-16 h-14 border border-dashed border-slate-300 rounded flex items-center justify-center text-[8pt] text-slate-400 shrink-0">
                            [Sağ Logo]
                          </div>
                        )}
                      </div>
                    ) : field.type === 'paragraph' ? (
                      <div
                        className={`text-[9.5pt] leading-relaxed text-slate-800 bg-slate-50/50 p-2 border border-slate-200 rounded ${
                          field.indent ? 'indent-6' : ''
                        } ${getTextAlignClass(field.textAlign)}`}
                      >
                        {field.staticContent || 'Resmi gerekçe veya yasal dayanak metni...'}
                      </div>
                    ) : field.type === 'table' ? (
                      <div className="border border-slate-800 text-[8.5pt]">
                        <div className="grid grid-cols-7 bg-slate-100 font-bold border-b border-slate-800 text-center py-1">
                          <div>Sıra</div>
                          <div className="col-span-3 text-left px-2">Mal/Hizmet Adı</div>
                          <div>Miktar</div>
                          <div>Birim</div>
                          <div>Birim Fiyat</div>
                        </div>
                        {field.tableRows && field.tableRows.length > 0 ? (
                          field.tableRows.map((row) => (
                            <div
                              key={row.id}
                              className="grid grid-cols-7 text-center py-1 border-b border-slate-200"
                            >
                              <div>{row.sira}</div>
                              <div className="col-span-3 text-left px-2 font-medium">{row.ad}</div>
                              <div>{row.miktar}</div>
                              <div>{row.birim}</div>
                              <div className="text-right px-2 font-mono">
                                {Number(row.birimFiyat).toLocaleString('tr-TR', {
                                  minimumFractionDigits: 2
                                })}{' '}
                                ₺
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-2 text-center text-slate-400 italic text-[8pt]">
                            Henüz satır eklenmedi. Sağ panelden satır ekleyin.
                          </div>
                        )}
                        <div className="bg-slate-50 text-right font-bold py-1 px-3 border-t border-slate-800 flex justify-between">
                          <span>Toplam Kalem Sayısı: {field.tableRows?.length || 0}</span>
                          <span>
                            Toplam Tutar:{' '}
                            {calculateTableTotal(field.tableRows).toLocaleString('tr-TR', {
                              minimumFractionDigits: 2
                            })}{' '}
                            ₺
                          </span>
                        </div>
                      </div>
                    ) : field.type === 'signature' ? (
                      <div className="pt-2">
                        {field.signatureType === 'olur' ? (
                          <div className="w-48 ml-auto text-center space-y-1 p-2 border border-dashed border-slate-300 rounded">
                            <div className="font-bold text-slate-800 text-[9pt]">O L U R</div>
                            <div className="text-[8pt] text-slate-500">24.09.2026</div>
                            <div className="font-bold text-slate-900 pt-2">
                              {field.signatureMembers?.[0]?.adSoyad || 'Mustafa ÖZTÜRK'}
                            </div>
                            <div className="text-slate-600 text-[8pt]">
                              {field.signatureMembers?.[0]?.unvan || 'Daire Başkanı'}
                            </div>
                            <div className="text-slate-400 text-[8pt] italic">[ İmza / Mühür ]</div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-center pt-2 text-[9pt]">
                            {field.signatureMembers && field.signatureMembers.length > 0 ? (
                              field.signatureMembers.map((member) => (
                                <div
                                  key={member.id}
                                  className="space-y-0.5 p-2 bg-slate-50/50 border border-slate-200 rounded"
                                >
                                  <div className="font-bold text-slate-900">{member.adSoyad}</div>
                                  <div className="text-slate-600 text-[8pt]">{member.unvan}</div>
                                  <div className="text-slate-400 text-[7.5pt] uppercase font-semibold">
                                    {member.gorev}
                                  </div>
                                  <div className="text-slate-300 text-[7.5pt] italic pt-1">
                                    [ İmza ]
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="col-span-3 text-center text-slate-400 italic text-[8pt]">
                                İmza üyesi eklenmedi. Sağ panelden üye ekleyin.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div
                        className={`flex items-center gap-2 text-[9.5pt] bg-slate-50 p-2 border border-slate-200 rounded ${getTextAlignClass(
                          field.textAlign
                        )}`}
                      >
                        <span className="font-bold text-slate-700">{field.label}:</span>
                        <span className="text-slate-900 font-medium text-[9pt]">
                          {formData[field.variableName] ||
                            field.defaultValue ||
                            field.placeholder ||
                            `[${field.variableName} verisi]`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

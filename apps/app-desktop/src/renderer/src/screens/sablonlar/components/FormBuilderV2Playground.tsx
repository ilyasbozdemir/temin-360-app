import React, { useState, useId } from 'react'
import { CheckCircle2 } from 'lucide-react'
import {
  FormFieldV2,
  FormFieldType,
  FormBuilderMode,
  PresetController,
  DocumentSettings,
  TableRowItem,
  SignatureMemberItem
} from '../types/formBuilder.types'
import { INITIAL_FIELDS, TYPE_LABELS, PRESET_CONTROLLERS } from '../constants/formBuilder.constants'
import {
  FormBuilderHeader,
  FormBuilderGallery,
  FormBuilderCanvas,
  FormBuilderInspector,
  FormBuilderStatusBar,
  FormBuilderPreview,
  FormBuilderJsonExport,
  NewComponentModal
} from './builder'

export type { FormFieldV2 }

export function FormBuilderV2Playground({ onBack }: { onBack: () => void }): React.JSX.Element {
  const baseId = useId()
  const [fields, setFields] = useState<FormFieldV2[]>(INITIAL_FIELDS)
  const [customPresets, setCustomPresets] = useState<PresetController[]>([])
  const [activeFieldId, setActiveFieldId] = useState<string | null>('f-1')
  const [activeInspectorTab, setActiveInspectorTab] = useState<'properties' | 'data' | 'format'>('data')
  const [mode, setMode] = useState<FormBuilderMode>('design')
  const [copied, setCopied] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isNewComponentModalOpen, setIsNewComponentModalOpen] = useState(false)
  const [toolboxSearch, setToolboxSearch] = useState('')

  // Sidebar Açık/Kapalı Durumları
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true)
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true)

  // Sekmeler / Bölümler (Tab Names) State
  const [availableTabs, setAvailableTabs] = useState<string[]>([
    'Genel Bilgiler',
    'Maliyet & Teklifler',
    'Onay & İmzalar'
  ])
  const [selectedTab, setSelectedTab] = useState<string>('Tümü')
  const [isAddingNewTab, setIsAddingNewTab] = useState(false)
  const [newTabNameInput, setNewTabNameInput] = useState('')

  // Yeni özel bileşen formu state
  const [newCompName, setNewCompName] = useState('')
  const [newCompType, setNewCompType] = useState<FormFieldType>('text')
  const [newCompTab, setNewCompTab] = useState('Genel Bilgiler')
  const [newCompDesc, setNewCompDesc] = useState('')
  const [newCompContent, setNewCompContent] = useState('')

  // Belge / Sayfa Düzeni Ayarları
  const [docSettings, setDocSettings] = useState<DocumentSettings>({
    pageSize: 'A4',
    orientation: 'portrait',
    margins: 'normal',
    zoom: 100,
    showGrid: true
  })

  // Canlı Test Mock Verisi
  const [formData, setFormData] = useState<Record<string, string>>({
    antet_bilgisi: 'T.C. İÇİŞLERİ BAKANLIĞI - Destek Hizmetleri Dairesi Başkanlığı',
    evrak_bilgileri: 'Sayı: E-74389201-934.01-1029 | Tarih: 24.09.2026',
    isin_aciklamasi: 'Bilgisayar, Donanım ve Kırtasiye Malzemesi Alımı İşi',
    muhatap_firma: 'ABC Teknoloji San. ve Tic. Ltd. Şti.',
    gerekce_metni:
      '4734 sayılı Kamu İhale Kanununun ilgili maddesi uyarınca doğrudan temin usulüyle yapılması planlanan alım için piyasa araştırması yapılmış ve yaklaşık maliyet cetveli tanzim edilmiştir.',
    yaklasik_maliyet: '242.500,00 ₺'
  })

  const showToast = (msg: string): void => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 3000)
  }

  const activeField = fields.find((f) => f.id === activeFieldId)
  const allPresets = [...customPresets, ...PRESET_CONTROLLERS]

  const handleCreateNewTab = (): void => {
    const trimmed = newTabNameInput.trim()
    if (!trimmed) return
    if (!availableTabs.includes(trimmed)) {
      setAvailableTabs((prev) => [...prev, trimmed])
      setSelectedTab(trimmed)
      showToast(`"${trimmed}" sekmesi oluşturuldu!`)
    }
    setNewTabNameInput('')
    setIsAddingNewTab(false)
  }

  const handleAddField = (type: FormFieldType, insertAtIndex?: number): void => {
    const newId = `f-${baseId}-${fields.length + 1}-${Date.now().toString(36)}`
    const defaultTab = selectedTab === 'Tümü' ? availableTabs[0] || 'Genel Bilgiler' : selectedTab

    const newField: FormFieldV2 = {
      id: newId,
      label: `Yeni ${TYPE_LABELS[type] || 'Bileşen'}`,
      variableName: `alan_${fields.length + 1}`,
      tabName: defaultTab,
      type,
      required: false,
      placeholder: '',
      category: 'custom',
      width: '100%',
      textAlign: 'left',
      headerInstitution: type === 'header' ? 'T.C. İÇİŞLERİ BAKANLIĞI' : undefined,
      headerDepartment: type === 'header' ? 'Destek Hizmetleri Dairesi Başkanlığı' : undefined,
      staticContent:
        type === 'paragraph'
          ? 'Buraya resmi belgenizde yer alacak yasal dayanak, açıklama veya gerekçe metnini yazabilirsiniz...'
          : undefined,
      headerLeftLogo: type === 'header',
      headerRightLogo: type === 'header',
      tableRows:
        type === 'table'
          ? [
              {
                id: 'r-1',
                sira: 1,
                ad: 'Örnek Malzeme / Hizmet Kalemi',
                miktar: 10,
                birim: 'Adet',
                birimFiyat: 1500,
                toplamFiyat: 15000
              }
            ]
          : undefined,
      signatureMembers:
        type === 'signature'
          ? [
              {
                id: 'm-1',
                adSoyad: 'Ahmet YILMAZ',
                unvan: 'Mühendis',
                gorev: 'Komisyon Üyesi'
              },
              {
                id: 'm-2',
                adSoyad: 'Mehmet DEMİR',
                unvan: 'V.H.K.İ.',
                gorev: 'Komisyon Üyesi'
              }
            ]
          : undefined
    }

    if (typeof insertAtIndex === 'number') {
      const next = [...fields]
      next.splice(insertAtIndex, 0, newField)
      setFields(next)
    } else {
      setFields([...fields, newField])
    }
    setActiveFieldId(newId)
    setActiveInspectorTab('data')
  }

  const handleAddPresetController = (preset: PresetController, insertAtIndex?: number): void => {
    const newId = `f-${baseId}-${fields.length + 1}-${Date.now().toString(36)}`
    const defaultTab = selectedTab === 'Tümü' ? availableTabs[0] || 'Genel Bilgiler' : selectedTab

    const newField: FormFieldV2 = {
      id: newId,
      ...preset.defaultField,
      tabName: preset.defaultField.tabName || defaultTab,
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
    setActiveInspectorTab('data')
  }

  const handleDuplicateField = (id: string, e: React.MouseEvent): void => {
    e.stopPropagation()
    const target = fields.find((f) => f.id === id)
    if (!target) return
    const idx = fields.findIndex((f) => f.id === id)
    const newId = `f-${baseId}-${fields.length + 1}-${Date.now().toString(36)}`
    const cloned: FormFieldV2 = {
      ...target,
      id: newId,
      label: `${target.label} (Kopya)`,
      variableName: `${target.variableName}_kopya`
    }
    const next = [...fields]
    next.splice(idx + 1, 0, cloned)
    setFields(next)
    setActiveFieldId(newId)
    showToast('Bileşen çoğaltıldı!')
  }

  const handleCreateCustomComponent = (e: React.FormEvent): void => {
    e.preventDefault()
    if (!newCompName.trim()) return

    const newPreset: PresetController = {
      id: `custom-preset-${Date.now().toString(36)}`,
      name: newCompName.trim(),
      category: 'custom',
      description: newCompDesc.trim() || 'Özel tanımlanmış kullanıcı bileşeni',
      defaultField: {
        label: newCompName.trim(),
        tabName: newCompTab || 'Genel Bilgiler',
        variableName: newCompName
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '_')
          .slice(0, 20),
        type: newCompType,
        required: false,
        category: 'custom',
        staticContent: newCompContent.trim() || undefined
      }
    }

    setCustomPresets((prev) => [newPreset, ...prev])
    handleAddPresetController(newPreset)
    setNewCompName('')
    setNewCompDesc('')
    setNewCompContent('')
    setIsNewComponentModalOpen(false)
    showToast(`"${newPreset.name}" bileşen galerisine eklendi ve forma yerleştirildi!`)
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
    const payload = {
      documentSettings: docSettings,
      tabs: availableTabs,
      components: fields,
      liveDataSample: formData
    }
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2))
    setCopied(true)
    showToast('Belge Şablonu JSON verisi panoya kopyalandı!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSaveTemplateDesign = (): void => {
    showToast('Belge şablonu, bileşenler ve özellikler başarıyla kaydedildi!')
  }

  // Canlı Tablo Satır Yönetimi
  const handleAddTableRow = (): void => {
    if (!activeField || activeField.type !== 'table') return
    const currentRows = activeField.tableRows || []
    const newRow: TableRowItem = {
      id: `r-${currentRows.length + 1}-${Date.now().toString(36)}`,
      sira: currentRows.length + 1,
      ad: 'Yeni Malzeme / Hizmet',
      miktar: 1,
      birim: 'Adet',
      birimFiyat: 1000,
      toplamFiyat: 1000
    }
    handleUpdateActiveField({ tableRows: [...currentRows, newRow] })
  }

  const handleUpdateTableRow = (rowId: string, updates: Partial<TableRowItem>): void => {
    if (!activeField || activeField.type !== 'table' || !activeField.tableRows) return
    const updatedRows = activeField.tableRows.map((r) => {
      if (r.id === rowId) {
        const next = { ...r, ...updates }
        const m = typeof next.miktar === 'number' ? next.miktar : parseFloat(String(next.miktar)) || 0
        const f =
          typeof next.birimFiyat === 'number'
            ? next.birimFiyat
            : parseFloat(String(next.birimFiyat)) || 0
        next.toplamFiyat = m * f
        return next
      }
      return r
    })
    handleUpdateActiveField({ tableRows: updatedRows })
  }

  const handleDeleteTableRow = (rowId: string): void => {
    if (!activeField || activeField.type !== 'table' || !activeField.tableRows) return
    const updatedRows = activeField.tableRows
      .filter((r) => r.id !== rowId)
      .map((r, i) => ({ ...r, sira: i + 1 }))
    handleUpdateActiveField({ tableRows: updatedRows })
  }

  // Canlı İmza Üye Yönetimi
  const handleAddSignatureMember = (): void => {
    if (!activeField || activeField.type !== 'signature') return
    const currentMembers = activeField.signatureMembers || []
    const newMember: SignatureMemberItem = {
      id: `m-${currentMembers.length + 1}-${Date.now().toString(36)}`,
      adSoyad: 'Yeni Görevli',
      unvan: 'Üye',
      gorev: 'Komisyon Üyesi'
    }
    handleUpdateActiveField({ signatureMembers: [...currentMembers, newMember] })
  }

  const handleUpdateSignatureMember = (
    memberId: string,
    updates: Partial<SignatureMemberItem>
  ): void => {
    if (!activeField || activeField.type !== 'signature' || !activeField.signatureMembers) return
    const updatedMembers = activeField.signatureMembers.map((m) =>
      m.id === memberId ? { ...m, ...updates } : m
    )
    handleUpdateActiveField({ signatureMembers: updatedMembers })
  }

  const handleDeleteSignatureMember = (memberId: string): void => {
    if (!activeField || activeField.type !== 'signature' || !activeField.signatureMembers) return
    const updatedMembers = activeField.signatureMembers.filter((m) => m.id !== memberId)
    handleUpdateActiveField({ signatureMembers: updatedMembers })
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl animate-in fade-in duration-300 relative select-none transition-colors">
      {/* TOAST BİLDİRİMİ */}
      {toastMessage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 bg-slate-900/95 dark:bg-slate-950/95 text-white rounded-xl shadow-2xl backdrop-blur-md border border-slate-700 text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. ÜST ARAÇ ÇUBUĞU VE MENÜ */}
      <FormBuilderHeader
        onBack={onBack}
        onReset={() => setFields(INITIAL_FIELDS)}
        docSettings={docSettings}
        onUpdateDocSettings={setDocSettings}
        mode={mode}
        onSetMode={setMode}
        onSave={handleSaveTemplateDesign}
        isLeftSidebarOpen={isLeftSidebarOpen}
        onToggleLeftSidebar={() => setIsLeftSidebarOpen((prev) => !prev)}
        isRightSidebarOpen={isRightSidebarOpen}
        onToggleRightSidebar={() => setIsRightSidebarOpen((prev) => !prev)}
        activeField={activeField}
        onUpdateActiveField={handleUpdateActiveField}
      />

      {/* 2. TASARIM TUVALİ MODU */}
      {mode === 'design' && (
        <>
          <div className="flex-1 flex overflow-hidden">
            {/* Sol Panel: Bileşen Galerisi (Katlanabilir) */}
            {isLeftSidebarOpen && (
              <FormBuilderGallery
                toolboxSearch={toolboxSearch}
                onSearchChange={setToolboxSearch}
                onOpenNewComponentModal={() => setIsNewComponentModalOpen(true)}
                onAddField={handleAddField}
                allPresets={allPresets}
                onAddPreset={handleAddPresetController}
              />
            )}

            {/* Orta Panel: Belge Tuvali (Dinamik Genişlik) */}
            <FormBuilderCanvas
              fields={fields}
              activeFieldId={activeFieldId}
              onSelectField={setActiveFieldId}
              selectedTab={selectedTab}
              onSelectTab={setSelectedTab}
              availableTabs={availableTabs}
              isAddingNewTab={isAddingNewTab}
              onSetIsAddingNewTab={setIsAddingNewTab}
              newTabNameInput={newTabNameInput}
              onNewTabNameInputChange={setNewTabNameInput}
              onCreateNewTab={handleCreateNewTab}
              docSettings={docSettings}
              formData={formData}
              onDuplicateField={handleDuplicateField}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              onDeleteField={handleDeleteField}
              onMoveField={handleMoveField}
              onAddField={handleAddField}
              onAddPreset={handleAddPresetController}
              allPresets={allPresets}
            />

            {/* Sağ Panel: Bileşen Özellikleri & Veri Denetçisi (Katlanabilir) */}
            {isRightSidebarOpen && (
              <FormBuilderInspector
                activeField={activeField}
                activeInspectorTab={activeInspectorTab}
                onSetActiveInspectorTab={setActiveInspectorTab}
                availableTabs={availableTabs}
                formData={formData}
                onUpdateFormData={(key, val) =>
                  setFormData((prev) => ({ ...prev, [key]: val }))
                }
                onUpdateActiveField={handleUpdateActiveField}
                onAddTableRow={handleAddTableRow}
                onUpdateTableRow={handleUpdateTableRow}
                onDeleteTableRow={handleDeleteTableRow}
                onAddSignatureMember={handleAddSignatureMember}
                onUpdateSignatureMember={handleUpdateSignatureMember}
                onDeleteSignatureMember={handleDeleteSignatureMember}
              />
            )}
          </div>

          {/* 3. ALT DURUM ÇUBUĞU */}
          <FormBuilderStatusBar
            activeField={activeField}
            selectedTab={selectedTab}
            totalItems={fields.length}
            pageSize={docSettings.pageSize}
            orientation={docSettings.orientation}
            zoom={docSettings.zoom}
          />
        </>
      )}

      {/* MOD: RESMİ BELGE ÖNİZLEMESİ */}
      {mode === 'preview' && (
        <FormBuilderPreview
          fields={fields}
          docSettings={docSettings}
          formData={formData}
          selectedTab={selectedTab}
        />
      )}

      {/* MOD: JSON ŞEMA ÇIKTISI */}
      {mode === 'json' && (
        <FormBuilderJsonExport
          docSettings={docSettings}
          availableTabs={availableTabs}
          fields={fields}
          formData={formData}
          copied={copied}
          onCopyJson={handleCopyJson}
        />
      )}

      {/* YENİ ÖZEL BİLEŞEN OLUŞTURMA MODALI */}
      <NewComponentModal
        isOpen={isNewComponentModalOpen}
        onClose={() => setIsNewComponentModalOpen(false)}
        onSubmit={handleCreateCustomComponent}
        newCompName={newCompName}
        onNewCompNameChange={setNewCompName}
        newCompTab={newCompTab}
        onNewCompTabChange={setNewCompTab}
        newCompType={newCompType}
        onNewCompTypeChange={setNewCompType}
        newCompDesc={newCompDesc}
        onNewCompDescChange={setNewCompDesc}
        newCompContent={newCompContent}
        onNewCompContentChange={setNewCompContent}
        availableTabs={availableTabs}
      />
    </div>
  )
}

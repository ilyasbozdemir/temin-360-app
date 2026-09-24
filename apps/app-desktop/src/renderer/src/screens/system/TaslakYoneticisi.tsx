import React, { useMemo, useState } from 'react'
import { Star, Trash2 } from 'lucide-react'
import { useSablonlar } from '../sablonlar/sablonlar.hooks'
import { subPagesMapping } from '../../constants/surecler'
import { useWorkspaceStore } from '../../store/workspaceStore'
import { useDosyaAsamasiSablons } from '../dosya/sub-screens/DosyaAsamalari/useDosyaAsamasiSablons'
import { DocumentPreviewModal } from '../dosya/components/DocumentPreviewModal'

// Subcomponents
import { DocumentCard } from './components/DocumentCard'
import { StarredListSorter } from './components/StarredListSorter'
import { DocumentPreset } from './components/PresetSelector'
import { PresetEditor } from './components/PresetEditor'
import { PresetModals } from './components/PresetModals'

// Utilities
import { normalizeForMatch, parseStatusAndName } from './utils/statusUtils'

export default function TaslakYoneticisi(): React.JSX.Element {
  const { data: sablonlar = [] } = useSablonlar()
  const { activeDosyaId, activeStarredDocs, setActiveStarredDocs } = useWorkspaceStore()

  const {
    sablons,
    masterHtml,
    dosyaContext,
    placeholders,
    contextsByPath,
    personelListesi,
    previewModalOpen,
    setPreviewModalOpen,
    previewData,
    handleOpenPreviewForSablon,
    quickPrint,
    quickExport,
    executePrint,
    executeExportPdf,
    executeExportDocx,
    executeExportUdf,
    refreshSnapshot,
    saveSnapshot
  } = useDosyaAsamasiSablons()

  const [activeStage, setActiveStage] = useState<string>('1. İhtiyaç Tespiti & Başlangıç')
  const [isEditing, setIsEditing] = useState<boolean>(false)

  const [presets, setPresets] = useState<DocumentPreset[]>(() => {
    try {
      const saved = localStorage.getItem('dta_document_presets')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [selectedPresetId, setSelectedPresetId] = useState<string>('')

  const [globalStarred, setGlobalStarred] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('global_starred_docs')
      return saved ? JSON.parse(saved) : ['İhtiyaç Listesi', 'Lüzum Müzekkeresi']
    } catch {
      return []
    }
  })

  // Sync active file starred docs from DB on mount/change
  React.useEffect(() => {
    if (!activeDosyaId) return
    window.electron.ipcRenderer
      .invoke('db:query', 'SELECT starred_docs FROM DATA_TeminDosyasi WHERE id = ?', [
        activeDosyaId
      ])
      .then((res) => {
        if (res.success && res.data.length > 0) {
          try {
            const docs = res.data[0].starred_docs ? JSON.parse(res.data[0].starred_docs) : []
            setActiveStarredDocs(docs)
          } catch (e) {
            console.error('Failed to parse active file starred docs:', e)
          }
        }
      })
      .catch((err) => {
        console.error('Failed to query active file starred docs:', err)
      })
  }, [activeDosyaId, setActiveStarredDocs])

  // Listen to external preset or global starred changes (e.g. from document action dropdowns)
  React.useEffect(() => {
    const handlePresetsChange = (): void => {
      try {
        const saved = localStorage.getItem('dta_document_presets')
        setPresets(saved ? JSON.parse(saved) : [])
      } catch (e) {
        console.error(e)
      }
    }
    const handleGlobalChange = (): void => {
      try {
        const saved = localStorage.getItem('global_starred_docs')
        setGlobalStarred(saved ? JSON.parse(saved) : [])
      } catch (e) {
        console.error(e)
      }
    }

    window.addEventListener('dta_presets_changed', handlePresetsChange)
    window.addEventListener('global_starred_changed', handleGlobalChange)
    return () => {
      window.removeEventListener('dta_presets_changed', handlePresetsChange)
      window.removeEventListener('global_starred_changed', handleGlobalChange)
    }
  }, [])

  const starredList = useMemo(() => {
    if (selectedPresetId) {
      const preset = presets.find((p) => p.id === selectedPresetId)
      return preset ? preset.docs : []
    }
    return activeDosyaId ? activeStarredDocs : globalStarred
  }, [selectedPresetId, presets, activeDosyaId, activeStarredDocs, globalStarred])

  const [showAddModal, setShowAddModal] = useState(false)
  const [newPresetName, setNewPresetName] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [presetToDeleteId, setPresetToDeleteId] = useState('')
  const [showCopyModal, setShowCopyModal] = useState(false)

  const otherPresetsDocs = useMemo(() => {
    if (!selectedPresetId) return []
    const allOtherDocsSet = new Set<string>()
    presets.forEach((p) => {
      if (p.id !== selectedPresetId) {
        p.docs.forEach((d) => allOtherDocsSet.add(parseStatusAndName(d).cleanName))
      }
    })
    const activeStarred = activeDosyaId ? activeStarredDocs : globalStarred
    activeStarred.forEach((d) => allOtherDocsSet.add(parseStatusAndName(d).cleanName))

    const currentPreset = presets.find((p) => p.id === selectedPresetId)
    const currentDocsNormalized = new Set(
      (currentPreset?.docs || []).map((d) => normalizeForMatch(parseStatusAndName(d).cleanName))
    )

    return Array.from(allOtherDocsSet).filter(
      (d) => !currentDocsNormalized.has(normalizeForMatch(d))
    )
  }, [presets, selectedPresetId, activeStarredDocs, globalStarred, activeDosyaId])

  const handleCopyDocToCurrentPreset = async (docName: string): Promise<void> => {
    const cleanDocName = parseStatusAndName(docName).cleanName
    const updated = [...starredList, cleanDocName]
    await saveUpdatedStarredList(updated)
  }

  const saveStarred = (updated: string[]): void => {
    setGlobalStarred(updated)
    localStorage.setItem('global_starred_docs', JSON.stringify(updated))
    window.dispatchEvent(new Event('global_starred_changed'))
  }

  const handleAddPreset = (): void => {
    setNewPresetName('')
    setShowAddModal(true)
  }

  const handleAddPresetSubmit = (): void => {
    if (!newPresetName || newPresetName.trim() === '') return
    const newPreset: DocumentPreset = {
      id: Date.now().toString(),
      name: newPresetName.trim(),
      docs: []
    }
    const updated = [...presets, newPreset]
    setPresets(updated)
    localStorage.setItem('dta_document_presets', JSON.stringify(updated))
    setSelectedPresetId(newPreset.id)
    setShowAddModal(false)
    window.dispatchEvent(new Event('dta_presets_changed'))
  }

  const handleDeletePreset = (id: string): void => {
    setPresetToDeleteId(id)
    setShowDeleteModal(true)
  }

  const handleDeletePresetSubmit = (): void => {
    if (!presetToDeleteId) return
    const updated = presets.filter((p) => p.id !== presetToDeleteId)
    setPresets(updated)
    localStorage.setItem('dta_document_presets', JSON.stringify(updated))
    if (selectedPresetId === presetToDeleteId) {
      setSelectedPresetId('')
    }
    setPresetToDeleteId('')
    setShowDeleteModal(false)
    window.dispatchEvent(new Event('dta_presets_changed'))
  }

  const routeMap = useMemo(() => {
    const map: Record<string, string> = {}
    subPagesMapping.forEach((p) => {
      map[p.name] = p.path
    })
    sablonlar.forEach((s) => {
      if (s.route_path) {
        map[s.ad] = s.route_path
        // Also map by cleanName so starred items (stored as clean names) resolve routes
        const { cleanName } = parseStatusAndName(s.ad)
        if (cleanName !== s.ad) {
          map[cleanName] = s.route_path
        }
      }
    })
    return map
  }, [sablonlar])

  const saveUpdatedStarredList = async (updated: string[]): Promise<void> => {
    if (selectedPresetId) {
      const updatedPresets = presets.map((p) => {
        if (p.id === selectedPresetId) {
          return { ...p, docs: updated }
        }
        return p
      })
      setPresets(updatedPresets)
      localStorage.setItem('dta_document_presets', JSON.stringify(updatedPresets))
      window.dispatchEvent(new Event('dta_presets_changed'))
    } else {
      if (activeDosyaId) {
        setActiveStarredDocs(updated)
        await window.electron.ipcRenderer.invoke(
          'db:run',
          'UPDATE DATA_TeminDosyasi SET starred_docs = ? WHERE id = ?',
          [JSON.stringify(updated), activeDosyaId]
        )
      } else {
        saveStarred(updated)
      }
    }
  }

  const toggleStar = async (docName: string): Promise<void> => {
    const cleanTarget = parseStatusAndName(docName).cleanName
    const normalizedTarget = normalizeForMatch(cleanTarget)
    let updated = [...starredList]
    const exists = updated.some(
      (d) => normalizeForMatch(parseStatusAndName(d).cleanName) === normalizedTarget
    )

    if (exists) {
      updated = updated.filter(
        (d) => normalizeForMatch(parseStatusAndName(d).cleanName) !== normalizedTarget
      )
    } else {
      updated.push(cleanTarget)
    }

    await saveUpdatedStarredList(updated)
  }

  const handleCopyToPreset = async (docName: string, presetId: string): Promise<void> => {
    const cleanDocName = parseStatusAndName(docName).cleanName
    const normalizedTarget = normalizeForMatch(cleanDocName)
    const updatedPresets = presets.map((p) => {
      if (p.id === presetId) {
        const exists = p.docs.some(
          (d) => normalizeForMatch(parseStatusAndName(d).cleanName) === normalizedTarget
        )
        if (!exists) {
          return { ...p, docs: [...p.docs, cleanDocName] }
        }
      }
      return p
    })
    setPresets(updatedPresets)
    localStorage.setItem('dta_document_presets', JSON.stringify(updatedPresets))
    window.dispatchEvent(new Event('dta_presets_changed'))
  }

  const moveShortcut = async (index: number, direction: 'up' | 'down'): Promise<void> => {
    const updated = [...starredList]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= updated.length) return

    const temp = updated[index]
    updated[index] = updated[targetIndex]
    updated[targetIndex] = temp

    await saveUpdatedStarredList(updated)
  }

  const groupedSablonlar = useMemo(() => {
    const groups: Record<string, typeof sablonlar> = {
      '1. İhtiyaç Tespiti & Başlangıç': [],
      '2. Teklifler & Piyasa Fiyat Araştırması': [],
      '3. Sipariş & Sözleşme': [],
      '4. Muayene & Kabul & Ödeme İşlemleri': [],
      '5. Klasör & Kapaklar': []
    }

    sablonlar.forEach((s) => {
      const cat = (s.kategori || '').toLowerCase()
      if (cat.includes('1') || cat.includes('ihtiyac') || cat.includes('baslangic')) {
        groups['1. İhtiyaç Tespiti & Başlangıç'].push(s)
      } else if (
        cat.includes('2') ||
        cat.includes('fiyat') ||
        cat.includes('arastirma') ||
        cat.includes('maliyet') ||
        cat.includes('piyasa')
      ) {
        groups['2. Teklifler & Piyasa Fiyat Araştırması'].push(s)
      } else if (
        cat.includes('3') ||
        cat.includes('siparis') ||
        cat.includes('sozlesme') ||
        cat.includes('ihale') ||
        cat.includes('onay')
      ) {
        groups['3. Sipariş & Sözleşme'].push(s)
      } else if (cat.includes('4') || cat.includes('kabul') || cat.includes('odeme')) {
        groups['4. Muayene & Kabul & Ödeme İşlemleri'].push(s)
      } else if (cat.includes('5') || cat.includes('klasor') || cat.includes('kapak')) {
        groups['5. Klasör & Kapaklar'].push(s)
      }
    })

    return groups
  }, [sablonlar])

  const handleAddAllStageDocs = async (): Promise<void> => {
    const list = groupedSablonlar[activeStage] || []
    const updated = [...starredList]
    list.forEach((sablon) => {
      const cleanName = parseStatusAndName(sablon.ad).cleanName
      const normalizedTarget = normalizeForMatch(cleanName)
      const exists = updated.some(
        (d) => normalizeForMatch(parseStatusAndName(d).cleanName) === normalizedTarget
      )
      if (!exists) {
        updated.push(cleanName)
      }
    })
    await saveUpdatedStarredList(updated)
  }

  const handleRemoveAllStageDocs = async (): Promise<void> => {
    const list = groupedSablonlar[activeStage] || []
    const stageNormalizedNames = list.map((s) =>
      normalizeForMatch(parseStatusAndName(s.ad).cleanName)
    )
    const updated = starredList.filter(
      (d) => !stageNormalizedNames.includes(normalizeForMatch(parseStatusAndName(d).cleanName))
    )
    await saveUpdatedStarredList(updated)
  }

  return (
    <div className="p-8 max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-3">
            <Star className="w-8 h-8 text-amber-500 fill-amber-500 animate-pulse" />
            Hızlı Erişim Paneli
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm max-w-2xl">
            Sık kullandığınız belge şablonlarını yıldızlayarak hızlı erişim listesine ekleyin.
            Yıldızladığınız belgeler sol panelde ve menülerde görünecektir.
          </p>
        </div>

        {/* Üst Preset Seçici ve Kontrolleri */}
        <div className="flex items-center gap-2.5 shrink-0 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
          <div className="flex flex-col text-left">
            <span className="text-[9px] uppercase font-bold text-slate-450 dark:text-slate-500 tracking-wider mb-0.5 ml-1">
              Aktif Paket / Hızlı Erişim
            </span>
            <select
              value={selectedPresetId}
              onChange={(e) => setSelectedPresetId(e.target.value)}
              className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-1.5 px-3 text-xs text-slate-700 dark:text-slate-350 font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[200px] h-9"
            >
              {presets.map((p) => (
                <option key={p.id} value={p.id}>
                  📦 {p.name} ({p.docs.length} Belge)
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end gap-1.5 h-full self-end mb-[1px]">
            <button
              onClick={handleAddPreset}
              className="h-9 px-3 rounded-xl text-xs font-bold transition-all bg-blue-650 hover:bg-blue-700 text-white flex items-center gap-1 shadow-sm cursor-pointer whitespace-nowrap"
              title="Yeni Paket Ekle"
            >
              + Yeni Paket
            </button>
            {selectedPresetId && (
              <button
                onClick={() => handleDeletePreset(selectedPresetId)}
                className="h-9 w-9 rounded-xl text-xs font-bold transition-all border border-rose-200 dark:border-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-955/30 text-rose-500 flex items-center justify-center cursor-pointer shrink-0"
                title="Paketi Sil"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sol Panel: Genel Yıldızlı Kısayollar */}
          <div className="lg:col-span-1 space-y-4">
            <StarredListSorter
              starredList={starredList}
              routeMap={routeMap}
              moveShortcut={moveShortcut}
              toggleStar={toggleStar}
            />
          </div>

          {/* Sağ Panel: Süreç Belgeleri Listesi */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              {!isEditing ? (
                // --- PAKET İÇERİĞİ GÖSTERİM MODU ---
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div>
                      <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        📦{' '}
                        {selectedPresetId
                          ? presets.find((p) => p.id === selectedPresetId)?.name
                          : 'Genel Hızlı Erişim'}
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Bu paketin sahip olduğu tüm süreç belgeleri aşağıda listelenmiştir.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedPresetId && (
                        <button
                          onClick={() => setShowCopyModal(true)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-slate-100 hover:bg-slate-205 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-750 dark:text-slate-250 flex items-center gap-1.5 shadow-2xs border border-slate-200 dark:border-slate-700 cursor-pointer"
                        >
                          📋 Diğerlerinden Kopyala
                        </button>
                      )}
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        ✍️ Belgeleri Seç / Düzenle
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {starredList.map((docName: string) => {
                      const normalizedDocName = normalizeForMatch(docName)
                      const sablon =
                        sablons.find(
                          (s) =>
                            normalizeForMatch(s.ad) === normalizedDocName ||
                            normalizeForMatch(parseStatusAndName(s.ad).cleanName) ===
                              normalizedDocName
                        ) ||
                        sablonlar.find(
                          (s) =>
                            normalizeForMatch(s.ad) === normalizedDocName ||
                            normalizeForMatch(parseStatusAndName(s.ad).cleanName) ===
                              normalizedDocName
                        )
                      const route = routeMap[docName]
                      const { status, cleanName } = parseStatusAndName(
                        docName,
                        sablon ? sablon.aciklama : undefined
                      )
                      return (
                        <DocumentCard
                          key={docName}
                          sablon={sablon}
                          route={route}
                          status={status}
                          cleanName={cleanName}
                          onPreview={() => sablon && handleOpenPreviewForSablon(sablon, cleanName)}
                          onQuickPrint={() => sablon && quickPrint(sablon)}
                          onQuickExport={(fmt) => sablon && quickExport(sablon, fmt)}
                          onToggleStar={() => toggleStar(docName)}
                          presets={presets}
                          onCopyToPreset={(presetId) => handleCopyToPreset(docName, presetId)}
                        />
                      )
                    })}

                    {starredList.length === 0 && (
                      <div className="text-center py-10 px-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                          Bu pakette henüz hiç belge bulunmuyor.
                        </p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-550 mb-4">
                          Sol taraftaki veya yukarıdaki butona tıklayarak belge eklemeye
                          başlayabilirsiniz.
                        </p>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer"
                        >
                          + Belge Ekle
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <PresetEditor
                  presetName={
                    selectedPresetId
                      ? presets.find((p) => p.id === selectedPresetId)?.name || ''
                      : 'Genel Hızlı Erişim'
                  }
                  activeStage={activeStage}
                  setActiveStage={setActiveStage}
                  groupedSablonlar={groupedSablonlar}
                  starredList={starredList}
                  routeMap={routeMap}
                  toggleStar={toggleStar}
                  onAddAllStageDocs={handleAddAllStageDocs}
                  onRemoveAllStageDocs={handleRemoveAllStageDocs}
                  onCloseEdit={() => setIsEditing(false)}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <PresetModals
        showAddModal={showAddModal}
        newPresetName={newPresetName}
        setNewPresetName={setNewPresetName}
        onAddCancel={() => setShowAddModal(false)}
        onAddSubmit={handleAddPresetSubmit}
        showDeleteModal={showDeleteModal}
        onDeleteCancel={() => {
          setShowDeleteModal(false)
          setPresetToDeleteId('')
        }}
        onDeleteSubmit={handleDeletePresetSubmit}
      />

      {/* Diğer Paketlerden Kopyala Modal */}
      {showCopyModal && selectedPresetId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh] text-left">
            <h3 className="text-lg font-extrabold text-slate-850 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              📋 Diğerlerinden Kopyala
            </h3>
            <p className="text-xs text-slate-500 mt-2">
              Diğer paketlerinizde veya genel hızlı erişim listenizde olan ama bu pakette bulunmayan
              belgeleri aşağıdan seçip kopyalayabilirsiniz.
            </p>

            <div className="flex-1 overflow-y-auto my-4 space-y-2 pr-1">
              {otherPresetsDocs.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-6">
                  Kopyalanacak yeni bir belge bulunamadı.
                </p>
              ) : (
                otherPresetsDocs.map((docName) => (
                  <div
                    key={docName}
                    className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-105 dark:border-slate-850 rounded-xl gap-3"
                  >
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                      {docName}
                    </span>
                    <button
                      onClick={() => handleCopyDocToCurrentPreset(docName)}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-extrabold transition-all cursor-pointer shrink-0"
                    >
                      + Ekle
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowCopyModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {previewData && previewModalOpen && (
        <DocumentPreviewModal
          isOpen={previewModalOpen}
          onClose={() => setPreviewModalOpen(false)}
          title={previewData.title}
          templateHtml={previewData.templateHtml}
          masterHtml={masterHtml || ''}
          baseContext={
            previewData.snapshotContext || contextsByPath[previewData.processPath] || dosyaContext
          }
          placeholders={placeholders}
          personelListesi={personelListesi}
          onPrint={executePrint}
          onExportPdf={executeExportPdf}
          onExportDocx={executeExportDocx}
          onExportUdf={executeExportUdf}
          isStarred={starredList.some(
            (d) => normalizeForMatch(d) === normalizeForMatch(previewData.title || '')
          )}
          onToggleStar={() => previewData?.title && toggleStar(previewData.title)}
          isInline={false}
          templateTestVerisi={previewData.templateTestVerisi}
          dosyaAdi={previewData.dosyaAdi}
          onRefreshSnapshot={refreshSnapshot}
          onSaveSnapshot={saveSnapshot}
        />
      )}
    </div>
  )
}

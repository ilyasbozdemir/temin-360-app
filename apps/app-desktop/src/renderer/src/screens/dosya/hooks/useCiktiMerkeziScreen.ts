import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Mustache from 'mustache'
import { useRouterState } from '@tanstack/react-router'
import { useWorkspaceStore } from '../../../store/workspaceStore'
import { useDocumentLogger } from '../../../hooks/useDocumentLogger'
import { usePrintQueueStore } from '../../../store/printQueueStore'
import { useGlobalDocumentPreviewStore } from '../../../store/globalDocumentPreviewStore'
import { exportDogrudanTeminMasterExcel } from '../../../services/excelExportService'
import { buildBatchZipFileName, buildExportFileName } from '../../../utils/exportFileName'
import { SABLON_DOSYAADI_KATEGORI } from '../../../constants/sablonKategorileri'
import { Sablon } from '../../sablonlar/sablonlar.hooks'
import { useCiktiMerkeziData } from '../CiktiMerkezi.hooks'
import { StatusFilterType } from '../components/CiktiStatusFilterTabs'
import { ToastInfo } from '../components/CiktiToast'

export const normalizeForMatch = (str: string): string => {
  return str
    .toLocaleLowerCase('tr-TR')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/i̇/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]/g, '')
}

export const getSablonGroup = (sablon: Sablon): string => {
  if (sablon.kategori) return sablon.kategori
  const dosyaAdiNoExt = (sablon.dosya_adi || '').replace(/\.html$/, '')
  return SABLON_DOSYAADI_KATEGORI[dosyaAdiNoExt] || 'Genel'
}

export interface DocumentPreset {
  id: string
  name: string
  docs: string[]
}

export function useCiktiMerkeziScreen() {
  const { activeDosyaId, activeStarredDocs, setActiveStarredDocs } = useWorkspaceStore()
  const { sablons, loading, masterHtml, dosyaContext, activeDosya, contextsByPath } =
    useCiktiMerkeziData(activeDosyaId)
  const { logDocument } = useDocumentLogger()
  const {
    getReadyCountForDosya,
    getPrintedCountForDosya,
    getDocumentStatus,
    toggleReadyToPrint,
    markAsPrinted,
    isDocumentLocked,
    getDocumentLockInfo,
    unlockDocument
  } = usePrintQueueStore()
  const { openDocument } = useGlobalDocumentPreviewStore()

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [processing, setProcessing] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [isPrintManagerOpen, setIsPrintManagerOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('all')
  const [toast, setToast] = useState<ToastInfo | null>(null)

  const readyCount = getReadyCountForDosya(activeDosyaId)
  const printedCount = getPrintedCountForDosya(activeDosyaId)

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
      setToast({ message, type })
      setTimeout(() => setToast(null), 4000)
    },
    []
  )

  const router = useRouterState()
  const searchSablonAd = (router.location.search as any)?.sablonAd

  const [presets, setPresets] = useState<DocumentPreset[]>(() => {
    try {
      const saved = localStorage.getItem('dta_document_presets')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [activePresetId, setActivePresetId] = useState<string>('')

  const handleSelectPreset = (presetId: string): void => {
    setActivePresetId(presetId)
    if (!presetId) {
      setSelectedIds(new Set())
      return
    }
    const preset = presets.find((p) => p.id === presetId)
    if (preset) {
      const ids = new Set<number>()
      sablons.forEach((s) => {
        if (preset.docs.some((docAd) => normalizeForMatch(docAd) === normalizeForMatch(s.ad))) {
          ids.add(s.id)
        }
      })
      setSelectedIds(ids)
      showToast(`'${preset.name}' paketi seçildi. (${ids.size} belge)`, 'success')
    }
  }

  const handleSavePreset = (): void => {
    if (selectedIds.size === 0) {
      showToast('Lütfen paket oluşturmak için önce en az bir belge seçin.', 'warning')
      return
    }
    const name = prompt('Lütfen bu belge paketi taslağı için bir isim girin:')
    if (!name || name.trim() === '') return

    const selectedDocs = sablons.filter((s) => selectedIds.has(s.id)).map((s) => s.ad)
    const newPreset: DocumentPreset = {
      id: Date.now().toString(),
      name: name.trim(),
      docs: selectedDocs
    }
    const updated = [...presets, newPreset]
    setPresets(updated)
    localStorage.setItem('dta_document_presets', JSON.stringify(updated))
    setActivePresetId(newPreset.id)
    showToast(`'${newPreset.name}' paketi kaydedildi.`, 'success')
  }

  const handleDeletePreset = (presetId: string, e: React.MouseEvent): void => {
    e.stopPropagation()
    const preset = presets.find((p) => p.id === presetId)
    if (!preset) return
    if (!confirm(`'${preset.name}' paketini silmek istediğinize emin misiniz?`)) {
      return
    }

    const updated = presets.filter((p) => p.id !== presetId)
    setPresets(updated)
    localStorage.setItem('dta_document_presets', JSON.stringify(updated))
    if (activePresetId === presetId) {
      setActivePresetId('')
      setSelectedIds(new Set())
    }
    showToast(`'${preset.name}' paketi silindi.`, 'success')
  }

  useEffect(() => {
    if (activeDosya?.starred_docs) {
      try {
        const docs = JSON.parse(activeDosya.starred_docs)
        setActiveStarredDocs(docs)
      } catch (_e) {
        setActiveStarredDocs([])
      }
    } else {
      setActiveStarredDocs([])
    }
  }, [activeDosya?.starred_docs, setActiveStarredDocs])

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      if (activeDosyaId) {
        const res = await window.electron.ipcRenderer.invoke(
          'db:query',
          'SELECT starred_docs FROM DATA_TeminDosyasi WHERE id = ?',
          [activeDosyaId]
        )
        if (res.success && res.data.length > 0) {
          try {
            const docs = JSON.parse(res.data[0].starred_docs || '[]')
            setActiveStarredDocs(docs)
          } catch (_e) {
            /* noop */
          }
        }
      }
    } finally {
      setRefreshing(false)
    }
  }, [activeDosyaId, setActiveStarredDocs])

  useEffect(() => {
    const onStarredChanged = () => {
      handleRefresh()
    }
    window.addEventListener('global_starred_changed', onStarredChanged)
    return () => {
      window.removeEventListener('global_starred_changed', onStarredChanged)
    }
  }, [handleRefresh])

  useEffect(() => {
    if (searchSablonAd && sablons.length > 0) {
      const found = sablons.find(
        (s) => normalizeForMatch(s.ad) === normalizeForMatch(searchSablonAd)
      )
      if (found && !selectedIds.has(found.id)) {
        setSelectedIds((prev) => new Set([...prev, found.id]))
        const cat = getSablonGroup(found)
        setExpandedCategories((prev) => new Set([...prev, cat]))
      }
    }
  }, [searchSablonAd, sablons])

  const toggleCategory = (kategori: string) => {
    const newSet = new Set(expandedCategories)
    if (newSet.has(kategori)) {
      newSet.delete(kategori)
    } else {
      newSet.add(kategori)
    }
    setExpandedCategories(newSet)
  }

  const groupedSablons = useMemo((): Record<string, Sablon[]> => {
    const groups: Record<string, Sablon[]> = {}

    const filteredSablons = sablons.filter((s) => {
      const docKey = (s.dosya_adi || '').replace(/\.html$/, '')
      const st = activeDosyaId ? getDocumentStatus(activeDosyaId, docKey) : 'draft'

      if (statusFilter === 'ready') {
        return st === 'ready_to_print'
      }
      if (statusFilter === 'printed') {
        return st === 'printed'
      }
      if (statusFilter === 'starred') {
        return activeStarredDocs.some((d) => normalizeForMatch(d) === normalizeForMatch(s.ad))
      }
      return true
    })

    filteredSablons.forEach((s) => {
      const cat = getSablonGroup(s)
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(s)
    })
    return groups
  }, [sablons, statusFilter, activeDosyaId, getDocumentStatus, activeStarredDocs])

  const toggleAllCategories = () => {
    const allCats = Object.keys(groupedSablons)
    const allExpanded = allCats.every((cat) => expandedCategories.has(cat))
    if (allExpanded) {
      setExpandedCategories(new Set())
    } else {
      setExpandedCategories(new Set(allCats))
    }
  }

  const getMissingRequirement = useCallback(
    (sablon: Sablon): string | null => {
      if (!sablon) return null
      if (
        sablon.icerik.includes('{{#kalemler}}') &&
        (!dosyaContext.kalemler || dosyaContext.kalemler.length === 0)
      ) {
        return 'İhtiyaç listesinde (malzeme kalemi) tanımlanmamış.'
      }
      if (
        sablon.icerik.includes('{{#firmalar}}') &&
        (!dosyaContext.firmalar || dosyaContext.firmalar.length === 0)
      ) {
        return 'Dosyaya yüklenici/davetli firma eklenmemiş.'
      }
      if (
        sablon.icerik.includes('{{#komisyon_uyeleri}}') &&
        (!dosyaContext.komisyon_uyeleri || dosyaContext.komisyon_uyeleri.length === 0)
      ) {
        return 'İlgili komisyon üyeleri belirlenmemiş.'
      }
      return null
    },
    [dosyaContext]
  )

  const toggleGroup = (cat: string) => {
    const groupItems = groupedSablons[cat] || []
    const groupIds = groupItems.map((s) => s.id)
    const validIds = groupIds.filter(
      (id) => !getMissingRequirement(sablons.find((s) => s.id === id)!)
    )
    const allSelected = validIds.every((id) => selectedIds.has(id))
    const newSet = new Set(selectedIds)

    if (allSelected) {
      validIds.forEach((id) => newSet.delete(id))
    } else {
      validIds.forEach((id) => newSet.add(id))
    }
    setSelectedIds(newSet)
  }

  const toggleSelect = (id: number) => {
    const sablon = sablons.find((s) => s.id === id)
    if (sablon && getMissingRequirement(sablon)) return

    const newSet = new Set(selectedIds)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setSelectedIds(newSet)
  }

  const renderHtml = useCallback(
    (sablon: Sablon) => {
      try {
        if (!masterHtml) return sablon.icerik

        const processContext = contextsByPath?.[sablon.route_path || ''] || dosyaContext
        const templateContext = { ...processContext }

        const renderedContent = Mustache.render(sablon.icerik, templateContext)
        templateContext.icerik = renderedContent
        return Mustache.render(masterHtml, templateContext)
      } catch (error) {
        console.error('Template render hatası:', error)
        return sablon.icerik
      }
    },
    [masterHtml, contextsByPath, dosyaContext]
  )

  const handleAutoProcessQueue = () => {
    if (!activeDosyaId) return
    const readyIds = sablons
      .filter((s) => {
        if (getMissingRequirement(s)) return false
        const docKey = (s.dosya_adi || '').replace(/\.html$/, '')
        return getDocumentStatus(activeDosyaId, docKey) === 'ready_to_print'
      })
      .map((s) => s.id)

    if (readyIds.length === 0) {
      showToast('Kuyrukta işlenecek hazır belge bulunamadı.', 'warning')
      return
    }

    setSelectedIds(new Set(readyIds))
    setIsPrintManagerOpen(true)
    showToast(`Kuyruktaki ${readyIds.length} adet hazır belge otomatik olarak seçildi.`, 'success')
  }

  const handleAction = async (
    action: 'pdf' | 'udf' | 'docx' | 'print' | 'zip' | 'excel',
    specificIds?: number[]
  ) => {
    if (action === 'excel') {
      setProcessing(true)
      try {
        const kalemlerRes = await window.electron.ipcRenderer.invoke(
          'db:query',
          'SELECT * FROM DATA_TeminKalem WHERE temin_dosya_id = ?',
          [activeDosyaId]
        )
        const firmalarRes = await window.electron.ipcRenderer.invoke(
          'db:query',
          `SELECT f.*, tf.durum as teklif_durumu, tf.toplam_teklif 
           FROM DATA_TeminFirma tf 
           JOIN TANIM_Firma f ON tf.firma_id = f.id 
           WHERE tf.temin_dosya_id = ?`,
          [activeDosyaId]
        )
        const tekliflerRes = await window.electron.ipcRenderer.invoke(
          'db:query',
          'SELECT * FROM DATA_TeminKalemTeklif WHERE temin_dosya_id = ?',
          [activeDosyaId]
        )
        const komisyonRes = await window.electron.ipcRenderer.invoke(
          'db:query',
          'SELECT * FROM DATA_TeminKomisyon WHERE temin_dosya_id = ?',
          [activeDosyaId]
        )
        const kurumRes = await window.electron.ipcRenderer.invoke(
          'db:query',
          'SELECT * FROM TANIM_Kurum LIMIT 1'
        )

        await exportDogrudanTeminMasterExcel({
          dosya: activeDosya,
          kalemler: kalemlerRes.success ? kalemlerRes.data : [],
          firmalar: firmalarRes.success ? firmalarRes.data : [],
          teklifler: tekliflerRes.success ? tekliflerRes.data : [],
          komisyon: komisyonRes.success ? komisyonRes.data : [],
          kurum: kurumRes.success ? kurumRes.data?.[0] : null,
          sablons: sablons
        })

        showToast('Master Excel raporu başarıyla indirildi.', 'success')
      } catch (err: any) {
        showToast('Master Excel hazırlanırken hata: ' + err.message, 'error')
      } finally {
        setProcessing(false)
      }
      return
    }

    let targetIds = specificIds ? new Set(specificIds) : selectedIds

    if (targetIds.size === 0 && activeDosyaId) {
      const readyIds = sablons
        .filter((s) => {
          if (getMissingRequirement(s)) return false
          const docKey = (s.dosya_adi || '').replace(/\.html$/, '')
          return getDocumentStatus(activeDosyaId, docKey) === 'ready_to_print'
        })
        .map((s) => s.id)
      if (readyIds.length > 0) {
        targetIds = new Set(readyIds)
      }
    }

    if (targetIds.size === 0) {
      showToast('Lütfen en az bir belge seçin veya kuyruğa hazır belge ekleyin.', 'warning')
      return
    }

    setProcessing(true)
    try {
      const selectedSablons = sablons.filter((s) => targetIds.has(s.id))

      if (action === 'zip') {
        const zipFiles: Array<{
          name: string
          html: string
          format: 'pdf' | 'docx' | 'udf'
        }> = []

        for (const sablon of selectedSablons) {
          const html = renderHtml(sablon)
          const pdfFileName = buildExportFileName({
            dosya: activeDosya,
            belgeAdi: sablon.ad,
            extension: 'pdf'
          })
          const docxFileName = buildExportFileName({
            dosya: activeDosya,
            belgeAdi: sablon.ad,
            extension: 'docx'
          })

          zipFiles.push({
            name: pdfFileName,
            html: String(html || ''),
            format: 'pdf'
          })
          zipFiles.push({
            name: docxFileName,
            html: String(html || ''),
            format: 'docx'
          })
        }

        const defaultZipName = buildBatchZipFileName({
          dosya: activeDosya,
          customSuffix: 'Tum_Belgeler'
        })

        const res = await window.electron.ipcRenderer.invoke('belge:export-zip', {
          fileName: defaultZipName,
          files: zipFiles
        })

        if (res && res.success && !res.canceled) {
          await logDocument('Toplu Belge Paketi', defaultZipName)
          showToast(`ZIP arşivi başarıyla kaydedildi (${selectedSablons.length} belge).`, 'success')
        }
        return
      }

      for (const sablon of selectedSablons) {
        const html = renderHtml(sablon)
        const fileNameWithExt = buildExportFileName({
          dosya: activeDosya,
          belgeAdi: sablon.ad,
          extension: action === 'print' ? 'pdf' : action
        })
        const fileBase = fileNameWithExt.replace(/\.[^.]+$/, '')
        const docKey = (sablon.dosya_adi || '').replace(/\.html$/, '')

        if (action === 'pdf') {
          await window.electron.ipcRenderer.invoke('export-pdf', html, null, fileBase)
          await logDocument(sablon.ad, `${fileBase}.pdf`)
        } else if (action === 'udf') {
          await window.electron.ipcRenderer.invoke('export-udf', html, fileBase)
          await logDocument(sablon.ad, `${fileBase}.udf`)
        } else if (action === 'docx') {
          await window.electron.ipcRenderer.invoke('export-docx', html, fileBase)
          await logDocument(sablon.ad, `${fileBase}.docx`)
        } else if (action === 'print') {
          await window.electron.ipcRenderer.invoke('print-html', html, {
            silent: true
          })
          await logDocument(sablon.ad, 'Yazdırıldı')
        }

        if (activeDosyaId) {
          markAsPrinted(activeDosyaId, docKey)
        }
      }

      if (action === 'print') {
        setIsPrintManagerOpen(false)
        showToast('Belgeler başarıyla yazdırıldı ve \'Yazdırıldı\' olarak işaretlendi.', 'success')
      } else {
        showToast('Belgeler başarıyla oluşturuldu ve kaydedildi.', 'success')
      }
    } catch (error: any) {
      showToast(`İşlem sırasında hata oluştu: ${error.message}`, 'error')
    } finally {
      setProcessing(false)
    }
  }

  const handleOpenExternal = async (sablon: Sablon) => {
    const processCtx = contextsByPath?.[sablon.route_path || ''] || dosyaContext
    const eksikAlanlar: string[] = []
    const doluAlanlar: string[] = []
    for (const [key, value] of Object.entries(processCtx)) {
      if (key === 'icerik' || key.startsWith('_')) continue
      if (typeof value === 'string' && value.includes('[Belirtilmedi:')) {
        const match = value.match(/\[Belirtilmedi:\s*(.+?)\]/)
        eksikAlanlar.push(match ? match[1] : key)
      } else if (Array.isArray(value)) {
        if (value.length > 0) {
          doluAlanlar.push(key)
        }
      } else if (value !== null && value !== undefined && value !== '') {
        doluAlanlar.push(key)
      }
    }
    if (eksikAlanlar.length > 0) {
      const maxGoster = 12
      const eksikListesi = eksikAlanlar
        .slice(0, maxGoster)
        .map((m) => `  • ${m}`)
        .join('\n')
      const fazla =
        eksikAlanlar.length > maxGoster ? `\n  ... ve ${eksikAlanlar.length - maxGoster} alan daha` : ''
      const devam = confirm(
        `⚠️ ${eksikAlanlar.length} alan eksik / belirtilmemiş:\n\n${eksikListesi}${fazla}\n\n✅ ${doluAlanlar.length} alan dolu.\n\nYine de PDF olarak açmak istiyor musunuz?`
      )
      if (!devam) return
    }
    const html = renderHtml(sablon)
    if (html) {
      await window.electron.ipcRenderer.invoke('open-pdf-external', html)
    }
  }

  const allCategories = Object.keys(groupedSablons)
  const isAllExpanded =
    allCategories.length > 0 && allCategories.every((cat) => expandedCategories.has(cat))

  return {
    sablons,
    loading,
    dosyaContext,
    contextsByPath,
    activeDosya,
    activeDosyaId,
    activeStarredDocs,
    selectedIds,
    processing,
    refreshing,
    expandedCategories,
    isPrintManagerOpen,
    setIsPrintManagerOpen,
    statusFilter,
    setStatusFilter,
    readyCount,
    printedCount,
    toast,
    presets,
    activePresetId,
    isAllExpanded,
    groupedSablons,
    handleSelectPreset,
    handleSavePreset,
    handleDeletePreset,
    handleRefresh,
    toggleCategory,
    toggleAllCategories,
    toggleGroup,
    toggleSelect,
    getMissingRequirement,
    getDocumentStatus,
    isDocumentLocked,
    getDocumentLockInfo,
    unlockDocument,
    toggleReadyToPrint,
    openDocument,
    renderHtml,
    handleAutoProcessQueue,
    handleAction,
    handleOpenExternal
  }
}

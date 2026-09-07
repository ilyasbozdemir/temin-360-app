import { useState, useEffect } from 'react'
import { useSearch } from '@tanstack/react-router'
import { useWorkspaceStore } from '../../../../store/workspaceStore'
import { useCiktiMerkeziData } from '../../CiktiMerkezi.hooks'
import { useDocumentLogger } from '../../../../hooks/useDocumentLogger'
import { parseStatusAndName } from '../../../system/utils/statusUtils'
import Mustache from 'mustache'
import { buildExportFileName } from '../../../../utils/exportFileName'
import { useGlobalDocumentPreviewStore } from '../../../../store/globalDocumentPreviewStore'
import { documentPreloadService } from '../../../../services/documentPreloadService'

// -----------------------------------------------------------------------
// Sabitler – tüm dosya aşaması ekranları tarafından paylaşılır
// -----------------------------------------------------------------------

export const BUTTON_COLORS = [
  'bg-violet-600 hover:bg-violet-700',
  'bg-emerald-600 hover:bg-emerald-700',
  'bg-indigo-600 hover:bg-indigo-700',
  'bg-sky-600 hover:bg-sky-700',
  'bg-slate-600 hover:bg-slate-700',
  'bg-blue-600 hover:bg-blue-700',
  'bg-pink-600 hover:bg-pink-700',
  'bg-teal-600 hover:bg-teal-700'
]

export const CATEGORY_LABELS: Record<string, string> = {
  '1-ihtiyac-tespiti-ve-baslangic': 'Hazırlık & İhtiyaç',
  '2-piyasa-fiyat-arastirmasi': 'Teklifler & Piyasa',
  '3-siparis-ve-sozlesme': 'Sipariş & Sözleşme',
  '4-kabul-ve-odeme-islemleri': 'Muayene & Kabul & Ödeme',
  '5-klasor-ve-kapaklar': 'Klasör & Kapak'
}

export const normalizeForMatch = (str: string): string =>
  str
    .toLocaleLowerCase('tr-TR')
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]/g, '')

export const V2_TEMPLATES_NAMES = [
  'ihtiyac-listesi',
  'ihtiyaclistesi',
  'ihtiyac-talep-formu',
  'ihtiyactalepformu',
  'harcama-talimati',
  'harcamatalimati',
  'harcama-pusulasi',
  'harcamapusulasi',
  'luzum-muzekkeresi',
  'luzummuzekkeresi',
  'luzum-muzekkeresi-onay-eki',
  'luzummuzekkeresionayeki',
  'luzum-muzekkeresi-teslim-tesellum',
  'luzummuzekkeresiteslimtesellum',
  'komisyon-gorevlendirme-onayi',
  'komisyongorevlendirmeonayi',
  'komisyon-gorevlendirme-onayi-eki',
  'komisyongorevlendirmeonayieki',
  'piyasa-fiyat-arastirma-tutanagi',
  'piyasafiyatarastirmatutanagi',
  'piyasa-fiyat-arastirma-gorevlendirmesi',
  'piyasafiyatarastirmagorevlendirmesi',
  'yaklasik-maliyet-cetveli',
  'yaklasikmaliyetcetveli',
  'fiyat-arastirma-mektubu',
  'fiyatarastirmamektubu',
  'birim-fiyat-teklif-mektubu',
  'birimfiyatteklifmektubu',
  'arastirma-mektubu',
  'arastirmamektubu',
  'kabul-edilen-teklif',
  'kabuledilenteklif',
  'kabul-yazisi',
  'kabulyazisi',
  'siparis-formu',
  'siparisformu',
  'siparis-mektubu',
  'siparismektubu',
  'dogrudan-temin-sonuc-onay-belgesi',
  'sonuc-onay-belgesi',
  'sonuconaybelgesi',
  'sonuconay',
  'dogrudan-temin-sozlesmesi',
  'sozlesme',
  'sozlesmeye-davet',
  'sozlesmedavet',
]

export function isV2Template(dosyaAdiOrTitle?: string | null): boolean {
  if (!dosyaAdiOrTitle) return false
  const clean = normalizeForMatch(dosyaAdiOrTitle)
  return V2_TEMPLATES_NAMES.some((name) => clean.includes(normalizeForMatch(name)))
}

/**
 * SABLON_GRUPLARI — Ekranda hangi şablonlar tek kart + select ile gösterilir?
 *
 * dosya_adi → { grup: string (kart anahtarı), etiket: string (select seçeneği), siralama: number }
 *
 * Aynı "grup" değerine sahip şablonlar tek kart altında toplanır.
 * "siralama" küçükten büyüğe sıralanır; siralama=0 olan "Ana Belge" olur.
 *
 * Yeni grup eklemek için sadece buraya ekle — başka hiçbir dosya değişmez.
 */
export const SABLON_GRUPLARI: Record<string, { grup: string; etiket: string; siralama: number }> = {
  // ── İhtiyaç Listesi ailesi (İhtiyaç Listesi + Talep Formu)
  'ihtiyac-listesi': { grup: 'ihtiyac-listesi', etiket: 'İhtiyaç Listesi', siralama: 0 },
  'ihtiyac-talep-formu': { grup: 'ihtiyac-listesi', etiket: 'Talep Formu', siralama: 1 },

  // ── Komisyon Görevlendirme ailesi (Komisyon Atama + Onay Eki)
  'komisyon-gorevlendirme-onayi': {
    grup: 'komisyon-gorevlendirme',
    etiket: 'Komisyon Atama',
    siralama: 0
  },
  'komisyon-gorevlendirme-onayi-eki': {
    grup: 'komisyon-gorevlendirme',
    etiket: 'Onay Eki',
    siralama: 1
  },

  // ── "dosyaKonusu": "LÜZUM MÜZEKKERESİ", ailesi
  'luzum-muzekkeresi': { grup: 'luzum-muzekkeresi', etiket: '"dosyaKonusu": "LÜZUM MÜZEKKERESİ",', siralama: 0 },
  'luzum-muzekkeresi-onay-eki': { grup: 'luzum-muzekkeresi', etiket: 'Onay Eki', siralama: 1 },
  'luzum-muzekkeresi-teslim-tesellum': {
    grup: 'luzum-muzekkeresi',
    etiket: 'Teslim Tesellüm',
    siralama: 2
  },

  // ── Onay Belgesi ailesi (Doğrudan Temin + İdare/İhale + Bütçe Sorgusu)
  'dogrudan-temin-onay-belgesi': { grup: 'onay-belgesi', etiket: 'Doğrudan Temin', siralama: 0 },
  'idare-onay-belgesi': { grup: 'onay-belgesi', etiket: 'İhale', siralama: 1 },
  'butce-sorgusu': { grup: 'onay-belgesi', etiket: 'Bütçe Sorgusu', siralama: 2 },

  // ── Harcama ailesi (Harcama Talimatı + Harcama Pusulası)
  'harcama-talimati': { grup: 'harcama', etiket: 'Harcama Talimatı', siralama: 0 },
  'harcama-pusulasi': { grup: 'harcama', etiket: 'Harcama Pusulası', siralama: 1 },

  // ── Doğrudan Temin Sözleşmesi ailesi
  'dogrudan-temin-sozlesmesi': { grup: 'dt-sozlesmesi', etiket: 'Standart', siralama: 0 },
  'dogrudan-temin-sozlesmesi-alternatif': {
    grup: 'dt-sozlesmesi',
    etiket: 'Alternatif',
    siralama: 1
  },
  'dogrudan-temin-sozlesmesi-uzun': { grup: 'dt-sozlesmesi', etiket: 'Uzun Form', siralama: 2 },

  // ── Dağıtım Çizelgesi ailesi
  'dagitim-cizelgesi': { grup: 'dagitim-cizelgesi', etiket: 'Standart', siralama: 0 },
  'dagitim-cizelgesi-karma': { grup: 'dagitim-cizelgesi', etiket: 'Karma', siralama: 1 },

  // ── Klasör Sırtlığı ailesi
  'klasor-sirtligi-3cm': { grup: 'klasor-sirtligi', etiket: '3 cm', siralama: 0 },
  'klasor-sirtligi-5cm': { grup: 'klasor-sirtligi', etiket: '5 cm', siralama: 1 },
  'klasor-sirtligi-7-5cm': { grup: 'klasor-sirtligi', etiket: '7.5 cm', siralama: 2 },

  // ── Muayene & Kabul ailesi
  'muayene-kabul-komisyonu': { grup: 'muayene-kabul', etiket: 'Komisyon', siralama: 0 },
  'muayene-kabul-tutanagi': { grup: 'muayene-kabul', etiket: 'Tutanak', siralama: 1 },

  // ── Kabul Edilen Teklif (Sipariş Mektubu) ailesi
  'kabul-edilen-teklif': { grup: 'kabul-edilen-teklif', etiket: 'Standart', siralama: 0 },
  'kabul-edilen-teklif-alternatif': {
    grup: 'kabul-edilen-teklif',
    etiket: 'Alternatif',
    siralama: 1
  }
}

// -----------------------------------------------------------------------
// Hook – şablon önizleme mantığı
// -----------------------------------------------------------------------

export interface PreviewData {
  title: string
  templateHtml: string
  processPath: string
  templateTestVerisi?: string
  sablonId?: number
  snapshotContext?: any
  dosyaAdi?: string
}

export const checkIsSablonDisabled = (cleanName: string, dosyaContext: any): boolean => {
  // Kullanıcının talebi üzerine: "Veriler eksik olsa bile butonu disabled yapma, kullanıcı girip eksikliği kendi görsün."
  return false
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useDosyaAsamasiSablons() {
  const { activeDosyaId, activeStarredDocs, setActiveStarredDocs } = useWorkspaceStore()
  const {
    sablons,
    loading: ciktiLoading,
    masterHtml,
    dosyaContext,
    activeDosya,
    placeholders,
    contextsByPath,
    personelListesi,
    refresh
  } = useCiktiMerkeziData(activeDosyaId)

  const { logDocument } = useDocumentLogger()

  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [previewData, setPreviewData] = useState<PreviewData | null>(null)

  // Tanstack Router'dan arama parametresini reaktif olarak al
  const searchParams: any = useSearch({ strict: false })
  const sablonAd = searchParams?.sablonAd

  // Snapshot'ı DB'den yükleyen yardımcı fonksiyon (otomatik kaydetmez, sadece varsa yükler)
  const loadOrCreateSnapshot = async (sablonId: number, baseCtx: any) => {
    try {
      const snapshotRes = await (window as any).electron.ipcRenderer.invoke(
        'db:query',
        'SELECT veri_json FROM DATA_DosyaSablonVeri WHERE temin_dosya_id = ? AND sablon_id = ?',
        [activeDosyaId, sablonId]
      )
      if (snapshotRes.success && snapshotRes.data.length > 0) {
        // Önceden kaydedilmiş bir snapshot varsa (örn. manuel olarak kaydedilmişse veya eski sistemde kalmışsa)
        // baseCtx'in üzerine yazarak birleştir, böylece baseCtx'teki güncel alanlar (snapshot'ta olmayanlar) korunur.
        const savedSnapshot = JSON.parse(snapshotRes.data[0].veri_json)
        return { ...baseCtx, ...savedSnapshot }
      }
      return baseCtx
    } catch (e) {
      console.error('Snapshot error:', e)
      return baseCtx
    }
  }

  // URL'deki sablonAd parametresini dinle ve varsa modalı aç
  useEffect(() => {
    if (!masterHtml || sablons.length === 0 || !sablonAd || !activeDosyaId || !dosyaContext) return

    const loadFromUrl = async () => {
      // Şablon adından durumu temizleyip eşleştir
      const cleanTarget = parseStatusAndName(sablonAd).cleanName
      const normalizedTarget = normalizeForMatch(cleanTarget)
      const sablon = sablons.find(
        (s) => normalizeForMatch(parseStatusAndName(s.ad).cleanName) === normalizedTarget
      )
      if (sablon) {
        const processPath = sablon.route_path || sablon.dosya_adi || ''
        const baseCtx = contextsByPath[processPath] || dosyaContext
        const mergedCtx = await loadOrCreateSnapshot(sablon.id, baseCtx)
        setPreviewData({
          title: sablon.ad,
          templateHtml: sablon.icerik,
          processPath,
          templateTestVerisi: sablon.test_verisi || undefined,
          sablonId: sablon.id,
          snapshotContext: mergedCtx,
          dosyaAdi: sablon.dosya_adi
        })
        setPreviewModalOpen(true)
      }
    }
    loadFromUrl()
  }, [sablonAd, sablons, masterHtml, activeDosyaId, dosyaContext])

  // Adımlar arası gezinirken o aşamaya ait tüm belgeleri arkaplanda ön-işle (pre-warm)
  useEffect(() => {
    if (!activeDosyaId || sablons.length === 0) return
    const docKeys = sablons.map((s) => s.dosya_adi || s.route_path || s.ad).filter(Boolean)
    documentPreloadService.warmStageDocuments('current_stage', activeDosyaId, docKeys)
  }, [activeDosyaId, sablons])

  const warmSablon = (sablonOrKey: any) => {
    if (!activeDosyaId || !sablonOrKey) return
    const key =
      typeof sablonOrKey === 'string'
        ? sablonOrKey
        : sablonOrKey.dosya_adi || sablonOrKey.route_path || sablonOrKey.ad
    if (key) {
      documentPreloadService.warmOnHover(key, activeDosyaId)
    }
  }

  const handleOpenPreviewForSablon = async (
    sablon: any,
    title: string,
    overrideCtx?: any,
    selectedFirma?: any
  ) => {
    const processPath = sablon.route_path || sablon.dosya_adi || ''
    const currentCtx = contextsByPath[processPath] || dosyaContext
    const snapshotCtx = overrideCtx
      ? overrideCtx
      : await loadOrCreateSnapshot(sablon.id, currentCtx)

    setPreviewData({
      sablonId: sablon.id,
      title,
      templateHtml: sablon.icerik,
      processPath,
      templateTestVerisi: '',
      snapshotContext: snapshotCtx,
      dosyaAdi: sablon.dosya_adi
    })
    setPreviewModalOpen(true)

    const docId = (sablon.dosya_adi || sablon.route_path || '').replace(/\.html$/, '')
    useGlobalDocumentPreviewStore.getState().openDocument({
      documentId: docId,
      dosyaId: activeDosyaId || undefined,
      documentTitle: title,
      selectedFirma: selectedFirma || null,
      onClose: () => {
        setPreviewModalOpen(false)
      }
    })
  }

  const refreshSnapshot = async () => {
    if (!previewData?.sablonId || !activeDosyaId) return
    const processPath = previewData.processPath
    const currentCtx = contextsByPath[processPath] || dosyaContext
    try {
      // Güncel verileri almak, o şablon için kaydedilmiş (dondurulmuş) veriyi temizlemek anlamına gelir
      await (window as any).electron.ipcRenderer.invoke(
        'db:run',
        'DELETE FROM DATA_DosyaSablonVeri WHERE temin_dosya_id = ? AND sablon_id = ?',
        [activeDosyaId, previewData.sablonId]
      )
      setPreviewData({
        ...previewData,
        snapshotContext: currentCtx
      })
      alert('Şablon başarıyla güncel dosya verileriyle eşitlendi!')
    } catch (e) {
      console.error('Refresh snapshot error:', e)
      alert('Veriler yenilenirken hata oluştu.')
    }
  }

  const saveSnapshot = async (overrideData: any) => {
    if (!previewData?.sablonId || !activeDosyaId) return
    const currentCtx =
      previewData.snapshotContext || contextsByPath[previewData.processPath] || dosyaContext
    const mergedCtx = { ...currentCtx, ...overrideData }
    try {
      await (window as any).electron.ipcRenderer.invoke(
        'db:run',
        'INSERT OR REPLACE INTO DATA_DosyaSablonVeri (temin_dosya_id, sablon_id, veri_json) VALUES (?, ?, ?)',
        [activeDosyaId, previewData.sablonId, JSON.stringify(mergedCtx)]
      )

      // Eşleşen personelleri doğrudan temin dosyası ana kaydı (DATA_TeminDosyasi) ile eşleştir
      const updates: { col: string; val: number | null }[] = []

      const checkAndAddUpdate = (fieldName: string, colName: string) => {
        if (overrideData[fieldName] !== undefined) {
          const nameVal = overrideData[fieldName]
          if (nameVal === '' || nameVal === null) {
            updates.push({ col: colName, val: null })
          } else {
            const found = personelListesi.find((p: any) => p.ad_soyad === nameVal)
            if (found) {
              updates.push({ col: colName, val: found.id })
            }
          }
        }
      }

      checkAndAddUpdate('onaylayanPersonelAdi', 'onay_personel_id')
      checkAndAddUpdate('hazirlayanPersonelAdi', 'hazirlayan_personel_id')
      checkAndAddUpdate('talepEdenPersonelAdi', 'talep_eden_personel_id')
      checkAndAddUpdate('sunanPersonelAdi', 'sunan_personel_id')
      checkAndAddUpdate('ilgiliPersonelAdi', 'irtibat_yetkilisi_id')

      if (updates.length > 0) {
        for (const update of updates) {
          await (window as any).electron.ipcRenderer.invoke(
            'db:run',
            `UPDATE DATA_TeminDosyasi SET ${update.col} = ? WHERE id = ?`,
            [update.val, activeDosyaId]
          )
        }
        // Değişikliklerin ekranda hemen güncellenmesi için veri kaynağını yenile
        await refresh(true)
      }

      setPreviewData({
        ...previewData,
        snapshotContext: mergedCtx
      })
      alert('Değişiklikler başarıyla kaydedildi!')
    } catch (e) {
      console.error('Save snapshot error:', e)
      alert('Kaydedilirken hata oluştu.')
    }
  }

  const executePrint = async (html: string) => {
    await (window as any).electron.ipcRenderer.invoke('print-html', html, {
      silent: false
    })
    if (previewData?.title) {
      await logDocument(previewData.title, 'Yazdırıldı')
    }
  }

  const executeExportPdf = async (html: string, filenameTitle?: string) => {
    const rawTitle = filenameTitle || previewData?.title || 'Belge'
    const fileNameWithExt = buildExportFileName({
      dosya: activeDosya,
      belgeAdi: rawTitle,
      extension: 'pdf'
    })
    const fileBase = fileNameWithExt.replace(/\.[^.]+$/, '')
    await (window as any).electron.ipcRenderer.invoke('export-pdf', html, null, fileBase)
    if (previewData?.title) {
      await logDocument(previewData.title, fileNameWithExt)
    }
  }

  const executeExportDocx = async (html: string, filenameTitle?: string) => {
    const rawTitle = filenameTitle || previewData?.title || 'Belge'
    const fileNameWithExt = buildExportFileName({
      dosya: activeDosya,
      belgeAdi: rawTitle,
      extension: 'docx'
    })
    const fileBase = fileNameWithExt.replace(/\.[^.]+$/, '')
    await (window as any).electron.ipcRenderer.invoke('export-docx', html, fileBase)
    if (previewData?.title) {
      await logDocument(previewData.title, fileNameWithExt)
    }
  }

  const executeExportUdf = async (html: string, filenameTitle?: string) => {
    const rawTitle = filenameTitle || previewData?.title || 'Belge'
    const fileNameWithExt = buildExportFileName({
      dosya: activeDosya,
      belgeAdi: rawTitle,
      extension: 'udf'
    })
    const fileBase = fileNameWithExt.replace(/\.[^.]+$/, '')
    await (window as any).electron.ipcRenderer.invoke('export-udf', html, fileBase)
    if (previewData?.title) {
      await logDocument(previewData.title, fileNameWithExt)
    }
  }

  const renderHtmlForSablon = async (sablon: any) => {
    if (!masterHtml) return ''
    const processPath = sablon.route_path || sablon.dosya_adi || ''
    const currentCtx = contextsByPath[processPath] || dosyaContext
    const snapshotCtx = await loadOrCreateSnapshot(sablon.id, currentCtx)

    const renderedContent = Mustache.render(sablon.icerik, snapshotCtx)
    const masterContext = { ...snapshotCtx, icerik: renderedContent }
    return Mustache.render(masterHtml, masterContext)
  }

  const quickPrint = async (sablon: any) => {
    const html = await renderHtmlForSablon(sablon)
    if (!html) return
    await (window as any).electron.ipcRenderer.invoke('print-html', html, {
      silent: true
    })
    await logDocument(sablon.ad, 'Yazdırıldı')
  }

  const quickExport = async (sablon: any, format: 'pdf' | 'docx' | 'udf') => {
    const html = await renderHtmlForSablon(sablon)
    if (!html) return
    const fileNameWithExt = buildExportFileName({
      dosya: activeDosya,
      belgeAdi: sablon.ad,
      extension: format
    })
    const fileBase = fileNameWithExt.replace(/\.[^.]+$/, '')

    if (format === 'pdf') {
      await (window as any).electron.ipcRenderer.invoke('export-pdf', html, null, fileBase)
    } else if (format === 'docx') {
      await (window as any).electron.ipcRenderer.invoke('export-docx', html, fileBase)
    } else if (format === 'udf') {
      await (window as any).electron.ipcRenderer.invoke('export-udf', html, fileBase)
    }

    await logDocument(sablon.ad, fileNameWithExt)
  }

  const quickOpenExternal = async (sablon: any) => {
    const processPath = sablon.route_path || sablon.dosya_adi || ''
    const currentCtx = contextsByPath[processPath] || dosyaContext
    const snapshotCtx = await loadOrCreateSnapshot(sablon.id, currentCtx)

    // Eksik alan kontrolü — [Belirtilmedi: ...] değerlerini tara
    const eksikAlanlar: string[] = []
    const doluAlanlar: string[] = []

    for (const [key, value] of Object.entries(snapshotCtx)) {
      if (key === 'icerik' || key.startsWith('_')) continue
      if (typeof value === 'string' && value.includes('[Belirtilmedi:')) {
        const match = value.match(/\[Belirtilmedi:\s*(.+?)\]/)
        eksikAlanlar.push(match ? match[1] : key)
      } else if (Array.isArray(value)) {
        if (value.length > 0) doluAlanlar.push(key)
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
        eksikAlanlar.length > maxGoster
          ? `\n  ... ve ${eksikAlanlar.length - maxGoster} alan daha`
          : ''
      const devam = confirm(
        `⚠️ ${eksikAlanlar.length} alan eksik / belirtilmemiş:\n\n${eksikListesi}${fazla}\n\n✅ ${doluAlanlar.length} alan dolu.\n\nYine de PDF olarak açmak istiyor musunuz?`
      )
      if (!devam) return
    }

    const html = await renderHtmlForSablon(sablon)
    if (!html) return
    await (window as any).electron.ipcRenderer.invoke('open-pdf-external', html)
  }

  const toggleStar = async (sablonAd: string): Promise<void> => {
    if (!activeDosyaId) return

    const cleanTarget = parseStatusAndName(sablonAd).cleanName
    const normalizedTarget = normalizeForMatch(cleanTarget)
    const newDocs = [...activeStarredDocs]
    const existingIdx = newDocs.findIndex(
      (d) => normalizeForMatch(parseStatusAndName(d).cleanName) === normalizedTarget
    )

    if (existingIdx >= 0) {
      newDocs.splice(existingIdx, 1)
    } else {
      newDocs.push(cleanTarget)
    }

    setActiveStarredDocs(newDocs)
    await (window as any).electron.ipcRenderer.invoke(
      'db:run',
      'UPDATE DATA_TeminDosyasi SET starred_docs = ? WHERE id = ?',
      [JSON.stringify(newDocs), activeDosyaId]
    )
  }

  const isSablonDisabled = (cleanName: string): boolean => {
    return checkIsSablonDisabled(cleanName, dosyaContext)
  }

  return {
    // workspace & cikti verileri
    activeDosyaId,
    activeStarredDocs,
    sablons,
    ciktiLoading,
    masterHtml,
    dosyaContext,
    activeDosya,
    placeholders,
    contextsByPath,
    personelListesi,
    // UI state
    previewModalOpen,
    setPreviewModalOpen,
    previewData,
    // işlemler
    handleOpenPreviewForSablon,
    executePrint,
    executeExportPdf,
    executeExportDocx,
    executeExportUdf,
    quickPrint,
    quickExport,
    quickOpenExternal,
    toggleStar,
    refreshSnapshot,
    saveSnapshot,
    isSablonDisabled,
    warmSablon
  }
}

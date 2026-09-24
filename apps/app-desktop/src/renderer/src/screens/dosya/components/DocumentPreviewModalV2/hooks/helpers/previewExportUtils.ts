import React from 'react'
import { renderToString } from 'react-dom/server'
import { TemplateEditProvider, TemplateResolver } from '@temin360/document-templates'
import { useSettingsStore } from '../../../../../../store/settingsStore'
import { usePrintQueueStore } from '../../../../../../store/printQueueStore'
import { documentPreloadService } from '../../../../../../services/documentPreloadService'
import { buildExportFileName } from '../../../../../../utils/exportFileName'
import { getDefaultMappingForProcess } from '../../../../../../constants/mappings'
import { Personel } from '../../types'

interface CompileHtmlParams {
  ActiveComponent: any
  activeTemplateConf: any
  formData: Record<string, any>
  personelListesi: Personel[]
  firmaListesi: any[]
  localShowLogoLeft: boolean
  localShowLogoRight: boolean
  logoLeft: string | null
  logoRight: string | null
  institutionLogo: string | null
  orientation: 'portrait' | 'landscape'
}

export function compileDocumentHtml({
  ActiveComponent,
  activeTemplateConf,
  formData,
  personelListesi,
  firmaListesi,
  localShowLogoLeft,
  localShowLogoRight,
  logoLeft,
  logoRight,
  institutionLogo,
  orientation
}: CompileHtmlParams): string {
  if (!ActiveComponent) return ''
  const storeSettings = useSettingsStore.getState()
  const activeSolLogo =
    formData.solLogo ||
    logoLeft ||
    institutionLogo ||
    storeSettings.logoLeft ||
    storeSettings.institutionLogo ||
    null
  const activeSagLogo = formData.sagLogo || logoRight || storeSettings.logoRight || null

  const bodyHtml = renderToString(
    React.createElement(
      TemplateEditProvider,
      {
        isEditing: false,
        personelListesi,
        firmaListesi,
        firstPageLimit: formData.firstPageLimit
      },
      React.createElement(ActiveComponent, {
        data: {
          ...formData,
          personelListesi,
          firmaListesi,
          tarih: formData.tarih || formData.onayaSunulanTarih || '',
          onayTarihi: formData.onayTarihi || formData.dosyaTarihi || '',
          solLogo: localShowLogoLeft ? activeSolLogo : null,
          sagLogo: localShowLogoRight ? activeSagLogo : null,
          olurYazisi: formData.olurYazisi !== false,
          orientation
        },
        orientation
      })
    )
  )

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${activeTemplateConf?.name || 'Belge Önizleme'}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @page {
            size: A4 ${orientation};
            margin: 10mm;
          }
          body {
            font-family: Arial, Helvetica, sans-serif;
            color: #000;
            margin: 0;
            padding: 0;
            background-color: #fff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          @media print {
            body {
              background: white !important;
              padding: 0 !important;
            }
            .page-break {
              page-break-before: always;
            }
          }
        </style>
      </head>
      <body>
        <div class="a4-document-root ${orientation}">
          ${bodyHtml}
        </div>
      </body>
    </html>
  `
}

interface SaveToDbParams {
  activeDosyaId: number
  resolvedId: string
  selectedDocId: string
  activeTemplateConf: any
  formData: Record<string, any>
  localShowLogoLeft: boolean
  localShowLogoRight: boolean
  logoLeft: string | null
  logoRight: string | null
  institutionLogo: string | null
  orientation: 'portrait' | 'landscape'
}

export async function saveDocumentToDb({
  activeDosyaId,
  resolvedId,
  selectedDocId,
  activeTemplateConf,
  formData,
  localShowLogoLeft,
  localShowLogoRight,
  logoLeft,
  logoRight,
  institutionLogo,
  orientation
}: SaveToDbParams): Promise<string | null> {
  if (!activeDosyaId || !resolvedId) return null
  const storeSettings = useSettingsStore.getState()
  const activeSolLogo =
    formData.solLogo ||
    logoLeft ||
    institutionLogo ||
    storeSettings.logoLeft ||
    storeSettings.institutionLogo ||
    null
  const activeSagLogo = formData.sagLogo || logoRight || storeSettings.logoRight || null

  const dataToSave = {
    ...formData,
    solLogo: localShowLogoLeft ? activeSolLogo : null,
    sagLogo: localShowLogoRight ? activeSagLogo : null,
    showLogoLeft: localShowLogoLeft,
    showLogoRight: localShowLogoRight,
    olurYazisi: formData.olurYazisi !== false,
    orientation
  }
  const jsonStr = JSON.stringify(dataToSave)
  const sablonRes = await window.electron.ipcRenderer.invoke(
    'db:query',
    'SELECT id FROM TANIM_Sablon WHERE dosya_adi = ? OR dosya_adi = ? LIMIT 1',
    [`${resolvedId}.html`, `${selectedDocId}.html`]
  )
  let sablonId = sablonRes?.success && sablonRes.data?.length > 0 ? sablonRes.data[0].id : null
  if (!sablonId) {
    await window.electron.ipcRenderer.invoke(
      'db:run',
      "INSERT OR IGNORE INTO TANIM_Sablon (ad, dosya_adi, dosya_turu, icerik, kategori, aktif_mi) VALUES (?, ?, 'html', '', 'genel', 1)",
      [activeTemplateConf?.name || resolvedId, `${resolvedId}.html`]
    )
    const refetch = await window.electron.ipcRenderer.invoke(
      'db:query',
      'SELECT id FROM TANIM_Sablon WHERE dosya_adi = ? LIMIT 1',
      [`${resolvedId}.html`]
    )
    if (refetch?.success && refetch.data?.length > 0) {
      sablonId = refetch.data[0].id
    }
  }

  await window.electron.ipcRenderer.invoke(
    'db:run',
    'DELETE FROM DATA_DosyaSablonVeri WHERE temin_dosya_id = ? AND (sablon_kodu = ? OR sablon_kodu = ? OR (sablon_id IS NOT NULL AND sablon_id = ?))',
    [activeDosyaId, resolvedId, `${resolvedId}.html`, sablonId]
  )

  await window.electron.ipcRenderer.invoke(
    'db:run',
    'INSERT OR REPLACE INTO DATA_DosyaSablonVeri (temin_dosya_id, sablon_id, sablon_kodu, veri_json, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
    [activeDosyaId, sablonId, resolvedId, jsonStr]
  )

  documentPreloadService.updateCachedResolvedData(resolvedId, activeDosyaId, dataToSave)
  usePrintQueueStore
    .getState()
    .invalidateReadyStatus(activeDosyaId, resolvedId, 'Belge içeriği güncellendi')

  return jsonStr
}

interface ExportPdfParams {
  htmlContent: string
  orientation: 'portrait' | 'landscape'
  dosyaRecord: any
  formData: Record<string, any>
  activeTemplateConf: any
}

export async function exportDocumentPdf({
  htmlContent,
  orientation,
  dosyaRecord,
  formData,
  activeTemplateConf
}: ExportPdfParams): Promise<void> {
  const defaultFilename = buildExportFileName({
    dosya: dosyaRecord,
    butceYili:
      (formData as any)?.butceYili || (formData as any)?.butce_yili || dosyaRecord?.butce_yili,
    teminNo: (formData as any)?.teminNo || (formData as any)?.temin_no || dosyaRecord?.temin_no,
    belgeAdi: activeTemplateConf?.name || 'Belge',
    extension: 'pdf'
  })

  try {
    const res = await window.electron.ipcRenderer.invoke('app:save-pdf-as', {
      html: htmlContent,
      orientation,
      defaultFilename
    })
    if (res && res.success) {
      alert('PDF başarıyla kaydedildi.')
      return
    }
  } catch {
    await window.electron.ipcRenderer.invoke('belge:open-pdf-external', htmlContent)
  }
}

interface ExportDocxParams {
  htmlContent: string
  dosyaRecord: any
  formData: Record<string, any>
  activeTemplateConf: any
}

export async function exportDocumentDocx({
  htmlContent,
  dosyaRecord,
  formData,
  activeTemplateConf
}: ExportDocxParams): Promise<void> {
  const defaultFilename = buildExportFileName({
    dosya: dosyaRecord,
    butceYili:
      (formData as any)?.butceYili || (formData as any)?.butce_yili || dosyaRecord?.butce_yili,
    teminNo: (formData as any)?.teminNo || (formData as any)?.temin_no || dosyaRecord?.temin_no,
    belgeAdi: activeTemplateConf?.name || 'Belge',
    extension: 'docx'
  })

  const res = await window.electron.ipcRenderer.invoke('belge:export-docx', {
    html: htmlContent,
    defaultFilename
  })
  if (res && res.success) {
    alert('Word (DOCX) belgesi başarıyla kaydedildi.')
  }
}

interface OpenPdfPreviewParams {
  htmlContent: string
  orientation: 'portrait' | 'landscape'
}

export async function openPdfPreview({
  htmlContent,
  orientation
}: OpenPdfPreviewParams): Promise<void> {
  try {
    await window.electron.ipcRenderer.invoke('app:open-pdf-preview', {
      html: htmlContent,
      orientation
    })
  } catch {
    await window.electron.ipcRenderer.invoke('belge:open-pdf-external', htmlContent)
  }
}

interface RefreshFromDbParams {
  activeDosyaId: number
  resolvedId: string
}

export async function refreshDocumentFromDb({
  activeDosyaId,
  resolvedId
}: RefreshFromDbParams): Promise<Record<string, any> | null> {
  if (!activeDosyaId || !resolvedId) return null

  await window.electron.ipcRenderer.invoke(
    'db:run',
    'DELETE FROM DATA_DosyaSablonVeri WHERE temin_dosya_id = ? AND (sablon_kodu = ? OR sablon_kodu = ?)',
    [activeDosyaId, resolvedId, `${resolvedId}.html`]
  )
  documentPreloadService.invalidateCache(activeDosyaId)

  const queryExecutor = async (sql: string, params: any[]): Promise<any[]> => {
    const res = await window.electron.ipcRenderer.invoke('db:query', sql, params)
    if (res && res.success) {
      return res.data
    }
    return []
  }

  const mapping = getDefaultMappingForProcess(resolvedId)
  const resolver = new TemplateResolver(queryExecutor)
  const [, resolved] = await Promise.all([
    window.electron.ipcRenderer.invoke('belge:get-document-payload', {
      dosyaId: activeDosyaId,
      documentId: resolvedId
    }),
    resolver.resolve(mapping, activeDosyaId || 0)
  ])

  const baseData: any = { ...resolved }
  const defaultDate = baseData.tarih || baseData.onayaSunulanTarih || ''
  if (defaultDate) {
    if (!baseData.tarih) baseData.tarih = defaultDate
    if (!baseData.onayaSunulanTarih) baseData.onayaSunulanTarih = defaultDate
    if (!baseData.belgeTarihi) baseData.belgeTarihi = defaultDate
  }
  const defaultOnayDate = baseData.onayTarihi || baseData.dosyaTarihi || ''
  if (defaultOnayDate) {
    baseData.onayTarihi = defaultOnayDate
    baseData.olurTarihi = defaultOnayDate
  }

  return baseData
}

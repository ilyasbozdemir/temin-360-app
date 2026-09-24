import React, { useState, useRef, useEffect } from 'react'
import {
  ArrowDownToLine,
  Check,
  Clipboard,
  Copy,
  Info,
  Loader2,
  Plus,
  PlusCircle,
  Sparkles,
  Trash2,
  X,
  Zap
} from 'lucide-react'
import { cn } from '../../../../../utils/cn'

import type { HizliKalemRow, HizliTopluKalemGridProps } from './types'

export type { HizliKalemRow, HizliTopluKalemGridProps }

const PRESET_PACKAGES = [
  {
    name: '📁 Kırtasiye Temel Paketi',
    tipi: 'Mal',
    okas_kodu: '30192700-6',
    tasinir_kodu: '150.01.01',
    kdv: 20,
    birim: 'Adet',
    items: [
      {
        kalem_adi: "A4 80 gr/m² Fotokopi Kağıdı (500'lü Paket)",
        miktar: 10,
        birim: 'Paket',
        aciklama: 'Beyaz 80 gr lazer yazıcı uyumlu'
      },
      {
        kalem_adi: "Telli Plastik Dosya (50'li Paket)",
        miktar: 2,
        birim: 'Paket',
        aciklama: 'Mavi/kırmızı telli standart dosya'
      },
      {
        kalem_adi: "Şeffaf Poşet Dosya A4 (100'lü Paket)",
        miktar: 5,
        birim: 'Paket',
        aciklama: 'Evrak koruma poşeti'
      },
      {
        kalem_adi: 'Geniş Klasör A4 Plastik Kaplı',
        miktar: 20,
        birim: 'Adet',
        aciklama: 'Mekanizmalı sırt etiketli'
      },
      {
        kalem_adi: "Mavi Tükenmez Kalem 0.7mm (50'li Kutu)",
        miktar: 1,
        birim: 'Kutu',
        aciklama: 'Akıcı yazım yağ bazlı mürekkep'
      },
      {
        kalem_adi: "Zımba Teli No:24/6 (1000'li Kutu)",
        miktar: 5,
        birim: 'Kutu',
        aciklama: 'Standart zımba makinesi teli'
      }
    ]
  },
  {
    name: '🧹 Temizlik & Hijyen Paketi',
    tipi: 'Mal',
    okas_kodu: '39830000-9',
    tasinir_kodu: '150.02.01',
    kdv: 20,
    birim: 'Adet',
    items: [
      {
        kalem_adi: 'Yoğun Kıvamlı Çamaşır Suyu (5 Lt)',
        miktar: 6,
        birim: 'Adet',
        aciklama: 'Hijyenik dezenfektan etkili'
      },
      {
        kalem_adi: 'Genel Yüzey Temizleyici Çiçek Kokulu (5 Lt)',
        miktar: 4,
        birim: 'Adet',
        aciklama: 'Zemin ve sert yüzey temizliği'
      },
      {
        kalem_adi: 'Sıvı El Sabunu Nemlendiricili (5 Lt)',
        miktar: 4,
        birim: 'Adet',
        aciklama: 'Dermatolojik onaylı pH 5.5'
      },
      {
        kalem_adi: "Çift Katlı Rulo Kağıt Havlu (12'li Paket)",
        miktar: 5,
        birim: 'Paket',
        aciklama: '%100 selüloz emici doku'
      },
      {
        kalem_adi: "Büyük Boy Çöp Torbası 80x110 cm (10'lu Rulo)",
        miktar: 10,
        birim: 'Rulo',
        aciklama: 'Endüstriyel kalın dayanıklı'
      }
    ]
  },
  {
    name: '🎨 Boya & Küçük Onarım',
    tipi: 'Yapım',
    okas_kodu: '45442110-1',
    tasinir_kodu: '15.120',
    kdv: 20,
    birim: 'm²',
    items: [
      {
        kalem_adi: 'İç Cephe Alçı Sıva Tamiratı ve Silikonlu Plastik Boya',
        miktar: 250,
        birim: 'm²',
        aciklama: 'Yüzey temizliği, astar ve 2 kat silikonlu boya'
      },
      {
        kalem_adi: 'Tavan Boyası Yapılması (2 Kat)',
        miktar: 120,
        birim: 'm²',
        aciklama: 'Su bazlı mat beyaz tavan boyası'
      },
      {
        kalem_adi: 'Kestirme Fırçası No:3 ve Boya Rulosu 20cm',
        miktar: 4,
        birim: 'Adet',
        aciklama: 'Profesyonel damlatmaz rulo ve fırça'
      },
      {
        kalem_adi: 'Maskeleme Bandı 50mm ve Koruyucu Hışır Örtü',
        miktar: 10,
        birim: 'Adet',
        aciklama: 'Boya koruma malzemesi'
      }
    ]
  },
  {
    name: '💻 BT / Donanım Sarf Paketi',
    tipi: 'Mal',
    okas_kodu: '30237000-9',
    tasinir_kodu: '150.05.01',
    kdv: 20,
    birim: 'Adet',
    items: [
      {
        kalem_adi: 'Siyah Muadil Toner (Yüksek Kapasite)',
        miktar: 4,
        birim: 'Adet',
        aciklama: 'Lazer yazıcı uyumlu çipli toner'
      },
      {
        kalem_adi: 'USB 3.0 Flash Bellek 64 GB',
        miktar: 5,
        birim: 'Adet',
        aciklama: 'Metal gövde yüksek hızlı veri aktarımı'
      },
      {
        kalem_adi: 'Cat6 UTP Patch Kablo 3 Metre',
        miktar: 10,
        birim: 'Adet',
        aciklama: 'Fabrika sonlandırmalı RJ45 uçlu'
      },
      {
        kalem_adi: 'Kablosuz Optik Mouse ve Mousepad',
        miktar: 3,
        birim: 'Adet',
        aciklama: '2.4GHz nano alıcılı sessiz tuşlu'
      },
      {
        kalem_adi: "6'lı Akım Korumalı Priz 2 Metre",
        miktar: 3,
        birim: 'Adet',
        aciklama: 'Aşırı gerilim korumalı anahtarlı priz'
      }
    ]
  }
]

const DEFAULT_UNITS = [
  'Adet',
  'Paket',
  'Kutu',
  'Koli',
  'Metre',
  'm²',
  'm³',
  'Kg',
  'Litre',
  'Takım',
  'Set',
  'Gün',
  'Ay',
  'Yıl'
]

export function HizliTopluKalemGrid({
  activeDosya,
  activeDosyaId,
  units = [],
  onSaveBatch,
  onCancel
}: HizliTopluKalemGridProps): React.JSX.Element {
  const isYapim =
    activeDosya?.tur === 'yapim_isi' ||
    activeDosya?.tur === 'yapim' ||
    activeDosya?.ihale_tipi === 'Hakediş'
  const isHizmet = activeDosya?.tur === 'hizmet'
  const defaultTipi = isYapim ? 'Yapım' : isHizmet ? 'Hizmet' : 'Mal'
  const defaultBirim = isYapim ? 'm²' : 'Adet'

  const unitOptions = units.length > 0 ? units.map((u: any) => u.ad || u.name || u) : DEFAULT_UNITS

  // Table Rows
  const [rows, setRows] = useState<HizliKalemRow[]>([
    {
      id: 'row-1',
      tipi: defaultTipi,
      kalem_adi: '',
      miktar: 1,
      birim: defaultBirim,
      tasinir_kodu: '',
      okas_kodu: '',
      kdv_orani: 20,
      aciklama: ''
    },
    {
      id: 'row-2',
      tipi: defaultTipi,
      kalem_adi: '',
      miktar: 1,
      birim: defaultBirim,
      tasinir_kodu: '',
      okas_kodu: '',
      kdv_orani: 20,
      aciklama: ''
    },
    {
      id: 'row-3',
      tipi: defaultTipi,
      kalem_adi: '',
      miktar: 1,
      birim: defaultBirim,
      tasinir_kodu: '',
      okas_kodu: '',
      kdv_orani: 20,
      aciklama: ''
    },
    {
      id: 'row-4',
      tipi: defaultTipi,
      kalem_adi: '',
      miktar: 1,
      birim: defaultBirim,
      tasinir_kodu: '',
      okas_kodu: '',
      kdv_orani: 20,
      aciklama: ''
    },
    {
      id: 'row-5',
      tipi: defaultTipi,
      kalem_adi: '',
      miktar: 1,
      birim: defaultBirim,
      tasinir_kodu: '',
      okas_kodu: '',
      kdv_orani: 20,
      aciklama: ''
    }
  ])

  const [hoveredCell, setHoveredCell] = useState<{
    rowIdx: number
    field: keyof HizliKalemRow
  } | null>(null)

  // Drag-to-Fill State (Excel Fill Handle)
  const [dragFill, setDragFill] = useState<{
    isDragging: boolean
    sourceRowIdx: number
    sourceField: keyof HizliKalemRow
    sourceValue: any
    targetRowIdx: number
  } | null>(null)

  const [toastNotification, setToastNotification] = useState<string | null>(null)
  const [aiLoadingIdx, setAiLoadingIdx] = useState<number | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const rowInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

  const showToast = (msg: string) => {
    setToastNotification(msg)
    setTimeout(() => setToastNotification(null), 3000)
  }

  // Add empty row
  const handleAddEmptyRow = (count: number = 1) => {
    const lastRow = rows[rows.length - 1]
    const newRows: HizliKalemRow[] = []
    for (let i = 0; i < count; i++) {
      newRows.push({
        id: `row-${Date.now()}-${Math.random()}`,
        tipi: lastRow?.tipi || defaultTipi,
        kalem_adi: '',
        miktar: 1,
        birim: lastRow?.birim || defaultBirim,
        tasinir_kodu: lastRow?.tasinir_kodu || '',
        okas_kodu: lastRow?.okas_kodu || '',
        kdv_orani: lastRow?.kdv_orani ?? 20,
        aciklama: ''
      })
    }
    setRows((prev) => [...prev, ...newRows])
  }

  // Update a specific cell
  const handleUpdateRow = (id: string, field: keyof HizliKalemRow, value: any) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)))
  }

  // Delete row
  const handleDeleteRow = (id: string) => {
    if (rows.length <= 1) {
      setRows([
        {
          id: `row-${Date.now()}`,
          tipi: defaultTipi,
          kalem_adi: '',
          miktar: 1,
          birim: defaultBirim,
          tasinir_kodu: '',
          okas_kodu: '',
          kdv_orani: 20,
          aciklama: ''
        }
      ])
      return
    }
    setRows((prev) => prev.filter((r) => r.id !== id))
  }

  // Duplicate a row
  const handleDuplicateRow = (idx: number) => {
    const target = rows[idx]
    if (!target) return
    const newRow: HizliKalemRow = {
      ...target,
      id: `row-dup-${Date.now()}-${Math.random()}`
    }
    const updated = [...rows]
    updated.splice(idx + 1, 0, newRow)
    setRows(updated)
    showToast(`Satır #${idx + 1} kopyalandı.`)
  }

  // Clear all
  const handleClearAll = () => {
    if (confirm('Tablodaki tüm satırları temizlemek istediğinize emin misiniz?')) {
      setRows([
        {
          id: 'row-1',
          tipi: defaultTipi,
          kalem_adi: '',
          miktar: 1,
          birim: defaultBirim,
          tasinir_kodu: '',
          okas_kodu: '',
          kdv_orani: 20,
          aciklama: ''
        },
        {
          id: 'row-2',
          tipi: defaultTipi,
          kalem_adi: '',
          miktar: 1,
          birim: defaultBirim,
          tasinir_kodu: '',
          okas_kodu: '',
          kdv_orani: 20,
          aciklama: ''
        }
      ])
    }
  }

  // Load Preset
  const handleApplyPreset = (preset: (typeof PRESET_PACKAGES)[0]) => {
    const generatedRows: HizliKalemRow[] = preset.items.map((item, idx) => ({
      id: `preset-${Date.now()}-${idx}`,
      tipi: preset.tipi,
      kalem_adi: item.kalem_adi,
      miktar: item.miktar,
      birim: item.birim || preset.birim,
      tasinir_kodu: preset.tasinir_kodu,
      okas_kodu: preset.okas_kodu,
      kdv_orani: preset.kdv,
      aciklama: item.aciklama
    }))

    setRows(generatedRows)
    showToast(`"${preset.name}" şablonu tabloya yüklendi.`)
  }

  // Excel Paste
  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (!text || !text.trim()) {
        alert('Panoda kopyalanmış herhangi bir metin veya Excel verisi bulunamadı.')
        return
      }

      const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0)

      if (lines.length === 0) return

      const parsedRows: HizliKalemRow[] = lines.map((line, idx) => {
        const cols = line.includes('\t')
          ? line.split('\t')
          : line.includes(';')
            ? line.split(';')
            : [line]

        const name = cols[0]?.trim() || ''
        const mkt = parseFloat(cols[1]?.replace(',', '.') || '1') || 1
        const brm = cols[2]?.trim() || defaultBirim
        const poz = cols[3]?.trim() || ''
        const okas = cols[4]?.trim() || ''
        const kdv = parseFloat(cols[5]?.replace(',', '.') || '20') || 20
        const note = cols[6]?.trim() || ''

        return {
          id: `pasted-${Date.now()}-${idx}`,
          tipi: defaultTipi,
          kalem_adi: name,
          miktar: mkt,
          birim: brm,
          tasinir_kodu: poz,
          okas_kodu: okas,
          kdv_orani: kdv,
          aciklama: note
        }
      })

      const nonEmptyExisting = rows.filter((r) => r.kalem_adi.trim().length > 0)
      setRows([...nonEmptyExisting, ...parsedRows])
      showToast(`✅ Excel / Panodan ${parsedRows.length} satır aktarıldı!`)
    } catch (err: any) {
      alert('Panodan okuma başarısız oldu: ' + err.message)
    }
  }

  // =========================================================================
  // EXCEL FILL DOWN & DRAG-TO-FILL ENGINE
  // =========================================================================

  /**
   * Column-level fill down: takes value from a source row (default row 0)
   * and copies it to ALL rows in the table.
   */
  const handleFillColumnDown = (field: keyof HizliKalemRow, fromRowIdx: number = 0) => {
    const sourceValue = rows[fromRowIdx]?.[field]
    if (sourceValue === undefined) return

    setRows((prev) =>
      prev.map((r, idx) => (idx >= fromRowIdx ? { ...r, [field]: sourceValue } : r))
    )

    const fieldLabels: Record<string, string> = {
      tipi: 'Tür',
      birim: 'Birim',
      okas_kodu: 'OKAS Kodu',
      tasinir_kodu: 'Taşınır / Poz No',
      kdv_orani: 'KDV Oranı',
      miktar: 'Miktar'
    }
    showToast(
      `"${fieldLabels[field] || field}" değeri (${sourceValue}) tüm alt satırlara uygulandı.`
    )
  }

  /**
   * Start dragging the fill handle from a cell
   */
  const handleStartDragFill = (e: React.MouseEvent, rowIdx: number, field: keyof HizliKalemRow) => {
    e.preventDefault()
    e.stopPropagation()

    const sourceValue = rows[rowIdx][field]
    setDragFill({
      isDragging: true,
      sourceRowIdx: rowIdx,
      sourceField: field,
      sourceValue,
      targetRowIdx: rowIdx
    })
  }

  /**
   * Double-click fill handle: immediately fills down to the end of the table
   */
  const handleDoubleClickFill = (rowIdx: number, field: keyof HizliKalemRow) => {
    handleFillColumnDown(field, rowIdx)
  }

  // Mouse move and mouse up listeners for drag-fill
  useEffect(() => {
    if (!dragFill?.isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      // Find element under cursor
      const el = document.elementFromPoint(e.clientX, e.clientY)
      const rowEl = el?.closest('[data-grid-row-idx]')
      if (rowEl) {
        const targetIdx = parseInt(rowEl.getAttribute('data-grid-row-idx') || '-1', 10)
        if (targetIdx >= 0 && targetIdx !== dragFill.targetRowIdx) {
          setDragFill((prev) => (prev ? { ...prev, targetRowIdx: targetIdx } : null))
        }
      }
    }

    const handleMouseUp = () => {
      if (dragFill && dragFill.isDragging) {
        const start = Math.min(dragFill.sourceRowIdx, dragFill.targetRowIdx)
        const end = Math.max(dragFill.sourceRowIdx, dragFill.targetRowIdx)
        const field = dragFill.sourceField
        const val = dragFill.sourceValue

        setRows((prev) =>
          prev.map((r, idx) => (idx >= start && idx <= end ? { ...r, [field]: val } : r))
        )

        showToast(`Excel Doldurma: Satır ${start + 1} - ${end + 1} arası güncellendi.`)
      }
      setDragFill(null)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [dragFill])

  /**
   * Keyboard handler (Ctrl+D for Excel Fill Down from cell above, Enter to add/focus next row)
   */
  const handleCellKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>,
    rowIdx: number,
    field: keyof HizliKalemRow
  ) => {
    // Ctrl + D -> Copy value from row directly above
    if ((e.ctrlKey || e.metaKey) && (e.key === 'd' || e.key === 'D')) {
      e.preventDefault()
      if (rowIdx > 0) {
        const aboveVal = rows[rowIdx - 1][field]
        if (aboveVal !== undefined) {
          handleUpdateRow(rows[rowIdx].id, field, aboveVal)
          showToast(`Üst satırdaki değer kopyalandı (Ctrl+D)`)
        }
      }
      return
    }

    // Enter in Kalem Adı -> move to next row or create new
    if (e.key === 'Enter' && field === 'kalem_adi') {
      e.preventDefault()
      if (rowIdx === rows.length - 1) {
        handleAddEmptyRow(1)
        setTimeout(() => {
          const nextIdx = rowIdx + 1
          const nextRow = rows[nextIdx]
          if (nextRow && rowInputRefs.current[nextRow.id]) {
            rowInputRefs.current[nextRow.id]?.focus()
          }
        }, 50)
      } else {
        const nextId = rows[rowIdx + 1]?.id
        if (nextId && rowInputRefs.current[nextId]) {
          rowInputRefs.current[nextId]?.focus()
        }
      }
    }
  }

  // AI Suggest OKAS for specific row
  const handleAiSuggestOkasForRow = async (rowIdx: number) => {
    const item = rows[rowIdx]
    const query = item?.kalem_adi?.trim() || activeDosya?.konu
    if (!query) {
      alert('Lütfen önce kalem adını girin.')
      return
    }

    setAiLoadingIdx(rowIdx)
    try {
      const prompt = `Aşağıdaki kamu alımı kalemi için Kamu İhale Kurumu OKAS (CPV) kodunu ver. Sadece "KOD: AÇIKLAMA" formatında yanıt ver. Örn: "30192700-6: Kırtasiye". Kalem: ${query}`
      const res = await (window as any).electron.ipcRenderer.invoke('ai:generate', { prompt })
      if (res.success && res.data) {
        const text = res.data.trim()
        const match = text.match(/^([\d-]+)/)
        const finalCode = match && match[1] ? match[1] : text
        handleUpdateRow(item.id, 'okas_kodu', finalCode)
        showToast(`OKAS Kodu belirlendi: ${finalCode}`)
      }
    } catch (e: any) {
      console.error(e)
    } finally {
      setAiLoadingIdx(null)
    }
  }

  const validRows = rows.filter((r) => r.kalem_adi.trim().length > 0)
  const validRowCount = validRows.length

  const handleSave = async () => {
    if (validRowCount === 0) {
      alert('Lütfen en az bir adet geçerli kalem adı giriniz.')
      return
    }

    setIsSaving(true)
    try {
      const firstRow = validRows[0] || rows[0]
      const success = await onSaveBatch(
        {
          tipi: firstRow?.tipi || defaultTipi,
          okas_kodu: firstRow?.okas_kodu?.trim() || undefined,
          tasinir_kodu_prefix: firstRow?.tasinir_kodu?.trim() || undefined,
          kdv_orani: firstRow?.kdv_orani ?? 20,
          birim: firstRow?.birim || defaultBirim
        },
        rows
      )

      if (success) {
        setRows([
          {
            id: 'row-1',
            tipi: defaultTipi,
            kalem_adi: '',
            miktar: 1,
            birim: defaultBirim,
            tasinir_kodu: '',
            okas_kodu: '',
            kdv_orani: 20,
            aciklama: ''
          },
          {
            id: 'row-2',
            tipi: defaultTipi,
            kalem_adi: '',
            miktar: 1,
            birim: defaultBirim,
            tasinir_kodu: '',
            okas_kodu: '',
            kdv_orani: 20,
            aciklama: ''
          },
          {
            id: 'row-3',
            tipi: defaultTipi,
            kalem_adi: '',
            miktar: 1,
            birim: defaultBirim,
            tasinir_kodu: '',
            okas_kodu: '',
            kdv_orani: 20,
            aciklama: ''
          }
        ])
      }
    } finally {
      setIsSaving(false)
    }
  }

  /**
   * Helper component: Excel Cell with Drag Handle
   */
  const renderCellWithFillHandle = (
    rowIdx: number,
    field: keyof HizliKalemRow,
    children: React.ReactNode
  ) => {
    const isHovered = hoveredCell?.rowIdx === rowIdx && hoveredCell?.field === field
    const isDragSource = dragFill?.sourceRowIdx === rowIdx && dragFill?.sourceField === field
    const isDragTarget =
      dragFill &&
      dragFill.sourceField === field &&
      rowIdx >= Math.min(dragFill.sourceRowIdx, dragFill.targetRowIdx) &&
      rowIdx <= Math.max(dragFill.sourceRowIdx, dragFill.targetRowIdx)

    return (
      <div
        className={cn(
          'relative group/cell w-full h-full flex items-center transition-all',
          isDragTarget && 'bg-blue-100/60 dark:bg-blue-900/40 outline-1 outline-blue-500'
        )}
        onMouseEnter={() => setHoveredCell({ rowIdx, field })}
        onMouseLeave={() => setHoveredCell(null)}
      >
        {children}

        {/* Excel Fill Handle (Sağ Alt Sürükleme Noktası) */}
        {(isHovered || isDragSource) && !dragFill?.isDragging && (
          <div
            onMouseDown={(e) => handleStartDragFill(e, rowIdx, field)}
            onDoubleClick={() => handleDoubleClickFill(rowIdx, field)}
            title="Aşağı sürükleyerek alt satırlara çoğaltın veya tümüne uygulamak için çift tıklayın (Ctrl+D)"
            className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-blue-600 border border-white dark:border-slate-900 rounded-2xs cursor-crosshair z-20 shadow-xs hover:scale-125 transition-transform"
          />
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3.5 animate-in fade-in duration-200 select-none">
      {/* Toast Notification */}
      {toastNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/90 text-white backdrop-blur-md px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-bottom-3">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastNotification}</span>
        </div>
      )}

      {/* TOP TOOLBAR: Hızlı Paketler, Excel Yapıştır & İpuçları */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
        {/* Sol: Hazır Paket Şablonları */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 lg:pb-0">
          <span className="text-[11px] font-bold text-slate-500 shrink-0 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            Hızlı Şablon:
          </span>
          {PRESET_PACKAGES.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(p)}
              className="text-[11px] font-semibold px-2.5 py-1 bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-900/40 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg shrink-0 transition-colors shadow-2xs cursor-pointer"
              title={`${p.name} (${p.items.length} Kalem)`}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* Sağ: Tablo Araçları */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handlePasteFromClipboard}
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            title="Excel veya tablodan kopyalanan satırları tek tıkla aktarır"
          >
            <Clipboard className="w-3.5 h-3.5" />
            Excel / Panodan Yapıştır
          </button>

          <button
            type="button"
            onClick={() => handleAddEmptyRow(5)}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            +5 Satır
          </button>

          <button
            type="button"
            onClick={handleClearAll}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors cursor-pointer"
            title="Tüm Satırları Temizle"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* EXCEL GRID İPUCU BARI */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/30 rounded-xl text-[11px] text-blue-800 dark:text-blue-300">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
          <span>
            <strong>Excel Sürükle-Doldur:</strong> Hücrenin sağ altındaki mavi kutucuğu aşağı
            sürükleyerek veya çift tıklayarak değeri alt satırlara çoğaltabilirsiniz. Sütun
            başlıklarındaki (
            <ArrowDownToLine className="w-3 h-3 inline text-blue-600 mx-0.5" />) butonuyla ilk
            satırı tüm sütuna kopyalayabilirsiniz. (Kısayol: <strong>Ctrl + D</strong>)
          </span>
        </div>
      </div>

      {/* EXCEL GRID SPREADSHEET */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs bg-white dark:bg-slate-900">
        <div className="max-h-[440px] overflow-x-auto overflow-y-auto custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse table-fixed">
            <thead className="bg-slate-100 dark:bg-slate-800/90 sticky top-0 z-10 text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                {/* # */}
                <th className="w-10 px-2 py-2.5 text-center text-slate-400">#</th>

                {/* Tür */}
                <th className="w-28 px-2 py-2.5">
                  <div className="flex items-center justify-between">
                    <span>Tür</span>
                    <button
                      type="button"
                      onClick={() => handleFillColumnDown('tipi', 0)}
                      title="1. Satırdaki Türü Tüm Satırlara Doldur"
                      className="p-0.5 text-slate-400 hover:text-blue-600 rounded transition-colors cursor-pointer"
                    >
                      <ArrowDownToLine className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </th>

                {/* Kalem Adı */}
                <th className="w-72 sm:w-80 px-3 py-2.5">
                  <span>
                    Kalem / İmalat Adı <span className="text-red-500">*</span>
                  </span>
                </th>

                {/* Miktar */}
                <th className="w-20 px-2 py-2.5 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span>Miktar</span>
                  </div>
                </th>

                {/* Birim */}
                <th className="w-28 px-2 py-2.5">
                  <div className="flex items-center justify-between">
                    <span>Birim</span>
                    <button
                      type="button"
                      onClick={() => handleFillColumnDown('birim', 0)}
                      title="1. Satırdaki Birimi Tüm Satırlara Doldur"
                      className="p-0.5 text-slate-400 hover:text-blue-600 rounded transition-colors cursor-pointer"
                    >
                      <ArrowDownToLine className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </th>

                {/* OKAS Kodu */}
                <th className="w-36 px-2 py-2.5">
                  <div className="flex items-center justify-between">
                    <span>OKAS Kodu</span>
                    <button
                      type="button"
                      onClick={() => handleFillColumnDown('okas_kodu', 0)}
                      title="1. Satırdaki OKAS Kodunu Tüm Satırlara Doldur"
                      className="p-0.5 text-slate-400 hover:text-blue-600 rounded transition-colors cursor-pointer"
                    >
                      <ArrowDownToLine className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </th>

                {/* Taşınır / Poz */}
                <th className="w-32 px-2 py-2.5">
                  <div className="flex items-center justify-between">
                    <span>{isYapim ? 'Poz No' : 'Taşınır No'}</span>
                    <button
                      type="button"
                      onClick={() => handleFillColumnDown('tasinir_kodu', 0)}
                      title="1. Satırdaki Kodu Tüm Satırlara Doldur"
                      className="p-0.5 text-slate-400 hover:text-blue-600 rounded transition-colors cursor-pointer"
                    >
                      <ArrowDownToLine className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </th>

                {/* KDV % */}
                <th className="w-24 px-2 py-2.5">
                  <div className="flex items-center justify-between">
                    <span>KDV</span>
                    <button
                      type="button"
                      onClick={() => handleFillColumnDown('kdv_orani', 0)}
                      title="1. Satırdaki KDV Oranını Tüm Satırlara Doldur"
                      className="p-0.5 text-slate-400 hover:text-blue-600 rounded transition-colors cursor-pointer"
                    >
                      <ArrowDownToLine className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </th>

                {/* Açıklama */}
                <th className="min-w-[140px] px-2.5 py-2.5">Açıklama / Not</th>

                {/* Aksiyon */}
                <th className="w-14 px-2 py-2.5 text-center"></th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-normal">
              {rows.map((row, idx) => (
                <tr
                  key={row.id}
                  data-grid-row-idx={idx}
                  className="hover:bg-blue-50/20 dark:hover:bg-slate-800/40 transition-colors group"
                >
                  {/* # Sıra No */}
                  <td className="px-2 py-1.5 text-center font-mono text-[11px] text-slate-400 font-bold">
                    {idx + 1}
                  </td>

                  {/* 1. TÜRU (Mal / Hizmet / Yapım) */}
                  <td className="px-1.5 py-1">
                    {renderCellWithFillHandle(
                      idx,
                      'tipi',
                      <select
                        value={row.tipi || defaultTipi}
                        onChange={(e) => handleUpdateRow(row.id, 'tipi', e.target.value)}
                        onKeyDown={(e) => handleCellKeyDown(e, idx, 'tipi')}
                        className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                      >
                        <option value="Mal">Mal</option>
                        <option value="Hizmet">Hizmet</option>
                        <option value="Yapım">Yapım</option>
                        <option value="Danışmanlık">Danışmanlık</option>
                      </select>
                    )}
                  </td>

                  {/* 2. KALEM ADI */}
                  <td className="px-1.5 py-1">
                    <input
                      ref={(el) => {
                        rowInputRefs.current[row.id] = el
                      }}
                      type="text"
                      value={row.kalem_adi}
                      onChange={(e) => handleUpdateRow(row.id, 'kalem_adi', e.target.value)}
                      onKeyDown={(e) => handleCellKeyDown(e, idx, 'kalem_adi')}
                      placeholder={`Örn: ${
                        idx === 0
                          ? isYapim
                            ? 'İç Cephe Boyası Yapılması'
                            : 'A4 Fotokopi Kağıdı 80gr'
                          : idx === 1
                            ? isYapim
                              ? 'Tavan Boyası Tamiratı'
                              : 'Plastik Telli Dosya'
                            : 'Kalem / İmalat Adı giriniz...'
                      }`}
                      className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-850 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                    />
                  </td>

                  {/* 3. MİKTAR */}
                  <td className="px-1.5 py-1">
                    {renderCellWithFillHandle(
                      idx,
                      'miktar',
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={row.miktar}
                        onChange={(e) =>
                          handleUpdateRow(row.id, 'miktar', parseFloat(e.target.value) || 1)
                        }
                        onKeyDown={(e) => handleCellKeyDown(e, idx, 'miktar')}
                        className="w-full text-center px-1.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold text-blue-600 dark:text-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    )}
                  </td>

                  {/* 4. BİRİM */}
                  <td className="px-1.5 py-1">
                    {renderCellWithFillHandle(
                      idx,
                      'birim',
                      <div className="relative w-full">
                        <input
                          type="text"
                          list={`units-list-${idx}`}
                          value={row.birim || defaultBirim}
                          onChange={(e) => handleUpdateRow(row.id, 'birim', e.target.value)}
                          onKeyDown={(e) => handleCellKeyDown(e, idx, 'birim')}
                          className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <datalist id={`units-list-${idx}`}>
                          {unitOptions.map((u: string, uIdx: number) => (
                            <option key={uIdx} value={u} />
                          ))}
                        </datalist>
                      </div>
                    )}
                  </td>

                  {/* 5. OKAS KODU */}
                  <td className="px-1.5 py-1">
                    {renderCellWithFillHandle(
                      idx,
                      'okas_kodu',
                      <div className="relative w-full flex items-center">
                        <input
                          type="text"
                          value={row.okas_kodu || ''}
                          onChange={(e) => handleUpdateRow(row.id, 'okas_kodu', e.target.value)}
                          onKeyDown={(e) => handleCellKeyDown(e, idx, 'okas_kodu')}
                          placeholder="Örn: 30192700-6"
                          className="w-full pl-2 pr-6 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleAiSuggestOkasForRow(idx)}
                          disabled={aiLoadingIdx === idx}
                          title="Bu kalem için AI ile OKAS Kodu Bul"
                          className="absolute right-1 text-purple-600 dark:text-purple-400 hover:text-purple-700 p-0.5 rounded cursor-pointer disabled:opacity-50"
                        >
                          {aiLoadingIdx === idx ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Sparkles className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    )}
                  </td>

                  {/* 6. TAŞINIR / POZ KODU */}
                  <td className="px-1.5 py-1">
                    {renderCellWithFillHandle(
                      idx,
                      'tasinir_kodu',
                      <input
                        type="text"
                        value={row.tasinir_kodu || ''}
                        onChange={(e) => handleUpdateRow(row.id, 'tasinir_kodu', e.target.value)}
                        onKeyDown={(e) => handleCellKeyDown(e, idx, 'tasinir_kodu')}
                        placeholder={isYapim ? 'Örn: 15.120' : '150.01.01'}
                        className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    )}
                  </td>

                  {/* 7. KDV ORANI */}
                  <td className="px-1.5 py-1">
                    {renderCellWithFillHandle(
                      idx,
                      'kdv_orani',
                      <select
                        value={row.kdv_orani ?? 20}
                        onChange={(e) =>
                          handleUpdateRow(row.id, 'kdv_orani', parseInt(e.target.value, 10))
                        }
                        onKeyDown={(e) => handleCellKeyDown(e, idx, 'kdv_orani')}
                        className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer text-center"
                      >
                        <option value={20}>%20</option>
                        <option value={10}>%10</option>
                        <option value={1}>%1</option>
                        <option value={0}>%0</option>
                      </select>
                    )}
                  </td>

                  {/* 8. AÇIKLAMA */}
                  <td className="px-1.5 py-1">
                    <input
                      type="text"
                      value={row.aciklama || ''}
                      onChange={(e) => handleUpdateRow(row.id, 'aciklama', e.target.value)}
                      onKeyDown={(e) => handleCellKeyDown(e, idx, 'aciklama')}
                      placeholder="Özellik, standart, marka..."
                      className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>

                  {/* 9. AKSİYONLAR */}
                  <td className="px-1.5 py-1 text-center">
                    <div className="flex items-center justify-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => handleDuplicateRow(idx)}
                        title="Bu Satırı Çoğalt"
                        className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteRow(row.id)}
                        title="Satırı Sil"
                        className="p-1 text-slate-300 hover:text-red-500 rounded transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tablo Alt Çubuğu (Yeni Satır & İpuçları) */}
        <div className="p-2.5 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => handleAddEmptyRow(1)}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5 cursor-pointer px-2 py-1"
          >
            <PlusCircle className="w-4 h-4" />
            Yeni Boş Satır Ekle (veya Enter tuşuna basın)
          </button>
          <div className="text-[11px] text-slate-400 flex items-center gap-3">
            <span>
              ✨ <strong>Ctrl+D:</strong> Üst satırı kopyalar
            </span>
            <span>
              🖱️ <strong>Çift Tık:</strong> Sütunu aşağı doldurur
            </span>
          </div>
        </div>
      </div>

      {/* ALT AKSİYON BUTONLARI */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              İptal
            </button>
          )}
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {validRowCount > 0
              ? `Toplam ${validRowCount} geçerli kalem kaydedilecek`
              : 'Henüz kalem adı girilmedi'}
          </span>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={validRowCount === 0 || isSaving}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Zap className="w-4 h-4 text-amber-300" />
          )}
          {activeDosyaId
            ? `${validRowCount} Kalemi Dosyaya Ekle`
            : `${validRowCount} Kalemi Kütüphaneye Kaydet`}
        </button>
      </div>
    </div>
  )
}

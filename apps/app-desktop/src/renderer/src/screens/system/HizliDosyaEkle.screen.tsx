import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Edit3,
  Plus,
  RefreshCw,
  Save,
  Trash2
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { useQueryClient } from '@tanstack/react-query'

interface DosyaRow {
  _key: string
  id: number | null // null => yeni kayit, number => guncelleme
  dosya_no: string
  dt_no: string
  dosya_adi: string
  aciklama: string
  ihale_turu: string
  ihale_sekli: string
  ihale_tarihi: string
  ihale_asamasi: string
  _dirty: boolean // kullanici degistirdi mi?
}

const IHALE_TURLERI = ['Mal', 'Hizmet', 'Yapım İşi', 'Danışmanlık']
const IHALE_SEKILLERI = ['22/d', '22/a', '22/b', '22/c', 'İhale (4734)', 'Diğer']
const IHALE_ASAMALARI = [
  'Hazırlık',
  'Piyasa Araştırması',
  'Teklif Aşaması',
  'Sözleşme',
  'Muayene & Kabul & Ödeme',
  'Tamamlandı',
  'İptal'
]

const mapTur = (t: string) => {
  if (t === 'Hizmet') return 'hizmet'
  if (t === 'Yapım İşi') return 'yapim_isi'
  if (t === 'Danışmanlık') return 'danismanlik'
  return 'mal'
}
const mapStatus = (a: string) => {
  if (a === 'Tamamlandı') return 'tamamlandi'
  if (a === 'İptal') return 'iptal'
  return 'devam_ediyor'
}
const reverseMapTur = (t: string) => {
  if (t === 'hizmet') return 'Hizmet'
  if (t === 'yapim_isi') return 'Yapım İşi'
  if (t === 'danismanlik') return 'Danışmanlık'
  return 'Mal'
}
const reverseMapStatus = (s: string) => {
  if (s === 'tamamlandi') return 'Tamamlandı'
  if (s === 'iptal') return 'İptal'
  return 'Hazırlık'
}

const emptyRow = (): DosyaRow => ({
  _key: Math.random().toString(36).slice(2),
  id: null,
  dosya_no: '',
  dt_no: '',
  dosya_adi: '',
  aciklama: '',
  ihale_turu: 'Mal',
  ihale_sekli: '22/d',
  ihale_tarihi: '',
  ihale_asamasi: 'Hazırlık',
  _dirty: false
})

export default function HizliDosyaEkleScreen(): React.JSX.Element {
  const queryClient = useQueryClient()
  const [rows, setRows] = useState<DosyaRow[]>([])
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    inserted: number
    updated: number
    errors: string[]
  } | null>(null)
  const [loadLimit, setLoadLimit] = useState(50)
  const tableRef = useRef<HTMLDivElement>(null)

  const updateRow = (key: string, field: keyof DosyaRow, value: string) => {
    setRows((prev) =>
      prev.map((r) => (r._key === key ? { ...r, [field]: value, _dirty: true } : r))
    )
  }

  const addRow = () => {
    setRows((prev) => [...prev, emptyRow()])
    setTimeout(() => {
      tableRef.current?.scrollTo({
        top: tableRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }, 50)
  }

  const removeRow = async (row: DosyaRow) => {
    const isPersisted = row.id !== null
    const hasData =
      row.dosya_no.trim() || row.dt_no.trim() || row.dosya_adi.trim() || row.aciklama.trim()

    if (isPersisted) {
      if (
        !confirm(
          `"${
            row.dosya_adi || 'Dosya'
          }" kaydını veritabanından tamamen silmek istediğinize emin misiniz?`
        )
      ) {
        return
      }
      setIsSaving(true)
      try {
        const res = await window.electron.ipcRenderer.invoke(
          'db:run',
          'UPDATE DATA_TeminDosyasi SET is_deleted = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [row.id]
        )
        if (res.success) {
          queryClient.invalidateQueries({ queryKey: ['dosyalar'] })
        } else {
          alert('Silme işlemi başarısız oldu: ' + res.error)
          return
        }
      } catch (err: unknown) {
        alert('Hata: ' + (err instanceof Error ? err.message : String(err)))
        return
      } finally {
        setIsSaving(false)
      }
    } else if (hasData) {
      if (
        !confirm(
          'Satırdaki doldurulmuş verileri iptal edip satırı silmek istediğinize emin misiniz?'
        )
      ) {
        return
      }
    }

    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r._key !== row._key) : [emptyRow()]))
    setSelectedKeys((prev) => {
      const next = new Set(prev)
      next.delete(row._key)
      return next
    })
  }

  const loadExisting = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await window.electron.ipcRenderer.invoke(
        'db:query',
        `SELECT id, temin_no, ekap_no, konu, isin_aciklamasi, ihale_tipi, ihale_sekli, dosya_acilis_tarihi, status, tur
         FROM DATA_TeminDosyasi
         WHERE is_deleted = 0
         ORDER BY COALESCE(dosya_acilis_tarihi, created_at) DESC, id DESC
         LIMIT ?`,
        [loadLimit]
      )
      if (res.success) {
        const loaded: DosyaRow[] = res.data.map((d: any) => ({
          _key: Math.random().toString(36).slice(2),
          id: d.id,
          dosya_no: d.temin_no || '',
          dt_no: d.ekap_no || '',
          dosya_adi: d.konu || '',
          aciklama: d.isin_aciklamasi || '',
          ihale_turu: reverseMapTur(d.tur || 'mal'),
          ihale_sekli: d.ihale_sekli || '22/d',
          ihale_tarihi: d.dosya_acilis_tarihi || '',
          ihale_asamasi: reverseMapStatus(d.status || 'devam_ediyor'),
          _dirty: false
        }))
        setRows(loaded.length > 0 ? loaded : [emptyRow(), emptyRow(), emptyRow()])
        setSelectedKeys(new Set())
        setResult(null)
      } else {
        alert('Kayıtlar yüklenemedi: ' + res.error)
      }
    } catch (err: unknown) {
      alert('Hata: ' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setIsLoading(false)
    }
  }, [loadLimit])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadExisting()
    }, 0)
    return () => clearTimeout(timer)
  }, [loadExisting])

  const handleSave = async () => {
    const toProcess = rows.filter((r) => r.dosya_adi.trim() !== '' && r._dirty)
    const toInsert = toProcess.filter((r) => r.id === null)
    const toUpdate = toProcess.filter((r) => r.id !== null)

    if (toProcess.length === 0) {
      alert('Değiştirilmiş veya doldurulmuş satır yok.')
      return
    }

    setIsSaving(true)
    setResult(null)
    let insertCount = 0
    let updateCount = 0
    const errors: string[] = []

    for (const row of toInsert) {
      try {
        const res = await window.electron.ipcRenderer.invoke(
          'db:run',
          `INSERT INTO DATA_TeminDosyasi
            (temin_no, ekap_no, konu, isin_aciklamasi, ihale_tipi, ihale_sekli, dosya_acilis_tarihi, status, tur, is_deleted)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
          [
            row.dosya_no || null,
            row.dt_no || null,
            row.dosya_adi.trim(),
            row.aciklama || null,
            row.ihale_turu || 'Mal',
            row.ihale_sekli || null,
            row.ihale_tarihi || null,
            mapStatus(row.ihale_asamasi),
            mapTur(row.ihale_turu)
          ]
        )
        if (res.success) {
          insertCount++
        } else {
          errors.push(`EKLE "${row.dosya_adi}" - ${res.error}`)
        }
      } catch (err: unknown) {
        errors.push(`EKLE "${row.dosya_adi}" - ${err instanceof Error ? err.message : String(err)}`)
      }
    }

    for (const row of toUpdate) {
      try {
        const res = await window.electron.ipcRenderer.invoke(
          'db:run',
          `UPDATE DATA_TeminDosyasi SET
            temin_no = ?, ekap_no = ?, konu = ?, isin_aciklamasi = ?,
            ihale_tipi = ?, ihale_sekli = ?, dosya_acilis_tarihi = ?,
            status = ?, tur = ?, updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [
            row.dosya_no || null,
            row.dt_no || null,
            row.dosya_adi.trim(),
            row.aciklama || null,
            row.ihale_turu || 'Mal',
            row.ihale_sekli || null,
            row.ihale_tarihi || null,
            mapStatus(row.ihale_asamasi),
            mapTur(row.ihale_turu),
            row.id
          ]
        )
        if (res.success) {
          updateCount++
          setRows((prev) => prev.map((r) => (r._key === row._key ? { ...r, _dirty: false } : r)))
        } else {
          errors.push(`GÜNCELLE "${row.dosya_adi}" - ${res.error}`)
        }
      } catch (err: unknown) {
        errors.push(
          `GÜNCELLE "${row.dosya_adi}" - ${err instanceof Error ? err.message : String(err)}`
        )
      }
    }

    setResult({ inserted: insertCount, updated: updateCount, errors })
    setIsSaving(false)

    if (insertCount > 0) {
      queryClient.invalidateQueries({ queryKey: ['dosyalar'] })
      const erroredNames = new Set(
        errors.filter((e) => e.startsWith('EKLE')).map((e) => e.split('"')[1])
      )
      setRows((prev) =>
        prev.filter(
          (r) => r.id !== null || r.dosya_adi.trim() === '' || erroredNames.has(r.dosya_adi.trim())
        )
      )
    }
    if (updateCount > 0) {
      queryClient.invalidateQueries({ queryKey: ['dosyalar'] })
    }
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      const lines = text.trim().split('\n').filter(Boolean)
      const newRows: DosyaRow[] = lines.map((line) => {
        const c = line.split('\t')
        return {
          _key: Math.random().toString(36).slice(2),
          id: null,
          dosya_no: c[0]?.trim() || '',
          dt_no: c[1]?.trim() || '',
          dosya_adi: c[2]?.trim() || '',
          aciklama: c[3]?.trim() || '',
          ihale_turu: c[4]?.trim() || 'Mal',
          ihale_sekli: c[5]?.trim() || '22/d',
          ihale_tarihi: c[6]?.trim() || '',
          ihale_asamasi: c[7]?.trim() || 'Hazırlık',
          _dirty: true
        }
      })
      if (newRows.length > 0) {
        setRows((prev) => {
          const allEmpty = prev.every((r) => r.dosya_adi === '' && r.id === null)
          return allEmpty ? newRows : [...prev, ...newRows]
        })
      }
    } catch {
      alert('Pano okuma başarısız.')
    }
  }

  const toggleSelectRow = (key: string) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  const toggleSelectAll = () => {
    const validRows = rows.filter((r) => r.dosya_adi.trim() !== '')
    if (selectedKeys.size === validRows.length && validRows.length > 0) {
      setSelectedKeys(new Set())
    } else {
      setSelectedKeys(new Set(validRows.map((r) => r._key)))
    }
  }

  const handleBulkDelete = async () => {
    const selectedRows = rows.filter((r) => selectedKeys.has(r._key))
    const idsToDelete = selectedRows.map((r) => r.id).filter((id): id is number => id !== null)

    if (idsToDelete.length === 0) {
      if (
        !confirm('Seçilen kaydedilmemiş satırları listeden kaldırmak istediğinize emin misiniz?')
      ) {
        return
      }
      setRows((prev) => prev.filter((r) => !selectedKeys.has(r._key)))
      setSelectedKeys(new Set())
      return
    }

    if (
      !confirm(
        `Seçilen ${idsToDelete.length} dosyayı veritabanından tamamen silmek istediğinize emin misiniz?`
      )
    ) {
      return
    }

    setIsSaving(true)
    let deletedCount = 0
    const errors: string[] = []

    for (const id of idsToDelete) {
      try {
        const res = await window.electron.ipcRenderer.invoke(
          'db:run',
          'UPDATE DATA_TeminDosyasi SET is_deleted = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [id]
        )
        if (res.success) {
          deletedCount++
        } else {
          errors.push(`ID #${id} silinemedi: ${res.error}`)
        }
      } catch (err: unknown) {
        errors.push(`ID #${id} silinemedi: ${err instanceof Error ? err.message : String(err)}`)
      }
    }

    setIsSaving(false)
    queryClient.invalidateQueries({ queryKey: ['dosyalar'] })

    setRows((prev) => prev.filter((r) => r.id === null || !idsToDelete.includes(r.id)))
    setSelectedKeys(new Set())

    if (errors.length > 0) {
      alert('Bazı dosyalar silinirken hata oluştu:\n' + errors.join('\n'))
    } else {
      alert(`${deletedCount} dosya başarıyla silindi.`)
    }
  }

  const handleBulkChangeAsama = (newAsama: string) => {
    setRows((prev) =>
      prev.map((r) =>
        selectedKeys.has(r._key) ? { ...r, ihale_asamasi: newAsama, _dirty: true } : r
      )
    )
  }

  const handleBulkChangeTur = (newTur: string) => {
    setRows((prev) =>
      prev.map((r) => (selectedKeys.has(r._key) ? { ...r, ihale_turu: newTur, _dirty: true } : r))
    )
  }

  const newCount = rows.filter((r) => r.dosya_adi.trim() !== '' && r.id === null && r._dirty).length
  const updateCount = rows.filter(
    (r) => r.dosya_adi.trim() !== '' && r.id !== null && r._dirty
  ).length
  const totalDirty = newCount + updateCount

  const cell =
    'w-full h-8 px-2 text-sm bg-transparent border border-transparent focus:border-blue-400 focus:bg-white dark:focus:bg-slate-900 rounded-lg outline-none transition-colors placeholder:text-slate-300 dark:placeholder:text-slate-700'
  const sel =
    'w-full h-8 pl-2 pr-6 text-sm bg-transparent border border-transparent focus:border-blue-400 focus:bg-white dark:focus:bg-slate-900 rounded-lg outline-none transition-colors appearance-none cursor-pointer'

  const validRowsCount = rows.filter((r) => r.dosya_adi.trim() !== '').length
  const isAllSelected = validRowsCount > 0 && selectedKeys.size === validRowsCount

  return (
    <div className="flex flex-col gap-5 h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Edit3 className="w-7 h-7 text-blue-600" />
            Hızlı Dosya Ekle / Güncelle
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Yeni kayıt ekleyin veya mevcut dosyaları yükleyip toplu düzenleyin.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Mevcut kayıtları yükle */}
          <div className="flex items-center gap-1 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <select
              title="Kaç kayıt yüklensin"
              value={loadLimit}
              onChange={(e) => setLoadLimit(Number(e.target.value))}
              className="h-9 pl-3 pr-1 text-sm bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 outline-none border-r border-slate-200 dark:border-slate-700"
            >
              {[25, 50, 100, 200, 500].map((n) => (
                <option key={n} value={n}>
                  Son {n}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={isLoading}
              onClick={loadExisting}
              className="flex items-center gap-1.5 h-9 px-3 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Yükleniyor...' : 'Yazıları Yükle'}
            </button>
          </div>

          <Button
            variant="outline"
            className="gap-2 text-sm rounded-xl h-9 px-4"
            onClick={handlePaste}
          >
            <ClipboardList className="w-4 h-4" /> Panodan Yapıştır
          </Button>
          <Button variant="outline" className="gap-2 text-sm rounded-xl h-9 px-4" onClick={addRow}>
            <Plus className="w-4 h-4" /> Satır Ekle
          </Button>
          <Button
            className="gap-2 text-sm rounded-xl h-9 px-5 bg-blue-600 hover:bg-blue-700 text-white shadow-sm disabled:opacity-60"
            onClick={handleSave}
            disabled={isSaving || totalDirty === 0}
          >
            <Save className="w-4 h-4" />
            {isSaving
              ? 'Kaydediliyor...'
              : totalDirty === 0
                ? 'Değişiklik Yok'
                : `${newCount > 0 ? `${newCount} Ekle` : ''}${
                    newCount > 0 && updateCount > 0 ? ' + ' : ''
                  }${updateCount > 0 ? `${updateCount} Güncelle` : ''}`}
          </Button>
        </div>
      </div>

      {/* Toplu İşlem Paneli */}
      {selectedKeys.size > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-150 dark:border-blue-900/30 rounded-xl text-sm animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-blue-700 dark:text-blue-400">
              {selectedKeys.size} satır seçildi:
            </span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 dark:text-slate-400">Aşama:</span>
              <select
                title="Toplu aşama seçin"
                onChange={(e) => {
                  if (e.target.value) {
                    handleBulkChangeAsama(e.target.value)
                    e.target.value = ''
                  }
                }}
                className="h-8 px-2 text-xs rounded border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
              >
                <option value="">Seçin...</option>
                {IHALE_ASAMALARI.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 dark:text-slate-400">Tür:</span>
              <select
                title="Toplu tür seçin"
                onChange={(e) => {
                  if (e.target.value) {
                    handleBulkChangeTur(e.target.value)
                    e.target.value = ''
                  }
                }}
                className="h-8 px-2 text-xs rounded border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
              >
                <option value="">Seçin...</option>
                {IHALE_TURLERI.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <Button
              variant="outline"
              onClick={handleBulkDelete}
              className="h-8 text-xs text-red-600 dark:text-red-400 border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Seçilenleri Sil
            </Button>
          </div>
        </div>
      )}

      {/* Sonuç Bildirimi */}
      {result && (
        <div
          className={`flex items-start gap-3 p-4 rounded-xl border text-sm ${
            result.errors.length === 0
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
              : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400'
          }`}
        >
          {result.errors.length === 0 ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-semibold">
              {result.inserted > 0 && `${result.inserted} yeni dosya eklendi. `}
              {result.updated > 0 && `${result.updated} dosya güncellendi.`}
              {result.errors.length > 0 && ` ${result.errors.length} hatalı kayıt.`}
            </p>
            {result.errors.map((e, i) => (
              <p key={i} className="text-xs mt-0.5 opacity-80">
                • {e}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* İpucu */}
      <p className="text-xs text-slate-400 dark:text-slate-500 -mb-2">
        <span className="inline-block w-2.5 h-2.5 rounded bg-slate-200 dark:bg-slate-700 mr-1"></span>Mevcut •{' '}
        <span className="inline-block w-2.5 h-2.5 rounded bg-amber-200 dark:bg-amber-900 mr-1"></span>Değiştirilen Mevcut •{' '}
        <span className="inline-block w-2.5 h-2.5 rounded bg-green-200 dark:bg-green-900 mr-1"></span>Yeni Kayıt
        &nbsp;·&nbsp; Excel sütun sırası:{' '}
        <strong>
          Dosya No | DT No | Dosya Adı | Açıklama | İhale Türü | Şekli | Tarih | Aşama
        </strong>
      </p>

      {/* Tablo */}
      <div
        ref={tableRef}
        className="flex-1 overflow-auto rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
      >
        <table className="w-full text-sm border-collapse min-w-[1100px]">
          <thead className="sticky top-0 z-10">
            <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th className="w-10 px-3 py-3 text-center">
                <input
                  type="checkbox"
                  title="Tümünü Seç"
                  checked={isAllSelected}
                  onChange={toggleSelectAll}
                  className="rounded border-slate-350 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                />
              </th>
              <th className="w-16 px-3 py-3 text-center">ID</th>
              <th className="px-3 py-3 text-left whitespace-nowrap">Dosya No</th>
              <th className="px-3 py-3 text-left whitespace-nowrap">D.T. No</th>
              <th className="px-3 py-3 text-left whitespace-nowrap">Dosya Adı *</th>
              <th className="px-3 py-3 text-left whitespace-nowrap">Açıklama</th>
              <th className="px-3 py-3 text-left whitespace-nowrap">İhale Türü</th>
              <th className="px-3 py-3 text-left whitespace-nowrap">İhale Şekli</th>
              <th className="px-3 py-3 text-left whitespace-nowrap">İhale Tarihi</th>
              <th className="px-3 py-3 text-left whitespace-nowrap">İhale Aşaması</th>
              <th className="w-10 px-3 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
            {rows.map((row) => {
              const isSelected = selectedKeys.has(row._key)
              return (
                <tr
                  key={row._key}
                  className={`group transition-colors ${
                    isSelected
                      ? 'bg-blue-100/50 dark:bg-blue-900/30 hover:bg-blue-100/80 dark:hover:bg-blue-900/40'
                      : row._dirty && row.dosya_adi.trim()
                        ? row.id !== null
                          ? 'bg-amber-100/50 dark:bg-amber-900/30 hover:bg-amber-100/80 dark:hover:bg-amber-900/40'
                          : 'bg-green-50/60 dark:bg-green-900/20 hover:bg-green-50 dark:hover:bg-green-900/30'
                        : row.id !== null
                          ? 'bg-slate-100/80 dark:bg-slate-800/40 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                          : 'bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900'
                  }`}
                >
                  <td className="px-3 py-1.5 text-center">
                    {row.dosya_adi.trim() !== '' && (
                      <input
                        type="checkbox"
                        title="Seç"
                        checked={isSelected}
                        onChange={() => toggleSelectRow(row._key)}
                        className="rounded border-slate-350 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                      />
                    )}
                  </td>

                  <td className="px-3 py-1.5 text-center">
                    {row.id !== null ? (
                      <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded">
                        #{row.id}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-300 dark:text-slate-700">YENİ</span>
                    )}
                  </td>

                  <td className="px-2 py-1.5">
                    <input
                      type="text"
                      value={row.dosya_no}
                      onChange={(e) => updateRow(row._key, 'dosya_no', e.target.value)}
                      placeholder="2025/001"
                      className={`${cell} min-w-[90px]`}
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      type="text"
                      value={row.dt_no}
                      onChange={(e) => updateRow(row._key, 'dt_no', e.target.value)}
                      placeholder="DT-001"
                      className={`${cell} min-w-[80px]`}
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      type="text"
                      value={row.dosya_adi}
                      onChange={(e) => updateRow(row._key, 'dosya_adi', e.target.value)}
                      placeholder="Kırtasiye Alımı..."
                      className={`${cell} min-w-[200px]`}
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      type="text"
                      value={row.aciklama}
                      onChange={(e) => updateRow(row._key, 'aciklama', e.target.value)}
                      placeholder="Opsiyonel..."
                      className={`${cell} min-w-[130px]`}
                    />
                  </td>

                  <td className="px-2 py-1.5">
                    <div className="relative min-w-[100px]">
                      <select
                        title="İhale türü"
                        value={row.ihale_turu}
                        onChange={(e) => updateRow(row._key, 'ihale_turu', e.target.value)}
                        className={sel}
                      >
                        {IHALE_TURLERI.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                    </div>
                  </td>
                  <td className="px-2 py-1.5">
                    <div className="relative min-w-[85px]">
                      <select
                        title="İhale şekli"
                        value={row.ihale_sekli}
                        onChange={(e) => updateRow(row._key, 'ihale_sekli', e.target.value)}
                        className={sel}
                      >
                        {IHALE_SEKILLERI.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                    </div>
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      type="date"
                      value={row.ihale_tarihi}
                      onChange={(e) => updateRow(row._key, 'ihale_tarihi', e.target.value)}
                      className={`${cell} min-w-[130px]`}
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <div className="relative min-w-[120px]">
                      <select
                        title="İhale aşaması"
                        value={row.ihale_asamasi}
                        onChange={(e) => updateRow(row._key, 'ihale_asamasi', e.target.value)}
                        className={sel}
                      >
                        {IHALE_ASAMALARI.map((a) => (
                          <option key={a} value={a}>
                            {a}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                    </div>
                  </td>
                  <td className="px-2 py-1.5">
                    <button
                      type="button"
                      onClick={() => removeRow(row)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={addRow}
        className="flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-sm text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
      >
        <Plus className="w-4 h-4" /> Yeni Satır Ekle
      </button>
    </div>
  )
}

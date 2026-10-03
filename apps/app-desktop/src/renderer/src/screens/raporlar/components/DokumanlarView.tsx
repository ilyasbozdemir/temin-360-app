import React, { useState } from 'react'
import {
  FileText,
  Archive,
  Download,
  Plus,
  Search,
  FileCode,
  FileSpreadsheet,
  Trash2,
  ExternalLink,
  Printer
} from 'lucide-react'
import { RaporFilters } from '../raporlar.hooks'
import { useDokumanlarRaporu, RaporDokumanItem } from '../useDokumanlarRaporu'
import { DokumanEkleModal } from './DokumanEkleModal'

interface DokumanlarViewProps {
  filters: RaporFilters
}

export function DokumanlarView({ filters }: DokumanlarViewProps): React.JSX.Element {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const { data, loading, error, refetch } = useDokumanlarRaporu(filters, searchTerm)

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(data.map((d) => d.id))
    } else {
      setSelectedIds([])
    }
  }

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleExportZip = async (targetData: RaporDokumanItem[]) => {
    if (!targetData.length) return
    const zipFiles = targetData.map((item) => ({
      name: item.dosya_adi.endsWith('.pdf') || item.dosya_adi.endsWith('.zip')
        ? item.dosya_adi
        : `${item.dosya_adi}.pdf`,
      html: `<html><head><meta charset="utf-8"/><title>${item.dosya_adi}</title></head><body><h1>${item.ihale_no} - ${item.ihale_adi}</h1><h2>Belge: ${item.dosya_adi}</h2><p>Tarih: ${item.eklenme_tarihi}</p></body></html>`
    }))

    await window.electron?.ipcRenderer?.invoke('belge:export-zip', {
      zipName: `Ihale_Dokumanlari_${new Date().getFullYear()}.zip`,
      files: zipFiles
    })
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Bu doküman kaydını silmek istediğinize emin misiniz?')) return
    await window.electron?.ipcRenderer?.invoke('db:query', 'DELETE FROM DATA_TeminBelge WHERE id = ?', [id])
    refetch()
  }

  const handleExportCSV = () => {
    if (data.length === 0) return
    const headers = ['İhale No', 'İhale Adı', 'Dosya Adı', 'Format', 'Eklenme Tarihi', 'Birim']
    const rows = data.map((d) => [
      `"${d.ihale_no}"`,
      `"${d.ihale_adi.replace(/"/g, '""')}"`,
      `"${d.dosya_adi.replace(/"/g, '""')}"`,
      `"${d.dosya_formati}"`,
      `"${d.eklenme_tarihi}"`,
      `"${d.birim || ''}"`
    ])
    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `ihale_dokumanlari_raporu_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const getFormatBadge = (fmt: string) => {
    switch (fmt) {
      case 'ZIP':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200'
      case 'DOCX':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200'
      case 'XLSX':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200'
      default:
        return 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200'
    }
  }

  return (
    <div className="space-y-4">
      {/* Top Header & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Archive className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              İhale & Temin Dokümanları ve Arşiv Listesi
            </h2>
            <p className="text-xs text-slate-400">Toplam {data.length} kayıtlı doküman/ek</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="İhale veya dosya ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-100 pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary w-44"
            />
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Doküman Ekle
          </button>

          {selectedIds.length > 0 && (
            <button
              onClick={() => handleExportZip(data.filter((d) => selectedIds.includes(d.id)))}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 rounded-lg hover:bg-amber-100"
            >
              <Download className="w-3.5 h-3.5" /> Seçilenleri ZIP İndir ({selectedIds.length})
            </button>
          )}

          <button
            onClick={() => handleExportZip(data)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200"
          >
            <Archive className="w-3.5 h-3.5" /> Tümünü ZIP İndir
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Excel/CSV
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" /> Yazdır
          </button>
        </div>
      </div>

      {/* Table matching user screenshot */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-emerald-50/80 dark:bg-slate-700/60 text-slate-800 dark:text-slate-200 font-bold border-b border-emerald-100 dark:border-slate-600">
              <tr>
                <th className="py-3 px-3 w-8 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === data.length && data.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300"
                  />
                </th>
                <th className="py-3 px-4 font-bold text-slate-800 dark:text-slate-100">İhale No</th>
                <th className="py-3 px-4 font-bold text-slate-800 dark:text-slate-100">İhale Adı</th>
                <th className="py-3 px-4 font-bold text-slate-800 dark:text-slate-100">Dosya</th>
                <th className="py-3 px-4 font-bold text-slate-800 dark:text-slate-100">Eklenme Tarihi</th>
                <th className="py-3 px-4 text-right font-bold text-slate-800 dark:text-slate-100">#</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Dokümanlar yükleniyor...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Archive className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    Henüz kayıtlı veya eklenmiş ihale dokümanı bulunamadı.
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors"
                  >
                    <td className="py-3 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => toggleSelect(item.id)}
                        className="rounded border-slate-300"
                      />
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-700 dark:text-slate-200">
                      {item.ihale_no}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-100 max-w-xs truncate">
                      {item.ihale_adi}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="font-medium text-slate-700 dark:text-slate-200">
                          {item.dosya_adi}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getFormatBadge(
                            item.dosya_formati
                          )}`}
                        >
                          {item.dosya_formati}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {item.eklenme_tarihi || '-'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleExportZip([item])}
                          title="ZIP İndir"
                          className="p-1.5 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          title="Sil"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DokumanEkleModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={refetch}
      />
    </div>
  )
}

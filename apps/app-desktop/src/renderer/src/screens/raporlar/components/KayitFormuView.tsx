import React from 'react'
import { Printer, Download, Building2, Tag, Calendar, FileText, CheckCircle2, Clock } from 'lucide-react'
import { useRaporlarData } from '../raporlar.hooks'

const fmt = (n: number) =>
  n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₺'

interface KayitFormuViewProps {
  ay: string
  yil: string
}

export const KayitFormuView: React.FC<KayitFormuViewProps> = ({ ay, yil }) => {
  const { data: rows, loading } = useRaporlarData(yil, ay)

  const toplamKdvHaric = rows.reduce((s, r) => s + r.toplam_tutar, 0)
  const toplamKdvDahil = rows.reduce((s, r) => s + r.kdv_dahil_tutar, 0)

  const handleExportCSV = (): void => {
    if (rows.length === 0) return
    const headers = [
      'Sıra',
      'Dosya No',
      'Açılış Tarihi',
      'Temin/Onay Tarihi',
      'İşin Adı / Konusu',
      'Alım Türü',
      'Yasal Madde',
      'Kazanan Yüklenici Firma',
      'VKN / TCKN',
      'Tutar (KDV Hariç)',
      'Tutar (KDV Dahil)',
      'Durum'
    ]

    const csvContent = [
      headers.join(';'),
      ...rows.map((r, i) =>
        [
          i + 1,
          `"${r.dosya_no}"`,
          `"${r.dosya_acilis_tarihi || '-'}"`,
          `"${r.temin_tarihi || r.tarih || '-'}"`,
          `"${r.is_adi.replace(/"/g, '""')}"`,
          `"${r.alim_turu}"`,
          `"${r.madde}"`,
          `"${(r.kazanan_firma || '-').replace(/"/g, '""')}"`,
          `"${r.kazanan_vkn || '-'}"`,
          r.toplam_tutar.toFixed(2),
          r.kdv_dahil_tutar.toFixed(2),
          `"${r.durum || 'Tamamlandı'}"`
        ].join(';')
      )
    ].join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Dogrudan_Temin_Kayit_Formu_${yil}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handlePrint = (): void => {
    window.print()
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Doğrudan Temin Kayıt & Harcama Listesi
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {yil} Bütçe Yılı • {rows.length} kayıt listelendi
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" /> Yazdır
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white transition-colors cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" /> Excel / CSV İndir
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400 text-sm">Kayıtlar yükleniyor...</div>
      ) : rows.length === 0 ? (
        <div className="text-center py-16 text-slate-400 dark:text-slate-600 text-sm bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
          {yil} yılına ait doğrudan temin dosyası bulunamadı.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                <th className="px-3.5 py-3 text-left w-12">#</th>
                <th className="px-3.5 py-3 text-left">Dosya No</th>
                <th className="px-3.5 py-3 text-left">Tarihler</th>
                <th className="px-3.5 py-3 text-left">İşin Adı & Konusu</th>
                <th className="px-3.5 py-3 text-left">Alım Türü & Madde</th>
                <th className="px-3.5 py-3 text-left">Kazanan Yüklenici</th>
                <th className="px-3.5 py-3 text-right">Tutar (KDV Hariç)</th>
                <th className="px-3.5 py-3 text-right">KDV Dahil</th>
                <th className="px-3.5 py-3 text-center">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {rows.map((row, i) => (
                <tr
                  key={row.id}
                  className={`hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-colors ${
                    i % 2 === 1 ? 'bg-slate-50/40 dark:bg-slate-800/20' : ''
                  }`}
                >
                  <td className="px-3.5 py-3 text-slate-400 font-mono font-bold">{i + 1}</td>
                  <td className="px-3.5 py-3 font-mono font-bold text-slate-800 dark:text-slate-100">
                    {row.dosya_no}
                  </td>
                  <td className="px-3.5 py-3 space-y-0.5 whitespace-nowrap">
                    <div className="text-[11px] font-mono text-slate-700 dark:text-slate-200 flex items-center gap-1">
                      <Calendar size={11} className="text-blue-500" />
                      <span>{row.temin_tarihi || row.tarih || '-'}</span>
                    </div>
                    {row.dosya_acilis_tarihi && row.dosya_acilis_tarihi !== row.temin_tarihi && (
                      <div className="text-[10px] text-slate-400">
                        Açılış: {row.dosya_acilis_tarihi}
                      </div>
                    )}
                  </td>
                  <td className="px-3.5 py-3 max-w-[240px]">
                    <div className="font-semibold text-slate-800 dark:text-slate-200 truncate" title={row.is_adi}>
                      {row.is_adi}
                    </div>
                  </td>
                  <td className="px-3.5 py-3 space-y-0.5 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold text-[11px]">
                      <Tag size={10} /> {row.alim_turu}
                    </span>
                    <div className="text-[10px] text-slate-400 font-medium">4734 Md. 22/d</div>
                  </td>
                  <td className="px-3.5 py-3 max-w-[200px]">
                    <div className="font-medium text-slate-700 dark:text-slate-200 flex items-center gap-1 truncate" title={row.kazanan_firma}>
                      <Building2 size={12} className="text-slate-400 shrink-0" />
                      <span className="truncate">{row.kazanan_firma}</span>
                    </div>
                    {row.kazanan_vkn && (
                      <div className="text-[10px] text-slate-400 font-mono">VKN: {row.kazanan_vkn}</div>
                    )}
                  </td>
                  <td className="px-3.5 py-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                    {fmt(row.toplam_tutar)}
                  </td>
                  <td className="px-3.5 py-3 text-right font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    {fmt(row.kdv_dahil_tutar)}
                  </td>
                  <td className="px-3.5 py-3 text-center whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                      <CheckCircle2 size={10} /> {row.durum}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-300 dark:border-slate-600 bg-slate-100/70 dark:bg-slate-800/80 font-bold">
                <td colSpan={6} className="px-3.5 py-3 text-right text-slate-700 dark:text-slate-200 text-xs">
                  GENEL TOPLAM ({rows.length} Alım Dosyası):
                </td>
                <td className="px-3.5 py-3 text-right text-emerald-700 dark:text-emerald-400 font-mono text-sm">
                  {fmt(toplamKdvHaric)}
                </td>
                <td className="px-3.5 py-3 text-right text-slate-700 dark:text-slate-200 font-mono">
                  {fmt(toplamKdvDahil)}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  )
}

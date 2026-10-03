import React, { useState, useEffect } from 'react'
import { Package, Download, Printer, Search, Building2, Tag } from 'lucide-react'

const fmt = (n: number) =>
  n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₺'

interface MalzemeHarcamaItem {
  id: number
  kalem_adi: string
  miktar: number
  birim: string
  birim_fiyat: number
  toplam_tutar: number
  dosya_no: string
  is_adi: string
  alim_turu: string
  tarih: string
  kazanan_firma?: string
}

interface MalzemeHarcamaViewProps {
  yil: string
  tarihBaslangic?: string
  tarihBitis?: string
  tarihEsasi?: 'temin' | 'acilis'
  seciliBirim?: string
  alimTuru?: string
}

export const MalzemeHarcamaView: React.FC<MalzemeHarcamaViewProps> = ({
  yil,
  tarihBaslangic,
  tarihBitis,
  tarihEsasi = 'temin',
  seciliBirim,
  alimTuru
}) => {
  const [items, setItems] = useState<MalzemeHarcamaItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchTerm, setSearchTerm] = useState<string>('')

  useEffect(() => {
    const fetchKalemler = async (): Promise<void> => {
      if (typeof window === 'undefined' || !window.electron?.ipcRenderer) return
      setLoading(true)
      try {
        const dateCol = tarihEsasi === 'acilis' ? 'COALESCE(d.dosya_acilis_tarihi, d.tarih)' : 'COALESCE(d.temin_tarihi, d.tarih)'
        const res = await window.electron.ipcRenderer.invoke(
          'db:query',
          `SELECT 
            k.id,
            COALESCE(k.kalem_adi, k.poz_tanimi, 'Belirtilmemiş') as kalem_adi,
            COALESCE(k.miktar, 1) as miktar,
            COALESCE(k.birim, k.olcu_birimi, 'Adet') as birim,
            COALESCE(k.birim_fiyat, 0) as birim_fiyat,
            (COALESCE(k.miktar, 1) * COALESCE(k.birim_fiyat, 0)) as toplam_tutar,
            COALESCE(d.dosya_no, d.temin_no, '#' || d.id) as dosya_no,
            COALESCE(d.is_adi, d.dosya_adi, d.konu, '') as is_adi,
            COALESCE(d.alim_turu, d.tur, 'mal') as alim_turu,
            ${dateCol} as tarih,
            d.butce_yili,
            d.birim as harcama_birimi,
            (
              SELECT COALESCE(tf.unvan, f.unvan)
              FROM DATA_TeminFirma f
              LEFT JOIN TANIM_Firma tf ON tf.id = f.firma_id
              WHERE (f.temin_dosya_id = d.id OR f.dosya_id = d.id) AND (f.secildi = 1 OR f.kazanan = 1)
              LIMIT 1
            ) as kazanan_firma
          FROM DATA_TeminKalem k
          JOIN DATA_TeminDosyasi d ON (d.id = k.temin_dosya_id OR d.id = k.dosya_id)
          WHERE (d.is_deleted = 0 OR d.is_deleted IS NULL)
          ORDER BY k.id DESC`
        )

        if (res.success && Array.isArray(res.data)) {
          let rows: MalzemeHarcamaItem[] = res.data.map((r: any) => ({
            id: r.id,
            kalem_adi: r.kalem_adi,
            miktar: Number(r.miktar) || 1,
            birim: r.birim,
            birim_fiyat: Number(r.birim_fiyat) || 0,
            toplam_tutar: Number(r.toplam_tutar) || 0,
            dosya_no: r.dosya_no,
            is_adi: r.is_adi,
            alim_turu: r.alim_turu,
            tarih: r.tarih || '',
            kazanan_firma: r.kazanan_firma || '-'
          }))

          if (yil) {
            rows = rows.filter((r) => !r.tarih || r.tarih.startsWith(yil))
          }
          if (tarihBaslangic) {
            rows = rows.filter((r) => !r.tarih || r.tarih >= tarihBaslangic)
          }
          if (tarihBitis) {
            rows = rows.filter((r) => !r.tarih || r.tarih <= tarihBitis)
          }
          if (alimTuru && alimTuru !== 'tumu') {
            rows = rows.filter((r) => r.alim_turu.toLowerCase().includes(alimTuru.toLowerCase()))
          }

          setItems(rows)
        } else {
          setItems([])
        }
      } catch (err) {
        console.error('Error loading item reports:', err)
        setItems([])
      } finally {
        setLoading(false)
      }
    }

    fetchKalemler()
  }, [yil, tarihBaslangic, tarihBitis, tarihEsasi, seciliBirim, alimTuru])

  const filteredItems = items.filter((it) =>
    it.kalem_adi.toLowerCase().includes(searchTerm.toLowerCase()) ||
    it.dosya_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (it.kazanan_firma && it.kazanan_firma.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const genelToplam = filteredItems.reduce((acc, it) => acc + it.toplam_tutar, 0)

  const handleExportCSV = (): void => {
    if (filteredItems.length === 0) return
    const headers = ['Sıra', 'Kalem / Malzeme Adı', 'Miktar', 'Ölçü Birimi', 'Birim Fiyat', 'Toplam Tutar', 'Dosya No', 'Alım Tarihi', 'Yüklenici Firma']
    const rows = filteredItems.map((it, idx) => [
      idx + 1,
      `"${it.kalem_adi.replace(/"/g, '""')}"`,
      it.miktar,
      `"${it.birim}"`,
      it.birim_fiyat.toFixed(2),
      it.toplam_tutar.toFixed(2),
      `"${it.dosya_no}"`,
      `"${it.tarih}"`,
      `"${(it.kazanan_firma || '').replace(/"/g, '""')}"`
    ])
    const csv = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Malzeme_Harcama_Raporu_${yil}.csv`
    a.click()
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-600" />
            Malzeme & Kalem Bazlı Harcama Raporu
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {yil} Bütçe Yılı • {filteredItems.length} Kalem Listelendi
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Kalem veya firma ara..."
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 w-48"
            />
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" /> Yazdır
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Excel İndir
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400 text-sm">Kalemler yükleniyor...</div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-16 text-slate-400 text-sm bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200">
          Seçilen kriterlere uygun malzeme / hizmet kalemi bulunamadı.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                <th className="px-3.5 py-3 text-left w-12">#</th>
                <th className="px-3.5 py-3 text-left">Malzeme / Hizmet Adı</th>
                <th className="px-3.5 py-3 text-center">Miktar</th>
                <th className="px-3.5 py-3 text-center">Birim</th>
                <th className="px-3.5 py-3 text-right">Birim Fiyat</th>
                <th className="px-3.5 py-3 text-right">Toplam Tutar</th>
                <th className="px-3.5 py-3 text-left">Dosya No</th>
                <th className="px-3.5 py-3 text-left">Yüklenici Firma</th>
                <th className="px-3.5 py-3 text-left">Tarih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredItems.map((row, i) => (
                <tr key={row.id} className="hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-colors">
                  <td className="px-3.5 py-2.5 text-slate-400 font-mono font-bold">{i + 1}</td>
                  <td className="px-3.5 py-2.5 font-semibold text-slate-800 dark:text-slate-200 max-w-[240px] truncate" title={row.kalem_adi}>
                    {row.kalem_adi}
                  </td>
                  <td className="px-3.5 py-2.5 text-center font-mono font-bold text-slate-700 dark:text-slate-200">{row.miktar}</td>
                  <td className="px-3.5 py-2.5 text-center text-slate-500">{row.birim}</td>
                  <td className="px-3.5 py-2.5 text-right font-mono text-slate-700 dark:text-slate-200">{fmt(row.birim_fiyat)}</td>
                  <td className="px-3.5 py-2.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">{fmt(row.toplam_tutar)}</td>
                  <td className="px-3.5 py-2.5 font-mono text-slate-600 dark:text-slate-400">{row.dosya_no}</td>
                  <td className="px-3.5 py-2.5 text-slate-600 dark:text-slate-300 max-w-[160px] truncate" title={row.kazanan_firma}>
                    {row.kazanan_firma}
                  </td>
                  <td className="px-3.5 py-2.5 font-mono text-slate-500 whitespace-nowrap">{row.tarih || '-'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-300 dark:border-slate-600 bg-slate-100/80 dark:bg-slate-800/80 font-bold">
                <td colSpan={5} className="px-3.5 py-3 text-right text-slate-700 dark:text-slate-200">
                  TOPLAM ({filteredItems.length} Kalem):
                </td>
                <td className="px-3.5 py-3 text-right text-emerald-700 dark:text-emerald-400 font-mono text-sm">
                  {fmt(genelToplam)}
                </td>
                <td colSpan={3} />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  )
}

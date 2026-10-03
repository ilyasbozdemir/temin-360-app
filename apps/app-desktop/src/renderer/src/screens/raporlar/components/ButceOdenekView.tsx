import React, { useState, useEffect } from 'react'
import { Wallet, Download, Printer, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react'
import { ButceOdenekKayit } from './ButceOdenekModal'

const fmt = (n: number) =>
  n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₺'

interface ButceOdenekViewProps {
  yil: string
}

export const ButceOdenekView: React.FC<ButceOdenekViewProps> = ({ yil }) => {
  const [odenekler, setOdenekler] = useState<ButceOdenekKayit[]>([])
  const [harcamalarMap, setHarcamalarMap] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState<boolean>(true)

  const loadData = async (): Promise<void> => {
    if (typeof window === 'undefined' || !window.electron?.ipcRenderer) return
    setLoading(true)
    try {
      // 1. Ödenek Tanımlarını Çek
      const odenekRes = await window.electron.ipcRenderer.invoke(
        'db:query',
        `SELECT * FROM TANIM_ButceOdenek WHERE butce_yili = ? ORDER BY butce_kodu ASC`,
        [parseInt(yil, 10) || 2026]
      )

      // 2. Gerçekleşen 22/d Harcamalarını Bütçe Kodu Bazında Grupla
      const harcamaRes = await window.electron.ipcRenderer.invoke(
        'db:query',
        `SELECT 
          COALESCE(d.odenek_kalemi, d.odenek_tertibi, '03.2.1.01') as kod,
          SUM(COALESCE((SELECT SUM(miktar * birim_fiyat) FROM DATA_TeminKalem WHERE (temin_dosya_id = d.id OR dosya_id = d.id)), 0)) as toplam
         FROM DATA_TeminDosyasi d
         WHERE (d.is_deleted = 0 OR d.is_deleted IS NULL)
           AND (d.butce_yili = ? OR d.tarih LIKE ?)
         GROUP BY kod`,
        [yil, `${yil}%`]
      )

      const map: Record<string, number> = {}
      if (harcamaRes.success && Array.isArray(harcamaRes.data)) {
        for (const row of harcamaRes.data) {
          if (row.kod) map[row.kod] = Number(row.toplam) || 0
        }
      }
      setHarcamalarMap(map)

      if (odenekRes.success && Array.isArray(odenekRes.data)) {
        setOdenekler(odenekRes.data)
      } else {
        setOdenekler([])
      }
    } catch (err) {
      console.error('Error loading budget allowances:', err)
      setOdenekler([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [yil])

  const handleExportCSV = (): void => {
    if (odenekler.length === 0) return
    const headers = [
      'Sıra No',
      'Birim',
      'Kurumsal Kod',
      'Bütçe Kodu',
      'Bütçe Kalemi',
      'Bütçe Türü',
      'Bütçe Yılı',
      'Yıllık Ödenek',
      '%10 Tavanı',
      'Kullanılan Ödenek',
      'Kalan Ödenek'
    ]
    const rows = odenekler.map((it, idx) => {
      const yuzdeOn = it.yillik_odenek * 0.1
      const kullanilan = harcamalarMap[it.butce_kodu] || 0
      const kalan = it.yillik_odenek - kullanilan
      return [
        idx + 1,
        `"${it.birim_adi}"`,
        `"${it.kurumsal_kod || ''}"`,
        `"${it.butce_kodu}"`,
        `"${it.butce_kalemi}"`,
        `"${it.butce_turu}"`,
        it.butce_yili,
        it.yillik_odenek.toFixed(2),
        yuzdeOn.toFixed(2),
        kullanilan.toFixed(2),
        kalan.toFixed(2)
      ]
    })
    const csv = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Butce_Odenek_ve_10_Limit_Tablosu_${yil}.csv`
    a.click()
  }

  const handleNavigateToKurum = () => {
    window.location.hash = '#/kurum?tab=butce-odenek'
  }

  return (
    <div className="space-y-4">
      {/* Üst Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <div className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-purple-600" />
            Bütçe Kodları ve %10 Limit Takip Raporu
          </div>
          <div className="text-xs text-slate-400">
            {yil} Bütçe Yılı • 4734 Sayılı Kanun Madde 62/ı %10 Yasal Tavan Takip Cetveli
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleNavigateToKurum}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-100"
          >
            <span>Ödenekleri Yönet</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleExportCSV}
            disabled={odenekler.length === 0}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" /> CSV / Excel
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200"
          >
            <Printer className="w-3.5 h-3.5" /> Yazdır
          </button>
        </div>
      </div>

      {/* Rapor Tablosu */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-purple-50/70 dark:bg-slate-700/60 text-slate-800 dark:text-slate-200 font-bold border-b border-purple-100 dark:border-slate-600">
              <tr>
                <th className="py-3 px-3 w-10 text-center">Sıra</th>
                <th className="py-3 px-3">Birim</th>
                <th className="py-3 px-3">Kurumsal Kod</th>
                <th className="py-3 px-3">Bütçe Kodu</th>
                <th className="py-3 px-3">Bütçe Kalemi</th>
                <th className="py-3 px-3">Bütçe Türü</th>
                <th className="py-3 px-3">Yıl</th>
                <th className="py-3 px-3 text-right">Yıllık Ödenek (%10 Tavanı)</th>
                <th className="py-3 px-3 text-right">Kullanılan Ödenek</th>
                <th className="py-3 px-3 text-right">Kalan Ödenek</th>
                <th className="py-3 px-3 text-center">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400">
                    Ödenek verileri hesaplanıyor...
                  </td>
                </tr>
              ) : odenekler.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    <Wallet className="w-10 h-10 mx-auto mb-2 opacity-30 text-purple-500" />
                    <p className="font-semibold text-slate-600 dark:text-slate-300">
                      {yil} yılına ait kayıtlı bütçe ödeneği bulunamadı.
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Ödenek tertiplerinizi eklemek için Kurum Tanımları &gt; Bütçe &amp; Ödenek Yönetimi ekranını kullanabilirsiniz.
                    </p>
                    <button
                      onClick={handleNavigateToKurum}
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm"
                    >
                      Bütçe Ödenek Tanımlarına Git
                    </button>
                  </td>
                </tr>
              ) : (
                odenekler.map((it, idx) => {
                  const yuzdeOn = it.yillik_odenek * 0.1
                  const kullanilan = harcamalarMap[it.butce_kodu] || 0
                  const kalan = it.yillik_odenek - kullanilan
                  const asildiMi = kullanilan > yuzdeOn

                  return (
                    <tr
                      key={it.id || idx}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors"
                    >
                      <td className="py-3 px-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                      <td className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-200">
                        {it.birim_adi}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500">{it.kurumsal_kod || '-'}</td>
                      <td className="py-3 px-3 font-mono font-bold text-purple-600">{it.butce_kodu}</td>
                      <td className="py-3 px-3 text-slate-800 dark:text-slate-100 max-w-xs truncate">
                        {it.butce_kalemi}
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{it.butce_turu}</td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{it.butce_yili}</td>
                      <td className="py-3 px-3 text-right">
                        <div className="font-bold text-slate-800 dark:text-slate-100">
                          {fmt(it.yillik_odenek)}
                        </div>
                        <div className="text-[10px] text-purple-600 font-semibold">
                          %10: {fmt(yuzdeOn)}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-800 dark:text-slate-100">
                        {fmt(kullanilan)}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-emerald-600">
                        {fmt(kalan)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {asildiMi ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
                            <ShieldAlert className="w-3 h-3" /> %10 Aşıldı
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                            <CheckCircle2 className="w-3 h-3" /> Uygun
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

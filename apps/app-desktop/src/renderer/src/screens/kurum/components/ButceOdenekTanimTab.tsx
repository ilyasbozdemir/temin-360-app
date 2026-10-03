import React, { useState, useEffect } from 'react'
import { Wallet, Plus, Edit2, Trash2, Search, Building2, Layers } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { ButceOdenekModal, ButceOdenekKayit } from '../../raporlar/components/ButceOdenekModal'

export const ButceOdenekTanimTab: React.FC = () => {
  const [odenekler, setOdenekler] = useState<ButceOdenekKayit[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedYil, setSelectedYil] = useState<string>('2026')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const [editingRecord, setEditingRecord] = useState<ButceOdenekKayit | null>(null)

  const loadData = async (): Promise<void> => {
    if (typeof window === 'undefined' || !window.electron?.ipcRenderer) return
    setLoading(true)
    try {
      const res = await window.electron.ipcRenderer.invoke(
        'db:query',
        `SELECT * FROM TANIM_ButceOdenek WHERE butce_yili = ? ORDER BY butce_kodu ASC`,
        [parseInt(selectedYil, 10) || 2026]
      )
      if (res.success && Array.isArray(res.data)) {
        setOdenekler(res.data)
      } else {
        setOdenekler([])
      }
    } catch (err) {
      console.error('Ödenekler yüklenirken hata:', err)
      setOdenekler([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [selectedYil])

  const handleDelete = async (id?: number): Promise<void> => {
    if (!id) return
    if (!confirm('Bu bütçe ödenek kaydını silmek istediğinize emin misiniz?')) return
    try {
      await window.electron.ipcRenderer.invoke('db:query', 'DELETE FROM TANIM_ButceOdenek WHERE id = ?', [id])
      loadData()
    } catch {}
  }

  const filtered = odenekler.filter(
    (it) =>
      it.butce_kodu.toLowerCase().includes(searchTerm.toLowerCase()) ||
      it.butce_kalemi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      it.birim_adi.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const fmt = (n: number) =>
    n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₺'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-purple-600" />
            Bütçe & Ödenek Tertipleri Yönetimi
          </h2>
          <p className="text-xs text-slate-500">
            Harcama birimlerinin bütçe tertipleri, yıllık başlangıç ödenekleri ve %10 yasal limit tanımları.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={selectedYil}
            onChange={(e) => setSelectedYil(e.target.value)}
            className="text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-700 dark:text-slate-200"
          >
            <option value="2026">2026 Yılı</option>
            <option value="2025">2025 Yılı</option>
            <option value="2024">2024 Yılı</option>
          </select>

          <Button
            type="button"
            onClick={() => {
              setEditingRecord(null)
              setModalOpen(true)
            }}
            className="gap-1.5 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-3.5 py-2 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" /> Yeni Ödenek Ekle
          </Button>
        </div>
      </div>

      {/* Arama & Bilgi Çubuğu */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Bütçe kodu, kalem veya birim ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-9 pr-3 py-2 text-slate-800 dark:text-slate-100"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Toplam <b>{odenekler.length}</b> adet bütçe kalemi kayıtlı
        </div>
      </div>

      {/* Tablo */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-3 w-10 text-center">Sıra</th>
                <th className="py-3 px-3">Birim</th>
                <th className="py-3 px-3">Kurumsal Kod</th>
                <th className="py-3 px-3">Bütçe Kodu</th>
                <th className="py-3 px-3">Bütçe Kalemi</th>
                <th className="py-3 px-3">Tür</th>
                <th className="py-3 px-3 text-right">Yıllık Ödenek</th>
                <th className="py-3 px-3 text-right text-purple-600">%10 Tavanı</th>
                <th className="py-3 px-3 text-right">#</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Ödenekler yükleniyor...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Wallet className="w-10 h-10 mx-auto mb-2 opacity-30 text-purple-500" />
                    Bu bütçe yılı için henüz kayıtlı ödenek tertibi bulunmuyor.
                    <br />
                    <button
                      onClick={() => {
                        setEditingRecord(null)
                        setModalOpen(true)
                      }}
                      className="mt-3 text-xs font-bold text-purple-600 hover:underline"
                    >
                      + İlk Bütçe Ödeneğini Ekleyin
                    </button>
                  </td>
                </tr>
              ) : (
                filtered.map((it, idx) => (
                  <tr key={it.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                    <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-100">
                      {it.birim_adi}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-500">{it.kurumsal_kod || '-'}</td>
                    <td className="py-3 px-3 font-mono font-bold text-purple-600">{it.butce_kodu}</td>
                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300 max-w-xs truncate">
                      {it.butce_kalemi}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {it.butce_turu}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-800 dark:text-slate-100">
                      {fmt(it.yillik_odenek)}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-purple-600 bg-purple-50/50 dark:bg-purple-950/20">
                      {fmt(it.yillik_odenek * 0.1)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setEditingRecord(it)
                            setModalOpen(true)
                          }}
                          className="p-1 text-slate-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(it.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg"
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

      <ButceOdenekModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={loadData}
        editingRecord={editingRecord}
        currentYear={selectedYil}
      />
    </div>
  )
}

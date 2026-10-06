import React, { useState } from 'react'
import {
  FolderPlus,
  Search,
  Trash2,
  Eye,
  Clock,
  Building2,
  RefreshCw
} from 'lucide-react'
import { IslemTuru2886 } from '../types/devletIhale2886.types'

export interface Dosya2886Item {
  id: number | string
  dosyaNo: string
  tasinmazAdi: string
  islemTuru: IslemTuru2886
  usul: string
  muhammenBedel: number
  durum: 'taslak' | 'ilanda' | 'ihale_gunu' | 'sozlesme' | 'tamamlandi' | 'iptal'
  ihaleTarihi: string
  created_at: string
  revizyonSayisi: number
}

interface DosyaYonetimi2886TabProps {
  onSelectDosya?: (dosya: Dosya2886Item) => void
  activeDosyaId?: number | string
}

export function DosyaYonetimi2886Tab({
  onSelectDosya,
  activeDosyaId
}: DosyaYonetimi2886TabProps): React.JSX.Element {
  const [dosyalar, setDosyalar] = useState<Dosya2886Item[]>([
    {
      id: 1,
      dosyaNo: '2886-2026/001',
      tasinmazAdi: 'Merkez Mah. 104 Ada 12 Parsel Taşınmaz Satışı',
      islemTuru: 'satis',
      usul: 'Madde 35/a (Kapalı Teklif)',
      muhammenBedel: 4500000,
      durum: 'ihale_gunu',
      ihaleTarihi: '2026-10-15',
      created_at: '2026-10-01',
      revizyonSayisi: 3
    },
    {
      id: 2,
      dosyaNo: '2886-2026/002',
      tasinmazAdi: 'Atatürk Cad. Dükkan No: 4 Kiralama İhalesi',
      islemTuru: 'kiralama',
      usul: 'Madde 45 (Açık Teklif Usulü)',
      muhammenBedel: 180000,
      durum: 'ilanda',
      ihaleTarihi: '2026-10-20',
      created_at: '2026-10-03',
      revizyonSayisi: 1
    },
    {
      id: 3,
      dosyaNo: '2886-2026/003',
      tasinmazAdi: 'Sanayi Bölgesi İrtifak Hakkı Tesis Edilmesi',
      islemTuru: 'irtifak',
      usul: 'Madde 35/d (Pazarlık Usulü)',
      muhammenBedel: 1250000,
      durum: 'taslak',
      ihaleTarihi: '2026-11-01',
      created_at: '2026-10-05',
      revizyonSayisi: 0
    }
  ])

  const [searchQuery, setSearchQuery] = useState('')
  const [filterTur, setFilterTur] = useState<string>('hepsi')
  const [filterDurum, setFilterDurum] = useState<string>('hepsi')
  const [showNewModal, setShowNewModal] = useState(false)
  const [selectedDosyaForRev, setSelectedDosyaForRev] = useState<Dosya2886Item | null>(null)

  // New File State
  const [newNo, setNewNo] = useState(`2886-2026/00${dosyalar.length + 1}`)
  const [newAdi, setNewAdi] = useState('')
  const [newTur, setNewTur] = useState<'satis' | 'kiralama' | 'irtifak' | 'trampa'>('satis')
  const [newUsul, setNewUsul] = useState('Madde 35/a (Kapalı Teklif)')
  const [newBedel, setNewBedel] = useState(1000000)
  const [newTarih, setNewTarih] = useState('2026-10-25')

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAdi.trim()) return
    const newItem: Dosya2886Item = {
      id: Date.now(),
      dosyaNo: newNo || `2886-2026/00${dosyalar.length + 1}`,
      tasinmazAdi: newAdi,
      islemTuru: newTur,
      usul: newUsul,
      muhammenBedel: Number(newBedel) || 0,
      durum: 'taslak',
      ihaleTarihi: newTarih || new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString().split('T')[0],
      revizyonSayisi: 1
    }
    setDosyalar([newItem, ...dosyalar])
    setShowNewModal(false)
    setNewAdi('')
    if (onSelectDosya) onSelectDosya(newItem)
  }

  const handleDelete = (id: number | string) => {
    if (confirm('Bu 2886 ihale dosyasını silmek istediğinize emin misiniz?')) {
      setDosyalar(dosyalar.filter((d) => d.id !== id))
    }
  }

  const filteredDosyalar = dosyalar.filter((d) => {
    const q = searchQuery.toLowerCase()
    const matchQ = d.tasinmazAdi.toLowerCase().includes(q) || d.dosyaNo.toLowerCase().includes(q)
    const matchTur = filterTur === 'hepsi' || d.islemTuru === filterTur
    const matchDurum = filterDurum === 'hepsi' || d.durum === filterDurum
    return matchQ && matchTur && matchDurum
  })

  const getDurumBadge = (durum: Dosya2886Item['durum']) => {
    switch (durum) {
      case 'taslak':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">Taslak</span>
      case 'ilanda':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-950/60 text-blue-400 border border-blue-800/60">İlanda</span>
      case 'ihale_gunu':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-950/60 text-amber-400 border border-amber-800/60">İhale Günü</span>
      case 'sozlesme':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-950/60 text-purple-400 border border-purple-800/60">Sözleşme</span>
      case 'tamamlandi':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">Tamamlandı</span>
      case 'iptal':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-950/60 text-rose-400 border border-rose-800/60">İptal</span>
      default:
        return null
    }
  }

  const formatTL = (val: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val || 0)
  }

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      {/* SEARCH & ACTION BAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Dosya no, taşınmaz adı veya ihale konusu ile ara..."
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <select
            value={filterTur}
            onChange={(e) => setFilterTur(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none"
          >
            <option value="hepsi">Tüm Türler</option>
            <option value="satis">Satış</option>
            <option value="kiralama">Kiralama</option>
            <option value="irtifak">İrtifak Hakkı</option>
            <option value="trampa">Trampa</option>
          </select>

          <select
            value={filterDurum}
            onChange={(e) => setFilterDurum(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none"
          >
            <option value="hepsi">Tüm Durumlar</option>
            <option value="taslak">Taslak</option>
            <option value="ilanda">İlanda</option>
            <option value="ihale_gunu">İhale Günü</option>
            <option value="sozlesme">Sözleşme</option>
            <option value="tamamlandi">Tamamlandı</option>
          </select>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-900/30 transition-all active:scale-95"
        >
          <FolderPlus className="w-4 h-4" /> Yeni 2886 Dosyası Aç
        </button>
      </div>

      {/* FILE TABLE LIST */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col">
        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-left text-xs text-slate-200 border-collapse">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[11px]">
                <th className="p-3.5 w-12 text-center">Durum</th>
                <th className="p-3.5 w-32 font-mono">Dosya No</th>
                <th className="p-3.5">Taşınmaz / İhale Adı</th>
                <th className="p-3.5 w-24">Tür</th>
                <th className="p-3.5 w-44">İhale Usulü</th>
                <th className="p-3.5 w-36 text-right">Muhammen Bedel</th>
                <th className="p-3.5 w-28 text-center">İhale Tarihi</th>
                <th className="p-3.5 w-20 text-center">Revizyon</th>
                <th className="p-3.5 w-28 text-center">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredDosyalar.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    <Building2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    Kayıtlı 2886 ihale dosyası bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredDosyalar.map((d) => {
                  const isActive = activeDosyaId === d.id

                  return (
                    <tr
                      key={d.id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isActive ? 'bg-indigo-950/30 border-l-4 border-indigo-500' : ''
                      }`}
                    >
                      <td className="p-3 text-center">{getDurumBadge(d.durum)}</td>
                      <td className="p-3 font-mono font-bold text-indigo-400">{d.dosyaNo}</td>
                      <td className="p-3 font-medium text-slate-100">{d.tasinmazAdi}</td>
                      <td className="p-3 capitalize text-slate-300">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
                          {d.islemTuru}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400 text-[11px] truncate max-w-[180px]">
                        {d.usul}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-400">
                        {formatTL(d.muhammenBedel)}
                      </td>
                      <td className="p-3 text-center font-mono text-slate-400 text-[11px]">
                        {d.ihaleTarihi}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => setSelectedDosyaForRev(d)}
                          className="px-2 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-mono flex items-center justify-center gap-1 mx-auto"
                        >
                          <Clock className="w-3 h-3" /> v{d.revizyonSayisi + 1}.0
                        </button>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onSelectDosya?.(d)}
                            className="p-1.5 rounded bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 transition"
                            title="Dosyayı Çalışma Masasında Aç"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(d.id)}
                            className="p-1.5 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                            title="Dosyayı Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER COUNTER */}
        <div className="bg-slate-950 p-3 border-t border-slate-800 text-xs text-slate-400 flex justify-between items-center">
          <span>Toplam {filteredDosyalar.length} Adet 2886 İhale Kaydı</span>
          <span className="text-[11px] text-slate-500">2886 Sayılı Devlet İhale Kanunu Kapsamı</span>
        </div>
      </div>

      {/* NEW FILE MODAL */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateNew}
            className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-indigo-400" /> Yeni 2886 İhale / Taşınmaz Dosyası Ekle
              </h3>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-medium">Dosya No</label>
                <input
                  type="text"
                  value={newNo}
                  onChange={(e) => setNewNo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1 font-medium">İşlem Türü</label>
                <select
                  value={newTur}
                  onChange={(e) => setNewTur(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                >
                  <option value="satis">Satış İhalesi</option>
                  <option value="kiralama">Kiralama İhalesi</option>
                  <option value="irtifak">İrtifak Hakkı Tesis</option>
                  <option value="trampa">Trampa</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">
                Taşınmaz / İhale Konusu Adı
              </label>
              <input
                type="text"
                value={newAdi}
                onChange={(e) => setNewAdi(e.target.value)}
                placeholder="Örn: Kurtuluş Mah. 102 Ada 5 Parsel Arsa Satışı"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">İhale Usulü</label>
              <select
                value={newUsul}
                onChange={(e) => setNewUsul(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="Madde 35/a (Kapalı Teklif)">Madde 35/a (Kapalı Teklif Usulü)</option>
                <option value="Madde 35/b (Belli İstekliler)">Madde 35/b (Belli İstekliler Arasında)</option>
                <option value="Madde 35/c (Açık Teklif)">Madde 35/c (Açık Teklif Usulü)</option>
                <option value="Madde 35/d (Pazarlık Usulü)">Madde 35/d (Pazarlık Usulü)</option>
                <option value="Madde 45 (Açık Teklif)">Madde 45 (Açık Teklif Usulü)</option>
                <option value="Madde 51/g (Pazarlık)">Madde 51/g (Pazarlık)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-medium">
                  Muhammen Bedel (TL)
                </label>
                <input
                  type="number"
                  value={newBedel}
                  onChange={(e) => setNewBedel(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-emerald-400 font-mono focus:border-indigo-500 focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1 font-medium">İhale Tarihi</label>
                <input
                  type="date"
                  value={newTarih}
                  onChange={(e) => setNewTarih(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
              >
                İptal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-indigo-900/30"
              >
                Oluştur & Aç
              </button>
            </div>
          </form>
        </div>
      )}

      {/* REVISION HISTORY MODAL */}
      {selectedDosyaForRev && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-5 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" /> Revizyon & Sürüm Geçmişi
                </h4>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  {selectedDosyaForRev.dosyaNo} - {selectedDosyaForRev.tasinmazAdi}
                </p>
              </div>
              <button
                onClick={() => setSelectedDosyaForRev(null)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
              {[
                {
                  ver: 'v1.2',
                  title: 'İhale Komisyon Onayı & Karar Metni Güncellendi',
                  date: '2026-10-05 14:20',
                  by: 'Ahmet Yılmaz'
                },
                {
                  ver: 'v1.1',
                  title: 'Muhammen Bedel Hesap Cetveli Düzenlendi',
                  date: '2026-10-03 10:15',
                  by: 'Ayşe Kaya'
                },
                {
                  ver: 'v1.0',
                  title: 'İlk Dosya Kaydı ve İlan Taslağı',
                  date: '2026-10-01 09:00',
                  by: 'Sistem'
                }
              ].map((rev) => (
                <div
                  key={rev.ver}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between gap-3 hover:border-slate-700 transition"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono text-[10px] font-bold">
                        {rev.ver}
                      </span>
                      <span className="text-xs font-semibold text-slate-200">{rev.title}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      {rev.date} · {rev.by}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      alert(`${rev.ver} sürümüne geri dönüldü!`)
                      setSelectedDosyaForRev(null)
                    }}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium rounded flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Yükle
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedDosyaForRev(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

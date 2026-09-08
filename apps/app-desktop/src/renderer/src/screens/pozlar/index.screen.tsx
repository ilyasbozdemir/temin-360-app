import React, { useMemo, useState } from 'react'
import {
  AlertTriangle,
  BookOpen,
  Building2,
  Edit2,
  Filter,
  Layers,
  Plus,
  Search,
  Sparkles,
  Trash2
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { ExcelActions } from '../../components/ui/ExcelActions'
import { usePozlarHooks, PozItem } from './pozlar.hooks'
import {
  getDinamikFiyatDonemleri,
  POZ_KURUMLARI
} from '../malzemeler/components/pozKitaplari.data'
import { cn } from '../../utils/cn'

export default function PozlarScreen() {
  const { pozList, isLoading, addPoz, updatePoz, deletePoz } = usePozlarHooks()

  // Filtreler
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedKurum, setSelectedKurum] = useState('ALL')
  const [selectedYil, setSelectedYil] = useState<string>('ALL')

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPoz, setEditingPoz] = useState<PozItem | null>(null)

  // Form State
  const [formData, setFormData] = useState<Partial<PozItem>>({
    poz_no: '',
    kalem_adi: '',
    poz_tanimi: '',
    birim: 'm²',
    poz_kurumu: 'ÇŞB',
    poz_yili: new Date().getFullYear(),
    fiyat_donemi: `${new Date().getFullYear()}/1`,
    okas_kodu: '45000000',
    yapi_sinifi: 'Genel Yapım İşleri',
    ozelligi: '',
    notlar: ''
  })

  // Dinamik Dönem Listesi
  const dinamikDonemler = useMemo(
    () => getDinamikFiyatDonemleri(formData.poz_yili || new Date().getFullYear()),
    [formData.poz_yili]
  )

  // Filtrelenmiş Poz Listesi
  const filteredList = useMemo(() => {
    return pozList.filter((item) => {
      const matchKurum =
        selectedKurum === 'ALL' ||
        (item.kategori || item.poz_kurumu || '').toLowerCase().includes(selectedKurum.toLowerCase()) ||
        (item.poz_no || '').toLowerCase().startsWith(selectedKurum.toLowerCase())

      const matchYil =
        selectedYil === 'ALL' || String(item.poz_yili || '') === selectedYil

      const query = searchQuery.toLowerCase().trim()
      const matchSearch =
        !query ||
        (item.poz_no || '').toLowerCase().includes(query) ||
        (item.kalem_adi || '').toLowerCase().includes(query) ||
        (item.poz_tanimi || '').toLowerCase().includes(query) ||
        (item.yapi_sinifi || '').toLowerCase().includes(query) ||
        (item.okas_kodu || '').includes(query)

      return matchKurum && matchYil && matchSearch
    })
  }, [pozList, selectedKurum, selectedYil, searchQuery])

  // İstatistikler
  const stats = useMemo(() => {
    const total = pozList.length
    const ozelCount = pozList.filter(
      (p) => p.poz_no?.startsWith('ÖZEL') || p.poz_no?.startsWith('ÖZ') || p.poz_no?.startsWith('İDARE')
    ).length
    const resmiCount = total - ozelCount
    return { total, ozelCount, resmiCount }
  }, [pozList])

  const handleOpenAddModal = () => {
    setEditingPoz(null)
    setFormData({
      poz_no: '15.150.1002',
      kalem_adi: '',
      poz_tanimi: '',
      birim: 'm²',
      poz_kurumu: 'ÇŞB',
      poz_yili: new Date().getFullYear(),
      fiyat_donemi: `${new Date().getFullYear()}/1`,
      okas_kodu: '45000000',
      yapi_sinifi: 'Genel Yapım İşleri',
      ozelligi: '',
      notlar: ''
    })
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (item: PozItem) => {
    setEditingPoz(item)
    setFormData({
      ...item,
      poz_kurumu: item.poz_kurumu || item.kategori || 'ÇŞB'
    })
    setIsModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.poz_no?.trim() || !formData.kalem_adi?.trim()) {
      alert('Lütfen Poz Numarası ve İmalat Tanımını doldurunuz.')
      return
    }

    try {
      if (editingPoz && editingPoz.id) {
        await updatePoz({ id: editingPoz.id, data: formData })
      } else {
        await addPoz(formData as Omit<PozItem, 'id'>)
      }
      setIsModalOpen(false)
    } catch (err: any) {
      alert('Kaydedilirken hata oluştu: ' + err.message)
    }
  }

  const handleDelete = async (id: number, pozNo: string) => {
    if (confirm(`"${pozNo}" numaralı pozu silmek istediğinize emin misiniz?`)) {
      try {
        await deletePoz(id)
      } catch (err: any) {
        alert('Silinirken hata oluştu: ' + err.message)
      }
    }
  }

  return (
    <div className="p-4 sm:p-8 max-w-[1600px] mx-auto space-y-6 animate-in fade-in">
      {/* Üst Başlık & Aksiyonlar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Building2 size={26} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              Birim Fiyat Pozları & Analizler
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Resmî Bakanlık/İdare Birim Fiyat Kitapları (ÇŞB, KGM, DSİ, İLBANK vb.) ve Kuruma Özel Poz Tanımları
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <ExcelActions
            tableName="TANIM_Kalem"
            customFileName="Birim_Fiyat_Pozlari"
            title="Birim Fiyat Pozları"
            uniqueCol="poz_no"
            onImportSuccess={() => window.location.reload()}
          />

          <Button
            onClick={handleOpenAddModal}
            className="bg-amber-600 hover:bg-amber-700 text-white gap-2 shadow-xs"
          >
            <Plus size={16} />
            <span>Yeni Poz Tanımla</span>
          </Button>
        </div>
      </div>

      {/* Sorumluluk ve Rehber Bilgilendirme Bannerı */}
      <div className="p-3.5 bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl text-xs flex items-start gap-3 text-amber-900 dark:text-amber-200">
        <div className="p-1.5 bg-amber-100 dark:bg-amber-900/40 rounded-lg text-amber-700 dark:text-amber-400 shrink-0 mt-0.5">
          <AlertTriangle size={16} />
        </div>
        <div className="flex-1 space-y-1">
          <p className="font-bold text-amber-800 dark:text-amber-300">
            Rehber Notu & Sorumluluk Reddi (Ücretsiz Yardımcı Araç)
          </p>
          <p className="text-[11px] text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
            Birim fiyat pozları, analizleri ve rayiçler ilgili kamu kurumlarının (ÇŞB, KGM, DSİ, İLBANK vb.) yayımladığı resmî kitaplardan derlenmiş olup yaklaşık maliyet ve keşif çalışmalarınızı hızlandırmak ve takibini kolaylaştırmak için sunulmuştur. Resmî yaklaşık maliyet hesaplamalarında güncel kurum birim fiyat kitaplarını ve dönemlerini teyit etmek tamamen kullanıcının sorumluluğundadır.
          </p>
        </div>
      </div>

      {/* KPI Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <Layers size={20} />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500">Toplam Kayıtlı Poz</span>
            <p className="text-xl font-black text-slate-900 dark:text-white font-mono">{stats.total}</p>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <BookOpen size={20} />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500">Resmî Kurum Kitap Pozları</span>
            <p className="text-xl font-black text-slate-900 dark:text-white font-mono">{stats.resmiCount}</p>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
            <Sparkles size={20} />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500">Özel / İdare Pozları</span>
            <p className="text-xl font-black text-slate-900 dark:text-white font-mono">{stats.ozelCount}</p>
          </div>
        </div>
      </div>

      {/* Arama ve Filtre Çubuğu */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        {/* Kurum Butonları */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Filter size={12} /> Kurum:
          </span>
          {POZ_KURUMLARI.map((k) => (
            <button
              key={k.id}
              type="button"
              onClick={() => setSelectedKurum(k.id)}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all border',
                selectedKurum === k.id
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-400'
              )}
            >
              {k.badge}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Poz Numarası, İmalat Tanımı, CPV Kodu veya Yapı Sınıfı Ara..."
              className="pl-10"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={selectedYil}
              onChange={(e) => setSelectedYil(e.target.value)}
              className="w-full px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-amber-500"
            >
              <option value="ALL">Tüm Yıllar</option>
              <option value="2026">2026 Yılı</option>
              <option value="2025">2025 Yılı</option>
              <option value="2024">2024 Yılı</option>
              <option value="2023">2023 Yılı</option>
            </select>
          </div>
        </div>
      </div>

      {/* Poz Listesi Tablosu */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400">Yükleniyor...</div>
        ) : filteredList.length === 0 ? (
          <div className="p-16 text-center text-slate-400 text-xs flex flex-col items-center gap-3">
            <Building2 size={40} className="opacity-30 text-amber-600" />
            <div className="space-y-1">
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                Aramanıza uygun poz bulunamadı.
              </p>
              <p className="text-slate-400 text-[11px]">
                Yukarıdaki butonla yeni resmî veya özel analizli poz ekleyebilirsiniz.
              </p>
            </div>
            <Button onClick={handleOpenAddModal} className="bg-amber-600 hover:bg-amber-700 text-white gap-2 mt-2">
              <Plus size={14} /> Yeni Poz Ekle
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold">
                <tr>
                  <th className="p-3.5 pl-5">POZ NO</th>
                  <th className="p-3.5">İMALAT / POZ TANIMI</th>
                  <th className="p-3.5">KURUM</th>
                  <th className="p-3.5 text-center">BİRİM</th>
                  <th className="p-3.5">DÖNEM / YIL</th>
                  <th className="p-3.5">OKAS CPV</th>
                  <th className="p-3.5 text-right pr-5">İŞLEMLER</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredList.map((item) => {
                  const isOzel =
                    item.poz_no?.startsWith('ÖZEL') ||
                    item.poz_no?.startsWith('ÖZ') ||
                    item.poz_no?.startsWith('İDARE')
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-amber-50/20 dark:hover:bg-amber-950/10 transition-colors group"
                    >
                      <td className="p-3.5 pl-5 font-mono font-bold">
                        <span
                          className={cn(
                            'px-2.5 py-1 rounded-lg text-xs border font-extrabold',
                            isOzel
                              ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800'
                              : 'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800'
                          )}
                        >
                          {item.poz_no}
                        </span>
                      </td>

                      <td className="p-3.5 font-semibold text-slate-900 dark:text-white max-w-md">
                        <div className="line-clamp-2 leading-relaxed">
                          {item.kalem_adi || item.poz_tanimi}
                        </div>
                        {item.yapi_sinifi && (
                          <span className="text-[10px] text-slate-400 mt-0.5 block">
                            {item.yapi_sinifi}
                          </span>
                        )}
                      </td>

                      <td className="p-3.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {item.kategori || item.poz_kurumu || (isOzel ? 'ÖZEL POZ' : 'ÇŞB')}
                        </span>
                      </td>

                      <td className="p-3.5 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                        {item.birim || 'm²'}
                      </td>

                      <td className="p-3.5 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                        {item.fiyat_donemi || `${item.poz_yili || ''}`}
                      </td>

                      <td className="p-3.5 font-mono text-[11px] text-purple-700 dark:text-purple-300">
                        {item.okas_kodu || '-'}
                      </td>

                      <td className="p-3.5 pr-5 text-right">
                        <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors"
                            title="Düzenle"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => item.id && handleDelete(item.id, item.poz_no)}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                            title="Sil"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Poz Ekleme / Düzenleme Modalı */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPoz ? 'Poz Bilgilerini Düzenle' : 'Yeni Birim Fiyat Pozu Tanımla'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Kurum / Kitap <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.poz_kurumu || formData.kategori || 'ÇŞB'}
                onChange={(e) => setFormData({ ...formData, poz_kurumu: e.target.value, kategori: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                {POZ_KURUMLARI.filter((k) => k.id !== 'ALL').map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.badge} - {k.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Poz Numarası <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.poz_no || ''}
                onChange={(e) => setFormData({ ...formData, poz_no: e.target.value })}
                placeholder="Örn: 15.150.1002 veya ÖZEL.01"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Ölçü Birimi <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.birim || 'm²'}
                onChange={(e) => setFormData({ ...formData, birim: e.target.value, olcu_birimi: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200"
              >
                <option value="m²">Metrekare (m²)</option>
                <option value="m³">Metreküp (m³)</option>
                <option value="mt">Metre / Metretül (mt)</option>
                <option value="ton">Ton (ton)</option>
                <option value="kg">Kilogram (kg)</option>
                <option value="Adet">Adet (Adet)</option>
                <option value="Set">Set / Takım (Set)</option>
                <option value="Götürü">Götürü Bedel (Götürü)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Poz / İmalat Tanımı <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.kalem_adi || formData.poz_tanimi || ''}
              onChange={(e) => setFormData({ ...formData, kalem_adi: e.target.value, poz_tanimi: e.target.value })}
              placeholder="Örn: C 25/30 basınç dayanım sınıfında hazır beton dökülmesi..."
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Poz / Bülten Yılı
              </label>
              <input
                type="number"
                value={formData.poz_yili || new Date().getFullYear()}
                onChange={(e) => setFormData({ ...formData, poz_yili: Number(e.target.value) || new Date().getFullYear() })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Fiyat Araştırma Dönemi
              </label>
              <input
                type="text"
                list="screen-fiyat-donem-list"
                value={formData.fiyat_donemi || `${formData.poz_yili || new Date().getFullYear()}/1`}
                onChange={(e) => setFormData({ ...formData, fiyat_donemi: e.target.value })}
                placeholder={`Örn: ${formData.poz_yili || new Date().getFullYear()}/1`}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200"
              />
              <datalist id="screen-fiyat-donem-list">
                {dinamikDonemler.map((d) => (
                  <option key={d.kod} value={d.kod}>
                    {d.etiket}
                  </option>
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                OKAS CPV Kodu
              </label>
              <input
                type="text"
                value={formData.okas_kodu || ''}
                onChange={(e) => setFormData({ ...formData, okas_kodu: e.target.value })}
                placeholder="Örn: 45000000"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Poz Analiz / Şartname Açıklaması
            </label>
            <textarea
              value={formData.ozelligi || ''}
              onChange={(e) => setFormData({ ...formData, ozelligi: e.target.value })}
              placeholder="Teknik detaylar, malzeme sarfiyat oranları ve işçilik tarifleri..."
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 min-h-[80px]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Vazgeç
            </Button>
            <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white">
              {editingPoz ? 'Güncelle' : 'Kaydet'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

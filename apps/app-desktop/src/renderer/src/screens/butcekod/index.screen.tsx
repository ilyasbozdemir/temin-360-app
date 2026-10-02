import React, { useState, useMemo } from 'react'
import {
  Coins,
  Plus,
  Trash2,
  Edit2,
  Search,
  Hash,
  AlertCircle,
  Sparkles,
  Copy,
  Check
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { ExcelActions } from '../../components/ui/ExcelActions'
import { useButceKodHooks, parseButceKod, ButceKod } from './butcekod.hooks'
import { cn } from '../../utils/cn'

// Düzey Rozetleri & Renkleri
function ButceDuzeyRozeti({ duzey }: { duzey: number }): React.JSX.Element {
  switch (duzey) {
    case 1:
      return (
        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
          I. Düzey (Grup)
        </span>
      )
    case 2:
      return (
        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
          II. Düzey (Sınıf)
        </span>
      )
    case 3:
      return (
        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          III. Düzey (Ayrıntı)
        </span>
      )
    case 4:
    default:
      return (
        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          IV. Düzey (Nihai Tertip)
        </span>
      )
  }
}

// Bütçe Türü Rozeti
function ButceTuruRozeti({ tur }: { tur: string | null }): React.JSX.Element {
  const t = tur || 'Mal Alımı'
  if (t === 'Mal Alımı') {
    return (
      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
        📦 Mal Alımı
      </span>
    )
  }
  if (t === 'Hizmet Alımı') {
    return (
      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
        🛠️ Hizmet Alımı
      </span>
    )
  }
  if (t === 'Yapım İşi') {
    return (
      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
        🏗️ Yapım İşi
      </span>
    )
  }
  if (t === 'Danışmanlık') {
    return (
      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-50 dark:bg-teal-950/50 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
        📑 Danışmanlık
      </span>
    )
  }
  return (
    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
      {t}
    </span>
  )
}

// 4 Düzey Görsel Önizleme Bileşeni
function ButceDuzeyOnizleme({ kod }: { kod: string }): React.JSX.Element {
  const parsed = parseButceKod(kod)
  if (!kod.trim()) {
    return (
      <div className="text-xs text-slate-400 dark:text-slate-600 italic">
        Örnek format: 03.2.1.01 (Noktalarla 4 Düzey Kırılım)
      </div>
    )
  }

  const levels: { label: string; value: string | null; color: string; bg: string }[] = [
    {
      label: 'I. Düzey (Ana Grup)',
      value: parsed.duzey_1,
      color: 'text-blue-700 dark:text-blue-300',
      bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800'
    },
    {
      label: 'II. Düzey (Sınıf)',
      value: parsed.duzey_2,
      color: 'text-indigo-700 dark:text-indigo-300',
      bg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800'
    },
    {
      label: 'III. Düzey (Ayrıntı)',
      value: parsed.duzey_3,
      color: 'text-amber-700 dark:text-amber-300',
      bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'
    },
    {
      label: 'IV. Düzey (Nihai Tertip)',
      value: parsed.duzey_4,
      color: 'text-emerald-700 dark:text-emerald-300',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
    }
  ]

  return (
    <div className="space-y-1.5">
      <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold flex items-center gap-1">
        <Sparkles className="w-3 h-3 text-amber-500" />
        Analitik Kırılım Ayrıştırması ({parsed.duzey}. Düzey Tespit Edildi):
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
        {levels.map((lvl, idx) => (
          <div
            key={idx}
            className={cn(
              'flex flex-col items-center px-2.5 py-1.5 rounded-xl border text-center transition-all',
              lvl.value
                ? lvl.bg
                : 'opacity-40 bg-slate-50 dark:bg-slate-900 border-dashed border-slate-200 dark:border-slate-800'
            )}
          >
            <span
              className={cn(
                'text-sm font-bold font-mono',
                lvl.value ? lvl.color : 'text-slate-400'
              )}
            >
              {lvl.value || '-'}
            </span>
            <span className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5">
              {lvl.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ButceKodScreen(): React.JSX.Element {
  const { butceKodList, isLoading, addButceKod, updateButceKod, deleteButceKod } =
    useButceKodHooks()

  const [search, setSearch] = useState('')
  const [selectedTab, setSelectedTab] = useState<
    'all' | 'level4' | 'upper' | 'mal' | 'hizmet' | 'yapim' | 'danismanlik'
  >('all')

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ButceKod | null>(null)

  // Form State
  const [formKod, setFormKod] = useState('')
  const [formHesapKodu, setFormHesapKodu] = useState('')
  const [formHesapAdi, setFormHesapAdi] = useState('')
  const [formButceTuru, setFormButceTuru] = useState('Mal Alımı')
  const [formAciklama, setFormAciklama] = useState('')
  const [formAktifMi, setFormAktifMi] = useState(1)

  const [copiedKod, setCopiedKod] = useState<string | null>(null)

  const copyToClipboard = (text: string): void => {
    navigator.clipboard.writeText(text)
    setCopiedKod(text)
    setTimeout(() => setCopiedKod(null), 2000)
  }

  // Open Add Modal
  const handleOpenAdd = (): void => {
    setEditingItem(null)
    setFormKod('')
    setFormHesapKodu('')
    setFormHesapAdi('')
    setFormButceTuru('Mal Alımı')
    setFormAciklama('')
    setFormAktifMi(1)
    setIsModalOpen(true)
  }

  // Open Edit Modal
  const handleOpenEdit = (item: ButceKod): void => {
    setEditingItem(item)
    setFormKod(item.kod)
    setFormHesapKodu(item.hesap_kodu || item.kod)
    setFormHesapAdi(item.hesap_adi)
    setFormButceTuru(item.butce_turu || 'Mal Alımı')
    setFormAciklama(item.aciklama || '')
    setFormAktifMi(item.aktif_mi)
    setIsModalOpen(true)
  }

  // Save (Add / Update)
  const handleSave = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!formKod.trim() || !formHesapAdi.trim()) {
      alert('Lütfen Bütçe Kodu ve Hesap Adı alanlarını doldurunuz.')
      return
    }

    const parsed = parseButceKod(formKod)

    try {
      if (editingItem) {
        await updateButceKod({
          ...editingItem,
          kod: formKod.trim(),
          hesap_kodu: formHesapKodu.trim() || formKod.trim(),
          hesap_adi: formHesapAdi.trim(),
          butce_turu: formButceTuru,
          aciklama: formAciklama.trim(),
          aktif_mi: formAktifMi,
          duzey: parsed.duzey,
          duzey_1: parsed.duzey_1,
          duzey_2: parsed.duzey_2,
          duzey_3: parsed.duzey_3,
          duzey_4: parsed.duzey_4
        })
      } else {
        await addButceKod({
          kod: formKod.trim(),
          hesap_kodu: formHesapKodu.trim() || formKod.trim(),
          hesap_adi: formHesapAdi.trim(),
          butce_turu: formButceTuru,
          aciklama: formAciklama.trim(),
          aktif_mi: formAktifMi,
          duzey: parsed.duzey,
          duzey_1: parsed.duzey_1,
          duzey_2: parsed.duzey_2,
          duzey_3: parsed.duzey_3,
          duzey_4: parsed.duzey_4
        })
      }
      setIsModalOpen(false)
    } catch (err: unknown) {
      alert('Kaydetme hatası: ' + (err instanceof Error ? err.message : String(err)))
    }
  }

  // Delete
  const handleDelete = async (item: ButceKod): Promise<void> => {
    const confirmed = confirm(
      `"${item.kod} - ${item.hesap_adi}" bütçe kodunu silmek istediğinize emin misiniz?`
    )
    if (confirmed) {
      try {
        await deleteButceKod(item.id)
      } catch (err: unknown) {
        alert('Silme hatası: ' + (err instanceof Error ? err.message : String(err)))
      }
    }
  }

  // Filtering
  const filteredList = useMemo(() => {
    return butceKodList.filter((item) => {
      // Tab filter
      if (selectedTab === 'level4' && item.duzey !== 4) return false
      if (selectedTab === 'upper' && item.duzey === 4) return false
      if (selectedTab === 'mal' && item.butce_turu !== 'Mal Alımı') return false
      if (selectedTab === 'hizmet' && item.butce_turu !== 'Hizmet Alımı') return false
      if (selectedTab === 'yapim' && item.butce_turu !== 'Yapım İşi') return false
      if (selectedTab === 'danismanlik' && item.butce_turu !== 'Danışmanlık') return false

      // Search filter
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return (
        item.kod.toLowerCase().includes(q) ||
        item.hesap_adi.toLowerCase().includes(q) ||
        (item.hesap_kodu && item.hesap_kodu.toLowerCase().includes(q)) ||
        (item.aciklama && item.aciklama.toLowerCase().includes(q)) ||
        (item.butce_turu && item.butce_turu.toLowerCase().includes(q))
      )
    })
  }, [butceKodList, selectedTab, search])

  // Stats
  const stats = useMemo(() => {
    const total = butceKodList.length
    const level4Count = butceKodList.filter((k) => k.duzey === 4).length
    const malCount = butceKodList.filter((k) => k.butce_turu === 'Mal Alımı').length
    const hizmetCount = butceKodList.filter((k) => k.butce_turu === 'Hizmet Alımı').length
    const yapimCount = butceKodList.filter((k) => k.butce_turu === 'Yapım İşi').length
    return { total, level4Count, malCount, hizmetCount, yapimCount }
  }, [butceKodList])

  return (
    <div className="p-6 max-w-400 mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shadow-xs">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2">
              Bütçe Kodları & Ekonomik Sınıflandırma
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-extrabold border border-amber-200 dark:border-amber-800">
                4 Düzey Analitik Bütçe
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Doğrudan temin ve ihale süreçlerinde kullanılan bütçe tertipleri, analitik harcama
              kalemleri ve muhasebe hesap kodları.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <ExcelActions
            tableName="TANIM_ButceKod"
            title="Bütçe Kodları"
            customFileName="Analitik_Butce_Kodlari"
          />
          <Button
            onClick={handleOpenAdd}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs gap-1.5 shadow-sm shadow-amber-600/20 rounded-xl"
          >
            <Plus className="w-4 h-4" />
            Yeni Bütçe Kodu Ekle
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col gap-1 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
            Toplam Bütçe Kodu
          </span>
          <span className="text-2xl font-extrabold text-slate-850 dark:text-slate-100">
            {stats.total}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/50 flex flex-col gap-1 shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
            IV. Düzey (Nihai Tertip)
          </span>
          <span className="text-2xl font-extrabold text-emerald-800 dark:text-emerald-300">
            {stats.level4Count}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200/60 dark:border-sky-800/50 flex flex-col gap-1 shadow-2xs">
          <span className="text-[11px] font-bold text-sky-700 dark:text-sky-400">
            Mal Alımı Kodları
          </span>
          <span className="text-2xl font-extrabold text-sky-800 dark:text-sky-300">
            {stats.malCount}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-violet-50/50 dark:bg-violet-950/20 border border-violet-200/60 dark:border-violet-800/50 flex flex-col gap-1 shadow-2xs">
          <span className="text-[11px] font-bold text-violet-700 dark:text-violet-400">
            Hizmet Alımı Kodları
          </span>
          <span className="text-2xl font-extrabold text-violet-800 dark:text-violet-300">
            {stats.hizmetCount}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/50 flex flex-col gap-1 shadow-2xs">
          <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400">
            Yapım & Yatırım
          </span>
          <span className="text-2xl font-extrabold text-amber-800 dark:text-amber-300">
            {stats.yapimCount}
          </span>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { key: 'all' as const, label: `Tümü (${stats.total})` },
            { key: 'level4' as const, label: `IV. Düzey (${stats.level4Count})` },
            { key: 'upper' as const, label: `I - III. Düzey` },
            { key: 'mal' as const, label: `📦 Mal Alımı` },
            { key: 'hizmet' as const, label: `🛠️ Hizmet Alımı` },
            { key: 'yapim' as const, label: `🏗️ Yapım İşi` },
            { key: 'danismanlik' as const, label: `📑 Danışmanlık` }
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setSelectedTab(tab.key)}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer',
                selectedTab === tab.key
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-70">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tertip Kodu, Hesap Adı veya Açıklama ara..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Bütçe Kodu</th>
                <th className="py-3 px-4">Düzey</th>
                <th className="py-3 px-4">Hesap / Kalem Adı</th>
                <th className="py-3 px-4">Hesap Kodu</th>
                <th className="py-3 px-4">Bütçe Türü</th>
                <th className="py-3 px-4">Açıklama / Kapsam</th>
                <th className="py-3 px-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                    Bütçe kodları yükleniyor...
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                      <p className="font-semibold text-sm">Eşleşen bütçe kodu bulunamadı.</p>
                      <p className="text-xs text-slate-400">
                        Arama kriterlerinizi değiştirebilir veya yeni bir bütçe kodu
                        ekleyebilirsiniz.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Bütçe Kodu */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                      <div className="flex items-center gap-1.5">
                        <span className="text-amber-600 dark:text-amber-400">{item.kod}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(item.kod)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-all cursor-pointer"
                          title="Kodu Kopyala"
                        >
                          {copiedKod === item.kod ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Düzey */}
                    <td className="py-3 px-4">
                      <ButceDuzeyRozeti duzey={item.duzey} />
                    </td>

                    {/* Hesap / Kalem Adı */}
                    <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-100">
                      {item.hesap_adi}
                    </td>

                    {/* Hesap Kodu */}
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                      {item.hesap_kodu || '-'}
                    </td>

                    {/* Bütçe Türü */}
                    <td className="py-3 px-4">
                      <ButceTuruRozeti tur={item.butce_turu} />
                    </td>

                    {/* Açıklama */}
                    <td
                      className="py-3 px-4 text-slate-500 dark:text-slate-400 max-w-xs truncate"
                      title={item.aciklama || ''}
                    >
                      {item.aciklama || '-'}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-all cursor-pointer"
                          title="Düzenle"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all cursor-pointer"
                          title="Sil"
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

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Bütçe Kodu Düzenle' : 'Yeni Bütçe Kodu Tanımla'}
        className="max-w-2xl"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {/* Kod Input & Live Breakdown */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Hash className="w-3.5 h-3.5 text-amber-500" />
              Bütçe Tertip / Ekonomik Kod *
            </label>
            <input
              type="text"
              value={formKod}
              onChange={(e) => setFormKod(e.target.value)}
              placeholder="Örn: 03.2.1.01 veya 03.5.2.02"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 font-mono font-bold text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
              required
            />
            {/* Live Visual Level Breakdown */}
            <div className="pt-1">
              <ButceDuzeyOnizleme kod={formKod} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Hesap Adı */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Hesap / Kalem Adı *
              </label>
              <input
                type="text"
                value={formHesapAdi}
                onChange={(e) => setFormHesapAdi(e.target.value)}
                placeholder="Örn: Kırtasiye ve Büro Malzemesi Alımları"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs"
                required
              />
            </div>

            {/* Muhasebe Hesap Kodu */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Muhasebe / Analitik Hesap Kodu
              </label>
              <input
                type="text"
                value={formHesapKodu}
                onChange={(e) => setFormHesapKodu(e.target.value)}
                placeholder="Örn: 630.03.02.01.01 (Boşsa bütçe kodu alınır)"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Bütçe Türü */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Alım / Bütçe Türü
              </label>
              <select
                value={formButceTuru}
                onChange={(e) => setFormButceTuru(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs cursor-pointer"
              >
                <option value="Mal Alımı">📦 Mal Alımı</option>
                <option value="Hizmet Alımı">🛠️ Hizmet Alımı</option>
                <option value="Yapım İşi">🏗️ Yapım İşi</option>
                <option value="Danışmanlık">📑 Danışmanlık</option>
                <option value="Genel">🌐 Genel Bütçe Kalemi</option>
              </select>
            </div>

            {/* Durum */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Aktiflik Durumu
              </label>
              <select
                value={formAktifMi}
                onChange={(e) => setFormAktifMi(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs cursor-pointer"
              >
                <option value={1}>✅ Aktif</option>
                <option value={0}>❌ Pasif</option>
              </select>
            </div>
          </div>

          {/* Açıklama */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
              Açıklama ve Kullanım Kapsamı
            </label>
            <textarea
              rows={3}
              value={formAciklama}
              onChange={(e) => setFormAciklama(e.target.value)}
              placeholder="Bu tertip kapsamında yapılacak alımların içeriği ve mevzuat açıklaması..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs resize-none"
            />
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl"
            >
              İptal
            </Button>
            <Button
              type="submit"
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl"
            >
              {editingItem ? 'Güncelle' : 'Kaydet'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

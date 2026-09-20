import React, { useState } from 'react'
import { AmbarInput, AmbarStok, useAmbarHooks } from './ambar.hooks'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { ExcelActions } from '../../components/ui/ExcelActions'
import { StokHareketModal } from './components/StokHareketModal'
import {
  Archive,
  ChevronDown,
  ChevronUp,
  Database,
  MapPin,
  Plus,
  ShieldAlert,
  Trash2,
  Boxes,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  RotateCcw,
  AlertTriangle,
  FileText,
  Search,
  CheckCircle2,
  TrendingUp,
  Layers,
  Building2,
  Tag
} from 'lucide-react'

const emptyAmbar: AmbarInput = {
  ambar_adi: '',
  aciklama: '',
  adres: '',
  semt: '',
  posta_kodu: '',
  sehir: '',
  telefon: '',
  faks: '',
  web_adresi: '',
  email: '',
  tasinir_kodu: '',
  tasinir_adi: ''
}

const Field = ({
  label,
  field,
  form,
  handleChange,
  required,
  placeholder
}: {
  label: string
  field: keyof AmbarInput
  form: AmbarInput
  handleChange: (field: keyof AmbarInput, value: string) => void
  required?: boolean
  placeholder?: string
}) => (
  <div>
    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <Input
      value={form[field] as string}
      onChange={(e) => handleChange(field, e.target.value)}
      placeholder={placeholder || label}
      required={required}
      className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs py-1.5 h-9"
    />
  </div>
)

export default function AmbarScreen({
  isSubComponent = false
}: {
  isSubComponent?: boolean
} = {}): React.JSX.Element {
  void isSubComponent

  const [activeTab, setActiveTab] = useState<'ambarlar' | 'stoklar' | 'hareketler' | 'tifler'>('ambarlar')
  const [selectedAmbarFilter, setSelectedAmbarFilter] = useState<number | ''>('')
  const [searchTerm, setSearchTerm] = useState('')

  const {
    ambarlar,
    isLoadingAmbarlar,
    stoklar,
    isLoadingStoklar,
    hareketler,
    isLoadingHareketler,
    tifler,
    isLoadingTifler,
    addAmbar,
    updateAmbar,
    deleteAmbar,
    deleteTif
  } = useAmbarHooks(
    selectedAmbarFilter ? Number(selectedAmbarFilter) : undefined
  )

  const [form, setForm] = useState<AmbarInput>({ ...emptyAmbar })
  const [showExtraFields, setShowExtraFields] = useState(false)
  const [isAmbarModalOpen, setIsAmbarModalOpen] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)

  // Stok Hareket Modal
  const [isHareketModalOpen, setIsHareketModalOpen] = useState(false)
  const [selectedStokForHareket, setSelectedStokForHareket] = useState<AmbarStok | null>(null)
  const [defaultHareketType, setDefaultHareketType] = useState<'giris' | 'cikis' | 'zimmet' | 'iade' | 'hasar'>('zimmet')

  const handleChange = (key: keyof AmbarInput, value: string): void => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const handleSaveAmbar = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!form.ambar_adi.trim()) return
    try {
      if (editId) {
        await updateAmbar({ id: editId, data: form })
      } else {
        await addAmbar(form)
      }
      setForm({ ...emptyAmbar })
      setShowExtraFields(false)
      setEditId(null)
      setIsAmbarModalOpen(false)
    } catch (err: any) {
      if (err.message?.includes('UNIQUE')) {
        alert('Bu ambar adı zaten kayıtlı!')
      } else {
        alert(`Ambar ${editId ? 'güncellenirken' : 'eklenirken'} hata oluştu!`)
      }
    }
  }

  const openEdit = (ambar: any) => {
    setEditId(ambar.id)
    setForm({
      ambar_adi: ambar.ambar_adi,
      aciklama: ambar.aciklama,
      adres: ambar.adres,
      semt: ambar.semt,
      posta_kodu: ambar.posta_kodu,
      sehir: ambar.sehir,
      telefon: ambar.telefon,
      faks: ambar.faks,
      web_adresi: ambar.web_adresi,
      email: ambar.email,
      tasinir_kodu: ambar.tasinir_kodu,
      tasinir_adi: ambar.tasinir_adi
    })
    setShowExtraFields(true)
    setIsAmbarModalOpen(true)
  }

  const handleDeleteAmbar = async (id: number): Promise<void> => {
    if (confirm('Bu ambar kaydını silmek istediğinize emin misiniz?')) {
      try {
        await deleteAmbar(id)
      } catch {
        alert('Silme sırasında hata oluştu!')
      }
    }
  }

  const handleDeleteTif = async (id: number): Promise<void> => {
    if (confirm('Bu TİF kaydını silmek istediğinize emin misiniz? (Stok hareketleri etkilenmez)')) {
      try {
        await deleteTif(id)
      } catch {
        alert('TİF silinirken hata oluştu!')
      }
    }
  }

  // Filtered lists
  const filteredStoklar = stoklar.filter((s) => {
    const matchesSearch = 
      s.kalem_adi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.tasinir_kodu?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.ambar_adi?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const filteredHareketler = hareketler.filter((h) => {
    const matchesSearch = 
      h.kalem_adi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.kisi_veya_birim?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.belge_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.dosya_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.ambar_adi?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const filteredTifler = tifler.filter((t) => {
    const matchesSearch =
      t.fis_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.dosya_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.dosya_adi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.ambar_adi?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  // Calculations
  const totalStockItems = stoklar.reduce((sum, s) => sum + (Number(s.toplam_miktar) || 0), 0)
  const totalStockValue = stoklar.reduce((sum, s) => sum + (Number(s.toplam_tutar) || 0), 0)
  const zimmetCount = hareketler.filter((h) => h.hareket_turu === 'zimmet').length

  const getHareketBadge = (type: string) => {
    switch (type) {
      case 'giris':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            <ArrowDownLeft className="w-3 h-3" /> Giriş
          </span>
        )
      case 'cikis':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
            <ArrowUpRight className="w-3 h-3" /> Çıkış
          </span>
        )
      case 'zimmet':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300">
            <ShieldCheck className="w-3 h-3" /> Zimmet
          </span>
        )
      case 'iade':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
            <RotateCcw className="w-3 h-3" /> İade
          </span>
        )
      case 'hasar':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300">
            <AlertTriangle className="w-3 h-3" /> Hasar / Fire
          </span>
        )
      default:
        return <span className="text-slate-500">{type}</span>
    }
  }

  return (
    <div
      className={
        isSubComponent
          ? 'flex flex-col gap-6 w-full animate-in fade-in duration-200'
          : 'p-8 max-w-[1600px] mx-auto flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto max-h-full'
      }
    >
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 text-slate-850 dark:text-slate-100">
            <Boxes className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            Ambar &amp; Stok Yönetimi (TİF)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Depolar, anlık stok durumu, taşınır işlem fişleri (TİF) ve zimmet kayıtlarını tek merkezden yönetin.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <ExcelActions tableName="TANIM_Ambar" title="Ambarlar" uniqueCol="id" />
          <Button
            onClick={() => {
              setSelectedStokForHareket(null)
              setDefaultHareketType('zimmet')
              setIsHareketModalOpen(true)
            }}
            variant="outline"
            className="gap-2 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 px-3.5 py-2 text-xs"
          >
            <ShieldCheck className="w-4 h-4 text-indigo-600" /> Stok Hareketi / Zimmet
          </Button>
          <Button
            onClick={() => {
              setEditId(null)
              setForm({ ...emptyAmbar })
              setShowExtraFields(false)
              setIsAmbarModalOpen(true)
            }}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md px-4 py-2 text-xs"
          >
            <Plus className="w-4 h-4" /> Yeni Ambar Deposu
          </Button>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Archive className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
              Tanımlı Ambarlar
            </div>
            <div className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">
              {ambarlar.length} Depo
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
              Stok Kalem Çeşidi / Adet
            </div>
            <div className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">
              {stoklar.length} Çeşit ({totalStockItems.toLocaleString('tr-TR')} Birim)
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
              Toplam Stok Değeri
            </div>
            <div className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-0.5 font-mono">
              {totalStockValue.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
              Aktif Zimmet &amp; TİF
            </div>
            <div className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">
              {zimmetCount} Zimmet / {tifler.length} TİF
            </div>
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS & FILTER BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('ambarlar')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'ambarlar'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Archive className="w-4 h-4" />
            Ambar Depoları ({ambarlar.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('stoklar')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'stoklar'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Boxes className="w-4 h-4" />
            Stok Durum Cetveli ({stoklar.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('hareketler')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'hareketler'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            Stok Hareketleri &amp; Zimmet ({hareketler.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tifler')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'tifler'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            Taşınır İşlem Fişleri (TİF) ({tifler.length})
          </button>
        </div>

        {/* SEARCH & WAREHOUSE FILTER */}
        <div className="flex items-center gap-2.5">
          {activeTab !== 'ambarlar' && (
            <select
              value={selectedAmbarFilter}
              onChange={(e) => setSelectedAmbarFilter(Number(e.target.value) || '')}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 h-9 max-w-[180px]"
            >
              <option value="">Tüm Depolar</option>
              {ambarlar.map((amb) => (
                <option key={amb.id} value={amb.id}>
                  {amb.ambar_adi}
                </option>
              ))}
            </select>
          )}

          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ara (Kalem, Fiş No, Personel)..."
              className="pl-8 text-xs h-9 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
            />
          </div>
        </div>
      </div>

      {/* TAB CONTENT: AMBARLAR */}
      {activeTab === 'ambarlar' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {isLoadingAmbarlar ? (
              <div className="col-span-full p-8 text-center text-slate-450 dark:text-slate-500 animate-pulse italic">
                Ambar depoları yükleniyor...
              </div>
            ) : ambarlar.length === 0 ? (
              <div className="col-span-full p-16 flex flex-col items-center justify-center text-slate-450 bg-slate-50 dark:bg-slate-950 rounded-xl">
                <Archive className="w-12 h-12 mb-3 text-slate-300 dark:text-slate-700" />
                <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">
                  Kayıtlı Ambar Bulunmuyor
                </h3>
              </div>
            ) : (
              ambarlar.map((ambar) => (
                <div
                  key={ambar.id}
                  className="flex flex-col p-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-850 rounded-xl hover:border-blue-300 dark:hover:border-blue-800 transition-colors group relative shadow-xs"
                >
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-md shadow-sm border border-slate-200/50 dark:border-slate-700/50 p-0.5">
                    <Button
                      title="Düzenle"
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(ambar)}
                      className="h-7 w-7 p-0 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/15"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      title="Sil"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteAmbar(ambar.id)}
                      className="h-7 w-7 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/15"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 mb-2 pr-8">
                    {ambar.tasinir_kodu && (
                      <span className="font-mono font-bold text-[10px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border border-blue-100/20 dark:border-blue-900/10 px-1.5 py-0.5 rounded">
                        {ambar.tasinir_kodu}
                      </span>
                    )}
                    {ambar.sehir && (
                      <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        {ambar.sehir}
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1 leading-normal pr-8">
                    {ambar.ambar_adi}
                  </h4>
                  {ambar.aciklama && (
                    <p className="text-[11px] text-slate-500 mb-3 line-clamp-2 flex-1">
                      {ambar.aciklama}
                    </p>
                  )}

                  <div className="mt-auto border-t border-slate-200/60 dark:border-slate-800/60 pt-3 flex flex-col gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                    {ambar.adres && (
                      <span className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{ambar.adres}</span>
                      </span>
                    )}
                    {ambar.telefon && (
                      <span className="flex items-center gap-1.5">
                        <span className="text-xs">📞</span> {ambar.telefon}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: STOK DURUM CETVELİ */}
      {activeTab === 'stoklar' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-600 dark:text-slate-400 uppercase text-[11px]">
                <tr>
                  <th className="p-3 w-12 text-center">#</th>
                  <th className="p-3">Malzeme / Kalem Adı</th>
                  <th className="p-3">Taşınır Kodu</th>
                  <th className="p-3">Bulunduğu Ambar</th>
                  <th className="p-3 text-right">Mevcut Miktar</th>
                  <th className="p-3">Birim</th>
                  <th className="p-3 text-right">Son Fiyat (₺)</th>
                  <th className="p-3 text-right">Toplam Tutar (₺)</th>
                  <th className="p-3 text-center">Aksiyon</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {isLoadingStoklar ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-400 italic">
                      Stoklar listeleniyor...
                    </td>
                  </tr>
                ) : filteredStoklar.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-12 text-center text-slate-400">
                      Kayıtlı stok kalemi bulunmuyor veya arama kriterine uygun veri yok.
                    </td>
                  </tr>
                ) : (
                  filteredStoklar.map((stok, idx) => (
                    <tr key={stok.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-950/40 transition-colors">
                      <td className="p-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                      <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">
                        {stok.kalem_adi}
                      </td>
                      <td className="p-3 font-mono text-[11px] text-blue-600 dark:text-blue-400">
                        {stok.tasinir_kodu || '-'}
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-300">
                        {stok.ambar_adi || 'Genel Depo'}
                      </td>
                      <td className="p-3 text-right font-bold text-slate-800 dark:text-slate-100">
                        <span className={`px-2 py-0.5 rounded-full ${
                          stok.toplam_miktar <= 0 
                            ? 'bg-red-100 text-red-700 dark:bg-red-950/50' 
                            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40'
                        }`}>
                          {stok.toplam_miktar}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500">{stok.olcu_birimi || 'Adet'}</td>
                      <td className="p-3 text-right font-mono text-slate-600 dark:text-slate-400">
                        {(stok.birim_fiyat || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                        {(stok.toplam_tutar || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedStokForHareket(stok)
                              setDefaultHareketType('zimmet')
                              setIsHareketModalOpen(true)
                            }}
                            className="h-7 text-[11px] px-2 gap-1 text-indigo-600 hover:bg-indigo-50 border-indigo-200 dark:border-indigo-800"
                          >
                            <ShieldCheck className="w-3 h-3" /> Zimmet
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedStokForHareket(stok)
                              setDefaultHareketType('cikis')
                              setIsHareketModalOpen(true)
                            }}
                            className="h-7 text-[11px] px-2 gap-1 text-blue-600 hover:bg-blue-50"
                          >
                            <ArrowUpRight className="w-3 h-3" /> Çıkış
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: HAREKETLER & ZİMMET */}
      {activeTab === 'hareketler' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-600 dark:text-slate-400 uppercase text-[11px]">
                <tr>
                  <th className="p-3">Tarih</th>
                  <th className="p-3">Hareket Türü</th>
                  <th className="p-3">Malzeme Adı</th>
                  <th className="p-3">Ambar</th>
                  <th className="p-3 text-right">Miktar</th>
                  <th className="p-3">Teslim Alan / Eden</th>
                  <th className="p-3">Belge / Fiş No</th>
                  <th className="p-3">İlişkili Dosya</th>
                  <th className="p-3 text-right">Tutar (₺)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {isLoadingHareketler ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-400 italic">
                      Hareketler yükleniyor...
                    </td>
                  </tr>
                ) : filteredHareketler.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-12 text-center text-slate-400">
                      Henüz stok hareketi veya zimmet kaydı bulunmuyor.
                    </td>
                  </tr>
                ) : (
                  filteredHareketler.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-950/40 transition-colors">
                      <td className="p-3 font-mono text-slate-500 whitespace-nowrap">
                        {h.islem_tarihi ? h.islem_tarihi.substring(0, 10) : '-'}
                      </td>
                      <td className="p-3">{getHareketBadge(h.hareket_turu)}</td>
                      <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">
                        {h.kalem_adi}
                        {h.tasinir_kodu && (
                          <span className="block font-mono text-[10px] text-slate-400 font-normal">
                            {h.tasinir_kodu}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-300">{h.ambar_adi}</td>
                      <td className="p-3 text-right font-bold text-slate-800 dark:text-slate-200">
                        {h.miktar} {h.olcu_birimi}
                      </td>
                      <td className="p-3 text-slate-700 dark:text-slate-300">
                        {h.kisi_veya_birim || '-'}
                      </td>
                      <td className="p-3 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                        {h.belge_no || '-'}
                      </td>
                      <td className="p-3">
                        {h.dosya_no ? (
                          <span className="font-mono font-medium text-blue-600 dark:text-blue-400">
                            {h.dosya_no}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="p-3 text-right font-mono font-semibold text-slate-800 dark:text-slate-200">
                        {(h.toplam_tutar || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: TAŞINIR İŞLEM FİŞLERİ (TİF) */}
      {activeTab === 'tifler' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-600 dark:text-slate-400 uppercase text-[11px]">
                <tr>
                  <th className="p-3">Fiş No</th>
                  <th className="p-3">Fiş Tarihi</th>
                  <th className="p-3">Ambar</th>
                  <th className="p-3">İlişkili Temin Dosyası</th>
                  <th className="p-3 text-center">Kalem Sayısı</th>
                  <th className="p-3 text-right">Toplam Tutar (₺)</th>
                  <th className="p-3 text-center">Durum</th>
                  <th className="p-3 text-center">Aksiyon</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {isLoadingTifler ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400 italic">
                      TİF belgeleri yükleniyor...
                    </td>
                  </tr>
                ) : filteredTifler.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-slate-400">
                      Henüz oluşturulmuş Taşınır İşlem Fişi (TİF) bulunmuyor.
                    </td>
                  </tr>
                ) : (
                  filteredTifler.map((tif) => (
                    <tr key={tif.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-950/40 transition-colors">
                      <td className="p-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                        {tif.fis_no}
                      </td>
                      <td className="p-3 font-mono text-slate-600 dark:text-slate-300">
                        {tif.fis_tarihi || '-'}
                      </td>
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                        {tif.ambar_adi || 'Genel Ambar'}
                      </td>
                      <td className="p-3">
                        {tif.dosya_no ? (
                          <div>
                            <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                              {tif.dosya_no}
                            </span>
                            {tif.dosya_adi && (
                              <span className="block text-[11px] text-slate-400 line-clamp-1">
                                {tif.dosya_adi}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="p-3 text-center font-bold text-slate-700 dark:text-slate-300">
                        {tif.kalem_sayisi || 0} Kalem
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                        {(tif.toplam_tutar || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺
                      </td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                          {tif.durum || 'ONAYLANDI'}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteTif(tif.id)}
                            className="h-7 w-7 p-0 text-slate-400 hover:text-red-500"
                            title="TİF Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AMBAR TANIMLAMA / DÜZENLEME MODAL */}
      <Modal
        isOpen={isAmbarModalOpen}
        onClose={() => setIsAmbarModalOpen(false)}
        title={editId ? 'Ambar Kartı Güncelle' : 'Yeni Ambar Deposu Tanımla'}
        description={
          editId
            ? 'Ambar veya depo bilgilerini düzenleyin.'
            : 'Kurumunuza ait ana ambar veya depo ekleyin.'
        }
      >
        <form onSubmit={handleSaveAmbar} className="space-y-4">
          <Field
            label="Ambar Adı"
            field="ambar_adi"
            form={form}
            handleChange={handleChange}
            required
            placeholder="Örn: Fen İşleri Yedek Parça Ambarı"
          />
          <Field
            label="Açıklama"
            field="aciklama"
            form={form}
            handleChange={handleChange}
            placeholder="Ambar hakkında kısa bilgi"
          />

          <button
            type="button"
            onClick={() => setShowExtraFields(!showExtraFields)}
            className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 font-semibold mt-2 cursor-pointer w-full justify-center bg-blue-50 dark:bg-blue-900/20 py-2 rounded-lg transition-colors"
          >
            {showExtraFields ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {showExtraFields ? 'Ek Bilgileri Gizle' : 'Adres, İletişim & Taşınır Bilgileri Göster'}
          </button>

          {showExtraFields && (
            <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-300">
              <Field label="Adres" field="adres" form={form} handleChange={handleChange} />
              <div className="grid grid-cols-3 gap-3">
                <Field label="Semt" field="semt" form={form} handleChange={handleChange} />
                <Field label="Posta Kodu" field="posta_kodu" form={form} handleChange={handleChange} />
                <Field label="Şehir" field="sehir" form={form} handleChange={handleChange} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Telefon" field="telefon" form={form} handleChange={handleChange} />
                <Field label="Faks" field="faks" form={form} handleChange={handleChange} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Web Adresi" field="web_adresi" form={form} handleChange={handleChange} />
                <Field label="Email" field="email" form={form} handleChange={handleChange} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Taşınır Kodu" field="tasinir_kodu" form={form} handleChange={handleChange} />
                <Field label="Taşınır Adı" field="tasinir_adi" form={form} handleChange={handleChange} />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
            <Button type="button" variant="outline" onClick={() => setIsAmbarModalOpen(false)}>
              İptal
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white shadow-md">
              {editId ? 'Değişiklikleri Kaydet' : 'Ambar Kaydını Ekle'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* STOK HAREKET / ZİMMET MODAL */}
      <StokHareketModal
        isOpen={isHareketModalOpen}
        onClose={() => {
          setIsHareketModalOpen(false)
          setSelectedStokForHareket(null)
        }}
        initialStok={selectedStokForHareket}
        defaultHareketTuru={defaultHareketType}
      />
    </div>
  )
}

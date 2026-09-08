import React, { useState, useMemo } from 'react'
import {
  Ruler,
  Plus,
  Search,
  Edit2,
  Trash2,
  ArrowRightLeft,
  Calculator,
  Layers,
  Sparkles,
  Star,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Scale,
  Maximize2,
  Clock,
  Thermometer,
  Box,
  Hash,
  Zap,
  Tag
} from 'lucide-react'
import {
  useOlcuBirimleri,
  useSaveOlcuBirimi,
  useDeleteOlcuBirimi,
  useBirimDonusumleri,
  useSaveBirimDonusum,
  useDeleteBirimDonusum,
  OlcuBirimi,
  BirimDonusum,
  BIRIM_KATEGORILERI,
  convertUnits
} from './olcubirimleri.hooks'
import { cn } from '../../utils/cn'
import { ExcelActions } from '../../components/ui/ExcelActions'

export default function OlcuBirimleriScreen(): React.JSX.Element {
  const { data: birimler = [], isLoading: isBirimLoading } = useOlcuBirimleri()
  const { data: donusumler = [], isLoading: isDonusumLoading } = useBirimDonusumleri()

  const saveBirimMutation = useSaveOlcuBirimi()
  const deleteBirimMutation = useDeleteOlcuBirimi()
  const saveDonusumMutation = useSaveBirimDonusum()
  const deleteDonusumMutation = useDeleteBirimDonusum()

  // State
  const [activeTab, setActiveTab] = useState<'birimler' | 'donusumler' | 'cevirici'>('birimler')
  const [selectedKategori, setSelectedKategori] = useState<string>('TÜMÜ')
  const [searchQuery, setSearchQuery] = useState('')

  // Modal states
  const [isBirimModalOpen, setIsBirimModalOpen] = useState(false)
  const [editingBirim, setEditingBirim] = useState<Partial<OlcuBirimi> | null>(null)

  const [isDonusumModalOpen, setIsDonusumModalOpen] = useState(false)
  const [editingDonusum, setEditingDonusum] = useState<Partial<BirimDonusum> | null>(null)

  // Converter widget state
  const [calcAmount, setCalcAmount] = useState<number>(1)
  const [calcFromId, setCalcFromId] = useState<number | null>(null)
  const [calcToId, setCalcToId] = useState<number | null>(null)

  // Filtered unit list
  const filteredBirimler = useMemo(() => {
    return birimler.filter((b) => {
      const matchKat = selectedKategori === 'TÜMÜ' || (b.kategori || 'Adet/Miktar') === selectedKategori
      const q = searchQuery.toLowerCase()
      const matchSearch =
        !q ||
        b.ad.toLowerCase().includes(q) ||
        (b.kisa_ad && b.kisa_ad.toLowerCase().includes(q)) ||
        (b.kategori && b.kategori.toLowerCase().includes(q)) ||
        (b.sembol && b.sembol.toLowerCase().includes(q))
      return matchKat && matchSearch
    })
  }, [birimler, selectedKategori, searchQuery])

  // Filtered conversion rules
  const filteredDonusumler = useMemo(() => {
    return donusumler.filter((d) => {
      const q = searchQuery.toLowerCase()
      if (!q) return true
      return (
        (d.kaynak_ad && d.kaynak_ad.toLowerCase().includes(q)) ||
        (d.hedef_ad && d.hedef_ad.toLowerCase().includes(q)) ||
        (d.aciklama && d.aciklama.toLowerCase().includes(q)) ||
        (d.formul && d.formul.toLowerCase().includes(q))
      )
    })
  }, [donusumler, searchQuery])

  // Set default converter units when birimler load
  React.useEffect(() => {
    if (birimler.length > 0) {
      if (!calcFromId) {
        const kg = birimler.find((b) => b.ad === 'Kilogram') || birimler[0]
        setCalcFromId(kg.id)
      }
      if (!calcToId) {
        const gr = birimler.find((b) => b.ad === 'Gram') || (birimler[1] ? birimler[1] : birimler[0])
        setCalcToId(gr.id)
      }
    }
  }, [birimler, calcFromId, calcToId])

  // Calculate live conversion result
  const conversionResult = useMemo(() => {
    const fromUnit = birimler.find((b) => b.id === calcFromId)
    const toUnit = birimler.find((b) => b.id === calcToId)
    return convertUnits(calcAmount, fromUnit, toUnit, donusumler)
  }, [calcAmount, calcFromId, calcToId, birimler, donusumler])

  // Handlers for Birim
  const handleAddNewBirim = () => {
    setEditingBirim({
      ad: '',
      kisa_ad: '',
      kategori: selectedKategori !== 'TÜMÜ' ? selectedKategori : 'Adet/Miktar',
      sembol: '',
      donusum_faktoru: 1.0,
      temel_birim_mi: 0,
      donusum_tipi: 'linear',
      ondalik_basamak: 2,
      iliskili_birimler: '',
      aciklama: '',
      aktif_mi: 1
    })
    setIsBirimModalOpen(true)
  }

  const handleEditBirim = (b: OlcuBirimi) => {
    setEditingBirim(b)
    setIsBirimModalOpen(true)
  }

  const handleDeleteBirim = (id: number) => {
    if (confirm('Bu ölçü birimini silmek istediğinize emin misiniz?')) {
      deleteBirimMutation.mutate(id)
    }
  }

  const handleSaveBirim = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingBirim?.ad?.trim()) {
      alert('Lütfen birim adı giriniz.')
      return
    }
    saveBirimMutation.mutate(editingBirim, {
      onSuccess: () => {
        setIsBirimModalOpen(false)
        setEditingBirim(null)
      }
    })
  }

  // Handlers for Donusum
  const handleAddNewDonusum = () => {
    setEditingDonusum({
      kaynak_birim_id: birimler[0]?.id || 1,
      hedef_birim_id: birimler[1]?.id || 2,
      donusum_faktoru: 1.0,
      formul: '',
      ters_formul: '',
      aciklama: '',
      aktif_mi: 1
    })
    setIsDonusumModalOpen(true)
  }

  const handleEditDonusum = (d: BirimDonusum) => {
    setEditingDonusum(d)
    setIsDonusumModalOpen(true)
  }

  const handleDeleteDonusum = (id: number) => {
    if (confirm('Bu dönüşüm kuralını silmek istediğinize emin misiniz?')) {
      deleteDonusumMutation.mutate(id)
    }
  }

  const handleSaveDonusum = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingDonusum?.kaynak_birim_id || !editingDonusum?.hedef_birim_id) {
      alert('Lütfen kaynak ve hedef birimleri seçiniz.')
      return
    }
    if (editingDonusum.kaynak_birim_id === editingDonusum.hedef_birim_id) {
      alert('Kaynak ve hedef birim aynı olamaz.')
      return
    }
    saveDonusumMutation.mutate(editingDonusum, {
      onSuccess: () => {
        setIsDonusumModalOpen(false)
        setEditingDonusum(null)
      }
    })
  }

  // Swap converter units
  const handleSwapConverter = () => {
    const temp = calcFromId
    setCalcFromId(calcToId)
    setCalcToId(temp)
  }

  const getKategoriIcon = (kategori: string | null | undefined) => {
    switch (kategori) {
      case 'Ağırlık':
        return <Scale className="w-4 h-4 text-amber-600 dark:text-amber-400" />
      case 'Uzunluk':
        return <Ruler className="w-4 h-4 text-blue-600 dark:text-blue-400" />
      case 'Alan':
        return <Maximize2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
      case 'Hacim':
        return <Box className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
      case 'Zaman':
        return <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
      case 'Sıcaklık':
        return <Thermometer className="w-4 h-4 text-rose-600 dark:text-rose-400" />
      case 'Elektrik/Enerji':
        return <Zap className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
      case 'Adet/Miktar':
        return <Hash className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
      default:
        return <Tag className="w-4 h-4 text-slate-500" />
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto flex flex-col gap-6 w-full h-full animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
      {/* Top Header */}
      <div className="flex-none flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40">
              <Ruler className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Ölçü Birimleri & Dönüşüm Yönetimi
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                Malzeme, Yapım İşi ve Hizmet kalemleri için birim havuzu, doğrusal ve formüllü dönüşüm kuralları.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <ExcelActions
            tableName={activeTab === 'donusumler' ? 'TANIM_BirimDonusum' : 'TANIM_OlcuBirimi'}
            title={activeTab === 'donusumler' ? 'Birim Dönüşümleri' : 'Ölçü Birimleri'}
            uniqueCol="id"
            onImportSuccess={() => {
              // refetch queries automatically handled
            }}
          />
          <button
            onClick={handleAddNewBirim}
            className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all hover:shadow"
          >
            <Plus size={16} />
            Yeni Ölçü Birimi
          </button>
          <button
            onClick={handleAddNewDonusum}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
          >
            <ArrowRightLeft size={16} />
            Dönüşüm Kuralı Ekle
          </button>
        </div>
      </div>

      {/* Tabs & Search Bar */}
      <div className="flex-none flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
          <button
            onClick={() => setActiveTab('birimler')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all',
              activeTab === 'birimler'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            )}
          >
            <Layers size={15} />
            Ölçü Birimleri Havuzu ({birimler.length})
          </button>
          <button
            onClick={() => setActiveTab('donusumler')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all',
              activeTab === 'donusumler'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            )}
          >
            <ArrowRightLeft size={15} />
            Dönüşüm Kuralları ({donusumler.length})
          </button>
          <button
            onClick={() => setActiveTab('cevirici')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all',
              activeTab === 'cevirici'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            )}
          >
            <Calculator size={15} />
            Canlı Birim Çevirici / Hesaplayıcı
          </button>
        </div>

        {/* Search */}
        {activeTab !== 'cevirici' && (
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Birim, sembol, formül ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
        )}
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        {/* TAB 1: ÖLÇÜ BİRİMLERİ HAVUZU */}
        {activeTab === 'birimler' && (
          <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            {/* Category Filter Pills */}
            <div className="flex-none p-3 border-b border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 overflow-x-auto flex items-center gap-1.5 scrollbar-thin">
              <button
                onClick={() => setSelectedKategori('TÜMÜ')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all',
                  selectedKategori === 'TÜMÜ'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/60'
                )}
              >
                Tümü ({birimler.length})
              </button>
              {BIRIM_KATEGORILERI.map((kat) => {
                const count = birimler.filter((b) => (b.kategori || 'Adet/Miktar') === kat).length
                return (
                  <button
                    key={kat}
                    onClick={() => setSelectedKategori(kat)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border',
                      selectedKategori === kat
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600'
                    )}
                  >
                    {getKategoriIcon(kat)}
                    <span>{kat}</span>
                    <span className={cn('text-[10px] px-1.5 py-0.2 rounded-full font-mono', selectedKategori === kat ? 'bg-blue-700 text-blue-100' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400')}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead className="bg-slate-50 dark:bg-slate-800/60 sticky top-0 z-10 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-2.5 px-4 font-bold text-xs text-slate-600 dark:text-slate-300 w-16">ID</th>
                    <th className="py-2.5 px-4 font-bold text-xs text-slate-600 dark:text-slate-300">Ölçü Birimi</th>
                    <th className="py-2.5 px-4 font-bold text-xs text-slate-600 dark:text-slate-300">Kategori</th>
                    <th className="py-2.5 px-4 font-bold text-xs text-slate-600 dark:text-slate-300">Kısa Ad / Sembol</th>
                    <th className="py-2.5 px-4 font-bold text-xs text-slate-600 dark:text-slate-300">Dönüşüm Faktörü</th>
                    <th className="py-2.5 px-4 font-bold text-xs text-slate-600 dark:text-slate-300">Ondalık</th>
                    <th className="py-2.5 px-4 font-bold text-xs text-slate-600 dark:text-slate-300 text-center">Durum</th>
                    <th className="py-2.5 px-4 font-bold text-xs text-slate-600 dark:text-slate-300 text-right w-24">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {isBirimLoading ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        Yükleniyor...
                      </td>
                    </tr>
                  ) : filteredBirimler.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">
                        {searchQuery ? 'Aramanızla eşleşen ölçü birimi bulunamadı.' : 'Bu kategoride kayıtlı ölçü birimi bulunmuyor.'}
                      </td>
                    </tr>
                  ) : (
                    filteredBirimler.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group">
                        <td className="py-3 px-4 font-mono text-slate-400">#{b.id}</td>
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                          <div className="flex items-center gap-2">
                            <span>{b.ad}</span>
                            {b.temel_birim_mi ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40" title="Kategori Temel / Referans Birimi">
                                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                Temel
                              </span>
                            ) : null}
                          </div>
                          {b.aciklama && <p className="text-[11px] text-slate-400 font-normal mt-0.5">{b.aciklama}</p>}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                            {getKategoriIcon(b.kategori)}
                            {b.kategori || 'Adet/Miktar'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                          {b.kisa_ad || b.sembol ? (
                            <span className="bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                              {b.kisa_ad || '-'} {b.sembol && b.sembol !== b.kisa_ad ? `(${b.sembol})` : ''}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                          {b.donusum_tipi === 'formula' ? (
                            <span className="text-purple-600 dark:text-purple-400 font-sans text-[11px]">Formüllü</span>
                          ) : (
                            <span>{b.donusum_faktoru ?? 1.0}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500">{b.ondalik_basamak ?? 2}</td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold',
                              b.aktif_mi
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
                            )}
                          >
                            {b.aktif_mi ? 'Aktif' : 'Pasif'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEditBirim(b)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                              title="Düzenle"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteBirim(b.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                              title="Sil"
                            >
                              <Trash2 size={14} />
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
        )}

        {/* TAB 2: DÖNÜŞÜM KURALLARI */}
        {activeTab === 'donusumler' && (
          <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="bg-slate-50 dark:bg-slate-800/60 sticky top-0 z-10 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-2.5 px-4 font-bold text-xs text-slate-600 dark:text-slate-300 w-16">ID</th>
                    <th className="py-2.5 px-4 font-bold text-xs text-slate-600 dark:text-slate-300">Kaynak Birim</th>
                    <th className="py-2.5 px-4 font-bold text-xs text-slate-600 dark:text-slate-300 text-center w-10">⇄</th>
                    <th className="py-2.5 px-4 font-bold text-xs text-slate-600 dark:text-slate-300">Hedef Birim</th>
                    <th className="py-2.5 px-4 font-bold text-xs text-slate-600 dark:text-slate-300">Dönüşüm Faktörü / Formülü</th>
                    <th className="py-2.5 px-4 font-bold text-xs text-slate-600 dark:text-slate-300">Ters Formül</th>
                    <th className="py-2.5 px-4 font-bold text-xs text-slate-600 dark:text-slate-300">Açıklama</th>
                    <th className="py-2.5 px-4 font-bold text-xs text-slate-600 dark:text-slate-300 text-center w-20">Durum</th>
                    <th className="py-2.5 px-4 font-bold text-xs text-slate-600 dark:text-slate-300 text-right w-24">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {isDonusumLoading ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        Yükleniyor...
                      </td>
                    </tr>
                  ) : filteredDonusumler.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-500">
                        Henüz kayıtlı özel birim dönüşüm kuralı bulunmuyor.
                      </td>
                    </tr>
                  ) : (
                    filteredDonusumler.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group">
                        <td className="py-3 px-4 font-mono text-slate-400">#{d.id}</td>
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                          {d.kaynak_ad} {d.kaynak_kisa_ad ? <span className="font-mono text-xs text-slate-400">({d.kaynak_kisa_ad})</span> : ''}
                        </td>
                        <td className="py-3 px-4 text-center text-blue-500 font-bold">➔</td>
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                          {d.hedef_ad} {d.hedef_kisa_ad ? <span className="font-mono text-xs text-slate-400">({d.hedef_kisa_ad})</span> : ''}
                        </td>
                        <td className="py-3 px-4 font-mono">
                          {d.formul ? (
                            <span className="font-bold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800/40">
                              {d.formul}
                            </span>
                          ) : (
                            <span className="font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800/40">
                              × {d.donusum_faktoru}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500">
                          {d.ters_formul || (d.donusum_faktoru ? `÷ ${d.donusum_faktoru}` : '-')}
                        </td>
                        <td className="py-3 px-4 text-slate-500">{d.aciklama || '-'}</td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={cn(
                              'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold',
                              d.aktif_mi
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60'
                                : 'bg-slate-100 text-slate-500'
                            )}
                          >
                            {d.aktif_mi ? 'Aktif' : 'Pasif'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEditDonusum(d)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                              title="Düzenle"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteDonusum(d.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                              title="Sil"
                            >
                              <Trash2 size={14} />
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
        )}

        {/* TAB 3: CANLI BİRİM ÇEVİRİCİ / HESAPLAYICI */}
        {activeTab === 'cevirici' && (
          <div className="flex-1 overflow-auto grid grid-cols-1 lg:grid-cols-12 gap-6 p-2">
            {/* Interactive Calculator Card */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col gap-6">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">İnteraktif Dönüşüm Hesaplayıcı</h3>
                  <p className="text-xs text-slate-500">Miktar girin ve birimleri seçerek anlık dönüşüm sonucunu inceleyin.</p>
                </div>
              </div>

              {/* Input row */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Amount */}
                <div className="md:col-span-4 flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Miktar</label>
                  <input
                    type="number"
                    step="any"
                    value={calcAmount}
                    onChange={(e) => setCalcAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-base font-bold font-mono text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/40 focus:outline-none"
                    placeholder="Miktar..."
                  />
                </div>

                {/* From Unit */}
                <div className="md:col-span-3 flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Kaynak Birim</label>
                  <select
                    value={calcFromId || ''}
                    onChange={(e) => setCalcFromId(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/40 focus:outline-none"
                  >
                    {birimler.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.ad} {b.kisa_ad ? `(${b.kisa_ad})` : ''} — {b.kategori}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Swap Button */}
                <div className="md:col-span-2 flex items-center justify-center pt-5">
                  <button
                    type="button"
                    onClick={handleSwapConverter}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors shadow-xs"
                    title="Birimleri Değiştir (Swap)"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                  </button>
                </div>

                {/* To Unit */}
                <div className="md:col-span-3 flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Hedef Birim</label>
                  <select
                    value={calcToId || ''}
                    onChange={(e) => setCalcToId(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/40 focus:outline-none"
                  >
                    {birimler.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.ad} {b.kisa_ad ? `(${b.kisa_ad})` : ''} — {b.kategori}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Result Display Box */}
              <div className="mt-2 p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-slate-50 dark:from-blue-950/40 dark:via-indigo-950/20 dark:to-slate-900 border border-blue-200/80 dark:border-blue-800/50 flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <span>Dönüşüm Sonucu</span>
                  {conversionResult.success && (
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Başarılı
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-3">
                  <span className="text-3xl md:text-4xl font-black font-mono tracking-tight text-blue-600 dark:text-blue-400">
                    {conversionResult.success
                      ? Number(conversionResult.result.toFixed(6)).toLocaleString('tr-TR')
                      : '-'}
                  </span>
                  <span className="text-lg font-bold text-slate-700 dark:text-slate-300">
                    {birimler.find((b) => b.id === calcToId)?.kisa_ad || birimler.find((b) => b.id === calcToId)?.ad}
                  </span>
                </div>

                <div className="pt-3 border-t border-blue-100 dark:border-blue-900/40 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Uygulanan Kural & Formül:</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300 bg-white/70 dark:bg-slate-800/80 px-2 py-0.5 rounded border border-blue-100 dark:border-blue-800">
                    {conversionResult.formulaText || 'Eşleşen kural yok'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Reference / Scenario Cards */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Popüler Dönüşüm Senaryoları
                </h4>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30 flex flex-col gap-1">
                    <span className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5" /> Ağırlık Dönüşümleri
                    </span>
                    <span className="font-mono text-slate-600 dark:text-slate-400">1 Ton = 1.000 kg = 1.000.000 g</span>
                    <span className="font-mono text-slate-600 dark:text-slate-400">1 kg = 1.000 g = 0.001 Ton</span>
                  </div>

                  <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/30 flex flex-col gap-1">
                    <span className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                      <Ruler className="w-3.5 h-3.5" /> Uzunluk & Yapım
                    </span>
                    <span className="font-mono text-slate-600 dark:text-slate-400">1 km = 1.000 m = 100.000 cm</span>
                    <span className="font-mono text-slate-600 dark:text-slate-400">1 m = 100 cm = 1.000 mm = 1 Metretül (mt)</span>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/30 flex flex-col gap-1">
                    <span className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                      <Maximize2 className="w-3.5 h-3.5" /> Alan & Hacim
                    </span>
                    <span className="font-mono text-slate-600 dark:text-slate-400">1 Hektar (ha) = 10.000 m² = 10 Dönüm</span>
                    <span className="font-mono text-slate-600 dark:text-slate-400">1 m³ = 1.000 Litre | 1 L = 1.000 ml</span>
                  </div>

                  <div className="p-3 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-800/30 flex flex-col gap-1">
                    <span className="font-bold text-rose-900 dark:text-rose-300 flex items-center gap-1.5">
                      <Thermometer className="w-3.5 h-3.5" /> Sıcaklık (Formüllü)
                    </span>
                    <span className="font-mono text-slate-600 dark:text-slate-400">0 °C = 32 °F | Formül: (°C × 9/5) + 32</span>
                    <span className="font-mono text-slate-600 dark:text-slate-400">100 °C = 212 °F | 0 °C = 273.15 K</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: ÖLÇÜ BİRİMİ EKLE / DÜZENLE */}
      {isBirimModalOpen && editingBirim && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-850">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
                  <Ruler size={18} />
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {editingBirim.id ? 'Ölçü Birimini Düzenle' : 'Yeni Ölçü Birimi Ekle'}
                </h2>
              </div>
              <button
                onClick={() => {
                  setIsBirimModalOpen(false)
                  setEditingBirim(null)
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-lg font-bold p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveBirim} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Birim Adı */}
                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Birim Adı <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingBirim.ad || ''}
                    onChange={(e) => setEditingBirim({ ...editingBirim, ad: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    placeholder="Örn: Kilogram, Metrekare, Deste, Ay..."
                    autoFocus
                  />
                </div>

                {/* Kısa Ad */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Kısa Ad (Kısaltma)
                  </label>
                  <input
                    type="text"
                    value={editingBirim.kisa_ad || ''}
                    onChange={(e) => setEditingBirim({ ...editingBirim, kisa_ad: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    placeholder="Örn: kg, m², ad, lt..."
                  />
                </div>

                {/* Sembol */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Uluslararası Sembol
                  </label>
                  <input
                    type="text"
                    value={editingBirim.sembol || ''}
                    onChange={(e) => setEditingBirim({ ...editingBirim, sembol: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    placeholder="Örn: kg, m³, °C..."
                  />
                </div>

                {/* Kategori */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Kategori
                  </label>
                  <select
                    value={editingBirim.kategori || 'Adet/Miktar'}
                    onChange={(e) => setEditingBirim({ ...editingBirim, kategori: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  >
                    {BIRIM_KATEGORILERI.map((kat) => (
                      <option key={kat} value={kat}>
                        {kat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dönüşüm Tipi */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Dönüşüm Tipi
                  </label>
                  <select
                    value={editingBirim.donusum_tipi || 'linear'}
                    onChange={(e) => setEditingBirim({ ...editingBirim, donusum_tipi: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  >
                    <option value="linear">Doğrusal (Çarpan ile: x × faktör)</option>
                    <option value="formula">Formüllü (Karmaşık: (°C × 9/5) + 32)</option>
                  </select>
                </div>

                {/* Dönüşüm Faktörü */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Dönüşüm Faktörü (Temel Birime Oranı)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={editingBirim.donusum_faktoru ?? 1.0}
                    onChange={(e) =>
                      setEditingBirim({
                        ...editingBirim,
                        donusum_faktoru: parseFloat(e.target.value) || 0
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    placeholder="1.0"
                  />
                </div>

                {/* Ondalık Basamak */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Ondalık Basamak Gösterimi
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="6"
                    value={editingBirim.ondalik_basamak ?? 2}
                    onChange={(e) =>
                      setEditingBirim({
                        ...editingBirim,
                        ondalik_basamak: parseInt(e.target.value, 10) || 0
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>

                {/* Temel Birim & Aktiflik Switches */}
                <div className="md:col-span-2 flex flex-col sm:flex-row gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!editingBirim.temel_birim_mi}
                      onChange={(e) =>
                        setEditingBirim({ ...editingBirim, temel_birim_mi: e.target.checked ? 1 : 0 })
                      }
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      Kategori Temel / Referans Birimi (Baz Birim)
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingBirim.aktif_mi === 1}
                      onChange={(e) =>
                        setEditingBirim({ ...editingBirim, aktif_mi: e.target.checked ? 1 : 0 })
                      }
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <span className="font-bold text-slate-700 dark:text-slate-200">Aktif (Kullanılabilir)</span>
                  </label>
                </div>

                {/* Açıklama */}
                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Açıklama / Notlar
                  </label>
                  <textarea
                    rows={2}
                    value={editingBirim.aciklama || ''}
                    onChange={(e) => setEditingBirim({ ...editingBirim, aciklama: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    placeholder="Birim kullanım alanı veya teknik notlar..."
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsBirimModalOpen(false)
                    setEditingBirim(null)
                  }}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-semibold transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={saveBirimMutation.isPending}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-all"
                >
                  {saveBirimMutation.isPending ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: DÖNÜŞÜM KURALI EKLE / DÜZENLE */}
      {isDonusumModalOpen && editingDonusum && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-850">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600">
                  <ArrowRightLeft size={18} />
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {editingDonusum.id ? 'Dönüşüm Kuralını Düzenle' : 'Yeni Birim Dönüşüm Kuralı'}
                </h2>
              </div>
              <button
                onClick={() => {
                  setIsDonusumModalOpen(false)
                  setEditingDonusum(null)
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-lg font-bold p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveDonusum} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Kaynak Birim */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Kaynak Birim <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={editingDonusum.kaynak_birim_id || ''}
                    onChange={(e) =>
                      setEditingDonusum({ ...editingDonusum, kaynak_birim_id: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500/40 focus:outline-none"
                  >
                    {birimler.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.ad} {b.kisa_ad ? `(${b.kisa_ad})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Hedef Birim */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Hedef Birim <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={editingDonusum.hedef_birim_id || ''}
                    onChange={(e) =>
                      setEditingDonusum({ ...editingDonusum, hedef_birim_id: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500/40 focus:outline-none"
                  >
                    {birimler.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.ad} {b.kisa_ad ? `(${b.kisa_ad})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dönüşüm Faktörü */}
                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Dönüşüm Çarpanı (Faktör)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={editingDonusum.donusum_faktoru ?? ''}
                    onChange={(e) =>
                      setEditingDonusum({
                        ...editingDonusum,
                        donusum_faktoru: parseFloat(e.target.value) || null
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/40 focus:outline-none"
                    placeholder="Örn: 1000 (1 kg için 1000 g gibi)"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Doğrusal çarpan (Hedef = Kaynak × Faktör).
                  </p>
                </div>

                {/* Formül */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Özel Formül (Varsa)
                  </label>
                  <input
                    type="text"
                    value={editingDonusum.formul || ''}
                    onChange={(e) => setEditingDonusum({ ...editingDonusum, formul: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/40 focus:outline-none"
                    placeholder="Örn: (x * 9/5) + 32"
                  />
                </div>

                {/* Ters Formül */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Ters Formül
                  </label>
                  <input
                    type="text"
                    value={editingDonusum.ters_formul || ''}
                    onChange={(e) => setEditingDonusum({ ...editingDonusum, ters_formul: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/40 focus:outline-none"
                    placeholder="Örn: (x - 32) * 5/9"
                  />
                </div>

                {/* Açıklama */}
                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Açıklama
                  </label>
                  <input
                    type="text"
                    value={editingDonusum.aciklama || ''}
                    onChange={(e) => setEditingDonusum({ ...editingDonusum, aciklama: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/40 focus:outline-none"
                    placeholder="Örn: 1 kg = 1000 g dönüşümü"
                  />
                </div>

                {/* Aktiflik Switch */}
                <div className="md:col-span-2 flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                  <input
                    type="checkbox"
                    id="donusum_aktif_mi"
                    checked={editingDonusum.aktif_mi === 1}
                    onChange={(e) =>
                      setEditingDonusum({ ...editingDonusum, aktif_mi: e.target.checked ? 1 : 0 })
                    }
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <label htmlFor="donusum_aktif_mi" className="font-bold text-slate-700 dark:text-slate-200 cursor-pointer">
                    Kural Aktif (Sistemde ve Çeviricide Geçerli)
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsDonusumModalOpen(false)
                    setEditingDonusum(null)
                  }}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-semibold transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={saveDonusumMutation.isPending}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm transition-all"
                >
                  {saveDonusumMutation.isPending ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

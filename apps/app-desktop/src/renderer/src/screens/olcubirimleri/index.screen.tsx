import React, { useState, useMemo } from 'react'
import { Ruler, Plus, Search, ArrowRightLeft, Calculator, Layers } from 'lucide-react'
import {
  useOlcuBirimleri,
  useSaveOlcuBirimi,
  useDeleteOlcuBirimi,
  useBirimDonusumleri,
  useSaveBirimDonusum,
  useDeleteBirimDonusum,
  OlcuBirimi,
  BirimDonusum
} from './olcubirimleri.hooks'
import { cn } from '../../utils/cn'
import { ExcelActions } from '../../components/ui/ExcelActions'
import { BirimlerTable } from './components/BirimlerTable'
import { DonusumlerTable } from './components/DonusumlerTable'
import { BirimCevirici } from './components/BirimCevirici'
import { BirimModal } from './components/BirimModal'
import { DonusumModal } from './components/DonusumModal'

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

  // Converter state
  const defaultFromId = useMemo(() => {
    return (birimler.find((b) => b.ad === 'Kilogram') || birimler[0])?.id || 1
  }, [birimler])

  const defaultToId = useMemo(() => {
    return (birimler.find((b) => b.ad === 'Gram') || birimler[1] || birimler[0])?.id || 2
  }, [birimler])

  const [calcAmount, setCalcAmount] = useState<number>(1)
  const [calcFromIdState, setCalcFromId] = useState<number | null>(null)
  const [calcToIdState, setCalcToId] = useState<number | null>(null)

  const calcFromId = calcFromIdState ?? defaultFromId
  const calcToId = calcToIdState ?? defaultToId

  // Filtered unit list
  const filteredBirimler = useMemo(() => {
    return birimler.filter((b) => {
      const matchKat = selectedKategori === 'TÜMÜ' || (b.kategori || 'Adet/Miktar') === selectedKategori
      const q = searchQuery.toLowerCase()
      return (
        matchKat &&
        (!q ||
          b.ad.toLowerCase().includes(q) ||
          (b.kisa_ad && b.kisa_ad.toLowerCase().includes(q)) ||
          (b.kategori && b.kategori.toLowerCase().includes(q)) ||
          (b.sembol && b.sembol.toLowerCase().includes(q)))
      )
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

  // Birim Handlers
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

  // Donusum Handlers
  const handleAddNewDonusum = () => {
    const defaultK = birimler[0]?.id || 1
    const defaultH = birimler[1]?.id || (birimler[0]?.id ? birimler[0].id + 1 : 2)
    setEditingDonusum({
      kaynak_birim_id: defaultK,
      hedef_birim_id: defaultH,
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

  const handleDonusumBirimChange = (type: 'kaynak' | 'hedef', unitId: number) => {
    if (!editingDonusum) return
    const next: Partial<BirimDonusum> = {
      ...editingDonusum,
      [type === 'kaynak' ? 'kaynak_birim_id' : 'hedef_birim_id']: unitId
    }
    const kId = type === 'kaynak' ? unitId : next.kaynak_birim_id || 0
    const hId = type === 'hedef' ? unitId : next.hedef_birim_id || 0
    const kUnit = birimler.find((b) => b.id === kId)
    const hUnit = birimler.find((b) => b.id === hId)

    if (
      kUnit &&
      hUnit &&
      kUnit.kategori === hUnit.kategori &&
      kUnit.donusum_faktoru &&
      hUnit.donusum_faktoru &&
      !next.formul
    ) {
      const calculatedFactor = Number((kUnit.donusum_faktoru / hUnit.donusum_faktoru).toFixed(8))
      next.donusum_faktoru = calculatedFactor
      if (!next.aciklama || next.aciklama.includes('dönüşümü') || next.aciklama === '') {
        next.aciklama = `1 ${kUnit.ad} = ${calculatedFactor} ${hUnit.ad} dönüşümü`
      }
    }
    setEditingDonusum(next)
  }

  const handleSwapModalDonusum = () => {
    if (!editingDonusum) return
    const oldKaynak = editingDonusum.kaynak_birim_id
    const oldHedef = editingDonusum.hedef_birim_id
    if (!oldKaynak || !oldHedef) return

    const kUnit = birimler.find((b) => b.id === oldHedef)
    const hUnit = birimler.find((b) => b.id === oldKaynak)
    let factor = editingDonusum.donusum_faktoru
    if (factor && factor > 0) factor = Number((1 / factor).toFixed(8))

    setEditingDonusum({
      ...editingDonusum,
      kaynak_birim_id: oldHedef,
      hedef_birim_id: oldKaynak,
      donusum_faktoru: factor,
      aciklama: kUnit && hUnit && factor ? `1 ${kUnit.ad} = ${factor} ${hUnit.ad} dönüşümü` : editingDonusum.aciklama
    })
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

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto flex flex-col gap-6 w-full h-full animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
      {/* Top Header */}
      <div className="flex-none flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
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

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <ExcelActions
            tableName={activeTab === 'donusumler' ? 'TANIM_BirimDonusum' : 'TANIM_OlcuBirimi'}
            title={activeTab === 'donusumler' ? 'Birim Dönüşümleri' : 'Ölçü Birimleri'}
            uniqueCol="id"
            onImportSuccess={() => {}}
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
        {activeTab === 'birimler' && (
          <BirimlerTable
            birimler={birimler}
            filteredBirimler={filteredBirimler}
            selectedKategori={selectedKategori}
            setSelectedKategori={setSelectedKategori}
            searchQuery={searchQuery}
            isLoading={isBirimLoading}
            onEdit={handleEditBirim}
            onDelete={handleDeleteBirim}
          />
        )}

        {activeTab === 'donusumler' && (
          <DonusumlerTable
            filteredDonusumler={filteredDonusumler}
            isLoading={isDonusumLoading}
            onEdit={handleEditDonusum}
            onDelete={handleDeleteDonusum}
          />
        )}

        {activeTab === 'cevirici' && (
          <BirimCevirici
            birimler={birimler}
            donusumler={donusumler}
            calcAmount={calcAmount}
            setCalcAmount={setCalcAmount}
            calcFromId={calcFromId}
            setCalcFromId={(id) => setCalcFromId(id)}
            calcToId={calcToId}
            setCalcToId={(id) => setCalcToId(id)}
            onSwap={() => {
              const temp = calcFromId
              setCalcFromId(calcToId)
              setCalcToId(temp)
            }}
          />
        )}
      </div>

      {/* MODALS */}
      <BirimModal
        isOpen={isBirimModalOpen}
        editingBirim={editingBirim}
        setEditingBirim={setEditingBirim}
        onClose={() => {
          setIsBirimModalOpen(false)
          setEditingBirim(null)
        }}
        onSave={handleSaveBirim}
        isPending={saveBirimMutation.isPending}
      />

      <DonusumModal
        isOpen={isDonusumModalOpen}
        editingDonusum={editingDonusum}
        setEditingDonusum={setEditingDonusum}
        birimler={birimler}
        onClose={() => {
          setIsDonusumModalOpen(false)
          setEditingDonusum(null)
        }}
        onSave={handleSaveDonusum}
        onSwap={handleSwapModalDonusum}
        onUnitChange={handleDonusumBirimChange}
        isPending={saveDonusumMutation.isPending}
      />
    </div>
  )
}

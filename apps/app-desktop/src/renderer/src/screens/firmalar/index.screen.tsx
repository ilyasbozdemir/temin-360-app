import React, { useState } from 'react'
import { FirmaInput, useFirmalarHooks } from './firmalar.hooks'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Building2, Plus, Search } from 'lucide-react'
import { DataViewMode, ViewToggle } from '../../components/ui/ViewToggle'

// Sub-components
import { FirmaDetail } from './components/FirmaDetail'
import { FirmaGrid } from './components/FirmaGrid'
import { FirmaList } from './components/FirmaList'
import { FirmaModal } from './components/FirmaModal'
import { ExcelActions } from '../../components/ui/ExcelActions'

const emptyFirma: FirmaInput = {
  firma_kodu: '',
  unvan: '',
  ilgili_adi: '',
  uyrugu: 'T.C.',
  istigal_konusu: '',
  adres: '',
  ilce: '',
  posta_kodu: '',
  il: '',
  telefon: '',
  faks: '',
  email: '',
  web_adresi: '',
  banka_adi: '',
  sube_kodu_adi: '',
  hesap_no: '',
  tc_kimlik_no: '',
  dogum_tarihi: '',
  vergi_dairesi: '',
  vergi_no: '',
  deneyim_skoru: 0,
  kalite_skoru: 0,
  odeme_disiplini: 1,
  kara_liste: 0,
  kara_liste_neden: '',
  son_iletisim_tarihi: '',
  sorumlu_personel_id: null,
  iletisim_notlari: '[]'
}

export default function FirmalarScreen(): React.JSX.Element {
  const { firmalar, isLoadingFirmalar, addFirma, updateFirma, deleteFirma } = useFirmalarHooks()
  const [form, setForm] = useState<FirmaInput>({ ...emptyFirma })
  const [searchQuery, setSearchQuery] = useState('')
  const [showExtraFields, setShowExtraFields] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [dataViewMode, setDataViewMode] = useState<DataViewMode>('grid')
  const [viewingFirma, setViewingFirma] = useState<any | null>(null)

  const openAddModal = () => {
    setForm({ ...emptyFirma })
    setEditingId(null)
    setShowExtraFields(false)
    setIsModalOpen(true)
  }

  const openEditModal = (e: React.MouseEvent, firma: any) => {
    e.stopPropagation()
    const { id, aktif_mi, created_at, updated_at, ...editableData } = firma
    setForm({ ...emptyFirma, ...editableData })
    setEditingId(id)
    setShowExtraFields(false)
    setIsModalOpen(true)
  }

  const handleViewClick = (firma: any) => {
    setViewingFirma(firma)
  }

  const handleChange = (key: keyof FirmaInput, value: string): void => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!form.unvan.trim()) return

    try {
      if (editingId) {
        await updateFirma({ id: editingId, data: form })
      } else {
        await addFirma(form)
      }
      setForm({ ...emptyFirma })
      setEditingId(null)
      setShowExtraFields(false)
      setIsModalOpen(false)
    } catch (err: any) {
      alert(err.message || 'İşlem sırasında hata oluştu!')
    }
  }

  const handleDelete = async (e: React.MouseEvent, id: number): Promise<void> => {
    e.stopPropagation()
    if (confirm('Bu firmayı silmek istediğinize emin misiniz?')) {
      try {
        await deleteFirma(id)
      } catch {
        alert('Silme sırasında hata oluştu!')
      }
    }
  }

  const filtered = firmalar.filter((f) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      f.unvan?.toLowerCase().includes(q) ||
      f.firma_kodu?.toLowerCase().includes(q) ||
      f.vergi_no?.toLowerCase().includes(q) ||
      f.il?.toLowerCase().includes(q)
    )
  })

  if (viewingFirma) {
    return <FirmaDetail viewingFirma={viewingFirma} setViewingFirma={setViewingFirma} />
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto max-h-full">
      {/* BAŞLIK */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 text-slate-855 dark:text-slate-100">
            <Building2 className="w-8 h-8 text-blue-600" />
            İstekli Firma Yönetimi & CRM
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
            Tedarikçi firmaların performans skoru, kara liste durumları ve iletişim geçmişini yönetin.
          </p>
        </div>
        <div className="flex items-center gap-4 sm:gap-6 shrink-0">
          <div className="text-right border-r border-slate-200 dark:border-slate-800 pr-6 hidden sm:block">
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              {firmalar.length}
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
              Kayıtlı Firma
            </div>
          </div>
          <ExcelActions
            tableName="TANIM_Firma"
            title="Firmalar"
            uniqueCol="id"
          />
          <Button
            onClick={openAddModal}
            className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-md flex items-center px-4 py-2 text-sm"
          >
            <Plus className="w-4 h-4" /> Yeni Firma Ekle
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col flex-1 overflow-hidden min-h-[400px]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200">Kayıtlı Firmalar</h3>
          <div className="flex items-center gap-3">
            <ViewToggle viewMode={dataViewMode} onChange={setDataViewMode} />
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Firma ünvanı, vergi no, kod veya şehir ara..."
                className="pl-9 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs py-2 h-9 rounded-full"
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {isLoadingFirmalar ? (
            <div className="text-center text-slate-450 dark:text-slate-500 animate-pulse italic py-8">
              Firmalar yükleniyor...
            </div>
          ) : filtered.length === 0 ? (
            <div className="col-span-full p-16 flex flex-col items-center justify-center text-slate-450 bg-slate-50 dark:bg-slate-950 rounded-xl">
              <Building2 className="w-12 h-12 mb-3 text-slate-300 dark:text-slate-700" />
              <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">
                Firma Bulunamadı
              </h3>
              <p className="text-xs mt-1 text-slate-500">
                {searchQuery
                  ? 'Arama kriterlerinize uygun firma yok.'
                  : 'Henüz sisteme eklenmiş bir firma bulunmuyor.'}
              </p>
            </div>
          ) : dataViewMode === 'grid' ? (
            <FirmaGrid
              filtered={filtered}
              handleViewClick={handleViewClick}
              openEditModal={openEditModal}
              handleDelete={handleDelete}
            />
          ) : (
            <FirmaList
              filtered={filtered}
              dataViewMode={dataViewMode}
              handleViewClick={handleViewClick}
              openEditModal={openEditModal}
              handleDelete={handleDelete}
            />
          )}
        </div>
      </div>

      <FirmaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingId={editingId}
        form={form}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        showExtraFields={showExtraFields}
        setShowExtraFields={setShowExtraFields}
      />
    </div>
  )
}

import React, { useState } from 'react'
import { BirimInput, useBirimlerHooks, usePersonelList } from './birimler.hooks'
import { useAyarlarHooks } from '../ayarlar/ayarlar.hooks'
import { Button } from '../../components/ui/Button'
import { LayoutGrid, Plus } from 'lucide-react'
import { DataViewMode, ViewToggle } from '../../components/ui/ViewToggle'

// Subcomponents
import { BirimDetail } from './components/BirimDetail'
import { BirimGrid } from './components/BirimGrid'
import { BirimList } from './components/BirimList'
import { BirimModal } from './components/BirimModal'
import { ExcelActions } from '../../components/ui/ExcelActions'

const emptyBirim: BirimInput = {
  birim_adi: '',
  antet_ek_satir: '',
  ihtiyac_yeri_eki: '',
  sunum_makami: '',
  e_butce: '',
  say2000i: '',
  dtvt_kodu: '',
  detsis_kodu: '',
  muhasebe_kodu: '',
  muhasebe_adi: '',
  harcama_kodu: '',
  harcama_adi: '',
  ayrintili_bilgi_personel: '',
  ilgili_personel_id: null
}

export default function BirimlerScreen({
  isSubComponent = false
}: {
  isSubComponent?: boolean
}): React.ReactNode {
  const { birimler, isLoadingBirimler, addBirim, updateBirim, deleteBirim } = useBirimlerHooks()
  const { personeller, isLoading: isLoadingPersonel } = usePersonelList()
  const { settings } = useAyarlarHooks() as {
    settings: Record<string, string>
  }
  const [form, setForm] = useState<BirimInput>({ ...emptyBirim })
  const [showExtraFields, setShowExtraFields] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBirimId, setEditingBirimId] = useState<number | null>(null)
  const [dataViewMode, setDataViewMode] = useState<DataViewMode>('grid')
  const [viewingBirim, setViewingBirim] = useState<any | null>(null)
  const [ihtiyacYeriList, setIhtiyacYeriList] = useState<string[]>([''])

  const isMuhasebe =
    form.birim_adi.toLowerCase().includes('muhasebe') ||
    form.birim_adi.toLowerCase().includes('mali') ||
    form.birim_adi.toLowerCase().includes('harcama')

  const handleChange = (key: keyof BirimInput, value: string | number | null): void => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!form.birim_adi.trim()) return

    const finalIhtiyacYeri = JSON.stringify(ihtiyacYeriList.filter((v) => v.trim() !== ''))
    const submitData = { ...form, ihtiyac_yeri_eki: finalIhtiyacYeri }

    try {
      if (editingBirimId) {
        await updateBirim({ id: editingBirimId, data: submitData })
      } else {
        await addBirim(submitData)
      }
      closeModal()
    } catch (err: any) {
      if (err.message?.includes('UNIQUE')) {
        alert('Bu birim zaten ekli!')
      } else {
        console.error(err)
        alert('Birim kaydedilirken hata oluştu!')
      }
    }
  }

  const openModal = () => {
    setForm({ ...emptyBirim })
    setIhtiyacYeriList([''])
    setEditingBirimId(null)
    setShowExtraFields(false)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingBirimId(null)
    setIhtiyacYeriList([''])
  }

  const handleEditClick = (e: React.MouseEvent, birim: any) => {
    e.stopPropagation()
    setForm({
      birim_adi: birim.birim_adi || '',
      antet_ek_satir: birim.antet_ek_satir || '',
      ihtiyac_yeri_eki: birim.ihtiyac_yeri_eki || '',
      sunum_makami: birim.sunum_makami || '',
      e_butce: birim.e_butce || '',
      say2000i: birim.say2000i || '',
      dtvt_kodu: birim.dtvt_kodu || '',
      detsis_kodu: birim.detsis_kodu || '',
      muhasebe_kodu: birim.muhasebe_kodu || '',
      muhasebe_adi: birim.muhasebe_adi || '',
      harcama_kodu: birim.harcama_kodu || '',
      harcama_adi: birim.harcama_adi || '',
      ayrintili_bilgi_personel: birim.ayrintili_bilgi_personel || '',
      ilgili_personel_id: birim.ilgili_personel_id || null
    })
    let parsedIhtiyacList = ['']
    if (birim.ihtiyac_yeri_eki) {
      try {
        if (birim.ihtiyac_yeri_eki.startsWith('[')) {
          parsedIhtiyacList = JSON.parse(birim.ihtiyac_yeri_eki)
        } else {
          parsedIhtiyacList = birim.ihtiyac_yeri_eki.split('\n')
        }
      } catch (e) {
        parsedIhtiyacList = [birim.ihtiyac_yeri_eki]
      }
    }
    setIhtiyacYeriList(parsedIhtiyacList)
    setEditingBirimId(birim.id)
    setShowExtraFields(true)
    setIsModalOpen(true)
  }

  const handleViewClick = (birim: any) => {
    setViewingBirim(birim)
  }

  const handleDeleteBirim = async (e: React.MouseEvent, id: number): Promise<void> => {
    e.stopPropagation()
    const targetBirim = birimler.find((b) => b.id === id)
    const birimAdi = targetBirim?.birim_adi || (targetBirim as any)?.ad || 'Bu birimi'

    if (confirm(`"${birimAdi}" birimini silmek istediğinize emin misiniz?`)) {
      try {
        await deleteBirim(id)
      } catch (err: any) {
        console.error('Birim silme hatası:', err)
        alert('Birim silinemedi: ' + (err?.message || 'Bilinmeyen hata'))
      }
    }
  }

  if (viewingBirim) {
    return (
      <BirimDetail
        viewingBirim={viewingBirim}
        setViewingBirim={setViewingBirim}
        personeller={personeller}
      />
    )
  }

  return (
    <div
      className={
        isSubComponent
          ? 'flex flex-col h-full space-y-6 w-full animate-in fade-in duration-200'
          : 'p-8 max-w-[1600px] mx-auto flex flex-col h-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto max-h-full'
      }
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-855 dark:text-slate-100 flex items-center gap-3">
            <LayoutGrid className="w-8 h-8 text-blue-600" />
            Birim &amp; Müdürlük Yönetimi
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Kurumunuza ait idari birimleri ve müdürlükleri buradan tanımlayarak personellere
            atayabilirsiniz.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ExcelActions
            tableName="TANIM_Birim"
            title="Birimler"
            uniqueCol="id"
          />
          <ViewToggle viewMode={dataViewMode} onChange={setDataViewMode} />
          <Button
            onClick={openModal}
            className="bg-blue-600 hover:bg-blue-700 shadow-md flex items-center gap-2 px-4 py-2 text-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            Yeni Birim Ekle
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col flex-1 overflow-hidden min-h-[400px]">
        <div className="flex-1 overflow-auto">
          {isLoadingBirimler ? (
            <div className="text-sm text-slate-450 dark:text-slate-500 py-4 italic text-center w-full">
              Birimler yükleniyor...
            </div>
          ) : birimler.length === 0 ? (
            <div className="text-sm text-slate-450 dark:text-slate-500 py-4 italic text-center w-full">
              Kayıtlı birim bulunmamaktadır.
            </div>
          ) : dataViewMode === 'grid' ? (
            <BirimGrid
              birimler={birimler}
              personeller={personeller}
              handleViewClick={handleViewClick}
              handleEditClick={handleEditClick}
              handleDeleteBirim={handleDeleteBirim}
            />
          ) : (
            <BirimList
              birimler={birimler}
              personeller={personeller}
              dataViewMode={dataViewMode}
              handleViewClick={handleViewClick}
              handleEditClick={handleEditClick}
              handleDeleteBirim={handleDeleteBirim}
            />
          )}
        </div>
      </div>

      <BirimModal
        isOpen={isModalOpen}
        onClose={closeModal}
        editingBirimId={editingBirimId}
        form={form}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        showExtraFields={showExtraFields}
        setShowExtraFields={setShowExtraFields}
        isMuhasebe={isMuhasebe}
        settings={settings}
        ihtiyacYeriList={ihtiyacYeriList}
        setIhtiyacYeriList={setIhtiyacYeriList}
        personeller={personeller}
        isLoadingPersonel={isLoadingPersonel}
      />
    </div>
  )
}

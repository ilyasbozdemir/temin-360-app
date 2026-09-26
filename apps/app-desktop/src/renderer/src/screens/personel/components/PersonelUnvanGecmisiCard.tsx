import React, { useState } from 'react'
import {
  Briefcase,
  Calendar,
  Clock,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Building,
  Award,
  FileText
} from 'lucide-react'
import { Personel, PersonelUnvanGecmisi, usePersonelUnvanGecmisi } from '../personel.hooks'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'

interface Props {
  personel: Personel
  canEdit?: boolean
}

export const PersonelUnvanGecmisiCard: React.FC<Props> = ({ personel, canEdit = true }) => {
  const { gecmisList, isLoading, addUnvanGecmisi, updateUnvanGecmisi, deleteUnvanGecmisi } =
    usePersonelUnvanGecmisi(personel.id)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<PersonelUnvanGecmisi | null>(null)
  const [formState, setFormState] = useState({
    unvan: '',
    gorev: '',
    birim: personel.birim || '',
    baslangic_tarihi: new Date().toISOString().split('T')[0],
    bitis_tarihi: '',
    is_current: true,
    dayanak_belge: '',
    aciklama: ''
  })

  const openAddModal = () => {
    setEditingItem(null)
    setFormState({
      unvan: personel.unvan || '',
      gorev: personel.gorev || '',
      birim: personel.birim || '',
      baslangic_tarihi: new Date().toISOString().split('T')[0],
      bitis_tarihi: '',
      is_current: true,
      dayanak_belge: '',
      aciklama: ''
    })
    setIsModalOpen(true)
  }

  const openEditModal = (item: PersonelUnvanGecmisi) => {
    setEditingItem(item)
    setFormState({
      unvan: item.unvan,
      gorev: item.gorev || '',
      birim: item.birim || '',
      baslangic_tarihi: item.baslangic_tarihi,
      bitis_tarihi: item.bitis_tarihi || '',
      is_current: !item.bitis_tarihi,
      dayanak_belge: item.dayanak_belge || '',
      aciklama: item.aciklama || ''
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formState.unvan.trim() || !formState.baslangic_tarihi) {
      alert('Lütfen kadro ünvanını ve başlangıç tarihini giriniz.')
      return
    }

    try {
      if (editingItem) {
        await updateUnvanGecmisi({
          id: editingItem.id,
          personel_id: personel.id,
          unvan: formState.unvan.trim(),
          gorev: formState.gorev.trim() || null,
          birim: formState.birim.trim() || null,
          baslangic_tarihi: formState.baslangic_tarihi,
          bitis_tarihi: formState.is_current ? null : formState.bitis_tarihi || null,
          aktif_mi: formState.is_current ? 1 : 0,
          dayanak_belge: formState.dayanak_belge.trim() || null,
          aciklama: formState.aciklama.trim() || null
        })
      } else {
        await addUnvanGecmisi({
          personel_id: personel.id,
          unvan: formState.unvan.trim(),
          gorev: formState.gorev.trim() || null,
          birim: formState.birim.trim() || null,
          baslangic_tarihi: formState.baslangic_tarihi,
          bitis_tarihi: formState.is_current ? null : formState.bitis_tarihi || null,
          aktif_mi: formState.is_current ? 1 : 0,
          dayanak_belge: formState.dayanak_belge.trim() || null,
          aciklama: formState.aciklama.trim() || null
        })
      }
      setIsModalOpen(false)
    } catch (err) {
      console.error(err)
      alert('Kayıt sırasında bir hata oluştu.')
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('Bu unvan geçmiş kaydını silmek istediğinize emin misiniz?')) {
      try {
        await deleteUnvanGecmisi(id)
      } catch (err) {
        console.error(err)
        alert('Silme sırasında bir hata oluştu.')
      }
    }
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
      {/* Kart Başlığı */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Kadro Ünvanı & Görev Tarihçesi
            </h3>
            <p className="text-[11px] text-slate-400">
              Personelin geçmişten günümüze unvan ve görev değişikliklerinin zaman çizelgesi
            </p>
          </div>
        </div>

        {canEdit && (
          <Button
            size="sm"
            onClick={openAddModal}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Dönem / Unvan Ekle
          </Button>
        )}
      </div>

      {/* Bilgilendirme Kutusu: Görev vs Ünvan Farkı */}
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-2 leading-relaxed">
        <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-800 dark:text-slate-200 font-semibold">
            Kadro Ünvanı ve Görev Ayrımı:
          </strong>{' '}
          <span className="font-medium text-slate-700 dark:text-slate-300">Kadro Ünvanı</span>{' '}
          personelin resmi mesleki ünvanıdır (örn. <em>Mühendis, Şube Müdürü, Tekniker</em>).{' '}
          <span className="font-medium text-slate-700 dark:text-slate-300">Görev</span> ise
          ihalelerde veya idari süreçlerdeki fonksiyonudur (örn.{' '}
          <em>Komisyon Başkanı, Harcama Yetkilisi, Taşınır Kayıt Yetkilisi</em>). Eski tarihli
          belgeler düzenlenirken personelin o tarihteki geçerli unvanı otomatik olarak buradan
          çözümlenir.
        </div>
      </div>

      {/* Zaman Çizelgesi (Timeline Listesi) */}
      {isLoading ? (
        <div className="py-6 text-center text-xs text-slate-400">Yükleniyor...</div>
      ) : gecmisList.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-950/30 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
          <Clock className="w-6 h-6 mx-auto text-slate-300 dark:text-slate-600" />
          <p>Henüz kayıtlı unvan geçmişi bulunmuyor.</p>
          {personel.unvan && (
            <p className="text-[11px] text-slate-500">
              Güncel unvanı: <strong>{personel.unvan}</strong>
            </p>
          )}
        </div>
      ) : (
        <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
          {gecmisList.map((item, index) => {
            const isCurrent = !item.bitis_tarihi || item.aktif_mi === 1
            return (
              <div
                key={item.id}
                className={`relative p-3.5 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 shadow-xs'
                    : 'bg-white dark:bg-slate-950/40 border-slate-200 dark:border-slate-800/80 hover:border-slate-300'
                }`}
              >
                {/* Sol Nokta */}
                <div
                  className={`absolute -left-6 top-4 w-3.5 h-3.5 rounded-full border-2 bg-white dark:bg-slate-900 transition-colors ${
                    isCurrent
                      ? 'border-emerald-500 ring-2 ring-emerald-200 dark:ring-emerald-900'
                      : 'border-slate-400 dark:border-slate-600'
                  }`}
                />

                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        {item.unvan}
                      </span>

                      {isCurrent ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Güncel / Halen Aktif
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium">
                          Geçmiş Dönem
                        </span>
                      )}

                      {item.gorev && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 font-medium">
                          Görev: {item.gorev}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {item.baslangic_tarihi} &rarr;{' '}
                        {item.bitis_tarihi ? item.bitis_tarihi : 'Devam Ediyor'}
                      </span>

                      {item.birim && (
                        <span className="flex items-center gap-1">
                          <Building className="w-3 h-3 text-slate-400" />
                          {item.birim}
                        </span>
                      )}

                      {item.dayanak_belge && (
                        <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-mono text-[10px]">
                          <FileText className="w-3 h-3 text-blue-500" />
                          {item.dayanak_belge}
                        </span>
                      )}
                    </div>

                    {item.aciklama && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 italic pt-1">
                        {item.aciklama}
                      </p>
                    )}
                  </div>

                  {canEdit && (
                    <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                        title="Dönemi Düzenle"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                        title="Dönemi Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Dönem Ekle / Düzenle Modalı */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {editingItem ? 'Unvan & Görev Dönemini Düzenle' : 'Yeni Unvan & Görev Dönemi Ekle'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Kadro Ünvanı <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  required
                  placeholder="Örn: Mühendis, Şube Müdürü, Tekniker, Memur"
                  value={formState.unvan}
                  onChange={(e) => setFormState({ ...formState, unvan: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    İdari / İhale Görevi
                  </label>
                  <Input
                    type="text"
                    placeholder="Örn: Komisyon Başkanı, Üye"
                    value={formState.gorev}
                    onChange={(e) => setFormState({ ...formState, gorev: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Birim / Müdürlük
                  </label>
                  <Input
                    type="text"
                    placeholder="Örn: Destek Hizmetleri"
                    value={formState.birim}
                    onChange={(e) => setFormState({ ...formState, birim: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Başlangıç Tarihi <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    required
                    value={formState.baslangic_tarihi}
                    onChange={(e) =>
                      setFormState({ ...formState, baslangic_tarihi: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Bitiş Tarihi
                  </label>
                  <Input
                    type="date"
                    disabled={formState.is_current}
                    value={formState.bitis_tarihi}
                    onChange={(e) => setFormState({ ...formState, bitis_tarihi: e.target.value })}
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none py-1">
                <input
                  type="checkbox"
                  checked={formState.is_current}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      is_current: e.target.checked,
                      bitis_tarihi: e.target.checked ? '' : formState.bitis_tarihi
                    })
                  }
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Halen bu unvanda görev yapıyor (Bitiş tarihi yok)
                </span>
              </label>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Dayanak Belge / Atama Kararı No
                </label>
                <Input
                  type="text"
                  placeholder="Örn: 2024/12 Atama Kararı, Sayı: 934.01-45"
                  value={formState.dayanak_belge}
                  onChange={(e) => setFormState({ ...formState, dayanak_belge: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Açıklama / Not
                </label>
                <textarea
                  rows={2}
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  placeholder="İsteğe bağlı ek not..."
                  value={formState.aciklama}
                  onChange={(e) => setFormState({ ...formState, aciklama: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
                  İptal
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                  {editingItem ? 'Güncelle' : 'Kaydet'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

import React, { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { Personel, PersonelWithRoles, Rol, usePersonelHooks } from './personel.hooks'
import { useBirimlerHooks } from '../birimler/birimler.hooks'
import { useKurumHooks } from '../kurum/kurum.hooks'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import {
  ArrowLeft,
  Briefcase,
  Building,
  Edit,
  FileText,
  HelpCircle,
  Mail,
  Phone,
  Plus,
  QrCode,
  Save,
  Shield,
  Sparkles,
  Trash2,
  UserCheck,
  Users,
  X
} from 'lucide-react'

import { DataViewMode, ViewToggle } from '../../components/ui/ViewToggle'
import { ExcelActions } from '../../components/ui/ExcelActions'

type ScreenState = 'list' | 'view' | 'form'

export default function PersonelScreen({
  isSubComponent = false
}: {
  isSubComponent?: boolean
}): React.ReactNode {
  const {
    personelList,
    rollerList,
    isLoading: isPersonelLoading,
    addPersonel,
    updatePersonel,
    deletePersonel
  } = usePersonelHooks()
  const { birimler } = useBirimlerHooks()
  const { kurumData, fetchKurum } = useKurumHooks()

  useEffect(() => {
    fetchKurum()
  }, [fetchKurum])

  const [screenState, setScreenState] = useState<ScreenState>('list')
  const [dataViewMode, setDataViewMode] = useState<DataViewMode>('grid')
  const [editingPersonel, setEditingPersonel] = useState<Personel | null>(null)
  const [viewingPersonel, setViewingPersonel] = useState<Personel | null>(null)
  const [vcardQrUrl, setVcardQrUrl] = useState<string | null>(null)

  useEffect(() => {
    if (viewingPersonel) {
      const vcard = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${viewingPersonel.ad_soyad}`,
        viewingPersonel.unvan ? `TITLE:${viewingPersonel.unvan}` : '',
        viewingPersonel.birim ? `ORG:${viewingPersonel.birim}` : '',
        viewingPersonel.telefon ? `TEL;TYPE=CELL:${viewingPersonel.telefon}` : '',
        viewingPersonel.eposta ? `EMAIL;TYPE=PREF,INTERNET:${viewingPersonel.eposta}` : '',
        'END:VCARD'
      ]
        .filter(Boolean)
        .join('\n')

      QRCode.toDataURL(vcard, {
        margin: 2,
        width: 250,
        color: {
          dark: '#1e293b', // slate-800
          light: '#ffffff'
        }
      })
        .then((url) => setVcardQrUrl(url))
        .catch(console.error)
    } else {
      setTimeout(() => {
        setVcardQrUrl(null)
      }, 0)
    }
  }, [viewingPersonel])

  const [formData, setFormData] = useState<PersonelWithRoles>({
    ad_soyad: '',
    unvan: '',
    sicil_no: '',
    birim: '',
    telefon: '',
    eposta: '',
    aktif_mi: 1,
    assignedRoles: [],
    avatar: null
  })

  const openForm = (e?: React.MouseEvent, personel?: Personel): void => {
    if (e) e.stopPropagation()
    if (personel) {
      setEditingPersonel(personel)
      const rolesForPersonel = rollerList
        .filter((r) => r.varsayilan_personel_id === personel.id)
        .map((r) => r.rol_kodu)
      setFormData({ ...personel, assignedRoles: rolesForPersonel })
    } else {
      setEditingPersonel(null)
      setFormData({
        ad_soyad: '',
        unvan: '',
        sicil_no: '',
        birim: '',
        telefon: '',
        eposta: '',
        aktif_mi: 1,
        assignedRoles: [],
        avatar: null
      })
    }
    setScreenState('form')
  }

  const closeForm = (): void => {
    setScreenState('list')
    setEditingPersonel(null)
  }

  const handleViewClick = (personel: Personel) => {
    setViewingPersonel(personel)
    setScreenState('view')
  }

  const closeView = () => {
    setViewingPersonel(null)
    setScreenState('list')
  }

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    try {
      if (editingPersonel) {
        await updatePersonel({ ...formData, id: editingPersonel.id })
      } else {
        await addPersonel(formData)
      }
      closeForm()
    } catch (err) {
      console.error(err)
      alert('Kayıt sırasında bir hata oluştu!')
    }
  }

  const handleDelete = async (e: React.MouseEvent, id: number): Promise<void> => {
    e.stopPropagation()
    if (confirm('Bu personeli silmek istediğinize emin misiniz?')) {
      try {
        await deletePersonel(id)
      } catch (err) {
        console.error(err)
        alert('Silme sırasında bir hata oluştu!')
      }
    }
  }

  const toggleRole = (rol_kodu: string, isChecked: boolean) => {
    setFormData((prev) => {
      let roles = prev.assignedRoles || []
      if (isChecked) {
        if (rol_kodu === 'harcama_yetkilisi') {
          roles = [...roles, 'harcama_yetkilisi', 'ihale_yetkilisi']
        } else {
          roles = [...roles, rol_kodu]
        }
        // Deduplicate
        roles = Array.from(new Set(roles))
      } else {
        roles = roles.filter((r) => r !== rol_kodu)
      }
      return { ...prev, assignedRoles: roles }
    })
  }

  if (screenState === 'view' && viewingPersonel) {
    const rolesOfViewingPerson = rollerList.filter(
      (r) => r.varsayilan_personel_id === viewingPersonel.id
    )

    return (
      <div className="p-8 max-w-[1600px] mx-auto flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto max-h-full">
        {/* Üst Kısım */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <Button
            variant="ghost"
            onClick={closeView}
            className="w-fit text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 pl-0 hover:bg-transparent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Personel Listesine Dön
          </Button>

          <Button
            onClick={(e) => openForm(e, viewingPersonel)}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-md w-full sm:w-auto flex items-center justify-center"
          >
            <Edit className="w-4 h-4 mr-2" />
            Personeli Düzenle
          </Button>
        </div>

        {/* 3 Sütunlu Izgara Yapısı (Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sol Kolon: Profil Özeti ve QR Kartı */}
          <div className="flex flex-col gap-6">
            {/* Profil Bilgisi Kartı */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full overflow-hidden shrink-0 border-4 border-slate-100 dark:border-slate-800 shadow-md mb-4">
                {viewingPersonel.avatar ? (
                  <img
                    src={viewingPersonel.avatar}
                    alt={viewingPersonel.ad_soyad}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-3xl uppercase">
                    {viewingPersonel.ad_soyad.slice(0, 2)}
                  </div>
                )}
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1 leading-snug">
                {viewingPersonel.ad_soyad}
              </h2>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5 justify-center">
                <Briefcase className="w-4 h-4 shrink-0 text-slate-400" />
                {viewingPersonel.unvan || 'Unvan Belirtilmedi'}
              </p>
              {viewingPersonel.birim && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 dark:bg-slate-950/40 text-xs font-semibold rounded-full border border-slate-150 dark:border-slate-850 text-slate-600 dark:text-slate-350">
                  <Building className="w-3.5 h-3.5" />
                  {viewingPersonel.birim}
                </span>
              )}
            </div>

            {/* QR Kartı */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900 dark:to-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-blue-500" />
                Kişi Kartı (vCard)
              </h3>
              {vcardQrUrl ? (
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 mb-3 animate-in zoom-in-95 duration-300">
                  <img src={vcardQrUrl} alt="vCard QR Code" className="w-44 h-44 object-contain" />
                </div>
              ) : (
                <div className="w-44 h-44 bg-slate-100 dark:bg-slate-950 rounded-2xl flex items-center justify-center animate-pulse mb-3">
                  <span className="text-[10px] text-slate-400">Yükleniyor...</span>
                </div>
              )}
              <p className="text-[10px] text-slate-450 dark:text-slate-400 leading-relaxed font-medium max-w-[220px]">
                Telefonunuzun kamerasından bu karekodu okutarak personeli rehbere
                <strong>anında kaydedebilirsiniz.</strong>
              </p>
            </div>
          </div>

          {/* Sağ Kolon: Detaylı Bilgiler ve Yetkiler */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Detay Kartı */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <FileText className="w-4 h-4 text-blue-500" />
                İletişim ve Kurum Bilgileri
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-850 rounded-2xl flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Telefon Numarası
                  </span>
                  {viewingPersonel.telefon ? (
                    <a
                      href={`tel:${viewingPersonel.telefon}`}
                      className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5 mt-0.5"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      {viewingPersonel.telefon}
                    </a>
                  ) : (
                    <span className="text-sm text-slate-400 dark:text-slate-600 italic">
                      Telefon Belirtilmedi
                    </span>
                  )}
                </div>

                <div className="p-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-850 rounded-2xl flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    E-Posta Adresi
                  </span>
                  {viewingPersonel.eposta ? (
                    <a
                      href={`mailto:${viewingPersonel.eposta}`}
                      className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5 mt-0.5 truncate"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      {viewingPersonel.eposta}
                    </a>
                  ) : (
                    <span className="text-sm text-slate-400 dark:text-slate-600 italic">
                      E-Posta Belirtilmedi
                    </span>
                  )}
                </div>

                <div className="p-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-850 rounded-2xl flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Kurum Sicil Numarası
                  </span>
                  <span className="text-sm font-mono font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                    {viewingPersonel.sicil_no || '-'}
                  </span>
                </div>

                <div className="p-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-850 rounded-2xl flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Birim / Müdürlük
                  </span>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                    {viewingPersonel.birim || '-'}
                  </span>
                </div>
              </div>

              {viewingPersonel.notlar && (
                <div className="p-4 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/10 dark:border-amber-500/20 rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Personel Hakkında Notlar
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {viewingPersonel.notlar}
                  </p>
                </div>
              )}
            </div>

            {/* Yetkiler Kartı */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <Shield className="w-4 h-4 text-blue-500" />
                Atanmış Varsayılan İmza Yetkileri
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {rolesOfViewingPerson.length > 0 ? (
                  rolesOfViewingPerson.map((role) => (
                    <div
                      key={role.rol_kodu}
                      className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40 rounded-2xl hover:border-blue-300 transition-colors"
                    >
                      <UserCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="block text-sm font-bold text-blue-700 dark:text-blue-305">
                          {role.rol_adi}
                        </span>
                        <span className="block text-[11px] text-blue-600/70 dark:text-blue-450/70 leading-relaxed mt-0.5">
                          {role.aciklama}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full p-6 text-center text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-950/40 rounded-2xl italic border border-slate-100 dark:border-slate-850">
                    Bu personelin varsayılan olarak atandığı bir rol bulunmuyor.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (screenState === 'form') {
    return (
      <form
        onSubmit={handleSubmit}
        className="p-8 max-w-[1600px] mx-auto flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto max-h-full"
      >
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={closeForm}
              className="w-fit text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Listeye Geri Dön
            </Button>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              {editingPersonel ? (
                <Edit className="w-6 h-6 text-blue-500" />
              ) : (
                <Plus className="w-6 h-6 text-blue-500" />
              )}
              {editingPersonel ? 'Personel Düzenle' : 'Yeni Personel Ekle'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              className="px-6 py-2 h-10 text-sm"
              onClick={closeForm}
            >
              <X className="w-4 h-4 mr-2" /> İptal
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 shadow-md px-8 py-2 h-10 text-sm flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />{' '}
              {editingPersonel ? 'Değişiklikleri Kaydet' : 'Personeli Ekle'}
            </Button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm space-y-8">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start bg-slate-50/50 dark:bg-slate-950/20 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
              {/* Avatar Yükleme */}
              <div className="flex flex-col items-center gap-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 text-center">
                  Profil Resmi
                </label>
                <div className="relative group w-24 h-24 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-850 border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center cursor-pointer shadow-inner hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                  {formData.avatar ? (
                    <img
                      src={formData.avatar}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Users className="w-10 h-10 text-slate-400 dark:text-slate-600" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onloadend = () => {
                          setFormData({
                            ...formData,
                            avatar: reader.result as string
                          })
                        }
                        reader.readAsDataURL(file)
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <span className="text-[10px] text-white font-semibold">Resim Seç</span>
                  </div>
                </div>
                {formData.avatar && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, avatar: null })}
                    className="text-[10px] text-rose-500 hover:text-rose-600 hover:underline cursor-pointer font-semibold"
                  >
                    Resmi Kaldır
                  </button>
                )}
              </div>

              {/* Ad Soyad Girişi */}
              <div className="flex-1 w-full space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Ad Soyad *
                </label>
                <Input
                  required
                  autoFocus
                  placeholder="Örn: Ahmet Yılmaz"
                  value={formData.ad_soyad}
                  onChange={(e) => setFormData({ ...formData, ad_soyad: e.target.value })}
                  className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-sm py-2 h-11"
                />
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  Personelin adı ve soyadı resmi belgelerde bu şekilde görüntülenecektir.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Unvan / Görevi
                </label>
                <Input
                  placeholder="Örn: İnşaat Mühendisi"
                  value={formData.unvan || ''}
                  onChange={(e) => setFormData({ ...formData, unvan: e.target.value })}
                  className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-sm py-2 h-11"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                  Kurum Sicil No
                  <span className="text-[11px] text-slate-400 font-normal">(İsteğe Bağlı)</span>
                  <span title="Personelin kurum içi sicil numarası">
                    <HelpCircle className="w-4 h-4 text-blue-500 cursor-help ml-auto" />
                  </span>
                </label>
                <Input
                  placeholder="Örn: 12345"
                  value={formData.sicil_no || ''}
                  onChange={(e) => setFormData({ ...formData, sicil_no: e.target.value })}
                  className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-sm py-2 h-11"
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Birim / Müdürlük
              </label>
              <Input
                list="birimler-list"
                placeholder="-- Birim Seçin veya Arayın --"
                value={formData.birim || ''}
                onChange={(e) => setFormData({ ...formData, birim: e.target.value })}
                className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-sm py-2 h-11"
              />
              <datalist id="birimler-list">
                {kurumData?.kurum_adi && <option value={kurumData.kurum_adi} />}
                {birimler.map((b) => (
                  <option key={b.id} value={b.birim_adi} />
                ))}
              </datalist>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Telefon
                </label>
                <Input
                  placeholder="Örn: 0555..."
                  value={formData.telefon || ''}
                  onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                  className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-sm py-2 h-11"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  E-Posta
                </label>
                <Input
                  type="email"
                  placeholder="Örn: ornek@kurum.gov.tr"
                  value={formData.eposta || ''}
                  onChange={(e) => setFormData({ ...formData, eposta: e.target.value })}
                  className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-sm py-2 h-11"
                />
              </div>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col gap-4 mt-8">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-500" /> Şablonlarda Varsayılan Görev
                (Yetkilendirme)
              </h4>
              <p className="text-xs text-slate-500">
                Seçtiğiniz roller, yeni oluşturulan belgelerde bu personel adıyla otomatik
                doldurulacaktır.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                {rollerList.map((rol) => (
                  <label
                    key={rol.rol_kodu}
                    className="flex items-start gap-3 p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:border-blue-400 dark:hover:border-blue-800 transition-colors group"
                  >
                    <input
                      type="checkbox"
                      className="w-5 h-5 mt-0.5 text-blue-600 rounded border-slate-300 dark:border-slate-700 bg-transparent cursor-pointer"
                      checked={formData.assignedRoles?.includes(rol.rol_kodu)}
                      onChange={(e) => toggleRole(rol.rol_kodu, e.target.checked)}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {rol.rol_adi}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                        {rol.aciklama}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </form>
    )
  }

  return (
    <div
      className={
        isSubComponent
          ? 'flex flex-col gap-6 w-full animate-in fade-in duration-200'
          : 'p-8 max-w-[1600px] mx-auto flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto max-h-full'
      }
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 text-slate-855 dark:text-slate-100">
            <Users className="w-8 h-8 text-blue-600" />
            Personel Yönetimi
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Kurum personelini buradan ekleyebilir ve yetkilerini belirleyebilirsiniz.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ExcelActions
            tableName="TANIM_Personel"
            title="Personeller"
            uniqueCol="id"
          />
          <ViewToggle viewMode={dataViewMode} onChange={setDataViewMode} />
          <Button
            onClick={(e) => openForm(e)}
            className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-md flex items-center px-4 py-2 text-sm shrink-0"
          >
            <Plus className="w-4 h-4" /> Yeni Personel Ekle
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col flex-1 overflow-hidden min-h-[400px]">
        <div className="flex-1 overflow-auto p-4">
          {isPersonelLoading ? (
            <div className="p-8 text-center text-slate-450 dark:text-slate-500 animate-pulse italic">
              Yükleniyor...
            </div>
          ) : personelList.length === 0 ? (
            <div className="p-16 flex flex-col items-center justify-center text-slate-450 bg-slate-50 dark:bg-slate-950 rounded-xl">
              <Users className="w-12 h-12 mb-3 text-slate-300 dark:text-slate-700" />
              <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">
                Henüz Personel Eklenmemiş
              </h3>
              <p className="text-xs mt-1 text-slate-500">
                Süreçlerde görev alacak personeli hemen eklemeye başlayın.
              </p>
            </div>
          ) : dataViewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {personelList.map((p) => {
                const assignedRoles = rollerList.filter((r) => r.varsayilan_personel_id === p.id)

                return (
                  <div
                    key={p.id}
                    onClick={() => handleViewClick(p)}
                    className="flex flex-col p-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-850 rounded-xl hover:border-blue-300 dark:hover:border-blue-800 transition-colors group relative cursor-pointer"
                  >
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        title="Düzenle"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => openForm(e, p)}
                        className="h-7 w-7 p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        title="Sil"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDelete(e, p.id)}
                        className="h-7 w-7 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/15"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-3 mb-3 pr-12">
                      <div className="w-10 h-10 shrink-0 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
                        {p.avatar ? (
                          <img
                            src={p.avatar}
                            alt={p.ad_soyad}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm uppercase">
                            {p.ad_soyad.slice(0, 2)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate">
                          {p.ad_soyad}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {p.unvan || 'Unvan Belirtilmedi'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400 mb-4 flex-1">
                      {p.birim && <div className="truncate">🏢 {p.birim}</div>}
                      {p.sicil_no && <div className="truncate">📋 Sicil No: {p.sicil_no}</div>}
                      {p.telefon && <div>📞 {p.telefon}</div>}
                      {p.eposta && <div className="truncate">✉️ {p.eposta}</div>}
                    </div>

                    <div className="flex flex-wrap gap-1 mt-auto border-t border-slate-200/60 dark:border-slate-800/60 pt-3">
                      {assignedRoles.length > 0 ? (
                        assignedRoles.map((role) => (
                          <span
                            key={role.rol_kodu}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50"
                          >
                            <Shield className="w-3 h-3" /> {role.rol_adi}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Özel yetki yok</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : dataViewMode === 'list' ? (
            <div className="flex flex-col gap-3">
              {personelList.map((p) => {
                const assignedRoles = rollerList.filter((r) => r.varsayilan_personel_id === p.id)
                return (
                  <div
                    key={p.id}
                    onClick={() => handleViewClick(p)}
                    className="flex items-center p-3 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-850 rounded-xl hover:border-blue-300 dark:hover:border-blue-800 transition-colors group relative cursor-pointer"
                  >
                    <div className="flex flex-col sm:flex-row flex-1 gap-3 sm:items-center pr-16">
                      <div className="w-10 h-10 shrink-0 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
                        {p.avatar ? (
                          <img
                            src={p.avatar}
                            alt={p.ad_soyad}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm uppercase">
                            {p.ad_soyad.slice(0, 2)}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-[200px]">
                        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate">
                          {p.ad_soyad}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {p.unvan || 'Unvan Belirtilmedi'}
                        </p>
                      </div>

                      <div className="flex-1 min-w-[150px] text-[11px] text-slate-500 dark:text-slate-400">
                        {p.birim && <div className="truncate">🏢 {p.birim}</div>}
                        {p.telefon && <div>📞 {p.telefon}</div>}
                      </div>

                      <div className="flex flex-wrap gap-1 min-w-[150px] justify-end">
                        {assignedRoles.length > 0 ? (
                          assignedRoles.map((role) => (
                            <span
                              key={role.rol_kodu}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50"
                            >
                              <Shield className="w-3 h-3" /> {role.rol_adi}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Yetki yok</span>
                        )}
                      </div>
                    </div>

                    <div className="absolute right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-50/90 dark:bg-slate-950/90 p-1 rounded-lg backdrop-blur-sm">
                      <Button
                        title="Düzenle"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => openForm(e, p)}
                        className="h-7 w-7 p-0 text-slate-400 hover:text-blue-600"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        title="Sil"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDelete(e, p.id)}
                        className="h-7 w-7 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/15"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Ad Soyad</th>
                    <th className="px-4 py-3">Unvan</th>
                    <th className="px-4 py-3">Birim</th>
                    <th className="px-4 py-3">Telefon</th>
                    <th className="px-4 py-3 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {personelList.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => handleViewClick(p)}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors group cursor-pointer"
                    >
                      <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                        {p.ad_soyad}
                      </td>
                      <td className="px-4 py-3">{p.unvan || '-'}</td>
                      <td className="px-4 py-3">{p.birim || '-'}</td>
                      <td className="px-4 py-3">{p.telefon || '-'}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => openForm(e, p)}
                            className="h-7 w-7 p-0 text-slate-400 hover:text-blue-600"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleDelete(e, p.id)}
                            className="h-7 w-7 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/15"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

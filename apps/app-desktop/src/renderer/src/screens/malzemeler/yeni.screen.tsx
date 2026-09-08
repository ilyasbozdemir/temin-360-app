import React, { useState, useEffect, useRef } from 'react'
import {
  ArrowLeft,
  Save,
  Search,
  PackageSearch,
  Barcode,
  Database,
  Activity,
  Edit2,
  Bot,
  Loader2,
  PlusCircle,
  Image as ImageIcon,
  Trash2,
  Upload,
  Layers,
  Calendar,
  Building2,
  Briefcase,
  Sparkles,
  CheckCircle2
} from 'lucide-react'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { useMalzemelerHooks, Kalem } from './malzemeler.hooks'
import { useOlcuBirimleri, BIRIM_KATEGORILERI } from '../olcubirimleri/olcubirimleri.hooks'
import { useOkasKodHooks } from '../okaskod/okaskod.hooks'
import { useTasinirKodHooks } from '../tasinirkod/tasinirkod.hooks'
import { cn } from '../../utils/cn'

const HIZMET_SINIFLARI = [
  'Temizlik Hizmetleri',
  'Özel Güvenlik Hizmetleri',
  'Personel Çalıştırma / Destek Hizmetleri',
  'Danışmanlık ve Müşavirlik',
  'Yazılım, Bilişim ve Donanım Bakım',
  'Araç Kiralama ve Taşıma',
  'Yemek ve Organizasyon',
  'Bakım, Onarım ve Teknik Servis',
  'Sigorta ve Ekspertiz',
  'Diğer Hizmet Alımları'
]

const YAPI_SINIFLARI = [
  'I-A / I-B (Geçici Yapılar, Basit Depolar)',
  'II-A / II-B (Küçük Sanayi, Hangarlar)',
  'III-A / III-B (Okullar, İdari Binalar, Konutlar)',
  'IV-A / IV-B / IV-C (Hastaneler, Büyük Kamu Binaları)',
  'V-A / V-B / V-C / V-D (Kompleks Tesisler, Üniversiteler)',
  'İnşaat İmalatları',
  'Mekanik Tesisat',
  'Elektrik Tesisatı',
  'Peyzaj ve Çevre Düzenleme',
  'Altyapı ve Yol İşleri'
]

export default function YeniMalzemeScreen(): React.JSX.Element {
  const search: any = useSearch({ strict: false })
  const editId = search?.id ? Number(search.id) : null

  const navigate = useNavigate()
  const { addKalem, updateKalem, kalemList } = useMalzemelerHooks()
  const { data: birimler = [] } = useOlcuBirimleri()
  const { okasKodList, isLoading: isOkasLoading } = useOkasKodHooks()
  const { tasinirKodList, isLoading: isTasinirLoading } = useTasinirKodHooks()

  const generateBarcode = () =>
    Math.floor(1000000000000 + Math.random() * 9000000000000).toString()

  // Form State
  const [formData, setFormData] = useState<Partial<Kalem>>(() => ({
    tipi: 'Mal',
    birim: 'Adet',
    mensei: 'Yerli',
    kdv_orani: 20,
    aktif_mi: 1,
    personel_asgari_fark_oran: 0,
    fiyat_donemi: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
    poz_yili: new Date().getFullYear(),
    barkod_id: generateBarcode()
  }))

  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    document.title = editId
      ? 'Mal/Hizmet/Yapım İşi Düzenle - DT'
      : 'Mal/Hizmet/Yapım İşi Ekle - DT'
    if (editId && kalemList.length > 0) {
      const existing = kalemList.find((k) => k.id === editId)
      if (existing) {
        setFormData({
          ...existing,
          tipi: existing.tipi?.startsWith('Hizmet')
            ? 'Hizmet'
            : existing.tipi === 'Yapım'
              ? 'Yapım'
              : 'Mal'
        })
      }
    }
  }, [editId, kalemList])

  const [isOkasModalOpen, setIsOkasModalOpen] = useState(false)
  const [isTasinirModalOpen, setIsTasinirModalOpen] = useState(false)

  const [isEditingBarkod, setIsEditingBarkod] = useState(false)
  const [barkodError, setBarkodError] = useState('')

  const checkBarkod = async (barkod: string) => {
    if (!barkod) return
    try {
      const res = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT id FROM TANIM_Kalem WHERE barkod_id = ? AND id != ?',
        [barkod, editId || 0]
      )
      if (res.success && res.data && res.data.length > 0) {
        setBarkodError('Bu Barkod / ID sistemde zaten kayıtlı!')
      } else {
        setBarkodError('')
      }
    } catch (error) {
      console.error(error)
    }
  }

  const [okasSearch, setOkasSearch] = useState('')
  const [tasinirSearch, setTasinirSearch] = useState('')

  const filteredOkas = okasKodList
    .filter(
      (k) =>
        k.kod.includes(okasSearch) ||
        (k.aciklama || '').toLowerCase().includes(okasSearch.toLowerCase())
    )
    .slice(0, 50)

  const filteredTasinir = tasinirKodList
    .filter(
      (k) =>
        k.tam_kod.includes(tasinirSearch) ||
        (k.aciklama || '').toLowerCase().includes(tasinirSearch.toLowerCase())
    )
    .slice(0, 50)

  const [isAiGeneratingOkas, setIsAiGeneratingOkas] = useState(false)

  const handleAiOkasSuggest = async () => {
    if (!formData.kalem_adi) {
      alert('Lütfen önce Mal/Hizmet/Yapım Adı alanını doldurunuz.')
      return
    }

    setIsAiGeneratingOkas(true)
    try {
      const prompt = `Aşağıdaki malzeme/hizmet/yapım işi için en uygun OKAS (Ortak Kamu Alımları Sözlüğü) kodunu ve kısa bir açıklamasını öner. Yalnızca şu formatta cevap ver: "KOD: AÇIKLAMA". Örnek: "15010101: A4 Kağıt". Tanım: ${formData.kalem_adi}`
      const res = await window.api.aiGenerate({ prompt })

      if (res.success && res.data) {
        const text = res.data.trim()
        const codeMatch = text.match(/^([\d.]+)/)
        if (codeMatch && codeMatch[1]) {
          setFormData({ ...formData, okas_kodu: codeMatch[1] })
          alert(`Yapay Zeka Önerisi:\n\n${text}`)
        } else {
          alert(`Yapay Zeka Önerisi:\n\n${text}\n\nLütfen listeden doğrulayarak seçin.`)
        }
      } else {
        alert('AI Hatası: ' + (res.error || 'Bilinmeyen hata'))
      }
    } catch (err: any) {
      alert('AI İsteği sırasında hata oluştu: ' + err.message)
    } finally {
      setIsAiGeneratingOkas(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      alert('Görsel boyutu en fazla 2 MB olmalıdır.')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target?.result as string
      setFormData((prev) => ({ ...prev, gorsel_url: base64 }))
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async (stayOpen: boolean = false) => {
    if (!formData.kalem_adi || !formData.barkod_id) {
      alert('Lütfen zorunlu alanları (Adı, Kodu/Barkodu) doldurunuz.')
      return
    }

    if (barkodError && !editId) {
      alert('Barkod hatasını düzeltmeden kaydedemezsiniz!')
      return
    }

    setIsSaving(true)
    try {
      const dataToSave = {
        ...formData,
        tipi:
          formData.tipi === 'Hizmet'
            ? formData.is_personel
              ? 'Hizmet, Personel'
              : 'Hizmet, Diğer'
            : formData.tipi || 'Mal',
        birim: formData.olcu_birimi || formData.birim || 'Adet'
      }

      if (editId) {
        await updateKalem({ ...dataToSave, id: editId } as any)
        setToastMessage('Kayıt başarıyla güncellendi!')
      } else {
        await addKalem(dataToSave)
        setToastMessage('Yeni kalem başarıyla kaydedildi!')
      }

      if (stayOpen) {
        // Reset form for next entry
        setFormData({
          tipi: formData.tipi || 'Mal',
          birim: 'Adet',
          mensei: 'Yerli',
          kdv_orani: 20,
          aktif_mi: 1,
          personel_asgari_fark_oran: 0,
          fiyat_donemi: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
          poz_yili: new Date().getFullYear(),
          barkod_id: generateBarcode()
        })
        if (editId) {
          navigate({ to: '/malzemeler/yeni' } as any)
        }
        setTimeout(() => setToastMessage(null), 4000)
      } else {
        navigate({ to: '/malzemeler' })
      }
    } catch (err: any) {
      alert('Kaydedilirken hata oluştu: ' + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const selectedType = formData.tipi === 'Yapım' ? 'Yapım' : formData.tipi === 'Hizmet' ? 'Hizmet' : 'Mal'

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/50 dark:bg-slate-900/50 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in slide-in-from-top-3">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex-none p-4 md:p-6 pb-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 max-w-[1600px] mx-auto">
          <div className="flex items-center gap-4">
            <Link
              to="/malzemeler"
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-850 dark:text-white flex items-center gap-2.5">
                <PackageSearch className="text-blue-600 dark:text-blue-400" size={26} />
                {editId ? 'Kaydı Düzenle' : 'Yeni Kayıt'} (Mal / Hizmet / Yapım İşi)
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Yaklaşık maliyet ve teklif süreçleri için doğrudan temin kalemi tanımlayın
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => navigate({ to: '/malzemeler' })}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              İptal
            </button>

            {!editId && (
              <button
                onClick={() => handleSave(true)}
                disabled={isSaving}
                className="px-4 py-2 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all flex items-center gap-1.5 shadow-sm"
                title="Kaydeder ve hemen ardından yeni bir kalem eklemek için formu açık tutar"
              >
                <PlusCircle size={15} />
                Kaydet & Yeni Ekle
              </button>
            )}

            <button
              onClick={() => handleSave(false)}
              disabled={isSaving}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md flex items-center gap-1.5"
            >
              {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              {editId ? 'Değişiklikleri Kaydet' : 'Kaydet ve Kapat'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Form Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-[1600px] mx-auto space-y-6">
          {/* TÜR SEÇİMİ (Ana Dallanma) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              Kalem Türü (Alım Türü)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, tipi: 'Mal', is_personel: 0 })}
                className={cn(
                  'flex items-center gap-3.5 p-4 rounded-xl border-2 transition-all text-left cursor-pointer',
                  selectedType === 'Mal'
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-200 shadow-sm ring-1 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950/20 text-slate-700 dark:text-slate-300'
                )}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center font-bold text-base shrink-0',
                    selectedType === 'Mal'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  )}
                >
                  <PackageSearch className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm">Mal Alımı</div>
                  <div className="text-[11px] opacity-75 mt-0.5">
                    Kırtasiye, Sarf, Cihaz, Taşınır Kodlu Ürünler
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, tipi: 'Hizmet' })}
                className={cn(
                  'flex items-center gap-3.5 p-4 rounded-xl border-2 transition-all text-left cursor-pointer',
                  selectedType === 'Hizmet'
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-900 dark:text-indigo-200 shadow-sm ring-1 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950/20 text-slate-700 dark:text-slate-300'
                )}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center font-bold text-base shrink-0',
                    selectedType === 'Hizmet'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  )}
                >
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm">Hizmet Alımı</div>
                  <div className="text-[11px] opacity-75 mt-0.5">
                    Temizlik, Güvenlik, Danışmanlık, Bakım & Personel
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, tipi: 'Yapım', is_personel: 0 })}
                className={cn(
                  'flex items-center gap-3.5 p-4 rounded-xl border-2 transition-all text-left cursor-pointer',
                  selectedType === 'Yapım'
                    ? 'border-amber-600 bg-amber-50/50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200 shadow-sm ring-1 ring-amber-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950/20 text-slate-700 dark:text-slate-300'
                )}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center font-bold text-base shrink-0',
                    selectedType === 'Yapım'
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  )}
                >
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm">Yapım İşi</div>
                  <div className="text-[11px] opacity-75 mt-0.5">
                    Bakanlık Poz No, Onarım, Tadilat, Tesisat & İnşaat
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* KİMLİK & TEMEL BİLGİLER */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Barcode className="text-blue-600 dark:text-blue-400" size={20} />
                <h2 className="text-base font-bold text-slate-800 dark:text-white">
                  Kimlik & Sınıflandırma
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {selectedType === 'Mal'
                    ? '📦 Mal Kalemi'
                    : selectedType === 'Hizmet'
                      ? '💼 Hizmet Kalemi'
                      : '🏗️ Yapım Kalemi'}
                </span>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sol Sütun: Barkod, Ad, Fiyat Dönemi */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                    Barkod / Benzersiz ID <span className="text-red-500">*</span>
                  </label>
                  {!isEditingBarkod ? (
                    <div
                      onClick={() => setIsEditingBarkod(true)}
                      className="cursor-pointer group flex items-center justify-between px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-blue-400 transition-colors"
                      title="Değiştirmek için tıklayın"
                    >
                      <span
                        className={`font-mono text-base tracking-wider ${
                          barkodError
                            ? 'text-red-600 font-bold'
                            : 'text-slate-800 dark:text-slate-200 font-bold'
                        }`}
                      >
                        {formData.barkod_id}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          <Edit2 size={12} /> Düzenle
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setFormData((prev) => ({ ...prev, barkod_id: generateBarcode() }))
                            setBarkodError('')
                          }}
                          className="text-[10px] bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                        >
                          Yeni Üret
                        </button>
                      </div>
                    </div>
                  ) : (
                    <input
                      type="text"
                      autoFocus
                      value={formData.barkod_id || ''}
                      onChange={(e) => {
                        setFormData({ ...formData, barkod_id: e.target.value })
                        setBarkodError('')
                      }}
                      onBlur={(e) => {
                        setIsEditingBarkod(false)
                        checkBarkod(e.target.value)
                      }}
                      className={`w-full px-3.5 py-2 bg-white dark:bg-slate-950 border ${
                        barkodError ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'
                      } rounded-xl text-slate-900 dark:text-white font-mono text-base tracking-wider font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
                    />
                  )}
                  {barkodError ? (
                    <p className="text-xs text-red-500 mt-1 font-medium">{barkodError}</p>
                  ) : (
                    <p className="text-[11px] text-slate-400 mt-1">
                      Doğrudan temin ve teklif fişlerinde bu tekil numarayla takip edilir.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                    {selectedType === 'Mal'
                      ? 'Mal / Malzeme Adı'
                      : selectedType === 'Hizmet'
                        ? 'Hizmet İşinin Adı / Tanımı'
                        : 'Yapım İşi / İmalat Adı'}{' '}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.kalem_adi || ''}
                    onChange={(e) => setFormData({ ...formData, kalem_adi: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={
                      selectedType === 'Mal'
                        ? 'Örn: A4 Fotokopi Kağıdı 80gr 500lü Paket'
                        : selectedType === 'Hizmet'
                          ? 'Örn: Hizmet Binası 12 Aylık Genel Temizlik Hizmeti'
                          : 'Örn: Hizmet Binası Çatı İzolasyon ve Çinko Dere Onarımı'
                    }
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Fiyat Araştırma Dönemi
                    </label>
                    <input
                      type="text"
                      value={formData.fiyat_donemi || ''}
                      onChange={(e) => setFormData({ ...formData, fiyat_donemi: e.target.value })}
                      placeholder="Örn: 2026-08 veya 2026/8"
                      className="w-full px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-200"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      KİK piyasa araştırması güncellik kontrolü için
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                      KDV Oranı (%)
                    </label>
                    <div className="flex gap-1.5">
                      {[0, 1, 10, 20].map((rate) => (
                        <button
                          key={rate}
                          type="button"
                          onClick={() => setFormData({ ...formData, kdv_orani: rate })}
                          className={cn(
                            'flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors',
                            formData.kdv_orani === rate
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                          )}
                        >
                          %{rate}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sağ Sütun: Tür Bazlı Kodlar & AI */}
              <div className="space-y-4">
                {selectedType === 'Mal' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                        Taşınır Kodu (MKYS 150.xx...)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.tasinir_kodu || ''}
                          onChange={(e) =>
                            setFormData({ ...formData, tasinir_kodu: e.target.value })
                          }
                          className="w-full px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                          placeholder="Örn: 150.01.01.01"
                        />
                        <button
                          type="button"
                          onClick={() => setIsTasinirModalOpen(true)}
                          className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 transition-colors flex items-center gap-1.5 shrink-0 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                        >
                          <Search size={14} />
                          Listeden Seç
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                        OKAS Kodu
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.okas_kodu || ''}
                          onChange={(e) => setFormData({ ...formData, okas_kodu: e.target.value })}
                          className="w-full px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                          placeholder="Örn: 30192700"
                        />
                        <button
                          type="button"
                          onClick={() => setIsOkasModalOpen(true)}
                          className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 transition-colors flex items-center gap-1.5 shrink-0 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                        >
                          <Search size={14} />
                          Listeden
                        </button>
                        <button
                          type="button"
                          onClick={handleAiOkasSuggest}
                          disabled={isAiGeneratingOkas}
                          className="px-3 py-2 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 rounded-xl hover:bg-purple-100 transition-colors flex items-center gap-1.5 shrink-0 border border-purple-200 dark:border-purple-800 text-xs font-semibold disabled:opacity-50"
                        >
                          {isAiGeneratingOkas ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Sparkles size={14} />
                          )}
                          AI Öneri
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {selectedType === 'Yapım' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                          Bakanlık Poz No <span className="text-amber-600">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.poz_no || ''}
                          onChange={(e) => setFormData({ ...formData, poz_no: e.target.value })}
                          placeholder="Örn: 15.150.1002"
                          className="w-full px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-800 dark:text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                          Poz Kitabı Yılı
                        </label>
                        <input
                          type="number"
                          value={formData.poz_yili || new Date().getFullYear()}
                          onChange={(e) =>
                            setFormData({ ...formData, poz_yili: Number(e.target.value) })
                          }
                          className="w-full px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-200"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                        Poz Grubu Kalıcı Referans ID
                      </label>
                      <input
                        type="text"
                        value={formData.poz_grubu_ref_id || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, poz_grubu_ref_id: e.target.value })
                        }
                        placeholder="Örn: YPM-IZOLASYON-CATI (Yıllar arası fiyat/kod takibi için)"
                        className="w-full px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-200"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        Bakanlık poz numarası yıllık değişse dahi kalıcı referansla geçmişe bağlanır.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                        Yapı Sınıfı / İmalat Grubu
                      </label>
                      <select
                        value={formData.yapi_sinifi || ''}
                        onChange={(e) => setFormData({ ...formData, yapi_sinifi: e.target.value })}
                        className="w-full px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200"
                      >
                        <option value="">(Seçiniz veya Genel Yapım)</option>
                        {YAPI_SINIFLARI.map((ys) => (
                          <option key={ys} value={ys}>
                            {ys}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {selectedType === 'Hizmet' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                        Hizmet Sınıflandırması
                      </label>
                      <select
                        value={formData.hizmet_sinifi || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, hizmet_sinifi: e.target.value })
                        }
                        className="w-full px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200"
                      >
                        <option value="">(Hizmet Sınıfı Seçiniz)</option>
                        {HIZMET_SINIFLARI.map((hs) => (
                          <option key={hs} value={hs}>
                            {hs}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                          Hizmet Süresi
                        </label>
                        <input
                          type="text"
                          value={formData.sure || ''}
                          onChange={(e) => setFormData({ ...formData, sure: e.target.value })}
                          placeholder="Örn: 12 Ay, 30 Gün"
                          className="w-full px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                          Personel Sayısı (varsa)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.personel_sayisi || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              personel_sayisi: e.target.value ? Number(e.target.value) : null
                            })
                          }
                          placeholder="Örn: 3"
                          className="w-full px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-xl">
                      <input
                        type="checkbox"
                        id="is_personel_check"
                        checked={!!formData.is_personel}
                        onChange={(e) =>
                          setFormData({ ...formData, is_personel: e.target.checked ? 1 : 0 })
                        }
                        className="rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                      />
                      <label
                        htmlFor="is_personel_check"
                        className="text-xs font-semibold text-indigo-900 dark:text-indigo-200 cursor-pointer"
                      >
                        Personel Çalıştırılmasına Dayalı Hizmet Alımı (Asgari Ücret Farkı Tablosu)
                      </label>
                    </div>

                    {formData.is_personel === 1 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-indigo-50/30 rounded-xl border border-indigo-100">
                        <div>
                          <label className="block text-[11px] font-semibold text-indigo-900 mb-1">
                            İŞKUR / Meslek Kodu
                          </label>
                          <input
                            type="text"
                            value={formData.meslek_kodu || ''}
                            onChange={(e) =>
                              setFormData({ ...formData, meslek_kodu: e.target.value })
                            }
                            placeholder="Örn: 9112.01"
                            className="w-full px-3 py-1.5 bg-white border border-indigo-200 rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-indigo-900 mb-1">
                            Asgari Ücret Fark Oranı (%)
                          </label>
                          <input
                            type="number"
                            value={formData.personel_asgari_fark_oran || 0}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                personel_asgari_fark_oran: Number(e.target.value)
                              })
                            }
                            className="w-full px-3 py-1.5 bg-white border border-indigo-200 rounded-lg text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ÖLÇÜ BİRİMİ, GÖRSEL VE DETAYLAR */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sol: Birim & Menşei & Notlar (2 Sütun Genişlik) */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
                <Database className="text-blue-600 dark:text-blue-400" size={18} />
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                  Ölçü Birimi & Teknik Özellikler
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                    Ölçü Birimi <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.birim || 'Adet'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        birim: e.target.value,
                        olcu_birimi: e.target.value
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {/* Türe Göre Önerilen Resmi Birimler */}
                    {selectedType === 'Yapım' ? (
                      <optgroup label="⭐ Yapım İşi İçin Sık Kullanılanlar">
                        <option value="m²">Metrekare (m²)</option>
                        <option value="m³">Metreküp (m³)</option>
                        <option value="mt">Metretül / Metre (mt)</option>
                        <option value="ton">Ton (ton)</option>
                        <option value="kg">Kilogram (kg)</option>
                        <option value="Adet">Adet (Adet)</option>
                        <option value="Set">Set / Takım (Set)</option>
                        <option value="Götürü">Götürü Bedel (Götürü)</option>
                      </optgroup>
                    ) : selectedType === 'Hizmet' ? (
                      <optgroup label="⭐ Hizmet Alımı İçin Sık Kullanılanlar">
                        <option value="kişi/ay">Kişi Başı Aylık (kişi/ay)</option>
                        <option value="kişi/gün">Kişi Başı Günlük (kişi/gün)</option>
                        <option value="kişi/saat">Kişi Başı Saatlik (kişi/saat)</option>
                        <option value="Ay">Ay (Ay)</option>
                        <option value="Gün">Gün (Gün)</option>
                        <option value="Saat">Saat (saat)</option>
                        <option value="Sefer">Sefer / Uçuş / Tur (Sefer)</option>
                        <option value="Adet">Adet (Adet)</option>
                        <option value="Götürü">Götürü Bedel (Götürü)</option>
                      </optgroup>
                    ) : (
                      <optgroup label="⭐ Mal Alımı İçin Sık Kullanılanlar">
                        <option value="Adet">Adet (Adet)</option>
                        <option value="kg">Kilogram (kg)</option>
                        <option value="lt">Litre (lt)</option>
                        <option value="m">Metre (m)</option>
                        <option value="m²">Metrekare (m²)</option>
                        <option value="Paket">Paket (Paket)</option>
                        <option value="Koli">Koli (Koli)</option>
                        <option value="Kutu">Kutu (Kutu)</option>
                        <option value="Takım">Takım / Set (Takım)</option>
                        <option value="Ton">Ton (Ton)</option>
                      </optgroup>
                    )}

                    {/* Veritabanı Ölçü Birimleri Havuzundan Kategorili Liste */}
                    {BIRIM_KATEGORILERI.map((kategori) => {
                      const categoryUnits = birimler.filter(
                        (b) => b.aktif_mi && (b.kategori || 'Diğer') === kategori
                      )
                      if (categoryUnits.length === 0) return null
                      return (
                        <optgroup key={kategori} label={`📁 ${kategori}`}>
                          {categoryUnits.map((b) => {
                            const unitValue = b.kisa_ad || b.sembol || b.ad
                            const unitLabel =
                              b.kisa_ad && b.kisa_ad !== b.ad
                                ? `${b.ad} (${b.kisa_ad})`
                                : b.ad
                            return (
                              <option key={b.id} value={unitValue}>
                                {unitLabel}
                              </option>
                            )
                          })}
                        </optgroup>
                      )
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                    Menşei / Üretim
                  </label>
                  <select
                    value={formData.mensei || 'Yerli'}
                    onChange={(e) => setFormData({ ...formData, mensei: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Yerli">🇹🇷 Yerli Malı</option>
                    <option value="İthal">🌍 İthal Ürün / Yabancı</option>
                    <option value="">(Belirtilmemiş)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                  Özelliği / Teknik Şartname & Poz Açıklaması
                </label>
                <textarea
                  value={formData.ozelligi || formData.poz_tanimi || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      ozelligi: e.target.value,
                      poz_tanimi: e.target.value
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[90px] resize-y"
                  placeholder="Teknik detaylar, marka/model gereksinimleri veya işçilik tarifleri..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                  Notlar / Açıklama (İç Kullanım)
                </label>
                <input
                  type="text"
                  value={formData.notlar || ''}
                  onChange={(e) => setFormData({ ...formData, notlar: e.target.value })}
                  placeholder="Satın alma birimi için iç notlar..."
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            {/* Sağ: Kalem Görseli & Fotoğraf */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                  <ImageIcon className="text-blue-600 dark:text-blue-400" size={18} />
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                    Kalem Görseli / Fotoğraf
                  </h3>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                {formData.gorsel_url ? (
                  <div className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 p-2 flex flex-col items-center">
                    <img
                      src={formData.gorsel_url}
                      alt="Kalem Görseli"
                      className="w-full h-44 object-contain rounded-lg"
                    />
                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 bg-white text-slate-800 rounded-lg hover:bg-slate-100 text-xs font-semibold flex items-center gap-1"
                      >
                        <Upload size={14} /> Değiştir
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, gorsel_url: null }))}
                        className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs font-semibold flex items-center gap-1"
                      >
                        <Trash2 size={14} /> Kaldır
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="h-44 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600 rounded-xl flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/20 group"
                  >
                    <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <Upload size={20} />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Görsel Yüklemek İçin Tıklayın
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      PNG, JPG veya WEBP (Maksimum 2MB)
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                💡 Kalem görseli, yaklaşık maliyet cetvellerinde ve piyasa araştırma mektuplarında
                isteğe bağlı olarak gösterilebilir.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OKAS Modal */}
      {isOkasModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800"
            style={{ maxHeight: '80vh' }}
          >
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Search size={18} className="text-blue-600" /> OKAS Kodu Seçin
              </h3>
              <button
                onClick={() => setIsOkasModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-lg"
              >
                &times;
              </button>
            </div>
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="OKAS Kodu veya açıklama ile filtrele..."
                  value={okasSearch}
                  onChange={(e) => setOkasSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 min-h-[300px] space-y-1">
              {isOkasLoading ? (
                <div className="p-8 text-center text-slate-500 text-xs">Yükleniyor...</div>
              ) : filteredOkas.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">Kayıt bulunamadı.</div>
              ) : (
                filteredOkas.map((k) => (
                  <button
                    key={k.id}
                    onClick={() => {
                      setFormData({ ...formData, okas_kodu: k.kod })
                      setIsOkasModalOpen(false)
                    }}
                    className="w-full text-left p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex flex-col sm:flex-row sm:items-center gap-3 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                  >
                    <span className="font-mono text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded shrink-0">
                      {k.kod}
                    </span>
                    <span className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2">
                      {k.aciklama}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Taşınır Kod Modal */}
      {isTasinirModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800"
            style={{ maxHeight: '80vh' }}
          >
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Search size={18} className="text-emerald-600" /> Taşınır Kodu Seçin
              </h3>
              <button
                onClick={() => setIsTasinirModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-lg"
              >
                &times;
              </button>
            </div>
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Hesap kodu (örn: 150.01) veya açıklama ile ara..."
                  value={tasinirSearch}
                  onChange={(e) => setTasinirSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  autoFocus
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 min-h-[300px] space-y-1">
              {isTasinirLoading ? (
                <div className="p-8 text-center text-slate-500 text-xs">Yükleniyor...</div>
              ) : filteredTasinir.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">Kayıt bulunamadı.</div>
              ) : (
                filteredTasinir.map((k) => (
                  <button
                    key={k.id}
                    onClick={() => {
                      setFormData({ ...formData, tasinir_kodu: k.tam_kod })
                      setIsTasinirModalOpen(false)
                    }}
                    className="w-full text-left p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex flex-col sm:flex-row sm:items-center gap-3 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                  >
                    <span className="font-mono text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded shrink-0">
                      {k.tam_kod}
                    </span>
                    <span className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2">
                      {k.aciklama}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

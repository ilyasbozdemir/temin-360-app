import React, { useState, useEffect } from 'react'
import {
  FolderPlus,
  Search,
  Trash2,
  Building2,
  LayoutGrid,
  Table as TableIcon,
  Calendar,
  TrendingUp,
  Copy,
  Edit3,
  Landmark,
  Gavel,
  ShieldCheck,
  AlertTriangle,
  Sparkles
} from 'lucide-react'
import { DEFAULT_2886_DOSYALAR } from '../../../components/layout/temin-selector/teminSelector.constants'
import {
  getInitial2886Dosyalar,
  persist2886Dosyalar,
  persist2886ActiveDosya
} from '../../../components/layout/temin-selector/teminSelector.storage'
import { Dosya2886Item } from '../../../components/layout/temin-selector/teminSelector.types'

export type { Dosya2886Item }

interface DosyaYonetimi2886TabProps {
  onSelectDosya?: (dosya: Dosya2886Item) => void
  onOpenStudyo?: () => void
  activeDosyaId?: string
}

export function DosyaYonetimi2886Tab({
  onSelectDosya,
  onOpenStudyo,
  activeDosyaId
}: DosyaYonetimi2886TabProps): React.JSX.Element {
  const [dosyalar, setDosyalar] = useState<Dosya2886Item[]>(() => getInitial2886Dosyalar())

  // Başlık (Header) seçici ve diğer pencerelerle %100 Gerçek Zamanlı Senkronizasyon
  useEffect(() => {
    const handleReload = (): void => {
      setDosyalar(getInitial2886Dosyalar())
    }

    window.addEventListener('devlet-ihale-2886-reloaded', handleReload)
    window.addEventListener('storage', handleReload)
    return () => {
      window.removeEventListener('devlet-ihale-2886-reloaded', handleReload)
      window.removeEventListener('storage', handleReload)
    }
  }, [])

  // Yardımcı Kaydetme ve Yayınlama Fonksiyonu
  const saveAndBroadcast = (newList: Dosya2886Item[]): void => {
    setDosyalar(newList)
    persist2886Dosyalar(newList)
  }

  const [searchQuery, setSearchQuery] = useState('')
  const [filterTur, setFilterTur] = useState<string>('hepsi')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  // Modallar
  const [showNewModal, setShowNewModal] = useState(false)
  const [editingDosya, setEditingDosya] = useState<Dosya2886Item | null>(null)
  const [deleteModalDosya, setDeleteModalDosya] = useState<Dosya2886Item | null>(null)

  // Hızlı Ekle / Düzenle Form State
  const [formData, setFormData] = useState({
    ihaleKayitNo: '',
    ihaleAdi: '',
    islemTuru: 'satis',
    usul: 'acik_teklif_45',
    muhammenBedel: 2500000,
    ihaleTarihi: new Date().toISOString().split('T')[0],
    ihaleSaati: '14:00',
    ihaleYeri: 'Belediye Encümen Toplantı Salonu',
    il: 'Ankara',
    ilce: 'Çankaya',
    mahalleKoy: 'Merkez Mah.',
    ada: '101',
    parsel: '1',
    yuzolcumuM2: 500,
    cinsi: 'Arsa Satışı',
    adres: ''
  })

  const openNewModal = (): void => {
    setEditingDosya(null)
    setFormData({
      ihaleKayitNo: `2026/2886-ST-0${dosyalar.length + 1}`,
      ihaleAdi: '',
      islemTuru: 'satis',
      usul: 'acik_teklif_45',
      muhammenBedel: 2500000,
      ihaleTarihi: new Date().toISOString().split('T')[0],
      ihaleSaati: '14:00',
      ihaleYeri: 'Belediye Encümen Toplantı Salonu',
      il: 'Ankara',
      ilce: 'Çankaya',
      mahalleKoy: 'Merkez Mah.',
      ada: '101',
      parsel: '1',
      yuzolcumuM2: 500,
      cinsi: 'Arsa Satışı',
      adres: ''
    })
    setShowNewModal(true)
  }

  const openEditModal = (dosya: Dosya2886Item): void => {
    setEditingDosya(dosya)
    setFormData({
      ihaleKayitNo: dosya.ihaleKayitNo,
      ihaleAdi: dosya.ihaleAdi,
      islemTuru: dosya.islemTuru,
      usul: dosya.usul,
      muhammenBedel:
        dosya.muhammenBedel?.takdirEdilenMuhammenBedel ||
        dosya.muhammenBedel?.hesaplananBedel ||
        0,
      ihaleTarihi: dosya.ihaleTarihi,
      ihaleSaati: dosya.ihaleSaati || '14:00',
      ihaleYeri: dosya.ihaleYeri || 'Belediye Encümen Toplantı Salonu',
      il: dosya.tasinmaz?.il || '',
      ilce: dosya.tasinmaz?.ilce || '',
      mahalleKoy: dosya.tasinmaz?.mahalleKoy || '',
      ada: dosya.tasinmaz?.ada || '',
      parsel: dosya.tasinmaz?.parsel || '',
      yuzolcumuM2: dosya.tasinmaz?.yuzolcumuM2 || 0,
      cinsi: dosya.tasinmaz?.cinsi || '',
      adres: dosya.tasinmaz?.adres || ''
    })
    setShowNewModal(true)
  }

  const handleSaveQuickDosya = (e: React.FormEvent, openInStudio = false): void => {
    e.preventDefault()
    if (!formData.ihaleAdi.trim()) return

    const bedel = Number(formData.muhammenBedel) || 0
    const geciciTeminat = Math.round(bedel * 0.03)

    let savedItem: Dosya2886Item

    if (editingDosya) {
      savedItem = {
        ...editingDosya,
        ihaleKayitNo: formData.ihaleKayitNo,
        ihaleAdi: formData.ihaleAdi,
        islemTuru: formData.islemTuru,
        usul: formData.usul,
        ihaleTarihi: formData.ihaleTarihi,
        ihaleSaati: formData.ihaleSaati,
        ihaleYeri: formData.ihaleYeri,
        tasinmaz: {
          ...editingDosya.tasinmaz,
          il: formData.il,
          ilce: formData.ilce,
          mahalleKoy: formData.mahalleKoy,
          ada: formData.ada,
          parsel: formData.parsel,
          yuzolcumuM2: Number(formData.yuzolcumuM2) || 0,
          cinsi: formData.cinsi,
          adres: formData.adres
        },
        muhammenBedel: {
          ...editingDosya.muhammenBedel,
          hesaplananBedel: bedel,
          takdirEdilenMuhammenBedel: bedel,
          geciciTeminatTutari: geciciTeminat
        }
      }
      const updatedList = dosyalar.map((d) => (d.id === editingDosya.id ? savedItem : d))
      saveAndBroadcast(updatedList)
    } else {
      savedItem = {
        id: `2886-${Date.now()}`,
        ihaleKayitNo: formData.ihaleKayitNo,
        ihaleAdi: formData.ihaleAdi,
        islemTuru: formData.islemTuru,
        usul: formData.usul,
        ihaleTarihi: formData.ihaleTarihi,
        ihaleSaati: formData.ihaleSaati,
        ihaleYeri: formData.ihaleYeri,
        tasinmaz: {
          il: formData.il,
          ilce: formData.ilce,
          mahalleKoy: formData.mahalleKoy,
          ada: formData.ada,
          parsel: formData.parsel,
          yuzolcumuM2: Number(formData.yuzolcumuM2) || 0,
          cinsi: formData.cinsi,
          hisseOrani: '1/1',
          mevcutDurumu: 'Boş',
          adres: formData.adres
        },
        muhammenBedel: {
          hesaplananBedel: bedel,
          takdirEdilenMuhammenBedel: bedel,
          geciciTeminatTutari: geciciTeminat,
          kdvOrani: 20
        }
      }
      const updatedList = [savedItem, ...dosyalar]
      saveAndBroadcast(updatedList)
    }

    persist2886ActiveDosya(savedItem)
    setShowNewModal(false)
    setEditingDosya(null)

    if (openInStudio && onSelectDosya) {
      onSelectDosya(savedItem)
    }
  }

  // Kesin ve Kalıcı Silme Fonksiyonu
  const handleDeleteConfirm = (): void => {
    if (!deleteModalDosya) return
    const idToDelete = deleteModalDosya.id
    const kayitNoToDelete = deleteModalDosya.ihaleKayitNo

    const updatedList = dosyalar.filter(
      (d) => d.id !== idToDelete && d.ihaleKayitNo !== kayitNoToDelete
    )

    try {
      const activeRaw = localStorage.getItem('temin_2886_active_dosya')
      if (activeRaw) {
        const activeItem = JSON.parse(activeRaw)
        if (activeItem.id === idToDelete || activeItem.ihaleKayitNo === kayitNoToDelete) {
          persist2886ActiveDosya(updatedList[0] || null)
        }
      }
    } catch {
      // ignore
    }

    saveAndBroadcast(updatedList)
    setDeleteModalDosya(null)
  }

  const handleDuplicate = (dosya: Dosya2886Item): void => {
    const clone: Dosya2886Item = {
      ...dosya,
      id: `2886-${Date.now()}`,
      ihaleKayitNo: `${dosya.ihaleKayitNo}-KOPYA`,
      ihaleAdi: `${dosya.ihaleAdi} (Kopya)`
    }
    saveAndBroadcast([clone, ...dosyalar])
  }

  // Arama & Filtreleme
  const filteredDosyalar = dosyalar.filter((d) => {
    const q = searchQuery.toLowerCase()
    const matchQ =
      (d.ihaleAdi && d.ihaleAdi.toLowerCase().includes(q)) ||
      (d.ihaleKayitNo && d.ihaleKayitNo.toLowerCase().includes(q)) ||
      (d.tasinmaz?.ada && d.tasinmaz.ada.toLowerCase().includes(q)) ||
      (d.tasinmaz?.parsel && d.tasinmaz.parsel.toLowerCase().includes(q)) ||
      (d.tasinmaz?.ilce && d.tasinmaz.ilce.toLowerCase().includes(q))

    const matchTur =
      filterTur === 'hepsi' ||
      d.islemTuru === filterTur ||
      (filterTur === 'irtifak' && (d.islemTuru === 'irtifak_hakki' || d.islemTuru === 'irtifak'))

    return matchQ && matchTur
  })

  // İstatistikler
  const totalHacim = dosyalar.reduce((acc, d) => {
    const val =
      d.muhammenBedel?.takdirEdilenMuhammenBedel || d.muhammenBedel?.hesaplananBedel || 0
    return acc + val
  }, 0)

  const satisCount = dosyalar.filter((d) => d.islemTuru === 'satis').length
  const kiraCount = dosyalar.filter((d) => d.islemTuru === 'kiralama').length
  const hakCount = dosyalar.filter(
    (d) => d.islemTuru === 'irtifak_hakki' || d.islemTuru === 'irtifak' || d.islemTuru === 'trampa'
  ).length

  const formatMoney = (val: number): string =>
    val ? val.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00'

  const getTurBadge = (tur: string): React.JSX.Element => {
    switch (tur) {
      case 'satis':
        return (
          <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 font-bold text-[10px]">
            TAŞINMAZ / MENKUL SATIŞ
          </span>
        )
      case 'kiralama':
        return (
          <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 font-bold text-[10px]">
            KİRALAMA İHALESİ
          </span>
        )
      case 'irtifak_hakki':
      case 'irtifak':
        return (
          <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 font-bold text-[10px]">
            SINIRLI AYNİ HAK / İRTİFAK
          </span>
        )
      case 'trampa':
        return (
          <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 font-bold text-[10px]">
            TRAMPA (TAKAS)
          </span>
        )
      default:
        return (
          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px]">
            {tur}
          </span>
        )
    }
  }

  const getUsulLabel = (usul: string): string => {
    if (usul === 'acik_teklif_45') return '2886 / Md. 45 (Açık Teklif)'
    if (usul === 'kapali_teklif_36') return '2886 / Md. 36 (Kapalı Teklif)'
    if (usul === 'pazarlik_51') return '2886 / Md. 51 (Pazarlık Usulü)'
    return usul || 'Md. 45 Açık Teklif'
  }

  return (
    <div className="space-y-4">
      {/* 1. İSTATİSTİK KARTLARI */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Toplam Dosya */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Toplam İhale</span>
            <div className="w-7 h-7 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Landmark className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl font-black text-slate-800 dark:text-slate-100">
              {dosyalar.length}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">Dosya</span>
          </div>
        </div>

        {/* Satış Dosyaları */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Satış İhaleleri</span>
            <div className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Gavel className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl font-black text-blue-600 dark:text-blue-400">
              {satisCount}
            </span>
            <span className="text-[10px] text-blue-500 font-semibold">Md. 35/36/45</span>
          </div>
        </div>

        {/* Kiralama Dosyaları */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Kiralama</span>
            <div className="w-7 h-7 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl font-black text-amber-600 dark:text-amber-400">
              {kiraCount}
            </span>
            <span className="text-[10px] text-amber-500 font-semibold">Kira Takibi</span>
          </div>
        </div>

        {/* Hak Tesisi & Trampa */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">İrtifak & Trampa</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
              {hakCount}
            </span>
            <span className="text-[10px] text-emerald-500 font-semibold">Ayni Hak</span>
          </div>
        </div>

        {/* Toplam Muhammen Bedel Hacmi */}
        <div className="bg-linear-to-br from-indigo-950 via-slate-900 to-purple-950 text-white p-3.5 rounded-2xl shadow-md col-span-2 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-indigo-200">
            <span className="text-[11px] font-bold uppercase">Toplam Muhammen Bedel</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 font-mono font-black text-base md:text-lg text-emerald-400 truncate">
            ₺{formatMoney(totalHacim)}
          </div>
        </div>
      </div>

      {/* 2. ARAMA, FİLTRE VE AKSİYON ÇUBUĞU */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-70">
          {/* Arama Input */}
          <div className="relative flex-1 min-w-55">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="2886 dosya no, ada/parsel, ihale konusu veya taşınmaz ara..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          {/* Tür Filtresi */}
          <select
            value={filterTur}
            onChange={(e) => setFilterTur(e.target.value)}
            className="bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-hidden font-medium cursor-pointer"
          >
            <option value="hepsi">Tüm İşlem Türleri ({dosyalar.length})</option>
            <option value="satis">🏷️ Taşınmaz / Menkul Satış</option>
            <option value="kiralama">🏢 Kiralama İşleri</option>
            <option value="irtifak">📜 Sınırlı Ayni Hak & İrtifak</option>
            <option value="trampa">🔄 Trampa (Takas)</option>
          </select>
        </div>

        {/* Görünüm ve Yeni Dosya Butonu */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 dark:bg-slate-850 p-0.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-2xs'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
              title="Kart Görünümü"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-2xs'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
              title="Tablo Görünümü"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenStudyo}
            className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Dinamik Belge & Form Stüdyosu</span>
          </button>

          <button
            type="button"
            onClick={openNewModal}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <FolderPlus className="w-4 h-4" />
            <span>+ Hızlı Dosya Ekle</span>
          </button>
        </div>
      </div>

      {/* 3. DOSYA LİSTESİ: KART VEYA TABLO GÖRÜNÜMÜ */}
      {filteredDosyalar.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30 text-indigo-500" />
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            Kayıtlı 2886 İhale Dosyası Bulunamadı
          </h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Arama kriterlerinizi değiştirebilir veya yukarıdaki butonu kullanarak yeni bir ihale dosyası oluşturabilirsiniz.
          </p>
          <button
            type="button"
            onClick={() => {
              saveAndBroadcast(DEFAULT_2886_DOSYALAR)
            }}
            className="mt-4 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 dark:text-indigo-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Örnek 2886 Dosyalarını Geri Yükle
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID KART GÖRÜNÜMÜ */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {filteredDosyalar.map((d) => {
            const isActive =
              activeDosyaId === d.id ||
              localStorage.getItem('temin_2886_active_dosya')?.includes(d.id)
            const bedel =
              d.muhammenBedel?.takdirEdilenMuhammenBedel ||
              d.muhammenBedel?.hesaplananBedel ||
              0

            return (
              <div
                key={d.id}
                className={`bg-white dark:bg-slate-900 border rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group ${
                  isActive
                    ? 'border-purple-500 ring-2 ring-purple-500/20 bg-purple-50/10'
                    : 'border-slate-200 dark:border-slate-800 hover:border-purple-200 dark:hover:border-purple-900'
                }`}
              >
                <div>
                  {/* Kart Üst Başlık & Rozetler */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-800">
                        {d.ihaleKayitNo}
                      </span>
                      {getTurBadge(d.islemTuru)}
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                      {getUsulLabel(d.usul)}
                    </span>
                  </div>

                  {/* Taşınmaz Adı / Konusu */}
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-2 mb-2">
                    {d.ihaleAdi}
                  </h4>

                  {/* Künye Özet Bilgileri */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800 text-[11px] mb-3">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Ada / Parsel</span>
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                        {d.tasinmaz?.ada && d.tasinmaz?.parsel
                          ? `${d.tasinmaz.ada} / ${d.tasinmaz.parsel}`
                          : '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Yüzölçümü</span>
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                        {d.tasinmaz?.yuzolcumuM2 ? `${d.tasinmaz.yuzolcumuM2} m²` : '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">İhale Tarihi</span>
                      <span className="font-mono font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {d.ihaleTarihi} {d.ihaleSaati && `(${d.ihaleSaati})`}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Muhammen Bedel</span>
                      <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                        ₺{formatMoney(bedel)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Kart Alt Butonları */}
                <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(d)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      title="Dosya Bilgilerini Düzenle"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDuplicate(d)}
                      className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/60 rounded-lg transition-colors cursor-pointer"
                      title="Dosyayı Klonla / Çoğalt"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteModalDosya(d)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition-colors cursor-pointer"
                      title="Dosyayı Kesin Olarak Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      persist2886ActiveDosya(d)
                      onSelectDosya?.(d)
                    }}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Stüdyoda Aç</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* TABLO GÖRÜNÜMÜ */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">
                  <th className="p-3 w-32 font-mono">Dosya No</th>
                  <th className="p-3">İhale Konusu & Taşınmaz</th>
                  <th className="p-3 w-32">İşlem Türü</th>
                  <th className="p-3 w-40">İhale Usulü</th>
                  <th className="p-3 w-36 text-right font-mono">Muhammen Bedel</th>
                  <th className="p-3 w-28 text-center">İhale Tarihi</th>
                  <th className="p-3 w-32 text-center">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredDosyalar.map((d) => {
                  const isActive = activeDosyaId === d.id
                  const bedel =
                    d.muhammenBedel?.takdirEdilenMuhammenBedel ||
                    d.muhammenBedel?.hesaplananBedel ||
                    0

                  return (
                    <tr
                      key={d.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-850/80 transition-colors ${
                        isActive ? 'bg-purple-50/40 dark:bg-purple-950/30 font-semibold' : ''
                      }`}
                    >
                      <td className="p-3 font-mono font-bold text-purple-600 dark:text-purple-400">
                        {d.ihaleKayitNo}
                      </td>
                      <td className="p-3 font-medium text-slate-800 dark:text-slate-200">
                        {d.ihaleAdi}
                      </td>
                      <td className="p-3">{getTurBadge(d.islemTuru)}</td>
                      <td className="p-3 text-slate-500 dark:text-slate-400">
                        {getUsulLabel(d.usul)}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        ₺{formatMoney(bedel)}
                      </td>
                      <td className="p-3 text-center font-mono text-slate-500">
                        {d.ihaleTarihi}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              persist2886ActiveDosya(d)
                              onSelectDosya?.(d)
                            }}
                            className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900 text-purple-600 dark:text-purple-300 transition-colors cursor-pointer text-xs font-bold flex items-center gap-1"
                            title="Dinamik Belge & Form Stüdyosunda Aç"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>Stüdyo</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(d)}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                            title="Düzenle"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteModalDosya(d)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. HIZLI DOSYA EKLEME / DÜZENLEME MODALI */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={(e) => handleSaveQuickDosya(e, false)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-indigo-500" />
                {editingDosya ? '2886 İhale Dosyasını Düzenle' : 'Yeni 2886 İhale Dosyası Aç (Hızlı Tanım)'}
              </h3>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  İhale Kayıt No
                </label>
                <input
                  type="text"
                  required
                  value={formData.ihaleKayitNo}
                  onChange={(e) => setFormData({ ...formData, ihaleKayitNo: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  İşlem Türü
                </label>
                <select
                  value={formData.islemTuru}
                  onChange={(e) => setFormData({ ...formData, islemTuru: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold"
                >
                  <option value="satis">🏷️ Mülkiyet Satışı</option>
                  <option value="kiralama">🏢 Taşınmaz Kiralama</option>
                  <option value="irtifak_hakki">📜 Sınırlı Ayni Hak / İrtifak</option>
                  <option value="trampa">🔄 Trampa (Takas)</option>
                </select>
              </div>
            </div>

            <div className="text-xs">
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                İhale Konusu & Taşınmaz Adı
              </label>
              <input
                type="text"
                required
                placeholder="Örn: Merkez Mah. 104 Ada 12 Parsel Arsa Satışı"
                value={formData.ihaleAdi}
                onChange={(e) => setFormData({ ...formData, ihaleAdi: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  İhale Usulü
                </label>
                <select
                  value={formData.usul}
                  onChange={(e) => setFormData({ ...formData, usul: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                >
                  <option value="acik_teklif_45">Madde 45 (Açık Teklif)</option>
                  <option value="kapali_teklif_36">Madde 36 (Kapalı Teklif)</option>
                  <option value="pazarlik_51">Madde 51 (Pazarlık)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Muhammen Bedel (₺)
                </label>
                <input
                  type="number"
                  required
                  value={formData.muhammenBedel}
                  onChange={(e) =>
                    setFormData({ ...formData, muhammenBedel: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  İhale Tarihi
                </label>
                <input
                  type="date"
                  value={formData.ihaleTarihi}
                  onChange={(e) => setFormData({ ...formData, ihaleTarihi: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  İhale Saati
                </label>
                <input
                  type="time"
                  value={formData.ihaleSaati}
                  onChange={(e) => setFormData({ ...formData, ihaleSaati: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Ada / Parsel
                </label>
                <input
                  type="text"
                  placeholder="104 / 12"
                  value={formData.ada && formData.parsel ? `${formData.ada} / ${formData.parsel}` : formData.ada}
                  onChange={(e) => {
                    const parts = e.target.value.split('/')
                    setFormData({
                      ...formData,
                      ada: parts[0]?.trim() || '',
                      parsel: parts[1]?.trim() || ''
                    })
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Yüzölçümü (m²)
                </label>
                <input
                  type="number"
                  placeholder="1450"
                  value={formData.yuzolcumuM2 || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, yuzolcumuM2: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={(e) => handleSaveQuickDosya(e, true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Kaydet & Stüdyoda Aç</span>
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                {editingDosya ? 'Güncelle' : 'Dosyayı Oluştur'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 5. SİLME ONAY MODALI (KESİN SİLME & SENKRON) */}
      {deleteModalDosya && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  2886 İhale Dosyasını Sil
                </h4>
                <p className="text-xs text-slate-500 font-mono">
                  {deleteModalDosya.ihaleKayitNo}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="font-bold text-slate-800 dark:text-slate-100 block mb-1">
                {deleteModalDosya.ihaleAdi}
              </span>
              Bu 2886 ihale dosyasını sistemden ve tüm ilişkili verilerinden tamamen silmek istediğinize emin misiniz?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteModalDosya(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                İptal / Vazgeç
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Evet, Dosyayı Sil</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

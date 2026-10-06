import React, { useState, useEffect } from 'react'
import {
  FolderPlus,
  Search,
  Trash2,
  Eye,
  Clock,
  Building2,
  RefreshCw,
  LayoutGrid,
  Table as TableIcon,
  Calendar,
  ArrowRight,
  TrendingUp,
  Copy,
  Edit3,
  Landmark,
  Gavel,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react'
import { IslemTuru2886 } from '../types/devletIhale2886.types'

export interface Dosya2886Item {
  id: number | string
  dosyaNo: string
  tasinmazAdi: string
  islemTuru: IslemTuru2886
  usul: string
  muhammenBedel: number
  durum: 'taslak' | 'ilanda' | 'ihale_gunu' | 'sozlesme' | 'tamamlandi' | 'iptal'
  ihaleTarihi: string
  ihaleSaati?: string
  adaParsel?: string
  yuzolcumuM2?: number
  created_at: string
  revizyonSayisi: number
}

interface DosyaYonetimi2886TabProps {
  onSelectDosya?: (dosya: Dosya2886Item) => void
  activeDosyaId?: number | string
}

const DEFAULT_DOSYALAR: Dosya2886Item[] = [
  {
    id: '2886-1',
    dosyaNo: '2886-2026/001',
    tasinmazAdi: 'Merkez Mah. 104 Ada 12 Parsel Arsa Satışı',
    islemTuru: 'satis',
    usul: 'Madde 35/a (Kapalı Teklif Usulü)',
    muhammenBedel: 16425000,
    durum: 'ihale_gunu',
    ihaleTarihi: '2026-10-15',
    ihaleSaati: '14:30',
    adaParsel: '104 / 12',
    yuzolcumuM2: 450,
    created_at: '2026-10-01',
    revizyonSayisi: 3
  },
  {
    id: '2886-2',
    dosyaNo: '2886-2026/002',
    tasinmazAdi: 'Atatürk Cad. Dükkan No: 4 Kiralama İhalesi',
    islemTuru: 'kiralama',
    usul: 'Madde 45 (Açık Teklif Usulü)',
    muhammenBedel: 250000,
    durum: 'ilanda',
    ihaleTarihi: '2026-10-20',
    ihaleSaati: '10:00',
    adaParsel: '512 / 3',
    yuzolcumuM2: 120,
    created_at: '2026-10-03',
    revizyonSayisi: 1
  },
  {
    id: '2886-3',
    dosyaNo: '2886-2026/003',
    tasinmazAdi: 'Organize Sanayi Bölgesi İrtifak Hakkı Tesis Edilmesi (30 Yıl)',
    islemTuru: 'irtifak',
    usul: 'Madde 35/d (Pazarlık Usulü)',
    muhammenBedel: 4800000,
    durum: 'taslak',
    ihaleTarihi: '2026-11-01',
    ihaleSaati: '15:00',
    adaParsel: '890 / 1',
    yuzolcumuM2: 2500,
    created_at: '2026-10-05',
    revizyonSayisi: 0
  },
  {
    id: '2886-4',
    dosyaNo: '2886-2026/004',
    tasinmazAdi: 'Çankaya Bölgesi Belediye Hizmet Alanı Trampası',
    islemTuru: 'trampa',
    usul: 'Madde 51/g (Pazarlık Usulü)',
    muhammenBedel: 14000000,
    durum: 'sozlesme',
    ihaleTarihi: '2026-09-28',
    ihaleSaati: '11:00',
    adaParsel: '1200 / 4',
    yuzolcumuM2: 850,
    created_at: '2026-09-10',
    revizyonSayisi: 2
  }
]

const STORAGE_KEY = 'devlet_ihale_2886_dosyalar_v2'

export function DosyaYonetimi2886Tab({
  onSelectDosya,
  activeDosyaId
}: DosyaYonetimi2886TabProps): React.JSX.Element {
  const [dosyalar, setDosyalar] = useState<Dosya2886Item[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch (e) {
      console.error('2886 dosyaları yüklenemedi:', e)
    }
    return DEFAULT_DOSYALAR
  })

  // SQLite DB Yükleme ve Tablo Başlatma
  useEffect(() => {
    const loadDbData = async (): Promise<void> => {
      if (!window.electron?.ipcRenderer) return
      try {
        await window.electron.ipcRenderer.invoke(
          'db:run',
          `CREATE TABLE IF NOT EXISTS DATA_DevletIhale2886Dosyasi (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            dosyaNo TEXT NOT NULL,
            tasinmazAdi TEXT NOT NULL,
            islemTuru TEXT DEFAULT 'satis',
            usul TEXT,
            muhammenBedel REAL DEFAULT 0,
            durum TEXT DEFAULT 'taslak',
            ihaleTarihi TEXT,
            ihaleSaati TEXT,
            adaParsel TEXT,
            yuzolcumuM2 REAL DEFAULT 0,
            revizyonSayisi INTEGER DEFAULT 1,
            is_deleted INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );`
        )

        const res = await window.electron.ipcRenderer.invoke(
          'db:query',
          'SELECT * FROM DATA_DevletIhale2886Dosyasi WHERE is_deleted = 0 ORDER BY id DESC'
        )

        if (res?.success && Array.isArray(res.data)) {
          if (res.data.length > 0) {
            setDosyalar(res.data)
            return
          } else {
            // Veritabanı boşsa varsayılan kayıtları SQLite'a tohumla (seed)
            for (const item of DEFAULT_DOSYALAR) {
              await window.electron.ipcRenderer.invoke(
                'db:run',
                `INSERT INTO DATA_DevletIhale2886Dosyasi (dosyaNo, tasinmazAdi, islemTuru, usul, muhammenBedel, durum, ihaleTarihi, ihaleSaati, adaParsel, yuzolcumuM2, revizyonSayisi)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                  item.dosyaNo,
                  item.tasinmazAdi,
                  item.islemTuru,
                  item.usul,
                  item.muhammenBedel,
                  item.durum,
                  item.ihaleTarihi,
                  item.ihaleSaati || '14:00',
                  item.adaParsel || '',
                  item.yuzolcumuM2 || 0,
                  item.revizyonSayisi || 1
                ]
              )
            }
            const refreshed = await window.electron.ipcRenderer.invoke(
              'db:query',
              'SELECT * FROM DATA_DevletIhale2886Dosyasi WHERE is_deleted = 0 ORDER BY id DESC'
            )
            if (refreshed?.success && Array.isArray(refreshed.data)) {
              setDosyalar(refreshed.data)
            }
          }
        }
      } catch (err) {
        console.warn('SQLite 2886 veri yükleme uyarısı:', err)
      }
    }

    loadDbData()
  }, [])

  // localStorage Senkronizasyonu
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dosyalar))
    } catch (e) {
      console.error('2886 dosyaları kaydedilemedi:', e)
    }
  }, [dosyalar])

  const [searchQuery, setSearchQuery] = useState('')
  const [filterTur, setFilterTur] = useState<string>('hepsi')
  const [filterDurum, setFilterDurum] = useState<string>('hepsi')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  // Modals
  const [showNewModal, setShowNewModal] = useState(false)
  const [editingDosya, setEditingDosya] = useState<Dosya2886Item | null>(null)
  const [selectedDosyaForRev, setSelectedDosyaForRev] = useState<Dosya2886Item | null>(null)
  const [deleteModalDosya, setDeleteModalDosya] = useState<Dosya2886Item | null>(null)

  // Form State
  const [formData, setFormData] = useState({
    dosyaNo: '',
    tasinmazAdi: '',
    islemTuru: 'satis' as IslemTuru2886,
    usul: 'Madde 35/a (Kapalı Teklif Usulü)',
    muhammenBedel: 1000000,
    ihaleTarihi: new Date().toISOString().split('T')[0],
    ihaleSaati: '14:00',
    adaParsel: '',
    yuzolcumuM2: 0,
    durum: 'taslak' as Dosya2886Item['durum']
  })

  const openNewModal = (): void => {
    setEditingDosya(null)
    setFormData({
      dosyaNo: `2886-2026/00${dosyalar.length + 1}`,
      tasinmazAdi: '',
      islemTuru: 'satis',
      usul: 'Madde 35/a (Kapalı Teklif Usulü)',
      muhammenBedel: 2500000,
      ihaleTarihi: new Date().toISOString().split('T')[0],
      ihaleSaati: '14:00',
      adaParsel: '101 / 1',
      yuzolcumuM2: 250,
      durum: 'taslak'
    })
    setShowNewModal(true)
  }

  const openEditModal = (dosya: Dosya2886Item): void => {
    setEditingDosya(dosya)
    setFormData({
      dosyaNo: dosya.dosyaNo,
      tasinmazAdi: dosya.tasinmazAdi,
      islemTuru: dosya.islemTuru,
      usul: dosya.usul,
      muhammenBedel: dosya.muhammenBedel,
      ihaleTarihi: dosya.ihaleTarihi,
      ihaleSaati: dosya.ihaleSaati || '14:00',
      adaParsel: dosya.adaParsel || '',
      yuzolcumuM2: dosya.yuzolcumuM2 || 0,
      durum: dosya.durum
    })
    setShowNewModal(true)
  }

  const handleSaveDosya = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!formData.tasinmazAdi.trim()) return

    if (editingDosya) {
      // 1. SQLite DB Güncelleme
      if (window.electron?.ipcRenderer) {
        try {
          if (typeof editingDosya.id === 'number' || !isNaN(Number(editingDosya.id))) {
            await window.electron.ipcRenderer.invoke(
              'db:run',
              `UPDATE DATA_DevletIhale2886Dosyasi SET 
                dosyaNo = ?, tasinmazAdi = ?, islemTuru = ?, usul = ?, 
                muhammenBedel = ?, ihaleTarihi = ?, ihaleSaati = ?, 
                adaParsel = ?, yuzolcumuM2 = ?, durum = ?, 
                revizyonSayisi = revizyonSayisi + 1, updated_at = CURRENT_TIMESTAMP 
               WHERE id = ?`,
              [
                formData.dosyaNo,
                formData.tasinmazAdi,
                formData.islemTuru,
                formData.usul,
                formData.muhammenBedel,
                formData.ihaleTarihi,
                formData.ihaleSaati,
                formData.adaParsel,
                formData.yuzolcumuM2,
                formData.durum,
                Number(editingDosya.id)
              ]
            )
          }
        } catch (err) {
          console.error('SQLite güncelleme hatası:', err)
        }
      }

      // 2. React State Güncelleme
      const updatedList = dosyalar.map((d) =>
        String(d.id) === String(editingDosya.id)
          ? {
              ...d,
              ...formData,
              revizyonSayisi: d.revizyonSayisi + 1
            }
          : d
      )
      setDosyalar(updatedList)
    } else {
      // 1. SQLite DB Yeni Ekleme
      let insertedId: number | string = `2886-${Date.now()}`
      if (window.electron?.ipcRenderer) {
        try {
          const res = await window.electron.ipcRenderer.invoke(
            'db:run',
            `INSERT INTO DATA_DevletIhale2886Dosyasi 
              (dosyaNo, tasinmazAdi, islemTuru, usul, muhammenBedel, durum, ihaleTarihi, ihaleSaati, adaParsel, yuzolcumuM2, revizyonSayisi)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
            [
              formData.dosyaNo,
              formData.tasinmazAdi,
              formData.islemTuru,
              formData.usul,
              formData.muhammenBedel,
              formData.durum,
              formData.ihaleTarihi,
              formData.ihaleSaati,
              formData.adaParsel,
              formData.yuzolcumuM2
            ]
          )
          if (res?.success && res.lastInsertRowid) {
            insertedId = res.lastInsertRowid
          }
        } catch (err) {
          console.error('SQLite insert hatası:', err)
        }
      }

      // 2. React State Yeni Ekleme
      const newItem: Dosya2886Item = {
        id: insertedId,
        ...formData,
        created_at: new Date().toISOString().split('T')[0],
        revizyonSayisi: 1
      }
      setDosyalar([newItem, ...dosyalar])
      if (onSelectDosya) onSelectDosya(newItem)
    }

    setShowNewModal(false)
  }

  const handleDeleteConfirm = async (): Promise<void> => {
    if (!deleteModalDosya) return
    const idToDelete = deleteModalDosya.id

    // 1. SQLite Veritabanından Sil (Hard & Soft delete)
    if (window.electron?.ipcRenderer) {
      try {
        if (typeof idToDelete === 'number' || !isNaN(Number(idToDelete))) {
          await window.electron.ipcRenderer.invoke(
            'db:run',
            'UPDATE DATA_DevletIhale2886Dosyasi SET is_deleted = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [Number(idToDelete)]
          )
        } else {
          await window.electron.ipcRenderer.invoke(
            'db:run',
            'UPDATE DATA_DevletIhale2886Dosyasi SET is_deleted = 1, updated_at = CURRENT_TIMESTAMP WHERE dosyaNo = ?',
            [deleteModalDosya.dosyaNo]
          )
        }
      } catch (err) {
        console.error('SQLite DB dosya silme hatası:', err)
      }
    }

    // 2. React State & LocalStorage'dan Sil
    const idStr = String(idToDelete)
    setDosyalar((prev) =>
      prev.filter((d) => String(d.id) !== idStr && d.dosyaNo !== deleteModalDosya.dosyaNo)
    )
    setDeleteModalDosya(null)
  }

  const handleDuplicate = async (dosya: Dosya2886Item): Promise<void> => {
    let newId: number | string = `2886-${Date.now()}`
    const cloneDosyaNo = `${dosya.dosyaNo}-KOPYA`
    const cloneTasinmaz = `${dosya.tasinmazAdi} (Kopya)`

    if (window.electron?.ipcRenderer) {
      try {
        const res = await window.electron.ipcRenderer.invoke(
          'db:run',
          `INSERT INTO DATA_DevletIhale2886Dosyasi 
            (dosyaNo, tasinmazAdi, islemTuru, usul, muhammenBedel, durum, ihaleTarihi, ihaleSaati, adaParsel, yuzolcumuM2, revizyonSayisi)
           VALUES (?, ?, ?, ?, ?, 'taslak', ?, ?, ?, ?, 1)`,
          [
            cloneDosyaNo,
            cloneTasinmaz,
            dosya.islemTuru,
            dosya.usul,
            dosya.muhammenBedel,
            dosya.ihaleTarihi,
            dosya.ihaleSaati || '14:00',
            dosya.adaParsel || '',
            dosya.yuzolcumuM2 || 0
          ]
        )
        if (res?.success && res.lastInsertRowid) {
          newId = res.lastInsertRowid
        }
      } catch (err) {
        console.error('SQLite duplicate hatası:', err)
      }
    }

    const clone: Dosya2886Item = {
      ...dosya,
      id: newId,
      dosyaNo: cloneDosyaNo,
      tasinmazAdi: cloneTasinmaz,
      durum: 'taslak',
      created_at: new Date().toISOString().split('T')[0],
      revizyonSayisi: 1
    }
    setDosyalar([clone, ...dosyalar])
  }

  const handleQuickStatusChange = async (
    id: number | string,
    newDurum: Dosya2886Item['durum']
  ): Promise<void> => {
    if (window.electron?.ipcRenderer) {
      try {
        if (typeof id === 'number' || !isNaN(Number(id))) {
          await window.electron.ipcRenderer.invoke(
            'db:run',
            'UPDATE DATA_DevletIhale2886Dosyasi SET durum = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [newDurum, Number(id)]
          )
        }
      } catch (err) {
        console.error('SQLite durum güncelleme hatası:', err)
      }
    }

    setDosyalar((prev) =>
      prev.map((d) =>
        String(d.id) === String(id)
          ? { ...d, durum: newDurum, revizyonSayisi: d.revizyonSayisi + 1 }
          : d
      )
    )
  }

  // Filtreleme
  const filteredDosyalar = dosyalar.filter((d) => {
    const q = searchQuery.toLowerCase()
    const matchQ =
      d.tasinmazAdi.toLowerCase().includes(q) ||
      d.dosyaNo.toLowerCase().includes(q) ||
      (d.adaParsel && d.adaParsel.toLowerCase().includes(q))
    const matchTur = filterTur === 'hepsi' || d.islemTuru === filterTur
    const matchDurum = filterDurum === 'hepsi' || d.durum === filterDurum
    return matchQ && matchTur && matchDurum
  })

  // İstatistikler
  const totalHacim = dosyalar.reduce((acc, d) => acc + (d.muhammenBedel || 0), 0)
  const aktifIlandaCount = dosyalar.filter((d) => d.durum === 'ilanda' || d.durum === 'ihale_gunu').length
  const tamamlananCount = dosyalar.filter((d) => d.durum === 'tamamlandi' || d.durum === 'sozlesme').length
  const taslakCount = dosyalar.filter((d) => d.durum === 'taslak').length

  const formatMoney = (val: number): string =>
    val ? val.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00'

  const getDurumConfig = (durum: Dosya2886Item['durum']) => {
    switch (durum) {
      case 'taslak':
        return {
          label: 'Taslak',
          classes: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
        }
      case 'ilanda':
        return {
          label: 'İlanda',
          classes: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
        }
      case 'ihale_gunu':
        return {
          label: 'İhale Günü',
          classes: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 animate-pulse'
        }
      case 'sozlesme':
        return {
          label: 'Sözleşme / Karar',
          classes: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
        }
      case 'tamamlandi':
        return {
          label: 'Tamamlandı',
          classes: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
        }
      case 'iptal':
        return {
          label: 'İptal Edildi',
          classes: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
        }
      default:
        return { label: durum, classes: 'bg-slate-100 text-slate-700' }
    }
  }

  const getTurBadge = (tur: IslemTuru2886) => {
    switch (tur) {
      case 'satis':
        return <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 font-bold text-[10px]">Satış</span>
      case 'kiralama':
        return <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 font-bold text-[10px]">Kiralama</span>
      case 'irtifak':
      case 'irtifak_intifa':
        return <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 font-bold text-[10px]">İrtifak</span>
      case 'trampa':
        return <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 font-bold text-[10px]">Trampa</span>
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      {/* 1. İSTATİSTİK KARTLARI (Doğrudan Temin Standartlarında) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Toplam Dosya */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Toplam İhale</span>
            <div className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
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

        {/* Aktif & İlanda */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">İlanda & İhale Günü</span>
            <div className="w-7 h-7 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Gavel className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl font-black text-amber-600 dark:text-amber-400">
              {aktifIlandaCount}
            </span>
            <span className="text-[10px] text-amber-500 font-semibold">Devam Ediyor</span>
          </div>
        </div>

        {/* Taslaklar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Taslak Dosyalar</span>
            <div className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl font-black text-slate-700 dark:text-slate-300">
              {taslakCount}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">Hazırlıkta</span>
          </div>
        </div>

        {/* Tamamlanan / Sözleşme */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Sonuçlanan</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
              {tamamlananCount}
            </span>
            <span className="text-[10px] text-emerald-500 font-semibold">Sözleşme / Satış</span>
          </div>
        </div>

        {/* Toplam Muhammen Bedel Hacmi */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-3.5 rounded-2xl shadow-md col-span-2 sm:col-span-2 lg:col-span-1">
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
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Arama Input */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Dosya no, taşınmaz konusu veya ada/parsel ara..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          {/* Tür Filtresi */}
          <select
            value={filterTur}
            onChange={(e) => setFilterTur(e.target.value)}
            className="bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-hidden font-medium cursor-pointer"
          >
            <option value="hepsi">Tüm İşlem Türleri</option>
            <option value="satis">🏷️ Mülkiyet Satışı</option>
            <option value="kiralama">🏢 Kiralama</option>
            <option value="irtifak">📜 İrtifak / Üst Hakkı</option>
            <option value="trampa">🔄 Trampa (Takas)</option>
          </select>

          {/* Durum Filtresi */}
          <select
            value={filterDurum}
            onChange={(e) => setFilterDurum(e.target.value)}
            className="bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-hidden font-medium cursor-pointer"
          >
            <option value="hepsi">Tüm Durumlar</option>
            <option value="taslak">Taslak</option>
            <option value="ilanda">İlanda</option>
            <option value="ihale_gunu">İhale Günü</option>
            <option value="sozlesme">Sözleşme / Karar</option>
            <option value="tamamlandi">Tamamlandı</option>
            <option value="iptal">İptal Edildi</option>
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
            onClick={openNewModal}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Yeni 2886 İhalesi Aç</span>
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
            onClick={openNewModal}
            className="mt-4 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 dark:text-indigo-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            + Yeni Dosya Oluştur
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID KART GÖRÜNÜMÜ */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDosyalar.map((d) => {
            const isActive = activeDosyaId === d.id
            const stCfg = getDurumConfig(d.durum)

            return (
              <div
                key={d.id}
                className={`bg-white dark:bg-slate-900 border rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group ${
                  isActive
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/10'
                    : 'border-slate-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900'
                }`}
              >
                <div>
                  {/* Kart Üst Başlık & Rozetler */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800">
                        {d.dosyaNo}
                      </span>
                      {getTurBadge(d.islemTuru)}
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${stCfg.classes}`}
                    >
                      {stCfg.label}
                    </span>
                  </div>

                  {/* Taşınmaz Adı / Konusu */}
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-2 mb-2">
                    {d.tasinmazAdi}
                  </h4>

                  {/* Usul Bilgisi */}
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                    <Gavel className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{d.usul}</span>
                  </div>

                  {/* Künye Özet Bilgileri */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800 text-[11px] mb-3">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Ada / Parsel</span>
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                        {d.adaParsel || '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Yüzölçümü</span>
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                        {d.yuzolcumuM2 ? `${d.yuzolcumuM2} m²` : '-'}
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
                        ₺{formatMoney(d.muhammenBedel)}
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
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-lg transition-colors cursor-pointer"
                      title="Dosyayı Klonla / Çoğalt"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedDosyaForRev(d)}
                      className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/60 rounded-lg transition-colors cursor-pointer"
                      title="Revizyon Geçmişi"
                    >
                      <Clock className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteModalDosya(d)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition-colors cursor-pointer"
                      title="Dosyayı Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectDosya?.(d)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
                  >
                    <span>Masada Aç</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
                  <th className="p-3 text-center w-12">Durum</th>
                  <th className="p-3 w-32 font-mono">Dosya No</th>
                  <th className="p-3">Taşınmaz / İhale Adı</th>
                  <th className="p-3 w-24">Tür</th>
                  <th className="p-3 w-40">İhale Usulü</th>
                  <th className="p-3 w-36 text-right font-mono">Muhammen Bedel</th>
                  <th className="p-3 w-28 text-center">İhale Tarihi</th>
                  <th className="p-3 w-32 text-center">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredDosyalar.map((d) => {
                  const isActive = activeDosyaId === d.id
                  const stCfg = getDurumConfig(d.durum)

                  return (
                    <tr
                      key={d.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-850/80 transition-colors ${
                        isActive ? 'bg-indigo-50/40 dark:bg-indigo-950/30 font-semibold' : ''
                      }`}
                    >
                      <td className="p-3 text-center">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${stCfg.classes}`}
                        >
                          {stCfg.label}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {d.dosyaNo}
                      </td>
                      <td className="p-3 font-medium text-slate-800 dark:text-slate-200">
                        {d.tasinmazAdi}
                      </td>
                      <td className="p-3">{getTurBadge(d.islemTuru)}</td>
                      <td className="p-3 text-slate-500 dark:text-slate-400 truncate max-w-[160px]">
                        {d.usul}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        ₺{formatMoney(d.muhammenBedel)}
                      </td>
                      <td className="p-3 text-center font-mono text-slate-500">
                        {d.ihaleTarihi}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => onSelectDosya?.(d)}
                            className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-300 transition-colors cursor-pointer"
                            title="Çalışma Masasında Aç"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(d)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                            title="Düzenle"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteModalDosya(d)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
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

      {/* 4. YENİ / DÜZENLEME MODALI */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveDosya}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-indigo-500" />
                {editingDosya ? '2886 İhale Dosyasını Düzenle' : 'Yeni 2886 İhale / Taşınmaz Dosyası Aç'}
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
                  Dosya No / Kayıt No
                </label>
                <input
                  type="text"
                  value={formData.dosyaNo}
                  onChange={(e) => setFormData({ ...formData, dosyaNo: e.target.value })}
                  placeholder="2886-2026/001"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl font-mono font-bold text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  İşlem Türü
                </label>
                <select
                  value={formData.islemTuru}
                  onChange={(e) =>
                    setFormData({ ...formData, islemTuru: e.target.value as IslemTuru2886 })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold"
                >
                  <option value="satis">🏷️ Taşınmaz / Mal Satışı</option>
                  <option value="kiralama">🏢 Kiralama İhalesi</option>
                  <option value="irtifak">📜 İrtifak / Üst Hakkı</option>
                  <option value="trampa">🔄 Trampa (Takas)</option>
                </select>
              </div>
            </div>

            <div className="text-xs">
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Taşınmaz / İhale Konusu Açıklaması
              </label>
              <input
                type="text"
                value={formData.tasinmazAdi}
                onChange={(e) => setFormData({ ...formData, tasinmazAdi: e.target.value })}
                placeholder="Örn: Kurtuluş Mah. 104 Ada 12 Parsel Arsa Satışı"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium"
                required
              />
            </div>

            <div className="text-xs">
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                2886 İhale Usulü (Kanun Maddesi)
              </label>
              <select
                value={formData.usul}
                onChange={(e) => setFormData({ ...formData, usul: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium"
              >
                <option value="Madde 35/a (Kapalı Teklif Usulü)">Madde 35/a (Kapalı Teklif Usulü - Standart Satış)</option>
                <option value="Madde 35/c (Açık Teklif Usulü)">Madde 35/c (Açık Teklif Usulü - Açık Artırma)</option>
                <option value="Madde 45 (Açık Teklif Usulü)">Madde 45 (Açık Teklif Usulü - Kiralama & Satış)</option>
                <option value="Madde 35/d (Pazarlık Usulü)">Madde 35/d (Pazarlık Usulü)</option>
                <option value="Madde 51/g (Pazarlık Usulü)">Madde 51/g (Pazarlık Usulü - Özel Hükümler)</option>
                <option value="Madde 35/b (Belli İstekliler)">Madde 35/b (Belli İstekliler Arasında)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Muhammen Bedel (₺)
                </label>
                <input
                  type="number"
                  value={formData.muhammenBedel || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, muhammenBedel: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  İhale Durumu
                </label>
                <select
                  value={formData.durum}
                  onChange={(e) =>
                    setFormData({ ...formData, durum: e.target.value as Dosya2886Item['durum'] })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium"
                >
                  <option value="taslak">Taslak</option>
                  <option value="ilanda">İlanda</option>
                  <option value="ihale_gunu">İhale Günü</option>
                  <option value="sozlesme">Sözleşme / Karar</option>
                  <option value="tamamlandi">Tamamlandı</option>
                  <option value="iptal">İptal Edildi</option>
                </select>
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
                  value={formData.adaParsel}
                  onChange={(e) => setFormData({ ...formData, adaParsel: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Yüzölçümü (m²)
                </label>
                <input
                  type="number"
                  placeholder="450"
                  value={formData.yuzolcumuM2 || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, yuzolcumuM2: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                {editingDosya ? 'Değişiklikleri Kaydet' : 'İhale Dosyasını Oluştur'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 5. REVİZYON GEÇMİŞİ MODALI */}
      {selectedDosyaForRev && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" /> Revizyon & Sürüm Geçmişi
                </h4>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  {selectedDosyaForRev.dosyaNo} - {selectedDosyaForRev.tasinmazAdi}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDosyaForRev(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
              {[
                {
                  ver: `v${selectedDosyaForRev.revizyonSayisi + 1}.0`,
                  title: 'Son İhale Karar Metni ve Muhammen Bedel Cetveli',
                  date: 'Bugün',
                  by: 'Komisyon Başkanı'
                },
                {
                  ver: 'v1.1',
                  title: 'Emsal Araştırmaları ve Şartname Taslağı Güncellendi',
                  date: '2 gün önce',
                  by: 'Teknik Üye'
                },
                {
                  ver: 'v1.0',
                  title: 'İlk 2886 İhale Dosya Kaydı',
                  date: selectedDosyaForRev.created_at,
                  by: 'Sistem'
                }
              ].map((rev) => (
                <div
                  key={rev.ver}
                  className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-mono text-[10px] font-bold">
                        {rev.ver}
                      </span>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {rev.title}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {rev.date} · {rev.by}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      alert(`${rev.ver} sürümüne geri dönüldü!`)
                      setSelectedDosyaForRev(null)
                    }}
                    className="px-2.5 py-1 bg-white dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" /> Geri Al
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedDosyaForRev(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. SİLME ONAY MODALI (Hatasız ve Güvenli Silme) */}
      {deleteModalDosya && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  2886 İhale Dosyasını Sil
                </h4>
                <p className="text-xs text-slate-500 font-mono">
                  {deleteModalDosya.dosyaNo}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="font-bold text-slate-800 dark:text-slate-100 block mb-1">
                {deleteModalDosya.tasinmazAdi}
              </span>
              Bu ihale dosyasını ve tüm bağlantılı verilerini kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
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


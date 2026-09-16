import React, { useState, useEffect } from 'react'
import { emitAppEvent, useAppEventListener } from '../../../../../utils/appEvents'

export interface UseMalzemeListesiReturn {
  items: any[]
  units: any[]
  libraryItems: any[]
  loading: boolean
  kalemAdi: string
  setKalemAdi: React.Dispatch<React.SetStateAction<string>>
  tasinirKodu: string
  setTasinirKodu: React.Dispatch<React.SetStateAction<string>>
  okasKodu: string
  setOkasKodu: React.Dispatch<React.SetStateAction<string>>
  tipi: string
  setTipi: React.Dispatch<React.SetStateAction<string>>
  birim: string
  setBirim: React.Dispatch<React.SetStateAction<string>>
  miktar: number
  setMiktar: React.Dispatch<React.SetStateAction<number>>
  kdvOrani: number
  setKdvOrani: React.Dispatch<React.SetStateAction<number>>
  aciklama: string
  setAciklama: React.Dispatch<React.SetStateAction<string>>
  searchQuery: string
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>
  showSuggestions: boolean
  setShowSuggestions: React.Dispatch<React.SetStateAction<boolean>>
  aiLoading: boolean
  isAddModalOpen: boolean
  setIsAddModalOpen: React.Dispatch<React.SetStateAction<boolean>>
  activeTab: 'library' | 'new' | 'batch'
  setActiveTab: React.Dispatch<React.SetStateAction<'library' | 'new' | 'batch'>>
  selectedItemIds: Set<number>
  setSelectedItemIds: React.Dispatch<React.SetStateAction<Set<number>>>
  itemMiktarlar: Record<number, number>
  setItemMiktarlar: React.Dispatch<React.SetStateAction<Record<number, number>>>
  libSearchQuery: string
  setLibSearchQuery: React.Dispatch<React.SetStateAction<string>>
  editingId: number | null
  setEditingId: React.Dispatch<React.SetStateAction<number | null>>
  editMiktar: number
  setEditMiktar: React.Dispatch<React.SetStateAction<number>>
  editBirim: string
  setEditBirim: React.Dispatch<React.SetStateAction<string>>
  editKdv: number
  setEditKdv: React.Dispatch<React.SetStateAction<number>>
  handleAiAçiklama: () => Promise<void>
  handleSelectSuggestion: (item: any) => void
  handleAddItem: (e: React.FormEvent) => Promise<void>
  handleDeleteItem: (id: number) => Promise<void>
  handleStartEdit: (item: any) => void
  handleSaveEdit: (id: number) => Promise<void>
  handleAddSelected: () => Promise<void>
  handleBatchInsertItems: (
    commonData: {
      tipi: string
      okas_kodu?: string
      tasinir_kodu_prefix?: string
      kdv_orani: number
      birim: string
    },
    rows: Array<{
      id: string
      kalem_adi: string
      miktar: number
      birim?: string
      tasinir_kodu?: string
      okas_kodu?: string
      kdv_orani?: number
      aciklama?: string
    }>
  ) => Promise<boolean>
  filteredSuggestions: any[]
  loadData: () => Promise<void>
}

export function useMalzemeListesi(
  activeDosyaId: number | null,
  activeDosya?: any
): UseMalzemeListesiReturn {
  const isYapim =
    activeDosya?.tur === 'yapim_isi' ||
    activeDosya?.tur === 'yapim' ||
    activeDosya?.ihale_tipi === 'Hakediş'
  const isHizmet = activeDosya?.tur === 'hizmet'
  const defaultTipi = isYapim ? 'Yapım' : isHizmet ? 'Hizmet' : 'Mal'

  const [items, setItems] = useState<any[]>([])
  const [units, setUnits] = useState<any[]>([])
  const [libraryItems, setLibraryItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Form states
  const [kalemAdi, setKalemAdi] = useState('')
  const [tasinirKodu, setTasinirKodu] = useState('')
  const [okasKodu, setOkasKodu] = useState('')
  const [tipi, setTipi] = useState(defaultTipi)
  const [birim, setBirim] = useState(isYapim ? 'm²' : 'Adet')
  const [miktar, setMiktar] = useState(1)
  const [kdvOrani, setKdvOrani] = useState(20)
  const [aciklama, setAciklama] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'library' | 'new' | 'batch'>('library')
  const [selectedItemIds, setSelectedItemIds] = useState<Set<number>>(new Set())
  const [itemMiktarlar, setItemMiktarlar] = useState<Record<number, number>>({})
  const [libSearchQuery, setLibSearchQuery] = useState('')

  // Edit states
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editMiktar, setEditMiktar] = useState(1)
  const [editBirim, setEditBirim] = useState('')
  const [editKdv, setEditKdv] = useState(20)

  // Dosya türü değiştiğinde tipi ve birim varsayılanlarını güncelle
  useEffect(() => {
    setTipi(defaultTipi)
    if (isYapim) {
      setBirim('m²')
    } else {
      setBirim('Adet')
    }
  }, [activeDosyaId, activeDosya?.tur])

  const loadData = async (): Promise<void> => {
    if (!activeDosyaId) return
    setLoading(true)
    try {
      const resItems = await (window as any).electron.ipcRenderer.invoke(
        'db:query',
        'SELECT * FROM DATA_TeminKalem WHERE temin_dosya_id = ? ORDER BY id ASC',
        [activeDosyaId]
      )
      const resUnits = await (window as any).electron.ipcRenderer.invoke(
        'db:query',
        'SELECT ad FROM TANIM_OlcuBirimi WHERE aktif_mi = 1 ORDER BY ad ASC'
      )
      const resLib = await (window as any).electron.ipcRenderer.invoke(
        'db:query',
        'SELECT * FROM TANIM_Kalem WHERE aktif_mi = 1 ORDER BY kalem_adi ASC'
      )
      if (resItems.success) setItems(resItems.data || [])
      if (resUnits.success) setUnits(resUnits.data || [])
      if (resLib.success) setLibraryItems(resLib.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [activeDosyaId])

  useAppEventListener(['items:changed', 'dossier:updated'], (e) => {
    if (e.payload?.dosyaId === activeDosyaId) {
      loadData()
    }
  })

  const handleAiAçiklama = async (): Promise<void> => {
    const name = kalemAdi.trim() || searchQuery.trim()
    if (!name) return
    setAiLoading(true)
    try {
      let prompt = ''
      if (isYapim) {
        prompt = `Kamu İhale Kanunu ve Çevre, Şehircilik ve İklim Değişikliği Bakanlığı standartlarına uygun bir Yapım / Küçük Onarım İşi için "${name}" imalat/poz kalemi tanımlanmaktadır. Bu imalat için resmi poz tarifi, kullanılacak malzeme standartları (TSE/CE), uygulama ve montaj esaslarını içeren kısa, net ve profesyonel bir teknik şartname/imalat tarifi metni yazar mısın? Sadece metni döndür.`
      } else if (isHizmet) {
        prompt = `Kamu İhale Kanunu ve Hizmet İşleri Genel Şartnamesi uyarınca bir kamu kurumunda "${name}" hizmeti alımı yapılacaktır. Bu hizmetin kapsamını, periyodik çalışma şartlarını, personel/araç yeterliliklerini ve teslimat esaslarını belirten kısa ve öz profesyonel bir teknik şartname metni yazar mısın? Sadece metni ver.`
      } else {
        prompt = `Bir kamu ihalesinde "${name}" malzemesi/ürünü alınacaktır. Bu alım için teknik şartnameye yazılabilecek, genel teknik standartları belirten, ürünün özelliklerini açıklayan kısa ve öz profesyonel bir metin yazar mısın? Sadece metni ver, başına sonuna bir şey ekleme.`
      }

      const res = await (window as any).electron.ipcRenderer.invoke('ai:generate', {
        prompt
      })
      if (res.success && res.data) {
        setAciklama(res.data)
      } else {
        alert('AI hatası: ' + (res.error || 'Bilinmeyen hata'))
      }
    } catch (err: any) {
      alert('AI Hatası: ' + err.message)
    } finally {
      setAiLoading(false)
    }
  }

  const handleSelectSuggestion = (item: any): void => {
    setKalemAdi(item.kalem_adi)
    setTasinirKodu(item.tasinir_kodu || '')
    setOkasKodu(item.okas_kodu || '')
    setTipi(item.tipi || 'Mal')
    setBirim(item.birim || 'Adet')
    setKdvOrani(item.kdv_orani || 20)
    setSearchQuery(item.kalem_adi)
    setShowSuggestions(false)
  }

  const handleAddItem = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    const nameToUse = kalemAdi.trim() || searchQuery.trim()
    if (!nameToUse) return

    try {
      const checkRes = await (window as any).electron.ipcRenderer.invoke(
        'db:query',
        'SELECT id FROM TANIM_Kalem WHERE kalem_adi = ? LIMIT 1',
        [nameToUse]
      )

      if (checkRes.success && checkRes.data.length === 0) {
        await (window as any).electron.ipcRenderer.invoke(
          'db:run',
          `INSERT INTO TANIM_Kalem (kalem_adi, tipi, birim, kdv_orani, tasinir_kodu, okas_kodu, aktif_mi, barkod_id)
           VALUES (?, ?, ?, ?, ?, ?, 1, ?)`,
          [
            nameToUse,
            tipi,
            birim,
            kdvOrani,
            tasinirKodu || null,
            okasKodu || null,
            Date.now().toString()
          ]
        )
      }

      const res = await (window as any).electron.ipcRenderer.invoke(
        'db:run',
        `INSERT INTO DATA_TeminKalem 
         (temin_dosya_id, tasinir_kodu, okas_kodu, kalem_adi, tipi, birim, miktar, kdv_orani, aciklama) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          activeDosyaId,
          tasinirKodu || null,
          okasKodu || null,
          nameToUse,
          tipi,
          birim,
          miktar,
          kdvOrani,
          aciklama || null
        ]
      )
      if (res.success) {
        setKalemAdi('')
        setSearchQuery('')
        setTasinirKodu('')
        setOkasKodu('')
        setTipi('Mal')
        setBirim('Adet')
        setMiktar(1)
        setKdvOrani(20)
        setAciklama('')
        setIsAddModalOpen(false)
        await loadData()
        emitAppEvent('items:changed', { dosyaId: activeDosyaId })
        emitAppEvent('dossier:updated', { dosyaId: activeDosyaId })
      } else {
        alert('Kalem eklenirken hata: ' + res.error)
      }
    } catch (err: any) {
      alert('Kalem eklenirken hata: ' + err.message)
    }
  }

  const handleDeleteItem = async (id: number): Promise<void> => {
    if (!confirm('Bu kalemi silmek istediğinize emin misiniz?')) return
    try {
      const res = await (window as any).electron.ipcRenderer.invoke(
        'db:run',
        'DELETE FROM DATA_TeminKalem WHERE id = ?',
        [id]
      )
      if (res.success) {
        await loadData()
        emitAppEvent('items:changed', { dosyaId: activeDosyaId })
        emitAppEvent('dossier:updated', { dosyaId: activeDosyaId })
      }
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleStartEdit = (item: any): void => {
    setEditingId(item.id)
    setEditMiktar(item.miktar)
    setEditBirim(item.birim)
    setEditKdv(item.kdv_orani)
  }

  const handleSaveEdit = async (id: number): Promise<void> => {
    try {
      const res = await (window as any).electron.ipcRenderer.invoke(
        'db:run',
        'UPDATE DATA_TeminKalem SET miktar = ?, birim = ?, kdv_orani = ? WHERE id = ?',
        [editMiktar, editBirim, editKdv, id]
      )
      if (res.success) {
        setEditingId(null)
        await loadData()
        emitAppEvent('items:changed', { dosyaId: activeDosyaId })
        emitAppEvent('dossier:updated', { dosyaId: activeDosyaId })
      } else {
        alert(res.error)
      }
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleAddSelected = async (): Promise<void> => {
    const ids = Array.from(selectedItemIds)
    if (ids.length === 0) return
    try {
      for (const id of ids) {
        const libItem = libraryItems.find((l) => l.id === id)
        if (!libItem) continue
        const mkt = itemMiktarlar[id] ?? 1
        await (window as any).electron.ipcRenderer.invoke(
          'db:run',
          `INSERT INTO DATA_TeminKalem
           (temin_dosya_id, tasinir_kodu, okas_kodu, kalem_adi, tipi, birim, miktar, kdv_orani)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            activeDosyaId,
            libItem.tasinir_kodu || null,
            libItem.okas_kodu || null,
            libItem.kalem_adi,
            libItem.tipi,
            libItem.birim,
            mkt,
            libItem.kdv_orani
          ]
        )
      }
      setSelectedItemIds(new Set())
      setItemMiktarlar({})
      setLibSearchQuery('')
      setIsAddModalOpen(false)
      await loadData()
      emitAppEvent('items:changed', { dosyaId: activeDosyaId })
      emitAppEvent('dossier:updated', { dosyaId: activeDosyaId })
    } catch (err: any) {
      alert('Eklenirken hata: ' + err.message)
    }
  }

  const handleBatchInsertItems = async (
    commonData: {
      tipi: string
      okas_kodu?: string
      tasinir_kodu_prefix?: string
      kdv_orani: number
      birim: string
    },
    rows: Array<{
      id: string
      kalem_adi: string
      miktar: number
      birim?: string
      tasinir_kodu?: string
      okas_kodu?: string
      kdv_orani?: number
      aciklama?: string
    }>
  ): Promise<boolean> => {
    const validRows = rows.filter((r) => r.kalem_adi && r.kalem_adi.trim().length > 0)
    if (validRows.length === 0) return false

    try {
      for (const row of validRows) {
        const name = row.kalem_adi.trim()
        const rowTipi = (row as any).tipi || commonData.tipi || 'Mal'
        const rowTasinir = row.tasinir_kodu?.trim() || commonData.tasinir_kodu_prefix || null
        const rowOkas = row.okas_kodu?.trim() || commonData.okas_kodu || null
        const rowBirim = row.birim || commonData.birim || 'Adet'
        const rowKdv = row.kdv_orani !== undefined ? row.kdv_orani : commonData.kdv_orani
        const rowMiktar = row.miktar > 0 ? row.miktar : 1
        const rowAciklama = row.aciklama?.trim() || null

        // TANIM_Kalem kontrol ve ekleme
        const checkRes = await (window as any).electron.ipcRenderer.invoke(
          'db:query',
          'SELECT id FROM TANIM_Kalem WHERE kalem_adi = ? LIMIT 1',
          [name]
        )
        if (checkRes.success && checkRes.data.length === 0) {
          await (window as any).electron.ipcRenderer.invoke(
            'db:run',
            `INSERT INTO TANIM_Kalem (kalem_adi, tipi, birim, kdv_orani, tasinir_kodu, okas_kodu, aktif_mi, barkod_id)
             VALUES (?, ?, ?, ?, ?, ?, 1, ?)`,
            [
              name,
              rowTipi,
              rowBirim,
              rowKdv,
              rowTasinir,
              rowOkas,
              Date.now().toString() + Math.floor(Math.random() * 1000)
            ]
          )
        }

        // Aktif dosya varsa DATA_TeminKalem'e de ekle
        if (activeDosyaId) {
          await (window as any).electron.ipcRenderer.invoke(
            'db:run',
            `INSERT INTO DATA_TeminKalem
             (temin_dosya_id, tasinir_kodu, okas_kodu, kalem_adi, tipi, birim, miktar, kdv_orani, aciklama)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              activeDosyaId,
              rowTasinir,
              rowOkas,
              name,
              rowTipi,
              rowBirim,
              rowMiktar,
              rowKdv,
              rowAciklama
            ]
          )
        }
      }

      await loadData()
      if (activeDosyaId) {
        emitAppEvent('items:changed', { dosyaId: activeDosyaId })
        emitAppEvent('dossier:updated', { dosyaId: activeDosyaId })
      }
      setIsAddModalOpen(false)
      return true
    } catch (err: any) {
      console.error('Batch insert error:', err)
      alert('Toplu ekleme sırasında hata oluştu: ' + err.message)
      return false
    }
  }

  const filteredSuggestions = searchQuery.trim()
    ? libraryItems
        .filter((item) => item.kalem_adi.toLowerCase().includes(searchQuery.toLowerCase()))
        .slice(0, 5)
    : []

  return {
    items,
    units,
    libraryItems,
    loading,
    kalemAdi,
    setKalemAdi,
    tasinirKodu,
    setTasinirKodu,
    okasKodu,
    setOkasKodu,
    tipi,
    setTipi,
    birim,
    setBirim,
    miktar,
    setMiktar,
    kdvOrani,
    setKdvOrani,
    aciklama,
    setAciklama,
    searchQuery,
    setSearchQuery,
    showSuggestions,
    setShowSuggestions,
    aiLoading,
    isAddModalOpen,
    setIsAddModalOpen,
    activeTab,
    setActiveTab,
    selectedItemIds,
    setSelectedItemIds,
    itemMiktarlar,
    setItemMiktarlar,
    libSearchQuery,
    setLibSearchQuery,
    editingId,
    setEditingId,
    editMiktar,
    setEditMiktar,
    editBirim,
    setEditBirim,
    editKdv,
    setEditKdv,
    handleAiAçiklama,
    handleSelectSuggestion,
    handleAddItem,
    handleDeleteItem,
    handleStartEdit,
    handleSaveEdit,
    handleAddSelected,
    handleBatchInsertItems,
    filteredSuggestions,
    loadData
  }
}

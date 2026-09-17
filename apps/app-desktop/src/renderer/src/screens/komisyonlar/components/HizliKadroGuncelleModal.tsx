import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronDown,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  X
} from 'lucide-react'
import { Modal } from '../../../components/ui/Modal'
import { Button } from '../../../components/ui/Button'

interface PersonelItem {
  id: number
  ad_soyad: string
  unvan: string | null
  birim?: string | null
}

interface GorevItem {
  id: number
  ad: string
}

interface MemberRow {
  id: string | number // temporary UI key or DB id
  dbUyeId?: number | null
  gorevId: number | null
  gorevAd: string
  personelId: number | null
  asilMi: number // 1: Asil, 0: Yedek
}

interface HizliKadroGuncelleModalProps {
  isOpen: boolean
  onClose: () => void
  komisyonId: number | null
  komisyonAdi?: string
  activeDosyaId?: number | null
}

const DEFAULT_YAKLASIK_ROLES = [
  { ad: 'Fiyat Araştırma Görevlisi', asil: 1 },
  { ad: 'Fiyat Araştırma Görevlisi', asil: 1 },
  { ad: 'Fiyat Araştırma Görevlisi', asil: 1 },
  { ad: 'Fiyat Araştırma Görevlisi', asil: 0 }
]

const DEFAULT_MUAYENE_ROLES = [
  { ad: 'Komisyon Başkanı', asil: 1 },
  { ad: 'Üye', asil: 1 },
  { ad: 'Üye', asil: 1 },
  { ad: 'Yedek Üye', asil: 0 },
  { ad: 'Yedek Üye', asil: 0 }
]

export function HizliKadroGuncelleModal({
  isOpen,
  onClose,
  komisyonId,
  komisyonAdi = 'Komisyon',
  activeDosyaId
}: HizliKadroGuncelleModalProps): React.JSX.Element | null {
  const queryClient = useQueryClient()
  const [rows, setRows] = useState<MemberRow[]>([])
  const [syncToActiveFile, setSyncToActiveFile] = useState(true)
  const [searchPersonelTerm, setSearchPersonelTerm] = useState('')
  const [activeDropdownRowId, setActiveDropdownRowId] = useState<string | number | null>(null)
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // 1. Personel Listesi
  const { data: personeller = [] } = useQuery<PersonelItem[]>({
    queryKey: ['tum_personel_hizli_kadro'],
    queryFn: async () => {
      const res = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT id, ad_soyad, unvan, birim FROM TANIM_Personel WHERE COALESCE(aktif_mi, 1) = 1 ORDER BY ad_soyad ASC'
      )
      if (res && res.success && Array.isArray(res.data)) {
        return res.data
      }
      return []
    },
    enabled: isOpen
  })

  // 2. Görev Tanımları
  const { data: gorevler = [] } = useQuery<GorevItem[]>({
    queryKey: ['tum_gorevler_hizli_kadro'],
    queryFn: async () => {
      const res = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT id, ad FROM TANIM_KomisyonGorevi WHERE COALESCE(aktif_mi, 1) = 1 ORDER BY id ASC'
      )
      if (res && res.success && Array.isArray(res.data)) {
        return res.data
      }
      return []
    },
    enabled: isOpen
  })

  // 3. Komisyon Mevcut Üyelerini Yükle
  useEffect(() => {
    if (!isOpen || !komisyonId) return

    let isMounted = true
    setStatusMessage(null)

    const fetchCurrentMembers = async () => {
      try {
        const res = await window.electron.ipcRenderer.invoke(
          'db:query',
          `SELECT u.id as db_id, u.komisyon_id, u.personel_id, u.gorev_id, u.asil_mi,
                  p.ad_soyad, p.unvan, g.ad as gorev_adi
           FROM TANIM_KomisyonUye u
           LEFT JOIN TANIM_Personel p ON u.personel_id = p.id
           LEFT JOIN TANIM_KomisyonGorevi g ON u.gorev_id = g.id
           WHERE u.komisyon_id = ?
           ORDER BY u.id ASC`,
          [komisyonId]
        )

        if (isMounted) {
          if (res.success && res.data && res.data.length > 0) {
            const mapped: MemberRow[] = res.data.map((m: any) => ({
              id: m.db_id,
              dbUyeId: m.db_id,
              gorevId: m.gorev_id || null,
              gorevAd: m.gorev_adi || 'Üye',
              personelId: m.personel_id || null,
              asilMi: m.asil_mi ?? 1
            }))
            setRows(mapped)
          } else {
            // Eğer üye yoksa komisyon tipine göre varsayılan boş satırlar aç
            const lower = komisyonAdi.toLowerCase()
            const isMaliyet = lower.includes('maliyet') || lower.includes('fiyat') || komisyonId === 1
            const defaultTemplate = isMaliyet ? DEFAULT_YAKLASIK_ROLES : DEFAULT_MUAYENE_ROLES
            
            const initialRows: MemberRow[] = defaultTemplate.map((t, idx) => ({
              id: `init_${Date.now()}_${idx}`,
              dbUyeId: null,
              gorevId: null,
              gorevAd: t.ad,
              personelId: null,
              asilMi: t.asil
            }))
            setRows(initialRows)
          }
        }
      } catch (err) {
        console.error('Komisyon üyeleri çekilirken hata:', err)
      }
    }

    fetchCurrentMembers()

    return () => {
      isMounted = false
    }
  }, [isOpen, komisyonId, komisyonAdi])

  // Satır Ekleme
  const handleAddRow = (gorevAd = 'Üye', asil = 1) => {
    const matchedGorev = gorevler.find((g) => g.ad.toLowerCase() === gorevAd.toLowerCase())
    const newRow: MemberRow = {
      id: `new_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      dbUyeId: null,
      gorevId: matchedGorev ? matchedGorev.id : null,
      gorevAd: gorevAd,
      personelId: null,
      asilMi: asil
    }
    setRows((prev) => [...prev, newRow])
  }

  // Satır Silme
  const handleRemoveRow = (id: string | number) => {
    setRows((prev) => prev.filter((r) => r.id !== id))
  }

  // Personel Değiştirme
  const handleSelectPersonel = (rowId: string | number, pId: number | null) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id === rowId) {
          return { ...r, personelId: pId }
        }
        return r
      })
    )
    setActiveDropdownRowId(null)
    setSearchPersonelTerm('')
  }

  // Görev Değiştirme
  const handleSelectGorev = (rowId: string | number, gorevAd: string, gorevId: number | null) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id === rowId) {
          return { ...r, gorevAd, gorevId }
        }
        return r
      })
    )
  }

  // Asil / Yedek Değiştirme
  const handleToggleAsil = (rowId: string | number) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id === rowId) {
          return { ...r, asilMi: r.asilMi === 1 ? 0 : 1 }
        }
        return r
      })
    )
  }

  // Standart Kadro Şablonunu Yükle
  const handleLoadStandardTemplate = () => {
    const lower = komisyonAdi.toLowerCase()
    const isMaliyet = lower.includes('maliyet') || lower.includes('fiyat') || komisyonId === 1
    const defaultTemplate = isMaliyet ? DEFAULT_YAKLASIK_ROLES : DEFAULT_MUAYENE_ROLES

    const newRows: MemberRow[] = defaultTemplate.map((t, idx) => {
      const matchedG = gorevler.find((g) => g.ad.toLowerCase() === t.ad.toLowerCase())
      return {
        id: `tpl_${Date.now()}_${idx}`,
        dbUyeId: null,
        gorevId: matchedG ? matchedG.id : null,
        gorevAd: t.ad,
        personelId: rows[idx]?.personelId || null,
        asilMi: t.asil
      }
    })
    setRows(newRows)
  }

  // Kaydetme Mutasyonu
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!komisyonId) throw new Error('Komisyon kimliği bulunamadı.')

      // 1. Görev isimlerinin TANIM_KomisyonGorevi'de varlığından emin ol
      for (const row of rows) {
        if (!row.gorevId && row.gorevAd) {
          const findG = gorevler.find((g) => g.ad.toLowerCase() === row.gorevAd.toLowerCase())
          if (findG) {
            row.gorevId = findG.id
          } else {
            const insRes = await window.electron.ipcRenderer.invoke(
              'db:run',
              'INSERT INTO TANIM_KomisyonGorevi (ad, aktif_mi) VALUES (?, 1)',
              [row.gorevAd]
            )
            if (insRes && insRes.lastInsertRowid) {
              row.gorevId = insRes.lastInsertRowid
            }
          }
        }
      }

      // 2. TANIM_KomisyonUye tablosundaki bu komisyona ait eski kayıtları temizle ve yenilerini ekle
      await window.electron.ipcRenderer.invoke(
        'db:run',
        'DELETE FROM TANIM_KomisyonUye WHERE komisyon_id = ?',
        [komisyonId]
      )

      for (let i = 0; i < rows.length; i++) {
        const r = rows[i]
        const fallbackGorevId = r.gorevId || 1
        await window.electron.ipcRenderer.invoke(
          'db:run',
          'INSERT INTO TANIM_KomisyonUye (komisyon_id, gorev_id, personel_id, asil_mi, sira) VALUES (?, ?, ?, ?, ?)',
          [komisyonId, fallbackGorevId, r.personelId || null, r.asilMi, i + 1]
        )
      }

      // 3. Eğer açık bir aktif dosya varsa ve senkronizasyon seçildiyse DATA_TeminKomisyon'u da güncelle
      if (syncToActiveFile && activeDosyaId) {
        const lower = komisyonAdi.toLowerCase()
        const isMaliyet = lower.includes('maliyet') || lower.includes('fiyat') || komisyonId === 1

        // Dosyadaki bu komisyon tipini temizle
        await window.electron.ipcRenderer.invoke(
          'db:run',
          isMaliyet
            ? `DELETE FROM DATA_TeminKomisyon 
               WHERE temin_dosya_id = ? AND (komisyon_id = ? OR komisyon_id = 1 OR LOWER(komisyon_turu) LIKE '%maliyet%' OR LOWER(komisyon_turu) LIKE '%fiyat%')`
            : `DELETE FROM DATA_TeminKomisyon 
               WHERE temin_dosya_id = ? AND (komisyon_id = ? OR komisyon_id = 2 OR LOWER(komisyon_turu) LIKE '%muayene%' OR LOWER(komisyon_turu) LIKE '%kabul%')`,
          [activeDosyaId, komisyonId]
        )

        // Yeni personelleri dosyaya ekle
        for (const r of rows) {
          if (r.personelId) {
            const p = personeller.find((item) => item.id === r.personelId)
            if (p) {
              const rol = r.asilMi === 0 ? 'Yedek Üye' : r.gorevAd.toLowerCase().includes('başkan') ? 'Başkan' : 'Üye'
              await window.electron.ipcRenderer.invoke(
                'db:run',
                `INSERT INTO DATA_TeminKomisyon 
                 (temin_dosya_id, komisyon_id, personel_id, ad_soyad, unvan, gorev, rol, komisyon_turu)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                  activeDosyaId,
                  komisyonId,
                  p.id,
                  p.ad_soyad,
                  p.unvan || '',
                  r.gorevAd,
                  rol,
                  komisyonAdi
                ]
              )
            }
          }
        }
      }

      return true
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['komisyonlar'] })
      queryClient.invalidateQueries({ queryKey: ['komisyon_detay', komisyonId] })
      queryClient.invalidateQueries({ queryKey: ['dosya_komisyonlar'] })
      setStatusMessage({ type: 'success', text: 'Komisyon kadrosu başarıyla güncellendi.' })
      setTimeout(() => {
        onClose()
      }, 700)
    },
    onError: (err: any) => {
      setStatusMessage({ type: 'error', text: 'Kaydedilirken hata oluştu: ' + err.message })
    }
  })

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Kadro & Üye Güncelle: ${komisyonAdi}`}
      description="Komisyon asil ve yedek görevlilerini hızlıca atayabilir ve düzenleyebilirsiniz."
      className="max-w-4xl"
    >
      <div className="flex flex-col max-h-[75vh] -mx-6 -my-4 px-6 py-4">
        {/* Bildirim Alanı */}
        {statusMessage && (
          <div
            className={`mb-4 p-3.5 rounded-xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in duration-200 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Üst Hızlı Kontroller */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-600" />
              Toplam Kadro: <span className="text-blue-600 font-mono">{rows.length} Kişi</span>
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              {rows.filter((r) => r.asilMi === 1 && r.personelId).length} Asil Atandı
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
              {rows.filter((r) => r.asilMi === 0 && r.personelId).length} Yedek Atandı
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLoadStandardTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-all shadow-2xs cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-500" />
              Standart Kadro Yükle
            </button>
            <button
              type="button"
              onClick={() => handleAddRow('Üye', 1)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-800 rounded-xl transition-all shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Üye Ekle
            </button>
          </div>
        </div>

        {/* Tablo / Kadro Listesi Container */}
        <div className="flex-1 overflow-y-auto custom-scrollbar border border-slate-200 dark:border-slate-800 rounded-2xl divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-slate-900">
          {rows.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              Henüz görevli veya üye atanmamış. Yukarıdaki "Üye Ekle" veya "Standart Kadro Yükle" butonuna tıklayabilirsiniz.
            </div>
          ) : (
            rows.map((row, index) => {
              const assignedPerson = personeller.find((p) => p.id === row.personelId)
              const isDropdownOpen = activeDropdownRowId === row.id

              const filteredPersoneller = personeller.filter((p) =>
                p.ad_soyad.toLowerCase().includes(searchPersonelTerm.toLowerCase()) ||
                (p.unvan && p.unvan.toLowerCase().includes(searchPersonelTerm.toLowerCase()))
              )

              return (
                <div
                  key={row.id}
                  className="p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {/* Sıra & Görev Seçimi */}
                  <div className="flex items-center gap-2.5 min-w-[220px]">
                    <span className="w-6 h-6 shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-mono font-bold flex items-center justify-center">
                      {index + 1}
                    </span>

                    {/* Görev / Rol Select */}
                    <div className="relative flex-1">
                      <select
                        value={row.gorevAd}
                        onChange={(e) => {
                          const val = e.target.value
                          const matched = gorevler.find((g) => g.ad === val)
                          handleSelectGorev(row.id, val, matched ? matched.id : null)
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
                      >
                        {gorevler.length > 0 ? (
                          gorevler.map((g) => (
                            <option key={g.id} value={g.ad}>
                              {g.ad}
                            </option>
                          ))
                        ) : (
                          <>
                            <option value="Komisyon Başkanı">Komisyon Başkanı</option>
                            <option value="Fiyat Araştırma Görevlisi">Fiyat Araştırma Görevlisi</option>
                            <option value="Üye">Üye</option>
                            <option value="Yedek Üye">Yedek Üye</option>
                          </>
                        )}
                        {!gorevler.some((g) => g.ad === row.gorevAd) && (
                          <option value={row.gorevAd}>{row.gorevAd}</option>
                        )}
                      </select>
                    </div>
                  </div>

                  {/* Personel Arama ve Seçim Alanı */}
                  <div className="flex-1 relative">
                    <div
                      onClick={() => {
                        setActiveDropdownRowId(isDropdownOpen ? null : row.id)
                        setSearchPersonelTerm('')
                      }}
                      className={`flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-950 border rounded-xl text-xs font-medium cursor-pointer transition-all ${
                        isDropdownOpen
                          ? 'border-blue-500 ring-2 ring-blue-500/10'
                          : assignedPerson
                            ? 'border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100'
                            : 'border-dashed border-slate-300 dark:border-slate-700 text-slate-400 hover:border-blue-400'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {assignedPerson ? (
                          <>
                            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                              {assignedPerson.ad_soyad.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="truncate">
                              <span className="font-bold text-slate-800 dark:text-slate-200">
                                {assignedPerson.ad_soyad}
                              </span>
                              {assignedPerson.unvan && (
                                <span className="text-slate-400 text-[11px] ml-1.5">
                                  ({assignedPerson.unvan})
                                </span>
                              )}
                            </div>
                          </>
                        ) : (
                          <span className="flex items-center gap-1.5 text-slate-400 italic">
                            <UserPlus className="w-3.5 h-3.5" /> Personel Seçiniz...
                          </span>
                        )}
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                    </div>

                    {/* Searchable Dropdown Popup */}
                    {isDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2 max-h-60 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
                        <div className="relative mb-2">
                          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            autoFocus
                            placeholder="Personel adı veya unvanı ara..."
                            value={searchPersonelTerm}
                            onChange={(e) => setSearchPersonelTerm(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500"
                          />
                        </div>

                        <div className="overflow-y-auto flex-1 custom-scrollbar divide-y divide-slate-100 dark:divide-slate-800/50">
                          <button
                            type="button"
                            onClick={() => handleSelectPersonel(row.id, null)}
                            className="w-full text-left px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors flex items-center justify-between"
                          >
                            <span>(Atamayı Kaldır / Boş Bırak)</span>
                            <X className="w-3 h-3" />
                          </button>

                          {filteredPersoneller.length === 0 ? (
                            <div className="p-3 text-center text-xs text-slate-400">
                              Personel bulunamadı
                            </div>
                          ) : (
                            filteredPersoneller.map((p) => (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => handleSelectPersonel(row.id, p.id)}
                                className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg transition-colors flex items-center justify-between ${
                                  row.personelId === p.id
                                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold'
                                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                <div>
                                  <div className="font-semibold">{p.ad_soyad}</div>
                                  {p.unvan && (
                                    <div className="text-[10px] text-slate-400">{p.unvan}</div>
                                  )}
                                </div>
                                {row.personelId === p.id && (
                                  <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                )}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Asil / Yedek & Silme Aksiyonları */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleAsil(row.id)}
                      className={`px-3 py-1 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        row.asilMi === 1
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 shadow-2xs'
                          : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 shadow-2xs'
                      }`}
                      title="Asil / Yedek durumunu değiştirmek için tıklayın"
                    >
                      {row.asilMi === 1 ? '✓ Asil' : '⟳ Yedek'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemoveRow(row.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-colors"
                      title="Satırı Kaldır"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Alt Sticky Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
          <label className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={syncToActiveFile}
              onChange={(e) => setSyncToActiveFile(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 rounded-sm"
            />
            <span>Açık olan aktif dosyaya ({activeDosyaId ? `Dosya #${activeDosyaId}` : 'Aktif Dosya'}) anında senkronize et</span>
          </label>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-semibold"
            >
              İptal
            </Button>
            <Button
              type="button"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="rounded-xl px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20"
            >
              {saveMutation.isPending ? 'Kaydediliyor...' : '⚡ Kadroyu Güncelle ve Kaydet'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

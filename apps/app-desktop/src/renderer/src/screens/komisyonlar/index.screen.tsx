import React, { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Edit2,
  FileSearch,
  FileText,
  FolderKanban,
  History,
  Layers,
  Plus,
  Printer,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  Zap
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { KomisyonOlusturModal } from './components/KomisyonOlusturModal'
import { PersonelAtaModal } from './components/PersonelAtaModal'
import { HizliKadroGuncelleModal } from './components/HizliKadroGuncelleModal'
import { KomisyonAtamaModal } from '../dosya/sub-screens/components/MalzemeListesi/components/KomisyonAtamaModal'
import { useTabStore } from '../../store/tabStore'
import { useDosyaAsamasiSablons } from '../dosya/sub-screens/DosyaAsamalari/useDosyaAsamasiSablons'
import { DocumentPreviewModal } from '../dosya/components/DocumentPreviewModal'
import {
  DEFAULT_YAKLASIK_SABLONLAR,
  DEFAULT_MUAYENE_SABLONLAR,
  TEMPLATE_NAMES
} from '../../../../shared/constants/templateConstants'

const isBaseKomisyon = (ad?: string, id?: number): boolean => {
  if (id === 1 || id === 2) return true
  const lower = (ad || '').toLowerCase().trim()
  return (
    lower === 'yaklaşık maliyet tespit komisyonu' ||
    lower === 'muayene kabul ve tespit komisyonu' ||
    lower === 'fiyat araştırma komisyonu' ||
    lower.includes('yaklaşık maliyet') ||
    lower.includes('muayene kabul') ||
    lower.includes('muayene ve kabul') ||
    lower.includes('fiyat araştırma') ||
    lower.includes('fiyat arastirma')
  )
}

export default function KomisyonlarScreen({
  isSubComponent = false
}: {
  isSubComponent?: boolean
}): React.JSX.Element {
  const { addTab } = useTabStore()
  const queryClient = useQueryClient()

  // Ana Sekme Değişimi: 'sablonlar' | 'dosya_komisyonlari'
  const [activeMainTab, setActiveMainTab] = useState<'sablonlar' | 'dosya_komisyonlari'>('sablonlar')

  const [searchTerm, setSearchTerm] = useState('')
  const [dosyaKomisyonSearch, setDosyaKomisyonSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingKomisyonId, setEditingKomisyonId] = useState<number | null>(null)

  const [isAtaModalOpen, setIsAtaModalOpen] = useState(false)
  const [ataRoleId, setAtaRoleId] = useState<number | null>(null)
  const [ataKomisyonId, setAtaKomisyonId] = useState<number | null>(null)

  // Hızlı Kadro Güncelle Modalı
  const [hizliKadroOpen, setHizliKadroOpen] = useState(false)
  const [hizliKadroKomisyon, setHizliKadroKomisyon] = useState<{ id: number; ad: string } | null>(
    null
  )

  // Dosya İçi Komisyon Atama Modalı
  const [editingDosyaId, setEditingDosyaId] = useState<number | null>(null)

  // Atama Geçmişi Modalı
  const [historyDosya, setHistoryDosya] = useState<{
    id: number
    dosya_no: string
    is_tanimi: string
  } | null>(null)

  // Üretilebilir Belgeler Açılır/Kapanır State
  const [expandedBelgelerMap, setExpandedBelgelerMap] = useState<Record<number, boolean>>({})

  const toggleBelgeler = (komisyonId: number): void => {
    setExpandedBelgelerMap((prev) => ({
      ...prev,
      [komisyonId]: !prev[komisyonId]
    }))
  }

  // Şablon Önizleme ve Çıktı Altyapısı
  const {
    activeDosyaId,
    masterHtml,
    dosyaContext,
    placeholders,
    contextsByPath,
    personelListesi,
    previewModalOpen,
    setPreviewModalOpen,
    previewData,
    handleOpenPreviewForSablon,
    executePrint,
    executeExportPdf,
    refreshSnapshot,
    saveSnapshot
  } = useDosyaAsamasiSablons()

  // Oluşturulmuş Şablon Komisyonları Çek
  const { data: komisyonlar = [], isLoading: isKomisyonLoading } = useQuery({
    queryKey: ['komisyonlar'],
    queryFn: async () => {
      try {
        const yaklasikListRes = await window.electron.ipcRenderer.invoke(
          'db:query',
          `SELECT id, ad FROM TANIM_Komisyon 
           WHERE LOWER(TRIM(ad)) IN (
             'yaklaşık maliyet tespit komisyonu',
             'yaklasik maliyet tespit komisyonu',
             'fiyat araştırma komisyonu',
             'fiyat arastirma komisyonu',
             'fiyat araştırma ve yaklaşık maliyet tespit komisyonu'
           )
           ORDER BY CASE WHEN LOWER(TRIM(ad)) LIKE '%yaklaşık%' THEN 1 ELSE 2 END, id ASC`
        )

        let primaryYaklasikId = 1
        if (yaklasikListRes.success && yaklasikListRes.data && yaklasikListRes.data.length > 0) {
          primaryYaklasikId = yaklasikListRes.data[0].id
          await window.electron.ipcRenderer.invoke(
            'db:run',
            "UPDATE TANIM_Komisyon SET ad = 'Yaklaşık Maliyet Tespit Komisyonu', aktif_mi = 1 WHERE id = ?",
            [primaryYaklasikId]
          )
          for (let i = 1; i < yaklasikListRes.data.length; i++) {
            const dupId = yaklasikListRes.data[i].id
            await window.electron.ipcRenderer.invoke(
              'db:run',
              'UPDATE OR IGNORE TANIM_KomisyonUye SET komisyon_id = ? WHERE komisyon_id = ?',
              [primaryYaklasikId, dupId]
            )
            await window.electron.ipcRenderer.invoke(
              'db:run',
              'DELETE FROM TANIM_Komisyon_Sablon WHERE komisyon_id = ?',
              [dupId]
            )
            await window.electron.ipcRenderer.invoke(
              'db:run',
              'DELETE FROM TANIM_Komisyon WHERE id = ?',
              [dupId]
            )
          }
        }

        const muayeneListRes = await window.electron.ipcRenderer.invoke(
          'db:query',
          `SELECT id, ad FROM TANIM_Komisyon 
           WHERE LOWER(TRIM(ad)) IN (
             'muayene kabul ve tespit komisyonu',
             'muayene kabul ve teslim alma komisyonu',
             'muayene ve kabul komisyonu'
           )
           ORDER BY id ASC`
        )

        let primaryMuayeneId = 2
        if (muayeneListRes.success && muayeneListRes.data && muayeneListRes.data.length > 0) {
          primaryMuayeneId = muayeneListRes.data[0].id
          await window.electron.ipcRenderer.invoke(
            'db:run',
            "UPDATE TANIM_Komisyon SET ad = 'Muayene Kabul ve Tespit Komisyonu', aktif_mi = 1 WHERE id = ?",
            [primaryMuayeneId]
          )
          for (let i = 1; i < muayeneListRes.data.length; i++) {
            const dupId = muayeneListRes.data[i].id
            await window.electron.ipcRenderer.invoke(
              'db:run',
              'UPDATE OR IGNORE TANIM_KomisyonUye SET komisyon_id = ? WHERE komisyon_id = ?',
              [primaryMuayeneId, dupId]
            )
            await window.electron.ipcRenderer.invoke(
              'db:run',
              'DELETE FROM TANIM_Komisyon_Sablon WHERE komisyon_id = ?',
              [dupId]
            )
            await window.electron.ipcRenderer.invoke(
              'db:run',
              'DELETE FROM TANIM_Komisyon WHERE id = ?',
              [dupId]
            )
          }
        }

        for (const s of DEFAULT_YAKLASIK_SABLONLAR) {
          await window.electron.ipcRenderer.invoke(
            'db:run',
            `INSERT OR IGNORE INTO TANIM_Komisyon_Sablon (komisyon_id, sablon_id)
             SELECT ?, id FROM TANIM_Sablon 
             WHERE dosya_adi = ? OR route_path LIKE ? OR html_yolu LIKE ?`,
            [primaryYaklasikId, s, `%${s}%`, `%${s}%`]
          )
        }
        for (const s of DEFAULT_MUAYENE_SABLONLAR) {
          await window.electron.ipcRenderer.invoke(
            'db:run',
            `INSERT OR IGNORE INTO TANIM_Komisyon_Sablon (komisyon_id, sablon_id)
             SELECT ?, id FROM TANIM_Sablon 
             WHERE dosya_adi = ? OR route_path LIKE ? OR html_yolu LIKE ?`,
            [primaryMuayeneId, s, `%${s}%`, `%${s}%`]
          )
        }
      } catch (normErr) {
        console.warn('Komisyon normalizasyonu hatası:', normErr)
      }

      const res = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT * FROM TANIM_Komisyon WHERE aktif_mi = 1 ORDER BY id ASC'
      )
      if (!res.success) throw new Error(res.error)

      const membersRes = await window.electron.ipcRenderer.invoke(
        'db:query',
        `SELECT u.id as role_id, u.komisyon_id, u.asil_mi, u.personel_id, p.ad_soyad, p.unvan, g.ad as gorev_adi 
         FROM TANIM_KomisyonUye u
         LEFT JOIN TANIM_Personel p ON u.personel_id = p.id
         JOIN TANIM_KomisyonGorevi g ON u.gorev_id = g.id
         ORDER BY u.id ASC`
      )

      const sablonlarRes = await window.electron.ipcRenderer.invoke(
        'db:query',
        `SELECT ks.komisyon_id, s.id, s.ad, s.aciklama, s.icerik, s.dosya_adi, s.route_path, s.test_verisi, s.kategori 
         FROM TANIM_Komisyon_Sablon ks
         JOIN TANIM_Sablon s ON ks.sablon_id = s.id
         WHERE s.aktif_mi = 1`
      )

      const komisyonlarData = res.data.map((k: any) => {
        const uyeler = membersRes.success
          ? membersRes.data.filter((m: any) => m.komisyon_id === k.id)
          : []
        let sablonlar = sablonlarRes.success
          ? sablonlarRes.data.filter((s: any) => s.komisyon_id === k.id)
          : []

        if (sablonlar.length === 0) {
          const lower = (k.ad || '').toLowerCase()
          if (lower.includes('yaklaşık') || lower.includes('fiyat') || k.id === 1) {
            sablonlar = DEFAULT_YAKLASIK_SABLONLAR.map((key, i) => ({
              id: 1000 + i,
              ad: TEMPLATE_NAMES[key] || key,
              dosya_adi: key,
              route_path: `/${key}`
            }))
          } else if (lower.includes('muayene') || lower.includes('kabul') || k.id === 2) {
            sablonlar = DEFAULT_MUAYENE_SABLONLAR.map((key, i) => ({
              id: 2000 + i,
              ad: TEMPLATE_NAMES[key] || key,
              dosya_adi: key,
              route_path: `/${key}`
            }))
          }
        }

        return {
          ...k,
          uyeler,
          sablonlar
        }
      })

      return komisyonlarData
    }
  })

  // Tüm Temin Dosyalarının Komisyon Atamaları ve Geçmişini Çek
  const { data: dosyaKomisyonList = [], isLoading: isDosyaKomisyonLoading } = useQuery({
    queryKey: ['dosya-komisyonlari-global-list'],
    queryFn: async () => {
      const dosyaRes = await window.electron.ipcRenderer.invoke(
        'db:query',
        `SELECT d.id, d.dosya_no, d.is_tanimi, d.created_at,
                (SELECT COUNT(*) FROM DATA_TeminKomisyonHistory h WHERE h.temin_dosya_id = d.id) as history_count
         FROM DATA_TeminDosyasi d
         WHERE d.aktif_mi = 1
         ORDER BY d.id DESC`
      )
      if (!dosyaRes.success) return []
      const dosyalar = dosyaRes.data || []

      const membersRes = await window.electron.ipcRenderer.invoke(
        'db:query',
        `SELECT k.id, k.temin_dosya_id, k.komisyon_turu, k.asil_mi, k.personel_id, k.gorev_id, k.updated_at,
                p.ad_soyad, p.unvan, g.ad as gorev_adi
         FROM DATA_TeminKomisyon k
         LEFT JOIN TANIM_Personel p ON k.personel_id = p.id
         LEFT JOIN TANIM_KomisyonGorevi g ON k.gorev_id = g.id
         ORDER BY k.id ASC`
      )
      const members = membersRes.success ? membersRes.data || [] : []

      return dosyalar.map((d: any) => {
        const dosyaMembers = members.filter((m: any) => m.temin_dosya_id === d.id)
        const piyasaMembers = dosyaMembers.filter(
          (m: any) => m.komisyon_turu === 'yaklasik_maliyet'
        )
        const muayeneMembers = dosyaMembers.filter((m: any) => m.komisyon_turu === 'muayene_kabul')

        let lastUpdate: string | null = null
        dosyaMembers.forEach((m: any) => {
          if (m.updated_at) {
            if (!lastUpdate || new Date(m.updated_at) > new Date(lastUpdate)) {
              lastUpdate = m.updated_at
            }
          }
        })

        return {
          ...d,
          piyasaMembers,
          muayeneMembers,
          totalMembersCount: dosyaMembers.length,
          lastUpdate
        }
      })
    }
  })

  // Atama Geçmiş Kayıtlarını Çek
  const { data: historyLogs = [], isLoading: isHistoryLoading } = useQuery({
    queryKey: ['dosya-komisyon-history', historyDosya?.id],
    enabled: !!historyDosya?.id,
    queryFn: async () => {
      const res = await window.electron.ipcRenderer.invoke(
        'db:query',
        `SELECT * FROM DATA_TeminKomisyonHistory WHERE temin_dosya_id = ? ORDER BY id DESC`,
        [historyDosya?.id]
      )
      return res.success ? res.data : []
    }
  })

  const [procurementFilter, setProcurementFilter] = useState<'all' | 'dogrudan_temin' | 'ihale'>(
    () => {
      const saved = localStorage.getItem('temin_procurement_mode')
      return (saved as 'dogrudan_temin' | 'ihale') || 'dogrudan_temin'
    }
  )

  React.useEffect(() => {
    const handleMode = (e: any) => {
      if (e.detail?.mode) {
        setProcurementFilter(e.detail.mode)
      }
    }
    window.addEventListener('procurement-mode-change', handleMode)
    return () => window.removeEventListener('procurement-mode-change', handleMode)
  }, [])

  const getIconForTur = (ad: string) => {
    if (ad.toLowerCase().includes('fiyat') || ad.toLowerCase().includes('maliyet')) {
      return <FileSearch className="w-5 h-5 shrink-0" />
    }
    if (ad.toLowerCase().includes('muayene') || ad.toLowerCase().includes('kabul')) {
      return <CheckCircle2 className="w-5 h-5 shrink-0" />
    }
    return <ShieldCheck className="w-5 h-5 shrink-0" />
  }

  const isKomisyonMatchingMode = (k: any, mode: 'all' | 'dogrudan_temin' | 'ihale'): boolean => {
    if (mode === 'all') return true
    const text = `${k.ad || ''} ${k.aciklama || ''}`.toLowerCase()
    if (mode === 'dogrudan_temin') {
      return (
        text.includes('fiyat') ||
        text.includes('piyasa') ||
        text.includes('doğrudan') ||
        text.includes('temin') ||
        text.includes('22') ||
        text.includes('maliyet') ||
        text.includes('muayene') ||
        text.includes('kabul') ||
        text.includes('teslim')
      )
    }
    if (mode === 'ihale') {
      return (
        text.includes('ihale') ||
        text.includes('pazarlık') ||
        text.includes('şartname') ||
        text.includes('kik') ||
        text.includes('hakediş') ||
        text.includes('muayene') ||
        text.includes('kabul') ||
        text.includes('tespit') ||
        !text.includes('22')
      )
    }
    return true
  }

  const filteredKomisyonlar = komisyonlar.filter((k: any) => {
    const matchesSearch = k.ad.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesMode = isKomisyonMatchingMode(k, procurementFilter)
    return matchesSearch && matchesMode
  })

  const filteredDosyaKomisyonlar = dosyaKomisyonList.filter((d: any) => {
    if (!dosyaKomisyonSearch.trim()) return true
    const s = dosyaKomisyonSearch.toLowerCase()
    const matchDosyaNo = (d.dosya_no || '').toLowerCase().includes(s)
    const matchIsTanimi = (d.is_tanimi || '').toLowerCase().includes(s)
    const matchPiyasa = d.piyasaMembers.some(
      (m: any) =>
        (m.ad_soyad || '').toLowerCase().includes(s) || (m.gorev_adi || '').toLowerCase().includes(s)
    )
    const matchMuayene = d.muayeneMembers.some(
      (m: any) =>
        (m.ad_soyad || '').toLowerCase().includes(s) || (m.gorev_adi || '').toLowerCase().includes(s)
    )
    return matchDosyaNo || matchIsTanimi || matchPiyasa || matchMuayene
  })

  return (
    <div
      className={
        isSubComponent
          ? 'flex flex-col h-full space-y-6 w-full animate-in fade-in duration-200'
          : 'flex flex-col h-full space-y-6'
      }
    >
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-500" />
            Komisyon Yönetimi ve Atama Geçmişi
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Genel şablon kadrolarını yönetebilir veya dosyalara özel komisyon kadro atamalarını ve
            revizyon geçmişini inceleyebilirsiniz.
          </p>
        </div>

        {activeMainTab === 'sablonlar' && (
          <div className="flex flex-wrap items-center gap-3">
            <Button
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 rounded-xl px-4 py-2 text-sm font-semibold transition-all"
              onClick={() => {
                setEditingKomisyonId(null)
                setIsModalOpen(true)
              }}
            >
              <Plus className="w-4 h-4" /> Yeni Komisyon Tanımla
            </Button>
          </div>
        )}
      </div>

      {/* Main Tab Switcher */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-200/70 dark:bg-slate-900 border border-slate-300/80 dark:border-slate-800 rounded-2xl w-fit">
        <button
          type="button"
          onClick={() => setActiveMainTab('sablonlar')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            activeMainTab === 'sablonlar'
              ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-md border border-slate-200 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>👑 Genel Şablon Kadroları</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
            {komisyonlar.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab('dosya_komisyonlari')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            activeMainTab === 'dosya_komisyonlari'
              ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-md border border-slate-200 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FolderKanban className="w-4 h-4" />
          <span>📂 Dosya Komisyonları & Atama Geçmişi</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-mono">
            {dosyaKomisyonList.length}
          </span>
        </button>
      </div>

      {/* TAB 1: GENEL ŞABLON KADROLARI */}
      {activeMainTab === 'sablonlar' && (
        <div className="grid grid-cols-1 gap-8 items-start flex-1 min-h-0">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm min-h-[450px] flex flex-col overflow-hidden relative">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Komisyon adı veya üye ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 w-full bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl text-sm"
                />
              </div>

              {/* Süreç Usulü Mod Filtreleyici */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setProcurementFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    procurementFilter === 'all'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Tümü ({komisyonlar.length})
                </button>
                <button
                  type="button"
                  onClick={() => setProcurementFilter('dogrudan_temin')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    procurementFilter === 'dogrudan_temin'
                      ? 'bg-blue-600 text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  <span>🛒 Doğrudan Temin</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      procurementFilter === 'dogrudan_temin'
                        ? 'bg-blue-700 text-white'
                        : 'bg-slate-200 dark:bg-slate-800'
                    }`}
                  >
                    {
                      komisyonlar.filter((k: any) => isKomisyonMatchingMode(k, 'dogrudan_temin'))
                        .length
                    }
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setProcurementFilter('ihale')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    procurementFilter === 'ihale'
                      ? 'bg-indigo-600 text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                  }`}
                >
                  <span>🏛️ İhale Komisyonları</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      procurementFilter === 'ihale'
                        ? 'bg-indigo-700 text-white'
                        : 'bg-slate-200 dark:bg-slate-800'
                    }`}
                  >
                    {komisyonlar.filter((k: any) => isKomisyonMatchingMode(k, 'ihale')).length}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/50 rounded-xl flex flex-col p-6">
              {isKomisyonLoading ? (
                <div className="flex-1 flex items-center justify-center text-slate-500">
                  Yükleniyor...
                </div>
              ) : filteredKomisyonlar.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center max-w-md">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">
                      Kayıtlı Komisyon Bulunamadı
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                      Henüz bir komisyon tanımı bulunmuyor. Yeni bir komisyon eklemek için yukarıdaki
                      "Yeni Komisyon Tanımla" butonunu kullanabilirsiniz.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {filteredKomisyonlar.map((komisyon: any) => {
                    const assignedMembers =
                      komisyon.uyeler?.filter((m: any) => m.personel_id || m.ad_soyad) || []
                    const asilCount =
                      komisyon.uyeler?.filter(
                        (m: any) => m.asil_mi === 1 && (m.personel_id || m.ad_soyad)
                      ).length || 0
                    const yedekCount =
                      komisyon.uyeler?.filter(
                        (m: any) => m.asil_mi === 0 && (m.personel_id || m.ad_soyad)
                      ).length || 0

                    return (
                      <div
                        key={komisyon.id}
                        className="group flex flex-col p-5 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-700/60 transition-all duration-300"
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3.5 flex-1">
                            <div className="w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner border border-blue-100 dark:border-blue-800/50">
                              {getIconForTur(komisyon.ad)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 leading-snug">
                                {komisyon.ad}
                              </h3>
                              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                {isBaseKomisyon(komisyon.ad) && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] font-bold border border-blue-200/80 dark:border-blue-800">
                                    Temel Komisyon
                                  </span>
                                )}
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                  <Users className="w-3 h-3 text-slate-500" />
                                  {komisyon.uyeler?.length || 0} Kadro
                                </span>
                                {asilCount > 0 && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                                    {asilCount} Asil
                                  </span>
                                )}
                                {yedekCount > 0 && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-[11px] font-bold text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60">
                                    {yedekCount} Yedek
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Top Actions */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setHizliKadroKomisyon({ id: komisyon.id, ad: komisyon.ad })
                                setHizliKadroOpen(true)
                              }}
                              className="p-2 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-xl transition-colors cursor-pointer"
                              title="⚡ Hızlı Kadro Düzenle"
                            >
                              <Zap className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingKomisyonId(komisyon.id)
                                setIsModalOpen(true)
                              }}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                              title="Komisyon Tanımını Düzenle"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            {isBaseKomisyon(komisyon.ad) ? (
                              <span
                                className="p-2 text-slate-300 dark:text-slate-600 cursor-not-allowed"
                                title="Sistem temel komisyonudur, silinemez."
                              >
                                <ShieldCheck className="w-4 h-4 text-blue-500/70" />
                              </span>
                            ) : (
                              <button
                                onClick={async () => {
                                  if (
                                    window.confirm('Bu komisyonu silmek istediğinize emin misiniz?')
                                  ) {
                                    const res = await window.electron.ipcRenderer.invoke(
                                      'db:run',
                                      "UPDATE TANIM_Komisyon SET aktif_mi = 0, ad = ad || ' (Silindi ' || id || ')' WHERE id = ?",
                                      [komisyon.id]
                                    )
                                    if (res.success) {
                                      queryClient.invalidateQueries({
                                        queryKey: ['komisyonlar']
                                      })
                                    } else {
                                      alert('Silme işlemi başarısız oldu: ' + res.error)
                                    }
                                  }
                                }}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-colors"
                                title="Sil"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Görevli Kadrosu Önizlemesi */}
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">
                              Görevli Kadrosu
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setHizliKadroKomisyon({ id: komisyon.id, ad: komisyon.ad })
                                setHizliKadroOpen(true)
                              }}
                              className="text-[11px] text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                            >
                              <Zap className="w-3 h-3" /> Hızlı Güncelle
                            </button>
                          </div>

                          {assignedMembers.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              {assignedMembers.map((m: any, idx: number) => (
                                <div
                                  key={idx}
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border ${
                                    m.asil_mi === 1
                                      ? 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                                      : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/60 dark:border-amber-800/50 text-amber-800 dark:text-amber-300'
                                  }`}
                                >
                                  <span
                                    className={`w-2 h-2 rounded-full ${m.asil_mi === 1 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                  />
                                  <span className="font-bold">{m.ad_soyad || 'Atanmamış'}</span>
                                  {m.gorev_adi && (
                                    <span className="text-[10px] text-slate-400 font-normal">
                                      ({m.gorev_adi})
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-3 bg-slate-50/70 dark:bg-slate-950/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center mb-2">
                              <span className="text-xs text-slate-400 italic">
                                Henüz görevli atanmadı.
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setHizliKadroKomisyon({ id: komisyon.id, ad: komisyon.ad })
                                  setHizliKadroOpen(true)
                                }}
                                className="ml-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                              >
                                + Kadroyu Ata
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Content: Üretilebilir Belgeler */}
                        <div className="mt-3 mb-3">
                          <button
                            type="button"
                            onClick={() => toggleBelgeler(komisyon.id)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                              expandedBelgelerMap[komisyon.id]
                                ? 'bg-blue-50/80 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/50 text-blue-700 dark:text-blue-300 shadow-2xs'
                                : 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-850'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="w-3.5 h-3.5 text-blue-500" />
                              <span>Üretilebilir Belgeler</span>
                              <span
                                className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                                  (komisyon.sablonlar?.length || 0) > 0
                                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                                }`}
                              >
                                {komisyon.sablonlar?.length || 0}
                              </span>
                            </div>
                            {expandedBelgelerMap[komisyon.id] ? (
                              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                            )}
                          </button>

                          {expandedBelgelerMap[komisyon.id] && (
                            <div className="mt-2 p-2 bg-slate-50/60 dark:bg-slate-950/40 rounded-xl border border-slate-200/70 dark:border-slate-800/70 animate-in fade-in slide-in-from-top-1 duration-150">
                              {komisyon.sablonlar && komisyon.sablonlar.length > 0 ? (
                                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto custom-scrollbar p-0.5">
                                  {komisyon.sablonlar.map((sablon: any) => (
                                    <button
                                      key={sablon.id}
                                      onClick={() => {
                                        if (!activeDosyaId) {
                                          alert(
                                            'Lütfen önce sol menüden veya "Dosyalar" altından bir dosya/proje açın. Belgeler, aktif dosya verileri kullanılarak hazırlanmaktadır.'
                                          )
                                          return
                                        }
                                        handleOpenPreviewForSablon(sablon, sablon.ad)
                                      }}
                                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:border-emerald-300 hover:bg-emerald-50 dark:hover:border-emerald-700 dark:hover:bg-emerald-900/20 hover:text-emerald-700 dark:hover:text-emerald-400 transition-all text-left shadow-2xs hover:shadow-xs cursor-pointer"
                                      title="Belgeyi Önizle ve Yazdır"
                                    >
                                      <Printer className="w-3 h-3 text-emerald-600 shrink-0" />
                                      <span className="line-clamp-1">{sablon.ad}</span>
                                    </button>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-xs text-slate-400 dark:text-slate-500 italic p-2 text-center">
                                  Bu komisyona atanmış belge şablonu bulunmuyor.
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Footer: Hızlı Güncelleme & Detaylı Yönetim */}
                        <div className="mt-auto pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                          <Button
                            className="flex-1 justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-sm shadow-blue-500/20 transition-all h-9.5"
                            onClick={() => {
                              setHizliKadroKomisyon({ id: komisyon.id, ad: komisyon.ad })
                              setHizliKadroOpen(true)
                            }}
                          >
                            <Zap className="w-3.5 h-3.5" />⚡ Hızlı Kadro Düzenle
                          </Button>

                          <Button
                            variant="outline"
                            className="justify-center gap-1.5 rounded-xl border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:hover:border-slate-700 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-all h-9.5 px-3"
                            onClick={() => {
                              addTab('/komisyonlar/detay?id=' + komisyon.id)
                            }}
                            title="Detaylı Yönetim Sayfasını Aç"
                          >
                            <Users className="w-3.5 h-3.5 text-slate-500" />
                            Detaylar
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DOSYA KOMİSYONLARI VE ATAMA GEÇMİŞİ ZAMAN ÇİZELGESİ */}
      {activeMainTab === 'dosya_komisyonlari' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col gap-5 min-h-[500px]">
          {/* Kart Başlığı */}
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
                  Dosya Komisyon Atamaları & Kadro Tarihçesi
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tüm doğrudan temin ve ihale dosyalarının komisyon kadrolarının ve geçmiş revizyonlarının zaman çizelgesi
                </p>
              </div>
            </div>
            <div className="text-xs text-slate-500 font-semibold self-end md:self-auto">
              Toplam <span className="font-extrabold text-blue-600">{filteredDosyaKomisyonlar.length}</span> temin dosyası
            </div>
          </div>

          {/* Bilgilendirme Kutusu */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2.5 leading-relaxed">
            <Clock className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-800 dark:text-slate-200 font-bold">
                Komisyon Kadro &amp; Zaman Çizelgesi Takibi:
              </strong>{' '}
              Dosyalarda tanımlanan komisyon kadroları veya yapılan üye değişiklikleri anlık versiyon snapshot'ı olarak arşivlenir.
              Geçmiş tarihli belgeler bastırılırken personellerin o dönemki vekalet unvanı ve görevleri otomatik korunur.
            </div>
          </div>

          {/* Arama Barı */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Dosya no, iş tanımı veya komisyon üyesi adı ara..."
              value={dosyaKomisyonSearch}
              onChange={(e) => setDosyaKomisyonSearch(e.target.value)}
              className="pl-9 pr-4 py-2 w-full bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold"
            />
          </div>

          {/* Zaman Çizelgesi (Timeline Listesi) */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pt-2 pr-1">
            {isDosyaKomisyonLoading ? (
              <div className="p-12 text-center text-slate-400 text-xs">Yükleniyor...</div>
            ) : filteredDosyaKomisyonlar.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-950/30 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                <History className="w-6 h-6 mx-auto text-slate-300 dark:text-slate-600" />
                <p>Aradığınız kriterlere uygun temin dosyası ve komisyon geçmişi bulunamadı.</p>
              </div>
            ) : (
              <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {filteredDosyaKomisyonlar.map((d: any) => (
                  <div
                    key={d.id}
                    className="relative p-4 rounded-2xl border bg-white dark:bg-slate-950/50 border-slate-200 dark:border-slate-800/80 hover:border-blue-300 dark:hover:border-blue-700/60 shadow-xs transition-all duration-200"
                  >
                    {/* Sol Nokta */}
                    <div className="absolute -left-6 top-5 w-3.5 h-3.5 rounded-full border-2 bg-white dark:bg-slate-900 border-blue-500 ring-2 ring-blue-100 dark:ring-blue-950" />

                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="space-y-2.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-extrabold text-xs text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800">
                            {d.dosya_no || `Dosya #${d.id}`}
                          </span>
                          <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                            {d.is_tanimi || 'Tanımlanmamış İş'}
                          </span>
                          {d.history_count > 0 ? (
                            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                              <History className="w-3 h-3" />
                              {d.history_count} Revizyon Kaydı
                            </span>
                          ) : (
                            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold">
                              Henüz Revizyon Yok
                            </span>
                          )}
                        </div>

                        {/* Kadrolar Özeti */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                          {/* Piyasa Araştırma Kadrosu */}
                          <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800">
                            <div className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                              <FileSearch className="w-3.5 h-3.5" /> Piyasa Fiyat Araştırma Kadrosu
                            </div>
                            {d.piyasaMembers.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5">
                                {d.piyasaMembers.map((m: any, mIdx: number) => (
                                  <span
                                    key={mIdx}
                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                                      m.asil_mi === 1
                                        ? 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                                        : 'bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                                    }`}
                                  >
                                    <span className="font-bold">{m.ad_soyad}</span>
                                    {m.gorev_adi && (
                                      <span className="text-[10px] text-slate-400 font-normal">
                                        ({m.gorev_adi})
                                      </span>
                                    )}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Görevli atanmadı.</span>
                            )}
                          </div>

                          {/* Muayene ve Kabul Kadrosu */}
                          <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800">
                            <div className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Muayene &amp; Kabul Kadrosu
                            </div>
                            {d.muayeneMembers.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5">
                                {d.muayeneMembers.map((m: any, mIdx: number) => (
                                  <span
                                    key={mIdx}
                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                                      m.asil_mi === 1
                                        ? 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                                        : 'bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                                    }`}
                                  >
                                    <span className="font-bold">{m.ad_soyad}</span>
                                    {m.gorev_adi && (
                                      <span className="text-[10px] text-slate-400 font-normal">
                                        ({m.gorev_adi})
                                      </span>
                                    )}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Görevli atanmadı.</span>
                            )}
                          </div>
                        </div>

                        {d.lastUpdate && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono pt-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>Son Güncelleme:</span>
                            <span className="font-bold text-slate-600 dark:text-slate-300">
                              {new Date(d.lastUpdate).toLocaleString('tr-TR')}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Sağ Butonlar */}
                      <div className="flex items-center gap-2 shrink-0 self-end md:self-start">
                        <button
                          type="button"
                          onClick={() => setHistoryDosya({ id: d.id, dosya_no: d.dosya_no, is_tanimi: d.is_tanimi })}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/80 dark:border-indigo-800 transition-colors cursor-pointer shadow-2xs"
                        >
                          <History className="w-4 h-4" />
                          <span>Revizyon Çizelgesi ({d.history_count})</span>
                        </button>
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-1.5 rounded-xl px-3.5 py-2 shadow-xs"
                          onClick={() => setEditingDosyaId(d.id)}
                        >
                          <Zap className="w-3.5 h-3.5" /> Kadroyu Düzenle
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hızlı Kadro Güncelleme Modalı */}
      <HizliKadroGuncelleModal
        isOpen={hizliKadroOpen}
        onClose={() => {
          setHizliKadroOpen(false)
          setHizliKadroKomisyon(null)
        }}
        komisyonId={hizliKadroKomisyon?.id || null}
        komisyonAdi={hizliKadroKomisyon?.ad || 'Komisyon'}
        activeDosyaId={activeDosyaId}
      />

      {/* Komisyon Oluşturma / Tanım Düzenleme Modalı */}
      <KomisyonOlusturModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingKomisyonId(null)
        }}
        komisyonId={editingKomisyonId}
        onPreviewSablon={(sablon) => {
          if (!activeDosyaId) {
            alert(
              'Lütfen önce sol menüden veya "Dosyalar" altından bir dosya/proje açın. Belgeler, aktif dosya verileri kullanılarak hazırlanmaktadır.'
            )
            return
          }
          handleOpenPreviewForSablon(sablon, sablon.ad)
        }}
      />

      {/* Dosya İçi Komisyon Atama Modalı */}
      {editingDosyaId && (
        <KomisyonAtamaModal
          isOpen={!!editingDosyaId}
          onClose={() => {
            setEditingDosyaId(null)
            queryClient.invalidateQueries({ queryKey: ['dosya-komisyonlari-global-list'] })
          }}
          activeDosyaId={editingDosyaId}
        />
      )}

      {/* Atama Geçmişi Modalı */}
      {historyDosya && (
        <Modal
          isOpen={!!historyDosya}
          onClose={() => setHistoryDosya(null)}
          title={`Komisyon Atama Geçmişi (${historyDosya.dosya_no || `Dosya #${historyDosya.id}`})`}
          description={historyDosya.is_tanimi || 'Bu dosya için geçmişte yapılmış komisyon kadrosu değişiklikleri.'}
          className="max-w-4xl"
        >
          <div className="space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar p-1">
            {isHistoryLoading ? (
              <div className="p-8 text-center text-slate-500">Yükleniyor...</div>
            ) : historyLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 italic">
                Bu dosyaya ait herhangi bir geçmiş değişiklik kaydı bulunmuyor.
              </div>
            ) : (
              <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 pl-6 space-y-6">
                {historyLogs.map((log: any) => {
                  let membersData: any[] = []
                  try {
                    membersData = JSON.parse(log.snapshot_data || '[]')
                  } catch (e) {
                    membersData = []
                  }

                  const isYaklasik = log.komisyon_turu === 'yaklasik_maliyet'

                  return (
                    <div key={log.id} className="relative group">
                      {/* Timeline Indicator Node */}
                      <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-blue-500 group-hover:scale-125 transition-transform" />

                      <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 dark:border-slate-800/80 pb-2.5 mb-3">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2.5 py-0.5 rounded-md text-xs font-black uppercase tracking-wider border ${
                                isYaklasik
                                  ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                                  : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                              }`}
                            >
                              {isYaklasik
                                ? 'Piyasa Fiyat Araştırma Kadrosu'
                                : 'Muayene & Kabul Kadrosu'}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                              {log.islem_turu || 'Güncelleme'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(log.created_at).toLocaleString('tr-TR')}
                          </div>
                        </div>

                        {/* Snapshot Members List */}
                        <div className="space-y-1.5">
                          <div className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">
                            Kayıtlı Kadro Listesi ({membersData.length} Görevli)
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {membersData.map((m: any, mIdx: number) => (
                              <div
                                key={mIdx}
                                className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span
                                    className={`w-2 h-2 rounded-full shrink-0 ${
                                      m.asil_mi === 1 ? 'bg-emerald-500' : 'bg-amber-500'
                                    }`}
                                  />
                                  <span className="font-extrabold text-slate-800 dark:text-slate-100 truncate">
                                    {m.personel_ad_soyad || 'Atanmamış'}
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-400 font-semibold truncate ml-2">
                                  {m.gorev_adi || 'Üye'} ({m.asil_mi === 1 ? 'Asil' : 'Yedek'})
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </Modal>
      )}

      <PersonelAtaModal
        isOpen={isAtaModalOpen}
        onClose={() => {
          setIsAtaModalOpen(false)
          setAtaRoleId(null)
          setAtaKomisyonId(null)
        }}
        roleId={ataRoleId}
        komisyonId={ataKomisyonId}
      />

      {previewData && previewModalOpen && (
        <DocumentPreviewModal
          isOpen={previewModalOpen}
          onClose={() => setPreviewModalOpen(false)}
          title={previewData.title}
          templateHtml={previewData.templateHtml}
          masterHtml={masterHtml || ''}
          baseContext={
            previewData.snapshotContext || contextsByPath[previewData.processPath] || dosyaContext
          }
          placeholders={placeholders}
          personelListesi={personelListesi}
          onPrint={executePrint}
          onExportPdf={executeExportPdf}
          isInline={false}
          templateTestVerisi={previewData.templateTestVerisi}
          dosyaAdi={previewData.dosyaAdi}
          onRefreshSnapshot={refreshSnapshot}
          onSaveSnapshot={saveSnapshot}
        />
      )}
    </div>
  )
}


import React, { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Building2,
  CheckCircle2,
  FileSearch,
  FolderKanban,
  Plus,
  ShieldCheck,
  Users
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { KomisyonOlusturModal } from './components/KomisyonOlusturModal'
import { PersonelAtaModal } from './components/PersonelAtaModal'
import { HizliKadroGuncelleModal } from './components/HizliKadroGuncelleModal'
import { KomisyonAtamaModal } from '../dosya/sub-screens/components/MalzemeListesi/components/KomisyonAtamaModal'
import { useTabStore } from '../../store/tabStore'
import { useDosyaAsamasiSablons } from '../dosya/sub-screens/DosyaAsamalari/useDosyaAsamasiSablons'
import { DocumentPreviewModal } from '../dosya/components/DocumentPreviewModal'
import { TEMPLATE_REGISTRY } from '@temin360/document-templates'
import { GenelSablonKadrolariTab } from './components/GenelSablonKadrolariTab'
import { DosyaKomisyonlariTab } from './components/DosyaKomisyonlariTab'
import { AtamaGecmisiModal } from './components/AtamaGecmisiModal'

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

const getKomisyonTypeKey = (komisyonName: string, id: number): string => {
  const lower = (komisyonName || '').toLowerCase()
  if (
    lower.includes('yaklaşık') ||
    lower.includes('yaklasik') ||
    lower.includes('fiyat') ||
    id === 1
  ) {
    return 'yaklasik_maliyet'
  }
  if (lower.includes('muayene') || lower.includes('kabul') || id === 2) {
    return 'muayene_kabul'
  }
  return 'all'
}

const getRegistryTemplatesForKomisyon = (komisyonName: string, id: number) => {
  const typeKey = getKomisyonTypeKey(komisyonName, id)
  return TEMPLATE_REGISTRY.filter((t) => {
    if (!t.capabilities?.supportsCommission) return false
    const commTypes = t.capabilities.supportedCommissionTypes || []
    if (commTypes.includes('all')) return true
    if (
      typeKey === 'yaklasik_maliyet' &&
      (commTypes.includes('piyasa_fiyat') || commTypes.includes('yaklasik_maliyet'))
    ) {
      return true
    }
    if (typeKey === 'muayene_kabul' && commTypes.includes('muayene_kabul')) {
      return true
    }
    return false
  }).map((t, idx) => ({
    id: `reg-${t.id}-${idx}`,
    ad: t.title,
    dosya_adi: t.id,
    route_path: t.id,
    aciklama: t.description,
    kategori: t.category
  }))
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

        // DB içindeki mükerrer şablon kayıtlarını temizle
        await window.electron.ipcRenderer.invoke(
          'db:run',
          `DELETE FROM TANIM_Komisyon_Sablon 
           WHERE rowid NOT IN (
             SELECT MIN(rowid) FROM TANIM_Komisyon_Sablon GROUP BY komisyon_id, sablon_id
           )`
        )
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

        const dbSablonlar = sablonlarRes.success
          ? sablonlarRes.data.filter((s: any) => s.komisyon_id === k.id)
          : []

        const registrySablonlar = getRegistryTemplatesForKomisyon(k.ad, k.id)

        // Mükerrer şablon kartlarını engellemek için benzersizleştir
        const uniqueMap = new Map<string, any>()
        for (const s of registrySablonlar) {
          const key = (s.dosya_adi || s.ad || '').toLowerCase().trim()
          if (key && !uniqueMap.has(key)) {
            uniqueMap.set(key, s)
          }
        }
        for (const s of dbSablonlar) {
          const key = (s.dosya_adi || s.ad || '').toLowerCase().trim()
          if (key && !uniqueMap.has(key)) {
            uniqueMap.set(key, s)
          }
        }

        return {
          ...k,
          uyeler,
          sablonlar: Array.from(uniqueMap.values())
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

  const handleDeleteKomisyon = async (komisyonId: number) => {
    if (window.confirm('Bu komisyonu silmek istediğinize emin misiniz?')) {
      const res = await window.electron.ipcRenderer.invoke(
        'db:run',
        "UPDATE TANIM_Komisyon SET aktif_mi = 0, ad = ad || ' (Silindi ' || id || ')' WHERE id = ?",
        [komisyonId]
      )
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['komisyonlar'] })
      } else {
        alert('Silme işlemi başarısız oldu: ' + res.error)
      }
    }
  }

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
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 rounded-xl px-4 py-2 text-sm font-semibold transition-all cursor-pointer"
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
        <GenelSablonKadrolariTab
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          procurementFilter={procurementFilter}
          setProcurementFilter={setProcurementFilter}
          komisyonlar={komisyonlar}
          filteredKomisyonlar={filteredKomisyonlar}
          isKomisyonLoading={isKomisyonLoading}
          isKomisyonMatchingMode={isKomisyonMatchingMode}
          isBaseKomisyon={isBaseKomisyon}
          getIconForTur={getIconForTur}
          expandedBelgelerMap={expandedBelgelerMap}
          toggleBelgeler={toggleBelgeler}
          onHizliKadro={(k) => {
            setHizliKadroKomisyon(k)
            setHizliKadroOpen(true)
          }}
          onEditKomisyon={(id) => {
            setEditingKomisyonId(id)
            setIsModalOpen(true)
          }}
          onDeleteKomisyon={handleDeleteKomisyon}
          onOpenPreview={handleOpenPreviewForSablon}
          onOpenDetails={(id) => {
            addTab('/komisyonlar/detay?id=' + id)
          }}
          activeDosyaId={activeDosyaId}
        />
      )}

      {/* TAB 2: DOSYA KOMİSYONLARI VE ATAMA GEÇMİŞİ ZAMAN ÇİZELGESİ */}
      {activeMainTab === 'dosya_komisyonlari' && (
        <DosyaKomisyonlariTab
          filteredDosyaKomisyonlar={filteredDosyaKomisyonlar}
          isDosyaKomisyonLoading={isDosyaKomisyonLoading}
          dosyaKomisyonSearch={dosyaKomisyonSearch}
          setDosyaKomisyonSearch={setDosyaKomisyonSearch}
          onOpenHistory={(d) => setHistoryDosya(d)}
          onEditDosyaKomisyon={(id) => setEditingDosyaId(id)}
        />
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
        <AtamaGecmisiModal
          historyDosya={historyDosya}
          onClose={() => setHistoryDosya(null)}
          historyLogs={historyLogs}
          isHistoryLoading={isHistoryLoading}
        />
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

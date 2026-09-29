import React, { useState, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  FolderKanban,
  Plus,
  Search,
  TrendingUp,
  Wallet,
  Clock,
  Calendar,
  MapPin,
  FileText,
  Edit2,
  Trash2,
  ChevronRight,
  PieChart,
  ArrowUpRight,
  Check,
  AlertCircle,
  Info,
  Building2,
  Layers,
  Settings
} from 'lucide-react'
import { useProjeHooks, useProjeDosyalari, Proje, ProjeInput } from '../../hooks/useProjeHooks'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { useWorkspaceStore } from '../../store/workspaceStore'

const COLOR_PRESETS = [
  '#3b82f6', // Mavi
  '#10b981', // Zümrüt Yeşili
  '#8b5cf6', // Mor
  '#f59e0b', // Kehribar
  '#ef4444', // Kırmızı
  '#06b6d4', // Camgöbeği
  '#ec4899', // Pembe
  '#6366f1' // İndigo
]

const DURUM_CONFIG = {
  planlama: {
    label: 'Planlama Aşamasında',
    color:
      'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800'
  },
  devam: {
    label: 'Devam Ediyor',
    color:
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
  },
  tamamlandi: {
    label: 'Tamamlandı',
    color:
      'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800'
  }
}

const generateDefaultProjectCode = (): string => {
  return `PRJ-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`
}

export default function ProjelerScreen({
  isSubComponent = false
}: {
  isSubComponent?: boolean
} = {}): React.JSX.Element {
  const navigate = useNavigate()
  const { setActiveDosyaId } = useWorkspaceStore()
  const { projeler, isLoadingProjeler, addProje, updateProje, deleteProje } = useProjeHooks()

  // State
  const [searchTerm, setSearchTerm] = useState('')
  const [durumFilter, setDurumFilter] = useState<'all' | 'devam' | 'planlama' | 'tamamlandi'>('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingProje, setEditingProje] = useState<Proje | null>(null)
  const [detailProje, setDetailProje] = useState<Proje | null>(null)
  const [detailTab, setDetailTab] = useState<'ozet' | 'dosyalar' | 'duzenle'>('ozet')
  const [deletingProje, setDeletingProje] = useState<Proje | null>(null)

  // Form State
  const [formCode, setFormCode] = useState(generateDefaultProjectCode)
  const [formName, setFormName] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formBudget, setFormBudget] = useState('')
  const [formStartDate, setFormStartDate] = useState('')
  const [formEndDate, setFormEndDate] = useState('')
  const [formLocation, setFormLocation] = useState('')
  const [formDurum, setFormDurum] = useState<'planlama' | 'devam' | 'tamamlandi'>('devam')
  const [formColor, setFormColor] = useState(COLOR_PRESETS[0])

  // Sub-query for files of selected detail project
  const { data: projeDosyalari = [], isLoading: isLoadingDosyalar } = useProjeDosyalari(
    detailProje?.id
  )

  // Computed summary metrics
  const summary = useMemo(() => {
    const totalProjects = projeler.length
    const totalBudget = projeler.reduce((acc, p) => acc + (p.toplam_butce || 0), 0)
    const totalSpent = projeler.reduce((acc, p) => acc + (p.harcanan_tutar || 0), 0)
    const totalRemaining = Math.max(0, totalBudget - totalSpent)
    const overallPercentage =
      totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0
    const activeCount = projeler.filter((p) => p.durum === 'devam').length

    return {
      totalProjects,
      totalBudget,
      totalSpent,
      totalRemaining,
      overallPercentage,
      activeCount
    }
  }, [projeler])

  // Filtered projects
  const filteredProjeler = useMemo(() => {
    return projeler.filter((p) => {
      const matchSearch =
        (p.proje_adi || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.proje_kodu || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.aciklama || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.lokasyon || '').toLowerCase().includes(searchTerm.toLowerCase())

      const matchDurum = durumFilter === 'all' || p.durum === durumFilter
      return matchSearch && matchDurum
    })
  }, [projeler, searchTerm, durumFilter])

  // Populate form with project data
  const fillFormWithProject = (p: Proje) => {
    setFormCode(p.proje_kodu)
    setFormName(p.proje_adi)
    setFormDesc(p.aciklama || '')
    setFormBudget(p.toplam_butce ? String(p.toplam_butce) : '')
    setFormStartDate(p.baslangic_tarihi || '')
    setFormEndDate(p.bitis_tarihi || '')
    setFormLocation(p.lokasyon || '')
    setFormDurum(p.durum || 'devam')
    setFormColor(p.renk || COLOR_PRESETS[0])
  }

  // Open Edit Modal
  const handleOpenEdit = (p: Proje) => {
    setEditingProje(p)
    fillFormWithProject(p)
    setIsCreateModalOpen(true)
  }

  // Open Detail Modal
  const handleOpenDetail = (p: Proje, defaultTab: 'ozet' | 'dosyalar' | 'duzenle' = 'ozet') => {
    setDetailProje(p)
    setDetailTab(defaultTab)
    fillFormWithProject(p)
  }

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingProje(null)
    setFormCode(generateDefaultProjectCode())
    setFormName('')
    setFormDesc('')
    setFormBudget('')
    setFormStartDate('')
    setFormEndDate('')
    setFormLocation('')
    setFormDurum('devam')
    setFormColor(COLOR_PRESETS[0])
    setIsCreateModalOpen(true)
  }

  // Save (Create or Update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim()) return

    const payload: Partial<ProjeInput> = {
      proje_kodu: formCode.trim(),
      proje_adi: formName.trim(),
      aciklama: formDesc.trim() || null,
      toplam_butce: formBudget ? Number(formBudget) : 0,
      baslangic_tarihi: formStartDate || null,
      bitis_tarihi: formEndDate || null,
      lokasyon: formLocation.trim() || null,
      durum: formDurum,
      renk: formColor
    }

    const targetProje = editingProje || detailProje

    if (targetProje) {
      await updateProje({ id: targetProje.id, data: payload })
      if (detailProje?.id === targetProje.id) {
        setDetailProje((prev) => (prev ? ({ ...prev, ...payload } as Proje) : null))
      }
    } else {
      await addProje(payload)
    }

    setIsCreateModalOpen(false)
  }

  // Delete
  const handleDeleteConfirm = async () => {
    if (!deletingProje) return
    await deleteProje(deletingProje.id)
    if (detailProje?.id === deletingProje.id) {
      setDetailProje(null)
    }
    setDeletingProje(null)
  }

  // Open Dosya in Workspace
  const handleNavigateToDosya = (dosyaId: number) => {
    setActiveDosyaId(dosyaId)
    navigate({ to: '/dosya' })
  }

  return (
    <div
      className={`space-y-6 animate-fadeIn pb-16 ${isSubComponent ? 'w-full' : 'p-6 max-w-[1600px] mx-auto'}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
            <FolderKanban className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Proje Yönetimi & Yatırım Takibi
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 font-semibold">
                {projeler.length} Proje
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Üst alım ve yatırım projelerini tanımlayın; harcama tutarları bağlı doğrudan temin /
              ihale dosyalarından otomatik türetilir.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleOpenCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-xl"
          >
            <Plus size={16} /> Yeni Proje Tanımla
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Toplam Bütçe */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Tahsis Edilen Toplam Ödenek
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Wallet size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {summary.totalBudget > 0
                ? `${summary.totalBudget.toLocaleString('tr-TR')} ₺`
                : 'Belirtilmedi'}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Toplam {summary.totalProjects} proje için planlanan ödenek
            </p>
          </div>
        </div>

        {/* Gerçekleşen Harcama */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Otomatik Gerçekleşen Harcama
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-purple-600 dark:text-purple-400 tracking-tight">
              {summary.totalSpent.toLocaleString('tr-TR')} ₺
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300">
                {summary.totalBudget > 0 ? `%${summary.overallPercentage}` : 'Bağlı Dosyalar'}
              </span>
              <span className="text-[11px] text-slate-400">dosya harcamaları toplamı</span>
            </div>
          </div>
        </div>

        {/* Kalan Fon */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Kalan Kullanılabilir Bütçe
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <PieChart size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              {summary.totalBudget > 0
                ? `${summary.totalRemaining.toLocaleString('tr-TR')} ₺`
                : 'Sınırsız / Esnek'}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Henüz harcanmamış kullanılabilir ödenek
            </p>
          </div>
        </div>

        {/* Aktif Süreçler */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Aktif Süreçteki Projeler
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
              {summary.activeCount}{' '}
              <span className="text-sm font-normal text-slate-400">/ {summary.totalProjects}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Yürürlükteki aktif yatırım ve alımlar
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl shadow-xs">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Proje adı, kodu veya lokasyon ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
          />
        </div>

        {/* Durum Segmented Control */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/80 dark:border-slate-800 w-full sm:w-auto overflow-x-auto">
          {(
            [
              { id: 'all', label: 'Tümü' },
              { id: 'devam', label: 'Devam Eden' },
              { id: 'planlama', label: 'Planlama' },
              { id: 'tamamlandi', label: 'Tamamlandı' }
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setDurumFilter(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                durumFilter === t.id
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {isLoadingProjeler ? (
        <div className="py-20 text-center text-xs text-slate-400">Projeler yükleniyor...</div>
      ) : filteredProjeler.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-500 flex items-center justify-center mx-auto">
            <FolderKanban size={24} />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Kayıtlı Proje Bulunamadı
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Arama kriterlerinize uygun proje bulunamadı veya henüz bir proje tanımlanmadı.
          </p>
          <Button
            onClick={handleOpenCreate}
            className="text-xs bg-blue-600 text-white hover:bg-blue-700"
          >
            <Plus size={14} className="mr-1" /> İlk Projeyi Tanımla
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjeler.map((p) => {
            const durumBadge = DURUM_CONFIG[p.durum] || DURUM_CONFIG.devam
            const harcamaYuzde = p.harcama_yuzdesi || 0

            return (
              <div
                key={p.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl p-5 shadow-xs transition-all hover:shadow-md flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Sol Üst Renk Vurgusu */}
                <div
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: p.renk || '#3b82f6' }}
                />

                <div className="space-y-4 pt-1">
                  {/* Üst Bar: Kod & Durum */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 px-2.5 py-0.5 rounded-md border border-blue-200 dark:border-blue-800/80">
                      {p.proje_kodu}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${durumBadge.color}`}
                    >
                      {durumBadge.label}
                    </span>
                  </div>

                  {/* Başlık & Açıklama */}
                  <div>
                    <h3
                      onClick={() => handleOpenDetail(p, 'ozet')}
                      className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors cursor-pointer"
                    >
                      {p.proje_adi}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 min-h-[32px]">
                      {p.aciklama || 'Açıklama belirtilmemiş.'}
                    </p>
                  </div>

                  {/* Lokasyon & Tarihler */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin size={13} className="text-slate-400 shrink-0" />
                      <span className="truncate">{p.lokasyon || 'Tüm Birimler'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <Calendar size={13} className="text-slate-400 shrink-0" />
                      <span className="truncate">
                        {p.baslangic_tarihi ? p.baslangic_tarihi : 'Başlangıç yok'}
                      </span>
                    </div>
                  </div>

                  {/* Bütçe İlerleme Çubuğu */}
                  <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium flex items-center gap-1">
                        Harcama Tutarı
                        <span className="text-[10px] text-slate-400">(Otomatik)</span>
                      </span>
                      {p.toplam_butce > 0 && (
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          %{harcamaYuzde}
                        </span>
                      )}
                    </div>

                    {/* Progress bar (only if total budget is specified) */}
                    {p.toplam_butce > 0 ? (
                      <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${harcamaYuzde}%`,
                            backgroundColor: p.renk || '#3b82f6'
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-full bg-slate-100 dark:bg-slate-800/50 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500/40 rounded-full w-full" />
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                      <span>
                        Gerçekleşen:{' '}
                        <strong className="text-purple-600 dark:text-purple-400">
                          {Number(p.harcanan_tutar).toLocaleString('tr-TR')} ₺
                        </strong>
                      </span>
                      <span>
                        {p.toplam_butce > 0 ? (
                          <>
                            Tahsis:{' '}
                            <strong className="text-slate-800 dark:text-slate-200">
                              {Number(p.toplam_butce).toLocaleString('tr-TR')} ₺
                            </strong>
                          </>
                        ) : (
                          <span className="text-slate-400 font-medium">Bütçe Limiti Yok</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Alt Aksiyon Butonları */}
                <div className="flex items-center justify-between gap-2 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => handleOpenDetail(p, 'dosyalar')}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 group/btn"
                  >
                    <FileText size={14} />
                    <span>{p.dosya_sayisi || 0} Bağlı Dosya</span>
                    <ChevronRight
                      size={14}
                      className="group-hover/btn:translate-x-0.5 transition-transform"
                    />
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenDetail(p, 'ozet')}
                      title="Proje Detay Ekranı"
                      className="px-2 py-1 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1"
                    >
                      Geniş Görünüm
                    </button>
                    <button
                      onClick={() => handleOpenEdit(p)}
                      title="Projeyi Düzenle"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => setDeletingProje(p)}
                      title="Projeyi Sil"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Expanded Wide Project Detail & Workspace Drawer / Modal */}
      {detailProje && (
        <Modal
          isOpen={Boolean(detailProje)}
          onClose={() => setDetailProje(null)}
          title={`Proje Detay Yönetimi: ${detailProje.proje_adi}`}
          className="max-w-5xl w-11/12 max-h-[90vh]"
        >
          <div className="space-y-6">
            {/* Header Banner & Navigation Tabs */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-12 rounded-full shrink-0"
                    style={{ backgroundColor: detailProje.renk || '#3b82f6' }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-700 dark:text-blue-300 bg-white dark:bg-slate-800 px-2.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                        {detailProje.proje_kodu}
                      </span>
                      <h2 className="text-base font-bold text-slate-900 dark:text-white">
                        {detailProje.proje_adi}
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {detailProje.lokasyon || 'Tüm Birimler / Genel Proje'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full border ${DURUM_CONFIG[detailProje.durum]?.color}`}
                  >
                    {DURUM_CONFIG[detailProje.durum]?.label}
                  </span>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pt-2">
                <button
                  onClick={() => setDetailTab('ozet')}
                  className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                    detailTab === 'ozet'
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Layers size={14} /> Genel Bakış & Finansal Özet
                </button>
                <button
                  onClick={() => setDetailTab('dosyalar')}
                  className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                    detailTab === 'dosyalar'
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <FileText size={14} /> Bağlı Temin & İhale Dosyaları ({projeDosyalari.length})
                </button>
                <button
                  onClick={() => setDetailTab('duzenle')}
                  className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                    detailTab === 'duzenle'
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Settings size={14} /> Projeyi Düzenle
                </button>
              </div>
            </div>

            {/* TAB 1: Genel Bakış */}
            {detailTab === 'ozet' && (
              <div className="space-y-6 animate-fadeIn">
                {/* Financial KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-xs font-semibold text-slate-400 block">
                      Tahsis Edilen Ödenek Bütçesi
                    </span>
                    <div className="text-xl font-bold text-slate-900 dark:text-white">
                      {detailProje.toplam_butce > 0
                        ? `${Number(detailProje.toplam_butce).toLocaleString('tr-TR')} ₺`
                        : 'Belirtilmedi'}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {detailProje.toplam_butce > 0
                        ? 'Tanımlanan üst ödenek limiti'
                        : 'Serbest / Limit tanımlanmamış'}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-xs font-semibold text-slate-400 block flex items-center justify-between">
                      Otomatik Gerçekleşen Harcama
                      <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold bg-purple-50 dark:bg-purple-950/60 px-1.5 py-0.5 rounded">
                        Canlı Veri
                      </span>
                    </span>
                    <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                      {Number(detailProje.harcanan_tutar).toLocaleString('tr-TR')} ₺
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {projeDosyalari.length} bağlı temin dosyasının toplam yaklaşık maliyetleri
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-xs font-semibold text-slate-400 block">
                      Kalan Bütçe Payı
                    </span>
                    <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                      {detailProje.toplam_butce > 0
                        ? `${Number(detailProje.kalan_butce).toLocaleString('tr-TR')} ₺`
                        : 'Esnek'}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {detailProje.toplam_butce > 0
                        ? `Kullanım oranı: %${detailProje.harcama_yuzdesi || 0}`
                        : 'Kısıtlama bulunmuyor'}
                    </p>
                  </div>
                </div>

                {/* Auto Calculation Notice */}
                <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
                    <strong className="text-blue-900 dark:text-blue-200 block font-semibold">
                      Otomatik Harcama & Bütçe Yönetimi Mantığı:
                    </strong>
                    <p>
                      Proje harcamaları manuel sayı girilerek yönetilmez. Bu projeye doğrudan temin
                      veya ihale dosyası bağlandıkça, dosyaların maliyet tutarları proje
                      harcamasına otomatik yansıtılır.
                    </p>
                  </div>
                </div>

                {/* Proje Detayları & Açıklama */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                      Lokasyon & Tarih Bilgileri
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <Building2 size={14} className="text-slate-400" /> Lokasyon / Birim:
                        </span>
                        <strong className="text-slate-900 dark:text-white">
                          {detailProje.lokasyon || 'Tüm Birimler'}
                        </strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-slate-400" /> Başlangıç Tarihi:
                        </span>
                        <strong className="text-slate-900 dark:text-white">
                          {detailProje.baslangic_tarihi || 'Belirtilmedi'}
                        </strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-slate-400" /> Bitiş / Hedef Tarih:
                        </span>
                        <strong className="text-slate-900 dark:text-white">
                          {detailProje.bitis_tarihi || 'Belirtilmedi'}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                      Açıklama & Kapsam
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                      {detailProje.aciklama ||
                        'Bu proje için henüz detaylı açıklama metni eklenmemiş.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Bağlı İhale / Temin Dosyaları */}
            {detailTab === 'dosyalar' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <FileText size={15} className="text-blue-500" />
                    Bu Projeye Bağlı Doğrudan Temin ve İhale Dosyaları ({projeDosyalari.length})
                  </h4>

                  <Button
                    onClick={() => {
                      setDetailProje(null)
                      navigate({ to: '/dosyalar/yeni' })
                    }}
                    className="text-xs h-8 px-3 bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1"
                  >
                    <Plus size={14} /> Yeni Dosya Başlat
                  </Button>
                </div>

                {isLoadingDosyalar ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    Dosyalar yükleniyor...
                  </div>
                ) : projeDosyalari.length === 0 ? (
                  <div className="py-12 text-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-xs text-slate-500 space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-500 flex items-center justify-center mx-auto">
                      <FileText size={20} />
                    </div>
                    <p className="font-medium text-slate-800 dark:text-slate-200">
                      Bu projeye tanımlı herhangi bir doğrudan temin veya ihale dosyası bulunamadı.
                    </p>
                    <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                      Doğrudan temin dosyası oluştururken veya var olan dosyanın &quot;Genel
                      Bilgiler&quot; sekmesinde proje seçim alanından bu projeyi seçerek
                      bağlayabilirsiniz.
                    </p>
                  </div>
                ) : (
                  <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                          <th className="py-3 px-4">Dosya No</th>
                          <th className="py-3 px-4">İş / Konu Adı</th>
                          <th className="py-3 px-4">Alım Türü</th>
                          <th className="py-3 px-4">Süreç Durumu</th>
                          <th className="py-3 px-4 text-right">Yaklaşık Maliyet</th>
                          <th className="py-3 px-4 text-center">Aksiyon</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                        {projeDosyalari.map((dosya) => (
                          <tr
                            key={dosya.id}
                            className="hover:bg-slate-50 dark:hover:bg-slate-950/60 transition-colors"
                          >
                            <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                              {dosya.dosya_no || `DT-${dosya.id}`}
                            </td>
                            <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100 max-w-xs truncate">
                              {dosya.is_adi}
                            </td>
                            <td className="py-3 px-4 text-slate-500">
                              {dosya.alim_turu || 'Doğrudan Temin'}
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                {dosya.surec_durumu || 'Devam Ediyor'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right font-bold text-purple-600 dark:text-purple-400">
                              {Number(dosya.yaklasik_maliyet || 0).toLocaleString('tr-TR')} ₺
                            </td>
                            <td className="py-3 px-4 text-center">
                              <Button
                                onClick={() => {
                                  setDetailProje(null)
                                  handleNavigateToDosya(dosya.id)
                                }}
                                className="text-xs h-7 px-3 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800 inline-flex items-center gap-1"
                              >
                                Dosyayı Aç <ArrowUpRight size={13} />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: Projeyi Düzenle (Inline Edit Form) */}
            {detailTab === 'duzenle' && (
              <form onSubmit={handleSave} className="space-y-5 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Proje Kodu *
                    </label>
                    <Input
                      value={formCode}
                      onChange={(e) => setFormCode(e.target.value)}
                      placeholder="PRJ-2026-001"
                      required
                      className="font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Tahsis Edilen Ödenek Bütçesi (₺) - İsteğe Bağlı
                    </label>
                    <Input
                      type="number"
                      value={formBudget}
                      onChange={(e) => setFormBudget(e.target.value)}
                      placeholder="Örn: 1500000 (Boş bırakılabilir)"
                      className="text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Proje / Yatırım Adı *
                  </label>
                  <Input
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Örn: 2026 Yılı Hizmet Binaları Bakım Onarım Projesi"
                    required
                    className="text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Lokasyon / İlgili Birim
                    </label>
                    <Input
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value)}
                      placeholder="Örn: Merkez Kampüs & Ek Binalar"
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Proje Durumu
                    </label>
                    <select
                      value={formDurum}
                      onChange={(e) => setFormDurum(e.target.value as any)}
                      className="w-full h-9 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                    >
                      <option value="devam">Devam Ediyor</option>
                      <option value="planlama">Planlama Aşamasında</option>
                      <option value="tamamlandi">Tamamlandı</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Başlangıç Tarihi
                    </label>
                    <Input
                      type="date"
                      value={formStartDate}
                      onChange={(e) => setFormStartDate(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Bitiş / Hedef Tarihi
                    </label>
                    <Input
                      type="date"
                      value={formEndDate}
                      onChange={(e) => setFormEndDate(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Açıklama / Kapsam
                  </label>
                  <textarea
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="Projenin amacı, hedefleri ve kapsamı..."
                    rows={3}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Proje Renk Etiketi
                  </label>
                  <div className="flex items-center gap-2">
                    {COLOR_PRESETS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setFormColor(c)}
                        className={`w-7 h-7 rounded-full transition-all flex items-center justify-center ${
                          formColor === c
                            ? 'ring-2 ring-offset-2 ring-blue-500 scale-110'
                            : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: c }}
                      >
                        {formColor === c && <Check size={14} className="text-white drop-shadow" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <Button type="submit" className="text-xs bg-blue-600 text-white hover:bg-blue-700">
                    Guncellemeleri Kaydet
                  </Button>
                </div>
              </form>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button variant="outline" onClick={() => setDetailProje(null)} className="text-xs">
                Kapat
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Expanded Wide Create Modal */}
      {isCreateModalOpen && (
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title={editingProje ? 'Projeyi Düzenle' : 'Yeni Üst Proje Tanımla'}
          className="max-w-4xl w-11/12 max-h-[88vh]"
        >
          <form onSubmit={handleSave} className="space-y-5">
            {/* Auto Budget Explanation */}
            <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="text-xs text-blue-900 dark:text-blue-200">
                <strong>Harcama Takibi Otomatiktir:</strong> Proje oluştururken harcanan tutar
                girişi yapılmaz. Bağlanan doğrudan temin ve ihale dosyalarının maliyetleri proje
                harcamasına otomatik eklenir.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Proje Kodu *
                </label>
                <Input
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  placeholder="PRJ-2026-001"
                  required
                  className="font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tahsis Edilen Ödenek Bütçesi (₺) - İsteğe Bağlı
                </label>
                <Input
                  type="number"
                  value={formBudget}
                  onChange={(e) => setFormBudget(e.target.value)}
                  placeholder="Örn: 1000000 (Boş bırakılabilir)"
                  className="text-xs"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Ödenek limiti belirtmek şart değildir.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Proje / Yatırım Adı *
              </label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Örn: 2026 Yılı Hizmet Binaları Bakım Onarım Projesi"
                required
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Lokasyon / İlgili Birim
                </label>
                <Input
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  placeholder="Örn: Merkez Kampüs & Ek Binalar"
                  className="text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Proje Durumu
                </label>
                <select
                  value={formDurum}
                  onChange={(e) => setFormDurum(e.target.value as any)}
                  className="w-full h-9 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                >
                  <option value="devam">Devam Ediyor</option>
                  <option value="planlama">Planlama Aşamasında</option>
                  <option value="tamamlandi">Tamamlandı</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Başlangıç Tarihi
                </label>
                <Input
                  type="date"
                  value={formStartDate}
                  onChange={(e) => setFormStartDate(e.target.value)}
                  className="text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Bitiş / Hedef Tarihi
                </label>
                <Input
                  type="date"
                  value={formEndDate}
                  onChange={(e) => setFormEndDate(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Açıklama / Kapsam
              </label>
              <textarea
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Projenin amacı, hedefleri ve kapsamı..."
                rows={3}
                className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Proje Renk Etiketi
              </label>
              <div className="flex items-center gap-2">
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setFormColor(c)}
                    className={`w-7 h-7 rounded-full transition-all flex items-center justify-center ${
                      formColor === c
                        ? 'ring-2 ring-offset-2 ring-blue-500 scale-110'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                  >
                    {formColor === c && <Check size={14} className="text-white drop-shadow" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-xs"
              >
                Vazgeç
              </Button>
              <Button type="submit" className="text-xs bg-blue-600 text-white hover:bg-blue-700">
                {editingProje ? 'Değişiklikleri Kaydet' : 'Projeyi Oluştur'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProje && (
        <Modal
          isOpen={Boolean(deletingProje)}
          onClose={() => setDeletingProje(null)}
          title="Projeyi Sil"
        >
          <div className="space-y-4 p-1">
            <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div className="text-xs text-red-800 dark:text-red-300">
                <strong>{deletingProje.proje_adi}</strong> ({deletingProje.proje_kodu}) projesini
                silmek istediğinize emin misiniz?
                <p className="mt-1 text-slate-500 dark:text-slate-400">
                  Bu projeye bağlı doğrudan temin dosyaları silinmez ancak proje ilişkisi
                  arşivlenir.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDeletingProje(null)} className="text-xs">
                Vazgeç
              </Button>
              <Button
                onClick={handleDeleteConfirm}
                className="text-xs bg-red-600 text-white hover:bg-red-700"
              >
                Evet, Projeyi Sil
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}


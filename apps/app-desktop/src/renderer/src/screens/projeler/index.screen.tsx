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
  AlertCircle
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
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800'
  },
  devam: {
    label: 'Devam Ediyor',
    color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
  },
  tamamlandi: {
    label: 'Tamamlandı',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800'
  }
}

const generateDefaultProjectCode = (): string => {
  return `PRJ-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`
}

export default function ProjelerScreen(): React.JSX.Element {
  const navigate = useNavigate()
  const { setActiveDosyaId } = useWorkspaceStore()
  const { projeler, isLoadingProjeler, addProje, updateProje, deleteProje } = useProjeHooks()

  // State
  const [searchTerm, setSearchTerm] = useState('')
  const [durumFilter, setDurumFilter] = useState<'all' | 'devam' | 'planlama' | 'tamamlandi'>('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingProje, setEditingProje] = useState<Proje | null>(null)
  const [detailProje, setDetailProje] = useState<Proje | null>(null)
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
  const { data: projeDosyalari = [], isLoading: isLoadingDosyalar } = useProjeDosyalari(detailProje?.id)

  // Computed summary metrics
  const summary = useMemo(() => {
    const totalProjects = projeler.length
    const totalBudget = projeler.reduce((acc, p) => acc + (p.toplam_butce || 0), 0)
    const totalSpent = projeler.reduce((acc, p) => acc + (p.harcanan_tutar || 0), 0)
    const totalRemaining = Math.max(0, totalBudget - totalSpent)
    const overallPercentage = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0
    const activeCount = projeler.filter((p) => p.durum === 'devam').length

    return { totalProjects, totalBudget, totalSpent, totalRemaining, overallPercentage, activeCount }
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

  // Open Edit Modal
  const handleOpenEdit = (p: Proje) => {
    setEditingProje(p)
    setFormCode(p.proje_kodu)
    setFormName(p.proje_adi)
    setFormDesc(p.aciklama || '')
    setFormBudget(p.toplam_butce ? String(p.toplam_butce) : '')
    setFormStartDate(p.baslangic_tarihi || '')
    setFormEndDate(p.bitis_tarihi || '')
    setFormLocation(p.lokasyon || '')
    setFormDurum(p.durum || 'devam')
    setFormColor(p.renk || COLOR_PRESETS[0])
    setIsCreateModalOpen(true)
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
      toplam_butce: Number(formBudget) || 0,
      baslangic_tarihi: formStartDate || null,
      bitis_tarihi: formEndDate || null,
      lokasyon: formLocation.trim() || null,
      durum: formDurum,
      renk: formColor
    }

    if (editingProje) {
      await updateProje({ id: editingProje.id, data: payload })
      if (detailProje?.id === editingProje.id) {
        setDetailProje((prev) => (prev ? { ...prev, ...payload } as Proje : null))
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
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 animate-fadeIn pb-16">
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
              Üst alım ve yatırım projelerini tanımlayın, bütçe harcamalarını ve bağlı doğrudan temin süreçlerini tek merkezden yönetin.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleOpenCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center gap-1.5 text-xs font-semibold px-4 py-2"
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
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Toplam Proje Bütçesi</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Wallet size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {summary.totalBudget.toLocaleString('tr-TR')} ₺
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Toplam {summary.totalProjects} proje için tahsis edilen fon
            </p>
          </div>
        </div>

        {/* Gerçekleşen Harcama */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Gerçekleşen Harcama</span>
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
                %{summary.overallPercentage}
              </span>
              <span className="text-[11px] text-slate-400">kullanım oranı</span>
            </div>
          </div>
        </div>

        {/* Kalan Fon */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Kalan Kullanılabilir Bütçe</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <PieChart size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              {summary.totalRemaining.toLocaleString('tr-TR')} ₺
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Sözleşme veya onay bekleyen bütçe payı
            </p>
          </div>
        </div>

        {/* Aktif Süreçler */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Aktif & Yürüyen Projeler</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
              {summary.activeCount} <span className="text-sm font-normal text-slate-400">/ {summary.totalProjects}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Hali hazırda devam eden alım süreçleri
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
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Kayıtlı Proje Bulunamadı</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Arama kriterlerinize uygun proje bulunamadı veya henüz bir proje tanımlanmadı.
          </p>
          <Button onClick={handleOpenCreate} className="text-xs bg-blue-600 text-white hover:bg-blue-700">
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
                    <span className="font-mono text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800/80">
                      {p.proje_kodu}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${durumBadge.color}`}>
                      {durumBadge.label}
                    </span>
                  </div>

                  {/* Başlık & Açıklama */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
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
                      <span className="text-slate-500 font-medium">Bütçe Harcama Durumu</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        %{harcamaYuzde}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${harcamaYuzde}%`,
                          backgroundColor: p.renk || '#3b82f6'
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                      <span>Harcanan: <strong className="text-slate-800 dark:text-slate-200">{Number(p.harcanan_tutar).toLocaleString('tr-TR')} ₺</strong></span>
                      <span>Toplam: <strong className="text-slate-800 dark:text-slate-200">{Number(p.toplam_butce).toLocaleString('tr-TR')} ₺</strong></span>
                    </div>
                  </div>
                </div>

                {/* Alt Aksiyon Butonları */}
                <div className="flex items-center justify-between gap-2 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setDetailProje(p)}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 group/btn"
                  >
                    <FileText size={14} />
                    <span>{p.dosya_sayisi || 0} Dosya & Detaylar</span>
                    <ChevronRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
                  </button>

                  <div className="flex items-center gap-1">
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

      {/* Detail & Files Drawer / Modal */}
      {detailProje && (
        <Modal
          isOpen={Boolean(detailProje)}
          onClose={() => setDetailProje(null)}
          title={`Proje Detayı: ${detailProje.proje_adi}`}
        >
          <div className="space-y-5 p-1 max-h-[75vh] overflow-y-auto pr-1">
            {/* Proje Bilgi Başlığı */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-900 dark:to-blue-950/20 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                    {detailProje.proje_kodu}
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {detailProje.proje_adi}
                  </span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${DURUM_CONFIG[detailProje.durum]?.color}`}>
                  {DURUM_CONFIG[detailProje.durum]?.label}
                </span>
              </div>

              {detailProje.aciklama && (
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {detailProje.aciklama}
                </p>
              )}

              <div className="grid grid-cols-3 gap-3 pt-2 text-xs">
                <div className="bg-white dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block font-medium">Toplam Bütçe</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {Number(detailProje.toplam_butce).toLocaleString('tr-TR')} ₺
                  </span>
                </div>
                <div className="bg-white dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block font-medium">Harcanan Tutar</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">
                    {Number(detailProje.harcanan_tutar).toLocaleString('tr-TR')} ₺
                  </span>
                </div>
                <div className="bg-white dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block font-medium">Kalan Bütçe</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {Number(detailProje.kalan_butce).toLocaleString('tr-TR')} ₺
                  </span>
                </div>
              </div>
            </div>

            {/* Bağlı Doğrudan Temin Dosyaları */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <FileText size={15} className="text-blue-500" />
                  Bu Projeye Bağlı Doğrudan Temin Dosyaları ({projeDosyalari.length})
                </h4>

                <Button
                  onClick={() => {
                    setDetailProje(null)
                    navigate({ to: '/dosyalar/yeni' })
                  }}
                  className="text-xs h-7 px-2.5 bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100"
                >
                  <Plus size={13} className="mr-1" /> Yeni Dosya Başlat
                </Button>
              </div>

              {isLoadingDosyalar ? (
                <div className="py-8 text-center text-xs text-slate-400">Dosyalar yükleniyor...</div>
              ) : projeDosyalari.length === 0 ? (
                <div className="py-8 text-center bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-xs text-slate-500 space-y-2">
                  <p>Bu projeye henüz bağlı bir doğrudan temin veya ihale dosyası bulunmuyor.</p>
                  <p className="text-[11px] text-slate-400">
                    Yeni bir dosya oluştururken veya mevcut dosya detayında &quot;Genel Bilgiler&quot; sekmesinden bu projeyi seçebilirsiniz.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                  {projeDosyalari.map((dosya) => (
                    <div
                      key={dosya.id}
                      className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between gap-3 hover:border-blue-400 dark:hover:border-blue-700 transition-colors"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                            {dosya.dosya_no || `DT-${dosya.id}`}
                          </span>
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                            {dosya.is_adi}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                          <span>Yaklaşık Maliyet: <strong>{Number(dosya.yaklasik_maliyet || 0).toLocaleString('tr-TR')} ₺</strong></span>
                          <span>•</span>
                          <span>Durum: {dosya.surec_durumu || 'Hazırlık'}</span>
                        </div>
                      </div>

                      <Button
                        onClick={() => {
                          setDetailProje(null)
                          handleNavigateToDosya(dosya.id)
                        }}
                        className="text-xs h-7 px-3 bg-blue-600 text-white hover:bg-blue-700 shrink-0 flex items-center gap-1"
                      >
                        Dosyayı Aç <ArrowUpRight size={13} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button
                variant="outline"
                onClick={() => setDetailProje(null)}
                className="text-xs"
              >
                Kapat
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Create / Edit Modal */}
      {isCreateModalOpen && (
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title={editingProje ? 'Projeyi Düzenle' : 'Yeni Proje Tanımla'}
        >
          <form onSubmit={handleSave} className="space-y-4 p-1">
            <div className="grid grid-cols-2 gap-3">
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
                  Toplam Bütçe (₺) *
                </label>
                <Input
                  type="number"
                  value={formBudget}
                  onChange={(e) => setFormBudget(e.target.value)}
                  placeholder="1000000"
                  required
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Lokasyon / Birim
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

            <div className="grid grid-cols-2 gap-3">
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
                placeholder="Projenin amacı, kapsamı ve hedefleri..."
                rows={2}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Proje Rengi
              </label>
              <div className="flex items-center gap-2">
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setFormColor(c)}
                    className={`w-7 h-7 rounded-full transition-all flex items-center justify-center ${
                      formColor === c ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                  >
                    {formColor === c && <Check size={14} className="text-white drop-shadow" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
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
                <strong>{deletingProje.proje_adi}</strong> ({deletingProje.proje_kodu}) projesini silmek istediğinize emin misiniz?
                <p className="mt-1 text-slate-500 dark:text-slate-400">
                  Bu projeye bağlı doğrudan temin dosyaları silinmez ancak proje ilişkisi arşivlenir.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setDeletingProje(null)}
                className="text-xs"
              >
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

import React, { useState, useMemo } from 'react'
import {
  CheckSquare,
  FileText,
  Plus,
  Search,
  Layers,
  LayoutList,
  LayoutGrid,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Folder,
  Sparkles,
  RotateCw
} from 'lucide-react'
import { useLocation } from '@tanstack/react-router'
import { useNotlarHooks } from './notlar.hooks'
import { NotKarti } from './components/NotKarti'
import { NotModal } from './components/NotModal'
import { NotVeGorev, NotOncelik, NotTip, NOT_KATEGORILERI } from './types'
import { useWorkspaceStore } from '../../store/workspaceStore'

export default function NotlarVeGorevlerScreen(): React.JSX.Element {
  const location = useLocation()
  const {
    notlar,
    isLoadingNotlar,
    dosyalar,
    refetchNotlar,
    createNot,
    toggleNot,
    togglePin,
    updateNot,
    deleteNot
  } = useNotlarHooks()

  const { activeDosyaId } = useWorkspaceStore()

  // Filtre durumları
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'all' | 'todo' | 'not' | 'completed'>('all')
  const [selectedOncelik, setSelectedOncelik] = useState<'all' | NotOncelik>('all')
  const [selectedKategori, setSelectedKategori] = useState('all')

  // URL parametresinden veya hash'ten dosyaId oku
  const paramDosyaId = useMemo<number | null>(() => {
    try {
      const searchObj = (location.search as Record<string, unknown>) || {}
      if (searchObj.dosyaId) {
        const parsed = parseInt(String(searchObj.dosyaId), 10)
        if (!isNaN(parsed)) return parsed
      }
      const rawHash = window.location.hash || ''
      const match = rawHash.match(/[?&]dosyaId=([0-9]+)/)
      if (match && match[1]) {
        const parsed = parseInt(match[1], 10)
        if (!isNaN(parsed)) return parsed
      }
    } catch (e) {
      void e
    }
    return null
  }, [location.search, location.hash])

  // Kullanıcı filtreyi elle değiştirdiğinde override kullanılır, aksi halde URL parametresi veya 'all' geçerlidir
  const [selectedDosyaOverride, setSelectedDosyaOverride] = useState<
    number | 'all' | 'general' | null
  >(null)
  const selectedDosya =
    selectedDosyaOverride !== null ? selectedDosyaOverride : (paramDosyaId ?? 'all')
  const setSelectedDosya = (
    val:
      | number
      | 'all'
      | 'general'
      | ((prev: number | 'all' | 'general') => number | 'all' | 'general')
  ): void => {
    if (typeof val === 'function') {
      setSelectedDosyaOverride((prev) => {
        const current = prev !== null ? prev : (paramDosyaId ?? 'all')
        return val(current)
      })
    } else {
      setSelectedDosyaOverride(val)
    }
  }
  const [viewMode, setViewMode] = useState<'list' | 'sticky'>('list')

  // Hızlı Ekleme Çubuğu Durumları
  const [quickTitle, setQuickTitle] = useState('')
  const [quickTip, setQuickTip] = useState<NotTip>('todo')
  const [quickOncelik, setQuickOncelik] = useState<NotOncelik>('orta')
  const [isQuickSubmitting, setIsQuickSubmitting] = useState(false)

  // Modal Durumu
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<NotVeGorev | null>(null)

  // İstatistikler
  const stats = useMemo(() => {
    const total = notlar.length
    const completed = notlar.filter((n) => n.tamamlandi === 1).length
    const pending = total - completed
    const today = new Date().toISOString().split('T')[0]
    const urgent = notlar.filter(
      (n) => n.tamamlandi === 0 && (n.oncelik === 'acil' || n.oncelik === 'yuksek')
    ).length
    const todayOrOverdue = notlar.filter(
      (n) => n.tamamlandi === 0 && n.vade_tarihi && n.vade_tarihi <= today
    ).length

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

    return { total, pending, completed, urgent, todayOrOverdue, completionRate }
  }, [notlar])

  // Filtrelenmiş liste
  const filteredNotlar = useMemo(() => {
    return notlar.filter((item) => {
      // 1. Sekme Filtresi
      if (tab === 'todo' && (item.tip !== 'todo' || item.tamamlandi === 1)) return false
      if (tab === 'not' && item.tip !== 'not' && item.tip !== 'hatirlatici') return false
      if (tab === 'completed' && item.tamamlandi !== 1) return false

      // 2. Arama Filtresi
      if (search.trim()) {
        const q = search.toLowerCase()
        const matchTitle = item.baslik.toLowerCase().includes(q)
        const matchContent = item.icerik ? item.icerik.toLowerCase().includes(q) : false
        const matchDosya = item.dosya_no ? item.dosya_no.toLowerCase().includes(q) : false
        if (!matchTitle && !matchContent && !matchDosya) return false
      }

      // 3. Öncelik Filtresi
      if (selectedOncelik !== 'all' && item.oncelik !== selectedOncelik) return false

      // 4. Kategori Filtresi
      if (selectedKategori !== 'all' && item.kategori !== selectedKategori) return false

      // 5. Dosya Filtresi
      if (selectedDosya === 'general' && item.temin_dosya_id !== null) return false
      if (typeof selectedDosya === 'number' && item.temin_dosya_id !== selectedDosya) return false

      return true
    })
  }, [notlar, tab, search, selectedOncelik, selectedKategori, selectedDosya])

  // Hızlı Görev Ekleme
  const handleQuickAdd = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!quickTitle.trim()) return

    try {
      const defaultDosya =
        typeof selectedDosya === 'number'
          ? selectedDosya
          : selectedDosya === 'general'
            ? null
            : activeDosyaId || null

      await createNot({
        baslik: quickTitle.trim(),
        tip: quickTip,
        oncelik: quickOncelik,
        temin_dosya_id: defaultDosya,
        kategori: 'Genel',
        renk: quickTip === 'not' ? 'amber' : 'slate'
      })
      setQuickTitle('')
    } catch (err) {
      console.error('Hızlı not eklenemedi:', err)
    } finally {
      setIsQuickSubmitting(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/50 dark:bg-slate-950 overflow-y-auto">
      {/* ÜST BAŞLIK ALANI */}
      <div className="p-6 pb-4 border-b border-slate-200/70 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
              <CheckSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  Notlar & Yapılacaklar Listesi
                </h1>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40">
                  {stats.pending} Bekleyen
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Doğrudan temin ve ihale dosyalarına özel görevler, hatırlatıcılar ve yapışkan notlar
              </p>
            </div>
          </div>

          {/* Aksiyon Butonları */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => refetchNotlar()}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 transition-colors cursor-pointer"
              title="Yenile"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {/* Görünüm Değiştirici */}
            <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
                title="Liste Görünümü"
              >
                <LayoutList className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('sticky')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'sticky'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
                title="Yapışkan Notlar Kart Görünümü"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingItem(null)
                setIsModalOpen(true)
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all cursor-pointer hover:shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Not / Görev Ekle</span>
            </button>
          </div>
        </div>
      </div>

      {/* İÇERİK KONTEYNERİ */}
      <div className="max-w-7xl mx-auto w-full p-6 space-y-6">
        {/* 1. İSTATİSTİK KARTLARI */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          {/* Toplam Not & Görev */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Toplam Kayıt
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {stats.total}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
              <Layers className="w-5 h-5" />
            </div>
          </div>

          {/* Bekleyen Görevler */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                Bekleyen Görevler
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {stats.pending}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          {/* Tamamlananlar & İlerleme */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Tamamlananlar
                </p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  {stats.completed}{' '}
                  <span className="text-xs font-normal text-slate-400">
                    (%{stats.completionRate})
                  </span>
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            {/* Küçük İlerleme Çubuğu */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${stats.completionRate}%` }}
              />
            </div>
          </div>

          {/* Acil / Geciken Görevler */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                Acil & Vadesi Dolan
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {stats.urgent}{' '}
                {stats.todayOrOverdue > 0 && (
                  <span className="text-xs text-rose-500 font-semibold">
                    ({stats.todayOrOverdue} Vadesi Yakın)
                  </span>
                )}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* 2. HIZLI GÖREV / NOT EKLEME ÇUBUĞU */}
        <form
          onSubmit={handleQuickAdd}
          className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center gap-2.5"
        >
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setQuickTip(quickTip === 'todo' ? 'not' : 'todo')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              {quickTip === 'todo' ? (
                <>
                  <CheckSquare className="w-3.5 h-3.5 text-blue-500" />
                  <span>Yapılacak</span>
                </>
              ) : (
                <>
                  <FileText className="w-3.5 h-3.5 text-amber-500" />
                  <span>Not</span>
                </>
              )}
            </button>

            <select
              value={quickOncelik}
              onChange={(e) => setQuickOncelik(e.target.value as NotOncelik)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 border-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="dusuk">Düşük</option>
              <option value="orta">Orta</option>
              <option value="yuksek">Yüksek</option>
              <option value="acil">Acil</option>
            </select>
          </div>

          <div className="flex-1 w-full relative">
            <input
              type="text"
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              placeholder="Hızlıca bir görev veya not yazın ve Enter'a basın..."
              className="w-full pl-3.5 pr-10 py-2 text-sm rounded-xl border border-transparent focus:border-blue-500 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-400 border border-slate-200 dark:border-slate-700 px-1.5 py-0.2 rounded">
              Enter ↵
            </span>
          </div>

          <button
            type="submit"
            disabled={!quickTitle.trim() || isQuickSubmitting}
            className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all cursor-pointer disabled:opacity-40"
          >
            <Plus className="w-4 h-4" />
            <span>Hızlı Ekle</span>
          </button>
        </form>

        {/* 3. FİLTRE VE ARAMA ÇUBUĞU */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-2 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800">
          {/* Sekmeler */}
          <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                tab === 'all'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Tümü ({stats.total})
            </button>
            <button
              type="button"
              onClick={() => setTab('todo')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                tab === 'todo'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              📌 Yapılacaklar ({stats.pending})
            </button>
            <button
              type="button"
              onClick={() => setTab('not')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                tab === 'not'
                  ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              📝 Notlar
            </button>
            <button
              type="button"
              onClick={() => setTab('completed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                tab === 'completed'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              ✅ Tamamlananlar ({stats.completed})
            </button>
          </div>

          {/* Açılır Filtreler ve Arama */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Arama Input */}
            <div className="relative flex-1 md:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Ara..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Aktif Dosya Hızlı Filtre Butonu */}
            {activeDosyaId && (
              <button
                type="button"
                onClick={() => {
                  setSelectedDosya((prev) => (prev === activeDosyaId ? 'all' : activeDosyaId))
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  selectedDosya === activeDosyaId
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60 hover:bg-blue-100 dark:hover:bg-blue-900/40'
                }`}
                title="Şu an seçili olan aktif dosyanın not ve görevlerini filtrele"
              >
                <Folder className="w-3.5 h-3.5" />
                <span>Aktif Dosya Notları</span>
              </button>
            )}

            {/* Dosya Filtresi */}
            <select
              value={selectedDosya}
              onChange={(e) => {
                const val = e.target.value
                if (val === 'all') setSelectedDosya('all')
                else if (val === 'general') setSelectedDosya('general')
                else setSelectedDosya(Number(val))
              }}
              className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer max-w-42.5 truncate"
            >
              <option value="all">📁 Tüm Dosyalar</option>
              <option value="general">Genel Notlar</option>
              {dosyalar.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.id === activeDosyaId ? '⭐ ' : ''}
                  {d.dosya_no ? `Dosya No: ${d.dosya_no}` : `Dosya #${d.id}`}
                  {d.id === activeDosyaId ? ' (Aktif Dosya)' : ''}
                </option>
              ))}
            </select>

            {/* Öncelik Filtresi */}
            <select
              value={selectedOncelik}
              onChange={(e) => setSelectedOncelik(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">Öncelik: Tümü</option>
              <option value="acil">Acil</option>
              <option value="yuksek">Yüksek</option>
              <option value="orta">Orta</option>
              <option value="dusuk">Düşük</option>
            </select>

            {/* Kategori Filtresi */}
            <select
              value={selectedKategori}
              onChange={(e) => setSelectedKategori(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer max-w-[140px] truncate"
            >
              <option value="all">Kategori: Tümü</option>
              {NOT_KATEGORILERI.map((kat) => (
                <option key={kat} value={kat}>
                  {kat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 4. NOTLAR VE GÖREVLER LİSTESİ / IZGARASI */}
        {isLoadingNotlar ? (
          <div className="py-16 text-center space-y-2">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Notlar ve görevler yükleniyor...</p>
          </div>
        ) : filteredNotlar.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-500 flex items-center justify-center mx-auto">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              Henüz kayıt bulunmuyor
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Filtre kriterlerinize uygun not veya görev bulunamadı. Yeni bir görev ekleyerek
              başlayabilirsiniz.
            </p>
            <button
              type="button"
              onClick={() => {
                setEditingItem(null)
                setIsModalOpen(true)
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>İlk Notunuzu Ekleyin</span>
            </button>
          </div>
        ) : viewMode === 'list' ? (
          <div className="space-y-2.5">
            {filteredNotlar.map((item) => (
              <NotKarti
                key={item.id}
                item={item}
                viewMode="list"
                onToggle={(id, currentStatus) => toggleNot({ id, tamamlandi: !currentStatus })}
                onTogglePin={(id, currentPin) => togglePin({ id, sabitlendi: !currentPin })}
                onEdit={(item) => {
                  setEditingItem(item)
                  setIsModalOpen(true)
                }}
                onDelete={(id) => {
                  if (confirm('Bu notu/görevi silmek istediğinize emin misiniz?')) {
                    deleteNot(id)
                  }
                }}
                onSelectDosya={(dosyaId) => setSelectedDosya(dosyaId)}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredNotlar.map((item) => (
              <NotKarti
                key={item.id}
                item={item}
                viewMode="sticky"
                onToggle={(id, currentStatus) => toggleNot({ id, tamamlandi: !currentStatus })}
                onTogglePin={(id, currentPin) => togglePin({ id, sabitlendi: !currentPin })}
                onEdit={(item) => {
                  setEditingItem(item)
                  setIsModalOpen(true)
                }}
                onDelete={(id) => {
                  if (confirm('Bu notu/görevi silmek istediğinize emin misiniz?')) {
                    deleteNot(id)
                  }
                }}
                onSelectDosya={(dosyaId) => setSelectedDosya(dosyaId)}
              />
            ))}
          </div>
        )}
      </div>

      {/* DETAYLI EKLE / DÜZENLE MODALI */}
      <NotModal
        isOpen={isModalOpen}
        editingItem={editingItem}
        dosyalar={dosyalar}
        defaultDosyaId={
          typeof selectedDosya === 'number'
            ? selectedDosya
            : selectedDosya === 'general'
              ? null
              : activeDosyaId || null
        }
        onClose={() => setIsModalOpen(false)}
        onSave={async (data) => {
          if (editingItem) {
            await updateNot(data)
          } else {
            await createNot(data)
          }
        }}
      />
    </div>
  )
}

import React, { useState, useEffect } from 'react'
import {
  Calculator,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileText,
  FolderOpen,
  Gavel,
  Landmark,
  Layers,
  Sparkles,
  Building2,
  ArrowLeft,
  PlusCircle,
  FolderSync
} from 'lucide-react'
import { IslemTuru2886 } from './types/devletIhale2886.types'
import { IslemTuruSecici } from './components/IslemTuruSecici'
import { BelgeVeSablonStudyoTab } from './components/BelgeVeSablonStudyoTab'
import { MuhammenBedelVeTakdirTab } from './components/MuhammenBedelVeTakdirTab'
import { UsulVeKararMatrisiTab } from './components/UsulVeKararMatrisiTab'
import { SurecEvraklariTab } from './components/SurecEvraklariTab'
import { IhaleGunuVeTekliflerTab } from './components/IhaleGunuVeTekliflerTab'
import { KiraVeTahsilatTakipTab } from './components/KiraVeTahsilatTakipTab'
import { DosyaYonetimi2886Tab, Dosya2886Item } from './components/DosyaYonetimi2886Tab'
import {
  getInitial2886ActiveDosya,
  getInitial2886Dosyalar,
  persist2886ActiveDosya,
  persist2886Dosyalar
} from '../../components/layout/temin-selector/teminSelector.storage'
import { DEFAULT_2886_DOSYALAR } from '../../components/layout/temin-selector/teminSelector.constants'

export type TabId2886 =
  | 'dosyalar'
  | 'studyo'
  | 'takdir'
  | 'usul'
  | 'evraklar'
  | 'ihale_gunu'
  | 'tahsilat'

interface MenuItem {
  id: TabId2886
  stepNum: number
  label: string
  subtitle: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

interface MenuGroup {
  groupTitle: string
  items: MenuItem[]
}

export default function DevletIhale2886Screen(): React.JSX.Element {
  const [allDosyalar, setAllDosyalar] = useState<Dosya2886Item[]>(() => {
    const list = getInitial2886Dosyalar()
    if (list.length === 0) {
      persist2886Dosyalar(DEFAULT_2886_DOSYALAR)
      return DEFAULT_2886_DOSYALAR
    }
    return list
  })

  const [selectedDosya, setSelectedDosya] = useState<Dosya2886Item | null>(() => {
    const active = getInitial2886ActiveDosya()
    if (active) return active
    const list = getInitial2886Dosyalar()
    return list.length > 0 ? list[0] : null
  })

  const [islemTuru, setIslemTuru] = useState<IslemTuru2886>(() => {
    if (selectedDosya) {
      return selectedDosya.islemTuru === 'irtifak_hakki'
        ? 'irtifak'
        : (selectedDosya.islemTuru as IslemTuru2886)
    }
    return 'satis'
  })

  const [activeTab, setActiveTab] = useState<TabId2886>('dosyalar')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  // Header and storage synchronizer
  useEffect(() => {
    const handleSync = (): void => {
      const list = getInitial2886Dosyalar()
      setAllDosyalar(list)
      const active = getInitial2886ActiveDosya()
      if (active) {
        setSelectedDosya(active)
        setIslemTuru(
          active.islemTuru === 'irtifak_hakki' ? 'irtifak' : (active.islemTuru as IslemTuru2886)
        )
      }
    }

    window.addEventListener('devlet-ihale-2886-reloaded', handleSync)
    window.addEventListener('storage', handleSync)
    return () => {
      window.removeEventListener('devlet-ihale-2886-reloaded', handleSync)
      window.removeEventListener('storage', handleSync)
    }
  }, [])

  // Listen to URL ?tab=
  useEffect(() => {
    const handleUrlTab = (): void => {
      const searchParams = new URLSearchParams(window.location.search)
      const tabParam = searchParams.get('tab')
      if (
        tabParam &&
        ['dosyalar', 'studyo', 'takdir', 'usul', 'evraklar', 'ihale_gunu', 'tahsilat'].includes(
          tabParam
        )
      ) {
        setActiveTab(tabParam as TabId2886)
      }
    }

    handleUrlTab()
    window.addEventListener('popstate', handleUrlTab)
    return () => window.removeEventListener('popstate', handleUrlTab)
  }, [])

  const handleSelectDosya = (dosya: Dosya2886Item | null): void => {
    setSelectedDosya(dosya)
    persist2886ActiveDosya(dosya)
    if (dosya) {
      setIslemTuru(
        dosya.islemTuru === 'irtifak_hakki' ? 'irtifak' : (dosya.islemTuru as IslemTuru2886)
      )
    }
  }

  const handleRestoreSamples = (): void => {
    persist2886Dosyalar(DEFAULT_2886_DOSYALAR)
    setAllDosyalar(DEFAULT_2886_DOSYALAR)
    if (DEFAULT_2886_DOSYALAR.length > 0) {
      handleSelectDosya(DEFAULT_2886_DOSYALAR[0])
    }
  }

  const menuGroups: MenuGroup[] = [
    {
      groupTitle: '1. Dosya & Hazırlık',
      items: [
        {
          id: 'dosyalar',
          stepNum: 1,
          label: 'İhale Dosyaları Yönetimi',
          subtitle: 'Kayıt, liste ve dosya detayları',
          icon: FolderOpen,
          badge: 'Dosya Masası'
        },
        {
          id: 'takdir',
          stepNum: 2,
          label: 'Taşınmaz & Kıymet Takdiri',
          subtitle: 'Muhammen bedel & Takdir komisyonu',
          icon: Calculator,
          badge: 'Takdir'
        }
      ]
    },
    {
      groupTitle: '2. Mevzuat & Şartname',
      items: [
        {
          id: 'usul',
          stepNum: 3,
          label: 'İhale Usulü & Encümen Kararları',
          subtitle: 'Md. 45 / 36 / 51 Karar matrisi',
          icon: Gavel,
          badge: 'Mevzuat'
        },
        {
          id: 'evraklar',
          stepNum: 4,
          label: 'Süreç Evrakları & İlanlar',
          subtitle: 'Şartname ve 16 resmi evrak',
          icon: FileText,
          badge: '16 Evrak'
        }
      ]
    },
    {
      groupTitle: '3. İhale & Gelir Yönetimi',
      items: [
        {
          id: 'ihale_gunu',
          stepNum: 5,
          label: 'İhale Günü & Teklifler',
          subtitle: 'Açık artırma ve pey sürme tutanağı',
          icon: Layers,
          badge: 'Pey Sürme'
        },
        {
          id: 'tahsilat',
          stepNum: 6,
          label: islemTuru === 'kiralama' ? 'Kira Geliri & Artış Takibi' : 'Tahsilat & Taksit Planı',
          subtitle: '5018 Gelir & Tahakkuk takibi',
          icon: CreditCard,
          badge: '5018 Gelir'
        },
        {
          id: 'studyo',
          stepNum: 7,
          label: 'Dinamik Belge & Form Stüdyosu',
          subtitle: 'Word / TipTap canlı metin editörü',
          icon: Sparkles,
          badge: 'Word Stüdyosu'
        }
      ]
    }
  ]

  const currentMenuItem =
    menuGroups.flatMap((g) => g.items).find((item) => item.id === activeTab) ||
    menuGroups[0].items[0]

  return (
    <div className="w-full min-h-full bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col p-3 md:p-5 gap-4">
      {/* 1. Üst Banner & Aktif Dosya Seçici */}
      <div className="shrink-0 bg-linear-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-2xl p-4 md:p-5 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[11px] font-bold">
              <Landmark className="w-3.5 h-3.5" />
              <span>2886 Sayılı Devlet İhale Kanunu Çalışma Masası</span>
            </div>
            <h1 className="text-lg md:text-xl font-black tracking-tight flex items-center gap-2.5">
              <span>Taşınmaz Satış, Kiralama ve Gelir Yönetimi</span>
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              4734&apos;ten bağımsız gelir odaklı ihale süreçleri, kıymet takdir komisyonu, açık artırma ve tahsilat takibi.
            </p>
          </div>

          {/* Aktif Dosya Seçici ve Hızlı Değiştirici */}
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
            {allDosyalar.length > 0 ? (
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 p-1.5 rounded-2xl">
                <select
                  value={selectedDosya?.id || ''}
                  onChange={(e) => {
                    const found = allDosyalar.find((d) => d.id === e.target.value) || null
                    handleSelectDosya(found)
                  }}
                  className="bg-transparent text-white text-xs font-bold px-2 py-1 outline-none cursor-pointer max-w-[280px] truncate"
                >
                  <option value="" className="bg-slate-900 text-white">
                    -- Bir 2886 İhalesi Seçin --
                  </option>
                  {allDosyalar.map((d) => (
                    <option key={d.id} value={d.id} className="bg-slate-900 text-white">
                      {d.ihaleKayitNo} • {d.ihaleAdi}
                    </option>
                  ))}
                </select>

                {selectedDosya && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('studyo')}
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                    title="Bu dosyanın Word / Şablon Stüdyosunu Aç"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Şablonda Aç</span>
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={handleRestoreSamples}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <FolderSync className="w-3.5 h-3.5" />
                <span>Örnek Dosyaları Yükle</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveTab('dosyalar')}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 border border-white/15"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Yeni Dosya</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Ana Çalışma Masası Alanı (Sol Menü + Sağ İçerik) */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 items-start w-full">
        {/* Sol Menü Sidebar */}
        <aside
          className={`shrink-0 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-2xs transition-all duration-300 flex flex-col ${
            isSidebarCollapsed ? 'w-full md:w-16' : 'w-full md:w-72'
          }`}
        >
          {/* Sidebar Başlık ve Daraltma Düğmesi */}
          <div className="p-3.5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
            {!isSidebarCollapsed && (
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <Building2 className="w-4 h-4 text-indigo-500" />
                <span>2886 Süreç Adımları</span>
              </div>
            )}
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors ml-auto cursor-pointer"
              title={isSidebarCollapsed ? 'Menüyü Genişlet' : 'Menüyü Daralt'}
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Menü Grupları */}
          <div className="p-2 space-y-4 overflow-y-auto custom-scrollbar max-h-[calc(100vh-280px)]">
            {menuGroups.map((group, groupIdx) => (
              <div key={groupIdx} className="space-y-1">
                {!isSidebarCollapsed && (
                  <div className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    {group.groupTitle}
                  </div>
                )}
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon
                    const isActive = activeTab === item.id
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer select-none group relative ${
                          isActive
                            ? 'bg-indigo-600 text-white font-bold shadow-xs'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium'
                        }`}
                        title={isSidebarCollapsed ? item.label : undefined}
                      >
                        <div
                          className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                          }`}
                        >
                          {item.stepNum}
                        </div>
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive
                              ? 'text-white'
                              : 'text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400'
                          }`}
                        />
                        {!isSidebarCollapsed && (
                          <div className="min-w-0 flex-1">
                            <div className="text-xs truncate flex items-center justify-between gap-1">
                              <span>{item.label}</span>
                              {item.badge && (
                                <span
                                  className={`text-[9px] px-1.5 py-0.2 rounded font-mono shrink-0 ${
                                    isActive
                                      ? 'bg-indigo-700 text-indigo-100'
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700'
                                  }`}
                                >
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <div
                              className={`text-[10px] truncate ${
                                isActive ? 'text-indigo-100' : 'text-slate-400 dark:text-slate-500'
                              }`}
                            >
                              {item.subtitle}
                            </div>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Seçili Dosya Kartı (Sidebar Altı) */}
          {!isSidebarCollapsed && selectedDosya && (
            <div className="p-3 m-2 mt-auto rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
                <span>Aktif Dosya</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono">
                  {selectedDosya.ihaleKayitNo}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                {selectedDosya.ihaleAdi}
              </p>
              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                <span>Muhammen Bedel:</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  ₺{Number(selectedDosya.muhammenBedel?.takdirEdilenMuhammenBedel || 0).toLocaleString('tr-TR')}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedDosya(null)
                  persist2886ActiveDosya(null)
                  setActiveTab('dosyalar')
                }}
                className="w-full mt-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Tüm Dosyalara Dön</span>
              </button>
            </div>
          )}
        </aside>

        {/* Sağ Panel: Seçili Ekran İçeriği */}
        <main className="flex-1 min-w-0 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-2xs p-4 md:p-6 space-y-5">
          {/* Ekran Üst Başlığı & İşlem Türü Seçici */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <currentMenuItem.icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {currentMenuItem.label}
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {currentMenuItem.subtitle}
              </p>
            </div>

            {/* İşlem Türü Seçici (Satış, Kiralama, vb.) */}
            <div className="shrink-0">
              <IslemTuruSecici selected={islemTuru} onSelect={setIslemTuru} />
            </div>
          </div>

          {/* Aktif Ekran Bileşeni */}
          <div className="w-full">
            {activeTab === 'dosyalar' && (
              <DosyaYonetimi2886Tab
                activeDosyaId={selectedDosya?.id}
                onSelectDosya={(dosya) => {
                  handleSelectDosya(dosya)
                  setActiveTab('studyo')
                }}
                onOpenStudyo={() => setActiveTab('studyo')}
              />
            )}
            {activeTab === 'studyo' && <BelgeVeSablonStudyoTab initialDosyaId={selectedDosya?.id} />}
            {activeTab === 'takdir' && <MuhammenBedelVeTakdirTab islemTuru={islemTuru} />}
            {activeTab === 'usul' && <UsulVeKararMatrisiTab />}
            {activeTab === 'evraklar' && <SurecEvraklariTab selectedDosya={selectedDosya} />}
            {activeTab === 'ihale_gunu' && <IhaleGunuVeTekliflerTab />}
            {activeTab === 'tahsilat' && <KiraVeTahsilatTakipTab islemTuru={islemTuru} />}
          </div>
        </main>
      </div>
    </div>
  )
}

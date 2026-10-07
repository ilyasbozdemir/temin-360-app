import React, { useState, useEffect } from 'react'
import {
  Calculator,
  CheckCircle2,
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
  ArrowLeft
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
  const [islemTuru, setIslemTuru] = useState<IslemTuru2886>('satis')
  const [activeTab, setActiveTab] = useState<TabId2886>('dosyalar')
  const [selectedDosya, setSelectedDosya] = useState<Dosya2886Item | null>(null)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  // URL'deki ?tab= parametresini dinle
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

  const menuGroups: MenuGroup[] = [
    {
      groupTitle: 'Dosya & Tasarım',
      items: [
        {
          id: 'dosyalar',
          label: 'İhale Dosyaları Yönetimi',
          subtitle: 'Kayıt, liste ve dosya detayları',
          icon: FolderOpen,
          badge: 'Genel Bakış'
        },
        {
          id: 'studyo',
          label: 'Dinamik Belge & Form Stüdyosu',
          subtitle: 'TipTap editörü & Şablon havuzu',
          icon: Sparkles,
          badge: 'Form Builder'
        }
      ]
    },
    {
      groupTitle: 'Komisyon & Karar Süreçleri',
      items: [
        {
          id: 'takdir',
          label: 'Taşınmaz Bilgileri & Kıymet Takdiri',
          subtitle: 'Muhammen bedel & Takdir komisyonu',
          icon: Calculator,
          badge: 'Takdir'
        },
        {
          id: 'usul',
          label: 'İhale Usulü & Encümen Kararları',
          subtitle: 'Md. 45 / 36 / 51 Karar matrisi',
          icon: Gavel,
          badge: 'Mevzuat'
        },
        {
          id: 'evraklar',
          label: 'Süreç Evrakları & İlanlar',
          subtitle: 'Şartname ve 16 resmi evrak',
          icon: FileText,
          badge: '16 Evrak'
        }
      ]
    },
    {
      groupTitle: 'İhale Aşaması & Gelir Yönetimi',
      items: [
        {
          id: 'ihale_gunu',
          label: 'İhale Günü & Teklifler',
          subtitle: 'Açık artırma ve pey sürme tutanağı',
          icon: Layers,
          badge: 'Pey Sürme'
        },
        {
          id: 'tahsilat',
          label: islemTuru === 'kiralama' ? 'Kira Geliri & Artış Takibi' : 'Tahsilat & Taksit Planı',
          subtitle: '5018 Gelir & Tahakkuk takibi',
          icon: CreditCard,
          badge: '5018 Gelir'
        }
      ]
    }
  ]

  // Aktif menü bilgisi
  const currentMenuItem = menuGroups
    .flatMap((g) => g.items)
    .find((item) => item.id === activeTab) || menuGroups[0].items[0]

  return (
    <div className="w-full min-h-full bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col p-3 md:p-5 gap-4">
      {/* 1. Üst Banner */}
      <div className="shrink-0 bg-linear-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-2xl p-4 md:p-5 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[11px] font-bold">
              <Landmark className="w-3.5 h-3.5" />
              <span>2886 Sayılı Devlet İhale Kanunu Çalışma Masası</span>
            </div>
            <h1 className="text-lg md:text-xl font-black tracking-tight flex items-center gap-2.5">
              <span>Taşınmaz Satış, Kiralama ve Gelir Yönetimi</span>
            </h1>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              4734&apos;ten bağımsız gelir odaklı ihale süreçleri, kıymet takdir komisyonu, açık artırma ve tahsilat takibi.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto shrink-0 font-mono">
            {selectedDosya ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
                <div className="text-right">
                  <span className="text-[10px] text-slate-300 uppercase block font-sans">
                    Seçili Dosya
                  </span>
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {selectedDosya.ihaleKayitNo}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDosya(null)
                    setActiveTab('dosyalar')
                  }}
                  className="px-2 py-1 bg-white/10 hover:bg-white/20 text-[11px] text-white rounded-lg transition-colors cursor-pointer"
                  title="Tüm Dosyalara Dön"
                >
                  Değiştir
                </button>
              </div>
            ) : (
              <div className="px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-right">
                <span className="text-[10px] text-slate-300 uppercase block font-sans">
                  Dosya Durumu
                </span>
                <span className="text-xs font-bold text-blue-300">Tüm Dosyalar Masası</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Ana Çalışma Masası Alanı (Sol Menü + Sağ İçerik) */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 items-start">
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
                <span>Süreç Menüsü</span>
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
                <span>Aktif Dosya Özeti</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono">
                  {selectedDosya.ihaleKayitNo}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                {selectedDosya.ihaleAdi}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedDosya(null)
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
                  setSelectedDosya(dosya)
                  setIslemTuru(
                    dosya.islemTuru === 'irtifak_hakki'
                      ? 'irtifak'
                      : (dosya.islemTuru as IslemTuru2886)
                  )
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

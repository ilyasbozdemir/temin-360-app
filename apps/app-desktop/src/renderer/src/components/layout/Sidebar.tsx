import React, { useState, useEffect, useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import {
  BarChart3,
  BookOpen,
  Building2,
  Calculator,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Coins,
  Database,
  FileText,
  FolderKanban,
  FolderOpen,
  FolderTree,
  Hammer,
  HelpCircle,
  Home,
  Key,
  Landmark,
  Layers,
  LayoutGrid,
  LogOut,
  Megaphone,
  PackageSearch,
  Ruler,
  Scale,
  Settings,
  Star,
  Tag,
  User,
  Users,
  Boxes,
  LayoutTemplate
} from 'lucide-react'
import { cn } from '../../utils/cn'
import { useSettingsStore } from '../../store/settingsStore'
import { useWorkspaceStore } from '../../store/workspaceStore'
import { useShallow } from 'zustand/react/shallow'
import { getInitials } from '@renderer/utils/formatters'

interface SubItem {
  name: string
  path: string
  icon: React.ElementType
  badge?: string
}

interface MenuItem {
  name: string
  path?: string
  icon: React.ElementType
  badge?: string
  children?: SubItem[]
  onClick?: () => void
}

interface MenuGroup {
  title: string
  items: MenuItem[]
}

export function Sidebar(): React.JSX.Element {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    new Set([
      '/malzemeler',
      'Malzeme & Kodlar',
      'Malzeme & Kodlar (2886)',
      'Pozlar & OKAS Kodları',
      'Kurum Yönetimi',
      'İdare & Emlak Servisi',
      'İdare & Makam Yönetimi'
    ])
  )
  const {
    institutionName,
    institutionLogo,
    adminName,
    adminTitle,
    adminUsername,
    loadSettings
  } = useSettingsStore(
    useShallow((s) => ({
      institutionName: s.institutionName,
      institutionLogo: s.institutionLogo,
      adminName: s.adminName,
      adminTitle: s.adminTitle,
      adminUsername: s.adminUsername,
      loadSettings: s.loadSettings
    }))
  )
  const { fileName, activeDosyaId } = useWorkspaceStore(
    useShallow((s) => ({
      fileName: s.fileName,
      activeDosyaId: s.activeDosyaId
    }))
  )

  // Mod Seçici Durumu
  const [procurementMode, setProcurementMode] = useState<
    'dogrudan_temin' | 'ihale' | 'devlet_ihale_2886'
  >(() => {
    return (
      (localStorage.getItem('temin_procurement_mode') as
        | 'dogrudan_temin'
        | 'ihale'
        | 'devlet_ihale_2886') || 'dogrudan_temin'
    )
  })

  useEffect(() => {
    const handleModeEvent = (e: Event): void => {
      const customEvent = e as CustomEvent<{
        mode: 'dogrudan_temin' | 'ihale' | 'devlet_ihale_2886'
      }>
      if (customEvent.detail?.mode) {
        setProcurementMode(customEvent.detail.mode)
      }
    }
    window.addEventListener('procurement-mode-change', handleModeEvent)
    return () => window.removeEventListener('procurement-mode-change', handleModeEvent)
  }, [])

  const handleCloseWorkspace = async (): Promise<void> => {
    window.dispatchEvent(new CustomEvent('workspace-close-request'))
  }

  const searchParams = new URLSearchParams(window.location.search)
  const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '')
  const isDosyaWindowMode =
    searchParams.get('mode') === 'dosya_window' || hashParams.get('mode') === 'dosya_window'

  useEffect(() => {
    loadSettings()
  }, [loadSettings])


  const toggleExpanded = (path: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }

  const finalMenuGroups: MenuGroup[] = useMemo(() => {
    if (procurementMode === 'devlet_ihale_2886') {
      return [
        {
          title: '2886 Devlet İhale (Gelir)',
          items: [
            { name: 'Gösterge Paneli', path: '/', icon: Home },
            {
              name: '2886 Satış & Kiralama Masası',
              path: '/devlet-ihale-2886',
              icon: Landmark,
              badge: 'GELİR'
            }
          ]
        },
        {
          title: '2886 Süreç İşlemleri',
          items: [
            {
              name: '🏛️ Satış & Kiralama Masası',
              path: '/devlet-ihale-2886',
              icon: Landmark,
              badge: '2886'
            },
            {
              name: '📊 Muhammen Bedel & Takdir',
              path: '/devlet-ihale-2886',
              icon: Calculator
            },
            {
              name: '⚖️ Usul & Karar Matrisi (Md. 45/36/51)',
              path: '/devlet-ihale-2886',
              icon: Scale
            },
            {
              name: '🔨 İhale Günü & Teklifler',
              path: '/devlet-ihale-2886',
              icon: Hammer
            },
            {
              name: '📑 Süreç & İlan Evrakları (16 Evrak)',
              path: '/devlet-ihale-2886',
              icon: FileText
            },
            {
              name: '💰 Kira Artış & Tahsilat Takibi',
              path: '/devlet-ihale-2886',
              icon: Coins,
              badge: '5018'
            }
          ]
        },
        {
          title: 'Kayıtlar & Tanımlar (2886)',
          items: [
            {
              name: 'İdare & Emlak Servisi',
              icon: Building2,
              children: [
                { name: 'İdare Bilgileri', path: '/kurum', icon: Building2 },
                { name: 'Emlak & İstimlak Servisleri', path: '/birimler', icon: LayoutGrid },
                { name: 'İhale Yetkilileri & Raportörler', path: '/personel', icon: Users },
                { name: 'Encümen & Takdir Komisyonu', path: '/komisyonlar', icon: Users },
                { name: 'Görev Tanımları', path: '/komisyon-gorevleri', icon: Settings }
              ]
            },
            { name: 'İstekliler & Kiracılar / Alıcılar', path: '/firmalar', icon: Building2 },
            {
              name: 'Malzeme & Kodlar (2886)',
              icon: PackageSearch,
              children: [
                {
                  name: 'Taşınmaz & Mal Kataloğu',
                  path: '/malzemeler',
                  icon: PackageSearch
                },
                { name: 'Taşınmaz / Taşınır Kodları', path: '/tasinirkod', icon: FolderTree },
                { name: 'Ölçü Birimleri', path: '/olcubirimleri', icon: Ruler }
              ]
            }
          ]
        },
        {
          title: 'Sistem',
          items: [
            { name: 'Raporlar & Gelir Cetvelleri', path: '/raporlar', icon: BarChart3 },
            { name: '2886 Mevzuat ve Parametreler', path: '/mevzuat', icon: Scale },
            { name: 'Şablon Listesi ve Süreçler', path: '/taslakyonetim', icon: Star },
            { name: 'Sürüm Notları', path: '/changelog', icon: Megaphone },
            { name: 'Yardım & Kılavuzlar', path: '/yardim', icon: HelpCircle },
            {
              name: 'Ayarlar',
              icon: Settings,
              children: [
                { name: 'Genel Ayarlar', path: '/ayarlar', icon: Settings },
                { name: 'Kullanıcı Profili & Şifre', path: '/profil', icon: User },
                { name: 'Mevzuat ve Parametreler', path: '/mevzuat', icon: Scale },
                { name: 'Toplu İçe Aktarma', path: '/import', icon: Database },
                {
                  name: 'Form Builder v2 (Sürükle & Bırak)',
                  path: '/form-builder',
                  icon: LayoutTemplate,
                  badge: 'YENİ'
                },
                { name: 'Şablon Yönetimi', path: '/sablonlar', icon: FileText },
                { name: 'Şablon & Kategori Yönetimi', path: '/degiskenler', icon: Key }
              ]
            }
          ]
        }
      ]
    }

    if (procurementMode === 'ihale') {
      return [
        {
          title: 'İhale Süreçleri (KİK 19/21)',
          items: [
            { name: 'Gösterge Paneli', path: '/', icon: Home },
            {
              name: 'Harcama & İhale Merkezi',
              path: '/harcama-merkezi',
              icon: Landmark,
              badge: 'KİK'
            },
            {
              name: 'İhale Hakediş & Harcama',
              path: '/hakedis',
              icon: Hammer,
              badge: 'HAKEDİŞ'
            }
          ]
        },
        {
          title: 'İhale Süreç Yönetimi',
          items: [
            ...(activeDosyaId
              ? [
                  {
                    name: 'Aktif Dosya (Süreç Takip)',
                    path: '/takip',
                    icon: FolderOpen,
                    badge: 'AÇIK'
                  }
                ]
              : []),
            {
              name: 'Açık & Pazarlık İhale Masası',
              path: '/harcama-merkezi',
              icon: Landmark,
              badge: '19/21'
            },
            {
              name: 'Hakediş & Harcama İşlemleri',
              path: '/hakedis',
              icon: Hammer,
              badge: 'YENİ'
            },
            {
              name: 'İhale & Hesaplama Araçları',
              path: '/hesaplama-araclari',
              icon: Calculator,
              badge: '4734/2886'
            },
            {
              name: 'Proje Yönetimi & Yatırımlar',
              path: '/projeler',
              icon: FolderKanban
            },
            {
              name: 'Şablon Listesi ve Dokümanlar',
              path: '/taslakyonetim',
              icon: Star
            }
          ]
        },
        {
          title: 'Kayıtlar & Tanımlar (İhale)',
          items: [
            {
              name: 'İdare & Makam Yönetimi',
              icon: Building2,
              children: [
                { name: 'İdare Bilgileri', path: '/kurum', icon: Building2 },
                { name: 'İhale Birimleri (EKAP)', path: '/birimler', icon: LayoutGrid },
                { name: 'İhale Yetkilileri & Raportörler', path: '/personel', icon: Users },
                { name: 'İhale Komisyonları (Md. 6)', path: '/komisyonlar', icon: Users },
                { name: 'Muayene & Kabul Heyetleri', path: '/komisyonlar', icon: Users },
                { name: 'Görev Tanımları', path: '/komisyon-gorevleri', icon: Settings }
              ]
            },
            { name: 'Müteahhit & İstekli Firmalar', path: '/firmalar', icon: Building2 },
            {
              name: 'Pozlar & OKAS Kodları',
              icon: PackageSearch,
              children: [
                { name: 'ÇŞB Birim Fiyat Pozları', path: '/pozlar', icon: BookOpen },
                { name: 'OKAS Kodları', path: '/okaskod', icon: Tag },
                { name: 'Bütçe Kodları (4 Düzey)', path: '/butcekod', icon: Coins },
                {
                  name: 'Mal, Hizmet & Yapım Kataloğu',
                  path: '/malzemeler',
                  icon: PackageSearch
                },
                { name: 'Ölçü Birimleri', path: '/olcubirimleri', icon: Ruler }
              ]
            }
          ]
        },
        {
          title: 'Sistem',
          items: [
            { name: 'Raporlar & Harcama Analizleri', path: '/raporlar', icon: BarChart3 },
            { name: 'İhale Mevzuatı ve Parametreler', path: '/mevzuat', icon: Scale },
            { name: 'Sürüm Notları', path: '/changelog', icon: Megaphone },
            { name: 'Yardım & Kılavuzlar', path: '/yardim', icon: HelpCircle },
            {
              name: 'Ayarlar',
              icon: Settings,
              children: [
                { name: 'Genel Ayarlar', path: '/ayarlar', icon: Settings },
                { name: 'Kullanıcı Profili & Şifre', path: '/profil', icon: User },
                { name: 'Mevzuat ve Parametreler', path: '/mevzuat', icon: Scale },
                { name: 'Toplu İçe Aktarma', path: '/import', icon: Database },
                {
                  name: 'Form Builder v2 (Sürükle & Bırak)',
                  path: '/form-builder',
                  icon: LayoutTemplate,
                  badge: 'YENİ'
                },
                { name: 'Şablon Yönetimi', path: '/sablonlar', icon: FileText },
                { name: 'Şablon & Kategori Yönetimi', path: '/degiskenler', icon: Key }
              ]
            }
          ]
        }
      ]
    }

    // Doğrudan Temin (Varsayılan)
    const baseGroups: MenuGroup[] = [
      {
        title: 'Ana Menü',
        items: [
          { name: 'Gösterge Paneli', path: '/', icon: Home },
          {
            name: 'Doğrudan Temin Dosyaları',
            path: '/dosyalar',
            icon: FileText,
            badge: '22'
          },
          {
            name: 'Harcama & Hakediş Merkezi',
            path: '/harcama-merkezi',
            icon: Landmark,
            badge: 'YENİ'
          }
        ]
      },
      {
        title: 'Süreç Yönetimi',
        items: [
          ...(activeDosyaId
            ? [
                {
                  name: 'Aktif Dosya (Süreç Takip)',
                  path: '/takip',
                  icon: FolderOpen,
                  badge: 'AÇIK'
                },
                {
                  name: 'Süreç Akış Haritası',
                  path: '/surec-akisi',
                  icon: Layers,
                  badge: 'BETA'
                }
              ]
            : []),
          {
            name: 'Doğrudan Temin Dosyaları',
            path: '/dosyalar',
            icon: FileText
          },
          {
            name: 'Proje Yönetimi & Yatırımlar',
            path: '/projeler',
            icon: FolderKanban,
            badge: 'YENİ'
          },
          {
            name: 'Hızlı Dosya Ekle / Güncelle',
            path: '/hizli-dosya-ekle',
            icon: Database
          },
          {
            name: 'Süreç Akış Haritası',
            path: '/surec-akisi',
            icon: Layers,
            badge: 'BETA'
          },
          {
            name: 'Hakediş & Harcama İşlemleri',
            path: '/hakedis',
            icon: Hammer
          },
          {
            name: 'İhale & Hesaplama Araçları',
            path: '/hesaplama-araclari',
            icon: Calculator,
            badge: '4734/2886'
          }
        ]
      },
      {
        title: 'Kayıtlar & Tanımlar',
        items: [
          {
            name: 'Kurum Yönetimi',
            icon: Building2,
            children: [
              { name: 'Kurum Bilgileri', path: '/kurum', icon: Building2 },
              { name: 'Birim Yönetimi', path: '/birimler', icon: LayoutGrid },
              { name: 'Personel Yönetimi', path: '/personel', icon: Users },
              { name: 'Ambar & Stok Yönetimi', path: '/ambar', icon: Boxes },
              { name: 'Proje Yönetimi & Yatırımlar', path: '/projeler', icon: FolderKanban },
              { name: 'Komisyon Yönetimi', path: '/komisyonlar', icon: Users },
              {
                name: 'Görev Tanımları',
                path: '/komisyon-gorevleri',
                icon: Settings
              }
            ]
          },
          { name: 'İstekli Firma Yönetimi', path: '/firmalar', icon: Building2 },
          {
            name: 'Malzeme & Kodlar',
            icon: PackageSearch,
            children: [
              {
                name: 'Mal, Hizmet & Yapım Kataloğu',
                path: '/malzemeler',
                icon: PackageSearch
              },
              { name: 'Taşınır Kodları', path: '/tasinirkod', icon: FolderTree },
              { name: 'OKAS Kodları', path: '/okaskod', icon: Tag },
              { name: 'Bütçe Kodları (4 Düzey)', path: '/butcekod', icon: Coins },
              { name: 'Birim Fiyat Pozları', path: '/pozlar', icon: BookOpen },
              { name: 'Ölçü Birimleri', path: '/olcubirimleri', icon: Ruler }
            ]
          }
        ]
      },
      {
        title: 'Sistem',
        items: [
          { name: 'Raporlar', path: '/raporlar', icon: BarChart3 },
          {
            name: 'Şablon Listesi ve Süreçler',
            path: '/taslakyonetim',
            icon: Star
          },
          { name: 'Sürüm Notları', path: '/changelog', icon: Megaphone },
          { name: 'Yardım & Kılavuzlar', path: '/yardim', icon: HelpCircle },
          {
            name: 'Ayarlar',
            icon: Settings,
            children: [
              { name: 'Genel Ayarlar', path: '/ayarlar', icon: Settings },
              { name: 'Kullanıcı Profili & Şifre', path: '/profil', icon: User },
              { name: 'Mevzuat ve Parametreler', path: '/mevzuat', icon: Scale },
              { name: 'Toplu İçe Aktarma', path: '/import', icon: Database },
              {
                name: 'Form Builder v2 (Sürükle & Bırak)',
                path: '/form-builder',
                icon: LayoutTemplate,
                badge: 'YENİ'
              },
              {
                name: 'Şablon Yönetimi',
                path: '/sablonlar',
                icon: FileText
              },
              {
                name: 'Şablon & Kategori Yönetimi',
                path: '/degiskenler',
                icon: Key
              }
            ]
          }
        ]
      }
    ]

    return baseGroups
  }, [procurementMode, activeDosyaId])

  return (
    <div
      className={cn(
        'h-screen bg-sidebar-bg text-sidebar-text flex flex-col shadow-xl shrink-0 transition-all duration-300 relative z-50 border-r border-sidebar-border',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      <button
        type="button"
        className={cn(
          'absolute -right-3.5 top-1/2 -translate-y-1/2 z-50',
          'flex items-center justify-center',
          'w-7 h-7 rounded-full cursor-pointer group',
          'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white',
          'border-2 border-slate-50 dark:border-slate-950',
          'shadow-md hover:shadow-lg hover:scale-110 active:scale-95',
          'transition-all duration-300 ease-out'
        )}
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        onClick={(e) => {
          e.stopPropagation()
          setIsCollapsed(!isCollapsed)
        }}
        title={isCollapsed ? 'Menüyü Genişlet' : 'Menüyü Daralt'}
      >
        {isCollapsed ? (
          <ChevronRight
            size={16}
            className="transition-transform duration-200 group-hover:translate-x-0.5"
          />
        ) : (
          <ChevronLeft
            size={16}
            className="transition-transform duration-200 group-hover:-translate-x-0.5"
          />
        )}
      </button>

      <div
        className={cn(
          'flex flex-col items-center border-b border-sidebar-border transition-all duration-300',
          isCollapsed ? 'py-4 px-0' : 'py-6 px-4'
        )}
      >
        <div
          className={cn(
            'flex items-center justify-center transition-all duration-300 shrink-0',
            isCollapsed ? 'w-10 h-10' : 'w-16 h-16'
          )}
        >
          {institutionLogo ? (
            <img src={institutionLogo} alt="Logo" className="w-full h-full object-contain" />
          ) : (
            <Building2
              className={cn('text-sidebar-active-text', isCollapsed ? 'w-6 h-6' : 'w-10 h-10')}
            />
          )}
        </div>
        {!isCollapsed && (
          <div className="flex flex-col items-center mt-3 text-center w-full px-1">
            <span className="text-sidebar-text/70 text-[10px] font-semibold tracking-wider uppercase mt-1 w-full px-2 wrap-break-word leading-normal">
              {institutionName}
            </span>

            <span className="text-sidebar-hover-text font-bold text-base tracking-wide whitespace-nowrap leading-tight mt-1 flex items-center gap-1.5 justify-center">
              TEMİN 360
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 custom-scrollbar">
        {finalMenuGroups.map((group, idx) => (
          <div key={idx} className="space-y-1.5">
            {!isCollapsed && (
              <h3 className="px-3 text-[10px] font-bold text-sidebar-text/50 uppercase tracking-widest">
                {group.title}
              </h3>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const itemKey = item.path || item.name
                const isExpanded = expandedItems.has(itemKey)
                const hasChildren = item.children && item.children.length > 0

                return (
                  <li key={item.name}>
                    <div
                      className="flex items-center gap-1"
                      onClick={() => {
                        if (hasChildren && !item.path) {
                          toggleExpanded(itemKey)
                        }
                      }}
                    >
                      {item.path ? (
                        <Link
                          to={item.path}
                          onClick={() => {
                            if (item.onClick) {
                              item.onClick()
                            }
                          }}
                          className={cn(
                            'flex-1 flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 border border-transparent cursor-pointer',
                            'hover:bg-sidebar-hover-bg hover:text-sidebar-hover-text',
                            'active:scale-[0.98]'
                          )}
                          activeProps={{
                            className:
                              'bg-sidebar-active-bg text-sidebar-active-text border-sidebar-active-border shadow-sm shadow-blue-500/5 font-bold'
                          }}
                        >
                          <item.icon size={18} className="shrink-0" />
                          {!isCollapsed && (
                            <span className="text-sm font-medium whitespace-nowrap flex-1 flex items-center justify-between">
                              <span>{item.name}</span>
                              {item.badge && (
                                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-500 border border-indigo-500/30">
                                  {item.badge}
                                </span>
                              )}
                            </span>
                          )}
                        </Link>
                      ) : (
                        <div
                          className={cn(
                            'flex-1 flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 border border-transparent cursor-pointer text-sidebar-text/80',
                            'hover:bg-sidebar-hover-bg hover:text-sidebar-hover-text',
                            'active:scale-[0.98]'
                          )}
                        >
                          <item.icon size={18} className="shrink-0" />
                          {!isCollapsed && (
                            <span className="text-sm font-medium whitespace-nowrap flex-1">
                              {item.name}
                            </span>
                          )}
                        </div>
                      )}

                      {hasChildren && !isCollapsed && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleExpanded(itemKey)
                          }}
                          className="p-1 rounded-md hover:bg-sidebar-hover-bg text-sidebar-text/50 hover:text-sidebar-hover-text transition-all cursor-pointer"
                          title={isExpanded ? 'Kapat' : 'Genişlet'}
                        >
                          <ChevronDown
                            size={13}
                            className={cn(
                              'transition-transform duration-200',
                              isExpanded ? 'rotate-0' : '-rotate-90'
                            )}
                          />
                        </button>
                      )}
                    </div>

                    {hasChildren && !isCollapsed && isExpanded && (
                      <ul className="mt-0.5 ml-4 pl-3 border-l border-sidebar-border/40 space-y-0.5">
                        {item.children!.map((child) => (
                          <li key={child.name}>
                            <Link
                              to={child.path}
                              className={cn(
                                'flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border border-transparent cursor-pointer',
                                'hover:bg-sidebar-hover-bg hover:text-sidebar-hover-text',
                                'active:scale-[0.98] text-sidebar-text/80'
                              )}
                              activeProps={{
                                className:
                                  'bg-sidebar-active-bg text-sidebar-active-text border-sidebar-active-border shadow-sm font-bold'
                              }}
                            >
                              <child.icon size={14} className="shrink-0 opacity-70" />
                              <span className="whitespace-nowrap">{child.name}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}

                    {hasChildren && isCollapsed && (
                      <ul className="mt-0.5 space-y-0.5">
                        {item.children!.map((child) => (
                          <li key={child.name}>
                            <Link
                              to={child.path}
                              title={child.name}
                              className={cn(
                                'flex items-center justify-center px-3 py-1.5 rounded-lg transition-all duration-200 border border-transparent cursor-pointer',
                                'hover:bg-sidebar-hover-bg hover:text-sidebar-hover-text'
                              )}
                              activeProps={{
                                className:
                                  'bg-sidebar-active-bg text-sidebar-active-text border-sidebar-active-border shadow-sm'
                              }}
                            >
                              <child.icon size={15} className="shrink-0 opacity-70" />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-sidebar-border space-y-3">
        <Link
          to="/profil"
          className={cn(
            'flex items-center rounded-md bg-sidebar-hover-bg/50 hover:bg-sidebar-hover-bg transition-all border border-transparent hover:border-sidebar-border cursor-pointer',
            isCollapsed ? 'justify-center p-2' : 'px-2 py-2'
          )}
          title="Kullanıcı Profili ve Güvenlik Ayarlarına Git"
        >
          <div className="w-8 h-8 flex items-center justify-center shrink-0">
            <div className="w-full h-full rounded-full bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center border border-sidebar-border/30 shadow-xs">
              <span className="text-xs font-bold">
                {getInitials(adminName || adminUsername || 'SY')}
              </span>
            </div>
          </div>
          {!isCollapsed && (
            <div className="ml-3 overflow-hidden flex-1 text-left">
              <p
                className="text-sm font-bold text-sidebar-hover-text truncate leading-tight"
                title={adminName || adminUsername}
              >
                {adminName || adminUsername || 'Sistem Yöneticisi'}
              </p>
              <p
                className="text-[10px] text-sidebar-text/75 truncate mt-0.5"
                title={adminTitle || 'Kullanıcı Profili'}
              >
                {adminTitle || 'Kullanıcı Profili'}
              </p>
            </div>
          )}
        </Link>

        <button
          onClick={handleCloseWorkspace}
          className={cn(
            'w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-sidebar-text/80 hover:text-red-400 hover:bg-red-500/10 transition-colors border border-sidebar-border hover:border-red-500/20',
            isCollapsed ? 'py-2 px-0' : 'py-2'
          )}
          title="Çalışma Dosyasını Kapat"
        >
          <LogOut size={16} />
          {!isCollapsed && <span>Çalışma Dosyasını Kapat</span>}
        </button>

        {!isCollapsed && (
          <Link
            to="/dosya"
            className="text-[10px] text-center text-sidebar-text/50 font-medium px-2 py-1 truncate bg-sidebar-hover-bg/30 rounded border border-sidebar-border/40 hover:bg-sidebar-hover-bg hover:text-sidebar-hover-text transition-all block cursor-pointer active:scale-95"
            title="Veri Dosyası Detaylarını Göster"
          >
            Dosya: {fileName}
          </Link>
        )}
      </div>
    </div>
  )
}

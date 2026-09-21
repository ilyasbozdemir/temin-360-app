import React from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import {
  Briefcase,
  Building2,
  ClipboardList,
  FolderKanban,
  HelpCircle,
  Home,
  LayoutGrid,
  LayoutTemplate,
  PackageSearch,
  UserCheck,
  Users,
  Warehouse
} from 'lucide-react'
import { cn } from '../../utils/cn'
import { useSettingsStore } from '../../store/settingsStore'

interface ShortcutItem {
  name: string
  path: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}

export function ActiveFileShortcuts(): React.JSX.Element {
  const router = useRouterState()
  const currentPath = router.location.pathname
  const { adminUsername, adminName, institutionLogo } = useSettingsStore()

  const primaryItems: ShortcutItem[] = [
    {
      name: 'Gösterge Paneli',
      path: '/',
      icon: Home,
      color: 'hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20'
    },
    {
      name: 'Kurum Bilgileri',
      path: '/kurum',
      icon: Building2,
      color: 'hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20'
    },
    {
      name: 'Birim Yönetimi',
      path: '/birimler',
      icon: LayoutGrid,
      color: 'hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/20'
    },
    {
      name: 'Personel Yönetimi',
      path: '/personel',
      icon: Users,
      color: 'hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'
    },
    {
      name: 'İstekli Firmalar',
      path: '/firmalar',
      icon: Briefcase,
      color: 'hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/20'
    },
    {
      name: 'Malzeme & Kalemler',
      path: '/malzemeler',
      icon: PackageSearch,
      color: 'hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20'
    },
    {
      name: 'Komisyon Yönetimi',
      path: '/komisyonlar',
      icon: UserCheck,
      color: 'hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'
    },
    {
      name: 'Ambar Yönetimi',
      path: '/ambar',
      icon: Warehouse,
      color: 'hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/20'
    },
    {
      name: 'Proje Yönetimi',
      path: '/projeler',
      icon: FolderKanban,
      color: 'hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20'
    }
  ]

  const secondaryItems: ShortcutItem[] = [
    {
      name: 'Süreç Takip & Durum',
      path: '/takip',
      icon: ClipboardList,
      color: 'hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'
    },
    {
      name: 'Şablon Yönetimi',
      path: '/sablonlar',
      icon: LayoutTemplate,
      color: 'hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20'
    },
    {
      name: 'Yardım & Kılavuzlar',
      path: '/yardim',
      icon: HelpCircle,
      color: 'hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20'
    }
  ]

  const renderLink = (item: ShortcutItem): React.JSX.Element => {
    const isActive = currentPath === item.path
    const Icon = item.icon

    return (
      <Link
        key={item.path}
        to={item.path as any}
        className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 border cursor-pointer relative group',
          isActive
            ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/25 scale-105'
            : 'bg-transparent border-transparent text-slate-500 hover:scale-105',
          !isActive && item.color
        )}
      >
        <Icon className="w-5 h-5" />

        {/* Tooltip */}
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 hidden group-hover:block z-50 bg-slate-900 text-white text-xs rounded-lg py-1.5 px-3 shadow-xl whitespace-nowrap">
          {item.name}
        </div>
      </Link>
    )
  }

  const getInitials = (name: string): string => {
    if (!name) return 'SY'
    return name
      .split(' ')
      .map((n) => n[0])
      .filter(Boolean)
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const userInitials = getInitials(adminName || '')

  return (
    <div className="h-full w-16 bg-white dark:bg-slate-900 border-r border-slate-250 dark:border-slate-800/80 flex flex-col justify-between py-4 shrink-0 z-30 select-none">
      {/* Top Section: Primary Navigation */}
      <div className="w-full flex flex-col items-center gap-2.5 px-2">
        {primaryItems.map(renderLink)}
      </div>

      {/* Bottom Section: Secondary Nav & Profile Avatar */}
      <div className="w-full flex flex-col items-center gap-2.5 px-2">
        <div className="w-8 h-px bg-slate-200 dark:bg-slate-800 my-1" />
        {secondaryItems.map(renderLink)}

        {/* User Profile Avatar (PP) */}
        {adminUsername && (
          <Link
            to="/profil"
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-[11px] transition-all duration-200 border cursor-pointer relative group mt-1.5 overflow-hidden bg-white dark:bg-slate-900',
              currentPath === '/profil'
                ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/25 scale-105'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-350 hover:scale-105'
            )}
          >
            {institutionLogo ? (
              <img
                src={institutionLogo}
                alt="Profile Logo"
                className="w-full h-full object-contain p-0.5"
              />
            ) : (
              userInitials
            )}

            {/* Tooltip */}
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 hidden group-hover:block z-50 bg-slate-900 text-white text-xs rounded-lg py-1.5 px-3 shadow-xl whitespace-nowrap">
              Kullanıcı: {adminUsername} (Profil)
            </div>
          </Link>
        )}
      </div>
    </div>
  )
}

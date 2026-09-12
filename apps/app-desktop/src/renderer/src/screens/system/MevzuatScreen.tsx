import React from 'react'
import {
  BookOpen,
  Calculator,
  Coins,
  FileCode,
  FileText,
  Library,
  Scale,
  TrendingUp
} from 'lucide-react'
import { InnerMenu, InnerMenuItem } from '../../components/ui/InnerMenu'
import { useLocation, useNavigate } from '@tanstack/react-router'
import { KikLimitleriSection } from './KikLimitleriSection'
import { OranlarTab } from './tabs/OranlarTab'
import { MaliTab } from './tabs/MaliTab'
import { FiyatFarkiTab } from './tabs/FiyatFarkiTab'
import { AsamalarTab } from './tabs/AsamalarTab'
import { BentlerTab } from './tabs/BentlerTab'
import { ButceKodlariTab } from './tabs/ButceKodlariTab'
import { MevzuatKutuphanesiTab } from './tabs/MevzuatKutuphanesiTab'
import { YiUfeEndeksTab } from './tabs/YiUfeEndeksTab'

type MevzuatTabType =
  | 'kutuphane'
  | 'limitler'
  | 'oranlar'
  | 'mali'
  | 'butcekodlari'
  | 'asamalar'
  | 'bentler'
  | 'fiyatfarki'
  | 'yi-ufe'

export function MevzuatScreen(): React.JSX.Element {
  const location = useLocation()
  const navigate = useNavigate()

  function isValidTab(val: string): val is MevzuatTabType {
    return [
      'kutuphane',
      'limitler',
      'oranlar',
      'mali',
      'butcekodlari',
      'asamalar',
      'bentler',
      'fiyatfarki',
      'yi-ufe'
    ].includes(val)
  }

  // Hash veya search params üzerinden tab parametresini çözümle
  const parseTabParam = (): MevzuatTabType => {
    const searchObj = location.search as Record<string, unknown> | string | undefined
    if (searchObj && typeof searchObj === 'object' && 'tab' in searchObj) {
      const val = String(searchObj.tab)
      if (isValidTab(val)) return val
    }
    if (typeof searchObj === 'string' && searchObj) {
      const p = new URLSearchParams(searchObj)
      const val = p.get('tab')
      if (val && isValidTab(val)) return val
    }
    if (typeof window !== 'undefined' && window.location.hash.includes('?')) {
      const query = window.location.hash.slice(window.location.hash.indexOf('?'))
      const p = new URLSearchParams(query)
      const val = p.get('tab')
      if (val && isValidTab(val)) return val
    }
    return 'kutuphane'
  }

  const activeTab = parseTabParam()

  const handleTabChange = (tabId: string): void => {
    navigate({
      to: '/mevzuat',
      search: (prev: any) => ({ ...prev, tab: tabId })
    })
  }

  const menuItems: InnerMenuItem[] = [
    {
      id: 'kutuphane',
      label: 'Mevzuat Kütüphanesi',
      description: 'Kanun, yönetmelik, tebliğler',
      icon: <Library className="w-4 h-4 shrink-0 text-teal-600 dark:text-teal-400" />
    },
    { id: 'div0', label: '', icon: null, isDivider: true },
    {
      id: 'limitler',
      label: 'KİK Kanun Limitleri',
      description: 'Madde 22/d dönem limitleri',
      icon: <Scale className="w-4 h-4 shrink-0" />
    },
    {
      id: 'oranlar',
      label: 'Vergi & Kesinti Oranları',
      description: 'KDV, Damga, Tevkifat vb.',
      icon: <Calculator className="w-4 h-4 shrink-0" />
    },
    {
      id: 'fiyatfarki',
      label: 'Fiyat Farkı Katsayıları',
      description: 'Kararname endeksleri',
      icon: <Coins className="w-4 h-4 shrink-0" />
    },
    {
      id: 'yi-ufe',
      label: 'Yİ-ÜFE Endeksleri (TÜİK)',
      description: '1994-2026 Fiyat Farkı & Değerleme',
      icon: <TrendingUp className="w-4 h-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
    },
    { id: 'div1', label: '', icon: null, isDivider: true },
    {
      id: 'mali',
      label: 'Kurumsal Mali Kodlar',
      description: 'Fonksiyonel, muhasebe birimi',
      icon: <FileCode className="w-4 h-4 shrink-0" />
    },
    {
      id: 'butcekodlari',
      label: 'ABS Bütçe Kodları',
      description: 'Ekonomik gelir/gider',
      icon: <FileText className="w-4 h-4 shrink-0" />
    },
    { id: 'div2', label: '', icon: null, isDivider: true },
    {
      id: 'asamalar',
      label: 'İşlem Aşamaları',
      description: 'Varsayılan işlem sıraları',
      icon: <FileText className="w-4 h-4 shrink-0" />
    },
    {
      id: 'bentler',
      label: 'Madde 22 Bentleri',
      description: 'Kanun madde içerikleri',
      icon: <BookOpen className="w-4 h-4 shrink-0" />
    }
  ]

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Scale className="w-6 h-6 text-blue-500" />
            Mevzuat ve Sistem Parametreleri
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Uygulama genelinde kullanılacak 4734 Sayılı K.İ.K yasal limitlerini ve oranları buradan
            yönetebilirsiniz.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start flex-1 min-h-0">
        {/* SOL MENÜ */}
        <InnerMenu
          className="lg:col-span-3 shrink-0"
          items={menuItems}
          activeId={activeTab}
          onChange={handleTabChange}
        />

        {/* SAĞ PANEL */}
        <div className="lg:col-span-9 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm min-h-[450px] flex flex-col overflow-y-auto max-h-[calc(100vh-220px)] custom-scrollbar flex-1">
          {activeTab === 'kutuphane' && <MevzuatKutuphanesiTab />}
          {activeTab === 'limitler' && (
            <div className="p-6">
              <KikLimitleriSection />
            </div>
          )}
          {activeTab === 'oranlar' && <OranlarTab />}
          {activeTab === 'mali' && <MaliTab />}
          {activeTab === 'fiyatfarki' && (
            <div className="p-6">
              <FiyatFarkiTab />
            </div>
          )}
          {activeTab === 'yi-ufe' && (
            <div className="p-6">
              <YiUfeEndeksTab />
            </div>
          )}
          {activeTab === 'butcekodlari' && (
            <div className="p-6">
              <ButceKodlariTab />
            </div>
          )}
          {activeTab === 'asamalar' && (
            <div className="p-6">
              <AsamalarTab />
            </div>
          )}
          {activeTab === 'bentler' && (
            <div className="p-6">
              <BentlerTab />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

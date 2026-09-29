import React from 'react'
import { UserCheck, Users } from 'lucide-react'
import type { KomisyonType } from './types'

interface KomisyonAtamaTabsProps {
  activeTab: KomisyonType
  onSelectTab: (tab: KomisyonType) => void
}

export const KomisyonAtamaTabs: React.FC<KomisyonAtamaTabsProps> = ({
  activeTab,
  onSelectTab
}) => {
  return (
    <div className="flex border-b border-slate-200 dark:border-slate-800 -mx-2 px-2 gap-1 pb-1">
      <button
        type="button"
        onClick={() => onSelectTab('yaklasik_maliyet')}
        className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
          activeTab === 'yaklasik_maliyet'
            ? 'bg-blue-600 text-white shadow-xs'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
      >
        <Users className="w-3.5 h-3.5" />
        Yaklaşık Maliyet &amp; Piyasa Fiyat Araştırma Komisyonu
      </button>
      <button
        type="button"
        onClick={() => onSelectTab('muayene_kabul')}
        className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
          activeTab === 'muayene_kabul'
            ? 'bg-blue-600 text-white shadow-xs'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
      >
        <UserCheck className="w-3.5 h-3.5" />
        Muayene Kabul ve Tespit Komisyonu
      </button>
    </div>
  )
}

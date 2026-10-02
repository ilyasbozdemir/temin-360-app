import React, { useState } from 'react'
import {
  Scale,
  Calendar,
  Percent,
  Clock,
  Coins,
  TrendingUp,
  FileSpreadsheet,
  Cpu
} from 'lucide-react'
import {
  UsulBelirleyiciTab,
  VergiVeKesintiTab,
  ResmiTatilVeSureTab,
  GecikmeCezasiTab,
  ButceTavaniTab,
  FiyatFarkiTab,
  ExcelPanoTab,
  FormulMotoruTab
} from './components'

type TabType = 'usul' | 'vergi' | 'sure' | 'ceza' | 'butce' | 'fiyatFarki' | 'pano' | 'formul'

const TABS: { id: TabType; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { id: 'usul', label: 'Alım Usulü Belirleyici', icon: Scale },
  { id: 'vergi', label: 'Vergi & Tevkifat (Brüt ↔ Net)', icon: Coins },
  { id: 'sure', label: 'Resmi Tatil & Süreler', icon: Calendar },
  { id: 'ceza', label: 'Gecikme Cezası & Faiz', icon: Clock },
  { id: 'butce', label: '%10 Bütçe Tavanı', icon: Percent },
  { id: 'fiyatFarki', label: 'TÜİK Fiyat Farkı', icon: TrendingUp },
  { id: 'pano', label: "Excel'den Tablo Alıcı", icon: FileSpreadsheet },
  { id: 'formul', label: 'Dinamik Formül Motoru', icon: Cpu }
]

export default function HesaplamaAraclariScreen(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<TabType>('usul')

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Başlık Banner */}
      <div className="p-6 bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl shadow-xl border border-blue-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shadow-inner">
            <Scale className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
                İhale & Kamu Maliyesi Hesaplama Araçları
              </h1>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                4734 & 2886 Uyumlu
              </span>
            </div>
            <p className="text-xs text-blue-200/80 mt-1">
              Mevzuat eşik değerleri, vergi/tevkifat matrahı, resmi tatil atlamalı iş günü, ceza ve
              bütçe tavanı motoru
            </p>
          </div>
        </div>
      </div>

      {/* Ana Sekmeler */}
      <div className="flex flex-wrap gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Aktif Sekme İçeriği */}
      {activeTab === 'usul' && <UsulBelirleyiciTab />}
      {activeTab === 'vergi' && <VergiVeKesintiTab />}
      {activeTab === 'sure' && <ResmiTatilVeSureTab />}
      {activeTab === 'ceza' && <GecikmeCezasiTab />}
      {activeTab === 'butce' && <ButceTavaniTab />}
      {activeTab === 'fiyatFarki' && <FiyatFarkiTab />}
      {activeTab === 'pano' && <ExcelPanoTab />}
      {activeTab === 'formul' && <FormulMotoruTab />}
    </div>
  )
}

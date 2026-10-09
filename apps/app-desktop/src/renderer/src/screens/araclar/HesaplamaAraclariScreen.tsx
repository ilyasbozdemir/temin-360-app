import React, { useState } from 'react'
import {
  Scale,
  Calendar,
  Percent,
  Clock,
  Coins,
  TrendingUp,
  FileSpreadsheet,
  Cpu,
  ArrowLeftRight,
  Ruler,
  Calculator
} from 'lucide-react'
import {
  UsulBelirleyiciTab,
  VergiVeKesintiTab,
  ResmiTatilVeSureTab,
  GecikmeCezasiTab,
  ButceTavaniTab,
  FiyatFarkiTab,
  SayiyiYaziyaCevirTab,
  BirimDonusumTab,
  ExcelPanoTab,
  FormulMotoruTab,
  BelgeDonusturucuTab
} from './components'
import { HesapAraclariView } from '../../components/modals/HesapAraclariModal'

type TabType =
  | 'hesap'
  | 'belge'
  | 'usul'
  | 'vergi'
  | 'fiyatFarki'
  | 'yazi'
  | 'birim'
  | 'sure'
  | 'ceza'
  | 'butce'
  | 'pano'
  | 'formul'

const TABS: { id: TabType; label: string; icon: React.ComponentType<{ size?: number }>; badge?: string }[] = [
  { id: 'hesap', label: '🧮 Yüzde & Muhasebe Hesabı (Decimal.js)', icon: Calculator, badge: 'SÜİT' },
  { id: 'belge', label: '📄 Belge & Medya Dönüştürücü (Word/PDF/Görsel)', icon: ArrowLeftRight, badge: 'YENİ' },
  { id: 'usul', label: 'Alım Usulü Belirleyici', icon: Scale },
  { id: 'vergi', label: 'Vergi & Tevkifat (Brüt ↔ Net)', icon: Coins },
  { id: 'fiyatFarki', label: 'TÜİK Fiyat Farkı', icon: TrendingUp },
  { id: 'yazi', label: 'Çift Yönlü Sayı ↔ Yazı', icon: ArrowLeftRight },
  { id: 'birim', label: 'Ölçü Birimi Çevirici', icon: Ruler },
  { id: 'sure', label: 'Resmi Tatil & Süreler', icon: Calendar },
  { id: 'ceza', label: 'Gecikme Cezası & Faiz', icon: Clock },
  { id: 'butce', label: '%10 Bütçe Tavanı', icon: Percent },
  { id: 'pano', label: "Excel'den Tablo Alıcı", icon: FileSpreadsheet },
  { id: 'formul', label: 'Dinamik Formül Motoru', icon: Cpu }
]

export default function HesaplamaAraclariScreen(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<TabType>('hesap')

  return (
    <div className="p-4 md:p-6 w-full space-y-6 animate-in fade-in duration-200">
      {/* Başlık Banner */}
      <div className="p-6 bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl shadow-xl border border-blue-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shadow-inner">
            <Scale className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
                İhale, Belge & Hesaplama Araçları
              </h1>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                4734, 2886 & Ofis Araçları
              </span>
            </div>
            <p className="text-xs text-blue-200/80 mt-1">
              Decimal.js hassas yüzde & finans süiti, Word/Görsel/PDF dönüştürücüler, mevzuat limitleri, vergi/tevkifat, Yİ-ÜFE fiyat farkı ve formül motoru
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
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-blue-600 text-white font-extrabold">
                  {tab.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Aktif Sekme İçeriği */}
      {activeTab === 'hesap' && <HesapAraclariView />}
      {activeTab === 'belge' && <BelgeDonusturucuTab />}
      {activeTab === 'usul' && <UsulBelirleyiciTab />}
      {activeTab === 'vergi' && <VergiVeKesintiTab />}
      {activeTab === 'fiyatFarki' && <FiyatFarkiTab />}
      {activeTab === 'yazi' && <SayiyiYaziyaCevirTab />}
      {activeTab === 'birim' && <BirimDonusumTab />}
      {activeTab === 'sure' && <ResmiTatilVeSureTab />}
      {activeTab === 'ceza' && <GecikmeCezasiTab />}
      {activeTab === 'butce' && <ButceTavaniTab />}
      {activeTab === 'pano' && <ExcelPanoTab />}
      {activeTab === 'formul' && <FormulMotoruTab />}
    </div>
  )
}


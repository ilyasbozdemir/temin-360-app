import React, { useState, useEffect } from 'react'
import {
  FileText,
  BarChart2,
  TrendingUp,
  Wallet,
  Archive,
  ChevronRight,
  Filter,
  Package,
  Layers
} from 'lucide-react'

// Subcomponents
import { KayitFormuView } from './components/KayitFormuView'
import { MalzemeHarcamaView } from './components/MalzemeHarcamaView'
import { DokumanlarView } from './components/DokumanlarView'
import { ButceOdenekView } from './components/ButceOdenekView'
import { AylikOzetView } from './components/AylikOzetView'
import { YillikOzetView } from './components/YillikOzetView'
import { ButceView } from './components/ButceView'
import { RaporFilters } from './raporlar.hooks'

type RaporTipi =
  | 'kayit-formu'
  | 'malzemeler'
  | 'dokumanlar'
  | 'butce-odenek'
  | 'aylik-ozet'
  | 'yillik-ozet'
  | 'butce'

const RAPOR_TIPLERI: { id: RaporTipi; label: string; icon: React.ReactNode; desc: string }[] = [
  {
    id: 'kayit-formu',
    label: 'Doğrudan Temin Harcama Listesi',
    icon: <FileText className="w-5 h-5" />,
    desc: 'Yüklenici firma, bedel, tarih ve yasal madde dökümü'
  },
  {
    id: 'malzemeler',
    label: 'Malzeme & Kalem Bazlı Rapor',
    icon: <Package className="w-5 h-5 text-emerald-600" />,
    desc: 'Alınan malzemeler, hizmetler, miktarlar ve fiyatlar'
  },
  {
    id: 'dokumanlar',
    label: 'İhale / Temin Dokümanları & Arşiv',
    icon: <Archive className="w-5 h-5 text-amber-600" />,
    desc: 'İhalelere eklenen dosyalar, teknik şartnameler ve toplu ZIP indirme'
  },
  {
    id: 'butce-odenek',
    label: 'Bütçe Kodları ve %10 Limit Takibi',
    icon: <Wallet className="w-5 h-5 text-purple-600" />,
    desc: 'Kurumsal kod, tertip, yıllık ödenek ve kalan harcama payı'
  },
  {
    id: 'aylik-ozet',
    label: 'Aylık Dağılım Raporu',
    icon: <BarChart2 className="w-5 h-5" />,
    desc: '12 aylık harcama grafiği ve işlem adedi özeti'
  },
  {
    id: 'yillik-ozet',
    label: 'Yıllık İcmal Raporu',
    icon: <TrendingUp className="w-5 h-5 text-indigo-600" />,
    desc: 'Yıllık harcama toplamı, en çok iş yapılan firmalar'
  },
  {
    id: 'butce',
    label: '4734 Md 62/ı %10 Tavan Raporu',
    icon: <Layers className="w-5 h-5 text-rose-600" />,
    desc: 'Yasal %10 harcama tavanı ve Sayıştay denetim uygunluğu'
  }
]

export default function RaporlarScreen(): React.JSX.Element {
  const [seciliTip, setSeciliTip] = useState<RaporTipi>('kayit-formu')
  const [dinamikYillar, setDinamikYillar] = useState<string[]>([])
  const [seciliYil, setSeciliYil] = useState<string>('2026')
  const [tarihEsasi, setTarihEsasi] = useState<'temin' | 'acilis'>('temin')
  const [tarihBaslangic, setTarihBaslangic] = useState<string>('')
  const [tarihBitis, setTarihBitis] = useState<string>('')
  const [seciliBirim, setSeciliBirim] = useState<string>('tumu')
  const [alimTuru, setAlimTuru] = useState<string>('tumu')
  const [birimlerList, setBirimlerList] = useState<Array<{ id: number; ad: string }>>([])

  useEffect(() => {
    if (typeof window !== 'undefined' && window.electron?.ipcRenderer) {
      window.electron.ipcRenderer
        .invoke('db:query', 'SELECT DISTINCT butce_yili FROM DATA_TeminDosyasi WHERE butce_yili IS NOT NULL ORDER BY butce_yili DESC')
        .then((res: any) => {
          if (res.success && Array.isArray(res.data) && res.data.length > 0) {
            const list = res.data.map((r: any) => String(r.butce_yili))
            setDinamikYillar(list)
            setSeciliYil(list[0])
          } else {
            const curY = new Date().getFullYear().toString()
            setDinamikYillar([curY, '2025', '2024'])
            setSeciliYil(curY)
          }
        })
        .catch(() => {})

      window.electron.ipcRenderer
        .invoke('db:query', 'SELECT id, ad FROM TANIM_Birim WHERE aktif_mi = 1 ORDER BY ad ASC')
        .then((res: any) => {
          if (res.success && Array.isArray(res.data)) {
            setBirimlerList(res.data)
          }
        })
        .catch(() => {})
    }
  }, [])

  const currentFilters: RaporFilters = {
    seciliYil,
    tarihEsasi,
    tarihBaslangic,
    tarihBitis,
    seciliBirim,
    alimTuru
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/50 flex items-center justify-center text-blue-600">
          <BarChart2 className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-800 dark:text-slate-100">
            Kamu Harcama, Doküman & Bütçe Raporları
          </h1>
          <p className="text-xs text-slate-500">
            Doğrudan temin (22/d), ihale dokümanları arşivi ve 4734 Md. 62/ı %10 ödenek takibi
          </p>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sol Panel – Rapor Türü & Detaylı Filtreler */}
        <div className="w-80 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col overflow-y-auto">
          <div className="p-4 space-y-1">
            <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 px-2 mb-2">
              Rapor Türü
            </div>
            {RAPOR_TIPLERI.map((tip) => (
              <button
                key={tip.id}
                onClick={() => setSeciliTip(tip.id)}
                className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                  seciliTip === tip.id
                    ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <span className={`mt-0.5 ${seciliTip === tip.id ? 'text-blue-600' : 'text-slate-400'}`}>
                  {tip.icon}
                </span>
                <div>
                  <div className="text-xs font-bold leading-tight">{tip.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">{tip.desc}</div>
                </div>
                {seciliTip === tip.id && <ChevronRight className="w-4 h-4 ml-auto mt-0.5 text-blue-600 shrink-0" />}
              </button>
            ))}
          </div>

          {/* Filtreler */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-900/50 mt-auto">
            <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-blue-500" /> Rapor Filtreleri
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                Bütçe Yılı
              </label>
              <select
                value={seciliYil}
                onChange={(e) => setSeciliYil(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 font-bold"
              >
                {dinamikYillar.map((y) => <option key={y} value={y}>{y} Yılı</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                Tarih Esası
              </label>
              <div className="grid grid-cols-2 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setTarihEsasi('temin')}
                  className={`py-1 text-[11px] font-bold rounded-lg transition-all ${
                    tarihEsasi === 'temin' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Onay Tarihi
                </button>
                <button
                  type="button"
                  onClick={() => setTarihEsasi('acilis')}
                  className={`py-1 text-[11px] font-bold rounded-lg transition-all ${
                    tarihEsasi === 'acilis' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Açılış Tarihi
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Başlangıç</label>
                <input
                  type="date"
                  value={tarihBaslangic}
                  onChange={(e) => setTarihBaslangic(e.target.value)}
                  className="w-full text-[11px] px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Bitiş</label>
                <input
                  type="date"
                  value={tarihBitis}
                  onChange={(e) => setTarihBitis(e.target.value)}
                  className="w-full text-[11px] px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                Harcama Birimi
              </label>
              <select
                value={seciliBirim}
                onChange={(e) => setSeciliBirim(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 font-medium"
              >
                <option value="tumu">Tüm Harcama Birimleri</option>
                {birimlerList.map((b) => <option key={b.id} value={b.ad}>{b.ad}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Sağ Panel – Rapor İçeriği */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-900">
          {seciliTip === 'kayit-formu' && <KayitFormuView ay="" yil={seciliYil} />}
          {seciliTip === 'malzemeler' && (
            <MalzemeHarcamaView
              yil={seciliYil}
              tarihBaslangic={tarihBaslangic}
              tarihBitis={tarihBitis}
              tarihEsasi={tarihEsasi}
              seciliBirim={seciliBirim}
              alimTuru={alimTuru}
            />
          )}
          {seciliTip === 'dokumanlar' && <DokumanlarView filters={currentFilters} />}
          {seciliTip === 'butce-odenek' && <ButceOdenekView yil={seciliYil} />}
          {seciliTip === 'aylik-ozet' && <AylikOzetView yil={seciliYil} />}
          {seciliTip === 'yillik-ozet' && <YillikOzetView yil={seciliYil} />}
          {seciliTip === 'butce' && <ButceView yil={seciliYil} />}
        </div>
      </div>
    </div>
  )
}

import React from 'react'
import { Link } from '@tanstack/react-router'
import { Landmark } from 'lucide-react'

interface InstitutionCardV2Props {
  institutionName?: string
  kurumTuruLabel: string
  limitType?: string
  harcamaBirimAdi?: string
  kurumsalKod?: string
  fonksiyonelKod?: string
  muhasebeBirimAdi?: string
  harcamaYetkilisi?: { ad_soyad: string; unvan: string | null } | null
}

export const InstitutionCardV2: React.FC<InstitutionCardV2Props> = ({
  institutionName,
  kurumTuruLabel,
  limitType,
  harcamaBirimAdi,
  kurumsalKod,
  fonksiyonelKod,
  muhasebeBirimAdi,
  harcamaYetkilisi
}) => {
  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 font-black shadow-md shadow-blue-500/20">
          <Landmark className="w-5 h-5" />
        </div>
        <div className="overflow-hidden">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
            {institutionName || 'Kurum Adı Tanımlanmamış'}
          </h3>
          <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold truncate block">
            {kurumTuruLabel}
          </span>
        </div>
      </div>

      {/* Bütçe & Analitik Kod Matrisi */}
      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-medium">
        <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
          <span className="text-slate-500 dark:text-slate-400">Limit Statüsü</span>
          <span className="font-bold text-slate-900 dark:text-white uppercase bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px] border border-slate-200 dark:border-slate-700">
            {limitType === 'buyuksehir' ? 'Büyükşehir Kapsamı' : 'Normal İdare'}
          </span>
        </div>
        <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
          <span className="text-slate-500 dark:text-slate-400">Harcama Birimi</span>
          <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-42.5">
            {harcamaBirimAdi || 'Belirtilmedi'}
          </span>
        </div>
        <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
          <span className="text-slate-500 dark:text-slate-400">Kurumsal / Fonk. Kod</span>
          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
            {kurumsalKod || '00.00'} / {fonksiyonelKod || '00.0'}
          </span>
        </div>
        <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
          <span className="text-slate-500 dark:text-slate-400">Muhasebe Birimi</span>
          <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-42.5">
            {muhasebeBirimAdi || 'Belirtilmedi'}
          </span>
        </div>
        <div className="flex items-center justify-between py-1.5">
          <span className="text-slate-500 dark:text-slate-400">Harcama Yetkilisi</span>
          <span className="font-bold text-slate-900 dark:text-white">
            {harcamaYetkilisi?.ad_soyad || 'Atanmamış'}
          </span>
        </div>
      </div>

      <Link to="/mevzuat" search={{ tab: 'mali' } as any}>
        <button
          type="button"
          className="w-full text-xs font-bold py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer transition-colors"
        >
          Mali Parametreleri Düzenle
        </button>
      </Link>
    </div>
  )
}

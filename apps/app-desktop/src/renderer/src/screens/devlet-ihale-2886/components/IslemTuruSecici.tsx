import React from 'react'
import { Building2, Key, Landmark, RefreshCw, Sparkles } from 'lucide-react'
import { IslemTuru2886 } from '../types/devletIhale2886.types'

interface Props {
  selected: IslemTuru2886
  onSelect: (tur: IslemTuru2886) => void
}

export function IslemTuruSecici({ selected, onSelect }: Props): React.JSX.Element {
  const options: {
    id: IslemTuru2886
    title: string
    description: string
    icon: React.ComponentType<{ className?: string }>
    badge: string
    color: string
    activeBorder: string
  }[] = [
    {
      id: 'satis',
      title: 'Taşınmaz / Taşınır Satışı',
      description: 'Mülkiyeti idareye ait arsa, arazi, dükkan, hurda veya mal satışı. Peşin / taksitli tahsilat.',
      icon: Landmark,
      badge: 'En Sık Kullanılan',
      color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50',
      activeBorder: 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/40 dark:bg-blue-950/20'
    },
    {
      id: 'kiralama',
      title: 'Taşınmaz Kiralama',
      description: 'Kantin, büfe, çay bahçesi, dükkan, otopark, tarla vb. kiraya verilmesi ve kira artış takibi.',
      icon: Key,
      badge: 'Dönemsel Gelir',
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50',
      activeBorder: 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/20'
    },
    {
      id: 'irtifak_intifa',
      title: 'İrtifak / Üst Hakkı Tesisi',
      description: 'Kamu taşınmazı üzerinde belirli süre ile sınırlı ayni hak (irtifak, intifa, üst hakkı) tesisi.',
      icon: Building2,
      badge: 'Uzun Vadeli',
      color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50',
      activeBorder: 'border-purple-500 ring-2 ring-purple-500/20 bg-purple-50/40 dark:bg-purple-950/20'
    },
    {
      id: 'trampa',
      title: 'Trampa (Takas)',
      description: 'İdare mülkiyetindeki taşınmazın gerçek/tüzel kişilere ait eşdeğer taşınmazla takası.',
      icon: RefreshCw,
      badge: 'Özel Usul',
      color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50',
      activeBorder: 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/40 dark:bg-amber-950/20'
    }
  ]

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          2886 İşlem Türü (Gelir Kalemi)
        </label>
        <span className="text-[11px] text-slate-500">
          2886 Sayılı Devlet İhale Kanunu kapsamında en yüksek teklif esastır.
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {options.map((opt) => {
          const Icon = opt.icon
          const isActive = selected === opt.id
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelect(opt.id)}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                isActive
                  ? opt.activeBorder
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className={`p-2 rounded-lg ${opt.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700">
                  {opt.badge}
                </span>
              </div>

              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 mb-1">
                {opt.title}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {opt.description}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}

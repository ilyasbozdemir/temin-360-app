import React, { useState } from 'react'
import { FileText, Printer } from 'lucide-react'
import { SurecEvrakiItem } from '../types/devletIhale2886.types'
import { DEFAULT_2886_EVRAKLAR } from './surecEvraklari.data'

const ASAMA_BASLIKLARI: {
  id: SurecEvrakiItem['asama']
  title: string
  color: string
}[] = [
  {
    id: 'baslangic',
    title: '1. Aşama: Başlangıç ve Yetki Evrakları',
    color: 'text-blue-600 dark:text-blue-400'
  },
  {
    id: 'kiymet_takdir',
    title: '2. Aşama: Kıymet Takdiri & Muhammen Bedel',
    color: 'text-indigo-600 dark:text-indigo-400'
  },
  {
    id: 'sartname_ve_ilan',
    title: '3. Aşama: Şartname, İhale Kararı & İlan Süreci',
    color: 'text-purple-600 dark:text-purple-400'
  },
  {
    id: 'ihale_gunu',
    title: '4. Aşama: İhale Günü, Açık Artırma & Encümen Kararı',
    color: 'text-amber-600 dark:text-amber-400'
  },
  {
    id: 'onay_ve_sozlesme',
    title: '5. Aşama: İta Amiri Onayı, Tebligat & Sözleşme',
    color: 'text-emerald-600 dark:text-emerald-400'
  }
]

function getDurumBadge(durum: SurecEvrakiItem['durum']): React.JSX.Element {
  switch (durum) {
    case 'onaylandi':
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
          Onaylandı
        </span>
      )
    case 'taslak':
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
          Taslak
        </span>
      )
    case 'teblig_edildi':
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
          Tebliğ Edildi
        </span>
      )
    default:
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
          Hazırlanmadı
        </span>
      )
  }
}

export function SurecEvraklariTab(): React.JSX.Element {
  const [evraklar] = useState<SurecEvrakiItem[]>(DEFAULT_2886_EVRAKLAR)

  return (
    <div className="space-y-4">
      {ASAMA_BASLIKLARI.map((asama) => {
        const items = evraklar.filter((e) => e.asama === asama.id)
        return (
          <div
            key={asama.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs"
          >
            <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 ${asama.color}`}>
              {asama.title}
            </h4>

            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100/70 dark:hover:bg-slate-800/80 border border-slate-200/60 dark:border-slate-800 rounded-lg text-xs transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-800 dark:text-slate-200 truncate flex items-center gap-1.5">
                        <span>{item.ad}</span>
                        {item.sayiNo && (
                          <span className="text-[10px] font-mono text-slate-400">
                            ({item.sayiNo})
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {item.kod} {item.tarih ? `• Tarih: ${item.tarih}` : ''}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {getDurumBadge(item.durum)}
                    <button
                      type="button"
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors cursor-pointer"
                      title="Belgeyi Önizle / Yazdır"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

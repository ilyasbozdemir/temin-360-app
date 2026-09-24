import React from 'react'
import { Eye, PlusCircle, Users, ChevronDown, UserCheck } from 'lucide-react'
import { Komisyon, Belge } from '../../types'
import { getKomisyonDurumBadge, getKomisyonDurumLabel } from '../../utils/helpers'
import { IlgiliBelgeCubugu } from '../IlgiliBelgeCubugu'

interface KomisyonTabProps {
  komisyonlar: Komisyon[]
  expandedKomisyon: number | null
  setExpandedKomisyon: (id: number | null) => void
  belgeler: Belge[]
  onPreview: (belge: Belge) => void
  onDosyalariEkle: (files: FileList | null, targetId: number) => void
  onNavigateKomisyonlar: () => void
  onNavigateCiktiMerkezi: () => void
  onSelectTab: (tab: string) => void
}

export const KomisyonTab: React.FC<KomisyonTabProps> = ({
  komisyonlar,
  expandedKomisyon,
  setExpandedKomisyon,
  belgeler,
  onPreview,
  onDosyalariEkle,
  onNavigateKomisyonlar,
  onNavigateCiktiMerkezi,
  onSelectTab
}) => {
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-955 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
            Komisyonları Yönet ({komisyonlar.length} Komisyon)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Bu dosya için görevlendirilen komisyonlar ve üyeleri
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              const b = belgeler.find((x) => x.ad === 'Komisyon Görevlendirme Yazısı')
              if (b) onPreview(b)
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl px-3.5 py-2 cursor-pointer transition-colors"
          >
            <Eye size={14} className="text-blue-500" /> Onay Yazısı Önizle
          </button>
          <button
            onClick={onNavigateKomisyonlar}
            className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-2 cursor-pointer transition-colors"
          >
            <PlusCircle size={16} /> Komisyon Yönetimi
          </button>
        </div>
      </div>

      <IlgiliBelgeCubugu
        belgeAdi="Komisyon Görevlendirme Yazısı"
        belgeler={belgeler}
        onPreview={onPreview}
        onDosyalariEkle={onDosyalariEkle}
        onNavigateCiktiMerkezi={onNavigateCiktiMerkezi}
        onSelectTab={onSelectTab}
      />

      {komisyonlar.map((k) => (
        <div
          key={k.id}
          className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-955 hover:shadow-xs transition-shadow"
        >
          <div
            onClick={() => setExpandedKomisyon(expandedKomisyon === k.id ? null : k.id)}
            className="flex items-center gap-4 p-4 cursor-pointer bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
          >
            <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Users size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{k.tur}</h3>
                <span
                  className={`text-[10px] px-2.5 py-0.5 rounded-lg border font-bold ${getKomisyonDurumBadge(
                    k.durum
                  )}`}
                >
                  {getKomisyonDurumLabel(k.durum)}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {k.dayanak} · Görevlendirme: {k.olusturmaTarihi} · {k.uyeler.length} üye
              </p>
            </div>
            <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors shrink-0">
              <ChevronDown
                size={20}
                className={`text-slate-500 transition-transform ${
                  expandedKomisyon === k.id ? 'rotate-180' : ''
                }`}
              />
            </button>
          </div>

          {expandedKomisyon === k.id && (
            <div className="bg-white dark:bg-slate-955 border-t border-slate-200 dark:border-slate-800">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-900 uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-6 py-2.5">Ad Soyad</th>
                      <th className="px-6 py-2.5">Unvan</th>
                      <th className="px-6 py-2.5">Görev</th>
                      <th className="px-6 py-2.5 text-center">İmza Durumu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                    {k.uyeler.map((u, i) => (
                      <tr
                        key={u.id}
                        className={
                          i % 2 === 0
                            ? 'bg-white dark:bg-slate-955'
                            : 'bg-slate-50/50 dark:bg-slate-900/30'
                        }
                      >
                        <td className="px-6 py-3 font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          <UserCheck size={16} className="text-slate-400" /> {u.adSoyad}
                        </td>
                        <td className="px-6 py-3 text-slate-600 dark:text-slate-400 font-medium">
                          {u.unvan}
                        </td>
                        <td className="px-6 py-3 text-slate-600 dark:text-slate-400 font-medium">
                          {u.gorev}
                        </td>
                        <td className="px-6 py-3 text-center">
                          <span
                            className={`text-[10px] px-2.5 py-0.5 rounded-lg border font-bold ${
                              u.imza === 'imzaladı'
                                ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {u.imza === 'imzaladı' ? '✓ İmzaladı' : '◯ Bekliyor'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

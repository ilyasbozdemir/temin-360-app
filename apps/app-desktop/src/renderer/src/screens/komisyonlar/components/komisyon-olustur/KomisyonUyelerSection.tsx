import React from 'react'
import { HelpCircle, Plus, Trash2 } from 'lucide-react'
import { PersonelCombobox } from '../../../../components/ui/PersonelCombobox'
import { UyeRow } from './types'

interface KomisyonUyelerSectionProps {
  uyeler: UyeRow[]
  gorevler: { id: number; ad: string; aciklama?: string }[]
  tumPersonel: { id: number; ad_soyad: string; unvan: string }[]
  onAddUye: () => void
  onRemoveUye: (id: number) => void
  onUyeChange: (id: number, field: string, value: string | number | null | boolean) => void
  onPersonelSec: (uyeId: number, personel: { id: number; ad_soyad: string; unvan: string }) => void
  onUnvanChange: (id: number, unvan: string) => void
}

export const KomisyonUyelerSection: React.FC<KomisyonUyelerSectionProps> = ({
  uyeler,
  gorevler,
  tumPersonel,
  onAddUye,
  onRemoveUye,
  onUyeChange,
  onPersonelSec,
  onUnvanChange
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Kadro ve Üyeler ({uyeler.length})
        </label>
        <button
          type="button"
          onClick={onAddUye}
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Yeni Rol / Üye Ekle
        </button>
      </div>

      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
        {uyeler.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            Henüz üye eklenmemiş. Yukarıdan bir şablon seçebilir veya &quot;Yeni Rol / Üye
            Ekle&quot; butonunu kullanabilirsiniz.
          </div>
        ) : (
          uyeler.map((uye, idx) => {
            const matchedGorev = gorevler.find(
              (g) =>
                g.ad.toLowerCase() === (uye.unvan || '').trim().toLowerCase() ||
                String(g.id) === String(uye.gorevId)
            )

            return (
              <div
                key={uye.id}
                className="p-3 flex flex-col sm:flex-row items-start sm:items-center gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <span className="w-5 text-xs text-slate-400 font-mono text-center">{idx + 1}</span>

                {/* Rol / Görev Seçimi ve Açıklama İpucu */}
                <div className="w-full sm:w-64">
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      list={`gorevler_list_${uye.id}`}
                      value={uye.unvan}
                      onChange={(e) => onUnvanChange(uye.id, e.target.value)}
                      placeholder="Görevi (Örn: Üye)"
                      className="w-full pr-7 pl-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:border-blue-500 font-medium"
                    />
                    {matchedGorev?.aciklama && (
                      <div className="absolute right-2 group/help cursor-help">
                        <HelpCircle className="w-3.5 h-3.5 text-blue-500/80 hover:text-blue-600 transition-colors" />
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover/help:flex flex-col w-60 p-2.5 bg-slate-900/95 backdrop-blur text-white text-[11px] rounded-lg shadow-2xl border border-slate-700 z-50 pointer-events-none animate-in fade-in duration-150">
                          <span className="font-bold text-blue-300 pb-1 border-b border-slate-700/80">
                            {matchedGorev.ad}
                          </span>
                          <span className="mt-1 text-slate-200 leading-relaxed font-normal">
                            {matchedGorev.aciklama}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {matchedGorev?.aciklama && (
                    <span
                      className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 block truncate px-0.5"
                      title={matchedGorev.aciklama}
                    >
                      {matchedGorev.aciklama}
                    </span>
                  )}

                  <datalist id={`gorevler_list_${uye.id}`}>
                    {gorevler.map((g) => (
                      <option key={g.id} value={g.ad}>
                        {g.aciklama ? `${g.ad} (${g.aciklama})` : g.ad}
                      </option>
                    ))}
                  </datalist>
                </div>

                {/* Personel Combobox */}
                <div className="flex-1 w-full">
                  <PersonelCombobox
                    personeller={tumPersonel}
                    selectedId={uye.personelId}
                    onChange={(personelId) => {
                      const p = tumPersonel.find((tp) => tp.id === personelId)
                      if (p) {
                        onPersonelSec(uye.id, p)
                      } else {
                        onUyeChange(uye.id, 'personelId', null)
                        onUyeChange(uye.id, 'personelAdi', '')
                      }
                    }}
                    placeholder="Personel seçin veya yazarak arayın..."
                  />
                </div>

                {/* Asil / Yedek Butonu */}
                <button
                  type="button"
                  onClick={() => onUyeChange(uye.id, 'asilMi', uye.asilMi === 1 ? 0 : 1)}
                  className={`px-2.5 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer min-w-[70px] text-center ${
                    uye.asilMi === 1
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                  }`}
                >
                  {uye.asilMi === 1 ? '✓ Asil' : '⟳ Yedek'}
                </button>

                {/* Kaldır Butonu */}
                <button
                  type="button"
                  onClick={() => onRemoveUye(uye.id)}
                  className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                  title="Satırı Kaldır"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}


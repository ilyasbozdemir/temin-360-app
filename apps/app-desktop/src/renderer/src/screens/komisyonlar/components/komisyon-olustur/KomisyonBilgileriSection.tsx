import React from 'react'
import { Users } from 'lucide-react'
import { Input } from '../../../../components/ui/Input'
import { KOMISYON_SABLONLARI, KomisyonTipi } from './types'

interface KomisyonBilgileriSectionProps {
  ad: string
  setAd: (val: string) => void
  seciliTip: KomisyonTipi
  onSelectTip: (tip: KomisyonTipi) => void
  isEdit: boolean
}

export const KomisyonBilgileriSection: React.FC<KomisyonBilgileriSectionProps> = ({
  ad,
  setAd,
  seciliTip,
  onSelectTip,
  isEdit
}) => {
  return (
    <div className="space-y-4">
      {/* Komisyon Tipi Seçimi (sadece yeni komisyon oluştururken) */}
      {!isEdit && (
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Komisyon Tipi
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(
              Object.entries(KOMISYON_SABLONLARI) as [
                KomisyonTipi,
                (typeof KOMISYON_SABLONLARI)[keyof typeof KOMISYON_SABLONLARI]
              ][]
            ).map(([key, sablon]) => (
              <button
                key={key}
                type="button"
                onClick={() => onSelectTip(seciliTip === key ? '' : key)}
                className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                  seciliTip === key
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div
                  className={`p-2 rounded-lg ${
                    seciliTip === key
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-sm">{sablon.label}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {sablon.roller.length} kadro unvanı hazır gelir
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Komisyon Adı */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          Komisyon Adı <span className="text-rose-500">*</span>
        </label>
        <Input
          value={ad}
          onChange={(e) => setAd(e.target.value)}
          placeholder="Örn: Muayene Kabul ve Tespit Komisyonu"
          className="w-full text-sm font-medium"
        />
      </div>
    </div>
  )
}

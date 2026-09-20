import React from 'react'
import { Input } from '../../../components/ui/Input'
import { DetsisBadge } from '../../../components/ui/DetsisBadge'
import { KurumTabProps } from '../types'

export const MaliBirimTab: React.FC<KurumTabProps & { sozlukData: any[] }> = ({
  data,
  onChange,
  sozlukData
}) => {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
        <h2 className="text-lg font-bold text-slate-850 dark:text-slate-100">
          Mali ve Bütçe Kodları
        </h2>
        <p className="text-xs text-slate-500">Kurumsal mali kodlarınız ve DETSİS bilgileri.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
            e-Bütçe Kodu Öneki
          </label>
          <Input
            value={data.ebutce_kodu || ''}
            onChange={(e) => onChange('ebutce_kodu', e.target.value)}
            placeholder="Örn: xx.yy.zz"
            className="w-full bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-xs"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
            Say2000i Kodu Öneki
          </label>
          <Input
            value={data.say2000i_kodu || ''}
            onChange={(e) => onChange('say2000i_kodu', e.target.value)}
            placeholder="Örn: XXYY"
            className="w-full bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              DETSİS Kodu
            </label>
            <DetsisBadge detsisNo={data.detsis_kodu} compact={false} />
          </div>
          <Input
            value={data.detsis_kodu || ''}
            onChange={(e) => {
              onChange('detsis_kodu', e.target.value)
              onChange('dtvt_kodu', e.target.value)
            }}
            placeholder="DETSİS Kodunuzu girin..."
            className="w-full bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-xs"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
            Fonksiyonel Kod
          </label>
          <Input
            value={data.fonksiyonel_kod || ''}
            onChange={(e) => onChange('fonksiyonel_kod', e.target.value)}
            placeholder="Örn: 01.3.9.00"
            className="w-full bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-xs"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
            Muhasebe Birim Kodu
          </label>
          <Input
            value={data.muhasebe_birim_kodu || ''}
            onChange={(e) => onChange('muhasebe_birim_kodu', e.target.value)}
            placeholder="Muhasebe Kodu"
            className="w-full bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-xs"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
            Muhasebe Birimi Adı
          </label>
          <Input
            value={data.muhasebe_birim_adi || ''}
            onChange={(e) => onChange('muhasebe_birim_adi', e.target.value)}
            placeholder="Muhasebe Birimi Adı"
            className="w-full bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-xs"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
            Harcama Birim Kodu
          </label>
          <Input
            value={data.harcama_birim_kodu || ''}
            onChange={(e) => onChange('harcama_birim_kodu', e.target.value)}
            placeholder="Harcama Birimi Kodu"
            className="w-full bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-xs"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
            Harcama Birim Adı
          </label>
          <Input
            value={data.harcama_birim_adi || ''}
            onChange={(e) => onChange('harcama_birim_adi', e.target.value)}
            placeholder="Harcama Birimi Adı"
            className="w-full bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-xs"
          />
        </div>
      </div>
    </div>
  )
}

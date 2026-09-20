import React, { useState } from 'react'
import { Input } from '../../../components/ui/Input'
import { Button } from '../../../components/ui/Button'
import { DetsisBadge, DetsisVerificationState } from '../../../components/ui/DetsisBadge'
import { DetsisSearchModal } from '../../../components/ui/DetsisSearchModal'
import { Sparkles } from 'lucide-react'
import { KurumTabProps } from '../types'

export const MaliBirimTab: React.FC<KurumTabProps> = ({ data, onChange }) => {
  const [isDetsisSearchOpen, setIsDetsisSearchOpen] = useState(false)

  const handleApplyDetsisData = (detsisInfo: DetsisVerificationState): void => {
    if (!detsisInfo) return
    if (detsisInfo.detsisNo) {
      onChange('detsis_kodu', detsisInfo.detsisNo)
      onChange('dtvt_kodu', detsisInfo.detsisNo)
    }
    if (detsisInfo.birimAdi) onChange('kurum_adi', detsisInfo.birimAdi)
    if (detsisInfo.kurumHiyerarsisi) onChange('ust_kurum_adi', detsisInfo.kurumHiyerarsisi)
    if (detsisInfo.ilAdi) onChange('il', detsisInfo.ilAdi)
    if (detsisInfo.ilceAdi) onChange('ilce', detsisInfo.ilceAdi)
    if (detsisInfo.logoByteArray) onChange('logo_kurum', detsisInfo.logoByteArray)
  }

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

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              DETSİS Kodu
            </label>
            <DetsisBadge
              detsisNo={data.detsis_kodu}
              compact={false}
              showSearchButton={true}
              searchTitle="DETSİS'te Kurum Ara"
              onApplyData={handleApplyDetsisData}
            />
          </div>
          <div className="flex gap-2">
            <Input
              value={data.detsis_kodu || ''}
              onChange={(e) => {
                onChange('detsis_kodu', e.target.value)
                onChange('dtvt_kodu', e.target.value)
              }}
              placeholder="DETSİS Kodunuzu girin..."
              className="flex-1 bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-xs"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDetsisSearchOpen(true)}
              className="border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold shrink-0 cursor-pointer shadow-sm"
              title="DETSİS'te Kurum Ara"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>DETSİS&apos;te Ara</span>
            </Button>
          </div>
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
      </div>

      <DetsisSearchModal
        isOpen={isDetsisSearchOpen}
        onClose={() => setIsDetsisSearchOpen(false)}
        initialQuery={data.kurum_adi || data.detsis_kodu || ''}
        onSelect={handleApplyDetsisData}
        title="DETSİS'te Kurum / Bakanlık Ara"
      />
    </div>
  )
}

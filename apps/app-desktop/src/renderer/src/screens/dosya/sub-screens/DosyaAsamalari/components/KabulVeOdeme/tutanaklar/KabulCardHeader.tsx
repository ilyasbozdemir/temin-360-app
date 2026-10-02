import React from 'react'
import { FileCheck, FileText, Grid2X2, List, Plus, Table2 } from 'lucide-react'
import { Button } from '../../../../../../../components/ui/Button'
import { HeaderDigerActionsMenu } from './HeaderDigerActionsMenu'

interface KabulCardHeaderProps {
  kayitSayisi: number
  isYapim: boolean
  isHizmet: boolean
  isMal: boolean
  alimTuruEtiketi: string
  alimTuruKisa: string
  effectiveFirma: string
  effectiveTeklifTutar: number
  viewMode: 'table' | 'list' | 'grid'
  setViewMode: (mode: 'table' | 'list' | 'grid') => void
  primarySablonKey: string
  formatCurrency: (val: number | null) => string
  onOpenAddTutanak?: () => void
  onOpenFallbackForm: () => void
  onOpenPreview?: (sablonKey: string) => void
  onOpenTifModal?: () => void
}

export function KabulCardHeader({
  kayitSayisi,
  isYapim,
  isHizmet,
  isMal,
  alimTuruEtiketi,
  alimTuruKisa,
  effectiveFirma,
  effectiveTeklifTutar,
  viewMode,
  setViewMode,
  primarySablonKey,
  formatCurrency,
  onOpenAddTutanak,
  onOpenFallbackForm,
  onOpenPreview,
  onOpenTifModal
}: KabulCardHeaderProps): React.JSX.Element {
  return (
    <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/30">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800/60 shadow-xs">
          <FileCheck className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
              Muayene Kabul ve Tespit Komisyonu Tutanakları ({kayitSayisi})
            </h3>
            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                isYapim
                  ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60'
                  : isHizmet
                    ? 'bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/60'
                    : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
              }`}
            >
              {alimTuruEtiketi}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Yüklenici:{' '}
            <strong className="text-slate-700 dark:text-slate-200">{effectiveFirma}</strong> &bull;
            Kabul Edilen Teklif:{' '}
            <strong className="text-emerald-600 dark:text-emerald-400">
              {formatCurrency(effectiveTeklifTutar)}
            </strong>
          </p>
        </div>
      </div>

      {/* Top Action Buttons */}
      <div className="flex items-center gap-2 flex-wrap self-start xl:self-center">
        {/* Görünüm Seçici (Tablo / Liste / Kart) */}
        <div className="flex items-center rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
          {[
            { mode: 'table' as const, icon: Table2, label: 'Tablo' },
            { mode: 'list' as const, icon: List, label: 'Liste' },
            { mode: 'grid' as const, icon: Grid2X2, label: 'Kart' }
          ].map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              type="button"
              title={label}
              onClick={() => setViewMode(mode)}
              className={`rounded-md p-1.5 transition-colors cursor-pointer ${
                viewMode === mode
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>

        {/* Primary Action 1: Tutanak Ekle */}
        <div className="relative flex items-center">
          <Button
            onClick={() => {
              if (onOpenAddTutanak) {
                onOpenAddTutanak()
              } else {
                onOpenFallbackForm()
              }
            }}
            className="gap-1.5 text-xs font-bold h-9 px-3.5 bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer rounded-xl"
            title={`Yeni ${alimTuruEtiketi} Muayene ve Kabul Tutanağı Ekle`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Tutanak Ekle ({alimTuruKisa})</span>
          </Button>
        </div>

        {/* Primary Action 2: Kabul Tutanağı Çıktı */}
        <Button
          onClick={() => onOpenPreview?.(primarySablonKey)}
          variant="outline"
          className="gap-1.5 text-xs font-semibold h-9 px-3 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer"
          title={`${alimTuruEtiketi} Belgesini Önizle ve Yazdır`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>
            {isYapim
              ? 'Geçici Kabul Tutanağı Çıktı'
              : isHizmet
                ? 'Hizmet Tutanağı Çıktı'
                : 'Kabul Tutanağı Çıktı'}
          </span>
        </Button>

        {/* Diğer İşlemler / Belgeler (...) Dropdown Menu */}
        <HeaderDigerActionsMenu
          isMal={isMal}
          onOpenPreview={onOpenPreview}
          onOpenTifModal={onOpenTifModal}
        />
      </div>
    </div>
  )
}

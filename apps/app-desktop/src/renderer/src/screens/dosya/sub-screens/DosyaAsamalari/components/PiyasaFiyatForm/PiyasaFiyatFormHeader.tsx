import React from 'react'
import { ArrowLeft, ChevronDown, FileSpreadsheet, FileText, Save } from 'lucide-react'
import { cn } from '@renderer/utils/cn'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@renderer/components/ui/DropdownMenu'

import { PiyasaFiyatFormHeaderProps } from './types'

export function PiyasaFiyatFormHeader({
  formMode,
  itemsCount,
  invitedFirmsCount,
  estimatedCostTotal,
  setIsFormOpen,
  handleSaveToDosya
}: PiyasaFiyatFormHeaderProps): React.JSX.Element {
  const isMaliyetMode = formMode === 'maliyet'

  return (
    <div className="p-4 md:px-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/60">
      <div className="flex items-center gap-4 shrink-0">
        <button
          type="button"
          onClick={() => setIsFormOpen(false)}
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-all cursor-pointer shadow-2xs border border-slate-200 dark:border-slate-700 shrink-0"
          title="Geri Dön / Kapat"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-left">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                'px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-2xs flex items-center gap-1',
                isMaliyetMode
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600'
                  : 'bg-gradient-to-r from-indigo-600 to-blue-600'
              )}
            >
              {isMaliyetMode ? (
                <FileSpreadsheet className="w-3 h-3" />
              ) : (
                <FileText className="w-3 h-3" />
              )}
              {isMaliyetMode ? 'Yaklaşık Maliyet' : 'Piyasa Fiyat Araştırması'}
            </span>

            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
              {itemsCount} Kalem • {invitedFirmsCount} Firma
            </span>
          </div>

          <h3 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2 leading-tight mt-1">
            {isMaliyetMode
              ? 'Yaklaşık Maliyet Cetveli Oluşturma & Teklif Girişi'
              : 'Piyasa Fiyat Araştırma Tutanağı Oluşturma & Teklif Girişi'}
          </h3>
        </div>
      </div>

      {/* Stat Box & Split Action Context Menu Button */}
      <div className="flex flex-wrap lg:flex-nowrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end shrink-0">
        {/* Toplam Maliyet Rozeti */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/60 text-xs font-semibold">
          <span className="text-slate-500 dark:text-slate-400">Yaklaşık Maliyet:</span>
          <strong className="font-mono text-sm font-black text-emerald-700 dark:text-emerald-300">
            ₺{' '}
            {estimatedCostTotal.toLocaleString('tr-TR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </strong>
        </div>

        {/* Split Action Dropdown Button */}
        <div className="flex items-center shadow-md rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => handleSaveToDosya(isMaliyetMode ? 'maliyet' : 'tutanak')}
            className={cn(
              'px-4 py-2.5 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer h-10 shrink-0 border-0 active:scale-95 whitespace-nowrap',
              isMaliyetMode
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700'
                : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700'
            )}
            title="Fiyat tekliflerini kaydeder ve resmi belgeyi günceller"
          >
            {isMaliyetMode ? (
              <FileSpreadsheet className="w-4 h-4 text-emerald-100 shrink-0" />
            ) : (
              <FileText className="w-4 h-4 text-indigo-100 shrink-0" />
            )}
            <span>{isMaliyetMode ? 'Kaydet & Cetvel Üret' : 'Kaydet & Tutanak Üret'}</span>
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  'px-2.5 py-2.5 text-white text-xs font-bold transition-all flex items-center justify-center cursor-pointer h-10 shrink-0 border-l border-white/20 active:scale-95',
                  isMaliyetMode ? 'bg-teal-700 hover:bg-teal-800' : 'bg-blue-700 hover:bg-blue-800'
                )}
                title="Diğer Kaydetme ve İşlem Seçenekleri"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuItem onClick={() => handleSaveToDosya('save_only')}>
                <Save className="mr-2 h-4 w-4 text-slate-500" />
                <span>Sadece Fiyatları Sakla (Taslak)</span>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => handleSaveToDosya('maliyet')}>
                <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-600" />
                <span>Yaklaşık Maliyet Cetvelini Güncelle</span>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => handleSaveToDosya('tutanak')}>
                <FileText className="mr-2 h-4 w-4 text-indigo-600" />
                <span>Piyasa Fiyat Araştırma Tutanağını Güncelle</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}

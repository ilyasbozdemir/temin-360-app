import React from 'react'
import { Archive, FolderTree, Printer } from 'lucide-react'
import { PrintDropdownButton } from '../../../../components/PrintDropdownButton'

interface KlasorKapakCiktiCardProps {
  stageSablons: any[]
  sablons: any[]
  activeStarredDocs: string[]
  ciktiLoading: boolean
  handleOpenPreviewForSablon: (
    sablon: any,
    title: string,
    overrideCtx?: any,
    selectedFirma?: any
  ) => Promise<void>
  quickPrint: (sablon: any) => Promise<void>
  quickExport: (sablon: any, format: 'pdf' | 'docx' | 'udf') => Promise<void>
  quickOpenExternal: (sablon: any) => Promise<void>
  isSablonDisabled: (sablon: any) => boolean
}

export function KlasorKapakCiktiCard({
  stageSablons,
  sablons,
  activeStarredDocs,
  ciktiLoading,
  handleOpenPreviewForSablon,
  quickPrint,
  quickExport,
  quickOpenExternal,
  isSablonDisabled
}: KlasorKapakCiktiCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-5">
        <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Printer className="w-4 h-4 text-violet-500" />
          Kapak &amp; Sırtlık Çıktıları
        </h4>
        {stageSablons.length > 0 && (
          <PrintDropdownButton
            kategori="5-klasor-ve-kapaklar"
            sablons={sablons}
            overrideSablons={stageSablons}
            activeStarredDocs={activeStarredDocs}
            ciktiLoading={ciktiLoading}
            handleOpenPreviewForSablon={handleOpenPreviewForSablon}
            quickPrint={quickPrint}
            quickExport={quickExport}
            quickOpenExternal={quickOpenExternal}
            isSablonDisabled={isSablonDisabled}
            buttonHeightClass="h-9"
            label="Kapakları Yazdır"
          />
        )}
      </div>

      <div className="grid grid-cols-1 gap-3">
        <div className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <Archive className="w-8 h-8 text-slate-400" />
          <div>
            <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Klasör Sırtlığı (Geniş/Dar)
            </h5>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Klasörünüzün dışı için sırtlık etiketi yazdırın.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <FolderTree className="w-8 h-8 text-slate-400" />
          <div>
            <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Kapak İçi İndeks (Dizi Pusulası)
            </h5>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Fiziksel dosya içindeki evrak listesi indeksini yazdırın.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

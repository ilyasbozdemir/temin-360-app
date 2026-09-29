import React from 'react'
import { Building2 } from 'lucide-react'
import type { KurumInfo } from './types'

interface KurumInfoBarProps {
  kurumInfo: KurumInfo | null
}

export const KurumInfoBar: React.FC<KurumInfoBarProps> = ({ kurumInfo }) => {
  if (!kurumInfo) return null

  return (
    <div className="flex items-center justify-between px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-800 rounded-xl text-xs">
      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
        <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
        <span className="font-bold text-slate-850 dark:text-slate-100">
          {kurumInfo.kurumAdi || 'Kurum Bilgisi'}
        </span>
        {kurumInfo.makamAdi && (
          <span className="text-slate-400 font-medium text-[11px]">
            • Onay Makamı:{' '}
            <strong className="text-slate-600 dark:text-slate-300">
              {kurumInfo.makamAdi}
            </strong>
          </span>
        )}
      </div>
      {kurumInfo.kurumTipi && (
        <span className="text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 bg-blue-100/70 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-md">
          {kurumInfo.kurumTipi}
        </span>
      )}
    </div>
  )
}

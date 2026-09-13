import React from 'react'
import { Zap } from 'lucide-react'

interface AnnouncementsCardV2Props {
  announcements?: Array<{ title: string; content: string }>
}

export const AnnouncementsCardV2: React.FC<AnnouncementsCardV2Props> = ({ announcements }) => {
  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          Sürüm & Mevzuat Bülteni
        </h4>
        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-900/40">
          v1.0.0-beta.111
        </span>
      </div>

      <div className="space-y-2.5 text-xs">
        {announcements && announcements.length > 0 ? (
          announcements.slice(0, 3).map((ann, idx) => (
            <div
              key={idx}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
            >
              <div className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                {ann.title}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed font-normal">
                {ann.content}
              </p>
            </div>
          ))
        ) : (
          <div className="text-xs text-slate-500 dark:text-slate-400 text-center py-4">
            Sistem güncel, aktif bildirim bulunmuyor.
          </div>
        )}
      </div>
    </div>
  )
}

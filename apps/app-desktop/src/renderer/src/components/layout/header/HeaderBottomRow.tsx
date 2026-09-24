import React from 'react'
import { Link } from '@tanstack/react-router'
import { ClipboardList, Layers, Printer } from 'lucide-react'
import { TeminSelector } from '../TeminSelector'

interface HeaderBottomRowProps {
  isDt: boolean
  handleModeChange: (mode: 'dogrudan_temin' | 'ihale') => void
  activeDosyaId?: number | string | null
}

export function HeaderBottomRow({
  isDt,
  handleModeChange,
  activeDosyaId
}: HeaderBottomRowProps): React.JSX.Element {
  return (
    <div
      className="min-h-9 py-1 flex items-center justify-between gap-1 sm:gap-2.5 bg-slate-100/50 dark:bg-slate-950/20 border-t border-slate-200/30 dark:border-slate-800/30 select-none px-2 sm:px-3 relative z-20 w-full"
      style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
    >
      {/* Sol: İnce ve Şık Aktif Çalışma Modu Rozeti */}
      <div className="shrink-0 flex items-center">
        <button
          type="button"
          onClick={() => handleModeChange(isDt ? 'ihale' : 'dogrudan_temin')}
          title="Süreç modunu değiştirmek için tıklayın (Doğrudan Temin ↔ İhale Süreçleri)"
          className={`inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full text-[11px] font-medium transition-all duration-300 border cursor-pointer hover:opacity-85 ${
            isDt
              ? 'bg-blue-50/90 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200/60 dark:border-blue-800/40'
              : 'bg-indigo-50/90 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-800/40'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isDt ? 'bg-blue-500' : 'bg-indigo-500'
            } animate-pulse shrink-0`}
          />
          <span className="hidden 2xl:inline">
            {isDt ? 'Doğrudan Temin (Md. 22)' : 'İhale İşlemleri (Md. 19 / 21)'}
          </span>
          <span className="hidden xl:inline 2xl:hidden font-semibold">
            {isDt ? 'DT (Md. 22)' : 'İhale (19/21)'}
          </span>
          <span className="hidden sm:inline xl:hidden font-semibold">{isDt ? 'DT' : 'İhale'}</span>
        </button>
      </div>

      {/* Orta: Temin Seçici */}
      <div className="flex-1 min-w-0 flex justify-center px-1 sm:px-2">
        <TeminSelector />
      </div>

      {/* Sağ: Süreç & Çıktı Butonları */}
      {activeDosyaId ? (
        <div className="flex items-center gap-1 shrink-0 justify-end">
          <Link
            to="/takip"
            title={isDt ? 'Doğrudan Temin & Durum' : 'İhale Takip & Durum'}
            className={`flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-md transition-all shadow-2xs hover:shadow-xs border ${
              isDt
                ? 'text-blue-700 bg-blue-50/80 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-900/50 border-blue-200/50 dark:border-blue-900/30'
                : 'text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-900/50 border-indigo-200/50 dark:border-indigo-900/30'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden 2xl:inline">
              {isDt ? 'Doğrudan Temin & Durum' : 'İhale Takip & Durum'}
            </span>
            <span className="hidden xl:inline 2xl:hidden">
              {isDt ? 'Takip & Durum' : 'İhale Takip'}
            </span>
          </Link>

          <Link
            to="/surec-akisi"
            title="Süreç Akış Haritası (Beta Tablar)"
            className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold text-purple-700 bg-purple-50/80 hover:bg-purple-100 dark:bg-purple-950/40 dark:text-purple-300 dark:hover:bg-purple-900/50 border border-purple-200/50 dark:border-purple-900/30 rounded-md transition-colors shadow-2xs hover:shadow-xs"
          >
            <Layers className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden 2xl:inline">Süreç Akışı (Beta)</span>
            <span className="hidden xl:inline 2xl:hidden">Süreç Akışı</span>
          </Link>

          <Link
            to="/cikti-merkezi"
            title="Çıktı Merkezi & Yazdırma"
            className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50/80 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/50 border border-emerald-100/50 dark:border-emerald-900/30 rounded-md transition-colors shadow-2xs hover:shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden 2xl:inline">Çıktı Merkezi</span>
            <span className="hidden xl:inline 2xl:hidden">Çıktı</span>
          </Link>
        </div>
      ) : null}
    </div>
  )
}

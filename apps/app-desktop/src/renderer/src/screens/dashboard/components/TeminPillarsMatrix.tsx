import React from 'react'
import { Link } from '@tanstack/react-router'
import {
  Activity,
  Building2,
  ClipboardCheck,
  Coins,
  FileText,
  Scale
} from 'lucide-react'
import { cn } from '../../../utils/cn'

export interface PillarItem {
  key: 'T' | 'E' | 'M' | 'I' | 'N'
  letter: string
  title: string
  subtitle: string
  icon: React.ElementType
  badge: string
  description: string
  statsText: string
}

interface TeminPillarsMatrixProps {
  procurementMode: 'dogrudan_temin' | 'ihale' | 'all'
  activePillar: 'T' | 'E' | 'M' | 'I' | 'N'
  setActivePillar: (pillar: 'T' | 'E' | 'M' | 'I' | 'N') => void
  teminPillars: PillarItem[]
  currentPillar: PillarItem
}

export const TeminPillarsMatrix: React.FC<TeminPillarsMatrixProps> = ({
  procurementMode,
  activePillar,
  setActivePillar,
  teminPillars,
  currentPillar
}) => {
  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 md:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              'w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm border shadow-xs',
              procurementMode === 'dogrudan_temin'
                ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/60'
                : procurementMode === 'ihale'
                  ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900/60'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            )}
          >
            {procurementMode === 'dogrudan_temin'
              ? '📑'
              : procurementMode === 'ihale'
                ? '⚖️'
                : '🏛️'}
          </div>
          <div>
            <h2 className="text-base md:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              {procurementMode === 'dogrudan_temin'
                ? 'TEMİN 360 Doğrudan Temin Süreç Mimarisi (KİK Md. 22)'
                : procurementMode === 'ihale'
                  ? 'TEMİN 360 İhale & Hakediş Süreç Yönetimi (KİK Md. 19 / 21)'
                  : 'TEMİN 360 Entegre Kamu Satın Alma & Hakediş Mimarisi'}
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {procurementMode === 'dogrudan_temin'
                ? '4734 Sayılı Kanun Madde 22/d piyasa fiyat araştırması, teklif mektupları ve hızlı onay süreci kontrol paneli'
                : procurementMode === 'ihale'
                  ? 'Açık ihale (Md. 19), Pazarlık usulü (Md. 21), pursantaj cetvelleri ve hakediş ödeme yaşam döngüsü kontrol paneli'
                  : 'Uçtan uca doğrudan temin ve hakediş yaşam döngüsü kontrol paneli'}
            </p>
          </div>
        </div>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 hidden sm:inline-block bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
          Modül seçmek için harflere tıklayın
        </span>
      </div>

      {/* T - E - M - İ - N Buton Şeridi */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {teminPillars.map((pillar) => {
          const isSelected = activePillar === pillar.key
          const Icon = pillar.icon
          return (
            <button
              key={pillar.key}
              type="button"
              onClick={() => setActivePillar(pillar.key)}
              className={cn(
                'flex flex-col text-left p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer relative overflow-hidden group',
                isSelected
                  ? 'bg-linear-to-br from-blue-600 to-indigo-700 text-white border-blue-500 shadow-lg shadow-blue-500/25 scale-[1.02] ring-2 ring-blue-400/40'
                  : 'bg-slate-50 hover:bg-slate-100/90 text-slate-800 border-slate-200/90 dark:bg-slate-800/70 dark:hover:bg-slate-800 dark:text-slate-200 dark:border-slate-700/80 hover:border-blue-300 dark:hover:border-blue-600'
              )}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div
                  className={cn(
                    'w-7 h-7 rounded-xl flex items-center justify-center font-black text-sm shadow-xs transition-colors',
                    isSelected
                      ? 'bg-white text-blue-700 font-black shadow-md'
                      : 'bg-blue-600 text-white dark:bg-blue-500 group-hover:scale-105'
                  )}
                >
                  {pillar.letter}
                </div>
                <Icon
                  className={cn(
                    'w-4 h-4 transition-colors',
                    isSelected
                      ? 'text-white'
                      : 'text-slate-400 dark:text-slate-400 group-hover:text-blue-500'
                  )}
                />
              </div>
              <span
                className={cn(
                  'text-xs font-extrabold tracking-tight leading-tight',
                  isSelected ? 'text-white' : 'text-slate-900 dark:text-slate-100'
                )}
              >
                {pillar.title.split('&')[0]}
              </span>
              <span
                className={cn(
                  'text-[10px] mt-0.5 truncate font-medium',
                  isSelected ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'
                )}
              >
                {pillar.subtitle}
              </span>
            </button>
          )
        })}
      </div>

      {/* Seçili Pillar Detay Kartı */}
      <div className="mt-4 p-4 md:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-black text-blue-700 dark:text-blue-400 uppercase tracking-widest">
              {currentPillar.letter} SÜTUNU: {currentPillar.title}
            </span>
            <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold bg-blue-600 text-white shadow-xs border border-blue-400/30">
              {currentPillar.badge}
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
            {currentPillar.description}
          </p>
          <div className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 pt-0.5">
            <Activity className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>{currentPillar.statsText}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
          {activePillar === 'T' && (
            <Link to="/dosyalar" className="w-full md:w-auto">
              <button
                type="button"
                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-transform hover:scale-[1.02]"
              >
                <Coins className="w-3.5 h-3.5" />
                <span>Piyasa Fiyat Araştırmaları</span>
              </button>
            </Link>
          )}
          {activePillar === 'E' && (
            <Link to="/taslakyonetim" className="w-full md:w-auto">
              <button
                type="button"
                className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-transform hover:scale-[1.02]"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Evrak Şablonları & Taslaklar</span>
              </button>
            </Link>
          )}
          {activePillar === 'M' && (
            <Link to="/harcama-merkezi" className="w-full md:w-auto">
              <button
                type="button"
                className="w-full md:w-auto bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-transform hover:scale-[1.02]"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Harcama & KİK Limit Takibi</span>
              </button>
            </Link>
          )}
          {activePillar === 'I' && (
            <Link to="/dosyalar/yeni" className="w-full md:w-auto">
              <button
                type="button"
                className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-transform hover:scale-[1.02]"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Yeni Doğrudan Temin Başlat</span>
              </button>
            </Link>
          )}
          {activePillar === 'N' && (
            <Link to="/hakedis" className="w-full md:w-auto">
              <button
                type="button"
                className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-transform hover:scale-[1.02]"
              >
                <ClipboardCheck className="w-3.5 h-3.5" />
                <span>Hakediş & Kabul Merkezi</span>
              </button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

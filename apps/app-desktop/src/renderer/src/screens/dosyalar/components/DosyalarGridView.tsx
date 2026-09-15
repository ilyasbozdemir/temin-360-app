import React from 'react'
import {
  BookOpen,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  FolderOpen,
  Hash,
  TrendingUp
} from 'lucide-react'
import { cn } from '../../../utils/cn'
import { DurumBadge, ProjectBadge, TagBadge, TurBadge } from './Badges'
import { DosyaActionMenu } from './DosyaActionMenu'
import { DosyaHizliIcerikPopover } from './DosyaHizliIcerikPopover'
import { useNavigate } from '@tanstack/react-router'

export interface DosyalarGridViewProps {
  viewMode: 'grid' | 'list'
  groupedDosyalar: { baseKonu: string; files: any[] }[]
  expandedGroups: string[]
  searchQuery: string
  toggleGroup: (baseKonu: string) => void
  activeDosyaId: number | null
  setActiveDosyaId: (id: number | null) => void
  selectedDosyaIds: number[]
  toggleSelection: (e: React.MouseEvent, id: number) => void
  getDosyaNoLabel: (d: any) => string
  formatMoney: (val: number) => string
  formatDate: (val: string | null | undefined) => string
  openMenuId: number | null
  setOpenMenuId: (id: number | null) => void
  handleOpenInNewWindow?: (dosya: any) => void
  handleUpdateStatus?: (id: number, status: string) => Promise<void>
  handleEkapGonder?: (id: number) => void
  handleKilidiAc?: (id: number) => Promise<void>
  handleOpenAI?: (dosya: any) => void
  handleDelete?: (id: number) => Promise<void>
  handleHardDelete?: (id: number) => Promise<void>
  handleOpenMaliyetAyarlari?: (dosya: any) => void
}

export function DosyalarGridView({
  viewMode,
  groupedDosyalar,
  expandedGroups,
  searchQuery,
  toggleGroup,
  activeDosyaId,
  setActiveDosyaId,
  selectedDosyaIds,
  toggleSelection,
  getDosyaNoLabel,
  formatMoney,
  formatDate,
  openMenuId,
  setOpenMenuId,
  handleOpenInNewWindow,
  handleUpdateStatus,
  handleEkapGonder,
  handleKilidiAc,
  handleOpenAI,
  handleDelete,
  handleHardDelete,
  handleOpenMaliyetAyarlari
}: DosyalarGridViewProps): React.JSX.Element {
  const navigate = useNavigate()

  return (
    <div
      className={cn(
        'flex-1 overflow-y-auto custom-scrollbar pr-1 grid gap-4 pb-4 auto-rows-max',
        viewMode === 'grid' ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1'
      )}
    >
      {groupedDosyalar.map((group) => {
        const hasMultiple = group.files.length > 1
        const isExpanded = expandedGroups.includes(group.baseKonu) || searchQuery.length > 0

        return (
          <div key={group.baseKonu} className="col-span-full contents">
            {hasMultiple && (
              <div
                className="col-span-full flex items-center justify-between mt-2 mb-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                onClick={() => toggleGroup(group.baseKonu)}
              >
                <div className="flex items-center gap-3">
                  <ChevronRight
                    size={16}
                    className={cn('text-slate-400 transition-transform', isExpanded && 'rotate-90')}
                  />
                  <FolderOpen size={16} className="text-blue-500" />
                  <h3 className="text-sm font-extrabold text-slate-700 dark:text-slate-300">
                    {group.baseKonu}
                  </h3>
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
                    {group.files.length} Alım İşlemi
                  </span>
                </div>
              </div>
            )}
            {(isExpanded || !hasMultiple) &&
              group.files.map((dosya) => (
                <div
                  key={dosya.id}
                  onClick={() => {
                    setActiveDosyaId(dosya.id)
                    navigate({ to: '/takip' })
                  }}
                  className={cn(
                    'bg-white dark:bg-slate-900 border rounded-2xl cursor-pointer hover:shadow-lg transition-all flex flex-col group relative min-h-[180px] h-full',
                    openMenuId === dosya.id ? 'overflow-visible z-30' : 'overflow-hidden',
                    activeDosyaId === dosya.id
                      ? 'border-blue-500 dark:border-blue-700 ring-2 ring-blue-500/15 shadow-md'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  )}
                >
                  {/* Kart Başlık Bölümü */}
                  <div className="p-4 pb-3 border-b border-slate-100 dark:border-slate-800/80">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => toggleSelection(e, dosya.id)}
                          className={cn(
                            'transition-all cursor-pointer',
                            selectedDosyaIds.includes(dosya.id) || selectedDosyaIds.length > 0
                              ? 'opacity-100'
                              : 'opacity-0 group-hover:opacity-100'
                          )}
                        >
                          <CheckCircle2
                            size={16}
                            className={cn(
                              selectedDosyaIds.includes(dosya.id)
                                ? 'text-blue-600 dark:text-blue-400 fill-blue-100 dark:fill-blue-900/30'
                                : 'text-slate-300 dark:text-slate-600 hover:text-blue-400'
                            )}
                          />
                        </button>
                        <span className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-950 px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-800 truncate max-w-[120px]">
                          {getDosyaNoLabel(dosya)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <DurumBadge
                          durumAsamaId={dosya.durum_asama_id}
                          isDeleted={dosya.is_deleted}
                          status={dosya.status}
                        />
                        <TurBadge tur={dosya.tur} />
                        <DosyaHizliIcerikPopover dosya={dosya} />
                        <DosyaActionMenu
                          dosya={dosya}
                          openMenuId={openMenuId}
                          setOpenMenuId={setOpenMenuId}
                          selectedDosyaIds={selectedDosyaIds}
                          handleOpenInNewWindow={handleOpenInNewWindow}
                          handleUpdateStatus={handleUpdateStatus}
                          handleEkapGonder={handleEkapGonder}
                          handleKilidiAc={handleKilidiAc}
                          handleOpenAI={handleOpenAI}
                          handleDelete={handleDelete}
                          handleHardDelete={handleHardDelete}
                          handleOpenMaliyetAyarlari={handleOpenMaliyetAyarlari}
                        />
                      </div>
                    </div>

                    <h3
                      className="text-[11px] font-bold text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                      title={dosya.konu}
                    >
                      {dosya.konu}
                      {dosya.tekrar_no && dosya.tekrar_no > 1 ? (
                        <span className="ml-1 text-[9px] font-black text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-1 py-0.5 rounded">
                          #{dosya.tekrar_no}
                        </span>
                      ) : null}
                    </h3>

                    {/* Proje ve Etiketler */}
                    {(dosya.proje_adi || dosya.tags) && (() => {
                      let tagList: string[] = []
                      if (dosya.tags) {
                        try {
                          const parsed = JSON.parse(dosya.tags)
                          if (Array.isArray(parsed)) tagList = parsed
                        } catch {
                          tagList = typeof dosya.tags === 'string' ? dosya.tags.split(',').map((s: string) => s.trim()).filter(Boolean) : []
                        }
                      }
                      if (!dosya.proje_adi && tagList.length === 0) return null
                      return (
                        <div className="flex items-center gap-1.5 flex-wrap pt-2">
                          {dosya.proje_adi && (
                            <ProjectBadge
                              projeKodu={dosya.proje_kodu}
                              projeAdi={dosya.proje_adi}
                              renk={dosya.proje_renk}
                            />
                          )}
                          {tagList.map((t: string) => (
                            <TagBadge key={t} tag={t} />
                          ))}
                        </div>
                      )
                    })()}
                  </div>

                  {/* Birim */}
                  <div className="px-4 py-2 bg-blue-50/40 dark:bg-blue-950/20 border-b border-blue-100/50 dark:border-blue-900/20 flex items-center gap-1.5">
                    <Building2 size={10} className="text-blue-500 shrink-0" />
                    <span className="text-[9px] font-semibold text-blue-700 dark:blue-400 truncate">
                      {dosya.birim_adi || 'Birim Seçilmemiş'}
                    </span>
                  </div>

                  {/* Açıklama */}
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800/60">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed min-h-[28px]">
                      {dosya.isin_aciklamasi || (
                        <span className="italic text-slate-350 dark:text-slate-600">
                          Açıklama girilmemiş.
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Detay Grid */}
                  <div className="px-4 py-2.5 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[9px] border-b border-slate-100 dark:border-slate-800/60">
                    <div className="flex items-center gap-1 truncate">
                      <BookOpen size={9} className="text-slate-400 shrink-0" />
                      <span className="text-slate-400 font-semibold shrink-0">Madde:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300 truncate">
                        {dosya.ihale_sekli || '-'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 truncate">
                      <Calendar size={9} className="text-slate-400 shrink-0" />
                      <span className="text-slate-400 font-semibold shrink-0">Bütçe:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300 truncate">
                        {dosya.butce_yili || '-'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 truncate">
                      <ClipboardList size={9} className="text-slate-400 shrink-0" />
                      <span className="text-slate-400 font-semibold shrink-0">Sözleşme:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300 truncate">
                        {dosya.teklif_sozlesme_turu || '-'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 truncate">
                      <Hash size={9} className="text-slate-400 shrink-0" />
                      <span className="text-slate-400 font-semibold shrink-0">Ek. Kodu:</span>
                      <span
                        className="font-bold text-slate-700 dark:text-slate-300 truncate font-mono"
                        title={dosya.ekonomik_kod || ''}
                      >
                        {dosya.ekonomik_kod || '-'}
                      </span>
                    </div>
                  </div>

                  {/* Alt Bölüm: Maliyet + Tarih */}
                  <div className="px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <TrendingUp size={12} className="text-emerald-500" />
                      <span className="font-black text-sm text-emerald-600 dark:text-emerald-400 font-mono">
                        ₺ {formatMoney(dosya.yaklasik_maliyet || 0)}
                      </span>
                      {dosya.kdv && (
                        <span className="text-[9px] text-emerald-500/70 font-semibold">
                          (+%{dosya.kdv} KDV)
                        </span>
                      )}
                    </div>
                    <span className="text-slate-400 text-[9px] flex items-center gap-1">
                      <Calendar size={10} />
                      {dosya.dosya_acilis_tarihi
                        ? formatDate(dosya.dosya_acilis_tarihi)
                        : formatDate(dosya.created_at)}
                    </span>
                  </div>

                  {/* Seçili göstergesi */}
                  {activeDosyaId === dosya.id && (
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 rounded-l-2xl" />
                  )}
                </div>
              ))}
          </div>
        )
      })}
    </div>
  )
}

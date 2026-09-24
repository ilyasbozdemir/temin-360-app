import React from 'react'
import { CheckCircle2, ChevronRight, FolderOpen } from 'lucide-react'
import { cn } from '../../../utils/cn'
import { ProjectBadge, TagBadge, TurBadge } from './Badges'
import { DosyaActionMenu } from './DosyaActionMenu'
import { DosyaHizliIcerikPopover } from './DosyaHizliIcerikPopover'
import { useNavigate } from '@tanstack/react-router'

export interface DosyalarTableViewProps {
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

export function DosyalarTableView({
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
}: DosyalarTableViewProps) {
  const navigate = useNavigate()

  return (
    <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <table className="w-full border-collapse text-left text-xs">
          <thead className="sticky top-0 bg-slate-50 dark:bg-slate-950 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800 z-10">
            <tr>
              <th className="p-3.5 pl-5">Dosya No</th>
              <th className="p-3.5">İhale Konusu (İşin Adı)</th>
              <th className="p-3.5">Birim</th>
              <th className="p-3.5">Tür</th>
              <th className="p-3.5 text-right">Yaklaşık Maliyet</th>
              <th className="p-3.5 text-center">Tarih</th>
              <th className="p-3.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {groupedDosyalar.map((group) => {
              const hasMultiple = group.files.length > 1
              const isExpanded = expandedGroups.includes(group.baseKonu) || searchQuery.length > 0

              return (
                <React.Fragment key={group.baseKonu}>
                  {hasMultiple && (
                    <tr
                      className="bg-slate-50/80 dark:bg-slate-900/80 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border-y border-slate-200 dark:border-slate-700"
                      onClick={() => toggleGroup(group.baseKonu)}
                    >
                      <td colSpan={7} className="p-3 pl-5">
                        <div className="flex items-center gap-3">
                          <ChevronRight
                            size={16}
                            className={cn(
                              'text-slate-400 transition-transform',
                              isExpanded && 'rotate-90'
                            )}
                          />
                          <FolderOpen size={16} className="text-blue-500" />
                          <span className="font-bold text-slate-700 dark:text-slate-300">
                            {group.baseKonu}
                          </span>
                          <span className="text-[9px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-md">
                            {group.files.length} Alım İşlemi
                          </span>
                        </div>
                      </td>
                    </tr>
                  )}
                  {(isExpanded || !hasMultiple) &&
                    group.files.map((dosya) => (
                      <tr
                        key={dosya.id}
                        onClick={() => {
                          setActiveDosyaId(dosya.id)
                          navigate({ to: '/takip' })
                        }}
                        className={cn(
                          'group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 cursor-pointer transition-colors',
                          activeDosyaId === dosya.id && 'bg-blue-50/30 dark:bg-blue-900/10',
                          dosya.is_deleted === 1 && 'opacity-50 grayscale'
                        )}
                      >
                        <td className="p-3.5 pl-5 font-mono font-bold text-slate-500 whitespace-nowrap">
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
                            <span>{getDosyaNoLabel(dosya)}</span>
                          </div>
                        </td>
                        <td
                          className="p-3.5 font-bold text-slate-800 dark:text-slate-200 max-w-xs"
                          title={dosya.konu}
                        >
                          <div className="line-clamp-1">{dosya.konu}</div>
                          {dosya.tekrar_no && dosya.tekrar_no > 1 ? (
                            <span className="ml-1 text-[9px] text-amber-500 font-black">
                              #{dosya.tekrar_no}
                            </span>
                          ) : null}

                          {(dosya.proje_adi || dosya.tags) &&
                            (() => {
                              let tagList: string[] = []
                              if (dosya.tags) {
                                try {
                                  const parsed = JSON.parse(dosya.tags)
                                  if (Array.isArray(parsed)) tagList = parsed
                                } catch {
                                  tagList =
                                    typeof dosya.tags === 'string'
                                      ? dosya.tags
                                          .split(',')
                                          .map((s: string) => s.trim())
                                          .filter(Boolean)
                                      : []
                                }
                              }
                              if (!dosya.proje_adi && tagList.length === 0) return null
                              return (
                                <div className="flex items-center gap-1 flex-wrap pt-1">
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
                        </td>
                        <td className="p-3.5 text-slate-500 max-w-[120px] truncate text-[10px]">
                          {dosya.birim_adi || '-'}
                        </td>
                        <td className="p-3.5">
                          <TurBadge tur={dosya.tur} />
                        </td>
                        <td className="p-3.5 text-right font-bold text-emerald-600 dark:text-emerald-400 font-mono whitespace-nowrap">
                          ₺ {formatMoney(dosya.yaklasik_maliyet || 0)}
                        </td>
                        <td className="p-3.5 text-center text-slate-450 whitespace-nowrap">
                          {dosya.dosya_acilis_tarihi
                            ? formatDate(dosya.dosya_acilis_tarihi)
                            : formatDate(dosya.created_at)}
                        </td>
                        <td className="p-3.5 text-right pr-5">
                          <div className="flex items-center justify-end gap-1">
                            <DosyaHizliIcerikPopover dosya={dosya} />
                            <DosyaActionMenu
                              dosya={dosya}
                              openMenuId={openMenuId}
                              setOpenMenuId={setOpenMenuId}
                              selectedDosyaIds={selectedDosyaIds}
                              menuClassName="right-full mr-2 top-0 mt-0 w-48 text-left z-50 inline-block"
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
                        </td>
                      </tr>
                    ))}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

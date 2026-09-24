import React from 'react'
import { CheckCircle2, Clock, XCircle } from 'lucide-react'
import { cn } from '../../../utils/cn'

export function TurBadge({ tur }: { tur: string }): React.ReactElement {
  const key = (tur || '').toLowerCase().trim()
  const map: Record<string, { label: string; cls: string }> = {
    mal: {
      label: 'Mal Alımı',
      cls: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60'
    },
    hizmet: {
      label: 'Hizmet Alımı',
      cls: 'bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 border border-violet-200/80 dark:border-violet-800/60'
    },
    yapim_isi: {
      label: 'Yapım İşi / Onarım',
      cls: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60'
    },
    yapim: {
      label: 'Yapım İşi / Onarım',
      cls: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60'
    },
    danismanlik: {
      label: 'Danışmanlık',
      cls: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/60'
    },
    hakedis: {
      label: 'Hakediş',
      cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60'
    },
    ihale: {
      label: 'İhale',
      cls: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60'
    }
  }

  const found =
    map[key] ||
    (key.includes('yapım')
      ? map.yapim_isi
      : key.includes('hizmet')
        ? map.hizmet
        : key.includes('danışman')
          ? map.danismanlik
          : undefined)

  const { label, cls } = found ?? {
    label: tur || 'Mal Alımı',
    cls: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
  }

  return (
    <span
      className={cn(
        'px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wide inline-flex items-center',
        cls
      )}
    >
      {label}
    </span>
  )
}

export function DurumBadge({
  durumAsamaId,
  isDeleted,
  status
}: {
  durumAsamaId: number | null
  isDeleted?: number
  status?: string
}): React.ReactElement {
  if (isDeleted === 1) {
    return (
      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 px-1.5 py-0.5 rounded border border-red-200 dark:border-red-800/60">
        <XCircle size={10} /> İptal Edildi
      </span>
    )
  }
  if (status === 'tamamlandi') {
    return (
      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 px-1.5 py-0.5 rounded border border-purple-200 dark:border-purple-800/60">
        <CheckCircle2 size={10} /> Tamamlandı
      </span>
    )
  }
  if (!durumAsamaId) {
    return (
      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
        <Clock size={10} /> Taslak
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/60">
      <CheckCircle2 size={10} /> Aktif
    </span>
  )
}

const TAG_COLORS = [
  'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/60',
  'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60',
  'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/60',
  'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60',
  'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/60',
  'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200/80 dark:border-cyan-800/60',
  'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800/60',
  'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200/80 dark:border-teal-800/60'
]

function getTagColor(tag: string): string {
  let hash = 0
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % TAG_COLORS.length
  return TAG_COLORS[index]
}

export function TagBadge({
  tag,
  onRemove,
  onClick,
  active
}: {
  tag: string
  onRemove?: () => void
  onClick?: () => void
  active?: boolean
}): React.ReactElement {
  const cleanTag = tag.startsWith('#') ? tag : `#${tag}`
  const colorCls = getTagColor(tag)

  return (
    <span
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-all select-none',
        colorCls,
        onClick ? 'cursor-pointer hover:opacity-80 active:scale-95' : '',
        active ? 'ring-2 ring-offset-1 ring-blue-500 font-bold shadow-sm' : ''
      )}
    >
      <span>{cleanTag}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="hover:text-red-500 rounded-full p-0.5 transition-colors cursor-pointer"
        >
          ×
        </button>
      )}
    </span>
  )
}

export function ProjectBadge({
  projeKodu,
  projeAdi,
  renk,
  onClick
}: {
  projeKodu?: string | null
  projeAdi?: string | null
  renk?: string | null
  onClick?: () => void
}): React.ReactElement | null {
  if (!projeKodu && !projeAdi) return null

  return (
    <span
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all select-none bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700',
        onClick ? 'cursor-pointer hover:border-blue-400 hover:text-blue-600' : ''
      )}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: renk || '#3b82f6' }}
      />
      {projeKodu && (
        <span className="font-mono text-[9px] text-blue-600 dark:text-blue-400">{projeKodu}</span>
      )}
      {projeKodu && projeAdi && <span className="text-slate-300 dark:text-slate-600">•</span>}
      {projeAdi && <span className="truncate max-w-[140px]">{projeAdi}</span>}
    </span>
  )
}

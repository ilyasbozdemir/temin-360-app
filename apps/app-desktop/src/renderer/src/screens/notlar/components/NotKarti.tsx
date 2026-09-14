import React from 'react'
import {
  CheckCircle2,
  Circle,
  Clock,
  Pin,
  Trash2,
  Edit3,
  Calendar,
  Folder,
  AlertTriangle,
  FileText,
  CheckSquare,
  Bell
} from 'lucide-react'
import { NotVeGorev, NotOncelik, NotRenk, NotTip } from '../types'

interface NotKartiProps {
  item: NotVeGorev
  viewMode: 'list' | 'sticky'
  onToggle: (id: number, currentStatus: boolean) => void
  onTogglePin: (id: number, currentPin: boolean) => void
  onEdit: (item: NotVeGorev) => void
  onDelete: (id: number) => void
  onSelectDosya?: (dosyaId: number) => void
}

const ONCELIK_CONFIG: Record<
  NotOncelik,
  { label: string; bg: string; text: string; border: string; pulse?: boolean }
> = {
  acil: {
    label: 'Acil',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800/50',
    pulse: true
  },
  yuksek: {
    label: 'Yüksek',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800/50'
  },
  orta: {
    label: 'Orta',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800/50'
  },
  dusuk: {
    label: 'Düşük',
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-200 dark:border-slate-700'
  }
}

const STICKY_COLOR_MAP: Record<
  NotRenk,
  { bg: string; border: string; headerBg: string; text: string }
> = {
  slate: {
    bg: 'bg-slate-50 dark:bg-slate-850',
    border: 'border-slate-200 dark:border-slate-700',
    headerBg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-800 dark:text-slate-100'
  },
  amber: {
    bg: 'bg-amber-50/90 dark:bg-amber-950/30',
    border: 'border-amber-200/80 dark:border-amber-800/40',
    headerBg: 'bg-amber-100/80 dark:bg-amber-900/40',
    text: 'text-amber-950 dark:text-amber-100'
  },
  blue: {
    bg: 'bg-blue-50/80 dark:bg-blue-950/30',
    border: 'border-blue-200/80 dark:border-blue-800/40',
    headerBg: 'bg-blue-100/70 dark:bg-blue-900/40',
    text: 'text-blue-950 dark:text-blue-100'
  },
  emerald: {
    bg: 'bg-emerald-50/80 dark:bg-emerald-950/30',
    border: 'border-emerald-200/80 dark:border-emerald-800/40',
    headerBg: 'bg-emerald-100/70 dark:bg-emerald-900/40',
    text: 'text-emerald-950 dark:text-emerald-100'
  },
  purple: {
    bg: 'bg-purple-50/80 dark:bg-purple-950/30',
    border: 'border-purple-200/80 dark:border-purple-800/40',
    headerBg: 'bg-purple-100/70 dark:bg-purple-900/40',
    text: 'text-purple-950 dark:text-purple-100'
  },
  rose: {
    bg: 'bg-rose-50/80 dark:bg-rose-950/30',
    border: 'border-rose-200/80 dark:border-rose-800/40',
    headerBg: 'bg-rose-100/70 dark:bg-rose-900/40',
    text: 'text-rose-950 dark:text-rose-100'
  },
  indigo: {
    bg: 'bg-indigo-50/80 dark:bg-indigo-950/30',
    border: 'border-indigo-200/80 dark:border-indigo-800/40',
    headerBg: 'bg-indigo-100/70 dark:bg-indigo-900/40',
    text: 'text-indigo-950 dark:text-indigo-100'
  }
}

const TIP_ICONS: Record<NotTip, React.ReactNode> = {
  todo: <CheckSquare className="w-3.5 h-3.5 text-blue-500" />,
  not: <FileText className="w-3.5 h-3.5 text-amber-500" />,
  hatirlatici: <Bell className="w-3.5 h-3.5 text-purple-500" />
}

export function NotKarti({
  item,
  viewMode,
  onToggle,
  onTogglePin,
  onEdit,
  onDelete,
  onSelectDosya
}: NotKartiProps): React.JSX.Element {
  const isCompleted = item.tamamlandi === 1
  const isPinned = item.sabitlendi === 1
  const oncelik = ONCELIK_CONFIG[item.oncelik || 'orta']
  const colorTheme = STICKY_COLOR_MAP[item.renk || 'slate']

  // Tarih ve gecikme kontrolü
  let isOverdue = false
  let isToday = false
  if (item.vade_tarihi && !isCompleted) {
    const today = new Date().toISOString().split('T')[0]
    if (item.vade_tarihi < today) isOverdue = true
    else if (item.vade_tarihi === today) isToday = true
  }

  // LISTE GÖRÜNÜMÜ
  if (viewMode === 'list') {
    return (
      <div
        className={`group relative flex items-start gap-3 p-3.5 rounded-xl border transition-all duration-200 ${
          isCompleted
            ? 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/50 opacity-70'
            : isPinned
              ? 'bg-amber-50/30 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60 shadow-xs'
              : 'bg-white dark:bg-slate-850 border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md'
        }`}
      >
        {/* Tamamlandı Checkbox */}
        <button
          type="button"
          onClick={() => onToggle(item.id, isCompleted)}
          className="mt-0.5 shrink-0 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
          title={isCompleted ? 'Tamamlanmadı olarak işaretle' : 'Tamamlandı olarak işaretle'}
        >
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <Circle className="w-5 h-5 hover:scale-110 transition-transform" />
          )}
        </button>

        {/* Gövde / İçerik */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {/* Sabitlendi Rozeti */}
            {isPinned && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.2 rounded-md">
                <Pin className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                Sabitli
              </span>
            )}

            {/* Tip İkonu */}
            <span className="inline-flex items-center" title={`Tür: ${item.tip}`}>
              {TIP_ICONS[item.tip]}
            </span>

            {/* Başlık */}
            <span
              className={`text-sm font-semibold tracking-tight ${
                isCompleted
                  ? 'line-through text-slate-400 dark:text-slate-500'
                  : 'text-slate-800 dark:text-slate-100'
              }`}
            >
              {item.baslik}
            </span>

            {/* Öncelik Rozeti */}
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${oncelik.bg} ${oncelik.text} ${oncelik.border}`}
            >
              {oncelik.pulse && !isCompleted && (
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
              )}
              {oncelik.label}
            </span>

            {/* Kategori */}
            {item.kategori && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {item.kategori}
              </span>
            )}
          </div>

          {/* Açıklama / İçerik Detayı */}
          {item.icerik && (
            <p
              className={`text-xs mt-1 leading-relaxed whitespace-pre-line ${
                isCompleted
                  ? 'text-slate-400 dark:text-slate-600'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {item.icerik}
            </p>
          )}

          {/* Alt Çubuk: Dosya Bağlantısı & Vade Tarihi */}
          <div className="flex items-center gap-3 mt-2 pt-1 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
            {/* İlgili Temin Dosyası */}
            {item.temin_dosya_id ? (
              <button
                type="button"
                onClick={() => onSelectDosya?.(item.temin_dosya_id!)}
                className="inline-flex items-center gap-1 font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer bg-blue-50/60 dark:bg-blue-950/40 px-2 py-0.5 rounded border border-blue-200/50 dark:border-blue-900/40"
                title="Bu dosyaya ait diğer kayıtları filtrele"
              >
                <Folder className="w-3 h-3" />
                <span>
                  {item.dosya_no ? `Dosya No: ${item.dosya_no}` : `Dosya #${item.temin_dosya_id}`}
                  {item.dosya_konusu ? ` - ${item.dosya_konusu.substring(0, 30)}...` : ''}
                </span>
              </button>
            ) : (
              <span className="text-slate-400 dark:text-slate-500 text-[10px]">
                Genel Çalışma Notu
              </span>
            )}

            {/* Vade Tarihi */}
            {item.vade_tarihi && (
              <span
                className={`inline-flex items-center gap-1 font-medium px-1.5 py-0.2 rounded ${
                  isOverdue
                    ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold'
                    : isToday
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold'
                      : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {isOverdue ? (
                  <AlertTriangle className="w-3 h-3 text-rose-600" />
                ) : (
                  <Calendar className="w-3 h-3" />
                )}
                <span>
                  {isOverdue ? `Gecikti: ${item.vade_tarihi}` : isToday ? 'Bugün Son!' : item.vade_tarihi}
                </span>
              </span>
            )}

            {/* Tamamlanma saati */}
            {isCompleted && item.tamamlanma_tarihi && (
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400">
                <Clock className="w-2.5 h-2.5" />
                Tamamlandı: {new Date(item.tamamlanma_tarihi).toLocaleDateString('tr-TR')}
              </span>
            )}
          </div>
        </div>

        {/* İşlem Butonları (Hover ile belirginleşir) */}
        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            type="button"
            onClick={() => onTogglePin(item.id, isPinned)}
            className={`p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
              isPinned ? 'text-amber-500' : 'text-slate-400 hover:text-slate-600'
            }`}
            title={isPinned ? 'Sabitlemeyi Kaldır' : 'Başa Sabitle'}
          >
            <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-current' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
            title="Düzenle"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            title="Sil"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    )
  }

  // YAPISKAN NOT (STICKY NOTE) GÖRÜNÜMÜ
  return (
    <div
      className={`group relative flex flex-col justify-between p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
        colorTheme.bg
      } ${colorTheme.border} ${isCompleted ? 'opacity-65' : ''}`}
      style={{ minHeight: '200px' }}
    >
      {/* Üst Kısım / Bant */}
      <div>
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-1.5">
            {TIP_ICONS[item.tip]}
            <span className="text-[11px] font-semibold uppercase tracking-wider opacity-75">
              {item.kategori || 'Genel'}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onTogglePin(item.id, isPinned)}
              className={`p-1 rounded transition-colors cursor-pointer ${
                isPinned ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400 hover:text-slate-600'
              }`}
              title={isPinned ? 'Sabitlemeyi Kaldır' : 'Başa Sabitle'}
            >
              <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-current' : ''}`} />
            </button>
            <button
              type="button"
              onClick={() => onEdit(item)}
              className="p-1 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
              title="Düzenle"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(item.id)}
              className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
              title="Sil"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Başlık */}
        <h4
          className={`text-sm font-bold tracking-tight mb-2 ${
            isCompleted ? 'line-through opacity-60' : colorTheme.text
          }`}
        >
          {item.baslik}
        </h4>

        {/* Not İçeriği */}
        {item.icerik && (
          <p className="text-xs leading-relaxed whitespace-pre-line opacity-85 mb-3">
            {item.icerik}
          </p>
        )}
      </div>

      {/* Alt Çubuk */}
      <div className="pt-2 border-t border-black/5 dark:border-white/5 space-y-2 text-[11px]">
        {/* Dosya Bilgisi */}
        {item.temin_dosya_id && (
          <div className="flex items-center gap-1 text-blue-700 dark:text-blue-300 font-medium truncate">
            <Folder className="w-3 h-3 shrink-0" />
            <span className="truncate">
              {item.dosya_no ? `Dosya No: ${item.dosya_no}` : `Dosya #${item.temin_dosya_id}`}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          {/* Öncelik & Vade */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`inline-flex items-center text-[9px] font-bold px-1.5 py-0.2 rounded ${oncelik.bg} ${oncelik.text}`}
            >
              {oncelik.label}
            </span>
            {item.vade_tarihi && (
              <span
                className={`inline-flex items-center gap-0.5 text-[10px] ${
                  isOverdue
                    ? 'text-rose-600 font-bold'
                    : isToday
                      ? 'text-amber-600 font-bold'
                      : 'opacity-70'
                }`}
              >
                <Calendar className="w-3 h-3" />
                {item.vade_tarihi}
              </span>
            )}
          </div>

          {/* Tamamlandı Butonu */}
          <button
            type="button"
            onClick={() => onToggle(item.id, isCompleted)}
            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-lg border transition-colors cursor-pointer ${
              isCompleted
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-white/70 dark:bg-black/20 hover:bg-white text-slate-700 dark:text-slate-200 border-slate-300/60 dark:border-slate-750'
            }`}
          >
            {isCompleted ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tamamlandı</span>
              </>
            ) : (
              <>
                <Circle className="w-3.5 h-3.5" />
                <span>Tamamla</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

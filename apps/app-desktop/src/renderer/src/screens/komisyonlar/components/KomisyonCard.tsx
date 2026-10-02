import React from 'react'
import {
  ChevronDown,
  ChevronUp,
  Edit2,
  FileText,
  Printer,
  Settings,
  ShieldCheck,
  Trash2,
  Users,
  Zap
} from 'lucide-react'
import { Button } from '../../../components/ui/Button'

interface KomisyonCardProps {
  komisyon: any
  isBaseKomisyon: (ad?: string, id?: number) => boolean
  getIconForTur: (ad: string) => React.ReactNode
  expanded: boolean
  onToggleExpanded: () => void
  onHizliKadro: (komisyon: { id: number; ad: string }) => void
  onEditKomisyon: (id: number) => void
  onDeleteKomisyon: (id: number) => void
  onOpenPreview: (sablon: any, title: string) => void
  onOpenDetails: (id: number) => void
  onManageBelgeler?: (komisyon: { id: number; ad: string }) => void
  activeDosyaId?: number | null
}

export const KomisyonCard: React.FC<KomisyonCardProps> = ({
  komisyon,
  isBaseKomisyon,
  getIconForTur,
  expanded,
  onToggleExpanded,
  onHizliKadro,
  onEditKomisyon,
  onDeleteKomisyon,
  onOpenPreview,
  onOpenDetails,
  onManageBelgeler,
  activeDosyaId
}) => {
  const assignedMembers = komisyon.uyeler?.filter((m: any) => m.personel_id || m.ad_soyad) || []
  const asilCount =
    komisyon.uyeler?.filter((m: any) => m.asil_mi === 1 && (m.personel_id || m.ad_soyad)).length ||
    0
  const yedekCount =
    komisyon.uyeler?.filter((m: any) => m.asil_mi === 0 && (m.personel_id || m.ad_soyad)).length ||
    0

  return (
    <div className="group flex flex-col p-5 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-700/60 transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3.5 flex-1">
          <div className="w-11 h-11 shrink-0 rounded-xl bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner border border-blue-100 dark:border-blue-800/50">
            {getIconForTur(komisyon.ad)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 leading-snug">
              {komisyon.ad}
            </h3>
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              {isBaseKomisyon(komisyon.ad, komisyon.id) && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] font-bold border border-blue-200/80 dark:border-blue-800">
                  Temel Komisyon
                </span>
              )}
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                <Users className="w-3 h-3 text-slate-500" />
                {komisyon.uyeler?.length || 0} Kadro
              </span>
              {asilCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                  {asilCount} Asil
                </span>
              )}
              {yedekCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-[11px] font-bold text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60">
                  {yedekCount} Yedek
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEditKomisyon(komisyon.id)}
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            title="Komisyon Tanımını Düzenle"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          {isBaseKomisyon(komisyon.ad, komisyon.id) ? (
            <span
              className="p-2 text-slate-300 dark:text-slate-600 cursor-not-allowed"
              title="Sistem temel komisyonudur, silinemez."
            >
              <ShieldCheck className="w-4 h-4 text-blue-500/70" />
            </span>
          ) : (
            <button
              type="button"
              onClick={() => onDeleteKomisyon(komisyon.id)}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-colors cursor-pointer"
              title="Sil"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Görevli Kadrosu Önizlemesi */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">
            Görevli Kadrosu
          </div>
        </div>

        {assignedMembers.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {assignedMembers.map((m: any, idx: number) => (
              <div
                key={idx}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border ${
                  m.asil_mi === 1
                    ? 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                    : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/60 dark:border-amber-800/50 text-amber-800 dark:text-amber-300'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${m.asil_mi === 1 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                />
                <span className="font-bold">{m.ad_soyad || 'Atanmamış'}</span>
                {m.gorev_adi && (
                  <span className="text-[10px] text-slate-400 font-normal">({m.gorev_adi})</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 bg-slate-50/70 dark:bg-slate-950/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center mb-2">
            <span className="text-xs text-slate-400 italic">Henüz görevli atanmadı.</span>
            <button
              type="button"
              onClick={() => onHizliKadro({ id: komisyon.id, ad: komisyon.ad })}
              className="ml-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              + Kadroyu Ata
            </button>
          </div>
        )}
      </div>

      {/* Content: Üretilebilir Belgeler */}
      <div className="mt-3 mb-3">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onToggleExpanded}
            className={`flex-1 flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
              expanded
                ? 'bg-blue-50/80 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/50 text-blue-700 dark:text-blue-300 shadow-2xs'
                : 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-850'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-blue-500" />
              <span>Üretilebilir Belgeler</span>
              <span
                className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                  (komisyon.sablonlar?.length || 0) > 0
                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                }`}
              >
                {komisyon.sablonlar?.length || 0}
              </span>
            </div>
            {expanded ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {onManageBelgeler && (
            <button
              type="button"
              onClick={() => onManageBelgeler({ id: komisyon.id, ad: komisyon.ad })}
              className="p-2 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-800 rounded-xl transition-all flex items-center justify-center shrink-0 cursor-pointer"
              title="Üretilebilir Belgeleri Yönet"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {expanded && (
          <div className="mt-2 p-2 bg-slate-50/60 dark:bg-slate-950/40 rounded-xl border border-slate-200/70 dark:border-slate-800/70 animate-in fade-in slide-in-from-top-1 duration-150">
            {komisyon.sablonlar && komisyon.sablonlar.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto custom-scrollbar p-0.5">
                {komisyon.sablonlar.map((sablon: any) => (
                  <button
                    key={sablon.id}
                    type="button"
                    onClick={() => {
                      if (!activeDosyaId) {
                        alert(
                          'Lütfen önce sol menüden veya "Dosyalar" altından bir dosya/proje açın. Belgeler, aktif dosya verileri kullanılarak hazırlanmaktadır.'
                        )
                        return
                      }
                      onOpenPreview(sablon, sablon.ad)
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:border-emerald-300 hover:bg-emerald-50 dark:hover:border-emerald-700 dark:hover:bg-emerald-900/20 hover:text-emerald-700 dark:hover:text-emerald-400 transition-all text-left shadow-2xs hover:shadow-xs cursor-pointer"
                    title="Belgeyi Önizle ve Yazdır"
                  >
                    <Printer className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span className="line-clamp-1">{sablon.ad}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-400 dark:text-slate-500 italic p-2 text-center">
                Bu komisyona atanmış belge şablonu bulunmuyor.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
        <Button
          className="flex-1 justify-center gap-2 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-sm shadow-blue-500/20 transition-all h-9.5"
          onClick={() => onHizliKadro({ id: komisyon.id, ad: komisyon.ad })}
        >
          <Zap className="w-3.5 h-3.5" />⚡ Kadroyu Düzenle
        </Button>

        <Button
          variant="outline"
          className="justify-center gap-1.5 rounded-xl border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:hover:border-slate-700 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-all h-9.5 px-3"
          onClick={() => onOpenDetails(komisyon.id)}
          title="Detaylı Yönetim Sayfasını Aç"
        >
          <Users className="w-3.5 h-3.5 text-slate-500" />
          Detaylar
        </Button>
      </div>
    </div>
  )
}

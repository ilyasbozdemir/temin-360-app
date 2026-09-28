import React from 'react'
import { FileCheck2, Clock, Calendar, Sparkles, Check, Printer } from 'lucide-react'
import { cn } from '@renderer/utils/cn'
import { FirmaStats, IslemlerData } from './types'

interface Step4KabulVeSiparisProps {
  islemlerData: IslemlerData
  firmaStats: FirmaStats
  savedFeedback: boolean
  handleUpdateTeslimGunu: (gun: number) => Promise<void>
  handleUpdateTeslimTarihi: (dateStr: string) => Promise<void>
  handleToggleSozlesme: () => Promise<void>
  onOpenKabulMektubu: () => void
}

export function Step4KabulVeSiparis({
  islemlerData,
  firmaStats,
  savedFeedback,
  handleUpdateTeslimGunu,
  handleUpdateTeslimTarihi,
  handleToggleSozlesme,
  onOpenKabulMektubu
}: Step4KabulVeSiparisProps): React.JSX.Element {
  const presetDays = [
    { gun: 3, label: '3 Gün', badge: 'Acil' },
    { gun: 7, label: '7 Gün', badge: 'Standart' },
    { gun: 10, label: '10 Gün', badge: 'Yasal' },
    { gun: 15, label: '15 Gün', badge: 'Mal/İş' },
    { gun: 30, label: '30 Gün', badge: '1 Ay' },
    { gun: 60, label: '60 Gün', badge: '2 Ay' }
  ]

  const currentGun = islemlerData.teslimGunu || 7

  return (
    <div className="flex flex-col gap-5">
      {/* ═══ 1. Üst Bölüm: Ayarlar ve Canlı Önizleme (2 Kolon) ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Sol: Kibar ve Modern Teslimat Gün & Tarih Seçici */}
        <div className="flex flex-col justify-between p-4.5 rounded-2xl bg-slate-50/70 dark:bg-slate-850/50 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex flex-col gap-3">
            {/* Başlık ve Aktif Gün Göstergesi */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Teslimat Süresi
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-extrabold shadow-2xs">
                <span>{currentGun} Takvim Günü</span>
              </div>
            </div>

            {/* Kibar Hızlı Seçim Hapları (Pills) */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                Hızlı Seçenekler:
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {presetDays.map(({ gun, label, badge }) => {
                  const isSelected = currentGun === gun
                  return (
                    <button
                      key={gun}
                      type="button"
                      onClick={() => handleUpdateTeslimGunu(gun)}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer select-none active:scale-95',
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs font-bold'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/90 dark:border-slate-750 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-slate-750'
                      )}
                    >
                      <span>{label}</span>
                      <span
                        className={cn(
                          'text-[9px] px-1 py-0.2 rounded-md font-semibold',
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-400'
                        )}
                      >
                        {badge}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Özel Gün Sayısı & Tahmini Teslim Tarihi */}
          <div className="grid grid-cols-2 gap-3 pt-3 mt-3 border-t border-slate-200/60 dark:border-slate-800">
            {/* Özel Gün Stepper */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                Özel Gün Belirle:
              </label>
              <div className="flex items-center h-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 p-0.5 shadow-2xs">
                <button
                  type="button"
                  onClick={() => handleUpdateTeslimGunu(Math.max(1, currentGun - 1))}
                  className="w-7 h-full flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs cursor-pointer transition-colors"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={islemlerData.teslimGunu || ''}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10)
                    if (!isNaN(val) && val > 0) handleUpdateTeslimGunu(val)
                  }}
                  className="w-full text-center text-xs font-black text-slate-800 dark:text-slate-100 bg-transparent outline-hidden"
                />
                <span className="text-[10px] text-slate-400 dark:text-slate-500 pr-1 select-none">
                  gün
                </span>
                <button
                  type="button"
                  onClick={() => handleUpdateTeslimGunu(currentGun + 1)}
                  className="w-7 h-full flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs cursor-pointer transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Tahmini Teslim Tarihi */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                Tahmini Teslim Tarihi:
              </label>
              <div className="relative flex items-center h-8">
                <input
                  type="date"
                  value={islemlerData.teslimTarihi || ''}
                  onChange={(e) => handleUpdateTeslimTarihi(e.target.value)}
                  className="w-full h-full px-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-xl font-medium text-slate-800 dark:text-slate-100 shadow-2xs cursor-pointer outline-hidden focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sağ: Sözleşme Durumu & Canlı Tebliğ Metni */}
        <div className="flex flex-col gap-3.5 p-4.5 rounded-2xl bg-slate-50/80 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-800 shadow-2xs justify-between">
          <div className="flex flex-col gap-3">
            {/* Sözleşme Toggle Kartı */}
            <div
              onClick={handleToggleSozlesme}
              className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-2xs cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-all group select-none"
            >
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Sözleşme Düzenlenecek mi?
                </span>
                <span
                  className={cn(
                    'text-xs font-extrabold flex items-center gap-1.5 mt-0.5',
                    firmaStats.sozlesmeYapilacakMi
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-slate-700 dark:text-slate-300'
                  )}
                >
                  {firmaStats.sozlesmeYapilacakMi
                    ? '✓ Evet, Sözleşme İmzalanacak (Adım 3 Aktif)'
                    : '✕ Hayır, Yalnızca Sipariş Formu'}
                </span>
              </div>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800 group-hover:bg-blue-600 group-hover:text-white transition-all">
                Değiştir ↺
              </span>
            </div>

            {/* Canlı Önizleme Tebligat Hükmü */}
            <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/25 border border-amber-200/80 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
              <strong className="font-extrabold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Belgeye Yansıyacak Yasal Hüküm:
              </strong>
              <div className="mt-1.5 italic text-[11px] bg-white/80 dark:bg-slate-900/70 p-2.5 rounded-lg border border-amber-200/60 dark:border-amber-800/50">
                &ldquo;Malı / Hizmeti / İşi{' '}
                <strong className="text-amber-700 dark:text-amber-300 font-black">
                  {islemlerData.teslimGunu || 7} takvim günü
                </strong>{' '}
                içinde mesai saatleri dahilinde teslim etmenizi rica ederiz.&rdquo;
              </div>
            </div>
          </div>

          {/* Bilgi Notu & Kaydedildi Bildirimi */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
            <span>ℹ️ Teslimat süresi belgelere anında entegre edilir.</span>
            {savedFeedback && (
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800 animate-in fade-in">
                <Check className="w-3.5 h-3.5" />
                Kaydedildi
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ═══ 2. Alt Bölüm: Belge Önizleme & Yazdırma Kartı ═══ */}
      <div className="p-5 rounded-2xl bg-linear-to-r from-blue-50/70 via-indigo-50/40 to-slate-50/80 dark:from-slate-850/80 dark:via-blue-950/20 dark:to-slate-900 border border-blue-200/80 dark:border-blue-900/50 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-xs">
        <div className="flex items-start gap-3.5 max-w-xl">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 uppercase tracking-wider border border-blue-200 dark:border-blue-800">
                Resmi Tebligat Belgesi
              </span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                {islemlerData.teslimGunu || 7} Günlük Süre
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Kabul Edilen Teklif Mektubu / Sipariş Formu
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Fiyat araştırması sonucunun ve yukarıda belirlediğiniz yasal teslim süresinin kazanan
              istekliye tebliğ edildiği, alım kalemleri ve bedel tablosunu içeren resmi belgedir.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenKabulMektubu}
          className="py-3 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg active:scale-95 transition-all shrink-0"
        >
          <Printer className="w-4 h-4" />
          Kabul / Sipariş Formunu Aç & Yazdır
        </button>
      </div>
    </div>
  )
}

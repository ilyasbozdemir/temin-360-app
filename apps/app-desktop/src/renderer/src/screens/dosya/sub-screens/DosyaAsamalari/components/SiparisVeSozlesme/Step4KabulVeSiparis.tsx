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
  const readyDays = [
    { gun: 3, label: '3 Gün', sub: 'Acil' },
    { gun: 7, label: '7 Gün', sub: 'Standart', highlight: true },
    { gun: 10, label: '10 Gün', sub: 'Yasal Davet', highlight: true },
    { gun: 15, label: '15 Gün', sub: 'Mal/Hizmet' },
    { gun: 20, label: '20 Gün', sub: 'Teslimat' },
    { gun: 30, label: '30 Gün', sub: '1 Ay' },
    { gun: 45, label: '45 Gün', sub: '1.5 Ay' },
    { gun: 60, label: '60 Gün', sub: '2 Ay' },
    { gun: 90, label: '90 Gün', sub: '3 Ay' }
  ]

  return (
    <div className="flex flex-col gap-5">
      {/* ═══ 1. Üst Bölüm: Ayarlar ve Canlı Önizleme (2 Kolon) ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Sol: Teslimat Gün & Tarih Seçici */}
        <div className="flex flex-col gap-3.5 p-4.5 rounded-2xl bg-slate-50/80 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <Clock className="w-4 h-4" />
              </div>
              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                Teslimat Süresi & Tarihi
              </span>
            </div>
            <span className="text-xs font-black text-amber-700 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-300/80 dark:border-amber-800">
              {islemlerData.teslimGunu || 7} Takvim Günü
            </span>
          </div>

          {/* Hızlı Gün Butonları */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
            {readyDays.map(({ gun, label, sub, highlight }) => {
              const isSelected = (islemlerData.teslimGunu || 7) === gun
              return (
                <button
                  key={gun}
                  type="button"
                  onClick={() => handleUpdateTeslimGunu(gun)}
                  className={cn(
                    'flex flex-col items-center justify-center py-2 px-1 rounded-xl border text-center transition-all cursor-pointer active:scale-95 select-none',
                    isSelected
                      ? 'bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-500/20 font-bold scale-[1.02]'
                      : highlight
                        ? 'bg-amber-50/70 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 border-amber-200/80 dark:border-amber-800/50 hover:bg-amber-100 dark:hover:bg-amber-900/40'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                  )}
                >
                  <span className="text-xs font-extrabold leading-tight">{label}</span>
                  <span
                    className={cn(
                      'text-[9px] leading-tight mt-0.5',
                      isSelected ? 'text-amber-100' : 'text-slate-400 dark:text-slate-500'
                    )}
                  >
                    {sub}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Özel Gün & Tarih Seçimi */}
          <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-200/60 dark:border-slate-800">
            <div>
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                Özel Gün Sayısı:
              </label>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() =>
                    handleUpdateTeslimGunu(Math.max(1, (islemlerData.teslimGunu || 1) - 1))
                  }
                  className="px-2.5 py-1 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-l-lg font-bold text-xs cursor-pointer transition-colors"
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
                  className="w-full px-1 py-1 text-center text-xs bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-700 font-black text-slate-800 dark:text-slate-100"
                />
                <button
                  type="button"
                  onClick={() => handleUpdateTeslimGunu((islemlerData.teslimGunu || 0) + 1)}
                  className="px-2.5 py-1 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-r-lg font-bold text-xs cursor-pointer transition-colors"
                >
                  +
                </button>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                Tahmini Teslim Tarihi:
              </label>
              <input
                type="date"
                value={islemlerData.teslimTarihi || ''}
                onChange={(e) => handleUpdateTeslimTarihi(e.target.value)}
                className="w-full px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-slate-800 dark:text-slate-100 cursor-pointer"
              />
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
              Fiyat araştırması sonucunun ve yukarıda belirlediğiniz yasal teslim süresinin kazanan istekliye tebliğ edildiği, alım kalemleri ve bedel tablosunu içeren resmi belgedir.
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


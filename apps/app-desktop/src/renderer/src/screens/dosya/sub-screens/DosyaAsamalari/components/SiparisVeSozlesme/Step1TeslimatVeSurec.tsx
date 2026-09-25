import React from 'react'
import { Check, Clock } from 'lucide-react'
import { cn } from '../../../../../../utils/cn'
import { FirmaStats, IslemlerData } from './types'

interface Props {
  islemlerData: IslemlerData
  firmaStats: FirmaStats
  savedFeedback: boolean
  handleUpdateTeslimGunu: (gun: number) => Promise<void>
  handleUpdateTeslimTarihi: (dateStr: string) => Promise<void>
  handleToggleSozlesme: () => Promise<void>
}

export const Step1TeslimatVeSurec: React.FC<Props> = ({
  islemlerData,
  firmaStats,
  savedFeedback,
  handleUpdateTeslimGunu,
  handleUpdateTeslimTarihi,
  handleToggleSozlesme
}) => {
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
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Adım 1: Teslimat Süresi & Sözleşme Tercihi
            </h3>
            <p className="text-[11px] text-slate-400">
              Kabul edilen teklif mektubu ve sipariş formunda yer alacak yasal teslim süresi
            </p>
          </div>
        </div>

        {savedFeedback && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-xl animate-in fade-in duration-200">
            <Check className="w-3.5 h-3.5" />
            Kaydedildi
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Teslimat Gün Seçici */}
        <div className="flex flex-col gap-3 p-4 rounded-xl bg-slate-50/70 dark:bg-slate-850/60 border border-slate-200/70 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
              Hızlı Gün Seçimi
            </span>
            <span className="text-xs font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
              {islemlerData.teslimGunu} Takvim Günü
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
            {readyDays.map(({ gun, label, sub, highlight }) => {
              const isSelected = islemlerData.teslimGunu === gun
              return (
                <button
                  key={gun}
                  type="button"
                  onClick={() => handleUpdateTeslimGunu(gun)}
                  className={cn(
                    'flex flex-col items-center justify-center py-2 px-1 rounded-xl border text-center transition-all cursor-pointer active:scale-95',
                    isSelected
                      ? 'bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-500/20 font-bold scale-[1.02]'
                      : highlight
                        ? 'bg-amber-50/70 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 border-amber-200/80 dark:border-amber-800/50 hover:bg-amber-100'
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
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">
                Özel Gün Sayısı:
              </label>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() =>
                    handleUpdateTeslimGunu(Math.max(1, (islemlerData.teslimGunu || 1) - 1))
                  }
                  className="px-2.5 py-1 bg-slate-200 dark:bg-slate-800 rounded-l-lg font-bold text-xs cursor-pointer"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={islemlerData.teslimGunu}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10)
                    if (!isNaN(val) && val > 0) handleUpdateTeslimGunu(val)
                  }}
                  className="w-full px-1 py-1 text-center text-xs bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-700 font-black"
                />
                <button
                  type="button"
                  onClick={() => handleUpdateTeslimGunu((islemlerData.teslimGunu || 0) + 1)}
                  className="px-2.5 py-1 bg-slate-200 dark:bg-slate-800 rounded-r-lg font-bold text-xs cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">
                Tahmini Teslim Tarihi:
              </label>
              <input
                type="date"
                value={islemlerData.teslimTarihi || ''}
                onChange={(e) => handleUpdateTeslimTarihi(e.target.value)}
                className="w-full px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-medium"
              />
            </div>
          </div>
        </div>

        {/* Süreç / Sözleşme Ayarları */}
        <div className="flex flex-col gap-3 p-4 rounded-xl bg-slate-50/70 dark:bg-slate-850/60 border border-slate-200/70 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
            Sözleşme Durumu & Alım Türü
          </span>

          <div
            onClick={handleToggleSozlesme}
            className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-2xs cursor-pointer hover:border-blue-400 transition-all group"
          >
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                Sözleşme Düzenlenecek mi?
              </span>
              <span
                className={cn(
                  'text-xs font-extrabold flex items-center gap-1.5',
                  firmaStats.sozlesmeYapilacakMi
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-slate-700 dark:text-slate-300'
                )}
              >
                {firmaStats.sozlesmeYapilacakMi
                  ? '✓ Evet, Sözleşme İmzalanacak'
                  : '✕ Hayır, Yalnızca Sipariş Formu'}
              </span>
            </div>
            <span className="text-[10px] text-blue-500 font-bold bg-blue-50 dark:bg-blue-950/60 px-2 py-1 rounded-lg border border-blue-200 dark:border-blue-800">
              Değiştir ↺
            </span>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/25 border border-amber-200/80 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
            <strong className="font-extrabold">📌 Canlı Önizleme Hükmü:</strong>
            <div className="mt-1 italic text-[11px] bg-white/70 dark:bg-slate-900/60 p-2 rounded-lg border border-amber-200/50">
              &ldquo;Malı/Hizmeti/İşi{' '}
              <strong className="text-amber-700 dark:text-amber-400 font-extrabold">
                {islemlerData.teslimGunu} gün
              </strong>{' '}
              içinde mesai saatleri dahilinde teslim etmenizi rica ederiz.&rdquo;
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

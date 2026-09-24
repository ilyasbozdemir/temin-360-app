import React from 'react'
import { Calculator, RotateCcw, Sparkles, Trophy } from 'lucide-react'
import { KazananKararPaneliProps } from './types'

export function KazananKararPaneli({
  activeWinnerFirma,
  lowestBidFirm,
  handleSetWinnerFirma,
  setIsFormOpen,
  setActiveFormTab,
  hesaplamaEsasi,
  setHesaplamaEsasi
}: KazananKararPaneliProps): React.JSX.Element {
  const isLowestBasis =
    !hesaplamaEsasi ||
    hesaplamaEsasi.toLowerCase().includes('en düşük') ||
    hesaplamaEsasi.toLowerCase().includes('en dusuk')

  return (
    <div className="p-4 rounded-2xl border border-amber-200/80 dark:border-amber-900/50 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
          <Trophy className="w-5 h-5" />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
              Seçilen / En Uygun Teklif Sahibi
            </h4>

            {/* Dosyadaki Hesaplama Esası Göstergesi / Değiştirici */}
            {setHesaplamaEsasi ? (
              <select
                value={hesaplamaEsasi || 'En Düşük fiyat esasına göre'}
                onChange={(e) => setHesaplamaEsasi(e.target.value)}
                className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100/90 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border border-amber-300/80 dark:border-amber-800/80 focus:outline-none cursor-pointer"
                title="Dosya Hesaplama Esasını Değiştir"
              >
                <option value="En Düşük fiyat esasına göre">⚙️ En Düşük Fiyat Esası</option>
                <option value="Ortalama fiyat esasına göre">⚙️ Ortalama Fiyat Esası</option>
              </select>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
                {isLowestBasis ? 'En Düşük Fiyat Esası' : 'Ortalama Fiyat Esası'}
              </span>
            )}

            {activeWinnerFirma && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">
                Onaylandı
              </span>
            )}
          </div>
          <div className="text-sm font-extrabold text-slate-800 dark:text-slate-100 mt-0.5">
            {activeWinnerFirma
              ? activeWinnerFirma.unvan
              : lowestBidFirm
                ? `${lowestBidFirm.unvan} (${isLowestBasis ? 'En Düşük Teklif' : 'En Uygun Teklif'})`
                : 'Henüz teklif girilmedi veya kazanan seçilmedi'}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => {
            setIsFormOpen(true)
            setActiveFormTab('matrix')
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-xs cursor-pointer border-0"
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>Teklif Fiyatlarını Gir / Düzenle</span>
        </button>

        {lowestBidFirm && (
          <button
            type="button"
            onClick={() => {
              if (handleSetWinnerFirma) {
                handleSetWinnerFirma(lowestBidFirm.firma_id || lowestBidFirm.id)
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition-all shadow-xs cursor-pointer border-0 active:scale-95"
            title={`${isLowestBasis ? 'En düşük' : 'En uygun'} teklif sahibi (${lowestBidFirm.unvan}) kazanan olarak atanır.`}
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-950" />
            {isLowestBasis ? 'En Düşük Teklifi Kazanan Yap' : 'En Uygun Teklifi Kazanan Yap'}
          </button>
        )}

        {activeWinnerFirma && (
          <button
            type="button"
            onClick={() => {
              if (handleSetWinnerFirma) {
                handleSetWinnerFirma(null)
              }
            }}
            className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer border-0"
            title="Seçimi Kaldır"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Sıfırla
          </button>
        )}
      </div>
    </div>
  )
}

import React from 'react'
import { Calculator, ShieldAlert, Trophy } from 'lucide-react'
import { Firma, FirmaColumn, FirmaTabloProps } from './types'
import { FirmaMektupMenu } from './FirmaMektupMenu'
import { RowMenu } from './RowMenu'

export function FirmaTablo({
  columns,
  addedFirms,
  winnerFirmaId,
  onOpenModal,
  onOpenNewFirmModal,
  onFirmaCikar,
  onFiyatGir,
  onFiyatPiyasaFormu,
  onIdareFiyatArastirmaMektubu,
  onBirimFiyatArastirmasi,
  onBosTeklifCetveli,
  onEkapSorgula,
  onSetWinnerFirma
}: FirmaTabloProps): React.JSX.Element {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap ${
                  column.className ?? ''
                }`}
              >
                {column.label}
              </th>
            ))}
            <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 min-w-[200px]">
              Hızlı Eylemler & Dağıtım
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {addedFirms.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + 1}
                className="px-4 py-10 text-center text-xs text-slate-400"
              >
                Henüz istekli firma eklenmedi.{' '}
                <button
                  type="button"
                  onClick={onOpenModal}
                  className="text-blue-500 hover:underline font-bold cursor-pointer bg-transparent border-0 p-0 ml-1"
                >
                  Havuzdan Firma Seçin
                </button>{' '}
                veya{' '}
                <button
                  type="button"
                  onClick={onOpenNewFirmModal}
                  className="text-indigo-500 hover:underline font-bold cursor-pointer bg-transparent border-0 p-0"
                >
                  Yeni Firma Ekleyin
                </button>
              </td>
            </tr>
          ) : (
            addedFirms.map((firma, idx) => {
              const isWinner = winnerFirmaId
                ? winnerFirmaId === firma.id || winnerFirmaId === (firma as any).firma_id
                : false

              return (
                <tr
                  key={
                    firma.temin_firma_id
                      ? `temin-${firma.temin_firma_id}`
                      : `firm-${firma.id}-${idx}`
                  }
                  className={`group transition-colors ${
                    isWinner
                      ? 'bg-amber-50/40 dark:bg-amber-950/20 hover:bg-amber-50/70 dark:hover:bg-amber-950/30 font-medium'
                      : 'hover:bg-slate-50/70 dark:hover:bg-slate-900/50'
                  }`}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-4 py-3 text-xs text-slate-700 dark:text-slate-300 ${
                        column.className ?? ''
                      }`}
                    >
                      {column.render ? (
                        column.render(firma)
                      ) : column.key === 'unvan' && isWinner ? (
                        <div className="flex items-center gap-2">
                          <span>{String(firma[column.key] ?? '-')}</span>
                          <span className="inline-flex items-center gap-1 text-[9px] font-black bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/25 shrink-0">
                            <Trophy className="w-2.5 h-2.5 text-amber-600" />
                            Kazanan
                          </span>
                        </div>
                      ) : (
                        String(firma[column.key] ?? '-')
                      )}
                    </td>
                  ))}

                  {/* Hızlı Eylem Butonları & Kebap Menüsü */}
                  <td className="px-3 py-2 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5 justify-end">
                      {/* 1. Teklif / Mektup Format Menüsü */}
                      <FirmaMektupMenu
                        firma={firma}
                        onFiyatPiyasaFormu={onFiyatPiyasaFormu}
                        onIdareFiyatArastirmaMektubu={onIdareFiyatArastirmaMektubu}
                        onBirimFiyatArastirmasi={onBirimFiyatArastirmasi}
                        onBosTeklifCetveli={onBosTeklifCetveli}
                      />

                      {/* 2. EKAP Yasaklılık Butonu */}
                      {onEkapSorgula && (
                        <button
                          type="button"
                          onClick={() => onEkapSorgula(firma)}
                          className="px-2 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300 dark:hover:bg-orange-900/60 text-[11px] font-bold transition-colors cursor-pointer border border-orange-200/60 dark:border-orange-800/40 flex items-center gap-1"
                          title={`${firma.unvan} için EKAP Yasaklılık Durumunu Sorgula`}
                        >
                          <ShieldAlert className="w-3 h-3 text-orange-500" />
                          <span>EKAP Sorgu</span>
                        </button>
                      )}

                      {/* 3. Fiyat Gir Butonu */}
                      {onFiyatGir && (
                        <button
                          type="button"
                          onClick={onFiyatGir}
                          className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 dark:hover:bg-emerald-900/60 text-[11px] font-bold transition-colors cursor-pointer border border-emerald-200/60 dark:border-emerald-800/40 flex items-center gap-1"
                          title="Teklif Fiyatlarını Gir"
                        >
                          <Calculator className="w-3 h-3 text-emerald-500" />
                          <span>Fiyat Gir</span>
                        </button>
                      )}

                      {/* 4. Kebap Menüsü */}
                      <RowMenu
                        firma={firma}
                        onFirmaCikar={onFirmaCikar}
                        onFiyatGir={onFiyatGir}
                        onFiyatPiyasaFormu={onFiyatPiyasaFormu}
                        onBirimFiyatArastirmasi={onBirimFiyatArastirmasi}
                        onBosTeklifCetveli={onBosTeklifCetveli}
                        onEkapSorgula={onEkapSorgula}
                        onSetWinnerFirma={onSetWinnerFirma}
                        isWinner={isWinner}
                      />
                    </div>
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}

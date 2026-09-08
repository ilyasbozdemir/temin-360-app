import React from 'react'
import { ArrowRightLeft } from 'lucide-react'
import { OlcuBirimi, BirimDonusum } from '../olcubirimleri.hooks'
import { BirimSelect } from './BirimSelect'

interface DonusumModalProps {
  isOpen: boolean
  editingDonusum: Partial<BirimDonusum> | null
  setEditingDonusum: React.Dispatch<React.SetStateAction<Partial<BirimDonusum> | null>>
  birimler: OlcuBirimi[]
  onClose: () => void
  onSave: (e: React.FormEvent) => void
  onSwap: () => void
  onUnitChange: (type: 'kaynak' | 'hedef', unitId: number) => void
  isPending: boolean
}

export const DonusumModal: React.FC<DonusumModalProps> = ({
  isOpen,
  editingDonusum,
  setEditingDonusum,
  birimler,
  onClose,
  onSave,
  onSwap,
  onUnitChange,
  isPending
}) => {
  if (!isOpen || !editingDonusum) return null

  const kaynakUnit = birimler.find((b) => b.id === editingDonusum.kaynak_birim_id)
  const hedefUnit = birimler.find((b) => b.id === editingDonusum.hedef_birim_id)

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600">
              <ArrowRightLeft size={18} />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {editingDonusum.id ? 'Dönüşüm Kuralını Düzenle' : 'Yeni Birim Dönüşüm Kuralı'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-lg font-bold p-1"
          >
            &times;
          </button>
        </div>

        <form onSubmit={onSave} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {/* Kaynak & Hedef Birim Picker Row */}
          <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-end p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80">
            {/* Kaynak Birim */}
            <div className="md:col-span-5">
              <BirimSelect
                label="Kaynak Birim *"
                birimler={birimler}
                value={editingDonusum.kaynak_birim_id}
                onChange={(id) => onUnitChange('kaynak', id)}
                placeholder="Kaynak birim seçin..."
              />
            </div>

            {/* Swap Button */}
            <div className="md:col-span-1 flex items-center justify-center pb-1">
              <button
                type="button"
                onClick={onSwap}
                className="p-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 hover:border-blue-300 transition-all shadow-xs"
                title="Kaynak ve Hedef Birimi Değiştir (Swap)"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Hedef Birim */}
            <div className="md:col-span-5">
              <BirimSelect
                label="Hedef Birim *"
                birimler={birimler}
                value={editingDonusum.hedef_birim_id}
                preferredCategory={kaynakUnit?.kategori}
                onChange={(id) => onUnitChange('hedef', id)}
                placeholder="Hedef birim seçin..."
              />
            </div>
          </div>

          {/* Dynamic Live Formula Preview Badge */}
          {editingDonusum.kaynak_birim_id && editingDonusum.hedef_birim_id && (
            <div className="p-3 rounded-xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-blue-600 dark:text-blue-400 font-bold">Kural Özeti:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  1 {kaynakUnit?.ad} ={' '}
                  {editingDonusum.formul
                    ? editingDonusum.formul
                    : `${editingDonusum.donusum_faktoru ?? 1} ${hedefUnit?.ad}`}
                </span>
              </div>
              {/* Quick Preset multipliers */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-400">Hızlı Faktör:</span>
                {[1000, 100, 10, 0.001, 0.01].map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => {
                      setEditingDonusum({
                        ...editingDonusum,
                        donusum_faktoru: f,
                        aciklama:
                          kaynakUnit && hedefUnit
                            ? `1 ${kaynakUnit.ad} = ${f} ${hedefUnit.ad} dönüşümü`
                            : editingDonusum.aciklama
                      })
                    }}
                    className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-900 border border-slate-200 dark:border-slate-700 font-mono text-[10px] font-bold text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Other Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Dönüşüm Faktörü */}
            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Dönüşüm Çarpanı (Faktör)
              </label>
              <input
                type="number"
                step="any"
                value={editingDonusum.donusum_faktoru ?? ''}
                onChange={(e) =>
                  setEditingDonusum({
                    ...editingDonusum,
                    donusum_faktoru: parseFloat(e.target.value) || null
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/40 focus:outline-none"
                placeholder="Örn: 1000 (1 kg için 1000 g gibi)"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Doğrusal çarpan (Hedef = Kaynak × Faktör).
              </p>
            </div>

            {/* Formül */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Özel Formül (Varsa)
              </label>
              <input
                type="text"
                value={editingDonusum.formul || ''}
                onChange={(e) => setEditingDonusum({ ...editingDonusum, formul: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/40 focus:outline-none"
                placeholder="Örn: (x * 9/5) + 32"
              />
            </div>

            {/* Ters Formül */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Ters Formül
              </label>
              <input
                type="text"
                value={editingDonusum.ters_formul || ''}
                onChange={(e) => setEditingDonusum({ ...editingDonusum, ters_formul: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/40 focus:outline-none"
                placeholder="Örn: (x - 32) * 5/9"
              />
            </div>

            {/* Açıklama */}
            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Açıklama
              </label>
              <input
                type="text"
                value={editingDonusum.aciklama || ''}
                onChange={(e) => setEditingDonusum({ ...editingDonusum, aciklama: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/40 focus:outline-none"
                placeholder="Örn: 1 kg = 1000 g dönüşümü"
              />
            </div>

            {/* Aktiflik Switch */}
            <div className="md:col-span-2 flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
              <input
                type="checkbox"
                id="donusum_aktif_mi"
                checked={editingDonusum.aktif_mi === 1}
                onChange={(e) =>
                  setEditingDonusum({ ...editingDonusum, aktif_mi: e.target.checked ? 1 : 0 })
                }
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <label
                htmlFor="donusum_aktif_mi"
                className="font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                Kural Aktif (Sistemde ve Çeviricide Geçerli)
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-semibold transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm transition-all"
            >
              {isPending ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

import React from 'react'
import { Ruler } from 'lucide-react'
import { OlcuBirimi, BIRIM_KATEGORILERI } from '../olcubirimleri.hooks'

interface BirimModalProps {
  isOpen: boolean
  editingBirim: Partial<OlcuBirimi> | null
  setEditingBirim: React.Dispatch<React.SetStateAction<Partial<OlcuBirimi> | null>>
  onClose: () => void
  onSave: (e: React.FormEvent) => void
  isPending: boolean
}

export const BirimModal: React.FC<BirimModalProps> = ({
  isOpen,
  editingBirim,
  setEditingBirim,
  onClose,
  onSave,
  isPending
}) => {
  if (!isOpen || !editingBirim) return null

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
              <Ruler size={18} />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {editingBirim.id ? 'Ölçü Birimini Düzenle' : 'Yeni Ölçü Birimi Ekle'}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Birim Adı */}
            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Birim Adı <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={editingBirim.ad || ''}
                onChange={(e) => setEditingBirim({ ...editingBirim, ad: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                placeholder="Örn: Kilogram, Metrekare, Deste, Ay..."
                autoFocus
              />
            </div>

            {/* Kısa Ad */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Kısa Ad (Kısaltma)
              </label>
              <input
                type="text"
                value={editingBirim.kisa_ad || ''}
                onChange={(e) => setEditingBirim({ ...editingBirim, kisa_ad: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                placeholder="Örn: kg, m², ad, lt..."
              />
            </div>

            {/* Sembol */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Uluslararası Sembol
              </label>
              <input
                type="text"
                value={editingBirim.sembol || ''}
                onChange={(e) => setEditingBirim({ ...editingBirim, sembol: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                placeholder="Örn: kg, m³, °C..."
              />
            </div>

            {/* Kategori */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Kategori
              </label>
              <select
                value={editingBirim.kategori || 'Adet/Miktar'}
                onChange={(e) => setEditingBirim({ ...editingBirim, kategori: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              >
                {BIRIM_KATEGORILERI.map((kat) => (
                  <option key={kat} value={kat}>
                    {kat}
                  </option>
                ))}
              </select>
            </div>

            {/* Dönüşüm Tipi */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Dönüşüm Tipi
              </label>
              <select
                value={editingBirim.donusum_tipi || 'linear'}
                onChange={(e) => setEditingBirim({ ...editingBirim, donusum_tipi: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              >
                <option value="linear">Doğrusal (Çarpan ile: x × faktör)</option>
                <option value="formula">Formüllü (Karmaşık: (°C × 9/5) + 32)</option>
              </select>
            </div>

            {/* Dönüşüm Faktörü */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Dönüşüm Faktörü (Temel Birime Oranı)
              </label>
              <input
                type="number"
                step="any"
                value={editingBirim.donusum_faktoru ?? 1.0}
                onChange={(e) =>
                  setEditingBirim({
                    ...editingBirim,
                    donusum_faktoru: parseFloat(e.target.value) || 0
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                placeholder="1.0"
              />
            </div>

            {/* Ondalık Basamak */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Ondalık Basamak Gösterimi
              </label>
              <input
                type="number"
                min="0"
                max="6"
                value={editingBirim.ondalik_basamak ?? 2}
                onChange={(e) =>
                  setEditingBirim({
                    ...editingBirim,
                    ondalik_basamak: parseInt(e.target.value, 10) || 0
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>

            {/* Temel Birim & Aktiflik Switches */}
            <div className="md:col-span-2 flex flex-col sm:flex-row gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!editingBirim.temel_birim_mi}
                  onChange={(e) =>
                    setEditingBirim({ ...editingBirim, temel_birim_mi: e.target.checked ? 1 : 0 })
                  }
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="font-bold text-slate-700 dark:text-slate-200">
                  Kategori Temel / Referans Birimi (Baz Birim)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingBirim.aktif_mi === 1}
                  onChange={(e) =>
                    setEditingBirim({ ...editingBirim, aktif_mi: e.target.checked ? 1 : 0 })
                  }
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <span className="font-bold text-slate-700 dark:text-slate-200">
                  Aktif (Kullanılabilir)
                </span>
              </label>
            </div>

            {/* Açıklama */}
            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Açıklama / Notlar
              </label>
              <textarea
                rows={2}
                value={editingBirim.aciklama || ''}
                onChange={(e) => setEditingBirim({ ...editingBirim, aciklama: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                placeholder="Birim kullanım alanı veya teknik notlar..."
              />
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
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-all"
            >
              {isPending ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

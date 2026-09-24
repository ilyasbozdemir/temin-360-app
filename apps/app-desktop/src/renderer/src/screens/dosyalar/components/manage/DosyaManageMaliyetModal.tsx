import React from 'react'

export interface DosyaManageMaliyetModalProps {
  isOpen: boolean
  onClose: () => void
  formData: any
  setFormData: React.Dispatch<React.SetStateAction<any>>
}

export const DosyaManageMaliyetModal: React.FC<DosyaManageMaliyetModalProps> = ({
  isOpen,
  onClose,
  formData,
  setFormData
}) => {
  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/25 dark:bg-black/50 z-[9998]" onClick={onClose} />
      <div className="fixed right-4 top-[52px] w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-[9999] p-4 animate-in slide-in-from-top-2 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
          <h3 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
            <svg
              className="w-4 h-4 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
              />
            </svg>
            Yaklaşık Maliyet Ayarları
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
          >
            Kapat
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
              Yaklaşık Maliyet (₺)
            </label>
            <input
              type="number"
              value={formData.yaklasik_maliyet || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  yaklasik_maliyet: Number(e.target.value)
                })
              }
              placeholder="0.00"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
              KDV Durumu
            </label>
            <select
              value={formData.yaklasik_maliyet_kdv_dahil_mi ?? 0}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  yaklasik_maliyet_kdv_dahil_mi: parseInt(e.target.value, 10)
                })
              }
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
            >
              <option value={0}>KDV Hariç</option>
              <option value={1}>KDV Dahil</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
              Hesaplama Yöntemi
            </label>
            <select
              value={formData.yaklasik_maliyet_hesaplamasi || 'kdv_haric'}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  yaklasik_maliyet_hesaplamasi: e.target.value
                })
              }
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
            >
              <option value="kdv_haric">KDV Hariç Hesapla</option>
              <option value="kdv_dahil">KDV Dahil Hesapla</option>
            </select>
          </div>
        </div>
      </div>
    </>
  )
}

import React from 'react'
import { Sparkles, X } from 'lucide-react'
import { FormFieldType } from '../../types/formBuilder.types'

interface NewComponentModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  newCompName: string
  onNewCompNameChange: (val: string) => void
  newCompTab: string
  onNewCompTabChange: (val: string) => void
  newCompType: FormFieldType
  onNewCompTypeChange: (type: FormFieldType) => void
  newCompDesc: string
  onNewCompDescChange: (val: string) => void
  newCompContent: string
  onNewCompContentChange: (val: string) => void
  availableTabs: string[]
}

export const NewComponentModal: React.FC<NewComponentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  newCompName,
  onNewCompNameChange,
  newCompTab,
  onNewCompTabChange,
  newCompType,
  onNewCompTypeChange,
  newCompDesc,
  onNewCompDescChange,
  newCompContent,
  onNewCompContentChange,
  availableTabs
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Yeni Özel Belge Bileşeni Ekle
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Bileşen Adı
            </label>
            <input
              type="text"
              required
              placeholder="Örn: Muayene Kabul Karar Metni"
              value={newCompName}
              onChange={(e) => onNewCompNameChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Ait Olacağı Sekme
            </label>
            <select
              value={newCompTab}
              onChange={(e) => onNewCompTabChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
            >
              {availableTabs.map((tab) => (
                <option key={tab} value={tab}>
                  📁 {tab}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Bileşen Tipi
            </label>
            <select
              value={newCompType}
              onChange={(e) => onNewCompTypeChange(e.target.value as FormFieldType)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
            >
              <option value="paragraph">Yasal Metin / Paragraf Bloğu</option>
              <option value="header">Resmi Antet & Logo Bloğu</option>
              <option value="table">Hesaplama / Kalem Tablosu</option>
              <option value="signature">İmza & Komisyon Bloğu</option>
              <option value="text">Tek Satır Metin Alanı</option>
              <option value="textarea">Açıklama Alanı</option>
              <option value="money">Tutar / Fiyat Alanı</option>
              <option value="date">Tarih Seçici</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Açıklama / İpucu
            </label>
            <input
              type="text"
              placeholder="Bu bileşenin kullanım amacı..."
              value={newCompDesc}
              onChange={(e) => onNewCompDescChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {newCompType === 'paragraph' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Varsayılan Metin İçeriği
              </label>
              <textarea
                rows={3}
                placeholder="Şablona basılacak varsayılan metin..."
                value={newCompContent}
                onChange={(e) => onNewCompContentChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              Bileşeni Kaydet ve Ekle
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

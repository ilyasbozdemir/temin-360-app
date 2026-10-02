import React from 'react'
import { Calendar, Save } from 'lucide-react'

interface TakipDosyaTarihlerWidgetProps {
  status: string
  setStatus: (v: string) => void
  acilisTarihi: string
  setAcilisTarihi: (v: string) => void
  sonTeklifTarihi: string
  setSonTeklifTarihi: (v: string) => void
  teminTarihi: string
  setTeminTarihi: (v: string) => void
  teslimTarihi: string
  setTeslimTarihi: (v: string) => void
  notlar: string
  setNotlar: (v: string) => void
  saveLoading: boolean
  saveMessage: string
  onSubmit: (e: React.FormEvent) => void
}

export function TakipDosyaTarihlerWidget({
  status,
  setStatus,
  acilisTarihi,
  setAcilisTarihi,
  sonTeklifTarihi,
  setSonTeklifTarihi,
  teminTarihi,
  setTeminTarihi,
  teslimTarihi,
  setTeslimTarihi,
  notlar,
  setNotlar,
  saveLoading,
  saveMessage,
  onSubmit
}: TakipDosyaTarihlerWidgetProps): React.JSX.Element {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        <Calendar className="w-5 h-5 text-blue-600" />
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
            Dosya Durumu & İşlem Tarihleri
          </h3>
          <p className="text-[10px] text-slate-500">
            Süreç milat tarihlerini ve dosya durumunu buradan kaydedip güncelleyebilirsiniz.
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-3.5">
        {/* Durum */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            Dosya Durumu
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-150 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
          >
            <option value="devam_ediyor">Devam Ediyor</option>
            <option value="tamamlandi">Tamamlandı</option>
            <option value="iptal">İptal Edildi</option>
          </select>
        </div>

        {/* Grid for Dates */}
        <div className="grid grid-cols-2 gap-3">
          {/* Açılış Tarihi */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Açılış Tarihi
            </label>
            <input
              type="date"
              value={acilisTarihi}
              onChange={(e) => setAcilisTarihi(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-150 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
            />
          </div>

          {/* Son Teklif Tarihi */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Son Teklif Tarihi
            </label>
            <input
              type="date"
              value={sonTeklifTarihi}
              onChange={(e) => setSonTeklifTarihi(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-150 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
            />
          </div>

          {/* Sözleşme/Karar Tarihi */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Sözleşme/Karar Tarihi
            </label>
            <input
              type="date"
              value={teminTarihi}
              onChange={(e) => setTeminTarihi(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-150 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
            />
          </div>

          {/* Teslim Tarihi */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Teslim Tarihi
            </label>
            <input
              type="date"
              value={teslimTarihi}
              onChange={(e) => setTeslimTarihi(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-150 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
            />
          </div>
        </div>

        {/* Notlar */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            Süreç Notları
          </label>
          <textarea
            rows={2}
            value={notlar}
            onChange={(e) => setNotlar(e.target.value)}
            placeholder="Dosyaya özel notlar girin..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-150 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none resize-none"
          />
        </div>

        {/* Save button and state message */}
        <div className="pt-2 flex items-center justify-between gap-3">
          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
            {saveMessage}
          </span>
          <button
            type="submit"
            disabled={saveLoading}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ml-auto"
          >
            {saveLoading ? (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            Kaydet
          </button>
        </div>
      </form>
    </div>
  )
}

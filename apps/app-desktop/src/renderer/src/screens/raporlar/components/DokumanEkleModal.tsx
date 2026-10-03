import React, { useState, useEffect } from 'react'
import { X, Upload, FileText, Calendar, Check, AlertCircle } from 'lucide-react'

interface DokumanEkleModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function DokumanEkleModal({ isOpen, onClose, onSuccess }: DokumanEkleModalProps) {
  const [dosyalar, setDosyalar] = useState<Array<{ id: number; dosya_no: string; is_adi: string }>>([])
  const [seciliDosyaId, setSeciliDosyaId] = useState<string>('')
  const [belgeAdi, setBelgeAdi] = useState<string>('')
  const [dosyaYolu, setDosyaYolu] = useState<string>('')
  const [belgeTarihi, setBelgeTarihi] = useState<string>(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    window.electron?.ipcRenderer
      ?.invoke(
        'db:query',
        `SELECT id, COALESCE(dosya_no, temin_no, '#' || id) as dosya_no, COALESCE(is_adi, dosya_adi, konu, 'İsimsiz') as is_adi 
         FROM DATA_TeminDosyasi WHERE is_deleted = 0 ORDER BY id DESC`
      )
      .then((res: any) => {
        if (res.success && Array.isArray(res.data)) {
          setDosyalar(res.data)
          if (res.data.length > 0 && !seciliDosyaId) {
            setSeciliDosyaId(String(res.data[0].id))
          }
        }
      })
      .catch(() => {})
  }, [isOpen])

  if (!isOpen) return null

  const handleSelectLocalFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!belgeAdi) setBelgeAdi(file.name)
      setDosyaYolu(file.name)
    }
  }

  const handleKaydet = async () => {
    if (!seciliDosyaId) {
      setError('Lütfen bir ihale/temin dosyası seçin.')
      return
    }
    if (!belgeAdi.trim()) {
      setError('Lütfen doküman adını girin.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await window.electron.ipcRenderer.invoke(
        'db:query',
        `INSERT INTO DATA_TeminBelge (temin_dosya_id, dosya_id, belge_adi, dosya_yolu, belge_tarihi) 
         VALUES (?, ?, ?, ?, ?)`,
        [Number(seciliDosyaId), Number(seciliDosyaId), belgeAdi.trim(), dosyaYolu.trim(), belgeTarihi]
      )

      if (res.success) {
        onSuccess()
        onClose()
      } else {
        setError(res.error || 'Kaydedilirken bir hata oluştu.')
      }
    } catch (err: any) {
      setError(err.message || 'Veritabanı hatası')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Yeni İhale Dokümanı / Ek Ekle
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              İhale / Temin Dosyası *
            </label>
            <select
              value={seciliDosyaId}
              onChange={(e) => setSeciliDosyaId(e.target.value)}
              className="w-full text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 px-3 py-2"
            >
              {dosyalar.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.dosya_no} - {d.is_adi}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Doküman / Belge Adı *
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={belgeAdi}
                onChange={(e) => setBelgeAdi(e.target.value)}
                placeholder="Örn: Teknik Şartname & Ekler.zip"
                className="w-full text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 pl-9 pr-3 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Eklenme / Belge Tarihi
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="date"
                  value={belgeTarihi}
                  onChange={(e) => setBelgeTarihi(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 pl-9 pr-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Dosya Seç (İsteğe Bağlı)
              </label>
              <label className="flex items-center justify-center gap-1.5 w-full text-xs font-medium py-2 px-3 border border-slate-200 dark:border-slate-600 rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200">
                <Upload className="w-3.5 h-3.5" />
                <span>{dosyaYolu ? 'Dosya Seçildi' : 'Gözat...'}</span>
                <input type="file" onChange={handleSelectLocalFile} className="hidden" />
              </label>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
          >
            İptal
          </button>
          <button
            onClick={handleKaydet}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg shadow-sm"
          >
            <Check className="w-4 h-4" />
            <span>{loading ? 'Kaydediliyor...' : 'Kaydet'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

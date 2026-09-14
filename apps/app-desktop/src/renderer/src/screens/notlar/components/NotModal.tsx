import React, { useState, useEffect } from 'react'
import {
  X,
  Save,
  CheckSquare,
  FileText,
  Bell,
  Calendar,
  Folder,
  Tag,
  AlertCircle,
  Pin,
  Palette
} from 'lucide-react'
import { NotVeGorev, NotTip, NotOncelik, NotRenk, NOT_KATEGORILERI } from '../types'
import { DosyaOption } from '../notlar.hooks'

interface NotModalProps {
  isOpen: boolean
  editingItem: NotVeGorev | null
  dosyalar: DosyaOption[]
  defaultDosyaId?: number | null
  onClose: () => void
  onSave: (data: any) => Promise<void>
}

const RENK_OPTIONS: Array<{ key: NotRenk; name: string; bg: string }> = [
  { key: 'slate', name: 'Klasik Gri', bg: 'bg-slate-400' },
  { key: 'amber', name: 'Sarı Not', bg: 'bg-amber-400' },
  { key: 'blue', name: 'Mavi', bg: 'bg-blue-400' },
  { key: 'emerald', name: 'Yeşil', bg: 'bg-emerald-400' },
  { key: 'purple', name: 'Mor', bg: 'bg-purple-400' },
  { key: 'rose', name: 'Gül Pembesi', bg: 'bg-rose-400' },
  { key: 'indigo', name: 'İndigo', bg: 'bg-indigo-400' }
]

export function NotModal({
  isOpen,
  editingItem,
  dosyalar,
  defaultDosyaId,
  onClose,
  onSave
}: NotModalProps): React.JSX.Element | null {
  const [baslik, setBaslik] = useState('')
  const [icerik, setIcerik] = useState('')
  const [tip, setTip] = useState<NotTip>('todo')
  const [kategori, setKategori] = useState('Genel')
  const [oncelik, setOncelik] = useState<NotOncelik>('orta')
  const [teminDosyaId, setTeminDosyaId] = useState<number | null>(null)
  const [vadeTarihi, setVadeTarihi] = useState('')
  const [renk, setRenk] = useState<NotRenk>('slate')
  const [sabitlendi, setSabitlendi] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (editingItem) {
      setBaslik(editingItem.baslik || '')
      setIcerik(editingItem.icerik || '')
      setTip(editingItem.tip || 'todo')
      setKategori(editingItem.kategori || 'Genel')
      setOncelik(editingItem.oncelik || 'orta')
      setTeminDosyaId(editingItem.temin_dosya_id || null)
      setVadeTarihi(editingItem.vade_tarihi || '')
      setRenk(editingItem.renk || 'slate')
      setSabitlendi(editingItem.sabitlendi === 1)
    } else {
      setBaslik('')
      setIcerik('')
      setTip('todo')
      setKategori('Genel')
      setOncelik('orta')
      setTeminDosyaId(defaultDosyaId || null)
      setVadeTarihi('')
      setRenk('slate')
      setSabitlendi(false)
    }
    setError(null)
  }, [editingItem, defaultDosyaId, isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!baslik.trim()) {
      setError('Lütfen bir başlık veya görev tanımı girin.')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)
      await onSave({
        ...(editingItem ? { id: editingItem.id } : {}),
        baslik: baslik.trim(),
        icerik: icerik.trim() || null,
        tip,
        kategori,
        oncelik,
        temin_dosya_id: teminDosyaId || null,
        vade_tarihi: vadeTarihi || null,
        renk,
        sabitlendi: sabitlendi ? 1 : 0
      })
      onClose()
    } catch (err: any) {
      setError(err.message || 'Kayıt sırasında bir hata oluştu.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in-0 duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Modal Başlık */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              {tip === 'todo' ? (
                <CheckSquare className="w-5 h-5" />
              ) : tip === 'not' ? (
                <FileText className="w-5 h-5" />
              ) : (
                <Bell className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                {editingItem ? 'Notu / Görevi Düzenle' : 'Yeni Not veya Görev Ekle'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Dosyalarınıza veya uygulama geneline özel yapılacaklar ve hatırlatıcılar
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Tür Seçimi (Sekmeler) */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
            <button
              type="button"
              onClick={() => setTip('todo')}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                tip === 'todo'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Yapılacak (To-Do)</span>
            </button>
            <button
              type="button"
              onClick={() => setTip('not')}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                tip === 'not'
                  ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Not & Fikir</span>
            </button>
            <button
              type="button"
              onClick={() => setTip('hatirlatici')}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                tip === 'hatirlatici'
                  ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Hatırlatıcı</span>
            </button>
          </div>

          {/* Başlık */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Başlık / Görev Tanımı <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={baslik}
              onChange={(e) => setBaslik(e.target.value)}
              placeholder="Örn: Yaklaşık maliyet cetvelini kontrol et ve onaya sun..."
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* İlgili Dosya & Kategori (Yan yana) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* İlgili Dosya */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                İlgili Çalışma Dosyası
              </label>
              <div className="relative">
                <select
                  value={teminDosyaId || ''}
                  onChange={(e) =>
                    setTeminDosyaId(e.target.value ? Number(e.target.value) : null)
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="">Genel (Herhangi bir dosyaya bağlı değil)</option>
                  {dosyalar.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.dosya_no ? `[${d.yil}/${d.dosya_no}]` : `[#${d.id}]`} -{' '}
                      {d.isin_adi ? d.isin_adi.substring(0, 35) : 'İsimsiz Dosya'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Kategori */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Kategori
              </label>
              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {NOT_KATEGORILERI.map((kat) => (
                  <option key={kat} value={kat}>
                    {kat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Öncelik & Vade Tarihi (Yan yana) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Öncelik */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Öncelik Derecesi
              </label>
              <div className="grid grid-cols-4 gap-1">
                {(
                  [
                    { key: 'dusuk', label: 'Düşük' },
                    { key: 'orta', label: 'Orta' },
                    { key: 'yuksek', label: 'Yüksek' },
                    { key: 'acil', label: 'Acil' }
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setOncelik(opt.key)}
                    className={`py-1.5 text-center text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                      oncelik === opt.key
                        ? opt.key === 'acil'
                          ? 'bg-rose-500 text-white border-rose-500'
                          : opt.key === 'yuksek'
                            ? 'bg-amber-500 text-white border-amber-500'
                            : opt.key === 'orta'
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'bg-slate-600 text-white border-slate-600'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Vade / Son Teslim Tarihi */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Son Tarih (Vade)
              </label>
              <input
                type="date"
                value={vadeTarihi}
                onChange={(e) => setVadeTarihi(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* İçerik / Detaylar */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Açıklama / Detaylı Not
            </label>
            <textarea
              rows={3}
              value={icerik}
              onChange={(e) => setIcerik(e.target.value)}
              placeholder="Gereken adımlar, telefon numaraları, önemli mevzuat maddeleri veya ek ayrıntılar..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Kart Rengi & Başa Sabitleme */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
            {/* Renk Seçimi */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tema:</span>
              <div className="flex items-center gap-1.5">
                {RENK_OPTIONS.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setRenk(c.key)}
                    title={c.name}
                    className={`w-5 h-5 rounded-full ${c.bg} transition-transform cursor-pointer ${
                      renk === c.key
                        ? 'ring-2 ring-offset-2 ring-blue-500 scale-110'
                        : 'hover:scale-105 opacity-80 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Başa Sabitle Checkbox */}
            <label className="inline-flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer font-medium select-none">
              <input
                type="checkbox"
                checked={sabitlendi}
                onChange={(e) => setSabitlendi(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-700"
              />
              <span>Başa Sabitle</span>
            </label>
          </div>

          {/* Butonlar */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Kaydediliyor...' : editingItem ? 'Güncelle' : 'Kaydet'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

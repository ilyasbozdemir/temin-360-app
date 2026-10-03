import React, { useState, useEffect } from 'react'
import { X, Plus, Wallet, Save } from 'lucide-react'

export interface ButceOdenekKayit {
  id?: number
  birim_id?: number
  birim_adi: string
  kurumsal_kod?: string
  butce_kodu: string
  butce_kalemi: string
  butce_turu: string
  butce_yili: number
  yillik_odenek: number
  aciklama?: string
}

interface ButceOdenekModalProps {
  isOpen: boolean
  onClose: () => void
  onSaved: () => void
  editingRecord?: ButceOdenekKayit | null
  currentYear?: string
}

export function ButceOdenekModal({
  isOpen,
  onClose,
  onSaved,
  editingRecord,
  currentYear = '2026'
}: ButceOdenekModalProps): React.JSX.Element | null {
  const [birimAdi, setBirimAdi] = useState<string>('Genel İdare')
  const [kurumsalKod, setKurumsalKod] = useState<string>('')
  const [butceKodu, setButceKodu] = useState<string>('03.2.1.01')
  const [butceKalemi, setButceKalemi] = useState<string>('Kırtasiye ve Büro Malzemesi Alımları')
  const [butceTuru, setButceTuru] = useState<string>('Mal Alımı')
  const [butceYili, setButceYili] = useState<number>(parseInt(currentYear, 10) || 2026)
  const [yillikOdenek, setYillikOdenek] = useState<string>('5000000')
  const [aciklama, setAciklama] = useState<string>('')
  const [birimler, setBirimler] = useState<Array<{ id: number; ad: string }>>([])
  const [saving, setSaving] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string>('')

  useEffect(() => {
    if (typeof window !== 'undefined' && window.electron?.ipcRenderer) {
      window.electron.ipcRenderer
        .invoke('db:query', 'SELECT id, ad FROM TANIM_Birim WHERE aktif_mi = 1 ORDER BY ad ASC')
        .then((res: any) => {
          if (res.success && Array.isArray(res.data)) {
            setBirimler(res.data)
          }
        })
        .catch(() => {})
    }
  }, [])

  useEffect(() => {
    if (editingRecord) {
      setBirimAdi(editingRecord.birim_adi || '')
      setKurumsalKod(editingRecord.kurumsal_kod || '')
      setButceKodu(editingRecord.butce_kodu || '')
      setButceKalemi(editingRecord.butce_kalemi || '')
      setButceTuru(editingRecord.butce_turu || 'Mal Alımı')
      setButceYili(editingRecord.butce_yili || 2026)
      setYillikOdenek(editingRecord.yillik_odenek ? editingRecord.yillik_odenek.toString() : '0')
      setAciklama(editingRecord.aciklama || '')
    } else {
      setBirimAdi('Genel İdare')
      setKurumsalKod('')
      setButceKodu('03.2.1.01')
      setButceKalemi('Kırtasiye ve Büro Malzemesi Alımları')
      setButceTuru('Mal Alımı')
      setButceYili(parseInt(currentYear, 10) || 2026)
      setYillikOdenek('5000000')
      setAciklama('')
    }
  }, [editingRecord, currentYear, isOpen])

  if (!isOpen) return null

  const handleSave = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setErrorMsg('')
    const odenekNum = parseFloat(yillikOdenek.replace(/\./g, '').replace(',', '.')) || 0

    if (!butceKodu || !butceKalemi) {
      setErrorMsg('Lütfen Bütçe Kodu ve Bütçe Kalemi adını doldurunuz.')
      return
    }
    if (odenekNum <= 0) {
      setErrorMsg('Lütfen geçerli bir yıllık ödenek tutarı giriniz.')
      return
    }

    setSaving(true)
    try {
      if (editingRecord?.id) {
        await window.electron.ipcRenderer.invoke(
          'db:run',
          `UPDATE TANIM_ButceOdenek SET
            birim_adi = ?, kurumsal_kod = ?, butce_kodu = ?, butce_kalemi = ?,
            butce_turu = ?, butce_yili = ?, yillik_odenek = ?, aciklama = ?, updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [birimAdi, kurumsalKod, butceKodu, butceKalemi, butceTuru, butceYili, odenekNum, aciklama, editingRecord.id]
        )
      } else {
        await window.electron.ipcRenderer.invoke(
          'db:run',
          `INSERT INTO TANIM_ButceOdenek (birim_adi, kurumsal_kod, butce_kodu, butce_kalemi, butce_turu, butce_yili, yillik_odenek, aciklama)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [birimAdi, kurumsalKod, butceKodu, butceKalemi, butceTuru, butceYili, odenekNum, aciklama]
        )
      }
      onSaved()
      onClose()
    } catch (err: any) {
      setErrorMsg(err.message || 'Kayıt sırasında hata oluştu.')
    } finally {
      setSaving(false)
    }
  }

  const yuzdeOnTavan = (parseFloat(yillikOdenek.replace(/\./g, '').replace(',', '.')) || 0) * 0.1

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600">
              <Wallet size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">
                {editingRecord ? 'Bütçe Ödeneğini Düzenle' : 'Yeni Bütçe / Ödenek Kalemi Tanımla'}
              </h3>
              <p className="text-xs text-slate-500">4734 Madde 62/ı %10 limit takibi için tertip ödeneği</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 font-medium">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Harcama Birimi</label>
              <input
                type="text"
                list="birim-list"
                value={birimAdi}
                onChange={(e) => setBirimAdi(e.target.value)}
                placeholder="Örn: Fen İşleri Müdürlüğü"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
              <datalist id="birim-list">
                {birimler.map((b) => <option key={b.id} value={b.ad} />)}
              </datalist>
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Kurumsal Kod</label>
              <input
                type="text"
                value={kurumsalKod}
                onChange={(e) => setKurumsalKod(e.target.value)}
                placeholder="Örn: 06.34.02.00"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Bütçe Kodu</label>
              <input
                type="text"
                value={butceKodu}
                onChange={(e) => setButceKodu(e.target.value)}
                placeholder="Örn: 03.2.1.01"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Bütçe Türü</label>
              <select
                value={butceTuru}
                onChange={(e) => setButceTuru(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold"
              >
                <option value="Mal Alımı">Mal Alımı</option>
                <option value="Hizmet Alımı">Hizmet Alımı</option>
                <option value="Yapım İşi">Yapım İşi</option>
                <option value="Danışmanlık">Danışmanlık</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Bütçe Kalemi Adı</label>
            <input
              type="text"
              value={butceKalemi}
              onChange={(e) => setButceKalemi(e.target.value)}
              placeholder="Örn: Kırtasiye ve Büro Malzemesi Alımları"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Bütçe Yılı</label>
              <input
                type="number"
                value={butceYili}
                onChange={(e) => setButceYili(parseInt(e.target.value, 10) || 2026)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Yıllık Toplam Ödenek (₺)</label>
              <input
                type="text"
                value={yillikOdenek}
                onChange={(e) => setYillikOdenek(e.target.value)}
                placeholder="5000000"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-sm text-purple-600"
              />
            </div>
          </div>

          <div className="p-3 bg-purple-50/70 dark:bg-purple-950/30 rounded-xl border border-purple-200/50 flex justify-between items-center text-xs">
            <span className="font-semibold text-purple-900 dark:text-purple-200">Hesaplanan Yasal %10 Tavanı:</span>
            <span className="font-mono font-bold text-purple-700 dark:text-purple-300 text-sm">
              {yuzdeOnTavan.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs"
            >
              <Save size={14} /> {saving ? 'Kaydediliyor...' : 'Ödeneği Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

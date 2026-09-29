import React, { useState, useEffect } from 'react'
import { Info } from 'lucide-react'
import { Modal } from '../../../../../../components/ui/Modal'
import { Button } from '../../../../../../components/ui/Button'
import { Input } from '../../../../../../components/ui/Input'
import { KabulTutanakItem } from './types'

interface KabulTutanakModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (tutanak: KabulTutanakItem) => void
  initialTutanak?: KabulTutanakItem | null
  defaultFaturaNo?: string
  defaultFaturaTarihi?: string
  defaultTeslimYeri?: string
  defaultTeslimAlan?: string
  defaultTutar?: number | null
}

export function KabulTutanakModal({
  isOpen,
  onClose,
  onSave,
  initialTutanak,
  defaultFaturaNo = '',
  defaultFaturaTarihi = '',
  defaultTeslimYeri = '',
  defaultTeslimAlan = '',
  defaultTutar = null
}: KabulTutanakModalProps): React.JSX.Element {
  const [tutanakNo, setTutanakNo] = useState('')
  const [tutanakTarihi, setTutanakTarihi] = useState('')
  const [faturaNo, setFaturaNo] = useState('')
  const [faturaTarihi, setFaturaTarihi] = useState('')
  const [teslimYeri, setTeslimYeri] = useState('')
  const [teslimAlan, setTeslimAlan] = useState('')
  const [durum, setDurum] = useState<'kabul' | 'kismi' | 'sartli' | 'red'>('kabul')
  const [tutar, setTutar] = useState('')
  const [notlar, setNotlar] = useState('')

  useEffect(() => {
    if (!isOpen) return

    if (initialTutanak) {
      setTutanakNo(initialTutanak.tutanakNo || '')
      setTutanakTarihi(initialTutanak.tutanakTarihi || '')
      setFaturaNo(initialTutanak.faturaNo || '')
      setFaturaTarihi(initialTutanak.faturaTarihi || '')
      setTeslimYeri(initialTutanak.teslimYeri || '')
      setTeslimAlan(initialTutanak.teslimAlan || '')
      setDurum(initialTutanak.durum || 'kabul')
      setTutar(initialTutanak.tutar ? String(initialTutanak.tutar) : '')
      setNotlar(initialTutanak.notlar || '')
    } else {
      const todayStr = new Date().toISOString().split('T')[0]
      setTutanakNo(`KT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`)
      setTutanakTarihi(defaultFaturaTarihi || todayStr)
      setFaturaNo(defaultFaturaNo)
      setFaturaTarihi(defaultFaturaTarihi || todayStr)
      setTeslimYeri(defaultTeslimYeri || 'Kurum Ambarı / İhtiyaç Yeri')
      setTeslimAlan(defaultTeslimAlan || 'Muayene ve Kabul Heyeti')
      setDurum('kabul')
      setTutar(defaultTutar ? String(defaultTutar) : '')
      setNotlar('')
    }
  }, [
    isOpen,
    initialTutanak,
    defaultFaturaNo,
    defaultFaturaTarihi,
    defaultTeslimYeri,
    defaultTeslimAlan,
    defaultTutar
  ])

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    if (!tutanakTarihi) return

    const item: KabulTutanakItem = {
      id: initialTutanak?.id || `tut_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      tutanakNo: tutanakNo.trim() || `KT-${new Date().getFullYear()}-001`,
      tutanakTarihi,
      faturaNo: faturaNo.trim() || undefined,
      faturaTarihi: faturaTarihi || undefined,
      teslimYeri: teslimYeri.trim() || undefined,
      teslimAlan: teslimAlan.trim() || undefined,
      durum,
      tutar: tutar ? Number(tutar) : undefined,
      notlar: notlar.trim() || undefined,
      created_at: initialTutanak?.created_at || new Date().toISOString()
    }

    onSave(item)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialTutanak ? 'Kabul Tutanağını Düzenle' : 'Yeni Muayene & Kabul Tutanağı Ekle'}
      className="max-w-2xl w-11/12"
    >
      <form onSubmit={handleSubmit} className="space-y-4 p-1">
        <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div>
            <strong>Birden Fazla Kabul Tutanağı Kaydı:</strong> Kısmi teslimatlar, farklı tarihler
            veya fatura kalemlerine özel muayene tutanakları ekleyebilir; tutanak metinlerini ve
            çıktılarını özelleştirebilirsiniz.
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tutanak / Sıra No *
            </label>
            <Input
              value={tutanakNo}
              onChange={(e) => setTutanakNo(e.target.value)}
              placeholder="KT-2026/001"
              required
              className="font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Kabul / Muayene Tarihi *
            </label>
            <Input
              type="date"
              value={tutanakTarihi}
              onChange={(e) => setTutanakTarihi(e.target.value)}
              required
              className="text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Fatura / Belge No
            </label>
            <Input
              value={faturaNo}
              onChange={(e) => setFaturaNo(e.target.value)}
              placeholder="Örn: FAT-2026-9912"
              className="font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Fatura Tarihi
            </label>
            <Input
              type="date"
              value={faturaTarihi}
              onChange={(e) => setFaturaTarihi(e.target.value)}
              className="text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Teslim Edilen Yer / Ambar
            </label>
            <Input
              value={teslimYeri}
              onChange={(e) => setTeslimYeri(e.target.value)}
              placeholder="Örn: Merkez Depo / Ek Hizmet Binası"
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Teslim Alan / Heyet Başkanı
            </label>
            <Input
              value={teslimAlan}
              onChange={(e) => setTeslimAlan(e.target.value)}
              placeholder="Örn: Muayene ve Kabul Komisyonu"
              className="text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Muayene & Kabul Kararı *
            </label>
            <select
              value={durum}
              onChange={(e) => setDurum(e.target.value as 'kabul' | 'kismi' | 'sartli' | 'red')}
              className="w-full h-9 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200 font-semibold"
            >
              <option value="kabul">✅ Kabul Edildi (Eksiksiz)</option>
              <option value="kismi">🔶 Kısmi Kabul Yapıldı</option>
              <option value="sartli">⚠️ Şartlı / Kusurlu Kabul</option>
              <option value="red">❌ Reddedildi (İade Edildi)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Kabul Edilen Teslimat Tutarı (₺) - İsteğe Bağlı
            </label>
            <Input
              type="number"
              value={tutar}
              onChange={(e) => setTutar(e.target.value)}
              placeholder="Örn: 25000"
              className="text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Muayene İnceleme Notları / Açıklama
          </label>
          <textarea
            value={notlar}
            onChange={(e) => setNotlar(e.target.value)}
            placeholder="Mal veya hizmetin teknik şartnameye uygunluğu, muayene heyeti tespitleri..."
            rows={2.5}
            className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200 resize-none"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} className="text-xs">
            Vazgeç
          </Button>
          <Button type="submit" className="text-xs bg-blue-600 text-white hover:bg-blue-700">
            {initialTutanak ? 'Kaydı Güncelle' : 'Tutanağı Kaydet'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}


import React, { useState, useEffect } from 'react'
import { Info, Plus, Trash2, PackageCheck, Truck, Building2 } from 'lucide-react'
import { Modal } from '../../../../../../components/ui/Modal'
import { Button } from '../../../../../../components/ui/Button'
import { Input } from '../../../../../../components/ui/Input'
import { KabulTutanakItem, MalKalemiItem } from './types'

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
  alimTuru?: string
  dosyaKalemler?: Array<{
    sira_no?: number
    malzeme_adi?: string
    ozelligi?: string
    birimi?: string
    miktar?: number
    birim_fiyat?: number
  }>
}

const DEFAULT_AMBARLAR = [
  'Merkez Ambarı / Ana Depo',
  'Teknik Servis Ambarı',
  'Kırtasiye ve Ayniyat Deposu',
  'Yiyecek & İçecek Ambarı',
  'Bilgi İşlem Malzeme Deposu',
  'Kurum Şantiyesi / İhtiyaç Yeri'
]

const DEFAULT_TESLİM_ALANLAR = [
  'Muayene ve Kabul Komisyonu Heyeti',
  'Ambar Memuru / Taşınır Kayıt Yetkilisi',
  'Taşınır Kontrol Yetkilisi',
  'Bölüm / Birim Sorumlusu'
]

export function KabulTutanakModal({
  isOpen,
  onClose,
  onSave,
  initialTutanak,
  defaultFaturaNo = '',
  defaultFaturaTarihi = '',
  defaultTeslimYeri = '',
  defaultTeslimAlan = '',
  defaultTutar = null,
  alimTuru = 'mal',
  dosyaKalemler = []
}: KabulTutanakModalProps): React.JSX.Element {
  const [tutanakNo, setTutanakNo] = useState('')
  const [tutanakTarihi, setTutanakTarihi] = useState('')
  const [faturaNo, setFaturaNo] = useState('')
  const [faturaTarihi, setFaturaTarihi] = useState('')
  const [irsaliyeNo, setIrsaliyeNo] = useState('')
  const [irsaliyeTarihi, setIrsaliyeTarihi] = useState('')
  const [teslimYeri, setTeslimYeri] = useState('')
  const [teslimAlan, setTeslimAlan] = useState('')
  const [durum, setDurum] = useState<'kabul' | 'kismi' | 'sartli' | 'red'>('kabul')
  const [tutar, setTutar] = useState('')
  const [notlar, setNotlar] = useState('')
  const [kalemler, setKalemler] = useState<MalKalemiItem[]>([])

  const isHizmet = alimTuru.toLowerCase().includes('hizmet')

  useEffect(() => {
    if (!isOpen) return

    if (initialTutanak) {
      setTutanakNo(initialTutanak.tutanakNo || '')
      setTutanakTarihi(initialTutanak.tutanakTarihi || '')
      setFaturaNo(initialTutanak.faturaNo || '')
      setFaturaTarihi(initialTutanak.faturaTarihi || '')
      setIrsaliyeNo(initialTutanak.irsaliyeNo || '')
      setIrsaliyeTarihi(initialTutanak.irsaliyeTarihi || '')
      setTeslimYeri(initialTutanak.teslimYeri || '')
      setTeslimAlan(initialTutanak.teslimAlan || '')
      setDurum(initialTutanak.durum || 'kabul')
      setTutar(initialTutanak.tutar ? String(initialTutanak.tutar) : '')
      setNotlar(initialTutanak.notlar || '')
      setKalemler(initialTutanak.kalemler || [])
    } else {
      const todayStr = new Date().toISOString().split('T')[0]
      setTutanakNo(`KT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`)
      setTutanakTarihi(defaultFaturaTarihi || todayStr)
      setFaturaNo(defaultFaturaNo)
      setFaturaTarihi(defaultFaturaTarihi || todayStr)
      setIrsaliyeNo('')
      setIrsaliyeTarihi(todayStr)
      setTeslimYeri(defaultTeslimYeri || DEFAULT_AMBARLAR[0])
      setTeslimAlan(defaultTeslimAlan || DEFAULT_TESLİM_ALANLAR[0])
      setDurum('kabul')
      setTutar(defaultTutar ? String(defaultTutar) : '')
      setNotlar('')

      if (dosyaKalemler && dosyaKalemler.length > 0) {
        setKalemler(
          dosyaKalemler.map((k, idx) => ({
            siraNo: k.sira_no || idx + 1,
            malzemeAdi: k.malzeme_adi || '',
            ozelligi: k.ozelligi || '',
            birimi: k.birimi || 'Adet',
            miktari: Number(k.miktar || 0),
            toplamTeslimAlinan: Number(k.miktar || 0),
            kabulMiktari: Number(k.miktar || 0)
          }))
        )
      } else {
        setKalemler([
          {
            siraNo: 1,
            malzemeAdi: '',
            ozelligi: '',
            birimi: 'Adet',
            miktari: 1,
            toplamTeslimAlinan: 1,
            kabulMiktari: 1
          }
        ])
      }
    }
  }, [
    isOpen,
    initialTutanak,
    defaultFaturaNo,
    defaultFaturaTarihi,
    defaultTeslimYeri,
    defaultTeslimAlan,
    defaultTutar,
    dosyaKalemler
  ])

  const handleAddKalem = (): void => {
    setKalemler((prev) => [
      ...prev,
      {
        siraNo: prev.length + 1,
        malzemeAdi: '',
        ozelligi: '',
        birimi: 'Adet',
        miktari: 1,
        toplamTeslimAlinan: 1,
        kabulMiktari: 1
      }
    ])
  }

  const handleRemoveKalem = (idx: number): void => {
    setKalemler((prev) =>
      prev
        .filter((_, i) => i !== idx)
        .map((item, i) => ({ ...item, siraNo: i + 1 }))
    )
  }

  const handleUpdateKalem = (idx: number, field: keyof MalKalemiItem, val: string | number): void => {
    setKalemler((prev) =>
      prev.map((item, i) => {
        if (i !== idx) return item
        const updated = { ...item, [field]: val }
        return updated
      })
    )
  }

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    if (!tutanakTarihi) return

    const item: KabulTutanakItem = {
      id: initialTutanak?.id || `tut_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      tutanakNo: tutanakNo.trim() || `KT-${new Date().getFullYear()}-001`,
      tutanakTarihi,
      faturaNo: faturaNo.trim() || undefined,
      faturaTarihi: faturaTarihi || undefined,
      irsaliyeNo: irsaliyeNo.trim() || undefined,
      irsaliyeTarihi: irsaliyeTarihi || undefined,
      teslimYeri: teslimYeri.trim() || undefined,
      teslimAlan: teslimAlan.trim() || undefined,
      durum,
      tutar: tutar ? Number(tutar) : undefined,
      notlar: notlar.trim() || undefined,
      kalemler: isHizmet ? undefined : kalemler,
      created_at: initialTutanak?.created_at || new Date().toISOString()
    }

    onSave(item)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialTutanak ? 'Kabul Tutanağını Düzenle' : 'Yeni Muayene & Kabul Tutanağı Kaydet'}
      className="max-w-4xl w-11/12"
    >
      <form onSubmit={handleSubmit} className="space-y-4 p-1">
        {/* Bilgi Kutusu */}
        <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div>
            <strong>Muayene Kabul Tutanağı Kaydı:</strong> Kısmi teslimatlar, irsaliye/fatura numaraları ve ambar teslim yeri bilgilerini girebilir, muayene komisyonu onay kararlarını kaydedebilirsiniz.
          </div>
        </div>

        {/* Tutanak & Fatura Temel Bilgileri */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tutanak No *
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
              Muayene Kabul Tarihi *
            </label>
            <Input
              type="date"
              value={tutanakTarihi}
              onChange={(e) => setTutanakTarihi(e.target.value)}
              required
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Fatura No
            </label>
            <Input
              value={faturaNo}
              onChange={(e) => setFaturaNo(e.target.value)}
              placeholder="FAT-2026-9912"
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

        {/* İrsaliye & Ambar / Teslim Alanı Autocomplete Seçenekleri */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-slate-400" />
              <span>İrsaliye No</span>
            </label>
            <Input
              value={irsaliyeNo}
              onChange={(e) => setIrsaliyeNo(e.target.value)}
              placeholder="İRS-2026-001"
              className="font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              İrsaliye Tarihi
            </label>
            <Input
              type="date"
              value={irsaliyeTarihi}
              onChange={(e) => setIrsaliyeTarihi(e.target.value)}
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Teslim Edilen Yer / Ambar</span>
            </label>
            <input
              list="ambarlar-list"
              value={teslimYeri}
              onChange={(e) => setTeslimYeri(e.target.value)}
              placeholder="Ambar veya teslim yeri seçin..."
              className="w-full h-9 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
            />
            <datalist id="ambarlar-list">
              {DEFAULT_AMBARLAR.map((amb, i) => (
                <option key={i} value={amb} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Teslim Alan (Heyet / Memur)
            </label>
            <input
              list="teslimalan-list"
              value={teslimAlan}
              onChange={(e) => setTeslimAlan(e.target.value)}
              placeholder="Teslim alan kişi veya heyet..."
              className="w-full h-9 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
            />
            <datalist id="teslimalan-list">
              {DEFAULT_TESLİM_ALANLAR.map((ta, i) => (
                <option key={i} value={ta} />
              ))}
            </datalist>
          </div>
        </div>

        {/* Karar & Tutar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Muayene & Kabul Kararı *
            </label>
            <select
              value={durum}
              onChange={(e) => setDurum(e.target.value as 'kabul' | 'kismi' | 'sartli' | 'red')}
              className="w-full h-9 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200 font-semibold"
            >
              <option value="kabul">✅ Kabul Edildi (Eksiksiz & Tam)</option>
              <option value="kismi">🔶 Kısmi Kabul Yapıldı (Parçalı Teslim)</option>
              <option value="sartli">⚠️ Şartlı / Kusurlu Kabul</option>
              <option value="red">❌ Reddedildi (İade Edildi)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Kabul Edilen Teslimat Tutarı (₺)
            </label>
            <Input
              type="number"
              value={tutar}
              onChange={(e) => setTutar(e.target.value)}
              placeholder="Örn: 25000"
              className="text-xs font-mono"
            />
          </div>
        </div>

        {/* MAL ALIMI KALEMLER TABLOSU */}
        {!isHizmet && (
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/50 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PackageCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Mal Muayene ve Teslim Alınan Kalemler Cetveli
                </h4>
              </div>
              <Button
                type="button"
                onClick={handleAddKalem}
                variant="outline"
                size="sm"
                className="h-7 text-[11px] gap-1 px-2 border-emerald-300 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50"
              >
                <Plus className="w-3 h-3" />
                Satır Ekle
              </Button>
            </div>

            <div className="overflow-x-auto max-h-56">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                    <th className="py-2 px-2 w-12 text-center">Sıra</th>
                    <th className="py-2 px-2 min-w-[160px]">Malzeme Adı *</th>
                    <th className="py-2 px-2 min-w-[140px]">Özelliği</th>
                    <th className="py-2 px-2 w-24">Birimi</th>
                    <th className="py-2 px-2 w-20 text-center">İhtiyaç Miktarı</th>
                    <th className="py-2 px-2 w-24 text-center">Top. Teslim Alınan</th>
                    <th className="py-2 px-2 w-24 text-center">Kabul Miktarı</th>
                    <th className="py-2 px-1 w-8 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800">
                  {kalemler.map((kalem, idx) => (
                    <tr key={idx} className="hover:bg-white dark:hover:bg-slate-800/60 transition-colors">
                      <td className="py-1.5 px-2 text-center font-bold text-slate-500">
                        {kalem.siraNo}
                      </td>
                      <td className="py-1.5 px-2">
                        <input
                          type="text"
                          value={kalem.malzemeAdi}
                          onChange={(e) => handleUpdateKalem(idx, 'malzemeAdi', e.target.value)}
                          placeholder="Malzeme adı..."
                          required
                          className="w-full h-8 px-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                        />
                      </td>
                      <td className="py-1.5 px-2">
                        <input
                          type="text"
                          value={kalem.ozelligi}
                          onChange={(e) => handleUpdateKalem(idx, 'ozelligi', e.target.value)}
                          placeholder="Teknik özelliği..."
                          className="w-full h-8 px-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                        />
                      </td>
                      <td className="py-1.5 px-2">
                        <input
                          type="text"
                          value={kalem.birimi}
                          onChange={(e) => handleUpdateKalem(idx, 'birimi', e.target.value)}
                          placeholder="Adet, Takım..."
                          className="w-full h-8 px-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                        />
                      </td>
                      <td className="py-1.5 px-2 text-center">
                        <input
                          type="number"
                          value={kalem.miktari}
                          onChange={(e) => handleUpdateKalem(idx, 'miktari', Number(e.target.value))}
                          className="w-full h-8 px-1.5 text-center bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono"
                        />
                      </td>
                      <td className="py-1.5 px-2 text-center">
                        <input
                          type="number"
                          value={kalem.toplamTeslimAlinan}
                          onChange={(e) => handleUpdateKalem(idx, 'toplamTeslimAlinan', Number(e.target.value))}
                          className="w-full h-8 px-1.5 text-center bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono"
                        />
                      </td>
                      <td className="py-1.5 px-2 text-center">
                        <input
                          type="number"
                          value={kalem.kabulMiktari}
                          onChange={(e) => handleUpdateKalem(idx, 'kabulMiktari', Number(e.target.value))}
                          className="w-full h-8 px-1.5 text-center font-bold text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs"
                        />
                      </td>
                      <td className="py-1.5 px-1 text-center">
                        {kalemler.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveKalem(idx)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50"
                            title="Satırı Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Notlar */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Muayene İnceleme Notları / Açıklama
          </label>
          <textarea
            value={notlar}
            onChange={(e) => setNotlar(e.target.value)}
            placeholder="Mal veya hizmetin teknik şartnameye uygunluğu, teslimat durumu, eksiklikler..."
            rows={2.5}
            className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200 resize-none"
          />
        </div>

        {/* Butonlar */}
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

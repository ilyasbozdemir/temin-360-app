import React, { useState, useEffect } from 'react'
import { Modal } from './Modal'
import { Button } from './Button'
import { Input } from './Input'
import { useAmbarHooks } from '../../screens/ambar/ambar.hooks'
import {
  PackageCheck,
  Archive,
  Layers,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Hash,
  Calendar,
  Building2,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

export interface TifModalItem {
  temin_kalem_id?: number
  kalem_adi: string
  miktar: number
  olcu_birimi?: string
  birim_fiyat?: number
  tasinir_kodu?: string
}

interface TifOlusturModalProps {
  isOpen: boolean
  onClose: () => void
  teminDosyaId: number
  dosyaNo?: string
  dosyaAdi?: string
  initialKalemler?: TifModalItem[]
  onSuccess?: (tifId: number) => void
}

export const TifOlusturModal: React.FC<TifOlusturModalProps> = ({
  isOpen,
  onClose,
  teminDosyaId,
  dosyaNo = '',
  dosyaAdi = '',
  initialKalemler = [],
  onSuccess
}) => {
  const { ambarlar, createTifFromDosya } = useAmbarHooks()
  const [selectedAmbarId, setSelectedAmbarId] = useState<number | ''>('')
  const [fisNo, setFisNo] = useState('')
  const [fisTarihi, setFisTarihi] = useState(new Date().toISOString().split('T')[0])
  const [fisTuru, setFisTuru] = useState<'giris' | 'cikis'>('giris')
  const [kisiVeyaBirim, setKisiVeyaBirim] = useState('')
  const [rafLokasyon, setRafLokasyon] = useState('')
  const [lotNo, setLotNo] = useState('')
  const [sonKullanmaTarihi, setSonKullanmaTarihi] = useState('')
  const [aciklama, setAciklama] = useState('')
  const [kalemler, setKalemler] = useState<TifModalItem[]>([])
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Initialize form state
  useEffect(() => {
    if (isOpen) {
      setSuccessMessage(null)
      setErrorMessage(null)
      const year = new Date().getFullYear()
      const cleanNo = dosyaNo
        ? dosyaNo.replace(/[^0-9a-zA-Z]/g, '')
        : Math.floor(1000 + Math.random() * 9000)
      setFisNo(`TİF-${year}-${cleanNo}`)
      setFisTarihi(new Date().toISOString().split('T')[0])
      setFisTuru('giris')
      setAciklama(`${dosyaNo ? dosyaNo + ' - ' : ''}${dosyaAdi || 'Temin'} alımı ambara aktarımı`)

      // Auto-select first ambar if available
      if (ambarlar.length > 0 && !selectedAmbarId) {
        setSelectedAmbarId(ambarlar[0].id)
      }

      // If initial items provided, load them; otherwise fetch from DATA_TeminKalem
      if (initialKalemler && initialKalemler.length > 0) {
        setKalemler(initialKalemler)
      } else if (teminDosyaId) {
        window.electron.ipcRenderer
          .invoke(
            'db:query',
            'SELECT * FROM DATA_TeminKalem WHERE temin_dosya_id = ? OR dosya_id = ?',
            [teminDosyaId, teminDosyaId]
          )
          .then((res: any) => {
            if (res.success && res.data && res.data.length > 0) {
              setKalemler(
                res.data.map((k: any) => ({
                  temin_kalem_id: k.id,
                  kalem_adi: k.kalem_adi || k.malzeme_adi || k.ad || '',
                  miktar: Number(k.miktar) || 1,
                  olcu_birimi: k.olcu_birimi || k.birim || 'Adet',
                  birim_fiyat: Number(k.birim_fiyat) || Number(k.yaklasik_maliyet) || 0,
                  tasinir_kodu: k.tasinir_kodu || '150.01.01'
                }))
              )
            } else {
              setKalemler([
                {
                  kalem_adi: '',
                  miktar: 1,
                  olcu_birimi: 'Adet',
                  birim_fiyat: 0,
                  tasinir_kodu: '150.01.01'
                }
              ])
            }
          })
          .catch(() => {
            setKalemler([
              {
                kalem_adi: '',
                miktar: 1,
                olcu_birimi: 'Adet',
                birim_fiyat: 0,
                tasinir_kodu: '150.01.01'
              }
            ])
          })
      }
    }
  }, [isOpen, teminDosyaId, dosyaNo, dosyaAdi, ambarlar])

  const handleItemChange = (index: number, field: keyof TifModalItem, value: any) => {
    setKalemler((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const addItemRow = () => {
    setKalemler((prev) => [
      ...prev,
      {
        kalem_adi: '',
        miktar: 1,
        olcu_birimi: 'Adet',
        birim_fiyat: 0,
        tasinir_kodu: '150.01.01'
      }
    ])
  }

  const removeItemRow = (index: number) => {
    if (kalemler.length <= 1) return
    setKalemler((prev) => prev.filter((_, i) => i !== index))
  }

  const calculateTotal = () => {
    return kalemler.reduce(
      (sum, item) => sum + (Number(item.miktar) || 0) * (Number(item.birim_fiyat) || 0),
      0
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!selectedAmbarId) {
      setErrorMessage('Lütfen hedef ambar/depo seçiniz.')
      return
    }
    if (!fisNo.trim()) {
      setErrorMessage('Lütfen Fiş No belirtiniz.')
      return
    }
    const validItems = kalemler.filter((k) => k.kalem_adi.trim())
    if (validItems.length === 0) {
      setErrorMessage('En az bir geçerli malzeme kalemi bulunmalıdır.')
      return
    }

    try {
      setIsSubmitting(true)
      const result = await createTifFromDosya({
        temin_dosya_id: teminDosyaId,
        ambar_id: Number(selectedAmbarId),
        fis_no: fisNo.trim(),
        fis_tarihi: fisTarihi,
        fis_turu: fisTuru,
        aciklama: aciklama.trim(),
        kisi_veya_birim: kisiVeyaBirim.trim(),
        raf_lokasyon: rafLokasyon.trim(),
        lot_no: lotNo.trim(),
        son_kullanma_tarihi: sonKullanmaTarihi || undefined,
        durum: 'onaylandi',
        kalemler: validItems
      })

      setSuccessMessage(
        'Taşınır İşlem Fişi (TİF) başarıyla oluşturuldu ve ambar stoklarına aktarıldı!'
      )
      if (onSuccess && result.tifId) {
        onSuccess(result.tifId)
      }
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (err: any) {
      setErrorMessage(err.message || 'TİF kaydı oluşturulurken bir hata oluştu.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Taşınır İşlem Fişi (TİF) & Ambar Girişi"
      description="Doğrudan temin dosyasındaki malzemeleri seçilen ambara aktarın ve resmi TİF belgesi oluşturun."
      className="max-w-4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* SUCCESS / ERROR ALERTS */}
        {successMessage && (
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-3 text-emerald-800 dark:text-emerald-200 text-sm animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-800 dark:text-red-200 text-sm animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* TOP METADATA ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Archive className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Hedef Ambar / Depo <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedAmbarId}
              onChange={(e) => setSelectedAmbarId(Number(e.target.value) || '')}
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 h-9"
              required
            >
              <option value="">-- Ambar Seçin --</option>
              {ambarlar.map((amb) => (
                <option key={amb.id} value={amb.id}>
                  {amb.ambar_adi} {amb.tasinir_kodu ? `(${amb.tasinir_kodu})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              TİF Fiş No <span className="text-red-500">*</span>
            </label>
            <Input
              value={fisNo}
              onChange={(e) => setFisNo(e.target.value)}
              placeholder="Örn: TİF-2026-0042"
              className="bg-white dark:bg-slate-950 text-xs py-1.5 h-9"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Fiş Tarihi <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={fisTarihi}
              onChange={(e) => setFisTarihi(e.target.value)}
              className="bg-white dark:bg-slate-950 text-xs py-1.5 h-9"
              required
            />
          </div>
        </div>

        {/* KALEMLER TABLOSU */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Ambara Aktarılacak Kalemler ({kalemler.length})
              </h4>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addItemRow}
              className="h-7 text-xs gap-1 border-dashed"
            >
              <Plus className="w-3.5 h-3.5" /> Kalem Ekle
            </Button>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100/70 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-600 dark:text-slate-400">
                <tr>
                  <th className="p-2.5 w-10 text-center">#</th>
                  <th className="p-2.5">Malzeme / Kalem Adı</th>
                  <th className="p-2.5 w-28">Taşınır Kodu</th>
                  <th className="p-2.5 w-20 text-center">Miktar</th>
                  <th className="p-2.5 w-24">Birim</th>
                  <th className="p-2.5 w-28 text-right">Birim Fiyat (₺)</th>
                  <th className="p-2.5 w-28 text-right">Toplam (₺)</th>
                  <th className="p-2.5 w-10 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-950">
                {kalemler.map((item, idx) => {
                  const subTotal = (Number(item.miktar) || 0) * (Number(item.birim_fiyat) || 0)
                  return (
                    <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/30">
                      <td className="p-2 text-center text-slate-400 font-mono">{idx + 1}</td>
                      <td className="p-2">
                        <Input
                          value={item.kalem_adi}
                          onChange={(e) => handleItemChange(idx, 'kalem_adi', e.target.value)}
                          placeholder="Malzeme adı..."
                          className="h-8 text-xs bg-slate-50/50 dark:bg-slate-900/50"
                          required
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          value={item.tasinir_kodu || ''}
                          onChange={(e) => handleItemChange(idx, 'tasinir_kodu', e.target.value)}
                          placeholder="150.01.01"
                          className="h-8 text-xs font-mono bg-slate-50/50 dark:bg-slate-900/50"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          step="any"
                          min="0.001"
                          value={item.miktar}
                          onChange={(e) =>
                            handleItemChange(idx, 'miktar', parseFloat(e.target.value) || 0)
                          }
                          className="h-8 text-xs text-center font-medium bg-slate-50/50 dark:bg-slate-900/50"
                          required
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          value={item.olcu_birimi || ''}
                          onChange={(e) => handleItemChange(idx, 'olcu_birimi', e.target.value)}
                          placeholder="Adet"
                          className="h-8 text-xs bg-slate-50/50 dark:bg-slate-900/50"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.birim_fiyat || 0}
                          onChange={(e) =>
                            handleItemChange(idx, 'birim_fiyat', parseFloat(e.target.value) || 0)
                          }
                          className="h-8 text-xs text-right font-mono bg-slate-50/50 dark:bg-slate-900/50"
                        />
                      </td>
                      <td className="p-2 text-right font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {subTotal.toLocaleString('tr-TR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}{' '}
                        ₺
                      </td>
                      <td className="p-2 text-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItemRow(idx)}
                          disabled={kalemler.length <= 1}
                          className="h-7 w-7 p-0 text-slate-400 hover:text-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 font-bold">
                <tr>
                  <td colSpan={6} className="p-2.5 text-right text-slate-600 dark:text-slate-400">
                    Genel TİF Toplamı:
                  </td>
                  <td className="p-2.5 text-right text-blue-600 dark:text-blue-400 font-mono text-sm">
                    {calculateTotal().toLocaleString('tr-TR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}{' '}
                    ₺
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* ADVANCED FIELDS TOGGLE */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 font-semibold cursor-pointer w-full justify-center bg-blue-50/60 dark:bg-blue-900/20 py-2 rounded-lg transition-colors"
        >
          {showAdvanced ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
          {showAdvanced
            ? 'Ek Lokasyon & İrsaliye Alanlarını Gizle'
            : 'Ek Ambar Detayları (Raf/Lokasyon, Teslim Eden, Lot, SKT)'}
        </button>

        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-300 text-xs">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                Teslim Eden / Alan Kişi veya Birim
              </label>
              <Input
                value={kisiVeyaBirim}
                onChange={(e) => setKisiVeyaBirim(e.target.value)}
                placeholder="Örn: Yüklenici Firma / İlgili Şube"
                className="h-8 text-xs bg-white dark:bg-slate-950"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                Raf / Bölüm Lokasyonu
              </label>
              <Input
                value={rafLokasyon}
                onChange={(e) => setRafLokasyon(e.target.value)}
                placeholder="Örn: Raf A-12, Kat 2"
                className="h-8 text-xs bg-white dark:bg-slate-950"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                Seri / Lot No
              </label>
              <Input
                value={lotNo}
                onChange={(e) => setLotNo(e.target.value)}
                placeholder="Örn: LOT-2026-99"
                className="h-8 text-xs bg-white dark:bg-slate-950"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                Son Kullanma Tarihi (SKT)
              </label>
              <Input
                type="date"
                value={sonKullanmaTarihi}
                onChange={(e) => setSonKullanmaTarihi(e.target.value)}
                className="h-8 text-xs bg-white dark:bg-slate-950"
              />
            </div>

            <div className="col-span-full">
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                Açıklama / Fiş Notu
              </label>
              <Input
                value={aciklama}
                onChange={(e) => setAciklama(e.target.value)}
                placeholder="İlgili fatura, sevk irsaliyesi veya muayene kabul notu..."
                className="h-8 text-xs bg-white dark:bg-slate-950"
              />
            </div>
          </div>
        )}

        {/* ACTIONS */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            İptal
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-md"
          >
            <PackageCheck className="w-4 h-4" />
            {isSubmitting ? 'TİF Kaydediliyor...' : 'TİF Oluştur ve Stoka Giriş Yap'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
export default TifOlusturModal

import React, { useState, useEffect } from 'react'
import { Modal } from '../../../components/ui/Modal'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { useAmbarHooks, AmbarStok, CreateHareketInput } from '../ambar.hooks'
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  ShieldCheck, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react'

interface StokHareketModalProps {
  isOpen: boolean
  onClose: () => void
  initialStok?: AmbarStok | null
  defaultHareketTuru?: 'giris' | 'cikis' | 'zimmet' | 'iade' | 'hasar'
}

export const StokHareketModal: React.FC<StokHareketModalProps> = ({
  isOpen,
  onClose,
  initialStok,
  defaultHareketTuru = 'zimmet'
}) => {
  const { ambarlar, addHareket } = useAmbarHooks()
  const [ambarId, setAmbarId] = useState<number | ''>('')
  const [hareketTuru, setHareketTuru] = useState<'giris' | 'cikis' | 'zimmet' | 'iade' | 'hasar'>(defaultHareketTuru)
  const [kalemAdi, setKalemAdi] = useState('')
  const [tasinirKodu, setTasinirKodu] = useState('')
  const [miktar, setMiktar] = useState<number>(1)
  const [olcuBirimi, setOlcuBirimi] = useState('Adet')
  const [birimFiyat, setBirimFiyat] = useState<number>(0)
  const [belgeTuru, setBelgeTuru] = useState('ZIMMET')
  const [belgeNo, setBelgeNo] = useState('')
  const [kisiVeyaBirim, setKisiVeyaBirim] = useState('')
  const [rafLokasyon, setRafLokasyon] = useState('')
  const [lotNo, setLotNo] = useState('')
  const [sonKullanmaTarihi, setSonKullanmaTarihi] = useState('')
  const [aciklama, setAciklama] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null)
      setSuccessMessage(null)
      setHareketTuru(defaultHareketTuru)
      if (defaultHareketTuru === 'zimmet') setBelgeTuru('ZIMMET')
      else if (defaultHareketTuru === 'cikis') setBelgeTuru('TIF_CIKIS')
      else if (defaultHareketTuru === 'giris') setBelgeTuru('TIF_GIRIS')
      else if (defaultHareketTuru === 'iade') setBelgeTuru('IADE_BELGESI')
      else if (defaultHareketTuru === 'hasar') setBelgeTuru('HASAR_TUTANAGI')

      if (initialStok) {
        setAmbarId(initialStok.ambar_id)
        setKalemAdi(initialStok.kalem_adi)
        setTasinirKodu(initialStok.tasinir_kodu || '')
        setOlcuBirimi(initialStok.olcu_birimi || 'Adet')
        setBirimFiyat(initialStok.birim_fiyat || 0)
        setMiktar(1)
      } else {
        if (ambarlar.length > 0 && !ambarId) {
          setAmbarId(ambarlar[0].id)
        }
        setKalemAdi('')
        setTasinirKodu('')
        setOlcuBirimi('Adet')
        setBirimFiyat(0)
        setMiktar(1)
      }
    }
  }, [isOpen, initialStok, defaultHareketTuru, ambarlar])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!ambarId) {
      setErrorMessage('Lütfen ilgili ambarı seçiniz.')
      return
    }
    if (!kalemAdi.trim()) {
      setErrorMessage('Lütfen malzeme / kalem adını giriniz.')
      return
    }
    if (miktar <= 0) {
      setErrorMessage('Miktar 0 dan büyük olmalıdır.')
      return
    }

    try {
      setIsSubmitting(true)
      const payload: CreateHareketInput = {
        ambar_id: Number(ambarId),
        stok_id: initialStok ? initialStok.id : undefined,
        hareket_turu: hareketTuru,
        kalem_adi: kalemAdi.trim(),
        tasinir_kodu: tasinirKodu.trim() || undefined,
        miktar: Number(miktar),
        olcu_birimi: olcuBirimi.trim() || 'Adet',
        birim_fiyat: Number(birimFiyat) || 0,
        belge_turu: belgeTuru.trim() || undefined,
        belge_no: belgeNo.trim() || undefined,
        kisi_veya_birim: kisiVeyaBirim.trim() || undefined,
        raf_lokasyon: rafLokasyon.trim() || undefined,
        lot_no: lotNo.trim() || undefined,
        son_kullanma_tarihi: sonKullanmaTarihi || undefined,
        aciklama: aciklama.trim() || undefined
      }

      await addHareket(payload)
      setSuccessMessage('Stok hareketi başarıyla kaydedildi ve ambar bakiyesi güncellendi.')
      setTimeout(() => {
        onClose()
      }, 1200)
    } catch (err: any) {
      setErrorMessage(err.message || 'Stok hareketi kaydedilirken hata oluştu.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getHareketColor = (type: string) => {
    switch (type) {
      case 'giris':
        return 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
      case 'cikis':
        return 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
      case 'zimmet':
        return 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
      case 'iade':
        return 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
      case 'hasar':
        return 'border-red-500 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300'
      default:
        return 'border-slate-300 bg-slate-50'
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Stok Hareketi & Zimmet İşlemi"
      description="Depodan personele zimmet çıkarma, ambarlar arası transfer, hasar/fire veya malzeme iade kaydı."
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {successMessage && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-3 text-emerald-800 dark:text-emerald-200 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-800 dark:text-red-200 text-xs">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* HAREKET TÜRÜ SEÇİMİ */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            İşlem / Hareket Türü
          </label>
          <div className="grid grid-cols-5 gap-2">
            {[
              { id: 'zimmet', label: 'Zimmet Ver', icon: ShieldCheck },
              { id: 'cikis', label: 'Stok Çıkışı', icon: ArrowUpRight },
              { id: 'giris', label: 'Stok Girişi', icon: ArrowDownLeft },
              { id: 'iade', label: 'İade Al', icon: RotateCcw },
              { id: 'hasar', label: 'Hasar / Fire', icon: AlertTriangle }
            ].map((item) => {
              const Icon = item.icon
              const isSelected = hareketTuru === item.id
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => {
                    setHareketTuru(item.id as any)
                    if (item.id === 'zimmet') setBelgeTuru('ZIMMET')
                    else if (item.id === 'cikis') setBelgeTuru('TIF_CIKIS')
                    else if (item.id === 'giris') setBelgeTuru('TIF_GIRIS')
                    else if (item.id === 'iade') setBelgeTuru('IADE_BELGESI')
                    else if (item.id === 'hasar') setBelgeTuru('HASAR_TUTANAGI')
                  }}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    isSelected
                      ? `${getHareketColor(item.id)} ring-2 ring-blue-500 shadow-sm font-bold`
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4 mb-1" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* AMBAR & MALZEME BİLGİSİ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              İlgili Ambar / Depo <span className="text-red-500">*</span>
            </label>
            <select
              value={ambarId}
              onChange={(e) => setAmbarId(Number(e.target.value) || '')}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 h-9"
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
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Malzeme / Kalem Adı <span className="text-red-500">*</span>
            </label>
            <Input
              value={kalemAdi}
              onChange={(e) => setKalemAdi(e.target.value)}
              placeholder="Örn: 24 inç Monitör"
              className="h-9 text-xs"
              required
            />
          </div>
        </div>

        {/* MİKTAR, BİRİM, FİYAT, KOD */}
        <div className="grid grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Miktar <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              step="any"
              min="0.001"
              value={miktar}
              onChange={(e) => setMiktar(parseFloat(e.target.value) || 0)}
              className="h-9 text-xs font-bold"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Ölçü Birimi
            </label>
            <Input
              value={olcuBirimi}
              onChange={(e) => setOlcuBirimi(e.target.value)}
              placeholder="Adet"
              className="h-9 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Birim Fiyat (₺)
            </label>
            <Input
              type="number"
              step="0.01"
              value={birimFiyat}
              onChange={(e) => setBirimFiyat(parseFloat(e.target.value) || 0)}
              className="h-9 text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Taşınır Kodu
            </label>
            <Input
              value={tasinirKodu}
              onChange={(e) => setTasinirKodu(e.target.value)}
              placeholder="150.01.01"
              className="h-9 text-xs font-mono"
            />
          </div>
        </div>

        {/* TESLİM ALAN / EDEN, BELGE NO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {hareketTuru === 'zimmet' ? 'Zimmet Edilen Personel / Birim' : 'Teslim Alan / Teslim Eden'}
            </label>
            <Input
              value={kisiVeyaBirim}
              onChange={(e) => setKisiVeyaBirim(e.target.value)}
              placeholder="Örn: Ahmet Yılmaz (Bilgi İşlem)"
              className="h-9 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Belge / Fiş No
            </label>
            <Input
              value={belgeNo}
              onChange={(e) => setBelgeNo(e.target.value)}
              placeholder="Örn: ZMM-2026-0012"
              className="h-9 text-xs font-mono"
            />
          </div>
        </div>

        {/* RAF, LOT, AÇIKLAMA */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Raf / Depo Lokasyonu
            </label>
            <Input
              value={rafLokasyon}
              onChange={(e) => setRafLokasyon(e.target.value)}
              placeholder="Örn: Raf 3-B"
              className="h-9 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Seri / Lot No
            </label>
            <Input
              value={lotNo}
              onChange={(e) => setLotNo(e.target.value)}
              placeholder="Örn: SN-98124"
              className="h-9 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Açıklama / Not
            </label>
            <Input
              value={aciklama}
              onChange={(e) => setAciklama(e.target.value)}
              placeholder="İşlem açıklaması"
              className="h-9 text-xs"
            />
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            İptal
          </Button>
          <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white shadow-md">
            {isSubmitting ? 'Kaydediliyor...' : 'Hareketi Kaydet'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
export default StokHareketModal

import React, { useEffect, useState } from 'react'
import { Building2, Info, Truck } from 'lucide-react'
import { Modal } from '../../../../../../components/ui/Modal'
import { Button } from '../../../../../../components/ui/Button'
import { Input } from '../../../../../../components/ui/Input'
import { KabulTutanakItem, MalKalemiItem } from './types'
import { KabulTutanakKalemlerTable } from './tutanaklar/KabulTutanakKalemlerTable'

interface KabulTutanakModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (tutanak: KabulTutanakItem) => void
  initialTutanak?: KabulTutanakItem | null
  existingTutanaklar?: KabulTutanakItem[]
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
  existingTutanaklar = [],
  defaultFaturaNo = '',
  defaultFaturaTarihi = '',
  defaultTeslimYeri = '',
  defaultTeslimAlan = '',
  defaultTutar = null,
  dosyaKalemler = [],
  alimTuru = ''
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

  const normalizedAlimTuru = (alimTuru || '').toLowerCase()
  const isYapim =
    normalizedAlimTuru.includes('yapim') ||
    normalizedAlimTuru.includes('inşaat') ||
    normalizedAlimTuru.includes('insaat')
  const isHizmet =
    !isYapim &&
    (normalizedAlimTuru.includes('hizmet') || normalizedAlimTuru.includes('danismanlik'))

  const turAdi = isYapim
    ? 'Yapım İşi Geçici Kabul Tutanağı'
    : isHizmet
      ? 'Hizmet İşleri Muayene ve Kabul Tutanağı'
      : 'Muayene ve Kabul Tutanağı'

  useEffect(() => {
    if (!isOpen) return

    const previousAcceptedMap: Record<number, number> = {}
    if (existingTutanaklar && existingTutanaklar.length > 0) {
      existingTutanaklar.forEach((prevTut) => {
        if (initialTutanak && prevTut.id === initialTutanak.id) return
        if (prevTut.kalemler) {
          prevTut.kalemler.forEach((k) => {
            const prevVal = previousAcceptedMap[k.siraNo] || 0
            previousAcceptedMap[k.siraNo] = prevVal + (Number(k.kabulMiktari) || 0)
          })
        }
      })
    }

    const todayStr = new Date().toISOString().split('T')[0]

    if (initialTutanak) {
      setTutanakNo(initialTutanak.tutanakNo || '')
      setTutanakTarihi(initialTutanak.tutanakTarihi || todayStr)
      setFaturaNo(initialTutanak.faturaNo || defaultFaturaNo)
      setFaturaTarihi(initialTutanak.faturaTarihi || defaultFaturaTarihi || todayStr)
      setIrsaliyeNo(initialTutanak.irsaliyeNo || '')
      setIrsaliyeTarihi(initialTutanak.irsaliyeTarihi || '')
      setTeslimYeri(initialTutanak.teslimYeri || defaultTeslimYeri || DEFAULT_AMBARLAR[0])
      setTeslimAlan(initialTutanak.teslimAlan || defaultTeslimAlan || DEFAULT_TESLİM_ALANLAR[0])
      setDurum(initialTutanak.durum || 'kabul')
      setTutar(initialTutanak.tutar ? String(initialTutanak.tutar) : '')
      setNotlar(initialTutanak.notlar || '')
    } else {
      const nextIndex = (existingTutanaklar?.length || 0) + 1
      const autoTutanakNo = `KT-${new Date().getFullYear()}-${String(nextIndex).padStart(3, '0')}`
      setTutanakNo(autoTutanakNo)
      setTutanakTarihi(defaultFaturaTarihi || todayStr)
      setFaturaNo(defaultFaturaNo)
      setFaturaTarihi(defaultFaturaTarihi || todayStr)
      setIrsaliyeNo('')
      setIrsaliyeTarihi(todayStr)
      setTeslimYeri(defaultTeslimYeri || DEFAULT_AMBARLAR[0])
      setTeslimAlan(defaultTeslimAlan || DEFAULT_TESLİM_ALANLAR[0])
      setDurum('kabul')
      setNotlar('')
    }

    const initialKalemMap = new Map<number, MalKalemiItem>()
    if (initialTutanak?.kalemler) {
      initialTutanak.kalemler.forEach((ik) => {
        initialKalemMap.set(ik.siraNo, ik)
      })
    }

    if (dosyaKalemler && dosyaKalemler.length > 0) {
      let computedSum = 0
      const mappedKalemler: MalKalemiItem[] = dosyaKalemler.map((k, idx) => {
        const siraNo = k.sira_no || idx + 1
        const ihtiyacMiktari = Number(k.miktar || 0)
        const oncekiTeslim = previousAcceptedMap[siraNo] || 0
        const existingKalem = initialKalemMap.get(siraNo)
        const kalanBakiye = Math.max(0, ihtiyacMiktari - oncekiTeslim)
        const buKabul =
          existingKalem !== undefined ? Number(existingKalem.kabulMiktari ?? 0) : kalanBakiye
        const bFiyat =
          existingKalem?.birimFiyati !== undefined
            ? Number(existingKalem.birimFiyati)
            : Number(k.birim_fiyat || 0)
        const lineTotal = buKabul * bFiyat
        computedSum += lineTotal

        const malzemeAdi =
          k.malzeme_adi ||
          (k as any).kalem_adi ||
          (k as any).malzemeAdi ||
          (k as any).ad ||
          existingKalem?.malzemeAdi ||
          `Kalem #${siraNo}`
        const ozelligi =
          k.ozelligi ||
          (k as any).aciklama ||
          (k as any).ozellik ||
          existingKalem?.ozelligi ||
          ''
        const birimi =
          k.birimi || (k as any).birim || existingKalem?.birimi || 'Adet'

        return {
          siraNo,
          malzemeAdi,
          ozelligi,
          birimi,
          miktari: ihtiyacMiktari,
          oncekiTeslimAlinan: oncekiTeslim,
          toplamTeslimAlinan: oncekiTeslim + buKabul,
          kabulMiktari: buKabul,
          birimFiyati: bFiyat,
          toplamTutar: lineTotal
        }
      })

      setKalemler(mappedKalemler)
      if (initialTutanak?.tutar) {
        setTutar(String(initialTutanak.tutar))
      } else if (computedSum > 0) {
        setTutar(String(computedSum))
      } else if (defaultTutar) {
        setTutar(String(defaultTutar))
      }
    } else if (initialTutanak?.kalemler && initialTutanak.kalemler.length > 0) {
      setKalemler(initialTutanak.kalemler)
    } else {
      setKalemler([])
    }
  }, [isOpen, initialTutanak, dosyaKalemler, defaultFaturaNo, defaultFaturaTarihi, defaultTeslimYeri, defaultTeslimAlan, defaultTutar])

  const handleUpdateKalem = (
    idx: number,
    field: keyof MalKalemiItem,
    val: string | number
  ): void => {
    setKalemler((prev) => {
      const updatedList = prev.map((item, i) => {
        if (i !== idx) return item
        const updated = { ...item, [field]: val }
        const onceki = updated.oncekiTeslimAlinan || 0
        const buKabul = Number(updated.kabulMiktari) || 0
        const bFiyat = Number(updated.birimFiyati) || 0
        updated.toplamTeslimAlinan = onceki + buKabul
        updated.toplamTutar = buKabul * bFiyat
        return updated
      })

      const totalSum = updatedList.reduce((acc, k) => {
        const buKabul = Number(k.kabulMiktari) || 0
        const bFiyat = Number(k.birimFiyati) || 0
        return acc + buKabul * bFiyat
      }, 0)

      if (totalSum > 0) {
        setTutar(String(totalSum))
      }

      return updatedList
    })
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
      kalemler: kalemler,
      created_at: initialTutanak?.created_at || new Date().toISOString()
    }

    onSave(item)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialTutanak ? `${turAdi} Düzenle` : `Yeni ${turAdi} Kaydet`}
      className="max-w-4xl w-11/12"
    >
      <form onSubmit={handleSubmit} className="space-y-4 p-1">
        <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div>
            <strong>{turAdi} Kaydı:</strong>{' '}
            {isYapim
              ? 'Yapım işi hakediş, geçici kabul, imalat tespit ve komisyon onay kararlarını kaydedebilirsiniz.'
              : isHizmet
                ? 'İfa edilen hizmet, danışmanlık veya bakım-onarım kabul tutanağı ve komisyon kararlarını kaydedebilirsiniz.'
                : 'Kısmi teslimatlar, irsaliye/fatura numaraları ve ambar teslim yeri bilgilerini girebilir, muayene komisyonu onay kararlarını kaydedebilirsiniz.'}
          </div>
        </div>

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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-slate-400" />
              <span>İrsaliye No</span>
            </label>
            <Input
              value={irsaliyeNo}
              onChange={(e) => setIrsaliyeNo(e.target.value)}
              placeholder="İRS-2026-001 (Opsiyonel)"
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
              placeholder="Ambar veya teslim yeri..."
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

        <KabulTutanakKalemlerTable kalemler={kalemler} onUpdateKalem={handleUpdateKalem} />

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

import React, { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  HelpCircle,
  History,
  Layers,
  Link2,
  Percent,
  Plus,
  PlusCircle,
  RotateCcw,
  Save,
  Sparkles,
  Tag,
  Trash2
} from 'lucide-react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { PozItem, usePozlarHooks, PozFiyatGecmisi } from './pozlar.hooks'
import {
  POZ_KURUMLARI,
  getDinamikFiyatDonemleri
} from '../malzemeler/components/pozKitaplari.data'
import { APP_ROUTES } from '../../constants/routeConstants'
import { Button } from '../../components/ui/Button'
import { cn } from '../../utils/cn'

const OLCU_BIRIMLERI_LIST = [
  { kod: 'm²', ad: 'Metrekare (m²)' },
  { kod: 'm³', ad: 'Metreküp (m³)' },
  { kod: 'mt', ad: 'Metre / Metretül (mt)' },
  { kod: 'Adet', ad: 'Adet' },
  { kod: 'ton', ad: 'Ton' },
  { kod: 'kg', ad: 'Kilogram (kg)' },
  { kod: 'Set', ad: 'Set / Takım' },
  { kod: 'Götürü', ad: 'Götürü Bedel' },
  { kod: 'saat', ad: 'Saat' },
  { kod: 'ay', ad: 'Ay' },
  { kod: 'yıl', ad: 'Yıl' },
  { kod: 'sefer', ad: 'Sefer' },
  { kod: 'km', ad: 'Kilometre (km)' },
  { kod: 'lt', ad: 'Litre (lt)' },
  { kod: 'kwh', ad: 'Kilowatt-saat (kWh)' }
]

const POZ_TIPLERI = [
  { id: 'Analiz', ad: 'Analiz Pozu', desc: 'Malzeme + İşçilik + Makine + Müteahhit Kârı içeren komple imalat' },
  { id: 'Rayiç', ad: 'Rayiç (Malzeme / İşçilik / Makine)', desc: 'Tekil malzeme rayici veya işçilik saat ücreti' },
  { id: 'İmalat', ad: 'İmalat / Montajsız', desc: 'Doğrudan yerinde montajı yapılan kalem' },
  { id: 'Montaj', ad: 'Sadece Montaj Bedeli', desc: 'Cihaz veya ekipman montaj ücreti' },
  { id: 'Nakliye', ad: 'Nakliye & Taşıma Zammı', desc: 'Mesafe ve ağırlık bazlı taşıma formülleri' },
  { id: 'Özel', ad: 'Özel İdare / Kurum Pozu', desc: 'Özel teknik şartnameye bağlı imalat' }
]

const FASIKULLER_MAP: Record<string, string[]> = {
  ÇŞB: [
    'Çevre ve Şehircilik Bakanlığı 2019 ve Sonrası',
    'Çevre ve Şehircilik Bakanlığı 2018 ve Öncesi',
    '15. İnşaat İmalatları Fasikülü',
    '25. Sıhhi Tesisat ve Isıtma Fasikülü',
    '26. Havalandırma ve İklimlendirme Fasikülü',
    '35. Elektrik Tesisatı Fasikülü',
    '36. Zayıf Akım ve Otomasyon Fasikülü',
    '15. Altyapı, Yol ve Çevre Düzenleme'
  ],
  KGM: [
    '04. Karayolları Yol Yapım ve Köprü Fasikülü',
    '04. Asfalt ve Bitümlü Kaplama İmalatları',
    '04. Trafik Güvenliği ve Sinyalizasyon Fasikülü',
    '04. Sanat Yapıları ve Tünel İmalatları'
  ],
  DSİ: [
    '07. DSİ Baraj, Gölet ve Dolgu Fasikülü',
    '07. Sulama, Drenaj ve Kanalet İmalatları',
    '07. Sondaj, Enjeksiyon ve Yeraltı Tesisleri'
  ],
  İLBANK: [
    '18. İller Bankası İçmesuyu Tesisleri Fasikülü',
    '18. Kanalizasyon ve Yağmursuyu Fasikülü',
    '18. Arıtma Tesisi ve Pompa İstasyonları',
    '18. Üstyapı ve İmar Uygulamaları'
  ],
  VAKIF: [
    'Vakıflar Genel Müdürlüğü Restorasyon Fasikülü',
    'Taş, Ahşap ve Kalemişi Onarım İmalatları',
    'Kültür Varlıkları ve Müzeler Koruma Kitabı'
  ],
  ÖZEL: [
    'İdare Özel Birim Fiyat ve Analiz Kitabı',
    'Belediye Fen İşleri Özel Analiz Fasikülü',
    'Üniversite / Hastane Bakım-Onarım Özel Pozları'
  ]
}

const YAPI_SINIFLARI_LIST = [
  'Genel Yapım İşleri',
  'I-A / I-B (Geçici Yapılar, Basit Depolar)',
  'II-A / II-B (Küçük Sanayi, Hangarlar)',
  'III-A / III-B (Okullar, İdari Binalar, Konutlar)',
  'IV-A / IV-B / IV-C (Hastaneler, Büyük Kamu Binaları)',
  'V-A / V-B / V-C / V-D (Kompleks Tesisler, Üniversiteler)',
  'İnşaat İmalatları (Kaba & İnce İşler)',
  'Mekanik Tesisat ve Havalandırma',
  'Elektrik ve Zayıf Akım Tesisatı',
  'Peyzaj ve Çevre Düzenleme',
  'Altyapı, Yol, Köprü ve Sanat Yapıları',
  'Restorasyon ve Tarihî Eser Onarımı'
]

const POPULER_CPV_KODLARI = [
  { kod: '45000000', ad: 'Genel İnşaat İşleri' },
  { kod: '45210000', ad: 'Bina Yapım İşleri' },
  { kod: '45310000', ad: 'Elektrik Tesisatı İşleri' },
  { kod: '45330000', ad: 'Sıhhi ve Mekanik Tesisat' },
  { kod: '45233140', ad: 'Yol Bakım ve Onarımı' },
  { kod: '45400000', ad: 'Bina Tamamlama & İnce İşler' },
  { kod: '45112000', ad: 'Hafriyat ve Kazı İşleri' },
  { kod: '45261000', ad: 'Çatı Kaplama ve İskele' }
]

const ORNEK_POZ_SABLONLARI = [
  {
    baslik: 'Derin Kazı Zammı (Örnek)',
    kurum: 'ÇŞB',
    poz_no: '15.110.1001',
    eski_poz_no: '14.040/1',
    fasikul: 'Çevre ve Şehircilik Bakanlığı 2019 ve Sonrası',
    poz_tipi: 'Analiz',
    kalem_adi: 'Her cins zeminde el ile yapılan (geniş-dar) derin kazılarda derinlik zammı (iksasız kazılarda) F=103,125 x H -206,25 (%25 yüklenici karı ve genel giderler dahil)',
    birim: 'm³',
    yapi_sinifi: 'İnşaat İmalatları (Kaba & İnce İşler)',
    okas_kodu: '45112000',
    ozelligi: 'Her cins zeminde el ile yapılan (geniş-dar) derin kazılara derinlik zammı (iksasız kazılarda) F=103,125 x H -206,25 (%25 yüklenici kârı ve genel giderler dahil)',
    fiyatlar: [
      { donem: '2026/1', fiyat: 425.50 },
      { donem: '2025/2', fiyat: 365.00 },
      { donem: '2025/1', fiyat: 310.25 },
      { donem: '2024/2', fiyat: 245.00 }
    ]
  },
  {
    baslik: 'C 25/30 Hazır Beton',
    kurum: 'ÇŞB',
    poz_no: '15.150.1005',
    eski_poz_no: '16.025/C',
    fasikul: '15. İnşaat İmalatları Fasikülü',
    poz_tipi: 'Analiz',
    kalem_adi: 'Basınç dayanım sınıfı C 25/30 olan hazır beton dökülmesi',
    birim: 'm³',
    yapi_sinifi: 'İnşaat İmalatları (Kaba & İnce İşler)',
    okas_kodu: '45000000',
    ozelligi: 'Beton pompası, mikser ve vibratör ile yerleştirme, sıkıştırma ve kürü dahil.',
    fiyatlar: [
      { donem: '2026/1', fiyat: 2850.00 },
      { donem: '2025/2', fiyat: 2450.00 },
      { donem: '2025/1', fiyat: 2100.00 }
    ]
  },
  {
    baslik: 'Nervürlü Donatı Çeliği',
    kurum: 'ÇŞB',
    poz_no: '15.160.1003',
    eski_poz_no: '23.014',
    fasikul: '15. İnşaat İmalatları Fasikülü',
    poz_tipi: 'Analiz',
    kalem_adi: 'Nervürlü çelik çubuğun bükülmesi, projesine göre yerine konulması (B420C)',
    birim: 'ton',
    yapi_sinifi: 'İnşaat İmalatları (Kaba & İnce İşler)',
    okas_kodu: '45000000',
    ozelligi: 'Bağlama teli, paspayı, kesme, bükme ve montaj zayiyatları dahil.',
    fiyatlar: [
      { donem: '2026/1', fiyat: 38500.00 },
      { donem: '2025/2', fiyat: 34000.00 },
      { donem: '2025/1', fiyat: 29500.00 }
    ]
  },
  {
    baslik: 'Özel İdare Tadilat Pozu',
    kurum: 'ÖZEL',
    poz_no: 'ÖZEL.01',
    eski_poz_no: 'ÖZEL-2023/4',
    fasikul: 'İdare Özel Birim Fiyat ve Analiz Kitabı',
    poz_tipi: 'Özel',
    kalem_adi: 'Mevcut bina içi asma tavan ve aydınlatma armatürlerinin sökülmesi ve yenilenmesi',
    birim: 'm²',
    yapi_sinifi: 'Bina Tamamlama & İnce İşler',
    okas_kodu: '45400000',
    ozelligi: 'İdarece onaylı özel teknik şartnameye ve birim fiyat analizine uygun olarak.',
    fiyatlar: [
      { donem: '2026/1', fiyat: 650.00 },
      { donem: '2025/2', fiyat: 520.00 }
    ]
  }
]

export default function YeniPozScreen(): React.JSX.Element {
  const search: any = useSearch({ strict: false })
  const editId = search?.id ? Number(search.id) : null

  const navigate = useNavigate()
  const { pozList, addPoz, updatePoz } = usePozlarHooks()

  const [formData, setFormData] = useState<Partial<PozItem>>(() => ({
    poz_no: '',
    eski_poz_no: '',
    fasikul: 'Çevre ve Şehircilik Bakanlığı 2019 ve Sonrası',
    poz_tipi: 'Analiz',
    kalem_adi: '',
    poz_tanimi: '',
    birim: 'm³',
    olcu_birimi: 'm³',
    poz_kurumu: 'ÇŞB',
    kategori: 'ÇŞB',
    poz_yili: new Date().getFullYear(),
    fiyat_donemi: `${new Date().getFullYear()}/1`,
    okas_kodu: '45000000',
    yapi_sinifi: 'Genel Yapım İşleri',
    kdv_orani: 20,
    birim_fiyat: 0,
    aktif_mi: 1,
    ozelligi: '',
    notlar: ''
  }))

  // Fiyat geçmişi satırları
  const [fiyatListesi, setFiyatListesi] = useState<PozFiyatGecmisi[]>([
    { donem: `${new Date().getFullYear()}/1`, fiyat: 0 }
  ])

  const [isSaving, setIsSaving] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Edit modunda mevcut poz verisini doldur
  useEffect(() => {
    document.title = editId
      ? 'Birim Fiyat Pozu Düzenle - DT'
      : 'Yeni Birim Fiyat Pozu Tanımla - DT'

    if (editId && pozList.length > 0) {
      const existing = pozList.find((p) => p.id === editId)
      if (existing) {
        setFormData({
          ...existing,
          poz_kurumu: existing.poz_kurumu || existing.kategori || 'ÇŞB',
          kategori: existing.kategori || existing.poz_kurumu || 'ÇŞB',
          fasikul: existing.fasikul || 'Çevre ve Şehircilik Bakanlığı 2019 ve Sonrası',
          poz_tipi: existing.poz_tipi || 'Analiz',
          eski_poz_no: existing.eski_poz_no || '',
          birim: existing.birim || existing.olcu_birimi || 'm²',
          olcu_birimi: existing.olcu_birimi || existing.birim || 'm²',
          poz_tanimi: existing.poz_tanimi || existing.kalem_adi || '',
          kdv_orani: existing.kdv_orani ?? 20,
          aktif_mi: existing.aktif_mi ?? 1,
          birim_fiyat: existing.birim_fiyat || 0
        })

        if (existing.birim_fiyatlar) {
          try {
            const parsed = JSON.parse(existing.birim_fiyatlar)
            if (Array.isArray(parsed) && parsed.length > 0) {
              setFiyatListesi(parsed)
            }
          } catch {
            if (existing.birim_fiyat) {
              setFiyatListesi([
                { donem: existing.fiyat_donemi || `${existing.poz_yili || 2026}/1`, fiyat: existing.birim_fiyat }
              ])
            }
          }
        } else if (existing.birim_fiyat) {
          setFiyatListesi([
            { donem: existing.fiyat_donemi || `${existing.poz_yili || 2026}/1`, fiyat: existing.birim_fiyat }
          ])
        }
      }
    }
  }, [editId, pozList])

  // Dinamik Dönem Listesi
  const dinamikDonemler = useMemo(
    () => getDinamikFiyatDonemleri(formData.poz_yili || new Date().getFullYear()),
    [formData.poz_yili]
  )

  // Kuruma özel fasiküller
  const aktifFasikuller = useMemo(() => {
    const kurum = formData.poz_kurumu || formData.kategori || 'ÇŞB'
    return FASIKULLER_MAP[kurum] || FASIKULLER_MAP.ÇŞB
  }, [formData.poz_kurumu, formData.kategori])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleApplyTemplate = (tpl: (typeof ORNEK_POZ_SABLONLARI)[0]) => {
    setFormData((prev) => ({
      ...prev,
      poz_no: tpl.poz_no,
      eski_poz_no: tpl.eski_poz_no,
      fasikul: tpl.fasikul,
      poz_tipi: tpl.poz_tipi,
      kalem_adi: tpl.kalem_adi,
      poz_tanimi: tpl.kalem_adi,
      birim: tpl.birim,
      olcu_birimi: tpl.birim,
      poz_kurumu: tpl.kurum,
      kategori: tpl.kurum,
      yapi_sinifi: tpl.yapi_sinifi,
      okas_kodu: tpl.okas_kodu,
      ozelligi: tpl.ozelligi,
      birim_fiyat: tpl.fiyatlar?.[0]?.fiyat || 0,
      fiyat_donemi: tpl.fiyatlar?.[0]?.donem || '2026/1'
    }))
    if (tpl.fiyatlar) {
      setFiyatListesi(tpl.fiyatlar)
    }
    showToast(`"${tpl.baslik}" şablonu uygulandı!`)
  }

  const handleKurumPrefix = (prefix: string, kurumId: string) => {
    const fasikuller = FASIKULLER_MAP[kurumId] || FASIKULLER_MAP.ÇŞB
    setFormData((prev) => {
      let currentNo = prev.poz_no || ''
      if (!currentNo || currentNo.includes('.')) {
        currentNo = prefix
      }
      return {
        ...prev,
        poz_kurumu: kurumId,
        kategori: kurumId,
        fasikul: fasikuller[0] || prev.fasikul,
        poz_no: currentNo
      }
    })
  }

  // Fiyat geçmişi satır yönetimi
  const handleAddFiyatRow = () => {
    const currentYear = formData.poz_yili || new Date().getFullYear()
    const nextDonem = `${currentYear}/${fiyatListesi.length + 1}`
    setFiyatListesi((prev) => [{ donem: nextDonem, fiyat: 0 }, ...prev])
  }

  const handleUpdateFiyatRow = (index: number, field: keyof PozFiyatGecmisi, value: any) => {
    setFiyatListesi((prev) => {
      const updated = [...prev]
      updated[index] = {
        ...updated[index],
        [field]: field === 'fiyat' ? Number(value) || 0 : value
      }
      // İlk satırın fiyatını ana fiyata eşitle
      if (index === 0 && field === 'fiyat') {
        setFormData((f) => ({ ...f, birim_fiyat: Number(value) || 0 }))
      }
      if (index === 0 && field === 'donem') {
        setFormData((f) => ({ ...f, fiyat_donemi: String(value) }))
      }
      return updated
    })
  }

  const handleDeleteFiyatRow = (index: number) => {
    setFiyatListesi((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.poz_no?.trim()) {
      showToast('Lütfen Poz Numarasını giriniz.')
      return
    }

    if (!formData.kalem_adi?.trim() && !formData.poz_tanimi?.trim()) {
      showToast('Lütfen İmalat / Poz Tanımını giriniz.')
      return
    }

    setIsSaving(true)
    try {
      const guncelFiyat = fiyatListesi.length > 0 ? fiyatListesi[0].fiyat : (Number(formData.birim_fiyat) || 0)
      const guncelDonem = fiyatListesi.length > 0 ? fiyatListesi[0].donem : (formData.fiyat_donemi || '2026/1')

      const payload: Partial<PozItem> = {
        ...formData,
        kalem_adi: formData.kalem_adi?.trim() || formData.poz_tanimi?.trim() || formData.poz_no,
        poz_tanimi: formData.ozelligi?.trim() || formData.poz_tanimi?.trim() || formData.kalem_adi?.trim() || '',
        eski_poz_no: formData.eski_poz_no?.trim() || null,
        fasikul: formData.fasikul?.trim() || 'Çevre ve Şehircilik Bakanlığı 2019 ve Sonrası',
        poz_tipi: formData.poz_tipi || 'Analiz',
        poz_kurumu: formData.poz_kurumu || formData.kategori || 'ÇŞB',
        kategori: formData.poz_kurumu || formData.kategori || 'ÇŞB',
        birim: formData.birim || 'm²',
        olcu_birimi: formData.birim || 'm²',
        poz_yili: formData.poz_yili || new Date().getFullYear(),
        fiyat_donemi: guncelDonem,
        birim_fiyat: guncelFiyat,
        birim_fiyatlar: JSON.stringify(fiyatListesi),
        kdv_orani: Number(formData.kdv_orani) ?? 20,
        aktif_mi: formData.aktif_mi ?? 1
      }

      if (editId) {
        await updatePoz({ id: editId, data: payload })
        showToast('Birim fiyat pozu ve fiyat geçmişi güncellendi.')
      } else {
        await addPoz(payload as Omit<PozItem, 'id'>)
        showToast('Yeni birim fiyat pozu ve fiyat geçmişi kaydedildi.')
      }

      setTimeout(() => {
        navigate({ to: APP_ROUTES.POZLAR })
      }, 600)
    } catch (err: any) {
      alert('Kaydedilirken hata oluştu: ' + (err?.message || 'Bilinmeyen hata'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="p-4 sm:p-8 max-w-[1550px] mx-auto space-y-6 animate-in fade-in pb-20">
      {/* Toast Bildirimi */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in slide-in-from-top-4">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Üst Bar / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate({ to: APP_ROUTES.POZLAR })}
            className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
            title="Poz Listesine Geri Dön"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60">
                {editId ? 'DÜZENLEME MODU' : 'YENİ POZ TANIMI'}
              </span>
              <span className="text-xs text-slate-400">/</span>
              <span className="text-xs text-slate-500 font-medium">Birim Fiyat Kitapları & Fasiküller</span>
            </div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              {editId ? 'Birim Fiyat Pozunu Düzenle' : 'Yeni Birim Fiyat Pozu Tanımla'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Fasikül, kitap, eski/yeni poz numarası eşleşmesi, analiz/rayiç tipi ve dönemsel birim fiyatları yönetin.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate({ to: APP_ROUTES.POZLAR })}
            className="gap-2 text-xs"
          >
            <RotateCcw size={14} />
            <span>Vazgeç</span>
          </Button>

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className="bg-amber-600 hover:bg-amber-700 text-white gap-2 text-xs shadow-xs px-5"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save size={15} />
            )}
            <span>{editId ? 'Değişiklikleri Kaydet' : 'Pozu Kaydet'}</span>
          </Button>
        </div>
      </div>

      {/* Sorumluluk ve Rehber Bilgilendirme Bannerı */}
      <div className="p-4 bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl text-xs flex items-start gap-3 text-amber-900 dark:text-amber-200">
        <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-xl text-amber-700 dark:text-amber-400 shrink-0 mt-0.5">
          <AlertTriangle size={18} />
        </div>
        <div className="flex-1 space-y-1">
          <p className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2">
            <span>Eski/Yeni Poz Eşleşmesi & Fasikül Rayiç Takibi</span>
          </p>
          <p className="text-[11px] text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
            2019 yılında yürürlüğe giren yeni poz kod sistemi (örn: <code className="font-bold">15.110.1001</code>) ile önceki bülten poz kodları (örn: <code className="font-bold">14.040/1</code>) arasında eşleşme kurarak aramalarda her iki kodla da hızlıca ulaşabilirsiniz. Girdiğiniz dönemsel birim fiyatlar yaklaşık maliyet ve hakediş hesaplamalarında doğrudan kullanılır.
          </p>
        </div>
      </div>

      {/* Ana Form ve Sağ Önizleme Paneli */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sol / Ana Form Alanı (7 Kolon) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Kart 1: Poz No, Eski Poz No & Kurum Bilgileri */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                <Building2 size={18} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  1. Temel Poz, Kurum & Fasikül Bilgileri
                </h2>
                <p className="text-[11px] text-slate-500">
                  Yeni poz no, eski poz no ilişkisi, yayımlayan kurum ve fasikül seçimi
                </p>
              </div>
            </div>

            {/* Hızlı Kurum Seçicisi */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Resmî Bakanlık / İdare Birim Fiyat Kitabı <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {POZ_KURUMLARI.filter((k) => k.id !== 'ALL').map((kurum) => {
                  const isSelected = (formData.poz_kurumu || formData.kategori) === kurum.id
                  return (
                    <button
                      key={kurum.id}
                      type="button"
                      onClick={() => handleKurumPrefix(kurum.id === 'ÇŞB' ? '15.' : kurum.id === 'KGM' ? '04.' : kurum.id === 'DSİ' ? '07.' : kurum.id === 'İLBANK' ? '18.' : 'ÖZEL.', kurum.id)}
                      className={cn(
                        'p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-1',
                        isSelected
                          ? 'border-amber-600 bg-amber-50/60 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 shadow-xs ring-1 ring-amber-500'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs">{kurum.badge}</span>
                        {isSelected && <Check size={14} className="text-amber-600" />}
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        {kurum.name}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Poz No & Eski Poz No */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-6 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Yeni Poz No <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] text-amber-600 font-mono font-bold">2019+ Formatı</span>
                </div>
                <input
                  type="text"
                  value={formData.poz_no || ''}
                  onChange={(e) => setFormData({ ...formData, poz_no: e.target.value })}
                  placeholder="Örn: 15.110.1001"
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div className="sm:col-span-6 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Link2 size={13} className="text-blue-500" />
                    <span>Eski Poz No / Dönüşen Kod</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">2018 Öncesi</span>
                </div>
                <input
                  type="text"
                  value={formData.eski_poz_no || ''}
                  onChange={(e) => setFormData({ ...formData, eski_poz_no: e.target.value })}
                  placeholder="Örn: 14.040/1"
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono font-bold text-blue-700 dark:text-blue-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Bulunduğu Kitap / Fasikül ve Poz Tipi */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-7 space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <BookOpen size={13} className="text-slate-400" />
                  <span>Bulunduğu Kitap & Fasikül</span>
                </label>
                <input
                  type="text"
                  list="fasikul-datalist"
                  value={formData.fasikul || ''}
                  onChange={(e) => setFormData({ ...formData, fasikul: e.target.value })}
                  placeholder="Örn: Çevre ve Şehircilik Bakanlığı 2019 ve Sonrası"
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                />
                <datalist id="fasikul-datalist">
                  {aktifFasikuller.map((fas, i) => (
                    <option key={i} value={fas} />
                  ))}
                </datalist>
              </div>

              <div className="sm:col-span-5 space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Layers size={13} className="text-slate-400" />
                  <span>Pozun Tipi</span>
                </label>
                <select
                  value={formData.poz_tipi || 'Analiz'}
                  onChange={(e) => setFormData({ ...formData, poz_tipi: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                >
                  {POZ_TIPLERI.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.ad}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Ölçü Birimi, Bülten Yılı & KDV */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Ölçü Birimi <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.birim || 'm³'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      birim: e.target.value,
                      olcu_birimi: e.target.value
                    })
                  }
                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                >
                  {OLCU_BIRIMLERI_LIST.map((b) => (
                    <option key={b.kod} value={b.kod}>
                      {b.ad}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Poz / Bülten Yılı
                </label>
                <select
                  value={formData.poz_yili || new Date().getFullYear()}
                  onChange={(e) => {
                    const yil = Number(e.target.value) || new Date().getFullYear()
                    setFormData((prev) => ({
                      ...prev,
                      poz_yili: yil
                    }))
                  }}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                >
                  <option value="2026">2026 Yılı</option>
                  <option value="2025">2025 Yılı</option>
                  <option value="2024">2024 Yılı</option>
                  <option value="2023">2023 Yılı</option>
                  <option value="2022">2022 Yılı</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  KDV Oranı (%)
                </label>
                <select
                  value={formData.kdv_orani ?? 20}
                  onChange={(e) => setFormData({ ...formData, kdv_orani: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                >
                  <option value={20}>%20 KDV</option>
                  <option value={10}>%10 KDV</option>
                  <option value={1}>%1 KDV</option>
                  <option value={0}>%0 (Muaf)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Kart 2: İmalat Tanımı ve Uzun Tanım (Teknik Şartname) */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                <FileText size={18} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  2. İmalat Tanımı & Uzun Teknik Tarifi
                </h2>
                <p className="text-[11px] text-slate-500">
                  Resmî kısa tanım, teknik tarif şartname metni ve özel notlar
                </p>
              </div>
            </div>

            {/* Kısa Tanım */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Tanım (Kısa Başlık / İmalat Adı) <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={2}
                value={formData.kalem_adi || formData.poz_tanimi || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    kalem_adi: e.target.value,
                    poz_tanimi: e.target.value
                  })
                }
                placeholder="Örn: Her cins zeminde el ile yapılan (geniş-dar) derin kazılarda derinlik zammı..."
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            {/* Uzun Tanım */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Uzun Tanım (Teknik Şartname & Kapsam Metni)
              </label>
              <textarea
                value={formData.ozelligi || ''}
                onChange={(e) => setFormData({ ...formData, ozelligi: e.target.value })}
                rows={4}
                placeholder="Her cins zeminde el ile yapılan (geniş-dar) derin kazılara derinlik zammı (iksasız kazılarda) F=103,125 x H -206,25 (%25 yüklenici kârı ve genel giderler dahil)..."
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white leading-relaxed focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Yapı Sınıfı & OKAS Kodu */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Yapı Sınıfı
                </label>
                <select
                  value={formData.yapi_sinifi || 'Genel Yapım İşleri'}
                  onChange={(e) => setFormData({ ...formData, yapi_sinifi: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                >
                  {YAPI_SINIFLARI_LIST.map((ys) => (
                    <option key={ys} value={ys}>
                      {ys}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  OKAS / CPV Kodu
                </label>
                <input
                  type="text"
                  value={formData.okas_kodu || ''}
                  onChange={(e) => setFormData({ ...formData, okas_kodu: e.target.value })}
                  placeholder="Örn: 45000000"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Kart 3: Dönemsel Birim Fiyatlar Tablosu & Fiyat Geçmişi */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                  <DollarSign size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    3. Dönemsel Birim Fiyatlar & Fiyat Geçmişi
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Bakanlık/İdare bülten dönemlerine göre birim fiyatları (TL) girin
                  </p>
                </div>
              </div>

              <Button
                type="button"
                onClick={handleAddFiyatRow}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs py-1.5 px-3"
              >
                <Plus size={14} />
                <span>Dönem / Fiyat Ekle</span>
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-2.5 pl-3">Birim Fiyat Tarihi / Dönemi</th>
                    <th className="p-2.5">Birim Fiyatı (TL)</th>
                    <th className="p-2.5 text-right pr-3">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {fiyatListesi.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-2.5 pl-3">
                        <input
                          type="text"
                          value={row.donem}
                          onChange={(e) => handleUpdateFiyatRow(idx, 'donem', e.target.value)}
                          placeholder="Örn: 2026/1"
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-white"
                        />
                      </td>
                      <td className="p-2.5">
                        <div className="relative">
                          <input
                            type="number"
                            step="0.01"
                            value={row.fiyat || ''}
                            onChange={(e) => handleUpdateFiyatRow(idx, 'fiyat', e.target.value)}
                            placeholder="0.00"
                            className="w-full px-2.5 py-1.5 pr-8 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-bold text-slate-900 dark:text-white"
                          />
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                            ₺
                          </span>
                        </div>
                      </td>
                      <td className="p-2.5 text-right pr-3">
                        <button
                          type="button"
                          onClick={() => handleDeleteFiyatRow(idx)}
                          disabled={fiyatListesi.length <= 1}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors disabled:opacity-20"
                          title="Satırı Sil"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sağ Panel / Canlı Önizleme & Görsel Düzen (5 Kolon) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Canlı Görsel Önizleme: Turuncu Başlıklı Detay Kartı (Kullanıcının İstediği Birebir Tasarım) */}
          <div className="space-y-5 sticky top-6">
            {/* 1. KART: Pozu Detay Bilgileri */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
              <div className="bg-[#f97316] text-white px-5 py-3 font-bold text-sm flex items-center justify-between">
                <span>{formData.poz_no ? `${formData.poz_no} Pozu Detay Bilgileri` : 'Poz Detay Bilgileri (Önizleme)'}</span>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded uppercase font-extrabold tracking-wider">
                  {formData.poz_kurumu || 'ÇŞB'}
                </span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {/* Poz No & Eski Poz No */}
                <div className="grid grid-cols-12 p-3.5 bg-slate-50/50 dark:bg-slate-950/40">
                  <div className="col-span-4 font-bold text-slate-500">Poz No</div>
                  <div className="col-span-8 font-mono font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{formData.poz_no || '-'}</span>
                    {formData.eski_poz_no && (
                      <span className="text-blue-600 dark:text-blue-400 font-semibold underline underline-offset-2 text-[11px]">
                        Eski Poz No : {formData.eski_poz_no}
                      </span>
                    )}
                  </div>
                </div>

                {/* Tanım */}
                <div className="grid grid-cols-12 p-3.5">
                  <div className="col-span-4 font-bold text-slate-500">Tanım</div>
                  <div className="col-span-8 text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                    {formData.kalem_adi || formData.poz_tanimi || '-'}
                  </div>
                </div>

                {/* Uzun Tanım */}
                <div className="grid grid-cols-12 p-3.5 bg-slate-50/50 dark:bg-slate-950/40">
                  <div className="col-span-4 font-bold text-slate-500">Uzun Tanım</div>
                  <div className="col-span-8 text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
                    {formData.ozelligi || formData.kalem_adi || formData.poz_tanimi || '-'}
                  </div>
                </div>

                {/* Birim */}
                <div className="grid grid-cols-12 p-3.5">
                  <div className="col-span-4 font-bold text-slate-500">Birim</div>
                  <div className="col-span-8 font-bold font-mono text-slate-900 dark:text-white uppercase">
                    {formData.birim || 'M3'}
                  </div>
                </div>

                {/* Pozun Tipi */}
                <div className="grid grid-cols-12 p-3.5 bg-slate-50/50 dark:bg-slate-950/40">
                  <div className="col-span-4 font-bold text-slate-500">Pozun Tipi</div>
                  <div className="col-span-8 font-semibold text-slate-900 dark:text-white">
                    {formData.poz_tipi || 'Analiz'}
                  </div>
                </div>

                {/* Bulunduğu Kitap */}
                <div className="grid grid-cols-12 p-3.5">
                  <div className="col-span-4 font-bold text-slate-500">Bulunduğu Kitap</div>
                  <div className="col-span-8 font-semibold text-slate-900 dark:text-white">
                    {formData.fasikul || 'Çevre ve Şehircilik Bakanlığı 2019 ve Sonrası'}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. KART: Pozu Birim Fiyatları */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
              <div className="bg-[#f97316] text-white px-5 py-3 font-bold text-sm flex items-center justify-between">
                <span>{formData.poz_no ? `${formData.poz_no} Pozu Birim Fiyatları` : 'Poz Birim Fiyatları (Önizleme)'}</span>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-mono">
                  {fiyatListesi.length} Dönem
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold">
                    <tr>
                      <th className="p-3 pl-4">Birim Fiyat Tarihi</th>
                      <th className="p-3 text-right pr-4">Birim Fiyatı (TL)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                    {fiyatListesi.length === 0 ? (
                      <tr>
                        <td colSpan={2} className="p-4 text-center text-slate-400">
                          Henüz birim fiyat girilmedi.
                        </td>
                      </tr>
                    ) : (
                      fiyatListesi.map((f, i) => (
                        <tr key={i} className="hover:bg-amber-50/20 dark:hover:bg-amber-950/20">
                          <td className="p-3 pl-4 font-semibold text-slate-800 dark:text-slate-200">
                            {f.donem || '-'}
                          </td>
                          <td className="p-3 text-right pr-4 font-bold text-emerald-600 dark:text-emerald-400">
                            {Number(f.fiyat || 0).toLocaleString('tr-TR', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}{' '}
                            TL
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Hızlı Şablonlar */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-500" />
                <span>Hazır Örnek Poz Şablonları</span>
              </span>
              <div className="space-y-1.5">
                {ORNEK_POZ_SABLONLARI.map((tpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyTemplate(tpl)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-400 hover:bg-amber-50/40 dark:hover:bg-amber-950/20 text-left transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-amber-700 dark:group-hover:text-amber-300">
                        {tpl.baslik}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 font-bold">
                          {tpl.poz_no}
                        </span>
                        {tpl.eski_poz_no && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                            {tpl.eski_poz_no}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 line-clamp-1 mt-0.5 block">
                      {tpl.kalem_adi}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Kaydet Butonu */}
            <Button
              type="submit"
              disabled={isSaving}
              className="w-full bg-[#f97316] hover:bg-orange-600 text-white gap-2 text-xs py-3 shadow-md font-bold"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save size={16} />
              )}
              <span>{editId ? 'Değişiklikleri Kaydet' : 'Pozu & Fiyat Geçmişini Sisteme Ekle'}</span>
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

import React, { useState } from 'react'
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  CloudDownload,
  Copy,
  Download,
  FileSpreadsheet,
  FileText,
  Info,
  Layers,
  Link2,
  Plus,
  RefreshCw,
  Save,
  Sparkles,
  Table as TableIcon,
  Trash2,
  Upload
} from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import * as XLSX from 'xlsx'
import { PozItem, usePozlarHooks } from './pozlar.hooks'
import { APP_ROUTES } from '../../constants/routeConstants'
import { Button } from '../../components/ui/Button'
import { cn } from '../../utils/cn'

const GithubIcon = ({ size = 15, className = '' }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
)

export interface TopluPozRow {
  id: string
  poz_no: string
  eski_poz_no: string
  kalem_adi: string
  birim: string
  poz_tipi: string
  poz_kurumu: string
  fasikul: string
  birim_fiyat: number | string
  fiyat_donemi: string
  okas_kodu: string
  yapi_sinifi: string
  kdv_orani: number
  ozelligi: string
}

const DEFAULT_GITHUB_RAW_URL =
  'https://raw.githubusercontent.com/ilyasbozdemir/temin-360-app/main/catalogs/pozlar.json'

const ORNEK_GITHUB_JSON_DATA = [
  {
    poz_no: '15.110.1001',
    eski_poz_no: '14.040/1',
    kalem_adi: 'Her cins zeminde el ile yapılan (geniş-dar) derin kazılarda derinlik zammı',
    birim: 'm³',
    poz_tipi: 'Analiz',
    poz_kurumu: 'ÇŞB',
    fasikul: 'Çevre ve Şehircilik Bakanlığı 2019 ve Sonrası',
    birim_fiyat: 425.5,
    fiyat_donemi: '2026/1',
    okas_kodu: '45112000',
    yapi_sinifi: 'İnşaat İmalatları (Kaba & İnce İşler)',
    kdv_orani: 20,
    ozelligi:
      'Her cins zeminde el ile yapılan derin kazılara derinlik zammı (%25 yüklenici kârı dahil)',
    birim_fiyatlar: [
      { donem: '2026/1', fiyat: 425.5 },
      { donem: '2025/2', fiyat: 365.0 },
      { donem: '2025/1', fiyat: 310.25 }
    ]
  },
  {
    poz_no: '15.150.1005',
    eski_poz_no: '16.025/C',
    kalem_adi: 'Basınç dayanım sınıfı C 25/30 olan hazır beton dökülmesi',
    birim: 'm³',
    poz_tipi: 'Analiz',
    poz_kurumu: 'ÇŞB',
    fasikul: '15. İnşaat İmalatları Fasikülü',
    birim_fiyat: 2850.0,
    fiyat_donemi: '2026/1',
    okas_kodu: '45000000',
    yapi_sinifi: 'İnşaat İmalatları (Kaba & İnce İşler)',
    kdv_orani: 20,
    ozelligi: 'Beton pompası ve mikser ile yerleştirme dahil.',
    birim_fiyatlar: [
      { donem: '2026/1', fiyat: 2850.0 },
      { donem: '2025/2', fiyat: 2450.0 }
    ]
  },
  {
    poz_no: '04.100.1002',
    eski_poz_no: 'KGM/1200',
    kalem_adi: 'Karayolu sanat yapıları için kazı ve dolgu yapılması',
    birim: 'm³',
    poz_tipi: 'Analiz',
    poz_kurumu: 'KGM',
    fasikul: '04. Karayolları Yol Yapım ve Köprü Fasikülü',
    birim_fiyat: 185.0,
    fiyat_donemi: '2026/1',
    okas_kodu: '45233140',
    yapi_sinifi: 'Altyapı, Yol, Köprü ve Sanat Yapıları',
    kdv_orani: 20,
    ozelligi: 'KGM teknik şartnamesine uygun olarak.',
    birim_fiyatlar: [{ donem: '2026/1', fiyat: 185.0 }]
  }
]

const createEmptyRow = (): TopluPozRow => ({
  id: Math.random().toString(36).substring(2, 9),
  poz_no: '',
  eski_poz_no: '',
  kalem_adi: '',
  birim: 'm³',
  poz_tipi: 'Analiz',
  poz_kurumu: 'ÇŞB',
  fasikul: 'Çevre ve Şehircilik Bakanlığı 2019 ve Sonrası',
  birim_fiyat: '',
  fiyat_donemi: '2026/1',
  okas_kodu: '45000000',
  yapi_sinifi: 'Genel Yapım İşleri',
  kdv_orani: 20,
  ozelligi: ''
})

export default function TopluPozEkleScreen(): React.JSX.Element {
  const navigate = useNavigate()
  const { bulkAddPoz } = usePozlarHooks()

  const [activeTab, setActiveTab] = useState<'excel_grid' | 'github_sync' | 'raw_paste'>(
    'excel_grid'
  )

  // Excel Grid Satırları
  const [rows, setRows] = useState<TopluPozRow[]>([
    createEmptyRow(),
    createEmptyRow(),
    createEmptyRow(),
    createEmptyRow(),
    createEmptyRow()
  ])

  // GitHub Sync State
  const [githubUrl, setGithubUrl] = useState(DEFAULT_GITHUB_RAW_URL)
  const [isFetchingGithub, setIsFetchingGithub] = useState(false)
  const [githubFetchedData, setGithubFetchedData] = useState<any[] | null>(null)
  const [githubFetchError, setGithubFetchError] = useState<string | null>(null)

  // Metin Yapıştırma State
  const [pasteText, setPasteText] = useState('')

  // Durum
  const [isSaving, setIsSaving] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Row Manipulation
  const handleAddRow = () => {
    setRows((prev) => [...prev, createEmptyRow()])
  }

  const handleAddMultipleRows = (count: number) => {
    const newItems = Array.from({ length: count }, () => createEmptyRow())
    setRows((prev) => [...prev, ...newItems])
  }

  const handleUpdateRow = (id: string, field: keyof TopluPozRow, value: any) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)))
  }

  const handleDeleteRow = (id: string) => {
    if (rows.length <= 1) {
      setRows([createEmptyRow()])
      return
    }
    setRows((prev) => prev.filter((r) => r.id !== id))
  }

  const handleClearAll = () => {
    if (confirm('Tablodaki tüm satırları temizlemek istediğinize emin misiniz?')) {
      setRows([createEmptyRow(), createEmptyRow(), createEmptyRow()])
    }
  }

  // Excel Şablon İndirme
  const handleDownloadExcelTemplate = () => {
    const templateData = [
      {
        'Poz No (*)': '15.110.1001',
        'Eski Poz No': '14.040/1',
        'İmalat / Poz Tanımı (*)':
          'Her cins zeminde el ile yapılan (geniş-dar) derin kazılarda derinlik zammı',
        'Birim (*)': 'm³',
        'Poz Tipi': 'Analiz',
        Kurum: 'ÇŞB',
        Fasikül: 'Çevre ve Şehircilik Bakanlığı 2019 ve Sonrası',
        'Güncel Birim Fiyat (TL)': 425.5,
        'Fiyat Dönemi': '2026/1',
        'OKAS Kodu': '45112000',
        'Yapı Sınıfı': 'İnşaat İmalatları (Kaba & İnce İşler)',
        'KDV Oranı (%)': 20,
        'Teknik Şartname / Açıklama': 'Derin kazı zammı analiz formülü dahil.'
      },
      {
        'Poz No (*)': '15.150.1005',
        'Eski Poz No': '16.025/C',
        'İmalat / Poz Tanımı (*)': 'Basınç dayanım sınıfı C 25/30 olan hazır beton dökülmesi',
        'Birim (*)': 'm³',
        'Poz Tipi': 'Analiz',
        Kurum: 'ÇŞB',
        Fasikül: '15. İnşaat İmalatları Fasikülü',
        'Güncel Birim Fiyat (TL)': 2850.0,
        'Fiyat Dönemi': '2026/1',
        'OKAS Kodu': '45000000',
        'Yapı Sınıfı': 'İnşaat İmalatları (Kaba & İnce İşler)',
        'KDV Oranı (%)': 20,
        'Teknik Şartname / Açıklama': 'Mikser ve pompa ile döküm.'
      }
    ]

    const ws = XLSX.utils.json_to_sheet(templateData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Birim_Fiyat_Pozlari')
    XLSX.writeFile(wb, 'Toplu_Birim_Fiyat_Poz_Sablonu.xlsx')
    showToast('Excel şablon dosyası indirildi.')
  }

  // Excel Dosyası Yükleme
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result
        const wb = XLSX.read(bstr, { type: 'binary' })
        const wsname = wb.SheetNames[0]
        const ws = wb.Sheets[wsname]
        const data: any[] = XLSX.utils.sheet_to_json(ws)

        if (data.length === 0) {
          alert('Excel dosyasında veri bulunamadı.')
          return
        }

        const parsedRows: TopluPozRow[] = data.map((item) => {
          const poz_no =
            item['Poz No (*)'] || item['Poz No'] || item['poz_no'] || item['POZ NO'] || ''
          const eski_poz_no =
            item['Eski Poz No'] || item['eski_poz_no'] || item['ESKİ POZ NO'] || ''
          const kalem_adi =
            item['İmalat / Poz Tanımı (*)'] ||
            item['Tanım'] ||
            item['İmalat Tanımı'] ||
            item['kalem_adi'] ||
            item['poz_tanimi'] ||
            ''
          const birim = item['Birim (*)'] || item['Birim'] || item['birim'] || 'm³'
          const poz_tipi = item['Poz Tipi'] || item['poz_tipi'] || 'Analiz'
          const poz_kurumu = item['Kurum'] || item['poz_kurumu'] || item['Kategori'] || 'ÇŞB'
          const fasikul =
            item['Fasikül'] ||
            item['fasikul'] ||
            'Çevre ve Şehircilik Bakanlığı 2019 ve Sonrası'
          const birim_fiyat =
            item['Güncel Birim Fiyat (TL)'] ||
            item['Birim Fiyat'] ||
            item['Fiyat'] ||
            item['birim_fiyat'] ||
            0
          const fiyat_donemi =
            item['Fiyat Dönemi'] || item['fiyat_donemi'] || item['Dönem'] || '2026/1'
          const okas_kodu = item['OKAS Kodu'] || item['okas_kodu'] || '45000000'
          const yapi_sinifi = item['Yapı Sınıfı'] || item['yapi_sinifi'] || 'Genel Yapım İşleri'
          const kdv_orani = Number(item['KDV Oranı (%)'] || item['kdv_orani'] || 20)
          const ozelligi =
            item['Teknik Şartname / Açıklama'] || item['Açıklama'] || item['ozelligi'] || ''

          return {
            id: Math.random().toString(36).substring(2, 9),
            poz_no: String(poz_no).trim(),
            eski_poz_no: String(eski_poz_no).trim(),
            kalem_adi: String(kalem_adi).trim(),
            birim: String(birim).trim() || 'm³',
            poz_tipi: String(poz_tipi).trim() || 'Analiz',
            poz_kurumu: String(poz_kurumu).trim() || 'ÇŞB',
            fasikul: String(fasikul).trim(),
            birim_fiyat: Number(birim_fiyat) || 0,
            fiyat_donemi: String(fiyat_donemi).trim(),
            okas_kodu: String(okas_kodu).trim(),
            yapi_sinifi: String(yapi_sinifi).trim(),
            kdv_orani: isNaN(kdv_orani) ? 20 : kdv_orani,
            ozelligi: String(ozelligi).trim()
          }
        })

        setRows(parsedRows)
        showToast(`Excel dosyasından ${parsedRows.length} adet poz aktarıldı!`)
      } catch (err: any) {
        alert('Excel dosyası okunurken hata oluştu: ' + err.message)
      }
    }
    reader.readAsBinaryString(file)
  }

  // TSV / Metin / Clipboard Yapıştırma
  const handleParsePastedText = () => {
    if (!pasteText.trim()) return

    // JSON array kontrolü
    if (pasteText.trim().startsWith('[')) {
      try {
        const json = JSON.parse(pasteText.trim())
        if (Array.isArray(json)) {
          const parsedRows: TopluPozRow[] = json.map((item) => ({
            id: Math.random().toString(36).substring(2, 9),
            poz_no: item.poz_no || '',
            eski_poz_no: item.eski_poz_no || '',
            kalem_adi: item.kalem_adi || item.poz_tanimi || '',
            birim: item.birim || item.olcu_birimi || 'm³',
            poz_tipi: item.poz_tipi || 'Analiz',
            poz_kurumu: item.poz_kurumu || item.kategori || 'ÇŞB',
            fasikul: item.fasikul || 'Çevre ve Şehircilik Bakanlığı 2019 ve Sonrası',
            birim_fiyat: Number(item.birim_fiyat) || 0,
            fiyat_donemi: item.fiyat_donemi || '2026/1',
            okas_kodu: item.okas_kodu || '45000000',
            yapi_sinifi: item.yapi_sinifi || 'Genel Yapım İşleri',
            kdv_orani: Number(item.kdv_orani) || 20,
            ozelligi: item.ozelligi || item.notlar || ''
          }))
          setRows(parsedRows)
          setActiveTab('excel_grid')
          showToast(`${parsedRows.length} adet JSON poz kaydı tabloya yüklendi!`)
          return
        }
      } catch {
        // Fallback TSV parser below
      }
    }

    // TSV / Tab-separated lines (Excel'den kopyalanan satırlar)
    const lines = pasteText.trim().split('\n')
    const parsedRows: TopluPozRow[] = lines.map((line) => {
      const parts = line.split('\t')
      return {
        id: Math.random().toString(36).substring(2, 9),
        poz_no: parts[0]?.trim() || '',
        eski_poz_no: parts[1]?.trim() || '',
        kalem_adi: parts[2]?.trim() || '',
        birim: parts[3]?.trim() || 'm³',
        birim_fiyat: Number(parts[4]?.trim().replace(',', '.')) || 0,
        fiyat_donemi: parts[5]?.trim() || '2026/1',
        poz_tipi: parts[6]?.trim() || 'Analiz',
        poz_kurumu: parts[7]?.trim() || 'ÇŞB',
        fasikul: parts[8]?.trim() || 'Çevre ve Şehircilik Bakanlığı 2019 ve Sonrası',
        okas_kodu: parts[9]?.trim() || '45000000',
        yapi_sinifi: 'Genel Yapım İşleri',
        kdv_orani: 20,
        ozelligi: ''
      }
    })

    if (parsedRows.length > 0) {
      setRows(parsedRows)
      setActiveTab('excel_grid')
      showToast(`${parsedRows.length} satır Excel verisi tabloya yerleştirildi!`)
    }
  }

  // GitHub'dan Raw JSON Çekme
  const handleFetchFromGithub = async () => {
    if (!githubUrl.trim()) return

    setIsFetchingGithub(true)
    setGithubFetchError(null)
    try {
      const res = await fetch(githubUrl.trim(), { cache: 'no-store' })
      if (!res.ok) {
        throw new Error(`HTTP Hata ${res.status}: ${res.statusText}`)
      }
      const data = await res.json()
      if (!Array.isArray(data)) {
        throw new Error('GitHub verisi beklenen JSON dizi (array) formatında değil.')
      }

      setGithubFetchedData(data)
      showToast(`GitHub'dan ${data.length} adet poz kaydı başarıyla çekildi!`)
    } catch (err: any) {
      setGithubFetchError(err.message || 'GitHub bağlantısı kurulamadı.')
    } finally {
      setIsFetchingGithub(false)
    }
  }

  // GitHub Verilerini Tabloya Aktar
  const handleTransferGithubToGrid = () => {
    if (!githubFetchedData || githubFetchedData.length === 0) return

    const parsedRows: TopluPozRow[] = githubFetchedData.map((item) => ({
      id: Math.random().toString(36).substring(2, 9),
      poz_no: item.poz_no || '',
      eski_poz_no: item.eski_poz_no || '',
      kalem_adi: item.kalem_adi || item.poz_tanimi || '',
      birim: item.birim || item.olcu_birimi || 'm³',
      poz_tipi: item.poz_tipi || 'Analiz',
      poz_kurumu: item.poz_kurumu || item.kategori || 'ÇŞB',
      fasikul: item.fasikul || 'Çevre ve Şehircilik Bakanlığı 2019 ve Sonrası',
      birim_fiyat: Number(item.birim_fiyat) || 0,
      fiyat_donemi: item.fiyat_donemi || '2026/1',
      okas_kodu: item.okas_kodu || '45000000',
      yapi_sinifi: item.yapi_sinifi || 'Genel Yapım İşleri',
      kdv_orani: Number(item.kdv_orani) || 20,
      ozelligi: item.ozelligi || item.notlar || ''
    }))

    setRows(parsedRows)
    setActiveTab('excel_grid')
    showToast(`GitHub'dan alınan ${parsedRows.length} poz düzenleme tablosuna aktarıldı.`)
  }

  // Örnek JSON Formatını Panoya Kopyala
  const handleCopyJsonTemplate = () => {
    const formatted = JSON.stringify(ORNEK_GITHUB_JSON_DATA, null, 2)
    navigator.clipboard.writeText(formatted)
    showToast('Örnek GitHub pozlar.json formatı panoya kopyalandı!')
  }

  // Toplu Kaydet (SQLite Veritabanına Yaz)
  const handleBulkSave = async () => {
    const validRows = rows.filter((r) => r.poz_no.trim() || r.kalem_adi.trim())

    if (validRows.length === 0) {
      alert('Kaydedilecek geçerli bir poz satırı bulunamadı.')
      return
    }

    setIsSaving(true)
    try {
      const payloadList: Omit<PozItem, 'id'>[] = validRows.map((r) => ({
        poz_no: r.poz_no.trim(),
        eski_poz_no: r.eski_poz_no.trim() || null,
        kalem_adi: r.kalem_adi.trim() || r.poz_no.trim(),
        poz_tanimi: r.ozelligi.trim() || r.kalem_adi.trim(),
        birim: r.birim.trim() || 'm³',
        olcu_birimi: r.birim.trim() || 'm³',
        poz_tipi: r.poz_tipi.trim() || 'Analiz',
        poz_kurumu: r.poz_kurumu.trim() || 'ÇŞB',
        kategori: r.poz_kurumu.trim() || 'ÇŞB',
        fasikul: r.fasikul.trim() || 'Çevre ve Şehircilik Bakanlığı 2019 ve Sonrası',
        birim_fiyat: Number(r.birim_fiyat) || 0,
        fiyat_donemi: r.fiyat_donemi.trim() || '2026/1',
        poz_yili: 2026,
        okas_kodu: r.okas_kodu.trim() || '45000000',
        yapi_sinifi: r.yapi_sinifi.trim() || 'Genel Yapım İşleri',
        kdv_orani: Number(r.kdv_orani) || 20,
        aktif_mi: 1,
        ozelligi: r.ozelligi.trim() || null,
        birim_fiyatlar: JSON.stringify([
          {
            donem: r.fiyat_donemi.trim() || '2026/1',
            fiyat: Number(r.birim_fiyat) || 0
          }
        ])
      }))

      const result = await bulkAddPoz(payloadList)
      showToast(`${result.successCount} adet poz sisteme başarıyla kaydedildi!`)

      setTimeout(() => {
        navigate({ to: APP_ROUTES.POZLAR })
      }, 700)
    } catch (err: any) {
      alert('Toplu kaydetme sırasında hata: ' + (err?.message || 'Bilinmeyen hata'))
    } finally {
      setIsSaving(false)
    }
  }

  const validRowCount = rows.filter((r) => r.poz_no.trim() || r.kalem_adi.trim()).length

  return (
    <div className="p-4 sm:p-8 max-w-[1700px] mx-auto space-y-6 animate-in fade-in pb-20">
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
                TOPLU İŞLEMLER
              </span>
              <span className="text-xs text-slate-400">/</span>
              <span className="text-xs text-slate-500 font-medium">
                Excel & GitHub Çevrimiçi Katalog Entegrasyonu
              </span>
            </div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              Toplu Birim Fiyat Pozu Ekle & Eşitle
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Excel tablosundan toplu veri girin, Excel dosyası yükleyin veya GitHub Raw JSON
              üzerinden güncel pozları tek tıkla sisteme aktarın.
            </p>
          </div>
        </div>

        {/* Aksiyon Butonları */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto flex-wrap">
          <Button
            type="button"
            variant="outline"
            onClick={handleDownloadExcelTemplate}
            className="gap-2 text-xs"
            title="Excel Şablonu (.xlsx) İndir"
          >
            <Download size={14} />
            <span>Excel Şablonu İndir</span>
          </Button>

          <label className="cursor-pointer inline-flex items-center justify-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors">
            <Upload size={14} />
            <span>Excel Dosyası Yükle</span>
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <Button
            type="button"
            onClick={handleBulkSave}
            disabled={isSaving || validRowCount === 0}
            className="bg-amber-600 hover:bg-amber-700 text-white gap-2 text-xs shadow-xs px-5 font-bold"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save size={15} />
            )}
            <span>{validRowCount > 0 ? `${validRowCount} Pozu Kaydet` : 'Tümünü Kaydet'}</span>
          </Button>
        </div>
      </div>

      {/* Mod Sekmeleri */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('excel_grid')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all',
            activeTab === 'excel_grid'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          )}
        >
          <FileSpreadsheet size={15} />
          <span>Excel Benzeri Düzenleme Tablosu ({rows.length} Satır)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('github_sync')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all',
            activeTab === 'github_sync'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          )}
        >
          <GithubIcon size={15} />
          <span>GitHub Çevrimiçi JSON Eşitleme</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('raw_paste')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all',
            activeTab === 'raw_paste'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          )}
        >
          <Copy size={15} />
          <span>Hızlı Metin / TSV / JSON Yapıştır</span>
        </button>
      </div>

      {/* SEKME 1: EXCEL GRID (SPREADSHEET TABLOSU) */}
      {activeTab === 'excel_grid' && (
        <div className="space-y-4">
          {/* Üst Araç Çubuğu */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                type="button"
                onClick={handleAddRow}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs py-1.5 px-3"
              >
                <Plus size={14} />
                <span>+1 Satır Ekle</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => handleAddMultipleRows(5)}
                className="gap-1.5 text-xs py-1.5 px-3"
              >
                <Plus size={14} />
                <span>+5 Satır Ekle</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => handleAddMultipleRows(10)}
                className="gap-1.5 text-xs py-1.5 px-3"
              >
                <Plus size={14} />
                <span>+10 Satır Ekle</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleClearAll}
                className="gap-1.5 text-xs py-1.5 px-3 text-red-600 hover:bg-red-50 border-red-200 dark:border-red-900"
              >
                <Trash2 size={14} />
                <span>Tümünü Temizle</span>
              </Button>
            </div>

            <div className="text-xs text-slate-500 font-semibold flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span>
                Toplam <strong>{rows.length}</strong> satırdan{' '}
                <strong className="text-emerald-600">{validRowCount}</strong> tanesi geçerli veri
                içeriyor.
              </span>
            </div>
          </div>

          {/* Tablo Alanı (Spreadsheet) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto max-h-[650px] scrollbar-thin">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
                  <tr>
                    <th className="p-3 pl-4 w-12 text-center">#</th>
                    <th className="p-3 min-w-[140px]">Poz No *</th>
                    <th className="p-3 min-w-[130px]">Eski Poz No</th>
                    <th className="p-3 min-w-[280px]">İmalat / Poz Tanımı *</th>
                    <th className="p-3 min-w-[100px]">Birim *</th>
                    <th className="p-3 min-w-[120px]">Poz Tipi</th>
                    <th className="p-3 min-w-[110px]">Kurum</th>
                    <th className="p-3 min-w-[200px]">Bulunduğu Fasikül</th>
                    <th className="p-3 min-w-[130px] text-right">Birim Fiyat (TL)</th>
                    <th className="p-3 min-w-[100px]">Dönem</th>
                    <th className="p-3 min-w-[110px]">OKAS Kodu</th>
                    <th className="p-3 min-w-[80px]">KDV %</th>
                    <th className="p-3 pr-4 w-12 text-center">Sil</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-xs">
                  {rows.map((row, idx) => (
                    <tr
                      key={row.id}
                      className={cn(
                        'hover:bg-amber-50/20 dark:hover:bg-amber-950/10 transition-colors',
                        (row.poz_no || row.kalem_adi) && 'bg-emerald-50/10 dark:bg-emerald-950/5'
                      )}
                    >
                      {/* Sıra No */}
                      <td className="p-2 pl-4 text-center font-bold text-slate-400 font-sans">
                        {idx + 1}
                      </td>

                      {/* Poz No */}
                      <td className="p-2">
                        <input
                          type="text"
                          value={row.poz_no}
                          onChange={(e) => handleUpdateRow(row.id, 'poz_no', e.target.value)}
                          placeholder="Örn: 15.110.1001"
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-slate-900 dark:text-white focus:ring-1 focus:ring-amber-500"
                        />
                      </td>

                      {/* Eski Poz No */}
                      <td className="p-2">
                        <input
                          type="text"
                          value={row.eski_poz_no}
                          onChange={(e) => handleUpdateRow(row.id, 'eski_poz_no', e.target.value)}
                          placeholder="Örn: 14.040/1"
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-blue-700 dark:text-blue-300 font-semibold focus:ring-1 focus:ring-blue-500"
                        />
                      </td>

                      {/* İmalat / Poz Tanımı */}
                      <td className="p-2 font-sans">
                        <input
                          type="text"
                          value={row.kalem_adi}
                          onChange={(e) => handleUpdateRow(row.id, 'kalem_adi', e.target.value)}
                          placeholder="İmalat / Poz Tanımı giriniz..."
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium focus:ring-1 focus:ring-amber-500"
                        />
                      </td>

                      {/* Birim */}
                      <td className="p-2">
                        <select
                          value={row.birim}
                          onChange={(e) => handleUpdateRow(row.id, 'birim', e.target.value)}
                          className="w-full px-2 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-slate-900 dark:text-white"
                        >
                          <option value="m³">m³</option>
                          <option value="m²">m²</option>
                          <option value="mt">mt</option>
                          <option value="Adet">Adet</option>
                          <option value="ton">ton</option>
                          <option value="kg">kg</option>
                          <option value="Set">Set</option>
                          <option value="Götürü">Götürü</option>
                          <option value="saat">saat</option>
                          <option value="km">km</option>
                        </select>
                      </td>

                      {/* Poz Tipi */}
                      <td className="p-2">
                        <select
                          value={row.poz_tipi}
                          onChange={(e) => handleUpdateRow(row.id, 'poz_tipi', e.target.value)}
                          className="w-full px-2 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold"
                        >
                          <option value="Analiz">Analiz</option>
                          <option value="Rayiç">Rayiç</option>
                          <option value="İmalat">İmalat</option>
                          <option value="Montaj">Montaj</option>
                          <option value="Özel">Özel Poz</option>
                        </select>
                      </td>

                      {/* Kurum */}
                      <td className="p-2">
                        <select
                          value={row.poz_kurumu}
                          onChange={(e) => handleUpdateRow(row.id, 'poz_kurumu', e.target.value)}
                          className="w-full px-2 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-xs"
                        >
                          <option value="ÇŞB">ÇŞB</option>
                          <option value="KGM">KGM</option>
                          <option value="DSİ">DSİ</option>
                          <option value="İLBANK">İLBANK</option>
                          <option value="VAKIF">VAKIF</option>
                          <option value="ÖZEL">ÖZEL</option>
                        </select>
                      </td>

                      {/* Fasikül */}
                      <td className="p-2 font-sans">
                        <input
                          type="text"
                          value={row.fasikul}
                          onChange={(e) => handleUpdateRow(row.id, 'fasikul', e.target.value)}
                          placeholder="Fasikül / Kitap Adı"
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                        />
                      </td>

                      {/* Birim Fiyat (TL) */}
                      <td className="p-2 text-right">
                        <input
                          type="number"
                          step="0.01"
                          value={row.birim_fiyat}
                          onChange={(e) => handleUpdateRow(row.id, 'birim_fiyat', e.target.value)}
                          placeholder="0.00"
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-emerald-600 dark:text-emerald-400 text-right"
                        />
                      </td>

                      {/* Dönem */}
                      <td className="p-2">
                        <input
                          type="text"
                          value={row.fiyat_donemi}
                          onChange={(e) => handleUpdateRow(row.id, 'fiyat_donemi', e.target.value)}
                          placeholder="2026/1"
                          className="w-full px-2 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-center font-bold"
                        />
                      </td>

                      {/* OKAS Kodu */}
                      <td className="p-2">
                        <input
                          type="text"
                          value={row.okas_kodu}
                          onChange={(e) => handleUpdateRow(row.id, 'okas_kodu', e.target.value)}
                          placeholder="45000000"
                          className="w-full px-2 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-purple-700 dark:text-purple-300"
                        />
                      </td>

                      {/* KDV */}
                      <td className="p-2">
                        <select
                          value={row.kdv_orani}
                          onChange={(e) =>
                            handleUpdateRow(row.id, 'kdv_orani', Number(e.target.value))
                          }
                          className="w-full px-1.5 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-center"
                        >
                          <option value={20}>%20</option>
                          <option value={10}>%10</option>
                          <option value={1}>%1</option>
                          <option value={0}>%0</option>
                        </select>
                      </td>

                      {/* Sil Butonu */}
                      <td className="p-2 pr-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteRow(row.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
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
      )}

      {/* SEKME 2: GITHUB RAW JSON İLE EŞİTLEME */}
      {activeTab === 'github_sync' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sol Kolon: GitHub URL ve Eşitleme Paneli */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
                  <GithubIcon size={22} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    GitHub Raw JSON Çevrimiçi Katalog Entegrasyonu
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    GitHub deponuzdaki <code className="font-bold">pozlar.json</code> dosyasını
                    güncellediğinizde kullanıcılar buradan tek tıkla verileri indirebilir.
                  </p>
                </div>
              </div>

              {/* URL Giriş Alanı */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  GitHub Raw JSON Dosya Bağlantısı (URL)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://raw.githubusercontent.com/.../pozlar.json"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  />
                  <Button
                    type="button"
                    onClick={handleFetchFromGithub}
                    disabled={isFetchingGithub || !githubUrl.trim()}
                    className="bg-purple-600 hover:bg-purple-700 text-white gap-2 text-xs py-2.5 px-4 font-bold shrink-0"
                  >
                    {isFetchingGithub ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <CloudDownload size={15} />
                    )}
                    <span>Pozları Getir</span>
                  </Button>
                </div>
                <p className="text-[11px] text-slate-400">
                  İpucu: GitHub’da oluşturduğunuz dosyanın <strong>Raw</strong> butonuna tıklayarak
                  çıkan raw.githubusercontent.com URL’sini buraya yapıştırabilirsiniz.
                </p>
              </div>

              {/* Hata Durumu */}
              {githubFetchError && (
                <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl text-xs flex items-center gap-2 text-red-700 dark:text-red-300">
                  <AlertTriangle size={16} className="shrink-0" />
                  <span>{githubFetchError}</span>
                </div>
              )}

              {/* Çekilen Veri Önizleme Kartı */}
              {githubFetchedData && (
                <div className="p-5 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                      <CheckCircle2 size={16} />
                      <span>{githubFetchedData.length} Adet Poz Başarıyla İndirildi!</span>
                    </div>

                    <Button
                      type="button"
                      onClick={handleTransferGithubToGrid}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 text-xs py-1.5 px-3 font-bold"
                    >
                      <TableIcon size={14} />
                      <span>Tabloya Aktar & İncele</span>
                    </Button>
                  </div>

                  <div className="max-h-60 overflow-y-auto divide-y divide-emerald-100 dark:divide-emerald-900/30 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-white dark:bg-slate-950 text-xs">
                    {githubFetchedData.slice(0, 50).map((p: any, i: number) => (
                      <div key={i} className="p-2.5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 text-[11px]">
                            {p.poz_no}
                          </span>
                          {p.eski_poz_no && (
                            <span className="text-[10px] text-blue-600 font-mono">
                              ({p.eski_poz_no})
                            </span>
                          )}
                          <span className="font-medium text-slate-800 dark:text-slate-200 line-clamp-1">
                            {p.kalem_adi || p.poz_tanimi}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-emerald-600 shrink-0">
                          {Number(p.birim_fiyat || 0).toLocaleString('tr-TR', {
                            minimumFractionDigits: 2
                          })}{' '}
                          TL
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sağ Kolon: Standart GitHub JSON Formatı ve Kopyalama */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-500" />
                  <span>GitHub'a Yüklenecek Standart JSON Formatı</span>
                </h3>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCopyJsonTemplate}
                  className="gap-1.5 text-xs py-1 px-2.5 h-auto text-purple-600 border-purple-200 hover:bg-purple-50"
                >
                  <Copy size={13} />
                  <span>Formatı Kopyala</span>
                </Button>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                GitHub repository'nizde (örneğin <code className="font-bold">pozlar.json</code>{' '}
                dosyasında) aşağıdaki JSON şablonunu kullanabilirsiniz. Uygulamamız bu formatı
                doğrudan tanır.
              </p>

              <pre className="p-4 bg-slate-950 text-slate-200 rounded-xl text-[11px] font-mono overflow-x-auto max-h-[380px] border border-slate-800 leading-relaxed scrollbar-thin">
                {JSON.stringify(ORNEK_GITHUB_JSON_DATA, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* SEKME 3: HIZLI METIN / TSV / JSON YAPIŞTIR */}
      {activeTab === 'raw_paste' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Excel'den veya Metin Dosyasından Kopyala-Yapıştır
              </h2>
              <p className="text-[11px] text-slate-500">
                Excel hücrelerini seçip kopyaladıktan sonra buraya (Ctrl+V) yapıştırarak tek tıkla
                tabloya dönüştürebilirsiniz.
              </p>
            </div>

            <Button
              type="button"
              onClick={handleParsePastedText}
              disabled={!pasteText.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2 text-xs py-2 px-4 font-bold"
            >
              <TableIcon size={14} />
              <span>Metni Tabloya Dönüştür</span>
            </Button>
          </div>

          <textarea
            rows={12}
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder="Excel'den kopyaladığınız satırları veya JSON dizisini buraya yapıştırın..."
            className="w-full p-4 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white leading-relaxed focus:ring-2 focus:ring-blue-500 scrollbar-thin"
          />
        </div>
      )}
    </div>
  )
}

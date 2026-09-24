import React, { useState, useEffect } from 'react'
import {
  Download,
  Upload,
  Archive,
  Lock,
  Calendar,
  CheckCircle2,
  Clock,
  Coins,
  ShieldCheck,
  AlertTriangle,
  FolderArchive
} from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'

interface DatabaseArchiveTabProps {
  archiveYear: number
  setArchiveYear: (year: number) => void
  isArchiving: boolean
  setIsArchiving: (val: boolean) => void
}

interface YearSummary {
  year: number
  totalCount: number
  completedCount: number
  activeCount: number
  totalYaklasikMaliyet: number
  totalSozlesmeBedeli: number
}

export const DatabaseArchiveTab: React.FC<DatabaseArchiveTabProps> = ({
  archiveYear,
  setArchiveYear,
  isArchiving,
  setIsArchiving
}) => {
  const [yearSummary, setYearSummary] = useState<YearSummary | null>(null)
  const [distinctYears, setDistinctYears] = useState<number[]>([])
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [deleteFromMain, setDeleteFromMain] = useState(false)
  const [onlyCompleted, setOnlyCompleted] = useState(true)
  const [isClosingYear, setIsClosingYear] = useState(false)

  const loadYearSummary = async (yr: number): Promise<void> => {
    setLoadingSummary(true)
    try {
      const res = await window.electron.ipcRenderer.invoke('db:get-year-summary', yr)
      if (res && res.success) {
        setYearSummary(res.summary)
        if (res.distinctYears && res.distinctYears.length > 0) {
          setDistinctYears(res.distinctYears)
        }
      }
    } catch (e) {
      console.error('Yıl özeti yüklenirken hata:', e)
    } finally {
      setLoadingSummary(false)
    }
  }

  useEffect(() => {
    loadYearSummary(archiveYear)
  }, [archiveYear])

  const handleCloseYear = async (): Promise<void> => {
    if (
      !window.confirm(
        `${archiveYear} bütçe yılına ait tüm dosyaların durumu 'KAPANDI' olarak işaretlenecek ve arşivleme aşamasına kilitlenecektir. Onaylıyor musunuz?`
      )
    ) {
      return
    }

    setIsClosingYear(true)
    try {
      const res = await window.electron.ipcRenderer.invoke('db:close-year-records', archiveYear)
      if (res.success) {
        alert(`Başarılı! ${res.count} adet dosya başarıyla kapatıldı ve arşivlendi.`)
        await loadYearSummary(archiveYear)
      } else {
        alert('Hata: ' + res.message)
      }
    } catch (err: any) {
      alert('Hata: ' + err.message)
    } finally {
      setIsClosingYear(false)
    }
  }

  const handleStartArchive = async (): Promise<void> => {
    const confirmMsg = deleteFromMain
      ? `DİKKAT: ${archiveYear} yılına ait dosyalar arşiv (.tmn360) dosyasına aktarılacak ve ANA ÇALIŞMA ALANINDAN KALDIRILACAKTIR.\n\nİşlemi başlatmak istiyor musunuz?`
      : `${archiveYear} yılına ait dosyalar güvenli arşiv (.tmn360) dosyası olarak dışa aktarılacaktır (Mevcut dosyalarınız korunacaktır).\n\nİşlemi başlatmak istiyor musunuz?`

    if (!window.confirm(confirmMsg)) return

    setIsArchiving(true)
    try {
      const res = await window.electron.ipcRenderer.invoke('db:archive-old-records', {
        year: archiveYear,
        deleteFromMain,
        onlyCompleted
      })
      if (res.success) {
        alert(
          `✅ Arşivleme Tamamlandı!\n\n• Arşivlenen Dosya Sayısı: ${res.count}\n• Dosya Konumu: ${res.filePath}\n• Ana Veritabanından Temizlendi mi: ${
            res.purged ? 'Evet' : 'Hayır (Yedek alındı)'
          }`
        )
        if (res.purged) {
          window.location.reload()
        } else {
          await loadYearSummary(archiveYear)
        }
      } else {
        alert('Arşivleme Hatası: ' + res.message)
      }
    } catch (e: any) {
      alert('Beklenmeyen hata: ' + e.message)
    } finally {
      setIsArchiving(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* 1. YIL BAZLI DURUM VE KAPATMA MERKEZİ */}
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Mali Yıl Sonu Kapatma & Devir Yönetimi
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Doğrudan temin ve ihale süreçlerinizin yıl sonu işlemlerini yönetin, dosyaları
              kilitleyin ve yeni mali yıla devredin.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Mali Yıl:
            </span>
            <div className="flex items-center gap-1">
              {distinctYears.map((yr) => (
                <button
                  key={yr}
                  onClick={() => setArchiveYear(yr)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                    archiveYear === yr
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {yr}
                </button>
              ))}
              <Input
                type="number"
                value={archiveYear}
                onChange={(e) =>
                  setArchiveYear(parseInt(e.target.value, 10) || new Date().getFullYear())
                }
                className="w-24 h-8 text-xs font-bold text-center bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                min={2000}
                max={2050}
              />
            </div>
          </div>
        </div>

        {/* YIL İSTATİSTİK KARTLARI */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                Toplam Dosya
              </span>
              <FolderArchive className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {loadingSummary ? '...' : yearSummary?.totalCount || 0}
            </div>
            <span className="text-[10px] text-slate-400">{archiveYear} mali yılı</span>
          </div>

          <div className="p-3.5 rounded-xl border border-emerald-200/80 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20">
            <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Tamamlanan</span>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
              {loadingSummary ? '...' : yearSummary?.completedCount || 0}
            </div>
            <span className="text-[10px] text-emerald-600/70">Kapatmaya & arşive hazır</span>
          </div>

          <div className="p-3.5 rounded-xl border border-amber-200/80 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20">
            <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Devam Eden</span>
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-xl font-bold text-amber-700 dark:text-amber-300">
              {loadingSummary ? '...' : yearSummary?.activeCount || 0}
            </div>
            <span className="text-[10px] text-amber-600/70">Açık süreçler</span>
          </div>

          <div className="p-3.5 rounded-xl border border-purple-200/80 dark:border-purple-900/40 bg-purple-50/40 dark:bg-purple-950/20">
            <div className="flex items-center justify-between text-purple-600 dark:text-purple-400 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                Toplam Harcama
              </span>
              <Coins className="w-4 h-4" />
            </div>
            <div className="text-base font-bold text-purple-700 dark:text-purple-300 truncate">
              {loadingSummary
                ? '...'
                : (
                    yearSummary?.totalSozlesmeBedeli ||
                    yearSummary?.totalYaklasikMaliyet ||
                    0
                  ).toLocaleString('tr-TR', {
                    style: 'currency',
                    currency: 'TRY',
                    maximumFractionDigits: 0
                  })}
            </div>
            <span className="text-[10px] text-purple-600/70">Yıllık gerçekleşme</span>
          </div>
        </div>

        {/* YIL SONU KAPATMA / KİLİTLEME PANELİ */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {archiveYear} Yılı Dosyalarını Toplu Kapat & Kilitle
              </h3>
            </div>
            <p className="text-xs text-slate-500 max-w-xl">
              Ödemesi ve kabulü tamamlanmış dosyaların durumunu resmi olarak <b>KAPANDI</b> yapar.
              Bu sayede yıl sonu Sayıştay denetimleri ve kesin hesap raporları için evraklar
              sabitlenir.
            </p>
          </div>

          <Button
            onClick={handleCloseYear}
            disabled={isClosingYear || loadingSummary}
            className="bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white shrink-0 text-xs px-4 py-2"
          >
            {isClosingYear ? 'Kapatılıyor...' : `${archiveYear} Yılını Kapat`}
          </Button>
        </div>
      </div>

      {/* 2. ARŞİV PAKETİ OLUŞTURMA (.tmn360 / .dtz) */}
      <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Archive className="w-5 h-5 text-amber-600" />
              Doğrudan Temin & İhale Arşivi Oluştur
            </h2>
            <p className="text-xs text-slate-500">
              Belirlediğiniz mali yıla ait dosyaları bağımsız ve taşınabilir bir <b>.tmn360</b>{' '}
              arşiv paketine dönüştürür.
            </p>
          </div>
        </div>

        <div className="p-5 bg-gradient-to-br from-amber-500/5 via-slate-50 to-blue-500/5 dark:from-amber-950/20 dark:via-slate-900 dark:to-blue-950/20 rounded-2xl border border-amber-200/60 dark:border-amber-900/40 space-y-4">
          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyCompleted}
                onChange={(e) => setOnlyCompleted(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Yalnızca tamamlanmış / kapanmış dosyaları arşivle (Önerilen)
                </span>
                <p className="text-[11px] text-slate-500">
                  Devam eden veya henüz onay aşamasındaki açık dosyaları ana ekranda tutar, sadece
                  işlemi bitenleri arşive dahil eder.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={deleteFromMain}
                onChange={(e) => setDeleteFromMain(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
              />
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 inline" />
                  Arşivlendikten sonra ana veritabanından kaldır (Veritabanını hafiflet)
                </span>
                <p className="text-[11px] text-slate-500">
                  İşaretlenirse, arşivlenen dosyalar mevcut çalışma alanınızdan silinerek sistem
                  hızlandırılır. İstediğiniz zaman oluşturulan <b>.tmn360</b> dosyasını açıp eski
                  verilere ulaşabilirsiniz.
                </p>
              </div>
            </label>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>
                Arşiv paketi tüm kalemleri, firmaları, teklifleri ve şablon verilerini eksiksiz
                barındırır.
              </span>
            </div>

            <Button
              onClick={handleStartArchive}
              disabled={isArchiving || yearSummary?.totalCount === 0}
              className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl px-5 py-2.5 text-xs font-bold shadow-sm"
            >
              {isArchiving
                ? 'Arşiv Paketi Hazırlanıyor...'
                : `${archiveYear} Yılı Arşivini Oluştur (.tmn360)`}
            </Button>
          </div>
        </div>
      </div>

      {/* 3. VERİTABANI YEDEKLEME / GERİ YÜKLEME (.sqlite) */}
      <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Tam Veritabanı Yedekleme & Geri Yükleme
            </h2>
            <p className="text-xs text-slate-500">
              Mevcut kurumunuza ait tüm tabloları ve ayarları içeren ham SQLite yedeği alın.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50 dark:bg-slate-900/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                <Download className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                Ham Veritabanını Dışa Aktar (.sqlite)
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 h-9">
              Tüm kalemlerinizi, dosyalarınızı, birimlerinizi ve komisyon bilgilerinizi tam
              yedekleyin.
            </p>
            <Button
              onClick={async () => {
                try {
                  const res = await window.electron.ipcRenderer.invoke('db:export-sqlite')
                  if (res.success) {
                    alert('Veritabanı başarıyla dışa aktarıldı.')
                  } else if (res.error && res.error !== 'İptal edildi') {
                    alert('Dışa aktarma hatası: ' + res.error)
                  }
                } catch (e: any) {
                  alert('Hata: ' + e.message)
                }
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs"
            >
              Yedek Dışa Aktar
            </Button>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50 dark:bg-slate-900/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-emerald-100 dark:bg-emerald-900/50 p-2 rounded-lg text-emerald-600 dark:text-emerald-400">
                <Upload className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                Veritabanı Yedeğini Geri Yükle
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 h-9">
              Daha önce aldığınız bir .sqlite yedeğini geri yükleyin. Mevcut verilerin üzerine
              yazılır.
            </p>
            <Button
              onClick={async () => {
                if (
                  !window.confirm(
                    'DİKKAT: Bu işlem mevcut veritabanınızın üzerine yazacaktır. Devam etmek istiyor musunuz?'
                  )
                ) {
                  return
                }
                try {
                  const res = await window.electron.ipcRenderer.invoke('db:import-sqlite')
                  if (res.success) {
                    alert(
                      'Veritabanı başarıyla içe aktarıldı. Değişikliklerin etkili olması için sayfa yenilenecektir.'
                    )
                    window.location.reload()
                  } else if (res.error && res.error !== 'İptal edildi') {
                    alert('İçe aktarma hatası: ' + res.error)
                  }
                } catch (e: any) {
                  alert('Hata: ' + e.message)
                }
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
            >
              Yedekten Geri Yükle
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

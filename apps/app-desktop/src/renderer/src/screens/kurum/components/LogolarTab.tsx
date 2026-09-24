import React, { useState, useEffect } from 'react'
import {
  ImageIcon,
  Info,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Search
} from 'lucide-react'
import { Input } from '../../../components/ui/Input'
import { DetsisSearchModal } from '../../../components/ui/DetsisSearchModal'
import { DetsisVerificationState } from '../../../components/ui/DetsisBadge'
import { optimizeImageFile } from '../../../utils/imageOptimizer'

interface LogoUploadCardProps {
  title: string
  description: string
  value: string | null
  onChange: (val: string | null) => void
  recommendedSize: string
  maxDimension?: number
  showToggle?: boolean
  toggleChecked?: boolean
  onToggleChange?: (checked: boolean) => void
  toggleLabel?: string
  onError?: (msg: string) => void
  onSuccess?: (msg: string) => void
}

export function LogoUploadCard({
  title,
  description,
  value,
  onChange,
  recommendedSize,
  maxDimension = 1024,
  showToggle = false,
  toggleChecked = false,
  onToggleChange,
  toggleLabel = '',
  onError,
  onSuccess
}: LogoUploadCardProps): React.ReactElement {
  const [loading, setLoading] = useState(false)

  const handleFile = async (file: File | undefined): Promise<void> => {
    if (!file) return

    if (file.size > 20 * 1024 * 1024) {
      onError?.('Dosya boyutu çok yüksek! Lütfen 20 MB altı bir görsel seçin.')
      return
    }

    setLoading(true)
    try {
      const optimizedBase64 = await optimizeImageFile(file, maxDimension)
      onChange(optimizedBase64)
      onSuccess?.(`${title} başarıyla optimize edilip yüklendi.`)
    } catch {
      onError?.('Görsel işlenirken bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 bg-slate-50/50 dark:bg-slate-950/20 flex flex-col gap-4 shadow-sm">
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-0.5">
          {title}
        </label>
        <p className="text-[10px] text-slate-450 dark:text-slate-500 leading-normal">
          {description}
        </p>
      </div>

      <label className="group relative flex flex-col items-center justify-center w-full h-36 bg-white dark:bg-slate-950 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden cursor-pointer hover:border-blue-400 dark:hover:border-blue-700 transition-all duration-200 shadow-inner">
        {loading ? (
          <div className="flex flex-col items-center gap-2 text-blue-500">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-[10px] font-medium">Optimize ediliyor...</span>
          </div>
        ) : value ? (
          <>
            <img src={value} alt={title} className="w-full h-full object-contain p-3" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
              <Upload className="w-5 h-5 text-white" />
              <span className="text-white text-[10px] font-semibold">Değiştir</span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-400 dark:text-slate-600">
            <ImageIcon className="w-8 h-8" />
            <span className="text-[10px] font-medium text-center leading-tight px-2">
              Logo seçmek için
              <br />
              tıklayın
            </span>
            <span className="text-[9px] text-slate-350 dark:text-slate-700">
              PNG, JPG, SVG, WebP · Otomatik Optimize
            </span>
          </div>
        )}
        <input
          type="file"
          accept="image/png,image/jpeg,image/svg+xml,image/webp"
          className="hidden"
          disabled={loading}
          onChange={(e) => {
            handleFile(e.target.files?.[0])
            e.target.value = ''
          }}
        />
      </label>

      <div className="flex flex-col gap-3">
        <Input
          value={value?.startsWith('http') ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Veya web URL'si yapıştırın (https://...)"
          className="text-xs bg-slate-55 dark:bg-slate-955 border-slate-200 dark:border-slate-800"
        />
        <div className="flex items-center justify-between">
          <span className="text-[9px] text-slate-400 dark:text-slate-600 font-mono">
            Önerilen: {recommendedSize}
          </span>
          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="flex items-center gap-1 py-1 px-2 border border-red-200 dark:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
            >
              <X className="w-3 h-3" />
              Kaldır
            </button>
          )}
        </div>

        {showToggle && onToggleChange && (
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
            <input
              id={`toggle-${title}`}
              type="checkbox"
              checked={toggleChecked}
              onChange={(e) => onToggleChange(e.target.checked)}
              className="rounded border-slate-300 dark:border-slate-800 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
            />
            <label
              htmlFor={`toggle-${title}`}
              className="text-[10px] font-medium text-slate-600 dark:text-slate-400 cursor-pointer select-none"
            >
              {toggleLabel}
            </label>
          </div>
        )}
      </div>
    </div>
  )
}

interface LogolarTabProps {
  institutionLogo: string | null
  setInstitutionLogo: (logo: string | null) => void
  logoLeft: string | null
  setLogoLeft: (logo: string | null) => void
  logoRight: string | null
  setLogoRight: (logo: string | null) => void
  showLogoLeft: boolean
  setShowLogoLeft: (val: boolean) => void
  showLogoRight: boolean
  setShowLogoRight: (val: boolean) => void
  detsisKodu?: string
}

export function LogolarTab(props: LogolarTabProps): React.ReactElement {
  const {
    institutionLogo,
    setInstitutionLogo,
    logoLeft,
    setLogoLeft,
    logoRight,
    setLogoRight,
    showLogoLeft,
    setShowLogoLeft,
    showLogoRight,
    setShowLogoRight,
    detsisKodu
  } = props

  const [notification, setNotification] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)
  const [detsisLogo, setDetsisLogo] = useState<string | null>(null)
  const [loadingDetsisLogo, setLoadingDetsisLogo] = useState(false)

  const showToast = (type: 'success' | 'error', message: string): void => {
    setNotification({ type, message })
    setTimeout(() => {
      setNotification(null)
    }, 4000)
  }

  // DETSİS önbelleğinden veya API'den logo çek
  useEffect(() => {
    const cleanNo = (detsisKodu || '').trim().replace(/[^0-9]/g, '')
    if (!cleanNo || !window.electron?.ipcRenderer) return

    let isMounted = true
    window.electron.ipcRenderer
      .invoke('network:get-detsis-cache', cleanNo)
      .then((res: any) => {
        if (isMounted && res?.logoByteArray) {
          setDetsisLogo(res.logoByteArray)
        }
      })
      .catch(() => {})

    return () => {
      isMounted = false
    }
  }, [detsisKodu])

  const handleFetchDetsisLogo = async (): Promise<void> => {
    const cleanNo = (detsisKodu || '').trim().replace(/[^0-9]/g, '')
    if (!cleanNo || !window.electron?.ipcRenderer) {
      showToast('error', 'Önce DETSİS Kodu girilmelidir (Mali & Birim sekmesi).')
      return
    }
    setLoadingDetsisLogo(true)
    try {
      const res = await window.electron.ipcRenderer.invoke('network:verify-detsis', {
        detsisNo: cleanNo,
        force: true
      })
      if (res?.logoByteArray) {
        setDetsisLogo(res.logoByteArray)
        setInstitutionLogo(res.logoByteArray)
        setLogoLeft(res.logoByteArray)
        showToast('success', 'DETSİS Resmi Logosu başarıyla çekildi ve uygulandı!')
      } else {
        showToast('error', 'Bu DETSİS numarasına ait resmi logo bulunamadı.')
      }
    } catch {
      showToast('error', 'DETSİS logosu sorgulanırken hata oluştu.')
    } finally {
      setLoadingDetsisLogo(false)
    }
  }

  const [isDetsisModalOpen, setIsDetsisModalOpen] = useState(false)

  const handleDetsisSelect = (detsisInfo: DetsisVerificationState): void => {
    if (detsisInfo.logoByteArray) {
      setDetsisLogo(detsisInfo.logoByteArray)
      setInstitutionLogo(detsisInfo.logoByteArray)
      setLogoLeft(detsisInfo.logoByteArray)
      showToast(
        'success',
        `${detsisInfo.birimAdi || 'Kurum'} resmi logosu başarıyla çekildi ve uygulandı!`
      )
    } else {
      showToast('error', 'Seçilen kurumun DETSİS kaydında resmi logo amblemi bulunamadı.')
    }
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">
          Kurum Logoları
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Uygulama arayüzünde ve belge çıktılarında kullanılacak logoları buradan
          ayarlayabilirsiniz.
        </p>
      </div>

      {notification && (
        <div
          className={`flex items-center gap-2 p-3 rounded-xl text-xs font-semibold animate-in fade-in duration-200 ${
            notification.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* DETSİS Hızlı Logo Aktarma Kartı */}
      <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          {detsisLogo ? (
            <img
              src={detsisLogo}
              alt="DETSİS Logo"
              className="w-10 h-10 object-contain rounded-xl bg-white p-1 border border-emerald-200 dark:border-emerald-700 shadow-xs"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
              <ImageIcon className="w-5 h-5" />
            </div>
          )}
          <div>
            <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
              <span>DETSİS Resmi Kurum Logosu</span>
              {detsisKodu && (
                <span className="text-[10px] font-normal text-emerald-700 dark:text-emerald-400 font-mono">
                  ({detsisKodu})
                </span>
              )}
            </h4>
            <p className="text-[10px] text-emerald-700/90 dark:text-emerald-400/90">
              DETSİS sistemindeki resmi kurum armasını arayıp tek tıkla çekip logo alanlarına
              uygulayabilirsiniz.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {detsisKodu && (
            <button
              type="button"
              onClick={handleFetchDetsisLogo}
              disabled={loadingDetsisLogo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {loadingDetsisLogo ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              <span>DETSİS&apos;ten Çek</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsDetsisModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>DETSİS&apos;te Ara & Getir</span>
          </button>
        </div>
      </div>

      <DetsisSearchModal
        isOpen={isDetsisModalOpen}
        onClose={() => setIsDetsisModalOpen(false)}
        onSelect={handleDetsisSelect}
        title="DETSİS'te Kurum Logosu Ara & Uygula"
      />

      <div className="flex items-start gap-2 p-3 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-xl text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <span>
          <strong>Akıllı Görsel Optimizasyonu:</strong> Yüklediğiniz logolar otomatik olarak en iyi
          çözünürlük ve kalitede sıkıştırılır. Uygulama Logosu için <strong>256×256 px</strong>,
          Belge logoları için <strong>300×150 px</strong> tavsiye edilir. (Maksimum 20 MB).
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <LogoUploadCard
          title="Uygulama Logosu"
          description="Giriş/Kilit ekranı ve sol menüde gösterilen genel logo."
          value={institutionLogo}
          onChange={setInstitutionLogo}
          recommendedSize="256×256 px"
          maxDimension={1024}
          onError={(msg) => showToast('error', msg)}
          onSuccess={(msg) => showToast('success', msg)}
        />

        <LogoUploadCard
          title="Sol Logo (Kurum)"
          description="Resmi belgelerin sol üstünde yer alacak kurum logosu."
          value={logoLeft}
          onChange={setLogoLeft}
          recommendedSize="300×150 px"
          maxDimension={800}
          showToggle
          toggleChecked={showLogoLeft}
          onToggleChange={setShowLogoLeft}
          toggleLabel="Belgelerde Sol Logoyu Göster"
          onError={(msg) => showToast('error', msg)}
          onSuccess={(msg) => showToast('success', msg)}
        />

        <LogoUploadCard
          title="Sağ Logo (Bakanlık)"
          description="Resmi belgelerin sağ üstünde yer alacak logo."
          value={logoRight}
          onChange={setLogoRight}
          recommendedSize="300×150 px"
          maxDimension={800}
          showToggle
          toggleChecked={showLogoRight}
          onToggleChange={setShowLogoRight}
          toggleLabel="Belgelerde Sağ Logoyu Göster"
          onError={(msg) => showToast('error', msg)}
          onSuccess={(msg) => showToast('success', msg)}
        />
      </div>
    </div>
  )
}

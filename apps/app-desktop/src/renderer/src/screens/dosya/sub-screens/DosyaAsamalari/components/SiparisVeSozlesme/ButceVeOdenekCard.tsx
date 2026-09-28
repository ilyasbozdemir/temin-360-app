import React, { useState, useEffect } from 'react'
import {
  Coins,
  ReceiptText,
  Save,
  CheckCircle2,
  Sparkles,
  Calendar,
  Layers,
  Plus,
  Trash2,
  Settings2,
  RotateCcw,
  X
} from 'lucide-react'
import { cn } from '@renderer/utils/cn'

export interface ButceVeOdenekData {
  odenekTertibi: string
  kullanilabilirOdenek: string
  butceYili: string
  odenekKalemi: string
  butceGerekce: string
}

export interface OdenekTertipItem {
  id?: string
  kod: string
  ad: string
  isCustom?: boolean
}

interface ButceVeOdenekCardProps {
  activeDosyaId?: number | null
  onOpenButceSorgusu?: () => void
  onSaved?: () => void
  className?: string
}

export const DEFAULT_ODENEK_TERTIPLERI: OdenekTertipItem[] = [
  { kod: '03.2.1.01', ad: 'Kırtasiye ve Büro Malzemesi Alımları' },
  { kod: '03.2.1.02', ad: 'Büro Mefruşatı ve Donanım Alımları' },
  { kod: '03.2.1.05', ad: 'Baskı ve Cilt Giderleri' },
  { kod: '03.2.2.01', ad: 'Su ve Temizlik Malzemesi Alımları' },
  { kod: '03.2.3.01', ad: 'Akaryakıt ve Yağ Alımları' },
  { kod: '03.2.3.02', ad: 'Elektrik Alımları' },
  { kod: '03.5.2.01', ad: 'Hizmet Binası Bakım ve Onarım Giderleri' },
  { kod: '03.5.2.02', ad: 'Taşıt ve İş Makinesi Bakım Onarımı' },
  { kod: '03.5.2.90', ad: 'Diğer Bakım ve Onarım Giderleri' },
  { kod: '03.7.1.01', ad: 'Büro ve İşyeri Mal ve Malzeme Alımları' },
  { kod: '03.7.2.01', ad: 'Bilgisayar ve Yazılım Alımları' }
]

const LOCAL_STORAGE_KEY = 'temin360_butce_tertipleri_presets_v1'

export function ButceVeOdenekCard({
  activeDosyaId,
  onOpenButceSorgusu,
  onSaved,
  className
}: ButceVeOdenekCardProps): React.JSX.Element {
  const currentYear = String(new Date().getFullYear())

  const [formData, setFormData] = useState<ButceVeOdenekData>({
    odenekTertibi: '',
    kullanilabilirOdenek: '',
    butceYili: currentYear,
    odenekKalemi: '',
    butceGerekce: ''
  })

  // Dynamic presets state
  const [presets, setPresets] = useState<OdenekTertipItem[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
        }
      }
    } catch (e) {
      console.error('Failed to parse budget presets:', e)
    }
    return DEFAULT_ODENEK_TERTIPLERI
  })

  const [isManagingPresets, setIsManagingPresets] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newKod, setNewKod] = useState('')
  const [newAd, setNewAd] = useState('')

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)

  // Save presets to localStorage
  const savePresetsToStorage = (updatedList: OdenekTertipItem[]) => {
    setPresets(updatedList)
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedList))
    } catch (e) {
      console.error('Failed to save budget presets to storage:', e)
    }
  }

  // Add new custom preset
  const handleAddPreset = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const trimmedKod = newKod.trim()
    const trimmedAd = newAd.trim()
    if (!trimmedKod) return

    const exists = presets.some((p) => p.kod.toLowerCase() === trimmedKod.toLowerCase())
    if (exists) {
      alert('Bu bütçe tertibi kodu listede zaten mevcut!')
      return
    }

    const newItem: OdenekTertipItem = {
      kod: trimmedKod,
      ad: trimmedAd || 'Genel Tertip',
      isCustom: true
    }

    const updated = [...presets, newItem]
    savePresetsToStorage(updated)
    setNewKod('')
    setNewAd('')
    setShowAddForm(false)
  }

  // Add currently typed values to presets
  const handleSaveCurrentAsPreset = () => {
    const trimmedKod = formData.odenekTertibi.trim()
    const trimmedAd = formData.odenekKalemi.trim()
    if (!trimmedKod) return

    const exists = presets.some((p) => p.kod.toLowerCase() === trimmedKod.toLowerCase())
    if (exists) {
      alert('Bu bütçe tertibi zaten kayıtlı.')
      return
    }

    const newItem: OdenekTertipItem = {
      kod: trimmedKod,
      ad: trimmedAd || 'Özel Tertip',
      isCustom: true
    }

    savePresetsToStorage([...presets, newItem])
  }

  // Delete a preset
  const handleDeletePreset = (kodToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const updated = presets.filter((p) => p.kod !== kodToDelete)
    savePresetsToStorage(updated)
  }

  // Reset to defaults
  const handleResetPresets = () => {
    if (confirm('Bütçe tertipleri listesini varsayılan fabrika ayarlarına sıfırlamak istiyor musunuz?')) {
      savePresetsToStorage(DEFAULT_ODENEK_TERTIPLERI)
    }
  }

  // Load existing budget details for the file
  useEffect(() => {
    if (!activeDosyaId) return

    let isMounted = true
    setLoading(true)

    window.electron.ipcRenderer
      .invoke(
        'db:query',
        'SELECT odenek_tertibi, kullanilabilir_odenek, butce_yili, odenek_kalemi, butce_gerekce FROM DATA_TeminDosyasi WHERE id = ?',
        [activeDosyaId]
      )
      .then((res: any) => {
        if (isMounted && res?.success && res.data && res.data[0]) {
          const row = res.data[0]
          setFormData({
            odenekTertibi: row.odenek_tertibi || '',
            kullanilabilirOdenek: row.kullanilabilir_odenek || '',
            butceYili: row.butce_yili || currentYear,
            odenekKalemi: row.odenek_kalemi || '',
            butceGerekce: row.butce_gerekce || ''
          })
        }
      })
      .catch((err: any) => {
        console.error('Failed to load budget details for file:', err)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [activeDosyaId, currentYear])

  const handleSave = async (): Promise<void> => {
    if (!activeDosyaId) return

    setSaving(true)
    try {
      await window.electron.ipcRenderer.invoke(
        'db:run',
        `UPDATE DATA_TeminDosyasi 
         SET odenek_tertibi = ?, 
             kullanilabilir_odenek = ?, 
             butce_yili = ?, 
             odenek_kalemi = ?, 
             butce_gerekce = ?,
             updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [
          formData.odenekTertibi,
          formData.kullanilabilirOdenek,
          formData.butceYili,
          formData.odenekKalemi,
          formData.butceGerekce,
          activeDosyaId
        ]
      )

      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 3000)
      onSaved?.()
    } catch (err) {
      console.error('Error saving budget details:', err)
      alert('Bütçe bilgileri kaydedilirken bir hata oluştu: ' + err)
    } finally {
      setSaving(false)
    }
  }

  const handleSelectPreset = (preset: OdenekTertipItem): void => {
    setFormData((prev) => ({
      ...prev,
      odenekTertibi: preset.kod,
      odenekKalemi: prev.odenekKalemi ? prev.odenekKalemi : preset.ad
    }))
  }

  const isCurrentInPresets =
    Boolean(formData.odenekTertibi.trim()) &&
    presets.some((p) => p.kod.toLowerCase() === formData.odenekTertibi.trim().toLowerCase())

  return (
    <div
      className={cn(
        'p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col gap-4',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold shadow-xs">
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100 flex items-center gap-1.5">
              Ödenek Tertibi & Bütçe Bilgileri
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-extrabold border border-amber-200 dark:border-amber-800/60">
                Şablon & Rapor Entegre
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Bu alandaki ödenek ve tertip bilgileri Bütçe Sorgusu ve Onay Belgelerine otomatik
              aktarılır.
            </p>
          </div>
        </div>

        {onOpenButceSorgusu && (
          <button
            type="button"
            onClick={onOpenButceSorgusu}
            className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100/80 dark:bg-amber-950/30 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            title="Bütçe Sorgusu Belgesini Önizle & Yazdır"
          >
            <ReceiptText className="w-3.5 h-3.5" />
            <span>Bütçe Sorgusu Yazdır</span>
          </button>
        )}
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 text-xs">
        {/* Bütçe Yılı */}
        <div className="md:col-span-3 flex flex-col gap-1">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            Bütçe Yılı
          </label>
          <input
            type="text"
            value={formData.butceYili}
            onChange={(e) => setFormData((prev) => ({ ...prev, butceYili: e.target.value }))}
            placeholder="2026"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {/* Ödenek Tertibi / Kodu */}
        <div className="md:col-span-4 flex flex-col gap-1">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
            <Layers className="w-3 h-3 text-slate-400" />
            Ödenek Tertibi / Bütçe Kodu
          </label>
          <input
            type="text"
            value={formData.odenekTertibi}
            onChange={(e) => setFormData((prev) => ({ ...prev, odenekTertibi: e.target.value }))}
            placeholder="Örn: 03.2.1.01 veya tam tertip"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {/* Kullanılabilir Ödenek */}
        <div className="md:col-span-5 flex flex-col gap-1">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
            <Coins className="w-3 h-3 text-amber-500" />
            Kullanılabilir Ödenek Miktarı (TL)
          </label>
          <input
            type="text"
            value={formData.kullanilabilirOdenek}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, kullanilabilirOdenek: e.target.value }))
            }
            placeholder="Örn: 150.000,00 TL veya Yeterli Ödenek Mevcuttur"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {/* Ödenek Kalemi Adı / Açıklaması */}
        <div className="md:col-span-7 flex flex-col gap-1">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
            Ödenek Kalemi / Alım Niteliği Açıklaması
          </label>
          <input
            type="text"
            value={formData.odenekKalemi}
            onChange={(e) => setFormData((prev) => ({ ...prev, odenekKalemi: e.target.value }))}
            placeholder="Örn: Kırtasiye ve Büro Malzemesi Alımları"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {/* Gerekçe Notu */}
        <div className="md:col-span-5 flex flex-col gap-1">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
            Bütçe / İhtiyaç Notu (Opsiyonel)
          </label>
          <input
            type="text"
            value={formData.butceGerekce}
            onChange={(e) => setFormData((prev) => ({ ...prev, butceGerekce: e.target.value }))}
            placeholder="Örn: 2026 yılı 1. dönem planlı ihtiyaç alımı"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Sık Kullanılan Bütçe Kodları Presets & Yönetim */}
      <div className="flex flex-col gap-2 pt-1">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Kayıtlı Tertip & Bütçe Kodları ({presets.length}):
          </span>

          <div className="flex items-center gap-1.5">
            {/* Save current input as preset if not already present */}
            {formData.odenekTertibi.trim() && !isCurrentInPresets && (
              <button
                type="button"
                onClick={handleSaveCurrentAsPreset}
                className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/60 flex items-center gap-1 transition-all cursor-pointer"
                title="Şu an yazılı olan tertip kodunu sık kullanılanlara ekle"
              >
                <Plus className="w-2.5 h-2.5" />
                Mevcut Tertibi Listeye Ekle
              </button>
            )}

            {/* Toggle Add Form */}
            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className={cn(
                'px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer flex items-center gap-1',
                showAddForm
                  ? 'bg-amber-500 text-white border-amber-600'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-400'
              )}
            >
              <Plus className="w-2.5 h-2.5" />
              Yeni Tertip Tanımla
            </button>

            {/* Toggle Manage Mode */}
            <button
              type="button"
              onClick={() => setIsManagingPresets(!isManagingPresets)}
              className={cn(
                'px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer flex items-center gap-1',
                isManagingPresets
                  ? 'bg-red-500 text-white border-red-600'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400'
              )}
              title="Tertipleri sil veya düzenle"
            >
              <Settings2 className="w-2.5 h-2.5" />
              {isManagingPresets ? 'Düzenlemeyi Bitir' : 'Tertipleri Yönet'}
            </button>

            {/* Reset to defaults */}
            {isManagingPresets && (
              <button
                type="button"
                onClick={handleResetPresets}
                className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-1 transition-all cursor-pointer"
                title="Varsayılan tertip listesine sıfırla"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                Sıfırla
              </button>
            )}
          </div>
        </div>

        {/* Inline Add Preset Form */}
        {showAddForm && (
          <form
            onSubmit={handleAddPreset}
            className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/60 flex items-center gap-2 flex-wrap text-xs animate-in fade-in"
          >
            <input
              type="text"
              value={newKod}
              onChange={(e) => setNewKod(e.target.value)}
              placeholder="Tertip Kodu (Örn: 03.2.1.09 veya Kurum Tertibi)"
              className="flex-1 min-w-[150px] px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs"
              autoFocus
            />
            <input
              type="text"
              value={newAd}
              onChange={(e) => setNewAd(e.target.value)}
              placeholder="Açıklama / Kalem Adı (Örn: Özel Güvenlik Hizmeti Alımı)"
              className="flex-2 min-w-[200px] px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs"
            />
            <button
              type="submit"
              disabled={!newKod.trim()}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs disabled:opacity-50 cursor-pointer shadow-xs"
            >
              Listeye Ekle
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {/* Presets Badges */}
        <div className="flex flex-wrap gap-1.5">
          {presets.map((preset) => {
            const isSelected = formData.odenekTertibi === preset.kod
            return (
              <div
                key={preset.kod}
                className={cn(
                  'group relative flex items-center rounded-lg text-[11px] font-medium border transition-all',
                  isSelected
                    ? 'bg-amber-100 dark:bg-amber-950/80 border-amber-400 text-amber-900 dark:text-amber-200 font-bold shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-amber-300 dark:hover:border-amber-700'
                )}
              >
                <button
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className="px-2 py-1 text-left cursor-pointer flex items-center gap-1"
                >
                  <span className="font-bold">{preset.kod}</span>
                  {preset.ad && <span className="opacity-80">- {preset.ad}</span>}
                </button>

                {/* Delete button (visible when managing or on hover) */}
                {isManagingPresets && (
                  <button
                    type="button"
                    onClick={(e) => handleDeletePreset(preset.kod, e)}
                    className="pr-1.5 pl-0.5 text-red-500 hover:text-red-700 cursor-pointer"
                    title={`"${preset.kod}" tertibini sil`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between flex-wrap gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          {savedSuccess && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              Ödenek tertibi ve bütçe bilgileri başarıyla kaydedildi!
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || loading}
          className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-amber-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
          {saving ? 'Kaydediliyor...' : 'Bütçe & Ödenek Bilgilerini Kaydet'}
        </button>
      </div>
    </div>
  )
}


import React, { useState, useEffect } from 'react'
import {
  Coins,
  ReceiptText,
  Save,
  CheckCircle2,
  Sparkles,
  Calendar,
  Layers,
  HelpCircle
} from 'lucide-react'
import { cn } from '@renderer/utils/cn'

export interface ButceVeOdenekData {
  odenekTertibi: string
  kullanilabilirOdenek: string
  butceYili: string
  odenekKalemi: string
  butceGerekce: string
}

interface ButceVeOdenekCardProps {
  activeDosyaId?: number | null
  onOpenButceSorgusu?: () => void
  onSaved?: () => void
  className?: string
}

export const POPULER_ODENEK_TERTIPLERI = [
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

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)

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

  const handleSelectPreset = (preset: { kod: string; ad: string }): void => {
    setFormData((prev) => ({
      ...prev,
      odenekTertibi: preset.kod,
      odenekKalemi: prev.odenekKalemi ? prev.odenekKalemi : preset.ad
    }))
  }

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
            placeholder="Örn: 150.000,00 TL"
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

      {/* Sık Kullanılan Bütçe Kodları Presets */}
      <div className="flex flex-col gap-1.5 pt-1">
        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider">
          <Sparkles className="w-3 h-3 text-amber-500" />
          Hızlı Seçim Tertipleri (Ekonomik Kodlar):
        </span>
        <div className="flex flex-wrap gap-1.5">
          {POPULER_ODENEK_TERTIPLERI.map((preset) => (
            <button
              key={preset.kod}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className={cn(
                'px-2 py-1 rounded-lg text-[11px] font-medium border transition-all cursor-pointer',
                formData.odenekTertibi === preset.kod
                  ? 'bg-amber-100 dark:bg-amber-950/80 border-amber-400 text-amber-900 dark:text-amber-200 font-bold shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-amber-300 dark:hover:border-amber-700'
              )}
            >
              <span className="font-bold">{preset.kod}</span> - {preset.ad}
            </button>
          ))}
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
